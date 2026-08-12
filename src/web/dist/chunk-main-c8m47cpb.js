import {
  __export
} from "./chunk-main-g8wf8be2.js";

// node_modules/shiki/dist/chunk-D1SwGrFN.mjs
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __exportAll = (all, no_symbols) => {
  let target = {};
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true
    });
  if (!no_symbols)
    __defProp(target, Symbol.toStringTag, { value: "Module" });
  return target;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function")
    for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key;i < n; i++) {
      key = keys[i];
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: ((k) => from[k]).bind(null, key),
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
    }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));

// node_modules/@shikijs/types/dist/index.mjs
var ShikiError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "ShikiError";
  }
};

// node_modules/@shikijs/vscode-textmate/dist/index.js
function clone(something) {
  return doClone(something);
}
function doClone(something) {
  if (Array.isArray(something)) {
    return cloneArray(something);
  }
  if (something instanceof RegExp) {
    return something;
  }
  if (typeof something === "object") {
    return cloneObj(something);
  }
  return something;
}
function cloneArray(arr) {
  let r = [];
  for (let i = 0, len = arr.length;i < len; i++) {
    r[i] = doClone(arr[i]);
  }
  return r;
}
function cloneObj(obj) {
  let r = {};
  for (let key in obj) {
    r[key] = doClone(obj[key]);
  }
  return r;
}
function mergeObjects(target, ...sources) {
  sources.forEach((source) => {
    for (let key in source) {
      target[key] = source[key];
    }
  });
  return target;
}
function basename(path) {
  const idx = ~path.lastIndexOf("/") || ~path.lastIndexOf("\\");
  if (idx === 0) {
    return path;
  } else if (~idx === path.length - 1) {
    return basename(path.substring(0, path.length - 1));
  } else {
    return path.substr(~idx + 1);
  }
}
var CAPTURING_REGEX_SOURCE = /\$(\d+)|\${(\d+):\/(downcase|upcase)}/g;
var RegexSource = class {
  static hasCaptures(regexSource) {
    if (regexSource === null) {
      return false;
    }
    CAPTURING_REGEX_SOURCE.lastIndex = 0;
    return CAPTURING_REGEX_SOURCE.test(regexSource);
  }
  static replaceCaptures(regexSource, captureSource, captureIndices) {
    return regexSource.replace(CAPTURING_REGEX_SOURCE, (match, index, commandIndex, command) => {
      let capture = captureIndices[parseInt(index || commandIndex, 10)];
      if (capture) {
        let result = captureSource.substring(capture.start, capture.end);
        while (result[0] === ".") {
          result = result.substring(1);
        }
        switch (command) {
          case "downcase":
            return result.toLowerCase();
          case "upcase":
            return result.toUpperCase();
          default:
            return result;
        }
      } else {
        return match;
      }
    });
  }
};
function strcmp(a, b) {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}
function strArrCmp(a, b) {
  if (a === null && b === null) {
    return 0;
  }
  if (!a) {
    return -1;
  }
  if (!b) {
    return 1;
  }
  let len1 = a.length;
  let len2 = b.length;
  if (len1 === len2) {
    for (let i = 0;i < len1; i++) {
      let res = strcmp(a[i], b[i]);
      if (res !== 0) {
        return res;
      }
    }
    return 0;
  }
  return len1 - len2;
}
function isValidHexColor(hex) {
  if (/^#[0-9a-f]{6}$/i.test(hex)) {
    return true;
  }
  if (/^#[0-9a-f]{8}$/i.test(hex)) {
    return true;
  }
  if (/^#[0-9a-f]{3}$/i.test(hex)) {
    return true;
  }
  if (/^#[0-9a-f]{4}$/i.test(hex)) {
    return true;
  }
  return false;
}
function escapeRegExpCharacters(value) {
  return value.replace(/[\-\\\{\}\*\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, "\\$&");
}
var CachedFn = class {
  constructor(fn) {
    this.fn = fn;
  }
  cache = /* @__PURE__ */ new Map;
  get(key) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    const value = this.fn(key);
    this.cache.set(key, value);
    return value;
  }
};
var Theme = class {
  constructor(_colorMap, _defaults, _root) {
    this._colorMap = _colorMap;
    this._defaults = _defaults;
    this._root = _root;
  }
  static createFromRawTheme(source, colorMap) {
    return this.createFromParsedTheme(parseTheme(source), colorMap);
  }
  static createFromParsedTheme(source, colorMap) {
    return resolveParsedThemeRules(source, colorMap);
  }
  _cachedMatchRoot = new CachedFn((scopeName) => this._root.match(scopeName));
  getColorMap() {
    return this._colorMap.getColorMap();
  }
  getDefaults() {
    return this._defaults;
  }
  match(scopePath) {
    if (scopePath === null) {
      return this._defaults;
    }
    const scopeName = scopePath.scopeName;
    const matchingTrieElements = this._cachedMatchRoot.get(scopeName);
    const effectiveRule = matchingTrieElements.find((v) => _scopePathMatchesParentScopes(scopePath.parent, v.parentScopes));
    if (!effectiveRule) {
      return null;
    }
    return new StyleAttributes(effectiveRule.fontStyle, effectiveRule.foreground, effectiveRule.background);
  }
};
var ScopeStack = class _ScopeStack {
  constructor(parent, scopeName) {
    this.parent = parent;
    this.scopeName = scopeName;
  }
  static push(path, scopeNames) {
    for (const name of scopeNames) {
      path = new _ScopeStack(path, name);
    }
    return path;
  }
  static from(...segments) {
    let result = null;
    for (let i = 0;i < segments.length; i++) {
      result = new _ScopeStack(result, segments[i]);
    }
    return result;
  }
  push(scopeName) {
    return new _ScopeStack(this, scopeName);
  }
  getSegments() {
    let item = this;
    const result = [];
    while (item) {
      result.push(item.scopeName);
      item = item.parent;
    }
    result.reverse();
    return result;
  }
  toString() {
    return this.getSegments().join(" ");
  }
  extends(other) {
    if (this === other) {
      return true;
    }
    if (this.parent === null) {
      return false;
    }
    return this.parent.extends(other);
  }
  getExtensionIfDefined(base) {
    const result = [];
    let item = this;
    while (item && item !== base) {
      result.push(item.scopeName);
      item = item.parent;
    }
    return item === base ? result.reverse() : undefined;
  }
};
function _scopePathMatchesParentScopes(scopePath, parentScopes) {
  if (parentScopes.length === 0) {
    return true;
  }
  for (let index = 0;index < parentScopes.length; index++) {
    let scopePattern = parentScopes[index];
    let scopeMustMatch = false;
    if (scopePattern === ">") {
      if (index === parentScopes.length - 1) {
        return false;
      }
      scopePattern = parentScopes[++index];
      scopeMustMatch = true;
    }
    while (scopePath) {
      if (_matchesScope(scopePath.scopeName, scopePattern)) {
        break;
      }
      if (scopeMustMatch) {
        return false;
      }
      scopePath = scopePath.parent;
    }
    if (!scopePath) {
      return false;
    }
    scopePath = scopePath.parent;
  }
  return true;
}
function _matchesScope(scopeName, scopePattern) {
  return scopePattern === scopeName || scopeName.startsWith(scopePattern) && scopeName[scopePattern.length] === ".";
}
var StyleAttributes = class {
  constructor(fontStyle, foregroundId, backgroundId) {
    this.fontStyle = fontStyle;
    this.foregroundId = foregroundId;
    this.backgroundId = backgroundId;
  }
};
function parseTheme(source) {
  if (!source) {
    return [];
  }
  if (!source.settings || !Array.isArray(source.settings)) {
    return [];
  }
  let settings = source.settings;
  let result = [], resultLen = 0;
  for (let i = 0, len = settings.length;i < len; i++) {
    let entry = settings[i];
    if (!entry.settings) {
      continue;
    }
    let scopes;
    if (typeof entry.scope === "string") {
      let _scope = entry.scope;
      _scope = _scope.replace(/^[,]+/, "");
      _scope = _scope.replace(/[,]+$/, "");
      scopes = _scope.split(",");
    } else if (Array.isArray(entry.scope)) {
      scopes = entry.scope;
    } else {
      scopes = [""];
    }
    let fontStyle = -1;
    if (typeof entry.settings.fontStyle === "string") {
      fontStyle = 0;
      let segments = entry.settings.fontStyle.split(" ");
      for (let j = 0, lenJ = segments.length;j < lenJ; j++) {
        let segment = segments[j];
        switch (segment) {
          case "italic":
            fontStyle = fontStyle | 1;
            break;
          case "bold":
            fontStyle = fontStyle | 2;
            break;
          case "underline":
            fontStyle = fontStyle | 4;
            break;
          case "strikethrough":
            fontStyle = fontStyle | 8;
            break;
        }
      }
    }
    let foreground = null;
    if (typeof entry.settings.foreground === "string" && isValidHexColor(entry.settings.foreground)) {
      foreground = entry.settings.foreground;
    }
    let background = null;
    if (typeof entry.settings.background === "string" && isValidHexColor(entry.settings.background)) {
      background = entry.settings.background;
    }
    for (let j = 0, lenJ = scopes.length;j < lenJ; j++) {
      let _scope = scopes[j].trim();
      let segments = _scope.split(" ");
      let scope = segments[segments.length - 1];
      let parentScopes = null;
      if (segments.length > 1) {
        parentScopes = segments.slice(0, segments.length - 1);
        parentScopes.reverse();
      }
      result[resultLen++] = new ParsedThemeRule(scope, parentScopes, i, fontStyle, foreground, background);
    }
  }
  return result;
}
var ParsedThemeRule = class {
  constructor(scope, parentScopes, index, fontStyle, foreground, background) {
    this.scope = scope;
    this.parentScopes = parentScopes;
    this.index = index;
    this.fontStyle = fontStyle;
    this.foreground = foreground;
    this.background = background;
  }
};
var FontStyle = /* @__PURE__ */ ((FontStyle2) => {
  FontStyle2[FontStyle2["NotSet"] = -1] = "NotSet";
  FontStyle2[FontStyle2["None"] = 0] = "None";
  FontStyle2[FontStyle2["Italic"] = 1] = "Italic";
  FontStyle2[FontStyle2["Bold"] = 2] = "Bold";
  FontStyle2[FontStyle2["Underline"] = 4] = "Underline";
  FontStyle2[FontStyle2["Strikethrough"] = 8] = "Strikethrough";
  return FontStyle2;
})(FontStyle || {});
function resolveParsedThemeRules(parsedThemeRules, _colorMap) {
  parsedThemeRules.sort((a, b) => {
    let r = strcmp(a.scope, b.scope);
    if (r !== 0) {
      return r;
    }
    r = strArrCmp(a.parentScopes, b.parentScopes);
    if (r !== 0) {
      return r;
    }
    return a.index - b.index;
  });
  let defaultFontStyle = 0;
  let defaultForeground = "#000000";
  let defaultBackground = "#ffffff";
  while (parsedThemeRules.length >= 1 && parsedThemeRules[0].scope === "") {
    let incomingDefaults = parsedThemeRules.shift();
    if (incomingDefaults.fontStyle !== -1) {
      defaultFontStyle = incomingDefaults.fontStyle;
    }
    if (incomingDefaults.foreground !== null) {
      defaultForeground = incomingDefaults.foreground;
    }
    if (incomingDefaults.background !== null) {
      defaultBackground = incomingDefaults.background;
    }
  }
  let colorMap = new ColorMap(_colorMap);
  let defaults = new StyleAttributes(defaultFontStyle, colorMap.getId(defaultForeground), colorMap.getId(defaultBackground));
  let root = new ThemeTrieElement(new ThemeTrieElementRule(0, null, -1, 0, 0), []);
  for (let i = 0, len = parsedThemeRules.length;i < len; i++) {
    let rule = parsedThemeRules[i];
    root.insert(0, rule.scope, rule.parentScopes, rule.fontStyle, colorMap.getId(rule.foreground), colorMap.getId(rule.background));
  }
  return new Theme(colorMap, defaults, root);
}
var ColorMap = class {
  _isFrozen;
  _lastColorId;
  _id2color;
  _color2id;
  constructor(_colorMap) {
    this._lastColorId = 0;
    this._id2color = [];
    this._color2id = /* @__PURE__ */ Object.create(null);
    if (Array.isArray(_colorMap)) {
      this._isFrozen = true;
      for (let i = 0, len = _colorMap.length;i < len; i++) {
        this._color2id[_colorMap[i]] = i;
        this._id2color[i] = _colorMap[i];
      }
    } else {
      this._isFrozen = false;
    }
  }
  getId(color) {
    if (color === null) {
      return 0;
    }
    color = color.toUpperCase();
    let value = this._color2id[color];
    if (value) {
      return value;
    }
    if (this._isFrozen) {
      throw new Error(`Missing color in color map - ${color}`);
    }
    value = ++this._lastColorId;
    this._color2id[color] = value;
    this._id2color[value] = color;
    return value;
  }
  getColorMap() {
    return this._id2color.slice(0);
  }
};
var emptyParentScopes = Object.freeze([]);
var ThemeTrieElementRule = class _ThemeTrieElementRule {
  scopeDepth;
  parentScopes;
  fontStyle;
  foreground;
  background;
  constructor(scopeDepth, parentScopes, fontStyle, foreground, background) {
    this.scopeDepth = scopeDepth;
    this.parentScopes = parentScopes || emptyParentScopes;
    this.fontStyle = fontStyle;
    this.foreground = foreground;
    this.background = background;
  }
  clone() {
    return new _ThemeTrieElementRule(this.scopeDepth, this.parentScopes, this.fontStyle, this.foreground, this.background);
  }
  static cloneArr(arr) {
    let r = [];
    for (let i = 0, len = arr.length;i < len; i++) {
      r[i] = arr[i].clone();
    }
    return r;
  }
  acceptOverwrite(scopeDepth, fontStyle, foreground, background) {
    if (this.scopeDepth > scopeDepth) {
      console.log("how did this happen?");
    } else {
      this.scopeDepth = scopeDepth;
    }
    if (fontStyle !== -1) {
      this.fontStyle = fontStyle;
    }
    if (foreground !== 0) {
      this.foreground = foreground;
    }
    if (background !== 0) {
      this.background = background;
    }
  }
};
var ThemeTrieElement = class _ThemeTrieElement {
  constructor(_mainRule, rulesWithParentScopes = [], _children = {}) {
    this._mainRule = _mainRule;
    this._children = _children;
    this._rulesWithParentScopes = rulesWithParentScopes;
  }
  _rulesWithParentScopes;
  static _cmpBySpecificity(a, b) {
    if (a.scopeDepth !== b.scopeDepth) {
      return b.scopeDepth - a.scopeDepth;
    }
    let aParentIndex = 0;
    let bParentIndex = 0;
    while (true) {
      if (a.parentScopes[aParentIndex] === ">") {
        aParentIndex++;
      }
      if (b.parentScopes[bParentIndex] === ">") {
        bParentIndex++;
      }
      if (aParentIndex >= a.parentScopes.length || bParentIndex >= b.parentScopes.length) {
        break;
      }
      const parentScopeLengthDiff = b.parentScopes[bParentIndex].length - a.parentScopes[aParentIndex].length;
      if (parentScopeLengthDiff !== 0) {
        return parentScopeLengthDiff;
      }
      aParentIndex++;
      bParentIndex++;
    }
    return b.parentScopes.length - a.parentScopes.length;
  }
  match(scope) {
    if (scope !== "") {
      let dotIndex = scope.indexOf(".");
      let head;
      let tail;
      if (dotIndex === -1) {
        head = scope;
        tail = "";
      } else {
        head = scope.substring(0, dotIndex);
        tail = scope.substring(dotIndex + 1);
      }
      if (this._children.hasOwnProperty(head)) {
        return this._children[head].match(tail);
      }
    }
    const rules = this._rulesWithParentScopes.concat(this._mainRule);
    rules.sort(_ThemeTrieElement._cmpBySpecificity);
    return rules;
  }
  insert(scopeDepth, scope, parentScopes, fontStyle, foreground, background) {
    if (scope === "") {
      this._doInsertHere(scopeDepth, parentScopes, fontStyle, foreground, background);
      return;
    }
    let dotIndex = scope.indexOf(".");
    let head;
    let tail;
    if (dotIndex === -1) {
      head = scope;
      tail = "";
    } else {
      head = scope.substring(0, dotIndex);
      tail = scope.substring(dotIndex + 1);
    }
    let child;
    if (this._children.hasOwnProperty(head)) {
      child = this._children[head];
    } else {
      child = new _ThemeTrieElement(this._mainRule.clone(), ThemeTrieElementRule.cloneArr(this._rulesWithParentScopes));
      this._children[head] = child;
    }
    child.insert(scopeDepth + 1, tail, parentScopes, fontStyle, foreground, background);
  }
  _doInsertHere(scopeDepth, parentScopes, fontStyle, foreground, background) {
    if (parentScopes === null) {
      this._mainRule.acceptOverwrite(scopeDepth, fontStyle, foreground, background);
      return;
    }
    for (let i = 0, len = this._rulesWithParentScopes.length;i < len; i++) {
      let rule = this._rulesWithParentScopes[i];
      if (strArrCmp(rule.parentScopes, parentScopes) === 0) {
        rule.acceptOverwrite(scopeDepth, fontStyle, foreground, background);
        return;
      }
    }
    if (fontStyle === -1) {
      fontStyle = this._mainRule.fontStyle;
    }
    if (foreground === 0) {
      foreground = this._mainRule.foreground;
    }
    if (background === 0) {
      background = this._mainRule.background;
    }
    this._rulesWithParentScopes.push(new ThemeTrieElementRule(scopeDepth, parentScopes, fontStyle, foreground, background));
  }
};
var EncodedTokenMetadata = class _EncodedTokenMetadata {
  static toBinaryStr(encodedTokenAttributes) {
    return encodedTokenAttributes.toString(2).padStart(32, "0");
  }
  static print(encodedTokenAttributes) {
    const languageId = _EncodedTokenMetadata.getLanguageId(encodedTokenAttributes);
    const tokenType = _EncodedTokenMetadata.getTokenType(encodedTokenAttributes);
    const fontStyle = _EncodedTokenMetadata.getFontStyle(encodedTokenAttributes);
    const foreground = _EncodedTokenMetadata.getForeground(encodedTokenAttributes);
    const background = _EncodedTokenMetadata.getBackground(encodedTokenAttributes);
    console.log({
      languageId,
      tokenType,
      fontStyle,
      foreground,
      background
    });
  }
  static getLanguageId(encodedTokenAttributes) {
    return (encodedTokenAttributes & 255) >>> 0;
  }
  static getTokenType(encodedTokenAttributes) {
    return (encodedTokenAttributes & 768) >>> 8;
  }
  static containsBalancedBrackets(encodedTokenAttributes) {
    return (encodedTokenAttributes & 1024) !== 0;
  }
  static getFontStyle(encodedTokenAttributes) {
    return (encodedTokenAttributes & 30720) >>> 11;
  }
  static getForeground(encodedTokenAttributes) {
    return (encodedTokenAttributes & 16744448) >>> 15;
  }
  static getBackground(encodedTokenAttributes) {
    return (encodedTokenAttributes & 4278190080) >>> 24;
  }
  static set(encodedTokenAttributes, languageId, tokenType, containsBalancedBrackets, fontStyle, foreground, background) {
    let _languageId = _EncodedTokenMetadata.getLanguageId(encodedTokenAttributes);
    let _tokenType = _EncodedTokenMetadata.getTokenType(encodedTokenAttributes);
    let _containsBalancedBracketsBit = _EncodedTokenMetadata.containsBalancedBrackets(encodedTokenAttributes) ? 1 : 0;
    let _fontStyle = _EncodedTokenMetadata.getFontStyle(encodedTokenAttributes);
    let _foreground = _EncodedTokenMetadata.getForeground(encodedTokenAttributes);
    let _background = _EncodedTokenMetadata.getBackground(encodedTokenAttributes);
    if (languageId !== 0) {
      _languageId = languageId;
    }
    if (tokenType !== 8) {
      _tokenType = fromOptionalTokenType(tokenType);
    }
    if (containsBalancedBrackets !== null) {
      _containsBalancedBracketsBit = containsBalancedBrackets ? 1 : 0;
    }
    if (fontStyle !== -1) {
      _fontStyle = fontStyle;
    }
    if (foreground !== 0) {
      _foreground = foreground;
    }
    if (background !== 0) {
      _background = background;
    }
    return (_languageId << 0 | _tokenType << 8 | _containsBalancedBracketsBit << 10 | _fontStyle << 11 | _foreground << 15 | _background << 24) >>> 0;
  }
};
function toOptionalTokenType(standardType) {
  return standardType;
}
function fromOptionalTokenType(standardType) {
  return standardType;
}
function createMatchers(selector, matchesName) {
  const results = [];
  const tokenizer = newTokenizer(selector);
  let token = tokenizer.next();
  while (token !== null) {
    let priority = 0;
    if (token.length === 2 && token.charAt(1) === ":") {
      switch (token.charAt(0)) {
        case "R":
          priority = 1;
          break;
        case "L":
          priority = -1;
          break;
        default:
          console.log(`Unknown priority ${token} in scope selector`);
      }
      token = tokenizer.next();
    }
    let matcher = parseConjunction();
    results.push({ matcher, priority });
    if (token !== ",") {
      break;
    }
    token = tokenizer.next();
  }
  return results;
  function parseOperand() {
    if (token === "-") {
      token = tokenizer.next();
      const expressionToNegate = parseOperand();
      return (matcherInput) => !!expressionToNegate && !expressionToNegate(matcherInput);
    }
    if (token === "(") {
      token = tokenizer.next();
      const expressionInParents = parseInnerExpression();
      if (token === ")") {
        token = tokenizer.next();
      }
      return expressionInParents;
    }
    if (isIdentifier(token)) {
      const identifiers = [];
      do {
        identifiers.push(token);
        token = tokenizer.next();
      } while (isIdentifier(token));
      return (matcherInput) => matchesName(identifiers, matcherInput);
    }
    return null;
  }
  function parseConjunction() {
    const matchers = [];
    let matcher = parseOperand();
    while (matcher) {
      matchers.push(matcher);
      matcher = parseOperand();
    }
    return (matcherInput) => matchers.every((matcher2) => matcher2(matcherInput));
  }
  function parseInnerExpression() {
    const matchers = [];
    let matcher = parseConjunction();
    while (matcher) {
      matchers.push(matcher);
      if (token === "|" || token === ",") {
        do {
          token = tokenizer.next();
        } while (token === "|" || token === ",");
      } else {
        break;
      }
      matcher = parseConjunction();
    }
    return (matcherInput) => matchers.some((matcher2) => matcher2(matcherInput));
  }
}
function isIdentifier(token) {
  return !!token && !!token.match(/[\w\.:]+/);
}
function newTokenizer(input) {
  let regex = /([LR]:|[\w\.:][\w\.:\-]*|[\,\|\-\(\)])/g;
  let match = regex.exec(input);
  return {
    next: () => {
      if (!match) {
        return null;
      }
      const res = match[0];
      match = regex.exec(input);
      return res;
    }
  };
}
function disposeOnigString(str) {
  if (typeof str.dispose === "function") {
    str.dispose();
  }
}
var TopLevelRuleReference = class {
  constructor(scopeName) {
    this.scopeName = scopeName;
  }
  toKey() {
    return this.scopeName;
  }
};
var TopLevelRepositoryRuleReference = class {
  constructor(scopeName, ruleName) {
    this.scopeName = scopeName;
    this.ruleName = ruleName;
  }
  toKey() {
    return `${this.scopeName}#${this.ruleName}`;
  }
};
var ExternalReferenceCollector = class {
  _references = [];
  _seenReferenceKeys = /* @__PURE__ */ new Set;
  get references() {
    return this._references;
  }
  visitedRule = /* @__PURE__ */ new Set;
  add(reference) {
    const key = reference.toKey();
    if (this._seenReferenceKeys.has(key)) {
      return;
    }
    this._seenReferenceKeys.add(key);
    this._references.push(reference);
  }
};
var ScopeDependencyProcessor = class {
  constructor(repo, initialScopeName) {
    this.repo = repo;
    this.initialScopeName = initialScopeName;
    this.seenFullScopeRequests.add(this.initialScopeName);
    this.Q = [new TopLevelRuleReference(this.initialScopeName)];
  }
  seenFullScopeRequests = /* @__PURE__ */ new Set;
  seenPartialScopeRequests = /* @__PURE__ */ new Set;
  Q;
  processQueue() {
    const q = this.Q;
    this.Q = [];
    const deps = new ExternalReferenceCollector;
    for (const dep of q) {
      collectReferencesOfReference(dep, this.initialScopeName, this.repo, deps);
    }
    for (const dep of deps.references) {
      if (dep instanceof TopLevelRuleReference) {
        if (this.seenFullScopeRequests.has(dep.scopeName)) {
          continue;
        }
        this.seenFullScopeRequests.add(dep.scopeName);
        this.Q.push(dep);
      } else {
        if (this.seenFullScopeRequests.has(dep.scopeName)) {
          continue;
        }
        if (this.seenPartialScopeRequests.has(dep.toKey())) {
          continue;
        }
        this.seenPartialScopeRequests.add(dep.toKey());
        this.Q.push(dep);
      }
    }
  }
};
function collectReferencesOfReference(reference, baseGrammarScopeName, repo, result) {
  const selfGrammar = repo.lookup(reference.scopeName);
  if (!selfGrammar) {
    if (reference.scopeName === baseGrammarScopeName) {
      throw new Error(`No grammar provided for <${baseGrammarScopeName}>`);
    }
    return;
  }
  const baseGrammar = repo.lookup(baseGrammarScopeName);
  if (reference instanceof TopLevelRuleReference) {
    collectExternalReferencesInTopLevelRule({ baseGrammar, selfGrammar }, result);
  } else {
    collectExternalReferencesInTopLevelRepositoryRule(reference.ruleName, { baseGrammar, selfGrammar, repository: selfGrammar.repository }, result);
  }
  const injections = repo.injections(reference.scopeName);
  if (injections) {
    for (const injection of injections) {
      result.add(new TopLevelRuleReference(injection));
    }
  }
}
function collectExternalReferencesInTopLevelRepositoryRule(ruleName, context, result) {
  if (context.repository && context.repository[ruleName]) {
    const rule = context.repository[ruleName];
    collectExternalReferencesInRules([rule], context, result);
  }
}
function collectExternalReferencesInTopLevelRule(context, result) {
  if (context.selfGrammar.patterns && Array.isArray(context.selfGrammar.patterns)) {
    collectExternalReferencesInRules(context.selfGrammar.patterns, { ...context, repository: context.selfGrammar.repository }, result);
  }
  if (context.selfGrammar.injections) {
    collectExternalReferencesInRules(Object.values(context.selfGrammar.injections), { ...context, repository: context.selfGrammar.repository }, result);
  }
}
function collectExternalReferencesInRules(rules, context, result) {
  for (const rule of rules) {
    if (result.visitedRule.has(rule)) {
      continue;
    }
    result.visitedRule.add(rule);
    const patternRepository = rule.repository ? mergeObjects({}, context.repository, rule.repository) : context.repository;
    if (Array.isArray(rule.patterns)) {
      collectExternalReferencesInRules(rule.patterns, { ...context, repository: patternRepository }, result);
    }
    const include = rule.include;
    if (!include) {
      continue;
    }
    const reference = parseInclude(include);
    switch (reference.kind) {
      case 0:
        collectExternalReferencesInTopLevelRule({ ...context, selfGrammar: context.baseGrammar }, result);
        break;
      case 1:
        collectExternalReferencesInTopLevelRule(context, result);
        break;
      case 2:
        collectExternalReferencesInTopLevelRepositoryRule(reference.ruleName, { ...context, repository: patternRepository }, result);
        break;
      case 3:
      case 4:
        const selfGrammar = reference.scopeName === context.selfGrammar.scopeName ? context.selfGrammar : reference.scopeName === context.baseGrammar.scopeName ? context.baseGrammar : undefined;
        if (selfGrammar) {
          const newContext = { baseGrammar: context.baseGrammar, selfGrammar, repository: patternRepository };
          if (reference.kind === 4) {
            collectExternalReferencesInTopLevelRepositoryRule(reference.ruleName, newContext, result);
          } else {
            collectExternalReferencesInTopLevelRule(newContext, result);
          }
        } else {
          if (reference.kind === 4) {
            result.add(new TopLevelRepositoryRuleReference(reference.scopeName, reference.ruleName));
          } else {
            result.add(new TopLevelRuleReference(reference.scopeName));
          }
        }
        break;
    }
  }
}
var BaseReference = class {
  kind = 0;
};
var SelfReference = class {
  kind = 1;
};
var RelativeReference = class {
  constructor(ruleName) {
    this.ruleName = ruleName;
  }
  kind = 2;
};
var TopLevelReference = class {
  constructor(scopeName) {
    this.scopeName = scopeName;
  }
  kind = 3;
};
var TopLevelRepositoryReference = class {
  constructor(scopeName, ruleName) {
    this.scopeName = scopeName;
    this.ruleName = ruleName;
  }
  kind = 4;
};
function parseInclude(include) {
  if (include === "$base") {
    return new BaseReference;
  } else if (include === "$self") {
    return new SelfReference;
  }
  const indexOfSharp = include.indexOf("#");
  if (indexOfSharp === -1) {
    return new TopLevelReference(include);
  } else if (indexOfSharp === 0) {
    return new RelativeReference(include.substring(1));
  } else {
    const scopeName = include.substring(0, indexOfSharp);
    const ruleName = include.substring(indexOfSharp + 1);
    return new TopLevelRepositoryReference(scopeName, ruleName);
  }
}
var HAS_BACK_REFERENCES = /\\(\d+)/;
var BACK_REFERENCING_END = /\\(\d+)/g;
var ruleIdSymbol = Symbol("RuleId");
var endRuleId = -1;
var whileRuleId = -2;
function ruleIdFromNumber(id) {
  return id;
}
function ruleIdToNumber(id) {
  return id;
}
var Rule = class {
  $location;
  id;
  _nameIsCapturing;
  _name;
  _contentNameIsCapturing;
  _contentName;
  constructor($location, id, name, contentName) {
    this.$location = $location;
    this.id = id;
    this._name = name || null;
    this._nameIsCapturing = RegexSource.hasCaptures(this._name);
    this._contentName = contentName || null;
    this._contentNameIsCapturing = RegexSource.hasCaptures(this._contentName);
  }
  get debugName() {
    const location = this.$location ? `${basename(this.$location.filename)}:${this.$location.line}` : "unknown";
    return `${this.constructor.name}#${this.id} @ ${location}`;
  }
  getName(lineText, captureIndices) {
    if (!this._nameIsCapturing || this._name === null || lineText === null || captureIndices === null) {
      return this._name;
    }
    return RegexSource.replaceCaptures(this._name, lineText, captureIndices);
  }
  getContentName(lineText, captureIndices) {
    if (!this._contentNameIsCapturing || this._contentName === null) {
      return this._contentName;
    }
    return RegexSource.replaceCaptures(this._contentName, lineText, captureIndices);
  }
};
var CaptureRule = class extends Rule {
  retokenizeCapturedWithRuleId;
  constructor($location, id, name, contentName, retokenizeCapturedWithRuleId) {
    super($location, id, name, contentName);
    this.retokenizeCapturedWithRuleId = retokenizeCapturedWithRuleId;
  }
  dispose() {}
  collectPatterns(grammar, out) {
    throw new Error("Not supported!");
  }
  compile(grammar, endRegexSource) {
    throw new Error("Not supported!");
  }
  compileAG(grammar, endRegexSource, allowA, allowG) {
    throw new Error("Not supported!");
  }
};
var MatchRule = class extends Rule {
  _match;
  captures;
  _cachedCompiledPatterns;
  constructor($location, id, name, match, captures) {
    super($location, id, name, null);
    this._match = new RegExpSource(match, this.id);
    this.captures = captures;
    this._cachedCompiledPatterns = null;
  }
  dispose() {
    if (this._cachedCompiledPatterns) {
      this._cachedCompiledPatterns.dispose();
      this._cachedCompiledPatterns = null;
    }
  }
  get debugMatchRegExp() {
    return `${this._match.source}`;
  }
  collectPatterns(grammar, out) {
    out.push(this._match);
  }
  compile(grammar, endRegexSource) {
    return this._getCachedCompiledPatterns(grammar).compile(grammar);
  }
  compileAG(grammar, endRegexSource, allowA, allowG) {
    return this._getCachedCompiledPatterns(grammar).compileAG(grammar, allowA, allowG);
  }
  _getCachedCompiledPatterns(grammar) {
    if (!this._cachedCompiledPatterns) {
      this._cachedCompiledPatterns = new RegExpSourceList;
      this.collectPatterns(grammar, this._cachedCompiledPatterns);
    }
    return this._cachedCompiledPatterns;
  }
};
var IncludeOnlyRule = class extends Rule {
  hasMissingPatterns;
  patterns;
  _cachedCompiledPatterns;
  constructor($location, id, name, contentName, patterns) {
    super($location, id, name, contentName);
    this.patterns = patterns.patterns;
    this.hasMissingPatterns = patterns.hasMissingPatterns;
    this._cachedCompiledPatterns = null;
  }
  dispose() {
    if (this._cachedCompiledPatterns) {
      this._cachedCompiledPatterns.dispose();
      this._cachedCompiledPatterns = null;
    }
  }
  collectPatterns(grammar, out) {
    for (const pattern of this.patterns) {
      const rule = grammar.getRule(pattern);
      rule.collectPatterns(grammar, out);
    }
  }
  compile(grammar, endRegexSource) {
    return this._getCachedCompiledPatterns(grammar).compile(grammar);
  }
  compileAG(grammar, endRegexSource, allowA, allowG) {
    return this._getCachedCompiledPatterns(grammar).compileAG(grammar, allowA, allowG);
  }
  _getCachedCompiledPatterns(grammar) {
    if (!this._cachedCompiledPatterns) {
      this._cachedCompiledPatterns = new RegExpSourceList;
      this.collectPatterns(grammar, this._cachedCompiledPatterns);
    }
    return this._cachedCompiledPatterns;
  }
};
var BeginEndRule = class extends Rule {
  _begin;
  beginCaptures;
  _end;
  endHasBackReferences;
  endCaptures;
  applyEndPatternLast;
  hasMissingPatterns;
  patterns;
  _cachedCompiledPatterns;
  constructor($location, id, name, contentName, begin, beginCaptures, end, endCaptures, applyEndPatternLast, patterns) {
    super($location, id, name, contentName);
    this._begin = new RegExpSource(begin, this.id);
    this.beginCaptures = beginCaptures;
    this._end = new RegExpSource(end ? end : "￿", -1);
    this.endHasBackReferences = this._end.hasBackReferences;
    this.endCaptures = endCaptures;
    this.applyEndPatternLast = applyEndPatternLast || false;
    this.patterns = patterns.patterns;
    this.hasMissingPatterns = patterns.hasMissingPatterns;
    this._cachedCompiledPatterns = null;
  }
  dispose() {
    if (this._cachedCompiledPatterns) {
      this._cachedCompiledPatterns.dispose();
      this._cachedCompiledPatterns = null;
    }
  }
  get debugBeginRegExp() {
    return `${this._begin.source}`;
  }
  get debugEndRegExp() {
    return `${this._end.source}`;
  }
  getEndWithResolvedBackReferences(lineText, captureIndices) {
    return this._end.resolveBackReferences(lineText, captureIndices);
  }
  collectPatterns(grammar, out) {
    out.push(this._begin);
  }
  compile(grammar, endRegexSource) {
    return this._getCachedCompiledPatterns(grammar, endRegexSource).compile(grammar);
  }
  compileAG(grammar, endRegexSource, allowA, allowG) {
    return this._getCachedCompiledPatterns(grammar, endRegexSource).compileAG(grammar, allowA, allowG);
  }
  _getCachedCompiledPatterns(grammar, endRegexSource) {
    if (!this._cachedCompiledPatterns) {
      this._cachedCompiledPatterns = new RegExpSourceList;
      for (const pattern of this.patterns) {
        const rule = grammar.getRule(pattern);
        rule.collectPatterns(grammar, this._cachedCompiledPatterns);
      }
      if (this.applyEndPatternLast) {
        this._cachedCompiledPatterns.push(this._end.hasBackReferences ? this._end.clone() : this._end);
      } else {
        this._cachedCompiledPatterns.unshift(this._end.hasBackReferences ? this._end.clone() : this._end);
      }
    }
    if (this._end.hasBackReferences) {
      if (this.applyEndPatternLast) {
        this._cachedCompiledPatterns.setSource(this._cachedCompiledPatterns.length() - 1, endRegexSource);
      } else {
        this._cachedCompiledPatterns.setSource(0, endRegexSource);
      }
    }
    return this._cachedCompiledPatterns;
  }
};
var BeginWhileRule = class extends Rule {
  _begin;
  beginCaptures;
  whileCaptures;
  _while;
  whileHasBackReferences;
  hasMissingPatterns;
  patterns;
  _cachedCompiledPatterns;
  _cachedCompiledWhilePatterns;
  constructor($location, id, name, contentName, begin, beginCaptures, _while, whileCaptures, patterns) {
    super($location, id, name, contentName);
    this._begin = new RegExpSource(begin, this.id);
    this.beginCaptures = beginCaptures;
    this.whileCaptures = whileCaptures;
    this._while = new RegExpSource(_while, whileRuleId);
    this.whileHasBackReferences = this._while.hasBackReferences;
    this.patterns = patterns.patterns;
    this.hasMissingPatterns = patterns.hasMissingPatterns;
    this._cachedCompiledPatterns = null;
    this._cachedCompiledWhilePatterns = null;
  }
  dispose() {
    if (this._cachedCompiledPatterns) {
      this._cachedCompiledPatterns.dispose();
      this._cachedCompiledPatterns = null;
    }
    if (this._cachedCompiledWhilePatterns) {
      this._cachedCompiledWhilePatterns.dispose();
      this._cachedCompiledWhilePatterns = null;
    }
  }
  get debugBeginRegExp() {
    return `${this._begin.source}`;
  }
  get debugWhileRegExp() {
    return `${this._while.source}`;
  }
  getWhileWithResolvedBackReferences(lineText, captureIndices) {
    return this._while.resolveBackReferences(lineText, captureIndices);
  }
  collectPatterns(grammar, out) {
    out.push(this._begin);
  }
  compile(grammar, endRegexSource) {
    return this._getCachedCompiledPatterns(grammar).compile(grammar);
  }
  compileAG(grammar, endRegexSource, allowA, allowG) {
    return this._getCachedCompiledPatterns(grammar).compileAG(grammar, allowA, allowG);
  }
  _getCachedCompiledPatterns(grammar) {
    if (!this._cachedCompiledPatterns) {
      this._cachedCompiledPatterns = new RegExpSourceList;
      for (const pattern of this.patterns) {
        const rule = grammar.getRule(pattern);
        rule.collectPatterns(grammar, this._cachedCompiledPatterns);
      }
    }
    return this._cachedCompiledPatterns;
  }
  compileWhile(grammar, endRegexSource) {
    return this._getCachedCompiledWhilePatterns(grammar, endRegexSource).compile(grammar);
  }
  compileWhileAG(grammar, endRegexSource, allowA, allowG) {
    return this._getCachedCompiledWhilePatterns(grammar, endRegexSource).compileAG(grammar, allowA, allowG);
  }
  _getCachedCompiledWhilePatterns(grammar, endRegexSource) {
    if (!this._cachedCompiledWhilePatterns) {
      this._cachedCompiledWhilePatterns = new RegExpSourceList;
      this._cachedCompiledWhilePatterns.push(this._while.hasBackReferences ? this._while.clone() : this._while);
    }
    if (this._while.hasBackReferences) {
      this._cachedCompiledWhilePatterns.setSource(0, endRegexSource ? endRegexSource : "￿");
    }
    return this._cachedCompiledWhilePatterns;
  }
};
var RuleFactory = class _RuleFactory {
  static createCaptureRule(helper, $location, name, contentName, retokenizeCapturedWithRuleId) {
    return helper.registerRule((id) => {
      return new CaptureRule($location, id, name, contentName, retokenizeCapturedWithRuleId);
    });
  }
  static getCompiledRuleId(desc, helper, repository) {
    if (!desc.id) {
      helper.registerRule((id) => {
        desc.id = id;
        if (desc.match) {
          return new MatchRule(desc.$vscodeTextmateLocation, desc.id, desc.name, desc.match, _RuleFactory._compileCaptures(desc.captures, helper, repository));
        }
        if (typeof desc.begin === "undefined") {
          if (desc.repository) {
            repository = mergeObjects({}, repository, desc.repository);
          }
          let patterns = desc.patterns;
          if (typeof patterns === "undefined" && desc.include) {
            patterns = [{ include: desc.include }];
          }
          return new IncludeOnlyRule(desc.$vscodeTextmateLocation, desc.id, desc.name, desc.contentName, _RuleFactory._compilePatterns(patterns, helper, repository));
        }
        if (desc.while) {
          return new BeginWhileRule(desc.$vscodeTextmateLocation, desc.id, desc.name, desc.contentName, desc.begin, _RuleFactory._compileCaptures(desc.beginCaptures || desc.captures, helper, repository), desc.while, _RuleFactory._compileCaptures(desc.whileCaptures || desc.captures, helper, repository), _RuleFactory._compilePatterns(desc.patterns, helper, repository));
        }
        return new BeginEndRule(desc.$vscodeTextmateLocation, desc.id, desc.name, desc.contentName, desc.begin, _RuleFactory._compileCaptures(desc.beginCaptures || desc.captures, helper, repository), desc.end, _RuleFactory._compileCaptures(desc.endCaptures || desc.captures, helper, repository), desc.applyEndPatternLast, _RuleFactory._compilePatterns(desc.patterns, helper, repository));
      });
    }
    return desc.id;
  }
  static _compileCaptures(captures, helper, repository) {
    let r = [];
    if (captures) {
      let maximumCaptureId = 0;
      for (const captureId in captures) {
        if (captureId === "$vscodeTextmateLocation") {
          continue;
        }
        const numericCaptureId = parseInt(captureId, 10);
        if (numericCaptureId > maximumCaptureId) {
          maximumCaptureId = numericCaptureId;
        }
      }
      for (let i = 0;i <= maximumCaptureId; i++) {
        r[i] = null;
      }
      for (const captureId in captures) {
        if (captureId === "$vscodeTextmateLocation") {
          continue;
        }
        const numericCaptureId = parseInt(captureId, 10);
        let retokenizeCapturedWithRuleId = 0;
        if (captures[captureId].patterns) {
          retokenizeCapturedWithRuleId = _RuleFactory.getCompiledRuleId(captures[captureId], helper, repository);
        }
        r[numericCaptureId] = _RuleFactory.createCaptureRule(helper, captures[captureId].$vscodeTextmateLocation, captures[captureId].name, captures[captureId].contentName, retokenizeCapturedWithRuleId);
      }
    }
    return r;
  }
  static _compilePatterns(patterns, helper, repository) {
    let r = [];
    if (patterns) {
      for (let i = 0, len = patterns.length;i < len; i++) {
        const pattern = patterns[i];
        let ruleId = -1;
        if (pattern.include) {
          const reference = parseInclude(pattern.include);
          switch (reference.kind) {
            case 0:
            case 1:
              ruleId = _RuleFactory.getCompiledRuleId(repository[pattern.include], helper, repository);
              break;
            case 2:
              let localIncludedRule = repository[reference.ruleName];
              if (localIncludedRule) {
                ruleId = _RuleFactory.getCompiledRuleId(localIncludedRule, helper, repository);
              } else {}
              break;
            case 3:
            case 4:
              const externalGrammarName = reference.scopeName;
              const externalGrammarInclude = reference.kind === 4 ? reference.ruleName : null;
              const externalGrammar = helper.getExternalGrammar(externalGrammarName, repository);
              if (externalGrammar) {
                if (externalGrammarInclude) {
                  let externalIncludedRule = externalGrammar.repository[externalGrammarInclude];
                  if (externalIncludedRule) {
                    ruleId = _RuleFactory.getCompiledRuleId(externalIncludedRule, helper, externalGrammar.repository);
                  } else {}
                } else {
                  ruleId = _RuleFactory.getCompiledRuleId(externalGrammar.repository.$self, helper, externalGrammar.repository);
                }
              } else {}
              break;
          }
        } else {
          ruleId = _RuleFactory.getCompiledRuleId(pattern, helper, repository);
        }
        if (ruleId !== -1) {
          const rule = helper.getRule(ruleId);
          let skipRule = false;
          if (rule instanceof IncludeOnlyRule || rule instanceof BeginEndRule || rule instanceof BeginWhileRule) {
            if (rule.hasMissingPatterns && rule.patterns.length === 0) {
              skipRule = true;
            }
          }
          if (skipRule) {
            continue;
          }
          r.push(ruleId);
        }
      }
    }
    return {
      patterns: r,
      hasMissingPatterns: (patterns ? patterns.length : 0) !== r.length
    };
  }
};
var RegExpSource = class _RegExpSource {
  source;
  ruleId;
  hasAnchor;
  hasBackReferences;
  _anchorCache;
  constructor(regExpSource, ruleId) {
    if (regExpSource && typeof regExpSource === "string") {
      const len = regExpSource.length;
      let lastPushedPos = 0;
      let output = [];
      let hasAnchor = false;
      for (let pos = 0;pos < len; pos++) {
        const ch = regExpSource.charAt(pos);
        if (ch === "\\") {
          if (pos + 1 < len) {
            const nextCh = regExpSource.charAt(pos + 1);
            if (nextCh === "z") {
              output.push(regExpSource.substring(lastPushedPos, pos));
              output.push("$(?!\\n)(?<!\\n)");
              lastPushedPos = pos + 2;
            } else if (nextCh === "A" || nextCh === "G") {
              hasAnchor = true;
            }
            pos++;
          }
        }
      }
      this.hasAnchor = hasAnchor;
      if (lastPushedPos === 0) {
        this.source = regExpSource;
      } else {
        output.push(regExpSource.substring(lastPushedPos, len));
        this.source = output.join("");
      }
    } else {
      this.hasAnchor = false;
      this.source = regExpSource;
    }
    if (this.hasAnchor) {
      this._anchorCache = this._buildAnchorCache();
    } else {
      this._anchorCache = null;
    }
    this.ruleId = ruleId;
    if (typeof this.source === "string") {
      this.hasBackReferences = HAS_BACK_REFERENCES.test(this.source);
    } else {
      this.hasBackReferences = false;
    }
  }
  clone() {
    return new _RegExpSource(this.source, this.ruleId);
  }
  setSource(newSource) {
    if (this.source === newSource) {
      return;
    }
    this.source = newSource;
    if (this.hasAnchor) {
      this._anchorCache = this._buildAnchorCache();
    }
  }
  resolveBackReferences(lineText, captureIndices) {
    if (typeof this.source !== "string") {
      throw new Error("This method should only be called if the source is a string");
    }
    let capturedValues = captureIndices.map((capture) => {
      return lineText.substring(capture.start, capture.end);
    });
    BACK_REFERENCING_END.lastIndex = 0;
    return this.source.replace(BACK_REFERENCING_END, (match, g1) => {
      return escapeRegExpCharacters(capturedValues[parseInt(g1, 10)] || "");
    });
  }
  _buildAnchorCache() {
    if (typeof this.source !== "string") {
      throw new Error("This method should only be called if the source is a string");
    }
    let A0_G0_result = [];
    let A0_G1_result = [];
    let A1_G0_result = [];
    let A1_G1_result = [];
    let pos, len, ch, nextCh;
    for (pos = 0, len = this.source.length;pos < len; pos++) {
      ch = this.source.charAt(pos);
      A0_G0_result[pos] = ch;
      A0_G1_result[pos] = ch;
      A1_G0_result[pos] = ch;
      A1_G1_result[pos] = ch;
      if (ch === "\\") {
        if (pos + 1 < len) {
          nextCh = this.source.charAt(pos + 1);
          if (nextCh === "A") {
            A0_G0_result[pos + 1] = "￿";
            A0_G1_result[pos + 1] = "￿";
            A1_G0_result[pos + 1] = "A";
            A1_G1_result[pos + 1] = "A";
          } else if (nextCh === "G") {
            A0_G0_result[pos + 1] = "￿";
            A0_G1_result[pos + 1] = "G";
            A1_G0_result[pos + 1] = "￿";
            A1_G1_result[pos + 1] = "G";
          } else {
            A0_G0_result[pos + 1] = nextCh;
            A0_G1_result[pos + 1] = nextCh;
            A1_G0_result[pos + 1] = nextCh;
            A1_G1_result[pos + 1] = nextCh;
          }
          pos++;
        }
      }
    }
    return {
      A0_G0: A0_G0_result.join(""),
      A0_G1: A0_G1_result.join(""),
      A1_G0: A1_G0_result.join(""),
      A1_G1: A1_G1_result.join("")
    };
  }
  resolveAnchors(allowA, allowG) {
    if (!this.hasAnchor || !this._anchorCache || typeof this.source !== "string") {
      return this.source;
    }
    if (allowA) {
      if (allowG) {
        return this._anchorCache.A1_G1;
      } else {
        return this._anchorCache.A1_G0;
      }
    } else {
      if (allowG) {
        return this._anchorCache.A0_G1;
      } else {
        return this._anchorCache.A0_G0;
      }
    }
  }
};
var RegExpSourceList = class {
  _items;
  _hasAnchors;
  _cached;
  _anchorCache;
  constructor() {
    this._items = [];
    this._hasAnchors = false;
    this._cached = null;
    this._anchorCache = {
      A0_G0: null,
      A0_G1: null,
      A1_G0: null,
      A1_G1: null
    };
  }
  dispose() {
    this._disposeCaches();
  }
  _disposeCaches() {
    if (this._cached) {
      this._cached.dispose();
      this._cached = null;
    }
    if (this._anchorCache.A0_G0) {
      this._anchorCache.A0_G0.dispose();
      this._anchorCache.A0_G0 = null;
    }
    if (this._anchorCache.A0_G1) {
      this._anchorCache.A0_G1.dispose();
      this._anchorCache.A0_G1 = null;
    }
    if (this._anchorCache.A1_G0) {
      this._anchorCache.A1_G0.dispose();
      this._anchorCache.A1_G0 = null;
    }
    if (this._anchorCache.A1_G1) {
      this._anchorCache.A1_G1.dispose();
      this._anchorCache.A1_G1 = null;
    }
  }
  push(item) {
    this._items.push(item);
    this._hasAnchors = this._hasAnchors || item.hasAnchor;
  }
  unshift(item) {
    this._items.unshift(item);
    this._hasAnchors = this._hasAnchors || item.hasAnchor;
  }
  length() {
    return this._items.length;
  }
  setSource(index, newSource) {
    if (this._items[index].source !== newSource) {
      this._disposeCaches();
      this._items[index].setSource(newSource);
    }
  }
  compile(onigLib) {
    if (!this._cached) {
      let regExps = this._items.map((e) => e.source);
      this._cached = new CompiledRule(onigLib, regExps, this._items.map((e) => e.ruleId));
    }
    return this._cached;
  }
  compileAG(onigLib, allowA, allowG) {
    if (!this._hasAnchors) {
      return this.compile(onigLib);
    } else {
      if (allowA) {
        if (allowG) {
          if (!this._anchorCache.A1_G1) {
            this._anchorCache.A1_G1 = this._resolveAnchors(onigLib, allowA, allowG);
          }
          return this._anchorCache.A1_G1;
        } else {
          if (!this._anchorCache.A1_G0) {
            this._anchorCache.A1_G0 = this._resolveAnchors(onigLib, allowA, allowG);
          }
          return this._anchorCache.A1_G0;
        }
      } else {
        if (allowG) {
          if (!this._anchorCache.A0_G1) {
            this._anchorCache.A0_G1 = this._resolveAnchors(onigLib, allowA, allowG);
          }
          return this._anchorCache.A0_G1;
        } else {
          if (!this._anchorCache.A0_G0) {
            this._anchorCache.A0_G0 = this._resolveAnchors(onigLib, allowA, allowG);
          }
          return this._anchorCache.A0_G0;
        }
      }
    }
  }
  _resolveAnchors(onigLib, allowA, allowG) {
    let regExps = this._items.map((e) => e.resolveAnchors(allowA, allowG));
    return new CompiledRule(onigLib, regExps, this._items.map((e) => e.ruleId));
  }
};
var CompiledRule = class {
  constructor(onigLib, regExps, rules) {
    this.regExps = regExps;
    this.rules = rules;
    this.scanner = onigLib.createOnigScanner(regExps);
  }
  scanner;
  dispose() {
    if (typeof this.scanner.dispose === "function") {
      this.scanner.dispose();
    }
  }
  toString() {
    const r = [];
    for (let i = 0, len = this.rules.length;i < len; i++) {
      r.push("   - " + this.rules[i] + ": " + this.regExps[i]);
    }
    return r.join(`
`);
  }
  findNextMatchSync(string, startPosition, options) {
    const result = this.scanner.findNextMatchSync(string, startPosition, options);
    if (!result) {
      return null;
    }
    return {
      ruleId: this.rules[result.index],
      captureIndices: result.captureIndices
    };
  }
};
var BasicScopeAttributes = class {
  constructor(languageId, tokenType) {
    this.languageId = languageId;
    this.tokenType = tokenType;
  }
};
var BasicScopeAttributesProvider = class _BasicScopeAttributesProvider {
  _defaultAttributes;
  _embeddedLanguagesMatcher;
  constructor(initialLanguageId, embeddedLanguages) {
    this._defaultAttributes = new BasicScopeAttributes(initialLanguageId, 8);
    this._embeddedLanguagesMatcher = new ScopeMatcher(Object.entries(embeddedLanguages || {}));
  }
  getDefaultAttributes() {
    return this._defaultAttributes;
  }
  getBasicScopeAttributes(scopeName) {
    if (scopeName === null) {
      return _BasicScopeAttributesProvider._NULL_SCOPE_METADATA;
    }
    return this._getBasicScopeAttributes.get(scopeName);
  }
  static _NULL_SCOPE_METADATA = new BasicScopeAttributes(0, 0);
  _getBasicScopeAttributes = new CachedFn((scopeName) => {
    const languageId = this._scopeToLanguage(scopeName);
    const standardTokenType = this._toStandardTokenType(scopeName);
    return new BasicScopeAttributes(languageId, standardTokenType);
  });
  _scopeToLanguage(scope) {
    return this._embeddedLanguagesMatcher.match(scope) || 0;
  }
  _toStandardTokenType(scopeName) {
    const m = scopeName.match(_BasicScopeAttributesProvider.STANDARD_TOKEN_TYPE_REGEXP);
    if (!m) {
      return 8;
    }
    switch (m[1]) {
      case "comment":
        return 1;
      case "string":
        return 2;
      case "regex":
        return 3;
      case "meta.embedded":
        return 0;
    }
    throw new Error("Unexpected match for standard token type!");
  }
  static STANDARD_TOKEN_TYPE_REGEXP = /\b(comment|string|regex|meta\.embedded)\b/;
};
var ScopeMatcher = class {
  values;
  scopesRegExp;
  constructor(values) {
    if (values.length === 0) {
      this.values = null;
      this.scopesRegExp = null;
    } else {
      this.values = new Map(values);
      const escapedScopes = values.map(([scopeName, value]) => escapeRegExpCharacters(scopeName));
      escapedScopes.sort();
      escapedScopes.reverse();
      this.scopesRegExp = new RegExp(`^((${escapedScopes.join(")|(")}))($|\\.)`, "");
    }
  }
  match(scope) {
    if (!this.scopesRegExp) {
      return;
    }
    const m = scope.match(this.scopesRegExp);
    if (!m) {
      return;
    }
    return this.values.get(m[1]);
  }
};
var DebugFlags = {
  InDebugMode: typeof process !== "undefined" && !!process.env["VSCODE_TEXTMATE_DEBUG"]
};
var UseOnigurumaFindOptions = false;
var TokenizeStringResult = class {
  constructor(stack, stoppedEarly) {
    this.stack = stack;
    this.stoppedEarly = stoppedEarly;
  }
};
function _tokenizeString(grammar, lineText, isFirstLine, linePos, stack, lineTokens, checkWhileConditions, timeLimit) {
  const lineLength = lineText.content.length;
  let STOP = false;
  let anchorPosition = -1;
  if (checkWhileConditions) {
    const whileCheckResult = _checkWhileConditions(grammar, lineText, isFirstLine, linePos, stack, lineTokens);
    stack = whileCheckResult.stack;
    linePos = whileCheckResult.linePos;
    isFirstLine = whileCheckResult.isFirstLine;
    anchorPosition = whileCheckResult.anchorPosition;
  }
  const startTime = Date.now();
  while (!STOP) {
    if (timeLimit !== 0) {
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime > timeLimit) {
        return new TokenizeStringResult(stack, true);
      }
    }
    scanNext();
  }
  return new TokenizeStringResult(stack, false);
  function scanNext() {
    if (false) {}
    const r = matchRuleOrInjections(grammar, lineText, isFirstLine, linePos, stack, anchorPosition);
    if (!r) {
      lineTokens.produce(stack, lineLength);
      STOP = true;
      return;
    }
    const captureIndices = r.captureIndices;
    const matchedRuleId = r.matchedRuleId;
    const hasAdvanced = captureIndices && captureIndices.length > 0 ? captureIndices[0].end > linePos : false;
    if (matchedRuleId === endRuleId) {
      const poppedRule = stack.getRule(grammar);
      if (false) {}
      lineTokens.produce(stack, captureIndices[0].start);
      stack = stack.withContentNameScopesList(stack.nameScopesList);
      handleCaptures(grammar, lineText, isFirstLine, stack, lineTokens, poppedRule.endCaptures, captureIndices);
      lineTokens.produce(stack, captureIndices[0].end);
      const popped = stack;
      stack = stack.parent;
      anchorPosition = popped.getAnchorPos();
      if (!hasAdvanced && popped.getEnterPos() === linePos) {
        if (false) {}
        stack = popped;
        lineTokens.produce(stack, lineLength);
        STOP = true;
        return;
      }
    } else {
      const _rule = grammar.getRule(matchedRuleId);
      lineTokens.produce(stack, captureIndices[0].start);
      const beforePush = stack;
      const scopeName = _rule.getName(lineText.content, captureIndices);
      const nameScopesList = stack.contentNameScopesList.pushAttributed(scopeName, grammar);
      stack = stack.push(matchedRuleId, linePos, anchorPosition, captureIndices[0].end === lineLength, null, nameScopesList, nameScopesList);
      if (_rule instanceof BeginEndRule) {
        const pushedRule = _rule;
        if (false) {}
        handleCaptures(grammar, lineText, isFirstLine, stack, lineTokens, pushedRule.beginCaptures, captureIndices);
        lineTokens.produce(stack, captureIndices[0].end);
        anchorPosition = captureIndices[0].end;
        const contentName = pushedRule.getContentName(lineText.content, captureIndices);
        const contentNameScopesList = nameScopesList.pushAttributed(contentName, grammar);
        stack = stack.withContentNameScopesList(contentNameScopesList);
        if (pushedRule.endHasBackReferences) {
          stack = stack.withEndRule(pushedRule.getEndWithResolvedBackReferences(lineText.content, captureIndices));
        }
        if (!hasAdvanced && beforePush.hasSameRuleAs(stack)) {
          if (false) {}
          stack = stack.pop();
          lineTokens.produce(stack, lineLength);
          STOP = true;
          return;
        }
      } else if (_rule instanceof BeginWhileRule) {
        const pushedRule = _rule;
        if (false) {}
        handleCaptures(grammar, lineText, isFirstLine, stack, lineTokens, pushedRule.beginCaptures, captureIndices);
        lineTokens.produce(stack, captureIndices[0].end);
        anchorPosition = captureIndices[0].end;
        const contentName = pushedRule.getContentName(lineText.content, captureIndices);
        const contentNameScopesList = nameScopesList.pushAttributed(contentName, grammar);
        stack = stack.withContentNameScopesList(contentNameScopesList);
        if (pushedRule.whileHasBackReferences) {
          stack = stack.withEndRule(pushedRule.getWhileWithResolvedBackReferences(lineText.content, captureIndices));
        }
        if (!hasAdvanced && beforePush.hasSameRuleAs(stack)) {
          if (false) {}
          stack = stack.pop();
          lineTokens.produce(stack, lineLength);
          STOP = true;
          return;
        }
      } else {
        const matchingRule = _rule;
        if (false) {}
        handleCaptures(grammar, lineText, isFirstLine, stack, lineTokens, matchingRule.captures, captureIndices);
        lineTokens.produce(stack, captureIndices[0].end);
        stack = stack.pop();
        if (!hasAdvanced) {
          if (false) {}
          stack = stack.safePop();
          lineTokens.produce(stack, lineLength);
          STOP = true;
          return;
        }
      }
    }
    if (captureIndices[0].end > linePos) {
      linePos = captureIndices[0].end;
      isFirstLine = false;
    }
  }
}
function _checkWhileConditions(grammar, lineText, isFirstLine, linePos, stack, lineTokens) {
  let anchorPosition = stack.beginRuleCapturedEOL ? 0 : -1;
  const whileRules = [];
  for (let node = stack;node; node = node.pop()) {
    const nodeRule = node.getRule(grammar);
    if (nodeRule instanceof BeginWhileRule) {
      whileRules.push({
        rule: nodeRule,
        stack: node
      });
    }
  }
  for (let whileRule = whileRules.pop();whileRule; whileRule = whileRules.pop()) {
    const { ruleScanner, findOptions } = prepareRuleWhileSearch(whileRule.rule, grammar, whileRule.stack.endRule, isFirstLine, linePos === anchorPosition);
    const r = ruleScanner.findNextMatchSync(lineText, linePos, findOptions);
    if (false) {}
    if (r) {
      const matchedRuleId = r.ruleId;
      if (matchedRuleId !== whileRuleId) {
        stack = whileRule.stack.pop();
        break;
      }
      if (r.captureIndices && r.captureIndices.length) {
        lineTokens.produce(whileRule.stack, r.captureIndices[0].start);
        handleCaptures(grammar, lineText, isFirstLine, whileRule.stack, lineTokens, whileRule.rule.whileCaptures, r.captureIndices);
        lineTokens.produce(whileRule.stack, r.captureIndices[0].end);
        anchorPosition = r.captureIndices[0].end;
        if (r.captureIndices[0].end > linePos) {
          linePos = r.captureIndices[0].end;
          isFirstLine = false;
        }
      }
    } else {
      if (false) {}
      stack = whileRule.stack.pop();
      break;
    }
  }
  return { stack, linePos, anchorPosition, isFirstLine };
}
function matchRuleOrInjections(grammar, lineText, isFirstLine, linePos, stack, anchorPosition) {
  const matchResult = matchRule(grammar, lineText, isFirstLine, linePos, stack, anchorPosition);
  const injections = grammar.getInjections();
  if (injections.length === 0) {
    return matchResult;
  }
  const injectionResult = matchInjections(injections, grammar, lineText, isFirstLine, linePos, stack, anchorPosition);
  if (!injectionResult) {
    return matchResult;
  }
  if (!matchResult) {
    return injectionResult;
  }
  const matchResultScore = matchResult.captureIndices[0].start;
  const injectionResultScore = injectionResult.captureIndices[0].start;
  if (injectionResultScore < matchResultScore || injectionResult.priorityMatch && injectionResultScore === matchResultScore) {
    return injectionResult;
  }
  return matchResult;
}
function matchRule(grammar, lineText, isFirstLine, linePos, stack, anchorPosition) {
  const rule = stack.getRule(grammar);
  const { ruleScanner, findOptions } = prepareRuleSearch(rule, grammar, stack.endRule, isFirstLine, linePos === anchorPosition);
  const r = ruleScanner.findNextMatchSync(lineText, linePos, findOptions);
  if (r) {
    return {
      captureIndices: r.captureIndices,
      matchedRuleId: r.ruleId
    };
  }
  return null;
}
function matchInjections(injections, grammar, lineText, isFirstLine, linePos, stack, anchorPosition) {
  let bestMatchRating = Number.MAX_VALUE;
  let bestMatchCaptureIndices = null;
  let bestMatchRuleId;
  let bestMatchResultPriority = 0;
  const scopes = stack.contentNameScopesList.getScopeNames();
  for (let i = 0, len = injections.length;i < len; i++) {
    const injection = injections[i];
    if (!injection.matcher(scopes)) {
      continue;
    }
    const rule = grammar.getRule(injection.ruleId);
    const { ruleScanner, findOptions } = prepareRuleSearch(rule, grammar, null, isFirstLine, linePos === anchorPosition);
    const matchResult = ruleScanner.findNextMatchSync(lineText, linePos, findOptions);
    if (!matchResult) {
      continue;
    }
    if (false) {}
    const matchRating = matchResult.captureIndices[0].start;
    if (matchRating >= bestMatchRating) {
      continue;
    }
    bestMatchRating = matchRating;
    bestMatchCaptureIndices = matchResult.captureIndices;
    bestMatchRuleId = matchResult.ruleId;
    bestMatchResultPriority = injection.priority;
    if (bestMatchRating === linePos) {
      break;
    }
  }
  if (bestMatchCaptureIndices) {
    return {
      priorityMatch: bestMatchResultPriority === -1,
      captureIndices: bestMatchCaptureIndices,
      matchedRuleId: bestMatchRuleId
    };
  }
  return null;
}
function prepareRuleSearch(rule, grammar, endRegexSource, allowA, allowG) {
  if (UseOnigurumaFindOptions) {
    const ruleScanner2 = rule.compile(grammar, endRegexSource);
    const findOptions = getFindOptions(allowA, allowG);
    return { ruleScanner: ruleScanner2, findOptions };
  }
  const ruleScanner = rule.compileAG(grammar, endRegexSource, allowA, allowG);
  return { ruleScanner, findOptions: 0 };
}
function prepareRuleWhileSearch(rule, grammar, endRegexSource, allowA, allowG) {
  if (UseOnigurumaFindOptions) {
    const ruleScanner2 = rule.compileWhile(grammar, endRegexSource);
    const findOptions = getFindOptions(allowA, allowG);
    return { ruleScanner: ruleScanner2, findOptions };
  }
  const ruleScanner = rule.compileWhileAG(grammar, endRegexSource, allowA, allowG);
  return { ruleScanner, findOptions: 0 };
}
function getFindOptions(allowA, allowG) {
  let options = 0;
  if (!allowA) {
    options |= 1;
  }
  if (!allowG) {
    options |= 4;
  }
  return options;
}
function handleCaptures(grammar, lineText, isFirstLine, stack, lineTokens, captures, captureIndices) {
  if (captures.length === 0) {
    return;
  }
  const lineTextContent = lineText.content;
  const len = Math.min(captures.length, captureIndices.length);
  const localStack = [];
  const maxEnd = captureIndices[0].end;
  for (let i = 0;i < len; i++) {
    const captureRule = captures[i];
    if (captureRule === null) {
      continue;
    }
    const captureIndex = captureIndices[i];
    if (captureIndex.length === 0) {
      continue;
    }
    if (captureIndex.start > maxEnd) {
      break;
    }
    while (localStack.length > 0 && localStack[localStack.length - 1].endPos <= captureIndex.start) {
      lineTokens.produceFromScopes(localStack[localStack.length - 1].scopes, localStack[localStack.length - 1].endPos);
      localStack.pop();
    }
    if (localStack.length > 0) {
      lineTokens.produceFromScopes(localStack[localStack.length - 1].scopes, captureIndex.start);
    } else {
      lineTokens.produce(stack, captureIndex.start);
    }
    if (captureRule.retokenizeCapturedWithRuleId) {
      const scopeName = captureRule.getName(lineTextContent, captureIndices);
      const nameScopesList = stack.contentNameScopesList.pushAttributed(scopeName, grammar);
      const contentName = captureRule.getContentName(lineTextContent, captureIndices);
      const contentNameScopesList = nameScopesList.pushAttributed(contentName, grammar);
      const stackClone = stack.push(captureRule.retokenizeCapturedWithRuleId, captureIndex.start, -1, false, null, nameScopesList, contentNameScopesList);
      const onigSubStr = grammar.createOnigString(lineTextContent.substring(0, captureIndex.end));
      _tokenizeString(grammar, onigSubStr, isFirstLine && captureIndex.start === 0, captureIndex.start, stackClone, lineTokens, false, 0);
      disposeOnigString(onigSubStr);
      continue;
    }
    const captureRuleScopeName = captureRule.getName(lineTextContent, captureIndices);
    if (captureRuleScopeName !== null) {
      const base = localStack.length > 0 ? localStack[localStack.length - 1].scopes : stack.contentNameScopesList;
      const captureRuleScopesList = base.pushAttributed(captureRuleScopeName, grammar);
      localStack.push(new LocalStackElement(captureRuleScopesList, captureIndex.end));
    }
  }
  while (localStack.length > 0) {
    lineTokens.produceFromScopes(localStack[localStack.length - 1].scopes, localStack[localStack.length - 1].endPos);
    localStack.pop();
  }
}
var LocalStackElement = class {
  scopes;
  endPos;
  constructor(scopes, endPos) {
    this.scopes = scopes;
    this.endPos = endPos;
  }
};
function createGrammar(scopeName, grammar, initialLanguage, embeddedLanguages, tokenTypes, balancedBracketSelectors, grammarRepository, onigLib) {
  return new Grammar(scopeName, grammar, initialLanguage, embeddedLanguages, tokenTypes, balancedBracketSelectors, grammarRepository, onigLib);
}
function collectInjections(result, selector, rule, ruleFactoryHelper, grammar) {
  const matchers = createMatchers(selector, nameMatcher);
  const ruleId = RuleFactory.getCompiledRuleId(rule, ruleFactoryHelper, grammar.repository);
  for (const matcher of matchers) {
    result.push({
      debugSelector: selector,
      matcher: matcher.matcher,
      ruleId,
      grammar,
      priority: matcher.priority
    });
  }
}
function nameMatcher(identifers, scopes) {
  if (scopes.length < identifers.length) {
    return false;
  }
  let lastIndex = 0;
  return identifers.every((identifier) => {
    for (let i = lastIndex;i < scopes.length; i++) {
      if (scopesAreMatching(scopes[i], identifier)) {
        lastIndex = i + 1;
        return true;
      }
    }
    return false;
  });
}
function scopesAreMatching(thisScopeName, scopeName) {
  if (!thisScopeName) {
    return false;
  }
  if (thisScopeName === scopeName) {
    return true;
  }
  const len = scopeName.length;
  return thisScopeName.length > len && thisScopeName.substr(0, len) === scopeName && thisScopeName[len] === ".";
}
var Grammar = class {
  constructor(_rootScopeName, grammar, initialLanguage, embeddedLanguages, tokenTypes, balancedBracketSelectors, grammarRepository, _onigLib) {
    this._rootScopeName = _rootScopeName;
    this.balancedBracketSelectors = balancedBracketSelectors;
    this._onigLib = _onigLib;
    this._basicScopeAttributesProvider = new BasicScopeAttributesProvider(initialLanguage, embeddedLanguages);
    this._rootId = -1;
    this._lastRuleId = 0;
    this._ruleId2desc = [null];
    this._includedGrammars = {};
    this._grammarRepository = grammarRepository;
    this._grammar = initGrammar(grammar, null);
    this._injections = null;
    this._tokenTypeMatchers = [];
    if (tokenTypes) {
      for (const selector of Object.keys(tokenTypes)) {
        const matchers = createMatchers(selector, nameMatcher);
        for (const matcher of matchers) {
          this._tokenTypeMatchers.push({
            matcher: matcher.matcher,
            type: tokenTypes[selector]
          });
        }
      }
    }
  }
  _rootId;
  _lastRuleId;
  _ruleId2desc;
  _includedGrammars;
  _grammarRepository;
  _grammar;
  _injections;
  _basicScopeAttributesProvider;
  _tokenTypeMatchers;
  get themeProvider() {
    return this._grammarRepository;
  }
  dispose() {
    for (const rule of this._ruleId2desc) {
      if (rule) {
        rule.dispose();
      }
    }
  }
  createOnigScanner(sources) {
    return this._onigLib.createOnigScanner(sources);
  }
  createOnigString(sources) {
    return this._onigLib.createOnigString(sources);
  }
  getMetadataForScope(scope) {
    return this._basicScopeAttributesProvider.getBasicScopeAttributes(scope);
  }
  _collectInjections() {
    const grammarRepository = {
      lookup: (scopeName2) => {
        if (scopeName2 === this._rootScopeName) {
          return this._grammar;
        }
        return this.getExternalGrammar(scopeName2);
      },
      injections: (scopeName2) => {
        return this._grammarRepository.injections(scopeName2);
      }
    };
    const result = [];
    const scopeName = this._rootScopeName;
    const grammar = grammarRepository.lookup(scopeName);
    if (grammar) {
      const rawInjections = grammar.injections;
      if (rawInjections) {
        for (let expression in rawInjections) {
          collectInjections(result, expression, rawInjections[expression], this, grammar);
        }
      }
      const injectionScopeNames = this._grammarRepository.injections(scopeName);
      if (injectionScopeNames) {
        injectionScopeNames.forEach((injectionScopeName) => {
          const injectionGrammar = this.getExternalGrammar(injectionScopeName);
          if (injectionGrammar) {
            const selector = injectionGrammar.injectionSelector;
            if (selector) {
              collectInjections(result, selector, injectionGrammar, this, injectionGrammar);
            }
          }
        });
      }
    }
    result.sort((i1, i2) => i1.priority - i2.priority);
    return result;
  }
  getInjections() {
    if (this._injections === null) {
      this._injections = this._collectInjections();
    }
    return this._injections;
  }
  registerRule(factory) {
    const id = ++this._lastRuleId;
    const result = factory(ruleIdFromNumber(id));
    this._ruleId2desc[id] = result;
    return result;
  }
  getRule(ruleId) {
    return this._ruleId2desc[ruleIdToNumber(ruleId)];
  }
  getExternalGrammar(scopeName, repository) {
    if (this._includedGrammars[scopeName]) {
      return this._includedGrammars[scopeName];
    } else if (this._grammarRepository) {
      const rawIncludedGrammar = this._grammarRepository.lookup(scopeName);
      if (rawIncludedGrammar) {
        this._includedGrammars[scopeName] = initGrammar(rawIncludedGrammar, repository && repository.$base);
        return this._includedGrammars[scopeName];
      }
    }
    return;
  }
  tokenizeLine(lineText, prevState, timeLimit = 0) {
    const r = this._tokenize(lineText, prevState, false, timeLimit);
    return {
      tokens: r.lineTokens.getResult(r.ruleStack, r.lineLength),
      ruleStack: r.ruleStack,
      stoppedEarly: r.stoppedEarly
    };
  }
  tokenizeLine2(lineText, prevState, timeLimit = 0) {
    const r = this._tokenize(lineText, prevState, true, timeLimit);
    return {
      tokens: r.lineTokens.getBinaryResult(r.ruleStack, r.lineLength),
      ruleStack: r.ruleStack,
      stoppedEarly: r.stoppedEarly
    };
  }
  _tokenize(lineText, prevState, emitBinaryTokens, timeLimit) {
    if (this._rootId === -1) {
      this._rootId = RuleFactory.getCompiledRuleId(this._grammar.repository.$self, this, this._grammar.repository);
      this.getInjections();
    }
    let isFirstLine;
    if (!prevState || prevState === StateStackImpl.NULL) {
      isFirstLine = true;
      const rawDefaultMetadata = this._basicScopeAttributesProvider.getDefaultAttributes();
      const defaultStyle = this.themeProvider.getDefaults();
      const defaultMetadata = EncodedTokenMetadata.set(0, rawDefaultMetadata.languageId, rawDefaultMetadata.tokenType, null, defaultStyle.fontStyle, defaultStyle.foregroundId, defaultStyle.backgroundId);
      const rootScopeName = this.getRule(this._rootId).getName(null, null);
      let scopeList;
      if (rootScopeName) {
        scopeList = AttributedScopeStack.createRootAndLookUpScopeName(rootScopeName, defaultMetadata, this);
      } else {
        scopeList = AttributedScopeStack.createRoot("unknown", defaultMetadata);
      }
      prevState = new StateStackImpl(null, this._rootId, -1, -1, false, null, scopeList, scopeList);
    } else {
      isFirstLine = false;
      prevState.reset();
    }
    lineText = lineText + `
`;
    const onigLineText = this.createOnigString(lineText);
    const lineLength = onigLineText.content.length;
    const lineTokens = new LineTokens(emitBinaryTokens, lineText, this._tokenTypeMatchers, this.balancedBracketSelectors);
    const r = _tokenizeString(this, onigLineText, isFirstLine, 0, prevState, lineTokens, true, timeLimit);
    disposeOnigString(onigLineText);
    return {
      lineLength,
      lineTokens,
      ruleStack: r.stack,
      stoppedEarly: r.stoppedEarly
    };
  }
};
function initGrammar(grammar, base) {
  grammar = clone(grammar);
  grammar.repository = grammar.repository || {};
  grammar.repository.$self = {
    $vscodeTextmateLocation: grammar.$vscodeTextmateLocation,
    patterns: grammar.patterns,
    name: grammar.scopeName
  };
  grammar.repository.$base = base || grammar.repository.$self;
  return grammar;
}
var AttributedScopeStack = class _AttributedScopeStack {
  constructor(parent, scopePath, tokenAttributes) {
    this.parent = parent;
    this.scopePath = scopePath;
    this.tokenAttributes = tokenAttributes;
  }
  static fromExtension(namesScopeList, contentNameScopesList) {
    let current = namesScopeList;
    let scopeNames = namesScopeList?.scopePath ?? null;
    for (const frame of contentNameScopesList) {
      scopeNames = ScopeStack.push(scopeNames, frame.scopeNames);
      current = new _AttributedScopeStack(current, scopeNames, frame.encodedTokenAttributes);
    }
    return current;
  }
  static createRoot(scopeName, tokenAttributes) {
    return new _AttributedScopeStack(null, new ScopeStack(null, scopeName), tokenAttributes);
  }
  static createRootAndLookUpScopeName(scopeName, tokenAttributes, grammar) {
    const rawRootMetadata = grammar.getMetadataForScope(scopeName);
    const scopePath = new ScopeStack(null, scopeName);
    const rootStyle = grammar.themeProvider.themeMatch(scopePath);
    const resolvedTokenAttributes = _AttributedScopeStack.mergeAttributes(tokenAttributes, rawRootMetadata, rootStyle);
    return new _AttributedScopeStack(null, scopePath, resolvedTokenAttributes);
  }
  get scopeName() {
    return this.scopePath.scopeName;
  }
  toString() {
    return this.getScopeNames().join(" ");
  }
  equals(other) {
    return _AttributedScopeStack.equals(this, other);
  }
  static equals(a, b) {
    do {
      if (a === b) {
        return true;
      }
      if (!a && !b) {
        return true;
      }
      if (!a || !b) {
        return false;
      }
      if (a.scopeName !== b.scopeName || a.tokenAttributes !== b.tokenAttributes) {
        return false;
      }
      a = a.parent;
      b = b.parent;
    } while (true);
  }
  static mergeAttributes(existingTokenAttributes, basicScopeAttributes, styleAttributes) {
    let fontStyle = -1;
    let foreground = 0;
    let background = 0;
    if (styleAttributes !== null) {
      fontStyle = styleAttributes.fontStyle;
      foreground = styleAttributes.foregroundId;
      background = styleAttributes.backgroundId;
    }
    return EncodedTokenMetadata.set(existingTokenAttributes, basicScopeAttributes.languageId, basicScopeAttributes.tokenType, null, fontStyle, foreground, background);
  }
  pushAttributed(scopePath, grammar) {
    if (scopePath === null) {
      return this;
    }
    if (scopePath.indexOf(" ") === -1) {
      return _AttributedScopeStack._pushAttributed(this, scopePath, grammar);
    }
    const scopes = scopePath.split(/ /g);
    let result = this;
    for (const scope of scopes) {
      result = _AttributedScopeStack._pushAttributed(result, scope, grammar);
    }
    return result;
  }
  static _pushAttributed(target, scopeName, grammar) {
    const rawMetadata = grammar.getMetadataForScope(scopeName);
    const newPath = target.scopePath.push(scopeName);
    const scopeThemeMatchResult = grammar.themeProvider.themeMatch(newPath);
    const metadata = _AttributedScopeStack.mergeAttributes(target.tokenAttributes, rawMetadata, scopeThemeMatchResult);
    return new _AttributedScopeStack(target, newPath, metadata);
  }
  getScopeNames() {
    return this.scopePath.getSegments();
  }
  getExtensionIfDefined(base) {
    const result = [];
    let self = this;
    while (self && self !== base) {
      result.push({
        encodedTokenAttributes: self.tokenAttributes,
        scopeNames: self.scopePath.getExtensionIfDefined(self.parent?.scopePath ?? null)
      });
      self = self.parent;
    }
    return self === base ? result.reverse() : undefined;
  }
};
var StateStackImpl = class _StateStackImpl {
  constructor(parent, ruleId, enterPos, anchorPos, beginRuleCapturedEOL, endRule, nameScopesList, contentNameScopesList) {
    this.parent = parent;
    this.ruleId = ruleId;
    this.beginRuleCapturedEOL = beginRuleCapturedEOL;
    this.endRule = endRule;
    this.nameScopesList = nameScopesList;
    this.contentNameScopesList = contentNameScopesList;
    this.depth = this.parent ? this.parent.depth + 1 : 1;
    this._enterPos = enterPos;
    this._anchorPos = anchorPos;
  }
  _stackElementBrand = undefined;
  static NULL = new _StateStackImpl(null, 0, 0, 0, false, null, null, null);
  _enterPos;
  _anchorPos;
  depth;
  equals(other) {
    if (other === null) {
      return false;
    }
    return _StateStackImpl._equals(this, other);
  }
  static _equals(a, b) {
    if (a === b) {
      return true;
    }
    if (!this._structuralEquals(a, b)) {
      return false;
    }
    return AttributedScopeStack.equals(a.contentNameScopesList, b.contentNameScopesList);
  }
  static _structuralEquals(a, b) {
    do {
      if (a === b) {
        return true;
      }
      if (!a && !b) {
        return true;
      }
      if (!a || !b) {
        return false;
      }
      if (a.depth !== b.depth || a.ruleId !== b.ruleId || a.endRule !== b.endRule) {
        return false;
      }
      a = a.parent;
      b = b.parent;
    } while (true);
  }
  clone() {
    return this;
  }
  static _reset(el) {
    while (el) {
      el._enterPos = -1;
      el._anchorPos = -1;
      el = el.parent;
    }
  }
  reset() {
    _StateStackImpl._reset(this);
  }
  pop() {
    return this.parent;
  }
  safePop() {
    if (this.parent) {
      return this.parent;
    }
    return this;
  }
  push(ruleId, enterPos, anchorPos, beginRuleCapturedEOL, endRule, nameScopesList, contentNameScopesList) {
    return new _StateStackImpl(this, ruleId, enterPos, anchorPos, beginRuleCapturedEOL, endRule, nameScopesList, contentNameScopesList);
  }
  getEnterPos() {
    return this._enterPos;
  }
  getAnchorPos() {
    return this._anchorPos;
  }
  getRule(grammar) {
    return grammar.getRule(this.ruleId);
  }
  toString() {
    const r = [];
    this._writeString(r, 0);
    return "[" + r.join(",") + "]";
  }
  _writeString(res, outIndex) {
    if (this.parent) {
      outIndex = this.parent._writeString(res, outIndex);
    }
    res[outIndex++] = `(${this.ruleId}, ${this.nameScopesList?.toString()}, ${this.contentNameScopesList?.toString()})`;
    return outIndex;
  }
  withContentNameScopesList(contentNameScopeStack) {
    if (this.contentNameScopesList === contentNameScopeStack) {
      return this;
    }
    return this.parent.push(this.ruleId, this._enterPos, this._anchorPos, this.beginRuleCapturedEOL, this.endRule, this.nameScopesList, contentNameScopeStack);
  }
  withEndRule(endRule) {
    if (this.endRule === endRule) {
      return this;
    }
    return new _StateStackImpl(this.parent, this.ruleId, this._enterPos, this._anchorPos, this.beginRuleCapturedEOL, endRule, this.nameScopesList, this.contentNameScopesList);
  }
  hasSameRuleAs(other) {
    let el = this;
    while (el && el._enterPos === other._enterPos) {
      if (el.ruleId === other.ruleId) {
        return true;
      }
      el = el.parent;
    }
    return false;
  }
  toStateStackFrame() {
    return {
      ruleId: ruleIdToNumber(this.ruleId),
      beginRuleCapturedEOL: this.beginRuleCapturedEOL,
      endRule: this.endRule,
      nameScopesList: this.nameScopesList?.getExtensionIfDefined(this.parent?.nameScopesList ?? null) ?? [],
      contentNameScopesList: this.contentNameScopesList?.getExtensionIfDefined(this.nameScopesList) ?? []
    };
  }
  static pushFrame(self, frame) {
    const namesScopeList = AttributedScopeStack.fromExtension(self?.nameScopesList ?? null, frame.nameScopesList);
    return new _StateStackImpl(self, ruleIdFromNumber(frame.ruleId), frame.enterPos ?? -1, frame.anchorPos ?? -1, frame.beginRuleCapturedEOL, frame.endRule, namesScopeList, AttributedScopeStack.fromExtension(namesScopeList, frame.contentNameScopesList));
  }
};
var BalancedBracketSelectors = class {
  balancedBracketScopes;
  unbalancedBracketScopes;
  allowAny = false;
  constructor(balancedBracketScopes, unbalancedBracketScopes) {
    this.balancedBracketScopes = balancedBracketScopes.flatMap((selector) => {
      if (selector === "*") {
        this.allowAny = true;
        return [];
      }
      return createMatchers(selector, nameMatcher).map((m) => m.matcher);
    });
    this.unbalancedBracketScopes = unbalancedBracketScopes.flatMap((selector) => createMatchers(selector, nameMatcher).map((m) => m.matcher));
  }
  get matchesAlways() {
    return this.allowAny && this.unbalancedBracketScopes.length === 0;
  }
  get matchesNever() {
    return this.balancedBracketScopes.length === 0 && !this.allowAny;
  }
  match(scopes) {
    for (const excluder of this.unbalancedBracketScopes) {
      if (excluder(scopes)) {
        return false;
      }
    }
    for (const includer of this.balancedBracketScopes) {
      if (includer(scopes)) {
        return true;
      }
    }
    return this.allowAny;
  }
};
var LineTokens = class {
  constructor(emitBinaryTokens, lineText, tokenTypeOverrides, balancedBracketSelectors) {
    this.balancedBracketSelectors = balancedBracketSelectors;
    this._emitBinaryTokens = emitBinaryTokens;
    this._tokenTypeOverrides = tokenTypeOverrides;
    if (false) {} else {
      this._lineText = null;
    }
    this._tokens = [];
    this._binaryTokens = [];
    this._lastTokenEndIndex = 0;
  }
  _emitBinaryTokens;
  _lineText;
  _tokens;
  _binaryTokens;
  _lastTokenEndIndex;
  _tokenTypeOverrides;
  produce(stack, endIndex) {
    this.produceFromScopes(stack.contentNameScopesList, endIndex);
  }
  produceFromScopes(scopesList, endIndex) {
    if (this._lastTokenEndIndex >= endIndex) {
      return;
    }
    if (this._emitBinaryTokens) {
      let metadata = scopesList?.tokenAttributes ?? 0;
      let containsBalancedBrackets = false;
      if (this.balancedBracketSelectors?.matchesAlways) {
        containsBalancedBrackets = true;
      }
      if (this._tokenTypeOverrides.length > 0 || this.balancedBracketSelectors && !this.balancedBracketSelectors.matchesAlways && !this.balancedBracketSelectors.matchesNever) {
        const scopes2 = scopesList?.getScopeNames() ?? [];
        for (const tokenType of this._tokenTypeOverrides) {
          if (tokenType.matcher(scopes2)) {
            metadata = EncodedTokenMetadata.set(metadata, 0, toOptionalTokenType(tokenType.type), null, -1, 0, 0);
          }
        }
        if (this.balancedBracketSelectors) {
          containsBalancedBrackets = this.balancedBracketSelectors.match(scopes2);
        }
      }
      if (containsBalancedBrackets) {
        metadata = EncodedTokenMetadata.set(metadata, 0, 8, containsBalancedBrackets, -1, 0, 0);
      }
      if (this._binaryTokens.length > 0 && this._binaryTokens[this._binaryTokens.length - 1] === metadata) {
        this._lastTokenEndIndex = endIndex;
        return;
      }
      this._binaryTokens.push(this._lastTokenEndIndex);
      this._binaryTokens.push(metadata);
      this._lastTokenEndIndex = endIndex;
      return;
    }
    const scopes = scopesList?.getScopeNames() ?? [];
    this._tokens.push({
      startIndex: this._lastTokenEndIndex,
      endIndex,
      scopes
    });
    this._lastTokenEndIndex = endIndex;
  }
  getResult(stack, lineLength) {
    if (this._tokens.length > 0 && this._tokens[this._tokens.length - 1].startIndex === lineLength - 1) {
      this._tokens.pop();
    }
    if (this._tokens.length === 0) {
      this._lastTokenEndIndex = -1;
      this.produce(stack, lineLength);
      this._tokens[this._tokens.length - 1].startIndex = 0;
    }
    return this._tokens;
  }
  getBinaryResult(stack, lineLength) {
    if (this._binaryTokens.length > 0 && this._binaryTokens[this._binaryTokens.length - 2] === lineLength - 1) {
      this._binaryTokens.pop();
      this._binaryTokens.pop();
    }
    if (this._binaryTokens.length === 0) {
      this._lastTokenEndIndex = -1;
      this.produce(stack, lineLength);
      this._binaryTokens[this._binaryTokens.length - 2] = 0;
    }
    const result = new Uint32Array(this._binaryTokens.length);
    for (let i = 0, len = this._binaryTokens.length;i < len; i++) {
      result[i] = this._binaryTokens[i];
    }
    return result;
  }
};
var SyncRegistry = class {
  constructor(theme, _onigLib) {
    this._onigLib = _onigLib;
    this._theme = theme;
  }
  _grammars = /* @__PURE__ */ new Map;
  _rawGrammars = /* @__PURE__ */ new Map;
  _injectionGrammars = /* @__PURE__ */ new Map;
  _theme;
  dispose() {
    for (const grammar of this._grammars.values()) {
      grammar.dispose();
    }
  }
  setTheme(theme) {
    this._theme = theme;
  }
  getColorMap() {
    return this._theme.getColorMap();
  }
  addGrammar(grammar, injectionScopeNames) {
    this._rawGrammars.set(grammar.scopeName, grammar);
    if (injectionScopeNames) {
      this._injectionGrammars.set(grammar.scopeName, injectionScopeNames);
    }
  }
  lookup(scopeName) {
    return this._rawGrammars.get(scopeName);
  }
  injections(targetScope) {
    return this._injectionGrammars.get(targetScope);
  }
  getDefaults() {
    return this._theme.getDefaults();
  }
  themeMatch(scopePath) {
    return this._theme.match(scopePath);
  }
  grammarForScopeName(scopeName, initialLanguage, embeddedLanguages, tokenTypes, balancedBracketSelectors) {
    if (!this._grammars.has(scopeName)) {
      let rawGrammar = this._rawGrammars.get(scopeName);
      if (!rawGrammar) {
        return null;
      }
      this._grammars.set(scopeName, createGrammar(scopeName, rawGrammar, initialLanguage, embeddedLanguages, tokenTypes, balancedBracketSelectors, this, this._onigLib));
    }
    return this._grammars.get(scopeName);
  }
};
var Registry = class {
  _options;
  _syncRegistry;
  _ensureGrammarCache;
  constructor(options) {
    this._options = options;
    this._syncRegistry = new SyncRegistry(Theme.createFromRawTheme(options.theme, options.colorMap), options.onigLib);
    this._ensureGrammarCache = /* @__PURE__ */ new Map;
  }
  dispose() {
    this._syncRegistry.dispose();
  }
  setTheme(theme, colorMap) {
    this._syncRegistry.setTheme(Theme.createFromRawTheme(theme, colorMap));
  }
  getColorMap() {
    return this._syncRegistry.getColorMap();
  }
  loadGrammarWithEmbeddedLanguages(initialScopeName, initialLanguage, embeddedLanguages) {
    return this.loadGrammarWithConfiguration(initialScopeName, initialLanguage, { embeddedLanguages });
  }
  loadGrammarWithConfiguration(initialScopeName, initialLanguage, configuration) {
    return this._loadGrammar(initialScopeName, initialLanguage, configuration.embeddedLanguages, configuration.tokenTypes, new BalancedBracketSelectors(configuration.balancedBracketSelectors || [], configuration.unbalancedBracketSelectors || []));
  }
  loadGrammar(initialScopeName) {
    return this._loadGrammar(initialScopeName, 0, null, null, null);
  }
  _loadGrammar(initialScopeName, initialLanguage, embeddedLanguages, tokenTypes, balancedBracketSelectors) {
    const dependencyProcessor = new ScopeDependencyProcessor(this._syncRegistry, initialScopeName);
    while (dependencyProcessor.Q.length > 0) {
      dependencyProcessor.Q.map((request) => this._loadSingleGrammar(request.scopeName));
      dependencyProcessor.processQueue();
    }
    return this._grammarForScopeName(initialScopeName, initialLanguage, embeddedLanguages, tokenTypes, balancedBracketSelectors);
  }
  _loadSingleGrammar(scopeName) {
    if (!this._ensureGrammarCache.has(scopeName)) {
      this._doLoadSingleGrammar(scopeName);
      this._ensureGrammarCache.set(scopeName, true);
    }
  }
  _doLoadSingleGrammar(scopeName) {
    const grammar = this._options.loadGrammar(scopeName);
    if (grammar) {
      const injections = typeof this._options.getInjections === "function" ? this._options.getInjections(scopeName) : undefined;
      this._syncRegistry.addGrammar(grammar, injections);
    }
  }
  addGrammar(rawGrammar, injections = [], initialLanguage = 0, embeddedLanguages = null) {
    this._syncRegistry.addGrammar(rawGrammar, injections);
    return this._grammarForScopeName(rawGrammar.scopeName, initialLanguage, embeddedLanguages);
  }
  _grammarForScopeName(scopeName, initialLanguage = 0, embeddedLanguages = null, tokenTypes = null, balancedBracketSelectors = null) {
    return this._syncRegistry.grammarForScopeName(scopeName, initialLanguage, embeddedLanguages, tokenTypes, balancedBracketSelectors);
  }
};
var INITIAL = StateStackImpl.NULL;

// node_modules/@shikijs/primitive/dist/index.mjs
function resolveColorReplacements(theme, options) {
  const replacements = typeof theme === "string" ? {} : { ...theme.colorReplacements };
  const themeName = typeof theme === "string" ? theme : theme.name;
  for (const [key, value] of Object.entries(options?.colorReplacements || {}))
    if (typeof value === "string")
      replacements[key] = value;
    else if (key === themeName)
      Object.assign(replacements, value);
  return replacements;
}
function applyColorReplacements(color, replacements) {
  if (!color)
    return color;
  return replacements?.[color?.toLowerCase()] || color;
}
function toArray(x) {
  return Array.isArray(x) ? x : [x];
}
async function normalizeGetter(p) {
  return Promise.resolve(typeof p === "function" ? p() : p).then((r) => r.default || r);
}
function isPlainLang(lang) {
  return !lang || [
    "plaintext",
    "txt",
    "text",
    "plain"
  ].includes(lang);
}
function isSpecialLang(lang) {
  return lang === "ansi" || isPlainLang(lang);
}
function isNoneTheme(theme) {
  return theme === "none";
}
function isSpecialTheme(theme) {
  return isNoneTheme(theme);
}
var RE_NEWLINE = /(\r?\n)/g;
function splitLines(code, preserveEnding = false) {
  if (code.length === 0)
    return [["", 0]];
  const parts = code.split(RE_NEWLINE);
  let index = 0;
  const lines = [];
  for (let i = 0;i < parts.length; i += 2) {
    const line = preserveEnding ? parts[i] + (parts[i + 1] || "") : parts[i];
    lines.push([line, index]);
    index += parts[i].length;
    index += parts[i + 1]?.length || 0;
  }
  return lines;
}
var VSCODE_FALLBACK_EDITOR_FG = {
  light: "#333333",
  dark: "#bbbbbb"
};
var VSCODE_FALLBACK_EDITOR_BG = {
  light: "#fffffe",
  dark: "#1e1e1e"
};
var RESOLVED_KEY = "__shiki_resolved";
function normalizeTheme(rawTheme) {
  if (rawTheme?.[RESOLVED_KEY])
    return rawTheme;
  const theme = { ...rawTheme };
  if (theme.tokenColors && !theme.settings) {
    theme.settings = theme.tokenColors;
    delete theme.tokenColors;
  }
  theme.type ||= "dark";
  theme.colorReplacements = { ...theme.colorReplacements };
  theme.settings ||= [];
  let { bg, fg } = theme;
  if (!bg || !fg) {
    const globalSetting = theme.settings ? theme.settings.find((s) => !s.name && !s.scope) : undefined;
    if (globalSetting?.settings?.foreground)
      fg = globalSetting.settings.foreground;
    if (globalSetting?.settings?.background)
      bg = globalSetting.settings.background;
    if (!fg && theme?.colors?.["editor.foreground"])
      fg = theme.colors["editor.foreground"];
    if (!bg && theme?.colors?.["editor.background"])
      bg = theme.colors["editor.background"];
    if (!fg)
      fg = theme.type === "light" ? VSCODE_FALLBACK_EDITOR_FG.light : VSCODE_FALLBACK_EDITOR_FG.dark;
    if (!bg)
      bg = theme.type === "light" ? VSCODE_FALLBACK_EDITOR_BG.light : VSCODE_FALLBACK_EDITOR_BG.dark;
    theme.fg = fg;
    theme.bg = bg;
  }
  if (!(theme.settings[0] && theme.settings[0].settings && !theme.settings[0].scope))
    theme.settings.unshift({ settings: {
      foreground: theme.fg,
      background: theme.bg
    } });
  let replacementCount = 0;
  const replacementMap = /* @__PURE__ */ new Map;
  function getReplacementColor(value) {
    if (replacementMap.has(value))
      return replacementMap.get(value);
    replacementCount += 1;
    const hex = `#${replacementCount.toString(16).padStart(8, "0").toLowerCase()}`;
    if (theme.colorReplacements?.[`#${hex}`])
      return getReplacementColor(value);
    replacementMap.set(value, hex);
    return hex;
  }
  theme.settings = theme.settings.map((setting) => {
    const replaceFg = setting.settings?.foreground && !setting.settings.foreground.startsWith("#");
    const replaceBg = setting.settings?.background && !setting.settings.background.startsWith("#");
    if (!replaceFg && !replaceBg)
      return setting;
    const clone2 = {
      ...setting,
      settings: { ...setting.settings }
    };
    if (replaceFg) {
      const replacement = getReplacementColor(setting.settings.foreground);
      theme.colorReplacements[replacement] = setting.settings.foreground;
      clone2.settings.foreground = replacement;
    }
    if (replaceBg) {
      const replacement = getReplacementColor(setting.settings.background);
      theme.colorReplacements[replacement] = setting.settings.background;
      clone2.settings.background = replacement;
    }
    return clone2;
  });
  for (const key of Object.keys(theme.colors || {}))
    if (key === "editor.foreground" || key === "editor.background" || key.startsWith("terminal.ansi")) {
      if (!theme.colors[key]?.startsWith("#")) {
        const replacement = getReplacementColor(theme.colors[key]);
        theme.colorReplacements[replacement] = theme.colors[key];
        theme.colors[key] = replacement;
      }
    }
  Object.defineProperty(theme, RESOLVED_KEY, {
    enumerable: false,
    writable: false,
    value: true
  });
  return theme;
}
async function resolveLangs(langs) {
  return [...new Set((await Promise.all(langs.filter((l) => !isSpecialLang(l)).map(async (lang) => await normalizeGetter(lang).then((r) => Array.isArray(r) ? r : [r])))).flat())];
}
async function resolveThemes(themes) {
  return (await Promise.all(themes.map(async (theme) => isSpecialTheme(theme) ? null : normalizeTheme(await normalizeGetter(theme))))).filter((i) => !!i);
}
function resolveLangAlias(name, alias) {
  if (!alias)
    return name;
  if (alias[name]) {
    const resolved = new Set([name]);
    while (alias[name]) {
      name = alias[name];
      if (resolved.has(name))
        throw new ShikiError(`Circular alias \`${[...resolved].join(" -> ")} -> ${name}\``);
      resolved.add(name);
    }
  }
  return name;
}
var Registry2 = class extends Registry {
  _resolver;
  _themes;
  _langs;
  _alias;
  _resolvedThemes = /* @__PURE__ */ new Map;
  _resolvedGrammars = /* @__PURE__ */ new Map;
  _langMap = /* @__PURE__ */ new Map;
  _langGraph = /* @__PURE__ */ new Map;
  _textmateThemeCache = /* @__PURE__ */ new WeakMap;
  _loadedThemesCache = null;
  _loadedLanguagesCache = null;
  constructor(_resolver, _themes, _langs, _alias = {}) {
    super(_resolver);
    this._resolver = _resolver;
    this._themes = _themes;
    this._langs = _langs;
    this._alias = _alias;
    this._themes.map((t) => this.loadTheme(t));
    this.loadLanguages(this._langs);
  }
  getTheme(theme) {
    if (typeof theme === "string")
      return this._resolvedThemes.get(theme);
    else
      return this.loadTheme(theme);
  }
  loadTheme(theme) {
    const _theme = normalizeTheme(theme);
    if (_theme.name) {
      this._resolvedThemes.set(_theme.name, _theme);
      this._loadedThemesCache = null;
    }
    return _theme;
  }
  getLoadedThemes() {
    if (!this._loadedThemesCache)
      this._loadedThemesCache = [...this._resolvedThemes.keys()];
    return this._loadedThemesCache;
  }
  setTheme(theme) {
    let textmateTheme = this._textmateThemeCache.get(theme);
    if (!textmateTheme) {
      textmateTheme = Theme.createFromRawTheme(theme);
      this._textmateThemeCache.set(theme, textmateTheme);
    }
    this._syncRegistry.setTheme(textmateTheme);
  }
  getGrammar(name) {
    name = resolveLangAlias(name, this._alias);
    return this._resolvedGrammars.get(name);
  }
  loadLanguage(lang) {
    if (this.getGrammar(lang.name))
      return;
    const embeddedLazilyBy = new Set([...this._langMap.values()].filter((i) => i.embeddedLangsLazy?.includes(lang.name)));
    this._resolver.addLanguage(lang);
    const grammarConfig = {
      balancedBracketSelectors: lang.balancedBracketSelectors || ["*"],
      unbalancedBracketSelectors: lang.unbalancedBracketSelectors || []
    };
    this._syncRegistry._rawGrammars.set(lang.scopeName, lang);
    const g = this.loadGrammarWithConfiguration(lang.scopeName, 1, grammarConfig);
    g.name = lang.name;
    this._resolvedGrammars.set(lang.name, g);
    if (lang.aliases)
      lang.aliases.forEach((alias) => {
        this._alias[alias] = lang.name;
      });
    this._loadedLanguagesCache = null;
    if (embeddedLazilyBy.size)
      for (const e of embeddedLazilyBy) {
        this._resolvedGrammars.delete(e.name);
        this._loadedLanguagesCache = null;
        this._syncRegistry?._injectionGrammars?.delete(e.scopeName);
        this._syncRegistry?._grammars?.delete(e.scopeName);
        this.loadLanguage(this._langMap.get(e.name));
      }
  }
  dispose() {
    super.dispose();
    this._resolvedThemes.clear();
    this._resolvedGrammars.clear();
    this._langMap.clear();
    this._langGraph.clear();
    this._loadedThemesCache = null;
  }
  loadLanguages(langs) {
    for (const lang of langs)
      this.resolveEmbeddedLanguages(lang);
    const langsGraphArray = [...this._langGraph.entries()];
    const missingLangs = langsGraphArray.filter(([_, lang]) => !lang);
    if (missingLangs.length) {
      const dependents = langsGraphArray.filter(([_, lang]) => {
        if (!lang)
          return false;
        return (lang.embeddedLanguages || lang.embeddedLangs)?.some((l) => missingLangs.map(([name]) => name).includes(l));
      }).filter((lang) => !missingLangs.includes(lang));
      throw new ShikiError(`Missing languages ${missingLangs.map(([name]) => `\`${name}\``).join(", ")}, required by ${dependents.map(([name]) => `\`${name}\``).join(", ")}`);
    }
    for (const [_, lang] of langsGraphArray)
      this._resolver.addLanguage(lang);
    for (const [_, lang] of langsGraphArray)
      this.loadLanguage(lang);
  }
  getLoadedLanguages() {
    if (!this._loadedLanguagesCache)
      this._loadedLanguagesCache = [...new Set([...this._resolvedGrammars.keys(), ...Object.keys(this._alias)])];
    return this._loadedLanguagesCache;
  }
  resolveEmbeddedLanguages(lang) {
    this._langMap.set(lang.name, lang);
    this._langGraph.set(lang.name, lang);
    const embedded = lang.embeddedLanguages ?? lang.embeddedLangs;
    if (embedded)
      for (const embeddedLang of embedded)
        this._langGraph.set(embeddedLang, this._langMap.get(embeddedLang));
  }
};
var Resolver = class {
  _langs = /* @__PURE__ */ new Map;
  _scopeToLang = /* @__PURE__ */ new Map;
  _injections = /* @__PURE__ */ new Map;
  _onigLib;
  constructor(engine, langs) {
    this._onigLib = {
      createOnigScanner: (patterns) => engine.createScanner(patterns),
      createOnigString: (s) => engine.createString(s)
    };
    langs.forEach((i) => this.addLanguage(i));
  }
  get onigLib() {
    return this._onigLib;
  }
  getLangRegistration(langIdOrAlias) {
    return this._langs.get(langIdOrAlias);
  }
  loadGrammar(scopeName) {
    return this._scopeToLang.get(scopeName);
  }
  addLanguage(l) {
    this._langs.set(l.name, l);
    if (l.aliases)
      l.aliases.forEach((a) => {
        this._langs.set(a, l);
      });
    this._scopeToLang.set(l.scopeName, l);
    if (l.injectTo)
      l.injectTo.forEach((i) => {
        if (!this._injections.get(i))
          this._injections.set(i, []);
        this._injections.get(i).push(l.scopeName);
      });
  }
  getInjections(scopeName) {
    const scopeParts = scopeName.split(".");
    let injections = [];
    for (let i = 1;i <= scopeParts.length; i++) {
      const subScopeName = scopeParts.slice(0, i).join(".");
      injections = [...injections, ...this._injections.get(subScopeName) || []];
    }
    return injections;
  }
};
var instancesCount = 0;
function createShikiPrimitive(options) {
  instancesCount += 1;
  if (options.warnings !== false && instancesCount >= 10 && instancesCount % 10 === 0)
    console.warn(`[Shiki] ${instancesCount} instances have been created. Shiki is supposed to be used as a singleton, consider refactoring your code to cache your highlighter instance; Or call \`highlighter.dispose()\` to release unused instances.`);
  let isDisposed = false;
  if (!options.engine)
    throw new ShikiError("`engine` option is required for synchronous mode");
  const langs = (options.langs || []).flat(1);
  const themes = (options.themes || []).flat(1).map(normalizeTheme);
  const _registry = new Registry2(new Resolver(options.engine, langs), themes, langs, options.langAlias);
  let _lastTheme;
  function resolveLangAlias$1(name) {
    return resolveLangAlias(name, options.langAlias);
  }
  function getLanguage(name) {
    ensureNotDisposed();
    const _lang = _registry.getGrammar(typeof name === "string" ? name : name.name);
    if (!_lang)
      throw new ShikiError(`Language \`${name}\` not found, you may need to load it first`);
    return _lang;
  }
  function getTheme(name) {
    if (name === "none")
      return {
        bg: "",
        fg: "",
        name: "none",
        settings: [],
        type: "dark"
      };
    ensureNotDisposed();
    const _theme = _registry.getTheme(name);
    if (!_theme)
      throw new ShikiError(`Theme \`${name}\` not found, you may need to load it first`);
    return _theme;
  }
  function setTheme(name) {
    ensureNotDisposed();
    const theme = getTheme(name);
    if (_lastTheme !== name) {
      _registry.setTheme(theme);
      _lastTheme = name;
    }
    return {
      theme,
      colorMap: _registry.getColorMap()
    };
  }
  function getLoadedThemes() {
    ensureNotDisposed();
    return _registry.getLoadedThemes();
  }
  function getLoadedLanguages() {
    ensureNotDisposed();
    return _registry.getLoadedLanguages();
  }
  function loadLanguageSync(...langs2) {
    ensureNotDisposed();
    _registry.loadLanguages(langs2.flat(1));
  }
  async function loadLanguage(...langs2) {
    return loadLanguageSync(await resolveLangs(langs2));
  }
  function loadThemeSync(...themes2) {
    ensureNotDisposed();
    for (const theme of themes2.flat(1))
      _registry.loadTheme(theme);
  }
  async function loadTheme(...themes2) {
    ensureNotDisposed();
    return loadThemeSync(await resolveThemes(themes2));
  }
  function ensureNotDisposed() {
    if (isDisposed)
      throw new ShikiError("Shiki instance has been disposed");
  }
  function dispose() {
    if (isDisposed)
      return;
    isDisposed = true;
    _registry.dispose();
    instancesCount -= 1;
  }
  return {
    setTheme,
    getTheme,
    getLanguage,
    getLoadedThemes,
    getLoadedLanguages,
    resolveLangAlias: resolveLangAlias$1,
    loadLanguage,
    loadLanguageSync,
    loadTheme,
    loadThemeSync,
    dispose,
    [Symbol.dispose]: dispose
  };
}
var createShikiInternalSync = createShikiPrimitive;
async function createShikiPrimitiveAsync(options) {
  if (!options.engine)
    console.warn("`engine` option is required. Use `createOnigurumaEngine` or `createJavaScriptRegexEngine` to create an engine.");
  const [themes, langs, engine] = await Promise.all([
    resolveThemes(options.themes || []),
    resolveLangs(options.langs || []),
    options.engine
  ]);
  return createShikiPrimitive({
    ...options,
    themes,
    langs,
    engine
  });
}
var createShikiInternal = createShikiPrimitiveAsync;
var _grammarStateMap = /* @__PURE__ */ new WeakMap;
function setLastGrammarStateToMap(keys, state) {
  _grammarStateMap.set(keys, state);
}
function getLastGrammarStateFromMap(keys) {
  return _grammarStateMap.get(keys);
}
var GrammarState = class GrammarState2 {
  _stacks = {};
  lang;
  get themes() {
    return Object.keys(this._stacks);
  }
  get theme() {
    return this.themes[0];
  }
  get _stack() {
    return this._stacks[this.theme];
  }
  static initial(lang, themes) {
    return new GrammarState2(Object.fromEntries(toArray(themes).map((theme) => [theme, INITIAL])), lang);
  }
  constructor(...args) {
    if (args.length === 2) {
      const [stacksMap, lang] = args;
      this.lang = lang;
      this._stacks = stacksMap;
    } else {
      const [stack, lang, theme] = args;
      this.lang = lang;
      this._stacks = { [theme]: stack };
    }
  }
  getInternalStack(theme = this.theme) {
    return this._stacks[theme];
  }
  getScopes(theme = this.theme) {
    return getScopes(this._stacks[theme]);
  }
  toJSON() {
    return {
      lang: this.lang,
      theme: this.theme,
      themes: this.themes,
      scopes: this.getScopes()
    };
  }
};
function getScopes(stack) {
  const scopes = [];
  const visited = /* @__PURE__ */ new Set;
  function pushScope(stack2) {
    if (visited.has(stack2))
      return;
    visited.add(stack2);
    const name = stack2?.nameScopesList?.scopeName;
    if (name)
      scopes.push(name);
    if (stack2.parent)
      pushScope(stack2.parent);
  }
  pushScope(stack);
  return scopes;
}
function getGrammarStack(state, theme) {
  if (!(state instanceof GrammarState))
    throw new ShikiError("Invalid grammar state");
  return state.getInternalStack(theme);
}
var RE_COMMA = /,/;
var RE_SPACE = / /;
function codeToTokensBase(primitive, code, options = {}) {
  const { theme: themeName = primitive.getLoadedThemes()[0] } = options;
  if (isPlainLang(primitive.resolveLangAlias(options.lang || "text")) || isNoneTheme(themeName))
    return splitLines(code).map((line) => [{
      content: line[0],
      offset: line[1]
    }]);
  const { theme, colorMap } = primitive.setTheme(themeName);
  const _grammar = primitive.getLanguage(options.lang || "text");
  if (options.grammarState) {
    if (options.grammarState.lang !== _grammar.name)
      throw new ShikiError(`Grammar state language "${options.grammarState.lang}" does not match highlight language "${_grammar.name}"`);
    if (!options.grammarState.themes.includes(theme.name))
      throw new ShikiError(`Grammar state themes "${options.grammarState.themes}" do not contain highlight theme "${theme.name}"`);
  }
  return tokenizeWithTheme(code, _grammar, theme, colorMap, options);
}
function getLastGrammarState(...args) {
  if (args.length === 2)
    return getLastGrammarStateFromMap(args[1]);
  const [primitive, code, options = {}] = args;
  const { lang = "text", theme: themeName = primitive.getLoadedThemes()[0] } = options;
  if (isPlainLang(lang) || isNoneTheme(themeName))
    throw new ShikiError("Plain language does not have grammar state");
  if (lang === "ansi")
    throw new ShikiError("ANSI language does not have grammar state");
  const { theme, colorMap } = primitive.setTheme(themeName);
  const _grammar = primitive.getLanguage(lang);
  return new GrammarState(_tokenizeWithTheme(code, _grammar, theme, colorMap, options).stateStack, _grammar.name, theme.name);
}
function tokenizeWithTheme(code, grammar, theme, colorMap, options) {
  const result = _tokenizeWithTheme(code, grammar, theme, colorMap, options);
  const grammarState = new GrammarState(result.stateStack, grammar.name, theme.name);
  setLastGrammarStateToMap(result.tokens, grammarState);
  return result.tokens;
}
function _tokenizeWithTheme(code, grammar, theme, colorMap, options) {
  const colorReplacements = resolveColorReplacements(theme, options);
  const { tokenizeMaxLineLength = 0, tokenizeTimeLimit = 500 } = options;
  const lines = splitLines(code);
  let stateStack = options.grammarState ? getGrammarStack(options.grammarState, theme.name) ?? INITIAL : options.grammarContextCode != null ? _tokenizeWithTheme(options.grammarContextCode, grammar, theme, colorMap, {
    ...options,
    grammarState: undefined,
    grammarContextCode: undefined
  }).stateStack : INITIAL;
  let actual = [];
  const final = [];
  for (let i = 0, len = lines.length;i < len; i++) {
    const [line, lineOffset] = lines[i];
    if (line === "") {
      actual = [];
      final.push([]);
      continue;
    }
    if (tokenizeMaxLineLength > 0 && line.length >= tokenizeMaxLineLength) {
      actual = [];
      final.push([{
        content: line,
        offset: lineOffset,
        color: "",
        fontStyle: 0
      }]);
      continue;
    }
    let resultWithScopes;
    let tokensWithScopes;
    let tokensWithScopesIndex;
    if (options.includeExplanation) {
      resultWithScopes = grammar.tokenizeLine(line, stateStack, tokenizeTimeLimit);
      tokensWithScopes = resultWithScopes.tokens;
      tokensWithScopesIndex = 0;
    }
    const result = grammar.tokenizeLine2(line, stateStack, tokenizeTimeLimit);
    const tokensLength = result.tokens.length / 2;
    for (let j = 0;j < tokensLength; j++) {
      const startIndex = result.tokens[2 * j];
      const nextStartIndex = j + 1 < tokensLength ? result.tokens[2 * j + 2] : line.length;
      if (startIndex === nextStartIndex)
        continue;
      const metadata = result.tokens[2 * j + 1];
      const color = applyColorReplacements(colorMap[EncodedTokenMetadata.getForeground(metadata)], colorReplacements);
      const fontStyle = EncodedTokenMetadata.getFontStyle(metadata);
      const token = {
        content: line.substring(startIndex, nextStartIndex),
        offset: lineOffset + startIndex,
        color,
        fontStyle
      };
      if (options.includeExplanation) {
        const themeSettingsSelectors = [];
        if (options.includeExplanation !== "scopeName")
          for (const setting of theme.settings) {
            let selectors;
            switch (typeof setting.scope) {
              case "string":
                selectors = setting.scope.split(RE_COMMA).map((scope) => scope.trim());
                break;
              case "object":
                selectors = setting.scope;
                break;
              default:
                continue;
            }
            themeSettingsSelectors.push({
              settings: setting,
              selectors: selectors.map((selector) => selector.split(RE_SPACE))
            });
          }
        token.explanation = [];
        let offset = 0;
        while (startIndex + offset < nextStartIndex) {
          const tokenWithScopes = tokensWithScopes[tokensWithScopesIndex];
          const tokenWithScopesText = line.substring(tokenWithScopes.startIndex, tokenWithScopes.endIndex);
          offset += tokenWithScopesText.length;
          token.explanation.push({
            content: tokenWithScopesText,
            scopes: options.includeExplanation === "scopeName" ? explainThemeScopesNameOnly(tokenWithScopes.scopes) : explainThemeScopesFull(themeSettingsSelectors, tokenWithScopes.scopes)
          });
          tokensWithScopesIndex += 1;
        }
      }
      actual.push(token);
    }
    final.push(actual);
    actual = [];
    stateStack = result.ruleStack;
  }
  return {
    tokens: final,
    stateStack
  };
}
function explainThemeScopesNameOnly(scopes) {
  return scopes.map((scope) => ({ scopeName: scope }));
}
function explainThemeScopesFull(themeSelectors, scopes) {
  const result = [];
  for (let i = 0, len = scopes.length;i < len; i++) {
    const scope = scopes[i];
    result[i] = {
      scopeName: scope,
      themeMatches: explainThemeScope(themeSelectors, scope, scopes.slice(0, i))
    };
  }
  return result;
}
function matchesOne(selector, scope) {
  return selector === scope || scope.substring(0, selector.length) === selector && scope[selector.length] === ".";
}
function matches(selectors, scope, parentScopes) {
  if (!matchesOne(selectors.at(-1), scope))
    return false;
  let selectorParentIndex = selectors.length - 2;
  let parentIndex = parentScopes.length - 1;
  while (selectorParentIndex >= 0 && parentIndex >= 0) {
    if (matchesOne(selectors[selectorParentIndex], parentScopes[parentIndex]))
      selectorParentIndex -= 1;
    parentIndex -= 1;
  }
  if (selectorParentIndex === -1)
    return true;
  return false;
}
function explainThemeScope(themeSettingsSelectors, scope, parentScopes) {
  const result = [];
  for (const { selectors, settings } of themeSettingsSelectors)
    for (const selectorPieces of selectors)
      if (matches(selectorPieces, scope, parentScopes)) {
        result.push(settings);
        break;
      }
  return result;
}
function codeToTokensWithThemes(primitive, code, options, codeToTokensBaseFn = codeToTokensBase) {
  const themes = Object.entries(options.themes).filter((i) => i[1]).map((i) => ({
    color: i[0],
    theme: i[1]
  }));
  const themedTokens = themes.map((t) => {
    const tokens2 = codeToTokensBaseFn(primitive, code, {
      ...options,
      theme: t.theme
    });
    return {
      tokens: tokens2,
      state: getLastGrammarStateFromMap(tokens2),
      theme: typeof t.theme === "string" ? t.theme : t.theme.name
    };
  });
  const tokens = alignThemesTokenization(...themedTokens.map((i) => i.tokens));
  const mergedTokens = tokens[0].map((line, lineIdx) => line.map((_token, tokenIdx) => {
    const mergedToken = {
      content: _token.content,
      variants: {},
      offset: _token.offset
    };
    if ("includeExplanation" in options && options.includeExplanation)
      mergedToken.explanation = _token.explanation;
    tokens.forEach((t, themeIdx) => {
      const { content: _, explanation: __, offset: ___, ...styles } = t[lineIdx][tokenIdx];
      mergedToken.variants[themes[themeIdx].color] = styles;
    });
    return mergedToken;
  }));
  const mergedGrammarState = themedTokens[0].state ? new GrammarState(Object.fromEntries(themedTokens.map((s) => [s.theme, s.state?.getInternalStack(s.theme)])), themedTokens[0].state.lang) : undefined;
  if (mergedGrammarState)
    setLastGrammarStateToMap(mergedTokens, mergedGrammarState);
  return mergedTokens;
}
function alignThemesTokenization(...themes) {
  const outThemes = themes.map(() => []);
  const count = themes.length;
  for (let i = 0;i < themes[0].length; i++) {
    const lines = themes.map((t) => t[i]);
    const outLines = outThemes.map(() => []);
    outThemes.forEach((t, i2) => t.push(outLines[i2]));
    const indexes = lines.map(() => 0);
    const current = lines.map((l) => l[0]);
    while (current.every((t) => t)) {
      const minLength = Math.min(...current.map((t) => t.content.length));
      for (let n = 0;n < count; n++) {
        const token = current[n];
        if (token.content.length === minLength) {
          outLines[n].push(token);
          indexes[n] += 1;
          current[n] = lines[n][indexes[n]];
        } else {
          outLines[n].push({
            ...token,
            content: token.content.slice(0, minLength)
          });
          current[n] = {
            ...token,
            content: token.content.slice(minLength),
            offset: token.offset + minLength
          };
        }
      }
    }
  }
  return outThemes;
}

// node_modules/html-void-elements/index.js
var htmlVoidElements = [
  "area",
  "base",
  "basefont",
  "bgsound",
  "br",
  "col",
  "command",
  "embed",
  "frame",
  "hr",
  "image",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
];

// node_modules/property-information/lib/util/schema.js
class Schema {
  constructor(property, normal, space) {
    this.normal = normal;
    this.property = property;
    if (space) {
      this.space = space;
    }
  }
}
Schema.prototype.normal = {};
Schema.prototype.property = {};
Schema.prototype.space = undefined;

// node_modules/property-information/lib/util/merge.js
function merge(definitions, space) {
  const property = {};
  const normal = {};
  for (const definition of definitions) {
    Object.assign(property, definition.property);
    Object.assign(normal, definition.normal);
  }
  return new Schema(property, normal, space);
}

// node_modules/property-information/lib/normalize.js
function normalize(value) {
  return value.toLowerCase();
}

// node_modules/property-information/lib/util/info.js
class Info {
  constructor(property, attribute) {
    this.attribute = attribute;
    this.property = property;
  }
}
Info.prototype.attribute = "";
Info.prototype.booleanish = false;
Info.prototype.boolean = false;
Info.prototype.commaOrSpaceSeparated = false;
Info.prototype.commaSeparated = false;
Info.prototype.defined = false;
Info.prototype.mustUseProperty = false;
Info.prototype.number = false;
Info.prototype.overloadedBoolean = false;
Info.prototype.property = "";
Info.prototype.spaceSeparated = false;
Info.prototype.space = undefined;

// node_modules/property-information/lib/util/types.js
var exports_types = {};
__export(exports_types, {
  spaceSeparated: () => spaceSeparated,
  overloadedBoolean: () => overloadedBoolean,
  number: () => number,
  commaSeparated: () => commaSeparated,
  commaOrSpaceSeparated: () => commaOrSpaceSeparated,
  booleanish: () => booleanish,
  boolean: () => boolean
});
var powers = 0;
var boolean = increment();
var booleanish = increment();
var overloadedBoolean = increment();
var number = increment();
var spaceSeparated = increment();
var commaSeparated = increment();
var commaOrSpaceSeparated = increment();
function increment() {
  return 2 ** ++powers;
}

// node_modules/property-information/lib/util/defined-info.js
var checks = Object.keys(exports_types);

class DefinedInfo extends Info {
  constructor(property, attribute, mask, space) {
    let index = -1;
    super(property, attribute);
    mark(this, "space", space);
    if (typeof mask === "number") {
      while (++index < checks.length) {
        const check = checks[index];
        mark(this, checks[index], (mask & exports_types[check]) === exports_types[check]);
      }
    }
  }
}
DefinedInfo.prototype.defined = true;
function mark(values, key, value) {
  if (value) {
    values[key] = value;
  }
}

// node_modules/property-information/lib/util/create.js
function create(definition) {
  const properties = {};
  const normals = {};
  for (const [property, value] of Object.entries(definition.properties)) {
    const info = new DefinedInfo(property, definition.transform(definition.attributes || {}, property), value, definition.space);
    if (definition.mustUseProperty && definition.mustUseProperty.includes(property)) {
      info.mustUseProperty = true;
    }
    properties[property] = info;
    normals[normalize(property)] = property;
    normals[normalize(info.attribute)] = property;
  }
  return new Schema(properties, normals, definition.space);
}

// node_modules/property-information/lib/aria.js
var aria = create({
  properties: {
    ariaActiveDescendant: null,
    ariaAtomic: booleanish,
    ariaAutoComplete: null,
    ariaBusy: booleanish,
    ariaChecked: booleanish,
    ariaColCount: number,
    ariaColIndex: number,
    ariaColSpan: number,
    ariaControls: spaceSeparated,
    ariaCurrent: null,
    ariaDescribedBy: spaceSeparated,
    ariaDetails: null,
    ariaDisabled: booleanish,
    ariaDropEffect: spaceSeparated,
    ariaErrorMessage: null,
    ariaExpanded: booleanish,
    ariaFlowTo: spaceSeparated,
    ariaGrabbed: booleanish,
    ariaHasPopup: null,
    ariaHidden: booleanish,
    ariaInvalid: null,
    ariaKeyShortcuts: null,
    ariaLabel: null,
    ariaLabelledBy: spaceSeparated,
    ariaLevel: number,
    ariaLive: null,
    ariaModal: booleanish,
    ariaMultiLine: booleanish,
    ariaMultiSelectable: booleanish,
    ariaOrientation: null,
    ariaOwns: spaceSeparated,
    ariaPlaceholder: null,
    ariaPosInSet: number,
    ariaPressed: booleanish,
    ariaReadOnly: booleanish,
    ariaRelevant: null,
    ariaRequired: booleanish,
    ariaRoleDescription: spaceSeparated,
    ariaRowCount: number,
    ariaRowIndex: number,
    ariaRowSpan: number,
    ariaSelected: booleanish,
    ariaSetSize: number,
    ariaSort: null,
    ariaValueMax: number,
    ariaValueMin: number,
    ariaValueNow: number,
    ariaValueText: null,
    role: null
  },
  transform(_, property) {
    return property === "role" ? property : "aria-" + property.slice(4).toLowerCase();
  }
});

// node_modules/property-information/lib/util/case-sensitive-transform.js
function caseSensitiveTransform(attributes, attribute) {
  return attribute in attributes ? attributes[attribute] : attribute;
}

// node_modules/property-information/lib/util/case-insensitive-transform.js
function caseInsensitiveTransform(attributes, property) {
  return caseSensitiveTransform(attributes, property.toLowerCase());
}

// node_modules/property-information/lib/html.js
var html = create({
  attributes: {
    acceptcharset: "accept-charset",
    classname: "class",
    htmlfor: "for",
    httpequiv: "http-equiv"
  },
  mustUseProperty: ["checked", "multiple", "muted", "selected"],
  properties: {
    abbr: null,
    accept: commaSeparated,
    acceptCharset: spaceSeparated,
    accessKey: spaceSeparated,
    action: null,
    allow: null,
    allowFullScreen: boolean,
    allowPaymentRequest: boolean,
    allowUserMedia: boolean,
    alt: null,
    as: null,
    async: boolean,
    autoCapitalize: null,
    autoComplete: spaceSeparated,
    autoFocus: boolean,
    autoPlay: boolean,
    blocking: spaceSeparated,
    capture: null,
    charSet: null,
    checked: boolean,
    cite: null,
    className: spaceSeparated,
    cols: number,
    colSpan: null,
    content: null,
    contentEditable: booleanish,
    controls: boolean,
    controlsList: spaceSeparated,
    coords: number | commaSeparated,
    crossOrigin: null,
    data: null,
    dateTime: null,
    decoding: null,
    default: boolean,
    defer: boolean,
    dir: null,
    dirName: null,
    disabled: boolean,
    download: overloadedBoolean,
    draggable: booleanish,
    encType: null,
    enterKeyHint: null,
    fetchPriority: null,
    form: null,
    formAction: null,
    formEncType: null,
    formMethod: null,
    formNoValidate: boolean,
    formTarget: null,
    headers: spaceSeparated,
    height: number,
    hidden: overloadedBoolean,
    high: number,
    href: null,
    hrefLang: null,
    htmlFor: spaceSeparated,
    httpEquiv: spaceSeparated,
    id: null,
    imageSizes: null,
    imageSrcSet: null,
    inert: boolean,
    inputMode: null,
    integrity: null,
    is: null,
    isMap: boolean,
    itemId: null,
    itemProp: spaceSeparated,
    itemRef: spaceSeparated,
    itemScope: boolean,
    itemType: spaceSeparated,
    kind: null,
    label: null,
    lang: null,
    language: null,
    list: null,
    loading: null,
    loop: boolean,
    low: number,
    manifest: null,
    max: null,
    maxLength: number,
    media: null,
    method: null,
    min: null,
    minLength: number,
    multiple: boolean,
    muted: boolean,
    name: null,
    nonce: null,
    noModule: boolean,
    noValidate: boolean,
    onAbort: null,
    onAfterPrint: null,
    onAuxClick: null,
    onBeforeMatch: null,
    onBeforePrint: null,
    onBeforeToggle: null,
    onBeforeUnload: null,
    onBlur: null,
    onCancel: null,
    onCanPlay: null,
    onCanPlayThrough: null,
    onChange: null,
    onClick: null,
    onClose: null,
    onContextLost: null,
    onContextMenu: null,
    onContextRestored: null,
    onCopy: null,
    onCueChange: null,
    onCut: null,
    onDblClick: null,
    onDrag: null,
    onDragEnd: null,
    onDragEnter: null,
    onDragExit: null,
    onDragLeave: null,
    onDragOver: null,
    onDragStart: null,
    onDrop: null,
    onDurationChange: null,
    onEmptied: null,
    onEnded: null,
    onError: null,
    onFocus: null,
    onFormData: null,
    onHashChange: null,
    onInput: null,
    onInvalid: null,
    onKeyDown: null,
    onKeyPress: null,
    onKeyUp: null,
    onLanguageChange: null,
    onLoad: null,
    onLoadedData: null,
    onLoadedMetadata: null,
    onLoadEnd: null,
    onLoadStart: null,
    onMessage: null,
    onMessageError: null,
    onMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null,
    onMouseMove: null,
    onMouseOut: null,
    onMouseOver: null,
    onMouseUp: null,
    onOffline: null,
    onOnline: null,
    onPageHide: null,
    onPageShow: null,
    onPaste: null,
    onPause: null,
    onPlay: null,
    onPlaying: null,
    onPopState: null,
    onProgress: null,
    onRateChange: null,
    onRejectionHandled: null,
    onReset: null,
    onResize: null,
    onScroll: null,
    onScrollEnd: null,
    onSecurityPolicyViolation: null,
    onSeeked: null,
    onSeeking: null,
    onSelect: null,
    onSlotChange: null,
    onStalled: null,
    onStorage: null,
    onSubmit: null,
    onSuspend: null,
    onTimeUpdate: null,
    onToggle: null,
    onUnhandledRejection: null,
    onUnload: null,
    onVolumeChange: null,
    onWaiting: null,
    onWheel: null,
    open: boolean,
    optimum: number,
    pattern: null,
    ping: spaceSeparated,
    placeholder: null,
    playsInline: boolean,
    popover: null,
    popoverTarget: null,
    popoverTargetAction: null,
    poster: null,
    preload: null,
    readOnly: boolean,
    referrerPolicy: null,
    rel: spaceSeparated,
    required: boolean,
    reversed: boolean,
    rows: number,
    rowSpan: number,
    sandbox: spaceSeparated,
    scope: null,
    scoped: boolean,
    seamless: boolean,
    selected: boolean,
    shadowRootClonable: boolean,
    shadowRootDelegatesFocus: boolean,
    shadowRootMode: null,
    shape: null,
    size: number,
    sizes: null,
    slot: null,
    span: number,
    spellCheck: booleanish,
    src: null,
    srcDoc: null,
    srcLang: null,
    srcSet: null,
    start: number,
    step: null,
    style: null,
    tabIndex: number,
    target: null,
    title: null,
    translate: null,
    type: null,
    typeMustMatch: boolean,
    useMap: null,
    value: booleanish,
    width: number,
    wrap: null,
    writingSuggestions: null,
    align: null,
    aLink: null,
    archive: spaceSeparated,
    axis: null,
    background: null,
    bgColor: null,
    border: number,
    borderColor: null,
    bottomMargin: number,
    cellPadding: null,
    cellSpacing: null,
    char: null,
    charOff: null,
    classId: null,
    clear: null,
    code: null,
    codeBase: null,
    codeType: null,
    color: null,
    compact: boolean,
    declare: boolean,
    event: null,
    face: null,
    frame: null,
    frameBorder: null,
    hSpace: number,
    leftMargin: number,
    link: null,
    longDesc: null,
    lowSrc: null,
    marginHeight: number,
    marginWidth: number,
    noResize: boolean,
    noHref: boolean,
    noShade: boolean,
    noWrap: boolean,
    object: null,
    profile: null,
    prompt: null,
    rev: null,
    rightMargin: number,
    rules: null,
    scheme: null,
    scrolling: booleanish,
    standby: null,
    summary: null,
    text: null,
    topMargin: number,
    valueType: null,
    version: null,
    vAlign: null,
    vLink: null,
    vSpace: number,
    allowTransparency: null,
    autoCorrect: null,
    autoSave: null,
    disablePictureInPicture: boolean,
    disableRemotePlayback: boolean,
    prefix: null,
    property: null,
    results: number,
    security: null,
    unselectable: null
  },
  space: "html",
  transform: caseInsensitiveTransform
});

// node_modules/property-information/lib/svg.js
var svg = create({
  attributes: {
    accentHeight: "accent-height",
    alignmentBaseline: "alignment-baseline",
    arabicForm: "arabic-form",
    baselineShift: "baseline-shift",
    capHeight: "cap-height",
    className: "class",
    clipPath: "clip-path",
    clipRule: "clip-rule",
    colorInterpolation: "color-interpolation",
    colorInterpolationFilters: "color-interpolation-filters",
    colorProfile: "color-profile",
    colorRendering: "color-rendering",
    crossOrigin: "crossorigin",
    dataType: "datatype",
    dominantBaseline: "dominant-baseline",
    enableBackground: "enable-background",
    fillOpacity: "fill-opacity",
    fillRule: "fill-rule",
    floodColor: "flood-color",
    floodOpacity: "flood-opacity",
    fontFamily: "font-family",
    fontSize: "font-size",
    fontSizeAdjust: "font-size-adjust",
    fontStretch: "font-stretch",
    fontStyle: "font-style",
    fontVariant: "font-variant",
    fontWeight: "font-weight",
    glyphName: "glyph-name",
    glyphOrientationHorizontal: "glyph-orientation-horizontal",
    glyphOrientationVertical: "glyph-orientation-vertical",
    hrefLang: "hreflang",
    horizAdvX: "horiz-adv-x",
    horizOriginX: "horiz-origin-x",
    horizOriginY: "horiz-origin-y",
    imageRendering: "image-rendering",
    letterSpacing: "letter-spacing",
    lightingColor: "lighting-color",
    markerEnd: "marker-end",
    markerMid: "marker-mid",
    markerStart: "marker-start",
    navDown: "nav-down",
    navDownLeft: "nav-down-left",
    navDownRight: "nav-down-right",
    navLeft: "nav-left",
    navNext: "nav-next",
    navPrev: "nav-prev",
    navRight: "nav-right",
    navUp: "nav-up",
    navUpLeft: "nav-up-left",
    navUpRight: "nav-up-right",
    onAbort: "onabort",
    onActivate: "onactivate",
    onAfterPrint: "onafterprint",
    onBeforePrint: "onbeforeprint",
    onBegin: "onbegin",
    onCancel: "oncancel",
    onCanPlay: "oncanplay",
    onCanPlayThrough: "oncanplaythrough",
    onChange: "onchange",
    onClick: "onclick",
    onClose: "onclose",
    onCopy: "oncopy",
    onCueChange: "oncuechange",
    onCut: "oncut",
    onDblClick: "ondblclick",
    onDrag: "ondrag",
    onDragEnd: "ondragend",
    onDragEnter: "ondragenter",
    onDragExit: "ondragexit",
    onDragLeave: "ondragleave",
    onDragOver: "ondragover",
    onDragStart: "ondragstart",
    onDrop: "ondrop",
    onDurationChange: "ondurationchange",
    onEmptied: "onemptied",
    onEnd: "onend",
    onEnded: "onended",
    onError: "onerror",
    onFocus: "onfocus",
    onFocusIn: "onfocusin",
    onFocusOut: "onfocusout",
    onHashChange: "onhashchange",
    onInput: "oninput",
    onInvalid: "oninvalid",
    onKeyDown: "onkeydown",
    onKeyPress: "onkeypress",
    onKeyUp: "onkeyup",
    onLoad: "onload",
    onLoadedData: "onloadeddata",
    onLoadedMetadata: "onloadedmetadata",
    onLoadStart: "onloadstart",
    onMessage: "onmessage",
    onMouseDown: "onmousedown",
    onMouseEnter: "onmouseenter",
    onMouseLeave: "onmouseleave",
    onMouseMove: "onmousemove",
    onMouseOut: "onmouseout",
    onMouseOver: "onmouseover",
    onMouseUp: "onmouseup",
    onMouseWheel: "onmousewheel",
    onOffline: "onoffline",
    onOnline: "ononline",
    onPageHide: "onpagehide",
    onPageShow: "onpageshow",
    onPaste: "onpaste",
    onPause: "onpause",
    onPlay: "onplay",
    onPlaying: "onplaying",
    onPopState: "onpopstate",
    onProgress: "onprogress",
    onRateChange: "onratechange",
    onRepeat: "onrepeat",
    onReset: "onreset",
    onResize: "onresize",
    onScroll: "onscroll",
    onSeeked: "onseeked",
    onSeeking: "onseeking",
    onSelect: "onselect",
    onShow: "onshow",
    onStalled: "onstalled",
    onStorage: "onstorage",
    onSubmit: "onsubmit",
    onSuspend: "onsuspend",
    onTimeUpdate: "ontimeupdate",
    onToggle: "ontoggle",
    onUnload: "onunload",
    onVolumeChange: "onvolumechange",
    onWaiting: "onwaiting",
    onZoom: "onzoom",
    overlinePosition: "overline-position",
    overlineThickness: "overline-thickness",
    paintOrder: "paint-order",
    panose1: "panose-1",
    pointerEvents: "pointer-events",
    referrerPolicy: "referrerpolicy",
    renderingIntent: "rendering-intent",
    shapeRendering: "shape-rendering",
    stopColor: "stop-color",
    stopOpacity: "stop-opacity",
    strikethroughPosition: "strikethrough-position",
    strikethroughThickness: "strikethrough-thickness",
    strokeDashArray: "stroke-dasharray",
    strokeDashOffset: "stroke-dashoffset",
    strokeLineCap: "stroke-linecap",
    strokeLineJoin: "stroke-linejoin",
    strokeMiterLimit: "stroke-miterlimit",
    strokeOpacity: "stroke-opacity",
    strokeWidth: "stroke-width",
    tabIndex: "tabindex",
    textAnchor: "text-anchor",
    textDecoration: "text-decoration",
    textRendering: "text-rendering",
    transformOrigin: "transform-origin",
    typeOf: "typeof",
    underlinePosition: "underline-position",
    underlineThickness: "underline-thickness",
    unicodeBidi: "unicode-bidi",
    unicodeRange: "unicode-range",
    unitsPerEm: "units-per-em",
    vAlphabetic: "v-alphabetic",
    vHanging: "v-hanging",
    vIdeographic: "v-ideographic",
    vMathematical: "v-mathematical",
    vectorEffect: "vector-effect",
    vertAdvY: "vert-adv-y",
    vertOriginX: "vert-origin-x",
    vertOriginY: "vert-origin-y",
    wordSpacing: "word-spacing",
    writingMode: "writing-mode",
    xHeight: "x-height",
    playbackOrder: "playbackorder",
    timelineBegin: "timelinebegin"
  },
  properties: {
    about: commaOrSpaceSeparated,
    accentHeight: number,
    accumulate: null,
    additive: null,
    alignmentBaseline: null,
    alphabetic: number,
    amplitude: number,
    arabicForm: null,
    ascent: number,
    attributeName: null,
    attributeType: null,
    azimuth: number,
    bandwidth: null,
    baselineShift: null,
    baseFrequency: null,
    baseProfile: null,
    bbox: null,
    begin: null,
    bias: number,
    by: null,
    calcMode: null,
    capHeight: number,
    className: spaceSeparated,
    clip: null,
    clipPath: null,
    clipPathUnits: null,
    clipRule: null,
    color: null,
    colorInterpolation: null,
    colorInterpolationFilters: null,
    colorProfile: null,
    colorRendering: null,
    content: null,
    contentScriptType: null,
    contentStyleType: null,
    crossOrigin: null,
    cursor: null,
    cx: null,
    cy: null,
    d: null,
    dataType: null,
    defaultAction: null,
    descent: number,
    diffuseConstant: number,
    direction: null,
    display: null,
    dur: null,
    divisor: number,
    dominantBaseline: null,
    download: boolean,
    dx: null,
    dy: null,
    edgeMode: null,
    editable: null,
    elevation: number,
    enableBackground: null,
    end: null,
    event: null,
    exponent: number,
    externalResourcesRequired: null,
    fill: null,
    fillOpacity: number,
    fillRule: null,
    filter: null,
    filterRes: null,
    filterUnits: null,
    floodColor: null,
    floodOpacity: null,
    focusable: null,
    focusHighlight: null,
    fontFamily: null,
    fontSize: null,
    fontSizeAdjust: null,
    fontStretch: null,
    fontStyle: null,
    fontVariant: null,
    fontWeight: null,
    format: null,
    fr: null,
    from: null,
    fx: null,
    fy: null,
    g1: commaSeparated,
    g2: commaSeparated,
    glyphName: commaSeparated,
    glyphOrientationHorizontal: null,
    glyphOrientationVertical: null,
    glyphRef: null,
    gradientTransform: null,
    gradientUnits: null,
    handler: null,
    hanging: number,
    hatchContentUnits: null,
    hatchUnits: null,
    height: null,
    href: null,
    hrefLang: null,
    horizAdvX: number,
    horizOriginX: number,
    horizOriginY: number,
    id: null,
    ideographic: number,
    imageRendering: null,
    initialVisibility: null,
    in: null,
    in2: null,
    intercept: number,
    k: number,
    k1: number,
    k2: number,
    k3: number,
    k4: number,
    kernelMatrix: commaOrSpaceSeparated,
    kernelUnitLength: null,
    keyPoints: null,
    keySplines: null,
    keyTimes: null,
    kerning: null,
    lang: null,
    lengthAdjust: null,
    letterSpacing: null,
    lightingColor: null,
    limitingConeAngle: number,
    local: null,
    markerEnd: null,
    markerMid: null,
    markerStart: null,
    markerHeight: null,
    markerUnits: null,
    markerWidth: null,
    mask: null,
    maskContentUnits: null,
    maskUnits: null,
    mathematical: null,
    max: null,
    media: null,
    mediaCharacterEncoding: null,
    mediaContentEncodings: null,
    mediaSize: number,
    mediaTime: null,
    method: null,
    min: null,
    mode: null,
    name: null,
    navDown: null,
    navDownLeft: null,
    navDownRight: null,
    navLeft: null,
    navNext: null,
    navPrev: null,
    navRight: null,
    navUp: null,
    navUpLeft: null,
    navUpRight: null,
    numOctaves: null,
    observer: null,
    offset: null,
    onAbort: null,
    onActivate: null,
    onAfterPrint: null,
    onBeforePrint: null,
    onBegin: null,
    onCancel: null,
    onCanPlay: null,
    onCanPlayThrough: null,
    onChange: null,
    onClick: null,
    onClose: null,
    onCopy: null,
    onCueChange: null,
    onCut: null,
    onDblClick: null,
    onDrag: null,
    onDragEnd: null,
    onDragEnter: null,
    onDragExit: null,
    onDragLeave: null,
    onDragOver: null,
    onDragStart: null,
    onDrop: null,
    onDurationChange: null,
    onEmptied: null,
    onEnd: null,
    onEnded: null,
    onError: null,
    onFocus: null,
    onFocusIn: null,
    onFocusOut: null,
    onHashChange: null,
    onInput: null,
    onInvalid: null,
    onKeyDown: null,
    onKeyPress: null,
    onKeyUp: null,
    onLoad: null,
    onLoadedData: null,
    onLoadedMetadata: null,
    onLoadStart: null,
    onMessage: null,
    onMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null,
    onMouseMove: null,
    onMouseOut: null,
    onMouseOver: null,
    onMouseUp: null,
    onMouseWheel: null,
    onOffline: null,
    onOnline: null,
    onPageHide: null,
    onPageShow: null,
    onPaste: null,
    onPause: null,
    onPlay: null,
    onPlaying: null,
    onPopState: null,
    onProgress: null,
    onRateChange: null,
    onRepeat: null,
    onReset: null,
    onResize: null,
    onScroll: null,
    onSeeked: null,
    onSeeking: null,
    onSelect: null,
    onShow: null,
    onStalled: null,
    onStorage: null,
    onSubmit: null,
    onSuspend: null,
    onTimeUpdate: null,
    onToggle: null,
    onUnload: null,
    onVolumeChange: null,
    onWaiting: null,
    onZoom: null,
    opacity: null,
    operator: null,
    order: null,
    orient: null,
    orientation: null,
    origin: null,
    overflow: null,
    overlay: null,
    overlinePosition: number,
    overlineThickness: number,
    paintOrder: null,
    panose1: null,
    path: null,
    pathLength: number,
    patternContentUnits: null,
    patternTransform: null,
    patternUnits: null,
    phase: null,
    ping: spaceSeparated,
    pitch: null,
    playbackOrder: null,
    pointerEvents: null,
    points: null,
    pointsAtX: number,
    pointsAtY: number,
    pointsAtZ: number,
    preserveAlpha: null,
    preserveAspectRatio: null,
    primitiveUnits: null,
    propagate: null,
    property: commaOrSpaceSeparated,
    r: null,
    radius: null,
    referrerPolicy: null,
    refX: null,
    refY: null,
    rel: commaOrSpaceSeparated,
    rev: commaOrSpaceSeparated,
    renderingIntent: null,
    repeatCount: null,
    repeatDur: null,
    requiredExtensions: commaOrSpaceSeparated,
    requiredFeatures: commaOrSpaceSeparated,
    requiredFonts: commaOrSpaceSeparated,
    requiredFormats: commaOrSpaceSeparated,
    resource: null,
    restart: null,
    result: null,
    rotate: null,
    rx: null,
    ry: null,
    scale: null,
    seed: null,
    shapeRendering: null,
    side: null,
    slope: null,
    snapshotTime: null,
    specularConstant: number,
    specularExponent: number,
    spreadMethod: null,
    spacing: null,
    startOffset: null,
    stdDeviation: null,
    stemh: null,
    stemv: null,
    stitchTiles: null,
    stopColor: null,
    stopOpacity: null,
    strikethroughPosition: number,
    strikethroughThickness: number,
    string: null,
    stroke: null,
    strokeDashArray: commaOrSpaceSeparated,
    strokeDashOffset: null,
    strokeLineCap: null,
    strokeLineJoin: null,
    strokeMiterLimit: number,
    strokeOpacity: number,
    strokeWidth: null,
    style: null,
    surfaceScale: number,
    syncBehavior: null,
    syncBehaviorDefault: null,
    syncMaster: null,
    syncTolerance: null,
    syncToleranceDefault: null,
    systemLanguage: commaOrSpaceSeparated,
    tabIndex: number,
    tableValues: null,
    target: null,
    targetX: number,
    targetY: number,
    textAnchor: null,
    textDecoration: null,
    textRendering: null,
    textLength: null,
    timelineBegin: null,
    title: null,
    transformBehavior: null,
    type: null,
    typeOf: commaOrSpaceSeparated,
    to: null,
    transform: null,
    transformOrigin: null,
    u1: null,
    u2: null,
    underlinePosition: number,
    underlineThickness: number,
    unicode: null,
    unicodeBidi: null,
    unicodeRange: null,
    unitsPerEm: number,
    values: null,
    vAlphabetic: number,
    vMathematical: number,
    vectorEffect: null,
    vHanging: number,
    vIdeographic: number,
    version: null,
    vertAdvY: number,
    vertOriginX: number,
    vertOriginY: number,
    viewBox: null,
    viewTarget: null,
    visibility: null,
    width: null,
    widths: null,
    wordSpacing: null,
    writingMode: null,
    x: null,
    x1: null,
    x2: null,
    xChannelSelector: null,
    xHeight: number,
    y: null,
    y1: null,
    y2: null,
    yChannelSelector: null,
    z: null,
    zoomAndPan: null
  },
  space: "svg",
  transform: caseSensitiveTransform
});

// node_modules/property-information/lib/xlink.js
var xlink = create({
  properties: {
    xLinkActuate: null,
    xLinkArcRole: null,
    xLinkHref: null,
    xLinkRole: null,
    xLinkShow: null,
    xLinkTitle: null,
    xLinkType: null
  },
  space: "xlink",
  transform(_, property) {
    return "xlink:" + property.slice(5).toLowerCase();
  }
});

// node_modules/property-information/lib/xmlns.js
var xmlns = create({
  attributes: { xmlnsxlink: "xmlns:xlink" },
  properties: { xmlnsXLink: null, xmlns: null },
  space: "xmlns",
  transform: caseInsensitiveTransform
});

// node_modules/property-information/lib/xml.js
var xml = create({
  properties: { xmlBase: null, xmlLang: null, xmlSpace: null },
  space: "xml",
  transform(_, property) {
    return "xml:" + property.slice(3).toLowerCase();
  }
});

// node_modules/property-information/lib/find.js
var cap = /[A-Z]/g;
var dash = /-[a-z]/g;
var valid = /^data[-\w.:]+$/i;
function find(schema, value) {
  const normal = normalize(value);
  let property = value;
  let Type = Info;
  if (normal in schema.normal) {
    return schema.property[schema.normal[normal]];
  }
  if (normal.length > 4 && normal.slice(0, 4) === "data" && valid.test(value)) {
    if (value.charAt(4) === "-") {
      const rest = value.slice(5).replace(dash, camelcase);
      property = "data" + rest.charAt(0).toUpperCase() + rest.slice(1);
    } else {
      const rest = value.slice(4);
      if (!dash.test(rest)) {
        let dashes = rest.replace(cap, kebab);
        if (dashes.charAt(0) !== "-") {
          dashes = "-" + dashes;
        }
        value = "data" + dashes;
      }
    }
    Type = DefinedInfo;
  }
  return new Type(property, value);
}
function kebab($0) {
  return "-" + $0.toLowerCase();
}
function camelcase($0) {
  return $0.charAt(1).toUpperCase();
}
// node_modules/property-information/index.js
var html2 = merge([aria, html, xlink, xmlns, xml], "html");
var svg2 = merge([aria, svg, xlink, xmlns, xml], "svg");

// node_modules/zwitch/index.js
var own = {}.hasOwnProperty;
function zwitch(key, options) {
  const settings = options || {};
  function one(value, ...parameters) {
    let fn = one.invalid;
    const handlers = one.handlers;
    if (value && own.call(value, key)) {
      const id = String(value[key]);
      fn = own.call(handlers, id) ? handlers[id] : one.unknown;
    }
    if (fn) {
      return fn.call(this, value, ...parameters);
    }
  }
  one.handlers = settings.handlers || {};
  one.invalid = settings.invalid;
  one.unknown = settings.unknown;
  return one;
}

// node_modules/stringify-entities/lib/core.js
var defaultSubsetRegex = /["&'<>`]/g;
var surrogatePairsRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
var controlCharactersRegex = /[\x01-\t\v\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF]/g;
var regexEscapeRegex = /[|\\{}()[\]^$+*?.]/g;
var subsetToRegexCache = new WeakMap;
function core(value, options) {
  value = value.replace(options.subset ? charactersToExpressionCached(options.subset) : defaultSubsetRegex, basic);
  if (options.subset || options.escapeOnly) {
    return value;
  }
  return value.replace(surrogatePairsRegex, surrogate).replace(controlCharactersRegex, basic);
  function surrogate(pair, index, all) {
    return options.format((pair.charCodeAt(0) - 55296) * 1024 + pair.charCodeAt(1) - 56320 + 65536, all.charCodeAt(index + 2), options);
  }
  function basic(character, index, all) {
    return options.format(character.charCodeAt(0), all.charCodeAt(index + 1), options);
  }
}
function charactersToExpressionCached(subset) {
  let cached = subsetToRegexCache.get(subset);
  if (!cached) {
    cached = charactersToExpression(subset);
    subsetToRegexCache.set(subset, cached);
  }
  return cached;
}
function charactersToExpression(subset) {
  const groups = [];
  let index = -1;
  while (++index < subset.length) {
    groups.push(subset[index].replace(regexEscapeRegex, "\\$&"));
  }
  return new RegExp("(?:" + groups.join("|") + ")", "g");
}

// node_modules/stringify-entities/lib/util/to-hexadecimal.js
var hexadecimalRegex = /[\dA-Fa-f]/;
function toHexadecimal(code, next, omit) {
  const value = "&#x" + code.toString(16).toUpperCase();
  return omit && next && !hexadecimalRegex.test(String.fromCharCode(next)) ? value : value + ";";
}

// node_modules/stringify-entities/lib/util/to-decimal.js
var decimalRegex = /\d/;
function toDecimal(code, next, omit) {
  const value = "&#" + String(code);
  return omit && next && !decimalRegex.test(String.fromCharCode(next)) ? value : value + ";";
}

// node_modules/character-entities-legacy/index.js
var characterEntitiesLegacy = [
  "AElig",
  "AMP",
  "Aacute",
  "Acirc",
  "Agrave",
  "Aring",
  "Atilde",
  "Auml",
  "COPY",
  "Ccedil",
  "ETH",
  "Eacute",
  "Ecirc",
  "Egrave",
  "Euml",
  "GT",
  "Iacute",
  "Icirc",
  "Igrave",
  "Iuml",
  "LT",
  "Ntilde",
  "Oacute",
  "Ocirc",
  "Ograve",
  "Oslash",
  "Otilde",
  "Ouml",
  "QUOT",
  "REG",
  "THORN",
  "Uacute",
  "Ucirc",
  "Ugrave",
  "Uuml",
  "Yacute",
  "aacute",
  "acirc",
  "acute",
  "aelig",
  "agrave",
  "amp",
  "aring",
  "atilde",
  "auml",
  "brvbar",
  "ccedil",
  "cedil",
  "cent",
  "copy",
  "curren",
  "deg",
  "divide",
  "eacute",
  "ecirc",
  "egrave",
  "eth",
  "euml",
  "frac12",
  "frac14",
  "frac34",
  "gt",
  "iacute",
  "icirc",
  "iexcl",
  "igrave",
  "iquest",
  "iuml",
  "laquo",
  "lt",
  "macr",
  "micro",
  "middot",
  "nbsp",
  "not",
  "ntilde",
  "oacute",
  "ocirc",
  "ograve",
  "ordf",
  "ordm",
  "oslash",
  "otilde",
  "ouml",
  "para",
  "plusmn",
  "pound",
  "quot",
  "raquo",
  "reg",
  "sect",
  "shy",
  "sup1",
  "sup2",
  "sup3",
  "szlig",
  "thorn",
  "times",
  "uacute",
  "ucirc",
  "ugrave",
  "uml",
  "uuml",
  "yacute",
  "yen",
  "yuml"
];

// node_modules/character-entities-html4/index.js
var characterEntitiesHtml4 = {
  nbsp: " ",
  iexcl: "¡",
  cent: "¢",
  pound: "£",
  curren: "¤",
  yen: "¥",
  brvbar: "¦",
  sect: "§",
  uml: "¨",
  copy: "©",
  ordf: "ª",
  laquo: "«",
  not: "¬",
  shy: "­",
  reg: "®",
  macr: "¯",
  deg: "°",
  plusmn: "±",
  sup2: "²",
  sup3: "³",
  acute: "´",
  micro: "µ",
  para: "¶",
  middot: "·",
  cedil: "¸",
  sup1: "¹",
  ordm: "º",
  raquo: "»",
  frac14: "¼",
  frac12: "½",
  frac34: "¾",
  iquest: "¿",
  Agrave: "À",
  Aacute: "Á",
  Acirc: "Â",
  Atilde: "Ã",
  Auml: "Ä",
  Aring: "Å",
  AElig: "Æ",
  Ccedil: "Ç",
  Egrave: "È",
  Eacute: "É",
  Ecirc: "Ê",
  Euml: "Ë",
  Igrave: "Ì",
  Iacute: "Í",
  Icirc: "Î",
  Iuml: "Ï",
  ETH: "Ð",
  Ntilde: "Ñ",
  Ograve: "Ò",
  Oacute: "Ó",
  Ocirc: "Ô",
  Otilde: "Õ",
  Ouml: "Ö",
  times: "×",
  Oslash: "Ø",
  Ugrave: "Ù",
  Uacute: "Ú",
  Ucirc: "Û",
  Uuml: "Ü",
  Yacute: "Ý",
  THORN: "Þ",
  szlig: "ß",
  agrave: "à",
  aacute: "á",
  acirc: "â",
  atilde: "ã",
  auml: "ä",
  aring: "å",
  aelig: "æ",
  ccedil: "ç",
  egrave: "è",
  eacute: "é",
  ecirc: "ê",
  euml: "ë",
  igrave: "ì",
  iacute: "í",
  icirc: "î",
  iuml: "ï",
  eth: "ð",
  ntilde: "ñ",
  ograve: "ò",
  oacute: "ó",
  ocirc: "ô",
  otilde: "õ",
  ouml: "ö",
  divide: "÷",
  oslash: "ø",
  ugrave: "ù",
  uacute: "ú",
  ucirc: "û",
  uuml: "ü",
  yacute: "ý",
  thorn: "þ",
  yuml: "ÿ",
  fnof: "ƒ",
  Alpha: "Α",
  Beta: "Β",
  Gamma: "Γ",
  Delta: "Δ",
  Epsilon: "Ε",
  Zeta: "Ζ",
  Eta: "Η",
  Theta: "Θ",
  Iota: "Ι",
  Kappa: "Κ",
  Lambda: "Λ",
  Mu: "Μ",
  Nu: "Ν",
  Xi: "Ξ",
  Omicron: "Ο",
  Pi: "Π",
  Rho: "Ρ",
  Sigma: "Σ",
  Tau: "Τ",
  Upsilon: "Υ",
  Phi: "Φ",
  Chi: "Χ",
  Psi: "Ψ",
  Omega: "Ω",
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  epsilon: "ε",
  zeta: "ζ",
  eta: "η",
  theta: "θ",
  iota: "ι",
  kappa: "κ",
  lambda: "λ",
  mu: "μ",
  nu: "ν",
  xi: "ξ",
  omicron: "ο",
  pi: "π",
  rho: "ρ",
  sigmaf: "ς",
  sigma: "σ",
  tau: "τ",
  upsilon: "υ",
  phi: "φ",
  chi: "χ",
  psi: "ψ",
  omega: "ω",
  thetasym: "ϑ",
  upsih: "ϒ",
  piv: "ϖ",
  bull: "•",
  hellip: "…",
  prime: "′",
  Prime: "″",
  oline: "‾",
  frasl: "⁄",
  weierp: "℘",
  image: "ℑ",
  real: "ℜ",
  trade: "™",
  alefsym: "ℵ",
  larr: "←",
  uarr: "↑",
  rarr: "→",
  darr: "↓",
  harr: "↔",
  crarr: "↵",
  lArr: "⇐",
  uArr: "⇑",
  rArr: "⇒",
  dArr: "⇓",
  hArr: "⇔",
  forall: "∀",
  part: "∂",
  exist: "∃",
  empty: "∅",
  nabla: "∇",
  isin: "∈",
  notin: "∉",
  ni: "∋",
  prod: "∏",
  sum: "∑",
  minus: "−",
  lowast: "∗",
  radic: "√",
  prop: "∝",
  infin: "∞",
  ang: "∠",
  and: "∧",
  or: "∨",
  cap: "∩",
  cup: "∪",
  int: "∫",
  there4: "∴",
  sim: "∼",
  cong: "≅",
  asymp: "≈",
  ne: "≠",
  equiv: "≡",
  le: "≤",
  ge: "≥",
  sub: "⊂",
  sup: "⊃",
  nsub: "⊄",
  sube: "⊆",
  supe: "⊇",
  oplus: "⊕",
  otimes: "⊗",
  perp: "⊥",
  sdot: "⋅",
  lceil: "⌈",
  rceil: "⌉",
  lfloor: "⌊",
  rfloor: "⌋",
  lang: "〈",
  rang: "〉",
  loz: "◊",
  spades: "♠",
  clubs: "♣",
  hearts: "♥",
  diams: "♦",
  quot: '"',
  amp: "&",
  lt: "<",
  gt: ">",
  OElig: "Œ",
  oelig: "œ",
  Scaron: "Š",
  scaron: "š",
  Yuml: "Ÿ",
  circ: "ˆ",
  tilde: "˜",
  ensp: " ",
  emsp: " ",
  thinsp: " ",
  zwnj: "‌",
  zwj: "‍",
  lrm: "‎",
  rlm: "‏",
  ndash: "–",
  mdash: "—",
  lsquo: "‘",
  rsquo: "’",
  sbquo: "‚",
  ldquo: "“",
  rdquo: "”",
  bdquo: "„",
  dagger: "†",
  Dagger: "‡",
  permil: "‰",
  lsaquo: "‹",
  rsaquo: "›",
  euro: "€"
};

// node_modules/stringify-entities/lib/constant/dangerous.js
var dangerous = [
  "cent",
  "copy",
  "divide",
  "gt",
  "lt",
  "not",
  "para",
  "times"
];

// node_modules/stringify-entities/lib/util/to-named.js
var own2 = {}.hasOwnProperty;
var characters = {};
var key;
for (key in characterEntitiesHtml4) {
  if (own2.call(characterEntitiesHtml4, key)) {
    characters[characterEntitiesHtml4[key]] = key;
  }
}
var notAlphanumericRegex = /[^\dA-Za-z]/;
function toNamed(code, next, omit, attribute) {
  const character = String.fromCharCode(code);
  if (own2.call(characters, character)) {
    const name = characters[character];
    const value = "&" + name;
    if (omit && characterEntitiesLegacy.includes(name) && !dangerous.includes(name) && (!attribute || next && next !== 61 && notAlphanumericRegex.test(String.fromCharCode(next)))) {
      return value;
    }
    return value + ";";
  }
  return "";
}

// node_modules/stringify-entities/lib/util/format-smart.js
function formatSmart(code, next, options) {
  let numeric = toHexadecimal(code, next, options.omitOptionalSemicolons);
  let named;
  if (options.useNamedReferences || options.useShortestReferences) {
    named = toNamed(code, next, options.omitOptionalSemicolons, options.attribute);
  }
  if ((options.useShortestReferences || !named) && options.useShortestReferences) {
    const decimal = toDecimal(code, next, options.omitOptionalSemicolons);
    if (decimal.length < numeric.length) {
      numeric = decimal;
    }
  }
  return named && (!options.useShortestReferences || named.length < numeric.length) ? named : numeric;
}

// node_modules/stringify-entities/lib/index.js
function stringifyEntities(value, options) {
  return core(value, Object.assign({ format: formatSmart }, options));
}

// node_modules/hast-util-to-html/lib/handle/comment.js
var htmlCommentRegex = /^>|^->|<!--|-->|--!>|<!-$/g;
var bogusCommentEntitySubset = [">"];
var commentEntitySubset = ["<", ">"];
function comment(node, _1, _2, state) {
  return state.settings.bogusComments ? "<?" + stringifyEntities(node.value, Object.assign({}, state.settings.characterReferences, {
    subset: bogusCommentEntitySubset
  })) + ">" : "<!--" + node.value.replace(htmlCommentRegex, encode) + "-->";
  function encode($0) {
    return stringifyEntities($0, Object.assign({}, state.settings.characterReferences, {
      subset: commentEntitySubset
    }));
  }
}

// node_modules/hast-util-to-html/lib/handle/doctype.js
function doctype(_1, _2, _3, state) {
  return "<!" + (state.settings.upperDoctype ? "DOCTYPE" : "doctype") + (state.settings.tightDoctype ? "" : " ") + "html>";
}

// node_modules/ccount/index.js
function ccount(value, character) {
  const source = String(value);
  if (typeof character !== "string") {
    throw new TypeError("Expected character");
  }
  let count = 0;
  let index = source.indexOf(character);
  while (index !== -1) {
    count++;
    index = source.indexOf(character, index + character.length);
  }
  return count;
}

// node_modules/comma-separated-tokens/index.js
function stringify(values, options) {
  const settings = options || {};
  const input = values[values.length - 1] === "" ? [...values, ""] : values;
  return input.join((settings.padRight ? " " : "") + "," + (settings.padLeft === false ? "" : " ")).trim();
}

// node_modules/space-separated-tokens/index.js
function stringify2(values) {
  return values.join(" ").trim();
}

// node_modules/hast-util-whitespace/lib/index.js
var re = /[ \t\n\f\r]/g;
function whitespace(thing) {
  return typeof thing === "object" ? thing.type === "text" ? empty(thing.value) : false : empty(thing);
}
function empty(value) {
  return value.replace(re, "") === "";
}
// node_modules/hast-util-to-html/lib/omission/util/siblings.js
var siblingAfter = siblings(1);
var siblingBefore = siblings(-1);
var emptyChildren = [];
function siblings(increment2) {
  return sibling;
  function sibling(parent, index, includeWhitespace) {
    const siblings2 = parent ? parent.children : emptyChildren;
    let offset = (index || 0) + increment2;
    let next = siblings2[offset];
    if (!includeWhitespace) {
      while (next && whitespace(next)) {
        offset += increment2;
        next = siblings2[offset];
      }
    }
    return next;
  }
}

// node_modules/hast-util-to-html/lib/omission/omission.js
var own3 = {}.hasOwnProperty;
function omission(handlers) {
  return omit;
  function omit(node, index, parent) {
    return own3.call(handlers, node.tagName) && handlers[node.tagName](node, index, parent);
  }
}

// node_modules/hast-util-to-html/lib/omission/closing.js
var closing = omission({
  body,
  caption: headOrColgroupOrCaption,
  colgroup: headOrColgroupOrCaption,
  dd,
  dt,
  head: headOrColgroupOrCaption,
  html: html3,
  li,
  optgroup,
  option,
  p,
  rp: rubyElement,
  rt: rubyElement,
  tbody,
  td: cells,
  tfoot,
  th: cells,
  thead,
  tr
});
function headOrColgroupOrCaption(_, index, parent) {
  const next = siblingAfter(parent, index, true);
  return !next || next.type !== "comment" && !(next.type === "text" && whitespace(next.value.charAt(0)));
}
function html3(_, index, parent) {
  const next = siblingAfter(parent, index);
  return !next || next.type !== "comment";
}
function body(_, index, parent) {
  const next = siblingAfter(parent, index);
  return !next || next.type !== "comment";
}
function p(_, index, parent) {
  const next = siblingAfter(parent, index);
  return next ? next.type === "element" && (next.tagName === "address" || next.tagName === "article" || next.tagName === "aside" || next.tagName === "blockquote" || next.tagName === "details" || next.tagName === "div" || next.tagName === "dl" || next.tagName === "fieldset" || next.tagName === "figcaption" || next.tagName === "figure" || next.tagName === "footer" || next.tagName === "form" || next.tagName === "h1" || next.tagName === "h2" || next.tagName === "h3" || next.tagName === "h4" || next.tagName === "h5" || next.tagName === "h6" || next.tagName === "header" || next.tagName === "hgroup" || next.tagName === "hr" || next.tagName === "main" || next.tagName === "menu" || next.tagName === "nav" || next.tagName === "ol" || next.tagName === "p" || next.tagName === "pre" || next.tagName === "section" || next.tagName === "table" || next.tagName === "ul") : !parent || !(parent.type === "element" && (parent.tagName === "a" || parent.tagName === "audio" || parent.tagName === "del" || parent.tagName === "ins" || parent.tagName === "map" || parent.tagName === "noscript" || parent.tagName === "video"));
}
function li(_, index, parent) {
  const next = siblingAfter(parent, index);
  return !next || next.type === "element" && next.tagName === "li";
}
function dt(_, index, parent) {
  const next = siblingAfter(parent, index);
  return Boolean(next && next.type === "element" && (next.tagName === "dt" || next.tagName === "dd"));
}
function dd(_, index, parent) {
  const next = siblingAfter(parent, index);
  return !next || next.type === "element" && (next.tagName === "dt" || next.tagName === "dd");
}
function rubyElement(_, index, parent) {
  const next = siblingAfter(parent, index);
  return !next || next.type === "element" && (next.tagName === "rp" || next.tagName === "rt");
}
function optgroup(_, index, parent) {
  const next = siblingAfter(parent, index);
  return !next || next.type === "element" && next.tagName === "optgroup";
}
function option(_, index, parent) {
  const next = siblingAfter(parent, index);
  return !next || next.type === "element" && (next.tagName === "option" || next.tagName === "optgroup");
}
function thead(_, index, parent) {
  const next = siblingAfter(parent, index);
  return Boolean(next && next.type === "element" && (next.tagName === "tbody" || next.tagName === "tfoot"));
}
function tbody(_, index, parent) {
  const next = siblingAfter(parent, index);
  return !next || next.type === "element" && (next.tagName === "tbody" || next.tagName === "tfoot");
}
function tfoot(_, index, parent) {
  return !siblingAfter(parent, index);
}
function tr(_, index, parent) {
  const next = siblingAfter(parent, index);
  return !next || next.type === "element" && next.tagName === "tr";
}
function cells(_, index, parent) {
  const next = siblingAfter(parent, index);
  return !next || next.type === "element" && (next.tagName === "td" || next.tagName === "th");
}

// node_modules/hast-util-to-html/lib/omission/opening.js
var opening = omission({
  body: body2,
  colgroup,
  head,
  html: html4,
  tbody: tbody2
});
function html4(node) {
  const head = siblingAfter(node, -1);
  return !head || head.type !== "comment";
}
function head(node) {
  const seen = new Set;
  for (const child2 of node.children) {
    if (child2.type === "element" && (child2.tagName === "base" || child2.tagName === "title")) {
      if (seen.has(child2.tagName))
        return false;
      seen.add(child2.tagName);
    }
  }
  const child = node.children[0];
  return !child || child.type === "element";
}
function body2(node) {
  const head2 = siblingAfter(node, -1, true);
  return !head2 || head2.type !== "comment" && !(head2.type === "text" && whitespace(head2.value.charAt(0))) && !(head2.type === "element" && (head2.tagName === "meta" || head2.tagName === "link" || head2.tagName === "script" || head2.tagName === "style" || head2.tagName === "template"));
}
function colgroup(node, index, parent) {
  const previous = siblingBefore(parent, index);
  const head2 = siblingAfter(node, -1, true);
  if (parent && previous && previous.type === "element" && previous.tagName === "colgroup" && closing(previous, parent.children.indexOf(previous), parent)) {
    return false;
  }
  return Boolean(head2 && head2.type === "element" && head2.tagName === "col");
}
function tbody2(node, index, parent) {
  const previous = siblingBefore(parent, index);
  const head2 = siblingAfter(node, -1);
  if (parent && previous && previous.type === "element" && (previous.tagName === "thead" || previous.tagName === "tbody") && closing(previous, parent.children.indexOf(previous), parent)) {
    return false;
  }
  return Boolean(head2 && head2.type === "element" && head2.tagName === "tr");
}

// node_modules/hast-util-to-html/lib/handle/element.js
var constants = {
  name: [
    [`	
\f\r &/=>`.split(""), `	
\f\r "&'/=>\``.split("")],
    [`\x00	
\f\r "&'/<=>`.split(""), `\x00	
\f\r "&'/<=>\``.split("")]
  ],
  unquoted: [
    [`	
\f\r &>`.split(""), `\x00	
\f\r "&'<=>\``.split("")],
    [`\x00	
\f\r "&'<=>\``.split(""), `\x00	
\f\r "&'<=>\``.split("")]
  ],
  single: [
    ["&'".split(""), "\"&'`".split("")],
    ["\x00&'".split(""), "\x00\"&'`".split("")]
  ],
  double: [
    ['"&'.split(""), "\"&'`".split("")],
    ['\x00"&'.split(""), "\x00\"&'`".split("")]
  ]
};
function element(node, index, parent, state) {
  const schema = state.schema;
  const omit = schema.space === "svg" ? false : state.settings.omitOptionalTags;
  let selfClosing = schema.space === "svg" ? state.settings.closeEmptyElements : state.settings.voids.includes(node.tagName.toLowerCase());
  const parts = [];
  let last;
  if (schema.space === "html" && node.tagName === "svg") {
    state.schema = svg2;
  }
  const attributes = serializeAttributes(state, node.properties);
  const content = state.all(schema.space === "html" && node.tagName === "template" ? node.content : node);
  state.schema = schema;
  if (content)
    selfClosing = false;
  if (attributes || !omit || !opening(node, index, parent)) {
    parts.push("<", node.tagName, attributes ? " " + attributes : "");
    if (selfClosing && (schema.space === "svg" || state.settings.closeSelfClosing)) {
      last = attributes.charAt(attributes.length - 1);
      if (!state.settings.tightSelfClosing || last === "/" || last && last !== '"' && last !== "'") {
        parts.push(" ");
      }
      parts.push("/");
    }
    parts.push(">");
  }
  parts.push(content);
  if (!selfClosing && (!omit || !closing(node, index, parent))) {
    parts.push("</" + node.tagName + ">");
  }
  return parts.join("");
}
function serializeAttributes(state, properties) {
  const values = [];
  let index = -1;
  let key2;
  if (properties) {
    for (key2 in properties) {
      if (properties[key2] !== null && properties[key2] !== undefined) {
        const value = serializeAttribute(state, key2, properties[key2]);
        if (value)
          values.push(value);
      }
    }
  }
  while (++index < values.length) {
    const last = state.settings.tightAttributes ? values[index].charAt(values[index].length - 1) : undefined;
    if (index !== values.length - 1 && last !== '"' && last !== "'") {
      values[index] += " ";
    }
  }
  return values.join("");
}
function serializeAttribute(state, key2, value) {
  const info = find(state.schema, key2);
  const x = state.settings.allowParseErrors && state.schema.space === "html" ? 0 : 1;
  const y = state.settings.allowDangerousCharacters ? 0 : 1;
  let quote = state.quote;
  let result;
  if (info.overloadedBoolean && (value === info.attribute || value === "")) {
    value = true;
  } else if ((info.boolean || info.overloadedBoolean) && (typeof value !== "string" || value === info.attribute || value === "")) {
    value = Boolean(value);
  }
  if (value === null || value === undefined || value === false || typeof value === "number" && Number.isNaN(value)) {
    return "";
  }
  const name = stringifyEntities(info.attribute, Object.assign({}, state.settings.characterReferences, {
    subset: constants.name[x][y]
  }));
  if (value === true)
    return name;
  value = Array.isArray(value) ? (info.commaSeparated ? stringify : stringify2)(value, {
    padLeft: !state.settings.tightCommaSeparatedLists
  }) : String(value);
  if (state.settings.collapseEmptyAttributes && !value)
    return name;
  if (state.settings.preferUnquoted) {
    result = stringifyEntities(value, Object.assign({}, state.settings.characterReferences, {
      attribute: true,
      subset: constants.unquoted[x][y]
    }));
  }
  if (result !== value) {
    if (state.settings.quoteSmart && ccount(value, quote) > ccount(value, state.alternative)) {
      quote = state.alternative;
    }
    result = quote + stringifyEntities(value, Object.assign({}, state.settings.characterReferences, {
      subset: (quote === "'" ? constants.single : constants.double)[x][y],
      attribute: true
    })) + quote;
  }
  return name + (result ? "=" + result : result);
}

// node_modules/hast-util-to-html/lib/handle/text.js
var textEntitySubset = ["<", "&"];
function text(node, _, parent, state) {
  return parent && parent.type === "element" && (parent.tagName === "script" || parent.tagName === "style") ? node.value : stringifyEntities(node.value, Object.assign({}, state.settings.characterReferences, {
    subset: textEntitySubset
  }));
}

// node_modules/hast-util-to-html/lib/handle/raw.js
function raw(node, index, parent, state) {
  return state.settings.allowDangerousHtml ? node.value : text(node, index, parent, state);
}

// node_modules/hast-util-to-html/lib/handle/root.js
function root(node, _1, _2, state) {
  return state.all(node);
}

// node_modules/hast-util-to-html/lib/handle/index.js
var handle = zwitch("type", {
  invalid,
  unknown,
  handlers: { comment, doctype, element, raw, root, text }
});
function invalid(node) {
  throw new Error("Expected node, not `" + node + "`");
}
function unknown(node_) {
  const node = node_;
  throw new Error("Cannot compile unknown node `" + node.type + "`");
}

// node_modules/hast-util-to-html/lib/index.js
var emptyOptions = {};
var emptyCharacterReferences = {};
var emptyChildren2 = [];
function toHtml(tree, options) {
  const options_ = options || emptyOptions;
  const quote = options_.quote || '"';
  const alternative = quote === '"' ? "'" : '"';
  if (quote !== '"' && quote !== "'") {
    throw new Error("Invalid quote `" + quote + "`, expected `'` or `\"`");
  }
  const state = {
    one,
    all,
    settings: {
      omitOptionalTags: options_.omitOptionalTags || false,
      allowParseErrors: options_.allowParseErrors || false,
      allowDangerousCharacters: options_.allowDangerousCharacters || false,
      quoteSmart: options_.quoteSmart || false,
      preferUnquoted: options_.preferUnquoted || false,
      tightAttributes: options_.tightAttributes || false,
      upperDoctype: options_.upperDoctype || false,
      tightDoctype: options_.tightDoctype || false,
      bogusComments: options_.bogusComments || false,
      tightCommaSeparatedLists: options_.tightCommaSeparatedLists || false,
      tightSelfClosing: options_.tightSelfClosing || false,
      collapseEmptyAttributes: options_.collapseEmptyAttributes || false,
      allowDangerousHtml: options_.allowDangerousHtml || false,
      voids: options_.voids || htmlVoidElements,
      characterReferences: options_.characterReferences || emptyCharacterReferences,
      closeSelfClosing: options_.closeSelfClosing || false,
      closeEmptyElements: options_.closeEmptyElements || false
    },
    schema: options_.space === "svg" ? svg2 : html2,
    quote,
    alternative
  };
  return state.one(Array.isArray(tree) ? { type: "root", children: tree } : tree, undefined, undefined);
}
function one(node, index, parent) {
  return handle(node, index, parent, this);
}
function all(parent) {
  const results = [];
  const children = parent && parent.children || emptyChildren2;
  let index = -1;
  while (++index < children.length) {
    results[index] = this.one(children[index], index, parent);
  }
  return results.join("");
}
// node_modules/@shikijs/core/dist/index.mjs
var RE_WHITESPACE = /\s+/g;
function addClassToHast(node, className) {
  if (!className)
    return node;
  node.properties ||= {};
  node.properties.class ||= [];
  if (typeof node.properties.class === "string")
    node.properties.class = node.properties.class.split(RE_WHITESPACE);
  if (!Array.isArray(node.properties.class))
    node.properties.class = [];
  const targets = Array.isArray(className) ? className : className.split(RE_WHITESPACE);
  for (const c of targets)
    if (c && !node.properties.class.includes(c))
      node.properties.class.push(c);
  return node;
}
var RE_LANG_ATTR = /:?lang=["']([^"']+)["']/g;
var RE_CODE_FENCE = /(?:```|~~~)([\w-]+)/g;
var RE_LATEX_BEGIN = /\\begin\{([\w-]+)\}/g;
var RE_SCRIPT_LANG = /<script\s+(?:type|lang)=["']([^"']+)["']/gi;
function createPositionConverter(code) {
  const lines = splitLines(code, true).map(([line]) => line);
  function indexToPos(index) {
    if (index === code.length)
      return {
        line: lines.length - 1,
        character: lines.at(-1).length
      };
    let character = index;
    let line = 0;
    for (const lineText of lines) {
      if (character < lineText.length)
        break;
      character -= lineText.length;
      line++;
    }
    return {
      line,
      character
    };
  }
  function posToIndex(line, character) {
    let index = 0;
    for (let i = 0;i < line; i++)
      index += lines[i].length;
    index += character;
    return index;
  }
  return {
    lines,
    indexToPos,
    posToIndex
  };
}
function guessEmbeddedLanguages(code, _lang, highlighter) {
  const langs = /* @__PURE__ */ new Set;
  for (const match of code.matchAll(RE_LANG_ATTR)) {
    const lang = match[1].toLowerCase().trim();
    if (lang)
      langs.add(lang);
  }
  for (const match of code.matchAll(RE_CODE_FENCE)) {
    const lang = match[1].toLowerCase().trim();
    if (lang)
      langs.add(lang);
  }
  for (const match of code.matchAll(RE_LATEX_BEGIN)) {
    const lang = match[1].toLowerCase().trim();
    if (lang)
      langs.add(lang);
  }
  for (const match of code.matchAll(RE_SCRIPT_LANG)) {
    const fullType = match[1].toLowerCase().trim();
    const lang = fullType.includes("/") ? fullType.split("/").pop() : fullType;
    if (lang)
      langs.add(lang);
  }
  if (!highlighter)
    return [...langs];
  const bundle = highlighter.getBundledLanguages();
  return [...langs].filter((l) => l && bundle[l]);
}
var COLOR_KEYS = ["color", "background-color"];
function splitToken(token, offsets) {
  let lastOffset = 0;
  const tokens = [];
  for (const offset of offsets) {
    if (offset > lastOffset)
      tokens.push({
        ...token,
        content: token.content.slice(lastOffset, offset),
        offset: token.offset + lastOffset
      });
    lastOffset = offset;
  }
  if (lastOffset < token.content.length)
    tokens.push({
      ...token,
      content: token.content.slice(lastOffset),
      offset: token.offset + lastOffset
    });
  return tokens;
}
function splitTokens(tokens, breakpoints) {
  const sorted = [...breakpoints instanceof Set ? breakpoints : new Set(breakpoints)].sort((a, b) => a - b);
  if (!sorted.length)
    return tokens;
  return tokens.map((line) => {
    return line.flatMap((token) => {
      const breakpointsInToken = sorted.filter((i) => token.offset < i && i < token.offset + token.content.length).map((i) => i - token.offset).sort((a, b) => a - b);
      if (!breakpointsInToken.length)
        return token;
      return splitToken(token, breakpointsInToken);
    });
  });
}
function flatTokenVariants(merged, variantsOrder, cssVariablePrefix, defaultColor, colorsRendering = "css-vars") {
  const token = {
    content: merged.content,
    explanation: merged.explanation,
    offset: merged.offset
  };
  const styles = variantsOrder.map((t) => getTokenStyleObject(merged.variants[t]));
  const styleKeys = new Set(styles.flatMap((t) => Object.keys(t)));
  const mergedStyles = {};
  const varKey = (idx, key2) => {
    const keyName = key2 === "color" ? "" : key2 === "background-color" ? "-bg" : `-${key2}`;
    return cssVariablePrefix + variantsOrder[idx] + (key2 === "color" ? "" : keyName);
  };
  styles.forEach((cur, idx) => {
    for (const key2 of styleKeys) {
      const value = cur[key2] || "inherit";
      if (idx === 0 && defaultColor && COLOR_KEYS.includes(key2))
        if (defaultColor === "light-dark()" && styles.length > 1) {
          const lightIndex = variantsOrder.findIndex((t) => t === "light");
          const darkIndex = variantsOrder.findIndex((t) => t === "dark");
          if (lightIndex === -1 || darkIndex === -1)
            throw new ShikiError('When using `defaultColor: "light-dark()"`, you must provide both `light` and `dark` themes');
          mergedStyles[key2] = `light-dark(${styles[lightIndex][key2] || "inherit"}, ${styles[darkIndex][key2] || "inherit"})`;
          if (colorsRendering === "css-vars")
            mergedStyles[varKey(idx, key2)] = value;
        } else
          mergedStyles[key2] = value;
      else if (colorsRendering === "css-vars")
        mergedStyles[varKey(idx, key2)] = value;
    }
  });
  token.htmlStyle = mergedStyles;
  return token;
}
function getTokenStyleObject(token) {
  const styles = {};
  if (token.color)
    styles.color = token.color;
  if (token.bgColor)
    styles["background-color"] = token.bgColor;
  if (token.fontStyle) {
    if (token.fontStyle & FontStyle.Italic)
      styles["font-style"] = "italic";
    if (token.fontStyle & FontStyle.Bold)
      styles["font-weight"] = "bold";
    const decorations = [];
    if (token.fontStyle & FontStyle.Underline)
      decorations.push("underline");
    if (token.fontStyle & FontStyle.Strikethrough)
      decorations.push("line-through");
    if (decorations.length)
      styles["text-decoration"] = decorations.join(" ");
  }
  return styles;
}
function stringifyTokenStyle(token) {
  if (typeof token === "string")
    return token;
  return Object.entries(token).map(([key2, value]) => `${key2}:${value}`).join(";");
}
function transformerDecorations() {
  const map = /* @__PURE__ */ new WeakMap;
  function getContext(shiki) {
    if (!map.has(shiki.meta)) {
      let normalizePosition = function(p2) {
        if (typeof p2 === "number") {
          if (p2 < 0 || p2 > shiki.source.length)
            throw new ShikiError(`Invalid decoration offset: ${p2}. Code length: ${shiki.source.length}`);
          return {
            ...converter.indexToPos(p2),
            offset: p2
          };
        } else {
          const line = converter.lines[p2.line];
          if (line === undefined)
            throw new ShikiError(`Invalid decoration position ${JSON.stringify(p2)}. Lines length: ${converter.lines.length}`);
          let character = p2.character;
          if (character < 0)
            character = line.length + character;
          if (character < 0 || character > line.length)
            throw new ShikiError(`Invalid decoration position ${JSON.stringify(p2)}. Line ${p2.line} length: ${line.length}`);
          return {
            ...p2,
            character,
            offset: converter.posToIndex(p2.line, character)
          };
        }
      };
      const converter = createPositionConverter(shiki.source);
      const decorations = (shiki.options.decorations || []).map((d) => ({
        ...d,
        start: normalizePosition(d.start),
        end: normalizePosition(d.end)
      }));
      verifyIntersections(decorations);
      map.set(shiki.meta, {
        decorations,
        converter,
        source: shiki.source
      });
    }
    return map.get(shiki.meta);
  }
  return {
    name: "shiki:decorations",
    tokens(tokens) {
      if (!this.options.decorations?.length)
        return;
      return splitTokens(tokens, getContext(this).decorations.flatMap((d) => [d.start.offset, d.end.offset]));
    },
    code(codeEl) {
      if (!this.options.decorations?.length)
        return;
      const ctx = getContext(this);
      const lines = [...codeEl.children].filter((i) => i.type === "element" && i.tagName === "span");
      if (lines.length !== ctx.converter.lines.length)
        throw new ShikiError(`Number of lines in code element (${lines.length}) does not match the number of lines in the source (${ctx.converter.lines.length}). Failed to apply decorations.`);
      function applyLineSection(line, start, end, decoration) {
        const lineEl = lines[line];
        let text2 = "";
        let startIndex = -1;
        let endIndex = -1;
        if (start === 0)
          startIndex = 0;
        if (end === 0)
          endIndex = 0;
        if (end === Number.POSITIVE_INFINITY)
          endIndex = lineEl.children.length;
        if (startIndex === -1 || endIndex === -1)
          for (let i = 0;i < lineEl.children.length; i++) {
            text2 += stringify3(lineEl.children[i]);
            if (startIndex === -1 && text2.length === start)
              startIndex = i + 1;
            if (endIndex === -1 && text2.length === end)
              endIndex = i + 1;
          }
        if (startIndex === -1)
          throw new ShikiError(`Failed to find start index for decoration ${JSON.stringify(decoration.start)}`);
        if (endIndex === -1)
          throw new ShikiError(`Failed to find end index for decoration ${JSON.stringify(decoration.end)}`);
        const children = lineEl.children.slice(startIndex, endIndex);
        if (!decoration.alwaysWrap && children.length === lineEl.children.length)
          applyDecoration(lineEl, decoration, "line");
        else if (!decoration.alwaysWrap && children.length === 1 && children[0].type === "element")
          applyDecoration(children[0], decoration, "token");
        else {
          const wrapper = {
            type: "element",
            tagName: "span",
            properties: {},
            children
          };
          applyDecoration(wrapper, decoration, "wrapper");
          lineEl.children.splice(startIndex, children.length, wrapper);
        }
      }
      function applyLine(line, decoration) {
        lines[line] = applyDecoration(lines[line], decoration, "line");
      }
      function applyDecoration(el, decoration, type) {
        const properties = decoration.properties || {};
        const transform = decoration.transform || ((i) => i);
        el.tagName = decoration.tagName || "span";
        el.properties = {
          ...el.properties,
          ...properties,
          class: el.properties.class
        };
        if (decoration.properties?.class)
          addClassToHast(el, decoration.properties.class);
        el = transform(el, type) || el;
        return el;
      }
      const lineApplies = [];
      const sorted = ctx.decorations.sort((a, b) => b.start.offset - a.start.offset || a.end.offset - b.end.offset);
      for (const decoration of sorted) {
        const { start, end } = decoration;
        if (start.line === end.line)
          applyLineSection(start.line, start.character, end.character, decoration);
        else if (start.line < end.line) {
          applyLineSection(start.line, start.character, Number.POSITIVE_INFINITY, decoration);
          for (let i = start.line + 1;i < end.line; i++)
            lineApplies.unshift(() => applyLine(i, decoration));
          applyLineSection(end.line, 0, end.character, decoration);
        }
      }
      lineApplies.forEach((i) => i());
    }
  };
}
function verifyIntersections(items) {
  for (let i = 0;i < items.length; i++) {
    const foo = items[i];
    if (foo.start.offset > foo.end.offset)
      throw new ShikiError(`Invalid decoration range: ${JSON.stringify(foo.start)} - ${JSON.stringify(foo.end)}`);
    for (let j = i + 1;j < items.length; j++) {
      const bar = items[j];
      const isFooHasBarStart = foo.start.offset <= bar.start.offset && bar.start.offset < foo.end.offset;
      const isFooHasBarEnd = foo.start.offset < bar.end.offset && bar.end.offset <= foo.end.offset;
      const isBarHasFooStart = bar.start.offset <= foo.start.offset && foo.start.offset < bar.end.offset;
      const isBarHasFooEnd = bar.start.offset < foo.end.offset && foo.end.offset <= bar.end.offset;
      if (isFooHasBarStart || isFooHasBarEnd || isBarHasFooStart || isBarHasFooEnd) {
        if (isFooHasBarStart && isFooHasBarEnd)
          continue;
        if (isBarHasFooStart && isBarHasFooEnd)
          continue;
        if (isBarHasFooStart && foo.start.offset === foo.end.offset)
          continue;
        if (isFooHasBarEnd && bar.start.offset === bar.end.offset)
          continue;
        throw new ShikiError(`Decorations ${JSON.stringify(foo.start)} and ${JSON.stringify(bar.start)} intersect.`);
      }
    }
  }
}
function stringify3(el) {
  if (el.type === "text")
    return el.value;
  if (el.type === "element")
    return el.children.map(stringify3).join("");
  return "";
}
var builtInTransformers = [/* @__PURE__ */ transformerDecorations()];
function getTransformers(options) {
  const transformers = sortTransformersByEnforcement(options.transformers || []);
  return [
    ...transformers.pre,
    ...transformers.normal,
    ...transformers.post,
    ...builtInTransformers
  ];
}
function sortTransformersByEnforcement(transformers) {
  const pre = [];
  const post = [];
  const normal = [];
  for (const transformer of transformers)
    switch (transformer.enforce) {
      case "pre":
        pre.push(transformer);
        break;
      case "post":
        post.push(transformer);
        break;
      default:
        normal.push(transformer);
    }
  return {
    pre,
    post,
    normal
  };
}
var namedColors = [
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
  "brightBlack",
  "brightRed",
  "brightGreen",
  "brightYellow",
  "brightBlue",
  "brightMagenta",
  "brightCyan",
  "brightWhite"
];
var decorations = {
  1: "bold",
  2: "dim",
  3: "italic",
  4: "underline",
  7: "reverse",
  8: "hidden",
  9: "strikethrough"
};
function findSequence(value, position) {
  const nextEscape = value.indexOf("\x1B", position);
  if (nextEscape !== -1) {
    if (value[nextEscape + 1] === "[") {
      const nextClose = value.indexOf("m", nextEscape);
      if (nextClose !== -1)
        return {
          sequence: value.substring(nextEscape + 2, nextClose).split(";"),
          startPosition: nextEscape,
          position: nextClose + 1
        };
    }
  }
  return { position: value.length };
}
function parseColor(sequence) {
  const colorMode = sequence.shift();
  if (colorMode === "2") {
    const rgb = sequence.splice(0, 3).map((x) => Number.parseInt(x));
    if (rgb.length !== 3 || rgb.some((x) => Number.isNaN(x)))
      return;
    return {
      type: "rgb",
      rgb
    };
  } else if (colorMode === "5") {
    const index = sequence.shift();
    if (index)
      return {
        type: "table",
        index: Number(index)
      };
  }
}
function parseSequence(sequence) {
  const commands = [];
  while (sequence.length > 0) {
    const code = sequence.shift();
    if (!code)
      continue;
    const codeInt = Number.parseInt(code);
    if (Number.isNaN(codeInt))
      continue;
    if (codeInt === 0)
      commands.push({ type: "resetAll" });
    else if (codeInt <= 9) {
      if (decorations[codeInt])
        commands.push({
          type: "setDecoration",
          value: decorations[codeInt]
        });
    } else if (codeInt <= 29) {
      const decoration = decorations[codeInt - 20];
      if (decoration) {
        commands.push({
          type: "resetDecoration",
          value: decoration
        });
        if (decoration === "dim")
          commands.push({
            type: "resetDecoration",
            value: "bold"
          });
      }
    } else if (codeInt <= 37)
      commands.push({
        type: "setForegroundColor",
        value: {
          type: "named",
          name: namedColors[codeInt - 30]
        }
      });
    else if (codeInt === 38) {
      const color = parseColor(sequence);
      if (color)
        commands.push({
          type: "setForegroundColor",
          value: color
        });
    } else if (codeInt === 39)
      commands.push({ type: "resetForegroundColor" });
    else if (codeInt <= 47)
      commands.push({
        type: "setBackgroundColor",
        value: {
          type: "named",
          name: namedColors[codeInt - 40]
        }
      });
    else if (codeInt === 48) {
      const color = parseColor(sequence);
      if (color)
        commands.push({
          type: "setBackgroundColor",
          value: color
        });
    } else if (codeInt === 49)
      commands.push({ type: "resetBackgroundColor" });
    else if (codeInt === 53)
      commands.push({
        type: "setDecoration",
        value: "overline"
      });
    else if (codeInt === 55)
      commands.push({
        type: "resetDecoration",
        value: "overline"
      });
    else if (codeInt >= 90 && codeInt <= 97)
      commands.push({
        type: "setForegroundColor",
        value: {
          type: "named",
          name: namedColors[codeInt - 90 + 8]
        }
      });
    else if (codeInt >= 100 && codeInt <= 107)
      commands.push({
        type: "setBackgroundColor",
        value: {
          type: "named",
          name: namedColors[codeInt - 100 + 8]
        }
      });
  }
  return commands;
}
function createAnsiSequenceParser() {
  let foreground = null;
  let background = null;
  let decorations2 = /* @__PURE__ */ new Set;
  return { parse(value) {
    const tokens = [];
    let position = 0;
    do {
      const findResult = findSequence(value, position);
      const text2 = findResult.sequence ? value.substring(position, findResult.startPosition) : value.substring(position);
      if (text2.length > 0)
        tokens.push({
          value: text2,
          foreground,
          background,
          decorations: new Set(decorations2)
        });
      if (findResult.sequence) {
        const commands = parseSequence(findResult.sequence);
        for (const styleToken of commands)
          if (styleToken.type === "resetAll") {
            foreground = null;
            background = null;
            decorations2.clear();
          } else if (styleToken.type === "resetForegroundColor")
            foreground = null;
          else if (styleToken.type === "resetBackgroundColor")
            background = null;
          else if (styleToken.type === "resetDecoration")
            decorations2.delete(styleToken.value);
        for (const styleToken of commands)
          if (styleToken.type === "setForegroundColor")
            foreground = styleToken.value;
          else if (styleToken.type === "setBackgroundColor")
            background = styleToken.value;
          else if (styleToken.type === "setDecoration")
            decorations2.add(styleToken.value);
      }
      position = findResult.position;
    } while (position < value.length);
    return tokens;
  } };
}
var defaultNamedColorsMap = {
  black: "#000000",
  red: "#bb0000",
  green: "#00bb00",
  yellow: "#bbbb00",
  blue: "#0000bb",
  magenta: "#ff00ff",
  cyan: "#00bbbb",
  white: "#eeeeee",
  brightBlack: "#555555",
  brightRed: "#ff5555",
  brightGreen: "#00ff00",
  brightYellow: "#ffff55",
  brightBlue: "#5555ff",
  brightMagenta: "#ff55ff",
  brightCyan: "#55ffff",
  brightWhite: "#ffffff"
};
function createColorPalette(namedColorsMap = defaultNamedColorsMap) {
  function namedColor(name) {
    return namedColorsMap[name];
  }
  function rgbColor(rgb) {
    return `#${rgb.map((x) => Math.max(0, Math.min(x, 255)).toString(16).padStart(2, "0")).join("")}`;
  }
  let colorTable;
  function getColorTable() {
    if (colorTable)
      return colorTable;
    colorTable = [];
    for (let i = 0;i < namedColors.length; i++)
      colorTable.push(namedColor(namedColors[i]));
    let levels = [
      0,
      95,
      135,
      175,
      215,
      255
    ];
    for (let r = 0;r < 6; r++)
      for (let g = 0;g < 6; g++)
        for (let b = 0;b < 6; b++)
          colorTable.push(rgbColor([
            levels[r],
            levels[g],
            levels[b]
          ]));
    let level = 8;
    for (let i = 0;i < 24; i++, level += 10)
      colorTable.push(rgbColor([
        level,
        level,
        level
      ]));
    return colorTable;
  }
  function tableColor(index) {
    return getColorTable()[index];
  }
  function value(color) {
    switch (color.type) {
      case "named":
        return namedColor(color.name);
      case "rgb":
        return rgbColor(color.rgb);
      case "table":
        return tableColor(color.index);
    }
  }
  return { value };
}
var RE_HEX_COLOR = /#([0-9a-f]{3,8})/i;
var RE_CSS_VAR_ANSI = /var\((--[\w-]+-ansi-[\w-]+)\)/;
var defaultAnsiColors = {
  black: "#000000",
  red: "#cd3131",
  green: "#0DBC79",
  yellow: "#E5E510",
  blue: "#2472C8",
  magenta: "#BC3FBC",
  cyan: "#11A8CD",
  white: "#E5E5E5",
  brightBlack: "#666666",
  brightRed: "#F14C4C",
  brightGreen: "#23D18B",
  brightYellow: "#F5F543",
  brightBlue: "#3B8EEA",
  brightMagenta: "#D670D6",
  brightCyan: "#29B8DB",
  brightWhite: "#FFFFFF"
};
function tokenizeAnsiWithTheme(theme, fileContents, options) {
  const colorReplacements = resolveColorReplacements(theme, options);
  const lines = splitLines(fileContents);
  const colorPalette = createColorPalette(Object.fromEntries(namedColors.map((name) => {
    const key2 = `terminal.ansi${name[0].toUpperCase()}${name.substring(1)}`;
    return [name, theme.colors?.[key2] || defaultAnsiColors[name]];
  })));
  const parser = createAnsiSequenceParser();
  return lines.map((line) => parser.parse(line[0]).map((token) => {
    let color;
    let bgColor;
    if (token.decorations.has("reverse")) {
      color = token.background ? colorPalette.value(token.background) : theme.bg;
      bgColor = token.foreground ? colorPalette.value(token.foreground) : theme.fg;
    } else {
      color = token.foreground ? colorPalette.value(token.foreground) : theme.fg;
      bgColor = token.background ? colorPalette.value(token.background) : undefined;
    }
    color = applyColorReplacements(color, colorReplacements);
    bgColor = applyColorReplacements(bgColor, colorReplacements);
    if (token.decorations.has("dim"))
      color = dimColor(color);
    let fontStyle = FontStyle.None;
    if (token.decorations.has("bold"))
      fontStyle |= FontStyle.Bold;
    if (token.decorations.has("italic"))
      fontStyle |= FontStyle.Italic;
    if (token.decorations.has("underline"))
      fontStyle |= FontStyle.Underline;
    if (token.decorations.has("strikethrough"))
      fontStyle |= FontStyle.Strikethrough;
    return {
      content: token.value,
      offset: line[1],
      color,
      bgColor,
      fontStyle
    };
  }));
}
function dimColor(color) {
  const hexMatch = color.match(RE_HEX_COLOR);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 8) {
      const alpha = Math.round(Number.parseInt(hex.slice(6, 8), 16) / 2).toString(16).padStart(2, "0");
      return `#${hex.slice(0, 6)}${alpha}`;
    } else if (hex.length === 6)
      return `#${hex}80`;
    else if (hex.length === 4) {
      const r = hex[0];
      const g = hex[1];
      const b = hex[2];
      const a = hex[3];
      return `#${r}${r}${g}${g}${b}${b}${Math.round(Number.parseInt(`${a}${a}`, 16) / 2).toString(16).padStart(2, "0")}`;
    } else if (hex.length === 3) {
      const r = hex[0];
      const g = hex[1];
      const b = hex[2];
      return `#${r}${r}${g}${g}${b}${b}80`;
    }
  }
  const cssVarMatch = color.match(RE_CSS_VAR_ANSI);
  if (cssVarMatch)
    return `var(${cssVarMatch[1]}-dim)`;
  return color;
}
function codeToTokensBase2(primitive, code, options = {}) {
  const lang = primitive.resolveLangAlias(options.lang || "text");
  const { theme: themeName = primitive.getLoadedThemes()[0] } = options;
  if (!isPlainLang(lang) && !isNoneTheme(themeName) && lang === "ansi") {
    const { theme } = primitive.setTheme(themeName);
    return tokenizeAnsiWithTheme(theme, code, options);
  }
  return codeToTokensBase(primitive, code, options);
}
function codeToTokens(primitive, code, options) {
  let bg;
  let fg;
  let tokens;
  let themeName;
  let rootStyle;
  let grammarState;
  if ("themes" in options) {
    const { defaultColor = "light", cssVariablePrefix = "--shiki-", colorsRendering = "css-vars" } = options;
    const themes = Object.entries(options.themes).filter((i) => i[1]).map((i) => ({
      color: i[0],
      theme: i[1]
    })).sort((a, b) => a.color === defaultColor ? -1 : b.color === defaultColor ? 1 : 0);
    if (themes.length === 0)
      throw new ShikiError("`themes` option must not be empty");
    const themeTokens = codeToTokensWithThemes(primitive, code, options, codeToTokensBase2);
    grammarState = getLastGrammarStateFromMap(themeTokens);
    if (defaultColor && defaultColor !== "light-dark()" && !themes.some((t) => t.color === defaultColor))
      throw new ShikiError(`\`themes\` option must contain the defaultColor key \`${defaultColor}\``);
    const themeRegs = themes.map((t) => primitive.getTheme(t.theme));
    const themesOrder = themes.map((t) => t.color);
    tokens = themeTokens.map((line) => line.map((token) => flatTokenVariants(token, themesOrder, cssVariablePrefix, defaultColor, colorsRendering)));
    if (grammarState)
      setLastGrammarStateToMap(tokens, grammarState);
    const themeColorReplacements = themes.map((t) => resolveColorReplacements(t.theme, options));
    fg = mapThemeColors(themes, themeRegs, themeColorReplacements, cssVariablePrefix, defaultColor, "fg", colorsRendering);
    bg = mapThemeColors(themes, themeRegs, themeColorReplacements, cssVariablePrefix, defaultColor, "bg", colorsRendering);
    themeName = `shiki-themes ${themeRegs.map((t) => t.name).join(" ")}`;
    rootStyle = defaultColor ? undefined : [fg, bg].join(";");
  } else if ("theme" in options) {
    const colorReplacements = resolveColorReplacements(options.theme, options);
    tokens = codeToTokensBase2(primitive, code, options);
    const _theme = primitive.getTheme(options.theme);
    bg = applyColorReplacements(_theme.bg, colorReplacements);
    fg = applyColorReplacements(_theme.fg, colorReplacements);
    themeName = _theme.name;
    grammarState = getLastGrammarStateFromMap(tokens);
  } else
    throw new ShikiError("Invalid options, either `theme` or `themes` must be provided");
  return {
    tokens,
    fg,
    bg,
    themeName,
    rootStyle,
    grammarState
  };
}
function mapThemeColors(themes, themeRegs, themeColorReplacements, cssVariablePrefix, defaultColor, property, colorsRendering) {
  return themes.map((t, idx) => {
    const value = applyColorReplacements(themeRegs[idx][property], themeColorReplacements[idx]) || "inherit";
    const cssVar = `${cssVariablePrefix + t.color}${property === "bg" ? "-bg" : ""}:${value}`;
    if (idx === 0 && defaultColor) {
      if (defaultColor === "light-dark()" && themes.length > 1) {
        const lightIndex = themes.findIndex((t2) => t2.color === "light");
        const darkIndex = themes.findIndex((t2) => t2.color === "dark");
        if (lightIndex === -1 || darkIndex === -1)
          throw new ShikiError('When using `defaultColor: "light-dark()"`, you must provide both `light` and `dark` themes');
        return `light-dark(${applyColorReplacements(themeRegs[lightIndex][property], themeColorReplacements[lightIndex]) || "inherit"}, ${applyColorReplacements(themeRegs[darkIndex][property], themeColorReplacements[darkIndex]) || "inherit"});${cssVar}`;
      }
      return value;
    }
    if (colorsRendering === "css-vars")
      return cssVar;
    return null;
  }).filter((i) => !!i).join(";");
}
var RE_WHITESPACE_ONLY = /^\s+$/;
var RE_LEADING_TRAILING_WHITESPACE = /^(\s*)(.*?)(\s*)$/;
function codeToHast(primitive, code, options, transformerContext = {
  meta: {},
  options,
  codeToHast: (_code, _options) => codeToHast(primitive, _code, _options),
  codeToTokens: (_code, _options) => codeToTokens(primitive, _code, _options)
}) {
  let input = code;
  for (const transformer of getTransformers(options))
    input = transformer.preprocess?.call(transformerContext, input, options) || input;
  let { tokens, fg, bg, themeName, rootStyle, grammarState } = codeToTokens(primitive, input, options);
  const { mergeWhitespaces = true, mergeSameStyleTokens = false } = options;
  if (mergeWhitespaces === true)
    tokens = mergeWhitespaceTokens(tokens);
  else if (mergeWhitespaces === "never")
    tokens = splitWhitespaceTokens(tokens);
  if (mergeSameStyleTokens)
    tokens = mergeAdjacentStyledTokens(tokens);
  const contextSource = {
    ...transformerContext,
    get source() {
      return input;
    }
  };
  for (const transformer of getTransformers(options))
    tokens = transformer.tokens?.call(contextSource, tokens) || tokens;
  return tokensToHast(tokens, {
    ...options,
    fg,
    bg,
    themeName,
    rootStyle: options.rootStyle === false ? false : options.rootStyle ?? rootStyle
  }, contextSource, grammarState);
}
function tokensToHast(tokens, options, transformerContext, grammarState = getLastGrammarStateFromMap(tokens)) {
  const transformers = getTransformers(options);
  const lines = [];
  const root2 = {
    type: "root",
    children: []
  };
  const { structure = "classic", tabindex = "0" } = options;
  const properties = { class: `shiki ${options.themeName || ""}` };
  if (options.rootStyle !== false)
    if (options.rootStyle != null)
      properties.style = options.rootStyle;
    else
      properties.style = `background-color:${options.bg};color:${options.fg}`;
  if (tabindex !== false && tabindex != null)
    properties.tabindex = tabindex.toString();
  for (const [key2, value] of Object.entries(options.meta || {}))
    if (!key2.startsWith("_"))
      properties[key2] = value;
  let preNode = {
    type: "element",
    tagName: "pre",
    properties,
    children: [],
    data: options.data
  };
  let codeNode = {
    type: "element",
    tagName: "code",
    properties: {},
    children: lines
  };
  const lineNodes = [];
  const context = {
    ...transformerContext,
    structure,
    addClassToHast,
    get source() {
      return transformerContext.source;
    },
    get tokens() {
      return tokens;
    },
    get options() {
      return options;
    },
    get root() {
      return root2;
    },
    get pre() {
      return preNode;
    },
    get code() {
      return codeNode;
    },
    get lines() {
      return lineNodes;
    }
  };
  tokens.forEach((line, idx) => {
    if (idx) {
      if (structure === "inline")
        root2.children.push({
          type: "element",
          tagName: "br",
          properties: {},
          children: []
        });
      else if (structure === "classic")
        lines.push({
          type: "text",
          value: `
`
        });
    }
    let lineNode = {
      type: "element",
      tagName: "span",
      properties: { class: "line" },
      children: []
    };
    let col = 0;
    for (const token of line) {
      let tokenNode = {
        type: "element",
        tagName: "span",
        properties: { ...token.htmlAttrs },
        children: [{
          type: "text",
          value: token.content
        }]
      };
      const style = stringifyTokenStyle(token.htmlStyle || getTokenStyleObject(token));
      if (style)
        tokenNode.properties.style = style;
      for (const transformer of transformers)
        tokenNode = transformer?.span?.call(context, tokenNode, idx + 1, col, lineNode, token) || tokenNode;
      if (structure === "inline")
        root2.children.push(tokenNode);
      else if (structure === "classic")
        lineNode.children.push(tokenNode);
      col += token.content.length;
    }
    if (structure === "classic") {
      for (const transformer of transformers)
        lineNode = transformer?.line?.call(context, lineNode, idx + 1) || lineNode;
      lineNodes.push(lineNode);
      lines.push(lineNode);
    } else if (structure === "inline")
      lineNodes.push(lineNode);
  });
  if (structure === "classic") {
    for (const transformer of transformers)
      codeNode = transformer?.code?.call(context, codeNode) || codeNode;
    preNode.children.push(codeNode);
    for (const transformer of transformers)
      preNode = transformer?.pre?.call(context, preNode) || preNode;
    root2.children.push(preNode);
  } else if (structure === "inline") {
    const syntheticLines = [];
    let currentLine = {
      type: "element",
      tagName: "span",
      properties: { class: "line" },
      children: []
    };
    for (const child of root2.children)
      if (child.type === "element" && child.tagName === "br") {
        syntheticLines.push(currentLine);
        currentLine = {
          type: "element",
          tagName: "span",
          properties: { class: "line" },
          children: []
        };
      } else if (child.type === "element" || child.type === "text")
        currentLine.children.push(child);
    syntheticLines.push(currentLine);
    let transformedCode = {
      type: "element",
      tagName: "code",
      properties: {},
      children: syntheticLines
    };
    for (const transformer of transformers)
      transformedCode = transformer?.code?.call(context, transformedCode) || transformedCode;
    root2.children = [];
    for (let i = 0;i < transformedCode.children.length; i++) {
      if (i > 0)
        root2.children.push({
          type: "element",
          tagName: "br",
          properties: {},
          children: []
        });
      const line = transformedCode.children[i];
      if (line.type === "element")
        root2.children.push(...line.children);
    }
  }
  let result = root2;
  for (const transformer of transformers)
    result = transformer?.root?.call(context, result) || result;
  if (grammarState)
    setLastGrammarStateToMap(result, grammarState);
  return result;
}
function mergeWhitespaceTokens(tokens) {
  return tokens.map((line) => {
    const newLine = [];
    let carryOnContent = "";
    let firstOffset;
    line.forEach((token, idx) => {
      const couldMerge = !(token.fontStyle && (token.fontStyle & FontStyle.Underline || token.fontStyle & FontStyle.Strikethrough));
      if (couldMerge && RE_WHITESPACE_ONLY.test(token.content) && line[idx + 1]) {
        if (firstOffset === undefined)
          firstOffset = token.offset;
        carryOnContent += token.content;
      } else if (carryOnContent) {
        if (couldMerge)
          newLine.push({
            ...token,
            offset: firstOffset,
            content: carryOnContent + token.content
          });
        else
          newLine.push({
            content: carryOnContent,
            offset: firstOffset
          }, token);
        firstOffset = undefined;
        carryOnContent = "";
      } else
        newLine.push(token);
    });
    return newLine;
  });
}
function splitWhitespaceTokens(tokens) {
  return tokens.map((line) => {
    return line.flatMap((token) => {
      if (RE_WHITESPACE_ONLY.test(token.content))
        return token;
      const match = token.content.match(RE_LEADING_TRAILING_WHITESPACE);
      if (!match)
        return token;
      const [, leading, content, trailing] = match;
      if (!leading && !trailing)
        return token;
      const expanded = [{
        ...token,
        offset: token.offset + leading.length,
        content
      }];
      if (leading)
        expanded.unshift({
          content: leading,
          offset: token.offset
        });
      if (trailing)
        expanded.push({
          content: trailing,
          offset: token.offset + leading.length + content.length
        });
      return expanded;
    });
  });
}
function mergeAdjacentStyledTokens(tokens) {
  return tokens.map((line) => {
    const newLine = [];
    for (const token of line) {
      if (newLine.length === 0) {
        newLine.push({ ...token });
        continue;
      }
      const prevToken = newLine.at(-1);
      const prevStyle = stringifyTokenStyle(prevToken.htmlStyle || getTokenStyleObject(prevToken));
      const currentStyle = stringifyTokenStyle(token.htmlStyle || getTokenStyleObject(token));
      const isPrevDecorated = prevToken.fontStyle && (prevToken.fontStyle & FontStyle.Underline || prevToken.fontStyle & FontStyle.Strikethrough);
      const isDecorated = token.fontStyle && (token.fontStyle & FontStyle.Underline || token.fontStyle & FontStyle.Strikethrough);
      if (!isPrevDecorated && !isDecorated && prevStyle === currentStyle)
        prevToken.content += token.content;
      else
        newLine.push({ ...token });
    }
    return newLine;
  });
}
var hastToHtml = toHtml;
function codeToHtml(primitive, code, options) {
  const context = {
    meta: {},
    options,
    codeToHast: (_code, _options) => codeToHast(primitive, _code, _options),
    codeToTokens: (_code, _options) => codeToTokens(primitive, _code, _options)
  };
  let result = hastToHtml(codeToHast(primitive, code, options, context));
  for (const transformer of getTransformers(options))
    result = transformer.postprocess?.call(context, result, options) || result;
  return result;
}
async function createHighlighterCore(options) {
  const primitive = await createShikiPrimitiveAsync(options);
  return {
    getLastGrammarState: (...args) => getLastGrammarState(primitive, ...args),
    codeToTokensBase: (code, options2) => codeToTokensBase2(primitive, code, options2),
    codeToTokensWithThemes: (code, options2) => codeToTokensWithThemes(primitive, code, options2),
    codeToTokens: (code, options2) => codeToTokens(primitive, code, options2),
    codeToHast: (code, options2) => codeToHast(primitive, code, options2),
    codeToHtml: (code, options2) => codeToHtml(primitive, code, options2),
    getBundledLanguages: () => ({}),
    getBundledThemes: () => ({}),
    ...primitive,
    getInternalContext: () => primitive
  };
}
function createHighlighterCoreSync(options) {
  const internal = createShikiPrimitive(options);
  return {
    getLastGrammarState: (...args) => getLastGrammarState(internal, ...args),
    codeToTokensBase: (code, options2) => codeToTokensBase2(internal, code, options2),
    codeToTokensWithThemes: (code, options2) => codeToTokensWithThemes(internal, code, options2),
    codeToTokens: (code, options2) => codeToTokens(internal, code, options2),
    codeToHast: (code, options2) => codeToHast(internal, code, options2),
    codeToHtml: (code, options2) => codeToHtml(internal, code, options2),
    getBundledLanguages: () => ({}),
    getBundledThemes: () => ({}),
    ...internal,
    getInternalContext: () => internal
  };
}
function makeSingletonHighlighterCore(createHighlighter) {
  let _shiki;
  async function getSingletonHighlighterCore(options) {
    if (!_shiki) {
      _shiki = createHighlighter({
        ...options,
        themes: options.themes || [],
        langs: options.langs || []
      });
      return _shiki;
    } else {
      const s = await _shiki;
      await Promise.all([s.loadTheme(...options.themes || []), s.loadLanguage(...options.langs || [])]);
      return s;
    }
  }
  return getSingletonHighlighterCore;
}
var getSingletonHighlighterCore = /* @__PURE__ */ makeSingletonHighlighterCore(createHighlighterCore);
function createBundledHighlighter(options) {
  const bundledLanguages = options.langs;
  const bundledThemes = options.themes;
  const engine = options.engine;
  async function createHighlighter(options2) {
    function resolveLang(lang) {
      if (typeof lang === "string") {
        lang = options2.langAlias?.[lang] || lang;
        if (isSpecialLang(lang))
          return [];
        const bundle = bundledLanguages[lang];
        if (!bundle)
          throw new ShikiError(`Language \`${lang}\` is not included in this bundle. You may want to load it from external source.`);
        return bundle;
      }
      return lang;
    }
    function resolveTheme(theme) {
      if (isSpecialTheme(theme))
        return "none";
      if (typeof theme === "string") {
        const bundle = bundledThemes[theme];
        if (!bundle)
          throw new ShikiError(`Theme \`${theme}\` is not included in this bundle. You may want to load it from external source.`);
        return bundle;
      }
      return theme;
    }
    const _themes = (options2.themes ?? []).map((i) => resolveTheme(i));
    const langs = (options2.langs ?? []).map((i) => resolveLang(i));
    const core2 = await createHighlighterCore({
      engine: options2.engine ?? engine(),
      ...options2,
      themes: _themes,
      langs
    });
    return {
      ...core2,
      loadLanguage(...langs2) {
        return core2.loadLanguage(...langs2.map(resolveLang));
      },
      loadTheme(...themes) {
        return core2.loadTheme(...themes.map(resolveTheme));
      },
      getBundledLanguages() {
        return bundledLanguages;
      },
      getBundledThemes() {
        return bundledThemes;
      }
    };
  }
  return createHighlighter;
}
function makeSingletonHighlighter(createHighlighter) {
  let _shiki;
  async function getSingletonHighlighter(options = {}) {
    if (!_shiki) {
      _shiki = createHighlighter({
        ...options,
        themes: [],
        langs: []
      });
      const s = await _shiki;
      await Promise.all([s.loadTheme(...options.themes || []), s.loadLanguage(...options.langs || [])]);
      return s;
    } else {
      const s = await _shiki;
      await Promise.all([s.loadTheme(...options.themes || []), s.loadLanguage(...options.langs || [])]);
      return s;
    }
  }
  return getSingletonHighlighter;
}
function createSingletonShorthands(createHighlighter, config) {
  const getSingletonHighlighter = makeSingletonHighlighter(createHighlighter);
  async function get(code, options) {
    const shiki = await getSingletonHighlighter({
      langs: [options.lang],
      themes: "theme" in options ? [options.theme] : Object.values(options.themes)
    });
    const langs = await config?.guessEmbeddedLanguages?.(code, options.lang, shiki);
    if (langs)
      await shiki.loadLanguage(...langs);
    return shiki;
  }
  return {
    getSingletonHighlighter(options) {
      return getSingletonHighlighter(options);
    },
    async codeToHtml(code, options) {
      return (await get(code, options)).codeToHtml(code, options);
    },
    async codeToHast(code, options) {
      return (await get(code, options)).codeToHast(code, options);
    },
    async codeToTokens(code, options) {
      return (await get(code, options)).codeToTokens(code, options);
    },
    async codeToTokensBase(code, options) {
      return (await get(code, options)).codeToTokensBase(code, options);
    },
    async codeToTokensWithThemes(code, options) {
      return (await get(code, options)).codeToTokensWithThemes(code, options);
    },
    async getLastGrammarState(code, options) {
      return (await getSingletonHighlighter({
        langs: [options.lang],
        themes: [options.theme]
      })).getLastGrammarState(code, options);
    }
  };
}
function createCssVariablesTheme(options = {}) {
  const { name = "css-variables", variablePrefix = "--shiki-", fontStyle = true } = options;
  const variable = (name2) => {
    if (options.variableDefaults?.[name2])
      return `var(${variablePrefix}${name2}, ${options.variableDefaults[name2]})`;
    return `var(${variablePrefix}${name2})`;
  };
  const theme = {
    name,
    type: "dark",
    colors: {
      "editor.foreground": variable("foreground"),
      "editor.background": variable("background"),
      "terminal.ansiBlack": variable("ansi-black"),
      "terminal.ansiRed": variable("ansi-red"),
      "terminal.ansiGreen": variable("ansi-green"),
      "terminal.ansiYellow": variable("ansi-yellow"),
      "terminal.ansiBlue": variable("ansi-blue"),
      "terminal.ansiMagenta": variable("ansi-magenta"),
      "terminal.ansiCyan": variable("ansi-cyan"),
      "terminal.ansiWhite": variable("ansi-white"),
      "terminal.ansiBrightBlack": variable("ansi-bright-black"),
      "terminal.ansiBrightRed": variable("ansi-bright-red"),
      "terminal.ansiBrightGreen": variable("ansi-bright-green"),
      "terminal.ansiBrightYellow": variable("ansi-bright-yellow"),
      "terminal.ansiBrightBlue": variable("ansi-bright-blue"),
      "terminal.ansiBrightMagenta": variable("ansi-bright-magenta"),
      "terminal.ansiBrightCyan": variable("ansi-bright-cyan"),
      "terminal.ansiBrightWhite": variable("ansi-bright-white")
    },
    tokenColors: [
      {
        scope: [
          "keyword.operator.accessor",
          "meta.group.braces.round.function.arguments",
          "meta.template.expression",
          "markup.fenced_code meta.embedded.block"
        ],
        settings: { foreground: variable("foreground") }
      },
      {
        scope: "emphasis",
        settings: { fontStyle: "italic" }
      },
      {
        scope: [
          "strong",
          "markup.heading.markdown",
          "markup.bold.markdown"
        ],
        settings: { fontStyle: "bold" }
      },
      {
        scope: ["markup.italic.markdown"],
        settings: { fontStyle: "italic" }
      },
      {
        scope: "meta.link.inline.markdown",
        settings: {
          fontStyle: "underline",
          foreground: variable("token-link")
        }
      },
      {
        scope: [
          "string",
          "markup.fenced_code",
          "markup.inline"
        ],
        settings: { foreground: variable("token-string") }
      },
      {
        scope: ["comment", "string.quoted.docstring.multi"],
        settings: { foreground: variable("token-comment") }
      },
      {
        scope: [
          "constant.numeric",
          "constant.language",
          "constant.other.placeholder",
          "constant.character.format.placeholder",
          "variable.language.this",
          "variable.other.object",
          "variable.other.class",
          "variable.other.constant",
          "meta.property-name",
          "meta.property-value",
          "support"
        ],
        settings: { foreground: variable("token-constant") }
      },
      {
        scope: [
          "keyword",
          "storage.modifier",
          "storage.type",
          "storage.control.clojure",
          "entity.name.function.clojure",
          "entity.name.tag.yaml",
          "support.function.node",
          "support.type.property-name.json",
          "punctuation.separator.key-value",
          "punctuation.definition.template-expression"
        ],
        settings: { foreground: variable("token-keyword") }
      },
      {
        scope: "variable.parameter.function",
        settings: { foreground: variable("token-parameter") }
      },
      {
        scope: [
          "support.function",
          "entity.name.type",
          "entity.other.inherited-class",
          "meta.function-call",
          "meta.instance.constructor",
          "entity.other.attribute-name",
          "entity.name.function",
          "constant.keyword.clojure"
        ],
        settings: { foreground: variable("token-function") }
      },
      {
        scope: [
          "entity.name.tag",
          "string.quoted",
          "string.regexp",
          "string.interpolated",
          "string.template",
          "string.unquoted.plain.out.yaml",
          "keyword.other.template"
        ],
        settings: { foreground: variable("token-string-expression") }
      },
      {
        scope: [
          "punctuation.definition.arguments",
          "punctuation.definition.dict",
          "punctuation.separator",
          "meta.function-call.arguments"
        ],
        settings: { foreground: variable("token-punctuation") }
      },
      {
        scope: ["markup.underline.link", "punctuation.definition.metadata.markdown"],
        settings: { foreground: variable("token-link") }
      },
      {
        scope: ["beginning.punctuation.definition.list.markdown"],
        settings: { foreground: variable("token-string") }
      },
      {
        scope: [
          "punctuation.definition.string.begin.markdown",
          "punctuation.definition.string.end.markdown",
          "string.other.link.title.markdown",
          "string.other.link.description.markdown"
        ],
        settings: { foreground: variable("token-keyword") }
      },
      {
        scope: [
          "markup.inserted",
          "meta.diff.header.to-file",
          "punctuation.definition.inserted"
        ],
        settings: { foreground: variable("token-inserted") }
      },
      {
        scope: [
          "markup.deleted",
          "meta.diff.header.from-file",
          "punctuation.definition.deleted"
        ],
        settings: { foreground: variable("token-deleted") }
      },
      {
        scope: ["markup.changed", "punctuation.definition.changed"],
        settings: { foreground: variable("token-changed") }
      }
    ]
  };
  if (!fontStyle)
    theme.tokenColors = theme.tokenColors?.map((tokenColor) => {
      if (tokenColor.settings?.fontStyle)
        delete tokenColor.settings.fontStyle;
      return tokenColor;
    });
  return theme;
}

export { __exportAll, __reExport, ShikiError, resolveColorReplacements, applyColorReplacements, toArray, normalizeGetter, isPlainLang, isSpecialLang, isNoneTheme, isSpecialTheme, splitLines, normalizeTheme, createShikiPrimitive, createShikiInternalSync, createShikiPrimitiveAsync, createShikiInternal, getLastGrammarState, tokenizeWithTheme, codeToTokensWithThemes, addClassToHast, createPositionConverter, guessEmbeddedLanguages, splitToken, splitTokens, flatTokenVariants, getTokenStyleObject, stringifyTokenStyle, transformerDecorations, tokenizeAnsiWithTheme, codeToTokensBase2 as codeToTokensBase, codeToTokens, codeToHast, tokensToHast, hastToHtml, codeToHtml, createHighlighterCore, createHighlighterCoreSync, makeSingletonHighlighterCore, getSingletonHighlighterCore, createBundledHighlighter, makeSingletonHighlighter, createSingletonShorthands, createCssVariablesTheme };

//# debugId=DF5B1307CA915CC864756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3NoaWtpL2Rpc3QvY2h1bmstRDFTd0dyRk4ubWpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9Ac2hpa2lqcy90eXBlcy9kaXN0L2luZGV4Lm1qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQHNoaWtpanMvdnNjb2RlLXRleHRtYXRlL2Rpc3QvaW5kZXguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BzaGlraWpzL3ByaW1pdGl2ZS9kaXN0L2luZGV4Lm1qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvaHRtbC12b2lkLWVsZW1lbnRzL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9wcm9wZXJ0eS1pbmZvcm1hdGlvbi9saWIvdXRpbC9zY2hlbWEuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Byb3BlcnR5LWluZm9ybWF0aW9uL2xpYi91dGlsL21lcmdlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9wcm9wZXJ0eS1pbmZvcm1hdGlvbi9saWIvbm9ybWFsaXplLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9wcm9wZXJ0eS1pbmZvcm1hdGlvbi9saWIvdXRpbC9pbmZvLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9wcm9wZXJ0eS1pbmZvcm1hdGlvbi9saWIvdXRpbC90eXBlcy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvcHJvcGVydHktaW5mb3JtYXRpb24vbGliL3V0aWwvZGVmaW5lZC1pbmZvLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9wcm9wZXJ0eS1pbmZvcm1hdGlvbi9saWIvdXRpbC9jcmVhdGUuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Byb3BlcnR5LWluZm9ybWF0aW9uL2xpYi9hcmlhLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9wcm9wZXJ0eS1pbmZvcm1hdGlvbi9saWIvdXRpbC9jYXNlLXNlbnNpdGl2ZS10cmFuc2Zvcm0uanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Byb3BlcnR5LWluZm9ybWF0aW9uL2xpYi91dGlsL2Nhc2UtaW5zZW5zaXRpdmUtdHJhbnNmb3JtLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9wcm9wZXJ0eS1pbmZvcm1hdGlvbi9saWIvaHRtbC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvcHJvcGVydHktaW5mb3JtYXRpb24vbGliL3N2Zy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvcHJvcGVydHktaW5mb3JtYXRpb24vbGliL3hsaW5rLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9wcm9wZXJ0eS1pbmZvcm1hdGlvbi9saWIveG1sbnMuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Byb3BlcnR5LWluZm9ybWF0aW9uL2xpYi94bWwuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Byb3BlcnR5LWluZm9ybWF0aW9uL2xpYi9maW5kLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9wcm9wZXJ0eS1pbmZvcm1hdGlvbi9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvendpdGNoL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHJpbmdpZnktZW50aXRpZXMvbGliL2NvcmUuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0cmluZ2lmeS1lbnRpdGllcy9saWIvdXRpbC90by1oZXhhZGVjaW1hbC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3RyaW5naWZ5LWVudGl0aWVzL2xpYi91dGlsL3RvLWRlY2ltYWwuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2NoYXJhY3Rlci1lbnRpdGllcy1sZWdhY3kvaW5kZXguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2NoYXJhY3Rlci1lbnRpdGllcy1odG1sNC9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3RyaW5naWZ5LWVudGl0aWVzL2xpYi9jb25zdGFudC9kYW5nZXJvdXMuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0cmluZ2lmeS1lbnRpdGllcy9saWIvdXRpbC90by1uYW1lZC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3RyaW5naWZ5LWVudGl0aWVzL2xpYi91dGlsL2Zvcm1hdC1zbWFydC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3RyaW5naWZ5LWVudGl0aWVzL2xpYi9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvaGFzdC11dGlsLXRvLWh0bWwvbGliL2hhbmRsZS9jb21tZW50LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9oYXN0LXV0aWwtdG8taHRtbC9saWIvaGFuZGxlL2RvY3R5cGUuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Njb3VudC9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvY29tbWEtc2VwYXJhdGVkLXRva2Vucy9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3BhY2Utc2VwYXJhdGVkLXRva2Vucy9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvaGFzdC11dGlsLXdoaXRlc3BhY2UvbGliL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9oYXN0LXV0aWwtdG8taHRtbC9saWIvb21pc3Npb24vdXRpbC9zaWJsaW5ncy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvaGFzdC11dGlsLXRvLWh0bWwvbGliL29taXNzaW9uL29taXNzaW9uLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9oYXN0LXV0aWwtdG8taHRtbC9saWIvb21pc3Npb24vY2xvc2luZy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvaGFzdC11dGlsLXRvLWh0bWwvbGliL29taXNzaW9uL29wZW5pbmcuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2hhc3QtdXRpbC10by1odG1sL2xpYi9oYW5kbGUvZWxlbWVudC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvaGFzdC11dGlsLXRvLWh0bWwvbGliL2hhbmRsZS90ZXh0LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9oYXN0LXV0aWwtdG8taHRtbC9saWIvaGFuZGxlL3Jhdy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvaGFzdC11dGlsLXRvLWh0bWwvbGliL2hhbmRsZS9yb290LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9oYXN0LXV0aWwtdG8taHRtbC9saWIvaGFuZGxlL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9oYXN0LXV0aWwtdG8taHRtbC9saWIvaW5kZXguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BzaGlraWpzL2NvcmUvZGlzdC9pbmRleC5tanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbCiAgICAiLy8jcmVnaW9uIFxcMHJvbGxkb3duL3J1bnRpbWUuanNcbnZhciBfX2RlZlByb3AgPSBPYmplY3QuZGVmaW5lUHJvcGVydHk7XG52YXIgX19nZXRPd25Qcm9wRGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG52YXIgX19nZXRPd25Qcm9wTmFtZXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcztcbnZhciBfX2hhc093blByb3AgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIF9fZXhwb3J0QWxsID0gKGFsbCwgbm9fc3ltYm9scykgPT4ge1xuXHRsZXQgdGFyZ2V0ID0ge307XG5cdGZvciAodmFyIG5hbWUgaW4gYWxsKSBfX2RlZlByb3AodGFyZ2V0LCBuYW1lLCB7XG5cdFx0Z2V0OiBhbGxbbmFtZV0sXG5cdFx0ZW51bWVyYWJsZTogdHJ1ZVxuXHR9KTtcblx0aWYgKCFub19zeW1ib2xzKSBfX2RlZlByb3AodGFyZ2V0LCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6IFwiTW9kdWxlXCIgfSk7XG5cdHJldHVybiB0YXJnZXQ7XG59O1xudmFyIF9fY29weVByb3BzID0gKHRvLCBmcm9tLCBleGNlcHQsIGRlc2MpID0+IHtcblx0aWYgKGZyb20gJiYgdHlwZW9mIGZyb20gPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGZyb20gPT09IFwiZnVuY3Rpb25cIikgZm9yICh2YXIga2V5cyA9IF9fZ2V0T3duUHJvcE5hbWVzKGZyb20pLCBpID0gMCwgbiA9IGtleXMubGVuZ3RoLCBrZXk7IGkgPCBuOyBpKyspIHtcblx0XHRrZXkgPSBrZXlzW2ldO1xuXHRcdGlmICghX19oYXNPd25Qcm9wLmNhbGwodG8sIGtleSkgJiYga2V5ICE9PSBleGNlcHQpIF9fZGVmUHJvcCh0bywga2V5LCB7XG5cdFx0XHRnZXQ6ICgoaykgPT4gZnJvbVtrXSkuYmluZChudWxsLCBrZXkpLFxuXHRcdFx0ZW51bWVyYWJsZTogIShkZXNjID0gX19nZXRPd25Qcm9wRGVzYyhmcm9tLCBrZXkpKSB8fCBkZXNjLmVudW1lcmFibGVcblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gdG87XG59O1xudmFyIF9fcmVFeHBvcnQgPSAodGFyZ2V0LCBtb2QsIHNlY29uZFRhcmdldCkgPT4gKF9fY29weVByb3BzKHRhcmdldCwgbW9kLCBcImRlZmF1bHRcIiksIHNlY29uZFRhcmdldCAmJiBfX2NvcHlQcm9wcyhzZWNvbmRUYXJnZXQsIG1vZCwgXCJkZWZhdWx0XCIpKTtcbi8vI2VuZHJlZ2lvblxuZXhwb3J0IHsgX19yZUV4cG9ydCBhcyBuLCBfX2V4cG9ydEFsbCBhcyB0IH07XG4iLAogICAgIi8vI3JlZ2lvbiBzcmMvZXJyb3IudHNcbnZhciBTaGlraUVycm9yID0gY2xhc3MgZXh0ZW5kcyBFcnJvciB7XG5cdGNvbnN0cnVjdG9yKG1lc3NhZ2UpIHtcblx0XHRzdXBlcihtZXNzYWdlKTtcblx0XHR0aGlzLm5hbWUgPSBcIlNoaWtpRXJyb3JcIjtcblx0fVxufTtcbi8vI2VuZHJlZ2lvblxuZXhwb3J0IHsgU2hpa2lFcnJvciB9O1xuIiwKICAgICIvLyBzcmMvdXRpbHMudHNcbmZ1bmN0aW9uIGNsb25lKHNvbWV0aGluZykge1xuICByZXR1cm4gZG9DbG9uZShzb21ldGhpbmcpO1xufVxuZnVuY3Rpb24gZG9DbG9uZShzb21ldGhpbmcpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoc29tZXRoaW5nKSkge1xuICAgIHJldHVybiBjbG9uZUFycmF5KHNvbWV0aGluZyk7XG4gIH1cbiAgaWYgKHNvbWV0aGluZyBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgIHJldHVybiBzb21ldGhpbmc7XG4gIH1cbiAgaWYgKHR5cGVvZiBzb21ldGhpbmcgPT09IFwib2JqZWN0XCIpIHtcbiAgICByZXR1cm4gY2xvbmVPYmooc29tZXRoaW5nKTtcbiAgfVxuICByZXR1cm4gc29tZXRoaW5nO1xufVxuZnVuY3Rpb24gY2xvbmVBcnJheShhcnIpIHtcbiAgbGV0IHIgPSBbXTtcbiAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGFyci5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIHJbaV0gPSBkb0Nsb25lKGFycltpXSk7XG4gIH1cbiAgcmV0dXJuIHI7XG59XG5mdW5jdGlvbiBjbG9uZU9iaihvYmopIHtcbiAgbGV0IHIgPSB7fTtcbiAgZm9yIChsZXQga2V5IGluIG9iaikge1xuICAgIHJba2V5XSA9IGRvQ2xvbmUob2JqW2tleV0pO1xuICB9XG4gIHJldHVybiByO1xufVxuZnVuY3Rpb24gbWVyZ2VPYmplY3RzKHRhcmdldCwgLi4uc291cmNlcykge1xuICBzb3VyY2VzLmZvckVhY2goKHNvdXJjZSkgPT4ge1xuICAgIGZvciAobGV0IGtleSBpbiBzb3VyY2UpIHtcbiAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV07XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHRhcmdldDtcbn1cbmZ1bmN0aW9uIGJhc2VuYW1lKHBhdGgpIHtcbiAgY29uc3QgaWR4ID0gfnBhdGgubGFzdEluZGV4T2YoXCIvXCIpIHx8IH5wYXRoLmxhc3RJbmRleE9mKFwiXFxcXFwiKTtcbiAgaWYgKGlkeCA9PT0gMCkge1xuICAgIHJldHVybiBwYXRoO1xuICB9IGVsc2UgaWYgKH5pZHggPT09IHBhdGgubGVuZ3RoIC0gMSkge1xuICAgIHJldHVybiBiYXNlbmFtZShwYXRoLnN1YnN0cmluZygwLCBwYXRoLmxlbmd0aCAtIDEpKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcGF0aC5zdWJzdHIofmlkeCArIDEpO1xuICB9XG59XG52YXIgQ0FQVFVSSU5HX1JFR0VYX1NPVVJDRSA9IC9cXCQoXFxkKyl8XFwkeyhcXGQrKTpcXC8oZG93bmNhc2V8dXBjYXNlKX0vZztcbnZhciBSZWdleFNvdXJjZSA9IGNsYXNzIHtcbiAgc3RhdGljIGhhc0NhcHR1cmVzKHJlZ2V4U291cmNlKSB7XG4gICAgaWYgKHJlZ2V4U291cmNlID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIENBUFRVUklOR19SRUdFWF9TT1VSQ0UubGFzdEluZGV4ID0gMDtcbiAgICByZXR1cm4gQ0FQVFVSSU5HX1JFR0VYX1NPVVJDRS50ZXN0KHJlZ2V4U291cmNlKTtcbiAgfVxuICBzdGF0aWMgcmVwbGFjZUNhcHR1cmVzKHJlZ2V4U291cmNlLCBjYXB0dXJlU291cmNlLCBjYXB0dXJlSW5kaWNlcykge1xuICAgIHJldHVybiByZWdleFNvdXJjZS5yZXBsYWNlKENBUFRVUklOR19SRUdFWF9TT1VSQ0UsIChtYXRjaCwgaW5kZXgsIGNvbW1hbmRJbmRleCwgY29tbWFuZCkgPT4ge1xuICAgICAgbGV0IGNhcHR1cmUgPSBjYXB0dXJlSW5kaWNlc1twYXJzZUludChpbmRleCB8fCBjb21tYW5kSW5kZXgsIDEwKV07XG4gICAgICBpZiAoY2FwdHVyZSkge1xuICAgICAgICBsZXQgcmVzdWx0ID0gY2FwdHVyZVNvdXJjZS5zdWJzdHJpbmcoY2FwdHVyZS5zdGFydCwgY2FwdHVyZS5lbmQpO1xuICAgICAgICB3aGlsZSAocmVzdWx0WzBdID09PSBcIi5cIikge1xuICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5zdWJzdHJpbmcoMSk7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoIChjb21tYW5kKSB7XG4gICAgICAgICAgY2FzZSBcImRvd25jYXNlXCI6XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgY2FzZSBcInVwY2FzZVwiOlxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC50b1VwcGVyQ2FzZSgpO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn07XG5mdW5jdGlvbiBzdHJjbXAoYSwgYikge1xuICBpZiAoYSA8IGIpIHtcbiAgICByZXR1cm4gLTE7XG4gIH1cbiAgaWYgKGEgPiBiKSB7XG4gICAgcmV0dXJuIDE7XG4gIH1cbiAgcmV0dXJuIDA7XG59XG5mdW5jdGlvbiBzdHJBcnJDbXAoYSwgYikge1xuICBpZiAoYSA9PT0gbnVsbCAmJiBiID09PSBudWxsKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cbiAgaWYgKCFhKSB7XG4gICAgcmV0dXJuIC0xO1xuICB9XG4gIGlmICghYikge1xuICAgIHJldHVybiAxO1xuICB9XG4gIGxldCBsZW4xID0gYS5sZW5ndGg7XG4gIGxldCBsZW4yID0gYi5sZW5ndGg7XG4gIGlmIChsZW4xID09PSBsZW4yKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW4xOyBpKyspIHtcbiAgICAgIGxldCByZXMgPSBzdHJjbXAoYVtpXSwgYltpXSk7XG4gICAgICBpZiAocmVzICE9PSAwKSB7XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAwO1xuICB9XG4gIHJldHVybiBsZW4xIC0gbGVuMjtcbn1cbmZ1bmN0aW9uIGlzVmFsaWRIZXhDb2xvcihoZXgpIHtcbiAgaWYgKC9eI1swLTlhLWZdezZ9JC9pLnRlc3QoaGV4KSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmICgvXiNbMC05YS1mXXs4fSQvaS50ZXN0KGhleCkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAoL14jWzAtOWEtZl17M30kL2kudGVzdChoZXgpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKC9eI1swLTlhLWZdezR9JC9pLnRlc3QoaGV4KSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cbmZ1bmN0aW9uIGVzY2FwZVJlZ0V4cENoYXJhY3RlcnModmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoL1tcXC1cXFxcXFx7XFx9XFwqXFwrXFw/XFx8XFxeXFwkXFwuXFwsXFxbXFxdXFwoXFwpXFwjXFxzXS9nLCBcIlxcXFwkJlwiKTtcbn1cbnZhciBDYWNoZWRGbiA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IoZm4pIHtcbiAgICB0aGlzLmZuID0gZm47XG4gIH1cbiAgY2FjaGUgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICBnZXQoa2V5KSB7XG4gICAgaWYgKHRoaXMuY2FjaGUuaGFzKGtleSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmNhY2hlLmdldChrZXkpO1xuICAgIH1cbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMuZm4oa2V5KTtcbiAgICB0aGlzLmNhY2hlLnNldChrZXksIHZhbHVlKTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbn07XG5cbi8vIHNyYy90aGVtZS50c1xudmFyIFRoZW1lID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihfY29sb3JNYXAsIF9kZWZhdWx0cywgX3Jvb3QpIHtcbiAgICB0aGlzLl9jb2xvck1hcCA9IF9jb2xvck1hcDtcbiAgICB0aGlzLl9kZWZhdWx0cyA9IF9kZWZhdWx0cztcbiAgICB0aGlzLl9yb290ID0gX3Jvb3Q7XG4gIH1cbiAgc3RhdGljIGNyZWF0ZUZyb21SYXdUaGVtZShzb3VyY2UsIGNvbG9yTWFwKSB7XG4gICAgcmV0dXJuIHRoaXMuY3JlYXRlRnJvbVBhcnNlZFRoZW1lKHBhcnNlVGhlbWUoc291cmNlKSwgY29sb3JNYXApO1xuICB9XG4gIHN0YXRpYyBjcmVhdGVGcm9tUGFyc2VkVGhlbWUoc291cmNlLCBjb2xvck1hcCkge1xuICAgIHJldHVybiByZXNvbHZlUGFyc2VkVGhlbWVSdWxlcyhzb3VyY2UsIGNvbG9yTWFwKTtcbiAgfVxuICBfY2FjaGVkTWF0Y2hSb290ID0gbmV3IENhY2hlZEZuKFxuICAgIChzY29wZU5hbWUpID0+IHRoaXMuX3Jvb3QubWF0Y2goc2NvcGVOYW1lKVxuICApO1xuICBnZXRDb2xvck1hcCgpIHtcbiAgICByZXR1cm4gdGhpcy5fY29sb3JNYXAuZ2V0Q29sb3JNYXAoKTtcbiAgfVxuICBnZXREZWZhdWx0cygpIHtcbiAgICByZXR1cm4gdGhpcy5fZGVmYXVsdHM7XG4gIH1cbiAgbWF0Y2goc2NvcGVQYXRoKSB7XG4gICAgaWYgKHNjb3BlUGF0aCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2RlZmF1bHRzO1xuICAgIH1cbiAgICBjb25zdCBzY29wZU5hbWUgPSBzY29wZVBhdGguc2NvcGVOYW1lO1xuICAgIGNvbnN0IG1hdGNoaW5nVHJpZUVsZW1lbnRzID0gdGhpcy5fY2FjaGVkTWF0Y2hSb290LmdldChzY29wZU5hbWUpO1xuICAgIGNvbnN0IGVmZmVjdGl2ZVJ1bGUgPSBtYXRjaGluZ1RyaWVFbGVtZW50cy5maW5kKFxuICAgICAgKHYpID0+IF9zY29wZVBhdGhNYXRjaGVzUGFyZW50U2NvcGVzKHNjb3BlUGF0aC5wYXJlbnQsIHYucGFyZW50U2NvcGVzKVxuICAgICk7XG4gICAgaWYgKCFlZmZlY3RpdmVSdWxlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBTdHlsZUF0dHJpYnV0ZXMoXG4gICAgICBlZmZlY3RpdmVSdWxlLmZvbnRTdHlsZSxcbiAgICAgIGVmZmVjdGl2ZVJ1bGUuZm9yZWdyb3VuZCxcbiAgICAgIGVmZmVjdGl2ZVJ1bGUuYmFja2dyb3VuZFxuICAgICk7XG4gIH1cbn07XG52YXIgU2NvcGVTdGFjayA9IGNsYXNzIF9TY29wZVN0YWNrIHtcbiAgY29uc3RydWN0b3IocGFyZW50LCBzY29wZU5hbWUpIHtcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLnNjb3BlTmFtZSA9IHNjb3BlTmFtZTtcbiAgfVxuICBzdGF0aWMgcHVzaChwYXRoLCBzY29wZU5hbWVzKSB7XG4gICAgZm9yIChjb25zdCBuYW1lIG9mIHNjb3BlTmFtZXMpIHtcbiAgICAgIHBhdGggPSBuZXcgX1Njb3BlU3RhY2socGF0aCwgbmFtZSk7XG4gICAgfVxuICAgIHJldHVybiBwYXRoO1xuICB9XG4gIHN0YXRpYyBmcm9tKC4uLnNlZ21lbnRzKSB7XG4gICAgbGV0IHJlc3VsdCA9IG51bGw7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWdtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0ID0gbmV3IF9TY29wZVN0YWNrKHJlc3VsdCwgc2VnbWVudHNbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIHB1c2goc2NvcGVOYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfU2NvcGVTdGFjayh0aGlzLCBzY29wZU5hbWUpO1xuICB9XG4gIGdldFNlZ21lbnRzKCkge1xuICAgIGxldCBpdGVtID0gdGhpcztcbiAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICB3aGlsZSAoaXRlbSkge1xuICAgICAgcmVzdWx0LnB1c2goaXRlbS5zY29wZU5hbWUpO1xuICAgICAgaXRlbSA9IGl0ZW0ucGFyZW50O1xuICAgIH1cbiAgICByZXN1bHQucmV2ZXJzZSgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U2VnbWVudHMoKS5qb2luKFwiIFwiKTtcbiAgfVxuICBleHRlbmRzKG90aGVyKSB7XG4gICAgaWYgKHRoaXMgPT09IG90aGVyKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHRoaXMucGFyZW50ID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnBhcmVudC5leHRlbmRzKG90aGVyKTtcbiAgfVxuICBnZXRFeHRlbnNpb25JZkRlZmluZWQoYmFzZSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIGxldCBpdGVtID0gdGhpcztcbiAgICB3aGlsZSAoaXRlbSAmJiBpdGVtICE9PSBiYXNlKSB7XG4gICAgICByZXN1bHQucHVzaChpdGVtLnNjb3BlTmFtZSk7XG4gICAgICBpdGVtID0gaXRlbS5wYXJlbnQ7XG4gICAgfVxuICAgIHJldHVybiBpdGVtID09PSBiYXNlID8gcmVzdWx0LnJldmVyc2UoKSA6IHZvaWQgMDtcbiAgfVxufTtcbmZ1bmN0aW9uIF9zY29wZVBhdGhNYXRjaGVzUGFyZW50U2NvcGVzKHNjb3BlUGF0aCwgcGFyZW50U2NvcGVzKSB7XG4gIGlmIChwYXJlbnRTY29wZXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHBhcmVudFNjb3Blcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICBsZXQgc2NvcGVQYXR0ZXJuID0gcGFyZW50U2NvcGVzW2luZGV4XTtcbiAgICBsZXQgc2NvcGVNdXN0TWF0Y2ggPSBmYWxzZTtcbiAgICBpZiAoc2NvcGVQYXR0ZXJuID09PSBcIj5cIikge1xuICAgICAgaWYgKGluZGV4ID09PSBwYXJlbnRTY29wZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBzY29wZVBhdHRlcm4gPSBwYXJlbnRTY29wZXNbKytpbmRleF07XG4gICAgICBzY29wZU11c3RNYXRjaCA9IHRydWU7XG4gICAgfVxuICAgIHdoaWxlIChzY29wZVBhdGgpIHtcbiAgICAgIGlmIChfbWF0Y2hlc1Njb3BlKHNjb3BlUGF0aC5zY29wZU5hbWUsIHNjb3BlUGF0dGVybikpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpZiAoc2NvcGVNdXN0TWF0Y2gpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgc2NvcGVQYXRoID0gc2NvcGVQYXRoLnBhcmVudDtcbiAgICB9XG4gICAgaWYgKCFzY29wZVBhdGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgc2NvcGVQYXRoID0gc2NvcGVQYXRoLnBhcmVudDtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uIF9tYXRjaGVzU2NvcGUoc2NvcGVOYW1lLCBzY29wZVBhdHRlcm4pIHtcbiAgcmV0dXJuIHNjb3BlUGF0dGVybiA9PT0gc2NvcGVOYW1lIHx8IHNjb3BlTmFtZS5zdGFydHNXaXRoKHNjb3BlUGF0dGVybikgJiYgc2NvcGVOYW1lW3Njb3BlUGF0dGVybi5sZW5ndGhdID09PSBcIi5cIjtcbn1cbnZhciBTdHlsZUF0dHJpYnV0ZXMgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKGZvbnRTdHlsZSwgZm9yZWdyb3VuZElkLCBiYWNrZ3JvdW5kSWQpIHtcbiAgICB0aGlzLmZvbnRTdHlsZSA9IGZvbnRTdHlsZTtcbiAgICB0aGlzLmZvcmVncm91bmRJZCA9IGZvcmVncm91bmRJZDtcbiAgICB0aGlzLmJhY2tncm91bmRJZCA9IGJhY2tncm91bmRJZDtcbiAgfVxufTtcbmZ1bmN0aW9uIHBhcnNlVGhlbWUoc291cmNlKSB7XG4gIGlmICghc291cmNlKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIGlmICghc291cmNlLnNldHRpbmdzIHx8ICFBcnJheS5pc0FycmF5KHNvdXJjZS5zZXR0aW5ncykpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgbGV0IHNldHRpbmdzID0gc291cmNlLnNldHRpbmdzO1xuICBsZXQgcmVzdWx0ID0gW10sIHJlc3VsdExlbiA9IDA7XG4gIGZvciAobGV0IGkgPSAwLCBsZW4gPSBzZXR0aW5ncy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGxldCBlbnRyeSA9IHNldHRpbmdzW2ldO1xuICAgIGlmICghZW50cnkuc2V0dGluZ3MpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBsZXQgc2NvcGVzO1xuICAgIGlmICh0eXBlb2YgZW50cnkuc2NvcGUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIGxldCBfc2NvcGUgPSBlbnRyeS5zY29wZTtcbiAgICAgIF9zY29wZSA9IF9zY29wZS5yZXBsYWNlKC9eWyxdKy8sIFwiXCIpO1xuICAgICAgX3Njb3BlID0gX3Njb3BlLnJlcGxhY2UoL1ssXSskLywgXCJcIik7XG4gICAgICBzY29wZXMgPSBfc2NvcGUuc3BsaXQoXCIsXCIpO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShlbnRyeS5zY29wZSkpIHtcbiAgICAgIHNjb3BlcyA9IGVudHJ5LnNjb3BlO1xuICAgIH0gZWxzZSB7XG4gICAgICBzY29wZXMgPSBbXCJcIl07XG4gICAgfVxuICAgIGxldCBmb250U3R5bGUgPSAtMSAvKiBOb3RTZXQgKi87XG4gICAgaWYgKHR5cGVvZiBlbnRyeS5zZXR0aW5ncy5mb250U3R5bGUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIGZvbnRTdHlsZSA9IDAgLyogTm9uZSAqLztcbiAgICAgIGxldCBzZWdtZW50cyA9IGVudHJ5LnNldHRpbmdzLmZvbnRTdHlsZS5zcGxpdChcIiBcIik7XG4gICAgICBmb3IgKGxldCBqID0gMCwgbGVuSiA9IHNlZ21lbnRzLmxlbmd0aDsgaiA8IGxlbko7IGorKykge1xuICAgICAgICBsZXQgc2VnbWVudCA9IHNlZ21lbnRzW2pdO1xuICAgICAgICBzd2l0Y2ggKHNlZ21lbnQpIHtcbiAgICAgICAgICBjYXNlIFwiaXRhbGljXCI6XG4gICAgICAgICAgICBmb250U3R5bGUgPSBmb250U3R5bGUgfCAxIC8qIEl0YWxpYyAqLztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgXCJib2xkXCI6XG4gICAgICAgICAgICBmb250U3R5bGUgPSBmb250U3R5bGUgfCAyIC8qIEJvbGQgKi87XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIFwidW5kZXJsaW5lXCI6XG4gICAgICAgICAgICBmb250U3R5bGUgPSBmb250U3R5bGUgfCA0IC8qIFVuZGVybGluZSAqLztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgXCJzdHJpa2V0aHJvdWdoXCI6XG4gICAgICAgICAgICBmb250U3R5bGUgPSBmb250U3R5bGUgfCA4IC8qIFN0cmlrZXRocm91Z2ggKi87XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBsZXQgZm9yZWdyb3VuZCA9IG51bGw7XG4gICAgaWYgKHR5cGVvZiBlbnRyeS5zZXR0aW5ncy5mb3JlZ3JvdW5kID09PSBcInN0cmluZ1wiICYmIGlzVmFsaWRIZXhDb2xvcihlbnRyeS5zZXR0aW5ncy5mb3JlZ3JvdW5kKSkge1xuICAgICAgZm9yZWdyb3VuZCA9IGVudHJ5LnNldHRpbmdzLmZvcmVncm91bmQ7XG4gICAgfVxuICAgIGxldCBiYWNrZ3JvdW5kID0gbnVsbDtcbiAgICBpZiAodHlwZW9mIGVudHJ5LnNldHRpbmdzLmJhY2tncm91bmQgPT09IFwic3RyaW5nXCIgJiYgaXNWYWxpZEhleENvbG9yKGVudHJ5LnNldHRpbmdzLmJhY2tncm91bmQpKSB7XG4gICAgICBiYWNrZ3JvdW5kID0gZW50cnkuc2V0dGluZ3MuYmFja2dyb3VuZDtcbiAgICB9XG4gICAgZm9yIChsZXQgaiA9IDAsIGxlbkogPSBzY29wZXMubGVuZ3RoOyBqIDwgbGVuSjsgaisrKSB7XG4gICAgICBsZXQgX3Njb3BlID0gc2NvcGVzW2pdLnRyaW0oKTtcbiAgICAgIGxldCBzZWdtZW50cyA9IF9zY29wZS5zcGxpdChcIiBcIik7XG4gICAgICBsZXQgc2NvcGUgPSBzZWdtZW50c1tzZWdtZW50cy5sZW5ndGggLSAxXTtcbiAgICAgIGxldCBwYXJlbnRTY29wZXMgPSBudWxsO1xuICAgICAgaWYgKHNlZ21lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgcGFyZW50U2NvcGVzID0gc2VnbWVudHMuc2xpY2UoMCwgc2VnbWVudHMubGVuZ3RoIC0gMSk7XG4gICAgICAgIHBhcmVudFNjb3Blcy5yZXZlcnNlKCk7XG4gICAgICB9XG4gICAgICByZXN1bHRbcmVzdWx0TGVuKytdID0gbmV3IFBhcnNlZFRoZW1lUnVsZShcbiAgICAgICAgc2NvcGUsXG4gICAgICAgIHBhcmVudFNjb3BlcyxcbiAgICAgICAgaSxcbiAgICAgICAgZm9udFN0eWxlLFxuICAgICAgICBmb3JlZ3JvdW5kLFxuICAgICAgICBiYWNrZ3JvdW5kXG4gICAgICApO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxudmFyIFBhcnNlZFRoZW1lUnVsZSA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3Ioc2NvcGUsIHBhcmVudFNjb3BlcywgaW5kZXgsIGZvbnRTdHlsZSwgZm9yZWdyb3VuZCwgYmFja2dyb3VuZCkge1xuICAgIHRoaXMuc2NvcGUgPSBzY29wZTtcbiAgICB0aGlzLnBhcmVudFNjb3BlcyA9IHBhcmVudFNjb3BlcztcbiAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gICAgdGhpcy5mb250U3R5bGUgPSBmb250U3R5bGU7XG4gICAgdGhpcy5mb3JlZ3JvdW5kID0gZm9yZWdyb3VuZDtcbiAgICB0aGlzLmJhY2tncm91bmQgPSBiYWNrZ3JvdW5kO1xuICB9XG59O1xudmFyIEZvbnRTdHlsZSA9IC8qIEBfX1BVUkVfXyAqLyAoKEZvbnRTdHlsZTIpID0+IHtcbiAgRm9udFN0eWxlMltGb250U3R5bGUyW1wiTm90U2V0XCJdID0gLTFdID0gXCJOb3RTZXRcIjtcbiAgRm9udFN0eWxlMltGb250U3R5bGUyW1wiTm9uZVwiXSA9IDBdID0gXCJOb25lXCI7XG4gIEZvbnRTdHlsZTJbRm9udFN0eWxlMltcIkl0YWxpY1wiXSA9IDFdID0gXCJJdGFsaWNcIjtcbiAgRm9udFN0eWxlMltGb250U3R5bGUyW1wiQm9sZFwiXSA9IDJdID0gXCJCb2xkXCI7XG4gIEZvbnRTdHlsZTJbRm9udFN0eWxlMltcIlVuZGVybGluZVwiXSA9IDRdID0gXCJVbmRlcmxpbmVcIjtcbiAgRm9udFN0eWxlMltGb250U3R5bGUyW1wiU3RyaWtldGhyb3VnaFwiXSA9IDhdID0gXCJTdHJpa2V0aHJvdWdoXCI7XG4gIHJldHVybiBGb250U3R5bGUyO1xufSkoRm9udFN0eWxlIHx8IHt9KTtcbmZ1bmN0aW9uIHJlc29sdmVQYXJzZWRUaGVtZVJ1bGVzKHBhcnNlZFRoZW1lUnVsZXMsIF9jb2xvck1hcCkge1xuICBwYXJzZWRUaGVtZVJ1bGVzLnNvcnQoKGEsIGIpID0+IHtcbiAgICBsZXQgciA9IHN0cmNtcChhLnNjb3BlLCBiLnNjb3BlKTtcbiAgICBpZiAociAhPT0gMCkge1xuICAgICAgcmV0dXJuIHI7XG4gICAgfVxuICAgIHIgPSBzdHJBcnJDbXAoYS5wYXJlbnRTY29wZXMsIGIucGFyZW50U2NvcGVzKTtcbiAgICBpZiAociAhPT0gMCkge1xuICAgICAgcmV0dXJuIHI7XG4gICAgfVxuICAgIHJldHVybiBhLmluZGV4IC0gYi5pbmRleDtcbiAgfSk7XG4gIGxldCBkZWZhdWx0Rm9udFN0eWxlID0gMCAvKiBOb25lICovO1xuICBsZXQgZGVmYXVsdEZvcmVncm91bmQgPSBcIiMwMDAwMDBcIjtcbiAgbGV0IGRlZmF1bHRCYWNrZ3JvdW5kID0gXCIjZmZmZmZmXCI7XG4gIHdoaWxlIChwYXJzZWRUaGVtZVJ1bGVzLmxlbmd0aCA+PSAxICYmIHBhcnNlZFRoZW1lUnVsZXNbMF0uc2NvcGUgPT09IFwiXCIpIHtcbiAgICBsZXQgaW5jb21pbmdEZWZhdWx0cyA9IHBhcnNlZFRoZW1lUnVsZXMuc2hpZnQoKTtcbiAgICBpZiAoaW5jb21pbmdEZWZhdWx0cy5mb250U3R5bGUgIT09IC0xIC8qIE5vdFNldCAqLykge1xuICAgICAgZGVmYXVsdEZvbnRTdHlsZSA9IGluY29taW5nRGVmYXVsdHMuZm9udFN0eWxlO1xuICAgIH1cbiAgICBpZiAoaW5jb21pbmdEZWZhdWx0cy5mb3JlZ3JvdW5kICE9PSBudWxsKSB7XG4gICAgICBkZWZhdWx0Rm9yZWdyb3VuZCA9IGluY29taW5nRGVmYXVsdHMuZm9yZWdyb3VuZDtcbiAgICB9XG4gICAgaWYgKGluY29taW5nRGVmYXVsdHMuYmFja2dyb3VuZCAhPT0gbnVsbCkge1xuICAgICAgZGVmYXVsdEJhY2tncm91bmQgPSBpbmNvbWluZ0RlZmF1bHRzLmJhY2tncm91bmQ7XG4gICAgfVxuICB9XG4gIGxldCBjb2xvck1hcCA9IG5ldyBDb2xvck1hcChfY29sb3JNYXApO1xuICBsZXQgZGVmYXVsdHMgPSBuZXcgU3R5bGVBdHRyaWJ1dGVzKGRlZmF1bHRGb250U3R5bGUsIGNvbG9yTWFwLmdldElkKGRlZmF1bHRGb3JlZ3JvdW5kKSwgY29sb3JNYXAuZ2V0SWQoZGVmYXVsdEJhY2tncm91bmQpKTtcbiAgbGV0IHJvb3QgPSBuZXcgVGhlbWVUcmllRWxlbWVudChuZXcgVGhlbWVUcmllRWxlbWVudFJ1bGUoMCwgbnVsbCwgLTEgLyogTm90U2V0ICovLCAwLCAwKSwgW10pO1xuICBmb3IgKGxldCBpID0gMCwgbGVuID0gcGFyc2VkVGhlbWVSdWxlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGxldCBydWxlID0gcGFyc2VkVGhlbWVSdWxlc1tpXTtcbiAgICByb290Lmluc2VydCgwLCBydWxlLnNjb3BlLCBydWxlLnBhcmVudFNjb3BlcywgcnVsZS5mb250U3R5bGUsIGNvbG9yTWFwLmdldElkKHJ1bGUuZm9yZWdyb3VuZCksIGNvbG9yTWFwLmdldElkKHJ1bGUuYmFja2dyb3VuZCkpO1xuICB9XG4gIHJldHVybiBuZXcgVGhlbWUoY29sb3JNYXAsIGRlZmF1bHRzLCByb290KTtcbn1cbnZhciBDb2xvck1hcCA9IGNsYXNzIHtcbiAgX2lzRnJvemVuO1xuICBfbGFzdENvbG9ySWQ7XG4gIF9pZDJjb2xvcjtcbiAgX2NvbG9yMmlkO1xuICBjb25zdHJ1Y3RvcihfY29sb3JNYXApIHtcbiAgICB0aGlzLl9sYXN0Q29sb3JJZCA9IDA7XG4gICAgdGhpcy5faWQyY29sb3IgPSBbXTtcbiAgICB0aGlzLl9jb2xvcjJpZCA9IC8qIEBfX1BVUkVfXyAqLyBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIGlmIChBcnJheS5pc0FycmF5KF9jb2xvck1hcCkpIHtcbiAgICAgIHRoaXMuX2lzRnJvemVuID0gdHJ1ZTtcbiAgICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBfY29sb3JNYXAubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgdGhpcy5fY29sb3IyaWRbX2NvbG9yTWFwW2ldXSA9IGk7XG4gICAgICAgIHRoaXMuX2lkMmNvbG9yW2ldID0gX2NvbG9yTWFwW2ldO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9pc0Zyb3plbiA9IGZhbHNlO1xuICAgIH1cbiAgfVxuICBnZXRJZChjb2xvcikge1xuICAgIGlmIChjb2xvciA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIGNvbG9yID0gY29sb3IudG9VcHBlckNhc2UoKTtcbiAgICBsZXQgdmFsdWUgPSB0aGlzLl9jb2xvcjJpZFtjb2xvcl07XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIGlmICh0aGlzLl9pc0Zyb3plbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBNaXNzaW5nIGNvbG9yIGluIGNvbG9yIG1hcCAtICR7Y29sb3J9YCk7XG4gICAgfVxuICAgIHZhbHVlID0gKyt0aGlzLl9sYXN0Q29sb3JJZDtcbiAgICB0aGlzLl9jb2xvcjJpZFtjb2xvcl0gPSB2YWx1ZTtcbiAgICB0aGlzLl9pZDJjb2xvclt2YWx1ZV0gPSBjb2xvcjtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgZ2V0Q29sb3JNYXAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lkMmNvbG9yLnNsaWNlKDApO1xuICB9XG59O1xudmFyIGVtcHR5UGFyZW50U2NvcGVzID0gT2JqZWN0LmZyZWV6ZShbXSk7XG52YXIgVGhlbWVUcmllRWxlbWVudFJ1bGUgPSBjbGFzcyBfVGhlbWVUcmllRWxlbWVudFJ1bGUge1xuICBzY29wZURlcHRoO1xuICBwYXJlbnRTY29wZXM7XG4gIGZvbnRTdHlsZTtcbiAgZm9yZWdyb3VuZDtcbiAgYmFja2dyb3VuZDtcbiAgY29uc3RydWN0b3Ioc2NvcGVEZXB0aCwgcGFyZW50U2NvcGVzLCBmb250U3R5bGUsIGZvcmVncm91bmQsIGJhY2tncm91bmQpIHtcbiAgICB0aGlzLnNjb3BlRGVwdGggPSBzY29wZURlcHRoO1xuICAgIHRoaXMucGFyZW50U2NvcGVzID0gcGFyZW50U2NvcGVzIHx8IGVtcHR5UGFyZW50U2NvcGVzO1xuICAgIHRoaXMuZm9udFN0eWxlID0gZm9udFN0eWxlO1xuICAgIHRoaXMuZm9yZWdyb3VuZCA9IGZvcmVncm91bmQ7XG4gICAgdGhpcy5iYWNrZ3JvdW5kID0gYmFja2dyb3VuZDtcbiAgfVxuICBjbG9uZSgpIHtcbiAgICByZXR1cm4gbmV3IF9UaGVtZVRyaWVFbGVtZW50UnVsZSh0aGlzLnNjb3BlRGVwdGgsIHRoaXMucGFyZW50U2NvcGVzLCB0aGlzLmZvbnRTdHlsZSwgdGhpcy5mb3JlZ3JvdW5kLCB0aGlzLmJhY2tncm91bmQpO1xuICB9XG4gIHN0YXRpYyBjbG9uZUFycihhcnIpIHtcbiAgICBsZXQgciA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBhcnIubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHJbaV0gPSBhcnJbaV0uY2xvbmUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHI7XG4gIH1cbiAgYWNjZXB0T3ZlcndyaXRlKHNjb3BlRGVwdGgsIGZvbnRTdHlsZSwgZm9yZWdyb3VuZCwgYmFja2dyb3VuZCkge1xuICAgIGlmICh0aGlzLnNjb3BlRGVwdGggPiBzY29wZURlcHRoKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImhvdyBkaWQgdGhpcyBoYXBwZW4/XCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNjb3BlRGVwdGggPSBzY29wZURlcHRoO1xuICAgIH1cbiAgICBpZiAoZm9udFN0eWxlICE9PSAtMSAvKiBOb3RTZXQgKi8pIHtcbiAgICAgIHRoaXMuZm9udFN0eWxlID0gZm9udFN0eWxlO1xuICAgIH1cbiAgICBpZiAoZm9yZWdyb3VuZCAhPT0gMCkge1xuICAgICAgdGhpcy5mb3JlZ3JvdW5kID0gZm9yZWdyb3VuZDtcbiAgICB9XG4gICAgaWYgKGJhY2tncm91bmQgIT09IDApIHtcbiAgICAgIHRoaXMuYmFja2dyb3VuZCA9IGJhY2tncm91bmQ7XG4gICAgfVxuICB9XG59O1xudmFyIFRoZW1lVHJpZUVsZW1lbnQgPSBjbGFzcyBfVGhlbWVUcmllRWxlbWVudCB7XG4gIGNvbnN0cnVjdG9yKF9tYWluUnVsZSwgcnVsZXNXaXRoUGFyZW50U2NvcGVzID0gW10sIF9jaGlsZHJlbiA9IHt9KSB7XG4gICAgdGhpcy5fbWFpblJ1bGUgPSBfbWFpblJ1bGU7XG4gICAgdGhpcy5fY2hpbGRyZW4gPSBfY2hpbGRyZW47XG4gICAgdGhpcy5fcnVsZXNXaXRoUGFyZW50U2NvcGVzID0gcnVsZXNXaXRoUGFyZW50U2NvcGVzO1xuICB9XG4gIF9ydWxlc1dpdGhQYXJlbnRTY29wZXM7XG4gIHN0YXRpYyBfY21wQnlTcGVjaWZpY2l0eShhLCBiKSB7XG4gICAgaWYgKGEuc2NvcGVEZXB0aCAhPT0gYi5zY29wZURlcHRoKSB7XG4gICAgICByZXR1cm4gYi5zY29wZURlcHRoIC0gYS5zY29wZURlcHRoO1xuICAgIH1cbiAgICBsZXQgYVBhcmVudEluZGV4ID0gMDtcbiAgICBsZXQgYlBhcmVudEluZGV4ID0gMDtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgaWYgKGEucGFyZW50U2NvcGVzW2FQYXJlbnRJbmRleF0gPT09IFwiPlwiKSB7XG4gICAgICAgIGFQYXJlbnRJbmRleCsrO1xuICAgICAgfVxuICAgICAgaWYgKGIucGFyZW50U2NvcGVzW2JQYXJlbnRJbmRleF0gPT09IFwiPlwiKSB7XG4gICAgICAgIGJQYXJlbnRJbmRleCsrO1xuICAgICAgfVxuICAgICAgaWYgKGFQYXJlbnRJbmRleCA+PSBhLnBhcmVudFNjb3Blcy5sZW5ndGggfHwgYlBhcmVudEluZGV4ID49IGIucGFyZW50U2NvcGVzLmxlbmd0aCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNvbnN0IHBhcmVudFNjb3BlTGVuZ3RoRGlmZiA9IGIucGFyZW50U2NvcGVzW2JQYXJlbnRJbmRleF0ubGVuZ3RoIC0gYS5wYXJlbnRTY29wZXNbYVBhcmVudEluZGV4XS5sZW5ndGg7XG4gICAgICBpZiAocGFyZW50U2NvcGVMZW5ndGhEaWZmICE9PSAwKSB7XG4gICAgICAgIHJldHVybiBwYXJlbnRTY29wZUxlbmd0aERpZmY7XG4gICAgICB9XG4gICAgICBhUGFyZW50SW5kZXgrKztcbiAgICAgIGJQYXJlbnRJbmRleCsrO1xuICAgIH1cbiAgICByZXR1cm4gYi5wYXJlbnRTY29wZXMubGVuZ3RoIC0gYS5wYXJlbnRTY29wZXMubGVuZ3RoO1xuICB9XG4gIG1hdGNoKHNjb3BlKSB7XG4gICAgaWYgKHNjb3BlICE9PSBcIlwiKSB7XG4gICAgICBsZXQgZG90SW5kZXggPSBzY29wZS5pbmRleE9mKFwiLlwiKTtcbiAgICAgIGxldCBoZWFkO1xuICAgICAgbGV0IHRhaWw7XG4gICAgICBpZiAoZG90SW5kZXggPT09IC0xKSB7XG4gICAgICAgIGhlYWQgPSBzY29wZTtcbiAgICAgICAgdGFpbCA9IFwiXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBoZWFkID0gc2NvcGUuc3Vic3RyaW5nKDAsIGRvdEluZGV4KTtcbiAgICAgICAgdGFpbCA9IHNjb3BlLnN1YnN0cmluZyhkb3RJbmRleCArIDEpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX2NoaWxkcmVuLmhhc093blByb3BlcnR5KGhlYWQpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jaGlsZHJlbltoZWFkXS5tYXRjaCh0YWlsKTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgcnVsZXMgPSB0aGlzLl9ydWxlc1dpdGhQYXJlbnRTY29wZXMuY29uY2F0KHRoaXMuX21haW5SdWxlKTtcbiAgICBydWxlcy5zb3J0KF9UaGVtZVRyaWVFbGVtZW50Ll9jbXBCeVNwZWNpZmljaXR5KTtcbiAgICByZXR1cm4gcnVsZXM7XG4gIH1cbiAgaW5zZXJ0KHNjb3BlRGVwdGgsIHNjb3BlLCBwYXJlbnRTY29wZXMsIGZvbnRTdHlsZSwgZm9yZWdyb3VuZCwgYmFja2dyb3VuZCkge1xuICAgIGlmIChzY29wZSA9PT0gXCJcIikge1xuICAgICAgdGhpcy5fZG9JbnNlcnRIZXJlKHNjb3BlRGVwdGgsIHBhcmVudFNjb3BlcywgZm9udFN0eWxlLCBmb3JlZ3JvdW5kLCBiYWNrZ3JvdW5kKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IGRvdEluZGV4ID0gc2NvcGUuaW5kZXhPZihcIi5cIik7XG4gICAgbGV0IGhlYWQ7XG4gICAgbGV0IHRhaWw7XG4gICAgaWYgKGRvdEluZGV4ID09PSAtMSkge1xuICAgICAgaGVhZCA9IHNjb3BlO1xuICAgICAgdGFpbCA9IFwiXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIGhlYWQgPSBzY29wZS5zdWJzdHJpbmcoMCwgZG90SW5kZXgpO1xuICAgICAgdGFpbCA9IHNjb3BlLnN1YnN0cmluZyhkb3RJbmRleCArIDEpO1xuICAgIH1cbiAgICBsZXQgY2hpbGQ7XG4gICAgaWYgKHRoaXMuX2NoaWxkcmVuLmhhc093blByb3BlcnR5KGhlYWQpKSB7XG4gICAgICBjaGlsZCA9IHRoaXMuX2NoaWxkcmVuW2hlYWRdO1xuICAgIH0gZWxzZSB7XG4gICAgICBjaGlsZCA9IG5ldyBfVGhlbWVUcmllRWxlbWVudCh0aGlzLl9tYWluUnVsZS5jbG9uZSgpLCBUaGVtZVRyaWVFbGVtZW50UnVsZS5jbG9uZUFycih0aGlzLl9ydWxlc1dpdGhQYXJlbnRTY29wZXMpKTtcbiAgICAgIHRoaXMuX2NoaWxkcmVuW2hlYWRdID0gY2hpbGQ7XG4gICAgfVxuICAgIGNoaWxkLmluc2VydChzY29wZURlcHRoICsgMSwgdGFpbCwgcGFyZW50U2NvcGVzLCBmb250U3R5bGUsIGZvcmVncm91bmQsIGJhY2tncm91bmQpO1xuICB9XG4gIF9kb0luc2VydEhlcmUoc2NvcGVEZXB0aCwgcGFyZW50U2NvcGVzLCBmb250U3R5bGUsIGZvcmVncm91bmQsIGJhY2tncm91bmQpIHtcbiAgICBpZiAocGFyZW50U2NvcGVzID09PSBudWxsKSB7XG4gICAgICB0aGlzLl9tYWluUnVsZS5hY2NlcHRPdmVyd3JpdGUoc2NvcGVEZXB0aCwgZm9udFN0eWxlLCBmb3JlZ3JvdW5kLCBiYWNrZ3JvdW5kKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHRoaXMuX3J1bGVzV2l0aFBhcmVudFNjb3Blcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgbGV0IHJ1bGUgPSB0aGlzLl9ydWxlc1dpdGhQYXJlbnRTY29wZXNbaV07XG4gICAgICBpZiAoc3RyQXJyQ21wKHJ1bGUucGFyZW50U2NvcGVzLCBwYXJlbnRTY29wZXMpID09PSAwKSB7XG4gICAgICAgIHJ1bGUuYWNjZXB0T3ZlcndyaXRlKHNjb3BlRGVwdGgsIGZvbnRTdHlsZSwgZm9yZWdyb3VuZCwgYmFja2dyb3VuZCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGZvbnRTdHlsZSA9PT0gLTEgLyogTm90U2V0ICovKSB7XG4gICAgICBmb250U3R5bGUgPSB0aGlzLl9tYWluUnVsZS5mb250U3R5bGU7XG4gICAgfVxuICAgIGlmIChmb3JlZ3JvdW5kID09PSAwKSB7XG4gICAgICBmb3JlZ3JvdW5kID0gdGhpcy5fbWFpblJ1bGUuZm9yZWdyb3VuZDtcbiAgICB9XG4gICAgaWYgKGJhY2tncm91bmQgPT09IDApIHtcbiAgICAgIGJhY2tncm91bmQgPSB0aGlzLl9tYWluUnVsZS5iYWNrZ3JvdW5kO1xuICAgIH1cbiAgICB0aGlzLl9ydWxlc1dpdGhQYXJlbnRTY29wZXMucHVzaChuZXcgVGhlbWVUcmllRWxlbWVudFJ1bGUoc2NvcGVEZXB0aCwgcGFyZW50U2NvcGVzLCBmb250U3R5bGUsIGZvcmVncm91bmQsIGJhY2tncm91bmQpKTtcbiAgfVxufTtcblxuLy8gc3JjL2VuY29kZWRUb2tlbkF0dHJpYnV0ZXMudHNcbnZhciBFbmNvZGVkVG9rZW5NZXRhZGF0YSA9IGNsYXNzIF9FbmNvZGVkVG9rZW5NZXRhZGF0YSB7XG4gIHN0YXRpYyB0b0JpbmFyeVN0cihlbmNvZGVkVG9rZW5BdHRyaWJ1dGVzKSB7XG4gICAgcmV0dXJuIGVuY29kZWRUb2tlbkF0dHJpYnV0ZXMudG9TdHJpbmcoMikucGFkU3RhcnQoMzIsIFwiMFwiKTtcbiAgfVxuICBzdGF0aWMgcHJpbnQoZW5jb2RlZFRva2VuQXR0cmlidXRlcykge1xuICAgIGNvbnN0IGxhbmd1YWdlSWQgPSBfRW5jb2RlZFRva2VuTWV0YWRhdGEuZ2V0TGFuZ3VhZ2VJZChlbmNvZGVkVG9rZW5BdHRyaWJ1dGVzKTtcbiAgICBjb25zdCB0b2tlblR5cGUgPSBfRW5jb2RlZFRva2VuTWV0YWRhdGEuZ2V0VG9rZW5UeXBlKGVuY29kZWRUb2tlbkF0dHJpYnV0ZXMpO1xuICAgIGNvbnN0IGZvbnRTdHlsZSA9IF9FbmNvZGVkVG9rZW5NZXRhZGF0YS5nZXRGb250U3R5bGUoZW5jb2RlZFRva2VuQXR0cmlidXRlcyk7XG4gICAgY29uc3QgZm9yZWdyb3VuZCA9IF9FbmNvZGVkVG9rZW5NZXRhZGF0YS5nZXRGb3JlZ3JvdW5kKGVuY29kZWRUb2tlbkF0dHJpYnV0ZXMpO1xuICAgIGNvbnN0IGJhY2tncm91bmQgPSBfRW5jb2RlZFRva2VuTWV0YWRhdGEuZ2V0QmFja2dyb3VuZChlbmNvZGVkVG9rZW5BdHRyaWJ1dGVzKTtcbiAgICBjb25zb2xlLmxvZyh7XG4gICAgICBsYW5ndWFnZUlkLFxuICAgICAgdG9rZW5UeXBlLFxuICAgICAgZm9udFN0eWxlLFxuICAgICAgZm9yZWdyb3VuZCxcbiAgICAgIGJhY2tncm91bmRcbiAgICB9KTtcbiAgfVxuICBzdGF0aWMgZ2V0TGFuZ3VhZ2VJZChlbmNvZGVkVG9rZW5BdHRyaWJ1dGVzKSB7XG4gICAgcmV0dXJuIChlbmNvZGVkVG9rZW5BdHRyaWJ1dGVzICYgMjU1IC8qIExBTkdVQUdFSURfTUFTSyAqLykgPj4+IDAgLyogTEFOR1VBR0VJRF9PRkZTRVQgKi87XG4gIH1cbiAgc3RhdGljIGdldFRva2VuVHlwZShlbmNvZGVkVG9rZW5BdHRyaWJ1dGVzKSB7XG4gICAgcmV0dXJuIChlbmNvZGVkVG9rZW5BdHRyaWJ1dGVzICYgNzY4IC8qIFRPS0VOX1RZUEVfTUFTSyAqLykgPj4+IDggLyogVE9LRU5fVFlQRV9PRkZTRVQgKi87XG4gIH1cbiAgc3RhdGljIGNvbnRhaW5zQmFsYW5jZWRCcmFja2V0cyhlbmNvZGVkVG9rZW5BdHRyaWJ1dGVzKSB7XG4gICAgcmV0dXJuIChlbmNvZGVkVG9rZW5BdHRyaWJ1dGVzICYgMTAyNCAvKiBCQUxBTkNFRF9CUkFDS0VUU19NQVNLICovKSAhPT0gMDtcbiAgfVxuICBzdGF0aWMgZ2V0Rm9udFN0eWxlKGVuY29kZWRUb2tlbkF0dHJpYnV0ZXMpIHtcbiAgICByZXR1cm4gKGVuY29kZWRUb2tlbkF0dHJpYnV0ZXMgJiAzMDcyMCAvKiBGT05UX1NUWUxFX01BU0sgKi8pID4+PiAxMSAvKiBGT05UX1NUWUxFX09GRlNFVCAqLztcbiAgfVxuICBzdGF0aWMgZ2V0Rm9yZWdyb3VuZChlbmNvZGVkVG9rZW5BdHRyaWJ1dGVzKSB7XG4gICAgcmV0dXJuIChlbmNvZGVkVG9rZW5BdHRyaWJ1dGVzICYgMTY3NDQ0NDggLyogRk9SRUdST1VORF9NQVNLICovKSA+Pj4gMTUgLyogRk9SRUdST1VORF9PRkZTRVQgKi87XG4gIH1cbiAgc3RhdGljIGdldEJhY2tncm91bmQoZW5jb2RlZFRva2VuQXR0cmlidXRlcykge1xuICAgIHJldHVybiAoZW5jb2RlZFRva2VuQXR0cmlidXRlcyAmIDQyNzgxOTAwODAgLyogQkFDS0dST1VORF9NQVNLICovKSA+Pj4gMjQgLyogQkFDS0dST1VORF9PRkZTRVQgKi87XG4gIH1cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIGZpZWxkcyBpbiBgbWV0YWRhdGFgLlxuICAgKiBBIHZhbHVlIG9mIGAwYCwgYE5vdFNldGAgb3IgYG51bGxgIGluZGljYXRlcyB0aGF0IHRoZSBjb3JyZXNwb25kaW5nIGZpZWxkIHNob3VsZCBiZSBsZWZ0IGFzIGlzLlxuICAgKi9cbiAgc3RhdGljIHNldChlbmNvZGVkVG9rZW5BdHRyaWJ1dGVzLCBsYW5ndWFnZUlkLCB0b2tlblR5cGUsIGNvbnRhaW5zQmFsYW5jZWRCcmFja2V0cywgZm9udFN0eWxlLCBmb3JlZ3JvdW5kLCBiYWNrZ3JvdW5kKSB7XG4gICAgbGV0IF9sYW5ndWFnZUlkID0gX0VuY29kZWRUb2tlbk1ldGFkYXRhLmdldExhbmd1YWdlSWQoZW5jb2RlZFRva2VuQXR0cmlidXRlcyk7XG4gICAgbGV0IF90b2tlblR5cGUgPSBfRW5jb2RlZFRva2VuTWV0YWRhdGEuZ2V0VG9rZW5UeXBlKGVuY29kZWRUb2tlbkF0dHJpYnV0ZXMpO1xuICAgIGxldCBfY29udGFpbnNCYWxhbmNlZEJyYWNrZXRzQml0ID0gX0VuY29kZWRUb2tlbk1ldGFkYXRhLmNvbnRhaW5zQmFsYW5jZWRCcmFja2V0cyhlbmNvZGVkVG9rZW5BdHRyaWJ1dGVzKSA/IDEgOiAwO1xuICAgIGxldCBfZm9udFN0eWxlID0gX0VuY29kZWRUb2tlbk1ldGFkYXRhLmdldEZvbnRTdHlsZShlbmNvZGVkVG9rZW5BdHRyaWJ1dGVzKTtcbiAgICBsZXQgX2ZvcmVncm91bmQgPSBfRW5jb2RlZFRva2VuTWV0YWRhdGEuZ2V0Rm9yZWdyb3VuZChlbmNvZGVkVG9rZW5BdHRyaWJ1dGVzKTtcbiAgICBsZXQgX2JhY2tncm91bmQgPSBfRW5jb2RlZFRva2VuTWV0YWRhdGEuZ2V0QmFja2dyb3VuZChlbmNvZGVkVG9rZW5BdHRyaWJ1dGVzKTtcbiAgICBpZiAobGFuZ3VhZ2VJZCAhPT0gMCkge1xuICAgICAgX2xhbmd1YWdlSWQgPSBsYW5ndWFnZUlkO1xuICAgIH1cbiAgICBpZiAodG9rZW5UeXBlICE9PSA4IC8qIE5vdFNldCAqLykge1xuICAgICAgX3Rva2VuVHlwZSA9IGZyb21PcHRpb25hbFRva2VuVHlwZSh0b2tlblR5cGUpO1xuICAgIH1cbiAgICBpZiAoY29udGFpbnNCYWxhbmNlZEJyYWNrZXRzICE9PSBudWxsKSB7XG4gICAgICBfY29udGFpbnNCYWxhbmNlZEJyYWNrZXRzQml0ID0gY29udGFpbnNCYWxhbmNlZEJyYWNrZXRzID8gMSA6IDA7XG4gICAgfVxuICAgIGlmIChmb250U3R5bGUgIT09IC0xIC8qIE5vdFNldCAqLykge1xuICAgICAgX2ZvbnRTdHlsZSA9IGZvbnRTdHlsZTtcbiAgICB9XG4gICAgaWYgKGZvcmVncm91bmQgIT09IDApIHtcbiAgICAgIF9mb3JlZ3JvdW5kID0gZm9yZWdyb3VuZDtcbiAgICB9XG4gICAgaWYgKGJhY2tncm91bmQgIT09IDApIHtcbiAgICAgIF9iYWNrZ3JvdW5kID0gYmFja2dyb3VuZDtcbiAgICB9XG4gICAgcmV0dXJuIChfbGFuZ3VhZ2VJZCA8PCAwIC8qIExBTkdVQUdFSURfT0ZGU0VUICovIHwgX3Rva2VuVHlwZSA8PCA4IC8qIFRPS0VOX1RZUEVfT0ZGU0VUICovIHwgX2NvbnRhaW5zQmFsYW5jZWRCcmFja2V0c0JpdCA8PCAxMCAvKiBCQUxBTkNFRF9CUkFDS0VUU19PRkZTRVQgKi8gfCBfZm9udFN0eWxlIDw8IDExIC8qIEZPTlRfU1RZTEVfT0ZGU0VUICovIHwgX2ZvcmVncm91bmQgPDwgMTUgLyogRk9SRUdST1VORF9PRkZTRVQgKi8gfCBfYmFja2dyb3VuZCA8PCAyNCAvKiBCQUNLR1JPVU5EX09GRlNFVCAqLykgPj4+IDA7XG4gIH1cbn07XG5mdW5jdGlvbiB0b09wdGlvbmFsVG9rZW5UeXBlKHN0YW5kYXJkVHlwZSkge1xuICByZXR1cm4gc3RhbmRhcmRUeXBlO1xufVxuZnVuY3Rpb24gZnJvbU9wdGlvbmFsVG9rZW5UeXBlKHN0YW5kYXJkVHlwZSkge1xuICByZXR1cm4gc3RhbmRhcmRUeXBlO1xufVxuXG4vLyBzcmMvbWF0Y2hlci50c1xuZnVuY3Rpb24gY3JlYXRlTWF0Y2hlcnMoc2VsZWN0b3IsIG1hdGNoZXNOYW1lKSB7XG4gIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgY29uc3QgdG9rZW5pemVyID0gbmV3VG9rZW5pemVyKHNlbGVjdG9yKTtcbiAgbGV0IHRva2VuID0gdG9rZW5pemVyLm5leHQoKTtcbiAgd2hpbGUgKHRva2VuICE9PSBudWxsKSB7XG4gICAgbGV0IHByaW9yaXR5ID0gMDtcbiAgICBpZiAodG9rZW4ubGVuZ3RoID09PSAyICYmIHRva2VuLmNoYXJBdCgxKSA9PT0gXCI6XCIpIHtcbiAgICAgIHN3aXRjaCAodG9rZW4uY2hhckF0KDApKSB7XG4gICAgICAgIGNhc2UgXCJSXCI6XG4gICAgICAgICAgcHJpb3JpdHkgPSAxO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiTFwiOlxuICAgICAgICAgIHByaW9yaXR5ID0gLTE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY29uc29sZS5sb2coYFVua25vd24gcHJpb3JpdHkgJHt0b2tlbn0gaW4gc2NvcGUgc2VsZWN0b3JgKTtcbiAgICAgIH1cbiAgICAgIHRva2VuID0gdG9rZW5pemVyLm5leHQoKTtcbiAgICB9XG4gICAgbGV0IG1hdGNoZXIgPSBwYXJzZUNvbmp1bmN0aW9uKCk7XG4gICAgcmVzdWx0cy5wdXNoKHsgbWF0Y2hlciwgcHJpb3JpdHkgfSk7XG4gICAgaWYgKHRva2VuICE9PSBcIixcIikge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHRva2VuID0gdG9rZW5pemVyLm5leHQoKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cztcbiAgZnVuY3Rpb24gcGFyc2VPcGVyYW5kKCkge1xuICAgIGlmICh0b2tlbiA9PT0gXCItXCIpIHtcbiAgICAgIHRva2VuID0gdG9rZW5pemVyLm5leHQoKTtcbiAgICAgIGNvbnN0IGV4cHJlc3Npb25Ub05lZ2F0ZSA9IHBhcnNlT3BlcmFuZCgpO1xuICAgICAgcmV0dXJuIChtYXRjaGVySW5wdXQpID0+ICEhZXhwcmVzc2lvblRvTmVnYXRlICYmICFleHByZXNzaW9uVG9OZWdhdGUobWF0Y2hlcklucHV0KTtcbiAgICB9XG4gICAgaWYgKHRva2VuID09PSBcIihcIikge1xuICAgICAgdG9rZW4gPSB0b2tlbml6ZXIubmV4dCgpO1xuICAgICAgY29uc3QgZXhwcmVzc2lvbkluUGFyZW50cyA9IHBhcnNlSW5uZXJFeHByZXNzaW9uKCk7XG4gICAgICBpZiAodG9rZW4gPT09IFwiKVwiKSB7XG4gICAgICAgIHRva2VuID0gdG9rZW5pemVyLm5leHQoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBleHByZXNzaW9uSW5QYXJlbnRzO1xuICAgIH1cbiAgICBpZiAoaXNJZGVudGlmaWVyKHRva2VuKSkge1xuICAgICAgY29uc3QgaWRlbnRpZmllcnMgPSBbXTtcbiAgICAgIGRvIHtcbiAgICAgICAgaWRlbnRpZmllcnMucHVzaCh0b2tlbik7XG4gICAgICAgIHRva2VuID0gdG9rZW5pemVyLm5leHQoKTtcbiAgICAgIH0gd2hpbGUgKGlzSWRlbnRpZmllcih0b2tlbikpO1xuICAgICAgcmV0dXJuIChtYXRjaGVySW5wdXQpID0+IG1hdGNoZXNOYW1lKGlkZW50aWZpZXJzLCBtYXRjaGVySW5wdXQpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBmdW5jdGlvbiBwYXJzZUNvbmp1bmN0aW9uKCkge1xuICAgIGNvbnN0IG1hdGNoZXJzID0gW107XG4gICAgbGV0IG1hdGNoZXIgPSBwYXJzZU9wZXJhbmQoKTtcbiAgICB3aGlsZSAobWF0Y2hlcikge1xuICAgICAgbWF0Y2hlcnMucHVzaChtYXRjaGVyKTtcbiAgICAgIG1hdGNoZXIgPSBwYXJzZU9wZXJhbmQoKTtcbiAgICB9XG4gICAgcmV0dXJuIChtYXRjaGVySW5wdXQpID0+IG1hdGNoZXJzLmV2ZXJ5KChtYXRjaGVyMikgPT4gbWF0Y2hlcjIobWF0Y2hlcklucHV0KSk7XG4gIH1cbiAgZnVuY3Rpb24gcGFyc2VJbm5lckV4cHJlc3Npb24oKSB7XG4gICAgY29uc3QgbWF0Y2hlcnMgPSBbXTtcbiAgICBsZXQgbWF0Y2hlciA9IHBhcnNlQ29uanVuY3Rpb24oKTtcbiAgICB3aGlsZSAobWF0Y2hlcikge1xuICAgICAgbWF0Y2hlcnMucHVzaChtYXRjaGVyKTtcbiAgICAgIGlmICh0b2tlbiA9PT0gXCJ8XCIgfHwgdG9rZW4gPT09IFwiLFwiKSB7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICB0b2tlbiA9IHRva2VuaXplci5uZXh0KCk7XG4gICAgICAgIH0gd2hpbGUgKHRva2VuID09PSBcInxcIiB8fCB0b2tlbiA9PT0gXCIsXCIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBtYXRjaGVyID0gcGFyc2VDb25qdW5jdGlvbigpO1xuICAgIH1cbiAgICByZXR1cm4gKG1hdGNoZXJJbnB1dCkgPT4gbWF0Y2hlcnMuc29tZSgobWF0Y2hlcjIpID0+IG1hdGNoZXIyKG1hdGNoZXJJbnB1dCkpO1xuICB9XG59XG5mdW5jdGlvbiBpc0lkZW50aWZpZXIodG9rZW4pIHtcbiAgcmV0dXJuICEhdG9rZW4gJiYgISF0b2tlbi5tYXRjaCgvW1xcd1xcLjpdKy8pO1xufVxuZnVuY3Rpb24gbmV3VG9rZW5pemVyKGlucHV0KSB7XG4gIGxldCByZWdleCA9IC8oW0xSXTp8W1xcd1xcLjpdW1xcd1xcLjpcXC1dKnxbXFwsXFx8XFwtXFwoXFwpXSkvZztcbiAgbGV0IG1hdGNoID0gcmVnZXguZXhlYyhpbnB1dCk7XG4gIHJldHVybiB7XG4gICAgbmV4dDogKCkgPT4ge1xuICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHJlcyA9IG1hdGNoWzBdO1xuICAgICAgbWF0Y2ggPSByZWdleC5leGVjKGlucHV0KTtcbiAgICAgIHJldHVybiByZXM7XG4gICAgfVxuICB9O1xufVxuXG4vLyBzcmMvb25pZ0xpYi50c1xudmFyIEZpbmRPcHRpb24gPSAvKiBAX19QVVJFX18gKi8gKChGaW5kT3B0aW9uMikgPT4ge1xuICBGaW5kT3B0aW9uMltGaW5kT3B0aW9uMltcIk5vbmVcIl0gPSAwXSA9IFwiTm9uZVwiO1xuICBGaW5kT3B0aW9uMltGaW5kT3B0aW9uMltcIk5vdEJlZ2luU3RyaW5nXCJdID0gMV0gPSBcIk5vdEJlZ2luU3RyaW5nXCI7XG4gIEZpbmRPcHRpb24yW0ZpbmRPcHRpb24yW1wiTm90RW5kU3RyaW5nXCJdID0gMl0gPSBcIk5vdEVuZFN0cmluZ1wiO1xuICBGaW5kT3B0aW9uMltGaW5kT3B0aW9uMltcIk5vdEJlZ2luUG9zaXRpb25cIl0gPSA0XSA9IFwiTm90QmVnaW5Qb3NpdGlvblwiO1xuICBGaW5kT3B0aW9uMltGaW5kT3B0aW9uMltcIkRlYnVnQ2FsbFwiXSA9IDhdID0gXCJEZWJ1Z0NhbGxcIjtcbiAgcmV0dXJuIEZpbmRPcHRpb24yO1xufSkoRmluZE9wdGlvbiB8fCB7fSk7XG5mdW5jdGlvbiBkaXNwb3NlT25pZ1N0cmluZyhzdHIpIHtcbiAgaWYgKHR5cGVvZiBzdHIuZGlzcG9zZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgc3RyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG4vLyBzcmMvZ3JhbW1hci9ncmFtbWFyRGVwZW5kZW5jaWVzLnRzXG52YXIgVG9wTGV2ZWxSdWxlUmVmZXJlbmNlID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihzY29wZU5hbWUpIHtcbiAgICB0aGlzLnNjb3BlTmFtZSA9IHNjb3BlTmFtZTtcbiAgfVxuICB0b0tleSgpIHtcbiAgICByZXR1cm4gdGhpcy5zY29wZU5hbWU7XG4gIH1cbn07XG52YXIgVG9wTGV2ZWxSZXBvc2l0b3J5UnVsZVJlZmVyZW5jZSA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3Ioc2NvcGVOYW1lLCBydWxlTmFtZSkge1xuICAgIHRoaXMuc2NvcGVOYW1lID0gc2NvcGVOYW1lO1xuICAgIHRoaXMucnVsZU5hbWUgPSBydWxlTmFtZTtcbiAgfVxuICB0b0tleSgpIHtcbiAgICByZXR1cm4gYCR7dGhpcy5zY29wZU5hbWV9IyR7dGhpcy5ydWxlTmFtZX1gO1xuICB9XG59O1xudmFyIEV4dGVybmFsUmVmZXJlbmNlQ29sbGVjdG9yID0gY2xhc3Mge1xuICBfcmVmZXJlbmNlcyA9IFtdO1xuICBfc2VlblJlZmVyZW5jZUtleXMgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpO1xuICBnZXQgcmVmZXJlbmNlcygpIHtcbiAgICByZXR1cm4gdGhpcy5fcmVmZXJlbmNlcztcbiAgfVxuICB2aXNpdGVkUnVsZSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7XG4gIGFkZChyZWZlcmVuY2UpIHtcbiAgICBjb25zdCBrZXkgPSByZWZlcmVuY2UudG9LZXkoKTtcbiAgICBpZiAodGhpcy5fc2VlblJlZmVyZW5jZUtleXMuaGFzKGtleSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fc2VlblJlZmVyZW5jZUtleXMuYWRkKGtleSk7XG4gICAgdGhpcy5fcmVmZXJlbmNlcy5wdXNoKHJlZmVyZW5jZSk7XG4gIH1cbn07XG52YXIgU2NvcGVEZXBlbmRlbmN5UHJvY2Vzc29yID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihyZXBvLCBpbml0aWFsU2NvcGVOYW1lKSB7XG4gICAgdGhpcy5yZXBvID0gcmVwbztcbiAgICB0aGlzLmluaXRpYWxTY29wZU5hbWUgPSBpbml0aWFsU2NvcGVOYW1lO1xuICAgIHRoaXMuc2VlbkZ1bGxTY29wZVJlcXVlc3RzLmFkZCh0aGlzLmluaXRpYWxTY29wZU5hbWUpO1xuICAgIHRoaXMuUSA9IFtuZXcgVG9wTGV2ZWxSdWxlUmVmZXJlbmNlKHRoaXMuaW5pdGlhbFNjb3BlTmFtZSldO1xuICB9XG4gIHNlZW5GdWxsU2NvcGVSZXF1ZXN0cyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7XG4gIHNlZW5QYXJ0aWFsU2NvcGVSZXF1ZXN0cyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7XG4gIFE7XG4gIHByb2Nlc3NRdWV1ZSgpIHtcbiAgICBjb25zdCBxID0gdGhpcy5RO1xuICAgIHRoaXMuUSA9IFtdO1xuICAgIGNvbnN0IGRlcHMgPSBuZXcgRXh0ZXJuYWxSZWZlcmVuY2VDb2xsZWN0b3IoKTtcbiAgICBmb3IgKGNvbnN0IGRlcCBvZiBxKSB7XG4gICAgICBjb2xsZWN0UmVmZXJlbmNlc09mUmVmZXJlbmNlKGRlcCwgdGhpcy5pbml0aWFsU2NvcGVOYW1lLCB0aGlzLnJlcG8sIGRlcHMpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGRlcCBvZiBkZXBzLnJlZmVyZW5jZXMpIHtcbiAgICAgIGlmIChkZXAgaW5zdGFuY2VvZiBUb3BMZXZlbFJ1bGVSZWZlcmVuY2UpIHtcbiAgICAgICAgaWYgKHRoaXMuc2VlbkZ1bGxTY29wZVJlcXVlc3RzLmhhcyhkZXAuc2NvcGVOYW1lKSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2VlbkZ1bGxTY29wZVJlcXVlc3RzLmFkZChkZXAuc2NvcGVOYW1lKTtcbiAgICAgICAgdGhpcy5RLnB1c2goZGVwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLnNlZW5GdWxsU2NvcGVSZXF1ZXN0cy5oYXMoZGVwLnNjb3BlTmFtZSkpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5zZWVuUGFydGlhbFNjb3BlUmVxdWVzdHMuaGFzKGRlcC50b0tleSgpKSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2VlblBhcnRpYWxTY29wZVJlcXVlc3RzLmFkZChkZXAudG9LZXkoKSk7XG4gICAgICAgIHRoaXMuUS5wdXNoKGRlcCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuZnVuY3Rpb24gY29sbGVjdFJlZmVyZW5jZXNPZlJlZmVyZW5jZShyZWZlcmVuY2UsIGJhc2VHcmFtbWFyU2NvcGVOYW1lLCByZXBvLCByZXN1bHQpIHtcbiAgY29uc3Qgc2VsZkdyYW1tYXIgPSByZXBvLmxvb2t1cChyZWZlcmVuY2Uuc2NvcGVOYW1lKTtcbiAgaWYgKCFzZWxmR3JhbW1hcikge1xuICAgIGlmIChyZWZlcmVuY2Uuc2NvcGVOYW1lID09PSBiYXNlR3JhbW1hclNjb3BlTmFtZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBObyBncmFtbWFyIHByb3ZpZGVkIGZvciA8JHtiYXNlR3JhbW1hclNjb3BlTmFtZX0+YCk7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBiYXNlR3JhbW1hciA9IHJlcG8ubG9va3VwKGJhc2VHcmFtbWFyU2NvcGVOYW1lKTtcbiAgaWYgKHJlZmVyZW5jZSBpbnN0YW5jZW9mIFRvcExldmVsUnVsZVJlZmVyZW5jZSkge1xuICAgIGNvbGxlY3RFeHRlcm5hbFJlZmVyZW5jZXNJblRvcExldmVsUnVsZSh7IGJhc2VHcmFtbWFyLCBzZWxmR3JhbW1hciB9LCByZXN1bHQpO1xuICB9IGVsc2Uge1xuICAgIGNvbGxlY3RFeHRlcm5hbFJlZmVyZW5jZXNJblRvcExldmVsUmVwb3NpdG9yeVJ1bGUoXG4gICAgICByZWZlcmVuY2UucnVsZU5hbWUsXG4gICAgICB7IGJhc2VHcmFtbWFyLCBzZWxmR3JhbW1hciwgcmVwb3NpdG9yeTogc2VsZkdyYW1tYXIucmVwb3NpdG9yeSB9LFxuICAgICAgcmVzdWx0XG4gICAgKTtcbiAgfVxuICBjb25zdCBpbmplY3Rpb25zID0gcmVwby5pbmplY3Rpb25zKHJlZmVyZW5jZS5zY29wZU5hbWUpO1xuICBpZiAoaW5qZWN0aW9ucykge1xuICAgIGZvciAoY29uc3QgaW5qZWN0aW9uIG9mIGluamVjdGlvbnMpIHtcbiAgICAgIHJlc3VsdC5hZGQobmV3IFRvcExldmVsUnVsZVJlZmVyZW5jZShpbmplY3Rpb24pKTtcbiAgICB9XG4gIH1cbn1cbmZ1bmN0aW9uIGNvbGxlY3RFeHRlcm5hbFJlZmVyZW5jZXNJblRvcExldmVsUmVwb3NpdG9yeVJ1bGUocnVsZU5hbWUsIGNvbnRleHQsIHJlc3VsdCkge1xuICBpZiAoY29udGV4dC5yZXBvc2l0b3J5ICYmIGNvbnRleHQucmVwb3NpdG9yeVtydWxlTmFtZV0pIHtcbiAgICBjb25zdCBydWxlID0gY29udGV4dC5yZXBvc2l0b3J5W3J1bGVOYW1lXTtcbiAgICBjb2xsZWN0RXh0ZXJuYWxSZWZlcmVuY2VzSW5SdWxlcyhbcnVsZV0sIGNvbnRleHQsIHJlc3VsdCk7XG4gIH1cbn1cbmZ1bmN0aW9uIGNvbGxlY3RFeHRlcm5hbFJlZmVyZW5jZXNJblRvcExldmVsUnVsZShjb250ZXh0LCByZXN1bHQpIHtcbiAgaWYgKGNvbnRleHQuc2VsZkdyYW1tYXIucGF0dGVybnMgJiYgQXJyYXkuaXNBcnJheShjb250ZXh0LnNlbGZHcmFtbWFyLnBhdHRlcm5zKSkge1xuICAgIGNvbGxlY3RFeHRlcm5hbFJlZmVyZW5jZXNJblJ1bGVzKFxuICAgICAgY29udGV4dC5zZWxmR3JhbW1hci5wYXR0ZXJucyxcbiAgICAgIHsgLi4uY29udGV4dCwgcmVwb3NpdG9yeTogY29udGV4dC5zZWxmR3JhbW1hci5yZXBvc2l0b3J5IH0sXG4gICAgICByZXN1bHRcbiAgICApO1xuICB9XG4gIGlmIChjb250ZXh0LnNlbGZHcmFtbWFyLmluamVjdGlvbnMpIHtcbiAgICBjb2xsZWN0RXh0ZXJuYWxSZWZlcmVuY2VzSW5SdWxlcyhcbiAgICAgIE9iamVjdC52YWx1ZXMoY29udGV4dC5zZWxmR3JhbW1hci5pbmplY3Rpb25zKSxcbiAgICAgIHsgLi4uY29udGV4dCwgcmVwb3NpdG9yeTogY29udGV4dC5zZWxmR3JhbW1hci5yZXBvc2l0b3J5IH0sXG4gICAgICByZXN1bHRcbiAgICApO1xuICB9XG59XG5mdW5jdGlvbiBjb2xsZWN0RXh0ZXJuYWxSZWZlcmVuY2VzSW5SdWxlcyhydWxlcywgY29udGV4dCwgcmVzdWx0KSB7XG4gIGZvciAoY29uc3QgcnVsZSBvZiBydWxlcykge1xuICAgIGlmIChyZXN1bHQudmlzaXRlZFJ1bGUuaGFzKHJ1bGUpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgcmVzdWx0LnZpc2l0ZWRSdWxlLmFkZChydWxlKTtcbiAgICBjb25zdCBwYXR0ZXJuUmVwb3NpdG9yeSA9IHJ1bGUucmVwb3NpdG9yeSA/IG1lcmdlT2JqZWN0cyh7fSwgY29udGV4dC5yZXBvc2l0b3J5LCBydWxlLnJlcG9zaXRvcnkpIDogY29udGV4dC5yZXBvc2l0b3J5O1xuICAgIGlmIChBcnJheS5pc0FycmF5KHJ1bGUucGF0dGVybnMpKSB7XG4gICAgICBjb2xsZWN0RXh0ZXJuYWxSZWZlcmVuY2VzSW5SdWxlcyhydWxlLnBhdHRlcm5zLCB7IC4uLmNvbnRleHQsIHJlcG9zaXRvcnk6IHBhdHRlcm5SZXBvc2l0b3J5IH0sIHJlc3VsdCk7XG4gICAgfVxuICAgIGNvbnN0IGluY2x1ZGUgPSBydWxlLmluY2x1ZGU7XG4gICAgaWYgKCFpbmNsdWRlKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgY29uc3QgcmVmZXJlbmNlID0gcGFyc2VJbmNsdWRlKGluY2x1ZGUpO1xuICAgIHN3aXRjaCAocmVmZXJlbmNlLmtpbmQpIHtcbiAgICAgIGNhc2UgMCAvKiBCYXNlICovOlxuICAgICAgICBjb2xsZWN0RXh0ZXJuYWxSZWZlcmVuY2VzSW5Ub3BMZXZlbFJ1bGUoeyAuLi5jb250ZXh0LCBzZWxmR3JhbW1hcjogY29udGV4dC5iYXNlR3JhbW1hciB9LCByZXN1bHQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMSAvKiBTZWxmICovOlxuICAgICAgICBjb2xsZWN0RXh0ZXJuYWxSZWZlcmVuY2VzSW5Ub3BMZXZlbFJ1bGUoY29udGV4dCwgcmVzdWx0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDIgLyogUmVsYXRpdmVSZWZlcmVuY2UgKi86XG4gICAgICAgIGNvbGxlY3RFeHRlcm5hbFJlZmVyZW5jZXNJblRvcExldmVsUmVwb3NpdG9yeVJ1bGUocmVmZXJlbmNlLnJ1bGVOYW1lLCB7IC4uLmNvbnRleHQsIHJlcG9zaXRvcnk6IHBhdHRlcm5SZXBvc2l0b3J5IH0sIHJlc3VsdCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzIC8qIFRvcExldmVsUmVmZXJlbmNlICovOlxuICAgICAgY2FzZSA0IC8qIFRvcExldmVsUmVwb3NpdG9yeVJlZmVyZW5jZSAqLzpcbiAgICAgICAgY29uc3Qgc2VsZkdyYW1tYXIgPSByZWZlcmVuY2Uuc2NvcGVOYW1lID09PSBjb250ZXh0LnNlbGZHcmFtbWFyLnNjb3BlTmFtZSA/IGNvbnRleHQuc2VsZkdyYW1tYXIgOiByZWZlcmVuY2Uuc2NvcGVOYW1lID09PSBjb250ZXh0LmJhc2VHcmFtbWFyLnNjb3BlTmFtZSA/IGNvbnRleHQuYmFzZUdyYW1tYXIgOiB2b2lkIDA7XG4gICAgICAgIGlmIChzZWxmR3JhbW1hcikge1xuICAgICAgICAgIGNvbnN0IG5ld0NvbnRleHQgPSB7IGJhc2VHcmFtbWFyOiBjb250ZXh0LmJhc2VHcmFtbWFyLCBzZWxmR3JhbW1hciwgcmVwb3NpdG9yeTogcGF0dGVyblJlcG9zaXRvcnkgfTtcbiAgICAgICAgICBpZiAocmVmZXJlbmNlLmtpbmQgPT09IDQgLyogVG9wTGV2ZWxSZXBvc2l0b3J5UmVmZXJlbmNlICovKSB7XG4gICAgICAgICAgICBjb2xsZWN0RXh0ZXJuYWxSZWZlcmVuY2VzSW5Ub3BMZXZlbFJlcG9zaXRvcnlSdWxlKHJlZmVyZW5jZS5ydWxlTmFtZSwgbmV3Q29udGV4dCwgcmVzdWx0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29sbGVjdEV4dGVybmFsUmVmZXJlbmNlc0luVG9wTGV2ZWxSdWxlKG5ld0NvbnRleHQsIHJlc3VsdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChyZWZlcmVuY2Uua2luZCA9PT0gNCAvKiBUb3BMZXZlbFJlcG9zaXRvcnlSZWZlcmVuY2UgKi8pIHtcbiAgICAgICAgICAgIHJlc3VsdC5hZGQobmV3IFRvcExldmVsUmVwb3NpdG9yeVJ1bGVSZWZlcmVuY2UocmVmZXJlbmNlLnNjb3BlTmFtZSwgcmVmZXJlbmNlLnJ1bGVOYW1lKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5hZGQobmV3IFRvcExldmVsUnVsZVJlZmVyZW5jZShyZWZlcmVuY2Uuc2NvcGVOYW1lKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxufVxudmFyIEJhc2VSZWZlcmVuY2UgPSBjbGFzcyB7XG4gIGtpbmQgPSAwIC8qIEJhc2UgKi87XG59O1xudmFyIFNlbGZSZWZlcmVuY2UgPSBjbGFzcyB7XG4gIGtpbmQgPSAxIC8qIFNlbGYgKi87XG59O1xudmFyIFJlbGF0aXZlUmVmZXJlbmNlID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihydWxlTmFtZSkge1xuICAgIHRoaXMucnVsZU5hbWUgPSBydWxlTmFtZTtcbiAgfVxuICBraW5kID0gMiAvKiBSZWxhdGl2ZVJlZmVyZW5jZSAqLztcbn07XG52YXIgVG9wTGV2ZWxSZWZlcmVuY2UgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlTmFtZSkge1xuICAgIHRoaXMuc2NvcGVOYW1lID0gc2NvcGVOYW1lO1xuICB9XG4gIGtpbmQgPSAzIC8qIFRvcExldmVsUmVmZXJlbmNlICovO1xufTtcbnZhciBUb3BMZXZlbFJlcG9zaXRvcnlSZWZlcmVuY2UgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlTmFtZSwgcnVsZU5hbWUpIHtcbiAgICB0aGlzLnNjb3BlTmFtZSA9IHNjb3BlTmFtZTtcbiAgICB0aGlzLnJ1bGVOYW1lID0gcnVsZU5hbWU7XG4gIH1cbiAga2luZCA9IDQgLyogVG9wTGV2ZWxSZXBvc2l0b3J5UmVmZXJlbmNlICovO1xufTtcbmZ1bmN0aW9uIHBhcnNlSW5jbHVkZShpbmNsdWRlKSB7XG4gIGlmIChpbmNsdWRlID09PSBcIiRiYXNlXCIpIHtcbiAgICByZXR1cm4gbmV3IEJhc2VSZWZlcmVuY2UoKTtcbiAgfSBlbHNlIGlmIChpbmNsdWRlID09PSBcIiRzZWxmXCIpIHtcbiAgICByZXR1cm4gbmV3IFNlbGZSZWZlcmVuY2UoKTtcbiAgfVxuICBjb25zdCBpbmRleE9mU2hhcnAgPSBpbmNsdWRlLmluZGV4T2YoXCIjXCIpO1xuICBpZiAoaW5kZXhPZlNoYXJwID09PSAtMSkge1xuICAgIHJldHVybiBuZXcgVG9wTGV2ZWxSZWZlcmVuY2UoaW5jbHVkZSk7XG4gIH0gZWxzZSBpZiAoaW5kZXhPZlNoYXJwID09PSAwKSB7XG4gICAgcmV0dXJuIG5ldyBSZWxhdGl2ZVJlZmVyZW5jZShpbmNsdWRlLnN1YnN0cmluZygxKSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3Qgc2NvcGVOYW1lID0gaW5jbHVkZS5zdWJzdHJpbmcoMCwgaW5kZXhPZlNoYXJwKTtcbiAgICBjb25zdCBydWxlTmFtZSA9IGluY2x1ZGUuc3Vic3RyaW5nKGluZGV4T2ZTaGFycCArIDEpO1xuICAgIHJldHVybiBuZXcgVG9wTGV2ZWxSZXBvc2l0b3J5UmVmZXJlbmNlKHNjb3BlTmFtZSwgcnVsZU5hbWUpO1xuICB9XG59XG5cbi8vIHNyYy9ydWxlLnRzXG52YXIgSEFTX0JBQ0tfUkVGRVJFTkNFUyA9IC9cXFxcKFxcZCspLztcbnZhciBCQUNLX1JFRkVSRU5DSU5HX0VORCA9IC9cXFxcKFxcZCspL2c7XG52YXIgcnVsZUlkU3ltYm9sID0gU3ltYm9sKFwiUnVsZUlkXCIpO1xudmFyIGVuZFJ1bGVJZCA9IC0xO1xudmFyIHdoaWxlUnVsZUlkID0gLTI7XG5mdW5jdGlvbiBydWxlSWRGcm9tTnVtYmVyKGlkKSB7XG4gIHJldHVybiBpZDtcbn1cbmZ1bmN0aW9uIHJ1bGVJZFRvTnVtYmVyKGlkKSB7XG4gIHJldHVybiBpZDtcbn1cbnZhciBSdWxlID0gY2xhc3Mge1xuICAkbG9jYXRpb247XG4gIGlkO1xuICBfbmFtZUlzQ2FwdHVyaW5nO1xuICBfbmFtZTtcbiAgX2NvbnRlbnROYW1lSXNDYXB0dXJpbmc7XG4gIF9jb250ZW50TmFtZTtcbiAgY29uc3RydWN0b3IoJGxvY2F0aW9uLCBpZCwgbmFtZSwgY29udGVudE5hbWUpIHtcbiAgICB0aGlzLiRsb2NhdGlvbiA9ICRsb2NhdGlvbjtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5fbmFtZSA9IG5hbWUgfHwgbnVsbDtcbiAgICB0aGlzLl9uYW1lSXNDYXB0dXJpbmcgPSBSZWdleFNvdXJjZS5oYXNDYXB0dXJlcyh0aGlzLl9uYW1lKTtcbiAgICB0aGlzLl9jb250ZW50TmFtZSA9IGNvbnRlbnROYW1lIHx8IG51bGw7XG4gICAgdGhpcy5fY29udGVudE5hbWVJc0NhcHR1cmluZyA9IFJlZ2V4U291cmNlLmhhc0NhcHR1cmVzKHRoaXMuX2NvbnRlbnROYW1lKTtcbiAgfVxuICBnZXQgZGVidWdOYW1lKCkge1xuICAgIGNvbnN0IGxvY2F0aW9uID0gdGhpcy4kbG9jYXRpb24gPyBgJHtiYXNlbmFtZSh0aGlzLiRsb2NhdGlvbi5maWxlbmFtZSl9OiR7dGhpcy4kbG9jYXRpb24ubGluZX1gIDogXCJ1bmtub3duXCI7XG4gICAgcmV0dXJuIGAke3RoaXMuY29uc3RydWN0b3IubmFtZX0jJHt0aGlzLmlkfSBAICR7bG9jYXRpb259YDtcbiAgfVxuICBnZXROYW1lKGxpbmVUZXh0LCBjYXB0dXJlSW5kaWNlcykge1xuICAgIGlmICghdGhpcy5fbmFtZUlzQ2FwdHVyaW5nIHx8IHRoaXMuX25hbWUgPT09IG51bGwgfHwgbGluZVRleHQgPT09IG51bGwgfHwgY2FwdHVyZUluZGljZXMgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLl9uYW1lO1xuICAgIH1cbiAgICByZXR1cm4gUmVnZXhTb3VyY2UucmVwbGFjZUNhcHR1cmVzKHRoaXMuX25hbWUsIGxpbmVUZXh0LCBjYXB0dXJlSW5kaWNlcyk7XG4gIH1cbiAgZ2V0Q29udGVudE5hbWUobGluZVRleHQsIGNhcHR1cmVJbmRpY2VzKSB7XG4gICAgaWYgKCF0aGlzLl9jb250ZW50TmFtZUlzQ2FwdHVyaW5nIHx8IHRoaXMuX2NvbnRlbnROYW1lID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY29udGVudE5hbWU7XG4gICAgfVxuICAgIHJldHVybiBSZWdleFNvdXJjZS5yZXBsYWNlQ2FwdHVyZXModGhpcy5fY29udGVudE5hbWUsIGxpbmVUZXh0LCBjYXB0dXJlSW5kaWNlcyk7XG4gIH1cbn07XG52YXIgQ2FwdHVyZVJ1bGUgPSBjbGFzcyBleHRlbmRzIFJ1bGUge1xuICByZXRva2VuaXplQ2FwdHVyZWRXaXRoUnVsZUlkO1xuICBjb25zdHJ1Y3RvcigkbG9jYXRpb24sIGlkLCBuYW1lLCBjb250ZW50TmFtZSwgcmV0b2tlbml6ZUNhcHR1cmVkV2l0aFJ1bGVJZCkge1xuICAgIHN1cGVyKCRsb2NhdGlvbiwgaWQsIG5hbWUsIGNvbnRlbnROYW1lKTtcbiAgICB0aGlzLnJldG9rZW5pemVDYXB0dXJlZFdpdGhSdWxlSWQgPSByZXRva2VuaXplQ2FwdHVyZWRXaXRoUnVsZUlkO1xuICB9XG4gIGRpc3Bvc2UoKSB7XG4gIH1cbiAgY29sbGVjdFBhdHRlcm5zKGdyYW1tYXIsIG91dCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIk5vdCBzdXBwb3J0ZWQhXCIpO1xuICB9XG4gIGNvbXBpbGUoZ3JhbW1hciwgZW5kUmVnZXhTb3VyY2UpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJOb3Qgc3VwcG9ydGVkIVwiKTtcbiAgfVxuICBjb21waWxlQUcoZ3JhbW1hciwgZW5kUmVnZXhTb3VyY2UsIGFsbG93QSwgYWxsb3dHKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTm90IHN1cHBvcnRlZCFcIik7XG4gIH1cbn07XG52YXIgTWF0Y2hSdWxlID0gY2xhc3MgZXh0ZW5kcyBSdWxlIHtcbiAgX21hdGNoO1xuICBjYXB0dXJlcztcbiAgX2NhY2hlZENvbXBpbGVkUGF0dGVybnM7XG4gIGNvbnN0cnVjdG9yKCRsb2NhdGlvbiwgaWQsIG5hbWUsIG1hdGNoLCBjYXB0dXJlcykge1xuICAgIHN1cGVyKCRsb2NhdGlvbiwgaWQsIG5hbWUsIG51bGwpO1xuICAgIHRoaXMuX21hdGNoID0gbmV3IFJlZ0V4cFNvdXJjZShtYXRjaCwgdGhpcy5pZCk7XG4gICAgdGhpcy5jYXB0dXJlcyA9IGNhcHR1cmVzO1xuICAgIHRoaXMuX2NhY2hlZENvbXBpbGVkUGF0dGVybnMgPSBudWxsO1xuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgaWYgKHRoaXMuX2NhY2hlZENvbXBpbGVkUGF0dGVybnMpIHtcbiAgICAgIHRoaXMuX2NhY2hlZENvbXBpbGVkUGF0dGVybnMuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fY2FjaGVkQ29tcGlsZWRQYXR0ZXJucyA9IG51bGw7XG4gICAgfVxuICB9XG4gIGdldCBkZWJ1Z01hdGNoUmVnRXhwKCkge1xuICAgIHJldHVybiBgJHt0aGlzLl9tYXRjaC5zb3VyY2V9YDtcbiAgfVxuICBjb2xsZWN0UGF0dGVybnMoZ3JhbW1hciwgb3V0KSB7XG4gICAgb3V0LnB1c2godGhpcy5fbWF0Y2gpO1xuICB9XG4gIGNvbXBpbGUoZ3JhbW1hciwgZW5kUmVnZXhTb3VyY2UpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0Q2FjaGVkQ29tcGlsZWRQYXR0ZXJucyhncmFtbWFyKS5jb21waWxlKGdyYW1tYXIpO1xuICB9XG4gIGNvbXBpbGVBRyhncmFtbWFyLCBlbmRSZWdleFNvdXJjZSwgYWxsb3dBLCBhbGxvd0cpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0Q2FjaGVkQ29tcGlsZWRQYXR0ZXJucyhncmFtbWFyKS5jb21waWxlQUcoZ3JhbW1hciwgYWxsb3dBLCBhbGxvd0cpO1xuICB9XG4gIF9nZXRDYWNoZWRDb21waWxlZFBhdHRlcm5zKGdyYW1tYXIpIHtcbiAgICBpZiAoIXRoaXMuX2NhY2hlZENvbXBpbGVkUGF0dGVybnMpIHtcbiAgICAgIHRoaXMuX2NhY2hlZENvbXBpbGVkUGF0dGVybnMgPSBuZXcgUmVnRXhwU291cmNlTGlzdCgpO1xuICAgICAgdGhpcy5jb2xsZWN0UGF0dGVybnMoZ3JhbW1hciwgdGhpcy5fY2FjaGVkQ29tcGlsZWRQYXR0ZXJucyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9jYWNoZWRDb21waWxlZFBhdHRlcm5zO1xuICB9XG59O1xudmFyIEluY2x1ZGVPbmx5UnVsZSA9IGNsYXNzIGV4dGVuZHMgUnVsZSB7XG4gIGhhc01pc3NpbmdQYXR0ZXJucztcbiAgcGF0dGVybnM7XG4gIF9jYWNoZWRDb21waWxlZFBhdHRlcm5zO1xuICBjb25zdHJ1Y3RvcigkbG9jYXRpb24sIGlkLCBuYW1lLCBjb250ZW50TmFtZSwgcGF0dGVybnMpIHtcbiAgICBzdXBlcigkbG9jYXRpb24sIGlkLCBuYW1lLCBjb250ZW50TmFtZSk7XG4gICAgdGhpcy5wYXR0ZXJucyA9IHBhdHRlcm5zLnBhdHRlcm5zO1xuICAgIHRoaXMuaGFzTWlzc2luZ1BhdHRlcm5zID0gcGF0dGVybnMuaGFzTWlzc2luZ1BhdHRlcm5zO1xuICAgIHRoaXMuX2NhY2hlZENvbXBpbGVkUGF0dGVybnMgPSBudWxsO1xuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgaWYgKHRoaXMuX2NhY2hlZENvbXBpbGVkUGF0dGVybnMpIHtcbiAgICAgIHRoaXMuX2NhY2hlZENvbXBpbGVkUGF0dGVybnMuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fY2FjaGVkQ29tcGlsZWRQYXR0ZXJucyA9IG51bGw7XG4gICAgfVxuICB9XG4gIGNvbGxlY3RQYXR0ZXJucyhncmFtbWFyLCBvdXQpIHtcbiAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgdGhpcy5wYXR0ZXJucykge1xuICAgICAgY29uc3QgcnVsZSA9IGdyYW1tYXIuZ2V0UnVsZShwYXR0ZXJuKTtcbiAgICAgIHJ1bGUuY29sbGVjdFBhdHRlcm5zKGdyYW1tYXIsIG91dCk7XG4gICAgfVxuICB9XG4gIGNvbXBpbGUoZ3JhbW1hciwgZW5kUmVnZXhTb3VyY2UpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0Q2FjaGVkQ29tcGlsZWRQYXR0ZXJucyhncmFtbWFyKS5jb21waWxlKGdyYW1tYXIpO1xuICB9XG4gIGNvbXBpbGVBRyhncmFtbWFyLCBlbmRSZWdleFNvdXJjZSwgYWxsb3dBLCBhbGxvd0cpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0Q2FjaGVkQ29tcGlsZWRQYXR0ZXJucyhncmFtbWFyKS5jb21waWxlQUcoZ3JhbW1hciwgYWxsb3dBLCBhbGxvd0cpO1xuICB9XG4gIF9nZXRDYWNoZWRDb21waWxlZFBhdHRlcm5zKGdyYW1tYXIpIHtcbiAgICBpZiAoIXRoaXMuX2NhY2hlZENvbXBpbGVkUGF0dGVybnMpIHtcbiAgICAgIHRoaXMuX2NhY2hlZENvbXBpbGVkUGF0dGVybnMgPSBuZXcgUmVnRXhwU291cmNlTGlzdCgpO1xuICAgICAgdGhpcy5jb2xsZWN0UGF0dGVybnMoZ3JhbW1hciwgdGhpcy5fY2FjaGVkQ29tcGlsZWRQYXR0ZXJucyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9jYWNoZWRDb21waWxlZFBhdHRlcm5zO1xuICB9XG59O1xudmFyIEJlZ2luRW5kUnVsZSA9IGNsYXNzIGV4dGVuZHMgUnVsZSB7XG4gIF9iZWdpbjtcbiAgYmVnaW5DYXB0dXJlcztcbiAgX2VuZDtcbiAgZW5kSGFzQmFja1JlZmVyZW5jZXM7XG4gIGVuZENhcHR1cmVzO1xuICBhcHBseUVuZFBhdHRlcm5MYXN0O1xuICBoYXNNaXNzaW5nUGF0dGVybnM7XG4gIHBhdHRlcm5zO1xuICBfY2FjaGVkQ29tcGlsZWRQYXR0ZXJucztcbiAgY29uc3RydWN0b3IoJGxvY2F0aW9uLCBpZCwgbmFtZSwgY29udGVudE5hbWUsIGJlZ2luLCBiZWdpbkNhcHR1cmVzLCBlbmQsIGVuZENhcHR1cmVzLCBhcHBseUVuZFBhdHRlcm5MYXN0LCBwYXR0ZXJucykge1xuICAgIHN1cGVyKCRsb2NhdGlvbiwgaWQsIG5hbWUsIGNvbnRlbnROYW1lKTtcbiAgICB0aGlzLl9iZWdpbiA9IG5ldyBSZWdFeHBTb3VyY2UoYmVnaW4sIHRoaXMuaWQpO1xuICAgIHRoaXMuYmVnaW5DYXB0dXJlcyA9IGJlZ2luQ2FwdHVyZXM7XG4gICAgdGhpcy5fZW5kID0gbmV3IFJlZ0V4cFNvdXJjZShlbmQgPyBlbmQgOiBcIlxcdUZGRkZcIiwgLTEpO1xuICAgIHRoaXMuZW5kSGFzQmFja1JlZmVyZW5jZXMgPSB0aGlzLl9lbmQuaGFzQmFja1JlZmVyZW5jZXM7XG4gICAgdGhpcy5lbmRDYXB0dXJlcyA9IGVuZENhcHR1cmVzO1xuICAgIHRoaXMuYXBwbHlFbmRQYXR0ZXJuTGFzdCA9IGFwcGx5RW5kUGF0dGVybkxhc3QgfHwgZmFsc2U7XG4gICAgdGhpcy5wYXR0ZXJucyA9IHBhdHRlcm5zLnBhdHRlcm5zO1xuICAgIHRoaXMuaGFzTWlzc2luZ1BhdHRlcm5zID0gcGF0dGVybnMuaGFzTWlzc2luZ1BhdHRlcm5zO1xuICAgIHRoaXMuX2NhY2hlZENvbXBpbGVkUGF0dGVybnMgPSBudWxsO1xuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgaWYgKHRoaXMuX2NhY2hlZENvbXBpbGVkUGF0dGVybnMpIHtcbiAgICAgIHRoaXMuX2NhY2hlZENvbXBpbGVkUGF0dGVybnMuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fY2FjaGVkQ29tcGlsZWRQYXR0ZXJucyA9IG51bGw7XG4gICAgfVxuICB9XG4gIGdldCBkZWJ1Z0JlZ2luUmVnRXhwKCkge1xuICAgIHJldHVybiBgJHt0aGlzLl9iZWdpbi5zb3VyY2V9YDtcbiAgfVxuICBnZXQgZGVidWdFbmRSZWdFeHAoKSB7XG4gICAgcmV0dXJuIGAke3RoaXMuX2VuZC5zb3VyY2V9YDtcbiAgfVxuICBnZXRFbmRXaXRoUmVzb2x2ZWRCYWNrUmVmZXJlbmNlcyhsaW5lVGV4dCwgY2FwdHVyZUluZGljZXMpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5kLnJlc29sdmVCYWNrUmVmZXJlbmNlcyhsaW5lVGV4dCwgY2FwdHVyZUluZGljZXMpO1xuICB9XG4gIGNvbGxlY3RQYXR0ZXJucyhncmFtbWFyLCBvdXQpIHtcbiAgICBvdXQucHVzaCh0aGlzLl9iZWdpbik7XG4gIH1cbiAgY29tcGlsZShncmFtbWFyLCBlbmRSZWdleFNvdXJjZSkge1xuICAgIHJldHVybiB0aGlzLl9nZXRDYWNoZWRDb21waWxlZFBhdHRlcm5zKGdyYW1tYXIsIGVuZFJlZ2V4U291cmNlKS5jb21waWxlKGdyYW1tYXIpO1xuICB9XG4gIGNvbXBpbGVBRyhncmFtbWFyLCBlbmRSZWdleFNvdXJjZSwgYWxsb3dBLCBhbGxvd0cpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0Q2FjaGVkQ29tcGlsZWRQYXR0ZXJucyhncmFtbWFyLCBlbmRSZWdleFNvdXJjZSkuY29tcGlsZUFHKGdyYW1tYXIsIGFsbG93QSwgYWxsb3dHKTtcbiAgfVxuICBfZ2V0Q2FjaGVkQ29tcGlsZWRQYXR0ZXJucyhncmFtbWFyLCBlbmRSZWdleFNvdXJjZSkge1xuICAgIGlmICghdGhpcy5fY2FjaGVkQ29tcGlsZWRQYXR0ZXJucykge1xuICAgICAgdGhpcy5fY2FjaGVkQ29tcGlsZWRQYXR0ZXJucyA9IG5ldyBSZWdFeHBTb3VyY2VMaXN0KCk7XG4gICAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgdGhpcy5wYXR0ZXJucykge1xuICAgICAgICBjb25zdCBydWxlID0gZ3JhbW1hci5nZXRSdWxlKHBhdHRlcm4pO1xuICAgICAgICBydWxlLmNvbGxlY3RQYXR0ZXJucyhncmFtbWFyLCB0aGlzLl9jYWNoZWRDb21waWxlZFBhdHRlcm5zKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmFwcGx5RW5kUGF0dGVybkxhc3QpIHtcbiAgICAgICAgdGhpcy5fY2FjaGVkQ29tcGlsZWRQYXR0ZXJucy5wdXNoKHRoaXMuX2VuZC5oYXNCYWNrUmVmZXJlbmNlcyA/IHRoaXMuX2VuZC5jbG9uZSgpIDogdGhpcy5fZW5kKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2NhY2hlZENvbXBpbGVkUGF0dGVybnMudW5zaGlmdCh0aGlzLl9lbmQuaGFzQmFja1JlZmVyZW5jZXMgPyB0aGlzLl9lbmQuY2xvbmUoKSA6IHRoaXMuX2VuZCk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLl9lbmQuaGFzQmFja1JlZmVyZW5jZXMpIHtcbiAgICAgIGlmICh0aGlzLmFwcGx5RW5kUGF0dGVybkxhc3QpIHtcbiAgICAgICAgdGhpcy5fY2FjaGVkQ29tcGlsZWRQYXR0ZXJucy5zZXRTb3VyY2UodGhpcy5fY2FjaGVkQ29tcGlsZWRQYXR0ZXJucy5sZW5ndGgoKSAtIDEsIGVuZFJlZ2V4U291cmNlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2NhY2hlZENvbXBpbGVkUGF0dGVybnMuc2V0U291cmNlKDAsIGVuZFJlZ2V4U291cmNlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2NhY2hlZENvbXBpbGVkUGF0dGVybnM7XG4gIH1cbn07XG52YXIgQmVnaW5XaGlsZVJ1bGUgPSBjbGFzcyBleHRlbmRzIFJ1bGUge1xuICBfYmVnaW47XG4gIGJlZ2luQ2FwdHVyZXM7XG4gIHdoaWxlQ2FwdHVyZXM7XG4gIF93aGlsZTtcbiAgd2hpbGVIYXNCYWNrUmVmZXJlbmNlcztcbiAgaGFzTWlzc2luZ1BhdHRlcm5zO1xuICBwYXR0ZXJucztcbiAgX2NhY2hlZENvbXBpbGVkUGF0dGVybnM7XG4gIF9jYWNoZWRDb21waWxlZFdoaWxlUGF0dGVybnM7XG4gIGNvbnN0cnVjdG9yKCRsb2NhdGlvbiwgaWQsIG5hbWUsIGNvbnRlbnROYW1lLCBiZWdpbiwgYmVnaW5DYXB0dXJlcywgX3doaWxlLCB3aGlsZUNhcHR1cmVzLCBwYXR0ZXJucykge1xuICAgIHN1cGVyKCRsb2NhdGlvbiwgaWQsIG5hbWUsIGNvbnRlbnROYW1lKTtcbiAgICB0aGlzLl9iZWdpbiA9IG5ldyBSZWdFeHBTb3VyY2UoYmVnaW4sIHRoaXMuaWQpO1xuICAgIHRoaXMuYmVnaW5DYXB0dXJlcyA9IGJlZ2luQ2FwdHVyZXM7XG4gICAgdGhpcy53aGlsZUNhcHR1cmVzID0gd2hpbGVDYXB0dXJlcztcbiAgICB0aGlzLl93aGlsZSA9IG5ldyBSZWdFeHBTb3VyY2UoX3doaWxlLCB3aGlsZVJ1bGVJZCk7XG4gICAgdGhpcy53aGlsZUhhc0JhY2tSZWZlcmVuY2VzID0gdGhpcy5fd2hpbGUuaGFzQmFja1JlZmVyZW5jZXM7XG4gICAgdGhpcy5wYXR0ZXJucyA9IHBhdHRlcm5zLnBhdHRlcm5zO1xuICAgIHRoaXMuaGFzTWlzc2luZ1BhdHRlcm5zID0gcGF0dGVybnMuaGFzTWlzc2luZ1BhdHRlcm5zO1xuICAgIHRoaXMuX2NhY2hlZENvbXBpbGVkUGF0dGVybnMgPSBudWxsO1xuICAgIHRoaXMuX2NhY2hlZENvbXBpbGVkV2hpbGVQYXR0ZXJucyA9IG51bGw7XG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICBpZiAodGhpcy5fY2FjaGVkQ29tcGlsZWRQYXR0ZXJucykge1xuICAgICAgdGhpcy5fY2FjaGVkQ29tcGlsZWRQYXR0ZXJucy5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9jYWNoZWRDb21waWxlZFBhdHRlcm5zID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2NhY2hlZENvbXBpbGVkV2hpbGVQYXR0ZXJucykge1xuICAgICAgdGhpcy5fY2FjaGVkQ29tcGlsZWRXaGlsZVBhdHRlcm5zLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX2NhY2hlZENvbXBpbGVkV2hpbGVQYXR0ZXJucyA9IG51bGw7XG4gICAgfVxuICB9XG4gIGdldCBkZWJ1Z0JlZ2luUmVnRXhwKCkge1xuICAgIHJldHVybiBgJHt0aGlzLl9iZWdpbi5zb3VyY2V9YDtcbiAgfVxuICBnZXQgZGVidWdXaGlsZVJlZ0V4cCgpIHtcbiAgICByZXR1cm4gYCR7dGhpcy5fd2hpbGUuc291cmNlfWA7XG4gIH1cbiAgZ2V0V2hpbGVXaXRoUmVzb2x2ZWRCYWNrUmVmZXJlbmNlcyhsaW5lVGV4dCwgY2FwdHVyZUluZGljZXMpIHtcbiAgICByZXR1cm4gdGhpcy5fd2hpbGUucmVzb2x2ZUJhY2tSZWZlcmVuY2VzKGxpbmVUZXh0LCBjYXB0dXJlSW5kaWNlcyk7XG4gIH1cbiAgY29sbGVjdFBhdHRlcm5zKGdyYW1tYXIsIG91dCkge1xuICAgIG91dC5wdXNoKHRoaXMuX2JlZ2luKTtcbiAgfVxuICBjb21waWxlKGdyYW1tYXIsIGVuZFJlZ2V4U291cmNlKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldENhY2hlZENvbXBpbGVkUGF0dGVybnMoZ3JhbW1hcikuY29tcGlsZShncmFtbWFyKTtcbiAgfVxuICBjb21waWxlQUcoZ3JhbW1hciwgZW5kUmVnZXhTb3VyY2UsIGFsbG93QSwgYWxsb3dHKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldENhY2hlZENvbXBpbGVkUGF0dGVybnMoZ3JhbW1hcikuY29tcGlsZUFHKGdyYW1tYXIsIGFsbG93QSwgYWxsb3dHKTtcbiAgfVxuICBfZ2V0Q2FjaGVkQ29tcGlsZWRQYXR0ZXJucyhncmFtbWFyKSB7XG4gICAgaWYgKCF0aGlzLl9jYWNoZWRDb21waWxlZFBhdHRlcm5zKSB7XG4gICAgICB0aGlzLl9jYWNoZWRDb21waWxlZFBhdHRlcm5zID0gbmV3IFJlZ0V4cFNvdXJjZUxpc3QoKTtcbiAgICAgIGZvciAoY29uc3QgcGF0dGVybiBvZiB0aGlzLnBhdHRlcm5zKSB7XG4gICAgICAgIGNvbnN0IHJ1bGUgPSBncmFtbWFyLmdldFJ1bGUocGF0dGVybik7XG4gICAgICAgIHJ1bGUuY29sbGVjdFBhdHRlcm5zKGdyYW1tYXIsIHRoaXMuX2NhY2hlZENvbXBpbGVkUGF0dGVybnMpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fY2FjaGVkQ29tcGlsZWRQYXR0ZXJucztcbiAgfVxuICBjb21waWxlV2hpbGUoZ3JhbW1hciwgZW5kUmVnZXhTb3VyY2UpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0Q2FjaGVkQ29tcGlsZWRXaGlsZVBhdHRlcm5zKGdyYW1tYXIsIGVuZFJlZ2V4U291cmNlKS5jb21waWxlKGdyYW1tYXIpO1xuICB9XG4gIGNvbXBpbGVXaGlsZUFHKGdyYW1tYXIsIGVuZFJlZ2V4U291cmNlLCBhbGxvd0EsIGFsbG93Rykge1xuICAgIHJldHVybiB0aGlzLl9nZXRDYWNoZWRDb21waWxlZFdoaWxlUGF0dGVybnMoZ3JhbW1hciwgZW5kUmVnZXhTb3VyY2UpLmNvbXBpbGVBRyhncmFtbWFyLCBhbGxvd0EsIGFsbG93Ryk7XG4gIH1cbiAgX2dldENhY2hlZENvbXBpbGVkV2hpbGVQYXR0ZXJucyhncmFtbWFyLCBlbmRSZWdleFNvdXJjZSkge1xuICAgIGlmICghdGhpcy5fY2FjaGVkQ29tcGlsZWRXaGlsZVBhdHRlcm5zKSB7XG4gICAgICB0aGlzLl9jYWNoZWRDb21waWxlZFdoaWxlUGF0dGVybnMgPSBuZXcgUmVnRXhwU291cmNlTGlzdCgpO1xuICAgICAgdGhpcy5fY2FjaGVkQ29tcGlsZWRXaGlsZVBhdHRlcm5zLnB1c2godGhpcy5fd2hpbGUuaGFzQmFja1JlZmVyZW5jZXMgPyB0aGlzLl93aGlsZS5jbG9uZSgpIDogdGhpcy5fd2hpbGUpO1xuICAgIH1cbiAgICBpZiAodGhpcy5fd2hpbGUuaGFzQmFja1JlZmVyZW5jZXMpIHtcbiAgICAgIHRoaXMuX2NhY2hlZENvbXBpbGVkV2hpbGVQYXR0ZXJucy5zZXRTb3VyY2UoMCwgZW5kUmVnZXhTb3VyY2UgPyBlbmRSZWdleFNvdXJjZSA6IFwiXFx1RkZGRlwiKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2NhY2hlZENvbXBpbGVkV2hpbGVQYXR0ZXJucztcbiAgfVxufTtcbnZhciBSdWxlRmFjdG9yeSA9IGNsYXNzIF9SdWxlRmFjdG9yeSB7XG4gIHN0YXRpYyBjcmVhdGVDYXB0dXJlUnVsZShoZWxwZXIsICRsb2NhdGlvbiwgbmFtZSwgY29udGVudE5hbWUsIHJldG9rZW5pemVDYXB0dXJlZFdpdGhSdWxlSWQpIHtcbiAgICByZXR1cm4gaGVscGVyLnJlZ2lzdGVyUnVsZSgoaWQpID0+IHtcbiAgICAgIHJldHVybiBuZXcgQ2FwdHVyZVJ1bGUoJGxvY2F0aW9uLCBpZCwgbmFtZSwgY29udGVudE5hbWUsIHJldG9rZW5pemVDYXB0dXJlZFdpdGhSdWxlSWQpO1xuICAgIH0pO1xuICB9XG4gIHN0YXRpYyBnZXRDb21waWxlZFJ1bGVJZChkZXNjLCBoZWxwZXIsIHJlcG9zaXRvcnkpIHtcbiAgICBpZiAoIWRlc2MuaWQpIHtcbiAgICAgIGhlbHBlci5yZWdpc3RlclJ1bGUoKGlkKSA9PiB7XG4gICAgICAgIGRlc2MuaWQgPSBpZDtcbiAgICAgICAgaWYgKGRlc2MubWF0Y2gpIHtcbiAgICAgICAgICByZXR1cm4gbmV3IE1hdGNoUnVsZShcbiAgICAgICAgICAgIGRlc2MuJHZzY29kZVRleHRtYXRlTG9jYXRpb24sXG4gICAgICAgICAgICBkZXNjLmlkLFxuICAgICAgICAgICAgZGVzYy5uYW1lLFxuICAgICAgICAgICAgZGVzYy5tYXRjaCxcbiAgICAgICAgICAgIF9SdWxlRmFjdG9yeS5fY29tcGlsZUNhcHR1cmVzKGRlc2MuY2FwdHVyZXMsIGhlbHBlciwgcmVwb3NpdG9yeSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgZGVzYy5iZWdpbiA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIGlmIChkZXNjLnJlcG9zaXRvcnkpIHtcbiAgICAgICAgICAgIHJlcG9zaXRvcnkgPSBtZXJnZU9iamVjdHMoe30sIHJlcG9zaXRvcnksIGRlc2MucmVwb3NpdG9yeSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGxldCBwYXR0ZXJucyA9IGRlc2MucGF0dGVybnM7XG4gICAgICAgICAgaWYgKHR5cGVvZiBwYXR0ZXJucyA9PT0gXCJ1bmRlZmluZWRcIiAmJiBkZXNjLmluY2x1ZGUpIHtcbiAgICAgICAgICAgIHBhdHRlcm5zID0gW3sgaW5jbHVkZTogZGVzYy5pbmNsdWRlIH1dO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbmV3IEluY2x1ZGVPbmx5UnVsZShcbiAgICAgICAgICAgIGRlc2MuJHZzY29kZVRleHRtYXRlTG9jYXRpb24sXG4gICAgICAgICAgICBkZXNjLmlkLFxuICAgICAgICAgICAgZGVzYy5uYW1lLFxuICAgICAgICAgICAgZGVzYy5jb250ZW50TmFtZSxcbiAgICAgICAgICAgIF9SdWxlRmFjdG9yeS5fY29tcGlsZVBhdHRlcm5zKHBhdHRlcm5zLCBoZWxwZXIsIHJlcG9zaXRvcnkpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVzYy53aGlsZSkge1xuICAgICAgICAgIHJldHVybiBuZXcgQmVnaW5XaGlsZVJ1bGUoXG4gICAgICAgICAgICBkZXNjLiR2c2NvZGVUZXh0bWF0ZUxvY2F0aW9uLFxuICAgICAgICAgICAgZGVzYy5pZCxcbiAgICAgICAgICAgIGRlc2MubmFtZSxcbiAgICAgICAgICAgIGRlc2MuY29udGVudE5hbWUsXG4gICAgICAgICAgICBkZXNjLmJlZ2luLFxuICAgICAgICAgICAgX1J1bGVGYWN0b3J5Ll9jb21waWxlQ2FwdHVyZXMoZGVzYy5iZWdpbkNhcHR1cmVzIHx8IGRlc2MuY2FwdHVyZXMsIGhlbHBlciwgcmVwb3NpdG9yeSksXG4gICAgICAgICAgICBkZXNjLndoaWxlLFxuICAgICAgICAgICAgX1J1bGVGYWN0b3J5Ll9jb21waWxlQ2FwdHVyZXMoZGVzYy53aGlsZUNhcHR1cmVzIHx8IGRlc2MuY2FwdHVyZXMsIGhlbHBlciwgcmVwb3NpdG9yeSksXG4gICAgICAgICAgICBfUnVsZUZhY3RvcnkuX2NvbXBpbGVQYXR0ZXJucyhkZXNjLnBhdHRlcm5zLCBoZWxwZXIsIHJlcG9zaXRvcnkpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IEJlZ2luRW5kUnVsZShcbiAgICAgICAgICBkZXNjLiR2c2NvZGVUZXh0bWF0ZUxvY2F0aW9uLFxuICAgICAgICAgIGRlc2MuaWQsXG4gICAgICAgICAgZGVzYy5uYW1lLFxuICAgICAgICAgIGRlc2MuY29udGVudE5hbWUsXG4gICAgICAgICAgZGVzYy5iZWdpbixcbiAgICAgICAgICBfUnVsZUZhY3RvcnkuX2NvbXBpbGVDYXB0dXJlcyhkZXNjLmJlZ2luQ2FwdHVyZXMgfHwgZGVzYy5jYXB0dXJlcywgaGVscGVyLCByZXBvc2l0b3J5KSxcbiAgICAgICAgICBkZXNjLmVuZCxcbiAgICAgICAgICBfUnVsZUZhY3RvcnkuX2NvbXBpbGVDYXB0dXJlcyhkZXNjLmVuZENhcHR1cmVzIHx8IGRlc2MuY2FwdHVyZXMsIGhlbHBlciwgcmVwb3NpdG9yeSksXG4gICAgICAgICAgZGVzYy5hcHBseUVuZFBhdHRlcm5MYXN0LFxuICAgICAgICAgIF9SdWxlRmFjdG9yeS5fY29tcGlsZVBhdHRlcm5zKGRlc2MucGF0dGVybnMsIGhlbHBlciwgcmVwb3NpdG9yeSlcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gZGVzYy5pZDtcbiAgfVxuICBzdGF0aWMgX2NvbXBpbGVDYXB0dXJlcyhjYXB0dXJlcywgaGVscGVyLCByZXBvc2l0b3J5KSB7XG4gICAgbGV0IHIgPSBbXTtcbiAgICBpZiAoY2FwdHVyZXMpIHtcbiAgICAgIGxldCBtYXhpbXVtQ2FwdHVyZUlkID0gMDtcbiAgICAgIGZvciAoY29uc3QgY2FwdHVyZUlkIGluIGNhcHR1cmVzKSB7XG4gICAgICAgIGlmIChjYXB0dXJlSWQgPT09IFwiJHZzY29kZVRleHRtYXRlTG9jYXRpb25cIikge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG51bWVyaWNDYXB0dXJlSWQgPSBwYXJzZUludChjYXB0dXJlSWQsIDEwKTtcbiAgICAgICAgaWYgKG51bWVyaWNDYXB0dXJlSWQgPiBtYXhpbXVtQ2FwdHVyZUlkKSB7XG4gICAgICAgICAgbWF4aW11bUNhcHR1cmVJZCA9IG51bWVyaWNDYXB0dXJlSWQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IG1heGltdW1DYXB0dXJlSWQ7IGkrKykge1xuICAgICAgICByW2ldID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGZvciAoY29uc3QgY2FwdHVyZUlkIGluIGNhcHR1cmVzKSB7XG4gICAgICAgIGlmIChjYXB0dXJlSWQgPT09IFwiJHZzY29kZVRleHRtYXRlTG9jYXRpb25cIikge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG51bWVyaWNDYXB0dXJlSWQgPSBwYXJzZUludChjYXB0dXJlSWQsIDEwKTtcbiAgICAgICAgbGV0IHJldG9rZW5pemVDYXB0dXJlZFdpdGhSdWxlSWQgPSAwO1xuICAgICAgICBpZiAoY2FwdHVyZXNbY2FwdHVyZUlkXS5wYXR0ZXJucykge1xuICAgICAgICAgIHJldG9rZW5pemVDYXB0dXJlZFdpdGhSdWxlSWQgPSBfUnVsZUZhY3RvcnkuZ2V0Q29tcGlsZWRSdWxlSWQoY2FwdHVyZXNbY2FwdHVyZUlkXSwgaGVscGVyLCByZXBvc2l0b3J5KTtcbiAgICAgICAgfVxuICAgICAgICByW251bWVyaWNDYXB0dXJlSWRdID0gX1J1bGVGYWN0b3J5LmNyZWF0ZUNhcHR1cmVSdWxlKGhlbHBlciwgY2FwdHVyZXNbY2FwdHVyZUlkXS4kdnNjb2RlVGV4dG1hdGVMb2NhdGlvbiwgY2FwdHVyZXNbY2FwdHVyZUlkXS5uYW1lLCBjYXB0dXJlc1tjYXB0dXJlSWRdLmNvbnRlbnROYW1lLCByZXRva2VuaXplQ2FwdHVyZWRXaXRoUnVsZUlkKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHI7XG4gIH1cbiAgc3RhdGljIF9jb21waWxlUGF0dGVybnMocGF0dGVybnMsIGhlbHBlciwgcmVwb3NpdG9yeSkge1xuICAgIGxldCByID0gW107XG4gICAgaWYgKHBhdHRlcm5zKSB7XG4gICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gcGF0dGVybnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgY29uc3QgcGF0dGVybiA9IHBhdHRlcm5zW2ldO1xuICAgICAgICBsZXQgcnVsZUlkID0gLTE7XG4gICAgICAgIGlmIChwYXR0ZXJuLmluY2x1ZGUpIHtcbiAgICAgICAgICBjb25zdCByZWZlcmVuY2UgPSBwYXJzZUluY2x1ZGUocGF0dGVybi5pbmNsdWRlKTtcbiAgICAgICAgICBzd2l0Y2ggKHJlZmVyZW5jZS5raW5kKSB7XG4gICAgICAgICAgICBjYXNlIDAgLyogQmFzZSAqLzpcbiAgICAgICAgICAgIGNhc2UgMSAvKiBTZWxmICovOlxuICAgICAgICAgICAgICBydWxlSWQgPSBfUnVsZUZhY3RvcnkuZ2V0Q29tcGlsZWRSdWxlSWQocmVwb3NpdG9yeVtwYXR0ZXJuLmluY2x1ZGVdLCBoZWxwZXIsIHJlcG9zaXRvcnkpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMiAvKiBSZWxhdGl2ZVJlZmVyZW5jZSAqLzpcbiAgICAgICAgICAgICAgbGV0IGxvY2FsSW5jbHVkZWRSdWxlID0gcmVwb3NpdG9yeVtyZWZlcmVuY2UucnVsZU5hbWVdO1xuICAgICAgICAgICAgICBpZiAobG9jYWxJbmNsdWRlZFJ1bGUpIHtcbiAgICAgICAgICAgICAgICBydWxlSWQgPSBfUnVsZUZhY3RvcnkuZ2V0Q29tcGlsZWRSdWxlSWQobG9jYWxJbmNsdWRlZFJ1bGUsIGhlbHBlciwgcmVwb3NpdG9yeSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDMgLyogVG9wTGV2ZWxSZWZlcmVuY2UgKi86XG4gICAgICAgICAgICBjYXNlIDQgLyogVG9wTGV2ZWxSZXBvc2l0b3J5UmVmZXJlbmNlICovOlxuICAgICAgICAgICAgICBjb25zdCBleHRlcm5hbEdyYW1tYXJOYW1lID0gcmVmZXJlbmNlLnNjb3BlTmFtZTtcbiAgICAgICAgICAgICAgY29uc3QgZXh0ZXJuYWxHcmFtbWFySW5jbHVkZSA9IHJlZmVyZW5jZS5raW5kID09PSA0IC8qIFRvcExldmVsUmVwb3NpdG9yeVJlZmVyZW5jZSAqLyA/IHJlZmVyZW5jZS5ydWxlTmFtZSA6IG51bGw7XG4gICAgICAgICAgICAgIGNvbnN0IGV4dGVybmFsR3JhbW1hciA9IGhlbHBlci5nZXRFeHRlcm5hbEdyYW1tYXIoZXh0ZXJuYWxHcmFtbWFyTmFtZSwgcmVwb3NpdG9yeSk7XG4gICAgICAgICAgICAgIGlmIChleHRlcm5hbEdyYW1tYXIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXh0ZXJuYWxHcmFtbWFySW5jbHVkZSkge1xuICAgICAgICAgICAgICAgICAgbGV0IGV4dGVybmFsSW5jbHVkZWRSdWxlID0gZXh0ZXJuYWxHcmFtbWFyLnJlcG9zaXRvcnlbZXh0ZXJuYWxHcmFtbWFySW5jbHVkZV07XG4gICAgICAgICAgICAgICAgICBpZiAoZXh0ZXJuYWxJbmNsdWRlZFJ1bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVsZUlkID0gX1J1bGVGYWN0b3J5LmdldENvbXBpbGVkUnVsZUlkKGV4dGVybmFsSW5jbHVkZWRSdWxlLCBoZWxwZXIsIGV4dGVybmFsR3JhbW1hci5yZXBvc2l0b3J5KTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHJ1bGVJZCA9IF9SdWxlRmFjdG9yeS5nZXRDb21waWxlZFJ1bGVJZChleHRlcm5hbEdyYW1tYXIucmVwb3NpdG9yeS4kc2VsZiwgaGVscGVyLCBleHRlcm5hbEdyYW1tYXIucmVwb3NpdG9yeSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBydWxlSWQgPSBfUnVsZUZhY3RvcnkuZ2V0Q29tcGlsZWRSdWxlSWQocGF0dGVybiwgaGVscGVyLCByZXBvc2l0b3J5KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocnVsZUlkICE9PSAtMSkge1xuICAgICAgICAgIGNvbnN0IHJ1bGUgPSBoZWxwZXIuZ2V0UnVsZShydWxlSWQpO1xuICAgICAgICAgIGxldCBza2lwUnVsZSA9IGZhbHNlO1xuICAgICAgICAgIGlmIChydWxlIGluc3RhbmNlb2YgSW5jbHVkZU9ubHlSdWxlIHx8IHJ1bGUgaW5zdGFuY2VvZiBCZWdpbkVuZFJ1bGUgfHwgcnVsZSBpbnN0YW5jZW9mIEJlZ2luV2hpbGVSdWxlKSB7XG4gICAgICAgICAgICBpZiAocnVsZS5oYXNNaXNzaW5nUGF0dGVybnMgJiYgcnVsZS5wYXR0ZXJucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgc2tpcFJ1bGUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoc2tpcFJ1bGUpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByLnB1c2gocnVsZUlkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgcGF0dGVybnM6IHIsXG4gICAgICBoYXNNaXNzaW5nUGF0dGVybnM6IChwYXR0ZXJucyA/IHBhdHRlcm5zLmxlbmd0aCA6IDApICE9PSByLmxlbmd0aFxuICAgIH07XG4gIH1cbn07XG52YXIgUmVnRXhwU291cmNlID0gY2xhc3MgX1JlZ0V4cFNvdXJjZSB7XG4gIHNvdXJjZTtcbiAgcnVsZUlkO1xuICBoYXNBbmNob3I7XG4gIGhhc0JhY2tSZWZlcmVuY2VzO1xuICBfYW5jaG9yQ2FjaGU7XG4gIGNvbnN0cnVjdG9yKHJlZ0V4cFNvdXJjZSwgcnVsZUlkKSB7XG4gICAgaWYgKHJlZ0V4cFNvdXJjZSAmJiB0eXBlb2YgcmVnRXhwU291cmNlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBjb25zdCBsZW4gPSByZWdFeHBTb3VyY2UubGVuZ3RoO1xuICAgICAgbGV0IGxhc3RQdXNoZWRQb3MgPSAwO1xuICAgICAgbGV0IG91dHB1dCA9IFtdO1xuICAgICAgbGV0IGhhc0FuY2hvciA9IGZhbHNlO1xuICAgICAgZm9yIChsZXQgcG9zID0gMDsgcG9zIDwgbGVuOyBwb3MrKykge1xuICAgICAgICBjb25zdCBjaCA9IHJlZ0V4cFNvdXJjZS5jaGFyQXQocG9zKTtcbiAgICAgICAgaWYgKGNoID09PSBcIlxcXFxcIikge1xuICAgICAgICAgIGlmIChwb3MgKyAxIDwgbGVuKSB7XG4gICAgICAgICAgICBjb25zdCBuZXh0Q2ggPSByZWdFeHBTb3VyY2UuY2hhckF0KHBvcyArIDEpO1xuICAgICAgICAgICAgaWYgKG5leHRDaCA9PT0gXCJ6XCIpIHtcbiAgICAgICAgICAgICAgb3V0cHV0LnB1c2gocmVnRXhwU291cmNlLnN1YnN0cmluZyhsYXN0UHVzaGVkUG9zLCBwb3MpKTtcbiAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCIkKD8hXFxcXG4pKD88IVxcXFxuKVwiKTtcbiAgICAgICAgICAgICAgbGFzdFB1c2hlZFBvcyA9IHBvcyArIDI7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5leHRDaCA9PT0gXCJBXCIgfHwgbmV4dENoID09PSBcIkdcIikge1xuICAgICAgICAgICAgICBoYXNBbmNob3IgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcG9zKys7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmhhc0FuY2hvciA9IGhhc0FuY2hvcjtcbiAgICAgIGlmIChsYXN0UHVzaGVkUG9zID09PSAwKSB7XG4gICAgICAgIHRoaXMuc291cmNlID0gcmVnRXhwU291cmNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3V0cHV0LnB1c2gocmVnRXhwU291cmNlLnN1YnN0cmluZyhsYXN0UHVzaGVkUG9zLCBsZW4pKTtcbiAgICAgICAgdGhpcy5zb3VyY2UgPSBvdXRwdXQuam9pbihcIlwiKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5oYXNBbmNob3IgPSBmYWxzZTtcbiAgICAgIHRoaXMuc291cmNlID0gcmVnRXhwU291cmNlO1xuICAgIH1cbiAgICBpZiAodGhpcy5oYXNBbmNob3IpIHtcbiAgICAgIHRoaXMuX2FuY2hvckNhY2hlID0gdGhpcy5fYnVpbGRBbmNob3JDYWNoZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9hbmNob3JDYWNoZSA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMucnVsZUlkID0gcnVsZUlkO1xuICAgIGlmICh0eXBlb2YgdGhpcy5zb3VyY2UgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHRoaXMuaGFzQmFja1JlZmVyZW5jZXMgPSBIQVNfQkFDS19SRUZFUkVOQ0VTLnRlc3QodGhpcy5zb3VyY2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmhhc0JhY2tSZWZlcmVuY2VzID0gZmFsc2U7XG4gICAgfVxuICB9XG4gIGNsb25lKCkge1xuICAgIHJldHVybiBuZXcgX1JlZ0V4cFNvdXJjZSh0aGlzLnNvdXJjZSwgdGhpcy5ydWxlSWQpO1xuICB9XG4gIHNldFNvdXJjZShuZXdTb3VyY2UpIHtcbiAgICBpZiAodGhpcy5zb3VyY2UgPT09IG5ld1NvdXJjZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnNvdXJjZSA9IG5ld1NvdXJjZTtcbiAgICBpZiAodGhpcy5oYXNBbmNob3IpIHtcbiAgICAgIHRoaXMuX2FuY2hvckNhY2hlID0gdGhpcy5fYnVpbGRBbmNob3JDYWNoZSgpO1xuICAgIH1cbiAgfVxuICByZXNvbHZlQmFja1JlZmVyZW5jZXMobGluZVRleHQsIGNhcHR1cmVJbmRpY2VzKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnNvdXJjZSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhpcyBtZXRob2Qgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIGlmIHRoZSBzb3VyY2UgaXMgYSBzdHJpbmdcIik7XG4gICAgfVxuICAgIGxldCBjYXB0dXJlZFZhbHVlcyA9IGNhcHR1cmVJbmRpY2VzLm1hcCgoY2FwdHVyZSkgPT4ge1xuICAgICAgcmV0dXJuIGxpbmVUZXh0LnN1YnN0cmluZyhjYXB0dXJlLnN0YXJ0LCBjYXB0dXJlLmVuZCk7XG4gICAgfSk7XG4gICAgQkFDS19SRUZFUkVOQ0lOR19FTkQubGFzdEluZGV4ID0gMDtcbiAgICByZXR1cm4gdGhpcy5zb3VyY2UucmVwbGFjZShCQUNLX1JFRkVSRU5DSU5HX0VORCwgKG1hdGNoLCBnMSkgPT4ge1xuICAgICAgcmV0dXJuIGVzY2FwZVJlZ0V4cENoYXJhY3RlcnMoY2FwdHVyZWRWYWx1ZXNbcGFyc2VJbnQoZzEsIDEwKV0gfHwgXCJcIik7XG4gICAgfSk7XG4gIH1cbiAgX2J1aWxkQW5jaG9yQ2FjaGUoKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnNvdXJjZSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhpcyBtZXRob2Qgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIGlmIHRoZSBzb3VyY2UgaXMgYSBzdHJpbmdcIik7XG4gICAgfVxuICAgIGxldCBBMF9HMF9yZXN1bHQgPSBbXTtcbiAgICBsZXQgQTBfRzFfcmVzdWx0ID0gW107XG4gICAgbGV0IEExX0cwX3Jlc3VsdCA9IFtdO1xuICAgIGxldCBBMV9HMV9yZXN1bHQgPSBbXTtcbiAgICBsZXQgcG9zLCBsZW4sIGNoLCBuZXh0Q2g7XG4gICAgZm9yIChwb3MgPSAwLCBsZW4gPSB0aGlzLnNvdXJjZS5sZW5ndGg7IHBvcyA8IGxlbjsgcG9zKyspIHtcbiAgICAgIGNoID0gdGhpcy5zb3VyY2UuY2hhckF0KHBvcyk7XG4gICAgICBBMF9HMF9yZXN1bHRbcG9zXSA9IGNoO1xuICAgICAgQTBfRzFfcmVzdWx0W3Bvc10gPSBjaDtcbiAgICAgIEExX0cwX3Jlc3VsdFtwb3NdID0gY2g7XG4gICAgICBBMV9HMV9yZXN1bHRbcG9zXSA9IGNoO1xuICAgICAgaWYgKGNoID09PSBcIlxcXFxcIikge1xuICAgICAgICBpZiAocG9zICsgMSA8IGxlbikge1xuICAgICAgICAgIG5leHRDaCA9IHRoaXMuc291cmNlLmNoYXJBdChwb3MgKyAxKTtcbiAgICAgICAgICBpZiAobmV4dENoID09PSBcIkFcIikge1xuICAgICAgICAgICAgQTBfRzBfcmVzdWx0W3BvcyArIDFdID0gXCJcXHVGRkZGXCI7XG4gICAgICAgICAgICBBMF9HMV9yZXN1bHRbcG9zICsgMV0gPSBcIlxcdUZGRkZcIjtcbiAgICAgICAgICAgIEExX0cwX3Jlc3VsdFtwb3MgKyAxXSA9IFwiQVwiO1xuICAgICAgICAgICAgQTFfRzFfcmVzdWx0W3BvcyArIDFdID0gXCJBXCI7XG4gICAgICAgICAgfSBlbHNlIGlmIChuZXh0Q2ggPT09IFwiR1wiKSB7XG4gICAgICAgICAgICBBMF9HMF9yZXN1bHRbcG9zICsgMV0gPSBcIlxcdUZGRkZcIjtcbiAgICAgICAgICAgIEEwX0cxX3Jlc3VsdFtwb3MgKyAxXSA9IFwiR1wiO1xuICAgICAgICAgICAgQTFfRzBfcmVzdWx0W3BvcyArIDFdID0gXCJcXHVGRkZGXCI7XG4gICAgICAgICAgICBBMV9HMV9yZXN1bHRbcG9zICsgMV0gPSBcIkdcIjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgQTBfRzBfcmVzdWx0W3BvcyArIDFdID0gbmV4dENoO1xuICAgICAgICAgICAgQTBfRzFfcmVzdWx0W3BvcyArIDFdID0gbmV4dENoO1xuICAgICAgICAgICAgQTFfRzBfcmVzdWx0W3BvcyArIDFdID0gbmV4dENoO1xuICAgICAgICAgICAgQTFfRzFfcmVzdWx0W3BvcyArIDFdID0gbmV4dENoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwb3MrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgQTBfRzA6IEEwX0cwX3Jlc3VsdC5qb2luKFwiXCIpLFxuICAgICAgQTBfRzE6IEEwX0cxX3Jlc3VsdC5qb2luKFwiXCIpLFxuICAgICAgQTFfRzA6IEExX0cwX3Jlc3VsdC5qb2luKFwiXCIpLFxuICAgICAgQTFfRzE6IEExX0cxX3Jlc3VsdC5qb2luKFwiXCIpXG4gICAgfTtcbiAgfVxuICByZXNvbHZlQW5jaG9ycyhhbGxvd0EsIGFsbG93Rykge1xuICAgIGlmICghdGhpcy5oYXNBbmNob3IgfHwgIXRoaXMuX2FuY2hvckNhY2hlIHx8IHR5cGVvZiB0aGlzLnNvdXJjZSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgcmV0dXJuIHRoaXMuc291cmNlO1xuICAgIH1cbiAgICBpZiAoYWxsb3dBKSB7XG4gICAgICBpZiAoYWxsb3dHKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hbmNob3JDYWNoZS5BMV9HMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hbmNob3JDYWNoZS5BMV9HMDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGFsbG93Rykge1xuICAgICAgICByZXR1cm4gdGhpcy5fYW5jaG9yQ2FjaGUuQTBfRzE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5fYW5jaG9yQ2FjaGUuQTBfRzA7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xudmFyIFJlZ0V4cFNvdXJjZUxpc3QgPSBjbGFzcyB7XG4gIF9pdGVtcztcbiAgX2hhc0FuY2hvcnM7XG4gIF9jYWNoZWQ7XG4gIF9hbmNob3JDYWNoZTtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5faXRlbXMgPSBbXTtcbiAgICB0aGlzLl9oYXNBbmNob3JzID0gZmFsc2U7XG4gICAgdGhpcy5fY2FjaGVkID0gbnVsbDtcbiAgICB0aGlzLl9hbmNob3JDYWNoZSA9IHtcbiAgICAgIEEwX0cwOiBudWxsLFxuICAgICAgQTBfRzE6IG51bGwsXG4gICAgICBBMV9HMDogbnVsbCxcbiAgICAgIEExX0cxOiBudWxsXG4gICAgfTtcbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2VDYWNoZXMoKTtcbiAgfVxuICBfZGlzcG9zZUNhY2hlcygpIHtcbiAgICBpZiAodGhpcy5fY2FjaGVkKSB7XG4gICAgICB0aGlzLl9jYWNoZWQuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fY2FjaGVkID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2FuY2hvckNhY2hlLkEwX0cwKSB7XG4gICAgICB0aGlzLl9hbmNob3JDYWNoZS5BMF9HMC5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9hbmNob3JDYWNoZS5BMF9HMCA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLl9hbmNob3JDYWNoZS5BMF9HMSkge1xuICAgICAgdGhpcy5fYW5jaG9yQ2FjaGUuQTBfRzEuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fYW5jaG9yQ2FjaGUuQTBfRzEgPSBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy5fYW5jaG9yQ2FjaGUuQTFfRzApIHtcbiAgICAgIHRoaXMuX2FuY2hvckNhY2hlLkExX0cwLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX2FuY2hvckNhY2hlLkExX0cwID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2FuY2hvckNhY2hlLkExX0cxKSB7XG4gICAgICB0aGlzLl9hbmNob3JDYWNoZS5BMV9HMS5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9hbmNob3JDYWNoZS5BMV9HMSA9IG51bGw7XG4gICAgfVxuICB9XG4gIHB1c2goaXRlbSkge1xuICAgIHRoaXMuX2l0ZW1zLnB1c2goaXRlbSk7XG4gICAgdGhpcy5faGFzQW5jaG9ycyA9IHRoaXMuX2hhc0FuY2hvcnMgfHwgaXRlbS5oYXNBbmNob3I7XG4gIH1cbiAgdW5zaGlmdChpdGVtKSB7XG4gICAgdGhpcy5faXRlbXMudW5zaGlmdChpdGVtKTtcbiAgICB0aGlzLl9oYXNBbmNob3JzID0gdGhpcy5faGFzQW5jaG9ycyB8fCBpdGVtLmhhc0FuY2hvcjtcbiAgfVxuICBsZW5ndGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2l0ZW1zLmxlbmd0aDtcbiAgfVxuICBzZXRTb3VyY2UoaW5kZXgsIG5ld1NvdXJjZSkge1xuICAgIGlmICh0aGlzLl9pdGVtc1tpbmRleF0uc291cmNlICE9PSBuZXdTb3VyY2UpIHtcbiAgICAgIHRoaXMuX2Rpc3Bvc2VDYWNoZXMoKTtcbiAgICAgIHRoaXMuX2l0ZW1zW2luZGV4XS5zZXRTb3VyY2UobmV3U291cmNlKTtcbiAgICB9XG4gIH1cbiAgY29tcGlsZShvbmlnTGliKSB7XG4gICAgaWYgKCF0aGlzLl9jYWNoZWQpIHtcbiAgICAgIGxldCByZWdFeHBzID0gdGhpcy5faXRlbXMubWFwKChlKSA9PiBlLnNvdXJjZSk7XG4gICAgICB0aGlzLl9jYWNoZWQgPSBuZXcgQ29tcGlsZWRSdWxlKG9uaWdMaWIsIHJlZ0V4cHMsIHRoaXMuX2l0ZW1zLm1hcCgoZSkgPT4gZS5ydWxlSWQpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2NhY2hlZDtcbiAgfVxuICBjb21waWxlQUcob25pZ0xpYiwgYWxsb3dBLCBhbGxvd0cpIHtcbiAgICBpZiAoIXRoaXMuX2hhc0FuY2hvcnMpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbXBpbGUob25pZ0xpYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChhbGxvd0EpIHtcbiAgICAgICAgaWYgKGFsbG93Rykge1xuICAgICAgICAgIGlmICghdGhpcy5fYW5jaG9yQ2FjaGUuQTFfRzEpIHtcbiAgICAgICAgICAgIHRoaXMuX2FuY2hvckNhY2hlLkExX0cxID0gdGhpcy5fcmVzb2x2ZUFuY2hvcnMob25pZ0xpYiwgYWxsb3dBLCBhbGxvd0cpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhpcy5fYW5jaG9yQ2FjaGUuQTFfRzE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKCF0aGlzLl9hbmNob3JDYWNoZS5BMV9HMCkge1xuICAgICAgICAgICAgdGhpcy5fYW5jaG9yQ2FjaGUuQTFfRzAgPSB0aGlzLl9yZXNvbHZlQW5jaG9ycyhvbmlnTGliLCBhbGxvd0EsIGFsbG93Ryk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aGlzLl9hbmNob3JDYWNoZS5BMV9HMDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGFsbG93Rykge1xuICAgICAgICAgIGlmICghdGhpcy5fYW5jaG9yQ2FjaGUuQTBfRzEpIHtcbiAgICAgICAgICAgIHRoaXMuX2FuY2hvckNhY2hlLkEwX0cxID0gdGhpcy5fcmVzb2x2ZUFuY2hvcnMob25pZ0xpYiwgYWxsb3dBLCBhbGxvd0cpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhpcy5fYW5jaG9yQ2FjaGUuQTBfRzE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKCF0aGlzLl9hbmNob3JDYWNoZS5BMF9HMCkge1xuICAgICAgICAgICAgdGhpcy5fYW5jaG9yQ2FjaGUuQTBfRzAgPSB0aGlzLl9yZXNvbHZlQW5jaG9ycyhvbmlnTGliLCBhbGxvd0EsIGFsbG93Ryk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aGlzLl9hbmNob3JDYWNoZS5BMF9HMDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBfcmVzb2x2ZUFuY2hvcnMob25pZ0xpYiwgYWxsb3dBLCBhbGxvd0cpIHtcbiAgICBsZXQgcmVnRXhwcyA9IHRoaXMuX2l0ZW1zLm1hcCgoZSkgPT4gZS5yZXNvbHZlQW5jaG9ycyhhbGxvd0EsIGFsbG93RykpO1xuICAgIHJldHVybiBuZXcgQ29tcGlsZWRSdWxlKG9uaWdMaWIsIHJlZ0V4cHMsIHRoaXMuX2l0ZW1zLm1hcCgoZSkgPT4gZS5ydWxlSWQpKTtcbiAgfVxufTtcbnZhciBDb21waWxlZFJ1bGUgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKG9uaWdMaWIsIHJlZ0V4cHMsIHJ1bGVzKSB7XG4gICAgdGhpcy5yZWdFeHBzID0gcmVnRXhwcztcbiAgICB0aGlzLnJ1bGVzID0gcnVsZXM7XG4gICAgdGhpcy5zY2FubmVyID0gb25pZ0xpYi5jcmVhdGVPbmlnU2Nhbm5lcihyZWdFeHBzKTtcbiAgfVxuICBzY2FubmVyO1xuICBkaXNwb3NlKCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5zY2FubmVyLmRpc3Bvc2UgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdGhpcy5zY2FubmVyLmRpc3Bvc2UoKTtcbiAgICB9XG4gIH1cbiAgdG9TdHJpbmcoKSB7XG4gICAgY29uc3QgciA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSB0aGlzLnJ1bGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICByLnB1c2goXCIgICAtIFwiICsgdGhpcy5ydWxlc1tpXSArIFwiOiBcIiArIHRoaXMucmVnRXhwc1tpXSk7XG4gICAgfVxuICAgIHJldHVybiByLmpvaW4oXCJcXG5cIik7XG4gIH1cbiAgZmluZE5leHRNYXRjaFN5bmMoc3RyaW5nLCBzdGFydFBvc2l0aW9uLCBvcHRpb25zKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5zY2FubmVyLmZpbmROZXh0TWF0Y2hTeW5jKHN0cmluZywgc3RhcnRQb3NpdGlvbiwgb3B0aW9ucyk7XG4gICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgcnVsZUlkOiB0aGlzLnJ1bGVzW3Jlc3VsdC5pbmRleF0sXG4gICAgICBjYXB0dXJlSW5kaWNlczogcmVzdWx0LmNhcHR1cmVJbmRpY2VzXG4gICAgfTtcbiAgfVxufTtcblxuLy8gc3JjL2dyYW1tYXIvYmFzaWNTY29wZXNBdHRyaWJ1dGVQcm92aWRlci50c1xudmFyIEJhc2ljU2NvcGVBdHRyaWJ1dGVzID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihsYW5ndWFnZUlkLCB0b2tlblR5cGUpIHtcbiAgICB0aGlzLmxhbmd1YWdlSWQgPSBsYW5ndWFnZUlkO1xuICAgIHRoaXMudG9rZW5UeXBlID0gdG9rZW5UeXBlO1xuICB9XG59O1xudmFyIEJhc2ljU2NvcGVBdHRyaWJ1dGVzUHJvdmlkZXIgPSBjbGFzcyBfQmFzaWNTY29wZUF0dHJpYnV0ZXNQcm92aWRlciB7XG4gIF9kZWZhdWx0QXR0cmlidXRlcztcbiAgX2VtYmVkZGVkTGFuZ3VhZ2VzTWF0Y2hlcjtcbiAgY29uc3RydWN0b3IoaW5pdGlhbExhbmd1YWdlSWQsIGVtYmVkZGVkTGFuZ3VhZ2VzKSB7XG4gICAgdGhpcy5fZGVmYXVsdEF0dHJpYnV0ZXMgPSBuZXcgQmFzaWNTY29wZUF0dHJpYnV0ZXMoaW5pdGlhbExhbmd1YWdlSWQsIDggLyogTm90U2V0ICovKTtcbiAgICB0aGlzLl9lbWJlZGRlZExhbmd1YWdlc01hdGNoZXIgPSBuZXcgU2NvcGVNYXRjaGVyKE9iamVjdC5lbnRyaWVzKGVtYmVkZGVkTGFuZ3VhZ2VzIHx8IHt9KSk7XG4gIH1cbiAgZ2V0RGVmYXVsdEF0dHJpYnV0ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RlZmF1bHRBdHRyaWJ1dGVzO1xuICB9XG4gIGdldEJhc2ljU2NvcGVBdHRyaWJ1dGVzKHNjb3BlTmFtZSkge1xuICAgIGlmIChzY29wZU5hbWUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBfQmFzaWNTY29wZUF0dHJpYnV0ZXNQcm92aWRlci5fTlVMTF9TQ09QRV9NRVRBREFUQTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2dldEJhc2ljU2NvcGVBdHRyaWJ1dGVzLmdldChzY29wZU5hbWUpO1xuICB9XG4gIHN0YXRpYyBfTlVMTF9TQ09QRV9NRVRBREFUQSA9IG5ldyBCYXNpY1Njb3BlQXR0cmlidXRlcygwLCAwKTtcbiAgX2dldEJhc2ljU2NvcGVBdHRyaWJ1dGVzID0gbmV3IENhY2hlZEZuKChzY29wZU5hbWUpID0+IHtcbiAgICBjb25zdCBsYW5ndWFnZUlkID0gdGhpcy5fc2NvcGVUb0xhbmd1YWdlKHNjb3BlTmFtZSk7XG4gICAgY29uc3Qgc3RhbmRhcmRUb2tlblR5cGUgPSB0aGlzLl90b1N0YW5kYXJkVG9rZW5UeXBlKHNjb3BlTmFtZSk7XG4gICAgcmV0dXJuIG5ldyBCYXNpY1Njb3BlQXR0cmlidXRlcyhsYW5ndWFnZUlkLCBzdGFuZGFyZFRva2VuVHlwZSk7XG4gIH0pO1xuICAvKipcbiAgICogR2l2ZW4gYSBwcm9kdWNlZCBUTSBzY29wZSwgcmV0dXJuIHRoZSBsYW5ndWFnZSB0aGF0IHRva2VuIGRlc2NyaWJlcyBvciBudWxsIGlmIHVua25vd24uXG4gICAqIGUuZy4gc291cmNlLmh0bWwgPT4gaHRtbCwgc291cmNlLmNzcy5lbWJlZGRlZC5odG1sID0+IGNzcywgcHVuY3R1YXRpb24uZGVmaW5pdGlvbi50YWcuaHRtbCA9PiBudWxsXG4gICAqL1xuICBfc2NvcGVUb0xhbmd1YWdlKHNjb3BlKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtYmVkZGVkTGFuZ3VhZ2VzTWF0Y2hlci5tYXRjaChzY29wZSkgfHwgMDtcbiAgfVxuICBfdG9TdGFuZGFyZFRva2VuVHlwZShzY29wZU5hbWUpIHtcbiAgICBjb25zdCBtID0gc2NvcGVOYW1lLm1hdGNoKF9CYXNpY1Njb3BlQXR0cmlidXRlc1Byb3ZpZGVyLlNUQU5EQVJEX1RPS0VOX1RZUEVfUkVHRVhQKTtcbiAgICBpZiAoIW0pIHtcbiAgICAgIHJldHVybiA4IC8qIE5vdFNldCAqLztcbiAgICB9XG4gICAgc3dpdGNoIChtWzFdKSB7XG4gICAgICBjYXNlIFwiY29tbWVudFwiOlxuICAgICAgICByZXR1cm4gMSAvKiBDb21tZW50ICovO1xuICAgICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgICByZXR1cm4gMiAvKiBTdHJpbmcgKi87XG4gICAgICBjYXNlIFwicmVnZXhcIjpcbiAgICAgICAgcmV0dXJuIDMgLyogUmVnRXggKi87XG4gICAgICBjYXNlIFwibWV0YS5lbWJlZGRlZFwiOlxuICAgICAgICByZXR1cm4gMCAvKiBPdGhlciAqLztcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBtYXRjaCBmb3Igc3RhbmRhcmQgdG9rZW4gdHlwZSFcIik7XG4gIH1cbiAgc3RhdGljIFNUQU5EQVJEX1RPS0VOX1RZUEVfUkVHRVhQID0gL1xcYihjb21tZW50fHN0cmluZ3xyZWdleHxtZXRhXFwuZW1iZWRkZWQpXFxiLztcbn07XG52YXIgU2NvcGVNYXRjaGVyID0gY2xhc3Mge1xuICB2YWx1ZXM7XG4gIHNjb3Blc1JlZ0V4cDtcbiAgY29uc3RydWN0b3IodmFsdWVzKSB7XG4gICAgaWYgKHZhbHVlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMudmFsdWVzID0gbnVsbDtcbiAgICAgIHRoaXMuc2NvcGVzUmVnRXhwID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy52YWx1ZXMgPSBuZXcgTWFwKHZhbHVlcyk7XG4gICAgICBjb25zdCBlc2NhcGVkU2NvcGVzID0gdmFsdWVzLm1hcChcbiAgICAgICAgKFtzY29wZU5hbWUsIHZhbHVlXSkgPT4gZXNjYXBlUmVnRXhwQ2hhcmFjdGVycyhzY29wZU5hbWUpXG4gICAgICApO1xuICAgICAgZXNjYXBlZFNjb3Blcy5zb3J0KCk7XG4gICAgICBlc2NhcGVkU2NvcGVzLnJldmVyc2UoKTtcbiAgICAgIHRoaXMuc2NvcGVzUmVnRXhwID0gbmV3IFJlZ0V4cChcbiAgICAgICAgYF4oKCR7ZXNjYXBlZFNjb3Blcy5qb2luKFwiKXwoXCIpfSkpKCR8XFxcXC4pYCxcbiAgICAgICAgXCJcIlxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgbWF0Y2goc2NvcGUpIHtcbiAgICBpZiAoIXRoaXMuc2NvcGVzUmVnRXhwKSB7XG4gICAgICByZXR1cm4gdm9pZCAwO1xuICAgIH1cbiAgICBjb25zdCBtID0gc2NvcGUubWF0Y2godGhpcy5zY29wZXNSZWdFeHApO1xuICAgIGlmICghbSkge1xuICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudmFsdWVzLmdldChtWzFdKTtcbiAgfVxufTtcblxuLy8gc3JjL2RlYnVnLnRzXG52YXIgRGVidWdGbGFncyA9IHtcbiAgSW5EZWJ1Z01vZGU6IHR5cGVvZiBwcm9jZXNzICE9PSBcInVuZGVmaW5lZFwiICYmICEhcHJvY2Vzcy5lbnZbXCJWU0NPREVfVEVYVE1BVEVfREVCVUdcIl1cbn07XG52YXIgVXNlT25pZ3VydW1hRmluZE9wdGlvbnMgPSBmYWxzZTtcblxuLy8gc3JjL2dyYW1tYXIvdG9rZW5pemVTdHJpbmcudHNcbnZhciBUb2tlbml6ZVN0cmluZ1Jlc3VsdCA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3Ioc3RhY2ssIHN0b3BwZWRFYXJseSkge1xuICAgIHRoaXMuc3RhY2sgPSBzdGFjaztcbiAgICB0aGlzLnN0b3BwZWRFYXJseSA9IHN0b3BwZWRFYXJseTtcbiAgfVxufTtcbmZ1bmN0aW9uIF90b2tlbml6ZVN0cmluZyhncmFtbWFyLCBsaW5lVGV4dCwgaXNGaXJzdExpbmUsIGxpbmVQb3MsIHN0YWNrLCBsaW5lVG9rZW5zLCBjaGVja1doaWxlQ29uZGl0aW9ucywgdGltZUxpbWl0KSB7XG4gIGNvbnN0IGxpbmVMZW5ndGggPSBsaW5lVGV4dC5jb250ZW50Lmxlbmd0aDtcbiAgbGV0IFNUT1AgPSBmYWxzZTtcbiAgbGV0IGFuY2hvclBvc2l0aW9uID0gLTE7XG4gIGlmIChjaGVja1doaWxlQ29uZGl0aW9ucykge1xuICAgIGNvbnN0IHdoaWxlQ2hlY2tSZXN1bHQgPSBfY2hlY2tXaGlsZUNvbmRpdGlvbnMoXG4gICAgICBncmFtbWFyLFxuICAgICAgbGluZVRleHQsXG4gICAgICBpc0ZpcnN0TGluZSxcbiAgICAgIGxpbmVQb3MsXG4gICAgICBzdGFjayxcbiAgICAgIGxpbmVUb2tlbnNcbiAgICApO1xuICAgIHN0YWNrID0gd2hpbGVDaGVja1Jlc3VsdC5zdGFjaztcbiAgICBsaW5lUG9zID0gd2hpbGVDaGVja1Jlc3VsdC5saW5lUG9zO1xuICAgIGlzRmlyc3RMaW5lID0gd2hpbGVDaGVja1Jlc3VsdC5pc0ZpcnN0TGluZTtcbiAgICBhbmNob3JQb3NpdGlvbiA9IHdoaWxlQ2hlY2tSZXN1bHQuYW5jaG9yUG9zaXRpb247XG4gIH1cbiAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgd2hpbGUgKCFTVE9QKSB7XG4gICAgaWYgKHRpbWVMaW1pdCAhPT0gMCkge1xuICAgICAgY29uc3QgZWxhcHNlZFRpbWUgPSBEYXRlLm5vdygpIC0gc3RhcnRUaW1lO1xuICAgICAgaWYgKGVsYXBzZWRUaW1lID4gdGltZUxpbWl0KSB7XG4gICAgICAgIHJldHVybiBuZXcgVG9rZW5pemVTdHJpbmdSZXN1bHQoc3RhY2ssIHRydWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBzY2FuTmV4dCgpO1xuICB9XG4gIHJldHVybiBuZXcgVG9rZW5pemVTdHJpbmdSZXN1bHQoc3RhY2ssIGZhbHNlKTtcbiAgZnVuY3Rpb24gc2Nhbk5leHQoKSB7XG4gICAgaWYgKGZhbHNlKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIlwiKTtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICBgQEBzY2FuTmV4dCAke2xpbmVQb3N9OiB8JHtsaW5lVGV4dC5jb250ZW50LnN1YnN0cihsaW5lUG9zKS5yZXBsYWNlKC9cXG4kLywgXCJcXFxcblwiKX18YFxuICAgICAgKTtcbiAgICB9XG4gICAgY29uc3QgciA9IG1hdGNoUnVsZU9ySW5qZWN0aW9ucyhcbiAgICAgIGdyYW1tYXIsXG4gICAgICBsaW5lVGV4dCxcbiAgICAgIGlzRmlyc3RMaW5lLFxuICAgICAgbGluZVBvcyxcbiAgICAgIHN0YWNrLFxuICAgICAgYW5jaG9yUG9zaXRpb25cbiAgICApO1xuICAgIGlmICghcikge1xuICAgICAgbGluZVRva2Vucy5wcm9kdWNlKHN0YWNrLCBsaW5lTGVuZ3RoKTtcbiAgICAgIFNUT1AgPSB0cnVlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBjYXB0dXJlSW5kaWNlcyA9IHIuY2FwdHVyZUluZGljZXM7XG4gICAgY29uc3QgbWF0Y2hlZFJ1bGVJZCA9IHIubWF0Y2hlZFJ1bGVJZDtcbiAgICBjb25zdCBoYXNBZHZhbmNlZCA9IGNhcHR1cmVJbmRpY2VzICYmIGNhcHR1cmVJbmRpY2VzLmxlbmd0aCA+IDAgPyBjYXB0dXJlSW5kaWNlc1swXS5lbmQgPiBsaW5lUG9zIDogZmFsc2U7XG4gICAgaWYgKG1hdGNoZWRSdWxlSWQgPT09IGVuZFJ1bGVJZCkge1xuICAgICAgY29uc3QgcG9wcGVkUnVsZSA9IHN0YWNrLmdldFJ1bGUoZ3JhbW1hcik7XG4gICAgICBpZiAoZmFsc2UpIHtcbiAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgXCIgIHBvcHBpbmcgXCIgKyBwb3BwZWRSdWxlLmRlYnVnTmFtZSArIFwiIC0gXCIgKyBwb3BwZWRSdWxlLmRlYnVnRW5kUmVnRXhwXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBsaW5lVG9rZW5zLnByb2R1Y2Uoc3RhY2ssIGNhcHR1cmVJbmRpY2VzWzBdLnN0YXJ0KTtcbiAgICAgIHN0YWNrID0gc3RhY2sud2l0aENvbnRlbnROYW1lU2NvcGVzTGlzdChzdGFjay5uYW1lU2NvcGVzTGlzdCk7XG4gICAgICBoYW5kbGVDYXB0dXJlcyhcbiAgICAgICAgZ3JhbW1hcixcbiAgICAgICAgbGluZVRleHQsXG4gICAgICAgIGlzRmlyc3RMaW5lLFxuICAgICAgICBzdGFjayxcbiAgICAgICAgbGluZVRva2VucyxcbiAgICAgICAgcG9wcGVkUnVsZS5lbmRDYXB0dXJlcyxcbiAgICAgICAgY2FwdHVyZUluZGljZXNcbiAgICAgICk7XG4gICAgICBsaW5lVG9rZW5zLnByb2R1Y2Uoc3RhY2ssIGNhcHR1cmVJbmRpY2VzWzBdLmVuZCk7XG4gICAgICBjb25zdCBwb3BwZWQgPSBzdGFjaztcbiAgICAgIHN0YWNrID0gc3RhY2sucGFyZW50O1xuICAgICAgYW5jaG9yUG9zaXRpb24gPSBwb3BwZWQuZ2V0QW5jaG9yUG9zKCk7XG4gICAgICBpZiAoIWhhc0FkdmFuY2VkICYmIHBvcHBlZC5nZXRFbnRlclBvcygpID09PSBsaW5lUG9zKSB7XG4gICAgICAgIGlmIChmYWxzZSkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICBcIlsxXSAtIEdyYW1tYXIgaXMgaW4gYW4gZW5kbGVzcyBsb29wIC0gR3JhbW1hciBwdXNoZWQgJiBwb3BwZWQgYSBydWxlIHdpdGhvdXQgYWR2YW5jaW5nXCJcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHN0YWNrID0gcG9wcGVkO1xuICAgICAgICBsaW5lVG9rZW5zLnByb2R1Y2Uoc3RhY2ssIGxpbmVMZW5ndGgpO1xuICAgICAgICBTVE9QID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBfcnVsZSA9IGdyYW1tYXIuZ2V0UnVsZShtYXRjaGVkUnVsZUlkKTtcbiAgICAgIGxpbmVUb2tlbnMucHJvZHVjZShzdGFjaywgY2FwdHVyZUluZGljZXNbMF0uc3RhcnQpO1xuICAgICAgY29uc3QgYmVmb3JlUHVzaCA9IHN0YWNrO1xuICAgICAgY29uc3Qgc2NvcGVOYW1lID0gX3J1bGUuZ2V0TmFtZShsaW5lVGV4dC5jb250ZW50LCBjYXB0dXJlSW5kaWNlcyk7XG4gICAgICBjb25zdCBuYW1lU2NvcGVzTGlzdCA9IHN0YWNrLmNvbnRlbnROYW1lU2NvcGVzTGlzdC5wdXNoQXR0cmlidXRlZChcbiAgICAgICAgc2NvcGVOYW1lLFxuICAgICAgICBncmFtbWFyXG4gICAgICApO1xuICAgICAgc3RhY2sgPSBzdGFjay5wdXNoKFxuICAgICAgICBtYXRjaGVkUnVsZUlkLFxuICAgICAgICBsaW5lUG9zLFxuICAgICAgICBhbmNob3JQb3NpdGlvbixcbiAgICAgICAgY2FwdHVyZUluZGljZXNbMF0uZW5kID09PSBsaW5lTGVuZ3RoLFxuICAgICAgICBudWxsLFxuICAgICAgICBuYW1lU2NvcGVzTGlzdCxcbiAgICAgICAgbmFtZVNjb3Blc0xpc3RcbiAgICAgICk7XG4gICAgICBpZiAoX3J1bGUgaW5zdGFuY2VvZiBCZWdpbkVuZFJ1bGUpIHtcbiAgICAgICAgY29uc3QgcHVzaGVkUnVsZSA9IF9ydWxlO1xuICAgICAgICBpZiAoZmFsc2UpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgIFwiICBwdXNoaW5nIFwiICsgcHVzaGVkUnVsZS5kZWJ1Z05hbWUgKyBcIiAtIFwiICsgcHVzaGVkUnVsZS5kZWJ1Z0JlZ2luUmVnRXhwXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBoYW5kbGVDYXB0dXJlcyhcbiAgICAgICAgICBncmFtbWFyLFxuICAgICAgICAgIGxpbmVUZXh0LFxuICAgICAgICAgIGlzRmlyc3RMaW5lLFxuICAgICAgICAgIHN0YWNrLFxuICAgICAgICAgIGxpbmVUb2tlbnMsXG4gICAgICAgICAgcHVzaGVkUnVsZS5iZWdpbkNhcHR1cmVzLFxuICAgICAgICAgIGNhcHR1cmVJbmRpY2VzXG4gICAgICAgICk7XG4gICAgICAgIGxpbmVUb2tlbnMucHJvZHVjZShzdGFjaywgY2FwdHVyZUluZGljZXNbMF0uZW5kKTtcbiAgICAgICAgYW5jaG9yUG9zaXRpb24gPSBjYXB0dXJlSW5kaWNlc1swXS5lbmQ7XG4gICAgICAgIGNvbnN0IGNvbnRlbnROYW1lID0gcHVzaGVkUnVsZS5nZXRDb250ZW50TmFtZShcbiAgICAgICAgICBsaW5lVGV4dC5jb250ZW50LFxuICAgICAgICAgIGNhcHR1cmVJbmRpY2VzXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGNvbnRlbnROYW1lU2NvcGVzTGlzdCA9IG5hbWVTY29wZXNMaXN0LnB1c2hBdHRyaWJ1dGVkKFxuICAgICAgICAgIGNvbnRlbnROYW1lLFxuICAgICAgICAgIGdyYW1tYXJcbiAgICAgICAgKTtcbiAgICAgICAgc3RhY2sgPSBzdGFjay53aXRoQ29udGVudE5hbWVTY29wZXNMaXN0KGNvbnRlbnROYW1lU2NvcGVzTGlzdCk7XG4gICAgICAgIGlmIChwdXNoZWRSdWxlLmVuZEhhc0JhY2tSZWZlcmVuY2VzKSB7XG4gICAgICAgICAgc3RhY2sgPSBzdGFjay53aXRoRW5kUnVsZShcbiAgICAgICAgICAgIHB1c2hlZFJ1bGUuZ2V0RW5kV2l0aFJlc29sdmVkQmFja1JlZmVyZW5jZXMoXG4gICAgICAgICAgICAgIGxpbmVUZXh0LmNvbnRlbnQsXG4gICAgICAgICAgICAgIGNhcHR1cmVJbmRpY2VzXG4gICAgICAgICAgICApXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWhhc0FkdmFuY2VkICYmIGJlZm9yZVB1c2guaGFzU2FtZVJ1bGVBcyhzdGFjaykpIHtcbiAgICAgICAgICBpZiAoZmFsc2UpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICAgIFwiWzJdIC0gR3JhbW1hciBpcyBpbiBhbiBlbmRsZXNzIGxvb3AgLSBHcmFtbWFyIHB1c2hlZCB0aGUgc2FtZSBydWxlIHdpdGhvdXQgYWR2YW5jaW5nXCJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHN0YWNrID0gc3RhY2sucG9wKCk7XG4gICAgICAgICAgbGluZVRva2Vucy5wcm9kdWNlKHN0YWNrLCBsaW5lTGVuZ3RoKTtcbiAgICAgICAgICBTVE9QID0gdHJ1ZTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoX3J1bGUgaW5zdGFuY2VvZiBCZWdpbldoaWxlUnVsZSkge1xuICAgICAgICBjb25zdCBwdXNoZWRSdWxlID0gX3J1bGU7XG4gICAgICAgIGlmIChmYWxzZSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiICBwdXNoaW5nIFwiICsgcHVzaGVkUnVsZS5kZWJ1Z05hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGhhbmRsZUNhcHR1cmVzKFxuICAgICAgICAgIGdyYW1tYXIsXG4gICAgICAgICAgbGluZVRleHQsXG4gICAgICAgICAgaXNGaXJzdExpbmUsXG4gICAgICAgICAgc3RhY2ssXG4gICAgICAgICAgbGluZVRva2VucyxcbiAgICAgICAgICBwdXNoZWRSdWxlLmJlZ2luQ2FwdHVyZXMsXG4gICAgICAgICAgY2FwdHVyZUluZGljZXNcbiAgICAgICAgKTtcbiAgICAgICAgbGluZVRva2Vucy5wcm9kdWNlKHN0YWNrLCBjYXB0dXJlSW5kaWNlc1swXS5lbmQpO1xuICAgICAgICBhbmNob3JQb3NpdGlvbiA9IGNhcHR1cmVJbmRpY2VzWzBdLmVuZDtcbiAgICAgICAgY29uc3QgY29udGVudE5hbWUgPSBwdXNoZWRSdWxlLmdldENvbnRlbnROYW1lKFxuICAgICAgICAgIGxpbmVUZXh0LmNvbnRlbnQsXG4gICAgICAgICAgY2FwdHVyZUluZGljZXNcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgY29udGVudE5hbWVTY29wZXNMaXN0ID0gbmFtZVNjb3Blc0xpc3QucHVzaEF0dHJpYnV0ZWQoXG4gICAgICAgICAgY29udGVudE5hbWUsXG4gICAgICAgICAgZ3JhbW1hclxuICAgICAgICApO1xuICAgICAgICBzdGFjayA9IHN0YWNrLndpdGhDb250ZW50TmFtZVNjb3Blc0xpc3QoY29udGVudE5hbWVTY29wZXNMaXN0KTtcbiAgICAgICAgaWYgKHB1c2hlZFJ1bGUud2hpbGVIYXNCYWNrUmVmZXJlbmNlcykge1xuICAgICAgICAgIHN0YWNrID0gc3RhY2sud2l0aEVuZFJ1bGUoXG4gICAgICAgICAgICBwdXNoZWRSdWxlLmdldFdoaWxlV2l0aFJlc29sdmVkQmFja1JlZmVyZW5jZXMoXG4gICAgICAgICAgICAgIGxpbmVUZXh0LmNvbnRlbnQsXG4gICAgICAgICAgICAgIGNhcHR1cmVJbmRpY2VzXG4gICAgICAgICAgICApXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWhhc0FkdmFuY2VkICYmIGJlZm9yZVB1c2guaGFzU2FtZVJ1bGVBcyhzdGFjaykpIHtcbiAgICAgICAgICBpZiAoZmFsc2UpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICAgIFwiWzNdIC0gR3JhbW1hciBpcyBpbiBhbiBlbmRsZXNzIGxvb3AgLSBHcmFtbWFyIHB1c2hlZCB0aGUgc2FtZSBydWxlIHdpdGhvdXQgYWR2YW5jaW5nXCJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHN0YWNrID0gc3RhY2sucG9wKCk7XG4gICAgICAgICAgbGluZVRva2Vucy5wcm9kdWNlKHN0YWNrLCBsaW5lTGVuZ3RoKTtcbiAgICAgICAgICBTVE9QID0gdHJ1ZTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IG1hdGNoaW5nUnVsZSA9IF9ydWxlO1xuICAgICAgICBpZiAoZmFsc2UpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgIFwiICBtYXRjaGVkIFwiICsgbWF0Y2hpbmdSdWxlLmRlYnVnTmFtZSArIFwiIC0gXCIgKyBtYXRjaGluZ1J1bGUuZGVidWdNYXRjaFJlZ0V4cFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgaGFuZGxlQ2FwdHVyZXMoXG4gICAgICAgICAgZ3JhbW1hcixcbiAgICAgICAgICBsaW5lVGV4dCxcbiAgICAgICAgICBpc0ZpcnN0TGluZSxcbiAgICAgICAgICBzdGFjayxcbiAgICAgICAgICBsaW5lVG9rZW5zLFxuICAgICAgICAgIG1hdGNoaW5nUnVsZS5jYXB0dXJlcyxcbiAgICAgICAgICBjYXB0dXJlSW5kaWNlc1xuICAgICAgICApO1xuICAgICAgICBsaW5lVG9rZW5zLnByb2R1Y2Uoc3RhY2ssIGNhcHR1cmVJbmRpY2VzWzBdLmVuZCk7XG4gICAgICAgIHN0YWNrID0gc3RhY2sucG9wKCk7XG4gICAgICAgIGlmICghaGFzQWR2YW5jZWQpIHtcbiAgICAgICAgICBpZiAoZmFsc2UpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICAgIFwiWzRdIC0gR3JhbW1hciBpcyBpbiBhbiBlbmRsZXNzIGxvb3AgLSBHcmFtbWFyIGlzIG5vdCBhZHZhbmNpbmcsIG5vciBpcyBpdCBwdXNoaW5nL3BvcHBpbmdcIlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc3RhY2sgPSBzdGFjay5zYWZlUG9wKCk7XG4gICAgICAgICAgbGluZVRva2Vucy5wcm9kdWNlKHN0YWNrLCBsaW5lTGVuZ3RoKTtcbiAgICAgICAgICBTVE9QID0gdHJ1ZTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGNhcHR1cmVJbmRpY2VzWzBdLmVuZCA+IGxpbmVQb3MpIHtcbiAgICAgIGxpbmVQb3MgPSBjYXB0dXJlSW5kaWNlc1swXS5lbmQ7XG4gICAgICBpc0ZpcnN0TGluZSA9IGZhbHNlO1xuICAgIH1cbiAgfVxufVxuZnVuY3Rpb24gX2NoZWNrV2hpbGVDb25kaXRpb25zKGdyYW1tYXIsIGxpbmVUZXh0LCBpc0ZpcnN0TGluZSwgbGluZVBvcywgc3RhY2ssIGxpbmVUb2tlbnMpIHtcbiAgbGV0IGFuY2hvclBvc2l0aW9uID0gc3RhY2suYmVnaW5SdWxlQ2FwdHVyZWRFT0wgPyAwIDogLTE7XG4gIGNvbnN0IHdoaWxlUnVsZXMgPSBbXTtcbiAgZm9yIChsZXQgbm9kZSA9IHN0YWNrOyBub2RlOyBub2RlID0gbm9kZS5wb3AoKSkge1xuICAgIGNvbnN0IG5vZGVSdWxlID0gbm9kZS5nZXRSdWxlKGdyYW1tYXIpO1xuICAgIGlmIChub2RlUnVsZSBpbnN0YW5jZW9mIEJlZ2luV2hpbGVSdWxlKSB7XG4gICAgICB3aGlsZVJ1bGVzLnB1c2goe1xuICAgICAgICBydWxlOiBub2RlUnVsZSxcbiAgICAgICAgc3RhY2s6IG5vZGVcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICBmb3IgKGxldCB3aGlsZVJ1bGUgPSB3aGlsZVJ1bGVzLnBvcCgpOyB3aGlsZVJ1bGU7IHdoaWxlUnVsZSA9IHdoaWxlUnVsZXMucG9wKCkpIHtcbiAgICBjb25zdCB7IHJ1bGVTY2FubmVyLCBmaW5kT3B0aW9ucyB9ID0gcHJlcGFyZVJ1bGVXaGlsZVNlYXJjaCh3aGlsZVJ1bGUucnVsZSwgZ3JhbW1hciwgd2hpbGVSdWxlLnN0YWNrLmVuZFJ1bGUsIGlzRmlyc3RMaW5lLCBsaW5lUG9zID09PSBhbmNob3JQb3NpdGlvbik7XG4gICAgY29uc3QgciA9IHJ1bGVTY2FubmVyLmZpbmROZXh0TWF0Y2hTeW5jKGxpbmVUZXh0LCBsaW5lUG9zLCBmaW5kT3B0aW9ucyk7XG4gICAgaWYgKGZhbHNlKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIiAgc2Nhbm5pbmcgZm9yIHdoaWxlIHJ1bGVcIik7XG4gICAgICBjb25zb2xlLmxvZyhydWxlU2Nhbm5lci50b1N0cmluZygpKTtcbiAgICB9XG4gICAgaWYgKHIpIHtcbiAgICAgIGNvbnN0IG1hdGNoZWRSdWxlSWQgPSByLnJ1bGVJZDtcbiAgICAgIGlmIChtYXRjaGVkUnVsZUlkICE9PSB3aGlsZVJ1bGVJZCkge1xuICAgICAgICBzdGFjayA9IHdoaWxlUnVsZS5zdGFjay5wb3AoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpZiAoci5jYXB0dXJlSW5kaWNlcyAmJiByLmNhcHR1cmVJbmRpY2VzLmxlbmd0aCkge1xuICAgICAgICBsaW5lVG9rZW5zLnByb2R1Y2Uod2hpbGVSdWxlLnN0YWNrLCByLmNhcHR1cmVJbmRpY2VzWzBdLnN0YXJ0KTtcbiAgICAgICAgaGFuZGxlQ2FwdHVyZXMoZ3JhbW1hciwgbGluZVRleHQsIGlzRmlyc3RMaW5lLCB3aGlsZVJ1bGUuc3RhY2ssIGxpbmVUb2tlbnMsIHdoaWxlUnVsZS5ydWxlLndoaWxlQ2FwdHVyZXMsIHIuY2FwdHVyZUluZGljZXMpO1xuICAgICAgICBsaW5lVG9rZW5zLnByb2R1Y2Uod2hpbGVSdWxlLnN0YWNrLCByLmNhcHR1cmVJbmRpY2VzWzBdLmVuZCk7XG4gICAgICAgIGFuY2hvclBvc2l0aW9uID0gci5jYXB0dXJlSW5kaWNlc1swXS5lbmQ7XG4gICAgICAgIGlmIChyLmNhcHR1cmVJbmRpY2VzWzBdLmVuZCA+IGxpbmVQb3MpIHtcbiAgICAgICAgICBsaW5lUG9zID0gci5jYXB0dXJlSW5kaWNlc1swXS5lbmQ7XG4gICAgICAgICAgaXNGaXJzdExpbmUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZmFsc2UpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCIgIHBvcHBpbmcgXCIgKyB3aGlsZVJ1bGUucnVsZS5kZWJ1Z05hbWUgKyBcIiAtIFwiICsgd2hpbGVSdWxlLnJ1bGUuZGVidWdXaGlsZVJlZ0V4cCk7XG4gICAgICB9XG4gICAgICBzdGFjayA9IHdoaWxlUnVsZS5zdGFjay5wb3AoKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4geyBzdGFjaywgbGluZVBvcywgYW5jaG9yUG9zaXRpb24sIGlzRmlyc3RMaW5lIH07XG59XG5mdW5jdGlvbiBtYXRjaFJ1bGVPckluamVjdGlvbnMoZ3JhbW1hciwgbGluZVRleHQsIGlzRmlyc3RMaW5lLCBsaW5lUG9zLCBzdGFjaywgYW5jaG9yUG9zaXRpb24pIHtcbiAgY29uc3QgbWF0Y2hSZXN1bHQgPSBtYXRjaFJ1bGUoZ3JhbW1hciwgbGluZVRleHQsIGlzRmlyc3RMaW5lLCBsaW5lUG9zLCBzdGFjaywgYW5jaG9yUG9zaXRpb24pO1xuICBjb25zdCBpbmplY3Rpb25zID0gZ3JhbW1hci5nZXRJbmplY3Rpb25zKCk7XG4gIGlmIChpbmplY3Rpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBtYXRjaFJlc3VsdDtcbiAgfVxuICBjb25zdCBpbmplY3Rpb25SZXN1bHQgPSBtYXRjaEluamVjdGlvbnMoaW5qZWN0aW9ucywgZ3JhbW1hciwgbGluZVRleHQsIGlzRmlyc3RMaW5lLCBsaW5lUG9zLCBzdGFjaywgYW5jaG9yUG9zaXRpb24pO1xuICBpZiAoIWluamVjdGlvblJlc3VsdCkge1xuICAgIHJldHVybiBtYXRjaFJlc3VsdDtcbiAgfVxuICBpZiAoIW1hdGNoUmVzdWx0KSB7XG4gICAgcmV0dXJuIGluamVjdGlvblJlc3VsdDtcbiAgfVxuICBjb25zdCBtYXRjaFJlc3VsdFNjb3JlID0gbWF0Y2hSZXN1bHQuY2FwdHVyZUluZGljZXNbMF0uc3RhcnQ7XG4gIGNvbnN0IGluamVjdGlvblJlc3VsdFNjb3JlID0gaW5qZWN0aW9uUmVzdWx0LmNhcHR1cmVJbmRpY2VzWzBdLnN0YXJ0O1xuICBpZiAoaW5qZWN0aW9uUmVzdWx0U2NvcmUgPCBtYXRjaFJlc3VsdFNjb3JlIHx8IGluamVjdGlvblJlc3VsdC5wcmlvcml0eU1hdGNoICYmIGluamVjdGlvblJlc3VsdFNjb3JlID09PSBtYXRjaFJlc3VsdFNjb3JlKSB7XG4gICAgcmV0dXJuIGluamVjdGlvblJlc3VsdDtcbiAgfVxuICByZXR1cm4gbWF0Y2hSZXN1bHQ7XG59XG5mdW5jdGlvbiBtYXRjaFJ1bGUoZ3JhbW1hciwgbGluZVRleHQsIGlzRmlyc3RMaW5lLCBsaW5lUG9zLCBzdGFjaywgYW5jaG9yUG9zaXRpb24pIHtcbiAgY29uc3QgcnVsZSA9IHN0YWNrLmdldFJ1bGUoZ3JhbW1hcik7XG4gIGNvbnN0IHsgcnVsZVNjYW5uZXIsIGZpbmRPcHRpb25zIH0gPSBwcmVwYXJlUnVsZVNlYXJjaChydWxlLCBncmFtbWFyLCBzdGFjay5lbmRSdWxlLCBpc0ZpcnN0TGluZSwgbGluZVBvcyA9PT0gYW5jaG9yUG9zaXRpb24pO1xuICBjb25zdCByID0gcnVsZVNjYW5uZXIuZmluZE5leHRNYXRjaFN5bmMobGluZVRleHQsIGxpbmVQb3MsIGZpbmRPcHRpb25zKTtcbiAgaWYgKHIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY2FwdHVyZUluZGljZXM6IHIuY2FwdHVyZUluZGljZXMsXG4gICAgICBtYXRjaGVkUnVsZUlkOiByLnJ1bGVJZFxuICAgIH07XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5mdW5jdGlvbiBtYXRjaEluamVjdGlvbnMoaW5qZWN0aW9ucywgZ3JhbW1hciwgbGluZVRleHQsIGlzRmlyc3RMaW5lLCBsaW5lUG9zLCBzdGFjaywgYW5jaG9yUG9zaXRpb24pIHtcbiAgbGV0IGJlc3RNYXRjaFJhdGluZyA9IE51bWJlci5NQVhfVkFMVUU7XG4gIGxldCBiZXN0TWF0Y2hDYXB0dXJlSW5kaWNlcyA9IG51bGw7XG4gIGxldCBiZXN0TWF0Y2hSdWxlSWQ7XG4gIGxldCBiZXN0TWF0Y2hSZXN1bHRQcmlvcml0eSA9IDA7XG4gIGNvbnN0IHNjb3BlcyA9IHN0YWNrLmNvbnRlbnROYW1lU2NvcGVzTGlzdC5nZXRTY29wZU5hbWVzKCk7XG4gIGZvciAobGV0IGkgPSAwLCBsZW4gPSBpbmplY3Rpb25zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgY29uc3QgaW5qZWN0aW9uID0gaW5qZWN0aW9uc1tpXTtcbiAgICBpZiAoIWluamVjdGlvbi5tYXRjaGVyKHNjb3BlcykpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBjb25zdCBydWxlID0gZ3JhbW1hci5nZXRSdWxlKGluamVjdGlvbi5ydWxlSWQpO1xuICAgIGNvbnN0IHsgcnVsZVNjYW5uZXIsIGZpbmRPcHRpb25zIH0gPSBwcmVwYXJlUnVsZVNlYXJjaChydWxlLCBncmFtbWFyLCBudWxsLCBpc0ZpcnN0TGluZSwgbGluZVBvcyA9PT0gYW5jaG9yUG9zaXRpb24pO1xuICAgIGNvbnN0IG1hdGNoUmVzdWx0ID0gcnVsZVNjYW5uZXIuZmluZE5leHRNYXRjaFN5bmMobGluZVRleHQsIGxpbmVQb3MsIGZpbmRPcHRpb25zKTtcbiAgICBpZiAoIW1hdGNoUmVzdWx0KSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKGZhbHNlKSB7XG4gICAgICBjb25zb2xlLmxvZyhgICBtYXRjaGVkIGluamVjdGlvbjogJHtpbmplY3Rpb24uZGVidWdTZWxlY3Rvcn1gKTtcbiAgICAgIGNvbnNvbGUubG9nKHJ1bGVTY2FubmVyLnRvU3RyaW5nKCkpO1xuICAgIH1cbiAgICBjb25zdCBtYXRjaFJhdGluZyA9IG1hdGNoUmVzdWx0LmNhcHR1cmVJbmRpY2VzWzBdLnN0YXJ0O1xuICAgIGlmIChtYXRjaFJhdGluZyA+PSBiZXN0TWF0Y2hSYXRpbmcpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBiZXN0TWF0Y2hSYXRpbmcgPSBtYXRjaFJhdGluZztcbiAgICBiZXN0TWF0Y2hDYXB0dXJlSW5kaWNlcyA9IG1hdGNoUmVzdWx0LmNhcHR1cmVJbmRpY2VzO1xuICAgIGJlc3RNYXRjaFJ1bGVJZCA9IG1hdGNoUmVzdWx0LnJ1bGVJZDtcbiAgICBiZXN0TWF0Y2hSZXN1bHRQcmlvcml0eSA9IGluamVjdGlvbi5wcmlvcml0eTtcbiAgICBpZiAoYmVzdE1hdGNoUmF0aW5nID09PSBsaW5lUG9zKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgaWYgKGJlc3RNYXRjaENhcHR1cmVJbmRpY2VzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByaW9yaXR5TWF0Y2g6IGJlc3RNYXRjaFJlc3VsdFByaW9yaXR5ID09PSAtMSxcbiAgICAgIGNhcHR1cmVJbmRpY2VzOiBiZXN0TWF0Y2hDYXB0dXJlSW5kaWNlcyxcbiAgICAgIG1hdGNoZWRSdWxlSWQ6IGJlc3RNYXRjaFJ1bGVJZFxuICAgIH07XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5mdW5jdGlvbiBwcmVwYXJlUnVsZVNlYXJjaChydWxlLCBncmFtbWFyLCBlbmRSZWdleFNvdXJjZSwgYWxsb3dBLCBhbGxvd0cpIHtcbiAgaWYgKFVzZU9uaWd1cnVtYUZpbmRPcHRpb25zKSB7XG4gICAgY29uc3QgcnVsZVNjYW5uZXIyID0gcnVsZS5jb21waWxlKGdyYW1tYXIsIGVuZFJlZ2V4U291cmNlKTtcbiAgICBjb25zdCBmaW5kT3B0aW9ucyA9IGdldEZpbmRPcHRpb25zKGFsbG93QSwgYWxsb3dHKTtcbiAgICByZXR1cm4geyBydWxlU2Nhbm5lcjogcnVsZVNjYW5uZXIyLCBmaW5kT3B0aW9ucyB9O1xuICB9XG4gIGNvbnN0IHJ1bGVTY2FubmVyID0gcnVsZS5jb21waWxlQUcoZ3JhbW1hciwgZW5kUmVnZXhTb3VyY2UsIGFsbG93QSwgYWxsb3dHKTtcbiAgcmV0dXJuIHsgcnVsZVNjYW5uZXIsIGZpbmRPcHRpb25zOiAwIC8qIE5vbmUgKi8gfTtcbn1cbmZ1bmN0aW9uIHByZXBhcmVSdWxlV2hpbGVTZWFyY2gocnVsZSwgZ3JhbW1hciwgZW5kUmVnZXhTb3VyY2UsIGFsbG93QSwgYWxsb3dHKSB7XG4gIGlmIChVc2VPbmlndXJ1bWFGaW5kT3B0aW9ucykge1xuICAgIGNvbnN0IHJ1bGVTY2FubmVyMiA9IHJ1bGUuY29tcGlsZVdoaWxlKGdyYW1tYXIsIGVuZFJlZ2V4U291cmNlKTtcbiAgICBjb25zdCBmaW5kT3B0aW9ucyA9IGdldEZpbmRPcHRpb25zKGFsbG93QSwgYWxsb3dHKTtcbiAgICByZXR1cm4geyBydWxlU2Nhbm5lcjogcnVsZVNjYW5uZXIyLCBmaW5kT3B0aW9ucyB9O1xuICB9XG4gIGNvbnN0IHJ1bGVTY2FubmVyID0gcnVsZS5jb21waWxlV2hpbGVBRyhncmFtbWFyLCBlbmRSZWdleFNvdXJjZSwgYWxsb3dBLCBhbGxvd0cpO1xuICByZXR1cm4geyBydWxlU2Nhbm5lciwgZmluZE9wdGlvbnM6IDAgLyogTm9uZSAqLyB9O1xufVxuZnVuY3Rpb24gZ2V0RmluZE9wdGlvbnMoYWxsb3dBLCBhbGxvd0cpIHtcbiAgbGV0IG9wdGlvbnMgPSAwIC8qIE5vbmUgKi87XG4gIGlmICghYWxsb3dBKSB7XG4gICAgb3B0aW9ucyB8PSAxIC8qIE5vdEJlZ2luU3RyaW5nICovO1xuICB9XG4gIGlmICghYWxsb3dHKSB7XG4gICAgb3B0aW9ucyB8PSA0IC8qIE5vdEJlZ2luUG9zaXRpb24gKi87XG4gIH1cbiAgcmV0dXJuIG9wdGlvbnM7XG59XG5mdW5jdGlvbiBoYW5kbGVDYXB0dXJlcyhncmFtbWFyLCBsaW5lVGV4dCwgaXNGaXJzdExpbmUsIHN0YWNrLCBsaW5lVG9rZW5zLCBjYXB0dXJlcywgY2FwdHVyZUluZGljZXMpIHtcbiAgaWYgKGNhcHR1cmVzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBsaW5lVGV4dENvbnRlbnQgPSBsaW5lVGV4dC5jb250ZW50O1xuICBjb25zdCBsZW4gPSBNYXRoLm1pbihjYXB0dXJlcy5sZW5ndGgsIGNhcHR1cmVJbmRpY2VzLmxlbmd0aCk7XG4gIGNvbnN0IGxvY2FsU3RhY2sgPSBbXTtcbiAgY29uc3QgbWF4RW5kID0gY2FwdHVyZUluZGljZXNbMF0uZW5kO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgY29uc3QgY2FwdHVyZVJ1bGUgPSBjYXB0dXJlc1tpXTtcbiAgICBpZiAoY2FwdHVyZVJ1bGUgPT09IG51bGwpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBjb25zdCBjYXB0dXJlSW5kZXggPSBjYXB0dXJlSW5kaWNlc1tpXTtcbiAgICBpZiAoY2FwdHVyZUluZGV4Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChjYXB0dXJlSW5kZXguc3RhcnQgPiBtYXhFbmQpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICB3aGlsZSAobG9jYWxTdGFjay5sZW5ndGggPiAwICYmIGxvY2FsU3RhY2tbbG9jYWxTdGFjay5sZW5ndGggLSAxXS5lbmRQb3MgPD0gY2FwdHVyZUluZGV4LnN0YXJ0KSB7XG4gICAgICBsaW5lVG9rZW5zLnByb2R1Y2VGcm9tU2NvcGVzKGxvY2FsU3RhY2tbbG9jYWxTdGFjay5sZW5ndGggLSAxXS5zY29wZXMsIGxvY2FsU3RhY2tbbG9jYWxTdGFjay5sZW5ndGggLSAxXS5lbmRQb3MpO1xuICAgICAgbG9jYWxTdGFjay5wb3AoKTtcbiAgICB9XG4gICAgaWYgKGxvY2FsU3RhY2subGVuZ3RoID4gMCkge1xuICAgICAgbGluZVRva2Vucy5wcm9kdWNlRnJvbVNjb3Blcyhsb2NhbFN0YWNrW2xvY2FsU3RhY2subGVuZ3RoIC0gMV0uc2NvcGVzLCBjYXB0dXJlSW5kZXguc3RhcnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaW5lVG9rZW5zLnByb2R1Y2Uoc3RhY2ssIGNhcHR1cmVJbmRleC5zdGFydCk7XG4gICAgfVxuICAgIGlmIChjYXB0dXJlUnVsZS5yZXRva2VuaXplQ2FwdHVyZWRXaXRoUnVsZUlkKSB7XG4gICAgICBjb25zdCBzY29wZU5hbWUgPSBjYXB0dXJlUnVsZS5nZXROYW1lKGxpbmVUZXh0Q29udGVudCwgY2FwdHVyZUluZGljZXMpO1xuICAgICAgY29uc3QgbmFtZVNjb3Blc0xpc3QgPSBzdGFjay5jb250ZW50TmFtZVNjb3Blc0xpc3QucHVzaEF0dHJpYnV0ZWQoc2NvcGVOYW1lLCBncmFtbWFyKTtcbiAgICAgIGNvbnN0IGNvbnRlbnROYW1lID0gY2FwdHVyZVJ1bGUuZ2V0Q29udGVudE5hbWUobGluZVRleHRDb250ZW50LCBjYXB0dXJlSW5kaWNlcyk7XG4gICAgICBjb25zdCBjb250ZW50TmFtZVNjb3Blc0xpc3QgPSBuYW1lU2NvcGVzTGlzdC5wdXNoQXR0cmlidXRlZChjb250ZW50TmFtZSwgZ3JhbW1hcik7XG4gICAgICBjb25zdCBzdGFja0Nsb25lID0gc3RhY2sucHVzaChjYXB0dXJlUnVsZS5yZXRva2VuaXplQ2FwdHVyZWRXaXRoUnVsZUlkLCBjYXB0dXJlSW5kZXguc3RhcnQsIC0xLCBmYWxzZSwgbnVsbCwgbmFtZVNjb3Blc0xpc3QsIGNvbnRlbnROYW1lU2NvcGVzTGlzdCk7XG4gICAgICBjb25zdCBvbmlnU3ViU3RyID0gZ3JhbW1hci5jcmVhdGVPbmlnU3RyaW5nKGxpbmVUZXh0Q29udGVudC5zdWJzdHJpbmcoMCwgY2FwdHVyZUluZGV4LmVuZCkpO1xuICAgICAgX3Rva2VuaXplU3RyaW5nKFxuICAgICAgICBncmFtbWFyLFxuICAgICAgICBvbmlnU3ViU3RyLFxuICAgICAgICBpc0ZpcnN0TGluZSAmJiBjYXB0dXJlSW5kZXguc3RhcnQgPT09IDAsXG4gICAgICAgIGNhcHR1cmVJbmRleC5zdGFydCxcbiAgICAgICAgc3RhY2tDbG9uZSxcbiAgICAgICAgbGluZVRva2VucyxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIC8qIG5vIHRpbWUgbGltaXQgKi9cbiAgICAgICAgMFxuICAgICAgKTtcbiAgICAgIGRpc3Bvc2VPbmlnU3RyaW5nKG9uaWdTdWJTdHIpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGNvbnN0IGNhcHR1cmVSdWxlU2NvcGVOYW1lID0gY2FwdHVyZVJ1bGUuZ2V0TmFtZShsaW5lVGV4dENvbnRlbnQsIGNhcHR1cmVJbmRpY2VzKTtcbiAgICBpZiAoY2FwdHVyZVJ1bGVTY29wZU5hbWUgIT09IG51bGwpIHtcbiAgICAgIGNvbnN0IGJhc2UgPSBsb2NhbFN0YWNrLmxlbmd0aCA+IDAgPyBsb2NhbFN0YWNrW2xvY2FsU3RhY2subGVuZ3RoIC0gMV0uc2NvcGVzIDogc3RhY2suY29udGVudE5hbWVTY29wZXNMaXN0O1xuICAgICAgY29uc3QgY2FwdHVyZVJ1bGVTY29wZXNMaXN0ID0gYmFzZS5wdXNoQXR0cmlidXRlZChjYXB0dXJlUnVsZVNjb3BlTmFtZSwgZ3JhbW1hcik7XG4gICAgICBsb2NhbFN0YWNrLnB1c2gobmV3IExvY2FsU3RhY2tFbGVtZW50KGNhcHR1cmVSdWxlU2NvcGVzTGlzdCwgY2FwdHVyZUluZGV4LmVuZCkpO1xuICAgIH1cbiAgfVxuICB3aGlsZSAobG9jYWxTdGFjay5sZW5ndGggPiAwKSB7XG4gICAgbGluZVRva2Vucy5wcm9kdWNlRnJvbVNjb3Blcyhsb2NhbFN0YWNrW2xvY2FsU3RhY2subGVuZ3RoIC0gMV0uc2NvcGVzLCBsb2NhbFN0YWNrW2xvY2FsU3RhY2subGVuZ3RoIC0gMV0uZW5kUG9zKTtcbiAgICBsb2NhbFN0YWNrLnBvcCgpO1xuICB9XG59XG52YXIgTG9jYWxTdGFja0VsZW1lbnQgPSBjbGFzcyB7XG4gIHNjb3BlcztcbiAgZW5kUG9zO1xuICBjb25zdHJ1Y3RvcihzY29wZXMsIGVuZFBvcykge1xuICAgIHRoaXMuc2NvcGVzID0gc2NvcGVzO1xuICAgIHRoaXMuZW5kUG9zID0gZW5kUG9zO1xuICB9XG59O1xuXG4vLyBzcmMvZ3JhbW1hci9ncmFtbWFyLnRzXG5mdW5jdGlvbiBjcmVhdGVHcmFtbWFyKHNjb3BlTmFtZSwgZ3JhbW1hciwgaW5pdGlhbExhbmd1YWdlLCBlbWJlZGRlZExhbmd1YWdlcywgdG9rZW5UeXBlcywgYmFsYW5jZWRCcmFja2V0U2VsZWN0b3JzLCBncmFtbWFyUmVwb3NpdG9yeSwgb25pZ0xpYikge1xuICByZXR1cm4gbmV3IEdyYW1tYXIoXG4gICAgc2NvcGVOYW1lLFxuICAgIGdyYW1tYXIsXG4gICAgaW5pdGlhbExhbmd1YWdlLFxuICAgIGVtYmVkZGVkTGFuZ3VhZ2VzLFxuICAgIHRva2VuVHlwZXMsXG4gICAgYmFsYW5jZWRCcmFja2V0U2VsZWN0b3JzLFxuICAgIGdyYW1tYXJSZXBvc2l0b3J5LFxuICAgIG9uaWdMaWJcbiAgKTtcbn1cbmZ1bmN0aW9uIGNvbGxlY3RJbmplY3Rpb25zKHJlc3VsdCwgc2VsZWN0b3IsIHJ1bGUsIHJ1bGVGYWN0b3J5SGVscGVyLCBncmFtbWFyKSB7XG4gIGNvbnN0IG1hdGNoZXJzID0gY3JlYXRlTWF0Y2hlcnMoc2VsZWN0b3IsIG5hbWVNYXRjaGVyKTtcbiAgY29uc3QgcnVsZUlkID0gUnVsZUZhY3RvcnkuZ2V0Q29tcGlsZWRSdWxlSWQocnVsZSwgcnVsZUZhY3RvcnlIZWxwZXIsIGdyYW1tYXIucmVwb3NpdG9yeSk7XG4gIGZvciAoY29uc3QgbWF0Y2hlciBvZiBtYXRjaGVycykge1xuICAgIHJlc3VsdC5wdXNoKHtcbiAgICAgIGRlYnVnU2VsZWN0b3I6IHNlbGVjdG9yLFxuICAgICAgbWF0Y2hlcjogbWF0Y2hlci5tYXRjaGVyLFxuICAgICAgcnVsZUlkLFxuICAgICAgZ3JhbW1hcixcbiAgICAgIHByaW9yaXR5OiBtYXRjaGVyLnByaW9yaXR5XG4gICAgfSk7XG4gIH1cbn1cbmZ1bmN0aW9uIG5hbWVNYXRjaGVyKGlkZW50aWZlcnMsIHNjb3Blcykge1xuICBpZiAoc2NvcGVzLmxlbmd0aCA8IGlkZW50aWZlcnMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGxldCBsYXN0SW5kZXggPSAwO1xuICByZXR1cm4gaWRlbnRpZmVycy5ldmVyeSgoaWRlbnRpZmllcikgPT4ge1xuICAgIGZvciAobGV0IGkgPSBsYXN0SW5kZXg7IGkgPCBzY29wZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChzY29wZXNBcmVNYXRjaGluZyhzY29wZXNbaV0sIGlkZW50aWZpZXIpKSB7XG4gICAgICAgIGxhc3RJbmRleCA9IGkgKyAxO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcbn1cbmZ1bmN0aW9uIHNjb3Blc0FyZU1hdGNoaW5nKHRoaXNTY29wZU5hbWUsIHNjb3BlTmFtZSkge1xuICBpZiAoIXRoaXNTY29wZU5hbWUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHRoaXNTY29wZU5hbWUgPT09IHNjb3BlTmFtZSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGNvbnN0IGxlbiA9IHNjb3BlTmFtZS5sZW5ndGg7XG4gIHJldHVybiB0aGlzU2NvcGVOYW1lLmxlbmd0aCA+IGxlbiAmJiB0aGlzU2NvcGVOYW1lLnN1YnN0cigwLCBsZW4pID09PSBzY29wZU5hbWUgJiYgdGhpc1Njb3BlTmFtZVtsZW5dID09PSBcIi5cIjtcbn1cbnZhciBHcmFtbWFyID0gY2xhc3Mge1xuICBjb25zdHJ1Y3Rvcihfcm9vdFNjb3BlTmFtZSwgZ3JhbW1hciwgaW5pdGlhbExhbmd1YWdlLCBlbWJlZGRlZExhbmd1YWdlcywgdG9rZW5UeXBlcywgYmFsYW5jZWRCcmFja2V0U2VsZWN0b3JzLCBncmFtbWFyUmVwb3NpdG9yeSwgX29uaWdMaWIpIHtcbiAgICB0aGlzLl9yb290U2NvcGVOYW1lID0gX3Jvb3RTY29wZU5hbWU7XG4gICAgdGhpcy5iYWxhbmNlZEJyYWNrZXRTZWxlY3RvcnMgPSBiYWxhbmNlZEJyYWNrZXRTZWxlY3RvcnM7XG4gICAgdGhpcy5fb25pZ0xpYiA9IF9vbmlnTGliO1xuICAgIHRoaXMuX2Jhc2ljU2NvcGVBdHRyaWJ1dGVzUHJvdmlkZXIgPSBuZXcgQmFzaWNTY29wZUF0dHJpYnV0ZXNQcm92aWRlcihcbiAgICAgIGluaXRpYWxMYW5ndWFnZSxcbiAgICAgIGVtYmVkZGVkTGFuZ3VhZ2VzXG4gICAgKTtcbiAgICB0aGlzLl9yb290SWQgPSAtMTtcbiAgICB0aGlzLl9sYXN0UnVsZUlkID0gMDtcbiAgICB0aGlzLl9ydWxlSWQyZGVzYyA9IFtudWxsXTtcbiAgICB0aGlzLl9pbmNsdWRlZEdyYW1tYXJzID0ge307XG4gICAgdGhpcy5fZ3JhbW1hclJlcG9zaXRvcnkgPSBncmFtbWFyUmVwb3NpdG9yeTtcbiAgICB0aGlzLl9ncmFtbWFyID0gaW5pdEdyYW1tYXIoZ3JhbW1hciwgbnVsbCk7XG4gICAgdGhpcy5faW5qZWN0aW9ucyA9IG51bGw7XG4gICAgdGhpcy5fdG9rZW5UeXBlTWF0Y2hlcnMgPSBbXTtcbiAgICBpZiAodG9rZW5UeXBlcykge1xuICAgICAgZm9yIChjb25zdCBzZWxlY3RvciBvZiBPYmplY3Qua2V5cyh0b2tlblR5cGVzKSkge1xuICAgICAgICBjb25zdCBtYXRjaGVycyA9IGNyZWF0ZU1hdGNoZXJzKHNlbGVjdG9yLCBuYW1lTWF0Y2hlcik7XG4gICAgICAgIGZvciAoY29uc3QgbWF0Y2hlciBvZiBtYXRjaGVycykge1xuICAgICAgICAgIHRoaXMuX3Rva2VuVHlwZU1hdGNoZXJzLnB1c2goe1xuICAgICAgICAgICAgbWF0Y2hlcjogbWF0Y2hlci5tYXRjaGVyLFxuICAgICAgICAgICAgdHlwZTogdG9rZW5UeXBlc1tzZWxlY3Rvcl1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBfcm9vdElkO1xuICBfbGFzdFJ1bGVJZDtcbiAgX3J1bGVJZDJkZXNjO1xuICBfaW5jbHVkZWRHcmFtbWFycztcbiAgX2dyYW1tYXJSZXBvc2l0b3J5O1xuICBfZ3JhbW1hcjtcbiAgX2luamVjdGlvbnM7XG4gIF9iYXNpY1Njb3BlQXR0cmlidXRlc1Byb3ZpZGVyO1xuICBfdG9rZW5UeXBlTWF0Y2hlcnM7XG4gIGdldCB0aGVtZVByb3ZpZGVyKCkge1xuICAgIHJldHVybiB0aGlzLl9ncmFtbWFyUmVwb3NpdG9yeTtcbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIGZvciAoY29uc3QgcnVsZSBvZiB0aGlzLl9ydWxlSWQyZGVzYykge1xuICAgICAgaWYgKHJ1bGUpIHtcbiAgICAgICAgcnVsZS5kaXNwb3NlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGNyZWF0ZU9uaWdTY2FubmVyKHNvdXJjZXMpIHtcbiAgICByZXR1cm4gdGhpcy5fb25pZ0xpYi5jcmVhdGVPbmlnU2Nhbm5lcihzb3VyY2VzKTtcbiAgfVxuICBjcmVhdGVPbmlnU3RyaW5nKHNvdXJjZXMpIHtcbiAgICByZXR1cm4gdGhpcy5fb25pZ0xpYi5jcmVhdGVPbmlnU3RyaW5nKHNvdXJjZXMpO1xuICB9XG4gIGdldE1ldGFkYXRhRm9yU2NvcGUoc2NvcGUpIHtcbiAgICByZXR1cm4gdGhpcy5fYmFzaWNTY29wZUF0dHJpYnV0ZXNQcm92aWRlci5nZXRCYXNpY1Njb3BlQXR0cmlidXRlcyhzY29wZSk7XG4gIH1cbiAgX2NvbGxlY3RJbmplY3Rpb25zKCkge1xuICAgIGNvbnN0IGdyYW1tYXJSZXBvc2l0b3J5ID0ge1xuICAgICAgbG9va3VwOiAoc2NvcGVOYW1lMikgPT4ge1xuICAgICAgICBpZiAoc2NvcGVOYW1lMiA9PT0gdGhpcy5fcm9vdFNjb3BlTmFtZSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLl9ncmFtbWFyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmdldEV4dGVybmFsR3JhbW1hcihzY29wZU5hbWUyKTtcbiAgICAgIH0sXG4gICAgICBpbmplY3Rpb25zOiAoc2NvcGVOYW1lMikgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ3JhbW1hclJlcG9zaXRvcnkuaW5qZWN0aW9ucyhzY29wZU5hbWUyKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIGNvbnN0IHNjb3BlTmFtZSA9IHRoaXMuX3Jvb3RTY29wZU5hbWU7XG4gICAgY29uc3QgZ3JhbW1hciA9IGdyYW1tYXJSZXBvc2l0b3J5Lmxvb2t1cChzY29wZU5hbWUpO1xuICAgIGlmIChncmFtbWFyKSB7XG4gICAgICBjb25zdCByYXdJbmplY3Rpb25zID0gZ3JhbW1hci5pbmplY3Rpb25zO1xuICAgICAgaWYgKHJhd0luamVjdGlvbnMpIHtcbiAgICAgICAgZm9yIChsZXQgZXhwcmVzc2lvbiBpbiByYXdJbmplY3Rpb25zKSB7XG4gICAgICAgICAgY29sbGVjdEluamVjdGlvbnMoXG4gICAgICAgICAgICByZXN1bHQsXG4gICAgICAgICAgICBleHByZXNzaW9uLFxuICAgICAgICAgICAgcmF3SW5qZWN0aW9uc1tleHByZXNzaW9uXSxcbiAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICBncmFtbWFyXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgaW5qZWN0aW9uU2NvcGVOYW1lcyA9IHRoaXMuX2dyYW1tYXJSZXBvc2l0b3J5LmluamVjdGlvbnMoc2NvcGVOYW1lKTtcbiAgICAgIGlmIChpbmplY3Rpb25TY29wZU5hbWVzKSB7XG4gICAgICAgIGluamVjdGlvblNjb3BlTmFtZXMuZm9yRWFjaCgoaW5qZWN0aW9uU2NvcGVOYW1lKSA9PiB7XG4gICAgICAgICAgY29uc3QgaW5qZWN0aW9uR3JhbW1hciA9IHRoaXMuZ2V0RXh0ZXJuYWxHcmFtbWFyKGluamVjdGlvblNjb3BlTmFtZSk7XG4gICAgICAgICAgaWYgKGluamVjdGlvbkdyYW1tYXIpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdG9yID0gaW5qZWN0aW9uR3JhbW1hci5pbmplY3Rpb25TZWxlY3RvcjtcbiAgICAgICAgICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgICAgICAgICBjb2xsZWN0SW5qZWN0aW9ucyhcbiAgICAgICAgICAgICAgICByZXN1bHQsXG4gICAgICAgICAgICAgICAgc2VsZWN0b3IsXG4gICAgICAgICAgICAgICAgaW5qZWN0aW9uR3JhbW1hcixcbiAgICAgICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgICAgIGluamVjdGlvbkdyYW1tYXJcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXN1bHQuc29ydCgoaTEsIGkyKSA9PiBpMS5wcmlvcml0eSAtIGkyLnByaW9yaXR5KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIGdldEluamVjdGlvbnMoKSB7XG4gICAgaWYgKHRoaXMuX2luamVjdGlvbnMgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuX2luamVjdGlvbnMgPSB0aGlzLl9jb2xsZWN0SW5qZWN0aW9ucygpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5faW5qZWN0aW9ucztcbiAgfVxuICByZWdpc3RlclJ1bGUoZmFjdG9yeSkge1xuICAgIGNvbnN0IGlkID0gKyt0aGlzLl9sYXN0UnVsZUlkO1xuICAgIGNvbnN0IHJlc3VsdCA9IGZhY3RvcnkocnVsZUlkRnJvbU51bWJlcihpZCkpO1xuICAgIHRoaXMuX3J1bGVJZDJkZXNjW2lkXSA9IHJlc3VsdDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIGdldFJ1bGUocnVsZUlkKSB7XG4gICAgcmV0dXJuIHRoaXMuX3J1bGVJZDJkZXNjW3J1bGVJZFRvTnVtYmVyKHJ1bGVJZCldO1xuICB9XG4gIGdldEV4dGVybmFsR3JhbW1hcihzY29wZU5hbWUsIHJlcG9zaXRvcnkpIHtcbiAgICBpZiAodGhpcy5faW5jbHVkZWRHcmFtbWFyc1tzY29wZU5hbWVdKSB7XG4gICAgICByZXR1cm4gdGhpcy5faW5jbHVkZWRHcmFtbWFyc1tzY29wZU5hbWVdO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fZ3JhbW1hclJlcG9zaXRvcnkpIHtcbiAgICAgIGNvbnN0IHJhd0luY2x1ZGVkR3JhbW1hciA9IHRoaXMuX2dyYW1tYXJSZXBvc2l0b3J5Lmxvb2t1cChzY29wZU5hbWUpO1xuICAgICAgaWYgKHJhd0luY2x1ZGVkR3JhbW1hcikge1xuICAgICAgICB0aGlzLl9pbmNsdWRlZEdyYW1tYXJzW3Njb3BlTmFtZV0gPSBpbml0R3JhbW1hcihcbiAgICAgICAgICByYXdJbmNsdWRlZEdyYW1tYXIsXG4gICAgICAgICAgcmVwb3NpdG9yeSAmJiByZXBvc2l0b3J5LiRiYXNlXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbmNsdWRlZEdyYW1tYXJzW3Njb3BlTmFtZV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB2b2lkIDA7XG4gIH1cbiAgdG9rZW5pemVMaW5lKGxpbmVUZXh0LCBwcmV2U3RhdGUsIHRpbWVMaW1pdCA9IDApIHtcbiAgICBjb25zdCByID0gdGhpcy5fdG9rZW5pemUobGluZVRleHQsIHByZXZTdGF0ZSwgZmFsc2UsIHRpbWVMaW1pdCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRva2Vuczogci5saW5lVG9rZW5zLmdldFJlc3VsdChyLnJ1bGVTdGFjaywgci5saW5lTGVuZ3RoKSxcbiAgICAgIHJ1bGVTdGFjazogci5ydWxlU3RhY2ssXG4gICAgICBzdG9wcGVkRWFybHk6IHIuc3RvcHBlZEVhcmx5XG4gICAgfTtcbiAgfVxuICB0b2tlbml6ZUxpbmUyKGxpbmVUZXh0LCBwcmV2U3RhdGUsIHRpbWVMaW1pdCA9IDApIHtcbiAgICBjb25zdCByID0gdGhpcy5fdG9rZW5pemUobGluZVRleHQsIHByZXZTdGF0ZSwgdHJ1ZSwgdGltZUxpbWl0KTtcbiAgICByZXR1cm4ge1xuICAgICAgdG9rZW5zOiByLmxpbmVUb2tlbnMuZ2V0QmluYXJ5UmVzdWx0KHIucnVsZVN0YWNrLCByLmxpbmVMZW5ndGgpLFxuICAgICAgcnVsZVN0YWNrOiByLnJ1bGVTdGFjayxcbiAgICAgIHN0b3BwZWRFYXJseTogci5zdG9wcGVkRWFybHlcbiAgICB9O1xuICB9XG4gIF90b2tlbml6ZShsaW5lVGV4dCwgcHJldlN0YXRlLCBlbWl0QmluYXJ5VG9rZW5zLCB0aW1lTGltaXQpIHtcbiAgICBpZiAodGhpcy5fcm9vdElkID09PSAtMSkge1xuICAgICAgdGhpcy5fcm9vdElkID0gUnVsZUZhY3RvcnkuZ2V0Q29tcGlsZWRSdWxlSWQoXG4gICAgICAgIHRoaXMuX2dyYW1tYXIucmVwb3NpdG9yeS4kc2VsZixcbiAgICAgICAgdGhpcyxcbiAgICAgICAgdGhpcy5fZ3JhbW1hci5yZXBvc2l0b3J5XG4gICAgICApO1xuICAgICAgdGhpcy5nZXRJbmplY3Rpb25zKCk7XG4gICAgfVxuICAgIGxldCBpc0ZpcnN0TGluZTtcbiAgICBpZiAoIXByZXZTdGF0ZSB8fCBwcmV2U3RhdGUgPT09IFN0YXRlU3RhY2tJbXBsLk5VTEwpIHtcbiAgICAgIGlzRmlyc3RMaW5lID0gdHJ1ZTtcbiAgICAgIGNvbnN0IHJhd0RlZmF1bHRNZXRhZGF0YSA9IHRoaXMuX2Jhc2ljU2NvcGVBdHRyaWJ1dGVzUHJvdmlkZXIuZ2V0RGVmYXVsdEF0dHJpYnV0ZXMoKTtcbiAgICAgIGNvbnN0IGRlZmF1bHRTdHlsZSA9IHRoaXMudGhlbWVQcm92aWRlci5nZXREZWZhdWx0cygpO1xuICAgICAgY29uc3QgZGVmYXVsdE1ldGFkYXRhID0gRW5jb2RlZFRva2VuTWV0YWRhdGEuc2V0KFxuICAgICAgICAwLFxuICAgICAgICByYXdEZWZhdWx0TWV0YWRhdGEubGFuZ3VhZ2VJZCxcbiAgICAgICAgcmF3RGVmYXVsdE1ldGFkYXRhLnRva2VuVHlwZSxcbiAgICAgICAgbnVsbCxcbiAgICAgICAgZGVmYXVsdFN0eWxlLmZvbnRTdHlsZSxcbiAgICAgICAgZGVmYXVsdFN0eWxlLmZvcmVncm91bmRJZCxcbiAgICAgICAgZGVmYXVsdFN0eWxlLmJhY2tncm91bmRJZFxuICAgICAgKTtcbiAgICAgIGNvbnN0IHJvb3RTY29wZU5hbWUgPSB0aGlzLmdldFJ1bGUodGhpcy5fcm9vdElkKS5nZXROYW1lKFxuICAgICAgICBudWxsLFxuICAgICAgICBudWxsXG4gICAgICApO1xuICAgICAgbGV0IHNjb3BlTGlzdDtcbiAgICAgIGlmIChyb290U2NvcGVOYW1lKSB7XG4gICAgICAgIHNjb3BlTGlzdCA9IEF0dHJpYnV0ZWRTY29wZVN0YWNrLmNyZWF0ZVJvb3RBbmRMb29rVXBTY29wZU5hbWUoXG4gICAgICAgICAgcm9vdFNjb3BlTmFtZSxcbiAgICAgICAgICBkZWZhdWx0TWV0YWRhdGEsXG4gICAgICAgICAgdGhpc1xuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2NvcGVMaXN0ID0gQXR0cmlidXRlZFNjb3BlU3RhY2suY3JlYXRlUm9vdChcbiAgICAgICAgICBcInVua25vd25cIixcbiAgICAgICAgICBkZWZhdWx0TWV0YWRhdGFcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHByZXZTdGF0ZSA9IG5ldyBTdGF0ZVN0YWNrSW1wbChcbiAgICAgICAgbnVsbCxcbiAgICAgICAgdGhpcy5fcm9vdElkLFxuICAgICAgICAtMSxcbiAgICAgICAgLTEsXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBudWxsLFxuICAgICAgICBzY29wZUxpc3QsXG4gICAgICAgIHNjb3BlTGlzdFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaXNGaXJzdExpbmUgPSBmYWxzZTtcbiAgICAgIHByZXZTdGF0ZS5yZXNldCgpO1xuICAgIH1cbiAgICBsaW5lVGV4dCA9IGxpbmVUZXh0ICsgXCJcXG5cIjtcbiAgICBjb25zdCBvbmlnTGluZVRleHQgPSB0aGlzLmNyZWF0ZU9uaWdTdHJpbmcobGluZVRleHQpO1xuICAgIGNvbnN0IGxpbmVMZW5ndGggPSBvbmlnTGluZVRleHQuY29udGVudC5sZW5ndGg7XG4gICAgY29uc3QgbGluZVRva2VucyA9IG5ldyBMaW5lVG9rZW5zKFxuICAgICAgZW1pdEJpbmFyeVRva2VucyxcbiAgICAgIGxpbmVUZXh0LFxuICAgICAgdGhpcy5fdG9rZW5UeXBlTWF0Y2hlcnMsXG4gICAgICB0aGlzLmJhbGFuY2VkQnJhY2tldFNlbGVjdG9yc1xuICAgICk7XG4gICAgY29uc3QgciA9IF90b2tlbml6ZVN0cmluZyhcbiAgICAgIHRoaXMsXG4gICAgICBvbmlnTGluZVRleHQsXG4gICAgICBpc0ZpcnN0TGluZSxcbiAgICAgIDAsXG4gICAgICBwcmV2U3RhdGUsXG4gICAgICBsaW5lVG9rZW5zLFxuICAgICAgdHJ1ZSxcbiAgICAgIHRpbWVMaW1pdFxuICAgICk7XG4gICAgZGlzcG9zZU9uaWdTdHJpbmcob25pZ0xpbmVUZXh0KTtcbiAgICByZXR1cm4ge1xuICAgICAgbGluZUxlbmd0aCxcbiAgICAgIGxpbmVUb2tlbnMsXG4gICAgICBydWxlU3RhY2s6IHIuc3RhY2ssXG4gICAgICBzdG9wcGVkRWFybHk6IHIuc3RvcHBlZEVhcmx5XG4gICAgfTtcbiAgfVxufTtcbmZ1bmN0aW9uIGluaXRHcmFtbWFyKGdyYW1tYXIsIGJhc2UpIHtcbiAgZ3JhbW1hciA9IGNsb25lKGdyYW1tYXIpO1xuICBncmFtbWFyLnJlcG9zaXRvcnkgPSBncmFtbWFyLnJlcG9zaXRvcnkgfHwge307XG4gIGdyYW1tYXIucmVwb3NpdG9yeS4kc2VsZiA9IHtcbiAgICAkdnNjb2RlVGV4dG1hdGVMb2NhdGlvbjogZ3JhbW1hci4kdnNjb2RlVGV4dG1hdGVMb2NhdGlvbixcbiAgICBwYXR0ZXJuczogZ3JhbW1hci5wYXR0ZXJucyxcbiAgICBuYW1lOiBncmFtbWFyLnNjb3BlTmFtZVxuICB9O1xuICBncmFtbWFyLnJlcG9zaXRvcnkuJGJhc2UgPSBiYXNlIHx8IGdyYW1tYXIucmVwb3NpdG9yeS4kc2VsZjtcbiAgcmV0dXJuIGdyYW1tYXI7XG59XG52YXIgQXR0cmlidXRlZFNjb3BlU3RhY2sgPSBjbGFzcyBfQXR0cmlidXRlZFNjb3BlU3RhY2sge1xuICAvKipcbiAgICogSW52YXJpYW50OlxuICAgKiBgYGBcbiAgICogaWYgKHBhcmVudCAmJiAhc2NvcGVQYXRoLmV4dGVuZHMocGFyZW50LnNjb3BlUGF0aCkpIHtcbiAgICogXHR0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICogfVxuICAgKiBgYGBcbiAgICovXG4gIGNvbnN0cnVjdG9yKHBhcmVudCwgc2NvcGVQYXRoLCB0b2tlbkF0dHJpYnV0ZXMpIHtcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLnNjb3BlUGF0aCA9IHNjb3BlUGF0aDtcbiAgICB0aGlzLnRva2VuQXR0cmlidXRlcyA9IHRva2VuQXR0cmlidXRlcztcbiAgfVxuICBzdGF0aWMgZnJvbUV4dGVuc2lvbihuYW1lc1Njb3BlTGlzdCwgY29udGVudE5hbWVTY29wZXNMaXN0KSB7XG4gICAgbGV0IGN1cnJlbnQgPSBuYW1lc1Njb3BlTGlzdDtcbiAgICBsZXQgc2NvcGVOYW1lcyA9IG5hbWVzU2NvcGVMaXN0Py5zY29wZVBhdGggPz8gbnVsbDtcbiAgICBmb3IgKGNvbnN0IGZyYW1lIG9mIGNvbnRlbnROYW1lU2NvcGVzTGlzdCkge1xuICAgICAgc2NvcGVOYW1lcyA9IFNjb3BlU3RhY2sucHVzaChzY29wZU5hbWVzLCBmcmFtZS5zY29wZU5hbWVzKTtcbiAgICAgIGN1cnJlbnQgPSBuZXcgX0F0dHJpYnV0ZWRTY29wZVN0YWNrKGN1cnJlbnQsIHNjb3BlTmFtZXMsIGZyYW1lLmVuY29kZWRUb2tlbkF0dHJpYnV0ZXMpO1xuICAgIH1cbiAgICByZXR1cm4gY3VycmVudDtcbiAgfVxuICBzdGF0aWMgY3JlYXRlUm9vdChzY29wZU5hbWUsIHRva2VuQXR0cmlidXRlcykge1xuICAgIHJldHVybiBuZXcgX0F0dHJpYnV0ZWRTY29wZVN0YWNrKG51bGwsIG5ldyBTY29wZVN0YWNrKG51bGwsIHNjb3BlTmFtZSksIHRva2VuQXR0cmlidXRlcyk7XG4gIH1cbiAgc3RhdGljIGNyZWF0ZVJvb3RBbmRMb29rVXBTY29wZU5hbWUoc2NvcGVOYW1lLCB0b2tlbkF0dHJpYnV0ZXMsIGdyYW1tYXIpIHtcbiAgICBjb25zdCByYXdSb290TWV0YWRhdGEgPSBncmFtbWFyLmdldE1ldGFkYXRhRm9yU2NvcGUoc2NvcGVOYW1lKTtcbiAgICBjb25zdCBzY29wZVBhdGggPSBuZXcgU2NvcGVTdGFjayhudWxsLCBzY29wZU5hbWUpO1xuICAgIGNvbnN0IHJvb3RTdHlsZSA9IGdyYW1tYXIudGhlbWVQcm92aWRlci50aGVtZU1hdGNoKHNjb3BlUGF0aCk7XG4gICAgY29uc3QgcmVzb2x2ZWRUb2tlbkF0dHJpYnV0ZXMgPSBfQXR0cmlidXRlZFNjb3BlU3RhY2subWVyZ2VBdHRyaWJ1dGVzKFxuICAgICAgdG9rZW5BdHRyaWJ1dGVzLFxuICAgICAgcmF3Um9vdE1ldGFkYXRhLFxuICAgICAgcm9vdFN0eWxlXG4gICAgKTtcbiAgICByZXR1cm4gbmV3IF9BdHRyaWJ1dGVkU2NvcGVTdGFjayhudWxsLCBzY29wZVBhdGgsIHJlc29sdmVkVG9rZW5BdHRyaWJ1dGVzKTtcbiAgfVxuICBnZXQgc2NvcGVOYW1lKCkge1xuICAgIHJldHVybiB0aGlzLnNjb3BlUGF0aC5zY29wZU5hbWU7XG4gIH1cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U2NvcGVOYW1lcygpLmpvaW4oXCIgXCIpO1xuICB9XG4gIGVxdWFscyhvdGhlcikge1xuICAgIHJldHVybiBfQXR0cmlidXRlZFNjb3BlU3RhY2suZXF1YWxzKHRoaXMsIG90aGVyKTtcbiAgfVxuICBzdGF0aWMgZXF1YWxzKGEsIGIpIHtcbiAgICBkbyB7XG4gICAgICBpZiAoYSA9PT0gYikge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmICghYSAmJiAhYikge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmICghYSB8fCAhYikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoYS5zY29wZU5hbWUgIT09IGIuc2NvcGVOYW1lIHx8IGEudG9rZW5BdHRyaWJ1dGVzICE9PSBiLnRva2VuQXR0cmlidXRlcykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBhID0gYS5wYXJlbnQ7XG4gICAgICBiID0gYi5wYXJlbnQ7XG4gICAgfSB3aGlsZSAodHJ1ZSk7XG4gIH1cbiAgc3RhdGljIG1lcmdlQXR0cmlidXRlcyhleGlzdGluZ1Rva2VuQXR0cmlidXRlcywgYmFzaWNTY29wZUF0dHJpYnV0ZXMsIHN0eWxlQXR0cmlidXRlcykge1xuICAgIGxldCBmb250U3R5bGUgPSAtMSAvKiBOb3RTZXQgKi87XG4gICAgbGV0IGZvcmVncm91bmQgPSAwO1xuICAgIGxldCBiYWNrZ3JvdW5kID0gMDtcbiAgICBpZiAoc3R5bGVBdHRyaWJ1dGVzICE9PSBudWxsKSB7XG4gICAgICBmb250U3R5bGUgPSBzdHlsZUF0dHJpYnV0ZXMuZm9udFN0eWxlO1xuICAgICAgZm9yZWdyb3VuZCA9IHN0eWxlQXR0cmlidXRlcy5mb3JlZ3JvdW5kSWQ7XG4gICAgICBiYWNrZ3JvdW5kID0gc3R5bGVBdHRyaWJ1dGVzLmJhY2tncm91bmRJZDtcbiAgICB9XG4gICAgcmV0dXJuIEVuY29kZWRUb2tlbk1ldGFkYXRhLnNldChcbiAgICAgIGV4aXN0aW5nVG9rZW5BdHRyaWJ1dGVzLFxuICAgICAgYmFzaWNTY29wZUF0dHJpYnV0ZXMubGFuZ3VhZ2VJZCxcbiAgICAgIGJhc2ljU2NvcGVBdHRyaWJ1dGVzLnRva2VuVHlwZSxcbiAgICAgIG51bGwsXG4gICAgICBmb250U3R5bGUsXG4gICAgICBmb3JlZ3JvdW5kLFxuICAgICAgYmFja2dyb3VuZFxuICAgICk7XG4gIH1cbiAgcHVzaEF0dHJpYnV0ZWQoc2NvcGVQYXRoLCBncmFtbWFyKSB7XG4gICAgaWYgKHNjb3BlUGF0aCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGlmIChzY29wZVBhdGguaW5kZXhPZihcIiBcIikgPT09IC0xKSB7XG4gICAgICByZXR1cm4gX0F0dHJpYnV0ZWRTY29wZVN0YWNrLl9wdXNoQXR0cmlidXRlZCh0aGlzLCBzY29wZVBhdGgsIGdyYW1tYXIpO1xuICAgIH1cbiAgICBjb25zdCBzY29wZXMgPSBzY29wZVBhdGguc3BsaXQoLyAvZyk7XG4gICAgbGV0IHJlc3VsdCA9IHRoaXM7XG4gICAgZm9yIChjb25zdCBzY29wZSBvZiBzY29wZXMpIHtcbiAgICAgIHJlc3VsdCA9IF9BdHRyaWJ1dGVkU2NvcGVTdGFjay5fcHVzaEF0dHJpYnV0ZWQocmVzdWx0LCBzY29wZSwgZ3JhbW1hcik7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgc3RhdGljIF9wdXNoQXR0cmlidXRlZCh0YXJnZXQsIHNjb3BlTmFtZSwgZ3JhbW1hcikge1xuICAgIGNvbnN0IHJhd01ldGFkYXRhID0gZ3JhbW1hci5nZXRNZXRhZGF0YUZvclNjb3BlKHNjb3BlTmFtZSk7XG4gICAgY29uc3QgbmV3UGF0aCA9IHRhcmdldC5zY29wZVBhdGgucHVzaChzY29wZU5hbWUpO1xuICAgIGNvbnN0IHNjb3BlVGhlbWVNYXRjaFJlc3VsdCA9IGdyYW1tYXIudGhlbWVQcm92aWRlci50aGVtZU1hdGNoKG5ld1BhdGgpO1xuICAgIGNvbnN0IG1ldGFkYXRhID0gX0F0dHJpYnV0ZWRTY29wZVN0YWNrLm1lcmdlQXR0cmlidXRlcyhcbiAgICAgIHRhcmdldC50b2tlbkF0dHJpYnV0ZXMsXG4gICAgICByYXdNZXRhZGF0YSxcbiAgICAgIHNjb3BlVGhlbWVNYXRjaFJlc3VsdFxuICAgICk7XG4gICAgcmV0dXJuIG5ldyBfQXR0cmlidXRlZFNjb3BlU3RhY2sodGFyZ2V0LCBuZXdQYXRoLCBtZXRhZGF0YSk7XG4gIH1cbiAgZ2V0U2NvcGVOYW1lcygpIHtcbiAgICByZXR1cm4gdGhpcy5zY29wZVBhdGguZ2V0U2VnbWVudHMoKTtcbiAgfVxuICBnZXRFeHRlbnNpb25JZkRlZmluZWQoYmFzZSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICB3aGlsZSAoc2VsZiAmJiBzZWxmICE9PSBiYXNlKSB7XG4gICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgIGVuY29kZWRUb2tlbkF0dHJpYnV0ZXM6IHNlbGYudG9rZW5BdHRyaWJ1dGVzLFxuICAgICAgICBzY29wZU5hbWVzOiBzZWxmLnNjb3BlUGF0aC5nZXRFeHRlbnNpb25JZkRlZmluZWQoc2VsZi5wYXJlbnQ/LnNjb3BlUGF0aCA/PyBudWxsKVxuICAgICAgfSk7XG4gICAgICBzZWxmID0gc2VsZi5wYXJlbnQ7XG4gICAgfVxuICAgIHJldHVybiBzZWxmID09PSBiYXNlID8gcmVzdWx0LnJldmVyc2UoKSA6IHZvaWQgMDtcbiAgfVxufTtcbnZhciBTdGF0ZVN0YWNrSW1wbCA9IGNsYXNzIF9TdGF0ZVN0YWNrSW1wbCB7XG4gIC8qKlxuICAgKiBJbnZhcmlhbnQ6XG4gICAqIGBgYFxuICAgKiBpZiAoY29udGVudE5hbWVTY29wZXNMaXN0ICE9PSBuYW1lU2NvcGVzTGlzdCAmJiBjb250ZW50TmFtZVNjb3Blc0xpc3Q/LnBhcmVudCAhPT0gbmFtZVNjb3Blc0xpc3QpIHtcbiAgICogXHR0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICogfVxuICAgKiBpZiAodGhpcy5wYXJlbnQgJiYgIW5hbWVTY29wZXNMaXN0LmV4dGVuZHModGhpcy5wYXJlbnQuY29udGVudE5hbWVTY29wZXNMaXN0KSkge1xuICAgKiBcdHRocm93IG5ldyBFcnJvcigpO1xuICAgKiB9XG4gICAqIGBgYFxuICAgKi9cbiAgY29uc3RydWN0b3IocGFyZW50LCBydWxlSWQsIGVudGVyUG9zLCBhbmNob3JQb3MsIGJlZ2luUnVsZUNhcHR1cmVkRU9MLCBlbmRSdWxlLCBuYW1lU2NvcGVzTGlzdCwgY29udGVudE5hbWVTY29wZXNMaXN0KSB7XG4gICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgdGhpcy5ydWxlSWQgPSBydWxlSWQ7XG4gICAgdGhpcy5iZWdpblJ1bGVDYXB0dXJlZEVPTCA9IGJlZ2luUnVsZUNhcHR1cmVkRU9MO1xuICAgIHRoaXMuZW5kUnVsZSA9IGVuZFJ1bGU7XG4gICAgdGhpcy5uYW1lU2NvcGVzTGlzdCA9IG5hbWVTY29wZXNMaXN0O1xuICAgIHRoaXMuY29udGVudE5hbWVTY29wZXNMaXN0ID0gY29udGVudE5hbWVTY29wZXNMaXN0O1xuICAgIHRoaXMuZGVwdGggPSB0aGlzLnBhcmVudCA/IHRoaXMucGFyZW50LmRlcHRoICsgMSA6IDE7XG4gICAgdGhpcy5fZW50ZXJQb3MgPSBlbnRlclBvcztcbiAgICB0aGlzLl9hbmNob3JQb3MgPSBhbmNob3JQb3M7XG4gIH1cbiAgX3N0YWNrRWxlbWVudEJyYW5kID0gdm9pZCAwO1xuICAvLyBUT0RPIHJlbW92ZSBtZVxuICBzdGF0aWMgTlVMTCA9IG5ldyBfU3RhdGVTdGFja0ltcGwoXG4gICAgbnVsbCxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICBmYWxzZSxcbiAgICBudWxsLFxuICAgIG51bGwsXG4gICAgbnVsbFxuICApO1xuICAvKipcbiAgICogVGhlIHBvc2l0aW9uIG9uIHRoZSBjdXJyZW50IGxpbmUgd2hlcmUgdGhpcyBzdGF0ZSB3YXMgcHVzaGVkLlxuICAgKiBUaGlzIGlzIHJlbGV2YW50IG9ubHkgd2hpbGUgdG9rZW5pemluZyBhIGxpbmUsIHRvIGRldGVjdCBlbmRsZXNzIGxvb3BzLlxuICAgKiBJdHMgdmFsdWUgaXMgbWVhbmluZ2xlc3MgYWNyb3NzIGxpbmVzLlxuICAgKi9cbiAgX2VudGVyUG9zO1xuICAvKipcbiAgICogVGhlIGNhcHR1cmVkIGFuY2hvciBwb3NpdGlvbiB3aGVuIHRoaXMgc3RhY2sgZWxlbWVudCB3YXMgcHVzaGVkLlxuICAgKiBUaGlzIGlzIHJlbGV2YW50IG9ubHkgd2hpbGUgdG9rZW5pemluZyBhIGxpbmUsIHRvIHJlc3RvcmUgdGhlIGFuY2hvciBwb3NpdGlvbiB3aGVuIHBvcHBpbmcuXG4gICAqIEl0cyB2YWx1ZSBpcyBtZWFuaW5nbGVzcyBhY3Jvc3MgbGluZXMuXG4gICAqL1xuICBfYW5jaG9yUG9zO1xuICAvKipcbiAgICogVGhlIGRlcHRoIG9mIHRoZSBzdGFjay5cbiAgICovXG4gIGRlcHRoO1xuICBlcXVhbHMob3RoZXIpIHtcbiAgICBpZiAob3RoZXIgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIF9TdGF0ZVN0YWNrSW1wbC5fZXF1YWxzKHRoaXMsIG90aGVyKTtcbiAgfVxuICBzdGF0aWMgX2VxdWFscyhhLCBiKSB7XG4gICAgaWYgKGEgPT09IGIpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuX3N0cnVjdHVyYWxFcXVhbHMoYSwgYikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIEF0dHJpYnV0ZWRTY29wZVN0YWNrLmVxdWFscyhhLmNvbnRlbnROYW1lU2NvcGVzTGlzdCwgYi5jb250ZW50TmFtZVNjb3Blc0xpc3QpO1xuICB9XG4gIC8qKlxuICAgKiBBIHN0cnVjdHVyYWwgZXF1YWxzIGNoZWNrLiBEb2VzIG5vdCB0YWtlIGludG8gYWNjb3VudCBgc2NvcGVzYC5cbiAgICovXG4gIHN0YXRpYyBfc3RydWN0dXJhbEVxdWFscyhhLCBiKSB7XG4gICAgZG8ge1xuICAgICAgaWYgKGEgPT09IGIpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBpZiAoIWEgJiYgIWIpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBpZiAoIWEgfHwgIWIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKGEuZGVwdGggIT09IGIuZGVwdGggfHwgYS5ydWxlSWQgIT09IGIucnVsZUlkIHx8IGEuZW5kUnVsZSAhPT0gYi5lbmRSdWxlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGEgPSBhLnBhcmVudDtcbiAgICAgIGIgPSBiLnBhcmVudDtcbiAgICB9IHdoaWxlICh0cnVlKTtcbiAgfVxuICBjbG9uZSgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBzdGF0aWMgX3Jlc2V0KGVsKSB7XG4gICAgd2hpbGUgKGVsKSB7XG4gICAgICBlbC5fZW50ZXJQb3MgPSAtMTtcbiAgICAgIGVsLl9hbmNob3JQb3MgPSAtMTtcbiAgICAgIGVsID0gZWwucGFyZW50O1xuICAgIH1cbiAgfVxuICByZXNldCgpIHtcbiAgICBfU3RhdGVTdGFja0ltcGwuX3Jlc2V0KHRoaXMpO1xuICB9XG4gIHBvcCgpIHtcbiAgICByZXR1cm4gdGhpcy5wYXJlbnQ7XG4gIH1cbiAgc2FmZVBvcCgpIHtcbiAgICBpZiAodGhpcy5wYXJlbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhcmVudDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgcHVzaChydWxlSWQsIGVudGVyUG9zLCBhbmNob3JQb3MsIGJlZ2luUnVsZUNhcHR1cmVkRU9MLCBlbmRSdWxlLCBuYW1lU2NvcGVzTGlzdCwgY29udGVudE5hbWVTY29wZXNMaXN0KSB7XG4gICAgcmV0dXJuIG5ldyBfU3RhdGVTdGFja0ltcGwoXG4gICAgICB0aGlzLFxuICAgICAgcnVsZUlkLFxuICAgICAgZW50ZXJQb3MsXG4gICAgICBhbmNob3JQb3MsXG4gICAgICBiZWdpblJ1bGVDYXB0dXJlZEVPTCxcbiAgICAgIGVuZFJ1bGUsXG4gICAgICBuYW1lU2NvcGVzTGlzdCxcbiAgICAgIGNvbnRlbnROYW1lU2NvcGVzTGlzdFxuICAgICk7XG4gIH1cbiAgZ2V0RW50ZXJQb3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VudGVyUG9zO1xuICB9XG4gIGdldEFuY2hvclBvcygpIHtcbiAgICByZXR1cm4gdGhpcy5fYW5jaG9yUG9zO1xuICB9XG4gIGdldFJ1bGUoZ3JhbW1hcikge1xuICAgIHJldHVybiBncmFtbWFyLmdldFJ1bGUodGhpcy5ydWxlSWQpO1xuICB9XG4gIHRvU3RyaW5nKCkge1xuICAgIGNvbnN0IHIgPSBbXTtcbiAgICB0aGlzLl93cml0ZVN0cmluZyhyLCAwKTtcbiAgICByZXR1cm4gXCJbXCIgKyByLmpvaW4oXCIsXCIpICsgXCJdXCI7XG4gIH1cbiAgX3dyaXRlU3RyaW5nKHJlcywgb3V0SW5kZXgpIHtcbiAgICBpZiAodGhpcy5wYXJlbnQpIHtcbiAgICAgIG91dEluZGV4ID0gdGhpcy5wYXJlbnQuX3dyaXRlU3RyaW5nKHJlcywgb3V0SW5kZXgpO1xuICAgIH1cbiAgICByZXNbb3V0SW5kZXgrK10gPSBgKCR7dGhpcy5ydWxlSWR9LCAke3RoaXMubmFtZVNjb3Blc0xpc3Q/LnRvU3RyaW5nKCl9LCAke3RoaXMuY29udGVudE5hbWVTY29wZXNMaXN0Py50b1N0cmluZygpfSlgO1xuICAgIHJldHVybiBvdXRJbmRleDtcbiAgfVxuICB3aXRoQ29udGVudE5hbWVTY29wZXNMaXN0KGNvbnRlbnROYW1lU2NvcGVTdGFjaykge1xuICAgIGlmICh0aGlzLmNvbnRlbnROYW1lU2NvcGVzTGlzdCA9PT0gY29udGVudE5hbWVTY29wZVN0YWNrKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucGFyZW50LnB1c2goXG4gICAgICB0aGlzLnJ1bGVJZCxcbiAgICAgIHRoaXMuX2VudGVyUG9zLFxuICAgICAgdGhpcy5fYW5jaG9yUG9zLFxuICAgICAgdGhpcy5iZWdpblJ1bGVDYXB0dXJlZEVPTCxcbiAgICAgIHRoaXMuZW5kUnVsZSxcbiAgICAgIHRoaXMubmFtZVNjb3Blc0xpc3QsXG4gICAgICBjb250ZW50TmFtZVNjb3BlU3RhY2tcbiAgICApO1xuICB9XG4gIHdpdGhFbmRSdWxlKGVuZFJ1bGUpIHtcbiAgICBpZiAodGhpcy5lbmRSdWxlID09PSBlbmRSdWxlKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBfU3RhdGVTdGFja0ltcGwoXG4gICAgICB0aGlzLnBhcmVudCxcbiAgICAgIHRoaXMucnVsZUlkLFxuICAgICAgdGhpcy5fZW50ZXJQb3MsXG4gICAgICB0aGlzLl9hbmNob3JQb3MsXG4gICAgICB0aGlzLmJlZ2luUnVsZUNhcHR1cmVkRU9MLFxuICAgICAgZW5kUnVsZSxcbiAgICAgIHRoaXMubmFtZVNjb3Blc0xpc3QsXG4gICAgICB0aGlzLmNvbnRlbnROYW1lU2NvcGVzTGlzdFxuICAgICk7XG4gIH1cbiAgLy8gVXNlZCB0byB3YXJuIG9mIGVuZGxlc3MgbG9vcHNcbiAgaGFzU2FtZVJ1bGVBcyhvdGhlcikge1xuICAgIGxldCBlbCA9IHRoaXM7XG4gICAgd2hpbGUgKGVsICYmIGVsLl9lbnRlclBvcyA9PT0gb3RoZXIuX2VudGVyUG9zKSB7XG4gICAgICBpZiAoZWwucnVsZUlkID09PSBvdGhlci5ydWxlSWQpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBlbCA9IGVsLnBhcmVudDtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHRvU3RhdGVTdGFja0ZyYW1lKCkge1xuICAgIHJldHVybiB7XG4gICAgICBydWxlSWQ6IHJ1bGVJZFRvTnVtYmVyKHRoaXMucnVsZUlkKSxcbiAgICAgIGJlZ2luUnVsZUNhcHR1cmVkRU9MOiB0aGlzLmJlZ2luUnVsZUNhcHR1cmVkRU9MLFxuICAgICAgZW5kUnVsZTogdGhpcy5lbmRSdWxlLFxuICAgICAgbmFtZVNjb3Blc0xpc3Q6IHRoaXMubmFtZVNjb3Blc0xpc3Q/LmdldEV4dGVuc2lvbklmRGVmaW5lZCh0aGlzLnBhcmVudD8ubmFtZVNjb3Blc0xpc3QgPz8gbnVsbCkgPz8gW10sXG4gICAgICBjb250ZW50TmFtZVNjb3Blc0xpc3Q6IHRoaXMuY29udGVudE5hbWVTY29wZXNMaXN0Py5nZXRFeHRlbnNpb25JZkRlZmluZWQodGhpcy5uYW1lU2NvcGVzTGlzdCkgPz8gW11cbiAgICB9O1xuICB9XG4gIHN0YXRpYyBwdXNoRnJhbWUoc2VsZiwgZnJhbWUpIHtcbiAgICBjb25zdCBuYW1lc1Njb3BlTGlzdCA9IEF0dHJpYnV0ZWRTY29wZVN0YWNrLmZyb21FeHRlbnNpb24oc2VsZj8ubmFtZVNjb3Blc0xpc3QgPz8gbnVsbCwgZnJhbWUubmFtZVNjb3Blc0xpc3QpO1xuICAgIHJldHVybiBuZXcgX1N0YXRlU3RhY2tJbXBsKFxuICAgICAgc2VsZixcbiAgICAgIHJ1bGVJZEZyb21OdW1iZXIoZnJhbWUucnVsZUlkKSxcbiAgICAgIGZyYW1lLmVudGVyUG9zID8/IC0xLFxuICAgICAgZnJhbWUuYW5jaG9yUG9zID8/IC0xLFxuICAgICAgZnJhbWUuYmVnaW5SdWxlQ2FwdHVyZWRFT0wsXG4gICAgICBmcmFtZS5lbmRSdWxlLFxuICAgICAgbmFtZXNTY29wZUxpc3QsXG4gICAgICBBdHRyaWJ1dGVkU2NvcGVTdGFjay5mcm9tRXh0ZW5zaW9uKG5hbWVzU2NvcGVMaXN0LCBmcmFtZS5jb250ZW50TmFtZVNjb3Blc0xpc3QpXG4gICAgKTtcbiAgfVxufTtcbnZhciBCYWxhbmNlZEJyYWNrZXRTZWxlY3RvcnMgPSBjbGFzcyB7XG4gIGJhbGFuY2VkQnJhY2tldFNjb3BlcztcbiAgdW5iYWxhbmNlZEJyYWNrZXRTY29wZXM7XG4gIGFsbG93QW55ID0gZmFsc2U7XG4gIGNvbnN0cnVjdG9yKGJhbGFuY2VkQnJhY2tldFNjb3BlcywgdW5iYWxhbmNlZEJyYWNrZXRTY29wZXMpIHtcbiAgICB0aGlzLmJhbGFuY2VkQnJhY2tldFNjb3BlcyA9IGJhbGFuY2VkQnJhY2tldFNjb3Blcy5mbGF0TWFwKFxuICAgICAgKHNlbGVjdG9yKSA9PiB7XG4gICAgICAgIGlmIChzZWxlY3RvciA9PT0gXCIqXCIpIHtcbiAgICAgICAgICB0aGlzLmFsbG93QW55ID0gdHJ1ZTtcbiAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNyZWF0ZU1hdGNoZXJzKHNlbGVjdG9yLCBuYW1lTWF0Y2hlcikubWFwKChtKSA9PiBtLm1hdGNoZXIpO1xuICAgICAgfVxuICAgICk7XG4gICAgdGhpcy51bmJhbGFuY2VkQnJhY2tldFNjb3BlcyA9IHVuYmFsYW5jZWRCcmFja2V0U2NvcGVzLmZsYXRNYXAoXG4gICAgICAoc2VsZWN0b3IpID0+IGNyZWF0ZU1hdGNoZXJzKHNlbGVjdG9yLCBuYW1lTWF0Y2hlcikubWFwKChtKSA9PiBtLm1hdGNoZXIpXG4gICAgKTtcbiAgfVxuICBnZXQgbWF0Y2hlc0Fsd2F5cygpIHtcbiAgICByZXR1cm4gdGhpcy5hbGxvd0FueSAmJiB0aGlzLnVuYmFsYW5jZWRCcmFja2V0U2NvcGVzLmxlbmd0aCA9PT0gMDtcbiAgfVxuICBnZXQgbWF0Y2hlc05ldmVyKCkge1xuICAgIHJldHVybiB0aGlzLmJhbGFuY2VkQnJhY2tldFNjb3Blcy5sZW5ndGggPT09IDAgJiYgIXRoaXMuYWxsb3dBbnk7XG4gIH1cbiAgbWF0Y2goc2NvcGVzKSB7XG4gICAgZm9yIChjb25zdCBleGNsdWRlciBvZiB0aGlzLnVuYmFsYW5jZWRCcmFja2V0U2NvcGVzKSB7XG4gICAgICBpZiAoZXhjbHVkZXIoc2NvcGVzKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAoY29uc3QgaW5jbHVkZXIgb2YgdGhpcy5iYWxhbmNlZEJyYWNrZXRTY29wZXMpIHtcbiAgICAgIGlmIChpbmNsdWRlcihzY29wZXMpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5hbGxvd0FueTtcbiAgfVxufTtcbnZhciBMaW5lVG9rZW5zID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihlbWl0QmluYXJ5VG9rZW5zLCBsaW5lVGV4dCwgdG9rZW5UeXBlT3ZlcnJpZGVzLCBiYWxhbmNlZEJyYWNrZXRTZWxlY3RvcnMpIHtcbiAgICB0aGlzLmJhbGFuY2VkQnJhY2tldFNlbGVjdG9ycyA9IGJhbGFuY2VkQnJhY2tldFNlbGVjdG9ycztcbiAgICB0aGlzLl9lbWl0QmluYXJ5VG9rZW5zID0gZW1pdEJpbmFyeVRva2VucztcbiAgICB0aGlzLl90b2tlblR5cGVPdmVycmlkZXMgPSB0b2tlblR5cGVPdmVycmlkZXM7XG4gICAgaWYgKGZhbHNlKSB7XG4gICAgICB0aGlzLl9saW5lVGV4dCA9IGxpbmVUZXh0O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9saW5lVGV4dCA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuX3Rva2VucyA9IFtdO1xuICAgIHRoaXMuX2JpbmFyeVRva2VucyA9IFtdO1xuICAgIHRoaXMuX2xhc3RUb2tlbkVuZEluZGV4ID0gMDtcbiAgfVxuICBfZW1pdEJpbmFyeVRva2VucztcbiAgLyoqXG4gICAqIGRlZmluZWQgb25seSBpZiBgZmFsc2VgLlxuICAgKi9cbiAgX2xpbmVUZXh0O1xuICAvKipcbiAgICogdXNlZCBvbmx5IGlmIGBfZW1pdEJpbmFyeVRva2Vuc2AgaXMgZmFsc2UuXG4gICAqL1xuICBfdG9rZW5zO1xuICAvKipcbiAgICogdXNlZCBvbmx5IGlmIGBfZW1pdEJpbmFyeVRva2Vuc2AgaXMgdHJ1ZS5cbiAgICovXG4gIF9iaW5hcnlUb2tlbnM7XG4gIF9sYXN0VG9rZW5FbmRJbmRleDtcbiAgX3Rva2VuVHlwZU92ZXJyaWRlcztcbiAgcHJvZHVjZShzdGFjaywgZW5kSW5kZXgpIHtcbiAgICB0aGlzLnByb2R1Y2VGcm9tU2NvcGVzKHN0YWNrLmNvbnRlbnROYW1lU2NvcGVzTGlzdCwgZW5kSW5kZXgpO1xuICB9XG4gIHByb2R1Y2VGcm9tU2NvcGVzKHNjb3Blc0xpc3QsIGVuZEluZGV4KSB7XG4gICAgaWYgKHRoaXMuX2xhc3RUb2tlbkVuZEluZGV4ID49IGVuZEluZGV4KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLl9lbWl0QmluYXJ5VG9rZW5zKSB7XG4gICAgICBsZXQgbWV0YWRhdGEgPSBzY29wZXNMaXN0Py50b2tlbkF0dHJpYnV0ZXMgPz8gMDtcbiAgICAgIGxldCBjb250YWluc0JhbGFuY2VkQnJhY2tldHMgPSBmYWxzZTtcbiAgICAgIGlmICh0aGlzLmJhbGFuY2VkQnJhY2tldFNlbGVjdG9ycz8ubWF0Y2hlc0Fsd2F5cykge1xuICAgICAgICBjb250YWluc0JhbGFuY2VkQnJhY2tldHMgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX3Rva2VuVHlwZU92ZXJyaWRlcy5sZW5ndGggPiAwIHx8IHRoaXMuYmFsYW5jZWRCcmFja2V0U2VsZWN0b3JzICYmICF0aGlzLmJhbGFuY2VkQnJhY2tldFNlbGVjdG9ycy5tYXRjaGVzQWx3YXlzICYmICF0aGlzLmJhbGFuY2VkQnJhY2tldFNlbGVjdG9ycy5tYXRjaGVzTmV2ZXIpIHtcbiAgICAgICAgY29uc3Qgc2NvcGVzMiA9IHNjb3Blc0xpc3Q/LmdldFNjb3BlTmFtZXMoKSA/PyBbXTtcbiAgICAgICAgZm9yIChjb25zdCB0b2tlblR5cGUgb2YgdGhpcy5fdG9rZW5UeXBlT3ZlcnJpZGVzKSB7XG4gICAgICAgICAgaWYgKHRva2VuVHlwZS5tYXRjaGVyKHNjb3BlczIpKSB7XG4gICAgICAgICAgICBtZXRhZGF0YSA9IEVuY29kZWRUb2tlbk1ldGFkYXRhLnNldChcbiAgICAgICAgICAgICAgbWV0YWRhdGEsXG4gICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgIHRvT3B0aW9uYWxUb2tlblR5cGUodG9rZW5UeXBlLnR5cGUpLFxuICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAtMSAvKiBOb3RTZXQgKi8sXG4gICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgIDBcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmJhbGFuY2VkQnJhY2tldFNlbGVjdG9ycykge1xuICAgICAgICAgIGNvbnRhaW5zQmFsYW5jZWRCcmFja2V0cyA9IHRoaXMuYmFsYW5jZWRCcmFja2V0U2VsZWN0b3JzLm1hdGNoKHNjb3BlczIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoY29udGFpbnNCYWxhbmNlZEJyYWNrZXRzKSB7XG4gICAgICAgIG1ldGFkYXRhID0gRW5jb2RlZFRva2VuTWV0YWRhdGEuc2V0KFxuICAgICAgICAgIG1ldGFkYXRhLFxuICAgICAgICAgIDAsXG4gICAgICAgICAgOCAvKiBOb3RTZXQgKi8sXG4gICAgICAgICAgY29udGFpbnNCYWxhbmNlZEJyYWNrZXRzLFxuICAgICAgICAgIC0xIC8qIE5vdFNldCAqLyxcbiAgICAgICAgICAwLFxuICAgICAgICAgIDBcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9iaW5hcnlUb2tlbnMubGVuZ3RoID4gMCAmJiB0aGlzLl9iaW5hcnlUb2tlbnNbdGhpcy5fYmluYXJ5VG9rZW5zLmxlbmd0aCAtIDFdID09PSBtZXRhZGF0YSkge1xuICAgICAgICB0aGlzLl9sYXN0VG9rZW5FbmRJbmRleCA9IGVuZEluZGV4O1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLl9iaW5hcnlUb2tlbnMucHVzaCh0aGlzLl9sYXN0VG9rZW5FbmRJbmRleCk7XG4gICAgICB0aGlzLl9iaW5hcnlUb2tlbnMucHVzaChtZXRhZGF0YSk7XG4gICAgICB0aGlzLl9sYXN0VG9rZW5FbmRJbmRleCA9IGVuZEluZGV4O1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBzY29wZXMgPSBzY29wZXNMaXN0Py5nZXRTY29wZU5hbWVzKCkgPz8gW107XG4gICAgdGhpcy5fdG9rZW5zLnB1c2goe1xuICAgICAgc3RhcnRJbmRleDogdGhpcy5fbGFzdFRva2VuRW5kSW5kZXgsXG4gICAgICBlbmRJbmRleCxcbiAgICAgIC8vIHZhbHVlOiBsaW5lVGV4dC5zdWJzdHJpbmcobGFzdFRva2VuRW5kSW5kZXgsIGVuZEluZGV4KSxcbiAgICAgIHNjb3Blc1xuICAgIH0pO1xuICAgIHRoaXMuX2xhc3RUb2tlbkVuZEluZGV4ID0gZW5kSW5kZXg7XG4gIH1cbiAgZ2V0UmVzdWx0KHN0YWNrLCBsaW5lTGVuZ3RoKSB7XG4gICAgaWYgKHRoaXMuX3Rva2Vucy5sZW5ndGggPiAwICYmIHRoaXMuX3Rva2Vuc1t0aGlzLl90b2tlbnMubGVuZ3RoIC0gMV0uc3RhcnRJbmRleCA9PT0gbGluZUxlbmd0aCAtIDEpIHtcbiAgICAgIHRoaXMuX3Rva2Vucy5wb3AoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3Rva2Vucy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMuX2xhc3RUb2tlbkVuZEluZGV4ID0gLTE7XG4gICAgICB0aGlzLnByb2R1Y2Uoc3RhY2ssIGxpbmVMZW5ndGgpO1xuICAgICAgdGhpcy5fdG9rZW5zW3RoaXMuX3Rva2Vucy5sZW5ndGggLSAxXS5zdGFydEluZGV4ID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3Rva2VucztcbiAgfVxuICBnZXRCaW5hcnlSZXN1bHQoc3RhY2ssIGxpbmVMZW5ndGgpIHtcbiAgICBpZiAodGhpcy5fYmluYXJ5VG9rZW5zLmxlbmd0aCA+IDAgJiYgdGhpcy5fYmluYXJ5VG9rZW5zW3RoaXMuX2JpbmFyeVRva2Vucy5sZW5ndGggLSAyXSA9PT0gbGluZUxlbmd0aCAtIDEpIHtcbiAgICAgIHRoaXMuX2JpbmFyeVRva2Vucy5wb3AoKTtcbiAgICAgIHRoaXMuX2JpbmFyeVRva2Vucy5wb3AoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2JpbmFyeVRva2Vucy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMuX2xhc3RUb2tlbkVuZEluZGV4ID0gLTE7XG4gICAgICB0aGlzLnByb2R1Y2Uoc3RhY2ssIGxpbmVMZW5ndGgpO1xuICAgICAgdGhpcy5fYmluYXJ5VG9rZW5zW3RoaXMuX2JpbmFyeVRva2Vucy5sZW5ndGggLSAyXSA9IDA7XG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBVaW50MzJBcnJheSh0aGlzLl9iaW5hcnlUb2tlbnMubGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gdGhpcy5fYmluYXJ5VG9rZW5zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICByZXN1bHRbaV0gPSB0aGlzLl9iaW5hcnlUb2tlbnNbaV07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn07XG5cbi8vIHNyYy9yZWdpc3RyeS50c1xudmFyIFN5bmNSZWdpc3RyeSA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IodGhlbWUsIF9vbmlnTGliKSB7XG4gICAgdGhpcy5fb25pZ0xpYiA9IF9vbmlnTGliO1xuICAgIHRoaXMuX3RoZW1lID0gdGhlbWU7XG4gIH1cbiAgX2dyYW1tYXJzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgX3Jhd0dyYW1tYXJzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgX2luamVjdGlvbkdyYW1tYXJzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgX3RoZW1lO1xuICBkaXNwb3NlKCkge1xuICAgIGZvciAoY29uc3QgZ3JhbW1hciBvZiB0aGlzLl9ncmFtbWFycy52YWx1ZXMoKSkge1xuICAgICAgZ3JhbW1hci5kaXNwb3NlKCk7XG4gICAgfVxuICB9XG4gIHNldFRoZW1lKHRoZW1lKSB7XG4gICAgdGhpcy5fdGhlbWUgPSB0aGVtZTtcbiAgfVxuICBnZXRDb2xvck1hcCgpIHtcbiAgICByZXR1cm4gdGhpcy5fdGhlbWUuZ2V0Q29sb3JNYXAoKTtcbiAgfVxuICAvKipcbiAgICogQWRkIGBncmFtbWFyYCB0byByZWdpc3RyeSBhbmQgcmV0dXJuIGEgbGlzdCBvZiByZWZlcmVuY2VkIHNjb3BlIG5hbWVzXG4gICAqL1xuICBhZGRHcmFtbWFyKGdyYW1tYXIsIGluamVjdGlvblNjb3BlTmFtZXMpIHtcbiAgICB0aGlzLl9yYXdHcmFtbWFycy5zZXQoZ3JhbW1hci5zY29wZU5hbWUsIGdyYW1tYXIpO1xuICAgIGlmIChpbmplY3Rpb25TY29wZU5hbWVzKSB7XG4gICAgICB0aGlzLl9pbmplY3Rpb25HcmFtbWFycy5zZXQoZ3JhbW1hci5zY29wZU5hbWUsIGluamVjdGlvblNjb3BlTmFtZXMpO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogTG9va3VwIGEgcmF3IGdyYW1tYXIuXG4gICAqL1xuICBsb29rdXAoc2NvcGVOYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Jhd0dyYW1tYXJzLmdldChzY29wZU5hbWUpO1xuICB9XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBpbmplY3Rpb25zIGZvciB0aGUgZ2l2ZW4gZ3JhbW1hclxuICAgKi9cbiAgaW5qZWN0aW9ucyh0YXJnZXRTY29wZSkge1xuICAgIHJldHVybiB0aGlzLl9pbmplY3Rpb25HcmFtbWFycy5nZXQodGFyZ2V0U2NvcGUpO1xuICB9XG4gIC8qKlxuICAgKiBHZXQgdGhlIGRlZmF1bHQgdGhlbWUgc2V0dGluZ3NcbiAgICovXG4gIGdldERlZmF1bHRzKCkge1xuICAgIHJldHVybiB0aGlzLl90aGVtZS5nZXREZWZhdWx0cygpO1xuICB9XG4gIC8qKlxuICAgKiBNYXRjaCBhIHNjb3BlIGluIHRoZSB0aGVtZS5cbiAgICovXG4gIHRoZW1lTWF0Y2goc2NvcGVQYXRoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3RoZW1lLm1hdGNoKHNjb3BlUGF0aCk7XG4gIH1cbiAgLyoqXG4gICAqIExvb2t1cCBhIGdyYW1tYXIuXG4gICAqL1xuICBncmFtbWFyRm9yU2NvcGVOYW1lKHNjb3BlTmFtZSwgaW5pdGlhbExhbmd1YWdlLCBlbWJlZGRlZExhbmd1YWdlcywgdG9rZW5UeXBlcywgYmFsYW5jZWRCcmFja2V0U2VsZWN0b3JzKSB7XG4gICAgaWYgKCF0aGlzLl9ncmFtbWFycy5oYXMoc2NvcGVOYW1lKSkge1xuICAgICAgbGV0IHJhd0dyYW1tYXIgPSB0aGlzLl9yYXdHcmFtbWFycy5nZXQoc2NvcGVOYW1lKTtcbiAgICAgIGlmICghcmF3R3JhbW1hcikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2dyYW1tYXJzLnNldChzY29wZU5hbWUsIGNyZWF0ZUdyYW1tYXIoXG4gICAgICAgIHNjb3BlTmFtZSxcbiAgICAgICAgcmF3R3JhbW1hcixcbiAgICAgICAgaW5pdGlhbExhbmd1YWdlLFxuICAgICAgICBlbWJlZGRlZExhbmd1YWdlcyxcbiAgICAgICAgdG9rZW5UeXBlcyxcbiAgICAgICAgYmFsYW5jZWRCcmFja2V0U2VsZWN0b3JzLFxuICAgICAgICB0aGlzLFxuICAgICAgICB0aGlzLl9vbmlnTGliXG4gICAgICApKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2dyYW1tYXJzLmdldChzY29wZU5hbWUpO1xuICB9XG59O1xuXG4vLyBzcmMvaW5kZXgudHNcbnZhciBSZWdpc3RyeSA9IGNsYXNzIHtcbiAgX29wdGlvbnM7XG4gIF9zeW5jUmVnaXN0cnk7XG4gIF9lbnN1cmVHcmFtbWFyQ2FjaGU7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICB0aGlzLl9vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLl9zeW5jUmVnaXN0cnkgPSBuZXcgU3luY1JlZ2lzdHJ5KFxuICAgICAgVGhlbWUuY3JlYXRlRnJvbVJhd1RoZW1lKG9wdGlvbnMudGhlbWUsIG9wdGlvbnMuY29sb3JNYXApLFxuICAgICAgb3B0aW9ucy5vbmlnTGliXG4gICAgKTtcbiAgICB0aGlzLl9lbnN1cmVHcmFtbWFyQ2FjaGUgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fc3luY1JlZ2lzdHJ5LmRpc3Bvc2UoKTtcbiAgfVxuICAvKipcbiAgICogQ2hhbmdlIHRoZSB0aGVtZS4gT25jZSBjYWxsZWQsIG5vIHByZXZpb3VzIGBydWxlU3RhY2tgIHNob3VsZCBiZSB1c2VkIGFueW1vcmUuXG4gICAqL1xuICBzZXRUaGVtZSh0aGVtZSwgY29sb3JNYXApIHtcbiAgICB0aGlzLl9zeW5jUmVnaXN0cnkuc2V0VGhlbWUoVGhlbWUuY3JlYXRlRnJvbVJhd1RoZW1lKHRoZW1lLCBjb2xvck1hcCkpO1xuICB9XG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbG9va3VwIGFycmF5IGZvciBjb2xvciBpZHMuXG4gICAqL1xuICBnZXRDb2xvck1hcCgpIHtcbiAgICByZXR1cm4gdGhpcy5fc3luY1JlZ2lzdHJ5LmdldENvbG9yTWFwKCk7XG4gIH1cbiAgLyoqXG4gICAqIExvYWQgdGhlIGdyYW1tYXIgZm9yIGBzY29wZU5hbWVgIGFuZCBhbGwgcmVmZXJlbmNlZCBpbmNsdWRlZCBncmFtbWFycyBhc3luY2hyb25vdXNseS5cbiAgICogUGxlYXNlIGRvIG5vdCB1c2UgbGFuZ3VhZ2UgaWQgMC5cbiAgICovXG4gIGxvYWRHcmFtbWFyV2l0aEVtYmVkZGVkTGFuZ3VhZ2VzKGluaXRpYWxTY29wZU5hbWUsIGluaXRpYWxMYW5ndWFnZSwgZW1iZWRkZWRMYW5ndWFnZXMpIHtcbiAgICByZXR1cm4gdGhpcy5sb2FkR3JhbW1hcldpdGhDb25maWd1cmF0aW9uKGluaXRpYWxTY29wZU5hbWUsIGluaXRpYWxMYW5ndWFnZSwgeyBlbWJlZGRlZExhbmd1YWdlcyB9KTtcbiAgfVxuICAvKipcbiAgICogTG9hZCB0aGUgZ3JhbW1hciBmb3IgYHNjb3BlTmFtZWAgYW5kIGFsbCByZWZlcmVuY2VkIGluY2x1ZGVkIGdyYW1tYXJzIGFzeW5jaHJvbm91c2x5LlxuICAgKiBQbGVhc2UgZG8gbm90IHVzZSBsYW5ndWFnZSBpZCAwLlxuICAgKi9cbiAgbG9hZEdyYW1tYXJXaXRoQ29uZmlndXJhdGlvbihpbml0aWFsU2NvcGVOYW1lLCBpbml0aWFsTGFuZ3VhZ2UsIGNvbmZpZ3VyYXRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5fbG9hZEdyYW1tYXIoXG4gICAgICBpbml0aWFsU2NvcGVOYW1lLFxuICAgICAgaW5pdGlhbExhbmd1YWdlLFxuICAgICAgY29uZmlndXJhdGlvbi5lbWJlZGRlZExhbmd1YWdlcyxcbiAgICAgIGNvbmZpZ3VyYXRpb24udG9rZW5UeXBlcyxcbiAgICAgIG5ldyBCYWxhbmNlZEJyYWNrZXRTZWxlY3RvcnMoXG4gICAgICAgIGNvbmZpZ3VyYXRpb24uYmFsYW5jZWRCcmFja2V0U2VsZWN0b3JzIHx8IFtdLFxuICAgICAgICBjb25maWd1cmF0aW9uLnVuYmFsYW5jZWRCcmFja2V0U2VsZWN0b3JzIHx8IFtdXG4gICAgICApXG4gICAgKTtcbiAgfVxuICAvKipcbiAgICogTG9hZCB0aGUgZ3JhbW1hciBmb3IgYHNjb3BlTmFtZWAgYW5kIGFsbCByZWZlcmVuY2VkIGluY2x1ZGVkIGdyYW1tYXJzIGFzeW5jaHJvbm91c2x5LlxuICAgKi9cbiAgbG9hZEdyYW1tYXIoaW5pdGlhbFNjb3BlTmFtZSkge1xuICAgIHJldHVybiB0aGlzLl9sb2FkR3JhbW1hcihpbml0aWFsU2NvcGVOYW1lLCAwLCBudWxsLCBudWxsLCBudWxsKTtcbiAgfVxuICBfbG9hZEdyYW1tYXIoaW5pdGlhbFNjb3BlTmFtZSwgaW5pdGlhbExhbmd1YWdlLCBlbWJlZGRlZExhbmd1YWdlcywgdG9rZW5UeXBlcywgYmFsYW5jZWRCcmFja2V0U2VsZWN0b3JzKSB7XG4gICAgY29uc3QgZGVwZW5kZW5jeVByb2Nlc3NvciA9IG5ldyBTY29wZURlcGVuZGVuY3lQcm9jZXNzb3IodGhpcy5fc3luY1JlZ2lzdHJ5LCBpbml0aWFsU2NvcGVOYW1lKTtcbiAgICB3aGlsZSAoZGVwZW5kZW5jeVByb2Nlc3Nvci5RLmxlbmd0aCA+IDApIHtcbiAgICAgIGRlcGVuZGVuY3lQcm9jZXNzb3IuUS5tYXAoKHJlcXVlc3QpID0+IHRoaXMuX2xvYWRTaW5nbGVHcmFtbWFyKHJlcXVlc3Quc2NvcGVOYW1lKSk7XG4gICAgICBkZXBlbmRlbmN5UHJvY2Vzc29yLnByb2Nlc3NRdWV1ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZ3JhbW1hckZvclNjb3BlTmFtZShcbiAgICAgIGluaXRpYWxTY29wZU5hbWUsXG4gICAgICBpbml0aWFsTGFuZ3VhZ2UsXG4gICAgICBlbWJlZGRlZExhbmd1YWdlcyxcbiAgICAgIHRva2VuVHlwZXMsXG4gICAgICBiYWxhbmNlZEJyYWNrZXRTZWxlY3RvcnNcbiAgICApO1xuICB9XG4gIF9sb2FkU2luZ2xlR3JhbW1hcihzY29wZU5hbWUpIHtcbiAgICBpZiAoIXRoaXMuX2Vuc3VyZUdyYW1tYXJDYWNoZS5oYXMoc2NvcGVOYW1lKSkge1xuICAgICAgdGhpcy5fZG9Mb2FkU2luZ2xlR3JhbW1hcihzY29wZU5hbWUpO1xuICAgICAgdGhpcy5fZW5zdXJlR3JhbW1hckNhY2hlLnNldChzY29wZU5hbWUsIHRydWUpO1xuICAgIH1cbiAgfVxuICBfZG9Mb2FkU2luZ2xlR3JhbW1hcihzY29wZU5hbWUpIHtcbiAgICBjb25zdCBncmFtbWFyID0gdGhpcy5fb3B0aW9ucy5sb2FkR3JhbW1hcihzY29wZU5hbWUpO1xuICAgIGlmIChncmFtbWFyKSB7XG4gICAgICBjb25zdCBpbmplY3Rpb25zID0gdHlwZW9mIHRoaXMuX29wdGlvbnMuZ2V0SW5qZWN0aW9ucyA9PT0gXCJmdW5jdGlvblwiID8gdGhpcy5fb3B0aW9ucy5nZXRJbmplY3Rpb25zKHNjb3BlTmFtZSkgOiB2b2lkIDA7XG4gICAgICB0aGlzLl9zeW5jUmVnaXN0cnkuYWRkR3JhbW1hcihncmFtbWFyLCBpbmplY3Rpb25zKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIEFkZHMgYSByYXdHcmFtbWFyLlxuICAgKi9cbiAgYWRkR3JhbW1hcihyYXdHcmFtbWFyLCBpbmplY3Rpb25zID0gW10sIGluaXRpYWxMYW5ndWFnZSA9IDAsIGVtYmVkZGVkTGFuZ3VhZ2VzID0gbnVsbCkge1xuICAgIHRoaXMuX3N5bmNSZWdpc3RyeS5hZGRHcmFtbWFyKHJhd0dyYW1tYXIsIGluamVjdGlvbnMpO1xuICAgIHJldHVybiB0aGlzLl9ncmFtbWFyRm9yU2NvcGVOYW1lKHJhd0dyYW1tYXIuc2NvcGVOYW1lLCBpbml0aWFsTGFuZ3VhZ2UsIGVtYmVkZGVkTGFuZ3VhZ2VzKTtcbiAgfVxuICAvKipcbiAgICogR2V0IHRoZSBncmFtbWFyIGZvciBgc2NvcGVOYW1lYC4gVGhlIGdyYW1tYXIgbXVzdCBmaXJzdCBiZSBjcmVhdGVkIHZpYSBgbG9hZEdyYW1tYXJgIG9yIGBhZGRHcmFtbWFyYC5cbiAgICovXG4gIF9ncmFtbWFyRm9yU2NvcGVOYW1lKHNjb3BlTmFtZSwgaW5pdGlhbExhbmd1YWdlID0gMCwgZW1iZWRkZWRMYW5ndWFnZXMgPSBudWxsLCB0b2tlblR5cGVzID0gbnVsbCwgYmFsYW5jZWRCcmFja2V0U2VsZWN0b3JzID0gbnVsbCkge1xuICAgIHJldHVybiB0aGlzLl9zeW5jUmVnaXN0cnkuZ3JhbW1hckZvclNjb3BlTmFtZShcbiAgICAgIHNjb3BlTmFtZSxcbiAgICAgIGluaXRpYWxMYW5ndWFnZSxcbiAgICAgIGVtYmVkZGVkTGFuZ3VhZ2VzLFxuICAgICAgdG9rZW5UeXBlcyxcbiAgICAgIGJhbGFuY2VkQnJhY2tldFNlbGVjdG9yc1xuICAgICk7XG4gIH1cbn07XG52YXIgSU5JVElBTCA9IFN0YXRlU3RhY2tJbXBsLk5VTEw7XG5leHBvcnQge1xuICBFbmNvZGVkVG9rZW5NZXRhZGF0YSxcbiAgRmluZE9wdGlvbixcbiAgRm9udFN0eWxlLFxuICBJTklUSUFMLFxuICBSZWdpc3RyeSxcbiAgVGhlbWUsXG4gIGRpc3Bvc2VPbmlnU3RyaW5nXG59O1xuIiwKICAgICJpbXBvcnQgeyBTaGlraUVycm9yIH0gZnJvbSBcIkBzaGlraWpzL3R5cGVzXCI7XG5pbXBvcnQgeyBFbmNvZGVkVG9rZW5NZXRhZGF0YSwgSU5JVElBTCwgUmVnaXN0cnkgYXMgUmVnaXN0cnkkMSwgVGhlbWUgfSBmcm9tIFwiQHNoaWtpanMvdnNjb2RlLXRleHRtYXRlXCI7XG5leHBvcnQgKiBmcm9tIFwiQHNoaWtpanMvdHlwZXNcIjtcbi8vI3JlZ2lvbiBzcmMvdXRpbHMvY29sb3JzLnRzXG5mdW5jdGlvbiByZXNvbHZlQ29sb3JSZXBsYWNlbWVudHModGhlbWUsIG9wdGlvbnMpIHtcblx0Y29uc3QgcmVwbGFjZW1lbnRzID0gdHlwZW9mIHRoZW1lID09PSBcInN0cmluZ1wiID8ge30gOiB7IC4uLnRoZW1lLmNvbG9yUmVwbGFjZW1lbnRzIH07XG5cdGNvbnN0IHRoZW1lTmFtZSA9IHR5cGVvZiB0aGVtZSA9PT0gXCJzdHJpbmdcIiA/IHRoZW1lIDogdGhlbWUubmFtZTtcblx0Zm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMob3B0aW9ucz8uY29sb3JSZXBsYWNlbWVudHMgfHwge30pKSBpZiAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiKSByZXBsYWNlbWVudHNba2V5XSA9IHZhbHVlO1xuXHRlbHNlIGlmIChrZXkgPT09IHRoZW1lTmFtZSkgT2JqZWN0LmFzc2lnbihyZXBsYWNlbWVudHMsIHZhbHVlKTtcblx0cmV0dXJuIHJlcGxhY2VtZW50cztcbn1cbmZ1bmN0aW9uIGFwcGx5Q29sb3JSZXBsYWNlbWVudHMoY29sb3IsIHJlcGxhY2VtZW50cykge1xuXHRpZiAoIWNvbG9yKSByZXR1cm4gY29sb3I7XG5cdHJldHVybiByZXBsYWNlbWVudHM/Lltjb2xvcj8udG9Mb3dlckNhc2UoKV0gfHwgY29sb3I7XG59XG4vLyNlbmRyZWdpb25cbi8vI3JlZ2lvbiBzcmMvdXRpbHMvZ2VuZXJhbC50c1xuZnVuY3Rpb24gdG9BcnJheSh4KSB7XG5cdHJldHVybiBBcnJheS5pc0FycmF5KHgpID8geCA6IFt4XTtcbn1cbi8qKlxuKiBOb3JtYWxpemUgYSBnZXR0ZXIgdG8gYSBwcm9taXNlLlxuKi9cbmFzeW5jIGZ1bmN0aW9uIG5vcm1hbGl6ZUdldHRlcihwKSB7XG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUodHlwZW9mIHAgPT09IFwiZnVuY3Rpb25cIiA/IHAoKSA6IHApLnRoZW4oKHIpID0+IHIuZGVmYXVsdCB8fCByKTtcbn1cbi8qKlxuKiBDaGVjayBpZiB0aGUgbGFuZ3VhZ2UgaXMgcGxhaW50ZXh0IHRoYXQgaXMgaWdub3JlZCBieSBTaGlraS5cbipcbiogSGFyZC1jb2RlZCBwbGFpbiB0ZXh0IGxhbmd1YWdlczogYHBsYWludGV4dGAsIGB0eHRgLCBgdGV4dGAsIGBwbGFpbmAuXG4qL1xuZnVuY3Rpb24gaXNQbGFpbkxhbmcobGFuZykge1xuXHRyZXR1cm4gIWxhbmcgfHwgW1xuXHRcdFwicGxhaW50ZXh0XCIsXG5cdFx0XCJ0eHRcIixcblx0XHRcInRleHRcIixcblx0XHRcInBsYWluXCJcblx0XS5pbmNsdWRlcyhsYW5nKTtcbn1cbi8qKlxuKiBDaGVjayBpZiB0aGUgbGFuZ3VhZ2UgaXMgc3BlY2lhbGx5IGhhbmRsZWQgb3IgYnlwYXNzZWQgYnkgU2hpa2kuXG4qXG4qIEhhcmQtY29kZWQgbGFuZ3VhZ2VzOiBgYW5zaWAgYW5kIHBsYWludGV4dHMgbGlrZSBgcGxhaW50ZXh0YCwgYHR4dGAsIGB0ZXh0YCwgYHBsYWluYC5cbiovXG5mdW5jdGlvbiBpc1NwZWNpYWxMYW5nKGxhbmcpIHtcblx0cmV0dXJuIGxhbmcgPT09IFwiYW5zaVwiIHx8IGlzUGxhaW5MYW5nKGxhbmcpO1xufVxuLyoqXG4qIENoZWNrIGlmIHRoZSB0aGVtZSBpcyBzcGVjaWFsbHkgaGFuZGxlZCBvciBieXBhc3NlZCBieSBTaGlraS5cbipcbiogSGFyZC1jb2RlZCB0aGVtZXM6IGBub25lYC5cbiovXG5mdW5jdGlvbiBpc05vbmVUaGVtZSh0aGVtZSkge1xuXHRyZXR1cm4gdGhlbWUgPT09IFwibm9uZVwiO1xufVxuLyoqXG4qIENoZWNrIGlmIHRoZSB0aGVtZSBpcyBzcGVjaWFsbHkgaGFuZGxlZCBvciBieXBhc3NlZCBieSBTaGlraS5cbipcbiogSGFyZC1jb2RlZCB0aGVtZXM6IGBub25lYC5cbiovXG5mdW5jdGlvbiBpc1NwZWNpYWxUaGVtZSh0aGVtZSkge1xuXHRyZXR1cm4gaXNOb25lVGhlbWUodGhlbWUpO1xufVxuLy8jZW5kcmVnaW9uXG4vLyNyZWdpb24gc3JjL3V0aWxzL3N0cmluZ3MudHNcbi8qKlxuKiBTcGxpdCBhIHN0cmluZyBpbnRvIGxpbmVzLCBlYWNoIGxpbmUgcHJlc2VydmVzIHRoZSBsaW5lIGVuZGluZy5cbipcbiogQHBhcmFtIGNvZGUgLSBUaGUgY29kZSBzdHJpbmcgdG8gc3BsaXQgaW50byBsaW5lc1xuKiBAcGFyYW0gcHJlc2VydmVFbmRpbmcgLSBXaGV0aGVyIHRvIHByZXNlcnZlIGxpbmUgZW5kaW5ncyBpbiB0aGUgcmVzdWx0XG4qIEByZXR1cm5zIEFycmF5IG9mIHR1cGxlcyBjb250YWluaW5nIFtsaW5lIGNvbnRlbnQsIG9mZnNldCBpbmRleF1cbipcbiogQGV4YW1wbGVcbiogYGBgdHNcbiogc3BsaXRMaW5lcygnaGVsbG9cXG53b3JsZCcsIGZhbHNlKVxuKiAvLyA9PiBbWydoZWxsbycsIDBdLCBbJ3dvcmxkJywgNl1dXG4qXG4qIHNwbGl0TGluZXMoJ2hlbGxvXFxud29ybGQnLCB0cnVlKVxuKiAvLyA9PiBbWydoZWxsb1xcbicsIDBdLCBbJ3dvcmxkJywgNl1dXG4qIGBgYFxuKi9cbmNvbnN0IFJFX05FV0xJTkUgPSAvKFxccj9cXG4pL2c7XG5mdW5jdGlvbiBzcGxpdExpbmVzKGNvZGUsIHByZXNlcnZlRW5kaW5nID0gZmFsc2UpIHtcblx0aWYgKGNvZGUubGVuZ3RoID09PSAwKSByZXR1cm4gW1tcIlwiLCAwXV07XG5cdGNvbnN0IHBhcnRzID0gY29kZS5zcGxpdChSRV9ORVdMSU5FKTtcblx0bGV0IGluZGV4ID0gMDtcblx0Y29uc3QgbGluZXMgPSBbXTtcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGg7IGkgKz0gMikge1xuXHRcdGNvbnN0IGxpbmUgPSBwcmVzZXJ2ZUVuZGluZyA/IHBhcnRzW2ldICsgKHBhcnRzW2kgKyAxXSB8fCBcIlwiKSA6IHBhcnRzW2ldO1xuXHRcdGxpbmVzLnB1c2goW2xpbmUsIGluZGV4XSk7XG5cdFx0aW5kZXggKz0gcGFydHNbaV0ubGVuZ3RoO1xuXHRcdGluZGV4ICs9IHBhcnRzW2kgKyAxXT8ubGVuZ3RoIHx8IDA7XG5cdH1cblx0cmV0dXJuIGxpbmVzO1xufVxuLy8jZW5kcmVnaW9uXG4vLyNyZWdpb24gc3JjL3RleHRtYXRlL25vcm1hbGl6ZS10aGVtZS50c1xuLyoqXG4qIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvdnNjb2RlL2Jsb2IvZjdmMDVkZWU1M2ZiMzNmZTAyM2RiMmUwNmUzMGE4OWQzMDk0NDg4Zi9zcmMvdnMvcGxhdGZvcm0vdGhlbWUvY29tbW9uL2NvbG9yUmVnaXN0cnkudHMjTDI1OC1MMjY4XG4qL1xuY29uc3QgVlNDT0RFX0ZBTExCQUNLX0VESVRPUl9GRyA9IHtcblx0bGlnaHQ6IFwiIzMzMzMzM1wiLFxuXHRkYXJrOiBcIiNiYmJiYmJcIlxufTtcbmNvbnN0IFZTQ09ERV9GQUxMQkFDS19FRElUT1JfQkcgPSB7XG5cdGxpZ2h0OiBcIiNmZmZmZmVcIixcblx0ZGFyazogXCIjMWUxZTFlXCJcbn07XG5jb25zdCBSRVNPTFZFRF9LRVkgPSBcIl9fc2hpa2lfcmVzb2x2ZWRcIjtcbi8qKlxuKiBOb3JtYWxpemUgYSB0ZXh0bWF0ZSB0aGVtZSB0byBzaGlraSB0aGVtZVxuKi9cbmZ1bmN0aW9uIG5vcm1hbGl6ZVRoZW1lKHJhd1RoZW1lKSB7XG5cdGlmIChyYXdUaGVtZT8uW1JFU09MVkVEX0tFWV0pIHJldHVybiByYXdUaGVtZTtcblx0Y29uc3QgdGhlbWUgPSB7IC4uLnJhd1RoZW1lIH07XG5cdGlmICh0aGVtZS50b2tlbkNvbG9ycyAmJiAhdGhlbWUuc2V0dGluZ3MpIHtcblx0XHR0aGVtZS5zZXR0aW5ncyA9IHRoZW1lLnRva2VuQ29sb3JzO1xuXHRcdGRlbGV0ZSB0aGVtZS50b2tlbkNvbG9ycztcblx0fVxuXHR0aGVtZS50eXBlIHx8PSBcImRhcmtcIjtcblx0dGhlbWUuY29sb3JSZXBsYWNlbWVudHMgPSB7IC4uLnRoZW1lLmNvbG9yUmVwbGFjZW1lbnRzIH07XG5cdHRoZW1lLnNldHRpbmdzIHx8PSBbXTtcblx0bGV0IHsgYmcsIGZnIH0gPSB0aGVtZTtcblx0aWYgKCFiZyB8fCAhZmcpIHtcblx0XHQvKipcblx0XHQqIEZpcnN0IHRyeTpcblx0XHQqIFRoZW1lIG1pZ2h0IGNvbnRhaW4gYSBnbG9iYWwgYHRva2VuQ29sb3JgIHdpdGhvdXQgYG5hbWVgIG9yIGBzY29wZWBcblx0XHQqIFVzZWQgYXMgZGVmYXVsdCB2YWx1ZSBmb3IgZm9yZWdyb3VuZC9iYWNrZ3JvdW5kXG5cdFx0Ki9cblx0XHRjb25zdCBnbG9iYWxTZXR0aW5nID0gdGhlbWUuc2V0dGluZ3MgPyB0aGVtZS5zZXR0aW5ncy5maW5kKChzKSA9PiAhcy5uYW1lICYmICFzLnNjb3BlKSA6IHZvaWQgMDtcblx0XHRpZiAoZ2xvYmFsU2V0dGluZz8uc2V0dGluZ3M/LmZvcmVncm91bmQpIGZnID0gZ2xvYmFsU2V0dGluZy5zZXR0aW5ncy5mb3JlZ3JvdW5kO1xuXHRcdGlmIChnbG9iYWxTZXR0aW5nPy5zZXR0aW5ncz8uYmFja2dyb3VuZCkgYmcgPSBnbG9iYWxTZXR0aW5nLnNldHRpbmdzLmJhY2tncm91bmQ7XG5cdFx0LyoqXG5cdFx0KiBTZWNvbmQgdHJ5OlxuXHRcdCogSWYgdGhlcmUncyBubyBnbG9iYWwgYHRva2VuQ29sb3JgIHdpdGhvdXQgYG5hbWVgIG9yIGBzY29wZWBcblx0XHQqIFVzZSBgZWRpdG9yLmZvcmVncm91bmRgIGFuZCBgZWRpdG9yLmJhY2tncm91bmRgXG5cdFx0Ki9cblx0XHRpZiAoIWZnICYmIHRoZW1lPy5jb2xvcnM/LltcImVkaXRvci5mb3JlZ3JvdW5kXCJdKSBmZyA9IHRoZW1lLmNvbG9yc1tcImVkaXRvci5mb3JlZ3JvdW5kXCJdO1xuXHRcdGlmICghYmcgJiYgdGhlbWU/LmNvbG9ycz8uW1wiZWRpdG9yLmJhY2tncm91bmRcIl0pIGJnID0gdGhlbWUuY29sb3JzW1wiZWRpdG9yLmJhY2tncm91bmRcIl07XG5cdFx0LyoqXG5cdFx0KiBMYXN0IHRyeTpcblx0XHQqIElmIHRoZXJlJ3Mgbm8gZmcvYmcgY29sb3Igc3BlY2lmaWVkIGluIHRoZW1lLCB1c2UgZGVmYXVsdFxuXHRcdCovXG5cdFx0aWYgKCFmZykgZmcgPSB0aGVtZS50eXBlID09PSBcImxpZ2h0XCIgPyBWU0NPREVfRkFMTEJBQ0tfRURJVE9SX0ZHLmxpZ2h0IDogVlNDT0RFX0ZBTExCQUNLX0VESVRPUl9GRy5kYXJrO1xuXHRcdGlmICghYmcpIGJnID0gdGhlbWUudHlwZSA9PT0gXCJsaWdodFwiID8gVlNDT0RFX0ZBTExCQUNLX0VESVRPUl9CRy5saWdodCA6IFZTQ09ERV9GQUxMQkFDS19FRElUT1JfQkcuZGFyaztcblx0XHR0aGVtZS5mZyA9IGZnO1xuXHRcdHRoZW1lLmJnID0gYmc7XG5cdH1cblx0aWYgKCEodGhlbWUuc2V0dGluZ3NbMF0gJiYgdGhlbWUuc2V0dGluZ3NbMF0uc2V0dGluZ3MgJiYgIXRoZW1lLnNldHRpbmdzWzBdLnNjb3BlKSkgdGhlbWUuc2V0dGluZ3MudW5zaGlmdCh7IHNldHRpbmdzOiB7XG5cdFx0Zm9yZWdyb3VuZDogdGhlbWUuZmcsXG5cdFx0YmFja2dyb3VuZDogdGhlbWUuYmdcblx0fSB9KTtcblx0bGV0IHJlcGxhY2VtZW50Q291bnQgPSAwO1xuXHRjb25zdCByZXBsYWNlbWVudE1hcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG5cdGZ1bmN0aW9uIGdldFJlcGxhY2VtZW50Q29sb3IodmFsdWUpIHtcblx0XHRpZiAocmVwbGFjZW1lbnRNYXAuaGFzKHZhbHVlKSkgcmV0dXJuIHJlcGxhY2VtZW50TWFwLmdldCh2YWx1ZSk7XG5cdFx0cmVwbGFjZW1lbnRDb3VudCArPSAxO1xuXHRcdGNvbnN0IGhleCA9IGAjJHtyZXBsYWNlbWVudENvdW50LnRvU3RyaW5nKDE2KS5wYWRTdGFydCg4LCBcIjBcIikudG9Mb3dlckNhc2UoKX1gO1xuXHRcdGlmICh0aGVtZS5jb2xvclJlcGxhY2VtZW50cz8uW2AjJHtoZXh9YF0pIHJldHVybiBnZXRSZXBsYWNlbWVudENvbG9yKHZhbHVlKTtcblx0XHRyZXBsYWNlbWVudE1hcC5zZXQodmFsdWUsIGhleCk7XG5cdFx0cmV0dXJuIGhleDtcblx0fVxuXHR0aGVtZS5zZXR0aW5ncyA9IHRoZW1lLnNldHRpbmdzLm1hcCgoc2V0dGluZykgPT4ge1xuXHRcdGNvbnN0IHJlcGxhY2VGZyA9IHNldHRpbmcuc2V0dGluZ3M/LmZvcmVncm91bmQgJiYgIXNldHRpbmcuc2V0dGluZ3MuZm9yZWdyb3VuZC5zdGFydHNXaXRoKFwiI1wiKTtcblx0XHRjb25zdCByZXBsYWNlQmcgPSBzZXR0aW5nLnNldHRpbmdzPy5iYWNrZ3JvdW5kICYmICFzZXR0aW5nLnNldHRpbmdzLmJhY2tncm91bmQuc3RhcnRzV2l0aChcIiNcIik7XG5cdFx0aWYgKCFyZXBsYWNlRmcgJiYgIXJlcGxhY2VCZykgcmV0dXJuIHNldHRpbmc7XG5cdFx0Y29uc3QgY2xvbmUgPSB7XG5cdFx0XHQuLi5zZXR0aW5nLFxuXHRcdFx0c2V0dGluZ3M6IHsgLi4uc2V0dGluZy5zZXR0aW5ncyB9XG5cdFx0fTtcblx0XHRpZiAocmVwbGFjZUZnKSB7XG5cdFx0XHRjb25zdCByZXBsYWNlbWVudCA9IGdldFJlcGxhY2VtZW50Q29sb3Ioc2V0dGluZy5zZXR0aW5ncy5mb3JlZ3JvdW5kKTtcblx0XHRcdHRoZW1lLmNvbG9yUmVwbGFjZW1lbnRzW3JlcGxhY2VtZW50XSA9IHNldHRpbmcuc2V0dGluZ3MuZm9yZWdyb3VuZDtcblx0XHRcdGNsb25lLnNldHRpbmdzLmZvcmVncm91bmQgPSByZXBsYWNlbWVudDtcblx0XHR9XG5cdFx0aWYgKHJlcGxhY2VCZykge1xuXHRcdFx0Y29uc3QgcmVwbGFjZW1lbnQgPSBnZXRSZXBsYWNlbWVudENvbG9yKHNldHRpbmcuc2V0dGluZ3MuYmFja2dyb3VuZCk7XG5cdFx0XHR0aGVtZS5jb2xvclJlcGxhY2VtZW50c1tyZXBsYWNlbWVudF0gPSBzZXR0aW5nLnNldHRpbmdzLmJhY2tncm91bmQ7XG5cdFx0XHRjbG9uZS5zZXR0aW5ncy5iYWNrZ3JvdW5kID0gcmVwbGFjZW1lbnQ7XG5cdFx0fVxuXHRcdHJldHVybiBjbG9uZTtcblx0fSk7XG5cdGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHRoZW1lLmNvbG9ycyB8fCB7fSkpIGlmIChrZXkgPT09IFwiZWRpdG9yLmZvcmVncm91bmRcIiB8fCBrZXkgPT09IFwiZWRpdG9yLmJhY2tncm91bmRcIiB8fCBrZXkuc3RhcnRzV2l0aChcInRlcm1pbmFsLmFuc2lcIikpIHtcblx0XHRpZiAoIXRoZW1lLmNvbG9yc1trZXldPy5zdGFydHNXaXRoKFwiI1wiKSkge1xuXHRcdFx0Y29uc3QgcmVwbGFjZW1lbnQgPSBnZXRSZXBsYWNlbWVudENvbG9yKHRoZW1lLmNvbG9yc1trZXldKTtcblx0XHRcdHRoZW1lLmNvbG9yUmVwbGFjZW1lbnRzW3JlcGxhY2VtZW50XSA9IHRoZW1lLmNvbG9yc1trZXldO1xuXHRcdFx0dGhlbWUuY29sb3JzW2tleV0gPSByZXBsYWNlbWVudDtcblx0XHR9XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoZW1lLCBSRVNPTFZFRF9LRVksIHtcblx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcblx0XHR3cml0YWJsZTogZmFsc2UsXG5cdFx0dmFsdWU6IHRydWVcblx0fSk7XG5cdHJldHVybiB0aGVtZTtcbn1cbi8vI2VuZHJlZ2lvblxuLy8jcmVnaW9uIHNyYy90ZXh0bWF0ZS9nZXR0ZXJzLXJlc29sdmUudHNcbi8qKlxuKiBSZXNvbHZlXG4qL1xuYXN5bmMgZnVuY3Rpb24gcmVzb2x2ZUxhbmdzKGxhbmdzKSB7XG5cdHJldHVybiBbLi4ubmV3IFNldCgoYXdhaXQgUHJvbWlzZS5hbGwobGFuZ3MuZmlsdGVyKChsKSA9PiAhaXNTcGVjaWFsTGFuZyhsKSkubWFwKGFzeW5jIChsYW5nKSA9PiBhd2FpdCBub3JtYWxpemVHZXR0ZXIobGFuZykudGhlbigocikgPT4gQXJyYXkuaXNBcnJheShyKSA/IHIgOiBbcl0pKSkpLmZsYXQoKSldO1xufVxuYXN5bmMgZnVuY3Rpb24gcmVzb2x2ZVRoZW1lcyh0aGVtZXMpIHtcblx0cmV0dXJuIChhd2FpdCBQcm9taXNlLmFsbCh0aGVtZXMubWFwKGFzeW5jICh0aGVtZSkgPT4gaXNTcGVjaWFsVGhlbWUodGhlbWUpID8gbnVsbCA6IG5vcm1hbGl6ZVRoZW1lKGF3YWl0IG5vcm1hbGl6ZUdldHRlcih0aGVtZSkpKSkpLmZpbHRlcigoaSkgPT4gISFpKTtcbn1cbi8vI2VuZHJlZ2lvblxuLy8jcmVnaW9uIHNyYy91dGlscy9hbGlhcy50c1xuZnVuY3Rpb24gcmVzb2x2ZUxhbmdBbGlhcyhuYW1lLCBhbGlhcykge1xuXHRpZiAoIWFsaWFzKSByZXR1cm4gbmFtZTtcblx0aWYgKGFsaWFzW25hbWVdKSB7XG5cdFx0Y29uc3QgcmVzb2x2ZWQgPSBuZXcgU2V0KFtuYW1lXSk7XG5cdFx0d2hpbGUgKGFsaWFzW25hbWVdKSB7XG5cdFx0XHRuYW1lID0gYWxpYXNbbmFtZV07XG5cdFx0XHRpZiAocmVzb2x2ZWQuaGFzKG5hbWUpKSB0aHJvdyBuZXcgU2hpa2lFcnJvcihgQ2lyY3VsYXIgYWxpYXMgXFxgJHtbLi4ucmVzb2x2ZWRdLmpvaW4oXCIgLT4gXCIpfSAtPiAke25hbWV9XFxgYCk7XG5cdFx0XHRyZXNvbHZlZC5hZGQobmFtZSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBuYW1lO1xufVxuLy8jZW5kcmVnaW9uXG4vLyNyZWdpb24gc3JjL3RleHRtYXRlL3JlZ2lzdHJ5LnRzXG52YXIgUmVnaXN0cnkgPSBjbGFzcyBleHRlbmRzIFJlZ2lzdHJ5JDEge1xuXHRfcmVzb2x2ZXI7XG5cdF90aGVtZXM7XG5cdF9sYW5ncztcblx0X2FsaWFzO1xuXHRfcmVzb2x2ZWRUaGVtZXMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuXHRfcmVzb2x2ZWRHcmFtbWFycyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG5cdF9sYW5nTWFwID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcblx0X2xhbmdHcmFwaCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG5cdF90ZXh0bWF0ZVRoZW1lQ2FjaGUgPSAvKiBAX19QVVJFX18gKi8gbmV3IFdlYWtNYXAoKTtcblx0X2xvYWRlZFRoZW1lc0NhY2hlID0gbnVsbDtcblx0X2xvYWRlZExhbmd1YWdlc0NhY2hlID0gbnVsbDtcblx0Y29uc3RydWN0b3IoX3Jlc29sdmVyLCBfdGhlbWVzLCBfbGFuZ3MsIF9hbGlhcyA9IHt9KSB7XG5cdFx0c3VwZXIoX3Jlc29sdmVyKTtcblx0XHR0aGlzLl9yZXNvbHZlciA9IF9yZXNvbHZlcjtcblx0XHR0aGlzLl90aGVtZXMgPSBfdGhlbWVzO1xuXHRcdHRoaXMuX2xhbmdzID0gX2xhbmdzO1xuXHRcdHRoaXMuX2FsaWFzID0gX2FsaWFzO1xuXHRcdHRoaXMuX3RoZW1lcy5tYXAoKHQpID0+IHRoaXMubG9hZFRoZW1lKHQpKTtcblx0XHR0aGlzLmxvYWRMYW5ndWFnZXModGhpcy5fbGFuZ3MpO1xuXHR9XG5cdGdldFRoZW1lKHRoZW1lKSB7XG5cdFx0aWYgKHR5cGVvZiB0aGVtZSA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIHRoaXMuX3Jlc29sdmVkVGhlbWVzLmdldCh0aGVtZSk7XG5cdFx0ZWxzZSByZXR1cm4gdGhpcy5sb2FkVGhlbWUodGhlbWUpO1xuXHR9XG5cdGxvYWRUaGVtZSh0aGVtZSkge1xuXHRcdGNvbnN0IF90aGVtZSA9IG5vcm1hbGl6ZVRoZW1lKHRoZW1lKTtcblx0XHRpZiAoX3RoZW1lLm5hbWUpIHtcblx0XHRcdHRoaXMuX3Jlc29sdmVkVGhlbWVzLnNldChfdGhlbWUubmFtZSwgX3RoZW1lKTtcblx0XHRcdHRoaXMuX2xvYWRlZFRoZW1lc0NhY2hlID0gbnVsbDtcblx0XHR9XG5cdFx0cmV0dXJuIF90aGVtZTtcblx0fVxuXHRnZXRMb2FkZWRUaGVtZXMoKSB7XG5cdFx0aWYgKCF0aGlzLl9sb2FkZWRUaGVtZXNDYWNoZSkgdGhpcy5fbG9hZGVkVGhlbWVzQ2FjaGUgPSBbLi4udGhpcy5fcmVzb2x2ZWRUaGVtZXMua2V5cygpXTtcblx0XHRyZXR1cm4gdGhpcy5fbG9hZGVkVGhlbWVzQ2FjaGU7XG5cdH1cblx0c2V0VGhlbWUodGhlbWUpIHtcblx0XHRsZXQgdGV4dG1hdGVUaGVtZSA9IHRoaXMuX3RleHRtYXRlVGhlbWVDYWNoZS5nZXQodGhlbWUpO1xuXHRcdGlmICghdGV4dG1hdGVUaGVtZSkge1xuXHRcdFx0dGV4dG1hdGVUaGVtZSA9IFRoZW1lLmNyZWF0ZUZyb21SYXdUaGVtZSh0aGVtZSk7XG5cdFx0XHR0aGlzLl90ZXh0bWF0ZVRoZW1lQ2FjaGUuc2V0KHRoZW1lLCB0ZXh0bWF0ZVRoZW1lKTtcblx0XHR9XG5cdFx0dGhpcy5fc3luY1JlZ2lzdHJ5LnNldFRoZW1lKHRleHRtYXRlVGhlbWUpO1xuXHR9XG5cdGdldEdyYW1tYXIobmFtZSkge1xuXHRcdG5hbWUgPSByZXNvbHZlTGFuZ0FsaWFzKG5hbWUsIHRoaXMuX2FsaWFzKTtcblx0XHRyZXR1cm4gdGhpcy5fcmVzb2x2ZWRHcmFtbWFycy5nZXQobmFtZSk7XG5cdH1cblx0bG9hZExhbmd1YWdlKGxhbmcpIHtcblx0XHRpZiAodGhpcy5nZXRHcmFtbWFyKGxhbmcubmFtZSkpIHJldHVybjtcblx0XHRjb25zdCBlbWJlZGRlZExhemlseUJ5ID0gbmV3IFNldChbLi4udGhpcy5fbGFuZ01hcC52YWx1ZXMoKV0uZmlsdGVyKChpKSA9PiBpLmVtYmVkZGVkTGFuZ3NMYXp5Py5pbmNsdWRlcyhsYW5nLm5hbWUpKSk7XG5cdFx0dGhpcy5fcmVzb2x2ZXIuYWRkTGFuZ3VhZ2UobGFuZyk7XG5cdFx0Y29uc3QgZ3JhbW1hckNvbmZpZyA9IHtcblx0XHRcdGJhbGFuY2VkQnJhY2tldFNlbGVjdG9yczogbGFuZy5iYWxhbmNlZEJyYWNrZXRTZWxlY3RvcnMgfHwgW1wiKlwiXSxcblx0XHRcdHVuYmFsYW5jZWRCcmFja2V0U2VsZWN0b3JzOiBsYW5nLnVuYmFsYW5jZWRCcmFja2V0U2VsZWN0b3JzIHx8IFtdXG5cdFx0fTtcblx0XHR0aGlzLl9zeW5jUmVnaXN0cnkuX3Jhd0dyYW1tYXJzLnNldChsYW5nLnNjb3BlTmFtZSwgbGFuZyk7XG5cdFx0Y29uc3QgZyA9IHRoaXMubG9hZEdyYW1tYXJXaXRoQ29uZmlndXJhdGlvbihsYW5nLnNjb3BlTmFtZSwgMSwgZ3JhbW1hckNvbmZpZyk7XG5cdFx0Zy5uYW1lID0gbGFuZy5uYW1lO1xuXHRcdHRoaXMuX3Jlc29sdmVkR3JhbW1hcnMuc2V0KGxhbmcubmFtZSwgZyk7XG5cdFx0aWYgKGxhbmcuYWxpYXNlcykgbGFuZy5hbGlhc2VzLmZvckVhY2goKGFsaWFzKSA9PiB7XG5cdFx0XHR0aGlzLl9hbGlhc1thbGlhc10gPSBsYW5nLm5hbWU7XG5cdFx0fSk7XG5cdFx0dGhpcy5fbG9hZGVkTGFuZ3VhZ2VzQ2FjaGUgPSBudWxsO1xuXHRcdGlmIChlbWJlZGRlZExhemlseUJ5LnNpemUpIGZvciAoY29uc3QgZSBvZiBlbWJlZGRlZExhemlseUJ5KSB7XG5cdFx0XHR0aGlzLl9yZXNvbHZlZEdyYW1tYXJzLmRlbGV0ZShlLm5hbWUpO1xuXHRcdFx0dGhpcy5fbG9hZGVkTGFuZ3VhZ2VzQ2FjaGUgPSBudWxsO1xuXHRcdFx0dGhpcy5fc3luY1JlZ2lzdHJ5Py5faW5qZWN0aW9uR3JhbW1hcnM/LmRlbGV0ZShlLnNjb3BlTmFtZSk7XG5cdFx0XHR0aGlzLl9zeW5jUmVnaXN0cnk/Ll9ncmFtbWFycz8uZGVsZXRlKGUuc2NvcGVOYW1lKTtcblx0XHRcdHRoaXMubG9hZExhbmd1YWdlKHRoaXMuX2xhbmdNYXAuZ2V0KGUubmFtZSkpO1xuXHRcdH1cblx0fVxuXHRkaXNwb3NlKCkge1xuXHRcdHN1cGVyLmRpc3Bvc2UoKTtcblx0XHR0aGlzLl9yZXNvbHZlZFRoZW1lcy5jbGVhcigpO1xuXHRcdHRoaXMuX3Jlc29sdmVkR3JhbW1hcnMuY2xlYXIoKTtcblx0XHR0aGlzLl9sYW5nTWFwLmNsZWFyKCk7XG5cdFx0dGhpcy5fbGFuZ0dyYXBoLmNsZWFyKCk7XG5cdFx0dGhpcy5fbG9hZGVkVGhlbWVzQ2FjaGUgPSBudWxsO1xuXHR9XG5cdGxvYWRMYW5ndWFnZXMobGFuZ3MpIHtcblx0XHRmb3IgKGNvbnN0IGxhbmcgb2YgbGFuZ3MpIHRoaXMucmVzb2x2ZUVtYmVkZGVkTGFuZ3VhZ2VzKGxhbmcpO1xuXHRcdGNvbnN0IGxhbmdzR3JhcGhBcnJheSA9IFsuLi50aGlzLl9sYW5nR3JhcGguZW50cmllcygpXTtcblx0XHRjb25zdCBtaXNzaW5nTGFuZ3MgPSBsYW5nc0dyYXBoQXJyYXkuZmlsdGVyKChbXywgbGFuZ10pID0+ICFsYW5nKTtcblx0XHRpZiAobWlzc2luZ0xhbmdzLmxlbmd0aCkge1xuXHRcdFx0Y29uc3QgZGVwZW5kZW50cyA9IGxhbmdzR3JhcGhBcnJheS5maWx0ZXIoKFtfLCBsYW5nXSkgPT4ge1xuXHRcdFx0XHRpZiAoIWxhbmcpIHJldHVybiBmYWxzZTtcblx0XHRcdFx0cmV0dXJuIChsYW5nLmVtYmVkZGVkTGFuZ3VhZ2VzIHx8IGxhbmcuZW1iZWRkZWRMYW5ncyk/LnNvbWUoKGwpID0+IG1pc3NpbmdMYW5ncy5tYXAoKFtuYW1lXSkgPT4gbmFtZSkuaW5jbHVkZXMobCkpO1xuXHRcdFx0fSkuZmlsdGVyKChsYW5nKSA9PiAhbWlzc2luZ0xhbmdzLmluY2x1ZGVzKGxhbmcpKTtcblx0XHRcdHRocm93IG5ldyBTaGlraUVycm9yKGBNaXNzaW5nIGxhbmd1YWdlcyAke21pc3NpbmdMYW5ncy5tYXAoKFtuYW1lXSkgPT4gYFxcYCR7bmFtZX1cXGBgKS5qb2luKFwiLCBcIil9LCByZXF1aXJlZCBieSAke2RlcGVuZGVudHMubWFwKChbbmFtZV0pID0+IGBcXGAke25hbWV9XFxgYCkuam9pbihcIiwgXCIpfWApO1xuXHRcdH1cblx0XHRmb3IgKGNvbnN0IFtfLCBsYW5nXSBvZiBsYW5nc0dyYXBoQXJyYXkpIHRoaXMuX3Jlc29sdmVyLmFkZExhbmd1YWdlKGxhbmcpO1xuXHRcdGZvciAoY29uc3QgW18sIGxhbmddIG9mIGxhbmdzR3JhcGhBcnJheSkgdGhpcy5sb2FkTGFuZ3VhZ2UobGFuZyk7XG5cdH1cblx0Z2V0TG9hZGVkTGFuZ3VhZ2VzKCkge1xuXHRcdGlmICghdGhpcy5fbG9hZGVkTGFuZ3VhZ2VzQ2FjaGUpIHRoaXMuX2xvYWRlZExhbmd1YWdlc0NhY2hlID0gWy4uLm5ldyBTZXQoWy4uLnRoaXMuX3Jlc29sdmVkR3JhbW1hcnMua2V5cygpLCAuLi5PYmplY3Qua2V5cyh0aGlzLl9hbGlhcyldKV07XG5cdFx0cmV0dXJuIHRoaXMuX2xvYWRlZExhbmd1YWdlc0NhY2hlO1xuXHR9XG5cdHJlc29sdmVFbWJlZGRlZExhbmd1YWdlcyhsYW5nKSB7XG5cdFx0dGhpcy5fbGFuZ01hcC5zZXQobGFuZy5uYW1lLCBsYW5nKTtcblx0XHR0aGlzLl9sYW5nR3JhcGguc2V0KGxhbmcubmFtZSwgbGFuZyk7XG5cdFx0Y29uc3QgZW1iZWRkZWQgPSBsYW5nLmVtYmVkZGVkTGFuZ3VhZ2VzID8/IGxhbmcuZW1iZWRkZWRMYW5ncztcblx0XHRpZiAoZW1iZWRkZWQpIGZvciAoY29uc3QgZW1iZWRkZWRMYW5nIG9mIGVtYmVkZGVkKSB0aGlzLl9sYW5nR3JhcGguc2V0KGVtYmVkZGVkTGFuZywgdGhpcy5fbGFuZ01hcC5nZXQoZW1iZWRkZWRMYW5nKSk7XG5cdH1cbn07XG4vLyNlbmRyZWdpb25cbi8vI3JlZ2lvbiBzcmMvdGV4dG1hdGUvcmVzb2x2ZXIudHNcbnZhciBSZXNvbHZlciA9IGNsYXNzIHtcblx0X2xhbmdzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcblx0X3Njb3BlVG9MYW5nID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcblx0X2luamVjdGlvbnMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuXHRfb25pZ0xpYjtcblx0Y29uc3RydWN0b3IoZW5naW5lLCBsYW5ncykge1xuXHRcdHRoaXMuX29uaWdMaWIgPSB7XG5cdFx0XHRjcmVhdGVPbmlnU2Nhbm5lcjogKHBhdHRlcm5zKSA9PiBlbmdpbmUuY3JlYXRlU2Nhbm5lcihwYXR0ZXJucyksXG5cdFx0XHRjcmVhdGVPbmlnU3RyaW5nOiAocykgPT4gZW5naW5lLmNyZWF0ZVN0cmluZyhzKVxuXHRcdH07XG5cdFx0bGFuZ3MuZm9yRWFjaCgoaSkgPT4gdGhpcy5hZGRMYW5ndWFnZShpKSk7XG5cdH1cblx0Z2V0IG9uaWdMaWIoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX29uaWdMaWI7XG5cdH1cblx0Z2V0TGFuZ1JlZ2lzdHJhdGlvbihsYW5nSWRPckFsaWFzKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2xhbmdzLmdldChsYW5nSWRPckFsaWFzKTtcblx0fVxuXHRsb2FkR3JhbW1hcihzY29wZU5hbWUpIHtcblx0XHRyZXR1cm4gdGhpcy5fc2NvcGVUb0xhbmcuZ2V0KHNjb3BlTmFtZSk7XG5cdH1cblx0YWRkTGFuZ3VhZ2UobCkge1xuXHRcdHRoaXMuX2xhbmdzLnNldChsLm5hbWUsIGwpO1xuXHRcdGlmIChsLmFsaWFzZXMpIGwuYWxpYXNlcy5mb3JFYWNoKChhKSA9PiB7XG5cdFx0XHR0aGlzLl9sYW5ncy5zZXQoYSwgbCk7XG5cdFx0fSk7XG5cdFx0dGhpcy5fc2NvcGVUb0xhbmcuc2V0KGwuc2NvcGVOYW1lLCBsKTtcblx0XHRpZiAobC5pbmplY3RUbykgbC5pbmplY3RUby5mb3JFYWNoKChpKSA9PiB7XG5cdFx0XHRpZiAoIXRoaXMuX2luamVjdGlvbnMuZ2V0KGkpKSB0aGlzLl9pbmplY3Rpb25zLnNldChpLCBbXSk7XG5cdFx0XHR0aGlzLl9pbmplY3Rpb25zLmdldChpKS5wdXNoKGwuc2NvcGVOYW1lKTtcblx0XHR9KTtcblx0fVxuXHRnZXRJbmplY3Rpb25zKHNjb3BlTmFtZSkge1xuXHRcdGNvbnN0IHNjb3BlUGFydHMgPSBzY29wZU5hbWUuc3BsaXQoXCIuXCIpO1xuXHRcdGxldCBpbmplY3Rpb25zID0gW107XG5cdFx0Zm9yIChsZXQgaSA9IDE7IGkgPD0gc2NvcGVQYXJ0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0Y29uc3Qgc3ViU2NvcGVOYW1lID0gc2NvcGVQYXJ0cy5zbGljZSgwLCBpKS5qb2luKFwiLlwiKTtcblx0XHRcdGluamVjdGlvbnMgPSBbLi4uaW5qZWN0aW9ucywgLi4udGhpcy5faW5qZWN0aW9ucy5nZXQoc3ViU2NvcGVOYW1lKSB8fCBbXV07XG5cdFx0fVxuXHRcdHJldHVybiBpbmplY3Rpb25zO1xuXHR9XG59O1xuLy8jZW5kcmVnaW9uXG4vLyNyZWdpb24gc3JjL2NvbnN0cnVjdG9ycy9wcmltaXRpdmUudHNcbmxldCBpbnN0YW5jZXNDb3VudCA9IDA7XG4vKipcbiogR2V0IHRoZSBtaW5pbWFsIHNoaWtpIHByaW1pdGl2ZSBpbnN0YW5jZS5cbipcbiogUmVxdWlyZXMgdG8gcHJvdmlkZSB0aGUgZW5naW5lIGFuZCBhbGwgdGhlbWVzIGFuZCBsYW5ndWFnZXMgdXBmcm9udC5cbiovXG5mdW5jdGlvbiBjcmVhdGVTaGlraVByaW1pdGl2ZShvcHRpb25zKSB7XG5cdGluc3RhbmNlc0NvdW50ICs9IDE7XG5cdGlmIChvcHRpb25zLndhcm5pbmdzICE9PSBmYWxzZSAmJiBpbnN0YW5jZXNDb3VudCA+PSAxMCAmJiBpbnN0YW5jZXNDb3VudCAlIDEwID09PSAwKSBjb25zb2xlLndhcm4oYFtTaGlraV0gJHtpbnN0YW5jZXNDb3VudH0gaW5zdGFuY2VzIGhhdmUgYmVlbiBjcmVhdGVkLiBTaGlraSBpcyBzdXBwb3NlZCB0byBiZSB1c2VkIGFzIGEgc2luZ2xldG9uLCBjb25zaWRlciByZWZhY3RvcmluZyB5b3VyIGNvZGUgdG8gY2FjaGUgeW91ciBoaWdobGlnaHRlciBpbnN0YW5jZTsgT3IgY2FsbCBcXGBoaWdobGlnaHRlci5kaXNwb3NlKClcXGAgdG8gcmVsZWFzZSB1bnVzZWQgaW5zdGFuY2VzLmApO1xuXHRsZXQgaXNEaXNwb3NlZCA9IGZhbHNlO1xuXHRpZiAoIW9wdGlvbnMuZW5naW5lKSB0aHJvdyBuZXcgU2hpa2lFcnJvcihcImBlbmdpbmVgIG9wdGlvbiBpcyByZXF1aXJlZCBmb3Igc3luY2hyb25vdXMgbW9kZVwiKTtcblx0Y29uc3QgbGFuZ3MgPSAob3B0aW9ucy5sYW5ncyB8fCBbXSkuZmxhdCgxKTtcblx0Y29uc3QgdGhlbWVzID0gKG9wdGlvbnMudGhlbWVzIHx8IFtdKS5mbGF0KDEpLm1hcChub3JtYWxpemVUaGVtZSk7XG5cdGNvbnN0IF9yZWdpc3RyeSA9IG5ldyBSZWdpc3RyeShuZXcgUmVzb2x2ZXIob3B0aW9ucy5lbmdpbmUsIGxhbmdzKSwgdGhlbWVzLCBsYW5ncywgb3B0aW9ucy5sYW5nQWxpYXMpO1xuXHRsZXQgX2xhc3RUaGVtZTtcblx0ZnVuY3Rpb24gcmVzb2x2ZUxhbmdBbGlhcyQxKG5hbWUpIHtcblx0XHRyZXR1cm4gcmVzb2x2ZUxhbmdBbGlhcyhuYW1lLCBvcHRpb25zLmxhbmdBbGlhcyk7XG5cdH1cblx0ZnVuY3Rpb24gZ2V0TGFuZ3VhZ2UobmFtZSkge1xuXHRcdGVuc3VyZU5vdERpc3Bvc2VkKCk7XG5cdFx0Y29uc3QgX2xhbmcgPSBfcmVnaXN0cnkuZ2V0R3JhbW1hcih0eXBlb2YgbmFtZSA9PT0gXCJzdHJpbmdcIiA/IG5hbWUgOiBuYW1lLm5hbWUpO1xuXHRcdGlmICghX2xhbmcpIHRocm93IG5ldyBTaGlraUVycm9yKGBMYW5ndWFnZSBcXGAke25hbWV9XFxgIG5vdCBmb3VuZCwgeW91IG1heSBuZWVkIHRvIGxvYWQgaXQgZmlyc3RgKTtcblx0XHRyZXR1cm4gX2xhbmc7XG5cdH1cblx0ZnVuY3Rpb24gZ2V0VGhlbWUobmFtZSkge1xuXHRcdGlmIChuYW1lID09PSBcIm5vbmVcIikgcmV0dXJuIHtcblx0XHRcdGJnOiBcIlwiLFxuXHRcdFx0Zmc6IFwiXCIsXG5cdFx0XHRuYW1lOiBcIm5vbmVcIixcblx0XHRcdHNldHRpbmdzOiBbXSxcblx0XHRcdHR5cGU6IFwiZGFya1wiXG5cdFx0fTtcblx0XHRlbnN1cmVOb3REaXNwb3NlZCgpO1xuXHRcdGNvbnN0IF90aGVtZSA9IF9yZWdpc3RyeS5nZXRUaGVtZShuYW1lKTtcblx0XHRpZiAoIV90aGVtZSkgdGhyb3cgbmV3IFNoaWtpRXJyb3IoYFRoZW1lIFxcYCR7bmFtZX1cXGAgbm90IGZvdW5kLCB5b3UgbWF5IG5lZWQgdG8gbG9hZCBpdCBmaXJzdGApO1xuXHRcdHJldHVybiBfdGhlbWU7XG5cdH1cblx0ZnVuY3Rpb24gc2V0VGhlbWUobmFtZSkge1xuXHRcdGVuc3VyZU5vdERpc3Bvc2VkKCk7XG5cdFx0Y29uc3QgdGhlbWUgPSBnZXRUaGVtZShuYW1lKTtcblx0XHRpZiAoX2xhc3RUaGVtZSAhPT0gbmFtZSkge1xuXHRcdFx0X3JlZ2lzdHJ5LnNldFRoZW1lKHRoZW1lKTtcblx0XHRcdF9sYXN0VGhlbWUgPSBuYW1lO1xuXHRcdH1cblx0XHRyZXR1cm4ge1xuXHRcdFx0dGhlbWUsXG5cdFx0XHRjb2xvck1hcDogX3JlZ2lzdHJ5LmdldENvbG9yTWFwKClcblx0XHR9O1xuXHR9XG5cdGZ1bmN0aW9uIGdldExvYWRlZFRoZW1lcygpIHtcblx0XHRlbnN1cmVOb3REaXNwb3NlZCgpO1xuXHRcdHJldHVybiBfcmVnaXN0cnkuZ2V0TG9hZGVkVGhlbWVzKCk7XG5cdH1cblx0ZnVuY3Rpb24gZ2V0TG9hZGVkTGFuZ3VhZ2VzKCkge1xuXHRcdGVuc3VyZU5vdERpc3Bvc2VkKCk7XG5cdFx0cmV0dXJuIF9yZWdpc3RyeS5nZXRMb2FkZWRMYW5ndWFnZXMoKTtcblx0fVxuXHRmdW5jdGlvbiBsb2FkTGFuZ3VhZ2VTeW5jKC4uLmxhbmdzKSB7XG5cdFx0ZW5zdXJlTm90RGlzcG9zZWQoKTtcblx0XHRfcmVnaXN0cnkubG9hZExhbmd1YWdlcyhsYW5ncy5mbGF0KDEpKTtcblx0fVxuXHRhc3luYyBmdW5jdGlvbiBsb2FkTGFuZ3VhZ2UoLi4ubGFuZ3MpIHtcblx0XHRyZXR1cm4gbG9hZExhbmd1YWdlU3luYyhhd2FpdCByZXNvbHZlTGFuZ3MobGFuZ3MpKTtcblx0fVxuXHRmdW5jdGlvbiBsb2FkVGhlbWVTeW5jKC4uLnRoZW1lcykge1xuXHRcdGVuc3VyZU5vdERpc3Bvc2VkKCk7XG5cdFx0Zm9yIChjb25zdCB0aGVtZSBvZiB0aGVtZXMuZmxhdCgxKSkgX3JlZ2lzdHJ5LmxvYWRUaGVtZSh0aGVtZSk7XG5cdH1cblx0YXN5bmMgZnVuY3Rpb24gbG9hZFRoZW1lKC4uLnRoZW1lcykge1xuXHRcdGVuc3VyZU5vdERpc3Bvc2VkKCk7XG5cdFx0cmV0dXJuIGxvYWRUaGVtZVN5bmMoYXdhaXQgcmVzb2x2ZVRoZW1lcyh0aGVtZXMpKTtcblx0fVxuXHRmdW5jdGlvbiBlbnN1cmVOb3REaXNwb3NlZCgpIHtcblx0XHRpZiAoaXNEaXNwb3NlZCkgdGhyb3cgbmV3IFNoaWtpRXJyb3IoXCJTaGlraSBpbnN0YW5jZSBoYXMgYmVlbiBkaXNwb3NlZFwiKTtcblx0fVxuXHRmdW5jdGlvbiBkaXNwb3NlKCkge1xuXHRcdGlmIChpc0Rpc3Bvc2VkKSByZXR1cm47XG5cdFx0aXNEaXNwb3NlZCA9IHRydWU7XG5cdFx0X3JlZ2lzdHJ5LmRpc3Bvc2UoKTtcblx0XHRpbnN0YW5jZXNDb3VudCAtPSAxO1xuXHR9XG5cdHJldHVybiB7XG5cdFx0c2V0VGhlbWUsXG5cdFx0Z2V0VGhlbWUsXG5cdFx0Z2V0TGFuZ3VhZ2UsXG5cdFx0Z2V0TG9hZGVkVGhlbWVzLFxuXHRcdGdldExvYWRlZExhbmd1YWdlcyxcblx0XHRyZXNvbHZlTGFuZ0FsaWFzOiByZXNvbHZlTGFuZ0FsaWFzJDEsXG5cdFx0bG9hZExhbmd1YWdlLFxuXHRcdGxvYWRMYW5ndWFnZVN5bmMsXG5cdFx0bG9hZFRoZW1lLFxuXHRcdGxvYWRUaGVtZVN5bmMsXG5cdFx0ZGlzcG9zZSxcblx0XHRbU3ltYm9sLmRpc3Bvc2VdOiBkaXNwb3NlXG5cdH07XG59XG4vKipcbiogQGRlcHJlY2F0ZWQgVXNlIGBjcmVhdGVTaGlraVByaW1pdGl2ZWAgaW5zdGVhZC5cbiovXG5jb25zdCBjcmVhdGVTaGlraUludGVybmFsU3luYyA9IGNyZWF0ZVNoaWtpUHJpbWl0aXZlO1xuLy8jZW5kcmVnaW9uXG4vLyNyZWdpb24gc3JjL2NvbnN0cnVjdG9ycy9hc3luYy50c1xuLyoqXG4qIEdldCB0aGUgbWluaW1hbCBzaGlraSBwcmltaXRpdmUgaW5zdGFuY2UuXG4qL1xuYXN5bmMgZnVuY3Rpb24gY3JlYXRlU2hpa2lQcmltaXRpdmVBc3luYyhvcHRpb25zKSB7XG5cdGlmICghb3B0aW9ucy5lbmdpbmUpIGNvbnNvbGUud2FybihcImBlbmdpbmVgIG9wdGlvbiBpcyByZXF1aXJlZC4gVXNlIGBjcmVhdGVPbmlndXJ1bWFFbmdpbmVgIG9yIGBjcmVhdGVKYXZhU2NyaXB0UmVnZXhFbmdpbmVgIHRvIGNyZWF0ZSBhbiBlbmdpbmUuXCIpO1xuXHRjb25zdCBbdGhlbWVzLCBsYW5ncywgZW5naW5lXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcblx0XHRyZXNvbHZlVGhlbWVzKG9wdGlvbnMudGhlbWVzIHx8IFtdKSxcblx0XHRyZXNvbHZlTGFuZ3Mob3B0aW9ucy5sYW5ncyB8fCBbXSksXG5cdFx0b3B0aW9ucy5lbmdpbmVcblx0XSk7XG5cdHJldHVybiBjcmVhdGVTaGlraVByaW1pdGl2ZSh7XG5cdFx0Li4ub3B0aW9ucyxcblx0XHR0aGVtZXMsXG5cdFx0bGFuZ3MsXG5cdFx0ZW5naW5lXG5cdH0pO1xufVxuLyoqXG4qIEBkZXByZWNhdGVkIFVzZSBgY3JlYXRlU2hpa2lQcmltaXRpdmVBc3luY2AgaW5zdGVhZC5cbiovXG5jb25zdCBjcmVhdGVTaGlraUludGVybmFsID0gY3JlYXRlU2hpa2lQcmltaXRpdmVBc3luYztcbi8vI2VuZHJlZ2lvblxuLy8jcmVnaW9uIHNyYy90ZXh0bWF0ZS9ncmFtbWFyLXN0YXRlLnRzXG5jb25zdCBfZ3JhbW1hclN0YXRlTWFwID0gLyogQF9fUFVSRV9fICovIG5ldyBXZWFrTWFwKCk7XG5mdW5jdGlvbiBzZXRMYXN0R3JhbW1hclN0YXRlVG9NYXAoa2V5cywgc3RhdGUpIHtcblx0X2dyYW1tYXJTdGF0ZU1hcC5zZXQoa2V5cywgc3RhdGUpO1xufVxuZnVuY3Rpb24gZ2V0TGFzdEdyYW1tYXJTdGF0ZUZyb21NYXAoa2V5cykge1xuXHRyZXR1cm4gX2dyYW1tYXJTdGF0ZU1hcC5nZXQoa2V5cyk7XG59XG4vKipcbiogR3JhbW1hclN0YXRlIGlzIGEgc3BlY2lhbCByZWZlcmVuY2Ugb2JqZWN0IHRoYXQgaG9sZHMgdGhlIHN0YXRlIG9mIGEgZ3JhbW1hci5cbipcbiogSXQncyB1c2VkIHRvIGhpZ2hsaWdodCBjb2RlIHNuaXBwZXRzIHRoYXQgYXJlIHBhcnQgb2YgdGhlIHRhcmdldCBsYW5ndWFnZS5cbiovXG52YXIgR3JhbW1hclN0YXRlID0gY2xhc3MgR3JhbW1hclN0YXRlIHtcblx0LyoqXG5cdCogVGhlbWUgdG8gU3RhY2sgbWFwcGluZ1xuXHQqL1xuXHRfc3RhY2tzID0ge307XG5cdGxhbmc7XG5cdGdldCB0aGVtZXMoKSB7XG5cdFx0cmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuX3N0YWNrcyk7XG5cdH1cblx0Z2V0IHRoZW1lKCkge1xuXHRcdHJldHVybiB0aGlzLnRoZW1lc1swXTtcblx0fVxuXHRnZXQgX3N0YWNrKCkge1xuXHRcdHJldHVybiB0aGlzLl9zdGFja3NbdGhpcy50aGVtZV07XG5cdH1cblx0LyoqXG5cdCogU3RhdGljIG1ldGhvZCB0byBjcmVhdGUgYSBpbml0aWFsIGdyYW1tYXIgc3RhdGUuXG5cdCovXG5cdHN0YXRpYyBpbml0aWFsKGxhbmcsIHRoZW1lcykge1xuXHRcdHJldHVybiBuZXcgR3JhbW1hclN0YXRlKE9iamVjdC5mcm9tRW50cmllcyh0b0FycmF5KHRoZW1lcykubWFwKCh0aGVtZSkgPT4gW3RoZW1lLCBJTklUSUFMXSkpLCBsYW5nKTtcblx0fVxuXHRjb25zdHJ1Y3RvciguLi5hcmdzKSB7XG5cdFx0aWYgKGFyZ3MubGVuZ3RoID09PSAyKSB7XG5cdFx0XHRjb25zdCBbc3RhY2tzTWFwLCBsYW5nXSA9IGFyZ3M7XG5cdFx0XHR0aGlzLmxhbmcgPSBsYW5nO1xuXHRcdFx0dGhpcy5fc3RhY2tzID0gc3RhY2tzTWFwO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBbc3RhY2ssIGxhbmcsIHRoZW1lXSA9IGFyZ3M7XG5cdFx0XHR0aGlzLmxhbmcgPSBsYW5nO1xuXHRcdFx0dGhpcy5fc3RhY2tzID0geyBbdGhlbWVdOiBzdGFjayB9O1xuXHRcdH1cblx0fVxuXHQvKipcblx0KiBHZXQgdGhlIGludGVybmFsIHN0YWNrIG9iamVjdC5cblx0KiBAaW50ZXJuYWxcblx0Ki9cblx0Z2V0SW50ZXJuYWxTdGFjayh0aGVtZSA9IHRoaXMudGhlbWUpIHtcblx0XHRyZXR1cm4gdGhpcy5fc3RhY2tzW3RoZW1lXTtcblx0fVxuXHRnZXRTY29wZXModGhlbWUgPSB0aGlzLnRoZW1lKSB7XG5cdFx0cmV0dXJuIGdldFNjb3Blcyh0aGlzLl9zdGFja3NbdGhlbWVdKTtcblx0fVxuXHR0b0pTT04oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGxhbmc6IHRoaXMubGFuZyxcblx0XHRcdHRoZW1lOiB0aGlzLnRoZW1lLFxuXHRcdFx0dGhlbWVzOiB0aGlzLnRoZW1lcyxcblx0XHRcdHNjb3BlczogdGhpcy5nZXRTY29wZXMoKVxuXHRcdH07XG5cdH1cbn07XG5mdW5jdGlvbiBnZXRTY29wZXMoc3RhY2spIHtcblx0Y29uc3Qgc2NvcGVzID0gW107XG5cdGNvbnN0IHZpc2l0ZWQgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpO1xuXHRmdW5jdGlvbiBwdXNoU2NvcGUoc3RhY2spIHtcblx0XHRpZiAodmlzaXRlZC5oYXMoc3RhY2spKSByZXR1cm47XG5cdFx0dmlzaXRlZC5hZGQoc3RhY2spO1xuXHRcdGNvbnN0IG5hbWUgPSBzdGFjaz8ubmFtZVNjb3Blc0xpc3Q/LnNjb3BlTmFtZTtcblx0XHRpZiAobmFtZSkgc2NvcGVzLnB1c2gobmFtZSk7XG5cdFx0aWYgKHN0YWNrLnBhcmVudCkgcHVzaFNjb3BlKHN0YWNrLnBhcmVudCk7XG5cdH1cblx0cHVzaFNjb3BlKHN0YWNrKTtcblx0cmV0dXJuIHNjb3Blcztcbn1cbmZ1bmN0aW9uIGdldEdyYW1tYXJTdGFjayhzdGF0ZSwgdGhlbWUpIHtcblx0aWYgKCEoc3RhdGUgaW5zdGFuY2VvZiBHcmFtbWFyU3RhdGUpKSB0aHJvdyBuZXcgU2hpa2lFcnJvcihcIkludmFsaWQgZ3JhbW1hciBzdGF0ZVwiKTtcblx0cmV0dXJuIHN0YXRlLmdldEludGVybmFsU3RhY2sodGhlbWUpO1xufVxuLy8jZW5kcmVnaW9uXG4vLyNyZWdpb24gc3JjL2hpZ2hsaWdodC9jb2RlLXRvLXRva2Vucy1iYXNlLnRzXG5jb25zdCBSRV9DT01NQSA9IC8sLztcbmNvbnN0IFJFX1NQQUNFID0gLyAvO1xuLyoqXG4qIENvZGUgdG8gdG9rZW5zLCB3aXRoIGEgc2ltcGxlIHRoZW1lLlxuKi9cbmZ1bmN0aW9uIGNvZGVUb1Rva2Vuc0Jhc2UocHJpbWl0aXZlLCBjb2RlLCBvcHRpb25zID0ge30pIHtcblx0Y29uc3QgeyB0aGVtZTogdGhlbWVOYW1lID0gcHJpbWl0aXZlLmdldExvYWRlZFRoZW1lcygpWzBdIH0gPSBvcHRpb25zO1xuXHRpZiAoaXNQbGFpbkxhbmcocHJpbWl0aXZlLnJlc29sdmVMYW5nQWxpYXMob3B0aW9ucy5sYW5nIHx8IFwidGV4dFwiKSkgfHwgaXNOb25lVGhlbWUodGhlbWVOYW1lKSkgcmV0dXJuIHNwbGl0TGluZXMoY29kZSkubWFwKChsaW5lKSA9PiBbe1xuXHRcdGNvbnRlbnQ6IGxpbmVbMF0sXG5cdFx0b2Zmc2V0OiBsaW5lWzFdXG5cdH1dKTtcblx0Y29uc3QgeyB0aGVtZSwgY29sb3JNYXAgfSA9IHByaW1pdGl2ZS5zZXRUaGVtZSh0aGVtZU5hbWUpO1xuXHRjb25zdCBfZ3JhbW1hciA9IHByaW1pdGl2ZS5nZXRMYW5ndWFnZShvcHRpb25zLmxhbmcgfHwgXCJ0ZXh0XCIpO1xuXHRpZiAob3B0aW9ucy5ncmFtbWFyU3RhdGUpIHtcblx0XHRpZiAob3B0aW9ucy5ncmFtbWFyU3RhdGUubGFuZyAhPT0gX2dyYW1tYXIubmFtZSkgdGhyb3cgbmV3IFNoaWtpRXJyb3IoYEdyYW1tYXIgc3RhdGUgbGFuZ3VhZ2UgXCIke29wdGlvbnMuZ3JhbW1hclN0YXRlLmxhbmd9XCIgZG9lcyBub3QgbWF0Y2ggaGlnaGxpZ2h0IGxhbmd1YWdlIFwiJHtfZ3JhbW1hci5uYW1lfVwiYCk7XG5cdFx0aWYgKCFvcHRpb25zLmdyYW1tYXJTdGF0ZS50aGVtZXMuaW5jbHVkZXModGhlbWUubmFtZSkpIHRocm93IG5ldyBTaGlraUVycm9yKGBHcmFtbWFyIHN0YXRlIHRoZW1lcyBcIiR7b3B0aW9ucy5ncmFtbWFyU3RhdGUudGhlbWVzfVwiIGRvIG5vdCBjb250YWluIGhpZ2hsaWdodCB0aGVtZSBcIiR7dGhlbWUubmFtZX1cImApO1xuXHR9XG5cdHJldHVybiB0b2tlbml6ZVdpdGhUaGVtZShjb2RlLCBfZ3JhbW1hciwgdGhlbWUsIGNvbG9yTWFwLCBvcHRpb25zKTtcbn1cbmZ1bmN0aW9uIGdldExhc3RHcmFtbWFyU3RhdGUoLi4uYXJncykge1xuXHRpZiAoYXJncy5sZW5ndGggPT09IDIpIHJldHVybiBnZXRMYXN0R3JhbW1hclN0YXRlRnJvbU1hcChhcmdzWzFdKTtcblx0Y29uc3QgW3ByaW1pdGl2ZSwgY29kZSwgb3B0aW9ucyA9IHt9XSA9IGFyZ3M7XG5cdGNvbnN0IHsgbGFuZyA9IFwidGV4dFwiLCB0aGVtZTogdGhlbWVOYW1lID0gcHJpbWl0aXZlLmdldExvYWRlZFRoZW1lcygpWzBdIH0gPSBvcHRpb25zO1xuXHRpZiAoaXNQbGFpbkxhbmcobGFuZykgfHwgaXNOb25lVGhlbWUodGhlbWVOYW1lKSkgdGhyb3cgbmV3IFNoaWtpRXJyb3IoXCJQbGFpbiBsYW5ndWFnZSBkb2VzIG5vdCBoYXZlIGdyYW1tYXIgc3RhdGVcIik7XG5cdGlmIChsYW5nID09PSBcImFuc2lcIikgdGhyb3cgbmV3IFNoaWtpRXJyb3IoXCJBTlNJIGxhbmd1YWdlIGRvZXMgbm90IGhhdmUgZ3JhbW1hciBzdGF0ZVwiKTtcblx0Y29uc3QgeyB0aGVtZSwgY29sb3JNYXAgfSA9IHByaW1pdGl2ZS5zZXRUaGVtZSh0aGVtZU5hbWUpO1xuXHRjb25zdCBfZ3JhbW1hciA9IHByaW1pdGl2ZS5nZXRMYW5ndWFnZShsYW5nKTtcblx0cmV0dXJuIG5ldyBHcmFtbWFyU3RhdGUoX3Rva2VuaXplV2l0aFRoZW1lKGNvZGUsIF9ncmFtbWFyLCB0aGVtZSwgY29sb3JNYXAsIG9wdGlvbnMpLnN0YXRlU3RhY2ssIF9ncmFtbWFyLm5hbWUsIHRoZW1lLm5hbWUpO1xufVxuZnVuY3Rpb24gdG9rZW5pemVXaXRoVGhlbWUoY29kZSwgZ3JhbW1hciwgdGhlbWUsIGNvbG9yTWFwLCBvcHRpb25zKSB7XG5cdGNvbnN0IHJlc3VsdCA9IF90b2tlbml6ZVdpdGhUaGVtZShjb2RlLCBncmFtbWFyLCB0aGVtZSwgY29sb3JNYXAsIG9wdGlvbnMpO1xuXHRjb25zdCBncmFtbWFyU3RhdGUgPSBuZXcgR3JhbW1hclN0YXRlKHJlc3VsdC5zdGF0ZVN0YWNrLCBncmFtbWFyLm5hbWUsIHRoZW1lLm5hbWUpO1xuXHRzZXRMYXN0R3JhbW1hclN0YXRlVG9NYXAocmVzdWx0LnRva2VucywgZ3JhbW1hclN0YXRlKTtcblx0cmV0dXJuIHJlc3VsdC50b2tlbnM7XG59XG5mdW5jdGlvbiBfdG9rZW5pemVXaXRoVGhlbWUoY29kZSwgZ3JhbW1hciwgdGhlbWUsIGNvbG9yTWFwLCBvcHRpb25zKSB7XG5cdGNvbnN0IGNvbG9yUmVwbGFjZW1lbnRzID0gcmVzb2x2ZUNvbG9yUmVwbGFjZW1lbnRzKHRoZW1lLCBvcHRpb25zKTtcblx0Y29uc3QgeyB0b2tlbml6ZU1heExpbmVMZW5ndGggPSAwLCB0b2tlbml6ZVRpbWVMaW1pdCA9IDUwMCB9ID0gb3B0aW9ucztcblx0Y29uc3QgbGluZXMgPSBzcGxpdExpbmVzKGNvZGUpO1xuXHRsZXQgc3RhdGVTdGFjayA9IG9wdGlvbnMuZ3JhbW1hclN0YXRlID8gZ2V0R3JhbW1hclN0YWNrKG9wdGlvbnMuZ3JhbW1hclN0YXRlLCB0aGVtZS5uYW1lKSA/PyBJTklUSUFMIDogb3B0aW9ucy5ncmFtbWFyQ29udGV4dENvZGUgIT0gbnVsbCA/IF90b2tlbml6ZVdpdGhUaGVtZShvcHRpb25zLmdyYW1tYXJDb250ZXh0Q29kZSwgZ3JhbW1hciwgdGhlbWUsIGNvbG9yTWFwLCB7XG5cdFx0Li4ub3B0aW9ucyxcblx0XHRncmFtbWFyU3RhdGU6IHZvaWQgMCxcblx0XHRncmFtbWFyQ29udGV4dENvZGU6IHZvaWQgMFxuXHR9KS5zdGF0ZVN0YWNrIDogSU5JVElBTDtcblx0bGV0IGFjdHVhbCA9IFtdO1xuXHRjb25zdCBmaW5hbCA9IFtdO1xuXHRmb3IgKGxldCBpID0gMCwgbGVuID0gbGluZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcblx0XHRjb25zdCBbbGluZSwgbGluZU9mZnNldF0gPSBsaW5lc1tpXTtcblx0XHRpZiAobGluZSA9PT0gXCJcIikge1xuXHRcdFx0YWN0dWFsID0gW107XG5cdFx0XHRmaW5hbC5wdXNoKFtdKTtcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblx0XHRpZiAodG9rZW5pemVNYXhMaW5lTGVuZ3RoID4gMCAmJiBsaW5lLmxlbmd0aCA+PSB0b2tlbml6ZU1heExpbmVMZW5ndGgpIHtcblx0XHRcdGFjdHVhbCA9IFtdO1xuXHRcdFx0ZmluYWwucHVzaChbe1xuXHRcdFx0XHRjb250ZW50OiBsaW5lLFxuXHRcdFx0XHRvZmZzZXQ6IGxpbmVPZmZzZXQsXG5cdFx0XHRcdGNvbG9yOiBcIlwiLFxuXHRcdFx0XHRmb250U3R5bGU6IDBcblx0XHRcdH1dKTtcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblx0XHRsZXQgcmVzdWx0V2l0aFNjb3Blcztcblx0XHRsZXQgdG9rZW5zV2l0aFNjb3Blcztcblx0XHRsZXQgdG9rZW5zV2l0aFNjb3Blc0luZGV4O1xuXHRcdGlmIChvcHRpb25zLmluY2x1ZGVFeHBsYW5hdGlvbikge1xuXHRcdFx0cmVzdWx0V2l0aFNjb3BlcyA9IGdyYW1tYXIudG9rZW5pemVMaW5lKGxpbmUsIHN0YXRlU3RhY2ssIHRva2VuaXplVGltZUxpbWl0KTtcblx0XHRcdHRva2Vuc1dpdGhTY29wZXMgPSByZXN1bHRXaXRoU2NvcGVzLnRva2Vucztcblx0XHRcdHRva2Vuc1dpdGhTY29wZXNJbmRleCA9IDA7XG5cdFx0fVxuXHRcdGNvbnN0IHJlc3VsdCA9IGdyYW1tYXIudG9rZW5pemVMaW5lMihsaW5lLCBzdGF0ZVN0YWNrLCB0b2tlbml6ZVRpbWVMaW1pdCk7XG5cdFx0Y29uc3QgdG9rZW5zTGVuZ3RoID0gcmVzdWx0LnRva2Vucy5sZW5ndGggLyAyO1xuXHRcdGZvciAobGV0IGogPSAwOyBqIDwgdG9rZW5zTGVuZ3RoOyBqKyspIHtcblx0XHRcdGNvbnN0IHN0YXJ0SW5kZXggPSByZXN1bHQudG9rZW5zWzIgKiBqXTtcblx0XHRcdGNvbnN0IG5leHRTdGFydEluZGV4ID0gaiArIDEgPCB0b2tlbnNMZW5ndGggPyByZXN1bHQudG9rZW5zWzIgKiBqICsgMl0gOiBsaW5lLmxlbmd0aDtcblx0XHRcdGlmIChzdGFydEluZGV4ID09PSBuZXh0U3RhcnRJbmRleCkgY29udGludWU7XG5cdFx0XHRjb25zdCBtZXRhZGF0YSA9IHJlc3VsdC50b2tlbnNbMiAqIGogKyAxXTtcblx0XHRcdGNvbnN0IGNvbG9yID0gYXBwbHlDb2xvclJlcGxhY2VtZW50cyhjb2xvck1hcFtFbmNvZGVkVG9rZW5NZXRhZGF0YS5nZXRGb3JlZ3JvdW5kKG1ldGFkYXRhKV0sIGNvbG9yUmVwbGFjZW1lbnRzKTtcblx0XHRcdGNvbnN0IGZvbnRTdHlsZSA9IEVuY29kZWRUb2tlbk1ldGFkYXRhLmdldEZvbnRTdHlsZShtZXRhZGF0YSk7XG5cdFx0XHRjb25zdCB0b2tlbiA9IHtcblx0XHRcdFx0Y29udGVudDogbGluZS5zdWJzdHJpbmcoc3RhcnRJbmRleCwgbmV4dFN0YXJ0SW5kZXgpLFxuXHRcdFx0XHRvZmZzZXQ6IGxpbmVPZmZzZXQgKyBzdGFydEluZGV4LFxuXHRcdFx0XHRjb2xvcixcblx0XHRcdFx0Zm9udFN0eWxlXG5cdFx0XHR9O1xuXHRcdFx0aWYgKG9wdGlvbnMuaW5jbHVkZUV4cGxhbmF0aW9uKSB7XG5cdFx0XHRcdGNvbnN0IHRoZW1lU2V0dGluZ3NTZWxlY3RvcnMgPSBbXTtcblx0XHRcdFx0aWYgKG9wdGlvbnMuaW5jbHVkZUV4cGxhbmF0aW9uICE9PSBcInNjb3BlTmFtZVwiKSBmb3IgKGNvbnN0IHNldHRpbmcgb2YgdGhlbWUuc2V0dGluZ3MpIHtcblx0XHRcdFx0XHRsZXQgc2VsZWN0b3JzO1xuXHRcdFx0XHRcdHN3aXRjaCAodHlwZW9mIHNldHRpbmcuc2NvcGUpIHtcblx0XHRcdFx0XHRcdGNhc2UgXCJzdHJpbmdcIjpcblx0XHRcdFx0XHRcdFx0c2VsZWN0b3JzID0gc2V0dGluZy5zY29wZS5zcGxpdChSRV9DT01NQSkubWFwKChzY29wZSkgPT4gc2NvcGUudHJpbSgpKTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFwib2JqZWN0XCI6XG5cdFx0XHRcdFx0XHRcdHNlbGVjdG9ycyA9IHNldHRpbmcuc2NvcGU7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0ZGVmYXVsdDogY29udGludWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoZW1lU2V0dGluZ3NTZWxlY3RvcnMucHVzaCh7XG5cdFx0XHRcdFx0XHRzZXR0aW5nczogc2V0dGluZyxcblx0XHRcdFx0XHRcdHNlbGVjdG9yczogc2VsZWN0b3JzLm1hcCgoc2VsZWN0b3IpID0+IHNlbGVjdG9yLnNwbGl0KFJFX1NQQUNFKSlcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0b2tlbi5leHBsYW5hdGlvbiA9IFtdO1xuXHRcdFx0XHRsZXQgb2Zmc2V0ID0gMDtcblx0XHRcdFx0d2hpbGUgKHN0YXJ0SW5kZXggKyBvZmZzZXQgPCBuZXh0U3RhcnRJbmRleCkge1xuXHRcdFx0XHRcdGNvbnN0IHRva2VuV2l0aFNjb3BlcyA9IHRva2Vuc1dpdGhTY29wZXNbdG9rZW5zV2l0aFNjb3Blc0luZGV4XTtcblx0XHRcdFx0XHRjb25zdCB0b2tlbldpdGhTY29wZXNUZXh0ID0gbGluZS5zdWJzdHJpbmcodG9rZW5XaXRoU2NvcGVzLnN0YXJ0SW5kZXgsIHRva2VuV2l0aFNjb3Blcy5lbmRJbmRleCk7XG5cdFx0XHRcdFx0b2Zmc2V0ICs9IHRva2VuV2l0aFNjb3Blc1RleHQubGVuZ3RoO1xuXHRcdFx0XHRcdHRva2VuLmV4cGxhbmF0aW9uLnB1c2goe1xuXHRcdFx0XHRcdFx0Y29udGVudDogdG9rZW5XaXRoU2NvcGVzVGV4dCxcblx0XHRcdFx0XHRcdHNjb3Blczogb3B0aW9ucy5pbmNsdWRlRXhwbGFuYXRpb24gPT09IFwic2NvcGVOYW1lXCIgPyBleHBsYWluVGhlbWVTY29wZXNOYW1lT25seSh0b2tlbldpdGhTY29wZXMuc2NvcGVzKSA6IGV4cGxhaW5UaGVtZVNjb3Blc0Z1bGwodGhlbWVTZXR0aW5nc1NlbGVjdG9ycywgdG9rZW5XaXRoU2NvcGVzLnNjb3Blcylcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR0b2tlbnNXaXRoU2NvcGVzSW5kZXggKz0gMTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0YWN0dWFsLnB1c2godG9rZW4pO1xuXHRcdH1cblx0XHRmaW5hbC5wdXNoKGFjdHVhbCk7XG5cdFx0YWN0dWFsID0gW107XG5cdFx0c3RhdGVTdGFjayA9IHJlc3VsdC5ydWxlU3RhY2s7XG5cdH1cblx0cmV0dXJuIHtcblx0XHR0b2tlbnM6IGZpbmFsLFxuXHRcdHN0YXRlU3RhY2tcblx0fTtcbn1cbmZ1bmN0aW9uIGV4cGxhaW5UaGVtZVNjb3Blc05hbWVPbmx5KHNjb3Blcykge1xuXHRyZXR1cm4gc2NvcGVzLm1hcCgoc2NvcGUpID0+ICh7IHNjb3BlTmFtZTogc2NvcGUgfSkpO1xufVxuZnVuY3Rpb24gZXhwbGFpblRoZW1lU2NvcGVzRnVsbCh0aGVtZVNlbGVjdG9ycywgc2NvcGVzKSB7XG5cdGNvbnN0IHJlc3VsdCA9IFtdO1xuXHRmb3IgKGxldCBpID0gMCwgbGVuID0gc2NvcGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0Y29uc3Qgc2NvcGUgPSBzY29wZXNbaV07XG5cdFx0cmVzdWx0W2ldID0ge1xuXHRcdFx0c2NvcGVOYW1lOiBzY29wZSxcblx0XHRcdHRoZW1lTWF0Y2hlczogZXhwbGFpblRoZW1lU2NvcGUodGhlbWVTZWxlY3RvcnMsIHNjb3BlLCBzY29wZXMuc2xpY2UoMCwgaSkpXG5cdFx0fTtcblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gbWF0Y2hlc09uZShzZWxlY3Rvciwgc2NvcGUpIHtcblx0cmV0dXJuIHNlbGVjdG9yID09PSBzY29wZSB8fCBzY29wZS5zdWJzdHJpbmcoMCwgc2VsZWN0b3IubGVuZ3RoKSA9PT0gc2VsZWN0b3IgJiYgc2NvcGVbc2VsZWN0b3IubGVuZ3RoXSA9PT0gXCIuXCI7XG59XG5mdW5jdGlvbiBtYXRjaGVzKHNlbGVjdG9ycywgc2NvcGUsIHBhcmVudFNjb3Blcykge1xuXHRpZiAoIW1hdGNoZXNPbmUoc2VsZWN0b3JzLmF0KC0xKSwgc2NvcGUpKSByZXR1cm4gZmFsc2U7XG5cdGxldCBzZWxlY3RvclBhcmVudEluZGV4ID0gc2VsZWN0b3JzLmxlbmd0aCAtIDI7XG5cdGxldCBwYXJlbnRJbmRleCA9IHBhcmVudFNjb3Blcy5sZW5ndGggLSAxO1xuXHR3aGlsZSAoc2VsZWN0b3JQYXJlbnRJbmRleCA+PSAwICYmIHBhcmVudEluZGV4ID49IDApIHtcblx0XHRpZiAobWF0Y2hlc09uZShzZWxlY3RvcnNbc2VsZWN0b3JQYXJlbnRJbmRleF0sIHBhcmVudFNjb3Blc1twYXJlbnRJbmRleF0pKSBzZWxlY3RvclBhcmVudEluZGV4IC09IDE7XG5cdFx0cGFyZW50SW5kZXggLT0gMTtcblx0fVxuXHRpZiAoc2VsZWN0b3JQYXJlbnRJbmRleCA9PT0gLTEpIHJldHVybiB0cnVlO1xuXHRyZXR1cm4gZmFsc2U7XG59XG5mdW5jdGlvbiBleHBsYWluVGhlbWVTY29wZSh0aGVtZVNldHRpbmdzU2VsZWN0b3JzLCBzY29wZSwgcGFyZW50U2NvcGVzKSB7XG5cdGNvbnN0IHJlc3VsdCA9IFtdO1xuXHRmb3IgKGNvbnN0IHsgc2VsZWN0b3JzLCBzZXR0aW5ncyB9IG9mIHRoZW1lU2V0dGluZ3NTZWxlY3RvcnMpIGZvciAoY29uc3Qgc2VsZWN0b3JQaWVjZXMgb2Ygc2VsZWN0b3JzKSBpZiAobWF0Y2hlcyhzZWxlY3RvclBpZWNlcywgc2NvcGUsIHBhcmVudFNjb3BlcykpIHtcblx0XHRyZXN1bHQucHVzaChzZXR0aW5ncyk7XG5cdFx0YnJlYWs7XG5cdH1cblx0cmV0dXJuIHJlc3VsdDtcbn1cbi8vI2VuZHJlZ2lvblxuLy8jcmVnaW9uIHNyYy9oaWdobGlnaHQvY29kZS10by10b2tlbnMtdGhlbWVzLnRzXG4vKipcbiogR2V0IHRva2VucyB3aXRoIG11bHRpcGxlIHRoZW1lc1xuKi9cbmZ1bmN0aW9uIGNvZGVUb1Rva2Vuc1dpdGhUaGVtZXMocHJpbWl0aXZlLCBjb2RlLCBvcHRpb25zLCBjb2RlVG9Ub2tlbnNCYXNlRm4gPSBjb2RlVG9Ub2tlbnNCYXNlKSB7XG5cdGNvbnN0IHRoZW1lcyA9IE9iamVjdC5lbnRyaWVzKG9wdGlvbnMudGhlbWVzKS5maWx0ZXIoKGkpID0+IGlbMV0pLm1hcCgoaSkgPT4gKHtcblx0XHRjb2xvcjogaVswXSxcblx0XHR0aGVtZTogaVsxXVxuXHR9KSk7XG5cdGNvbnN0IHRoZW1lZFRva2VucyA9IHRoZW1lcy5tYXAoKHQpID0+IHtcblx0XHRjb25zdCB0b2tlbnMgPSBjb2RlVG9Ub2tlbnNCYXNlRm4ocHJpbWl0aXZlLCBjb2RlLCB7XG5cdFx0XHQuLi5vcHRpb25zLFxuXHRcdFx0dGhlbWU6IHQudGhlbWVcblx0XHR9KTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0dG9rZW5zLFxuXHRcdFx0c3RhdGU6IGdldExhc3RHcmFtbWFyU3RhdGVGcm9tTWFwKHRva2VucyksXG5cdFx0XHR0aGVtZTogdHlwZW9mIHQudGhlbWUgPT09IFwic3RyaW5nXCIgPyB0LnRoZW1lIDogdC50aGVtZS5uYW1lXG5cdFx0fTtcblx0fSk7XG5cdGNvbnN0IHRva2VucyA9IGFsaWduVGhlbWVzVG9rZW5pemF0aW9uKC4uLnRoZW1lZFRva2Vucy5tYXAoKGkpID0+IGkudG9rZW5zKSk7XG5cdGNvbnN0IG1lcmdlZFRva2VucyA9IHRva2Vuc1swXS5tYXAoKGxpbmUsIGxpbmVJZHgpID0+IGxpbmUubWFwKChfdG9rZW4sIHRva2VuSWR4KSA9PiB7XG5cdFx0Y29uc3QgbWVyZ2VkVG9rZW4gPSB7XG5cdFx0XHRjb250ZW50OiBfdG9rZW4uY29udGVudCxcblx0XHRcdHZhcmlhbnRzOiB7fSxcblx0XHRcdG9mZnNldDogX3Rva2VuLm9mZnNldFxuXHRcdH07XG5cdFx0aWYgKFwiaW5jbHVkZUV4cGxhbmF0aW9uXCIgaW4gb3B0aW9ucyAmJiBvcHRpb25zLmluY2x1ZGVFeHBsYW5hdGlvbikgbWVyZ2VkVG9rZW4uZXhwbGFuYXRpb24gPSBfdG9rZW4uZXhwbGFuYXRpb247XG5cdFx0dG9rZW5zLmZvckVhY2goKHQsIHRoZW1lSWR4KSA9PiB7XG5cdFx0XHRjb25zdCB7IGNvbnRlbnQ6IF8sIGV4cGxhbmF0aW9uOiBfXywgb2Zmc2V0OiBfX18sIC4uLnN0eWxlcyB9ID0gdFtsaW5lSWR4XVt0b2tlbklkeF07XG5cdFx0XHRtZXJnZWRUb2tlbi52YXJpYW50c1t0aGVtZXNbdGhlbWVJZHhdLmNvbG9yXSA9IHN0eWxlcztcblx0XHR9KTtcblx0XHRyZXR1cm4gbWVyZ2VkVG9rZW47XG5cdH0pKTtcblx0Y29uc3QgbWVyZ2VkR3JhbW1hclN0YXRlID0gdGhlbWVkVG9rZW5zWzBdLnN0YXRlID8gbmV3IEdyYW1tYXJTdGF0ZShPYmplY3QuZnJvbUVudHJpZXModGhlbWVkVG9rZW5zLm1hcCgocykgPT4gW3MudGhlbWUsIHMuc3RhdGU/LmdldEludGVybmFsU3RhY2socy50aGVtZSldKSksIHRoZW1lZFRva2Vuc1swXS5zdGF0ZS5sYW5nKSA6IHZvaWQgMDtcblx0aWYgKG1lcmdlZEdyYW1tYXJTdGF0ZSkgc2V0TGFzdEdyYW1tYXJTdGF0ZVRvTWFwKG1lcmdlZFRva2VucywgbWVyZ2VkR3JhbW1hclN0YXRlKTtcblx0cmV0dXJuIG1lcmdlZFRva2Vucztcbn1cbi8qKlxuKiBCcmVhayB0b2tlbnMgZnJvbSBtdWx0aXBsZSB0aGVtZXMgaW50byBzYW1lIHRva2VuaXphdGlvbi5cbipcbiogRm9yIGV4YW1wbGUsIGdpdmVuIHR3byB0aGVtZXMgdGhhdCB0b2tlbml6ZSBgY29uc29sZS5sb2coXCJoZWxsb1wiKWAgYXM6XG4qXG4qIC0gYGNvbnNvbGUgLiBsb2cgKFwiIGhlbGxvIFwiKWAgKDYgdG9rZW5zKVxuKiAtIGBjb25zb2xlIC5sb2cgKCBcImhlbGxvXCIgKWAgKDUgdG9rZW5zKVxuKlxuKiBUaGlzIGZ1bmN0aW9uIHdpbGwgcmV0dXJuOlxuKlxuKiAtIGBjb25zb2xlIC4gbG9nICggXCIgaGVsbG8gXCIgKWAgKDggdG9rZW5zKVxuKiAtIGBjb25zb2xlIC4gbG9nICggXCIgaGVsbG8gXCIgKWAgKDggdG9rZW5zKVxuKi9cbmZ1bmN0aW9uIGFsaWduVGhlbWVzVG9rZW5pemF0aW9uKC4uLnRoZW1lcykge1xuXHRjb25zdCBvdXRUaGVtZXMgPSB0aGVtZXMubWFwKCgpID0+IFtdKTtcblx0Y29uc3QgY291bnQgPSB0aGVtZXMubGVuZ3RoO1xuXHRmb3IgKGxldCBpID0gMDsgaSA8IHRoZW1lc1swXS5sZW5ndGg7IGkrKykge1xuXHRcdGNvbnN0IGxpbmVzID0gdGhlbWVzLm1hcCgodCkgPT4gdFtpXSk7XG5cdFx0Y29uc3Qgb3V0TGluZXMgPSBvdXRUaGVtZXMubWFwKCgpID0+IFtdKTtcblx0XHRvdXRUaGVtZXMuZm9yRWFjaCgodCwgaSkgPT4gdC5wdXNoKG91dExpbmVzW2ldKSk7XG5cdFx0Y29uc3QgaW5kZXhlcyA9IGxpbmVzLm1hcCgoKSA9PiAwKTtcblx0XHRjb25zdCBjdXJyZW50ID0gbGluZXMubWFwKChsKSA9PiBsWzBdKTtcblx0XHR3aGlsZSAoY3VycmVudC5ldmVyeSgodCkgPT4gdCkpIHtcblx0XHRcdGNvbnN0IG1pbkxlbmd0aCA9IE1hdGgubWluKC4uLmN1cnJlbnQubWFwKCh0KSA9PiB0LmNvbnRlbnQubGVuZ3RoKSk7XG5cdFx0XHRmb3IgKGxldCBuID0gMDsgbiA8IGNvdW50OyBuKyspIHtcblx0XHRcdFx0Y29uc3QgdG9rZW4gPSBjdXJyZW50W25dO1xuXHRcdFx0XHRpZiAodG9rZW4uY29udGVudC5sZW5ndGggPT09IG1pbkxlbmd0aCkge1xuXHRcdFx0XHRcdG91dExpbmVzW25dLnB1c2godG9rZW4pO1xuXHRcdFx0XHRcdGluZGV4ZXNbbl0gKz0gMTtcblx0XHRcdFx0XHRjdXJyZW50W25dID0gbGluZXNbbl1baW5kZXhlc1tuXV07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b3V0TGluZXNbbl0ucHVzaCh7XG5cdFx0XHRcdFx0XHQuLi50b2tlbixcblx0XHRcdFx0XHRcdGNvbnRlbnQ6IHRva2VuLmNvbnRlbnQuc2xpY2UoMCwgbWluTGVuZ3RoKVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdGN1cnJlbnRbbl0gPSB7XG5cdFx0XHRcdFx0XHQuLi50b2tlbixcblx0XHRcdFx0XHRcdGNvbnRlbnQ6IHRva2VuLmNvbnRlbnQuc2xpY2UobWluTGVuZ3RoKSxcblx0XHRcdFx0XHRcdG9mZnNldDogdG9rZW4ub2Zmc2V0ICsgbWluTGVuZ3RoXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gb3V0VGhlbWVzO1xufVxuLy8jZW5kcmVnaW9uXG5leHBvcnQgeyBHcmFtbWFyU3RhdGUsIFJlZ2lzdHJ5LCBSZXNvbHZlciwgYWxpZ25UaGVtZXNUb2tlbml6YXRpb24sIGFwcGx5Q29sb3JSZXBsYWNlbWVudHMsIGNvZGVUb1Rva2Vuc0Jhc2UsIGNvZGVUb1Rva2Vuc1dpdGhUaGVtZXMsIGNyZWF0ZVNoaWtpSW50ZXJuYWwsIGNyZWF0ZVNoaWtpSW50ZXJuYWxTeW5jLCBjcmVhdGVTaGlraVByaW1pdGl2ZSwgY3JlYXRlU2hpa2lQcmltaXRpdmVBc3luYywgZ2V0R3JhbW1hclN0YWNrLCBnZXRMYXN0R3JhbW1hclN0YXRlLCBnZXRMYXN0R3JhbW1hclN0YXRlRnJvbU1hcCwgaXNOb25lVGhlbWUsIGlzUGxhaW5MYW5nLCBpc1NwZWNpYWxMYW5nLCBpc1NwZWNpYWxUaGVtZSwgbm9ybWFsaXplR2V0dGVyLCBub3JtYWxpemVUaGVtZSwgcmVzb2x2ZUNvbG9yUmVwbGFjZW1lbnRzLCByZXNvbHZlTGFuZ0FsaWFzLCByZXNvbHZlTGFuZ3MsIHJlc29sdmVUaGVtZXMsIHNldExhc3RHcmFtbWFyU3RhdGVUb01hcCwgc3BsaXRMaW5lcywgdG9BcnJheSwgdG9rZW5pemVXaXRoVGhlbWUgfTtcbiIsCiAgICAiLyoqXG4gKiBMaXN0IG9mIEhUTUwgdm9pZCB0YWcgbmFtZXMuXG4gKlxuICogQHR5cGUge0FycmF5PHN0cmluZz59XG4gKi9cbmV4cG9ydCBjb25zdCBodG1sVm9pZEVsZW1lbnRzID0gW1xuICAnYXJlYScsXG4gICdiYXNlJyxcbiAgJ2Jhc2Vmb250JyxcbiAgJ2Jnc291bmQnLFxuICAnYnInLFxuICAnY29sJyxcbiAgJ2NvbW1hbmQnLFxuICAnZW1iZWQnLFxuICAnZnJhbWUnLFxuICAnaHInLFxuICAnaW1hZ2UnLFxuICAnaW1nJyxcbiAgJ2lucHV0JyxcbiAgJ2tleWdlbicsXG4gICdsaW5rJyxcbiAgJ21ldGEnLFxuICAncGFyYW0nLFxuICAnc291cmNlJyxcbiAgJ3RyYWNrJyxcbiAgJ3dicidcbl1cbiIsCiAgICAiLyoqXG4gKiBAaW1wb3J0IHtTY2hlbWEgYXMgU2NoZW1hVHlwZSwgU3BhY2V9IGZyb20gJ3Byb3BlcnR5LWluZm9ybWF0aW9uJ1xuICovXG5cbi8qKiBAdHlwZSB7U2NoZW1hVHlwZX0gKi9cbmV4cG9ydCBjbGFzcyBTY2hlbWEge1xuICAvKipcbiAgICogQHBhcmFtIHtTY2hlbWFUeXBlWydwcm9wZXJ0eSddfSBwcm9wZXJ0eVxuICAgKiAgIFByb3BlcnR5LlxuICAgKiBAcGFyYW0ge1NjaGVtYVR5cGVbJ25vcm1hbCddfSBub3JtYWxcbiAgICogICBOb3JtYWwuXG4gICAqIEBwYXJhbSB7U3BhY2UgfCB1bmRlZmluZWR9IFtzcGFjZV1cbiAgICogICBTcGFjZS5cbiAgICogQHJldHVybnNcbiAgICogICBTY2hlbWEuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihwcm9wZXJ0eSwgbm9ybWFsLCBzcGFjZSkge1xuICAgIHRoaXMubm9ybWFsID0gbm9ybWFsXG4gICAgdGhpcy5wcm9wZXJ0eSA9IHByb3BlcnR5XG5cbiAgICBpZiAoc3BhY2UpIHtcbiAgICAgIHRoaXMuc3BhY2UgPSBzcGFjZVxuICAgIH1cbiAgfVxufVxuXG5TY2hlbWEucHJvdG90eXBlLm5vcm1hbCA9IHt9XG5TY2hlbWEucHJvdG90eXBlLnByb3BlcnR5ID0ge31cblNjaGVtYS5wcm90b3R5cGUuc3BhY2UgPSB1bmRlZmluZWRcbiIsCiAgICAiLyoqXG4gKiBAaW1wb3J0IHtJbmZvLCBTcGFjZX0gZnJvbSAncHJvcGVydHktaW5mb3JtYXRpb24nXG4gKi9cblxuaW1wb3J0IHtTY2hlbWF9IGZyb20gJy4vc2NoZW1hLmpzJ1xuXG4vKipcbiAqIEBwYXJhbSB7UmVhZG9ubHlBcnJheTxTY2hlbWE+fSBkZWZpbml0aW9uc1xuICogICBEZWZpbml0aW9ucy5cbiAqIEBwYXJhbSB7U3BhY2UgfCB1bmRlZmluZWR9IFtzcGFjZV1cbiAqICAgU3BhY2UuXG4gKiBAcmV0dXJucyB7U2NoZW1hfVxuICogICBTY2hlbWEuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZShkZWZpbml0aW9ucywgc3BhY2UpIHtcbiAgLyoqIEB0eXBlIHtSZWNvcmQ8c3RyaW5nLCBJbmZvPn0gKi9cbiAgY29uc3QgcHJvcGVydHkgPSB7fVxuICAvKiogQHR5cGUge1JlY29yZDxzdHJpbmcsIHN0cmluZz59ICovXG4gIGNvbnN0IG5vcm1hbCA9IHt9XG5cbiAgZm9yIChjb25zdCBkZWZpbml0aW9uIG9mIGRlZmluaXRpb25zKSB7XG4gICAgT2JqZWN0LmFzc2lnbihwcm9wZXJ0eSwgZGVmaW5pdGlvbi5wcm9wZXJ0eSlcbiAgICBPYmplY3QuYXNzaWduKG5vcm1hbCwgZGVmaW5pdGlvbi5ub3JtYWwpXG4gIH1cblxuICByZXR1cm4gbmV3IFNjaGVtYShwcm9wZXJ0eSwgbm9ybWFsLCBzcGFjZSlcbn1cbiIsCiAgICAiLyoqXG4gKiBHZXQgdGhlIGNsZWFuZWQgY2FzZSBpbnNlbnNpdGl2ZSBmb3JtIG9mIGFuIGF0dHJpYnV0ZSBvciBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdmFsdWVcbiAqICAgQW4gYXR0cmlidXRlLWxpa2Ugb3IgcHJvcGVydHktbGlrZSBuYW1lLlxuICogQHJldHVybnMge3N0cmluZ31cbiAqICAgVmFsdWUgdGhhdCBjYW4gYmUgdXNlZCB0byBsb29rIHVwIHRoZSBwcm9wZXJseSBjYXNlZCBwcm9wZXJ0eSBvbiBhXG4gKiAgIGBTY2hlbWFgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZS50b0xvd2VyQ2FzZSgpXG59XG4iLAogICAgIi8qKlxuICogQGltcG9ydCB7SW5mbyBhcyBJbmZvVHlwZX0gZnJvbSAncHJvcGVydHktaW5mb3JtYXRpb24nXG4gKi9cblxuLyoqIEB0eXBlIHtJbmZvVHlwZX0gKi9cbmV4cG9ydCBjbGFzcyBJbmZvIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wZXJ0eVxuICAgKiAgIFByb3BlcnR5LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXR0cmlidXRlXG4gICAqICAgQXR0cmlidXRlLlxuICAgKiBAcmV0dXJuc1xuICAgKiAgIEluZm8uXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihwcm9wZXJ0eSwgYXR0cmlidXRlKSB7XG4gICAgdGhpcy5hdHRyaWJ1dGUgPSBhdHRyaWJ1dGVcbiAgICB0aGlzLnByb3BlcnR5ID0gcHJvcGVydHlcbiAgfVxufVxuXG5JbmZvLnByb3RvdHlwZS5hdHRyaWJ1dGUgPSAnJ1xuSW5mby5wcm90b3R5cGUuYm9vbGVhbmlzaCA9IGZhbHNlXG5JbmZvLnByb3RvdHlwZS5ib29sZWFuID0gZmFsc2VcbkluZm8ucHJvdG90eXBlLmNvbW1hT3JTcGFjZVNlcGFyYXRlZCA9IGZhbHNlXG5JbmZvLnByb3RvdHlwZS5jb21tYVNlcGFyYXRlZCA9IGZhbHNlXG5JbmZvLnByb3RvdHlwZS5kZWZpbmVkID0gZmFsc2VcbkluZm8ucHJvdG90eXBlLm11c3RVc2VQcm9wZXJ0eSA9IGZhbHNlXG5JbmZvLnByb3RvdHlwZS5udW1iZXIgPSBmYWxzZVxuSW5mby5wcm90b3R5cGUub3ZlcmxvYWRlZEJvb2xlYW4gPSBmYWxzZVxuSW5mby5wcm90b3R5cGUucHJvcGVydHkgPSAnJ1xuSW5mby5wcm90b3R5cGUuc3BhY2VTZXBhcmF0ZWQgPSBmYWxzZVxuSW5mby5wcm90b3R5cGUuc3BhY2UgPSB1bmRlZmluZWRcbiIsCiAgICAibGV0IHBvd2VycyA9IDBcblxuZXhwb3J0IGNvbnN0IGJvb2xlYW4gPSBpbmNyZW1lbnQoKVxuZXhwb3J0IGNvbnN0IGJvb2xlYW5pc2ggPSBpbmNyZW1lbnQoKVxuZXhwb3J0IGNvbnN0IG92ZXJsb2FkZWRCb29sZWFuID0gaW5jcmVtZW50KClcbmV4cG9ydCBjb25zdCBudW1iZXIgPSBpbmNyZW1lbnQoKVxuZXhwb3J0IGNvbnN0IHNwYWNlU2VwYXJhdGVkID0gaW5jcmVtZW50KClcbmV4cG9ydCBjb25zdCBjb21tYVNlcGFyYXRlZCA9IGluY3JlbWVudCgpXG5leHBvcnQgY29uc3QgY29tbWFPclNwYWNlU2VwYXJhdGVkID0gaW5jcmVtZW50KClcblxuZnVuY3Rpb24gaW5jcmVtZW50KCkge1xuICByZXR1cm4gMiAqKiArK3Bvd2Vyc1xufVxuIiwKICAgICIvKipcbiAqIEBpbXBvcnQge1NwYWNlfSBmcm9tICdwcm9wZXJ0eS1pbmZvcm1hdGlvbidcbiAqL1xuXG5pbXBvcnQge0luZm99IGZyb20gJy4vaW5mby5qcydcbmltcG9ydCAqIGFzIHR5cGVzIGZyb20gJy4vdHlwZXMuanMnXG5cbmNvbnN0IGNoZWNrcyA9IC8qKiBAdHlwZSB7UmVhZG9ubHlBcnJheTxrZXlvZiB0eXBlb2YgdHlwZXM+fSAqLyAoXG4gIE9iamVjdC5rZXlzKHR5cGVzKVxuKVxuXG5leHBvcnQgY2xhc3MgRGVmaW5lZEluZm8gZXh0ZW5kcyBJbmZvIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvcGVydHlcbiAgICogICBQcm9wZXJ0eS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGF0dHJpYnV0ZVxuICAgKiAgIEF0dHJpYnV0ZS5cbiAgICogQHBhcmFtIHtudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkfSBbbWFza11cbiAgICogICBNYXNrLlxuICAgKiBAcGFyYW0ge1NwYWNlIHwgdW5kZWZpbmVkfSBbc3BhY2VdXG4gICAqICAgU3BhY2UuXG4gICAqIEByZXR1cm5zXG4gICAqICAgSW5mby5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHByb3BlcnR5LCBhdHRyaWJ1dGUsIG1hc2ssIHNwYWNlKSB7XG4gICAgbGV0IGluZGV4ID0gLTFcblxuICAgIHN1cGVyKHByb3BlcnR5LCBhdHRyaWJ1dGUpXG5cbiAgICBtYXJrKHRoaXMsICdzcGFjZScsIHNwYWNlKVxuXG4gICAgaWYgKHR5cGVvZiBtYXNrID09PSAnbnVtYmVyJykge1xuICAgICAgd2hpbGUgKCsraW5kZXggPCBjaGVja3MubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGNoZWNrID0gY2hlY2tzW2luZGV4XVxuICAgICAgICBtYXJrKHRoaXMsIGNoZWNrc1tpbmRleF0sIChtYXNrICYgdHlwZXNbY2hlY2tdKSA9PT0gdHlwZXNbY2hlY2tdKVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5EZWZpbmVkSW5mby5wcm90b3R5cGUuZGVmaW5lZCA9IHRydWVcblxuLyoqXG4gKiBAdGVtcGxhdGUge2tleW9mIERlZmluZWRJbmZvfSBLZXlcbiAqICAgS2V5IHR5cGUuXG4gKiBAcGFyYW0ge0RlZmluZWRJbmZvfSB2YWx1ZXNcbiAqICAgSW5mby5cbiAqIEBwYXJhbSB7S2V5fSBrZXlcbiAqICAgS2V5LlxuICogQHBhcmFtIHtEZWZpbmVkSW5mb1tLZXldfSB2YWx1ZVxuICogICBWYWx1ZS5cbiAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gKiAgIE5vdGhpbmcuXG4gKi9cbmZ1bmN0aW9uIG1hcmsodmFsdWVzLCBrZXksIHZhbHVlKSB7XG4gIGlmICh2YWx1ZSkge1xuICAgIHZhbHVlc1trZXldID0gdmFsdWVcbiAgfVxufVxuIiwKICAgICIvKipcbiAqIEBpbXBvcnQge0luZm8sIFNwYWNlfSBmcm9tICdwcm9wZXJ0eS1pbmZvcm1hdGlvbidcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIERlZmluaXRpb25cbiAqICAgRGVmaW5pdGlvbiBvZiBhIHNjaGVtYS5cbiAqIEBwcm9wZXJ0eSB7UmVjb3JkPHN0cmluZywgc3RyaW5nPiB8IHVuZGVmaW5lZH0gW2F0dHJpYnV0ZXNdXG4gKiAgIE5vcm1hbHplZCBuYW1lcyB0byBzcGVjaWFsIGF0dHJpYnV0ZSBjYXNlLlxuICogQHByb3BlcnR5IHtSZWFkb25seUFycmF5PHN0cmluZz4gfCB1bmRlZmluZWR9IFttdXN0VXNlUHJvcGVydHldXG4gKiAgIE5vcm1hbGl6ZWQgbmFtZXMgdGhhdCBtdXN0IGJlIHNldCBhcyBwcm9wZXJ0aWVzLlxuICogQHByb3BlcnR5IHtSZWNvcmQ8c3RyaW5nLCBudW1iZXIgfCBudWxsPn0gcHJvcGVydGllc1xuICogICBQcm9wZXJ0eSBuYW1lcyB0byB0aGVpciB0eXBlcy5cbiAqIEBwcm9wZXJ0eSB7U3BhY2UgfCB1bmRlZmluZWR9IFtzcGFjZV1cbiAqICAgU3BhY2UuXG4gKiBAcHJvcGVydHkge1RyYW5zZm9ybX0gdHJhbnNmb3JtXG4gKiAgIFRyYW5zZm9ybSBhIHByb3BlcnR5IG5hbWUuXG4gKi9cblxuLyoqXG4gKiBAY2FsbGJhY2sgVHJhbnNmb3JtXG4gKiAgIFRyYW5zZm9ybS5cbiAqIEBwYXJhbSB7UmVjb3JkPHN0cmluZywgc3RyaW5nPn0gYXR0cmlidXRlc1xuICogICBBdHRyaWJ1dGVzLlxuICogQHBhcmFtIHtzdHJpbmd9IHByb3BlcnR5XG4gKiAgIFByb3BlcnR5LlxuICogQHJldHVybnMge3N0cmluZ31cbiAqICAgQXR0cmlidXRlLlxuICovXG5cbmltcG9ydCB7bm9ybWFsaXplfSBmcm9tICcuLi9ub3JtYWxpemUuanMnXG5pbXBvcnQge0RlZmluZWRJbmZvfSBmcm9tICcuL2RlZmluZWQtaW5mby5qcydcbmltcG9ydCB7U2NoZW1hfSBmcm9tICcuL3NjaGVtYS5qcydcblxuLyoqXG4gKiBAcGFyYW0ge0RlZmluaXRpb259IGRlZmluaXRpb25cbiAqICAgRGVmaW5pdGlvbi5cbiAqIEByZXR1cm5zIHtTY2hlbWF9XG4gKiAgIFNjaGVtYS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZShkZWZpbml0aW9uKSB7XG4gIC8qKiBAdHlwZSB7UmVjb3JkPHN0cmluZywgSW5mbz59ICovXG4gIGNvbnN0IHByb3BlcnRpZXMgPSB7fVxuICAvKiogQHR5cGUge1JlY29yZDxzdHJpbmcsIHN0cmluZz59ICovXG4gIGNvbnN0IG5vcm1hbHMgPSB7fVxuXG4gIGZvciAoY29uc3QgW3Byb3BlcnR5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoZGVmaW5pdGlvbi5wcm9wZXJ0aWVzKSkge1xuICAgIGNvbnN0IGluZm8gPSBuZXcgRGVmaW5lZEluZm8oXG4gICAgICBwcm9wZXJ0eSxcbiAgICAgIGRlZmluaXRpb24udHJhbnNmb3JtKGRlZmluaXRpb24uYXR0cmlidXRlcyB8fCB7fSwgcHJvcGVydHkpLFxuICAgICAgdmFsdWUsXG4gICAgICBkZWZpbml0aW9uLnNwYWNlXG4gICAgKVxuXG4gICAgaWYgKFxuICAgICAgZGVmaW5pdGlvbi5tdXN0VXNlUHJvcGVydHkgJiZcbiAgICAgIGRlZmluaXRpb24ubXVzdFVzZVByb3BlcnR5LmluY2x1ZGVzKHByb3BlcnR5KVxuICAgICkge1xuICAgICAgaW5mby5tdXN0VXNlUHJvcGVydHkgPSB0cnVlXG4gICAgfVxuXG4gICAgcHJvcGVydGllc1twcm9wZXJ0eV0gPSBpbmZvXG5cbiAgICBub3JtYWxzW25vcm1hbGl6ZShwcm9wZXJ0eSldID0gcHJvcGVydHlcbiAgICBub3JtYWxzW25vcm1hbGl6ZShpbmZvLmF0dHJpYnV0ZSldID0gcHJvcGVydHlcbiAgfVxuXG4gIHJldHVybiBuZXcgU2NoZW1hKHByb3BlcnRpZXMsIG5vcm1hbHMsIGRlZmluaXRpb24uc3BhY2UpXG59XG4iLAogICAgImltcG9ydCB7Y3JlYXRlfSBmcm9tICcuL3V0aWwvY3JlYXRlLmpzJ1xuaW1wb3J0IHtib29sZWFuaXNoLCBudW1iZXIsIHNwYWNlU2VwYXJhdGVkfSBmcm9tICcuL3V0aWwvdHlwZXMuanMnXG5cbmV4cG9ydCBjb25zdCBhcmlhID0gY3JlYXRlKHtcbiAgcHJvcGVydGllczoge1xuICAgIGFyaWFBY3RpdmVEZXNjZW5kYW50OiBudWxsLFxuICAgIGFyaWFBdG9taWM6IGJvb2xlYW5pc2gsXG4gICAgYXJpYUF1dG9Db21wbGV0ZTogbnVsbCxcbiAgICBhcmlhQnVzeTogYm9vbGVhbmlzaCxcbiAgICBhcmlhQ2hlY2tlZDogYm9vbGVhbmlzaCxcbiAgICBhcmlhQ29sQ291bnQ6IG51bWJlcixcbiAgICBhcmlhQ29sSW5kZXg6IG51bWJlcixcbiAgICBhcmlhQ29sU3BhbjogbnVtYmVyLFxuICAgIGFyaWFDb250cm9sczogc3BhY2VTZXBhcmF0ZWQsXG4gICAgYXJpYUN1cnJlbnQ6IG51bGwsXG4gICAgYXJpYURlc2NyaWJlZEJ5OiBzcGFjZVNlcGFyYXRlZCxcbiAgICBhcmlhRGV0YWlsczogbnVsbCxcbiAgICBhcmlhRGlzYWJsZWQ6IGJvb2xlYW5pc2gsXG4gICAgYXJpYURyb3BFZmZlY3Q6IHNwYWNlU2VwYXJhdGVkLFxuICAgIGFyaWFFcnJvck1lc3NhZ2U6IG51bGwsXG4gICAgYXJpYUV4cGFuZGVkOiBib29sZWFuaXNoLFxuICAgIGFyaWFGbG93VG86IHNwYWNlU2VwYXJhdGVkLFxuICAgIGFyaWFHcmFiYmVkOiBib29sZWFuaXNoLFxuICAgIGFyaWFIYXNQb3B1cDogbnVsbCxcbiAgICBhcmlhSGlkZGVuOiBib29sZWFuaXNoLFxuICAgIGFyaWFJbnZhbGlkOiBudWxsLFxuICAgIGFyaWFLZXlTaG9ydGN1dHM6IG51bGwsXG4gICAgYXJpYUxhYmVsOiBudWxsLFxuICAgIGFyaWFMYWJlbGxlZEJ5OiBzcGFjZVNlcGFyYXRlZCxcbiAgICBhcmlhTGV2ZWw6IG51bWJlcixcbiAgICBhcmlhTGl2ZTogbnVsbCxcbiAgICBhcmlhTW9kYWw6IGJvb2xlYW5pc2gsXG4gICAgYXJpYU11bHRpTGluZTogYm9vbGVhbmlzaCxcbiAgICBhcmlhTXVsdGlTZWxlY3RhYmxlOiBib29sZWFuaXNoLFxuICAgIGFyaWFPcmllbnRhdGlvbjogbnVsbCxcbiAgICBhcmlhT3duczogc3BhY2VTZXBhcmF0ZWQsXG4gICAgYXJpYVBsYWNlaG9sZGVyOiBudWxsLFxuICAgIGFyaWFQb3NJblNldDogbnVtYmVyLFxuICAgIGFyaWFQcmVzc2VkOiBib29sZWFuaXNoLFxuICAgIGFyaWFSZWFkT25seTogYm9vbGVhbmlzaCxcbiAgICBhcmlhUmVsZXZhbnQ6IG51bGwsXG4gICAgYXJpYVJlcXVpcmVkOiBib29sZWFuaXNoLFxuICAgIGFyaWFSb2xlRGVzY3JpcHRpb246IHNwYWNlU2VwYXJhdGVkLFxuICAgIGFyaWFSb3dDb3VudDogbnVtYmVyLFxuICAgIGFyaWFSb3dJbmRleDogbnVtYmVyLFxuICAgIGFyaWFSb3dTcGFuOiBudW1iZXIsXG4gICAgYXJpYVNlbGVjdGVkOiBib29sZWFuaXNoLFxuICAgIGFyaWFTZXRTaXplOiBudW1iZXIsXG4gICAgYXJpYVNvcnQ6IG51bGwsXG4gICAgYXJpYVZhbHVlTWF4OiBudW1iZXIsXG4gICAgYXJpYVZhbHVlTWluOiBudW1iZXIsXG4gICAgYXJpYVZhbHVlTm93OiBudW1iZXIsXG4gICAgYXJpYVZhbHVlVGV4dDogbnVsbCxcbiAgICByb2xlOiBudWxsXG4gIH0sXG4gIHRyYW5zZm9ybShfLCBwcm9wZXJ0eSkge1xuICAgIHJldHVybiBwcm9wZXJ0eSA9PT0gJ3JvbGUnXG4gICAgICA/IHByb3BlcnR5XG4gICAgICA6ICdhcmlhLScgKyBwcm9wZXJ0eS5zbGljZSg0KS50b0xvd2VyQ2FzZSgpXG4gIH1cbn0pXG4iLAogICAgIi8qKlxuICogQHBhcmFtIHtSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+fSBhdHRyaWJ1dGVzXG4gKiAgIEF0dHJpYnV0ZXMuXG4gKiBAcGFyYW0ge3N0cmluZ30gYXR0cmlidXRlXG4gKiAgIEF0dHJpYnV0ZS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKiAgIFRyYW5zZm9ybWVkIGF0dHJpYnV0ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhc2VTZW5zaXRpdmVUcmFuc2Zvcm0oYXR0cmlidXRlcywgYXR0cmlidXRlKSB7XG4gIHJldHVybiBhdHRyaWJ1dGUgaW4gYXR0cmlidXRlcyA/IGF0dHJpYnV0ZXNbYXR0cmlidXRlXSA6IGF0dHJpYnV0ZVxufVxuIiwKICAgICJpbXBvcnQge2Nhc2VTZW5zaXRpdmVUcmFuc2Zvcm19IGZyb20gJy4vY2FzZS1zZW5zaXRpdmUtdHJhbnNmb3JtLmpzJ1xuXG4vKipcbiAqIEBwYXJhbSB7UmVjb3JkPHN0cmluZywgc3RyaW5nPn0gYXR0cmlidXRlc1xuICogICBBdHRyaWJ1dGVzLlxuICogQHBhcmFtIHtzdHJpbmd9IHByb3BlcnR5XG4gKiAgIFByb3BlcnR5LlxuICogQHJldHVybnMge3N0cmluZ31cbiAqICAgVHJhbnNmb3JtZWQgcHJvcGVydHkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYXNlSW5zZW5zaXRpdmVUcmFuc2Zvcm0oYXR0cmlidXRlcywgcHJvcGVydHkpIHtcbiAgcmV0dXJuIGNhc2VTZW5zaXRpdmVUcmFuc2Zvcm0oYXR0cmlidXRlcywgcHJvcGVydHkudG9Mb3dlckNhc2UoKSlcbn1cbiIsCiAgICAiaW1wb3J0IHtjYXNlSW5zZW5zaXRpdmVUcmFuc2Zvcm19IGZyb20gJy4vdXRpbC9jYXNlLWluc2Vuc2l0aXZlLXRyYW5zZm9ybS5qcydcbmltcG9ydCB7Y3JlYXRlfSBmcm9tICcuL3V0aWwvY3JlYXRlLmpzJ1xuaW1wb3J0IHtcbiAgYm9vbGVhbmlzaCxcbiAgYm9vbGVhbixcbiAgY29tbWFTZXBhcmF0ZWQsXG4gIG51bWJlcixcbiAgb3ZlcmxvYWRlZEJvb2xlYW4sXG4gIHNwYWNlU2VwYXJhdGVkXG59IGZyb20gJy4vdXRpbC90eXBlcy5qcydcblxuZXhwb3J0IGNvbnN0IGh0bWwgPSBjcmVhdGUoe1xuICBhdHRyaWJ1dGVzOiB7XG4gICAgYWNjZXB0Y2hhcnNldDogJ2FjY2VwdC1jaGFyc2V0JyxcbiAgICBjbGFzc25hbWU6ICdjbGFzcycsXG4gICAgaHRtbGZvcjogJ2ZvcicsXG4gICAgaHR0cGVxdWl2OiAnaHR0cC1lcXVpdidcbiAgfSxcbiAgbXVzdFVzZVByb3BlcnR5OiBbJ2NoZWNrZWQnLCAnbXVsdGlwbGUnLCAnbXV0ZWQnLCAnc2VsZWN0ZWQnXSxcbiAgcHJvcGVydGllczoge1xuICAgIC8vIFN0YW5kYXJkIFByb3BlcnRpZXMuXG4gICAgYWJicjogbnVsbCxcbiAgICBhY2NlcHQ6IGNvbW1hU2VwYXJhdGVkLFxuICAgIGFjY2VwdENoYXJzZXQ6IHNwYWNlU2VwYXJhdGVkLFxuICAgIGFjY2Vzc0tleTogc3BhY2VTZXBhcmF0ZWQsXG4gICAgYWN0aW9uOiBudWxsLFxuICAgIGFsbG93OiBudWxsLFxuICAgIGFsbG93RnVsbFNjcmVlbjogYm9vbGVhbixcbiAgICBhbGxvd1BheW1lbnRSZXF1ZXN0OiBib29sZWFuLFxuICAgIGFsbG93VXNlck1lZGlhOiBib29sZWFuLFxuICAgIGFsdDogbnVsbCxcbiAgICBhczogbnVsbCxcbiAgICBhc3luYzogYm9vbGVhbixcbiAgICBhdXRvQ2FwaXRhbGl6ZTogbnVsbCxcbiAgICBhdXRvQ29tcGxldGU6IHNwYWNlU2VwYXJhdGVkLFxuICAgIGF1dG9Gb2N1czogYm9vbGVhbixcbiAgICBhdXRvUGxheTogYm9vbGVhbixcbiAgICBibG9ja2luZzogc3BhY2VTZXBhcmF0ZWQsXG4gICAgY2FwdHVyZTogbnVsbCxcbiAgICBjaGFyU2V0OiBudWxsLFxuICAgIGNoZWNrZWQ6IGJvb2xlYW4sXG4gICAgY2l0ZTogbnVsbCxcbiAgICBjbGFzc05hbWU6IHNwYWNlU2VwYXJhdGVkLFxuICAgIGNvbHM6IG51bWJlcixcbiAgICBjb2xTcGFuOiBudWxsLFxuICAgIGNvbnRlbnQ6IG51bGwsXG4gICAgY29udGVudEVkaXRhYmxlOiBib29sZWFuaXNoLFxuICAgIGNvbnRyb2xzOiBib29sZWFuLFxuICAgIGNvbnRyb2xzTGlzdDogc3BhY2VTZXBhcmF0ZWQsXG4gICAgY29vcmRzOiBudW1iZXIgfCBjb21tYVNlcGFyYXRlZCxcbiAgICBjcm9zc09yaWdpbjogbnVsbCxcbiAgICBkYXRhOiBudWxsLFxuICAgIGRhdGVUaW1lOiBudWxsLFxuICAgIGRlY29kaW5nOiBudWxsLFxuICAgIGRlZmF1bHQ6IGJvb2xlYW4sXG4gICAgZGVmZXI6IGJvb2xlYW4sXG4gICAgZGlyOiBudWxsLFxuICAgIGRpck5hbWU6IG51bGwsXG4gICAgZGlzYWJsZWQ6IGJvb2xlYW4sXG4gICAgZG93bmxvYWQ6IG92ZXJsb2FkZWRCb29sZWFuLFxuICAgIGRyYWdnYWJsZTogYm9vbGVhbmlzaCxcbiAgICBlbmNUeXBlOiBudWxsLFxuICAgIGVudGVyS2V5SGludDogbnVsbCxcbiAgICBmZXRjaFByaW9yaXR5OiBudWxsLFxuICAgIGZvcm06IG51bGwsXG4gICAgZm9ybUFjdGlvbjogbnVsbCxcbiAgICBmb3JtRW5jVHlwZTogbnVsbCxcbiAgICBmb3JtTWV0aG9kOiBudWxsLFxuICAgIGZvcm1Ob1ZhbGlkYXRlOiBib29sZWFuLFxuICAgIGZvcm1UYXJnZXQ6IG51bGwsXG4gICAgaGVhZGVyczogc3BhY2VTZXBhcmF0ZWQsXG4gICAgaGVpZ2h0OiBudW1iZXIsXG4gICAgaGlkZGVuOiBvdmVybG9hZGVkQm9vbGVhbixcbiAgICBoaWdoOiBudW1iZXIsXG4gICAgaHJlZjogbnVsbCxcbiAgICBocmVmTGFuZzogbnVsbCxcbiAgICBodG1sRm9yOiBzcGFjZVNlcGFyYXRlZCxcbiAgICBodHRwRXF1aXY6IHNwYWNlU2VwYXJhdGVkLFxuICAgIGlkOiBudWxsLFxuICAgIGltYWdlU2l6ZXM6IG51bGwsXG4gICAgaW1hZ2VTcmNTZXQ6IG51bGwsXG4gICAgaW5lcnQ6IGJvb2xlYW4sXG4gICAgaW5wdXRNb2RlOiBudWxsLFxuICAgIGludGVncml0eTogbnVsbCxcbiAgICBpczogbnVsbCxcbiAgICBpc01hcDogYm9vbGVhbixcbiAgICBpdGVtSWQ6IG51bGwsXG4gICAgaXRlbVByb3A6IHNwYWNlU2VwYXJhdGVkLFxuICAgIGl0ZW1SZWY6IHNwYWNlU2VwYXJhdGVkLFxuICAgIGl0ZW1TY29wZTogYm9vbGVhbixcbiAgICBpdGVtVHlwZTogc3BhY2VTZXBhcmF0ZWQsXG4gICAga2luZDogbnVsbCxcbiAgICBsYWJlbDogbnVsbCxcbiAgICBsYW5nOiBudWxsLFxuICAgIGxhbmd1YWdlOiBudWxsLFxuICAgIGxpc3Q6IG51bGwsXG4gICAgbG9hZGluZzogbnVsbCxcbiAgICBsb29wOiBib29sZWFuLFxuICAgIGxvdzogbnVtYmVyLFxuICAgIG1hbmlmZXN0OiBudWxsLFxuICAgIG1heDogbnVsbCxcbiAgICBtYXhMZW5ndGg6IG51bWJlcixcbiAgICBtZWRpYTogbnVsbCxcbiAgICBtZXRob2Q6IG51bGwsXG4gICAgbWluOiBudWxsLFxuICAgIG1pbkxlbmd0aDogbnVtYmVyLFxuICAgIG11bHRpcGxlOiBib29sZWFuLFxuICAgIG11dGVkOiBib29sZWFuLFxuICAgIG5hbWU6IG51bGwsXG4gICAgbm9uY2U6IG51bGwsXG4gICAgbm9Nb2R1bGU6IGJvb2xlYW4sXG4gICAgbm9WYWxpZGF0ZTogYm9vbGVhbixcbiAgICBvbkFib3J0OiBudWxsLFxuICAgIG9uQWZ0ZXJQcmludDogbnVsbCxcbiAgICBvbkF1eENsaWNrOiBudWxsLFxuICAgIG9uQmVmb3JlTWF0Y2g6IG51bGwsXG4gICAgb25CZWZvcmVQcmludDogbnVsbCxcbiAgICBvbkJlZm9yZVRvZ2dsZTogbnVsbCxcbiAgICBvbkJlZm9yZVVubG9hZDogbnVsbCxcbiAgICBvbkJsdXI6IG51bGwsXG4gICAgb25DYW5jZWw6IG51bGwsXG4gICAgb25DYW5QbGF5OiBudWxsLFxuICAgIG9uQ2FuUGxheVRocm91Z2g6IG51bGwsXG4gICAgb25DaGFuZ2U6IG51bGwsXG4gICAgb25DbGljazogbnVsbCxcbiAgICBvbkNsb3NlOiBudWxsLFxuICAgIG9uQ29udGV4dExvc3Q6IG51bGwsXG4gICAgb25Db250ZXh0TWVudTogbnVsbCxcbiAgICBvbkNvbnRleHRSZXN0b3JlZDogbnVsbCxcbiAgICBvbkNvcHk6IG51bGwsXG4gICAgb25DdWVDaGFuZ2U6IG51bGwsXG4gICAgb25DdXQ6IG51bGwsXG4gICAgb25EYmxDbGljazogbnVsbCxcbiAgICBvbkRyYWc6IG51bGwsXG4gICAgb25EcmFnRW5kOiBudWxsLFxuICAgIG9uRHJhZ0VudGVyOiBudWxsLFxuICAgIG9uRHJhZ0V4aXQ6IG51bGwsXG4gICAgb25EcmFnTGVhdmU6IG51bGwsXG4gICAgb25EcmFnT3ZlcjogbnVsbCxcbiAgICBvbkRyYWdTdGFydDogbnVsbCxcbiAgICBvbkRyb3A6IG51bGwsXG4gICAgb25EdXJhdGlvbkNoYW5nZTogbnVsbCxcbiAgICBvbkVtcHRpZWQ6IG51bGwsXG4gICAgb25FbmRlZDogbnVsbCxcbiAgICBvbkVycm9yOiBudWxsLFxuICAgIG9uRm9jdXM6IG51bGwsXG4gICAgb25Gb3JtRGF0YTogbnVsbCxcbiAgICBvbkhhc2hDaGFuZ2U6IG51bGwsXG4gICAgb25JbnB1dDogbnVsbCxcbiAgICBvbkludmFsaWQ6IG51bGwsXG4gICAgb25LZXlEb3duOiBudWxsLFxuICAgIG9uS2V5UHJlc3M6IG51bGwsXG4gICAgb25LZXlVcDogbnVsbCxcbiAgICBvbkxhbmd1YWdlQ2hhbmdlOiBudWxsLFxuICAgIG9uTG9hZDogbnVsbCxcbiAgICBvbkxvYWRlZERhdGE6IG51bGwsXG4gICAgb25Mb2FkZWRNZXRhZGF0YTogbnVsbCxcbiAgICBvbkxvYWRFbmQ6IG51bGwsXG4gICAgb25Mb2FkU3RhcnQ6IG51bGwsXG4gICAgb25NZXNzYWdlOiBudWxsLFxuICAgIG9uTWVzc2FnZUVycm9yOiBudWxsLFxuICAgIG9uTW91c2VEb3duOiBudWxsLFxuICAgIG9uTW91c2VFbnRlcjogbnVsbCxcbiAgICBvbk1vdXNlTGVhdmU6IG51bGwsXG4gICAgb25Nb3VzZU1vdmU6IG51bGwsXG4gICAgb25Nb3VzZU91dDogbnVsbCxcbiAgICBvbk1vdXNlT3ZlcjogbnVsbCxcbiAgICBvbk1vdXNlVXA6IG51bGwsXG4gICAgb25PZmZsaW5lOiBudWxsLFxuICAgIG9uT25saW5lOiBudWxsLFxuICAgIG9uUGFnZUhpZGU6IG51bGwsXG4gICAgb25QYWdlU2hvdzogbnVsbCxcbiAgICBvblBhc3RlOiBudWxsLFxuICAgIG9uUGF1c2U6IG51bGwsXG4gICAgb25QbGF5OiBudWxsLFxuICAgIG9uUGxheWluZzogbnVsbCxcbiAgICBvblBvcFN0YXRlOiBudWxsLFxuICAgIG9uUHJvZ3Jlc3M6IG51bGwsXG4gICAgb25SYXRlQ2hhbmdlOiBudWxsLFxuICAgIG9uUmVqZWN0aW9uSGFuZGxlZDogbnVsbCxcbiAgICBvblJlc2V0OiBudWxsLFxuICAgIG9uUmVzaXplOiBudWxsLFxuICAgIG9uU2Nyb2xsOiBudWxsLFxuICAgIG9uU2Nyb2xsRW5kOiBudWxsLFxuICAgIG9uU2VjdXJpdHlQb2xpY3lWaW9sYXRpb246IG51bGwsXG4gICAgb25TZWVrZWQ6IG51bGwsXG4gICAgb25TZWVraW5nOiBudWxsLFxuICAgIG9uU2VsZWN0OiBudWxsLFxuICAgIG9uU2xvdENoYW5nZTogbnVsbCxcbiAgICBvblN0YWxsZWQ6IG51bGwsXG4gICAgb25TdG9yYWdlOiBudWxsLFxuICAgIG9uU3VibWl0OiBudWxsLFxuICAgIG9uU3VzcGVuZDogbnVsbCxcbiAgICBvblRpbWVVcGRhdGU6IG51bGwsXG4gICAgb25Ub2dnbGU6IG51bGwsXG4gICAgb25VbmhhbmRsZWRSZWplY3Rpb246IG51bGwsXG4gICAgb25VbmxvYWQ6IG51bGwsXG4gICAgb25Wb2x1bWVDaGFuZ2U6IG51bGwsXG4gICAgb25XYWl0aW5nOiBudWxsLFxuICAgIG9uV2hlZWw6IG51bGwsXG4gICAgb3BlbjogYm9vbGVhbixcbiAgICBvcHRpbXVtOiBudW1iZXIsXG4gICAgcGF0dGVybjogbnVsbCxcbiAgICBwaW5nOiBzcGFjZVNlcGFyYXRlZCxcbiAgICBwbGFjZWhvbGRlcjogbnVsbCxcbiAgICBwbGF5c0lubGluZTogYm9vbGVhbixcbiAgICBwb3BvdmVyOiBudWxsLFxuICAgIHBvcG92ZXJUYXJnZXQ6IG51bGwsXG4gICAgcG9wb3ZlclRhcmdldEFjdGlvbjogbnVsbCxcbiAgICBwb3N0ZXI6IG51bGwsXG4gICAgcHJlbG9hZDogbnVsbCxcbiAgICByZWFkT25seTogYm9vbGVhbixcbiAgICByZWZlcnJlclBvbGljeTogbnVsbCxcbiAgICByZWw6IHNwYWNlU2VwYXJhdGVkLFxuICAgIHJlcXVpcmVkOiBib29sZWFuLFxuICAgIHJldmVyc2VkOiBib29sZWFuLFxuICAgIHJvd3M6IG51bWJlcixcbiAgICByb3dTcGFuOiBudW1iZXIsXG4gICAgc2FuZGJveDogc3BhY2VTZXBhcmF0ZWQsXG4gICAgc2NvcGU6IG51bGwsXG4gICAgc2NvcGVkOiBib29sZWFuLFxuICAgIHNlYW1sZXNzOiBib29sZWFuLFxuICAgIHNlbGVjdGVkOiBib29sZWFuLFxuICAgIHNoYWRvd1Jvb3RDbG9uYWJsZTogYm9vbGVhbixcbiAgICBzaGFkb3dSb290RGVsZWdhdGVzRm9jdXM6IGJvb2xlYW4sXG4gICAgc2hhZG93Um9vdE1vZGU6IG51bGwsXG4gICAgc2hhcGU6IG51bGwsXG4gICAgc2l6ZTogbnVtYmVyLFxuICAgIHNpemVzOiBudWxsLFxuICAgIHNsb3Q6IG51bGwsXG4gICAgc3BhbjogbnVtYmVyLFxuICAgIHNwZWxsQ2hlY2s6IGJvb2xlYW5pc2gsXG4gICAgc3JjOiBudWxsLFxuICAgIHNyY0RvYzogbnVsbCxcbiAgICBzcmNMYW5nOiBudWxsLFxuICAgIHNyY1NldDogbnVsbCxcbiAgICBzdGFydDogbnVtYmVyLFxuICAgIHN0ZXA6IG51bGwsXG4gICAgc3R5bGU6IG51bGwsXG4gICAgdGFiSW5kZXg6IG51bWJlcixcbiAgICB0YXJnZXQ6IG51bGwsXG4gICAgdGl0bGU6IG51bGwsXG4gICAgdHJhbnNsYXRlOiBudWxsLFxuICAgIHR5cGU6IG51bGwsXG4gICAgdHlwZU11c3RNYXRjaDogYm9vbGVhbixcbiAgICB1c2VNYXA6IG51bGwsXG4gICAgdmFsdWU6IGJvb2xlYW5pc2gsXG4gICAgd2lkdGg6IG51bWJlcixcbiAgICB3cmFwOiBudWxsLFxuICAgIHdyaXRpbmdTdWdnZXN0aW9uczogbnVsbCxcblxuICAgIC8vIExlZ2FjeS5cbiAgICAvLyBTZWU6IGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvI290aGVyLWVsZW1lbnRzLC1hdHRyaWJ1dGVzLWFuZC1hcGlzXG4gICAgYWxpZ246IG51bGwsIC8vIFNldmVyYWwuIFVzZSBDU1MgYHRleHQtYWxpZ25gIGluc3RlYWQsXG4gICAgYUxpbms6IG51bGwsIC8vIGA8Ym9keT5gLiBVc2UgQ1NTIGBhOmFjdGl2ZSB7Y29sb3J9YCBpbnN0ZWFkXG4gICAgYXJjaGl2ZTogc3BhY2VTZXBhcmF0ZWQsIC8vIGA8b2JqZWN0PmAuIExpc3Qgb2YgVVJJcyB0byBhcmNoaXZlc1xuICAgIGF4aXM6IG51bGwsIC8vIGA8dGQ+YCBhbmQgYDx0aD5gLiBVc2UgYHNjb3BlYCBvbiBgPHRoPmBcbiAgICBiYWNrZ3JvdW5kOiBudWxsLCAvLyBgPGJvZHk+YC4gVXNlIENTUyBgYmFja2dyb3VuZC1pbWFnZWAgaW5zdGVhZFxuICAgIGJnQ29sb3I6IG51bGwsIC8vIGA8Ym9keT5gIGFuZCB0YWJsZSBlbGVtZW50cy4gVXNlIENTUyBgYmFja2dyb3VuZC1jb2xvcmAgaW5zdGVhZFxuICAgIGJvcmRlcjogbnVtYmVyLCAvLyBgPHRhYmxlPmAuIFVzZSBDU1MgYGJvcmRlci13aWR0aGAgaW5zdGVhZCxcbiAgICBib3JkZXJDb2xvcjogbnVsbCwgLy8gYDx0YWJsZT5gLiBVc2UgQ1NTIGBib3JkZXItY29sb3JgIGluc3RlYWQsXG4gICAgYm90dG9tTWFyZ2luOiBudW1iZXIsIC8vIGA8Ym9keT5gXG4gICAgY2VsbFBhZGRpbmc6IG51bGwsIC8vIGA8dGFibGU+YFxuICAgIGNlbGxTcGFjaW5nOiBudWxsLCAvLyBgPHRhYmxlPmBcbiAgICBjaGFyOiBudWxsLCAvLyBTZXZlcmFsIHRhYmxlIGVsZW1lbnRzLiBXaGVuIGBhbGlnbj1jaGFyYCwgc2V0cyB0aGUgY2hhcmFjdGVyIHRvIGFsaWduIG9uXG4gICAgY2hhck9mZjogbnVsbCwgLy8gU2V2ZXJhbCB0YWJsZSBlbGVtZW50cy4gV2hlbiBgY2hhcmAsIG9mZnNldHMgdGhlIGFsaWdubWVudFxuICAgIGNsYXNzSWQ6IG51bGwsIC8vIGA8b2JqZWN0PmBcbiAgICBjbGVhcjogbnVsbCwgLy8gYDxicj5gLiBVc2UgQ1NTIGBjbGVhcmAgaW5zdGVhZFxuICAgIGNvZGU6IG51bGwsIC8vIGA8b2JqZWN0PmBcbiAgICBjb2RlQmFzZTogbnVsbCwgLy8gYDxvYmplY3Q+YFxuICAgIGNvZGVUeXBlOiBudWxsLCAvLyBgPG9iamVjdD5gXG4gICAgY29sb3I6IG51bGwsIC8vIGA8Zm9udD5gIGFuZCBgPGhyPmAuIFVzZSBDU1MgaW5zdGVhZFxuICAgIGNvbXBhY3Q6IGJvb2xlYW4sIC8vIExpc3RzLiBVc2UgQ1NTIHRvIHJlZHVjZSBzcGFjZSBiZXR3ZWVuIGl0ZW1zIGluc3RlYWRcbiAgICBkZWNsYXJlOiBib29sZWFuLCAvLyBgPG9iamVjdD5gXG4gICAgZXZlbnQ6IG51bGwsIC8vIGA8c2NyaXB0PmBcbiAgICBmYWNlOiBudWxsLCAvLyBgPGZvbnQ+YC4gVXNlIENTUyBpbnN0ZWFkXG4gICAgZnJhbWU6IG51bGwsIC8vIGA8dGFibGU+YFxuICAgIGZyYW1lQm9yZGVyOiBudWxsLCAvLyBgPGlmcmFtZT5gLiBVc2UgQ1NTIGBib3JkZXJgIGluc3RlYWRcbiAgICBoU3BhY2U6IG51bWJlciwgLy8gYDxpbWc+YCBhbmQgYDxvYmplY3Q+YFxuICAgIGxlZnRNYXJnaW46IG51bWJlciwgLy8gYDxib2R5PmBcbiAgICBsaW5rOiBudWxsLCAvLyBgPGJvZHk+YC4gVXNlIENTUyBgYTpsaW5rIHtjb2xvcjogKn1gIGluc3RlYWRcbiAgICBsb25nRGVzYzogbnVsbCwgLy8gYDxmcmFtZT5gLCBgPGlmcmFtZT5gLCBhbmQgYDxpbWc+YC4gVXNlIGFuIGA8YT5gXG4gICAgbG93U3JjOiBudWxsLCAvLyBgPGltZz5gLiBVc2UgYSBgPHBpY3R1cmU+YFxuICAgIG1hcmdpbkhlaWdodDogbnVtYmVyLCAvLyBgPGJvZHk+YFxuICAgIG1hcmdpbldpZHRoOiBudW1iZXIsIC8vIGA8Ym9keT5gXG4gICAgbm9SZXNpemU6IGJvb2xlYW4sIC8vIGA8ZnJhbWU+YFxuICAgIG5vSHJlZjogYm9vbGVhbiwgLy8gYDxhcmVhPmAuIFVzZSBubyBocmVmIGluc3RlYWQgb2YgYW4gZXhwbGljaXQgYG5vaHJlZmBcbiAgICBub1NoYWRlOiBib29sZWFuLCAvLyBgPGhyPmAuIFVzZSBiYWNrZ3JvdW5kLWNvbG9yIGFuZCBoZWlnaHQgaW5zdGVhZCBvZiBib3JkZXJzXG4gICAgbm9XcmFwOiBib29sZWFuLCAvLyBgPHRkPmAgYW5kIGA8dGg+YFxuICAgIG9iamVjdDogbnVsbCwgLy8gYDxhcHBsZXQ+YFxuICAgIHByb2ZpbGU6IG51bGwsIC8vIGA8aGVhZD5gXG4gICAgcHJvbXB0OiBudWxsLCAvLyBgPGlzaW5kZXg+YFxuICAgIHJldjogbnVsbCwgLy8gYDxsaW5rPmBcbiAgICByaWdodE1hcmdpbjogbnVtYmVyLCAvLyBgPGJvZHk+YFxuICAgIHJ1bGVzOiBudWxsLCAvLyBgPHRhYmxlPmBcbiAgICBzY2hlbWU6IG51bGwsIC8vIGA8bWV0YT5gXG4gICAgc2Nyb2xsaW5nOiBib29sZWFuaXNoLCAvLyBgPGZyYW1lPmAuIFVzZSBvdmVyZmxvdyBpbiB0aGUgY2hpbGQgY29udGV4dFxuICAgIHN0YW5kYnk6IG51bGwsIC8vIGA8b2JqZWN0PmBcbiAgICBzdW1tYXJ5OiBudWxsLCAvLyBgPHRhYmxlPmBcbiAgICB0ZXh0OiBudWxsLCAvLyBgPGJvZHk+YC4gVXNlIENTUyBgY29sb3JgIGluc3RlYWRcbiAgICB0b3BNYXJnaW46IG51bWJlciwgLy8gYDxib2R5PmBcbiAgICB2YWx1ZVR5cGU6IG51bGwsIC8vIGA8cGFyYW0+YFxuICAgIHZlcnNpb246IG51bGwsIC8vIGA8aHRtbD5gLiBVc2UgYSBkb2N0eXBlLlxuICAgIHZBbGlnbjogbnVsbCwgLy8gU2V2ZXJhbC4gVXNlIENTUyBgdmVydGljYWwtYWxpZ25gIGluc3RlYWRcbiAgICB2TGluazogbnVsbCwgLy8gYDxib2R5PmAuIFVzZSBDU1MgYGE6dmlzaXRlZCB7Y29sb3J9YCBpbnN0ZWFkXG4gICAgdlNwYWNlOiBudW1iZXIsIC8vIGA8aW1nPmAgYW5kIGA8b2JqZWN0PmBcblxuICAgIC8vIE5vbi1zdGFuZGFyZCBQcm9wZXJ0aWVzLlxuICAgIGFsbG93VHJhbnNwYXJlbmN5OiBudWxsLFxuICAgIGF1dG9Db3JyZWN0OiBudWxsLFxuICAgIGF1dG9TYXZlOiBudWxsLFxuICAgIGRpc2FibGVQaWN0dXJlSW5QaWN0dXJlOiBib29sZWFuLFxuICAgIGRpc2FibGVSZW1vdGVQbGF5YmFjazogYm9vbGVhbixcbiAgICBwcmVmaXg6IG51bGwsXG4gICAgcHJvcGVydHk6IG51bGwsXG4gICAgcmVzdWx0czogbnVtYmVyLFxuICAgIHNlY3VyaXR5OiBudWxsLFxuICAgIHVuc2VsZWN0YWJsZTogbnVsbFxuICB9LFxuICBzcGFjZTogJ2h0bWwnLFxuICB0cmFuc2Zvcm06IGNhc2VJbnNlbnNpdGl2ZVRyYW5zZm9ybVxufSlcbiIsCiAgICAiaW1wb3J0IHtjYXNlU2Vuc2l0aXZlVHJhbnNmb3JtfSBmcm9tICcuL3V0aWwvY2FzZS1zZW5zaXRpdmUtdHJhbnNmb3JtLmpzJ1xuaW1wb3J0IHtjcmVhdGV9IGZyb20gJy4vdXRpbC9jcmVhdGUuanMnXG5pbXBvcnQge1xuICBib29sZWFuLFxuICBjb21tYU9yU3BhY2VTZXBhcmF0ZWQsXG4gIGNvbW1hU2VwYXJhdGVkLFxuICBudW1iZXIsXG4gIHNwYWNlU2VwYXJhdGVkXG59IGZyb20gJy4vdXRpbC90eXBlcy5qcydcblxuZXhwb3J0IGNvbnN0IHN2ZyA9IGNyZWF0ZSh7XG4gIGF0dHJpYnV0ZXM6IHtcbiAgICBhY2NlbnRIZWlnaHQ6ICdhY2NlbnQtaGVpZ2h0JyxcbiAgICBhbGlnbm1lbnRCYXNlbGluZTogJ2FsaWdubWVudC1iYXNlbGluZScsXG4gICAgYXJhYmljRm9ybTogJ2FyYWJpYy1mb3JtJyxcbiAgICBiYXNlbGluZVNoaWZ0OiAnYmFzZWxpbmUtc2hpZnQnLFxuICAgIGNhcEhlaWdodDogJ2NhcC1oZWlnaHQnLFxuICAgIGNsYXNzTmFtZTogJ2NsYXNzJyxcbiAgICBjbGlwUGF0aDogJ2NsaXAtcGF0aCcsXG4gICAgY2xpcFJ1bGU6ICdjbGlwLXJ1bGUnLFxuICAgIGNvbG9ySW50ZXJwb2xhdGlvbjogJ2NvbG9yLWludGVycG9sYXRpb24nLFxuICAgIGNvbG9ySW50ZXJwb2xhdGlvbkZpbHRlcnM6ICdjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnMnLFxuICAgIGNvbG9yUHJvZmlsZTogJ2NvbG9yLXByb2ZpbGUnLFxuICAgIGNvbG9yUmVuZGVyaW5nOiAnY29sb3ItcmVuZGVyaW5nJyxcbiAgICBjcm9zc09yaWdpbjogJ2Nyb3Nzb3JpZ2luJyxcbiAgICBkYXRhVHlwZTogJ2RhdGF0eXBlJyxcbiAgICBkb21pbmFudEJhc2VsaW5lOiAnZG9taW5hbnQtYmFzZWxpbmUnLFxuICAgIGVuYWJsZUJhY2tncm91bmQ6ICdlbmFibGUtYmFja2dyb3VuZCcsXG4gICAgZmlsbE9wYWNpdHk6ICdmaWxsLW9wYWNpdHknLFxuICAgIGZpbGxSdWxlOiAnZmlsbC1ydWxlJyxcbiAgICBmbG9vZENvbG9yOiAnZmxvb2QtY29sb3InLFxuICAgIGZsb29kT3BhY2l0eTogJ2Zsb29kLW9wYWNpdHknLFxuICAgIGZvbnRGYW1pbHk6ICdmb250LWZhbWlseScsXG4gICAgZm9udFNpemU6ICdmb250LXNpemUnLFxuICAgIGZvbnRTaXplQWRqdXN0OiAnZm9udC1zaXplLWFkanVzdCcsXG4gICAgZm9udFN0cmV0Y2g6ICdmb250LXN0cmV0Y2gnLFxuICAgIGZvbnRTdHlsZTogJ2ZvbnQtc3R5bGUnLFxuICAgIGZvbnRWYXJpYW50OiAnZm9udC12YXJpYW50JyxcbiAgICBmb250V2VpZ2h0OiAnZm9udC13ZWlnaHQnLFxuICAgIGdseXBoTmFtZTogJ2dseXBoLW5hbWUnLFxuICAgIGdseXBoT3JpZW50YXRpb25Ib3Jpem9udGFsOiAnZ2x5cGgtb3JpZW50YXRpb24taG9yaXpvbnRhbCcsXG4gICAgZ2x5cGhPcmllbnRhdGlvblZlcnRpY2FsOiAnZ2x5cGgtb3JpZW50YXRpb24tdmVydGljYWwnLFxuICAgIGhyZWZMYW5nOiAnaHJlZmxhbmcnLFxuICAgIGhvcml6QWR2WDogJ2hvcml6LWFkdi14JyxcbiAgICBob3Jpek9yaWdpblg6ICdob3Jpei1vcmlnaW4teCcsXG4gICAgaG9yaXpPcmlnaW5ZOiAnaG9yaXotb3JpZ2luLXknLFxuICAgIGltYWdlUmVuZGVyaW5nOiAnaW1hZ2UtcmVuZGVyaW5nJyxcbiAgICBsZXR0ZXJTcGFjaW5nOiAnbGV0dGVyLXNwYWNpbmcnLFxuICAgIGxpZ2h0aW5nQ29sb3I6ICdsaWdodGluZy1jb2xvcicsXG4gICAgbWFya2VyRW5kOiAnbWFya2VyLWVuZCcsXG4gICAgbWFya2VyTWlkOiAnbWFya2VyLW1pZCcsXG4gICAgbWFya2VyU3RhcnQ6ICdtYXJrZXItc3RhcnQnLFxuICAgIG5hdkRvd246ICduYXYtZG93bicsXG4gICAgbmF2RG93bkxlZnQ6ICduYXYtZG93bi1sZWZ0JyxcbiAgICBuYXZEb3duUmlnaHQ6ICduYXYtZG93bi1yaWdodCcsXG4gICAgbmF2TGVmdDogJ25hdi1sZWZ0JyxcbiAgICBuYXZOZXh0OiAnbmF2LW5leHQnLFxuICAgIG5hdlByZXY6ICduYXYtcHJldicsXG4gICAgbmF2UmlnaHQ6ICduYXYtcmlnaHQnLFxuICAgIG5hdlVwOiAnbmF2LXVwJyxcbiAgICBuYXZVcExlZnQ6ICduYXYtdXAtbGVmdCcsXG4gICAgbmF2VXBSaWdodDogJ25hdi11cC1yaWdodCcsXG4gICAgb25BYm9ydDogJ29uYWJvcnQnLFxuICAgIG9uQWN0aXZhdGU6ICdvbmFjdGl2YXRlJyxcbiAgICBvbkFmdGVyUHJpbnQ6ICdvbmFmdGVycHJpbnQnLFxuICAgIG9uQmVmb3JlUHJpbnQ6ICdvbmJlZm9yZXByaW50JyxcbiAgICBvbkJlZ2luOiAnb25iZWdpbicsXG4gICAgb25DYW5jZWw6ICdvbmNhbmNlbCcsXG4gICAgb25DYW5QbGF5OiAnb25jYW5wbGF5JyxcbiAgICBvbkNhblBsYXlUaHJvdWdoOiAnb25jYW5wbGF5dGhyb3VnaCcsXG4gICAgb25DaGFuZ2U6ICdvbmNoYW5nZScsXG4gICAgb25DbGljazogJ29uY2xpY2snLFxuICAgIG9uQ2xvc2U6ICdvbmNsb3NlJyxcbiAgICBvbkNvcHk6ICdvbmNvcHknLFxuICAgIG9uQ3VlQ2hhbmdlOiAnb25jdWVjaGFuZ2UnLFxuICAgIG9uQ3V0OiAnb25jdXQnLFxuICAgIG9uRGJsQ2xpY2s6ICdvbmRibGNsaWNrJyxcbiAgICBvbkRyYWc6ICdvbmRyYWcnLFxuICAgIG9uRHJhZ0VuZDogJ29uZHJhZ2VuZCcsXG4gICAgb25EcmFnRW50ZXI6ICdvbmRyYWdlbnRlcicsXG4gICAgb25EcmFnRXhpdDogJ29uZHJhZ2V4aXQnLFxuICAgIG9uRHJhZ0xlYXZlOiAnb25kcmFnbGVhdmUnLFxuICAgIG9uRHJhZ092ZXI6ICdvbmRyYWdvdmVyJyxcbiAgICBvbkRyYWdTdGFydDogJ29uZHJhZ3N0YXJ0JyxcbiAgICBvbkRyb3A6ICdvbmRyb3AnLFxuICAgIG9uRHVyYXRpb25DaGFuZ2U6ICdvbmR1cmF0aW9uY2hhbmdlJyxcbiAgICBvbkVtcHRpZWQ6ICdvbmVtcHRpZWQnLFxuICAgIG9uRW5kOiAnb25lbmQnLFxuICAgIG9uRW5kZWQ6ICdvbmVuZGVkJyxcbiAgICBvbkVycm9yOiAnb25lcnJvcicsXG4gICAgb25Gb2N1czogJ29uZm9jdXMnLFxuICAgIG9uRm9jdXNJbjogJ29uZm9jdXNpbicsXG4gICAgb25Gb2N1c091dDogJ29uZm9jdXNvdXQnLFxuICAgIG9uSGFzaENoYW5nZTogJ29uaGFzaGNoYW5nZScsXG4gICAgb25JbnB1dDogJ29uaW5wdXQnLFxuICAgIG9uSW52YWxpZDogJ29uaW52YWxpZCcsXG4gICAgb25LZXlEb3duOiAnb25rZXlkb3duJyxcbiAgICBvbktleVByZXNzOiAnb25rZXlwcmVzcycsXG4gICAgb25LZXlVcDogJ29ua2V5dXAnLFxuICAgIG9uTG9hZDogJ29ubG9hZCcsXG4gICAgb25Mb2FkZWREYXRhOiAnb25sb2FkZWRkYXRhJyxcbiAgICBvbkxvYWRlZE1ldGFkYXRhOiAnb25sb2FkZWRtZXRhZGF0YScsXG4gICAgb25Mb2FkU3RhcnQ6ICdvbmxvYWRzdGFydCcsXG4gICAgb25NZXNzYWdlOiAnb25tZXNzYWdlJyxcbiAgICBvbk1vdXNlRG93bjogJ29ubW91c2Vkb3duJyxcbiAgICBvbk1vdXNlRW50ZXI6ICdvbm1vdXNlZW50ZXInLFxuICAgIG9uTW91c2VMZWF2ZTogJ29ubW91c2VsZWF2ZScsXG4gICAgb25Nb3VzZU1vdmU6ICdvbm1vdXNlbW92ZScsXG4gICAgb25Nb3VzZU91dDogJ29ubW91c2VvdXQnLFxuICAgIG9uTW91c2VPdmVyOiAnb25tb3VzZW92ZXInLFxuICAgIG9uTW91c2VVcDogJ29ubW91c2V1cCcsXG4gICAgb25Nb3VzZVdoZWVsOiAnb25tb3VzZXdoZWVsJyxcbiAgICBvbk9mZmxpbmU6ICdvbm9mZmxpbmUnLFxuICAgIG9uT25saW5lOiAnb25vbmxpbmUnLFxuICAgIG9uUGFnZUhpZGU6ICdvbnBhZ2VoaWRlJyxcbiAgICBvblBhZ2VTaG93OiAnb25wYWdlc2hvdycsXG4gICAgb25QYXN0ZTogJ29ucGFzdGUnLFxuICAgIG9uUGF1c2U6ICdvbnBhdXNlJyxcbiAgICBvblBsYXk6ICdvbnBsYXknLFxuICAgIG9uUGxheWluZzogJ29ucGxheWluZycsXG4gICAgb25Qb3BTdGF0ZTogJ29ucG9wc3RhdGUnLFxuICAgIG9uUHJvZ3Jlc3M6ICdvbnByb2dyZXNzJyxcbiAgICBvblJhdGVDaGFuZ2U6ICdvbnJhdGVjaGFuZ2UnLFxuICAgIG9uUmVwZWF0OiAnb25yZXBlYXQnLFxuICAgIG9uUmVzZXQ6ICdvbnJlc2V0JyxcbiAgICBvblJlc2l6ZTogJ29ucmVzaXplJyxcbiAgICBvblNjcm9sbDogJ29uc2Nyb2xsJyxcbiAgICBvblNlZWtlZDogJ29uc2Vla2VkJyxcbiAgICBvblNlZWtpbmc6ICdvbnNlZWtpbmcnLFxuICAgIG9uU2VsZWN0OiAnb25zZWxlY3QnLFxuICAgIG9uU2hvdzogJ29uc2hvdycsXG4gICAgb25TdGFsbGVkOiAnb25zdGFsbGVkJyxcbiAgICBvblN0b3JhZ2U6ICdvbnN0b3JhZ2UnLFxuICAgIG9uU3VibWl0OiAnb25zdWJtaXQnLFxuICAgIG9uU3VzcGVuZDogJ29uc3VzcGVuZCcsXG4gICAgb25UaW1lVXBkYXRlOiAnb250aW1ldXBkYXRlJyxcbiAgICBvblRvZ2dsZTogJ29udG9nZ2xlJyxcbiAgICBvblVubG9hZDogJ29udW5sb2FkJyxcbiAgICBvblZvbHVtZUNoYW5nZTogJ29udm9sdW1lY2hhbmdlJyxcbiAgICBvbldhaXRpbmc6ICdvbndhaXRpbmcnLFxuICAgIG9uWm9vbTogJ29uem9vbScsXG4gICAgb3ZlcmxpbmVQb3NpdGlvbjogJ292ZXJsaW5lLXBvc2l0aW9uJyxcbiAgICBvdmVybGluZVRoaWNrbmVzczogJ292ZXJsaW5lLXRoaWNrbmVzcycsXG4gICAgcGFpbnRPcmRlcjogJ3BhaW50LW9yZGVyJyxcbiAgICBwYW5vc2UxOiAncGFub3NlLTEnLFxuICAgIHBvaW50ZXJFdmVudHM6ICdwb2ludGVyLWV2ZW50cycsXG4gICAgcmVmZXJyZXJQb2xpY3k6ICdyZWZlcnJlcnBvbGljeScsXG4gICAgcmVuZGVyaW5nSW50ZW50OiAncmVuZGVyaW5nLWludGVudCcsXG4gICAgc2hhcGVSZW5kZXJpbmc6ICdzaGFwZS1yZW5kZXJpbmcnLFxuICAgIHN0b3BDb2xvcjogJ3N0b3AtY29sb3InLFxuICAgIHN0b3BPcGFjaXR5OiAnc3RvcC1vcGFjaXR5JyxcbiAgICBzdHJpa2V0aHJvdWdoUG9zaXRpb246ICdzdHJpa2V0aHJvdWdoLXBvc2l0aW9uJyxcbiAgICBzdHJpa2V0aHJvdWdoVGhpY2tuZXNzOiAnc3RyaWtldGhyb3VnaC10aGlja25lc3MnLFxuICAgIHN0cm9rZURhc2hBcnJheTogJ3N0cm9rZS1kYXNoYXJyYXknLFxuICAgIHN0cm9rZURhc2hPZmZzZXQ6ICdzdHJva2UtZGFzaG9mZnNldCcsXG4gICAgc3Ryb2tlTGluZUNhcDogJ3N0cm9rZS1saW5lY2FwJyxcbiAgICBzdHJva2VMaW5lSm9pbjogJ3N0cm9rZS1saW5lam9pbicsXG4gICAgc3Ryb2tlTWl0ZXJMaW1pdDogJ3N0cm9rZS1taXRlcmxpbWl0JyxcbiAgICBzdHJva2VPcGFjaXR5OiAnc3Ryb2tlLW9wYWNpdHknLFxuICAgIHN0cm9rZVdpZHRoOiAnc3Ryb2tlLXdpZHRoJyxcbiAgICB0YWJJbmRleDogJ3RhYmluZGV4JyxcbiAgICB0ZXh0QW5jaG9yOiAndGV4dC1hbmNob3InLFxuICAgIHRleHREZWNvcmF0aW9uOiAndGV4dC1kZWNvcmF0aW9uJyxcbiAgICB0ZXh0UmVuZGVyaW5nOiAndGV4dC1yZW5kZXJpbmcnLFxuICAgIHRyYW5zZm9ybU9yaWdpbjogJ3RyYW5zZm9ybS1vcmlnaW4nLFxuICAgIHR5cGVPZjogJ3R5cGVvZicsXG4gICAgdW5kZXJsaW5lUG9zaXRpb246ICd1bmRlcmxpbmUtcG9zaXRpb24nLFxuICAgIHVuZGVybGluZVRoaWNrbmVzczogJ3VuZGVybGluZS10aGlja25lc3MnLFxuICAgIHVuaWNvZGVCaWRpOiAndW5pY29kZS1iaWRpJyxcbiAgICB1bmljb2RlUmFuZ2U6ICd1bmljb2RlLXJhbmdlJyxcbiAgICB1bml0c1BlckVtOiAndW5pdHMtcGVyLWVtJyxcbiAgICB2QWxwaGFiZXRpYzogJ3YtYWxwaGFiZXRpYycsXG4gICAgdkhhbmdpbmc6ICd2LWhhbmdpbmcnLFxuICAgIHZJZGVvZ3JhcGhpYzogJ3YtaWRlb2dyYXBoaWMnLFxuICAgIHZNYXRoZW1hdGljYWw6ICd2LW1hdGhlbWF0aWNhbCcsXG4gICAgdmVjdG9yRWZmZWN0OiAndmVjdG9yLWVmZmVjdCcsXG4gICAgdmVydEFkdlk6ICd2ZXJ0LWFkdi15JyxcbiAgICB2ZXJ0T3JpZ2luWDogJ3ZlcnQtb3JpZ2luLXgnLFxuICAgIHZlcnRPcmlnaW5ZOiAndmVydC1vcmlnaW4teScsXG4gICAgd29yZFNwYWNpbmc6ICd3b3JkLXNwYWNpbmcnLFxuICAgIHdyaXRpbmdNb2RlOiAnd3JpdGluZy1tb2RlJyxcbiAgICB4SGVpZ2h0OiAneC1oZWlnaHQnLFxuICAgIC8vIFRoZXNlIHdlcmUgY2FtZWxjYXNlZCBpbiBUaW55LiBOb3cgbG93ZXJjYXNlZCBpbiBTVkcgMlxuICAgIHBsYXliYWNrT3JkZXI6ICdwbGF5YmFja29yZGVyJyxcbiAgICB0aW1lbGluZUJlZ2luOiAndGltZWxpbmViZWdpbidcbiAgfSxcbiAgcHJvcGVydGllczoge1xuICAgIGFib3V0OiBjb21tYU9yU3BhY2VTZXBhcmF0ZWQsXG4gICAgYWNjZW50SGVpZ2h0OiBudW1iZXIsXG4gICAgYWNjdW11bGF0ZTogbnVsbCxcbiAgICBhZGRpdGl2ZTogbnVsbCxcbiAgICBhbGlnbm1lbnRCYXNlbGluZTogbnVsbCxcbiAgICBhbHBoYWJldGljOiBudW1iZXIsXG4gICAgYW1wbGl0dWRlOiBudW1iZXIsXG4gICAgYXJhYmljRm9ybTogbnVsbCxcbiAgICBhc2NlbnQ6IG51bWJlcixcbiAgICBhdHRyaWJ1dGVOYW1lOiBudWxsLFxuICAgIGF0dHJpYnV0ZVR5cGU6IG51bGwsXG4gICAgYXppbXV0aDogbnVtYmVyLFxuICAgIGJhbmR3aWR0aDogbnVsbCxcbiAgICBiYXNlbGluZVNoaWZ0OiBudWxsLFxuICAgIGJhc2VGcmVxdWVuY3k6IG51bGwsXG4gICAgYmFzZVByb2ZpbGU6IG51bGwsXG4gICAgYmJveDogbnVsbCxcbiAgICBiZWdpbjogbnVsbCxcbiAgICBiaWFzOiBudW1iZXIsXG4gICAgYnk6IG51bGwsXG4gICAgY2FsY01vZGU6IG51bGwsXG4gICAgY2FwSGVpZ2h0OiBudW1iZXIsXG4gICAgY2xhc3NOYW1lOiBzcGFjZVNlcGFyYXRlZCxcbiAgICBjbGlwOiBudWxsLFxuICAgIGNsaXBQYXRoOiBudWxsLFxuICAgIGNsaXBQYXRoVW5pdHM6IG51bGwsXG4gICAgY2xpcFJ1bGU6IG51bGwsXG4gICAgY29sb3I6IG51bGwsXG4gICAgY29sb3JJbnRlcnBvbGF0aW9uOiBudWxsLFxuICAgIGNvbG9ySW50ZXJwb2xhdGlvbkZpbHRlcnM6IG51bGwsXG4gICAgY29sb3JQcm9maWxlOiBudWxsLFxuICAgIGNvbG9yUmVuZGVyaW5nOiBudWxsLFxuICAgIGNvbnRlbnQ6IG51bGwsXG4gICAgY29udGVudFNjcmlwdFR5cGU6IG51bGwsXG4gICAgY29udGVudFN0eWxlVHlwZTogbnVsbCxcbiAgICBjcm9zc09yaWdpbjogbnVsbCxcbiAgICBjdXJzb3I6IG51bGwsXG4gICAgY3g6IG51bGwsXG4gICAgY3k6IG51bGwsXG4gICAgZDogbnVsbCxcbiAgICBkYXRhVHlwZTogbnVsbCxcbiAgICBkZWZhdWx0QWN0aW9uOiBudWxsLFxuICAgIGRlc2NlbnQ6IG51bWJlcixcbiAgICBkaWZmdXNlQ29uc3RhbnQ6IG51bWJlcixcbiAgICBkaXJlY3Rpb246IG51bGwsXG4gICAgZGlzcGxheTogbnVsbCxcbiAgICBkdXI6IG51bGwsXG4gICAgZGl2aXNvcjogbnVtYmVyLFxuICAgIGRvbWluYW50QmFzZWxpbmU6IG51bGwsXG4gICAgZG93bmxvYWQ6IGJvb2xlYW4sXG4gICAgZHg6IG51bGwsXG4gICAgZHk6IG51bGwsXG4gICAgZWRnZU1vZGU6IG51bGwsXG4gICAgZWRpdGFibGU6IG51bGwsXG4gICAgZWxldmF0aW9uOiBudW1iZXIsXG4gICAgZW5hYmxlQmFja2dyb3VuZDogbnVsbCxcbiAgICBlbmQ6IG51bGwsXG4gICAgZXZlbnQ6IG51bGwsXG4gICAgZXhwb25lbnQ6IG51bWJlcixcbiAgICBleHRlcm5hbFJlc291cmNlc1JlcXVpcmVkOiBudWxsLFxuICAgIGZpbGw6IG51bGwsXG4gICAgZmlsbE9wYWNpdHk6IG51bWJlcixcbiAgICBmaWxsUnVsZTogbnVsbCxcbiAgICBmaWx0ZXI6IG51bGwsXG4gICAgZmlsdGVyUmVzOiBudWxsLFxuICAgIGZpbHRlclVuaXRzOiBudWxsLFxuICAgIGZsb29kQ29sb3I6IG51bGwsXG4gICAgZmxvb2RPcGFjaXR5OiBudWxsLFxuICAgIGZvY3VzYWJsZTogbnVsbCxcbiAgICBmb2N1c0hpZ2hsaWdodDogbnVsbCxcbiAgICBmb250RmFtaWx5OiBudWxsLFxuICAgIGZvbnRTaXplOiBudWxsLFxuICAgIGZvbnRTaXplQWRqdXN0OiBudWxsLFxuICAgIGZvbnRTdHJldGNoOiBudWxsLFxuICAgIGZvbnRTdHlsZTogbnVsbCxcbiAgICBmb250VmFyaWFudDogbnVsbCxcbiAgICBmb250V2VpZ2h0OiBudWxsLFxuICAgIGZvcm1hdDogbnVsbCxcbiAgICBmcjogbnVsbCxcbiAgICBmcm9tOiBudWxsLFxuICAgIGZ4OiBudWxsLFxuICAgIGZ5OiBudWxsLFxuICAgIGcxOiBjb21tYVNlcGFyYXRlZCxcbiAgICBnMjogY29tbWFTZXBhcmF0ZWQsXG4gICAgZ2x5cGhOYW1lOiBjb21tYVNlcGFyYXRlZCxcbiAgICBnbHlwaE9yaWVudGF0aW9uSG9yaXpvbnRhbDogbnVsbCxcbiAgICBnbHlwaE9yaWVudGF0aW9uVmVydGljYWw6IG51bGwsXG4gICAgZ2x5cGhSZWY6IG51bGwsXG4gICAgZ3JhZGllbnRUcmFuc2Zvcm06IG51bGwsXG4gICAgZ3JhZGllbnRVbml0czogbnVsbCxcbiAgICBoYW5kbGVyOiBudWxsLFxuICAgIGhhbmdpbmc6IG51bWJlcixcbiAgICBoYXRjaENvbnRlbnRVbml0czogbnVsbCxcbiAgICBoYXRjaFVuaXRzOiBudWxsLFxuICAgIGhlaWdodDogbnVsbCxcbiAgICBocmVmOiBudWxsLFxuICAgIGhyZWZMYW5nOiBudWxsLFxuICAgIGhvcml6QWR2WDogbnVtYmVyLFxuICAgIGhvcml6T3JpZ2luWDogbnVtYmVyLFxuICAgIGhvcml6T3JpZ2luWTogbnVtYmVyLFxuICAgIGlkOiBudWxsLFxuICAgIGlkZW9ncmFwaGljOiBudW1iZXIsXG4gICAgaW1hZ2VSZW5kZXJpbmc6IG51bGwsXG4gICAgaW5pdGlhbFZpc2liaWxpdHk6IG51bGwsXG4gICAgaW46IG51bGwsXG4gICAgaW4yOiBudWxsLFxuICAgIGludGVyY2VwdDogbnVtYmVyLFxuICAgIGs6IG51bWJlcixcbiAgICBrMTogbnVtYmVyLFxuICAgIGsyOiBudW1iZXIsXG4gICAgazM6IG51bWJlcixcbiAgICBrNDogbnVtYmVyLFxuICAgIGtlcm5lbE1hdHJpeDogY29tbWFPclNwYWNlU2VwYXJhdGVkLFxuICAgIGtlcm5lbFVuaXRMZW5ndGg6IG51bGwsXG4gICAga2V5UG9pbnRzOiBudWxsLCAvLyBTRU1JX0NPTE9OX1NFUEFSQVRFRFxuICAgIGtleVNwbGluZXM6IG51bGwsIC8vIFNFTUlfQ09MT05fU0VQQVJBVEVEXG4gICAga2V5VGltZXM6IG51bGwsIC8vIFNFTUlfQ09MT05fU0VQQVJBVEVEXG4gICAga2VybmluZzogbnVsbCxcbiAgICBsYW5nOiBudWxsLFxuICAgIGxlbmd0aEFkanVzdDogbnVsbCxcbiAgICBsZXR0ZXJTcGFjaW5nOiBudWxsLFxuICAgIGxpZ2h0aW5nQ29sb3I6IG51bGwsXG4gICAgbGltaXRpbmdDb25lQW5nbGU6IG51bWJlcixcbiAgICBsb2NhbDogbnVsbCxcbiAgICBtYXJrZXJFbmQ6IG51bGwsXG4gICAgbWFya2VyTWlkOiBudWxsLFxuICAgIG1hcmtlclN0YXJ0OiBudWxsLFxuICAgIG1hcmtlckhlaWdodDogbnVsbCxcbiAgICBtYXJrZXJVbml0czogbnVsbCxcbiAgICBtYXJrZXJXaWR0aDogbnVsbCxcbiAgICBtYXNrOiBudWxsLFxuICAgIG1hc2tDb250ZW50VW5pdHM6IG51bGwsXG4gICAgbWFza1VuaXRzOiBudWxsLFxuICAgIG1hdGhlbWF0aWNhbDogbnVsbCxcbiAgICBtYXg6IG51bGwsXG4gICAgbWVkaWE6IG51bGwsXG4gICAgbWVkaWFDaGFyYWN0ZXJFbmNvZGluZzogbnVsbCxcbiAgICBtZWRpYUNvbnRlbnRFbmNvZGluZ3M6IG51bGwsXG4gICAgbWVkaWFTaXplOiBudW1iZXIsXG4gICAgbWVkaWFUaW1lOiBudWxsLFxuICAgIG1ldGhvZDogbnVsbCxcbiAgICBtaW46IG51bGwsXG4gICAgbW9kZTogbnVsbCxcbiAgICBuYW1lOiBudWxsLFxuICAgIG5hdkRvd246IG51bGwsXG4gICAgbmF2RG93bkxlZnQ6IG51bGwsXG4gICAgbmF2RG93blJpZ2h0OiBudWxsLFxuICAgIG5hdkxlZnQ6IG51bGwsXG4gICAgbmF2TmV4dDogbnVsbCxcbiAgICBuYXZQcmV2OiBudWxsLFxuICAgIG5hdlJpZ2h0OiBudWxsLFxuICAgIG5hdlVwOiBudWxsLFxuICAgIG5hdlVwTGVmdDogbnVsbCxcbiAgICBuYXZVcFJpZ2h0OiBudWxsLFxuICAgIG51bU9jdGF2ZXM6IG51bGwsXG4gICAgb2JzZXJ2ZXI6IG51bGwsXG4gICAgb2Zmc2V0OiBudWxsLFxuICAgIG9uQWJvcnQ6IG51bGwsXG4gICAgb25BY3RpdmF0ZTogbnVsbCxcbiAgICBvbkFmdGVyUHJpbnQ6IG51bGwsXG4gICAgb25CZWZvcmVQcmludDogbnVsbCxcbiAgICBvbkJlZ2luOiBudWxsLFxuICAgIG9uQ2FuY2VsOiBudWxsLFxuICAgIG9uQ2FuUGxheTogbnVsbCxcbiAgICBvbkNhblBsYXlUaHJvdWdoOiBudWxsLFxuICAgIG9uQ2hhbmdlOiBudWxsLFxuICAgIG9uQ2xpY2s6IG51bGwsXG4gICAgb25DbG9zZTogbnVsbCxcbiAgICBvbkNvcHk6IG51bGwsXG4gICAgb25DdWVDaGFuZ2U6IG51bGwsXG4gICAgb25DdXQ6IG51bGwsXG4gICAgb25EYmxDbGljazogbnVsbCxcbiAgICBvbkRyYWc6IG51bGwsXG4gICAgb25EcmFnRW5kOiBudWxsLFxuICAgIG9uRHJhZ0VudGVyOiBudWxsLFxuICAgIG9uRHJhZ0V4aXQ6IG51bGwsXG4gICAgb25EcmFnTGVhdmU6IG51bGwsXG4gICAgb25EcmFnT3ZlcjogbnVsbCxcbiAgICBvbkRyYWdTdGFydDogbnVsbCxcbiAgICBvbkRyb3A6IG51bGwsXG4gICAgb25EdXJhdGlvbkNoYW5nZTogbnVsbCxcbiAgICBvbkVtcHRpZWQ6IG51bGwsXG4gICAgb25FbmQ6IG51bGwsXG4gICAgb25FbmRlZDogbnVsbCxcbiAgICBvbkVycm9yOiBudWxsLFxuICAgIG9uRm9jdXM6IG51bGwsXG4gICAgb25Gb2N1c0luOiBudWxsLFxuICAgIG9uRm9jdXNPdXQ6IG51bGwsXG4gICAgb25IYXNoQ2hhbmdlOiBudWxsLFxuICAgIG9uSW5wdXQ6IG51bGwsXG4gICAgb25JbnZhbGlkOiBudWxsLFxuICAgIG9uS2V5RG93bjogbnVsbCxcbiAgICBvbktleVByZXNzOiBudWxsLFxuICAgIG9uS2V5VXA6IG51bGwsXG4gICAgb25Mb2FkOiBudWxsLFxuICAgIG9uTG9hZGVkRGF0YTogbnVsbCxcbiAgICBvbkxvYWRlZE1ldGFkYXRhOiBudWxsLFxuICAgIG9uTG9hZFN0YXJ0OiBudWxsLFxuICAgIG9uTWVzc2FnZTogbnVsbCxcbiAgICBvbk1vdXNlRG93bjogbnVsbCxcbiAgICBvbk1vdXNlRW50ZXI6IG51bGwsXG4gICAgb25Nb3VzZUxlYXZlOiBudWxsLFxuICAgIG9uTW91c2VNb3ZlOiBudWxsLFxuICAgIG9uTW91c2VPdXQ6IG51bGwsXG4gICAgb25Nb3VzZU92ZXI6IG51bGwsXG4gICAgb25Nb3VzZVVwOiBudWxsLFxuICAgIG9uTW91c2VXaGVlbDogbnVsbCxcbiAgICBvbk9mZmxpbmU6IG51bGwsXG4gICAgb25PbmxpbmU6IG51bGwsXG4gICAgb25QYWdlSGlkZTogbnVsbCxcbiAgICBvblBhZ2VTaG93OiBudWxsLFxuICAgIG9uUGFzdGU6IG51bGwsXG4gICAgb25QYXVzZTogbnVsbCxcbiAgICBvblBsYXk6IG51bGwsXG4gICAgb25QbGF5aW5nOiBudWxsLFxuICAgIG9uUG9wU3RhdGU6IG51bGwsXG4gICAgb25Qcm9ncmVzczogbnVsbCxcbiAgICBvblJhdGVDaGFuZ2U6IG51bGwsXG4gICAgb25SZXBlYXQ6IG51bGwsXG4gICAgb25SZXNldDogbnVsbCxcbiAgICBvblJlc2l6ZTogbnVsbCxcbiAgICBvblNjcm9sbDogbnVsbCxcbiAgICBvblNlZWtlZDogbnVsbCxcbiAgICBvblNlZWtpbmc6IG51bGwsXG4gICAgb25TZWxlY3Q6IG51bGwsXG4gICAgb25TaG93OiBudWxsLFxuICAgIG9uU3RhbGxlZDogbnVsbCxcbiAgICBvblN0b3JhZ2U6IG51bGwsXG4gICAgb25TdWJtaXQ6IG51bGwsXG4gICAgb25TdXNwZW5kOiBudWxsLFxuICAgIG9uVGltZVVwZGF0ZTogbnVsbCxcbiAgICBvblRvZ2dsZTogbnVsbCxcbiAgICBvblVubG9hZDogbnVsbCxcbiAgICBvblZvbHVtZUNoYW5nZTogbnVsbCxcbiAgICBvbldhaXRpbmc6IG51bGwsXG4gICAgb25ab29tOiBudWxsLFxuICAgIG9wYWNpdHk6IG51bGwsXG4gICAgb3BlcmF0b3I6IG51bGwsXG4gICAgb3JkZXI6IG51bGwsXG4gICAgb3JpZW50OiBudWxsLFxuICAgIG9yaWVudGF0aW9uOiBudWxsLFxuICAgIG9yaWdpbjogbnVsbCxcbiAgICBvdmVyZmxvdzogbnVsbCxcbiAgICBvdmVybGF5OiBudWxsLFxuICAgIG92ZXJsaW5lUG9zaXRpb246IG51bWJlcixcbiAgICBvdmVybGluZVRoaWNrbmVzczogbnVtYmVyLFxuICAgIHBhaW50T3JkZXI6IG51bGwsXG4gICAgcGFub3NlMTogbnVsbCxcbiAgICBwYXRoOiBudWxsLFxuICAgIHBhdGhMZW5ndGg6IG51bWJlcixcbiAgICBwYXR0ZXJuQ29udGVudFVuaXRzOiBudWxsLFxuICAgIHBhdHRlcm5UcmFuc2Zvcm06IG51bGwsXG4gICAgcGF0dGVyblVuaXRzOiBudWxsLFxuICAgIHBoYXNlOiBudWxsLFxuICAgIHBpbmc6IHNwYWNlU2VwYXJhdGVkLFxuICAgIHBpdGNoOiBudWxsLFxuICAgIHBsYXliYWNrT3JkZXI6IG51bGwsXG4gICAgcG9pbnRlckV2ZW50czogbnVsbCxcbiAgICBwb2ludHM6IG51bGwsXG4gICAgcG9pbnRzQXRYOiBudW1iZXIsXG4gICAgcG9pbnRzQXRZOiBudW1iZXIsXG4gICAgcG9pbnRzQXRaOiBudW1iZXIsXG4gICAgcHJlc2VydmVBbHBoYTogbnVsbCxcbiAgICBwcmVzZXJ2ZUFzcGVjdFJhdGlvOiBudWxsLFxuICAgIHByaW1pdGl2ZVVuaXRzOiBudWxsLFxuICAgIHByb3BhZ2F0ZTogbnVsbCxcbiAgICBwcm9wZXJ0eTogY29tbWFPclNwYWNlU2VwYXJhdGVkLFxuICAgIHI6IG51bGwsXG4gICAgcmFkaXVzOiBudWxsLFxuICAgIHJlZmVycmVyUG9saWN5OiBudWxsLFxuICAgIHJlZlg6IG51bGwsXG4gICAgcmVmWTogbnVsbCxcbiAgICByZWw6IGNvbW1hT3JTcGFjZVNlcGFyYXRlZCxcbiAgICByZXY6IGNvbW1hT3JTcGFjZVNlcGFyYXRlZCxcbiAgICByZW5kZXJpbmdJbnRlbnQ6IG51bGwsXG4gICAgcmVwZWF0Q291bnQ6IG51bGwsXG4gICAgcmVwZWF0RHVyOiBudWxsLFxuICAgIHJlcXVpcmVkRXh0ZW5zaW9uczogY29tbWFPclNwYWNlU2VwYXJhdGVkLFxuICAgIHJlcXVpcmVkRmVhdHVyZXM6IGNvbW1hT3JTcGFjZVNlcGFyYXRlZCxcbiAgICByZXF1aXJlZEZvbnRzOiBjb21tYU9yU3BhY2VTZXBhcmF0ZWQsXG4gICAgcmVxdWlyZWRGb3JtYXRzOiBjb21tYU9yU3BhY2VTZXBhcmF0ZWQsXG4gICAgcmVzb3VyY2U6IG51bGwsXG4gICAgcmVzdGFydDogbnVsbCxcbiAgICByZXN1bHQ6IG51bGwsXG4gICAgcm90YXRlOiBudWxsLFxuICAgIHJ4OiBudWxsLFxuICAgIHJ5OiBudWxsLFxuICAgIHNjYWxlOiBudWxsLFxuICAgIHNlZWQ6IG51bGwsXG4gICAgc2hhcGVSZW5kZXJpbmc6IG51bGwsXG4gICAgc2lkZTogbnVsbCxcbiAgICBzbG9wZTogbnVsbCxcbiAgICBzbmFwc2hvdFRpbWU6IG51bGwsXG4gICAgc3BlY3VsYXJDb25zdGFudDogbnVtYmVyLFxuICAgIHNwZWN1bGFyRXhwb25lbnQ6IG51bWJlcixcbiAgICBzcHJlYWRNZXRob2Q6IG51bGwsXG4gICAgc3BhY2luZzogbnVsbCxcbiAgICBzdGFydE9mZnNldDogbnVsbCxcbiAgICBzdGREZXZpYXRpb246IG51bGwsXG4gICAgc3RlbWg6IG51bGwsXG4gICAgc3RlbXY6IG51bGwsXG4gICAgc3RpdGNoVGlsZXM6IG51bGwsXG4gICAgc3RvcENvbG9yOiBudWxsLFxuICAgIHN0b3BPcGFjaXR5OiBudWxsLFxuICAgIHN0cmlrZXRocm91Z2hQb3NpdGlvbjogbnVtYmVyLFxuICAgIHN0cmlrZXRocm91Z2hUaGlja25lc3M6IG51bWJlcixcbiAgICBzdHJpbmc6IG51bGwsXG4gICAgc3Ryb2tlOiBudWxsLFxuICAgIHN0cm9rZURhc2hBcnJheTogY29tbWFPclNwYWNlU2VwYXJhdGVkLFxuICAgIHN0cm9rZURhc2hPZmZzZXQ6IG51bGwsXG4gICAgc3Ryb2tlTGluZUNhcDogbnVsbCxcbiAgICBzdHJva2VMaW5lSm9pbjogbnVsbCxcbiAgICBzdHJva2VNaXRlckxpbWl0OiBudW1iZXIsXG4gICAgc3Ryb2tlT3BhY2l0eTogbnVtYmVyLFxuICAgIHN0cm9rZVdpZHRoOiBudWxsLFxuICAgIHN0eWxlOiBudWxsLFxuICAgIHN1cmZhY2VTY2FsZTogbnVtYmVyLFxuICAgIHN5bmNCZWhhdmlvcjogbnVsbCxcbiAgICBzeW5jQmVoYXZpb3JEZWZhdWx0OiBudWxsLFxuICAgIHN5bmNNYXN0ZXI6IG51bGwsXG4gICAgc3luY1RvbGVyYW5jZTogbnVsbCxcbiAgICBzeW5jVG9sZXJhbmNlRGVmYXVsdDogbnVsbCxcbiAgICBzeXN0ZW1MYW5ndWFnZTogY29tbWFPclNwYWNlU2VwYXJhdGVkLFxuICAgIHRhYkluZGV4OiBudW1iZXIsXG4gICAgdGFibGVWYWx1ZXM6IG51bGwsXG4gICAgdGFyZ2V0OiBudWxsLFxuICAgIHRhcmdldFg6IG51bWJlcixcbiAgICB0YXJnZXRZOiBudW1iZXIsXG4gICAgdGV4dEFuY2hvcjogbnVsbCxcbiAgICB0ZXh0RGVjb3JhdGlvbjogbnVsbCxcbiAgICB0ZXh0UmVuZGVyaW5nOiBudWxsLFxuICAgIHRleHRMZW5ndGg6IG51bGwsXG4gICAgdGltZWxpbmVCZWdpbjogbnVsbCxcbiAgICB0aXRsZTogbnVsbCxcbiAgICB0cmFuc2Zvcm1CZWhhdmlvcjogbnVsbCxcbiAgICB0eXBlOiBudWxsLFxuICAgIHR5cGVPZjogY29tbWFPclNwYWNlU2VwYXJhdGVkLFxuICAgIHRvOiBudWxsLFxuICAgIHRyYW5zZm9ybTogbnVsbCxcbiAgICB0cmFuc2Zvcm1PcmlnaW46IG51bGwsXG4gICAgdTE6IG51bGwsXG4gICAgdTI6IG51bGwsXG4gICAgdW5kZXJsaW5lUG9zaXRpb246IG51bWJlcixcbiAgICB1bmRlcmxpbmVUaGlja25lc3M6IG51bWJlcixcbiAgICB1bmljb2RlOiBudWxsLFxuICAgIHVuaWNvZGVCaWRpOiBudWxsLFxuICAgIHVuaWNvZGVSYW5nZTogbnVsbCxcbiAgICB1bml0c1BlckVtOiBudW1iZXIsXG4gICAgdmFsdWVzOiBudWxsLFxuICAgIHZBbHBoYWJldGljOiBudW1iZXIsXG4gICAgdk1hdGhlbWF0aWNhbDogbnVtYmVyLFxuICAgIHZlY3RvckVmZmVjdDogbnVsbCxcbiAgICB2SGFuZ2luZzogbnVtYmVyLFxuICAgIHZJZGVvZ3JhcGhpYzogbnVtYmVyLFxuICAgIHZlcnNpb246IG51bGwsXG4gICAgdmVydEFkdlk6IG51bWJlcixcbiAgICB2ZXJ0T3JpZ2luWDogbnVtYmVyLFxuICAgIHZlcnRPcmlnaW5ZOiBudW1iZXIsXG4gICAgdmlld0JveDogbnVsbCxcbiAgICB2aWV3VGFyZ2V0OiBudWxsLFxuICAgIHZpc2liaWxpdHk6IG51bGwsXG4gICAgd2lkdGg6IG51bGwsXG4gICAgd2lkdGhzOiBudWxsLFxuICAgIHdvcmRTcGFjaW5nOiBudWxsLFxuICAgIHdyaXRpbmdNb2RlOiBudWxsLFxuICAgIHg6IG51bGwsXG4gICAgeDE6IG51bGwsXG4gICAgeDI6IG51bGwsXG4gICAgeENoYW5uZWxTZWxlY3RvcjogbnVsbCxcbiAgICB4SGVpZ2h0OiBudW1iZXIsXG4gICAgeTogbnVsbCxcbiAgICB5MTogbnVsbCxcbiAgICB5MjogbnVsbCxcbiAgICB5Q2hhbm5lbFNlbGVjdG9yOiBudWxsLFxuICAgIHo6IG51bGwsXG4gICAgem9vbUFuZFBhbjogbnVsbFxuICB9LFxuICBzcGFjZTogJ3N2ZycsXG4gIHRyYW5zZm9ybTogY2FzZVNlbnNpdGl2ZVRyYW5zZm9ybVxufSlcbiIsCiAgICAiaW1wb3J0IHtjcmVhdGV9IGZyb20gJy4vdXRpbC9jcmVhdGUuanMnXG5cbmV4cG9ydCBjb25zdCB4bGluayA9IGNyZWF0ZSh7XG4gIHByb3BlcnRpZXM6IHtcbiAgICB4TGlua0FjdHVhdGU6IG51bGwsXG4gICAgeExpbmtBcmNSb2xlOiBudWxsLFxuICAgIHhMaW5rSHJlZjogbnVsbCxcbiAgICB4TGlua1JvbGU6IG51bGwsXG4gICAgeExpbmtTaG93OiBudWxsLFxuICAgIHhMaW5rVGl0bGU6IG51bGwsXG4gICAgeExpbmtUeXBlOiBudWxsXG4gIH0sXG4gIHNwYWNlOiAneGxpbmsnLFxuICB0cmFuc2Zvcm0oXywgcHJvcGVydHkpIHtcbiAgICByZXR1cm4gJ3hsaW5rOicgKyBwcm9wZXJ0eS5zbGljZSg1KS50b0xvd2VyQ2FzZSgpXG4gIH1cbn0pXG4iLAogICAgImltcG9ydCB7Y3JlYXRlfSBmcm9tICcuL3V0aWwvY3JlYXRlLmpzJ1xuaW1wb3J0IHtjYXNlSW5zZW5zaXRpdmVUcmFuc2Zvcm19IGZyb20gJy4vdXRpbC9jYXNlLWluc2Vuc2l0aXZlLXRyYW5zZm9ybS5qcydcblxuZXhwb3J0IGNvbnN0IHhtbG5zID0gY3JlYXRlKHtcbiAgYXR0cmlidXRlczoge3htbG5zeGxpbms6ICd4bWxuczp4bGluayd9LFxuICBwcm9wZXJ0aWVzOiB7eG1sbnNYTGluazogbnVsbCwgeG1sbnM6IG51bGx9LFxuICBzcGFjZTogJ3htbG5zJyxcbiAgdHJhbnNmb3JtOiBjYXNlSW5zZW5zaXRpdmVUcmFuc2Zvcm1cbn0pXG4iLAogICAgImltcG9ydCB7Y3JlYXRlfSBmcm9tICcuL3V0aWwvY3JlYXRlLmpzJ1xuXG5leHBvcnQgY29uc3QgeG1sID0gY3JlYXRlKHtcbiAgcHJvcGVydGllczoge3htbEJhc2U6IG51bGwsIHhtbExhbmc6IG51bGwsIHhtbFNwYWNlOiBudWxsfSxcbiAgc3BhY2U6ICd4bWwnLFxuICB0cmFuc2Zvcm0oXywgcHJvcGVydHkpIHtcbiAgICByZXR1cm4gJ3htbDonICsgcHJvcGVydHkuc2xpY2UoMykudG9Mb3dlckNhc2UoKVxuICB9XG59KVxuIiwKICAgICIvKipcbiAqIEBpbXBvcnQge1NjaGVtYX0gZnJvbSAncHJvcGVydHktaW5mb3JtYXRpb24nXG4gKi9cblxuaW1wb3J0IHtEZWZpbmVkSW5mb30gZnJvbSAnLi91dGlsL2RlZmluZWQtaW5mby5qcydcbmltcG9ydCB7SW5mb30gZnJvbSAnLi91dGlsL2luZm8uanMnXG5pbXBvcnQge25vcm1hbGl6ZX0gZnJvbSAnLi9ub3JtYWxpemUuanMnXG5cbmNvbnN0IGNhcCA9IC9bQS1aXS9nXG5jb25zdCBkYXNoID0gLy1bYS16XS9nXG5jb25zdCB2YWxpZCA9IC9eZGF0YVstXFx3LjpdKyQvaVxuXG4vKipcbiAqIExvb2sgdXAgaW5mbyBvbiBhIHByb3BlcnR5LlxuICpcbiAqIEluIG1vc3QgY2FzZXMgdGhlIGdpdmVuIGBzY2hlbWFgIGNvbnRhaW5zIGluZm8gb24gdGhlIHByb3BlcnR5LlxuICogQWxsIHN0YW5kYXJkLFxuICogbW9zdCBsZWdhY3ksXG4gKiBhbmQgc29tZSBub24tc3RhbmRhcmQgcHJvcGVydGllcyBhcmUgc3VwcG9ydGVkLlxuICogRm9yIHRoZXNlIGNhc2VzLFxuICogdGhlIHJldHVybmVkIGBJbmZvYCBoYXMgaGludHMgYWJvdXQgdGhlIHZhbHVlIG9mIHRoZSBwcm9wZXJ0eS5cbiAqXG4gKiBgbmFtZWAgY2FuIGFsc28gYmUgYSB2YWxpZCBkYXRhIGF0dHJpYnV0ZSBvciBwcm9wZXJ0eSxcbiAqIGluIHdoaWNoIGNhc2UgYW4gYEluZm9gIG9iamVjdCB3aXRoIHRoZSBjb3JyZWN0bHkgY2FzZWQgYGF0dHJpYnV0ZWAgYW5kXG4gKiBgcHJvcGVydHlgIGlzIHJldHVybmVkLlxuICpcbiAqIGBuYW1lYCBjYW4gYmUgYW4gdW5rbm93biBhdHRyaWJ1dGUsXG4gKiBpbiB3aGljaCBjYXNlIGFuIGBJbmZvYCBvYmplY3Qgd2l0aCBgYXR0cmlidXRlYCBhbmQgYHByb3BlcnR5YCBzZXQgdG8gdGhlXG4gKiBnaXZlbiBuYW1lIGlzIHJldHVybmVkLlxuICogSXQgaXMgbm90IHJlY29tbWVuZGVkIHRvIHByb3ZpZGUgdW5zdXBwb3J0ZWQgbGVnYWN5IG9yIHJlY2VudGx5IHNwZWNjZWRcbiAqIHByb3BlcnRpZXMuXG4gKlxuICpcbiAqIEBwYXJhbSB7U2NoZW1hfSBzY2hlbWFcbiAqICAgU2NoZW1hO1xuICogICBlaXRoZXIgdGhlIGBodG1sYCBvciBgc3ZnYCBleHBvcnQuXG4gKiBAcGFyYW0ge3N0cmluZ30gdmFsdWVcbiAqICAgQW4gYXR0cmlidXRlLWxpa2Ugb3IgcHJvcGVydHktbGlrZSBuYW1lO1xuICogICBpdCB3aWxsIGJlIHBhc3NlZCB0aHJvdWdoIGBub3JtYWxpemVgIHRvIGhvcGVmdWxseSBmaW5kIHRoZSBjb3JyZWN0IGluZm8uXG4gKiBAcmV0dXJucyB7SW5mb31cbiAqICAgSW5mby5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmQoc2NoZW1hLCB2YWx1ZSkge1xuICBjb25zdCBub3JtYWwgPSBub3JtYWxpemUodmFsdWUpXG4gIGxldCBwcm9wZXJ0eSA9IHZhbHVlXG4gIGxldCBUeXBlID0gSW5mb1xuXG4gIGlmIChub3JtYWwgaW4gc2NoZW1hLm5vcm1hbCkge1xuICAgIHJldHVybiBzY2hlbWEucHJvcGVydHlbc2NoZW1hLm5vcm1hbFtub3JtYWxdXVxuICB9XG5cbiAgaWYgKG5vcm1hbC5sZW5ndGggPiA0ICYmIG5vcm1hbC5zbGljZSgwLCA0KSA9PT0gJ2RhdGEnICYmIHZhbGlkLnRlc3QodmFsdWUpKSB7XG4gICAgLy8gQXR0cmlidXRlIG9yIHByb3BlcnR5LlxuICAgIGlmICh2YWx1ZS5jaGFyQXQoNCkgPT09ICctJykge1xuICAgICAgLy8gVHVybiBpdCBpbnRvIGEgcHJvcGVydHkuXG4gICAgICBjb25zdCByZXN0ID0gdmFsdWUuc2xpY2UoNSkucmVwbGFjZShkYXNoLCBjYW1lbGNhc2UpXG4gICAgICBwcm9wZXJ0eSA9ICdkYXRhJyArIHJlc3QuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyByZXN0LnNsaWNlKDEpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFR1cm4gaXQgaW50byBhbiBhdHRyaWJ1dGUuXG4gICAgICBjb25zdCByZXN0ID0gdmFsdWUuc2xpY2UoNClcblxuICAgICAgaWYgKCFkYXNoLnRlc3QocmVzdCkpIHtcbiAgICAgICAgbGV0IGRhc2hlcyA9IHJlc3QucmVwbGFjZShjYXAsIGtlYmFiKVxuXG4gICAgICAgIGlmIChkYXNoZXMuY2hhckF0KDApICE9PSAnLScpIHtcbiAgICAgICAgICBkYXNoZXMgPSAnLScgKyBkYXNoZXNcbiAgICAgICAgfVxuXG4gICAgICAgIHZhbHVlID0gJ2RhdGEnICsgZGFzaGVzXG4gICAgICB9XG4gICAgfVxuXG4gICAgVHlwZSA9IERlZmluZWRJbmZvXG4gIH1cblxuICByZXR1cm4gbmV3IFR5cGUocHJvcGVydHksIHZhbHVlKVxufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSAkMFxuICogICBWYWx1ZS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKiAgIEtlYmFiLlxuICovXG5mdW5jdGlvbiBrZWJhYigkMCkge1xuICByZXR1cm4gJy0nICsgJDAudG9Mb3dlckNhc2UoKVxufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSAkMFxuICogICBWYWx1ZS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKiAgIENhbWVsLlxuICovXG5mdW5jdGlvbiBjYW1lbGNhc2UoJDApIHtcbiAgcmV0dXJuICQwLmNoYXJBdCgxKS50b1VwcGVyQ2FzZSgpXG59XG4iLAogICAgIi8vIE5vdGU6IHR5cGVzIGV4cG9zZWQgZnJvbSBgaW5kZXguZC50c2AuXG5pbXBvcnQge21lcmdlfSBmcm9tICcuL2xpYi91dGlsL21lcmdlLmpzJ1xuaW1wb3J0IHthcmlhfSBmcm9tICcuL2xpYi9hcmlhLmpzJ1xuaW1wb3J0IHtodG1sIGFzIGh0bWxCYXNlfSBmcm9tICcuL2xpYi9odG1sLmpzJ1xuaW1wb3J0IHtzdmcgYXMgc3ZnQmFzZX0gZnJvbSAnLi9saWIvc3ZnLmpzJ1xuaW1wb3J0IHt4bGlua30gZnJvbSAnLi9saWIveGxpbmsuanMnXG5pbXBvcnQge3htbG5zfSBmcm9tICcuL2xpYi94bWxucy5qcydcbmltcG9ydCB7eG1sfSBmcm9tICcuL2xpYi94bWwuanMnXG5cbmV4cG9ydCB7aGFzdFRvUmVhY3R9IGZyb20gJy4vbGliL2hhc3QtdG8tcmVhY3QuanMnXG5cbmV4cG9ydCBjb25zdCBodG1sID0gbWVyZ2UoW2FyaWEsIGh0bWxCYXNlLCB4bGluaywgeG1sbnMsIHhtbF0sICdodG1sJylcblxuZXhwb3J0IHtmaW5kfSBmcm9tICcuL2xpYi9maW5kLmpzJ1xuZXhwb3J0IHtub3JtYWxpemV9IGZyb20gJy4vbGliL25vcm1hbGl6ZS5qcydcblxuZXhwb3J0IGNvbnN0IHN2ZyA9IG1lcmdlKFthcmlhLCBzdmdCYXNlLCB4bGluaywgeG1sbnMsIHhtbF0sICdzdmcnKVxuIiwKICAgICIvKipcbiAqIEBjYWxsYmFjayBIYW5kbGVyXG4gKiAgIEhhbmRsZSBhIHZhbHVlLCB3aXRoIGEgY2VydGFpbiBJRCBmaWVsZCBzZXQgdG8gYSBjZXJ0YWluIHZhbHVlLlxuICogICBUaGUgSUQgZmllbGQgaXMgcGFzc2VkIHRvIGB6d2l0Y2hgLCBhbmQgaXTigJlzIHZhbHVlIGlzIHRoaXMgZnVuY3Rpb27igJlzXG4gKiAgIHBsYWNlIG9uIHRoZSBgaGFuZGxlcnNgIHJlY29yZC5cbiAqIEBwYXJhbSB7Li4uYW55fSBwYXJhbWV0ZXJzXG4gKiAgIEFyYml0cmFyeSBwYXJhbWV0ZXJzIHBhc3NlZCB0byB0aGUgendpdGNoLlxuICogICBUaGUgZmlyc3Qgd2lsbCBiZSBhbiBvYmplY3Qgd2l0aCBhIGNlcnRhaW4gSUQgZmllbGQgc2V0IHRvIGEgY2VydGFpbiB2YWx1ZS5cbiAqIEByZXR1cm5zIHthbnl9XG4gKiAgIEFueXRoaW5nIVxuICovXG5cbi8qKlxuICogQGNhbGxiYWNrIFVua25vd25IYW5kbGVyXG4gKiAgIEhhbmRsZSB2YWx1ZXMgdGhhdCBkbyBoYXZlIGEgY2VydGFpbiBJRCBmaWVsZCwgYnV0IGl04oCZcyBzZXQgdG8gYSB2YWx1ZVxuICogICB0aGF0IGlzIG5vdCBsaXN0ZWQgaW4gdGhlIGBoYW5kbGVyc2AgcmVjb3JkLlxuICogQHBhcmFtIHt1bmtub3dufSB2YWx1ZVxuICogICBBbiBvYmplY3Qgd2l0aCBhIGNlcnRhaW4gSUQgZmllbGQgc2V0IHRvIGFuIHVua25vd24gdmFsdWUuXG4gKiBAcGFyYW0gey4uLmFueX0gcmVzdFxuICogICBBcmJpdHJhcnkgcGFyYW1ldGVycyBwYXNzZWQgdG8gdGhlIHp3aXRjaC5cbiAqIEByZXR1cm5zIHthbnl9XG4gKiAgIEFueXRoaW5nIVxuICovXG5cbi8qKlxuICogQGNhbGxiYWNrIEludmFsaWRIYW5kbGVyXG4gKiAgIEhhbmRsZSB2YWx1ZXMgdGhhdCBkbyBub3QgaGF2ZSBhIGNlcnRhaW4gSUQgZmllbGQuXG4gKiBAcGFyYW0ge3Vua25vd259IHZhbHVlXG4gKiAgIEFueSB1bmtub3duIHZhbHVlLlxuICogQHBhcmFtIHsuLi5hbnl9IHJlc3RcbiAqICAgQXJiaXRyYXJ5IHBhcmFtZXRlcnMgcGFzc2VkIHRvIHRoZSB6d2l0Y2guXG4gKiBAcmV0dXJucyB7dm9pZHxudWxsfHVuZGVmaW5lZHxuZXZlcn1cbiAqICAgVGhpcyBzaG91bGQgY3Jhc2ggb3IgcmV0dXJuIG5vdGhpbmcuXG4gKi9cblxuLyoqXG4gKiBAdGVtcGxhdGUge0ludmFsaWRIYW5kbGVyfSBbSW52YWxpZD1JbnZhbGlkSGFuZGxlcl1cbiAqIEB0ZW1wbGF0ZSB7VW5rbm93bkhhbmRsZXJ9IFtVbmtub3duPVVua25vd25IYW5kbGVyXVxuICogQHRlbXBsYXRlIHtSZWNvcmQ8c3RyaW5nLCBIYW5kbGVyPn0gW0hhbmRsZXJzPVJlY29yZDxzdHJpbmcsIEhhbmRsZXI+XVxuICogQHR5cGVkZWYgT3B0aW9uc1xuICogICBDb25maWd1cmF0aW9uIChyZXF1aXJlZCkuXG4gKiBAcHJvcGVydHkge0ludmFsaWR9IFtpbnZhbGlkXVxuICogICBIYW5kbGVyIHRvIHVzZSBmb3IgaW52YWxpZCB2YWx1ZXMuXG4gKiBAcHJvcGVydHkge1Vua25vd259IFt1bmtub3duXVxuICogICBIYW5kbGVyIHRvIHVzZSBmb3IgdW5rbm93biB2YWx1ZXMuXG4gKiBAcHJvcGVydHkge0hhbmRsZXJzfSBbaGFuZGxlcnNdXG4gKiAgIEhhbmRsZXJzIHRvIHVzZS5cbiAqL1xuXG5jb25zdCBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eVxuXG4vKipcbiAqIEhhbmRsZSB2YWx1ZXMgYmFzZWQgb24gYSBmaWVsZC5cbiAqXG4gKiBAdGVtcGxhdGUge0ludmFsaWRIYW5kbGVyfSBbSW52YWxpZD1JbnZhbGlkSGFuZGxlcl1cbiAqIEB0ZW1wbGF0ZSB7VW5rbm93bkhhbmRsZXJ9IFtVbmtub3duPVVua25vd25IYW5kbGVyXVxuICogQHRlbXBsYXRlIHtSZWNvcmQ8c3RyaW5nLCBIYW5kbGVyPn0gW0hhbmRsZXJzPVJlY29yZDxzdHJpbmcsIEhhbmRsZXI+XVxuICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICogICBGaWVsZCB0byBzd2l0Y2ggb24uXG4gKiBAcGFyYW0ge09wdGlvbnM8SW52YWxpZCwgVW5rbm93biwgSGFuZGxlcnM+fSBbb3B0aW9uc11cbiAqICAgQ29uZmlndXJhdGlvbiAocmVxdWlyZWQpLlxuICogQHJldHVybnMge3t1bmtub3duOiBVbmtub3duLCBpbnZhbGlkOiBJbnZhbGlkLCBoYW5kbGVyczogSGFuZGxlcnMsICguLi5wYXJhbWV0ZXJzOiBQYXJhbWV0ZXJzPEhhbmRsZXJzW2tleW9mIEhhbmRsZXJzXT4pOiBSZXR1cm5UeXBlPEhhbmRsZXJzW2tleW9mIEhhbmRsZXJzXT4sICguLi5wYXJhbWV0ZXJzOiBQYXJhbWV0ZXJzPFVua25vd24+KTogUmV0dXJuVHlwZTxVbmtub3duPn19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB6d2l0Y2goa2V5LCBvcHRpb25zKSB7XG4gIGNvbnN0IHNldHRpbmdzID0gb3B0aW9ucyB8fCB7fVxuXG4gIC8qKlxuICAgKiBIYW5kbGUgb25lIHZhbHVlLlxuICAgKlxuICAgKiBCYXNlZCBvbiB0aGUgYm91bmQgYGtleWAsIGEgcmVzcGVjdGl2ZSBoYW5kbGVyIHdpbGwgYmUgY2FsbGVkLlxuICAgKiBJZiBgdmFsdWVgIGlzIG5vdCBhbiBvYmplY3QsIG9yIGRvZXNu4oCZdCBoYXZlIGEgYGtleWAgcHJvcGVydHksIHRoZSBzcGVjaWFsXG4gICAqIOKAnGludmFsaWTigJ0gaGFuZGxlciB3aWxsIGJlIGNhbGxlZC5cbiAgICogSWYgYHZhbHVlYCBoYXMgYW4gdW5rbm93biBga2V5YCwgdGhlIHNwZWNpYWwg4oCcdW5rbm93buKAnSBoYW5kbGVyIHdpbGwgYmVcbiAgICogY2FsbGVkLlxuICAgKlxuICAgKiBBbGwgYXJndW1lbnRzLCBhbmQgdGhlIGNvbnRleHQgb2JqZWN0LCBhcmUgcGFzc2VkIHRocm91Z2ggdG8gdGhlIGhhbmRsZXIsXG4gICAqIGFuZCBpdOKAmXMgcmVzdWx0IGlzIHJldHVybmVkLlxuICAgKlxuICAgKiBAdGhpcyB7dW5rbm93bn1cbiAgICogICBBbnkgY29udGV4dCBvYmplY3QuXG4gICAqIEBwYXJhbSB7dW5rbm93bn0gW3ZhbHVlXVxuICAgKiAgIEFueSB2YWx1ZS5cbiAgICogQHBhcmFtIHsuLi51bmtub3dufSBwYXJhbWV0ZXJzXG4gICAqICAgQXJiaXRyYXJ5IHBhcmFtZXRlcnMgcGFzc2VkIHRvIHRoZSB6d2l0Y2guXG4gICAqIEBwcm9wZXJ0eSB7SGFuZGxlcn0gaW52YWxpZFxuICAgKiAgIEhhbmRsZSBmb3IgdmFsdWVzIHRoYXQgZG8gbm90IGhhdmUgYSBjZXJ0YWluIElEIGZpZWxkLlxuICAgKiBAcHJvcGVydHkge0hhbmRsZXJ9IHVua25vd25cbiAgICogICBIYW5kbGUgdmFsdWVzIHRoYXQgZG8gaGF2ZSBhIGNlcnRhaW4gSUQgZmllbGQsIGJ1dCBpdOKAmXMgc2V0IHRvIGEgdmFsdWVcbiAgICogICB0aGF0IGlzIG5vdCBsaXN0ZWQgaW4gdGhlIGBoYW5kbGVyc2AgcmVjb3JkLlxuICAgKiBAcHJvcGVydHkge0hhbmRsZXJzfSBoYW5kbGVyc1xuICAgKiAgIFJlY29yZCBvZiBoYW5kbGVycy5cbiAgICogQHJldHVybnMge3Vua25vd259XG4gICAqICAgQW55dGhpbmcuXG4gICAqL1xuICBmdW5jdGlvbiBvbmUodmFsdWUsIC4uLnBhcmFtZXRlcnMpIHtcbiAgICAvKiogQHR5cGUge0hhbmRsZXJ8dW5kZWZpbmVkfSAqL1xuICAgIGxldCBmbiA9IG9uZS5pbnZhbGlkXG4gICAgY29uc3QgaGFuZGxlcnMgPSBvbmUuaGFuZGxlcnNcblxuICAgIGlmICh2YWx1ZSAmJiBvd24uY2FsbCh2YWx1ZSwga2V5KSkge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBJbmRleGFibGUuXG4gICAgICBjb25zdCBpZCA9IFN0cmluZyh2YWx1ZVtrZXldKVxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBJbmRleGFibGUuXG4gICAgICBmbiA9IG93bi5jYWxsKGhhbmRsZXJzLCBpZCkgPyBoYW5kbGVyc1tpZF0gOiBvbmUudW5rbm93blxuICAgIH1cblxuICAgIGlmIChmbikge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhpcywgdmFsdWUsIC4uLnBhcmFtZXRlcnMpXG4gICAgfVxuICB9XG5cbiAgb25lLmhhbmRsZXJzID0gc2V0dGluZ3MuaGFuZGxlcnMgfHwge31cbiAgb25lLmludmFsaWQgPSBzZXR0aW5ncy5pbnZhbGlkXG4gIG9uZS51bmtub3duID0gc2V0dGluZ3MudW5rbm93blxuXG4gIC8vIEB0cy1leHBlY3QtZXJyb3I6IG1hdGNoZXMhXG4gIHJldHVybiBvbmVcbn1cbiIsCiAgICAiLyoqXG4gKiBAdHlwZWRlZiBDb3JlT3B0aW9uc1xuICogQHByb3BlcnR5IHtSZWFkb25seUFycmF5PHN0cmluZz59IFtzdWJzZXQ9W11dXG4gKiAgIFdoZXRoZXIgdG8gb25seSBlc2NhcGUgdGhlIGdpdmVuIHN1YnNldCBvZiBjaGFyYWN0ZXJzLlxuICogQHByb3BlcnR5IHtib29sZWFufSBbZXNjYXBlT25seT1mYWxzZV1cbiAqICAgV2hldGhlciB0byBvbmx5IGVzY2FwZSBwb3NzaWJseSBkYW5nZXJvdXMgY2hhcmFjdGVycy5cbiAqICAgVGhvc2UgY2hhcmFjdGVycyBhcmUgYFwiYCwgYCZgLCBgJ2AsIGA8YCwgYD5gLCBhbmQgYGAgYCBgYC5cbiAqXG4gKiBAdHlwZWRlZiBGb3JtYXRPcHRpb25zXG4gKiBAcHJvcGVydHkgeyhjb2RlOiBudW1iZXIsIG5leHQ6IG51bWJlciwgb3B0aW9uczogQ29yZVdpdGhGb3JtYXRPcHRpb25zKSA9PiBzdHJpbmd9IGZvcm1hdFxuICogICBGb3JtYXQgc3RyYXRlZ3kuXG4gKlxuICogQHR5cGVkZWYge0NvcmVPcHRpb25zICYgRm9ybWF0T3B0aW9ucyAmIGltcG9ydCgnLi91dGlsL2Zvcm1hdC1zbWFydC5qcycpLkZvcm1hdFNtYXJ0T3B0aW9uc30gQ29yZVdpdGhGb3JtYXRPcHRpb25zXG4gKi9cblxuY29uc3QgZGVmYXVsdFN1YnNldFJlZ2V4ID0gL1tcIiYnPD5gXS9nXG5jb25zdCBzdXJyb2dhdGVQYWlyc1JlZ2V4ID0gL1tcXHVEODAwLVxcdURCRkZdW1xcdURDMDAtXFx1REZGRl0vZ1xuY29uc3QgY29udHJvbENoYXJhY3RlcnNSZWdleCA9XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb250cm9sLXJlZ2V4LCB1bmljb3JuL25vLWhleC1lc2NhcGVcbiAgL1tcXHgwMS1cXHRcXHZcXGZcXHgwRS1cXHgxRlxceDdGXFx4ODFcXHg4RFxceDhGXFx4OTBcXHg5RFxceEEwLVxcdUZGRkZdL2dcbmNvbnN0IHJlZ2V4RXNjYXBlUmVnZXggPSAvW3xcXFxce30oKVtcXF1eJCsqPy5dL2dcblxuLyoqIEB0eXBlIHtXZWFrTWFwPFJlYWRvbmx5QXJyYXk8c3RyaW5nPiwgUmVnRXhwPn0gKi9cbmNvbnN0IHN1YnNldFRvUmVnZXhDYWNoZSA9IG5ldyBXZWFrTWFwKClcblxuLyoqXG4gKiBFbmNvZGUgY2VydGFpbiBjaGFyYWN0ZXJzIGluIGB2YWx1ZWAuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlXG4gKiBAcGFyYW0ge0NvcmVXaXRoRm9ybWF0T3B0aW9uc30gb3B0aW9uc1xuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvcmUodmFsdWUsIG9wdGlvbnMpIHtcbiAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKFxuICAgIG9wdGlvbnMuc3Vic2V0XG4gICAgICA/IGNoYXJhY3RlcnNUb0V4cHJlc3Npb25DYWNoZWQob3B0aW9ucy5zdWJzZXQpXG4gICAgICA6IGRlZmF1bHRTdWJzZXRSZWdleCxcbiAgICBiYXNpY1xuICApXG5cbiAgaWYgKG9wdGlvbnMuc3Vic2V0IHx8IG9wdGlvbnMuZXNjYXBlT25seSkge1xuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICB2YWx1ZVxuICAgICAgLy8gU3Vycm9nYXRlIHBhaXJzLlxuICAgICAgLnJlcGxhY2Uoc3Vycm9nYXRlUGFpcnNSZWdleCwgc3Vycm9nYXRlKVxuICAgICAgLy8gQk1QIGNvbnRyb2wgY2hhcmFjdGVycyAoQzAgZXhjZXB0IGZvciBMRiwgQ1IsIFNQOyBERUw7IGFuZCBzb21lIG1vcmVcbiAgICAgIC8vIG5vbi1BU0NJSSBvbmVzKS5cbiAgICAgIC5yZXBsYWNlKGNvbnRyb2xDaGFyYWN0ZXJzUmVnZXgsIGJhc2ljKVxuICApXG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYWlyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleFxuICAgKiBAcGFyYW0ge3N0cmluZ30gYWxsXG4gICAqL1xuICBmdW5jdGlvbiBzdXJyb2dhdGUocGFpciwgaW5kZXgsIGFsbCkge1xuICAgIHJldHVybiBvcHRpb25zLmZvcm1hdChcbiAgICAgIChwYWlyLmNoYXJDb2RlQXQoMCkgLSAweGQ4MDApICogMHg0MDAgK1xuICAgICAgICBwYWlyLmNoYXJDb2RlQXQoMSkgLVxuICAgICAgICAweGRjMDAgK1xuICAgICAgICAweDEwMDAwLFxuICAgICAgYWxsLmNoYXJDb2RlQXQoaW5kZXggKyAyKSxcbiAgICAgIG9wdGlvbnNcbiAgICApXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJhY3RlclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXhcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFsbFxuICAgKi9cbiAgZnVuY3Rpb24gYmFzaWMoY2hhcmFjdGVyLCBpbmRleCwgYWxsKSB7XG4gICAgcmV0dXJuIG9wdGlvbnMuZm9ybWF0KFxuICAgICAgY2hhcmFjdGVyLmNoYXJDb2RlQXQoMCksXG4gICAgICBhbGwuY2hhckNvZGVBdChpbmRleCArIDEpLFxuICAgICAgb3B0aW9uc1xuICAgIClcbiAgfVxufVxuXG4vKipcbiAqIEEgd3JhcHBlciBmdW5jdGlvbiB0aGF0IGNhY2hlcyB0aGUgcmVzdWx0IG9mIGBjaGFyYWN0ZXJzVG9FeHByZXNzaW9uYCB3aXRoIGEgV2Vha01hcC5cbiAqIFRoaXMgY2FuIGltcHJvdmUgcGVyZm9ybWFuY2Ugd2hlbiB0b29saW5nIGNhbGxzIGBjaGFyYWN0ZXJzVG9FeHByZXNzaW9uYCByZXBlYXRlZGx5XG4gKiB3aXRoIHRoZSBzYW1lIHN1YnNldC5cbiAqXG4gKiBAcGFyYW0ge1JlYWRvbmx5QXJyYXk8c3RyaW5nPn0gc3Vic2V0XG4gKiBAcmV0dXJucyB7UmVnRXhwfVxuICovXG5mdW5jdGlvbiBjaGFyYWN0ZXJzVG9FeHByZXNzaW9uQ2FjaGVkKHN1YnNldCkge1xuICBsZXQgY2FjaGVkID0gc3Vic2V0VG9SZWdleENhY2hlLmdldChzdWJzZXQpXG5cbiAgaWYgKCFjYWNoZWQpIHtcbiAgICBjYWNoZWQgPSBjaGFyYWN0ZXJzVG9FeHByZXNzaW9uKHN1YnNldClcbiAgICBzdWJzZXRUb1JlZ2V4Q2FjaGUuc2V0KHN1YnNldCwgY2FjaGVkKVxuICB9XG5cbiAgcmV0dXJuIGNhY2hlZFxufVxuXG4vKipcbiAqIEBwYXJhbSB7UmVhZG9ubHlBcnJheTxzdHJpbmc+fSBzdWJzZXRcbiAqIEByZXR1cm5zIHtSZWdFeHB9XG4gKi9cbmZ1bmN0aW9uIGNoYXJhY3RlcnNUb0V4cHJlc3Npb24oc3Vic2V0KSB7XG4gIC8qKiBAdHlwZSB7QXJyYXk8c3RyaW5nPn0gKi9cbiAgY29uc3QgZ3JvdXBzID0gW11cbiAgbGV0IGluZGV4ID0gLTFcblxuICB3aGlsZSAoKytpbmRleCA8IHN1YnNldC5sZW5ndGgpIHtcbiAgICBncm91cHMucHVzaChzdWJzZXRbaW5kZXhdLnJlcGxhY2UocmVnZXhFc2NhcGVSZWdleCwgJ1xcXFwkJicpKVxuICB9XG5cbiAgcmV0dXJuIG5ldyBSZWdFeHAoJyg/OicgKyBncm91cHMuam9pbignfCcpICsgJyknLCAnZycpXG59XG4iLAogICAgImNvbnN0IGhleGFkZWNpbWFsUmVnZXggPSAvW1xcZEEtRmEtZl0vXG5cbi8qKlxuICogQ29uZmlndXJhYmxlIHdheXMgdG8gZW5jb2RlIGNoYXJhY3RlcnMgYXMgaGV4YWRlY2ltYWwgcmVmZXJlbmNlcy5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gY29kZVxuICogQHBhcmFtIHtudW1iZXJ9IG5leHRcbiAqIEBwYXJhbSB7Ym9vbGVhbnx1bmRlZmluZWR9IG9taXRcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b0hleGFkZWNpbWFsKGNvZGUsIG5leHQsIG9taXQpIHtcbiAgY29uc3QgdmFsdWUgPSAnJiN4JyArIGNvZGUudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKClcbiAgcmV0dXJuIG9taXQgJiYgbmV4dCAmJiAhaGV4YWRlY2ltYWxSZWdleC50ZXN0KFN0cmluZy5mcm9tQ2hhckNvZGUobmV4dCkpXG4gICAgPyB2YWx1ZVxuICAgIDogdmFsdWUgKyAnOydcbn1cbiIsCiAgICAiY29uc3QgZGVjaW1hbFJlZ2V4ID0gL1xcZC9cblxuLyoqXG4gKiBDb25maWd1cmFibGUgd2F5cyB0byBlbmNvZGUgY2hhcmFjdGVycyBhcyBkZWNpbWFsIHJlZmVyZW5jZXMuXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IGNvZGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBuZXh0XG4gKiBAcGFyYW0ge2Jvb2xlYW58dW5kZWZpbmVkfSBvbWl0XG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9EZWNpbWFsKGNvZGUsIG5leHQsIG9taXQpIHtcbiAgY29uc3QgdmFsdWUgPSAnJiMnICsgU3RyaW5nKGNvZGUpXG4gIHJldHVybiBvbWl0ICYmIG5leHQgJiYgIWRlY2ltYWxSZWdleC50ZXN0KFN0cmluZy5mcm9tQ2hhckNvZGUobmV4dCkpXG4gICAgPyB2YWx1ZVxuICAgIDogdmFsdWUgKyAnOydcbn1cbiIsCiAgICAiLyoqXG4gKiBMaXN0IG9mIGxlZ2FjeSBIVE1MIG5hbWVkIGNoYXJhY3RlciByZWZlcmVuY2VzIHRoYXQgZG9u4oCZdCBuZWVkIGEgdHJhaWxpbmcgc2VtaWNvbG9uLlxuICpcbiAqIEB0eXBlIHtBcnJheTxzdHJpbmc+fVxuICovXG5leHBvcnQgY29uc3QgY2hhcmFjdGVyRW50aXRpZXNMZWdhY3kgPSBbXG4gICdBRWxpZycsXG4gICdBTVAnLFxuICAnQWFjdXRlJyxcbiAgJ0FjaXJjJyxcbiAgJ0FncmF2ZScsXG4gICdBcmluZycsXG4gICdBdGlsZGUnLFxuICAnQXVtbCcsXG4gICdDT1BZJyxcbiAgJ0NjZWRpbCcsXG4gICdFVEgnLFxuICAnRWFjdXRlJyxcbiAgJ0VjaXJjJyxcbiAgJ0VncmF2ZScsXG4gICdFdW1sJyxcbiAgJ0dUJyxcbiAgJ0lhY3V0ZScsXG4gICdJY2lyYycsXG4gICdJZ3JhdmUnLFxuICAnSXVtbCcsXG4gICdMVCcsXG4gICdOdGlsZGUnLFxuICAnT2FjdXRlJyxcbiAgJ09jaXJjJyxcbiAgJ09ncmF2ZScsXG4gICdPc2xhc2gnLFxuICAnT3RpbGRlJyxcbiAgJ091bWwnLFxuICAnUVVPVCcsXG4gICdSRUcnLFxuICAnVEhPUk4nLFxuICAnVWFjdXRlJyxcbiAgJ1VjaXJjJyxcbiAgJ1VncmF2ZScsXG4gICdVdW1sJyxcbiAgJ1lhY3V0ZScsXG4gICdhYWN1dGUnLFxuICAnYWNpcmMnLFxuICAnYWN1dGUnLFxuICAnYWVsaWcnLFxuICAnYWdyYXZlJyxcbiAgJ2FtcCcsXG4gICdhcmluZycsXG4gICdhdGlsZGUnLFxuICAnYXVtbCcsXG4gICdicnZiYXInLFxuICAnY2NlZGlsJyxcbiAgJ2NlZGlsJyxcbiAgJ2NlbnQnLFxuICAnY29weScsXG4gICdjdXJyZW4nLFxuICAnZGVnJyxcbiAgJ2RpdmlkZScsXG4gICdlYWN1dGUnLFxuICAnZWNpcmMnLFxuICAnZWdyYXZlJyxcbiAgJ2V0aCcsXG4gICdldW1sJyxcbiAgJ2ZyYWMxMicsXG4gICdmcmFjMTQnLFxuICAnZnJhYzM0JyxcbiAgJ2d0JyxcbiAgJ2lhY3V0ZScsXG4gICdpY2lyYycsXG4gICdpZXhjbCcsXG4gICdpZ3JhdmUnLFxuICAnaXF1ZXN0JyxcbiAgJ2l1bWwnLFxuICAnbGFxdW8nLFxuICAnbHQnLFxuICAnbWFjcicsXG4gICdtaWNybycsXG4gICdtaWRkb3QnLFxuICAnbmJzcCcsXG4gICdub3QnLFxuICAnbnRpbGRlJyxcbiAgJ29hY3V0ZScsXG4gICdvY2lyYycsXG4gICdvZ3JhdmUnLFxuICAnb3JkZicsXG4gICdvcmRtJyxcbiAgJ29zbGFzaCcsXG4gICdvdGlsZGUnLFxuICAnb3VtbCcsXG4gICdwYXJhJyxcbiAgJ3BsdXNtbicsXG4gICdwb3VuZCcsXG4gICdxdW90JyxcbiAgJ3JhcXVvJyxcbiAgJ3JlZycsXG4gICdzZWN0JyxcbiAgJ3NoeScsXG4gICdzdXAxJyxcbiAgJ3N1cDInLFxuICAnc3VwMycsXG4gICdzemxpZycsXG4gICd0aG9ybicsXG4gICd0aW1lcycsXG4gICd1YWN1dGUnLFxuICAndWNpcmMnLFxuICAndWdyYXZlJyxcbiAgJ3VtbCcsXG4gICd1dW1sJyxcbiAgJ3lhY3V0ZScsXG4gICd5ZW4nLFxuICAneXVtbCdcbl1cbiIsCiAgICAiLyoqXG4gKiBNYXAgb2YgbmFtZWQgY2hhcmFjdGVyIHJlZmVyZW5jZXMgZnJvbSBIVE1MIDQuXG4gKlxuICogQHR5cGUge1JlY29yZDxzdHJpbmcsIHN0cmluZz59XG4gKi9cbmV4cG9ydCBjb25zdCBjaGFyYWN0ZXJFbnRpdGllc0h0bWw0ID0ge1xuICBuYnNwOiAnwqAnLFxuICBpZXhjbDogJ8KhJyxcbiAgY2VudDogJ8KiJyxcbiAgcG91bmQ6ICfCoycsXG4gIGN1cnJlbjogJ8KkJyxcbiAgeWVuOiAnwqUnLFxuICBicnZiYXI6ICfCpicsXG4gIHNlY3Q6ICfCpycsXG4gIHVtbDogJ8KoJyxcbiAgY29weTogJ8KpJyxcbiAgb3JkZjogJ8KqJyxcbiAgbGFxdW86ICfCqycsXG4gIG5vdDogJ8KsJyxcbiAgc2h5OiAnwq0nLFxuICByZWc6ICfCricsXG4gIG1hY3I6ICfCrycsXG4gIGRlZzogJ8KwJyxcbiAgcGx1c21uOiAnwrEnLFxuICBzdXAyOiAnwrInLFxuICBzdXAzOiAnwrMnLFxuICBhY3V0ZTogJ8K0JyxcbiAgbWljcm86ICfCtScsXG4gIHBhcmE6ICfCticsXG4gIG1pZGRvdDogJ8K3JyxcbiAgY2VkaWw6ICfCuCcsXG4gIHN1cDE6ICfCuScsXG4gIG9yZG06ICfCuicsXG4gIHJhcXVvOiAnwrsnLFxuICBmcmFjMTQ6ICfCvCcsXG4gIGZyYWMxMjogJ8K9JyxcbiAgZnJhYzM0OiAnwr4nLFxuICBpcXVlc3Q6ICfCvycsXG4gIEFncmF2ZTogJ8OAJyxcbiAgQWFjdXRlOiAnw4EnLFxuICBBY2lyYzogJ8OCJyxcbiAgQXRpbGRlOiAnw4MnLFxuICBBdW1sOiAnw4QnLFxuICBBcmluZzogJ8OFJyxcbiAgQUVsaWc6ICfDhicsXG4gIENjZWRpbDogJ8OHJyxcbiAgRWdyYXZlOiAnw4gnLFxuICBFYWN1dGU6ICfDiScsXG4gIEVjaXJjOiAnw4onLFxuICBFdW1sOiAnw4snLFxuICBJZ3JhdmU6ICfDjCcsXG4gIElhY3V0ZTogJ8ONJyxcbiAgSWNpcmM6ICfDjicsXG4gIEl1bWw6ICfDjycsXG4gIEVUSDogJ8OQJyxcbiAgTnRpbGRlOiAnw5EnLFxuICBPZ3JhdmU6ICfDkicsXG4gIE9hY3V0ZTogJ8OTJyxcbiAgT2NpcmM6ICfDlCcsXG4gIE90aWxkZTogJ8OVJyxcbiAgT3VtbDogJ8OWJyxcbiAgdGltZXM6ICfDlycsXG4gIE9zbGFzaDogJ8OYJyxcbiAgVWdyYXZlOiAnw5knLFxuICBVYWN1dGU6ICfDmicsXG4gIFVjaXJjOiAnw5snLFxuICBVdW1sOiAnw5wnLFxuICBZYWN1dGU6ICfDnScsXG4gIFRIT1JOOiAnw54nLFxuICBzemxpZzogJ8OfJyxcbiAgYWdyYXZlOiAnw6AnLFxuICBhYWN1dGU6ICfDoScsXG4gIGFjaXJjOiAnw6InLFxuICBhdGlsZGU6ICfDoycsXG4gIGF1bWw6ICfDpCcsXG4gIGFyaW5nOiAnw6UnLFxuICBhZWxpZzogJ8OmJyxcbiAgY2NlZGlsOiAnw6cnLFxuICBlZ3JhdmU6ICfDqCcsXG4gIGVhY3V0ZTogJ8OpJyxcbiAgZWNpcmM6ICfDqicsXG4gIGV1bWw6ICfDqycsXG4gIGlncmF2ZTogJ8OsJyxcbiAgaWFjdXRlOiAnw60nLFxuICBpY2lyYzogJ8OuJyxcbiAgaXVtbDogJ8OvJyxcbiAgZXRoOiAnw7AnLFxuICBudGlsZGU6ICfDsScsXG4gIG9ncmF2ZTogJ8OyJyxcbiAgb2FjdXRlOiAnw7MnLFxuICBvY2lyYzogJ8O0JyxcbiAgb3RpbGRlOiAnw7UnLFxuICBvdW1sOiAnw7YnLFxuICBkaXZpZGU6ICfDtycsXG4gIG9zbGFzaDogJ8O4JyxcbiAgdWdyYXZlOiAnw7knLFxuICB1YWN1dGU6ICfDuicsXG4gIHVjaXJjOiAnw7snLFxuICB1dW1sOiAnw7wnLFxuICB5YWN1dGU6ICfDvScsXG4gIHRob3JuOiAnw74nLFxuICB5dW1sOiAnw78nLFxuICBmbm9mOiAnxpInLFxuICBBbHBoYTogJ86RJyxcbiAgQmV0YTogJ86SJyxcbiAgR2FtbWE6ICfOkycsXG4gIERlbHRhOiAnzpQnLFxuICBFcHNpbG9uOiAnzpUnLFxuICBaZXRhOiAnzpYnLFxuICBFdGE6ICfOlycsXG4gIFRoZXRhOiAnzpgnLFxuICBJb3RhOiAnzpknLFxuICBLYXBwYTogJ86aJyxcbiAgTGFtYmRhOiAnzpsnLFxuICBNdTogJ86cJyxcbiAgTnU6ICfOnScsXG4gIFhpOiAnzp4nLFxuICBPbWljcm9uOiAnzp8nLFxuICBQaTogJ86gJyxcbiAgUmhvOiAnzqEnLFxuICBTaWdtYTogJ86jJyxcbiAgVGF1OiAnzqQnLFxuICBVcHNpbG9uOiAnzqUnLFxuICBQaGk6ICfOpicsXG4gIENoaTogJ86nJyxcbiAgUHNpOiAnzqgnLFxuICBPbWVnYTogJ86pJyxcbiAgYWxwaGE6ICfOsScsXG4gIGJldGE6ICfOsicsXG4gIGdhbW1hOiAnzrMnLFxuICBkZWx0YTogJ860JyxcbiAgZXBzaWxvbjogJ861JyxcbiAgemV0YTogJ862JyxcbiAgZXRhOiAnzrcnLFxuICB0aGV0YTogJ864JyxcbiAgaW90YTogJ865JyxcbiAga2FwcGE6ICfOuicsXG4gIGxhbWJkYTogJ867JyxcbiAgbXU6ICfOvCcsXG4gIG51OiAnzr0nLFxuICB4aTogJ86+JyxcbiAgb21pY3JvbjogJ86/JyxcbiAgcGk6ICfPgCcsXG4gIHJobzogJ8+BJyxcbiAgc2lnbWFmOiAnz4InLFxuICBzaWdtYTogJ8+DJyxcbiAgdGF1OiAnz4QnLFxuICB1cHNpbG9uOiAnz4UnLFxuICBwaGk6ICfPhicsXG4gIGNoaTogJ8+HJyxcbiAgcHNpOiAnz4gnLFxuICBvbWVnYTogJ8+JJyxcbiAgdGhldGFzeW06ICfPkScsXG4gIHVwc2loOiAnz5InLFxuICBwaXY6ICfPlicsXG4gIGJ1bGw6ICfigKInLFxuICBoZWxsaXA6ICfigKYnLFxuICBwcmltZTogJ+KAsicsXG4gIFByaW1lOiAn4oCzJyxcbiAgb2xpbmU6ICfigL4nLFxuICBmcmFzbDogJ+KBhCcsXG4gIHdlaWVycDogJ+KEmCcsXG4gIGltYWdlOiAn4oSRJyxcbiAgcmVhbDogJ+KEnCcsXG4gIHRyYWRlOiAn4oSiJyxcbiAgYWxlZnN5bTogJ+KEtScsXG4gIGxhcnI6ICfihpAnLFxuICB1YXJyOiAn4oaRJyxcbiAgcmFycjogJ+KGkicsXG4gIGRhcnI6ICfihpMnLFxuICBoYXJyOiAn4oaUJyxcbiAgY3JhcnI6ICfihrUnLFxuICBsQXJyOiAn4oeQJyxcbiAgdUFycjogJ+KHkScsXG4gIHJBcnI6ICfih5InLFxuICBkQXJyOiAn4oeTJyxcbiAgaEFycjogJ+KHlCcsXG4gIGZvcmFsbDogJ+KIgCcsXG4gIHBhcnQ6ICfiiIInLFxuICBleGlzdDogJ+KIgycsXG4gIGVtcHR5OiAn4oiFJyxcbiAgbmFibGE6ICfiiIcnLFxuICBpc2luOiAn4oiIJyxcbiAgbm90aW46ICfiiIknLFxuICBuaTogJ+KIiycsXG4gIHByb2Q6ICfiiI8nLFxuICBzdW06ICfiiJEnLFxuICBtaW51czogJ+KIkicsXG4gIGxvd2FzdDogJ+KIlycsXG4gIHJhZGljOiAn4oiaJyxcbiAgcHJvcDogJ+KInScsXG4gIGluZmluOiAn4oieJyxcbiAgYW5nOiAn4oigJyxcbiAgYW5kOiAn4oinJyxcbiAgb3I6ICfiiKgnLFxuICBjYXA6ICfiiKknLFxuICBjdXA6ICfiiKonLFxuICBpbnQ6ICfiiKsnLFxuICB0aGVyZTQ6ICfiiLQnLFxuICBzaW06ICfiiLwnLFxuICBjb25nOiAn4omFJyxcbiAgYXN5bXA6ICfiiYgnLFxuICBuZTogJ+KJoCcsXG4gIGVxdWl2OiAn4omhJyxcbiAgbGU6ICfiiaQnLFxuICBnZTogJ+KJpScsXG4gIHN1YjogJ+KKgicsXG4gIHN1cDogJ+KKgycsXG4gIG5zdWI6ICfiioQnLFxuICBzdWJlOiAn4oqGJyxcbiAgc3VwZTogJ+KKhycsXG4gIG9wbHVzOiAn4oqVJyxcbiAgb3RpbWVzOiAn4oqXJyxcbiAgcGVycDogJ+KKpScsXG4gIHNkb3Q6ICfii4UnLFxuICBsY2VpbDogJ+KMiCcsXG4gIHJjZWlsOiAn4oyJJyxcbiAgbGZsb29yOiAn4oyKJyxcbiAgcmZsb29yOiAn4oyLJyxcbiAgbGFuZzogJ+KMqScsXG4gIHJhbmc6ICfijKonLFxuICBsb3o6ICfil4onLFxuICBzcGFkZXM6ICfimaAnLFxuICBjbHViczogJ+KZoycsXG4gIGhlYXJ0czogJ+KZpScsXG4gIGRpYW1zOiAn4pmmJyxcbiAgcXVvdDogJ1wiJyxcbiAgYW1wOiAnJicsXG4gIGx0OiAnPCcsXG4gIGd0OiAnPicsXG4gIE9FbGlnOiAnxZInLFxuICBvZWxpZzogJ8WTJyxcbiAgU2Nhcm9uOiAnxaAnLFxuICBzY2Fyb246ICfFoScsXG4gIFl1bWw6ICfFuCcsXG4gIGNpcmM6ICfLhicsXG4gIHRpbGRlOiAny5wnLFxuICBlbnNwOiAn4oCCJyxcbiAgZW1zcDogJ+KAgycsXG4gIHRoaW5zcDogJ+KAiScsXG4gIHp3bmo6ICfigIwnLFxuICB6d2o6ICfigI0nLFxuICBscm06ICfigI4nLFxuICBybG06ICfigI8nLFxuICBuZGFzaDogJ+KAkycsXG4gIG1kYXNoOiAn4oCUJyxcbiAgbHNxdW86ICfigJgnLFxuICByc3F1bzogJ+KAmScsXG4gIHNicXVvOiAn4oCaJyxcbiAgbGRxdW86ICfigJwnLFxuICByZHF1bzogJ+KAnScsXG4gIGJkcXVvOiAn4oCeJyxcbiAgZGFnZ2VyOiAn4oCgJyxcbiAgRGFnZ2VyOiAn4oChJyxcbiAgcGVybWlsOiAn4oCwJyxcbiAgbHNhcXVvOiAn4oC5JyxcbiAgcnNhcXVvOiAn4oC6JyxcbiAgZXVybzogJ+KCrCdcbn1cbiIsCiAgICAiLyoqXG4gKiBMaXN0IG9mIGxlZ2FjeSAodGhhdCBkb27igJl0IG5lZWQgYSB0cmFpbGluZyBgO2ApIG5hbWVkIHJlZmVyZW5jZXMgd2hpY2ggY291bGQsXG4gKiBkZXBlbmRpbmcgb24gd2hhdCBmb2xsb3dzIHRoZW0sIHR1cm4gaW50byBhIGRpZmZlcmVudCBtZWFuaW5nXG4gKlxuICogQHR5cGUge0FycmF5PHN0cmluZz59XG4gKi9cbmV4cG9ydCBjb25zdCBkYW5nZXJvdXMgPSBbXG4gICdjZW50JyxcbiAgJ2NvcHknLFxuICAnZGl2aWRlJyxcbiAgJ2d0JyxcbiAgJ2x0JyxcbiAgJ25vdCcsXG4gICdwYXJhJyxcbiAgJ3RpbWVzJ1xuXVxuIiwKICAgICJpbXBvcnQge2NoYXJhY3RlckVudGl0aWVzTGVnYWN5fSBmcm9tICdjaGFyYWN0ZXItZW50aXRpZXMtbGVnYWN5J1xuaW1wb3J0IHtjaGFyYWN0ZXJFbnRpdGllc0h0bWw0fSBmcm9tICdjaGFyYWN0ZXItZW50aXRpZXMtaHRtbDQnXG5pbXBvcnQge2Rhbmdlcm91c30gZnJvbSAnLi4vY29uc3RhbnQvZGFuZ2Vyb3VzLmpzJ1xuXG5jb25zdCBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eVxuXG4vKipcbiAqIGBjaGFyYWN0ZXJFbnRpdGllc0h0bWw0YCBidXQgaW52ZXJ0ZWQuXG4gKlxuICogQHR5cGUge1JlY29yZDxzdHJpbmcsIHN0cmluZz59XG4gKi9cbmNvbnN0IGNoYXJhY3RlcnMgPSB7fVxuXG4vKiogQHR5cGUge3N0cmluZ30gKi9cbmxldCBrZXlcblxuZm9yIChrZXkgaW4gY2hhcmFjdGVyRW50aXRpZXNIdG1sNCkge1xuICBpZiAob3duLmNhbGwoY2hhcmFjdGVyRW50aXRpZXNIdG1sNCwga2V5KSkge1xuICAgIGNoYXJhY3RlcnNbY2hhcmFjdGVyRW50aXRpZXNIdG1sNFtrZXldXSA9IGtleVxuICB9XG59XG5cbmNvbnN0IG5vdEFscGhhbnVtZXJpY1JlZ2V4ID0gL1teXFxkQS1aYS16XS9cblxuLyoqXG4gKiBDb25maWd1cmFibGUgd2F5cyB0byBlbmNvZGUgY2hhcmFjdGVycyBhcyBuYW1lZCByZWZlcmVuY2VzLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBjb2RlXG4gKiBAcGFyYW0ge251bWJlcn0gbmV4dFxuICogQHBhcmFtIHtib29sZWFufHVuZGVmaW5lZH0gb21pdFxuICogQHBhcmFtIHtib29sZWFufHVuZGVmaW5lZH0gYXR0cmlidXRlXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9OYW1lZChjb2RlLCBuZXh0LCBvbWl0LCBhdHRyaWJ1dGUpIHtcbiAgY29uc3QgY2hhcmFjdGVyID0gU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlKVxuXG4gIGlmIChvd24uY2FsbChjaGFyYWN0ZXJzLCBjaGFyYWN0ZXIpKSB7XG4gICAgY29uc3QgbmFtZSA9IGNoYXJhY3RlcnNbY2hhcmFjdGVyXVxuICAgIGNvbnN0IHZhbHVlID0gJyYnICsgbmFtZVxuXG4gICAgaWYgKFxuICAgICAgb21pdCAmJlxuICAgICAgY2hhcmFjdGVyRW50aXRpZXNMZWdhY3kuaW5jbHVkZXMobmFtZSkgJiZcbiAgICAgICFkYW5nZXJvdXMuaW5jbHVkZXMobmFtZSkgJiZcbiAgICAgICghYXR0cmlidXRlIHx8XG4gICAgICAgIChuZXh0ICYmXG4gICAgICAgICAgbmV4dCAhPT0gNjEgLyogYD1gICovICYmXG4gICAgICAgICAgbm90QWxwaGFudW1lcmljUmVnZXgudGVzdChTdHJpbmcuZnJvbUNoYXJDb2RlKG5leHQpKSkpXG4gICAgKSB7XG4gICAgICByZXR1cm4gdmFsdWVcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWUgKyAnOydcbiAgfVxuXG4gIHJldHVybiAnJ1xufVxuIiwKICAgICIvKipcbiAqIEB0eXBlZGVmIEZvcm1hdFNtYXJ0T3B0aW9uc1xuICogQHByb3BlcnR5IHtib29sZWFufSBbdXNlTmFtZWRSZWZlcmVuY2VzPWZhbHNlXVxuICogICBQcmVmZXIgbmFtZWQgY2hhcmFjdGVyIHJlZmVyZW5jZXMgKGAmYW1wO2ApIHdoZXJlIHBvc3NpYmxlLlxuICogQHByb3BlcnR5IHtib29sZWFufSBbdXNlU2hvcnRlc3RSZWZlcmVuY2VzPWZhbHNlXVxuICogICBQcmVmZXIgdGhlIHNob3J0ZXN0IHBvc3NpYmxlIHJlZmVyZW5jZSwgaWYgdGhhdCByZXN1bHRzIGluIGxlc3MgYnl0ZXMuXG4gKiAgICoqTm90ZSoqOiBgdXNlTmFtZWRSZWZlcmVuY2VzYCBjYW4gYmUgb21pdHRlZCB3aGVuIHVzaW5nIGB1c2VTaG9ydGVzdFJlZmVyZW5jZXNgLlxuICogQHByb3BlcnR5IHtib29sZWFufSBbb21pdE9wdGlvbmFsU2VtaWNvbG9ucz1mYWxzZV1cbiAqICAgV2hldGhlciB0byBvbWl0IHNlbWljb2xvbnMgd2hlbiBwb3NzaWJsZS5cbiAqICAgKipOb3RlKio6IFRoaXMgY3JlYXRlcyB3aGF0IEhUTUwgY2FsbHMg4oCccGFyc2UgZXJyb3Jz4oCdIGJ1dCBpcyBvdGhlcndpc2Ugc3RpbGwgdmFsaWQgSFRNTCDigJQgZG9u4oCZdCB1c2UgdGhpcyBleGNlcHQgd2hlbiBidWlsZGluZyBhIG1pbmlmaWVyLlxuICogICBPbWl0dGluZyBzZW1pY29sb25zIGlzIHBvc3NpYmxlIGZvciBjZXJ0YWluIG5hbWVkIGFuZCBudW1lcmljIHJlZmVyZW5jZXMgaW4gc29tZSBjYXNlcy5cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW2F0dHJpYnV0ZT1mYWxzZV1cbiAqICAgQ3JlYXRlIGNoYXJhY3RlciByZWZlcmVuY2VzIHdoaWNoIGRvbuKAmXQgZmFpbCBpbiBhdHRyaWJ1dGVzLlxuICogICAqKk5vdGUqKjogYGF0dHJpYnV0ZWAgb25seSBhcHBsaWVzIHdoZW4gb3BlcmF0aW5nIGRhbmdlcm91c2x5IHdpdGhcbiAqICAgYG9taXRPcHRpb25hbFNlbWljb2xvbnM6IHRydWVgLlxuICovXG5cbmltcG9ydCB7dG9IZXhhZGVjaW1hbH0gZnJvbSAnLi90by1oZXhhZGVjaW1hbC5qcydcbmltcG9ydCB7dG9EZWNpbWFsfSBmcm9tICcuL3RvLWRlY2ltYWwuanMnXG5pbXBvcnQge3RvTmFtZWR9IGZyb20gJy4vdG8tbmFtZWQuanMnXG5cbi8qKlxuICogQ29uZmlndXJhYmxlIHdheXMgdG8gZW5jb2RlIGEgY2hhcmFjdGVyIHlpZWxkaW5nIHByZXR0eSBvciBzbWFsbCByZXN1bHRzLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBjb2RlXG4gKiBAcGFyYW0ge251bWJlcn0gbmV4dFxuICogQHBhcmFtIHtGb3JtYXRTbWFydE9wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRTbWFydChjb2RlLCBuZXh0LCBvcHRpb25zKSB7XG4gIGxldCBudW1lcmljID0gdG9IZXhhZGVjaW1hbChjb2RlLCBuZXh0LCBvcHRpb25zLm9taXRPcHRpb25hbFNlbWljb2xvbnMpXG4gIC8qKiBAdHlwZSB7c3RyaW5nfHVuZGVmaW5lZH0gKi9cbiAgbGV0IG5hbWVkXG5cbiAgaWYgKG9wdGlvbnMudXNlTmFtZWRSZWZlcmVuY2VzIHx8IG9wdGlvbnMudXNlU2hvcnRlc3RSZWZlcmVuY2VzKSB7XG4gICAgbmFtZWQgPSB0b05hbWVkKFxuICAgICAgY29kZSxcbiAgICAgIG5leHQsXG4gICAgICBvcHRpb25zLm9taXRPcHRpb25hbFNlbWljb2xvbnMsXG4gICAgICBvcHRpb25zLmF0dHJpYnV0ZVxuICAgIClcbiAgfVxuXG4gIC8vIFVzZSB0aGUgc2hvcnRlc3QgbnVtZXJpYyByZWZlcmVuY2Ugd2hlbiByZXF1ZXN0ZWQuXG4gIC8vIEEgc2ltcGxlIGFsZ29yaXRobSB3b3VsZCB1c2UgZGVjaW1hbCBmb3IgYWxsIGNvZGUgcG9pbnRzIHVuZGVyIDEwMCwgYXNcbiAgLy8gdGhvc2UgYXJlIHNob3J0ZXIgdGhhbiBoZXhhZGVjaW1hbDpcbiAgLy9cbiAgLy8gKiBgJiM5OTtgIHZzIGAmI3g2MztgIChkZWNpbWFsIHNob3J0ZXIpXG4gIC8vICogYCYjMTAwO2AgdnMgYCYjeDY0O2AgKGVxdWFsKVxuICAvL1xuICAvLyBIb3dldmVyLCBiZWNhdXNlIHdlIHRha2UgYG5leHRgIGludG8gY29uc2lkZXJhdGlvbiB3aGVuIGBvbWl0YCBpcyB1c2VkLFxuICAvLyBBbmQgaXQgd291bGQgYmUgcG9zc2libGUgdGhhdCBkZWNpbWFscyBhcmUgc2hvcnRlciBvbiBiaWdnZXIgdmFsdWVzIGFzXG4gIC8vIHdlbGwgaWYgYG5leHRgIGlzIGhleGFkZWNpbWFsIGJ1dCBub3QgZGVjaW1hbCwgd2UgaW5zdGVhZCBjb21wYXJlIGJvdGguXG4gIGlmIChcbiAgICAob3B0aW9ucy51c2VTaG9ydGVzdFJlZmVyZW5jZXMgfHwgIW5hbWVkKSAmJlxuICAgIG9wdGlvbnMudXNlU2hvcnRlc3RSZWZlcmVuY2VzXG4gICkge1xuICAgIGNvbnN0IGRlY2ltYWwgPSB0b0RlY2ltYWwoY29kZSwgbmV4dCwgb3B0aW9ucy5vbWl0T3B0aW9uYWxTZW1pY29sb25zKVxuXG4gICAgaWYgKGRlY2ltYWwubGVuZ3RoIDwgbnVtZXJpYy5sZW5ndGgpIHtcbiAgICAgIG51bWVyaWMgPSBkZWNpbWFsXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWVkICYmXG4gICAgKCFvcHRpb25zLnVzZVNob3J0ZXN0UmVmZXJlbmNlcyB8fCBuYW1lZC5sZW5ndGggPCBudW1lcmljLmxlbmd0aClcbiAgICA/IG5hbWVkXG4gICAgOiBudW1lcmljXG59XG4iLAogICAgIi8qKlxuICogQHR5cGVkZWYge2ltcG9ydCgnLi9jb3JlLmpzJykuQ29yZU9wdGlvbnMgJiBpbXBvcnQoJy4vdXRpbC9mb3JtYXQtc21hcnQuanMnKS5Gb3JtYXRTbWFydE9wdGlvbnN9IE9wdGlvbnNcbiAqIEB0eXBlZGVmIHtpbXBvcnQoJy4vY29yZS5qcycpLkNvcmVPcHRpb25zfSBMaWdodE9wdGlvbnNcbiAqL1xuXG5pbXBvcnQge2NvcmV9IGZyb20gJy4vY29yZS5qcydcbmltcG9ydCB7Zm9ybWF0U21hcnR9IGZyb20gJy4vdXRpbC9mb3JtYXQtc21hcnQuanMnXG5pbXBvcnQge2Zvcm1hdEJhc2ljfSBmcm9tICcuL3V0aWwvZm9ybWF0LWJhc2ljLmpzJ1xuXG4vKipcbiAqIEVuY29kZSBzcGVjaWFsIGNoYXJhY3RlcnMgaW4gYHZhbHVlYC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdmFsdWVcbiAqICAgVmFsdWUgdG8gZW5jb2RlLlxuICogQHBhcmFtIHtPcHRpb25zfSBbb3B0aW9uc11cbiAqICAgQ29uZmlndXJhdGlvbi5cbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKiAgIEVuY29kZWQgdmFsdWUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdpZnlFbnRpdGllcyh2YWx1ZSwgb3B0aW9ucykge1xuICByZXR1cm4gY29yZSh2YWx1ZSwgT2JqZWN0LmFzc2lnbih7Zm9ybWF0OiBmb3JtYXRTbWFydH0sIG9wdGlvbnMpKVxufVxuXG4vKipcbiAqIEVuY29kZSBzcGVjaWFsIGNoYXJhY3RlcnMgaW4gYHZhbHVlYCBhcyBoZXhhZGVjaW1hbHMuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlXG4gKiAgIFZhbHVlIHRvIGVuY29kZS5cbiAqIEBwYXJhbSB7TGlnaHRPcHRpb25zfSBbb3B0aW9uc11cbiAqICAgQ29uZmlndXJhdGlvbi5cbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKiAgIEVuY29kZWQgdmFsdWUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdpZnlFbnRpdGllc0xpZ2h0KHZhbHVlLCBvcHRpb25zKSB7XG4gIHJldHVybiBjb3JlKHZhbHVlLCBPYmplY3QuYXNzaWduKHtmb3JtYXQ6IGZvcm1hdEJhc2ljfSwgb3B0aW9ucykpXG59XG4iLAogICAgIi8qKlxuICogQGltcG9ydCB7Q29tbWVudCwgUGFyZW50c30gZnJvbSAnaGFzdCdcbiAqIEBpbXBvcnQge1N0YXRlfSBmcm9tICcuLi9pbmRleC5qcydcbiAqL1xuXG5pbXBvcnQge3N0cmluZ2lmeUVudGl0aWVzfSBmcm9tICdzdHJpbmdpZnktZW50aXRpZXMnXG5cbmNvbnN0IGh0bWxDb21tZW50UmVnZXggPSAvXj58Xi0+fDwhLS18LS0+fC0tIT58PCEtJC9nXG5cbi8vIERlY2xhcmUgYXJyYXlzIGFzIHZhcmlhYmxlcyBzbyBpdCBjYW4gYmUgY2FjaGVkIGJ5IGBzdHJpbmdpZnlFbnRpdGllc2BcbmNvbnN0IGJvZ3VzQ29tbWVudEVudGl0eVN1YnNldCA9IFsnPiddXG5jb25zdCBjb21tZW50RW50aXR5U3Vic2V0ID0gWyc8JywgJz4nXVxuXG4vKipcbiAqIFNlcmlhbGl6ZSBhIGNvbW1lbnQuXG4gKlxuICogQHBhcmFtIHtDb21tZW50fSBub2RlXG4gKiAgIE5vZGUgdG8gaGFuZGxlLlxuICogQHBhcmFtIHtudW1iZXIgfCB1bmRlZmluZWR9IF8xXG4gKiAgIEluZGV4IG9mIGBub2RlYCBpbiBgcGFyZW50LlxuICogQHBhcmFtIHtQYXJlbnRzIHwgdW5kZWZpbmVkfSBfMlxuICogICBQYXJlbnQgb2YgYG5vZGVgLlxuICogQHBhcmFtIHtTdGF0ZX0gc3RhdGVcbiAqICAgSW5mbyBwYXNzZWQgYXJvdW5kIGFib3V0IHRoZSBjdXJyZW50IHN0YXRlLlxuICogQHJldHVybnMge3N0cmluZ31cbiAqICAgU2VyaWFsaXplZCBub2RlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tbWVudChub2RlLCBfMSwgXzIsIHN0YXRlKSB7XG4gIC8vIFNlZTogPGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2NvbW1lbnRzPlxuICByZXR1cm4gc3RhdGUuc2V0dGluZ3MuYm9ndXNDb21tZW50c1xuICAgID8gJzw/JyArXG4gICAgICAgIHN0cmluZ2lmeUVudGl0aWVzKFxuICAgICAgICAgIG5vZGUudmFsdWUsXG4gICAgICAgICAgT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUuc2V0dGluZ3MuY2hhcmFjdGVyUmVmZXJlbmNlcywge1xuICAgICAgICAgICAgc3Vic2V0OiBib2d1c0NvbW1lbnRFbnRpdHlTdWJzZXRcbiAgICAgICAgICB9KVxuICAgICAgICApICtcbiAgICAgICAgJz4nXG4gICAgOiAnPCEtLScgKyBub2RlLnZhbHVlLnJlcGxhY2UoaHRtbENvbW1lbnRSZWdleCwgZW5jb2RlKSArICctLT4nXG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSAkMFxuICAgKi9cbiAgZnVuY3Rpb24gZW5jb2RlKCQwKSB7XG4gICAgcmV0dXJuIHN0cmluZ2lmeUVudGl0aWVzKFxuICAgICAgJDAsXG4gICAgICBPYmplY3QuYXNzaWduKHt9LCBzdGF0ZS5zZXR0aW5ncy5jaGFyYWN0ZXJSZWZlcmVuY2VzLCB7XG4gICAgICAgIHN1YnNldDogY29tbWVudEVudGl0eVN1YnNldFxuICAgICAgfSlcbiAgICApXG4gIH1cbn1cbiIsCiAgICAiLyoqXG4gKiBAaW1wb3J0IHtEb2N0eXBlLCBQYXJlbnRzfSBmcm9tICdoYXN0J1xuICogQGltcG9ydCB7U3RhdGV9IGZyb20gJy4uL2luZGV4LmpzJ1xuICovXG5cbi8qKlxuICogU2VyaWFsaXplIGEgZG9jdHlwZS5cbiAqXG4gKiBAcGFyYW0ge0RvY3R5cGV9IF8xXG4gKiAgIE5vZGUgdG8gaGFuZGxlLlxuICogQHBhcmFtIHtudW1iZXIgfCB1bmRlZmluZWR9IF8yXG4gKiAgIEluZGV4IG9mIGBub2RlYCBpbiBgcGFyZW50LlxuICogQHBhcmFtIHtQYXJlbnRzIHwgdW5kZWZpbmVkfSBfM1xuICogICBQYXJlbnQgb2YgYG5vZGVgLlxuICogQHBhcmFtIHtTdGF0ZX0gc3RhdGVcbiAqICAgSW5mbyBwYXNzZWQgYXJvdW5kIGFib3V0IHRoZSBjdXJyZW50IHN0YXRlLlxuICogQHJldHVybnMge3N0cmluZ31cbiAqICAgU2VyaWFsaXplZCBub2RlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZG9jdHlwZShfMSwgXzIsIF8zLCBzdGF0ZSkge1xuICByZXR1cm4gKFxuICAgICc8IScgK1xuICAgIChzdGF0ZS5zZXR0aW5ncy51cHBlckRvY3R5cGUgPyAnRE9DVFlQRScgOiAnZG9jdHlwZScpICtcbiAgICAoc3RhdGUuc2V0dGluZ3MudGlnaHREb2N0eXBlID8gJycgOiAnICcpICtcbiAgICAnaHRtbD4nXG4gIClcbn1cbiIsCiAgICAiLyoqXG4gKiBDb3VudCBob3cgb2Z0ZW4gYSBjaGFyYWN0ZXIgKG9yIHN1YnN0cmluZykgaXMgdXNlZCBpbiBhIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdmFsdWVcbiAqICAgVmFsdWUgdG8gc2VhcmNoIGluLlxuICogQHBhcmFtIHtzdHJpbmd9IGNoYXJhY3RlclxuICogICBDaGFyYWN0ZXIgKG9yIHN1YnN0cmluZykgdG8gbG9vayBmb3IuXG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKiAgIE51bWJlciBvZiB0aW1lcyBgY2hhcmFjdGVyYCBvY2N1cnJlZCBpbiBgdmFsdWVgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2NvdW50KHZhbHVlLCBjaGFyYWN0ZXIpIHtcbiAgY29uc3Qgc291cmNlID0gU3RyaW5nKHZhbHVlKVxuXG4gIGlmICh0eXBlb2YgY2hhcmFjdGVyICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGNoYXJhY3RlcicpXG4gIH1cblxuICBsZXQgY291bnQgPSAwXG4gIGxldCBpbmRleCA9IHNvdXJjZS5pbmRleE9mKGNoYXJhY3RlcilcblxuICB3aGlsZSAoaW5kZXggIT09IC0xKSB7XG4gICAgY291bnQrK1xuICAgIGluZGV4ID0gc291cmNlLmluZGV4T2YoY2hhcmFjdGVyLCBpbmRleCArIGNoYXJhY3Rlci5sZW5ndGgpXG4gIH1cblxuICByZXR1cm4gY291bnRcbn1cbiIsCiAgICAiLyoqXG4gKiBAdHlwZWRlZiBPcHRpb25zXG4gKiAgIENvbmZpZ3VyYXRpb24gZm9yIGBzdHJpbmdpZnlgLlxuICogQHByb3BlcnR5IHtib29sZWFufSBbcGFkTGVmdD10cnVlXVxuICogICBXaGV0aGVyIHRvIHBhZCBhIHNwYWNlIGJlZm9yZSBhIHRva2VuLlxuICogQHByb3BlcnR5IHtib29sZWFufSBbcGFkUmlnaHQ9ZmFsc2VdXG4gKiAgIFdoZXRoZXIgdG8gcGFkIGEgc3BhY2UgYWZ0ZXIgYSB0b2tlbi5cbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPcHRpb25zfSBTdHJpbmdpZnlPcHRpb25zXG4gKiAgIFBsZWFzZSB1c2UgYFN0cmluZ2lmeU9wdGlvbnNgIGluc3RlYWQuXG4gKi9cblxuLyoqXG4gKiBQYXJzZSBjb21tYS1zZXBhcmF0ZWQgdG9rZW5zIHRvIGFuIGFycmF5LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICogICBDb21tYS1zZXBhcmF0ZWQgdG9rZW5zLlxuICogQHJldHVybnMge0FycmF5PHN0cmluZz59XG4gKiAgIExpc3Qgb2YgdG9rZW5zLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2UodmFsdWUpIHtcbiAgLyoqIEB0eXBlIHtBcnJheTxzdHJpbmc+fSAqL1xuICBjb25zdCB0b2tlbnMgPSBbXVxuICBjb25zdCBpbnB1dCA9IFN0cmluZyh2YWx1ZSB8fCAnJylcbiAgbGV0IGluZGV4ID0gaW5wdXQuaW5kZXhPZignLCcpXG4gIGxldCBzdGFydCA9IDBcbiAgLyoqIEB0eXBlIHtib29sZWFufSAqL1xuICBsZXQgZW5kID0gZmFsc2VcblxuICB3aGlsZSAoIWVuZCkge1xuICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgIGluZGV4ID0gaW5wdXQubGVuZ3RoXG4gICAgICBlbmQgPSB0cnVlXG4gICAgfVxuXG4gICAgY29uc3QgdG9rZW4gPSBpbnB1dC5zbGljZShzdGFydCwgaW5kZXgpLnRyaW0oKVxuXG4gICAgaWYgKHRva2VuIHx8ICFlbmQpIHtcbiAgICAgIHRva2Vucy5wdXNoKHRva2VuKVxuICAgIH1cblxuICAgIHN0YXJ0ID0gaW5kZXggKyAxXG4gICAgaW5kZXggPSBpbnB1dC5pbmRleE9mKCcsJywgc3RhcnQpXG4gIH1cblxuICByZXR1cm4gdG9rZW5zXG59XG5cbi8qKlxuICogU2VyaWFsaXplIGFuIGFycmF5IG9mIHN0cmluZ3Mgb3IgbnVtYmVycyB0byBjb21tYS1zZXBhcmF0ZWQgdG9rZW5zLlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8c3RyaW5nfG51bWJlcj59IHZhbHVlc1xuICogICBMaXN0IG9mIHRva2Vucy5cbiAqIEBwYXJhbSB7T3B0aW9uc30gW29wdGlvbnNdXG4gKiAgIENvbmZpZ3VyYXRpb24gZm9yIGBzdHJpbmdpZnlgIChvcHRpb25hbCkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICogICBDb21tYS1zZXBhcmF0ZWQgdG9rZW5zLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5naWZ5KHZhbHVlcywgb3B0aW9ucykge1xuICBjb25zdCBzZXR0aW5ncyA9IG9wdGlvbnMgfHwge31cblxuICAvLyBFbnN1cmUgdGhlIGxhc3QgZW1wdHkgZW50cnkgaXMgc2Vlbi5cbiAgY29uc3QgaW5wdXQgPSB2YWx1ZXNbdmFsdWVzLmxlbmd0aCAtIDFdID09PSAnJyA/IFsuLi52YWx1ZXMsICcnXSA6IHZhbHVlc1xuXG4gIHJldHVybiBpbnB1dFxuICAgIC5qb2luKFxuICAgICAgKHNldHRpbmdzLnBhZFJpZ2h0ID8gJyAnIDogJycpICtcbiAgICAgICAgJywnICtcbiAgICAgICAgKHNldHRpbmdzLnBhZExlZnQgPT09IGZhbHNlID8gJycgOiAnICcpXG4gICAgKVxuICAgIC50cmltKClcbn1cbiIsCiAgICAiLyoqXG4gKiBQYXJzZSBzcGFjZS1zZXBhcmF0ZWQgdG9rZW5zIHRvIGFuIGFycmF5IG9mIHN0cmluZ3MuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlXG4gKiAgIFNwYWNlLXNlcGFyYXRlZCB0b2tlbnMuXG4gKiBAcmV0dXJucyB7QXJyYXk8c3RyaW5nPn1cbiAqICAgTGlzdCBvZiB0b2tlbnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZSh2YWx1ZSkge1xuICBjb25zdCBpbnB1dCA9IFN0cmluZyh2YWx1ZSB8fCAnJykudHJpbSgpXG4gIHJldHVybiBpbnB1dCA/IGlucHV0LnNwbGl0KC9bIFxcdFxcblxcclxcZl0rL2cpIDogW11cbn1cblxuLyoqXG4gKiBTZXJpYWxpemUgYW4gYXJyYXkgb2Ygc3RyaW5ncyBhcyBzcGFjZSBzZXBhcmF0ZWQtdG9rZW5zLlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8c3RyaW5nfG51bWJlcj59IHZhbHVlc1xuICogICBMaXN0IG9mIHRva2Vucy5cbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKiAgIFNwYWNlLXNlcGFyYXRlZCB0b2tlbnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdpZnkodmFsdWVzKSB7XG4gIHJldHVybiB2YWx1ZXMuam9pbignICcpLnRyaW0oKVxufVxuIiwKICAgICIvKipcbiAqIEB0eXBlZGVmIHtpbXBvcnQoJ2hhc3QnKS5Ob2Rlc30gTm9kZXNcbiAqL1xuXG4vLyBIVE1MIHdoaXRlc3BhY2UgZXhwcmVzc2lvbi5cbi8vIFNlZSA8aHR0cHM6Ly9pbmZyYS5zcGVjLndoYXR3Zy5vcmcvI2FzY2lpLXdoaXRlc3BhY2U+LlxuY29uc3QgcmUgPSAvWyBcXHRcXG5cXGZcXHJdL2dcblxuLyoqXG4gKiBDaGVjayBpZiB0aGUgZ2l2ZW4gdmFsdWUgaXMgKmludGVyLWVsZW1lbnQgd2hpdGVzcGFjZSouXG4gKlxuICogQHBhcmFtIHtOb2RlcyB8IHN0cmluZ30gdGhpbmdcbiAqICAgVGhpbmcgdG8gY2hlY2sgKGBOb2RlYCBvciBgc3RyaW5nYCkuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqICAgV2hldGhlciB0aGUgYHZhbHVlYCBpcyBpbnRlci1lbGVtZW50IHdoaXRlc3BhY2UgKGBib29sZWFuYCk6IGNvbnNpc3Rpbmcgb2ZcbiAqICAgemVybyBvciBtb3JlIG9mIHNwYWNlLCB0YWIgKGBcXHRgKSwgbGluZSBmZWVkIChgXFxuYCksIGNhcnJpYWdlIHJldHVyblxuICogICAoYFxccmApLCBvciBmb3JtIGZlZWQgKGBcXGZgKTsgaWYgYSBub2RlIGlzIHBhc3NlZCBpdCBtdXN0IGJlIGEgYFRleHRgIG5vZGUsXG4gKiAgIHdob3NlIGB2YWx1ZWAgZmllbGQgaXMgY2hlY2tlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdoaXRlc3BhY2UodGhpbmcpIHtcbiAgcmV0dXJuIHR5cGVvZiB0aGluZyA9PT0gJ29iamVjdCdcbiAgICA/IHRoaW5nLnR5cGUgPT09ICd0ZXh0J1xuICAgICAgPyBlbXB0eSh0aGluZy52YWx1ZSlcbiAgICAgIDogZmFsc2VcbiAgICA6IGVtcHR5KHRoaW5nKVxufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGVtcHR5KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZS5yZXBsYWNlKHJlLCAnJykgPT09ICcnXG59XG4iLAogICAgIi8qKlxuICogQGltcG9ydCB7UGFyZW50cywgUm9vdENvbnRlbnR9IGZyb20gJ2hhc3QnXG4gKi9cblxuaW1wb3J0IHt3aGl0ZXNwYWNlfSBmcm9tICdoYXN0LXV0aWwtd2hpdGVzcGFjZSdcblxuZXhwb3J0IGNvbnN0IHNpYmxpbmdBZnRlciA9IHNpYmxpbmdzKDEpXG5leHBvcnQgY29uc3Qgc2libGluZ0JlZm9yZSA9IHNpYmxpbmdzKC0xKVxuXG4vKiogQHR5cGUge0FycmF5PFJvb3RDb250ZW50Pn0gKi9cbmNvbnN0IGVtcHR5Q2hpbGRyZW4gPSBbXVxuXG4vKipcbiAqIEZhY3RvcnkgdG8gY2hlY2sgc2libGluZ3MgaW4gYSBkaXJlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IGluY3JlbWVudFxuICovXG5mdW5jdGlvbiBzaWJsaW5ncyhpbmNyZW1lbnQpIHtcbiAgcmV0dXJuIHNpYmxpbmdcblxuICAvKipcbiAgICogRmluZCBhcHBsaWNhYmxlIHNpYmxpbmdzIGluIGEgZGlyZWN0aW9uLlxuICAgKlxuICAgKiBAdGVtcGxhdGUge1BhcmVudHN9IFBhcmVudFxuICAgKiAgIFBhcmVudCB0eXBlLlxuICAgKiBAcGFyYW0ge1BhcmVudCB8IHVuZGVmaW5lZH0gcGFyZW50XG4gICAqICAgUGFyZW50LlxuICAgKiBAcGFyYW0ge251bWJlciB8IHVuZGVmaW5lZH0gaW5kZXhcbiAgICogICBJbmRleCBvZiBjaGlsZCBpbiBgcGFyZW50YC5cbiAgICogQHBhcmFtIHtib29sZWFuIHwgdW5kZWZpbmVkfSBbaW5jbHVkZVdoaXRlc3BhY2U9ZmFsc2VdXG4gICAqICAgV2hldGhlciB0byBpbmNsdWRlIHdoaXRlc3BhY2UgKGRlZmF1bHQ6IGBmYWxzZWApLlxuICAgKiBAcmV0dXJucyB7UGFyZW50IGV4dGVuZHMge2NoaWxkcmVuOiBBcnJheTxpbmZlciBDaGlsZD59ID8gQ2hpbGQgfCB1bmRlZmluZWQgOiBuZXZlcn1cbiAgICogICBDaGlsZCBvZiBwYXJlbnQuXG4gICAqL1xuICBmdW5jdGlvbiBzaWJsaW5nKHBhcmVudCwgaW5kZXgsIGluY2x1ZGVXaGl0ZXNwYWNlKSB7XG4gICAgY29uc3Qgc2libGluZ3MgPSBwYXJlbnQgPyBwYXJlbnQuY2hpbGRyZW4gOiBlbXB0eUNoaWxkcmVuXG4gICAgbGV0IG9mZnNldCA9IChpbmRleCB8fCAwKSArIGluY3JlbWVudFxuICAgIGxldCBuZXh0ID0gc2libGluZ3Nbb2Zmc2V0XVxuXG4gICAgaWYgKCFpbmNsdWRlV2hpdGVzcGFjZSkge1xuICAgICAgd2hpbGUgKG5leHQgJiYgd2hpdGVzcGFjZShuZXh0KSkge1xuICAgICAgICBvZmZzZXQgKz0gaW5jcmVtZW50XG4gICAgICAgIG5leHQgPSBzaWJsaW5nc1tvZmZzZXRdXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvcjogaXTigJlzIGEgY29ycmVjdCBjaGlsZC5cbiAgICByZXR1cm4gbmV4dFxuICB9XG59XG4iLAogICAgIi8qKlxuICogQGltcG9ydCB7RWxlbWVudCwgUGFyZW50c30gZnJvbSAnaGFzdCdcbiAqL1xuXG4vKipcbiAqIEBjYWxsYmFjayBPbWl0SGFuZGxlXG4gKiAgIENoZWNrIGlmIGEgdGFnIGNhbiBiZSBvbWl0dGVkLlxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50XG4gKiAgIEVsZW1lbnQgdG8gY2hlY2suXG4gKiBAcGFyYW0ge251bWJlciB8IHVuZGVmaW5lZH0gaW5kZXhcbiAqICAgSW5kZXggb2YgZWxlbWVudCBpbiBwYXJlbnQuXG4gKiBAcGFyYW0ge1BhcmVudHMgfCB1bmRlZmluZWR9IHBhcmVudFxuICogICBQYXJlbnQgb2YgZWxlbWVudC5cbiAqIEByZXR1cm5zIHtib29sZWFufVxuICogICBXaGV0aGVyIHRvIG9taXQgYSB0YWcuXG4gKlxuICovXG5cbmNvbnN0IG93biA9IHt9Lmhhc093blByb3BlcnR5XG5cbi8qKlxuICogRmFjdG9yeSB0byBjaGVjayBpZiBhIGdpdmVuIG5vZGUgY2FuIGhhdmUgYSB0YWcgb21pdHRlZC5cbiAqXG4gKiBAcGFyYW0ge1JlY29yZDxzdHJpbmcsIE9taXRIYW5kbGU+fSBoYW5kbGVyc1xuICogICBPbWlzc2lvbiBoYW5kbGVycywgd2hlcmUgZWFjaCBrZXkgaXMgYSB0YWcgbmFtZSwgYW5kIGVhY2ggdmFsdWUgaXMgdGhlXG4gKiAgIGNvcnJlc3BvbmRpbmcgaGFuZGxlci5cbiAqIEByZXR1cm5zIHtPbWl0SGFuZGxlfVxuICogICBXaGV0aGVyIHRvIG9taXQgYSB0YWcgb2YgYW4gZWxlbWVudC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9taXNzaW9uKGhhbmRsZXJzKSB7XG4gIHJldHVybiBvbWl0XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGEgZ2l2ZW4gbm9kZSBjYW4gaGF2ZSBhIHRhZyBvbWl0dGVkLlxuICAgKlxuICAgKiBAdHlwZSB7T21pdEhhbmRsZX1cbiAgICovXG4gIGZ1bmN0aW9uIG9taXQobm9kZSwgaW5kZXgsIHBhcmVudCkge1xuICAgIHJldHVybiAoXG4gICAgICBvd24uY2FsbChoYW5kbGVycywgbm9kZS50YWdOYW1lKSAmJlxuICAgICAgaGFuZGxlcnNbbm9kZS50YWdOYW1lXShub2RlLCBpbmRleCwgcGFyZW50KVxuICAgIClcbiAgfVxufVxuIiwKICAgICIvKipcbiAqIEBpbXBvcnQge0VsZW1lbnQsIFBhcmVudHN9IGZyb20gJ2hhc3QnXG4gKi9cblxuaW1wb3J0IHt3aGl0ZXNwYWNlfSBmcm9tICdoYXN0LXV0aWwtd2hpdGVzcGFjZSdcbmltcG9ydCB7c2libGluZ0FmdGVyfSBmcm9tICcuL3V0aWwvc2libGluZ3MuanMnXG5pbXBvcnQge29taXNzaW9ufSBmcm9tICcuL29taXNzaW9uLmpzJ1xuXG5leHBvcnQgY29uc3QgY2xvc2luZyA9IG9taXNzaW9uKHtcbiAgYm9keSxcbiAgY2FwdGlvbjogaGVhZE9yQ29sZ3JvdXBPckNhcHRpb24sXG4gIGNvbGdyb3VwOiBoZWFkT3JDb2xncm91cE9yQ2FwdGlvbixcbiAgZGQsXG4gIGR0LFxuICBoZWFkOiBoZWFkT3JDb2xncm91cE9yQ2FwdGlvbixcbiAgaHRtbCxcbiAgbGksXG4gIG9wdGdyb3VwLFxuICBvcHRpb24sXG4gIHAsXG4gIHJwOiBydWJ5RWxlbWVudCxcbiAgcnQ6IHJ1YnlFbGVtZW50LFxuICB0Ym9keSxcbiAgdGQ6IGNlbGxzLFxuICB0Zm9vdCxcbiAgdGg6IGNlbGxzLFxuICB0aGVhZCxcbiAgdHJcbn0pXG5cbi8qKlxuICogTWFjcm8gZm9yIGA8L2hlYWQ+YCwgYDwvY29sZ3JvdXA+YCwgYW5kIGA8L2NhcHRpb24+YC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IF9cbiAqICAgRWxlbWVudC5cbiAqIEBwYXJhbSB7bnVtYmVyIHwgdW5kZWZpbmVkfSBpbmRleFxuICogICBJbmRleCBvZiBlbGVtZW50IGluIHBhcmVudC5cbiAqIEBwYXJhbSB7UGFyZW50cyB8IHVuZGVmaW5lZH0gcGFyZW50XG4gKiAgIFBhcmVudCBvZiBlbGVtZW50LlxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKiAgIFdoZXRoZXIgdGhlIGNsb3NpbmcgdGFnIGNhbiBiZSBvbWl0dGVkLlxuICovXG5mdW5jdGlvbiBoZWFkT3JDb2xncm91cE9yQ2FwdGlvbihfLCBpbmRleCwgcGFyZW50KSB7XG4gIGNvbnN0IG5leHQgPSBzaWJsaW5nQWZ0ZXIocGFyZW50LCBpbmRleCwgdHJ1ZSlcbiAgcmV0dXJuIChcbiAgICAhbmV4dCB8fFxuICAgIChuZXh0LnR5cGUgIT09ICdjb21tZW50JyAmJlxuICAgICAgIShuZXh0LnR5cGUgPT09ICd0ZXh0JyAmJiB3aGl0ZXNwYWNlKG5leHQudmFsdWUuY2hhckF0KDApKSkpXG4gIClcbn1cblxuLyoqXG4gKiBXaGV0aGVyIHRvIG9taXQgYDwvaHRtbD5gLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gX1xuICogICBFbGVtZW50LlxuICogQHBhcmFtIHtudW1iZXIgfCB1bmRlZmluZWR9IGluZGV4XG4gKiAgIEluZGV4IG9mIGVsZW1lbnQgaW4gcGFyZW50LlxuICogQHBhcmFtIHtQYXJlbnRzIHwgdW5kZWZpbmVkfSBwYXJlbnRcbiAqICAgUGFyZW50IG9mIGVsZW1lbnQuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqICAgV2hldGhlciB0aGUgY2xvc2luZyB0YWcgY2FuIGJlIG9taXR0ZWQuXG4gKi9cbmZ1bmN0aW9uIGh0bWwoXywgaW5kZXgsIHBhcmVudCkge1xuICBjb25zdCBuZXh0ID0gc2libGluZ0FmdGVyKHBhcmVudCwgaW5kZXgpXG4gIHJldHVybiAhbmV4dCB8fCBuZXh0LnR5cGUgIT09ICdjb21tZW50J1xufVxuXG4vKipcbiAqIFdoZXRoZXIgdG8gb21pdCBgPC9ib2R5PmAuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBfXG4gKiAgIEVsZW1lbnQuXG4gKiBAcGFyYW0ge251bWJlciB8IHVuZGVmaW5lZH0gaW5kZXhcbiAqICAgSW5kZXggb2YgZWxlbWVudCBpbiBwYXJlbnQuXG4gKiBAcGFyYW0ge1BhcmVudHMgfCB1bmRlZmluZWR9IHBhcmVudFxuICogICBQYXJlbnQgb2YgZWxlbWVudC5cbiAqIEByZXR1cm5zIHtib29sZWFufVxuICogICBXaGV0aGVyIHRoZSBjbG9zaW5nIHRhZyBjYW4gYmUgb21pdHRlZC5cbiAqL1xuZnVuY3Rpb24gYm9keShfLCBpbmRleCwgcGFyZW50KSB7XG4gIGNvbnN0IG5leHQgPSBzaWJsaW5nQWZ0ZXIocGFyZW50LCBpbmRleClcbiAgcmV0dXJuICFuZXh0IHx8IG5leHQudHlwZSAhPT0gJ2NvbW1lbnQnXG59XG5cbi8qKlxuICogV2hldGhlciB0byBvbWl0IGA8L3A+YC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IF9cbiAqICAgRWxlbWVudC5cbiAqIEBwYXJhbSB7bnVtYmVyIHwgdW5kZWZpbmVkfSBpbmRleFxuICogICBJbmRleCBvZiBlbGVtZW50IGluIHBhcmVudC5cbiAqIEBwYXJhbSB7UGFyZW50cyB8IHVuZGVmaW5lZH0gcGFyZW50XG4gKiAgIFBhcmVudCBvZiBlbGVtZW50LlxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKiAgIFdoZXRoZXIgdGhlIGNsb3NpbmcgdGFnIGNhbiBiZSBvbWl0dGVkLlxuICovXG5mdW5jdGlvbiBwKF8sIGluZGV4LCBwYXJlbnQpIHtcbiAgY29uc3QgbmV4dCA9IHNpYmxpbmdBZnRlcihwYXJlbnQsIGluZGV4KVxuICByZXR1cm4gbmV4dFxuICAgID8gbmV4dC50eXBlID09PSAnZWxlbWVudCcgJiZcbiAgICAgICAgKG5leHQudGFnTmFtZSA9PT0gJ2FkZHJlc3MnIHx8XG4gICAgICAgICAgbmV4dC50YWdOYW1lID09PSAnYXJ0aWNsZScgfHxcbiAgICAgICAgICBuZXh0LnRhZ05hbWUgPT09ICdhc2lkZScgfHxcbiAgICAgICAgICBuZXh0LnRhZ05hbWUgPT09ICdibG9ja3F1b3RlJyB8fFxuICAgICAgICAgIG5leHQudGFnTmFtZSA9PT0gJ2RldGFpbHMnIHx8XG4gICAgICAgICAgbmV4dC50YWdOYW1lID09PSAnZGl2JyB8fFxuICAgICAgICAgIG5leHQudGFnTmFtZSA9PT0gJ2RsJyB8fFxuICAgICAgICAgIG5leHQudGFnTmFtZSA9PT0gJ2ZpZWxkc2V0JyB8fFxuICAgICAgICAgIG5leHQudGFnTmFtZSA9PT0gJ2ZpZ2NhcHRpb24nIHx8XG4gICAgICAgICAgbmV4dC50YWdOYW1lID09PSAnZmlndXJlJyB8fFxuICAgICAgICAgIG5leHQudGFnTmFtZSA9PT0gJ2Zvb3RlcicgfHxcbiAgICAgICAgICBuZXh0LnRhZ05hbWUgPT09ICdmb3JtJyB8fFxuICAgICAgICAgIG5leHQudGFnTmFtZSA9PT0gJ2gxJyB8fFxuICAgICAgICAgIG5leHQudGFnTmFtZSA9PT0gJ2gyJyB8fFxuICAgICAgICAgIG5leHQudGFnTmFtZSA9PT0gJ2gzJyB8fFxuICAgICAgICAgIG5leHQudGFnTmFtZSA9PT0gJ2g0JyB8fFxuICAgICAgICAgIG5leHQudGFnTmFtZSA9PT0gJ2g1JyB8fFxuICAgICAgICAgIG5leHQudGFnTmFtZSA9PT0gJ2g2JyB8fFxuICAgICAgICAgIG5leHQudGFnTmFtZSA9PT0gJ2hlYWRlcicgfHxcbiAgICAgICAgICBuZXh0LnRhZ05hbWUgPT09ICdoZ3JvdXAnIHx8XG4gICAgICAgICAgbmV4dC50YWdOYW1lID09PSAnaHInIHx8XG4gICAgICAgICAgbmV4dC50YWdOYW1lID09PSAnbWFpbicgfHxcbiAgICAgICAgICBuZXh0LnRhZ05hbWUgPT09ICdtZW51JyB8fFxuICAgICAgICAgIG5leHQudGFnTmFtZSA9PT0gJ25hdicgfHxcbiAgICAgICAgICBuZXh0LnRhZ05hbWUgPT09ICdvbCcgfHxcbiAgICAgICAgICBuZXh0LnRhZ05hbWUgPT09ICdwJyB8fFxuICAgICAgICAgIG5leHQudGFnTmFtZSA9PT0gJ3ByZScgfHxcbiAgICAgICAgICBuZXh0LnRhZ05hbWUgPT09ICdzZWN0aW9uJyB8fFxuICAgICAgICAgIG5leHQudGFnTmFtZSA9PT0gJ3RhYmxlJyB8fFxuICAgICAgICAgIG5leHQudGFnTmFtZSA9PT0gJ3VsJylcbiAgICA6ICFwYXJlbnQgfHxcbiAgICAgICAgLy8gQ29uZnVzaW5nIHBhcmVudC5cbiAgICAgICAgIShcbiAgICAgICAgICBwYXJlbnQudHlwZSA9PT0gJ2VsZW1lbnQnICYmXG4gICAgICAgICAgKHBhcmVudC50YWdOYW1lID09PSAnYScgfHxcbiAgICAgICAgICAgIHBhcmVudC50YWdOYW1lID09PSAnYXVkaW8nIHx8XG4gICAgICAgICAgICBwYXJlbnQudGFnTmFtZSA9PT0gJ2RlbCcgfHxcbiAgICAgICAgICAgIHBhcmVudC50YWdOYW1lID09PSAnaW5zJyB8fFxuICAgICAgICAgICAgcGFyZW50LnRhZ05hbWUgPT09ICdtYXAnIHx8XG4gICAgICAgICAgICBwYXJlbnQudGFnTmFtZSA9PT0gJ25vc2NyaXB0JyB8fFxuICAgICAgICAgICAgcGFyZW50LnRhZ05hbWUgPT09ICd2aWRlbycpXG4gICAgICAgIClcbn1cblxuLyoqXG4gKiBXaGV0aGVyIHRvIG9taXQgYDwvbGk+YC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IF9cbiAqICAgRWxlbWVudC5cbiAqIEBwYXJhbSB7bnVtYmVyIHwgdW5kZWZpbmVkfSBpbmRleFxuICogICBJbmRleCBvZiBlbGVtZW50IGluIHBhcmVudC5cbiAqIEBwYXJhbSB7UGFyZW50cyB8IHVuZGVmaW5lZH0gcGFyZW50XG4gKiAgIFBhcmVudCBvZiBlbGVtZW50LlxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKiAgIFdoZXRoZXIgdGhlIGNsb3NpbmcgdGFnIGNhbiBiZSBvbWl0dGVkLlxuICovXG5mdW5jdGlvbiBsaShfLCBpbmRleCwgcGFyZW50KSB7XG4gIGNvbnN0IG5leHQgPSBzaWJsaW5nQWZ0ZXIocGFyZW50LCBpbmRleClcbiAgcmV0dXJuICFuZXh0IHx8IChuZXh0LnR5cGUgPT09ICdlbGVtZW50JyAmJiBuZXh0LnRhZ05hbWUgPT09ICdsaScpXG59XG5cbi8qKlxuICogV2hldGhlciB0byBvbWl0IGA8L2R0PmAuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBfXG4gKiAgIEVsZW1lbnQuXG4gKiBAcGFyYW0ge251bWJlciB8IHVuZGVmaW5lZH0gaW5kZXhcbiAqICAgSW5kZXggb2YgZWxlbWVudCBpbiBwYXJlbnQuXG4gKiBAcGFyYW0ge1BhcmVudHMgfCB1bmRlZmluZWR9IHBhcmVudFxuICogICBQYXJlbnQgb2YgZWxlbWVudC5cbiAqIEByZXR1cm5zIHtib29sZWFufVxuICogICBXaGV0aGVyIHRoZSBjbG9zaW5nIHRhZyBjYW4gYmUgb21pdHRlZC5cbiAqL1xuZnVuY3Rpb24gZHQoXywgaW5kZXgsIHBhcmVudCkge1xuICBjb25zdCBuZXh0ID0gc2libGluZ0FmdGVyKHBhcmVudCwgaW5kZXgpXG4gIHJldHVybiBCb29sZWFuKFxuICAgIG5leHQgJiZcbiAgICAgIG5leHQudHlwZSA9PT0gJ2VsZW1lbnQnICYmXG4gICAgICAobmV4dC50YWdOYW1lID09PSAnZHQnIHx8IG5leHQudGFnTmFtZSA9PT0gJ2RkJylcbiAgKVxufVxuXG4vKipcbiAqIFdoZXRoZXIgdG8gb21pdCBgPC9kZD5gLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gX1xuICogICBFbGVtZW50LlxuICogQHBhcmFtIHtudW1iZXIgfCB1bmRlZmluZWR9IGluZGV4XG4gKiAgIEluZGV4IG9mIGVsZW1lbnQgaW4gcGFyZW50LlxuICogQHBhcmFtIHtQYXJlbnRzIHwgdW5kZWZpbmVkfSBwYXJlbnRcbiAqICAgUGFyZW50IG9mIGVsZW1lbnQuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqICAgV2hldGhlciB0aGUgY2xvc2luZyB0YWcgY2FuIGJlIG9taXR0ZWQuXG4gKi9cbmZ1bmN0aW9uIGRkKF8sIGluZGV4LCBwYXJlbnQpIHtcbiAgY29uc3QgbmV4dCA9IHNpYmxpbmdBZnRlcihwYXJlbnQsIGluZGV4KVxuICByZXR1cm4gKFxuICAgICFuZXh0IHx8XG4gICAgKG5leHQudHlwZSA9PT0gJ2VsZW1lbnQnICYmXG4gICAgICAobmV4dC50YWdOYW1lID09PSAnZHQnIHx8IG5leHQudGFnTmFtZSA9PT0gJ2RkJykpXG4gIClcbn1cblxuLyoqXG4gKiBXaGV0aGVyIHRvIG9taXQgYDwvcnQ+YCBvciBgPC9ycD5gLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gX1xuICogICBFbGVtZW50LlxuICogQHBhcmFtIHtudW1iZXIgfCB1bmRlZmluZWR9IGluZGV4XG4gKiAgIEluZGV4IG9mIGVsZW1lbnQgaW4gcGFyZW50LlxuICogQHBhcmFtIHtQYXJlbnRzIHwgdW5kZWZpbmVkfSBwYXJlbnRcbiAqICAgUGFyZW50IG9mIGVsZW1lbnQuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqICAgV2hldGhlciB0aGUgY2xvc2luZyB0YWcgY2FuIGJlIG9taXR0ZWQuXG4gKi9cbmZ1bmN0aW9uIHJ1YnlFbGVtZW50KF8sIGluZGV4LCBwYXJlbnQpIHtcbiAgY29uc3QgbmV4dCA9IHNpYmxpbmdBZnRlcihwYXJlbnQsIGluZGV4KVxuICByZXR1cm4gKFxuICAgICFuZXh0IHx8XG4gICAgKG5leHQudHlwZSA9PT0gJ2VsZW1lbnQnICYmXG4gICAgICAobmV4dC50YWdOYW1lID09PSAncnAnIHx8IG5leHQudGFnTmFtZSA9PT0gJ3J0JykpXG4gIClcbn1cblxuLyoqXG4gKiBXaGV0aGVyIHRvIG9taXQgYDwvb3B0Z3JvdXA+YC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IF9cbiAqICAgRWxlbWVudC5cbiAqIEBwYXJhbSB7bnVtYmVyIHwgdW5kZWZpbmVkfSBpbmRleFxuICogICBJbmRleCBvZiBlbGVtZW50IGluIHBhcmVudC5cbiAqIEBwYXJhbSB7UGFyZW50cyB8IHVuZGVmaW5lZH0gcGFyZW50XG4gKiAgIFBhcmVudCBvZiBlbGVtZW50LlxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKiAgIFdoZXRoZXIgdGhlIGNsb3NpbmcgdGFnIGNhbiBiZSBvbWl0dGVkLlxuICovXG5mdW5jdGlvbiBvcHRncm91cChfLCBpbmRleCwgcGFyZW50KSB7XG4gIGNvbnN0IG5leHQgPSBzaWJsaW5nQWZ0ZXIocGFyZW50LCBpbmRleClcbiAgcmV0dXJuICFuZXh0IHx8IChuZXh0LnR5cGUgPT09ICdlbGVtZW50JyAmJiBuZXh0LnRhZ05hbWUgPT09ICdvcHRncm91cCcpXG59XG5cbi8qKlxuICogV2hldGhlciB0byBvbWl0IGA8L29wdGlvbj5gLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gX1xuICogICBFbGVtZW50LlxuICogQHBhcmFtIHtudW1iZXIgfCB1bmRlZmluZWR9IGluZGV4XG4gKiAgIEluZGV4IG9mIGVsZW1lbnQgaW4gcGFyZW50LlxuICogQHBhcmFtIHtQYXJlbnRzIHwgdW5kZWZpbmVkfSBwYXJlbnRcbiAqICAgUGFyZW50IG9mIGVsZW1lbnQuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqICAgV2hldGhlciB0aGUgY2xvc2luZyB0YWcgY2FuIGJlIG9taXR0ZWQuXG4gKi9cbmZ1bmN0aW9uIG9wdGlvbihfLCBpbmRleCwgcGFyZW50KSB7XG4gIGNvbnN0IG5leHQgPSBzaWJsaW5nQWZ0ZXIocGFyZW50LCBpbmRleClcbiAgcmV0dXJuIChcbiAgICAhbmV4dCB8fFxuICAgIChuZXh0LnR5cGUgPT09ICdlbGVtZW50JyAmJlxuICAgICAgKG5leHQudGFnTmFtZSA9PT0gJ29wdGlvbicgfHwgbmV4dC50YWdOYW1lID09PSAnb3B0Z3JvdXAnKSlcbiAgKVxufVxuXG4vKipcbiAqIFdoZXRoZXIgdG8gb21pdCBgPC90aGVhZD5gLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gX1xuICogICBFbGVtZW50LlxuICogQHBhcmFtIHtudW1iZXIgfCB1bmRlZmluZWR9IGluZGV4XG4gKiAgIEluZGV4IG9mIGVsZW1lbnQgaW4gcGFyZW50LlxuICogQHBhcmFtIHtQYXJlbnRzIHwgdW5kZWZpbmVkfSBwYXJlbnRcbiAqICAgUGFyZW50IG9mIGVsZW1lbnQuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqICAgV2hldGhlciB0aGUgY2xvc2luZyB0YWcgY2FuIGJlIG9taXR0ZWQuXG4gKi9cbmZ1bmN0aW9uIHRoZWFkKF8sIGluZGV4LCBwYXJlbnQpIHtcbiAgY29uc3QgbmV4dCA9IHNpYmxpbmdBZnRlcihwYXJlbnQsIGluZGV4KVxuICByZXR1cm4gQm9vbGVhbihcbiAgICBuZXh0ICYmXG4gICAgICBuZXh0LnR5cGUgPT09ICdlbGVtZW50JyAmJlxuICAgICAgKG5leHQudGFnTmFtZSA9PT0gJ3Rib2R5JyB8fCBuZXh0LnRhZ05hbWUgPT09ICd0Zm9vdCcpXG4gIClcbn1cblxuLyoqXG4gKiBXaGV0aGVyIHRvIG9taXQgYDwvdGJvZHk+YC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IF9cbiAqICAgRWxlbWVudC5cbiAqIEBwYXJhbSB7bnVtYmVyIHwgdW5kZWZpbmVkfSBpbmRleFxuICogICBJbmRleCBvZiBlbGVtZW50IGluIHBhcmVudC5cbiAqIEBwYXJhbSB7UGFyZW50cyB8IHVuZGVmaW5lZH0gcGFyZW50XG4gKiAgIFBhcmVudCBvZiBlbGVtZW50LlxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKiAgIFdoZXRoZXIgdGhlIGNsb3NpbmcgdGFnIGNhbiBiZSBvbWl0dGVkLlxuICovXG5mdW5jdGlvbiB0Ym9keShfLCBpbmRleCwgcGFyZW50KSB7XG4gIGNvbnN0IG5leHQgPSBzaWJsaW5nQWZ0ZXIocGFyZW50LCBpbmRleClcbiAgcmV0dXJuIChcbiAgICAhbmV4dCB8fFxuICAgIChuZXh0LnR5cGUgPT09ICdlbGVtZW50JyAmJlxuICAgICAgKG5leHQudGFnTmFtZSA9PT0gJ3Rib2R5JyB8fCBuZXh0LnRhZ05hbWUgPT09ICd0Zm9vdCcpKVxuICApXG59XG5cbi8qKlxuICogV2hldGhlciB0byBvbWl0IGA8L3Rmb290PmAuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBfXG4gKiAgIEVsZW1lbnQuXG4gKiBAcGFyYW0ge251bWJlciB8IHVuZGVmaW5lZH0gaW5kZXhcbiAqICAgSW5kZXggb2YgZWxlbWVudCBpbiBwYXJlbnQuXG4gKiBAcGFyYW0ge1BhcmVudHMgfCB1bmRlZmluZWR9IHBhcmVudFxuICogICBQYXJlbnQgb2YgZWxlbWVudC5cbiAqIEByZXR1cm5zIHtib29sZWFufVxuICogICBXaGV0aGVyIHRoZSBjbG9zaW5nIHRhZyBjYW4gYmUgb21pdHRlZC5cbiAqL1xuZnVuY3Rpb24gdGZvb3QoXywgaW5kZXgsIHBhcmVudCkge1xuICByZXR1cm4gIXNpYmxpbmdBZnRlcihwYXJlbnQsIGluZGV4KVxufVxuXG4vKipcbiAqIFdoZXRoZXIgdG8gb21pdCBgPC90cj5gLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gX1xuICogICBFbGVtZW50LlxuICogQHBhcmFtIHtudW1iZXIgfCB1bmRlZmluZWR9IGluZGV4XG4gKiAgIEluZGV4IG9mIGVsZW1lbnQgaW4gcGFyZW50LlxuICogQHBhcmFtIHtQYXJlbnRzIHwgdW5kZWZpbmVkfSBwYXJlbnRcbiAqICAgUGFyZW50IG9mIGVsZW1lbnQuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqICAgV2hldGhlciB0aGUgY2xvc2luZyB0YWcgY2FuIGJlIG9taXR0ZWQuXG4gKi9cbmZ1bmN0aW9uIHRyKF8sIGluZGV4LCBwYXJlbnQpIHtcbiAgY29uc3QgbmV4dCA9IHNpYmxpbmdBZnRlcihwYXJlbnQsIGluZGV4KVxuICByZXR1cm4gIW5leHQgfHwgKG5leHQudHlwZSA9PT0gJ2VsZW1lbnQnICYmIG5leHQudGFnTmFtZSA9PT0gJ3RyJylcbn1cblxuLyoqXG4gKiBXaGV0aGVyIHRvIG9taXQgYDwvdGQ+YCBvciBgPC90aD5gLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gX1xuICogICBFbGVtZW50LlxuICogQHBhcmFtIHtudW1iZXIgfCB1bmRlZmluZWR9IGluZGV4XG4gKiAgIEluZGV4IG9mIGVsZW1lbnQgaW4gcGFyZW50LlxuICogQHBhcmFtIHtQYXJlbnRzIHwgdW5kZWZpbmVkfSBwYXJlbnRcbiAqICAgUGFyZW50IG9mIGVsZW1lbnQuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqICAgV2hldGhlciB0aGUgY2xvc2luZyB0YWcgY2FuIGJlIG9taXR0ZWQuXG4gKi9cbmZ1bmN0aW9uIGNlbGxzKF8sIGluZGV4LCBwYXJlbnQpIHtcbiAgY29uc3QgbmV4dCA9IHNpYmxpbmdBZnRlcihwYXJlbnQsIGluZGV4KVxuICByZXR1cm4gKFxuICAgICFuZXh0IHx8XG4gICAgKG5leHQudHlwZSA9PT0gJ2VsZW1lbnQnICYmXG4gICAgICAobmV4dC50YWdOYW1lID09PSAndGQnIHx8IG5leHQudGFnTmFtZSA9PT0gJ3RoJykpXG4gIClcbn1cbiIsCiAgICAiLyoqXG4gKiBAaW1wb3J0IHtFbGVtZW50LCBQYXJlbnRzfSBmcm9tICdoYXN0J1xuICovXG5cbmltcG9ydCB7d2hpdGVzcGFjZX0gZnJvbSAnaGFzdC11dGlsLXdoaXRlc3BhY2UnXG5pbXBvcnQge3NpYmxpbmdBZnRlciwgc2libGluZ0JlZm9yZX0gZnJvbSAnLi91dGlsL3NpYmxpbmdzLmpzJ1xuaW1wb3J0IHtjbG9zaW5nfSBmcm9tICcuL2Nsb3NpbmcuanMnXG5pbXBvcnQge29taXNzaW9ufSBmcm9tICcuL29taXNzaW9uLmpzJ1xuXG5leHBvcnQgY29uc3Qgb3BlbmluZyA9IG9taXNzaW9uKHtcbiAgYm9keSxcbiAgY29sZ3JvdXAsXG4gIGhlYWQsXG4gIGh0bWwsXG4gIHRib2R5XG59KVxuXG4vKipcbiAqIFdoZXRoZXIgdG8gb21pdCBgPGh0bWw+YC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IG5vZGVcbiAqICAgRWxlbWVudC5cbiAqIEByZXR1cm5zIHtib29sZWFufVxuICogICBXaGV0aGVyIHRoZSBvcGVuaW5nIHRhZyBjYW4gYmUgb21pdHRlZC5cbiAqL1xuZnVuY3Rpb24gaHRtbChub2RlKSB7XG4gIGNvbnN0IGhlYWQgPSBzaWJsaW5nQWZ0ZXIobm9kZSwgLTEpXG4gIHJldHVybiAhaGVhZCB8fCBoZWFkLnR5cGUgIT09ICdjb21tZW50J1xufVxuXG4vKipcbiAqIFdoZXRoZXIgdG8gb21pdCBgPGhlYWQ+YC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IG5vZGVcbiAqICAgRWxlbWVudC5cbiAqIEByZXR1cm5zIHtib29sZWFufVxuICogICBXaGV0aGVyIHRoZSBvcGVuaW5nIHRhZyBjYW4gYmUgb21pdHRlZC5cbiAqL1xuZnVuY3Rpb24gaGVhZChub2RlKSB7XG4gIC8qKiBAdHlwZSB7U2V0PHN0cmluZz59ICovXG4gIGNvbnN0IHNlZW4gPSBuZXcgU2V0KClcblxuICAvLyBXaGV0aGVyIGBzcmNkb2NgIG9yIG5vdCxcbiAgLy8gbWFrZSBzdXJlIHRoZSBjb250ZW50IG1vZGVsIGF0IGxlYXN0IGRvZXNu4oCZdCBoYXZlIHRvbyBtYW55IGBiYXNlYHMvYHRpdGxlYHMuXG4gIGZvciAoY29uc3QgY2hpbGQgb2Ygbm9kZS5jaGlsZHJlbikge1xuICAgIGlmIChcbiAgICAgIGNoaWxkLnR5cGUgPT09ICdlbGVtZW50JyAmJlxuICAgICAgKGNoaWxkLnRhZ05hbWUgPT09ICdiYXNlJyB8fCBjaGlsZC50YWdOYW1lID09PSAndGl0bGUnKVxuICAgICkge1xuICAgICAgaWYgKHNlZW4uaGFzKGNoaWxkLnRhZ05hbWUpKSByZXR1cm4gZmFsc2VcbiAgICAgIHNlZW4uYWRkKGNoaWxkLnRhZ05hbWUpXG4gICAgfVxuICB9XG5cbiAgLy8g4oCcTWF5IGJlIG9taXR0ZWQgaWYgdGhlIGVsZW1lbnQgaXMgZW1wdHksXG4gIC8vIG9yIGlmIHRoZSBmaXJzdCB0aGluZyBpbnNpZGUgdGhlIGhlYWQgZWxlbWVudCBpcyBhbiBlbGVtZW50LuKAnVxuICBjb25zdCBjaGlsZCA9IG5vZGUuY2hpbGRyZW5bMF1cbiAgcmV0dXJuICFjaGlsZCB8fCBjaGlsZC50eXBlID09PSAnZWxlbWVudCdcbn1cblxuLyoqXG4gKiBXaGV0aGVyIHRvIG9taXQgYDxib2R5PmAuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBub2RlXG4gKiAgIEVsZW1lbnQuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqICAgV2hldGhlciB0aGUgb3BlbmluZyB0YWcgY2FuIGJlIG9taXR0ZWQuXG4gKi9cbmZ1bmN0aW9uIGJvZHkobm9kZSkge1xuICBjb25zdCBoZWFkID0gc2libGluZ0FmdGVyKG5vZGUsIC0xLCB0cnVlKVxuXG4gIHJldHVybiAoXG4gICAgIWhlYWQgfHxcbiAgICAoaGVhZC50eXBlICE9PSAnY29tbWVudCcgJiZcbiAgICAgICEoaGVhZC50eXBlID09PSAndGV4dCcgJiYgd2hpdGVzcGFjZShoZWFkLnZhbHVlLmNoYXJBdCgwKSkpICYmXG4gICAgICAhKFxuICAgICAgICBoZWFkLnR5cGUgPT09ICdlbGVtZW50JyAmJlxuICAgICAgICAoaGVhZC50YWdOYW1lID09PSAnbWV0YScgfHxcbiAgICAgICAgICBoZWFkLnRhZ05hbWUgPT09ICdsaW5rJyB8fFxuICAgICAgICAgIGhlYWQudGFnTmFtZSA9PT0gJ3NjcmlwdCcgfHxcbiAgICAgICAgICBoZWFkLnRhZ05hbWUgPT09ICdzdHlsZScgfHxcbiAgICAgICAgICBoZWFkLnRhZ05hbWUgPT09ICd0ZW1wbGF0ZScpXG4gICAgICApKVxuICApXG59XG5cbi8qKlxuICogV2hldGhlciB0byBvbWl0IGA8Y29sZ3JvdXA+YC5cbiAqIFRoZSBzcGVjIGRlc2NyaWJlcyBzb21lIGxvZ2ljIGZvciB0aGUgb3BlbmluZyB0YWcsIGJ1dCBpdOKAmXMgZWFzaWVyIHRvXG4gKiBpbXBsZW1lbnQgaW4gdGhlIGNsb3NpbmcgdGFnLCB0byB0aGUgc2FtZSBlZmZlY3QsIHNvIHdlIGhhbmRsZSBpdCB0aGVyZVxuICogaW5zdGVhZC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IG5vZGVcbiAqICAgRWxlbWVudC5cbiAqIEBwYXJhbSB7bnVtYmVyIHwgdW5kZWZpbmVkfSBpbmRleFxuICogICBJbmRleCBvZiBlbGVtZW50IGluIHBhcmVudC5cbiAqIEBwYXJhbSB7UGFyZW50cyB8IHVuZGVmaW5lZH0gcGFyZW50XG4gKiAgIFBhcmVudCBvZiBlbGVtZW50LlxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKiAgIFdoZXRoZXIgdGhlIG9wZW5pbmcgdGFnIGNhbiBiZSBvbWl0dGVkLlxuICovXG5mdW5jdGlvbiBjb2xncm91cChub2RlLCBpbmRleCwgcGFyZW50KSB7XG4gIGNvbnN0IHByZXZpb3VzID0gc2libGluZ0JlZm9yZShwYXJlbnQsIGluZGV4KVxuICBjb25zdCBoZWFkID0gc2libGluZ0FmdGVyKG5vZGUsIC0xLCB0cnVlKVxuXG4gIC8vIFByZXZpb3VzIGNvbGdyb3VwIHdhcyBhbHJlYWR5IG9taXR0ZWQuXG4gIGlmIChcbiAgICBwYXJlbnQgJiZcbiAgICBwcmV2aW91cyAmJlxuICAgIHByZXZpb3VzLnR5cGUgPT09ICdlbGVtZW50JyAmJlxuICAgIHByZXZpb3VzLnRhZ05hbWUgPT09ICdjb2xncm91cCcgJiZcbiAgICBjbG9zaW5nKHByZXZpb3VzLCBwYXJlbnQuY2hpbGRyZW4uaW5kZXhPZihwcmV2aW91cyksIHBhcmVudClcbiAgKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gQm9vbGVhbihoZWFkICYmIGhlYWQudHlwZSA9PT0gJ2VsZW1lbnQnICYmIGhlYWQudGFnTmFtZSA9PT0gJ2NvbCcpXG59XG5cbi8qKlxuICogV2hldGhlciB0byBvbWl0IGA8dGJvZHk+YC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IG5vZGVcbiAqICAgRWxlbWVudC5cbiAqIEBwYXJhbSB7bnVtYmVyIHwgdW5kZWZpbmVkfSBpbmRleFxuICogICBJbmRleCBvZiBlbGVtZW50IGluIHBhcmVudC5cbiAqIEBwYXJhbSB7UGFyZW50cyB8IHVuZGVmaW5lZH0gcGFyZW50XG4gKiAgIFBhcmVudCBvZiBlbGVtZW50LlxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKiAgIFdoZXRoZXIgdGhlIG9wZW5pbmcgdGFnIGNhbiBiZSBvbWl0dGVkLlxuICovXG5mdW5jdGlvbiB0Ym9keShub2RlLCBpbmRleCwgcGFyZW50KSB7XG4gIGNvbnN0IHByZXZpb3VzID0gc2libGluZ0JlZm9yZShwYXJlbnQsIGluZGV4KVxuICBjb25zdCBoZWFkID0gc2libGluZ0FmdGVyKG5vZGUsIC0xKVxuXG4gIC8vIFByZXZpb3VzIHRhYmxlIHNlY3Rpb24gd2FzIGFscmVhZHkgb21pdHRlZC5cbiAgaWYgKFxuICAgIHBhcmVudCAmJlxuICAgIHByZXZpb3VzICYmXG4gICAgcHJldmlvdXMudHlwZSA9PT0gJ2VsZW1lbnQnICYmXG4gICAgKHByZXZpb3VzLnRhZ05hbWUgPT09ICd0aGVhZCcgfHwgcHJldmlvdXMudGFnTmFtZSA9PT0gJ3Rib2R5JykgJiZcbiAgICBjbG9zaW5nKHByZXZpb3VzLCBwYXJlbnQuY2hpbGRyZW4uaW5kZXhPZihwcmV2aW91cyksIHBhcmVudClcbiAgKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gQm9vbGVhbihoZWFkICYmIGhlYWQudHlwZSA9PT0gJ2VsZW1lbnQnICYmIGhlYWQudGFnTmFtZSA9PT0gJ3RyJylcbn1cbiIsCiAgICAiLyoqXG4gKiBAaW1wb3J0IHtFbGVtZW50LCBQYXJlbnRzLCBQcm9wZXJ0aWVzfSBmcm9tICdoYXN0J1xuICogQGltcG9ydCB7U3RhdGV9IGZyb20gJy4uL2luZGV4LmpzJ1xuICovXG5cbmltcG9ydCB7Y2NvdW50fSBmcm9tICdjY291bnQnXG5pbXBvcnQge3N0cmluZ2lmeSBhcyBjb21tYXN9IGZyb20gJ2NvbW1hLXNlcGFyYXRlZC10b2tlbnMnXG5pbXBvcnQge2ZpbmQsIHN2Z30gZnJvbSAncHJvcGVydHktaW5mb3JtYXRpb24nXG5pbXBvcnQge3N0cmluZ2lmeSBhcyBzcGFjZXN9IGZyb20gJ3NwYWNlLXNlcGFyYXRlZC10b2tlbnMnXG5pbXBvcnQge3N0cmluZ2lmeUVudGl0aWVzfSBmcm9tICdzdHJpbmdpZnktZW50aXRpZXMnXG5pbXBvcnQge2Nsb3Npbmd9IGZyb20gJy4uL29taXNzaW9uL2Nsb3NpbmcuanMnXG5pbXBvcnQge29wZW5pbmd9IGZyb20gJy4uL29taXNzaW9uL29wZW5pbmcuanMnXG5cbi8qKlxuICogTWFwcyBvZiBzdWJzZXRzLlxuICpcbiAqIEVhY2ggdmFsdWUgaXMgYSBtYXRyaXggb2YgdHVwbGVzLlxuICogVGhlIHZhbHVlIGF0IGAwYCBjYXVzZXMgcGFyc2UgZXJyb3JzLCB0aGUgdmFsdWUgYXQgYDFgIGlzIHZhbGlkLlxuICogT2YgYm90aCwgdGhlIHZhbHVlIGF0IGAwYCBpcyB1bnNhZmUsIGFuZCB0aGUgdmFsdWUgYXQgYDFgIGlzIHNhZmUuXG4gKlxuICogQHR5cGUge1JlY29yZDwnZG91YmxlJyB8ICduYW1lJyB8ICdzaW5nbGUnIHwgJ3VucXVvdGVkJywgQXJyYXk8W0FycmF5PHN0cmluZz4sIEFycmF5PHN0cmluZz5dPj59XG4gKi9cbmNvbnN0IGNvbnN0YW50cyA9IHtcbiAgLy8gU2VlOiA8aHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy8jYXR0cmlidXRlLW5hbWUtc3RhdGU+LlxuICBuYW1lOiBbXG4gICAgWydcXHRcXG5cXGZcXHIgJi89Picuc3BsaXQoJycpLCAnXFx0XFxuXFxmXFxyIFwiJlxcJy89PmAnLnNwbGl0KCcnKV0sXG4gICAgWydcXDBcXHRcXG5cXGZcXHIgXCImXFwnLzw9Picuc3BsaXQoJycpLCAnXFwwXFx0XFxuXFxmXFxyIFwiJlxcJy88PT5gJy5zcGxpdCgnJyldXG4gIF0sXG4gIC8vIFNlZTogPGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvI2F0dHJpYnV0ZS12YWx1ZS0odW5xdW90ZWQpLXN0YXRlPi5cbiAgdW5xdW90ZWQ6IFtcbiAgICBbJ1xcdFxcblxcZlxcciAmPicuc3BsaXQoJycpLCAnXFwwXFx0XFxuXFxmXFxyIFwiJlxcJzw9PmAnLnNwbGl0KCcnKV0sXG4gICAgWydcXDBcXHRcXG5cXGZcXHIgXCImXFwnPD0+YCcuc3BsaXQoJycpLCAnXFwwXFx0XFxuXFxmXFxyIFwiJlxcJzw9PmAnLnNwbGl0KCcnKV1cbiAgXSxcbiAgLy8gU2VlOiA8aHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy8jYXR0cmlidXRlLXZhbHVlLShzaW5nbGUtcXVvdGVkKS1zdGF0ZT4uXG4gIHNpbmdsZTogW1xuICAgIFtcIiYnXCIuc3BsaXQoJycpLCAnXCImXFwnYCcuc3BsaXQoJycpXSxcbiAgICBbXCJcXDAmJ1wiLnNwbGl0KCcnKSwgJ1xcMFwiJlxcJ2AnLnNwbGl0KCcnKV1cbiAgXSxcbiAgLy8gU2VlOiA8aHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy8jYXR0cmlidXRlLXZhbHVlLShkb3VibGUtcXVvdGVkKS1zdGF0ZT4uXG4gIGRvdWJsZTogW1xuICAgIFsnXCImJy5zcGxpdCgnJyksICdcIiZcXCdgJy5zcGxpdCgnJyldLFxuICAgIFsnXFwwXCImJy5zcGxpdCgnJyksICdcXDBcIiZcXCdgJy5zcGxpdCgnJyldXG4gIF1cbn1cblxuLyoqXG4gKiBTZXJpYWxpemUgYW4gZWxlbWVudCBub2RlLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gbm9kZVxuICogICBOb2RlIHRvIGhhbmRsZS5cbiAqIEBwYXJhbSB7bnVtYmVyIHwgdW5kZWZpbmVkfSBpbmRleFxuICogICBJbmRleCBvZiBgbm9kZWAgaW4gYHBhcmVudC5cbiAqIEBwYXJhbSB7UGFyZW50cyB8IHVuZGVmaW5lZH0gcGFyZW50XG4gKiAgIFBhcmVudCBvZiBgbm9kZWAuXG4gKiBAcGFyYW0ge1N0YXRlfSBzdGF0ZVxuICogICBJbmZvIHBhc3NlZCBhcm91bmQgYWJvdXQgdGhlIGN1cnJlbnQgc3RhdGUuXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICogICBTZXJpYWxpemVkIG5vZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbGVtZW50KG5vZGUsIGluZGV4LCBwYXJlbnQsIHN0YXRlKSB7XG4gIGNvbnN0IHNjaGVtYSA9IHN0YXRlLnNjaGVtYVxuICBjb25zdCBvbWl0ID0gc2NoZW1hLnNwYWNlID09PSAnc3ZnJyA/IGZhbHNlIDogc3RhdGUuc2V0dGluZ3Mub21pdE9wdGlvbmFsVGFnc1xuICBsZXQgc2VsZkNsb3NpbmcgPVxuICAgIHNjaGVtYS5zcGFjZSA9PT0gJ3N2ZydcbiAgICAgID8gc3RhdGUuc2V0dGluZ3MuY2xvc2VFbXB0eUVsZW1lbnRzXG4gICAgICA6IHN0YXRlLnNldHRpbmdzLnZvaWRzLmluY2x1ZGVzKG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpKVxuICAvKiogQHR5cGUge0FycmF5PHN0cmluZz59ICovXG4gIGNvbnN0IHBhcnRzID0gW11cbiAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gIGxldCBsYXN0XG5cbiAgaWYgKHNjaGVtYS5zcGFjZSA9PT0gJ2h0bWwnICYmIG5vZGUudGFnTmFtZSA9PT0gJ3N2ZycpIHtcbiAgICBzdGF0ZS5zY2hlbWEgPSBzdmdcbiAgfVxuXG4gIGNvbnN0IGF0dHJpYnV0ZXMgPSBzZXJpYWxpemVBdHRyaWJ1dGVzKHN0YXRlLCBub2RlLnByb3BlcnRpZXMpXG5cbiAgY29uc3QgY29udGVudCA9IHN0YXRlLmFsbChcbiAgICBzY2hlbWEuc3BhY2UgPT09ICdodG1sJyAmJiBub2RlLnRhZ05hbWUgPT09ICd0ZW1wbGF0ZScgPyBub2RlLmNvbnRlbnQgOiBub2RlXG4gIClcblxuICBzdGF0ZS5zY2hlbWEgPSBzY2hlbWFcblxuICAvLyBJZiB0aGUgbm9kZSBpcyBjYXRlZ29yaXNlZCBhcyB2b2lkLCBidXQgaXQgaGFzIGNoaWxkcmVuLCByZW1vdmUgdGhlXG4gIC8vIGNhdGVnb3Jpc2F0aW9uLlxuICAvLyBUaGlzIGVuYWJsZXMgZm9yIGV4YW1wbGUgYG1lbnVpdGVtYHMsIHdoaWNoIGFyZSB2b2lkIGluIFczQyBIVE1MIGJ1dCBub3RcbiAgLy8gdm9pZCBpbiBXSEFUV0cgSFRNTCwgdG8gYmUgc3RyaW5naWZpZWQgcHJvcGVybHkuXG4gIC8vIE5vdGU6IGBtZW51aXRlbWAgaGFzIHNpbmNlIGJlZW4gcmVtb3ZlZCBmcm9tIHRoZSBIVE1MIHNwZWMsIGFuZCBzbyBpcyBub1xuICAvLyBsb25nZXIgdm9pZC5cbiAgaWYgKGNvbnRlbnQpIHNlbGZDbG9zaW5nID0gZmFsc2VcblxuICBpZiAoYXR0cmlidXRlcyB8fCAhb21pdCB8fCAhb3BlbmluZyhub2RlLCBpbmRleCwgcGFyZW50KSkge1xuICAgIHBhcnRzLnB1c2goJzwnLCBub2RlLnRhZ05hbWUsIGF0dHJpYnV0ZXMgPyAnICcgKyBhdHRyaWJ1dGVzIDogJycpXG5cbiAgICBpZiAoXG4gICAgICBzZWxmQ2xvc2luZyAmJlxuICAgICAgKHNjaGVtYS5zcGFjZSA9PT0gJ3N2ZycgfHwgc3RhdGUuc2V0dGluZ3MuY2xvc2VTZWxmQ2xvc2luZylcbiAgICApIHtcbiAgICAgIGxhc3QgPSBhdHRyaWJ1dGVzLmNoYXJBdChhdHRyaWJ1dGVzLmxlbmd0aCAtIDEpXG4gICAgICBpZiAoXG4gICAgICAgICFzdGF0ZS5zZXR0aW5ncy50aWdodFNlbGZDbG9zaW5nIHx8XG4gICAgICAgIGxhc3QgPT09ICcvJyB8fFxuICAgICAgICAobGFzdCAmJiBsYXN0ICE9PSAnXCInICYmIGxhc3QgIT09IFwiJ1wiKVxuICAgICAgKSB7XG4gICAgICAgIHBhcnRzLnB1c2goJyAnKVxuICAgICAgfVxuXG4gICAgICBwYXJ0cy5wdXNoKCcvJylcbiAgICB9XG5cbiAgICBwYXJ0cy5wdXNoKCc+JylcbiAgfVxuXG4gIHBhcnRzLnB1c2goY29udGVudClcblxuICBpZiAoIXNlbGZDbG9zaW5nICYmICghb21pdCB8fCAhY2xvc2luZyhub2RlLCBpbmRleCwgcGFyZW50KSkpIHtcbiAgICBwYXJ0cy5wdXNoKCc8LycgKyBub2RlLnRhZ05hbWUgKyAnPicpXG4gIH1cblxuICByZXR1cm4gcGFydHMuam9pbignJylcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1N0YXRlfSBzdGF0ZVxuICogQHBhcmFtIHtQcm9wZXJ0aWVzIHwgbnVsbCB8IHVuZGVmaW5lZH0gcHJvcGVydGllc1xuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gc2VyaWFsaXplQXR0cmlidXRlcyhzdGF0ZSwgcHJvcGVydGllcykge1xuICAvKiogQHR5cGUge0FycmF5PHN0cmluZz59ICovXG4gIGNvbnN0IHZhbHVlcyA9IFtdXG4gIGxldCBpbmRleCA9IC0xXG4gIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuICBsZXQga2V5XG5cbiAgaWYgKHByb3BlcnRpZXMpIHtcbiAgICBmb3IgKGtleSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICBpZiAocHJvcGVydGllc1trZXldICE9PSBudWxsICYmIHByb3BlcnRpZXNba2V5XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gc2VyaWFsaXplQXR0cmlidXRlKHN0YXRlLCBrZXksIHByb3BlcnRpZXNba2V5XSlcbiAgICAgICAgaWYgKHZhbHVlKSB2YWx1ZXMucHVzaCh2YWx1ZSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB3aGlsZSAoKytpbmRleCA8IHZhbHVlcy5sZW5ndGgpIHtcbiAgICBjb25zdCBsYXN0ID0gc3RhdGUuc2V0dGluZ3MudGlnaHRBdHRyaWJ1dGVzXG4gICAgICA/IHZhbHVlc1tpbmRleF0uY2hhckF0KHZhbHVlc1tpbmRleF0ubGVuZ3RoIC0gMSlcbiAgICAgIDogdW5kZWZpbmVkXG5cbiAgICAvLyBJbiB0aWdodCBtb2RlLCBkb27igJl0IGFkZCBhIHNwYWNlIGFmdGVyIHF1b3RlZCBhdHRyaWJ1dGVzLlxuICAgIGlmIChpbmRleCAhPT0gdmFsdWVzLmxlbmd0aCAtIDEgJiYgbGFzdCAhPT0gJ1wiJyAmJiBsYXN0ICE9PSBcIidcIikge1xuICAgICAgdmFsdWVzW2luZGV4XSArPSAnICdcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdmFsdWVzLmpvaW4oJycpXG59XG5cbi8qKlxuICogQHBhcmFtIHtTdGF0ZX0gc3RhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7UHJvcGVydGllc1trZXlvZiBQcm9wZXJ0aWVzXX0gdmFsdWVcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIHNlcmlhbGl6ZUF0dHJpYnV0ZShzdGF0ZSwga2V5LCB2YWx1ZSkge1xuICBjb25zdCBpbmZvID0gZmluZChzdGF0ZS5zY2hlbWEsIGtleSlcbiAgY29uc3QgeCA9XG4gICAgc3RhdGUuc2V0dGluZ3MuYWxsb3dQYXJzZUVycm9ycyAmJiBzdGF0ZS5zY2hlbWEuc3BhY2UgPT09ICdodG1sJyA/IDAgOiAxXG4gIGNvbnN0IHkgPSBzdGF0ZS5zZXR0aW5ncy5hbGxvd0Rhbmdlcm91c0NoYXJhY3RlcnMgPyAwIDogMVxuICBsZXQgcXVvdGUgPSBzdGF0ZS5xdW90ZVxuICAvKiogQHR5cGUge3N0cmluZyB8IHVuZGVmaW5lZH0gKi9cbiAgbGV0IHJlc3VsdFxuXG4gIGlmIChpbmZvLm92ZXJsb2FkZWRCb29sZWFuICYmICh2YWx1ZSA9PT0gaW5mby5hdHRyaWJ1dGUgfHwgdmFsdWUgPT09ICcnKSkge1xuICAgIHZhbHVlID0gdHJ1ZVxuICB9IGVsc2UgaWYgKFxuICAgIChpbmZvLmJvb2xlYW4gfHwgaW5mby5vdmVybG9hZGVkQm9vbGVhbikgJiZcbiAgICAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJyB8fCB2YWx1ZSA9PT0gaW5mby5hdHRyaWJ1dGUgfHwgdmFsdWUgPT09ICcnKVxuICApIHtcbiAgICB2YWx1ZSA9IEJvb2xlYW4odmFsdWUpXG4gIH1cblxuICBpZiAoXG4gICAgdmFsdWUgPT09IG51bGwgfHxcbiAgICB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8XG4gICAgdmFsdWUgPT09IGZhbHNlIHx8XG4gICAgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgTnVtYmVyLmlzTmFOKHZhbHVlKSlcbiAgKSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICBjb25zdCBuYW1lID0gc3RyaW5naWZ5RW50aXRpZXMoXG4gICAgaW5mby5hdHRyaWJ1dGUsXG4gICAgT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUuc2V0dGluZ3MuY2hhcmFjdGVyUmVmZXJlbmNlcywge1xuICAgICAgLy8gQWx3YXlzIGVuY29kZSB3aXRob3V0IHBhcnNlIGVycm9ycyBpbiBub24tSFRNTC5cbiAgICAgIHN1YnNldDogY29uc3RhbnRzLm5hbWVbeF1beV1cbiAgICB9KVxuICApXG5cbiAgLy8gTm8gdmFsdWUuXG4gIC8vIFRoZXJlIGlzIGN1cnJlbnRseSBvbmx5IG9uZSBib29sZWFuIHByb3BlcnR5IGluIFNWRzogYFtkb3dubG9hZF1gIG9uXG4gIC8vIGA8YT5gLlxuICAvLyBUaGlzIHByb3BlcnR5IGRvZXMgbm90IHNlZW0gdG8gd29yayBpbiBicm93c2VycyAoRmlyZWZveCwgU2FmYXJpLCBDaHJvbWUpLFxuICAvLyBzbyBJIGNhbuKAmXQgdGVzdCBpZiBkcm9wcGluZyB0aGUgdmFsdWUgd29ya3MuXG4gIC8vIEJ1dCBJIGFzc3VtZSB0aGF0IGl0IHNob3VsZDpcbiAgLy9cbiAgLy8gYGBgaHRtbFxuICAvLyA8IWRvY3R5cGUgaHRtbD5cbiAgLy8gPHN2ZyB2aWV3Qm94PVwiMCAwIDEwMCAxMDBcIj5cbiAgLy8gICA8YSBocmVmPWh0dHBzOi8vZXhhbXBsZS5jb20gZG93bmxvYWQ+XG4gIC8vICAgICA8Y2lyY2xlIGN4PTUwIGN5PTQwIHI9MzUgLz5cbiAgLy8gICA8L2E+XG4gIC8vIDwvc3ZnPlxuICAvLyBgYGBcbiAgLy9cbiAgLy8gU2VlOiA8aHR0cHM6Ly9naXRodWIuY29tL3dvb29ybS9wcm9wZXJ0eS1pbmZvcm1hdGlvbi9ibG9iL21haW4vbGliL3N2Zy5qcz5cbiAgaWYgKHZhbHVlID09PSB0cnVlKSByZXR1cm4gbmFtZVxuXG4gIC8vIGBzcGFjZXNgIGRvZXNu4oCZdCBhY2NlcHQgYSBzZWNvbmQgYXJndW1lbnQsIGJ1dCBpdOKAmXMgZ2l2ZW4gaGVyZSBqdXN0IHRvXG4gIC8vIGtlZXAgdGhlIGNvZGUgY2xlYW5lci5cbiAgdmFsdWUgPSBBcnJheS5pc0FycmF5KHZhbHVlKVxuICAgID8gKGluZm8uY29tbWFTZXBhcmF0ZWQgPyBjb21tYXMgOiBzcGFjZXMpKHZhbHVlLCB7XG4gICAgICAgIHBhZExlZnQ6ICFzdGF0ZS5zZXR0aW5ncy50aWdodENvbW1hU2VwYXJhdGVkTGlzdHNcbiAgICAgIH0pXG4gICAgOiBTdHJpbmcodmFsdWUpXG5cbiAgaWYgKHN0YXRlLnNldHRpbmdzLmNvbGxhcHNlRW1wdHlBdHRyaWJ1dGVzICYmICF2YWx1ZSkgcmV0dXJuIG5hbWVcblxuICAvLyBDaGVjayB1bnF1b3RlZCB2YWx1ZS5cbiAgaWYgKHN0YXRlLnNldHRpbmdzLnByZWZlclVucXVvdGVkKSB7XG4gICAgcmVzdWx0ID0gc3RyaW5naWZ5RW50aXRpZXMoXG4gICAgICB2YWx1ZSxcbiAgICAgIE9iamVjdC5hc3NpZ24oe30sIHN0YXRlLnNldHRpbmdzLmNoYXJhY3RlclJlZmVyZW5jZXMsIHtcbiAgICAgICAgYXR0cmlidXRlOiB0cnVlLFxuICAgICAgICBzdWJzZXQ6IGNvbnN0YW50cy51bnF1b3RlZFt4XVt5XVxuICAgICAgfSlcbiAgICApXG4gIH1cblxuICAvLyBJZiB3ZSBkb27igJl0IHdhbnQgdW5xdW90ZWQsIG9yIGlmIGB2YWx1ZWAgY29udGFpbnMgY2hhcmFjdGVyIHJlZmVyZW5jZXMgd2hlblxuICAvLyB1bnF1b3RlZOKAplxuICBpZiAocmVzdWx0ICE9PSB2YWx1ZSkge1xuICAgIC8vIElmIHRoZSBhbHRlcm5hdGl2ZSBpcyBsZXNzIGNvbW1vbiB0aGFuIGBxdW90ZWAsIHN3aXRjaC5cbiAgICBpZiAoXG4gICAgICBzdGF0ZS5zZXR0aW5ncy5xdW90ZVNtYXJ0ICYmXG4gICAgICBjY291bnQodmFsdWUsIHF1b3RlKSA+IGNjb3VudCh2YWx1ZSwgc3RhdGUuYWx0ZXJuYXRpdmUpXG4gICAgKSB7XG4gICAgICBxdW90ZSA9IHN0YXRlLmFsdGVybmF0aXZlXG4gICAgfVxuXG4gICAgcmVzdWx0ID1cbiAgICAgIHF1b3RlICtcbiAgICAgIHN0cmluZ2lmeUVudGl0aWVzKFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUuc2V0dGluZ3MuY2hhcmFjdGVyUmVmZXJlbmNlcywge1xuICAgICAgICAgIC8vIEFsd2F5cyBlbmNvZGUgd2l0aG91dCBwYXJzZSBlcnJvcnMgaW4gbm9uLUhUTUwuXG4gICAgICAgICAgc3Vic2V0OiAocXVvdGUgPT09IFwiJ1wiID8gY29uc3RhbnRzLnNpbmdsZSA6IGNvbnN0YW50cy5kb3VibGUpW3hdW3ldLFxuICAgICAgICAgIGF0dHJpYnV0ZTogdHJ1ZVxuICAgICAgICB9KVxuICAgICAgKSArXG4gICAgICBxdW90ZVxuICB9XG5cbiAgLy8gRG9u4oCZdCBhZGQgYSBgPWAgZm9yIHVucXVvdGVkIGVtcHRpZXMuXG4gIHJldHVybiBuYW1lICsgKHJlc3VsdCA/ICc9JyArIHJlc3VsdCA6IHJlc3VsdClcbn1cbiIsCiAgICAiLyoqXG4gKiBAaW1wb3J0IHtQYXJlbnRzLCBUZXh0fSBmcm9tICdoYXN0J1xuICogQGltcG9ydCB7UmF3fSBmcm9tICdtZGFzdC11dGlsLXRvLWhhc3QnXG4gKiBAaW1wb3J0IHtTdGF0ZX0gZnJvbSAnLi4vaW5kZXguanMnXG4gKi9cblxuaW1wb3J0IHtzdHJpbmdpZnlFbnRpdGllc30gZnJvbSAnc3RyaW5naWZ5LWVudGl0aWVzJ1xuXG4vLyBEZWNsYXJlIGFycmF5IGFzIHZhcmlhYmxlIHNvIGl0IGNhbiBiZSBjYWNoZWQgYnkgYHN0cmluZ2lmeUVudGl0aWVzYFxuY29uc3QgdGV4dEVudGl0eVN1YnNldCA9IFsnPCcsICcmJ11cblxuLyoqXG4gKiBTZXJpYWxpemUgYSB0ZXh0IG5vZGUuXG4gKlxuICogQHBhcmFtIHtSYXcgfCBUZXh0fSBub2RlXG4gKiAgIE5vZGUgdG8gaGFuZGxlLlxuICogQHBhcmFtIHtudW1iZXIgfCB1bmRlZmluZWR9IF9cbiAqICAgSW5kZXggb2YgYG5vZGVgIGluIGBwYXJlbnQuXG4gKiBAcGFyYW0ge1BhcmVudHMgfCB1bmRlZmluZWR9IHBhcmVudFxuICogICBQYXJlbnQgb2YgYG5vZGVgLlxuICogQHBhcmFtIHtTdGF0ZX0gc3RhdGVcbiAqICAgSW5mbyBwYXNzZWQgYXJvdW5kIGFib3V0IHRoZSBjdXJyZW50IHN0YXRlLlxuICogQHJldHVybnMge3N0cmluZ31cbiAqICAgU2VyaWFsaXplZCBub2RlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdGV4dChub2RlLCBfLCBwYXJlbnQsIHN0YXRlKSB7XG4gIC8vIENoZWNrIGlmIGNvbnRlbnQgb2YgYG5vZGVgIHNob3VsZCBiZSBlc2NhcGVkLlxuICByZXR1cm4gcGFyZW50ICYmXG4gICAgcGFyZW50LnR5cGUgPT09ICdlbGVtZW50JyAmJlxuICAgIChwYXJlbnQudGFnTmFtZSA9PT0gJ3NjcmlwdCcgfHwgcGFyZW50LnRhZ05hbWUgPT09ICdzdHlsZScpXG4gICAgPyBub2RlLnZhbHVlXG4gICAgOiBzdHJpbmdpZnlFbnRpdGllcyhcbiAgICAgICAgbm9kZS52YWx1ZSxcbiAgICAgICAgT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUuc2V0dGluZ3MuY2hhcmFjdGVyUmVmZXJlbmNlcywge1xuICAgICAgICAgIHN1YnNldDogdGV4dEVudGl0eVN1YnNldFxuICAgICAgICB9KVxuICAgICAgKVxufVxuIiwKICAgICIvKipcbiAqIEBpbXBvcnQge1BhcmVudHN9IGZyb20gJ2hhc3QnXG4gKiBAaW1wb3J0IHtSYXd9IGZyb20gJ21kYXN0LXV0aWwtdG8taGFzdCdcbiAqIEBpbXBvcnQge1N0YXRlfSBmcm9tICcuLi9pbmRleC5qcydcbiAqL1xuXG5pbXBvcnQge3RleHR9IGZyb20gJy4vdGV4dC5qcydcblxuLyoqXG4gKiBTZXJpYWxpemUgYSByYXcgbm9kZS5cbiAqXG4gKiBAcGFyYW0ge1Jhd30gbm9kZVxuICogICBOb2RlIHRvIGhhbmRsZS5cbiAqIEBwYXJhbSB7bnVtYmVyIHwgdW5kZWZpbmVkfSBpbmRleFxuICogICBJbmRleCBvZiBgbm9kZWAgaW4gYHBhcmVudC5cbiAqIEBwYXJhbSB7UGFyZW50cyB8IHVuZGVmaW5lZH0gcGFyZW50XG4gKiAgIFBhcmVudCBvZiBgbm9kZWAuXG4gKiBAcGFyYW0ge1N0YXRlfSBzdGF0ZVxuICogICBJbmZvIHBhc3NlZCBhcm91bmQgYWJvdXQgdGhlIGN1cnJlbnQgc3RhdGUuXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICogICBTZXJpYWxpemVkIG5vZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByYXcobm9kZSwgaW5kZXgsIHBhcmVudCwgc3RhdGUpIHtcbiAgcmV0dXJuIHN0YXRlLnNldHRpbmdzLmFsbG93RGFuZ2Vyb3VzSHRtbFxuICAgID8gbm9kZS52YWx1ZVxuICAgIDogdGV4dChub2RlLCBpbmRleCwgcGFyZW50LCBzdGF0ZSlcbn1cbiIsCiAgICAiLyoqXG4gKiBAaW1wb3J0IHtQYXJlbnRzLCBSb290fSBmcm9tICdoYXN0J1xuICogQGltcG9ydCB7U3RhdGV9IGZyb20gJy4uL2luZGV4LmpzJ1xuICovXG5cbi8qKlxuICogU2VyaWFsaXplIGEgcm9vdC5cbiAqXG4gKiBAcGFyYW0ge1Jvb3R9IG5vZGVcbiAqICAgTm9kZSB0byBoYW5kbGUuXG4gKiBAcGFyYW0ge251bWJlciB8IHVuZGVmaW5lZH0gXzFcbiAqICAgSW5kZXggb2YgYG5vZGVgIGluIGBwYXJlbnQuXG4gKiBAcGFyYW0ge1BhcmVudHMgfCB1bmRlZmluZWR9IF8yXG4gKiAgIFBhcmVudCBvZiBgbm9kZWAuXG4gKiBAcGFyYW0ge1N0YXRlfSBzdGF0ZVxuICogICBJbmZvIHBhc3NlZCBhcm91bmQgYWJvdXQgdGhlIGN1cnJlbnQgc3RhdGUuXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICogICBTZXJpYWxpemVkIG5vZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb290KG5vZGUsIF8xLCBfMiwgc3RhdGUpIHtcbiAgcmV0dXJuIHN0YXRlLmFsbChub2RlKVxufVxuIiwKICAgICIvKipcbiAqIEBpbXBvcnQge05vZGVzLCBQYXJlbnRzfSBmcm9tICdoYXN0J1xuICogQGltcG9ydCB7U3RhdGV9IGZyb20gJy4uL2luZGV4LmpzJ1xuICovXG5cbmltcG9ydCB7endpdGNofSBmcm9tICd6d2l0Y2gnXG5pbXBvcnQge2NvbW1lbnR9IGZyb20gJy4vY29tbWVudC5qcydcbmltcG9ydCB7ZG9jdHlwZX0gZnJvbSAnLi9kb2N0eXBlLmpzJ1xuaW1wb3J0IHtlbGVtZW50fSBmcm9tICcuL2VsZW1lbnQuanMnXG5pbXBvcnQge3Jhd30gZnJvbSAnLi9yYXcuanMnXG5pbXBvcnQge3Jvb3R9IGZyb20gJy4vcm9vdC5qcydcbmltcG9ydCB7dGV4dH0gZnJvbSAnLi90ZXh0LmpzJ1xuXG4vKipcbiAqIEB0eXBlIHsobm9kZTogTm9kZXMsIGluZGV4OiBudW1iZXIgfCB1bmRlZmluZWQsIHBhcmVudDogUGFyZW50cyB8IHVuZGVmaW5lZCwgc3RhdGU6IFN0YXRlKSA9PiBzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBoYW5kbGUgPSB6d2l0Y2goJ3R5cGUnLCB7XG4gIGludmFsaWQsXG4gIHVua25vd24sXG4gIGhhbmRsZXJzOiB7Y29tbWVudCwgZG9jdHlwZSwgZWxlbWVudCwgcmF3LCByb290LCB0ZXh0fVxufSlcblxuLyoqXG4gKiBGYWlsIHdoZW4gYSBub24tbm9kZSBpcyBmb3VuZCBpbiB0aGUgdHJlZS5cbiAqXG4gKiBAcGFyYW0ge3Vua25vd259IG5vZGVcbiAqICAgVW5rbm93biB2YWx1ZS5cbiAqIEByZXR1cm5zIHtuZXZlcn1cbiAqICAgTmV2ZXIuXG4gKi9cbmZ1bmN0aW9uIGludmFsaWQobm9kZSkge1xuICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIG5vZGUsIG5vdCBgJyArIG5vZGUgKyAnYCcpXG59XG5cbi8qKlxuICogRmFpbCB3aGVuIGEgbm9kZSB3aXRoIGFuIHVua25vd24gdHlwZSBpcyBmb3VuZCBpbiB0aGUgdHJlZS5cbiAqXG4gKiBAcGFyYW0ge3Vua25vd259IG5vZGVfXG4gKiAgVW5rbm93biBub2RlLlxuICogQHJldHVybnMge25ldmVyfVxuICogICBOZXZlci5cbiAqL1xuZnVuY3Rpb24gdW5rbm93bihub2RlXykge1xuICAvLyBgdHlwZWAgaXMgZ3VhcmFudGVlZCBieSBydW50aW1lIEpTLlxuICBjb25zdCBub2RlID0gLyoqIEB0eXBlIHtOb2Rlc30gKi8gKG5vZGVfKVxuICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBjb21waWxlIHVua25vd24gbm9kZSBgJyArIG5vZGUudHlwZSArICdgJylcbn1cbiIsCiAgICAiLyoqXG4gKiBAaW1wb3J0IHtOb2RlcywgUGFyZW50cywgUm9vdENvbnRlbnR9IGZyb20gJ2hhc3QnXG4gKiBAaW1wb3J0IHtTY2hlbWF9IGZyb20gJ3Byb3BlcnR5LWluZm9ybWF0aW9uJ1xuICogQGltcG9ydCB7T3B0aW9ucyBhcyBTdHJpbmdpZnlFbnRpdGllc09wdGlvbnN9IGZyb20gJ3N0cmluZ2lmeS1lbnRpdGllcydcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPbWl0PFN0cmluZ2lmeUVudGl0aWVzT3B0aW9ucywgJ2F0dHJpYnV0ZScgfCAnZXNjYXBlT25seScgfCAnc3Vic2V0Jz59IENoYXJhY3RlclJlZmVyZW5jZXNcbiAqXG4gKiBAdHlwZWRlZiBPcHRpb25zXG4gKiAgIENvbmZpZ3VyYXRpb24uXG4gKiBAcHJvcGVydHkge2Jvb2xlYW4gfCBudWxsIHwgdW5kZWZpbmVkfSBbYWxsb3dEYW5nZXJvdXNDaGFyYWN0ZXJzPWZhbHNlXVxuICogICBEbyBub3QgZW5jb2RlIHNvbWUgY2hhcmFjdGVycyB3aGljaCBjYXVzZSBYU1MgdnVsbmVyYWJpbGl0aWVzIGluIG9sZGVyXG4gKiAgIGJyb3dzZXJzIChkZWZhdWx0OiBgZmFsc2VgKS5cbiAqXG4gKiAgID4g4pqg77iPICoqRGFuZ2VyKio6IG9ubHkgc2V0IHRoaXMgaWYgeW91IGNvbXBsZXRlbHkgdHJ1c3QgdGhlIGNvbnRlbnQuXG4gKiBAcHJvcGVydHkge2Jvb2xlYW4gfCBudWxsIHwgdW5kZWZpbmVkfSBbYWxsb3dEYW5nZXJvdXNIdG1sPWZhbHNlXVxuICogICBBbGxvdyBgcmF3YCBub2RlcyBhbmQgaW5zZXJ0IHRoZW0gYXMgcmF3IEhUTUwgKGRlZmF1bHQ6IGBmYWxzZWApLlxuICpcbiAqICAgV2hlbiBgZmFsc2VgLCBgUmF3YCBub2RlcyBhcmUgZW5jb2RlZC5cbiAqXG4gKiAgID4g4pqg77iPICoqRGFuZ2VyKio6IG9ubHkgc2V0IHRoaXMgaWYgeW91IGNvbXBsZXRlbHkgdHJ1c3QgdGhlIGNvbnRlbnQuXG4gKiBAcHJvcGVydHkge2Jvb2xlYW4gfCBudWxsIHwgdW5kZWZpbmVkfSBbYWxsb3dQYXJzZUVycm9ycz1mYWxzZV1cbiAqICAgRG8gbm90IGVuY29kZSBjaGFyYWN0ZXJzIHdoaWNoIGNhdXNlIHBhcnNlIGVycm9ycyAoZXZlbiB0aG91Z2ggdGhleSB3b3JrKSxcbiAqICAgdG8gc2F2ZSBieXRlcyAoZGVmYXVsdDogYGZhbHNlYCkuXG4gKlxuICogICBOb3QgdXNlZCBpbiB0aGUgU1ZHIHNwYWNlLlxuICpcbiAqICAgPiDwn5GJICoqTm90ZSoqOiBpbnRlbnRpb25hbGx5IGNyZWF0ZXMgcGFyc2UgZXJyb3JzIGluIG1hcmt1cCAoaG93IHBhcnNlXG4gKiAgID4gZXJyb3JzIGFyZSBoYW5kbGVkIGlzIHdlbGwgZGVmaW5lZCwgc28gdGhpcyB3b3JrcyBidXQgaXNu4oCZdCBwcmV0dHkpLlxuICogQHByb3BlcnR5IHtib29sZWFuIHwgbnVsbCB8IHVuZGVmaW5lZH0gW2JvZ3VzQ29tbWVudHM9ZmFsc2VdXG4gKiAgIFVzZSDigJxib2d1cyBjb21tZW50c+KAnSBpbnN0ZWFkIG9mIGNvbW1lbnRzIHRvIHNhdmUgYnllczogYDw/Y2hhcmxpZT5gXG4gKiAgIGluc3RlYWQgb2YgYDwhLS1jaGFybGllLS0+YCAoZGVmYXVsdDogYGZhbHNlYCkuXG4gKlxuICogICA+IPCfkYkgKipOb3RlKio6IGludGVudGlvbmFsbHkgY3JlYXRlcyBwYXJzZSBlcnJvcnMgaW4gbWFya3VwIChob3cgcGFyc2VcbiAqICAgPiBlcnJvcnMgYXJlIGhhbmRsZWQgaXMgd2VsbCBkZWZpbmVkLCBzbyB0aGlzIHdvcmtzIGJ1dCBpc27igJl0IHByZXR0eSkuXG4gKiBAcHJvcGVydHkge0NoYXJhY3RlclJlZmVyZW5jZXMgfCBudWxsIHwgdW5kZWZpbmVkfSBbY2hhcmFjdGVyUmVmZXJlbmNlc11cbiAqICAgQ29uZmlndXJlIGhvdyB0byBzZXJpYWxpemUgY2hhcmFjdGVyIHJlZmVyZW5jZXMgKG9wdGlvbmFsKS5cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbiB8IG51bGwgfCB1bmRlZmluZWR9IFtjbG9zZUVtcHR5RWxlbWVudHM9ZmFsc2VdXG4gKiAgIENsb3NlIFNWRyBlbGVtZW50cyB3aXRob3V0IGFueSBjb250ZW50IHdpdGggc2xhc2ggKGAvYCkgb24gdGhlIG9wZW5pbmcgdGFnXG4gKiAgIGluc3RlYWQgb2YgYW4gZW5kIHRhZzogYDxjaXJjbGUgLz5gIGluc3RlYWQgb2YgYDxjaXJjbGU+PC9jaXJjbGU+YFxuICogICAoZGVmYXVsdDogYGZhbHNlYCkuXG4gKlxuICogICBTZWUgYHRpZ2h0U2VsZkNsb3NpbmdgIHRvIGNvbnRyb2wgd2hldGhlciBhIHNwYWNlIGlzIHVzZWQgYmVmb3JlIHRoZVxuICogICBzbGFzaC5cbiAqXG4gKiAgIE5vdCB1c2VkIGluIHRoZSBIVE1MIHNwYWNlLlxuICogQHByb3BlcnR5IHtib29sZWFuIHwgbnVsbCB8IHVuZGVmaW5lZH0gW2Nsb3NlU2VsZkNsb3Npbmc9ZmFsc2VdXG4gKiAgIENsb3NlIHNlbGYtY2xvc2luZyBub2RlcyB3aXRoIGFuIGV4dHJhIHNsYXNoIChgL2ApOiBgPGltZyAvPmAgaW5zdGVhZCBvZlxuICogICBgPGltZz5gIChkZWZhdWx0OiBgZmFsc2VgKS5cbiAqXG4gKiAgIFNlZSBgdGlnaHRTZWxmQ2xvc2luZ2AgdG8gY29udHJvbCB3aGV0aGVyIGEgc3BhY2UgaXMgdXNlZCBiZWZvcmUgdGhlXG4gKiAgIHNsYXNoLlxuICpcbiAqICAgTm90IHVzZWQgaW4gdGhlIFNWRyBzcGFjZS5cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbiB8IG51bGwgfCB1bmRlZmluZWR9IFtjb2xsYXBzZUVtcHR5QXR0cmlidXRlcz1mYWxzZV1cbiAqICAgQ29sbGFwc2UgZW1wdHkgYXR0cmlidXRlczogZ2V0IGBjbGFzc2AgaW5zdGVhZCBvZiBgY2xhc3M9XCJcImAgKGRlZmF1bHQ6XG4gKiAgIGBmYWxzZWApLlxuICpcbiAqICAgTm90IHVzZWQgaW4gdGhlIFNWRyBzcGFjZS5cbiAqXG4gKiAgID4g8J+RiSAqKk5vdGUqKjogYm9vbGVhbiBhdHRyaWJ1dGVzIChzdWNoIGFzIGBoaWRkZW5gKSBhcmUgYWx3YXlzIGNvbGxhcHNlZC5cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbiB8IG51bGwgfCB1bmRlZmluZWR9IFtvbWl0T3B0aW9uYWxUYWdzPWZhbHNlXVxuICogICBPbWl0IG9wdGlvbmFsIG9wZW5pbmcgYW5kIGNsb3NpbmcgdGFncyAoZGVmYXVsdDogYGZhbHNlYCkuXG4gKlxuICogICBGb3IgZXhhbXBsZSwgaW4gYDxvbD48bGk+b25lPC9saT48bGk+dHdvPC9saT48L29sPmAsIGJvdGggYDwvbGk+YCBjbG9zaW5nXG4gKiAgIHRhZ3MgY2FuIGJlIG9taXR0ZWQuXG4gKiAgIFRoZSBmaXJzdCBiZWNhdXNlIGl04oCZcyBmb2xsb3dlZCBieSBhbm90aGVyIGBsaWAsIHRoZSBsYXN0IGJlY2F1c2UgaXTigJlzXG4gKiAgIGZvbGxvd2VkIGJ5IG5vdGhpbmcuXG4gKlxuICogICBOb3QgdXNlZCBpbiB0aGUgU1ZHIHNwYWNlLlxuICogQHByb3BlcnR5IHtib29sZWFuIHwgbnVsbCB8IHVuZGVmaW5lZH0gW3ByZWZlclVucXVvdGVkPWZhbHNlXVxuICogICBMZWF2ZSBhdHRyaWJ1dGVzIHVucXVvdGVkIGlmIHRoYXQgcmVzdWx0cyBpbiBsZXNzIGJ5dGVzIChkZWZhdWx0OiBgZmFsc2VgKS5cbiAqXG4gKiAgIE5vdCB1c2VkIGluIHRoZSBTVkcgc3BhY2UuXG4gKiBAcHJvcGVydHkge2Jvb2xlYW4gfCBudWxsIHwgdW5kZWZpbmVkfSBbcXVvdGVTbWFydD1mYWxzZV1cbiAqICAgVXNlIHRoZSBvdGhlciBxdW90ZSBpZiB0aGF0IHJlc3VsdHMgaW4gbGVzcyBieXRlcyAoZGVmYXVsdDogYGZhbHNlYCkuXG4gKiBAcHJvcGVydHkge1F1b3RlIHwgbnVsbCB8IHVuZGVmaW5lZH0gW3F1b3RlPSdcIiddXG4gKiAgIFByZWZlcnJlZCBxdW90ZSB0byB1c2UgKGRlZmF1bHQ6IGAnXCInYCkuXG4gKiBAcHJvcGVydHkge1NwYWNlIHwgbnVsbCB8IHVuZGVmaW5lZH0gW3NwYWNlPSdodG1sJ11cbiAqICAgV2hlbiBhbiBgPHN2Zz5gIGVsZW1lbnQgaXMgZm91bmQgaW4gdGhlIEhUTUwgc3BhY2UsIHRoaXMgcGFja2FnZSBhbHJlYWR5XG4gKiAgIGF1dG9tYXRpY2FsbHkgc3dpdGNoZXMgdG8gYW5kIGZyb20gdGhlIFNWRyBzcGFjZSB3aGVuIGVudGVyaW5nIGFuZCBleGl0aW5nXG4gKiAgIGl0IChkZWZhdWx0OiBgJ2h0bWwnYCkuXG4gKlxuICogICA+IPCfkYkgKipOb3RlKio6IGhhc3QgaXMgbm90IFhNTC5cbiAqICAgPiBJdCBzdXBwb3J0cyBTVkcgYXMgZW1iZWRkZWQgaW4gSFRNTC5cbiAqICAgPiBJdCBkb2VzIG5vdCBzdXBwb3J0IHRoZSBmZWF0dXJlcyBhdmFpbGFibGUgaW4gWE1MLlxuICogICA+IFBhc3NpbmcgU1ZHIG1pZ2h0IGJyZWFrIGJ1dCBmcmFnbWVudHMgb2YgbW9kZXJuIFNWRyBzaG91bGQgYmUgZmluZS5cbiAqICAgPiBVc2UgW2B4YXN0YF1beGFzdF0gaWYgeW91IG5lZWQgdG8gc3VwcG9ydCBTVkcgYXMgWE1MLlxuICogQHByb3BlcnR5IHtib29sZWFuIHwgbnVsbCB8IHVuZGVmaW5lZH0gW3RpZ2h0QXR0cmlidXRlcz1mYWxzZV1cbiAqICAgSm9pbiBhdHRyaWJ1dGVzIHRvZ2V0aGVyLCB3aXRob3V0IHdoaXRlc3BhY2UsIGlmIHBvc3NpYmxlOiBnZXRcbiAqICAgYGNsYXNzPVwiYSBiXCJ0aXRsZT1cImMgZFwiYCBpbnN0ZWFkIG9mIGBjbGFzcz1cImEgYlwiIHRpdGxlPVwiYyBkXCJgIHRvIHNhdmVcbiAqICAgYnl0ZXMgKGRlZmF1bHQ6IGBmYWxzZWApLlxuICpcbiAqICAgTm90IHVzZWQgaW4gdGhlIFNWRyBzcGFjZS5cbiAqXG4gKiAgID4g8J+RiSAqKk5vdGUqKjogaW50ZW50aW9uYWxseSBjcmVhdGVzIHBhcnNlIGVycm9ycyBpbiBtYXJrdXAgKGhvdyBwYXJzZVxuICogICA+IGVycm9ycyBhcmUgaGFuZGxlZCBpcyB3ZWxsIGRlZmluZWQsIHNvIHRoaXMgd29ya3MgYnV0IGlzbuKAmXQgcHJldHR5KS5cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbiB8IG51bGwgfCB1bmRlZmluZWR9IFt0aWdodENvbW1hU2VwYXJhdGVkTGlzdHM9ZmFsc2VdXG4gKiAgIEpvaW4ga25vd24gY29tbWEtc2VwYXJhdGVkIGF0dHJpYnV0ZSB2YWx1ZXMgd2l0aCBqdXN0IGEgY29tbWEgKGAsYCksXG4gKiAgIGluc3RlYWQgb2YgcGFkZGluZyB0aGVtIG9uIHRoZSByaWdodCBhcyB3ZWxsIChgLOKQoGAsIHdoZXJlIGDikKBgIHJlcHJlc2VudHMgYVxuICogICBzcGFjZSkgKGRlZmF1bHQ6IGBmYWxzZWApLlxuICogQHByb3BlcnR5IHtib29sZWFuIHwgbnVsbCB8IHVuZGVmaW5lZH0gW3RpZ2h0RG9jdHlwZT1mYWxzZV1cbiAqICAgRHJvcCB1bm5lZWRlZCBzcGFjZXMgaW4gZG9jdHlwZXM6IGA8IWRvY3R5cGVodG1sPmAgaW5zdGVhZCBvZlxuICogICBgPCFkb2N0eXBlIGh0bWw+YCB0byBzYXZlIGJ5dGVzIChkZWZhdWx0OiBgZmFsc2VgKS5cbiAqXG4gKiAgID4g8J+RiSAqKk5vdGUqKjogaW50ZW50aW9uYWxseSBjcmVhdGVzIHBhcnNlIGVycm9ycyBpbiBtYXJrdXAgKGhvdyBwYXJzZVxuICogICA+IGVycm9ycyBhcmUgaGFuZGxlZCBpcyB3ZWxsIGRlZmluZWQsIHNvIHRoaXMgd29ya3MgYnV0IGlzbuKAmXQgcHJldHR5KS5cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbiB8IG51bGwgfCB1bmRlZmluZWR9IFt0aWdodFNlbGZDbG9zaW5nPWZhbHNlXVxuICogICBEbyBub3QgdXNlIGFuIGV4dHJhIHNwYWNlIHdoZW4gY2xvc2luZyBzZWxmLWNsb3NpbmcgZWxlbWVudHM6IGA8aW1nLz5gXG4gKiAgIGluc3RlYWQgb2YgYDxpbWcgLz5gIChkZWZhdWx0OiBgZmFsc2VgKS5cbiAqXG4gKiAgID4g8J+RiSAqKk5vdGUqKjogb25seSB1c2VkIGlmIGBjbG9zZVNlbGZDbG9zaW5nOiB0cnVlYCBvclxuICogICA+IGBjbG9zZUVtcHR5RWxlbWVudHM6IHRydWVgLlxuICogQHByb3BlcnR5IHtib29sZWFuIHwgbnVsbCB8IHVuZGVmaW5lZH0gW3VwcGVyRG9jdHlwZT1mYWxzZV1cbiAqICAgVXNlIGEgYDwhRE9DVFlQReKApmAgaW5zdGVhZCBvZiBgPCFkb2N0eXBl4oCmYCAoZGVmYXVsdDogYGZhbHNlYCkuXG4gKlxuICogICBVc2VsZXNzIGV4Y2VwdCBmb3IgWEhUTUwuXG4gKiBAcHJvcGVydHkge1JlYWRvbmx5QXJyYXk8c3RyaW5nPiB8IG51bGwgfCB1bmRlZmluZWR9IFt2b2lkc11cbiAqICAgVGFnIG5hbWVzIG9mIGVsZW1lbnRzIHRvIHNlcmlhbGl6ZSB3aXRob3V0IGNsb3NpbmcgdGFnIChkZWZhdWx0OiBgaHRtbC12b2lkLWVsZW1lbnRzYCkuXG4gKlxuICogICBOb3QgdXNlZCBpbiB0aGUgU1ZHIHNwYWNlLlxuICpcbiAqICAgPiDwn5GJICoqTm90ZSoqOiBJdOKAmXMgaGlnaGx5IHVubGlrZWx5IHRoYXQgeW91IHdhbnQgdG8gcGFzcyB0aGlzLCBiZWNhdXNlXG4gKiAgID4gaGFzdCBpcyBub3QgZm9yIFhNTCwgYW5kIEhUTUwgd2lsbCBub3QgYWRkIG1vcmUgdm9pZCBlbGVtZW50cy5cbiAqXG4gKiBAdHlwZWRlZiB7J1wiJyB8IFwiJ1wifSBRdW90ZVxuICogICBIVE1MIHF1b3RlcyBmb3IgYXR0cmlidXRlIHZhbHVlcy5cbiAqXG4gKiBAdHlwZWRlZiB7T21pdDxSZXF1aXJlZDx7W2tleSBpbiBrZXlvZiBPcHRpb25zXTogRXhjbHVkZTxPcHRpb25zW2tleV0sIG51bGwgfCB1bmRlZmluZWQ+fT4sICdzcGFjZScgfCAncXVvdGUnPn0gU2V0dGluZ3NcbiAqXG4gKiBAdHlwZWRlZiB7J2h0bWwnIHwgJ3N2Zyd9IFNwYWNlXG4gKiAgIE5hbWVzcGFjZS5cbiAqXG4gKiBAdHlwZWRlZiBTdGF0ZVxuICogICBJbmZvIHBhc3NlZCBhcm91bmQgYWJvdXQgdGhlIGN1cnJlbnQgc3RhdGUuXG4gKiBAcHJvcGVydHkgeyhub2RlOiBQYXJlbnRzIHwgdW5kZWZpbmVkKSA9PiBzdHJpbmd9IGFsbFxuICogICBTZXJpYWxpemUgdGhlIGNoaWxkcmVuIG9mIGEgcGFyZW50IG5vZGUuXG4gKiBAcHJvcGVydHkge1F1b3RlfSBhbHRlcm5hdGl2ZVxuICogICBBbHRlcm5hdGl2ZSBxdW90ZS5cbiAqIEBwcm9wZXJ0eSB7KG5vZGU6IE5vZGVzLCBpbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkLCBwYXJlbnQ6IFBhcmVudHMgfCB1bmRlZmluZWQpID0+IHN0cmluZ30gb25lXG4gKiAgIFNlcmlhbGl6ZSBvbmUgbm9kZS5cbiAqIEBwcm9wZXJ0eSB7UXVvdGV9IHF1b3RlXG4gKiAgIFByZWZlcnJlZCBxdW90ZS5cbiAqIEBwcm9wZXJ0eSB7U2NoZW1hfSBzY2hlbWFcbiAqICAgQ3VycmVudCBzY2hlbWEuXG4gKiBAcHJvcGVydHkge1NldHRpbmdzfSBzZXR0aW5nc1xuICogICBVc2VyIGNvbmZpZ3VyYXRpb24uXG4gKi9cblxuaW1wb3J0IHtodG1sVm9pZEVsZW1lbnRzfSBmcm9tICdodG1sLXZvaWQtZWxlbWVudHMnXG5pbXBvcnQge2h0bWwsIHN2Z30gZnJvbSAncHJvcGVydHktaW5mb3JtYXRpb24nXG5pbXBvcnQge2hhbmRsZX0gZnJvbSAnLi9oYW5kbGUvaW5kZXguanMnXG5cbi8qKiBAdHlwZSB7T3B0aW9uc30gKi9cbmNvbnN0IGVtcHR5T3B0aW9ucyA9IHt9XG5cbi8qKiBAdHlwZSB7Q2hhcmFjdGVyUmVmZXJlbmNlc30gKi9cbmNvbnN0IGVtcHR5Q2hhcmFjdGVyUmVmZXJlbmNlcyA9IHt9XG5cbi8qKiBAdHlwZSB7QXJyYXk8bmV2ZXI+fSAqL1xuY29uc3QgZW1wdHlDaGlsZHJlbiA9IFtdXG5cbi8qKlxuICogU2VyaWFsaXplIGhhc3QgYXMgSFRNTC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5PFJvb3RDb250ZW50PiB8IE5vZGVzfSB0cmVlXG4gKiAgIFRyZWUgdG8gc2VyaWFsaXplLlxuICogQHBhcmFtIHtPcHRpb25zIHwgbnVsbCB8IHVuZGVmaW5lZH0gW29wdGlvbnNdXG4gKiAgIENvbmZpZ3VyYXRpb24gKG9wdGlvbmFsKS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKiAgIFNlcmlhbGl6ZWQgSFRNTC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvSHRtbCh0cmVlLCBvcHRpb25zKSB7XG4gIGNvbnN0IG9wdGlvbnNfID0gb3B0aW9ucyB8fCBlbXB0eU9wdGlvbnNcbiAgY29uc3QgcXVvdGUgPSBvcHRpb25zXy5xdW90ZSB8fCAnXCInXG4gIGNvbnN0IGFsdGVybmF0aXZlID0gcXVvdGUgPT09ICdcIicgPyBcIidcIiA6ICdcIidcblxuICBpZiAocXVvdGUgIT09ICdcIicgJiYgcXVvdGUgIT09IFwiJ1wiKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHF1b3RlIGAnICsgcXVvdGUgKyAnYCwgZXhwZWN0ZWQgYFxcJ2Agb3IgYFwiYCcpXG4gIH1cblxuICAvKiogQHR5cGUge1N0YXRlfSAqL1xuICBjb25zdCBzdGF0ZSA9IHtcbiAgICBvbmUsXG4gICAgYWxsLFxuICAgIHNldHRpbmdzOiB7XG4gICAgICBvbWl0T3B0aW9uYWxUYWdzOiBvcHRpb25zXy5vbWl0T3B0aW9uYWxUYWdzIHx8IGZhbHNlLFxuICAgICAgYWxsb3dQYXJzZUVycm9yczogb3B0aW9uc18uYWxsb3dQYXJzZUVycm9ycyB8fCBmYWxzZSxcbiAgICAgIGFsbG93RGFuZ2Vyb3VzQ2hhcmFjdGVyczogb3B0aW9uc18uYWxsb3dEYW5nZXJvdXNDaGFyYWN0ZXJzIHx8IGZhbHNlLFxuICAgICAgcXVvdGVTbWFydDogb3B0aW9uc18ucXVvdGVTbWFydCB8fCBmYWxzZSxcbiAgICAgIHByZWZlclVucXVvdGVkOiBvcHRpb25zXy5wcmVmZXJVbnF1b3RlZCB8fCBmYWxzZSxcbiAgICAgIHRpZ2h0QXR0cmlidXRlczogb3B0aW9uc18udGlnaHRBdHRyaWJ1dGVzIHx8IGZhbHNlLFxuICAgICAgdXBwZXJEb2N0eXBlOiBvcHRpb25zXy51cHBlckRvY3R5cGUgfHwgZmFsc2UsXG4gICAgICB0aWdodERvY3R5cGU6IG9wdGlvbnNfLnRpZ2h0RG9jdHlwZSB8fCBmYWxzZSxcbiAgICAgIGJvZ3VzQ29tbWVudHM6IG9wdGlvbnNfLmJvZ3VzQ29tbWVudHMgfHwgZmFsc2UsXG4gICAgICB0aWdodENvbW1hU2VwYXJhdGVkTGlzdHM6IG9wdGlvbnNfLnRpZ2h0Q29tbWFTZXBhcmF0ZWRMaXN0cyB8fCBmYWxzZSxcbiAgICAgIHRpZ2h0U2VsZkNsb3Npbmc6IG9wdGlvbnNfLnRpZ2h0U2VsZkNsb3NpbmcgfHwgZmFsc2UsXG4gICAgICBjb2xsYXBzZUVtcHR5QXR0cmlidXRlczogb3B0aW9uc18uY29sbGFwc2VFbXB0eUF0dHJpYnV0ZXMgfHwgZmFsc2UsXG4gICAgICBhbGxvd0Rhbmdlcm91c0h0bWw6IG9wdGlvbnNfLmFsbG93RGFuZ2Vyb3VzSHRtbCB8fCBmYWxzZSxcbiAgICAgIHZvaWRzOiBvcHRpb25zXy52b2lkcyB8fCBodG1sVm9pZEVsZW1lbnRzLFxuICAgICAgY2hhcmFjdGVyUmVmZXJlbmNlczpcbiAgICAgICAgb3B0aW9uc18uY2hhcmFjdGVyUmVmZXJlbmNlcyB8fCBlbXB0eUNoYXJhY3RlclJlZmVyZW5jZXMsXG4gICAgICBjbG9zZVNlbGZDbG9zaW5nOiBvcHRpb25zXy5jbG9zZVNlbGZDbG9zaW5nIHx8IGZhbHNlLFxuICAgICAgY2xvc2VFbXB0eUVsZW1lbnRzOiBvcHRpb25zXy5jbG9zZUVtcHR5RWxlbWVudHMgfHwgZmFsc2VcbiAgICB9LFxuICAgIHNjaGVtYTogb3B0aW9uc18uc3BhY2UgPT09ICdzdmcnID8gc3ZnIDogaHRtbCxcbiAgICBxdW90ZSxcbiAgICBhbHRlcm5hdGl2ZVxuICB9XG5cbiAgcmV0dXJuIHN0YXRlLm9uZShcbiAgICBBcnJheS5pc0FycmF5KHRyZWUpID8ge3R5cGU6ICdyb290JywgY2hpbGRyZW46IHRyZWV9IDogdHJlZSxcbiAgICB1bmRlZmluZWQsXG4gICAgdW5kZWZpbmVkXG4gIClcbn1cblxuLyoqXG4gKiBTZXJpYWxpemUgYSBub2RlLlxuICpcbiAqIEB0aGlzIHtTdGF0ZX1cbiAqICAgSW5mbyBwYXNzZWQgYXJvdW5kIGFib3V0IHRoZSBjdXJyZW50IHN0YXRlLlxuICogQHBhcmFtIHtOb2Rlc30gbm9kZVxuICogICBOb2RlIHRvIGhhbmRsZS5cbiAqIEBwYXJhbSB7bnVtYmVyIHwgdW5kZWZpbmVkfSBpbmRleFxuICogICBJbmRleCBvZiBgbm9kZWAgaW4gYHBhcmVudC5cbiAqIEBwYXJhbSB7UGFyZW50cyB8IHVuZGVmaW5lZH0gcGFyZW50XG4gKiAgIFBhcmVudCBvZiBgbm9kZWAuXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICogICBTZXJpYWxpemVkIG5vZGUuXG4gKi9cbmZ1bmN0aW9uIG9uZShub2RlLCBpbmRleCwgcGFyZW50KSB7XG4gIHJldHVybiBoYW5kbGUobm9kZSwgaW5kZXgsIHBhcmVudCwgdGhpcylcbn1cblxuLyoqXG4gKiBTZXJpYWxpemUgYWxsIGNoaWxkcmVuIG9mIGBwYXJlbnRgLlxuICpcbiAqIEB0aGlzIHtTdGF0ZX1cbiAqICAgSW5mbyBwYXNzZWQgYXJvdW5kIGFib3V0IHRoZSBjdXJyZW50IHN0YXRlLlxuICogQHBhcmFtIHtQYXJlbnRzIHwgdW5kZWZpbmVkfSBwYXJlbnRcbiAqICAgUGFyZW50IHdob3NlIGNoaWxkcmVuIHRvIHNlcmlhbGl6ZS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbGwocGFyZW50KSB7XG4gIC8qKiBAdHlwZSB7QXJyYXk8c3RyaW5nPn0gKi9cbiAgY29uc3QgcmVzdWx0cyA9IFtdXG4gIGNvbnN0IGNoaWxkcmVuID0gKHBhcmVudCAmJiBwYXJlbnQuY2hpbGRyZW4pIHx8IGVtcHR5Q2hpbGRyZW5cbiAgbGV0IGluZGV4ID0gLTFcblxuICB3aGlsZSAoKytpbmRleCA8IGNoaWxkcmVuLmxlbmd0aCkge1xuICAgIHJlc3VsdHNbaW5kZXhdID0gdGhpcy5vbmUoY2hpbGRyZW5baW5kZXhdLCBpbmRleCwgcGFyZW50KVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdHMuam9pbignJylcbn1cbiIsCiAgICAiaW1wb3J0IHsgU2hpa2lFcnJvciBhcyBTaGlraUVycm9yJDEgfSBmcm9tIFwiQHNoaWtpanMvdHlwZXNcIjtcbmltcG9ydCB7IFNoaWtpRXJyb3IsIGFwcGx5Q29sb3JSZXBsYWNlbWVudHMsIGNvZGVUb1Rva2Vuc0Jhc2UgYXMgY29kZVRvVG9rZW5zQmFzZSQxLCBjb2RlVG9Ub2tlbnNXaXRoVGhlbWVzLCBjb2RlVG9Ub2tlbnNXaXRoVGhlbWVzIGFzIGNvZGVUb1Rva2Vuc1dpdGhUaGVtZXMkMSwgY3JlYXRlU2hpa2lJbnRlcm5hbCwgY3JlYXRlU2hpa2lJbnRlcm5hbFN5bmMsIGNyZWF0ZVNoaWtpUHJpbWl0aXZlLCBjcmVhdGVTaGlraVByaW1pdGl2ZSBhcyBjcmVhdGVTaGlraVByaW1pdGl2ZSQxLCBjcmVhdGVTaGlraVByaW1pdGl2ZUFzeW5jLCBjcmVhdGVTaGlraVByaW1pdGl2ZUFzeW5jIGFzIGNyZWF0ZVNoaWtpUHJpbWl0aXZlQXN5bmMkMSwgZ2V0TGFzdEdyYW1tYXJTdGF0ZSwgZ2V0TGFzdEdyYW1tYXJTdGF0ZUZyb21NYXAsIGlzTm9uZVRoZW1lLCBpc1BsYWluTGFuZywgaXNTcGVjaWFsTGFuZywgaXNTcGVjaWFsVGhlbWUsIG5vcm1hbGl6ZUdldHRlciwgbm9ybWFsaXplVGhlbWUsIHJlc29sdmVDb2xvclJlcGxhY2VtZW50cywgc2V0TGFzdEdyYW1tYXJTdGF0ZVRvTWFwLCBzcGxpdExpbmVzLCBzcGxpdExpbmVzIGFzIHNwbGl0TGluZXMkMSwgdG9BcnJheSwgdG9rZW5pemVXaXRoVGhlbWUgfSBmcm9tIFwiQHNoaWtpanMvcHJpbWl0aXZlXCI7XG5pbXBvcnQgeyBGb250U3R5bGUgfSBmcm9tIFwiQHNoaWtpanMvdnNjb2RlLXRleHRtYXRlXCI7XG5pbXBvcnQgeyB0b0h0bWwgfSBmcm9tIFwiaGFzdC11dGlsLXRvLWh0bWxcIjtcbmV4cG9ydCAqIGZyb20gXCJAc2hpa2lqcy90eXBlc1wiO1xuLy8jcmVnaW9uIHNyYy91dGlscy9oYXN0LnRzXG5jb25zdCBSRV9XSElURVNQQUNFID0gL1xccysvZztcbi8qKlxuKiBVdGlsaXR5IHRvIGFwcGVuZCBjbGFzcyB0byBhIGhhc3Qgbm9kZVxuKlxuKiBJZiB0aGUgYHByb3BlcnR5LmNsYXNzYCBpcyBhIHN0cmluZywgaXQgd2lsbCBiZSBzcGxpdHRlZCBieSBzcGFjZSBhbmQgY29udmVydGVkIHRvIGFuIGFycmF5LlxuKi9cbmZ1bmN0aW9uIGFkZENsYXNzVG9IYXN0KG5vZGUsIGNsYXNzTmFtZSkge1xuXHRpZiAoIWNsYXNzTmFtZSkgcmV0dXJuIG5vZGU7XG5cdG5vZGUucHJvcGVydGllcyB8fD0ge307XG5cdG5vZGUucHJvcGVydGllcy5jbGFzcyB8fD0gW107XG5cdGlmICh0eXBlb2Ygbm9kZS5wcm9wZXJ0aWVzLmNsYXNzID09PSBcInN0cmluZ1wiKSBub2RlLnByb3BlcnRpZXMuY2xhc3MgPSBub2RlLnByb3BlcnRpZXMuY2xhc3Muc3BsaXQoUkVfV0hJVEVTUEFDRSk7XG5cdGlmICghQXJyYXkuaXNBcnJheShub2RlLnByb3BlcnRpZXMuY2xhc3MpKSBub2RlLnByb3BlcnRpZXMuY2xhc3MgPSBbXTtcblx0Y29uc3QgdGFyZ2V0cyA9IEFycmF5LmlzQXJyYXkoY2xhc3NOYW1lKSA/IGNsYXNzTmFtZSA6IGNsYXNzTmFtZS5zcGxpdChSRV9XSElURVNQQUNFKTtcblx0Zm9yIChjb25zdCBjIG9mIHRhcmdldHMpIGlmIChjICYmICFub2RlLnByb3BlcnRpZXMuY2xhc3MuaW5jbHVkZXMoYykpIG5vZGUucHJvcGVydGllcy5jbGFzcy5wdXNoKGMpO1xuXHRyZXR1cm4gbm9kZTtcbn1cbi8vI2VuZHJlZ2lvblxuLy8jcmVnaW9uIHNyYy91dGlscy9zdHJpbmdzLnRzXG5jb25zdCBSRV9MQU5HX0FUVFIgPSAvOj9sYW5nPVtcIiddKFteXCInXSspW1wiJ10vZztcbmNvbnN0IFJFX0NPREVfRkVOQ0UgPSAvKD86YGBgfH5+fikoW1xcdy1dKykvZztcbmNvbnN0IFJFX0xBVEVYX0JFR0lOID0gL1xcXFxiZWdpblxceyhbXFx3LV0rKVxcfS9nO1xuY29uc3QgUkVfU0NSSVBUX0xBTkcgPSAvPHNjcmlwdFxccysoPzp0eXBlfGxhbmcpPVtcIiddKFteXCInXSspW1wiJ10vZ2k7XG4vKipcbiogQ3JlYXRlcyBhIGNvbnZlcnRlciBiZXR3ZWVuIGluZGV4IGFuZCBwb3NpdGlvbiBpbiBhIGNvZGUgYmxvY2suXG4qXG4qIE92ZXJmbG93L3VuZGVyZmxvdyBhcmUgdW5jaGVja2VkLlxuKi9cbmZ1bmN0aW9uIGNyZWF0ZVBvc2l0aW9uQ29udmVydGVyKGNvZGUpIHtcblx0Y29uc3QgbGluZXMgPSBzcGxpdExpbmVzJDEoY29kZSwgdHJ1ZSkubWFwKChbbGluZV0pID0+IGxpbmUpO1xuXHRmdW5jdGlvbiBpbmRleFRvUG9zKGluZGV4KSB7XG5cdFx0aWYgKGluZGV4ID09PSBjb2RlLmxlbmd0aCkgcmV0dXJuIHtcblx0XHRcdGxpbmU6IGxpbmVzLmxlbmd0aCAtIDEsXG5cdFx0XHRjaGFyYWN0ZXI6IGxpbmVzLmF0KC0xKS5sZW5ndGhcblx0XHR9O1xuXHRcdGxldCBjaGFyYWN0ZXIgPSBpbmRleDtcblx0XHRsZXQgbGluZSA9IDA7XG5cdFx0Zm9yIChjb25zdCBsaW5lVGV4dCBvZiBsaW5lcykge1xuXHRcdFx0aWYgKGNoYXJhY3RlciA8IGxpbmVUZXh0Lmxlbmd0aCkgYnJlYWs7XG5cdFx0XHRjaGFyYWN0ZXIgLT0gbGluZVRleHQubGVuZ3RoO1xuXHRcdFx0bGluZSsrO1xuXHRcdH1cblx0XHRyZXR1cm4ge1xuXHRcdFx0bGluZSxcblx0XHRcdGNoYXJhY3RlclxuXHRcdH07XG5cdH1cblx0ZnVuY3Rpb24gcG9zVG9JbmRleChsaW5lLCBjaGFyYWN0ZXIpIHtcblx0XHRsZXQgaW5kZXggPSAwO1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbGluZTsgaSsrKSBpbmRleCArPSBsaW5lc1tpXS5sZW5ndGg7XG5cdFx0aW5kZXggKz0gY2hhcmFjdGVyO1xuXHRcdHJldHVybiBpbmRleDtcblx0fVxuXHRyZXR1cm4ge1xuXHRcdGxpbmVzLFxuXHRcdGluZGV4VG9Qb3MsXG5cdFx0cG9zVG9JbmRleFxuXHR9O1xufVxuLyoqXG4qIEd1ZXNzIGVtYmVkZGVkIGxhbmd1YWdlcyBmcm9tIGdpdmVuIGNvZGUgYW5kIGhpZ2hsaWdodGVyLlxuKlxuKiBXaGVuIGhpZ2hsaWdodGVyIGlzIHByb3ZpZGVkLCBvbmx5IGJ1bmRsZWQgbGFuZ3VhZ2VzIHdpbGwgYmUgaW5jbHVkZWQuXG4qXG4qIEBwYXJhbSBjb2RlIC0gVGhlIGNvZGUgc3RyaW5nIHRvIGFuYWx5emVcbiogQHBhcmFtIF9sYW5nIC0gVGhlIHByaW1hcnkgbGFuZ3VhZ2Ugb2YgdGhlIGNvZGUgKGN1cnJlbnRseSB1bnVzZWQpXG4qIEBwYXJhbSBoaWdobGlnaHRlciAtIE9wdGlvbmFsIGhpZ2hsaWdodGVyIGluc3RhbmNlIHRvIHZhbGlkYXRlIGxhbmd1YWdlc1xuKiBAcmV0dXJucyBBcnJheSBvZiBkZXRlY3RlZCBsYW5ndWFnZSBpZGVudGlmaWVyc1xuKlxuKiBAZXhhbXBsZVxuKiBgYGB0c1xuKiAvLyBEZXRlY3RzICdqYXZhc2NyaXB0JyBmcm9tIFZ1ZSBTRkNcbiogZ3Vlc3NFbWJlZGRlZExhbmd1YWdlcygnPHNjcmlwdCBsYW5nPVwiamF2YXNjcmlwdFwiPicpXG4qXG4qIC8vIERldGVjdHMgJ3B5dGhvbicgZnJvbSBtYXJrZG93biBjb2RlIGJsb2NrXG4qIGd1ZXNzRW1iZWRkZWRMYW5ndWFnZXMoJ2BgYHB5dGhvblxcbnByaW50KFwiaGlcIilcXG5gYGAnKVxuKiBgYGBcbiovXG5mdW5jdGlvbiBndWVzc0VtYmVkZGVkTGFuZ3VhZ2VzKGNvZGUsIF9sYW5nLCBoaWdobGlnaHRlcikge1xuXHRjb25zdCBsYW5ncyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7XG5cdGZvciAoY29uc3QgbWF0Y2ggb2YgY29kZS5tYXRjaEFsbChSRV9MQU5HX0FUVFIpKSB7XG5cdFx0Y29uc3QgbGFuZyA9IG1hdGNoWzFdLnRvTG93ZXJDYXNlKCkudHJpbSgpO1xuXHRcdGlmIChsYW5nKSBsYW5ncy5hZGQobGFuZyk7XG5cdH1cblx0Zm9yIChjb25zdCBtYXRjaCBvZiBjb2RlLm1hdGNoQWxsKFJFX0NPREVfRkVOQ0UpKSB7XG5cdFx0Y29uc3QgbGFuZyA9IG1hdGNoWzFdLnRvTG93ZXJDYXNlKCkudHJpbSgpO1xuXHRcdGlmIChsYW5nKSBsYW5ncy5hZGQobGFuZyk7XG5cdH1cblx0Zm9yIChjb25zdCBtYXRjaCBvZiBjb2RlLm1hdGNoQWxsKFJFX0xBVEVYX0JFR0lOKSkge1xuXHRcdGNvbnN0IGxhbmcgPSBtYXRjaFsxXS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcblx0XHRpZiAobGFuZykgbGFuZ3MuYWRkKGxhbmcpO1xuXHR9XG5cdGZvciAoY29uc3QgbWF0Y2ggb2YgY29kZS5tYXRjaEFsbChSRV9TQ1JJUFRfTEFORykpIHtcblx0XHRjb25zdCBmdWxsVHlwZSA9IG1hdGNoWzFdLnRvTG93ZXJDYXNlKCkudHJpbSgpO1xuXHRcdGNvbnN0IGxhbmcgPSBmdWxsVHlwZS5pbmNsdWRlcyhcIi9cIikgPyBmdWxsVHlwZS5zcGxpdChcIi9cIikucG9wKCkgOiBmdWxsVHlwZTtcblx0XHRpZiAobGFuZykgbGFuZ3MuYWRkKGxhbmcpO1xuXHR9XG5cdGlmICghaGlnaGxpZ2h0ZXIpIHJldHVybiBbLi4ubGFuZ3NdO1xuXHRjb25zdCBidW5kbGUgPSBoaWdobGlnaHRlci5nZXRCdW5kbGVkTGFuZ3VhZ2VzKCk7XG5cdHJldHVybiBbLi4ubGFuZ3NdLmZpbHRlcigobCkgPT4gbCAmJiBidW5kbGVbbF0pO1xufVxuY29uc3QgQ09MT1JfS0VZUyA9IFtcImNvbG9yXCIsIFwiYmFja2dyb3VuZC1jb2xvclwiXTtcbi8vI2VuZHJlZ2lvblxuLy8jcmVnaW9uIHNyYy91dGlscy90b2tlbnMudHNcbi8qKlxuKiBTcGxpdCBhIHRva2VuIGludG8gbXVsdGlwbGUgdG9rZW5zIGJ5IGdpdmVuIG9mZnNldHMuXG4qXG4qIFRoZSBvZmZzZXRzIGFyZSByZWxhdGl2ZSB0byB0aGUgdG9rZW4sIGFuZCBzaG91bGQgYmUgc29ydGVkLlxuKi9cbmZ1bmN0aW9uIHNwbGl0VG9rZW4odG9rZW4sIG9mZnNldHMpIHtcblx0bGV0IGxhc3RPZmZzZXQgPSAwO1xuXHRjb25zdCB0b2tlbnMgPSBbXTtcblx0Zm9yIChjb25zdCBvZmZzZXQgb2Ygb2Zmc2V0cykge1xuXHRcdGlmIChvZmZzZXQgPiBsYXN0T2Zmc2V0KSB0b2tlbnMucHVzaCh7XG5cdFx0XHQuLi50b2tlbixcblx0XHRcdGNvbnRlbnQ6IHRva2VuLmNvbnRlbnQuc2xpY2UobGFzdE9mZnNldCwgb2Zmc2V0KSxcblx0XHRcdG9mZnNldDogdG9rZW4ub2Zmc2V0ICsgbGFzdE9mZnNldFxuXHRcdH0pO1xuXHRcdGxhc3RPZmZzZXQgPSBvZmZzZXQ7XG5cdH1cblx0aWYgKGxhc3RPZmZzZXQgPCB0b2tlbi5jb250ZW50Lmxlbmd0aCkgdG9rZW5zLnB1c2goe1xuXHRcdC4uLnRva2VuLFxuXHRcdGNvbnRlbnQ6IHRva2VuLmNvbnRlbnQuc2xpY2UobGFzdE9mZnNldCksXG5cdFx0b2Zmc2V0OiB0b2tlbi5vZmZzZXQgKyBsYXN0T2Zmc2V0XG5cdH0pO1xuXHRyZXR1cm4gdG9rZW5zO1xufVxuLyoqXG4qIFNwbGl0IDJEIHRva2VucyBhcnJheSBieSBnaXZlbiBicmVha3BvaW50cy5cbiovXG5mdW5jdGlvbiBzcGxpdFRva2Vucyh0b2tlbnMsIGJyZWFrcG9pbnRzKSB7XG5cdGNvbnN0IHNvcnRlZCA9IFsuLi5icmVha3BvaW50cyBpbnN0YW5jZW9mIFNldCA/IGJyZWFrcG9pbnRzIDogbmV3IFNldChicmVha3BvaW50cyldLnNvcnQoKGEsIGIpID0+IGEgLSBiKTtcblx0aWYgKCFzb3J0ZWQubGVuZ3RoKSByZXR1cm4gdG9rZW5zO1xuXHRyZXR1cm4gdG9rZW5zLm1hcCgobGluZSkgPT4ge1xuXHRcdHJldHVybiBsaW5lLmZsYXRNYXAoKHRva2VuKSA9PiB7XG5cdFx0XHRjb25zdCBicmVha3BvaW50c0luVG9rZW4gPSBzb3J0ZWQuZmlsdGVyKChpKSA9PiB0b2tlbi5vZmZzZXQgPCBpICYmIGkgPCB0b2tlbi5vZmZzZXQgKyB0b2tlbi5jb250ZW50Lmxlbmd0aCkubWFwKChpKSA9PiBpIC0gdG9rZW4ub2Zmc2V0KS5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG5cdFx0XHRpZiAoIWJyZWFrcG9pbnRzSW5Ub2tlbi5sZW5ndGgpIHJldHVybiB0b2tlbjtcblx0XHRcdHJldHVybiBzcGxpdFRva2VuKHRva2VuLCBicmVha3BvaW50c0luVG9rZW4pO1xuXHRcdH0pO1xuXHR9KTtcbn1cbmZ1bmN0aW9uIGZsYXRUb2tlblZhcmlhbnRzKG1lcmdlZCwgdmFyaWFudHNPcmRlciwgY3NzVmFyaWFibGVQcmVmaXgsIGRlZmF1bHRDb2xvciwgY29sb3JzUmVuZGVyaW5nID0gXCJjc3MtdmFyc1wiKSB7XG5cdGNvbnN0IHRva2VuID0ge1xuXHRcdGNvbnRlbnQ6IG1lcmdlZC5jb250ZW50LFxuXHRcdGV4cGxhbmF0aW9uOiBtZXJnZWQuZXhwbGFuYXRpb24sXG5cdFx0b2Zmc2V0OiBtZXJnZWQub2Zmc2V0XG5cdH07XG5cdGNvbnN0IHN0eWxlcyA9IHZhcmlhbnRzT3JkZXIubWFwKCh0KSA9PiBnZXRUb2tlblN0eWxlT2JqZWN0KG1lcmdlZC52YXJpYW50c1t0XSkpO1xuXHRjb25zdCBzdHlsZUtleXMgPSBuZXcgU2V0KHN0eWxlcy5mbGF0TWFwKCh0KSA9PiBPYmplY3Qua2V5cyh0KSkpO1xuXHRjb25zdCBtZXJnZWRTdHlsZXMgPSB7fTtcblx0Y29uc3QgdmFyS2V5ID0gKGlkeCwga2V5KSA9PiB7XG5cdFx0Y29uc3Qga2V5TmFtZSA9IGtleSA9PT0gXCJjb2xvclwiID8gXCJcIiA6IGtleSA9PT0gXCJiYWNrZ3JvdW5kLWNvbG9yXCIgPyBcIi1iZ1wiIDogYC0ke2tleX1gO1xuXHRcdHJldHVybiBjc3NWYXJpYWJsZVByZWZpeCArIHZhcmlhbnRzT3JkZXJbaWR4XSArIChrZXkgPT09IFwiY29sb3JcIiA/IFwiXCIgOiBrZXlOYW1lKTtcblx0fTtcblx0c3R5bGVzLmZvckVhY2goKGN1ciwgaWR4KSA9PiB7XG5cdFx0Zm9yIChjb25zdCBrZXkgb2Ygc3R5bGVLZXlzKSB7XG5cdFx0XHRjb25zdCB2YWx1ZSA9IGN1cltrZXldIHx8IFwiaW5oZXJpdFwiO1xuXHRcdFx0aWYgKGlkeCA9PT0gMCAmJiBkZWZhdWx0Q29sb3IgJiYgQ09MT1JfS0VZUy5pbmNsdWRlcyhrZXkpKSBpZiAoZGVmYXVsdENvbG9yID09PSBcImxpZ2h0LWRhcmsoKVwiICYmIHN0eWxlcy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdGNvbnN0IGxpZ2h0SW5kZXggPSB2YXJpYW50c09yZGVyLmZpbmRJbmRleCgodCkgPT4gdCA9PT0gXCJsaWdodFwiKTtcblx0XHRcdFx0Y29uc3QgZGFya0luZGV4ID0gdmFyaWFudHNPcmRlci5maW5kSW5kZXgoKHQpID0+IHQgPT09IFwiZGFya1wiKTtcblx0XHRcdFx0aWYgKGxpZ2h0SW5kZXggPT09IC0xIHx8IGRhcmtJbmRleCA9PT0gLTEpIHRocm93IG5ldyBTaGlraUVycm9yJDEoXCJXaGVuIHVzaW5nIGBkZWZhdWx0Q29sb3I6IFxcXCJsaWdodC1kYXJrKClcXFwiYCwgeW91IG11c3QgcHJvdmlkZSBib3RoIGBsaWdodGAgYW5kIGBkYXJrYCB0aGVtZXNcIik7XG5cdFx0XHRcdG1lcmdlZFN0eWxlc1trZXldID0gYGxpZ2h0LWRhcmsoJHtzdHlsZXNbbGlnaHRJbmRleF1ba2V5XSB8fCBcImluaGVyaXRcIn0sICR7c3R5bGVzW2RhcmtJbmRleF1ba2V5XSB8fCBcImluaGVyaXRcIn0pYDtcblx0XHRcdFx0aWYgKGNvbG9yc1JlbmRlcmluZyA9PT0gXCJjc3MtdmFyc1wiKSBtZXJnZWRTdHlsZXNbdmFyS2V5KGlkeCwga2V5KV0gPSB2YWx1ZTtcblx0XHRcdH0gZWxzZSBtZXJnZWRTdHlsZXNba2V5XSA9IHZhbHVlO1xuXHRcdFx0ZWxzZSBpZiAoY29sb3JzUmVuZGVyaW5nID09PSBcImNzcy12YXJzXCIpIG1lcmdlZFN0eWxlc1t2YXJLZXkoaWR4LCBrZXkpXSA9IHZhbHVlO1xuXHRcdH1cblx0fSk7XG5cdHRva2VuLmh0bWxTdHlsZSA9IG1lcmdlZFN0eWxlcztcblx0cmV0dXJuIHRva2VuO1xufVxuZnVuY3Rpb24gZ2V0VG9rZW5TdHlsZU9iamVjdCh0b2tlbikge1xuXHRjb25zdCBzdHlsZXMgPSB7fTtcblx0aWYgKHRva2VuLmNvbG9yKSBzdHlsZXMuY29sb3IgPSB0b2tlbi5jb2xvcjtcblx0aWYgKHRva2VuLmJnQ29sb3IpIHN0eWxlc1tcImJhY2tncm91bmQtY29sb3JcIl0gPSB0b2tlbi5iZ0NvbG9yO1xuXHRpZiAodG9rZW4uZm9udFN0eWxlKSB7XG5cdFx0aWYgKHRva2VuLmZvbnRTdHlsZSAmIEZvbnRTdHlsZS5JdGFsaWMpIHN0eWxlc1tcImZvbnQtc3R5bGVcIl0gPSBcIml0YWxpY1wiO1xuXHRcdGlmICh0b2tlbi5mb250U3R5bGUgJiBGb250U3R5bGUuQm9sZCkgc3R5bGVzW1wiZm9udC13ZWlnaHRcIl0gPSBcImJvbGRcIjtcblx0XHRjb25zdCBkZWNvcmF0aW9ucyA9IFtdO1xuXHRcdGlmICh0b2tlbi5mb250U3R5bGUgJiBGb250U3R5bGUuVW5kZXJsaW5lKSBkZWNvcmF0aW9ucy5wdXNoKFwidW5kZXJsaW5lXCIpO1xuXHRcdGlmICh0b2tlbi5mb250U3R5bGUgJiBGb250U3R5bGUuU3RyaWtldGhyb3VnaCkgZGVjb3JhdGlvbnMucHVzaChcImxpbmUtdGhyb3VnaFwiKTtcblx0XHRpZiAoZGVjb3JhdGlvbnMubGVuZ3RoKSBzdHlsZXNbXCJ0ZXh0LWRlY29yYXRpb25cIl0gPSBkZWNvcmF0aW9ucy5qb2luKFwiIFwiKTtcblx0fVxuXHRyZXR1cm4gc3R5bGVzO1xufVxuZnVuY3Rpb24gc3RyaW5naWZ5VG9rZW5TdHlsZSh0b2tlbikge1xuXHRpZiAodHlwZW9mIHRva2VuID09PSBcInN0cmluZ1wiKSByZXR1cm4gdG9rZW47XG5cdHJldHVybiBPYmplY3QuZW50cmllcyh0b2tlbikubWFwKChba2V5LCB2YWx1ZV0pID0+IGAke2tleX06JHt2YWx1ZX1gKS5qb2luKFwiO1wiKTtcbn1cbi8vI2VuZHJlZ2lvblxuLy8jcmVnaW9uIHNyYy90cmFuc2Zvcm1lci1kZWNvcmF0aW9ucy50c1xuLyoqXG4qIEEgYnVpbHQtaW4gdHJhbnNmb3JtZXIgdG8gYWRkIGRlY29yYXRpb25zIHRvIHRoZSBoaWdobGlnaHRlZCBjb2RlLlxuKi9cbmZ1bmN0aW9uIHRyYW5zZm9ybWVyRGVjb3JhdGlvbnMoKSB7XG5cdGNvbnN0IG1hcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgV2Vha01hcCgpO1xuXHRmdW5jdGlvbiBnZXRDb250ZXh0KHNoaWtpKSB7XG5cdFx0aWYgKCFtYXAuaGFzKHNoaWtpLm1ldGEpKSB7XG5cdFx0XHRjb25zdCBjb252ZXJ0ZXIgPSBjcmVhdGVQb3NpdGlvbkNvbnZlcnRlcihzaGlraS5zb3VyY2UpO1xuXHRcdFx0ZnVuY3Rpb24gbm9ybWFsaXplUG9zaXRpb24ocCkge1xuXHRcdFx0XHRpZiAodHlwZW9mIHAgPT09IFwibnVtYmVyXCIpIHtcblx0XHRcdFx0XHRpZiAocCA8IDAgfHwgcCA+IHNoaWtpLnNvdXJjZS5sZW5ndGgpIHRocm93IG5ldyBTaGlraUVycm9yJDEoYEludmFsaWQgZGVjb3JhdGlvbiBvZmZzZXQ6ICR7cH0uIENvZGUgbGVuZ3RoOiAke3NoaWtpLnNvdXJjZS5sZW5ndGh9YCk7XG5cdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdC4uLmNvbnZlcnRlci5pbmRleFRvUG9zKHApLFxuXHRcdFx0XHRcdFx0b2Zmc2V0OiBwXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zdCBsaW5lID0gY29udmVydGVyLmxpbmVzW3AubGluZV07XG5cdFx0XHRcdFx0aWYgKGxpbmUgPT09IHZvaWQgMCkgdGhyb3cgbmV3IFNoaWtpRXJyb3IkMShgSW52YWxpZCBkZWNvcmF0aW9uIHBvc2l0aW9uICR7SlNPTi5zdHJpbmdpZnkocCl9LiBMaW5lcyBsZW5ndGg6ICR7Y29udmVydGVyLmxpbmVzLmxlbmd0aH1gKTtcblx0XHRcdFx0XHRsZXQgY2hhcmFjdGVyID0gcC5jaGFyYWN0ZXI7XG5cdFx0XHRcdFx0aWYgKGNoYXJhY3RlciA8IDApIGNoYXJhY3RlciA9IGxpbmUubGVuZ3RoICsgY2hhcmFjdGVyO1xuXHRcdFx0XHRcdGlmIChjaGFyYWN0ZXIgPCAwIHx8IGNoYXJhY3RlciA+IGxpbmUubGVuZ3RoKSB0aHJvdyBuZXcgU2hpa2lFcnJvciQxKGBJbnZhbGlkIGRlY29yYXRpb24gcG9zaXRpb24gJHtKU09OLnN0cmluZ2lmeShwKX0uIExpbmUgJHtwLmxpbmV9IGxlbmd0aDogJHtsaW5lLmxlbmd0aH1gKTtcblx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0Li4ucCxcblx0XHRcdFx0XHRcdGNoYXJhY3Rlcixcblx0XHRcdFx0XHRcdG9mZnNldDogY29udmVydGVyLnBvc1RvSW5kZXgocC5saW5lLCBjaGFyYWN0ZXIpXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Y29uc3QgZGVjb3JhdGlvbnMgPSAoc2hpa2kub3B0aW9ucy5kZWNvcmF0aW9ucyB8fCBbXSkubWFwKChkKSA9PiAoe1xuXHRcdFx0XHQuLi5kLFxuXHRcdFx0XHRzdGFydDogbm9ybWFsaXplUG9zaXRpb24oZC5zdGFydCksXG5cdFx0XHRcdGVuZDogbm9ybWFsaXplUG9zaXRpb24oZC5lbmQpXG5cdFx0XHR9KSk7XG5cdFx0XHR2ZXJpZnlJbnRlcnNlY3Rpb25zKGRlY29yYXRpb25zKTtcblx0XHRcdG1hcC5zZXQoc2hpa2kubWV0YSwge1xuXHRcdFx0XHRkZWNvcmF0aW9ucyxcblx0XHRcdFx0Y29udmVydGVyLFxuXHRcdFx0XHRzb3VyY2U6IHNoaWtpLnNvdXJjZVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBtYXAuZ2V0KHNoaWtpLm1ldGEpO1xuXHR9XG5cdHJldHVybiB7XG5cdFx0bmFtZTogXCJzaGlraTpkZWNvcmF0aW9uc1wiLFxuXHRcdHRva2Vucyh0b2tlbnMpIHtcblx0XHRcdGlmICghdGhpcy5vcHRpb25zLmRlY29yYXRpb25zPy5sZW5ndGgpIHJldHVybjtcblx0XHRcdHJldHVybiBzcGxpdFRva2Vucyh0b2tlbnMsIGdldENvbnRleHQodGhpcykuZGVjb3JhdGlvbnMuZmxhdE1hcCgoZCkgPT4gW2Quc3RhcnQub2Zmc2V0LCBkLmVuZC5vZmZzZXRdKSk7XG5cdFx0fSxcblx0XHRjb2RlKGNvZGVFbCkge1xuXHRcdFx0aWYgKCF0aGlzLm9wdGlvbnMuZGVjb3JhdGlvbnM/Lmxlbmd0aCkgcmV0dXJuO1xuXHRcdFx0Y29uc3QgY3R4ID0gZ2V0Q29udGV4dCh0aGlzKTtcblx0XHRcdGNvbnN0IGxpbmVzID0gWy4uLmNvZGVFbC5jaGlsZHJlbl0uZmlsdGVyKChpKSA9PiBpLnR5cGUgPT09IFwiZWxlbWVudFwiICYmIGkudGFnTmFtZSA9PT0gXCJzcGFuXCIpO1xuXHRcdFx0aWYgKGxpbmVzLmxlbmd0aCAhPT0gY3R4LmNvbnZlcnRlci5saW5lcy5sZW5ndGgpIHRocm93IG5ldyBTaGlraUVycm9yJDEoYE51bWJlciBvZiBsaW5lcyBpbiBjb2RlIGVsZW1lbnQgKCR7bGluZXMubGVuZ3RofSkgZG9lcyBub3QgbWF0Y2ggdGhlIG51bWJlciBvZiBsaW5lcyBpbiB0aGUgc291cmNlICgke2N0eC5jb252ZXJ0ZXIubGluZXMubGVuZ3RofSkuIEZhaWxlZCB0byBhcHBseSBkZWNvcmF0aW9ucy5gKTtcblx0XHRcdGZ1bmN0aW9uIGFwcGx5TGluZVNlY3Rpb24obGluZSwgc3RhcnQsIGVuZCwgZGVjb3JhdGlvbikge1xuXHRcdFx0XHRjb25zdCBsaW5lRWwgPSBsaW5lc1tsaW5lXTtcblx0XHRcdFx0bGV0IHRleHQgPSBcIlwiO1xuXHRcdFx0XHRsZXQgc3RhcnRJbmRleCA9IC0xO1xuXHRcdFx0XHRsZXQgZW5kSW5kZXggPSAtMTtcblx0XHRcdFx0aWYgKHN0YXJ0ID09PSAwKSBzdGFydEluZGV4ID0gMDtcblx0XHRcdFx0aWYgKGVuZCA9PT0gMCkgZW5kSW5kZXggPSAwO1xuXHRcdFx0XHRpZiAoZW5kID09PSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpIGVuZEluZGV4ID0gbGluZUVsLmNoaWxkcmVuLmxlbmd0aDtcblx0XHRcdFx0aWYgKHN0YXJ0SW5kZXggPT09IC0xIHx8IGVuZEluZGV4ID09PSAtMSkgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lRWwuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHR0ZXh0ICs9IHN0cmluZ2lmeShsaW5lRWwuY2hpbGRyZW5baV0pO1xuXHRcdFx0XHRcdGlmIChzdGFydEluZGV4ID09PSAtMSAmJiB0ZXh0Lmxlbmd0aCA9PT0gc3RhcnQpIHN0YXJ0SW5kZXggPSBpICsgMTtcblx0XHRcdFx0XHRpZiAoZW5kSW5kZXggPT09IC0xICYmIHRleHQubGVuZ3RoID09PSBlbmQpIGVuZEluZGV4ID0gaSArIDE7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHN0YXJ0SW5kZXggPT09IC0xKSB0aHJvdyBuZXcgU2hpa2lFcnJvciQxKGBGYWlsZWQgdG8gZmluZCBzdGFydCBpbmRleCBmb3IgZGVjb3JhdGlvbiAke0pTT04uc3RyaW5naWZ5KGRlY29yYXRpb24uc3RhcnQpfWApO1xuXHRcdFx0XHRpZiAoZW5kSW5kZXggPT09IC0xKSB0aHJvdyBuZXcgU2hpa2lFcnJvciQxKGBGYWlsZWQgdG8gZmluZCBlbmQgaW5kZXggZm9yIGRlY29yYXRpb24gJHtKU09OLnN0cmluZ2lmeShkZWNvcmF0aW9uLmVuZCl9YCk7XG5cdFx0XHRcdGNvbnN0IGNoaWxkcmVuID0gbGluZUVsLmNoaWxkcmVuLnNsaWNlKHN0YXJ0SW5kZXgsIGVuZEluZGV4KTtcblx0XHRcdFx0aWYgKCFkZWNvcmF0aW9uLmFsd2F5c1dyYXAgJiYgY2hpbGRyZW4ubGVuZ3RoID09PSBsaW5lRWwuY2hpbGRyZW4ubGVuZ3RoKSBhcHBseURlY29yYXRpb24obGluZUVsLCBkZWNvcmF0aW9uLCBcImxpbmVcIik7XG5cdFx0XHRcdGVsc2UgaWYgKCFkZWNvcmF0aW9uLmFsd2F5c1dyYXAgJiYgY2hpbGRyZW4ubGVuZ3RoID09PSAxICYmIGNoaWxkcmVuWzBdLnR5cGUgPT09IFwiZWxlbWVudFwiKSBhcHBseURlY29yYXRpb24oY2hpbGRyZW5bMF0sIGRlY29yYXRpb24sIFwidG9rZW5cIik7XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IHdyYXBwZXIgPSB7XG5cdFx0XHRcdFx0XHR0eXBlOiBcImVsZW1lbnRcIixcblx0XHRcdFx0XHRcdHRhZ05hbWU6IFwic3BhblwiLFxuXHRcdFx0XHRcdFx0cHJvcGVydGllczoge30sXG5cdFx0XHRcdFx0XHRjaGlsZHJlblxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0YXBwbHlEZWNvcmF0aW9uKHdyYXBwZXIsIGRlY29yYXRpb24sIFwid3JhcHBlclwiKTtcblx0XHRcdFx0XHRsaW5lRWwuY2hpbGRyZW4uc3BsaWNlKHN0YXJ0SW5kZXgsIGNoaWxkcmVuLmxlbmd0aCwgd3JhcHBlcik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGZ1bmN0aW9uIGFwcGx5TGluZShsaW5lLCBkZWNvcmF0aW9uKSB7XG5cdFx0XHRcdGxpbmVzW2xpbmVdID0gYXBwbHlEZWNvcmF0aW9uKGxpbmVzW2xpbmVdLCBkZWNvcmF0aW9uLCBcImxpbmVcIik7XG5cdFx0XHR9XG5cdFx0XHRmdW5jdGlvbiBhcHBseURlY29yYXRpb24oZWwsIGRlY29yYXRpb24sIHR5cGUpIHtcblx0XHRcdFx0Y29uc3QgcHJvcGVydGllcyA9IGRlY29yYXRpb24ucHJvcGVydGllcyB8fCB7fTtcblx0XHRcdFx0Y29uc3QgdHJhbnNmb3JtID0gZGVjb3JhdGlvbi50cmFuc2Zvcm0gfHwgKChpKSA9PiBpKTtcblx0XHRcdFx0ZWwudGFnTmFtZSA9IGRlY29yYXRpb24udGFnTmFtZSB8fCBcInNwYW5cIjtcblx0XHRcdFx0ZWwucHJvcGVydGllcyA9IHtcblx0XHRcdFx0XHQuLi5lbC5wcm9wZXJ0aWVzLFxuXHRcdFx0XHRcdC4uLnByb3BlcnRpZXMsXG5cdFx0XHRcdFx0Y2xhc3M6IGVsLnByb3BlcnRpZXMuY2xhc3Ncblx0XHRcdFx0fTtcblx0XHRcdFx0aWYgKGRlY29yYXRpb24ucHJvcGVydGllcz8uY2xhc3MpIGFkZENsYXNzVG9IYXN0KGVsLCBkZWNvcmF0aW9uLnByb3BlcnRpZXMuY2xhc3MpO1xuXHRcdFx0XHRlbCA9IHRyYW5zZm9ybShlbCwgdHlwZSkgfHwgZWw7XG5cdFx0XHRcdHJldHVybiBlbDtcblx0XHRcdH1cblx0XHRcdGNvbnN0IGxpbmVBcHBsaWVzID0gW107XG5cdFx0XHRjb25zdCBzb3J0ZWQgPSBjdHguZGVjb3JhdGlvbnMuc29ydCgoYSwgYikgPT4gYi5zdGFydC5vZmZzZXQgLSBhLnN0YXJ0Lm9mZnNldCB8fCBhLmVuZC5vZmZzZXQgLSBiLmVuZC5vZmZzZXQpO1xuXHRcdFx0Zm9yIChjb25zdCBkZWNvcmF0aW9uIG9mIHNvcnRlZCkge1xuXHRcdFx0XHRjb25zdCB7IHN0YXJ0LCBlbmQgfSA9IGRlY29yYXRpb247XG5cdFx0XHRcdGlmIChzdGFydC5saW5lID09PSBlbmQubGluZSkgYXBwbHlMaW5lU2VjdGlvbihzdGFydC5saW5lLCBzdGFydC5jaGFyYWN0ZXIsIGVuZC5jaGFyYWN0ZXIsIGRlY29yYXRpb24pO1xuXHRcdFx0XHRlbHNlIGlmIChzdGFydC5saW5lIDwgZW5kLmxpbmUpIHtcblx0XHRcdFx0XHRhcHBseUxpbmVTZWN0aW9uKHN0YXJ0LmxpbmUsIHN0YXJ0LmNoYXJhY3RlciwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLCBkZWNvcmF0aW9uKTtcblx0XHRcdFx0XHRmb3IgKGxldCBpID0gc3RhcnQubGluZSArIDE7IGkgPCBlbmQubGluZTsgaSsrKSBsaW5lQXBwbGllcy51bnNoaWZ0KCgpID0+IGFwcGx5TGluZShpLCBkZWNvcmF0aW9uKSk7XG5cdFx0XHRcdFx0YXBwbHlMaW5lU2VjdGlvbihlbmQubGluZSwgMCwgZW5kLmNoYXJhY3RlciwgZGVjb3JhdGlvbik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGxpbmVBcHBsaWVzLmZvckVhY2goKGkpID0+IGkoKSk7XG5cdFx0fVxuXHR9O1xufVxuZnVuY3Rpb24gdmVyaWZ5SW50ZXJzZWN0aW9ucyhpdGVtcykge1xuXHRmb3IgKGxldCBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y29uc3QgZm9vID0gaXRlbXNbaV07XG5cdFx0aWYgKGZvby5zdGFydC5vZmZzZXQgPiBmb28uZW5kLm9mZnNldCkgdGhyb3cgbmV3IFNoaWtpRXJyb3IkMShgSW52YWxpZCBkZWNvcmF0aW9uIHJhbmdlOiAke0pTT04uc3RyaW5naWZ5KGZvby5zdGFydCl9IC0gJHtKU09OLnN0cmluZ2lmeShmb28uZW5kKX1gKTtcblx0XHRmb3IgKGxldCBqID0gaSArIDE7IGogPCBpdGVtcy5sZW5ndGg7IGorKykge1xuXHRcdFx0Y29uc3QgYmFyID0gaXRlbXNbal07XG5cdFx0XHRjb25zdCBpc0Zvb0hhc0JhclN0YXJ0ID0gZm9vLnN0YXJ0Lm9mZnNldCA8PSBiYXIuc3RhcnQub2Zmc2V0ICYmIGJhci5zdGFydC5vZmZzZXQgPCBmb28uZW5kLm9mZnNldDtcblx0XHRcdGNvbnN0IGlzRm9vSGFzQmFyRW5kID0gZm9vLnN0YXJ0Lm9mZnNldCA8IGJhci5lbmQub2Zmc2V0ICYmIGJhci5lbmQub2Zmc2V0IDw9IGZvby5lbmQub2Zmc2V0O1xuXHRcdFx0Y29uc3QgaXNCYXJIYXNGb29TdGFydCA9IGJhci5zdGFydC5vZmZzZXQgPD0gZm9vLnN0YXJ0Lm9mZnNldCAmJiBmb28uc3RhcnQub2Zmc2V0IDwgYmFyLmVuZC5vZmZzZXQ7XG5cdFx0XHRjb25zdCBpc0Jhckhhc0Zvb0VuZCA9IGJhci5zdGFydC5vZmZzZXQgPCBmb28uZW5kLm9mZnNldCAmJiBmb28uZW5kLm9mZnNldCA8PSBiYXIuZW5kLm9mZnNldDtcblx0XHRcdGlmIChpc0Zvb0hhc0JhclN0YXJ0IHx8IGlzRm9vSGFzQmFyRW5kIHx8IGlzQmFySGFzRm9vU3RhcnQgfHwgaXNCYXJIYXNGb29FbmQpIHtcblx0XHRcdFx0aWYgKGlzRm9vSGFzQmFyU3RhcnQgJiYgaXNGb29IYXNCYXJFbmQpIGNvbnRpbnVlO1xuXHRcdFx0XHRpZiAoaXNCYXJIYXNGb29TdGFydCAmJiBpc0Jhckhhc0Zvb0VuZCkgY29udGludWU7XG5cdFx0XHRcdGlmIChpc0Jhckhhc0Zvb1N0YXJ0ICYmIGZvby5zdGFydC5vZmZzZXQgPT09IGZvby5lbmQub2Zmc2V0KSBjb250aW51ZTtcblx0XHRcdFx0aWYgKGlzRm9vSGFzQmFyRW5kICYmIGJhci5zdGFydC5vZmZzZXQgPT09IGJhci5lbmQub2Zmc2V0KSBjb250aW51ZTtcblx0XHRcdFx0dGhyb3cgbmV3IFNoaWtpRXJyb3IkMShgRGVjb3JhdGlvbnMgJHtKU09OLnN0cmluZ2lmeShmb28uc3RhcnQpfSBhbmQgJHtKU09OLnN0cmluZ2lmeShiYXIuc3RhcnQpfSBpbnRlcnNlY3QuYCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5mdW5jdGlvbiBzdHJpbmdpZnkoZWwpIHtcblx0aWYgKGVsLnR5cGUgPT09IFwidGV4dFwiKSByZXR1cm4gZWwudmFsdWU7XG5cdGlmIChlbC50eXBlID09PSBcImVsZW1lbnRcIikgcmV0dXJuIGVsLmNoaWxkcmVuLm1hcChzdHJpbmdpZnkpLmpvaW4oXCJcIik7XG5cdHJldHVybiBcIlwiO1xufVxuLy8jZW5kcmVnaW9uXG4vLyNyZWdpb24gc3JjL2hpZ2hsaWdodC9fZ2V0LXRyYW5zZm9ybWVycy50c1xuY29uc3QgYnVpbHRJblRyYW5zZm9ybWVycyA9IFsvKiBAX19QVVJFX18gKi8gdHJhbnNmb3JtZXJEZWNvcmF0aW9ucygpXTtcbmZ1bmN0aW9uIGdldFRyYW5zZm9ybWVycyhvcHRpb25zKSB7XG5cdGNvbnN0IHRyYW5zZm9ybWVycyA9IHNvcnRUcmFuc2Zvcm1lcnNCeUVuZm9yY2VtZW50KG9wdGlvbnMudHJhbnNmb3JtZXJzIHx8IFtdKTtcblx0cmV0dXJuIFtcblx0XHQuLi50cmFuc2Zvcm1lcnMucHJlLFxuXHRcdC4uLnRyYW5zZm9ybWVycy5ub3JtYWwsXG5cdFx0Li4udHJhbnNmb3JtZXJzLnBvc3QsXG5cdFx0Li4uYnVpbHRJblRyYW5zZm9ybWVyc1xuXHRdO1xufVxuZnVuY3Rpb24gc29ydFRyYW5zZm9ybWVyc0J5RW5mb3JjZW1lbnQodHJhbnNmb3JtZXJzKSB7XG5cdGNvbnN0IHByZSA9IFtdO1xuXHRjb25zdCBwb3N0ID0gW107XG5cdGNvbnN0IG5vcm1hbCA9IFtdO1xuXHRmb3IgKGNvbnN0IHRyYW5zZm9ybWVyIG9mIHRyYW5zZm9ybWVycykgc3dpdGNoICh0cmFuc2Zvcm1lci5lbmZvcmNlKSB7XG5cdFx0Y2FzZSBcInByZVwiOlxuXHRcdFx0cHJlLnB1c2godHJhbnNmb3JtZXIpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcInBvc3RcIjpcblx0XHRcdHBvc3QucHVzaCh0cmFuc2Zvcm1lcik7XG5cdFx0XHRicmVhaztcblx0XHRkZWZhdWx0OiBub3JtYWwucHVzaCh0cmFuc2Zvcm1lcik7XG5cdH1cblx0cmV0dXJuIHtcblx0XHRwcmUsXG5cdFx0cG9zdCxcblx0XHRub3JtYWxcblx0fTtcbn1cbi8vI2VuZHJlZ2lvblxuLy8jcmVnaW9uIC4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9hbnNpLXNlcXVlbmNlLXBhcnNlckAxLjEuMy9ub2RlX21vZHVsZXMvYW5zaS1zZXF1ZW5jZS1wYXJzZXIvZGlzdC9pbmRleC5qc1xudmFyIG5hbWVkQ29sb3JzID0gW1xuXHRcImJsYWNrXCIsXG5cdFwicmVkXCIsXG5cdFwiZ3JlZW5cIixcblx0XCJ5ZWxsb3dcIixcblx0XCJibHVlXCIsXG5cdFwibWFnZW50YVwiLFxuXHRcImN5YW5cIixcblx0XCJ3aGl0ZVwiLFxuXHRcImJyaWdodEJsYWNrXCIsXG5cdFwiYnJpZ2h0UmVkXCIsXG5cdFwiYnJpZ2h0R3JlZW5cIixcblx0XCJicmlnaHRZZWxsb3dcIixcblx0XCJicmlnaHRCbHVlXCIsXG5cdFwiYnJpZ2h0TWFnZW50YVwiLFxuXHRcImJyaWdodEN5YW5cIixcblx0XCJicmlnaHRXaGl0ZVwiXG5dO1xudmFyIGRlY29yYXRpb25zID0ge1xuXHQxOiBcImJvbGRcIixcblx0MjogXCJkaW1cIixcblx0MzogXCJpdGFsaWNcIixcblx0NDogXCJ1bmRlcmxpbmVcIixcblx0NzogXCJyZXZlcnNlXCIsXG5cdDg6IFwiaGlkZGVuXCIsXG5cdDk6IFwic3RyaWtldGhyb3VnaFwiXG59O1xuZnVuY3Rpb24gZmluZFNlcXVlbmNlKHZhbHVlLCBwb3NpdGlvbikge1xuXHRjb25zdCBuZXh0RXNjYXBlID0gdmFsdWUuaW5kZXhPZihcIlxceDFCXCIsIHBvc2l0aW9uKTtcblx0aWYgKG5leHRFc2NhcGUgIT09IC0xKSB7XG5cdFx0aWYgKHZhbHVlW25leHRFc2NhcGUgKyAxXSA9PT0gXCJbXCIpIHtcblx0XHRcdGNvbnN0IG5leHRDbG9zZSA9IHZhbHVlLmluZGV4T2YoXCJtXCIsIG5leHRFc2NhcGUpO1xuXHRcdFx0aWYgKG5leHRDbG9zZSAhPT0gLTEpIHJldHVybiB7XG5cdFx0XHRcdHNlcXVlbmNlOiB2YWx1ZS5zdWJzdHJpbmcobmV4dEVzY2FwZSArIDIsIG5leHRDbG9zZSkuc3BsaXQoXCI7XCIpLFxuXHRcdFx0XHRzdGFydFBvc2l0aW9uOiBuZXh0RXNjYXBlLFxuXHRcdFx0XHRwb3NpdGlvbjogbmV4dENsb3NlICsgMVxuXHRcdFx0fTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHsgcG9zaXRpb246IHZhbHVlLmxlbmd0aCB9O1xufVxuZnVuY3Rpb24gcGFyc2VDb2xvcihzZXF1ZW5jZSkge1xuXHRjb25zdCBjb2xvck1vZGUgPSBzZXF1ZW5jZS5zaGlmdCgpO1xuXHRpZiAoY29sb3JNb2RlID09PSBcIjJcIikge1xuXHRcdGNvbnN0IHJnYiA9IHNlcXVlbmNlLnNwbGljZSgwLCAzKS5tYXAoKHgpID0+IE51bWJlci5wYXJzZUludCh4KSk7XG5cdFx0aWYgKHJnYi5sZW5ndGggIT09IDMgfHwgcmdiLnNvbWUoKHgpID0+IE51bWJlci5pc05hTih4KSkpIHJldHVybjtcblx0XHRyZXR1cm4ge1xuXHRcdFx0dHlwZTogXCJyZ2JcIixcblx0XHRcdHJnYlxuXHRcdH07XG5cdH0gZWxzZSBpZiAoY29sb3JNb2RlID09PSBcIjVcIikge1xuXHRcdGNvbnN0IGluZGV4ID0gc2VxdWVuY2Uuc2hpZnQoKTtcblx0XHRpZiAoaW5kZXgpIHJldHVybiB7XG5cdFx0XHR0eXBlOiBcInRhYmxlXCIsXG5cdFx0XHRpbmRleDogTnVtYmVyKGluZGV4KVxuXHRcdH07XG5cdH1cbn1cbmZ1bmN0aW9uIHBhcnNlU2VxdWVuY2Uoc2VxdWVuY2UpIHtcblx0Y29uc3QgY29tbWFuZHMgPSBbXTtcblx0d2hpbGUgKHNlcXVlbmNlLmxlbmd0aCA+IDApIHtcblx0XHRjb25zdCBjb2RlID0gc2VxdWVuY2Uuc2hpZnQoKTtcblx0XHRpZiAoIWNvZGUpIGNvbnRpbnVlO1xuXHRcdGNvbnN0IGNvZGVJbnQgPSBOdW1iZXIucGFyc2VJbnQoY29kZSk7XG5cdFx0aWYgKE51bWJlci5pc05hTihjb2RlSW50KSkgY29udGludWU7XG5cdFx0aWYgKGNvZGVJbnQgPT09IDApIGNvbW1hbmRzLnB1c2goeyB0eXBlOiBcInJlc2V0QWxsXCIgfSk7XG5cdFx0ZWxzZSBpZiAoY29kZUludCA8PSA5KSB7XG5cdFx0XHRpZiAoZGVjb3JhdGlvbnNbY29kZUludF0pIGNvbW1hbmRzLnB1c2goe1xuXHRcdFx0XHR0eXBlOiBcInNldERlY29yYXRpb25cIixcblx0XHRcdFx0dmFsdWU6IGRlY29yYXRpb25zW2NvZGVJbnRdXG5cdFx0XHR9KTtcblx0XHR9IGVsc2UgaWYgKGNvZGVJbnQgPD0gMjkpIHtcblx0XHRcdGNvbnN0IGRlY29yYXRpb24gPSBkZWNvcmF0aW9uc1tjb2RlSW50IC0gMjBdO1xuXHRcdFx0aWYgKGRlY29yYXRpb24pIHtcblx0XHRcdFx0Y29tbWFuZHMucHVzaCh7XG5cdFx0XHRcdFx0dHlwZTogXCJyZXNldERlY29yYXRpb25cIixcblx0XHRcdFx0XHR2YWx1ZTogZGVjb3JhdGlvblxuXHRcdFx0XHR9KTtcblx0XHRcdFx0aWYgKGRlY29yYXRpb24gPT09IFwiZGltXCIpIGNvbW1hbmRzLnB1c2goe1xuXHRcdFx0XHRcdHR5cGU6IFwicmVzZXREZWNvcmF0aW9uXCIsXG5cdFx0XHRcdFx0dmFsdWU6IFwiYm9sZFwiXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoY29kZUludCA8PSAzNykgY29tbWFuZHMucHVzaCh7XG5cdFx0XHR0eXBlOiBcInNldEZvcmVncm91bmRDb2xvclwiLFxuXHRcdFx0dmFsdWU6IHtcblx0XHRcdFx0dHlwZTogXCJuYW1lZFwiLFxuXHRcdFx0XHRuYW1lOiBuYW1lZENvbG9yc1tjb2RlSW50IC0gMzBdXG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0ZWxzZSBpZiAoY29kZUludCA9PT0gMzgpIHtcblx0XHRcdGNvbnN0IGNvbG9yID0gcGFyc2VDb2xvcihzZXF1ZW5jZSk7XG5cdFx0XHRpZiAoY29sb3IpIGNvbW1hbmRzLnB1c2goe1xuXHRcdFx0XHR0eXBlOiBcInNldEZvcmVncm91bmRDb2xvclwiLFxuXHRcdFx0XHR2YWx1ZTogY29sb3Jcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSBpZiAoY29kZUludCA9PT0gMzkpIGNvbW1hbmRzLnB1c2goeyB0eXBlOiBcInJlc2V0Rm9yZWdyb3VuZENvbG9yXCIgfSk7XG5cdFx0ZWxzZSBpZiAoY29kZUludCA8PSA0NykgY29tbWFuZHMucHVzaCh7XG5cdFx0XHR0eXBlOiBcInNldEJhY2tncm91bmRDb2xvclwiLFxuXHRcdFx0dmFsdWU6IHtcblx0XHRcdFx0dHlwZTogXCJuYW1lZFwiLFxuXHRcdFx0XHRuYW1lOiBuYW1lZENvbG9yc1tjb2RlSW50IC0gNDBdXG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0ZWxzZSBpZiAoY29kZUludCA9PT0gNDgpIHtcblx0XHRcdGNvbnN0IGNvbG9yID0gcGFyc2VDb2xvcihzZXF1ZW5jZSk7XG5cdFx0XHRpZiAoY29sb3IpIGNvbW1hbmRzLnB1c2goe1xuXHRcdFx0XHR0eXBlOiBcInNldEJhY2tncm91bmRDb2xvclwiLFxuXHRcdFx0XHR2YWx1ZTogY29sb3Jcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSBpZiAoY29kZUludCA9PT0gNDkpIGNvbW1hbmRzLnB1c2goeyB0eXBlOiBcInJlc2V0QmFja2dyb3VuZENvbG9yXCIgfSk7XG5cdFx0ZWxzZSBpZiAoY29kZUludCA9PT0gNTMpIGNvbW1hbmRzLnB1c2goe1xuXHRcdFx0dHlwZTogXCJzZXREZWNvcmF0aW9uXCIsXG5cdFx0XHR2YWx1ZTogXCJvdmVybGluZVwiXG5cdFx0fSk7XG5cdFx0ZWxzZSBpZiAoY29kZUludCA9PT0gNTUpIGNvbW1hbmRzLnB1c2goe1xuXHRcdFx0dHlwZTogXCJyZXNldERlY29yYXRpb25cIixcblx0XHRcdHZhbHVlOiBcIm92ZXJsaW5lXCJcblx0XHR9KTtcblx0XHRlbHNlIGlmIChjb2RlSW50ID49IDkwICYmIGNvZGVJbnQgPD0gOTcpIGNvbW1hbmRzLnB1c2goe1xuXHRcdFx0dHlwZTogXCJzZXRGb3JlZ3JvdW5kQ29sb3JcIixcblx0XHRcdHZhbHVlOiB7XG5cdFx0XHRcdHR5cGU6IFwibmFtZWRcIixcblx0XHRcdFx0bmFtZTogbmFtZWRDb2xvcnNbY29kZUludCAtIDkwICsgOF1cblx0XHRcdH1cblx0XHR9KTtcblx0XHRlbHNlIGlmIChjb2RlSW50ID49IDEwMCAmJiBjb2RlSW50IDw9IDEwNykgY29tbWFuZHMucHVzaCh7XG5cdFx0XHR0eXBlOiBcInNldEJhY2tncm91bmRDb2xvclwiLFxuXHRcdFx0dmFsdWU6IHtcblx0XHRcdFx0dHlwZTogXCJuYW1lZFwiLFxuXHRcdFx0XHRuYW1lOiBuYW1lZENvbG9yc1tjb2RlSW50IC0gMTAwICsgOF1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gY29tbWFuZHM7XG59XG5mdW5jdGlvbiBjcmVhdGVBbnNpU2VxdWVuY2VQYXJzZXIoKSB7XG5cdGxldCBmb3JlZ3JvdW5kID0gbnVsbDtcblx0bGV0IGJhY2tncm91bmQgPSBudWxsO1xuXHRsZXQgZGVjb3JhdGlvbnMyID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTtcblx0cmV0dXJuIHsgcGFyc2UodmFsdWUpIHtcblx0XHRjb25zdCB0b2tlbnMgPSBbXTtcblx0XHRsZXQgcG9zaXRpb24gPSAwO1xuXHRcdGRvIHtcblx0XHRcdGNvbnN0IGZpbmRSZXN1bHQgPSBmaW5kU2VxdWVuY2UodmFsdWUsIHBvc2l0aW9uKTtcblx0XHRcdGNvbnN0IHRleHQgPSBmaW5kUmVzdWx0LnNlcXVlbmNlID8gdmFsdWUuc3Vic3RyaW5nKHBvc2l0aW9uLCBmaW5kUmVzdWx0LnN0YXJ0UG9zaXRpb24pIDogdmFsdWUuc3Vic3RyaW5nKHBvc2l0aW9uKTtcblx0XHRcdGlmICh0ZXh0Lmxlbmd0aCA+IDApIHRva2Vucy5wdXNoKHtcblx0XHRcdFx0dmFsdWU6IHRleHQsXG5cdFx0XHRcdGZvcmVncm91bmQsXG5cdFx0XHRcdGJhY2tncm91bmQsXG5cdFx0XHRcdGRlY29yYXRpb25zOiBuZXcgU2V0KGRlY29yYXRpb25zMilcblx0XHRcdH0pO1xuXHRcdFx0aWYgKGZpbmRSZXN1bHQuc2VxdWVuY2UpIHtcblx0XHRcdFx0Y29uc3QgY29tbWFuZHMgPSBwYXJzZVNlcXVlbmNlKGZpbmRSZXN1bHQuc2VxdWVuY2UpO1xuXHRcdFx0XHRmb3IgKGNvbnN0IHN0eWxlVG9rZW4gb2YgY29tbWFuZHMpIGlmIChzdHlsZVRva2VuLnR5cGUgPT09IFwicmVzZXRBbGxcIikge1xuXHRcdFx0XHRcdGZvcmVncm91bmQgPSBudWxsO1xuXHRcdFx0XHRcdGJhY2tncm91bmQgPSBudWxsO1xuXHRcdFx0XHRcdGRlY29yYXRpb25zMi5jbGVhcigpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHN0eWxlVG9rZW4udHlwZSA9PT0gXCJyZXNldEZvcmVncm91bmRDb2xvclwiKSBmb3JlZ3JvdW5kID0gbnVsbDtcblx0XHRcdFx0ZWxzZSBpZiAoc3R5bGVUb2tlbi50eXBlID09PSBcInJlc2V0QmFja2dyb3VuZENvbG9yXCIpIGJhY2tncm91bmQgPSBudWxsO1xuXHRcdFx0XHRlbHNlIGlmIChzdHlsZVRva2VuLnR5cGUgPT09IFwicmVzZXREZWNvcmF0aW9uXCIpIGRlY29yYXRpb25zMi5kZWxldGUoc3R5bGVUb2tlbi52YWx1ZSk7XG5cdFx0XHRcdGZvciAoY29uc3Qgc3R5bGVUb2tlbiBvZiBjb21tYW5kcykgaWYgKHN0eWxlVG9rZW4udHlwZSA9PT0gXCJzZXRGb3JlZ3JvdW5kQ29sb3JcIikgZm9yZWdyb3VuZCA9IHN0eWxlVG9rZW4udmFsdWU7XG5cdFx0XHRcdGVsc2UgaWYgKHN0eWxlVG9rZW4udHlwZSA9PT0gXCJzZXRCYWNrZ3JvdW5kQ29sb3JcIikgYmFja2dyb3VuZCA9IHN0eWxlVG9rZW4udmFsdWU7XG5cdFx0XHRcdGVsc2UgaWYgKHN0eWxlVG9rZW4udHlwZSA9PT0gXCJzZXREZWNvcmF0aW9uXCIpIGRlY29yYXRpb25zMi5hZGQoc3R5bGVUb2tlbi52YWx1ZSk7XG5cdFx0XHR9XG5cdFx0XHRwb3NpdGlvbiA9IGZpbmRSZXN1bHQucG9zaXRpb247XG5cdFx0fSB3aGlsZSAocG9zaXRpb24gPCB2YWx1ZS5sZW5ndGgpO1xuXHRcdHJldHVybiB0b2tlbnM7XG5cdH0gfTtcbn1cbnZhciBkZWZhdWx0TmFtZWRDb2xvcnNNYXAgPSB7XG5cdGJsYWNrOiBcIiMwMDAwMDBcIixcblx0cmVkOiBcIiNiYjAwMDBcIixcblx0Z3JlZW46IFwiIzAwYmIwMFwiLFxuXHR5ZWxsb3c6IFwiI2JiYmIwMFwiLFxuXHRibHVlOiBcIiMwMDAwYmJcIixcblx0bWFnZW50YTogXCIjZmYwMGZmXCIsXG5cdGN5YW46IFwiIzAwYmJiYlwiLFxuXHR3aGl0ZTogXCIjZWVlZWVlXCIsXG5cdGJyaWdodEJsYWNrOiBcIiM1NTU1NTVcIixcblx0YnJpZ2h0UmVkOiBcIiNmZjU1NTVcIixcblx0YnJpZ2h0R3JlZW46IFwiIzAwZmYwMFwiLFxuXHRicmlnaHRZZWxsb3c6IFwiI2ZmZmY1NVwiLFxuXHRicmlnaHRCbHVlOiBcIiM1NTU1ZmZcIixcblx0YnJpZ2h0TWFnZW50YTogXCIjZmY1NWZmXCIsXG5cdGJyaWdodEN5YW46IFwiIzU1ZmZmZlwiLFxuXHRicmlnaHRXaGl0ZTogXCIjZmZmZmZmXCJcbn07XG5mdW5jdGlvbiBjcmVhdGVDb2xvclBhbGV0dGUobmFtZWRDb2xvcnNNYXAgPSBkZWZhdWx0TmFtZWRDb2xvcnNNYXApIHtcblx0ZnVuY3Rpb24gbmFtZWRDb2xvcihuYW1lKSB7XG5cdFx0cmV0dXJuIG5hbWVkQ29sb3JzTWFwW25hbWVdO1xuXHR9XG5cdGZ1bmN0aW9uIHJnYkNvbG9yKHJnYikge1xuXHRcdHJldHVybiBgIyR7cmdiLm1hcCgoeCkgPT4gTWF0aC5tYXgoMCwgTWF0aC5taW4oeCwgMjU1KSkudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsIFwiMFwiKSkuam9pbihcIlwiKX1gO1xuXHR9XG5cdGxldCBjb2xvclRhYmxlO1xuXHRmdW5jdGlvbiBnZXRDb2xvclRhYmxlKCkge1xuXHRcdGlmIChjb2xvclRhYmxlKSByZXR1cm4gY29sb3JUYWJsZTtcblx0XHRjb2xvclRhYmxlID0gW107XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBuYW1lZENvbG9ycy5sZW5ndGg7IGkrKykgY29sb3JUYWJsZS5wdXNoKG5hbWVkQ29sb3IobmFtZWRDb2xvcnNbaV0pKTtcblx0XHRsZXQgbGV2ZWxzID0gW1xuXHRcdFx0MCxcblx0XHRcdDk1LFxuXHRcdFx0MTM1LFxuXHRcdFx0MTc1LFxuXHRcdFx0MjE1LFxuXHRcdFx0MjU1XG5cdFx0XTtcblx0XHRmb3IgKGxldCByID0gMDsgciA8IDY7IHIrKykgZm9yIChsZXQgZyA9IDA7IGcgPCA2OyBnKyspIGZvciAobGV0IGIgPSAwOyBiIDwgNjsgYisrKSBjb2xvclRhYmxlLnB1c2gocmdiQ29sb3IoW1xuXHRcdFx0bGV2ZWxzW3JdLFxuXHRcdFx0bGV2ZWxzW2ddLFxuXHRcdFx0bGV2ZWxzW2JdXG5cdFx0XSkpO1xuXHRcdGxldCBsZXZlbCA9IDg7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCAyNDsgaSsrLCBsZXZlbCArPSAxMCkgY29sb3JUYWJsZS5wdXNoKHJnYkNvbG9yKFtcblx0XHRcdGxldmVsLFxuXHRcdFx0bGV2ZWwsXG5cdFx0XHRsZXZlbFxuXHRcdF0pKTtcblx0XHRyZXR1cm4gY29sb3JUYWJsZTtcblx0fVxuXHRmdW5jdGlvbiB0YWJsZUNvbG9yKGluZGV4KSB7XG5cdFx0cmV0dXJuIGdldENvbG9yVGFibGUoKVtpbmRleF07XG5cdH1cblx0ZnVuY3Rpb24gdmFsdWUoY29sb3IpIHtcblx0XHRzd2l0Y2ggKGNvbG9yLnR5cGUpIHtcblx0XHRcdGNhc2UgXCJuYW1lZFwiOiByZXR1cm4gbmFtZWRDb2xvcihjb2xvci5uYW1lKTtcblx0XHRcdGNhc2UgXCJyZ2JcIjogcmV0dXJuIHJnYkNvbG9yKGNvbG9yLnJnYik7XG5cdFx0XHRjYXNlIFwidGFibGVcIjogcmV0dXJuIHRhYmxlQ29sb3IoY29sb3IuaW5kZXgpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4geyB2YWx1ZSB9O1xufVxuLy8jZW5kcmVnaW9uXG4vLyNyZWdpb24gc3JjL2hpZ2hsaWdodC9jb2RlLXRvLXRva2Vucy1hbnNpLnRzXG5jb25zdCBSRV9IRVhfQ09MT1IgPSAvIyhbMC05YS1mXXszLDh9KS9pO1xuY29uc3QgUkVfQ1NTX1ZBUl9BTlNJID0gL3ZhclxcKCgtLVtcXHctXSstYW5zaS1bXFx3LV0rKVxcKS87XG4vKipcbiogRGVmYXVsdCBBTlNJIHBhbGV0dGUgKFZTQ29kZSBjb21wYXRpYmxlIGZhbGxiYWNrcylcbiogVXNlZCB3aGVuIHRoZSB0aGVtZSBkb2VzIG5vdCBkZWZpbmUgdGVybWluYWwuYW5zaSogY29sb3JzLlxuKi9cbmNvbnN0IGRlZmF1bHRBbnNpQ29sb3JzID0ge1xuXHRibGFjazogXCIjMDAwMDAwXCIsXG5cdHJlZDogXCIjY2QzMTMxXCIsXG5cdGdyZWVuOiBcIiMwREJDNzlcIixcblx0eWVsbG93OiBcIiNFNUU1MTBcIixcblx0Ymx1ZTogXCIjMjQ3MkM4XCIsXG5cdG1hZ2VudGE6IFwiI0JDM0ZCQ1wiLFxuXHRjeWFuOiBcIiMxMUE4Q0RcIixcblx0d2hpdGU6IFwiI0U1RTVFNVwiLFxuXHRicmlnaHRCbGFjazogXCIjNjY2NjY2XCIsXG5cdGJyaWdodFJlZDogXCIjRjE0QzRDXCIsXG5cdGJyaWdodEdyZWVuOiBcIiMyM0QxOEJcIixcblx0YnJpZ2h0WWVsbG93OiBcIiNGNUY1NDNcIixcblx0YnJpZ2h0Qmx1ZTogXCIjM0I4RUVBXCIsXG5cdGJyaWdodE1hZ2VudGE6IFwiI0Q2NzBENlwiLFxuXHRicmlnaHRDeWFuOiBcIiMyOUI4REJcIixcblx0YnJpZ2h0V2hpdGU6IFwiI0ZGRkZGRlwiXG59O1xuZnVuY3Rpb24gdG9rZW5pemVBbnNpV2l0aFRoZW1lKHRoZW1lLCBmaWxlQ29udGVudHMsIG9wdGlvbnMpIHtcblx0Y29uc3QgY29sb3JSZXBsYWNlbWVudHMgPSByZXNvbHZlQ29sb3JSZXBsYWNlbWVudHModGhlbWUsIG9wdGlvbnMpO1xuXHRjb25zdCBsaW5lcyA9IHNwbGl0TGluZXMoZmlsZUNvbnRlbnRzKTtcblx0Y29uc3QgY29sb3JQYWxldHRlID0gY3JlYXRlQ29sb3JQYWxldHRlKE9iamVjdC5mcm9tRW50cmllcyhuYW1lZENvbG9ycy5tYXAoKG5hbWUpID0+IHtcblx0XHRjb25zdCBrZXkgPSBgdGVybWluYWwuYW5zaSR7bmFtZVswXS50b1VwcGVyQ2FzZSgpfSR7bmFtZS5zdWJzdHJpbmcoMSl9YDtcblx0XHRyZXR1cm4gW25hbWUsIHRoZW1lLmNvbG9ycz8uW2tleV0gfHwgZGVmYXVsdEFuc2lDb2xvcnNbbmFtZV1dO1xuXHR9KSkpO1xuXHRjb25zdCBwYXJzZXIgPSBjcmVhdGVBbnNpU2VxdWVuY2VQYXJzZXIoKTtcblx0cmV0dXJuIGxpbmVzLm1hcCgobGluZSkgPT4gcGFyc2VyLnBhcnNlKGxpbmVbMF0pLm1hcCgodG9rZW4pID0+IHtcblx0XHRsZXQgY29sb3I7XG5cdFx0bGV0IGJnQ29sb3I7XG5cdFx0aWYgKHRva2VuLmRlY29yYXRpb25zLmhhcyhcInJldmVyc2VcIikpIHtcblx0XHRcdGNvbG9yID0gdG9rZW4uYmFja2dyb3VuZCA/IGNvbG9yUGFsZXR0ZS52YWx1ZSh0b2tlbi5iYWNrZ3JvdW5kKSA6IHRoZW1lLmJnO1xuXHRcdFx0YmdDb2xvciA9IHRva2VuLmZvcmVncm91bmQgPyBjb2xvclBhbGV0dGUudmFsdWUodG9rZW4uZm9yZWdyb3VuZCkgOiB0aGVtZS5mZztcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29sb3IgPSB0b2tlbi5mb3JlZ3JvdW5kID8gY29sb3JQYWxldHRlLnZhbHVlKHRva2VuLmZvcmVncm91bmQpIDogdGhlbWUuZmc7XG5cdFx0XHRiZ0NvbG9yID0gdG9rZW4uYmFja2dyb3VuZCA/IGNvbG9yUGFsZXR0ZS52YWx1ZSh0b2tlbi5iYWNrZ3JvdW5kKSA6IHZvaWQgMDtcblx0XHR9XG5cdFx0Y29sb3IgPSBhcHBseUNvbG9yUmVwbGFjZW1lbnRzKGNvbG9yLCBjb2xvclJlcGxhY2VtZW50cyk7XG5cdFx0YmdDb2xvciA9IGFwcGx5Q29sb3JSZXBsYWNlbWVudHMoYmdDb2xvciwgY29sb3JSZXBsYWNlbWVudHMpO1xuXHRcdGlmICh0b2tlbi5kZWNvcmF0aW9ucy5oYXMoXCJkaW1cIikpIGNvbG9yID0gZGltQ29sb3IoY29sb3IpO1xuXHRcdGxldCBmb250U3R5bGUgPSBGb250U3R5bGUuTm9uZTtcblx0XHRpZiAodG9rZW4uZGVjb3JhdGlvbnMuaGFzKFwiYm9sZFwiKSkgZm9udFN0eWxlIHw9IEZvbnRTdHlsZS5Cb2xkO1xuXHRcdGlmICh0b2tlbi5kZWNvcmF0aW9ucy5oYXMoXCJpdGFsaWNcIikpIGZvbnRTdHlsZSB8PSBGb250U3R5bGUuSXRhbGljO1xuXHRcdGlmICh0b2tlbi5kZWNvcmF0aW9ucy5oYXMoXCJ1bmRlcmxpbmVcIikpIGZvbnRTdHlsZSB8PSBGb250U3R5bGUuVW5kZXJsaW5lO1xuXHRcdGlmICh0b2tlbi5kZWNvcmF0aW9ucy5oYXMoXCJzdHJpa2V0aHJvdWdoXCIpKSBmb250U3R5bGUgfD0gRm9udFN0eWxlLlN0cmlrZXRocm91Z2g7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGNvbnRlbnQ6IHRva2VuLnZhbHVlLFxuXHRcdFx0b2Zmc2V0OiBsaW5lWzFdLFxuXHRcdFx0Y29sb3IsXG5cdFx0XHRiZ0NvbG9yLFxuXHRcdFx0Zm9udFN0eWxlXG5cdFx0fTtcblx0fSkpO1xufVxuLyoqXG4qIEFkZHMgNTAlIGFscGhhIHRvIGEgaGV4IGNvbG9yIHN0cmluZyBvciB0aGUgXCItZGltXCIgcG9zdGZpeCB0byBhIENTUyB2YXJpYWJsZVxuKi9cbmZ1bmN0aW9uIGRpbUNvbG9yKGNvbG9yKSB7XG5cdGNvbnN0IGhleE1hdGNoID0gY29sb3IubWF0Y2goUkVfSEVYX0NPTE9SKTtcblx0aWYgKGhleE1hdGNoKSB7XG5cdFx0Y29uc3QgaGV4ID0gaGV4TWF0Y2hbMV07XG5cdFx0aWYgKGhleC5sZW5ndGggPT09IDgpIHtcblx0XHRcdGNvbnN0IGFscGhhID0gTWF0aC5yb3VuZChOdW1iZXIucGFyc2VJbnQoaGV4LnNsaWNlKDYsIDgpLCAxNikgLyAyKS50b1N0cmluZygxNikucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRcdFx0cmV0dXJuIGAjJHtoZXguc2xpY2UoMCwgNil9JHthbHBoYX1gO1xuXHRcdH0gZWxzZSBpZiAoaGV4Lmxlbmd0aCA9PT0gNikgcmV0dXJuIGAjJHtoZXh9ODBgO1xuXHRcdGVsc2UgaWYgKGhleC5sZW5ndGggPT09IDQpIHtcblx0XHRcdGNvbnN0IHIgPSBoZXhbMF07XG5cdFx0XHRjb25zdCBnID0gaGV4WzFdO1xuXHRcdFx0Y29uc3QgYiA9IGhleFsyXTtcblx0XHRcdGNvbnN0IGEgPSBoZXhbM107XG5cdFx0XHRyZXR1cm4gYCMke3J9JHtyfSR7Z30ke2d9JHtifSR7Yn0ke01hdGgucm91bmQoTnVtYmVyLnBhcnNlSW50KGAke2F9JHthfWAsIDE2KSAvIDIpLnRvU3RyaW5nKDE2KS5wYWRTdGFydCgyLCBcIjBcIil9YDtcblx0XHR9IGVsc2UgaWYgKGhleC5sZW5ndGggPT09IDMpIHtcblx0XHRcdGNvbnN0IHIgPSBoZXhbMF07XG5cdFx0XHRjb25zdCBnID0gaGV4WzFdO1xuXHRcdFx0Y29uc3QgYiA9IGhleFsyXTtcblx0XHRcdHJldHVybiBgIyR7cn0ke3J9JHtnfSR7Z30ke2J9JHtifTgwYDtcblx0XHR9XG5cdH1cblx0Y29uc3QgY3NzVmFyTWF0Y2ggPSBjb2xvci5tYXRjaChSRV9DU1NfVkFSX0FOU0kpO1xuXHRpZiAoY3NzVmFyTWF0Y2gpIHJldHVybiBgdmFyKCR7Y3NzVmFyTWF0Y2hbMV19LWRpbSlgO1xuXHRyZXR1cm4gY29sb3I7XG59XG4vLyNlbmRyZWdpb25cbi8vI3JlZ2lvbiBzcmMvaGlnaGxpZ2h0L2NvZGUtdG8tdG9rZW5zLWJhc2UudHNcbi8qKlxuKiBDb2RlIHRvIHRva2Vucywgd2l0aCBhIHNpbXBsZSB0aGVtZS5cbiogVGhpcyB3cmFwcyB0aGUgdG9rZW5pemVyJ3MgaW1wbGVtZW50YXRpb24gdG8gYWRkIEFOU0kgc3VwcG9ydC5cbiovXG5mdW5jdGlvbiBjb2RlVG9Ub2tlbnNCYXNlKHByaW1pdGl2ZSwgY29kZSwgb3B0aW9ucyA9IHt9KSB7XG5cdGNvbnN0IGxhbmcgPSBwcmltaXRpdmUucmVzb2x2ZUxhbmdBbGlhcyhvcHRpb25zLmxhbmcgfHwgXCJ0ZXh0XCIpO1xuXHRjb25zdCB7IHRoZW1lOiB0aGVtZU5hbWUgPSBwcmltaXRpdmUuZ2V0TG9hZGVkVGhlbWVzKClbMF0gfSA9IG9wdGlvbnM7XG5cdGlmICghaXNQbGFpbkxhbmcobGFuZykgJiYgIWlzTm9uZVRoZW1lKHRoZW1lTmFtZSkgJiYgbGFuZyA9PT0gXCJhbnNpXCIpIHtcblx0XHRjb25zdCB7IHRoZW1lIH0gPSBwcmltaXRpdmUuc2V0VGhlbWUodGhlbWVOYW1lKTtcblx0XHRyZXR1cm4gdG9rZW5pemVBbnNpV2l0aFRoZW1lKHRoZW1lLCBjb2RlLCBvcHRpb25zKTtcblx0fVxuXHRyZXR1cm4gY29kZVRvVG9rZW5zQmFzZSQxKHByaW1pdGl2ZSwgY29kZSwgb3B0aW9ucyk7XG59XG4vLyNlbmRyZWdpb25cbi8vI3JlZ2lvbiBzcmMvaGlnaGxpZ2h0L2NvZGUtdG8tdG9rZW5zLnRzXG4vKipcbiogSGlnaC1sZXZlbCBjb2RlLXRvLXRva2VucyBBUEkuXG4qXG4qIEl0IHdpbGwgdXNlIGBjb2RlVG9Ub2tlbnNXaXRoVGhlbWVzYCBvciBgY29kZVRvVG9rZW5zQmFzZWAgYmFzZWQgb24gdGhlIG9wdGlvbnMuXG4qL1xuZnVuY3Rpb24gY29kZVRvVG9rZW5zKHByaW1pdGl2ZSwgY29kZSwgb3B0aW9ucykge1xuXHRsZXQgYmc7XG5cdGxldCBmZztcblx0bGV0IHRva2Vucztcblx0bGV0IHRoZW1lTmFtZTtcblx0bGV0IHJvb3RTdHlsZTtcblx0bGV0IGdyYW1tYXJTdGF0ZTtcblx0aWYgKFwidGhlbWVzXCIgaW4gb3B0aW9ucykge1xuXHRcdGNvbnN0IHsgZGVmYXVsdENvbG9yID0gXCJsaWdodFwiLCBjc3NWYXJpYWJsZVByZWZpeCA9IFwiLS1zaGlraS1cIiwgY29sb3JzUmVuZGVyaW5nID0gXCJjc3MtdmFyc1wiIH0gPSBvcHRpb25zO1xuXHRcdGNvbnN0IHRoZW1lcyA9IE9iamVjdC5lbnRyaWVzKG9wdGlvbnMudGhlbWVzKS5maWx0ZXIoKGkpID0+IGlbMV0pLm1hcCgoaSkgPT4gKHtcblx0XHRcdGNvbG9yOiBpWzBdLFxuXHRcdFx0dGhlbWU6IGlbMV1cblx0XHR9KSkuc29ydCgoYSwgYikgPT4gYS5jb2xvciA9PT0gZGVmYXVsdENvbG9yID8gLTEgOiBiLmNvbG9yID09PSBkZWZhdWx0Q29sb3IgPyAxIDogMCk7XG5cdFx0aWYgKHRoZW1lcy5sZW5ndGggPT09IDApIHRocm93IG5ldyBTaGlraUVycm9yJDEoXCJgdGhlbWVzYCBvcHRpb24gbXVzdCBub3QgYmUgZW1wdHlcIik7XG5cdFx0Y29uc3QgdGhlbWVUb2tlbnMgPSBjb2RlVG9Ub2tlbnNXaXRoVGhlbWVzJDEocHJpbWl0aXZlLCBjb2RlLCBvcHRpb25zLCBjb2RlVG9Ub2tlbnNCYXNlKTtcblx0XHRncmFtbWFyU3RhdGUgPSBnZXRMYXN0R3JhbW1hclN0YXRlRnJvbU1hcCh0aGVtZVRva2Vucyk7XG5cdFx0aWYgKGRlZmF1bHRDb2xvciAmJiBcImxpZ2h0LWRhcmsoKVwiICE9PSBkZWZhdWx0Q29sb3IgJiYgIXRoZW1lcy5zb21lKCh0KSA9PiB0LmNvbG9yID09PSBkZWZhdWx0Q29sb3IpKSB0aHJvdyBuZXcgU2hpa2lFcnJvciQxKGBcXGB0aGVtZXNcXGAgb3B0aW9uIG11c3QgY29udGFpbiB0aGUgZGVmYXVsdENvbG9yIGtleSBcXGAke2RlZmF1bHRDb2xvcn1cXGBgKTtcblx0XHRjb25zdCB0aGVtZVJlZ3MgPSB0aGVtZXMubWFwKCh0KSA9PiBwcmltaXRpdmUuZ2V0VGhlbWUodC50aGVtZSkpO1xuXHRcdGNvbnN0IHRoZW1lc09yZGVyID0gdGhlbWVzLm1hcCgodCkgPT4gdC5jb2xvcik7XG5cdFx0dG9rZW5zID0gdGhlbWVUb2tlbnMubWFwKChsaW5lKSA9PiBsaW5lLm1hcCgodG9rZW4pID0+IGZsYXRUb2tlblZhcmlhbnRzKHRva2VuLCB0aGVtZXNPcmRlciwgY3NzVmFyaWFibGVQcmVmaXgsIGRlZmF1bHRDb2xvciwgY29sb3JzUmVuZGVyaW5nKSkpO1xuXHRcdGlmIChncmFtbWFyU3RhdGUpIHNldExhc3RHcmFtbWFyU3RhdGVUb01hcCh0b2tlbnMsIGdyYW1tYXJTdGF0ZSk7XG5cdFx0Y29uc3QgdGhlbWVDb2xvclJlcGxhY2VtZW50cyA9IHRoZW1lcy5tYXAoKHQpID0+IHJlc29sdmVDb2xvclJlcGxhY2VtZW50cyh0LnRoZW1lLCBvcHRpb25zKSk7XG5cdFx0ZmcgPSBtYXBUaGVtZUNvbG9ycyh0aGVtZXMsIHRoZW1lUmVncywgdGhlbWVDb2xvclJlcGxhY2VtZW50cywgY3NzVmFyaWFibGVQcmVmaXgsIGRlZmF1bHRDb2xvciwgXCJmZ1wiLCBjb2xvcnNSZW5kZXJpbmcpO1xuXHRcdGJnID0gbWFwVGhlbWVDb2xvcnModGhlbWVzLCB0aGVtZVJlZ3MsIHRoZW1lQ29sb3JSZXBsYWNlbWVudHMsIGNzc1ZhcmlhYmxlUHJlZml4LCBkZWZhdWx0Q29sb3IsIFwiYmdcIiwgY29sb3JzUmVuZGVyaW5nKTtcblx0XHR0aGVtZU5hbWUgPSBgc2hpa2ktdGhlbWVzICR7dGhlbWVSZWdzLm1hcCgodCkgPT4gdC5uYW1lKS5qb2luKFwiIFwiKX1gO1xuXHRcdHJvb3RTdHlsZSA9IGRlZmF1bHRDb2xvciA/IHZvaWQgMCA6IFtmZywgYmddLmpvaW4oXCI7XCIpO1xuXHR9IGVsc2UgaWYgKFwidGhlbWVcIiBpbiBvcHRpb25zKSB7XG5cdFx0Y29uc3QgY29sb3JSZXBsYWNlbWVudHMgPSByZXNvbHZlQ29sb3JSZXBsYWNlbWVudHMob3B0aW9ucy50aGVtZSwgb3B0aW9ucyk7XG5cdFx0dG9rZW5zID0gY29kZVRvVG9rZW5zQmFzZShwcmltaXRpdmUsIGNvZGUsIG9wdGlvbnMpO1xuXHRcdGNvbnN0IF90aGVtZSA9IHByaW1pdGl2ZS5nZXRUaGVtZShvcHRpb25zLnRoZW1lKTtcblx0XHRiZyA9IGFwcGx5Q29sb3JSZXBsYWNlbWVudHMoX3RoZW1lLmJnLCBjb2xvclJlcGxhY2VtZW50cyk7XG5cdFx0ZmcgPSBhcHBseUNvbG9yUmVwbGFjZW1lbnRzKF90aGVtZS5mZywgY29sb3JSZXBsYWNlbWVudHMpO1xuXHRcdHRoZW1lTmFtZSA9IF90aGVtZS5uYW1lO1xuXHRcdGdyYW1tYXJTdGF0ZSA9IGdldExhc3RHcmFtbWFyU3RhdGVGcm9tTWFwKHRva2Vucyk7XG5cdH0gZWxzZSB0aHJvdyBuZXcgU2hpa2lFcnJvciQxKFwiSW52YWxpZCBvcHRpb25zLCBlaXRoZXIgYHRoZW1lYCBvciBgdGhlbWVzYCBtdXN0IGJlIHByb3ZpZGVkXCIpO1xuXHRyZXR1cm4ge1xuXHRcdHRva2Vucyxcblx0XHRmZyxcblx0XHRiZyxcblx0XHR0aGVtZU5hbWUsXG5cdFx0cm9vdFN0eWxlLFxuXHRcdGdyYW1tYXJTdGF0ZVxuXHR9O1xufVxuZnVuY3Rpb24gbWFwVGhlbWVDb2xvcnModGhlbWVzLCB0aGVtZVJlZ3MsIHRoZW1lQ29sb3JSZXBsYWNlbWVudHMsIGNzc1ZhcmlhYmxlUHJlZml4LCBkZWZhdWx0Q29sb3IsIHByb3BlcnR5LCBjb2xvcnNSZW5kZXJpbmcpIHtcblx0cmV0dXJuIHRoZW1lcy5tYXAoKHQsIGlkeCkgPT4ge1xuXHRcdGNvbnN0IHZhbHVlID0gYXBwbHlDb2xvclJlcGxhY2VtZW50cyh0aGVtZVJlZ3NbaWR4XVtwcm9wZXJ0eV0sIHRoZW1lQ29sb3JSZXBsYWNlbWVudHNbaWR4XSkgfHwgXCJpbmhlcml0XCI7XG5cdFx0Y29uc3QgY3NzVmFyID0gYCR7Y3NzVmFyaWFibGVQcmVmaXggKyB0LmNvbG9yfSR7cHJvcGVydHkgPT09IFwiYmdcIiA/IFwiLWJnXCIgOiBcIlwifToke3ZhbHVlfWA7XG5cdFx0aWYgKGlkeCA9PT0gMCAmJiBkZWZhdWx0Q29sb3IpIHtcblx0XHRcdGlmIChkZWZhdWx0Q29sb3IgPT09IFwibGlnaHQtZGFyaygpXCIgJiYgdGhlbWVzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0Y29uc3QgbGlnaHRJbmRleCA9IHRoZW1lcy5maW5kSW5kZXgoKHQpID0+IHQuY29sb3IgPT09IFwibGlnaHRcIik7XG5cdFx0XHRcdGNvbnN0IGRhcmtJbmRleCA9IHRoZW1lcy5maW5kSW5kZXgoKHQpID0+IHQuY29sb3IgPT09IFwiZGFya1wiKTtcblx0XHRcdFx0aWYgKGxpZ2h0SW5kZXggPT09IC0xIHx8IGRhcmtJbmRleCA9PT0gLTEpIHRocm93IG5ldyBTaGlraUVycm9yJDEoXCJXaGVuIHVzaW5nIGBkZWZhdWx0Q29sb3I6IFxcXCJsaWdodC1kYXJrKClcXFwiYCwgeW91IG11c3QgcHJvdmlkZSBib3RoIGBsaWdodGAgYW5kIGBkYXJrYCB0aGVtZXNcIik7XG5cdFx0XHRcdHJldHVybiBgbGlnaHQtZGFyaygke2FwcGx5Q29sb3JSZXBsYWNlbWVudHModGhlbWVSZWdzW2xpZ2h0SW5kZXhdW3Byb3BlcnR5XSwgdGhlbWVDb2xvclJlcGxhY2VtZW50c1tsaWdodEluZGV4XSkgfHwgXCJpbmhlcml0XCJ9LCAke2FwcGx5Q29sb3JSZXBsYWNlbWVudHModGhlbWVSZWdzW2RhcmtJbmRleF1bcHJvcGVydHldLCB0aGVtZUNvbG9yUmVwbGFjZW1lbnRzW2RhcmtJbmRleF0pIHx8IFwiaW5oZXJpdFwifSk7JHtjc3NWYXJ9YDtcblx0XHRcdH1cblx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHR9XG5cdFx0aWYgKGNvbG9yc1JlbmRlcmluZyA9PT0gXCJjc3MtdmFyc1wiKSByZXR1cm4gY3NzVmFyO1xuXHRcdHJldHVybiBudWxsO1xuXHR9KS5maWx0ZXIoKGkpID0+ICEhaSkuam9pbihcIjtcIik7XG59XG4vLyNlbmRyZWdpb25cbi8vI3JlZ2lvbiBzcmMvaGlnaGxpZ2h0L2NvZGUtdG8taGFzdC50c1xuY29uc3QgUkVfV0hJVEVTUEFDRV9PTkxZID0gL15cXHMrJC87XG5jb25zdCBSRV9MRUFESU5HX1RSQUlMSU5HX1dISVRFU1BBQ0UgPSAvXihcXHMqKSguKj8pKFxccyopJC87XG5mdW5jdGlvbiBjb2RlVG9IYXN0KHByaW1pdGl2ZSwgY29kZSwgb3B0aW9ucywgdHJhbnNmb3JtZXJDb250ZXh0ID0ge1xuXHRtZXRhOiB7fSxcblx0b3B0aW9ucyxcblx0Y29kZVRvSGFzdDogKF9jb2RlLCBfb3B0aW9ucykgPT4gY29kZVRvSGFzdChwcmltaXRpdmUsIF9jb2RlLCBfb3B0aW9ucyksXG5cdGNvZGVUb1Rva2VuczogKF9jb2RlLCBfb3B0aW9ucykgPT4gY29kZVRvVG9rZW5zKHByaW1pdGl2ZSwgX2NvZGUsIF9vcHRpb25zKVxufSkge1xuXHRsZXQgaW5wdXQgPSBjb2RlO1xuXHRmb3IgKGNvbnN0IHRyYW5zZm9ybWVyIG9mIGdldFRyYW5zZm9ybWVycyhvcHRpb25zKSkgaW5wdXQgPSB0cmFuc2Zvcm1lci5wcmVwcm9jZXNzPy5jYWxsKHRyYW5zZm9ybWVyQ29udGV4dCwgaW5wdXQsIG9wdGlvbnMpIHx8IGlucHV0O1xuXHRsZXQgeyB0b2tlbnMsIGZnLCBiZywgdGhlbWVOYW1lLCByb290U3R5bGUsIGdyYW1tYXJTdGF0ZSB9ID0gY29kZVRvVG9rZW5zKHByaW1pdGl2ZSwgaW5wdXQsIG9wdGlvbnMpO1xuXHRjb25zdCB7IG1lcmdlV2hpdGVzcGFjZXMgPSB0cnVlLCBtZXJnZVNhbWVTdHlsZVRva2VucyA9IGZhbHNlIH0gPSBvcHRpb25zO1xuXHRpZiAobWVyZ2VXaGl0ZXNwYWNlcyA9PT0gdHJ1ZSkgdG9rZW5zID0gbWVyZ2VXaGl0ZXNwYWNlVG9rZW5zKHRva2Vucyk7XG5cdGVsc2UgaWYgKG1lcmdlV2hpdGVzcGFjZXMgPT09IFwibmV2ZXJcIikgdG9rZW5zID0gc3BsaXRXaGl0ZXNwYWNlVG9rZW5zKHRva2Vucyk7XG5cdGlmIChtZXJnZVNhbWVTdHlsZVRva2VucykgdG9rZW5zID0gbWVyZ2VBZGphY2VudFN0eWxlZFRva2Vucyh0b2tlbnMpO1xuXHRjb25zdCBjb250ZXh0U291cmNlID0ge1xuXHRcdC4uLnRyYW5zZm9ybWVyQ29udGV4dCxcblx0XHRnZXQgc291cmNlKCkge1xuXHRcdFx0cmV0dXJuIGlucHV0O1xuXHRcdH1cblx0fTtcblx0Zm9yIChjb25zdCB0cmFuc2Zvcm1lciBvZiBnZXRUcmFuc2Zvcm1lcnMob3B0aW9ucykpIHRva2VucyA9IHRyYW5zZm9ybWVyLnRva2Vucz8uY2FsbChjb250ZXh0U291cmNlLCB0b2tlbnMpIHx8IHRva2Vucztcblx0cmV0dXJuIHRva2Vuc1RvSGFzdCh0b2tlbnMsIHtcblx0XHQuLi5vcHRpb25zLFxuXHRcdGZnLFxuXHRcdGJnLFxuXHRcdHRoZW1lTmFtZSxcblx0XHRyb290U3R5bGU6IG9wdGlvbnMucm9vdFN0eWxlID09PSBmYWxzZSA/IGZhbHNlIDogb3B0aW9ucy5yb290U3R5bGUgPz8gcm9vdFN0eWxlXG5cdH0sIGNvbnRleHRTb3VyY2UsIGdyYW1tYXJTdGF0ZSk7XG59XG5mdW5jdGlvbiB0b2tlbnNUb0hhc3QodG9rZW5zLCBvcHRpb25zLCB0cmFuc2Zvcm1lckNvbnRleHQsIGdyYW1tYXJTdGF0ZSA9IGdldExhc3RHcmFtbWFyU3RhdGVGcm9tTWFwKHRva2VucykpIHtcblx0Y29uc3QgdHJhbnNmb3JtZXJzID0gZ2V0VHJhbnNmb3JtZXJzKG9wdGlvbnMpO1xuXHRjb25zdCBsaW5lcyA9IFtdO1xuXHRjb25zdCByb290ID0ge1xuXHRcdHR5cGU6IFwicm9vdFwiLFxuXHRcdGNoaWxkcmVuOiBbXVxuXHR9O1xuXHRjb25zdCB7IHN0cnVjdHVyZSA9IFwiY2xhc3NpY1wiLCB0YWJpbmRleCA9IFwiMFwiIH0gPSBvcHRpb25zO1xuXHRjb25zdCBwcm9wZXJ0aWVzID0geyBjbGFzczogYHNoaWtpICR7b3B0aW9ucy50aGVtZU5hbWUgfHwgXCJcIn1gIH07XG5cdGlmIChvcHRpb25zLnJvb3RTdHlsZSAhPT0gZmFsc2UpIGlmIChvcHRpb25zLnJvb3RTdHlsZSAhPSBudWxsKSBwcm9wZXJ0aWVzLnN0eWxlID0gb3B0aW9ucy5yb290U3R5bGU7XG5cdGVsc2UgcHJvcGVydGllcy5zdHlsZSA9IGBiYWNrZ3JvdW5kLWNvbG9yOiR7b3B0aW9ucy5iZ307Y29sb3I6JHtvcHRpb25zLmZnfWA7XG5cdGlmICh0YWJpbmRleCAhPT0gZmFsc2UgJiYgdGFiaW5kZXggIT0gbnVsbCkgcHJvcGVydGllcy50YWJpbmRleCA9IHRhYmluZGV4LnRvU3RyaW5nKCk7XG5cdGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKG9wdGlvbnMubWV0YSB8fCB7fSkpIGlmICgha2V5LnN0YXJ0c1dpdGgoXCJfXCIpKSBwcm9wZXJ0aWVzW2tleV0gPSB2YWx1ZTtcblx0bGV0IHByZU5vZGUgPSB7XG5cdFx0dHlwZTogXCJlbGVtZW50XCIsXG5cdFx0dGFnTmFtZTogXCJwcmVcIixcblx0XHRwcm9wZXJ0aWVzLFxuXHRcdGNoaWxkcmVuOiBbXSxcblx0XHRkYXRhOiBvcHRpb25zLmRhdGFcblx0fTtcblx0bGV0IGNvZGVOb2RlID0ge1xuXHRcdHR5cGU6IFwiZWxlbWVudFwiLFxuXHRcdHRhZ05hbWU6IFwiY29kZVwiLFxuXHRcdHByb3BlcnRpZXM6IHt9LFxuXHRcdGNoaWxkcmVuOiBsaW5lc1xuXHR9O1xuXHRjb25zdCBsaW5lTm9kZXMgPSBbXTtcblx0Y29uc3QgY29udGV4dCA9IHtcblx0XHQuLi50cmFuc2Zvcm1lckNvbnRleHQsXG5cdFx0c3RydWN0dXJlLFxuXHRcdGFkZENsYXNzVG9IYXN0LFxuXHRcdGdldCBzb3VyY2UoKSB7XG5cdFx0XHRyZXR1cm4gdHJhbnNmb3JtZXJDb250ZXh0LnNvdXJjZTtcblx0XHR9LFxuXHRcdGdldCB0b2tlbnMoKSB7XG5cdFx0XHRyZXR1cm4gdG9rZW5zO1xuXHRcdH0sXG5cdFx0Z2V0IG9wdGlvbnMoKSB7XG5cdFx0XHRyZXR1cm4gb3B0aW9ucztcblx0XHR9LFxuXHRcdGdldCByb290KCkge1xuXHRcdFx0cmV0dXJuIHJvb3Q7XG5cdFx0fSxcblx0XHRnZXQgcHJlKCkge1xuXHRcdFx0cmV0dXJuIHByZU5vZGU7XG5cdFx0fSxcblx0XHRnZXQgY29kZSgpIHtcblx0XHRcdHJldHVybiBjb2RlTm9kZTtcblx0XHR9LFxuXHRcdGdldCBsaW5lcygpIHtcblx0XHRcdHJldHVybiBsaW5lTm9kZXM7XG5cdFx0fVxuXHR9O1xuXHR0b2tlbnMuZm9yRWFjaCgobGluZSwgaWR4KSA9PiB7XG5cdFx0aWYgKGlkeCkge1xuXHRcdFx0aWYgKHN0cnVjdHVyZSA9PT0gXCJpbmxpbmVcIikgcm9vdC5jaGlsZHJlbi5wdXNoKHtcblx0XHRcdFx0dHlwZTogXCJlbGVtZW50XCIsXG5cdFx0XHRcdHRhZ05hbWU6IFwiYnJcIixcblx0XHRcdFx0cHJvcGVydGllczoge30sXG5cdFx0XHRcdGNoaWxkcmVuOiBbXVxuXHRcdFx0fSk7XG5cdFx0XHRlbHNlIGlmIChzdHJ1Y3R1cmUgPT09IFwiY2xhc3NpY1wiKSBsaW5lcy5wdXNoKHtcblx0XHRcdFx0dHlwZTogXCJ0ZXh0XCIsXG5cdFx0XHRcdHZhbHVlOiBcIlxcblwiXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0bGV0IGxpbmVOb2RlID0ge1xuXHRcdFx0dHlwZTogXCJlbGVtZW50XCIsXG5cdFx0XHR0YWdOYW1lOiBcInNwYW5cIixcblx0XHRcdHByb3BlcnRpZXM6IHsgY2xhc3M6IFwibGluZVwiIH0sXG5cdFx0XHRjaGlsZHJlbjogW11cblx0XHR9O1xuXHRcdGxldCBjb2wgPSAwO1xuXHRcdGZvciAoY29uc3QgdG9rZW4gb2YgbGluZSkge1xuXHRcdFx0bGV0IHRva2VuTm9kZSA9IHtcblx0XHRcdFx0dHlwZTogXCJlbGVtZW50XCIsXG5cdFx0XHRcdHRhZ05hbWU6IFwic3BhblwiLFxuXHRcdFx0XHRwcm9wZXJ0aWVzOiB7IC4uLnRva2VuLmh0bWxBdHRycyB9LFxuXHRcdFx0XHRjaGlsZHJlbjogW3tcblx0XHRcdFx0XHR0eXBlOiBcInRleHRcIixcblx0XHRcdFx0XHR2YWx1ZTogdG9rZW4uY29udGVudFxuXHRcdFx0XHR9XVxuXHRcdFx0fTtcblx0XHRcdGNvbnN0IHN0eWxlID0gc3RyaW5naWZ5VG9rZW5TdHlsZSh0b2tlbi5odG1sU3R5bGUgfHwgZ2V0VG9rZW5TdHlsZU9iamVjdCh0b2tlbikpO1xuXHRcdFx0aWYgKHN0eWxlKSB0b2tlbk5vZGUucHJvcGVydGllcy5zdHlsZSA9IHN0eWxlO1xuXHRcdFx0Zm9yIChjb25zdCB0cmFuc2Zvcm1lciBvZiB0cmFuc2Zvcm1lcnMpIHRva2VuTm9kZSA9IHRyYW5zZm9ybWVyPy5zcGFuPy5jYWxsKGNvbnRleHQsIHRva2VuTm9kZSwgaWR4ICsgMSwgY29sLCBsaW5lTm9kZSwgdG9rZW4pIHx8IHRva2VuTm9kZTtcblx0XHRcdGlmIChzdHJ1Y3R1cmUgPT09IFwiaW5saW5lXCIpIHJvb3QuY2hpbGRyZW4ucHVzaCh0b2tlbk5vZGUpO1xuXHRcdFx0ZWxzZSBpZiAoc3RydWN0dXJlID09PSBcImNsYXNzaWNcIikgbGluZU5vZGUuY2hpbGRyZW4ucHVzaCh0b2tlbk5vZGUpO1xuXHRcdFx0Y29sICs9IHRva2VuLmNvbnRlbnQubGVuZ3RoO1xuXHRcdH1cblx0XHRpZiAoc3RydWN0dXJlID09PSBcImNsYXNzaWNcIikge1xuXHRcdFx0Zm9yIChjb25zdCB0cmFuc2Zvcm1lciBvZiB0cmFuc2Zvcm1lcnMpIGxpbmVOb2RlID0gdHJhbnNmb3JtZXI/LmxpbmU/LmNhbGwoY29udGV4dCwgbGluZU5vZGUsIGlkeCArIDEpIHx8IGxpbmVOb2RlO1xuXHRcdFx0bGluZU5vZGVzLnB1c2gobGluZU5vZGUpO1xuXHRcdFx0bGluZXMucHVzaChsaW5lTm9kZSk7XG5cdFx0fSBlbHNlIGlmIChzdHJ1Y3R1cmUgPT09IFwiaW5saW5lXCIpIGxpbmVOb2Rlcy5wdXNoKGxpbmVOb2RlKTtcblx0fSk7XG5cdGlmIChzdHJ1Y3R1cmUgPT09IFwiY2xhc3NpY1wiKSB7XG5cdFx0Zm9yIChjb25zdCB0cmFuc2Zvcm1lciBvZiB0cmFuc2Zvcm1lcnMpIGNvZGVOb2RlID0gdHJhbnNmb3JtZXI/LmNvZGU/LmNhbGwoY29udGV4dCwgY29kZU5vZGUpIHx8IGNvZGVOb2RlO1xuXHRcdHByZU5vZGUuY2hpbGRyZW4ucHVzaChjb2RlTm9kZSk7XG5cdFx0Zm9yIChjb25zdCB0cmFuc2Zvcm1lciBvZiB0cmFuc2Zvcm1lcnMpIHByZU5vZGUgPSB0cmFuc2Zvcm1lcj8ucHJlPy5jYWxsKGNvbnRleHQsIHByZU5vZGUpIHx8IHByZU5vZGU7XG5cdFx0cm9vdC5jaGlsZHJlbi5wdXNoKHByZU5vZGUpO1xuXHR9IGVsc2UgaWYgKHN0cnVjdHVyZSA9PT0gXCJpbmxpbmVcIikge1xuXHRcdGNvbnN0IHN5bnRoZXRpY0xpbmVzID0gW107XG5cdFx0bGV0IGN1cnJlbnRMaW5lID0ge1xuXHRcdFx0dHlwZTogXCJlbGVtZW50XCIsXG5cdFx0XHR0YWdOYW1lOiBcInNwYW5cIixcblx0XHRcdHByb3BlcnRpZXM6IHsgY2xhc3M6IFwibGluZVwiIH0sXG5cdFx0XHRjaGlsZHJlbjogW11cblx0XHR9O1xuXHRcdGZvciAoY29uc3QgY2hpbGQgb2Ygcm9vdC5jaGlsZHJlbikgaWYgKGNoaWxkLnR5cGUgPT09IFwiZWxlbWVudFwiICYmIGNoaWxkLnRhZ05hbWUgPT09IFwiYnJcIikge1xuXHRcdFx0c3ludGhldGljTGluZXMucHVzaChjdXJyZW50TGluZSk7XG5cdFx0XHRjdXJyZW50TGluZSA9IHtcblx0XHRcdFx0dHlwZTogXCJlbGVtZW50XCIsXG5cdFx0XHRcdHRhZ05hbWU6IFwic3BhblwiLFxuXHRcdFx0XHRwcm9wZXJ0aWVzOiB7IGNsYXNzOiBcImxpbmVcIiB9LFxuXHRcdFx0XHRjaGlsZHJlbjogW11cblx0XHRcdH07XG5cdFx0fSBlbHNlIGlmIChjaGlsZC50eXBlID09PSBcImVsZW1lbnRcIiB8fCBjaGlsZC50eXBlID09PSBcInRleHRcIikgY3VycmVudExpbmUuY2hpbGRyZW4ucHVzaChjaGlsZCk7XG5cdFx0c3ludGhldGljTGluZXMucHVzaChjdXJyZW50TGluZSk7XG5cdFx0bGV0IHRyYW5zZm9ybWVkQ29kZSA9IHtcblx0XHRcdHR5cGU6IFwiZWxlbWVudFwiLFxuXHRcdFx0dGFnTmFtZTogXCJjb2RlXCIsXG5cdFx0XHRwcm9wZXJ0aWVzOiB7fSxcblx0XHRcdGNoaWxkcmVuOiBzeW50aGV0aWNMaW5lc1xuXHRcdH07XG5cdFx0Zm9yIChjb25zdCB0cmFuc2Zvcm1lciBvZiB0cmFuc2Zvcm1lcnMpIHRyYW5zZm9ybWVkQ29kZSA9IHRyYW5zZm9ybWVyPy5jb2RlPy5jYWxsKGNvbnRleHQsIHRyYW5zZm9ybWVkQ29kZSkgfHwgdHJhbnNmb3JtZWRDb2RlO1xuXHRcdHJvb3QuY2hpbGRyZW4gPSBbXTtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRyYW5zZm9ybWVkQ29kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKGkgPiAwKSByb290LmNoaWxkcmVuLnB1c2goe1xuXHRcdFx0XHR0eXBlOiBcImVsZW1lbnRcIixcblx0XHRcdFx0dGFnTmFtZTogXCJiclwiLFxuXHRcdFx0XHRwcm9wZXJ0aWVzOiB7fSxcblx0XHRcdFx0Y2hpbGRyZW46IFtdXG5cdFx0XHR9KTtcblx0XHRcdGNvbnN0IGxpbmUgPSB0cmFuc2Zvcm1lZENvZGUuY2hpbGRyZW5baV07XG5cdFx0XHRpZiAobGluZS50eXBlID09PSBcImVsZW1lbnRcIikgcm9vdC5jaGlsZHJlbi5wdXNoKC4uLmxpbmUuY2hpbGRyZW4pO1xuXHRcdH1cblx0fVxuXHRsZXQgcmVzdWx0ID0gcm9vdDtcblx0Zm9yIChjb25zdCB0cmFuc2Zvcm1lciBvZiB0cmFuc2Zvcm1lcnMpIHJlc3VsdCA9IHRyYW5zZm9ybWVyPy5yb290Py5jYWxsKGNvbnRleHQsIHJlc3VsdCkgfHwgcmVzdWx0O1xuXHRpZiAoZ3JhbW1hclN0YXRlKSBzZXRMYXN0R3JhbW1hclN0YXRlVG9NYXAocmVzdWx0LCBncmFtbWFyU3RhdGUpO1xuXHRyZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gbWVyZ2VXaGl0ZXNwYWNlVG9rZW5zKHRva2Vucykge1xuXHRyZXR1cm4gdG9rZW5zLm1hcCgobGluZSkgPT4ge1xuXHRcdGNvbnN0IG5ld0xpbmUgPSBbXTtcblx0XHRsZXQgY2FycnlPbkNvbnRlbnQgPSBcIlwiO1xuXHRcdGxldCBmaXJzdE9mZnNldDtcblx0XHRsaW5lLmZvckVhY2goKHRva2VuLCBpZHgpID0+IHtcblx0XHRcdGNvbnN0IGNvdWxkTWVyZ2UgPSAhKHRva2VuLmZvbnRTdHlsZSAmJiAodG9rZW4uZm9udFN0eWxlICYgRm9udFN0eWxlLlVuZGVybGluZSB8fCB0b2tlbi5mb250U3R5bGUgJiBGb250U3R5bGUuU3RyaWtldGhyb3VnaCkpO1xuXHRcdFx0aWYgKGNvdWxkTWVyZ2UgJiYgUkVfV0hJVEVTUEFDRV9PTkxZLnRlc3QodG9rZW4uY29udGVudCkgJiYgbGluZVtpZHggKyAxXSkge1xuXHRcdFx0XHRpZiAoZmlyc3RPZmZzZXQgPT09IHZvaWQgMCkgZmlyc3RPZmZzZXQgPSB0b2tlbi5vZmZzZXQ7XG5cdFx0XHRcdGNhcnJ5T25Db250ZW50ICs9IHRva2VuLmNvbnRlbnQ7XG5cdFx0XHR9IGVsc2UgaWYgKGNhcnJ5T25Db250ZW50KSB7XG5cdFx0XHRcdGlmIChjb3VsZE1lcmdlKSBuZXdMaW5lLnB1c2goe1xuXHRcdFx0XHRcdC4uLnRva2VuLFxuXHRcdFx0XHRcdG9mZnNldDogZmlyc3RPZmZzZXQsXG5cdFx0XHRcdFx0Y29udGVudDogY2FycnlPbkNvbnRlbnQgKyB0b2tlbi5jb250ZW50XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRlbHNlIG5ld0xpbmUucHVzaCh7XG5cdFx0XHRcdFx0Y29udGVudDogY2FycnlPbkNvbnRlbnQsXG5cdFx0XHRcdFx0b2Zmc2V0OiBmaXJzdE9mZnNldFxuXHRcdFx0XHR9LCB0b2tlbik7XG5cdFx0XHRcdGZpcnN0T2Zmc2V0ID0gdm9pZCAwO1xuXHRcdFx0XHRjYXJyeU9uQ29udGVudCA9IFwiXCI7XG5cdFx0XHR9IGVsc2UgbmV3TGluZS5wdXNoKHRva2VuKTtcblx0XHR9KTtcblx0XHRyZXR1cm4gbmV3TGluZTtcblx0fSk7XG59XG5mdW5jdGlvbiBzcGxpdFdoaXRlc3BhY2VUb2tlbnModG9rZW5zKSB7XG5cdHJldHVybiB0b2tlbnMubWFwKChsaW5lKSA9PiB7XG5cdFx0cmV0dXJuIGxpbmUuZmxhdE1hcCgodG9rZW4pID0+IHtcblx0XHRcdGlmIChSRV9XSElURVNQQUNFX09OTFkudGVzdCh0b2tlbi5jb250ZW50KSkgcmV0dXJuIHRva2VuO1xuXHRcdFx0Y29uc3QgbWF0Y2ggPSB0b2tlbi5jb250ZW50Lm1hdGNoKFJFX0xFQURJTkdfVFJBSUxJTkdfV0hJVEVTUEFDRSk7XG5cdFx0XHRpZiAoIW1hdGNoKSByZXR1cm4gdG9rZW47XG5cdFx0XHRjb25zdCBbLCBsZWFkaW5nLCBjb250ZW50LCB0cmFpbGluZ10gPSBtYXRjaDtcblx0XHRcdGlmICghbGVhZGluZyAmJiAhdHJhaWxpbmcpIHJldHVybiB0b2tlbjtcblx0XHRcdGNvbnN0IGV4cGFuZGVkID0gW3tcblx0XHRcdFx0Li4udG9rZW4sXG5cdFx0XHRcdG9mZnNldDogdG9rZW4ub2Zmc2V0ICsgbGVhZGluZy5sZW5ndGgsXG5cdFx0XHRcdGNvbnRlbnRcblx0XHRcdH1dO1xuXHRcdFx0aWYgKGxlYWRpbmcpIGV4cGFuZGVkLnVuc2hpZnQoe1xuXHRcdFx0XHRjb250ZW50OiBsZWFkaW5nLFxuXHRcdFx0XHRvZmZzZXQ6IHRva2VuLm9mZnNldFxuXHRcdFx0fSk7XG5cdFx0XHRpZiAodHJhaWxpbmcpIGV4cGFuZGVkLnB1c2goe1xuXHRcdFx0XHRjb250ZW50OiB0cmFpbGluZyxcblx0XHRcdFx0b2Zmc2V0OiB0b2tlbi5vZmZzZXQgKyBsZWFkaW5nLmxlbmd0aCArIGNvbnRlbnQubGVuZ3RoXG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBleHBhbmRlZDtcblx0XHR9KTtcblx0fSk7XG59XG5mdW5jdGlvbiBtZXJnZUFkamFjZW50U3R5bGVkVG9rZW5zKHRva2Vucykge1xuXHRyZXR1cm4gdG9rZW5zLm1hcCgobGluZSkgPT4ge1xuXHRcdGNvbnN0IG5ld0xpbmUgPSBbXTtcblx0XHRmb3IgKGNvbnN0IHRva2VuIG9mIGxpbmUpIHtcblx0XHRcdGlmIChuZXdMaW5lLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRuZXdMaW5lLnB1c2goeyAuLi50b2tlbiB9KTtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBwcmV2VG9rZW4gPSBuZXdMaW5lLmF0KC0xKTtcblx0XHRcdGNvbnN0IHByZXZTdHlsZSA9IHN0cmluZ2lmeVRva2VuU3R5bGUocHJldlRva2VuLmh0bWxTdHlsZSB8fCBnZXRUb2tlblN0eWxlT2JqZWN0KHByZXZUb2tlbikpO1xuXHRcdFx0Y29uc3QgY3VycmVudFN0eWxlID0gc3RyaW5naWZ5VG9rZW5TdHlsZSh0b2tlbi5odG1sU3R5bGUgfHwgZ2V0VG9rZW5TdHlsZU9iamVjdCh0b2tlbikpO1xuXHRcdFx0Y29uc3QgaXNQcmV2RGVjb3JhdGVkID0gcHJldlRva2VuLmZvbnRTdHlsZSAmJiAocHJldlRva2VuLmZvbnRTdHlsZSAmIEZvbnRTdHlsZS5VbmRlcmxpbmUgfHwgcHJldlRva2VuLmZvbnRTdHlsZSAmIEZvbnRTdHlsZS5TdHJpa2V0aHJvdWdoKTtcblx0XHRcdGNvbnN0IGlzRGVjb3JhdGVkID0gdG9rZW4uZm9udFN0eWxlICYmICh0b2tlbi5mb250U3R5bGUgJiBGb250U3R5bGUuVW5kZXJsaW5lIHx8IHRva2VuLmZvbnRTdHlsZSAmIEZvbnRTdHlsZS5TdHJpa2V0aHJvdWdoKTtcblx0XHRcdGlmICghaXNQcmV2RGVjb3JhdGVkICYmICFpc0RlY29yYXRlZCAmJiBwcmV2U3R5bGUgPT09IGN1cnJlbnRTdHlsZSkgcHJldlRva2VuLmNvbnRlbnQgKz0gdG9rZW4uY29udGVudDtcblx0XHRcdGVsc2UgbmV3TGluZS5wdXNoKHsgLi4udG9rZW4gfSk7XG5cdFx0fVxuXHRcdHJldHVybiBuZXdMaW5lO1xuXHR9KTtcbn1cbi8vI2VuZHJlZ2lvblxuLy8jcmVnaW9uIHNyYy9oaWdobGlnaHQvY29kZS10by1odG1sLnRzXG5jb25zdCBoYXN0VG9IdG1sID0gdG9IdG1sO1xuLyoqXG4qIEdldCBoaWdobGlnaHRlZCBjb2RlIGluIEhUTUwuXG4qL1xuZnVuY3Rpb24gY29kZVRvSHRtbChwcmltaXRpdmUsIGNvZGUsIG9wdGlvbnMpIHtcblx0Y29uc3QgY29udGV4dCA9IHtcblx0XHRtZXRhOiB7fSxcblx0XHRvcHRpb25zLFxuXHRcdGNvZGVUb0hhc3Q6IChfY29kZSwgX29wdGlvbnMpID0+IGNvZGVUb0hhc3QocHJpbWl0aXZlLCBfY29kZSwgX29wdGlvbnMpLFxuXHRcdGNvZGVUb1Rva2VuczogKF9jb2RlLCBfb3B0aW9ucykgPT4gY29kZVRvVG9rZW5zKHByaW1pdGl2ZSwgX2NvZGUsIF9vcHRpb25zKVxuXHR9O1xuXHRsZXQgcmVzdWx0ID0gaGFzdFRvSHRtbChjb2RlVG9IYXN0KHByaW1pdGl2ZSwgY29kZSwgb3B0aW9ucywgY29udGV4dCkpO1xuXHRmb3IgKGNvbnN0IHRyYW5zZm9ybWVyIG9mIGdldFRyYW5zZm9ybWVycyhvcHRpb25zKSkgcmVzdWx0ID0gdHJhbnNmb3JtZXIucG9zdHByb2Nlc3M/LmNhbGwoY29udGV4dCwgcmVzdWx0LCBvcHRpb25zKSB8fCByZXN1bHQ7XG5cdHJldHVybiByZXN1bHQ7XG59XG4vLyNlbmRyZWdpb25cbi8vI3JlZ2lvbiBzcmMvY29uc3RydWN0b3JzL2hpZ2hsaWdodGVyLnRzXG4vKipcbiogQ3JlYXRlIGEgU2hpa2kgY29yZSBoaWdobGlnaHRlciBpbnN0YW5jZSwgd2l0aCBubyBsYW5ndWFnZXMgb3IgdGhlbWVzIGJ1bmRsZWQuXG4qIFdhc20gYW5kIGVhY2ggbGFuZ3VhZ2UgYW5kIHRoZW1lIG11c3QgYmUgbG9hZGVkIG1hbnVhbGx5LlxuKlxuKiBAc2VlIGh0dHA6Ly9zaGlraS5zdHlsZS9ndWlkZS9idW5kbGVzI2ZpbmUtZ3JhaW5lZC1idW5kbGVcbiovXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVIaWdobGlnaHRlckNvcmUob3B0aW9ucykge1xuXHRjb25zdCBwcmltaXRpdmUgPSBhd2FpdCBjcmVhdGVTaGlraVByaW1pdGl2ZUFzeW5jJDEob3B0aW9ucyk7XG5cdHJldHVybiB7XG5cdFx0Z2V0TGFzdEdyYW1tYXJTdGF0ZTogKC4uLmFyZ3MpID0+IGdldExhc3RHcmFtbWFyU3RhdGUocHJpbWl0aXZlLCAuLi5hcmdzKSxcblx0XHRjb2RlVG9Ub2tlbnNCYXNlOiAoY29kZSwgb3B0aW9ucykgPT4gY29kZVRvVG9rZW5zQmFzZShwcmltaXRpdmUsIGNvZGUsIG9wdGlvbnMpLFxuXHRcdGNvZGVUb1Rva2Vuc1dpdGhUaGVtZXM6IChjb2RlLCBvcHRpb25zKSA9PiBjb2RlVG9Ub2tlbnNXaXRoVGhlbWVzJDEocHJpbWl0aXZlLCBjb2RlLCBvcHRpb25zKSxcblx0XHRjb2RlVG9Ub2tlbnM6IChjb2RlLCBvcHRpb25zKSA9PiBjb2RlVG9Ub2tlbnMocHJpbWl0aXZlLCBjb2RlLCBvcHRpb25zKSxcblx0XHRjb2RlVG9IYXN0OiAoY29kZSwgb3B0aW9ucykgPT4gY29kZVRvSGFzdChwcmltaXRpdmUsIGNvZGUsIG9wdGlvbnMpLFxuXHRcdGNvZGVUb0h0bWw6IChjb2RlLCBvcHRpb25zKSA9PiBjb2RlVG9IdG1sKHByaW1pdGl2ZSwgY29kZSwgb3B0aW9ucyksXG5cdFx0Z2V0QnVuZGxlZExhbmd1YWdlczogKCkgPT4gKHt9KSxcblx0XHRnZXRCdW5kbGVkVGhlbWVzOiAoKSA9PiAoe30pLFxuXHRcdC4uLnByaW1pdGl2ZSxcblx0XHRnZXRJbnRlcm5hbENvbnRleHQ6ICgpID0+IHByaW1pdGl2ZVxuXHR9O1xufVxuLyoqXG4qIENyZWF0ZSBhIFNoaWtpIGNvcmUgaGlnaGxpZ2h0ZXIgaW5zdGFuY2UsIHdpdGggbm8gbGFuZ3VhZ2VzIG9yIHRoZW1lcyBidW5kbGVkLlxuKiBXYXNtIGFuZCBlYWNoIGxhbmd1YWdlIGFuZCB0aGVtZSBtdXN0IGJlIGxvYWRlZCBtYW51YWxseS5cbipcbiogU3luY2hyb25vdXMgdmVyc2lvbiBvZiBgY3JlYXRlSGlnaGxpZ2h0ZXJDb3JlYCwgd2hpY2ggcmVxdWlyZXMgdG8gcHJvdmlkZSB0aGUgZW5naW5lIGFuZCBhbGwgdGhlbWVzIGFuZCBsYW5ndWFnZXMgdXBmcm9udC5cbipcbiogQHNlZSBodHRwOi8vc2hpa2kuc3R5bGUvZ3VpZGUvYnVuZGxlcyNmaW5lLWdyYWluZWQtYnVuZGxlXG4qL1xuZnVuY3Rpb24gY3JlYXRlSGlnaGxpZ2h0ZXJDb3JlU3luYyhvcHRpb25zKSB7XG5cdGNvbnN0IGludGVybmFsID0gY3JlYXRlU2hpa2lQcmltaXRpdmUkMShvcHRpb25zKTtcblx0cmV0dXJuIHtcblx0XHRnZXRMYXN0R3JhbW1hclN0YXRlOiAoLi4uYXJncykgPT4gZ2V0TGFzdEdyYW1tYXJTdGF0ZShpbnRlcm5hbCwgLi4uYXJncyksXG5cdFx0Y29kZVRvVG9rZW5zQmFzZTogKGNvZGUsIG9wdGlvbnMpID0+IGNvZGVUb1Rva2Vuc0Jhc2UoaW50ZXJuYWwsIGNvZGUsIG9wdGlvbnMpLFxuXHRcdGNvZGVUb1Rva2Vuc1dpdGhUaGVtZXM6IChjb2RlLCBvcHRpb25zKSA9PiBjb2RlVG9Ub2tlbnNXaXRoVGhlbWVzJDEoaW50ZXJuYWwsIGNvZGUsIG9wdGlvbnMpLFxuXHRcdGNvZGVUb1Rva2VuczogKGNvZGUsIG9wdGlvbnMpID0+IGNvZGVUb1Rva2VucyhpbnRlcm5hbCwgY29kZSwgb3B0aW9ucyksXG5cdFx0Y29kZVRvSGFzdDogKGNvZGUsIG9wdGlvbnMpID0+IGNvZGVUb0hhc3QoaW50ZXJuYWwsIGNvZGUsIG9wdGlvbnMpLFxuXHRcdGNvZGVUb0h0bWw6IChjb2RlLCBvcHRpb25zKSA9PiBjb2RlVG9IdG1sKGludGVybmFsLCBjb2RlLCBvcHRpb25zKSxcblx0XHRnZXRCdW5kbGVkTGFuZ3VhZ2VzOiAoKSA9PiAoe30pLFxuXHRcdGdldEJ1bmRsZWRUaGVtZXM6ICgpID0+ICh7fSksXG5cdFx0Li4uaW50ZXJuYWwsXG5cdFx0Z2V0SW50ZXJuYWxDb250ZXh0OiAoKSA9PiBpbnRlcm5hbFxuXHR9O1xufVxuZnVuY3Rpb24gbWFrZVNpbmdsZXRvbkhpZ2hsaWdodGVyQ29yZShjcmVhdGVIaWdobGlnaHRlcikge1xuXHRsZXQgX3NoaWtpO1xuXHRhc3luYyBmdW5jdGlvbiBnZXRTaW5nbGV0b25IaWdobGlnaHRlckNvcmUob3B0aW9ucykge1xuXHRcdGlmICghX3NoaWtpKSB7XG5cdFx0XHRfc2hpa2kgPSBjcmVhdGVIaWdobGlnaHRlcih7XG5cdFx0XHRcdC4uLm9wdGlvbnMsXG5cdFx0XHRcdHRoZW1lczogb3B0aW9ucy50aGVtZXMgfHwgW10sXG5cdFx0XHRcdGxhbmdzOiBvcHRpb25zLmxhbmdzIHx8IFtdXG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBfc2hpa2k7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IHMgPSBhd2FpdCBfc2hpa2k7XG5cdFx0XHRhd2FpdCBQcm9taXNlLmFsbChbcy5sb2FkVGhlbWUoLi4ub3B0aW9ucy50aGVtZXMgfHwgW10pLCBzLmxvYWRMYW5ndWFnZSguLi5vcHRpb25zLmxhbmdzIHx8IFtdKV0pO1xuXHRcdFx0cmV0dXJuIHM7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBnZXRTaW5nbGV0b25IaWdobGlnaHRlckNvcmU7XG59XG5jb25zdCBnZXRTaW5nbGV0b25IaWdobGlnaHRlckNvcmUgPSAvKiBAX19QVVJFX18gKi8gbWFrZVNpbmdsZXRvbkhpZ2hsaWdodGVyQ29yZShjcmVhdGVIaWdobGlnaHRlckNvcmUpO1xuLy8jZW5kcmVnaW9uXG4vLyNyZWdpb24gc3JjL2NvbnN0cnVjdG9ycy9idW5kbGUtZmFjdG9yeS50c1xuZnVuY3Rpb24gY3JlYXRlQnVuZGxlZEhpZ2hsaWdodGVyKG9wdGlvbnMpIHtcblx0Y29uc3QgYnVuZGxlZExhbmd1YWdlcyA9IG9wdGlvbnMubGFuZ3M7XG5cdGNvbnN0IGJ1bmRsZWRUaGVtZXMgPSBvcHRpb25zLnRoZW1lcztcblx0Y29uc3QgZW5naW5lID0gb3B0aW9ucy5lbmdpbmU7XG5cdGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUhpZ2hsaWdodGVyKG9wdGlvbnMpIHtcblx0XHRmdW5jdGlvbiByZXNvbHZlTGFuZyhsYW5nKSB7XG5cdFx0XHRpZiAodHlwZW9mIGxhbmcgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0bGFuZyA9IG9wdGlvbnMubGFuZ0FsaWFzPy5bbGFuZ10gfHwgbGFuZztcblx0XHRcdFx0aWYgKGlzU3BlY2lhbExhbmcobGFuZykpIHJldHVybiBbXTtcblx0XHRcdFx0Y29uc3QgYnVuZGxlID0gYnVuZGxlZExhbmd1YWdlc1tsYW5nXTtcblx0XHRcdFx0aWYgKCFidW5kbGUpIHRocm93IG5ldyBTaGlraUVycm9yJDEoYExhbmd1YWdlIFxcYCR7bGFuZ31cXGAgaXMgbm90IGluY2x1ZGVkIGluIHRoaXMgYnVuZGxlLiBZb3UgbWF5IHdhbnQgdG8gbG9hZCBpdCBmcm9tIGV4dGVybmFsIHNvdXJjZS5gKTtcblx0XHRcdFx0cmV0dXJuIGJ1bmRsZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBsYW5nO1xuXHRcdH1cblx0XHRmdW5jdGlvbiByZXNvbHZlVGhlbWUodGhlbWUpIHtcblx0XHRcdGlmIChpc1NwZWNpYWxUaGVtZSh0aGVtZSkpIHJldHVybiBcIm5vbmVcIjtcblx0XHRcdGlmICh0eXBlb2YgdGhlbWUgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0Y29uc3QgYnVuZGxlID0gYnVuZGxlZFRoZW1lc1t0aGVtZV07XG5cdFx0XHRcdGlmICghYnVuZGxlKSB0aHJvdyBuZXcgU2hpa2lFcnJvciQxKGBUaGVtZSBcXGAke3RoZW1lfVxcYCBpcyBub3QgaW5jbHVkZWQgaW4gdGhpcyBidW5kbGUuIFlvdSBtYXkgd2FudCB0byBsb2FkIGl0IGZyb20gZXh0ZXJuYWwgc291cmNlLmApO1xuXHRcdFx0XHRyZXR1cm4gYnVuZGxlO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRoZW1lO1xuXHRcdH1cblx0XHRjb25zdCBfdGhlbWVzID0gKG9wdGlvbnMudGhlbWVzID8/IFtdKS5tYXAoKGkpID0+IHJlc29sdmVUaGVtZShpKSk7XG5cdFx0Y29uc3QgbGFuZ3MgPSAob3B0aW9ucy5sYW5ncyA/PyBbXSkubWFwKChpKSA9PiByZXNvbHZlTGFuZyhpKSk7XG5cdFx0Y29uc3QgY29yZSA9IGF3YWl0IGNyZWF0ZUhpZ2hsaWdodGVyQ29yZSh7XG5cdFx0XHRlbmdpbmU6IG9wdGlvbnMuZW5naW5lID8/IGVuZ2luZSgpLFxuXHRcdFx0Li4ub3B0aW9ucyxcblx0XHRcdHRoZW1lczogX3RoZW1lcyxcblx0XHRcdGxhbmdzXG5cdFx0fSk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdC4uLmNvcmUsXG5cdFx0XHRsb2FkTGFuZ3VhZ2UoLi4ubGFuZ3MpIHtcblx0XHRcdFx0cmV0dXJuIGNvcmUubG9hZExhbmd1YWdlKC4uLmxhbmdzLm1hcChyZXNvbHZlTGFuZykpO1xuXHRcdFx0fSxcblx0XHRcdGxvYWRUaGVtZSguLi50aGVtZXMpIHtcblx0XHRcdFx0cmV0dXJuIGNvcmUubG9hZFRoZW1lKC4uLnRoZW1lcy5tYXAocmVzb2x2ZVRoZW1lKSk7XG5cdFx0XHR9LFxuXHRcdFx0Z2V0QnVuZGxlZExhbmd1YWdlcygpIHtcblx0XHRcdFx0cmV0dXJuIGJ1bmRsZWRMYW5ndWFnZXM7XG5cdFx0XHR9LFxuXHRcdFx0Z2V0QnVuZGxlZFRoZW1lcygpIHtcblx0XHRcdFx0cmV0dXJuIGJ1bmRsZWRUaGVtZXM7XG5cdFx0XHR9XG5cdFx0fTtcblx0fVxuXHRyZXR1cm4gY3JlYXRlSGlnaGxpZ2h0ZXI7XG59XG5mdW5jdGlvbiBtYWtlU2luZ2xldG9uSGlnaGxpZ2h0ZXIoY3JlYXRlSGlnaGxpZ2h0ZXIpIHtcblx0bGV0IF9zaGlraTtcblx0YXN5bmMgZnVuY3Rpb24gZ2V0U2luZ2xldG9uSGlnaGxpZ2h0ZXIob3B0aW9ucyA9IHt9KSB7XG5cdFx0aWYgKCFfc2hpa2kpIHtcblx0XHRcdF9zaGlraSA9IGNyZWF0ZUhpZ2hsaWdodGVyKHtcblx0XHRcdFx0Li4ub3B0aW9ucyxcblx0XHRcdFx0dGhlbWVzOiBbXSxcblx0XHRcdFx0bGFuZ3M6IFtdXG5cdFx0XHR9KTtcblx0XHRcdGNvbnN0IHMgPSBhd2FpdCBfc2hpa2k7XG5cdFx0XHRhd2FpdCBQcm9taXNlLmFsbChbcy5sb2FkVGhlbWUoLi4ub3B0aW9ucy50aGVtZXMgfHwgW10pLCBzLmxvYWRMYW5ndWFnZSguLi5vcHRpb25zLmxhbmdzIHx8IFtdKV0pO1xuXHRcdFx0cmV0dXJuIHM7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IHMgPSBhd2FpdCBfc2hpa2k7XG5cdFx0XHRhd2FpdCBQcm9taXNlLmFsbChbcy5sb2FkVGhlbWUoLi4ub3B0aW9ucy50aGVtZXMgfHwgW10pLCBzLmxvYWRMYW5ndWFnZSguLi5vcHRpb25zLmxhbmdzIHx8IFtdKV0pO1xuXHRcdFx0cmV0dXJuIHM7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBnZXRTaW5nbGV0b25IaWdobGlnaHRlcjtcbn1cbmZ1bmN0aW9uIGNyZWF0ZVNpbmdsZXRvblNob3J0aGFuZHMoY3JlYXRlSGlnaGxpZ2h0ZXIsIGNvbmZpZykge1xuXHRjb25zdCBnZXRTaW5nbGV0b25IaWdobGlnaHRlciA9IG1ha2VTaW5nbGV0b25IaWdobGlnaHRlcihjcmVhdGVIaWdobGlnaHRlcik7XG5cdGFzeW5jIGZ1bmN0aW9uIGdldChjb2RlLCBvcHRpb25zKSB7XG5cdFx0Y29uc3Qgc2hpa2kgPSBhd2FpdCBnZXRTaW5nbGV0b25IaWdobGlnaHRlcih7XG5cdFx0XHRsYW5nczogW29wdGlvbnMubGFuZ10sXG5cdFx0XHR0aGVtZXM6IFwidGhlbWVcIiBpbiBvcHRpb25zID8gW29wdGlvbnMudGhlbWVdIDogT2JqZWN0LnZhbHVlcyhvcHRpb25zLnRoZW1lcylcblx0XHR9KTtcblx0XHRjb25zdCBsYW5ncyA9IGF3YWl0IGNvbmZpZz8uZ3Vlc3NFbWJlZGRlZExhbmd1YWdlcz8uKGNvZGUsIG9wdGlvbnMubGFuZywgc2hpa2kpO1xuXHRcdGlmIChsYW5ncykgYXdhaXQgc2hpa2kubG9hZExhbmd1YWdlKC4uLmxhbmdzKTtcblx0XHRyZXR1cm4gc2hpa2k7XG5cdH1cblx0cmV0dXJuIHtcblx0XHRnZXRTaW5nbGV0b25IaWdobGlnaHRlcihvcHRpb25zKSB7XG5cdFx0XHRyZXR1cm4gZ2V0U2luZ2xldG9uSGlnaGxpZ2h0ZXIob3B0aW9ucyk7XG5cdFx0fSxcblx0XHRhc3luYyBjb2RlVG9IdG1sKGNvZGUsIG9wdGlvbnMpIHtcblx0XHRcdHJldHVybiAoYXdhaXQgZ2V0KGNvZGUsIG9wdGlvbnMpKS5jb2RlVG9IdG1sKGNvZGUsIG9wdGlvbnMpO1xuXHRcdH0sXG5cdFx0YXN5bmMgY29kZVRvSGFzdChjb2RlLCBvcHRpb25zKSB7XG5cdFx0XHRyZXR1cm4gKGF3YWl0IGdldChjb2RlLCBvcHRpb25zKSkuY29kZVRvSGFzdChjb2RlLCBvcHRpb25zKTtcblx0XHR9LFxuXHRcdGFzeW5jIGNvZGVUb1Rva2Vucyhjb2RlLCBvcHRpb25zKSB7XG5cdFx0XHRyZXR1cm4gKGF3YWl0IGdldChjb2RlLCBvcHRpb25zKSkuY29kZVRvVG9rZW5zKGNvZGUsIG9wdGlvbnMpO1xuXHRcdH0sXG5cdFx0YXN5bmMgY29kZVRvVG9rZW5zQmFzZShjb2RlLCBvcHRpb25zKSB7XG5cdFx0XHRyZXR1cm4gKGF3YWl0IGdldChjb2RlLCBvcHRpb25zKSkuY29kZVRvVG9rZW5zQmFzZShjb2RlLCBvcHRpb25zKTtcblx0XHR9LFxuXHRcdGFzeW5jIGNvZGVUb1Rva2Vuc1dpdGhUaGVtZXMoY29kZSwgb3B0aW9ucykge1xuXHRcdFx0cmV0dXJuIChhd2FpdCBnZXQoY29kZSwgb3B0aW9ucykpLmNvZGVUb1Rva2Vuc1dpdGhUaGVtZXMoY29kZSwgb3B0aW9ucyk7XG5cdFx0fSxcblx0XHRhc3luYyBnZXRMYXN0R3JhbW1hclN0YXRlKGNvZGUsIG9wdGlvbnMpIHtcblx0XHRcdHJldHVybiAoYXdhaXQgZ2V0U2luZ2xldG9uSGlnaGxpZ2h0ZXIoe1xuXHRcdFx0XHRsYW5nczogW29wdGlvbnMubGFuZ10sXG5cdFx0XHRcdHRoZW1lczogW29wdGlvbnMudGhlbWVdXG5cdFx0XHR9KSkuZ2V0TGFzdEdyYW1tYXJTdGF0ZShjb2RlLCBvcHRpb25zKTtcblx0XHR9XG5cdH07XG59XG4vLyNlbmRyZWdpb25cbi8vI3JlZ2lvbiBzcmMvdGhlbWUtY3NzLXZhcmlhYmxlcy50c1xuLyoqXG4qIEEgZmFjdG9yeSBmdW5jdGlvbiB0byBjcmVhdGUgYSBjc3MtdmFyaWFibGUtYmFzZWQgdGhlbWVcbipcbiogQHNlZSBodHRwczovL3NoaWtpLnN0eWxlL2d1aWRlL3RoZW1lLWNvbG9ycyNjc3MtdmFyaWFibGVzLXRoZW1lXG4qL1xuZnVuY3Rpb24gY3JlYXRlQ3NzVmFyaWFibGVzVGhlbWUob3B0aW9ucyA9IHt9KSB7XG5cdGNvbnN0IHsgbmFtZSA9IFwiY3NzLXZhcmlhYmxlc1wiLCB2YXJpYWJsZVByZWZpeCA9IFwiLS1zaGlraS1cIiwgZm9udFN0eWxlID0gdHJ1ZSB9ID0gb3B0aW9ucztcblx0Y29uc3QgdmFyaWFibGUgPSAobmFtZSkgPT4ge1xuXHRcdGlmIChvcHRpb25zLnZhcmlhYmxlRGVmYXVsdHM/LltuYW1lXSkgcmV0dXJuIGB2YXIoJHt2YXJpYWJsZVByZWZpeH0ke25hbWV9LCAke29wdGlvbnMudmFyaWFibGVEZWZhdWx0c1tuYW1lXX0pYDtcblx0XHRyZXR1cm4gYHZhcigke3ZhcmlhYmxlUHJlZml4fSR7bmFtZX0pYDtcblx0fTtcblx0Y29uc3QgdGhlbWUgPSB7XG5cdFx0bmFtZSxcblx0XHR0eXBlOiBcImRhcmtcIixcblx0XHRjb2xvcnM6IHtcblx0XHRcdFwiZWRpdG9yLmZvcmVncm91bmRcIjogdmFyaWFibGUoXCJmb3JlZ3JvdW5kXCIpLFxuXHRcdFx0XCJlZGl0b3IuYmFja2dyb3VuZFwiOiB2YXJpYWJsZShcImJhY2tncm91bmRcIiksXG5cdFx0XHRcInRlcm1pbmFsLmFuc2lCbGFja1wiOiB2YXJpYWJsZShcImFuc2ktYmxhY2tcIiksXG5cdFx0XHRcInRlcm1pbmFsLmFuc2lSZWRcIjogdmFyaWFibGUoXCJhbnNpLXJlZFwiKSxcblx0XHRcdFwidGVybWluYWwuYW5zaUdyZWVuXCI6IHZhcmlhYmxlKFwiYW5zaS1ncmVlblwiKSxcblx0XHRcdFwidGVybWluYWwuYW5zaVllbGxvd1wiOiB2YXJpYWJsZShcImFuc2kteWVsbG93XCIpLFxuXHRcdFx0XCJ0ZXJtaW5hbC5hbnNpQmx1ZVwiOiB2YXJpYWJsZShcImFuc2ktYmx1ZVwiKSxcblx0XHRcdFwidGVybWluYWwuYW5zaU1hZ2VudGFcIjogdmFyaWFibGUoXCJhbnNpLW1hZ2VudGFcIiksXG5cdFx0XHRcInRlcm1pbmFsLmFuc2lDeWFuXCI6IHZhcmlhYmxlKFwiYW5zaS1jeWFuXCIpLFxuXHRcdFx0XCJ0ZXJtaW5hbC5hbnNpV2hpdGVcIjogdmFyaWFibGUoXCJhbnNpLXdoaXRlXCIpLFxuXHRcdFx0XCJ0ZXJtaW5hbC5hbnNpQnJpZ2h0QmxhY2tcIjogdmFyaWFibGUoXCJhbnNpLWJyaWdodC1ibGFja1wiKSxcblx0XHRcdFwidGVybWluYWwuYW5zaUJyaWdodFJlZFwiOiB2YXJpYWJsZShcImFuc2ktYnJpZ2h0LXJlZFwiKSxcblx0XHRcdFwidGVybWluYWwuYW5zaUJyaWdodEdyZWVuXCI6IHZhcmlhYmxlKFwiYW5zaS1icmlnaHQtZ3JlZW5cIiksXG5cdFx0XHRcInRlcm1pbmFsLmFuc2lCcmlnaHRZZWxsb3dcIjogdmFyaWFibGUoXCJhbnNpLWJyaWdodC15ZWxsb3dcIiksXG5cdFx0XHRcInRlcm1pbmFsLmFuc2lCcmlnaHRCbHVlXCI6IHZhcmlhYmxlKFwiYW5zaS1icmlnaHQtYmx1ZVwiKSxcblx0XHRcdFwidGVybWluYWwuYW5zaUJyaWdodE1hZ2VudGFcIjogdmFyaWFibGUoXCJhbnNpLWJyaWdodC1tYWdlbnRhXCIpLFxuXHRcdFx0XCJ0ZXJtaW5hbC5hbnNpQnJpZ2h0Q3lhblwiOiB2YXJpYWJsZShcImFuc2ktYnJpZ2h0LWN5YW5cIiksXG5cdFx0XHRcInRlcm1pbmFsLmFuc2lCcmlnaHRXaGl0ZVwiOiB2YXJpYWJsZShcImFuc2ktYnJpZ2h0LXdoaXRlXCIpXG5cdFx0fSxcblx0XHR0b2tlbkNvbG9yczogW1xuXHRcdFx0e1xuXHRcdFx0XHRzY29wZTogW1xuXHRcdFx0XHRcdFwia2V5d29yZC5vcGVyYXRvci5hY2Nlc3NvclwiLFxuXHRcdFx0XHRcdFwibWV0YS5ncm91cC5icmFjZXMucm91bmQuZnVuY3Rpb24uYXJndW1lbnRzXCIsXG5cdFx0XHRcdFx0XCJtZXRhLnRlbXBsYXRlLmV4cHJlc3Npb25cIixcblx0XHRcdFx0XHRcIm1hcmt1cC5mZW5jZWRfY29kZSBtZXRhLmVtYmVkZGVkLmJsb2NrXCJcblx0XHRcdFx0XSxcblx0XHRcdFx0c2V0dGluZ3M6IHsgZm9yZWdyb3VuZDogdmFyaWFibGUoXCJmb3JlZ3JvdW5kXCIpIH1cblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdHNjb3BlOiBcImVtcGhhc2lzXCIsXG5cdFx0XHRcdHNldHRpbmdzOiB7IGZvbnRTdHlsZTogXCJpdGFsaWNcIiB9XG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRzY29wZTogW1xuXHRcdFx0XHRcdFwic3Ryb25nXCIsXG5cdFx0XHRcdFx0XCJtYXJrdXAuaGVhZGluZy5tYXJrZG93blwiLFxuXHRcdFx0XHRcdFwibWFya3VwLmJvbGQubWFya2Rvd25cIlxuXHRcdFx0XHRdLFxuXHRcdFx0XHRzZXR0aW5nczogeyBmb250U3R5bGU6IFwiYm9sZFwiIH1cblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdHNjb3BlOiBbXCJtYXJrdXAuaXRhbGljLm1hcmtkb3duXCJdLFxuXHRcdFx0XHRzZXR0aW5nczogeyBmb250U3R5bGU6IFwiaXRhbGljXCIgfVxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0c2NvcGU6IFwibWV0YS5saW5rLmlubGluZS5tYXJrZG93blwiLFxuXHRcdFx0XHRzZXR0aW5nczoge1xuXHRcdFx0XHRcdGZvbnRTdHlsZTogXCJ1bmRlcmxpbmVcIixcblx0XHRcdFx0XHRmb3JlZ3JvdW5kOiB2YXJpYWJsZShcInRva2VuLWxpbmtcIilcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0c2NvcGU6IFtcblx0XHRcdFx0XHRcInN0cmluZ1wiLFxuXHRcdFx0XHRcdFwibWFya3VwLmZlbmNlZF9jb2RlXCIsXG5cdFx0XHRcdFx0XCJtYXJrdXAuaW5saW5lXCJcblx0XHRcdFx0XSxcblx0XHRcdFx0c2V0dGluZ3M6IHsgZm9yZWdyb3VuZDogdmFyaWFibGUoXCJ0b2tlbi1zdHJpbmdcIikgfVxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0c2NvcGU6IFtcImNvbW1lbnRcIiwgXCJzdHJpbmcucXVvdGVkLmRvY3N0cmluZy5tdWx0aVwiXSxcblx0XHRcdFx0c2V0dGluZ3M6IHsgZm9yZWdyb3VuZDogdmFyaWFibGUoXCJ0b2tlbi1jb21tZW50XCIpIH1cblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdHNjb3BlOiBbXG5cdFx0XHRcdFx0XCJjb25zdGFudC5udW1lcmljXCIsXG5cdFx0XHRcdFx0XCJjb25zdGFudC5sYW5ndWFnZVwiLFxuXHRcdFx0XHRcdFwiY29uc3RhbnQub3RoZXIucGxhY2Vob2xkZXJcIixcblx0XHRcdFx0XHRcImNvbnN0YW50LmNoYXJhY3Rlci5mb3JtYXQucGxhY2Vob2xkZXJcIixcblx0XHRcdFx0XHRcInZhcmlhYmxlLmxhbmd1YWdlLnRoaXNcIixcblx0XHRcdFx0XHRcInZhcmlhYmxlLm90aGVyLm9iamVjdFwiLFxuXHRcdFx0XHRcdFwidmFyaWFibGUub3RoZXIuY2xhc3NcIixcblx0XHRcdFx0XHRcInZhcmlhYmxlLm90aGVyLmNvbnN0YW50XCIsXG5cdFx0XHRcdFx0XCJtZXRhLnByb3BlcnR5LW5hbWVcIixcblx0XHRcdFx0XHRcIm1ldGEucHJvcGVydHktdmFsdWVcIixcblx0XHRcdFx0XHRcInN1cHBvcnRcIlxuXHRcdFx0XHRdLFxuXHRcdFx0XHRzZXR0aW5nczogeyBmb3JlZ3JvdW5kOiB2YXJpYWJsZShcInRva2VuLWNvbnN0YW50XCIpIH1cblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdHNjb3BlOiBbXG5cdFx0XHRcdFx0XCJrZXl3b3JkXCIsXG5cdFx0XHRcdFx0XCJzdG9yYWdlLm1vZGlmaWVyXCIsXG5cdFx0XHRcdFx0XCJzdG9yYWdlLnR5cGVcIixcblx0XHRcdFx0XHRcInN0b3JhZ2UuY29udHJvbC5jbG9qdXJlXCIsXG5cdFx0XHRcdFx0XCJlbnRpdHkubmFtZS5mdW5jdGlvbi5jbG9qdXJlXCIsXG5cdFx0XHRcdFx0XCJlbnRpdHkubmFtZS50YWcueWFtbFwiLFxuXHRcdFx0XHRcdFwic3VwcG9ydC5mdW5jdGlvbi5ub2RlXCIsXG5cdFx0XHRcdFx0XCJzdXBwb3J0LnR5cGUucHJvcGVydHktbmFtZS5qc29uXCIsXG5cdFx0XHRcdFx0XCJwdW5jdHVhdGlvbi5zZXBhcmF0b3Iua2V5LXZhbHVlXCIsXG5cdFx0XHRcdFx0XCJwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnRlbXBsYXRlLWV4cHJlc3Npb25cIlxuXHRcdFx0XHRdLFxuXHRcdFx0XHRzZXR0aW5nczogeyBmb3JlZ3JvdW5kOiB2YXJpYWJsZShcInRva2VuLWtleXdvcmRcIikgfVxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0c2NvcGU6IFwidmFyaWFibGUucGFyYW1ldGVyLmZ1bmN0aW9uXCIsXG5cdFx0XHRcdHNldHRpbmdzOiB7IGZvcmVncm91bmQ6IHZhcmlhYmxlKFwidG9rZW4tcGFyYW1ldGVyXCIpIH1cblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdHNjb3BlOiBbXG5cdFx0XHRcdFx0XCJzdXBwb3J0LmZ1bmN0aW9uXCIsXG5cdFx0XHRcdFx0XCJlbnRpdHkubmFtZS50eXBlXCIsXG5cdFx0XHRcdFx0XCJlbnRpdHkub3RoZXIuaW5oZXJpdGVkLWNsYXNzXCIsXG5cdFx0XHRcdFx0XCJtZXRhLmZ1bmN0aW9uLWNhbGxcIixcblx0XHRcdFx0XHRcIm1ldGEuaW5zdGFuY2UuY29uc3RydWN0b3JcIixcblx0XHRcdFx0XHRcImVudGl0eS5vdGhlci5hdHRyaWJ1dGUtbmFtZVwiLFxuXHRcdFx0XHRcdFwiZW50aXR5Lm5hbWUuZnVuY3Rpb25cIixcblx0XHRcdFx0XHRcImNvbnN0YW50LmtleXdvcmQuY2xvanVyZVwiXG5cdFx0XHRcdF0sXG5cdFx0XHRcdHNldHRpbmdzOiB7IGZvcmVncm91bmQ6IHZhcmlhYmxlKFwidG9rZW4tZnVuY3Rpb25cIikgfVxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0c2NvcGU6IFtcblx0XHRcdFx0XHRcImVudGl0eS5uYW1lLnRhZ1wiLFxuXHRcdFx0XHRcdFwic3RyaW5nLnF1b3RlZFwiLFxuXHRcdFx0XHRcdFwic3RyaW5nLnJlZ2V4cFwiLFxuXHRcdFx0XHRcdFwic3RyaW5nLmludGVycG9sYXRlZFwiLFxuXHRcdFx0XHRcdFwic3RyaW5nLnRlbXBsYXRlXCIsXG5cdFx0XHRcdFx0XCJzdHJpbmcudW5xdW90ZWQucGxhaW4ub3V0LnlhbWxcIixcblx0XHRcdFx0XHRcImtleXdvcmQub3RoZXIudGVtcGxhdGVcIlxuXHRcdFx0XHRdLFxuXHRcdFx0XHRzZXR0aW5nczogeyBmb3JlZ3JvdW5kOiB2YXJpYWJsZShcInRva2VuLXN0cmluZy1leHByZXNzaW9uXCIpIH1cblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdHNjb3BlOiBbXG5cdFx0XHRcdFx0XCJwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmFyZ3VtZW50c1wiLFxuXHRcdFx0XHRcdFwicHVuY3R1YXRpb24uZGVmaW5pdGlvbi5kaWN0XCIsXG5cdFx0XHRcdFx0XCJwdW5jdHVhdGlvbi5zZXBhcmF0b3JcIixcblx0XHRcdFx0XHRcIm1ldGEuZnVuY3Rpb24tY2FsbC5hcmd1bWVudHNcIlxuXHRcdFx0XHRdLFxuXHRcdFx0XHRzZXR0aW5nczogeyBmb3JlZ3JvdW5kOiB2YXJpYWJsZShcInRva2VuLXB1bmN0dWF0aW9uXCIpIH1cblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdHNjb3BlOiBbXCJtYXJrdXAudW5kZXJsaW5lLmxpbmtcIiwgXCJwdW5jdHVhdGlvbi5kZWZpbml0aW9uLm1ldGFkYXRhLm1hcmtkb3duXCJdLFxuXHRcdFx0XHRzZXR0aW5nczogeyBmb3JlZ3JvdW5kOiB2YXJpYWJsZShcInRva2VuLWxpbmtcIikgfVxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0c2NvcGU6IFtcImJlZ2lubmluZy5wdW5jdHVhdGlvbi5kZWZpbml0aW9uLmxpc3QubWFya2Rvd25cIl0sXG5cdFx0XHRcdHNldHRpbmdzOiB7IGZvcmVncm91bmQ6IHZhcmlhYmxlKFwidG9rZW4tc3RyaW5nXCIpIH1cblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdHNjb3BlOiBbXG5cdFx0XHRcdFx0XCJwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnN0cmluZy5iZWdpbi5tYXJrZG93blwiLFxuXHRcdFx0XHRcdFwicHVuY3R1YXRpb24uZGVmaW5pdGlvbi5zdHJpbmcuZW5kLm1hcmtkb3duXCIsXG5cdFx0XHRcdFx0XCJzdHJpbmcub3RoZXIubGluay50aXRsZS5tYXJrZG93blwiLFxuXHRcdFx0XHRcdFwic3RyaW5nLm90aGVyLmxpbmsuZGVzY3JpcHRpb24ubWFya2Rvd25cIlxuXHRcdFx0XHRdLFxuXHRcdFx0XHRzZXR0aW5nczogeyBmb3JlZ3JvdW5kOiB2YXJpYWJsZShcInRva2VuLWtleXdvcmRcIikgfVxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0c2NvcGU6IFtcblx0XHRcdFx0XHRcIm1hcmt1cC5pbnNlcnRlZFwiLFxuXHRcdFx0XHRcdFwibWV0YS5kaWZmLmhlYWRlci50by1maWxlXCIsXG5cdFx0XHRcdFx0XCJwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmluc2VydGVkXCJcblx0XHRcdFx0XSxcblx0XHRcdFx0c2V0dGluZ3M6IHsgZm9yZWdyb3VuZDogdmFyaWFibGUoXCJ0b2tlbi1pbnNlcnRlZFwiKSB9XG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRzY29wZTogW1xuXHRcdFx0XHRcdFwibWFya3VwLmRlbGV0ZWRcIixcblx0XHRcdFx0XHRcIm1ldGEuZGlmZi5oZWFkZXIuZnJvbS1maWxlXCIsXG5cdFx0XHRcdFx0XCJwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmRlbGV0ZWRcIlxuXHRcdFx0XHRdLFxuXHRcdFx0XHRzZXR0aW5nczogeyBmb3JlZ3JvdW5kOiB2YXJpYWJsZShcInRva2VuLWRlbGV0ZWRcIikgfVxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0c2NvcGU6IFtcIm1hcmt1cC5jaGFuZ2VkXCIsIFwicHVuY3R1YXRpb24uZGVmaW5pdGlvbi5jaGFuZ2VkXCJdLFxuXHRcdFx0XHRzZXR0aW5nczogeyBmb3JlZ3JvdW5kOiB2YXJpYWJsZShcInRva2VuLWNoYW5nZWRcIikgfVxuXHRcdFx0fVxuXHRcdF1cblx0fTtcblx0aWYgKCFmb250U3R5bGUpIHRoZW1lLnRva2VuQ29sb3JzID0gdGhlbWUudG9rZW5Db2xvcnM/Lm1hcCgodG9rZW5Db2xvcikgPT4ge1xuXHRcdGlmICh0b2tlbkNvbG9yLnNldHRpbmdzPy5mb250U3R5bGUpIGRlbGV0ZSB0b2tlbkNvbG9yLnNldHRpbmdzLmZvbnRTdHlsZTtcblx0XHRyZXR1cm4gdG9rZW5Db2xvcjtcblx0fSk7XG5cdHJldHVybiB0aGVtZTtcbn1cbi8vI2VuZHJlZ2lvblxuZXhwb3J0IHsgU2hpa2lFcnJvciwgYWRkQ2xhc3NUb0hhc3QsIGFwcGx5Q29sb3JSZXBsYWNlbWVudHMsIGNvZGVUb0hhc3QsIGNvZGVUb0h0bWwsIGNvZGVUb1Rva2VucywgY29kZVRvVG9rZW5zQmFzZSwgY29kZVRvVG9rZW5zV2l0aFRoZW1lcywgY3JlYXRlQnVuZGxlZEhpZ2hsaWdodGVyLCBjcmVhdGVDc3NWYXJpYWJsZXNUaGVtZSwgY3JlYXRlSGlnaGxpZ2h0ZXJDb3JlLCBjcmVhdGVIaWdobGlnaHRlckNvcmVTeW5jLCBjcmVhdGVQb3NpdGlvbkNvbnZlcnRlciwgY3JlYXRlU2hpa2lJbnRlcm5hbCwgY3JlYXRlU2hpa2lJbnRlcm5hbFN5bmMsIGNyZWF0ZVNoaWtpUHJpbWl0aXZlLCBjcmVhdGVTaGlraVByaW1pdGl2ZUFzeW5jLCBjcmVhdGVTaW5nbGV0b25TaG9ydGhhbmRzLCBmbGF0VG9rZW5WYXJpYW50cywgZ2V0TGFzdEdyYW1tYXJTdGF0ZSwgZ2V0U2luZ2xldG9uSGlnaGxpZ2h0ZXJDb3JlLCBnZXRUb2tlblN0eWxlT2JqZWN0LCBndWVzc0VtYmVkZGVkTGFuZ3VhZ2VzLCBoYXN0VG9IdG1sLCBpc05vbmVUaGVtZSwgaXNQbGFpbkxhbmcsIGlzU3BlY2lhbExhbmcsIGlzU3BlY2lhbFRoZW1lLCBtYWtlU2luZ2xldG9uSGlnaGxpZ2h0ZXIsIG1ha2VTaW5nbGV0b25IaWdobGlnaHRlckNvcmUsIG5vcm1hbGl6ZUdldHRlciwgbm9ybWFsaXplVGhlbWUsIHJlc29sdmVDb2xvclJlcGxhY2VtZW50cywgc3BsaXRMaW5lcywgc3BsaXRUb2tlbiwgc3BsaXRUb2tlbnMsIHN0cmluZ2lmeVRva2VuU3R5bGUsIHRvQXJyYXksIHRva2VuaXplQW5zaVdpdGhUaGVtZSwgdG9rZW5pemVXaXRoVGhlbWUsIHRva2Vuc1RvSGFzdCwgdHJhbnNmb3JtZXJEZWNvcmF0aW9ucyB9O1xuIgogIF0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7QUFDQSxJQUFJLFlBQVksT0FBTztBQUN2QixJQUFJLG1CQUFtQixPQUFPO0FBQzlCLElBQUksb0JBQW9CLE9BQU87QUFDL0IsSUFBSSxlQUFlLE9BQU8sVUFBVTtBQUNwQyxJQUFJLGNBQWMsQ0FB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LE9BQU87QUFBQSxJQUNQLEtBQUs7QUFBQSxJQUNMLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLFdBQVc7QUFBQSxJQUNYLFNBQVM7QUFBQSxJQUNULGNBQWM7QUFBQSxJQUNkLGVBQWU7QUFBQSxJQUNmLE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQSxJQUNaLGFBQWE7QUFBQSxJQUNiLFlBQVk7QUFBQSxJQUNaLGdCQUFnQjtBQUFBLElBQ2hCLFlBQVk7QUFBQSxJQUNaLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLFFBQVE7QUFBQSxJQUNSLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLFVBQVU7QUFBQSxJQUNWLFNBQVM7QUFBQSxJQUNULFdBQVc7QUFBQSxJQUNYLElBQUk7QUFBQSxJQUNKLFlBQVk7QUFBQSxJQUNaLGFBQWE7QUFBQSxJQUNiLE9BQU87QUFBQSxJQUNQLFdBQVc7QUFBQSxJQUNYLFdBQVc7QUFBQSxJQUNYLElBQUk7QUFBQSxJQUNKLE9BQU87QUFBQSxJQUNQLFFBQVE7QUFBQSxJQUNSLFVBQVU7QUFBQSxJQUNWLFNBQVM7QUFBQSxJQUNULFdBQVc7QUFBQSxJQUNYLFVBQVU7QUFBQSxJQUNWLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFVBQVU7QUFBQSxJQUNWLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULE1BQU07QUFBQSxJQUNOLEtBQUs7QUFBQSxJQUNMLFVBQVU7QUFBQSxJQUNWLEtBQUs7QUFBQSxJQUNMLFdBQVc7QUFBQSxJQUNYLE9BQU87QUFBQSxJQUNQLFFBQVE7QUFBQSxJQUNSLEtBQUs7QUFBQSxJQUNMLFdBQVc7QUFBQSxJQUNYLFVBQVU7QUFBQSxJQUNWLE9BQU87QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLFVBQVU7QUFBQSxJQUNWLFlBQVk7QUFBQSxJQUNaLFNBQVM7QUFBQSxJQUNULGNBQWM7QUFBQSxJQUNkLFlBQVk7QUFBQSxJQUNaLGVBQWU7QUFBQSxJQUNmLGVBQWU7QUFBQSxJQUNmLGdCQUFnQjtBQUFBLElBQ2hCLGdCQUFnQjtBQUFBLElBQ2hCLFFBQVE7QUFBQSxJQUNSLFVBQVU7QUFBQSxJQUNWLFdBQVc7QUFBQSxJQUNYLGtCQUFrQjtBQUFBLElBQ2xCLFVBQVU7QUFBQSxJQUNWLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULGVBQWU7QUFBQSxJQUNmLGVBQWU7QUFBQSxJQUNmLG1CQUFtQjtBQUFBLElBQ25CLFFBQVE7QUFBQSxJQUNSLGFBQWE7QUFBQSxJQUNiLE9BQU87QUFBQSxJQUNQLFlBQVk7QUFBQSxJQUNaLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxJQUNYLGFBQWE7QUFBQSxJQUNiLFlBQVk7QUFBQSxJQUNaLGFBQWE7QUFBQSxJQUNiLFlBQVk7QUFBQSxJQUNaLGFBQWE7QUFBQSxJQUNiLFFBQVE7QUFBQSxJQUNSLGtCQUFrQjtBQUFBLElBQ2xCLFdBQVc7QUFBQSxJQUNYLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFlBQVk7QUFBQSxJQUNaLGNBQWM7QUFBQSxJQUNkLFNBQVM7QUFBQSxJQUNULFdBQVc7QUFBQSxJQUNYLFdBQVc7QUFBQSxJQUNYLFlBQVk7QUFBQSxJQUNaLFNBQVM7QUFBQSxJQUNULGtCQUFrQjtBQUFBLElBQ2xCLFFBQVE7QUFBQSxJQUNSLGNBQWM7QUFBQSxJQUNkLGtCQUFrQjtBQUFBLElBQ2xCLFdBQVc7QUFBQSxJQUNYLGFBQWE7QUFBQSxJQUNiLFdBQVc7QUFBQSxJQUNYLGdCQUFnQjtBQUFBLElBQ2hCLGFBQWE7QUFBQSxJQUNiLGNBQWM7QUFBQSxJQUNkLGNBQWM7QUFBQSxJQUNkLGFBQWE7QUFBQSxJQUNiLFlBQVk7QUFBQSxJQUNaLGFBQWE7QUFBQSxJQUNiLFdBQVc7QUFBQSxJQUNYLFdBQVc7QUFBQSxJQUNYLFVBQVU7QUFBQSxJQUNWLFlBQVk7QUFBQSxJQUNaLFlBQVk7QUFBQSxJQUNaLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxJQUNYLFlBQVk7QUFBQSxJQUNaLFlBQVk7QUFBQSxJQUNaLGNBQWM7QUFBQSxJQUNkLG9CQUFvQjtBQUFBLElBQ3BCLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLGFBQWE7QUFBQSxJQUNiLDJCQUEyQjtBQUFBLElBQzNCLFVBQVU7QUFBQSxJQUNWLFdBQVc7QUFBQSxJQUNYLFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQSxJQUNkLFdBQVc7QUFBQSxJQUNYLFdBQVc7QUFBQSxJQUNYLFVBQVU7QUFBQSxJQUNWLFdBQVc7QUFBQSxJQUNYLGNBQWM7QUFBQSxJQUNkLFVBQVU7QUFBQSxJQUNWLHNCQUFzQjtBQUFBLElBQ3RCLFVBQVU7QUFBQSxJQUNWLGdCQUFnQjtBQUFBLElBQ2hCLFdBQVc7QUFBQSxJQUNYLFNBQVM7QUFBQSxJQUNULE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULE1BQU07QUFBQSxJQUNOLGFBQWE7QUFBQSxJQUNiLGFBQWE7QUFBQSxJQUNiLFNBQVM7QUFBQSxJQUNULGVBQWU7QUFBQSxJQUNmLHFCQUFxQjtBQUFBLElBQ3JCLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLGdCQUFnQjtBQUFBLElBQ2hCLEtBQUs7QUFBQSxJQUNMLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULE9BQU87QUFBQSxJQUNQLFFBQVE7QUFBQSxJQUNSLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLG9CQUFvQjtBQUFBLElBQ3BCLDBCQUEwQjtBQUFBLElBQzFCLGdCQUFnQjtBQUFBLElBQ2hCLE9BQU87QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQSxJQUNaLEtBQUs7QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLFdBQVc7QUFBQSxJQUNYLE1BQU07QUFBQSxJQUNOLGVBQWU7QUFBQSxJQUNmLFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLG9CQUFvQjtBQUFBLElBSXBCLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQSxJQUNaLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLGFBQWE7QUFBQSxJQUNiLGNBQWM7QUFBQSxJQUNkLGFBQWE7QUFBQSxJQUNiLGFBQWE7QUFBQSxJQUNiLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULE9BQU87QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULE9BQU87QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLGFBQWE7QUFBQSxJQUNiLFFBQVE7QUFBQSxJQUNSLFlBQVk7QUFBQSxJQUNaLE1BQU07QUFBQSxJQUNOLFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLGNBQWM7QUFBQSxJQUNkLGFBQWE7QUFBQSxJQUNiLFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLEtBQUs7QUFBQSxJQUNMLGFBQWE7QUFBQSxJQUNiLE9BQU87QUFBQSxJQUNQLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxJQUNYLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULE1BQU07QUFBQSxJQUNOLFdBQVc7QUFBQSxJQUNYLFdBQVc7QUFBQSxJQUNYLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLFFBQVE7QUFBQSxJQUdSLG1CQUFtQjtBQUFBLElBQ25CLGFBQWE7QUFBQSxJQUNiLFVBQVU7QUFBQSxJQUNWLHlCQUF5QjtBQUFBLElBQ3pCLHVCQUF1QjtBQUFBLElBQ3ZCLFFBQVE7QUFBQSxJQUNSLFVBQVU7QUFBQSxJQUNWLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQSxFQUNoQjtBQUFBLEVBQ0EsT0FBTztBQUFBLEVBQ1AsV0FBVztBQUNiLENBQUM7OztBQ3ZUTSxJQUFNLE1BQU0sT0FBTztBQUFBLEVBQ3hCLFlBQVk7QUFBQSxJQUNWLGNBQWM7QUFBQSxJQUNkLG1CQUFtQjtBQUFBLElBQ25CLFlBQVk7QUFBQSxJQUNaLGVBQWU7QUFBQSxJQUNmLFdBQVc7QUFBQSxJQUNYLFdBQVc7QUFBQSxJQUNYLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLG9CQUFvQjtBQUFBLElBQ3BCLDJCQUEyQjtBQUFBLElBQzNCLGNBQWM7QUFBQSxJQUNkLGdCQUFnQjtBQUFBLElBQ2hCLGFBQWE7QUFBQSxJQUNiLFVBQVU7QUFBQSxJQUNWLGtCQUFrQjtBQUFBLElBQ2xCLGtCQUFrQjtBQUFBLElBQ2xCLGFBQWE7QUFBQSxJQUNiLFVBQVU7QUFBQSxJQUNWLFlBQVk7QUFBQSxJQUNaLGNBQWM7QUFBQSxJQUNkLFlBQVk7QUFBQSxJQUNaLFVBQVU7QUFBQSxJQUNWLGdCQUFnQjtBQUFBLElBQ2hCLGFBQWE7QUFBQSxJQUNiLFdBQVc7QUFBQSxJQUNYLGFBQWE7QUFBQSxJQUNiLFlBQVk7QUFBQSxJQUNaLFdBQVc7QUFBQSxJQUNYLDRCQUE0QjtBQUFBLElBQzVCLDBCQUEwQjtBQUFBLElBQzFCLFVBQVU7QUFBQSxJQUNWLFdBQVc7QUFBQSxJQUNYLGNBQWM7QUFBQSxJQUNkLGNBQWM7QUFBQSxJQUNkLGdCQUFnQjtBQUFBLElBQ2hCLGVBQWU7QUFBQSxJQUNmLGVBQWU7QUFBQSxJQUNmLFdBQVc7QUFBQSxJQUNYLFdBQVc7QUFBQSxJQUNYLGFBQWE7QUFBQSxJQUNiLFNBQVM7QUFBQSxJQUNULGFBQWE7QUFBQSxJQUNiLGNBQWM7QUFBQSxJQUNkLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLE9BQU87QUFBQSxJQUNQLFdBQVc7QUFBQSxJQUNYLFlBQVk7QUFBQSxJQUNaLFNBQVM7QUFBQSxJQUNULFlBQVk7QUFBQSxJQUNaLGNBQWM7QUFBQSxJQUNkLGVBQWU7QUFBQSxJQUNmLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFdBQVc7QUFBQSxJQUNYLGtCQUFrQjtBQUFBLElBQ2xCLFVBQVU7QUFBQSxJQUNWLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLGFBQWE7QUFBQSxJQUNiLE9BQU87QUFBQSxJQUNQLFlBQVk7QUFBQSxJQUNaLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxJQUNYLGFBQWE7QUFBQSxJQUNiLFlBQVk7QUFBQSxJQUNaLGFBQWE7QUFBQSxJQUNiLFlBQVk7QUFBQSxJQUNaLGFBQWE7QUFBQSxJQUNiLFFBQVE7QUFBQSxJQUNSLGtCQUFrQjtBQUFBLElBQ2xCLFdBQVc7QUFBQSxJQUNYLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFdBQVc7QUFBQSxJQUNYLFlBQVk7QUFBQSxJQUNaLGNBQWM7QUFBQSxJQUNkLFNBQVM7QUFBQSxJQUNULFdBQVc7QUFBQSxJQUNYLFdBQVc7QUFBQSxJQUNYLFlBQVk7QUFBQSxJQUNaLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLGNBQWM7QUFBQSxJQUNkLGtCQUFrQjtBQUFBLElBQ2xCLGFBQWE7QUFBQSxJQUNiLFdBQVc7QUFBQSxJQUNYLGFBQWE7QUFBQSxJQUNiLGNBQWM7QUFBQSxJQUNkLGNBQWM7QUFBQSxJQUNkLGFBQWE7QUFBQSxJQUNiLFlBQVk7QUFBQSxJQUNaLGFBQWE7QUFBQSxJQUNiLFdBQVc7QUFBQSxJQUNYLGNBQWM7QUFBQSxJQUNkLFdBQVc7QUFBQSxJQUNYLFVBQVU7QUFBQSxJQUNWLFlBQVk7QUFBQSxJQUNaLFlBQVk7QUFBQSxJQUNaLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxJQUNYLFlBQVk7QUFBQSxJQUNaLFlBQVk7QUFBQSxJQUNaLGNBQWM7QUFBQSxJQUNkLFVBQVU7QUFBQSxJQUNWLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLFdBQVc7QUFBQSxJQUNYLFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxJQUNYLFdBQVc7QUFBQSxJQUNYLFVBQVU7QUFBQSxJQUNWLFdBQVc7QUFBQSxJQUNYLGNBQWM7QUFBQSxJQUNkLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLGdCQUFnQjtBQUFBLElBQ2hCLFdBQVc7QUFBQSxJQUNYLFFBQVE7QUFBQSxJQUNSLGtCQUFrQjtBQUFBLElBQ2xCLG1CQUFtQjtBQUFBLElBQ25CLFlBQVk7QUFBQSxJQUNaLFNBQVM7QUFBQSxJQUNULGVBQWU7QUFBQSxJQUNmLGdCQUFnQjtBQUFBLElBQ2hCLGlCQUFpQjtBQUFBLElBQ2pCLGdCQUFnQjtBQUFBLElBQ2hCLFdBQVc7QUFBQSxJQUNYLGFBQWE7QUFBQSxJQUNiLHVCQUF1QjtBQUFBLElBQ3ZCLHdCQUF3QjtBQUFBLElBQ3hCLGlCQUFpQjtBQUFBLElBQ2pCLGtCQUFrQjtBQUFBLElBQ2xCLGVBQWU7QUFBQSxJQUNmLGdCQUFnQjtBQUFBLElBQ2hCLGtCQUFrQjtBQUFBLElBQ2xCLGVBQWU7QUFBQSxJQUNmLGFBQWE7QUFBQSxJQUNiLFVBQVU7QUFBQSxJQUNWLFlBQVk7QUFBQSxJQUNaLGdCQUFnQjtBQUFBLElBQ2hCLGVBQWU7QUFBQSxJQUNmLGlCQUFpQjtBQUFBLElBQ2pCLFFBQVE7QUFBQSxJQUNSLG1CQUFtQjtBQUFBLElBQ25CLG9CQUFvQjtBQUFBLElBQ3BCLGFBQWE7QUFBQSxJQUNiLGNBQWM7QUFBQSxJQUNkLFlBQVk7QUFBQSxJQUNaLGFBQWE7QUFBQSxJQUNiLFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQSxJQUNkLGVBQWU7QUFBQSxJQUNmLGNBQWM7QUFBQSxJQUNkLFVBQVU7QUFBQSxJQUNWLGFBQWE7QUFBQSxJQUNiLGFBQWE7QUFBQSxJQUNiLGFBQWE7QUFBQSxJQUNiLGFBQWE7QUFBQSxJQUNiLFNBQVM7QUFBQSxJQUVULGVBQWU7QUFBQSxJQUNmLGVBQWU7QUFBQSxFQUNqQjtBQUFBLEVBQ0EsWUFBWTtBQUFBLElBQ1YsT0FBTztBQUFBLElBQ1AsY0FBYztBQUFBLElBQ2QsWUFBWTtBQUFBLElBQ1osVUFBVTtBQUFBLElBQ1YsbUJBQW1CO0FBQUEsSUFDbkIsWUFBWTtBQUFBLElBQ1osV0FBVztBQUFBLElBQ1gsWUFBWTtBQUFBLElBQ1osUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLElBQ2YsZUFBZTtBQUFBLElBQ2YsU0FBUztBQUFBLElBQ1QsV0FBVztBQUFBLElBQ1gsZUFBZTtBQUFBLElBQ2YsZUFBZTtBQUFBLElBQ2YsYUFBYTtBQUFBLElBQ2IsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sSUFBSTtBQUFBLElBQ0osVUFBVTtBQUFBLElBQ1YsV0FBVztBQUFBLElBQ1gsV0FBVztBQUFBLElBQ1gsTUFBTTtBQUFBLElBQ04sVUFBVTtBQUFBLElBQ1YsZUFBZTtBQUFBLElBQ2YsVUFBVTtBQUFBLElBQ1YsT0FBTztBQUFBLElBQ1Asb0JBQW9CO0FBQUEsSUFDcEIsMkJBQTJCO0FBQUEsSUFDM0IsY0FBYztBQUFBLElBQ2QsZ0JBQWdCO0FBQUEsSUFDaEIsU0FBUztBQUFBLElBQ1QsbUJBQW1CO0FBQUEsSUFDbkIsa0JBQWtCO0FBQUEsSUFDbEIsYUFBYTtBQUFBLElBQ2IsUUFBUTtBQUFBLElBQ1IsSUFBSTtBQUFBLElBQ0osSUFBSTtBQUFBLElBQ0osR0FBRztBQUFBLElBQ0gsVUFBVTtBQUFBLElBQ1YsZUFBZTtBQUFBLElBQ2YsU0FBUztBQUFBLElBQ1QsaUJBQWlCO0FBQUEsSUFDakIsV0FBVztBQUFBLElBQ1gsU0FBUztBQUFBLElBQ1QsS0FBSztBQUFBLElBQ0wsU0FBUztBQUFBLElBQ1Qsa0JBQWtCO0FBQUEsSUFDbEIsVUFBVTtBQUFBLElBQ1YsSUFBSTtBQUFBLElBQ0osSUFBSTtBQUFBLElBQ0osVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLElBQ1YsV0FBVztBQUFBLElBQ1gsa0JBQWtCO0FBQUEsSUFDbEIsS0FBSztBQUFBLElBQ0wsT0FBTztBQUFBLElBQ1AsVUFBVTtBQUFBLElBQ1YsMkJBQTJCO0FBQUEsSUFDM0IsTUFBTTtBQUFBLElBQ04sYUFBYTtBQUFBLElBQ2IsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsYUFBYTtBQUFBLElBQ2IsWUFBWTtBQUFBLElBQ1osY0FBYztBQUFBLElBQ2QsV0FBVztBQUFBLElBQ1gsZ0JBQWdCO0FBQUEsSUFDaEIsWUFBWTtBQUFBLElBQ1osVUFBVTtBQUFBLElBQ1YsZ0JBQWdCO0FBQUEsSUFDaEIsYUFBYTtBQUFBLElBQ2IsV0FBVztBQUFBLElBQ1gsYUFBYTtBQUFBLElBQ2IsWUFBWTtBQUFBLElBQ1osUUFBUTtBQUFBLElBQ1IsSUFBSTtBQUFBLElBQ0osTUFBTTtBQUFBLElBQ04sSUFBSTtBQUFBLElBQ0osSUFBSTtBQUFBLElBQ0osSUFBSTtBQUFBLElBQ0osSUFBSTtBQUFBLElBQ0osV0FBVztBQUFBLElBQ1gsNEJBQTRCO0FBQUEsSUFDNUIsMEJBQTBCO0FBQUEsSUFDMUIsVUFBVTtBQUFBLElBQ1YsbUJBQW1CO0FBQUEsSUFDbkIsZUFBZTtBQUFBLElBQ2YsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsbUJBQW1CO0FBQUEsSUFDbkIsWUFBWTtBQUFBLElBQ1osUUFBUTtBQUFBLElBQ1IsTUFBTTtBQUFBLElBQ04sVUFBVTtBQUFBLElBQ1YsV0FBVztBQUFBLElBQ1gsY0FBYztBQUFBLElBQ2QsY0FBYztBQUFBLElBQ2QsSUFBSTtBQUFBLElBQ0osYUFBYTtBQUFBLElBQ2IsZ0JBQWdCO0FBQUEsSUFDaEIsbUJBQW1CO0FBQUEsSUFDbkIsSUFBSTtBQUFBLElBQ0osS0FBSztBQUFBLElBQ0wsV0FBVztBQUFBLElBQ1gsR0FBRztBQUFBLElBQ0gsSUFBSTtBQUFBLElBQ0osSUFBSTtBQUFBLElBQ0osSUFBSTtBQUFBLElBQ0osSUFBSTtBQUFBLElBQ0osY0FBYztBQUFBLElBQ2Qsa0JBQWtCO0FBQUEsSUFDbEIsV0FBVztBQUFBLElBQ1gsWUFBWTtBQUFBLElBQ1osVUFBVTtBQUFBLElBQ1YsU0FBUztBQUFBLElBQ1QsTUFBTTtBQUFBLElBQ04sY0FBYztBQUFBLElBQ2QsZUFBZTtBQUFBLElBQ2YsZUFBZTtBQUFBLElBQ2YsbUJBQW1CO0FBQUEsSUFDbkIsT0FBTztBQUFBLElBQ1AsV0FBVztBQUFBLElBQ1gsV0FBVztBQUFBLElBQ1gsYUFBYTtBQUFBLElBQ2IsY0FBYztBQUFBLElBQ2QsYUFBYTtBQUFBLElBQ2IsYUFBYTtBQUFBLElBQ2IsTUFBTTtBQUFBLElBQ04sa0JBQWtCO0FBQUEsSUFDbEIsV0FBVztBQUFBLElBQ1gsY0FBYztBQUFBLElBQ2QsS0FBSztBQUFBLElBQ0wsT0FBTztBQUFBLElBQ1Asd0JBQXdCO0FBQUEsSUFDeEIsdUJBQXVCO0FBQUEsSUFDdkIsV0FBVztBQUFBLElBQ1gsV0FBVztBQUFBLElBQ1gsUUFBUTtBQUFBLElBQ1IsS0FBSztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsYUFBYTtBQUFBLElBQ2IsY0FBYztBQUFBLElBQ2QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsT0FBTztBQUFBLElBQ1AsV0FBVztBQUFBLElBQ1gsWUFBWTtBQUFBLElBQ1osWUFBWTtBQUFBLElBQ1osVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsWUFBWTtBQUFBLElBQ1osY0FBYztBQUFBLElBQ2QsZUFBZTtBQUFBLElBQ2YsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsV0FBVztBQUFBLElBQ1gsa0JBQWtCO0FBQUEsSUFDbEIsVUFBVTtBQUFBLElBQ1YsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsYUFBYTtBQUFBLElBQ2IsT0FBTztBQUFBLElBQ1AsWUFBWTtBQUFBLElBQ1osUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsYUFBYTtBQUFBLElBQ2IsWUFBWTtBQUFBLElBQ1osYUFBYTtBQUFBLElBQ2IsWUFBWTtBQUFBLElBQ1osYUFBYTtBQUFBLElBQ2IsUUFBUTtBQUFBLElBQ1Isa0JBQWtCO0FBQUEsSUFDbEIsV0FBVztBQUFBLElBQ1gsT0FBTztBQUFBLElBQ1AsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsV0FBVztBQUFBLElBQ1gsWUFBWTtBQUFBLElBQ1osY0FBYztBQUFBLElBQ2QsU0FBUztBQUFBLElBQ1QsV0FBVztBQUFBLElBQ1gsV0FBVztBQUFBLElBQ1gsWUFBWTtBQUFBLElBQ1osU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsY0FBYztBQUFBLElBQ2Qsa0JBQWtCO0FBQUEsSUFDbEIsYUFBYTtBQUFBLElBQ2IsV0FBVztBQUFBLElBQ1gsYUFBYTtBQUFBLElBQ2IsY0FBYztBQUFBLElBQ2QsY0FBYztBQUFBLElBQ2QsYUFBYTtBQUFBLElBQ2IsWUFBWTtBQUFBLElBQ1osYUFBYTtBQUFBLElBQ2IsV0FBVztBQUFBLElBQ1gsY0FBYztBQUFBLElBQ2QsV0FBVztBQUFBLElBQ1gsVUFBVTtBQUFBLElBQ1YsWUFBWTtBQUFBLElBQ1osWUFBWTtBQUFBLElBQ1osU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsWUFBWTtBQUFBLElBQ1osWUFBWTtBQUFBLElBQ1osY0FBYztBQUFBLElBQ2QsVUFBVTtBQUFBLElBQ1YsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLElBQ1YsV0FBVztBQUFBLElBQ1gsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsV0FBVztBQUFBLElBQ1gsVUFBVTtBQUFBLElBQ1YsV0FBVztBQUFBLElBQ1gsY0FBYztBQUFBLElBQ2QsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLElBQ1YsZ0JBQWdCO0FBQUEsSUFDaEIsV0FBVztBQUFBLElBQ1gsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsT0FBTztBQUFBLElBQ1AsUUFBUTtBQUFBLElBQ1IsYUFBYTtBQUFBLElBQ2IsUUFBUTtBQUFBLElBQ1IsVUFBVTtBQUFBLElBQ1YsU0FBUztBQUFBLElBQ1Qsa0JBQWtCO0FBQUEsSUFDbEIsbUJBQW1CO0FBQUEsSUFDbkIsWUFBWTtBQUFBLElBQ1osU0FBUztBQUFBLElBQ1QsTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLElBQ1oscUJBQXFCO0FBQUEsSUFDckIsa0JBQWtCO0FBQUEsSUFDbEIsY0FBYztBQUFBLElBQ2QsT0FBTztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLElBQ1AsZUFBZTtBQUFBLElBQ2YsZUFBZTtBQUFBLElBQ2YsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsV0FBVztBQUFBLElBQ1gsV0FBVztBQUFBLElBQ1gsZUFBZTtBQUFBLElBQ2YscUJBQXFCO0FBQUEsSUFDckIsZ0JBQWdCO0FBQUEsSUFDaEIsV0FBVztBQUFBLElBQ1gsVUFBVTtBQUFBLElBQ1YsR0FBRztBQUFBLElBQ0gsUUFBUTtBQUFBLElBQ1IsZ0JBQWdCO0FBQUEsSUFDaEIsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sS0FBSztBQUFBLElBQ0wsS0FBSztBQUFBLElBQ0wsaUJBQWlCO0FBQUEsSUFDakIsYUFBYTtBQUFBLElBQ2IsV0FBVztBQUFBLElBQ1gsb0JBQW9CO0FBQUEsSUFDcEIsa0JBQWtCO0FBQUEsSUFDbEIsZUFBZTtBQUFBLElBQ2YsaUJBQWlCO0FBQUEsSUFDakIsVUFBVTtBQUFBLElBQ1YsU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsUUFBUTtBQUFBLElBQ1IsSUFBSTtBQUFBLElBQ0osSUFBSTtBQUFBLElBQ0osT0FBTztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sZ0JBQWdCO0FBQUEsSUFDaEIsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLElBQ1AsY0FBYztBQUFBLElBQ2Qsa0JBQWtCO0FBQUEsSUFDbEIsa0JBQWtCO0FBQUEsSUFDbEIsY0FBYztBQUFBLElBQ2QsU0FBUztBQUFBLElBQ1QsYUFBYTtBQUFBLElBQ2IsY0FBYztBQUFBLElBQ2QsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsYUFBYTtBQUFBLElBQ2IsV0FBVztBQUFBLElBQ1gsYUFBYTtBQUFBLElBQ2IsdUJBQXVCO0FBQUEsSUFDdkIsd0JBQXdCO0FBQUEsSUFDeEIsUUFBUTtBQUFBLElBQ1IsUUFBUTtBQUFBLElBQ1IsaUJBQWlCO0FBQUEsSUFDakIsa0JBQWtCO0FBQUEsSUFDbEIsZUFBZTtBQUFBLElBQ2YsZ0JBQWdCO0FBQUEsSUFDaEIsa0JBQWtCO0FBQUEsSUFDbEIsZUFBZTtBQUFBLElBQ2YsYUFBYTtBQUFBLElBQ2IsT0FBTztBQUFBLElBQ1AsY0FBYztBQUFBLElBQ2QsY0FBYztBQUFBLElBQ2QscUJBQXFCO0FBQUEsSUFDckIsWUFBWTtBQUFBLElBQ1osZUFBZTtBQUFBLElBQ2Ysc0JBQXNCO0FBQUEsSUFDdEIsZ0JBQWdCO0FBQUEsSUFDaEIsVUFBVTtBQUFBLElBQ1YsYUFBYTtBQUFBLElBQ2IsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsWUFBWTtBQUFBLElBQ1osZ0JBQWdCO0FBQUEsSUFDaEIsZUFBZTtBQUFBLElBQ2YsWUFBWTtBQUFBLElBQ1osZUFBZTtBQUFBLElBQ2YsT0FBTztBQUFBLElBQ1AsbUJBQW1CO0FBQUEsSUFDbkIsTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLElBQ1IsSUFBSTtBQUFBLElBQ0osV0FBVztBQUFBLElBQ1gsaUJBQWlCO0FBQUEsSUFDakIsSUFBSTtBQUFBLElBQ0osSUFBSTtBQUFBLElBQ0osbUJBQW1CO0FBQUEsSUFDbkIsb0JBQW9CO0FBQUEsSUFDcEIsU0FBUztBQUFBLElBQ1QsYUFBYTtBQUFBLElBQ2IsY0FBYztBQUFBLElBQ2QsWUFBWTtBQUFBLElBQ1osUUFBUTtBQUFBLElBQ1IsYUFBYTtBQUFBLElBQ2IsZUFBZTtBQUFBLElBQ2YsY0FBYztBQUFBLElBQ2QsVUFBVTtBQUFBLElBQ1YsY0FBYztBQUFBLElBQ2QsU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsYUFBYTtBQUFBLElBQ2IsYUFBYTtBQUFBLElBQ2IsU0FBUztBQUFBLElBQ1QsWUFBWTtBQUFBLElBQ1osWUFBWTtBQUFBLElBQ1osT0FBTztBQUFBLElBQ1AsUUFBUTtBQUFBLElBQ1IsYUFBYTtBQUFBLElBQ2IsYUFBYTtBQUFBLElBQ2IsR0FBRztBQUFBLElBQ0gsSUFBSTtBQUFBLElBQ0osSUFBSTtBQUFBLElBQ0osa0JBQWtCO0FBQUEsSUFDbEIsU0FBUztBQUFBLElBQ1QsR0FBRztBQUFBLElBQ0gsSUFBSTtBQUFBLElBQ0osSUFBSTtBQUFBLElBQ0osa0JBQWtCO0FBQUEsSUFDbEIsR0FBRztBQUFBLElBQ0gsWUFBWTtBQUFBLEVBQ2Q7QUFBQSxFQUNBLE9BQU87QUFBQSxFQUNQLFdBQVc7QUFDYixDQUFDOzs7QUNwakJNLElBQU0sUUFBUSxPQUFPO0FBQUEsRUFDMUIsWUFBWTtBQUFBLElBQ1YsY0FBYztBQUFBLElBQ2QsY0FBYztBQUFBLElBQ2QsV0FBVztBQUFBLElBQ1gsV0FBVztBQUFBLElBQ1gsV0FBVztBQUFBLElBQ1gsWUFBWTtBQUFBLElBQ1osV0FBVztBQUFBLEVBQ2I7QUFBQSxFQUNBLE9BQU87QUFBQSxFQUNQLFNBQVMsQ0FBQyxHQUFHLFVBQVU7QUFBQSxJQUNyQixPQUFPLFdBQVcsU0FBUyxNQUFNLENBQUMsRUFBRSxZQUFZO0FBQUE7QUFFcEQsQ0FBQzs7O0FDYk0sSUFBTSxRQUFRLE9BQU87QUFBQSxFQUMxQixZQUFZLEVBQUMsWUFBWSxjQUFhO0FBQUEsRUFDdEMsWUFBWSxFQUFDLFlBQVksTUFBTSxPQUFPLEtBQUk7QUFBQSxFQUMxQyxPQUFPO0FBQUEsRUFDUCxXQUFXO0FBQ2IsQ0FBQzs7O0FDTk0sSUFBTSxNQUFNLE9BQU87QUFBQSxFQUN4QixZQUFZLEVBQUMsU0FBUyxNQUFNLFNBQVMsTUFBTSxVQUFVLEtBQUk7QUFBQSxFQUN6RCxPQUFPO0FBQUEsRUFDUCxTQUFTLENBQUMsR0FBRyxVQUFVO0FBQUEsSUFDckIsT0FBTyxTQUFTLFNBQVMsTUFBTSxDQUFDLEVBQUUsWUFBWTtBQUFBO0FBRWxELENBQUM7OztBQ0FELElBQU0sTUFBTTtBQUNaLElBQU0sT0FBTztBQUNiLElBQU0sUUFBUTtBQWdDUCxTQUFTLElBQUksQ0FBQyxRQUFRLE9BQU87QUFBQSxFQUNsQyxNQUFNLFNBQVMsVUFBVSxLQUFLO0FBQUEsRUFDOUIsSUFBSSxXQUFXO0FBQUEsRUFDZixJQUFJLE9BQU87QUFBQSxFQUVYLElBQUksVUFBVSxPQUFPLFFBQVE7QUFBQSxJQUMzQixPQUFPLE9BQU8sU0FBUyxPQUFPLE9BQU87QUFBQSxFQUN2QztBQUFBLEVBRUEsSUFBSSxPQUFPLFNBQVMsS0FBSyxPQUFPLE1BQU0sR0FBRyxDQUFDLE1BQU0sVUFBVSxNQUFNLEtBQUssS0FBSyxHQUFHO0FBQUEsSUFFM0UsSUFBSSxNQUFNLE9BQU8sQ0FBQyxNQUFNLEtBQUs7QUFBQSxNQUUzQixNQUFNLE9BQU8sTUFBTSxNQUFNLENBQUMsRUFBRSxRQUFRLE1BQU0sU0FBUztBQUFBLE1BQ25ELFdBQVcsU0FBUyxLQUFLLE9BQU8sQ0FBQyxFQUFFLFlBQVksSUFBSSxLQUFLLE1BQU0sQ0FBQztBQUFBLElBQ2pFLEVBQU87QUFBQSxNQUVMLE1BQU0sT0FBTyxNQUFNLE1BQU0sQ0FBQztBQUFBLE1BRTFCLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxHQUFHO0FBQUEsUUFDcEIsSUFBSSxTQUFTLEtBQUssUUFBUSxLQUFLLEtBQUs7QUFBQSxRQUVwQyxJQUFJLE9BQU8sT0FBTyxDQUFDLE1BQU0sS0FBSztBQUFBLFVBQzVCLFNBQVMsTUFBTTtBQUFBLFFBQ2pCO0FBQUEsUUFFQSxRQUFRLFNBQVM7QUFBQSxNQUNuQjtBQUFBO0FBQUEsSUFHRixPQUFPO0FBQUEsRUFDVDtBQUFBLEVBRUEsT0FBTyxJQUFJLEtBQUssVUFBVSxLQUFLO0FBQUE7QUFTakMsU0FBUyxLQUFLLENBQUMsSUFBSTtBQUFBLEVBQ2pCLE9BQU8sTUFBTSxHQUFHLFlBQVk7QUFBQTtBQVM5QixTQUFTLFNBQVMsQ0FBQyxJQUFJO0FBQUEsRUFDckIsT0FBTyxHQUFHLE9BQU8sQ0FBQyxFQUFFLFlBQVk7QUFBQTs7QUNwRjNCLElBQU0sUUFBTyxNQUFNLENBQUMsTUFBTSxNQUFVLE9BQU8sT0FBTyxHQUFHLEdBQUcsTUFBTTtBQUs5RCxJQUFNLE9BQU0sTUFBTSxDQUFDLE1BQU0sS0FBUyxPQUFPLE9BQU8sR0FBRyxHQUFHLEtBQUs7OztBQ2lDbEUsSUFBTSxNQUFNLENBQUMsRUFBRTtBQWNSLFNBQVMsTUFBTSxDQUFDLEtBQUssU0FBUztBQUFBLEVBQ25DLE1BQU0sV0FBVyxXQUFXLENBQUM7QUFBQSxFQThCN0IsU0FBUyxHQUFHLENBQUMsVUFBVSxZQUFZO0FBQUEsSUFFakMsSUFBSSxLQUFLLElBQUk7QUFBQSxJQUNiLE1BQU0sV0FBVyxJQUFJO0FBQUEsSUFFckIsSUFBSSxTQUFTLElBQUksS0FBSyxPQUFPLEdBQUcsR0FBRztBQUFBLE1BRWpDLE1BQU0sS0FBSyxPQUFPLE1BQU0sSUFBSTtBQUFBLE1BRTVCLEtBQUssSUFBSSxLQUFLLFVBQVUsRUFBRSxJQUFJLFNBQVMsTUFBTSxJQUFJO0FBQUEsSUFDbkQ7QUFBQSxJQUVBLElBQUksSUFBSTtBQUFBLE1BQ04sT0FBTyxHQUFHLEtBQUssTUFBTSxPQUFPLEdBQUcsVUFBVTtBQUFBLElBQzNDO0FBQUE7QUFBQSxFQUdGLElBQUksV0FBVyxTQUFTLFlBQVksQ0FBQztBQUFBLEVBQ3JDLElBQUksVUFBVSxTQUFTO0FBQUEsRUFDdkIsSUFBSSxVQUFVLFNBQVM7QUFBQSxFQUd2QixPQUFPO0FBQUE7OztBQ3JHVCxJQUFNLHFCQUFxQjtBQUMzQixJQUFNLHNCQUFzQjtBQUM1QixJQUFNLHlCQUVKO0FBQ0YsSUFBTSxtQkFBbUI7QUFHekIsSUFBTSxxQkFBcUIsSUFBSTtBQVN4QixTQUFTLElBQUksQ0FBQyxPQUFPLFNBQVM7QUFBQSxFQUNuQyxRQUFRLE1BQU0sUUFDWixRQUFRLFNBQ0osNkJBQTZCLFFBQVEsTUFBTSxJQUMzQyxvQkFDSixLQUNGO0FBQUEsRUFFQSxJQUFJLFFBQVEsVUFBVSxRQUFRLFlBQVk7QUFBQSxJQUN4QyxPQUFPO0FBQUEsRUFDVDtBQUFBLEVBRUEsT0FDRSxNQUVHLFFBQVEscUJBQXFCLFNBQVMsRUFHdEMsUUFBUSx3QkFBd0IsS0FBSztBQUFBLEVBUTFDLFNBQVMsU0FBUyxDQUFDLE1BQU0sT0FBTyxLQUFLO0FBQUEsSUFDbkMsT0FBTyxRQUFRLFFBQ1osS0FBSyxXQUFXLENBQUMsSUFBSSxTQUFVLE9BQzlCLEtBQUssV0FBVyxDQUFDLElBQ2pCLFFBQ0EsT0FDRixJQUFJLFdBQVcsUUFBUSxDQUFDLEdBQ3hCLE9BQ0Y7QUFBQTtBQUFBLEVBUUYsU0FBUyxLQUFLLENBQUMsV0FBVyxPQUFPLEtBQUs7QUFBQSxJQUNwQyxPQUFPLFFBQVEsT0FDYixVQUFVLFdBQVcsQ0FBQyxHQUN0QixJQUFJLFdBQVcsUUFBUSxDQUFDLEdBQ3hCLE9BQ0Y7QUFBQTtBQUFBO0FBWUosU0FBUyw0QkFBNEIsQ0FBQyxRQUFRO0FBQUEsRUFDNUMsSUFBSSxTQUFTLG1CQUFtQixJQUFJLE1BQU07QUFBQSxFQUUxQyxJQUFJLENBQUMsUUFBUTtBQUFBLElBQ1gsU0FBUyx1QkFBdUIsTUFBTTtBQUFBLElBQ3RDLG1CQUFtQixJQUFJLFFBQVEsTUFBTTtBQUFBLEVBQ3ZDO0FBQUEsRUFFQSxPQUFPO0FBQUE7QUFPVCxTQUFTLHNCQUFzQixDQUFDLFFBQVE7QUFBQSxFQUV0QyxNQUFNLFNBQVMsQ0FBQztBQUFBLEVBQ2hCLElBQUksUUFBUTtBQUFBLEVBRVosT0FBTyxFQUFFLFFBQVEsT0FBTyxRQUFRO0FBQUEsSUFDOUIsT0FBTyxLQUFLLE9BQU8sT0FBTyxRQUFRLGtCQUFrQixNQUFNLENBQUM7QUFBQSxFQUM3RDtBQUFBLEVBRUEsT0FBTyxJQUFJLE9BQU8sUUFBUSxPQUFPLEtBQUssR0FBRyxJQUFJLEtBQUssR0FBRztBQUFBOzs7QUNuSHZELElBQU0sbUJBQW1CO0FBVWxCLFNBQVMsYUFBYSxDQUFDLE1BQU0sTUFBTSxNQUFNO0FBQUEsRUFDOUMsTUFBTSxRQUFRLFFBQVEsS0FBSyxTQUFTLEVBQUUsRUFBRSxZQUFZO0FBQUEsRUFDcEQsT0FBTyxRQUFRLFFBQVEsQ0FBQyxpQkFBaUIsS0FBSyxPQUFPLGFBQWEsSUFBSSxDQUFDLElBQ25FLFFBQ0EsUUFBUTtBQUFBOzs7QUNkZCxJQUFNLGVBQWU7QUFVZCxTQUFTLFNBQVMsQ0FBQyxNQUFNLE1BQU0sTUFBTTtBQUFBLEVBQzFDLE1BQU0sUUFBUSxPQUFPLE9BQU8sSUFBSTtBQUFBLEVBQ2hDLE9BQU8sUUFBUSxRQUFRLENBQUMsYUFBYSxLQUFLLE9BQU8sYUFBYSxJQUFJLENBQUMsSUFDL0QsUUFDQSxRQUFRO0FBQUE7OztBQ1RQLElBQU0sMEJBQTBCO0FBQUEsRUFDckM7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRjs7O0FDM0dPLElBQU0seUJBQXlCO0FBQUEsRUFDcEMsTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLEVBQ1AsTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLEVBQ1AsUUFBUTtBQUFBLEVBQ1IsS0FBSztBQUFBLEVBQ0wsUUFBUTtBQUFBLEVBQ1IsTUFBTTtBQUFBLEVBQ04sS0FBSztBQUFBLEVBQ0wsTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLEVBQ1AsS0FBSztBQUFBLEVBQ0wsS0FBSztBQUFBLEVBQ0wsS0FBSztBQUFBLEVBQ0wsTUFBTTtBQUFBLEVBQ04sS0FBSztBQUFBLEVBQ0wsUUFBUTtBQUFBLEVBQ1IsTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLEVBQ1AsT0FBTztBQUFBLEVBQ1AsTUFBTTtBQUFBLEVBQ04sUUFBUTtBQUFBLEVBQ1IsT0FBTztBQUFBLEVBQ1AsTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLEVBQ1AsUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsT0FBTztBQUFBLEVBQ1AsUUFBUTtBQUFBLEVBQ1IsTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLEVBQ1AsT0FBTztBQUFBLEVBQ1AsUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsT0FBTztBQUFBLEVBQ1AsTUFBTTtBQUFBLEVBQ04sUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsT0FBTztBQUFBLEVBQ1AsTUFBTTtBQUFBLEVBQ04sS0FBSztBQUFBLEVBQ0wsUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsT0FBTztBQUFBLEVBQ1AsUUFBUTtBQUFBLEVBQ1IsTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLEVBQ1AsUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsT0FBTztBQUFBLEVBQ1AsTUFBTTtBQUFBLEVBQ04sUUFBUTtBQUFBLEVBQ1IsT0FBTztBQUFBLEVBQ1AsT0FBTztBQUFBLEVBQ1AsUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsT0FBTztBQUFBLEVBQ1AsUUFBUTtBQUFBLEVBQ1IsTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLEVBQ1AsT0FBTztBQUFBLEVBQ1AsUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsT0FBTztBQUFBLEVBQ1AsTUFBTTtBQUFBLEVBQ04sUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsT0FBTztBQUFBLEVBQ1AsTUFBTTtBQUFBLEVBQ04sS0FBSztBQUFBLEVBQ0wsUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsT0FBTztBQUFBLEVBQ1AsUUFBUTtBQUFBLEVBQ1IsTUFBTTtBQUFBLEVBQ04sUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsT0FBTztBQUFBLEVBQ1AsTUFBTTtBQUFBLEVBQ04sUUFBUTtBQUFBLEVBQ1IsT0FBTztBQUFBLEVBQ1AsTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLEVBQ1AsTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLEVBQ1AsT0FBTztBQUFBLEVBQ1AsU0FBUztBQUFBLEVBQ1QsTUFBTTtBQUFBLEVBQ04sS0FBSztBQUFBLEVBQ0wsT0FBTztBQUFBLEVBQ1AsTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLEVBQ1AsUUFBUTtBQUFBLEVBQ1IsSUFBSTtBQUFBLEVBQ0osSUFBSTtBQUFBLEVBQ0osSUFBSTtBQUFBLEVBQ0osU0FBUztBQUFBLEVBQ1QsSUFBSTtBQUFBLEVBQ0osS0FBSztBQUFBLEVBQ0wsT0FBTztBQUFBLEVBQ1AsS0FBSztBQUFBLEVBQ0wsU0FBUztBQUFBLEVBQ1QsS0FBSztBQUFBLEVBQ0wsS0FBSztBQUFBLEVBQ0wsS0FBSztBQUFBLEVBQ0wsT0FBTztBQUFBLEVBQ1AsT0FBTztBQUFBLEVBQ1AsTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLEVBQ1AsT0FBTztBQUFBLEVBQ1AsU0FBUztBQUFBLEVBQ1QsTUFBTTtBQUFBLEVBQ04sS0FBSztBQUFBLEVBQ0wsT0FBTztBQUFBLEVBQ1AsTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLEVBQ1AsUUFBUTtBQUFBLEVBQ1IsSUFBSTtBQUFBLEVBQ0osSUFBSTtBQUFBLEVBQ0osSUFBSTtBQUFBLEVBQ0osU0FBUztBQUFBLEVBQ1QsSUFBSTtBQUFBLEVBQ0osS0FBSztBQUFBLEVBQ0wsUUFBUTtBQUFBLEVBQ1IsT0FBTztBQUFBLEVBQ1AsS0FBSztBQUFBLEVBQ0wsU0FBUztBQUFBLEVBQ1QsS0FBSztBQUFBLEVBQ0wsS0FBSztBQUFBLEVBQ0wsS0FBSztBQUFBLEVBQ0wsT0FBTztBQUFBLEVBQ1AsVUFBVTtBQUFBLEVBQ1YsT0FBTztBQUFBLEVBQ1AsS0FBSztBQUFBLEVBQ0wsTUFBTTtBQUFBLEVBQ04sUUFBUTtBQUFBLEVBQ1IsT0FBTztBQUFBLEVBQ1AsT0FBTztBQUFBLEVBQ1AsT0FBTztBQUFBLEVBQ1AsT0FBTztBQUFBLEVBQ1AsUUFBUTtBQUFBLEVBQ1IsT0FBTztBQUFBLEVBQ1AsTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLEVBQ1AsU0FBUztBQUFBLEVBQ1QsTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLEVBQ1AsTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sUUFBUTtBQUFBLEVBQ1IsTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLEVBQ1AsT0FBTztBQUFBLEVBQ1AsT0FBTztBQUFBLEVBQ1AsTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLEVBQ1AsSUFBSTtBQUFBLEVBQ0osTUFBTTtBQUFBLEVBQ04sS0FBSztBQUFBLEVBQ0wsT0FBTztBQUFBLEVBQ1AsUUFBUTtBQUFBLEVBQ1IsT0FBTztBQUFBLEVBQ1AsTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLEVBQ1AsS0FBSztBQUFBLEVBQ0wsS0FBSztBQUFBLEVBQ0wsSUFBSTtBQUFBLEVBQ0osS0FBSztBQUFBLEVBQ0wsS0FBSztBQUFBLEVBQ0wsS0FBSztBQUFBLEVBQ0wsUUFBUTtBQUFBLEVBQ1IsS0FBSztBQUFBLEVBQ0wsTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLEVBQ1AsSUFBSTtBQUFBLEVBQ0osT0FBTztBQUFBLEVBQ1AsSUFBSTtBQUFBLEVBQ0osSUFBSTtBQUFBLEVBQ0osS0FBSztBQUFBLEVBQ0wsS0FBSztBQUFBLEVBQ0wsTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLEVBQ1AsUUFBUTtBQUFBLEVBQ1IsTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLEVBQ1AsT0FBTztBQUFBLEVBQ1AsUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sS0FBSztBQUFBLEVBQ0wsUUFBUTtBQUFBLEVBQ1IsT0FBTztBQUFBLEVBQ1AsUUFBUTtBQUFBLEVBQ1IsT0FBTztBQUFBLEVBQ1AsTUFBTTtBQUFBLEVBQ04sS0FBSztBQUFBLEVBQ0wsSUFBSTtBQUFBLEVBQ0osSUFBSTtBQUFBLEVBQ0osT0FBTztBQUFBLEVBQ1AsT0FBTztBQUFBLEVBQ1AsUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLEVBQ1AsTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sUUFBUTtBQUFBLEVBQ1IsTUFBTTtBQUFBLEVBQ04sS0FBSztBQUFBLEVBQ0wsS0FBSztBQUFBLEVBQ0wsS0FBSztBQUFBLEVBQ0wsT0FBTztBQUFBLEVBQ1AsT0FBTztBQUFBLEVBQ1AsT0FBTztBQUFBLEVBQ1AsT0FBTztBQUFBLEVBQ1AsT0FBTztBQUFBLEVBQ1AsT0FBTztBQUFBLEVBQ1AsT0FBTztBQUFBLEVBQ1AsT0FBTztBQUFBLEVBQ1AsUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsTUFBTTtBQUNSOzs7QUM1UE8sSUFBTSxZQUFZO0FBQUEsRUFDdkI7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0Y7OztBQ1hBLElBQU0sT0FBTSxDQUFDLEVBQUU7QUFPZixJQUFNLGFBQWEsQ0FBQztBQUdwQixJQUFJO0FBRUosS0FBSyxPQUFPLHdCQUF3QjtBQUFBLEVBQ2xDLElBQUksS0FBSSxLQUFLLHdCQUF3QixHQUFHLEdBQUc7QUFBQSxJQUN6QyxXQUFXLHVCQUF1QixRQUFRO0FBQUEsRUFDNUM7QUFDRjtBQUVBLElBQU0sdUJBQXVCO0FBV3RCLFNBQVMsT0FBTyxDQUFDLE1BQU0sTUFBTSxNQUFNLFdBQVc7QUFBQSxFQUNuRCxNQUFNLFlBQVksT0FBTyxhQUFhLElBQUk7QUFBQSxFQUUxQyxJQUFJLEtBQUksS0FBSyxZQUFZLFNBQVMsR0FBRztBQUFBLElBQ25DLE1BQU0sT0FBTyxXQUFXO0FBQUEsSUFDeEIsTUFBTSxRQUFRLE1BQU07QUFBQSxJQUVwQixJQUNFLFFBQ0Esd0JBQXdCLFNBQVMsSUFBSSxLQUNyQyxDQUFDLFVBQVUsU0FBUyxJQUFJLE1BQ3ZCLENBQUMsYUFDQyxRQUNDLFNBQVMsTUFDVCxxQkFBcUIsS0FBSyxPQUFPLGFBQWEsSUFBSSxDQUFDLElBQ3ZEO0FBQUEsTUFDQSxPQUFPO0FBQUEsSUFDVDtBQUFBLElBRUEsT0FBTyxRQUFRO0FBQUEsRUFDakI7QUFBQSxFQUVBLE9BQU87QUFBQTs7O0FDMUJGLFNBQVMsV0FBVyxDQUFDLE1BQU0sTUFBTSxTQUFTO0FBQUEsRUFDL0MsSUFBSSxVQUFVLGNBQWMsTUFBTSxNQUFNLFFBQVEsc0JBQXNCO0FBQUEsRUFFdEUsSUFBSTtBQUFBLEVBRUosSUFBSSxRQUFRLHNCQUFzQixRQUFRLHVCQUF1QjtBQUFBLElBQy9ELFFBQVEsUUFDTixNQUNBLE1BQ0EsUUFBUSx3QkFDUixRQUFRLFNBQ1Y7QUFBQSxFQUNGO0FBQUEsRUFZQSxLQUNHLFFBQVEseUJBQXlCLENBQUMsVUFDbkMsUUFBUSx1QkFDUjtBQUFBLElBQ0EsTUFBTSxVQUFVLFVBQVUsTUFBTSxNQUFNLFFBQVEsc0JBQXNCO0FBQUEsSUFFcEUsSUFBSSxRQUFRLFNBQVMsUUFBUSxRQUFRO0FBQUEsTUFDbkMsVUFBVTtBQUFBLElBQ1o7QUFBQSxFQUNGO0FBQUEsRUFFQSxPQUFPLFVBQ0osQ0FBQyxRQUFRLHlCQUF5QixNQUFNLFNBQVMsUUFBUSxVQUN4RCxRQUNBO0FBQUE7OztBQ2hEQyxTQUFTLGlCQUFpQixDQUFDLE9BQU8sU0FBUztBQUFBLEVBQ2hELE9BQU8sS0FBSyxPQUFPLE9BQU8sT0FBTyxFQUFDLFFBQVEsWUFBVyxHQUFHLE9BQU8sQ0FBQztBQUFBOzs7QUNibEUsSUFBTSxtQkFBbUI7QUFHekIsSUFBTSwyQkFBMkIsQ0FBQyxHQUFHO0FBQ3JDLElBQU0sc0JBQXNCLENBQUMsS0FBSyxHQUFHO0FBZ0I5QixTQUFTLE9BQU8sQ0FBQyxNQUFNLElBQUksSUFBSSxPQUFPO0FBQUEsRUFFM0MsT0FBTyxNQUFNLFNBQVMsZ0JBQ2xCLE9BQ0Usa0JBQ0UsS0FBSyxPQUNMLE9BQU8sT0FBTyxDQUFDLEdBQUcsTUFBTSxTQUFTLHFCQUFxQjtBQUFBLElBQ3BELFFBQVE7QUFBQSxFQUNWLENBQUMsQ0FDSCxJQUNBLE1BQ0YsU0FBUyxLQUFLLE1BQU0sUUFBUSxrQkFBa0IsTUFBTSxJQUFJO0FBQUEsRUFLNUQsU0FBUyxNQUFNLENBQUMsSUFBSTtBQUFBLElBQ2xCLE9BQU8sa0JBQ0wsSUFDQSxPQUFPLE9BQU8sQ0FBQyxHQUFHLE1BQU0sU0FBUyxxQkFBcUI7QUFBQSxNQUNwRCxRQUFRO0FBQUEsSUFDVixDQUFDLENBQ0g7QUFBQTtBQUFBOzs7QUM5QkcsU0FBUyxPQUFPLENBQUMsSUFBSSxJQUFJLElBQUksT0FBTztBQUFBLEVBQ3pDLE9BQ0UsUUFDQyxNQUFNLFNBQVMsZUFBZSxZQUFZLGNBQzFDLE1BQU0sU0FBUyxlQUFlLEtBQUssT0FDcEM7QUFBQTs7O0FDZEcsU0FBUyxNQUFNLENBQUMsT0FBTyxXQUFXO0FBQUEsRUFDdkMsTUFBTSxTQUFTLE9BQU8sS0FBSztBQUFBLEVBRTNCLElBQUksT0FBTyxjQUFjLFVBQVU7QUFBQSxJQUNqQyxNQUFNLElBQUksVUFBVSxvQkFBb0I7QUFBQSxFQUMxQztBQUFBLEVBRUEsSUFBSSxRQUFRO0FBQUEsRUFDWixJQUFJLFFBQVEsT0FBTyxRQUFRLFNBQVM7QUFBQSxFQUVwQyxPQUFPLFVBQVUsSUFBSTtBQUFBLElBQ25CO0FBQUEsSUFDQSxRQUFRLE9BQU8sUUFBUSxXQUFXLFFBQVEsVUFBVSxNQUFNO0FBQUEsRUFDNUQ7QUFBQSxFQUVBLE9BQU87QUFBQTs7O0FDbUNGLFNBQVMsU0FBUyxDQUFDLFFBQVEsU0FBUztBQUFBLEVBQ3pDLE1BQU0sV0FBVyxXQUFXLENBQUM7QUFBQSxFQUc3QixNQUFNLFFBQVEsT0FBTyxPQUFPLFNBQVMsT0FBTyxLQUFLLENBQUMsR0FBRyxRQUFRLEVBQUUsSUFBSTtBQUFBLEVBRW5FLE9BQU8sTUFDSixNQUNFLFNBQVMsV0FBVyxNQUFNLE1BQ3pCLE9BQ0MsU0FBUyxZQUFZLFFBQVEsS0FBSyxJQUN2QyxFQUNDLEtBQUs7QUFBQTs7O0FDbkRILFNBQVMsVUFBUyxDQUFDLFFBQVE7QUFBQSxFQUNoQyxPQUFPLE9BQU8sS0FBSyxHQUFHLEVBQUUsS0FBSztBQUFBOzs7QUNoQi9CLElBQU0sS0FBSztBQWFKLFNBQVMsVUFBVSxDQUFDLE9BQU87QUFBQSxFQUNoQyxPQUFPLE9BQU8sVUFBVSxXQUNwQixNQUFNLFNBQVMsU0FDYixNQUFNLE1BQU0sS0FBSyxJQUNqQixRQUNGLE1BQU0sS0FBSztBQUFBO0FBT2pCLFNBQVMsS0FBSyxDQUFDLE9BQU87QUFBQSxFQUNwQixPQUFPLE1BQU0sUUFBUSxJQUFJLEVBQUUsTUFBTTtBQUFBOztBQzFCNUIsSUFBTSxlQUFlLFNBQVMsQ0FBQztBQUMvQixJQUFNLGdCQUFnQixTQUFTLEVBQUU7QUFHeEMsSUFBTSxnQkFBZ0IsQ0FBQztBQU92QixTQUFTLFFBQVEsQ0FBQyxZQUFXO0FBQUEsRUFDM0IsT0FBTztBQUFBLEVBZ0JQLFNBQVMsT0FBTyxDQUFDLFFBQVEsT0FBTyxtQkFBbUI7QUFBQSxJQUNqRCxNQUFNLFlBQVcsU0FBUyxPQUFPLFdBQVc7QUFBQSxJQUM1QyxJQUFJLFVBQVUsU0FBUyxLQUFLO0FBQUEsSUFDNUIsSUFBSSxPQUFPLFVBQVM7QUFBQSxJQUVwQixJQUFJLENBQUMsbUJBQW1CO0FBQUEsTUFDdEIsT0FBTyxRQUFRLFdBQVcsSUFBSSxHQUFHO0FBQUEsUUFDL0IsVUFBVTtBQUFBLFFBQ1YsT0FBTyxVQUFTO0FBQUEsTUFDbEI7QUFBQSxJQUNGO0FBQUEsSUFHQSxPQUFPO0FBQUE7QUFBQTs7O0FDN0JYLElBQU0sT0FBTSxDQUFDLEVBQUU7QUFXUixTQUFTLFFBQVEsQ0FBQyxVQUFVO0FBQUEsRUFDakMsT0FBTztBQUFBLEVBT1AsU0FBUyxJQUFJLENBQUMsTUFBTSxPQUFPLFFBQVE7QUFBQSxJQUNqQyxPQUNFLEtBQUksS0FBSyxVQUFVLEtBQUssT0FBTyxLQUMvQixTQUFTLEtBQUssU0FBUyxNQUFNLE9BQU8sTUFBTTtBQUFBO0FBQUE7OztBQ2hDekMsSUFBTSxVQUFVLFNBQVM7QUFBQSxFQUM5QjtBQUFBLEVBQ0EsU0FBUztBQUFBLEVBQ1QsVUFBVTtBQUFBLEVBQ1Y7QUFBQSxFQUNBO0FBQUEsRUFDQSxNQUFNO0FBQUEsRUFDTjtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBLElBQUk7QUFBQSxFQUNKLElBQUk7QUFBQSxFQUNKO0FBQUEsRUFDQSxJQUFJO0FBQUEsRUFDSjtBQUFBLEVBQ0EsSUFBSTtBQUFBLEVBQ0o7QUFBQSxFQUNBO0FBQ0YsQ0FBQztBQWNELFNBQVMsdUJBQXVCLENBQUMsR0FBRyxPQUFPLFFBQVE7QUFBQSxFQUNqRCxNQUFNLE9BQU8sYUFBYSxRQUFRLE9BQU8sSUFBSTtBQUFBLEVBQzdDLE9BQ0UsQ0FBQyxRQUNBLEtBQUssU0FBUyxhQUNiLEVBQUUsS0FBSyxTQUFTLFVBQVUsV0FBVyxLQUFLLE1BQU0sT0FBTyxDQUFDLENBQUM7QUFBQTtBQWdCL0QsU0FBUyxLQUFJLENBQUMsR0FBRyxPQUFPLFFBQVE7QUFBQSxFQUM5QixNQUFNLE9BQU8sYUFBYSxRQUFRLEtBQUs7QUFBQSxFQUN2QyxPQUFPLENBQUMsUUFBUSxLQUFLLFNBQVM7QUFBQTtBQWVoQyxTQUFTLElBQUksQ0FBQyxHQUFHLE9BQU8sUUFBUTtBQUFBLEVBQzlCLE1BQU0sT0FBTyxhQUFhLFFBQVEsS0FBSztBQUFBLEVBQ3ZDLE9BQU8sQ0FBQyxRQUFRLEtBQUssU0FBUztBQUFBO0FBZWhDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxRQUFRO0FBQUEsRUFDM0IsTUFBTSxPQUFPLGFBQWEsUUFBUSxLQUFLO0FBQUEsRUFDdkMsT0FBTyxPQUNILEtBQUssU0FBUyxjQUNYLEtBQUssWUFBWSxhQUNoQixLQUFLLFlBQVksYUFDakIsS0FBSyxZQUFZLFdBQ2pCLEtBQUssWUFBWSxnQkFDakIsS0FBSyxZQUFZLGFBQ2pCLEtBQUssWUFBWSxTQUNqQixLQUFLLFlBQVksUUFDakIsS0FBSyxZQUFZLGNBQ2pCLEtBQUssWUFBWSxnQkFDakIsS0FBSyxZQUFZLFlBQ2pCLEtBQUssWUFBWSxZQUNqQixLQUFLLFlBQVksVUFDakIsS0FBSyxZQUFZLFFBQ2pCLEtBQUssWUFBWSxRQUNqQixLQUFLLFlBQVksUUFDakIsS0FBSyxZQUFZLFFBQ2pCLEtBQUssWUFBWSxRQUNqQixLQUFLLFlBQVksUUFDakIsS0FBSyxZQUFZLFlBQ2pCLEtBQUssWUFBWSxZQUNqQixLQUFLLFlBQVksUUFDakIsS0FBSyxZQUFZLFVBQ2pCLEtBQUssWUFBWSxVQUNqQixLQUFLLFlBQVksU0FDakIsS0FBSyxZQUFZLFFBQ2pCLEtBQUssWUFBWSxPQUNqQixLQUFLLFlBQVksU0FDakIsS0FBSyxZQUFZLGFBQ2pCLEtBQUssWUFBWSxXQUNqQixLQUFLLFlBQVksUUFDckIsQ0FBQyxVQUVDLEVBQ0UsT0FBTyxTQUFTLGNBQ2YsT0FBTyxZQUFZLE9BQ2xCLE9BQU8sWUFBWSxXQUNuQixPQUFPLFlBQVksU0FDbkIsT0FBTyxZQUFZLFNBQ25CLE9BQU8sWUFBWSxTQUNuQixPQUFPLFlBQVksY0FDbkIsT0FBTyxZQUFZO0FBQUE7QUFnQi9CLFNBQVMsRUFBRSxDQUFDLEdBQUcsT0FBTyxRQUFRO0FBQUEsRUFDNUIsTUFBTSxPQUFPLGFBQWEsUUFBUSxLQUFLO0FBQUEsRUFDdkMsT0FBTyxDQUFDLFFBQVMsS0FBSyxTQUFTLGFBQWEsS0FBSyxZQUFZO0FBQUE7QUFlL0QsU0FBUyxFQUFFLENBQUMsR0FBRyxPQUFPLFFBQVE7QUFBQSxFQUM1QixNQUFNLE9BQU8sYUFBYSxRQUFRLEtBQUs7QUFBQSxFQUN2QyxPQUFPLFFBQ0wsUUFDRSxLQUFLLFNBQVMsY0FDYixLQUFLLFlBQVksUUFBUSxLQUFLLFlBQVksS0FDL0M7QUFBQTtBQWVGLFNBQVMsRUFBRSxDQUFDLEdBQUcsT0FBTyxRQUFRO0FBQUEsRUFDNUIsTUFBTSxPQUFPLGFBQWEsUUFBUSxLQUFLO0FBQUEsRUFDdkMsT0FDRSxDQUFDLFFBQ0EsS0FBSyxTQUFTLGNBQ1osS0FBSyxZQUFZLFFBQVEsS0FBSyxZQUFZO0FBQUE7QUFnQmpELFNBQVMsV0FBVyxDQUFDLEdBQUcsT0FBTyxRQUFRO0FBQUEsRUFDckMsTUFBTSxPQUFPLGFBQWEsUUFBUSxLQUFLO0FBQUEsRUFDdkMsT0FDRSxDQUFDLFFBQ0EsS0FBSyxTQUFTLGNBQ1osS0FBSyxZQUFZLFFBQVEsS0FBSyxZQUFZO0FBQUE7QUFnQmpELFNBQVMsUUFBUSxDQUFDLEdBQUcsT0FBTyxRQUFRO0FBQUEsRUFDbEMsTUFBTSxPQUFPLGFBQWEsUUFBUSxLQUFLO0FBQUEsRUFDdkMsT0FBTyxDQUFDLFFBQVMsS0FBSyxTQUFTLGFBQWEsS0FBSyxZQUFZO0FBQUE7QUFlL0QsU0FBUyxNQUFNLENBQUMsR0FBRyxPQUFPLFFBQVE7QUFBQSxFQUNoQyxNQUFNLE9BQU8sYUFBYSxRQUFRLEtBQUs7QUFBQSxFQUN2QyxPQUNFLENBQUMsUUFDQSxLQUFLLFNBQVMsY0FDWixLQUFLLFlBQVksWUFBWSxLQUFLLFlBQVk7QUFBQTtBQWdCckQsU0FBUyxLQUFLLENBQUMsR0FBRyxPQUFPLFFBQVE7QUFBQSxFQUMvQixNQUFNLE9BQU8sYUFBYSxRQUFRLEtBQUs7QUFBQSxFQUN2QyxPQUFPLFFBQ0wsUUFDRSxLQUFLLFNBQVMsY0FDYixLQUFLLFlBQVksV0FBVyxLQUFLLFlBQVksUUFDbEQ7QUFBQTtBQWVGLFNBQVMsS0FBSyxDQUFDLEdBQUcsT0FBTyxRQUFRO0FBQUEsRUFDL0IsTUFBTSxPQUFPLGFBQWEsUUFBUSxLQUFLO0FBQUEsRUFDdkMsT0FDRSxDQUFDLFFBQ0EsS0FBSyxTQUFTLGNBQ1osS0FBSyxZQUFZLFdBQVcsS0FBSyxZQUFZO0FBQUE7QUFnQnBELFNBQVMsS0FBSyxDQUFDLEdBQUcsT0FBTyxRQUFRO0FBQUEsRUFDL0IsT0FBTyxDQUFDLGFBQWEsUUFBUSxLQUFLO0FBQUE7QUFlcEMsU0FBUyxFQUFFLENBQUMsR0FBRyxPQUFPLFFBQVE7QUFBQSxFQUM1QixNQUFNLE9BQU8sYUFBYSxRQUFRLEtBQUs7QUFBQSxFQUN2QyxPQUFPLENBQUMsUUFBUyxLQUFLLFNBQVMsYUFBYSxLQUFLLFlBQVk7QUFBQTtBQWUvRCxTQUFTLEtBQUssQ0FBQyxHQUFHLE9BQU8sUUFBUTtBQUFBLEVBQy9CLE1BQU0sT0FBTyxhQUFhLFFBQVEsS0FBSztBQUFBLEVBQ3ZDLE9BQ0UsQ0FBQyxRQUNBLEtBQUssU0FBUyxjQUNaLEtBQUssWUFBWSxRQUFRLEtBQUssWUFBWTtBQUFBOzs7QUMxVjFDLElBQU0sVUFBVSxTQUFTO0FBQUEsRUFDOUI7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0YsQ0FBQztBQVVELFNBQVMsS0FBSSxDQUFDLE1BQU07QUFBQSxFQUNsQixNQUFNLE9BQU8sYUFBYSxNQUFNLEVBQUU7QUFBQSxFQUNsQyxPQUFPLENBQUMsUUFBUSxLQUFLLFNBQVM7QUFBQTtBQVdoQyxTQUFTLElBQUksQ0FBQyxNQUFNO0FBQUEsRUFFbEIsTUFBTSxPQUFPLElBQUk7QUFBQSxFQUlqQixXQUFXLFVBQVMsS0FBSyxVQUFVO0FBQUEsSUFDakMsSUFDRSxPQUFNLFNBQVMsY0FDZCxPQUFNLFlBQVksVUFBVSxPQUFNLFlBQVksVUFDL0M7QUFBQSxNQUNBLElBQUksS0FBSyxJQUFJLE9BQU0sT0FBTztBQUFBLFFBQUcsT0FBTztBQUFBLE1BQ3BDLEtBQUssSUFBSSxPQUFNLE9BQU87QUFBQSxJQUN4QjtBQUFBLEVBQ0Y7QUFBQSxFQUlBLE1BQU0sUUFBUSxLQUFLLFNBQVM7QUFBQSxFQUM1QixPQUFPLENBQUMsU0FBUyxNQUFNLFNBQVM7QUFBQTtBQVdsQyxTQUFTLEtBQUksQ0FBQyxNQUFNO0FBQUEsRUFDbEIsTUFBTSxRQUFPLGFBQWEsTUFBTSxJQUFJLElBQUk7QUFBQSxFQUV4QyxPQUNFLENBQUMsU0FDQSxNQUFLLFNBQVMsYUFDYixFQUFFLE1BQUssU0FBUyxVQUFVLFdBQVcsTUFBSyxNQUFNLE9BQU8sQ0FBQyxDQUFDLE1BQ3pELEVBQ0UsTUFBSyxTQUFTLGNBQ2IsTUFBSyxZQUFZLFVBQ2hCLE1BQUssWUFBWSxVQUNqQixNQUFLLFlBQVksWUFDakIsTUFBSyxZQUFZLFdBQ2pCLE1BQUssWUFBWTtBQUFBO0FBb0IzQixTQUFTLFFBQVEsQ0FBQyxNQUFNLE9BQU8sUUFBUTtBQUFBLEVBQ3JDLE1BQU0sV0FBVyxjQUFjLFFBQVEsS0FBSztBQUFBLEVBQzVDLE1BQU0sUUFBTyxhQUFhLE1BQU0sSUFBSSxJQUFJO0FBQUEsRUFHeEMsSUFDRSxVQUNBLFlBQ0EsU0FBUyxTQUFTLGFBQ2xCLFNBQVMsWUFBWSxjQUNyQixRQUFRLFVBQVUsT0FBTyxTQUFTLFFBQVEsUUFBUSxHQUFHLE1BQU0sR0FDM0Q7QUFBQSxJQUNBLE9BQU87QUFBQSxFQUNUO0FBQUEsRUFFQSxPQUFPLFFBQVEsU0FBUSxNQUFLLFNBQVMsYUFBYSxNQUFLLFlBQVksS0FBSztBQUFBO0FBZTFFLFNBQVMsTUFBSyxDQUFDLE1BQU0sT0FBTyxRQUFRO0FBQUEsRUFDbEMsTUFBTSxXQUFXLGNBQWMsUUFBUSxLQUFLO0FBQUEsRUFDNUMsTUFBTSxRQUFPLGFBQWEsTUFBTSxFQUFFO0FBQUEsRUFHbEMsSUFDRSxVQUNBLFlBQ0EsU0FBUyxTQUFTLGNBQ2pCLFNBQVMsWUFBWSxXQUFXLFNBQVMsWUFBWSxZQUN0RCxRQUFRLFVBQVUsT0FBTyxTQUFTLFFBQVEsUUFBUSxHQUFHLE1BQU0sR0FDM0Q7QUFBQSxJQUNBLE9BQU87QUFBQSxFQUNUO0FBQUEsRUFFQSxPQUFPLFFBQVEsU0FBUSxNQUFLLFNBQVMsYUFBYSxNQUFLLFlBQVksSUFBSTtBQUFBOzs7QUM1SHpFLElBQU0sWUFBWTtBQUFBLEVBRWhCLE1BQU07QUFBQSxJQUNKLENBQUM7QUFBQSxXQUFnQixNQUFNLEVBQUUsR0FBRztBQUFBLGVBQW9CLE1BQU0sRUFBRSxDQUFDO0FBQUEsSUFDekQsQ0FBQztBQUFBLGNBQXNCLE1BQU0sRUFBRSxHQUFHO0FBQUEsZ0JBQXVCLE1BQU0sRUFBRSxDQUFDO0FBQUEsRUFDcEU7QUFBQSxFQUVBLFVBQVU7QUFBQSxJQUNSLENBQUM7QUFBQSxTQUFjLE1BQU0sRUFBRSxHQUFHO0FBQUEsZUFBc0IsTUFBTSxFQUFFLENBQUM7QUFBQSxJQUN6RCxDQUFDO0FBQUEsZUFBc0IsTUFBTSxFQUFFLEdBQUc7QUFBQSxlQUFzQixNQUFNLEVBQUUsQ0FBQztBQUFBLEVBQ25FO0FBQUEsRUFFQSxRQUFRO0FBQUEsSUFDTixDQUFDLEtBQUssTUFBTSxFQUFFLEdBQUcsUUFBUSxNQUFNLEVBQUUsQ0FBQztBQUFBLElBQ2xDLENBQUMsU0FBTyxNQUFNLEVBQUUsR0FBRyxZQUFVLE1BQU0sRUFBRSxDQUFDO0FBQUEsRUFDeEM7QUFBQSxFQUVBLFFBQVE7QUFBQSxJQUNOLENBQUMsS0FBSyxNQUFNLEVBQUUsR0FBRyxRQUFRLE1BQU0sRUFBRSxDQUFDO0FBQUEsSUFDbEMsQ0FBQyxTQUFPLE1BQU0sRUFBRSxHQUFHLFlBQVUsTUFBTSxFQUFFLENBQUM7QUFBQSxFQUN4QztBQUNGO0FBZ0JPLFNBQVMsT0FBTyxDQUFDLE1BQU0sT0FBTyxRQUFRLE9BQU87QUFBQSxFQUNsRCxNQUFNLFNBQVMsTUFBTTtBQUFBLEVBQ3JCLE1BQU0sT0FBTyxPQUFPLFVBQVUsUUFBUSxRQUFRLE1BQU0sU0FBUztBQUFBLEVBQzdELElBQUksY0FDRixPQUFPLFVBQVUsUUFDYixNQUFNLFNBQVMscUJBQ2YsTUFBTSxTQUFTLE1BQU0sU0FBUyxLQUFLLFFBQVEsWUFBWSxDQUFDO0FBQUEsRUFFOUQsTUFBTSxRQUFRLENBQUM7QUFBQSxFQUVmLElBQUk7QUFBQSxFQUVKLElBQUksT0FBTyxVQUFVLFVBQVUsS0FBSyxZQUFZLE9BQU87QUFBQSxJQUNyRCxNQUFNLFNBQVM7QUFBQSxFQUNqQjtBQUFBLEVBRUEsTUFBTSxhQUFhLG9CQUFvQixPQUFPLEtBQUssVUFBVTtBQUFBLEVBRTdELE1BQU0sVUFBVSxNQUFNLElBQ3BCLE9BQU8sVUFBVSxVQUFVLEtBQUssWUFBWSxhQUFhLEtBQUssVUFBVSxJQUMxRTtBQUFBLEVBRUEsTUFBTSxTQUFTO0FBQUEsRUFRZixJQUFJO0FBQUEsSUFBUyxjQUFjO0FBQUEsRUFFM0IsSUFBSSxjQUFjLENBQUMsUUFBUSxDQUFDLFFBQVEsTUFBTSxPQUFPLE1BQU0sR0FBRztBQUFBLElBQ3hELE1BQU0sS0FBSyxLQUFLLEtBQUssU0FBUyxhQUFhLE1BQU0sYUFBYSxFQUFFO0FBQUEsSUFFaEUsSUFDRSxnQkFDQyxPQUFPLFVBQVUsU0FBUyxNQUFNLFNBQVMsbUJBQzFDO0FBQUEsTUFDQSxPQUFPLFdBQVcsT0FBTyxXQUFXLFNBQVMsQ0FBQztBQUFBLE1BQzlDLElBQ0UsQ0FBQyxNQUFNLFNBQVMsb0JBQ2hCLFNBQVMsT0FDUixRQUFRLFNBQVMsT0FBTyxTQUFTLEtBQ2xDO0FBQUEsUUFDQSxNQUFNLEtBQUssR0FBRztBQUFBLE1BQ2hCO0FBQUEsTUFFQSxNQUFNLEtBQUssR0FBRztBQUFBLElBQ2hCO0FBQUEsSUFFQSxNQUFNLEtBQUssR0FBRztBQUFBLEVBQ2hCO0FBQUEsRUFFQSxNQUFNLEtBQUssT0FBTztBQUFBLEVBRWxCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsUUFBUSxNQUFNLE9BQU8sTUFBTSxJQUFJO0FBQUEsSUFDNUQsTUFBTSxLQUFLLE9BQU8sS0FBSyxVQUFVLEdBQUc7QUFBQSxFQUN0QztBQUFBLEVBRUEsT0FBTyxNQUFNLEtBQUssRUFBRTtBQUFBO0FBUXRCLFNBQVMsbUJBQW1CLENBQUMsT0FBTyxZQUFZO0FBQUEsRUFFOUMsTUFBTSxTQUFTLENBQUM7QUFBQSxFQUNoQixJQUFJLFFBQVE7QUFBQSxFQUVaLElBQUk7QUFBQSxFQUVKLElBQUksWUFBWTtBQUFBLElBQ2QsS0FBSyxRQUFPLFlBQVk7QUFBQSxNQUN0QixJQUFJLFdBQVcsVUFBUyxRQUFRLFdBQVcsVUFBUyxXQUFXO0FBQUEsUUFDN0QsTUFBTSxRQUFRLG1CQUFtQixPQUFPLE1BQUssV0FBVyxLQUFJO0FBQUEsUUFDNUQsSUFBSTtBQUFBLFVBQU8sT0FBTyxLQUFLLEtBQUs7QUFBQSxNQUM5QjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFFQSxPQUFPLEVBQUUsUUFBUSxPQUFPLFFBQVE7QUFBQSxJQUM5QixNQUFNLE9BQU8sTUFBTSxTQUFTLGtCQUN4QixPQUFPLE9BQU8sT0FBTyxPQUFPLE9BQU8sU0FBUyxDQUFDLElBQzdDO0FBQUEsSUFHSixJQUFJLFVBQVUsT0FBTyxTQUFTLEtBQUssU0FBUyxPQUFPLFNBQVMsS0FBSztBQUFBLE1BQy9ELE9BQU8sVUFBVTtBQUFBLElBQ25CO0FBQUEsRUFDRjtBQUFBLEVBRUEsT0FBTyxPQUFPLEtBQUssRUFBRTtBQUFBO0FBU3ZCLFNBQVMsa0JBQWtCLENBQUMsT0FBTyxNQUFLLE9BQU87QUFBQSxFQUM3QyxNQUFNLE9BQU8sS0FBSyxNQUFNLFFBQVEsSUFBRztBQUFBLEVBQ25DLE1BQU0sSUFDSixNQUFNLFNBQVMsb0JBQW9CLE1BQU0sT0FBTyxVQUFVLFNBQVMsSUFBSTtBQUFBLEVBQ3pFLE1BQU0sSUFBSSxNQUFNLFNBQVMsMkJBQTJCLElBQUk7QUFBQSxFQUN4RCxJQUFJLFFBQVEsTUFBTTtBQUFBLEVBRWxCLElBQUk7QUFBQSxFQUVKLElBQUksS0FBSyxzQkFBc0IsVUFBVSxLQUFLLGFBQWEsVUFBVSxLQUFLO0FBQUEsSUFDeEUsUUFBUTtBQUFBLEVBQ1YsRUFBTyxVQUNKLEtBQUssV0FBVyxLQUFLLHVCQUNyQixPQUFPLFVBQVUsWUFBWSxVQUFVLEtBQUssYUFBYSxVQUFVLEtBQ3BFO0FBQUEsSUFDQSxRQUFRLFFBQVEsS0FBSztBQUFBLEVBQ3ZCO0FBQUEsRUFFQSxJQUNFLFVBQVUsUUFDVixVQUFVLGFBQ1YsVUFBVSxTQUNULE9BQU8sVUFBVSxZQUFZLE9BQU8sTUFBTSxLQUFLLEdBQ2hEO0FBQUEsSUFDQSxPQUFPO0FBQUEsRUFDVDtBQUFBLEVBRUEsTUFBTSxPQUFPLGtCQUNYLEtBQUssV0FDTCxPQUFPLE9BQU8sQ0FBQyxHQUFHLE1BQU0sU0FBUyxxQkFBcUI7QUFBQSxJQUVwRCxRQUFRLFVBQVUsS0FBSyxHQUFHO0FBQUEsRUFDNUIsQ0FBQyxDQUNIO0FBQUEsRUFtQkEsSUFBSSxVQUFVO0FBQUEsSUFBTSxPQUFPO0FBQUEsRUFJM0IsUUFBUSxNQUFNLFFBQVEsS0FBSyxLQUN0QixLQUFLLGlCQUFpQixZQUFTLFlBQVEsT0FBTztBQUFBLElBQzdDLFNBQVMsQ0FBQyxNQUFNLFNBQVM7QUFBQSxFQUMzQixDQUFDLElBQ0QsT0FBTyxLQUFLO0FBQUEsRUFFaEIsSUFBSSxNQUFNLFNBQVMsMkJBQTJCLENBQUM7QUFBQSxJQUFPLE9BQU87QUFBQSxFQUc3RCxJQUFJLE1BQU0sU0FBUyxnQkFBZ0I7QUFBQSxJQUNqQyxTQUFTLGtCQUNQLE9BQ0EsT0FBTyxPQUFPLENBQUMsR0FBRyxNQUFNLFNBQVMscUJBQXFCO0FBQUEsTUFDcEQsV0FBVztBQUFBLE1BQ1gsUUFBUSxVQUFVLFNBQVMsR0FBRztBQUFBLElBQ2hDLENBQUMsQ0FDSDtBQUFBLEVBQ0Y7QUFBQSxFQUlBLElBQUksV0FBVyxPQUFPO0FBQUEsSUFFcEIsSUFDRSxNQUFNLFNBQVMsY0FDZixPQUFPLE9BQU8sS0FBSyxJQUFJLE9BQU8sT0FBTyxNQUFNLFdBQVcsR0FDdEQ7QUFBQSxNQUNBLFFBQVEsTUFBTTtBQUFBLElBQ2hCO0FBQUEsSUFFQSxTQUNFLFFBQ0Esa0JBQ0UsT0FDQSxPQUFPLE9BQU8sQ0FBQyxHQUFHLE1BQU0sU0FBUyxxQkFBcUI7QUFBQSxNQUVwRCxTQUFTLFVBQVUsTUFBTSxVQUFVLFNBQVMsVUFBVSxRQUFRLEdBQUc7QUFBQSxNQUNqRSxXQUFXO0FBQUEsSUFDYixDQUFDLENBQ0gsSUFDQTtBQUFBLEVBQ0o7QUFBQSxFQUdBLE9BQU8sUUFBUSxTQUFTLE1BQU0sU0FBUztBQUFBOzs7QUM5UHpDLElBQU0sbUJBQW1CLENBQUMsS0FBSyxHQUFHO0FBZ0IzQixTQUFTLElBQUksQ0FBQyxNQUFNLEdBQUcsUUFBUSxPQUFPO0FBQUEsRUFFM0MsT0FBTyxVQUNMLE9BQU8sU0FBUyxjQUNmLE9BQU8sWUFBWSxZQUFZLE9BQU8sWUFBWSxXQUNqRCxLQUFLLFFBQ0wsa0JBQ0UsS0FBSyxPQUNMLE9BQU8sT0FBTyxDQUFDLEdBQUcsTUFBTSxTQUFTLHFCQUFxQjtBQUFBLElBQ3BELFFBQVE7QUFBQSxFQUNWLENBQUMsQ0FDSDtBQUFBOzs7QUNkQyxTQUFTLEdBQUcsQ0FBQyxNQUFNLE9BQU8sUUFBUSxPQUFPO0FBQUEsRUFDOUMsT0FBTyxNQUFNLFNBQVMscUJBQ2xCLEtBQUssUUFDTCxLQUFLLE1BQU0sT0FBTyxRQUFRLEtBQUs7QUFBQTs7O0FDTjlCLFNBQVMsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLE9BQU87QUFBQSxFQUN4QyxPQUFPLE1BQU0sSUFBSSxJQUFJO0FBQUE7OztBQ0poQixJQUFNLFNBQVMsT0FBTyxRQUFRO0FBQUEsRUFDbkM7QUFBQSxFQUNBO0FBQUEsRUFDQSxVQUFVLEVBQUMsU0FBUyxTQUFTLFNBQVMsS0FBSyxNQUFNLEtBQUk7QUFDdkQsQ0FBQztBQVVELFNBQVMsT0FBTyxDQUFDLE1BQU07QUFBQSxFQUNyQixNQUFNLElBQUksTUFBTSx5QkFBeUIsT0FBTyxHQUFHO0FBQUE7QUFXckQsU0FBUyxPQUFPLENBQUMsT0FBTztBQUFBLEVBRXRCLE1BQU0sT0FBNkI7QUFBQSxFQUNuQyxNQUFNLElBQUksTUFBTSxrQ0FBa0MsS0FBSyxPQUFPLEdBQUc7QUFBQTs7O0FDOEduRSxJQUFNLGVBQWUsQ0FBQztBQUd0QixJQUFNLDJCQUEyQixDQUFDO0FBR2xDLElBQU0saUJBQWdCLENBQUM7QUFZaEIsU0FBUyxNQUFNLENBQUMsTUFBTSxTQUFTO0FBQUEsRUFDcEMsTUFBTSxXQUFXLFdBQVc7QUFBQSxFQUM1QixNQUFNLFFBQVEsU0FBUyxTQUFTO0FBQUEsRUFDaEMsTUFBTSxjQUFjLFVBQVUsTUFBTSxNQUFNO0FBQUEsRUFFMUMsSUFBSSxVQUFVLE9BQU8sVUFBVSxLQUFLO0FBQUEsSUFDbEMsTUFBTSxJQUFJLE1BQU0sb0JBQW9CLFFBQVEseUJBQXlCO0FBQUEsRUFDdkU7QUFBQSxFQUdBLE1BQU0sUUFBUTtBQUFBLElBQ1o7QUFBQSxJQUNBO0FBQUEsSUFDQSxVQUFVO0FBQUEsTUFDUixrQkFBa0IsU0FBUyxvQkFBb0I7QUFBQSxNQUMvQyxrQkFBa0IsU0FBUyxvQkFBb0I7QUFBQSxNQUMvQywwQkFBMEIsU0FBUyw0QkFBNEI7QUFBQSxNQUMvRCxZQUFZLFNBQVMsY0FBYztBQUFBLE1BQ25DLGdCQUFnQixTQUFTLGtCQUFrQjtBQUFBLE1BQzNDLGlCQUFpQixTQUFTLG1CQUFtQjtBQUFBLE1BQzdDLGNBQWMsU0FBUyxnQkFBZ0I7QUFBQSxNQUN2QyxjQUFjLFNBQVMsZ0JBQWdCO0FBQUEsTUFDdkMsZUFBZSxTQUFTLGlCQUFpQjtBQUFBLE1BQ3pDLDBCQUEwQixTQUFTLDRCQUE0QjtBQUFBLE1BQy9ELGtCQUFrQixTQUFTLG9CQUFvQjtBQUFBLE1BQy9DLHlCQUF5QixTQUFTLDJCQUEyQjtBQUFBLE1BQzdELG9CQUFvQixTQUFTLHNCQUFzQjtBQUFBLE1BQ25ELE9BQU8sU0FBUyxTQUFTO0FBQUEsTUFDekIscUJBQ0UsU0FBUyx1QkFBdUI7QUFBQSxNQUNsQyxrQkFBa0IsU0FBUyxvQkFBb0I7QUFBQSxNQUMvQyxvQkFBb0IsU0FBUyxzQkFBc0I7QUFBQSxJQUNyRDtBQUFBLElBQ0EsUUFBUSxTQUFTLFVBQVUsUUFBUSxPQUFNO0FBQUEsSUFDekM7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUFBLEVBRUEsT0FBTyxNQUFNLElBQ1gsTUFBTSxRQUFRLElBQUksSUFBSSxFQUFDLE1BQU0sUUFBUSxVQUFVLEtBQUksSUFBSSxNQUN2RCxXQUNBLFNBQ0Y7QUFBQTtBQWlCRixTQUFTLEdBQUcsQ0FBQyxNQUFNLE9BQU8sUUFBUTtBQUFBLEVBQ2hDLE9BQU8sT0FBTyxNQUFNLE9BQU8sUUFBUSxJQUFJO0FBQUE7QUFZbEMsU0FBUyxHQUFHLENBQUMsUUFBUTtBQUFBLEVBRTFCLE1BQU0sVUFBVSxDQUFDO0FBQUEsRUFDakIsTUFBTSxXQUFZLFVBQVUsT0FBTyxZQUFhO0FBQUEsRUFDaEQsSUFBSSxRQUFRO0FBQUEsRUFFWixPQUFPLEVBQUUsUUFBUSxTQUFTLFFBQVE7QUFBQSxJQUNoQyxRQUFRLFNBQVMsS0FBSyxJQUFJLFNBQVMsUUFBUSxPQUFPLE1BQU07QUFBQSxFQUMxRDtBQUFBLEVBRUEsT0FBTyxRQUFRLEtBQUssRUFBRTtBQUFBOztBQ3pQeEIsSUFBTSxnQkFBZ0I7QUFNdEIsU0FBUyxjQUFjLENBQUMsTUFBTSxXQUFXO0FBQUEsRUFDeEMsSUFBSSxDQUFDO0FBQUEsSUFBVyxPQUFPO0FBQUEsRUFDdkIsS0FBSyxlQUFlLENBQUM7QUFBQSxFQUNyQixLQUFLLFdBQVcsVUFBVSxDQUFDO0FBQUEsRUFDM0IsSUFBSSxPQUFPLEtBQUssV0FBVyxVQUFVO0FBQUEsSUFBVSxLQUFLLFdBQVcsUUFBUSxLQUFLLFdBQVcsTUFBTSxNQUFNLGFBQWE7QUFBQSxFQUNoSCxJQUFJLENBQUMsTUFBTSxRQUFRLEtBQUssV0FBVyxLQUFLO0FBQUEsSUFBRyxLQUFLLFdBQVcsUUFBUSxDQUFDO0FBQUEsRUFDcEUsTUFBTSxVQUFVLE1BQU0sUUFBUSxTQUFTLElBQUksWUFBWSxVQUFVLE1BQU0sYUFBYTtBQUFBLEVBQ3BGLFdBQVcsS0FBSztBQUFBLElBQVMsSUFBSSxLQUFLLENBQUMsS0FBSyxXQUFXLE1BQU0sU0FBUyxDQUFDO0FBQUEsTUFBRyxLQUFLLFdBQVcsTUFBTSxLQUFLLENBQUM7QUFBQSxFQUNsRyxPQUFPO0FBQUE7QUFJUixJQUFNLGVBQWU7QUFDckIsSUFBTSxnQkFBZ0I7QUFDdEIsSUFBTSxpQkFBaUI7QUFDdkIsSUFBTSxpQkFBaUI7QUFNdkIsU0FBUyx1QkFBdUIsQ0FBQyxNQUFNO0FBQUEsRUFDdEMsTUFBTSxRQUFRLFdBQWEsTUFBTSxJQUFJLEVBQUUsSUFBSSxFQUFFLFVBQVUsSUFBSTtBQUFBLEVBQzNELFNBQVMsVUFBVSxDQUFDLE9BQU87QUFBQSxJQUMxQixJQUFJLFVBQVUsS0FBSztBQUFBLE1BQVEsT0FBTztBQUFBLFFBQ2pDLE1BQU0sTUFBTSxTQUFTO0FBQUEsUUFDckIsV0FBVyxNQUFNLEdBQUcsRUFBRSxFQUFFO0FBQUEsTUFDekI7QUFBQSxJQUNBLElBQUksWUFBWTtBQUFBLElBQ2hCLElBQUksT0FBTztBQUFBLElBQ1gsV0FBVyxZQUFZLE9BQU87QUFBQSxNQUM3QixJQUFJLFlBQVksU0FBUztBQUFBLFFBQVE7QUFBQSxNQUNqQyxhQUFhLFNBQVM7QUFBQSxNQUN0QjtBQUFBLElBQ0Q7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNOO0FBQUEsTUFDQTtBQUFBLElBQ0Q7QUFBQTtBQUFBLEVBRUQsU0FBUyxVQUFVLENBQUMsTUFBTSxXQUFXO0FBQUEsSUFDcEMsSUFBSSxRQUFRO0FBQUEsSUFDWixTQUFTLElBQUksRUFBRyxJQUFJLE1BQU07QUFBQSxNQUFLLFNBQVMsTUFBTSxHQUFHO0FBQUEsSUFDakQsU0FBUztBQUFBLElBQ1QsT0FBTztBQUFBO0FBQUEsRUFFUixPQUFPO0FBQUEsSUFDTjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRDtBQUFBO0FBcUJELFNBQVMsc0JBQXNCLENBQUMsTUFBTSxPQUFPLGFBQWE7QUFBQSxFQUN6RCxNQUFNLHdCQUF3QixJQUFJO0FBQUEsRUFDbEMsV0FBVyxTQUFTLEtBQUssU0FBUyxZQUFZLEdBQUc7QUFBQSxJQUNoRCxNQUFNLE9BQU8sTUFBTSxHQUFHLFlBQVksRUFBRSxLQUFLO0FBQUEsSUFDekMsSUFBSTtBQUFBLE1BQU0sTUFBTSxJQUFJLElBQUk7QUFBQSxFQUN6QjtBQUFBLEVBQ0EsV0FBVyxTQUFTLEtBQUssU0FBUyxhQUFhLEdBQUc7QUFBQSxJQUNqRCxNQUFNLE9BQU8sTUFBTSxHQUFHLFlBQVksRUFBRSxLQUFLO0FBQUEsSUFDekMsSUFBSTtBQUFBLE1BQU0sTUFBTSxJQUFJLElBQUk7QUFBQSxFQUN6QjtBQUFBLEVBQ0EsV0FBVyxTQUFTLEtBQUssU0FBUyxjQUFjLEdBQUc7QUFBQSxJQUNsRCxNQUFNLE9BQU8sTUFBTSxHQUFHLFlBQVksRUFBRSxLQUFLO0FBQUEsSUFDekMsSUFBSTtBQUFBLE1BQU0sTUFBTSxJQUFJLElBQUk7QUFBQSxFQUN6QjtBQUFBLEVBQ0EsV0FBVyxTQUFTLEtBQUssU0FBUyxjQUFjLEdBQUc7QUFBQSxJQUNsRCxNQUFNLFdBQVcsTUFBTSxHQUFHLFlBQVksRUFBRSxLQUFLO0FBQUEsSUFDN0MsTUFBTSxPQUFPLFNBQVMsU0FBUyxHQUFHLElBQUksU0FBUyxNQUFNLEdBQUcsRUFBRSxJQUFJLElBQUk7QUFBQSxJQUNsRSxJQUFJO0FBQUEsTUFBTSxNQUFNLElBQUksSUFBSTtBQUFBLEVBQ3pCO0FBQUEsRUFDQSxJQUFJLENBQUM7QUFBQSxJQUFhLE9BQU8sQ0FBQyxHQUFHLEtBQUs7QUFBQSxFQUNsQyxNQUFNLFNBQVMsWUFBWSxvQkFBb0I7QUFBQSxFQUMvQyxPQUFPLENBQUMsR0FBRyxLQUFLLEVBQUUsT0FBTyxDQUFDLE1BQU0sS0FBSyxPQUFPLEVBQUU7QUFBQTtBQUUvQyxJQUFNLGFBQWEsQ0FBQyxTQUFTLGtCQUFrQjtBQVEvQyxTQUFTLFVBQVUsQ0FBQyxPQUFPLFNBQVM7QUFBQSxFQUNuQyxJQUFJLGFBQWE7QUFBQSxFQUNqQixNQUFNLFNBQVMsQ0FBQztBQUFBLEVBQ2hCLFdBQVcsVUFBVSxTQUFTO0FBQUEsSUFDN0IsSUFBSSxTQUFTO0FBQUEsTUFBWSxPQUFPLEtBQUs7QUFBQSxXQUNqQztBQUFBLFFBQ0gsU0FBUyxNQUFNLFFBQVEsTUFBTSxZQUFZLE1BQU07QUFBQSxRQUMvQyxRQUFRLE1BQU0sU0FBUztBQUFBLE1BQ3hCLENBQUM7QUFBQSxJQUNELGFBQWE7QUFBQSxFQUNkO0FBQUEsRUFDQSxJQUFJLGFBQWEsTUFBTSxRQUFRO0FBQUEsSUFBUSxPQUFPLEtBQUs7QUFBQSxTQUMvQztBQUFBLE1BQ0gsU0FBUyxNQUFNLFFBQVEsTUFBTSxVQUFVO0FBQUEsTUFDdkMsUUFBUSxNQUFNLFNBQVM7QUFBQSxJQUN4QixDQUFDO0FBQUEsRUFDRCxPQUFPO0FBQUE7QUFLUixTQUFTLFdBQVcsQ0FBQyxRQUFRLGFBQWE7QUFBQSxFQUN6QyxNQUFNLFNBQVMsQ0FBQyxHQUFHLHVCQUF1QixNQUFNLGNBQWMsSUFBSSxJQUFJLFdBQVcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDO0FBQUEsRUFDeEcsSUFBSSxDQUFDLE9BQU87QUFBQSxJQUFRLE9BQU87QUFBQSxFQUMzQixPQUFPLE9BQU8sSUFBSSxDQUFDLFNBQVM7QUFBQSxJQUMzQixPQUFPLEtBQUssUUFBUSxDQUFDLFVBQVU7QUFBQSxNQUM5QixNQUFNLHFCQUFxQixPQUFPLE9BQU8sQ0FBQyxNQUFNLE1BQU0sU0FBUyxLQUFLLElBQUksTUFBTSxTQUFTLE1BQU0sUUFBUSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sSUFBSSxNQUFNLE1BQU0sRUFBRSxLQUFLLENBQUMsR0FBRyxNQUFNLElBQUksQ0FBQztBQUFBLE1BQzlKLElBQUksQ0FBQyxtQkFBbUI7QUFBQSxRQUFRLE9BQU87QUFBQSxNQUN2QyxPQUFPLFdBQVcsT0FBTyxrQkFBa0I7QUFBQSxLQUMzQztBQUFBLEdBQ0Q7QUFBQTtBQUVGLFNBQVMsaUJBQWlCLENBQUMsUUFBUSxlQUFlLG1CQUFtQixjQUFjLGtCQUFrQixZQUFZO0FBQUEsRUFDaEgsTUFBTSxRQUFRO0FBQUEsSUFDYixTQUFTLE9BQU87QUFBQSxJQUNoQixhQUFhLE9BQU87QUFBQSxJQUNwQixRQUFRLE9BQU87QUFBQSxFQUNoQjtBQUFBLEVBQ0EsTUFBTSxTQUFTLGNBQWMsSUFBSSxDQUFDLE1BQU0sb0JBQW9CLE9BQU8sU0FBUyxFQUFFLENBQUM7QUFBQSxFQUMvRSxNQUFNLFlBQVksSUFBSSxJQUFJLE9BQU8sUUFBUSxDQUFDLE1BQU0sT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQUEsRUFDL0QsTUFBTSxlQUFlLENBQUM7QUFBQSxFQUN0QixNQUFNLFNBQVMsQ0FBQyxLQUFLLFNBQVE7QUFBQSxJQUM1QixNQUFNLFVBQVUsU0FBUSxVQUFVLEtBQUssU0FBUSxxQkFBcUIsUUFBUSxJQUFJO0FBQUEsSUFDaEYsT0FBTyxvQkFBb0IsY0FBYyxRQUFRLFNBQVEsVUFBVSxLQUFLO0FBQUE7QUFBQSxFQUV6RSxPQUFPLFFBQVEsQ0FBQyxLQUFLLFFBQVE7QUFBQSxJQUM1QixXQUFXLFFBQU8sV0FBVztBQUFBLE1BQzVCLE1BQU0sUUFBUSxJQUFJLFNBQVE7QUFBQSxNQUMxQixJQUFJLFFBQVEsS0FBSyxnQkFBZ0IsV0FBVyxTQUFTLElBQUc7QUFBQSxRQUFHLElBQUksaUJBQWlCLGtCQUFrQixPQUFPLFNBQVMsR0FBRztBQUFBLFVBQ3BILE1BQU0sYUFBYSxjQUFjLFVBQVUsQ0FBQyxNQUFNLE1BQU0sT0FBTztBQUFBLFVBQy9ELE1BQU0sWUFBWSxjQUFjLFVBQVUsQ0FBQyxNQUFNLE1BQU0sTUFBTTtBQUFBLFVBQzdELElBQUksZUFBZSxNQUFNLGNBQWM7QUFBQSxZQUFJLE1BQU0sSUFBSSxXQUFhLDRGQUE4RjtBQUFBLFVBQ2hLLGFBQWEsUUFBTyxjQUFjLE9BQU8sWUFBWSxTQUFRLGNBQWMsT0FBTyxXQUFXLFNBQVE7QUFBQSxVQUNyRyxJQUFJLG9CQUFvQjtBQUFBLFlBQVksYUFBYSxPQUFPLEtBQUssSUFBRyxLQUFLO0FBQUEsUUFDdEUsRUFBTztBQUFBLHVCQUFhLFFBQU87QUFBQSxNQUN0QixTQUFJLG9CQUFvQjtBQUFBLFFBQVksYUFBYSxPQUFPLEtBQUssSUFBRyxLQUFLO0FBQUEsSUFDM0U7QUFBQSxHQUNBO0FBQUEsRUFDRCxNQUFNLFlBQVk7QUFBQSxFQUNsQixPQUFPO0FBQUE7QUFFUixTQUFTLG1CQUFtQixDQUFDLE9BQU87QUFBQSxFQUNuQyxNQUFNLFNBQVMsQ0FBQztBQUFBLEVBQ2hCLElBQUksTUFBTTtBQUFBLElBQU8sT0FBTyxRQUFRLE1BQU07QUFBQSxFQUN0QyxJQUFJLE1BQU07QUFBQSxJQUFTLE9BQU8sc0JBQXNCLE1BQU07QUFBQSxFQUN0RCxJQUFJLE1BQU0sV0FBVztBQUFBLElBQ3BCLElBQUksTUFBTSxZQUFZLFVBQVU7QUFBQSxNQUFRLE9BQU8sZ0JBQWdCO0FBQUEsSUFDL0QsSUFBSSxNQUFNLFlBQVksVUFBVTtBQUFBLE1BQU0sT0FBTyxpQkFBaUI7QUFBQSxJQUM5RCxNQUFNLGNBQWMsQ0FBQztBQUFBLElBQ3JCLElBQUksTUFBTSxZQUFZLFVBQVU7QUFBQSxNQUFXLFlBQVksS0FBSyxXQUFXO0FBQUEsSUFDdkUsSUFBSSxNQUFNLFlBQVksVUFBVTtBQUFBLE1BQWUsWUFBWSxLQUFLLGNBQWM7QUFBQSxJQUM5RSxJQUFJLFlBQVk7QUFBQSxNQUFRLE9BQU8scUJBQXFCLFlBQVksS0FBSyxHQUFHO0FBQUEsRUFDekU7QUFBQSxFQUNBLE9BQU87QUFBQTtBQUVSLFNBQVMsbUJBQW1CLENBQUMsT0FBTztBQUFBLEVBQ25DLElBQUksT0FBTyxVQUFVO0FBQUEsSUFBVSxPQUFPO0FBQUEsRUFDdEMsT0FBTyxPQUFPLFFBQVEsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFLLFdBQVcsR0FBRyxRQUFPLE9BQU8sRUFBRSxLQUFLLEdBQUc7QUFBQTtBQU8vRSxTQUFTLHNCQUFzQixHQUFHO0FBQUEsRUFDakMsTUFBTSxzQkFBc0IsSUFBSTtBQUFBLEVBQ2hDLFNBQVMsVUFBVSxDQUFDLE9BQU87QUFBQSxJQUMxQixJQUFJLENBQUMsSUFBSSxJQUFJLE1BQU0sSUFBSSxHQUFHO0FBQUEsTUFFekIsSUFBUyxvQkFBVCxRQUEwQixDQUFDLElBQUc7QUFBQSxRQUM3QixJQUFJLE9BQU8sT0FBTSxVQUFVO0FBQUEsVUFDMUIsSUFBSSxLQUFJLEtBQUssS0FBSSxNQUFNLE9BQU87QUFBQSxZQUFRLE1BQU0sSUFBSSxXQUFhLDhCQUE4QixvQkFBbUIsTUFBTSxPQUFPLFFBQVE7QUFBQSxVQUNuSSxPQUFPO0FBQUEsZUFDSCxVQUFVLFdBQVcsRUFBQztBQUFBLFlBQ3pCLFFBQVE7QUFBQSxVQUNUO0FBQUEsUUFDRCxFQUFPO0FBQUEsVUFDTixNQUFNLE9BQU8sVUFBVSxNQUFNLEdBQUU7QUFBQSxVQUMvQixJQUFJLFNBQWM7QUFBQSxZQUFHLE1BQU0sSUFBSSxXQUFhLCtCQUErQixLQUFLLFVBQVUsRUFBQyxvQkFBb0IsVUFBVSxNQUFNLFFBQVE7QUFBQSxVQUN2SSxJQUFJLFlBQVksR0FBRTtBQUFBLFVBQ2xCLElBQUksWUFBWTtBQUFBLFlBQUcsWUFBWSxLQUFLLFNBQVM7QUFBQSxVQUM3QyxJQUFJLFlBQVksS0FBSyxZQUFZLEtBQUs7QUFBQSxZQUFRLE1BQU0sSUFBSSxXQUFhLCtCQUErQixLQUFLLFVBQVUsRUFBQyxXQUFXLEdBQUUsZ0JBQWdCLEtBQUssUUFBUTtBQUFBLFVBQzlKLE9BQU87QUFBQSxlQUNIO0FBQUEsWUFDSDtBQUFBLFlBQ0EsUUFBUSxVQUFVLFdBQVcsR0FBRSxNQUFNLFNBQVM7QUFBQSxVQUMvQztBQUFBO0FBQUE7QUFBQSxNQWxCRixNQUFNLFlBQVksd0JBQXdCLE1BQU0sTUFBTTtBQUFBLE1BcUJ0RCxNQUFNLGVBQWUsTUFBTSxRQUFRLGVBQWUsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPO0FBQUEsV0FDOUQ7QUFBQSxRQUNILE9BQU8sa0JBQWtCLEVBQUUsS0FBSztBQUFBLFFBQ2hDLEtBQUssa0JBQWtCLEVBQUUsR0FBRztBQUFBLE1BQzdCLEVBQUU7QUFBQSxNQUNGLG9CQUFvQixXQUFXO0FBQUEsTUFDL0IsSUFBSSxJQUFJLE1BQU0sTUFBTTtBQUFBLFFBQ25CO0FBQUEsUUFDQTtBQUFBLFFBQ0EsUUFBUSxNQUFNO0FBQUEsTUFDZixDQUFDO0FBQUEsSUFDRjtBQUFBLElBQ0EsT0FBTyxJQUFJLElBQUksTUFBTSxJQUFJO0FBQUE7QUFBQSxFQUUxQixPQUFPO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNLENBQUMsUUFBUTtBQUFBLE1BQ2QsSUFBSSxDQUFDLEtBQUssUUFBUSxhQUFhO0FBQUEsUUFBUTtBQUFBLE1BQ3ZDLE9BQU8sWUFBWSxRQUFRLFdBQVcsSUFBSSxFQUFFLFlBQVksUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sUUFBUSxFQUFFLElBQUksTUFBTSxDQUFDLENBQUM7QUFBQTtBQUFBLElBRXZHLElBQUksQ0FBQyxRQUFRO0FBQUEsTUFDWixJQUFJLENBQUMsS0FBSyxRQUFRLGFBQWE7QUFBQSxRQUFRO0FBQUEsTUFDdkMsTUFBTSxNQUFNLFdBQVcsSUFBSTtBQUFBLE1BQzNCLE1BQU0sUUFBUSxDQUFDLEdBQUcsT0FBTyxRQUFRLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxTQUFTLGFBQWEsRUFBRSxZQUFZLE1BQU07QUFBQSxNQUM3RixJQUFJLE1BQU0sV0FBVyxJQUFJLFVBQVUsTUFBTTtBQUFBLFFBQVEsTUFBTSxJQUFJLFdBQWEsb0NBQW9DLE1BQU0sNkRBQTZELElBQUksVUFBVSxNQUFNLHVDQUF1QztBQUFBLE1BQzFPLFNBQVMsZ0JBQWdCLENBQUMsTUFBTSxPQUFPLEtBQUssWUFBWTtBQUFBLFFBQ3ZELE1BQU0sU0FBUyxNQUFNO0FBQUEsUUFDckIsSUFBSSxRQUFPO0FBQUEsUUFDWCxJQUFJLGFBQWE7QUFBQSxRQUNqQixJQUFJLFdBQVc7QUFBQSxRQUNmLElBQUksVUFBVTtBQUFBLFVBQUcsYUFBYTtBQUFBLFFBQzlCLElBQUksUUFBUTtBQUFBLFVBQUcsV0FBVztBQUFBLFFBQzFCLElBQUksUUFBUSxPQUFPO0FBQUEsVUFBbUIsV0FBVyxPQUFPLFNBQVM7QUFBQSxRQUNqRSxJQUFJLGVBQWUsTUFBTSxhQUFhO0FBQUEsVUFBSSxTQUFTLElBQUksRUFBRyxJQUFJLE9BQU8sU0FBUyxRQUFRLEtBQUs7QUFBQSxZQUMxRixTQUFRLFdBQVUsT0FBTyxTQUFTLEVBQUU7QUFBQSxZQUNwQyxJQUFJLGVBQWUsTUFBTSxNQUFLLFdBQVc7QUFBQSxjQUFPLGFBQWEsSUFBSTtBQUFBLFlBQ2pFLElBQUksYUFBYSxNQUFNLE1BQUssV0FBVztBQUFBLGNBQUssV0FBVyxJQUFJO0FBQUEsVUFDNUQ7QUFBQSxRQUNBLElBQUksZUFBZTtBQUFBLFVBQUksTUFBTSxJQUFJLFdBQWEsNkNBQTZDLEtBQUssVUFBVSxXQUFXLEtBQUssR0FBRztBQUFBLFFBQzdILElBQUksYUFBYTtBQUFBLFVBQUksTUFBTSxJQUFJLFdBQWEsMkNBQTJDLEtBQUssVUFBVSxXQUFXLEdBQUcsR0FBRztBQUFBLFFBQ3ZILE1BQU0sV0FBVyxPQUFPLFNBQVMsTUFBTSxZQUFZLFFBQVE7QUFBQSxRQUMzRCxJQUFJLENBQUMsV0FBVyxjQUFjLFNBQVMsV0FBVyxPQUFPLFNBQVM7QUFBQSxVQUFRLGdCQUFnQixRQUFRLFlBQVksTUFBTTtBQUFBLFFBQy9HLFNBQUksQ0FBQyxXQUFXLGNBQWMsU0FBUyxXQUFXLEtBQUssU0FBUyxHQUFHLFNBQVM7QUFBQSxVQUFXLGdCQUFnQixTQUFTLElBQUksWUFBWSxPQUFPO0FBQUEsUUFDdkk7QUFBQSxVQUNKLE1BQU0sVUFBVTtBQUFBLFlBQ2YsTUFBTTtBQUFBLFlBQ04sU0FBUztBQUFBLFlBQ1QsWUFBWSxDQUFDO0FBQUEsWUFDYjtBQUFBLFVBQ0Q7QUFBQSxVQUNBLGdCQUFnQixTQUFTLFlBQVksU0FBUztBQUFBLFVBQzlDLE9BQU8sU0FBUyxPQUFPLFlBQVksU0FBUyxRQUFRLE9BQU87QUFBQTtBQUFBO0FBQUEsTUFHN0QsU0FBUyxTQUFTLENBQUMsTUFBTSxZQUFZO0FBQUEsUUFDcEMsTUFBTSxRQUFRLGdCQUFnQixNQUFNLE9BQU8sWUFBWSxNQUFNO0FBQUE7QUFBQSxNQUU5RCxTQUFTLGVBQWUsQ0FBQyxJQUFJLFlBQVksTUFBTTtBQUFBLFFBQzlDLE1BQU0sYUFBYSxXQUFXLGNBQWMsQ0FBQztBQUFBLFFBQzdDLE1BQU0sWUFBWSxXQUFXLGNBQWMsQ0FBQyxNQUFNO0FBQUEsUUFDbEQsR0FBRyxVQUFVLFdBQVcsV0FBVztBQUFBLFFBQ25DLEdBQUcsYUFBYTtBQUFBLGFBQ1osR0FBRztBQUFBLGFBQ0g7QUFBQSxVQUNILE9BQU8sR0FBRyxXQUFXO0FBQUEsUUFDdEI7QUFBQSxRQUNBLElBQUksV0FBVyxZQUFZO0FBQUEsVUFBTyxlQUFlLElBQUksV0FBVyxXQUFXLEtBQUs7QUFBQSxRQUNoRixLQUFLLFVBQVUsSUFBSSxJQUFJLEtBQUs7QUFBQSxRQUM1QixPQUFPO0FBQUE7QUFBQSxNQUVSLE1BQU0sY0FBYyxDQUFDO0FBQUEsTUFDckIsTUFBTSxTQUFTLElBQUksWUFBWSxLQUFLLENBQUMsR0FBRyxNQUFNLEVBQUUsTUFBTSxTQUFTLEVBQUUsTUFBTSxVQUFVLEVBQUUsSUFBSSxTQUFTLEVBQUUsSUFBSSxNQUFNO0FBQUEsTUFDNUcsV0FBVyxjQUFjLFFBQVE7QUFBQSxRQUNoQyxRQUFRLE9BQU8sUUFBUTtBQUFBLFFBQ3ZCLElBQUksTUFBTSxTQUFTLElBQUk7QUFBQSxVQUFNLGlCQUFpQixNQUFNLE1BQU0sTUFBTSxXQUFXLElBQUksV0FBVyxVQUFVO0FBQUEsUUFDL0YsU0FBSSxNQUFNLE9BQU8sSUFBSSxNQUFNO0FBQUEsVUFDL0IsaUJBQWlCLE1BQU0sTUFBTSxNQUFNLFdBQVcsT0FBTyxtQkFBbUIsVUFBVTtBQUFBLFVBQ2xGLFNBQVMsSUFBSSxNQUFNLE9BQU8sRUFBRyxJQUFJLElBQUksTUFBTTtBQUFBLFlBQUssWUFBWSxRQUFRLE1BQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQztBQUFBLFVBQ2xHLGlCQUFpQixJQUFJLE1BQU0sR0FBRyxJQUFJLFdBQVcsVUFBVTtBQUFBLFFBQ3hEO0FBQUEsTUFDRDtBQUFBLE1BQ0EsWUFBWSxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7QUFBQTtBQUFBLEVBRWhDO0FBQUE7QUFFRCxTQUFTLG1CQUFtQixDQUFDLE9BQU87QUFBQSxFQUNuQyxTQUFTLElBQUksRUFBRyxJQUFJLE1BQU0sUUFBUSxLQUFLO0FBQUEsSUFDdEMsTUFBTSxNQUFNLE1BQU07QUFBQSxJQUNsQixJQUFJLElBQUksTUFBTSxTQUFTLElBQUksSUFBSTtBQUFBLE1BQVEsTUFBTSxJQUFJLFdBQWEsNkJBQTZCLEtBQUssVUFBVSxJQUFJLEtBQUssT0FBTyxLQUFLLFVBQVUsSUFBSSxHQUFHLEdBQUc7QUFBQSxJQUNuSixTQUFTLElBQUksSUFBSSxFQUFHLElBQUksTUFBTSxRQUFRLEtBQUs7QUFBQSxNQUMxQyxNQUFNLE1BQU0sTUFBTTtBQUFBLE1BQ2xCLE1BQU0sbUJBQW1CLElBQUksTUFBTSxVQUFVLElBQUksTUFBTSxVQUFVLElBQUksTUFBTSxTQUFTLElBQUksSUFBSTtBQUFBLE1BQzVGLE1BQU0saUJBQWlCLElBQUksTUFBTSxTQUFTLElBQUksSUFBSSxVQUFVLElBQUksSUFBSSxVQUFVLElBQUksSUFBSTtBQUFBLE1BQ3RGLE1BQU0sbUJBQW1CLElBQUksTUFBTSxVQUFVLElBQUksTUFBTSxVQUFVLElBQUksTUFBTSxTQUFTLElBQUksSUFBSTtBQUFBLE1BQzVGLE1BQU0saUJBQWlCLElBQUksTUFBTSxTQUFTLElBQUksSUFBSSxVQUFVLElBQUksSUFBSSxVQUFVLElBQUksSUFBSTtBQUFBLE1BQ3RGLElBQUksb0JBQW9CLGtCQUFrQixvQkFBb0IsZ0JBQWdCO0FBQUEsUUFDN0UsSUFBSSxvQkFBb0I7QUFBQSxVQUFnQjtBQUFBLFFBQ3hDLElBQUksb0JBQW9CO0FBQUEsVUFBZ0I7QUFBQSxRQUN4QyxJQUFJLG9CQUFvQixJQUFJLE1BQU0sV0FBVyxJQUFJLElBQUk7QUFBQSxVQUFRO0FBQUEsUUFDN0QsSUFBSSxrQkFBa0IsSUFBSSxNQUFNLFdBQVcsSUFBSSxJQUFJO0FBQUEsVUFBUTtBQUFBLFFBQzNELE1BQU0sSUFBSSxXQUFhLGVBQWUsS0FBSyxVQUFVLElBQUksS0FBSyxTQUFTLEtBQUssVUFBVSxJQUFJLEtBQUssY0FBYztBQUFBLE1BQzlHO0FBQUEsSUFDRDtBQUFBLEVBQ0Q7QUFBQTtBQUVELFNBQVMsVUFBUyxDQUFDLElBQUk7QUFBQSxFQUN0QixJQUFJLEdBQUcsU0FBUztBQUFBLElBQVEsT0FBTyxHQUFHO0FBQUEsRUFDbEMsSUFBSSxHQUFHLFNBQVM7QUFBQSxJQUFXLE9BQU8sR0FBRyxTQUFTLElBQUksVUFBUyxFQUFFLEtBQUssRUFBRTtBQUFBLEVBQ3BFLE9BQU87QUFBQTtBQUlSLElBQU0sc0JBQXNCLGlCQUFpQix1QkFBdUIsQ0FBQztBQUNyRSxTQUFTLGVBQWUsQ0FBQyxTQUFTO0FBQUEsRUFDakMsTUFBTSxlQUFlLDhCQUE4QixRQUFRLGdCQUFnQixDQUFDLENBQUM7QUFBQSxFQUM3RSxPQUFPO0FBQUEsSUFDTixHQUFHLGFBQWE7QUFBQSxJQUNoQixHQUFHLGFBQWE7QUFBQSxJQUNoQixHQUFHLGFBQWE7QUFBQSxJQUNoQixHQUFHO0FBQUEsRUFDSjtBQUFBO0FBRUQsU0FBUyw2QkFBNkIsQ0FBQyxjQUFjO0FBQUEsRUFDcEQsTUFBTSxNQUFNLENBQUM7QUFBQSxFQUNiLE1BQU0sT0FBTyxDQUFDO0FBQUEsRUFDZCxNQUFNLFNBQVMsQ0FBQztBQUFBLEVBQ2hCLFdBQVcsZUFBZTtBQUFBLElBQWMsUUFBUSxZQUFZO0FBQUEsV0FDdEQ7QUFBQSxRQUNKLElBQUksS0FBSyxXQUFXO0FBQUEsUUFDcEI7QUFBQSxXQUNJO0FBQUEsUUFDSixLQUFLLEtBQUssV0FBVztBQUFBLFFBQ3JCO0FBQUE7QUFBQSxRQUNRLE9BQU8sS0FBSyxXQUFXO0FBQUE7QUFBQSxFQUVqQyxPQUFPO0FBQUEsSUFDTjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRDtBQUFBO0FBSUQsSUFBSSxjQUFjO0FBQUEsRUFDakI7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRDtBQUNBLElBQUksY0FBYztBQUFBLEVBQ2pCLEdBQUc7QUFBQSxFQUNILEdBQUc7QUFBQSxFQUNILEdBQUc7QUFBQSxFQUNILEdBQUc7QUFBQSxFQUNILEdBQUc7QUFBQSxFQUNILEdBQUc7QUFBQSxFQUNILEdBQUc7QUFDSjtBQUNBLFNBQVMsWUFBWSxDQUFDLE9BQU8sVUFBVTtBQUFBLEVBQ3RDLE1BQU0sYUFBYSxNQUFNLFFBQVEsUUFBUSxRQUFRO0FBQUEsRUFDakQsSUFBSSxlQUFlLElBQUk7QUFBQSxJQUN0QixJQUFJLE1BQU0sYUFBYSxPQUFPLEtBQUs7QUFBQSxNQUNsQyxNQUFNLFlBQVksTUFBTSxRQUFRLEtBQUssVUFBVTtBQUFBLE1BQy9DLElBQUksY0FBYztBQUFBLFFBQUksT0FBTztBQUFBLFVBQzVCLFVBQVUsTUFBTSxVQUFVLGFBQWEsR0FBRyxTQUFTLEVBQUUsTUFBTSxHQUFHO0FBQUEsVUFDOUQsZUFBZTtBQUFBLFVBQ2YsVUFBVSxZQUFZO0FBQUEsUUFDdkI7QUFBQSxJQUNEO0FBQUEsRUFDRDtBQUFBLEVBQ0EsT0FBTyxFQUFFLFVBQVUsTUFBTSxPQUFPO0FBQUE7QUFFakMsU0FBUyxVQUFVLENBQUMsVUFBVTtBQUFBLEVBQzdCLE1BQU0sWUFBWSxTQUFTLE1BQU07QUFBQSxFQUNqQyxJQUFJLGNBQWMsS0FBSztBQUFBLElBQ3RCLE1BQU0sTUFBTSxTQUFTLE9BQU8sR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sT0FBTyxTQUFTLENBQUMsQ0FBQztBQUFBLElBQy9ELElBQUksSUFBSSxXQUFXLEtBQUssSUFBSSxLQUFLLENBQUMsTUFBTSxPQUFPLE1BQU0sQ0FBQyxDQUFDO0FBQUEsTUFBRztBQUFBLElBQzFELE9BQU87QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOO0FBQUEsSUFDRDtBQUFBLEVBQ0QsRUFBTyxTQUFJLGNBQWMsS0FBSztBQUFBLElBQzdCLE1BQU0sUUFBUSxTQUFTLE1BQU07QUFBQSxJQUM3QixJQUFJO0FBQUEsTUFBTyxPQUFPO0FBQUEsUUFDakIsTUFBTTtBQUFBLFFBQ04sT0FBTyxPQUFPLEtBQUs7QUFBQSxNQUNwQjtBQUFBLEVBQ0Q7QUFBQTtBQUVELFNBQVMsYUFBYSxDQUFDLFVBQVU7QUFBQSxFQUNoQyxNQUFNLFdBQVcsQ0FBQztBQUFBLEVBQ2xCLE9BQU8sU0FBUyxTQUFTLEdBQUc7QUFBQSxJQUMzQixNQUFNLE9BQU8sU0FBUyxNQUFNO0FBQUEsSUFDNUIsSUFBSSxDQUFDO0FBQUEsTUFBTTtBQUFBLElBQ1gsTUFBTSxVQUFVLE9BQU8sU0FBUyxJQUFJO0FBQUEsSUFDcEMsSUFBSSxPQUFPLE1BQU0sT0FBTztBQUFBLE1BQUc7QUFBQSxJQUMzQixJQUFJLFlBQVk7QUFBQSxNQUFHLFNBQVMsS0FBSyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQUEsSUFDaEQsU0FBSSxXQUFXLEdBQUc7QUFBQSxNQUN0QixJQUFJLFlBQVk7QUFBQSxRQUFVLFNBQVMsS0FBSztBQUFBLFVBQ3ZDLE1BQU07QUFBQSxVQUNOLE9BQU8sWUFBWTtBQUFBLFFBQ3BCLENBQUM7QUFBQSxJQUNGLEVBQU8sU0FBSSxXQUFXLElBQUk7QUFBQSxNQUN6QixNQUFNLGFBQWEsWUFBWSxVQUFVO0FBQUEsTUFDekMsSUFBSSxZQUFZO0FBQUEsUUFDZixTQUFTLEtBQUs7QUFBQSxVQUNiLE1BQU07QUFBQSxVQUNOLE9BQU87QUFBQSxRQUNSLENBQUM7QUFBQSxRQUNELElBQUksZUFBZTtBQUFBLFVBQU8sU0FBUyxLQUFLO0FBQUEsWUFDdkMsTUFBTTtBQUFBLFlBQ04sT0FBTztBQUFBLFVBQ1IsQ0FBQztBQUFBLE1BQ0Y7QUFBQSxJQUNELEVBQU8sU0FBSSxXQUFXO0FBQUEsTUFBSSxTQUFTLEtBQUs7QUFBQSxRQUN2QyxNQUFNO0FBQUEsUUFDTixPQUFPO0FBQUEsVUFDTixNQUFNO0FBQUEsVUFDTixNQUFNLFlBQVksVUFBVTtBQUFBLFFBQzdCO0FBQUEsTUFDRCxDQUFDO0FBQUEsSUFDSSxTQUFJLFlBQVksSUFBSTtBQUFBLE1BQ3hCLE1BQU0sUUFBUSxXQUFXLFFBQVE7QUFBQSxNQUNqQyxJQUFJO0FBQUEsUUFBTyxTQUFTLEtBQUs7QUFBQSxVQUN4QixNQUFNO0FBQUEsVUFDTixPQUFPO0FBQUEsUUFDUixDQUFDO0FBQUEsSUFDRixFQUFPLFNBQUksWUFBWTtBQUFBLE1BQUksU0FBUyxLQUFLLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUFBLElBQ3BFLFNBQUksV0FBVztBQUFBLE1BQUksU0FBUyxLQUFLO0FBQUEsUUFDckMsTUFBTTtBQUFBLFFBQ04sT0FBTztBQUFBLFVBQ04sTUFBTTtBQUFBLFVBQ04sTUFBTSxZQUFZLFVBQVU7QUFBQSxRQUM3QjtBQUFBLE1BQ0QsQ0FBQztBQUFBLElBQ0ksU0FBSSxZQUFZLElBQUk7QUFBQSxNQUN4QixNQUFNLFFBQVEsV0FBVyxRQUFRO0FBQUEsTUFDakMsSUFBSTtBQUFBLFFBQU8sU0FBUyxLQUFLO0FBQUEsVUFDeEIsTUFBTTtBQUFBLFVBQ04sT0FBTztBQUFBLFFBQ1IsQ0FBQztBQUFBLElBQ0YsRUFBTyxTQUFJLFlBQVk7QUFBQSxNQUFJLFNBQVMsS0FBSyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFBQSxJQUNwRSxTQUFJLFlBQVk7QUFBQSxNQUFJLFNBQVMsS0FBSztBQUFBLFFBQ3RDLE1BQU07QUFBQSxRQUNOLE9BQU87QUFBQSxNQUNSLENBQUM7QUFBQSxJQUNJLFNBQUksWUFBWTtBQUFBLE1BQUksU0FBUyxLQUFLO0FBQUEsUUFDdEMsTUFBTTtBQUFBLFFBQ04sT0FBTztBQUFBLE1BQ1IsQ0FBQztBQUFBLElBQ0ksU0FBSSxXQUFXLE1BQU0sV0FBVztBQUFBLE1BQUksU0FBUyxLQUFLO0FBQUEsUUFDdEQsTUFBTTtBQUFBLFFBQ04sT0FBTztBQUFBLFVBQ04sTUFBTTtBQUFBLFVBQ04sTUFBTSxZQUFZLFVBQVUsS0FBSztBQUFBLFFBQ2xDO0FBQUEsTUFDRCxDQUFDO0FBQUEsSUFDSSxTQUFJLFdBQVcsT0FBTyxXQUFXO0FBQUEsTUFBSyxTQUFTLEtBQUs7QUFBQSxRQUN4RCxNQUFNO0FBQUEsUUFDTixPQUFPO0FBQUEsVUFDTixNQUFNO0FBQUEsVUFDTixNQUFNLFlBQVksVUFBVSxNQUFNO0FBQUEsUUFDbkM7QUFBQSxNQUNELENBQUM7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUE7QUFFUixTQUFTLHdCQUF3QixHQUFHO0FBQUEsRUFDbkMsSUFBSSxhQUFhO0FBQUEsRUFDakIsSUFBSSxhQUFhO0FBQUEsRUFDakIsSUFBSSwrQkFBK0IsSUFBSTtBQUFBLEVBQ3ZDLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTztBQUFBLElBQ3JCLE1BQU0sU0FBUyxDQUFDO0FBQUEsSUFDaEIsSUFBSSxXQUFXO0FBQUEsSUFDZixHQUFHO0FBQUEsTUFDRixNQUFNLGFBQWEsYUFBYSxPQUFPLFFBQVE7QUFBQSxNQUMvQyxNQUFNLFFBQU8sV0FBVyxXQUFXLE1BQU0sVUFBVSxVQUFVLFdBQVcsYUFBYSxJQUFJLE1BQU0sVUFBVSxRQUFRO0FBQUEsTUFDakgsSUFBSSxNQUFLLFNBQVM7QUFBQSxRQUFHLE9BQU8sS0FBSztBQUFBLFVBQ2hDLE9BQU87QUFBQSxVQUNQO0FBQUEsVUFDQTtBQUFBLFVBQ0EsYUFBYSxJQUFJLElBQUksWUFBWTtBQUFBLFFBQ2xDLENBQUM7QUFBQSxNQUNELElBQUksV0FBVyxVQUFVO0FBQUEsUUFDeEIsTUFBTSxXQUFXLGNBQWMsV0FBVyxRQUFRO0FBQUEsUUFDbEQsV0FBVyxjQUFjO0FBQUEsVUFBVSxJQUFJLFdBQVcsU0FBUyxZQUFZO0FBQUEsWUFDdEUsYUFBYTtBQUFBLFlBQ2IsYUFBYTtBQUFBLFlBQ2IsYUFBYSxNQUFNO0FBQUEsVUFDcEIsRUFBTyxTQUFJLFdBQVcsU0FBUztBQUFBLFlBQXdCLGFBQWE7QUFBQSxVQUMvRCxTQUFJLFdBQVcsU0FBUztBQUFBLFlBQXdCLGFBQWE7QUFBQSxVQUM3RCxTQUFJLFdBQVcsU0FBUztBQUFBLFlBQW1CLGFBQWEsT0FBTyxXQUFXLEtBQUs7QUFBQSxRQUNwRixXQUFXLGNBQWM7QUFBQSxVQUFVLElBQUksV0FBVyxTQUFTO0FBQUEsWUFBc0IsYUFBYSxXQUFXO0FBQUEsVUFDcEcsU0FBSSxXQUFXLFNBQVM7QUFBQSxZQUFzQixhQUFhLFdBQVc7QUFBQSxVQUN0RSxTQUFJLFdBQVcsU0FBUztBQUFBLFlBQWlCLGFBQWEsSUFBSSxXQUFXLEtBQUs7QUFBQSxNQUNoRjtBQUFBLE1BQ0EsV0FBVyxXQUFXO0FBQUEsSUFDdkIsU0FBUyxXQUFXLE1BQU07QUFBQSxJQUMxQixPQUFPO0FBQUEsSUFDTjtBQUFBO0FBRUgsSUFBSSx3QkFBd0I7QUFBQSxFQUMzQixPQUFPO0FBQUEsRUFDUCxLQUFLO0FBQUEsRUFDTCxPQUFPO0FBQUEsRUFDUCxRQUFRO0FBQUEsRUFDUixNQUFNO0FBQUEsRUFDTixTQUFTO0FBQUEsRUFDVCxNQUFNO0FBQUEsRUFDTixPQUFPO0FBQUEsRUFDUCxhQUFhO0FBQUEsRUFDYixXQUFXO0FBQUEsRUFDWCxhQUFhO0FBQUEsRUFDYixjQUFjO0FBQUEsRUFDZCxZQUFZO0FBQUEsRUFDWixlQUFlO0FBQUEsRUFDZixZQUFZO0FBQUEsRUFDWixhQUFhO0FBQ2Q7QUFDQSxTQUFTLGtCQUFrQixDQUFDLGlCQUFpQix1QkFBdUI7QUFBQSxFQUNuRSxTQUFTLFVBQVUsQ0FBQyxNQUFNO0FBQUEsSUFDekIsT0FBTyxlQUFlO0FBQUE7QUFBQSxFQUV2QixTQUFTLFFBQVEsQ0FBQyxLQUFLO0FBQUEsSUFDdEIsT0FBTyxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxJQUFJLEdBQUcsS0FBSyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsU0FBUyxHQUFHLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRTtBQUFBO0FBQUEsRUFFL0YsSUFBSTtBQUFBLEVBQ0osU0FBUyxhQUFhLEdBQUc7QUFBQSxJQUN4QixJQUFJO0FBQUEsTUFBWSxPQUFPO0FBQUEsSUFDdkIsYUFBYSxDQUFDO0FBQUEsSUFDZCxTQUFTLElBQUksRUFBRyxJQUFJLFlBQVksUUFBUTtBQUFBLE1BQUssV0FBVyxLQUFLLFdBQVcsWUFBWSxFQUFFLENBQUM7QUFBQSxJQUN2RixJQUFJLFNBQVM7QUFBQSxNQUNaO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNEO0FBQUEsSUFDQSxTQUFTLElBQUksRUFBRyxJQUFJLEdBQUc7QUFBQSxNQUFLLFNBQVMsSUFBSSxFQUFHLElBQUksR0FBRztBQUFBLFFBQUssU0FBUyxJQUFJLEVBQUcsSUFBSSxHQUFHO0FBQUEsVUFBSyxXQUFXLEtBQUssU0FBUztBQUFBLFlBQzVHLE9BQU87QUFBQSxZQUNQLE9BQU87QUFBQSxZQUNQLE9BQU87QUFBQSxVQUNSLENBQUMsQ0FBQztBQUFBLElBQ0YsSUFBSSxRQUFRO0FBQUEsSUFDWixTQUFTLElBQUksRUFBRyxJQUFJLElBQUksS0FBSyxTQUFTO0FBQUEsTUFBSSxXQUFXLEtBQUssU0FBUztBQUFBLFFBQ2xFO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNELENBQUMsQ0FBQztBQUFBLElBQ0YsT0FBTztBQUFBO0FBQUEsRUFFUixTQUFTLFVBQVUsQ0FBQyxPQUFPO0FBQUEsSUFDMUIsT0FBTyxjQUFjLEVBQUU7QUFBQTtBQUFBLEVBRXhCLFNBQVMsS0FBSyxDQUFDLE9BQU87QUFBQSxJQUNyQixRQUFRLE1BQU07QUFBQSxXQUNSO0FBQUEsUUFBUyxPQUFPLFdBQVcsTUFBTSxJQUFJO0FBQUEsV0FDckM7QUFBQSxRQUFPLE9BQU8sU0FBUyxNQUFNLEdBQUc7QUFBQSxXQUNoQztBQUFBLFFBQVMsT0FBTyxXQUFXLE1BQU0sS0FBSztBQUFBO0FBQUE7QUFBQSxFQUc3QyxPQUFPLEVBQUUsTUFBTTtBQUFBO0FBSWhCLElBQU0sZUFBZTtBQUNyQixJQUFNLGtCQUFrQjtBQUt4QixJQUFNLG9CQUFvQjtBQUFBLEVBQ3pCLE9BQU87QUFBQSxFQUNQLEtBQUs7QUFBQSxFQUNMLE9BQU87QUFBQSxFQUNQLFFBQVE7QUFBQSxFQUNSLE1BQU07QUFBQSxFQUNOLFNBQVM7QUFBQSxFQUNULE1BQU07QUFBQSxFQUNOLE9BQU87QUFBQSxFQUNQLGFBQWE7QUFBQSxFQUNiLFdBQVc7QUFBQSxFQUNYLGFBQWE7QUFBQSxFQUNiLGNBQWM7QUFBQSxFQUNkLFlBQVk7QUFBQSxFQUNaLGVBQWU7QUFBQSxFQUNmLFlBQVk7QUFBQSxFQUNaLGFBQWE7QUFDZDtBQUNBLFNBQVMscUJBQXFCLENBQUMsT0FBTyxjQUFjLFNBQVM7QUFBQSxFQUM1RCxNQUFNLG9CQUFvQix5QkFBeUIsT0FBTyxPQUFPO0FBQUEsRUFDakUsTUFBTSxRQUFRLFdBQVcsWUFBWTtBQUFBLEVBQ3JDLE1BQU0sZUFBZSxtQkFBbUIsT0FBTyxZQUFZLFlBQVksSUFBSSxDQUFDLFNBQVM7QUFBQSxJQUNwRixNQUFNLE9BQU0sZ0JBQWdCLEtBQUssR0FBRyxZQUFZLElBQUksS0FBSyxVQUFVLENBQUM7QUFBQSxJQUNwRSxPQUFPLENBQUMsTUFBTSxNQUFNLFNBQVMsU0FBUSxrQkFBa0IsS0FBSztBQUFBLEdBQzVELENBQUMsQ0FBQztBQUFBLEVBQ0gsTUFBTSxTQUFTLHlCQUF5QjtBQUFBLEVBQ3hDLE9BQU8sTUFBTSxJQUFJLENBQUMsU0FBUyxPQUFPLE1BQU0sS0FBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLFVBQVU7QUFBQSxJQUMvRCxJQUFJO0FBQUEsSUFDSixJQUFJO0FBQUEsSUFDSixJQUFJLE1BQU0sWUFBWSxJQUFJLFNBQVMsR0FBRztBQUFBLE1BQ3JDLFFBQVEsTUFBTSxhQUFhLGFBQWEsTUFBTSxNQUFNLFVBQVUsSUFBSSxNQUFNO0FBQUEsTUFDeEUsVUFBVSxNQUFNLGFBQWEsYUFBYSxNQUFNLE1BQU0sVUFBVSxJQUFJLE1BQU07QUFBQSxJQUMzRSxFQUFPO0FBQUEsTUFDTixRQUFRLE1BQU0sYUFBYSxhQUFhLE1BQU0sTUFBTSxVQUFVLElBQUksTUFBTTtBQUFBLE1BQ3hFLFVBQVUsTUFBTSxhQUFhLGFBQWEsTUFBTSxNQUFNLFVBQVUsSUFBUztBQUFBO0FBQUEsSUFFMUUsUUFBUSx1QkFBdUIsT0FBTyxpQkFBaUI7QUFBQSxJQUN2RCxVQUFVLHVCQUF1QixTQUFTLGlCQUFpQjtBQUFBLElBQzNELElBQUksTUFBTSxZQUFZLElBQUksS0FBSztBQUFBLE1BQUcsUUFBUSxTQUFTLEtBQUs7QUFBQSxJQUN4RCxJQUFJLFlBQVksVUFBVTtBQUFBLElBQzFCLElBQUksTUFBTSxZQUFZLElBQUksTUFBTTtBQUFBLE1BQUcsYUFBYSxVQUFVO0FBQUEsSUFDMUQsSUFBSSxNQUFNLFlBQVksSUFBSSxRQUFRO0FBQUEsTUFBRyxhQUFhLFVBQVU7QUFBQSxJQUM1RCxJQUFJLE1BQU0sWUFBWSxJQUFJLFdBQVc7QUFBQSxNQUFHLGFBQWEsVUFBVTtBQUFBLElBQy9ELElBQUksTUFBTSxZQUFZLElBQUksZUFBZTtBQUFBLE1BQUcsYUFBYSxVQUFVO0FBQUEsSUFDbkUsT0FBTztBQUFBLE1BQ04sU0FBUyxNQUFNO0FBQUEsTUFDZixRQUFRLEtBQUs7QUFBQSxNQUNiO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNEO0FBQUEsR0FDQSxDQUFDO0FBQUE7QUFLSCxTQUFTLFFBQVEsQ0FBQyxPQUFPO0FBQUEsRUFDeEIsTUFBTSxXQUFXLE1BQU0sTUFBTSxZQUFZO0FBQUEsRUFDekMsSUFBSSxVQUFVO0FBQUEsSUFDYixNQUFNLE1BQU0sU0FBUztBQUFBLElBQ3JCLElBQUksSUFBSSxXQUFXLEdBQUc7QUFBQSxNQUNyQixNQUFNLFFBQVEsS0FBSyxNQUFNLE9BQU8sU0FBUyxJQUFJLE1BQU0sR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRSxTQUFTLEdBQUcsR0FBRztBQUFBLE1BQy9GLE9BQU8sSUFBSSxJQUFJLE1BQU0sR0FBRyxDQUFDLElBQUk7QUFBQSxJQUM5QixFQUFPLFNBQUksSUFBSSxXQUFXO0FBQUEsTUFBRyxPQUFPLElBQUk7QUFBQSxJQUNuQyxTQUFJLElBQUksV0FBVyxHQUFHO0FBQUEsTUFDMUIsTUFBTSxJQUFJLElBQUk7QUFBQSxNQUNkLE1BQU0sSUFBSSxJQUFJO0FBQUEsTUFDZCxNQUFNLElBQUksSUFBSTtBQUFBLE1BQ2QsTUFBTSxJQUFJLElBQUk7QUFBQSxNQUNkLE9BQU8sSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLE1BQU0sT0FBTyxTQUFTLEdBQUcsSUFBSSxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsU0FBUyxHQUFHLEdBQUc7QUFBQSxJQUNoSCxFQUFPLFNBQUksSUFBSSxXQUFXLEdBQUc7QUFBQSxNQUM1QixNQUFNLElBQUksSUFBSTtBQUFBLE1BQ2QsTUFBTSxJQUFJLElBQUk7QUFBQSxNQUNkLE1BQU0sSUFBSSxJQUFJO0FBQUEsTUFDZCxPQUFPLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJO0FBQUEsSUFDaEM7QUFBQSxFQUNEO0FBQUEsRUFDQSxNQUFNLGNBQWMsTUFBTSxNQUFNLGVBQWU7QUFBQSxFQUMvQyxJQUFJO0FBQUEsSUFBYSxPQUFPLE9BQU8sWUFBWTtBQUFBLEVBQzNDLE9BQU87QUFBQTtBQVFSLFNBQVMsaUJBQWdCLENBQUMsV0FBVyxNQUFNLFVBQVUsQ0FBQyxHQUFHO0FBQUEsRUFDeEQsTUFBTSxPQUFPLFVBQVUsaUJBQWlCLFFBQVEsUUFBUSxNQUFNO0FBQUEsRUFDOUQsUUFBUSxPQUFPLFlBQVksVUFBVSxnQkFBZ0IsRUFBRSxPQUFPO0FBQUEsRUFDOUQsSUFBSSxDQUFDLFlBQVksSUFBSSxLQUFLLENBQUMsWUFBWSxTQUFTLEtBQUssU0FBUyxRQUFRO0FBQUEsSUFDckUsUUFBUSxVQUFVLFVBQVUsU0FBUyxTQUFTO0FBQUEsSUFDOUMsT0FBTyxzQkFBc0IsT0FBTyxNQUFNLE9BQU87QUFBQSxFQUNsRDtBQUFBLEVBQ0EsT0FBTyxpQkFBbUIsV0FBVyxNQUFNLE9BQU87QUFBQTtBQVNuRCxTQUFTLFlBQVksQ0FBQyxXQUFXLE1BQU0sU0FBUztBQUFBLEVBQy9DLElBQUk7QUFBQSxFQUNKLElBQUk7QUFBQSxFQUNKLElBQUk7QUFBQSxFQUNKLElBQUk7QUFBQSxFQUNKLElBQUk7QUFBQSxFQUNKLElBQUk7QUFBQSxFQUNKLElBQUksWUFBWSxTQUFTO0FBQUEsSUFDeEIsUUFBUSxlQUFlLFNBQVMsb0JBQW9CLFlBQVksa0JBQWtCLGVBQWU7QUFBQSxJQUNqRyxNQUFNLFNBQVMsT0FBTyxRQUFRLFFBQVEsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPO0FBQUEsTUFDN0UsT0FBTyxFQUFFO0FBQUEsTUFDVCxPQUFPLEVBQUU7QUFBQSxJQUNWLEVBQUUsRUFBRSxLQUFLLENBQUMsR0FBRyxNQUFNLEVBQUUsVUFBVSxlQUFlLEtBQUssRUFBRSxVQUFVLGVBQWUsSUFBSSxDQUFDO0FBQUEsSUFDbkYsSUFBSSxPQUFPLFdBQVc7QUFBQSxNQUFHLE1BQU0sSUFBSSxXQUFhLG1DQUFtQztBQUFBLElBQ25GLE1BQU0sY0FBYyx1QkFBeUIsV0FBVyxNQUFNLFNBQVMsaUJBQWdCO0FBQUEsSUFDdkYsZUFBZSwyQkFBMkIsV0FBVztBQUFBLElBQ3JELElBQUksZ0JBQW1DLGlCQUFuQixrQkFBbUMsQ0FBQyxPQUFPLEtBQUssQ0FBQyxNQUFNLEVBQUUsVUFBVSxZQUFZO0FBQUEsTUFBRyxNQUFNLElBQUksV0FBYSx5REFBeUQsZ0JBQWdCO0FBQUEsSUFDdE0sTUFBTSxZQUFZLE9BQU8sSUFBSSxDQUFDLE1BQU0sVUFBVSxTQUFTLEVBQUUsS0FBSyxDQUFDO0FBQUEsSUFDL0QsTUFBTSxjQUFjLE9BQU8sSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLO0FBQUEsSUFDN0MsU0FBUyxZQUFZLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSSxDQUFDLFVBQVUsa0JBQWtCLE9BQU8sYUFBYSxtQkFBbUIsY0FBYyxlQUFlLENBQUMsQ0FBQztBQUFBLElBQy9JLElBQUk7QUFBQSxNQUFjLHlCQUF5QixRQUFRLFlBQVk7QUFBQSxJQUMvRCxNQUFNLHlCQUF5QixPQUFPLElBQUksQ0FBQyxNQUFNLHlCQUF5QixFQUFFLE9BQU8sT0FBTyxDQUFDO0FBQUEsSUFDM0YsS0FBSyxlQUFlLFFBQVEsV0FBVyx3QkFBd0IsbUJBQW1CLGNBQWMsTUFBTSxlQUFlO0FBQUEsSUFDckgsS0FBSyxlQUFlLFFBQVEsV0FBVyx3QkFBd0IsbUJBQW1CLGNBQWMsTUFBTSxlQUFlO0FBQUEsSUFDckgsWUFBWSxnQkFBZ0IsVUFBVSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEdBQUc7QUFBQSxJQUNqRSxZQUFZLGVBQW9CLFlBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxLQUFLLEdBQUc7QUFBQSxFQUN0RCxFQUFPLFNBQUksV0FBVyxTQUFTO0FBQUEsSUFDOUIsTUFBTSxvQkFBb0IseUJBQXlCLFFBQVEsT0FBTyxPQUFPO0FBQUEsSUFDekUsU0FBUyxrQkFBaUIsV0FBVyxNQUFNLE9BQU87QUFBQSxJQUNsRCxNQUFNLFNBQVMsVUFBVSxTQUFTLFFBQVEsS0FBSztBQUFBLElBQy9DLEtBQUssdUJBQXVCLE9BQU8sSUFBSSxpQkFBaUI7QUFBQSxJQUN4RCxLQUFLLHVCQUF1QixPQUFPLElBQUksaUJBQWlCO0FBQUEsSUFDeEQsWUFBWSxPQUFPO0FBQUEsSUFDbkIsZUFBZSwyQkFBMkIsTUFBTTtBQUFBLEVBQ2pELEVBQU87QUFBQSxVQUFNLElBQUksV0FBYSw4REFBOEQ7QUFBQSxFQUM1RixPQUFPO0FBQUEsSUFDTjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRDtBQUFBO0FBRUQsU0FBUyxjQUFjLENBQUMsUUFBUSxXQUFXLHdCQUF3QixtQkFBbUIsY0FBYyxVQUFVLGlCQUFpQjtBQUFBLEVBQzlILE9BQU8sT0FBTyxJQUFJLENBQUMsR0FBRyxRQUFRO0FBQUEsSUFDN0IsTUFBTSxRQUFRLHVCQUF1QixVQUFVLEtBQUssV0FBVyx1QkFBdUIsSUFBSSxLQUFLO0FBQUEsSUFDL0YsTUFBTSxTQUFTLEdBQUcsb0JBQW9CLEVBQUUsUUFBUSxhQUFhLE9BQU8sUUFBUSxNQUFNO0FBQUEsSUFDbEYsSUFBSSxRQUFRLEtBQUssY0FBYztBQUFBLE1BQzlCLElBQUksaUJBQWlCLGtCQUFrQixPQUFPLFNBQVMsR0FBRztBQUFBLFFBQ3pELE1BQU0sYUFBYSxPQUFPLFVBQVUsQ0FBQyxPQUFNLEdBQUUsVUFBVSxPQUFPO0FBQUEsUUFDOUQsTUFBTSxZQUFZLE9BQU8sVUFBVSxDQUFDLE9BQU0sR0FBRSxVQUFVLE1BQU07QUFBQSxRQUM1RCxJQUFJLGVBQWUsTUFBTSxjQUFjO0FBQUEsVUFBSSxNQUFNLElBQUksV0FBYSw0RkFBOEY7QUFBQSxRQUNoSyxPQUFPLGNBQWMsdUJBQXVCLFVBQVUsWUFBWSxXQUFXLHVCQUF1QixXQUFXLEtBQUssY0FBYyx1QkFBdUIsVUFBVSxXQUFXLFdBQVcsdUJBQXVCLFVBQVUsS0FBSyxjQUFjO0FBQUEsTUFDOU87QUFBQSxNQUNBLE9BQU87QUFBQSxJQUNSO0FBQUEsSUFDQSxJQUFJLG9CQUFvQjtBQUFBLE1BQVksT0FBTztBQUFBLElBQzNDLE9BQU87QUFBQSxHQUNQLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEdBQUc7QUFBQTtBQUkvQixJQUFNLHFCQUFxQjtBQUMzQixJQUFNLGlDQUFpQztBQUN2QyxTQUFTLFVBQVUsQ0FBQyxXQUFXLE1BQU0sU0FBUyxxQkFBcUI7QUFBQSxFQUNsRSxNQUFNLENBQUM7QUFBQSxFQUNQO0FBQUEsRUFDQSxZQUFZLENBQUMsT0FBTyxhQUFhLFdBQVcsV0FBVyxPQUFPLFFBQVE7QUFBQSxFQUN0RSxjQUFjLENBQUMsT0FBTyxhQUFhLGFBQWEsV0FBVyxPQUFPLFFBQVE7QUFDM0UsR0FBRztBQUFBLEVBQ0YsSUFBSSxRQUFRO0FBQUEsRUFDWixXQUFXLGVBQWUsZ0JBQWdCLE9BQU87QUFBQSxJQUFHLFFBQVEsWUFBWSxZQUFZLEtBQUssb0JBQW9CLE9BQU8sT0FBTyxLQUFLO0FBQUEsRUFDaEksTUFBTSxRQUFRLElBQUksSUFBSSxXQUFXLFdBQVcsaUJBQWlCLGFBQWEsV0FBVyxPQUFPLE9BQU87QUFBQSxFQUNuRyxRQUFRLG1CQUFtQixNQUFNLHVCQUF1QixVQUFVO0FBQUEsRUFDbEUsSUFBSSxxQkFBcUI7QUFBQSxJQUFNLFNBQVMsc0JBQXNCLE1BQU07QUFBQSxFQUMvRCxTQUFJLHFCQUFxQjtBQUFBLElBQVMsU0FBUyxzQkFBc0IsTUFBTTtBQUFBLEVBQzVFLElBQUk7QUFBQSxJQUFzQixTQUFTLDBCQUEwQixNQUFNO0FBQUEsRUFDbkUsTUFBTSxnQkFBZ0I7QUFBQSxPQUNsQjtBQUFBLFFBQ0MsTUFBTSxHQUFHO0FBQUEsTUFDWixPQUFPO0FBQUE7QUFBQSxFQUVUO0FBQUEsRUFDQSxXQUFXLGVBQWUsZ0JBQWdCLE9BQU87QUFBQSxJQUFHLFNBQVMsWUFBWSxRQUFRLEtBQUssZUFBZSxNQUFNLEtBQUs7QUFBQSxFQUNoSCxPQUFPLGFBQWEsUUFBUTtBQUFBLE9BQ3hCO0FBQUEsSUFDSDtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQSxXQUFXLFFBQVEsY0FBYyxRQUFRLFFBQVEsUUFBUSxhQUFhO0FBQUEsRUFDdkUsR0FBRyxlQUFlLFlBQVk7QUFBQTtBQUUvQixTQUFTLFlBQVksQ0FBQyxRQUFRLFNBQVMsb0JBQW9CLGVBQWUsMkJBQTJCLE1BQU0sR0FBRztBQUFBLEVBQzdHLE1BQU0sZUFBZSxnQkFBZ0IsT0FBTztBQUFBLEVBQzVDLE1BQU0sUUFBUSxDQUFDO0FBQUEsRUFDZixNQUFNLFFBQU87QUFBQSxJQUNaLE1BQU07QUFBQSxJQUNOLFVBQVUsQ0FBQztBQUFBLEVBQ1o7QUFBQSxFQUNBLFFBQVEsWUFBWSxXQUFXLFdBQVcsUUFBUTtBQUFBLEVBQ2xELE1BQU0sYUFBYSxFQUFFLE9BQU8sU0FBUyxRQUFRLGFBQWEsS0FBSztBQUFBLEVBQy9ELElBQUksUUFBUSxjQUFjO0FBQUEsSUFBTyxJQUFJLFFBQVEsYUFBYTtBQUFBLE1BQU0sV0FBVyxRQUFRLFFBQVE7QUFBQSxJQUN0RjtBQUFBLGlCQUFXLFFBQVEsb0JBQW9CLFFBQVEsWUFBWSxRQUFRO0FBQUEsRUFDeEUsSUFBSSxhQUFhLFNBQVMsWUFBWTtBQUFBLElBQU0sV0FBVyxXQUFXLFNBQVMsU0FBUztBQUFBLEVBQ3BGLFlBQVksTUFBSyxVQUFVLE9BQU8sUUFBUSxRQUFRLFFBQVEsQ0FBQyxDQUFDO0FBQUEsSUFBRyxJQUFJLENBQUMsS0FBSSxXQUFXLEdBQUc7QUFBQSxNQUFHLFdBQVcsUUFBTztBQUFBLEVBQzNHLElBQUksVUFBVTtBQUFBLElBQ2IsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1Q7QUFBQSxJQUNBLFVBQVUsQ0FBQztBQUFBLElBQ1gsTUFBTSxRQUFRO0FBQUEsRUFDZjtBQUFBLEVBQ0EsSUFBSSxXQUFXO0FBQUEsSUFDZCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxZQUFZLENBQUM7QUFBQSxJQUNiLFVBQVU7QUFBQSxFQUNYO0FBQUEsRUFDQSxNQUFNLFlBQVksQ0FBQztBQUFBLEVBQ25CLE1BQU0sVUFBVTtBQUFBLE9BQ1o7QUFBQSxJQUNIO0FBQUEsSUFDQTtBQUFBLFFBQ0ksTUFBTSxHQUFHO0FBQUEsTUFDWixPQUFPLG1CQUFtQjtBQUFBO0FBQUEsUUFFdkIsTUFBTSxHQUFHO0FBQUEsTUFDWixPQUFPO0FBQUE7QUFBQSxRQUVKLE9BQU8sR0FBRztBQUFBLE1BQ2IsT0FBTztBQUFBO0FBQUEsUUFFSixJQUFJLEdBQUc7QUFBQSxNQUNWLE9BQU87QUFBQTtBQUFBLFFBRUosR0FBRyxHQUFHO0FBQUEsTUFDVCxPQUFPO0FBQUE7QUFBQSxRQUVKLElBQUksR0FBRztBQUFBLE1BQ1YsT0FBTztBQUFBO0FBQUEsUUFFSixLQUFLLEdBQUc7QUFBQSxNQUNYLE9BQU87QUFBQTtBQUFBLEVBRVQ7QUFBQSxFQUNBLE9BQU8sUUFBUSxDQUFDLE1BQU0sUUFBUTtBQUFBLElBQzdCLElBQUksS0FBSztBQUFBLE1BQ1IsSUFBSSxjQUFjO0FBQUEsUUFBVSxNQUFLLFNBQVMsS0FBSztBQUFBLFVBQzlDLE1BQU07QUFBQSxVQUNOLFNBQVM7QUFBQSxVQUNULFlBQVksQ0FBQztBQUFBLFVBQ2IsVUFBVSxDQUFDO0FBQUEsUUFDWixDQUFDO0FBQUEsTUFDSSxTQUFJLGNBQWM7QUFBQSxRQUFXLE1BQU0sS0FBSztBQUFBLFVBQzVDLE1BQU07QUFBQSxVQUNOLE9BQU87QUFBQTtBQUFBLFFBQ1IsQ0FBQztBQUFBLElBQ0Y7QUFBQSxJQUNBLElBQUksV0FBVztBQUFBLE1BQ2QsTUFBTTtBQUFBLE1BQ04sU0FBUztBQUFBLE1BQ1QsWUFBWSxFQUFFLE9BQU8sT0FBTztBQUFBLE1BQzVCLFVBQVUsQ0FBQztBQUFBLElBQ1o7QUFBQSxJQUNBLElBQUksTUFBTTtBQUFBLElBQ1YsV0FBVyxTQUFTLE1BQU07QUFBQSxNQUN6QixJQUFJLFlBQVk7QUFBQSxRQUNmLE1BQU07QUFBQSxRQUNOLFNBQVM7QUFBQSxRQUNULFlBQVksS0FBSyxNQUFNLFVBQVU7QUFBQSxRQUNqQyxVQUFVLENBQUM7QUFBQSxVQUNWLE1BQU07QUFBQSxVQUNOLE9BQU8sTUFBTTtBQUFBLFFBQ2QsQ0FBQztBQUFBLE1BQ0Y7QUFBQSxNQUNBLE1BQU0sUUFBUSxvQkFBb0IsTUFBTSxhQUFhLG9CQUFvQixLQUFLLENBQUM7QUFBQSxNQUMvRSxJQUFJO0FBQUEsUUFBTyxVQUFVLFdBQVcsUUFBUTtBQUFBLE1BQ3hDLFdBQVcsZUFBZTtBQUFBLFFBQWMsWUFBWSxhQUFhLE1BQU0sS0FBSyxTQUFTLFdBQVcsTUFBTSxHQUFHLEtBQUssVUFBVSxLQUFLLEtBQUs7QUFBQSxNQUNsSSxJQUFJLGNBQWM7QUFBQSxRQUFVLE1BQUssU0FBUyxLQUFLLFNBQVM7QUFBQSxNQUNuRCxTQUFJLGNBQWM7QUFBQSxRQUFXLFNBQVMsU0FBUyxLQUFLLFNBQVM7QUFBQSxNQUNsRSxPQUFPLE1BQU0sUUFBUTtBQUFBLElBQ3RCO0FBQUEsSUFDQSxJQUFJLGNBQWMsV0FBVztBQUFBLE1BQzVCLFdBQVcsZUFBZTtBQUFBLFFBQWMsV0FBVyxhQUFhLE1BQU0sS0FBSyxTQUFTLFVBQVUsTUFBTSxDQUFDLEtBQUs7QUFBQSxNQUMxRyxVQUFVLEtBQUssUUFBUTtBQUFBLE1BQ3ZCLE1BQU0sS0FBSyxRQUFRO0FBQUEsSUFDcEIsRUFBTyxTQUFJLGNBQWM7QUFBQSxNQUFVLFVBQVUsS0FBSyxRQUFRO0FBQUEsR0FDMUQ7QUFBQSxFQUNELElBQUksY0FBYyxXQUFXO0FBQUEsSUFDNUIsV0FBVyxlQUFlO0FBQUEsTUFBYyxXQUFXLGFBQWEsTUFBTSxLQUFLLFNBQVMsUUFBUSxLQUFLO0FBQUEsSUFDakcsUUFBUSxTQUFTLEtBQUssUUFBUTtBQUFBLElBQzlCLFdBQVcsZUFBZTtBQUFBLE1BQWMsVUFBVSxhQUFhLEtBQUssS0FBSyxTQUFTLE9BQU8sS0FBSztBQUFBLElBQzlGLE1BQUssU0FBUyxLQUFLLE9BQU87QUFBQSxFQUMzQixFQUFPLFNBQUksY0FBYyxVQUFVO0FBQUEsSUFDbEMsTUFBTSxpQkFBaUIsQ0FBQztBQUFBLElBQ3hCLElBQUksY0FBYztBQUFBLE1BQ2pCLE1BQU07QUFBQSxNQUNOLFNBQVM7QUFBQSxNQUNULFlBQVksRUFBRSxPQUFPLE9BQU87QUFBQSxNQUM1QixVQUFVLENBQUM7QUFBQSxJQUNaO0FBQUEsSUFDQSxXQUFXLFNBQVMsTUFBSztBQUFBLE1BQVUsSUFBSSxNQUFNLFNBQVMsYUFBYSxNQUFNLFlBQVksTUFBTTtBQUFBLFFBQzFGLGVBQWUsS0FBSyxXQUFXO0FBQUEsUUFDL0IsY0FBYztBQUFBLFVBQ2IsTUFBTTtBQUFBLFVBQ04sU0FBUztBQUFBLFVBQ1QsWUFBWSxFQUFFLE9BQU8sT0FBTztBQUFBLFVBQzVCLFVBQVUsQ0FBQztBQUFBLFFBQ1o7QUFBQSxNQUNELEVBQU8sU0FBSSxNQUFNLFNBQVMsYUFBYSxNQUFNLFNBQVM7QUFBQSxRQUFRLFlBQVksU0FBUyxLQUFLLEtBQUs7QUFBQSxJQUM3RixlQUFlLEtBQUssV0FBVztBQUFBLElBQy9CLElBQUksa0JBQWtCO0FBQUEsTUFDckIsTUFBTTtBQUFBLE1BQ04sU0FBUztBQUFBLE1BQ1QsWUFBWSxDQUFDO0FBQUEsTUFDYixVQUFVO0FBQUEsSUFDWDtBQUFBLElBQ0EsV0FBVyxlQUFlO0FBQUEsTUFBYyxrQkFBa0IsYUFBYSxNQUFNLEtBQUssU0FBUyxlQUFlLEtBQUs7QUFBQSxJQUMvRyxNQUFLLFdBQVcsQ0FBQztBQUFBLElBQ2pCLFNBQVMsSUFBSSxFQUFHLElBQUksZ0JBQWdCLFNBQVMsUUFBUSxLQUFLO0FBQUEsTUFDekQsSUFBSSxJQUFJO0FBQUEsUUFBRyxNQUFLLFNBQVMsS0FBSztBQUFBLFVBQzdCLE1BQU07QUFBQSxVQUNOLFNBQVM7QUFBQSxVQUNULFlBQVksQ0FBQztBQUFBLFVBQ2IsVUFBVSxDQUFDO0FBQUEsUUFDWixDQUFDO0FBQUEsTUFDRCxNQUFNLE9BQU8sZ0JBQWdCLFNBQVM7QUFBQSxNQUN0QyxJQUFJLEtBQUssU0FBUztBQUFBLFFBQVcsTUFBSyxTQUFTLEtBQUssR0FBRyxLQUFLLFFBQVE7QUFBQSxJQUNqRTtBQUFBLEVBQ0Q7QUFBQSxFQUNBLElBQUksU0FBUztBQUFBLEVBQ2IsV0FBVyxlQUFlO0FBQUEsSUFBYyxTQUFTLGFBQWEsTUFBTSxLQUFLLFNBQVMsTUFBTSxLQUFLO0FBQUEsRUFDN0YsSUFBSTtBQUFBLElBQWMseUJBQXlCLFFBQVEsWUFBWTtBQUFBLEVBQy9ELE9BQU87QUFBQTtBQUVSLFNBQVMscUJBQXFCLENBQUMsUUFBUTtBQUFBLEVBQ3RDLE9BQU8sT0FBTyxJQUFJLENBQUMsU0FBUztBQUFBLElBQzNCLE1BQU0sVUFBVSxDQUFDO0FBQUEsSUFDakIsSUFBSSxpQkFBaUI7QUFBQSxJQUNyQixJQUFJO0FBQUEsSUFDSixLQUFLLFFBQVEsQ0FBQyxPQUFPLFFBQVE7QUFBQSxNQUM1QixNQUFNLGFBQWEsRUFBRSxNQUFNLGNBQWMsTUFBTSxZQUFZLFVBQVUsYUFBYSxNQUFNLFlBQVksVUFBVTtBQUFBLE1BQzlHLElBQUksY0FBYyxtQkFBbUIsS0FBSyxNQUFNLE9BQU8sS0FBSyxLQUFLLE1BQU0sSUFBSTtBQUFBLFFBQzFFLElBQUksZ0JBQXFCO0FBQUEsVUFBRyxjQUFjLE1BQU07QUFBQSxRQUNoRCxrQkFBa0IsTUFBTTtBQUFBLE1BQ3pCLEVBQU8sU0FBSSxnQkFBZ0I7QUFBQSxRQUMxQixJQUFJO0FBQUEsVUFBWSxRQUFRLEtBQUs7QUFBQSxlQUN6QjtBQUFBLFlBQ0gsUUFBUTtBQUFBLFlBQ1IsU0FBUyxpQkFBaUIsTUFBTTtBQUFBLFVBQ2pDLENBQUM7QUFBQSxRQUNJO0FBQUEsa0JBQVEsS0FBSztBQUFBLFlBQ2pCLFNBQVM7QUFBQSxZQUNULFFBQVE7QUFBQSxVQUNULEdBQUcsS0FBSztBQUFBLFFBQ1IsY0FBbUI7QUFBQSxRQUNuQixpQkFBaUI7QUFBQSxNQUNsQixFQUFPO0FBQUEsZ0JBQVEsS0FBSyxLQUFLO0FBQUEsS0FDekI7QUFBQSxJQUNELE9BQU87QUFBQSxHQUNQO0FBQUE7QUFFRixTQUFTLHFCQUFxQixDQUFDLFFBQVE7QUFBQSxFQUN0QyxPQUFPLE9BQU8sSUFBSSxDQUFDLFNBQVM7QUFBQSxJQUMzQixPQUFPLEtBQUssUUFBUSxDQUFDLFVBQVU7QUFBQSxNQUM5QixJQUFJLG1CQUFtQixLQUFLLE1BQU0sT0FBTztBQUFBLFFBQUcsT0FBTztBQUFBLE1BQ25ELE1BQU0sUUFBUSxNQUFNLFFBQVEsTUFBTSw4QkFBOEI7QUFBQSxNQUNoRSxJQUFJLENBQUM7QUFBQSxRQUFPLE9BQU87QUFBQSxNQUNuQixTQUFTLFNBQVMsU0FBUyxZQUFZO0FBQUEsTUFDdkMsSUFBSSxDQUFDLFdBQVcsQ0FBQztBQUFBLFFBQVUsT0FBTztBQUFBLE1BQ2xDLE1BQU0sV0FBVyxDQUFDO0FBQUEsV0FDZDtBQUFBLFFBQ0gsUUFBUSxNQUFNLFNBQVMsUUFBUTtBQUFBLFFBQy9CO0FBQUEsTUFDRCxDQUFDO0FBQUEsTUFDRCxJQUFJO0FBQUEsUUFBUyxTQUFTLFFBQVE7QUFBQSxVQUM3QixTQUFTO0FBQUEsVUFDVCxRQUFRLE1BQU07QUFBQSxRQUNmLENBQUM7QUFBQSxNQUNELElBQUk7QUFBQSxRQUFVLFNBQVMsS0FBSztBQUFBLFVBQzNCLFNBQVM7QUFBQSxVQUNULFFBQVEsTUFBTSxTQUFTLFFBQVEsU0FBUyxRQUFRO0FBQUEsUUFDakQsQ0FBQztBQUFBLE1BQ0QsT0FBTztBQUFBLEtBQ1A7QUFBQSxHQUNEO0FBQUE7QUFFRixTQUFTLHlCQUF5QixDQUFDLFFBQVE7QUFBQSxFQUMxQyxPQUFPLE9BQU8sSUFBSSxDQUFDLFNBQVM7QUFBQSxJQUMzQixNQUFNLFVBQVUsQ0FBQztBQUFBLElBQ2pCLFdBQVcsU0FBUyxNQUFNO0FBQUEsTUFDekIsSUFBSSxRQUFRLFdBQVcsR0FBRztBQUFBLFFBQ3pCLFFBQVEsS0FBSyxLQUFLLE1BQU0sQ0FBQztBQUFBLFFBQ3pCO0FBQUEsTUFDRDtBQUFBLE1BQ0EsTUFBTSxZQUFZLFFBQVEsR0FBRyxFQUFFO0FBQUEsTUFDL0IsTUFBTSxZQUFZLG9CQUFvQixVQUFVLGFBQWEsb0JBQW9CLFNBQVMsQ0FBQztBQUFBLE1BQzNGLE1BQU0sZUFBZSxvQkFBb0IsTUFBTSxhQUFhLG9CQUFvQixLQUFLLENBQUM7QUFBQSxNQUN0RixNQUFNLGtCQUFrQixVQUFVLGNBQWMsVUFBVSxZQUFZLFVBQVUsYUFBYSxVQUFVLFlBQVksVUFBVTtBQUFBLE1BQzdILE1BQU0sY0FBYyxNQUFNLGNBQWMsTUFBTSxZQUFZLFVBQVUsYUFBYSxNQUFNLFlBQVksVUFBVTtBQUFBLE1BQzdHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLGNBQWM7QUFBQSxRQUFjLFVBQVUsV0FBVyxNQUFNO0FBQUEsTUFDMUY7QUFBQSxnQkFBUSxLQUFLLEtBQUssTUFBTSxDQUFDO0FBQUEsSUFDL0I7QUFBQSxJQUNBLE9BQU87QUFBQSxHQUNQO0FBQUE7QUFJRixJQUFNLGFBQWE7QUFJbkIsU0FBUyxVQUFVLENBQUMsV0FBVyxNQUFNLFNBQVM7QUFBQSxFQUM3QyxNQUFNLFVBQVU7QUFBQSxJQUNmLE1BQU0sQ0FBQztBQUFBLElBQ1A7QUFBQSxJQUNBLFlBQVksQ0FBQyxPQUFPLGFBQWEsV0FBVyxXQUFXLE9BQU8sUUFBUTtBQUFBLElBQ3RFLGNBQWMsQ0FBQyxPQUFPLGFBQWEsYUFBYSxXQUFXLE9BQU8sUUFBUTtBQUFBLEVBQzNFO0FBQUEsRUFDQSxJQUFJLFNBQVMsV0FBVyxXQUFXLFdBQVcsTUFBTSxTQUFTLE9BQU8sQ0FBQztBQUFBLEVBQ3JFLFdBQVcsZUFBZSxnQkFBZ0IsT0FBTztBQUFBLElBQUcsU0FBUyxZQUFZLGFBQWEsS0FBSyxTQUFTLFFBQVEsT0FBTyxLQUFLO0FBQUEsRUFDeEgsT0FBTztBQUFBO0FBVVIsZUFBZSxxQkFBcUIsQ0FBQyxTQUFTO0FBQUEsRUFDN0MsTUFBTSxZQUFZLE1BQU0sMEJBQTRCLE9BQU87QUFBQSxFQUMzRCxPQUFPO0FBQUEsSUFDTixxQkFBcUIsSUFBSSxTQUFTLG9CQUFvQixXQUFXLEdBQUcsSUFBSTtBQUFBLElBQ3hFLGtCQUFrQixDQUFDLE1BQU0sYUFBWSxrQkFBaUIsV0FBVyxNQUFNLFFBQU87QUFBQSxJQUM5RSx3QkFBd0IsQ0FBQyxNQUFNLGFBQVksdUJBQXlCLFdBQVcsTUFBTSxRQUFPO0FBQUEsSUFDNUYsY0FBYyxDQUFDLE1BQU0sYUFBWSxhQUFhLFdBQVcsTUFBTSxRQUFPO0FBQUEsSUFDdEUsWUFBWSxDQUFDLE1BQU0sYUFBWSxXQUFXLFdBQVcsTUFBTSxRQUFPO0FBQUEsSUFDbEUsWUFBWSxDQUFDLE1BQU0sYUFBWSxXQUFXLFdBQVcsTUFBTSxRQUFPO0FBQUEsSUFDbEUscUJBQXFCLE9BQU8sQ0FBQztBQUFBLElBQzdCLGtCQUFrQixPQUFPLENBQUM7QUFBQSxPQUN2QjtBQUFBLElBQ0gsb0JBQW9CLE1BQU07QUFBQSxFQUMzQjtBQUFBO0FBVUQsU0FBUyx5QkFBeUIsQ0FBQyxTQUFTO0FBQUEsRUFDM0MsTUFBTSxXQUFXLHFCQUF1QixPQUFPO0FBQUEsRUFDL0MsT0FBTztBQUFBLElBQ04scUJBQXFCLElBQUksU0FBUyxvQkFBb0IsVUFBVSxHQUFHLElBQUk7QUFBQSxJQUN2RSxrQkFBa0IsQ0FBQyxNQUFNLGFBQVksa0JBQWlCLFVBQVUsTUFBTSxRQUFPO0FBQUEsSUFDN0Usd0JBQXdCLENBQUMsTUFBTSxhQUFZLHVCQUF5QixVQUFVLE1BQU0sUUFBTztBQUFBLElBQzNGLGNBQWMsQ0FBQyxNQUFNLGFBQVksYUFBYSxVQUFVLE1BQU0sUUFBTztBQUFBLElBQ3JFLFlBQVksQ0FBQyxNQUFNLGFBQVksV0FBVyxVQUFVLE1BQU0sUUFBTztBQUFBLElBQ2pFLFlBQVksQ0FBQyxNQUFNLGFBQVksV0FBVyxVQUFVLE1BQU0sUUFBTztBQUFBLElBQ2pFLHFCQUFxQixPQUFPLENBQUM7QUFBQSxJQUM3QixrQkFBa0IsT0FBTyxDQUFDO0FBQUEsT0FDdkI7QUFBQSxJQUNILG9CQUFvQixNQUFNO0FBQUEsRUFDM0I7QUFBQTtBQUVELFNBQVMsNEJBQTRCLENBQUMsbUJBQW1CO0FBQUEsRUFDeEQsSUFBSTtBQUFBLEVBQ0osZUFBZSwyQkFBMkIsQ0FBQyxTQUFTO0FBQUEsSUFDbkQsSUFBSSxDQUFDLFFBQVE7QUFBQSxNQUNaLFNBQVMsa0JBQWtCO0FBQUEsV0FDdkI7QUFBQSxRQUNILFFBQVEsUUFBUSxVQUFVLENBQUM7QUFBQSxRQUMzQixPQUFPLFFBQVEsU0FBUyxDQUFDO0FBQUEsTUFDMUIsQ0FBQztBQUFBLE1BQ0QsT0FBTztBQUFBLElBQ1IsRUFBTztBQUFBLE1BQ04sTUFBTSxJQUFJLE1BQU07QUFBQSxNQUNoQixNQUFNLFFBQVEsSUFBSSxDQUFDLEVBQUUsVUFBVSxHQUFHLFFBQVEsVUFBVSxDQUFDLENBQUMsR0FBRyxFQUFFLGFBQWEsR0FBRyxRQUFRLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUFBLE1BQ2hHLE9BQU87QUFBQTtBQUFBO0FBQUEsRUFHVCxPQUFPO0FBQUE7QUFFUixJQUFNLDhDQUE4Qyw2QkFBNkIscUJBQXFCO0FBR3RHLFNBQVMsd0JBQXdCLENBQUMsU0FBUztBQUFBLEVBQzFDLE1BQU0sbUJBQW1CLFFBQVE7QUFBQSxFQUNqQyxNQUFNLGdCQUFnQixRQUFRO0FBQUEsRUFDOUIsTUFBTSxTQUFTLFFBQVE7QUFBQSxFQUN2QixlQUFlLGlCQUFpQixDQUFDLFVBQVM7QUFBQSxJQUN6QyxTQUFTLFdBQVcsQ0FBQyxNQUFNO0FBQUEsTUFDMUIsSUFBSSxPQUFPLFNBQVMsVUFBVTtBQUFBLFFBQzdCLE9BQU8sU0FBUSxZQUFZLFNBQVM7QUFBQSxRQUNwQyxJQUFJLGNBQWMsSUFBSTtBQUFBLFVBQUcsT0FBTyxDQUFDO0FBQUEsUUFDakMsTUFBTSxTQUFTLGlCQUFpQjtBQUFBLFFBQ2hDLElBQUksQ0FBQztBQUFBLFVBQVEsTUFBTSxJQUFJLFdBQWEsY0FBYyxzRkFBc0Y7QUFBQSxRQUN4SSxPQUFPO0FBQUEsTUFDUjtBQUFBLE1BQ0EsT0FBTztBQUFBO0FBQUEsSUFFUixTQUFTLFlBQVksQ0FBQyxPQUFPO0FBQUEsTUFDNUIsSUFBSSxlQUFlLEtBQUs7QUFBQSxRQUFHLE9BQU87QUFBQSxNQUNsQyxJQUFJLE9BQU8sVUFBVSxVQUFVO0FBQUEsUUFDOUIsTUFBTSxTQUFTLGNBQWM7QUFBQSxRQUM3QixJQUFJLENBQUM7QUFBQSxVQUFRLE1BQU0sSUFBSSxXQUFhLFdBQVcsdUZBQXVGO0FBQUEsUUFDdEksT0FBTztBQUFBLE1BQ1I7QUFBQSxNQUNBLE9BQU87QUFBQTtBQUFBLElBRVIsTUFBTSxXQUFXLFNBQVEsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sYUFBYSxDQUFDLENBQUM7QUFBQSxJQUNqRSxNQUFNLFNBQVMsU0FBUSxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxZQUFZLENBQUMsQ0FBQztBQUFBLElBQzdELE1BQU0sUUFBTyxNQUFNLHNCQUFzQjtBQUFBLE1BQ3hDLFFBQVEsU0FBUSxVQUFVLE9BQU87QUFBQSxTQUM5QjtBQUFBLE1BQ0gsUUFBUTtBQUFBLE1BQ1I7QUFBQSxJQUNELENBQUM7QUFBQSxJQUNELE9BQU87QUFBQSxTQUNIO0FBQUEsTUFDSCxZQUFZLElBQUksUUFBTztBQUFBLFFBQ3RCLE9BQU8sTUFBSyxhQUFhLEdBQUcsT0FBTSxJQUFJLFdBQVcsQ0FBQztBQUFBO0FBQUEsTUFFbkQsU0FBUyxJQUFJLFFBQVE7QUFBQSxRQUNwQixPQUFPLE1BQUssVUFBVSxHQUFHLE9BQU8sSUFBSSxZQUFZLENBQUM7QUFBQTtBQUFBLE1BRWxELG1CQUFtQixHQUFHO0FBQUEsUUFDckIsT0FBTztBQUFBO0FBQUEsTUFFUixnQkFBZ0IsR0FBRztBQUFBLFFBQ2xCLE9BQU87QUFBQTtBQUFBLElBRVQ7QUFBQTtBQUFBLEVBRUQsT0FBTztBQUFBO0FBRVIsU0FBUyx3QkFBd0IsQ0FBQyxtQkFBbUI7QUFBQSxFQUNwRCxJQUFJO0FBQUEsRUFDSixlQUFlLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxHQUFHO0FBQUEsSUFDcEQsSUFBSSxDQUFDLFFBQVE7QUFBQSxNQUNaLFNBQVMsa0JBQWtCO0FBQUEsV0FDdkI7QUFBQSxRQUNILFFBQVEsQ0FBQztBQUFBLFFBQ1QsT0FBTyxDQUFDO0FBQUEsTUFDVCxDQUFDO0FBQUEsTUFDRCxNQUFNLElBQUksTUFBTTtBQUFBLE1BQ2hCLE1BQU0sUUFBUSxJQUFJLENBQUMsRUFBRSxVQUFVLEdBQUcsUUFBUSxVQUFVLENBQUMsQ0FBQyxHQUFHLEVBQUUsYUFBYSxHQUFHLFFBQVEsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQUEsTUFDaEcsT0FBTztBQUFBLElBQ1IsRUFBTztBQUFBLE1BQ04sTUFBTSxJQUFJLE1BQU07QUFBQSxNQUNoQixNQUFNLFFBQVEsSUFBSSxDQUFDLEVBQUUsVUFBVSxHQUFHLFFBQVEsVUFBVSxDQUFDLENBQUMsR0FBRyxFQUFFLGFBQWEsR0FBRyxRQUFRLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUFBLE1BQ2hHLE9BQU87QUFBQTtBQUFBO0FBQUEsRUFHVCxPQUFPO0FBQUE7QUFFUixTQUFTLHlCQUF5QixDQUFDLG1CQUFtQixRQUFRO0FBQUEsRUFDN0QsTUFBTSwwQkFBMEIseUJBQXlCLGlCQUFpQjtBQUFBLEVBQzFFLGVBQWUsR0FBRyxDQUFDLE1BQU0sU0FBUztBQUFBLElBQ2pDLE1BQU0sUUFBUSxNQUFNLHdCQUF3QjtBQUFBLE1BQzNDLE9BQU8sQ0FBQyxRQUFRLElBQUk7QUFBQSxNQUNwQixRQUFRLFdBQVcsVUFBVSxDQUFDLFFBQVEsS0FBSyxJQUFJLE9BQU8sT0FBTyxRQUFRLE1BQU07QUFBQSxJQUM1RSxDQUFDO0FBQUEsSUFDRCxNQUFNLFFBQVEsTUFBTSxRQUFRLHlCQUF5QixNQUFNLFFBQVEsTUFBTSxLQUFLO0FBQUEsSUFDOUUsSUFBSTtBQUFBLE1BQU8sTUFBTSxNQUFNLGFBQWEsR0FBRyxLQUFLO0FBQUEsSUFDNUMsT0FBTztBQUFBO0FBQUEsRUFFUixPQUFPO0FBQUEsSUFDTix1QkFBdUIsQ0FBQyxTQUFTO0FBQUEsTUFDaEMsT0FBTyx3QkFBd0IsT0FBTztBQUFBO0FBQUEsU0FFakMsV0FBVSxDQUFDLE1BQU0sU0FBUztBQUFBLE1BQy9CLFFBQVEsTUFBTSxJQUFJLE1BQU0sT0FBTyxHQUFHLFdBQVcsTUFBTSxPQUFPO0FBQUE7QUFBQSxTQUVyRCxXQUFVLENBQUMsTUFBTSxTQUFTO0FBQUEsTUFDL0IsUUFBUSxNQUFNLElBQUksTUFBTSxPQUFPLEdBQUcsV0FBVyxNQUFNLE9BQU87QUFBQTtBQUFBLFNBRXJELGFBQVksQ0FBQyxNQUFNLFNBQVM7QUFBQSxNQUNqQyxRQUFRLE1BQU0sSUFBSSxNQUFNLE9BQU8sR0FBRyxhQUFhLE1BQU0sT0FBTztBQUFBO0FBQUEsU0FFdkQsaUJBQWdCLENBQUMsTUFBTSxTQUFTO0FBQUEsTUFDckMsUUFBUSxNQUFNLElBQUksTUFBTSxPQUFPLEdBQUcsaUJBQWlCLE1BQU0sT0FBTztBQUFBO0FBQUEsU0FFM0QsdUJBQXNCLENBQUMsTUFBTSxTQUFTO0FBQUEsTUFDM0MsUUFBUSxNQUFNLElBQUksTUFBTSxPQUFPLEdBQUcsdUJBQXVCLE1BQU0sT0FBTztBQUFBO0FBQUEsU0FFakUsb0JBQW1CLENBQUMsTUFBTSxTQUFTO0FBQUEsTUFDeEMsUUFBUSxNQUFNLHdCQUF3QjtBQUFBLFFBQ3JDLE9BQU8sQ0FBQyxRQUFRLElBQUk7QUFBQSxRQUNwQixRQUFRLENBQUMsUUFBUSxLQUFLO0FBQUEsTUFDdkIsQ0FBQyxHQUFHLG9CQUFvQixNQUFNLE9BQU87QUFBQTtBQUFBLEVBRXZDO0FBQUE7QUFTRCxTQUFTLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxHQUFHO0FBQUEsRUFDOUMsUUFBUSxPQUFPLGlCQUFpQixpQkFBaUIsWUFBWSxZQUFZLFNBQVM7QUFBQSxFQUNsRixNQUFNLFdBQVcsQ0FBQyxVQUFTO0FBQUEsSUFDMUIsSUFBSSxRQUFRLG1CQUFtQjtBQUFBLE1BQU8sT0FBTyxPQUFPLGlCQUFpQixVQUFTLFFBQVEsaUJBQWlCO0FBQUEsSUFDdkcsT0FBTyxPQUFPLGlCQUFpQjtBQUFBO0FBQUEsRUFFaEMsTUFBTSxRQUFRO0FBQUEsSUFDYjtBQUFBLElBQ0EsTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLE1BQ1AscUJBQXFCLFNBQVMsWUFBWTtBQUFBLE1BQzFDLHFCQUFxQixTQUFTLFlBQVk7QUFBQSxNQUMxQyxzQkFBc0IsU0FBUyxZQUFZO0FBQUEsTUFDM0Msb0JBQW9CLFNBQVMsVUFBVTtBQUFBLE1BQ3ZDLHNCQUFzQixTQUFTLFlBQVk7QUFBQSxNQUMzQyx1QkFBdUIsU0FBUyxhQUFhO0FBQUEsTUFDN0MscUJBQXFCLFNBQVMsV0FBVztBQUFBLE1BQ3pDLHdCQUF3QixTQUFTLGNBQWM7QUFBQSxNQUMvQyxxQkFBcUIsU0FBUyxXQUFXO0FBQUEsTUFDekMsc0JBQXNCLFNBQVMsWUFBWTtBQUFBLE1BQzNDLDRCQUE0QixTQUFTLG1CQUFtQjtBQUFBLE1BQ3hELDBCQUEwQixTQUFTLGlCQUFpQjtBQUFBLE1BQ3BELDRCQUE0QixTQUFTLG1CQUFtQjtBQUFBLE1BQ3hELDZCQUE2QixTQUFTLG9CQUFvQjtBQUFBLE1BQzFELDJCQUEyQixTQUFTLGtCQUFrQjtBQUFBLE1BQ3RELDhCQUE4QixTQUFTLHFCQUFxQjtBQUFBLE1BQzVELDJCQUEyQixTQUFTLGtCQUFrQjtBQUFBLE1BQ3RELDRCQUE0QixTQUFTLG1CQUFtQjtBQUFBLElBQ3pEO0FBQUEsSUFDQSxhQUFhO0FBQUEsTUFDWjtBQUFBLFFBQ0MsT0FBTztBQUFBLFVBQ047QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxRQUNEO0FBQUEsUUFDQSxVQUFVLEVBQUUsWUFBWSxTQUFTLFlBQVksRUFBRTtBQUFBLE1BQ2hEO0FBQUEsTUFDQTtBQUFBLFFBQ0MsT0FBTztBQUFBLFFBQ1AsVUFBVSxFQUFFLFdBQVcsU0FBUztBQUFBLE1BQ2pDO0FBQUEsTUFDQTtBQUFBLFFBQ0MsT0FBTztBQUFBLFVBQ047QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFFBQ0Q7QUFBQSxRQUNBLFVBQVUsRUFBRSxXQUFXLE9BQU87QUFBQSxNQUMvQjtBQUFBLE1BQ0E7QUFBQSxRQUNDLE9BQU8sQ0FBQyx3QkFBd0I7QUFBQSxRQUNoQyxVQUFVLEVBQUUsV0FBVyxTQUFTO0FBQUEsTUFDakM7QUFBQSxNQUNBO0FBQUEsUUFDQyxPQUFPO0FBQUEsUUFDUCxVQUFVO0FBQUEsVUFDVCxXQUFXO0FBQUEsVUFDWCxZQUFZLFNBQVMsWUFBWTtBQUFBLFFBQ2xDO0FBQUEsTUFDRDtBQUFBLE1BQ0E7QUFBQSxRQUNDLE9BQU87QUFBQSxVQUNOO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxRQUNEO0FBQUEsUUFDQSxVQUFVLEVBQUUsWUFBWSxTQUFTLGNBQWMsRUFBRTtBQUFBLE1BQ2xEO0FBQUEsTUFDQTtBQUFBLFFBQ0MsT0FBTyxDQUFDLFdBQVcsK0JBQStCO0FBQUEsUUFDbEQsVUFBVSxFQUFFLFlBQVksU0FBUyxlQUFlLEVBQUU7QUFBQSxNQUNuRDtBQUFBLE1BQ0E7QUFBQSxRQUNDLE9BQU87QUFBQSxVQUNOO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFFBQ0Q7QUFBQSxRQUNBLFVBQVUsRUFBRSxZQUFZLFNBQVMsZ0JBQWdCLEVBQUU7QUFBQSxNQUNwRDtBQUFBLE1BQ0E7QUFBQSxRQUNDLE9BQU87QUFBQSxVQUNOO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsUUFDRDtBQUFBLFFBQ0EsVUFBVSxFQUFFLFlBQVksU0FBUyxlQUFlLEVBQUU7QUFBQSxNQUNuRDtBQUFBLE1BQ0E7QUFBQSxRQUNDLE9BQU87QUFBQSxRQUNQLFVBQVUsRUFBRSxZQUFZLFNBQVMsaUJBQWlCLEVBQUU7QUFBQSxNQUNyRDtBQUFBLE1BQ0E7QUFBQSxRQUNDLE9BQU87QUFBQSxVQUNOO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFFBQ0Q7QUFBQSxRQUNBLFVBQVUsRUFBRSxZQUFZLFNBQVMsZ0JBQWdCLEVBQUU7QUFBQSxNQUNwRDtBQUFBLE1BQ0E7QUFBQSxRQUNDLE9BQU87QUFBQSxVQUNOO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsUUFDRDtBQUFBLFFBQ0EsVUFBVSxFQUFFLFlBQVksU0FBUyx5QkFBeUIsRUFBRTtBQUFBLE1BQzdEO0FBQUEsTUFDQTtBQUFBLFFBQ0MsT0FBTztBQUFBLFVBQ047QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxRQUNEO0FBQUEsUUFDQSxVQUFVLEVBQUUsWUFBWSxTQUFTLG1CQUFtQixFQUFFO0FBQUEsTUFDdkQ7QUFBQSxNQUNBO0FBQUEsUUFDQyxPQUFPLENBQUMseUJBQXlCLDBDQUEwQztBQUFBLFFBQzNFLFVBQVUsRUFBRSxZQUFZLFNBQVMsWUFBWSxFQUFFO0FBQUEsTUFDaEQ7QUFBQSxNQUNBO0FBQUEsUUFDQyxPQUFPLENBQUMsZ0RBQWdEO0FBQUEsUUFDeEQsVUFBVSxFQUFFLFlBQVksU0FBUyxjQUFjLEVBQUU7QUFBQSxNQUNsRDtBQUFBLE1BQ0E7QUFBQSxRQUNDLE9BQU87QUFBQSxVQUNOO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsUUFDRDtBQUFBLFFBQ0EsVUFBVSxFQUFFLFlBQVksU0FBUyxlQUFlLEVBQUU7QUFBQSxNQUNuRDtBQUFBLE1BQ0E7QUFBQSxRQUNDLE9BQU87QUFBQSxVQUNOO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxRQUNEO0FBQUEsUUFDQSxVQUFVLEVBQUUsWUFBWSxTQUFTLGdCQUFnQixFQUFFO0FBQUEsTUFDcEQ7QUFBQSxNQUNBO0FBQUEsUUFDQyxPQUFPO0FBQUEsVUFDTjtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsUUFDRDtBQUFBLFFBQ0EsVUFBVSxFQUFFLFlBQVksU0FBUyxlQUFlLEVBQUU7QUFBQSxNQUNuRDtBQUFBLE1BQ0E7QUFBQSxRQUNDLE9BQU8sQ0FBQyxrQkFBa0IsZ0NBQWdDO0FBQUEsUUFDMUQsVUFBVSxFQUFFLFlBQVksU0FBUyxlQUFlLEVBQUU7QUFBQSxNQUNuRDtBQUFBLElBQ0Q7QUFBQSxFQUNEO0FBQUEsRUFDQSxJQUFJLENBQUM7QUFBQSxJQUFXLE1BQU0sY0FBYyxNQUFNLGFBQWEsSUFBSSxDQUFDLGVBQWU7QUFBQSxNQUMxRSxJQUFJLFdBQVcsVUFBVTtBQUFBLFFBQVcsT0FBTyxXQUFXLFNBQVM7QUFBQSxNQUMvRCxPQUFPO0FBQUEsS0FDUDtBQUFBLEVBQ0QsT0FBTztBQUFBOyIsCiAgImRlYnVnSWQiOiAiREY1QjEzMDdDQTkxNUNDODY0NzU2RTIxNjQ3NTZFMjEiLAogICJuYW1lcyI6IFtdCn0=
