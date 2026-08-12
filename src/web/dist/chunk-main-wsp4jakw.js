import {
  decodeEntities
} from "./chunk-main-vvfzntzy.js";
import {
  common_default,
  getConfig,
  hasKatex,
  renderKatexSanitized,
  sanitizeText
} from "./chunk-main-aws590jt.js";
import {
  __name,
  log,
  select_default
} from "./chunk-main-vcnyggwp.js";
// node_modules/@iconify/utils/lib/icon/name.js
var stringToIcon = (value, validate, allowSimpleName, provider = "") => {
  const colonSeparated = value.split(":");
  if (value.slice(0, 1) === "@") {
    if (colonSeparated.length < 2 || colonSeparated.length > 3)
      return null;
    provider = colonSeparated.shift().slice(1);
  }
  if (colonSeparated.length > 3 || !colonSeparated.length)
    return null;
  if (colonSeparated.length > 1) {
    const name2 = colonSeparated.pop();
    const prefix = colonSeparated.pop();
    const result = {
      provider: colonSeparated.length > 0 ? colonSeparated[0] : provider,
      prefix,
      name: name2
    };
    return validate && !validateIconName(result) ? null : result;
  }
  const name = colonSeparated[0];
  const dashSeparated = name.split("-");
  if (dashSeparated.length > 1) {
    const result = {
      provider,
      prefix: dashSeparated.shift(),
      name: dashSeparated.join("-")
    };
    return validate && !validateIconName(result) ? null : result;
  }
  if (allowSimpleName && provider === "") {
    const result = {
      provider,
      prefix: "",
      name
    };
    return validate && !validateIconName(result, allowSimpleName) ? null : result;
  }
  return null;
};
var validateIconName = (icon, allowSimpleName) => {
  if (!icon)
    return false;
  return !!((allowSimpleName && icon.prefix === "" || !!icon.prefix) && !!icon.name);
};
// node_modules/@iconify/utils/lib/icon/defaults.js
var defaultIconDimensions = Object.freeze({
  left: 0,
  top: 0,
  width: 16,
  height: 16
});
var defaultIconTransformations = Object.freeze({
  rotate: 0,
  vFlip: false,
  hFlip: false
});
var defaultIconProps = Object.freeze({
  ...defaultIconDimensions,
  ...defaultIconTransformations
});
var defaultExtendedIconProps = Object.freeze({
  ...defaultIconProps,
  body: "",
  hidden: false
});

// node_modules/@iconify/utils/lib/icon/transformations.js
function mergeIconTransformations(obj1, obj2) {
  const result = {};
  if (!obj1.hFlip !== !obj2.hFlip)
    result.hFlip = true;
  if (!obj1.vFlip !== !obj2.vFlip)
    result.vFlip = true;
  const rotate = ((obj1.rotate || 0) + (obj2.rotate || 0)) % 4;
  if (rotate)
    result.rotate = rotate;
  return result;
}

// node_modules/@iconify/utils/lib/icon/merge.js
function mergeIconData(parent, child) {
  const result = mergeIconTransformations(parent, child);
  for (const key in defaultExtendedIconProps)
    if (key in defaultIconTransformations) {
      if (key in parent && !(key in result))
        result[key] = defaultIconTransformations[key];
    } else if (key in child)
      result[key] = child[key];
    else if (key in parent)
      result[key] = parent[key];
  return result;
}

// node_modules/@iconify/utils/lib/icon-set/tree.js
function getIconsTree(data, names) {
  const icons = data.icons;
  const aliases = data.aliases || Object.create(null);
  const resolved = Object.create(null);
  function resolve(name) {
    if (icons[name])
      return resolved[name] = [];
    if (!(name in resolved)) {
      resolved[name] = null;
      const parent = aliases[name] && aliases[name].parent;
      const value = parent && resolve(parent);
      if (value)
        resolved[name] = [parent].concat(value);
    }
    return resolved[name];
  }
  (names || Object.keys(icons).concat(Object.keys(aliases))).forEach(resolve);
  return resolved;
}

// node_modules/@iconify/utils/lib/icon-set/get-icon.js
function internalGetIconData(data, name, tree) {
  const icons = data.icons;
  const aliases = data.aliases || Object.create(null);
  let currentProps = {};
  function parse(name2) {
    currentProps = mergeIconData(icons[name2] || aliases[name2], currentProps);
  }
  parse(name);
  tree.forEach(parse);
  return mergeIconData(data, currentProps);
}
function getIconData(data, name) {
  if (data.icons[name])
    return internalGetIconData(data, name, []);
  const tree = getIconsTree(data, [name])[name];
  return tree ? internalGetIconData(data, name, tree) : null;
}
// node_modules/@iconify/utils/lib/customisations/defaults.js
var defaultIconSizeCustomisations = Object.freeze({
  width: null,
  height: null
});
var defaultIconCustomisations = Object.freeze({
  ...defaultIconSizeCustomisations,
  ...defaultIconTransformations
});

// node_modules/@iconify/utils/lib/svg/size.js
var unitsSplit = /(-?[0-9.]*[0-9]+[0-9.]*)/g;
var unitsTest = /^-?[0-9.]*[0-9]+[0-9.]*$/g;
function calculateSize(size, ratio, precision) {
  if (ratio === 1)
    return size;
  precision = precision || 100;
  if (typeof size === "number")
    return Math.ceil(size * ratio * precision) / precision;
  if (typeof size !== "string")
    return size;
  const oldParts = size.split(unitsSplit);
  if (oldParts === null || !oldParts.length)
    return size;
  const newParts = [];
  let code = oldParts.shift();
  let isNumber = unitsTest.test(code);
  while (true) {
    if (isNumber) {
      const num = parseFloat(code);
      if (isNaN(num))
        newParts.push(code);
      else
        newParts.push(Math.ceil(num * ratio * precision) / precision);
    } else
      newParts.push(code);
    code = oldParts.shift();
    if (code === undefined)
      return newParts.join("");
    isNumber = !isNumber;
  }
}

// node_modules/@iconify/utils/lib/svg/defs.js
function splitSVGDefs(content, tag = "defs") {
  let defs = "";
  const index = content.indexOf("<" + tag);
  while (index >= 0) {
    const start = content.indexOf(">", index);
    const end = content.indexOf("</" + tag);
    if (start === -1 || end === -1)
      break;
    const endEnd = content.indexOf(">", end);
    if (endEnd === -1)
      break;
    defs += content.slice(start + 1, end).trim();
    content = content.slice(0, index).trim() + content.slice(endEnd + 1);
  }
  return {
    defs,
    content
  };
}
function mergeDefsAndContent(defs, content) {
  return defs ? "<defs>" + defs + "</defs>" + content : content;
}
function wrapSVGContent(body, start, end) {
  const split = splitSVGDefs(body);
  return mergeDefsAndContent(split.defs, start + split.content + end);
}

// node_modules/@iconify/utils/lib/svg/build.js
var isUnsetKeyword = (value) => value === "unset" || value === "undefined" || value === "none";
function iconToSVG(icon, customisations) {
  const fullIcon = {
    ...defaultIconProps,
    ...icon
  };
  const fullCustomisations = {
    ...defaultIconCustomisations,
    ...customisations
  };
  const box = {
    left: fullIcon.left,
    top: fullIcon.top,
    width: fullIcon.width,
    height: fullIcon.height
  };
  let body = fullIcon.body;
  [fullIcon, fullCustomisations].forEach((props) => {
    const transformations = [];
    const hFlip = props.hFlip;
    const vFlip = props.vFlip;
    let rotation = props.rotate;
    if (hFlip)
      if (vFlip)
        rotation += 2;
      else {
        transformations.push("translate(" + (box.width + box.left).toString() + " " + (0 - box.top).toString() + ")");
        transformations.push("scale(-1 1)");
        box.top = box.left = 0;
      }
    else if (vFlip) {
      transformations.push("translate(" + (0 - box.left).toString() + " " + (box.height + box.top).toString() + ")");
      transformations.push("scale(1 -1)");
      box.top = box.left = 0;
    }
    let tempValue;
    if (rotation < 0)
      rotation -= Math.floor(rotation / 4) * 4;
    rotation = rotation % 4;
    switch (rotation) {
      case 1:
        tempValue = box.height / 2 + box.top;
        transformations.unshift("rotate(90 " + tempValue.toString() + " " + tempValue.toString() + ")");
        break;
      case 2:
        transformations.unshift("rotate(180 " + (box.width / 2 + box.left).toString() + " " + (box.height / 2 + box.top).toString() + ")");
        break;
      case 3:
        tempValue = box.width / 2 + box.left;
        transformations.unshift("rotate(-90 " + tempValue.toString() + " " + tempValue.toString() + ")");
        break;
    }
    if (rotation % 2 === 1) {
      if (box.left !== box.top) {
        tempValue = box.left;
        box.left = box.top;
        box.top = tempValue;
      }
      if (box.width !== box.height) {
        tempValue = box.width;
        box.width = box.height;
        box.height = tempValue;
      }
    }
    if (transformations.length)
      body = wrapSVGContent(body, '<g transform="' + transformations.join(" ") + '">', "</g>");
  });
  const customisationsWidth = fullCustomisations.width;
  const customisationsHeight = fullCustomisations.height;
  const boxWidth = box.width;
  const boxHeight = box.height;
  let width;
  let height;
  if (customisationsWidth === null) {
    height = customisationsHeight === null ? "1em" : customisationsHeight === "auto" ? boxHeight : customisationsHeight;
    width = calculateSize(height, boxWidth / boxHeight);
  } else {
    width = customisationsWidth === "auto" ? boxWidth : customisationsWidth;
    height = customisationsHeight === null ? calculateSize(width, boxHeight / boxWidth) : customisationsHeight === "auto" ? boxHeight : customisationsHeight;
  }
  const attributes = {};
  const setAttr = (prop, value) => {
    if (!isUnsetKeyword(value))
      attributes[prop] = value.toString();
  };
  setAttr("width", width);
  setAttr("height", height);
  const viewBox = [
    box.left,
    box.top,
    boxWidth,
    boxHeight
  ];
  attributes.viewBox = viewBox.join(" ");
  return {
    attributes,
    viewBox,
    body
  };
}

// node_modules/@iconify/utils/lib/svg/id.js
var regex = /\sid="(\S+)"/g;
var counters = /* @__PURE__ */ new Map;
function nextID(id) {
  id = id.replace(/[0-9]+$/, "") || "a";
  const count = counters.get(id) || 0;
  counters.set(id, count + 1);
  return count ? `${id}${count}` : id;
}
function replaceIDs(body) {
  const ids = [];
  let match;
  while (match = regex.exec(body))
    ids.push(match[1]);
  if (!ids.length)
    return body;
  const suffix = "suffix" + (Math.random() * 16777216 | Date.now()).toString(16);
  ids.forEach((id) => {
    const newID = nextID(id);
    const escapedID = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    body = body.replace(new RegExp('([#;"])(' + escapedID + ')([")]|\\.[a-z])', "g"), "$1" + newID + suffix + "$3");
  });
  body = body.replace(new RegExp(suffix, "g"), "");
  return body;
}
// node_modules/@iconify/utils/lib/svg/html.js
function iconToHTML(body, attributes) {
  let renderAttribsHTML = body.indexOf("xlink:") === -1 ? "" : ' xmlns:xlink="http://www.w3.org/1999/xlink"';
  for (const attr in attributes)
    renderAttribsHTML += " " + attr + '="' + attributes[attr] + '"';
  return '<svg xmlns="http://www.w3.org/2000/svg"' + renderAttribsHTML + ">" + body + "</svg>";
}
// node_modules/marked/lib/marked.esm.js
function L() {
  return { async: false, breaks: false, extensions: null, gfm: true, hooks: null, pedantic: false, renderer: null, silent: false, tokenizer: null, walkTokens: null };
}
var T = L();
function G(l) {
  T = l;
}
var E = { exec: () => null };
function d(l, e = "") {
  let t = typeof l == "string" ? l : l.source, n = { replace: (r, i) => {
    let s = typeof i == "string" ? i : i.source;
    return s = s.replace(m.caret, "$1"), t = t.replace(r, s), n;
  }, getRegex: () => new RegExp(t, e) };
  return n;
}
var be = (() => {
  try {
    return !!new RegExp("(?<=1)(?<!1)");
  } catch {
    return false;
  }
})();
var m = { codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm, outputLinkReplace: /\\([\[\]])/g, indentCodeCompensation: /^(\s+)(?:```)/, beginningSpace: /^\s+/, endingHash: /#$/, startingSpaceChar: /^ /, endingSpaceChar: / $/, nonSpaceChar: /[^ ]/, newLineCharGlobal: /\n/g, tabCharGlobal: /\t/g, multipleSpaceGlobal: /\s+/g, blankLine: /^[ \t]*$/, doubleBlankLine: /\n[ \t]*\n[ \t]*$/, blockquoteStart: /^ {0,3}>/, blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g, blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm, listReplaceTabs: /^\t+/, listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g, listIsTask: /^\[[ xX]\] /, listReplaceTask: /^\[[ xX]\] +/, anyLine: /\n.*\n/, hrefBrackets: /^<(.*)>$/, tableDelimiter: /[:|]/, tableAlignChars: /^\||\| *$/g, tableRowBlankLine: /\n[ \t]*$/, tableAlignRight: /^ *-+: *$/, tableAlignCenter: /^ *:-+: *$/, tableAlignLeft: /^ *:-+ *$/, startATag: /^<a /i, endATag: /^<\/a>/i, startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i, endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i, startAngleBracket: /^</, endAngleBracket: />$/, pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/, unicodeAlphaNumeric: /[\p{L}\p{N}]/u, escapeTest: /[&<>"']/, escapeReplace: /[&<>"']/g, escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/, escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g, unescapeTest: /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig, caret: /(^|[^\[])\^/g, percentDecode: /%25/g, findPipe: /\|/g, splitPipe: / \|/, slashPipe: /\\\|/g, carriageReturn: /\r\n|\r/g, spaceLine: /^ +$/gm, notSpaceStart: /^\S*/, endingNewline: /\n$/, listItemRegex: (l) => new RegExp(`^( {0,3}${l})((?:[	 ][^\\n]*)?(?:\\n|$))`), nextBulletRegex: (l) => new RegExp(`^ {0,${Math.min(3, l - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`), hrRegex: (l) => new RegExp(`^ {0,${Math.min(3, l - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`), fencesBeginRegex: (l) => new RegExp(`^ {0,${Math.min(3, l - 1)}}(?:\`\`\`|~~~)`), headingBeginRegex: (l) => new RegExp(`^ {0,${Math.min(3, l - 1)}}#`), htmlBeginRegex: (l) => new RegExp(`^ {0,${Math.min(3, l - 1)}}<(?:[a-z].*>|!--)`, "i") };
var Re = /^(?:[ \t]*(?:\n|$))+/;
var Te = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/;
var Oe = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/;
var I = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/;
var we = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/;
var F = /(?:[*+-]|\d{1,9}[.)])/;
var ie = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/;
var oe = d(ie).replace(/bull/g, F).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex();
var ye = d(ie).replace(/bull/g, F).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex();
var j = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/;
var Pe = /^[^\n]+/;
var Q = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/;
var Se = d(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", Q).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex();
var $e = d(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, F).getRegex();
var v = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";
var U = /<!--(?:-?>|[\s\S]*?(?:-->|$))/;
var _e = d("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$))", "i").replace("comment", U).replace("tag", v).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
var ae = d(j).replace("hr", I).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", v).getRegex();
var Le = d(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", ae).getRegex();
var K = { blockquote: Le, code: Te, def: Se, fences: Oe, heading: we, hr: I, html: _e, lheading: oe, list: $e, newline: Re, paragraph: ae, table: E, text: Pe };
var re = d("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", I).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}\t)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", v).getRegex();
var Me = { ...K, lheading: ye, table: re, paragraph: d(j).replace("hr", I).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", re).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", v).getRegex() };
var ze = { ...K, html: d(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment", U).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(), def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/, heading: /^(#{1,6})(.*)(?:\n+|$)/, fences: E, lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/, paragraph: d(j).replace("hr", I).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", oe).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex() };
var Ae = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/;
var Ee = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/;
var le = /^( {2,}|\\)\n(?!\s*$)/;
var Ie = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/;
var D = /[\p{P}\p{S}]/u;
var W = /[\s\p{P}\p{S}]/u;
var ue = /[^\s\p{P}\p{S}]/u;
var Ce = d(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, W).getRegex();
var pe = /(?!~)[\p{P}\p{S}]/u;
var Be = /(?!~)[\s\p{P}\p{S}]/u;
var qe = /(?:[^\s\p{P}\p{S}]|~)/u;
var ve = d(/link|precode-code|html/, "g").replace("link", /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-", be ? "(?<!`)()" : "(^^|[^`])").replace("code", /(?<b>`+)[^`]+\k<b>(?!`)/).replace("html", /<(?! )[^<>]*?>/).getRegex();
var ce = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/;
var De = d(ce, "u").replace(/punct/g, D).getRegex();
var He = d(ce, "u").replace(/punct/g, pe).getRegex();
var he = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)";
var Ze = d(he, "gu").replace(/notPunctSpace/g, ue).replace(/punctSpace/g, W).replace(/punct/g, D).getRegex();
var Ge = d(he, "gu").replace(/notPunctSpace/g, qe).replace(/punctSpace/g, Be).replace(/punct/g, pe).getRegex();
var Ne = d("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, ue).replace(/punctSpace/g, W).replace(/punct/g, D).getRegex();
var Fe = d(/\\(punct)/, "gu").replace(/punct/g, D).getRegex();
var je = d(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex();
var Qe = d(U).replace("(?:-->|$)", "-->").getRegex();
var Ue = d("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", Qe).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex();
var q = /(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+[^`]*?`+(?!`)|[^\[\]\\`])*?/;
var Ke = d(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", q).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex();
var de = d(/^!?\[(label)\]\[(ref)\]/).replace("label", q).replace("ref", Q).getRegex();
var ke = d(/^!?\[(ref)\](?:\[\])?/).replace("ref", Q).getRegex();
var We = d("reflink|nolink(?!\\()", "g").replace("reflink", de).replace("nolink", ke).getRegex();
var se = /[hH][tT][tT][pP][sS]?|[fF][tT][pP]/;
var X = { _backpedal: E, anyPunctuation: Fe, autolink: je, blockSkip: ve, br: le, code: Ee, del: E, emStrongLDelim: De, emStrongRDelimAst: Ze, emStrongRDelimUnd: Ne, escape: Ae, link: Ke, nolink: ke, punctuation: Ce, reflink: de, reflinkSearch: We, tag: Ue, text: Ie, url: E };
var Xe = { ...X, link: d(/^!?\[(label)\]\((.*?)\)/).replace("label", q).getRegex(), reflink: d(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", q).getRegex() };
var N = { ...X, emStrongRDelimAst: Ge, emStrongLDelim: He, url: d(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol", se).replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(), _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/, del: /^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/, text: d(/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol", se).getRegex() };
var Je = { ...N, br: d(le).replace("{2,}", "*").getRegex(), text: d(N.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex() };
var C = { normal: K, gfm: Me, pedantic: ze };
var M = { normal: X, gfm: N, breaks: Je, pedantic: Xe };
var Ve = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
var ge = (l) => Ve[l];
function w(l, e) {
  if (e) {
    if (m.escapeTest.test(l))
      return l.replace(m.escapeReplace, ge);
  } else if (m.escapeTestNoEncode.test(l))
    return l.replace(m.escapeReplaceNoEncode, ge);
  return l;
}
function J(l) {
  try {
    l = encodeURI(l).replace(m.percentDecode, "%");
  } catch {
    return null;
  }
  return l;
}
function V(l, e) {
  let t = l.replace(m.findPipe, (i, s, a) => {
    let o = false, p = s;
    for (;--p >= 0 && a[p] === "\\"; )
      o = !o;
    return o ? "|" : " |";
  }), n = t.split(m.splitPipe), r = 0;
  if (n[0].trim() || n.shift(), n.length > 0 && !n.at(-1)?.trim() && n.pop(), e)
    if (n.length > e)
      n.splice(e);
    else
      for (;n.length < e; )
        n.push("");
  for (;r < n.length; r++)
    n[r] = n[r].trim().replace(m.slashPipe, "|");
  return n;
}
function z(l, e, t) {
  let n = l.length;
  if (n === 0)
    return "";
  let r = 0;
  for (;r < n; ) {
    let i = l.charAt(n - r - 1);
    if (i === e && !t)
      r++;
    else if (i !== e && t)
      r++;
    else
      break;
  }
  return l.slice(0, n - r);
}
function fe(l, e) {
  if (l.indexOf(e[1]) === -1)
    return -1;
  let t = 0;
  for (let n = 0;n < l.length; n++)
    if (l[n] === "\\")
      n++;
    else if (l[n] === e[0])
      t++;
    else if (l[n] === e[1] && (t--, t < 0))
      return n;
  return t > 0 ? -2 : -1;
}
function me(l, e, t, n, r) {
  let i = e.href, s = e.title || null, a = l[1].replace(r.other.outputLinkReplace, "$1");
  n.state.inLink = true;
  let o = { type: l[0].charAt(0) === "!" ? "image" : "link", raw: t, href: i, title: s, text: a, tokens: n.inlineTokens(a) };
  return n.state.inLink = false, o;
}
function Ye(l, e, t) {
  let n = l.match(t.other.indentCodeCompensation);
  if (n === null)
    return e;
  let r = n[1];
  return e.split(`
`).map((i) => {
    let s = i.match(t.other.beginningSpace);
    if (s === null)
      return i;
    let [a] = s;
    return a.length >= r.length ? i.slice(r.length) : i;
  }).join(`
`);
}
var y = class {
  options;
  rules;
  lexer;
  constructor(e) {
    this.options = e || T;
  }
  space(e) {
    let t = this.rules.block.newline.exec(e);
    if (t && t[0].length > 0)
      return { type: "space", raw: t[0] };
  }
  code(e) {
    let t = this.rules.block.code.exec(e);
    if (t) {
      let n = t[0].replace(this.rules.other.codeRemoveIndent, "");
      return { type: "code", raw: t[0], codeBlockStyle: "indented", text: this.options.pedantic ? n : z(n, `
`) };
    }
  }
  fences(e) {
    let t = this.rules.block.fences.exec(e);
    if (t) {
      let n = t[0], r = Ye(n, t[3] || "", this.rules);
      return { type: "code", raw: n, lang: t[2] ? t[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : t[2], text: r };
    }
  }
  heading(e) {
    let t = this.rules.block.heading.exec(e);
    if (t) {
      let n = t[2].trim();
      if (this.rules.other.endingHash.test(n)) {
        let r = z(n, "#");
        (this.options.pedantic || !r || this.rules.other.endingSpaceChar.test(r)) && (n = r.trim());
      }
      return { type: "heading", raw: t[0], depth: t[1].length, text: n, tokens: this.lexer.inline(n) };
    }
  }
  hr(e) {
    let t = this.rules.block.hr.exec(e);
    if (t)
      return { type: "hr", raw: z(t[0], `
`) };
  }
  blockquote(e) {
    let t = this.rules.block.blockquote.exec(e);
    if (t) {
      let n = z(t[0], `
`).split(`
`), r = "", i = "", s = [];
      for (;n.length > 0; ) {
        let a = false, o = [], p;
        for (p = 0;p < n.length; p++)
          if (this.rules.other.blockquoteStart.test(n[p]))
            o.push(n[p]), a = true;
          else if (!a)
            o.push(n[p]);
          else
            break;
        n = n.slice(p);
        let u = o.join(`
`), c = u.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
        r = r ? `${r}
${u}` : u, i = i ? `${i}
${c}` : c;
        let g = this.lexer.state.top;
        if (this.lexer.state.top = true, this.lexer.blockTokens(c, s, true), this.lexer.state.top = g, n.length === 0)
          break;
        let h = s.at(-1);
        if (h?.type === "code")
          break;
        if (h?.type === "blockquote") {
          let R = h, f = R.raw + `
` + n.join(`
`), O = this.blockquote(f);
          s[s.length - 1] = O, r = r.substring(0, r.length - R.raw.length) + O.raw, i = i.substring(0, i.length - R.text.length) + O.text;
          break;
        } else if (h?.type === "list") {
          let R = h, f = R.raw + `
` + n.join(`
`), O = this.list(f);
          s[s.length - 1] = O, r = r.substring(0, r.length - h.raw.length) + O.raw, i = i.substring(0, i.length - R.raw.length) + O.raw, n = f.substring(s.at(-1).raw.length).split(`
`);
          continue;
        }
      }
      return { type: "blockquote", raw: r, tokens: s, text: i };
    }
  }
  list(e) {
    let t = this.rules.block.list.exec(e);
    if (t) {
      let n = t[1].trim(), r = n.length > 1, i = { type: "list", raw: "", ordered: r, start: r ? +n.slice(0, -1) : "", loose: false, items: [] };
      n = r ? `\\d{1,9}\\${n.slice(-1)}` : `\\${n}`, this.options.pedantic && (n = r ? n : "[*+-]");
      let s = this.rules.other.listItemRegex(n), a = false;
      for (;e; ) {
        let p = false, u = "", c = "";
        if (!(t = s.exec(e)) || this.rules.block.hr.test(e))
          break;
        u = t[0], e = e.substring(u.length);
        let g = t[2].split(`
`, 1)[0].replace(this.rules.other.listReplaceTabs, (H) => " ".repeat(3 * H.length)), h = e.split(`
`, 1)[0], R = !g.trim(), f = 0;
        if (this.options.pedantic ? (f = 2, c = g.trimStart()) : R ? f = t[1].length + 1 : (f = t[2].search(this.rules.other.nonSpaceChar), f = f > 4 ? 1 : f, c = g.slice(f), f += t[1].length), R && this.rules.other.blankLine.test(h) && (u += h + `
`, e = e.substring(h.length + 1), p = true), !p) {
          let H = this.rules.other.nextBulletRegex(f), ee = this.rules.other.hrRegex(f), te = this.rules.other.fencesBeginRegex(f), ne = this.rules.other.headingBeginRegex(f), xe = this.rules.other.htmlBeginRegex(f);
          for (;e; ) {
            let Z = e.split(`
`, 1)[0], A;
            if (h = Z, this.options.pedantic ? (h = h.replace(this.rules.other.listReplaceNesting, "  "), A = h) : A = h.replace(this.rules.other.tabCharGlobal, "    "), te.test(h) || ne.test(h) || xe.test(h) || H.test(h) || ee.test(h))
              break;
            if (A.search(this.rules.other.nonSpaceChar) >= f || !h.trim())
              c += `
` + A.slice(f);
            else {
              if (R || g.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || te.test(g) || ne.test(g) || ee.test(g))
                break;
              c += `
` + h;
            }
            !R && !h.trim() && (R = true), u += Z + `
`, e = e.substring(Z.length + 1), g = A.slice(f);
          }
        }
        i.loose || (a ? i.loose = true : this.rules.other.doubleBlankLine.test(u) && (a = true));
        let O = null, Y;
        this.options.gfm && (O = this.rules.other.listIsTask.exec(c), O && (Y = O[0] !== "[ ] ", c = c.replace(this.rules.other.listReplaceTask, ""))), i.items.push({ type: "list_item", raw: u, task: !!O, checked: Y, loose: false, text: c, tokens: [] }), i.raw += u;
      }
      let o = i.items.at(-1);
      if (o)
        o.raw = o.raw.trimEnd(), o.text = o.text.trimEnd();
      else
        return;
      i.raw = i.raw.trimEnd();
      for (let p = 0;p < i.items.length; p++)
        if (this.lexer.state.top = false, i.items[p].tokens = this.lexer.blockTokens(i.items[p].text, []), !i.loose) {
          let u = i.items[p].tokens.filter((g) => g.type === "space"), c = u.length > 0 && u.some((g) => this.rules.other.anyLine.test(g.raw));
          i.loose = c;
        }
      if (i.loose)
        for (let p = 0;p < i.items.length; p++)
          i.items[p].loose = true;
      return i;
    }
  }
  html(e) {
    let t = this.rules.block.html.exec(e);
    if (t)
      return { type: "html", block: true, raw: t[0], pre: t[1] === "pre" || t[1] === "script" || t[1] === "style", text: t[0] };
  }
  def(e) {
    let t = this.rules.block.def.exec(e);
    if (t) {
      let n = t[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, " "), r = t[2] ? t[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", i = t[3] ? t[3].substring(1, t[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : t[3];
      return { type: "def", tag: n, raw: t[0], href: r, title: i };
    }
  }
  table(e) {
    let t = this.rules.block.table.exec(e);
    if (!t || !this.rules.other.tableDelimiter.test(t[2]))
      return;
    let n = V(t[1]), r = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), i = t[3]?.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [], s = { type: "table", raw: t[0], header: [], align: [], rows: [] };
    if (n.length === r.length) {
      for (let a of r)
        this.rules.other.tableAlignRight.test(a) ? s.align.push("right") : this.rules.other.tableAlignCenter.test(a) ? s.align.push("center") : this.rules.other.tableAlignLeft.test(a) ? s.align.push("left") : s.align.push(null);
      for (let a = 0;a < n.length; a++)
        s.header.push({ text: n[a], tokens: this.lexer.inline(n[a]), header: true, align: s.align[a] });
      for (let a of i)
        s.rows.push(V(a, s.header.length).map((o, p) => ({ text: o, tokens: this.lexer.inline(o), header: false, align: s.align[p] })));
      return s;
    }
  }
  lheading(e) {
    let t = this.rules.block.lheading.exec(e);
    if (t)
      return { type: "heading", raw: t[0], depth: t[2].charAt(0) === "=" ? 1 : 2, text: t[1], tokens: this.lexer.inline(t[1]) };
  }
  paragraph(e) {
    let t = this.rules.block.paragraph.exec(e);
    if (t) {
      let n = t[1].charAt(t[1].length - 1) === `
` ? t[1].slice(0, -1) : t[1];
      return { type: "paragraph", raw: t[0], text: n, tokens: this.lexer.inline(n) };
    }
  }
  text(e) {
    let t = this.rules.block.text.exec(e);
    if (t)
      return { type: "text", raw: t[0], text: t[0], tokens: this.lexer.inline(t[0]) };
  }
  escape(e) {
    let t = this.rules.inline.escape.exec(e);
    if (t)
      return { type: "escape", raw: t[0], text: t[1] };
  }
  tag(e) {
    let t = this.rules.inline.tag.exec(e);
    if (t)
      return !this.lexer.state.inLink && this.rules.other.startATag.test(t[0]) ? this.lexer.state.inLink = true : this.lexer.state.inLink && this.rules.other.endATag.test(t[0]) && (this.lexer.state.inLink = false), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(t[0]) ? this.lexer.state.inRawBlock = true : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(t[0]) && (this.lexer.state.inRawBlock = false), { type: "html", raw: t[0], inLink: this.lexer.state.inLink, inRawBlock: this.lexer.state.inRawBlock, block: false, text: t[0] };
  }
  link(e) {
    let t = this.rules.inline.link.exec(e);
    if (t) {
      let n = t[2].trim();
      if (!this.options.pedantic && this.rules.other.startAngleBracket.test(n)) {
        if (!this.rules.other.endAngleBracket.test(n))
          return;
        let s = z(n.slice(0, -1), "\\");
        if ((n.length - s.length) % 2 === 0)
          return;
      } else {
        let s = fe(t[2], "()");
        if (s === -2)
          return;
        if (s > -1) {
          let o = (t[0].indexOf("!") === 0 ? 5 : 4) + t[1].length + s;
          t[2] = t[2].substring(0, s), t[0] = t[0].substring(0, o).trim(), t[3] = "";
        }
      }
      let r = t[2], i = "";
      if (this.options.pedantic) {
        let s = this.rules.other.pedanticHrefTitle.exec(r);
        s && (r = s[1], i = s[3]);
      } else
        i = t[3] ? t[3].slice(1, -1) : "";
      return r = r.trim(), this.rules.other.startAngleBracket.test(r) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? r = r.slice(1) : r = r.slice(1, -1)), me(t, { href: r && r.replace(this.rules.inline.anyPunctuation, "$1"), title: i && i.replace(this.rules.inline.anyPunctuation, "$1") }, t[0], this.lexer, this.rules);
    }
  }
  reflink(e, t) {
    let n;
    if ((n = this.rules.inline.reflink.exec(e)) || (n = this.rules.inline.nolink.exec(e))) {
      let r = (n[2] || n[1]).replace(this.rules.other.multipleSpaceGlobal, " "), i = t[r.toLowerCase()];
      if (!i) {
        let s = n[0].charAt(0);
        return { type: "text", raw: s, text: s };
      }
      return me(n, i, n[0], this.lexer, this.rules);
    }
  }
  emStrong(e, t, n = "") {
    let r = this.rules.inline.emStrongLDelim.exec(e);
    if (!r || r[3] && n.match(this.rules.other.unicodeAlphaNumeric))
      return;
    if (!(r[1] || r[2] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      let s = [...r[0]].length - 1, a, o, p = s, u = 0, c = r[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (c.lastIndex = 0, t = t.slice(-1 * e.length + s);(r = c.exec(t)) != null; ) {
        if (a = r[1] || r[2] || r[3] || r[4] || r[5] || r[6], !a)
          continue;
        if (o = [...a].length, r[3] || r[4]) {
          p += o;
          continue;
        } else if ((r[5] || r[6]) && s % 3 && !((s + o) % 3)) {
          u += o;
          continue;
        }
        if (p -= o, p > 0)
          continue;
        o = Math.min(o, o + p + u);
        let g = [...r[0]][0].length, h = e.slice(0, s + r.index + g + o);
        if (Math.min(s, o) % 2) {
          let f = h.slice(1, -1);
          return { type: "em", raw: h, text: f, tokens: this.lexer.inlineTokens(f) };
        }
        let R = h.slice(2, -2);
        return { type: "strong", raw: h, text: R, tokens: this.lexer.inlineTokens(R) };
      }
    }
  }
  codespan(e) {
    let t = this.rules.inline.code.exec(e);
    if (t) {
      let n = t[2].replace(this.rules.other.newLineCharGlobal, " "), r = this.rules.other.nonSpaceChar.test(n), i = this.rules.other.startingSpaceChar.test(n) && this.rules.other.endingSpaceChar.test(n);
      return r && i && (n = n.substring(1, n.length - 1)), { type: "codespan", raw: t[0], text: n };
    }
  }
  br(e) {
    let t = this.rules.inline.br.exec(e);
    if (t)
      return { type: "br", raw: t[0] };
  }
  del(e) {
    let t = this.rules.inline.del.exec(e);
    if (t)
      return { type: "del", raw: t[0], text: t[2], tokens: this.lexer.inlineTokens(t[2]) };
  }
  autolink(e) {
    let t = this.rules.inline.autolink.exec(e);
    if (t) {
      let n, r;
      return t[2] === "@" ? (n = t[1], r = "mailto:" + n) : (n = t[1], r = n), { type: "link", raw: t[0], text: n, href: r, tokens: [{ type: "text", raw: n, text: n }] };
    }
  }
  url(e) {
    let t;
    if (t = this.rules.inline.url.exec(e)) {
      let n, r;
      if (t[2] === "@")
        n = t[0], r = "mailto:" + n;
      else {
        let i;
        do
          i = t[0], t[0] = this.rules.inline._backpedal.exec(t[0])?.[0] ?? "";
        while (i !== t[0]);
        n = t[0], t[1] === "www." ? r = "http://" + t[0] : r = t[0];
      }
      return { type: "link", raw: t[0], text: n, href: r, tokens: [{ type: "text", raw: n, text: n }] };
    }
  }
  inlineText(e) {
    let t = this.rules.inline.text.exec(e);
    if (t) {
      let n = this.lexer.state.inRawBlock;
      return { type: "text", raw: t[0], text: t[0], escaped: n };
    }
  }
};
var x = class l {
  tokens;
  options;
  state;
  tokenizer;
  inlineQueue;
  constructor(e) {
    this.tokens = [], this.tokens.links = Object.create(null), this.options = e || T, this.options.tokenizer = this.options.tokenizer || new y, this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = { inLink: false, inRawBlock: false, top: true };
    let t = { other: m, block: C.normal, inline: M.normal };
    this.options.pedantic ? (t.block = C.pedantic, t.inline = M.pedantic) : this.options.gfm && (t.block = C.gfm, this.options.breaks ? t.inline = M.breaks : t.inline = M.gfm), this.tokenizer.rules = t;
  }
  static get rules() {
    return { block: C, inline: M };
  }
  static lex(e, t) {
    return new l(t).lex(e);
  }
  static lexInline(e, t) {
    return new l(t).inlineTokens(e);
  }
  lex(e) {
    e = e.replace(m.carriageReturn, `
`), this.blockTokens(e, this.tokens);
    for (let t = 0;t < this.inlineQueue.length; t++) {
      let n = this.inlineQueue[t];
      this.inlineTokens(n.src, n.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(e, t = [], n = false) {
    for (this.options.pedantic && (e = e.replace(m.tabCharGlobal, "    ").replace(m.spaceLine, ""));e; ) {
      let r;
      if (this.options.extensions?.block?.some((s) => (r = s.call({ lexer: this }, e, t)) ? (e = e.substring(r.raw.length), t.push(r), true) : false))
        continue;
      if (r = this.tokenizer.space(e)) {
        e = e.substring(r.raw.length);
        let s = t.at(-1);
        r.raw.length === 1 && s !== undefined ? s.raw += `
` : t.push(r);
        continue;
      }
      if (r = this.tokenizer.code(e)) {
        e = e.substring(r.raw.length);
        let s = t.at(-1);
        s?.type === "paragraph" || s?.type === "text" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.text, this.inlineQueue.at(-1).src = s.text) : t.push(r);
        continue;
      }
      if (r = this.tokenizer.fences(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.heading(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.hr(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.blockquote(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.list(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.html(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.def(e)) {
        e = e.substring(r.raw.length);
        let s = t.at(-1);
        s?.type === "paragraph" || s?.type === "text" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.raw, this.inlineQueue.at(-1).src = s.text) : this.tokens.links[r.tag] || (this.tokens.links[r.tag] = { href: r.href, title: r.title }, t.push(r));
        continue;
      }
      if (r = this.tokenizer.table(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.lheading(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      let i = e;
      if (this.options.extensions?.startBlock) {
        let s = 1 / 0, a = e.slice(1), o;
        this.options.extensions.startBlock.forEach((p) => {
          o = p.call({ lexer: this }, a), typeof o == "number" && o >= 0 && (s = Math.min(s, o));
        }), s < 1 / 0 && s >= 0 && (i = e.substring(0, s + 1));
      }
      if (this.state.top && (r = this.tokenizer.paragraph(i))) {
        let s = t.at(-1);
        n && s?.type === "paragraph" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = s.text) : t.push(r), n = i.length !== e.length, e = e.substring(r.raw.length);
        continue;
      }
      if (r = this.tokenizer.text(e)) {
        e = e.substring(r.raw.length);
        let s = t.at(-1);
        s?.type === "text" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = s.text) : t.push(r);
        continue;
      }
      if (e) {
        let s = "Infinite loop on byte: " + e.charCodeAt(0);
        if (this.options.silent) {
          console.error(s);
          break;
        } else
          throw new Error(s);
      }
    }
    return this.state.top = true, t;
  }
  inline(e, t = []) {
    return this.inlineQueue.push({ src: e, tokens: t }), t;
  }
  inlineTokens(e, t = []) {
    let n = e, r = null;
    if (this.tokens.links) {
      let o = Object.keys(this.tokens.links);
      if (o.length > 0)
        for (;(r = this.tokenizer.rules.inline.reflinkSearch.exec(n)) != null; )
          o.includes(r[0].slice(r[0].lastIndexOf("[") + 1, -1)) && (n = n.slice(0, r.index) + "[" + "a".repeat(r[0].length - 2) + "]" + n.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex));
    }
    for (;(r = this.tokenizer.rules.inline.anyPunctuation.exec(n)) != null; )
      n = n.slice(0, r.index) + "++" + n.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
    let i;
    for (;(r = this.tokenizer.rules.inline.blockSkip.exec(n)) != null; )
      i = r[2] ? r[2].length : 0, n = n.slice(0, r.index + i) + "[" + "a".repeat(r[0].length - i - 2) + "]" + n.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    n = this.options.hooks?.emStrongMask?.call({ lexer: this }, n) ?? n;
    let s = false, a = "";
    for (;e; ) {
      s || (a = ""), s = false;
      let o;
      if (this.options.extensions?.inline?.some((u) => (o = u.call({ lexer: this }, e, t)) ? (e = e.substring(o.raw.length), t.push(o), true) : false))
        continue;
      if (o = this.tokenizer.escape(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.tag(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.link(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.reflink(e, this.tokens.links)) {
        e = e.substring(o.raw.length);
        let u = t.at(-1);
        o.type === "text" && u?.type === "text" ? (u.raw += o.raw, u.text += o.text) : t.push(o);
        continue;
      }
      if (o = this.tokenizer.emStrong(e, n, a)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.codespan(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.br(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.del(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.autolink(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (!this.state.inLink && (o = this.tokenizer.url(e))) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      let p = e;
      if (this.options.extensions?.startInline) {
        let u = 1 / 0, c = e.slice(1), g;
        this.options.extensions.startInline.forEach((h) => {
          g = h.call({ lexer: this }, c), typeof g == "number" && g >= 0 && (u = Math.min(u, g));
        }), u < 1 / 0 && u >= 0 && (p = e.substring(0, u + 1));
      }
      if (o = this.tokenizer.inlineText(p)) {
        e = e.substring(o.raw.length), o.raw.slice(-1) !== "_" && (a = o.raw.slice(-1)), s = true;
        let u = t.at(-1);
        u?.type === "text" ? (u.raw += o.raw, u.text += o.text) : t.push(o);
        continue;
      }
      if (e) {
        let u = "Infinite loop on byte: " + e.charCodeAt(0);
        if (this.options.silent) {
          console.error(u);
          break;
        } else
          throw new Error(u);
      }
    }
    return t;
  }
};
var P = class {
  options;
  parser;
  constructor(e) {
    this.options = e || T;
  }
  space(e) {
    return "";
  }
  code({ text: e, lang: t, escaped: n }) {
    let r = (t || "").match(m.notSpaceStart)?.[0], i = e.replace(m.endingNewline, "") + `
`;
    return r ? '<pre><code class="language-' + w(r) + '">' + (n ? i : w(i, true)) + `</code></pre>
` : "<pre><code>" + (n ? i : w(i, true)) + `</code></pre>
`;
  }
  blockquote({ tokens: e }) {
    return `<blockquote>
${this.parser.parse(e)}</blockquote>
`;
  }
  html({ text: e }) {
    return e;
  }
  def(e) {
    return "";
  }
  heading({ tokens: e, depth: t }) {
    return `<h${t}>${this.parser.parseInline(e)}</h${t}>
`;
  }
  hr(e) {
    return `<hr>
`;
  }
  list(e) {
    let { ordered: t, start: n } = e, r = "";
    for (let a = 0;a < e.items.length; a++) {
      let o = e.items[a];
      r += this.listitem(o);
    }
    let i = t ? "ol" : "ul", s = t && n !== 1 ? ' start="' + n + '"' : "";
    return "<" + i + s + `>
` + r + "</" + i + `>
`;
  }
  listitem(e) {
    let t = "";
    if (e.task) {
      let n = this.checkbox({ checked: !!e.checked });
      e.loose ? e.tokens[0]?.type === "paragraph" ? (e.tokens[0].text = n + " " + e.tokens[0].text, e.tokens[0].tokens && e.tokens[0].tokens.length > 0 && e.tokens[0].tokens[0].type === "text" && (e.tokens[0].tokens[0].text = n + " " + w(e.tokens[0].tokens[0].text), e.tokens[0].tokens[0].escaped = true)) : e.tokens.unshift({ type: "text", raw: n + " ", text: n + " ", escaped: true }) : t += n + " ";
    }
    return t += this.parser.parse(e.tokens, !!e.loose), `<li>${t}</li>
`;
  }
  checkbox({ checked: e }) {
    return "<input " + (e ? 'checked="" ' : "") + 'disabled="" type="checkbox">';
  }
  paragraph({ tokens: e }) {
    return `<p>${this.parser.parseInline(e)}</p>
`;
  }
  table(e) {
    let t = "", n = "";
    for (let i = 0;i < e.header.length; i++)
      n += this.tablecell(e.header[i]);
    t += this.tablerow({ text: n });
    let r = "";
    for (let i = 0;i < e.rows.length; i++) {
      let s = e.rows[i];
      n = "";
      for (let a = 0;a < s.length; a++)
        n += this.tablecell(s[a]);
      r += this.tablerow({ text: n });
    }
    return r && (r = `<tbody>${r}</tbody>`), `<table>
<thead>
` + t + `</thead>
` + r + `</table>
`;
  }
  tablerow({ text: e }) {
    return `<tr>
${e}</tr>
`;
  }
  tablecell(e) {
    let t = this.parser.parseInline(e.tokens), n = e.header ? "th" : "td";
    return (e.align ? `<${n} align="${e.align}">` : `<${n}>`) + t + `</${n}>
`;
  }
  strong({ tokens: e }) {
    return `<strong>${this.parser.parseInline(e)}</strong>`;
  }
  em({ tokens: e }) {
    return `<em>${this.parser.parseInline(e)}</em>`;
  }
  codespan({ text: e }) {
    return `<code>${w(e, true)}</code>`;
  }
  br(e) {
    return "<br>";
  }
  del({ tokens: e }) {
    return `<del>${this.parser.parseInline(e)}</del>`;
  }
  link({ href: e, title: t, tokens: n }) {
    let r = this.parser.parseInline(n), i = J(e);
    if (i === null)
      return r;
    e = i;
    let s = '<a href="' + e + '"';
    return t && (s += ' title="' + w(t) + '"'), s += ">" + r + "</a>", s;
  }
  image({ href: e, title: t, text: n, tokens: r }) {
    r && (n = this.parser.parseInline(r, this.parser.textRenderer));
    let i = J(e);
    if (i === null)
      return w(n);
    e = i;
    let s = `<img src="${e}" alt="${n}"`;
    return t && (s += ` title="${w(t)}"`), s += ">", s;
  }
  text(e) {
    return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : ("escaped" in e) && e.escaped ? e.text : w(e.text);
  }
};
var $ = class {
  strong({ text: e }) {
    return e;
  }
  em({ text: e }) {
    return e;
  }
  codespan({ text: e }) {
    return e;
  }
  del({ text: e }) {
    return e;
  }
  html({ text: e }) {
    return e;
  }
  text({ text: e }) {
    return e;
  }
  link({ text: e }) {
    return "" + e;
  }
  image({ text: e }) {
    return "" + e;
  }
  br() {
    return "";
  }
};
var b = class l2 {
  options;
  renderer;
  textRenderer;
  constructor(e) {
    this.options = e || T, this.options.renderer = this.options.renderer || new P, this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new $;
  }
  static parse(e, t) {
    return new l2(t).parse(e);
  }
  static parseInline(e, t) {
    return new l2(t).parseInline(e);
  }
  parse(e, t = true) {
    let n = "";
    for (let r = 0;r < e.length; r++) {
      let i = e[r];
      if (this.options.extensions?.renderers?.[i.type]) {
        let a = i, o = this.options.extensions.renderers[a.type].call({ parser: this }, a);
        if (o !== false || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "def", "paragraph", "text"].includes(a.type)) {
          n += o || "";
          continue;
        }
      }
      let s = i;
      switch (s.type) {
        case "space": {
          n += this.renderer.space(s);
          continue;
        }
        case "hr": {
          n += this.renderer.hr(s);
          continue;
        }
        case "heading": {
          n += this.renderer.heading(s);
          continue;
        }
        case "code": {
          n += this.renderer.code(s);
          continue;
        }
        case "table": {
          n += this.renderer.table(s);
          continue;
        }
        case "blockquote": {
          n += this.renderer.blockquote(s);
          continue;
        }
        case "list": {
          n += this.renderer.list(s);
          continue;
        }
        case "html": {
          n += this.renderer.html(s);
          continue;
        }
        case "def": {
          n += this.renderer.def(s);
          continue;
        }
        case "paragraph": {
          n += this.renderer.paragraph(s);
          continue;
        }
        case "text": {
          let a = s, o = this.renderer.text(a);
          for (;r + 1 < e.length && e[r + 1].type === "text"; )
            a = e[++r], o += `
` + this.renderer.text(a);
          t ? n += this.renderer.paragraph({ type: "paragraph", raw: o, text: o, tokens: [{ type: "text", raw: o, text: o, escaped: true }] }) : n += o;
          continue;
        }
        default: {
          let a = 'Token with "' + s.type + '" type was not found.';
          if (this.options.silent)
            return console.error(a), "";
          throw new Error(a);
        }
      }
    }
    return n;
  }
  parseInline(e, t = this.renderer) {
    let n = "";
    for (let r = 0;r < e.length; r++) {
      let i = e[r];
      if (this.options.extensions?.renderers?.[i.type]) {
        let a = this.options.extensions.renderers[i.type].call({ parser: this }, i);
        if (a !== false || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(i.type)) {
          n += a || "";
          continue;
        }
      }
      let s = i;
      switch (s.type) {
        case "escape": {
          n += t.text(s);
          break;
        }
        case "html": {
          n += t.html(s);
          break;
        }
        case "link": {
          n += t.link(s);
          break;
        }
        case "image": {
          n += t.image(s);
          break;
        }
        case "strong": {
          n += t.strong(s);
          break;
        }
        case "em": {
          n += t.em(s);
          break;
        }
        case "codespan": {
          n += t.codespan(s);
          break;
        }
        case "br": {
          n += t.br(s);
          break;
        }
        case "del": {
          n += t.del(s);
          break;
        }
        case "text": {
          n += t.text(s);
          break;
        }
        default: {
          let a = 'Token with "' + s.type + '" type was not found.';
          if (this.options.silent)
            return console.error(a), "";
          throw new Error(a);
        }
      }
    }
    return n;
  }
};
var S = class {
  options;
  block;
  constructor(e) {
    this.options = e || T;
  }
  static passThroughHooks = new Set(["preprocess", "postprocess", "processAllTokens", "emStrongMask"]);
  static passThroughHooksRespectAsync = new Set(["preprocess", "postprocess", "processAllTokens"]);
  preprocess(e) {
    return e;
  }
  postprocess(e) {
    return e;
  }
  processAllTokens(e) {
    return e;
  }
  emStrongMask(e) {
    return e;
  }
  provideLexer() {
    return this.block ? x.lex : x.lexInline;
  }
  provideParser() {
    return this.block ? b.parse : b.parseInline;
  }
};
var B = class {
  defaults = L();
  options = this.setOptions;
  parse = this.parseMarkdown(true);
  parseInline = this.parseMarkdown(false);
  Parser = b;
  Renderer = P;
  TextRenderer = $;
  Lexer = x;
  Tokenizer = y;
  Hooks = S;
  constructor(...e) {
    this.use(...e);
  }
  walkTokens(e, t) {
    let n = [];
    for (let r of e)
      switch (n = n.concat(t.call(this, r)), r.type) {
        case "table": {
          let i = r;
          for (let s of i.header)
            n = n.concat(this.walkTokens(s.tokens, t));
          for (let s of i.rows)
            for (let a of s)
              n = n.concat(this.walkTokens(a.tokens, t));
          break;
        }
        case "list": {
          let i = r;
          n = n.concat(this.walkTokens(i.items, t));
          break;
        }
        default: {
          let i = r;
          this.defaults.extensions?.childTokens?.[i.type] ? this.defaults.extensions.childTokens[i.type].forEach((s) => {
            let a = i[s].flat(1 / 0);
            n = n.concat(this.walkTokens(a, t));
          }) : i.tokens && (n = n.concat(this.walkTokens(i.tokens, t)));
        }
      }
    return n;
  }
  use(...e) {
    let t = this.defaults.extensions || { renderers: {}, childTokens: {} };
    return e.forEach((n) => {
      let r = { ...n };
      if (r.async = this.defaults.async || r.async || false, n.extensions && (n.extensions.forEach((i) => {
        if (!i.name)
          throw new Error("extension name required");
        if ("renderer" in i) {
          let s = t.renderers[i.name];
          s ? t.renderers[i.name] = function(...a) {
            let o = i.renderer.apply(this, a);
            return o === false && (o = s.apply(this, a)), o;
          } : t.renderers[i.name] = i.renderer;
        }
        if ("tokenizer" in i) {
          if (!i.level || i.level !== "block" && i.level !== "inline")
            throw new Error("extension level must be 'block' or 'inline'");
          let s = t[i.level];
          s ? s.unshift(i.tokenizer) : t[i.level] = [i.tokenizer], i.start && (i.level === "block" ? t.startBlock ? t.startBlock.push(i.start) : t.startBlock = [i.start] : i.level === "inline" && (t.startInline ? t.startInline.push(i.start) : t.startInline = [i.start]));
        }
        "childTokens" in i && i.childTokens && (t.childTokens[i.name] = i.childTokens);
      }), r.extensions = t), n.renderer) {
        let i = this.defaults.renderer || new P(this.defaults);
        for (let s in n.renderer) {
          if (!(s in i))
            throw new Error(`renderer '${s}' does not exist`);
          if (["options", "parser"].includes(s))
            continue;
          let a = s, o = n.renderer[a], p = i[a];
          i[a] = (...u) => {
            let c = o.apply(i, u);
            return c === false && (c = p.apply(i, u)), c || "";
          };
        }
        r.renderer = i;
      }
      if (n.tokenizer) {
        let i = this.defaults.tokenizer || new y(this.defaults);
        for (let s in n.tokenizer) {
          if (!(s in i))
            throw new Error(`tokenizer '${s}' does not exist`);
          if (["options", "rules", "lexer"].includes(s))
            continue;
          let a = s, o = n.tokenizer[a], p = i[a];
          i[a] = (...u) => {
            let c = o.apply(i, u);
            return c === false && (c = p.apply(i, u)), c;
          };
        }
        r.tokenizer = i;
      }
      if (n.hooks) {
        let i = this.defaults.hooks || new S;
        for (let s in n.hooks) {
          if (!(s in i))
            throw new Error(`hook '${s}' does not exist`);
          if (["options", "block"].includes(s))
            continue;
          let a = s, o = n.hooks[a], p = i[a];
          S.passThroughHooks.has(s) ? i[a] = (u) => {
            if (this.defaults.async && S.passThroughHooksRespectAsync.has(s))
              return (async () => {
                let g = await o.call(i, u);
                return p.call(i, g);
              })();
            let c = o.call(i, u);
            return p.call(i, c);
          } : i[a] = (...u) => {
            if (this.defaults.async)
              return (async () => {
                let g = await o.apply(i, u);
                return g === false && (g = await p.apply(i, u)), g;
              })();
            let c = o.apply(i, u);
            return c === false && (c = p.apply(i, u)), c;
          };
        }
        r.hooks = i;
      }
      if (n.walkTokens) {
        let i = this.defaults.walkTokens, s = n.walkTokens;
        r.walkTokens = function(a) {
          let o = [];
          return o.push(s.call(this, a)), i && (o = o.concat(i.call(this, a))), o;
        };
      }
      this.defaults = { ...this.defaults, ...r };
    }), this;
  }
  setOptions(e) {
    return this.defaults = { ...this.defaults, ...e }, this;
  }
  lexer(e, t) {
    return x.lex(e, t ?? this.defaults);
  }
  parser(e, t) {
    return b.parse(e, t ?? this.defaults);
  }
  parseMarkdown(e) {
    return (n, r) => {
      let i = { ...r }, s = { ...this.defaults, ...i }, a = this.onError(!!s.silent, !!s.async);
      if (this.defaults.async === true && i.async === false)
        return a(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
      if (typeof n > "u" || n === null)
        return a(new Error("marked(): input parameter is undefined or null"));
      if (typeof n != "string")
        return a(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(n) + ", string expected"));
      if (s.hooks && (s.hooks.options = s, s.hooks.block = e), s.async)
        return (async () => {
          let o = s.hooks ? await s.hooks.preprocess(n) : n, u = await (s.hooks ? await s.hooks.provideLexer() : e ? x.lex : x.lexInline)(o, s), c = s.hooks ? await s.hooks.processAllTokens(u) : u;
          s.walkTokens && await Promise.all(this.walkTokens(c, s.walkTokens));
          let h = await (s.hooks ? await s.hooks.provideParser() : e ? b.parse : b.parseInline)(c, s);
          return s.hooks ? await s.hooks.postprocess(h) : h;
        })().catch(a);
      try {
        s.hooks && (n = s.hooks.preprocess(n));
        let p = (s.hooks ? s.hooks.provideLexer() : e ? x.lex : x.lexInline)(n, s);
        s.hooks && (p = s.hooks.processAllTokens(p)), s.walkTokens && this.walkTokens(p, s.walkTokens);
        let c = (s.hooks ? s.hooks.provideParser() : e ? b.parse : b.parseInline)(p, s);
        return s.hooks && (c = s.hooks.postprocess(c)), c;
      } catch (o) {
        return a(o);
      }
    };
  }
  onError(e, t) {
    return (n) => {
      if (n.message += `
Please report this to https://github.com/markedjs/marked.`, e) {
        let r = "<p>An error occurred:</p><pre>" + w(n.message + "", true) + "</pre>";
        return t ? Promise.resolve(r) : r;
      }
      if (t)
        return Promise.reject(n);
      throw n;
    };
  }
};
var _ = new B;
function k(l3, e) {
  return _.parse(l3, e);
}
k.options = k.setOptions = function(l3) {
  return _.setOptions(l3), k.defaults = _.defaults, G(k.defaults), k;
};
k.getDefaults = L;
k.defaults = T;
k.use = function(...l3) {
  return _.use(...l3), k.defaults = _.defaults, G(k.defaults), k;
};
k.walkTokens = function(l3, e) {
  return _.walkTokens(l3, e);
};
k.parseInline = _.parseInline;
k.Parser = b;
k.parser = b.parse;
k.Renderer = P;
k.TextRenderer = $;
k.Lexer = x;
k.lexer = x.lex;
k.Tokenizer = y;
k.Hooks = S;
k.parse = k;
var Zt = k.options;
var Gt = k.setOptions;
var Nt = k.use;
var Ft = k.walkTokens;
var jt = k.parseInline;
var Ut = b.parse;
var Kt = x.lex;

// node_modules/ts-dedent/esm/index.js
function dedent(templ) {
  var values = [];
  for (var _i = 1;_i < arguments.length; _i++) {
    values[_i - 1] = arguments[_i];
  }
  var strings = Array.from(typeof templ === "string" ? [templ] : templ);
  strings[strings.length - 1] = strings[strings.length - 1].replace(/\r?\n([\t ]*)$/, "");
  var indentLengths = strings.reduce(function(arr, str) {
    var matches = str.match(/\n([\t ]+|(?!\s).)/g);
    if (matches) {
      return arr.concat(matches.map(function(match) {
        var _a, _b;
        return (_b = (_a = match.match(/[\t ]/g)) === null || _a === undefined ? undefined : _a.length) !== null && _b !== undefined ? _b : 0;
      }));
    }
    return arr;
  }, []);
  if (indentLengths.length) {
    var pattern_1 = new RegExp(`
[	 ]{` + Math.min.apply(Math, indentLengths) + "}", "g");
    strings = strings.map(function(str) {
      return str.replace(pattern_1, `
`);
    });
  }
  strings[0] = strings[0].replace(/^\r?\n/, "");
  var string = strings[0];
  values.forEach(function(value, i) {
    var endentations = string.match(/(?:^|\n)( *)$/);
    var endentation = endentations ? endentations[1] : "";
    var indentedValue = value;
    if (typeof value === "string" && value.includes(`
`)) {
      indentedValue = String(value).split(`
`).map(function(str, i2) {
        return i2 === 0 ? str : "" + endentation + str;
      }).join(`
`);
    }
    string += indentedValue + strings[i + 1];
  });
  return string;
}

// node_modules/mermaid/dist/chunks/mermaid.core/chunk-O5CBEL6O.mjs
var unknownIcon = {
  body: '<g><rect width="80" height="80" style="fill: #087ebf; stroke-width: 0px;"/><text transform="translate(21.16 64.67)" style="fill: #fff; font-family: ArialMT, Arial; font-size: 67.75px;"><tspan x="0" y="0">?</tspan></text></g>',
  height: 80,
  width: 80
};
var iconsStore = /* @__PURE__ */ new Map;
var loaderStore = /* @__PURE__ */ new Map;
var registerIconPacks = /* @__PURE__ */ __name((iconLoaders) => {
  for (const iconLoader of iconLoaders) {
    if (!iconLoader.name) {
      throw new Error('Invalid icon loader. Must have a "name" property with non-empty string value.');
    }
    log.debug("Registering icon pack:", iconLoader.name);
    if ("loader" in iconLoader) {
      loaderStore.set(iconLoader.name, iconLoader.loader);
    } else if ("icons" in iconLoader) {
      iconsStore.set(iconLoader.name, iconLoader.icons);
    } else {
      log.error("Invalid icon loader:", iconLoader);
      throw new Error('Invalid icon loader. Must have either "icons" or "loader" property.');
    }
  }
}, "registerIconPacks");
var getRegisteredIconData = /* @__PURE__ */ __name(async (iconName, fallbackPrefix) => {
  const data = stringToIcon(iconName, true, fallbackPrefix !== undefined);
  if (!data) {
    throw new Error(`Invalid icon name: ${iconName}`);
  }
  const prefix = data.prefix || fallbackPrefix;
  if (!prefix) {
    throw new Error(`Icon name must contain a prefix: ${iconName}`);
  }
  let icons = iconsStore.get(prefix);
  if (!icons) {
    const loader = loaderStore.get(prefix);
    if (!loader) {
      throw new Error(`Icon set not found: ${data.prefix}`);
    }
    try {
      const loaded = await loader();
      icons = { ...loaded, prefix };
      iconsStore.set(prefix, icons);
    } catch (e) {
      log.error(e);
      throw new Error(`Failed to load icon set: ${data.prefix}`);
    }
  }
  const iconData = getIconData(icons, data.name);
  if (!iconData) {
    throw new Error(`Icon not found: ${iconName}`);
  }
  return iconData;
}, "getRegisteredIconData");
var isIconAvailable = /* @__PURE__ */ __name(async (iconName) => {
  try {
    await getRegisteredIconData(iconName);
    return true;
  } catch {
    return false;
  }
}, "isIconAvailable");
var getIconSVG = /* @__PURE__ */ __name(async (iconName, customisations, extraAttributes) => {
  let iconData;
  try {
    iconData = await getRegisteredIconData(iconName, customisations?.fallbackPrefix);
  } catch (e) {
    log.error(e);
    iconData = unknownIcon;
  }
  const renderData = iconToSVG(iconData, customisations);
  const svg = iconToHTML(replaceIDs(renderData.body), {
    ...renderData.attributes,
    ...extraAttributes
  });
  return sanitizeText(svg, getConfig());
}, "getIconSVG");
function preprocessMarkdown(markdown, { markdownAutoWrap }) {
  const withoutBR = markdown.replace(/<br\/>/g, `
`);
  const withoutMultipleNewlines = withoutBR.replace(/\n{2,}/g, `
`);
  const withoutExtraSpaces = dedent(withoutMultipleNewlines);
  if (markdownAutoWrap === false) {}
  return withoutExtraSpaces;
}
__name(preprocessMarkdown, "preprocessMarkdown");
function nonMarkdownToLines(nonMarkdownText) {
  return nonMarkdownText.split(/\\n|\n|<br\s*\/?>/gi).map((line) => line.trim().match(/<[^>]+>|[^\s<>]+/g)?.map((word) => ({ content: word, type: "normal" })) ?? []);
}
__name(nonMarkdownToLines, "nonMarkdownToLines");
function markdownToLines(markdown, config = {}) {
  const preprocessedMarkdown = preprocessMarkdown(markdown, config);
  const nodes = k.lexer(preprocessedMarkdown);
  const lines = [[]];
  let currentLine = 0;
  function processNode(node, parentType = "normal") {
    if (node.type === "text") {
      const textLines = node.text.split(`
`);
      textLines.forEach((textLine, index) => {
        if (index !== 0) {
          currentLine++;
          lines.push([]);
        }
        textLine.split(" ").forEach((word) => {
          word = word.replace(/&#39;/g, `'`);
          if (word) {
            lines[currentLine].push({ content: word, type: parentType });
          }
        });
      });
    } else if (node.type === "strong" || node.type === "em") {
      node.tokens.forEach((contentNode) => {
        processNode(contentNode, node.type);
      });
    } else if (node.type === "html") {
      lines[currentLine].push({ content: node.text, type: "normal" });
    }
  }
  __name(processNode, "processNode");
  nodes.forEach((treeNode) => {
    if (treeNode.type === "paragraph") {
      treeNode.tokens?.forEach((contentNode) => {
        processNode(contentNode);
      });
    } else if (treeNode.type === "html") {
      lines[currentLine].push({ content: treeNode.text, type: "normal" });
    } else {
      lines[currentLine].push({ content: treeNode.raw, type: "normal" });
    }
  });
  return lines;
}
__name(markdownToLines, "markdownToLines");
function nonMarkdownToHTML(text) {
  if (!text) {
    return "";
  }
  return `<p>${text.replace(/\\n|\n/g, "<br />")}</p>`;
}
__name(nonMarkdownToHTML, "nonMarkdownToHTML");
function markdownToHTML(markdown, { markdownAutoWrap } = {}) {
  const nodes = k.lexer(markdown);
  function output(node) {
    if (node.type === "text") {
      if (markdownAutoWrap === false) {
        return node.text.replace(/\n */g, "<br/>").replace(/ /g, "&nbsp;");
      }
      return node.text.replace(/\n */g, "<br/>");
    } else if (node.type === "strong") {
      return `<strong>${node.tokens?.map(output).join("")}</strong>`;
    } else if (node.type === "em") {
      return `<em>${node.tokens?.map(output).join("")}</em>`;
    } else if (node.type === "paragraph") {
      return `<p>${node.tokens?.map(output).join("")}</p>`;
    } else if (node.type === "space") {
      return "";
    } else if (node.type === "html") {
      return `${node.text}`;
    } else if (node.type === "escape") {
      return node.text;
    }
    log.warn(`Unsupported markdown: ${node.type}`);
    return node.raw;
  }
  __name(output, "output");
  return nodes.map(output).join("");
}
__name(markdownToHTML, "markdownToHTML");
function splitTextToChars(text) {
  if (Intl.Segmenter) {
    return [...new Intl.Segmenter().segment(text)].map((s) => s.segment);
  }
  return [...text];
}
__name(splitTextToChars, "splitTextToChars");
function splitWordToFitWidth(checkFit, word) {
  const characters = splitTextToChars(word.content);
  return splitWordToFitWidthRecursion(checkFit, [], characters, word.type);
}
__name(splitWordToFitWidth, "splitWordToFitWidth");
function splitWordToFitWidthRecursion(checkFit, usedChars, remainingChars, type) {
  if (remainingChars.length === 0) {
    return [
      { content: usedChars.join(""), type },
      { content: "", type }
    ];
  }
  const [nextChar, ...rest] = remainingChars;
  const newWord = [...usedChars, nextChar];
  if (checkFit([{ content: newWord.join(""), type }])) {
    return splitWordToFitWidthRecursion(checkFit, newWord, rest, type);
  }
  if (usedChars.length === 0 && nextChar) {
    usedChars.push(nextChar);
    remainingChars.shift();
  }
  return [
    { content: usedChars.join(""), type },
    { content: remainingChars.join(""), type }
  ];
}
__name(splitWordToFitWidthRecursion, "splitWordToFitWidthRecursion");
function splitLineToFitWidth(line, checkFit) {
  if (line.some(({ content }) => content.includes(`
`))) {
    throw new Error("splitLineToFitWidth does not support newlines in the line");
  }
  return splitLineToFitWidthRecursion(line, checkFit);
}
__name(splitLineToFitWidth, "splitLineToFitWidth");
function splitLineToFitWidthRecursion(words, checkFit, lines = [], newLine = []) {
  if (words.length === 0) {
    if (newLine.length > 0) {
      lines.push(newLine);
    }
    return lines.length > 0 ? lines : [];
  }
  let joiner = "";
  if (words[0].content === " ") {
    joiner = " ";
    words.shift();
  }
  const nextWord = words.shift() ?? { content: " ", type: "normal" };
  const lineWithNextWord = [...newLine];
  if (joiner !== "") {
    lineWithNextWord.push({ content: joiner, type: "normal" });
  }
  lineWithNextWord.push(nextWord);
  if (checkFit(lineWithNextWord)) {
    return splitLineToFitWidthRecursion(words, checkFit, lines, lineWithNextWord);
  }
  if (newLine.length > 0) {
    lines.push(newLine);
    words.unshift(nextWord);
  } else if (nextWord.content) {
    const [line, rest] = splitWordToFitWidth(checkFit, nextWord);
    lines.push([line]);
    if (rest.content) {
      words.unshift(rest);
    }
  }
  return splitLineToFitWidthRecursion(words, checkFit, lines);
}
__name(splitLineToFitWidthRecursion, "splitLineToFitWidthRecursion");
function applyStyle(dom, styleFn) {
  if (styleFn) {
    dom.attr("style", styleFn);
  }
}
__name(applyStyle, "applyStyle");
var maxSafeSizeForWidth = 16384;
async function addHtmlSpan(element, node, width, classes, addBackground = false, config = getConfig()) {
  const fo = element.append("foreignObject");
  fo.attr("width", `${Math.min(10 * width, maxSafeSizeForWidth)}px`);
  fo.attr("height", `${Math.min(10 * width, maxSafeSizeForWidth)}px`);
  const div = fo.append("xhtml:div");
  const sanitizedLabel = hasKatex(node.label) ? await renderKatexSanitized(node.label.replace(common_default.lineBreakRegex, `
`), config) : sanitizeText(node.label, config);
  const labelClass = node.isNode ? "nodeLabel" : "edgeLabel";
  const span = div.append("span");
  span.html(sanitizedLabel);
  applyStyle(span, node.labelStyle);
  span.attr("class", `${labelClass} ${classes}`);
  applyStyle(div, node.labelStyle);
  div.style("display", "table-cell");
  div.style("white-space", "nowrap");
  div.style("line-height", "1.5");
  if (width !== Number.POSITIVE_INFINITY) {
    div.style("max-width", width + "px");
    div.style("text-align", "center");
  }
  div.attr("xmlns", "http://www.w3.org/1999/xhtml");
  if (addBackground) {
    div.attr("class", "labelBkg");
  }
  let bbox = div.node().getBoundingClientRect();
  if (bbox.width === width) {
    div.style("display", "table");
    div.style("white-space", "break-spaces");
    div.style("width", width + "px");
    bbox = div.node().getBoundingClientRect();
  }
  return fo.node();
}
__name(addHtmlSpan, "addHtmlSpan");
function createTspan(textElement, lineIndex, lineHeight, centerText = false) {
  const tspan = textElement.append("tspan").attr("class", "text-outer-tspan").attr("x", 0).attr("y", lineIndex * lineHeight - 0.1 + "em").attr("dy", lineHeight + "em");
  if (centerText) {
    tspan.attr("text-anchor", "middle");
  }
  return tspan;
}
__name(createTspan, "createTspan");
function computeWidthOfText(parentNode, lineHeight, line) {
  const testElement = parentNode.append("text");
  const testSpan = createTspan(testElement, 1, lineHeight);
  updateTextContentAndStyles(testSpan, line);
  const textLength = testSpan.node().getComputedTextLength();
  testElement.remove();
  return textLength;
}
__name(computeWidthOfText, "computeWidthOfText");
function computeDimensionOfText(parentNode, lineHeight, text) {
  const testElement = parentNode.append("text");
  const testSpan = createTspan(testElement, 1, lineHeight);
  updateTextContentAndStyles(testSpan, [{ content: text, type: "normal" }]);
  const textDimension = testSpan.node()?.getBoundingClientRect();
  if (textDimension) {
    testElement.remove();
  }
  return textDimension;
}
__name(computeDimensionOfText, "computeDimensionOfText");
function createFormattedText(width, g, structuredText, addBackground = false, centerText = false) {
  const lineHeight = 1.1;
  const labelGroup = g.append("g");
  const bkg = labelGroup.insert("rect").attr("class", "background").attr("style", "stroke: none");
  const textElement = labelGroup.append("text").attr("y", "-10.1");
  if (centerText) {
    textElement.attr("text-anchor", "middle");
  }
  let lineIndex = 0;
  for (const line of structuredText) {
    const checkWidth = /* @__PURE__ */ __name((line2) => computeWidthOfText(labelGroup, lineHeight, line2) <= width, "checkWidth");
    const linesUnderWidth = checkWidth(line) ? [line] : splitLineToFitWidth(line, checkWidth);
    for (const preparedLine of linesUnderWidth) {
      const tspan = createTspan(textElement, lineIndex, lineHeight, centerText);
      updateTextContentAndStyles(tspan, preparedLine);
      lineIndex++;
    }
  }
  if (addBackground) {
    const bbox = textElement.node().getBBox();
    const padding = 2;
    bkg.attr("x", bbox.x - padding).attr("y", bbox.y - padding).attr("width", bbox.width + 2 * padding).attr("height", bbox.height + 2 * padding);
    return labelGroup.node();
  } else {
    return textElement.node();
  }
}
__name(createFormattedText, "createFormattedText");
function decodeHTMLEntities(text) {
  const regex2 = /&(amp|lt|gt);/g;
  return text.replace(regex2, (match, entity) => {
    switch (entity) {
      case "amp":
        return "&";
      case "lt":
        return "<";
      case "gt":
        return ">";
      default:
        return match;
    }
  });
}
__name(decodeHTMLEntities, "decodeHTMLEntities");
function updateTextContentAndStyles(tspan, wrappedLine) {
  tspan.text("");
  wrappedLine.forEach((word, index) => {
    const innerTspan = tspan.append("tspan").attr("font-style", word.type === "em" ? "italic" : "normal").attr("class", "text-inner-tspan").attr("font-weight", word.type === "strong" ? "bold" : "normal");
    if (index === 0) {
      innerTspan.text(decodeHTMLEntities(word.content));
    } else {
      innerTspan.text(" " + decodeHTMLEntities(word.content));
    }
  });
}
__name(updateTextContentAndStyles, "updateTextContentAndStyles");
async function replaceIconSubstring(text, config = {}) {
  const pendingReplacements = [];
  text.replace(/(fa[bklrs]?):fa-([\w-]+)/g, (fullMatch, prefix, iconName) => {
    pendingReplacements.push((async () => {
      const registeredIconName = `${prefix}:${iconName}`;
      if (await isIconAvailable(registeredIconName)) {
        return await getIconSVG(registeredIconName, undefined, { class: "label-icon" });
      } else {
        return `<i class='${sanitizeText(fullMatch, config).replace(":", " ")}'></i>`;
      }
    })());
    return fullMatch;
  });
  const replacements = await Promise.all(pendingReplacements);
  return text.replace(/(fa[bklrs]?):fa-([\w-]+)/g, () => replacements.shift() ?? "");
}
__name(replaceIconSubstring, "replaceIconSubstring");
var createText = /* @__PURE__ */ __name(async (el, text = "", {
  style = "",
  isTitle = false,
  classes = "",
  useHtmlLabels = true,
  markdown = true,
  isNode = true,
  width = 200,
  addSvgBackground = false
} = {}, config) => {
  log.debug("XYZ createText", text, style, isTitle, classes, useHtmlLabels, isNode, "addSvgBackground: ", addSvgBackground);
  if (useHtmlLabels) {
    const htmlText = markdown ? markdownToHTML(text, config) : nonMarkdownToHTML(text);
    const decodedReplacedText = await replaceIconSubstring(decodeEntities(htmlText), config);
    const inputForKatex = text.replace(/\\\\/g, "\\");
    const node = {
      isNode,
      label: hasKatex(text) ? inputForKatex : decodedReplacedText,
      labelStyle: style.replace("fill:", "color:")
    };
    const vertexNode = await addHtmlSpan(el, node, width, classes, addSvgBackground, config);
    return vertexNode;
  } else {
    const sanitizeBR = decodeEntities(text.replace(/<br\s*\/?>/g, "<br/>"));
    const structuredText = markdown ? markdownToLines(sanitizeBR.replace("<br>", "<br/>"), config) : nonMarkdownToLines(sanitizeBR);
    const svgLabel = createFormattedText(width, el, structuredText, text ? addSvgBackground : false, !isNode);
    if (isNode) {
      if (/stroke:/.exec(style)) {
        style = style.replace("stroke:", "lineColor:");
      }
      const nodeLabelTextStyle = style.replace(/stroke:[^;]+;?/g, "").replace(/stroke-width:[^;]+;?/g, "").replace(/fill:[^;]+;?/g, "").replace(/color:/g, "fill:");
      select_default(svgLabel).attr("style", nodeLabelTextStyle);
    } else {
      const edgeLabelRectStyle = style.replace(/stroke:[^;]+;?/g, "").replace(/stroke-width:[^;]+;?/g, "").replace(/fill:[^;]+;?/g, "").replace(/background:/g, "fill:");
      select_default(svgLabel).select("rect").attr("style", edgeLabelRectStyle.replace(/background:/g, "fill:"));
      const edgeLabelTextStyle = style.replace(/stroke:[^;]+;?/g, "").replace(/stroke-width:[^;]+;?/g, "").replace(/fill:[^;]+;?/g, "").replace(/color:/g, "fill:");
      select_default(svgLabel).select("text").attr("style", edgeLabelTextStyle);
    }
    if (isTitle) {
      select_default(svgLabel).selectAll("tspan.text-outer-tspan").classed("title-row", true);
    } else {
      select_default(svgLabel).selectAll("tspan.text-outer-tspan").classed("row", true);
    }
    return svgLabel;
  }
}, "createText");

export { dedent, unknownIcon, registerIconPacks, getIconSVG, computeDimensionOfText, createText };

//# debugId=E1AC60E50A127B5F64756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BpY29uaWZ5L3V0aWxzL2xpYi9pY29uL25hbWUuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BpY29uaWZ5L3V0aWxzL2xpYi9pY29uL2RlZmF1bHRzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9AaWNvbmlmeS91dGlscy9saWIvaWNvbi90cmFuc2Zvcm1hdGlvbnMuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BpY29uaWZ5L3V0aWxzL2xpYi9pY29uL21lcmdlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9AaWNvbmlmeS91dGlscy9saWIvaWNvbi1zZXQvdHJlZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQGljb25pZnkvdXRpbHMvbGliL2ljb24tc2V0L2dldC1pY29uLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9AaWNvbmlmeS91dGlscy9saWIvY3VzdG9taXNhdGlvbnMvZGVmYXVsdHMuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BpY29uaWZ5L3V0aWxzL2xpYi9zdmcvc2l6ZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQGljb25pZnkvdXRpbHMvbGliL3N2Zy9kZWZzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9AaWNvbmlmeS91dGlscy9saWIvc3ZnL2J1aWxkLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9AaWNvbmlmeS91dGlscy9saWIvc3ZnL2lkLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9AaWNvbmlmeS91dGlscy9saWIvc3ZnL2h0bWwuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21hcmtlZC9saWIvbWFya2VkLmVzbS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvdHMtZGVkZW50L2VzbS9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbWVybWFpZC9kaXN0L2NodW5rcy9tZXJtYWlkLmNvcmUvY2h1bmstTzVDQkVMNk8ubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWwogICAgIi8qKlxuKiBFeHByZXNzaW9uIHRvIHRlc3QgcGFydCBvZiBpY29uIG5hbWUuXG4qXG4qIFVzZWQgd2hlbiBsb2FkaW5nIGljb25zIGZyb20gSWNvbmlmeSBBUEkgZHVlIHRvIHByb2plY3QgbmFtaW5nIGNvbnZlbnNpb24uXG4qIElnbm9yZWQgd2hlbiB1c2luZyBjdXN0b20gaWNvbiBzZXRzIC0gY29udmVuc2lvbiBkb2VzIG5vdCBhcHBseS5cbiovXG5jb25zdCBtYXRjaEljb25OYW1lID0gL15bYS16MC05XSsoLVthLXowLTldKykqJC87XG4vKipcbiogQ29udmVydCBzdHJpbmcgaWNvbiBuYW1lIHRvIEljb25pZnlJY29uTmFtZSBvYmplY3QuXG4qL1xuY29uc3Qgc3RyaW5nVG9JY29uID0gKHZhbHVlLCB2YWxpZGF0ZSwgYWxsb3dTaW1wbGVOYW1lLCBwcm92aWRlciA9IFwiXCIpID0+IHtcblx0Y29uc3QgY29sb25TZXBhcmF0ZWQgPSB2YWx1ZS5zcGxpdChcIjpcIik7XG5cdGlmICh2YWx1ZS5zbGljZSgwLCAxKSA9PT0gXCJAXCIpIHtcblx0XHRpZiAoY29sb25TZXBhcmF0ZWQubGVuZ3RoIDwgMiB8fCBjb2xvblNlcGFyYXRlZC5sZW5ndGggPiAzKSByZXR1cm4gbnVsbDtcblx0XHRwcm92aWRlciA9IGNvbG9uU2VwYXJhdGVkLnNoaWZ0KCkuc2xpY2UoMSk7XG5cdH1cblx0aWYgKGNvbG9uU2VwYXJhdGVkLmxlbmd0aCA+IDMgfHwgIWNvbG9uU2VwYXJhdGVkLmxlbmd0aCkgcmV0dXJuIG51bGw7XG5cdGlmIChjb2xvblNlcGFyYXRlZC5sZW5ndGggPiAxKSB7XG5cdFx0Y29uc3QgbmFtZSA9IGNvbG9uU2VwYXJhdGVkLnBvcCgpO1xuXHRcdGNvbnN0IHByZWZpeCA9IGNvbG9uU2VwYXJhdGVkLnBvcCgpO1xuXHRcdGNvbnN0IHJlc3VsdCA9IHtcblx0XHRcdHByb3ZpZGVyOiBjb2xvblNlcGFyYXRlZC5sZW5ndGggPiAwID8gY29sb25TZXBhcmF0ZWRbMF0gOiBwcm92aWRlcixcblx0XHRcdHByZWZpeCxcblx0XHRcdG5hbWVcblx0XHR9O1xuXHRcdHJldHVybiB2YWxpZGF0ZSAmJiAhdmFsaWRhdGVJY29uTmFtZShyZXN1bHQpID8gbnVsbCA6IHJlc3VsdDtcblx0fVxuXHRjb25zdCBuYW1lID0gY29sb25TZXBhcmF0ZWRbMF07XG5cdGNvbnN0IGRhc2hTZXBhcmF0ZWQgPSBuYW1lLnNwbGl0KFwiLVwiKTtcblx0aWYgKGRhc2hTZXBhcmF0ZWQubGVuZ3RoID4gMSkge1xuXHRcdGNvbnN0IHJlc3VsdCA9IHtcblx0XHRcdHByb3ZpZGVyLFxuXHRcdFx0cHJlZml4OiBkYXNoU2VwYXJhdGVkLnNoaWZ0KCksXG5cdFx0XHRuYW1lOiBkYXNoU2VwYXJhdGVkLmpvaW4oXCItXCIpXG5cdFx0fTtcblx0XHRyZXR1cm4gdmFsaWRhdGUgJiYgIXZhbGlkYXRlSWNvbk5hbWUocmVzdWx0KSA/IG51bGwgOiByZXN1bHQ7XG5cdH1cblx0aWYgKGFsbG93U2ltcGxlTmFtZSAmJiBwcm92aWRlciA9PT0gXCJcIikge1xuXHRcdGNvbnN0IHJlc3VsdCA9IHtcblx0XHRcdHByb3ZpZGVyLFxuXHRcdFx0cHJlZml4OiBcIlwiLFxuXHRcdFx0bmFtZVxuXHRcdH07XG5cdFx0cmV0dXJuIHZhbGlkYXRlICYmICF2YWxpZGF0ZUljb25OYW1lKHJlc3VsdCwgYWxsb3dTaW1wbGVOYW1lKSA/IG51bGwgOiByZXN1bHQ7XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuLyoqXG4qIENoZWNrIGlmIGljb24gaXMgdmFsaWQuXG4qXG4qIFRoaXMgZnVuY3Rpb24gaXMgbm90IHBhcnQgb2Ygc3RyaW5nVG9JY29uIGJlY2F1c2UgdmFsaWRhdGlvbiBpcyBub3QgbmVlZGVkIGZvciBtb3N0IGNvZGUuXG4qL1xuY29uc3QgdmFsaWRhdGVJY29uTmFtZSA9IChpY29uLCBhbGxvd1NpbXBsZU5hbWUpID0+IHtcblx0aWYgKCFpY29uKSByZXR1cm4gZmFsc2U7XG5cdHJldHVybiAhISgoYWxsb3dTaW1wbGVOYW1lICYmIGljb24ucHJlZml4ID09PSBcIlwiIHx8ICEhaWNvbi5wcmVmaXgpICYmICEhaWNvbi5uYW1lKTtcbn07XG5leHBvcnQgeyBtYXRjaEljb25OYW1lLCBzdHJpbmdUb0ljb24sIHZhbGlkYXRlSWNvbk5hbWUgfTtcbiIsCiAgICAiLyoqIERlZmF1bHQgdmFsdWVzIGZvciBkaW1lbnNpb25zICovXG5jb25zdCBkZWZhdWx0SWNvbkRpbWVuc2lvbnMgPSBPYmplY3QuZnJlZXplKHtcblx0bGVmdDogMCxcblx0dG9wOiAwLFxuXHR3aWR0aDogMTYsXG5cdGhlaWdodDogMTZcbn0pO1xuLyoqIERlZmF1bHQgdmFsdWVzIGZvciB0cmFuc2Zvcm1hdGlvbnMgKi9cbmNvbnN0IGRlZmF1bHRJY29uVHJhbnNmb3JtYXRpb25zID0gT2JqZWN0LmZyZWV6ZSh7XG5cdHJvdGF0ZTogMCxcblx0dkZsaXA6IGZhbHNlLFxuXHRoRmxpcDogZmFsc2Vcbn0pO1xuLyoqIERlZmF1bHQgdmFsdWVzIGZvciBhbGwgb3B0aW9uYWwgSWNvbmlmeUljb24gcHJvcGVydGllcyAqL1xuY29uc3QgZGVmYXVsdEljb25Qcm9wcyA9IE9iamVjdC5mcmVlemUoe1xuXHQuLi5kZWZhdWx0SWNvbkRpbWVuc2lvbnMsXG5cdC4uLmRlZmF1bHRJY29uVHJhbnNmb3JtYXRpb25zXG59KTtcbi8qKiBEZWZhdWx0IHZhbHVlcyBmb3IgYWxsIHByb3BlcnRpZXMgdXNlZCBpbiBFeHRlbmRlZEljb25pZnlJY29uICovXG5jb25zdCBkZWZhdWx0RXh0ZW5kZWRJY29uUHJvcHMgPSBPYmplY3QuZnJlZXplKHtcblx0Li4uZGVmYXVsdEljb25Qcm9wcyxcblx0Ym9keTogXCJcIixcblx0aGlkZGVuOiBmYWxzZVxufSk7XG5leHBvcnQgeyBkZWZhdWx0RXh0ZW5kZWRJY29uUHJvcHMsIGRlZmF1bHRJY29uRGltZW5zaW9ucywgZGVmYXVsdEljb25Qcm9wcywgZGVmYXVsdEljb25UcmFuc2Zvcm1hdGlvbnMgfTtcbiIsCiAgICAiLyoqXG4qIE1lcmdlIHRyYW5zZm9ybWF0aW9uc1xuKi9cbmZ1bmN0aW9uIG1lcmdlSWNvblRyYW5zZm9ybWF0aW9ucyhvYmoxLCBvYmoyKSB7XG5cdGNvbnN0IHJlc3VsdCA9IHt9O1xuXHRpZiAoIW9iajEuaEZsaXAgIT09ICFvYmoyLmhGbGlwKSByZXN1bHQuaEZsaXAgPSB0cnVlO1xuXHRpZiAoIW9iajEudkZsaXAgIT09ICFvYmoyLnZGbGlwKSByZXN1bHQudkZsaXAgPSB0cnVlO1xuXHRjb25zdCByb3RhdGUgPSAoKG9iajEucm90YXRlIHx8IDApICsgKG9iajIucm90YXRlIHx8IDApKSAlIDQ7XG5cdGlmIChyb3RhdGUpIHJlc3VsdC5yb3RhdGUgPSByb3RhdGU7XG5cdHJldHVybiByZXN1bHQ7XG59XG5leHBvcnQgeyBtZXJnZUljb25UcmFuc2Zvcm1hdGlvbnMgfTtcbiIsCiAgICAiaW1wb3J0IHsgZGVmYXVsdEV4dGVuZGVkSWNvblByb3BzLCBkZWZhdWx0SWNvblRyYW5zZm9ybWF0aW9ucyB9IGZyb20gXCIuL2RlZmF1bHRzLmpzXCI7XG5pbXBvcnQgeyBtZXJnZUljb25UcmFuc2Zvcm1hdGlvbnMgfSBmcm9tIFwiLi90cmFuc2Zvcm1hdGlvbnMuanNcIjtcbi8qKlxuKiBNZXJnZSBpY29uIGFuZCBhbGlhc1xuKlxuKiBDYW4gYWxzbyBiZSB1c2VkIHRvIG1lcmdlIGRlZmF1bHQgdmFsdWVzIGFuZCBpY29uXG4qL1xuZnVuY3Rpb24gbWVyZ2VJY29uRGF0YShwYXJlbnQsIGNoaWxkKSB7XG5cdGNvbnN0IHJlc3VsdCA9IG1lcmdlSWNvblRyYW5zZm9ybWF0aW9ucyhwYXJlbnQsIGNoaWxkKTtcblx0Zm9yIChjb25zdCBrZXkgaW4gZGVmYXVsdEV4dGVuZGVkSWNvblByb3BzKSBpZiAoa2V5IGluIGRlZmF1bHRJY29uVHJhbnNmb3JtYXRpb25zKSB7XG5cdFx0aWYgKGtleSBpbiBwYXJlbnQgJiYgIShrZXkgaW4gcmVzdWx0KSkgcmVzdWx0W2tleV0gPSBkZWZhdWx0SWNvblRyYW5zZm9ybWF0aW9uc1trZXldO1xuXHR9IGVsc2UgaWYgKGtleSBpbiBjaGlsZCkgcmVzdWx0W2tleV0gPSBjaGlsZFtrZXldO1xuXHRlbHNlIGlmIChrZXkgaW4gcGFyZW50KSByZXN1bHRba2V5XSA9IHBhcmVudFtrZXldO1xuXHRyZXR1cm4gcmVzdWx0O1xufVxuZXhwb3J0IHsgbWVyZ2VJY29uRGF0YSB9O1xuIiwKICAgICIvKipcbiogUmVzb2x2ZSBpY29uIHNldCBpY29uc1xuKlxuKiBSZXR1cm5zIHBhcmVudCBpY29uIGZvciBlYWNoIGljb25cbiovXG5mdW5jdGlvbiBnZXRJY29uc1RyZWUoZGF0YSwgbmFtZXMpIHtcblx0Y29uc3QgaWNvbnMgPSBkYXRhLmljb25zO1xuXHRjb25zdCBhbGlhc2VzID0gZGF0YS5hbGlhc2VzIHx8IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cdGNvbnN0IHJlc29sdmVkID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblx0ZnVuY3Rpb24gcmVzb2x2ZShuYW1lKSB7XG5cdFx0aWYgKGljb25zW25hbWVdKSByZXR1cm4gcmVzb2x2ZWRbbmFtZV0gPSBbXTtcblx0XHRpZiAoIShuYW1lIGluIHJlc29sdmVkKSkge1xuXHRcdFx0cmVzb2x2ZWRbbmFtZV0gPSBudWxsO1xuXHRcdFx0Y29uc3QgcGFyZW50ID0gYWxpYXNlc1tuYW1lXSAmJiBhbGlhc2VzW25hbWVdLnBhcmVudDtcblx0XHRcdGNvbnN0IHZhbHVlID0gcGFyZW50ICYmIHJlc29sdmUocGFyZW50KTtcblx0XHRcdGlmICh2YWx1ZSkgcmVzb2x2ZWRbbmFtZV0gPSBbcGFyZW50XS5jb25jYXQodmFsdWUpO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzb2x2ZWRbbmFtZV07XG5cdH1cblx0KG5hbWVzIHx8IE9iamVjdC5rZXlzKGljb25zKS5jb25jYXQoT2JqZWN0LmtleXMoYWxpYXNlcykpKS5mb3JFYWNoKHJlc29sdmUpO1xuXHRyZXR1cm4gcmVzb2x2ZWQ7XG59XG5leHBvcnQgeyBnZXRJY29uc1RyZWUgfTtcbiIsCiAgICAiaW1wb3J0IHsgbWVyZ2VJY29uRGF0YSB9IGZyb20gXCIuLi9pY29uL21lcmdlLmpzXCI7XG5pbXBvcnQgeyBnZXRJY29uc1RyZWUgfSBmcm9tIFwiLi90cmVlLmpzXCI7XG4vKipcbiogR2V0IGljb24gZGF0YSwgdXNpbmcgcHJlcGFyZWQgYWxpYXNlcyB0cmVlXG4qL1xuZnVuY3Rpb24gaW50ZXJuYWxHZXRJY29uRGF0YShkYXRhLCBuYW1lLCB0cmVlKSB7XG5cdGNvbnN0IGljb25zID0gZGF0YS5pY29ucztcblx0Y29uc3QgYWxpYXNlcyA9IGRhdGEuYWxpYXNlcyB8fCBPYmplY3QuY3JlYXRlKG51bGwpO1xuXHRsZXQgY3VycmVudFByb3BzID0ge307XG5cdGZ1bmN0aW9uIHBhcnNlKG5hbWUpIHtcblx0XHRjdXJyZW50UHJvcHMgPSBtZXJnZUljb25EYXRhKGljb25zW25hbWVdIHx8IGFsaWFzZXNbbmFtZV0sIGN1cnJlbnRQcm9wcyk7XG5cdH1cblx0cGFyc2UobmFtZSk7XG5cdHRyZWUuZm9yRWFjaChwYXJzZSk7XG5cdHJldHVybiBtZXJnZUljb25EYXRhKGRhdGEsIGN1cnJlbnRQcm9wcyk7XG59XG4vKipcbiogR2V0IGRhdGEgZm9yIGljb25cbiovXG5mdW5jdGlvbiBnZXRJY29uRGF0YShkYXRhLCBuYW1lKSB7XG5cdGlmIChkYXRhLmljb25zW25hbWVdKSByZXR1cm4gaW50ZXJuYWxHZXRJY29uRGF0YShkYXRhLCBuYW1lLCBbXSk7XG5cdGNvbnN0IHRyZWUgPSBnZXRJY29uc1RyZWUoZGF0YSwgW25hbWVdKVtuYW1lXTtcblx0cmV0dXJuIHRyZWUgPyBpbnRlcm5hbEdldEljb25EYXRhKGRhdGEsIG5hbWUsIHRyZWUpIDogbnVsbDtcbn1cbmV4cG9ydCB7IGdldEljb25EYXRhLCBpbnRlcm5hbEdldEljb25EYXRhIH07XG4iLAogICAgImltcG9ydCB7IGRlZmF1bHRJY29uVHJhbnNmb3JtYXRpb25zIH0gZnJvbSBcIi4uL2ljb24vZGVmYXVsdHMuanNcIjtcbi8qKlxuKiBEZWZhdWx0IGljb24gY3VzdG9taXNhdGlvbnMgdmFsdWVzXG4qL1xuY29uc3QgZGVmYXVsdEljb25TaXplQ3VzdG9taXNhdGlvbnMgPSBPYmplY3QuZnJlZXplKHtcblx0d2lkdGg6IG51bGwsXG5cdGhlaWdodDogbnVsbFxufSk7XG5jb25zdCBkZWZhdWx0SWNvbkN1c3RvbWlzYXRpb25zID0gT2JqZWN0LmZyZWV6ZSh7XG5cdC4uLmRlZmF1bHRJY29uU2l6ZUN1c3RvbWlzYXRpb25zLFxuXHQuLi5kZWZhdWx0SWNvblRyYW5zZm9ybWF0aW9uc1xufSk7XG5leHBvcnQgeyBkZWZhdWx0SWNvbkN1c3RvbWlzYXRpb25zLCBkZWZhdWx0SWNvblNpemVDdXN0b21pc2F0aW9ucyB9O1xuIiwKICAgICIvKipcbiogUmVndWxhciBleHByZXNzaW9ucyBmb3IgY2FsY3VsYXRpbmcgZGltZW5zaW9uc1xuKi9cbmNvbnN0IHVuaXRzU3BsaXQgPSAvKC0/WzAtOS5dKlswLTldK1swLTkuXSopL2c7XG5jb25zdCB1bml0c1Rlc3QgPSAvXi0/WzAtOS5dKlswLTldK1swLTkuXSokL2c7XG5mdW5jdGlvbiBjYWxjdWxhdGVTaXplKHNpemUsIHJhdGlvLCBwcmVjaXNpb24pIHtcblx0aWYgKHJhdGlvID09PSAxKSByZXR1cm4gc2l6ZTtcblx0cHJlY2lzaW9uID0gcHJlY2lzaW9uIHx8IDEwMDtcblx0aWYgKHR5cGVvZiBzaXplID09PSBcIm51bWJlclwiKSByZXR1cm4gTWF0aC5jZWlsKHNpemUgKiByYXRpbyAqIHByZWNpc2lvbikgLyBwcmVjaXNpb247XG5cdGlmICh0eXBlb2Ygc2l6ZSAhPT0gXCJzdHJpbmdcIikgcmV0dXJuIHNpemU7XG5cdGNvbnN0IG9sZFBhcnRzID0gc2l6ZS5zcGxpdCh1bml0c1NwbGl0KTtcblx0aWYgKG9sZFBhcnRzID09PSBudWxsIHx8ICFvbGRQYXJ0cy5sZW5ndGgpIHJldHVybiBzaXplO1xuXHRjb25zdCBuZXdQYXJ0cyA9IFtdO1xuXHRsZXQgY29kZSA9IG9sZFBhcnRzLnNoaWZ0KCk7XG5cdGxldCBpc051bWJlciA9IHVuaXRzVGVzdC50ZXN0KGNvZGUpO1xuXHR3aGlsZSAodHJ1ZSkge1xuXHRcdGlmIChpc051bWJlcikge1xuXHRcdFx0Y29uc3QgbnVtID0gcGFyc2VGbG9hdChjb2RlKTtcblx0XHRcdGlmIChpc05hTihudW0pKSBuZXdQYXJ0cy5wdXNoKGNvZGUpO1xuXHRcdFx0ZWxzZSBuZXdQYXJ0cy5wdXNoKE1hdGguY2VpbChudW0gKiByYXRpbyAqIHByZWNpc2lvbikgLyBwcmVjaXNpb24pO1xuXHRcdH0gZWxzZSBuZXdQYXJ0cy5wdXNoKGNvZGUpO1xuXHRcdGNvZGUgPSBvbGRQYXJ0cy5zaGlmdCgpO1xuXHRcdGlmIChjb2RlID09PSB2b2lkIDApIHJldHVybiBuZXdQYXJ0cy5qb2luKFwiXCIpO1xuXHRcdGlzTnVtYmVyID0gIWlzTnVtYmVyO1xuXHR9XG59XG5leHBvcnQgeyBjYWxjdWxhdGVTaXplIH07XG4iLAogICAgImZ1bmN0aW9uIHNwbGl0U1ZHRGVmcyhjb250ZW50LCB0YWcgPSBcImRlZnNcIikge1xuXHRsZXQgZGVmcyA9IFwiXCI7XG5cdGNvbnN0IGluZGV4ID0gY29udGVudC5pbmRleE9mKFwiPFwiICsgdGFnKTtcblx0d2hpbGUgKGluZGV4ID49IDApIHtcblx0XHRjb25zdCBzdGFydCA9IGNvbnRlbnQuaW5kZXhPZihcIj5cIiwgaW5kZXgpO1xuXHRcdGNvbnN0IGVuZCA9IGNvbnRlbnQuaW5kZXhPZihcIjwvXCIgKyB0YWcpO1xuXHRcdGlmIChzdGFydCA9PT0gLTEgfHwgZW5kID09PSAtMSkgYnJlYWs7XG5cdFx0Y29uc3QgZW5kRW5kID0gY29udGVudC5pbmRleE9mKFwiPlwiLCBlbmQpO1xuXHRcdGlmIChlbmRFbmQgPT09IC0xKSBicmVhaztcblx0XHRkZWZzICs9IGNvbnRlbnQuc2xpY2Uoc3RhcnQgKyAxLCBlbmQpLnRyaW0oKTtcblx0XHRjb250ZW50ID0gY29udGVudC5zbGljZSgwLCBpbmRleCkudHJpbSgpICsgY29udGVudC5zbGljZShlbmRFbmQgKyAxKTtcblx0fVxuXHRyZXR1cm4ge1xuXHRcdGRlZnMsXG5cdFx0Y29udGVudFxuXHR9O1xufVxuLyoqXG4qIE1lcmdlIGRlZnMgYW5kIGNvbnRlbnRcbiovXG5mdW5jdGlvbiBtZXJnZURlZnNBbmRDb250ZW50KGRlZnMsIGNvbnRlbnQpIHtcblx0cmV0dXJuIGRlZnMgPyBcIjxkZWZzPlwiICsgZGVmcyArIFwiPC9kZWZzPlwiICsgY29udGVudCA6IGNvbnRlbnQ7XG59XG4vKipcbiogV3JhcCBTVkcgY29udGVudCwgd2l0aG91dCB3cmFwcGluZyBkZWZpbml0aW9uc1xuKi9cbmZ1bmN0aW9uIHdyYXBTVkdDb250ZW50KGJvZHksIHN0YXJ0LCBlbmQpIHtcblx0Y29uc3Qgc3BsaXQgPSBzcGxpdFNWR0RlZnMoYm9keSk7XG5cdHJldHVybiBtZXJnZURlZnNBbmRDb250ZW50KHNwbGl0LmRlZnMsIHN0YXJ0ICsgc3BsaXQuY29udGVudCArIGVuZCk7XG59XG5leHBvcnQgeyBtZXJnZURlZnNBbmRDb250ZW50LCBzcGxpdFNWR0RlZnMsIHdyYXBTVkdDb250ZW50IH07XG4iLAogICAgImltcG9ydCB7IGRlZmF1bHRJY29uUHJvcHMgfSBmcm9tIFwiLi4vaWNvbi9kZWZhdWx0cy5qc1wiO1xuaW1wb3J0IHsgZGVmYXVsdEljb25DdXN0b21pc2F0aW9ucyB9IGZyb20gXCIuLi9jdXN0b21pc2F0aW9ucy9kZWZhdWx0cy5qc1wiO1xuaW1wb3J0IHsgY2FsY3VsYXRlU2l6ZSB9IGZyb20gXCIuL3NpemUuanNcIjtcbmltcG9ydCB7IHdyYXBTVkdDb250ZW50IH0gZnJvbSBcIi4vZGVmcy5qc1wiO1xuLyoqXG4qIENoZWNrIGlmIHZhbHVlIHNob3VsZCBiZSB1bnNldC4gQWxsb3dzIG11bHRpcGxlIGtleXdvcmRzXG4qL1xuY29uc3QgaXNVbnNldEtleXdvcmQgPSAodmFsdWUpID0+IHZhbHVlID09PSBcInVuc2V0XCIgfHwgdmFsdWUgPT09IFwidW5kZWZpbmVkXCIgfHwgdmFsdWUgPT09IFwibm9uZVwiO1xuLyoqXG4qIEdldCBTVkcgYXR0cmlidXRlcyBhbmQgY29udGVudCBmcm9tIGljb24gKyBjdXN0b21pc2F0aW9uc1xuKlxuKiBEb2VzIG5vdCBnZW5lcmF0ZSBzdHlsZSB0byBtYWtlIGl0IGNvbXBhdGlibGUgd2l0aCBmcmFtZXdvcmtzIHRoYXQgdXNlIG9iamVjdHMgZm9yIHN0eWxlLCBzdWNoIGFzIFJlYWN0LlxuKiBJbnN0ZWFkLCBpdCBnZW5lcmF0ZXMgJ2lubGluZScgdmFsdWUuIElmIHRydWUsIHJlbmRlcmluZyBlbmdpbmUgc2hvdWxkIGFkZCB2ZXJ0aWNhbEFsaWduOiAtMC4xMjVlbSB0byBpY29uLlxuKlxuKiBDdXN0b21pc2F0aW9ucyBzaG91bGQgYmUgbm9ybWFsaXNlZCBieSBwbGF0Zm9ybSBzcGVjaWZpYyBwYXJzZXIuXG4qIFJlc3VsdCBzaG91bGQgYmUgY29udmVydGVkIHRvIDxzdmc+IGJ5IHBsYXRmb3JtIHNwZWNpZmljIHBhcnNlci5cbiogVXNlIHJlcGxhY2VJRHMgdG8gZ2VuZXJhdGUgdW5pcXVlIElEcyBmb3IgYm9keS5cbiovXG5mdW5jdGlvbiBpY29uVG9TVkcoaWNvbiwgY3VzdG9taXNhdGlvbnMpIHtcblx0Y29uc3QgZnVsbEljb24gPSB7XG5cdFx0Li4uZGVmYXVsdEljb25Qcm9wcyxcblx0XHQuLi5pY29uXG5cdH07XG5cdGNvbnN0IGZ1bGxDdXN0b21pc2F0aW9ucyA9IHtcblx0XHQuLi5kZWZhdWx0SWNvbkN1c3RvbWlzYXRpb25zLFxuXHRcdC4uLmN1c3RvbWlzYXRpb25zXG5cdH07XG5cdGNvbnN0IGJveCA9IHtcblx0XHRsZWZ0OiBmdWxsSWNvbi5sZWZ0LFxuXHRcdHRvcDogZnVsbEljb24udG9wLFxuXHRcdHdpZHRoOiBmdWxsSWNvbi53aWR0aCxcblx0XHRoZWlnaHQ6IGZ1bGxJY29uLmhlaWdodFxuXHR9O1xuXHRsZXQgYm9keSA9IGZ1bGxJY29uLmJvZHk7XG5cdFtmdWxsSWNvbiwgZnVsbEN1c3RvbWlzYXRpb25zXS5mb3JFYWNoKChwcm9wcykgPT4ge1xuXHRcdGNvbnN0IHRyYW5zZm9ybWF0aW9ucyA9IFtdO1xuXHRcdGNvbnN0IGhGbGlwID0gcHJvcHMuaEZsaXA7XG5cdFx0Y29uc3QgdkZsaXAgPSBwcm9wcy52RmxpcDtcblx0XHRsZXQgcm90YXRpb24gPSBwcm9wcy5yb3RhdGU7XG5cdFx0aWYgKGhGbGlwKSBpZiAodkZsaXApIHJvdGF0aW9uICs9IDI7XG5cdFx0ZWxzZSB7XG5cdFx0XHR0cmFuc2Zvcm1hdGlvbnMucHVzaChcInRyYW5zbGF0ZShcIiArIChib3gud2lkdGggKyBib3gubGVmdCkudG9TdHJpbmcoKSArIFwiIFwiICsgKDAgLSBib3gudG9wKS50b1N0cmluZygpICsgXCIpXCIpO1xuXHRcdFx0dHJhbnNmb3JtYXRpb25zLnB1c2goXCJzY2FsZSgtMSAxKVwiKTtcblx0XHRcdGJveC50b3AgPSBib3gubGVmdCA9IDA7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKHZGbGlwKSB7XG5cdFx0XHR0cmFuc2Zvcm1hdGlvbnMucHVzaChcInRyYW5zbGF0ZShcIiArICgwIC0gYm94LmxlZnQpLnRvU3RyaW5nKCkgKyBcIiBcIiArIChib3guaGVpZ2h0ICsgYm94LnRvcCkudG9TdHJpbmcoKSArIFwiKVwiKTtcblx0XHRcdHRyYW5zZm9ybWF0aW9ucy5wdXNoKFwic2NhbGUoMSAtMSlcIik7XG5cdFx0XHRib3gudG9wID0gYm94LmxlZnQgPSAwO1xuXHRcdH1cblx0XHRsZXQgdGVtcFZhbHVlO1xuXHRcdGlmIChyb3RhdGlvbiA8IDApIHJvdGF0aW9uIC09IE1hdGguZmxvb3Iocm90YXRpb24gLyA0KSAqIDQ7XG5cdFx0cm90YXRpb24gPSByb3RhdGlvbiAlIDQ7XG5cdFx0c3dpdGNoIChyb3RhdGlvbikge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0ZW1wVmFsdWUgPSBib3guaGVpZ2h0IC8gMiArIGJveC50b3A7XG5cdFx0XHRcdHRyYW5zZm9ybWF0aW9ucy51bnNoaWZ0KFwicm90YXRlKDkwIFwiICsgdGVtcFZhbHVlLnRvU3RyaW5nKCkgKyBcIiBcIiArIHRlbXBWYWx1ZS50b1N0cmluZygpICsgXCIpXCIpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMjpcblx0XHRcdFx0dHJhbnNmb3JtYXRpb25zLnVuc2hpZnQoXCJyb3RhdGUoMTgwIFwiICsgKGJveC53aWR0aCAvIDIgKyBib3gubGVmdCkudG9TdHJpbmcoKSArIFwiIFwiICsgKGJveC5oZWlnaHQgLyAyICsgYm94LnRvcCkudG9TdHJpbmcoKSArIFwiKVwiKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDM6XG5cdFx0XHRcdHRlbXBWYWx1ZSA9IGJveC53aWR0aCAvIDIgKyBib3gubGVmdDtcblx0XHRcdFx0dHJhbnNmb3JtYXRpb25zLnVuc2hpZnQoXCJyb3RhdGUoLTkwIFwiICsgdGVtcFZhbHVlLnRvU3RyaW5nKCkgKyBcIiBcIiArIHRlbXBWYWx1ZS50b1N0cmluZygpICsgXCIpXCIpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdFx0aWYgKHJvdGF0aW9uICUgMiA9PT0gMSkge1xuXHRcdFx0aWYgKGJveC5sZWZ0ICE9PSBib3gudG9wKSB7XG5cdFx0XHRcdHRlbXBWYWx1ZSA9IGJveC5sZWZ0O1xuXHRcdFx0XHRib3gubGVmdCA9IGJveC50b3A7XG5cdFx0XHRcdGJveC50b3AgPSB0ZW1wVmFsdWU7XG5cdFx0XHR9XG5cdFx0XHRpZiAoYm94LndpZHRoICE9PSBib3guaGVpZ2h0KSB7XG5cdFx0XHRcdHRlbXBWYWx1ZSA9IGJveC53aWR0aDtcblx0XHRcdFx0Ym94LndpZHRoID0gYm94LmhlaWdodDtcblx0XHRcdFx0Ym94LmhlaWdodCA9IHRlbXBWYWx1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHRyYW5zZm9ybWF0aW9ucy5sZW5ndGgpIGJvZHkgPSB3cmFwU1ZHQ29udGVudChib2R5LCBcIjxnIHRyYW5zZm9ybT1cXFwiXCIgKyB0cmFuc2Zvcm1hdGlvbnMuam9pbihcIiBcIikgKyBcIlxcXCI+XCIsIFwiPC9nPlwiKTtcblx0fSk7XG5cdGNvbnN0IGN1c3RvbWlzYXRpb25zV2lkdGggPSBmdWxsQ3VzdG9taXNhdGlvbnMud2lkdGg7XG5cdGNvbnN0IGN1c3RvbWlzYXRpb25zSGVpZ2h0ID0gZnVsbEN1c3RvbWlzYXRpb25zLmhlaWdodDtcblx0Y29uc3QgYm94V2lkdGggPSBib3gud2lkdGg7XG5cdGNvbnN0IGJveEhlaWdodCA9IGJveC5oZWlnaHQ7XG5cdGxldCB3aWR0aDtcblx0bGV0IGhlaWdodDtcblx0aWYgKGN1c3RvbWlzYXRpb25zV2lkdGggPT09IG51bGwpIHtcblx0XHRoZWlnaHQgPSBjdXN0b21pc2F0aW9uc0hlaWdodCA9PT0gbnVsbCA/IFwiMWVtXCIgOiBjdXN0b21pc2F0aW9uc0hlaWdodCA9PT0gXCJhdXRvXCIgPyBib3hIZWlnaHQgOiBjdXN0b21pc2F0aW9uc0hlaWdodDtcblx0XHR3aWR0aCA9IGNhbGN1bGF0ZVNpemUoaGVpZ2h0LCBib3hXaWR0aCAvIGJveEhlaWdodCk7XG5cdH0gZWxzZSB7XG5cdFx0d2lkdGggPSBjdXN0b21pc2F0aW9uc1dpZHRoID09PSBcImF1dG9cIiA/IGJveFdpZHRoIDogY3VzdG9taXNhdGlvbnNXaWR0aDtcblx0XHRoZWlnaHQgPSBjdXN0b21pc2F0aW9uc0hlaWdodCA9PT0gbnVsbCA/IGNhbGN1bGF0ZVNpemUod2lkdGgsIGJveEhlaWdodCAvIGJveFdpZHRoKSA6IGN1c3RvbWlzYXRpb25zSGVpZ2h0ID09PSBcImF1dG9cIiA/IGJveEhlaWdodCA6IGN1c3RvbWlzYXRpb25zSGVpZ2h0O1xuXHR9XG5cdGNvbnN0IGF0dHJpYnV0ZXMgPSB7fTtcblx0Y29uc3Qgc2V0QXR0ciA9IChwcm9wLCB2YWx1ZSkgPT4ge1xuXHRcdGlmICghaXNVbnNldEtleXdvcmQodmFsdWUpKSBhdHRyaWJ1dGVzW3Byb3BdID0gdmFsdWUudG9TdHJpbmcoKTtcblx0fTtcblx0c2V0QXR0cihcIndpZHRoXCIsIHdpZHRoKTtcblx0c2V0QXR0cihcImhlaWdodFwiLCBoZWlnaHQpO1xuXHRjb25zdCB2aWV3Qm94ID0gW1xuXHRcdGJveC5sZWZ0LFxuXHRcdGJveC50b3AsXG5cdFx0Ym94V2lkdGgsXG5cdFx0Ym94SGVpZ2h0XG5cdF07XG5cdGF0dHJpYnV0ZXMudmlld0JveCA9IHZpZXdCb3guam9pbihcIiBcIik7XG5cdHJldHVybiB7XG5cdFx0YXR0cmlidXRlcyxcblx0XHR2aWV3Qm94LFxuXHRcdGJvZHlcblx0fTtcbn1cbmV4cG9ydCB7IGljb25Ub1NWRywgaXNVbnNldEtleXdvcmQgfTtcbiIsCiAgICAiLyoqXG4qIFJlZ3VsYXIgZXhwcmVzc2lvbiBmb3IgZmluZGluZyBpZHNcbiovXG5jb25zdCByZWdleCA9IC9cXHNpZD1cIihcXFMrKVwiL2c7XG4vKipcbiogQ291bnRlcnNcbiovXG5jb25zdCBjb3VudGVycyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4vKipcbiogR2V0IHVuaXF1ZSBuZXcgSURcbiovXG5mdW5jdGlvbiBuZXh0SUQoaWQpIHtcblx0aWQgPSBpZC5yZXBsYWNlKC9bMC05XSskLywgXCJcIikgfHwgXCJhXCI7XG5cdGNvbnN0IGNvdW50ID0gY291bnRlcnMuZ2V0KGlkKSB8fCAwO1xuXHRjb3VudGVycy5zZXQoaWQsIGNvdW50ICsgMSk7XG5cdHJldHVybiBjb3VudCA/IGAke2lkfSR7Y291bnR9YCA6IGlkO1xufVxuLyoqXG4qIFJlcGxhY2UgSURzIGluIFNWRyBvdXRwdXQgd2l0aCB1bmlxdWUgSURzXG4qL1xuZnVuY3Rpb24gcmVwbGFjZUlEcyhib2R5KSB7XG5cdGNvbnN0IGlkcyA9IFtdO1xuXHRsZXQgbWF0Y2g7XG5cdHdoaWxlIChtYXRjaCA9IHJlZ2V4LmV4ZWMoYm9keSkpIGlkcy5wdXNoKG1hdGNoWzFdKTtcblx0aWYgKCFpZHMubGVuZ3RoKSByZXR1cm4gYm9keTtcblx0Y29uc3Qgc3VmZml4ID0gXCJzdWZmaXhcIiArIChNYXRoLnJhbmRvbSgpICogMTY3NzcyMTYgfCBEYXRlLm5vdygpKS50b1N0cmluZygxNik7XG5cdGlkcy5mb3JFYWNoKChpZCkgPT4ge1xuXHRcdGNvbnN0IG5ld0lEID0gbmV4dElEKGlkKTtcblx0XHRjb25zdCBlc2NhcGVkSUQgPSBpZC5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgXCJcXFxcJCZcIik7XG5cdFx0Ym9keSA9IGJvZHkucmVwbGFjZShuZXcgUmVnRXhwKFwiKFsjO1xcXCJdKShcIiArIGVzY2FwZWRJRCArIFwiKShbXFxcIildfFxcXFwuW2Etel0pXCIsIFwiZ1wiKSwgXCIkMVwiICsgbmV3SUQgKyBzdWZmaXggKyBcIiQzXCIpO1xuXHR9KTtcblx0Ym9keSA9IGJvZHkucmVwbGFjZShuZXcgUmVnRXhwKHN1ZmZpeCwgXCJnXCIpLCBcIlwiKTtcblx0cmV0dXJuIGJvZHk7XG59XG4vKipcbiogQ2xlYXIgSUQgY2FjaGVcbiovXG5mdW5jdGlvbiBjbGVhcklEQ2FjaGUoKSB7XG5cdGNvdW50ZXJzLmNsZWFyKCk7XG59XG5leHBvcnQgeyBjbGVhcklEQ2FjaGUsIHJlcGxhY2VJRHMgfTtcbiIsCiAgICAiLyoqXG4qIEdlbmVyYXRlIDxzdmc+XG4qL1xuZnVuY3Rpb24gaWNvblRvSFRNTChib2R5LCBhdHRyaWJ1dGVzKSB7XG5cdGxldCByZW5kZXJBdHRyaWJzSFRNTCA9IGJvZHkuaW5kZXhPZihcInhsaW5rOlwiKSA9PT0gLTEgPyBcIlwiIDogXCIgeG1sbnM6eGxpbms9XFxcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcXFwiXCI7XG5cdGZvciAoY29uc3QgYXR0ciBpbiBhdHRyaWJ1dGVzKSByZW5kZXJBdHRyaWJzSFRNTCArPSBcIiBcIiArIGF0dHIgKyBcIj1cXFwiXCIgKyBhdHRyaWJ1dGVzW2F0dHJdICsgXCJcXFwiXCI7XG5cdHJldHVybiBcIjxzdmcgeG1sbnM9XFxcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXFxcIlwiICsgcmVuZGVyQXR0cmlic0hUTUwgKyBcIj5cIiArIGJvZHkgKyBcIjwvc3ZnPlwiO1xufVxuZXhwb3J0IHsgaWNvblRvSFRNTCB9O1xuIiwKICAgICIvKipcbiAqIG1hcmtlZCB2MTYuNC4yIC0gYSBtYXJrZG93biBwYXJzZXJcbiAqIENvcHlyaWdodCAoYykgMjAxOC0yMDI1LCBNYXJrZWRKUy4gKE1JVCBMaWNlbnNlKVxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMTgsIENocmlzdG9waGVyIEplZmZyZXkuIChNSVQgTGljZW5zZSlcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXJrZWRqcy9tYXJrZWRcbiAqL1xuXG4vKipcbiAqIERPIE5PVCBFRElUIFRISVMgRklMRVxuICogVGhlIGNvZGUgaW4gdGhpcyBmaWxlIGlzIGdlbmVyYXRlZCBmcm9tIGZpbGVzIGluIC4vc3JjL1xuICovXG5cbmZ1bmN0aW9uIEwoKXtyZXR1cm57YXN5bmM6ITEsYnJlYWtzOiExLGV4dGVuc2lvbnM6bnVsbCxnZm06ITAsaG9va3M6bnVsbCxwZWRhbnRpYzohMSxyZW5kZXJlcjpudWxsLHNpbGVudDohMSx0b2tlbml6ZXI6bnVsbCx3YWxrVG9rZW5zOm51bGx9fXZhciBUPUwoKTtmdW5jdGlvbiBHKGwpe1Q9bH12YXIgRT17ZXhlYzooKT0+bnVsbH07ZnVuY3Rpb24gZChsLGU9XCJcIil7bGV0IHQ9dHlwZW9mIGw9PVwic3RyaW5nXCI/bDpsLnNvdXJjZSxuPXtyZXBsYWNlOihyLGkpPT57bGV0IHM9dHlwZW9mIGk9PVwic3RyaW5nXCI/aTppLnNvdXJjZTtyZXR1cm4gcz1zLnJlcGxhY2UobS5jYXJldCxcIiQxXCIpLHQ9dC5yZXBsYWNlKHIscyksbn0sZ2V0UmVnZXg6KCk9Pm5ldyBSZWdFeHAodCxlKX07cmV0dXJuIG59dmFyIGJlPSgoKT0+e3RyeXtyZXR1cm4hIW5ldyBSZWdFeHAoXCIoPzw9MSkoPzwhMSlcIil9Y2F0Y2h7cmV0dXJuITF9fSkoKSxtPXtjb2RlUmVtb3ZlSW5kZW50Oi9eKD86IHsxLDR9fCB7MCwzfVxcdCkvZ20sb3V0cHV0TGlua1JlcGxhY2U6L1xcXFwoW1xcW1xcXV0pL2csaW5kZW50Q29kZUNvbXBlbnNhdGlvbjovXihcXHMrKSg/OmBgYCkvLGJlZ2lubmluZ1NwYWNlOi9eXFxzKy8sZW5kaW5nSGFzaDovIyQvLHN0YXJ0aW5nU3BhY2VDaGFyOi9eIC8sZW5kaW5nU3BhY2VDaGFyOi8gJC8sbm9uU3BhY2VDaGFyOi9bXiBdLyxuZXdMaW5lQ2hhckdsb2JhbDovXFxuL2csdGFiQ2hhckdsb2JhbDovXFx0L2csbXVsdGlwbGVTcGFjZUdsb2JhbDovXFxzKy9nLGJsYW5rTGluZTovXlsgXFx0XSokLyxkb3VibGVCbGFua0xpbmU6L1xcblsgXFx0XSpcXG5bIFxcdF0qJC8sYmxvY2txdW90ZVN0YXJ0Oi9eIHswLDN9Pi8sYmxvY2txdW90ZVNldGV4dFJlcGxhY2U6L1xcbiB7MCwzfSgoPzo9K3wtKykgKikoPz1cXG58JCkvZyxibG9ja3F1b3RlU2V0ZXh0UmVwbGFjZTI6L14gezAsM30+WyBcXHRdPy9nbSxsaXN0UmVwbGFjZVRhYnM6L15cXHQrLyxsaXN0UmVwbGFjZU5lc3Rpbmc6L14gezEsNH0oPz0oIHs0fSkqW14gXSkvZyxsaXN0SXNUYXNrOi9eXFxbWyB4WF1cXF0gLyxsaXN0UmVwbGFjZVRhc2s6L15cXFtbIHhYXVxcXSArLyxhbnlMaW5lOi9cXG4uKlxcbi8saHJlZkJyYWNrZXRzOi9ePCguKik+JC8sdGFibGVEZWxpbWl0ZXI6L1s6fF0vLHRhYmxlQWxpZ25DaGFyczovXlxcfHxcXHwgKiQvZyx0YWJsZVJvd0JsYW5rTGluZTovXFxuWyBcXHRdKiQvLHRhYmxlQWxpZ25SaWdodDovXiAqLSs6ICokLyx0YWJsZUFsaWduQ2VudGVyOi9eICo6LSs6ICokLyx0YWJsZUFsaWduTGVmdDovXiAqOi0rICokLyxzdGFydEFUYWc6L148YSAvaSxlbmRBVGFnOi9ePFxcL2E+L2ksc3RhcnRQcmVTY3JpcHRUYWc6L148KHByZXxjb2RlfGtiZHxzY3JpcHQpKFxcc3w+KS9pLGVuZFByZVNjcmlwdFRhZzovXjxcXC8ocHJlfGNvZGV8a2JkfHNjcmlwdCkoXFxzfD4pL2ksc3RhcnRBbmdsZUJyYWNrZXQ6L148LyxlbmRBbmdsZUJyYWNrZXQ6Lz4kLyxwZWRhbnRpY0hyZWZUaXRsZTovXihbXidcIl0qW15cXHNdKVxccysoWydcIl0pKC4qKVxcMi8sdW5pY29kZUFscGhhTnVtZXJpYzovW1xccHtMfVxccHtOfV0vdSxlc2NhcGVUZXN0Oi9bJjw+XCInXS8sZXNjYXBlUmVwbGFjZTovWyY8PlwiJ10vZyxlc2NhcGVUZXN0Tm9FbmNvZGU6L1s8PlwiJ118Jig/ISgjXFxkezEsN318I1tYeF1bYS1mQS1GMC05XXsxLDZ9fFxcdyspOykvLGVzY2FwZVJlcGxhY2VOb0VuY29kZTovWzw+XCInXXwmKD8hKCNcXGR7MSw3fXwjW1h4XVthLWZBLUYwLTldezEsNn18XFx3Kyk7KS9nLHVuZXNjYXBlVGVzdDovJigjKD86XFxkKyl8KD86I3hbMC05QS1GYS1mXSspfCg/OlxcdyspKTs/L2lnLGNhcmV0Oi8oXnxbXlxcW10pXFxeL2cscGVyY2VudERlY29kZTovJTI1L2csZmluZFBpcGU6L1xcfC9nLHNwbGl0UGlwZTovIFxcfC8sc2xhc2hQaXBlOi9cXFxcXFx8L2csY2FycmlhZ2VSZXR1cm46L1xcclxcbnxcXHIvZyxzcGFjZUxpbmU6L14gKyQvZ20sbm90U3BhY2VTdGFydDovXlxcUyovLGVuZGluZ05ld2xpbmU6L1xcbiQvLGxpc3RJdGVtUmVnZXg6bD0+bmV3IFJlZ0V4cChgXiggezAsM30ke2x9KSgoPzpbXHQgXVteXFxcXG5dKik/KD86XFxcXG58JCkpYCksbmV4dEJ1bGxldFJlZ2V4Omw9Pm5ldyBSZWdFeHAoYF4gezAsJHtNYXRoLm1pbigzLGwtMSl9fSg/OlsqKy1dfFxcXFxkezEsOX1bLildKSgoPzpbIFx0XVteXFxcXG5dKik/KD86XFxcXG58JCkpYCksaHJSZWdleDpsPT5uZXcgUmVnRXhwKGBeIHswLCR7TWF0aC5taW4oMyxsLTEpfX0oKD86LSAqKXszLH18KD86XyAqKXszLH18KD86XFxcXCogKil7Myx9KSg/OlxcXFxuK3wkKWApLGZlbmNlc0JlZ2luUmVnZXg6bD0+bmV3IFJlZ0V4cChgXiB7MCwke01hdGgubWluKDMsbC0xKX19KD86XFxgXFxgXFxgfH5+filgKSxoZWFkaW5nQmVnaW5SZWdleDpsPT5uZXcgUmVnRXhwKGBeIHswLCR7TWF0aC5taW4oMyxsLTEpfX0jYCksaHRtbEJlZ2luUmVnZXg6bD0+bmV3IFJlZ0V4cChgXiB7MCwke01hdGgubWluKDMsbC0xKX19PCg/OlthLXpdLio+fCEtLSlgLFwiaVwiKX0sUmU9L14oPzpbIFxcdF0qKD86XFxufCQpKSsvLFRlPS9eKCg/OiB7NH18IHswLDN9XFx0KVteXFxuXSsoPzpcXG4oPzpbIFxcdF0qKD86XFxufCQpKSopPykrLyxPZT0vXiB7MCwzfShgezMsfSg/PVteYFxcbl0qKD86XFxufCQpKXx+ezMsfSkoW15cXG5dKikoPzpcXG58JCkoPzp8KFtcXHNcXFNdKj8pKD86XFxufCQpKSg/OiB7MCwzfVxcMVt+YF0qICooPz1cXG58JCl8JCkvLEk9L14gezAsM30oKD86LVtcXHQgXSopezMsfXwoPzpfWyBcXHRdKil7Myx9fCg/OlxcKlsgXFx0XSopezMsfSkoPzpcXG4rfCQpLyx3ZT0vXiB7MCwzfSgjezEsNn0pKD89XFxzfCQpKC4qKSg/Olxcbit8JCkvLEY9Lyg/OlsqKy1dfFxcZHsxLDl9Wy4pXSkvLGllPS9eKD8hYnVsbCB8YmxvY2tDb2RlfGZlbmNlc3xibG9ja3F1b3RlfGhlYWRpbmd8aHRtbHx0YWJsZSkoKD86LnxcXG4oPyFcXHMqP1xcbnxidWxsIHxibG9ja0NvZGV8ZmVuY2VzfGJsb2NrcXVvdGV8aGVhZGluZ3xodG1sfHRhYmxlKSkrPylcXG4gezAsM30oPSt8LSspICooPzpcXG4rfCQpLyxvZT1kKGllKS5yZXBsYWNlKC9idWxsL2csRikucmVwbGFjZSgvYmxvY2tDb2RlL2csLyg/OiB7NH18IHswLDN9XFx0KS8pLnJlcGxhY2UoL2ZlbmNlcy9nLC8gezAsM30oPzpgezMsfXx+ezMsfSkvKS5yZXBsYWNlKC9ibG9ja3F1b3RlL2csLyB7MCwzfT4vKS5yZXBsYWNlKC9oZWFkaW5nL2csLyB7MCwzfSN7MSw2fS8pLnJlcGxhY2UoL2h0bWwvZywvIHswLDN9PFteXFxuPl0rPlxcbi8pLnJlcGxhY2UoL1xcfHRhYmxlL2csXCJcIikuZ2V0UmVnZXgoKSx5ZT1kKGllKS5yZXBsYWNlKC9idWxsL2csRikucmVwbGFjZSgvYmxvY2tDb2RlL2csLyg/OiB7NH18IHswLDN9XFx0KS8pLnJlcGxhY2UoL2ZlbmNlcy9nLC8gezAsM30oPzpgezMsfXx+ezMsfSkvKS5yZXBsYWNlKC9ibG9ja3F1b3RlL2csLyB7MCwzfT4vKS5yZXBsYWNlKC9oZWFkaW5nL2csLyB7MCwzfSN7MSw2fS8pLnJlcGxhY2UoL2h0bWwvZywvIHswLDN9PFteXFxuPl0rPlxcbi8pLnJlcGxhY2UoL3RhYmxlL2csLyB7MCwzfVxcfD8oPzpbOlxcLSBdKlxcfCkrW1xcOlxcLSBdKlxcbi8pLmdldFJlZ2V4KCksaj0vXihbXlxcbl0rKD86XFxuKD8haHJ8aGVhZGluZ3xsaGVhZGluZ3xibG9ja3F1b3RlfGZlbmNlc3xsaXN0fGh0bWx8dGFibGV8ICtcXG4pW15cXG5dKykqKS8sUGU9L15bXlxcbl0rLyxRPS8oPyFcXHMqXFxdKSg/OlxcXFxbXFxzXFxTXXxbXlxcW1xcXVxcXFxdKSsvLFNlPWQoL14gezAsM31cXFsobGFiZWwpXFxdOiAqKD86XFxuWyBcXHRdKik/KFtePFxcc11bXlxcc10qfDwuKj8+KSg/Oig/OiArKD86XFxuWyBcXHRdKik/fCAqXFxuWyBcXHRdKikodGl0bGUpKT8gKig/Olxcbit8JCkvKS5yZXBsYWNlKFwibGFiZWxcIixRKS5yZXBsYWNlKFwidGl0bGVcIiwvKD86XCIoPzpcXFxcXCI/fFteXCJcXFxcXSkqXCJ8J1teJ1xcbl0qKD86XFxuW14nXFxuXSspKlxcbj8nfFxcKFteKCldKlxcKSkvKS5nZXRSZWdleCgpLCRlPWQoL14oIHswLDN9YnVsbCkoWyBcXHRdW15cXG5dKz8pPyg/OlxcbnwkKS8pLnJlcGxhY2UoL2J1bGwvZyxGKS5nZXRSZWdleCgpLHY9XCJhZGRyZXNzfGFydGljbGV8YXNpZGV8YmFzZXxiYXNlZm9udHxibG9ja3F1b3RlfGJvZHl8Y2FwdGlvbnxjZW50ZXJ8Y29sfGNvbGdyb3VwfGRkfGRldGFpbHN8ZGlhbG9nfGRpcnxkaXZ8ZGx8ZHR8ZmllbGRzZXR8ZmlnY2FwdGlvbnxmaWd1cmV8Zm9vdGVyfGZvcm18ZnJhbWV8ZnJhbWVzZXR8aFsxLTZdfGhlYWR8aGVhZGVyfGhyfGh0bWx8aWZyYW1lfGxlZ2VuZHxsaXxsaW5rfG1haW58bWVudXxtZW51aXRlbXxtZXRhfG5hdnxub2ZyYW1lc3xvbHxvcHRncm91cHxvcHRpb258cHxwYXJhbXxzZWFyY2h8c2VjdGlvbnxzdW1tYXJ5fHRhYmxlfHRib2R5fHRkfHRmb290fHRofHRoZWFkfHRpdGxlfHRyfHRyYWNrfHVsXCIsVT0vPCEtLSg/Oi0/PnxbXFxzXFxTXSo/KD86LS0+fCQpKS8sX2U9ZChcIl4gezAsM30oPzo8KHNjcmlwdHxwcmV8c3R5bGV8dGV4dGFyZWEpW1xcXFxzPl1bXFxcXHNcXFxcU10qPyg/OjwvXFxcXDE+W15cXFxcbl0qXFxcXG4rfCQpfGNvbW1lbnRbXlxcXFxuXSooXFxcXG4rfCQpfDxcXFxcP1tcXFxcc1xcXFxTXSo/KD86XFxcXD8+XFxcXG4qfCQpfDwhW0EtWl1bXFxcXHNcXFxcU10qPyg/Oj5cXFxcbip8JCl8PCFcXFxcW0NEQVRBXFxcXFtbXFxcXHNcXFxcU10qPyg/OlxcXFxdXFxcXF0+XFxcXG4qfCQpfDwvPyh0YWcpKD86ICt8XFxcXG58Lz8+KVtcXFxcc1xcXFxTXSo/KD86KD86XFxcXG5bIFx0XSopK1xcXFxufCQpfDwoPyFzY3JpcHR8cHJlfHN0eWxlfHRleHRhcmVhKShbYS16XVtcXFxcdy1dKikoPzphdHRyaWJ1dGUpKj8gKi8/Pig/PVsgXFxcXHRdKig/OlxcXFxufCQpKVtcXFxcc1xcXFxTXSo/KD86KD86XFxcXG5bIFx0XSopK1xcXFxufCQpfDwvKD8hc2NyaXB0fHByZXxzdHlsZXx0ZXh0YXJlYSlbYS16XVtcXFxcdy1dKlxcXFxzKj4oPz1bIFxcXFx0XSooPzpcXFxcbnwkKSlbXFxcXHNcXFxcU10qPyg/Oig/OlxcXFxuWyBcdF0qKStcXFxcbnwkKSlcIixcImlcIikucmVwbGFjZShcImNvbW1lbnRcIixVKS5yZXBsYWNlKFwidGFnXCIsdikucmVwbGFjZShcImF0dHJpYnV0ZVwiLC8gK1thLXpBLVo6X11bXFx3LjotXSooPzogKj0gKlwiW15cIlxcbl0qXCJ8ICo9IConW14nXFxuXSonfCAqPSAqW15cXHNcIic9PD5gXSspPy8pLmdldFJlZ2V4KCksYWU9ZChqKS5yZXBsYWNlKFwiaHJcIixJKS5yZXBsYWNlKFwiaGVhZGluZ1wiLFwiIHswLDN9I3sxLDZ9KD86XFxcXHN8JClcIikucmVwbGFjZShcInxsaGVhZGluZ1wiLFwiXCIpLnJlcGxhY2UoXCJ8dGFibGVcIixcIlwiKS5yZXBsYWNlKFwiYmxvY2txdW90ZVwiLFwiIHswLDN9PlwiKS5yZXBsYWNlKFwiZmVuY2VzXCIsXCIgezAsM30oPzpgezMsfSg/PVteYFxcXFxuXSpcXFxcbil8fnszLH0pW15cXFxcbl0qXFxcXG5cIikucmVwbGFjZShcImxpc3RcIixcIiB7MCwzfSg/OlsqKy1dfDFbLildKSBcIikucmVwbGFjZShcImh0bWxcIixcIjwvPyg/OnRhZykoPzogK3xcXFxcbnwvPz4pfDwoPzpzY3JpcHR8cHJlfHN0eWxlfHRleHRhcmVhfCEtLSlcIikucmVwbGFjZShcInRhZ1wiLHYpLmdldFJlZ2V4KCksTGU9ZCgvXiggezAsM30+ID8ocGFyYWdyYXBofFteXFxuXSopKD86XFxufCQpKSsvKS5yZXBsYWNlKFwicGFyYWdyYXBoXCIsYWUpLmdldFJlZ2V4KCksSz17YmxvY2txdW90ZTpMZSxjb2RlOlRlLGRlZjpTZSxmZW5jZXM6T2UsaGVhZGluZzp3ZSxocjpJLGh0bWw6X2UsbGhlYWRpbmc6b2UsbGlzdDokZSxuZXdsaW5lOlJlLHBhcmFncmFwaDphZSx0YWJsZTpFLHRleHQ6UGV9LHJlPWQoXCJeICooW15cXFxcbiBdLiopXFxcXG4gezAsM30oKD86XFxcXHwgKik/Oj8tKzo/ICooPzpcXFxcfCAqOj8tKzo/ICopKig/OlxcXFx8ICopPykoPzpcXFxcbigoPzooPyEgKlxcXFxufGhyfGhlYWRpbmd8YmxvY2txdW90ZXxjb2RlfGZlbmNlc3xsaXN0fGh0bWwpLiooPzpcXFxcbnwkKSkqKVxcXFxuKnwkKVwiKS5yZXBsYWNlKFwiaHJcIixJKS5yZXBsYWNlKFwiaGVhZGluZ1wiLFwiIHswLDN9I3sxLDZ9KD86XFxcXHN8JClcIikucmVwbGFjZShcImJsb2NrcXVvdGVcIixcIiB7MCwzfT5cIikucmVwbGFjZShcImNvZGVcIixcIig/OiB7NH18IHswLDN9XHQpW15cXFxcbl1cIikucmVwbGFjZShcImZlbmNlc1wiLFwiIHswLDN9KD86YHszLH0oPz1bXmBcXFxcbl0qXFxcXG4pfH57Myx9KVteXFxcXG5dKlxcXFxuXCIpLnJlcGxhY2UoXCJsaXN0XCIsXCIgezAsM30oPzpbKistXXwxWy4pXSkgXCIpLnJlcGxhY2UoXCJodG1sXCIsXCI8Lz8oPzp0YWcpKD86ICt8XFxcXG58Lz8+KXw8KD86c2NyaXB0fHByZXxzdHlsZXx0ZXh0YXJlYXwhLS0pXCIpLnJlcGxhY2UoXCJ0YWdcIix2KS5nZXRSZWdleCgpLE1lPXsuLi5LLGxoZWFkaW5nOnllLHRhYmxlOnJlLHBhcmFncmFwaDpkKGopLnJlcGxhY2UoXCJoclwiLEkpLnJlcGxhY2UoXCJoZWFkaW5nXCIsXCIgezAsM30jezEsNn0oPzpcXFxcc3wkKVwiKS5yZXBsYWNlKFwifGxoZWFkaW5nXCIsXCJcIikucmVwbGFjZShcInRhYmxlXCIscmUpLnJlcGxhY2UoXCJibG9ja3F1b3RlXCIsXCIgezAsM30+XCIpLnJlcGxhY2UoXCJmZW5jZXNcIixcIiB7MCwzfSg/OmB7Myx9KD89W15gXFxcXG5dKlxcXFxuKXx+ezMsfSlbXlxcXFxuXSpcXFxcblwiKS5yZXBsYWNlKFwibGlzdFwiLFwiIHswLDN9KD86WyorLV18MVsuKV0pIFwiKS5yZXBsYWNlKFwiaHRtbFwiLFwiPC8/KD86dGFnKSg/OiArfFxcXFxufC8/Pil8PCg/OnNjcmlwdHxwcmV8c3R5bGV8dGV4dGFyZWF8IS0tKVwiKS5yZXBsYWNlKFwidGFnXCIsdikuZ2V0UmVnZXgoKX0semU9ey4uLkssaHRtbDpkKGBeICooPzpjb21tZW50ICooPzpcXFxcbnxcXFxccyokKXw8KHRhZylbXFxcXHNcXFxcU10rPzwvXFxcXDE+ICooPzpcXFxcbnsyLH18XFxcXHMqJCl8PHRhZyg/OlwiW15cIl0qXCJ8J1teJ10qJ3xcXFxcc1teJ1wiLz5cXFxcc10qKSo/Lz8+ICooPzpcXFxcbnsyLH18XFxcXHMqJCkpYCkucmVwbGFjZShcImNvbW1lbnRcIixVKS5yZXBsYWNlKC90YWcvZyxcIig/ISg/OmF8ZW18c3Ryb25nfHNtYWxsfHN8Y2l0ZXxxfGRmbnxhYmJyfGRhdGF8dGltZXxjb2RlfHZhcnxzYW1wfGtiZHxzdWJ8c3VwfGl8Ynx1fG1hcmt8cnVieXxydHxycHxiZGl8YmRvfHNwYW58YnJ8d2JyfGluc3xkZWx8aW1nKVxcXFxiKVxcXFx3Kyg/ITp8W15cXFxcd1xcXFxzQF0qQClcXFxcYlwiKS5nZXRSZWdleCgpLGRlZjovXiAqXFxbKFteXFxdXSspXFxdOiAqPD8oW15cXHM+XSspPj8oPzogKyhbXCIoXVteXFxuXStbXCIpXSkpPyAqKD86XFxuK3wkKS8saGVhZGluZzovXigjezEsNn0pKC4qKSg/Olxcbit8JCkvLGZlbmNlczpFLGxoZWFkaW5nOi9eKC4rPylcXG4gezAsM30oPSt8LSspICooPzpcXG4rfCQpLyxwYXJhZ3JhcGg6ZChqKS5yZXBsYWNlKFwiaHJcIixJKS5yZXBsYWNlKFwiaGVhZGluZ1wiLGAgKiN7MSw2fSAqW15cbl1gKS5yZXBsYWNlKFwibGhlYWRpbmdcIixvZSkucmVwbGFjZShcInx0YWJsZVwiLFwiXCIpLnJlcGxhY2UoXCJibG9ja3F1b3RlXCIsXCIgezAsM30+XCIpLnJlcGxhY2UoXCJ8ZmVuY2VzXCIsXCJcIikucmVwbGFjZShcInxsaXN0XCIsXCJcIikucmVwbGFjZShcInxodG1sXCIsXCJcIikucmVwbGFjZShcInx0YWdcIixcIlwiKS5nZXRSZWdleCgpfSxBZT0vXlxcXFwoWyFcIiMkJSYnKCkqKyxcXC0uLzo7PD0+P0BcXFtcXF1cXFxcXl9ge3x9fl0pLyxFZT0vXihgKykoW15gXXxbXmBdW1xcc1xcU10qP1teYF0pXFwxKD8hYCkvLGxlPS9eKCB7Mix9fFxcXFwpXFxuKD8hXFxzKiQpLyxJZT0vXihgK3xbXmBdKSg/Oig/PSB7Mix9XFxuKXxbXFxzXFxTXSo/KD86KD89W1xcXFw8IVxcW2AqX118XFxiX3wkKXxbXiBdKD89IHsyLH1cXG4pKSkvLEQ9L1tcXHB7UH1cXHB7U31dL3UsVz0vW1xcc1xccHtQfVxccHtTfV0vdSx1ZT0vW15cXHNcXHB7UH1cXHB7U31dL3UsQ2U9ZCgvXigoPyFbKl9dKXB1bmN0U3BhY2UpLyxcInVcIikucmVwbGFjZSgvcHVuY3RTcGFjZS9nLFcpLmdldFJlZ2V4KCkscGU9Lyg/IX4pW1xccHtQfVxccHtTfV0vdSxCZT0vKD8hfilbXFxzXFxwe1B9XFxwe1N9XS91LHFlPS8oPzpbXlxcc1xccHtQfVxccHtTfV18fikvdSx2ZT1kKC9saW5rfHByZWNvZGUtY29kZXxodG1sLyxcImdcIikucmVwbGFjZShcImxpbmtcIiwvXFxbKD86W15cXFtcXF1gXXwoPzxhPmArKVteYF0rXFxrPGE+KD8hYCkpKj9cXF1cXCgoPzpcXFxcW1xcc1xcU118W15cXFxcXFwoXFwpXXxcXCgoPzpcXFxcW1xcc1xcU118W15cXFxcXFwoXFwpXSkqXFwpKSpcXCkvKS5yZXBsYWNlKFwicHJlY29kZS1cIixiZT9cIig/PCFgKSgpXCI6XCIoXl58W15gXSlcIikucmVwbGFjZShcImNvZGVcIiwvKD88Yj5gKylbXmBdK1xcazxiPig/IWApLykucmVwbGFjZShcImh0bWxcIiwvPCg/ISApW148Pl0qPz4vKS5nZXRSZWdleCgpLGNlPS9eKD86XFwqKyg/OigoPyFcXCopcHVuY3QpfFteXFxzKl0pKXxeXysoPzooKD8hXylwdW5jdCl8KFteXFxzX10pKS8sRGU9ZChjZSxcInVcIikucmVwbGFjZSgvcHVuY3QvZyxEKS5nZXRSZWdleCgpLEhlPWQoY2UsXCJ1XCIpLnJlcGxhY2UoL3B1bmN0L2cscGUpLmdldFJlZ2V4KCksaGU9XCJeW15fKl0qP19fW15fKl0qP1xcXFwqW15fKl0qPyg/PV9fKXxbXipdKyg/PVteKl0pfCg/IVxcXFwqKXB1bmN0KFxcXFwqKykoPz1bXFxcXHNdfCQpfG5vdFB1bmN0U3BhY2UoXFxcXCorKSg/IVxcXFwqKSg/PXB1bmN0U3BhY2V8JCl8KD8hXFxcXCopcHVuY3RTcGFjZShcXFxcKispKD89bm90UHVuY3RTcGFjZSl8W1xcXFxzXShcXFxcKispKD8hXFxcXCopKD89cHVuY3QpfCg/IVxcXFwqKXB1bmN0KFxcXFwqKykoPyFcXFxcKikoPz1wdW5jdCl8bm90UHVuY3RTcGFjZShcXFxcKispKD89bm90UHVuY3RTcGFjZSlcIixaZT1kKGhlLFwiZ3VcIikucmVwbGFjZSgvbm90UHVuY3RTcGFjZS9nLHVlKS5yZXBsYWNlKC9wdW5jdFNwYWNlL2csVykucmVwbGFjZSgvcHVuY3QvZyxEKS5nZXRSZWdleCgpLEdlPWQoaGUsXCJndVwiKS5yZXBsYWNlKC9ub3RQdW5jdFNwYWNlL2cscWUpLnJlcGxhY2UoL3B1bmN0U3BhY2UvZyxCZSkucmVwbGFjZSgvcHVuY3QvZyxwZSkuZ2V0UmVnZXgoKSxOZT1kKFwiXlteXypdKj9cXFxcKlxcXFwqW15fKl0qP19bXl8qXSo/KD89XFxcXCpcXFxcKil8W15fXSsoPz1bXl9dKXwoPyFfKXB1bmN0KF8rKSg/PVtcXFxcc118JCl8bm90UHVuY3RTcGFjZShfKykoPyFfKSg/PXB1bmN0U3BhY2V8JCl8KD8hXylwdW5jdFNwYWNlKF8rKSg/PW5vdFB1bmN0U3BhY2UpfFtcXFxcc10oXyspKD8hXykoPz1wdW5jdCl8KD8hXylwdW5jdChfKykoPyFfKSg/PXB1bmN0KVwiLFwiZ3VcIikucmVwbGFjZSgvbm90UHVuY3RTcGFjZS9nLHVlKS5yZXBsYWNlKC9wdW5jdFNwYWNlL2csVykucmVwbGFjZSgvcHVuY3QvZyxEKS5nZXRSZWdleCgpLEZlPWQoL1xcXFwocHVuY3QpLyxcImd1XCIpLnJlcGxhY2UoL3B1bmN0L2csRCkuZ2V0UmVnZXgoKSxqZT1kKC9ePChzY2hlbWU6W15cXHNcXHgwMC1cXHgxZjw+XSp8ZW1haWwpPi8pLnJlcGxhY2UoXCJzY2hlbWVcIiwvW2EtekEtWl1bYS16QS1aMC05Ky4tXXsxLDMxfS8pLnJlcGxhY2UoXCJlbWFpbFwiLC9bYS16QS1aMC05LiEjJCUmJyorLz0/Xl9ge3x9fi1dKyhAKVthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPyg/OlxcLlthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPykrKD8hWy1fXSkvKS5nZXRSZWdleCgpLFFlPWQoVSkucmVwbGFjZShcIig/Oi0tPnwkKVwiLFwiLS0+XCIpLmdldFJlZ2V4KCksVWU9ZChcIl5jb21tZW50fF48L1thLXpBLVpdW1xcXFx3Oi1dKlxcXFxzKj58XjxbYS16QS1aXVtcXFxcdy1dKig/OmF0dHJpYnV0ZSkqP1xcXFxzKi8/PnxePFxcXFw/W1xcXFxzXFxcXFNdKj9cXFxcPz58XjwhW2EtekEtWl0rXFxcXHNbXFxcXHNcXFxcU10qPz58XjwhXFxcXFtDREFUQVxcXFxbW1xcXFxzXFxcXFNdKj9cXFxcXVxcXFxdPlwiKS5yZXBsYWNlKFwiY29tbWVudFwiLFFlKS5yZXBsYWNlKFwiYXR0cmlidXRlXCIsL1xccytbYS16QS1aOl9dW1xcdy46LV0qKD86XFxzKj1cXHMqXCJbXlwiXSpcInxcXHMqPVxccyonW14nXSonfFxccyo9XFxzKlteXFxzXCInPTw+YF0rKT8vKS5nZXRSZWdleCgpLHE9Lyg/OlxcWyg/OlxcXFxbXFxzXFxTXXxbXlxcW1xcXVxcXFxdKSpcXF18XFxcXFtcXHNcXFNdfGArW15gXSo/YCsoPyFgKXxbXlxcW1xcXVxcXFxgXSkqPy8sS2U9ZCgvXiE/XFxbKGxhYmVsKVxcXVxcKFxccyooaHJlZikoPzooPzpbIFxcdF0qKD86XFxuWyBcXHRdKik/KSh0aXRsZSkpP1xccypcXCkvKS5yZXBsYWNlKFwibGFiZWxcIixxKS5yZXBsYWNlKFwiaHJlZlwiLC88KD86XFxcXC58W15cXG48PlxcXFxdKSs+fFteIFxcdFxcblxceDAwLVxceDFmXSovKS5yZXBsYWNlKFwidGl0bGVcIiwvXCIoPzpcXFxcXCI/fFteXCJcXFxcXSkqXCJ8Jyg/OlxcXFwnP3xbXidcXFxcXSkqJ3xcXCgoPzpcXFxcXFwpP3xbXilcXFxcXSkqXFwpLykuZ2V0UmVnZXgoKSxkZT1kKC9eIT9cXFsobGFiZWwpXFxdXFxbKHJlZilcXF0vKS5yZXBsYWNlKFwibGFiZWxcIixxKS5yZXBsYWNlKFwicmVmXCIsUSkuZ2V0UmVnZXgoKSxrZT1kKC9eIT9cXFsocmVmKVxcXSg/OlxcW1xcXSk/LykucmVwbGFjZShcInJlZlwiLFEpLmdldFJlZ2V4KCksV2U9ZChcInJlZmxpbmt8bm9saW5rKD8hXFxcXCgpXCIsXCJnXCIpLnJlcGxhY2UoXCJyZWZsaW5rXCIsZGUpLnJlcGxhY2UoXCJub2xpbmtcIixrZSkuZ2V0UmVnZXgoKSxzZT0vW2hIXVt0VF1bdFRdW3BQXVtzU10/fFtmRl1bdFRdW3BQXS8sWD17X2JhY2twZWRhbDpFLGFueVB1bmN0dWF0aW9uOkZlLGF1dG9saW5rOmplLGJsb2NrU2tpcDp2ZSxicjpsZSxjb2RlOkVlLGRlbDpFLGVtU3Ryb25nTERlbGltOkRlLGVtU3Ryb25nUkRlbGltQXN0OlplLGVtU3Ryb25nUkRlbGltVW5kOk5lLGVzY2FwZTpBZSxsaW5rOktlLG5vbGluazprZSxwdW5jdHVhdGlvbjpDZSxyZWZsaW5rOmRlLHJlZmxpbmtTZWFyY2g6V2UsdGFnOlVlLHRleHQ6SWUsdXJsOkV9LFhlPXsuLi5YLGxpbms6ZCgvXiE/XFxbKGxhYmVsKVxcXVxcKCguKj8pXFwpLykucmVwbGFjZShcImxhYmVsXCIscSkuZ2V0UmVnZXgoKSxyZWZsaW5rOmQoL14hP1xcWyhsYWJlbClcXF1cXHMqXFxbKFteXFxdXSopXFxdLykucmVwbGFjZShcImxhYmVsXCIscSkuZ2V0UmVnZXgoKX0sTj17Li4uWCxlbVN0cm9uZ1JEZWxpbUFzdDpHZSxlbVN0cm9uZ0xEZWxpbTpIZSx1cmw6ZCgvXigoPzpwcm90b2NvbCk6XFwvXFwvfHd3d1xcLikoPzpbYS16QS1aMC05XFwtXStcXC4/KStbXlxcczxdKnxeZW1haWwvKS5yZXBsYWNlKFwicHJvdG9jb2xcIixzZSkucmVwbGFjZShcImVtYWlsXCIsL1tBLVphLXowLTkuXystXSsoQClbYS16QS1aMC05LV9dKyg/OlxcLlthLXpBLVowLTktX10qW2EtekEtWjAtOV0pKyg/IVstX10pLykuZ2V0UmVnZXgoKSxfYmFja3BlZGFsOi8oPzpbXj8hLiw6OypfJ1wifigpJl0rfFxcKFteKV0qXFwpfCYoPyFbYS16QS1aMC05XSs7JCl8Wz8hLiw6OypfJ1wifildKyg/ISQpKSsvLGRlbDovXih+fj8pKD89W15cXHN+XSkoKD86XFxcXFtcXHNcXFNdfFteXFxcXF0pKj8oPzpcXFxcW1xcc1xcU118W15cXHN+XFxcXF0pKVxcMSg/PVtefl18JCkvLHRleHQ6ZCgvXihbYH5dK3xbXmB+XSkoPzooPz0gezIsfVxcbil8KD89W2EtekEtWjAtOS4hIyQlJicqK1xcLz0/X2B7XFx8fX4tXStAKXxbXFxzXFxTXSo/KD86KD89W1xcXFw8IVxcW2Aqfl9dfFxcYl98cHJvdG9jb2w6XFwvXFwvfHd3d1xcLnwkKXxbXiBdKD89IHsyLH1cXG4pfFteYS16QS1aMC05LiEjJCUmJyorXFwvPT9fYHtcXHx9fi1dKD89W2EtekEtWjAtOS4hIyQlJicqK1xcLz0/X2B7XFx8fX4tXStAKSkpLykucmVwbGFjZShcInByb3RvY29sXCIsc2UpLmdldFJlZ2V4KCl9LEplPXsuLi5OLGJyOmQobGUpLnJlcGxhY2UoXCJ7Mix9XCIsXCIqXCIpLmdldFJlZ2V4KCksdGV4dDpkKE4udGV4dCkucmVwbGFjZShcIlxcXFxiX1wiLFwiXFxcXGJffCB7Mix9XFxcXG5cIikucmVwbGFjZSgvXFx7MixcXH0vZyxcIipcIikuZ2V0UmVnZXgoKX0sQz17bm9ybWFsOkssZ2ZtOk1lLHBlZGFudGljOnplfSxNPXtub3JtYWw6WCxnZm06TixicmVha3M6SmUscGVkYW50aWM6WGV9O3ZhciBWZT17XCImXCI6XCImYW1wO1wiLFwiPFwiOlwiJmx0O1wiLFwiPlwiOlwiJmd0O1wiLCdcIic6XCImcXVvdDtcIixcIidcIjpcIiYjMzk7XCJ9LGdlPWw9PlZlW2xdO2Z1bmN0aW9uIHcobCxlKXtpZihlKXtpZihtLmVzY2FwZVRlc3QudGVzdChsKSlyZXR1cm4gbC5yZXBsYWNlKG0uZXNjYXBlUmVwbGFjZSxnZSl9ZWxzZSBpZihtLmVzY2FwZVRlc3ROb0VuY29kZS50ZXN0KGwpKXJldHVybiBsLnJlcGxhY2UobS5lc2NhcGVSZXBsYWNlTm9FbmNvZGUsZ2UpO3JldHVybiBsfWZ1bmN0aW9uIEoobCl7dHJ5e2w9ZW5jb2RlVVJJKGwpLnJlcGxhY2UobS5wZXJjZW50RGVjb2RlLFwiJVwiKX1jYXRjaHtyZXR1cm4gbnVsbH1yZXR1cm4gbH1mdW5jdGlvbiBWKGwsZSl7bGV0IHQ9bC5yZXBsYWNlKG0uZmluZFBpcGUsKGkscyxhKT0+e2xldCBvPSExLHA9cztmb3IoOy0tcD49MCYmYVtwXT09PVwiXFxcXFwiOylvPSFvO3JldHVybiBvP1wifFwiOlwiIHxcIn0pLG49dC5zcGxpdChtLnNwbGl0UGlwZSkscj0wO2lmKG5bMF0udHJpbSgpfHxuLnNoaWZ0KCksbi5sZW5ndGg+MCYmIW4uYXQoLTEpPy50cmltKCkmJm4ucG9wKCksZSlpZihuLmxlbmd0aD5lKW4uc3BsaWNlKGUpO2Vsc2UgZm9yKDtuLmxlbmd0aDxlOyluLnB1c2goXCJcIik7Zm9yKDtyPG4ubGVuZ3RoO3IrKyluW3JdPW5bcl0udHJpbSgpLnJlcGxhY2UobS5zbGFzaFBpcGUsXCJ8XCIpO3JldHVybiBufWZ1bmN0aW9uIHoobCxlLHQpe2xldCBuPWwubGVuZ3RoO2lmKG49PT0wKXJldHVyblwiXCI7bGV0IHI9MDtmb3IoO3I8bjspe2xldCBpPWwuY2hhckF0KG4tci0xKTtpZihpPT09ZSYmIXQpcisrO2Vsc2UgaWYoaSE9PWUmJnQpcisrO2Vsc2UgYnJlYWt9cmV0dXJuIGwuc2xpY2UoMCxuLXIpfWZ1bmN0aW9uIGZlKGwsZSl7aWYobC5pbmRleE9mKGVbMV0pPT09LTEpcmV0dXJuLTE7bGV0IHQ9MDtmb3IobGV0IG49MDtuPGwubGVuZ3RoO24rKylpZihsW25dPT09XCJcXFxcXCIpbisrO2Vsc2UgaWYobFtuXT09PWVbMF0pdCsrO2Vsc2UgaWYobFtuXT09PWVbMV0mJih0LS0sdDwwKSlyZXR1cm4gbjtyZXR1cm4gdD4wPy0yOi0xfWZ1bmN0aW9uIG1lKGwsZSx0LG4scil7bGV0IGk9ZS5ocmVmLHM9ZS50aXRsZXx8bnVsbCxhPWxbMV0ucmVwbGFjZShyLm90aGVyLm91dHB1dExpbmtSZXBsYWNlLFwiJDFcIik7bi5zdGF0ZS5pbkxpbms9ITA7bGV0IG89e3R5cGU6bFswXS5jaGFyQXQoMCk9PT1cIiFcIj9cImltYWdlXCI6XCJsaW5rXCIscmF3OnQsaHJlZjppLHRpdGxlOnMsdGV4dDphLHRva2VuczpuLmlubGluZVRva2VucyhhKX07cmV0dXJuIG4uc3RhdGUuaW5MaW5rPSExLG99ZnVuY3Rpb24gWWUobCxlLHQpe2xldCBuPWwubWF0Y2godC5vdGhlci5pbmRlbnRDb2RlQ29tcGVuc2F0aW9uKTtpZihuPT09bnVsbClyZXR1cm4gZTtsZXQgcj1uWzFdO3JldHVybiBlLnNwbGl0KGBcbmApLm1hcChpPT57bGV0IHM9aS5tYXRjaCh0Lm90aGVyLmJlZ2lubmluZ1NwYWNlKTtpZihzPT09bnVsbClyZXR1cm4gaTtsZXRbYV09cztyZXR1cm4gYS5sZW5ndGg+PXIubGVuZ3RoP2kuc2xpY2Uoci5sZW5ndGgpOml9KS5qb2luKGBcbmApfXZhciB5PWNsYXNze29wdGlvbnM7cnVsZXM7bGV4ZXI7Y29uc3RydWN0b3IoZSl7dGhpcy5vcHRpb25zPWV8fFR9c3BhY2UoZSl7bGV0IHQ9dGhpcy5ydWxlcy5ibG9jay5uZXdsaW5lLmV4ZWMoZSk7aWYodCYmdFswXS5sZW5ndGg+MClyZXR1cm57dHlwZTpcInNwYWNlXCIscmF3OnRbMF19fWNvZGUoZSl7bGV0IHQ9dGhpcy5ydWxlcy5ibG9jay5jb2RlLmV4ZWMoZSk7aWYodCl7bGV0IG49dFswXS5yZXBsYWNlKHRoaXMucnVsZXMub3RoZXIuY29kZVJlbW92ZUluZGVudCxcIlwiKTtyZXR1cm57dHlwZTpcImNvZGVcIixyYXc6dFswXSxjb2RlQmxvY2tTdHlsZTpcImluZGVudGVkXCIsdGV4dDp0aGlzLm9wdGlvbnMucGVkYW50aWM/bjp6KG4sYFxuYCl9fX1mZW5jZXMoZSl7bGV0IHQ9dGhpcy5ydWxlcy5ibG9jay5mZW5jZXMuZXhlYyhlKTtpZih0KXtsZXQgbj10WzBdLHI9WWUobix0WzNdfHxcIlwiLHRoaXMucnVsZXMpO3JldHVybnt0eXBlOlwiY29kZVwiLHJhdzpuLGxhbmc6dFsyXT90WzJdLnRyaW0oKS5yZXBsYWNlKHRoaXMucnVsZXMuaW5saW5lLmFueVB1bmN0dWF0aW9uLFwiJDFcIik6dFsyXSx0ZXh0OnJ9fX1oZWFkaW5nKGUpe2xldCB0PXRoaXMucnVsZXMuYmxvY2suaGVhZGluZy5leGVjKGUpO2lmKHQpe2xldCBuPXRbMl0udHJpbSgpO2lmKHRoaXMucnVsZXMub3RoZXIuZW5kaW5nSGFzaC50ZXN0KG4pKXtsZXQgcj16KG4sXCIjXCIpOyh0aGlzLm9wdGlvbnMucGVkYW50aWN8fCFyfHx0aGlzLnJ1bGVzLm90aGVyLmVuZGluZ1NwYWNlQ2hhci50ZXN0KHIpKSYmKG49ci50cmltKCkpfXJldHVybnt0eXBlOlwiaGVhZGluZ1wiLHJhdzp0WzBdLGRlcHRoOnRbMV0ubGVuZ3RoLHRleHQ6bix0b2tlbnM6dGhpcy5sZXhlci5pbmxpbmUobil9fX1ocihlKXtsZXQgdD10aGlzLnJ1bGVzLmJsb2NrLmhyLmV4ZWMoZSk7aWYodClyZXR1cm57dHlwZTpcImhyXCIscmF3OnoodFswXSxgXG5gKX19YmxvY2txdW90ZShlKXtsZXQgdD10aGlzLnJ1bGVzLmJsb2NrLmJsb2NrcXVvdGUuZXhlYyhlKTtpZih0KXtsZXQgbj16KHRbMF0sYFxuYCkuc3BsaXQoYFxuYCkscj1cIlwiLGk9XCJcIixzPVtdO2Zvcig7bi5sZW5ndGg+MDspe2xldCBhPSExLG89W10scDtmb3IocD0wO3A8bi5sZW5ndGg7cCsrKWlmKHRoaXMucnVsZXMub3RoZXIuYmxvY2txdW90ZVN0YXJ0LnRlc3QobltwXSkpby5wdXNoKG5bcF0pLGE9ITA7ZWxzZSBpZighYSlvLnB1c2gobltwXSk7ZWxzZSBicmVhaztuPW4uc2xpY2UocCk7bGV0IHU9by5qb2luKGBcbmApLGM9dS5yZXBsYWNlKHRoaXMucnVsZXMub3RoZXIuYmxvY2txdW90ZVNldGV4dFJlcGxhY2UsYFxuICAgICQxYCkucmVwbGFjZSh0aGlzLnJ1bGVzLm90aGVyLmJsb2NrcXVvdGVTZXRleHRSZXBsYWNlMixcIlwiKTtyPXI/YCR7cn1cbiR7dX1gOnUsaT1pP2Ake2l9XG4ke2N9YDpjO2xldCBnPXRoaXMubGV4ZXIuc3RhdGUudG9wO2lmKHRoaXMubGV4ZXIuc3RhdGUudG9wPSEwLHRoaXMubGV4ZXIuYmxvY2tUb2tlbnMoYyxzLCEwKSx0aGlzLmxleGVyLnN0YXRlLnRvcD1nLG4ubGVuZ3RoPT09MClicmVhaztsZXQgaD1zLmF0KC0xKTtpZihoPy50eXBlPT09XCJjb2RlXCIpYnJlYWs7aWYoaD8udHlwZT09PVwiYmxvY2txdW90ZVwiKXtsZXQgUj1oLGY9Ui5yYXcrYFxuYCtuLmpvaW4oYFxuYCksTz10aGlzLmJsb2NrcXVvdGUoZik7c1tzLmxlbmd0aC0xXT1PLHI9ci5zdWJzdHJpbmcoMCxyLmxlbmd0aC1SLnJhdy5sZW5ndGgpK08ucmF3LGk9aS5zdWJzdHJpbmcoMCxpLmxlbmd0aC1SLnRleHQubGVuZ3RoKStPLnRleHQ7YnJlYWt9ZWxzZSBpZihoPy50eXBlPT09XCJsaXN0XCIpe2xldCBSPWgsZj1SLnJhdytgXG5gK24uam9pbihgXG5gKSxPPXRoaXMubGlzdChmKTtzW3MubGVuZ3RoLTFdPU8scj1yLnN1YnN0cmluZygwLHIubGVuZ3RoLWgucmF3Lmxlbmd0aCkrTy5yYXcsaT1pLnN1YnN0cmluZygwLGkubGVuZ3RoLVIucmF3Lmxlbmd0aCkrTy5yYXcsbj1mLnN1YnN0cmluZyhzLmF0KC0xKS5yYXcubGVuZ3RoKS5zcGxpdChgXG5gKTtjb250aW51ZX19cmV0dXJue3R5cGU6XCJibG9ja3F1b3RlXCIscmF3OnIsdG9rZW5zOnMsdGV4dDppfX19bGlzdChlKXtsZXQgdD10aGlzLnJ1bGVzLmJsb2NrLmxpc3QuZXhlYyhlKTtpZih0KXtsZXQgbj10WzFdLnRyaW0oKSxyPW4ubGVuZ3RoPjEsaT17dHlwZTpcImxpc3RcIixyYXc6XCJcIixvcmRlcmVkOnIsc3RhcnQ6cj8rbi5zbGljZSgwLC0xKTpcIlwiLGxvb3NlOiExLGl0ZW1zOltdfTtuPXI/YFxcXFxkezEsOX1cXFxcJHtuLnNsaWNlKC0xKX1gOmBcXFxcJHtufWAsdGhpcy5vcHRpb25zLnBlZGFudGljJiYobj1yP246XCJbKistXVwiKTtsZXQgcz10aGlzLnJ1bGVzLm90aGVyLmxpc3RJdGVtUmVnZXgobiksYT0hMTtmb3IoO2U7KXtsZXQgcD0hMSx1PVwiXCIsYz1cIlwiO2lmKCEodD1zLmV4ZWMoZSkpfHx0aGlzLnJ1bGVzLmJsb2NrLmhyLnRlc3QoZSkpYnJlYWs7dT10WzBdLGU9ZS5zdWJzdHJpbmcodS5sZW5ndGgpO2xldCBnPXRbMl0uc3BsaXQoYFxuYCwxKVswXS5yZXBsYWNlKHRoaXMucnVsZXMub3RoZXIubGlzdFJlcGxhY2VUYWJzLEg9PlwiIFwiLnJlcGVhdCgzKkgubGVuZ3RoKSksaD1lLnNwbGl0KGBcbmAsMSlbMF0sUj0hZy50cmltKCksZj0wO2lmKHRoaXMub3B0aW9ucy5wZWRhbnRpYz8oZj0yLGM9Zy50cmltU3RhcnQoKSk6Uj9mPXRbMV0ubGVuZ3RoKzE6KGY9dFsyXS5zZWFyY2godGhpcy5ydWxlcy5vdGhlci5ub25TcGFjZUNoYXIpLGY9Zj40PzE6ZixjPWcuc2xpY2UoZiksZis9dFsxXS5sZW5ndGgpLFImJnRoaXMucnVsZXMub3RoZXIuYmxhbmtMaW5lLnRlc3QoaCkmJih1Kz1oK2BcbmAsZT1lLnN1YnN0cmluZyhoLmxlbmd0aCsxKSxwPSEwKSwhcCl7bGV0IEg9dGhpcy5ydWxlcy5vdGhlci5uZXh0QnVsbGV0UmVnZXgoZiksZWU9dGhpcy5ydWxlcy5vdGhlci5oclJlZ2V4KGYpLHRlPXRoaXMucnVsZXMub3RoZXIuZmVuY2VzQmVnaW5SZWdleChmKSxuZT10aGlzLnJ1bGVzLm90aGVyLmhlYWRpbmdCZWdpblJlZ2V4KGYpLHhlPXRoaXMucnVsZXMub3RoZXIuaHRtbEJlZ2luUmVnZXgoZik7Zm9yKDtlOyl7bGV0IFo9ZS5zcGxpdChgXG5gLDEpWzBdLEE7aWYoaD1aLHRoaXMub3B0aW9ucy5wZWRhbnRpYz8oaD1oLnJlcGxhY2UodGhpcy5ydWxlcy5vdGhlci5saXN0UmVwbGFjZU5lc3RpbmcsXCIgIFwiKSxBPWgpOkE9aC5yZXBsYWNlKHRoaXMucnVsZXMub3RoZXIudGFiQ2hhckdsb2JhbCxcIiAgICBcIiksdGUudGVzdChoKXx8bmUudGVzdChoKXx8eGUudGVzdChoKXx8SC50ZXN0KGgpfHxlZS50ZXN0KGgpKWJyZWFrO2lmKEEuc2VhcmNoKHRoaXMucnVsZXMub3RoZXIubm9uU3BhY2VDaGFyKT49Znx8IWgudHJpbSgpKWMrPWBcbmArQS5zbGljZShmKTtlbHNle2lmKFJ8fGcucmVwbGFjZSh0aGlzLnJ1bGVzLm90aGVyLnRhYkNoYXJHbG9iYWwsXCIgICAgXCIpLnNlYXJjaCh0aGlzLnJ1bGVzLm90aGVyLm5vblNwYWNlQ2hhcik+PTR8fHRlLnRlc3QoZyl8fG5lLnRlc3QoZyl8fGVlLnRlc3QoZykpYnJlYWs7Yys9YFxuYCtofSFSJiYhaC50cmltKCkmJihSPSEwKSx1Kz1aK2BcbmAsZT1lLnN1YnN0cmluZyhaLmxlbmd0aCsxKSxnPUEuc2xpY2UoZil9fWkubG9vc2V8fChhP2kubG9vc2U9ITA6dGhpcy5ydWxlcy5vdGhlci5kb3VibGVCbGFua0xpbmUudGVzdCh1KSYmKGE9ITApKTtsZXQgTz1udWxsLFk7dGhpcy5vcHRpb25zLmdmbSYmKE89dGhpcy5ydWxlcy5vdGhlci5saXN0SXNUYXNrLmV4ZWMoYyksTyYmKFk9T1swXSE9PVwiWyBdIFwiLGM9Yy5yZXBsYWNlKHRoaXMucnVsZXMub3RoZXIubGlzdFJlcGxhY2VUYXNrLFwiXCIpKSksaS5pdGVtcy5wdXNoKHt0eXBlOlwibGlzdF9pdGVtXCIscmF3OnUsdGFzazohIU8sY2hlY2tlZDpZLGxvb3NlOiExLHRleHQ6Yyx0b2tlbnM6W119KSxpLnJhdys9dX1sZXQgbz1pLml0ZW1zLmF0KC0xKTtpZihvKW8ucmF3PW8ucmF3LnRyaW1FbmQoKSxvLnRleHQ9by50ZXh0LnRyaW1FbmQoKTtlbHNlIHJldHVybjtpLnJhdz1pLnJhdy50cmltRW5kKCk7Zm9yKGxldCBwPTA7cDxpLml0ZW1zLmxlbmd0aDtwKyspaWYodGhpcy5sZXhlci5zdGF0ZS50b3A9ITEsaS5pdGVtc1twXS50b2tlbnM9dGhpcy5sZXhlci5ibG9ja1Rva2VucyhpLml0ZW1zW3BdLnRleHQsW10pLCFpLmxvb3NlKXtsZXQgdT1pLml0ZW1zW3BdLnRva2Vucy5maWx0ZXIoZz0+Zy50eXBlPT09XCJzcGFjZVwiKSxjPXUubGVuZ3RoPjAmJnUuc29tZShnPT50aGlzLnJ1bGVzLm90aGVyLmFueUxpbmUudGVzdChnLnJhdykpO2kubG9vc2U9Y31pZihpLmxvb3NlKWZvcihsZXQgcD0wO3A8aS5pdGVtcy5sZW5ndGg7cCsrKWkuaXRlbXNbcF0ubG9vc2U9ITA7cmV0dXJuIGl9fWh0bWwoZSl7bGV0IHQ9dGhpcy5ydWxlcy5ibG9jay5odG1sLmV4ZWMoZSk7aWYodClyZXR1cm57dHlwZTpcImh0bWxcIixibG9jazohMCxyYXc6dFswXSxwcmU6dFsxXT09PVwicHJlXCJ8fHRbMV09PT1cInNjcmlwdFwifHx0WzFdPT09XCJzdHlsZVwiLHRleHQ6dFswXX19ZGVmKGUpe2xldCB0PXRoaXMucnVsZXMuYmxvY2suZGVmLmV4ZWMoZSk7aWYodCl7bGV0IG49dFsxXS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UodGhpcy5ydWxlcy5vdGhlci5tdWx0aXBsZVNwYWNlR2xvYmFsLFwiIFwiKSxyPXRbMl0/dFsyXS5yZXBsYWNlKHRoaXMucnVsZXMub3RoZXIuaHJlZkJyYWNrZXRzLFwiJDFcIikucmVwbGFjZSh0aGlzLnJ1bGVzLmlubGluZS5hbnlQdW5jdHVhdGlvbixcIiQxXCIpOlwiXCIsaT10WzNdP3RbM10uc3Vic3RyaW5nKDEsdFszXS5sZW5ndGgtMSkucmVwbGFjZSh0aGlzLnJ1bGVzLmlubGluZS5hbnlQdW5jdHVhdGlvbixcIiQxXCIpOnRbM107cmV0dXJue3R5cGU6XCJkZWZcIix0YWc6bixyYXc6dFswXSxocmVmOnIsdGl0bGU6aX19fXRhYmxlKGUpe2xldCB0PXRoaXMucnVsZXMuYmxvY2sudGFibGUuZXhlYyhlKTtpZighdHx8IXRoaXMucnVsZXMub3RoZXIudGFibGVEZWxpbWl0ZXIudGVzdCh0WzJdKSlyZXR1cm47bGV0IG49Vih0WzFdKSxyPXRbMl0ucmVwbGFjZSh0aGlzLnJ1bGVzLm90aGVyLnRhYmxlQWxpZ25DaGFycyxcIlwiKS5zcGxpdChcInxcIiksaT10WzNdPy50cmltKCk/dFszXS5yZXBsYWNlKHRoaXMucnVsZXMub3RoZXIudGFibGVSb3dCbGFua0xpbmUsXCJcIikuc3BsaXQoYFxuYCk6W10scz17dHlwZTpcInRhYmxlXCIscmF3OnRbMF0saGVhZGVyOltdLGFsaWduOltdLHJvd3M6W119O2lmKG4ubGVuZ3RoPT09ci5sZW5ndGgpe2ZvcihsZXQgYSBvZiByKXRoaXMucnVsZXMub3RoZXIudGFibGVBbGlnblJpZ2h0LnRlc3QoYSk/cy5hbGlnbi5wdXNoKFwicmlnaHRcIik6dGhpcy5ydWxlcy5vdGhlci50YWJsZUFsaWduQ2VudGVyLnRlc3QoYSk/cy5hbGlnbi5wdXNoKFwiY2VudGVyXCIpOnRoaXMucnVsZXMub3RoZXIudGFibGVBbGlnbkxlZnQudGVzdChhKT9zLmFsaWduLnB1c2goXCJsZWZ0XCIpOnMuYWxpZ24ucHVzaChudWxsKTtmb3IobGV0IGE9MDthPG4ubGVuZ3RoO2ErKylzLmhlYWRlci5wdXNoKHt0ZXh0Om5bYV0sdG9rZW5zOnRoaXMubGV4ZXIuaW5saW5lKG5bYV0pLGhlYWRlcjohMCxhbGlnbjpzLmFsaWduW2FdfSk7Zm9yKGxldCBhIG9mIGkpcy5yb3dzLnB1c2goVihhLHMuaGVhZGVyLmxlbmd0aCkubWFwKChvLHApPT4oe3RleHQ6byx0b2tlbnM6dGhpcy5sZXhlci5pbmxpbmUobyksaGVhZGVyOiExLGFsaWduOnMuYWxpZ25bcF19KSkpO3JldHVybiBzfX1saGVhZGluZyhlKXtsZXQgdD10aGlzLnJ1bGVzLmJsb2NrLmxoZWFkaW5nLmV4ZWMoZSk7aWYodClyZXR1cm57dHlwZTpcImhlYWRpbmdcIixyYXc6dFswXSxkZXB0aDp0WzJdLmNoYXJBdCgwKT09PVwiPVwiPzE6Mix0ZXh0OnRbMV0sdG9rZW5zOnRoaXMubGV4ZXIuaW5saW5lKHRbMV0pfX1wYXJhZ3JhcGgoZSl7bGV0IHQ9dGhpcy5ydWxlcy5ibG9jay5wYXJhZ3JhcGguZXhlYyhlKTtpZih0KXtsZXQgbj10WzFdLmNoYXJBdCh0WzFdLmxlbmd0aC0xKT09PWBcbmA/dFsxXS5zbGljZSgwLC0xKTp0WzFdO3JldHVybnt0eXBlOlwicGFyYWdyYXBoXCIscmF3OnRbMF0sdGV4dDpuLHRva2Vuczp0aGlzLmxleGVyLmlubGluZShuKX19fXRleHQoZSl7bGV0IHQ9dGhpcy5ydWxlcy5ibG9jay50ZXh0LmV4ZWMoZSk7aWYodClyZXR1cm57dHlwZTpcInRleHRcIixyYXc6dFswXSx0ZXh0OnRbMF0sdG9rZW5zOnRoaXMubGV4ZXIuaW5saW5lKHRbMF0pfX1lc2NhcGUoZSl7bGV0IHQ9dGhpcy5ydWxlcy5pbmxpbmUuZXNjYXBlLmV4ZWMoZSk7aWYodClyZXR1cm57dHlwZTpcImVzY2FwZVwiLHJhdzp0WzBdLHRleHQ6dFsxXX19dGFnKGUpe2xldCB0PXRoaXMucnVsZXMuaW5saW5lLnRhZy5leGVjKGUpO2lmKHQpcmV0dXJuIXRoaXMubGV4ZXIuc3RhdGUuaW5MaW5rJiZ0aGlzLnJ1bGVzLm90aGVyLnN0YXJ0QVRhZy50ZXN0KHRbMF0pP3RoaXMubGV4ZXIuc3RhdGUuaW5MaW5rPSEwOnRoaXMubGV4ZXIuc3RhdGUuaW5MaW5rJiZ0aGlzLnJ1bGVzLm90aGVyLmVuZEFUYWcudGVzdCh0WzBdKSYmKHRoaXMubGV4ZXIuc3RhdGUuaW5MaW5rPSExKSwhdGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrJiZ0aGlzLnJ1bGVzLm90aGVyLnN0YXJ0UHJlU2NyaXB0VGFnLnRlc3QodFswXSk/dGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrPSEwOnRoaXMubGV4ZXIuc3RhdGUuaW5SYXdCbG9jayYmdGhpcy5ydWxlcy5vdGhlci5lbmRQcmVTY3JpcHRUYWcudGVzdCh0WzBdKSYmKHRoaXMubGV4ZXIuc3RhdGUuaW5SYXdCbG9jaz0hMSkse3R5cGU6XCJodG1sXCIscmF3OnRbMF0saW5MaW5rOnRoaXMubGV4ZXIuc3RhdGUuaW5MaW5rLGluUmF3QmxvY2s6dGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrLGJsb2NrOiExLHRleHQ6dFswXX19bGluayhlKXtsZXQgdD10aGlzLnJ1bGVzLmlubGluZS5saW5rLmV4ZWMoZSk7aWYodCl7bGV0IG49dFsyXS50cmltKCk7aWYoIXRoaXMub3B0aW9ucy5wZWRhbnRpYyYmdGhpcy5ydWxlcy5vdGhlci5zdGFydEFuZ2xlQnJhY2tldC50ZXN0KG4pKXtpZighdGhpcy5ydWxlcy5vdGhlci5lbmRBbmdsZUJyYWNrZXQudGVzdChuKSlyZXR1cm47bGV0IHM9eihuLnNsaWNlKDAsLTEpLFwiXFxcXFwiKTtpZigobi5sZW5ndGgtcy5sZW5ndGgpJTI9PT0wKXJldHVybn1lbHNle2xldCBzPWZlKHRbMl0sXCIoKVwiKTtpZihzPT09LTIpcmV0dXJuO2lmKHM+LTEpe2xldCBvPSh0WzBdLmluZGV4T2YoXCIhXCIpPT09MD81OjQpK3RbMV0ubGVuZ3RoK3M7dFsyXT10WzJdLnN1YnN0cmluZygwLHMpLHRbMF09dFswXS5zdWJzdHJpbmcoMCxvKS50cmltKCksdFszXT1cIlwifX1sZXQgcj10WzJdLGk9XCJcIjtpZih0aGlzLm9wdGlvbnMucGVkYW50aWMpe2xldCBzPXRoaXMucnVsZXMub3RoZXIucGVkYW50aWNIcmVmVGl0bGUuZXhlYyhyKTtzJiYocj1zWzFdLGk9c1szXSl9ZWxzZSBpPXRbM10/dFszXS5zbGljZSgxLC0xKTpcIlwiO3JldHVybiByPXIudHJpbSgpLHRoaXMucnVsZXMub3RoZXIuc3RhcnRBbmdsZUJyYWNrZXQudGVzdChyKSYmKHRoaXMub3B0aW9ucy5wZWRhbnRpYyYmIXRoaXMucnVsZXMub3RoZXIuZW5kQW5nbGVCcmFja2V0LnRlc3Qobik/cj1yLnNsaWNlKDEpOnI9ci5zbGljZSgxLC0xKSksbWUodCx7aHJlZjpyJiZyLnJlcGxhY2UodGhpcy5ydWxlcy5pbmxpbmUuYW55UHVuY3R1YXRpb24sXCIkMVwiKSx0aXRsZTppJiZpLnJlcGxhY2UodGhpcy5ydWxlcy5pbmxpbmUuYW55UHVuY3R1YXRpb24sXCIkMVwiKX0sdFswXSx0aGlzLmxleGVyLHRoaXMucnVsZXMpfX1yZWZsaW5rKGUsdCl7bGV0IG47aWYoKG49dGhpcy5ydWxlcy5pbmxpbmUucmVmbGluay5leGVjKGUpKXx8KG49dGhpcy5ydWxlcy5pbmxpbmUubm9saW5rLmV4ZWMoZSkpKXtsZXQgcj0oblsyXXx8blsxXSkucmVwbGFjZSh0aGlzLnJ1bGVzLm90aGVyLm11bHRpcGxlU3BhY2VHbG9iYWwsXCIgXCIpLGk9dFtyLnRvTG93ZXJDYXNlKCldO2lmKCFpKXtsZXQgcz1uWzBdLmNoYXJBdCgwKTtyZXR1cm57dHlwZTpcInRleHRcIixyYXc6cyx0ZXh0OnN9fXJldHVybiBtZShuLGksblswXSx0aGlzLmxleGVyLHRoaXMucnVsZXMpfX1lbVN0cm9uZyhlLHQsbj1cIlwiKXtsZXQgcj10aGlzLnJ1bGVzLmlubGluZS5lbVN0cm9uZ0xEZWxpbS5leGVjKGUpO2lmKCFyfHxyWzNdJiZuLm1hdGNoKHRoaXMucnVsZXMub3RoZXIudW5pY29kZUFscGhhTnVtZXJpYykpcmV0dXJuO2lmKCEoclsxXXx8clsyXXx8XCJcIil8fCFufHx0aGlzLnJ1bGVzLmlubGluZS5wdW5jdHVhdGlvbi5leGVjKG4pKXtsZXQgcz1bLi4uclswXV0ubGVuZ3RoLTEsYSxvLHA9cyx1PTAsYz1yWzBdWzBdPT09XCIqXCI/dGhpcy5ydWxlcy5pbmxpbmUuZW1TdHJvbmdSRGVsaW1Bc3Q6dGhpcy5ydWxlcy5pbmxpbmUuZW1TdHJvbmdSRGVsaW1VbmQ7Zm9yKGMubGFzdEluZGV4PTAsdD10LnNsaWNlKC0xKmUubGVuZ3RoK3MpOyhyPWMuZXhlYyh0KSkhPW51bGw7KXtpZihhPXJbMV18fHJbMl18fHJbM118fHJbNF18fHJbNV18fHJbNl0sIWEpY29udGludWU7aWYobz1bLi4uYV0ubGVuZ3RoLHJbM118fHJbNF0pe3ArPW87Y29udGludWV9ZWxzZSBpZigocls1XXx8cls2XSkmJnMlMyYmISgocytvKSUzKSl7dSs9bztjb250aW51ZX1pZihwLT1vLHA+MCljb250aW51ZTtvPU1hdGgubWluKG8sbytwK3UpO2xldCBnPVsuLi5yWzBdXVswXS5sZW5ndGgsaD1lLnNsaWNlKDAscytyLmluZGV4K2crbyk7aWYoTWF0aC5taW4ocyxvKSUyKXtsZXQgZj1oLnNsaWNlKDEsLTEpO3JldHVybnt0eXBlOlwiZW1cIixyYXc6aCx0ZXh0OmYsdG9rZW5zOnRoaXMubGV4ZXIuaW5saW5lVG9rZW5zKGYpfX1sZXQgUj1oLnNsaWNlKDIsLTIpO3JldHVybnt0eXBlOlwic3Ryb25nXCIscmF3OmgsdGV4dDpSLHRva2Vuczp0aGlzLmxleGVyLmlubGluZVRva2VucyhSKX19fX1jb2Rlc3BhbihlKXtsZXQgdD10aGlzLnJ1bGVzLmlubGluZS5jb2RlLmV4ZWMoZSk7aWYodCl7bGV0IG49dFsyXS5yZXBsYWNlKHRoaXMucnVsZXMub3RoZXIubmV3TGluZUNoYXJHbG9iYWwsXCIgXCIpLHI9dGhpcy5ydWxlcy5vdGhlci5ub25TcGFjZUNoYXIudGVzdChuKSxpPXRoaXMucnVsZXMub3RoZXIuc3RhcnRpbmdTcGFjZUNoYXIudGVzdChuKSYmdGhpcy5ydWxlcy5vdGhlci5lbmRpbmdTcGFjZUNoYXIudGVzdChuKTtyZXR1cm4gciYmaSYmKG49bi5zdWJzdHJpbmcoMSxuLmxlbmd0aC0xKSkse3R5cGU6XCJjb2Rlc3BhblwiLHJhdzp0WzBdLHRleHQ6bn19fWJyKGUpe2xldCB0PXRoaXMucnVsZXMuaW5saW5lLmJyLmV4ZWMoZSk7aWYodClyZXR1cm57dHlwZTpcImJyXCIscmF3OnRbMF19fWRlbChlKXtsZXQgdD10aGlzLnJ1bGVzLmlubGluZS5kZWwuZXhlYyhlKTtpZih0KXJldHVybnt0eXBlOlwiZGVsXCIscmF3OnRbMF0sdGV4dDp0WzJdLHRva2Vuczp0aGlzLmxleGVyLmlubGluZVRva2Vucyh0WzJdKX19YXV0b2xpbmsoZSl7bGV0IHQ9dGhpcy5ydWxlcy5pbmxpbmUuYXV0b2xpbmsuZXhlYyhlKTtpZih0KXtsZXQgbixyO3JldHVybiB0WzJdPT09XCJAXCI/KG49dFsxXSxyPVwibWFpbHRvOlwiK24pOihuPXRbMV0scj1uKSx7dHlwZTpcImxpbmtcIixyYXc6dFswXSx0ZXh0Om4saHJlZjpyLHRva2Vuczpbe3R5cGU6XCJ0ZXh0XCIscmF3Om4sdGV4dDpufV19fX11cmwoZSl7bGV0IHQ7aWYodD10aGlzLnJ1bGVzLmlubGluZS51cmwuZXhlYyhlKSl7bGV0IG4scjtpZih0WzJdPT09XCJAXCIpbj10WzBdLHI9XCJtYWlsdG86XCIrbjtlbHNle2xldCBpO2RvIGk9dFswXSx0WzBdPXRoaXMucnVsZXMuaW5saW5lLl9iYWNrcGVkYWwuZXhlYyh0WzBdKT8uWzBdPz9cIlwiO3doaWxlKGkhPT10WzBdKTtuPXRbMF0sdFsxXT09PVwid3d3LlwiP3I9XCJodHRwOi8vXCIrdFswXTpyPXRbMF19cmV0dXJue3R5cGU6XCJsaW5rXCIscmF3OnRbMF0sdGV4dDpuLGhyZWY6cix0b2tlbnM6W3t0eXBlOlwidGV4dFwiLHJhdzpuLHRleHQ6bn1dfX19aW5saW5lVGV4dChlKXtsZXQgdD10aGlzLnJ1bGVzLmlubGluZS50ZXh0LmV4ZWMoZSk7aWYodCl7bGV0IG49dGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrO3JldHVybnt0eXBlOlwidGV4dFwiLHJhdzp0WzBdLHRleHQ6dFswXSxlc2NhcGVkOm59fX19O3ZhciB4PWNsYXNzIGx7dG9rZW5zO29wdGlvbnM7c3RhdGU7dG9rZW5pemVyO2lubGluZVF1ZXVlO2NvbnN0cnVjdG9yKGUpe3RoaXMudG9rZW5zPVtdLHRoaXMudG9rZW5zLmxpbmtzPU9iamVjdC5jcmVhdGUobnVsbCksdGhpcy5vcHRpb25zPWV8fFQsdGhpcy5vcHRpb25zLnRva2VuaXplcj10aGlzLm9wdGlvbnMudG9rZW5pemVyfHxuZXcgeSx0aGlzLnRva2VuaXplcj10aGlzLm9wdGlvbnMudG9rZW5pemVyLHRoaXMudG9rZW5pemVyLm9wdGlvbnM9dGhpcy5vcHRpb25zLHRoaXMudG9rZW5pemVyLmxleGVyPXRoaXMsdGhpcy5pbmxpbmVRdWV1ZT1bXSx0aGlzLnN0YXRlPXtpbkxpbms6ITEsaW5SYXdCbG9jazohMSx0b3A6ITB9O2xldCB0PXtvdGhlcjptLGJsb2NrOkMubm9ybWFsLGlubGluZTpNLm5vcm1hbH07dGhpcy5vcHRpb25zLnBlZGFudGljPyh0LmJsb2NrPUMucGVkYW50aWMsdC5pbmxpbmU9TS5wZWRhbnRpYyk6dGhpcy5vcHRpb25zLmdmbSYmKHQuYmxvY2s9Qy5nZm0sdGhpcy5vcHRpb25zLmJyZWFrcz90LmlubGluZT1NLmJyZWFrczp0LmlubGluZT1NLmdmbSksdGhpcy50b2tlbml6ZXIucnVsZXM9dH1zdGF0aWMgZ2V0IHJ1bGVzKCl7cmV0dXJue2Jsb2NrOkMsaW5saW5lOk19fXN0YXRpYyBsZXgoZSx0KXtyZXR1cm4gbmV3IGwodCkubGV4KGUpfXN0YXRpYyBsZXhJbmxpbmUoZSx0KXtyZXR1cm4gbmV3IGwodCkuaW5saW5lVG9rZW5zKGUpfWxleChlKXtlPWUucmVwbGFjZShtLmNhcnJpYWdlUmV0dXJuLGBcbmApLHRoaXMuYmxvY2tUb2tlbnMoZSx0aGlzLnRva2Vucyk7Zm9yKGxldCB0PTA7dDx0aGlzLmlubGluZVF1ZXVlLmxlbmd0aDt0Kyspe2xldCBuPXRoaXMuaW5saW5lUXVldWVbdF07dGhpcy5pbmxpbmVUb2tlbnMobi5zcmMsbi50b2tlbnMpfXJldHVybiB0aGlzLmlubGluZVF1ZXVlPVtdLHRoaXMudG9rZW5zfWJsb2NrVG9rZW5zKGUsdD1bXSxuPSExKXtmb3IodGhpcy5vcHRpb25zLnBlZGFudGljJiYoZT1lLnJlcGxhY2UobS50YWJDaGFyR2xvYmFsLFwiICAgIFwiKS5yZXBsYWNlKG0uc3BhY2VMaW5lLFwiXCIpKTtlOyl7bGV0IHI7aWYodGhpcy5vcHRpb25zLmV4dGVuc2lvbnM/LmJsb2NrPy5zb21lKHM9PihyPXMuY2FsbCh7bGV4ZXI6dGhpc30sZSx0KSk/KGU9ZS5zdWJzdHJpbmcoci5yYXcubGVuZ3RoKSx0LnB1c2gociksITApOiExKSljb250aW51ZTtpZihyPXRoaXMudG9rZW5pemVyLnNwYWNlKGUpKXtlPWUuc3Vic3RyaW5nKHIucmF3Lmxlbmd0aCk7bGV0IHM9dC5hdCgtMSk7ci5yYXcubGVuZ3RoPT09MSYmcyE9PXZvaWQgMD9zLnJhdys9YFxuYDp0LnB1c2gocik7Y29udGludWV9aWYocj10aGlzLnRva2VuaXplci5jb2RlKGUpKXtlPWUuc3Vic3RyaW5nKHIucmF3Lmxlbmd0aCk7bGV0IHM9dC5hdCgtMSk7cz8udHlwZT09PVwicGFyYWdyYXBoXCJ8fHM/LnR5cGU9PT1cInRleHRcIj8ocy5yYXcrPShzLnJhdy5lbmRzV2l0aChgXG5gKT9cIlwiOmBcbmApK3IucmF3LHMudGV4dCs9YFxuYCtyLnRleHQsdGhpcy5pbmxpbmVRdWV1ZS5hdCgtMSkuc3JjPXMudGV4dCk6dC5wdXNoKHIpO2NvbnRpbnVlfWlmKHI9dGhpcy50b2tlbml6ZXIuZmVuY2VzKGUpKXtlPWUuc3Vic3RyaW5nKHIucmF3Lmxlbmd0aCksdC5wdXNoKHIpO2NvbnRpbnVlfWlmKHI9dGhpcy50b2tlbml6ZXIuaGVhZGluZyhlKSl7ZT1lLnN1YnN0cmluZyhyLnJhdy5sZW5ndGgpLHQucHVzaChyKTtjb250aW51ZX1pZihyPXRoaXMudG9rZW5pemVyLmhyKGUpKXtlPWUuc3Vic3RyaW5nKHIucmF3Lmxlbmd0aCksdC5wdXNoKHIpO2NvbnRpbnVlfWlmKHI9dGhpcy50b2tlbml6ZXIuYmxvY2txdW90ZShlKSl7ZT1lLnN1YnN0cmluZyhyLnJhdy5sZW5ndGgpLHQucHVzaChyKTtjb250aW51ZX1pZihyPXRoaXMudG9rZW5pemVyLmxpc3QoZSkpe2U9ZS5zdWJzdHJpbmcoci5yYXcubGVuZ3RoKSx0LnB1c2gocik7Y29udGludWV9aWYocj10aGlzLnRva2VuaXplci5odG1sKGUpKXtlPWUuc3Vic3RyaW5nKHIucmF3Lmxlbmd0aCksdC5wdXNoKHIpO2NvbnRpbnVlfWlmKHI9dGhpcy50b2tlbml6ZXIuZGVmKGUpKXtlPWUuc3Vic3RyaW5nKHIucmF3Lmxlbmd0aCk7bGV0IHM9dC5hdCgtMSk7cz8udHlwZT09PVwicGFyYWdyYXBoXCJ8fHM/LnR5cGU9PT1cInRleHRcIj8ocy5yYXcrPShzLnJhdy5lbmRzV2l0aChgXG5gKT9cIlwiOmBcbmApK3IucmF3LHMudGV4dCs9YFxuYCtyLnJhdyx0aGlzLmlubGluZVF1ZXVlLmF0KC0xKS5zcmM9cy50ZXh0KTp0aGlzLnRva2Vucy5saW5rc1tyLnRhZ118fCh0aGlzLnRva2Vucy5saW5rc1tyLnRhZ109e2hyZWY6ci5ocmVmLHRpdGxlOnIudGl0bGV9LHQucHVzaChyKSk7Y29udGludWV9aWYocj10aGlzLnRva2VuaXplci50YWJsZShlKSl7ZT1lLnN1YnN0cmluZyhyLnJhdy5sZW5ndGgpLHQucHVzaChyKTtjb250aW51ZX1pZihyPXRoaXMudG9rZW5pemVyLmxoZWFkaW5nKGUpKXtlPWUuc3Vic3RyaW5nKHIucmF3Lmxlbmd0aCksdC5wdXNoKHIpO2NvbnRpbnVlfWxldCBpPWU7aWYodGhpcy5vcHRpb25zLmV4dGVuc2lvbnM/LnN0YXJ0QmxvY2spe2xldCBzPTEvMCxhPWUuc2xpY2UoMSksbzt0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5zdGFydEJsb2NrLmZvckVhY2gocD0+e289cC5jYWxsKHtsZXhlcjp0aGlzfSxhKSx0eXBlb2Ygbz09XCJudW1iZXJcIiYmbz49MCYmKHM9TWF0aC5taW4ocyxvKSl9KSxzPDEvMCYmcz49MCYmKGk9ZS5zdWJzdHJpbmcoMCxzKzEpKX1pZih0aGlzLnN0YXRlLnRvcCYmKHI9dGhpcy50b2tlbml6ZXIucGFyYWdyYXBoKGkpKSl7bGV0IHM9dC5hdCgtMSk7biYmcz8udHlwZT09PVwicGFyYWdyYXBoXCI/KHMucmF3Kz0ocy5yYXcuZW5kc1dpdGgoYFxuYCk/XCJcIjpgXG5gKStyLnJhdyxzLnRleHQrPWBcbmArci50ZXh0LHRoaXMuaW5saW5lUXVldWUucG9wKCksdGhpcy5pbmxpbmVRdWV1ZS5hdCgtMSkuc3JjPXMudGV4dCk6dC5wdXNoKHIpLG49aS5sZW5ndGghPT1lLmxlbmd0aCxlPWUuc3Vic3RyaW5nKHIucmF3Lmxlbmd0aCk7Y29udGludWV9aWYocj10aGlzLnRva2VuaXplci50ZXh0KGUpKXtlPWUuc3Vic3RyaW5nKHIucmF3Lmxlbmd0aCk7bGV0IHM9dC5hdCgtMSk7cz8udHlwZT09PVwidGV4dFwiPyhzLnJhdys9KHMucmF3LmVuZHNXaXRoKGBcbmApP1wiXCI6YFxuYCkrci5yYXcscy50ZXh0Kz1gXG5gK3IudGV4dCx0aGlzLmlubGluZVF1ZXVlLnBvcCgpLHRoaXMuaW5saW5lUXVldWUuYXQoLTEpLnNyYz1zLnRleHQpOnQucHVzaChyKTtjb250aW51ZX1pZihlKXtsZXQgcz1cIkluZmluaXRlIGxvb3Agb24gYnl0ZTogXCIrZS5jaGFyQ29kZUF0KDApO2lmKHRoaXMub3B0aW9ucy5zaWxlbnQpe2NvbnNvbGUuZXJyb3Iocyk7YnJlYWt9ZWxzZSB0aHJvdyBuZXcgRXJyb3Iocyl9fXJldHVybiB0aGlzLnN0YXRlLnRvcD0hMCx0fWlubGluZShlLHQ9W10pe3JldHVybiB0aGlzLmlubGluZVF1ZXVlLnB1c2goe3NyYzplLHRva2Vuczp0fSksdH1pbmxpbmVUb2tlbnMoZSx0PVtdKXtsZXQgbj1lLHI9bnVsbDtpZih0aGlzLnRva2Vucy5saW5rcyl7bGV0IG89T2JqZWN0LmtleXModGhpcy50b2tlbnMubGlua3MpO2lmKG8ubGVuZ3RoPjApZm9yKDsocj10aGlzLnRva2VuaXplci5ydWxlcy5pbmxpbmUucmVmbGlua1NlYXJjaC5leGVjKG4pKSE9bnVsbDspby5pbmNsdWRlcyhyWzBdLnNsaWNlKHJbMF0ubGFzdEluZGV4T2YoXCJbXCIpKzEsLTEpKSYmKG49bi5zbGljZSgwLHIuaW5kZXgpK1wiW1wiK1wiYVwiLnJlcGVhdChyWzBdLmxlbmd0aC0yKStcIl1cIituLnNsaWNlKHRoaXMudG9rZW5pemVyLnJ1bGVzLmlubGluZS5yZWZsaW5rU2VhcmNoLmxhc3RJbmRleCkpfWZvcig7KHI9dGhpcy50b2tlbml6ZXIucnVsZXMuaW5saW5lLmFueVB1bmN0dWF0aW9uLmV4ZWMobikpIT1udWxsOyluPW4uc2xpY2UoMCxyLmluZGV4KStcIisrXCIrbi5zbGljZSh0aGlzLnRva2VuaXplci5ydWxlcy5pbmxpbmUuYW55UHVuY3R1YXRpb24ubGFzdEluZGV4KTtsZXQgaTtmb3IoOyhyPXRoaXMudG9rZW5pemVyLnJ1bGVzLmlubGluZS5ibG9ja1NraXAuZXhlYyhuKSkhPW51bGw7KWk9clsyXT9yWzJdLmxlbmd0aDowLG49bi5zbGljZSgwLHIuaW5kZXgraSkrXCJbXCIrXCJhXCIucmVwZWF0KHJbMF0ubGVuZ3RoLWktMikrXCJdXCIrbi5zbGljZSh0aGlzLnRva2VuaXplci5ydWxlcy5pbmxpbmUuYmxvY2tTa2lwLmxhc3RJbmRleCk7bj10aGlzLm9wdGlvbnMuaG9va3M/LmVtU3Ryb25nTWFzaz8uY2FsbCh7bGV4ZXI6dGhpc30sbik/P247bGV0IHM9ITEsYT1cIlwiO2Zvcig7ZTspe3N8fChhPVwiXCIpLHM9ITE7bGV0IG87aWYodGhpcy5vcHRpb25zLmV4dGVuc2lvbnM/LmlubGluZT8uc29tZSh1PT4obz11LmNhbGwoe2xleGVyOnRoaXN9LGUsdCkpPyhlPWUuc3Vic3RyaW5nKG8ucmF3Lmxlbmd0aCksdC5wdXNoKG8pLCEwKTohMSkpY29udGludWU7aWYobz10aGlzLnRva2VuaXplci5lc2NhcGUoZSkpe2U9ZS5zdWJzdHJpbmcoby5yYXcubGVuZ3RoKSx0LnB1c2gobyk7Y29udGludWV9aWYobz10aGlzLnRva2VuaXplci50YWcoZSkpe2U9ZS5zdWJzdHJpbmcoby5yYXcubGVuZ3RoKSx0LnB1c2gobyk7Y29udGludWV9aWYobz10aGlzLnRva2VuaXplci5saW5rKGUpKXtlPWUuc3Vic3RyaW5nKG8ucmF3Lmxlbmd0aCksdC5wdXNoKG8pO2NvbnRpbnVlfWlmKG89dGhpcy50b2tlbml6ZXIucmVmbGluayhlLHRoaXMudG9rZW5zLmxpbmtzKSl7ZT1lLnN1YnN0cmluZyhvLnJhdy5sZW5ndGgpO2xldCB1PXQuYXQoLTEpO28udHlwZT09PVwidGV4dFwiJiZ1Py50eXBlPT09XCJ0ZXh0XCI/KHUucmF3Kz1vLnJhdyx1LnRleHQrPW8udGV4dCk6dC5wdXNoKG8pO2NvbnRpbnVlfWlmKG89dGhpcy50b2tlbml6ZXIuZW1TdHJvbmcoZSxuLGEpKXtlPWUuc3Vic3RyaW5nKG8ucmF3Lmxlbmd0aCksdC5wdXNoKG8pO2NvbnRpbnVlfWlmKG89dGhpcy50b2tlbml6ZXIuY29kZXNwYW4oZSkpe2U9ZS5zdWJzdHJpbmcoby5yYXcubGVuZ3RoKSx0LnB1c2gobyk7Y29udGludWV9aWYobz10aGlzLnRva2VuaXplci5icihlKSl7ZT1lLnN1YnN0cmluZyhvLnJhdy5sZW5ndGgpLHQucHVzaChvKTtjb250aW51ZX1pZihvPXRoaXMudG9rZW5pemVyLmRlbChlKSl7ZT1lLnN1YnN0cmluZyhvLnJhdy5sZW5ndGgpLHQucHVzaChvKTtjb250aW51ZX1pZihvPXRoaXMudG9rZW5pemVyLmF1dG9saW5rKGUpKXtlPWUuc3Vic3RyaW5nKG8ucmF3Lmxlbmd0aCksdC5wdXNoKG8pO2NvbnRpbnVlfWlmKCF0aGlzLnN0YXRlLmluTGluayYmKG89dGhpcy50b2tlbml6ZXIudXJsKGUpKSl7ZT1lLnN1YnN0cmluZyhvLnJhdy5sZW5ndGgpLHQucHVzaChvKTtjb250aW51ZX1sZXQgcD1lO2lmKHRoaXMub3B0aW9ucy5leHRlbnNpb25zPy5zdGFydElubGluZSl7bGV0IHU9MS8wLGM9ZS5zbGljZSgxKSxnO3RoaXMub3B0aW9ucy5leHRlbnNpb25zLnN0YXJ0SW5saW5lLmZvckVhY2goaD0+e2c9aC5jYWxsKHtsZXhlcjp0aGlzfSxjKSx0eXBlb2YgZz09XCJudW1iZXJcIiYmZz49MCYmKHU9TWF0aC5taW4odSxnKSl9KSx1PDEvMCYmdT49MCYmKHA9ZS5zdWJzdHJpbmcoMCx1KzEpKX1pZihvPXRoaXMudG9rZW5pemVyLmlubGluZVRleHQocCkpe2U9ZS5zdWJzdHJpbmcoby5yYXcubGVuZ3RoKSxvLnJhdy5zbGljZSgtMSkhPT1cIl9cIiYmKGE9by5yYXcuc2xpY2UoLTEpKSxzPSEwO2xldCB1PXQuYXQoLTEpO3U/LnR5cGU9PT1cInRleHRcIj8odS5yYXcrPW8ucmF3LHUudGV4dCs9by50ZXh0KTp0LnB1c2gobyk7Y29udGludWV9aWYoZSl7bGV0IHU9XCJJbmZpbml0ZSBsb29wIG9uIGJ5dGU6IFwiK2UuY2hhckNvZGVBdCgwKTtpZih0aGlzLm9wdGlvbnMuc2lsZW50KXtjb25zb2xlLmVycm9yKHUpO2JyZWFrfWVsc2UgdGhyb3cgbmV3IEVycm9yKHUpfX1yZXR1cm4gdH19O3ZhciBQPWNsYXNze29wdGlvbnM7cGFyc2VyO2NvbnN0cnVjdG9yKGUpe3RoaXMub3B0aW9ucz1lfHxUfXNwYWNlKGUpe3JldHVyblwiXCJ9Y29kZSh7dGV4dDplLGxhbmc6dCxlc2NhcGVkOm59KXtsZXQgcj0odHx8XCJcIikubWF0Y2gobS5ub3RTcGFjZVN0YXJ0KT8uWzBdLGk9ZS5yZXBsYWNlKG0uZW5kaW5nTmV3bGluZSxcIlwiKStgXG5gO3JldHVybiByPyc8cHJlPjxjb2RlIGNsYXNzPVwibGFuZ3VhZ2UtJyt3KHIpKydcIj4nKyhuP2k6dyhpLCEwKSkrYDwvY29kZT48L3ByZT5cbmA6XCI8cHJlPjxjb2RlPlwiKyhuP2k6dyhpLCEwKSkrYDwvY29kZT48L3ByZT5cbmB9YmxvY2txdW90ZSh7dG9rZW5zOmV9KXtyZXR1cm5gPGJsb2NrcXVvdGU+XG4ke3RoaXMucGFyc2VyLnBhcnNlKGUpfTwvYmxvY2txdW90ZT5cbmB9aHRtbCh7dGV4dDplfSl7cmV0dXJuIGV9ZGVmKGUpe3JldHVyblwiXCJ9aGVhZGluZyh7dG9rZW5zOmUsZGVwdGg6dH0pe3JldHVybmA8aCR7dH0+JHt0aGlzLnBhcnNlci5wYXJzZUlubGluZShlKX08L2gke3R9PlxuYH1ocihlKXtyZXR1cm5gPGhyPlxuYH1saXN0KGUpe2xldCB0PWUub3JkZXJlZCxuPWUuc3RhcnQscj1cIlwiO2ZvcihsZXQgYT0wO2E8ZS5pdGVtcy5sZW5ndGg7YSsrKXtsZXQgbz1lLml0ZW1zW2FdO3IrPXRoaXMubGlzdGl0ZW0obyl9bGV0IGk9dD9cIm9sXCI6XCJ1bFwiLHM9dCYmbiE9PTE/JyBzdGFydD1cIicrbisnXCInOlwiXCI7cmV0dXJuXCI8XCIraStzK2A+XG5gK3IrXCI8L1wiK2krYD5cbmB9bGlzdGl0ZW0oZSl7bGV0IHQ9XCJcIjtpZihlLnRhc2spe2xldCBuPXRoaXMuY2hlY2tib3goe2NoZWNrZWQ6ISFlLmNoZWNrZWR9KTtlLmxvb3NlP2UudG9rZW5zWzBdPy50eXBlPT09XCJwYXJhZ3JhcGhcIj8oZS50b2tlbnNbMF0udGV4dD1uK1wiIFwiK2UudG9rZW5zWzBdLnRleHQsZS50b2tlbnNbMF0udG9rZW5zJiZlLnRva2Vuc1swXS50b2tlbnMubGVuZ3RoPjAmJmUudG9rZW5zWzBdLnRva2Vuc1swXS50eXBlPT09XCJ0ZXh0XCImJihlLnRva2Vuc1swXS50b2tlbnNbMF0udGV4dD1uK1wiIFwiK3coZS50b2tlbnNbMF0udG9rZW5zWzBdLnRleHQpLGUudG9rZW5zWzBdLnRva2Vuc1swXS5lc2NhcGVkPSEwKSk6ZS50b2tlbnMudW5zaGlmdCh7dHlwZTpcInRleHRcIixyYXc6bitcIiBcIix0ZXh0Om4rXCIgXCIsZXNjYXBlZDohMH0pOnQrPW4rXCIgXCJ9cmV0dXJuIHQrPXRoaXMucGFyc2VyLnBhcnNlKGUudG9rZW5zLCEhZS5sb29zZSksYDxsaT4ke3R9PC9saT5cbmB9Y2hlY2tib3goe2NoZWNrZWQ6ZX0pe3JldHVyblwiPGlucHV0IFwiKyhlPydjaGVja2VkPVwiXCIgJzpcIlwiKSsnZGlzYWJsZWQ9XCJcIiB0eXBlPVwiY2hlY2tib3hcIj4nfXBhcmFncmFwaCh7dG9rZW5zOmV9KXtyZXR1cm5gPHA+JHt0aGlzLnBhcnNlci5wYXJzZUlubGluZShlKX08L3A+XG5gfXRhYmxlKGUpe2xldCB0PVwiXCIsbj1cIlwiO2ZvcihsZXQgaT0wO2k8ZS5oZWFkZXIubGVuZ3RoO2krKyluKz10aGlzLnRhYmxlY2VsbChlLmhlYWRlcltpXSk7dCs9dGhpcy50YWJsZXJvdyh7dGV4dDpufSk7bGV0IHI9XCJcIjtmb3IobGV0IGk9MDtpPGUucm93cy5sZW5ndGg7aSsrKXtsZXQgcz1lLnJvd3NbaV07bj1cIlwiO2ZvcihsZXQgYT0wO2E8cy5sZW5ndGg7YSsrKW4rPXRoaXMudGFibGVjZWxsKHNbYV0pO3IrPXRoaXMudGFibGVyb3coe3RleHQ6bn0pfXJldHVybiByJiYocj1gPHRib2R5PiR7cn08L3Rib2R5PmApLGA8dGFibGU+XG48dGhlYWQ+XG5gK3QrYDwvdGhlYWQ+XG5gK3IrYDwvdGFibGU+XG5gfXRhYmxlcm93KHt0ZXh0OmV9KXtyZXR1cm5gPHRyPlxuJHtlfTwvdHI+XG5gfXRhYmxlY2VsbChlKXtsZXQgdD10aGlzLnBhcnNlci5wYXJzZUlubGluZShlLnRva2Vucyksbj1lLmhlYWRlcj9cInRoXCI6XCJ0ZFwiO3JldHVybihlLmFsaWduP2A8JHtufSBhbGlnbj1cIiR7ZS5hbGlnbn1cIj5gOmA8JHtufT5gKSt0K2A8LyR7bn0+XG5gfXN0cm9uZyh7dG9rZW5zOmV9KXtyZXR1cm5gPHN0cm9uZz4ke3RoaXMucGFyc2VyLnBhcnNlSW5saW5lKGUpfTwvc3Ryb25nPmB9ZW0oe3Rva2VuczplfSl7cmV0dXJuYDxlbT4ke3RoaXMucGFyc2VyLnBhcnNlSW5saW5lKGUpfTwvZW0+YH1jb2Rlc3Bhbih7dGV4dDplfSl7cmV0dXJuYDxjb2RlPiR7dyhlLCEwKX08L2NvZGU+YH1icihlKXtyZXR1cm5cIjxicj5cIn1kZWwoe3Rva2VuczplfSl7cmV0dXJuYDxkZWw+JHt0aGlzLnBhcnNlci5wYXJzZUlubGluZShlKX08L2RlbD5gfWxpbmsoe2hyZWY6ZSx0aXRsZTp0LHRva2VuczpufSl7bGV0IHI9dGhpcy5wYXJzZXIucGFyc2VJbmxpbmUobiksaT1KKGUpO2lmKGk9PT1udWxsKXJldHVybiByO2U9aTtsZXQgcz0nPGEgaHJlZj1cIicrZSsnXCInO3JldHVybiB0JiYocys9JyB0aXRsZT1cIicrdyh0KSsnXCInKSxzKz1cIj5cIityK1wiPC9hPlwiLHN9aW1hZ2Uoe2hyZWY6ZSx0aXRsZTp0LHRleHQ6bix0b2tlbnM6cn0pe3ImJihuPXRoaXMucGFyc2VyLnBhcnNlSW5saW5lKHIsdGhpcy5wYXJzZXIudGV4dFJlbmRlcmVyKSk7bGV0IGk9SihlKTtpZihpPT09bnVsbClyZXR1cm4gdyhuKTtlPWk7bGV0IHM9YDxpbWcgc3JjPVwiJHtlfVwiIGFsdD1cIiR7bn1cImA7cmV0dXJuIHQmJihzKz1gIHRpdGxlPVwiJHt3KHQpfVwiYCkscys9XCI+XCIsc310ZXh0KGUpe3JldHVyblwidG9rZW5zXCJpbiBlJiZlLnRva2Vucz90aGlzLnBhcnNlci5wYXJzZUlubGluZShlLnRva2Vucyk6XCJlc2NhcGVkXCJpbiBlJiZlLmVzY2FwZWQ/ZS50ZXh0OncoZS50ZXh0KX19O3ZhciAkPWNsYXNze3N0cm9uZyh7dGV4dDplfSl7cmV0dXJuIGV9ZW0oe3RleHQ6ZX0pe3JldHVybiBlfWNvZGVzcGFuKHt0ZXh0OmV9KXtyZXR1cm4gZX1kZWwoe3RleHQ6ZX0pe3JldHVybiBlfWh0bWwoe3RleHQ6ZX0pe3JldHVybiBlfXRleHQoe3RleHQ6ZX0pe3JldHVybiBlfWxpbmsoe3RleHQ6ZX0pe3JldHVyblwiXCIrZX1pbWFnZSh7dGV4dDplfSl7cmV0dXJuXCJcIitlfWJyKCl7cmV0dXJuXCJcIn19O3ZhciBiPWNsYXNzIGx7b3B0aW9ucztyZW5kZXJlcjt0ZXh0UmVuZGVyZXI7Y29uc3RydWN0b3IoZSl7dGhpcy5vcHRpb25zPWV8fFQsdGhpcy5vcHRpb25zLnJlbmRlcmVyPXRoaXMub3B0aW9ucy5yZW5kZXJlcnx8bmV3IFAsdGhpcy5yZW5kZXJlcj10aGlzLm9wdGlvbnMucmVuZGVyZXIsdGhpcy5yZW5kZXJlci5vcHRpb25zPXRoaXMub3B0aW9ucyx0aGlzLnJlbmRlcmVyLnBhcnNlcj10aGlzLHRoaXMudGV4dFJlbmRlcmVyPW5ldyAkfXN0YXRpYyBwYXJzZShlLHQpe3JldHVybiBuZXcgbCh0KS5wYXJzZShlKX1zdGF0aWMgcGFyc2VJbmxpbmUoZSx0KXtyZXR1cm4gbmV3IGwodCkucGFyc2VJbmxpbmUoZSl9cGFyc2UoZSx0PSEwKXtsZXQgbj1cIlwiO2ZvcihsZXQgcj0wO3I8ZS5sZW5ndGg7cisrKXtsZXQgaT1lW3JdO2lmKHRoaXMub3B0aW9ucy5leHRlbnNpb25zPy5yZW5kZXJlcnM/LltpLnR5cGVdKXtsZXQgYT1pLG89dGhpcy5vcHRpb25zLmV4dGVuc2lvbnMucmVuZGVyZXJzW2EudHlwZV0uY2FsbCh7cGFyc2VyOnRoaXN9LGEpO2lmKG8hPT0hMXx8IVtcInNwYWNlXCIsXCJoclwiLFwiaGVhZGluZ1wiLFwiY29kZVwiLFwidGFibGVcIixcImJsb2NrcXVvdGVcIixcImxpc3RcIixcImh0bWxcIixcImRlZlwiLFwicGFyYWdyYXBoXCIsXCJ0ZXh0XCJdLmluY2x1ZGVzKGEudHlwZSkpe24rPW98fFwiXCI7Y29udGludWV9fWxldCBzPWk7c3dpdGNoKHMudHlwZSl7Y2FzZVwic3BhY2VcIjp7bis9dGhpcy5yZW5kZXJlci5zcGFjZShzKTtjb250aW51ZX1jYXNlXCJoclwiOntuKz10aGlzLnJlbmRlcmVyLmhyKHMpO2NvbnRpbnVlfWNhc2VcImhlYWRpbmdcIjp7bis9dGhpcy5yZW5kZXJlci5oZWFkaW5nKHMpO2NvbnRpbnVlfWNhc2VcImNvZGVcIjp7bis9dGhpcy5yZW5kZXJlci5jb2RlKHMpO2NvbnRpbnVlfWNhc2VcInRhYmxlXCI6e24rPXRoaXMucmVuZGVyZXIudGFibGUocyk7Y29udGludWV9Y2FzZVwiYmxvY2txdW90ZVwiOntuKz10aGlzLnJlbmRlcmVyLmJsb2NrcXVvdGUocyk7Y29udGludWV9Y2FzZVwibGlzdFwiOntuKz10aGlzLnJlbmRlcmVyLmxpc3Qocyk7Y29udGludWV9Y2FzZVwiaHRtbFwiOntuKz10aGlzLnJlbmRlcmVyLmh0bWwocyk7Y29udGludWV9Y2FzZVwiZGVmXCI6e24rPXRoaXMucmVuZGVyZXIuZGVmKHMpO2NvbnRpbnVlfWNhc2VcInBhcmFncmFwaFwiOntuKz10aGlzLnJlbmRlcmVyLnBhcmFncmFwaChzKTtjb250aW51ZX1jYXNlXCJ0ZXh0XCI6e2xldCBhPXMsbz10aGlzLnJlbmRlcmVyLnRleHQoYSk7Zm9yKDtyKzE8ZS5sZW5ndGgmJmVbcisxXS50eXBlPT09XCJ0ZXh0XCI7KWE9ZVsrK3JdLG8rPWBcbmArdGhpcy5yZW5kZXJlci50ZXh0KGEpO3Q/bis9dGhpcy5yZW5kZXJlci5wYXJhZ3JhcGgoe3R5cGU6XCJwYXJhZ3JhcGhcIixyYXc6byx0ZXh0Om8sdG9rZW5zOlt7dHlwZTpcInRleHRcIixyYXc6byx0ZXh0Om8sZXNjYXBlZDohMH1dfSk6bis9bztjb250aW51ZX1kZWZhdWx0OntsZXQgYT0nVG9rZW4gd2l0aCBcIicrcy50eXBlKydcIiB0eXBlIHdhcyBub3QgZm91bmQuJztpZih0aGlzLm9wdGlvbnMuc2lsZW50KXJldHVybiBjb25zb2xlLmVycm9yKGEpLFwiXCI7dGhyb3cgbmV3IEVycm9yKGEpfX19cmV0dXJuIG59cGFyc2VJbmxpbmUoZSx0PXRoaXMucmVuZGVyZXIpe2xldCBuPVwiXCI7Zm9yKGxldCByPTA7cjxlLmxlbmd0aDtyKyspe2xldCBpPWVbcl07aWYodGhpcy5vcHRpb25zLmV4dGVuc2lvbnM/LnJlbmRlcmVycz8uW2kudHlwZV0pe2xldCBhPXRoaXMub3B0aW9ucy5leHRlbnNpb25zLnJlbmRlcmVyc1tpLnR5cGVdLmNhbGwoe3BhcnNlcjp0aGlzfSxpKTtpZihhIT09ITF8fCFbXCJlc2NhcGVcIixcImh0bWxcIixcImxpbmtcIixcImltYWdlXCIsXCJzdHJvbmdcIixcImVtXCIsXCJjb2Rlc3BhblwiLFwiYnJcIixcImRlbFwiLFwidGV4dFwiXS5pbmNsdWRlcyhpLnR5cGUpKXtuKz1hfHxcIlwiO2NvbnRpbnVlfX1sZXQgcz1pO3N3aXRjaChzLnR5cGUpe2Nhc2VcImVzY2FwZVwiOntuKz10LnRleHQocyk7YnJlYWt9Y2FzZVwiaHRtbFwiOntuKz10Lmh0bWwocyk7YnJlYWt9Y2FzZVwibGlua1wiOntuKz10Lmxpbmsocyk7YnJlYWt9Y2FzZVwiaW1hZ2VcIjp7bis9dC5pbWFnZShzKTticmVha31jYXNlXCJzdHJvbmdcIjp7bis9dC5zdHJvbmcocyk7YnJlYWt9Y2FzZVwiZW1cIjp7bis9dC5lbShzKTticmVha31jYXNlXCJjb2Rlc3BhblwiOntuKz10LmNvZGVzcGFuKHMpO2JyZWFrfWNhc2VcImJyXCI6e24rPXQuYnIocyk7YnJlYWt9Y2FzZVwiZGVsXCI6e24rPXQuZGVsKHMpO2JyZWFrfWNhc2VcInRleHRcIjp7bis9dC50ZXh0KHMpO2JyZWFrfWRlZmF1bHQ6e2xldCBhPSdUb2tlbiB3aXRoIFwiJytzLnR5cGUrJ1wiIHR5cGUgd2FzIG5vdCBmb3VuZC4nO2lmKHRoaXMub3B0aW9ucy5zaWxlbnQpcmV0dXJuIGNvbnNvbGUuZXJyb3IoYSksXCJcIjt0aHJvdyBuZXcgRXJyb3IoYSl9fX1yZXR1cm4gbn19O3ZhciBTPWNsYXNze29wdGlvbnM7YmxvY2s7Y29uc3RydWN0b3IoZSl7dGhpcy5vcHRpb25zPWV8fFR9c3RhdGljIHBhc3NUaHJvdWdoSG9va3M9bmV3IFNldChbXCJwcmVwcm9jZXNzXCIsXCJwb3N0cHJvY2Vzc1wiLFwicHJvY2Vzc0FsbFRva2Vuc1wiLFwiZW1TdHJvbmdNYXNrXCJdKTtzdGF0aWMgcGFzc1Rocm91Z2hIb29rc1Jlc3BlY3RBc3luYz1uZXcgU2V0KFtcInByZXByb2Nlc3NcIixcInBvc3Rwcm9jZXNzXCIsXCJwcm9jZXNzQWxsVG9rZW5zXCJdKTtwcmVwcm9jZXNzKGUpe3JldHVybiBlfXBvc3Rwcm9jZXNzKGUpe3JldHVybiBlfXByb2Nlc3NBbGxUb2tlbnMoZSl7cmV0dXJuIGV9ZW1TdHJvbmdNYXNrKGUpe3JldHVybiBlfXByb3ZpZGVMZXhlcigpe3JldHVybiB0aGlzLmJsb2NrP3gubGV4OngubGV4SW5saW5lfXByb3ZpZGVQYXJzZXIoKXtyZXR1cm4gdGhpcy5ibG9jaz9iLnBhcnNlOmIucGFyc2VJbmxpbmV9fTt2YXIgQj1jbGFzc3tkZWZhdWx0cz1MKCk7b3B0aW9ucz10aGlzLnNldE9wdGlvbnM7cGFyc2U9dGhpcy5wYXJzZU1hcmtkb3duKCEwKTtwYXJzZUlubGluZT10aGlzLnBhcnNlTWFya2Rvd24oITEpO1BhcnNlcj1iO1JlbmRlcmVyPVA7VGV4dFJlbmRlcmVyPSQ7TGV4ZXI9eDtUb2tlbml6ZXI9eTtIb29rcz1TO2NvbnN0cnVjdG9yKC4uLmUpe3RoaXMudXNlKC4uLmUpfXdhbGtUb2tlbnMoZSx0KXtsZXQgbj1bXTtmb3IobGV0IHIgb2YgZSlzd2l0Y2gobj1uLmNvbmNhdCh0LmNhbGwodGhpcyxyKSksci50eXBlKXtjYXNlXCJ0YWJsZVwiOntsZXQgaT1yO2ZvcihsZXQgcyBvZiBpLmhlYWRlciluPW4uY29uY2F0KHRoaXMud2Fsa1Rva2VucyhzLnRva2Vucyx0KSk7Zm9yKGxldCBzIG9mIGkucm93cylmb3IobGV0IGEgb2YgcyluPW4uY29uY2F0KHRoaXMud2Fsa1Rva2VucyhhLnRva2Vucyx0KSk7YnJlYWt9Y2FzZVwibGlzdFwiOntsZXQgaT1yO249bi5jb25jYXQodGhpcy53YWxrVG9rZW5zKGkuaXRlbXMsdCkpO2JyZWFrfWRlZmF1bHQ6e2xldCBpPXI7dGhpcy5kZWZhdWx0cy5leHRlbnNpb25zPy5jaGlsZFRva2Vucz8uW2kudHlwZV0/dGhpcy5kZWZhdWx0cy5leHRlbnNpb25zLmNoaWxkVG9rZW5zW2kudHlwZV0uZm9yRWFjaChzPT57bGV0IGE9aVtzXS5mbGF0KDEvMCk7bj1uLmNvbmNhdCh0aGlzLndhbGtUb2tlbnMoYSx0KSl9KTppLnRva2VucyYmKG49bi5jb25jYXQodGhpcy53YWxrVG9rZW5zKGkudG9rZW5zLHQpKSl9fXJldHVybiBufXVzZSguLi5lKXtsZXQgdD10aGlzLmRlZmF1bHRzLmV4dGVuc2lvbnN8fHtyZW5kZXJlcnM6e30sY2hpbGRUb2tlbnM6e319O3JldHVybiBlLmZvckVhY2gobj0+e2xldCByPXsuLi5ufTtpZihyLmFzeW5jPXRoaXMuZGVmYXVsdHMuYXN5bmN8fHIuYXN5bmN8fCExLG4uZXh0ZW5zaW9ucyYmKG4uZXh0ZW5zaW9ucy5mb3JFYWNoKGk9PntpZighaS5uYW1lKXRocm93IG5ldyBFcnJvcihcImV4dGVuc2lvbiBuYW1lIHJlcXVpcmVkXCIpO2lmKFwicmVuZGVyZXJcImluIGkpe2xldCBzPXQucmVuZGVyZXJzW2kubmFtZV07cz90LnJlbmRlcmVyc1tpLm5hbWVdPWZ1bmN0aW9uKC4uLmEpe2xldCBvPWkucmVuZGVyZXIuYXBwbHkodGhpcyxhKTtyZXR1cm4gbz09PSExJiYobz1zLmFwcGx5KHRoaXMsYSkpLG99OnQucmVuZGVyZXJzW2kubmFtZV09aS5yZW5kZXJlcn1pZihcInRva2VuaXplclwiaW4gaSl7aWYoIWkubGV2ZWx8fGkubGV2ZWwhPT1cImJsb2NrXCImJmkubGV2ZWwhPT1cImlubGluZVwiKXRocm93IG5ldyBFcnJvcihcImV4dGVuc2lvbiBsZXZlbCBtdXN0IGJlICdibG9jaycgb3IgJ2lubGluZSdcIik7bGV0IHM9dFtpLmxldmVsXTtzP3MudW5zaGlmdChpLnRva2VuaXplcik6dFtpLmxldmVsXT1baS50b2tlbml6ZXJdLGkuc3RhcnQmJihpLmxldmVsPT09XCJibG9ja1wiP3Quc3RhcnRCbG9jaz90LnN0YXJ0QmxvY2sucHVzaChpLnN0YXJ0KTp0LnN0YXJ0QmxvY2s9W2kuc3RhcnRdOmkubGV2ZWw9PT1cImlubGluZVwiJiYodC5zdGFydElubGluZT90LnN0YXJ0SW5saW5lLnB1c2goaS5zdGFydCk6dC5zdGFydElubGluZT1baS5zdGFydF0pKX1cImNoaWxkVG9rZW5zXCJpbiBpJiZpLmNoaWxkVG9rZW5zJiYodC5jaGlsZFRva2Vuc1tpLm5hbWVdPWkuY2hpbGRUb2tlbnMpfSksci5leHRlbnNpb25zPXQpLG4ucmVuZGVyZXIpe2xldCBpPXRoaXMuZGVmYXVsdHMucmVuZGVyZXJ8fG5ldyBQKHRoaXMuZGVmYXVsdHMpO2ZvcihsZXQgcyBpbiBuLnJlbmRlcmVyKXtpZighKHMgaW4gaSkpdGhyb3cgbmV3IEVycm9yKGByZW5kZXJlciAnJHtzfScgZG9lcyBub3QgZXhpc3RgKTtpZihbXCJvcHRpb25zXCIsXCJwYXJzZXJcIl0uaW5jbHVkZXMocykpY29udGludWU7bGV0IGE9cyxvPW4ucmVuZGVyZXJbYV0scD1pW2FdO2lbYV09KC4uLnUpPT57bGV0IGM9by5hcHBseShpLHUpO3JldHVybiBjPT09ITEmJihjPXAuYXBwbHkoaSx1KSksY3x8XCJcIn19ci5yZW5kZXJlcj1pfWlmKG4udG9rZW5pemVyKXtsZXQgaT10aGlzLmRlZmF1bHRzLnRva2VuaXplcnx8bmV3IHkodGhpcy5kZWZhdWx0cyk7Zm9yKGxldCBzIGluIG4udG9rZW5pemVyKXtpZighKHMgaW4gaSkpdGhyb3cgbmV3IEVycm9yKGB0b2tlbml6ZXIgJyR7c30nIGRvZXMgbm90IGV4aXN0YCk7aWYoW1wib3B0aW9uc1wiLFwicnVsZXNcIixcImxleGVyXCJdLmluY2x1ZGVzKHMpKWNvbnRpbnVlO2xldCBhPXMsbz1uLnRva2VuaXplclthXSxwPWlbYV07aVthXT0oLi4udSk9PntsZXQgYz1vLmFwcGx5KGksdSk7cmV0dXJuIGM9PT0hMSYmKGM9cC5hcHBseShpLHUpKSxjfX1yLnRva2VuaXplcj1pfWlmKG4uaG9va3Mpe2xldCBpPXRoaXMuZGVmYXVsdHMuaG9va3N8fG5ldyBTO2ZvcihsZXQgcyBpbiBuLmhvb2tzKXtpZighKHMgaW4gaSkpdGhyb3cgbmV3IEVycm9yKGBob29rICcke3N9JyBkb2VzIG5vdCBleGlzdGApO2lmKFtcIm9wdGlvbnNcIixcImJsb2NrXCJdLmluY2x1ZGVzKHMpKWNvbnRpbnVlO2xldCBhPXMsbz1uLmhvb2tzW2FdLHA9aVthXTtTLnBhc3NUaHJvdWdoSG9va3MuaGFzKHMpP2lbYV09dT0+e2lmKHRoaXMuZGVmYXVsdHMuYXN5bmMmJlMucGFzc1Rocm91Z2hIb29rc1Jlc3BlY3RBc3luYy5oYXMocykpcmV0dXJuKGFzeW5jKCk9PntsZXQgZz1hd2FpdCBvLmNhbGwoaSx1KTtyZXR1cm4gcC5jYWxsKGksZyl9KSgpO2xldCBjPW8uY2FsbChpLHUpO3JldHVybiBwLmNhbGwoaSxjKX06aVthXT0oLi4udSk9PntpZih0aGlzLmRlZmF1bHRzLmFzeW5jKXJldHVybihhc3luYygpPT57bGV0IGc9YXdhaXQgby5hcHBseShpLHUpO3JldHVybiBnPT09ITEmJihnPWF3YWl0IHAuYXBwbHkoaSx1KSksZ30pKCk7bGV0IGM9by5hcHBseShpLHUpO3JldHVybiBjPT09ITEmJihjPXAuYXBwbHkoaSx1KSksY319ci5ob29rcz1pfWlmKG4ud2Fsa1Rva2Vucyl7bGV0IGk9dGhpcy5kZWZhdWx0cy53YWxrVG9rZW5zLHM9bi53YWxrVG9rZW5zO3Iud2Fsa1Rva2Vucz1mdW5jdGlvbihhKXtsZXQgbz1bXTtyZXR1cm4gby5wdXNoKHMuY2FsbCh0aGlzLGEpKSxpJiYobz1vLmNvbmNhdChpLmNhbGwodGhpcyxhKSkpLG99fXRoaXMuZGVmYXVsdHM9ey4uLnRoaXMuZGVmYXVsdHMsLi4ucn19KSx0aGlzfXNldE9wdGlvbnMoZSl7cmV0dXJuIHRoaXMuZGVmYXVsdHM9ey4uLnRoaXMuZGVmYXVsdHMsLi4uZX0sdGhpc31sZXhlcihlLHQpe3JldHVybiB4LmxleChlLHQ/P3RoaXMuZGVmYXVsdHMpfXBhcnNlcihlLHQpe3JldHVybiBiLnBhcnNlKGUsdD8/dGhpcy5kZWZhdWx0cyl9cGFyc2VNYXJrZG93bihlKXtyZXR1cm4obixyKT0+e2xldCBpPXsuLi5yfSxzPXsuLi50aGlzLmRlZmF1bHRzLC4uLml9LGE9dGhpcy5vbkVycm9yKCEhcy5zaWxlbnQsISFzLmFzeW5jKTtpZih0aGlzLmRlZmF1bHRzLmFzeW5jPT09ITAmJmkuYXN5bmM9PT0hMSlyZXR1cm4gYShuZXcgRXJyb3IoXCJtYXJrZWQoKTogVGhlIGFzeW5jIG9wdGlvbiB3YXMgc2V0IHRvIHRydWUgYnkgYW4gZXh0ZW5zaW9uLiBSZW1vdmUgYXN5bmM6IGZhbHNlIGZyb20gdGhlIHBhcnNlIG9wdGlvbnMgb2JqZWN0IHRvIHJldHVybiBhIFByb21pc2UuXCIpKTtpZih0eXBlb2Ygbj5cInVcInx8bj09PW51bGwpcmV0dXJuIGEobmV3IEVycm9yKFwibWFya2VkKCk6IGlucHV0IHBhcmFtZXRlciBpcyB1bmRlZmluZWQgb3IgbnVsbFwiKSk7aWYodHlwZW9mIG4hPVwic3RyaW5nXCIpcmV0dXJuIGEobmV3IEVycm9yKFwibWFya2VkKCk6IGlucHV0IHBhcmFtZXRlciBpcyBvZiB0eXBlIFwiK09iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChuKStcIiwgc3RyaW5nIGV4cGVjdGVkXCIpKTtpZihzLmhvb2tzJiYocy5ob29rcy5vcHRpb25zPXMscy5ob29rcy5ibG9jaz1lKSxzLmFzeW5jKXJldHVybihhc3luYygpPT57bGV0IG89cy5ob29rcz9hd2FpdCBzLmhvb2tzLnByZXByb2Nlc3Mobik6bix1PWF3YWl0KHMuaG9va3M/YXdhaXQgcy5ob29rcy5wcm92aWRlTGV4ZXIoKTplP3gubGV4OngubGV4SW5saW5lKShvLHMpLGM9cy5ob29rcz9hd2FpdCBzLmhvb2tzLnByb2Nlc3NBbGxUb2tlbnModSk6dTtzLndhbGtUb2tlbnMmJmF3YWl0IFByb21pc2UuYWxsKHRoaXMud2Fsa1Rva2VucyhjLHMud2Fsa1Rva2VucykpO2xldCBoPWF3YWl0KHMuaG9va3M/YXdhaXQgcy5ob29rcy5wcm92aWRlUGFyc2VyKCk6ZT9iLnBhcnNlOmIucGFyc2VJbmxpbmUpKGMscyk7cmV0dXJuIHMuaG9va3M/YXdhaXQgcy5ob29rcy5wb3N0cHJvY2VzcyhoKTpofSkoKS5jYXRjaChhKTt0cnl7cy5ob29rcyYmKG49cy5ob29rcy5wcmVwcm9jZXNzKG4pKTtsZXQgcD0ocy5ob29rcz9zLmhvb2tzLnByb3ZpZGVMZXhlcigpOmU/eC5sZXg6eC5sZXhJbmxpbmUpKG4scyk7cy5ob29rcyYmKHA9cy5ob29rcy5wcm9jZXNzQWxsVG9rZW5zKHApKSxzLndhbGtUb2tlbnMmJnRoaXMud2Fsa1Rva2VucyhwLHMud2Fsa1Rva2Vucyk7bGV0IGM9KHMuaG9va3M/cy5ob29rcy5wcm92aWRlUGFyc2VyKCk6ZT9iLnBhcnNlOmIucGFyc2VJbmxpbmUpKHAscyk7cmV0dXJuIHMuaG9va3MmJihjPXMuaG9va3MucG9zdHByb2Nlc3MoYykpLGN9Y2F0Y2gobyl7cmV0dXJuIGEobyl9fX1vbkVycm9yKGUsdCl7cmV0dXJuIG49PntpZihuLm1lc3NhZ2UrPWBcblBsZWFzZSByZXBvcnQgdGhpcyB0byBodHRwczovL2dpdGh1Yi5jb20vbWFya2VkanMvbWFya2VkLmAsZSl7bGV0IHI9XCI8cD5BbiBlcnJvciBvY2N1cnJlZDo8L3A+PHByZT5cIit3KG4ubWVzc2FnZStcIlwiLCEwKStcIjwvcHJlPlwiO3JldHVybiB0P1Byb21pc2UucmVzb2x2ZShyKTpyfWlmKHQpcmV0dXJuIFByb21pc2UucmVqZWN0KG4pO3Rocm93IG59fX07dmFyIF89bmV3IEI7ZnVuY3Rpb24gayhsLGUpe3JldHVybiBfLnBhcnNlKGwsZSl9ay5vcHRpb25zPWsuc2V0T3B0aW9ucz1mdW5jdGlvbihsKXtyZXR1cm4gXy5zZXRPcHRpb25zKGwpLGsuZGVmYXVsdHM9Xy5kZWZhdWx0cyxHKGsuZGVmYXVsdHMpLGt9O2suZ2V0RGVmYXVsdHM9TDtrLmRlZmF1bHRzPVQ7ay51c2U9ZnVuY3Rpb24oLi4ubCl7cmV0dXJuIF8udXNlKC4uLmwpLGsuZGVmYXVsdHM9Xy5kZWZhdWx0cyxHKGsuZGVmYXVsdHMpLGt9O2sud2Fsa1Rva2Vucz1mdW5jdGlvbihsLGUpe3JldHVybiBfLndhbGtUb2tlbnMobCxlKX07ay5wYXJzZUlubGluZT1fLnBhcnNlSW5saW5lO2suUGFyc2VyPWI7ay5wYXJzZXI9Yi5wYXJzZTtrLlJlbmRlcmVyPVA7ay5UZXh0UmVuZGVyZXI9JDtrLkxleGVyPXg7ay5sZXhlcj14LmxleDtrLlRva2VuaXplcj15O2suSG9va3M9UztrLnBhcnNlPWs7dmFyIFp0PWsub3B0aW9ucyxHdD1rLnNldE9wdGlvbnMsTnQ9ay51c2UsRnQ9ay53YWxrVG9rZW5zLGp0PWsucGFyc2VJbmxpbmUsUXQ9ayxVdD1iLnBhcnNlLEt0PXgubGV4O2V4cG9ydHtTIGFzIEhvb2tzLHggYXMgTGV4ZXIsQiBhcyBNYXJrZWQsYiBhcyBQYXJzZXIsUCBhcyBSZW5kZXJlciwkIGFzIFRleHRSZW5kZXJlcix5IGFzIFRva2VuaXplcixUIGFzIGRlZmF1bHRzLEwgYXMgZ2V0RGVmYXVsdHMsS3QgYXMgbGV4ZXIsayBhcyBtYXJrZWQsWnQgYXMgb3B0aW9ucyxRdCBhcyBwYXJzZSxqdCBhcyBwYXJzZUlubGluZSxVdCBhcyBwYXJzZXIsR3QgYXMgc2V0T3B0aW9ucyxOdCBhcyB1c2UsRnQgYXMgd2Fsa1Rva2Vuc307XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXJrZWQuZXNtLmpzLm1hcFxuIiwKICAgICJleHBvcnQgZnVuY3Rpb24gZGVkZW50KHRlbXBsKSB7XG4gICAgdmFyIHZhbHVlcyA9IFtdO1xuICAgIGZvciAodmFyIF9pID0gMTsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIHZhbHVlc1tfaSAtIDFdID0gYXJndW1lbnRzW19pXTtcbiAgICB9XG4gICAgdmFyIHN0cmluZ3MgPSBBcnJheS5mcm9tKHR5cGVvZiB0ZW1wbCA9PT0gJ3N0cmluZycgPyBbdGVtcGxdIDogdGVtcGwpO1xuICAgIHN0cmluZ3Nbc3RyaW5ncy5sZW5ndGggLSAxXSA9IHN0cmluZ3Nbc3RyaW5ncy5sZW5ndGggLSAxXS5yZXBsYWNlKC9cXHI/XFxuKFtcXHQgXSopJC8sICcnKTtcbiAgICB2YXIgaW5kZW50TGVuZ3RocyA9IHN0cmluZ3MucmVkdWNlKGZ1bmN0aW9uIChhcnIsIHN0cikge1xuICAgICAgICB2YXIgbWF0Y2hlcyA9IHN0ci5tYXRjaCgvXFxuKFtcXHQgXSt8KD8hXFxzKS4pL2cpO1xuICAgICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICAgICAgcmV0dXJuIGFyci5jb25jYXQobWF0Y2hlcy5tYXAoZnVuY3Rpb24gKG1hdGNoKSB7IHZhciBfYSwgX2I7IHJldHVybiAoX2IgPSAoX2EgPSBtYXRjaC5tYXRjaCgvW1xcdCBdL2cpKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EubGVuZ3RoKSAhPT0gbnVsbCAmJiBfYiAhPT0gdm9pZCAwID8gX2IgOiAwOyB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFycjtcbiAgICB9LCBbXSk7XG4gICAgaWYgKGluZGVudExlbmd0aHMubGVuZ3RoKSB7XG4gICAgICAgIHZhciBwYXR0ZXJuXzEgPSBuZXcgUmVnRXhwKFwiXFxuW1xcdCBde1wiICsgTWF0aC5taW4uYXBwbHkoTWF0aCwgaW5kZW50TGVuZ3RocykgKyBcIn1cIiwgJ2cnKTtcbiAgICAgICAgc3RyaW5ncyA9IHN0cmluZ3MubWFwKGZ1bmN0aW9uIChzdHIpIHsgcmV0dXJuIHN0ci5yZXBsYWNlKHBhdHRlcm5fMSwgJ1xcbicpOyB9KTtcbiAgICB9XG4gICAgc3RyaW5nc1swXSA9IHN0cmluZ3NbMF0ucmVwbGFjZSgvXlxccj9cXG4vLCAnJyk7XG4gICAgdmFyIHN0cmluZyA9IHN0cmluZ3NbMF07XG4gICAgdmFsdWVzLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlLCBpKSB7XG4gICAgICAgIHZhciBlbmRlbnRhdGlvbnMgPSBzdHJpbmcubWF0Y2goLyg/Ol58XFxuKSggKikkLyk7XG4gICAgICAgIHZhciBlbmRlbnRhdGlvbiA9IGVuZGVudGF0aW9ucyA/IGVuZGVudGF0aW9uc1sxXSA6ICcnO1xuICAgICAgICB2YXIgaW5kZW50ZWRWYWx1ZSA9IHZhbHVlO1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB2YWx1ZS5pbmNsdWRlcygnXFxuJykpIHtcbiAgICAgICAgICAgIGluZGVudGVkVmFsdWUgPSBTdHJpbmcodmFsdWUpXG4gICAgICAgICAgICAgICAgLnNwbGl0KCdcXG4nKVxuICAgICAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24gKHN0ciwgaSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpID09PSAwID8gc3RyIDogXCJcIiArIGVuZGVudGF0aW9uICsgc3RyO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuam9pbignXFxuJyk7XG4gICAgICAgIH1cbiAgICAgICAgc3RyaW5nICs9IGluZGVudGVkVmFsdWUgKyBzdHJpbmdzW2kgKyAxXTtcbiAgICB9KTtcbiAgICByZXR1cm4gc3RyaW5nO1xufVxuZXhwb3J0IGRlZmF1bHQgZGVkZW50O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIiwKICAgICJpbXBvcnQge1xuICBkZWNvZGVFbnRpdGllc1xufSBmcm9tIFwiLi9jaHVuay01WlFZSFhLVS5tanNcIjtcbmltcG9ydCB7XG4gIGNvbW1vbl9kZWZhdWx0LFxuICBnZXRDb25maWcsXG4gIGhhc0thdGV4LFxuICByZW5kZXJLYXRleFNhbml0aXplZCxcbiAgc2FuaXRpemVUZXh0XG59IGZyb20gXCIuL2NodW5rLUNTQ0lISzdRLm1qc1wiO1xuaW1wb3J0IHtcbiAgX19uYW1lLFxuICBsb2dcbn0gZnJvbSBcIi4vY2h1bmstQUdIUkI0SkYubWpzXCI7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9pY29ucy50c1xuaW1wb3J0IHsgZ2V0SWNvbkRhdGEsIGljb25Ub0hUTUwsIGljb25Ub1NWRywgcmVwbGFjZUlEcywgc3RyaW5nVG9JY29uIH0gZnJvbSBcIkBpY29uaWZ5L3V0aWxzXCI7XG52YXIgdW5rbm93bkljb24gPSB7XG4gIGJvZHk6ICc8Zz48cmVjdCB3aWR0aD1cIjgwXCIgaGVpZ2h0PVwiODBcIiBzdHlsZT1cImZpbGw6ICMwODdlYmY7IHN0cm9rZS13aWR0aDogMHB4O1wiLz48dGV4dCB0cmFuc2Zvcm09XCJ0cmFuc2xhdGUoMjEuMTYgNjQuNjcpXCIgc3R5bGU9XCJmaWxsOiAjZmZmOyBmb250LWZhbWlseTogQXJpYWxNVCwgQXJpYWw7IGZvbnQtc2l6ZTogNjcuNzVweDtcIj48dHNwYW4geD1cIjBcIiB5PVwiMFwiPj88L3RzcGFuPjwvdGV4dD48L2c+JyxcbiAgaGVpZ2h0OiA4MCxcbiAgd2lkdGg6IDgwXG59O1xudmFyIGljb25zU3RvcmUgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xudmFyIGxvYWRlclN0b3JlID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbnZhciByZWdpc3Rlckljb25QYWNrcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGljb25Mb2FkZXJzKSA9PiB7XG4gIGZvciAoY29uc3QgaWNvbkxvYWRlciBvZiBpY29uTG9hZGVycykge1xuICAgIGlmICghaWNvbkxvYWRlci5uYW1lKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdJbnZhbGlkIGljb24gbG9hZGVyLiBNdXN0IGhhdmUgYSBcIm5hbWVcIiBwcm9wZXJ0eSB3aXRoIG5vbi1lbXB0eSBzdHJpbmcgdmFsdWUuJ1xuICAgICAgKTtcbiAgICB9XG4gICAgbG9nLmRlYnVnKFwiUmVnaXN0ZXJpbmcgaWNvbiBwYWNrOlwiLCBpY29uTG9hZGVyLm5hbWUpO1xuICAgIGlmIChcImxvYWRlclwiIGluIGljb25Mb2FkZXIpIHtcbiAgICAgIGxvYWRlclN0b3JlLnNldChpY29uTG9hZGVyLm5hbWUsIGljb25Mb2FkZXIubG9hZGVyKTtcbiAgICB9IGVsc2UgaWYgKFwiaWNvbnNcIiBpbiBpY29uTG9hZGVyKSB7XG4gICAgICBpY29uc1N0b3JlLnNldChpY29uTG9hZGVyLm5hbWUsIGljb25Mb2FkZXIuaWNvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2cuZXJyb3IoXCJJbnZhbGlkIGljb24gbG9hZGVyOlwiLCBpY29uTG9hZGVyKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBpY29uIGxvYWRlci4gTXVzdCBoYXZlIGVpdGhlciBcImljb25zXCIgb3IgXCJsb2FkZXJcIiBwcm9wZXJ0eS4nKTtcbiAgICB9XG4gIH1cbn0sIFwicmVnaXN0ZXJJY29uUGFja3NcIik7XG52YXIgZ2V0UmVnaXN0ZXJlZEljb25EYXRhID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShhc3luYyAoaWNvbk5hbWUsIGZhbGxiYWNrUHJlZml4KSA9PiB7XG4gIGNvbnN0IGRhdGEgPSBzdHJpbmdUb0ljb24oaWNvbk5hbWUsIHRydWUsIGZhbGxiYWNrUHJlZml4ICE9PSB2b2lkIDApO1xuICBpZiAoIWRhdGEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgaWNvbiBuYW1lOiAke2ljb25OYW1lfWApO1xuICB9XG4gIGNvbnN0IHByZWZpeCA9IGRhdGEucHJlZml4IHx8IGZhbGxiYWNrUHJlZml4O1xuICBpZiAoIXByZWZpeCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgSWNvbiBuYW1lIG11c3QgY29udGFpbiBhIHByZWZpeDogJHtpY29uTmFtZX1gKTtcbiAgfVxuICBsZXQgaWNvbnMgPSBpY29uc1N0b3JlLmdldChwcmVmaXgpO1xuICBpZiAoIWljb25zKSB7XG4gICAgY29uc3QgbG9hZGVyID0gbG9hZGVyU3RvcmUuZ2V0KHByZWZpeCk7XG4gICAgaWYgKCFsb2FkZXIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSWNvbiBzZXQgbm90IGZvdW5kOiAke2RhdGEucHJlZml4fWApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgY29uc3QgbG9hZGVkID0gYXdhaXQgbG9hZGVyKCk7XG4gICAgICBpY29ucyA9IHsgLi4ubG9hZGVkLCBwcmVmaXggfTtcbiAgICAgIGljb25zU3RvcmUuc2V0KHByZWZpeCwgaWNvbnMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGxvZy5lcnJvcihlKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGxvYWQgaWNvbiBzZXQ6ICR7ZGF0YS5wcmVmaXh9YCk7XG4gICAgfVxuICB9XG4gIGNvbnN0IGljb25EYXRhID0gZ2V0SWNvbkRhdGEoaWNvbnMsIGRhdGEubmFtZSk7XG4gIGlmICghaWNvbkRhdGEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEljb24gbm90IGZvdW5kOiAke2ljb25OYW1lfWApO1xuICB9XG4gIHJldHVybiBpY29uRGF0YTtcbn0sIFwiZ2V0UmVnaXN0ZXJlZEljb25EYXRhXCIpO1xudmFyIGlzSWNvbkF2YWlsYWJsZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoYXN5bmMgKGljb25OYW1lKSA9PiB7XG4gIHRyeSB7XG4gICAgYXdhaXQgZ2V0UmVnaXN0ZXJlZEljb25EYXRhKGljb25OYW1lKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59LCBcImlzSWNvbkF2YWlsYWJsZVwiKTtcbnZhciBnZXRJY29uU1ZHID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShhc3luYyAoaWNvbk5hbWUsIGN1c3RvbWlzYXRpb25zLCBleHRyYUF0dHJpYnV0ZXMpID0+IHtcbiAgbGV0IGljb25EYXRhO1xuICB0cnkge1xuICAgIGljb25EYXRhID0gYXdhaXQgZ2V0UmVnaXN0ZXJlZEljb25EYXRhKGljb25OYW1lLCBjdXN0b21pc2F0aW9ucz8uZmFsbGJhY2tQcmVmaXgpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgbG9nLmVycm9yKGUpO1xuICAgIGljb25EYXRhID0gdW5rbm93bkljb247XG4gIH1cbiAgY29uc3QgcmVuZGVyRGF0YSA9IGljb25Ub1NWRyhpY29uRGF0YSwgY3VzdG9taXNhdGlvbnMpO1xuICBjb25zdCBzdmcgPSBpY29uVG9IVE1MKHJlcGxhY2VJRHMocmVuZGVyRGF0YS5ib2R5KSwge1xuICAgIC4uLnJlbmRlckRhdGEuYXR0cmlidXRlcyxcbiAgICAuLi5leHRyYUF0dHJpYnV0ZXNcbiAgfSk7XG4gIHJldHVybiBzYW5pdGl6ZVRleHQoc3ZnLCBnZXRDb25maWcoKSk7XG59LCBcImdldEljb25TVkdcIik7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9jcmVhdGVUZXh0LnRzXG5pbXBvcnQgeyBzZWxlY3QgfSBmcm9tIFwiZDNcIjtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL2hhbmRsZS1tYXJrZG93bi10ZXh0LnRzXG5pbXBvcnQgeyBtYXJrZWQgfSBmcm9tIFwibWFya2VkXCI7XG5pbXBvcnQgeyBkZWRlbnQgfSBmcm9tIFwidHMtZGVkZW50XCI7XG5mdW5jdGlvbiBwcmVwcm9jZXNzTWFya2Rvd24obWFya2Rvd24sIHsgbWFya2Rvd25BdXRvV3JhcCB9KSB7XG4gIGNvbnN0IHdpdGhvdXRCUiA9IG1hcmtkb3duLnJlcGxhY2UoLzxiclxcLz4vZywgXCJcXG5cIik7XG4gIGNvbnN0IHdpdGhvdXRNdWx0aXBsZU5ld2xpbmVzID0gd2l0aG91dEJSLnJlcGxhY2UoL1xcbnsyLH0vZywgXCJcXG5cIik7XG4gIGNvbnN0IHdpdGhvdXRFeHRyYVNwYWNlcyA9IGRlZGVudCh3aXRob3V0TXVsdGlwbGVOZXdsaW5lcyk7XG4gIGlmIChtYXJrZG93bkF1dG9XcmFwID09PSBmYWxzZSkge1xuICB9XG4gIHJldHVybiB3aXRob3V0RXh0cmFTcGFjZXM7XG59XG5fX25hbWUocHJlcHJvY2Vzc01hcmtkb3duLCBcInByZXByb2Nlc3NNYXJrZG93blwiKTtcbmZ1bmN0aW9uIG5vbk1hcmtkb3duVG9MaW5lcyhub25NYXJrZG93blRleHQpIHtcbiAgcmV0dXJuIG5vbk1hcmtkb3duVGV4dC5zcGxpdCgvXFxcXG58XFxufDxiclxccypcXC8/Pi9naSkubWFwKFxuICAgIChsaW5lKSA9PiBsaW5lLnRyaW0oKS5tYXRjaCgvPFtePl0rPnxbXlxcczw+XSsvZyk/Lm1hcCgod29yZCkgPT4gKHsgY29udGVudDogd29yZCwgdHlwZTogXCJub3JtYWxcIiB9KSkgPz8gW11cbiAgKTtcbn1cbl9fbmFtZShub25NYXJrZG93blRvTGluZXMsIFwibm9uTWFya2Rvd25Ub0xpbmVzXCIpO1xuZnVuY3Rpb24gbWFya2Rvd25Ub0xpbmVzKG1hcmtkb3duLCBjb25maWcgPSB7fSkge1xuICBjb25zdCBwcmVwcm9jZXNzZWRNYXJrZG93biA9IHByZXByb2Nlc3NNYXJrZG93bihtYXJrZG93biwgY29uZmlnKTtcbiAgY29uc3Qgbm9kZXMgPSBtYXJrZWQubGV4ZXIocHJlcHJvY2Vzc2VkTWFya2Rvd24pO1xuICBjb25zdCBsaW5lcyA9IFtbXV07XG4gIGxldCBjdXJyZW50TGluZSA9IDA7XG4gIGZ1bmN0aW9uIHByb2Nlc3NOb2RlKG5vZGUsIHBhcmVudFR5cGUgPSBcIm5vcm1hbFwiKSB7XG4gICAgaWYgKG5vZGUudHlwZSA9PT0gXCJ0ZXh0XCIpIHtcbiAgICAgIGNvbnN0IHRleHRMaW5lcyA9IG5vZGUudGV4dC5zcGxpdChcIlxcblwiKTtcbiAgICAgIHRleHRMaW5lcy5mb3JFYWNoKCh0ZXh0TGluZSwgaW5kZXgpID0+IHtcbiAgICAgICAgaWYgKGluZGV4ICE9PSAwKSB7XG4gICAgICAgICAgY3VycmVudExpbmUrKztcbiAgICAgICAgICBsaW5lcy5wdXNoKFtdKTtcbiAgICAgICAgfVxuICAgICAgICB0ZXh0TGluZS5zcGxpdChcIiBcIikuZm9yRWFjaCgod29yZCkgPT4ge1xuICAgICAgICAgIHdvcmQgPSB3b3JkLnJlcGxhY2UoLyYjMzk7L2csIGAnYCk7XG4gICAgICAgICAgaWYgKHdvcmQpIHtcbiAgICAgICAgICAgIGxpbmVzW2N1cnJlbnRMaW5lXS5wdXNoKHsgY29udGVudDogd29yZCwgdHlwZTogcGFyZW50VHlwZSB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChub2RlLnR5cGUgPT09IFwic3Ryb25nXCIgfHwgbm9kZS50eXBlID09PSBcImVtXCIpIHtcbiAgICAgIG5vZGUudG9rZW5zLmZvckVhY2goKGNvbnRlbnROb2RlKSA9PiB7XG4gICAgICAgIHByb2Nlc3NOb2RlKGNvbnRlbnROb2RlLCBub2RlLnR5cGUpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChub2RlLnR5cGUgPT09IFwiaHRtbFwiKSB7XG4gICAgICBsaW5lc1tjdXJyZW50TGluZV0ucHVzaCh7IGNvbnRlbnQ6IG5vZGUudGV4dCwgdHlwZTogXCJub3JtYWxcIiB9KTtcbiAgICB9XG4gIH1cbiAgX19uYW1lKHByb2Nlc3NOb2RlLCBcInByb2Nlc3NOb2RlXCIpO1xuICBub2Rlcy5mb3JFYWNoKCh0cmVlTm9kZSkgPT4ge1xuICAgIGlmICh0cmVlTm9kZS50eXBlID09PSBcInBhcmFncmFwaFwiKSB7XG4gICAgICB0cmVlTm9kZS50b2tlbnM/LmZvckVhY2goKGNvbnRlbnROb2RlKSA9PiB7XG4gICAgICAgIHByb2Nlc3NOb2RlKGNvbnRlbnROb2RlKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHJlZU5vZGUudHlwZSA9PT0gXCJodG1sXCIpIHtcbiAgICAgIGxpbmVzW2N1cnJlbnRMaW5lXS5wdXNoKHsgY29udGVudDogdHJlZU5vZGUudGV4dCwgdHlwZTogXCJub3JtYWxcIiB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGluZXNbY3VycmVudExpbmVdLnB1c2goeyBjb250ZW50OiB0cmVlTm9kZS5yYXcsIHR5cGU6IFwibm9ybWFsXCIgfSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGxpbmVzO1xufVxuX19uYW1lKG1hcmtkb3duVG9MaW5lcywgXCJtYXJrZG93blRvTGluZXNcIik7XG5mdW5jdGlvbiBub25NYXJrZG93blRvSFRNTCh0ZXh0KSB7XG4gIGlmICghdGV4dCkge1xuICAgIHJldHVybiBcIlwiO1xuICB9XG4gIHJldHVybiBgPHA+JHsvKipcbiAgICogUmVwbGFjZSBuZXcgbGluZXMgd2l0aCA8YnIgLz4gdGFncy5cbiAgICpcbiAgICogVW5saWtlIGluIG1hcmtkb3duIHRleHQsIGBcXG5gIHNlcXVlbmNlcyBhcmUgdHJlYXRlZCBhcyBsaW5lIGJyZWFrcyBoZXJlLlxuICAgKi9cbiAgdGV4dC5yZXBsYWNlKC9cXFxcbnxcXG4vZywgXCI8YnIgLz5cIil9PC9wPmA7XG59XG5fX25hbWUobm9uTWFya2Rvd25Ub0hUTUwsIFwibm9uTWFya2Rvd25Ub0hUTUxcIik7XG5mdW5jdGlvbiBtYXJrZG93blRvSFRNTChtYXJrZG93biwgeyBtYXJrZG93bkF1dG9XcmFwIH0gPSB7fSkge1xuICBjb25zdCBub2RlcyA9IG1hcmtlZC5sZXhlcihtYXJrZG93bik7XG4gIGZ1bmN0aW9uIG91dHB1dChub2RlKSB7XG4gICAgaWYgKG5vZGUudHlwZSA9PT0gXCJ0ZXh0XCIpIHtcbiAgICAgIGlmIChtYXJrZG93bkF1dG9XcmFwID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gbm9kZS50ZXh0LnJlcGxhY2UoL1xcbiAqL2csIFwiPGJyLz5cIikucmVwbGFjZSgvIC9nLCBcIiZuYnNwO1wiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBub2RlLnRleHQucmVwbGFjZSgvXFxuICovZywgXCI8YnIvPlwiKTtcbiAgICB9IGVsc2UgaWYgKG5vZGUudHlwZSA9PT0gXCJzdHJvbmdcIikge1xuICAgICAgcmV0dXJuIGA8c3Ryb25nPiR7bm9kZS50b2tlbnM/Lm1hcChvdXRwdXQpLmpvaW4oXCJcIil9PC9zdHJvbmc+YDtcbiAgICB9IGVsc2UgaWYgKG5vZGUudHlwZSA9PT0gXCJlbVwiKSB7XG4gICAgICByZXR1cm4gYDxlbT4ke25vZGUudG9rZW5zPy5tYXAob3V0cHV0KS5qb2luKFwiXCIpfTwvZW0+YDtcbiAgICB9IGVsc2UgaWYgKG5vZGUudHlwZSA9PT0gXCJwYXJhZ3JhcGhcIikge1xuICAgICAgcmV0dXJuIGA8cD4ke25vZGUudG9rZW5zPy5tYXAob3V0cHV0KS5qb2luKFwiXCIpfTwvcD5gO1xuICAgIH0gZWxzZSBpZiAobm9kZS50eXBlID09PSBcInNwYWNlXCIpIHtcbiAgICAgIHJldHVybiBcIlwiO1xuICAgIH0gZWxzZSBpZiAobm9kZS50eXBlID09PSBcImh0bWxcIikge1xuICAgICAgcmV0dXJuIGAke25vZGUudGV4dH1gO1xuICAgIH0gZWxzZSBpZiAobm9kZS50eXBlID09PSBcImVzY2FwZVwiKSB7XG4gICAgICByZXR1cm4gbm9kZS50ZXh0O1xuICAgIH1cbiAgICBsb2cud2FybihgVW5zdXBwb3J0ZWQgbWFya2Rvd246ICR7bm9kZS50eXBlfWApO1xuICAgIHJldHVybiBub2RlLnJhdztcbiAgfVxuICBfX25hbWUob3V0cHV0LCBcIm91dHB1dFwiKTtcbiAgcmV0dXJuIG5vZGVzLm1hcChvdXRwdXQpLmpvaW4oXCJcIik7XG59XG5fX25hbWUobWFya2Rvd25Ub0hUTUwsIFwibWFya2Rvd25Ub0hUTUxcIik7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9zcGxpdFRleHQudHNcbmZ1bmN0aW9uIHNwbGl0VGV4dFRvQ2hhcnModGV4dCkge1xuICBpZiAoSW50bC5TZWdtZW50ZXIpIHtcbiAgICByZXR1cm4gWy4uLm5ldyBJbnRsLlNlZ21lbnRlcigpLnNlZ21lbnQodGV4dCldLm1hcCgocykgPT4gcy5zZWdtZW50KTtcbiAgfVxuICByZXR1cm4gWy4uLnRleHRdO1xufVxuX19uYW1lKHNwbGl0VGV4dFRvQ2hhcnMsIFwic3BsaXRUZXh0VG9DaGFyc1wiKTtcbmZ1bmN0aW9uIHNwbGl0V29yZFRvRml0V2lkdGgoY2hlY2tGaXQsIHdvcmQpIHtcbiAgY29uc3QgY2hhcmFjdGVycyA9IHNwbGl0VGV4dFRvQ2hhcnMod29yZC5jb250ZW50KTtcbiAgcmV0dXJuIHNwbGl0V29yZFRvRml0V2lkdGhSZWN1cnNpb24oY2hlY2tGaXQsIFtdLCBjaGFyYWN0ZXJzLCB3b3JkLnR5cGUpO1xufVxuX19uYW1lKHNwbGl0V29yZFRvRml0V2lkdGgsIFwic3BsaXRXb3JkVG9GaXRXaWR0aFwiKTtcbmZ1bmN0aW9uIHNwbGl0V29yZFRvRml0V2lkdGhSZWN1cnNpb24oY2hlY2tGaXQsIHVzZWRDaGFycywgcmVtYWluaW5nQ2hhcnMsIHR5cGUpIHtcbiAgaWYgKHJlbWFpbmluZ0NoYXJzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBbXG4gICAgICB7IGNvbnRlbnQ6IHVzZWRDaGFycy5qb2luKFwiXCIpLCB0eXBlIH0sXG4gICAgICB7IGNvbnRlbnQ6IFwiXCIsIHR5cGUgfVxuICAgIF07XG4gIH1cbiAgY29uc3QgW25leHRDaGFyLCAuLi5yZXN0XSA9IHJlbWFpbmluZ0NoYXJzO1xuICBjb25zdCBuZXdXb3JkID0gWy4uLnVzZWRDaGFycywgbmV4dENoYXJdO1xuICBpZiAoY2hlY2tGaXQoW3sgY29udGVudDogbmV3V29yZC5qb2luKFwiXCIpLCB0eXBlIH1dKSkge1xuICAgIHJldHVybiBzcGxpdFdvcmRUb0ZpdFdpZHRoUmVjdXJzaW9uKGNoZWNrRml0LCBuZXdXb3JkLCByZXN0LCB0eXBlKTtcbiAgfVxuICBpZiAodXNlZENoYXJzLmxlbmd0aCA9PT0gMCAmJiBuZXh0Q2hhcikge1xuICAgIHVzZWRDaGFycy5wdXNoKG5leHRDaGFyKTtcbiAgICByZW1haW5pbmdDaGFycy5zaGlmdCgpO1xuICB9XG4gIHJldHVybiBbXG4gICAgeyBjb250ZW50OiB1c2VkQ2hhcnMuam9pbihcIlwiKSwgdHlwZSB9LFxuICAgIHsgY29udGVudDogcmVtYWluaW5nQ2hhcnMuam9pbihcIlwiKSwgdHlwZSB9XG4gIF07XG59XG5fX25hbWUoc3BsaXRXb3JkVG9GaXRXaWR0aFJlY3Vyc2lvbiwgXCJzcGxpdFdvcmRUb0ZpdFdpZHRoUmVjdXJzaW9uXCIpO1xuZnVuY3Rpb24gc3BsaXRMaW5lVG9GaXRXaWR0aChsaW5lLCBjaGVja0ZpdCkge1xuICBpZiAobGluZS5zb21lKCh7IGNvbnRlbnQgfSkgPT4gY29udGVudC5pbmNsdWRlcyhcIlxcblwiKSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJzcGxpdExpbmVUb0ZpdFdpZHRoIGRvZXMgbm90IHN1cHBvcnQgbmV3bGluZXMgaW4gdGhlIGxpbmVcIik7XG4gIH1cbiAgcmV0dXJuIHNwbGl0TGluZVRvRml0V2lkdGhSZWN1cnNpb24obGluZSwgY2hlY2tGaXQpO1xufVxuX19uYW1lKHNwbGl0TGluZVRvRml0V2lkdGgsIFwic3BsaXRMaW5lVG9GaXRXaWR0aFwiKTtcbmZ1bmN0aW9uIHNwbGl0TGluZVRvRml0V2lkdGhSZWN1cnNpb24od29yZHMsIGNoZWNrRml0LCBsaW5lcyA9IFtdLCBuZXdMaW5lID0gW10pIHtcbiAgaWYgKHdvcmRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGlmIChuZXdMaW5lLmxlbmd0aCA+IDApIHtcbiAgICAgIGxpbmVzLnB1c2gobmV3TGluZSk7XG4gICAgfVxuICAgIHJldHVybiBsaW5lcy5sZW5ndGggPiAwID8gbGluZXMgOiBbXTtcbiAgfVxuICBsZXQgam9pbmVyID0gXCJcIjtcbiAgaWYgKHdvcmRzWzBdLmNvbnRlbnQgPT09IFwiIFwiKSB7XG4gICAgam9pbmVyID0gXCIgXCI7XG4gICAgd29yZHMuc2hpZnQoKTtcbiAgfVxuICBjb25zdCBuZXh0V29yZCA9IHdvcmRzLnNoaWZ0KCkgPz8geyBjb250ZW50OiBcIiBcIiwgdHlwZTogXCJub3JtYWxcIiB9O1xuICBjb25zdCBsaW5lV2l0aE5leHRXb3JkID0gWy4uLm5ld0xpbmVdO1xuICBpZiAoam9pbmVyICE9PSBcIlwiKSB7XG4gICAgbGluZVdpdGhOZXh0V29yZC5wdXNoKHsgY29udGVudDogam9pbmVyLCB0eXBlOiBcIm5vcm1hbFwiIH0pO1xuICB9XG4gIGxpbmVXaXRoTmV4dFdvcmQucHVzaChuZXh0V29yZCk7XG4gIGlmIChjaGVja0ZpdChsaW5lV2l0aE5leHRXb3JkKSkge1xuICAgIHJldHVybiBzcGxpdExpbmVUb0ZpdFdpZHRoUmVjdXJzaW9uKHdvcmRzLCBjaGVja0ZpdCwgbGluZXMsIGxpbmVXaXRoTmV4dFdvcmQpO1xuICB9XG4gIGlmIChuZXdMaW5lLmxlbmd0aCA+IDApIHtcbiAgICBsaW5lcy5wdXNoKG5ld0xpbmUpO1xuICAgIHdvcmRzLnVuc2hpZnQobmV4dFdvcmQpO1xuICB9IGVsc2UgaWYgKG5leHRXb3JkLmNvbnRlbnQpIHtcbiAgICBjb25zdCBbbGluZSwgcmVzdF0gPSBzcGxpdFdvcmRUb0ZpdFdpZHRoKGNoZWNrRml0LCBuZXh0V29yZCk7XG4gICAgbGluZXMucHVzaChbbGluZV0pO1xuICAgIGlmIChyZXN0LmNvbnRlbnQpIHtcbiAgICAgIHdvcmRzLnVuc2hpZnQocmVzdCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzcGxpdExpbmVUb0ZpdFdpZHRoUmVjdXJzaW9uKHdvcmRzLCBjaGVja0ZpdCwgbGluZXMpO1xufVxuX19uYW1lKHNwbGl0TGluZVRvRml0V2lkdGhSZWN1cnNpb24sIFwic3BsaXRMaW5lVG9GaXRXaWR0aFJlY3Vyc2lvblwiKTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL2NyZWF0ZVRleHQudHNcbmZ1bmN0aW9uIGFwcGx5U3R5bGUoZG9tLCBzdHlsZUZuKSB7XG4gIGlmIChzdHlsZUZuKSB7XG4gICAgZG9tLmF0dHIoXCJzdHlsZVwiLCBzdHlsZUZuKTtcbiAgfVxufVxuX19uYW1lKGFwcGx5U3R5bGUsIFwiYXBwbHlTdHlsZVwiKTtcbnZhciBtYXhTYWZlU2l6ZUZvcldpZHRoID0gMTYzODQ7XG5hc3luYyBmdW5jdGlvbiBhZGRIdG1sU3BhbihlbGVtZW50LCBub2RlLCB3aWR0aCwgY2xhc3NlcywgYWRkQmFja2dyb3VuZCA9IGZhbHNlLCBjb25maWcgPSBnZXRDb25maWcoKSkge1xuICBjb25zdCBmbyA9IGVsZW1lbnQuYXBwZW5kKFwiZm9yZWlnbk9iamVjdFwiKTtcbiAgZm8uYXR0cihcIndpZHRoXCIsIGAke01hdGgubWluKDEwICogd2lkdGgsIG1heFNhZmVTaXplRm9yV2lkdGgpfXB4YCk7XG4gIGZvLmF0dHIoXCJoZWlnaHRcIiwgYCR7TWF0aC5taW4oMTAgKiB3aWR0aCwgbWF4U2FmZVNpemVGb3JXaWR0aCl9cHhgKTtcbiAgY29uc3QgZGl2ID0gZm8uYXBwZW5kKFwieGh0bWw6ZGl2XCIpO1xuICBjb25zdCBzYW5pdGl6ZWRMYWJlbCA9IGhhc0thdGV4KG5vZGUubGFiZWwpID8gYXdhaXQgcmVuZGVyS2F0ZXhTYW5pdGl6ZWQobm9kZS5sYWJlbC5yZXBsYWNlKGNvbW1vbl9kZWZhdWx0LmxpbmVCcmVha1JlZ2V4LCBcIlxcblwiKSwgY29uZmlnKSA6IHNhbml0aXplVGV4dChub2RlLmxhYmVsLCBjb25maWcpO1xuICBjb25zdCBsYWJlbENsYXNzID0gbm9kZS5pc05vZGUgPyBcIm5vZGVMYWJlbFwiIDogXCJlZGdlTGFiZWxcIjtcbiAgY29uc3Qgc3BhbiA9IGRpdi5hcHBlbmQoXCJzcGFuXCIpO1xuICBzcGFuLmh0bWwoc2FuaXRpemVkTGFiZWwpO1xuICBhcHBseVN0eWxlKHNwYW4sIG5vZGUubGFiZWxTdHlsZSk7XG4gIHNwYW4uYXR0cihcImNsYXNzXCIsIGAke2xhYmVsQ2xhc3N9ICR7Y2xhc3Nlc31gKTtcbiAgYXBwbHlTdHlsZShkaXYsIG5vZGUubGFiZWxTdHlsZSk7XG4gIGRpdi5zdHlsZShcImRpc3BsYXlcIiwgXCJ0YWJsZS1jZWxsXCIpO1xuICBkaXYuc3R5bGUoXCJ3aGl0ZS1zcGFjZVwiLCBcIm5vd3JhcFwiKTtcbiAgZGl2LnN0eWxlKFwibGluZS1oZWlnaHRcIiwgXCIxLjVcIik7XG4gIGlmICh3aWR0aCAhPT0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKSB7XG4gICAgZGl2LnN0eWxlKFwibWF4LXdpZHRoXCIsIHdpZHRoICsgXCJweFwiKTtcbiAgICBkaXYuc3R5bGUoXCJ0ZXh0LWFsaWduXCIsIFwiY2VudGVyXCIpO1xuICB9XG4gIGRpdi5hdHRyKFwieG1sbnNcIiwgXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIpO1xuICBpZiAoYWRkQmFja2dyb3VuZCkge1xuICAgIGRpdi5hdHRyKFwiY2xhc3NcIiwgXCJsYWJlbEJrZ1wiKTtcbiAgfVxuICBsZXQgYmJveCA9IGRpdi5ub2RlKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIGlmIChiYm94LndpZHRoID09PSB3aWR0aCkge1xuICAgIGRpdi5zdHlsZShcImRpc3BsYXlcIiwgXCJ0YWJsZVwiKTtcbiAgICBkaXYuc3R5bGUoXCJ3aGl0ZS1zcGFjZVwiLCBcImJyZWFrLXNwYWNlc1wiKTtcbiAgICBkaXYuc3R5bGUoXCJ3aWR0aFwiLCB3aWR0aCArIFwicHhcIik7XG4gICAgYmJveCA9IGRpdi5ub2RlKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIH1cbiAgcmV0dXJuIGZvLm5vZGUoKTtcbn1cbl9fbmFtZShhZGRIdG1sU3BhbiwgXCJhZGRIdG1sU3BhblwiKTtcbmZ1bmN0aW9uIGNyZWF0ZVRzcGFuKHRleHRFbGVtZW50LCBsaW5lSW5kZXgsIGxpbmVIZWlnaHQsIGNlbnRlclRleHQgPSBmYWxzZSkge1xuICBjb25zdCB0c3BhbiA9IHRleHRFbGVtZW50LmFwcGVuZChcInRzcGFuXCIpLmF0dHIoXCJjbGFzc1wiLCBcInRleHQtb3V0ZXItdHNwYW5cIikuYXR0cihcInhcIiwgMCkuYXR0cihcInlcIiwgbGluZUluZGV4ICogbGluZUhlaWdodCAtIDAuMSArIFwiZW1cIikuYXR0cihcImR5XCIsIGxpbmVIZWlnaHQgKyBcImVtXCIpO1xuICBpZiAoY2VudGVyVGV4dCkge1xuICAgIHRzcGFuLmF0dHIoXCJ0ZXh0LWFuY2hvclwiLCBcIm1pZGRsZVwiKTtcbiAgfVxuICByZXR1cm4gdHNwYW47XG59XG5fX25hbWUoY3JlYXRlVHNwYW4sIFwiY3JlYXRlVHNwYW5cIik7XG5mdW5jdGlvbiBjb21wdXRlV2lkdGhPZlRleHQocGFyZW50Tm9kZSwgbGluZUhlaWdodCwgbGluZSkge1xuICBjb25zdCB0ZXN0RWxlbWVudCA9IHBhcmVudE5vZGUuYXBwZW5kKFwidGV4dFwiKTtcbiAgY29uc3QgdGVzdFNwYW4gPSBjcmVhdGVUc3Bhbih0ZXN0RWxlbWVudCwgMSwgbGluZUhlaWdodCk7XG4gIHVwZGF0ZVRleHRDb250ZW50QW5kU3R5bGVzKHRlc3RTcGFuLCBsaW5lKTtcbiAgY29uc3QgdGV4dExlbmd0aCA9IHRlc3RTcGFuLm5vZGUoKS5nZXRDb21wdXRlZFRleHRMZW5ndGgoKTtcbiAgdGVzdEVsZW1lbnQucmVtb3ZlKCk7XG4gIHJldHVybiB0ZXh0TGVuZ3RoO1xufVxuX19uYW1lKGNvbXB1dGVXaWR0aE9mVGV4dCwgXCJjb21wdXRlV2lkdGhPZlRleHRcIik7XG5mdW5jdGlvbiBjb21wdXRlRGltZW5zaW9uT2ZUZXh0KHBhcmVudE5vZGUsIGxpbmVIZWlnaHQsIHRleHQpIHtcbiAgY29uc3QgdGVzdEVsZW1lbnQgPSBwYXJlbnROb2RlLmFwcGVuZChcInRleHRcIik7XG4gIGNvbnN0IHRlc3RTcGFuID0gY3JlYXRlVHNwYW4odGVzdEVsZW1lbnQsIDEsIGxpbmVIZWlnaHQpO1xuICB1cGRhdGVUZXh0Q29udGVudEFuZFN0eWxlcyh0ZXN0U3BhbiwgW3sgY29udGVudDogdGV4dCwgdHlwZTogXCJub3JtYWxcIiB9XSk7XG4gIGNvbnN0IHRleHREaW1lbnNpb24gPSB0ZXN0U3Bhbi5ub2RlKCk/LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICBpZiAodGV4dERpbWVuc2lvbikge1xuICAgIHRlc3RFbGVtZW50LnJlbW92ZSgpO1xuICB9XG4gIHJldHVybiB0ZXh0RGltZW5zaW9uO1xufVxuX19uYW1lKGNvbXB1dGVEaW1lbnNpb25PZlRleHQsIFwiY29tcHV0ZURpbWVuc2lvbk9mVGV4dFwiKTtcbmZ1bmN0aW9uIGNyZWF0ZUZvcm1hdHRlZFRleHQod2lkdGgsIGcsIHN0cnVjdHVyZWRUZXh0LCBhZGRCYWNrZ3JvdW5kID0gZmFsc2UsIGNlbnRlclRleHQgPSBmYWxzZSkge1xuICBjb25zdCBsaW5lSGVpZ2h0ID0gMS4xO1xuICBjb25zdCBsYWJlbEdyb3VwID0gZy5hcHBlbmQoXCJnXCIpO1xuICBjb25zdCBia2cgPSBsYWJlbEdyb3VwLmluc2VydChcInJlY3RcIikuYXR0cihcImNsYXNzXCIsIFwiYmFja2dyb3VuZFwiKS5hdHRyKFwic3R5bGVcIiwgXCJzdHJva2U6IG5vbmVcIik7XG4gIGNvbnN0IHRleHRFbGVtZW50ID0gbGFiZWxHcm91cC5hcHBlbmQoXCJ0ZXh0XCIpLmF0dHIoXCJ5XCIsIFwiLTEwLjFcIik7XG4gIGlmIChjZW50ZXJUZXh0KSB7XG4gICAgdGV4dEVsZW1lbnQuYXR0cihcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpO1xuICB9XG4gIGxldCBsaW5lSW5kZXggPSAwO1xuICBmb3IgKGNvbnN0IGxpbmUgb2Ygc3RydWN0dXJlZFRleHQpIHtcbiAgICBjb25zdCBjaGVja1dpZHRoID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgobGluZTIpID0+IGNvbXB1dGVXaWR0aE9mVGV4dChsYWJlbEdyb3VwLCBsaW5lSGVpZ2h0LCBsaW5lMikgPD0gd2lkdGgsIFwiY2hlY2tXaWR0aFwiKTtcbiAgICBjb25zdCBsaW5lc1VuZGVyV2lkdGggPSBjaGVja1dpZHRoKGxpbmUpID8gW2xpbmVdIDogc3BsaXRMaW5lVG9GaXRXaWR0aChsaW5lLCBjaGVja1dpZHRoKTtcbiAgICBmb3IgKGNvbnN0IHByZXBhcmVkTGluZSBvZiBsaW5lc1VuZGVyV2lkdGgpIHtcbiAgICAgIGNvbnN0IHRzcGFuID0gY3JlYXRlVHNwYW4odGV4dEVsZW1lbnQsIGxpbmVJbmRleCwgbGluZUhlaWdodCwgY2VudGVyVGV4dCk7XG4gICAgICB1cGRhdGVUZXh0Q29udGVudEFuZFN0eWxlcyh0c3BhbiwgcHJlcGFyZWRMaW5lKTtcbiAgICAgIGxpbmVJbmRleCsrO1xuICAgIH1cbiAgfVxuICBpZiAoYWRkQmFja2dyb3VuZCkge1xuICAgIGNvbnN0IGJib3ggPSB0ZXh0RWxlbWVudC5ub2RlKCkuZ2V0QkJveCgpO1xuICAgIGNvbnN0IHBhZGRpbmcgPSAyO1xuICAgIGJrZy5hdHRyKFwieFwiLCBiYm94LnggLSBwYWRkaW5nKS5hdHRyKFwieVwiLCBiYm94LnkgLSBwYWRkaW5nKS5hdHRyKFwid2lkdGhcIiwgYmJveC53aWR0aCArIDIgKiBwYWRkaW5nKS5hdHRyKFwiaGVpZ2h0XCIsIGJib3guaGVpZ2h0ICsgMiAqIHBhZGRpbmcpO1xuICAgIHJldHVybiBsYWJlbEdyb3VwLm5vZGUoKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdGV4dEVsZW1lbnQubm9kZSgpO1xuICB9XG59XG5fX25hbWUoY3JlYXRlRm9ybWF0dGVkVGV4dCwgXCJjcmVhdGVGb3JtYXR0ZWRUZXh0XCIpO1xuZnVuY3Rpb24gZGVjb2RlSFRNTEVudGl0aWVzKHRleHQpIHtcbiAgY29uc3QgcmVnZXggPSAvJihhbXB8bHR8Z3QpOy9nO1xuICByZXR1cm4gdGV4dC5yZXBsYWNlKHJlZ2V4LCAobWF0Y2gsIGVudGl0eSkgPT4ge1xuICAgIHN3aXRjaCAoZW50aXR5KSB7XG4gICAgICBjYXNlIFwiYW1wXCI6XG4gICAgICAgIHJldHVybiBcIiZcIjtcbiAgICAgIGNhc2UgXCJsdFwiOlxuICAgICAgICByZXR1cm4gXCI8XCI7XG4gICAgICBjYXNlIFwiZ3RcIjpcbiAgICAgICAgcmV0dXJuIFwiPlwiO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH1cbiAgfSk7XG59XG5fX25hbWUoZGVjb2RlSFRNTEVudGl0aWVzLCBcImRlY29kZUhUTUxFbnRpdGllc1wiKTtcbmZ1bmN0aW9uIHVwZGF0ZVRleHRDb250ZW50QW5kU3R5bGVzKHRzcGFuLCB3cmFwcGVkTGluZSkge1xuICB0c3Bhbi50ZXh0KFwiXCIpO1xuICB3cmFwcGVkTGluZS5mb3JFYWNoKCh3b3JkLCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IGlubmVyVHNwYW4gPSB0c3Bhbi5hcHBlbmQoXCJ0c3BhblwiKS5hdHRyKFwiZm9udC1zdHlsZVwiLCB3b3JkLnR5cGUgPT09IFwiZW1cIiA/IFwiaXRhbGljXCIgOiBcIm5vcm1hbFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJ0ZXh0LWlubmVyLXRzcGFuXCIpLmF0dHIoXCJmb250LXdlaWdodFwiLCB3b3JkLnR5cGUgPT09IFwic3Ryb25nXCIgPyBcImJvbGRcIiA6IFwibm9ybWFsXCIpO1xuICAgIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgaW5uZXJUc3Bhbi50ZXh0KGRlY29kZUhUTUxFbnRpdGllcyh3b3JkLmNvbnRlbnQpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaW5uZXJUc3Bhbi50ZXh0KFwiIFwiICsgZGVjb2RlSFRNTEVudGl0aWVzKHdvcmQuY29udGVudCkpO1xuICAgIH1cbiAgfSk7XG59XG5fX25hbWUodXBkYXRlVGV4dENvbnRlbnRBbmRTdHlsZXMsIFwidXBkYXRlVGV4dENvbnRlbnRBbmRTdHlsZXNcIik7XG5hc3luYyBmdW5jdGlvbiByZXBsYWNlSWNvblN1YnN0cmluZyh0ZXh0LCBjb25maWcgPSB7fSkge1xuICBjb25zdCBwZW5kaW5nUmVwbGFjZW1lbnRzID0gW107XG4gIHRleHQucmVwbGFjZSgvKGZhW2JrbHJzXT8pOmZhLShbXFx3LV0rKS9nLCAoZnVsbE1hdGNoLCBwcmVmaXgsIGljb25OYW1lKSA9PiB7XG4gICAgcGVuZGluZ1JlcGxhY2VtZW50cy5wdXNoKFxuICAgICAgKGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgcmVnaXN0ZXJlZEljb25OYW1lID0gYCR7cHJlZml4fToke2ljb25OYW1lfWA7XG4gICAgICAgIGlmIChhd2FpdCBpc0ljb25BdmFpbGFibGUocmVnaXN0ZXJlZEljb25OYW1lKSkge1xuICAgICAgICAgIHJldHVybiBhd2FpdCBnZXRJY29uU1ZHKHJlZ2lzdGVyZWRJY29uTmFtZSwgdm9pZCAwLCB7IGNsYXNzOiBcImxhYmVsLWljb25cIiB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gYDxpIGNsYXNzPScke3Nhbml0aXplVGV4dChmdWxsTWF0Y2gsIGNvbmZpZykucmVwbGFjZShcIjpcIiwgXCIgXCIpfSc+PC9pPmA7XG4gICAgICAgIH1cbiAgICAgIH0pKClcbiAgICApO1xuICAgIHJldHVybiBmdWxsTWF0Y2g7XG4gIH0pO1xuICBjb25zdCByZXBsYWNlbWVudHMgPSBhd2FpdCBQcm9taXNlLmFsbChwZW5kaW5nUmVwbGFjZW1lbnRzKTtcbiAgcmV0dXJuIHRleHQucmVwbGFjZSgvKGZhW2JrbHJzXT8pOmZhLShbXFx3LV0rKS9nLCAoKSA9PiByZXBsYWNlbWVudHMuc2hpZnQoKSA/PyBcIlwiKTtcbn1cbl9fbmFtZShyZXBsYWNlSWNvblN1YnN0cmluZywgXCJyZXBsYWNlSWNvblN1YnN0cmluZ1wiKTtcbnZhciBjcmVhdGVUZXh0ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShhc3luYyAoZWwsIHRleHQgPSBcIlwiLCB7XG4gIHN0eWxlID0gXCJcIixcbiAgaXNUaXRsZSA9IGZhbHNlLFxuICBjbGFzc2VzID0gXCJcIixcbiAgdXNlSHRtbExhYmVscyA9IHRydWUsXG4gIG1hcmtkb3duID0gdHJ1ZSxcbiAgaXNOb2RlID0gdHJ1ZSxcbiAgLyoqXG4gICAqIFRoZSB3aWR0aCB0byB3cmFwIHRoZSB0ZXh0IHdpdGhpbi4gU2V0IHRvIGBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFlgIGZvciBubyB3cmFwcGluZy5cbiAgICovXG4gIHdpZHRoID0gMjAwLFxuICBhZGRTdmdCYWNrZ3JvdW5kID0gZmFsc2Vcbn0gPSB7fSwgY29uZmlnKSA9PiB7XG4gIGxvZy5kZWJ1ZyhcbiAgICBcIlhZWiBjcmVhdGVUZXh0XCIsXG4gICAgdGV4dCxcbiAgICBzdHlsZSxcbiAgICBpc1RpdGxlLFxuICAgIGNsYXNzZXMsXG4gICAgdXNlSHRtbExhYmVscyxcbiAgICBpc05vZGUsXG4gICAgXCJhZGRTdmdCYWNrZ3JvdW5kOiBcIixcbiAgICBhZGRTdmdCYWNrZ3JvdW5kXG4gICk7XG4gIGlmICh1c2VIdG1sTGFiZWxzKSB7XG4gICAgY29uc3QgaHRtbFRleHQgPSBtYXJrZG93biA/IG1hcmtkb3duVG9IVE1MKHRleHQsIGNvbmZpZykgOiBub25NYXJrZG93blRvSFRNTCh0ZXh0KTtcbiAgICBjb25zdCBkZWNvZGVkUmVwbGFjZWRUZXh0ID0gYXdhaXQgcmVwbGFjZUljb25TdWJzdHJpbmcoZGVjb2RlRW50aXRpZXMoaHRtbFRleHQpLCBjb25maWcpO1xuICAgIGNvbnN0IGlucHV0Rm9yS2F0ZXggPSB0ZXh0LnJlcGxhY2UoL1xcXFxcXFxcL2csIFwiXFxcXFwiKTtcbiAgICBjb25zdCBub2RlID0ge1xuICAgICAgaXNOb2RlLFxuICAgICAgbGFiZWw6IGhhc0thdGV4KHRleHQpID8gaW5wdXRGb3JLYXRleCA6IGRlY29kZWRSZXBsYWNlZFRleHQsXG4gICAgICBsYWJlbFN0eWxlOiBzdHlsZS5yZXBsYWNlKFwiZmlsbDpcIiwgXCJjb2xvcjpcIilcbiAgICB9O1xuICAgIGNvbnN0IHZlcnRleE5vZGUgPSBhd2FpdCBhZGRIdG1sU3BhbihlbCwgbm9kZSwgd2lkdGgsIGNsYXNzZXMsIGFkZFN2Z0JhY2tncm91bmQsIGNvbmZpZyk7XG4gICAgcmV0dXJuIHZlcnRleE5vZGU7XG4gIH0gZWxzZSB7XG4gICAgY29uc3Qgc2FuaXRpemVCUiA9IGRlY29kZUVudGl0aWVzKHRleHQucmVwbGFjZSgvPGJyXFxzKlxcLz8+L2csIFwiPGJyLz5cIikpO1xuICAgIGNvbnN0IHN0cnVjdHVyZWRUZXh0ID0gbWFya2Rvd24gPyBtYXJrZG93blRvTGluZXMoc2FuaXRpemVCUi5yZXBsYWNlKFwiPGJyPlwiLCBcIjxici8+XCIpLCBjb25maWcpIDogbm9uTWFya2Rvd25Ub0xpbmVzKHNhbml0aXplQlIpO1xuICAgIGNvbnN0IHN2Z0xhYmVsID0gY3JlYXRlRm9ybWF0dGVkVGV4dChcbiAgICAgIHdpZHRoLFxuICAgICAgZWwsXG4gICAgICBzdHJ1Y3R1cmVkVGV4dCxcbiAgICAgIHRleHQgPyBhZGRTdmdCYWNrZ3JvdW5kIDogZmFsc2UsXG4gICAgICAhaXNOb2RlXG4gICAgKTtcbiAgICBpZiAoaXNOb2RlKSB7XG4gICAgICBpZiAoL3N0cm9rZTovLmV4ZWMoc3R5bGUpKSB7XG4gICAgICAgIHN0eWxlID0gc3R5bGUucmVwbGFjZShcInN0cm9rZTpcIiwgXCJsaW5lQ29sb3I6XCIpO1xuICAgICAgfVxuICAgICAgY29uc3Qgbm9kZUxhYmVsVGV4dFN0eWxlID0gc3R5bGUucmVwbGFjZSgvc3Ryb2tlOlteO10rOz8vZywgXCJcIikucmVwbGFjZSgvc3Ryb2tlLXdpZHRoOlteO10rOz8vZywgXCJcIikucmVwbGFjZSgvZmlsbDpbXjtdKzs/L2csIFwiXCIpLnJlcGxhY2UoL2NvbG9yOi9nLCBcImZpbGw6XCIpO1xuICAgICAgc2VsZWN0KHN2Z0xhYmVsKS5hdHRyKFwic3R5bGVcIiwgbm9kZUxhYmVsVGV4dFN0eWxlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZWRnZUxhYmVsUmVjdFN0eWxlID0gc3R5bGUucmVwbGFjZSgvc3Ryb2tlOlteO10rOz8vZywgXCJcIikucmVwbGFjZSgvc3Ryb2tlLXdpZHRoOlteO10rOz8vZywgXCJcIikucmVwbGFjZSgvZmlsbDpbXjtdKzs/L2csIFwiXCIpLnJlcGxhY2UoL2JhY2tncm91bmQ6L2csIFwiZmlsbDpcIik7XG4gICAgICBzZWxlY3Qoc3ZnTGFiZWwpLnNlbGVjdChcInJlY3RcIikuYXR0cihcInN0eWxlXCIsIGVkZ2VMYWJlbFJlY3RTdHlsZS5yZXBsYWNlKC9iYWNrZ3JvdW5kOi9nLCBcImZpbGw6XCIpKTtcbiAgICAgIGNvbnN0IGVkZ2VMYWJlbFRleHRTdHlsZSA9IHN0eWxlLnJlcGxhY2UoL3N0cm9rZTpbXjtdKzs/L2csIFwiXCIpLnJlcGxhY2UoL3N0cm9rZS13aWR0aDpbXjtdKzs/L2csIFwiXCIpLnJlcGxhY2UoL2ZpbGw6W147XSs7Py9nLCBcIlwiKS5yZXBsYWNlKC9jb2xvcjovZywgXCJmaWxsOlwiKTtcbiAgICAgIHNlbGVjdChzdmdMYWJlbCkuc2VsZWN0KFwidGV4dFwiKS5hdHRyKFwic3R5bGVcIiwgZWRnZUxhYmVsVGV4dFN0eWxlKTtcbiAgICB9XG4gICAgaWYgKGlzVGl0bGUpIHtcbiAgICAgIHNlbGVjdChzdmdMYWJlbCkuc2VsZWN0QWxsKFwidHNwYW4udGV4dC1vdXRlci10c3BhblwiKS5jbGFzc2VkKFwidGl0bGUtcm93XCIsIHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxlY3Qoc3ZnTGFiZWwpLnNlbGVjdEFsbChcInRzcGFuLnRleHQtb3V0ZXItdHNwYW5cIikuY2xhc3NlZChcInJvd1wiLCB0cnVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHN2Z0xhYmVsO1xuICB9XG59LCBcImNyZWF0ZVRleHRcIik7XG5cbmV4cG9ydCB7XG4gIHVua25vd25JY29uLFxuICByZWdpc3Rlckljb25QYWNrcyxcbiAgZ2V0SWNvblNWRyxcbiAgY29tcHV0ZURpbWVuc2lvbk9m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RUFBQyxJQUFHLEdBQUU7QUFBQSxJQUFDLElBQUcsRUFBRSxXQUFXLEtBQUssQ0FBQztBQUFBLE1BQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxlQUFjLEVBQUU7QUFBQSxFQUFDLEVBQU0sU0FBRyxFQUFFLG1CQUFtQixLQUFLLENBQUM7QUFBQSxJQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsdUJBQXNCLEVBQUU7QUFBQSxFQUFFLE9BQU87QUFBQTtBQUFFLFNBQVMsQ0FBQyxDQUFDLEdBQUU7QUFBQSxFQUFDLElBQUc7QUFBQSxJQUFDLElBQUUsVUFBVSxDQUFDLEVBQUUsUUFBUSxFQUFFLGVBQWMsR0FBRztBQUFBLElBQUUsTUFBSztBQUFBLElBQUMsT0FBTztBQUFBO0FBQUEsRUFBSyxPQUFPO0FBQUE7QUFBRSxTQUFTLENBQUMsQ0FBQyxHQUFFLEdBQUU7QUFBQSxFQUFDLElBQUksSUFBRSxFQUFFLFFBQVEsRUFBRSxVQUFTLENBQUMsR0FBRSxHQUFFLE1BQUk7QUFBQSxJQUFDLElBQUksSUFBRSxPQUFHLElBQUU7QUFBQSxJQUFFLE1BQUssRUFBRSxLQUFHLEtBQUcsRUFBRSxPQUFLO0FBQUEsTUFBTSxJQUFFLENBQUM7QUFBQSxJQUFFLE9BQU8sSUFBRSxNQUFJO0FBQUEsR0FBSyxHQUFFLElBQUUsRUFBRSxNQUFNLEVBQUUsU0FBUyxHQUFFLElBQUU7QUFBQSxFQUFFLElBQUcsRUFBRSxHQUFHLEtBQUssS0FBRyxFQUFFLE1BQU0sR0FBRSxFQUFFLFNBQU8sS0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsS0FBSyxLQUFHLEVBQUUsSUFBSSxHQUFFO0FBQUEsSUFBRSxJQUFHLEVBQUUsU0FBTztBQUFBLE1BQUUsRUFBRSxPQUFPLENBQUM7QUFBQSxJQUFPO0FBQUEsWUFBSyxFQUFFLFNBQU87QUFBQSxRQUFHLEVBQUUsS0FBSyxFQUFFO0FBQUEsRUFBRSxNQUFLLElBQUUsRUFBRSxRQUFPO0FBQUEsSUFBSSxFQUFFLEtBQUcsRUFBRSxHQUFHLEtBQUssRUFBRSxRQUFRLEVBQUUsV0FBVSxHQUFHO0FBQUEsRUFBRSxPQUFPO0FBQUE7QUFBRSxTQUFTLENBQUMsQ0FBQyxHQUFFLEdBQUUsR0FBRTtBQUFBLEVBQUMsSUFBSSxJQUFFLEVBQUU7QUFBQSxFQUFPLElBQUcsTUFBSTtBQUFBLElBQUUsT0FBTTtBQUFBLEVBQUcsSUFBSSxJQUFFO0FBQUEsRUFBRSxNQUFLLElBQUUsS0FBRztBQUFBLElBQUMsSUFBSSxJQUFFLEVBQUUsT0FBTyxJQUFFLElBQUUsQ0FBQztBQUFBLElBQUUsSUFBRyxNQUFJLEtBQUcsQ0FBQztBQUFBLE1BQUU7QUFBQSxJQUFTLFNBQUcsTUFBSSxLQUFHO0FBQUEsTUFBRTtBQUFBLElBQVM7QUFBQTtBQUFBLEVBQUs7QUFBQSxFQUFDLE9BQU8sRUFBRSxNQUFNLEdBQUUsSUFBRSxDQUFDO0FBQUE7QUFBRSxTQUFTLEVBQUUsQ0FBQyxHQUFFLEdBQUU7QUFBQSxFQUFDLElBQUcsRUFBRSxRQUFRLEVBQUUsRUFBRSxNQUFJO0FBQUEsSUFBRyxPQUFNO0FBQUEsRUFBRyxJQUFJLElBQUU7QUFBQSxFQUFFLFNBQVEsSUFBRSxFQUFFLElBQUUsRUFBRSxRQUFPO0FBQUEsSUFBSSxJQUFHLEVBQUUsT0FBSztBQUFBLE1BQUs7QUFBQSxJQUFTLFNBQUcsRUFBRSxPQUFLLEVBQUU7QUFBQSxNQUFHO0FBQUEsSUFBUyxTQUFHLEVBQUUsT0FBSyxFQUFFLE9BQUssS0FBSSxJQUFFO0FBQUEsTUFBRyxPQUFPO0FBQUEsRUFBRSxPQUFPLElBQUUsSUFBRSxLQUFHO0FBQUE7QUFBRyxTQUFTLEVBQUUsQ0FBQyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQSxFQUFDLElBQUksSUFBRSxFQUFFLE1BQUssSUFBRSxFQUFFLFNBQU8sTUFBSyxJQUFFLEVBQUUsR0FBRyxRQUFRLEVBQUUsTUFBTSxtQkFBa0IsSUFBSTtBQUFBLEVBQUUsRUFBRSxNQUFNLFNBQU87QUFBQSxFQUFHLElBQUksSUFBRSxFQUFDLE1BQUssRUFBRSxHQUFHLE9BQU8sQ0FBQyxNQUFJLE1BQUksVUFBUSxRQUFPLEtBQUksR0FBRSxNQUFLLEdBQUUsT0FBTSxHQUFFLE1BQUssR0FBRSxRQUFPLEVBQUUsYUFBYSxDQUFDLEVBQUM7QUFBQSxFQUFFLE9BQU8sRUFBRSxNQUFNLFNBQU8sT0FBRztBQUFBO0FBQUUsU0FBUyxFQUFFLENBQUMsR0FBRSxHQUFFLEdBQUU7QUFBQSxFQUFDLElBQUksSUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLHNCQUFzQjtBQUFBLEVBQUUsSUFBRyxNQUFJO0FBQUEsSUFBSyxPQUFPO0FBQUEsRUFBRSxJQUFJLElBQUUsRUFBRTtBQUFBLEVBQUcsT0FBTyxFQUFFLE1BQU07QUFBQSxDQUN0aUwsRUFBRSxJQUFJLE9BQUc7QUFBQSxJQUFDLElBQUksSUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLGNBQWM7QUFBQSxJQUFFLElBQUcsTUFBSTtBQUFBLE1BQUssT0FBTztBQUFBLElBQUUsS0FBSSxLQUFHO0FBQUEsSUFBRSxPQUFPLEVBQUUsVUFBUSxFQUFFLFNBQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxJQUFFO0FBQUEsR0FBRSxFQUFFLEtBQUs7QUFBQSxDQUNuSTtBQUFBO0FBQUUsSUFBSSxJQUFFLE1BQUs7QUFBQSxFQUFDO0FBQUEsRUFBUTtBQUFBLEVBQU07QUFBQSxFQUFNLFdBQVcsQ0FBQyxHQUFFO0FBQUEsSUFBQyxLQUFLLFVBQVEsS0FBRztBQUFBO0FBQUEsRUFBRSxLQUFLLENBQUMsR0FBRTtBQUFBLElBQUMsSUFBSSxJQUFFLEtBQUssTUFBTSxNQUFNLFFBQVEsS0FBSyxDQUFDO0FBQUEsSUFBRSxJQUFHLEtBQUcsRUFBRSxHQUFHLFNBQU87QUFBQSxNQUFFLE9BQU0sRUFBQyxNQUFLLFNBQVEsS0FBSSxFQUFFLEdBQUU7QUFBQTtBQUFBLEVBQUUsSUFBSSxDQUFDLEdBQUU7QUFBQSxJQUFDLElBQUksSUFBRSxLQUFLLE1BQU0sTUFBTSxLQUFLLEtBQUssQ0FBQztBQUFBLElBQUUsSUFBRyxHQUFFO0FBQUEsTUFBQyxJQUFJLElBQUUsRUFBRSxHQUFHLFFBQVEsS0FBSyxNQUFNLE1BQU0sa0JBQWlCLEVBQUU7QUFBQSxNQUFFLE9BQU0sRUFBQyxNQUFLLFFBQU8sS0FBSSxFQUFFLElBQUcsZ0JBQWUsWUFBVyxNQUFLLEtBQUssUUFBUSxXQUFTLElBQUUsRUFBRSxHQUFFO0FBQUEsQ0FDdlcsRUFBQztBQUFBLElBQUM7QUFBQTtBQUFBLEVBQUUsTUFBTSxDQUFDLEdBQUU7QUFBQSxJQUFDLElBQUksSUFBRSxLQUFLLE1BQU0sTUFBTSxPQUFPLEtBQUssQ0FBQztBQUFBLElBQUUsSUFBRyxHQUFFO0FBQUEsTUFBQyxJQUFJLElBQUUsRUFBRSxJQUFHLElBQUUsR0FBRyxHQUFFLEVBQUUsTUFBSSxJQUFHLEtBQUssS0FBSztBQUFBLE1BQUUsT0FBTSxFQUFDLE1BQUssUUFBTyxLQUFJLEdBQUUsTUFBSyxFQUFFLEtBQUcsRUFBRSxHQUFHLEtBQUssRUFBRSxRQUFRLEtBQUssTUFBTSxPQUFPLGdCQUFlLElBQUksSUFBRSxFQUFFLElBQUcsTUFBSyxFQUFDO0FBQUEsSUFBQztBQUFBO0FBQUEsRUFBRSxPQUFPLENBQUMsR0FBRTtBQUFBLElBQUMsSUFBSSxJQUFFLEtBQUssTUFBTSxNQUFNLFFBQVEsS0FBSyxDQUFDO0FBQUEsSUFBRSxJQUFHLEdBQUU7QUFBQSxNQUFDLElBQUksSUFBRSxFQUFFLEdBQUcsS0FBSztBQUFBLE1BQUUsSUFBRyxLQUFLLE1BQU0sTUFBTSxXQUFXLEtBQUssQ0FBQyxHQUFFO0FBQUEsUUFBQyxJQUFJLElBQUUsRUFBRSxHQUFFLEdBQUc7QUFBQSxTQUFHLEtBQUssUUFBUSxZQUFVLENBQUMsS0FBRyxLQUFLLE1BQU0sTUFBTSxnQkFBZ0IsS0FBSyxDQUFDLE9BQUssSUFBRSxFQUFFLEtBQUs7QUFBQSxNQUFFO0FBQUEsTUFBQyxPQUFNLEVBQUMsTUFBSyxXQUFVLEtBQUksRUFBRSxJQUFHLE9BQU0sRUFBRSxHQUFHLFFBQU8sTUFBSyxHQUFFLFFBQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQyxFQUFDO0FBQUEsSUFBQztBQUFBO0FBQUEsRUFBRSxFQUFFLENBQUMsR0FBRTtBQUFBLElBQUMsSUFBSSxJQUFFLEtBQUssTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQUEsSUFBRSxJQUFHO0FBQUEsTUFBRSxPQUFNLEVBQUMsTUFBSyxNQUFLLEtBQUksRUFBRSxFQUFFLElBQUc7QUFBQSxDQUNqa0IsRUFBQztBQUFBO0FBQUEsRUFBRSxVQUFVLENBQUMsR0FBRTtBQUFBLElBQUMsSUFBSSxJQUFFLEtBQUssTUFBTSxNQUFNLFdBQVcsS0FBSyxDQUFDO0FBQUEsSUFBRSxJQUFHLEdBQUU7QUFBQSxNQUFDLElBQUksSUFBRSxFQUFFLEVBQUUsSUFBRztBQUFBLENBQzlFLEVBQUUsTUFBTTtBQUFBLENBQ1IsR0FBRSxJQUFFLElBQUcsSUFBRSxJQUFHLElBQUUsQ0FBQztBQUFBLE1BQUUsTUFBSyxFQUFFLFNBQU8sS0FBRztBQUFBLFFBQUMsSUFBSSxJQUFFLE9BQUcsSUFBRSxDQUFDLEdBQUU7QUFBQSxRQUFFLEtBQUksSUFBRSxFQUFFLElBQUUsRUFBRSxRQUFPO0FBQUEsVUFBSSxJQUFHLEtBQUssTUFBTSxNQUFNLGdCQUFnQixLQUFLLEVBQUUsRUFBRTtBQUFBLFlBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxHQUFFLElBQUU7QUFBQSxVQUFRLFNBQUcsQ0FBQztBQUFBLFlBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRTtBQUFBLFVBQU87QUFBQTtBQUFBLFFBQU0sSUFBRSxFQUFFLE1BQU0sQ0FBQztBQUFBLFFBQUUsSUFBSSxJQUFFLEVBQUUsS0FBSztBQUFBLENBQ3hNLEdBQUUsSUFBRSxFQUFFLFFBQVEsS0FBSyxNQUFNLE1BQU0seUJBQXdCO0FBQUEsT0FDakQsRUFBRSxRQUFRLEtBQUssTUFBTSxNQUFNLDBCQUF5QixFQUFFO0FBQUEsUUFBRSxJQUFFLElBQUUsR0FBRztBQUFBLEVBQ3BFLE1BQUksR0FBRSxJQUFFLElBQUUsR0FBRztBQUFBLEVBQ2IsTUFBSTtBQUFBLFFBQUUsSUFBSSxJQUFFLEtBQUssTUFBTSxNQUFNO0FBQUEsUUFBSSxJQUFHLEtBQUssTUFBTSxNQUFNLE1BQUksTUFBRyxLQUFLLE1BQU0sWUFBWSxHQUFFLEdBQUUsSUFBRSxHQUFFLEtBQUssTUFBTSxNQUFNLE1BQUksR0FBRSxFQUFFLFdBQVM7QUFBQSxVQUFFO0FBQUEsUUFBTSxJQUFJLElBQUUsRUFBRSxHQUFHLEVBQUU7QUFBQSxRQUFFLElBQUcsR0FBRyxTQUFPO0FBQUEsVUFBTztBQUFBLFFBQU0sSUFBRyxHQUFHLFNBQU8sY0FBYTtBQUFBLFVBQUMsSUFBSSxJQUFFLEdBQUUsSUFBRSxFQUFFLE1BQUk7QUFBQSxJQUN6TixFQUFFLEtBQUs7QUFBQSxDQUNSLEdBQUUsSUFBRSxLQUFLLFdBQVcsQ0FBQztBQUFBLFVBQUUsRUFBRSxFQUFFLFNBQU8sS0FBRyxHQUFFLElBQUUsRUFBRSxVQUFVLEdBQUUsRUFBRSxTQUFPLEVBQUUsSUFBSSxNQUFNLElBQUUsRUFBRSxLQUFJLElBQUUsRUFBRSxVQUFVLEdBQUUsRUFBRSxTQUFPLEVBQUUsS0FBSyxNQUFNLElBQUUsRUFBRTtBQUFBLFVBQUs7QUFBQSxRQUFLLEVBQU0sU0FBRyxHQUFHLFNBQU8sUUFBTztBQUFBLFVBQUMsSUFBSSxJQUFFLEdBQUUsSUFBRSxFQUFFLE1BQUk7QUFBQSxJQUNsTCxFQUFFLEtBQUs7QUFBQSxDQUNSLEdBQUUsSUFBRSxLQUFLLEtBQUssQ0FBQztBQUFBLFVBQUUsRUFBRSxFQUFFLFNBQU8sS0FBRyxHQUFFLElBQUUsRUFBRSxVQUFVLEdBQUUsRUFBRSxTQUFPLEVBQUUsSUFBSSxNQUFNLElBQUUsRUFBRSxLQUFJLElBQUUsRUFBRSxVQUFVLEdBQUUsRUFBRSxTQUFPLEVBQUUsSUFBSSxNQUFNLElBQUUsRUFBRSxLQUFJLElBQUUsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEVBQUUsSUFBSSxNQUFNLEVBQUUsTUFBTTtBQUFBLENBQ3BLO0FBQUEsVUFBRTtBQUFBLFFBQVE7QUFBQSxNQUFDO0FBQUEsTUFBQyxPQUFNLEVBQUMsTUFBSyxjQUFhLEtBQUksR0FBRSxRQUFPLEdBQUUsTUFBSyxFQUFDO0FB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QUFBQSxRQUFJLElBQUcsS0FBSyxNQUFNLE1BQU0sTUFBSSxPQUFHLEVBQUUsTUFBTSxHQUFHLFNBQU8sS0FBSyxNQUFNLFlBQVksRUFBRSxNQUFNLEdBQUcsTUFBSyxDQUFDLENBQUMsR0FBRSxDQUFDLEVBQUUsT0FBTTtBQUFBLFVBQUMsSUFBSSxJQUFFLEVBQUUsTUFBTSxHQUFHLE9BQU8sT0FBTyxPQUFHLEVBQUUsU0FBTyxPQUFPLEdBQUUsSUFBRSxFQUFFLFNBQU8sS0FBRyxFQUFFLEtBQUssT0FBRyxLQUFLLE1BQU0sTUFBTSxRQUFRLEtBQUssRUFBRSxHQUFHLENBQUM7QUFBQSxVQUFFLEVBQUUsUUFBTTtBQUFBLFFBQUM7QUFBQSxNQUFDLElBQUcsRUFBRTtBQUFBLFFBQU0sU0FBUSxJQUFFLEVBQUUsSUFBRSxFQUFFLE1BQU0sUUFBTztBQUFBLFVBQUksRUFBRSxNQUFNLEdBQUcsUUFBTTtBQUFBLE1BQUcsT0FBTztBQUFBLElBQUM7QUFBQTtBQUFBLEVBQUUsSUFBSSxDQUFDLEdBQUU7QUFBQSxJQUFDLElBQUksSUFBRSxLQUFLLE1BQU0sTUFBTSxLQUFLLEtBQUssQ0FBQztBQUFBLElBQUUsSUFBRztBQUFBLE1BQUUsT0FBTSxFQUFDLE1BQUssUUFBTyxPQUFNLE1BQUcsS0FBSSxFQUFFLElBQUcsS0FBSSxFQUFFLE9BQUssU0FBTyxFQUFFLE9BQUssWUFBVSxFQUFFLE9BQUssU0FBUSxNQUFLLEVBQUUsR0FBRTtBQUFBO0FBQUEsRUFBRSxHQUFHLENBQUMsR0FBRTtBQUFBLElBQUMsSUFBSSxJQUFFLEtBQUssTUFBTSxNQUFNLElBQUksS0FBSyxDQUFDO0FBQUEsSUFBRSxJQUFHLEdBQUU7QUFBQSxNQUFDLElBQUksSUFBRSxFQUFFLEdBQUcsWUFBWSxFQUFFLFFBQVEsS0FBSyxNQUFNLE1BQU0scUJBQW9CLEdBQUcsR0FBRSxJQUFFLEVBQUUsS0FBRyxFQUFFLEdBQUcsUUFBUSxLQUFLLE1BQU0sTUFBTSxjQUFhLElBQUksRUFBRSxRQUFRLEtBQUssTUFBTSxPQUFPLGdCQUFlLElBQUksSUFBRSxJQUFHLElBQUUsRUFBRSxLQUFHLEVBQUUsR0FBRyxVQUFVLEdBQUUsRUFBRSxHQUFHLFNBQU8sQ0FBQyxFQUFFLFFBQVEsS0FBSyxNQUFNLE9BQU8sZ0JBQWUsSUFBSSxJQUFFLEVBQUU7QUFBQSxNQUFHLE9BQU0sRUFBQyxNQUFLLE9BQU0sS0FBSSxHQUFFLEtBQUksRUFBRSxJQUFHLE1BQUssR0FBRSxPQUFNLEVBQUM7QUFBQSxJQUFDO0FBQUE7QUFBQSxFQUFFLEtBQUssQ0FBQyxHQUFFO0FBQUEsSUFBQyxJQUFJLElBQUUsS0FBSyxNQUFNLE1BQU0sTUFBTSxLQUFLLENBQUM7QUFBQSxJQUFFLElBQUcsQ0FBQyxLQUFHLENBQUMsS0FBSyxNQUFNLE1BQU0sZUFBZSxLQUFLLEVBQUUsRUFBRTtBQUFBLE1BQUU7QUFBQSxJQUFPLElBQUksSUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFFLElBQUUsRUFBRSxHQUFHLFFBQVEsS0FBSyxNQUFNLE1BQU0saUJBQWdCLEVBQUUsRUFBRSxNQUFNLEdBQUcsR0FBRSxJQUFFLEVBQUUsSUFBSSxLQUFLLElBQUUsRUFBRSxHQUFHLFFBQVEsS0FBSyxNQUFNLE1BQU0sbUJBQWtCLEVBQUUsRUFBRSxNQUFNO0FBQUEsQ0FDbGhELElBQUUsQ0FBQyxHQUFFLElBQUUsRUFBQyxNQUFLLFNBQVEsS0FBSSxFQUFFLElBQUcsUUFBTyxDQUFDLEdBQUUsT0FBTSxDQUFDLEdBQUUsTUFBSyxDQUFDLEVBQUM7QUFBQSxJQUFFLElBQUcsRUFBRSxXQUFTLEVBQUUsUUFBTztBQUFBLE1BQUMsU0FBUSxLQUFLO0FBQUEsUUFBRSxLQUFLLE1BQU0sTUFBTSxnQkFBZ0IsS0FBSyxDQUFDLElBQUUsRUFBRSxNQUFNLEtBQUssT0FBTyxJQUFFLEtBQUssTUFBTSxNQUFNLGlCQUFpQixLQUFLLENBQUMsSUFBRSxFQUFFLE1BQU0sS0FBSyxRQUFRLElBQUUsS0FBSyxNQUFNLE1BQU0sZUFBZSxLQUFLLENBQUMsSUFBRSxFQUFFLE1BQU0sS0FBSyxNQUFNLElBQUUsRUFBRSxNQUFNLEtBQUssSUFBSTtBQUFBLE1BQUUsU0FBUSxJQUFFLEVBQUUsSUFBRSxFQUFFLFFBQU87QUFBQSxRQUFJLEVBQUUsT0FBTyxLQUFLLEVBQUMsTUFBSyxFQUFFLElBQUcsUUFBTyxLQUFLLE1BQU0sT0FBTyxFQUFFLEVBQUUsR0FBRSxRQUFPLE1BQUcsT0FBTSxFQUFFLE1BQU0sR0FBRSxDQUFDO0FBQUEsTUFBRSxTQUFRLEtBQUs7QUFBQSxRQUFFLEVBQUUsS0FBSyxLQUFLLEVBQUUsR0FBRSxFQUFFLE9BQU8sTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFFLE9BQUssRUFBQyxNQUFLLEdBQUUsUUFBTyxLQUFLLE1BQU0sT0FBTyxDQUFDLEdBQUUsUUFBTyxPQUFHLE9BQU0sRUFBRSxNQUFNLEdBQUUsRUFBRSxDQUFDO0FBQUEsTUFBRSxPQUFPO0FBQUEsSUFBQztBQUFBO0FBQUEsRUFBRSxRQUFRLENBQUMsR0FBRTtBQUFBLElBQUMsSUFBSSxJQUFFLEtBQUssTUFBTSxNQUFNLFNBQVMsS0FBSyxDQUFDO0FBQUEsSUFBRSxJQUFHO0FBQUEsTUFBRSxPQUFNLEVBQUMsTUFBSyxXQUFVLEtBQUksRUFBRSxJQUFHLE9BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxNQUFJLE1BQUksSUFBRSxHQUFFLE1BQUssRUFBRSxJQUFHLFFBQU8sS0FBSyxNQUFNLE9BQU8sRUFBRSxFQUFFLEVBQUM7QUFBQTtBQUFBLEVBQUUsU0FBUyxDQUFDLEdBQUU7QUFBQSxJQUFDLElBQUksSUFBRSxLQUFLLE1BQU0sTUFBTSxVQUFVLEtBQUssQ0FBQztBQUFBLElBQUUsSUFBRyxHQUFFO0FBQUEsTUFBQyxJQUFJLElBQUUsRUFBRSxHQUFHLE9BQU8sRUFBRSxHQUFHLFNBQU8sQ0FBQyxNQUFJO0FBQUEsSUFDenlCLEVBQUUsR0FBRyxNQUFNLEdBQUUsRUFBRSxJQUFFLEVBQUU7QUFBQSxNQUFHLE9BQU0sRUFBQyxNQUFLLGFBQVksS0FBSSxFQUFFLElBQUcsTUFBSyxHQUFFLFFBQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQyxFQUFDO0FBQUEsSUFBQztBQUFBO0FBQUEsRUFBRSxJQUFJLENBQUMsR0FBRTtBQUFBLElBQUMsSUFBSSxJQUFFLEtBQUssTUFBTSxNQUFNLEtBQUssS0FBSyxDQUFDO0FBQUEsSUFBRSxJQUFHO0FBQUEsTUFBRSxPQUFNLEVBQUMsTUFBSyxRQUFPLEtBQUksRUFBRSxJQUFHLE1BQUssRUFBRSxJQUFHLFFBQU8sS0FBSyxNQUFNLE9BQU8sRUFBRSxFQUFFLEVBQUM7QUFBQTtBQUFBLEVBQUUsTUFBTSxDQUFDLEdBQUU7QUFBQSxJQUFDLElBQUksSUFBRSxLQUFLLE1BQU0sT0FBTyxPQUFPLEtBQUssQ0FBQztBQUFBLElBQUUsSUFBRztBQUFBLE1BQUUsT0FBTSxFQUFDLE1BQUssVUFBUyxLQUFJLEVBQUUsSUFBRyxNQUFLLEVBQUUsR0FBRTtBQUFBO0FBQUEsRUFBRSxHQUFHLENBQUMsR0FBRTtBQUFBLElBQUMsSUFBSSxJQUFFLEtBQUssTUFBTSxPQUFPLElBQUksS0FBSyxDQUFDO0FBQUEsSUFBRSxJQUFHO0FBQUEsTUFBRSxPQUFNLENBQUMsS0FBSyxNQUFNLE1BQU0sVUFBUSxLQUFLLE1BQU0sTUFBTSxVQUFVLEtBQUssRUFBRSxFQUFFLElBQUUsS0FBSyxNQUFNLE1BQU0sU0FBTyxPQUFHLEtBQUssTUFBTSxNQUFNLFVBQVEsS0FBSyxNQUFNLE1BQU0sUUFBUSxLQUFLLEVBQUUsRUFBRSxNQUFJLEtBQUssTUFBTSxNQUFNLFNBQU8sUUFBSSxDQUFDLEtBQUssTUFBTSxNQUFNLGNBQVksS0FBSyxNQUFNLE1BQU0sa0JBQWtCLEtBQUssRUFBRSxFQUFFLElBQUUsS0FBSyxNQUFNLE1BQU0sYUFBVyxPQUFHLEtBQUssTUFBTSxNQUFNLGNBQVksS0FBSyxNQUFNLE1BQU0sZ0JBQWdCLEtBQUssRUFBRSxFQUFFLE1BQUksS0FBSyxNQUFNLE1BQU0sYUFBVyxRQUFJLEVBQUMsTUFBSyxRQUFPLEtBQUksRUFBRSxJQUFHLFFBQU8sS0FBSyxNQUFNLE1BQU0sUUFBTyxZQUFXLEtBQUssTUFBTSxNQUFNLFlBQVcsT0FBTSxPQUFHLE1BQUssRUFBRSxHQUFFO0FBQUE7QUFBQSxFQUFFLElBQUksQ0FBQyxHQUFFO0FBQUEsSUFBQyxJQUFJLElBQUUsS0FBSyxNQUFNLE9BQU8sS0FBSyxLQUFLLENBQUM7QUFBQSxJQUFFLElBQUcsR0FBRTtBQUFBLE1BQUMsSUFBSSxJQUFFLEVBQUUsR0FBRyxLQUFLO0FBQUEsTUFBRSxJQUFHLENBQUMsS0FBSyxRQUFRLFlBQVUsS0FBSyxNQUFNLE1BQU0sa0JBQWtCLEtBQUssQ0FBQyxHQUFFO0FBQUEsUUFBQyxJQUFHLENBQUMsS0FBSyxNQUFNLE1BQU0sZ0JBQWdCLEtBQUssQ0FBQztBQUFBLFVBQUU7QUFBQSxRQUFPLElBQUksSUFBRSxFQUFFLEVBQUUsTUFBTSxHQUFFLEVBQUUsR0FBRSxJQUFJO0FBQUEsUUFBRSxLQUFJLEVBQUUsU0FBTyxFQUFFLFVBQVEsTUFBSTtBQUFBLFVBQUU7QUFBQSxNQUFNLEVBQUs7QUFBQSxRQUFDLElBQUksSUFBRSxHQUFHLEVBQUUsSUFBRyxJQUFJO0FBQUEsUUFBRSxJQUFHLE1BQUk7QUFBQSxVQUFHO0FBQUEsUUFBTyxJQUFHLElBQUUsSUFBRztBQUFBLFVBQUMsSUFBSSxLQUFHLEVBQUUsR0FBRyxRQUFRLEdBQUcsTUFBSSxJQUFFLElBQUUsS0FBRyxFQUFFLEdBQUcsU0FBTztBQUFBLFVBQUUsRUFBRSxLQUFHLEVBQUUsR0FBRyxVQUFVLEdBQUUsQ0FBQyxHQUFFLEVBQUUsS0FBRyxFQUFFLEdBQUcsVUFBVSxHQUFFLENBQUMsRUFBRSxLQUFLLEdBQUUsRUFBRSxLQUFHO0FBQUEsUUFBRTtBQUFBO0FBQUEsTUFBRSxJQUFJLElBQUUsRUFBRSxJQUFHLElBQUU7QUFBQSxNQUFHLElBQUcsS0FBSyxRQUFRLFVBQVM7QUFBQSxRQUFDLElBQUksSUFBRSxLQUFLLE1BQU0sTUFBTSxrQkFBa0IsS0FBSyxDQUFDO0FBQUEsUUFBRSxNQUFJLElBQUUsRUFBRSxJQUFHLElBQUUsRUFBRTtBQUFBLE1BQUcsRUFBTTtBQUFBLFlBQUUsRUFBRSxLQUFHLEVBQUUsR0FBRyxNQUFNLEdBQUUsRUFBRSxJQUFFO0FBQUEsTUFBRyxPQUFPLElBQUUsRUFBRSxLQUFLLEdBQUUsS0FBSyxNQUFNLE1BQU0sa0JBQWtCLEtBQUssQ0FBQyxNQUFJLEtBQUssUUFBUSxZQUFVLENBQUMsS0FBSyxNQUFNLE1BQU0sZ0JBQWdCLEtBQUssQ0FBQyxJQUFFLElBQUUsRUFBRSxNQUFNLENBQUMsSUFBRSxJQUFFLEVBQUUsTUFBTSxHQUFFLEVBQUUsSUFBRyxHQUFHLEdBQUUsRUFBQyxNQUFLLEtBQUcsRUFBRSxRQUFRLEtBQUssTUFBTSxPQUFPLGdCQUFlLElBQUksR0FBRSxPQUFNLEtBQUcsRUFBRSxRQUFRLEtBQUssTUFBTSxPQUFPLGdCQUFlLElBQUksRUFBQyxHQUFFLEVBQUUsSUFBRyxLQUFLLE9BQU0sS0FBSyxLQUFLO0FBQUEsSUFBQztBQUFBO0FBQUEsRUFBRSxPQUFPLENBQUMsR0FBRSxHQUFFO0FBQUEsSUFBQyxJQUFJO0FBQUEsSUFBRSxLQUFJLElBQUUsS0FBSyxNQUFNLE9BQU8sUUFBUSxLQUFLLENBQUMsT0FBSyxJQUFFLEtBQUssTUFBTSxPQUFPLE9BQU8sS0FBSyxDQUFDLElBQUc7QUFBQSxNQUFDLElBQUksS0FBRyxFQUFFLE1BQUksRUFBRSxJQUFJLFFBQVEsS0FBSyxNQUFNLE1BQU0scUJBQW9CLEdBQUcsR0FBRSxJQUFFLEVBQUUsRUFBRSxZQUFZO0FBQUEsTUFBRyxJQUFHLENBQUMsR0FBRTtBQUFBLFFBQUMsSUFBSSxJQUFFLEVBQUUsR0FBRyxPQUFPLENBQUM7QUFBQSxRQUFFLE9BQU0sRUFBQyxNQUFLLFFBQU8sS0FBSSxHQUFFLE1BQUssRUFBQztBQUFBLE1BQUM7QUFBQSxNQUFDLE9BQU8sR0FBRyxHQUFFLEdBQUUsRUFBRSxJQUFHLEtBQUssT0FBTSxLQUFLLEtBQUs7QUFBQSxJQUFDO0FBQUE7QUFBQSxFQUFFLFFBQVEsQ0FBQyxHQUFFLEdBQUUsSUFBRSxJQUFHO0FBQUEsSUFBQyxJQUFJLElBQUUsS0FBSyxNQUFNLE9BQU8sZUFBZSxLQUFLLENBQUM7QUFBQSxJQUFFLElBQUcsQ0FBQyxLQUFHLEVBQUUsTUFBSSxFQUFFLE1BQU0sS0FBSyxNQUFNLE1BQU0sbUJBQW1CO0FBQUEsTUFBRTtBQUFBLElBQU8sSUFBRyxFQUFFLEVBQUUsTUFBSSxFQUFFLE1BQUksT0FBSyxDQUFDLEtBQUcsS0FBSyxNQUFNLE9BQU8sWUFBWSxLQUFLLENBQUMsR0FBRTtBQUFBLE1BQUMsSUFBSSxJQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxTQUFPLEdBQUUsR0FBRSxHQUFFLElBQUUsR0FBRSxJQUFFLEdBQUUsSUFBRSxFQUFFLEdBQUcsT0FBSyxNQUFJLEtBQUssTUFBTSxPQUFPLG9CQUFrQixLQUFLLE1BQU0sT0FBTztBQUFBLE1BQWtCLEtBQUksRUFBRSxZQUFVLEdBQUUsSUFBRSxFQUFFLE1BQU0sS0FBRyxFQUFFLFNBQU8sQ0FBQyxHQUFHLElBQUUsRUFBRSxLQUFLLENBQUMsTUFBSSxRQUFNO0FBQUEsUUFBQyxJQUFHLElBQUUsRUFBRSxNQUFJLEVBQUUsTUFBSSxFQUFFLE1BQUksRUFBRSxNQUFJLEVBQUUsTUFBSSxFQUFFLElBQUcsQ0FBQztBQUFBLFVBQUU7QUFBQSxRQUFTLElBQUcsSUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFFBQU8sRUFBRSxNQUFJLEVBQUUsSUFBRztBQUFBLFVBQUMsS0FBRztBQUFBLFVBQUU7QUFBQSxRQUFRLEVBQU0sVUFBSSxFQUFFLE1BQUksRUFBRSxPQUFLLElBQUUsS0FBRyxHQUFHLElBQUUsS0FBRyxJQUFHO0FBQUEsVUFBQyxLQUFHO0FBQUEsVUFBRTtBQUFBLFFBQVE7QUFBQSxRQUFDLElBQUcsS0FBRyxHQUFFLElBQUU7QUFBQSxVQUFFO0FBQUEsUUFBUyxJQUFFLEtBQUssSUFBSSxHQUFFLElBQUUsSUFBRSxDQUFDO0FBQUEsUUFBRSxJQUFJLElBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsUUFBTyxJQUFFLEVBQUUsTUFBTSxHQUFFLElBQUUsRUFBRSxRQUFNLElBQUUsQ0FBQztBQUFBLFFBQUUsSUFBRyxLQUFLLElBQUksR0FBRSxDQUFDLElBQUUsR0FBRTtBQUFBLFVBQUMsSUFBSSxJQUFFLEVBQUUsTUFBTSxHQUFFLEVBQUU7QUFBQSxVQUFFLE9BQU0sRUFBQyxNQUFLLE1BQUssS0FBSSxHQUFFLE1BQUssR0FBRSxRQUFPLEtBQUssTUFBTSxhQUFhLENBQUMsRUFBQztBQUFBLFFBQUM7QUFBQSxRQUFDLElBQUksSUFBRSxFQUFFLE1BQU0sR0FBRSxFQUFFO0FBQUEsUUFBRSxPQUFNLEVBQUMsTUFBSyxVQUFTLEtBQUksR0FBRSxNQUFLLEdBQUUsUUFBTyxLQUFLLE1BQU0sYUFBYSxDQUFDLEVBQUM7QUFBQSxNQUFDO0FBQUEsSUFBQztBQUFBO0FBQUEsRUFBRSxRQUFRLENBQUMsR0FBRTtBQUFBLElBQUMsSUFBSSxJQUFFLEtBQUssTUFBTSxPQUFPLEtBQUssS0FBSyxDQUFDO0FBQUEsSUFBRSxJQUFHLEdBQUU7QUFBQSxNQUFDLElBQUksSUFBRSxFQUFFLEdBQUcsUUFBUSxLQUFLLE1BQU0sTUFBTSxtQkFBa0IsR0FBRyxHQUFFLElBQUUsS0FBSyxNQUFNLE1BQU0sYUFBYSxLQUFLLENBQUMsR0FBRSxJQUFFLEtBQUssTUFBTSxNQUFNLGtCQUFrQixLQUFLLENBQUMsS0FBRyxLQUFLLE1BQU0sTUFBTSxnQkFBZ0IsS0FBSyxDQUFDO0FBQUEsTUFBRSxPQUFPLEtBQUcsTUFBSSxJQUFFLEVBQUUsVUFBVSxHQUFFLEVBQUUsU0FBTyxDQUFDLElBQUcsRUFBQyxNQUFLLFlBQVcsS0FBSSxFQUFFLElBQUcsTUFBSyxFQUFDO0FBQUEsSUFBQztBQUFBO0FBQUEsRUFBRSxFQUFFLENBQUMsR0FBRTtBQUFBLElBQUMsSUFBSSxJQUFFLEtBQUssTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQUEsSUFBRSxJQUFHO0FBQUEsTUFBRSxPQUFNLEVBQUMsTUFBSyxNQUFLLEtBQUksRUFBRSxHQUFFO0FBQUE7QUFBQSxFQUFFLEdBQUcsQ0FBQyxHQUFFO0FBQUEsSUFBQyxJQUFJLElBQUUsS0FBSyxNQUFNLE9BQU8sSUFBSSxLQUFLLENBQUM7QUFBQSxJQUFFLElBQUc7QUFBQSxNQUFFLE9BQU0sRUFBQyxNQUFLLE9BQU0sS0FBSSxFQUFFLElBQUcsTUFBSyxFQUFFLElBQUcsUUFBTyxLQUFLLE1BQU0sYUFBYSxFQUFFLEVBQUUsRUFBQztBQUFBO0FBQUEsRUFBRSxRQUFRLENBQUMsR0FBRTtBQUFBLElBQUMsSUFBSSxJQUFFLEtBQUssTUFBTSxPQUFPLFNBQVMsS0FBSyxDQUFDO0FBQUEsSUFBRSxJQUFHLEdBQUU7QUFBQSxNQUFDLElBQUksR0FBRTtBQUFBLE1BQUUsT0FBTyxFQUFFLE9BQUssT0FBSyxJQUFFLEVBQUUsSUFBRyxJQUFFLFlBQVUsTUFBSSxJQUFFLEVBQUUsSUFBRyxJQUFFLElBQUcsRUFBQyxNQUFLLFFBQU8sS0FBSSxFQUFFLElBQUcsTUFBSyxHQUFFLE1BQUssR0FBRSxRQUFPLENBQUMsRUFBQyxNQUFLLFFBQU8sS0FBSSxHQUFFLE1BQUssRUFBQyxDQUFDLEVBQUM7QUFBQSxJQUFDO0FBQUE7QUFBQSxFQUFFLEdBQUcsQ0FBQyxHQUFFO0FBQUEsSUFBQyxJQUFJO0FBQUEsSUFBRSxJQUFHLElBQUUsS0FBSyxNQUFNLE9BQU8sSUFBSSxLQUFLLENBQUMsR0FBRTtBQUFBLE1BQUMsSUFBSSxHQUFFO0FBQUEsTUFBRSxJQUFHLEVBQUUsT0FBSztBQUFBLFFBQUksSUFBRSxFQUFFLElBQUcsSUFBRSxZQUFVO0FBQUEsTUFBTTtBQUFBLFFBQUMsSUFBSTtBQUFBLFFBQUU7QUFBQSxVQUFHLElBQUUsRUFBRSxJQUFHLEVBQUUsS0FBRyxLQUFLLE1BQU0sT0FBTyxXQUFXLEtBQUssRUFBRSxFQUFFLElBQUksTUFBSTtBQUFBLGVBQVMsTUFBSSxFQUFFO0FBQUEsUUFBSSxJQUFFLEVBQUUsSUFBRyxFQUFFLE9BQUssU0FBTyxJQUFFLFlBQVUsRUFBRSxLQUFHLElBQUUsRUFBRTtBQUFBO0FBQUEsTUFBRyxPQUFNLEVBQUMsTUFBSyxRQUFPLEtBQUksRUFBRSxJQUFHLE1BQUssR0FBRSxNQUFLLEdBQUUsUUFBTyxDQUFDLEVBQUMsTUFBSyxRQUFPLEtBQUksR0FBRSxNQUFLLEVBQUMsQ0FBQyxFQUFDO0FBQUEsSUFBQztBQUFBO0FBQUEsRUFBRSxVQUFVLENBQUMsR0FBRTtBQUFBLElBQUMsSUFBSSxJQUFFLEtBQUssTUFBTSxPQUFPLEtBQUssS0FBSyxDQUFDO0FBQUEsSUFBRSxJQUFHLEdBQUU7QUFBQSxNQUFDLElBQUksSUFBRSxLQUFLLE1BQU0sTUFBTTtBQUFBLE1BQVcsT0FBTSxFQUFDLE1BQUssUUFBTyxLQUFJLEVBQUUsSUFBRyxNQUFLLEVBQUUsSUFBRyxTQUFRLEVBQUM7QUFBQSxJQUFDO0FBQUE7QUFBRTtBQUFFLElBQUksSUFBRSxNQUFNLEVBQUM7QUFBQSxFQUFDO0FBQUEsRUFBTztBQUFBLEVBQVE7QUFBQSxFQUFNO0FBQUEsRUFBVTtBQUFBLEVBQVksV0FBVyxDQUFDLEdBQUU7QUFBQSxJQUFDLEtBQUssU0FBTyxDQUFDLEdBQUUsS0FBSyxPQUFPLFFBQU0sT0FBTyxPQUFPLElBQUksR0FBRSxLQUFLLFVBQVEsS0FBRyxHQUFFLEtBQUssUUFBUSxZQUFVLEtBQUssUUFBUSxhQUFXLElBQUksR0FBRSxLQUFLLFlBQVUsS0FBSyxRQUFRLFdBQVUsS0FBSyxVQUFVLFVBQVEsS0FBSyxTQUFRLEtBQUssVUFBVSxRQUFNLE1BQUssS0FBSyxjQUFZLENBQUMsR0FBRSxLQUFLLFFBQU0sRUFBQyxRQUFPLE9BQUcsWUFBVyxPQUFHLEtBQUksS0FBRTtBQUFBLElBQUUsSUFBSSxJQUFFLEVBQUMsT0FBTSxHQUFFLE9BQU0sRUFBRSxRQUFPLFFBQU8sRUFBRSxPQUFNO0FBQUEsSUFBRSxLQUFLLFFBQVEsWUFBVSxFQUFFLFFBQU0sRUFBRSxVQUFTLEVBQUUsU0FBTyxFQUFFLFlBQVUsS0FBSyxRQUFRLFFBQU0sRUFBRSxRQUFNLEVBQUUsS0FBSSxLQUFLLFFBQVEsU0FBTyxFQUFFLFNBQU8sRUFBRSxTQUFPLEVBQUUsU0FBTyxFQUFFLE1BQUssS0FBSyxVQUFVLFFBQU07QUFBQTtBQUFBLGFBQWEsS0FBSyxHQUFFO0FBQUEsSUFBQyxPQUFNLEVBQUMsT0FBTSxHQUFFLFFBQU8sRUFBQztBQUFBO0FBQUEsU0FBUyxHQUFHLENBQUMsR0FBRSxHQUFFO0FBQUEsSUFBQyxPQUFPLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUE7QUFBQSxTQUFTLFNBQVMsQ0FBQyxHQUFFLEdBQUU7QUFBQSxJQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsRUFBRSxhQUFhLENBQUM7QUFBQTtBQUFBLEVBQUUsR0FBRyxDQUFDLEdBQUU7QUFBQSxJQUFDLElBQUUsRUFBRSxRQUFRLEVBQUUsZ0JBQWU7QUFBQSxDQUN2cUosR0FBRSxLQUFLLFlBQVksR0FBRSxLQUFLLE1BQU07QUFBQSxJQUFFLFNBQVEsSUFBRSxFQUFFLElBQUUsS0FBSyxZQUFZLFFBQU8sS0FBSTtBQUFBLE1BQUMsSUFBSSxJQUFFLEtBQUssWUFBWTtBQUFBLE1BQUcsS0FBSyxhQUFhLEVBQUUsS0FBSSxFQUFFLE1BQU07QUFBQSxJQUFDO0FBQUEsSUFBQyxPQUFPLEtBQUssY0FBWSxDQUFDLEdBQUUsS0FBSztBQUFBO0FBQUEsRUFBTyxXQUFXLENBQUMsR0FBRSxJQUFFLENBQUMsR0FBRSxJQUFFLE9BQUc7QUFBQSxJQUFDLEtBQUksS0FBSyxRQUFRLGFBQVcsSUFBRSxFQUFFLFFBQVEsRUFBRSxlQUFjLE1BQU0sRUFBRSxRQUFRLEVBQUUsV0FBVSxFQUFFLEdBQUcsS0FBRztBQUFBLE1BQUMsSUFBSTtBQUFBLE1BQUUsSUFBRyxLQUFLLFFBQVEsWUFBWSxPQUFPLEtBQUssUUFBSSxJQUFFLEVBQUUsS0FBSyxFQUFDLE9BQU0sS0FBSSxHQUFFLEdBQUUsQ0FBQyxNQUFJLElBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxNQUFNLEdBQUUsRUFBRSxLQUFLLENBQUMsR0FBRSxRQUFJLEtBQUU7QUFBQSxRQUFFO0FBQUEsTUFBUyxJQUFHLElBQUUsS0FBSyxVQUFVLE1BQU0sQ0FBQyxHQUFFO0FBQUEsUUFBQyxJQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksTUFBTTtBQUFBLFFBQUUsSUFBSSxJQUFFLEVBQUUsR0FBRyxFQUFFO0FBQUEsUUFBRSxFQUFFLElBQUksV0FBUyxLQUFHLE1BQVMsWUFBRSxFQUFFLE9BQUs7QUFBQSxJQUN4aEIsRUFBRSxLQUFLLENBQUM7QUFBQSxRQUFFO0FBQUEsTUFBUTtBQUFBLE1BQUMsSUFBRyxJQUFFLEtBQUssVUFBVSxLQUFLLENBQUMsR0FBRTtBQUFBLFFBQUMsSUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLE1BQU07QUFBQSxRQUFFLElBQUksSUFBRSxFQUFFLEdBQUcsRUFBRTtBQUFBLFFBQUUsR0FBRyxTQUFPLGVBQWEsR0FBRyxTQUFPLFVBQVEsRUFBRSxRQUFNLEVBQUUsSUFBSSxTQUFTO0FBQUEsQ0FDNUosSUFBRSxLQUFHO0FBQUEsS0FDSCxFQUFFLEtBQUksRUFBRSxRQUFNO0FBQUEsSUFDZixFQUFFLE1BQUssS0FBSyxZQUFZLEdBQUcsRUFBRSxFQUFFLE1BQUksRUFBRSxRQUFNLEVBQUUsS0FBSyxDQUFDO0FBQUEsUUFBRTtBQUFBLE1BQVE7QUFBQSxNQUFDLElBQUcsSUFBRSxLQUFLLFVBQVUsT0FBTyxDQUFDLEdBQUU7QUFBQSxRQUFDLElBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxNQUFNLEdBQUUsRUFBRSxLQUFLLENBQUM7QUFBQSxRQUFFO0FBQUEsTUFBUTtBQUFBLE1BQUMsSUFBRyxJQUFFLEtBQUssVUFBVSxRQUFRLENBQUMsR0FBRTtBQUFBLFFBQUMsSUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLE1BQU0sR0FBRSxFQUFFLEtBQUssQ0FBQztBQUFBLFFBQUU7QUFBQSxNQUFRO0FBQUEsTUFBQyxJQUFHLElBQUUsS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUFFO0FBQUEsUUFBQyxJQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksTUFBTSxHQUFFLEVBQUUsS0FBSyxDQUFDO0FBQUEsUUFBRTtBQUFBLE1BQVE7QUFBQSxNQUFDLElBQUcsSUFBRSxLQUFLLFVBQVUsV0FBVyxDQUFDLEdBQUU7QUFBQSxRQUFDLElBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxNQUFNLEdBQUUsRUFBRSxLQUFLLENBQUM7QUFBQSxRQUFFO0FBQUEsTUFBUTtBQUFBLE1BQUMsSUFBRyxJQUFFLEtBQUssVUFBVSxLQUFLLENBQUMsR0FBRTtBQUFBLFFBQUMsSUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLE1BQU0sR0FBRSxFQUFFLEtBQUssQ0FBQztBQUFBLFFBQUU7QUFBQSxNQUFRO0FBQUEsTUFBQyxJQUFHLElBQUUsS0FBSyxVQUFVLEtBQUssQ0FBQyxHQUFFO0FBQUEsUUFBQyxJQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksTUFBTSxHQUFFLEVBQUUsS0FBSyxDQUFDO0FBQUEsUUFBRTtBQUFBLE1BQVE7QUFBQSxNQUFDLElBQUcsSUFBRSxLQUFLLFVBQVUsSUFBSSxDQUFDLEdBQUU7QUFBQSxRQUFDLElBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxNQUFNO0FBQUEsUUFBRSxJQUFJLElBQUUsRUFBRSxHQUFHLEVBQUU7QUFBQSxRQUFFLEdBQUcsU0FBTyxlQUFhLEdBQUcsU0FBTyxVQUFRLEVBQUUsUUFBTSxFQUFFLElBQUksU0FBUztBQUFBLENBQ3ZwQixJQUFFLEtBQUc7QUFBQSxLQUNILEVBQUUsS0FBSSxFQUFFLFFBQU07QUFBQSxJQUNmLEVBQUUsS0FBSSxLQUFLLFlBQVksR0FBRyxFQUFFLEVBQUUsTUFBSSxFQUFFLFFBQU0sS0FBSyxPQUFPLE1BQU0sRUFBRSxTQUFPLEtBQUssT0FBTyxNQUFNLEVBQUUsT0FBSyxFQUFDLE1BQUssRUFBRSxNQUFLLE9BQU0sRUFBRSxNQUFLLEdBQUUsRUFBRSxLQUFLLENBQUM7QUFBQSxRQUFHO0FBQUEsTUFBUTtBQUFBLE1BQUMsSUFBRyxJQUFFLEtBQUssVUFBVSxNQUFNLENBQUMsR0FBRTtBQUFBLFFBQUMsSUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLE1BQU0sR0FBRSxFQUFFLEtBQUssQ0FBQztBQUFBLFFBQUU7QUFBQSxNQUFRO0FBQUEsTUFBQyxJQUFHLElB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QUFJLElBQUUsRUFBRSxNQUFNLEdBQUUsRUFBRSxLQUFLLElBQUUsTUFBSSxJQUFJLE9BQU8sRUFBRSxHQUFHLFNBQU8sQ0FBQyxJQUFFLE1BQUksRUFBRSxNQUFNLEtBQUssVUFBVSxNQUFNLE9BQU8sY0FBYyxTQUFTO0FBQUEsSUFBRTtBQUFBLElBQUMsT0FBTSxJQUFFLEtBQUssVUFBVSxNQUFNLE9BQU8sZUFBZSxLQUFLLENBQUMsTUFBSTtBQUFBLE1BQU0sSUFBRSxFQUFFLE1BQU0sR0FBRSxFQUFFLEtBQUssSUFBRSxPQUFLLEVBQUUsTUFBTSxLQUFLLFVBQVUsTUFBTSxPQUFPLGVBQWUsU0FBUztBQUFBLElBQUUsSUFBSTtBQUFBLElBQUUsT0FBTSxJQUFFLEtBQUssVUFBVSxNQUFNLE9BQU8sVUFBVSxLQUFLLENBQUMsTUFBSTtBQUFBLE1BQU0sSUFBRSxFQUFFLEtBQUcsRUFBRSxHQUFHLFNBQU8sR0FBRSxJQUFFLEVBQUUsTUFBTSxHQUFFLEVBQUUsUUFBTSxDQUFDLElBQUUsTUFBSSxJQUFJLE9BQU8sRUFBRSxHQUFHLFNBQU8sSUFBRSxDQUFDLElBQUUsTUFBSSxFQUFFLE1BQU0sS0FBSyxVQUFVLE1BQU0sT0FBTyxVQUFVLFNBQVM7QUFBQSxJQUFFLElBQUUsS0FBSyxRQUFRLE9BQU8sY0FBYyxLQUFLLEVBQUMsT0FBTSxLQUFJLEdBQUUsQ0FBQyxLQUFHO0FBQUEsSUFBRSxJQUFJLElBQUUsT0FBRyxJQUFFO0FBQUEsSUFBRyxNQUFLLEtBQUc7QUFBQSxNQUFDLE1BQUksSUFBRSxLQUFJLElBQUU7QUFBQSxNQUFHLElBQUk7QUFBQSxNQUFFLElBQUcsS0FBSyxRQUFRLFlBQVksUUFBUSxLQUFLLFFBQUksSUFBRSxFQUFFLEtBQUssRUFBQyxPQUFNLEtBQUksR0FBRSxHQUFFLENBQUMsTUFBSSxJQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksTUFBTSxHQUFFLEVBQUUsS0FBSyxDQUFDLEdBQUUsUUFBSSxLQUFFO0FBQUEsUUFBRTtBQUFBLE1BQVMsSUFBRyxJQUFFLEtBQUssVUFBVSxPQUFPLENBQUMsR0FBRTtBQUFBLFFBQUMsSUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLE1BQU0sR0FBRSxFQUFFLEtBQUssQ0FBQztBQUFBLFFBQUU7QUFBQSxNQUFRO0FBQUEsTUFBQyxJQUFHLElBQUUsS0FBSyxVQUFVLElBQUksQ0FBQyxHQUFFO0FBQUEsUUFBQyxJQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksTUFBTSxHQUFFLEVBQUUsS0FBSyxDQUFDO0FBQUEsUUFBRTtBQUFBLE1BQVE7QUFBQSxNQUFDLElBQUcsSUFBRSxLQUFLLFVBQVUsS0FBSyxDQUFDLEdBQUU7QUFBQSxRQUFDLElBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxNQUFNLEdBQUUsRUFBRSxLQUFLLENBQUM7QUFBQSxRQUFFO0FBQUEsTUFBUTtBQUFBLE1BQUMsSUFBRyxJQUFFLEtBQUssVUFBVSxRQUFRLEdBQUUsS0FBSyxPQUFPLEtBQUssR0FBRTtBQUFBLFFBQUMsSUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLE1BQU07QUFBQSxRQUFFLElBQUksSUFBRSxFQUFFLEdBQUcsRUFBRTtBQUFBLFFBQUUsRUFBRSxTQUFPLFVBQVEsR0FBRyxTQUFPLFVBQVEsRUFBRSxPQUFLLEVBQUUsS0FBSSxFQUFFLFFBQU0sRUFBRSxRQUFNLEVBQUUsS0FBSyxDQUFDO0FBQUEsUUFBRTtBQUFBLE1BQVE7QUFBQSxNQUFDLElBQUcsSUFBRSxLQUFLLFVBQVUsU0FBUyxHQUFFLEdBQUUsQ0FBQyxHQUFFO0FBQUEsUUFBQyxJQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksTUFBTSxHQUFFLEVBQUUsS0FBSyxDQUFDO0FBQUEsUUFBRTtBQUFBLE1BQVE7QUFBQSxNQUFDLElBQUcsSUFBRSxLQUFLLFVBQVUsU0FBUyxDQUFDLEdBQUU7QUFBQSxRQUFDLElBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxNQUFNLEdBQUUsRUFBRSxLQUFLLENBQUM7QUFBQSxRQUFFO0FBQUEsTUFBUTtBQUFBLE1BQUMsSUFBRyxJQUFFLEtBQUssVUFBVSxHQUFHLENBQUMsR0FBRTtBQUFBLFFBQUMsSUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLE1BQU0sR0FBRSxFQUFFLEtBQUssQ0FBQztBQUFBLFFBQUU7QUFBQSxNQUFRO0FBQUEsTUFBQyxJQUFHLElBQUUsS0FBSyxVQUFVLElBQUksQ0FBQyxHQUFFO0FBQUEsUUFBQyxJQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksTUFBTSxHQUFFLEVBQUUsS0FBSyxDQUFDO0FBQUEsUUFBRTtBQUFBLE1BQVE7QUFBQSxNQUFDLElBQUcsSUFBRSxLQUFLLFVBQVUsU0FBUyxDQUFDLEdBQUU7QUFBQSxRQUFDLElBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxNQUFNLEdBQUUsRUFBRSxLQUFLLENBQUM7QUFBQSxRQUFFO0FBQUEsTUFBUTtBQUFBLE1BQUMsSUFBRyxDQUFDLEtBQUssTUFBTSxXQUFTLElBQUUsS0FBSyxVQUFVLElBQUksQ0FBQyxJQUFHO0FBQUEsUUFBQyxJQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksTUFBTSxHQUFFLEVBQUUsS0FBSyxDQUFDO0FBQUEsUUFBRTtBQUFBLE1BQVE7QUFBQSxNQUFDLElBQUksSUFBRTtBQUFBLE1BQUUsSUFBRyxLQUFLLFFBQVEsWUFBWSxhQUFZO0FBQUEsUUFBQyxJQUFJLElBQUUsSUFBRSxHQUFFLElBQUUsRUFBRSxNQUFNLENBQUMsR0FBRTtBQUFBLFFBQUUsS0FBSyxRQUFRLFdBQVcsWUFBWSxRQUFRLE9BQUc7QUFBQSxVQUFDLElBQUUsRUFBRSxLQUFLLEVBQUMsT0FBTSxLQUFJLEdBQUUsQ0FBQyxHQUFFLE9BQU8sS0FBRyxZQUFVLEtBQUcsTUFBSSxJQUFFLEtBQUssSUFBSSxHQUFFLENBQUM7QUFBQSxTQUFHLEdBQUUsSUFBRSxJQUFFLEtBQUcsS0FBRyxNQUFJLElBQUUsRUFBRSxVQUFVLEdBQUUsSUFBRSxDQUFDO0FBQUEsTUFBRTtBQUFBLE1BQUMsSUFBRyxJQUFFLEtBQUssVUFBVSxXQUFXLENBQUMsR0FBRTtBQUFBLFFBQUMsSUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLE1BQU0sR0FBRSxF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QUFPLFdBQVMsRUFBRSxPQUFPLEdBQUcsT0FBTyxHQUFHLE9BQUssSUFBRSxNQUFJLEVBQUUsRUFBRSxPQUFPLEdBQUcsT0FBTyxHQUFHLElBQUksR0FBRSxFQUFFLE9BQU8sR0FBRyxPQUFPLEdBQUcsVUFBUSxTQUFLLEVBQUUsT0FBTyxRQUFRLEVBQUMsTUFBSyxRQUFPLEtBQUksSUFBRSxLQUFJLE1BQUssSUFBRSxLQUFJLFNBQVEsS0FBRSxDQUFDLElBQUUsS0FBRyxJQUFFO0FBQUEsSUFBRztBQUFBLElBQUMsT0FBTyxLQUFHLEtBQUssT0FBTyxNQUFNLEVBQUUsUUFBTyxDQUFDLENBQUMsRUFBRSxLQUFLLEdBQUUsT0FBTztBQUFBO0FBQUE7QUFBQSxFQUNyZCxRQUFRLEdBQUUsU0FBUSxLQUFHO0FBQUEsSUFBQyxPQUFNLGFBQVcsSUFBRSxnQkFBYyxNQUFJO0FBQUE7QUFBQSxFQUErQixTQUFTLEdBQUUsUUFBTyxLQUFHO0FBQUEsSUFBQyxPQUFNLE1BQU0sS0FBSyxPQUFPLFlBQVksQ0FBQztBQUFBO0FBQUE7QUFBQSxFQUNySixLQUFLLENBQUMsR0FBRTtBQUFBLElBQUMsSUFBSSxJQUFFLElBQUcsSUFBRTtBQUFBLElBQUcsU0FBUSxJQUFFLEVBQUUsSUFBRSxFQUFFLE9BQU8sUUFBTztBQUFBLE1BQUksS0FBRyxLQUFLLFVBQVUsRUFBRSxPQUFPLEVBQUU7QUFBQSxJQUFFLEtBQUcsS0FBSyxTQUFTLEVBQUMsTUFBSyxFQUFDLENBQUM7QUFBQSxJQUFFLElBQUksSUFBRTtBQUFBLElBQUcsU0FBUSxJQUFFLEVBQUUsSUFBRSxFQUFFLEtBQUssUUFBTyxLQUFJO0FBQUEsTUFBQyxJQUFJLElBQUUsRUFBRSxLQUFLO0FBQUEsTUFBRyxJQUFFO0FBQUEsTUFBRyxTQUFRLElBQUUsRUFBRSxJQUFFLEVBQUUsUUFBTztBQUFBLFFBQUksS0FBRyxLQUFLLFVBQVUsRUFBRSxFQUFFO0FBQUEsTUFBRSxLQUFHLEtBQUssU0FBUyxFQUFDLE1BQUssRUFBQyxDQUFDO0FBQUEsSUFBQztBQUFBLElBQUMsT0FBTyxNQUFJLElBQUUsVUFBVSxjQUFhO0FBQUE7QUFBQSxJQUVwUyxJQUFFO0FBQUEsSUFDRixJQUFFO0FBQUE7QUFBQTtBQUFBLEVBQ0YsUUFBUSxHQUFFLE1BQUssS0FBRztBQUFBLElBQUMsT0FBTTtBQUFBLEVBQ3pCO0FBQUE7QUFBQTtBQUFBLEVBQ0EsU0FBUyxDQUFDLEdBQUU7QUFBQSxJQUFDLElBQUksSUFBRSxLQUFLLE9BQU8sWUFBWSxFQUFFLE1BQU0sR0FBRSxJQUFFLEVBQUUsU0FBTyxPQUFLO0FBQUEsSUFBSyxRQUFPLEVBQUUsUUFBTSxJQUFJLFlBQVksRUFBRSxZQUFVLElBQUksUUFBTSxJQUFFLEtBQUs7QUFBQTtBQUFBO0FBQUEsRUFDdEksTUFBTSxHQUFFLFFBQU8sS0FBRztBQUFBLElBQUMsT0FBTSxXQUFXLEtBQUssT0FBTyxZQUFZLENBQUM7QUFBQTtBQUFBLEVBQWEsRUFBRSxHQUFFLFFBQU8sS0FBRztBQUFBLElBQUMsT0FBTSxPQUFPLEtBQUssT0FBTyxZQUFZLENBQUM7QUFBQTtBQUFBLEVBQVMsUUFBUSxHQUFFLE1BQUssS0FBRztBQUFBLElBQUMsT0FBTSxTQUFTLEVBQUUsR0FBRSxJQUFFO0FBQUE7QUFBQSxFQUFXLEVBQUUsQ0FBQyxHQUFFO0FBQUEsSUFBQyxPQUFNO0FBQUE7QUFBQSxFQUFPLEdBQUcsR0FBRSxRQUFPLEtBQUc7QUFBQSxJQUFDLE9BQU0sUUFBUSxLQUFLLE9BQU8sWUFBWSxDQUFDO0FBQUE7QUFBQSxFQUFVLElBQUksR0FBRSxNQUFLLEdBQUUsT0FBTSxHQUFFLFFBQU8sS0FBRztBQUFBLElBQUMsSUFBSSxJQUFFLEtBQUssT0FBTyxZQUFZLENBQUMsR0FBRSxJQUFFLEVBQUUsQ0FBQztBQUFBLElBQUUsSUFBRyxNQUFJO0FBQUEsTUFBSyxPQUFPO0FBQUEsSUFBRSxJQUFFO0FBQUEsSUFBRSxJQUFJLElBQUUsY0FBWSxJQUFFO0FBQUEsSUFBSSxPQUFPLE1BQUksS0FBRyxhQUFXLEVBQUUsQ0FBQyxJQUFFLE1BQUssS0FBRyxNQUFJLElBQUUsUUFBTztBQUFBO0FBQUEsRUFBRSxLQUFLLEdBQUUsTUFBSyxHQUFFLE9BQU0sR0FBRSxNQUFLLEdBQUUsUUFBTyxLQUFHO0FBQUEsSUFBQyxNQUFJLElBQUUsS0FBSyxPQUFPLFlBQVksR0FBRSxLQUFLLE9BQU8sWUFBWTtBQUFBLElBQUcsSUFBSSxJQUFFLEVBQUUsQ0FBQztBQUFBLElBQUUsSUFBRyxNQUFJO0FBQUEsTUFBSyxPQUFPLEVBQUUsQ0FBQztBQUFBLElBQUUsSUFBRTtBQUFBLElBQUUsSUFBSSxJQUFFLGFBQWEsV0FBVztBQUFBLElBQUssT0FBTyxNQUFJLEtBQUcsV0FBVyxFQUFFLENBQUMsT0FBTSxLQUFHLEtBQUk7QUFBQTtBQUFBLEVBQUUsSUFBSSxDQUFDLEdBQUU7QUFBQSxJQUFDLE9BQU0sWUFBVyxLQUFHLEVBQUUsU0FBTyxLQUFLLE9BQU8sWUFBWSxFQUFFLE1BQU0sS0FBRSxhQUFZLE1BQUcsRUFBRSxVQUFRLEVBQUUsT0FBSyxFQUFFLEVBQUUsSUFBSTtBQUFBO0FBQUU7QUFBRSxJQUFJLElBQUUsTUFBSztBQUFBLEVBQUMsTUFBTSxHQUFFLE1BQUssS0FBRztBQUFBLElBQUMsT0FBTztBQUFBO0FBQUEsRUFBRSxFQUFFLEdBQUUsTUFBSyxLQUFHO0FBQUEsSUFBQyxPQUFPO0FBQUE7QUFBQSxFQUFFLFFBQVEsR0FBRSxNQUFLLEtBQUc7QUFBQSxJQUFDLE9BQU87QUFBQTtBQUFBLEVBQUUsR0FBRyxHQUFFLE1BQUssS0FBRztBQUFBLElBQUMsT0FBTztBQUFBO0FBQUEsRUFBRSxJQUFJLEdBQUUsTUFBSyxLQUFHO0FBQUEsSUFBQyxPQUFPO0FBQUE7QUFBQSxFQUFFLElBQUksR0FBRSxNQUFLLEtBQUc7QUFBQSxJQUFDLE9BQU87QUFBQTtBQUFBLEVBQUUsSUFBSSxHQUFFLE1BQUssS0FBRztBQUFBLElBQUMsT0FBTSxLQUFHO0FBQUE7QUFBQSxFQUFFLEtBQUssR0FBRSxNQUFLLEtBQUc7QUFBQSxJQUFDLE9BQU0sS0FBRztBQUFBO0FBQUEsRUFBRSxFQUFFLEdBQUU7QUFBQSxJQUFDLE9BQU07QUFBQTtBQUFHO0FBQUUsSUFBSSxJQUFFLE1BQU0sR0FBQztBQUFBLEVBQUM7QUFBQSxFQUFRO0FBQUEsRUFBUztBQUFBLEVBQWEsV0FBVyxDQUFDLEdBQUU7QUFBQSxJQUFDLEtBQUssVUFBUSxLQUFHLEdBQUUsS0FBSyxRQUFRLFdBQVMsS0FBSyxRQUFRLFlBQVUsSUFBSSxHQUFFLEtBQUssV0FBUyxLQUFLLFFBQVEsVUFBUyxLQUFLLFNBQVMsVUFBUSxLQUFLLFNBQVEsS0FBSyxTQUFTLFNBQU8sTUFBSyxLQUFLLGVBQWEsSUFBSTtBQUFBO0FBQUEsU0FBUyxLQUFLLENBQUMsR0FBRSxHQUFFO0FBQUEsSUFBQyxPQUFPLElBQUksR0FBRSxDQUFDLEVBQUUsTUFBTSxDQUFDO0FBQUE7QUFBQSxTQUFTLFdBQVcsQ0FBQyxHQUFFLEdBQUU7QUFBQSxJQUFDLE9BQU8sSUFBSSxHQUFFLENBQUMsRUFBRSxZQUFZLENBQUM7QUFBQTtBQUFBLEVBQUUsS0FBSyxDQUFDLEdBQUUsSUFBRSxNQUFHO0FBQUEsSUFBQyxJQUFJLElBQUU7QUFBQSxJQUFHLFNBQVEsSUFBRSxFQUFFLElBQUUsRUFBRSxRQUFPLEtBQUk7QUFBQSxNQUFDLElBQUksSUFBRSxFQUFFO0FBQUEsTUFBRyxJQUFHLEtBQUssUUFBUSxZQUFZLFlBQVksRUFBRSxPQUFNO0FBQUEsUUFBQyxJQUFJLElBQUUsR0FBRSxJQUFFLEtBQUssUUFBUSxXQUFXLFVBQVUsRUFBRSxNQUFNLEtBQUssRUFBQyxRQUFPLEtBQUksR0FBRSxDQUFDO0FBQUEsUUFBRSxJQUFHLE1BQUksU0FBSSxDQUFDLENBQUMsU0FBUSxNQUFLLFdBQVUsUUFBTyxTQUFRLGNBQWEsUUFBTyxRQUFPLE9BQU0sYUFBWSxNQUFNLEVBQUUsU0FBUyxFQUFFLElBQUksR0FBRTtBQUFBLFVBQUMsS0FBRyxLQUFHO0FBQUEsVUFBRztBQUFBLFFBQVE7QUFBQSxNQUFDO0FBQUEsTUFBQyxJQUFJLElBQUU7QUFBQSxNQUFFLFFBQU8sRUFBRTtBQUFBLGFBQVUsU0FBUTtBQUFBLFVBQUMsS0FBRyxLQUFLLFNBQVMsTUFBTSxDQUFDO0FBQUEsVUFBRTtBQUFBLFFBQVE7QUFBQSxhQUFLLE1BQUs7QUFBQSxVQUFDLEtBQUcsS0FBSyxTQUFTLEdBQUcsQ0FBQztBQUFBLFVBQUU7QUFBQSxRQUFRO0FBQUEsYUFBSyxXQUFVO0FBQUEsVUFBQyxLQUFHLEtBQUssU0FBUyxRQUFRLENBQUM7QUFBQSxVQUFFO0FBQUEsUUFBUTtBQUFBLGFBQUssUUFBTztBQUFBLFVBQUMsS0FBRyxLQUFLLFNBQVMsS0FBSyxDQUFDO0FBQUEsVUFBRTtBQUFBLFFBQVE7QUFBQSxhQUFLLFNBQVE7QUFBQSxVQUFDLEtBQUcsS0FBSyxTQUFTLE1BQU0sQ0FBQztBQUFBLFVBQUU7QUFBQSxRQUFRO0FBQUEsYUFBSyxjQUFhO0FBQUEsVUFBQyxLQUFHLEtBQUssU0FBUyxXQUFXLENBQUM7QUFBQSxVQUFFO0FBQUEsUUFBUTtBQUFBLGFBQUssUUFBTztBQUFBLFVBQUMsS0FBRyxLQUFLLFNBQVMsS0FBSyxDQUFDO0FBQUEsVUFBRTtBQUFBLFFBQVE7QUFBQSxhQUFLLFFBQU87QUFBQSxVQUFDLEtBQUcsS0FBSyxTQUFTLEtBQUssQ0FBQztBQUFBLFVBQUU7QUFBQSxRQUFRO0FBQUEsYUFBSyxPQUFNO0FBQUEsVUFBQyxLQUFHLEtBQUssU0FBUyxJQUFJLENBQUM7QUFBQSxVQUFFO0FBQUEsUUFBUTtBQUFBLGFBQUssYUFBWTtBQUFBLFVBQUMsS0FBRyxLQUFLLFNBQVMsVUFBVSxDQUFDO0FBQUEsVUFBRTtBQUFBLFFBQVE7QUFBQSxhQUFLLFFBQU87QUFBQSxVQUFDLElBQUksSUFBRSxHQUFFLElBQUUsS0FBSyxTQUFTLEtBQUssQ0FBQztBQUFBLFVBQUUsTUFBSyxJQUFFLElBQUUsRUFBRSxVQUFRLEVBQUUsSUFBRSxHQUFHLFNBQU87QUFBQSxZQUFRLElBQUUsRUFBRSxFQUFFLElBQUcsS0FBRztBQUFBLElBQzN1RSxLQUFLLFNBQVMsS0FBSyxDQUFDO0FBQUEsVUFBRSxJQUFFLEtBQUcsS0FBSyxTQUFTLFVBQVUsRUFBQyxNQUFLLGFBQVksS0FBSSxHQUFFLE1BQUssR0FBRSxRQUFPLENBQUMsRUFBQyxNQUFLLFFBQU8sS0FBSSxHQUFFLE1BQUssR0FBRSxTQUFRLEtBQUUsQ0FBQyxFQUFDLENBQUMsSUFBRSxLQUFHO0FBQUEsVUFBRTtBQUFBLFFBQVE7QUFBQSxpQkFBUztBQUFBLFVBQUMsSUFBSSxJQUFFLGlCQUFlLEVBQUUsT0FBSztBQUFBLFVBQXdCLElBQUcsS0FBSyxRQUFRO0FBQUEsWUFBTyxPQUFPLFFBQVEsTUFBTSxDQUFDLEdBQUU7QUFBQSxVQUFHLE1BQU0sSUFBSSxNQUFNLENBQUM7QUFBQSxRQUFDO0FBQUE7QUFBQSxJQUFFO0FBQUEsSUFBQyxPQUFPO0FBQUE7QUFBQSxFQUFFLFdBQVcsQ0FBQyxHQUFFLElBQUUsS0FBSyxVQUFTO0FBQUEsSUFBQyxJQUFJLElBQUU7QUFBQSxJQUFHLFNBQVEsSUFBRSxFQUFFLElBQUUsRUFBRSxRQUFPLEtBQUk7QUFBQSxNQUFDLElBQUksSUFBRSxFQUFFO0FBQUEsTUFBRyxJQUFHLEtBQUssUUFBUSxZQUFZLFlBQVksRUFBRSxPQUFNO0FBQUEsUUFBQyxJQUFJLElBQUUsS0FBSyxRQUFRLFdBQVcsVUFBVSxFQUFFLE1BQU0sS0FBSyxFQUFDLFFBQU8sS0FBSSxHQUFFLENBQUM7QUFBQSxRQUFFLElBQUcsTUFBSSxTQUFJLENBQUMsQ0FBQyxVQUFTLFFBQU8sUUFBTyxTQUFRLFVBQVMsTUFBSyxZQUFXLE1BQUssT0FBTSxNQUFNLEVBQUUsU0FBUyxFQUFFLElBQUksR0FBRTtBQUFBLFVBQUMsS0FBRyxLQUFHO0FBQUEsVUFBRztBQUFBLFFBQVE7QUFBQSxNQUFDO0FBQUEsTUFBQyxJQUFJLElBQUU7QUFBQSxNQUFFLFFBQU8sRUFBRTtBQUFBLGFBQVUsVUFBUztBQUFBLFVBQUMsS0FBRyxFQUFFLEtBQUssQ0FBQztBQUFBLFVBQUU7QUFBQSxRQUFLO0FBQUEsYUFBSyxRQUFPO0FBQUEsVUFBQyxLQUFHLEVBQUUsS0FBSyxDQUFD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QUFFLEVBQUUsU0FBUyxJQUFHLElBQUUsRUFBRTtBQUFBLFVBQUcsRUFBRSxLQUFHLElBQUksTUFBSTtBQUFBLFlBQUMsSUFBSSxJQUFFLEVBQUUsTUFBTSxHQUFFLENBQUM7QUFBQSxZQUFFLE9BQU8sTUFBSSxVQUFLLElBQUUsRUFBRSxNQUFNLEdBQUUsQ0FBQyxJQUFHLEtBQUc7QUFBQTtBQUFBLFFBQUc7QUFBQSxRQUFDLEVBQUUsV0FBUztBQUFBLE1BQUM7QUFBQSxNQUFDLElBQUcsRUFBRSxXQUFVO0FBQUEsUUFBQyxJQUFJLElBQUUsS0FBSyxTQUFTLGFBQVcsSUFBSSxFQUFFLEtBQUssUUFBUTtBQUFBLFFBQUUsU0FBUSxLQUFLLEVBQUUsV0FBVTtBQUFBLFVBQUMsSUFBRyxFQUFFLEtBQUs7QUFBQSxZQUFHLE1BQU0sSUFBSSxNQUFNLGNBQWMsbUJBQW1CO0FBQUEsVUFBRSxJQUFHLENBQUMsV0FBVSxTQUFRLE9BQU8sRUFBRSxTQUFTLENBQUM7QUFBQSxZQUFFO0FBQUEsVUFBUyxJQUFJLElBQUUsR0FBRSxJQUFFLEVBQUUsVUFBVSxJQUFHLElBQUUsRUFBRTtBQUFBLFVBQUcsRUFBRSxLQUFHLElBQUksTUFBSTtBQUFBLFlBQUMsSUFBSSxJQUFFLEVBQUUsTUFBTSxHQUFFLENBQUM7QUFBQSxZQUFFLE9BQU8sTUFBSSxVQUFLLElBQUUsRUFBRSxNQUFNLEdBQUUsQ0FBQyxJQUFHO0FBQUE7QUFBQSxRQUFFO0FBQUEsUUFBQyxFQUFFLFlBQVU7QUFBQSxNQUFDO0FBQUEsTUFBQyxJQUFHLEVBQUUsT0FBTTtBQUFBLFFBQUMsSUFBSSxJQUFFLEtBQUssU0FBUyxTQUFPLElBQUk7QUFBQSxRQUFFLFNBQVEsS0FBSyxFQUFFLE9BQU07QUFBQSxVQUFDLElBQUcsRUFBRSxLQUFLO0FBQUEsWUFBRyxNQUFNLElBQUksTUFBTSxTQUFTLG1CQUFtQjtBQUFBLFVBQUUsSUFBRyxDQUFDLFdBQVUsT0FBTyxFQUFFLFNBQVMsQ0FBQztBQUFBLFlBQUU7QUFBQSxVQUFTLElBQUksSUFBRSxHQUFFLElB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QVEsbUJBQW1CLEVBQUUsRUFBRSxRQUFRLHlCQUF5QixFQUFFLEVBQUUsUUFBUSxpQkFBaUIsRUFBRSxFQUFFLFFBQVEsZ0JBQWdCLE9BQU87QUFBQSxNQUNqSyxlQUFPLFFBQVEsRUFBRSxPQUFPLE1BQU0sRUFBRSxLQUFLLFNBQVMsbUJBQW1CLFFBQVEsZ0JBQWdCLE9BQU8sQ0FBQztBQUFBLE1BQ2pHLE1BQU0scUJBQXFCLE1BQU0sUUFBUSxtQkFBbUIsRUFBRSxFQUFFLFFBQVEseUJBQXlCLEVBQUUsRUFBRSxRQUFRLGlCQUFpQixFQUFFLEVBQUUsUUFBUSxXQUFXLE9BQU87QUFBQSxNQUM1SixlQUFPLFFBQVEsRUFBRSxPQUFPLE1BQU0sRUFBRSxLQUFLLFNBQVMsa0JBQWtCO0FBQUE7QUFBQSxJQUVsRSxJQUFJLFNBQVM7QUFBQSxNQUNYLGVBQU8sUUFBUSxFQUFFLFVBQVUsd0JBQXdCLEVBQUUsUUFBUSxhQUFhLElBQUk7QUFBQSxJQUNoRixFQUFPO0FBQUEsTUFDTCxlQUFPLFFBQVEsRUFBRSxVQUFVLHdCQUF3QixFQUFFLFFBQVEsT0FBTyxJQUFJO0FBQUE7QUFBQSxJQUUxRSxPQUFPO0FBQUE7QUFBQSxHQUVSLFlBQVk7IiwKICAiZGVidWdJZCI6ICJFMUFDNjBFNTBBMTI3QjVGNjQ3NTZFMjE2NDc1NkUyMSIsCiAgIm5hbWVzIjogW10KfQ==
