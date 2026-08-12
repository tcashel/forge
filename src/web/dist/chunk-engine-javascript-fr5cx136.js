import"./chunk-main-g8wf8be2.js";

// node_modules/@shikijs/engine-javascript/dist/scanner-DW9tqVID.mjs
var MAX = 4294967295;
var JavaScriptScanner = class {
  patterns;
  options;
  regexps;
  constructor(patterns, options = {}) {
    this.patterns = patterns;
    this.options = options;
    const { forgiving = false, cache, regexConstructor } = options;
    if (!regexConstructor)
      throw new Error("Option `regexConstructor` is not provided");
    this.regexps = patterns.map((p) => {
      if (typeof p !== "string")
        return p;
      const cached = cache?.get(p);
      if (cached) {
        if (cached instanceof RegExp)
          return cached;
        if (forgiving)
          return null;
        throw cached;
      }
      try {
        const regex = regexConstructor(p);
        cache?.set(p, regex);
        return regex;
      } catch (e) {
        cache?.set(p, e);
        if (forgiving)
          return null;
        throw e;
      }
    });
  }
  findNextMatchSync(string, startPosition, _options) {
    const str = typeof string === "string" ? string : string.content;
    const pending = [];
    function toResult(index, match, offset = 0) {
      return {
        index,
        captureIndices: match.indices.map((indice) => {
          if (indice == null)
            return {
              start: MAX,
              end: MAX,
              length: 0
            };
          return {
            start: indice[0] + offset,
            end: indice[1] + offset,
            length: indice[1] - indice[0]
          };
        })
      };
    }
    for (let i = 0;i < this.regexps.length; i++) {
      const regexp = this.regexps[i];
      if (!regexp)
        continue;
      try {
        regexp.lastIndex = startPosition;
        const match = regexp.exec(str);
        if (!match)
          continue;
        if (match.index === startPosition)
          return toResult(i, match, 0);
        pending.push([
          i,
          match,
          0
        ]);
      } catch (e) {
        if (this.options.forgiving)
          continue;
        throw e;
      }
    }
    if (pending.length) {
      const minIndex = Math.min(...pending.map((m) => m[1].index));
      for (const [i, match, offset] of pending)
        if (match.index === minIndex)
          return toResult(i, match, offset);
    }
    return null;
  }
};

// node_modules/oniguruma-parser/dist/utils.js
function r(e) {
  if ([...e].length !== 1)
    throw new Error(`Expected "${e}" to be a single code point`);
  return e.codePointAt(0);
}
function l(e, t, n) {
  return e.has(t) || e.set(t, n), e.get(t);
}
var i = new Set(["alnum", "alpha", "ascii", "blank", "cntrl", "digit", "graph", "lower", "print", "punct", "space", "upper", "word", "xdigit"]);
var o = String.raw;
function u(e, t) {
  if (e == null)
    throw new Error(t ?? "Value expected");
  return e;
}

// node_modules/oniguruma-parser/dist/tokenizer/tokenize.js
var m = o`\[\^?`;
var b = `c.? | C(?:-.?)?|${o`[pP]\{(?:\^?[-\x20_]*[A-Za-z][-\x20\w]*\})?`}|${o`x[89A-Fa-f]\p{AHex}(?:\\x[89A-Fa-f]\p{AHex})*`}|${o`u(?:\p{AHex}{4})? | x\{[^\}]*\}? | x\p{AHex}{0,2}`}|${o`o\{[^\}]*\}?`}|${o`\d{1,3}`}`;
var y = /[?*+][?+]?|\{(?:\d+(?:,\d*)?|,\d+)\}\??/;
var C = new RegExp(o`
  \\ (?:
    ${b}
    | [gk]<[^>]*>?
    | [gk]'[^']*'?
    | .
  )
  | \( (?:
    \? (?:
      [:=!>({]
      | <[=!]
      | <[^>]*>
      | '[^']*'
      | ~\|?
      | #(?:[^)\\]|\\.?)*
      | [^:)]*[:)]
    )?
    | \*[^\)]*\)?
  )?
  | (?:${y.source})+
  | ${m}
  | .
`.replace(/\s+/g, ""), "gsu");
var T = new RegExp(o`
  \\ (?:
    ${b}
    | .
  )
  | \[:(?:\^?\p{Alpha}+|\^):\]
  | ${m}
  | &&
  | .
`.replace(/\s+/g, ""), "gsu");
function M(e, n = {}) {
  const t = { flags: "", ...n, rules: { captureGroup: false, singleline: false, ...n.rules } };
  if (typeof e != "string")
    throw new Error("String expected as pattern");
  const o2 = Y(t.flags), s = [o2.extended], a = { captureGroup: t.rules.captureGroup, getCurrentModX() {
    return s.at(-1);
  }, numOpenGroups: 0, popModX() {
    s.pop();
  }, pushModX(u2) {
    s.push(u2);
  }, replaceCurrentModX(u2) {
    s[s.length - 1] = u2;
  }, singleline: t.rules.singleline };
  let r2 = [], i2;
  for (C.lastIndex = 0;i2 = C.exec(e); ) {
    const u2 = F(a, e, i2[0], C.lastIndex);
    u2.tokens ? r2.push(...u2.tokens) : u2.token && r2.push(u2.token), u2.lastIndex !== undefined && (C.lastIndex = u2.lastIndex);
  }
  const l2 = [];
  let c = 0;
  r2.filter((u2) => u2.type === "GroupOpen").forEach((u2) => {
    u2.kind === "capturing" ? u2.number = ++c : u2.raw === "(" && l2.push(u2);
  }), c || l2.forEach((u2, S) => {
    u2.kind = "capturing", u2.number = S + 1;
  });
  const g = c || l2.length;
  return { tokens: r2.map((u2) => u2.type === "EscapedNumber" ? ee(u2, g) : u2).flat(), flags: o2 };
}
function F(e, n, t, o2) {
  const [s, a] = t;
  if (t === "[" || t === "[^") {
    const r2 = K(n, t, o2);
    return { tokens: r2.tokens, lastIndex: r2.lastIndex };
  }
  if (s === "\\") {
    if ("AbBGyYzZ".includes(a))
      return { token: w(t, t) };
    if (/^\\g[<']/.test(t)) {
      if (!/^\\g(?:<[^>]+>|'[^']+')$/.test(t))
        throw new Error(`Invalid group name "${t}"`);
      return { token: R(t) };
    }
    if (/^\\k[<']/.test(t)) {
      if (!/^\\k(?:<[^>]+>|'[^']+')$/.test(t))
        throw new Error(`Invalid group name "${t}"`);
      return { token: A(t) };
    }
    if (a === "K")
      return { token: I("keep", t) };
    if (a === "N" || a === "R")
      return { token: k("newline", t, { negate: a === "N" }) };
    if (a === "O")
      return { token: k("any", t) };
    if (a === "X")
      return { token: k("text_segment", t) };
    const r2 = x(t, { inCharClass: false });
    return Array.isArray(r2) ? { tokens: r2 } : { token: r2 };
  }
  if (s === "(") {
    if (a === "*")
      return { token: j(t) };
    if (t === "(?{")
      throw new Error(`Unsupported callout "${t}"`);
    if (t.startsWith("(?#")) {
      if (n[o2] !== ")")
        throw new Error('Unclosed comment group "(?#"');
      return { lastIndex: o2 + 1 };
    }
    if (/^\(\?[-imx]+[:)]$/.test(t))
      return { token: L(t, e) };
    if (e.pushModX(e.getCurrentModX()), e.numOpenGroups++, t === "(" && !e.captureGroup || t === "(?:")
      return { token: f("group", t) };
    if (t === "(?>")
      return { token: f("atomic", t) };
    if (t === "(?=" || t === "(?!" || t === "(?<=" || t === "(?<!")
      return { token: f(t[2] === "<" ? "lookbehind" : "lookahead", t, { negate: t.endsWith("!") }) };
    if (t === "(" && e.captureGroup || t.startsWith("(?<") && t.endsWith(">") || t.startsWith("(?'") && t.endsWith("'"))
      return { token: f("capturing", t, { ...t !== "(" && { name: t.slice(3, -1) } }) };
    if (t.startsWith("(?~")) {
      if (t === "(?~|")
        throw new Error(`Unsupported absence function kind "${t}"`);
      return { token: f("absence_repeater", t) };
    }
    throw t === "(?(" ? new Error(`Unsupported conditional "${t}"`) : new Error(`Invalid or unsupported group option "${t}"`);
  }
  if (t === ")") {
    if (e.popModX(), e.numOpenGroups--, e.numOpenGroups < 0)
      throw new Error('Unmatched ")"');
    return { token: Q(t) };
  }
  if (e.getCurrentModX()) {
    if (t === "#") {
      const r2 = n.indexOf(`
`, o2);
      return { lastIndex: r2 === -1 ? n.length : r2 };
    }
    if (/^\s$/.test(t)) {
      const r2 = /\s+/y;
      return r2.lastIndex = o2, { lastIndex: r2.exec(n) ? r2.lastIndex : o2 };
    }
  }
  if (t === ".")
    return { token: k("dot", t) };
  if (t === "^" || t === "$") {
    const r2 = e.singleline ? { "^": o`\A`, $: o`\Z` }[t] : t;
    return { token: w(r2, t) };
  }
  return t === "|" ? { token: P(t) } : y.test(t) ? { tokens: te(t) } : { token: d(r(t), t) };
}
function K(e, n, t) {
  const o2 = [E(n[1] === "^", n)];
  let s = 1, a;
  for (T.lastIndex = t;a = T.exec(e); ) {
    const r2 = a[0];
    if (r2[0] === "[" && r2[1] !== ":")
      s++, o2.push(E(r2[1] === "^", r2));
    else if (r2 === "]") {
      if (o2.at(-1).type === "CharacterClassOpen")
        o2.push(d(93, r2));
      else if (s--, o2.push(z(r2)), !s)
        break;
    } else {
      const i2 = X(r2);
      Array.isArray(i2) ? o2.push(...i2) : o2.push(i2);
    }
  }
  return { tokens: o2, lastIndex: T.lastIndex || e.length };
}
function X(e) {
  if (e[0] === "\\")
    return x(e, { inCharClass: true });
  if (e[0] === "[") {
    const n = /\[:(?<negate>\^?)(?<name>[a-z]+):\]/.exec(e);
    if (!n || !i.has(n.groups.name))
      throw new Error(`Invalid POSIX class "${e}"`);
    return k("posix", e, { value: n.groups.name, negate: !!n.groups.negate });
  }
  return e === "-" ? U(e) : e === "&&" ? H(e) : d(r(e), e);
}
function x(e, { inCharClass: n }) {
  const t = e[1];
  if (t === "c" || t === "C")
    return Z(e);
  if ("dDhHsSwW".includes(t))
    return q(e);
  if (e.startsWith(o`\o{`))
    throw new Error(`Incomplete, invalid, or unsupported octal code point "${e}"`);
  if (/^\\[pP]\{/.test(e)) {
    if (e.length === 3)
      throw new Error(`Incomplete or invalid Unicode property "${e}"`);
    return V(e);
  }
  if (/^\\x[89A-Fa-f]\p{AHex}/u.test(e))
    try {
      const o2 = e.split(/\\x/).slice(1).map((i2) => parseInt(i2, 16)), s = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true }).decode(new Uint8Array(o2)), a = new TextEncoder;
      return [...s].map((i2) => {
        const l2 = [...a.encode(i2)].map((c) => `\\x${c.toString(16)}`).join("");
        return d(r(i2), l2);
      });
    } catch {
      throw new Error(`Multibyte code "${e}" incomplete or invalid in Oniguruma`);
    }
  if (t === "u" || t === "x")
    return d(J(e), e);
  if ($.has(t))
    return d($.get(t), e);
  if (/\d/.test(t))
    return W(n, e);
  if (e === "\\")
    throw new Error(o`Incomplete escape "\"`);
  if (t === "M")
    throw new Error(`Unsupported meta "${e}"`);
  if ([...e].length === 2)
    return d(e.codePointAt(1), e);
  throw new Error(`Unexpected escape "${e}"`);
}
function P(e) {
  return { type: "Alternator", raw: e };
}
function w(e, n) {
  return { type: "Assertion", kind: e, raw: n };
}
function A(e) {
  return { type: "Backreference", raw: e };
}
function d(e, n) {
  return { type: "Character", value: e, raw: n };
}
function z(e) {
  return { type: "CharacterClassClose", raw: e };
}
function U(e) {
  return { type: "CharacterClassHyphen", raw: e };
}
function H(e) {
  return { type: "CharacterClassIntersector", raw: e };
}
function E(e, n) {
  return { type: "CharacterClassOpen", negate: e, raw: n };
}
function k(e, n, t = {}) {
  return { type: "CharacterSet", kind: e, ...t, raw: n };
}
function I(e, n, t = {}) {
  return e === "keep" ? { type: "Directive", kind: e, raw: n } : { type: "Directive", kind: e, flags: u(t.flags), raw: n };
}
function W(e, n) {
  return { type: "EscapedNumber", inCharClass: e, raw: n };
}
function Q(e) {
  return { type: "GroupClose", raw: e };
}
function f(e, n, t = {}) {
  return { type: "GroupOpen", kind: e, ...t, raw: n };
}
function D(e, n, t, o2) {
  return { type: "NamedCallout", kind: e, tag: n, arguments: t, raw: o2 };
}
function _(e, n, t, o2) {
  return { type: "Quantifier", kind: e, min: n, max: t, raw: o2 };
}
function R(e) {
  return { type: "Subroutine", raw: e };
}
var B = new Set(["COUNT", "CMP", "ERROR", "FAIL", "MAX", "MISMATCH", "SKIP", "TOTAL_COUNT"]);
var $ = new Map([["a", 7], ["b", 8], ["e", 27], ["f", 12], ["n", 10], ["r", 13], ["t", 9], ["v", 11]]);
function Z(e) {
  const n = e[1] === "c" ? e[2] : e[3];
  if (!n || !/[A-Za-z]/.test(n))
    throw new Error(`Unsupported control character "${e}"`);
  return d(r(n.toUpperCase()) - 64, e);
}
function L(e, n) {
  let { on: t, off: o2 } = /^\(\?(?<on>[imx]*)(?:-(?<off>[-imx]*))?/.exec(e).groups;
  o2 ??= "";
  const s = (n.getCurrentModX() || t.includes("x")) && !o2.includes("x"), a = v(t), r2 = v(o2), i2 = {};
  if (a && (i2.enable = a), r2 && (i2.disable = r2), e.endsWith(")"))
    return n.replaceCurrentModX(s), I("flags", e, { flags: i2 });
  if (e.endsWith(":"))
    return n.pushModX(s), n.numOpenGroups++, f("group", e, { ...(a || r2) && { flags: i2 } });
  throw new Error(`Unexpected flag modifier "${e}"`);
}
function j(e) {
  const n = /\(\*(?<name>[A-Za-z_]\w*)?(?:\[(?<tag>(?:[A-Za-z_]\w*)?)\])?(?:\{(?<args>[^}]*)\})?\)/.exec(e);
  if (!n)
    throw new Error(`Incomplete or invalid named callout "${e}"`);
  const { name: t, tag: o2, args: s } = n.groups;
  if (!t)
    throw new Error(`Invalid named callout "${e}"`);
  if (o2 === "")
    throw new Error(`Named callout tag with empty value not allowed "${e}"`);
  const a = s ? s.split(",").filter((g) => g !== "").map((g) => /^[+-]?\d+$/.test(g) ? +g : g) : [], [r2, i2, l2] = a, c = B.has(t) ? t.toLowerCase() : "custom";
  switch (c) {
    case "fail":
    case "mismatch":
    case "skip":
      if (a.length > 0)
        throw new Error(`Named callout arguments not allowed "${a}"`);
      break;
    case "error":
      if (a.length > 1)
        throw new Error(`Named callout allows only one argument "${a}"`);
      if (typeof r2 == "string")
        throw new Error(`Named callout argument must be a number "${r2}"`);
      break;
    case "max":
      if (!a.length || a.length > 2)
        throw new Error(`Named callout must have one or two arguments "${a}"`);
      if (typeof r2 == "string" && !/^[A-Za-z_]\w*$/.test(r2))
        throw new Error(`Named callout argument one must be a tag or number "${r2}"`);
      if (a.length === 2 && (typeof i2 == "number" || !/^[<>X]$/.test(i2)))
        throw new Error(`Named callout optional argument two must be '<', '>', or 'X' "${i2}"`);
      break;
    case "count":
    case "total_count":
      if (a.length > 1)
        throw new Error(`Named callout allows only one argument "${a}"`);
      if (a.length === 1 && (typeof r2 == "number" || !/^[<>X]$/.test(r2)))
        throw new Error(`Named callout optional argument must be '<', '>', or 'X' "${r2}"`);
      break;
    case "cmp":
      if (a.length !== 3)
        throw new Error(`Named callout must have three arguments "${a}"`);
      if (typeof r2 == "string" && !/^[A-Za-z_]\w*$/.test(r2))
        throw new Error(`Named callout argument one must be a tag or number "${r2}"`);
      if (typeof i2 == "number" || !/^(?:[<>!=]=|[<>])$/.test(i2))
        throw new Error(`Named callout argument two must be '==', '!=', '>', '<', '>=', or '<=' "${i2}"`);
      if (typeof l2 == "string" && !/^[A-Za-z_]\w*$/.test(l2))
        throw new Error(`Named callout argument three must be a tag or number "${l2}"`);
      break;
    case "custom":
      throw new Error(`Undefined callout name "${t}"`);
    default:
      throw new Error(`Unexpected named callout kind "${c}"`);
  }
  return D(c, o2 ?? null, s?.split(",") ?? null, e);
}
function O(e) {
  let n = null, t, o2;
  if (e[0] === "{") {
    const { minStr: s, maxStr: a } = /^\{(?<minStr>\d*)(?:,(?<maxStr>\d*))?/.exec(e).groups, r2 = 1e5;
    if (+s > r2 || a && +a > r2)
      throw new Error("Quantifier value unsupported in Oniguruma");
    if (t = +s, o2 = a === undefined ? +s : a === "" ? 1 / 0 : +a, t > o2 && (n = "possessive", [t, o2] = [o2, t]), e.endsWith("?")) {
      if (n === "possessive")
        throw new Error('Unsupported possessive interval quantifier chain with "?"');
      n = "lazy";
    } else
      n || (n = "greedy");
  } else
    t = e[0] === "+" ? 1 : 0, o2 = e[0] === "?" ? 1 : 1 / 0, n = e[1] === "+" ? "possessive" : e[1] === "?" ? "lazy" : "greedy";
  return _(n, t, o2, e);
}
function q(e) {
  const n = e[1].toLowerCase();
  return k({ d: "digit", h: "hex", s: "space", w: "word" }[n], e, { negate: e[1] !== n });
}
function V(e) {
  const { p: n, neg: t, value: o2 } = /^\\(?<p>[pP])\{(?<neg>\^?)(?<value>[^}]+)/.exec(e).groups;
  return k("property", e, { value: o2, negate: n === "P" && !t || n === "p" && !!t });
}
function v(e) {
  const n = {};
  return e.includes("i") && (n.ignoreCase = true), e.includes("m") && (n.dotAll = true), e.includes("x") && (n.extended = true), Object.keys(n).length ? n : null;
}
function Y(e) {
  const n = { ignoreCase: false, dotAll: false, extended: false, digitIsAscii: false, posixIsAscii: false, spaceIsAscii: false, wordIsAscii: false, textSegmentMode: null };
  for (let t = 0;t < e.length; t++) {
    const o2 = e[t];
    if (!"imxDPSWy".includes(o2))
      throw new Error(`Invalid flag "${o2}"`);
    if (o2 === "y") {
      if (!/^y{[gw]}/.test(e.slice(t)))
        throw new Error('Invalid or unspecified flag "y" mode');
      n.textSegmentMode = e[t + 2] === "g" ? "grapheme" : "word", t += 3;
      continue;
    }
    n[{ i: "ignoreCase", m: "dotAll", x: "extended", D: "digitIsAscii", P: "posixIsAscii", S: "spaceIsAscii", W: "wordIsAscii" }[o2]] = true;
  }
  return n;
}
function J(e) {
  if (/^(?:\\u(?!\p{AHex}{4})|\\x(?!\p{AHex}{1,2}|\{\p{AHex}{1,8}\}))/u.test(e))
    throw new Error(`Incomplete or invalid escape "${e}"`);
  const n = e[2] === "{" ? /^\\x\{\s*(?<hex>\p{AHex}+)/u.exec(e).groups.hex : e.slice(2);
  return parseInt(n, 16);
}
function ee(e, n) {
  const { raw: t, inCharClass: o2 } = e, s = t.slice(1);
  if (!o2 && (s !== "0" && s.length === 1 || s[0] !== "0" && +s <= n))
    return [A(t)];
  const a = [], r2 = s.match(/^[0-7]+|\d/g);
  for (let i2 = 0;i2 < r2.length; i2++) {
    const l2 = r2[i2];
    let c;
    if (i2 === 0 && l2 !== "8" && l2 !== "9") {
      if (c = parseInt(l2, 8), c > 127)
        throw new Error(o`Octal encoded byte above 177 unsupported "${t}"`);
    } else
      c = r(l2);
    a.push(d(c, (i2 === 0 ? "\\" : "") + l2));
  }
  return a;
}
function te(e) {
  const n = [], t = new RegExp(y, "gy");
  let o2;
  for (;o2 = t.exec(e); ) {
    const s = o2[0];
    if (s[0] === "{") {
      const a = /^\{(?<min>\d+),(?<max>\d+)\}\??$/.exec(s);
      if (a) {
        const { min: r2, max: i2 } = a.groups;
        if (+r2 > +i2 && s.endsWith("?")) {
          t.lastIndex--, n.push(O(s.slice(0, -1)));
          continue;
        }
      }
    }
    n.push(O(s));
  }
  return n;
}

// node_modules/oniguruma-parser/dist/parser/node-utils.js
function o2(e, t) {
  if (!Array.isArray(e.body))
    throw new Error("Expected node with body array");
  if (e.body.length !== 1)
    return false;
  const r2 = e.body[0];
  return !t || Object.keys(t).every((n) => t[n] === r2[n]);
}
var i2 = new Set(["AbsenceFunction", "CapturingGroup", "Group", "LookaroundAssertion", "Regex"]);
function s(e) {
  return y2.has(e.type);
}
var y2 = new Set(["AbsenceFunction", "Backreference", "CapturingGroup", "Character", "CharacterClass", "CharacterSet", "Group", "Quantifier", "Subroutine"]);

// node_modules/oniguruma-parser/dist/parser/parse.js
function J2(e, r2 = {}) {
  const n = { flags: "", normalizeUnknownPropertyNames: false, skipBackrefValidation: false, skipLookbehindValidation: false, skipPropertyNameValidation: false, unicodePropertyMap: null, ...r2, rules: { captureGroup: false, singleline: false, ...r2.rules } }, o3 = M(e, { flags: n.flags, rules: { captureGroup: n.rules.captureGroup, singleline: n.rules.singleline } }), i3 = (p, N) => {
    const u2 = o3.tokens[t.nextIndex];
    switch (t.parent = p, t.nextIndex++, u2.type) {
      case "Alternator":
        return b2();
      case "Assertion":
        return W2(u2);
      case "Backreference":
        return X2(u2, t);
      case "Character":
        return m2(u2.value, { useLastValid: !!N.isCheckingRangeEnd });
      case "CharacterClassHyphen":
        return ee2(u2, t, N);
      case "CharacterClassOpen":
        return re(u2, t, N);
      case "CharacterSet":
        return ne(u2, t);
      case "Directive":
        return I2(u2.kind, { flags: u2.flags });
      case "GroupOpen":
        return te2(u2, t, N);
      case "NamedCallout":
        return U2(u2.kind, u2.tag, u2.arguments);
      case "Quantifier":
        return oe(u2, t);
      case "Subroutine":
        return ae(u2, t);
      default:
        throw new Error(`Unexpected token type "${u2.type}"`);
    }
  }, t = { capturingGroups: [], hasNumberedRef: false, namedGroupsByName: new Map, nextIndex: 0, normalizeUnknownPropertyNames: n.normalizeUnknownPropertyNames, parent: null, skipBackrefValidation: n.skipBackrefValidation, skipLookbehindValidation: n.skipLookbehindValidation, skipPropertyNameValidation: n.skipPropertyNameValidation, subroutines: [], tokens: o3.tokens, unicodePropertyMap: n.unicodePropertyMap, walk: i3 }, d2 = B2(T2(o3.flags));
  let s2 = d2.body[0];
  for (;t.nextIndex < o3.tokens.length; ) {
    const p = i3(s2, {});
    p.type === "Alternative" ? (d2.body.push(p), s2 = p) : s2.body.push(p);
  }
  const { capturingGroups: a2, hasNumberedRef: l2, namedGroupsByName: c, subroutines: f2 } = t;
  if (l2 && c.size && !n.rules.captureGroup)
    throw new Error("Numbered backref/subroutine not allowed when using named capture");
  for (const { ref: p } of f2)
    if (typeof p == "number") {
      if (p > a2.length)
        throw new Error("Subroutine uses a group number that's not defined");
      p && (a2[p - 1].isSubroutined = true);
    } else if (c.has(p)) {
      if (c.get(p).length > 1)
        throw new Error(o`Subroutine uses a duplicate group name "\g<${p}>"`);
      c.get(p)[0].isSubroutined = true;
    } else
      throw new Error(o`Subroutine uses a group name that's not defined "\g<${p}>"`);
  return d2;
}
function W2({ kind: e }) {
  return F2(u({ "^": "line_start", $: "line_end", "\\A": "string_start", "\\b": "word_boundary", "\\B": "word_boundary", "\\G": "search_start", "\\y": "text_segment_boundary", "\\Y": "text_segment_boundary", "\\z": "string_end", "\\Z": "string_end_newline" }[e], `Unexpected assertion kind "${e}"`), { negate: e === o`\B` || e === o`\Y` });
}
function X2({ raw: e }, r2) {
  const n = /^\\k[<']/.test(e), o3 = n ? e.slice(3, -1) : e.slice(1), i3 = (t, d2 = false) => {
    const s2 = r2.capturingGroups.length;
    let a2 = false;
    if (t > s2)
      if (r2.skipBackrefValidation)
        a2 = true;
      else
        throw new Error(`Not enough capturing groups defined to the left "${e}"`);
    return r2.hasNumberedRef = true, k2(d2 ? s2 + 1 - t : t, { orphan: a2 });
  };
  if (n) {
    const t = /^(?<sign>-?)0*(?<num>[1-9]\d*)$/.exec(o3);
    if (t)
      return i3(+t.groups.num, !!t.groups.sign);
    if (/[-+]/.test(o3))
      throw new Error(`Invalid backref name "${e}"`);
    if (!r2.namedGroupsByName.has(o3))
      throw new Error(`Group name not defined to the left "${e}"`);
    return k2(o3);
  }
  return i3(+o3);
}
function ee2(e, r2, n) {
  const { tokens: o3, walk: i3 } = r2, t = r2.parent, d2 = t.body.at(-1), s2 = o3[r2.nextIndex];
  if (!n.isCheckingRangeEnd && d2 && d2.type !== "CharacterClass" && d2.type !== "CharacterClassRange" && s2 && s2.type !== "CharacterClassOpen" && s2.type !== "CharacterClassClose" && s2.type !== "CharacterClassIntersector") {
    const a2 = i3(t, { ...n, isCheckingRangeEnd: true });
    if (d2.type === "Character" && a2.type === "Character")
      return t.body.pop(), L2(d2, a2);
    throw new Error("Invalid character class range");
  }
  return m2(r("-"));
}
function re({ negate: e }, r2, n) {
  const { tokens: o3, walk: i3 } = r2, t = [C2()], d2 = o3[r2.nextIndex];
  let s2 = z2(d2);
  for (;s2.type !== "CharacterClassClose"; ) {
    if (s2.type === "CharacterClassIntersector")
      t.push(C2()), r2.nextIndex++;
    else {
      const l2 = t.at(-1);
      l2.body.push(i3(l2, n));
    }
    s2 = z2(o3[r2.nextIndex], d2);
  }
  const a2 = C2({ negate: e });
  return t.length === 1 ? a2.body = t[0].body : (a2.kind = "intersection", a2.body = t.map((l2) => l2.body.length === 1 ? l2.body[0] : l2)), r2.nextIndex++, a2;
}
function ne({ kind: e, negate: r2, value: n }, o3) {
  const { normalizeUnknownPropertyNames: i3, skipPropertyNameValidation: t, unicodePropertyMap: d2 } = o3;
  if (e === "property") {
    const s2 = w2(n);
    if (i.has(s2) && !d2?.has(s2))
      e = "posix", n = s2;
    else
      return Q2(n, { negate: r2, normalizeUnknownPropertyNames: i3, skipPropertyNameValidation: t, unicodePropertyMap: d2 });
  }
  return e === "posix" ? R2(n, { negate: r2 }) : E2(e, { negate: r2 });
}
function te2(e, r2, n) {
  const { tokens: o3, capturingGroups: i3, namedGroupsByName: t, skipLookbehindValidation: d2, walk: s2 } = r2, a2 = ie(e), l2 = a2.type === "AbsenceFunction", c = $2(a2), f2 = c && a2.negate;
  if (a2.type === "CapturingGroup" && (i3.push(a2), a2.name && l(t, a2.name, []).push(a2)), l2 && n.isInAbsenceFunction)
    throw new Error("Nested absence function not supported by Oniguruma");
  let p = D2(o3[r2.nextIndex]);
  for (;p.type !== "GroupClose"; ) {
    if (p.type === "Alternator")
      a2.body.push(b2()), r2.nextIndex++;
    else {
      const N = a2.body.at(-1), u2 = s2(N, { ...n, isInAbsenceFunction: n.isInAbsenceFunction || l2, isInLookbehind: n.isInLookbehind || c, isInNegLookbehind: n.isInNegLookbehind || f2 });
      if (N.body.push(u2), (c || n.isInLookbehind) && !d2) {
        const v2 = "Lookbehind includes a pattern not allowed by Oniguruma";
        if (f2 || n.isInNegLookbehind) {
          if (M2(u2) || u2.type === "CapturingGroup")
            throw new Error(v2);
        } else if (M2(u2) || $2(u2) && u2.negate)
          throw new Error(v2);
      }
    }
    p = D2(o3[r2.nextIndex]);
  }
  return r2.nextIndex++, a2;
}
function oe({ kind: e, min: r2, max: n }, o3) {
  const i3 = o3.parent, t = i3.body.at(-1);
  if (!t || !s(t))
    throw new Error("Quantifier requires a repeatable token");
  const d2 = _2(e, r2, n, t);
  return i3.body.pop(), d2;
}
function ae({ raw: e }, r2) {
  const { capturingGroups: n, subroutines: o3 } = r2;
  let i3 = e.slice(3, -1);
  const t = /^(?<sign>[-+]?)0*(?<num>[1-9]\d*)$/.exec(i3);
  if (t) {
    const s2 = +t.groups.num, a2 = n.length;
    if (r2.hasNumberedRef = true, i3 = { "": s2, "+": a2 + s2, "-": a2 + 1 - s2 }[t.groups.sign], i3 < 1)
      throw new Error("Invalid subroutine number");
  } else
    i3 === "0" && (i3 = 0);
  const d2 = O2(i3);
  return o3.push(d2), d2;
}
function G(e, r2) {
  if (e !== "repeater")
    throw new Error(`Unexpected absence function kind "${e}"`);
  return { type: "AbsenceFunction", kind: e, body: h(r2?.body) };
}
function b2(e) {
  return { type: "Alternative", body: V2(e?.body) };
}
function F2(e, r2) {
  const n = { type: "Assertion", kind: e };
  return (e === "word_boundary" || e === "text_segment_boundary") && (n.negate = !!r2?.negate), n;
}
function k2(e, r2) {
  const n = !!r2?.orphan;
  return { type: "Backreference", ref: e, ...n && { orphan: n } };
}
function P2(e, r2) {
  const n = { name: undefined, isSubroutined: false, ...r2 };
  if (n.name !== undefined && !se(n.name))
    throw new Error(`Group name "${n.name}" invalid in Oniguruma`);
  return { type: "CapturingGroup", number: e, ...n.name && { name: n.name }, ...n.isSubroutined && { isSubroutined: n.isSubroutined }, body: h(r2?.body) };
}
function m2(e, r2) {
  const n = { useLastValid: false, ...r2 };
  if (e > 1114111) {
    const o3 = e.toString(16);
    if (n.useLastValid)
      e = 1114111;
    else
      throw e > 1310719 ? new Error(`Invalid code point out of range "\\x{${o3}}"`) : new Error(`Invalid code point out of range in JS "\\x{${o3}}"`);
  }
  return { type: "Character", value: e };
}
function C2(e) {
  const r2 = { kind: "union", negate: false, ...e };
  return { type: "CharacterClass", kind: r2.kind, negate: r2.negate, body: V2(e?.body) };
}
function L2(e, r2) {
  if (r2.value < e.value)
    throw new Error("Character class range out of order");
  return { type: "CharacterClassRange", min: e, max: r2 };
}
function E2(e, r2) {
  const n = !!r2?.negate, o3 = { type: "CharacterSet", kind: e };
  return (e === "digit" || e === "hex" || e === "newline" || e === "space" || e === "word") && (o3.negate = n), (e === "text_segment" || e === "newline" && !n) && (o3.variableLength = true), o3;
}
function I2(e, r2 = {}) {
  if (e === "keep")
    return { type: "Directive", kind: e };
  if (e === "flags")
    return { type: "Directive", kind: e, flags: u(r2.flags) };
  throw new Error(`Unexpected directive kind "${e}"`);
}
function T2(e) {
  return { type: "Flags", ...e };
}
function A2(e) {
  const r2 = e?.atomic, n = e?.flags;
  if (r2 && n)
    throw new Error("Atomic group cannot have flags");
  return { type: "Group", ...r2 && { atomic: r2 }, ...n && { flags: n }, body: h(e?.body) };
}
function K2(e) {
  const r2 = { behind: false, negate: false, ...e };
  return { type: "LookaroundAssertion", kind: r2.behind ? "lookbehind" : "lookahead", negate: r2.negate, body: h(e?.body) };
}
function U2(e, r2, n) {
  return { type: "NamedCallout", kind: e, tag: r2, arguments: n };
}
function R2(e, r2) {
  const n = !!r2?.negate;
  if (!i.has(e))
    throw new Error(`Invalid POSIX class "${e}"`);
  return { type: "CharacterSet", kind: "posix", value: e, negate: n };
}
function _2(e, r2, n, o3) {
  if (r2 > n)
    throw new Error("Invalid reversed quantifier range");
  return { type: "Quantifier", kind: e, min: r2, max: n, body: o3 };
}
function B2(e, r2) {
  return { type: "Regex", body: h(r2?.body), flags: e };
}
function O2(e) {
  return { type: "Subroutine", ref: e };
}
function Q2(e, r2) {
  const n = { negate: false, normalizeUnknownPropertyNames: false, skipPropertyNameValidation: false, unicodePropertyMap: null, ...r2 };
  let o3 = n.unicodePropertyMap?.get(w2(e));
  if (!o3) {
    if (n.normalizeUnknownPropertyNames)
      o3 = de(e);
    else if (n.unicodePropertyMap && !n.skipPropertyNameValidation)
      throw new Error(o`Invalid Unicode property "\p{${e}}"`);
  }
  return { type: "CharacterSet", kind: "property", value: o3 ?? e, negate: n.negate };
}
function ie({ flags: e, kind: r2, name: n, negate: o3, number: i3 }) {
  switch (r2) {
    case "absence_repeater":
      return G("repeater");
    case "atomic":
      return A2({ atomic: true });
    case "capturing":
      return P2(i3, { name: n });
    case "group":
      return A2({ flags: e });
    case "lookahead":
    case "lookbehind":
      return K2({ behind: r2 === "lookbehind", negate: o3 });
    default:
      throw new Error(`Unexpected group kind "${r2}"`);
  }
}
function h(e) {
  if (e === undefined)
    e = [b2()];
  else if (!Array.isArray(e) || !e.length || !e.every((r2) => r2.type === "Alternative"))
    throw new Error("Invalid body; expected array of one or more Alternative nodes");
  return e;
}
function V2(e) {
  if (e === undefined)
    e = [];
  else if (!Array.isArray(e) || !e.every((r2) => !!r2.type))
    throw new Error("Invalid body; expected array of nodes");
  return e;
}
function M2(e) {
  return e.type === "LookaroundAssertion" && e.kind === "lookahead";
}
function $2(e) {
  return e.type === "LookaroundAssertion" && e.kind === "lookbehind";
}
function se(e) {
  return /^[\p{Alpha}\p{Pc}][^)]*$/u.test(e);
}
function de(e) {
  return e.trim().replace(/[- _]+/g, "_").replace(/[A-Z][a-z]+(?=[A-Z])/g, "$&_").replace(/[A-Za-z]+/g, (r2) => r2[0].toUpperCase() + r2.slice(1).toLowerCase());
}
function w2(e) {
  return e.replace(/[- _]+/g, "").toLowerCase();
}
function z2(e, r2) {
  const n = r2;
  return u(e, `Unclosed character class${n?.type === "Character" && n.value === 93 && n.raw === "]" ? ' (started with "]")' : ""}`);
}
function D2(e) {
  return u(e, "Unclosed group");
}

// node_modules/oniguruma-parser/dist/traverser/traverse.js
function S(a2, v2, N = null) {
  function b3(e, s2) {
    for (let t = 0;t < e.length; t++) {
      const r2 = n(e[t], s2, t, e);
      t = Math.max(-1, t + r2);
    }
  }
  function n(e, s2 = null, t = null, r2 = null) {
    let i3 = 0, c = false;
    const d2 = { node: e, parent: s2, key: t, container: r2, root: a2, remove() {
      x2(r2).splice(Math.max(0, l2(t) + i3), 1), i3--, c = true;
    }, removeAllNextSiblings() {
      return x2(r2).splice(l2(t) + 1);
    }, removeAllPrevSiblings() {
      const o3 = l2(t) + i3;
      return i3 -= o3, x2(r2).splice(0, Math.max(0, o3));
    }, replaceWith(o3, m3 = {}) {
      const y3 = !!m3.traverse;
      r2 ? r2[Math.max(0, l2(t) + i3)] = o3 : u(s2, "Can't replace root node")[t] = o3, y3 && n(o3, s2, t, r2), c = true;
    }, replaceWithMultiple(o3, m3 = {}) {
      const y3 = !!m3.traverse;
      if (x2(r2).splice(Math.max(0, l2(t) + i3), 1, ...o3), i3 += o3.length - 1, y3) {
        let g = 0;
        for (let p = 0;p < o3.length; p++)
          g += n(o3[p], s2, l2(t) + p + g, r2);
      }
      c = true;
    }, skip() {
      c = true;
    } }, { type: f2 } = e, u2 = v2["*"], h2 = v2[f2], R3 = typeof u2 == "function" ? u2 : u2?.enter, P3 = typeof h2 == "function" ? h2 : h2?.enter;
    if (R3?.(d2, N), P3?.(d2, N), !c)
      switch (f2) {
        case "AbsenceFunction":
        case "Alternative":
        case "CapturingGroup":
        case "CharacterClass":
        case "Group":
        case "LookaroundAssertion":
          b3(e.body, e);
          break;
        case "Assertion":
        case "Backreference":
        case "Character":
        case "CharacterSet":
        case "Directive":
        case "Flags":
        case "NamedCallout":
        case "Subroutine":
          break;
        case "CharacterClassRange":
          n(e.min, e, "min"), n(e.max, e, "max");
          break;
        case "Quantifier":
          n(e.body, e, "body");
          break;
        case "Regex":
          b3(e.body, e), n(e.flags, e, "flags");
          break;
        default:
          throw new Error(`Unexpected node type "${f2}"`);
      }
    return h2?.exit?.(d2, N), u2?.exit?.(d2, N), i3;
  }
  return n(a2), a2;
}
function x2(a2) {
  if (!Array.isArray(a2))
    throw new Error("Container expected");
  return a2;
}
function l2(a2) {
  if (typeof a2 != "number")
    throw new Error("Numeric key expected");
  return a2;
}

// node_modules/regex/src/utils-internals.js
var noncapturingDelim = String.raw`\(\?(?:[:=!>A-Za-z\-]|<[=!]|\(DEFINE\))`;
function incrementIfAtLeast(arr, threshold) {
  for (let i3 = 0;i3 < arr.length; i3++) {
    if (arr[i3] >= threshold) {
      arr[i3]++;
    }
  }
}
function spliceStr(str, pos, oldValue, newValue) {
  return str.slice(0, pos) + newValue + str.slice(pos + oldValue.length);
}

// node_modules/regex-utilities/src/index.js
var Context = Object.freeze({
  DEFAULT: "DEFAULT",
  CHAR_CLASS: "CHAR_CLASS"
});
function replaceUnescaped(expression, needle, replacement, context) {
  const re2 = new RegExp(String.raw`${needle}|(?<$skip>\[\^?|\\?.)`, "gsu");
  const negated = [false];
  let numCharClassesOpen = 0;
  let result = "";
  for (const match of expression.matchAll(re2)) {
    const { 0: m3, groups: { $skip } } = match;
    if (!$skip && (!context || context === Context.DEFAULT === !numCharClassesOpen)) {
      if (replacement instanceof Function) {
        result += replacement(match, {
          context: numCharClassesOpen ? Context.CHAR_CLASS : Context.DEFAULT,
          negated: negated[negated.length - 1]
        });
      } else {
        result += replacement;
      }
      continue;
    }
    if (m3[0] === "[") {
      numCharClassesOpen++;
      negated.push(m3[1] === "^");
    } else if (m3 === "]" && numCharClassesOpen) {
      numCharClassesOpen--;
      negated.pop();
    }
    result += m3;
  }
  return result;
}
function forEachUnescaped(expression, needle, callback, context) {
  replaceUnescaped(expression, needle, callback, context);
}
function execUnescaped(expression, needle, pos = 0, context) {
  if (!new RegExp(needle, "su").test(expression)) {
    return null;
  }
  const re2 = new RegExp(`${needle}|(?<$skip>\\\\?.)`, "gsu");
  re2.lastIndex = pos;
  let numCharClassesOpen = 0;
  let match;
  while (match = re2.exec(expression)) {
    const { 0: m3, groups: { $skip } } = match;
    if (!$skip && (!context || context === Context.DEFAULT === !numCharClassesOpen)) {
      return match;
    }
    if (m3 === "[") {
      numCharClassesOpen++;
    } else if (m3 === "]" && numCharClassesOpen) {
      numCharClassesOpen--;
    }
    if (re2.lastIndex == match.index) {
      re2.lastIndex++;
    }
  }
  return null;
}
function hasUnescaped(expression, needle, context) {
  return !!execUnescaped(expression, needle, 0, context);
}
function getGroupContents(expression, contentsStartPos) {
  const token = /\\?./gsu;
  token.lastIndex = contentsStartPos;
  let contentsEndPos = expression.length;
  let numCharClassesOpen = 0;
  let numGroupsOpen = 1;
  let match;
  while (match = token.exec(expression)) {
    const [m3] = match;
    if (m3 === "[") {
      numCharClassesOpen++;
    } else if (!numCharClassesOpen) {
      if (m3 === "(") {
        numGroupsOpen++;
      } else if (m3 === ")") {
        numGroupsOpen--;
        if (!numGroupsOpen) {
          contentsEndPos = match.index;
          break;
        }
      }
    } else if (m3 === "]") {
      numCharClassesOpen--;
    }
  }
  return expression.slice(contentsStartPos, contentsEndPos);
}

// node_modules/regex/src/atomic.js
var atomicPluginToken = new RegExp(String.raw`(?<noncapturingStart>${noncapturingDelim})|(?<capturingStart>\((?:\?<[^>]+>)?)|\\?.`, "gsu");
function atomic(expression, data) {
  const hiddenCaptures = data?.hiddenCaptures ?? [];
  let captureTransfers = data?.captureTransfers ?? new Map;
  if (!/\(\?>/.test(expression)) {
    return {
      pattern: expression,
      captureTransfers,
      hiddenCaptures
    };
  }
  const aGDelim = "(?>";
  const emulatedAGDelim = "(?:(?=(";
  const captureNumMap = [0];
  const addedHiddenCaptures = [];
  let numCapturesBeforeAG = 0;
  let numAGs = 0;
  let aGPos = NaN;
  let hasProcessedAG;
  do {
    hasProcessedAG = false;
    let numCharClassesOpen = 0;
    let numGroupsOpenInAG = 0;
    let inAG = false;
    let match;
    atomicPluginToken.lastIndex = Number.isNaN(aGPos) ? 0 : aGPos + emulatedAGDelim.length;
    while (match = atomicPluginToken.exec(expression)) {
      const { 0: m3, index, groups: { capturingStart, noncapturingStart } } = match;
      if (m3 === "[") {
        numCharClassesOpen++;
      } else if (!numCharClassesOpen) {
        if (m3 === aGDelim && !inAG) {
          aGPos = index;
          inAG = true;
        } else if (inAG && noncapturingStart) {
          numGroupsOpenInAG++;
        } else if (capturingStart) {
          if (inAG) {
            numGroupsOpenInAG++;
          } else {
            numCapturesBeforeAG++;
            captureNumMap.push(numCapturesBeforeAG + numAGs);
          }
        } else if (m3 === ")" && inAG) {
          if (!numGroupsOpenInAG) {
            numAGs++;
            const addedCaptureNum = numCapturesBeforeAG + numAGs;
            expression = `${expression.slice(0, aGPos)}${emulatedAGDelim}${expression.slice(aGPos + aGDelim.length, index)}))<$$${addedCaptureNum}>)${expression.slice(index + 1)}`;
            hasProcessedAG = true;
            addedHiddenCaptures.push(addedCaptureNum);
            incrementIfAtLeast(hiddenCaptures, addedCaptureNum);
            if (captureTransfers.size) {
              const newCaptureTransfers = new Map;
              captureTransfers.forEach((from, to) => {
                newCaptureTransfers.set(to >= addedCaptureNum ? to + 1 : to, from.map((f2) => f2 >= addedCaptureNum ? f2 + 1 : f2));
              });
              captureTransfers = newCaptureTransfers;
            }
            break;
          }
          numGroupsOpenInAG--;
        }
      } else if (m3 === "]") {
        numCharClassesOpen--;
      }
    }
  } while (hasProcessedAG);
  hiddenCaptures.push(...addedHiddenCaptures);
  expression = replaceUnescaped(expression, String.raw`\\(?<backrefNum>[1-9]\d*)|<\$\$(?<wrappedBackrefNum>\d+)>`, ({ 0: m3, groups: { backrefNum, wrappedBackrefNum } }) => {
    if (backrefNum) {
      const bNum = +backrefNum;
      if (bNum > captureNumMap.length - 1) {
        throw new Error(`Backref "${m3}" greater than number of captures`);
      }
      return `\\${captureNumMap[bNum]}`;
    }
    return `\\${wrappedBackrefNum}`;
  }, Context.DEFAULT);
  return {
    pattern: expression,
    captureTransfers,
    hiddenCaptures
  };
}
var baseQuantifier = String.raw`(?:[?*+]|\{\d+(?:,\d*)?\})`;
var possessivePluginToken = new RegExp(String.raw`
\\(?: \d+
  | c[A-Za-z]
  | [gk]<[^>]+>
  | [pPu]\{[^\}]+\}
  | u[A-Fa-f\d]{4}
  | x[A-Fa-f\d]{2}
  )
| \((?: \? (?: [:=!>]
  | <(?:[=!]|[^>]+>)
  | [A-Za-z\-]+:
  | \(DEFINE\)
  ))?
| (?<qBase>${baseQuantifier})(?<qMod>[?+]?)(?<invalidQ>[?*+\{]?)
| \\?.
`.replace(/\s+/g, ""), "gsu");
function possessive(expression) {
  if (!new RegExp(`${baseQuantifier}\\+`).test(expression)) {
    return {
      pattern: expression
    };
  }
  const openGroupIndices = [];
  let lastGroupIndex = null;
  let lastCharClassIndex = null;
  let lastToken = "";
  let numCharClassesOpen = 0;
  let match;
  possessivePluginToken.lastIndex = 0;
  while (match = possessivePluginToken.exec(expression)) {
    const { 0: m3, index, groups: { qBase, qMod, invalidQ } } = match;
    if (m3 === "[") {
      if (!numCharClassesOpen) {
        lastCharClassIndex = index;
      }
      numCharClassesOpen++;
    } else if (m3 === "]") {
      if (numCharClassesOpen) {
        numCharClassesOpen--;
      } else {
        lastCharClassIndex = null;
      }
    } else if (!numCharClassesOpen) {
      if (qMod === "+" && lastToken && !lastToken.startsWith("(")) {
        if (invalidQ) {
          throw new Error(`Invalid quantifier "${m3}"`);
        }
        let charsAdded = -1;
        if (/^\{\d+\}$/.test(qBase)) {
          expression = spliceStr(expression, index + qBase.length, qMod, "");
        } else {
          if (lastToken === ")" || lastToken === "]") {
            const nodeIndex = lastToken === ")" ? lastGroupIndex : lastCharClassIndex;
            if (nodeIndex === null) {
              throw new Error(`Invalid unmatched "${lastToken}"`);
            }
            expression = `${expression.slice(0, nodeIndex)}(?>${expression.slice(nodeIndex, index)}${qBase})${expression.slice(index + m3.length)}`;
          } else {
            expression = `${expression.slice(0, index - lastToken.length)}(?>${lastToken}${qBase})${expression.slice(index + m3.length)}`;
          }
          charsAdded += 4;
        }
        possessivePluginToken.lastIndex += charsAdded;
      } else if (m3[0] === "(") {
        openGroupIndices.push(index);
      } else if (m3 === ")") {
        lastGroupIndex = openGroupIndices.length ? openGroupIndices.pop() : null;
      }
    }
    lastToken = m3;
  }
  return {
    pattern: expression
  };
}
// node_modules/regex-recursion/src/index.js
var r2 = String.raw;
var gRToken = r2`\\g<(?<gRNameOrNum>[^>&]+)&R=(?<gRDepth>[^>]+)>`;
var recursiveToken = r2`\(\?R=(?<rDepth>[^\)]+)\)|${gRToken}`;
var namedCaptureDelim = r2`\(\?<(?![=!])(?<captureName>[^>]+)>`;
var captureDelim = r2`${namedCaptureDelim}|(?<unnamed>\()(?!\?)`;
var token = new RegExp(r2`${namedCaptureDelim}|${recursiveToken}|\(\?|\\?.`, "gsu");
var overlappingRecursionMsg = "Cannot use multiple overlapping recursions";
function recursion(pattern, data) {
  const { hiddenCaptures, mode } = {
    hiddenCaptures: [],
    mode: "plugin",
    ...data
  };
  let captureTransfers = data?.captureTransfers ?? new Map;
  if (!new RegExp(recursiveToken, "su").test(pattern)) {
    return {
      pattern,
      captureTransfers,
      hiddenCaptures
    };
  }
  if (mode === "plugin" && hasUnescaped(pattern, r2`\(\?\(DEFINE\)`, Context.DEFAULT)) {
    throw new Error("DEFINE groups cannot be used with recursion");
  }
  const addedHiddenCaptures = [];
  const hasNumberedBackref = hasUnescaped(pattern, r2`\\[1-9]`, Context.DEFAULT);
  const groupContentsStartPos = new Map;
  const openGroups = [];
  let hasRecursed = false;
  let numCharClassesOpen = 0;
  let numCapturesPassed = 0;
  let match;
  token.lastIndex = 0;
  while (match = token.exec(pattern)) {
    const { 0: m3, groups: { captureName, rDepth, gRNameOrNum, gRDepth } } = match;
    if (m3 === "[") {
      numCharClassesOpen++;
    } else if (!numCharClassesOpen) {
      if (rDepth) {
        assertMaxInBounds(rDepth);
        if (hasRecursed) {
          throw new Error(overlappingRecursionMsg);
        }
        if (hasNumberedBackref) {
          throw new Error(`${mode === "external" ? "Backrefs" : "Numbered backrefs"} cannot be used with global recursion`);
        }
        const left = pattern.slice(0, match.index);
        const right = pattern.slice(token.lastIndex);
        if (hasUnescaped(right, recursiveToken, Context.DEFAULT)) {
          throw new Error(overlappingRecursionMsg);
        }
        const reps = +rDepth - 1;
        pattern = makeRecursive(left, right, reps, false, hiddenCaptures, addedHiddenCaptures, numCapturesPassed);
        captureTransfers = mapCaptureTransfers(captureTransfers, left, reps, addedHiddenCaptures.length, 0, numCapturesPassed);
        break;
      } else if (gRNameOrNum) {
        assertMaxInBounds(gRDepth);
        let isWithinReffedGroup = false;
        for (const g of openGroups) {
          if (g.name === gRNameOrNum || g.num === +gRNameOrNum) {
            isWithinReffedGroup = true;
            if (g.hasRecursedWithin) {
              throw new Error(overlappingRecursionMsg);
            }
            break;
          }
        }
        if (!isWithinReffedGroup) {
          throw new Error(r2`Recursive \g cannot be used outside the referenced group "${mode === "external" ? gRNameOrNum : r2`\g<${gRNameOrNum}&R=${gRDepth}>`}"`);
        }
        const startPos = groupContentsStartPos.get(gRNameOrNum);
        const groupContents = getGroupContents(pattern, startPos);
        if (hasNumberedBackref && hasUnescaped(groupContents, r2`${namedCaptureDelim}|\((?!\?)`, Context.DEFAULT)) {
          throw new Error(`${mode === "external" ? "Backrefs" : "Numbered backrefs"} cannot be used with recursion of capturing groups`);
        }
        const groupContentsLeft = pattern.slice(startPos, match.index);
        const groupContentsRight = groupContents.slice(groupContentsLeft.length + m3.length);
        const numAddedHiddenCapturesPreExpansion = addedHiddenCaptures.length;
        const reps = +gRDepth - 1;
        const expansion = makeRecursive(groupContentsLeft, groupContentsRight, reps, true, hiddenCaptures, addedHiddenCaptures, numCapturesPassed);
        captureTransfers = mapCaptureTransfers(captureTransfers, groupContentsLeft, reps, addedHiddenCaptures.length - numAddedHiddenCapturesPreExpansion, numAddedHiddenCapturesPreExpansion, numCapturesPassed);
        const pre = pattern.slice(0, startPos);
        const post = pattern.slice(startPos + groupContents.length);
        pattern = `${pre}${expansion}${post}`;
        token.lastIndex += expansion.length - m3.length - groupContentsLeft.length - groupContentsRight.length;
        openGroups.forEach((g) => g.hasRecursedWithin = true);
        hasRecursed = true;
      } else if (captureName) {
        numCapturesPassed++;
        groupContentsStartPos.set(String(numCapturesPassed), token.lastIndex);
        groupContentsStartPos.set(captureName, token.lastIndex);
        openGroups.push({
          num: numCapturesPassed,
          name: captureName
        });
      } else if (m3[0] === "(") {
        const isUnnamedCapture = m3 === "(";
        if (isUnnamedCapture) {
          numCapturesPassed++;
          groupContentsStartPos.set(String(numCapturesPassed), token.lastIndex);
        }
        openGroups.push(isUnnamedCapture ? { num: numCapturesPassed } : {});
      } else if (m3 === ")") {
        openGroups.pop();
      }
    } else if (m3 === "]") {
      numCharClassesOpen--;
    }
  }
  hiddenCaptures.push(...addedHiddenCaptures);
  return {
    pattern,
    captureTransfers,
    hiddenCaptures
  };
}
function assertMaxInBounds(max) {
  const errMsg = `Max depth must be integer between 2 and 100; used ${max}`;
  if (!/^[1-9]\d*$/.test(max)) {
    throw new Error(errMsg);
  }
  max = +max;
  if (max < 2 || max > 100) {
    throw new Error(errMsg);
  }
}
function makeRecursive(left, right, reps, isSubpattern, hiddenCaptures, addedHiddenCaptures, numCapturesPassed) {
  const namesInRecursed = new Set;
  if (isSubpattern) {
    forEachUnescaped(left + right, namedCaptureDelim, ({ groups: { captureName } }) => {
      namesInRecursed.add(captureName);
    }, Context.DEFAULT);
  }
  const rest = [
    reps,
    isSubpattern ? namesInRecursed : null,
    hiddenCaptures,
    addedHiddenCaptures,
    numCapturesPassed
  ];
  return `${left}${repeatWithDepth(`(?:${left}`, "forward", ...rest)}(?:)${repeatWithDepth(`${right})`, "backward", ...rest)}${right}`;
}
function repeatWithDepth(pattern, direction, reps, namesInRecursed, hiddenCaptures, addedHiddenCaptures, numCapturesPassed) {
  const startNum = 2;
  const getDepthNum = (i3) => direction === "forward" ? i3 + startNum : reps - i3 + startNum - 1;
  let result = "";
  for (let i3 = 0;i3 < reps; i3++) {
    const depthNum = getDepthNum(i3);
    result += replaceUnescaped(pattern, r2`${captureDelim}|\\k<(?<backref>[^>]+)>`, ({ 0: m3, groups: { captureName, unnamed, backref } }) => {
      if (backref && namesInRecursed && !namesInRecursed.has(backref)) {
        return m3;
      }
      const suffix = `_$${depthNum}`;
      if (unnamed || captureName) {
        const addedCaptureNum = numCapturesPassed + addedHiddenCaptures.length + 1;
        addedHiddenCaptures.push(addedCaptureNum);
        incrementIfAtLeast2(hiddenCaptures, addedCaptureNum);
        return unnamed ? m3 : `(?<${captureName}${suffix}>`;
      }
      return r2`\k<${backref}${suffix}>`;
    }, Context.DEFAULT);
  }
  return result;
}
function incrementIfAtLeast2(arr, threshold) {
  for (let i3 = 0;i3 < arr.length; i3++) {
    if (arr[i3] >= threshold) {
      arr[i3]++;
    }
  }
}
function mapCaptureTransfers(captureTransfers, left, reps, numCapturesAddedInExpansion, numAddedHiddenCapturesPreExpansion, numCapturesPassed) {
  if (captureTransfers.size && numCapturesAddedInExpansion) {
    let numCapturesInLeft = 0;
    forEachUnescaped(left, captureDelim, () => numCapturesInLeft++, Context.DEFAULT);
    const recursionDelimCaptureNum = numCapturesPassed - numCapturesInLeft + numAddedHiddenCapturesPreExpansion;
    const newCaptureTransfers = new Map;
    captureTransfers.forEach((from, to) => {
      const numCapturesInRight = (numCapturesAddedInExpansion - numCapturesInLeft * reps) / reps;
      const numCapturesAddedInLeft = numCapturesInLeft * reps;
      const newTo = to > recursionDelimCaptureNum + numCapturesInLeft ? to + numCapturesAddedInExpansion : to;
      const newFrom = [];
      for (const f2 of from) {
        if (f2 <= recursionDelimCaptureNum) {
          newFrom.push(f2);
        } else if (f2 > recursionDelimCaptureNum + numCapturesInLeft + numCapturesInRight) {
          newFrom.push(f2 + numCapturesAddedInExpansion);
        } else if (f2 <= recursionDelimCaptureNum + numCapturesInLeft) {
          for (let i3 = 0;i3 <= reps; i3++) {
            newFrom.push(f2 + numCapturesInLeft * i3);
          }
        } else {
          for (let i3 = 0;i3 <= reps; i3++) {
            newFrom.push(f2 + numCapturesAddedInLeft + numCapturesInRight * i3);
          }
        }
      }
      newCaptureTransfers.set(newTo, newFrom);
    });
    return newCaptureTransfers;
  }
  return captureTransfers;
}

// node_modules/oniguruma-to-es/dist/esm/index.js
var cp = String.fromCodePoint;
var r3 = String.raw;
var envFlags = {};
var globalRegExp = globalThis.RegExp;
envFlags.flagGroups = (() => {
  try {
    new globalRegExp("(?i:)");
  } catch {
    return false;
  }
  return true;
})();
envFlags.unicodeSets = (() => {
  try {
    new globalRegExp("[[]]", "v");
  } catch {
    return false;
  }
  return true;
})();
envFlags.bugFlagVLiteralHyphenIsRange = envFlags.unicodeSets ? (() => {
  try {
    new globalRegExp(r3`[\d\-a]`, "v");
  } catch {
    return true;
  }
  return false;
})() : false;
envFlags.bugNestedClassIgnoresNegation = envFlags.unicodeSets && new globalRegExp("[[^a]]", "v").test("a");
function getNewCurrentFlags(current, { enable, disable }) {
  return {
    dotAll: !disable?.dotAll && !!(enable?.dotAll || current.dotAll),
    ignoreCase: !disable?.ignoreCase && !!(enable?.ignoreCase || current.ignoreCase)
  };
}
function getOrInsert(map, key, defaultValue) {
  if (!map.has(key)) {
    map.set(key, defaultValue);
  }
  return map.get(key);
}
function isMinTarget(target, min) {
  return EsVersion[target] >= EsVersion[min];
}
function throwIfNullish(value, msg) {
  if (value == null) {
    throw new Error(msg ?? "Value expected");
  }
  return value;
}
var EsVersion = {
  ES2025: 2025,
  ES2024: 2024,
  ES2018: 2018
};
var Target = {
  auto: "auto",
  ES2025: "ES2025",
  ES2024: "ES2024",
  ES2018: "ES2018"
};
function getOptions(options = {}) {
  if ({}.toString.call(options) !== "[object Object]") {
    throw new Error("Unexpected options");
  }
  if (options.target !== undefined && !Target[options.target]) {
    throw new Error(`Unexpected target "${options.target}"`);
  }
  const opts = {
    accuracy: "default",
    avoidSubclass: false,
    flags: "",
    global: false,
    hasIndices: false,
    lazyCompileLength: Infinity,
    target: "auto",
    verbose: false,
    ...options,
    rules: {
      allowOrphanBackrefs: false,
      asciiWordBoundaries: false,
      captureGroup: false,
      recursionLimit: 20,
      singleline: false,
      ...options.rules
    }
  };
  if (opts.target === "auto") {
    opts.target = envFlags.flagGroups ? "ES2025" : envFlags.unicodeSets ? "ES2024" : "ES2018";
  }
  return opts;
}
var asciiSpaceChar = "[\t-\r ]";
var CharsWithoutIgnoreCaseExpansion = /* @__PURE__ */ new Set([
  cp(304),
  cp(305)
]);
var defaultWordChar = r3`[\p{L}\p{M}\p{N}\p{Pc}]`;
function getIgnoreCaseMatchChars(char) {
  if (CharsWithoutIgnoreCaseExpansion.has(char)) {
    return [char];
  }
  const set = /* @__PURE__ */ new Set;
  const lower = char.toLowerCase();
  const upper = lower.toUpperCase();
  const title = LowerToTitleCaseMap.get(lower);
  const altLower = LowerToAlternativeLowerCaseMap.get(lower);
  const altUpper = LowerToAlternativeUpperCaseMap.get(lower);
  if ([...upper].length === 1) {
    set.add(upper);
  }
  altUpper && set.add(altUpper);
  title && set.add(title);
  set.add(lower);
  altLower && set.add(altLower);
  return [...set];
}
var JsUnicodePropertyMap = /* @__PURE__ */ new Map(`C Other
Cc Control cntrl
Cf Format
Cn Unassigned
Co Private_Use
Cs Surrogate
L Letter
LC Cased_Letter
Ll Lowercase_Letter
Lm Modifier_Letter
Lo Other_Letter
Lt Titlecase_Letter
Lu Uppercase_Letter
M Mark Combining_Mark
Mc Spacing_Mark
Me Enclosing_Mark
Mn Nonspacing_Mark
N Number
Nd Decimal_Number digit
Nl Letter_Number
No Other_Number
P Punctuation punct
Pc Connector_Punctuation
Pd Dash_Punctuation
Pe Close_Punctuation
Pf Final_Punctuation
Pi Initial_Punctuation
Po Other_Punctuation
Ps Open_Punctuation
S Symbol
Sc Currency_Symbol
Sk Modifier_Symbol
Sm Math_Symbol
So Other_Symbol
Z Separator
Zl Line_Separator
Zp Paragraph_Separator
Zs Space_Separator
ASCII
ASCII_Hex_Digit AHex
Alphabetic Alpha
Any
Assigned
Bidi_Control Bidi_C
Bidi_Mirrored Bidi_M
Case_Ignorable CI
Cased
Changes_When_Casefolded CWCF
Changes_When_Casemapped CWCM
Changes_When_Lowercased CWL
Changes_When_NFKC_Casefolded CWKCF
Changes_When_Titlecased CWT
Changes_When_Uppercased CWU
Dash
Default_Ignorable_Code_Point DI
Deprecated Dep
Diacritic Dia
Emoji
Emoji_Component EComp
Emoji_Modifier EMod
Emoji_Modifier_Base EBase
Emoji_Presentation EPres
Extended_Pictographic ExtPict
Extender Ext
Grapheme_Base Gr_Base
Grapheme_Extend Gr_Ext
Hex_Digit Hex
IDS_Binary_Operator IDSB
IDS_Trinary_Operator IDST
ID_Continue IDC
ID_Start IDS
Ideographic Ideo
Join_Control Join_C
Logical_Order_Exception LOE
Lowercase Lower
Math
Noncharacter_Code_Point NChar
Pattern_Syntax Pat_Syn
Pattern_White_Space Pat_WS
Quotation_Mark QMark
Radical
Regional_Indicator RI
Sentence_Terminal STerm
Soft_Dotted SD
Terminal_Punctuation Term
Unified_Ideograph UIdeo
Uppercase Upper
Variation_Selector VS
White_Space space
XID_Continue XIDC
XID_Start XIDS`.split(/\s/).map((p) => [w2(p), p]));
var LowerToAlternativeLowerCaseMap = /* @__PURE__ */ new Map([
  ["s", cp(383)],
  [cp(383), "s"]
]);
var LowerToAlternativeUpperCaseMap = /* @__PURE__ */ new Map([
  [cp(223), cp(7838)],
  [cp(107), cp(8490)],
  [cp(229), cp(8491)],
  [cp(969), cp(8486)]
]);
var LowerToTitleCaseMap = new Map([
  titleEntry(453),
  titleEntry(456),
  titleEntry(459),
  titleEntry(498),
  ...titleRange(8072, 8079),
  ...titleRange(8088, 8095),
  ...titleRange(8104, 8111),
  titleEntry(8124),
  titleEntry(8140),
  titleEntry(8188)
]);
var PosixClassMap = /* @__PURE__ */ new Map([
  ["alnum", r3`[\p{Alpha}\p{Nd}]`],
  ["alpha", r3`\p{Alpha}`],
  ["ascii", r3`\p{ASCII}`],
  ["blank", r3`[\p{Zs}\t]`],
  ["cntrl", r3`\p{Cc}`],
  ["digit", r3`\p{Nd}`],
  ["graph", r3`[\P{space}&&\P{Cc}&&\P{Cn}&&\P{Cs}]`],
  ["lower", r3`\p{Lower}`],
  ["print", r3`[[\P{space}&&\P{Cc}&&\P{Cn}&&\P{Cs}]\p{Zs}]`],
  ["punct", r3`[\p{P}\p{S}]`],
  ["space", r3`\p{space}`],
  ["upper", r3`\p{Upper}`],
  ["word", r3`[\p{Alpha}\p{M}\p{Nd}\p{Pc}]`],
  ["xdigit", r3`\p{AHex}`]
]);
function range(start, end) {
  const range2 = [];
  for (let i3 = start;i3 <= end; i3++) {
    range2.push(i3);
  }
  return range2;
}
function titleEntry(codePoint) {
  const char = cp(codePoint);
  return [char.toLowerCase(), char];
}
function titleRange(start, end) {
  return range(start, end).map((codePoint) => titleEntry(codePoint));
}
var UnicodePropertiesWithSpecificCase = /* @__PURE__ */ new Set([
  "Lower",
  "Lowercase",
  "Upper",
  "Uppercase",
  "Ll",
  "Lowercase_Letter",
  "Lt",
  "Titlecase_Letter",
  "Lu",
  "Uppercase_Letter"
]);
function transform(ast, options) {
  const opts = {
    accuracy: "default",
    asciiWordBoundaries: false,
    avoidSubclass: false,
    bestEffortTarget: "ES2025",
    ...options
  };
  addParentProperties(ast);
  const firstPassState = {
    accuracy: opts.accuracy,
    asciiWordBoundaries: opts.asciiWordBoundaries,
    avoidSubclass: opts.avoidSubclass,
    flagDirectivesByAlt: /* @__PURE__ */ new Map,
    jsGroupNameMap: /* @__PURE__ */ new Map,
    minTargetEs2024: isMinTarget(opts.bestEffortTarget, "ES2024"),
    passedLookbehind: false,
    strategy: null,
    subroutineRefMap: /* @__PURE__ */ new Map,
    supportedGNodes: /* @__PURE__ */ new Set,
    digitIsAscii: ast.flags.digitIsAscii,
    spaceIsAscii: ast.flags.spaceIsAscii,
    wordIsAscii: ast.flags.wordIsAscii
  };
  S(ast, FirstPassVisitor, firstPassState);
  const globalFlags = {
    dotAll: ast.flags.dotAll,
    ignoreCase: ast.flags.ignoreCase
  };
  const secondPassState = {
    currentFlags: globalFlags,
    prevFlags: null,
    globalFlags,
    groupOriginByCopy: /* @__PURE__ */ new Map,
    groupsByName: /* @__PURE__ */ new Map,
    multiplexCapturesToLeftByRef: /* @__PURE__ */ new Map,
    openRefs: /* @__PURE__ */ new Map,
    reffedNodesByReferencer: /* @__PURE__ */ new Map,
    subroutineRefMap: firstPassState.subroutineRefMap
  };
  S(ast, SecondPassVisitor, secondPassState);
  const thirdPassState = {
    groupsByName: secondPassState.groupsByName,
    highestOrphanBackref: 0,
    numCapturesToLeft: 0,
    reffedNodesByReferencer: secondPassState.reffedNodesByReferencer
  };
  S(ast, ThirdPassVisitor, thirdPassState);
  ast._originMap = secondPassState.groupOriginByCopy;
  ast._strategy = firstPassState.strategy;
  return ast;
}
var FirstPassVisitor = {
  AbsenceFunction({ node, parent, replaceWith }) {
    const { body, kind } = node;
    if (kind === "repeater") {
      const innerGroup = A2();
      innerGroup.body[0].body.push(K2({ negate: true, body }), Q2("Any"));
      const outerGroup = A2();
      outerGroup.body[0].body.push(_2("greedy", 0, Infinity, innerGroup));
      replaceWith(setParentDeep(outerGroup, parent), { traverse: true });
    } else {
      throw new Error(`Unsupported absence function "(?~|"`);
    }
  },
  Alternative: {
    enter({ node, parent, key }, { flagDirectivesByAlt }) {
      const flagDirectives = node.body.filter((el) => el.kind === "flags");
      for (let i3 = key + 1;i3 < parent.body.length; i3++) {
        const forwardSiblingAlt = parent.body[i3];
        getOrInsert(flagDirectivesByAlt, forwardSiblingAlt, []).push(...flagDirectives);
      }
    },
    exit({ node }, { flagDirectivesByAlt }) {
      if (flagDirectivesByAlt.get(node)?.length) {
        const flags = getCombinedFlagModsFromFlagNodes(flagDirectivesByAlt.get(node));
        if (flags) {
          const flagGroup = A2({ flags });
          flagGroup.body[0].body = node.body;
          node.body = [setParentDeep(flagGroup, node)];
        }
      }
    }
  },
  Assertion({ node, parent, key, container, root, remove, replaceWith }, state) {
    const { kind, negate } = node;
    const { asciiWordBoundaries, avoidSubclass, supportedGNodes, wordIsAscii } = state;
    if (kind === "text_segment_boundary") {
      throw new Error(`Unsupported text segment boundary "\\${negate ? "Y" : "y"}"`);
    } else if (kind === "line_end") {
      replaceWith(setParentDeep(K2({ body: [
        b2({ body: [F2("string_end")] }),
        b2({ body: [m2(10)] })
      ] }), parent));
    } else if (kind === "line_start") {
      replaceWith(setParentDeep(parseFragment(r3`(?<=\A|\n(?!\z))`, { skipLookbehindValidation: true }), parent));
    } else if (kind === "search_start") {
      if (supportedGNodes.has(node)) {
        root.flags.sticky = true;
        remove();
      } else {
        const prev = container[key - 1];
        if (prev && isAlwaysNonZeroLength(prev)) {
          replaceWith(setParentDeep(K2({ negate: true }), parent));
        } else if (avoidSubclass) {
          throw new Error(r3`Uses "\G" in a way that requires a subclass`);
        } else {
          replaceWith(setParent(F2("string_start"), parent));
          state.strategy = "clip_search";
        }
      }
    } else if (kind === "string_end" || kind === "string_start") {} else if (kind === "string_end_newline") {
      replaceWith(setParentDeep(parseFragment(r3`(?=\n?\z)`), parent));
    } else if (kind === "word_boundary") {
      if (!wordIsAscii && !asciiWordBoundaries) {
        const b3 = `(?:(?<=${defaultWordChar})(?!${defaultWordChar})|(?<!${defaultWordChar})(?=${defaultWordChar}))`;
        const B3 = `(?:(?<=${defaultWordChar})(?=${defaultWordChar})|(?<!${defaultWordChar})(?!${defaultWordChar}))`;
        replaceWith(setParentDeep(parseFragment(negate ? B3 : b3), parent));
      }
    } else {
      throw new Error(`Unexpected assertion kind "${kind}"`);
    }
  },
  Backreference({ node }, { jsGroupNameMap }) {
    let { ref } = node;
    if (typeof ref === "string" && !isValidJsGroupName(ref)) {
      ref = getAndStoreJsGroupName(ref, jsGroupNameMap);
      node.ref = ref;
    }
  },
  CapturingGroup({ node }, { jsGroupNameMap, subroutineRefMap }) {
    let { name } = node;
    if (name && !isValidJsGroupName(name)) {
      name = getAndStoreJsGroupName(name, jsGroupNameMap);
      node.name = name;
    }
    subroutineRefMap.set(node.number, node);
    if (name) {
      subroutineRefMap.set(name, node);
    }
  },
  CharacterClassRange({ node, parent, replaceWith }) {
    if (parent.kind === "intersection") {
      const cc = C2({ body: [node] });
      replaceWith(setParentDeep(cc, parent), { traverse: true });
    }
  },
  CharacterSet({ node, parent, replaceWith }, { accuracy, minTargetEs2024, digitIsAscii, spaceIsAscii, wordIsAscii }) {
    const { kind, negate, value } = node;
    if (digitIsAscii && (kind === "digit" || value === "digit")) {
      replaceWith(setParent(E2("digit", { negate }), parent));
      return;
    }
    if (spaceIsAscii && (kind === "space" || value === "space")) {
      replaceWith(setParentDeep(setNegate(parseFragment(asciiSpaceChar), negate), parent));
      return;
    }
    if (wordIsAscii && (kind === "word" || value === "word")) {
      replaceWith(setParent(E2("word", { negate }), parent));
      return;
    }
    if (kind === "any") {
      replaceWith(setParent(Q2("Any"), parent));
    } else if (kind === "digit") {
      replaceWith(setParent(Q2("Nd", { negate }), parent));
    } else if (kind === "dot") {} else if (kind === "text_segment") {
      if (accuracy === "strict") {
        throw new Error(r3`Use of "\X" requires non-strict accuracy`);
      }
      const eBase = "\\p{Emoji}(?:\\p{EMod}|\\uFE0F\\u20E3?|[\\x{E0020}-\\x{E007E}]+\\x{E007F})?";
      const emoji = r3`\p{RI}{2}|${eBase}(?:\u200D${eBase})*`;
      replaceWith(setParentDeep(parseFragment(r3`(?>\r\n|${minTargetEs2024 ? r3`\p{RGI_Emoji}` : emoji}|\P{M}\p{M}*)`, { skipPropertyNameValidation: true }), parent));
    } else if (kind === "hex") {
      replaceWith(setParent(Q2("AHex", { negate }), parent));
    } else if (kind === "newline") {
      replaceWith(setParentDeep(parseFragment(negate ? `[^
]` : `(?>\r
?|[
\v\f\u2028\u2029])`), parent));
    } else if (kind === "posix") {
      if (!minTargetEs2024 && (value === "graph" || value === "print")) {
        if (accuracy === "strict") {
          throw new Error(`POSIX class "${value}" requires min target ES2024 or non-strict accuracy`);
        }
        let ascii = {
          graph: "!-~",
          print: " -~"
        }[value];
        if (negate) {
          ascii = `\x00-${cp(ascii.codePointAt(0) - 1)}${cp(ascii.codePointAt(2) + 1)}-\uDBFF\uDFFF`;
        }
        replaceWith(setParentDeep(parseFragment(`[${ascii}]`), parent));
      } else {
        replaceWith(setParentDeep(setNegate(parseFragment(PosixClassMap.get(value)), negate), parent));
      }
    } else if (kind === "property") {
      if (!JsUnicodePropertyMap.has(w2(value))) {
        node.key = "sc";
      }
    } else if (kind === "space") {
      replaceWith(setParent(Q2("space", { negate }), parent));
    } else if (kind === "word") {
      replaceWith(setParentDeep(setNegate(parseFragment(defaultWordChar), negate), parent));
    } else {
      throw new Error(`Unexpected character set kind "${kind}"`);
    }
  },
  Directive({ node, parent, root, remove, replaceWith, removeAllPrevSiblings, removeAllNextSiblings }) {
    const { kind, flags } = node;
    if (kind === "flags") {
      if (!flags.enable && !flags.disable) {
        remove();
      } else {
        const flagGroup = A2({ flags });
        flagGroup.body[0].body = removeAllNextSiblings();
        replaceWith(setParentDeep(flagGroup, parent), { traverse: true });
      }
    } else if (kind === "keep") {
      const firstAlt = root.body[0];
      const hasWrapperGroup = root.body.length === 1 && o2(firstAlt, { type: "Group" }) && firstAlt.body[0].body.length === 1;
      const topLevel = hasWrapperGroup ? firstAlt.body[0] : root;
      if (parent.parent !== topLevel || topLevel.body.length > 1) {
        throw new Error(r3`Uses "\K" in a way that's unsupported`);
      }
      const lookbehind = K2({ behind: true });
      lookbehind.body[0].body = removeAllPrevSiblings();
      replaceWith(setParentDeep(lookbehind, parent));
    } else {
      throw new Error(`Unexpected directive kind "${kind}"`);
    }
  },
  Flags({ node, parent }) {
    if (node.posixIsAscii) {
      throw new Error('Unsupported flag "P"');
    }
    if (node.textSegmentMode === "word") {
      throw new Error('Unsupported flag "y{w}"');
    }
    [
      "digitIsAscii",
      "extended",
      "posixIsAscii",
      "spaceIsAscii",
      "wordIsAscii",
      "textSegmentMode"
    ].forEach((f2) => delete node[f2]);
    Object.assign(node, {
      global: false,
      hasIndices: false,
      multiline: false,
      sticky: node.sticky ?? false
    });
    parent.options = {
      disable: {
        x: true,
        n: true
      },
      force: {
        v: true
      }
    };
  },
  Group({ node }) {
    if (!node.flags) {
      return;
    }
    const { enable, disable } = node.flags;
    enable?.extended && delete enable.extended;
    disable?.extended && delete disable.extended;
    enable?.dotAll && disable?.dotAll && delete enable.dotAll;
    enable?.ignoreCase && disable?.ignoreCase && delete enable.ignoreCase;
    enable && !Object.keys(enable).length && delete node.flags.enable;
    disable && !Object.keys(disable).length && delete node.flags.disable;
    !node.flags.enable && !node.flags.disable && delete node.flags;
  },
  LookaroundAssertion({ node }, state) {
    const { kind } = node;
    if (kind === "lookbehind") {
      state.passedLookbehind = true;
    }
  },
  NamedCallout({ node, parent, replaceWith }) {
    const { kind } = node;
    if (kind === "fail") {
      replaceWith(setParentDeep(K2({ negate: true }), parent));
    } else {
      throw new Error(`Unsupported named callout "(*${kind.toUpperCase()}"`);
    }
  },
  Quantifier({ node }) {
    if (node.body.type === "Quantifier") {
      const group = A2();
      group.body[0].body.push(node.body);
      node.body = setParentDeep(group, node);
    }
  },
  Regex: {
    enter({ node }, { supportedGNodes }) {
      const leadingGs = [];
      let hasAltWithLeadG = false;
      let hasAltWithoutLeadG = false;
      for (const alt of node.body) {
        if (alt.body.length === 1 && alt.body[0].kind === "search_start") {
          alt.body.pop();
        } else {
          const leadingG = getLeadingG(alt.body);
          if (leadingG) {
            hasAltWithLeadG = true;
            Array.isArray(leadingG) ? leadingGs.push(...leadingG) : leadingGs.push(leadingG);
          } else {
            hasAltWithoutLeadG = true;
          }
        }
      }
      if (hasAltWithLeadG && !hasAltWithoutLeadG) {
        leadingGs.forEach((g) => supportedGNodes.add(g));
      }
    },
    exit(_3, { accuracy, passedLookbehind, strategy }) {
      if (accuracy === "strict" && passedLookbehind && strategy) {
        throw new Error(r3`Uses "\G" in a way that requires non-strict accuracy`);
      }
    }
  },
  Subroutine({ node }, { jsGroupNameMap }) {
    let { ref } = node;
    if (typeof ref === "string" && !isValidJsGroupName(ref)) {
      ref = getAndStoreJsGroupName(ref, jsGroupNameMap);
      node.ref = ref;
    }
  }
};
var SecondPassVisitor = {
  Backreference({ node }, { multiplexCapturesToLeftByRef, reffedNodesByReferencer }) {
    const { orphan, ref } = node;
    if (!orphan) {
      reffedNodesByReferencer.set(node, [...multiplexCapturesToLeftByRef.get(ref).map(({ node: node2 }) => node2)]);
    }
  },
  CapturingGroup: {
    enter({
      node,
      parent,
      replaceWith,
      skip
    }, {
      groupOriginByCopy,
      groupsByName,
      multiplexCapturesToLeftByRef,
      openRefs,
      reffedNodesByReferencer
    }) {
      const origin = groupOriginByCopy.get(node);
      if (origin && openRefs.has(node.number)) {
        const recursion2 = setParent(createRecursion(node.number), parent);
        reffedNodesByReferencer.set(recursion2, openRefs.get(node.number));
        replaceWith(recursion2);
        return;
      }
      openRefs.set(node.number, node);
      multiplexCapturesToLeftByRef.set(node.number, []);
      if (node.name) {
        getOrInsert(multiplexCapturesToLeftByRef, node.name, []);
      }
      const multiplexNodes = multiplexCapturesToLeftByRef.get(node.name ?? node.number);
      for (let i3 = 0;i3 < multiplexNodes.length; i3++) {
        const multiplex = multiplexNodes[i3];
        if (origin === multiplex.node || origin && origin === multiplex.origin || node === multiplex.origin) {
          multiplexNodes.splice(i3, 1);
          break;
        }
      }
      multiplexCapturesToLeftByRef.get(node.number).push({ node, origin });
      if (node.name) {
        multiplexCapturesToLeftByRef.get(node.name).push({ node, origin });
      }
      if (node.name) {
        const groupsWithSameName = getOrInsert(groupsByName, node.name, /* @__PURE__ */ new Map);
        let hasDuplicateNameToRemove = false;
        if (origin) {
          hasDuplicateNameToRemove = true;
        } else {
          for (const groupInfo of groupsWithSameName.values()) {
            if (!groupInfo.hasDuplicateNameToRemove) {
              hasDuplicateNameToRemove = true;
              break;
            }
          }
        }
        groupsByName.get(node.name).set(node, { node, hasDuplicateNameToRemove });
      }
    },
    exit({ node }, { openRefs }) {
      if (openRefs.get(node.number) === node) {
        openRefs.delete(node.number);
      }
    }
  },
  Group: {
    enter({ node }, state) {
      state.prevFlags = state.currentFlags;
      if (node.flags) {
        state.currentFlags = getNewCurrentFlags(state.currentFlags, node.flags);
      }
    },
    exit(_3, state) {
      state.currentFlags = state.prevFlags;
    }
  },
  Subroutine({ node, parent, replaceWith }, state) {
    const { isRecursive, ref } = node;
    if (isRecursive) {
      let reffed = parent;
      while (reffed = reffed.parent) {
        if (reffed.type === "CapturingGroup" && (reffed.name === ref || reffed.number === ref)) {
          break;
        }
      }
      state.reffedNodesByReferencer.set(node, reffed);
      return;
    }
    const reffedGroupNode = state.subroutineRefMap.get(ref);
    const isGlobalRecursion = ref === 0;
    const expandedSubroutine = isGlobalRecursion ? createRecursion(0) : cloneCapturingGroup(reffedGroupNode, state.groupOriginByCopy, null);
    let replacement = expandedSubroutine;
    if (!isGlobalRecursion) {
      const reffedGroupFlagMods = getCombinedFlagModsFromFlagNodes(getAllParents(reffedGroupNode, (p) => p.type === "Group" && !!p.flags));
      const reffedGroupFlags = reffedGroupFlagMods ? getNewCurrentFlags(state.globalFlags, reffedGroupFlagMods) : state.globalFlags;
      if (!areFlagsEqual(reffedGroupFlags, state.currentFlags)) {
        replacement = A2({
          flags: getFlagModsFromFlags(reffedGroupFlags)
        });
        replacement.body[0].body.push(expandedSubroutine);
      }
    }
    replaceWith(setParentDeep(replacement, parent), { traverse: !isGlobalRecursion });
  }
};
var ThirdPassVisitor = {
  Backreference({ node, parent, replaceWith }, state) {
    if (node.orphan) {
      state.highestOrphanBackref = Math.max(state.highestOrphanBackref, node.ref);
      return;
    }
    const reffedNodes = state.reffedNodesByReferencer.get(node);
    const participants = reffedNodes.filter((reffed) => canParticipateWithNode(reffed, node));
    if (!participants.length) {
      replaceWith(setParentDeep(K2({ negate: true }), parent));
    } else if (participants.length > 1) {
      const group = A2({
        atomic: true,
        body: participants.reverse().map((reffed) => b2({
          body: [k2(reffed.number)]
        }))
      });
      replaceWith(setParentDeep(group, parent));
    } else {
      node.ref = participants[0].number;
    }
  },
  CapturingGroup({ node }, state) {
    node.number = ++state.numCapturesToLeft;
    if (node.name) {
      if (state.groupsByName.get(node.name).get(node).hasDuplicateNameToRemove) {
        delete node.name;
      }
    }
  },
  Regex: {
    exit({ node }, state) {
      const numCapsNeeded = Math.max(state.highestOrphanBackref - state.numCapturesToLeft, 0);
      for (let i3 = 0;i3 < numCapsNeeded; i3++) {
        const emptyCapture = P2();
        node.body.at(-1).body.push(emptyCapture);
      }
    }
  },
  Subroutine({ node }, state) {
    if (!node.isRecursive || node.ref === 0) {
      return;
    }
    node.ref = state.reffedNodesByReferencer.get(node).number;
  }
};
function addParentProperties(root) {
  S(root, {
    "*"({ node, parent }) {
      node.parent = parent;
    }
  });
}
function areFlagsEqual(a2, b3) {
  return a2.dotAll === b3.dotAll && a2.ignoreCase === b3.ignoreCase;
}
function canParticipateWithNode(capture, node) {
  let rightmostPoint = node;
  do {
    if (rightmostPoint.type === "Regex") {
      return false;
    }
    if (rightmostPoint.type === "Alternative") {
      continue;
    }
    if (rightmostPoint === capture) {
      return false;
    }
    const kidsOfParent = getKids(rightmostPoint.parent);
    for (const kid of kidsOfParent) {
      if (kid === rightmostPoint) {
        break;
      }
      if (kid === capture || isAncestorOf(kid, capture)) {
        return true;
      }
    }
  } while (rightmostPoint = rightmostPoint.parent);
  throw new Error("Unexpected path");
}
function cloneCapturingGroup(obj, originMap, up, up2) {
  const store = Array.isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === "parent") {
      store.parent = Array.isArray(up) ? up2 : up;
    } else if (value && typeof value === "object") {
      store[key] = cloneCapturingGroup(value, originMap, store, up);
    } else {
      if (key === "type" && value === "CapturingGroup") {
        originMap.set(store, originMap.get(obj) ?? obj);
      }
      store[key] = value;
    }
  }
  return store;
}
function createRecursion(ref) {
  const node = O2(ref);
  node.isRecursive = true;
  return node;
}
function getAllParents(node, filterFn) {
  const results = [];
  while (node = node.parent) {
    if (!filterFn || filterFn(node)) {
      results.push(node);
    }
  }
  return results;
}
function getAndStoreJsGroupName(name, map) {
  if (map.has(name)) {
    return map.get(name);
  }
  const jsName = `$${map.size}_${name.replace(/^[^$_\p{IDS}]|[^$\u200C\u200D\p{IDC}]/ug, "_")}`;
  map.set(name, jsName);
  return jsName;
}
function getCombinedFlagModsFromFlagNodes(flagNodes) {
  const flagProps = ["dotAll", "ignoreCase"];
  const combinedFlags = { enable: {}, disable: {} };
  flagNodes.forEach(({ flags }) => {
    flagProps.forEach((prop) => {
      if (flags.enable?.[prop]) {
        delete combinedFlags.disable[prop];
        combinedFlags.enable[prop] = true;
      }
      if (flags.disable?.[prop]) {
        combinedFlags.disable[prop] = true;
      }
    });
  });
  if (!Object.keys(combinedFlags.enable).length) {
    delete combinedFlags.enable;
  }
  if (!Object.keys(combinedFlags.disable).length) {
    delete combinedFlags.disable;
  }
  if (combinedFlags.enable || combinedFlags.disable) {
    return combinedFlags;
  }
  return null;
}
function getFlagModsFromFlags({ dotAll, ignoreCase }) {
  const mods = {};
  if (dotAll || ignoreCase) {
    mods.enable = {};
    dotAll && (mods.enable.dotAll = true);
    ignoreCase && (mods.enable.ignoreCase = true);
  }
  if (!dotAll || !ignoreCase) {
    mods.disable = {};
    !dotAll && (mods.disable.dotAll = true);
    !ignoreCase && (mods.disable.ignoreCase = true);
  }
  return mods;
}
function getKids(node) {
  if (!node) {
    throw new Error("Node expected");
  }
  const { body } = node;
  return Array.isArray(body) ? body : body ? [body] : null;
}
function getLeadingG(els) {
  const firstToConsider = els.find((el) => el.kind === "search_start" || isLoneGLookaround(el, { negate: false }) || !isAlwaysZeroLength(el));
  if (!firstToConsider) {
    return null;
  }
  if (firstToConsider.kind === "search_start") {
    return firstToConsider;
  }
  if (firstToConsider.type === "LookaroundAssertion") {
    return firstToConsider.body[0].body[0];
  }
  if (firstToConsider.type === "CapturingGroup" || firstToConsider.type === "Group") {
    const gNodesForGroup = [];
    for (const alt of firstToConsider.body) {
      const leadingG = getLeadingG(alt.body);
      if (!leadingG) {
        return null;
      }
      Array.isArray(leadingG) ? gNodesForGroup.push(...leadingG) : gNodesForGroup.push(leadingG);
    }
    return gNodesForGroup;
  }
  return null;
}
function isAncestorOf(node, descendant) {
  const kids = getKids(node) ?? [];
  for (const kid of kids) {
    if (kid === descendant || isAncestorOf(kid, descendant)) {
      return true;
    }
  }
  return false;
}
function isAlwaysZeroLength({ type }) {
  return type === "Assertion" || type === "Directive" || type === "LookaroundAssertion";
}
function isAlwaysNonZeroLength(node) {
  const types = [
    "Character",
    "CharacterClass",
    "CharacterSet"
  ];
  return types.includes(node.type) || node.type === "Quantifier" && node.min && types.includes(node.body.type);
}
function isLoneGLookaround(node, options) {
  const opts = {
    negate: null,
    ...options
  };
  return node.type === "LookaroundAssertion" && (opts.negate === null || node.negate === opts.negate) && node.body.length === 1 && o2(node.body[0], {
    type: "Assertion",
    kind: "search_start"
  });
}
function isValidJsGroupName(name) {
  return /^[$_\p{IDS}][$\u200C\u200D\p{IDC}]*$/u.test(name);
}
function parseFragment(pattern, options) {
  const ast = J2(pattern, {
    ...options,
    unicodePropertyMap: JsUnicodePropertyMap
  });
  const alts = ast.body;
  if (alts.length > 1 || alts[0].body.length > 1) {
    return A2({ body: alts });
  }
  return alts[0].body[0];
}
function setNegate(node, negate) {
  node.negate = negate;
  return node;
}
function setParent(node, parent) {
  node.parent = parent;
  return node;
}
function setParentDeep(node, parent) {
  addParentProperties(node);
  node.parent = parent;
  return node;
}
function generate(ast, options) {
  const opts = getOptions(options);
  const minTargetEs2024 = isMinTarget(opts.target, "ES2024");
  const minTargetEs2025 = isMinTarget(opts.target, "ES2025");
  const recursionLimit = opts.rules.recursionLimit;
  if (!Number.isInteger(recursionLimit) || recursionLimit < 2 || recursionLimit > 20) {
    throw new Error("Invalid recursionLimit; use 2-20");
  }
  let hasCaseInsensitiveNode = null;
  let hasCaseSensitiveNode = null;
  if (!minTargetEs2025) {
    const iStack = [ast.flags.ignoreCase];
    S(ast, FlagModifierVisitor, {
      getCurrentModI: () => iStack.at(-1),
      popModI() {
        iStack.pop();
      },
      pushModI(isIOn) {
        iStack.push(isIOn);
      },
      setHasCasedChar() {
        if (iStack.at(-1)) {
          hasCaseInsensitiveNode = true;
        } else {
          hasCaseSensitiveNode = true;
        }
      }
    });
  }
  const appliedGlobalFlags = {
    dotAll: ast.flags.dotAll,
    ignoreCase: !!((ast.flags.ignoreCase || hasCaseInsensitiveNode) && !hasCaseSensitiveNode)
  };
  let lastNode = ast;
  const state = {
    accuracy: opts.accuracy,
    appliedGlobalFlags,
    captureMap: /* @__PURE__ */ new Map,
    currentFlags: {
      dotAll: ast.flags.dotAll,
      ignoreCase: ast.flags.ignoreCase
    },
    inCharClass: false,
    lastNode,
    originMap: ast._originMap,
    recursionLimit,
    useAppliedIgnoreCase: !!(!minTargetEs2025 && hasCaseInsensitiveNode && hasCaseSensitiveNode),
    useFlagMods: minTargetEs2025,
    useFlagV: minTargetEs2024,
    verbose: opts.verbose
  };
  function gen(node) {
    state.lastNode = lastNode;
    lastNode = node;
    const fn = throwIfNullish(generator[node.type], `Unexpected node type "${node.type}"`);
    return fn(node, state, gen);
  }
  const result = {
    pattern: ast.body.map(gen).join("|"),
    flags: gen(ast.flags),
    options: { ...ast.options }
  };
  if (!minTargetEs2024) {
    delete result.options.force.v;
    result.options.disable.v = true;
    result.options.unicodeSetsPlugin = null;
  }
  result._captureTransfers = /* @__PURE__ */ new Map;
  result._hiddenCaptures = [];
  state.captureMap.forEach((value, key) => {
    if (value.hidden) {
      result._hiddenCaptures.push(key);
    }
    if (value.transferTo) {
      getOrInsert(result._captureTransfers, value.transferTo, []).push(key);
    }
  });
  return result;
}
var FlagModifierVisitor = {
  "*": {
    enter({ node }, state) {
      if (isAnyGroup(node)) {
        const currentModI = state.getCurrentModI();
        state.pushModI(node.flags ? getNewCurrentFlags({ ignoreCase: currentModI }, node.flags).ignoreCase : currentModI);
      }
    },
    exit({ node }, state) {
      if (isAnyGroup(node)) {
        state.popModI();
      }
    }
  },
  Backreference(_3, state) {
    state.setHasCasedChar();
  },
  Character({ node }, state) {
    if (charHasCase(cp(node.value))) {
      state.setHasCasedChar();
    }
  },
  CharacterClassRange({ node, skip }, state) {
    skip();
    if (getCasesOutsideCharClassRange(node, { firstOnly: true }).length) {
      state.setHasCasedChar();
    }
  },
  CharacterSet({ node }, state) {
    if (node.kind === "property" && UnicodePropertiesWithSpecificCase.has(node.value)) {
      state.setHasCasedChar();
    }
  }
};
var generator = {
  Alternative({ body }, _3, gen) {
    return body.map(gen).join("");
  },
  Assertion({ kind, negate }) {
    if (kind === "string_end") {
      return "$";
    }
    if (kind === "string_start") {
      return "^";
    }
    if (kind === "word_boundary") {
      return negate ? r3`\B` : r3`\b`;
    }
    throw new Error(`Unexpected assertion kind "${kind}"`);
  },
  Backreference({ ref }, state) {
    if (typeof ref !== "number") {
      throw new Error("Unexpected named backref in transformed AST");
    }
    if (!state.useFlagMods && state.accuracy === "strict" && state.currentFlags.ignoreCase && !state.captureMap.get(ref).ignoreCase) {
      throw new Error("Use of case-insensitive backref to case-sensitive group requires target ES2025 or non-strict accuracy");
    }
    return "\\" + ref;
  },
  CapturingGroup(node, state, gen) {
    const { body, name, number } = node;
    const data = { ignoreCase: state.currentFlags.ignoreCase };
    const origin = state.originMap.get(node);
    if (origin) {
      data.hidden = true;
      if (number > origin.number) {
        data.transferTo = origin.number;
      }
    }
    state.captureMap.set(number, data);
    return `(${name ? `?<${name}>` : ""}${body.map(gen).join("|")})`;
  },
  Character({ value }, state) {
    const char = cp(value);
    const escaped = getCharEscape(value, {
      escDigit: state.lastNode.type === "Backreference",
      inCharClass: state.inCharClass,
      useFlagV: state.useFlagV
    });
    if (escaped !== char) {
      return escaped;
    }
    if (state.useAppliedIgnoreCase && state.currentFlags.ignoreCase && charHasCase(char)) {
      const cases = getIgnoreCaseMatchChars(char);
      return state.inCharClass ? cases.join("") : cases.length > 1 ? `[${cases.join("")}]` : cases[0];
    }
    return char;
  },
  CharacterClass(node, state, gen) {
    const { kind, negate, parent } = node;
    let { body } = node;
    if (kind === "intersection" && !state.useFlagV) {
      throw new Error("Use of character class intersection requires min target ES2024");
    }
    if (envFlags.bugFlagVLiteralHyphenIsRange && state.useFlagV && body.some(isLiteralHyphen)) {
      body = [m2(45), ...body.filter((kid) => !isLiteralHyphen(kid))];
    }
    const genClass = () => `[${negate ? "^" : ""}${body.map(gen).join(kind === "intersection" ? "&&" : "")}]`;
    if (!state.inCharClass) {
      if ((!state.useFlagV || envFlags.bugNestedClassIgnoresNegation) && !negate) {
        const negatedChildClasses = body.filter((kid) => kid.type === "CharacterClass" && kid.kind === "union" && kid.negate);
        if (negatedChildClasses.length) {
          const group = A2();
          const groupFirstAlt = group.body[0];
          group.parent = parent;
          groupFirstAlt.parent = group;
          body = body.filter((kid) => !negatedChildClasses.includes(kid));
          node.body = body;
          if (body.length) {
            node.parent = groupFirstAlt;
            groupFirstAlt.body.push(node);
          } else {
            group.body.pop();
          }
          negatedChildClasses.forEach((cc) => {
            const newAlt = b2({ body: [cc] });
            cc.parent = newAlt;
            newAlt.parent = group;
            group.body.push(newAlt);
          });
          return gen(group);
        }
      }
      state.inCharClass = true;
      const result = genClass();
      state.inCharClass = false;
      return result;
    }
    const firstEl = body[0];
    if (kind === "union" && !negate && firstEl && ((!state.useFlagV || !state.verbose) && parent.kind === "union" && !(envFlags.bugFlagVLiteralHyphenIsRange && state.useFlagV) || !state.verbose && parent.kind === "intersection" && body.length === 1 && firstEl.type !== "CharacterClassRange")) {
      return body.map(gen).join("");
    }
    if (!state.useFlagV && parent.type === "CharacterClass") {
      throw new Error("Uses nested character class in a way that requires min target ES2024");
    }
    return genClass();
  },
  CharacterClassRange(node, state) {
    const min = node.min.value;
    const max = node.max.value;
    const escOpts = {
      escDigit: false,
      inCharClass: true,
      useFlagV: state.useFlagV
    };
    const minStr = getCharEscape(min, escOpts);
    const maxStr = getCharEscape(max, escOpts);
    const extraChars = /* @__PURE__ */ new Set;
    if (state.useAppliedIgnoreCase && state.currentFlags.ignoreCase) {
      const charsOutsideRange = getCasesOutsideCharClassRange(node);
      const ranges = getCodePointRangesFromChars(charsOutsideRange);
      ranges.forEach((value) => {
        extraChars.add(Array.isArray(value) ? `${getCharEscape(value[0], escOpts)}-${getCharEscape(value[1], escOpts)}` : getCharEscape(value, escOpts));
      });
    }
    return `${minStr}-${maxStr}${[...extraChars].join("")}`;
  },
  CharacterSet({ kind, negate, value, key }, state) {
    if (kind === "dot") {
      return state.currentFlags.dotAll ? state.appliedGlobalFlags.dotAll || state.useFlagMods ? "." : "[^]" : r3`[^\n]`;
    }
    if (kind === "digit") {
      return negate ? r3`\D` : r3`\d`;
    }
    if (kind === "property") {
      if (state.useAppliedIgnoreCase && state.currentFlags.ignoreCase && UnicodePropertiesWithSpecificCase.has(value)) {
        throw new Error(`Unicode property "${value}" can't be case-insensitive when other chars have specific case`);
      }
      return `${negate ? r3`\P` : r3`\p`}{${key ? `${key}=` : ""}${value}}`;
    }
    if (kind === "word") {
      return negate ? r3`\W` : r3`\w`;
    }
    throw new Error(`Unexpected character set kind "${kind}"`);
  },
  Flags(node, state) {
    return (state.appliedGlobalFlags.ignoreCase ? "i" : "") + (node.dotAll ? "s" : "") + (node.sticky ? "y" : "");
  },
  Group({ atomic: atomic2, body, flags, parent }, state, gen) {
    const currentFlags = state.currentFlags;
    if (flags) {
      state.currentFlags = getNewCurrentFlags(currentFlags, flags);
    }
    const contents = body.map(gen).join("|");
    const result = !state.verbose && body.length === 1 && parent.type !== "Quantifier" && !atomic2 && (!state.useFlagMods || !flags) ? contents : `(?${getGroupPrefix(atomic2, flags, state.useFlagMods)}${contents})`;
    state.currentFlags = currentFlags;
    return result;
  },
  LookaroundAssertion({ body, kind, negate }, _3, gen) {
    const prefix = `${kind === "lookahead" ? "" : "<"}${negate ? "!" : "="}`;
    return `(?${prefix}${body.map(gen).join("|")})`;
  },
  Quantifier(node, _3, gen) {
    return gen(node.body) + getQuantifierStr(node);
  },
  Subroutine({ isRecursive, ref }, state) {
    if (!isRecursive) {
      throw new Error("Unexpected non-recursive subroutine in transformed AST");
    }
    const limit = state.recursionLimit;
    return ref === 0 ? `(?R=${limit})` : r3`\g<${ref}&R=${limit}>`;
  }
};
var BaseEscapeChars = /* @__PURE__ */ new Set([
  "$",
  "(",
  ")",
  "*",
  "+",
  ".",
  "?",
  "[",
  "\\",
  "]",
  "^",
  "{",
  "|",
  "}"
]);
var CharClassEscapeChars = /* @__PURE__ */ new Set([
  "-",
  "\\",
  "]",
  "^",
  "["
]);
var CharClassEscapeCharsFlagV = /* @__PURE__ */ new Set([
  "(",
  ")",
  "-",
  "/",
  "[",
  "\\",
  "]",
  "^",
  "{",
  "|",
  "}",
  "!",
  "#",
  "$",
  "%",
  "&",
  "*",
  "+",
  ",",
  ".",
  ":",
  ";",
  "<",
  "=",
  ">",
  "?",
  "@",
  "`",
  "~"
]);
var CharCodeEscapeMap = /* @__PURE__ */ new Map([
  [9, r3`\t`],
  [10, r3`\n`],
  [11, r3`\v`],
  [12, r3`\f`],
  [13, r3`\r`],
  [8232, r3`\u2028`],
  [8233, r3`\u2029`],
  [65279, r3`\uFEFF`]
]);
var casedRe = /^\p{Cased}$/u;
function charHasCase(char) {
  return casedRe.test(char);
}
function getCasesOutsideCharClassRange(node, options) {
  const firstOnly = !!options?.firstOnly;
  const min = node.min.value;
  const max = node.max.value;
  const found = [];
  if (min < 65 && (max === 65535 || max >= 131071) || min === 65536 && max >= 131071) {
    return found;
  }
  for (let i3 = min;i3 <= max; i3++) {
    const char = cp(i3);
    if (!charHasCase(char)) {
      continue;
    }
    const charsOutsideRange = getIgnoreCaseMatchChars(char).filter((caseOfChar) => {
      const num = caseOfChar.codePointAt(0);
      return num < min || num > max;
    });
    if (charsOutsideRange.length) {
      found.push(...charsOutsideRange);
      if (firstOnly) {
        break;
      }
    }
  }
  return found;
}
function getCharEscape(codePoint, { escDigit, inCharClass, useFlagV }) {
  if (CharCodeEscapeMap.has(codePoint)) {
    return CharCodeEscapeMap.get(codePoint);
  }
  if (codePoint < 32 || codePoint > 126 && codePoint < 160 || codePoint > 262143 || escDigit && isDigitCharCode(codePoint)) {
    return codePoint > 255 ? `\\u{${codePoint.toString(16).toUpperCase()}}` : `\\x${codePoint.toString(16).toUpperCase().padStart(2, "0")}`;
  }
  const escapeChars = inCharClass ? useFlagV ? CharClassEscapeCharsFlagV : CharClassEscapeChars : BaseEscapeChars;
  const char = cp(codePoint);
  return (escapeChars.has(char) ? "\\" : "") + char;
}
function getCodePointRangesFromChars(chars) {
  const codePoints = chars.map((char) => char.codePointAt(0)).sort((a2, b3) => a2 - b3);
  const values = [];
  let start = null;
  for (let i3 = 0;i3 < codePoints.length; i3++) {
    if (codePoints[i3 + 1] === codePoints[i3] + 1) {
      start ??= codePoints[i3];
    } else if (start === null) {
      values.push(codePoints[i3]);
    } else {
      values.push([start, codePoints[i3]]);
      start = null;
    }
  }
  return values;
}
function getGroupPrefix(atomic2, flagMods, useFlagMods) {
  if (atomic2) {
    return ">";
  }
  let mods = "";
  if (flagMods && useFlagMods) {
    const { enable, disable } = flagMods;
    mods = (enable?.ignoreCase ? "i" : "") + (enable?.dotAll ? "s" : "") + (disable ? "-" : "") + (disable?.ignoreCase ? "i" : "") + (disable?.dotAll ? "s" : "");
  }
  return `${mods}:`;
}
function getQuantifierStr({ kind, max, min }) {
  let base;
  if (!min && max === 1) {
    base = "?";
  } else if (!min && max === Infinity) {
    base = "*";
  } else if (min === 1 && max === Infinity) {
    base = "+";
  } else if (min === max) {
    base = `{${min}}`;
  } else {
    base = `{${min},${max === Infinity ? "" : max}}`;
  }
  return base + {
    greedy: "",
    lazy: "?",
    possessive: "+"
  }[kind];
}
function isAnyGroup({ type }) {
  return type === "CapturingGroup" || type === "Group" || type === "LookaroundAssertion";
}
function isDigitCharCode(value) {
  return value > 47 && value < 58;
}
function isLiteralHyphen({ type, value }) {
  return type === "Character" && value === 45;
}
var EmulatedRegExp = class _EmulatedRegExp extends RegExp {
  #captureMap = /* @__PURE__ */ new Map;
  #compiled = null;
  #pattern;
  #nameMap = null;
  #strategy = null;
  rawOptions = {};
  get source() {
    return this.#pattern || "(?:)";
  }
  constructor(pattern, flags, options) {
    const lazyCompile = !!options?.lazyCompile;
    if (pattern instanceof RegExp) {
      if (options) {
        throw new Error("Cannot provide options when copying a regexp");
      }
      const re2 = pattern;
      super(re2, flags);
      this.#pattern = re2.source;
      if (re2 instanceof _EmulatedRegExp) {
        this.#captureMap = re2.#captureMap;
        this.#nameMap = re2.#nameMap;
        this.#strategy = re2.#strategy;
        this.rawOptions = re2.rawOptions;
      }
    } else {
      const opts = {
        hiddenCaptures: [],
        strategy: null,
        transfers: [],
        ...options
      };
      super(lazyCompile ? "" : pattern, flags);
      this.#pattern = pattern;
      this.#captureMap = createCaptureMap(opts.hiddenCaptures, opts.transfers);
      this.#strategy = opts.strategy;
      this.rawOptions = options ?? {};
    }
    if (!lazyCompile) {
      this.#compiled = this;
    }
  }
  exec(str) {
    if (!this.#compiled) {
      const { lazyCompile, ...rest } = this.rawOptions;
      this.#compiled = new _EmulatedRegExp(this.#pattern, this.flags, rest);
    }
    const useLastIndex = this.global || this.sticky;
    const pos = this.lastIndex;
    if (this.#strategy === "clip_search" && useLastIndex && pos) {
      this.lastIndex = 0;
      const match = this.#execCore(str.slice(pos));
      if (match) {
        adjustMatchDetailsForOffset(match, pos, str, this.hasIndices);
        this.lastIndex += pos;
      }
      return match;
    }
    return this.#execCore(str);
  }
  #execCore(str) {
    this.#compiled.lastIndex = this.lastIndex;
    const match = super.exec.call(this.#compiled, str);
    this.lastIndex = this.#compiled.lastIndex;
    if (!match || !this.#captureMap.size) {
      return match;
    }
    const matchCopy = [...match];
    match.length = 1;
    let indicesCopy;
    if (this.hasIndices) {
      indicesCopy = [...match.indices];
      match.indices.length = 1;
    }
    const mappedNums = [0];
    for (let i3 = 1;i3 < matchCopy.length; i3++) {
      const { hidden, transferTo } = this.#captureMap.get(i3) ?? {};
      if (hidden) {
        mappedNums.push(null);
      } else {
        mappedNums.push(match.length);
        match.push(matchCopy[i3]);
        if (this.hasIndices) {
          match.indices.push(indicesCopy[i3]);
        }
      }
      if (transferTo && matchCopy[i3] !== undefined) {
        const to = mappedNums[transferTo];
        if (!to) {
          throw new Error(`Invalid capture transfer to "${to}"`);
        }
        match[to] = matchCopy[i3];
        if (this.hasIndices) {
          match.indices[to] = indicesCopy[i3];
        }
        if (match.groups) {
          if (!this.#nameMap) {
            this.#nameMap = createNameMap(this.source);
          }
          const name = this.#nameMap.get(transferTo);
          if (name) {
            match.groups[name] = matchCopy[i3];
            if (this.hasIndices) {
              match.indices.groups[name] = indicesCopy[i3];
            }
          }
        }
      }
    }
    return match;
  }
};
function adjustMatchDetailsForOffset(match, offset, input, hasIndices) {
  match.index += offset;
  match.input = input;
  if (hasIndices) {
    const indices = match.indices;
    for (let i3 = 0;i3 < indices.length; i3++) {
      const arr = indices[i3];
      if (arr) {
        indices[i3] = [arr[0] + offset, arr[1] + offset];
      }
    }
    const groupIndices = indices.groups;
    if (groupIndices) {
      Object.keys(groupIndices).forEach((key) => {
        const arr = groupIndices[key];
        if (arr) {
          groupIndices[key] = [arr[0] + offset, arr[1] + offset];
        }
      });
    }
  }
}
function createCaptureMap(hiddenCaptures, transfers) {
  const captureMap = /* @__PURE__ */ new Map;
  for (const num of hiddenCaptures) {
    captureMap.set(num, {
      hidden: true
    });
  }
  for (const [to, from] of transfers) {
    for (const num of from) {
      getOrInsert(captureMap, num, {}).transferTo = to;
    }
  }
  return captureMap;
}
function createNameMap(pattern) {
  const re2 = /(?<capture>\((?:\?<(?![=!])(?<name>[^>]+)>|(?!\?)))|\\?./gsu;
  const map = /* @__PURE__ */ new Map;
  let numCharClassesOpen = 0;
  let numCaptures = 0;
  let match;
  while (match = re2.exec(pattern)) {
    const { 0: m3, groups: { capture, name } } = match;
    if (m3 === "[") {
      numCharClassesOpen++;
    } else if (!numCharClassesOpen) {
      if (capture) {
        numCaptures++;
        if (name) {
          map.set(numCaptures, name);
        }
      }
    } else if (m3 === "]") {
      numCharClassesOpen--;
    }
  }
  return map;
}
function toRegExp(pattern, options) {
  const d2 = toRegExpDetails(pattern, options);
  if (d2.options) {
    return new EmulatedRegExp(d2.pattern, d2.flags, d2.options);
  }
  return new RegExp(d2.pattern, d2.flags);
}
function toRegExpDetails(pattern, options) {
  const opts = getOptions(options);
  const onigurumaAst = J2(pattern, {
    flags: opts.flags,
    normalizeUnknownPropertyNames: true,
    rules: {
      captureGroup: opts.rules.captureGroup,
      singleline: opts.rules.singleline
    },
    skipBackrefValidation: opts.rules.allowOrphanBackrefs,
    unicodePropertyMap: JsUnicodePropertyMap
  });
  const regexPlusAst = transform(onigurumaAst, {
    accuracy: opts.accuracy,
    asciiWordBoundaries: opts.rules.asciiWordBoundaries,
    avoidSubclass: opts.avoidSubclass,
    bestEffortTarget: opts.target
  });
  const generated = generate(regexPlusAst, opts);
  const recursionResult = recursion(generated.pattern, {
    captureTransfers: generated._captureTransfers,
    hiddenCaptures: generated._hiddenCaptures,
    mode: "external"
  });
  const possessiveResult = possessive(recursionResult.pattern);
  const atomicResult = atomic(possessiveResult.pattern, {
    captureTransfers: recursionResult.captureTransfers,
    hiddenCaptures: recursionResult.hiddenCaptures
  });
  const details = {
    pattern: atomicResult.pattern,
    flags: `${opts.hasIndices ? "d" : ""}${opts.global ? "g" : ""}${generated.flags}${generated.options.disable.v ? "u" : "v"}`
  };
  if (opts.avoidSubclass) {
    if (opts.lazyCompileLength !== Infinity) {
      throw new Error("Lazy compilation requires subclass");
    }
  } else {
    const hiddenCaptures = atomicResult.hiddenCaptures.sort((a2, b3) => a2 - b3);
    const transfers = Array.from(atomicResult.captureTransfers);
    const strategy = regexPlusAst._strategy;
    const lazyCompile = details.pattern.length >= opts.lazyCompileLength;
    if (hiddenCaptures.length || transfers.length || strategy || lazyCompile) {
      details.options = {
        ...hiddenCaptures.length && { hiddenCaptures },
        ...transfers.length && { transfers },
        ...strategy && { strategy },
        ...lazyCompile && { lazyCompile }
      };
    }
  }
  return details;
}

// node_modules/@shikijs/engine-javascript/dist/engine-compile.mjs
function defaultJavaScriptRegexConstructor(pattern, options) {
  return toRegExp(pattern, {
    global: true,
    hasIndices: true,
    lazyCompileLength: 3000,
    rules: {
      allowOrphanBackrefs: true,
      asciiWordBoundaries: true,
      captureGroup: true,
      recursionLimit: 5,
      singleline: true
    },
    ...options
  });
}
function createJavaScriptRegexEngine(options = {}) {
  const _options = {
    target: "auto",
    cache: /* @__PURE__ */ new Map,
    ...options
  };
  _options.regexConstructor ||= (pattern) => defaultJavaScriptRegexConstructor(pattern, { target: _options.target });
  return {
    createScanner(patterns) {
      return new JavaScriptScanner(patterns, _options);
    },
    createString(s2) {
      return { content: s2 };
    }
  };
}

// node_modules/@shikijs/engine-javascript/dist/engine-raw.mjs
function createJavaScriptRawEngine() {
  const options = {
    cache: /* @__PURE__ */ new Map,
    regexConstructor: () => {
      throw new Error("JavaScriptRawEngine: only support precompiled grammar");
    }
  };
  return {
    createScanner(patterns) {
      return new JavaScriptScanner(patterns, options);
    },
    createString(s2) {
      return { content: s2 };
    }
  };
}
export {
  defaultJavaScriptRegexConstructor,
  createJavaScriptRegexEngine,
  createJavaScriptRawEngine,
  JavaScriptScanner
};

//# debugId=EA3A4161BBD2524364756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BzaGlraWpzL2VuZ2luZS1qYXZhc2NyaXB0L2Rpc3Qvc2Nhbm5lci1EVzl0cVZJRC5tanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL29uaWd1cnVtYS1wYXJzZXIvZGlzdC91dGlscy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvb25pZ3VydW1hLXBhcnNlci9kaXN0L3Rva2VuaXplci90b2tlbml6ZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvb25pZ3VydW1hLXBhcnNlci9kaXN0L3BhcnNlci9ub2RlLXV0aWxzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9vbmlndXJ1bWEtcGFyc2VyL2Rpc3QvcGFyc2VyL3BhcnNlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9vbmlndXJ1bWEtcGFyc2VyL2Rpc3QvdHJhdmVyc2VyL3RyYXZlcnNlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9yZWdleC9zcmMvdXRpbHMtaW50ZXJuYWxzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9yZWdleC11dGlsaXRpZXMvc3JjL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9yZWdleC9zcmMvYXRvbWljLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9yZWdleC1yZWN1cnNpb24vc3JjL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9vbmlndXJ1bWEtdG8tZXMvZGlzdC9lc20vaW5kZXguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BzaGlraWpzL2VuZ2luZS1qYXZhc2NyaXB0L2Rpc3QvZW5naW5lLWNvbXBpbGUubWpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9Ac2hpa2lqcy9lbmdpbmUtamF2YXNjcmlwdC9kaXN0L2VuZ2luZS1yYXcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWwogICAgIi8vI3JlZ2lvbiBzcmMvc2Nhbm5lci50c1xuY29uc3QgTUFYID0gNDI5NDk2NzI5NTtcbnZhciBKYXZhU2NyaXB0U2Nhbm5lciA9IGNsYXNzIHtcblx0cGF0dGVybnM7XG5cdG9wdGlvbnM7XG5cdHJlZ2V4cHM7XG5cdGNvbnN0cnVjdG9yKHBhdHRlcm5zLCBvcHRpb25zID0ge30pIHtcblx0XHR0aGlzLnBhdHRlcm5zID0gcGF0dGVybnM7XG5cdFx0dGhpcy5vcHRpb25zID0gb3B0aW9ucztcblx0XHRjb25zdCB7IGZvcmdpdmluZyA9IGZhbHNlLCBjYWNoZSwgcmVnZXhDb25zdHJ1Y3RvciB9ID0gb3B0aW9ucztcblx0XHRpZiAoIXJlZ2V4Q29uc3RydWN0b3IpIHRocm93IG5ldyBFcnJvcihcIk9wdGlvbiBgcmVnZXhDb25zdHJ1Y3RvcmAgaXMgbm90IHByb3ZpZGVkXCIpO1xuXHRcdHRoaXMucmVnZXhwcyA9IHBhdHRlcm5zLm1hcCgocCkgPT4ge1xuXHRcdFx0aWYgKHR5cGVvZiBwICE9PSBcInN0cmluZ1wiKSByZXR1cm4gcDtcblx0XHRcdGNvbnN0IGNhY2hlZCA9IGNhY2hlPy5nZXQocCk7XG5cdFx0XHRpZiAoY2FjaGVkKSB7XG5cdFx0XHRcdGlmIChjYWNoZWQgaW5zdGFuY2VvZiBSZWdFeHApIHJldHVybiBjYWNoZWQ7XG5cdFx0XHRcdGlmIChmb3JnaXZpbmcpIHJldHVybiBudWxsO1xuXHRcdFx0XHR0aHJvdyBjYWNoZWQ7XG5cdFx0XHR9XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRjb25zdCByZWdleCA9IHJlZ2V4Q29uc3RydWN0b3IocCk7XG5cdFx0XHRcdGNhY2hlPy5zZXQocCwgcmVnZXgpO1xuXHRcdFx0XHRyZXR1cm4gcmVnZXg7XG5cdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdGNhY2hlPy5zZXQocCwgZSk7XG5cdFx0XHRcdGlmIChmb3JnaXZpbmcpIHJldHVybiBudWxsO1xuXHRcdFx0XHR0aHJvdyBlO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdGZpbmROZXh0TWF0Y2hTeW5jKHN0cmluZywgc3RhcnRQb3NpdGlvbiwgX29wdGlvbnMpIHtcblx0XHRjb25zdCBzdHIgPSB0eXBlb2Ygc3RyaW5nID09PSBcInN0cmluZ1wiID8gc3RyaW5nIDogc3RyaW5nLmNvbnRlbnQ7XG5cdFx0Y29uc3QgcGVuZGluZyA9IFtdO1xuXHRcdGZ1bmN0aW9uIHRvUmVzdWx0KGluZGV4LCBtYXRjaCwgb2Zmc2V0ID0gMCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0aW5kZXgsXG5cdFx0XHRcdGNhcHR1cmVJbmRpY2VzOiBtYXRjaC5pbmRpY2VzLm1hcCgoaW5kaWNlKSA9PiB7XG5cdFx0XHRcdFx0aWYgKGluZGljZSA9PSBudWxsKSByZXR1cm4ge1xuXHRcdFx0XHRcdFx0c3RhcnQ6IE1BWCxcblx0XHRcdFx0XHRcdGVuZDogTUFYLFxuXHRcdFx0XHRcdFx0bGVuZ3RoOiAwXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0c3RhcnQ6IGluZGljZVswXSArIG9mZnNldCxcblx0XHRcdFx0XHRcdGVuZDogaW5kaWNlWzFdICsgb2Zmc2V0LFxuXHRcdFx0XHRcdFx0bGVuZ3RoOiBpbmRpY2VbMV0gLSBpbmRpY2VbMF1cblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9KVxuXHRcdFx0fTtcblx0XHR9XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnJlZ2V4cHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGNvbnN0IHJlZ2V4cCA9IHRoaXMucmVnZXhwc1tpXTtcblx0XHRcdGlmICghcmVnZXhwKSBjb250aW51ZTtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdHJlZ2V4cC5sYXN0SW5kZXggPSBzdGFydFBvc2l0aW9uO1xuXHRcdFx0XHRjb25zdCBtYXRjaCA9IHJlZ2V4cC5leGVjKHN0cik7XG5cdFx0XHRcdGlmICghbWF0Y2gpIGNvbnRpbnVlO1xuXHRcdFx0XHRpZiAobWF0Y2guaW5kZXggPT09IHN0YXJ0UG9zaXRpb24pIHJldHVybiB0b1Jlc3VsdChpLCBtYXRjaCwgMCk7XG5cdFx0XHRcdHBlbmRpbmcucHVzaChbXG5cdFx0XHRcdFx0aSxcblx0XHRcdFx0XHRtYXRjaCxcblx0XHRcdFx0XHQwXG5cdFx0XHRcdF0pO1xuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRpZiAodGhpcy5vcHRpb25zLmZvcmdpdmluZykgY29udGludWU7XG5cdFx0XHRcdHRocm93IGU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChwZW5kaW5nLmxlbmd0aCkge1xuXHRcdFx0Y29uc3QgbWluSW5kZXggPSBNYXRoLm1pbiguLi5wZW5kaW5nLm1hcCgobSkgPT4gbVsxXS5pbmRleCkpO1xuXHRcdFx0Zm9yIChjb25zdCBbaSwgbWF0Y2gsIG9mZnNldF0gb2YgcGVuZGluZykgaWYgKG1hdGNoLmluZGV4ID09PSBtaW5JbmRleCkgcmV0dXJuIHRvUmVzdWx0KGksIG1hdGNoLCBvZmZzZXQpO1xuXHRcdH1cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxufTtcbi8vI2VuZHJlZ2lvblxuZXhwb3J0IHsgSmF2YVNjcmlwdFNjYW5uZXIgYXMgdCB9O1xuIiwKICAgICJcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKGUpe2lmKFsuLi5lXS5sZW5ndGghPT0xKXRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgXCIke2V9XCIgdG8gYmUgYSBzaW5nbGUgY29kZSBwb2ludGApO3JldHVybiBlLmNvZGVQb2ludEF0KDApfWZ1bmN0aW9uIGwoZSx0LG4pe3JldHVybiBlLmhhcyh0KXx8ZS5zZXQodCxuKSxlLmdldCh0KX1jb25zdCBpPW5ldyBTZXQoW1wiYWxudW1cIixcImFscGhhXCIsXCJhc2NpaVwiLFwiYmxhbmtcIixcImNudHJsXCIsXCJkaWdpdFwiLFwiZ3JhcGhcIixcImxvd2VyXCIsXCJwcmludFwiLFwicHVuY3RcIixcInNwYWNlXCIsXCJ1cHBlclwiLFwid29yZFwiLFwieGRpZ2l0XCJdKSxvPVN0cmluZy5yYXc7ZnVuY3Rpb24gdShlLHQpe2lmKGU9PW51bGwpdGhyb3cgbmV3IEVycm9yKHQ/P1wiVmFsdWUgZXhwZWN0ZWRcIik7cmV0dXJuIGV9ZXhwb3J0e3IgYXMgY3BPZixsIGFzIGdldE9ySW5zZXJ0LGkgYXMgUG9zaXhDbGFzc05hbWVzLG8gYXMgcix1IGFzIHRocm93SWZOdWxsaXNofTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXV0aWxzLmpzLm1hcFxuIiwKICAgICJcInVzZSBzdHJpY3RcIjtpbXBvcnR7Y3BPZiBhcyBoLFBvc2l4Q2xhc3NOYW1lcyBhcyBHLHIgYXMgcCx0aHJvd0lmTnVsbGlzaCBhcyBOfWZyb21cIi4uL3V0aWxzLmpzXCI7Y29uc3QgbT1wYFxcW1xcXj9gLGI9YGMuPyB8IEMoPzotLj8pP3wke3BgW3BQXVxceyg/OlxcXj9bLVxceDIwX10qW0EtWmEtel1bLVxceDIwXFx3XSpcXH0pP2B9fCR7cGB4Wzg5QS1GYS1mXVxccHtBSGV4fSg/OlxcXFx4Wzg5QS1GYS1mXVxccHtBSGV4fSkqYH18JHtwYHUoPzpcXHB7QUhleH17NH0pPyB8IHhcXHtbXlxcfV0qXFx9PyB8IHhcXHB7QUhleH17MCwyfWB9fCR7cGBvXFx7W15cXH1dKlxcfT9gfXwke3BgXFxkezEsM31gfWAseT0vWz8qK11bPytdP3xcXHsoPzpcXGQrKD86LFxcZCopP3wsXFxkKylcXH1cXD8/LyxDPW5ldyBSZWdFeHAocGBcbiAgXFxcXCAoPzpcbiAgICAke2J9XG4gICAgfCBbZ2tdPFtePl0qPj9cbiAgICB8IFtna10nW14nXSonP1xuICAgIHwgLlxuICApXG4gIHwgXFwoICg/OlxuICAgIFxcPyAoPzpcbiAgICAgIFs6PSE+KHtdXG4gICAgICB8IDxbPSFdXG4gICAgICB8IDxbXj5dKj5cbiAgICAgIHwgJ1teJ10qJ1xuICAgICAgfCB+XFx8P1xuICAgICAgfCAjKD86W14pXFxcXF18XFxcXC4/KSpcbiAgICAgIHwgW146KV0qWzopXVxuICAgICk/XG4gICAgfCBcXCpbXlxcKV0qXFwpP1xuICApP1xuICB8ICg/OiR7eS5zb3VyY2V9KStcbiAgfCAke219XG4gIHwgLlxuYC5yZXBsYWNlKC9cXHMrL2csXCJcIiksXCJnc3VcIiksVD1uZXcgUmVnRXhwKHBgXG4gIFxcXFwgKD86XG4gICAgJHtifVxuICAgIHwgLlxuICApXG4gIHwgXFxbOig/OlxcXj9cXHB7QWxwaGF9K3xcXF4pOlxcXVxuICB8ICR7bX1cbiAgfCAmJlxuICB8IC5cbmAucmVwbGFjZSgvXFxzKy9nLFwiXCIpLFwiZ3N1XCIpO2Z1bmN0aW9uIE0oZSxuPXt9KXtjb25zdCB0PXtmbGFnczpcIlwiLC4uLm4scnVsZXM6e2NhcHR1cmVHcm91cDohMSxzaW5nbGVsaW5lOiExLC4uLm4ucnVsZXN9fTtpZih0eXBlb2YgZSE9XCJzdHJpbmdcIil0aHJvdyBuZXcgRXJyb3IoXCJTdHJpbmcgZXhwZWN0ZWQgYXMgcGF0dGVyblwiKTtjb25zdCBvPVkodC5mbGFncykscz1bby5leHRlbmRlZF0sYT17Y2FwdHVyZUdyb3VwOnQucnVsZXMuY2FwdHVyZUdyb3VwLGdldEN1cnJlbnRNb2RYKCl7cmV0dXJuIHMuYXQoLTEpfSxudW1PcGVuR3JvdXBzOjAscG9wTW9kWCgpe3MucG9wKCl9LHB1c2hNb2RYKHUpe3MucHVzaCh1KX0scmVwbGFjZUN1cnJlbnRNb2RYKHUpe3Nbcy5sZW5ndGgtMV09dX0sc2luZ2xlbGluZTp0LnJ1bGVzLnNpbmdsZWxpbmV9O2xldCByPVtdLGk7Zm9yKEMubGFzdEluZGV4PTA7aT1DLmV4ZWMoZSk7KXtjb25zdCB1PUYoYSxlLGlbMF0sQy5sYXN0SW5kZXgpO3UudG9rZW5zP3IucHVzaCguLi51LnRva2Vucyk6dS50b2tlbiYmci5wdXNoKHUudG9rZW4pLHUubGFzdEluZGV4IT09dm9pZCAwJiYoQy5sYXN0SW5kZXg9dS5sYXN0SW5kZXgpfWNvbnN0IGw9W107bGV0IGM9MDtyLmZpbHRlcih1PT51LnR5cGU9PT1cIkdyb3VwT3BlblwiKS5mb3JFYWNoKHU9Pnt1LmtpbmQ9PT1cImNhcHR1cmluZ1wiP3UubnVtYmVyPSsrYzp1LnJhdz09PVwiKFwiJiZsLnB1c2godSl9KSxjfHxsLmZvckVhY2goKHUsUyk9Pnt1LmtpbmQ9XCJjYXB0dXJpbmdcIix1Lm51bWJlcj1TKzF9KTtjb25zdCBnPWN8fGwubGVuZ3RoO3JldHVybnt0b2tlbnM6ci5tYXAodT0+dS50eXBlPT09XCJFc2NhcGVkTnVtYmVyXCI/ZWUodSxnKTp1KS5mbGF0KCksZmxhZ3M6b319ZnVuY3Rpb24gRihlLG4sdCxvKXtjb25zdFtzLGFdPXQ7aWYodD09PVwiW1wifHx0PT09XCJbXlwiKXtjb25zdCByPUsobix0LG8pO3JldHVybnt0b2tlbnM6ci50b2tlbnMsbGFzdEluZGV4OnIubGFzdEluZGV4fX1pZihzPT09XCJcXFxcXCIpe2lmKFwiQWJCR3lZelpcIi5pbmNsdWRlcyhhKSlyZXR1cm57dG9rZW46dyh0LHQpfTtpZigvXlxcXFxnWzwnXS8udGVzdCh0KSl7aWYoIS9eXFxcXGcoPzo8W14+XSs+fCdbXiddKycpJC8udGVzdCh0KSl0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgZ3JvdXAgbmFtZSBcIiR7dH1cImApO3JldHVybnt0b2tlbjpSKHQpfX1pZigvXlxcXFxrWzwnXS8udGVzdCh0KSl7aWYoIS9eXFxcXGsoPzo8W14+XSs+fCdbXiddKycpJC8udGVzdCh0KSl0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgZ3JvdXAgbmFtZSBcIiR7dH1cImApO3JldHVybnt0b2tlbjpBKHQpfX1pZihhPT09XCJLXCIpcmV0dXJue3Rva2VuOkkoXCJrZWVwXCIsdCl9O2lmKGE9PT1cIk5cInx8YT09PVwiUlwiKXJldHVybnt0b2tlbjprKFwibmV3bGluZVwiLHQse25lZ2F0ZTphPT09XCJOXCJ9KX07aWYoYT09PVwiT1wiKXJldHVybnt0b2tlbjprKFwiYW55XCIsdCl9O2lmKGE9PT1cIlhcIilyZXR1cm57dG9rZW46ayhcInRleHRfc2VnbWVudFwiLHQpfTtjb25zdCByPXgodCx7aW5DaGFyQ2xhc3M6ITF9KTtyZXR1cm4gQXJyYXkuaXNBcnJheShyKT97dG9rZW5zOnJ9Ont0b2tlbjpyfX1pZihzPT09XCIoXCIpe2lmKGE9PT1cIipcIilyZXR1cm57dG9rZW46aih0KX07aWYodD09PVwiKD97XCIpdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBjYWxsb3V0IFwiJHt0fVwiYCk7aWYodC5zdGFydHNXaXRoKFwiKD8jXCIpKXtpZihuW29dIT09XCIpXCIpdGhyb3cgbmV3IEVycm9yKCdVbmNsb3NlZCBjb21tZW50IGdyb3VwIFwiKD8jXCInKTtyZXR1cm57bGFzdEluZGV4Om8rMX19aWYoL15cXChcXD9bLWlteF0rWzopXSQvLnRlc3QodCkpcmV0dXJue3Rva2VuOkwodCxlKX07aWYoZS5wdXNoTW9kWChlLmdldEN1cnJlbnRNb2RYKCkpLGUubnVtT3Blbkdyb3VwcysrLHQ9PT1cIihcIiYmIWUuY2FwdHVyZUdyb3VwfHx0PT09XCIoPzpcIilyZXR1cm57dG9rZW46ZihcImdyb3VwXCIsdCl9O2lmKHQ9PT1cIig/PlwiKXJldHVybnt0b2tlbjpmKFwiYXRvbWljXCIsdCl9O2lmKHQ9PT1cIig/PVwifHx0PT09XCIoPyFcInx8dD09PVwiKD88PVwifHx0PT09XCIoPzwhXCIpcmV0dXJue3Rva2VuOmYodFsyXT09PVwiPFwiP1wibG9va2JlaGluZFwiOlwibG9va2FoZWFkXCIsdCx7bmVnYXRlOnQuZW5kc1dpdGgoXCIhXCIpfSl9O2lmKHQ9PT1cIihcIiYmZS5jYXB0dXJlR3JvdXB8fHQuc3RhcnRzV2l0aChcIig/PFwiKSYmdC5lbmRzV2l0aChcIj5cIil8fHQuc3RhcnRzV2l0aChcIig/J1wiKSYmdC5lbmRzV2l0aChcIidcIikpcmV0dXJue3Rva2VuOmYoXCJjYXB0dXJpbmdcIix0LHsuLi50IT09XCIoXCImJntuYW1lOnQuc2xpY2UoMywtMSl9fSl9O2lmKHQuc3RhcnRzV2l0aChcIig/flwiKSl7aWYodD09PVwiKD9+fFwiKXRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgYWJzZW5jZSBmdW5jdGlvbiBraW5kIFwiJHt0fVwiYCk7cmV0dXJue3Rva2VuOmYoXCJhYnNlbmNlX3JlcGVhdGVyXCIsdCl9fXRocm93IHQ9PT1cIig/KFwiP25ldyBFcnJvcihgVW5zdXBwb3J0ZWQgY29uZGl0aW9uYWwgXCIke3R9XCJgKTpuZXcgRXJyb3IoYEludmFsaWQgb3IgdW5zdXBwb3J0ZWQgZ3JvdXAgb3B0aW9uIFwiJHt0fVwiYCl9aWYodD09PVwiKVwiKXtpZihlLnBvcE1vZFgoKSxlLm51bU9wZW5Hcm91cHMtLSxlLm51bU9wZW5Hcm91cHM8MCl0aHJvdyBuZXcgRXJyb3IoJ1VubWF0Y2hlZCBcIilcIicpO3JldHVybnt0b2tlbjpRKHQpfX1pZihlLmdldEN1cnJlbnRNb2RYKCkpe2lmKHQ9PT1cIiNcIil7Y29uc3Qgcj1uLmluZGV4T2YoYFxuYCxvKTtyZXR1cm57bGFzdEluZGV4OnI9PT0tMT9uLmxlbmd0aDpyfX1pZigvXlxccyQvLnRlc3QodCkpe2NvbnN0IHI9L1xccysveTtyZXR1cm4gci5sYXN0SW5kZXg9byx7bGFzdEluZGV4OnIuZXhlYyhuKT9yLmxhc3RJbmRleDpvfX19aWYodD09PVwiLlwiKXJldHVybnt0b2tlbjprKFwiZG90XCIsdCl9O2lmKHQ9PT1cIl5cInx8dD09PVwiJFwiKXtjb25zdCByPWUuc2luZ2xlbGluZT97XCJeXCI6cGBcXEFgLCQ6cGBcXFpgfVt0XTp0O3JldHVybnt0b2tlbjp3KHIsdCl9fXJldHVybiB0PT09XCJ8XCI/e3Rva2VuOlAodCl9OnkudGVzdCh0KT97dG9rZW5zOnRlKHQpfTp7dG9rZW46ZChoKHQpLHQpfX1mdW5jdGlvbiBLKGUsbix0KXtjb25zdCBvPVtFKG5bMV09PT1cIl5cIixuKV07bGV0IHM9MSxhO2ZvcihULmxhc3RJbmRleD10O2E9VC5leGVjKGUpOyl7Y29uc3Qgcj1hWzBdO2lmKHJbMF09PT1cIltcIiYmclsxXSE9PVwiOlwiKXMrKyxvLnB1c2goRShyWzFdPT09XCJeXCIscikpO2Vsc2UgaWYocj09PVwiXVwiKXtpZihvLmF0KC0xKS50eXBlPT09XCJDaGFyYWN0ZXJDbGFzc09wZW5cIilvLnB1c2goZCg5MyxyKSk7ZWxzZSBpZihzLS0sby5wdXNoKHoocikpLCFzKWJyZWFrfWVsc2V7Y29uc3QgaT1YKHIpO0FycmF5LmlzQXJyYXkoaSk/by5wdXNoKC4uLmkpOm8ucHVzaChpKX19cmV0dXJue3Rva2VuczpvLGxhc3RJbmRleDpULmxhc3RJbmRleHx8ZS5sZW5ndGh9fWZ1bmN0aW9uIFgoZSl7aWYoZVswXT09PVwiXFxcXFwiKXJldHVybiB4KGUse2luQ2hhckNsYXNzOiEwfSk7aWYoZVswXT09PVwiW1wiKXtjb25zdCBuPS9cXFs6KD88bmVnYXRlPlxcXj8pKD88bmFtZT5bYS16XSspOlxcXS8uZXhlYyhlKTtpZighbnx8IUcuaGFzKG4uZ3JvdXBzLm5hbWUpKXRocm93IG5ldyBFcnJvcihgSW52YWxpZCBQT1NJWCBjbGFzcyBcIiR7ZX1cImApO3JldHVybiBrKFwicG9zaXhcIixlLHt2YWx1ZTpuLmdyb3Vwcy5uYW1lLG5lZ2F0ZTohIW4uZ3JvdXBzLm5lZ2F0ZX0pfXJldHVybiBlPT09XCItXCI/VShlKTplPT09XCImJlwiP0goZSk6ZChoKGUpLGUpfWZ1bmN0aW9uIHgoZSx7aW5DaGFyQ2xhc3M6bn0pe2NvbnN0IHQ9ZVsxXTtpZih0PT09XCJjXCJ8fHQ9PT1cIkNcIilyZXR1cm4gWihlKTtpZihcImREaEhzU3dXXCIuaW5jbHVkZXModCkpcmV0dXJuIHEoZSk7aWYoZS5zdGFydHNXaXRoKHBgXFxve2ApKXRocm93IG5ldyBFcnJvcihgSW5jb21wbGV0ZSwgaW52YWxpZCwgb3IgdW5zdXBwb3J0ZWQgb2N0YWwgY29kZSBwb2ludCBcIiR7ZX1cImApO2lmKC9eXFxcXFtwUF1cXHsvLnRlc3QoZSkpe2lmKGUubGVuZ3RoPT09Myl0aHJvdyBuZXcgRXJyb3IoYEluY29tcGxldGUgb3IgaW52YWxpZCBVbmljb2RlIHByb3BlcnR5IFwiJHtlfVwiYCk7cmV0dXJuIFYoZSl9aWYoL15cXFxceFs4OUEtRmEtZl1cXHB7QUhleH0vdS50ZXN0KGUpKXRyeXtjb25zdCBvPWUuc3BsaXQoL1xcXFx4Lykuc2xpY2UoMSkubWFwKGk9PnBhcnNlSW50KGksMTYpKSxzPW5ldyBUZXh0RGVjb2RlcihcInV0Zi04XCIse2lnbm9yZUJPTTohMCxmYXRhbDohMH0pLmRlY29kZShuZXcgVWludDhBcnJheShvKSksYT1uZXcgVGV4dEVuY29kZXI7cmV0dXJuWy4uLnNdLm1hcChpPT57Y29uc3QgbD1bLi4uYS5lbmNvZGUoaSldLm1hcChjPT5gXFxcXHgke2MudG9TdHJpbmcoMTYpfWApLmpvaW4oXCJcIik7cmV0dXJuIGQoaChpKSxsKX0pfWNhdGNoe3Rocm93IG5ldyBFcnJvcihgTXVsdGlieXRlIGNvZGUgXCIke2V9XCIgaW5jb21wbGV0ZSBvciBpbnZhbGlkIGluIE9uaWd1cnVtYWApfWlmKHQ9PT1cInVcInx8dD09PVwieFwiKXJldHVybiBkKEooZSksZSk7aWYoJC5oYXModCkpcmV0dXJuIGQoJC5nZXQodCksZSk7aWYoL1xcZC8udGVzdCh0KSlyZXR1cm4gVyhuLGUpO2lmKGU9PT1cIlxcXFxcIil0aHJvdyBuZXcgRXJyb3IocGBJbmNvbXBsZXRlIGVzY2FwZSBcIlxcXCJgKTtpZih0PT09XCJNXCIpdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBtZXRhIFwiJHtlfVwiYCk7aWYoWy4uLmVdLmxlbmd0aD09PTIpcmV0dXJuIGQoZS5jb2RlUG9pbnRBdCgxKSxlKTt0aHJvdyBuZXcgRXJyb3IoYFVuZXhwZWN0ZWQgZXNjYXBlIFwiJHtlfVwiYCl9ZnVuY3Rpb24gUChlKXtyZXR1cm57dHlwZTpcIkFsdGVybmF0b3JcIixyYXc6ZX19ZnVuY3Rpb24gdyhlLG4pe3JldHVybnt0eXBlOlwiQXNzZXJ0aW9uXCIsa2luZDplLHJhdzpufX1mdW5jdGlvbiBBKGUpe3JldHVybnt0eXBlOlwiQmFja3JlZmVyZW5jZVwiLHJhdzplfX1mdW5jdGlvbiBkKGUsbil7cmV0dXJue3R5cGU6XCJDaGFyYWN0ZXJcIix2YWx1ZTplLHJhdzpufX1mdW5jdGlvbiB6KGUpe3JldHVybnt0eXBlOlwiQ2hhcmFjdGVyQ2xhc3NDbG9zZVwiLHJhdzplfX1mdW5jdGlvbiBVKGUpe3JldHVybnt0eXBlOlwiQ2hhcmFjdGVyQ2xhc3NIeXBoZW5cIixyYXc6ZX19ZnVuY3Rpb24gSChlKXtyZXR1cm57dHlwZTpcIkNoYXJhY3RlckNsYXNzSW50ZXJzZWN0b3JcIixyYXc6ZX19ZnVuY3Rpb24gRShlLG4pe3JldHVybnt0eXBlOlwiQ2hhcmFjdGVyQ2xhc3NPcGVuXCIsbmVnYXRlOmUscmF3Om59fWZ1bmN0aW9uIGsoZSxuLHQ9e30pe3JldHVybnt0eXBlOlwiQ2hhcmFjdGVyU2V0XCIsa2luZDplLC4uLnQscmF3Om59fWZ1bmN0aW9uIEkoZSxuLHQ9e30pe3JldHVybiBlPT09XCJrZWVwXCI/e3R5cGU6XCJEaXJlY3RpdmVcIixraW5kOmUscmF3Om59Ont0eXBlOlwiRGlyZWN0aXZlXCIsa2luZDplLGZsYWdzOk4odC5mbGFncykscmF3Om59fWZ1bmN0aW9uIFcoZSxuKXtyZXR1cm57dHlwZTpcIkVzY2FwZWROdW1iZXJcIixpbkNoYXJDbGFzczplLHJhdzpufX1mdW5jdGlvbiBRKGUpe3JldHVybnt0eXBlOlwiR3JvdXBDbG9zZVwiLHJhdzplfX1mdW5jdGlvbiBmKGUsbix0PXt9KXtyZXR1cm57dHlwZTpcIkdyb3VwT3BlblwiLGtpbmQ6ZSwuLi50LHJhdzpufX1mdW5jdGlvbiBEKGUsbix0LG8pe3JldHVybnt0eXBlOlwiTmFtZWRDYWxsb3V0XCIsa2luZDplLHRhZzpuLGFyZ3VtZW50czp0LHJhdzpvfX1mdW5jdGlvbiBfKGUsbix0LG8pe3JldHVybnt0eXBlOlwiUXVhbnRpZmllclwiLGtpbmQ6ZSxtaW46bixtYXg6dCxyYXc6b319ZnVuY3Rpb24gUihlKXtyZXR1cm57dHlwZTpcIlN1YnJvdXRpbmVcIixyYXc6ZX19Y29uc3QgQj1uZXcgU2V0KFtcIkNPVU5UXCIsXCJDTVBcIixcIkVSUk9SXCIsXCJGQUlMXCIsXCJNQVhcIixcIk1JU01BVENIXCIsXCJTS0lQXCIsXCJUT1RBTF9DT1VOVFwiXSksJD1uZXcgTWFwKFtbXCJhXCIsN10sW1wiYlwiLDhdLFtcImVcIiwyN10sW1wiZlwiLDEyXSxbXCJuXCIsMTBdLFtcInJcIiwxM10sW1widFwiLDldLFtcInZcIiwxMV1dKTtmdW5jdGlvbiBaKGUpe2NvbnN0IG49ZVsxXT09PVwiY1wiP2VbMl06ZVszXTtpZighbnx8IS9bQS1aYS16XS8udGVzdChuKSl0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIGNvbnRyb2wgY2hhcmFjdGVyIFwiJHtlfVwiYCk7cmV0dXJuIGQoaChuLnRvVXBwZXJDYXNlKCkpLTY0LGUpfWZ1bmN0aW9uIEwoZSxuKXtsZXR7b246dCxvZmY6b309L15cXChcXD8oPzxvbj5baW14XSopKD86LSg/PG9mZj5bLWlteF0qKSk/Ly5leGVjKGUpLmdyb3VwcztvPz89XCJcIjtjb25zdCBzPShuLmdldEN1cnJlbnRNb2RYKCl8fHQuaW5jbHVkZXMoXCJ4XCIpKSYmIW8uaW5jbHVkZXMoXCJ4XCIpLGE9dih0KSxyPXYobyksaT17fTtpZihhJiYoaS5lbmFibGU9YSksciYmKGkuZGlzYWJsZT1yKSxlLmVuZHNXaXRoKFwiKVwiKSlyZXR1cm4gbi5yZXBsYWNlQ3VycmVudE1vZFgocyksSShcImZsYWdzXCIsZSx7ZmxhZ3M6aX0pO2lmKGUuZW5kc1dpdGgoXCI6XCIpKXJldHVybiBuLnB1c2hNb2RYKHMpLG4ubnVtT3Blbkdyb3VwcysrLGYoXCJncm91cFwiLGUsey4uLihhfHxyKSYme2ZsYWdzOml9fSk7dGhyb3cgbmV3IEVycm9yKGBVbmV4cGVjdGVkIGZsYWcgbW9kaWZpZXIgXCIke2V9XCJgKX1mdW5jdGlvbiBqKGUpe2NvbnN0IG49L1xcKFxcKig/PG5hbWU+W0EtWmEtel9dXFx3Kik/KD86XFxbKD88dGFnPig/OltBLVphLXpfXVxcdyopPylcXF0pPyg/Olxceyg/PGFyZ3M+W159XSopXFx9KT9cXCkvLmV4ZWMoZSk7aWYoIW4pdGhyb3cgbmV3IEVycm9yKGBJbmNvbXBsZXRlIG9yIGludmFsaWQgbmFtZWQgY2FsbG91dCBcIiR7ZX1cImApO2NvbnN0e25hbWU6dCx0YWc6byxhcmdzOnN9PW4uZ3JvdXBzO2lmKCF0KXRocm93IG5ldyBFcnJvcihgSW52YWxpZCBuYW1lZCBjYWxsb3V0IFwiJHtlfVwiYCk7aWYobz09PVwiXCIpdGhyb3cgbmV3IEVycm9yKGBOYW1lZCBjYWxsb3V0IHRhZyB3aXRoIGVtcHR5IHZhbHVlIG5vdCBhbGxvd2VkIFwiJHtlfVwiYCk7Y29uc3QgYT1zP3Muc3BsaXQoXCIsXCIpLmZpbHRlcihnPT5nIT09XCJcIikubWFwKGc9Pi9eWystXT9cXGQrJC8udGVzdChnKT8rZzpnKTpbXSxbcixpLGxdPWEsYz1CLmhhcyh0KT90LnRvTG93ZXJDYXNlKCk6XCJjdXN0b21cIjtzd2l0Y2goYyl7Y2FzZVwiZmFpbFwiOmNhc2VcIm1pc21hdGNoXCI6Y2FzZVwic2tpcFwiOmlmKGEubGVuZ3RoPjApdGhyb3cgbmV3IEVycm9yKGBOYW1lZCBjYWxsb3V0IGFyZ3VtZW50cyBub3QgYWxsb3dlZCBcIiR7YX1cImApO2JyZWFrO2Nhc2VcImVycm9yXCI6aWYoYS5sZW5ndGg+MSl0aHJvdyBuZXcgRXJyb3IoYE5hbWVkIGNhbGxvdXQgYWxsb3dzIG9ubHkgb25lIGFyZ3VtZW50IFwiJHthfVwiYCk7aWYodHlwZW9mIHI9PVwic3RyaW5nXCIpdGhyb3cgbmV3IEVycm9yKGBOYW1lZCBjYWxsb3V0IGFyZ3VtZW50IG11c3QgYmUgYSBudW1iZXIgXCIke3J9XCJgKTticmVhaztjYXNlXCJtYXhcIjppZighYS5sZW5ndGh8fGEubGVuZ3RoPjIpdGhyb3cgbmV3IEVycm9yKGBOYW1lZCBjYWxsb3V0IG11c3QgaGF2ZSBvbmUgb3IgdHdvIGFyZ3VtZW50cyBcIiR7YX1cImApO2lmKHR5cGVvZiByPT1cInN0cmluZ1wiJiYhL15bQS1aYS16X11cXHcqJC8udGVzdChyKSl0aHJvdyBuZXcgRXJyb3IoYE5hbWVkIGNhbGxvdXQgYXJndW1lbnQgb25lIG11c3QgYmUgYSB0YWcgb3IgbnVtYmVyIFwiJHtyfVwiYCk7aWYoYS5sZW5ndGg9PT0yJiYodHlwZW9mIGk9PVwibnVtYmVyXCJ8fCEvXls8PlhdJC8udGVzdChpKSkpdGhyb3cgbmV3IEVycm9yKGBOYW1lZCBjYWxsb3V0IG9wdGlvbmFsIGFyZ3VtZW50IHR3byBtdXN0IGJlICc8JywgJz4nLCBvciAnWCcgXCIke2l9XCJgKTticmVhaztjYXNlXCJjb3VudFwiOmNhc2VcInRvdGFsX2NvdW50XCI6aWYoYS5sZW5ndGg+MSl0aHJvdyBuZXcgRXJyb3IoYE5hbWVkIGNhbGxvdXQgYWxsb3dzIG9ubHkgb25lIGFyZ3VtZW50IFwiJHthfVwiYCk7aWYoYS5sZW5ndGg9PT0xJiYodHlwZW9mIHI9PVwibnVtYmVyXCJ8fCEvXls8PlhdJC8udGVzdChyKSkpdGhyb3cgbmV3IEVycm9yKGBOYW1lZCBjYWxsb3V0IG9wdGlvbmFsIGFyZ3VtZW50IG11c3QgYmUgJzwnLCAnPicsIG9yICdYJyBcIiR7cn1cImApO2JyZWFrO2Nhc2VcImNtcFwiOmlmKGEubGVuZ3RoIT09Myl0aHJvdyBuZXcgRXJyb3IoYE5hbWVkIGNhbGxvdXQgbXVzdCBoYXZlIHRocmVlIGFyZ3VtZW50cyBcIiR7YX1cImApO2lmKHR5cGVvZiByPT1cInN0cmluZ1wiJiYhL15bQS1aYS16X11cXHcqJC8udGVzdChyKSl0aHJvdyBuZXcgRXJyb3IoYE5hbWVkIGNhbGxvdXQgYXJndW1lbnQgb25lIG11c3QgYmUgYSB0YWcgb3IgbnVtYmVyIFwiJHtyfVwiYCk7aWYodHlwZW9mIGk9PVwibnVtYmVyXCJ8fCEvXig/Ols8PiE9XT18Wzw+XSkkLy50ZXN0KGkpKXRocm93IG5ldyBFcnJvcihgTmFtZWQgY2FsbG91dCBhcmd1bWVudCB0d28gbXVzdCBiZSAnPT0nLCAnIT0nLCAnPicsICc8JywgJz49Jywgb3IgJzw9JyBcIiR7aX1cImApO2lmKHR5cGVvZiBsPT1cInN0cmluZ1wiJiYhL15bQS1aYS16X11cXHcqJC8udGVzdChsKSl0aHJvdyBuZXcgRXJyb3IoYE5hbWVkIGNhbGxvdXQgYXJndW1lbnQgdGhyZWUgbXVzdCBiZSBhIHRhZyBvciBudW1iZXIgXCIke2x9XCJgKTticmVhaztjYXNlXCJjdXN0b21cIjp0aHJvdyBuZXcgRXJyb3IoYFVuZGVmaW5lZCBjYWxsb3V0IG5hbWUgXCIke3R9XCJgKTtkZWZhdWx0OnRocm93IG5ldyBFcnJvcihgVW5leHBlY3RlZCBuYW1lZCBjYWxsb3V0IGtpbmQgXCIke2N9XCJgKX1yZXR1cm4gRChjLG8/P251bGwscz8uc3BsaXQoXCIsXCIpPz9udWxsLGUpfWZ1bmN0aW9uIE8oZSl7bGV0IG49bnVsbCx0LG87aWYoZVswXT09PVwie1wiKXtjb25zdHttaW5TdHI6cyxtYXhTdHI6YX09L15cXHsoPzxtaW5TdHI+XFxkKikoPzosKD88bWF4U3RyPlxcZCopKT8vLmV4ZWMoZSkuZ3JvdXBzLHI9MWU1O2lmKCtzPnJ8fGEmJithPnIpdGhyb3cgbmV3IEVycm9yKFwiUXVhbnRpZmllciB2YWx1ZSB1bnN1cHBvcnRlZCBpbiBPbmlndXJ1bWFcIik7aWYodD0rcyxvPWE9PT12b2lkIDA/K3M6YT09PVwiXCI/MS8wOithLHQ+byYmKG49XCJwb3NzZXNzaXZlXCIsW3Qsb109W28sdF0pLGUuZW5kc1dpdGgoXCI/XCIpKXtpZihuPT09XCJwb3NzZXNzaXZlXCIpdGhyb3cgbmV3IEVycm9yKCdVbnN1cHBvcnRlZCBwb3NzZXNzaXZlIGludGVydmFsIHF1YW50aWZpZXIgY2hhaW4gd2l0aCBcIj9cIicpO249XCJsYXp5XCJ9ZWxzZSBufHwobj1cImdyZWVkeVwiKX1lbHNlIHQ9ZVswXT09PVwiK1wiPzE6MCxvPWVbMF09PT1cIj9cIj8xOjEvMCxuPWVbMV09PT1cIitcIj9cInBvc3Nlc3NpdmVcIjplWzFdPT09XCI/XCI/XCJsYXp5XCI6XCJncmVlZHlcIjtyZXR1cm4gXyhuLHQsbyxlKX1mdW5jdGlvbiBxKGUpe2NvbnN0IG49ZVsxXS50b0xvd2VyQ2FzZSgpO3JldHVybiBrKHtkOlwiZGlnaXRcIixoOlwiaGV4XCIsczpcInNwYWNlXCIsdzpcIndvcmRcIn1bbl0sZSx7bmVnYXRlOmVbMV0hPT1ufSl9ZnVuY3Rpb24gVihlKXtjb25zdHtwOm4sbmVnOnQsdmFsdWU6b309L15cXFxcKD88cD5bcFBdKVxceyg/PG5lZz5cXF4/KSg/PHZhbHVlPltefV0rKS8uZXhlYyhlKS5ncm91cHM7cmV0dXJuIGsoXCJwcm9wZXJ0eVwiLGUse3ZhbHVlOm8sbmVnYXRlOm49PT1cIlBcIiYmIXR8fG49PT1cInBcIiYmISF0fSl9ZnVuY3Rpb24gdihlKXtjb25zdCBuPXt9O3JldHVybiBlLmluY2x1ZGVzKFwiaVwiKSYmKG4uaWdub3JlQ2FzZT0hMCksZS5pbmNsdWRlcyhcIm1cIikmJihuLmRvdEFsbD0hMCksZS5pbmNsdWRlcyhcInhcIikmJihuLmV4dGVuZGVkPSEwKSxPYmplY3Qua2V5cyhuKS5sZW5ndGg/bjpudWxsfWZ1bmN0aW9uIFkoZSl7Y29uc3Qgbj17aWdub3JlQ2FzZTohMSxkb3RBbGw6ITEsZXh0ZW5kZWQ6ITEsZGlnaXRJc0FzY2lpOiExLHBvc2l4SXNBc2NpaTohMSxzcGFjZUlzQXNjaWk6ITEsd29yZElzQXNjaWk6ITEsdGV4dFNlZ21lbnRNb2RlOm51bGx9O2ZvcihsZXQgdD0wO3Q8ZS5sZW5ndGg7dCsrKXtjb25zdCBvPWVbdF07aWYoIVwiaW14RFBTV3lcIi5pbmNsdWRlcyhvKSl0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgZmxhZyBcIiR7b31cImApO2lmKG89PT1cInlcIil7aWYoIS9eeXtbZ3ddfS8udGVzdChlLnNsaWNlKHQpKSl0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgb3IgdW5zcGVjaWZpZWQgZmxhZyBcInlcIiBtb2RlJyk7bi50ZXh0U2VnbWVudE1vZGU9ZVt0KzJdPT09XCJnXCI/XCJncmFwaGVtZVwiOlwid29yZFwiLHQrPTM7Y29udGludWV9blt7aTpcImlnbm9yZUNhc2VcIixtOlwiZG90QWxsXCIseDpcImV4dGVuZGVkXCIsRDpcImRpZ2l0SXNBc2NpaVwiLFA6XCJwb3NpeElzQXNjaWlcIixTOlwic3BhY2VJc0FzY2lpXCIsVzpcIndvcmRJc0FzY2lpXCJ9W29dXT0hMH1yZXR1cm4gbn1mdW5jdGlvbiBKKGUpe2lmKC9eKD86XFxcXHUoPyFcXHB7QUhleH17NH0pfFxcXFx4KD8hXFxwe0FIZXh9ezEsMn18XFx7XFxwe0FIZXh9ezEsOH1cXH0pKS91LnRlc3QoZSkpdGhyb3cgbmV3IEVycm9yKGBJbmNvbXBsZXRlIG9yIGludmFsaWQgZXNjYXBlIFwiJHtlfVwiYCk7Y29uc3Qgbj1lWzJdPT09XCJ7XCI/L15cXFxceFxce1xccyooPzxoZXg+XFxwe0FIZXh9KykvdS5leGVjKGUpLmdyb3Vwcy5oZXg6ZS5zbGljZSgyKTtyZXR1cm4gcGFyc2VJbnQobiwxNil9ZnVuY3Rpb24gZWUoZSxuKXtjb25zdHtyYXc6dCxpbkNoYXJDbGFzczpvfT1lLHM9dC5zbGljZSgxKTtpZighbyYmKHMhPT1cIjBcIiYmcy5sZW5ndGg9PT0xfHxzWzBdIT09XCIwXCImJitzPD1uKSlyZXR1cm5bQSh0KV07Y29uc3QgYT1bXSxyPXMubWF0Y2goL15bMC03XSt8XFxkL2cpO2ZvcihsZXQgaT0wO2k8ci5sZW5ndGg7aSsrKXtjb25zdCBsPXJbaV07bGV0IGM7aWYoaT09PTAmJmwhPT1cIjhcIiYmbCE9PVwiOVwiKXtpZihjPXBhcnNlSW50KGwsOCksYz4xMjcpdGhyb3cgbmV3IEVycm9yKHBgT2N0YWwgZW5jb2RlZCBieXRlIGFib3ZlIDE3NyB1bnN1cHBvcnRlZCBcIiR7dH1cImApfWVsc2UgYz1oKGwpO2EucHVzaChkKGMsKGk9PT0wP1wiXFxcXFwiOlwiXCIpK2wpKX1yZXR1cm4gYX1mdW5jdGlvbiB0ZShlKXtjb25zdCBuPVtdLHQ9bmV3IFJlZ0V4cCh5LFwiZ3lcIik7bGV0IG87Zm9yKDtvPXQuZXhlYyhlKTspe2NvbnN0IHM9b1swXTtpZihzWzBdPT09XCJ7XCIpe2NvbnN0IGE9L15cXHsoPzxtaW4+XFxkKyksKD88bWF4PlxcZCspXFx9XFw/PyQvLmV4ZWMocyk7aWYoYSl7Y29uc3R7bWluOnIsbWF4Oml9PWEuZ3JvdXBzO2lmKCtyPitpJiZzLmVuZHNXaXRoKFwiP1wiKSl7dC5sYXN0SW5kZXgtLSxuLnB1c2goTyhzLnNsaWNlKDAsLTEpKSk7Y29udGludWV9fX1uLnB1c2goTyhzKSl9cmV0dXJuIG59ZXhwb3J0e00gYXMgdG9rZW5pemV9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dG9rZW5pemUuanMubWFwXG4iLAogICAgIlwidXNlIHN0cmljdFwiO2Z1bmN0aW9uIG8oZSx0KXtpZighQXJyYXkuaXNBcnJheShlLmJvZHkpKXRocm93IG5ldyBFcnJvcihcIkV4cGVjdGVkIG5vZGUgd2l0aCBib2R5IGFycmF5XCIpO2lmKGUuYm9keS5sZW5ndGghPT0xKXJldHVybiExO2NvbnN0IHI9ZS5ib2R5WzBdO3JldHVybiF0fHxPYmplY3Qua2V5cyh0KS5ldmVyeShuPT50W25dPT09cltuXSl9ZnVuY3Rpb24gYShlKXtyZXR1cm4hKCFpLmhhcyhlLnR5cGUpfHxlLnR5cGU9PT1cIkFic2VuY2VGdW5jdGlvblwiJiZlLmtpbmQhPT1cInJlcGVhdGVyXCIpfWNvbnN0IGk9bmV3IFNldChbXCJBYnNlbmNlRnVuY3Rpb25cIixcIkNhcHR1cmluZ0dyb3VwXCIsXCJHcm91cFwiLFwiTG9va2Fyb3VuZEFzc2VydGlvblwiLFwiUmVnZXhcIl0pO2Z1bmN0aW9uIHMoZSl7cmV0dXJuIHkuaGFzKGUudHlwZSl9Y29uc3QgeT1uZXcgU2V0KFtcIkFic2VuY2VGdW5jdGlvblwiLFwiQmFja3JlZmVyZW5jZVwiLFwiQ2FwdHVyaW5nR3JvdXBcIixcIkNoYXJhY3RlclwiLFwiQ2hhcmFjdGVyQ2xhc3NcIixcIkNoYXJhY3RlclNldFwiLFwiR3JvdXBcIixcIlF1YW50aWZpZXJcIixcIlN1YnJvdXRpbmVcIl0pO2V4cG9ydHtvIGFzIGhhc09ubHlDaGlsZCxhIGFzIGlzQWx0ZXJuYXRpdmVDb250YWluZXIscyBhcyBpc1F1YW50aWZpYWJsZX07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1ub2RlLXV0aWxzLmpzLm1hcFxuIiwKICAgICJcInVzZSBzdHJpY3RcIjtpbXBvcnR7dG9rZW5pemUgYXMgcX1mcm9tXCIuLi90b2tlbml6ZXIvdG9rZW5pemUuanNcIjtpbXBvcnR7Y3BPZiBhcyBILGdldE9ySW5zZXJ0IGFzIFosUG9zaXhDbGFzc05hbWVzIGFzIHgsciBhcyB5LHRocm93SWZOdWxsaXNoIGFzIGd9ZnJvbVwiLi4vdXRpbHMuanNcIjtpbXBvcnR7aGFzT25seUNoaWxkIGFzIFksaXNBbHRlcm5hdGl2ZUNvbnRhaW5lciBhcyBqLGlzUXVhbnRpZmlhYmxlIGFzIFN9ZnJvbVwiLi9ub2RlLXV0aWxzLmpzXCI7ZnVuY3Rpb24gSihlLHI9e30pe2NvbnN0IG49e2ZsYWdzOlwiXCIsbm9ybWFsaXplVW5rbm93blByb3BlcnR5TmFtZXM6ITEsc2tpcEJhY2tyZWZWYWxpZGF0aW9uOiExLHNraXBMb29rYmVoaW5kVmFsaWRhdGlvbjohMSxza2lwUHJvcGVydHlOYW1lVmFsaWRhdGlvbjohMSx1bmljb2RlUHJvcGVydHlNYXA6bnVsbCwuLi5yLHJ1bGVzOntjYXB0dXJlR3JvdXA6ITEsc2luZ2xlbGluZTohMSwuLi5yLnJ1bGVzfX0sbz1xKGUse2ZsYWdzOm4uZmxhZ3MscnVsZXM6e2NhcHR1cmVHcm91cDpuLnJ1bGVzLmNhcHR1cmVHcm91cCxzaW5nbGVsaW5lOm4ucnVsZXMuc2luZ2xlbGluZX19KSxpPShwLE4pPT57Y29uc3QgdT1vLnRva2Vuc1t0Lm5leHRJbmRleF07c3dpdGNoKHQucGFyZW50PXAsdC5uZXh0SW5kZXgrKyx1LnR5cGUpe2Nhc2VcIkFsdGVybmF0b3JcIjpyZXR1cm4gYigpO2Nhc2VcIkFzc2VydGlvblwiOnJldHVybiBXKHUpO2Nhc2VcIkJhY2tyZWZlcmVuY2VcIjpyZXR1cm4gWCh1LHQpO2Nhc2VcIkNoYXJhY3RlclwiOnJldHVybiBtKHUudmFsdWUse3VzZUxhc3RWYWxpZDohIU4uaXNDaGVja2luZ1JhbmdlRW5kfSk7Y2FzZVwiQ2hhcmFjdGVyQ2xhc3NIeXBoZW5cIjpyZXR1cm4gZWUodSx0LE4pO2Nhc2VcIkNoYXJhY3RlckNsYXNzT3BlblwiOnJldHVybiByZSh1LHQsTik7Y2FzZVwiQ2hhcmFjdGVyU2V0XCI6cmV0dXJuIG5lKHUsdCk7Y2FzZVwiRGlyZWN0aXZlXCI6cmV0dXJuIEkodS5raW5kLHtmbGFnczp1LmZsYWdzfSk7Y2FzZVwiR3JvdXBPcGVuXCI6cmV0dXJuIHRlKHUsdCxOKTtjYXNlXCJOYW1lZENhbGxvdXRcIjpyZXR1cm4gVSh1LmtpbmQsdS50YWcsdS5hcmd1bWVudHMpO2Nhc2VcIlF1YW50aWZpZXJcIjpyZXR1cm4gb2UodSx0KTtjYXNlXCJTdWJyb3V0aW5lXCI6cmV0dXJuIGFlKHUsdCk7ZGVmYXVsdDp0aHJvdyBuZXcgRXJyb3IoYFVuZXhwZWN0ZWQgdG9rZW4gdHlwZSBcIiR7dS50eXBlfVwiYCl9fSx0PXtjYXB0dXJpbmdHcm91cHM6W10saGFzTnVtYmVyZWRSZWY6ITEsbmFtZWRHcm91cHNCeU5hbWU6bmV3IE1hcCxuZXh0SW5kZXg6MCxub3JtYWxpemVVbmtub3duUHJvcGVydHlOYW1lczpuLm5vcm1hbGl6ZVVua25vd25Qcm9wZXJ0eU5hbWVzLHBhcmVudDpudWxsLHNraXBCYWNrcmVmVmFsaWRhdGlvbjpuLnNraXBCYWNrcmVmVmFsaWRhdGlvbixza2lwTG9va2JlaGluZFZhbGlkYXRpb246bi5za2lwTG9va2JlaGluZFZhbGlkYXRpb24sc2tpcFByb3BlcnR5TmFtZVZhbGlkYXRpb246bi5za2lwUHJvcGVydHlOYW1lVmFsaWRhdGlvbixzdWJyb3V0aW5lczpbXSx0b2tlbnM6by50b2tlbnMsdW5pY29kZVByb3BlcnR5TWFwOm4udW5pY29kZVByb3BlcnR5TWFwLHdhbGs6aX0sZD1CKFQoby5mbGFncykpO2xldCBzPWQuYm9keVswXTtmb3IoO3QubmV4dEluZGV4PG8udG9rZW5zLmxlbmd0aDspe2NvbnN0IHA9aShzLHt9KTtwLnR5cGU9PT1cIkFsdGVybmF0aXZlXCI/KGQuYm9keS5wdXNoKHApLHM9cCk6cy5ib2R5LnB1c2gocCl9Y29uc3R7Y2FwdHVyaW5nR3JvdXBzOmEsaGFzTnVtYmVyZWRSZWY6bCxuYW1lZEdyb3Vwc0J5TmFtZTpjLHN1YnJvdXRpbmVzOmZ9PXQ7aWYobCYmYy5zaXplJiYhbi5ydWxlcy5jYXB0dXJlR3JvdXApdGhyb3cgbmV3IEVycm9yKFwiTnVtYmVyZWQgYmFja3JlZi9zdWJyb3V0aW5lIG5vdCBhbGxvd2VkIHdoZW4gdXNpbmcgbmFtZWQgY2FwdHVyZVwiKTtmb3IoY29uc3R7cmVmOnB9b2YgZilpZih0eXBlb2YgcD09XCJudW1iZXJcIil7aWYocD5hLmxlbmd0aCl0aHJvdyBuZXcgRXJyb3IoXCJTdWJyb3V0aW5lIHVzZXMgYSBncm91cCBudW1iZXIgdGhhdCdzIG5vdCBkZWZpbmVkXCIpO3AmJihhW3AtMV0uaXNTdWJyb3V0aW5lZD0hMCl9ZWxzZSBpZihjLmhhcyhwKSl7aWYoYy5nZXQocCkubGVuZ3RoPjEpdGhyb3cgbmV3IEVycm9yKHlgU3Vicm91dGluZSB1c2VzIGEgZHVwbGljYXRlIGdyb3VwIG5hbWUgXCJcXGc8JHtwfT5cImApO2MuZ2V0KHApWzBdLmlzU3Vicm91dGluZWQ9ITB9ZWxzZSB0aHJvdyBuZXcgRXJyb3IoeWBTdWJyb3V0aW5lIHVzZXMgYSBncm91cCBuYW1lIHRoYXQncyBub3QgZGVmaW5lZCBcIlxcZzwke3B9PlwiYCk7cmV0dXJuIGR9ZnVuY3Rpb24gVyh7a2luZDplfSl7cmV0dXJuIEYoZyh7XCJeXCI6XCJsaW5lX3N0YXJ0XCIsJDpcImxpbmVfZW5kXCIsXCJcXFxcQVwiOlwic3RyaW5nX3N0YXJ0XCIsXCJcXFxcYlwiOlwid29yZF9ib3VuZGFyeVwiLFwiXFxcXEJcIjpcIndvcmRfYm91bmRhcnlcIixcIlxcXFxHXCI6XCJzZWFyY2hfc3RhcnRcIixcIlxcXFx5XCI6XCJ0ZXh0X3NlZ21lbnRfYm91bmRhcnlcIixcIlxcXFxZXCI6XCJ0ZXh0X3NlZ21lbnRfYm91bmRhcnlcIixcIlxcXFx6XCI6XCJzdHJpbmdfZW5kXCIsXCJcXFxcWlwiOlwic3RyaW5nX2VuZF9uZXdsaW5lXCJ9W2VdLGBVbmV4cGVjdGVkIGFzc2VydGlvbiBraW5kIFwiJHtlfVwiYCkse25lZ2F0ZTplPT09eWBcXEJgfHxlPT09eWBcXFlgfSl9ZnVuY3Rpb24gWCh7cmF3OmV9LHIpe2NvbnN0IG49L15cXFxca1s8J10vLnRlc3QoZSksbz1uP2Uuc2xpY2UoMywtMSk6ZS5zbGljZSgxKSxpPSh0LGQ9ITEpPT57Y29uc3Qgcz1yLmNhcHR1cmluZ0dyb3Vwcy5sZW5ndGg7bGV0IGE9ITE7aWYodD5zKWlmKHIuc2tpcEJhY2tyZWZWYWxpZGF0aW9uKWE9ITA7ZWxzZSB0aHJvdyBuZXcgRXJyb3IoYE5vdCBlbm91Z2ggY2FwdHVyaW5nIGdyb3VwcyBkZWZpbmVkIHRvIHRoZSBsZWZ0IFwiJHtlfVwiYCk7cmV0dXJuIHIuaGFzTnVtYmVyZWRSZWY9ITAsayhkP3MrMS10OnQse29ycGhhbjphfSl9O2lmKG4pe2NvbnN0IHQ9L14oPzxzaWduPi0/KTAqKD88bnVtPlsxLTldXFxkKikkLy5leGVjKG8pO2lmKHQpcmV0dXJuIGkoK3QuZ3JvdXBzLm51bSwhIXQuZ3JvdXBzLnNpZ24pO2lmKC9bLStdLy50ZXN0KG8pKXRocm93IG5ldyBFcnJvcihgSW52YWxpZCBiYWNrcmVmIG5hbWUgXCIke2V9XCJgKTtpZighci5uYW1lZEdyb3Vwc0J5TmFtZS5oYXMobykpdGhyb3cgbmV3IEVycm9yKGBHcm91cCBuYW1lIG5vdCBkZWZpbmVkIHRvIHRoZSBsZWZ0IFwiJHtlfVwiYCk7cmV0dXJuIGsobyl9cmV0dXJuIGkoK28pfWZ1bmN0aW9uIGVlKGUscixuKXtjb25zdHt0b2tlbnM6byx3YWxrOml9PXIsdD1yLnBhcmVudCxkPXQuYm9keS5hdCgtMSkscz1vW3IubmV4dEluZGV4XTtpZighbi5pc0NoZWNraW5nUmFuZ2VFbmQmJmQmJmQudHlwZSE9PVwiQ2hhcmFjdGVyQ2xhc3NcIiYmZC50eXBlIT09XCJDaGFyYWN0ZXJDbGFzc1JhbmdlXCImJnMmJnMudHlwZSE9PVwiQ2hhcmFjdGVyQ2xhc3NPcGVuXCImJnMudHlwZSE9PVwiQ2hhcmFjdGVyQ2xhc3NDbG9zZVwiJiZzLnR5cGUhPT1cIkNoYXJhY3RlckNsYXNzSW50ZXJzZWN0b3JcIil7Y29uc3QgYT1pKHQsey4uLm4saXNDaGVja2luZ1JhbmdlRW5kOiEwfSk7aWYoZC50eXBlPT09XCJDaGFyYWN0ZXJcIiYmYS50eXBlPT09XCJDaGFyYWN0ZXJcIilyZXR1cm4gdC5ib2R5LnBvcCgpLEwoZCxhKTt0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGNoYXJhY3RlciBjbGFzcyByYW5nZVwiKX1yZXR1cm4gbShIKFwiLVwiKSl9ZnVuY3Rpb24gcmUoe25lZ2F0ZTplfSxyLG4pe2NvbnN0e3Rva2VuczpvLHdhbGs6aX09cix0PVtDKCldLGQ9b1tyLm5leHRJbmRleF07bGV0IHM9eihkKTtmb3IoO3MudHlwZSE9PVwiQ2hhcmFjdGVyQ2xhc3NDbG9zZVwiOyl7aWYocy50eXBlPT09XCJDaGFyYWN0ZXJDbGFzc0ludGVyc2VjdG9yXCIpdC5wdXNoKEMoKSksci5uZXh0SW5kZXgrKztlbHNle2NvbnN0IGw9dC5hdCgtMSk7bC5ib2R5LnB1c2goaShsLG4pKX1zPXoob1tyLm5leHRJbmRleF0sZCl9Y29uc3QgYT1DKHtuZWdhdGU6ZX0pO3JldHVybiB0Lmxlbmd0aD09PTE/YS5ib2R5PXRbMF0uYm9keTooYS5raW5kPVwiaW50ZXJzZWN0aW9uXCIsYS5ib2R5PXQubWFwKGw9PmwuYm9keS5sZW5ndGg9PT0xP2wuYm9keVswXTpsKSksci5uZXh0SW5kZXgrKyxhfWZ1bmN0aW9uIG5lKHtraW5kOmUsbmVnYXRlOnIsdmFsdWU6bn0sbyl7Y29uc3R7bm9ybWFsaXplVW5rbm93blByb3BlcnR5TmFtZXM6aSxza2lwUHJvcGVydHlOYW1lVmFsaWRhdGlvbjp0LHVuaWNvZGVQcm9wZXJ0eU1hcDpkfT1vO2lmKGU9PT1cInByb3BlcnR5XCIpe2NvbnN0IHM9dyhuKTtpZih4LmhhcyhzKSYmIWQ/LmhhcyhzKSllPVwicG9zaXhcIixuPXM7ZWxzZSByZXR1cm4gUShuLHtuZWdhdGU6cixub3JtYWxpemVVbmtub3duUHJvcGVydHlOYW1lczppLHNraXBQcm9wZXJ0eU5hbWVWYWxpZGF0aW9uOnQsdW5pY29kZVByb3BlcnR5TWFwOmR9KX1yZXR1cm4gZT09PVwicG9zaXhcIj9SKG4se25lZ2F0ZTpyfSk6RShlLHtuZWdhdGU6cn0pfWZ1bmN0aW9uIHRlKGUscixuKXtjb25zdHt0b2tlbnM6byxjYXB0dXJpbmdHcm91cHM6aSxuYW1lZEdyb3Vwc0J5TmFtZTp0LHNraXBMb29rYmVoaW5kVmFsaWRhdGlvbjpkLHdhbGs6c309cixhPWllKGUpLGw9YS50eXBlPT09XCJBYnNlbmNlRnVuY3Rpb25cIixjPSQoYSksZj1jJiZhLm5lZ2F0ZTtpZihhLnR5cGU9PT1cIkNhcHR1cmluZ0dyb3VwXCImJihpLnB1c2goYSksYS5uYW1lJiZaKHQsYS5uYW1lLFtdKS5wdXNoKGEpKSxsJiZuLmlzSW5BYnNlbmNlRnVuY3Rpb24pdGhyb3cgbmV3IEVycm9yKFwiTmVzdGVkIGFic2VuY2UgZnVuY3Rpb24gbm90IHN1cHBvcnRlZCBieSBPbmlndXJ1bWFcIik7bGV0IHA9RChvW3IubmV4dEluZGV4XSk7Zm9yKDtwLnR5cGUhPT1cIkdyb3VwQ2xvc2VcIjspe2lmKHAudHlwZT09PVwiQWx0ZXJuYXRvclwiKWEuYm9keS5wdXNoKGIoKSksci5uZXh0SW5kZXgrKztlbHNle2NvbnN0IE49YS5ib2R5LmF0KC0xKSx1PXMoTix7Li4ubixpc0luQWJzZW5jZUZ1bmN0aW9uOm4uaXNJbkFic2VuY2VGdW5jdGlvbnx8bCxpc0luTG9va2JlaGluZDpuLmlzSW5Mb29rYmVoaW5kfHxjLGlzSW5OZWdMb29rYmVoaW5kOm4uaXNJbk5lZ0xvb2tiZWhpbmR8fGZ9KTtpZihOLmJvZHkucHVzaCh1KSwoY3x8bi5pc0luTG9va2JlaGluZCkmJiFkKXtjb25zdCB2PVwiTG9va2JlaGluZCBpbmNsdWRlcyBhIHBhdHRlcm4gbm90IGFsbG93ZWQgYnkgT25pZ3VydW1hXCI7aWYoZnx8bi5pc0luTmVnTG9va2JlaGluZCl7aWYoTSh1KXx8dS50eXBlPT09XCJDYXB0dXJpbmdHcm91cFwiKXRocm93IG5ldyBFcnJvcih2KX1lbHNlIGlmKE0odSl8fCQodSkmJnUubmVnYXRlKXRocm93IG5ldyBFcnJvcih2KX19cD1EKG9bci5uZXh0SW5kZXhdKX1yZXR1cm4gci5uZXh0SW5kZXgrKyxhfWZ1bmN0aW9uIG9lKHtraW5kOmUsbWluOnIsbWF4Om59LG8pe2NvbnN0IGk9by5wYXJlbnQsdD1pLmJvZHkuYXQoLTEpO2lmKCF0fHwhUyh0KSl0aHJvdyBuZXcgRXJyb3IoXCJRdWFudGlmaWVyIHJlcXVpcmVzIGEgcmVwZWF0YWJsZSB0b2tlblwiKTtjb25zdCBkPV8oZSxyLG4sdCk7cmV0dXJuIGkuYm9keS5wb3AoKSxkfWZ1bmN0aW9uIGFlKHtyYXc6ZX0scil7Y29uc3R7Y2FwdHVyaW5nR3JvdXBzOm4sc3Vicm91dGluZXM6b309cjtsZXQgaT1lLnNsaWNlKDMsLTEpO2NvbnN0IHQ9L14oPzxzaWduPlstK10/KTAqKD88bnVtPlsxLTldXFxkKikkLy5leGVjKGkpO2lmKHQpe2NvbnN0IHM9K3QuZ3JvdXBzLm51bSxhPW4ubGVuZ3RoO2lmKHIuaGFzTnVtYmVyZWRSZWY9ITAsaT17XCJcIjpzLFwiK1wiOmErcyxcIi1cIjphKzEtc31bdC5ncm91cHMuc2lnbl0saTwxKXRocm93IG5ldyBFcnJvcihcIkludmFsaWQgc3Vicm91dGluZSBudW1iZXJcIil9ZWxzZSBpPT09XCIwXCImJihpPTApO2NvbnN0IGQ9TyhpKTtyZXR1cm4gby5wdXNoKGQpLGR9ZnVuY3Rpb24gRyhlLHIpe2lmKGUhPT1cInJlcGVhdGVyXCIpdGhyb3cgbmV3IEVycm9yKGBVbmV4cGVjdGVkIGFic2VuY2UgZnVuY3Rpb24ga2luZCBcIiR7ZX1cImApO3JldHVybnt0eXBlOlwiQWJzZW5jZUZ1bmN0aW9uXCIsa2luZDplLGJvZHk6aChyPy5ib2R5KX19ZnVuY3Rpb24gYihlKXtyZXR1cm57dHlwZTpcIkFsdGVybmF0aXZlXCIsYm9keTpWKGU/LmJvZHkpfX1mdW5jdGlvbiBGKGUscil7Y29uc3Qgbj17dHlwZTpcIkFzc2VydGlvblwiLGtpbmQ6ZX07cmV0dXJuKGU9PT1cIndvcmRfYm91bmRhcnlcInx8ZT09PVwidGV4dF9zZWdtZW50X2JvdW5kYXJ5XCIpJiYobi5uZWdhdGU9ISFyPy5uZWdhdGUpLG59ZnVuY3Rpb24gayhlLHIpe2NvbnN0IG49ISFyPy5vcnBoYW47cmV0dXJue3R5cGU6XCJCYWNrcmVmZXJlbmNlXCIscmVmOmUsLi4ubiYme29ycGhhbjpufX19ZnVuY3Rpb24gUChlLHIpe2NvbnN0IG49e25hbWU6dm9pZCAwLGlzU3Vicm91dGluZWQ6ITEsLi4ucn07aWYobi5uYW1lIT09dm9pZCAwJiYhc2Uobi5uYW1lKSl0aHJvdyBuZXcgRXJyb3IoYEdyb3VwIG5hbWUgXCIke24ubmFtZX1cIiBpbnZhbGlkIGluIE9uaWd1cnVtYWApO3JldHVybnt0eXBlOlwiQ2FwdHVyaW5nR3JvdXBcIixudW1iZXI6ZSwuLi5uLm5hbWUmJntuYW1lOm4ubmFtZX0sLi4ubi5pc1N1YnJvdXRpbmVkJiZ7aXNTdWJyb3V0aW5lZDpuLmlzU3Vicm91dGluZWR9LGJvZHk6aChyPy5ib2R5KX19ZnVuY3Rpb24gbShlLHIpe2NvbnN0IG49e3VzZUxhc3RWYWxpZDohMSwuLi5yfTtpZihlPjExMTQxMTEpe2NvbnN0IG89ZS50b1N0cmluZygxNik7aWYobi51c2VMYXN0VmFsaWQpZT0xMTE0MTExO2Vsc2UgdGhyb3cgZT4xMzEwNzE5P25ldyBFcnJvcihgSW52YWxpZCBjb2RlIHBvaW50IG91dCBvZiByYW5nZSBcIlxcXFx4eyR7b319XCJgKTpuZXcgRXJyb3IoYEludmFsaWQgY29kZSBwb2ludCBvdXQgb2YgcmFuZ2UgaW4gSlMgXCJcXFxceHske299fVwiYCl9cmV0dXJue3R5cGU6XCJDaGFyYWN0ZXJcIix2YWx1ZTplfX1mdW5jdGlvbiBDKGUpe2NvbnN0IHI9e2tpbmQ6XCJ1bmlvblwiLG5lZ2F0ZTohMSwuLi5lfTtyZXR1cm57dHlwZTpcIkNoYXJhY3RlckNsYXNzXCIsa2luZDpyLmtpbmQsbmVnYXRlOnIubmVnYXRlLGJvZHk6VihlPy5ib2R5KX19ZnVuY3Rpb24gTChlLHIpe2lmKHIudmFsdWU8ZS52YWx1ZSl0aHJvdyBuZXcgRXJyb3IoXCJDaGFyYWN0ZXIgY2xhc3MgcmFuZ2Ugb3V0IG9mIG9yZGVyXCIpO3JldHVybnt0eXBlOlwiQ2hhcmFjdGVyQ2xhc3NSYW5nZVwiLG1pbjplLG1heDpyfX1mdW5jdGlvbiBFKGUscil7Y29uc3Qgbj0hIXI/Lm5lZ2F0ZSxvPXt0eXBlOlwiQ2hhcmFjdGVyU2V0XCIsa2luZDplfTtyZXR1cm4oZT09PVwiZGlnaXRcInx8ZT09PVwiaGV4XCJ8fGU9PT1cIm5ld2xpbmVcInx8ZT09PVwic3BhY2VcInx8ZT09PVwid29yZFwiKSYmKG8ubmVnYXRlPW4pLChlPT09XCJ0ZXh0X3NlZ21lbnRcInx8ZT09PVwibmV3bGluZVwiJiYhbikmJihvLnZhcmlhYmxlTGVuZ3RoPSEwKSxvfWZ1bmN0aW9uIEkoZSxyPXt9KXtpZihlPT09XCJrZWVwXCIpcmV0dXJue3R5cGU6XCJEaXJlY3RpdmVcIixraW5kOmV9O2lmKGU9PT1cImZsYWdzXCIpcmV0dXJue3R5cGU6XCJEaXJlY3RpdmVcIixraW5kOmUsZmxhZ3M6ZyhyLmZsYWdzKX07dGhyb3cgbmV3IEVycm9yKGBVbmV4cGVjdGVkIGRpcmVjdGl2ZSBraW5kIFwiJHtlfVwiYCl9ZnVuY3Rpb24gVChlKXtyZXR1cm57dHlwZTpcIkZsYWdzXCIsLi4uZX19ZnVuY3Rpb24gQShlKXtjb25zdCByPWU/LmF0b21pYyxuPWU/LmZsYWdzO2lmKHImJm4pdGhyb3cgbmV3IEVycm9yKFwiQXRvbWljIGdyb3VwIGNhbm5vdCBoYXZlIGZsYWdzXCIpO3JldHVybnt0eXBlOlwiR3JvdXBcIiwuLi5yJiZ7YXRvbWljOnJ9LC4uLm4mJntmbGFnczpufSxib2R5OmgoZT8uYm9keSl9fWZ1bmN0aW9uIEsoZSl7Y29uc3Qgcj17YmVoaW5kOiExLG5lZ2F0ZTohMSwuLi5lfTtyZXR1cm57dHlwZTpcIkxvb2thcm91bmRBc3NlcnRpb25cIixraW5kOnIuYmVoaW5kP1wibG9va2JlaGluZFwiOlwibG9va2FoZWFkXCIsbmVnYXRlOnIubmVnYXRlLGJvZHk6aChlPy5ib2R5KX19ZnVuY3Rpb24gVShlLHIsbil7cmV0dXJue3R5cGU6XCJOYW1lZENhbGxvdXRcIixraW5kOmUsdGFnOnIsYXJndW1lbnRzOm59fWZ1bmN0aW9uIFIoZSxyKXtjb25zdCBuPSEhcj8ubmVnYXRlO2lmKCF4LmhhcyhlKSl0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgUE9TSVggY2xhc3MgXCIke2V9XCJgKTtyZXR1cm57dHlwZTpcIkNoYXJhY3RlclNldFwiLGtpbmQ6XCJwb3NpeFwiLHZhbHVlOmUsbmVnYXRlOm59fWZ1bmN0aW9uIF8oZSxyLG4sbyl7aWYocj5uKXRocm93IG5ldyBFcnJvcihcIkludmFsaWQgcmV2ZXJzZWQgcXVhbnRpZmllciByYW5nZVwiKTtyZXR1cm57dHlwZTpcIlF1YW50aWZpZXJcIixraW5kOmUsbWluOnIsbWF4Om4sYm9keTpvfX1mdW5jdGlvbiBCKGUscil7cmV0dXJue3R5cGU6XCJSZWdleFwiLGJvZHk6aChyPy5ib2R5KSxmbGFnczplfX1mdW5jdGlvbiBPKGUpe3JldHVybnt0eXBlOlwiU3Vicm91dGluZVwiLHJlZjplfX1mdW5jdGlvbiBRKGUscil7Y29uc3Qgbj17bmVnYXRlOiExLG5vcm1hbGl6ZVVua25vd25Qcm9wZXJ0eU5hbWVzOiExLHNraXBQcm9wZXJ0eU5hbWVWYWxpZGF0aW9uOiExLHVuaWNvZGVQcm9wZXJ0eU1hcDpudWxsLC4uLnJ9O2xldCBvPW4udW5pY29kZVByb3BlcnR5TWFwPy5nZXQodyhlKSk7aWYoIW8pe2lmKG4ubm9ybWFsaXplVW5rbm93blByb3BlcnR5TmFtZXMpbz1kZShlKTtlbHNlIGlmKG4udW5pY29kZVByb3BlcnR5TWFwJiYhbi5za2lwUHJvcGVydHlOYW1lVmFsaWRhdGlvbil0aHJvdyBuZXcgRXJyb3IoeWBJbnZhbGlkIFVuaWNvZGUgcHJvcGVydHkgXCJcXHB7JHtlfX1cImApfXJldHVybnt0eXBlOlwiQ2hhcmFjdGVyU2V0XCIsa2luZDpcInByb3BlcnR5XCIsdmFsdWU6bz8/ZSxuZWdhdGU6bi5uZWdhdGV9fWZ1bmN0aW9uIGllKHtmbGFnczplLGtpbmQ6cixuYW1lOm4sbmVnYXRlOm8sbnVtYmVyOml9KXtzd2l0Y2gocil7Y2FzZVwiYWJzZW5jZV9yZXBlYXRlclwiOnJldHVybiBHKFwicmVwZWF0ZXJcIik7Y2FzZVwiYXRvbWljXCI6cmV0dXJuIEEoe2F0b21pYzohMH0pO2Nhc2VcImNhcHR1cmluZ1wiOnJldHVybiBQKGkse25hbWU6bn0pO2Nhc2VcImdyb3VwXCI6cmV0dXJuIEEoe2ZsYWdzOmV9KTtjYXNlXCJsb29rYWhlYWRcIjpjYXNlXCJsb29rYmVoaW5kXCI6cmV0dXJuIEsoe2JlaGluZDpyPT09XCJsb29rYmVoaW5kXCIsbmVnYXRlOm99KTtkZWZhdWx0OnRocm93IG5ldyBFcnJvcihgVW5leHBlY3RlZCBncm91cCBraW5kIFwiJHtyfVwiYCl9fWZ1bmN0aW9uIGgoZSl7aWYoZT09PXZvaWQgMCllPVtiKCldO2Vsc2UgaWYoIUFycmF5LmlzQXJyYXkoZSl8fCFlLmxlbmd0aHx8IWUuZXZlcnkocj0+ci50eXBlPT09XCJBbHRlcm5hdGl2ZVwiKSl0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGJvZHk7IGV4cGVjdGVkIGFycmF5IG9mIG9uZSBvciBtb3JlIEFsdGVybmF0aXZlIG5vZGVzXCIpO3JldHVybiBlfWZ1bmN0aW9uIFYoZSl7aWYoZT09PXZvaWQgMCllPVtdO2Vsc2UgaWYoIUFycmF5LmlzQXJyYXkoZSl8fCFlLmV2ZXJ5KHI9PiEhci50eXBlKSl0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGJvZHk7IGV4cGVjdGVkIGFycmF5IG9mIG5vZGVzXCIpO3JldHVybiBlfWZ1bmN0aW9uIE0oZSl7cmV0dXJuIGUudHlwZT09PVwiTG9va2Fyb3VuZEFzc2VydGlvblwiJiZlLmtpbmQ9PT1cImxvb2thaGVhZFwifWZ1bmN0aW9uICQoZSl7cmV0dXJuIGUudHlwZT09PVwiTG9va2Fyb3VuZEFzc2VydGlvblwiJiZlLmtpbmQ9PT1cImxvb2tiZWhpbmRcIn1mdW5jdGlvbiBzZShlKXtyZXR1cm4vXltcXHB7QWxwaGF9XFxwe1BjfV1bXildKiQvdS50ZXN0KGUpfWZ1bmN0aW9uIGRlKGUpe3JldHVybiBlLnRyaW0oKS5yZXBsYWNlKC9bLSBfXSsvZyxcIl9cIikucmVwbGFjZSgvW0EtWl1bYS16XSsoPz1bQS1aXSkvZyxcIiQmX1wiKS5yZXBsYWNlKC9bQS1aYS16XSsvZyxyPT5yWzBdLnRvVXBwZXJDYXNlKCkrci5zbGljZSgxKS50b0xvd2VyQ2FzZSgpKX1mdW5jdGlvbiB3KGUpe3JldHVybiBlLnJlcGxhY2UoL1stIF9dKy9nLFwiXCIpLnRvTG93ZXJDYXNlKCl9ZnVuY3Rpb24geihlLHIpe2NvbnN0IG49cjtyZXR1cm4gZyhlLGBVbmNsb3NlZCBjaGFyYWN0ZXIgY2xhc3Mke24/LnR5cGU9PT1cIkNoYXJhY3RlclwiJiZuLnZhbHVlPT09OTMmJm4ucmF3PT09XCJdXCI/JyAoc3RhcnRlZCB3aXRoIFwiXVwiKSc6XCJcIn1gKX1mdW5jdGlvbiBEKGUpe3JldHVybiBnKGUsXCJVbmNsb3NlZCBncm91cFwiKX1leHBvcnR7RyBhcyBjcmVhdGVBYnNlbmNlRnVuY3Rpb24sYiBhcyBjcmVhdGVBbHRlcm5hdGl2ZSxGIGFzIGNyZWF0ZUFzc2VydGlvbixrIGFzIGNyZWF0ZUJhY2tyZWZlcmVuY2UsUCBhcyBjcmVhdGVDYXB0dXJpbmdHcm91cCxtIGFzIGNyZWF0ZUNoYXJhY3RlcixDIGFzIGNyZWF0ZUNoYXJhY3RlckNsYXNzLEwgYXMgY3JlYXRlQ2hhcmFjdGVyQ2xhc3NSYW5nZSxFIGFzIGNyZWF0ZUNoYXJhY3RlclNldCxJIGFzIGNyZWF0ZURpcmVjdGl2ZSxUIGFzIGNyZWF0ZUZsYWdzLEEgYXMgY3JlYXRlR3JvdXAsSyBhcyBjcmVhdGVMb29rYXJvdW5kQXNzZXJ0aW9uLFUgYXMgY3JlYXRlTmFtZWRDYWxsb3V0LFIgYXMgY3JlYXRlUG9zaXhDbGFzcyxfIGFzIGNyZWF0ZVF1YW50aWZpZXIsQiBhcyBjcmVhdGVSZWdleCxPIGFzIGNyZWF0ZVN1YnJvdXRpbmUsUSBhcyBjcmVhdGVVbmljb2RlUHJvcGVydHksWSBhcyBoYXNPbmx5Q2hpbGQsaiBhcyBpc0FsdGVybmF0aXZlQ29udGFpbmVyLFMgYXMgaXNRdWFudGlmaWFibGUsSiBhcyBwYXJzZSx3IGFzIHNsdWd9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGFyc2UuanMubWFwXG4iLAogICAgIlwidXNlIHN0cmljdFwiO2ltcG9ydHt0aHJvd0lmTnVsbGlzaCBhcyBBfWZyb21cIi4uL3V0aWxzLmpzXCI7ZnVuY3Rpb24gUyhhLHYsTj1udWxsKXtmdW5jdGlvbiBiKGUscyl7Zm9yKGxldCB0PTA7dDxlLmxlbmd0aDt0Kyspe2NvbnN0IHI9bihlW3RdLHMsdCxlKTt0PU1hdGgubWF4KC0xLHQrcil9fWZ1bmN0aW9uIG4oZSxzPW51bGwsdD1udWxsLHI9bnVsbCl7bGV0IGk9MCxjPSExO2NvbnN0IGQ9e25vZGU6ZSxwYXJlbnQ6cyxrZXk6dCxjb250YWluZXI6cixyb290OmEscmVtb3ZlKCl7eChyKS5zcGxpY2UoTWF0aC5tYXgoMCxsKHQpK2kpLDEpLGktLSxjPSEwfSxyZW1vdmVBbGxOZXh0U2libGluZ3MoKXtyZXR1cm4geChyKS5zcGxpY2UobCh0KSsxKX0scmVtb3ZlQWxsUHJldlNpYmxpbmdzKCl7Y29uc3Qgbz1sKHQpK2k7cmV0dXJuIGktPW8seChyKS5zcGxpY2UoMCxNYXRoLm1heCgwLG8pKX0scmVwbGFjZVdpdGgobyxtPXt9KXtjb25zdCB5PSEhbS50cmF2ZXJzZTtyP3JbTWF0aC5tYXgoMCxsKHQpK2kpXT1vOkEocyxcIkNhbid0IHJlcGxhY2Ugcm9vdCBub2RlXCIpW3RdPW8seSYmbihvLHMsdCxyKSxjPSEwfSxyZXBsYWNlV2l0aE11bHRpcGxlKG8sbT17fSl7Y29uc3QgeT0hIW0udHJhdmVyc2U7aWYoeChyKS5zcGxpY2UoTWF0aC5tYXgoMCxsKHQpK2kpLDEsLi4ubyksaSs9by5sZW5ndGgtMSx5KXtsZXQgZz0wO2ZvcihsZXQgcD0wO3A8by5sZW5ndGg7cCsrKWcrPW4ob1twXSxzLGwodCkrcCtnLHIpfWM9ITB9LHNraXAoKXtjPSEwfX0se3R5cGU6Zn09ZSx1PXZbXCIqXCJdLGg9dltmXSxSPXR5cGVvZiB1PT1cImZ1bmN0aW9uXCI/dTp1Py5lbnRlcixQPXR5cGVvZiBoPT1cImZ1bmN0aW9uXCI/aDpoPy5lbnRlcjtpZihSPy4oZCxOKSxQPy4oZCxOKSwhYylzd2l0Y2goZil7Y2FzZVwiQWJzZW5jZUZ1bmN0aW9uXCI6Y2FzZVwiQWx0ZXJuYXRpdmVcIjpjYXNlXCJDYXB0dXJpbmdHcm91cFwiOmNhc2VcIkNoYXJhY3RlckNsYXNzXCI6Y2FzZVwiR3JvdXBcIjpjYXNlXCJMb29rYXJvdW5kQXNzZXJ0aW9uXCI6YihlLmJvZHksZSk7YnJlYWs7Y2FzZVwiQXNzZXJ0aW9uXCI6Y2FzZVwiQmFja3JlZmVyZW5jZVwiOmNhc2VcIkNoYXJhY3RlclwiOmNhc2VcIkNoYXJhY3RlclNldFwiOmNhc2VcIkRpcmVjdGl2ZVwiOmNhc2VcIkZsYWdzXCI6Y2FzZVwiTmFtZWRDYWxsb3V0XCI6Y2FzZVwiU3Vicm91dGluZVwiOmJyZWFrO2Nhc2VcIkNoYXJhY3RlckNsYXNzUmFuZ2VcIjpuKGUubWluLGUsXCJtaW5cIiksbihlLm1heCxlLFwibWF4XCIpO2JyZWFrO2Nhc2VcIlF1YW50aWZpZXJcIjpuKGUuYm9keSxlLFwiYm9keVwiKTticmVhaztjYXNlXCJSZWdleFwiOmIoZS5ib2R5LGUpLG4oZS5mbGFncyxlLFwiZmxhZ3NcIik7YnJlYWs7ZGVmYXVsdDp0aHJvdyBuZXcgRXJyb3IoYFVuZXhwZWN0ZWQgbm9kZSB0eXBlIFwiJHtmfVwiYCl9cmV0dXJuIGg/LmV4aXQ/LihkLE4pLHU/LmV4aXQ/LihkLE4pLGl9cmV0dXJuIG4oYSksYX1mdW5jdGlvbiB4KGEpe2lmKCFBcnJheS5pc0FycmF5KGEpKXRocm93IG5ldyBFcnJvcihcIkNvbnRhaW5lciBleHBlY3RlZFwiKTtyZXR1cm4gYX1mdW5jdGlvbiBsKGEpe2lmKHR5cGVvZiBhIT1cIm51bWJlclwiKXRocm93IG5ldyBFcnJvcihcIk51bWVyaWMga2V5IGV4cGVjdGVkXCIpO3JldHVybiBhfWV4cG9ydHtTIGFzIHRyYXZlcnNlfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRyYXZlcnNlLmpzLm1hcFxuIiwKICAgICIvLyBTZXBhcmF0aW5nIHNvbWUgdXRpbHMgZm9yIGltcHJvdmVkIHRyZWUgc2hha2luZyBvZiB0aGUgYC4vaW50ZXJuYWxzYCBleHBvcnRcblxuY29uc3Qgbm9uY2FwdHVyaW5nRGVsaW0gPSBTdHJpbmcucmF3YFxcKFxcPyg/Ols6PSE+QS1aYS16XFwtXXw8Wz0hXXxcXChERUZJTkVcXCkpYDtcblxuLyoqXG5VcGRhdGVzIHRoZSBhcnJheSBpbiBwbGFjZSBieSBpbmNyZW1lbnRpbmcgZWFjaCB2YWx1ZSBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHRocmVzaG9sZC5cbkBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gYXJyXG5AcGFyYW0ge251bWJlcn0gdGhyZXNob2xkXG4qL1xuZnVuY3Rpb24gaW5jcmVtZW50SWZBdExlYXN0KGFyciwgdGhyZXNob2xkKSB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGFycltpXSA+PSB0aHJlc2hvbGQpIHtcbiAgICAgIGFycltpXSsrO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbkBwYXJhbSB7c3RyaW5nfSBzdHJcbkBwYXJhbSB7bnVtYmVyfSBwb3NcbkBwYXJhbSB7c3RyaW5nfSBvbGRWYWx1ZVxuQHBhcmFtIHtzdHJpbmd9IG5ld1ZhbHVlXG5AcmV0dXJucyB7c3RyaW5nfVxuKi9cbmZ1bmN0aW9uIHNwbGljZVN0cihzdHIsIHBvcywgb2xkVmFsdWUsIG5ld1ZhbHVlKSB7XG4gIHJldHVybiBzdHIuc2xpY2UoMCwgcG9zKSArIG5ld1ZhbHVlICsgc3RyLnNsaWNlKHBvcyArIG9sZFZhbHVlLmxlbmd0aCk7XG59XG5cbmV4cG9ydCB7XG4gIGluY3JlbWVudElmQXRMZWFzdCxcbiAgbm9uY2FwdHVyaW5nRGVsaW0sXG4gIHNwbGljZVN0cixcbn07XG4iLAogICAgIi8vIENvbnN0YW50IHByb3BlcnRpZXMgZm9yIHRyYWNraW5nIHJlZ2V4IHN5bnRheCBjb250ZXh0XG5leHBvcnQgY29uc3QgQ29udGV4dCA9IE9iamVjdC5mcmVlemUoe1xuICBERUZBVUxUOiAnREVGQVVMVCcsXG4gIENIQVJfQ0xBU1M6ICdDSEFSX0NMQVNTJyxcbn0pO1xuXG4vKipcblJlcGxhY2VzIGFsbCB1bmVzY2FwZWQgaW5zdGFuY2VzIG9mIGEgcmVnZXggcGF0dGVybiBpbiB0aGUgZ2l2ZW4gY29udGV4dCwgdXNpbmcgYSByZXBsYWNlbWVudFxuc3RyaW5nIG9yIGNhbGxiYWNrLlxuXG5Eb2Vzbid0IHNraXAgb3ZlciBjb21wbGV0ZSBtdWx0aWNoYXJhY3RlciB0b2tlbnMgKG9ubHkgYFxcYCBwbHVzIGl0cyBmb2xvd2luZyBjaGFyKSBzbyBtdXN0IGJlIHVzZWRcbndpdGgga25vd2xlZGdlIG9mIHdoYXQncyBzYWZlIHRvIGRvIGdpdmVuIHJlZ2V4IHN5bnRheC4gQXNzdW1lcyBVbmljb2RlU2V0cy1tb2RlIHN5bnRheC5cbkBwYXJhbSB7c3RyaW5nfSBleHByZXNzaW9uIFNlYXJjaCB0YXJnZXRcbkBwYXJhbSB7c3RyaW5nfSBuZWVkbGUgU2VhcmNoIGFzIGEgcmVnZXggcGF0dGVybiwgd2l0aCBmbGFncyBgc3VgIGFwcGxpZWRcbkBwYXJhbSB7c3RyaW5nIHwgKG1hdGNoOiBSZWdFeHBFeGVjQXJyYXksIGRldGFpbHM6IHtcbiAgY29udGV4dDogJ0RFRkFVTFQnIHwgJ0NIQVJfQ0xBU1MnO1xuICBuZWdhdGVkOiBib29sZWFuO1xufSkgPT4gc3RyaW5nfSByZXBsYWNlbWVudFxuQHBhcmFtIHsnREVGQVVMVCcgfCAnQ0hBUl9DTEFTUyd9IFtjb250ZXh0XSBBbGwgY29udGV4dHMgaWYgbm90IHNwZWNpZmllZFxuQHJldHVybnMge3N0cmluZ30gVXBkYXRlZCBleHByZXNzaW9uXG5AZXhhbXBsZVxuY29uc3Qgc3RyID0gJy5cXFxcLlxcXFxcXFxcLltbXFxcXC5dLl0uJztcbnJlcGxhY2VVbmVzY2FwZWQoc3RyLCAnXFxcXC4nLCAnQCcpO1xuLy8g4oaSICdAXFxcXC5cXFxcXFxcXEBbW1xcXFwuXUBdQCdcbnJlcGxhY2VVbmVzY2FwZWQoc3RyLCAnXFxcXC4nLCAnQCcsIENvbnRleHQuREVGQVVMVCk7XG4vLyDihpIgJ0BcXFxcLlxcXFxcXFxcQFtbXFxcXC5dLl1AJ1xucmVwbGFjZVVuZXNjYXBlZChzdHIsICdcXFxcLicsICdAJywgQ29udGV4dC5DSEFSX0NMQVNTKTtcbi8vIOKGkiAnLlxcXFwuXFxcXFxcXFwuW1tcXFxcLl1AXS4nXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHJlcGxhY2VVbmVzY2FwZWQoZXhwcmVzc2lvbiwgbmVlZGxlLCByZXBsYWNlbWVudCwgY29udGV4dCkge1xuICBjb25zdCByZSA9IG5ldyBSZWdFeHAoU3RyaW5nLnJhd2Ake25lZWRsZX18KD88JHNraXA+XFxbXFxeP3xcXFxcPy4pYCwgJ2dzdScpO1xuICBjb25zdCBuZWdhdGVkID0gW2ZhbHNlXTtcbiAgbGV0IG51bUNoYXJDbGFzc2VzT3BlbiA9IDA7XG4gIGxldCByZXN1bHQgPSAnJztcbiAgZm9yIChjb25zdCBtYXRjaCBvZiBleHByZXNzaW9uLm1hdGNoQWxsKHJlKSkge1xuICAgIGNvbnN0IHswOiBtLCBncm91cHM6IHskc2tpcH19ID0gbWF0Y2g7XG4gICAgaWYgKCEkc2tpcCAmJiAoIWNvbnRleHQgfHwgKGNvbnRleHQgPT09IENvbnRleHQuREVGQVVMVCkgPT09ICFudW1DaGFyQ2xhc3Nlc09wZW4pKSB7XG4gICAgICBpZiAocmVwbGFjZW1lbnQgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgICByZXN1bHQgKz0gcmVwbGFjZW1lbnQobWF0Y2gsIHtcbiAgICAgICAgICBjb250ZXh0OiBudW1DaGFyQ2xhc3Nlc09wZW4gPyBDb250ZXh0LkNIQVJfQ0xBU1MgOiBDb250ZXh0LkRFRkFVTFQsXG4gICAgICAgICAgbmVnYXRlZDogbmVnYXRlZFtuZWdhdGVkLmxlbmd0aCAtIDFdLFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdCArPSByZXBsYWNlbWVudDtcbiAgICAgIH1cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAobVswXSA9PT0gJ1snKSB7XG4gICAgICBudW1DaGFyQ2xhc3Nlc09wZW4rKztcbiAgICAgIG5lZ2F0ZWQucHVzaChtWzFdID09PSAnXicpO1xuICAgIH0gZWxzZSBpZiAobSA9PT0gJ10nICYmIG51bUNoYXJDbGFzc2VzT3Blbikge1xuICAgICAgbnVtQ2hhckNsYXNzZXNPcGVuLS07XG4gICAgICBuZWdhdGVkLnBvcCgpO1xuICAgIH1cbiAgICByZXN1bHQgKz0gbTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcblJ1bnMgYSBjYWxsYmFjayBmb3IgZWFjaCB1bmVzY2FwZWQgaW5zdGFuY2Ugb2YgYSByZWdleCBwYXR0ZXJuIGluIHRoZSBnaXZlbiBjb250ZXh0LlxuXG5Eb2Vzbid0IHNraXAgb3ZlciBjb21wbGV0ZSBtdWx0aWNoYXJhY3RlciB0b2tlbnMgKG9ubHkgYFxcYCBwbHVzIGl0cyBmb2xvd2luZyBjaGFyKSBzbyBtdXN0IGJlIHVzZWRcbndpdGgga25vd2xlZGdlIG9mIHdoYXQncyBzYWZlIHRvIGRvIGdpdmVuIHJlZ2V4IHN5bnRheC4gQXNzdW1lcyBVbmljb2RlU2V0cy1tb2RlIHN5bnRheC5cbkBwYXJhbSB7c3RyaW5nfSBleHByZXNzaW9uIFNlYXJjaCB0YXJnZXRcbkBwYXJhbSB7c3RyaW5nfSBuZWVkbGUgU2VhcmNoIGFzIGEgcmVnZXggcGF0dGVybiwgd2l0aCBmbGFncyBgc3VgIGFwcGxpZWRcbkBwYXJhbSB7KG1hdGNoOiBSZWdFeHBFeGVjQXJyYXksIGRldGFpbHM6IHtcbiAgY29udGV4dDogJ0RFRkFVTFQnIHwgJ0NIQVJfQ0xBU1MnO1xuICBuZWdhdGVkOiBib29sZWFuO1xufSkgPT4gdm9pZH0gY2FsbGJhY2tcbkBwYXJhbSB7J0RFRkFVTFQnIHwgJ0NIQVJfQ0xBU1MnfSBbY29udGV4dF0gQWxsIGNvbnRleHRzIGlmIG5vdCBzcGVjaWZpZWRcbiovXG5leHBvcnQgZnVuY3Rpb24gZm9yRWFjaFVuZXNjYXBlZChleHByZXNzaW9uLCBuZWVkbGUsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gIC8vIERvIHRoaXMgdGhlIGVhc3kgd2F5XG4gIHJlcGxhY2VVbmVzY2FwZWQoZXhwcmVzc2lvbiwgbmVlZGxlLCBjYWxsYmFjaywgY29udGV4dCk7XG59XG5cbi8qKlxuUmV0dXJucyBhIG1hdGNoIG9iamVjdCBmb3IgdGhlIGZpcnN0IHVuZXNjYXBlZCBpbnN0YW5jZSBvZiBhIHJlZ2V4IHBhdHRlcm4gaW4gdGhlIGdpdmVuIGNvbnRleHQsIG9yXG5gbnVsbGAuXG5cbkRvZXNuJ3Qgc2tpcCBvdmVyIGNvbXBsZXRlIG11bHRpY2hhcmFjdGVyIHRva2VucyAob25seSBgXFxgIHBsdXMgaXRzIGZvbG93aW5nIGNoYXIpIHNvIG11c3QgYmUgdXNlZFxud2l0aCBrbm93bGVkZ2Ugb2Ygd2hhdCdzIHNhZmUgdG8gZG8gZ2l2ZW4gcmVnZXggc3ludGF4LiBBc3N1bWVzIFVuaWNvZGVTZXRzLW1vZGUgc3ludGF4LlxuQHBhcmFtIHtzdHJpbmd9IGV4cHJlc3Npb24gU2VhcmNoIHRhcmdldFxuQHBhcmFtIHtzdHJpbmd9IG5lZWRsZSBTZWFyY2ggYXMgYSByZWdleCBwYXR0ZXJuLCB3aXRoIGZsYWdzIGBzdWAgYXBwbGllZFxuQHBhcmFtIHtudW1iZXJ9IFtwb3NdIE9mZnNldCB0byBzdGFydCB0aGUgc2VhcmNoXG5AcGFyYW0geydERUZBVUxUJyB8ICdDSEFSX0NMQVNTJ30gW2NvbnRleHRdIEFsbCBjb250ZXh0cyBpZiBub3Qgc3BlY2lmaWVkXG5AcmV0dXJucyB7UmVnRXhwRXhlY0FycmF5IHwgbnVsbH1cbiovXG5leHBvcnQgZnVuY3Rpb24gZXhlY1VuZXNjYXBlZChleHByZXNzaW9uLCBuZWVkbGUsIHBvcyA9IDAsIGNvbnRleHQpIHtcbiAgLy8gUXVpY2sgcGFydGlhbCB0ZXN0OyBhdm9pZCB0aGUgbG9vcCBpZiBub3QgbmVlZGVkXG4gIGlmICghKG5ldyBSZWdFeHAobmVlZGxlLCAnc3UnKS50ZXN0KGV4cHJlc3Npb24pKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IHJlID0gbmV3IFJlZ0V4cChgJHtuZWVkbGV9fCg/PCRza2lwPlxcXFxcXFxcPy4pYCwgJ2dzdScpO1xuICByZS5sYXN0SW5kZXggPSBwb3M7XG4gIGxldCBudW1DaGFyQ2xhc3Nlc09wZW4gPSAwO1xuICBsZXQgbWF0Y2g7XG4gIHdoaWxlIChtYXRjaCA9IHJlLmV4ZWMoZXhwcmVzc2lvbikpIHtcbiAgICBjb25zdCB7MDogbSwgZ3JvdXBzOiB7JHNraXB9fSA9IG1hdGNoO1xuICAgIGlmICghJHNraXAgJiYgKCFjb250ZXh0IHx8IChjb250ZXh0ID09PSBDb250ZXh0LkRFRkFVTFQpID09PSAhbnVtQ2hhckNsYXNzZXNPcGVuKSkge1xuICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH1cbiAgICBpZiAobSA9PT0gJ1snKSB7XG4gICAgICBudW1DaGFyQ2xhc3Nlc09wZW4rKztcbiAgICB9IGVsc2UgaWYgKG0gPT09ICddJyAmJiBudW1DaGFyQ2xhc3Nlc09wZW4pIHtcbiAgICAgIG51bUNoYXJDbGFzc2VzT3Blbi0tO1xuICAgIH1cbiAgICAvLyBBdm9pZCBhbiBpbmZpbml0ZSBsb29wIG9uIHplcm8tbGVuZ3RoIG1hdGNoZXNcbiAgICBpZiAocmUubGFzdEluZGV4ID09IG1hdGNoLmluZGV4KSB7XG4gICAgICByZS5sYXN0SW5kZXgrKztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuQ2hlY2tzIHdoZXRoZXIgYW4gdW5lc2NhcGVkIGluc3RhbmNlIG9mIGEgcmVnZXggcGF0dGVybiBhcHBlYXJzIGluIHRoZSBnaXZlbiBjb250ZXh0LlxuXG5Eb2Vzbid0IHNraXAgb3ZlciBjb21wbGV0ZSBtdWx0aWNoYXJhY3RlciB0b2tlbnMgKG9ubHkgYFxcYCBwbHVzIGl0cyBmb2xvd2luZyBjaGFyKSBzbyBtdXN0IGJlIHVzZWRcbndpdGgga25vd2xlZGdlIG9mIHdoYXQncyBzYWZlIHRvIGRvIGdpdmVuIHJlZ2V4IHN5bnRheC4gQXNzdW1lcyBVbmljb2RlU2V0cy1tb2RlIHN5bnRheC5cbkBwYXJhbSB7c3RyaW5nfSBleHByZXNzaW9uIFNlYXJjaCB0YXJnZXRcbkBwYXJhbSB7c3RyaW5nfSBuZWVkbGUgU2VhcmNoIGFzIGEgcmVnZXggcGF0dGVybiwgd2l0aCBmbGFncyBgc3VgIGFwcGxpZWRcbkBwYXJhbSB7J0RFRkFVTFQnIHwgJ0NIQVJfQ0xBU1MnfSBbY29udGV4dF0gQWxsIGNvbnRleHRzIGlmIG5vdCBzcGVjaWZpZWRcbkByZXR1cm5zIHtib29sZWFufSBXaGV0aGVyIHRoZSBwYXR0ZXJuIHdhcyBmb3VuZFxuKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNVbmVzY2FwZWQoZXhwcmVzc2lvbiwgbmVlZGxlLCBjb250ZXh0KSB7XG4gIC8vIERvIHRoaXMgdGhlIGVhc3kgd2F5XG4gIHJldHVybiAhIWV4ZWNVbmVzY2FwZWQoZXhwcmVzc2lvbiwgbmVlZGxlLCAwLCBjb250ZXh0KTtcbn1cblxuLyoqXG5FeHRyYWN0cyB0aGUgZnVsbCBjb250ZW50cyBvZiBhIGdyb3VwIChzdWJwYXR0ZXJuKSBmcm9tIHRoZSBnaXZlbiBleHByZXNzaW9uLCBhY2NvdW50aW5nIGZvclxuZXNjYXBlZCBjaGFyYWN0ZXJzLCBuZXN0ZWQgZ3JvdXBzLCBhbmQgY2hhcmFjdGVyIGNsYXNzZXMuIFRoZSBncm91cCBpcyBpZGVudGlmaWVkIGJ5IHRoZSBwb3NpdGlvblxud2hlcmUgaXRzIGNvbnRlbnRzIHN0YXJ0ICh0aGUgc3RyaW5nIGluZGV4IGp1c3QgYWZ0ZXIgdGhlIGdyb3VwJ3Mgb3BlbmluZyBkZWxpbWl0ZXIpLiBSZXR1cm5zIHRoZVxucmVzdCBvZiB0aGUgc3RyaW5nIGlmIHRoZSBncm91cCBpcyB1bmNsb3NlZC5cblxuQXNzdW1lcyBVbmljb2RlU2V0cy1tb2RlIHN5bnRheC5cbkBwYXJhbSB7c3RyaW5nfSBleHByZXNzaW9uIFNlYXJjaCB0YXJnZXRcbkBwYXJhbSB7bnVtYmVyfSBjb250ZW50c1N0YXJ0UG9zXG5AcmV0dXJucyB7c3RyaW5nfVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRHcm91cENvbnRlbnRzKGV4cHJlc3Npb24sIGNvbnRlbnRzU3RhcnRQb3MpIHtcbiAgY29uc3QgdG9rZW4gPSAvXFxcXD8uL2dzdTtcbiAgdG9rZW4ubGFzdEluZGV4ID0gY29udGVudHNTdGFydFBvcztcbiAgbGV0IGNvbnRlbnRzRW5kUG9zID0gZXhwcmVzc2lvbi5sZW5ndGg7XG4gIGxldCBudW1DaGFyQ2xhc3Nlc09wZW4gPSAwO1xuICAvLyBTdGFydGluZyBzZWFyY2ggd2l0aGluIGFuIG9wZW4gZ3JvdXAsIGFmdGVyIHRoZSBncm91cCdzIG9wZW5pbmdcbiAgbGV0IG51bUdyb3Vwc09wZW4gPSAxO1xuICBsZXQgbWF0Y2g7XG4gIHdoaWxlIChtYXRjaCA9IHRva2VuLmV4ZWMoZXhwcmVzc2lvbikpIHtcbiAgICBjb25zdCBbbV0gPSBtYXRjaDtcbiAgICBpZiAobSA9PT0gJ1snKSB7XG4gICAgICBudW1DaGFyQ2xhc3Nlc09wZW4rKztcbiAgICB9IGVsc2UgaWYgKCFudW1DaGFyQ2xhc3Nlc09wZW4pIHtcbiAgICAgIGlmIChtID09PSAnKCcpIHtcbiAgICAgICAgbnVtR3JvdXBzT3BlbisrO1xuICAgICAgfSBlbHNlIGlmIChtID09PSAnKScpIHtcbiAgICAgICAgbnVtR3JvdXBzT3Blbi0tO1xuICAgICAgICBpZiAoIW51bUdyb3Vwc09wZW4pIHtcbiAgICAgICAgICBjb250ZW50c0VuZFBvcyA9IG1hdGNoLmluZGV4O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChtID09PSAnXScpIHtcbiAgICAgIG51bUNoYXJDbGFzc2VzT3Blbi0tO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZXhwcmVzc2lvbi5zbGljZShjb250ZW50c1N0YXJ0UG9zLCBjb250ZW50c0VuZFBvcyk7XG59XG4iLAogICAgImltcG9ydCB7aW5jcmVtZW50SWZBdExlYXN0LCBub25jYXB0dXJpbmdEZWxpbSwgc3BsaWNlU3RyfSBmcm9tICcuL3V0aWxzLWludGVybmFscy5qcyc7XG5pbXBvcnQge0NvbnRleHQsIHJlcGxhY2VVbmVzY2FwZWR9IGZyb20gJ3JlZ2V4LXV0aWxpdGllcyc7XG4vKipcbkBpbXBvcnQge1BsdWdpbkRhdGEsIFBsdWdpblJlc3VsdH0gZnJvbSAnLi9yZWdleC5qcyc7XG4qL1xuXG5jb25zdCBhdG9taWNQbHVnaW5Ub2tlbiA9IG5ldyBSZWdFeHAoU3RyaW5nLnJhd2AoPzxub25jYXB0dXJpbmdTdGFydD4ke25vbmNhcHR1cmluZ0RlbGltfSl8KD88Y2FwdHVyaW5nU3RhcnQ+XFwoKD86XFw/PFtePl0rPik/KXxcXFxcPy5gLCAnZ3N1Jyk7XG5cbi8qKlxuQXBwbHkgdHJhbnNmb3JtYXRpb25zIGZvciBhdG9taWMgZ3JvdXBzOiBgKD8+4oCmKWAuXG5AcGFyYW0ge3N0cmluZ30gZXhwcmVzc2lvblxuQHBhcmFtIHtQbHVnaW5EYXRhfSBbZGF0YV1cbkByZXR1cm5zIHtSZXF1aXJlZDxQbHVnaW5SZXN1bHQ+fVxuKi9cbmZ1bmN0aW9uIGF0b21pYyhleHByZXNzaW9uLCBkYXRhKSB7XG4gIGNvbnN0IGhpZGRlbkNhcHR1cmVzID0gZGF0YT8uaGlkZGVuQ2FwdHVyZXMgPz8gW107XG4gIC8vIENhcHR1cmUgdHJhbnNmZXIgaXMgdXNlZCBieSA8Z2l0aHViLmNvbS9zbGV2aXRoYW4vb25pZ3VydW1hLXRvLWVzPlxuICBsZXQgY2FwdHVyZVRyYW5zZmVycyA9IGRhdGE/LmNhcHR1cmVUcmFuc2ZlcnMgPz8gbmV3IE1hcCgpO1xuICBpZiAoIS9cXChcXD8+Ly50ZXN0KGV4cHJlc3Npb24pKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBhdHRlcm46IGV4cHJlc3Npb24sXG4gICAgICBjYXB0dXJlVHJhbnNmZXJzLFxuICAgICAgaGlkZGVuQ2FwdHVyZXMsXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0IGFHRGVsaW0gPSAnKD8+JztcbiAgY29uc3QgZW11bGF0ZWRBR0RlbGltID0gJyg/Oig/PSgnO1xuICBjb25zdCBjYXB0dXJlTnVtTWFwID0gWzBdO1xuICBjb25zdCBhZGRlZEhpZGRlbkNhcHR1cmVzID0gW107XG4gIGxldCBudW1DYXB0dXJlc0JlZm9yZUFHID0gMDtcbiAgbGV0IG51bUFHcyA9IDA7XG4gIGxldCBhR1BvcyA9IE5hTjtcbiAgbGV0IGhhc1Byb2Nlc3NlZEFHO1xuICBkbyB7XG4gICAgaGFzUHJvY2Vzc2VkQUcgPSBmYWxzZTtcbiAgICBsZXQgbnVtQ2hhckNsYXNzZXNPcGVuID0gMDtcbiAgICBsZXQgbnVtR3JvdXBzT3BlbkluQUcgPSAwO1xuICAgIGxldCBpbkFHID0gZmFsc2U7XG4gICAgbGV0IG1hdGNoO1xuICAgIGF0b21pY1BsdWdpblRva2VuLmxhc3RJbmRleCA9IE51bWJlci5pc05hTihhR1BvcykgPyAwIDogYUdQb3MgKyBlbXVsYXRlZEFHRGVsaW0ubGVuZ3RoO1xuICAgIHdoaWxlIChtYXRjaCA9IGF0b21pY1BsdWdpblRva2VuLmV4ZWMoZXhwcmVzc2lvbikpIHtcbiAgICAgIGNvbnN0IHswOiBtLCBpbmRleCwgZ3JvdXBzOiB7Y2FwdHVyaW5nU3RhcnQsIG5vbmNhcHR1cmluZ1N0YXJ0fX0gPSBtYXRjaDtcbiAgICAgIGlmIChtID09PSAnWycpIHtcbiAgICAgICAgbnVtQ2hhckNsYXNzZXNPcGVuKys7XG4gICAgICB9IGVsc2UgaWYgKCFudW1DaGFyQ2xhc3Nlc09wZW4pIHtcblxuICAgICAgICBpZiAobSA9PT0gYUdEZWxpbSAmJiAhaW5BRykge1xuICAgICAgICAgIGFHUG9zID0gaW5kZXg7XG4gICAgICAgICAgaW5BRyA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoaW5BRyAmJiBub25jYXB0dXJpbmdTdGFydCkge1xuICAgICAgICAgIG51bUdyb3Vwc09wZW5JbkFHKys7XG4gICAgICAgIH0gZWxzZSBpZiAoY2FwdHVyaW5nU3RhcnQpIHtcbiAgICAgICAgICBpZiAoaW5BRykge1xuICAgICAgICAgICAgbnVtR3JvdXBzT3BlbkluQUcrKztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbnVtQ2FwdHVyZXNCZWZvcmVBRysrO1xuICAgICAgICAgICAgY2FwdHVyZU51bU1hcC5wdXNoKG51bUNhcHR1cmVzQmVmb3JlQUcgKyBudW1BR3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChtID09PSAnKScgJiYgaW5BRykge1xuICAgICAgICAgIGlmICghbnVtR3JvdXBzT3BlbkluQUcpIHtcbiAgICAgICAgICAgIG51bUFHcysrO1xuICAgICAgICAgICAgY29uc3QgYWRkZWRDYXB0dXJlTnVtID0gbnVtQ2FwdHVyZXNCZWZvcmVBRyArIG51bUFHcztcbiAgICAgICAgICAgIC8vIFJlcGxhY2UgYGV4cHJlc3Npb25gIGFuZCB1c2UgYDwkJE4+YCBhcyBhIHRlbXBvcmFyeSB3cmFwcGVyIGZvciB0aGUgYmFja3JlZiBzbyBpdFxuICAgICAgICAgICAgLy8gY2FuIGF2b2lkIGJhY2tyZWYgcmVudW1iZXJpbmcgYWZ0ZXJ3YXJkLiBXcmFwIHRoZSB3aG9sZSBzdWJzdGl0dXRpb24gKGluY2x1ZGluZyB0aGVcbiAgICAgICAgICAgIC8vIGxvb2thaGVhZCBhbmQgZm9sbG93aW5nIGJhY2tyZWYpIGluIGEgbm9uY2FwdHVyaW5nIGdyb3VwIHRvIGhhbmRsZSBmb2xsb3dpbmdcbiAgICAgICAgICAgIC8vIHF1YW50aWZpZXJzIGFuZCBsaXRlcmFsIGRpZ2l0c1xuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGAke2V4cHJlc3Npb24uc2xpY2UoMCwgYUdQb3MpfSR7ZW11bGF0ZWRBR0RlbGltfSR7XG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbi5zbGljZShhR1BvcyArIGFHRGVsaW0ubGVuZ3RoLCBpbmRleClcbiAgICAgICAgICAgICAgfSkpPCQkJHthZGRlZENhcHR1cmVOdW19Pikke2V4cHJlc3Npb24uc2xpY2UoaW5kZXggKyAxKX1gO1xuICAgICAgICAgICAgaGFzUHJvY2Vzc2VkQUcgPSB0cnVlO1xuICAgICAgICAgICAgYWRkZWRIaWRkZW5DYXB0dXJlcy5wdXNoKGFkZGVkQ2FwdHVyZU51bSk7XG4gICAgICAgICAgICBpbmNyZW1lbnRJZkF0TGVhc3QoaGlkZGVuQ2FwdHVyZXMsIGFkZGVkQ2FwdHVyZU51bSk7XG4gICAgICAgICAgICBpZiAoY2FwdHVyZVRyYW5zZmVycy5zaXplKSB7XG4gICAgICAgICAgICAgIGNvbnN0IG5ld0NhcHR1cmVUcmFuc2ZlcnMgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICAgIGNhcHR1cmVUcmFuc2ZlcnMuZm9yRWFjaCgoZnJvbSwgdG8pID0+IHtcbiAgICAgICAgICAgICAgICBuZXdDYXB0dXJlVHJhbnNmZXJzLnNldChcbiAgICAgICAgICAgICAgICAgIHRvID49IGFkZGVkQ2FwdHVyZU51bSA/IHRvICsgMSA6IHRvLFxuICAgICAgICAgICAgICAgICAgZnJvbS5tYXAoZiA9PiBmID49IGFkZGVkQ2FwdHVyZU51bSA/IGYgKyAxIDogZilcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgY2FwdHVyZVRyYW5zZmVycyA9IG5ld0NhcHR1cmVUcmFuc2ZlcnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgbnVtR3JvdXBzT3BlbkluQUctLTtcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2UgaWYgKG0gPT09ICddJykge1xuICAgICAgICBudW1DaGFyQ2xhc3Nlc09wZW4tLTtcbiAgICAgIH1cbiAgICB9XG4gIC8vIFN0YXJ0IG92ZXIgZnJvbSB0aGUgYmVnaW5uaW5nIG9mIHRoZSBhdG9taWMgZ3JvdXAncyBjb250ZW50cywgaW4gY2FzZSB0aGUgcHJvY2Vzc2VkIGdyb3VwXG4gIC8vIGNvbnRhaW5zIGFkZGl0aW9uYWwgYXRvbWljIGdyb3Vwc1xuICB9IHdoaWxlIChoYXNQcm9jZXNzZWRBRyk7XG5cbiAgaGlkZGVuQ2FwdHVyZXMucHVzaCguLi5hZGRlZEhpZGRlbkNhcHR1cmVzKTtcblxuICAvLyBTZWNvbmQgcGFzcyB0byBhZGp1c3QgbnVtYmVyZWQgYmFja3JlZnNcbiAgZXhwcmVzc2lvbiA9IHJlcGxhY2VVbmVzY2FwZWQoXG4gICAgZXhwcmVzc2lvbixcbiAgICBTdHJpbmcucmF3YFxcXFwoPzxiYWNrcmVmTnVtPlsxLTldXFxkKil8PFxcJFxcJCg/PHdyYXBwZWRCYWNrcmVmTnVtPlxcZCspPmAsXG4gICAgKHswOiBtLCBncm91cHM6IHtiYWNrcmVmTnVtLCB3cmFwcGVkQmFja3JlZk51bX19KSA9PiB7XG4gICAgICBpZiAoYmFja3JlZk51bSkge1xuICAgICAgICBjb25zdCBiTnVtID0gK2JhY2tyZWZOdW07XG4gICAgICAgIGlmIChiTnVtID4gY2FwdHVyZU51bU1hcC5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBCYWNrcmVmIFwiJHttfVwiIGdyZWF0ZXIgdGhhbiBudW1iZXIgb2YgY2FwdHVyZXNgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYFxcXFwke2NhcHR1cmVOdW1NYXBbYk51bV19YDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBgXFxcXCR7d3JhcHBlZEJhY2tyZWZOdW19YDtcbiAgICB9LFxuICAgIENvbnRleHQuREVGQVVMVFxuICApO1xuXG4gIHJldHVybiB7XG4gICAgcGF0dGVybjogZXhwcmVzc2lvbixcbiAgICBjYXB0dXJlVHJhbnNmZXJzLFxuICAgIGhpZGRlbkNhcHR1cmVzLFxuICB9O1xufVxuXG5jb25zdCBiYXNlUXVhbnRpZmllciA9IFN0cmluZy5yYXdgKD86Wz8qK118XFx7XFxkKyg/OixcXGQqKT9cXH0pYDtcbi8vIENvbXBsZXRlIHRva2VuaXplciBmb3IgYmFzZSBzeW50YXg7IGRvZXNuJ3QgKG5lZWQgdG8pIGtub3cgYWJvdXQgY2hhcmFjdGVyLWNsYXNzLW9ubHkgc3ludGF4XG5jb25zdCBwb3NzZXNzaXZlUGx1Z2luVG9rZW4gPSBuZXcgUmVnRXhwKFN0cmluZy5yYXdgXG5cXFxcKD86IFxcZCtcbiAgfCBjW0EtWmEtel1cbiAgfCBbZ2tdPFtePl0rPlxuICB8IFtwUHVdXFx7W15cXH1dK1xcfVxuICB8IHVbQS1GYS1mXFxkXXs0fVxuICB8IHhbQS1GYS1mXFxkXXsyfVxuICApXG58IFxcKCg/OiBcXD8gKD86IFs6PSE+XVxuICB8IDwoPzpbPSFdfFtePl0rPilcbiAgfCBbQS1aYS16XFwtXSs6XG4gIHwgXFwoREVGSU5FXFwpXG4gICkpP1xufCAoPzxxQmFzZT4ke2Jhc2VRdWFudGlmaWVyfSkoPzxxTW9kPls/K10/KSg/PGludmFsaWRRPls/KitcXHtdPylcbnwgXFxcXD8uXG5gLnJlcGxhY2UoL1xccysvZywgJycpLCAnZ3N1Jyk7XG5cbi8qKlxuVHJhbnNmb3JtIHBvc2Vzc2l2ZSBxdWFudGlmaWVycyBpbnRvIGF0b21pYyBncm91cHMuIFRoZSBwb3Nlc3Nlc3NpdmUgcXVhbnRpZmllcnMgYXJlOlxuYD8rYCwgYCorYCwgYCsrYCwgYHtOfStgLCBge04sfStgLCBge04sTn0rYC5cblRoaXMgZm9sbG93cyBKYXZhLCBQQ1JFLCBQZXJsLCBhbmQgUHl0aG9uLlxuUG9zc2Vzc2l2ZSBxdWFudGlmaWVycyBpbiBPbmlndXJ1bWEgYW5kIE9uaWdtbyBhcmUgb25seTogYD8rYCwgYCorYCwgYCsrYC5cbkBwYXJhbSB7c3RyaW5nfSBleHByZXNzaW9uXG5AcmV0dXJucyB7UGx1Z2luUmVzdWx0fVxuKi9cbmZ1bmN0aW9uIHBvc3Nlc3NpdmUoZXhwcmVzc2lvbikge1xuICBpZiAoIShuZXcgUmVnRXhwKGAke2Jhc2VRdWFudGlmaWVyfVxcXFwrYCkudGVzdChleHByZXNzaW9uKSkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcGF0dGVybjogZXhwcmVzc2lvbixcbiAgICB9O1xuICB9XG5cbiAgY29uc3Qgb3Blbkdyb3VwSW5kaWNlcyA9IFtdO1xuICBsZXQgbGFzdEdyb3VwSW5kZXggPSBudWxsO1xuICBsZXQgbGFzdENoYXJDbGFzc0luZGV4ID0gbnVsbDtcbiAgbGV0IGxhc3RUb2tlbiA9ICcnO1xuICBsZXQgbnVtQ2hhckNsYXNzZXNPcGVuID0gMDtcbiAgbGV0IG1hdGNoO1xuICBwb3NzZXNzaXZlUGx1Z2luVG9rZW4ubGFzdEluZGV4ID0gMDtcbiAgd2hpbGUgKG1hdGNoID0gcG9zc2Vzc2l2ZVBsdWdpblRva2VuLmV4ZWMoZXhwcmVzc2lvbikpIHtcbiAgICBjb25zdCB7MDogbSwgaW5kZXgsIGdyb3Vwczoge3FCYXNlLCBxTW9kLCBpbnZhbGlkUX19ID0gbWF0Y2g7XG4gICAgaWYgKG0gPT09ICdbJykge1xuICAgICAgaWYgKCFudW1DaGFyQ2xhc3Nlc09wZW4pIHtcbiAgICAgICAgbGFzdENoYXJDbGFzc0luZGV4ID0gaW5kZXg7XG4gICAgICB9XG4gICAgICBudW1DaGFyQ2xhc3Nlc09wZW4rKztcbiAgICB9IGVsc2UgaWYgKG0gPT09ICddJykge1xuICAgICAgaWYgKG51bUNoYXJDbGFzc2VzT3Blbikge1xuICAgICAgICBudW1DaGFyQ2xhc3Nlc09wZW4tLTtcbiAgICAgIC8vIFVubWF0Y2hlZCBgXWBcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxhc3RDaGFyQ2xhc3NJbmRleCA9IG51bGw7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghbnVtQ2hhckNsYXNzZXNPcGVuKSB7XG5cbiAgICAgIGlmIChxTW9kID09PSAnKycgJiYgbGFzdFRva2VuICYmICFsYXN0VG9rZW4uc3RhcnRzV2l0aCgnKCcpKSB7XG4gICAgICAgIC8vIEludmFsaWQgZm9sbG93aW5nIHF1YW50aWZpZXIgd291bGQgYmVjb21lIHZhbGlkIHZpYSB0aGUgd3JhcHBpbmcgZ3JvdXBcbiAgICAgICAgaWYgKGludmFsaWRRKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHF1YW50aWZpZXIgXCIke219XCJgKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgY2hhcnNBZGRlZCA9IC0xOyAvLyAtMSBmb3IgcmVtb3ZlZCB0cmFpbGluZyBgK2BcbiAgICAgICAgLy8gUG9zc2Vzc2l2aXppbmcgZml4ZWQgcmVwZXRpdGlvbiBxdWFudGlmaWVycyBsaWtlIGB7Mn1gIGRvZXMndCBjaGFuZ2UgdGhlaXIgYmVoYXZpb3IsIHNvXG4gICAgICAgIC8vIGF2b2lkIGRvaW5nIHNvIChjb252ZXJ0IHRoZW0gdG8gZ3JlZWR5KVxuICAgICAgICBpZiAoL15cXHtcXGQrXFx9JC8udGVzdChxQmFzZSkpIHtcbiAgICAgICAgICBleHByZXNzaW9uID0gc3BsaWNlU3RyKGV4cHJlc3Npb24sIGluZGV4ICsgcUJhc2UubGVuZ3RoLCBxTW9kLCAnJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGxhc3RUb2tlbiA9PT0gJyknIHx8IGxhc3RUb2tlbiA9PT0gJ10nKSB7XG4gICAgICAgICAgICBjb25zdCBub2RlSW5kZXggPSBsYXN0VG9rZW4gPT09ICcpJyA/IGxhc3RHcm91cEluZGV4IDogbGFzdENoYXJDbGFzc0luZGV4O1xuICAgICAgICAgICAgLy8gVW5tYXRjaGVkIGApYCB3b3VsZCBicmVhayBvdXQgb2YgdGhlIHdyYXBwaW5nIGdyb3VwIGFuZCBtZXNzIHdpdGggaGFuZGxpbmcuXG4gICAgICAgICAgICAvLyBVbm1hdGNoZWQgYF1gIHdvdWxkbid0IGJlIGEgcHJvYmxlbSwgYnV0IGl0J3MgdW5uZWNlc3NhcnkgdG8gaGF2ZSBkZWRpY2F0ZWQgc3VwcG9ydFxuICAgICAgICAgICAgLy8gZm9yIHVuZXNjYXBlZCBgXSsrYCBzaW5jZSB0aGlzIHdvbid0IHdvcmsgd2l0aCBmbGFnIHUgb3IgdiBhbnl3YXlcbiAgICAgICAgICAgIGlmIChub2RlSW5kZXggPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHVubWF0Y2hlZCBcIiR7bGFzdFRva2VufVwiYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBleHByZXNzaW9uID0gYCR7ZXhwcmVzc2lvbi5zbGljZSgwLCBub2RlSW5kZXgpfSg/PiR7ZXhwcmVzc2lvbi5zbGljZShub2RlSW5kZXgsIGluZGV4KX0ke3FCYXNlfSkke2V4cHJlc3Npb24uc2xpY2UoaW5kZXggKyBtLmxlbmd0aCl9YDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGAke2V4cHJlc3Npb24uc2xpY2UoMCwgaW5kZXggLSBsYXN0VG9rZW4ubGVuZ3RoKX0oPz4ke2xhc3RUb2tlbn0ke3FCYXNlfSkke2V4cHJlc3Npb24uc2xpY2UoaW5kZXggKyBtLmxlbmd0aCl9YDtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2hhcnNBZGRlZCArPSA0OyAvLyBgKD8+KWBcbiAgICAgICAgfVxuICAgICAgICBwb3NzZXNzaXZlUGx1Z2luVG9rZW4ubGFzdEluZGV4ICs9IGNoYXJzQWRkZWQ7XG4gICAgICB9IGVsc2UgaWYgKG1bMF0gPT09ICcoJykge1xuICAgICAgICBvcGVuR3JvdXBJbmRpY2VzLnB1c2goaW5kZXgpO1xuICAgICAgfSBlbHNlIGlmIChtID09PSAnKScpIHtcbiAgICAgICAgbGFzdEdyb3VwSW5kZXggPSBvcGVuR3JvdXBJbmRpY2VzLmxlbmd0aCA/IG9wZW5Hcm91cEluZGljZXMucG9wKCkgOiBudWxsO1xuICAgICAgfVxuXG4gICAgfVxuICAgIGxhc3RUb2tlbiA9IG07XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHBhdHRlcm46IGV4cHJlc3Npb24sXG4gIH07XG59XG5cbmV4cG9ydCB7XG4gIGF0b21pYyxcbiAgcG9zc2Vzc2l2ZSxcbn07XG4iLAogICAgImltcG9ydCB7Q29udGV4dCwgZm9yRWFjaFVuZXNjYXBlZCwgZ2V0R3JvdXBDb250ZW50cywgaGFzVW5lc2NhcGVkLCByZXBsYWNlVW5lc2NhcGVkfSBmcm9tICdyZWdleC11dGlsaXRpZXMnO1xuXG5jb25zdCByID0gU3RyaW5nLnJhdztcbmNvbnN0IGdSVG9rZW4gPSByYFxcXFxnPCg/PGdSTmFtZU9yTnVtPltePiZdKykmUj0oPzxnUkRlcHRoPltePl0rKT5gO1xuY29uc3QgcmVjdXJzaXZlVG9rZW4gPSByYFxcKFxcP1I9KD88ckRlcHRoPlteXFwpXSspXFwpfCR7Z1JUb2tlbn1gO1xuY29uc3QgbmFtZWRDYXB0dXJlRGVsaW0gPSByYFxcKFxcPzwoPyFbPSFdKSg/PGNhcHR1cmVOYW1lPltePl0rKT5gO1xuY29uc3QgY2FwdHVyZURlbGltID0gcmAke25hbWVkQ2FwdHVyZURlbGltfXwoPzx1bm5hbWVkPlxcKCkoPyFcXD8pYDtcbmNvbnN0IHRva2VuID0gbmV3IFJlZ0V4cChyYCR7bmFtZWRDYXB0dXJlRGVsaW19fCR7cmVjdXJzaXZlVG9rZW59fFxcKFxcP3xcXFxcPy5gLCAnZ3N1Jyk7XG5jb25zdCBvdmVybGFwcGluZ1JlY3Vyc2lvbk1zZyA9ICdDYW5ub3QgdXNlIG11bHRpcGxlIG92ZXJsYXBwaW5nIHJlY3Vyc2lvbnMnO1xuXG4vKipcbkBwYXJhbSB7c3RyaW5nfSBwYXR0ZXJuXG5AcGFyYW0ge3tcbiAgZmxhZ3M/OiBzdHJpbmc7XG4gIGNhcHR1cmVUcmFuc2ZlcnM/OiBNYXA8bnVtYmVyLCBBcnJheTxudW1iZXI+PjtcbiAgaGlkZGVuQ2FwdHVyZXM/OiBBcnJheTxudW1iZXI+O1xuICBtb2RlPzogJ3BsdWdpbicgfCAnZXh0ZXJuYWwnO1xufX0gW2RhdGFdXG5AcmV0dXJucyB7e1xuICBwYXR0ZXJuOiBzdHJpbmc7XG4gIGNhcHR1cmVUcmFuc2ZlcnM6IE1hcDxudW1iZXIsIEFycmF5PG51bWJlcj4+O1xuICBoaWRkZW5DYXB0dXJlczogQXJyYXk8bnVtYmVyPjtcbn19XG4qL1xuZnVuY3Rpb24gcmVjdXJzaW9uKHBhdHRlcm4sIGRhdGEpIHtcbiAgY29uc3Qge2hpZGRlbkNhcHR1cmVzLCBtb2RlfSA9IHtcbiAgICBoaWRkZW5DYXB0dXJlczogW10sXG4gICAgbW9kZTogJ3BsdWdpbicsXG4gICAgLi4uZGF0YSxcbiAgfTtcbiAgLy8gQ2FwdHVyZSB0cmFuc2ZlciBpcyB1c2VkIGJ5IDxnaXRodWIuY29tL3NsZXZpdGhhbi9vbmlndXJ1bWEtdG8tZXM+XG4gIGxldCBjYXB0dXJlVHJhbnNmZXJzID0gZGF0YT8uY2FwdHVyZVRyYW5zZmVycyA/PyBuZXcgTWFwKCk7XG4gIC8vIEtlZXAgdGhlIGluaXRpYWwgZmFpbC1jaGVjayAod2hpY2ggYXZvaWRzIHVubmVlZGVkIHByb2Nlc3NpbmcpIGFzIGZhc3QgYXMgcG9zc2libGUgYnkgdGVzdGluZ1xuICAvLyB3aXRob3V0IHRoZSBhY2N1cmFjeSBpbXByb3ZlbWVudCBvZiB1c2luZyBgaGFzVW5lc2NhcGVkYCB3aXRoIGBDb250ZXh0LkRFRkFVTFRgXG4gIGlmICghKG5ldyBSZWdFeHAocmVjdXJzaXZlVG9rZW4sICdzdScpLnRlc3QocGF0dGVybikpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBhdHRlcm4sXG4gICAgICBjYXB0dXJlVHJhbnNmZXJzLFxuICAgICAgaGlkZGVuQ2FwdHVyZXMsXG4gICAgfTtcbiAgfVxuICBpZiAobW9kZSA9PT0gJ3BsdWdpbicgJiYgaGFzVW5lc2NhcGVkKHBhdHRlcm4sIHJgXFwoXFw/XFwoREVGSU5FXFwpYCwgQ29udGV4dC5ERUZBVUxUKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignREVGSU5FIGdyb3VwcyBjYW5ub3QgYmUgdXNlZCB3aXRoIHJlY3Vyc2lvbicpO1xuICB9XG5cbiAgY29uc3QgYWRkZWRIaWRkZW5DYXB0dXJlcyA9IFtdO1xuICBjb25zdCBoYXNOdW1iZXJlZEJhY2tyZWYgPSBoYXNVbmVzY2FwZWQocGF0dGVybiwgcmBcXFxcWzEtOV1gLCBDb250ZXh0LkRFRkFVTFQpO1xuICBjb25zdCBncm91cENvbnRlbnRzU3RhcnRQb3MgPSBuZXcgTWFwKCk7XG4gIGNvbnN0IG9wZW5Hcm91cHMgPSBbXTtcbiAgbGV0IGhhc1JlY3Vyc2VkID0gZmFsc2U7XG4gIGxldCBudW1DaGFyQ2xhc3Nlc09wZW4gPSAwO1xuICBsZXQgbnVtQ2FwdHVyZXNQYXNzZWQgPSAwO1xuICBsZXQgbWF0Y2g7XG4gIHRva2VuLmxhc3RJbmRleCA9IDA7XG4gIHdoaWxlICgobWF0Y2ggPSB0b2tlbi5leGVjKHBhdHRlcm4pKSkge1xuICAgIGNvbnN0IHswOiBtLCBncm91cHM6IHtjYXB0dXJlTmFtZSwgckRlcHRoLCBnUk5hbWVPck51bSwgZ1JEZXB0aH19ID0gbWF0Y2g7XG4gICAgaWYgKG0gPT09ICdbJykge1xuICAgICAgbnVtQ2hhckNsYXNzZXNPcGVuKys7XG4gICAgfSBlbHNlIGlmICghbnVtQ2hhckNsYXNzZXNPcGVuKSB7XG5cbiAgICAgIC8vIGAoP1I9TilgXG4gICAgICBpZiAockRlcHRoKSB7XG4gICAgICAgIGFzc2VydE1heEluQm91bmRzKHJEZXB0aCk7XG4gICAgICAgIGlmIChoYXNSZWN1cnNlZCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihvdmVybGFwcGluZ1JlY3Vyc2lvbk1zZyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhc051bWJlcmVkQmFja3JlZikge1xuICAgICAgICAgIC8vIENvdWxkIGFkZCBzdXBwb3J0IGZvciBudW1iZXJlZCBiYWNrcmVmcyB3aXRoIGV4dHJhIGVmZm9ydCwgYnV0IGl0J3MgcHJvYmFibHkgbm90IHdvcnRoXG4gICAgICAgICAgLy8gaXQuIFRvIHRyaWdnZXIgdGhpcyBlcnJvciwgdGhlIHJlZ2V4IG11c3QgaW5jbHVkZSByZWN1cnNpb24gYW5kIG9uZSBvZiB0aGUgZm9sbG93aW5nOlxuICAgICAgICAgIC8vIC0gQW4gaW50ZXJwb2xhdGVkIHJlZ2V4IHRoYXQgY29udGFpbnMgYSBudW1iZXJlZCBiYWNrcmVmIChzaW5jZSBvdGhlciBudW1iZXJlZFxuICAgICAgICAgIC8vICAgYmFja3JlZnMgYXJlIHByZXZlbnRlZCBieSBpbXBsaWNpdCBmbGFnIG4pLlxuICAgICAgICAgIC8vIC0gQSBudW1iZXJlZCBiYWNrcmVmLCB3aGVuIGZsYWcgbiBpcyBleHBsaWNpdGx5IGRpc2FibGVkLlxuICAgICAgICAgIC8vIE5vdGUgdGhhdCBSZWdleCsncyBleHRlbmRlZCBzeW50YXggKGF0b21pYyBncm91cHMgYW5kIHNvbWV0aW1lcyBzdWJyb3V0aW5lcykgY2FuIGFsc29cbiAgICAgICAgICAvLyBhZGQgbnVtYmVyZWQgYmFja3JlZnMsIGJ1dCB0aG9zZSB3b3JrIGZpbmUgYmVjYXVzZSBleHRlcm5hbCBwbHVnaW5zIGxpa2UgdGhpcyBvbmUgcnVuXG4gICAgICAgICAgLy8gKmJlZm9yZSogdGhlIHRyYW5zZm9ybWF0aW9uIG9mIGJ1aWx0LWluIHN5bnRheCBleHRlbnNpb25zXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgLy8gV2hlbiB1c2VkIGluIGBleHRlcm5hbGAgbW9kZSBieSB0cmFuc3BpbGVycyBvdGhlciB0aGFuIFJlZ2V4KywgYmFja3JlZnMgbWlnaHQgaGF2ZVxuICAgICAgICAgICAgLy8gZ29uZSB0aHJvdWdoIGNvbnZlcnNpb24gZnJvbSBuYW1lZCB0byBudW1iZXJlZCwgc28gYXZvaWQgYSBtaXNsZWFkaW5nIGVycm9yXG4gICAgICAgICAgICBgJHttb2RlID09PSAnZXh0ZXJuYWwnID8gJ0JhY2tyZWZzJyA6ICdOdW1iZXJlZCBiYWNrcmVmcyd9IGNhbm5vdCBiZSB1c2VkIHdpdGggZ2xvYmFsIHJlY3Vyc2lvbmBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGxlZnQgPSBwYXR0ZXJuLnNsaWNlKDAsIG1hdGNoLmluZGV4KTtcbiAgICAgICAgY29uc3QgcmlnaHQgPSBwYXR0ZXJuLnNsaWNlKHRva2VuLmxhc3RJbmRleCk7XG4gICAgICAgIGlmIChoYXNVbmVzY2FwZWQocmlnaHQsIHJlY3Vyc2l2ZVRva2VuLCBDb250ZXh0LkRFRkFVTFQpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKG92ZXJsYXBwaW5nUmVjdXJzaW9uTXNnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXBzID0gK3JEZXB0aCAtIDE7XG4gICAgICAgIHBhdHRlcm4gPSBtYWtlUmVjdXJzaXZlKFxuICAgICAgICAgIGxlZnQsXG4gICAgICAgICAgcmlnaHQsXG4gICAgICAgICAgcmVwcyxcbiAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICBoaWRkZW5DYXB0dXJlcyxcbiAgICAgICAgICBhZGRlZEhpZGRlbkNhcHR1cmVzLFxuICAgICAgICAgIG51bUNhcHR1cmVzUGFzc2VkXG4gICAgICAgICk7XG4gICAgICAgIGNhcHR1cmVUcmFuc2ZlcnMgPSBtYXBDYXB0dXJlVHJhbnNmZXJzKFxuICAgICAgICAgIGNhcHR1cmVUcmFuc2ZlcnMsXG4gICAgICAgICAgbGVmdCxcbiAgICAgICAgICByZXBzLFxuICAgICAgICAgIGFkZGVkSGlkZGVuQ2FwdHVyZXMubGVuZ3RoLFxuICAgICAgICAgIDAsXG4gICAgICAgICAgbnVtQ2FwdHVyZXNQYXNzZWRcbiAgICAgICAgKTtcbiAgICAgICAgLy8gTm8gbmVlZCB0byBwYXJzZSBmdXJ0aGVyXG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gYFxcZzxuYW1lJlI9Tj5gLCBgXFxnPG51bWJlciZSPU4+YFxuICAgICAgfSBlbHNlIGlmIChnUk5hbWVPck51bSkge1xuICAgICAgICBhc3NlcnRNYXhJbkJvdW5kcyhnUkRlcHRoKTtcbiAgICAgICAgbGV0IGlzV2l0aGluUmVmZmVkR3JvdXAgPSBmYWxzZTtcbiAgICAgICAgZm9yIChjb25zdCBnIG9mIG9wZW5Hcm91cHMpIHtcbiAgICAgICAgICBpZiAoZy5uYW1lID09PSBnUk5hbWVPck51bSB8fCBnLm51bSA9PT0gK2dSTmFtZU9yTnVtKSB7XG4gICAgICAgICAgICBpc1dpdGhpblJlZmZlZEdyb3VwID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChnLmhhc1JlY3Vyc2VkV2l0aGluKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihvdmVybGFwcGluZ1JlY3Vyc2lvbk1zZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc1dpdGhpblJlZmZlZEdyb3VwKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJgUmVjdXJzaXZlIFxcZyBjYW5ub3QgYmUgdXNlZCBvdXRzaWRlIHRoZSByZWZlcmVuY2VkIGdyb3VwIFwiJHtcbiAgICAgICAgICAgIG1vZGUgPT09ICdleHRlcm5hbCcgPyBnUk5hbWVPck51bSA6IHJgXFxnPCR7Z1JOYW1lT3JOdW19JlI9JHtnUkRlcHRofT5gXG4gICAgICAgICAgfVwiYCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc3RhcnRQb3MgPSBncm91cENvbnRlbnRzU3RhcnRQb3MuZ2V0KGdSTmFtZU9yTnVtKTtcbiAgICAgICAgY29uc3QgZ3JvdXBDb250ZW50cyA9IGdldEdyb3VwQ29udGVudHMocGF0dGVybiwgc3RhcnRQb3MpO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgaGFzTnVtYmVyZWRCYWNrcmVmICYmXG4gICAgICAgICAgaGFzVW5lc2NhcGVkKGdyb3VwQ29udGVudHMsIHJgJHtuYW1lZENhcHR1cmVEZWxpbX18XFwoKD8hXFw/KWAsIENvbnRleHQuREVGQVVMVClcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgLy8gV2hlbiB1c2VkIGluIGBleHRlcm5hbGAgbW9kZSBieSB0cmFuc3BpbGVycyBvdGhlciB0aGFuIFJlZ2V4KywgYmFja3JlZnMgbWlnaHQgaGF2ZVxuICAgICAgICAgICAgLy8gZ29uZSB0aHJvdWdoIGNvbnZlcnNpb24gZnJvbSBuYW1lZCB0byBudW1iZXJlZCwgc28gYXZvaWQgYSBtaXNsZWFkaW5nIGVycm9yXG4gICAgICAgICAgICBgJHttb2RlID09PSAnZXh0ZXJuYWwnID8gJ0JhY2tyZWZzJyA6ICdOdW1iZXJlZCBiYWNrcmVmcyd9IGNhbm5vdCBiZSB1c2VkIHdpdGggcmVjdXJzaW9uIG9mIGNhcHR1cmluZyBncm91cHNgXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBncm91cENvbnRlbnRzTGVmdCA9IHBhdHRlcm4uc2xpY2Uoc3RhcnRQb3MsIG1hdGNoLmluZGV4KTtcbiAgICAgICAgY29uc3QgZ3JvdXBDb250ZW50c1JpZ2h0ID0gZ3JvdXBDb250ZW50cy5zbGljZShncm91cENvbnRlbnRzTGVmdC5sZW5ndGggKyBtLmxlbmd0aCk7XG4gICAgICAgIGNvbnN0IG51bUFkZGVkSGlkZGVuQ2FwdHVyZXNQcmVFeHBhbnNpb24gPSBhZGRlZEhpZGRlbkNhcHR1cmVzLmxlbmd0aDtcbiAgICAgICAgY29uc3QgcmVwcyA9ICtnUkRlcHRoIC0gMTtcbiAgICAgICAgY29uc3QgZXhwYW5zaW9uID0gbWFrZVJlY3Vyc2l2ZShcbiAgICAgICAgICBncm91cENvbnRlbnRzTGVmdCxcbiAgICAgICAgICBncm91cENvbnRlbnRzUmlnaHQsXG4gICAgICAgICAgcmVwcyxcbiAgICAgICAgICB0cnVlLFxuICAgICAgICAgIGhpZGRlbkNhcHR1cmVzLFxuICAgICAgICAgIGFkZGVkSGlkZGVuQ2FwdHVyZXMsXG4gICAgICAgICAgbnVtQ2FwdHVyZXNQYXNzZWRcbiAgICAgICAgKTtcbiAgICAgICAgY2FwdHVyZVRyYW5zZmVycyA9IG1hcENhcHR1cmVUcmFuc2ZlcnMoXG4gICAgICAgICAgY2FwdHVyZVRyYW5zZmVycyxcbiAgICAgICAgICBncm91cENvbnRlbnRzTGVmdCxcbiAgICAgICAgICByZXBzLFxuICAgICAgICAgIGFkZGVkSGlkZGVuQ2FwdHVyZXMubGVuZ3RoIC0gbnVtQWRkZWRIaWRkZW5DYXB0dXJlc1ByZUV4cGFuc2lvbixcbiAgICAgICAgICBudW1BZGRlZEhpZGRlbkNhcHR1cmVzUHJlRXhwYW5zaW9uLFxuICAgICAgICAgIG51bUNhcHR1cmVzUGFzc2VkXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHByZSA9IHBhdHRlcm4uc2xpY2UoMCwgc3RhcnRQb3MpO1xuICAgICAgICBjb25zdCBwb3N0ID0gcGF0dGVybi5zbGljZShzdGFydFBvcyArIGdyb3VwQ29udGVudHMubGVuZ3RoKTtcbiAgICAgICAgLy8gTW9kaWZ5IHRoZSBzdHJpbmcgd2UncmUgbG9vcGluZyBvdmVyXG4gICAgICAgIHBhdHRlcm4gPSBgJHtwcmV9JHtleHBhbnNpb259JHtwb3N0fWA7XG4gICAgICAgIC8vIFN0ZXAgZm9yd2FyZCBmb3IgdGhlIG5leHQgbG9vcCBpdGVyYXRpb25cbiAgICAgICAgdG9rZW4ubGFzdEluZGV4ICs9IGV4cGFuc2lvbi5sZW5ndGggLSBtLmxlbmd0aCAtIGdyb3VwQ29udGVudHNMZWZ0Lmxlbmd0aCAtIGdyb3VwQ29udGVudHNSaWdodC5sZW5ndGg7XG4gICAgICAgIG9wZW5Hcm91cHMuZm9yRWFjaChnID0+IGcuaGFzUmVjdXJzZWRXaXRoaW4gPSB0cnVlKTtcbiAgICAgICAgaGFzUmVjdXJzZWQgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChjYXB0dXJlTmFtZSkge1xuICAgICAgICBudW1DYXB0dXJlc1Bhc3NlZCsrO1xuICAgICAgICBncm91cENvbnRlbnRzU3RhcnRQb3Muc2V0KFN0cmluZyhudW1DYXB0dXJlc1Bhc3NlZCksIHRva2VuLmxhc3RJbmRleCk7XG4gICAgICAgIGdyb3VwQ29udGVudHNTdGFydFBvcy5zZXQoY2FwdHVyZU5hbWUsIHRva2VuLmxhc3RJbmRleCk7XG4gICAgICAgIG9wZW5Hcm91cHMucHVzaCh7XG4gICAgICAgICAgbnVtOiBudW1DYXB0dXJlc1Bhc3NlZCxcbiAgICAgICAgICBuYW1lOiBjYXB0dXJlTmFtZSxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKG1bMF0gPT09ICcoJykge1xuICAgICAgICBjb25zdCBpc1VubmFtZWRDYXB0dXJlID0gbSA9PT0gJygnO1xuICAgICAgICBpZiAoaXNVbm5hbWVkQ2FwdHVyZSkge1xuICAgICAgICAgIG51bUNhcHR1cmVzUGFzc2VkKys7XG4gICAgICAgICAgZ3JvdXBDb250ZW50c1N0YXJ0UG9zLnNldChTdHJpbmcobnVtQ2FwdHVyZXNQYXNzZWQpLCB0b2tlbi5sYXN0SW5kZXgpO1xuICAgICAgICB9XG4gICAgICAgIG9wZW5Hcm91cHMucHVzaChpc1VubmFtZWRDYXB0dXJlID8ge251bTogbnVtQ2FwdHVyZXNQYXNzZWR9IDoge30pO1xuICAgICAgfSBlbHNlIGlmIChtID09PSAnKScpIHtcbiAgICAgICAgb3Blbkdyb3Vwcy5wb3AoKTtcbiAgICAgIH1cblxuICAgIH0gZWxzZSBpZiAobSA9PT0gJ10nKSB7XG4gICAgICBudW1DaGFyQ2xhc3Nlc09wZW4tLTtcbiAgICB9XG4gIH1cblxuICBoaWRkZW5DYXB0dXJlcy5wdXNoKC4uLmFkZGVkSGlkZGVuQ2FwdHVyZXMpO1xuXG4gIHJldHVybiB7XG4gICAgcGF0dGVybixcbiAgICBjYXB0dXJlVHJhbnNmZXJzLFxuICAgIGhpZGRlbkNhcHR1cmVzLFxuICB9O1xufVxuXG4vKipcbkBwYXJhbSB7c3RyaW5nfSBtYXhcbiovXG5mdW5jdGlvbiBhc3NlcnRNYXhJbkJvdW5kcyhtYXgpIHtcbiAgY29uc3QgZXJyTXNnID0gYE1heCBkZXB0aCBtdXN0IGJlIGludGVnZXIgYmV0d2VlbiAyIGFuZCAxMDA7IHVzZWQgJHttYXh9YDtcbiAgaWYgKCEvXlsxLTldXFxkKiQvLnRlc3QobWF4KSkge1xuICAgIHRocm93IG5ldyBFcnJvcihlcnJNc2cpO1xuICB9XG4gIG1heCA9ICttYXg7XG4gIGlmIChtYXggPCAyIHx8IG1heCA+IDEwMCkge1xuICAgIHRocm93IG5ldyBFcnJvcihlcnJNc2cpO1xuICB9XG59XG5cbi8qKlxuQHBhcmFtIHtzdHJpbmd9IGxlZnRcbkBwYXJhbSB7c3RyaW5nfSByaWdodFxuQHBhcmFtIHtudW1iZXJ9IHJlcHNcbkBwYXJhbSB7Ym9vbGVhbn0gaXNTdWJwYXR0ZXJuXG5AcGFyYW0ge0FycmF5PG51bWJlcj59IGhpZGRlbkNhcHR1cmVzXG5AcGFyYW0ge0FycmF5PG51bWJlcj59IGFkZGVkSGlkZGVuQ2FwdHVyZXNcbkBwYXJhbSB7bnVtYmVyfSBudW1DYXB0dXJlc1Bhc3NlZFxuQHJldHVybnMge3N0cmluZ31cbiovXG5mdW5jdGlvbiBtYWtlUmVjdXJzaXZlKFxuICBsZWZ0LFxuICByaWdodCxcbiAgcmVwcyxcbiAgaXNTdWJwYXR0ZXJuLFxuICBoaWRkZW5DYXB0dXJlcyxcbiAgYWRkZWRIaWRkZW5DYXB0dXJlcyxcbiAgbnVtQ2FwdHVyZXNQYXNzZWRcbikge1xuICBjb25zdCBuYW1lc0luUmVjdXJzZWQgPSBuZXcgU2V0KCk7XG4gIC8vIENhbiBza2lwIHRoaXMgd29yayBpZiBub3QgbmVlZGVkXG4gIGlmIChpc1N1YnBhdHRlcm4pIHtcbiAgICBmb3JFYWNoVW5lc2NhcGVkKGxlZnQgKyByaWdodCwgbmFtZWRDYXB0dXJlRGVsaW0sICh7Z3JvdXBzOiB7Y2FwdHVyZU5hbWV9fSkgPT4ge1xuICAgICAgbmFtZXNJblJlY3Vyc2VkLmFkZChjYXB0dXJlTmFtZSk7XG4gICAgfSwgQ29udGV4dC5ERUZBVUxUKTtcbiAgfVxuICBjb25zdCByZXN0ID0gW1xuICAgIHJlcHMsXG4gICAgaXNTdWJwYXR0ZXJuID8gbmFtZXNJblJlY3Vyc2VkIDogbnVsbCxcbiAgICBoaWRkZW5DYXB0dXJlcyxcbiAgICBhZGRlZEhpZGRlbkNhcHR1cmVzLFxuICAgIG51bUNhcHR1cmVzUGFzc2VkLFxuICBdO1xuICAvLyBEZXB0aCAyOiAnbGVmdCg/OmxlZnQoPzopcmlnaHQpcmlnaHQnXG4gIC8vIERlcHRoIDM6ICdsZWZ0KD86bGVmdCg/OmxlZnQoPzopcmlnaHQpcmlnaHQpcmlnaHQnXG4gIC8vIEVtcHR5IGdyb3VwIGluIHRoZSBtaWRkbGUgc2VwYXJhdGVzIHRva2VucyBhbmQgYWJzb3JicyBhIGZvbGxvd2luZyBxdWFudGlmaWVyIGlmIHByZXNlbnRcbiAgcmV0dXJuIGAke2xlZnR9JHtcbiAgICByZXBlYXRXaXRoRGVwdGgoYCg/OiR7bGVmdH1gLCAnZm9yd2FyZCcsIC4uLnJlc3QpXG4gIH0oPzopJHtcbiAgICByZXBlYXRXaXRoRGVwdGgoYCR7cmlnaHR9KWAsICdiYWNrd2FyZCcsIC4uLnJlc3QpXG4gIH0ke3JpZ2h0fWA7XG59XG5cbi8qKlxuQHBhcmFtIHtzdHJpbmd9IHBhdHRlcm5cbkBwYXJhbSB7J2ZvcndhcmQnIHwgJ2JhY2t3YXJkJ30gZGlyZWN0aW9uXG5AcGFyYW0ge251bWJlcn0gcmVwc1xuQHBhcmFtIHtTZXQ8c3RyaW5nPiB8IG51bGx9IG5hbWVzSW5SZWN1cnNlZFxuQHBhcmFtIHtBcnJheTxudW1iZXI+fSBoaWRkZW5DYXB0dXJlc1xuQHBhcmFtIHtBcnJheTxudW1iZXI+fSBhZGRlZEhpZGRlbkNhcHR1cmVzXG5AcGFyYW0ge251bWJlcn0gbnVtQ2FwdHVyZXNQYXNzZWRcbkByZXR1cm5zIHtzdHJpbmd9XG4qL1xuZnVuY3Rpb24gcmVwZWF0V2l0aERlcHRoKFxuICBwYXR0ZXJuLFxuICBkaXJlY3Rpb24sXG4gIHJlcHMsXG4gIG5hbWVzSW5SZWN1cnNlZCxcbiAgaGlkZGVuQ2FwdHVyZXMsXG4gIGFkZGVkSGlkZGVuQ2FwdHVyZXMsXG4gIG51bUNhcHR1cmVzUGFzc2VkXG4pIHtcbiAgY29uc3Qgc3RhcnROdW0gPSAyO1xuICBjb25zdCBnZXREZXB0aE51bSA9IGkgPT4gZGlyZWN0aW9uID09PSAnZm9yd2FyZCcgPyAoaSArIHN0YXJ0TnVtKSA6IChyZXBzIC0gaSArIHN0YXJ0TnVtIC0gMSk7XG4gIGxldCByZXN1bHQgPSAnJztcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCByZXBzOyBpKyspIHtcbiAgICBjb25zdCBkZXB0aE51bSA9IGdldERlcHRoTnVtKGkpO1xuICAgIHJlc3VsdCArPSByZXBsYWNlVW5lc2NhcGVkKFxuICAgICAgcGF0dGVybixcbiAgICAgIHJgJHtjYXB0dXJlRGVsaW19fFxcXFxrPCg/PGJhY2tyZWY+W14+XSspPmAsXG4gICAgICAoezA6IG0sIGdyb3Vwczoge2NhcHR1cmVOYW1lLCB1bm5hbWVkLCBiYWNrcmVmfX0pID0+IHtcbiAgICAgICAgaWYgKGJhY2tyZWYgJiYgbmFtZXNJblJlY3Vyc2VkICYmICFuYW1lc0luUmVjdXJzZWQuaGFzKGJhY2tyZWYpKSB7XG4gICAgICAgICAgLy8gRG9uJ3QgYWx0ZXIgYmFja3JlZnMgdG8gZ3JvdXBzIG91dHNpZGUgdGhlIHJlY3Vyc2VkIHN1YnBhdHRlcm5cbiAgICAgICAgICByZXR1cm4gbTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzdWZmaXggPSBgXyQke2RlcHRoTnVtfWA7XG4gICAgICAgIGlmICh1bm5hbWVkIHx8IGNhcHR1cmVOYW1lKSB7XG4gICAgICAgICAgY29uc3QgYWRkZWRDYXB0dXJlTnVtID0gbnVtQ2FwdHVyZXNQYXNzZWQgKyBhZGRlZEhpZGRlbkNhcHR1cmVzLmxlbmd0aCArIDE7XG4gICAgICAgICAgYWRkZWRIaWRkZW5DYXB0dXJlcy5wdXNoKGFkZGVkQ2FwdHVyZU51bSk7XG4gICAgICAgICAgaW5jcmVtZW50SWZBdExlYXN0KGhpZGRlbkNhcHR1cmVzLCBhZGRlZENhcHR1cmVOdW0pO1xuICAgICAgICAgIHJldHVybiB1bm5hbWVkID8gbSA6IGAoPzwke2NhcHR1cmVOYW1lfSR7c3VmZml4fT5gO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByYFxcazwke2JhY2tyZWZ9JHtzdWZmaXh9PmA7XG4gICAgICB9LFxuICAgICAgQ29udGV4dC5ERUZBVUxUXG4gICAgKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcblVwZGF0ZXMgdGhlIGFycmF5IGluIHBsYWNlIGJ5IGluY3JlbWVudGluZyBlYWNoIHZhbHVlIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byB0aGUgdGhyZXNob2xkLlxuQHBhcmFtIHtBcnJheTxudW1iZXI+fSBhcnJcbkBwYXJhbSB7bnVtYmVyfSB0aHJlc2hvbGRcbiovXG5mdW5jdGlvbiBpbmNyZW1lbnRJZkF0TGVhc3QoYXJyLCB0aHJlc2hvbGQpIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoYXJyW2ldID49IHRocmVzaG9sZCkge1xuICAgICAgYXJyW2ldKys7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuQHBhcmFtIHtNYXA8bnVtYmVyLCBBcnJheTxudW1iZXI+Pn0gY2FwdHVyZVRyYW5zZmVyc1xuQHBhcmFtIHtzdHJpbmd9IGxlZnRcbkBwYXJhbSB7bnVtYmVyfSByZXBzXG5AcGFyYW0ge251bWJlcn0gbnVtQ2FwdHVyZXNBZGRlZEluRXhwYW5zaW9uXG5AcGFyYW0ge251bWJlcn0gbnVtQWRkZWRIaWRkZW5DYXB0dXJlc1ByZUV4cGFuc2lvblxuQHBhcmFtIHtudW1iZXJ9IG51bUNhcHR1cmVzUGFzc2VkXG5AcmV0dXJucyB7TWFwPG51bWJlciwgQXJyYXk8bnVtYmVyPj59XG4qL1xuZnVuY3Rpb24gbWFwQ2FwdHVyZVRyYW5zZmVycyhjYXB0dXJlVHJhbnNmZXJzLCBsZWZ0LCByZXBzLCBudW1DYXB0dXJlc0FkZGVkSW5FeHBhbnNpb24sIG51bUFkZGVkSGlkZGVuQ2FwdHVyZXNQcmVFeHBhbnNpb24sIG51bUNhcHR1cmVzUGFzc2VkKSB7XG4gIGlmIChjYXB0dXJlVHJhbnNmZXJzLnNpemUgJiYgbnVtQ2FwdHVyZXNBZGRlZEluRXhwYW5zaW9uKSB7XG4gICAgbGV0IG51bUNhcHR1cmVzSW5MZWZ0ID0gMDtcbiAgICBmb3JFYWNoVW5lc2NhcGVkKGxlZnQsIGNhcHR1cmVEZWxpbSwgKCkgPT4gbnVtQ2FwdHVyZXNJbkxlZnQrKywgQ29udGV4dC5ERUZBVUxUKTtcbiAgICAvLyBJcyAwIGZvciBnbG9iYWwgcmVjdXJzaW9uXG4gICAgY29uc3QgcmVjdXJzaW9uRGVsaW1DYXB0dXJlTnVtID0gbnVtQ2FwdHVyZXNQYXNzZWQgLSBudW1DYXB0dXJlc0luTGVmdCArIG51bUFkZGVkSGlkZGVuQ2FwdHVyZXNQcmVFeHBhbnNpb247XG4gICAgY29uc3QgbmV3Q2FwdHVyZVRyYW5zZmVycyA9IG5ldyBNYXAoKTtcbiAgICBjYXB0dXJlVHJhbnNmZXJzLmZvckVhY2goKGZyb20sIHRvKSA9PiB7XG4gICAgICBjb25zdCBudW1DYXB0dXJlc0luUmlnaHQgPSAobnVtQ2FwdHVyZXNBZGRlZEluRXhwYW5zaW9uIC0gKG51bUNhcHR1cmVzSW5MZWZ0ICogcmVwcykpIC8gcmVwcztcbiAgICAgIGNvbnN0IG51bUNhcHR1cmVzQWRkZWRJbkxlZnQgPSBudW1DYXB0dXJlc0luTGVmdCAqIHJlcHM7XG4gICAgICBjb25zdCBuZXdUbyA9IHRvID4gKHJlY3Vyc2lvbkRlbGltQ2FwdHVyZU51bSArIG51bUNhcHR1cmVzSW5MZWZ0KSA/IHRvICsgbnVtQ2FwdHVyZXNBZGRlZEluRXhwYW5zaW9uIDogdG87XG4gICAgICBjb25zdCBuZXdGcm9tID0gW107XG4gICAgICBmb3IgKGNvbnN0IGYgb2YgZnJvbSkge1xuICAgICAgICAvLyBCZWZvcmUgdGhlIHJlY3Vyc2VkIHN1YnBhdHRlcm5cbiAgICAgICAgaWYgKGYgPD0gcmVjdXJzaW9uRGVsaW1DYXB0dXJlTnVtKSB7XG4gICAgICAgICAgbmV3RnJvbS5wdXNoKGYpO1xuICAgICAgICAvLyBBZnRlciB0aGUgcmVjdXJzZWQgc3VicGF0dGVyblxuICAgICAgICB9IGVsc2UgaWYgKGYgPiAocmVjdXJzaW9uRGVsaW1DYXB0dXJlTnVtICsgbnVtQ2FwdHVyZXNJbkxlZnQgKyBudW1DYXB0dXJlc0luUmlnaHQpKSB7XG4gICAgICAgICAgbmV3RnJvbS5wdXNoKGYgKyBudW1DYXB0dXJlc0FkZGVkSW5FeHBhbnNpb24pO1xuICAgICAgICAvLyBXaXRoaW4gdGhlIHJlY3Vyc2VkIHN1YnBhdHRlcm4sIG9uIHRoZSBsZWZ0IG9mIHRoZSByZWN1cnNpb24gdG9rZW5cbiAgICAgICAgfSBlbHNlIGlmIChmIDw9IChyZWN1cnNpb25EZWxpbUNhcHR1cmVOdW0gKyBudW1DYXB0dXJlc0luTGVmdCkpIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSByZXBzOyBpKyspIHtcbiAgICAgICAgICAgIG5ld0Zyb20ucHVzaChmICsgKG51bUNhcHR1cmVzSW5MZWZ0ICogaSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgLy8gV2l0aGluIHRoZSByZWN1cnNlZCBzdWJwYXR0ZXJuLCBvbiB0aGUgcmlnaHQgb2YgdGhlIHJlY3Vyc2lvbiB0b2tlblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IHJlcHM7IGkrKykge1xuICAgICAgICAgICAgbmV3RnJvbS5wdXNoKGYgKyBudW1DYXB0dXJlc0FkZGVkSW5MZWZ0ICsgKG51bUNhcHR1cmVzSW5SaWdodCAqIGkpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG5ld0NhcHR1cmVUcmFuc2ZlcnMuc2V0KG5ld1RvLCBuZXdGcm9tKTtcbiAgICB9KTtcbiAgICByZXR1cm4gbmV3Q2FwdHVyZVRyYW5zZmVycztcbiAgfVxuICByZXR1cm4gY2FwdHVyZVRyYW5zZmVycztcbn1cblxuZXhwb3J0IHtcbiAgcmVjdXJzaW9uLFxufTtcbiIsCiAgICAiLy8gc3JjL3V0aWxzLmpzXG52YXIgY3AgPSBTdHJpbmcuZnJvbUNvZGVQb2ludDtcbnZhciByID0gU3RyaW5nLnJhdztcbnZhciBlbnZGbGFncyA9IHt9O1xudmFyIGdsb2JhbFJlZ0V4cCA9IGdsb2JhbFRoaXMuUmVnRXhwO1xuZW52RmxhZ3MuZmxhZ0dyb3VwcyA9ICgoKSA9PiB7XG4gIHRyeSB7XG4gICAgbmV3IGdsb2JhbFJlZ0V4cChcIig/aTopXCIpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59KSgpO1xuZW52RmxhZ3MudW5pY29kZVNldHMgPSAoKCkgPT4ge1xuICB0cnkge1xuICAgIG5ldyBnbG9iYWxSZWdFeHAoXCJbW11dXCIsIFwidlwiKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufSkoKTtcbmVudkZsYWdzLmJ1Z0ZsYWdWTGl0ZXJhbEh5cGhlbklzUmFuZ2UgPSBlbnZGbGFncy51bmljb2RlU2V0cyA/ICgoKSA9PiB7XG4gIHRyeSB7XG4gICAgbmV3IGdsb2JhbFJlZ0V4cChyYFtcXGRcXC1hXWAsIFwidlwiKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufSkoKSA6IGZhbHNlO1xuZW52RmxhZ3MuYnVnTmVzdGVkQ2xhc3NJZ25vcmVzTmVnYXRpb24gPSBlbnZGbGFncy51bmljb2RlU2V0cyAmJiBuZXcgZ2xvYmFsUmVnRXhwKFwiW1teYV1dXCIsIFwidlwiKS50ZXN0KFwiYVwiKTtcbmZ1bmN0aW9uIGdldE5ld0N1cnJlbnRGbGFncyhjdXJyZW50LCB7IGVuYWJsZSwgZGlzYWJsZSB9KSB7XG4gIHJldHVybiB7XG4gICAgZG90QWxsOiAhZGlzYWJsZT8uZG90QWxsICYmICEhKGVuYWJsZT8uZG90QWxsIHx8IGN1cnJlbnQuZG90QWxsKSxcbiAgICBpZ25vcmVDYXNlOiAhZGlzYWJsZT8uaWdub3JlQ2FzZSAmJiAhIShlbmFibGU/Lmlnbm9yZUNhc2UgfHwgY3VycmVudC5pZ25vcmVDYXNlKVxuICB9O1xufVxuZnVuY3Rpb24gZ2V0T3JJbnNlcnQobWFwLCBrZXksIGRlZmF1bHRWYWx1ZSkge1xuICBpZiAoIW1hcC5oYXMoa2V5KSkge1xuICAgIG1hcC5zZXQoa2V5LCBkZWZhdWx0VmFsdWUpO1xuICB9XG4gIHJldHVybiBtYXAuZ2V0KGtleSk7XG59XG5mdW5jdGlvbiBpc01pblRhcmdldCh0YXJnZXQsIG1pbikge1xuICByZXR1cm4gRXNWZXJzaW9uW3RhcmdldF0gPj0gRXNWZXJzaW9uW21pbl07XG59XG5mdW5jdGlvbiB0aHJvd0lmTnVsbGlzaCh2YWx1ZSwgbXNnKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKG1zZyA/PyBcIlZhbHVlIGV4cGVjdGVkXCIpO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuLy8gc3JjL29wdGlvbnMuanNcbnZhciBFc1ZlcnNpb24gPSB7XG4gIEVTMjAyNTogMjAyNSxcbiAgRVMyMDI0OiAyMDI0LFxuICBFUzIwMTg6IDIwMThcbn07XG52YXIgVGFyZ2V0ID0gKFxuICAvKiogQHR5cGUge2NvbnN0fSAqL1xuICB7XG4gICAgYXV0bzogXCJhdXRvXCIsXG4gICAgRVMyMDI1OiBcIkVTMjAyNVwiLFxuICAgIEVTMjAyNDogXCJFUzIwMjRcIixcbiAgICBFUzIwMTg6IFwiRVMyMDE4XCJcbiAgfVxuKTtcbmZ1bmN0aW9uIGdldE9wdGlvbnMob3B0aW9ucyA9IHt9KSB7XG4gIGlmICh7fS50b1N0cmluZy5jYWxsKG9wdGlvbnMpICE9PSBcIltvYmplY3QgT2JqZWN0XVwiKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBvcHRpb25zXCIpO1xuICB9XG4gIGlmIChvcHRpb25zLnRhcmdldCAhPT0gdm9pZCAwICYmICFUYXJnZXRbb3B0aW9ucy50YXJnZXRdKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbmV4cGVjdGVkIHRhcmdldCBcIiR7b3B0aW9ucy50YXJnZXR9XCJgKTtcbiAgfVxuICBjb25zdCBvcHRzID0ge1xuICAgIC8vIFNldHMgdGhlIGxldmVsIG9mIGVtdWxhdGlvbiByaWdvci9zdHJpY3RuZXNzLlxuICAgIGFjY3VyYWN5OiBcImRlZmF1bHRcIixcbiAgICAvLyBEaXNhYmxlcyBhZHZhbmNlZCBlbXVsYXRpb24gdGhhdCByZWxpZXMgb24gcmV0dXJuaW5nIGEgYFJlZ0V4cGAgc3ViY2xhc3MsIHJlc3VsdGluZyBpblxuICAgIC8vIGNlcnRhaW4gcGF0dGVybnMgbm90IGJlaW5nIGVtdWxhdGFibGUuXG4gICAgYXZvaWRTdWJjbGFzczogZmFsc2UsXG4gICAgLy8gT25pZ3VydW1hIGZsYWdzOyBhIHN0cmluZyB3aXRoIGBpYCwgYG1gLCBgeGAsIGBEYCwgYFNgLCBgV2AsIGB5e2d9YCBpbiBhbnkgb3JkZXIgKGFsbFxuICAgIC8vIG9wdGlvbmFsKS4gT25pZ3VydW1hJ3MgYG1gIGlzIGVxdWl2YWxlbnQgdG8gSmF2YVNjcmlwdCdzIGBzYCAoYGRvdEFsbGApLlxuICAgIGZsYWdzOiBcIlwiLFxuICAgIC8vIEluY2x1ZGUgSmF2YVNjcmlwdCBmbGFnIGBnYCAoYGdsb2JhbGApIGluIHRoZSByZXN1bHQuXG4gICAgZ2xvYmFsOiBmYWxzZSxcbiAgICAvLyBJbmNsdWRlIEphdmFTY3JpcHQgZmxhZyBgZGAgKGBoYXNJbmRpY2VzYCkgaW4gdGhlIHJlc3VsdC5cbiAgICBoYXNJbmRpY2VzOiBmYWxzZSxcbiAgICAvLyBEZWxheSByZWdleCBjb25zdHJ1Y3Rpb24gdW50aWwgZmlyc3QgdXNlIGlmIHRoZSB0cmFuc3BpbGVkIHBhdHRlcm4gaXMgYXQgbGVhc3QgdGhpcyBsZW5ndGguXG4gICAgbGF6eUNvbXBpbGVMZW5ndGg6IEluZmluaXR5LFxuICAgIC8vIEphdmFTY3JpcHQgdmVyc2lvbiB1c2VkIGZvciBnZW5lcmF0ZWQgcmVnZXhlcy4gVXNpbmcgYGF1dG9gIGRldGVjdHMgdGhlIGJlc3QgdmFsdWUgYmFzZWQgb25cbiAgICAvLyB5b3VyIGVudmlyb25tZW50LiBMYXRlciB0YXJnZXRzIGFsbG93IGZhc3RlciBwcm9jZXNzaW5nLCBzaW1wbGVyIGdlbmVyYXRlZCBzb3VyY2UsIGFuZFxuICAgIC8vIHN1cHBvcnQgZm9yIGFkZGl0aW9uYWwgZmVhdHVyZXMuXG4gICAgdGFyZ2V0OiBcImF1dG9cIixcbiAgICAvLyBEaXNhYmxlcyBtaW5pZmljYXRpb25zIHRoYXQgc2ltcGxpZnkgdGhlIHBhdHRlcm4gd2l0aG91dCBjaGFuZ2luZyB0aGUgbWVhbmluZy5cbiAgICB2ZXJib3NlOiBmYWxzZSxcbiAgICAuLi5vcHRpb25zLFxuICAgIC8vIEFkdmFuY2VkIG9wdGlvbnMgdGhhdCBvdmVycmlkZSBzdGFuZGFyZCBiZWhhdmlvciwgZXJyb3IgY2hlY2tpbmcsIGFuZCBmbGFncyB3aGVuIGVuYWJsZWQuXG4gICAgcnVsZXM6IHtcbiAgICAgIC8vIFVzZWZ1bCB3aXRoIFRleHRNYXRlIGdyYW1tYXJzIHRoYXQgbWVyZ2UgYmFja3JlZmVyZW5jZXMgYWNyb3NzIHBhdHRlcm5zLlxuICAgICAgYWxsb3dPcnBoYW5CYWNrcmVmczogZmFsc2UsXG4gICAgICAvLyBVc2UgQVNDSUkgYFxcYmAgYW5kIGBcXEJgLCB3aGljaCBpbmNyZWFzZXMgc2VhcmNoIHBlcmZvcm1hbmNlIG9mIGdlbmVyYXRlZCByZWdleGVzLlxuICAgICAgYXNjaWlXb3JkQm91bmRhcmllczogZmFsc2UsXG4gICAgICAvLyBBbGxvdyB1bm5hbWVkIGNhcHR1cmVzIGFuZCBudW1iZXJlZCBjYWxscyAoYmFja3JlZmVyZW5jZXMgYW5kIHN1YnJvdXRpbmVzKSB3aGVuIHVzaW5nXG4gICAgICAvLyBuYW1lZCBjYXB0dXJlLiBUaGlzIGlzIE9uaWd1cnVtYSBvcHRpb24gYE9OSUdfT1BUSU9OX0NBUFRVUkVfR1JPVVBgOyBvbiBieSBkZWZhdWx0IGluXG4gICAgICAvLyBgdnNjb2RlLW9uaWd1cnVtYWAuXG4gICAgICBjYXB0dXJlR3JvdXA6IGZhbHNlLFxuICAgICAgLy8gQ2hhbmdlIHRoZSByZWN1cnNpb24gZGVwdGggbGltaXQgZnJvbSBPbmlndXJ1bWEncyBgMjBgIHRvIGFuIGludGVnZXIgYDJg4oCTYDIwYC5cbiAgICAgIHJlY3Vyc2lvbkxpbWl0OiAyMCxcbiAgICAgIC8vIGBeYCBhcyBgXFxBYDsgYCRgIGFzYFxcWmAuIEltcHJvdmVzIHNlYXJjaCBwZXJmb3JtYW5jZSBvZiBnZW5lcmF0ZWQgcmVnZXhlcyB3aXRob3V0IGNoYW5naW5nXG4gICAgICAvLyB0aGUgbWVhbmluZyBpZiBzZWFyY2hpbmcgbGluZSBieSBsaW5lLiBUaGlzIGlzIE9uaWd1cnVtYSBvcHRpb24gYE9OSUdfT1BUSU9OX1NJTkdMRUxJTkVgLlxuICAgICAgc2luZ2xlbGluZTogZmFsc2UsXG4gICAgICAuLi5vcHRpb25zLnJ1bGVzXG4gICAgfVxuICB9O1xuICBpZiAob3B0cy50YXJnZXQgPT09IFwiYXV0b1wiKSB7XG4gICAgb3B0cy50YXJnZXQgPSBlbnZGbGFncy5mbGFnR3JvdXBzID8gXCJFUzIwMjVcIiA6IGVudkZsYWdzLnVuaWNvZGVTZXRzID8gXCJFUzIwMjRcIiA6IFwiRVMyMDE4XCI7XG4gIH1cbiAgcmV0dXJuIG9wdHM7XG59XG5cbi8vIHNyYy91bmljb2RlLmpzXG5pbXBvcnQgeyBzbHVnIH0gZnJvbSBcIm9uaWd1cnVtYS1wYXJzZXIvcGFyc2VyXCI7XG52YXIgYXNjaWlTcGFjZUNoYXIgPSBcIltcdC1cXHIgXVwiO1xudmFyIENoYXJzV2l0aG91dElnbm9yZUNhc2VFeHBhbnNpb24gPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldChbXG4gIGNwKDMwNCksXG4gIC8vIMSwXG4gIGNwKDMwNSlcbiAgLy8gxLFcbl0pO1xudmFyIGRlZmF1bHRXb3JkQ2hhciA9IHJgW1xccHtMfVxccHtNfVxccHtOfVxccHtQY31dYDtcbmZ1bmN0aW9uIGdldElnbm9yZUNhc2VNYXRjaENoYXJzKGNoYXIpIHtcbiAgaWYgKENoYXJzV2l0aG91dElnbm9yZUNhc2VFeHBhbnNpb24uaGFzKGNoYXIpKSB7XG4gICAgcmV0dXJuIFtjaGFyXTtcbiAgfVxuICBjb25zdCBzZXQgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpO1xuICBjb25zdCBsb3dlciA9IGNoYXIudG9Mb3dlckNhc2UoKTtcbiAgY29uc3QgdXBwZXIgPSBsb3dlci50b1VwcGVyQ2FzZSgpO1xuICBjb25zdCB0aXRsZSA9IExvd2VyVG9UaXRsZUNhc2VNYXAuZ2V0KGxvd2VyKTtcbiAgY29uc3QgYWx0TG93ZXIgPSBMb3dlclRvQWx0ZXJuYXRpdmVMb3dlckNhc2VNYXAuZ2V0KGxvd2VyKTtcbiAgY29uc3QgYWx0VXBwZXIgPSBMb3dlclRvQWx0ZXJuYXRpdmVVcHBlckNhc2VNYXAuZ2V0KGxvd2VyKTtcbiAgaWYgKFsuLi51cHBlcl0ubGVuZ3RoID09PSAxKSB7XG4gICAgc2V0LmFkZCh1cHBlcik7XG4gIH1cbiAgYWx0VXBwZXIgJiYgc2V0LmFkZChhbHRVcHBlcik7XG4gIHRpdGxlICYmIHNldC5hZGQodGl0bGUpO1xuICBzZXQuYWRkKGxvd2VyKTtcbiAgYWx0TG93ZXIgJiYgc2V0LmFkZChhbHRMb3dlcik7XG4gIHJldHVybiBbLi4uc2V0XTtcbn1cbnZhciBKc1VuaWNvZGVQcm9wZXJ0eU1hcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKFxuICBgQyBPdGhlclxuQ2MgQ29udHJvbCBjbnRybFxuQ2YgRm9ybWF0XG5DbiBVbmFzc2lnbmVkXG5DbyBQcml2YXRlX1VzZVxuQ3MgU3Vycm9nYXRlXG5MIExldHRlclxuTEMgQ2FzZWRfTGV0dGVyXG5MbCBMb3dlcmNhc2VfTGV0dGVyXG5MbSBNb2RpZmllcl9MZXR0ZXJcbkxvIE90aGVyX0xldHRlclxuTHQgVGl0bGVjYXNlX0xldHRlclxuTHUgVXBwZXJjYXNlX0xldHRlclxuTSBNYXJrIENvbWJpbmluZ19NYXJrXG5NYyBTcGFjaW5nX01hcmtcbk1lIEVuY2xvc2luZ19NYXJrXG5NbiBOb25zcGFjaW5nX01hcmtcbk4gTnVtYmVyXG5OZCBEZWNpbWFsX051bWJlciBkaWdpdFxuTmwgTGV0dGVyX051bWJlclxuTm8gT3RoZXJfTnVtYmVyXG5QIFB1bmN0dWF0aW9uIHB1bmN0XG5QYyBDb25uZWN0b3JfUHVuY3R1YXRpb25cblBkIERhc2hfUHVuY3R1YXRpb25cblBlIENsb3NlX1B1bmN0dWF0aW9uXG5QZiBGaW5hbF9QdW5jdHVhdGlvblxuUGkgSW5pdGlhbF9QdW5jdHVhdGlvblxuUG8gT3RoZXJfUHVuY3R1YXRpb25cblBzIE9wZW5fUHVuY3R1YXRpb25cblMgU3ltYm9sXG5TYyBDdXJyZW5jeV9TeW1ib2xcblNrIE1vZGlmaWVyX1N5bWJvbFxuU20gTWF0aF9TeW1ib2xcblNvIE90aGVyX1N5bWJvbFxuWiBTZXBhcmF0b3JcblpsIExpbmVfU2VwYXJhdG9yXG5acCBQYXJhZ3JhcGhfU2VwYXJhdG9yXG5acyBTcGFjZV9TZXBhcmF0b3JcbkFTQ0lJXG5BU0NJSV9IZXhfRGlnaXQgQUhleFxuQWxwaGFiZXRpYyBBbHBoYVxuQW55XG5Bc3NpZ25lZFxuQmlkaV9Db250cm9sIEJpZGlfQ1xuQmlkaV9NaXJyb3JlZCBCaWRpX01cbkNhc2VfSWdub3JhYmxlIENJXG5DYXNlZFxuQ2hhbmdlc19XaGVuX0Nhc2Vmb2xkZWQgQ1dDRlxuQ2hhbmdlc19XaGVuX0Nhc2VtYXBwZWQgQ1dDTVxuQ2hhbmdlc19XaGVuX0xvd2VyY2FzZWQgQ1dMXG5DaGFuZ2VzX1doZW5fTkZLQ19DYXNlZm9sZGVkIENXS0NGXG5DaGFuZ2VzX1doZW5fVGl0bGVjYXNlZCBDV1RcbkNoYW5nZXNfV2hlbl9VcHBlcmNhc2VkIENXVVxuRGFzaFxuRGVmYXVsdF9JZ25vcmFibGVfQ29kZV9Qb2ludCBESVxuRGVwcmVjYXRlZCBEZXBcbkRpYWNyaXRpYyBEaWFcbkVtb2ppXG5FbW9qaV9Db21wb25lbnQgRUNvbXBcbkVtb2ppX01vZGlmaWVyIEVNb2RcbkVtb2ppX01vZGlmaWVyX0Jhc2UgRUJhc2VcbkVtb2ppX1ByZXNlbnRhdGlvbiBFUHJlc1xuRXh0ZW5kZWRfUGljdG9ncmFwaGljIEV4dFBpY3RcbkV4dGVuZGVyIEV4dFxuR3JhcGhlbWVfQmFzZSBHcl9CYXNlXG5HcmFwaGVtZV9FeHRlbmQgR3JfRXh0XG5IZXhfRGlnaXQgSGV4XG5JRFNfQmluYXJ5X09wZXJhdG9yIElEU0JcbklEU19UcmluYXJ5X09wZXJhdG9yIElEU1RcbklEX0NvbnRpbnVlIElEQ1xuSURfU3RhcnQgSURTXG5JZGVvZ3JhcGhpYyBJZGVvXG5Kb2luX0NvbnRyb2wgSm9pbl9DXG5Mb2dpY2FsX09yZGVyX0V4Y2VwdGlvbiBMT0Vcbkxvd2VyY2FzZSBMb3dlclxuTWF0aFxuTm9uY2hhcmFjdGVyX0NvZGVfUG9pbnQgTkNoYXJcblBhdHRlcm5fU3ludGF4IFBhdF9TeW5cblBhdHRlcm5fV2hpdGVfU3BhY2UgUGF0X1dTXG5RdW90YXRpb25fTWFyayBRTWFya1xuUmFkaWNhbFxuUmVnaW9uYWxfSW5kaWNhdG9yIFJJXG5TZW50ZW5jZV9UZXJtaW5hbCBTVGVybVxuU29mdF9Eb3R0ZWQgU0RcblRlcm1pbmFsX1B1bmN0dWF0aW9uIFRlcm1cblVuaWZpZWRfSWRlb2dyYXBoIFVJZGVvXG5VcHBlcmNhc2UgVXBwZXJcblZhcmlhdGlvbl9TZWxlY3RvciBWU1xuV2hpdGVfU3BhY2Ugc3BhY2VcblhJRF9Db250aW51ZSBYSURDXG5YSURfU3RhcnQgWElEU2Auc3BsaXQoL1xccy8pLm1hcCgocCkgPT4gW3NsdWcocCksIHBdKVxuKTtcbnZhciBMb3dlclRvQWx0ZXJuYXRpdmVMb3dlckNhc2VNYXAgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcChbXG4gIFtcInNcIiwgY3AoMzgzKV0sXG4gIC8vIHMsIMW/XG4gIFtjcCgzODMpLCBcInNcIl1cbiAgLy8gxb8sIHNcbl0pO1xudmFyIExvd2VyVG9BbHRlcm5hdGl2ZVVwcGVyQ2FzZU1hcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKFtcbiAgW2NwKDIyMyksIGNwKDc4MzgpXSxcbiAgLy8gw58sIOG6nlxuICBbY3AoMTA3KSwgY3AoODQ5MCldLFxuICAvLyBrLCDihKogKEtlbHZpbilcbiAgW2NwKDIyOSksIGNwKDg0OTEpXSxcbiAgLy8gw6UsIOKEqyAoQW5nc3Ryb20pXG4gIFtjcCg5NjkpLCBjcCg4NDg2KV1cbiAgLy8gz4ksIOKEpiAoT2htKVxuXSk7XG52YXIgTG93ZXJUb1RpdGxlQ2FzZU1hcCA9IG5ldyBNYXAoW1xuICB0aXRsZUVudHJ5KDQ1MyksXG4gIHRpdGxlRW50cnkoNDU2KSxcbiAgdGl0bGVFbnRyeSg0NTkpLFxuICB0aXRsZUVudHJ5KDQ5OCksXG4gIC4uLnRpdGxlUmFuZ2UoODA3MiwgODA3OSksXG4gIC4uLnRpdGxlUmFuZ2UoODA4OCwgODA5NSksXG4gIC4uLnRpdGxlUmFuZ2UoODEwNCwgODExMSksXG4gIHRpdGxlRW50cnkoODEyNCksXG4gIHRpdGxlRW50cnkoODE0MCksXG4gIHRpdGxlRW50cnkoODE4OClcbl0pO1xudmFyIFBvc2l4Q2xhc3NNYXAgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcChbXG4gIFtcImFsbnVtXCIsIHJgW1xccHtBbHBoYX1cXHB7TmR9XWBdLFxuICBbXCJhbHBoYVwiLCByYFxccHtBbHBoYX1gXSxcbiAgW1wiYXNjaWlcIiwgcmBcXHB7QVNDSUl9YF0sXG4gIFtcImJsYW5rXCIsIHJgW1xccHtac31cXHRdYF0sXG4gIFtcImNudHJsXCIsIHJgXFxwe0NjfWBdLFxuICBbXCJkaWdpdFwiLCByYFxccHtOZH1gXSxcbiAgW1wiZ3JhcGhcIiwgcmBbXFxQe3NwYWNlfSYmXFxQe0NjfSYmXFxQe0NufSYmXFxQe0NzfV1gXSxcbiAgW1wibG93ZXJcIiwgcmBcXHB7TG93ZXJ9YF0sXG4gIFtcInByaW50XCIsIHJgW1tcXFB7c3BhY2V9JiZcXFB7Q2N9JiZcXFB7Q259JiZcXFB7Q3N9XVxccHtac31dYF0sXG4gIFtcInB1bmN0XCIsIHJgW1xccHtQfVxccHtTfV1gXSxcbiAgLy8gVXBkYXRlZCB2YWx1ZSBmcm9tIE9uaWcgNi45Ljk7IGNoYW5nZWQgZnJvbSBVbmljb2RlIGBcXHB7cHVuY3R9YFxuICBbXCJzcGFjZVwiLCByYFxccHtzcGFjZX1gXSxcbiAgW1widXBwZXJcIiwgcmBcXHB7VXBwZXJ9YF0sXG4gIFtcIndvcmRcIiwgcmBbXFxwe0FscGhhfVxccHtNfVxccHtOZH1cXHB7UGN9XWBdLFxuICBbXCJ4ZGlnaXRcIiwgcmBcXHB7QUhleH1gXVxuXSk7XG5mdW5jdGlvbiByYW5nZShzdGFydCwgZW5kKSB7XG4gIGNvbnN0IHJhbmdlMiA9IFtdO1xuICBmb3IgKGxldCBpID0gc3RhcnQ7IGkgPD0gZW5kOyBpKyspIHtcbiAgICByYW5nZTIucHVzaChpKTtcbiAgfVxuICByZXR1cm4gcmFuZ2UyO1xufVxuZnVuY3Rpb24gdGl0bGVFbnRyeShjb2RlUG9pbnQpIHtcbiAgY29uc3QgY2hhciA9IGNwKGNvZGVQb2ludCk7XG4gIHJldHVybiBbY2hhci50b0xvd2VyQ2FzZSgpLCBjaGFyXTtcbn1cbmZ1bmN0aW9uIHRpdGxlUmFuZ2Uoc3RhcnQsIGVuZCkge1xuICByZXR1cm4gcmFuZ2Uoc3RhcnQsIGVuZCkubWFwKChjb2RlUG9pbnQpID0+IHRpdGxlRW50cnkoY29kZVBvaW50KSk7XG59XG52YXIgVW5pY29kZVByb3BlcnRpZXNXaXRoU3BlY2lmaWNDYXNlID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoW1xuICBcIkxvd2VyXCIsXG4gIFwiTG93ZXJjYXNlXCIsXG4gIFwiVXBwZXJcIixcbiAgXCJVcHBlcmNhc2VcIixcbiAgXCJMbFwiLFxuICBcIkxvd2VyY2FzZV9MZXR0ZXJcIixcbiAgXCJMdFwiLFxuICBcIlRpdGxlY2FzZV9MZXR0ZXJcIixcbiAgXCJMdVwiLFxuICBcIlVwcGVyY2FzZV9MZXR0ZXJcIlxuICAvLyBUaGUgYENoYW5nZXNfV2hlbl8qYCBwcm9wZXJ0aWVzIChhbmQgdGhlaXIgYWxpYXNlcykgY291bGQgYmUgaW5jbHVkZWQsIGJ1dCB0aGV5J3JlIHZlcnkgcmFyZS5cbiAgLy8gU29tZSBvdGhlciBwcm9wZXJ0aWVzIGluY2x1ZGUgYSBoYW5kZnVsIG9mIGNoYXJzIHdpdGggc3BlY2lmaWMgY2FzZXMgb25seSwgYnV0IHRoZXNlIGNoYXJzIGFyZVxuICAvLyBnZW5lcmFsbHkgZXh0cmVtZSBlZGdlIGNhc2VzIGFuZCB1c2luZyBzdWNoIHByb3BlcnRpZXMgY2FzZSBpbnNlbnNpdGl2ZWx5IGdlbmVyYWxseSBwcm9kdWNlc1xuICAvLyB1bmRlc2lyZWQgYmVoYXZpb3IgYW55d2F5XG5dKTtcblxuLy8gc3JjL3RyYW5zZm9ybS5qc1xuaW1wb3J0IHsgY3JlYXRlQWx0ZXJuYXRpdmUsIGNyZWF0ZUFzc2VydGlvbiwgY3JlYXRlQmFja3JlZmVyZW5jZSwgY3JlYXRlQ2FwdHVyaW5nR3JvdXAsIGNyZWF0ZUNoYXJhY3RlciwgY3JlYXRlQ2hhcmFjdGVyQ2xhc3MsIGNyZWF0ZUNoYXJhY3RlclNldCwgY3JlYXRlR3JvdXAsIGNyZWF0ZUxvb2thcm91bmRBc3NlcnRpb24sIGNyZWF0ZVF1YW50aWZpZXIsIGNyZWF0ZVN1YnJvdXRpbmUsIGNyZWF0ZVVuaWNvZGVQcm9wZXJ0eSwgaGFzT25seUNoaWxkLCBwYXJzZSwgc2x1ZyBhcyBzbHVnMiB9IGZyb20gXCJvbmlndXJ1bWEtcGFyc2VyL3BhcnNlclwiO1xuaW1wb3J0IHsgdHJhdmVyc2UgfSBmcm9tIFwib25pZ3VydW1hLXBhcnNlci90cmF2ZXJzZXJcIjtcbmZ1bmN0aW9uIHRyYW5zZm9ybShhc3QsIG9wdGlvbnMpIHtcbiAgY29uc3Qgb3B0cyA9IHtcbiAgICAvLyBBIGNvdXBsZSBlZGdlIGNhc2VzIGV4aXN0IHdoZXJlIG9wdGlvbnMgYGFjY3VyYWN5YCBhbmQgYGJlc3RFZmZvcnRUYXJnZXRgIGFyZSB1c2VkOlxuICAgIC8vIC0gYENoYXJhY3RlclNldGAga2luZCBgdGV4dF9zZWdtZW50YCAoYFxcWGApOiBBbiBleGFjdCByZXByZXNlbnRhdGlvbiB3b3VsZCByZXF1aXJlIGhlYXZ5XG4gICAgLy8gICBVbmljb2RlIGRhdGE7IGEgYmVzdC1lZmZvcnQgYXBwcm94aW1hdGlvbiByZXF1aXJlcyBrbm93aW5nIHRoZSB0YXJnZXQuXG4gICAgLy8gLSBgQ2hhcmFjdGVyU2V0YCBraW5kIGBwb3NpeGAgd2l0aCB2YWx1ZXMgYGdyYXBoYCBhbmQgYHByaW50YDogVGhlaXIgY29tcGxleCBVbmljb2RlXG4gICAgLy8gICByZXByZXNlbnRhdGlvbnMgd291bGQgYmUgaGFyZCB0byBjaGFuZ2UgdG8gQVNDSUkgdmVyc2lvbnMgYWZ0ZXIgdGhlIGZhY3QgaW4gdGhlIGdlbmVyYXRvclxuICAgIC8vICAgYmFzZWQgb24gYHRhcmdldGAvYGFjY3VyYWN5YCwgc28gcHJvZHVjZSB0aGUgYXBwcm9wcmlhdGUgc3RydWN0dXJlIGhlcmUuXG4gICAgYWNjdXJhY3k6IFwiZGVmYXVsdFwiLFxuICAgIGFzY2lpV29yZEJvdW5kYXJpZXM6IGZhbHNlLFxuICAgIGF2b2lkU3ViY2xhc3M6IGZhbHNlLFxuICAgIGJlc3RFZmZvcnRUYXJnZXQ6IFwiRVMyMDI1XCIsXG4gICAgLi4ub3B0aW9uc1xuICB9O1xuICBhZGRQYXJlbnRQcm9wZXJ0aWVzKGFzdCk7XG4gIGNvbnN0IGZpcnN0UGFzc1N0YXRlID0ge1xuICAgIGFjY3VyYWN5OiBvcHRzLmFjY3VyYWN5LFxuICAgIGFzY2lpV29yZEJvdW5kYXJpZXM6IG9wdHMuYXNjaWlXb3JkQm91bmRhcmllcyxcbiAgICBhdm9pZFN1YmNsYXNzOiBvcHRzLmF2b2lkU3ViY2xhc3MsXG4gICAgZmxhZ0RpcmVjdGl2ZXNCeUFsdDogLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSxcbiAgICBqc0dyb3VwTmFtZU1hcDogLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSxcbiAgICBtaW5UYXJnZXRFczIwMjQ6IGlzTWluVGFyZ2V0KG9wdHMuYmVzdEVmZm9ydFRhcmdldCwgXCJFUzIwMjRcIiksXG4gICAgcGFzc2VkTG9va2JlaGluZDogZmFsc2UsXG4gICAgc3RyYXRlZ3k6IG51bGwsXG4gICAgLy8gU3Vicm91dGluZXMgY2FuIGFwcGVhciBiZWZvcmUgdGhlIGdyb3VwcyB0aGV5IHJlZiwgc28gY29sbGVjdCByZWZmZWQgbm9kZXMgZm9yIGEgc2Vjb25kIHBhc3MgXG4gICAgc3Vicm91dGluZVJlZk1hcDogLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSxcbiAgICBzdXBwb3J0ZWRHTm9kZXM6IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCksXG4gICAgZGlnaXRJc0FzY2lpOiBhc3QuZmxhZ3MuZGlnaXRJc0FzY2lpLFxuICAgIHNwYWNlSXNBc2NpaTogYXN0LmZsYWdzLnNwYWNlSXNBc2NpaSxcbiAgICB3b3JkSXNBc2NpaTogYXN0LmZsYWdzLndvcmRJc0FzY2lpXG4gIH07XG4gIHRyYXZlcnNlKGFzdCwgRmlyc3RQYXNzVmlzaXRvciwgZmlyc3RQYXNzU3RhdGUpO1xuICBjb25zdCBnbG9iYWxGbGFncyA9IHtcbiAgICBkb3RBbGw6IGFzdC5mbGFncy5kb3RBbGwsXG4gICAgaWdub3JlQ2FzZTogYXN0LmZsYWdzLmlnbm9yZUNhc2VcbiAgfTtcbiAgY29uc3Qgc2Vjb25kUGFzc1N0YXRlID0ge1xuICAgIGN1cnJlbnRGbGFnczogZ2xvYmFsRmxhZ3MsXG4gICAgcHJldkZsYWdzOiBudWxsLFxuICAgIGdsb2JhbEZsYWdzLFxuICAgIGdyb3VwT3JpZ2luQnlDb3B5OiAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLFxuICAgIGdyb3Vwc0J5TmFtZTogLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSxcbiAgICBtdWx0aXBsZXhDYXB0dXJlc1RvTGVmdEJ5UmVmOiAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLFxuICAgIG9wZW5SZWZzOiAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLFxuICAgIHJlZmZlZE5vZGVzQnlSZWZlcmVuY2VyOiAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLFxuICAgIHN1YnJvdXRpbmVSZWZNYXA6IGZpcnN0UGFzc1N0YXRlLnN1YnJvdXRpbmVSZWZNYXBcbiAgfTtcbiAgdHJhdmVyc2UoYXN0LCBTZWNvbmRQYXNzVmlzaXRvciwgc2Vjb25kUGFzc1N0YXRlKTtcbiAgY29uc3QgdGhpcmRQYXNzU3RhdGUgPSB7XG4gICAgZ3JvdXBzQnlOYW1lOiBzZWNvbmRQYXNzU3RhdGUuZ3JvdXBzQnlOYW1lLFxuICAgIGhpZ2hlc3RPcnBoYW5CYWNrcmVmOiAwLFxuICAgIG51bUNhcHR1cmVzVG9MZWZ0OiAwLFxuICAgIHJlZmZlZE5vZGVzQnlSZWZlcmVuY2VyOiBzZWNvbmRQYXNzU3RhdGUucmVmZmVkTm9kZXNCeVJlZmVyZW5jZXJcbiAgfTtcbiAgdHJhdmVyc2UoYXN0LCBUaGlyZFBhc3NWaXNpdG9yLCB0aGlyZFBhc3NTdGF0ZSk7XG4gIGFzdC5fb3JpZ2luTWFwID0gc2Vjb25kUGFzc1N0YXRlLmdyb3VwT3JpZ2luQnlDb3B5O1xuICBhc3QuX3N0cmF0ZWd5ID0gZmlyc3RQYXNzU3RhdGUuc3RyYXRlZ3k7XG4gIHJldHVybiBhc3Q7XG59XG52YXIgRmlyc3RQYXNzVmlzaXRvciA9IHtcbiAgQWJzZW5jZUZ1bmN0aW9uKHsgbm9kZSwgcGFyZW50LCByZXBsYWNlV2l0aCB9KSB7XG4gICAgY29uc3QgeyBib2R5LCBraW5kIH0gPSBub2RlO1xuICAgIGlmIChraW5kID09PSBcInJlcGVhdGVyXCIpIHtcbiAgICAgIGNvbnN0IGlubmVyR3JvdXAgPSBjcmVhdGVHcm91cCgpO1xuICAgICAgaW5uZXJHcm91cC5ib2R5WzBdLmJvZHkucHVzaChcbiAgICAgICAgLy8gSW5zZXJ0IG93biBhbHRzIGFzIGBib2R5YFxuICAgICAgICBjcmVhdGVMb29rYXJvdW5kQXNzZXJ0aW9uKHsgbmVnYXRlOiB0cnVlLCBib2R5IH0pLFxuICAgICAgICBjcmVhdGVVbmljb2RlUHJvcGVydHkoXCJBbnlcIilcbiAgICAgICk7XG4gICAgICBjb25zdCBvdXRlckdyb3VwID0gY3JlYXRlR3JvdXAoKTtcbiAgICAgIG91dGVyR3JvdXAuYm9keVswXS5ib2R5LnB1c2goXG4gICAgICAgIGNyZWF0ZVF1YW50aWZpZXIoXCJncmVlZHlcIiwgMCwgSW5maW5pdHksIGlubmVyR3JvdXApXG4gICAgICApO1xuICAgICAgcmVwbGFjZVdpdGgoc2V0UGFyZW50RGVlcChvdXRlckdyb3VwLCBwYXJlbnQpLCB7IHRyYXZlcnNlOiB0cnVlIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIGFic2VuY2UgZnVuY3Rpb24gXCIoP358XCJgKTtcbiAgICB9XG4gIH0sXG4gIEFsdGVybmF0aXZlOiB7XG4gICAgZW50ZXIoeyBub2RlLCBwYXJlbnQsIGtleSB9LCB7IGZsYWdEaXJlY3RpdmVzQnlBbHQgfSkge1xuICAgICAgY29uc3QgZmxhZ0RpcmVjdGl2ZXMgPSBub2RlLmJvZHkuZmlsdGVyKChlbCkgPT4gZWwua2luZCA9PT0gXCJmbGFnc1wiKTtcbiAgICAgIGZvciAobGV0IGkgPSBrZXkgKyAxOyBpIDwgcGFyZW50LmJvZHkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZm9yd2FyZFNpYmxpbmdBbHQgPSBwYXJlbnQuYm9keVtpXTtcbiAgICAgICAgZ2V0T3JJbnNlcnQoZmxhZ0RpcmVjdGl2ZXNCeUFsdCwgZm9yd2FyZFNpYmxpbmdBbHQsIFtdKS5wdXNoKC4uLmZsYWdEaXJlY3RpdmVzKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGV4aXQoeyBub2RlIH0sIHsgZmxhZ0RpcmVjdGl2ZXNCeUFsdCB9KSB7XG4gICAgICBpZiAoZmxhZ0RpcmVjdGl2ZXNCeUFsdC5nZXQobm9kZSk/Lmxlbmd0aCkge1xuICAgICAgICBjb25zdCBmbGFncyA9IGdldENvbWJpbmVkRmxhZ01vZHNGcm9tRmxhZ05vZGVzKGZsYWdEaXJlY3RpdmVzQnlBbHQuZ2V0KG5vZGUpKTtcbiAgICAgICAgaWYgKGZsYWdzKSB7XG4gICAgICAgICAgY29uc3QgZmxhZ0dyb3VwID0gY3JlYXRlR3JvdXAoeyBmbGFncyB9KTtcbiAgICAgICAgICBmbGFnR3JvdXAuYm9keVswXS5ib2R5ID0gbm9kZS5ib2R5O1xuICAgICAgICAgIG5vZGUuYm9keSA9IFtzZXRQYXJlbnREZWVwKGZsYWdHcm91cCwgbm9kZSldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBBc3NlcnRpb24oeyBub2RlLCBwYXJlbnQsIGtleSwgY29udGFpbmVyLCByb290LCByZW1vdmUsIHJlcGxhY2VXaXRoIH0sIHN0YXRlKSB7XG4gICAgY29uc3QgeyBraW5kLCBuZWdhdGUgfSA9IG5vZGU7XG4gICAgY29uc3QgeyBhc2NpaVdvcmRCb3VuZGFyaWVzLCBhdm9pZFN1YmNsYXNzLCBzdXBwb3J0ZWRHTm9kZXMsIHdvcmRJc0FzY2lpIH0gPSBzdGF0ZTtcbiAgICBpZiAoa2luZCA9PT0gXCJ0ZXh0X3NlZ21lbnRfYm91bmRhcnlcIikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCB0ZXh0IHNlZ21lbnQgYm91bmRhcnkgXCJcXFxcJHtuZWdhdGUgPyBcIllcIiA6IFwieVwifVwiYCk7XG4gICAgfSBlbHNlIGlmIChraW5kID09PSBcImxpbmVfZW5kXCIpIHtcbiAgICAgIHJlcGxhY2VXaXRoKHNldFBhcmVudERlZXAoY3JlYXRlTG9va2Fyb3VuZEFzc2VydGlvbih7IGJvZHk6IFtcbiAgICAgICAgY3JlYXRlQWx0ZXJuYXRpdmUoeyBib2R5OiBbY3JlYXRlQXNzZXJ0aW9uKFwic3RyaW5nX2VuZFwiKV0gfSksXG4gICAgICAgIGNyZWF0ZUFsdGVybmF0aXZlKHsgYm9keTogW2NyZWF0ZUNoYXJhY3RlcigxMCldIH0pXG4gICAgICAgIC8vIGBcXG5gXG4gICAgICBdIH0pLCBwYXJlbnQpKTtcbiAgICB9IGVsc2UgaWYgKGtpbmQgPT09IFwibGluZV9zdGFydFwiKSB7XG4gICAgICByZXBsYWNlV2l0aChzZXRQYXJlbnREZWVwKHBhcnNlRnJhZ21lbnQocmAoPzw9XFxBfFxcbig/IVxceikpYCwgeyBza2lwTG9va2JlaGluZFZhbGlkYXRpb246IHRydWUgfSksIHBhcmVudCkpO1xuICAgIH0gZWxzZSBpZiAoa2luZCA9PT0gXCJzZWFyY2hfc3RhcnRcIikge1xuICAgICAgaWYgKHN1cHBvcnRlZEdOb2Rlcy5oYXMobm9kZSkpIHtcbiAgICAgICAgcm9vdC5mbGFncy5zdGlja3kgPSB0cnVlO1xuICAgICAgICByZW1vdmUoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHByZXYgPSBjb250YWluZXJba2V5IC0gMV07XG4gICAgICAgIGlmIChwcmV2ICYmIGlzQWx3YXlzTm9uWmVyb0xlbmd0aChwcmV2KSkge1xuICAgICAgICAgIHJlcGxhY2VXaXRoKHNldFBhcmVudERlZXAoY3JlYXRlTG9va2Fyb3VuZEFzc2VydGlvbih7IG5lZ2F0ZTogdHJ1ZSB9KSwgcGFyZW50KSk7XG4gICAgICAgIH0gZWxzZSBpZiAoYXZvaWRTdWJjbGFzcykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihyYFVzZXMgXCJcXEdcIiBpbiBhIHdheSB0aGF0IHJlcXVpcmVzIGEgc3ViY2xhc3NgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXBsYWNlV2l0aChzZXRQYXJlbnQoY3JlYXRlQXNzZXJ0aW9uKFwic3RyaW5nX3N0YXJ0XCIpLCBwYXJlbnQpKTtcbiAgICAgICAgICBzdGF0ZS5zdHJhdGVneSA9IFwiY2xpcF9zZWFyY2hcIjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoa2luZCA9PT0gXCJzdHJpbmdfZW5kXCIgfHwga2luZCA9PT0gXCJzdHJpbmdfc3RhcnRcIikge1xuICAgIH0gZWxzZSBpZiAoa2luZCA9PT0gXCJzdHJpbmdfZW5kX25ld2xpbmVcIikge1xuICAgICAgcmVwbGFjZVdpdGgoc2V0UGFyZW50RGVlcChwYXJzZUZyYWdtZW50KHJgKD89XFxuP1xceilgKSwgcGFyZW50KSk7XG4gICAgfSBlbHNlIGlmIChraW5kID09PSBcIndvcmRfYm91bmRhcnlcIikge1xuICAgICAgaWYgKCF3b3JkSXNBc2NpaSAmJiAhYXNjaWlXb3JkQm91bmRhcmllcykge1xuICAgICAgICBjb25zdCBiID0gYCg/Oig/PD0ke2RlZmF1bHRXb3JkQ2hhcn0pKD8hJHtkZWZhdWx0V29yZENoYXJ9KXwoPzwhJHtkZWZhdWx0V29yZENoYXJ9KSg/PSR7ZGVmYXVsdFdvcmRDaGFyfSkpYDtcbiAgICAgICAgY29uc3QgQiA9IGAoPzooPzw9JHtkZWZhdWx0V29yZENoYXJ9KSg/PSR7ZGVmYXVsdFdvcmRDaGFyfSl8KD88ISR7ZGVmYXVsdFdvcmRDaGFyfSkoPyEke2RlZmF1bHRXb3JkQ2hhcn0pKWA7XG4gICAgICAgIHJlcGxhY2VXaXRoKHNldFBhcmVudERlZXAocGFyc2VGcmFnbWVudChuZWdhdGUgPyBCIDogYiksIHBhcmVudCkpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZXhwZWN0ZWQgYXNzZXJ0aW9uIGtpbmQgXCIke2tpbmR9XCJgKTtcbiAgICB9XG4gIH0sXG4gIEJhY2tyZWZlcmVuY2UoeyBub2RlIH0sIHsganNHcm91cE5hbWVNYXAgfSkge1xuICAgIGxldCB7IHJlZiB9ID0gbm9kZTtcbiAgICBpZiAodHlwZW9mIHJlZiA9PT0gXCJzdHJpbmdcIiAmJiAhaXNWYWxpZEpzR3JvdXBOYW1lKHJlZikpIHtcbiAgICAgIHJlZiA9IGdldEFuZFN0b3JlSnNHcm91cE5hbWUocmVmLCBqc0dyb3VwTmFtZU1hcCk7XG4gICAgICBub2RlLnJlZiA9IHJlZjtcbiAgICB9XG4gIH0sXG4gIENhcHR1cmluZ0dyb3VwKHsgbm9kZSB9LCB7IGpzR3JvdXBOYW1lTWFwLCBzdWJyb3V0aW5lUmVmTWFwIH0pIHtcbiAgICBsZXQgeyBuYW1lIH0gPSBub2RlO1xuICAgIGlmIChuYW1lICYmICFpc1ZhbGlkSnNHcm91cE5hbWUobmFtZSkpIHtcbiAgICAgIG5hbWUgPSBnZXRBbmRTdG9yZUpzR3JvdXBOYW1lKG5hbWUsIGpzR3JvdXBOYW1lTWFwKTtcbiAgICAgIG5vZGUubmFtZSA9IG5hbWU7XG4gICAgfVxuICAgIHN1YnJvdXRpbmVSZWZNYXAuc2V0KG5vZGUubnVtYmVyLCBub2RlKTtcbiAgICBpZiAobmFtZSkge1xuICAgICAgc3Vicm91dGluZVJlZk1hcC5zZXQobmFtZSwgbm9kZSk7XG4gICAgfVxuICB9LFxuICBDaGFyYWN0ZXJDbGFzc1JhbmdlKHsgbm9kZSwgcGFyZW50LCByZXBsYWNlV2l0aCB9KSB7XG4gICAgaWYgKHBhcmVudC5raW5kID09PSBcImludGVyc2VjdGlvblwiKSB7XG4gICAgICBjb25zdCBjYyA9IGNyZWF0ZUNoYXJhY3RlckNsYXNzKHsgYm9keTogW25vZGVdIH0pO1xuICAgICAgcmVwbGFjZVdpdGgoc2V0UGFyZW50RGVlcChjYywgcGFyZW50KSwgeyB0cmF2ZXJzZTogdHJ1ZSB9KTtcbiAgICB9XG4gIH0sXG4gIENoYXJhY3RlclNldCh7IG5vZGUsIHBhcmVudCwgcmVwbGFjZVdpdGggfSwgeyBhY2N1cmFjeSwgbWluVGFyZ2V0RXMyMDI0LCBkaWdpdElzQXNjaWksIHNwYWNlSXNBc2NpaSwgd29yZElzQXNjaWkgfSkge1xuICAgIGNvbnN0IHsga2luZCwgbmVnYXRlLCB2YWx1ZSB9ID0gbm9kZTtcbiAgICBpZiAoZGlnaXRJc0FzY2lpICYmIChraW5kID09PSBcImRpZ2l0XCIgfHwgdmFsdWUgPT09IFwiZGlnaXRcIikpIHtcbiAgICAgIHJlcGxhY2VXaXRoKHNldFBhcmVudChjcmVhdGVDaGFyYWN0ZXJTZXQoXCJkaWdpdFwiLCB7IG5lZ2F0ZSB9KSwgcGFyZW50KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzcGFjZUlzQXNjaWkgJiYgKGtpbmQgPT09IFwic3BhY2VcIiB8fCB2YWx1ZSA9PT0gXCJzcGFjZVwiKSkge1xuICAgICAgcmVwbGFjZVdpdGgoc2V0UGFyZW50RGVlcChzZXROZWdhdGUocGFyc2VGcmFnbWVudChhc2NpaVNwYWNlQ2hhciksIG5lZ2F0ZSksIHBhcmVudCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAod29yZElzQXNjaWkgJiYgKGtpbmQgPT09IFwid29yZFwiIHx8IHZhbHVlID09PSBcIndvcmRcIikpIHtcbiAgICAgIHJlcGxhY2VXaXRoKHNldFBhcmVudChjcmVhdGVDaGFyYWN0ZXJTZXQoXCJ3b3JkXCIsIHsgbmVnYXRlIH0pLCBwYXJlbnQpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGtpbmQgPT09IFwiYW55XCIpIHtcbiAgICAgIHJlcGxhY2VXaXRoKHNldFBhcmVudChjcmVhdGVVbmljb2RlUHJvcGVydHkoXCJBbnlcIiksIHBhcmVudCkpO1xuICAgIH0gZWxzZSBpZiAoa2luZCA9PT0gXCJkaWdpdFwiKSB7XG4gICAgICByZXBsYWNlV2l0aChzZXRQYXJlbnQoY3JlYXRlVW5pY29kZVByb3BlcnR5KFwiTmRcIiwgeyBuZWdhdGUgfSksIHBhcmVudCkpO1xuICAgIH0gZWxzZSBpZiAoa2luZCA9PT0gXCJkb3RcIikge1xuICAgIH0gZWxzZSBpZiAoa2luZCA9PT0gXCJ0ZXh0X3NlZ21lbnRcIikge1xuICAgICAgaWYgKGFjY3VyYWN5ID09PSBcInN0cmljdFwiKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihyYFVzZSBvZiBcIlxcWFwiIHJlcXVpcmVzIG5vbi1zdHJpY3QgYWNjdXJhY3lgKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGVCYXNlID0gXCJcXFxccHtFbW9qaX0oPzpcXFxccHtFTW9kfXxcXFxcdUZFMEZcXFxcdTIwRTM/fFtcXFxceHtFMDAyMH0tXFxcXHh7RTAwN0V9XStcXFxceHtFMDA3Rn0pP1wiO1xuICAgICAgY29uc3QgZW1vamkgPSByYFxccHtSSX17Mn18JHtlQmFzZX0oPzpcXHUyMDBEJHtlQmFzZX0pKmA7XG4gICAgICByZXBsYWNlV2l0aChzZXRQYXJlbnREZWVwKHBhcnNlRnJhZ21lbnQoXG4gICAgICAgIC8vIENsb3NlIGFwcHJveGltYXRpb24gb2YgYW4gZXh0ZW5kZWQgZ3JhcGhlbWUgY2x1c3Rlcjsgc2VlIDx1bmljb2RlLm9yZy9yZXBvcnRzL3RyMjkvPlxuICAgICAgICByYCg/Plxcclxcbnwke21pblRhcmdldEVzMjAyNCA/IHJgXFxwe1JHSV9FbW9qaX1gIDogZW1vaml9fFxcUHtNfVxccHtNfSopYCxcbiAgICAgICAgLy8gQWxsb3cgSlMgcHJvcGVydHkgYFJHSV9FbW9qaWAgdGhyb3VnaFxuICAgICAgICB7IHNraXBQcm9wZXJ0eU5hbWVWYWxpZGF0aW9uOiB0cnVlIH1cbiAgICAgICksIHBhcmVudCkpO1xuICAgIH0gZWxzZSBpZiAoa2luZCA9PT0gXCJoZXhcIikge1xuICAgICAgcmVwbGFjZVdpdGgoc2V0UGFyZW50KGNyZWF0ZVVuaWNvZGVQcm9wZXJ0eShcIkFIZXhcIiwgeyBuZWdhdGUgfSksIHBhcmVudCkpO1xuICAgIH0gZWxzZSBpZiAoa2luZCA9PT0gXCJuZXdsaW5lXCIpIHtcbiAgICAgIHJlcGxhY2VXaXRoKHNldFBhcmVudERlZXAocGFyc2VGcmFnbWVudChuZWdhdGUgPyBcIlteXFxuXVwiIDogXCIoPz5cXHJcXG4/fFtcXG5cXHZcXGZcXHg4NVxcdTIwMjhcXHUyMDI5XSlcIiksIHBhcmVudCkpO1xuICAgIH0gZWxzZSBpZiAoa2luZCA9PT0gXCJwb3NpeFwiKSB7XG4gICAgICBpZiAoIW1pblRhcmdldEVzMjAyNCAmJiAodmFsdWUgPT09IFwiZ3JhcGhcIiB8fCB2YWx1ZSA9PT0gXCJwcmludFwiKSkge1xuICAgICAgICBpZiAoYWNjdXJhY3kgPT09IFwic3RyaWN0XCIpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFBPU0lYIGNsYXNzIFwiJHt2YWx1ZX1cIiByZXF1aXJlcyBtaW4gdGFyZ2V0IEVTMjAyNCBvciBub24tc3RyaWN0IGFjY3VyYWN5YCk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGFzY2lpID0ge1xuICAgICAgICAgIGdyYXBoOiBcIiEtflwiLFxuICAgICAgICAgIHByaW50OiBcIiAtflwiXG4gICAgICAgIH1bdmFsdWVdO1xuICAgICAgICBpZiAobmVnYXRlKSB7XG4gICAgICAgICAgYXNjaWkgPSBgXFwwLSR7Y3AoYXNjaWkuY29kZVBvaW50QXQoMCkgLSAxKX0ke2NwKGFzY2lpLmNvZGVQb2ludEF0KDIpICsgMSl9LVxcdXsxMEZGRkZ9YDtcbiAgICAgICAgfVxuICAgICAgICByZXBsYWNlV2l0aChzZXRQYXJlbnREZWVwKHBhcnNlRnJhZ21lbnQoYFske2FzY2lpfV1gKSwgcGFyZW50KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXBsYWNlV2l0aChzZXRQYXJlbnREZWVwKHNldE5lZ2F0ZShwYXJzZUZyYWdtZW50KFBvc2l4Q2xhc3NNYXAuZ2V0KHZhbHVlKSksIG5lZ2F0ZSksIHBhcmVudCkpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoa2luZCA9PT0gXCJwcm9wZXJ0eVwiKSB7XG4gICAgICBpZiAoIUpzVW5pY29kZVByb3BlcnR5TWFwLmhhcyhzbHVnMih2YWx1ZSkpKSB7XG4gICAgICAgIG5vZGUua2V5ID0gXCJzY1wiO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoa2luZCA9PT0gXCJzcGFjZVwiKSB7XG4gICAgICByZXBsYWNlV2l0aChzZXRQYXJlbnQoY3JlYXRlVW5pY29kZVByb3BlcnR5KFwic3BhY2VcIiwgeyBuZWdhdGUgfSksIHBhcmVudCkpO1xuICAgIH0gZWxzZSBpZiAoa2luZCA9PT0gXCJ3b3JkXCIpIHtcbiAgICAgIHJlcGxhY2VXaXRoKHNldFBhcmVudERlZXAoc2V0TmVnYXRlKHBhcnNlRnJhZ21lbnQoZGVmYXVsdFdvcmRDaGFyKSwgbmVnYXRlKSwgcGFyZW50KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5leHBlY3RlZCBjaGFyYWN0ZXIgc2V0IGtpbmQgXCIke2tpbmR9XCJgKTtcbiAgICB9XG4gIH0sXG4gIERpcmVjdGl2ZSh7IG5vZGUsIHBhcmVudCwgcm9vdCwgcmVtb3ZlLCByZXBsYWNlV2l0aCwgcmVtb3ZlQWxsUHJldlNpYmxpbmdzLCByZW1vdmVBbGxOZXh0U2libGluZ3MgfSkge1xuICAgIGNvbnN0IHsga2luZCwgZmxhZ3MgfSA9IG5vZGU7XG4gICAgaWYgKGtpbmQgPT09IFwiZmxhZ3NcIikge1xuICAgICAgaWYgKCFmbGFncy5lbmFibGUgJiYgIWZsYWdzLmRpc2FibGUpIHtcbiAgICAgICAgcmVtb3ZlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBmbGFnR3JvdXAgPSBjcmVhdGVHcm91cCh7IGZsYWdzIH0pO1xuICAgICAgICBmbGFnR3JvdXAuYm9keVswXS5ib2R5ID0gcmVtb3ZlQWxsTmV4dFNpYmxpbmdzKCk7XG4gICAgICAgIHJlcGxhY2VXaXRoKHNldFBhcmVudERlZXAoZmxhZ0dyb3VwLCBwYXJlbnQpLCB7IHRyYXZlcnNlOiB0cnVlIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoa2luZCA9PT0gXCJrZWVwXCIpIHtcbiAgICAgIGNvbnN0IGZpcnN0QWx0ID0gcm9vdC5ib2R5WzBdO1xuICAgICAgY29uc3QgaGFzV3JhcHBlckdyb3VwID0gcm9vdC5ib2R5Lmxlbmd0aCA9PT0gMSAmJiAvLyBOb3QgZW11bGF0YWJsZSBpZiB3aXRoaW4gYSBgQ2FwdHVyaW5nR3JvdXBgXG4gICAgICBoYXNPbmx5Q2hpbGQoZmlyc3RBbHQsIHsgdHlwZTogXCJHcm91cFwiIH0pICYmIGZpcnN0QWx0LmJvZHlbMF0uYm9keS5sZW5ndGggPT09IDE7XG4gICAgICBjb25zdCB0b3BMZXZlbCA9IGhhc1dyYXBwZXJHcm91cCA/IGZpcnN0QWx0LmJvZHlbMF0gOiByb290O1xuICAgICAgaWYgKHBhcmVudC5wYXJlbnQgIT09IHRvcExldmVsIHx8IHRvcExldmVsLmJvZHkubGVuZ3RoID4gMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmBVc2VzIFwiXFxLXCIgaW4gYSB3YXkgdGhhdCdzIHVuc3VwcG9ydGVkYCk7XG4gICAgICB9XG4gICAgICBjb25zdCBsb29rYmVoaW5kID0gY3JlYXRlTG9va2Fyb3VuZEFzc2VydGlvbih7IGJlaGluZDogdHJ1ZSB9KTtcbiAgICAgIGxvb2tiZWhpbmQuYm9keVswXS5ib2R5ID0gcmVtb3ZlQWxsUHJldlNpYmxpbmdzKCk7XG4gICAgICByZXBsYWNlV2l0aChzZXRQYXJlbnREZWVwKGxvb2tiZWhpbmQsIHBhcmVudCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZXhwZWN0ZWQgZGlyZWN0aXZlIGtpbmQgXCIke2tpbmR9XCJgKTtcbiAgICB9XG4gIH0sXG4gIEZsYWdzKHsgbm9kZSwgcGFyZW50IH0pIHtcbiAgICBpZiAobm9kZS5wb3NpeElzQXNjaWkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5zdXBwb3J0ZWQgZmxhZyBcIlBcIicpO1xuICAgIH1cbiAgICBpZiAobm9kZS50ZXh0U2VnbWVudE1vZGUgPT09IFwid29yZFwiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vuc3VwcG9ydGVkIGZsYWcgXCJ5e3d9XCInKTtcbiAgICB9XG4gICAgW1xuICAgICAgXCJkaWdpdElzQXNjaWlcIixcbiAgICAgIC8vIEZsYWcgRFxuICAgICAgXCJleHRlbmRlZFwiLFxuICAgICAgLy8gRmxhZyB4XG4gICAgICBcInBvc2l4SXNBc2NpaVwiLFxuICAgICAgLy8gRmxhZyBQXG4gICAgICBcInNwYWNlSXNBc2NpaVwiLFxuICAgICAgLy8gRmxhZyBTXG4gICAgICBcIndvcmRJc0FzY2lpXCIsXG4gICAgICAvLyBGbGFnIFdcbiAgICAgIFwidGV4dFNlZ21lbnRNb2RlXCJcbiAgICAgIC8vIEZsYWcgeXtnfSBvciB5e3d9XG4gICAgXS5mb3JFYWNoKChmKSA9PiBkZWxldGUgbm9kZVtmXSk7XG4gICAgT2JqZWN0LmFzc2lnbihub2RlLCB7XG4gICAgICAvLyBKUyBmbGFnIGc7IG5vIE9uaWcgZXF1aXZcbiAgICAgIGdsb2JhbDogZmFsc2UsXG4gICAgICAvLyBKUyBmbGFnIGQ7IG5vIE9uaWcgZXF1aXZcbiAgICAgIGhhc0luZGljZXM6IGZhbHNlLFxuICAgICAgLy8gSlMgZmxhZyBtOyBubyBPbmlnIGVxdWl2IGJ1dCBpdHMgYmVoYXZpb3IgaXMgYWx3YXlzIG9uIGluIE9uaWcuIE9uaWcncyBvbmx5IGxpbmUgYnJlYWtcbiAgICAgIC8vIGNoYXIgaXMgbGluZSBmZWVkLCB1bmxpa2UgSlMsIHNvIHRoaXMgZmxhZyBpc24ndCB1c2VkIHNpbmNlIGl0IHdvdWxkIHByb2R1Y2UgaW5hY2N1cmF0ZVxuICAgICAgLy8gcmVzdWx0cyAoYWxzbyBhbGxvd3MgYF5gIGFuZCBgJGAgdG8gYmUgdXNlZCBpbiB0aGUgZ2VuZXJhdG9yIGZvciBzdHJpbmcgc3RhcnQgYW5kIGVuZClcbiAgICAgIG11bHRpbGluZTogZmFsc2UsXG4gICAgICAvLyBKUyBmbGFnIHk7IG5vIE9uaWcgZXF1aXYsIGJ1dCB1c2VkIGZvciBgXFxHYCBlbXVsYXRpb25cbiAgICAgIHN0aWNreTogbm9kZS5zdGlja3kgPz8gZmFsc2VcbiAgICAgIC8vIE5vdGU6IFJlZ2V4KyBkb2Vzbid0IGFsbG93IGV4cGxpY2l0bHkgYWRkaW5nIGZsYWdzIGl0IGhhbmRsZXMgaW1wbGljaXRseSwgc28gbGVhdmUgb3V0XG4gICAgICAvLyBwcm9wZXJ0aWVzIGB1bmljb2RlYCAoSlMgZmxhZyB1KSBhbmQgYHVuaWNvZGVTZXRzYCAoSlMgZmxhZyB2KS4gS2VlcCB0aGUgZXhpc3RpbmcgdmFsdWVzXG4gICAgICAvLyBmb3IgYGlnbm9yZUNhc2VgIChmbGFnIGkpIGFuZCBgZG90QWxsYCAoSlMgZmxhZyBzLCBidXQgT25pZyBmbGFnIG0pXG4gICAgfSk7XG4gICAgcGFyZW50Lm9wdGlvbnMgPSB7XG4gICAgICBkaXNhYmxlOiB7XG4gICAgICAgIC8vIE9uaWcgdXNlcyBkaWZmZXJlbnQgcnVsZXMgZm9yIGZsYWcgeCB0aGFuIFJlZ2V4Kywgc28gZGlzYWJsZSB0aGUgaW1wbGljaXQgZmxhZ1xuICAgICAgICB4OiB0cnVlLFxuICAgICAgICAvLyBPbmlnIGhhcyBubyBmbGFnIHRvIGNvbnRyb2wgXCJuYW1lZCBjYXB0dXJlIG9ubHlcIiBtb2RlIGJ1dCBjb250ZXh0dWFsbHkgYXBwbGllcyBpdHNcbiAgICAgICAgLy8gYmVoYXZpb3Igd2hlbiBuYW1lZCBjYXB0dXJpbmcgaXMgdXNlZCwgc28gZGlzYWJsZSBSZWdleCsncyBpbXBsaWNpdCBmbGFnIGZvciBpdFxuICAgICAgICBuOiB0cnVlXG4gICAgICB9LFxuICAgICAgZm9yY2U6IHtcbiAgICAgICAgLy8gQWx3YXlzIGFkZCBmbGFnIHYgYmVjYXVzZSB3ZSdyZSBnZW5lcmF0aW5nIGFuIEFTVCB0aGF0IHJlbGllcyBvbiBpdCAoaXQgZW5hYmxlcyBKU1xuICAgICAgICAvLyBzdXBwb3J0IGZvciBPbmlnIGZlYXR1cmVzIG5lc3RlZCBjbGFzc2VzLCBpbnRlcnNlY3Rpb24sIFVuaWNvZGUgcHJvcGVydGllcywgZXRjLikuXG4gICAgICAgIC8vIEhvd2V2ZXIsIHRoZSBnZW5lcmF0b3IgbWlnaHQgZGlzYWJsZSBmbGFnIHYgYmFzZWQgb24gaXRzIGB0YXJnZXRgIG9wdGlvblxuICAgICAgICB2OiB0cnVlXG4gICAgICB9XG4gICAgfTtcbiAgfSxcbiAgR3JvdXAoeyBub2RlIH0pIHtcbiAgICBpZiAoIW5vZGUuZmxhZ3MpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgeyBlbmFibGUsIGRpc2FibGUgfSA9IG5vZGUuZmxhZ3M7XG4gICAgZW5hYmxlPy5leHRlbmRlZCAmJiBkZWxldGUgZW5hYmxlLmV4dGVuZGVkO1xuICAgIGRpc2FibGU/LmV4dGVuZGVkICYmIGRlbGV0ZSBkaXNhYmxlLmV4dGVuZGVkO1xuICAgIGVuYWJsZT8uZG90QWxsICYmIGRpc2FibGU/LmRvdEFsbCAmJiBkZWxldGUgZW5hYmxlLmRvdEFsbDtcbiAgICBlbmFibGU/Lmlnbm9yZUNhc2UgJiYgZGlzYWJsZT8uaWdub3JlQ2FzZSAmJiBkZWxldGUgZW5hYmxlLmlnbm9yZUNhc2U7XG4gICAgZW5hYmxlICYmICFPYmplY3Qua2V5cyhlbmFibGUpLmxlbmd0aCAmJiBkZWxldGUgbm9kZS5mbGFncy5lbmFibGU7XG4gICAgZGlzYWJsZSAmJiAhT2JqZWN0LmtleXMoZGlzYWJsZSkubGVuZ3RoICYmIGRlbGV0ZSBub2RlLmZsYWdzLmRpc2FibGU7XG4gICAgIW5vZGUuZmxhZ3MuZW5hYmxlICYmICFub2RlLmZsYWdzLmRpc2FibGUgJiYgZGVsZXRlIG5vZGUuZmxhZ3M7XG4gIH0sXG4gIExvb2thcm91bmRBc3NlcnRpb24oeyBub2RlIH0sIHN0YXRlKSB7XG4gICAgY29uc3QgeyBraW5kIH0gPSBub2RlO1xuICAgIGlmIChraW5kID09PSBcImxvb2tiZWhpbmRcIikge1xuICAgICAgc3RhdGUucGFzc2VkTG9va2JlaGluZCA9IHRydWU7XG4gICAgfVxuICB9LFxuICBOYW1lZENhbGxvdXQoeyBub2RlLCBwYXJlbnQsIHJlcGxhY2VXaXRoIH0pIHtcbiAgICBjb25zdCB7IGtpbmQgfSA9IG5vZGU7XG4gICAgaWYgKGtpbmQgPT09IFwiZmFpbFwiKSB7XG4gICAgICByZXBsYWNlV2l0aChzZXRQYXJlbnREZWVwKGNyZWF0ZUxvb2thcm91bmRBc3NlcnRpb24oeyBuZWdhdGU6IHRydWUgfSksIHBhcmVudCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIG5hbWVkIGNhbGxvdXQgXCIoKiR7a2luZC50b1VwcGVyQ2FzZSgpfVwiYCk7XG4gICAgfVxuICB9LFxuICBRdWFudGlmaWVyKHsgbm9kZSB9KSB7XG4gICAgaWYgKG5vZGUuYm9keS50eXBlID09PSBcIlF1YW50aWZpZXJcIikge1xuICAgICAgY29uc3QgZ3JvdXAgPSBjcmVhdGVHcm91cCgpO1xuICAgICAgZ3JvdXAuYm9keVswXS5ib2R5LnB1c2gobm9kZS5ib2R5KTtcbiAgICAgIG5vZGUuYm9keSA9IHNldFBhcmVudERlZXAoZ3JvdXAsIG5vZGUpO1xuICAgIH1cbiAgfSxcbiAgUmVnZXg6IHtcbiAgICBlbnRlcih7IG5vZGUgfSwgeyBzdXBwb3J0ZWRHTm9kZXMgfSkge1xuICAgICAgY29uc3QgbGVhZGluZ0dzID0gW107XG4gICAgICBsZXQgaGFzQWx0V2l0aExlYWRHID0gZmFsc2U7XG4gICAgICBsZXQgaGFzQWx0V2l0aG91dExlYWRHID0gZmFsc2U7XG4gICAgICBmb3IgKGNvbnN0IGFsdCBvZiBub2RlLmJvZHkpIHtcbiAgICAgICAgaWYgKGFsdC5ib2R5Lmxlbmd0aCA9PT0gMSAmJiBhbHQuYm9keVswXS5raW5kID09PSBcInNlYXJjaF9zdGFydFwiKSB7XG4gICAgICAgICAgYWx0LmJvZHkucG9wKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgbGVhZGluZ0cgPSBnZXRMZWFkaW5nRyhhbHQuYm9keSk7XG4gICAgICAgICAgaWYgKGxlYWRpbmdHKSB7XG4gICAgICAgICAgICBoYXNBbHRXaXRoTGVhZEcgPSB0cnVlO1xuICAgICAgICAgICAgQXJyYXkuaXNBcnJheShsZWFkaW5nRykgPyBsZWFkaW5nR3MucHVzaCguLi5sZWFkaW5nRykgOiBsZWFkaW5nR3MucHVzaChsZWFkaW5nRyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhhc0FsdFdpdGhvdXRMZWFkRyA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoaGFzQWx0V2l0aExlYWRHICYmICFoYXNBbHRXaXRob3V0TGVhZEcpIHtcbiAgICAgICAgbGVhZGluZ0dzLmZvckVhY2goKGcpID0+IHN1cHBvcnRlZEdOb2Rlcy5hZGQoZykpO1xuICAgICAgfVxuICAgIH0sXG4gICAgZXhpdChfLCB7IGFjY3VyYWN5LCBwYXNzZWRMb29rYmVoaW5kLCBzdHJhdGVneSB9KSB7XG4gICAgICBpZiAoYWNjdXJhY3kgPT09IFwic3RyaWN0XCIgJiYgcGFzc2VkTG9va2JlaGluZCAmJiBzdHJhdGVneSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmBVc2VzIFwiXFxHXCIgaW4gYSB3YXkgdGhhdCByZXF1aXJlcyBub24tc3RyaWN0IGFjY3VyYWN5YCk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBTdWJyb3V0aW5lKHsgbm9kZSB9LCB7IGpzR3JvdXBOYW1lTWFwIH0pIHtcbiAgICBsZXQgeyByZWYgfSA9IG5vZGU7XG4gICAgaWYgKHR5cGVvZiByZWYgPT09IFwic3RyaW5nXCIgJiYgIWlzVmFsaWRKc0dyb3VwTmFtZShyZWYpKSB7XG4gICAgICByZWYgPSBnZXRBbmRTdG9yZUpzR3JvdXBOYW1lKHJlZiwganNHcm91cE5hbWVNYXApO1xuICAgICAgbm9kZS5yZWYgPSByZWY7XG4gICAgfVxuICB9XG59O1xudmFyIFNlY29uZFBhc3NWaXNpdG9yID0ge1xuICBCYWNrcmVmZXJlbmNlKHsgbm9kZSB9LCB7IG11bHRpcGxleENhcHR1cmVzVG9MZWZ0QnlSZWYsIHJlZmZlZE5vZGVzQnlSZWZlcmVuY2VyIH0pIHtcbiAgICBjb25zdCB7IG9ycGhhbiwgcmVmIH0gPSBub2RlO1xuICAgIGlmICghb3JwaGFuKSB7XG4gICAgICByZWZmZWROb2Rlc0J5UmVmZXJlbmNlci5zZXQobm9kZSwgWy4uLm11bHRpcGxleENhcHR1cmVzVG9MZWZ0QnlSZWYuZ2V0KHJlZikubWFwKCh7IG5vZGU6IG5vZGUyIH0pID0+IG5vZGUyKV0pO1xuICAgIH1cbiAgfSxcbiAgQ2FwdHVyaW5nR3JvdXA6IHtcbiAgICBlbnRlcih7XG4gICAgICBub2RlLFxuICAgICAgcGFyZW50LFxuICAgICAgcmVwbGFjZVdpdGgsXG4gICAgICBza2lwXG4gICAgfSwge1xuICAgICAgZ3JvdXBPcmlnaW5CeUNvcHksXG4gICAgICBncm91cHNCeU5hbWUsXG4gICAgICBtdWx0aXBsZXhDYXB0dXJlc1RvTGVmdEJ5UmVmLFxuICAgICAgb3BlblJlZnMsXG4gICAgICByZWZmZWROb2Rlc0J5UmVmZXJlbmNlclxuICAgIH0pIHtcbiAgICAgIGNvbnN0IG9yaWdpbiA9IGdyb3VwT3JpZ2luQnlDb3B5LmdldChub2RlKTtcbiAgICAgIGlmIChvcmlnaW4gJiYgb3BlblJlZnMuaGFzKG5vZGUubnVtYmVyKSkge1xuICAgICAgICBjb25zdCByZWN1cnNpb24yID0gc2V0UGFyZW50KGNyZWF0ZVJlY3Vyc2lvbihub2RlLm51bWJlciksIHBhcmVudCk7XG4gICAgICAgIHJlZmZlZE5vZGVzQnlSZWZlcmVuY2VyLnNldChyZWN1cnNpb24yLCBvcGVuUmVmcy5nZXQobm9kZS5udW1iZXIpKTtcbiAgICAgICAgcmVwbGFjZVdpdGgocmVjdXJzaW9uMik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIG9wZW5SZWZzLnNldChub2RlLm51bWJlciwgbm9kZSk7XG4gICAgICBtdWx0aXBsZXhDYXB0dXJlc1RvTGVmdEJ5UmVmLnNldChub2RlLm51bWJlciwgW10pO1xuICAgICAgaWYgKG5vZGUubmFtZSkge1xuICAgICAgICBnZXRPckluc2VydChtdWx0aXBsZXhDYXB0dXJlc1RvTGVmdEJ5UmVmLCBub2RlLm5hbWUsIFtdKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG11bHRpcGxleE5vZGVzID0gbXVsdGlwbGV4Q2FwdHVyZXNUb0xlZnRCeVJlZi5nZXQobm9kZS5uYW1lID8/IG5vZGUubnVtYmVyKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbXVsdGlwbGV4Tm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgbXVsdGlwbGV4ID0gbXVsdGlwbGV4Tm9kZXNbaV07XG4gICAgICAgIGlmIChcbiAgICAgICAgICAvLyBUaGlzIGdyb3VwIGlzIGZyb20gc3Vicm91dGluZSBleHBhbnNpb24sIGFuZCB0aGVyZSdzIGEgbXVsdGlwbGV4IHZhbHVlIGZyb20gZWl0aGVyIHRoZVxuICAgICAgICAgIC8vIG9yaWdpbiBub2RlIG9yIGEgcHJpb3Igc3Vicm91dGluZSBleHBhbnNpb24gZ3JvdXAgd2l0aCB0aGUgc2FtZSBvcmlnaW5cbiAgICAgICAgICBvcmlnaW4gPT09IG11bHRpcGxleC5ub2RlIHx8IG9yaWdpbiAmJiBvcmlnaW4gPT09IG11bHRpcGxleC5vcmlnaW4gfHwgLy8gVGhpcyBncm91cCBpcyBub3QgZnJvbSBzdWJyb3V0aW5lIGV4cGFuc2lvbiwgYW5kIGl0IGNvbWVzIGFmdGVyIGEgc3Vicm91dGluZSBleHBhbnNpb25cbiAgICAgICAgICAvLyBncm91cCB0aGF0IHJlZmVycyB0byB0aGlzIGdyb3VwXG4gICAgICAgICAgbm9kZSA9PT0gbXVsdGlwbGV4Lm9yaWdpblxuICAgICAgICApIHtcbiAgICAgICAgICBtdWx0aXBsZXhOb2Rlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG11bHRpcGxleENhcHR1cmVzVG9MZWZ0QnlSZWYuZ2V0KG5vZGUubnVtYmVyKS5wdXNoKHsgbm9kZSwgb3JpZ2luIH0pO1xuICAgICAgaWYgKG5vZGUubmFtZSkge1xuICAgICAgICBtdWx0aXBsZXhDYXB0dXJlc1RvTGVmdEJ5UmVmLmdldChub2RlLm5hbWUpLnB1c2goeyBub2RlLCBvcmlnaW4gfSk7XG4gICAgICB9XG4gICAgICBpZiAobm9kZS5uYW1lKSB7XG4gICAgICAgIGNvbnN0IGdyb3Vwc1dpdGhTYW1lTmFtZSA9IGdldE9ySW5zZXJ0KGdyb3Vwc0J5TmFtZSwgbm9kZS5uYW1lLCAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpKTtcbiAgICAgICAgbGV0IGhhc0R1cGxpY2F0ZU5hbWVUb1JlbW92ZSA9IGZhbHNlO1xuICAgICAgICBpZiAob3JpZ2luKSB7XG4gICAgICAgICAgaGFzRHVwbGljYXRlTmFtZVRvUmVtb3ZlID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGdyb3VwSW5mbyBvZiBncm91cHNXaXRoU2FtZU5hbWUudmFsdWVzKCkpIHtcbiAgICAgICAgICAgIGlmICghZ3JvdXBJbmZvLmhhc0R1cGxpY2F0ZU5hbWVUb1JlbW92ZSkge1xuICAgICAgICAgICAgICBoYXNEdXBsaWNhdGVOYW1lVG9SZW1vdmUgPSB0cnVlO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZ3JvdXBzQnlOYW1lLmdldChub2RlLm5hbWUpLnNldChub2RlLCB7IG5vZGUsIGhhc0R1cGxpY2F0ZU5hbWVUb1JlbW92ZSB9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGV4aXQoeyBub2RlIH0sIHsgb3BlblJlZnMgfSkge1xuICAgICAgaWYgKG9wZW5SZWZzLmdldChub2RlLm51bWJlcikgPT09IG5vZGUpIHtcbiAgICAgICAgb3BlblJlZnMuZGVsZXRlKG5vZGUubnVtYmVyKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIEdyb3VwOiB7XG4gICAgZW50ZXIoeyBub2RlIH0sIHN0YXRlKSB7XG4gICAgICBzdGF0ZS5wcmV2RmxhZ3MgPSBzdGF0ZS5jdXJyZW50RmxhZ3M7XG4gICAgICBpZiAobm9kZS5mbGFncykge1xuICAgICAgICBzdGF0ZS5jdXJyZW50RmxhZ3MgPSBnZXROZXdDdXJyZW50RmxhZ3Moc3RhdGUuY3VycmVudEZsYWdzLCBub2RlLmZsYWdzKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGV4aXQoXywgc3RhdGUpIHtcbiAgICAgIHN0YXRlLmN1cnJlbnRGbGFncyA9IHN0YXRlLnByZXZGbGFncztcbiAgICB9XG4gIH0sXG4gIFN1YnJvdXRpbmUoeyBub2RlLCBwYXJlbnQsIHJlcGxhY2VXaXRoIH0sIHN0YXRlKSB7XG4gICAgY29uc3QgeyBpc1JlY3Vyc2l2ZSwgcmVmIH0gPSBub2RlO1xuICAgIGlmIChpc1JlY3Vyc2l2ZSkge1xuICAgICAgbGV0IHJlZmZlZCA9IHBhcmVudDtcbiAgICAgIHdoaWxlIChyZWZmZWQgPSByZWZmZWQucGFyZW50KSB7XG4gICAgICAgIGlmIChyZWZmZWQudHlwZSA9PT0gXCJDYXB0dXJpbmdHcm91cFwiICYmIChyZWZmZWQubmFtZSA9PT0gcmVmIHx8IHJlZmZlZC5udW1iZXIgPT09IHJlZikpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc3RhdGUucmVmZmVkTm9kZXNCeVJlZmVyZW5jZXIuc2V0KG5vZGUsIHJlZmZlZCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJlZmZlZEdyb3VwTm9kZSA9IHN0YXRlLnN1YnJvdXRpbmVSZWZNYXAuZ2V0KHJlZik7XG4gICAgY29uc3QgaXNHbG9iYWxSZWN1cnNpb24gPSByZWYgPT09IDA7XG4gICAgY29uc3QgZXhwYW5kZWRTdWJyb3V0aW5lID0gaXNHbG9iYWxSZWN1cnNpb24gPyBjcmVhdGVSZWN1cnNpb24oMCkgOiAoXG4gICAgICAvLyBUaGUgcmVmZmVkIGdyb3VwIG1pZ2h0IGl0c2VsZiBjb250YWluIHN1YnJvdXRpbmVzLCB3aGljaCBhcmUgZXhwYW5kZWQgZHVyaW5nIHN1Yi10cmF2ZXJzYWxcbiAgICAgIGNsb25lQ2FwdHVyaW5nR3JvdXAocmVmZmVkR3JvdXBOb2RlLCBzdGF0ZS5ncm91cE9yaWdpbkJ5Q29weSwgbnVsbClcbiAgICApO1xuICAgIGxldCByZXBsYWNlbWVudCA9IGV4cGFuZGVkU3Vicm91dGluZTtcbiAgICBpZiAoIWlzR2xvYmFsUmVjdXJzaW9uKSB7XG4gICAgICBjb25zdCByZWZmZWRHcm91cEZsYWdNb2RzID0gZ2V0Q29tYmluZWRGbGFnTW9kc0Zyb21GbGFnTm9kZXMoZ2V0QWxsUGFyZW50cyhcbiAgICAgICAgcmVmZmVkR3JvdXBOb2RlLFxuICAgICAgICAocCkgPT4gcC50eXBlID09PSBcIkdyb3VwXCIgJiYgISFwLmZsYWdzXG4gICAgICApKTtcbiAgICAgIGNvbnN0IHJlZmZlZEdyb3VwRmxhZ3MgPSByZWZmZWRHcm91cEZsYWdNb2RzID8gZ2V0TmV3Q3VycmVudEZsYWdzKHN0YXRlLmdsb2JhbEZsYWdzLCByZWZmZWRHcm91cEZsYWdNb2RzKSA6IHN0YXRlLmdsb2JhbEZsYWdzO1xuICAgICAgaWYgKCFhcmVGbGFnc0VxdWFsKHJlZmZlZEdyb3VwRmxhZ3MsIHN0YXRlLmN1cnJlbnRGbGFncykpIHtcbiAgICAgICAgcmVwbGFjZW1lbnQgPSBjcmVhdGVHcm91cCh7XG4gICAgICAgICAgZmxhZ3M6IGdldEZsYWdNb2RzRnJvbUZsYWdzKHJlZmZlZEdyb3VwRmxhZ3MpXG4gICAgICAgIH0pO1xuICAgICAgICByZXBsYWNlbWVudC5ib2R5WzBdLmJvZHkucHVzaChleHBhbmRlZFN1YnJvdXRpbmUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXBsYWNlV2l0aChzZXRQYXJlbnREZWVwKHJlcGxhY2VtZW50LCBwYXJlbnQpLCB7IHRyYXZlcnNlOiAhaXNHbG9iYWxSZWN1cnNpb24gfSk7XG4gIH1cbn07XG52YXIgVGhpcmRQYXNzVmlzaXRvciA9IHtcbiAgQmFja3JlZmVyZW5jZSh7IG5vZGUsIHBhcmVudCwgcmVwbGFjZVdpdGggfSwgc3RhdGUpIHtcbiAgICBpZiAobm9kZS5vcnBoYW4pIHtcbiAgICAgIHN0YXRlLmhpZ2hlc3RPcnBoYW5CYWNrcmVmID0gTWF0aC5tYXgoc3RhdGUuaGlnaGVzdE9ycGhhbkJhY2tyZWYsIG5vZGUucmVmKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcmVmZmVkTm9kZXMgPSBzdGF0ZS5yZWZmZWROb2Rlc0J5UmVmZXJlbmNlci5nZXQobm9kZSk7XG4gICAgY29uc3QgcGFydGljaXBhbnRzID0gcmVmZmVkTm9kZXMuZmlsdGVyKChyZWZmZWQpID0+IGNhblBhcnRpY2lwYXRlV2l0aE5vZGUocmVmZmVkLCBub2RlKSk7XG4gICAgaWYgKCFwYXJ0aWNpcGFudHMubGVuZ3RoKSB7XG4gICAgICByZXBsYWNlV2l0aChzZXRQYXJlbnREZWVwKGNyZWF0ZUxvb2thcm91bmRBc3NlcnRpb24oeyBuZWdhdGU6IHRydWUgfSksIHBhcmVudCkpO1xuICAgIH0gZWxzZSBpZiAocGFydGljaXBhbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgIGNvbnN0IGdyb3VwID0gY3JlYXRlR3JvdXAoe1xuICAgICAgICBhdG9taWM6IHRydWUsXG4gICAgICAgIGJvZHk6IHBhcnRpY2lwYW50cy5yZXZlcnNlKCkubWFwKChyZWZmZWQpID0+IGNyZWF0ZUFsdGVybmF0aXZlKHtcbiAgICAgICAgICBib2R5OiBbY3JlYXRlQmFja3JlZmVyZW5jZShyZWZmZWQubnVtYmVyKV1cbiAgICAgICAgfSkpXG4gICAgICB9KTtcbiAgICAgIHJlcGxhY2VXaXRoKHNldFBhcmVudERlZXAoZ3JvdXAsIHBhcmVudCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBub2RlLnJlZiA9IHBhcnRpY2lwYW50c1swXS5udW1iZXI7XG4gICAgfVxuICB9LFxuICBDYXB0dXJpbmdHcm91cCh7IG5vZGUgfSwgc3RhdGUpIHtcbiAgICBub2RlLm51bWJlciA9ICsrc3RhdGUubnVtQ2FwdHVyZXNUb0xlZnQ7XG4gICAgaWYgKG5vZGUubmFtZSkge1xuICAgICAgaWYgKHN0YXRlLmdyb3Vwc0J5TmFtZS5nZXQobm9kZS5uYW1lKS5nZXQobm9kZSkuaGFzRHVwbGljYXRlTmFtZVRvUmVtb3ZlKSB7XG4gICAgICAgIGRlbGV0ZSBub2RlLm5hbWU7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBSZWdleDoge1xuICAgIGV4aXQoeyBub2RlIH0sIHN0YXRlKSB7XG4gICAgICBjb25zdCBudW1DYXBzTmVlZGVkID0gTWF0aC5tYXgoc3RhdGUuaGlnaGVzdE9ycGhhbkJhY2tyZWYgLSBzdGF0ZS5udW1DYXB0dXJlc1RvTGVmdCwgMCk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bUNhcHNOZWVkZWQ7IGkrKykge1xuICAgICAgICBjb25zdCBlbXB0eUNhcHR1cmUgPSBjcmVhdGVDYXB0dXJpbmdHcm91cCgpO1xuICAgICAgICBub2RlLmJvZHkuYXQoLTEpLmJvZHkucHVzaChlbXB0eUNhcHR1cmUpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgU3Vicm91dGluZSh7IG5vZGUgfSwgc3RhdGUpIHtcbiAgICBpZiAoIW5vZGUuaXNSZWN1cnNpdmUgfHwgbm9kZS5yZWYgPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbm9kZS5yZWYgPSBzdGF0ZS5yZWZmZWROb2Rlc0J5UmVmZXJlbmNlci5nZXQobm9kZSkubnVtYmVyO1xuICB9XG59O1xuZnVuY3Rpb24gYWRkUGFyZW50UHJvcGVydGllcyhyb290KSB7XG4gIHRyYXZlcnNlKHJvb3QsIHtcbiAgICBcIipcIih7IG5vZGUsIHBhcmVudCB9KSB7XG4gICAgICBub2RlLnBhcmVudCA9IHBhcmVudDtcbiAgICB9XG4gIH0pO1xufVxuZnVuY3Rpb24gYXJlRmxhZ3NFcXVhbChhLCBiKSB7XG4gIHJldHVybiBhLmRvdEFsbCA9PT0gYi5kb3RBbGwgJiYgYS5pZ25vcmVDYXNlID09PSBiLmlnbm9yZUNhc2U7XG59XG5mdW5jdGlvbiBjYW5QYXJ0aWNpcGF0ZVdpdGhOb2RlKGNhcHR1cmUsIG5vZGUpIHtcbiAgbGV0IHJpZ2h0bW9zdFBvaW50ID0gbm9kZTtcbiAgZG8ge1xuICAgIGlmIChyaWdodG1vc3RQb2ludC50eXBlID09PSBcIlJlZ2V4XCIpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHJpZ2h0bW9zdFBvaW50LnR5cGUgPT09IFwiQWx0ZXJuYXRpdmVcIikge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChyaWdodG1vc3RQb2ludCA9PT0gY2FwdHVyZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBraWRzT2ZQYXJlbnQgPSBnZXRLaWRzKHJpZ2h0bW9zdFBvaW50LnBhcmVudCk7XG4gICAgZm9yIChjb25zdCBraWQgb2Yga2lkc09mUGFyZW50KSB7XG4gICAgICBpZiAoa2lkID09PSByaWdodG1vc3RQb2ludCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGlmIChraWQgPT09IGNhcHR1cmUgfHwgaXNBbmNlc3Rvck9mKGtpZCwgY2FwdHVyZSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9IHdoaWxlIChyaWdodG1vc3RQb2ludCA9IHJpZ2h0bW9zdFBvaW50LnBhcmVudCk7XG4gIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgcGF0aFwiKTtcbn1cbmZ1bmN0aW9uIGNsb25lQ2FwdHVyaW5nR3JvdXAob2JqLCBvcmlnaW5NYXAsIHVwLCB1cDIpIHtcbiAgY29uc3Qgc3RvcmUgPSBBcnJheS5pc0FycmF5KG9iaikgPyBbXSA6IHt9O1xuICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhvYmopKSB7XG4gICAgaWYgKGtleSA9PT0gXCJwYXJlbnRcIikge1xuICAgICAgc3RvcmUucGFyZW50ID0gQXJyYXkuaXNBcnJheSh1cCkgPyB1cDIgOiB1cDtcbiAgICB9IGVsc2UgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgc3RvcmVba2V5XSA9IGNsb25lQ2FwdHVyaW5nR3JvdXAodmFsdWUsIG9yaWdpbk1hcCwgc3RvcmUsIHVwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGtleSA9PT0gXCJ0eXBlXCIgJiYgdmFsdWUgPT09IFwiQ2FwdHVyaW5nR3JvdXBcIikge1xuICAgICAgICBvcmlnaW5NYXAuc2V0KHN0b3JlLCBvcmlnaW5NYXAuZ2V0KG9iaikgPz8gb2JqKTtcbiAgICAgIH1cbiAgICAgIHN0b3JlW2tleV0gPSB2YWx1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN0b3JlO1xufVxuZnVuY3Rpb24gY3JlYXRlUmVjdXJzaW9uKHJlZikge1xuICBjb25zdCBub2RlID0gY3JlYXRlU3Vicm91dGluZShyZWYpO1xuICBub2RlLmlzUmVjdXJzaXZlID0gdHJ1ZTtcbiAgcmV0dXJuIG5vZGU7XG59XG5mdW5jdGlvbiBnZXRBbGxQYXJlbnRzKG5vZGUsIGZpbHRlckZuKSB7XG4gIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgd2hpbGUgKG5vZGUgPSBub2RlLnBhcmVudCkge1xuICAgIGlmICghZmlsdGVyRm4gfHwgZmlsdGVyRm4obm9kZSkpIHtcbiAgICAgIHJlc3VsdHMucHVzaChub2RlKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHM7XG59XG5mdW5jdGlvbiBnZXRBbmRTdG9yZUpzR3JvdXBOYW1lKG5hbWUsIG1hcCkge1xuICBpZiAobWFwLmhhcyhuYW1lKSkge1xuICAgIHJldHVybiBtYXAuZ2V0KG5hbWUpO1xuICB9XG4gIGNvbnN0IGpzTmFtZSA9IGAkJHttYXAuc2l6ZX1fJHtuYW1lLnJlcGxhY2UoL15bXiRfXFxwe0lEU31dfFteJFxcdTIwMENcXHUyMDBEXFxwe0lEQ31dL3VnLCBcIl9cIil9YDtcbiAgbWFwLnNldChuYW1lLCBqc05hbWUpO1xuICByZXR1cm4ganNOYW1lO1xufVxuZnVuY3Rpb24gZ2V0Q29tYmluZWRGbGFnTW9kc0Zyb21GbGFnTm9kZXMoZmxhZ05vZGVzKSB7XG4gIGNvbnN0IGZsYWdQcm9wcyA9IFtcImRvdEFsbFwiLCBcImlnbm9yZUNhc2VcIl07XG4gIGNvbnN0IGNvbWJpbmVkRmxhZ3MgPSB7IGVuYWJsZToge30sIGRpc2FibGU6IHt9IH07XG4gIGZsYWdOb2Rlcy5mb3JFYWNoKCh7IGZsYWdzIH0pID0+IHtcbiAgICBmbGFnUHJvcHMuZm9yRWFjaCgocHJvcCkgPT4ge1xuICAgICAgaWYgKGZsYWdzLmVuYWJsZT8uW3Byb3BdKSB7XG4gICAgICAgIGRlbGV0ZSBjb21iaW5lZEZsYWdzLmRpc2FibGVbcHJvcF07XG4gICAgICAgIGNvbWJpbmVkRmxhZ3MuZW5hYmxlW3Byb3BdID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmIChmbGFncy5kaXNhYmxlPy5bcHJvcF0pIHtcbiAgICAgICAgY29tYmluZWRGbGFncy5kaXNhYmxlW3Byb3BdID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG4gIGlmICghT2JqZWN0LmtleXMoY29tYmluZWRGbGFncy5lbmFibGUpLmxlbmd0aCkge1xuICAgIGRlbGV0ZSBjb21iaW5lZEZsYWdzLmVuYWJsZTtcbiAgfVxuICBpZiAoIU9iamVjdC5rZXlzKGNvbWJpbmVkRmxhZ3MuZGlzYWJsZSkubGVuZ3RoKSB7XG4gICAgZGVsZXRlIGNvbWJpbmVkRmxhZ3MuZGlzYWJsZTtcbiAgfVxuICBpZiAoY29tYmluZWRGbGFncy5lbmFibGUgfHwgY29tYmluZWRGbGFncy5kaXNhYmxlKSB7XG4gICAgcmV0dXJuIGNvbWJpbmVkRmxhZ3M7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5mdW5jdGlvbiBnZXRGbGFnTW9kc0Zyb21GbGFncyh7IGRvdEFsbCwgaWdub3JlQ2FzZSB9KSB7XG4gIGNvbnN0IG1vZHMgPSB7fTtcbiAgaWYgKGRvdEFsbCB8fCBpZ25vcmVDYXNlKSB7XG4gICAgbW9kcy5lbmFibGUgPSB7fTtcbiAgICBkb3RBbGwgJiYgKG1vZHMuZW5hYmxlLmRvdEFsbCA9IHRydWUpO1xuICAgIGlnbm9yZUNhc2UgJiYgKG1vZHMuZW5hYmxlLmlnbm9yZUNhc2UgPSB0cnVlKTtcbiAgfVxuICBpZiAoIWRvdEFsbCB8fCAhaWdub3JlQ2FzZSkge1xuICAgIG1vZHMuZGlzYWJsZSA9IHt9O1xuICAgICFkb3RBbGwgJiYgKG1vZHMuZGlzYWJsZS5kb3RBbGwgPSB0cnVlKTtcbiAgICAhaWdub3JlQ2FzZSAmJiAobW9kcy5kaXNhYmxlLmlnbm9yZUNhc2UgPSB0cnVlKTtcbiAgfVxuICByZXR1cm4gbW9kcztcbn1cbmZ1bmN0aW9uIGdldEtpZHMobm9kZSkge1xuICBpZiAoIW5vZGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJOb2RlIGV4cGVjdGVkXCIpO1xuICB9XG4gIGNvbnN0IHsgYm9keSB9ID0gbm9kZTtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYm9keSkgPyBib2R5IDogYm9keSA/IFtib2R5XSA6IG51bGw7XG59XG5mdW5jdGlvbiBnZXRMZWFkaW5nRyhlbHMpIHtcbiAgY29uc3QgZmlyc3RUb0NvbnNpZGVyID0gZWxzLmZpbmQoKGVsKSA9PiBlbC5raW5kID09PSBcInNlYXJjaF9zdGFydFwiIHx8IGlzTG9uZUdMb29rYXJvdW5kKGVsLCB7IG5lZ2F0ZTogZmFsc2UgfSkgfHwgIWlzQWx3YXlzWmVyb0xlbmd0aChlbCkpO1xuICBpZiAoIWZpcnN0VG9Db25zaWRlcikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmIChmaXJzdFRvQ29uc2lkZXIua2luZCA9PT0gXCJzZWFyY2hfc3RhcnRcIikge1xuICAgIHJldHVybiBmaXJzdFRvQ29uc2lkZXI7XG4gIH1cbiAgaWYgKGZpcnN0VG9Db25zaWRlci50eXBlID09PSBcIkxvb2thcm91bmRBc3NlcnRpb25cIikge1xuICAgIHJldHVybiBmaXJzdFRvQ29uc2lkZXIuYm9keVswXS5ib2R5WzBdO1xuICB9XG4gIGlmIChmaXJzdFRvQ29uc2lkZXIudHlwZSA9PT0gXCJDYXB0dXJpbmdHcm91cFwiIHx8IGZpcnN0VG9Db25zaWRlci50eXBlID09PSBcIkdyb3VwXCIpIHtcbiAgICBjb25zdCBnTm9kZXNGb3JHcm91cCA9IFtdO1xuICAgIGZvciAoY29uc3QgYWx0IG9mIGZpcnN0VG9Db25zaWRlci5ib2R5KSB7XG4gICAgICBjb25zdCBsZWFkaW5nRyA9IGdldExlYWRpbmdHKGFsdC5ib2R5KTtcbiAgICAgIGlmICghbGVhZGluZ0cpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBBcnJheS5pc0FycmF5KGxlYWRpbmdHKSA/IGdOb2Rlc0Zvckdyb3VwLnB1c2goLi4ubGVhZGluZ0cpIDogZ05vZGVzRm9yR3JvdXAucHVzaChsZWFkaW5nRyk7XG4gICAgfVxuICAgIHJldHVybiBnTm9kZXNGb3JHcm91cDtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cbmZ1bmN0aW9uIGlzQW5jZXN0b3JPZihub2RlLCBkZXNjZW5kYW50KSB7XG4gIGNvbnN0IGtpZHMgPSBnZXRLaWRzKG5vZGUpID8/IFtdO1xuICBmb3IgKGNvbnN0IGtpZCBvZiBraWRzKSB7XG4gICAgaWYgKGtpZCA9PT0gZGVzY2VuZGFudCB8fCBpc0FuY2VzdG9yT2Yoa2lkLCBkZXNjZW5kYW50KSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cbmZ1bmN0aW9uIGlzQWx3YXlzWmVyb0xlbmd0aCh7IHR5cGUgfSkge1xuICByZXR1cm4gdHlwZSA9PT0gXCJBc3NlcnRpb25cIiB8fCB0eXBlID09PSBcIkRpcmVjdGl2ZVwiIHx8IHR5cGUgPT09IFwiTG9va2Fyb3VuZEFzc2VydGlvblwiO1xufVxuZnVuY3Rpb24gaXNBbHdheXNOb25aZXJvTGVuZ3RoKG5vZGUpIHtcbiAgY29uc3QgdHlwZXMgPSBbXG4gICAgXCJDaGFyYWN0ZXJcIixcbiAgICBcIkNoYXJhY3RlckNsYXNzXCIsXG4gICAgXCJDaGFyYWN0ZXJTZXRcIlxuICBdO1xuICByZXR1cm4gdHlwZXMuaW5jbHVkZXMobm9kZS50eXBlKSB8fCBub2RlLnR5cGUgPT09IFwiUXVhbnRpZmllclwiICYmIG5vZGUubWluICYmIHR5cGVzLmluY2x1ZGVzKG5vZGUuYm9keS50eXBlKTtcbn1cbmZ1bmN0aW9uIGlzTG9uZUdMb29rYXJvdW5kKG5vZGUsIG9wdGlvbnMpIHtcbiAgY29uc3Qgb3B0cyA9IHtcbiAgICBuZWdhdGU6IG51bGwsXG4gICAgLi4ub3B0aW9uc1xuICB9O1xuICByZXR1cm4gbm9kZS50eXBlID09PSBcIkxvb2thcm91bmRBc3NlcnRpb25cIiAmJiAob3B0cy5uZWdhdGUgPT09IG51bGwgfHwgbm9kZS5uZWdhdGUgPT09IG9wdHMubmVnYXRlKSAmJiBub2RlLmJvZHkubGVuZ3RoID09PSAxICYmIGhhc09ubHlDaGlsZChub2RlLmJvZHlbMF0sIHtcbiAgICB0eXBlOiBcIkFzc2VydGlvblwiLFxuICAgIGtpbmQ6IFwic2VhcmNoX3N0YXJ0XCJcbiAgfSk7XG59XG5mdW5jdGlvbiBpc1ZhbGlkSnNHcm91cE5hbWUobmFtZSkge1xuICByZXR1cm4gL15bJF9cXHB7SURTfV1bJFxcdTIwMENcXHUyMDBEXFxwe0lEQ31dKiQvdS50ZXN0KG5hbWUpO1xufVxuZnVuY3Rpb24gcGFyc2VGcmFnbWVudChwYXR0ZXJuLCBvcHRpb25zKSB7XG4gIGNvbnN0IGFzdCA9IHBhcnNlKHBhdHRlcm4sIHtcbiAgICAuLi5vcHRpb25zLFxuICAgIC8vIFByb3ZpZGluZyBhIGN1c3RvbSBzZXQgb2YgVW5pY29kZSBwcm9wZXJ0eSBuYW1lcyBhdm9pZHMgY29udmVydGluZyBzb21lIEpTIFVuaWNvZGVcbiAgICAvLyBwcm9wZXJ0aWVzIChleDogYFxccHtBbHBoYX1gKSB0byBPbmlnIFBPU0lYIGNsYXNzZXNcbiAgICB1bmljb2RlUHJvcGVydHlNYXA6IEpzVW5pY29kZVByb3BlcnR5TWFwXG4gIH0pO1xuICBjb25zdCBhbHRzID0gYXN0LmJvZHk7XG4gIGlmIChhbHRzLmxlbmd0aCA+IDEgfHwgYWx0c1swXS5ib2R5Lmxlbmd0aCA+IDEpIHtcbiAgICByZXR1cm4gY3JlYXRlR3JvdXAoeyBib2R5OiBhbHRzIH0pO1xuICB9XG4gIHJldHVybiBhbHRzWzBdLmJvZHlbMF07XG59XG5mdW5jdGlvbiBzZXROZWdhdGUobm9kZSwgbmVnYXRlKSB7XG4gIG5vZGUubmVnYXRlID0gbmVnYXRlO1xuICByZXR1cm4gbm9kZTtcbn1cbmZ1bmN0aW9uIHNldFBhcmVudChub2RlLCBwYXJlbnQpIHtcbiAgbm9kZS5wYXJlbnQgPSBwYXJlbnQ7XG4gIHJldHVybiBub2RlO1xufVxuZnVuY3Rpb24gc2V0UGFyZW50RGVlcChub2RlLCBwYXJlbnQpIHtcbiAgYWRkUGFyZW50UHJvcGVydGllcyhub2RlKTtcbiAgbm9kZS5wYXJlbnQgPSBwYXJlbnQ7XG4gIHJldHVybiBub2RlO1xufVxuXG4vLyBzcmMvZ2VuZXJhdGUuanNcbmltcG9ydCB7IGNyZWF0ZUFsdGVybmF0aXZlIGFzIGNyZWF0ZUFsdGVybmF0aXZlMiwgY3JlYXRlQ2hhcmFjdGVyIGFzIGNyZWF0ZUNoYXJhY3RlcjIsIGNyZWF0ZUdyb3VwIGFzIGNyZWF0ZUdyb3VwMiB9IGZyb20gXCJvbmlndXJ1bWEtcGFyc2VyL3BhcnNlclwiO1xuaW1wb3J0IHsgdHJhdmVyc2UgYXMgdHJhdmVyc2UyIH0gZnJvbSBcIm9uaWd1cnVtYS1wYXJzZXIvdHJhdmVyc2VyXCI7XG5mdW5jdGlvbiBnZW5lcmF0ZShhc3QsIG9wdGlvbnMpIHtcbiAgY29uc3Qgb3B0cyA9IGdldE9wdGlvbnMob3B0aW9ucyk7XG4gIGNvbnN0IG1pblRhcmdldEVzMjAyNCA9IGlzTWluVGFyZ2V0KG9wdHMudGFyZ2V0LCBcIkVTMjAyNFwiKTtcbiAgY29uc3QgbWluVGFyZ2V0RXMyMDI1ID0gaXNNaW5UYXJnZXQob3B0cy50YXJnZXQsIFwiRVMyMDI1XCIpO1xuICBjb25zdCByZWN1cnNpb25MaW1pdCA9IG9wdHMucnVsZXMucmVjdXJzaW9uTGltaXQ7XG4gIGlmICghTnVtYmVyLmlzSW50ZWdlcihyZWN1cnNpb25MaW1pdCkgfHwgcmVjdXJzaW9uTGltaXQgPCAyIHx8IHJlY3Vyc2lvbkxpbWl0ID4gMjApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHJlY3Vyc2lvbkxpbWl0OyB1c2UgMi0yMFwiKTtcbiAgfVxuICBsZXQgaGFzQ2FzZUluc2Vuc2l0aXZlTm9kZSA9IG51bGw7XG4gIGxldCBoYXNDYXNlU2Vuc2l0aXZlTm9kZSA9IG51bGw7XG4gIGlmICghbWluVGFyZ2V0RXMyMDI1KSB7XG4gICAgY29uc3QgaVN0YWNrID0gW2FzdC5mbGFncy5pZ25vcmVDYXNlXTtcbiAgICB0cmF2ZXJzZTIoYXN0LCBGbGFnTW9kaWZpZXJWaXNpdG9yLCB7XG4gICAgICBnZXRDdXJyZW50TW9kSTogKCkgPT4gaVN0YWNrLmF0KC0xKSxcbiAgICAgIHBvcE1vZEkoKSB7XG4gICAgICAgIGlTdGFjay5wb3AoKTtcbiAgICAgIH0sXG4gICAgICBwdXNoTW9kSShpc0lPbikge1xuICAgICAgICBpU3RhY2sucHVzaChpc0lPbik7XG4gICAgICB9LFxuICAgICAgc2V0SGFzQ2FzZWRDaGFyKCkge1xuICAgICAgICBpZiAoaVN0YWNrLmF0KC0xKSkge1xuICAgICAgICAgIGhhc0Nhc2VJbnNlbnNpdGl2ZU5vZGUgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGhhc0Nhc2VTZW5zaXRpdmVOb2RlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIGNvbnN0IGFwcGxpZWRHbG9iYWxGbGFncyA9IHtcbiAgICBkb3RBbGw6IGFzdC5mbGFncy5kb3RBbGwsXG4gICAgLy8gLSBUdXJuIGdsb2JhbCBmbGFnIGkgb24gaWYgYSBjYXNlIGluc2Vuc2l0aXZlIG5vZGUgd2FzIHVzZWQgYW5kIG5vIGNhc2Ugc2Vuc2l0aXZlIG5vZGVzIHdlcmVcbiAgICAvLyAgIHVzZWQgKHRvIGF2b2lkIHVubmVjZXNzYXJ5IG5vZGUgZXhwYW5zaW9uKS5cbiAgICAvLyAtIFR1cm4gZ2xvYmFsIGZsYWcgaSBvZmYgaWYgYSBjYXNlIHNlbnNpdGl2ZSBub2RlIHdhcyB1c2VkIChzaW5jZSBjYXNlIHNlbnNpdGl2aXR5IGNhbid0IGJlXG4gICAgLy8gICBmb3JjZWQgd2l0aG91dCB0aGUgdXNlIG9mIEVTMjAyNSBmbGFnIGdyb3VwcylcbiAgICBpZ25vcmVDYXNlOiAhISgoYXN0LmZsYWdzLmlnbm9yZUNhc2UgfHwgaGFzQ2FzZUluc2Vuc2l0aXZlTm9kZSkgJiYgIWhhc0Nhc2VTZW5zaXRpdmVOb2RlKVxuICB9O1xuICBsZXQgbGFzdE5vZGUgPSBhc3Q7XG4gIGNvbnN0IHN0YXRlID0ge1xuICAgIGFjY3VyYWN5OiBvcHRzLmFjY3VyYWN5LFxuICAgIGFwcGxpZWRHbG9iYWxGbGFncyxcbiAgICBjYXB0dXJlTWFwOiAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLFxuICAgIGN1cnJlbnRGbGFnczoge1xuICAgICAgZG90QWxsOiBhc3QuZmxhZ3MuZG90QWxsLFxuICAgICAgaWdub3JlQ2FzZTogYXN0LmZsYWdzLmlnbm9yZUNhc2VcbiAgICB9LFxuICAgIGluQ2hhckNsYXNzOiBmYWxzZSxcbiAgICBsYXN0Tm9kZSxcbiAgICBvcmlnaW5NYXA6IGFzdC5fb3JpZ2luTWFwLFxuICAgIHJlY3Vyc2lvbkxpbWl0LFxuICAgIHVzZUFwcGxpZWRJZ25vcmVDYXNlOiAhISghbWluVGFyZ2V0RXMyMDI1ICYmIGhhc0Nhc2VJbnNlbnNpdGl2ZU5vZGUgJiYgaGFzQ2FzZVNlbnNpdGl2ZU5vZGUpLFxuICAgIHVzZUZsYWdNb2RzOiBtaW5UYXJnZXRFczIwMjUsXG4gICAgdXNlRmxhZ1Y6IG1pblRhcmdldEVzMjAyNCxcbiAgICB2ZXJib3NlOiBvcHRzLnZlcmJvc2VcbiAgfTtcbiAgZnVuY3Rpb24gZ2VuKG5vZGUpIHtcbiAgICBzdGF0ZS5sYXN0Tm9kZSA9IGxhc3ROb2RlO1xuICAgIGxhc3ROb2RlID0gbm9kZTtcbiAgICBjb25zdCBmbiA9IHRocm93SWZOdWxsaXNoKGdlbmVyYXRvcltub2RlLnR5cGVdLCBgVW5leHBlY3RlZCBub2RlIHR5cGUgXCIke25vZGUudHlwZX1cImApO1xuICAgIHJldHVybiBmbihub2RlLCBzdGF0ZSwgZ2VuKTtcbiAgfVxuICBjb25zdCByZXN1bHQgPSB7XG4gICAgcGF0dGVybjogYXN0LmJvZHkubWFwKGdlbikuam9pbihcInxcIiksXG4gICAgLy8gQ291bGQgcmVzZXQgYGxhc3ROb2RlYCBhdCB0aGlzIHBvaW50IHZpYSBgbGFzdE5vZGUgPSBhc3RgLCBidXQgaXQgaXNuJ3QgbmVlZGVkIGJ5IGZsYWdzXG4gICAgZmxhZ3M6IGdlbihhc3QuZmxhZ3MpLFxuICAgIG9wdGlvbnM6IHsgLi4uYXN0Lm9wdGlvbnMgfVxuICB9O1xuICBpZiAoIW1pblRhcmdldEVzMjAyNCkge1xuICAgIGRlbGV0ZSByZXN1bHQub3B0aW9ucy5mb3JjZS52O1xuICAgIHJlc3VsdC5vcHRpb25zLmRpc2FibGUudiA9IHRydWU7XG4gICAgcmVzdWx0Lm9wdGlvbnMudW5pY29kZVNldHNQbHVnaW4gPSBudWxsO1xuICB9XG4gIHJlc3VsdC5fY2FwdHVyZVRyYW5zZmVycyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gIHJlc3VsdC5faGlkZGVuQ2FwdHVyZXMgPSBbXTtcbiAgc3RhdGUuY2FwdHVyZU1hcC5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgaWYgKHZhbHVlLmhpZGRlbikge1xuICAgICAgcmVzdWx0Ll9oaWRkZW5DYXB0dXJlcy5wdXNoKGtleSk7XG4gICAgfVxuICAgIGlmICh2YWx1ZS50cmFuc2ZlclRvKSB7XG4gICAgICBnZXRPckluc2VydChyZXN1bHQuX2NhcHR1cmVUcmFuc2ZlcnMsIHZhbHVlLnRyYW5zZmVyVG8sIFtdKS5wdXNoKGtleSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cbnZhciBGbGFnTW9kaWZpZXJWaXNpdG9yID0ge1xuICBcIipcIjoge1xuICAgIGVudGVyKHsgbm9kZSB9LCBzdGF0ZSkge1xuICAgICAgaWYgKGlzQW55R3JvdXAobm9kZSkpIHtcbiAgICAgICAgY29uc3QgY3VycmVudE1vZEkgPSBzdGF0ZS5nZXRDdXJyZW50TW9kSSgpO1xuICAgICAgICBzdGF0ZS5wdXNoTW9kSShcbiAgICAgICAgICBub2RlLmZsYWdzID8gZ2V0TmV3Q3VycmVudEZsYWdzKHsgaWdub3JlQ2FzZTogY3VycmVudE1vZEkgfSwgbm9kZS5mbGFncykuaWdub3JlQ2FzZSA6IGN1cnJlbnRNb2RJXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSxcbiAgICBleGl0KHsgbm9kZSB9LCBzdGF0ZSkge1xuICAgICAgaWYgKGlzQW55R3JvdXAobm9kZSkpIHtcbiAgICAgICAgc3RhdGUucG9wTW9kSSgpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgQmFja3JlZmVyZW5jZShfLCBzdGF0ZSkge1xuICAgIHN0YXRlLnNldEhhc0Nhc2VkQ2hhcigpO1xuICB9LFxuICBDaGFyYWN0ZXIoeyBub2RlIH0sIHN0YXRlKSB7XG4gICAgaWYgKGNoYXJIYXNDYXNlKGNwKG5vZGUudmFsdWUpKSkge1xuICAgICAgc3RhdGUuc2V0SGFzQ2FzZWRDaGFyKCk7XG4gICAgfVxuICB9LFxuICBDaGFyYWN0ZXJDbGFzc1JhbmdlKHsgbm9kZSwgc2tpcCB9LCBzdGF0ZSkge1xuICAgIHNraXAoKTtcbiAgICBpZiAoZ2V0Q2FzZXNPdXRzaWRlQ2hhckNsYXNzUmFuZ2Uobm9kZSwgeyBmaXJzdE9ubHk6IHRydWUgfSkubGVuZ3RoKSB7XG4gICAgICBzdGF0ZS5zZXRIYXNDYXNlZENoYXIoKTtcbiAgICB9XG4gIH0sXG4gIENoYXJhY3RlclNldCh7IG5vZGUgfSwgc3RhdGUpIHtcbiAgICBpZiAobm9kZS5raW5kID09PSBcInByb3BlcnR5XCIgJiYgVW5pY29kZVByb3BlcnRpZXNXaXRoU3BlY2lmaWNDYXNlLmhhcyhub2RlLnZhbHVlKSkge1xuICAgICAgc3RhdGUuc2V0SGFzQ2FzZWRDaGFyKCk7XG4gICAgfVxuICB9XG59O1xudmFyIGdlbmVyYXRvciA9IHtcbiAgLyoqXG4gIEBwYXJhbSB7QWx0ZXJuYXRpdmVOb2RlfSBub2RlXG4gICovXG4gIEFsdGVybmF0aXZlKHsgYm9keSB9LCBfLCBnZW4pIHtcbiAgICByZXR1cm4gYm9keS5tYXAoZ2VuKS5qb2luKFwiXCIpO1xuICB9LFxuICAvKipcbiAgQHBhcmFtIHtBc3NlcnRpb25Ob2RlfSBub2RlXG4gICovXG4gIEFzc2VydGlvbih7IGtpbmQsIG5lZ2F0ZSB9KSB7XG4gICAgaWYgKGtpbmQgPT09IFwic3RyaW5nX2VuZFwiKSB7XG4gICAgICByZXR1cm4gXCIkXCI7XG4gICAgfVxuICAgIGlmIChraW5kID09PSBcInN0cmluZ19zdGFydFwiKSB7XG4gICAgICByZXR1cm4gXCJeXCI7XG4gICAgfVxuICAgIGlmIChraW5kID09PSBcIndvcmRfYm91bmRhcnlcIikge1xuICAgICAgcmV0dXJuIG5lZ2F0ZSA/IHJgXFxCYCA6IHJgXFxiYDtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbmV4cGVjdGVkIGFzc2VydGlvbiBraW5kIFwiJHtraW5kfVwiYCk7XG4gIH0sXG4gIC8qKlxuICBAcGFyYW0ge0JhY2tyZWZlcmVuY2VOb2RlfSBub2RlXG4gICovXG4gIEJhY2tyZWZlcmVuY2UoeyByZWYgfSwgc3RhdGUpIHtcbiAgICBpZiAodHlwZW9mIHJlZiAhPT0gXCJudW1iZXJcIikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBuYW1lZCBiYWNrcmVmIGluIHRyYW5zZm9ybWVkIEFTVFwiKTtcbiAgICB9XG4gICAgaWYgKCFzdGF0ZS51c2VGbGFnTW9kcyAmJiBzdGF0ZS5hY2N1cmFjeSA9PT0gXCJzdHJpY3RcIiAmJiBzdGF0ZS5jdXJyZW50RmxhZ3MuaWdub3JlQ2FzZSAmJiAhc3RhdGUuY2FwdHVyZU1hcC5nZXQocmVmKS5pZ25vcmVDYXNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVc2Ugb2YgY2FzZS1pbnNlbnNpdGl2ZSBiYWNrcmVmIHRvIGNhc2Utc2Vuc2l0aXZlIGdyb3VwIHJlcXVpcmVzIHRhcmdldCBFUzIwMjUgb3Igbm9uLXN0cmljdCBhY2N1cmFjeVwiKTtcbiAgICB9XG4gICAgcmV0dXJuIFwiXFxcXFwiICsgcmVmO1xuICB9LFxuICAvKipcbiAgQHBhcmFtIHtDYXB0dXJpbmdHcm91cE5vZGV9IG5vZGVcbiAgKi9cbiAgQ2FwdHVyaW5nR3JvdXAobm9kZSwgc3RhdGUsIGdlbikge1xuICAgIGNvbnN0IHsgYm9keSwgbmFtZSwgbnVtYmVyIH0gPSBub2RlO1xuICAgIGNvbnN0IGRhdGEgPSB7IGlnbm9yZUNhc2U6IHN0YXRlLmN1cnJlbnRGbGFncy5pZ25vcmVDYXNlIH07XG4gICAgY29uc3Qgb3JpZ2luID0gc3RhdGUub3JpZ2luTWFwLmdldChub2RlKTtcbiAgICBpZiAob3JpZ2luKSB7XG4gICAgICBkYXRhLmhpZGRlbiA9IHRydWU7XG4gICAgICBpZiAobnVtYmVyID4gb3JpZ2luLm51bWJlcikge1xuICAgICAgICBkYXRhLnRyYW5zZmVyVG8gPSBvcmlnaW4ubnVtYmVyO1xuICAgICAgfVxuICAgIH1cbiAgICBzdGF0ZS5jYXB0dXJlTWFwLnNldChudW1iZXIsIGRhdGEpO1xuICAgIHJldHVybiBgKCR7bmFtZSA/IGA/PCR7bmFtZX0+YCA6IFwiXCJ9JHtib2R5Lm1hcChnZW4pLmpvaW4oXCJ8XCIpfSlgO1xuICB9LFxuICAvKipcbiAgQHBhcmFtIHtDaGFyYWN0ZXJOb2RlfSBub2RlXG4gICovXG4gIENoYXJhY3Rlcih7IHZhbHVlIH0sIHN0YXRlKSB7XG4gICAgY29uc3QgY2hhciA9IGNwKHZhbHVlKTtcbiAgICBjb25zdCBlc2NhcGVkID0gZ2V0Q2hhckVzY2FwZSh2YWx1ZSwge1xuICAgICAgZXNjRGlnaXQ6IHN0YXRlLmxhc3ROb2RlLnR5cGUgPT09IFwiQmFja3JlZmVyZW5jZVwiLFxuICAgICAgaW5DaGFyQ2xhc3M6IHN0YXRlLmluQ2hhckNsYXNzLFxuICAgICAgdXNlRmxhZ1Y6IHN0YXRlLnVzZUZsYWdWXG4gICAgfSk7XG4gICAgaWYgKGVzY2FwZWQgIT09IGNoYXIpIHtcbiAgICAgIHJldHVybiBlc2NhcGVkO1xuICAgIH1cbiAgICBpZiAoc3RhdGUudXNlQXBwbGllZElnbm9yZUNhc2UgJiYgc3RhdGUuY3VycmVudEZsYWdzLmlnbm9yZUNhc2UgJiYgY2hhckhhc0Nhc2UoY2hhcikpIHtcbiAgICAgIGNvbnN0IGNhc2VzID0gZ2V0SWdub3JlQ2FzZU1hdGNoQ2hhcnMoY2hhcik7XG4gICAgICByZXR1cm4gc3RhdGUuaW5DaGFyQ2xhc3MgPyBjYXNlcy5qb2luKFwiXCIpIDogY2FzZXMubGVuZ3RoID4gMSA/IGBbJHtjYXNlcy5qb2luKFwiXCIpfV1gIDogY2FzZXNbMF07XG4gICAgfVxuICAgIHJldHVybiBjaGFyO1xuICB9LFxuICAvKipcbiAgQHBhcmFtIHtDaGFyYWN0ZXJDbGFzc05vZGV9IG5vZGVcbiAgKi9cbiAgQ2hhcmFjdGVyQ2xhc3Mobm9kZSwgc3RhdGUsIGdlbikge1xuICAgIGNvbnN0IHsga2luZCwgbmVnYXRlLCBwYXJlbnQgfSA9IG5vZGU7XG4gICAgbGV0IHsgYm9keSB9ID0gbm9kZTtcbiAgICBpZiAoa2luZCA9PT0gXCJpbnRlcnNlY3Rpb25cIiAmJiAhc3RhdGUudXNlRmxhZ1YpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlVzZSBvZiBjaGFyYWN0ZXIgY2xhc3MgaW50ZXJzZWN0aW9uIHJlcXVpcmVzIG1pbiB0YXJnZXQgRVMyMDI0XCIpO1xuICAgIH1cbiAgICBpZiAoZW52RmxhZ3MuYnVnRmxhZ1ZMaXRlcmFsSHlwaGVuSXNSYW5nZSAmJiBzdGF0ZS51c2VGbGFnViAmJiBib2R5LnNvbWUoaXNMaXRlcmFsSHlwaGVuKSkge1xuICAgICAgYm9keSA9IFtjcmVhdGVDaGFyYWN0ZXIyKDQ1KSwgLi4uYm9keS5maWx0ZXIoKGtpZCkgPT4gIWlzTGl0ZXJhbEh5cGhlbihraWQpKV07XG4gICAgfVxuICAgIGNvbnN0IGdlbkNsYXNzID0gKCkgPT4gYFske25lZ2F0ZSA/IFwiXlwiIDogXCJcIn0ke2JvZHkubWFwKGdlbikuam9pbihraW5kID09PSBcImludGVyc2VjdGlvblwiID8gXCImJlwiIDogXCJcIil9XWA7XG4gICAgaWYgKCFzdGF0ZS5pbkNoYXJDbGFzcykge1xuICAgICAgaWYgKFxuICAgICAgICAvLyBBbHJlYWR5IGVzdGFibGlzaGVkIGBraW5kICE9PSAnaW50ZXJzZWN0aW9uJ2AgaWYgYCFzdGF0ZS51c2VGbGFnVmA7IGRvbid0IGNoZWNrIGFnYWluXG4gICAgICAgICghc3RhdGUudXNlRmxhZ1YgfHwgZW52RmxhZ3MuYnVnTmVzdGVkQ2xhc3NJZ25vcmVzTmVnYXRpb24pICYmICFuZWdhdGVcbiAgICAgICkge1xuICAgICAgICBjb25zdCBuZWdhdGVkQ2hpbGRDbGFzc2VzID0gYm9keS5maWx0ZXIoXG4gICAgICAgICAgKGtpZCkgPT4ga2lkLnR5cGUgPT09IFwiQ2hhcmFjdGVyQ2xhc3NcIiAmJiBraWQua2luZCA9PT0gXCJ1bmlvblwiICYmIGtpZC5uZWdhdGVcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKG5lZ2F0ZWRDaGlsZENsYXNzZXMubGVuZ3RoKSB7XG4gICAgICAgICAgY29uc3QgZ3JvdXAgPSBjcmVhdGVHcm91cDIoKTtcbiAgICAgICAgICBjb25zdCBncm91cEZpcnN0QWx0ID0gZ3JvdXAuYm9keVswXTtcbiAgICAgICAgICBncm91cC5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgICAgICAgZ3JvdXBGaXJzdEFsdC5wYXJlbnQgPSBncm91cDtcbiAgICAgICAgICBib2R5ID0gYm9keS5maWx0ZXIoKGtpZCkgPT4gIW5lZ2F0ZWRDaGlsZENsYXNzZXMuaW5jbHVkZXMoa2lkKSk7XG4gICAgICAgICAgbm9kZS5ib2R5ID0gYm9keTtcbiAgICAgICAgICBpZiAoYm9keS5sZW5ndGgpIHtcbiAgICAgICAgICAgIG5vZGUucGFyZW50ID0gZ3JvdXBGaXJzdEFsdDtcbiAgICAgICAgICAgIGdyb3VwRmlyc3RBbHQuYm9keS5wdXNoKG5vZGUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBncm91cC5ib2R5LnBvcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBuZWdhdGVkQ2hpbGRDbGFzc2VzLmZvckVhY2goKGNjKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdBbHQgPSBjcmVhdGVBbHRlcm5hdGl2ZTIoeyBib2R5OiBbY2NdIH0pO1xuICAgICAgICAgICAgY2MucGFyZW50ID0gbmV3QWx0O1xuICAgICAgICAgICAgbmV3QWx0LnBhcmVudCA9IGdyb3VwO1xuICAgICAgICAgICAgZ3JvdXAuYm9keS5wdXNoKG5ld0FsdCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIGdlbihncm91cCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHN0YXRlLmluQ2hhckNsYXNzID0gdHJ1ZTtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGdlbkNsYXNzKCk7XG4gICAgICBzdGF0ZS5pbkNoYXJDbGFzcyA9IGZhbHNlO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgY29uc3QgZmlyc3RFbCA9IGJvZHlbMF07XG4gICAgaWYgKFxuICAgICAgLy8gQWxyZWFkeSBlc3RhYmxpc2hlZCB0aGF0IHRoZSBwYXJlbnQgaXMgYSBjaGFyIGNsYXNzIHZpYSBgaW5DaGFyQ2xhc3NgOyBkb24ndCBjaGVjayBhZ2FpblxuICAgICAga2luZCA9PT0gXCJ1bmlvblwiICYmICFuZWdhdGUgJiYgZmlyc3RFbCAmJiAvLyBBbGxvd3MgbWFueSBuZXN0ZWQgY2xhc3NlcyB0byB3b3JrIHdpdGggYHRhcmdldGAgRVMyMDE4IHdoaWNoIGRvZXNuJ3Qgc3VwcG9ydCBuZXN0aW5nXG4gICAgICAoKCFzdGF0ZS51c2VGbGFnViB8fCAhc3RhdGUudmVyYm9zZSkgJiYgcGFyZW50LmtpbmQgPT09IFwidW5pb25cIiAmJiAhKGVudkZsYWdzLmJ1Z0ZsYWdWTGl0ZXJhbEh5cGhlbklzUmFuZ2UgJiYgc3RhdGUudXNlRmxhZ1YpIHx8ICFzdGF0ZS52ZXJib3NlICYmIHBhcmVudC5raW5kID09PSBcImludGVyc2VjdGlvblwiICYmIC8vIEpTIGRvZXNuJ3QgYWxsb3cgaW50ZXJzZWN0aW9uIHdpdGggdW5pb24gb3IgcmFuZ2VzXG4gICAgICBib2R5Lmxlbmd0aCA9PT0gMSAmJiBmaXJzdEVsLnR5cGUgIT09IFwiQ2hhcmFjdGVyQ2xhc3NSYW5nZVwiKVxuICAgICkge1xuICAgICAgcmV0dXJuIGJvZHkubWFwKGdlbikuam9pbihcIlwiKTtcbiAgICB9XG4gICAgaWYgKCFzdGF0ZS51c2VGbGFnViAmJiBwYXJlbnQudHlwZSA9PT0gXCJDaGFyYWN0ZXJDbGFzc1wiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVc2VzIG5lc3RlZCBjaGFyYWN0ZXIgY2xhc3MgaW4gYSB3YXkgdGhhdCByZXF1aXJlcyBtaW4gdGFyZ2V0IEVTMjAyNFwiKTtcbiAgICB9XG4gICAgcmV0dXJuIGdlbkNsYXNzKCk7XG4gIH0sXG4gIC8qKlxuICBAcGFyYW0ge0NoYXJhY3RlckNsYXNzUmFuZ2VOb2RlfSBub2RlXG4gICovXG4gIENoYXJhY3RlckNsYXNzUmFuZ2Uobm9kZSwgc3RhdGUpIHtcbiAgICBjb25zdCBtaW4gPSBub2RlLm1pbi52YWx1ZTtcbiAgICBjb25zdCBtYXggPSBub2RlLm1heC52YWx1ZTtcbiAgICBjb25zdCBlc2NPcHRzID0ge1xuICAgICAgZXNjRGlnaXQ6IGZhbHNlLFxuICAgICAgaW5DaGFyQ2xhc3M6IHRydWUsXG4gICAgICB1c2VGbGFnVjogc3RhdGUudXNlRmxhZ1ZcbiAgICB9O1xuICAgIGNvbnN0IG1pblN0ciA9IGdldENoYXJFc2NhcGUobWluLCBlc2NPcHRzKTtcbiAgICBjb25zdCBtYXhTdHIgPSBnZXRDaGFyRXNjYXBlKG1heCwgZXNjT3B0cyk7XG4gICAgY29uc3QgZXh0cmFDaGFycyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7XG4gICAgaWYgKHN0YXRlLnVzZUFwcGxpZWRJZ25vcmVDYXNlICYmIHN0YXRlLmN1cnJlbnRGbGFncy5pZ25vcmVDYXNlKSB7XG4gICAgICBjb25zdCBjaGFyc091dHNpZGVSYW5nZSA9IGdldENhc2VzT3V0c2lkZUNoYXJDbGFzc1JhbmdlKG5vZGUpO1xuICAgICAgY29uc3QgcmFuZ2VzID0gZ2V0Q29kZVBvaW50UmFuZ2VzRnJvbUNoYXJzKGNoYXJzT3V0c2lkZVJhbmdlKTtcbiAgICAgIHJhbmdlcy5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xuICAgICAgICBleHRyYUNoYXJzLmFkZChcbiAgICAgICAgICBBcnJheS5pc0FycmF5KHZhbHVlKSA/IGAke2dldENoYXJFc2NhcGUodmFsdWVbMF0sIGVzY09wdHMpfS0ke2dldENoYXJFc2NhcGUodmFsdWVbMV0sIGVzY09wdHMpfWAgOiBnZXRDaGFyRXNjYXBlKHZhbHVlLCBlc2NPcHRzKVxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBgJHttaW5TdHJ9LSR7bWF4U3RyfSR7Wy4uLmV4dHJhQ2hhcnNdLmpvaW4oXCJcIil9YDtcbiAgfSxcbiAgLyoqXG4gIEBwYXJhbSB7Q2hhcmFjdGVyU2V0Tm9kZX0gbm9kZVxuICAqL1xuICBDaGFyYWN0ZXJTZXQoeyBraW5kLCBuZWdhdGUsIHZhbHVlLCBrZXkgfSwgc3RhdGUpIHtcbiAgICBpZiAoa2luZCA9PT0gXCJkb3RcIikge1xuICAgICAgcmV0dXJuIHN0YXRlLmN1cnJlbnRGbGFncy5kb3RBbGwgPyBzdGF0ZS5hcHBsaWVkR2xvYmFsRmxhZ3MuZG90QWxsIHx8IHN0YXRlLnVzZUZsYWdNb2RzID8gXCIuXCIgOiBcIlteXVwiIDogKFxuICAgICAgICAvLyBPbmlnJ3Mgb25seSBsaW5lIGJyZWFrIGNoYXIgaXMgbGluZSBmZWVkLCB1bmxpa2UgSlNcbiAgICAgICAgcmBbXlxcbl1gXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoa2luZCA9PT0gXCJkaWdpdFwiKSB7XG4gICAgICByZXR1cm4gbmVnYXRlID8gcmBcXERgIDogcmBcXGRgO1xuICAgIH1cbiAgICBpZiAoa2luZCA9PT0gXCJwcm9wZXJ0eVwiKSB7XG4gICAgICBpZiAoc3RhdGUudXNlQXBwbGllZElnbm9yZUNhc2UgJiYgc3RhdGUuY3VycmVudEZsYWdzLmlnbm9yZUNhc2UgJiYgVW5pY29kZVByb3BlcnRpZXNXaXRoU3BlY2lmaWNDYXNlLmhhcyh2YWx1ZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmljb2RlIHByb3BlcnR5IFwiJHt2YWx1ZX1cIiBjYW4ndCBiZSBjYXNlLWluc2Vuc2l0aXZlIHdoZW4gb3RoZXIgY2hhcnMgaGF2ZSBzcGVjaWZpYyBjYXNlYCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYCR7bmVnYXRlID8gcmBcXFBgIDogcmBcXHBgfXske2tleSA/IGAke2tleX09YCA6IFwiXCJ9JHt2YWx1ZX19YDtcbiAgICB9XG4gICAgaWYgKGtpbmQgPT09IFwid29yZFwiKSB7XG4gICAgICByZXR1cm4gbmVnYXRlID8gcmBcXFdgIDogcmBcXHdgO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZXhwZWN0ZWQgY2hhcmFjdGVyIHNldCBraW5kIFwiJHtraW5kfVwiYCk7XG4gIH0sXG4gIC8qKlxuICBAcGFyYW0ge0ZsYWdzTm9kZX0gbm9kZVxuICAqL1xuICBGbGFncyhub2RlLCBzdGF0ZSkge1xuICAgIHJldHVybiAoXG4gICAgICAvLyBUaGUgdHJhbnNmb3JtZXIgc2hvdWxkIG5ldmVyIHR1cm4gb24gdGhlIHByb3BlcnRpZXMgZm9yIGZsYWdzIGQsIGcsIG0gc2luY2UgT25pZyBkb2Vzbid0XG4gICAgICAvLyBoYXZlIGVxdWl2cy4gRmxhZyBtIGlzIG5ldmVyIHVzZWQgc2luY2UgT25pZyB1c2VzIGRpZmZlcmVudCBsaW5lIGJyZWFrIGNoYXJzIHRoYW4gSlNcbiAgICAgIC8vIChub2RlLmhhc0luZGljZXMgPyAnZCcgOiAnJykgK1xuICAgICAgLy8gKG5vZGUuZ2xvYmFsID8gJ2cnIDogJycpICtcbiAgICAgIC8vIChub2RlLm11bHRpbGluZSA/ICdtJyA6ICcnKSArXG4gICAgICAoc3RhdGUuYXBwbGllZEdsb2JhbEZsYWdzLmlnbm9yZUNhc2UgPyBcImlcIiA6IFwiXCIpICsgKG5vZGUuZG90QWxsID8gXCJzXCIgOiBcIlwiKSArIChub2RlLnN0aWNreSA/IFwieVwiIDogXCJcIilcbiAgICApO1xuICB9LFxuICAvKipcbiAgQHBhcmFtIHtHcm91cE5vZGV9IG5vZGVcbiAgKi9cbiAgR3JvdXAoeyBhdG9taWM6IGF0b21pYzIsIGJvZHksIGZsYWdzLCBwYXJlbnQgfSwgc3RhdGUsIGdlbikge1xuICAgIGNvbnN0IGN1cnJlbnRGbGFncyA9IHN0YXRlLmN1cnJlbnRGbGFncztcbiAgICBpZiAoZmxhZ3MpIHtcbiAgICAgIHN0YXRlLmN1cnJlbnRGbGFncyA9IGdldE5ld0N1cnJlbnRGbGFncyhjdXJyZW50RmxhZ3MsIGZsYWdzKTtcbiAgICB9XG4gICAgY29uc3QgY29udGVudHMgPSBib2R5Lm1hcChnZW4pLmpvaW4oXCJ8XCIpO1xuICAgIGNvbnN0IHJlc3VsdCA9ICFzdGF0ZS52ZXJib3NlICYmIGJvZHkubGVuZ3RoID09PSAxICYmIC8vIFNpbmdsZSBhbHRcbiAgICBwYXJlbnQudHlwZSAhPT0gXCJRdWFudGlmaWVyXCIgJiYgIWF0b21pYzIgJiYgKCFzdGF0ZS51c2VGbGFnTW9kcyB8fCAhZmxhZ3MpID8gY29udGVudHMgOiBgKD8ke2dldEdyb3VwUHJlZml4KGF0b21pYzIsIGZsYWdzLCBzdGF0ZS51c2VGbGFnTW9kcyl9JHtjb250ZW50c30pYDtcbiAgICBzdGF0ZS5jdXJyZW50RmxhZ3MgPSBjdXJyZW50RmxhZ3M7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSxcbiAgLyoqXG4gIEBwYXJhbSB7TG9va2Fyb3VuZEFzc2VydGlvbk5vZGV9IG5vZGVcbiAgKi9cbiAgTG9va2Fyb3VuZEFzc2VydGlvbih7IGJvZHksIGtpbmQsIG5lZ2F0ZSB9LCBfLCBnZW4pIHtcbiAgICBjb25zdCBwcmVmaXggPSBgJHtraW5kID09PSBcImxvb2thaGVhZFwiID8gXCJcIiA6IFwiPFwifSR7bmVnYXRlID8gXCIhXCIgOiBcIj1cIn1gO1xuICAgIHJldHVybiBgKD8ke3ByZWZpeH0ke2JvZHkubWFwKGdlbikuam9pbihcInxcIil9KWA7XG4gIH0sXG4gIC8qKlxuICBAcGFyYW0ge1F1YW50aWZpZXJOb2RlfSBub2RlXG4gICovXG4gIFF1YW50aWZpZXIobm9kZSwgXywgZ2VuKSB7XG4gICAgcmV0dXJuIGdlbihub2RlLmJvZHkpICsgZ2V0UXVhbnRpZmllclN0cihub2RlKTtcbiAgfSxcbiAgLyoqXG4gIEBwYXJhbSB7U3Vicm91dGluZU5vZGUgJiB7aXNSZWN1cnNpdmU6IHRydWV9fSBub2RlXG4gICovXG4gIFN1YnJvdXRpbmUoeyBpc1JlY3Vyc2l2ZSwgcmVmIH0sIHN0YXRlKSB7XG4gICAgaWYgKCFpc1JlY3Vyc2l2ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBub24tcmVjdXJzaXZlIHN1YnJvdXRpbmUgaW4gdHJhbnNmb3JtZWQgQVNUXCIpO1xuICAgIH1cbiAgICBjb25zdCBsaW1pdCA9IHN0YXRlLnJlY3Vyc2lvbkxpbWl0O1xuICAgIHJldHVybiByZWYgPT09IDAgPyBgKD9SPSR7bGltaXR9KWAgOiByYFxcZzwke3JlZn0mUj0ke2xpbWl0fT5gO1xuICB9XG59O1xudmFyIEJhc2VFc2NhcGVDaGFycyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KFtcbiAgXCIkXCIsXG4gIFwiKFwiLFxuICBcIilcIixcbiAgXCIqXCIsXG4gIFwiK1wiLFxuICBcIi5cIixcbiAgXCI/XCIsXG4gIFwiW1wiLFxuICBcIlxcXFxcIixcbiAgXCJdXCIsXG4gIFwiXlwiLFxuICBcIntcIixcbiAgXCJ8XCIsXG4gIFwifVwiXG5dKTtcbnZhciBDaGFyQ2xhc3NFc2NhcGVDaGFycyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KFtcbiAgXCItXCIsXG4gIFwiXFxcXFwiLFxuICBcIl1cIixcbiAgXCJeXCIsXG4gIC8vIExpdGVyYWwgYFtgIGRvZXNuJ3QgcmVxdWlyZSBlc2NhcGluZyB3aXRoIGZsYWcgdSwgYnV0IHRoaXMgY2FuIGhlbHAgd29yayBhcm91bmQgcmVnZXggc291cmNlXG4gIC8vIGxpbnRlcnMgYW5kIHJlZ2V4IHN5bnRheCBwcm9jZXNzb3JzIHRoYXQgZXhwZWN0IHVuZXNjYXBlZCBgW2AgdG8gY3JlYXRlIGEgbmVzdGVkIGNsYXNzXG4gIFwiW1wiXG5dKTtcbnZhciBDaGFyQ2xhc3NFc2NhcGVDaGFyc0ZsYWdWID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoW1xuICBcIihcIixcbiAgXCIpXCIsXG4gIFwiLVwiLFxuICBcIi9cIixcbiAgXCJbXCIsXG4gIFwiXFxcXFwiLFxuICBcIl1cIixcbiAgXCJeXCIsXG4gIFwie1wiLFxuICBcInxcIixcbiAgXCJ9XCIsXG4gIC8vIERvdWJsZSBwdW5jdHVhdG9yczsgYWxzbyBpbmNsdWRlcyBhbHJlYWR5LWxpc3RlZCBgLWAgYW5kIGBeYFxuICBcIiFcIixcbiAgXCIjXCIsXG4gIFwiJFwiLFxuICBcIiVcIixcbiAgXCImXCIsXG4gIFwiKlwiLFxuICBcIitcIixcbiAgXCIsXCIsXG4gIFwiLlwiLFxuICBcIjpcIixcbiAgXCI7XCIsXG4gIFwiPFwiLFxuICBcIj1cIixcbiAgXCI+XCIsXG4gIFwiP1wiLFxuICBcIkBcIixcbiAgXCJgXCIsXG4gIFwiflwiXG5dKTtcbnZhciBDaGFyQ29kZUVzY2FwZU1hcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKFtcbiAgWzksIHJgXFx0YF0sXG4gIC8vIGhvcml6b250YWwgdGFiXG4gIFsxMCwgcmBcXG5gXSxcbiAgLy8gbGluZSBmZWVkXG4gIFsxMSwgcmBcXHZgXSxcbiAgLy8gdmVydGljYWwgdGFiXG4gIFsxMiwgcmBcXGZgXSxcbiAgLy8gZm9ybSBmZWVkXG4gIFsxMywgcmBcXHJgXSxcbiAgLy8gY2FycmlhZ2UgcmV0dXJuXG4gIFs4MjMyLCByYFxcdTIwMjhgXSxcbiAgLy8gbGluZSBzZXBhcmF0b3JcbiAgWzgyMzMsIHJgXFx1MjAyOWBdLFxuICAvLyBwYXJhZ3JhcGggc2VwYXJhdG9yXG4gIFs2NTI3OSwgcmBcXHVGRUZGYF1cbiAgLy8gWldOQlNQL0JPTVxuXSk7XG52YXIgY2FzZWRSZSA9IC9eXFxwe0Nhc2VkfSQvdTtcbmZ1bmN0aW9uIGNoYXJIYXNDYXNlKGNoYXIpIHtcbiAgcmV0dXJuIGNhc2VkUmUudGVzdChjaGFyKTtcbn1cbmZ1bmN0aW9uIGdldENhc2VzT3V0c2lkZUNoYXJDbGFzc1JhbmdlKG5vZGUsIG9wdGlvbnMpIHtcbiAgY29uc3QgZmlyc3RPbmx5ID0gISFvcHRpb25zPy5maXJzdE9ubHk7XG4gIGNvbnN0IG1pbiA9IG5vZGUubWluLnZhbHVlO1xuICBjb25zdCBtYXggPSBub2RlLm1heC52YWx1ZTtcbiAgY29uc3QgZm91bmQgPSBbXTtcbiAgaWYgKG1pbiA8IDY1ICYmIChtYXggPT09IDY1NTM1IHx8IG1heCA+PSAxMzEwNzEpIHx8IG1pbiA9PT0gNjU1MzYgJiYgbWF4ID49IDEzMTA3MSkge1xuICAgIHJldHVybiBmb3VuZDtcbiAgfVxuICBmb3IgKGxldCBpID0gbWluOyBpIDw9IG1heDsgaSsrKSB7XG4gICAgY29uc3QgY2hhciA9IGNwKGkpO1xuICAgIGlmICghY2hhckhhc0Nhc2UoY2hhcikpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBjb25zdCBjaGFyc091dHNpZGVSYW5nZSA9IGdldElnbm9yZUNhc2VNYXRjaENoYXJzKGNoYXIpLmZpbHRlcigoY2FzZU9mQ2hhcikgPT4ge1xuICAgICAgY29uc3QgbnVtID0gY2FzZU9mQ2hhci5jb2RlUG9pbnRBdCgwKTtcbiAgICAgIHJldHVybiBudW0gPCBtaW4gfHwgbnVtID4gbWF4O1xuICAgIH0pO1xuICAgIGlmIChjaGFyc091dHNpZGVSYW5nZS5sZW5ndGgpIHtcbiAgICAgIGZvdW5kLnB1c2goLi4uY2hhcnNPdXRzaWRlUmFuZ2UpO1xuICAgICAgaWYgKGZpcnN0T25seSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZvdW5kO1xufVxuZnVuY3Rpb24gZ2V0Q2hhckVzY2FwZShjb2RlUG9pbnQsIHsgZXNjRGlnaXQsIGluQ2hhckNsYXNzLCB1c2VGbGFnViB9KSB7XG4gIGlmIChDaGFyQ29kZUVzY2FwZU1hcC5oYXMoY29kZVBvaW50KSkge1xuICAgIHJldHVybiBDaGFyQ29kZUVzY2FwZU1hcC5nZXQoY29kZVBvaW50KTtcbiAgfVxuICBpZiAoXG4gICAgLy8gQ29udHJvbCBjaGFycywgZXRjLjsgY29uZGl0aW9uIG1vZGVsZWQgb24gdGhlIENocm9tZSBkZXZlbG9wZXIgY29uc29sZSdzIGRpc3BsYXkgZm9yIHN0cmluZ3NcbiAgICBjb2RlUG9pbnQgPCAzMiB8fCBjb2RlUG9pbnQgPiAxMjYgJiYgY29kZVBvaW50IDwgMTYwIHx8IC8vIFVuaWNvZGUgcGxhbmVzIDQtMTY7IHVuYXNzaWduZWQsIHNwZWNpYWwgcHVycG9zZSwgYW5kIHByaXZhdGUgdXNlIGFyZWFcbiAgICBjb2RlUG9pbnQgPiAyNjIxNDMgfHwgLy8gQXZvaWQgY29ycnVwdGluZyBhIHByZWNlZGluZyBiYWNrcmVmIGJ5IGltbWVkaWF0ZWx5IGZvbGxvd2luZyBpdCB3aXRoIGEgbGl0ZXJhbCBkaWdpdFxuICAgIGVzY0RpZ2l0ICYmIGlzRGlnaXRDaGFyQ29kZShjb2RlUG9pbnQpXG4gICkge1xuICAgIHJldHVybiBjb2RlUG9pbnQgPiAyNTUgPyBgXFxcXHV7JHtjb2RlUG9pbnQudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCl9fWAgOiBgXFxcXHgke2NvZGVQb2ludC50b1N0cmluZygxNikudG9VcHBlckNhc2UoKS5wYWRTdGFydCgyLCBcIjBcIil9YDtcbiAgfVxuICBjb25zdCBlc2NhcGVDaGFycyA9IGluQ2hhckNsYXNzID8gdXNlRmxhZ1YgPyBDaGFyQ2xhc3NFc2NhcGVDaGFyc0ZsYWdWIDogQ2hhckNsYXNzRXNjYXBlQ2hhcnMgOiBCYXNlRXNjYXBlQ2hhcnM7XG4gIGNvbnN0IGNoYXIgPSBjcChjb2RlUG9pbnQpO1xuICByZXR1cm4gKGVzY2FwZUNoYXJzLmhhcyhjaGFyKSA/IFwiXFxcXFwiIDogXCJcIikgKyBjaGFyO1xufVxuZnVuY3Rpb24gZ2V0Q29kZVBvaW50UmFuZ2VzRnJvbUNoYXJzKGNoYXJzKSB7XG4gIGNvbnN0IGNvZGVQb2ludHMgPSBjaGFycy5tYXAoKGNoYXIpID0+IGNoYXIuY29kZVBvaW50QXQoMCkpLnNvcnQoKGEsIGIpID0+IGEgLSBiKTtcbiAgY29uc3QgdmFsdWVzID0gW107XG4gIGxldCBzdGFydCA9IG51bGw7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY29kZVBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChjb2RlUG9pbnRzW2kgKyAxXSA9PT0gY29kZVBvaW50c1tpXSArIDEpIHtcbiAgICAgIHN0YXJ0ID8/PSBjb2RlUG9pbnRzW2ldO1xuICAgIH0gZWxzZSBpZiAoc3RhcnQgPT09IG51bGwpIHtcbiAgICAgIHZhbHVlcy5wdXNoKGNvZGVQb2ludHNbaV0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZXMucHVzaChbc3RhcnQsIGNvZGVQb2ludHNbaV1dKTtcbiAgICAgIHN0YXJ0ID0gbnVsbDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZhbHVlcztcbn1cbmZ1bmN0aW9uIGdldEdyb3VwUHJlZml4KGF0b21pYzIsIGZsYWdNb2RzLCB1c2VGbGFnTW9kcykge1xuICBpZiAoYXRvbWljMikge1xuICAgIHJldHVybiBcIj5cIjtcbiAgfVxuICBsZXQgbW9kcyA9IFwiXCI7XG4gIGlmIChmbGFnTW9kcyAmJiB1c2VGbGFnTW9kcykge1xuICAgIGNvbnN0IHsgZW5hYmxlLCBkaXNhYmxlIH0gPSBmbGFnTW9kcztcbiAgICBtb2RzID0gKGVuYWJsZT8uaWdub3JlQ2FzZSA/IFwiaVwiIDogXCJcIikgKyAoZW5hYmxlPy5kb3RBbGwgPyBcInNcIiA6IFwiXCIpICsgKGRpc2FibGUgPyBcIi1cIiA6IFwiXCIpICsgKGRpc2FibGU/Lmlnbm9yZUNhc2UgPyBcImlcIiA6IFwiXCIpICsgKGRpc2FibGU/LmRvdEFsbCA/IFwic1wiIDogXCJcIik7XG4gIH1cbiAgcmV0dXJuIGAke21vZHN9OmA7XG59XG5mdW5jdGlvbiBnZXRRdWFudGlmaWVyU3RyKHsga2luZCwgbWF4LCBtaW4gfSkge1xuICBsZXQgYmFzZTtcbiAgaWYgKCFtaW4gJiYgbWF4ID09PSAxKSB7XG4gICAgYmFzZSA9IFwiP1wiO1xuICB9IGVsc2UgaWYgKCFtaW4gJiYgbWF4ID09PSBJbmZpbml0eSkge1xuICAgIGJhc2UgPSBcIipcIjtcbiAgfSBlbHNlIGlmIChtaW4gPT09IDEgJiYgbWF4ID09PSBJbmZpbml0eSkge1xuICAgIGJhc2UgPSBcIitcIjtcbiAgfSBlbHNlIGlmIChtaW4gPT09IG1heCkge1xuICAgIGJhc2UgPSBgeyR7bWlufX1gO1xuICB9IGVsc2Uge1xuICAgIGJhc2UgPSBgeyR7bWlufSwke21heCA9PT0gSW5maW5pdHkgPyBcIlwiIDogbWF4fX1gO1xuICB9XG4gIHJldHVybiBiYXNlICsge1xuICAgIGdyZWVkeTogXCJcIixcbiAgICBsYXp5OiBcIj9cIixcbiAgICBwb3NzZXNzaXZlOiBcIitcIlxuICB9W2tpbmRdO1xufVxuZnVuY3Rpb24gaXNBbnlHcm91cCh7IHR5cGUgfSkge1xuICByZXR1cm4gdHlwZSA9PT0gXCJDYXB0dXJpbmdHcm91cFwiIHx8IHR5cGUgPT09IFwiR3JvdXBcIiB8fCB0eXBlID09PSBcIkxvb2thcm91bmRBc3NlcnRpb25cIjtcbn1cbmZ1bmN0aW9uIGlzRGlnaXRDaGFyQ29kZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPiA0NyAmJiB2YWx1ZSA8IDU4O1xufVxuZnVuY3Rpb24gaXNMaXRlcmFsSHlwaGVuKHsgdHlwZSwgdmFsdWUgfSkge1xuICByZXR1cm4gdHlwZSA9PT0gXCJDaGFyYWN0ZXJcIiAmJiB2YWx1ZSA9PT0gNDU7XG59XG5cbi8vIHNyYy9zdWJjbGFzcy5qc1xudmFyIEVtdWxhdGVkUmVnRXhwID0gY2xhc3MgX0VtdWxhdGVkUmVnRXhwIGV4dGVuZHMgUmVnRXhwIHtcbiAgLyoqXG4gIEB0eXBlIHtNYXA8bnVtYmVyLCB7XG4gICAgaGlkZGVuPzogdHJ1ZTtcbiAgICB0cmFuc2ZlclRvPzogbnVtYmVyO1xuICB9Pn1cbiAgKi9cbiAgI2NhcHR1cmVNYXAgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICAvKipcbiAgQHR5cGUge1JlZ0V4cCB8IEVtdWxhdGVkUmVnRXhwIHwgbnVsbH1cbiAgKi9cbiAgI2NvbXBpbGVkID0gbnVsbDtcbiAgLyoqXG4gIEB0eXBlIHtzdHJpbmd9XG4gICovXG4gICNwYXR0ZXJuO1xuICAvKipcbiAgQHR5cGUge01hcDxudW1iZXIsIHN0cmluZz4/fVxuICAqL1xuICAjbmFtZU1hcCA9IG51bGw7XG4gIC8qKlxuICBAdHlwZSB7c3RyaW5nP31cbiAgKi9cbiAgI3N0cmF0ZWd5ID0gbnVsbDtcbiAgLyoqXG4gIENhbiBiZSB1c2VkIHRvIHNlcmlhbGl6ZSB0aGUgaW5zdGFuY2UuXG4gIEB0eXBlIHtFbXVsYXRlZFJlZ0V4cE9wdGlvbnN9XG4gICovXG4gIHJhd09wdGlvbnMgPSB7fTtcbiAgLy8gT3ZlcnJpZGUgdGhlIGdldHRlciB3aXRoIG9uZSB0aGF0IHdvcmtzIHdpdGggbGF6eS1jb21waWxlZCByZWdleGVzXG4gIGdldCBzb3VyY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuI3BhdHRlcm4gfHwgXCIoPzopXCI7XG4gIH1cbiAgLyoqXG4gIEBvdmVybG9hZFxuICBAcGFyYW0ge3N0cmluZ30gcGF0dGVyblxuICBAcGFyYW0ge3N0cmluZ30gW2ZsYWdzXVxuICBAcGFyYW0ge0VtdWxhdGVkUmVnRXhwT3B0aW9uc30gW29wdGlvbnNdXG4gICovXG4gIC8qKlxuICBAb3ZlcmxvYWRcbiAgQHBhcmFtIHtFbXVsYXRlZFJlZ0V4cH0gcGF0dGVyblxuICBAcGFyYW0ge3N0cmluZ30gW2ZsYWdzXVxuICAqL1xuICBjb25zdHJ1Y3RvcihwYXR0ZXJuLCBmbGFncywgb3B0aW9ucykge1xuICAgIGNvbnN0IGxhenlDb21waWxlID0gISFvcHRpb25zPy5sYXp5Q29tcGlsZTtcbiAgICBpZiAocGF0dGVybiBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHByb3ZpZGUgb3B0aW9ucyB3aGVuIGNvcHlpbmcgYSByZWdleHBcIik7XG4gICAgICB9XG4gICAgICBjb25zdCByZSA9IHBhdHRlcm47XG4gICAgICBzdXBlcihyZSwgZmxhZ3MpO1xuICAgICAgdGhpcy4jcGF0dGVybiA9IHJlLnNvdXJjZTtcbiAgICAgIGlmIChyZSBpbnN0YW5jZW9mIF9FbXVsYXRlZFJlZ0V4cCkge1xuICAgICAgICB0aGlzLiNjYXB0dXJlTWFwID0gcmUuI2NhcHR1cmVNYXA7XG4gICAgICAgIHRoaXMuI25hbWVNYXAgPSByZS4jbmFtZU1hcDtcbiAgICAgICAgdGhpcy4jc3RyYXRlZ3kgPSByZS4jc3RyYXRlZ3k7XG4gICAgICAgIHRoaXMucmF3T3B0aW9ucyA9IHJlLnJhd09wdGlvbnM7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IG9wdHMgPSB7XG4gICAgICAgIGhpZGRlbkNhcHR1cmVzOiBbXSxcbiAgICAgICAgc3RyYXRlZ3k6IG51bGwsXG4gICAgICAgIHRyYW5zZmVyczogW10sXG4gICAgICAgIC4uLm9wdGlvbnNcbiAgICAgIH07XG4gICAgICBzdXBlcihsYXp5Q29tcGlsZSA/IFwiXCIgOiBwYXR0ZXJuLCBmbGFncyk7XG4gICAgICB0aGlzLiNwYXR0ZXJuID0gcGF0dGVybjtcbiAgICAgIHRoaXMuI2NhcHR1cmVNYXAgPSBjcmVhdGVDYXB0dXJlTWFwKG9wdHMuaGlkZGVuQ2FwdHVyZXMsIG9wdHMudHJhbnNmZXJzKTtcbiAgICAgIHRoaXMuI3N0cmF0ZWd5ID0gb3B0cy5zdHJhdGVneTtcbiAgICAgIHRoaXMucmF3T3B0aW9ucyA9IG9wdGlvbnMgPz8ge307XG4gICAgfVxuICAgIGlmICghbGF6eUNvbXBpbGUpIHtcbiAgICAgIHRoaXMuI2NvbXBpbGVkID0gdGhpcztcbiAgICB9XG4gIH1cbiAgLyoqXG4gIENhbGxlZCBpbnRlcm5hbGx5IGJ5IGFsbCBTdHJpbmcvUmVnRXhwIG1ldGhvZHMgdGhhdCB1c2UgcmVnZXhlcy5cbiAgQG92ZXJyaWRlXG4gIEBwYXJhbSB7c3RyaW5nfSBzdHJcbiAgQHJldHVybnMge1JlZ0V4cEV4ZWNBcnJheT99XG4gICovXG4gIGV4ZWMoc3RyKSB7XG4gICAgaWYgKCF0aGlzLiNjb21waWxlZCkge1xuICAgICAgY29uc3QgeyBsYXp5Q29tcGlsZSwgLi4ucmVzdCB9ID0gdGhpcy5yYXdPcHRpb25zO1xuICAgICAgdGhpcy4jY29tcGlsZWQgPSBuZXcgX0VtdWxhdGVkUmVnRXhwKHRoaXMuI3BhdHRlcm4sIHRoaXMuZmxhZ3MsIHJlc3QpO1xuICAgIH1cbiAgICBjb25zdCB1c2VMYXN0SW5kZXggPSB0aGlzLmdsb2JhbCB8fCB0aGlzLnN0aWNreTtcbiAgICBjb25zdCBwb3MgPSB0aGlzLmxhc3RJbmRleDtcbiAgICBpZiAodGhpcy4jc3RyYXRlZ3kgPT09IFwiY2xpcF9zZWFyY2hcIiAmJiB1c2VMYXN0SW5kZXggJiYgcG9zKSB7XG4gICAgICB0aGlzLmxhc3RJbmRleCA9IDA7XG4gICAgICBjb25zdCBtYXRjaCA9IHRoaXMuI2V4ZWNDb3JlKHN0ci5zbGljZShwb3MpKTtcbiAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICBhZGp1c3RNYXRjaERldGFpbHNGb3JPZmZzZXQobWF0Y2gsIHBvcywgc3RyLCB0aGlzLmhhc0luZGljZXMpO1xuICAgICAgICB0aGlzLmxhc3RJbmRleCArPSBwb3M7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWF0Y2g7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLiNleGVjQ29yZShzdHIpO1xuICB9XG4gIC8qKlxuICBBZGRzIHN1cHBvcnQgZm9yIGhpZGRlbiBhbmQgdHJhbnNmZXIgY2FwdHVyZXMuXG4gIEBwYXJhbSB7c3RyaW5nfSBzdHJcbiAgQHJldHVybnNcbiAgKi9cbiAgI2V4ZWNDb3JlKHN0cikge1xuICAgIHRoaXMuI2NvbXBpbGVkLmxhc3RJbmRleCA9IHRoaXMubGFzdEluZGV4O1xuICAgIGNvbnN0IG1hdGNoID0gc3VwZXIuZXhlYy5jYWxsKHRoaXMuI2NvbXBpbGVkLCBzdHIpO1xuICAgIHRoaXMubGFzdEluZGV4ID0gdGhpcy4jY29tcGlsZWQubGFzdEluZGV4O1xuICAgIGlmICghbWF0Y2ggfHwgIXRoaXMuI2NhcHR1cmVNYXAuc2l6ZSkge1xuICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH1cbiAgICBjb25zdCBtYXRjaENvcHkgPSBbLi4ubWF0Y2hdO1xuICAgIG1hdGNoLmxlbmd0aCA9IDE7XG4gICAgbGV0IGluZGljZXNDb3B5O1xuICAgIGlmICh0aGlzLmhhc0luZGljZXMpIHtcbiAgICAgIGluZGljZXNDb3B5ID0gWy4uLm1hdGNoLmluZGljZXNdO1xuICAgICAgbWF0Y2guaW5kaWNlcy5sZW5ndGggPSAxO1xuICAgIH1cbiAgICBjb25zdCBtYXBwZWROdW1zID0gWzBdO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgbWF0Y2hDb3B5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCB7IGhpZGRlbiwgdHJhbnNmZXJUbyB9ID0gdGhpcy4jY2FwdHVyZU1hcC5nZXQoaSkgPz8ge307XG4gICAgICBpZiAoaGlkZGVuKSB7XG4gICAgICAgIG1hcHBlZE51bXMucHVzaChudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1hcHBlZE51bXMucHVzaChtYXRjaC5sZW5ndGgpO1xuICAgICAgICBtYXRjaC5wdXNoKG1hdGNoQ29weVtpXSk7XG4gICAgICAgIGlmICh0aGlzLmhhc0luZGljZXMpIHtcbiAgICAgICAgICBtYXRjaC5pbmRpY2VzLnB1c2goaW5kaWNlc0NvcHlbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodHJhbnNmZXJUbyAmJiBtYXRjaENvcHlbaV0gIT09IHZvaWQgMCkge1xuICAgICAgICBjb25zdCB0byA9IG1hcHBlZE51bXNbdHJhbnNmZXJUb107XG4gICAgICAgIGlmICghdG8pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgY2FwdHVyZSB0cmFuc2ZlciB0byBcIiR7dG99XCJgKTtcbiAgICAgICAgfVxuICAgICAgICBtYXRjaFt0b10gPSBtYXRjaENvcHlbaV07XG4gICAgICAgIGlmICh0aGlzLmhhc0luZGljZXMpIHtcbiAgICAgICAgICBtYXRjaC5pbmRpY2VzW3RvXSA9IGluZGljZXNDb3B5W2ldO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtYXRjaC5ncm91cHMpIHtcbiAgICAgICAgICBpZiAoIXRoaXMuI25hbWVNYXApIHtcbiAgICAgICAgICAgIHRoaXMuI25hbWVNYXAgPSBjcmVhdGVOYW1lTWFwKHRoaXMuc291cmNlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgbmFtZSA9IHRoaXMuI25hbWVNYXAuZ2V0KHRyYW5zZmVyVG8pO1xuICAgICAgICAgIGlmIChuYW1lKSB7XG4gICAgICAgICAgICBtYXRjaC5ncm91cHNbbmFtZV0gPSBtYXRjaENvcHlbaV07XG4gICAgICAgICAgICBpZiAodGhpcy5oYXNJbmRpY2VzKSB7XG4gICAgICAgICAgICAgIG1hdGNoLmluZGljZXMuZ3JvdXBzW25hbWVdID0gaW5kaWNlc0NvcHlbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtYXRjaDtcbiAgfVxufTtcbmZ1bmN0aW9uIGFkanVzdE1hdGNoRGV0YWlsc0Zvck9mZnNldChtYXRjaCwgb2Zmc2V0LCBpbnB1dCwgaGFzSW5kaWNlcykge1xuICBtYXRjaC5pbmRleCArPSBvZmZzZXQ7XG4gIG1hdGNoLmlucHV0ID0gaW5wdXQ7XG4gIGlmIChoYXNJbmRpY2VzKSB7XG4gICAgY29uc3QgaW5kaWNlcyA9IG1hdGNoLmluZGljZXM7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbmRpY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBhcnIgPSBpbmRpY2VzW2ldO1xuICAgICAgaWYgKGFycikge1xuICAgICAgICBpbmRpY2VzW2ldID0gW2FyclswXSArIG9mZnNldCwgYXJyWzFdICsgb2Zmc2V0XTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgZ3JvdXBJbmRpY2VzID0gaW5kaWNlcy5ncm91cHM7XG4gICAgaWYgKGdyb3VwSW5kaWNlcykge1xuICAgICAgT2JqZWN0LmtleXMoZ3JvdXBJbmRpY2VzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgY29uc3QgYXJyID0gZ3JvdXBJbmRpY2VzW2tleV07XG4gICAgICAgIGlmIChhcnIpIHtcbiAgICAgICAgICBncm91cEluZGljZXNba2V5XSA9IFthcnJbMF0gKyBvZmZzZXQsIGFyclsxXSArIG9mZnNldF07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuZnVuY3Rpb24gY3JlYXRlQ2FwdHVyZU1hcChoaWRkZW5DYXB0dXJlcywgdHJhbnNmZXJzKSB7XG4gIGNvbnN0IGNhcHR1cmVNYXAgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICBmb3IgKGNvbnN0IG51bSBvZiBoaWRkZW5DYXB0dXJlcykge1xuICAgIGNhcHR1cmVNYXAuc2V0KG51bSwge1xuICAgICAgaGlkZGVuOiB0cnVlXG4gICAgfSk7XG4gIH1cbiAgZm9yIChjb25zdCBbdG8sIGZyb21dIG9mIHRyYW5zZmVycykge1xuICAgIGZvciAoY29uc3QgbnVtIG9mIGZyb20pIHtcbiAgICAgIGdldE9ySW5zZXJ0KGNhcHR1cmVNYXAsIG51bSwge30pLnRyYW5zZmVyVG8gPSB0bztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNhcHR1cmVNYXA7XG59XG5mdW5jdGlvbiBjcmVhdGVOYW1lTWFwKHBhdHRlcm4pIHtcbiAgY29uc3QgcmUgPSAvKD88Y2FwdHVyZT5cXCgoPzpcXD88KD8hWz0hXSkoPzxuYW1lPltePl0rKT58KD8hXFw/KSkpfFxcXFw/Li9nc3U7XG4gIGNvbnN0IG1hcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gIGxldCBudW1DaGFyQ2xhc3Nlc09wZW4gPSAwO1xuICBsZXQgbnVtQ2FwdHVyZXMgPSAwO1xuICBsZXQgbWF0Y2g7XG4gIHdoaWxlIChtYXRjaCA9IHJlLmV4ZWMocGF0dGVybikpIHtcbiAgICBjb25zdCB7IDA6IG0sIGdyb3VwczogeyBjYXB0dXJlLCBuYW1lIH0gfSA9IG1hdGNoO1xuICAgIGlmIChtID09PSBcIltcIikge1xuICAgICAgbnVtQ2hhckNsYXNzZXNPcGVuKys7XG4gICAgfSBlbHNlIGlmICghbnVtQ2hhckNsYXNzZXNPcGVuKSB7XG4gICAgICBpZiAoY2FwdHVyZSkge1xuICAgICAgICBudW1DYXB0dXJlcysrO1xuICAgICAgICBpZiAobmFtZSkge1xuICAgICAgICAgIG1hcC5zZXQobnVtQ2FwdHVyZXMsIG5hbWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChtID09PSBcIl1cIikge1xuICAgICAgbnVtQ2hhckNsYXNzZXNPcGVuLS07XG4gICAgfVxuICB9XG4gIHJldHVybiBtYXA7XG59XG5cbi8vIHNyYy9pbmRleC5qc1xuaW1wb3J0IHsgcGFyc2UgYXMgcGFyc2UyIH0gZnJvbSBcIm9uaWd1cnVtYS1wYXJzZXIvcGFyc2VyXCI7XG5pbXBvcnQgeyBhdG9taWMsIHBvc3Nlc3NpdmUgfSBmcm9tIFwicmVnZXgvaW50ZXJuYWxzXCI7XG5pbXBvcnQgeyByZWN1cnNpb24gfSBmcm9tIFwicmVnZXgtcmVjdXJzaW9uXCI7XG5mdW5jdGlvbiB0b1JlZ0V4cChwYXR0ZXJuLCBvcHRpb25zKSB7XG4gIGNvbnN0IGQgPSB0b1JlZ0V4cERldGFpbHMocGF0dGVybiwgb3B0aW9ucyk7XG4gIGlmIChkLm9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IEVtdWxhdGVkUmVnRXhwKGQucGF0dGVybiwgZC5mbGFncywgZC5vcHRpb25zKTtcbiAgfVxuICByZXR1cm4gbmV3IFJlZ0V4cChkLnBhdHRlcm4sIGQuZmxhZ3MpO1xufVxuZnVuY3Rpb24gdG9SZWdFeHBEZXRhaWxzKHBhdHRlcm4sIG9wdGlvbnMpIHtcbiAgY29uc3Qgb3B0cyA9IGdldE9wdGlvbnMob3B0aW9ucyk7XG4gIGNvbnN0IG9uaWd1cnVtYUFzdCA9IHBhcnNlMihwYXR0ZXJuLCB7XG4gICAgZmxhZ3M6IG9wdHMuZmxhZ3MsXG4gICAgbm9ybWFsaXplVW5rbm93blByb3BlcnR5TmFtZXM6IHRydWUsXG4gICAgcnVsZXM6IHtcbiAgICAgIGNhcHR1cmVHcm91cDogb3B0cy5ydWxlcy5jYXB0dXJlR3JvdXAsXG4gICAgICBzaW5nbGVsaW5lOiBvcHRzLnJ1bGVzLnNpbmdsZWxpbmVcbiAgICB9LFxuICAgIHNraXBCYWNrcmVmVmFsaWRhdGlvbjogb3B0cy5ydWxlcy5hbGxvd09ycGhhbkJhY2tyZWZzLFxuICAgIHVuaWNvZGVQcm9wZXJ0eU1hcDogSnNVbmljb2RlUHJvcGVydHlNYXBcbiAgfSk7XG4gIGNvbnN0IHJlZ2V4UGx1c0FzdCA9IHRyYW5zZm9ybShvbmlndXJ1bWFBc3QsIHtcbiAgICBhY2N1cmFjeTogb3B0cy5hY2N1cmFjeSxcbiAgICBhc2NpaVdvcmRCb3VuZGFyaWVzOiBvcHRzLnJ1bGVzLmFzY2lpV29yZEJvdW5kYXJpZXMsXG4gICAgYXZvaWRTdWJjbGFzczogb3B0cy5hdm9pZFN1YmNsYXNzLFxuICAgIGJlc3RFZmZvcnRUYXJnZXQ6IG9wdHMudGFyZ2V0XG4gIH0pO1xuICBjb25zdCBnZW5lcmF0ZWQgPSBnZW5lcmF0ZShyZWdleFBsdXNBc3QsIG9wdHMpO1xuICBjb25zdCByZWN1cnNpb25SZXN1bHQgPSByZWN1cnNpb24oZ2VuZXJhdGVkLnBhdHRlcm4sIHtcbiAgICBjYXB0dXJlVHJhbnNmZXJzOiBnZW5lcmF0ZWQuX2NhcHR1cmVUcmFuc2ZlcnMsXG4gICAgaGlkZGVuQ2FwdHVyZXM6IGdlbmVyYXRlZC5faGlkZGVuQ2FwdHVyZXMsXG4gICAgbW9kZTogXCJleHRlcm5hbFwiXG4gIH0pO1xuICBjb25zdCBwb3NzZXNzaXZlUmVzdWx0ID0gcG9zc2Vzc2l2ZShyZWN1cnNpb25SZXN1bHQucGF0dGVybik7XG4gIGNvbnN0IGF0b21pY1Jlc3VsdCA9IGF0b21pYyhwb3NzZXNzaXZlUmVzdWx0LnBhdHRlcm4sIHtcbiAgICBjYXB0dXJlVHJhbnNmZXJzOiByZWN1cnNpb25SZXN1bHQuY2FwdHVyZVRyYW5zZmVycyxcbiAgICBoaWRkZW5DYXB0dXJlczogcmVjdXJzaW9uUmVzdWx0LmhpZGRlbkNhcHR1cmVzXG4gIH0pO1xuICBjb25zdCBkZXRhaWxzID0ge1xuICAgIHBhdHRlcm46IGF0b21pY1Jlc3VsdC5wYXR0ZXJuLFxuICAgIGZsYWdzOiBgJHtvcHRzLmhhc0luZGljZXMgPyBcImRcIiA6IFwiXCJ9JHtvcHRzLmdsb2JhbCA/IFwiZ1wiIDogXCJcIn0ke2dlbmVyYXRlZC5mbGFnc30ke2dlbmVyYXRlZC5vcHRpb25zLmRpc2FibGUudiA/IFwidVwiIDogXCJ2XCJ9YFxuICB9O1xuICBpZiAob3B0cy5hdm9pZFN1YmNsYXNzKSB7XG4gICAgaWYgKG9wdHMubGF6eUNvbXBpbGVMZW5ndGggIT09IEluZmluaXR5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMYXp5IGNvbXBpbGF0aW9uIHJlcXVpcmVzIHN1YmNsYXNzXCIpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjb25zdCBoaWRkZW5DYXB0dXJlcyA9IGF0b21pY1Jlc3VsdC5oaWRkZW5DYXB0dXJlcy5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG4gICAgY29uc3QgdHJhbnNmZXJzID0gQXJyYXkuZnJvbShhdG9taWNSZXN1bHQuY2FwdHVyZVRyYW5zZmVycyk7XG4gICAgY29uc3Qgc3RyYXRlZ3kgPSByZWdleFBsdXNBc3QuX3N0cmF0ZWd5O1xuICAgIGNvbnN0IGxhenlDb21waWxlID0gZGV0YWlscy5wYXR0ZXJuLmxlbmd0aCA+PSBvcHRzLmxhenlDb21waWxlTGVuZ3RoO1xuICAgIGlmIChoaWRkZW5DYXB0dXJlcy5sZW5ndGggfHwgdHJhbnNmZXJzLmxlbmd0aCB8fCBzdHJhdGVneSB8fCBsYXp5Q29tcGlsZSkge1xuICAgICAgZGV0YWlscy5vcHRpb25zID0ge1xuICAgICAgICAuLi5oaWRkZW5DYXB0dXJlcy5sZW5ndGggJiYgeyBoaWRkZW5DYXB0dXJlcyB9LFxuICAgICAgICAuLi50cmFuc2ZlcnMubGVuZ3RoICYmIHsgdHJhbnNmZXJzIH0sXG4gICAgICAgIC4uLnN0cmF0ZWd5ICYmIHsgc3RyYXRlZ3kgfSxcbiAgICAgICAgLi4ubGF6eUNvbXBpbGUgJiYgeyBsYXp5Q29tcGlsZSB9XG4gICAgICB9O1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGV0YWlscztcbn1cbmV4cG9ydCB7XG4gIEVtdWxhdGVkUmVnRXhwLFxuICB0b1JlZ0V4cCxcbiAgdG9SZWdFeHBEZXRhaWxzXG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwXG4iLAogICAgImltcG9ydCB7IHQgYXMgSmF2YVNjcmlwdFNjYW5uZXIgfSBmcm9tIFwiLi9zY2FubmVyLURXOXRxVklELm1qc1wiO1xuaW1wb3J0IHsgdG9SZWdFeHAgfSBmcm9tIFwib25pZ3VydW1hLXRvLWVzXCI7XG4vLyNyZWdpb24gc3JjL2VuZ2luZS1jb21waWxlLnRzXG4vKipcbiogVGhlIGRlZmF1bHQgcmVnZXggY29uc3RydWN0b3IgZm9yIHRoZSBKYXZhU2NyaXB0IFJlZ0V4cCBlbmdpbmUuXG4qL1xuZnVuY3Rpb24gZGVmYXVsdEphdmFTY3JpcHRSZWdleENvbnN0cnVjdG9yKHBhdHRlcm4sIG9wdGlvbnMpIHtcblx0cmV0dXJuIHRvUmVnRXhwKHBhdHRlcm4sIHtcblx0XHRnbG9iYWw6IHRydWUsXG5cdFx0aGFzSW5kaWNlczogdHJ1ZSxcblx0XHRsYXp5Q29tcGlsZUxlbmd0aDogM2UzLFxuXHRcdHJ1bGVzOiB7XG5cdFx0XHRhbGxvd09ycGhhbkJhY2tyZWZzOiB0cnVlLFxuXHRcdFx0YXNjaWlXb3JkQm91bmRhcmllczogdHJ1ZSxcblx0XHRcdGNhcHR1cmVHcm91cDogdHJ1ZSxcblx0XHRcdHJlY3Vyc2lvbkxpbWl0OiA1LFxuXHRcdFx0c2luZ2xlbGluZTogdHJ1ZVxuXHRcdH0sXG5cdFx0Li4ub3B0aW9uc1xuXHR9KTtcbn1cbi8qKlxuKiBVc2UgdGhlIG1vZGVybiBKYXZhU2NyaXB0IFJlZ0V4cCBlbmdpbmUgdG8gaW1wbGVtZW50IHRoZSBPbmlnU2Nhbm5lci5cbipcbiogQXMgT25pZ3VydW1hIHN1cHBvcnRzIHNvbWUgZmVhdHVyZXMgdGhhdCBjYW4ndCBiZSBlbXVsYXRlZCB1c2luZyBuYXRpdmUgSmF2YVNjcmlwdCByZWdleGVzLCBzb21lXG4qIHBhdHRlcm5zIGFyZSBub3Qgc3VwcG9ydGVkLiBFcnJvcnMgd2lsbCBiZSB0aHJvd24gd2hlbiBwYXJzaW5nIFRleHRNYXRlIGdyYW1tYXJzIHdpdGhcbiogdW5zdXBwb3J0ZWQgcGF0dGVybnMsIGFuZCB3aGVuIHRoZSBncmFtbWFyIGluY2x1ZGVzIHBhdHRlcm5zIHRoYXQgdXNlIGludmFsaWQgT25pZ3VydW1hIHN5bnRheC5cbiogU2V0IGBmb3JnaXZpbmdgIHRvIGB0cnVlYCB0byBpZ25vcmUgdGhlc2UgZXJyb3JzIGFuZCBza2lwIGFueSB1bnN1cHBvcnRlZCBvciBpbnZhbGlkIHBhdHRlcm5zLlxuKi9cbmZ1bmN0aW9uIGNyZWF0ZUphdmFTY3JpcHRSZWdleEVuZ2luZShvcHRpb25zID0ge30pIHtcblx0Y29uc3QgX29wdGlvbnMgPSB7XG5cdFx0dGFyZ2V0OiBcImF1dG9cIixcblx0XHRjYWNoZTogLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSxcblx0XHQuLi5vcHRpb25zXG5cdH07XG5cdF9vcHRpb25zLnJlZ2V4Q29uc3RydWN0b3IgfHw9IChwYXR0ZXJuKSA9PiBkZWZhdWx0SmF2YVNjcmlwdFJlZ2V4Q29uc3RydWN0b3IocGF0dGVybiwgeyB0YXJnZXQ6IF9vcHRpb25zLnRhcmdldCB9KTtcblx0cmV0dXJuIHtcblx0XHRjcmVhdGVTY2FubmVyKHBhdHRlcm5zKSB7XG5cdFx0XHRyZXR1cm4gbmV3IEphdmFTY3JpcHRTY2FubmVyKHBhdHRlcm5zLCBfb3B0aW9ucyk7XG5cdFx0fSxcblx0XHRjcmVhdGVTdHJpbmcocykge1xuXHRcdFx0cmV0dXJuIHsgY29udGVudDogcyB9O1xuXHRcdH1cblx0fTtcbn1cbi8vI2VuZHJlZ2lvblxuZXhwb3J0IHsgY3JlYXRlSmF2YVNjcmlwdFJlZ2V4RW5naW5lLCBkZWZhdWx0SmF2YVNjcmlwdFJlZ2V4Q29uc3RydWN0b3IgfTtcbiIsCiAgICAiaW1wb3J0IHsgdCBhcyBKYXZhU2NyaXB0U2Nhbm5lciB9IGZyb20gXCIuL3NjYW5uZXItRFc5dHFWSUQubWpzXCI7XG4vLyNyZWdpb24gc3JjL2VuZ2luZS1yYXcudHNcbi8qKlxuKiBSYXcgSmF2YVNjcmlwdCByZWdleCBlbmdpbmUgdGhhdCBvbmx5IHN1cHBvcnRzIHByZWNvbXBpbGVkIGdyYW1tYXJzLlxuKlxuKiBUaGlzIGZ1cnRoZXIgc2ltcGxpZmllcyB0aGUgZW5naW5lIGJ5IGV4Y2x1ZGluZyB0aGUgcmVnZXggY29tcGlsYXRpb24gc3RlcC5cbipcbiogWmVybyBkZXBlbmRlbmNpZXMuXG4qL1xuZnVuY3Rpb24gY3JlYXRlSmF2YVNjcmlwdFJhd0VuZ2luZSgpIHtcblx0Y29uc3Qgb3B0aW9ucyA9IHtcblx0XHRjYWNoZTogLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSxcblx0XHRyZWdleENvbnN0cnVjdG9yOiAoKSA9PiB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJKYXZhU2NyaXB0UmF3RW5naW5lOiBvbmx5IHN1cHBvcnQgcHJlY29tcGlsZWQgZ3JhbW1hclwiKTtcblx0XHR9XG5cdH07XG5cdHJldHVybiB7XG5cdFx0Y3JlYXRlU2Nhbm5lcihwYXR0ZXJucykge1xuXHRcdFx0cmV0dXJuIG5ldyBKYXZhU2NyaXB0U2Nhbm5lcihwYXR0ZXJucywgb3B0aW9ucyk7XG5cdFx0fSxcblx0XHRjcmVhdGVTdHJpbmcocykge1xuXHRcdFx0cmV0dXJuIHsgY29udGVudDogcyB9O1xuXHRcdH1cblx0fTtcbn1cbi8vI2VuZHJlZ2lvblxuZXhwb3J0IHsgY3JlYXRlSmF2YVNjcmlwdFJhd0VuZ2luZSB9O1xuIgogIF0sCiAgIm1hcHBpbmdzIjogIjs7O0FBQ0EsSUFBTSxNQUFNO0FBQ1osSUFBSSxvQkFBb0IsTUFBTTtBQUFBLEVBQzdCO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBLFdBQVcsQ0FBQyxVQUFVLFVBQVUsQ0FBQyxHQUFHO0FBQUEsSUFDbkMsS0FBSyxXQUFXO0FBQUEsSUFDaEIsS0FBSyxVQUFVO0FBQUEsSUFDZixRQUFRLFlBQVksT0FBTyxPQUFPLHFCQUFxQjtBQUFBLElBQ3ZELElBQUksQ0FBQztBQUFBLE1BQWtCLE1BQU0sSUFBSSxNQUFNLDJDQUEyQztBQUFBLElBQ2xGLEtBQUssVUFBVSxTQUFTLElBQUksQ0FBQyxNQUFNO0FBQUEsTUFDbEMsSUFBSSxPQUFPLE1BQU07QUFBQSxRQUFVLE9BQU87QUFBQSxNQUNsQyxNQUFNLFNBQVMsT0FBTyxJQUFJLENBQUM7QUFBQSxNQUMzQixJQUFJLFFBQVE7QUFBQSxRQUNYLElBQUksa0JB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LENBQUMsSUFBRTtBQUFBLElBQUMsRUFBRSxFQUFFLFNBQU8sS0FBRztBQUFBLEtBQUcsWUFBVyxFQUFFLE1BQU0sV0FBVTtBQUFBLEVBQUUsSUFBSSxLQUFFLENBQUMsR0FBRTtBQUFBLEVBQUUsS0FBSSxFQUFFLFlBQVUsRUFBRSxLQUFFLEVBQUUsS0FBSyxDQUFDLEtBQUc7QUFBQSxJQUFDLE1BQU0sS0FBRSxFQUFFLEdBQUUsR0FBRSxHQUFFLElBQUcsRUFBRSxTQUFTO0FBQUEsSUFBRSxHQUFFLFNBQU8sR0FBRSxLQUFLLEdBQUcsR0FBRSxNQUFNLElBQUUsR0FBRSxTQUFPLEdBQUUsS0FBSyxHQUFFLEtBQUssR0FBRSxHQUFFLGNBQWlCLGNBQUksRUFBRSxZQUFVLEdBQUU7QUFBQSxFQUFVO0FBQUEsRUFBQyxNQUFNLEtBQUUsQ0FBQztBQUFBLEVBQUUsSUFBSSxJQUFFO0FBQUEsRUFBRSxHQUFFLE9BQU8sUUFBRyxHQUFFLFNBQU8sV0FBVyxFQUFFLFFBQVEsUUFBRztBQUFBLElBQUMsR0FBRSxTQUFPLGNBQVksR0FBRSxTQUFPLEVBQUUsSUFBRSxHQUFFLFFBQU0sT0FBSyxHQUFFLEtBQUssRUFBQztBQUFBLEdBQUUsR0FBRSxLQUFHLEdBQUUsUUFBUSxDQUFDLElBQUUsTUFBSTtBQUFBLElBQUMsR0FBRSxPQUFLLGFBQVksR0FBRSxTQUFPLElBQUU7QUFBQSxHQUFFO0FBQUEsRUFBRSxNQUFNLElBQUUsS0FBRyxHQUFFO0FBQUEsRUFBTyxPQUFNLEVBQUMsUUFBTyxHQUFFLElBQUksUUFBRyxHQUFFLFNBQU8sa0JBQWdCLEdBQUcsSUFBRSxDQUFDLElBQUUsRUFBQyxFQUFFLEtBQUssR0FBRSxPQUFNLEdBQUM7QUFBQTtBQUFFLFNBQVMsQ0FBQyxDQUFDLEdBQUUsR0FBRSxHQUFFLElBQUU7QUFBQSxFQUFDLE9BQU0sR0FBRSxLQUFHO0FBQUEsRUFBRSxJQUFHLE1BQUksT0FBSyxNQUFJLE1BQUs7QUFBQSxJQUFDLE1BQU0sS0FBRSxFQUFFLEdBQUUsR0FBRSxFQUFDO0FBQUEsSUFBRSxPQUFNLEVBQUMsUUFBTyxHQUFFLFFBQU8sV0FBVSxHQUFFLFVBQVM7QUFBQSxFQUFDO0FBQUEsRUFBQyxJQUFHLE1BQUksTUFBSztBQUFBLElBQUMsSUFBRyxXQUFXLFNBQVMsQ0FBQztBQUFBLE1BQUUsT0FBTSxFQUFDLE9BQU0sRUFBRSxHQUFFLENBQUMsRUFBQztBQUFBLElBQUUsSUFBRyxXQUFXLEtBQUssQ0FBQyxHQUFFO0FBQUEsTUFBQyxJQUFHLENBQUMsMkJBQTJCLEtBQUssQ0FBQztBQUFBLFFBQUUsTUFBTSxJQUFJLE1BQU0sdUJBQXVCLElBQUk7QUFBQSxNQUFFLE9BQU0sRUFBQyxPQUFNLEVBQUUsQ0FBQyxFQUFDO0FBQUEsSUFBQztBQUFBLElBQUMsSUFBRyxXQUFXLEtBQUssQ0FBQyxHQUFFO0FBQUEsTUFBQyxJQUFHLENBQUMsMkJBQTJCLEtBQUssQ0FBQztBQUFBLFFBQUUsTUFBTSxJQUFJLE1BQU0sdUJBQXVCLElBQUk7QUFBQSxNQUFFLE9BQU0sRUFBQyxPQUFNLEVBQUUsQ0FBQyxFQUFDO0FBQUEsSUFBQztBQUFBLElBQUMsSUFBRyxNQUFJO0FBQUEsTUFBSSxPQUFNLEVBQUMsT0FBTSxFQUFFLFFBQU8sQ0FBQyxFQUFDO0FBQUEsSUFBRSxJQUFHLE1BQUksT0FBSyxNQUFJO0FBQUEsTUFBSSxPQUFNLEVBQUMsT0FBTSxFQUFFLFdBQVUsR0FBRSxFQUFDLFFBQU8sTUFBSSxJQUFHLENBQUMsRUFBQztBQUFBLElBQUUsSUFBRyxNQUFJO0FBQUEsTUFBSSxPQUFNLEVBQUMsT0FBTSxFQUFFLE9BQU0sQ0FBQyxFQUFDO0FBQUEsSUFBRSxJQUFHLE1BQUk7QUFBQSxNQUFJLE9BQU0sRUFBQyxPQUFNLEVBQUUsZ0JBQWUsQ0FBQyxFQUFDO0FBQUEsSUFBRSxNQUFNLEtBQUUsRUFBRSxHQUFFLEVBQUMsYUFBWSxNQUFFLENBQUM7QUFBQSxJQUFFLE9BQU8sTUFBTSxRQUFRLEVBQUMsSUFBRSxFQUFDLFFBQU8sR0FBQyxJQUFFLEVBQUMsT0FBTSxHQUFDO0FBQUEsRUFBQztBQUFBLEVB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LE9BQU0sRUFBRSxJQUFFLENBQUMsRUFBQztBQUFBLEVBQUM7QUFBQSxFQUFDLE9BQU8sTUFBSSxNQUFJLEVBQUMsT0FBTSxFQUFFLENBQUMsRUFBQyxJQUFFLEVBQUUsS0FBSyxDQUFDLElBQUUsRUFBQyxRQUFPLEdBQUcsQ0FBQyxFQUFDLElBQUUsRUFBQyxPQUFNLEVBQUUsRUFBRSxDQUFDLEdBQUUsQ0FBQyxFQUFDO0FBQUE7QUFBRSxTQUFTLENBQUMsQ0FBQyxHQUFFLEdBQUUsR0FBRTtBQUFBLEVBQUMsTUFBTSxLQUFFLENBQUMsRUFBRSxFQUFFLE9BQUssS0FBSSxDQUFDLENBQUM7QUFBQSxFQUFFLElBQUksSUFBRSxHQUFFO0FBQUEsRUFBRSxLQUFJLEVBQUUsWUFBVSxFQUFFLElBQUUsRUFBRSxLQUFLLENBQUMsS0FBRztBQUFBLElBQUMsTUFBTSxLQUFFLEVBQUU7QUFBQSxJQUFHLElBQUcsR0FBRSxPQUFLLE9BQUssR0FBRSxPQUFLO0FBQUEsTUFBSSxLQUFJLEdBQUUsS0FBSyxFQUFFLEdBQUUsT0FBSyxLQUFJLEVBQUMsQ0FBQztBQUFBLElBQU8sU0FBRyxPQUFJLEtBQUk7QUFBQSxNQUFDLElBQUcsR0FBRSxHQUFHLEVBQUUsRUFBRSxTQUFPO0FBQUEsUUFBcUIsR0FBRSxLQUFLLEVBQUUsSUFBRyxFQUFDLENBQUM7QUFBQSxNQUFPLFNBQUcsS0FBSSxHQUFFLEtBQUssRUFBRSxFQUFDLENBQUMsR0FBRSxDQUFDO0FBQUEsUUFBRTtBQUFBLElBQUssRUFBSztBQUFBLE1BQUMsTUFBTSxLQUFFLEVBQUUsRUFBQztBQUFBLE1BQUUsTUFBTSxRQUFRLEVBQUMsSUFBRSxHQUFFLEtBQUssR0FBRyxFQUFDLElBQUUsR0FBRSxLQUFLLEVBQUM7QUFBQTtBQUFBLEVBQUU7QUFBQSxFQUFDLE9BQU0sRUFBQyxRQUFPLElBQUUsV0FBVSxFQUFFLGFBQVcsRUFBRSxPQUFNO0FBQUE7QUFBRSxTQUFTLENBQUMsQ0FBQyxHQUFFO0FBQUEsRUFBQyxJQUFHLEVBQUUsT0FBSztBQUFBLElBQUssT0FBTyxFQUFFLEdBQUUsRUFBQyxhQUFZLEtBQUUsQ0FBQztBQUFBLEVBQUUsSUFBRyxFQUFFLE9BQUssS0FBSTtBQUFBLElBQUMsTUFBTSxJQUFFLHNDQUFzQyxLQUFLLENBQUM7QUFBQSxJQUFFLElBQUcsQ0FBQyxLQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxJQUFJO0FBQUEsTUFBRSxNQUFNLElBQUksTUFBTSx3QkFBd0IsSUFBSTtBQUFBLElBQUUsT0FBTyxFQUFFLFNBQVEsR0FBRSxFQUFDLE9BQU0sRUFBRSxPQUFPLE1BQUssUUFBTyxDQUFDLENBQUMsRUFBRSxPQUFPLE9BQU0sQ0FBQztBQUFBLEVBQUM7QUFBQSxFQUFDLE9BQU8sTUFBSSxNQUFJLEVBQUUsQ0FBQyxJQUFFLE1BQUksT0FBSyxFQUFFLENBQUMsSUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFFLENBQUM7QUFBQTtBQUFFLFNBQVMsQ0FBQyxDQUFDLEtBQUcsYUFBWSxLQUFHO0FBQUEsRUFBQyxNQUFNLElBQUUsRUFBRTtBQUFBLEVBQUcsSUFBRyxNQUFJLE9BQUssTUFBSTtBQUFBLElBQUksT0FBTyxFQUFFLENBQUM7QUFBQSxFQUFFLElBQUcsV0FBVyxTQUFTLENBQUM7QUFBQSxJQUFFLE9BQU8sRUFBRSxDQUFDO0FBQUEsRUFBRSxJQUFHLEVBQUUsV0FBVyxNQUFNO0FBQUEsSUFBRSxNQUFNLElBQUksTUFBTSx5REFBeUQsSUFBSTtBQUFBLEVBQUUsSUFBRyxZQUFZLEtBQUssQ0FBQyxHQUFFO0FBQUEsSUFBQyxJQUFHLEVBQUUsV0FBUztBQUFBLE1BQUUsTUFBTSxJQUFJLE1BQU0sMkNBQTJDLElBQUk7QUFBQSxJQUFFLE9BQU8sRUFBRSxDQUFDO0FBQUEsRUFBQztBQUFBLEVBQUMsSUFBRywwQkFBMEIsS0FBSyxDQUFDO0FBQUEsSUFBRSxJQUFHO0FBQUEsTUFBQyxNQUFNLEtBQUUsRUFBRSxNQUFNLEtBQUssRUFBRSxNQUFNLENBQUMsRUFBRSxJQUFJLFFBQUcsU0FBUyxJQUFFLEVBQUUsQ0FBQyxHQUFFLElBQUUsSUFBSSxZQUFZLFNBQVEsRUFBQyxXQUFVLE1BQUcsT0FBTSxLQUFFLENBQUMsRUFBRSxPQUFPLElBQUksV0FBVyxFQUFDLENBQUMsR0FBRSxJQUFFLElBQUk7QUFBQSxNQUFZLE9BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLFFBQUc7QUFBQSxRQUFDLE1BQU0sS0FBRSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUMsQ0FBQyxFQUFFLElBQUksT0FBRyxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUU7QUFBQSxRQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUMsR0FBRSxFQUFDO0FBQUEsT0FBRTtBQUFBLE1BQUUsTUFBSztBQUFBLE1BQUMsTUFBTSxJQUFJLE1BQU0sbUJBQW1CLHVDQUF1QztBQUFBO0FBQUEsRUFBRSxJQUFHLE1BQUksT0FBSyxNQUFJO0FBQUEsSUFBSSxPQUFPLEVBQUUsRUFBRSxDQUFDLEdBQUUsQ0FBQztBQUFBLEVBQUUsSUFBRyxFQUFFLElBQUksQ0FBQztBQUFBLElBQUUsT0FBTyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUUsQ0FBQztBQUFBLEVBQUUsSUFBRyxLQUFLLEtBQUssQ0FBQztBQUFBLElBQUUsT0FBTyxFQUFFLEdBQUUsQ0FBQztBQUFBLEVBQUUsSUFBRyxNQUFJO0FBQUEsSUFBSyxNQUFNLElBQUksTUFBTSx3QkFBd0I7QUFBQSxFQUFFLElBQUcsTUFBSTtBQUFBLElBQUksTUFBTSxJQUFJLE1BQU0scUJBQXFCLElBQUk7QUFBQSxFQUFFLElBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxXQUFTO0FBQUEsSUFBRSxPQUFPLEVBQUUsRUFBRSxZQUFZLENBQUMsR0FBRSxDQUFDO0FBQUEsRUFBRSxNQUFNLElBQUksTUFBTSxzQkFBc0IsSUFBSTtBQUFBO0FBQUUsU0FBUyxDQUFDLENBQUMsR0FBRTtBQUFBLEVBQUMsT0FBTSxFQUFDLE1BQUssY0FBYSxLQUFJLEVBQUM7QUFBQTtBQUFFLFNBQVMsQ0FBQyxDQUFDLEdBQUUsR0FBRTtBQUFBLEVBQUMsT0FB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LEdBQUU7QUFBQSxNQUFDLElBQUcsTUFBSTtBQUFBLFFBQWEsTUFBTSxJQUFJLE1BQU0sMkRBQTJEO0FBQUEsTUFBRSxJQUFFO0FBQUEsSUFBTSxFQUFNO0FBQUEsWUFBSSxJQUFFO0FBQUEsRUFBUyxFQUFNO0FBQUEsUUFBRSxFQUFFLE9BQUssTUFBSSxJQUFFLEdBQUUsS0FBRSxFQUFFLE9BQUssTUFBSSxJQUFFLElBQUUsR0FBRSxJQUFFLEVBQUUsT0FBSyxNQUFJLGVBQWEsRUFBRSxPQUFLLE1BQUksU0FBTztBQUFBLEVBQVMsT0FBTyxFQUFFLEdBQUUsR0FBRSxJQUFFLENBQUM7QUFBQTtBQUFFLFNBQVMsQ0FBQyxDQUFDLEdBQUU7QUFBQSxFQUFDLE1BQU0sSUFBRSxFQUFFLEdBQUcsWUFBWTtBQUFBLEVBQUUsT0FBTyxFQUFFLEVBQUMsR0FBRSxTQUFRLEdBQUUsT0FBTSxHQUFFLFNBQVEsR0FBRSxPQUFNLEVBQUUsSUFBRyxHQUFFLEVBQUMsUUFBTyxFQUFFLE9BQUssRUFBQyxDQUFDO0FBQUE7QUFBRSxTQUFTLENBQUMsQ0FBQyxHQUFFO0FBQUEsRUFBQyxRQUFNLEdBQUUsR0FBRSxLQUFJLEdBQUUsT0FBTSxPQUFHLDRDQUE0QyxLQUFLLENBQUMsRUFBRTtBQUFBLEVBQU8sT0FBTyxFQUFFLFlBQVcsR0FBRSxFQUFDLE9BQU0sSUFBRSxRQUFPLE1BQUksT0FBSyxDQUFDLEtBQUcsTUFBSSxPQUFLLENBQUMsQ0FBQyxFQUFDLENBQUM7QUFBQTtBQUFFLFNBQVMsQ0FBQyxDQUFDLEdBQUU7QUFBQSxFQUFDLE1BQU0sSUFBRSxDQUFDO0FBQUEsRUFBRSxPQUFPLEVBQUUsU0FBUyxHQUFHLE1BQUksRUFBRSxhQUFXLE9BQUksRUFBRSxTQUFTLEdBQUcsTUFBSSxFQUFFLFNBQU8sT0FBSSxFQUFFLFNBQVMsR0FBRyxNQUFJLEVBQUUsV0FBUyxPQUFJLE9BQU8sS0FBSyxDQUFDLEVBQUUsU0FBTyxJQUFFO0FBQUE7QUFBSyxTQUFTLENBQUMsQ0FBQyxHQUFFO0FBQUEsRUFBQyxNQUFNLElBQUUsRUFBQyxZQUFXLE9BQUcsUUFBTyxPQUFHLFVBQVMsT0FBRyxjQUFhLE9BQUcsY0FBYSxPQUFHLGNBQWEsT0FBRyxhQUFZLE9BQUcsaUJBQWdCLEtBQUk7QUFBQSxFQUFFLFNBQVEsSUFBRSxFQUFFLElBQUUsRUFBRSxRQUFPLEtBQUk7QUFBQSxJQUFDLE1BQU0sS0FBRSxFQUFFO0FBQUEsSUFBRyxJQUFHLENBQUMsV0FBVyxTQUFTLEVBQUM7QUFBQSxNQUFFLE1BQU0sSUFBSSxNQUFNLGlCQUFpQixLQUFJO0FBQUEsSUFBRSxJQUFHLE9BQUksS0FBSTtBQUFBLE1BQUMsSUFBRyxDQUFDLFdBQVcsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQUEsUUFBRSxNQUFNLElBQUksTUFBTSxzQ0FBc0M7QUFBQSxNQUFFLEVBQUUsa0JBQWdCLEVBQUUsSUFBRSxPQUFLLE1BQUksYUFBVyxRQUFPLEtBQUc7QUFBQSxNQUFFO0FBQUEsSUFBUTtBQUFBLElBQUMsRUFBRSxFQUFDLEdBQUUsY0FBYSxHQUFFLFVBQVMsR0FBRSxZQUFXLEdBQUUsZ0JBQWUsR0FBRSxnQkFBZSxHQUFFLGdCQUFlLEdBQUUsY0FBYSxFQUFFLE9BQUk7QUFBQSxFQUFFO0FBQUEsRUFBQyxPQUFPO0FBQUE7QUFBRSxTQUFTLENBQUMsQ0FBQyxHQUFFO0FBQUEsRUFBQyxJQUFHLGtFQUFrRSxLQUFLLENBQUM7QUFBQSxJQUFFLE1BQU0sSUFBSSxNQUFNLGlDQUFpQyxJQUFJO0FBQUEsRUFBRSxNQUFNLElBQUUsRUFBRSxPQUFLLE1BQUksOEJBQThCLEtBQUssQ0FBQyxFQUFFLE9BQU8sTUFBSSxFQUFFLE1BQU0sQ0FBQztBQUFBLEVBQUUsT0FBTyxTQUFTLEdBQUUsRUFBRTtBQUFBO0FBQUUsU0FBUyxFQUFFLENBQUMsR0FBRSxHQUFFO0FBQUEsRUFBQyxRQUFNLEtBQUksR0FBRSxhQUFZLE9BQUcsR0FBRSxJQUFFLEVBQUUsTUFBTSxDQUFDO0FBQUEsRUFBRSxJQUFHLENBQUMsT0FBSSxNQUFJLE9BQUssRUFBRSxXQUFTLEtBQUcsRUFBRSxPQUFLLE9BQUssQ0FBQyxLQUFHO0FBQUEsSUFBRyxPQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7QUFBQSxFQUFFLE1BQU0sSUFBRSxDQUFDLEdBQUUsS0FBRSxFQUFFLE1BQU0sYUFBYTtBQUFBLEVBQUUsU0FBUSxLQUFFLEVBQUUsS0FBRSxHQUFFLFFBQU8sTUFBSTtBQUFBLElBQUMsTUFBTSxLQUFFLEdBQUU7QUFBQSxJQUFHLElBQUk7QUFBQSxJQUFFLElBQUcsT0FBSSxLQUFHLE9BQUksT0FBSyxPQUFJLEtBQUk7QUFBQSxNQUFDLElBQUcsSUFBRSxTQUFTLElBQUUsQ0FBQyxHQUFFLElBQUU7QUFBQSxRQUFJLE1BQU0sSUFBSSxNQUFNLDhDQUE4QyxJQUFJO0FBQUEsSUFBQyxFQUFNO0FBQUEsVUFBRSxFQUFFLEVBQUM7QUFBQSxJQUFFLEVBQUUsS0FBSyxFQUFFLElBQUcsT0FBSSxJQUFFLE9BQUssTUFBSSxFQUFDLENBQUM7QUFBQSxFQUFDO0FBQUEsRUFBQyxPQUFPO0FBQUE7QUFBRSxTQUFTLEVBQUUsQ0FBQyxHQUFFO0FBQUEsRUFBQyxNQUFNLElBQUUsQ0FBQyxHQUFFLElBQUUsSUFBSSxPQUFPLEdBQUUsSUFBSTtBQUFBLEVBQUUsSUFBSTtBQUFBLEVBQUUsTUFBSyxLQUFFLEVBQUUsS0FBSyxDQUFDLEtBQUc7QUFBQSxJQUFDLE1BQU0sSUFBRSxHQUFFO0FBQUEsSUFBRyxJQUFHLEVBQUUsT0FBSyxLQUFJO0FBQUEsTUFBQyxNQUFNLElBQUUsbUNBQW1DLEtBQUssQ0FBQztBQUFBLE1BQUUsSUFBRyxHQUFFO0FBQUEsUUFBQyxRQUFNLEtBQUksSUFBRSxLQUFJLE9BQUcsRUFBRTtBQUFBLFFBQU8sSUFBRyxDQUFDLEtBQUUsQ0FBQyxNQUFHLEVBQUUsU0FBUyxHQUFHLEdBQUU7QUFBQSxVQUFDLEVBQUUsYUFBWSxFQUFFLEtBQUssRUFBRSxFQUFFLE1BQU0sR0FBRSxFQUFFLENBQUMsQ0FBQztBQUFBLFVBQUU7QUFBQSxRQUFRO0FBQUEsTUFBQztBQUFBLElBQUM7QUFBQSxJQUFD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QUFDLFNBQVMsRUFBQyxDQUFDLEdBQUUsSUFBRTtBQUFBLElBQUMsU0FBUSxJQUFFLEVBQUUsSUFBRSxFQUFFLFFBQU8sS0FBSTtBQUFBLE1BQUMsTUFBTSxLQUFFLEVBQUUsRUFBRSxJQUFHLElBQUUsR0FBRSxDQUFDO0FBQUEsTUFBRSxJQUFFLEtBQUssSUFBSSxJQUFHLElBQUUsRUFBQztBQUFBLElBQUM7QUFBQTtBQUFBLEVBQUUsU0FBUyxDQUFDLENBQUMsR0FBRSxLQUFFLE1BQUssSUFBRSxNQUFLLEtBQUUsTUFBSztBQUFBLElBQUMsSUFBSSxLQUFFLEdBQUUsSUFBRTtBQUFBLElBQUcsTUFBTSxLQUFFLEVBQUMsTUFBSyxHQUFFLFFBQU8sSUFBRSxLQUFJLEdBQUUsV0FBVSxJQUFFLE1BQUssSUFBRSxNQUFNLEdBQUU7QUFBQSxNQUFDLEdBQUUsRUFBQyxFQUFFLE9BQU8sS0FBSyxJQUFJLEdBQUUsR0FBRSxDQUFDLElBQUUsRUFBQyxHQUFFLENBQUMsR0FBRSxNQUFJLElBQUU7QUFBQSxPQUFJLHFCQUFxQixHQUFFO0FBQUEsTUFBQyxPQUFPLEdBQUUsRUFBQyxFQUFFLE9BQU8sR0FBRSxDQUFDLElBQUUsQ0FBQztBQUFBLE9BQUcscUJBQXFCLEdBQUU7QUFBQSxNQUFDLE1BQU0sS0FBRSxHQUFFLENBQUMsSUFBRTtBQUFBLE1BQUUsT0FBTyxNQUFHLElBQUUsR0FBRSxFQUFDLEVBQUUsT0FBTyxHQUFFLEtBQUssSUFBSSxHQUFFLEVBQUMsQ0FBQztBQUFBLE9BQUcsV0FBVyxDQUFDLElBQUUsS0FBRSxDQUFDLEdBQUU7QUFBQSxNQUFDLE1BQU0sS0FBRSxDQUFDLENBQUMsR0FBRTtBQUFBLE1BQVMsS0FBRSxHQUFFLEtBQUssSUFBSSxHQUFFLEdBQUUsQ0FBQyxJQUFFLEVBQUMsS0FBRyxLQUFFLEVBQUUsSUFBRSx5QkFBeUIsRUFBRSxLQUFHLElBQUUsTUFBRyxFQUFFLElBQUUsSUFBRSxHQUFFLEVBQUMsR0FBRSxJQUFFO0FBQUEsT0FBSSxtQkFBbUIsQ0FBQyxJQUFFLEtBQUUsQ0FB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QUN4RSxRQUFRLFVBQVU7QUFBQSxXQUNiLGVBQWUsVUFBVSxFQUFFLGVBQWU7QUFBQSxXQUMxQyxVQUFVLFVBQVUsRUFBRSxVQUFVO0FBQUEsV0FDaEMsWUFBWSxFQUFFLFNBQVM7QUFBQSxXQUN2QixlQUFlLEVBQUUsWUFBWTtBQUFBLE1BQ2xDO0FBQUEsSUFDRjtBQUFBO0FBQUEsRUFFRixPQUFPO0FBQUE7OztBQ3gwRFQsU0FBUyxpQ0FBaUMsQ0FBQyxTQUFTLFNBQVM7QUFBQSxFQUM1RCxPQUFPLFNBQVMsU0FBUztBQUFBLElBQ3hCLFFBQVE7QUFBQSxJQUNSLFlBQVk7QUFBQSxJQUNaLG1CQUFtQjtBQUFBLElBQ25CLE9BQU87QUFBQSxNQUNOLHFCQUFxQjtBQUFBLE1BQ3JCLHFCQUFxQjtBQUFBLE1BQ3JCLGNBQWM7QUFBQSxNQUNkLGdCQUFnQjtBQUFBLE1BQ2hCLFlBQVk7QUFBQSxJQUNiO0FBQUEsT0FDRztBQUFBLEVBQ0osQ0FBQztBQUFBO0FBVUYsU0FBUywyQkFBMkIsQ0FBQyxVQUFVLENBQUMsR0FBRztBQUFBLEVBQ2xELE1BQU0sV0FBVztBQUFBLElBQ2hCLFFBQVE7QUFBQSxJQUNSLHVCQUF1QixJQUFJO0FBQUEsT0FDeEI7QUFBQSxFQUNKO0FBQUEsRUFDQSxTQUFTLHFCQUFxQixDQUFDLFlBQVksa0NBQWtDLFNBQVMsRUFBRSxRQUFRLFNBQVMsT0FBTyxDQUFDO0FBQUEsRUFDakgsT0FBTztBQUFBLElBQ04sYUFBYSxDQUFDLFVBQVU7QUFBQSxNQUN2QixPQUFPLElBQUksa0JBQWtCLFVBQVUsUUFBUTtBQUFBO0FBQUEsSUFFaEQsWUFBWSxDQUFDLElBQUc7QUFBQSxNQUNmLE9BQU8sRUFBRSxTQUFTLEdBQUU7QUFBQTtBQUFBLEVBRXRCO0FBQUE7OztBQ2xDRCxTQUFTLHlCQUF5QixHQUFHO0FBQUEsRUFDcEMsTUFBTSxVQUFVO0FBQUEsSUFDZix1QkFBdUIsSUFBSTtBQUFBLElBQzNCLGtCQUFrQixNQUFNO0FBQUEsTUFDdkIsTUFBTSxJQUFJLE1BQU0sdURBQXVEO0FBQUE7QUFBQSxFQUV6RTtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ04sYUFBYSxDQUFDLFVBQVU7QUFBQSxNQUN2QixPQUFPLElBQUksa0JBQWtCLFVBQVUsT0FBTztBQUFBO0FBQUEsSUFFL0MsWUFBWSxDQUFDLElBQUc7QUFBQSxNQUNmLE9BQU8sRUFBRSxTQUFTLEdBQUU7QUFBQTtBQUFBLEVBRXRCO0FBQUE7IiwKICAiZGVidWdJZCI6ICJFQTNBNDE2MUJCRDI1MjQzNjQ3NTZFMjE2NDc1NkUyMSIsCiAgIm5hbWVzIjogW10KfQ==
