import {
  __name
} from "./chunk-main-vcnyggwp.js";

// node_modules/mermaid/dist/chunks/mermaid.core/chunk-XPW4576I.mjs
function isNothing(subject) {
  return typeof subject === "undefined" || subject === null;
}
__name(isNothing, "isNothing");
function isObject(subject) {
  return typeof subject === "object" && subject !== null;
}
__name(isObject, "isObject");
function toArray(sequence) {
  if (Array.isArray(sequence))
    return sequence;
  else if (isNothing(sequence))
    return [];
  return [sequence];
}
__name(toArray, "toArray");
function extend(target, source) {
  var index, length, key, sourceKeys;
  if (source) {
    sourceKeys = Object.keys(source);
    for (index = 0, length = sourceKeys.length;index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }
  return target;
}
__name(extend, "extend");
function repeat(string, count) {
  var result = "", cycle;
  for (cycle = 0;cycle < count; cycle += 1) {
    result += string;
  }
  return result;
}
__name(repeat, "repeat");
function isNegativeZero(number) {
  return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
}
__name(isNegativeZero, "isNegativeZero");
var isNothing_1 = isNothing;
var isObject_1 = isObject;
var toArray_1 = toArray;
var repeat_1 = repeat;
var isNegativeZero_1 = isNegativeZero;
var extend_1 = extend;
var common = {
  isNothing: isNothing_1,
  isObject: isObject_1,
  toArray: toArray_1,
  repeat: repeat_1,
  isNegativeZero: isNegativeZero_1,
  extend: extend_1
};
function formatError(exception2, compact) {
  var where = "", message = exception2.reason || "(unknown reason)";
  if (!exception2.mark)
    return message;
  if (exception2.mark.name) {
    where += 'in "' + exception2.mark.name + '" ';
  }
  where += "(" + (exception2.mark.line + 1) + ":" + (exception2.mark.column + 1) + ")";
  if (!compact && exception2.mark.snippet) {
    where += `

` + exception2.mark.snippet;
  }
  return message + " " + where;
}
__name(formatError, "formatError");
function YAMLException$1(reason, mark) {
  Error.call(this);
  this.name = "YAMLException";
  this.reason = reason;
  this.mark = mark;
  this.message = formatError(this, false);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack || "";
  }
}
__name(YAMLException$1, "YAMLException$1");
YAMLException$1.prototype = Object.create(Error.prototype);
YAMLException$1.prototype.constructor = YAMLException$1;
YAMLException$1.prototype.toString = /* @__PURE__ */ __name(function toString(compact) {
  return this.name + ": " + formatError(this, compact);
}, "toString");
var exception = YAMLException$1;
function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
  var head = "";
  var tail = "";
  var maxHalfLength = Math.floor(maxLineLength / 2) - 1;
  if (position - lineStart > maxHalfLength) {
    head = " ... ";
    lineStart = position - maxHalfLength + head.length;
  }
  if (lineEnd - position > maxHalfLength) {
    tail = " ...";
    lineEnd = position + maxHalfLength - tail.length;
  }
  return {
    str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, "→") + tail,
    pos: position - lineStart + head.length
  };
}
__name(getLine, "getLine");
function padStart(string, max) {
  return common.repeat(" ", max - string.length) + string;
}
__name(padStart, "padStart");
function makeSnippet(mark, options) {
  options = Object.create(options || null);
  if (!mark.buffer)
    return null;
  if (!options.maxLength)
    options.maxLength = 79;
  if (typeof options.indent !== "number")
    options.indent = 1;
  if (typeof options.linesBefore !== "number")
    options.linesBefore = 3;
  if (typeof options.linesAfter !== "number")
    options.linesAfter = 2;
  var re = /\r?\n|\r|\0/g;
  var lineStarts = [0];
  var lineEnds = [];
  var match;
  var foundLineNo = -1;
  while (match = re.exec(mark.buffer)) {
    lineEnds.push(match.index);
    lineStarts.push(match.index + match[0].length);
    if (mark.position <= match.index && foundLineNo < 0) {
      foundLineNo = lineStarts.length - 2;
    }
  }
  if (foundLineNo < 0)
    foundLineNo = lineStarts.length - 1;
  var result = "", i, line;
  var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
  var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);
  for (i = 1;i <= options.linesBefore; i++) {
    if (foundLineNo - i < 0)
      break;
    line = getLine(mark.buffer, lineStarts[foundLineNo - i], lineEnds[foundLineNo - i], mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]), maxLineLength);
    result = common.repeat(" ", options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) + " | " + line.str + `
` + result;
  }
  line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
  result += common.repeat(" ", options.indent) + padStart((mark.line + 1).toString(), lineNoLength) + " | " + line.str + `
`;
  result += common.repeat("-", options.indent + lineNoLength + 3 + line.pos) + `^
`;
  for (i = 1;i <= options.linesAfter; i++) {
    if (foundLineNo + i >= lineEnds.length)
      break;
    line = getLine(mark.buffer, lineStarts[foundLineNo + i], lineEnds[foundLineNo + i], mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]), maxLineLength);
    result += common.repeat(" ", options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) + " | " + line.str + `
`;
  }
  return result.replace(/\n$/, "");
}
__name(makeSnippet, "makeSnippet");
var snippet = makeSnippet;
var TYPE_CONSTRUCTOR_OPTIONS = [
  "kind",
  "multi",
  "resolve",
  "construct",
  "instanceOf",
  "predicate",
  "represent",
  "representName",
  "defaultStyle",
  "styleAliases"
];
var YAML_NODE_KINDS = [
  "scalar",
  "sequence",
  "mapping"
];
function compileStyleAliases(map2) {
  var result = {};
  if (map2 !== null) {
    Object.keys(map2).forEach(function(style) {
      map2[style].forEach(function(alias) {
        result[String(alias)] = style;
      });
    });
  }
  return result;
}
__name(compileStyleAliases, "compileStyleAliases");
function Type$1(tag, options) {
  options = options || {};
  Object.keys(options).forEach(function(name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new exception('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });
  this.options = options;
  this.tag = tag;
  this.kind = options["kind"] || null;
  this.resolve = options["resolve"] || function() {
    return true;
  };
  this.construct = options["construct"] || function(data) {
    return data;
  };
  this.instanceOf = options["instanceOf"] || null;
  this.predicate = options["predicate"] || null;
  this.represent = options["represent"] || null;
  this.representName = options["representName"] || null;
  this.defaultStyle = options["defaultStyle"] || null;
  this.multi = options["multi"] || false;
  this.styleAliases = compileStyleAliases(options["styleAliases"] || null);
  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new exception('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}
__name(Type$1, "Type$1");
var type = Type$1;
function compileList(schema2, name) {
  var result = [];
  schema2[name].forEach(function(currentType) {
    var newIndex = result.length;
    result.forEach(function(previousType, previousIndex) {
      if (previousType.tag === currentType.tag && previousType.kind === currentType.kind && previousType.multi === currentType.multi) {
        newIndex = previousIndex;
      }
    });
    result[newIndex] = currentType;
  });
  return result;
}
__name(compileList, "compileList");
function compileMap() {
  var result = {
    scalar: {},
    sequence: {},
    mapping: {},
    fallback: {},
    multi: {
      scalar: [],
      sequence: [],
      mapping: [],
      fallback: []
    }
  }, index, length;
  function collectType(type2) {
    if (type2.multi) {
      result.multi[type2.kind].push(type2);
      result.multi["fallback"].push(type2);
    } else {
      result[type2.kind][type2.tag] = result["fallback"][type2.tag] = type2;
    }
  }
  __name(collectType, "collectType");
  for (index = 0, length = arguments.length;index < length; index += 1) {
    arguments[index].forEach(collectType);
  }
  return result;
}
__name(compileMap, "compileMap");
function Schema$1(definition) {
  return this.extend(definition);
}
__name(Schema$1, "Schema$1");
Schema$1.prototype.extend = /* @__PURE__ */ __name(function extend2(definition) {
  var implicit = [];
  var explicit = [];
  if (definition instanceof type) {
    explicit.push(definition);
  } else if (Array.isArray(definition)) {
    explicit = explicit.concat(definition);
  } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
    if (definition.implicit)
      implicit = implicit.concat(definition.implicit);
    if (definition.explicit)
      explicit = explicit.concat(definition.explicit);
  } else {
    throw new exception("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
  }
  implicit.forEach(function(type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
    if (type$1.loadKind && type$1.loadKind !== "scalar") {
      throw new exception("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    }
    if (type$1.multi) {
      throw new exception("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
    }
  });
  explicit.forEach(function(type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
  });
  var result = Object.create(Schema$1.prototype);
  result.implicit = (this.implicit || []).concat(implicit);
  result.explicit = (this.explicit || []).concat(explicit);
  result.compiledImplicit = compileList(result, "implicit");
  result.compiledExplicit = compileList(result, "explicit");
  result.compiledTypeMap = compileMap(result.compiledImplicit, result.compiledExplicit);
  return result;
}, "extend");
var schema = Schema$1;
var str = new type("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: /* @__PURE__ */ __name(function(data) {
    return data !== null ? data : "";
  }, "construct")
});
var seq = new type("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: /* @__PURE__ */ __name(function(data) {
    return data !== null ? data : [];
  }, "construct")
});
var map = new type("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: /* @__PURE__ */ __name(function(data) {
    return data !== null ? data : {};
  }, "construct")
});
var failsafe = new schema({
  explicit: [
    str,
    seq,
    map
  ]
});
function resolveYamlNull(data) {
  if (data === null)
    return true;
  var max = data.length;
  return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
}
__name(resolveYamlNull, "resolveYamlNull");
function constructYamlNull() {
  return null;
}
__name(constructYamlNull, "constructYamlNull");
function isNull(object) {
  return object === null;
}
__name(isNull, "isNull");
var _null = new type("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: /* @__PURE__ */ __name(function() {
      return "~";
    }, "canonical"),
    lowercase: /* @__PURE__ */ __name(function() {
      return "null";
    }, "lowercase"),
    uppercase: /* @__PURE__ */ __name(function() {
      return "NULL";
    }, "uppercase"),
    camelcase: /* @__PURE__ */ __name(function() {
      return "Null";
    }, "camelcase"),
    empty: /* @__PURE__ */ __name(function() {
      return "";
    }, "empty")
  },
  defaultStyle: "lowercase"
});
function resolveYamlBoolean(data) {
  if (data === null)
    return false;
  var max = data.length;
  return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
}
__name(resolveYamlBoolean, "resolveYamlBoolean");
function constructYamlBoolean(data) {
  return data === "true" || data === "True" || data === "TRUE";
}
__name(constructYamlBoolean, "constructYamlBoolean");
function isBoolean(object) {
  return Object.prototype.toString.call(object) === "[object Boolean]";
}
__name(isBoolean, "isBoolean");
var bool = new type("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: /* @__PURE__ */ __name(function(object) {
      return object ? "true" : "false";
    }, "lowercase"),
    uppercase: /* @__PURE__ */ __name(function(object) {
      return object ? "TRUE" : "FALSE";
    }, "uppercase"),
    camelcase: /* @__PURE__ */ __name(function(object) {
      return object ? "True" : "False";
    }, "camelcase")
  },
  defaultStyle: "lowercase"
});
function isHexCode(c) {
  return 48 <= c && c <= 57 || 65 <= c && c <= 70 || 97 <= c && c <= 102;
}
__name(isHexCode, "isHexCode");
function isOctCode(c) {
  return 48 <= c && c <= 55;
}
__name(isOctCode, "isOctCode");
function isDecCode(c) {
  return 48 <= c && c <= 57;
}
__name(isDecCode, "isDecCode");
function resolveYamlInteger(data) {
  if (data === null)
    return false;
  var max = data.length, index = 0, hasDigits = false, ch;
  if (!max)
    return false;
  ch = data[index];
  if (ch === "-" || ch === "+") {
    ch = data[++index];
  }
  if (ch === "0") {
    if (index + 1 === max)
      return true;
    ch = data[++index];
    if (ch === "b") {
      index++;
      for (;index < max; index++) {
        ch = data[index];
        if (ch === "_")
          continue;
        if (ch !== "0" && ch !== "1")
          return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "x") {
      index++;
      for (;index < max; index++) {
        ch = data[index];
        if (ch === "_")
          continue;
        if (!isHexCode(data.charCodeAt(index)))
          return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "o") {
      index++;
      for (;index < max; index++) {
        ch = data[index];
        if (ch === "_")
          continue;
        if (!isOctCode(data.charCodeAt(index)))
          return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
  }
  if (ch === "_")
    return false;
  for (;index < max; index++) {
    ch = data[index];
    if (ch === "_")
      continue;
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }
  if (!hasDigits || ch === "_")
    return false;
  return true;
}
__name(resolveYamlInteger, "resolveYamlInteger");
function constructYamlInteger(data) {
  var value = data, sign = 1, ch;
  if (value.indexOf("_") !== -1) {
    value = value.replace(/_/g, "");
  }
  ch = value[0];
  if (ch === "-" || ch === "+") {
    if (ch === "-")
      sign = -1;
    value = value.slice(1);
    ch = value[0];
  }
  if (value === "0")
    return 0;
  if (ch === "0") {
    if (value[1] === "b")
      return sign * parseInt(value.slice(2), 2);
    if (value[1] === "x")
      return sign * parseInt(value.slice(2), 16);
    if (value[1] === "o")
      return sign * parseInt(value.slice(2), 8);
  }
  return sign * parseInt(value, 10);
}
__name(constructYamlInteger, "constructYamlInteger");
function isInteger(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 === 0 && !common.isNegativeZero(object));
}
__name(isInteger, "isInteger");
var int = new type("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary: /* @__PURE__ */ __name(function(obj) {
      return obj >= 0 ? "0b" + obj.toString(2) : "-0b" + obj.toString(2).slice(1);
    }, "binary"),
    octal: /* @__PURE__ */ __name(function(obj) {
      return obj >= 0 ? "0o" + obj.toString(8) : "-0o" + obj.toString(8).slice(1);
    }, "octal"),
    decimal: /* @__PURE__ */ __name(function(obj) {
      return obj.toString(10);
    }, "decimal"),
    hexadecimal: /* @__PURE__ */ __name(function(obj) {
      return obj >= 0 ? "0x" + obj.toString(16).toUpperCase() : "-0x" + obj.toString(16).toUpperCase().slice(1);
    }, "hexadecimal")
  },
  defaultStyle: "decimal",
  styleAliases: {
    binary: [2, "bin"],
    octal: [8, "oct"],
    decimal: [10, "dec"],
    hexadecimal: [16, "hex"]
  }
});
var YAML_FLOAT_PATTERN = new RegExp("^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");
function resolveYamlFloat(data) {
  if (data === null)
    return false;
  if (!YAML_FLOAT_PATTERN.test(data) || data[data.length - 1] === "_") {
    return false;
  }
  return true;
}
__name(resolveYamlFloat, "resolveYamlFloat");
function constructYamlFloat(data) {
  var value, sign;
  value = data.replace(/_/g, "").toLowerCase();
  sign = value[0] === "-" ? -1 : 1;
  if ("+-".indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }
  if (value === ".inf") {
    return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
  } else if (value === ".nan") {
    return NaN;
  }
  return sign * parseFloat(value, 10);
}
__name(constructYamlFloat, "constructYamlFloat");
var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
function representYamlFloat(object, style) {
  var res;
  if (isNaN(object)) {
    switch (style) {
      case "lowercase":
        return ".nan";
      case "uppercase":
        return ".NAN";
      case "camelcase":
        return ".NaN";
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return ".inf";
      case "uppercase":
        return ".INF";
      case "camelcase":
        return ".Inf";
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return "-.inf";
      case "uppercase":
        return "-.INF";
      case "camelcase":
        return "-.Inf";
    }
  } else if (common.isNegativeZero(object)) {
    return "-0.0";
  }
  res = object.toString(10);
  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
}
__name(representYamlFloat, "representYamlFloat");
function isFloat(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || common.isNegativeZero(object));
}
__name(isFloat, "isFloat");
var float = new type("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: "lowercase"
});
var json = failsafe.extend({
  implicit: [
    _null,
    bool,
    int,
    float
  ]
});
var core = json;
var YAML_DATE_REGEXP = new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$");
var YAML_TIMESTAMP_REGEXP = new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");
function resolveYamlTimestamp(data) {
  if (data === null)
    return false;
  if (YAML_DATE_REGEXP.exec(data) !== null)
    return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null)
    return true;
  return false;
}
__name(resolveYamlTimestamp, "resolveYamlTimestamp");
function constructYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0, delta = null, tz_hour, tz_minute, date;
  match = YAML_DATE_REGEXP.exec(data);
  if (match === null)
    match = YAML_TIMESTAMP_REGEXP.exec(data);
  if (match === null)
    throw new Error("Date resolve error");
  year = +match[1];
  month = +match[2] - 1;
  day = +match[3];
  if (!match[4]) {
    return new Date(Date.UTC(year, month, day));
  }
  hour = +match[4];
  minute = +match[5];
  second = +match[6];
  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) {
      fraction += "0";
    }
    fraction = +fraction;
  }
  if (match[9]) {
    tz_hour = +match[10];
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 60000;
    if (match[9] === "-")
      delta = -delta;
  }
  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
  if (delta)
    date.setTime(date.getTime() - delta);
  return date;
}
__name(constructYamlTimestamp, "constructYamlTimestamp");
function representYamlTimestamp(object) {
  return object.toISOString();
}
__name(representYamlTimestamp, "representYamlTimestamp");
var timestamp = new type("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});
function resolveYamlMerge(data) {
  return data === "<<" || data === null;
}
__name(resolveYamlMerge, "resolveYamlMerge");
var merge = new type("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: resolveYamlMerge
});
var BASE64_MAP = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
function resolveYamlBinary(data) {
  if (data === null)
    return false;
  var code, idx, bitlen = 0, max = data.length, map2 = BASE64_MAP;
  for (idx = 0;idx < max; idx++) {
    code = map2.indexOf(data.charAt(idx));
    if (code > 64)
      continue;
    if (code < 0)
      return false;
    bitlen += 6;
  }
  return bitlen % 8 === 0;
}
__name(resolveYamlBinary, "resolveYamlBinary");
function constructYamlBinary(data) {
  var idx, tailbits, input = data.replace(/[\r\n=]/g, ""), max = input.length, map2 = BASE64_MAP, bits = 0, result = [];
  for (idx = 0;idx < max; idx++) {
    if (idx % 4 === 0 && idx) {
      result.push(bits >> 16 & 255);
      result.push(bits >> 8 & 255);
      result.push(bits & 255);
    }
    bits = bits << 6 | map2.indexOf(input.charAt(idx));
  }
  tailbits = max % 4 * 6;
  if (tailbits === 0) {
    result.push(bits >> 16 & 255);
    result.push(bits >> 8 & 255);
    result.push(bits & 255);
  } else if (tailbits === 18) {
    result.push(bits >> 10 & 255);
    result.push(bits >> 2 & 255);
  } else if (tailbits === 12) {
    result.push(bits >> 4 & 255);
  }
  return new Uint8Array(result);
}
__name(constructYamlBinary, "constructYamlBinary");
function representYamlBinary(object) {
  var result = "", bits = 0, idx, tail, max = object.length, map2 = BASE64_MAP;
  for (idx = 0;idx < max; idx++) {
    if (idx % 3 === 0 && idx) {
      result += map2[bits >> 18 & 63];
      result += map2[bits >> 12 & 63];
      result += map2[bits >> 6 & 63];
      result += map2[bits & 63];
    }
    bits = (bits << 8) + object[idx];
  }
  tail = max % 3;
  if (tail === 0) {
    result += map2[bits >> 18 & 63];
    result += map2[bits >> 12 & 63];
    result += map2[bits >> 6 & 63];
    result += map2[bits & 63];
  } else if (tail === 2) {
    result += map2[bits >> 10 & 63];
    result += map2[bits >> 4 & 63];
    result += map2[bits << 2 & 63];
    result += map2[64];
  } else if (tail === 1) {
    result += map2[bits >> 2 & 63];
    result += map2[bits << 4 & 63];
    result += map2[64];
    result += map2[64];
  }
  return result;
}
__name(representYamlBinary, "representYamlBinary");
function isBinary(obj) {
  return Object.prototype.toString.call(obj) === "[object Uint8Array]";
}
__name(isBinary, "isBinary");
var binary = new type("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});
var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
var _toString$2 = Object.prototype.toString;
function resolveYamlOmap(data) {
  if (data === null)
    return true;
  var objectKeys = [], index, length, pair, pairKey, pairHasKey, object = data;
  for (index = 0, length = object.length;index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;
    if (_toString$2.call(pair) !== "[object Object]")
      return false;
    for (pairKey in pair) {
      if (_hasOwnProperty$3.call(pair, pairKey)) {
        if (!pairHasKey)
          pairHasKey = true;
        else
          return false;
      }
    }
    if (!pairHasKey)
      return false;
    if (objectKeys.indexOf(pairKey) === -1)
      objectKeys.push(pairKey);
    else
      return false;
  }
  return true;
}
__name(resolveYamlOmap, "resolveYamlOmap");
function constructYamlOmap(data) {
  return data !== null ? data : [];
}
__name(constructYamlOmap, "constructYamlOmap");
var omap = new type("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});
var _toString$1 = Object.prototype.toString;
function resolveYamlPairs(data) {
  if (data === null)
    return true;
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length;index < length; index += 1) {
    pair = object[index];
    if (_toString$1.call(pair) !== "[object Object]")
      return false;
    keys = Object.keys(pair);
    if (keys.length !== 1)
      return false;
    result[index] = [keys[0], pair[keys[0]]];
  }
  return true;
}
__name(resolveYamlPairs, "resolveYamlPairs");
function constructYamlPairs(data) {
  if (data === null)
    return [];
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length;index < length; index += 1) {
    pair = object[index];
    keys = Object.keys(pair);
    result[index] = [keys[0], pair[keys[0]]];
  }
  return result;
}
__name(constructYamlPairs, "constructYamlPairs");
var pairs = new type("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});
var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;
function resolveYamlSet(data) {
  if (data === null)
    return true;
  var key, object = data;
  for (key in object) {
    if (_hasOwnProperty$2.call(object, key)) {
      if (object[key] !== null)
        return false;
    }
  }
  return true;
}
__name(resolveYamlSet, "resolveYamlSet");
function constructYamlSet(data) {
  return data !== null ? data : {};
}
__name(constructYamlSet, "constructYamlSet");
var set = new type("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: resolveYamlSet,
  construct: constructYamlSet
});
var _default = core.extend({
  implicit: [
    timestamp,
    merge
  ],
  explicit: [
    binary,
    omap,
    pairs,
    set
  ]
});
var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;
var CONTEXT_FLOW_IN = 1;
var CONTEXT_FLOW_OUT = 2;
var CONTEXT_BLOCK_IN = 3;
var CONTEXT_BLOCK_OUT = 4;
var CHOMPING_CLIP = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP = 3;
var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function _class(obj) {
  return Object.prototype.toString.call(obj);
}
__name(_class, "_class");
function is_EOL(c) {
  return c === 10 || c === 13;
}
__name(is_EOL, "is_EOL");
function is_WHITE_SPACE(c) {
  return c === 9 || c === 32;
}
__name(is_WHITE_SPACE, "is_WHITE_SPACE");
function is_WS_OR_EOL(c) {
  return c === 9 || c === 32 || c === 10 || c === 13;
}
__name(is_WS_OR_EOL, "is_WS_OR_EOL");
function is_FLOW_INDICATOR(c) {
  return c === 44 || c === 91 || c === 93 || c === 123 || c === 125;
}
__name(is_FLOW_INDICATOR, "is_FLOW_INDICATOR");
function fromHexCode(c) {
  var lc;
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  lc = c | 32;
  if (97 <= lc && lc <= 102) {
    return lc - 97 + 10;
  }
  return -1;
}
__name(fromHexCode, "fromHexCode");
function escapedHexLen(c) {
  if (c === 120) {
    return 2;
  }
  if (c === 117) {
    return 4;
  }
  if (c === 85) {
    return 8;
  }
  return 0;
}
__name(escapedHexLen, "escapedHexLen");
function fromDecimalCode(c) {
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  return -1;
}
__name(fromDecimalCode, "fromDecimalCode");
function simpleEscapeSequence(c) {
  return c === 48 ? "\x00" : c === 97 ? "\x07" : c === 98 ? "\b" : c === 116 ? "\t" : c === 9 ? "\t" : c === 110 ? `
` : c === 118 ? "\v" : c === 102 ? "\f" : c === 114 ? "\r" : c === 101 ? "\x1B" : c === 32 ? " " : c === 34 ? '"' : c === 47 ? "/" : c === 92 ? "\\" : c === 78 ? "" : c === 95 ? " " : c === 76 ? "\u2028" : c === 80 ? "\u2029" : "";
}
__name(simpleEscapeSequence, "simpleEscapeSequence");
function charFromCodepoint(c) {
  if (c <= 65535) {
    return String.fromCharCode(c);
  }
  return String.fromCharCode((c - 65536 >> 10) + 55296, (c - 65536 & 1023) + 56320);
}
__name(charFromCodepoint, "charFromCodepoint");
function setProperty(object, key, value) {
  if (key === "__proto__") {
    Object.defineProperty(object, key, {
      configurable: true,
      enumerable: true,
      writable: true,
      value
    });
  } else {
    object[key] = value;
  }
}
__name(setProperty, "setProperty");
var simpleEscapeCheck = new Array(256);
var simpleEscapeMap = new Array(256);
for (i = 0;i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}
var i;
function State$1(input, options) {
  this.input = input;
  this.filename = options["filename"] || null;
  this.schema = options["schema"] || _default;
  this.onWarning = options["onWarning"] || null;
  this.legacy = options["legacy"] || false;
  this.json = options["json"] || false;
  this.listener = options["listener"] || null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap = this.schema.compiledTypeMap;
  this.length = input.length;
  this.position = 0;
  this.line = 0;
  this.lineStart = 0;
  this.lineIndent = 0;
  this.firstTabInLine = -1;
  this.documents = [];
}
__name(State$1, "State$1");
function generateError(state, message) {
  var mark = {
    name: state.filename,
    buffer: state.input.slice(0, -1),
    position: state.position,
    line: state.line,
    column: state.position - state.lineStart
  };
  mark.snippet = snippet(mark);
  return new exception(message, mark);
}
__name(generateError, "generateError");
function throwError(state, message) {
  throw generateError(state, message);
}
__name(throwError, "throwError");
function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}
__name(throwWarning, "throwWarning");
var directiveHandlers = {
  YAML: /* @__PURE__ */ __name(function handleYamlDirective(state, name, args) {
    var match, major, minor;
    if (state.version !== null) {
      throwError(state, "duplication of %YAML directive");
    }
    if (args.length !== 1) {
      throwError(state, "YAML directive accepts exactly one argument");
    }
    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
    if (match === null) {
      throwError(state, "ill-formed argument of the YAML directive");
    }
    major = parseInt(match[1], 10);
    minor = parseInt(match[2], 10);
    if (major !== 1) {
      throwError(state, "unacceptable YAML version of the document");
    }
    state.version = args[0];
    state.checkLineBreaks = minor < 2;
    if (minor !== 1 && minor !== 2) {
      throwWarning(state, "unsupported YAML version of the document");
    }
  }, "handleYamlDirective"),
  TAG: /* @__PURE__ */ __name(function handleTagDirective(state, name, args) {
    var handle, prefix;
    if (args.length !== 2) {
      throwError(state, "TAG directive accepts exactly two arguments");
    }
    handle = args[0];
    prefix = args[1];
    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
    }
    if (_hasOwnProperty$1.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
    }
    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
    }
    try {
      prefix = decodeURIComponent(prefix);
    } catch (err) {
      throwError(state, "tag prefix is malformed: " + prefix);
    }
    state.tagMap[handle] = prefix;
  }, "handleTagDirective")
};
function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;
  if (start < end) {
    _result = state.input.slice(start, end);
    if (checkJson) {
      for (_position = 0, _length = _result.length;_position < _length; _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(_character === 9 || 32 <= _character && _character <= 1114111)) {
          throwError(state, "expected valid JSON character");
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, "the stream contains non-printable characters");
    }
    state.result += _result;
  }
}
__name(captureSegment, "captureSegment");
function mergeMappings(state, destination, source, overridableKeys) {
  var sourceKeys, key, index, quantity;
  if (!common.isObject(source)) {
    throwError(state, "cannot merge mappings; the provided source object is unacceptable");
  }
  sourceKeys = Object.keys(source);
  for (index = 0, quantity = sourceKeys.length;index < quantity; index += 1) {
    key = sourceKeys[index];
    if (!_hasOwnProperty$1.call(destination, key)) {
      setProperty(destination, key, source[key]);
      overridableKeys[key] = true;
    }
  }
}
__name(mergeMappings, "mergeMappings");
function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startLineStart, startPos) {
  var index, quantity;
  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);
    for (index = 0, quantity = keyNode.length;index < quantity; index += 1) {
      if (Array.isArray(keyNode[index])) {
        throwError(state, "nested arrays are not supported inside keys");
      }
      if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") {
        keyNode[index] = "[object Object]";
      }
    }
  }
  if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
    keyNode = "[object Object]";
  }
  keyNode = String(keyNode);
  if (_result === null) {
    _result = {};
  }
  if (keyTag === "tag:yaml.org,2002:merge") {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length;index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json && !_hasOwnProperty$1.call(overridableKeys, keyNode) && _hasOwnProperty$1.call(_result, keyNode)) {
      state.line = startLine || state.line;
      state.lineStart = startLineStart || state.lineStart;
      state.position = startPos || state.position;
      throwError(state, "duplicated mapping key");
    }
    setProperty(_result, keyNode, valueNode);
    delete overridableKeys[keyNode];
  }
  return _result;
}
__name(storeMappingPair, "storeMappingPair");
function readLineBreak(state) {
  var ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 10) {
    state.position++;
  } else if (ch === 13) {
    state.position++;
    if (state.input.charCodeAt(state.position) === 10) {
      state.position++;
    }
  } else {
    throwError(state, "a line break is expected");
  }
  state.line += 1;
  state.lineStart = state.position;
  state.firstTabInLine = -1;
}
__name(readLineBreak, "readLineBreak");
function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0, ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      if (ch === 9 && state.firstTabInLine === -1) {
        state.firstTabInLine = state.position;
      }
      ch = state.input.charCodeAt(++state.position);
    }
    if (allowComments && ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 10 && ch !== 13 && ch !== 0);
    }
    if (is_EOL(ch)) {
      readLineBreak(state);
      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;
      while (ch === 32) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }
  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, "deficient indentation");
  }
  return lineBreaks;
}
__name(skipSeparationSpace, "skipSeparationSpace");
function testDocumentSeparator(state) {
  var _position = state.position, ch;
  ch = state.input.charCodeAt(_position);
  if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
    _position += 3;
    ch = state.input.charCodeAt(_position);
    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }
  return false;
}
__name(testDocumentSeparator, "testDocumentSeparator");
function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += " ";
  } else if (count > 1) {
    state.result += common.repeat(`
`, count - 1);
  }
}
__name(writeFoldedLines, "writeFoldedLines");
function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding, following, captureStart, captureEnd, hasPendingContent, _line, _lineStart, _lineIndent, _kind = state.kind, _result = state.result, ch;
  ch = state.input.charCodeAt(state.position);
  if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96) {
    return false;
  }
  if (ch === 63 || ch === 45) {
    following = state.input.charCodeAt(state.position + 1);
    if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }
  state.kind = "scalar";
  state.result = "";
  captureStart = captureEnd = state.position;
  hasPendingContent = false;
  while (ch !== 0) {
    if (ch === 58) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }
    } else if (ch === 35) {
      preceding = state.input.charCodeAt(state.position - 1);
      if (is_WS_OR_EOL(preceding)) {
        break;
      }
    } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;
    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);
      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }
    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }
    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }
    ch = state.input.charCodeAt(++state.position);
  }
  captureSegment(state, captureStart, captureEnd, false);
  if (state.result) {
    return true;
  }
  state.kind = _kind;
  state.result = _result;
  return false;
}
__name(readPlainScalar, "readPlainScalar");
function readSingleQuotedScalar(state, nodeIndent) {
  var ch, captureStart, captureEnd;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 39) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 39) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (ch === 39) {
        captureStart = state.position;
        state.position++;
        captureEnd = state.position;
      } else {
        return true;
      }
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a single quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a single quoted scalar");
}
__name(readSingleQuotedScalar, "readSingleQuotedScalar");
function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart, captureEnd, hexLength, hexResult, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 34) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 34) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;
    } else if (ch === 92) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;
      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;
        for (;hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);
          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;
          } else {
            throwError(state, "expected hexadecimal character");
          }
        }
        state.result += charFromCodepoint(hexResult);
        state.position++;
      } else {
        throwError(state, "unknown escape sequence");
      }
      captureStart = captureEnd = state.position;
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a double quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a double quoted scalar");
}
__name(readDoubleQuotedScalar, "readDoubleQuotedScalar");
function readFlowCollection(state, nodeIndent) {
  var readNext = true, _line, _lineStart, _pos, _tag = state.tag, _result, _anchor = state.anchor, following, terminator, isPair, isExplicitPair, isMapping, overridableKeys = /* @__PURE__ */ Object.create(null), keyNode, keyTag, valueNode, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 91) {
    terminator = 93;
    isMapping = false;
    _result = [];
  } else if (ch === 123) {
    terminator = 125;
    isMapping = true;
    _result = {};
  } else {
    return false;
  }
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(++state.position);
  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? "mapping" : "sequence";
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, "missed comma between flow collection entries");
    } else if (ch === 44) {
      throwError(state, "expected the node content, but found ','");
    }
    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;
    if (ch === 63) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }
    _line = state.line;
    _lineStart = state.lineStart;
    _pos = state.position;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if ((isExplicitPair || state.line === _line) && ch === 58) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }
    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
    } else {
      _result.push(keyNode);
    }
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === 44) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }
  throwError(state, "unexpected end of the stream within a flow collection");
}
__name(readFlowCollection, "readFlowCollection");
function readBlockScalar(state, nodeIndent) {
  var captureStart, folding, chomping = CHOMPING_CLIP, didReadContent = false, detectedIndent = false, textIndent = nodeIndent, emptyLines = 0, atMoreIndented = false, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 124) {
    folding = false;
  } else if (ch === 62) {
    folding = true;
  } else {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);
    if (ch === 43 || ch === 45) {
      if (CHOMPING_CLIP === chomping) {
        chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, "repeat of a chomping mode identifier");
      }
    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, "repeat of an indentation width identifier");
      }
    } else {
      break;
    }
  }
  if (is_WHITE_SPACE(ch)) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (is_WHITE_SPACE(ch));
    if (ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (!is_EOL(ch) && ch !== 0);
    }
  }
  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;
    ch = state.input.charCodeAt(state.position);
    while ((!detectedIndent || state.lineIndent < textIndent) && ch === 32) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }
    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }
    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }
    if (state.lineIndent < textIndent) {
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat(`
`, didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) {
          state.result += `
`;
        }
      }
      break;
    }
    if (folding) {
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        state.result += common.repeat(`
`, didReadContent ? 1 + emptyLines : emptyLines);
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat(`
`, emptyLines + 1);
      } else if (emptyLines === 0) {
        if (didReadContent) {
          state.result += " ";
        }
      } else {
        state.result += common.repeat(`
`, emptyLines);
      }
    } else {
      state.result += common.repeat(`
`, didReadContent ? 1 + emptyLines : emptyLines);
    }
    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;
    while (!is_EOL(ch) && ch !== 0) {
      ch = state.input.charCodeAt(++state.position);
    }
    captureSegment(state, captureStart, state.position, false);
  }
  return true;
}
__name(readBlockScalar, "readBlockScalar");
function readBlockSequence(state, nodeIndent) {
  var _line, _tag = state.tag, _anchor = state.anchor, _result = [], following, detected = false, ch;
  if (state.firstTabInLine !== -1)
    return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    if (ch !== 45) {
      break;
    }
    following = state.input.charCodeAt(state.position + 1);
    if (!is_WS_OR_EOL(following)) {
      break;
    }
    detected = true;
    state.position++;
    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }
    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a sequence entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "sequence";
    state.result = _result;
    return true;
  }
  return false;
}
__name(readBlockSequence, "readBlockSequence");
function readBlockMapping(state, nodeIndent, flowIndent) {
  var following, allowCompact, _line, _keyLine, _keyLineStart, _keyPos, _tag = state.tag, _anchor = state.anchor, _result = {}, overridableKeys = /* @__PURE__ */ Object.create(null), keyTag = null, keyNode = null, valueNode = null, atExplicitKey = false, detected = false, ch;
  if (state.firstTabInLine !== -1)
    return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (!atExplicitKey && state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    following = state.input.charCodeAt(state.position + 1);
    _line = state.line;
    if ((ch === 63 || ch === 58) && is_WS_OR_EOL(following)) {
      if (ch === 63) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }
        detected = true;
        atExplicitKey = true;
        allowCompact = true;
      } else if (atExplicitKey) {
        atExplicitKey = false;
        allowCompact = true;
      } else {
        throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
      }
      state.position += 1;
      ch = following;
    } else {
      _keyLine = state.line;
      _keyLineStart = state.lineStart;
      _keyPos = state.position;
      if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        break;
      }
      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);
        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        if (ch === 58) {
          ch = state.input.charCodeAt(++state.position);
          if (!is_WS_OR_EOL(ch)) {
            throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
          }
          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }
          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;
        } else if (detected) {
          throwError(state, "can not read an implicit mapping pair; a colon is missed");
        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true;
        }
      } else if (detected) {
        throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true;
      }
    }
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (atExplicitKey) {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
      }
      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }
      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
        keyTag = keyNode = valueNode = null;
      }
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a mapping entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "mapping";
    state.result = _result;
  }
  return detected;
}
__name(readBlockMapping, "readBlockMapping");
function readTagProperty(state) {
  var _position, isVerbatim = false, isNamed = false, tagHandle, tagName, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 33)
    return false;
  if (state.tag !== null) {
    throwError(state, "duplication of a tag property");
  }
  ch = state.input.charCodeAt(++state.position);
  if (ch === 60) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);
  } else if (ch === 33) {
    isNamed = true;
    tagHandle = "!!";
    ch = state.input.charCodeAt(++state.position);
  } else {
    tagHandle = "!";
  }
  _position = state.position;
  if (isVerbatim) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (ch !== 0 && ch !== 62);
    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, "unexpected end of the stream within a verbatim tag");
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      if (ch === 33) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);
          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, "named tag handle cannot contain such characters");
          }
          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, "tag suffix cannot contain exclamation marks");
        }
      }
      ch = state.input.charCodeAt(++state.position);
    }
    tagName = state.input.slice(_position, state.position);
    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, "tag suffix cannot contain flow indicator characters");
    }
  }
  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, "tag name cannot contain such characters: " + tagName);
  }
  try {
    tagName = decodeURIComponent(tagName);
  } catch (err) {
    throwError(state, "tag name is malformed: " + tagName);
  }
  if (isVerbatim) {
    state.tag = tagName;
  } else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;
  } else if (tagHandle === "!") {
    state.tag = "!" + tagName;
  } else if (tagHandle === "!!") {
    state.tag = "tag:yaml.org,2002:" + tagName;
  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }
  return true;
}
__name(readTagProperty, "readTagProperty");
function readAnchorProperty(state) {
  var _position, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 38)
    return false;
  if (state.anchor !== null) {
    throwError(state, "duplication of an anchor property");
  }
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an anchor node must contain at least one character");
  }
  state.anchor = state.input.slice(_position, state.position);
  return true;
}
__name(readAnchorProperty, "readAnchorProperty");
function readAlias(state) {
  var _position, alias, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 42)
    return false;
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an alias node must contain at least one character");
  }
  alias = state.input.slice(_position, state.position);
  if (!_hasOwnProperty$1.call(state.anchorMap, alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }
  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}
__name(readAlias, "readAlias");
function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles, allowBlockScalars, allowBlockCollections, indentStatus = 1, atNewLine = false, hasContent = false, typeIndex, typeQuantity, typeList, type2, flowIndent, blockIndent;
  if (state.listener !== null) {
    state.listener("open", state);
  }
  state.tag = null;
  state.anchor = null;
  state.kind = null;
  state.result = null;
  allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;
      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }
  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;
        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }
  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }
  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }
    blockIndent = state.position - state.lineStart;
    if (indentStatus === 1) {
      if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;
        } else if (readAlias(state)) {
          hasContent = true;
          if (state.tag !== null || state.anchor !== null) {
            throwError(state, "alias node should not have any properties");
          }
        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;
          if (state.tag === null) {
            state.tag = "?";
          }
        }
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }
  if (state.tag === null) {
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = state.result;
    }
  } else if (state.tag === "?") {
    if (state.result !== null && state.kind !== "scalar") {
      throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
    }
    for (typeIndex = 0, typeQuantity = state.implicitTypes.length;typeIndex < typeQuantity; typeIndex += 1) {
      type2 = state.implicitTypes[typeIndex];
      if (type2.resolve(state.result)) {
        state.result = type2.construct(state.result);
        state.tag = type2.tag;
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
        break;
      }
    }
  } else if (state.tag !== "!") {
    if (_hasOwnProperty$1.call(state.typeMap[state.kind || "fallback"], state.tag)) {
      type2 = state.typeMap[state.kind || "fallback"][state.tag];
    } else {
      type2 = null;
      typeList = state.typeMap.multi[state.kind || "fallback"];
      for (typeIndex = 0, typeQuantity = typeList.length;typeIndex < typeQuantity; typeIndex += 1) {
        if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
          type2 = typeList[typeIndex];
          break;
        }
      }
    }
    if (!type2) {
      throwError(state, "unknown tag !<" + state.tag + ">");
    }
    if (state.result !== null && type2.kind !== state.kind) {
      throwError(state, "unacceptable node kind for !<" + state.tag + '> tag; it should be "' + type2.kind + '", not "' + state.kind + '"');
    }
    if (!type2.resolve(state.result, state.tag)) {
      throwError(state, "cannot resolve a node with !<" + state.tag + "> explicit tag");
    } else {
      state.result = type2.construct(state.result, state.tag);
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }
    }
  }
  if (state.listener !== null) {
    state.listener("close", state);
  }
  return state.tag !== null || state.anchor !== null || hasContent;
}
__name(composeNode, "composeNode");
function readDocument(state) {
  var documentStart = state.position, _position, directiveName, directiveArgs, hasDirectives = false, ch;
  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = /* @__PURE__ */ Object.create(null);
  state.anchorMap = /* @__PURE__ */ Object.create(null);
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if (state.lineIndent > 0 || ch !== 37) {
      break;
    }
    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];
    if (directiveName.length < 1) {
      throwError(state, "directive name must not be less than one character in length");
    }
    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      if (ch === 35) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 0 && !is_EOL(ch));
        break;
      }
      if (is_EOL(ch))
        break;
      _position = state.position;
      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      directiveArgs.push(state.input.slice(_position, state.position));
    }
    if (ch !== 0)
      readLineBreak(state);
    if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }
  skipSeparationSpace(state, true, -1);
  if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);
  } else if (hasDirectives) {
    throwError(state, "directives end mark is expected");
  }
  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);
  if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, "non-ASCII line breaks are interpreted as content");
  }
  state.documents.push(state.result);
  if (state.position === state.lineStart && testDocumentSeparator(state)) {
    if (state.input.charCodeAt(state.position) === 46) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }
  if (state.position < state.length - 1) {
    throwError(state, "end of the stream or a document separator is expected");
  } else {
    return;
  }
}
__name(readDocument, "readDocument");
function loadDocuments(input, options) {
  input = String(input);
  options = options || {};
  if (input.length !== 0) {
    if (input.charCodeAt(input.length - 1) !== 10 && input.charCodeAt(input.length - 1) !== 13) {
      input += `
`;
    }
    if (input.charCodeAt(0) === 65279) {
      input = input.slice(1);
    }
  }
  var state = new State$1(input, options);
  var nullpos = input.indexOf("\x00");
  if (nullpos !== -1) {
    state.position = nullpos;
    throwError(state, "null byte is not allowed in input");
  }
  state.input += "\x00";
  while (state.input.charCodeAt(state.position) === 32) {
    state.lineIndent += 1;
    state.position += 1;
  }
  while (state.position < state.length - 1) {
    readDocument(state);
  }
  return state.documents;
}
__name(loadDocuments, "loadDocuments");
function loadAll$1(input, iterator, options) {
  if (iterator !== null && typeof iterator === "object" && typeof options === "undefined") {
    options = iterator;
    iterator = null;
  }
  var documents = loadDocuments(input, options);
  if (typeof iterator !== "function") {
    return documents;
  }
  for (var index = 0, length = documents.length;index < length; index += 1) {
    iterator(documents[index]);
  }
}
__name(loadAll$1, "loadAll$1");
function load$1(input, options) {
  var documents = loadDocuments(input, options);
  if (documents.length === 0) {
    return;
  } else if (documents.length === 1) {
    return documents[0];
  }
  throw new exception("expected a single document in the stream, but found more");
}
__name(load$1, "load$1");
var loadAll_1 = loadAll$1;
var load_1 = load$1;
var loader = {
  loadAll: loadAll_1,
  load: load_1
};
var _toString = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;
var CHAR_BOM = 65279;
var CHAR_TAB = 9;
var CHAR_LINE_FEED = 10;
var CHAR_CARRIAGE_RETURN = 13;
var CHAR_SPACE = 32;
var CHAR_EXCLAMATION = 33;
var CHAR_DOUBLE_QUOTE = 34;
var CHAR_SHARP = 35;
var CHAR_PERCENT = 37;
var CHAR_AMPERSAND = 38;
var CHAR_SINGLE_QUOTE = 39;
var CHAR_ASTERISK = 42;
var CHAR_COMMA = 44;
var CHAR_MINUS = 45;
var CHAR_COLON = 58;
var CHAR_EQUALS = 61;
var CHAR_GREATER_THAN = 62;
var CHAR_QUESTION = 63;
var CHAR_COMMERCIAL_AT = 64;
var CHAR_LEFT_SQUARE_BRACKET = 91;
var CHAR_RIGHT_SQUARE_BRACKET = 93;
var CHAR_GRAVE_ACCENT = 96;
var CHAR_LEFT_CURLY_BRACKET = 123;
var CHAR_VERTICAL_LINE = 124;
var CHAR_RIGHT_CURLY_BRACKET = 125;
var ESCAPE_SEQUENCES = {};
ESCAPE_SEQUENCES[0] = "\\0";
ESCAPE_SEQUENCES[7] = "\\a";
ESCAPE_SEQUENCES[8] = "\\b";
ESCAPE_SEQUENCES[9] = "\\t";
ESCAPE_SEQUENCES[10] = "\\n";
ESCAPE_SEQUENCES[11] = "\\v";
ESCAPE_SEQUENCES[12] = "\\f";
ESCAPE_SEQUENCES[13] = "\\r";
ESCAPE_SEQUENCES[27] = "\\e";
ESCAPE_SEQUENCES[34] = "\\\"";
ESCAPE_SEQUENCES[92] = "\\\\";
ESCAPE_SEQUENCES[133] = "\\N";
ESCAPE_SEQUENCES[160] = "\\_";
ESCAPE_SEQUENCES[8232] = "\\L";
ESCAPE_SEQUENCES[8233] = "\\P";
var DEPRECATED_BOOLEANS_SYNTAX = [
  "y",
  "Y",
  "yes",
  "Yes",
  "YES",
  "on",
  "On",
  "ON",
  "n",
  "N",
  "no",
  "No",
  "NO",
  "off",
  "Off",
  "OFF"
];
var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
function compileStyleMap(schema2, map2) {
  var result, keys, index, length, tag, style, type2;
  if (map2 === null)
    return {};
  result = {};
  keys = Object.keys(map2);
  for (index = 0, length = keys.length;index < length; index += 1) {
    tag = keys[index];
    style = String(map2[tag]);
    if (tag.slice(0, 2) === "!!") {
      tag = "tag:yaml.org,2002:" + tag.slice(2);
    }
    type2 = schema2.compiledTypeMap["fallback"][tag];
    if (type2 && _hasOwnProperty.call(type2.styleAliases, style)) {
      style = type2.styleAliases[style];
    }
    result[tag] = style;
  }
  return result;
}
__name(compileStyleMap, "compileStyleMap");
function encodeHex(character) {
  var string, handle, length;
  string = character.toString(16).toUpperCase();
  if (character <= 255) {
    handle = "x";
    length = 2;
  } else if (character <= 65535) {
    handle = "u";
    length = 4;
  } else if (character <= 4294967295) {
    handle = "U";
    length = 8;
  } else {
    throw new exception("code point within a string may not be greater than 0xFFFFFFFF");
  }
  return "\\" + handle + common.repeat("0", length - string.length) + string;
}
__name(encodeHex, "encodeHex");
var QUOTING_TYPE_SINGLE = 1;
var QUOTING_TYPE_DOUBLE = 2;
function State(options) {
  this.schema = options["schema"] || _default;
  this.indent = Math.max(1, options["indent"] || 2);
  this.noArrayIndent = options["noArrayIndent"] || false;
  this.skipInvalid = options["skipInvalid"] || false;
  this.flowLevel = common.isNothing(options["flowLevel"]) ? -1 : options["flowLevel"];
  this.styleMap = compileStyleMap(this.schema, options["styles"] || null);
  this.sortKeys = options["sortKeys"] || false;
  this.lineWidth = options["lineWidth"] || 80;
  this.noRefs = options["noRefs"] || false;
  this.noCompatMode = options["noCompatMode"] || false;
  this.condenseFlow = options["condenseFlow"] || false;
  this.quotingType = options["quotingType"] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
  this.forceQuotes = options["forceQuotes"] || false;
  this.replacer = typeof options["replacer"] === "function" ? options["replacer"] : null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;
  this.tag = null;
  this.result = "";
  this.duplicates = [];
  this.usedDuplicates = null;
}
__name(State, "State");
function indentString(string, spaces) {
  var ind = common.repeat(" ", spaces), position = 0, next = -1, result = "", line, length = string.length;
  while (position < length) {
    next = string.indexOf(`
`, position);
    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }
    if (line.length && line !== `
`)
      result += ind;
    result += line;
  }
  return result;
}
__name(indentString, "indentString");
function generateNextLine(state, level) {
  return `
` + common.repeat(" ", state.indent * level);
}
__name(generateNextLine, "generateNextLine");
function testImplicitResolving(state, str2) {
  var index, length, type2;
  for (index = 0, length = state.implicitTypes.length;index < length; index += 1) {
    type2 = state.implicitTypes[index];
    if (type2.resolve(str2)) {
      return true;
    }
  }
  return false;
}
__name(testImplicitResolving, "testImplicitResolving");
function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
}
__name(isWhitespace, "isWhitespace");
function isPrintable(c) {
  return 32 <= c && c <= 126 || 161 <= c && c <= 55295 && c !== 8232 && c !== 8233 || 57344 <= c && c <= 65533 && c !== CHAR_BOM || 65536 <= c && c <= 1114111;
}
__name(isPrintable, "isPrintable");
function isNsCharOrWhitespace(c) {
  return isPrintable(c) && c !== CHAR_BOM && c !== CHAR_CARRIAGE_RETURN && c !== CHAR_LINE_FEED;
}
__name(isNsCharOrWhitespace, "isNsCharOrWhitespace");
function isPlainSafe(c, prev, inblock) {
  var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
  var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
  return (inblock ? cIsNsCharOrWhitespace : cIsNsCharOrWhitespace && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET) && c !== CHAR_SHARP && !(prev === CHAR_COLON && !cIsNsChar) || isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP || prev === CHAR_COLON && cIsNsChar;
}
__name(isPlainSafe, "isPlainSafe");
function isPlainSafeFirst(c) {
  return isPrintable(c) && c !== CHAR_BOM && !isWhitespace(c) && c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_EQUALS && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE && c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
}
__name(isPlainSafeFirst, "isPlainSafeFirst");
function isPlainSafeLast(c) {
  return !isWhitespace(c) && c !== CHAR_COLON;
}
__name(isPlainSafeLast, "isPlainSafeLast");
function codePointAt(string, pos) {
  var first = string.charCodeAt(pos), second;
  if (first >= 55296 && first <= 56319 && pos + 1 < string.length) {
    second = string.charCodeAt(pos + 1);
    if (second >= 56320 && second <= 57343) {
      return (first - 55296) * 1024 + second - 56320 + 65536;
    }
  }
  return first;
}
__name(codePointAt, "codePointAt");
function needIndentIndicator(string) {
  var leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string);
}
__name(needIndentIndicator, "needIndentIndicator");
var STYLE_PLAIN = 1;
var STYLE_SINGLE = 2;
var STYLE_LITERAL = 3;
var STYLE_FOLDED = 4;
var STYLE_DOUBLE = 5;
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType, quotingType, forceQuotes, inblock) {
  var i2;
  var char = 0;
  var prevChar = null;
  var hasLineBreak = false;
  var hasFoldableLine = false;
  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1;
  var plain = isPlainSafeFirst(codePointAt(string, 0)) && isPlainSafeLast(codePointAt(string, string.length - 1));
  if (singleLineOnly || forceQuotes) {
    for (i2 = 0;i2 < string.length; char >= 65536 ? i2 += 2 : i2++) {
      char = codePointAt(string, i2);
      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
  } else {
    for (i2 = 0;i2 < string.length; char >= 65536 ? i2 += 2 : i2++) {
      char = codePointAt(string, i2);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine || i2 - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
          previousLineBreak = i2;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
    hasFoldableLine = hasFoldableLine || shouldTrackWidth && (i2 - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ");
  }
  if (!hasLineBreak && !hasFoldableLine) {
    if (plain && !forceQuotes && !testAmbiguousType(string)) {
      return STYLE_PLAIN;
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  if (indentPerLevel > 9 && needIndentIndicator(string)) {
    return STYLE_DOUBLE;
  }
  if (!forceQuotes) {
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }
  return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
}
__name(chooseScalarStyle, "chooseScalarStyle");
function writeScalar(state, string, level, iskey, inblock) {
  state.dump = function() {
    if (string.length === 0) {
      return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
    }
    if (!state.noCompatMode) {
      if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? '"' + string + '"' : "'" + string + "'";
      }
    }
    var indent = state.indent * Math.max(1, level);
    var lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
    var singleLineOnly = iskey || state.flowLevel > -1 && level >= state.flowLevel;
    function testAmbiguity(string2) {
      return testImplicitResolving(state, string2);
    }
    __name(testAmbiguity, "testAmbiguity");
    switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth, testAmbiguity, state.quotingType, state.forceQuotes && !iskey, inblock)) {
      case STYLE_PLAIN:
        return string;
      case STYLE_SINGLE:
        return "'" + string.replace(/'/g, "''") + "'";
      case STYLE_LITERAL:
        return "|" + blockHeader(string, state.indent) + dropEndingNewline(indentString(string, indent));
      case STYLE_FOLDED:
        return ">" + blockHeader(string, state.indent) + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
      case STYLE_DOUBLE:
        return '"' + escapeString(string) + '"';
      default:
        throw new exception("impossible error: invalid scalar style");
    }
  }();
}
__name(writeScalar, "writeScalar");
function blockHeader(string, indentPerLevel) {
  var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
  var clip = string[string.length - 1] === `
`;
  var keep = clip && (string[string.length - 2] === `
` || string === `
`);
  var chomp = keep ? "+" : clip ? "" : "-";
  return indentIndicator + chomp + `
`;
}
__name(blockHeader, "blockHeader");
function dropEndingNewline(string) {
  return string[string.length - 1] === `
` ? string.slice(0, -1) : string;
}
__name(dropEndingNewline, "dropEndingNewline");
function foldString(string, width) {
  var lineRe = /(\n+)([^\n]*)/g;
  var result = function() {
    var nextLF = string.indexOf(`
`);
    nextLF = nextLF !== -1 ? nextLF : string.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string.slice(0, nextLF), width);
  }();
  var prevMoreIndented = string[0] === `
` || string[0] === " ";
  var moreIndented;
  var match;
  while (match = lineRe.exec(string)) {
    var prefix = match[1], line = match[2];
    moreIndented = line[0] === " ";
    result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? `
` : "") + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }
  return result;
}
__name(foldString, "foldString");
function foldLine(line, width) {
  if (line === "" || line[0] === " ")
    return line;
  var breakRe = / [^ ]/g;
  var match;
  var start = 0, end, curr = 0, next = 0;
  var result = "";
  while (match = breakRe.exec(line)) {
    next = match.index;
    if (next - start > width) {
      end = curr > start ? curr : next;
      result += `
` + line.slice(start, end);
      start = end + 1;
    }
    curr = next;
  }
  result += `
`;
  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + `
` + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }
  return result.slice(1);
}
__name(foldLine, "foldLine");
function escapeString(string) {
  var result = "";
  var char = 0;
  var escapeSeq;
  for (var i2 = 0;i2 < string.length; char >= 65536 ? i2 += 2 : i2++) {
    char = codePointAt(string, i2);
    escapeSeq = ESCAPE_SEQUENCES[char];
    if (!escapeSeq && isPrintable(char)) {
      result += string[i2];
      if (char >= 65536)
        result += string[i2 + 1];
    } else {
      result += escapeSeq || encodeHex(char);
    }
  }
  return result;
}
__name(escapeString, "escapeString");
function writeFlowSequence(state, level, object) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object.length;index < length; index += 1) {
    value = object[index];
    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }
    if (writeNode(state, level, value, false, false) || typeof value === "undefined" && writeNode(state, level, null, false, false)) {
      if (_result !== "")
        _result += "," + (!state.condenseFlow ? " " : "");
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = "[" + _result + "]";
}
__name(writeFlowSequence, "writeFlowSequence");
function writeBlockSequence(state, level, object, compact) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object.length;index < length; index += 1) {
    value = object[index];
    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }
    if (writeNode(state, level + 1, value, true, true, false, true) || typeof value === "undefined" && writeNode(state, level + 1, null, true, true, false, true)) {
      if (!compact || _result !== "") {
        _result += generateNextLine(state, level);
      }
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += "-";
      } else {
        _result += "- ";
      }
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = _result || "[]";
}
__name(writeBlockSequence, "writeBlockSequence");
function writeFlowMapping(state, level, object) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, pairBuffer;
  for (index = 0, length = objectKeyList.length;index < length; index += 1) {
    pairBuffer = "";
    if (_result !== "")
      pairBuffer += ", ";
    if (state.condenseFlow)
      pairBuffer += '"';
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level, objectKey, false, false)) {
      continue;
    }
    if (state.dump.length > 1024)
      pairBuffer += "? ";
    pairBuffer += state.dump + (state.condenseFlow ? '"' : "") + ":" + (state.condenseFlow ? "" : " ");
    if (!writeNode(state, level, objectValue, false, false)) {
      continue;
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = "{" + _result + "}";
}
__name(writeFlowMapping, "writeFlowMapping");
function writeBlockMapping(state, level, object, compact) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, explicitPair, pairBuffer;
  if (state.sortKeys === true) {
    objectKeyList.sort();
  } else if (typeof state.sortKeys === "function") {
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    throw new exception("sortKeys must be a boolean or a function");
  }
  for (index = 0, length = objectKeyList.length;index < length; index += 1) {
    pairBuffer = "";
    if (!compact || _result !== "") {
      pairBuffer += generateNextLine(state, level);
    }
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue;
    }
    explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += "?";
      } else {
        pairBuffer += "? ";
      }
    }
    pairBuffer += state.dump;
    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }
    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue;
    }
    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ":";
    } else {
      pairBuffer += ": ";
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = _result || "{}";
}
__name(writeBlockMapping, "writeBlockMapping");
function detectType(state, object, explicit) {
  var _result, typeList, index, length, type2, style;
  typeList = explicit ? state.explicitTypes : state.implicitTypes;
  for (index = 0, length = typeList.length;index < length; index += 1) {
    type2 = typeList[index];
    if ((type2.instanceOf || type2.predicate) && (!type2.instanceOf || typeof object === "object" && object instanceof type2.instanceOf) && (!type2.predicate || type2.predicate(object))) {
      if (explicit) {
        if (type2.multi && type2.representName) {
          state.tag = type2.representName(object);
        } else {
          state.tag = type2.tag;
        }
      } else {
        state.tag = "?";
      }
      if (type2.represent) {
        style = state.styleMap[type2.tag] || type2.defaultStyle;
        if (_toString.call(type2.represent) === "[object Function]") {
          _result = type2.represent(object, style);
        } else if (_hasOwnProperty.call(type2.represent, style)) {
          _result = type2.represent[style](object, style);
        } else {
          throw new exception("!<" + type2.tag + '> tag resolver accepts not "' + style + '" style');
        }
        state.dump = _result;
      }
      return true;
    }
  }
  return false;
}
__name(detectType, "detectType");
function writeNode(state, level, object, block, compact, iskey, isblockseq) {
  state.tag = null;
  state.dump = object;
  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }
  var type2 = _toString.call(state.dump);
  var inblock = block;
  var tagStr;
  if (block) {
    block = state.flowLevel < 0 || state.flowLevel > level;
  }
  var objectOrArray = type2 === "[object Object]" || type2 === "[object Array]", duplicateIndex, duplicate;
  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }
  if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
    compact = false;
  }
  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = "*ref_" + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if (type2 === "[object Object]") {
      if (block && Object.keys(state.dump).length !== 0) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object Array]") {
      if (block && state.dump.length !== 0) {
        if (state.noArrayIndent && !isblockseq && level > 0) {
          writeBlockSequence(state, level - 1, state.dump, compact);
        } else {
          writeBlockSequence(state, level, state.dump, compact);
        }
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object String]") {
      if (state.tag !== "?") {
        writeScalar(state, state.dump, level, iskey, inblock);
      }
    } else if (type2 === "[object Undefined]") {
      return false;
    } else {
      if (state.skipInvalid)
        return false;
      throw new exception("unacceptable kind of an object to dump " + type2);
    }
    if (state.tag !== null && state.tag !== "?") {
      tagStr = encodeURI(state.tag[0] === "!" ? state.tag.slice(1) : state.tag).replace(/!/g, "%21");
      if (state.tag[0] === "!") {
        tagStr = "!" + tagStr;
      } else if (tagStr.slice(0, 18) === "tag:yaml.org,2002:") {
        tagStr = "!!" + tagStr.slice(18);
      } else {
        tagStr = "!<" + tagStr + ">";
      }
      state.dump = tagStr + " " + state.dump;
    }
  }
  return true;
}
__name(writeNode, "writeNode");
function getDuplicateReferences(object, state) {
  var objects = [], duplicatesIndexes = [], index, length;
  inspectNode(object, objects, duplicatesIndexes);
  for (index = 0, length = duplicatesIndexes.length;index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }
  state.usedDuplicates = new Array(length);
}
__name(getDuplicateReferences, "getDuplicateReferences");
function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList, index, length;
  if (object !== null && typeof object === "object") {
    index = objects.indexOf(object);
    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);
      if (Array.isArray(object)) {
        for (index = 0, length = object.length;index < length; index += 1) {
          inspectNode(object[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);
        for (index = 0, length = objectKeyList.length;index < length; index += 1) {
          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}
__name(inspectNode, "inspectNode");
function dump$1(input, options) {
  options = options || {};
  var state = new State(options);
  if (!state.noRefs)
    getDuplicateReferences(input, state);
  var value = input;
  if (state.replacer) {
    value = state.replacer.call({ "": value }, "", value);
  }
  if (writeNode(state, 0, value, true, true))
    return state.dump + `
`;
  return "";
}
__name(dump$1, "dump$1");
var dump_1 = dump$1;
var dumper = {
  dump: dump_1
};
function renamed(from, to) {
  return function() {
    throw new Error("Function yaml." + from + " is removed in js-yaml 4. Use yaml." + to + " instead, which is now safe by default.");
  };
}
__name(renamed, "renamed");
var JSON_SCHEMA = json;
var load = loader.load;
var loadAll = loader.loadAll;
var dump = dumper.dump;
var safeLoad = renamed("safeLoad", "load");
var safeLoadAll = renamed("safeLoadAll", "loadAll");
var safeDump = renamed("safeDump", "dump");
/*! Bundled license information:

js-yaml/dist/js-yaml.mjs:
  (*! js-yaml 4.1.1 https://github.com/nodeca/js-yaml @license MIT *)
*/

export { JSON_SCHEMA, load };

//# debugId=34BEA77B6325F60C64756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL2NodW5rLVhQVzQ1NzZJLm1qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICJpbXBvcnQge1xuICBfX25hbWVcbn0gZnJvbSBcIi4vY2h1bmstQUdIUkI0SkYubWpzXCI7XG5cbi8vIC4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9qcy15YW1sQDQuMS4xL25vZGVfbW9kdWxlcy9qcy15YW1sL2Rpc3QvanMteWFtbC5tanNcbmZ1bmN0aW9uIGlzTm90aGluZyhzdWJqZWN0KSB7XG4gIHJldHVybiB0eXBlb2Ygc3ViamVjdCA9PT0gXCJ1bmRlZmluZWRcIiB8fCBzdWJqZWN0ID09PSBudWxsO1xufVxuX19uYW1lKGlzTm90aGluZywgXCJpc05vdGhpbmdcIik7XG5mdW5jdGlvbiBpc09iamVjdChzdWJqZWN0KSB7XG4gIHJldHVybiB0eXBlb2Ygc3ViamVjdCA9PT0gXCJvYmplY3RcIiAmJiBzdWJqZWN0ICE9PSBudWxsO1xufVxuX19uYW1lKGlzT2JqZWN0LCBcImlzT2JqZWN0XCIpO1xuZnVuY3Rpb24gdG9BcnJheShzZXF1ZW5jZSkge1xuICBpZiAoQXJyYXkuaXNBcnJheShzZXF1ZW5jZSkpIHJldHVybiBzZXF1ZW5jZTtcbiAgZWxzZSBpZiAoaXNOb3RoaW5nKHNlcXVlbmNlKSkgcmV0dXJuIFtdO1xuICByZXR1cm4gW3NlcXVlbmNlXTtcbn1cbl9fbmFtZSh0b0FycmF5LCBcInRvQXJyYXlcIik7XG5mdW5jdGlvbiBleHRlbmQodGFyZ2V0LCBzb3VyY2UpIHtcbiAgdmFyIGluZGV4LCBsZW5ndGgsIGtleSwgc291cmNlS2V5cztcbiAgaWYgKHNvdXJjZSkge1xuICAgIHNvdXJjZUtleXMgPSBPYmplY3Qua2V5cyhzb3VyY2UpO1xuICAgIGZvciAoaW5kZXggPSAwLCBsZW5ndGggPSBzb3VyY2VLZXlzLmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICAgIGtleSA9IHNvdXJjZUtleXNbaW5kZXhdO1xuICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRhcmdldDtcbn1cbl9fbmFtZShleHRlbmQsIFwiZXh0ZW5kXCIpO1xuZnVuY3Rpb24gcmVwZWF0KHN0cmluZywgY291bnQpIHtcbiAgdmFyIHJlc3VsdCA9IFwiXCIsIGN5Y2xlO1xuICBmb3IgKGN5Y2xlID0gMDsgY3ljbGUgPCBjb3VudDsgY3ljbGUgKz0gMSkge1xuICAgIHJlc3VsdCArPSBzdHJpbmc7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbl9fbmFtZShyZXBlYXQsIFwicmVwZWF0XCIpO1xuZnVuY3Rpb24gaXNOZWdhdGl2ZVplcm8obnVtYmVyKSB7XG4gIHJldHVybiBudW1iZXIgPT09IDAgJiYgTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZID09PSAxIC8gbnVtYmVyO1xufVxuX19uYW1lKGlzTmVnYXRpdmVaZXJvLCBcImlzTmVnYXRpdmVaZXJvXCIpO1xudmFyIGlzTm90aGluZ18xID0gaXNOb3RoaW5nO1xudmFyIGlzT2JqZWN0XzEgPSBpc09iamVjdDtcbnZhciB0b0FycmF5XzEgPSB0b0FycmF5O1xudmFyIHJlcGVhdF8xID0gcmVwZWF0O1xudmFyIGlzTmVnYXRpdmVaZXJvXzEgPSBpc05lZ2F0aXZlWmVybztcbnZhciBleHRlbmRfMSA9IGV4dGVuZDtcbnZhciBjb21tb24gPSB7XG4gIGlzTm90aGluZzogaXNOb3RoaW5nXzEsXG4gIGlzT2JqZWN0OiBpc09iamVjdF8xLFxuICB0b0FycmF5OiB0b0FycmF5XzEsXG4gIHJlcGVhdDogcmVwZWF0XzEsXG4gIGlzTmVnYXRpdmVaZXJvOiBpc05lZ2F0aXZlWmVyb18xLFxuICBleHRlbmQ6IGV4dGVuZF8xXG59O1xuZnVuY3Rpb24gZm9ybWF0RXJyb3IoZXhjZXB0aW9uMiwgY29tcGFjdCkge1xuICB2YXIgd2hlcmUgPSBcIlwiLCBtZXNzYWdlID0gZXhjZXB0aW9uMi5yZWFzb24gfHwgXCIodW5rbm93biByZWFzb24pXCI7XG4gIGlmICghZXhjZXB0aW9uMi5tYXJrKSByZXR1cm4gbWVzc2FnZTtcbiAgaWYgKGV4Y2VwdGlvbjIubWFyay5uYW1lKSB7XG4gICAgd2hlcmUgKz0gJ2luIFwiJyArIGV4Y2VwdGlvbjIubWFyay5uYW1lICsgJ1wiICc7XG4gIH1cbiAgd2hlcmUgKz0gXCIoXCIgKyAoZXhjZXB0aW9uMi5tYXJrLmxpbmUgKyAxKSArIFwiOlwiICsgKGV4Y2VwdGlvbjIubWFyay5jb2x1bW4gKyAxKSArIFwiKVwiO1xuICBpZiAoIWNvbXBhY3QgJiYgZXhjZXB0aW9uMi5tYXJrLnNuaXBwZXQpIHtcbiAgICB3aGVyZSArPSBcIlxcblxcblwiICsgZXhjZXB0aW9uMi5tYXJrLnNuaXBwZXQ7XG4gIH1cbiAgcmV0dXJuIG1lc3NhZ2UgKyBcIiBcIiArIHdoZXJlO1xufVxuX19uYW1lKGZvcm1hdEVycm9yLCBcImZvcm1hdEVycm9yXCIpO1xuZnVuY3Rpb24gWUFNTEV4Y2VwdGlvbiQxKHJlYXNvbiwgbWFyaykge1xuICBFcnJvci5jYWxsKHRoaXMpO1xuICB0aGlzLm5hbWUgPSBcIllBTUxFeGNlcHRpb25cIjtcbiAgdGhpcy5yZWFzb24gPSByZWFzb247XG4gIHRoaXMubWFyayA9IG1hcms7XG4gIHRoaXMubWVzc2FnZSA9IGZvcm1hdEVycm9yKHRoaXMsIGZhbHNlKTtcbiAgaWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSB7XG4gICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgdGhpcy5jb25zdHJ1Y3Rvcik7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5zdGFjayA9IG5ldyBFcnJvcigpLnN0YWNrIHx8IFwiXCI7XG4gIH1cbn1cbl9fbmFtZShZQU1MRXhjZXB0aW9uJDEsIFwiWUFNTEV4Y2VwdGlvbiQxXCIpO1xuWUFNTEV4Y2VwdGlvbiQxLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRXJyb3IucHJvdG90eXBlKTtcbllBTUxFeGNlcHRpb24kMS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBZQU1MRXhjZXB0aW9uJDE7XG5ZQU1MRXhjZXB0aW9uJDEucHJvdG90eXBlLnRvU3RyaW5nID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiB0b1N0cmluZyhjb21wYWN0KSB7XG4gIHJldHVybiB0aGlzLm5hbWUgKyBcIjogXCIgKyBmb3JtYXRFcnJvcih0aGlzLCBjb21wYWN0KTtcbn0sIFwidG9TdHJpbmdcIik7XG52YXIgZXhjZXB0aW9uID0gWUFNTEV4Y2VwdGlvbiQxO1xuZnVuY3Rpb24gZ2V0TGluZShidWZmZXIsIGxpbmVTdGFydCwgbGluZUVuZCwgcG9zaXRpb24sIG1heExpbmVMZW5ndGgpIHtcbiAgdmFyIGhlYWQgPSBcIlwiO1xuICB2YXIgdGFpbCA9IFwiXCI7XG4gIHZhciBtYXhIYWxmTGVuZ3RoID0gTWF0aC5mbG9vcihtYXhMaW5lTGVuZ3RoIC8gMikgLSAxO1xuICBpZiAocG9zaXRpb24gLSBsaW5lU3RhcnQgPiBtYXhIYWxmTGVuZ3RoKSB7XG4gICAgaGVhZCA9IFwiIC4uLiBcIjtcbiAgICBsaW5lU3RhcnQgPSBwb3NpdGlvbiAtIG1heEhhbGZMZW5ndGggKyBoZWFkLmxlbmd0aDtcbiAgfVxuICBpZiAobGluZUVuZCAtIHBvc2l0aW9uID4gbWF4SGFsZkxlbmd0aCkge1xuICAgIHRhaWwgPSBcIiAuLi5cIjtcbiAgICBsaW5lRW5kID0gcG9zaXRpb24gKyBtYXhIYWxmTGVuZ3RoIC0gdGFpbC5sZW5ndGg7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBzdHI6IGhlYWQgKyBidWZmZXIuc2xpY2UobGluZVN0YXJ0LCBsaW5lRW5kKS5yZXBsYWNlKC9cXHQvZywgXCJcXHUyMTkyXCIpICsgdGFpbCxcbiAgICBwb3M6IHBvc2l0aW9uIC0gbGluZVN0YXJ0ICsgaGVhZC5sZW5ndGhcbiAgICAvLyByZWxhdGl2ZSBwb3NpdGlvblxuICB9O1xufVxuX19uYW1lKGdldExpbmUsIFwiZ2V0TGluZVwiKTtcbmZ1bmN0aW9uIHBhZFN0YXJ0KHN0cmluZywgbWF4KSB7XG4gIHJldHVybiBjb21tb24ucmVwZWF0KFwiIFwiLCBtYXggLSBzdHJpbmcubGVuZ3RoKSArIHN0cmluZztcbn1cbl9fbmFtZShwYWRTdGFydCwgXCJwYWRTdGFydFwiKTtcbmZ1bmN0aW9uIG1ha2VTbmlwcGV0KG1hcmssIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IE9iamVjdC5jcmVhdGUob3B0aW9ucyB8fCBudWxsKTtcbiAgaWYgKCFtYXJrLmJ1ZmZlcikgcmV0dXJuIG51bGw7XG4gIGlmICghb3B0aW9ucy5tYXhMZW5ndGgpIG9wdGlvbnMubWF4TGVuZ3RoID0gNzk7XG4gIGlmICh0eXBlb2Ygb3B0aW9ucy5pbmRlbnQgIT09IFwibnVtYmVyXCIpIG9wdGlvbnMuaW5kZW50ID0gMTtcbiAgaWYgKHR5cGVvZiBvcHRpb25zLmxpbmVzQmVmb3JlICE9PSBcIm51bWJlclwiKSBvcHRpb25zLmxpbmVzQmVmb3JlID0gMztcbiAgaWYgKHR5cGVvZiBvcHRpb25zLmxpbmVzQWZ0ZXIgIT09IFwibnVtYmVyXCIpIG9wdGlvbnMubGluZXNBZnRlciA9IDI7XG4gIHZhciByZSA9IC9cXHI/XFxufFxccnxcXDAvZztcbiAgdmFyIGxpbmVTdGFydHMgPSBbMF07XG4gIHZhciBsaW5lRW5kcyA9IFtdO1xuICB2YXIgbWF0Y2g7XG4gIHZhciBmb3VuZExpbmVObyA9IC0xO1xuICB3aGlsZSAobWF0Y2ggPSByZS5leGVjKG1hcmsuYnVmZmVyKSkge1xuICAgIGxpbmVFbmRzLnB1c2gobWF0Y2guaW5kZXgpO1xuICAgIGxpbmVTdGFydHMucHVzaChtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aCk7XG4gICAgaWYgKG1hcmsucG9zaXRpb24gPD0gbWF0Y2guaW5kZXggJiYgZm91bmRMaW5lTm8gPCAwKSB7XG4gICAgICBmb3VuZExpbmVObyA9IGxpbmVTdGFydHMubGVuZ3RoIC0gMjtcbiAgICB9XG4gIH1cbiAgaWYgKGZvdW5kTGluZU5vIDwgMCkgZm91bmRMaW5lTm8gPSBsaW5lU3RhcnRzLmxlbmd0aCAtIDE7XG4gIHZhciByZXN1bHQgPSBcIlwiLCBpLCBsaW5lO1xuICB2YXIgbGluZU5vTGVuZ3RoID0gTWF0aC5taW4obWFyay5saW5lICsgb3B0aW9ucy5saW5lc0FmdGVyLCBsaW5lRW5kcy5sZW5ndGgpLnRvU3RyaW5nKCkubGVuZ3RoO1xuICB2YXIgbWF4TGluZUxlbmd0aCA9IG9wdGlvbnMubWF4TGVuZ3RoIC0gKG9wdGlvbnMuaW5kZW50ICsgbGluZU5vTGVuZ3RoICsgMyk7XG4gIGZvciAoaSA9IDE7IGkgPD0gb3B0aW9ucy5saW5lc0JlZm9yZTsgaSsrKSB7XG4gICAgaWYgKGZvdW5kTGluZU5vIC0gaSA8IDApIGJyZWFrO1xuICAgIGxpbmUgPSBnZXRMaW5lKFxuICAgICAgbWFyay5idWZmZXIsXG4gICAgICBsaW5lU3RhcnRzW2ZvdW5kTGluZU5vIC0gaV0sXG4gICAgICBsaW5lRW5kc1tmb3VuZExpbmVObyAtIGldLFxuICAgICAgbWFyay5wb3NpdGlvbiAtIChsaW5lU3RhcnRzW2ZvdW5kTGluZU5vXSAtIGxpbmVTdGFydHNbZm91bmRMaW5lTm8gLSBpXSksXG4gICAgICBtYXhMaW5lTGVuZ3RoXG4gICAgKTtcbiAgICByZXN1bHQgPSBjb21tb24ucmVwZWF0KFwiIFwiLCBvcHRpb25zLmluZGVudCkgKyBwYWRTdGFydCgobWFyay5saW5lIC0gaSArIDEpLnRvU3RyaW5nKCksIGxpbmVOb0xlbmd0aCkgKyBcIiB8IFwiICsgbGluZS5zdHIgKyBcIlxcblwiICsgcmVzdWx0O1xuICB9XG4gIGxpbmUgPSBnZXRMaW5lKG1hcmsuYnVmZmVyLCBsaW5lU3RhcnRzW2ZvdW5kTGluZU5vXSwgbGluZUVuZHNbZm91bmRMaW5lTm9dLCBtYXJrLnBvc2l0aW9uLCBtYXhMaW5lTGVuZ3RoKTtcbiAgcmVzdWx0ICs9IGNvbW1vbi5yZXBlYXQoXCIgXCIsIG9wdGlvbnMuaW5kZW50KSArIHBhZFN0YXJ0KChtYXJrLmxpbmUgKyAxKS50b1N0cmluZygpLCBsaW5lTm9MZW5ndGgpICsgXCIgfCBcIiArIGxpbmUuc3RyICsgXCJcXG5cIjtcbiAgcmVzdWx0ICs9IGNvbW1vbi5yZXBlYXQoXCItXCIsIG9wdGlvbnMuaW5kZW50ICsgbGluZU5vTGVuZ3RoICsgMyArIGxpbmUucG9zKSArIFwiXlxcblwiO1xuICBmb3IgKGkgPSAxOyBpIDw9IG9wdGlvbnMubGluZXNBZnRlcjsgaSsrKSB7XG4gICAgaWYgKGZvdW5kTGluZU5vICsgaSA+PSBsaW5lRW5kcy5sZW5ndGgpIGJyZWFrO1xuICAgIGxpbmUgPSBnZXRMaW5lKFxuICAgICAgbWFyay5idWZmZXIsXG4gICAgICBsaW5lU3RhcnRzW2ZvdW5kTGluZU5vICsgaV0sXG4gICAgICBsaW5lRW5kc1tmb3VuZExpbmVObyArIGldLFxuICAgICAgbWFyay5wb3NpdGlvbiAtIChsaW5lU3RhcnRzW2ZvdW5kTGluZU5vXSAtIGxpbmVTdGFydHNbZm91bmRMaW5lTm8gKyBpXSksXG4gICAgICBtYXhMaW5lTGVuZ3RoXG4gICAgKTtcbiAgICByZXN1bHQgKz0gY29tbW9uLnJlcGVhdChcIiBcIiwgb3B0aW9ucy5pbmRlbnQpICsgcGFkU3RhcnQoKG1hcmsubGluZSArIGkgKyAxKS50b1N0cmluZygpLCBsaW5lTm9MZW5ndGgpICsgXCIgfCBcIiArIGxpbmUuc3RyICsgXCJcXG5cIjtcbiAgfVxuICByZXR1cm4gcmVzdWx0LnJlcGxhY2UoL1xcbiQvLCBcIlwiKTtcbn1cbl9fbmFtZShtYWtlU25pcHBldCwgXCJtYWtlU25pcHBldFwiKTtcbnZhciBzbmlwcGV0ID0gbWFrZVNuaXBwZXQ7XG52YXIgVFlQRV9DT05TVFJVQ1RPUl9PUFRJT05TID0gW1xuICBcImtpbmRcIixcbiAgXCJtdWx0aVwiLFxuICBcInJlc29sdmVcIixcbiAgXCJjb25zdHJ1Y3RcIixcbiAgXCJpbnN0YW5jZU9mXCIsXG4gIFwicHJlZGljYXRlXCIsXG4gIFwicmVwcmVzZW50XCIsXG4gIFwicmVwcmVzZW50TmFtZVwiLFxuICBcImRlZmF1bHRTdHlsZVwiLFxuICBcInN0eWxlQWxpYXNlc1wiXG5dO1xudmFyIFlBTUxfTk9ERV9LSU5EUyA9IFtcbiAgXCJzY2FsYXJcIixcbiAgXCJzZXF1ZW5jZVwiLFxuICBcIm1hcHBpbmdcIlxuXTtcbmZ1bmN0aW9uIGNvbXBpbGVTdHlsZUFsaWFzZXMobWFwMikge1xuICB2YXIgcmVzdWx0ID0ge307XG4gIGlmIChtYXAyICE9PSBudWxsKSB7XG4gICAgT2JqZWN0LmtleXMobWFwMikuZm9yRWFjaChmdW5jdGlvbihzdHlsZSkge1xuICAgICAgbWFwMltzdHlsZV0uZm9yRWFjaChmdW5jdGlvbihhbGlhcykge1xuICAgICAgICByZXN1bHRbU3RyaW5nKGFsaWFzKV0gPSBzdHlsZTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5fX25hbWUoY29tcGlsZVN0eWxlQWxpYXNlcywgXCJjb21waWxlU3R5bGVBbGlhc2VzXCIpO1xuZnVuY3Rpb24gVHlwZSQxKHRhZywgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgT2JqZWN0LmtleXMob3B0aW9ucykuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgaWYgKFRZUEVfQ09OU1RSVUNUT1JfT1BUSU9OUy5pbmRleE9mKG5hbWUpID09PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IGV4Y2VwdGlvbignVW5rbm93biBvcHRpb24gXCInICsgbmFtZSArICdcIiBpcyBtZXQgaW4gZGVmaW5pdGlvbiBvZiBcIicgKyB0YWcgKyAnXCIgWUFNTCB0eXBlLicpO1xuICAgIH1cbiAgfSk7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gIHRoaXMudGFnID0gdGFnO1xuICB0aGlzLmtpbmQgPSBvcHRpb25zW1wia2luZFwiXSB8fCBudWxsO1xuICB0aGlzLnJlc29sdmUgPSBvcHRpb25zW1wicmVzb2x2ZVwiXSB8fCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbiAgdGhpcy5jb25zdHJ1Y3QgPSBvcHRpb25zW1wiY29uc3RydWN0XCJdIHx8IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gZGF0YTtcbiAgfTtcbiAgdGhpcy5pbnN0YW5jZU9mID0gb3B0aW9uc1tcImluc3RhbmNlT2ZcIl0gfHwgbnVsbDtcbiAgdGhpcy5wcmVkaWNhdGUgPSBvcHRpb25zW1wicHJlZGljYXRlXCJdIHx8IG51bGw7XG4gIHRoaXMucmVwcmVzZW50ID0gb3B0aW9uc1tcInJlcHJlc2VudFwiXSB8fCBudWxsO1xuICB0aGlzLnJlcHJlc2VudE5hbWUgPSBvcHRpb25zW1wicmVwcmVzZW50TmFtZVwiXSB8fCBudWxsO1xuICB0aGlzLmRlZmF1bHRTdHlsZSA9IG9wdGlvbnNbXCJkZWZhdWx0U3R5bGVcIl0gfHwgbnVsbDtcbiAgdGhpcy5tdWx0aSA9IG9wdGlvbnNbXCJtdWx0aVwiXSB8fCBmYWxzZTtcbiAgdGhpcy5zdHlsZUFsaWFzZXMgPSBjb21waWxlU3R5bGVBbGlhc2VzKG9wdGlvbnNbXCJzdHlsZUFsaWFzZXNcIl0gfHwgbnVsbCk7XG4gIGlmIChZQU1MX05PREVfS0lORFMuaW5kZXhPZih0aGlzLmtpbmQpID09PSAtMSkge1xuICAgIHRocm93IG5ldyBleGNlcHRpb24oJ1Vua25vd24ga2luZCBcIicgKyB0aGlzLmtpbmQgKyAnXCIgaXMgc3BlY2lmaWVkIGZvciBcIicgKyB0YWcgKyAnXCIgWUFNTCB0eXBlLicpO1xuICB9XG59XG5fX25hbWUoVHlwZSQxLCBcIlR5cGUkMVwiKTtcbnZhciB0eXBlID0gVHlwZSQxO1xuZnVuY3Rpb24gY29tcGlsZUxpc3Qoc2NoZW1hMiwgbmFtZSkge1xuICB2YXIgcmVzdWx0ID0gW107XG4gIHNjaGVtYTJbbmFtZV0uZm9yRWFjaChmdW5jdGlvbihjdXJyZW50VHlwZSkge1xuICAgIHZhciBuZXdJbmRleCA9IHJlc3VsdC5sZW5ndGg7XG4gICAgcmVzdWx0LmZvckVhY2goZnVuY3Rpb24ocHJldmlvdXNUeXBlLCBwcmV2aW91c0luZGV4KSB7XG4gICAgICBpZiAocHJldmlvdXNUeXBlLnRhZyA9PT0gY3VycmVudFR5cGUudGFnICYmIHByZXZpb3VzVHlwZS5raW5kID09PSBjdXJyZW50VHlwZS5raW5kICYmIHByZXZpb3VzVHlwZS5tdWx0aSA9PT0gY3VycmVudFR5cGUubXVsdGkpIHtcbiAgICAgICAgbmV3SW5kZXggPSBwcmV2aW91c0luZGV4O1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJlc3VsdFtuZXdJbmRleF0gPSBjdXJyZW50VHlwZTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5fX25hbWUoY29tcGlsZUxpc3QsIFwiY29tcGlsZUxpc3RcIik7XG5mdW5jdGlvbiBjb21waWxlTWFwKCkge1xuICB2YXIgcmVzdWx0ID0ge1xuICAgIHNjYWxhcjoge30sXG4gICAgc2VxdWVuY2U6IHt9LFxuICAgIG1hcHBpbmc6IHt9LFxuICAgIGZhbGxiYWNrOiB7fSxcbiAgICBtdWx0aToge1xuICAgICAgc2NhbGFyOiBbXSxcbiAgICAgIHNlcXVlbmNlOiBbXSxcbiAgICAgIG1hcHBpbmc6IFtdLFxuICAgICAgZmFsbGJhY2s6IFtdXG4gICAgfVxuICB9LCBpbmRleCwgbGVuZ3RoO1xuICBmdW5jdGlvbiBjb2xsZWN0VHlwZSh0eXBlMikge1xuICAgIGlmICh0eXBlMi5tdWx0aSkge1xuICAgICAgcmVzdWx0Lm11bHRpW3R5cGUyLmtpbmRdLnB1c2godHlwZTIpO1xuICAgICAgcmVzdWx0Lm11bHRpW1wiZmFsbGJhY2tcIl0ucHVzaCh0eXBlMik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdFt0eXBlMi5raW5kXVt0eXBlMi50YWddID0gcmVzdWx0W1wiZmFsbGJhY2tcIl1bdHlwZTIudGFnXSA9IHR5cGUyO1xuICAgIH1cbiAgfVxuICBfX25hbWUoY29sbGVjdFR5cGUsIFwiY29sbGVjdFR5cGVcIik7XG4gIGZvciAoaW5kZXggPSAwLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgIGFyZ3VtZW50c1tpbmRleF0uZm9yRWFjaChjb2xsZWN0VHlwZSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbl9fbmFtZShjb21waWxlTWFwLCBcImNvbXBpbGVNYXBcIik7XG5mdW5jdGlvbiBTY2hlbWEkMShkZWZpbml0aW9uKSB7XG4gIHJldHVybiB0aGlzLmV4dGVuZChkZWZpbml0aW9uKTtcbn1cbl9fbmFtZShTY2hlbWEkMSwgXCJTY2hlbWEkMVwiKTtcblNjaGVtYSQxLnByb3RvdHlwZS5leHRlbmQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGV4dGVuZDIoZGVmaW5pdGlvbikge1xuICB2YXIgaW1wbGljaXQgPSBbXTtcbiAgdmFyIGV4cGxpY2l0ID0gW107XG4gIGlmIChkZWZpbml0aW9uIGluc3RhbmNlb2YgdHlwZSkge1xuICAgIGV4cGxpY2l0LnB1c2goZGVmaW5pdGlvbik7XG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShkZWZpbml0aW9uKSkge1xuICAgIGV4cGxpY2l0ID0gZXhwbGljaXQuY29uY2F0KGRlZmluaXRpb24pO1xuICB9IGVsc2UgaWYgKGRlZmluaXRpb24gJiYgKEFycmF5LmlzQXJyYXkoZGVmaW5pdGlvbi5pbXBsaWNpdCkgfHwgQXJyYXkuaXNBcnJheShkZWZpbml0aW9uLmV4cGxpY2l0KSkpIHtcbiAgICBpZiAoZGVmaW5pdGlvbi5pbXBsaWNpdCkgaW1wbGljaXQgPSBpbXBsaWNpdC5jb25jYXQoZGVmaW5pdGlvbi5pbXBsaWNpdCk7XG4gICAgaWYgKGRlZmluaXRpb24uZXhwbGljaXQpIGV4cGxpY2l0ID0gZXhwbGljaXQuY29uY2F0KGRlZmluaXRpb24uZXhwbGljaXQpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBleGNlcHRpb24oXCJTY2hlbWEuZXh0ZW5kIGFyZ3VtZW50IHNob3VsZCBiZSBhIFR5cGUsIFsgVHlwZSBdLCBvciBhIHNjaGVtYSBkZWZpbml0aW9uICh7IGltcGxpY2l0OiBbLi4uXSwgZXhwbGljaXQ6IFsuLi5dIH0pXCIpO1xuICB9XG4gIGltcGxpY2l0LmZvckVhY2goZnVuY3Rpb24odHlwZSQxKSB7XG4gICAgaWYgKCEodHlwZSQxIGluc3RhbmNlb2YgdHlwZSkpIHtcbiAgICAgIHRocm93IG5ldyBleGNlcHRpb24oXCJTcGVjaWZpZWQgbGlzdCBvZiBZQU1MIHR5cGVzIChvciBhIHNpbmdsZSBUeXBlIG9iamVjdCkgY29udGFpbnMgYSBub24tVHlwZSBvYmplY3QuXCIpO1xuICAgIH1cbiAgICBpZiAodHlwZSQxLmxvYWRLaW5kICYmIHR5cGUkMS5sb2FkS2luZCAhPT0gXCJzY2FsYXJcIikge1xuICAgICAgdGhyb3cgbmV3IGV4Y2VwdGlvbihcIlRoZXJlIGlzIGEgbm9uLXNjYWxhciB0eXBlIGluIHRoZSBpbXBsaWNpdCBsaXN0IG9mIGEgc2NoZW1hLiBJbXBsaWNpdCByZXNvbHZpbmcgb2Ygc3VjaCB0eXBlcyBpcyBub3Qgc3VwcG9ydGVkLlwiKTtcbiAgICB9XG4gICAgaWYgKHR5cGUkMS5tdWx0aSkge1xuICAgICAgdGhyb3cgbmV3IGV4Y2VwdGlvbihcIlRoZXJlIGlzIGEgbXVsdGkgdHlwZSBpbiB0aGUgaW1wbGljaXQgbGlzdCBvZiBhIHNjaGVtYS4gTXVsdGkgdGFncyBjYW4gb25seSBiZSBsaXN0ZWQgYXMgZXhwbGljaXQuXCIpO1xuICAgIH1cbiAgfSk7XG4gIGV4cGxpY2l0LmZvckVhY2goZnVuY3Rpb24odHlwZSQxKSB7XG4gICAgaWYgKCEodHlwZSQxIGluc3RhbmNlb2YgdHlwZSkpIHtcbiAgICAgIHRocm93IG5ldyBleGNlcHRpb24oXCJTcGVjaWZpZWQgbGlzdCBvZiBZQU1MIHR5cGVzIChvciBhIHNpbmdsZSBUeXBlIG9iamVjdCkgY29udGFpbnMgYSBub24tVHlwZSBvYmplY3QuXCIpO1xuICAgIH1cbiAgfSk7XG4gIHZhciByZXN1bHQgPSBPYmplY3QuY3JlYXRlKFNjaGVtYSQxLnByb3RvdHlwZSk7XG4gIHJlc3VsdC5pbXBsaWNpdCA9ICh0aGlzLmltcGxpY2l0IHx8IFtdKS5jb25jYXQoaW1wbGljaXQpO1xuICByZXN1bHQuZXhwbGljaXQgPSAodGhpcy5leHBsaWNpdCB8fCBbXSkuY29uY2F0KGV4cGxpY2l0KTtcbiAgcmVzdWx0LmNvbXBpbGVkSW1wbGljaXQgPSBjb21waWxlTGlzdChyZXN1bHQsIFwiaW1wbGljaXRcIik7XG4gIHJlc3VsdC5jb21waWxlZEV4cGxpY2l0ID0gY29tcGlsZUxpc3QocmVzdWx0LCBcImV4cGxpY2l0XCIpO1xuICByZXN1bHQuY29tcGlsZWRUeXBlTWFwID0gY29tcGlsZU1hcChyZXN1bHQuY29tcGlsZWRJbXBsaWNpdCwgcmVzdWx0LmNvbXBpbGVkRXhwbGljaXQpO1xuICByZXR1cm4gcmVzdWx0O1xufSwgXCJleHRlbmRcIik7XG52YXIgc2NoZW1hID0gU2NoZW1hJDE7XG52YXIgc3RyID0gbmV3IHR5cGUoXCJ0YWc6eWFtbC5vcmcsMjAwMjpzdHJcIiwge1xuICBraW5kOiBcInNjYWxhclwiLFxuICBjb25zdHJ1Y3Q6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBkYXRhICE9PSBudWxsID8gZGF0YSA6IFwiXCI7XG4gIH0sIFwiY29uc3RydWN0XCIpXG59KTtcbnZhciBzZXEgPSBuZXcgdHlwZShcInRhZzp5YW1sLm9yZywyMDAyOnNlcVwiLCB7XG4gIGtpbmQ6IFwic2VxdWVuY2VcIixcbiAgY29uc3RydWN0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gZGF0YSAhPT0gbnVsbCA/IGRhdGEgOiBbXTtcbiAgfSwgXCJjb25zdHJ1Y3RcIilcbn0pO1xudmFyIG1hcCA9IG5ldyB0eXBlKFwidGFnOnlhbWwub3JnLDIwMDI6bWFwXCIsIHtcbiAga2luZDogXCJtYXBwaW5nXCIsXG4gIGNvbnN0cnVjdDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuIGRhdGEgIT09IG51bGwgPyBkYXRhIDoge307XG4gIH0sIFwiY29uc3RydWN0XCIpXG59KTtcbnZhciBmYWlsc2FmZSA9IG5ldyBzY2hlbWEoe1xuICBleHBsaWNpdDogW1xuICAgIHN0cixcbiAgICBzZXEsXG4gICAgbWFwXG4gIF1cbn0pO1xuZnVuY3Rpb24gcmVzb2x2ZVlhbWxOdWxsKGRhdGEpIHtcbiAgaWYgKGRhdGEgPT09IG51bGwpIHJldHVybiB0cnVlO1xuICB2YXIgbWF4ID0gZGF0YS5sZW5ndGg7XG4gIHJldHVybiBtYXggPT09IDEgJiYgZGF0YSA9PT0gXCJ+XCIgfHwgbWF4ID09PSA0ICYmIChkYXRhID09PSBcIm51bGxcIiB8fCBkYXRhID09PSBcIk51bGxcIiB8fCBkYXRhID09PSBcIk5VTExcIik7XG59XG5fX25hbWUocmVzb2x2ZVlhbWxOdWxsLCBcInJlc29sdmVZYW1sTnVsbFwiKTtcbmZ1bmN0aW9uIGNvbnN0cnVjdFlhbWxOdWxsKCkge1xuICByZXR1cm4gbnVsbDtcbn1cbl9fbmFtZShjb25zdHJ1Y3RZYW1sTnVsbCwgXCJjb25zdHJ1Y3RZYW1sTnVsbFwiKTtcbmZ1bmN0aW9uIGlzTnVsbChvYmplY3QpIHtcbiAgcmV0dXJuIG9iamVjdCA9PT0gbnVsbDtcbn1cbl9fbmFtZShpc051bGwsIFwiaXNOdWxsXCIpO1xudmFyIF9udWxsID0gbmV3IHR5cGUoXCJ0YWc6eWFtbC5vcmcsMjAwMjpudWxsXCIsIHtcbiAga2luZDogXCJzY2FsYXJcIixcbiAgcmVzb2x2ZTogcmVzb2x2ZVlhbWxOdWxsLFxuICBjb25zdHJ1Y3Q6IGNvbnN0cnVjdFlhbWxOdWxsLFxuICBwcmVkaWNhdGU6IGlzTnVsbCxcbiAgcmVwcmVzZW50OiB7XG4gICAgY2Fub25pY2FsOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFwiflwiO1xuICAgIH0sIFwiY2Fub25pY2FsXCIpLFxuICAgIGxvd2VyY2FzZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBcIm51bGxcIjtcbiAgICB9LCBcImxvd2VyY2FzZVwiKSxcbiAgICB1cHBlcmNhc2U6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXCJOVUxMXCI7XG4gICAgfSwgXCJ1cHBlcmNhc2VcIiksXG4gICAgY2FtZWxjYXNlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFwiTnVsbFwiO1xuICAgIH0sIFwiY2FtZWxjYXNlXCIpLFxuICAgIGVtcHR5OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfSwgXCJlbXB0eVwiKVxuICB9LFxuICBkZWZhdWx0U3R5bGU6IFwibG93ZXJjYXNlXCJcbn0pO1xuZnVuY3Rpb24gcmVzb2x2ZVlhbWxCb29sZWFuKGRhdGEpIHtcbiAgaWYgKGRhdGEgPT09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgdmFyIG1heCA9IGRhdGEubGVuZ3RoO1xuICByZXR1cm4gbWF4ID09PSA0ICYmIChkYXRhID09PSBcInRydWVcIiB8fCBkYXRhID09PSBcIlRydWVcIiB8fCBkYXRhID09PSBcIlRSVUVcIikgfHwgbWF4ID09PSA1ICYmIChkYXRhID09PSBcImZhbHNlXCIgfHwgZGF0YSA9PT0gXCJGYWxzZVwiIHx8IGRhdGEgPT09IFwiRkFMU0VcIik7XG59XG5fX25hbWUocmVzb2x2ZVlhbWxCb29sZWFuLCBcInJlc29sdmVZYW1sQm9vbGVhblwiKTtcbmZ1bmN0aW9uIGNvbnN0cnVjdFlhbWxCb29sZWFuKGRhdGEpIHtcbiAgcmV0dXJuIGRhdGEgPT09IFwidHJ1ZVwiIHx8IGRhdGEgPT09IFwiVHJ1ZVwiIHx8IGRhdGEgPT09IFwiVFJVRVwiO1xufVxuX19uYW1lKGNvbnN0cnVjdFlhbWxCb29sZWFuLCBcImNvbnN0cnVjdFlhbWxCb29sZWFuXCIpO1xuZnVuY3Rpb24gaXNCb29sZWFuKG9iamVjdCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgPT09IFwiW29iamVjdCBCb29sZWFuXVwiO1xufVxuX19uYW1lKGlzQm9vbGVhbiwgXCJpc0Jvb2xlYW5cIik7XG52YXIgYm9vbCA9IG5ldyB0eXBlKFwidGFnOnlhbWwub3JnLDIwMDI6Ym9vbFwiLCB7XG4gIGtpbmQ6IFwic2NhbGFyXCIsXG4gIHJlc29sdmU6IHJlc29sdmVZYW1sQm9vbGVhbixcbiAgY29uc3RydWN0OiBjb25zdHJ1Y3RZYW1sQm9vbGVhbixcbiAgcHJlZGljYXRlOiBpc0Jvb2xlYW4sXG4gIHJlcHJlc2VudDoge1xuICAgIGxvd2VyY2FzZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihvYmplY3QpIHtcbiAgICAgIHJldHVybiBvYmplY3QgPyBcInRydWVcIiA6IFwiZmFsc2VcIjtcbiAgICB9LCBcImxvd2VyY2FzZVwiKSxcbiAgICB1cHBlcmNhc2U6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgICByZXR1cm4gb2JqZWN0ID8gXCJUUlVFXCIgOiBcIkZBTFNFXCI7XG4gICAgfSwgXCJ1cHBlcmNhc2VcIiksXG4gICAgY2FtZWxjYXNlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKG9iamVjdCkge1xuICAgICAgcmV0dXJuIG9iamVjdCA/IFwiVHJ1ZVwiIDogXCJGYWxzZVwiO1xuICAgIH0sIFwiY2FtZWxjYXNlXCIpXG4gIH0sXG4gIGRlZmF1bHRTdHlsZTogXCJsb3dlcmNhc2VcIlxufSk7XG5mdW5jdGlvbiBpc0hleENvZGUoYykge1xuICByZXR1cm4gNDggPD0gYyAmJiBjIDw9IDU3IHx8IDY1IDw9IGMgJiYgYyA8PSA3MCB8fCA5NyA8PSBjICYmIGMgPD0gMTAyO1xufVxuX19uYW1lKGlzSGV4Q29kZSwgXCJpc0hleENvZGVcIik7XG5mdW5jdGlvbiBpc09jdENvZGUoYykge1xuICByZXR1cm4gNDggPD0gYyAmJiBjIDw9IDU1O1xufVxuX19uYW1lKGlzT2N0Q29kZSwgXCJpc09jdENvZGVcIik7XG5mdW5jdGlvbiBpc0RlY0NvZGUoYykge1xuICByZXR1cm4gNDggPD0gYyAmJiBjIDw9IDU3O1xufVxuX19uYW1lKGlzRGVjQ29kZSwgXCJpc0RlY0NvZGVcIik7XG5mdW5jdGlvbiByZXNvbHZlWWFtbEludGVnZXIoZGF0YSkge1xuICBpZiAoZGF0YSA9PT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICB2YXIgbWF4ID0gZGF0YS5sZW5ndGgsIGluZGV4ID0gMCwgaGFzRGlnaXRzID0gZmFsc2UsIGNoO1xuICBpZiAoIW1heCkgcmV0dXJuIGZhbHNlO1xuICBjaCA9IGRhdGFbaW5kZXhdO1xuICBpZiAoY2ggPT09IFwiLVwiIHx8IGNoID09PSBcIitcIikge1xuICAgIGNoID0gZGF0YVsrK2luZGV4XTtcbiAgfVxuICBpZiAoY2ggPT09IFwiMFwiKSB7XG4gICAgaWYgKGluZGV4ICsgMSA9PT0gbWF4KSByZXR1cm4gdHJ1ZTtcbiAgICBjaCA9IGRhdGFbKytpbmRleF07XG4gICAgaWYgKGNoID09PSBcImJcIikge1xuICAgICAgaW5kZXgrKztcbiAgICAgIGZvciAoOyBpbmRleCA8IG1heDsgaW5kZXgrKykge1xuICAgICAgICBjaCA9IGRhdGFbaW5kZXhdO1xuICAgICAgICBpZiAoY2ggPT09IFwiX1wiKSBjb250aW51ZTtcbiAgICAgICAgaWYgKGNoICE9PSBcIjBcIiAmJiBjaCAhPT0gXCIxXCIpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaGFzRGlnaXRzID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBoYXNEaWdpdHMgJiYgY2ggIT09IFwiX1wiO1xuICAgIH1cbiAgICBpZiAoY2ggPT09IFwieFwiKSB7XG4gICAgICBpbmRleCsrO1xuICAgICAgZm9yICg7IGluZGV4IDwgbWF4OyBpbmRleCsrKSB7XG4gICAgICAgIGNoID0gZGF0YVtpbmRleF07XG4gICAgICAgIGlmIChjaCA9PT0gXCJfXCIpIGNvbnRpbnVlO1xuICAgICAgICBpZiAoIWlzSGV4Q29kZShkYXRhLmNoYXJDb2RlQXQoaW5kZXgpKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBoYXNEaWdpdHMgPSB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGhhc0RpZ2l0cyAmJiBjaCAhPT0gXCJfXCI7XG4gICAgfVxuICAgIGlmIChjaCA9PT0gXCJvXCIpIHtcbiAgICAgIGluZGV4Kys7XG4gICAgICBmb3IgKDsgaW5kZXggPCBtYXg7IGluZGV4KyspIHtcbiAgICAgICAgY2ggPSBkYXRhW2luZGV4XTtcbiAgICAgICAgaWYgKGNoID09PSBcIl9cIikgY29udGludWU7XG4gICAgICAgIGlmICghaXNPY3RDb2RlKGRhdGEuY2hhckNvZGVBdChpbmRleCkpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGhhc0RpZ2l0cyA9IHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gaGFzRGlnaXRzICYmIGNoICE9PSBcIl9cIjtcbiAgICB9XG4gIH1cbiAgaWYgKGNoID09PSBcIl9cIikgcmV0dXJuIGZhbHNlO1xuICBmb3IgKDsgaW5kZXggPCBtYXg7IGluZGV4KyspIHtcbiAgICBjaCA9IGRhdGFbaW5kZXhdO1xuICAgIGlmIChjaCA9PT0gXCJfXCIpIGNvbnRpbnVlO1xuICAgIGlmICghaXNEZWNDb2RlKGRhdGEuY2hhckNvZGVBdChpbmRleCkpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGhhc0RpZ2l0cyA9IHRydWU7XG4gIH1cbiAgaWYgKCFoYXNEaWdpdHMgfHwgY2ggPT09IFwiX1wiKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiB0cnVlO1xufVxuX19uYW1lKHJlc29sdmVZYW1sSW50ZWdlciwgXCJyZXNvbHZlWWFtbEludGVnZXJcIik7XG5mdW5jdGlvbiBjb25zdHJ1Y3RZYW1sSW50ZWdlcihkYXRhKSB7XG4gIHZhciB2YWx1ZSA9IGRhdGEsIHNpZ24gPSAxLCBjaDtcbiAgaWYgKHZhbHVlLmluZGV4T2YoXCJfXCIpICE9PSAtMSkge1xuICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvXy9nLCBcIlwiKTtcbiAgfVxuICBjaCA9IHZhbHVlWzBdO1xuICBpZiAoY2ggPT09IFwiLVwiIHx8IGNoID09PSBcIitcIikge1xuICAgIGlmIChjaCA9PT0gXCItXCIpIHNpZ24gPSAtMTtcbiAgICB2YWx1ZSA9IHZhbHVlLnNsaWNlKDEpO1xuICAgIGNoID0gdmFsdWVbMF07XG4gIH1cbiAgaWYgKHZhbHVlID09PSBcIjBcIikgcmV0dXJuIDA7XG4gIGlmIChjaCA9PT0gXCIwXCIpIHtcbiAgICBpZiAodmFsdWVbMV0gPT09IFwiYlwiKSByZXR1cm4gc2lnbiAqIHBhcnNlSW50KHZhbHVlLnNsaWNlKDIpLCAyKTtcbiAgICBpZiAodmFsdWVbMV0gPT09IFwieFwiKSByZXR1cm4gc2lnbiAqIHBhcnNlSW50KHZhbHVlLnNsaWNlKDIpLCAxNik7XG4gICAgaWYgKHZhbHVlWzFdID09PSBcIm9cIikgcmV0dXJuIHNpZ24gKiBwYXJzZUludCh2YWx1ZS5zbGljZSgyKSwgOCk7XG4gIH1cbiAgcmV0dXJuIHNpZ24gKiBwYXJzZUludCh2YWx1ZSwgMTApO1xufVxuX19uYW1lKGNvbnN0cnVjdFlhbWxJbnRlZ2VyLCBcImNvbnN0cnVjdFlhbWxJbnRlZ2VyXCIpO1xuZnVuY3Rpb24gaXNJbnRlZ2VyKG9iamVjdCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgPT09IFwiW29iamVjdCBOdW1iZXJdXCIgJiYgKG9iamVjdCAlIDEgPT09IDAgJiYgIWNvbW1vbi5pc05lZ2F0aXZlWmVybyhvYmplY3QpKTtcbn1cbl9fbmFtZShpc0ludGVnZXIsIFwiaXNJbnRlZ2VyXCIpO1xudmFyIGludCA9IG5ldyB0eXBlKFwidGFnOnlhbWwub3JnLDIwMDI6aW50XCIsIHtcbiAga2luZDogXCJzY2FsYXJcIixcbiAgcmVzb2x2ZTogcmVzb2x2ZVlhbWxJbnRlZ2VyLFxuICBjb25zdHJ1Y3Q6IGNvbnN0cnVjdFlhbWxJbnRlZ2VyLFxuICBwcmVkaWNhdGU6IGlzSW50ZWdlcixcbiAgcmVwcmVzZW50OiB7XG4gICAgYmluYXJ5OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiA+PSAwID8gXCIwYlwiICsgb2JqLnRvU3RyaW5nKDIpIDogXCItMGJcIiArIG9iai50b1N0cmluZygyKS5zbGljZSgxKTtcbiAgICB9LCBcImJpbmFyeVwiKSxcbiAgICBvY3RhbDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmogPj0gMCA/IFwiMG9cIiArIG9iai50b1N0cmluZyg4KSA6IFwiLTBvXCIgKyBvYmoudG9TdHJpbmcoOCkuc2xpY2UoMSk7XG4gICAgfSwgXCJvY3RhbFwiKSxcbiAgICBkZWNpbWFsOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9iai50b1N0cmluZygxMCk7XG4gICAgfSwgXCJkZWNpbWFsXCIpLFxuICAgIC8qIGVzbGludC1kaXNhYmxlIG1heC1sZW4gKi9cbiAgICBoZXhhZGVjaW1hbDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmogPj0gMCA/IFwiMHhcIiArIG9iai50b1N0cmluZygxNikudG9VcHBlckNhc2UoKSA6IFwiLTB4XCIgKyBvYmoudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCkuc2xpY2UoMSk7XG4gICAgfSwgXCJoZXhhZGVjaW1hbFwiKVxuICB9LFxuICBkZWZhdWx0U3R5bGU6IFwiZGVjaW1hbFwiLFxuICBzdHlsZUFsaWFzZXM6IHtcbiAgICBiaW5hcnk6IFsyLCBcImJpblwiXSxcbiAgICBvY3RhbDogWzgsIFwib2N0XCJdLFxuICAgIGRlY2ltYWw6IFsxMCwgXCJkZWNcIl0sXG4gICAgaGV4YWRlY2ltYWw6IFsxNiwgXCJoZXhcIl1cbiAgfVxufSk7XG52YXIgWUFNTF9GTE9BVF9QQVRURVJOID0gbmV3IFJlZ0V4cChcbiAgLy8gMi41ZTQsIDIuNSBhbmQgaW50ZWdlcnNcbiAgXCJeKD86Wy0rXT8oPzpbMC05XVswLTlfXSopKD86XFxcXC5bMC05X10qKT8oPzpbZUVdWy0rXT9bMC05XSspP3xcXFxcLlswLTlfXSsoPzpbZUVdWy0rXT9bMC05XSspP3xbLStdP1xcXFwuKD86aW5mfEluZnxJTkYpfFxcXFwuKD86bmFufE5hTnxOQU4pKSRcIlxuKTtcbmZ1bmN0aW9uIHJlc29sdmVZYW1sRmxvYXQoZGF0YSkge1xuICBpZiAoZGF0YSA9PT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICBpZiAoIVlBTUxfRkxPQVRfUEFUVEVSTi50ZXN0KGRhdGEpIHx8IC8vIFF1aWNrIGhhY2sgdG8gbm90IGFsbG93IGludGVnZXJzIGVuZCB3aXRoIGBfYFxuICAvLyBQcm9iYWJseSBzaG91bGQgdXBkYXRlIHJlZ2V4cCAmIGNoZWNrIHNwZWVkXG4gIGRhdGFbZGF0YS5sZW5ndGggLSAxXSA9PT0gXCJfXCIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5fX25hbWUocmVzb2x2ZVlhbWxGbG9hdCwgXCJyZXNvbHZlWWFtbEZsb2F0XCIpO1xuZnVuY3Rpb24gY29uc3RydWN0WWFtbEZsb2F0KGRhdGEpIHtcbiAgdmFyIHZhbHVlLCBzaWduO1xuICB2YWx1ZSA9IGRhdGEucmVwbGFjZSgvXy9nLCBcIlwiKS50b0xvd2VyQ2FzZSgpO1xuICBzaWduID0gdmFsdWVbMF0gPT09IFwiLVwiID8gLTEgOiAxO1xuICBpZiAoXCIrLVwiLmluZGV4T2YodmFsdWVbMF0pID49IDApIHtcbiAgICB2YWx1ZSA9IHZhbHVlLnNsaWNlKDEpO1xuICB9XG4gIGlmICh2YWx1ZSA9PT0gXCIuaW5mXCIpIHtcbiAgICByZXR1cm4gc2lnbiA9PT0gMSA/IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSA6IE51bWJlci5ORUdBVElWRV9JTkZJTklUWTtcbiAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gXCIubmFuXCIpIHtcbiAgICByZXR1cm4gTmFOO1xuICB9XG4gIHJldHVybiBzaWduICogcGFyc2VGbG9hdCh2YWx1ZSwgMTApO1xufVxuX19uYW1lKGNvbnN0cnVjdFlhbWxGbG9hdCwgXCJjb25zdHJ1Y3RZYW1sRmxvYXRcIik7XG52YXIgU0NJRU5USUZJQ19XSVRIT1VUX0RPVCA9IC9eWy0rXT9bMC05XStlLztcbmZ1bmN0aW9uIHJlcHJlc2VudFlhbWxGbG9hdChvYmplY3QsIHN0eWxlKSB7XG4gIHZhciByZXM7XG4gIGlmIChpc05hTihvYmplY3QpKSB7XG4gICAgc3dpdGNoIChzdHlsZSkge1xuICAgICAgY2FzZSBcImxvd2VyY2FzZVwiOlxuICAgICAgICByZXR1cm4gXCIubmFuXCI7XG4gICAgICBjYXNlIFwidXBwZXJjYXNlXCI6XG4gICAgICAgIHJldHVybiBcIi5OQU5cIjtcbiAgICAgIGNhc2UgXCJjYW1lbGNhc2VcIjpcbiAgICAgICAgcmV0dXJuIFwiLk5hTlwiO1xuICAgIH1cbiAgfSBlbHNlIGlmIChOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgPT09IG9iamVjdCkge1xuICAgIHN3aXRjaCAoc3R5bGUpIHtcbiAgICAgIGNhc2UgXCJsb3dlcmNhc2VcIjpcbiAgICAgICAgcmV0dXJuIFwiLmluZlwiO1xuICAgICAgY2FzZSBcInVwcGVyY2FzZVwiOlxuICAgICAgICByZXR1cm4gXCIuSU5GXCI7XG4gICAgICBjYXNlIFwiY2FtZWxjYXNlXCI6XG4gICAgICAgIHJldHVybiBcIi5JbmZcIjtcbiAgICB9XG4gIH0gZWxzZSBpZiAoTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZID09PSBvYmplY3QpIHtcbiAgICBzd2l0Y2ggKHN0eWxlKSB7XG4gICAgICBjYXNlIFwibG93ZXJjYXNlXCI6XG4gICAgICAgIHJldHVybiBcIi0uaW5mXCI7XG4gICAgICBjYXNlIFwidXBwZXJjYXNlXCI6XG4gICAgICAgIHJldHVybiBcIi0uSU5GXCI7XG4gICAgICBjYXNlIFwiY2FtZWxjYXNlXCI6XG4gICAgICAgIHJldHVybiBcIi0uSW5mXCI7XG4gICAgfVxuICB9IGVsc2UgaWYgKGNvbW1vbi5pc05lZ2F0aXZlWmVybyhvYmplY3QpKSB7XG4gICAgcmV0dXJuIFwiLTAuMFwiO1xuICB9XG4gIHJlcyA9IG9iamVjdC50b1N0cmluZygxMCk7XG4gIHJldHVybiBTQ0lFTlRJRklDX1dJVEhPVVRfRE9ULnRlc3QocmVzKSA/IHJlcy5yZXBsYWNlKFwiZVwiLCBcIi5lXCIpIDogcmVzO1xufVxuX19uYW1lKHJlcHJlc2VudFlhbWxGbG9hdCwgXCJyZXByZXNlbnRZYW1sRmxvYXRcIik7XG5mdW5jdGlvbiBpc0Zsb2F0KG9iamVjdCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgPT09IFwiW29iamVjdCBOdW1iZXJdXCIgJiYgKG9iamVjdCAlIDEgIT09IDAgfHwgY29tbW9uLmlzTmVnYXRpdmVaZXJvKG9iamVjdCkpO1xufVxuX19uYW1lKGlzRmxvYXQsIFwiaXNGbG9hdFwiKTtcbnZhciBmbG9hdCA9IG5ldyB0eXBlKFwidGFnOnlhbWwub3JnLDIwMDI6ZmxvYXRcIiwge1xuICBraW5kOiBcInNjYWxhclwiLFxuICByZXNvbHZlOiByZXNvbHZlWWFtbEZsb2F0LFxuICBjb25zdHJ1Y3Q6IGNvbnN0cnVjdFlhbWxGbG9hdCxcbiAgcHJlZGljYXRlOiBpc0Zsb2F0LFxuICByZXByZXNlbnQ6IHJlcHJlc2VudFlhbWxGbG9hdCxcbiAgZGVmYXVsdFN0eWxlOiBcImxvd2VyY2FzZVwiXG59KTtcbnZhciBqc29uID0gZmFpbHNhZmUuZXh0ZW5kKHtcbiAgaW1wbGljaXQ6IFtcbiAgICBfbnVsbCxcbiAgICBib29sLFxuICAgIGludCxcbiAgICBmbG9hdFxuICBdXG59KTtcbnZhciBjb3JlID0ganNvbjtcbnZhciBZQU1MX0RBVEVfUkVHRVhQID0gbmV3IFJlZ0V4cChcbiAgXCJeKFswLTldWzAtOV1bMC05XVswLTldKS0oWzAtOV1bMC05XSktKFswLTldWzAtOV0pJFwiXG4pO1xudmFyIFlBTUxfVElNRVNUQU1QX1JFR0VYUCA9IG5ldyBSZWdFeHAoXG4gIFwiXihbMC05XVswLTldWzAtOV1bMC05XSktKFswLTldWzAtOV0/KS0oWzAtOV1bMC05XT8pKD86W1R0XXxbIFxcXFx0XSspKFswLTldWzAtOV0/KTooWzAtOV1bMC05XSk6KFswLTldWzAtOV0pKD86XFxcXC4oWzAtOV0qKSk/KD86WyBcXFxcdF0qKFp8KFstK10pKFswLTldWzAtOV0/KSg/OjooWzAtOV1bMC05XSkpPykpPyRcIlxuKTtcbmZ1bmN0aW9uIHJlc29sdmVZYW1sVGltZXN0YW1wKGRhdGEpIHtcbiAgaWYgKGRhdGEgPT09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgaWYgKFlBTUxfREFURV9SRUdFWFAuZXhlYyhkYXRhKSAhPT0gbnVsbCkgcmV0dXJuIHRydWU7XG4gIGlmIChZQU1MX1RJTUVTVEFNUF9SRUdFWFAuZXhlYyhkYXRhKSAhPT0gbnVsbCkgcmV0dXJuIHRydWU7XG4gIHJldHVybiBmYWxzZTtcbn1cbl9fbmFtZShyZXNvbHZlWWFtbFRpbWVzdGFtcCwgXCJyZXNvbHZlWWFtbFRpbWVzdGFtcFwiKTtcbmZ1bmN0aW9uIGNvbnN0cnVjdFlhbWxUaW1lc3RhbXAoZGF0YSkge1xuICB2YXIgbWF0Y2gsIHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBmcmFjdGlvbiA9IDAsIGRlbHRhID0gbnVsbCwgdHpfaG91ciwgdHpfbWludXRlLCBkYXRlO1xuICBtYXRjaCA9IFlBTUxfREFURV9SRUdFWFAuZXhlYyhkYXRhKTtcbiAgaWYgKG1hdGNoID09PSBudWxsKSBtYXRjaCA9IFlBTUxfVElNRVNUQU1QX1JFR0VYUC5leGVjKGRhdGEpO1xuICBpZiAobWF0Y2ggPT09IG51bGwpIHRocm93IG5ldyBFcnJvcihcIkRhdGUgcmVzb2x2ZSBlcnJvclwiKTtcbiAgeWVhciA9ICttYXRjaFsxXTtcbiAgbW9udGggPSArbWF0Y2hbMl0gLSAxO1xuICBkYXkgPSArbWF0Y2hbM107XG4gIGlmICghbWF0Y2hbNF0pIHtcbiAgICByZXR1cm4gbmV3IERhdGUoRGF0ZS5VVEMoeWVhciwgbW9udGgsIGRheSkpO1xuICB9XG4gIGhvdXIgPSArbWF0Y2hbNF07XG4gIG1pbnV0ZSA9ICttYXRjaFs1XTtcbiAgc2Vjb25kID0gK21hdGNoWzZdO1xuICBpZiAobWF0Y2hbN10pIHtcbiAgICBmcmFjdGlvbiA9IG1hdGNoWzddLnNsaWNlKDAsIDMpO1xuICAgIHdoaWxlIChmcmFjdGlvbi5sZW5ndGggPCAzKSB7XG4gICAgICBmcmFjdGlvbiArPSBcIjBcIjtcbiAgICB9XG4gICAgZnJhY3Rpb24gPSArZnJhY3Rpb247XG4gIH1cbiAgaWYgKG1hdGNoWzldKSB7XG4gICAgdHpfaG91ciA9ICttYXRjaFsxMF07XG4gICAgdHpfbWludXRlID0gKyhtYXRjaFsxMV0gfHwgMCk7XG4gICAgZGVsdGEgPSAodHpfaG91ciAqIDYwICsgdHpfbWludXRlKSAqIDZlNDtcbiAgICBpZiAobWF0Y2hbOV0gPT09IFwiLVwiKSBkZWx0YSA9IC1kZWx0YTtcbiAgfVxuICBkYXRlID0gbmV3IERhdGUoRGF0ZS5VVEMoeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIGZyYWN0aW9uKSk7XG4gIGlmIChkZWx0YSkgZGF0ZS5zZXRUaW1lKGRhdGUuZ2V0VGltZSgpIC0gZGVsdGEpO1xuICByZXR1cm4gZGF0ZTtcbn1cbl9fbmFtZShjb25zdHJ1Y3RZYW1sVGltZXN0YW1wLCBcImNvbnN0cnVjdFlhbWxUaW1lc3RhbXBcIik7XG5mdW5jdGlvbiByZXByZXNlbnRZYW1sVGltZXN0YW1wKG9iamVjdCkge1xuICByZXR1cm4gb2JqZWN0LnRvSVNPU3RyaW5nKCk7XG59XG5fX25hbWUocmVwcmVzZW50WWFtbFRpbWVzdGFtcCwgXCJyZXByZXNlbnRZYW1sVGltZXN0YW1wXCIpO1xudmFyIHRpbWVzdGFtcCA9IG5ldyB0eXBlKFwidGFnOnlhbWwub3JnLDIwMDI6dGltZXN0YW1wXCIsIHtcbiAga2luZDogXCJzY2FsYXJcIixcbiAgcmVzb2x2ZTogcmVzb2x2ZVlhbWxUaW1lc3RhbXAsXG4gIGNvbnN0cnVjdDogY29uc3RydWN0WWFtbFRpbWVzdGFtcCxcbiAgaW5zdGFuY2VPZjogRGF0ZSxcbiAgcmVwcmVzZW50OiByZXByZXNlbnRZYW1sVGltZXN0YW1wXG59KTtcbmZ1bmN0aW9uIHJlc29sdmVZYW1sTWVyZ2UoZGF0YSkge1xuICByZXR1cm4gZGF0YSA9PT0gXCI8PFwiIHx8IGRhdGEgPT09IG51bGw7XG59XG5fX25hbWUocmVzb2x2ZVlhbWxNZXJnZSwgXCJyZXNvbHZlWWFtbE1lcmdlXCIpO1xudmFyIG1lcmdlID0gbmV3IHR5cGUoXCJ0YWc6eWFtbC5vcmcsMjAwMjptZXJnZVwiLCB7XG4gIGtpbmQ6IFwic2NhbGFyXCIsXG4gIHJlc29sdmU6IHJlc29sdmVZYW1sTWVyZ2Vcbn0pO1xudmFyIEJBU0U2NF9NQVAgPSBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky89XFxuXFxyXCI7XG5mdW5jdGlvbiByZXNvbHZlWWFtbEJpbmFyeShkYXRhKSB7XG4gIGlmIChkYXRhID09PSBudWxsKSByZXR1cm4gZmFsc2U7XG4gIHZhciBjb2RlLCBpZHgsIGJpdGxlbiA9IDAsIG1heCA9IGRhdGEubGVuZ3RoLCBtYXAyID0gQkFTRTY0X01BUDtcbiAgZm9yIChpZHggPSAwOyBpZHggPCBtYXg7IGlkeCsrKSB7XG4gICAgY29kZSA9IG1hcDIuaW5kZXhPZihkYXRhLmNoYXJBdChpZHgpKTtcbiAgICBpZiAoY29kZSA+IDY0KSBjb250aW51ZTtcbiAgICBpZiAoY29kZSA8IDApIHJldHVybiBmYWxzZTtcbiAgICBiaXRsZW4gKz0gNjtcbiAgfVxuICByZXR1cm4gYml0bGVuICUgOCA9PT0gMDtcbn1cbl9fbmFtZShyZXNvbHZlWWFtbEJpbmFyeSwgXCJyZXNvbHZlWWFtbEJpbmFyeVwiKTtcbmZ1bmN0aW9uIGNvbnN0cnVjdFlhbWxCaW5hcnkoZGF0YSkge1xuICB2YXIgaWR4LCB0YWlsYml0cywgaW5wdXQgPSBkYXRhLnJlcGxhY2UoL1tcXHJcXG49XS9nLCBcIlwiKSwgbWF4ID0gaW5wdXQubGVuZ3RoLCBtYXAyID0gQkFTRTY0X01BUCwgYml0cyA9IDAsIHJlc3VsdCA9IFtdO1xuICBmb3IgKGlkeCA9IDA7IGlkeCA8IG1heDsgaWR4KyspIHtcbiAgICBpZiAoaWR4ICUgNCA9PT0gMCAmJiBpZHgpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGJpdHMgPj4gMTYgJiAyNTUpO1xuICAgICAgcmVzdWx0LnB1c2goYml0cyA+PiA4ICYgMjU1KTtcbiAgICAgIHJlc3VsdC5wdXNoKGJpdHMgJiAyNTUpO1xuICAgIH1cbiAgICBiaXRzID0gYml0cyA8PCA2IHwgbWFwMi5pbmRleE9mKGlucHV0LmNoYXJBdChpZHgpKTtcbiAgfVxuICB0YWlsYml0cyA9IG1heCAlIDQgKiA2O1xuICBpZiAodGFpbGJpdHMgPT09IDApIHtcbiAgICByZXN1bHQucHVzaChiaXRzID4+IDE2ICYgMjU1KTtcbiAgICByZXN1bHQucHVzaChiaXRzID4+IDggJiAyNTUpO1xuICAgIHJlc3VsdC5wdXNoKGJpdHMgJiAyNTUpO1xuICB9IGVsc2UgaWYgKHRhaWxiaXRzID09PSAxOCkge1xuICAgIHJlc3VsdC5wdXNoKGJpdHMgPj4gMTAgJiAyNTUpO1xuICAgIHJlc3VsdC5wdXNoKGJpdHMgPj4gMiAmIDI1NSk7XG4gIH0gZWxzZSBpZiAodGFpbGJpdHMgPT09IDEyKSB7XG4gICAgcmVzdWx0LnB1c2goYml0cyA+PiA0ICYgMjU1KTtcbiAgfVxuICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkocmVzdWx0KTtcbn1cbl9fbmFtZShjb25zdHJ1Y3RZYW1sQmluYXJ5LCBcImNvbnN0cnVjdFlhbWxCaW5hcnlcIik7XG5mdW5jdGlvbiByZXByZXNlbnRZYW1sQmluYXJ5KG9iamVjdCkge1xuICB2YXIgcmVzdWx0ID0gXCJcIiwgYml0cyA9IDAsIGlkeCwgdGFpbCwgbWF4ID0gb2JqZWN0Lmxlbmd0aCwgbWFwMiA9IEJBU0U2NF9NQVA7XG4gIGZvciAoaWR4ID0gMDsgaWR4IDwgbWF4OyBpZHgrKykge1xuICAgIGlmIChpZHggJSAzID09PSAwICYmIGlkeCkge1xuICAgICAgcmVzdWx0ICs9IG1hcDJbYml0cyA+PiAxOCAmIDYzXTtcbiAgICAgIHJlc3VsdCArPSBtYXAyW2JpdHMgPj4gMTIgJiA2M107XG4gICAgICByZXN1bHQgKz0gbWFwMltiaXRzID4+IDYgJiA2M107XG4gICAgICByZXN1bHQgKz0gbWFwMltiaXRzICYgNjNdO1xuICAgIH1cbiAgICBiaXRzID0gKGJpdHMgPDwgOCkgKyBvYmplY3RbaWR4XTtcbiAgfVxuICB0YWlsID0gbWF4ICUgMztcbiAgaWYgKHRhaWwgPT09IDApIHtcbiAgICByZXN1bHQgKz0gbWFwMltiaXRzID4+IDE4ICYgNjNdO1xuICAgIHJlc3VsdCArPSBtYXAyW2JpdHMgPj4gMTIgJiA2M107XG4gICAgcmVzdWx0ICs9IG1hcDJbYml0cyA+PiA2ICYgNjNdO1xuICAgIHJlc3VsdCArPSBtYXAyW2JpdHMgJiA2M107XG4gIH0gZWxzZSBpZiAodGFpbCA9PT0gMikge1xuICAgIHJlc3VsdCArPSBtYXAyW2JpdHMgPj4gMTAgJiA2M107XG4gICAgcmVzdWx0ICs9IG1hcDJbYml0cyA+PiA0ICYgNjNdO1xuICAgIHJlc3VsdCArPSBtYXAyW2JpdHMgPDwgMiAmIDYzXTtcbiAgICByZXN1bHQgKz0gbWFwMls2NF07XG4gIH0gZWxzZSBpZiAodGFpbCA9PT0gMSkge1xuICAgIHJlc3VsdCArPSBtYXAyW2JpdHMgPj4gMiAmIDYzXTtcbiAgICByZXN1bHQgKz0gbWFwMltiaXRzIDw8IDQgJiA2M107XG4gICAgcmVzdWx0ICs9IG1hcDJbNjRdO1xuICAgIHJlc3VsdCArPSBtYXAyWzY0XTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuX19uYW1lKHJlcHJlc2VudFlhbWxCaW5hcnksIFwicmVwcmVzZW50WWFtbEJpbmFyeVwiKTtcbmZ1bmN0aW9uIGlzQmluYXJ5KG9iaikge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09IFwiW29iamVjdCBVaW50OEFycmF5XVwiO1xufVxuX19uYW1lKGlzQmluYXJ5LCBcImlzQmluYXJ5XCIpO1xudmFyIGJpbmFyeSA9IG5ldyB0eXBlKFwidGFnOnlhbWwub3JnLDIwMDI6YmluYXJ5XCIsIHtcbiAga2luZDogXCJzY2FsYXJcIixcbiAgcmVzb2x2ZTogcmVzb2x2ZVlhbWxCaW5hcnksXG4gIGNvbnN0cnVjdDogY29uc3RydWN0WWFtbEJpbmFyeSxcbiAgcHJlZGljYXRlOiBpc0JpbmFyeSxcbiAgcmVwcmVzZW50OiByZXByZXNlbnRZYW1sQmluYXJ5XG59KTtcbnZhciBfaGFzT3duUHJvcGVydHkkMyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgX3RvU3RyaW5nJDIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuZnVuY3Rpb24gcmVzb2x2ZVlhbWxPbWFwKGRhdGEpIHtcbiAgaWYgKGRhdGEgPT09IG51bGwpIHJldHVybiB0cnVlO1xuICB2YXIgb2JqZWN0S2V5cyA9IFtdLCBpbmRleCwgbGVuZ3RoLCBwYWlyLCBwYWlyS2V5LCBwYWlySGFzS2V5LCBvYmplY3QgPSBkYXRhO1xuICBmb3IgKGluZGV4ID0gMCwgbGVuZ3RoID0gb2JqZWN0Lmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBwYWlyID0gb2JqZWN0W2luZGV4XTtcbiAgICBwYWlySGFzS2V5ID0gZmFsc2U7XG4gICAgaWYgKF90b1N0cmluZyQyLmNhbGwocGFpcikgIT09IFwiW29iamVjdCBPYmplY3RdXCIpIHJldHVybiBmYWxzZTtcbiAgICBmb3IgKHBhaXJLZXkgaW4gcGFpcikge1xuICAgICAgaWYgKF9oYXNPd25Qcm9wZXJ0eSQzLmNhbGwocGFpciwgcGFpcktleSkpIHtcbiAgICAgICAgaWYgKCFwYWlySGFzS2V5KSBwYWlySGFzS2V5ID0gdHJ1ZTtcbiAgICAgICAgZWxzZSByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghcGFpckhhc0tleSkgcmV0dXJuIGZhbHNlO1xuICAgIGlmIChvYmplY3RLZXlzLmluZGV4T2YocGFpcktleSkgPT09IC0xKSBvYmplY3RLZXlzLnB1c2gocGFpcktleSk7XG4gICAgZWxzZSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5fX25hbWUocmVzb2x2ZVlhbWxPbWFwLCBcInJlc29sdmVZYW1sT21hcFwiKTtcbmZ1bmN0aW9uIGNvbnN0cnVjdFlhbWxPbWFwKGRhdGEpIHtcbiAgcmV0dXJuIGRhdGEgIT09IG51bGwgPyBkYXRhIDogW107XG59XG5fX25hbWUoY29uc3RydWN0WWFtbE9tYXAsIFwiY29uc3RydWN0WWFtbE9tYXBcIik7XG52YXIgb21hcCA9IG5ldyB0eXBlKFwidGFnOnlhbWwub3JnLDIwMDI6b21hcFwiLCB7XG4gIGtpbmQ6IFwic2VxdWVuY2VcIixcbiAgcmVzb2x2ZTogcmVzb2x2ZVlhbWxPbWFwLFxuICBjb25zdHJ1Y3Q6IGNvbnN0cnVjdFlhbWxPbWFwXG59KTtcbnZhciBfdG9TdHJpbmckMSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5mdW5jdGlvbiByZXNvbHZlWWFtbFBhaXJzKGRhdGEpIHtcbiAgaWYgKGRhdGEgPT09IG51bGwpIHJldHVybiB0cnVlO1xuICB2YXIgaW5kZXgsIGxlbmd0aCwgcGFpciwga2V5cywgcmVzdWx0LCBvYmplY3QgPSBkYXRhO1xuICByZXN1bHQgPSBuZXcgQXJyYXkob2JqZWN0Lmxlbmd0aCk7XG4gIGZvciAoaW5kZXggPSAwLCBsZW5ndGggPSBvYmplY3QubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgIHBhaXIgPSBvYmplY3RbaW5kZXhdO1xuICAgIGlmIChfdG9TdHJpbmckMS5jYWxsKHBhaXIpICE9PSBcIltvYmplY3QgT2JqZWN0XVwiKSByZXR1cm4gZmFsc2U7XG4gICAga2V5cyA9IE9iamVjdC5rZXlzKHBhaXIpO1xuICAgIGlmIChrZXlzLmxlbmd0aCAhPT0gMSkgcmV0dXJuIGZhbHNlO1xuICAgIHJlc3VsdFtpbmRleF0gPSBba2V5c1swXSwgcGFpcltrZXlzWzBdXV07XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5fX25hbWUocmVzb2x2ZVlhbWxQYWlycywgXCJyZXNvbHZlWWFtbFBhaXJzXCIpO1xuZnVuY3Rpb24gY29uc3RydWN0WWFtbFBhaXJzKGRhdGEpIHtcbiAgaWYgKGRhdGEgPT09IG51bGwpIHJldHVybiBbXTtcbiAgdmFyIGluZGV4LCBsZW5ndGgsIHBhaXIsIGtleXMsIHJlc3VsdCwgb2JqZWN0ID0gZGF0YTtcbiAgcmVzdWx0ID0gbmV3IEFycmF5KG9iamVjdC5sZW5ndGgpO1xuICBmb3IgKGluZGV4ID0gMCwgbGVuZ3RoID0gb2JqZWN0Lmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBwYWlyID0gb2JqZWN0W2luZGV4XTtcbiAgICBrZXlzID0gT2JqZWN0LmtleXMocGFpcik7XG4gICAgcmVzdWx0W2luZGV4XSA9IFtrZXlzWzBdLCBwYWlyW2tleXNbMF1dXTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuX19uYW1lKGNvbnN0cnVjdFlhbWxQYWlycywgXCJjb25zdHJ1Y3RZYW1sUGFpcnNcIik7XG52YXIgcGFpcnMgPSBuZXcgdHlwZShcInRhZzp5YW1sLm9yZywyMDAyOnBhaXJzXCIsIHtcbiAga2luZDogXCJzZXF1ZW5jZVwiLFxuICByZXNvbHZlOiByZXNvbHZlWWFtbFBhaXJzLFxuICBjb25zdHJ1Y3Q6IGNvbnN0cnVjdFlhbWxQYWlyc1xufSk7XG52YXIgX2hhc093blByb3BlcnR5JDIgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuZnVuY3Rpb24gcmVzb2x2ZVlhbWxTZXQoZGF0YSkge1xuICBpZiAoZGF0YSA9PT0gbnVsbCkgcmV0dXJuIHRydWU7XG4gIHZhciBrZXksIG9iamVjdCA9IGRhdGE7XG4gIGZvciAoa2V5IGluIG9iamVjdCkge1xuICAgIGlmIChfaGFzT3duUHJvcGVydHkkMi5jYWxsKG9iamVjdCwga2V5KSkge1xuICAgICAgaWYgKG9iamVjdFtrZXldICE9PSBudWxsKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuX19uYW1lKHJlc29sdmVZYW1sU2V0LCBcInJlc29sdmVZYW1sU2V0XCIpO1xuZnVuY3Rpb24gY29uc3RydWN0WWFtbFNldChkYXRhKSB7XG4gIHJldHVybiBkYXRhICE9PSBudWxsID8gZGF0YSA6IHt9O1xufVxuX19uYW1lKGNvbnN0cnVjdFlhbWxTZXQsIFwiY29uc3RydWN0WWFtbFNldFwiKTtcbnZhciBzZXQgPSBuZXcgdHlwZShcInRhZzp5YW1sLm9yZywyMDAyOnNldFwiLCB7XG4gIGtpbmQ6IFwibWFwcGluZ1wiLFxuICByZXNvbHZlOiByZXNvbHZlWWFtbFNldCxcbiAgY29uc3RydWN0OiBjb25zdHJ1Y3RZYW1sU2V0XG59KTtcbnZhciBfZGVmYXVsdCA9IGNvcmUuZXh0ZW5kKHtcbiAgaW1wbGljaXQ6IFtcbiAgICB0aW1lc3RhbXAsXG4gICAgbWVyZ2VcbiAgXSxcbiAgZXhwbGljaXQ6IFtcbiAgICBiaW5hcnksXG4gICAgb21hcCxcbiAgICBwYWlycyxcbiAgICBzZXRcbiAgXVxufSk7XG52YXIgX2hhc093blByb3BlcnR5JDEgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIENPTlRFWFRfRkxPV19JTiA9IDE7XG52YXIgQ09OVEVYVF9GTE9XX09VVCA9IDI7XG52YXIgQ09OVEVYVF9CTE9DS19JTiA9IDM7XG52YXIgQ09OVEVYVF9CTE9DS19PVVQgPSA0O1xudmFyIENIT01QSU5HX0NMSVAgPSAxO1xudmFyIENIT01QSU5HX1NUUklQID0gMjtcbnZhciBDSE9NUElOR19LRUVQID0gMztcbnZhciBQQVRURVJOX05PTl9QUklOVEFCTEUgPSAvW1xceDAwLVxceDA4XFx4MEJcXHgwQ1xceDBFLVxceDFGXFx4N0YtXFx4ODRcXHg4Ni1cXHg5RlxcdUZGRkVcXHVGRkZGXXxbXFx1RDgwMC1cXHVEQkZGXSg/IVtcXHVEQzAwLVxcdURGRkZdKXwoPzpbXlxcdUQ4MDAtXFx1REJGRl18XilbXFx1REMwMC1cXHVERkZGXS87XG52YXIgUEFUVEVSTl9OT05fQVNDSUlfTElORV9CUkVBS1MgPSAvW1xceDg1XFx1MjAyOFxcdTIwMjldLztcbnZhciBQQVRURVJOX0ZMT1dfSU5ESUNBVE9SUyA9IC9bLFxcW1xcXVxce1xcfV0vO1xudmFyIFBBVFRFUk5fVEFHX0hBTkRMRSA9IC9eKD86IXwhIXwhW2EtelxcLV0rISkkL2k7XG52YXIgUEFUVEVSTl9UQUdfVVJJID0gL14oPzohfFteLFxcW1xcXVxce1xcfV0pKD86JVswLTlhLWZdezJ9fFswLTlhLXpcXC0jO1xcL1xcPzpAJj1cXCtcXCQsX1xcLiF+XFwqJ1xcKFxcKVxcW1xcXV0pKiQvaTtcbmZ1bmN0aW9uIF9jbGFzcyhvYmopIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopO1xufVxuX19uYW1lKF9jbGFzcywgXCJfY2xhc3NcIik7XG5mdW5jdGlvbiBpc19FT0woYykge1xuICByZXR1cm4gYyA9PT0gMTAgfHwgYyA9PT0gMTM7XG59XG5fX25hbWUoaXNfRU9MLCBcImlzX0VPTFwiKTtcbmZ1bmN0aW9uIGlzX1dISVRFX1NQQUNFKGMpIHtcbiAgcmV0dXJuIGMgPT09IDkgfHwgYyA9PT0gMzI7XG59XG5fX25hbWUoaXNfV0hJVEVfU1BBQ0UsIFwiaXNfV0hJVEVfU1BBQ0VcIik7XG5mdW5jdGlvbiBpc19XU19PUl9FT0woYykge1xuICByZXR1cm4gYyA9PT0gOSB8fCBjID09PSAzMiB8fCBjID09PSAxMCB8fCBjID09PSAxMztcbn1cbl9fbmFtZShpc19XU19PUl9FT0wsIFwiaXNfV1NfT1JfRU9MXCIpO1xuZnVuY3Rpb24gaXNfRkxPV19JTkRJQ0FUT1IoYykge1xuICByZXR1cm4gYyA9PT0gNDQgfHwgYyA9PT0gOTEgfHwgYyA9PT0gOTMgfHwgYyA9PT0gMTIzIHx8IGMgPT09IDEyNTtcbn1cbl9fbmFtZShpc19GTE9XX0lORElDQVRPUiwgXCJpc19GTE9XX0lORElDQVRPUlwiKTtcbmZ1bmN0aW9uIGZyb21IZXhDb2RlKGMpIHtcbiAgdmFyIGxjO1xuICBpZiAoNDggPD0gYyAmJiBjIDw9IDU3KSB7XG4gICAgcmV0dXJuIGMgLSA0ODtcbiAgfVxuICBsYyA9IGMgfCAzMjtcbiAgaWYgKDk3IDw9IGxjICYmIGxjIDw9IDEwMikge1xuICAgIHJldHVybiBsYyAtIDk3ICsgMTA7XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuX19uYW1lKGZyb21IZXhDb2RlLCBcImZyb21IZXhDb2RlXCIpO1xuZnVuY3Rpb24gZXNjYXBlZEhleExlbihjKSB7XG4gIGlmIChjID09PSAxMjApIHtcbiAgICByZXR1cm4gMjtcbiAgfVxuICBpZiAoYyA9PT0gMTE3KSB7XG4gICAgcmV0dXJuIDQ7XG4gIH1cbiAgaWYgKGMgPT09IDg1KSB7XG4gICAgcmV0dXJuIDg7XG4gIH1cbiAgcmV0dXJuIDA7XG59XG5fX25hbWUoZXNjYXBlZEhleExlbiwgXCJlc2NhcGVkSGV4TGVuXCIpO1xuZnVuY3Rpb24gZnJvbURlY2ltYWxDb2RlKGMpIHtcbiAgaWYgKDQ4IDw9IGMgJiYgYyA8PSA1Nykge1xuICAgIHJldHVybiBjIC0gNDg7XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuX19uYW1lKGZyb21EZWNpbWFsQ29kZSwgXCJmcm9tRGVjaW1hbENvZGVcIik7XG5mdW5jdGlvbiBzaW1wbGVFc2NhcGVTZXF1ZW5jZShjKSB7XG4gIHJldHVybiBjID09PSA0OCA/IFwiXFwwXCIgOiBjID09PSA5NyA/IFwiXFx4MDdcIiA6IGMgPT09IDk4ID8gXCJcXGJcIiA6IGMgPT09IDExNiA/IFwiXHRcIiA6IGMgPT09IDkgPyBcIlx0XCIgOiBjID09PSAxMTAgPyBcIlxcblwiIDogYyA9PT0gMTE4ID8gXCJcXHZcIiA6IGMgPT09IDEwMiA/IFwiXFxmXCIgOiBjID09PSAxMTQgPyBcIlxcclwiIDogYyA9PT0gMTAxID8gXCJcXHgxQlwiIDogYyA9PT0gMzIgPyBcIiBcIiA6IGMgPT09IDM0ID8gJ1wiJyA6IGMgPT09IDQ3ID8gXCIvXCIgOiBjID09PSA5MiA/IFwiXFxcXFwiIDogYyA9PT0gNzggPyBcIlxceDg1XCIgOiBjID09PSA5NSA/IFwiXFx4QTBcIiA6IGMgPT09IDc2ID8gXCJcXHUyMDI4XCIgOiBjID09PSA4MCA/IFwiXFx1MjAyOVwiIDogXCJcIjtcbn1cbl9fbmFtZShzaW1wbGVFc2NhcGVTZXF1ZW5jZSwgXCJzaW1wbGVFc2NhcGVTZXF1ZW5jZVwiKTtcbmZ1bmN0aW9uIGNoYXJGcm9tQ29kZXBvaW50KGMpIHtcbiAgaWYgKGMgPD0gNjU1MzUpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShjKTtcbiAgfVxuICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShcbiAgICAoYyAtIDY1NTM2ID4+IDEwKSArIDU1Mjk2LFxuICAgIChjIC0gNjU1MzYgJiAxMDIzKSArIDU2MzIwXG4gICk7XG59XG5fX25hbWUoY2hhckZyb21Db2RlcG9pbnQsIFwiY2hhckZyb21Db2RlcG9pbnRcIik7XG5mdW5jdGlvbiBzZXRQcm9wZXJ0eShvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgaWYgKGtleSA9PT0gXCJfX3Byb3RvX19cIikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsIGtleSwge1xuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgdmFsdWVcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBvYmplY3Rba2V5XSA9IHZhbHVlO1xuICB9XG59XG5fX25hbWUoc2V0UHJvcGVydHksIFwic2V0UHJvcGVydHlcIik7XG52YXIgc2ltcGxlRXNjYXBlQ2hlY2sgPSBuZXcgQXJyYXkoMjU2KTtcbnZhciBzaW1wbGVFc2NhcGVNYXAgPSBuZXcgQXJyYXkoMjU2KTtcbmZvciAoaSA9IDA7IGkgPCAyNTY7IGkrKykge1xuICBzaW1wbGVFc2NhcGVDaGVja1tpXSA9IHNpbXBsZUVzY2FwZVNlcXVlbmNlKGkpID8gMSA6IDA7XG4gIHNpbXBsZUVzY2FwZU1hcFtpXSA9IHNpbXBsZUVzY2FwZVNlcXVlbmNlKGkpO1xufVxudmFyIGk7XG5mdW5jdGlvbiBTdGF0ZSQxKGlucHV0LCBvcHRpb25zKSB7XG4gIHRoaXMuaW5wdXQgPSBpbnB1dDtcbiAgdGhpcy5maWxlbmFtZSA9IG9wdGlvbnNbXCJmaWxlbmFtZVwiXSB8fCBudWxsO1xuICB0aGlzLnNjaGVtYSA9IG9wdGlvbnNbXCJzY2hlbWFcIl0gfHwgX2RlZmF1bHQ7XG4gIHRoaXMub25XYXJuaW5nID0gb3B0aW9uc1tcIm9uV2FybmluZ1wiXSB8fCBudWxsO1xuICB0aGlzLmxlZ2FjeSA9IG9wdGlvbnNbXCJsZWdhY3lcIl0gfHwgZmFsc2U7XG4gIHRoaXMuanNvbiA9IG9wdGlvbnNbXCJqc29uXCJdIHx8IGZhbHNlO1xuICB0aGlzLmxpc3RlbmVyID0gb3B0aW9uc1tcImxpc3RlbmVyXCJdIHx8IG51bGw7XG4gIHRoaXMuaW1wbGljaXRUeXBlcyA9IHRoaXMuc2NoZW1hLmNvbXBpbGVkSW1wbGljaXQ7XG4gIHRoaXMudHlwZU1hcCA9IHRoaXMuc2NoZW1hLmNvbXBpbGVkVHlwZU1hcDtcbiAgdGhpcy5sZW5ndGggPSBpbnB1dC5sZW5ndGg7XG4gIHRoaXMucG9zaXRpb24gPSAwO1xuICB0aGlzLmxpbmUgPSAwO1xuICB0aGlzLmxpbmVTdGFydCA9IDA7XG4gIHRoaXMubGluZUluZGVudCA9IDA7XG4gIHRoaXMuZmlyc3RUYWJJbkxpbmUgPSAtMTtcbiAgdGhpcy5kb2N1bWVudHMgPSBbXTtcbn1cbl9fbmFtZShTdGF0ZSQxLCBcIlN0YXRlJDFcIik7XG5mdW5jdGlvbiBnZW5lcmF0ZUVycm9yKHN0YXRlLCBtZXNzYWdlKSB7XG4gIHZhciBtYXJrID0ge1xuICAgIG5hbWU6IHN0YXRlLmZpbGVuYW1lLFxuICAgIGJ1ZmZlcjogc3RhdGUuaW5wdXQuc2xpY2UoMCwgLTEpLFxuICAgIC8vIG9taXQgdHJhaWxpbmcgXFwwXG4gICAgcG9zaXRpb246IHN0YXRlLnBvc2l0aW9uLFxuICAgIGxpbmU6IHN0YXRlLmxpbmUsXG4gICAgY29sdW1uOiBzdGF0ZS5wb3NpdGlvbiAtIHN0YXRlLmxpbmVTdGFydFxuICB9O1xuICBtYXJrLnNuaXBwZXQgPSBzbmlwcGV0KG1hcmspO1xuICByZXR1cm4gbmV3IGV4Y2VwdGlvbihtZXNzYWdlLCBtYXJrKTtcbn1cbl9fbmFtZShnZW5lcmF0ZUVycm9yLCBcImdlbmVyYXRlRXJyb3JcIik7XG5mdW5jdGlvbiB0aHJvd0Vycm9yKHN0YXRlLCBtZXNzYWdlKSB7XG4gIHRocm93IGdlbmVyYXRlRXJyb3Ioc3RhdGUsIG1lc3NhZ2UpO1xufVxuX19uYW1lKHRocm93RXJyb3IsIFwidGhyb3dFcnJvclwiKTtcbmZ1bmN0aW9uIHRocm93V2FybmluZyhzdGF0ZSwgbWVzc2FnZSkge1xuICBpZiAoc3RhdGUub25XYXJuaW5nKSB7XG4gICAgc3RhdGUub25XYXJuaW5nLmNhbGwobnVsbCwgZ2VuZXJhdGVFcnJvcihzdGF0ZSwgbWVzc2FnZSkpO1xuICB9XG59XG5fX25hbWUodGhyb3dXYXJuaW5nLCBcInRocm93V2FybmluZ1wiKTtcbnZhciBkaXJlY3RpdmVIYW5kbGVycyA9IHtcbiAgWUFNTDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBoYW5kbGVZYW1sRGlyZWN0aXZlKHN0YXRlLCBuYW1lLCBhcmdzKSB7XG4gICAgdmFyIG1hdGNoLCBtYWpvciwgbWlub3I7XG4gICAgaWYgKHN0YXRlLnZlcnNpb24gIT09IG51bGwpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsIFwiZHVwbGljYXRpb24gb2YgJVlBTUwgZGlyZWN0aXZlXCIpO1xuICAgIH1cbiAgICBpZiAoYXJncy5sZW5ndGggIT09IDEpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsIFwiWUFNTCBkaXJlY3RpdmUgYWNjZXB0cyBleGFjdGx5IG9uZSBhcmd1bWVudFwiKTtcbiAgICB9XG4gICAgbWF0Y2ggPSAvXihbMC05XSspXFwuKFswLTldKykkLy5leGVjKGFyZ3NbMF0pO1xuICAgIGlmIChtYXRjaCA9PT0gbnVsbCkge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgXCJpbGwtZm9ybWVkIGFyZ3VtZW50IG9mIHRoZSBZQU1MIGRpcmVjdGl2ZVwiKTtcbiAgICB9XG4gICAgbWFqb3IgPSBwYXJzZUludChtYXRjaFsxXSwgMTApO1xuICAgIG1pbm9yID0gcGFyc2VJbnQobWF0Y2hbMl0sIDEwKTtcbiAgICBpZiAobWFqb3IgIT09IDEpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsIFwidW5hY2NlcHRhYmxlIFlBTUwgdmVyc2lvbiBvZiB0aGUgZG9jdW1lbnRcIik7XG4gICAgfVxuICAgIHN0YXRlLnZlcnNpb24gPSBhcmdzWzBdO1xuICAgIHN0YXRlLmNoZWNrTGluZUJyZWFrcyA9IG1pbm9yIDwgMjtcbiAgICBpZiAobWlub3IgIT09IDEgJiYgbWlub3IgIT09IDIpIHtcbiAgICAgIHRocm93V2FybmluZyhzdGF0ZSwgXCJ1bnN1cHBvcnRlZCBZQU1MIHZlcnNpb24gb2YgdGhlIGRvY3VtZW50XCIpO1xuICAgIH1cbiAgfSwgXCJoYW5kbGVZYW1sRGlyZWN0aXZlXCIpLFxuICBUQUc6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gaGFuZGxlVGFnRGlyZWN0aXZlKHN0YXRlLCBuYW1lLCBhcmdzKSB7XG4gICAgdmFyIGhhbmRsZSwgcHJlZml4O1xuICAgIGlmIChhcmdzLmxlbmd0aCAhPT0gMikge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgXCJUQUcgZGlyZWN0aXZlIGFjY2VwdHMgZXhhY3RseSB0d28gYXJndW1lbnRzXCIpO1xuICAgIH1cbiAgICBoYW5kbGUgPSBhcmdzWzBdO1xuICAgIHByZWZpeCA9IGFyZ3NbMV07XG4gICAgaWYgKCFQQVRURVJOX1RBR19IQU5ETEUudGVzdChoYW5kbGUpKSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCBcImlsbC1mb3JtZWQgdGFnIGhhbmRsZSAoZmlyc3QgYXJndW1lbnQpIG9mIHRoZSBUQUcgZGlyZWN0aXZlXCIpO1xuICAgIH1cbiAgICBpZiAoX2hhc093blByb3BlcnR5JDEuY2FsbChzdGF0ZS50YWdNYXAsIGhhbmRsZSkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICd0aGVyZSBpcyBhIHByZXZpb3VzbHkgZGVjbGFyZWQgc3VmZml4IGZvciBcIicgKyBoYW5kbGUgKyAnXCIgdGFnIGhhbmRsZScpO1xuICAgIH1cbiAgICBpZiAoIVBBVFRFUk5fVEFHX1VSSS50ZXN0KHByZWZpeCkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsIFwiaWxsLWZvcm1lZCB0YWcgcHJlZml4IChzZWNvbmQgYXJndW1lbnQpIG9mIHRoZSBUQUcgZGlyZWN0aXZlXCIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgcHJlZml4ID0gZGVjb2RlVVJJQ29tcG9uZW50KHByZWZpeCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCBcInRhZyBwcmVmaXggaXMgbWFsZm9ybWVkOiBcIiArIHByZWZpeCk7XG4gICAgfVxuICAgIHN0YXRlLnRhZ01hcFtoYW5kbGVdID0gcHJlZml4O1xuICB9LCBcImhhbmRsZVRhZ0RpcmVjdGl2ZVwiKVxufTtcbmZ1bmN0aW9uIGNhcHR1cmVTZWdtZW50KHN0YXRlLCBzdGFydCwgZW5kLCBjaGVja0pzb24pIHtcbiAgdmFyIF9wb3NpdGlvbiwgX2xlbmd0aCwgX2NoYXJhY3RlciwgX3Jlc3VsdDtcbiAgaWYgKHN0YXJ0IDwgZW5kKSB7XG4gICAgX3Jlc3VsdCA9IHN0YXRlLmlucHV0LnNsaWNlKHN0YXJ0LCBlbmQpO1xuICAgIGlmIChjaGVja0pzb24pIHtcbiAgICAgIGZvciAoX3Bvc2l0aW9uID0gMCwgX2xlbmd0aCA9IF9yZXN1bHQubGVuZ3RoOyBfcG9zaXRpb24gPCBfbGVuZ3RoOyBfcG9zaXRpb24gKz0gMSkge1xuICAgICAgICBfY2hhcmFjdGVyID0gX3Jlc3VsdC5jaGFyQ29kZUF0KF9wb3NpdGlvbik7XG4gICAgICAgIGlmICghKF9jaGFyYWN0ZXIgPT09IDkgfHwgMzIgPD0gX2NoYXJhY3RlciAmJiBfY2hhcmFjdGVyIDw9IDExMTQxMTEpKSB7XG4gICAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgXCJleHBlY3RlZCB2YWxpZCBKU09OIGNoYXJhY3RlclwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoUEFUVEVSTl9OT05fUFJJTlRBQkxFLnRlc3QoX3Jlc3VsdCkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsIFwidGhlIHN0cmVhbSBjb250YWlucyBub24tcHJpbnRhYmxlIGNoYXJhY3RlcnNcIik7XG4gICAgfVxuICAgIHN0YXRlLnJlc3VsdCArPSBfcmVzdWx0O1xuICB9XG59XG5fX25hbWUoY2FwdHVyZVNlZ21lbnQsIFwiY2FwdHVyZVNlZ21lbnRcIik7XG5mdW5jdGlvbiBtZXJnZU1hcHBpbmdzKHN0YXRlLCBkZXN0aW5hdGlvbiwgc291cmNlLCBvdmVycmlkYWJsZUtleXMpIHtcbiAgdmFyIHNvdXJjZUtleXMsIGtleSwgaW5kZXgsIHF1YW50aXR5O1xuICBpZiAoIWNvbW1vbi5pc09iamVjdChzb3VyY2UpKSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgXCJjYW5ub3QgbWVyZ2UgbWFwcGluZ3M7IHRoZSBwcm92aWRlZCBzb3VyY2Ugb2JqZWN0IGlzIHVuYWNjZXB0YWJsZVwiKTtcbiAgfVxuICBzb3VyY2VLZXlzID0gT2JqZWN0LmtleXMoc291cmNlKTtcbiAgZm9yIChpbmRleCA9IDAsIHF1YW50aXR5ID0gc291cmNlS2V5cy5sZW5ndGg7IGluZGV4IDwgcXVhbnRpdHk7IGluZGV4ICs9IDEpIHtcbiAgICBrZXkgPSBzb3VyY2VLZXlzW2luZGV4XTtcbiAgICBpZiAoIV9oYXNPd25Qcm9wZXJ0eSQxLmNhbGwoZGVzdGluYXRpb24sIGtleSkpIHtcbiAgICAgIHNldFByb3BlcnR5KGRlc3RpbmF0aW9uLCBrZXksIHNvdXJjZVtrZXldKTtcbiAgICAgIG92ZXJyaWRhYmxlS2V5c1trZXldID0gdHJ1ZTtcbiAgICB9XG4gIH1cbn1cbl9fbmFtZShtZXJnZU1hcHBpbmdzLCBcIm1lcmdlTWFwcGluZ3NcIik7XG5mdW5jdGlvbiBzdG9yZU1hcHBpbmdQYWlyKHN0YXRlLCBfcmVzdWx0LCBvdmVycmlkYWJsZUtleXMsIGtleVRhZywga2V5Tm9kZSwgdmFsdWVOb2RlLCBzdGFydExpbmUsIHN0YXJ0TGluZVN0YXJ0LCBzdGFydFBvcykge1xuICB2YXIgaW5kZXgsIHF1YW50aXR5O1xuICBpZiAoQXJyYXkuaXNBcnJheShrZXlOb2RlKSkge1xuICAgIGtleU5vZGUgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChrZXlOb2RlKTtcbiAgICBmb3IgKGluZGV4ID0gMCwgcXVhbnRpdHkgPSBrZXlOb2RlLmxlbmd0aDsgaW5kZXggPCBxdWFudGl0eTsgaW5kZXggKz0gMSkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoa2V5Tm9kZVtpbmRleF0pKSB7XG4gICAgICAgIHRocm93RXJyb3Ioc3RhdGUsIFwibmVzdGVkIGFycmF5cyBhcmUgbm90IHN1cHBvcnRlZCBpbnNpZGUga2V5c1wiKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2Yga2V5Tm9kZSA9PT0gXCJvYmplY3RcIiAmJiBfY2xhc3Moa2V5Tm9kZVtpbmRleF0pID09PSBcIltvYmplY3QgT2JqZWN0XVwiKSB7XG4gICAgICAgIGtleU5vZGVbaW5kZXhdID0gXCJbb2JqZWN0IE9iamVjdF1cIjtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYgKHR5cGVvZiBrZXlOb2RlID09PSBcIm9iamVjdFwiICYmIF9jbGFzcyhrZXlOb2RlKSA9PT0gXCJbb2JqZWN0IE9iamVjdF1cIikge1xuICAgIGtleU5vZGUgPSBcIltvYmplY3QgT2JqZWN0XVwiO1xuICB9XG4gIGtleU5vZGUgPSBTdHJpbmcoa2V5Tm9kZSk7XG4gIGlmIChfcmVzdWx0ID09PSBudWxsKSB7XG4gICAgX3Jlc3VsdCA9IHt9O1xuICB9XG4gIGlmIChrZXlUYWcgPT09IFwidGFnOnlhbWwub3JnLDIwMDI6bWVyZ2VcIikge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlTm9kZSkpIHtcbiAgICAgIGZvciAoaW5kZXggPSAwLCBxdWFudGl0eSA9IHZhbHVlTm9kZS5sZW5ndGg7IGluZGV4IDwgcXVhbnRpdHk7IGluZGV4ICs9IDEpIHtcbiAgICAgICAgbWVyZ2VNYXBwaW5ncyhzdGF0ZSwgX3Jlc3VsdCwgdmFsdWVOb2RlW2luZGV4XSwgb3ZlcnJpZGFibGVLZXlzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbWVyZ2VNYXBwaW5ncyhzdGF0ZSwgX3Jlc3VsdCwgdmFsdWVOb2RlLCBvdmVycmlkYWJsZUtleXMpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoIXN0YXRlLmpzb24gJiYgIV9oYXNPd25Qcm9wZXJ0eSQxLmNhbGwob3ZlcnJpZGFibGVLZXlzLCBrZXlOb2RlKSAmJiBfaGFzT3duUHJvcGVydHkkMS5jYWxsKF9yZXN1bHQsIGtleU5vZGUpKSB7XG4gICAgICBzdGF0ZS5saW5lID0gc3RhcnRMaW5lIHx8IHN0YXRlLmxpbmU7XG4gICAgICBzdGF0ZS5saW5lU3RhcnQgPSBzdGFydExpbmVTdGFydCB8fCBzdGF0ZS5saW5lU3RhcnQ7XG4gICAgICBzdGF0ZS5wb3NpdGlvbiA9IHN0YXJ0UG9zIHx8IHN0YXRlLnBvc2l0aW9uO1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgXCJkdXBsaWNhdGVkIG1hcHBpbmcga2V5XCIpO1xuICAgIH1cbiAgICBzZXRQcm9wZXJ0eShfcmVzdWx0LCBrZXlOb2RlLCB2YWx1ZU5vZGUpO1xuICAgIGRlbGV0ZSBvdmVycmlkYWJsZUtleXNba2V5Tm9kZV07XG4gIH1cbiAgcmV0dXJuIF9yZXN1bHQ7XG59XG5fX25hbWUoc3RvcmVNYXBwaW5nUGFpciwgXCJzdG9yZU1hcHBpbmdQYWlyXCIpO1xuZnVuY3Rpb24gcmVhZExpbmVCcmVhayhzdGF0ZSkge1xuICB2YXIgY2g7XG4gIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbik7XG4gIGlmIChjaCA9PT0gMTApIHtcbiAgICBzdGF0ZS5wb3NpdGlvbisrO1xuICB9IGVsc2UgaWYgKGNoID09PSAxMykge1xuICAgIHN0YXRlLnBvc2l0aW9uKys7XG4gICAgaWYgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pID09PSAxMCkge1xuICAgICAgc3RhdGUucG9zaXRpb24rKztcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgXCJhIGxpbmUgYnJlYWsgaXMgZXhwZWN0ZWRcIik7XG4gIH1cbiAgc3RhdGUubGluZSArPSAxO1xuICBzdGF0ZS5saW5lU3RhcnQgPSBzdGF0ZS5wb3NpdGlvbjtcbiAgc3RhdGUuZmlyc3RUYWJJbkxpbmUgPSAtMTtcbn1cbl9fbmFtZShyZWFkTGluZUJyZWFrLCBcInJlYWRMaW5lQnJlYWtcIik7XG5mdW5jdGlvbiBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCBhbGxvd0NvbW1lbnRzLCBjaGVja0luZGVudCkge1xuICB2YXIgbGluZUJyZWFrcyA9IDAsIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbik7XG4gIHdoaWxlIChjaCAhPT0gMCkge1xuICAgIHdoaWxlIChpc19XSElURV9TUEFDRShjaCkpIHtcbiAgICAgIGlmIChjaCA9PT0gOSAmJiBzdGF0ZS5maXJzdFRhYkluTGluZSA9PT0gLTEpIHtcbiAgICAgICAgc3RhdGUuZmlyc3RUYWJJbkxpbmUgPSBzdGF0ZS5wb3NpdGlvbjtcbiAgICAgIH1cbiAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcbiAgICB9XG4gICAgaWYgKGFsbG93Q29tbWVudHMgJiYgY2ggPT09IDM1KSB7XG4gICAgICBkbyB7XG4gICAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcbiAgICAgIH0gd2hpbGUgKGNoICE9PSAxMCAmJiBjaCAhPT0gMTMgJiYgY2ggIT09IDApO1xuICAgIH1cbiAgICBpZiAoaXNfRU9MKGNoKSkge1xuICAgICAgcmVhZExpbmVCcmVhayhzdGF0ZSk7XG4gICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pO1xuICAgICAgbGluZUJyZWFrcysrO1xuICAgICAgc3RhdGUubGluZUluZGVudCA9IDA7XG4gICAgICB3aGlsZSAoY2ggPT09IDMyKSB7XG4gICAgICAgIHN0YXRlLmxpbmVJbmRlbnQrKztcbiAgICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgaWYgKGNoZWNrSW5kZW50ICE9PSAtMSAmJiBsaW5lQnJlYWtzICE9PSAwICYmIHN0YXRlLmxpbmVJbmRlbnQgPCBjaGVja0luZGVudCkge1xuICAgIHRocm93V2FybmluZyhzdGF0ZSwgXCJkZWZpY2llbnQgaW5kZW50YXRpb25cIik7XG4gIH1cbiAgcmV0dXJuIGxpbmVCcmVha3M7XG59XG5fX25hbWUoc2tpcFNlcGFyYXRpb25TcGFjZSwgXCJza2lwU2VwYXJhdGlvblNwYWNlXCIpO1xuZnVuY3Rpb24gdGVzdERvY3VtZW50U2VwYXJhdG9yKHN0YXRlKSB7XG4gIHZhciBfcG9zaXRpb24gPSBzdGF0ZS5wb3NpdGlvbiwgY2g7XG4gIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChfcG9zaXRpb24pO1xuICBpZiAoKGNoID09PSA0NSB8fCBjaCA9PT0gNDYpICYmIGNoID09PSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KF9wb3NpdGlvbiArIDEpICYmIGNoID09PSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KF9wb3NpdGlvbiArIDIpKSB7XG4gICAgX3Bvc2l0aW9uICs9IDM7XG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KF9wb3NpdGlvbik7XG4gICAgaWYgKGNoID09PSAwIHx8IGlzX1dTX09SX0VPTChjaCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5fX25hbWUodGVzdERvY3VtZW50U2VwYXJhdG9yLCBcInRlc3REb2N1bWVudFNlcGFyYXRvclwiKTtcbmZ1bmN0aW9uIHdyaXRlRm9sZGVkTGluZXMoc3RhdGUsIGNvdW50KSB7XG4gIGlmIChjb3VudCA9PT0gMSkge1xuICAgIHN0YXRlLnJlc3VsdCArPSBcIiBcIjtcbiAgfSBlbHNlIGlmIChjb3VudCA+IDEpIHtcbiAgICBzdGF0ZS5yZXN1bHQgKz0gY29tbW9uLnJlcGVhdChcIlxcblwiLCBjb3VudCAtIDEpO1xuICB9XG59XG5fX25hbWUod3JpdGVGb2xkZWRMaW5lcywgXCJ3cml0ZUZvbGRlZExpbmVzXCIpO1xuZnVuY3Rpb24gcmVhZFBsYWluU2NhbGFyKHN0YXRlLCBub2RlSW5kZW50LCB3aXRoaW5GbG93Q29sbGVjdGlvbikge1xuICB2YXIgcHJlY2VkaW5nLCBmb2xsb3dpbmcsIGNhcHR1cmVTdGFydCwgY2FwdHVyZUVuZCwgaGFzUGVuZGluZ0NvbnRlbnQsIF9saW5lLCBfbGluZVN0YXJ0LCBfbGluZUluZGVudCwgX2tpbmQgPSBzdGF0ZS5raW5kLCBfcmVzdWx0ID0gc3RhdGUucmVzdWx0LCBjaDtcbiAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKTtcbiAgaWYgKGlzX1dTX09SX0VPTChjaCkgfHwgaXNfRkxPV19JTkRJQ0FUT1IoY2gpIHx8IGNoID09PSAzNSB8fCBjaCA9PT0gMzggfHwgY2ggPT09IDQyIHx8IGNoID09PSAzMyB8fCBjaCA9PT0gMTI0IHx8IGNoID09PSA2MiB8fCBjaCA9PT0gMzkgfHwgY2ggPT09IDM0IHx8IGNoID09PSAzNyB8fCBjaCA9PT0gNjQgfHwgY2ggPT09IDk2KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmIChjaCA9PT0gNjMgfHwgY2ggPT09IDQ1KSB7XG4gICAgZm9sbG93aW5nID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbiArIDEpO1xuICAgIGlmIChpc19XU19PUl9FT0woZm9sbG93aW5nKSB8fCB3aXRoaW5GbG93Q29sbGVjdGlvbiAmJiBpc19GTE9XX0lORElDQVRPUihmb2xsb3dpbmcpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHN0YXRlLmtpbmQgPSBcInNjYWxhclwiO1xuICBzdGF0ZS5yZXN1bHQgPSBcIlwiO1xuICBjYXB0dXJlU3RhcnQgPSBjYXB0dXJlRW5kID0gc3RhdGUucG9zaXRpb247XG4gIGhhc1BlbmRpbmdDb250ZW50ID0gZmFsc2U7XG4gIHdoaWxlIChjaCAhPT0gMCkge1xuICAgIGlmIChjaCA9PT0gNTgpIHtcbiAgICAgIGZvbGxvd2luZyA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24gKyAxKTtcbiAgICAgIGlmIChpc19XU19PUl9FT0woZm9sbG93aW5nKSB8fCB3aXRoaW5GbG93Q29sbGVjdGlvbiAmJiBpc19GTE9XX0lORElDQVRPUihmb2xsb3dpbmcpKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoY2ggPT09IDM1KSB7XG4gICAgICBwcmVjZWRpbmcgPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uIC0gMSk7XG4gICAgICBpZiAoaXNfV1NfT1JfRU9MKHByZWNlZGluZykpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChzdGF0ZS5wb3NpdGlvbiA9PT0gc3RhdGUubGluZVN0YXJ0ICYmIHRlc3REb2N1bWVudFNlcGFyYXRvcihzdGF0ZSkgfHwgd2l0aGluRmxvd0NvbGxlY3Rpb24gJiYgaXNfRkxPV19JTkRJQ0FUT1IoY2gpKSB7XG4gICAgICBicmVhaztcbiAgICB9IGVsc2UgaWYgKGlzX0VPTChjaCkpIHtcbiAgICAgIF9saW5lID0gc3RhdGUubGluZTtcbiAgICAgIF9saW5lU3RhcnQgPSBzdGF0ZS5saW5lU3RhcnQ7XG4gICAgICBfbGluZUluZGVudCA9IHN0YXRlLmxpbmVJbmRlbnQ7XG4gICAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCBmYWxzZSwgLTEpO1xuICAgICAgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPj0gbm9kZUluZGVudCkge1xuICAgICAgICBoYXNQZW5kaW5nQ29udGVudCA9IHRydWU7XG4gICAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RhdGUucG9zaXRpb24gPSBjYXB0dXJlRW5kO1xuICAgICAgICBzdGF0ZS5saW5lID0gX2xpbmU7XG4gICAgICAgIHN0YXRlLmxpbmVTdGFydCA9IF9saW5lU3RhcnQ7XG4gICAgICAgIHN0YXRlLmxpbmVJbmRlbnQgPSBfbGluZUluZGVudDtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChoYXNQZW5kaW5nQ29udGVudCkge1xuICAgICAgY2FwdHVyZVNlZ21lbnQoc3RhdGUsIGNhcHR1cmVTdGFydCwgY2FwdHVyZUVuZCwgZmFsc2UpO1xuICAgICAgd3JpdGVGb2xkZWRMaW5lcyhzdGF0ZSwgc3RhdGUubGluZSAtIF9saW5lKTtcbiAgICAgIGNhcHR1cmVTdGFydCA9IGNhcHR1cmVFbmQgPSBzdGF0ZS5wb3NpdGlvbjtcbiAgICAgIGhhc1BlbmRpbmdDb250ZW50ID0gZmFsc2U7XG4gICAgfVxuICAgIGlmICghaXNfV0hJVEVfU1BBQ0UoY2gpKSB7XG4gICAgICBjYXB0dXJlRW5kID0gc3RhdGUucG9zaXRpb24gKyAxO1xuICAgIH1cbiAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG4gIH1cbiAgY2FwdHVyZVNlZ21lbnQoc3RhdGUsIGNhcHR1cmVTdGFydCwgY2FwdHVyZUVuZCwgZmFsc2UpO1xuICBpZiAoc3RhdGUucmVzdWx0KSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgc3RhdGUua2luZCA9IF9raW5kO1xuICBzdGF0ZS5yZXN1bHQgPSBfcmVzdWx0O1xuICByZXR1cm4gZmFsc2U7XG59XG5fX25hbWUocmVhZFBsYWluU2NhbGFyLCBcInJlYWRQbGFpblNjYWxhclwiKTtcbmZ1bmN0aW9uIHJlYWRTaW5nbGVRdW90ZWRTY2FsYXIoc3RhdGUsIG5vZGVJbmRlbnQpIHtcbiAgdmFyIGNoLCBjYXB0dXJlU3RhcnQsIGNhcHR1cmVFbmQ7XG4gIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbik7XG4gIGlmIChjaCAhPT0gMzkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgc3RhdGUua2luZCA9IFwic2NhbGFyXCI7XG4gIHN0YXRlLnJlc3VsdCA9IFwiXCI7XG4gIHN0YXRlLnBvc2l0aW9uKys7XG4gIGNhcHR1cmVTdGFydCA9IGNhcHR1cmVFbmQgPSBzdGF0ZS5wb3NpdGlvbjtcbiAgd2hpbGUgKChjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pKSAhPT0gMCkge1xuICAgIGlmIChjaCA9PT0gMzkpIHtcbiAgICAgIGNhcHR1cmVTZWdtZW50KHN0YXRlLCBjYXB0dXJlU3RhcnQsIHN0YXRlLnBvc2l0aW9uLCB0cnVlKTtcbiAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcbiAgICAgIGlmIChjaCA9PT0gMzkpIHtcbiAgICAgICAgY2FwdHVyZVN0YXJ0ID0gc3RhdGUucG9zaXRpb247XG4gICAgICAgIHN0YXRlLnBvc2l0aW9uKys7XG4gICAgICAgIGNhcHR1cmVFbmQgPSBzdGF0ZS5wb3NpdGlvbjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNfRU9MKGNoKSkge1xuICAgICAgY2FwdHVyZVNlZ21lbnQoc3RhdGUsIGNhcHR1cmVTdGFydCwgY2FwdHVyZUVuZCwgdHJ1ZSk7XG4gICAgICB3cml0ZUZvbGRlZExpbmVzKHN0YXRlLCBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCBmYWxzZSwgbm9kZUluZGVudCkpO1xuICAgICAgY2FwdHVyZVN0YXJ0ID0gY2FwdHVyZUVuZCA9IHN0YXRlLnBvc2l0aW9uO1xuICAgIH0gZWxzZSBpZiAoc3RhdGUucG9zaXRpb24gPT09IHN0YXRlLmxpbmVTdGFydCAmJiB0ZXN0RG9jdW1lbnRTZXBhcmF0b3Ioc3RhdGUpKSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCBcInVuZXhwZWN0ZWQgZW5kIG9mIHRoZSBkb2N1bWVudCB3aXRoaW4gYSBzaW5nbGUgcXVvdGVkIHNjYWxhclwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhdGUucG9zaXRpb24rKztcbiAgICAgIGNhcHR1cmVFbmQgPSBzdGF0ZS5wb3NpdGlvbjtcbiAgICB9XG4gIH1cbiAgdGhyb3dFcnJvcihzdGF0ZSwgXCJ1bmV4cGVjdGVkIGVuZCBvZiB0aGUgc3RyZWFtIHdpdGhpbiBhIHNpbmdsZSBxdW90ZWQgc2NhbGFyXCIpO1xufVxuX19uYW1lKHJlYWRTaW5nbGVRdW90ZWRTY2FsYXIsIFwicmVhZFNpbmdsZVF1b3RlZFNjYWxhclwiKTtcbmZ1bmN0aW9uIHJlYWREb3VibGVRdW90ZWRTY2FsYXIoc3RhdGUsIG5vZGVJbmRlbnQpIHtcbiAgdmFyIGNhcHR1cmVTdGFydCwgY2FwdHVyZUVuZCwgaGV4TGVuZ3RoLCBoZXhSZXN1bHQsIHRtcCwgY2g7XG4gIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbik7XG4gIGlmIChjaCAhPT0gMzQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgc3RhdGUua2luZCA9IFwic2NhbGFyXCI7XG4gIHN0YXRlLnJlc3VsdCA9IFwiXCI7XG4gIHN0YXRlLnBvc2l0aW9uKys7XG4gIGNhcHR1cmVTdGFydCA9IGNhcHR1cmVFbmQgPSBzdGF0ZS5wb3NpdGlvbjtcbiAgd2hpbGUgKChjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pKSAhPT0gMCkge1xuICAgIGlmIChjaCA9PT0gMzQpIHtcbiAgICAgIGNhcHR1cmVTZWdtZW50KHN0YXRlLCBjYXB0dXJlU3RhcnQsIHN0YXRlLnBvc2l0aW9uLCB0cnVlKTtcbiAgICAgIHN0YXRlLnBvc2l0aW9uKys7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKGNoID09PSA5Mikge1xuICAgICAgY2FwdHVyZVNlZ21lbnQoc3RhdGUsIGNhcHR1cmVTdGFydCwgc3RhdGUucG9zaXRpb24sIHRydWUpO1xuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuICAgICAgaWYgKGlzX0VPTChjaCkpIHtcbiAgICAgICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgZmFsc2UsIG5vZGVJbmRlbnQpO1xuICAgICAgfSBlbHNlIGlmIChjaCA8IDI1NiAmJiBzaW1wbGVFc2NhcGVDaGVja1tjaF0pIHtcbiAgICAgICAgc3RhdGUucmVzdWx0ICs9IHNpbXBsZUVzY2FwZU1hcFtjaF07XG4gICAgICAgIHN0YXRlLnBvc2l0aW9uKys7XG4gICAgICB9IGVsc2UgaWYgKCh0bXAgPSBlc2NhcGVkSGV4TGVuKGNoKSkgPiAwKSB7XG4gICAgICAgIGhleExlbmd0aCA9IHRtcDtcbiAgICAgICAgaGV4UmVzdWx0ID0gMDtcbiAgICAgICAgZm9yICg7IGhleExlbmd0aCA+IDA7IGhleExlbmd0aC0tKSB7XG4gICAgICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuICAgICAgICAgIGlmICgodG1wID0gZnJvbUhleENvZGUoY2gpKSA+PSAwKSB7XG4gICAgICAgICAgICBoZXhSZXN1bHQgPSAoaGV4UmVzdWx0IDw8IDQpICsgdG1wO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCBcImV4cGVjdGVkIGhleGFkZWNpbWFsIGNoYXJhY3RlclwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc3RhdGUucmVzdWx0ICs9IGNoYXJGcm9tQ29kZXBvaW50KGhleFJlc3VsdCk7XG4gICAgICAgIHN0YXRlLnBvc2l0aW9uKys7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCBcInVua25vd24gZXNjYXBlIHNlcXVlbmNlXCIpO1xuICAgICAgfVxuICAgICAgY2FwdHVyZVN0YXJ0ID0gY2FwdHVyZUVuZCA9IHN0YXRlLnBvc2l0aW9uO1xuICAgIH0gZWxzZSBpZiAoaXNfRU9MKGNoKSkge1xuICAgICAgY2FwdHVyZVNlZ21lbnQoc3RhdGUsIGNhcHR1cmVTdGFydCwgY2FwdHVyZUVuZCwgdHJ1ZSk7XG4gICAgICB3cml0ZUZvbGRlZExpbmVzKHN0YXRlLCBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCBmYWxzZSwgbm9kZUluZGVudCkpO1xuICAgICAgY2FwdHVyZVN0YXJ0ID0gY2FwdHVyZUVuZCA9IHN0YXRlLnBvc2l0aW9uO1xuICAgIH0gZWxzZSBpZiAoc3RhdGUucG9zaXRpb24gPT09IHN0YXRlLmxpbmVTdGFydCAmJiB0ZXN0RG9jdW1lbnRTZXBhcmF0b3Ioc3RhdGUpKSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCBcInVuZXhwZWN0ZWQgZW5kIG9mIHRoZSBkb2N1bWVudCB3aXRoaW4gYSBkb3VibGUgcXVvdGVkIHNjYWxhclwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhdGUucG9zaXRpb24rKztcbiAgICAgIGNhcHR1cmVFbmQgPSBzdGF0ZS5wb3NpdGlvbjtcbiAgICB9XG4gIH1cbiAgdGhyb3dFcnJvcihzdGF0ZSwgXCJ1bmV4cGVjdGVkIGVuZCBvZiB0aGUgc3RyZWFtIHdpdGhpbiBhIGRvdWJsZSBxdW90ZWQgc2NhbGFyXCIpO1xufVxuX19uYW1lKHJlYWREb3VibGVRdW90ZWRTY2FsYXIsIFwicmVhZERvdWJsZVF1b3RlZFNjYWxhclwiKTtcbmZ1bmN0aW9uIHJlYWRGbG93Q29sbGVjdGlvbihzdGF0ZSwgbm9kZUluZGVudCkge1xuICB2YXIgcmVhZE5leHQgPSB0cnVlLCBfbGluZSwgX2xpbmVTdGFydCwgX3BvcywgX3RhZyA9IHN0YXRlLnRhZywgX3Jlc3VsdCwgX2FuY2hvciA9IHN0YXRlLmFuY2hvciwgZm9sbG93aW5nLCB0ZXJtaW5hdG9yLCBpc1BhaXIsIGlzRXhwbGljaXRQYWlyLCBpc01hcHBpbmcsIG92ZXJyaWRhYmxlS2V5cyA9IC8qIEBfX1BVUkVfXyAqLyBPYmplY3QuY3JlYXRlKG51bGwpLCBrZXlOb2RlLCBrZXlUYWcsIHZhbHVlTm9kZSwgY2g7XG4gIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbik7XG4gIGlmIChjaCA9PT0gOTEpIHtcbiAgICB0ZXJtaW5hdG9yID0gOTM7XG4gICAgaXNNYXBwaW5nID0gZmFsc2U7XG4gICAgX3Jlc3VsdCA9IFtdO1xuICB9IGVsc2UgaWYgKGNoID09PSAxMjMpIHtcbiAgICB0ZXJtaW5hdG9yID0gMTI1O1xuICAgIGlzTWFwcGluZyA9IHRydWU7XG4gICAgX3Jlc3VsdCA9IHt9O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoc3RhdGUuYW5jaG9yICE9PSBudWxsKSB7XG4gICAgc3RhdGUuYW5jaG9yTWFwW3N0YXRlLmFuY2hvcl0gPSBfcmVzdWx0O1xuICB9XG4gIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcbiAgd2hpbGUgKGNoICE9PSAwKSB7XG4gICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgbm9kZUluZGVudCk7XG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKTtcbiAgICBpZiAoY2ggPT09IHRlcm1pbmF0b3IpIHtcbiAgICAgIHN0YXRlLnBvc2l0aW9uKys7XG4gICAgICBzdGF0ZS50YWcgPSBfdGFnO1xuICAgICAgc3RhdGUuYW5jaG9yID0gX2FuY2hvcjtcbiAgICAgIHN0YXRlLmtpbmQgPSBpc01hcHBpbmcgPyBcIm1hcHBpbmdcIiA6IFwic2VxdWVuY2VcIjtcbiAgICAgIHN0YXRlLnJlc3VsdCA9IF9yZXN1bHQ7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKCFyZWFkTmV4dCkge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgXCJtaXNzZWQgY29tbWEgYmV0d2VlbiBmbG93IGNvbGxlY3Rpb24gZW50cmllc1wiKTtcbiAgICB9IGVsc2UgaWYgKGNoID09PSA0NCkge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgXCJleHBlY3RlZCB0aGUgbm9kZSBjb250ZW50LCBidXQgZm91bmQgJywnXCIpO1xuICAgIH1cbiAgICBrZXlUYWcgPSBrZXlOb2RlID0gdmFsdWVOb2RlID0gbnVsbDtcbiAgICBpc1BhaXIgPSBpc0V4cGxpY2l0UGFpciA9IGZhbHNlO1xuICAgIGlmIChjaCA9PT0gNjMpIHtcbiAgICAgIGZvbGxvd2luZyA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24gKyAxKTtcbiAgICAgIGlmIChpc19XU19PUl9FT0woZm9sbG93aW5nKSkge1xuICAgICAgICBpc1BhaXIgPSBpc0V4cGxpY2l0UGFpciA9IHRydWU7XG4gICAgICAgIHN0YXRlLnBvc2l0aW9uKys7XG4gICAgICAgIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUsIG5vZGVJbmRlbnQpO1xuICAgICAgfVxuICAgIH1cbiAgICBfbGluZSA9IHN0YXRlLmxpbmU7XG4gICAgX2xpbmVTdGFydCA9IHN0YXRlLmxpbmVTdGFydDtcbiAgICBfcG9zID0gc3RhdGUucG9zaXRpb247XG4gICAgY29tcG9zZU5vZGUoc3RhdGUsIG5vZGVJbmRlbnQsIENPTlRFWFRfRkxPV19JTiwgZmFsc2UsIHRydWUpO1xuICAgIGtleVRhZyA9IHN0YXRlLnRhZztcbiAgICBrZXlOb2RlID0gc3RhdGUucmVzdWx0O1xuICAgIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUsIG5vZGVJbmRlbnQpO1xuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbik7XG4gICAgaWYgKChpc0V4cGxpY2l0UGFpciB8fCBzdGF0ZS5saW5lID09PSBfbGluZSkgJiYgY2ggPT09IDU4KSB7XG4gICAgICBpc1BhaXIgPSB0cnVlO1xuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuICAgICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgbm9kZUluZGVudCk7XG4gICAgICBjb21wb3NlTm9kZShzdGF0ZSwgbm9kZUluZGVudCwgQ09OVEVYVF9GTE9XX0lOLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICB2YWx1ZU5vZGUgPSBzdGF0ZS5yZXN1bHQ7XG4gICAgfVxuICAgIGlmIChpc01hcHBpbmcpIHtcbiAgICAgIHN0b3JlTWFwcGluZ1BhaXIoc3RhdGUsIF9yZXN1bHQsIG92ZXJyaWRhYmxlS2V5cywga2V5VGFnLCBrZXlOb2RlLCB2YWx1ZU5vZGUsIF9saW5lLCBfbGluZVN0YXJ0LCBfcG9zKTtcbiAgICB9IGVsc2UgaWYgKGlzUGFpcikge1xuICAgICAgX3Jlc3VsdC5wdXNoKHN0b3JlTWFwcGluZ1BhaXIoc3RhdGUsIG51bGwsIG92ZXJyaWRhYmxlS2V5cywga2V5VGFnLCBrZXlOb2RlLCB2YWx1ZU5vZGUsIF9saW5lLCBfbGluZVN0YXJ0LCBfcG9zKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIF9yZXN1bHQucHVzaChrZXlOb2RlKTtcbiAgICB9XG4gICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgbm9kZUluZGVudCk7XG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKTtcbiAgICBpZiAoY2ggPT09IDQ0KSB7XG4gICAgICByZWFkTmV4dCA9IHRydWU7XG4gICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlYWROZXh0ID0gZmFsc2U7XG4gICAgfVxuICB9XG4gIHRocm93RXJyb3Ioc3RhdGUsIFwidW5leHBlY3RlZCBlbmQgb2YgdGhlIHN0cmVhbSB3aXRoaW4gYSBmbG93IGNvbGxlY3Rpb25cIik7XG59XG5fX25hbWUocmVhZEZsb3dDb2xsZWN0aW9uLCBcInJlYWRGbG93Q29sbGVjdGlvblwiKTtcbmZ1bmN0aW9uIHJlYWRCbG9ja1NjYWxhcihzdGF0ZSwgbm9kZUluZGVudCkge1xuICB2YXIgY2FwdHVyZVN0YXJ0LCBmb2xkaW5nLCBjaG9tcGluZyA9IENIT01QSU5HX0NMSVAsIGRpZFJlYWRDb250ZW50ID0gZmFsc2UsIGRldGVjdGVkSW5kZW50ID0gZmFsc2UsIHRleHRJbmRlbnQgPSBub2RlSW5kZW50LCBlbXB0eUxpbmVzID0gMCwgYXRNb3JlSW5kZW50ZWQgPSBmYWxzZSwgdG1wLCBjaDtcbiAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKTtcbiAgaWYgKGNoID09PSAxMjQpIHtcbiAgICBmb2xkaW5nID0gZmFsc2U7XG4gIH0gZWxzZSBpZiAoY2ggPT09IDYyKSB7XG4gICAgZm9sZGluZyA9IHRydWU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHN0YXRlLmtpbmQgPSBcInNjYWxhclwiO1xuICBzdGF0ZS5yZXN1bHQgPSBcIlwiO1xuICB3aGlsZSAoY2ggIT09IDApIHtcbiAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG4gICAgaWYgKGNoID09PSA0MyB8fCBjaCA9PT0gNDUpIHtcbiAgICAgIGlmIChDSE9NUElOR19DTElQID09PSBjaG9tcGluZykge1xuICAgICAgICBjaG9tcGluZyA9IGNoID09PSA0MyA/IENIT01QSU5HX0tFRVAgOiBDSE9NUElOR19TVFJJUDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93RXJyb3Ioc3RhdGUsIFwicmVwZWF0IG9mIGEgY2hvbXBpbmcgbW9kZSBpZGVudGlmaWVyXCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoKHRtcCA9IGZyb21EZWNpbWFsQ29kZShjaCkpID49IDApIHtcbiAgICAgIGlmICh0bXAgPT09IDApIHtcbiAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgXCJiYWQgZXhwbGljaXQgaW5kZW50YXRpb24gd2lkdGggb2YgYSBibG9jayBzY2FsYXI7IGl0IGNhbm5vdCBiZSBsZXNzIHRoYW4gb25lXCIpO1xuICAgICAgfSBlbHNlIGlmICghZGV0ZWN0ZWRJbmRlbnQpIHtcbiAgICAgICAgdGV4dEluZGVudCA9IG5vZGVJbmRlbnQgKyB0bXAgLSAxO1xuICAgICAgICBkZXRlY3RlZEluZGVudCA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvd0Vycm9yKHN0YXRlLCBcInJlcGVhdCBvZiBhbiBpbmRlbnRhdGlvbiB3aWR0aCBpZGVudGlmaWVyXCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgaWYgKGlzX1dISVRFX1NQQUNFKGNoKSkge1xuICAgIGRvIHtcbiAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcbiAgICB9IHdoaWxlIChpc19XSElURV9TUEFDRShjaCkpO1xuICAgIGlmIChjaCA9PT0gMzUpIHtcbiAgICAgIGRvIHtcbiAgICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuICAgICAgfSB3aGlsZSAoIWlzX0VPTChjaCkgJiYgY2ggIT09IDApO1xuICAgIH1cbiAgfVxuICB3aGlsZSAoY2ggIT09IDApIHtcbiAgICByZWFkTGluZUJyZWFrKHN0YXRlKTtcbiAgICBzdGF0ZS5saW5lSW5kZW50ID0gMDtcbiAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pO1xuICAgIHdoaWxlICgoIWRldGVjdGVkSW5kZW50IHx8IHN0YXRlLmxpbmVJbmRlbnQgPCB0ZXh0SW5kZW50KSAmJiBjaCA9PT0gMzIpIHtcbiAgICAgIHN0YXRlLmxpbmVJbmRlbnQrKztcbiAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcbiAgICB9XG4gICAgaWYgKCFkZXRlY3RlZEluZGVudCAmJiBzdGF0ZS5saW5lSW5kZW50ID4gdGV4dEluZGVudCkge1xuICAgICAgdGV4dEluZGVudCA9IHN0YXRlLmxpbmVJbmRlbnQ7XG4gICAgfVxuICAgIGlmIChpc19FT0woY2gpKSB7XG4gICAgICBlbXB0eUxpbmVzKys7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPCB0ZXh0SW5kZW50KSB7XG4gICAgICBpZiAoY2hvbXBpbmcgPT09IENIT01QSU5HX0tFRVApIHtcbiAgICAgICAgc3RhdGUucmVzdWx0ICs9IGNvbW1vbi5yZXBlYXQoXCJcXG5cIiwgZGlkUmVhZENvbnRlbnQgPyAxICsgZW1wdHlMaW5lcyA6IGVtcHR5TGluZXMpO1xuICAgICAgfSBlbHNlIGlmIChjaG9tcGluZyA9PT0gQ0hPTVBJTkdfQ0xJUCkge1xuICAgICAgICBpZiAoZGlkUmVhZENvbnRlbnQpIHtcbiAgICAgICAgICBzdGF0ZS5yZXN1bHQgKz0gXCJcXG5cIjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGlmIChmb2xkaW5nKSB7XG4gICAgICBpZiAoaXNfV0hJVEVfU1BBQ0UoY2gpKSB7XG4gICAgICAgIGF0TW9yZUluZGVudGVkID0gdHJ1ZTtcbiAgICAgICAgc3RhdGUucmVzdWx0ICs9IGNvbW1vbi5yZXBlYXQoXCJcXG5cIiwgZGlkUmVhZENvbnRlbnQgPyAxICsgZW1wdHlMaW5lcyA6IGVtcHR5TGluZXMpO1xuICAgICAgfSBlbHNlIGlmIChhdE1vcmVJbmRlbnRlZCkge1xuICAgICAgICBhdE1vcmVJbmRlbnRlZCA9IGZhbHNlO1xuICAgICAgICBzdGF0ZS5yZXN1bHQgKz0gY29tbW9uLnJlcGVhdChcIlxcblwiLCBlbXB0eUxpbmVzICsgMSk7XG4gICAgICB9IGVsc2UgaWYgKGVtcHR5TGluZXMgPT09IDApIHtcbiAgICAgICAgaWYgKGRpZFJlYWRDb250ZW50KSB7XG4gICAgICAgICAgc3RhdGUucmVzdWx0ICs9IFwiIFwiO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdGF0ZS5yZXN1bHQgKz0gY29tbW9uLnJlcGVhdChcIlxcblwiLCBlbXB0eUxpbmVzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3RhdGUucmVzdWx0ICs9IGNvbW1vbi5yZXBlYXQoXCJcXG5cIiwgZGlkUmVhZENvbnRlbnQgPyAxICsgZW1wdHlMaW5lcyA6IGVtcHR5TGluZXMpO1xuICAgIH1cbiAgICBkaWRSZWFkQ29udGVudCA9IHRydWU7XG4gICAgZGV0ZWN0ZWRJbmRlbnQgPSB0cnVlO1xuICAgIGVtcHR5TGluZXMgPSAwO1xuICAgIGNhcHR1cmVTdGFydCA9IHN0YXRlLnBvc2l0aW9uO1xuICAgIHdoaWxlICghaXNfRU9MKGNoKSAmJiBjaCAhPT0gMCkge1xuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuICAgIH1cbiAgICBjYXB0dXJlU2VnbWVudChzdGF0ZSwgY2FwdHVyZVN0YXJ0LCBzdGF0ZS5wb3NpdGlvbiwgZmFsc2UpO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuX19uYW1lKHJlYWRCbG9ja1NjYWxhciwgXCJyZWFkQmxvY2tTY2FsYXJcIik7XG5mdW5jdGlvbiByZWFkQmxvY2tTZXF1ZW5jZShzdGF0ZSwgbm9kZUluZGVudCkge1xuICB2YXIgX2xpbmUsIF90YWcgPSBzdGF0ZS50YWcsIF9hbmNob3IgPSBzdGF0ZS5hbmNob3IsIF9yZXN1bHQgPSBbXSwgZm9sbG93aW5nLCBkZXRlY3RlZCA9IGZhbHNlLCBjaDtcbiAgaWYgKHN0YXRlLmZpcnN0VGFiSW5MaW5lICE9PSAtMSkgcmV0dXJuIGZhbHNlO1xuICBpZiAoc3RhdGUuYW5jaG9yICE9PSBudWxsKSB7XG4gICAgc3RhdGUuYW5jaG9yTWFwW3N0YXRlLmFuY2hvcl0gPSBfcmVzdWx0O1xuICB9XG4gIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbik7XG4gIHdoaWxlIChjaCAhPT0gMCkge1xuICAgIGlmIChzdGF0ZS5maXJzdFRhYkluTGluZSAhPT0gLTEpIHtcbiAgICAgIHN0YXRlLnBvc2l0aW9uID0gc3RhdGUuZmlyc3RUYWJJbkxpbmU7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCBcInRhYiBjaGFyYWN0ZXJzIG11c3Qgbm90IGJlIHVzZWQgaW4gaW5kZW50YXRpb25cIik7XG4gICAgfVxuICAgIGlmIChjaCAhPT0gNDUpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBmb2xsb3dpbmcgPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uICsgMSk7XG4gICAgaWYgKCFpc19XU19PUl9FT0woZm9sbG93aW5nKSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGRldGVjdGVkID0gdHJ1ZTtcbiAgICBzdGF0ZS5wb3NpdGlvbisrO1xuICAgIGlmIChza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlLCAtMSkpIHtcbiAgICAgIGlmIChzdGF0ZS5saW5lSW5kZW50IDw9IG5vZGVJbmRlbnQpIHtcbiAgICAgICAgX3Jlc3VsdC5wdXNoKG51bGwpO1xuICAgICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgX2xpbmUgPSBzdGF0ZS5saW5lO1xuICAgIGNvbXBvc2VOb2RlKHN0YXRlLCBub2RlSW5kZW50LCBDT05URVhUX0JMT0NLX0lOLCBmYWxzZSwgdHJ1ZSk7XG4gICAgX3Jlc3VsdC5wdXNoKHN0YXRlLnJlc3VsdCk7XG4gICAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgLTEpO1xuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbik7XG4gICAgaWYgKChzdGF0ZS5saW5lID09PSBfbGluZSB8fCBzdGF0ZS5saW5lSW5kZW50ID4gbm9kZUluZGVudCkgJiYgY2ggIT09IDApIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsIFwiYmFkIGluZGVudGF0aW9uIG9mIGEgc2VxdWVuY2UgZW50cnlcIik7XG4gICAgfSBlbHNlIGlmIChzdGF0ZS5saW5lSW5kZW50IDwgbm9kZUluZGVudCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIGlmIChkZXRlY3RlZCkge1xuICAgIHN0YXRlLnRhZyA9IF90YWc7XG4gICAgc3RhdGUuYW5jaG9yID0gX2FuY2hvcjtcbiAgICBzdGF0ZS5raW5kID0gXCJzZXF1ZW5jZVwiO1xuICAgIHN0YXRlLnJlc3VsdCA9IF9yZXN1bHQ7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuX19uYW1lKHJlYWRCbG9ja1NlcXVlbmNlLCBcInJlYWRCbG9ja1NlcXVlbmNlXCIpO1xuZnVuY3Rpb24gcmVhZEJsb2NrTWFwcGluZyhzdGF0ZSwgbm9kZUluZGVudCwgZmxvd0luZGVudCkge1xuICB2YXIgZm9sbG93aW5nLCBhbGxvd0NvbXBhY3QsIF9saW5lLCBfa2V5TGluZSwgX2tleUxpbmVTdGFydCwgX2tleVBvcywgX3RhZyA9IHN0YXRlLnRhZywgX2FuY2hvciA9IHN0YXRlLmFuY2hvciwgX3Jlc3VsdCA9IHt9LCBvdmVycmlkYWJsZUtleXMgPSAvKiBAX19QVVJFX18gKi8gT2JqZWN0LmNyZWF0ZShudWxsKSwga2V5VGFnID0gbnVsbCwga2V5Tm9kZSA9IG51bGwsIHZhbHVlTm9kZSA9IG51bGwsIGF0RXhwbGljaXRLZXkgPSBmYWxzZSwgZGV0ZWN0ZWQgPSBmYWxzZSwgY2g7XG4gIGlmIChzdGF0ZS5maXJzdFRhYkluTGluZSAhPT0gLTEpIHJldHVybiBmYWxzZTtcbiAgaWYgKHN0YXRlLmFuY2hvciAhPT0gbnVsbCkge1xuICAgIHN0YXRlLmFuY2hvck1hcFtzdGF0ZS5hbmNob3JdID0gX3Jlc3VsdDtcbiAgfVxuICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pO1xuICB3aGlsZSAoY2ggIT09IDApIHtcbiAgICBpZiAoIWF0RXhwbGljaXRLZXkgJiYgc3RhdGUuZmlyc3RUYWJJbkxpbmUgIT09IC0xKSB7XG4gICAgICBzdGF0ZS5wb3NpdGlvbiA9IHN0YXRlLmZpcnN0VGFiSW5MaW5lO1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgXCJ0YWIgY2hhcmFjdGVycyBtdXN0IG5vdCBiZSB1c2VkIGluIGluZGVudGF0aW9uXCIpO1xuICAgIH1cbiAgICBmb2xsb3dpbmcgPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uICsgMSk7XG4gICAgX2xpbmUgPSBzdGF0ZS5saW5lO1xuICAgIGlmICgoY2ggPT09IDYzIHx8IGNoID09PSA1OCkgJiYgaXNfV1NfT1JfRU9MKGZvbGxvd2luZykpIHtcbiAgICAgIGlmIChjaCA9PT0gNjMpIHtcbiAgICAgICAgaWYgKGF0RXhwbGljaXRLZXkpIHtcbiAgICAgICAgICBzdG9yZU1hcHBpbmdQYWlyKHN0YXRlLCBfcmVzdWx0LCBvdmVycmlkYWJsZUtleXMsIGtleVRhZywga2V5Tm9kZSwgbnVsbCwgX2tleUxpbmUsIF9rZXlMaW5lU3RhcnQsIF9rZXlQb3MpO1xuICAgICAgICAgIGtleVRhZyA9IGtleU5vZGUgPSB2YWx1ZU5vZGUgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGRldGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgYXRFeHBsaWNpdEtleSA9IHRydWU7XG4gICAgICAgIGFsbG93Q29tcGFjdCA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKGF0RXhwbGljaXRLZXkpIHtcbiAgICAgICAgYXRFeHBsaWNpdEtleSA9IGZhbHNlO1xuICAgICAgICBhbGxvd0NvbXBhY3QgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgXCJpbmNvbXBsZXRlIGV4cGxpY2l0IG1hcHBpbmcgcGFpcjsgYSBrZXkgbm9kZSBpcyBtaXNzZWQ7IG9yIGZvbGxvd2VkIGJ5IGEgbm9uLXRhYnVsYXRlZCBlbXB0eSBsaW5lXCIpO1xuICAgICAgfVxuICAgICAgc3RhdGUucG9zaXRpb24gKz0gMTtcbiAgICAgIGNoID0gZm9sbG93aW5nO1xuICAgIH0gZWxzZSB7XG4gICAgICBfa2V5TGluZSA9IHN0YXRlLmxpbmU7XG4gICAgICBfa2V5TGluZVN0YXJ0ID0gc3RhdGUubGluZVN0YXJ0O1xuICAgICAgX2tleVBvcyA9IHN0YXRlLnBvc2l0aW9uO1xuICAgICAgaWYgKCFjb21wb3NlTm9kZShzdGF0ZSwgZmxvd0luZGVudCwgQ09OVEVYVF9GTE9XX09VVCwgZmFsc2UsIHRydWUpKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaWYgKHN0YXRlLmxpbmUgPT09IF9saW5lKSB7XG4gICAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbik7XG4gICAgICAgIHdoaWxlIChpc19XSElURV9TUEFDRShjaCkpIHtcbiAgICAgICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoID09PSA1OCkge1xuICAgICAgICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcbiAgICAgICAgICBpZiAoIWlzX1dTX09SX0VPTChjaCkpIHtcbiAgICAgICAgICAgIHRocm93RXJyb3Ioc3RhdGUsIFwiYSB3aGl0ZXNwYWNlIGNoYXJhY3RlciBpcyBleHBlY3RlZCBhZnRlciB0aGUga2V5LXZhbHVlIHNlcGFyYXRvciB3aXRoaW4gYSBibG9jayBtYXBwaW5nXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoYXRFeHBsaWNpdEtleSkge1xuICAgICAgICAgICAgc3RvcmVNYXBwaW5nUGFpcihzdGF0ZSwgX3Jlc3VsdCwgb3ZlcnJpZGFibGVLZXlzLCBrZXlUYWcsIGtleU5vZGUsIG51bGwsIF9rZXlMaW5lLCBfa2V5TGluZVN0YXJ0LCBfa2V5UG9zKTtcbiAgICAgICAgICAgIGtleVRhZyA9IGtleU5vZGUgPSB2YWx1ZU5vZGUgPSBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgICBkZXRlY3RlZCA9IHRydWU7XG4gICAgICAgICAgYXRFeHBsaWNpdEtleSA9IGZhbHNlO1xuICAgICAgICAgIGFsbG93Q29tcGFjdCA9IGZhbHNlO1xuICAgICAgICAgIGtleVRhZyA9IHN0YXRlLnRhZztcbiAgICAgICAgICBrZXlOb2RlID0gc3RhdGUucmVzdWx0O1xuICAgICAgICB9IGVsc2UgaWYgKGRldGVjdGVkKSB7XG4gICAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgXCJjYW4gbm90IHJlYWQgYW4gaW1wbGljaXQgbWFwcGluZyBwYWlyOyBhIGNvbG9uIGlzIG1pc3NlZFwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdGF0ZS50YWcgPSBfdGFnO1xuICAgICAgICAgIHN0YXRlLmFuY2hvciA9IF9hbmNob3I7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZGV0ZWN0ZWQpIHtcbiAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgXCJjYW4gbm90IHJlYWQgYSBibG9jayBtYXBwaW5nIGVudHJ5OyBhIG11bHRpbGluZSBrZXkgbWF5IG5vdCBiZSBhbiBpbXBsaWNpdCBrZXlcIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdGF0ZS50YWcgPSBfdGFnO1xuICAgICAgICBzdGF0ZS5hbmNob3IgPSBfYW5jaG9yO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHN0YXRlLmxpbmUgPT09IF9saW5lIHx8IHN0YXRlLmxpbmVJbmRlbnQgPiBub2RlSW5kZW50KSB7XG4gICAgICBpZiAoYXRFeHBsaWNpdEtleSkge1xuICAgICAgICBfa2V5TGluZSA9IHN0YXRlLmxpbmU7XG4gICAgICAgIF9rZXlMaW5lU3RhcnQgPSBzdGF0ZS5saW5lU3RhcnQ7XG4gICAgICAgIF9rZXlQb3MgPSBzdGF0ZS5wb3NpdGlvbjtcbiAgICAgIH1cbiAgICAgIGlmIChjb21wb3NlTm9kZShzdGF0ZSwgbm9kZUluZGVudCwgQ09OVEVYVF9CTE9DS19PVVQsIHRydWUsIGFsbG93Q29tcGFjdCkpIHtcbiAgICAgICAgaWYgKGF0RXhwbGljaXRLZXkpIHtcbiAgICAgICAgICBrZXlOb2RlID0gc3RhdGUucmVzdWx0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbHVlTm9kZSA9IHN0YXRlLnJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFhdEV4cGxpY2l0S2V5KSB7XG4gICAgICAgIHN0b3JlTWFwcGluZ1BhaXIoc3RhdGUsIF9yZXN1bHQsIG92ZXJyaWRhYmxlS2V5cywga2V5VGFnLCBrZXlOb2RlLCB2YWx1ZU5vZGUsIF9rZXlMaW5lLCBfa2V5TGluZVN0YXJ0LCBfa2V5UG9zKTtcbiAgICAgICAga2V5VGFnID0ga2V5Tm9kZSA9IHZhbHVlTm9kZSA9IG51bGw7XG4gICAgICB9XG4gICAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlLCAtMSk7XG4gICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pO1xuICAgIH1cbiAgICBpZiAoKHN0YXRlLmxpbmUgPT09IF9saW5lIHx8IHN0YXRlLmxpbmVJbmRlbnQgPiBub2RlSW5kZW50KSAmJiBjaCAhPT0gMCkge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgXCJiYWQgaW5kZW50YXRpb24gb2YgYSBtYXBwaW5nIGVudHJ5XCIpO1xuICAgIH0gZWxzZSBpZiAoc3RhdGUubGluZUluZGVudCA8IG5vZGVJbmRlbnQpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBpZiAoYXRFeHBsaWNpdEtleSkge1xuICAgIHN0b3JlTWFwcGluZ1BhaXIoc3RhdGUsIF9yZXN1bHQsIG92ZXJyaWRhYmxlS2V5cywga2V5VGFnLCBrZXlOb2RlLCBudWxsLCBfa2V5TGluZSwgX2tleUxpbmVTdGFydCwgX2tleVBvcyk7XG4gIH1cbiAgaWYgKGRldGVjdGVkKSB7XG4gICAgc3RhdGUudGFnID0gX3RhZztcbiAgICBzdGF0ZS5hbmNob3IgPSBfYW5jaG9yO1xuICAgIHN0YXRlLmtpbmQgPSBcIm1hcHBpbmdcIjtcbiAgICBzdGF0ZS5yZXN1bHQgPSBfcmVzdWx0O1xuICB9XG4gIHJldHVybiBkZXRlY3RlZDtcbn1cbl9fbmFtZShyZWFkQmxvY2tNYXBwaW5nLCBcInJlYWRCbG9ja01hcHBpbmdcIik7XG5mdW5jdGlvbiByZWFkVGFnUHJvcGVydHkoc3RhdGUpIHtcbiAgdmFyIF9wb3NpdGlvbiwgaXNWZXJiYXRpbSA9IGZhbHNlLCBpc05hbWVkID0gZmFsc2UsIHRhZ0hhbmRsZSwgdGFnTmFtZSwgY2g7XG4gIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbik7XG4gIGlmIChjaCAhPT0gMzMpIHJldHVybiBmYWxzZTtcbiAgaWYgKHN0YXRlLnRhZyAhPT0gbnVsbCkge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsIFwiZHVwbGljYXRpb24gb2YgYSB0YWcgcHJvcGVydHlcIik7XG4gIH1cbiAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuICBpZiAoY2ggPT09IDYwKSB7XG4gICAgaXNWZXJiYXRpbSA9IHRydWU7XG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuICB9IGVsc2UgaWYgKGNoID09PSAzMykge1xuICAgIGlzTmFtZWQgPSB0cnVlO1xuICAgIHRhZ0hhbmRsZSA9IFwiISFcIjtcbiAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG4gIH0gZWxzZSB7XG4gICAgdGFnSGFuZGxlID0gXCIhXCI7XG4gIH1cbiAgX3Bvc2l0aW9uID0gc3RhdGUucG9zaXRpb247XG4gIGlmIChpc1ZlcmJhdGltKSB7XG4gICAgZG8ge1xuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuICAgIH0gd2hpbGUgKGNoICE9PSAwICYmIGNoICE9PSA2Mik7XG4gICAgaWYgKHN0YXRlLnBvc2l0aW9uIDwgc3RhdGUubGVuZ3RoKSB7XG4gICAgICB0YWdOYW1lID0gc3RhdGUuaW5wdXQuc2xpY2UoX3Bvc2l0aW9uLCBzdGF0ZS5wb3NpdGlvbik7XG4gICAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsIFwidW5leHBlY3RlZCBlbmQgb2YgdGhlIHN0cmVhbSB3aXRoaW4gYSB2ZXJiYXRpbSB0YWdcIik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHdoaWxlIChjaCAhPT0gMCAmJiAhaXNfV1NfT1JfRU9MKGNoKSkge1xuICAgICAgaWYgKGNoID09PSAzMykge1xuICAgICAgICBpZiAoIWlzTmFtZWQpIHtcbiAgICAgICAgICB0YWdIYW5kbGUgPSBzdGF0ZS5pbnB1dC5zbGljZShfcG9zaXRpb24gLSAxLCBzdGF0ZS5wb3NpdGlvbiArIDEpO1xuICAgICAgICAgIGlmICghUEFUVEVSTl9UQUdfSEFORExFLnRlc3QodGFnSGFuZGxlKSkge1xuICAgICAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgXCJuYW1lZCB0YWcgaGFuZGxlIGNhbm5vdCBjb250YWluIHN1Y2ggY2hhcmFjdGVyc1wiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaXNOYW1lZCA9IHRydWU7XG4gICAgICAgICAgX3Bvc2l0aW9uID0gc3RhdGUucG9zaXRpb24gKyAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93RXJyb3Ioc3RhdGUsIFwidGFnIHN1ZmZpeCBjYW5ub3QgY29udGFpbiBleGNsYW1hdGlvbiBtYXJrc1wiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuICAgIH1cbiAgICB0YWdOYW1lID0gc3RhdGUuaW5wdXQuc2xpY2UoX3Bvc2l0aW9uLCBzdGF0ZS5wb3NpdGlvbik7XG4gICAgaWYgKFBBVFRFUk5fRkxPV19JTkRJQ0FUT1JTLnRlc3QodGFnTmFtZSkpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsIFwidGFnIHN1ZmZpeCBjYW5ub3QgY29udGFpbiBmbG93IGluZGljYXRvciBjaGFyYWN0ZXJzXCIpO1xuICAgIH1cbiAgfVxuICBpZiAodGFnTmFtZSAmJiAhUEFUVEVSTl9UQUdfVVJJLnRlc3QodGFnTmFtZSkpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCBcInRhZyBuYW1lIGNhbm5vdCBjb250YWluIHN1Y2ggY2hhcmFjdGVyczogXCIgKyB0YWdOYW1lKTtcbiAgfVxuICB0cnkge1xuICAgIHRhZ05hbWUgPSBkZWNvZGVVUklDb21wb25lbnQodGFnTmFtZSk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsIFwidGFnIG5hbWUgaXMgbWFsZm9ybWVkOiBcIiArIHRhZ05hbWUpO1xuICB9XG4gIGlmIChpc1ZlcmJhdGltKSB7XG4gICAgc3RhdGUudGFnID0gdGFnTmFtZTtcbiAgfSBlbHNlIGlmIChfaGFzT3duUHJvcGVydHkkMS5jYWxsKHN0YXRlLnRhZ01hcCwgdGFnSGFuZGxlKSkge1xuICAgIHN0YXRlLnRhZyA9IHN0YXRlLnRhZ01hcFt0YWdIYW5kbGVdICsgdGFnTmFtZTtcbiAgfSBlbHNlIGlmICh0YWdIYW5kbGUgPT09IFwiIVwiKSB7XG4gICAgc3RhdGUudGFnID0gXCIhXCIgKyB0YWdOYW1lO1xuICB9IGVsc2UgaWYgKHRhZ0hhbmRsZSA9PT0gXCIhIVwiKSB7XG4gICAgc3RhdGUudGFnID0gXCJ0YWc6eWFtbC5vcmcsMjAwMjpcIiArIHRhZ05hbWU7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgJ3VuZGVjbGFyZWQgdGFnIGhhbmRsZSBcIicgKyB0YWdIYW5kbGUgKyAnXCInKTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cbl9fbmFtZShyZWFkVGFnUHJvcGVydHksIFwicmVhZFRhZ1Byb3BlcnR5XCIpO1xuZnVuY3Rpb24gcmVhZEFuY2hvclByb3BlcnR5KHN0YXRlKSB7XG4gIHZhciBfcG9zaXRpb24sIGNoO1xuICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pO1xuICBpZiAoY2ggIT09IDM4KSByZXR1cm4gZmFsc2U7XG4gIGlmIChzdGF0ZS5hbmNob3IgIT09IG51bGwpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCBcImR1cGxpY2F0aW9uIG9mIGFuIGFuY2hvciBwcm9wZXJ0eVwiKTtcbiAgfVxuICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG4gIF9wb3NpdGlvbiA9IHN0YXRlLnBvc2l0aW9uO1xuICB3aGlsZSAoY2ggIT09IDAgJiYgIWlzX1dTX09SX0VPTChjaCkgJiYgIWlzX0ZMT1dfSU5ESUNBVE9SKGNoKSkge1xuICAgIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdCgrK3N0YXRlLnBvc2l0aW9uKTtcbiAgfVxuICBpZiAoc3RhdGUucG9zaXRpb24gPT09IF9wb3NpdGlvbikge1xuICAgIHRocm93RXJyb3Ioc3RhdGUsIFwibmFtZSBvZiBhbiBhbmNob3Igbm9kZSBtdXN0IGNvbnRhaW4gYXQgbGVhc3Qgb25lIGNoYXJhY3RlclwiKTtcbiAgfVxuICBzdGF0ZS5hbmNob3IgPSBzdGF0ZS5pbnB1dC5zbGljZShfcG9zaXRpb24sIHN0YXRlLnBvc2l0aW9uKTtcbiAgcmV0dXJuIHRydWU7XG59XG5fX25hbWUocmVhZEFuY2hvclByb3BlcnR5LCBcInJlYWRBbmNob3JQcm9wZXJ0eVwiKTtcbmZ1bmN0aW9uIHJlYWRBbGlhcyhzdGF0ZSkge1xuICB2YXIgX3Bvc2l0aW9uLCBhbGlhcywgY2g7XG4gIGNoID0gc3RhdGUuaW5wdXQuY2hhckNvZGVBdChzdGF0ZS5wb3NpdGlvbik7XG4gIGlmIChjaCAhPT0gNDIpIHJldHVybiBmYWxzZTtcbiAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuICBfcG9zaXRpb24gPSBzdGF0ZS5wb3NpdGlvbjtcbiAgd2hpbGUgKGNoICE9PSAwICYmICFpc19XU19PUl9FT0woY2gpICYmICFpc19GTE9XX0lORElDQVRPUihjaCkpIHtcbiAgICBjaCA9IHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoKytzdGF0ZS5wb3NpdGlvbik7XG4gIH1cbiAgaWYgKHN0YXRlLnBvc2l0aW9uID09PSBfcG9zaXRpb24pIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCBcIm5hbWUgb2YgYW4gYWxpYXMgbm9kZSBtdXN0IGNvbnRhaW4gYXQgbGVhc3Qgb25lIGNoYXJhY3RlclwiKTtcbiAgfVxuICBhbGlhcyA9IHN0YXRlLmlucHV0LnNsaWNlKF9wb3NpdGlvbiwgc3RhdGUucG9zaXRpb24pO1xuICBpZiAoIV9oYXNPd25Qcm9wZXJ0eSQxLmNhbGwoc3RhdGUuYW5jaG9yTWFwLCBhbGlhcykpIHtcbiAgICB0aHJvd0Vycm9yKHN0YXRlLCAndW5pZGVudGlmaWVkIGFsaWFzIFwiJyArIGFsaWFzICsgJ1wiJyk7XG4gIH1cbiAgc3RhdGUucmVzdWx0ID0gc3RhdGUuYW5jaG9yTWFwW2FsaWFzXTtcbiAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgLTEpO1xuICByZXR1cm4gdHJ1ZTtcbn1cbl9fbmFtZShyZWFkQWxpYXMsIFwicmVhZEFsaWFzXCIpO1xuZnVuY3Rpb24gY29tcG9zZU5vZGUoc3RhdGUsIHBhcmVudEluZGVudCwgbm9kZUNvbnRleHQsIGFsbG93VG9TZWVrLCBhbGxvd0NvbXBhY3QpIHtcbiAgdmFyIGFsbG93QmxvY2tTdHlsZXMsIGFsbG93QmxvY2tTY2FsYXJzLCBhbGxvd0Jsb2NrQ29sbGVjdGlvbnMsIGluZGVudFN0YXR1cyA9IDEsIGF0TmV3TGluZSA9IGZhbHNlLCBoYXNDb250ZW50ID0gZmFsc2UsIHR5cGVJbmRleCwgdHlwZVF1YW50aXR5LCB0eXBlTGlzdCwgdHlwZTIsIGZsb3dJbmRlbnQsIGJsb2NrSW5kZW50O1xuICBpZiAoc3RhdGUubGlzdGVuZXIgIT09IG51bGwpIHtcbiAgICBzdGF0ZS5saXN0ZW5lcihcIm9wZW5cIiwgc3RhdGUpO1xuICB9XG4gIHN0YXRlLnRhZyA9IG51bGw7XG4gIHN0YXRlLmFuY2hvciA9IG51bGw7XG4gIHN0YXRlLmtpbmQgPSBudWxsO1xuICBzdGF0ZS5yZXN1bHQgPSBudWxsO1xuICBhbGxvd0Jsb2NrU3R5bGVzID0gYWxsb3dCbG9ja1NjYWxhcnMgPSBhbGxvd0Jsb2NrQ29sbGVjdGlvbnMgPSBDT05URVhUX0JMT0NLX09VVCA9PT0gbm9kZUNvbnRleHQgfHwgQ09OVEVYVF9CTE9DS19JTiA9PT0gbm9kZUNvbnRleHQ7XG4gIGlmIChhbGxvd1RvU2Vlaykge1xuICAgIGlmIChza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlLCAtMSkpIHtcbiAgICAgIGF0TmV3TGluZSA9IHRydWU7XG4gICAgICBpZiAoc3RhdGUubGluZUluZGVudCA+IHBhcmVudEluZGVudCkge1xuICAgICAgICBpbmRlbnRTdGF0dXMgPSAxO1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZS5saW5lSW5kZW50ID09PSBwYXJlbnRJbmRlbnQpIHtcbiAgICAgICAgaW5kZW50U3RhdHVzID0gMDtcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUubGluZUluZGVudCA8IHBhcmVudEluZGVudCkge1xuICAgICAgICBpbmRlbnRTdGF0dXMgPSAtMTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYgKGluZGVudFN0YXR1cyA9PT0gMSkge1xuICAgIHdoaWxlIChyZWFkVGFnUHJvcGVydHkoc3RhdGUpIHx8IHJlYWRBbmNob3JQcm9wZXJ0eShzdGF0ZSkpIHtcbiAgICAgIGlmIChza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlLCAtMSkpIHtcbiAgICAgICAgYXROZXdMaW5lID0gdHJ1ZTtcbiAgICAgICAgYWxsb3dCbG9ja0NvbGxlY3Rpb25zID0gYWxsb3dCbG9ja1N0eWxlcztcbiAgICAgICAgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPiBwYXJlbnRJbmRlbnQpIHtcbiAgICAgICAgICBpbmRlbnRTdGF0dXMgPSAxO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlLmxpbmVJbmRlbnQgPT09IHBhcmVudEluZGVudCkge1xuICAgICAgICAgIGluZGVudFN0YXR1cyA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUubGluZUluZGVudCA8IHBhcmVudEluZGVudCkge1xuICAgICAgICAgIGluZGVudFN0YXR1cyA9IC0xO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhbGxvd0Jsb2NrQ29sbGVjdGlvbnMgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYgKGFsbG93QmxvY2tDb2xsZWN0aW9ucykge1xuICAgIGFsbG93QmxvY2tDb2xsZWN0aW9ucyA9IGF0TmV3TGluZSB8fCBhbGxvd0NvbXBhY3Q7XG4gIH1cbiAgaWYgKGluZGVudFN0YXR1cyA9PT0gMSB8fCBDT05URVhUX0JMT0NLX09VVCA9PT0gbm9kZUNvbnRleHQpIHtcbiAgICBpZiAoQ09OVEVYVF9GTE9XX0lOID09PSBub2RlQ29udGV4dCB8fCBDT05URVhUX0ZMT1dfT1VUID09PSBub2RlQ29udGV4dCkge1xuICAgICAgZmxvd0luZGVudCA9IHBhcmVudEluZGVudDtcbiAgICB9IGVsc2Uge1xuICAgICAgZmxvd0luZGVudCA9IHBhcmVudEluZGVudCArIDE7XG4gICAgfVxuICAgIGJsb2NrSW5kZW50ID0gc3RhdGUucG9zaXRpb24gLSBzdGF0ZS5saW5lU3RhcnQ7XG4gICAgaWYgKGluZGVudFN0YXR1cyA9PT0gMSkge1xuICAgICAgaWYgKGFsbG93QmxvY2tDb2xsZWN0aW9ucyAmJiAocmVhZEJsb2NrU2VxdWVuY2Uoc3RhdGUsIGJsb2NrSW5kZW50KSB8fCByZWFkQmxvY2tNYXBwaW5nKHN0YXRlLCBibG9ja0luZGVudCwgZmxvd0luZGVudCkpIHx8IHJlYWRGbG93Q29sbGVjdGlvbihzdGF0ZSwgZmxvd0luZGVudCkpIHtcbiAgICAgICAgaGFzQ29udGVudCA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoYWxsb3dCbG9ja1NjYWxhcnMgJiYgcmVhZEJsb2NrU2NhbGFyKHN0YXRlLCBmbG93SW5kZW50KSB8fCByZWFkU2luZ2xlUXVvdGVkU2NhbGFyKHN0YXRlLCBmbG93SW5kZW50KSB8fCByZWFkRG91YmxlUXVvdGVkU2NhbGFyKHN0YXRlLCBmbG93SW5kZW50KSkge1xuICAgICAgICAgIGhhc0NvbnRlbnQgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKHJlYWRBbGlhcyhzdGF0ZSkpIHtcbiAgICAgICAgICBoYXNDb250ZW50ID0gdHJ1ZTtcbiAgICAgICAgICBpZiAoc3RhdGUudGFnICE9PSBudWxsIHx8IHN0YXRlLmFuY2hvciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgXCJhbGlhcyBub2RlIHNob3VsZCBub3QgaGF2ZSBhbnkgcHJvcGVydGllc1wiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAocmVhZFBsYWluU2NhbGFyKHN0YXRlLCBmbG93SW5kZW50LCBDT05URVhUX0ZMT1dfSU4gPT09IG5vZGVDb250ZXh0KSkge1xuICAgICAgICAgIGhhc0NvbnRlbnQgPSB0cnVlO1xuICAgICAgICAgIGlmIChzdGF0ZS50YWcgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHN0YXRlLnRhZyA9IFwiP1wiO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RhdGUuYW5jaG9yICE9PSBudWxsKSB7XG4gICAgICAgICAgc3RhdGUuYW5jaG9yTWFwW3N0YXRlLmFuY2hvcl0gPSBzdGF0ZS5yZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGluZGVudFN0YXR1cyA9PT0gMCkge1xuICAgICAgaGFzQ29udGVudCA9IGFsbG93QmxvY2tDb2xsZWN0aW9ucyAmJiByZWFkQmxvY2tTZXF1ZW5jZShzdGF0ZSwgYmxvY2tJbmRlbnQpO1xuICAgIH1cbiAgfVxuICBpZiAoc3RhdGUudGFnID09PSBudWxsKSB7XG4gICAgaWYgKHN0YXRlLmFuY2hvciAhPT0gbnVsbCkge1xuICAgICAgc3RhdGUuYW5jaG9yTWFwW3N0YXRlLmFuY2hvcl0gPSBzdGF0ZS5yZXN1bHQ7XG4gICAgfVxuICB9IGVsc2UgaWYgKHN0YXRlLnRhZyA9PT0gXCI/XCIpIHtcbiAgICBpZiAoc3RhdGUucmVzdWx0ICE9PSBudWxsICYmIHN0YXRlLmtpbmQgIT09IFwic2NhbGFyXCIpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsICd1bmFjY2VwdGFibGUgbm9kZSBraW5kIGZvciAhPD8+IHRhZzsgaXQgc2hvdWxkIGJlIFwic2NhbGFyXCIsIG5vdCBcIicgKyBzdGF0ZS5raW5kICsgJ1wiJyk7XG4gICAgfVxuICAgIGZvciAodHlwZUluZGV4ID0gMCwgdHlwZVF1YW50aXR5ID0gc3RhdGUuaW1wbGljaXRUeXBlcy5sZW5ndGg7IHR5cGVJbmRleCA8IHR5cGVRdWFudGl0eTsgdHlwZUluZGV4ICs9IDEpIHtcbiAgICAgIHR5cGUyID0gc3RhdGUuaW1wbGljaXRUeXBlc1t0eXBlSW5kZXhdO1xuICAgICAgaWYgKHR5cGUyLnJlc29sdmUoc3RhdGUucmVzdWx0KSkge1xuICAgICAgICBzdGF0ZS5yZXN1bHQgPSB0eXBlMi5jb25zdHJ1Y3Qoc3RhdGUucmVzdWx0KTtcbiAgICAgICAgc3RhdGUudGFnID0gdHlwZTIudGFnO1xuICAgICAgICBpZiAoc3RhdGUuYW5jaG9yICE9PSBudWxsKSB7XG4gICAgICAgICAgc3RhdGUuYW5jaG9yTWFwW3N0YXRlLmFuY2hvcl0gPSBzdGF0ZS5yZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKHN0YXRlLnRhZyAhPT0gXCIhXCIpIHtcbiAgICBpZiAoX2hhc093blByb3BlcnR5JDEuY2FsbChzdGF0ZS50eXBlTWFwW3N0YXRlLmtpbmQgfHwgXCJmYWxsYmFja1wiXSwgc3RhdGUudGFnKSkge1xuICAgICAgdHlwZTIgPSBzdGF0ZS50eXBlTWFwW3N0YXRlLmtpbmQgfHwgXCJmYWxsYmFja1wiXVtzdGF0ZS50YWddO1xuICAgIH0gZWxzZSB7XG4gICAgICB0eXBlMiA9IG51bGw7XG4gICAgICB0eXBlTGlzdCA9IHN0YXRlLnR5cGVNYXAubXVsdGlbc3RhdGUua2luZCB8fCBcImZhbGxiYWNrXCJdO1xuICAgICAgZm9yICh0eXBlSW5kZXggPSAwLCB0eXBlUXVhbnRpdHkgPSB0eXBlTGlzdC5sZW5ndGg7IHR5cGVJbmRleCA8IHR5cGVRdWFudGl0eTsgdHlwZUluZGV4ICs9IDEpIHtcbiAgICAgICAgaWYgKHN0YXRlLnRhZy5zbGljZSgwLCB0eXBlTGlzdFt0eXBlSW5kZXhdLnRhZy5sZW5ndGgpID09PSB0eXBlTGlzdFt0eXBlSW5kZXhdLnRhZykge1xuICAgICAgICAgIHR5cGUyID0gdHlwZUxpc3RbdHlwZUluZGV4XTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIXR5cGUyKSB7XG4gICAgICB0aHJvd0Vycm9yKHN0YXRlLCBcInVua25vd24gdGFnICE8XCIgKyBzdGF0ZS50YWcgKyBcIj5cIik7XG4gICAgfVxuICAgIGlmIChzdGF0ZS5yZXN1bHQgIT09IG51bGwgJiYgdHlwZTIua2luZCAhPT0gc3RhdGUua2luZCkge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgXCJ1bmFjY2VwdGFibGUgbm9kZSBraW5kIGZvciAhPFwiICsgc3RhdGUudGFnICsgJz4gdGFnOyBpdCBzaG91bGQgYmUgXCInICsgdHlwZTIua2luZCArICdcIiwgbm90IFwiJyArIHN0YXRlLmtpbmQgKyAnXCInKTtcbiAgICB9XG4gICAgaWYgKCF0eXBlMi5yZXNvbHZlKHN0YXRlLnJlc3VsdCwgc3RhdGUudGFnKSkge1xuICAgICAgdGhyb3dFcnJvcihzdGF0ZSwgXCJjYW5ub3QgcmVzb2x2ZSBhIG5vZGUgd2l0aCAhPFwiICsgc3RhdGUudGFnICsgXCI+IGV4cGxpY2l0IHRhZ1wiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhdGUucmVzdWx0ID0gdHlwZTIuY29uc3RydWN0KHN0YXRlLnJlc3VsdCwgc3RhdGUudGFnKTtcbiAgICAgIGlmIChzdGF0ZS5hbmNob3IgIT09IG51bGwpIHtcbiAgICAgICAgc3RhdGUuYW5jaG9yTWFwW3N0YXRlLmFuY2hvcl0gPSBzdGF0ZS5yZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGlmIChzdGF0ZS5saXN0ZW5lciAhPT0gbnVsbCkge1xuICAgIHN0YXRlLmxpc3RlbmVyKFwiY2xvc2VcIiwgc3RhdGUpO1xuICB9XG4gIHJldHVybiBzdGF0ZS50YWcgIT09IG51bGwgfHwgc3RhdGUuYW5jaG9yICE9PSBudWxsIHx8IGhhc0NvbnRlbnQ7XG59XG5fX25hbWUoY29tcG9zZU5vZGUsIFwiY29tcG9zZU5vZGVcIik7XG5mdW5jdGlvbiByZWFkRG9jdW1lbnQoc3RhdGUpIHtcbiAgdmFyIGRvY3VtZW50U3RhcnQgPSBzdGF0ZS5wb3NpdGlvbiwgX3Bvc2l0aW9uLCBkaXJlY3RpdmVOYW1lLCBkaXJlY3RpdmVBcmdzLCBoYXNEaXJlY3RpdmVzID0gZmFsc2UsIGNoO1xuICBzdGF0ZS52ZXJzaW9uID0gbnVsbDtcbiAgc3RhdGUuY2hlY2tMaW5lQnJlYWtzID0gc3RhdGUubGVnYWN5O1xuICBzdGF0ZS50YWdNYXAgPSAvKiBAX19QVVJFX18gKi8gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgc3RhdGUuYW5jaG9yTWFwID0gLyogQF9fUFVSRV9fICovIE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIHdoaWxlICgoY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSkgIT09IDApIHtcbiAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlLCAtMSk7XG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKTtcbiAgICBpZiAoc3RhdGUubGluZUluZGVudCA+IDAgfHwgY2ggIT09IDM3KSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgaGFzRGlyZWN0aXZlcyA9IHRydWU7XG4gICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuICAgIF9wb3NpdGlvbiA9IHN0YXRlLnBvc2l0aW9uO1xuICAgIHdoaWxlIChjaCAhPT0gMCAmJiAhaXNfV1NfT1JfRU9MKGNoKSkge1xuICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuICAgIH1cbiAgICBkaXJlY3RpdmVOYW1lID0gc3RhdGUuaW5wdXQuc2xpY2UoX3Bvc2l0aW9uLCBzdGF0ZS5wb3NpdGlvbik7XG4gICAgZGlyZWN0aXZlQXJncyA9IFtdO1xuICAgIGlmIChkaXJlY3RpdmVOYW1lLmxlbmd0aCA8IDEpIHtcbiAgICAgIHRocm93RXJyb3Ioc3RhdGUsIFwiZGlyZWN0aXZlIG5hbWUgbXVzdCBub3QgYmUgbGVzcyB0aGFuIG9uZSBjaGFyYWN0ZXIgaW4gbGVuZ3RoXCIpO1xuICAgIH1cbiAgICB3aGlsZSAoY2ggIT09IDApIHtcbiAgICAgIHdoaWxlIChpc19XSElURV9TUEFDRShjaCkpIHtcbiAgICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuICAgICAgfVxuICAgICAgaWYgKGNoID09PSAzNSkge1xuICAgICAgICBkbyB7XG4gICAgICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuICAgICAgICB9IHdoaWxlIChjaCAhPT0gMCAmJiAhaXNfRU9MKGNoKSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaWYgKGlzX0VPTChjaCkpIGJyZWFrO1xuICAgICAgX3Bvc2l0aW9uID0gc3RhdGUucG9zaXRpb247XG4gICAgICB3aGlsZSAoY2ggIT09IDAgJiYgIWlzX1dTX09SX0VPTChjaCkpIHtcbiAgICAgICAgY2ggPSBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KCsrc3RhdGUucG9zaXRpb24pO1xuICAgICAgfVxuICAgICAgZGlyZWN0aXZlQXJncy5wdXNoKHN0YXRlLmlucHV0LnNsaWNlKF9wb3NpdGlvbiwgc3RhdGUucG9zaXRpb24pKTtcbiAgICB9XG4gICAgaWYgKGNoICE9PSAwKSByZWFkTGluZUJyZWFrKHN0YXRlKTtcbiAgICBpZiAoX2hhc093blByb3BlcnR5JDEuY2FsbChkaXJlY3RpdmVIYW5kbGVycywgZGlyZWN0aXZlTmFtZSkpIHtcbiAgICAgIGRpcmVjdGl2ZUhhbmRsZXJzW2RpcmVjdGl2ZU5hbWVdKHN0YXRlLCBkaXJlY3RpdmVOYW1lLCBkaXJlY3RpdmVBcmdzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3dXYXJuaW5nKHN0YXRlLCAndW5rbm93biBkb2N1bWVudCBkaXJlY3RpdmUgXCInICsgZGlyZWN0aXZlTmFtZSArICdcIicpO1xuICAgIH1cbiAgfVxuICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlLCAtMSk7XG4gIGlmIChzdGF0ZS5saW5lSW5kZW50ID09PSAwICYmIHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pID09PSA0NSAmJiBzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uICsgMSkgPT09IDQ1ICYmIHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24gKyAyKSA9PT0gNDUpIHtcbiAgICBzdGF0ZS5wb3NpdGlvbiArPSAzO1xuICAgIHNraXBTZXBhcmF0aW9uU3BhY2Uoc3RhdGUsIHRydWUsIC0xKTtcbiAgfSBlbHNlIGlmIChoYXNEaXJlY3RpdmVzKSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgXCJkaXJlY3RpdmVzIGVuZCBtYXJrIGlzIGV4cGVjdGVkXCIpO1xuICB9XG4gIGNvbXBvc2VOb2RlKHN0YXRlLCBzdGF0ZS5saW5lSW5kZW50IC0gMSwgQ09OVEVYVF9CTE9DS19PVVQsIGZhbHNlLCB0cnVlKTtcbiAgc2tpcFNlcGFyYXRpb25TcGFjZShzdGF0ZSwgdHJ1ZSwgLTEpO1xuICBpZiAoc3RhdGUuY2hlY2tMaW5lQnJlYWtzICYmIFBBVFRFUk5fTk9OX0FTQ0lJX0xJTkVfQlJFQUtTLnRlc3Qoc3RhdGUuaW5wdXQuc2xpY2UoZG9jdW1lbnRTdGFydCwgc3RhdGUucG9zaXRpb24pKSkge1xuICAgIHRocm93V2FybmluZyhzdGF0ZSwgXCJub24tQVNDSUkgbGluZSBicmVha3MgYXJlIGludGVycHJldGVkIGFzIGNvbnRlbnRcIik7XG4gIH1cbiAgc3RhdGUuZG9jdW1lbnRzLnB1c2goc3RhdGUucmVzdWx0KTtcbiAgaWYgKHN0YXRlLnBvc2l0aW9uID09PSBzdGF0ZS5saW5lU3RhcnQgJiYgdGVzdERvY3VtZW50U2VwYXJhdG9yKHN0YXRlKSkge1xuICAgIGlmIChzdGF0ZS5pbnB1dC5jaGFyQ29kZUF0KHN0YXRlLnBvc2l0aW9uKSA9PT0gNDYpIHtcbiAgICAgIHN0YXRlLnBvc2l0aW9uICs9IDM7XG4gICAgICBza2lwU2VwYXJhdGlvblNwYWNlKHN0YXRlLCB0cnVlLCAtMSk7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuICBpZiAoc3RhdGUucG9zaXRpb24gPCBzdGF0ZS5sZW5ndGggLSAxKSB7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgXCJlbmQgb2YgdGhlIHN0cmVhbSBvciBhIGRvY3VtZW50IHNlcGFyYXRvciBpcyBleHBlY3RlZFwiKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm47XG4gIH1cbn1cbl9fbmFtZShyZWFkRG9jdW1lbnQsIFwicmVhZERvY3VtZW50XCIpO1xuZnVuY3Rpb24gbG9hZERvY3VtZW50cyhpbnB1dCwgb3B0aW9ucykge1xuICBpbnB1dCA9IFN0cmluZyhpbnB1dCk7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBpZiAoaW5wdXQubGVuZ3RoICE9PSAwKSB7XG4gICAgaWYgKGlucHV0LmNoYXJDb2RlQXQoaW5wdXQubGVuZ3RoIC0gMSkgIT09IDEwICYmIGlucHV0LmNoYXJDb2RlQXQoaW5wdXQubGVuZ3RoIC0gMSkgIT09IDEzKSB7XG4gICAgICBpbnB1dCArPSBcIlxcblwiO1xuICAgIH1cbiAgICBpZiAoaW5wdXQuY2hhckNvZGVBdCgwKSA9PT0gNjUyNzkpIHtcbiAgICAgIGlucHV0ID0gaW5wdXQuc2xpY2UoMSk7XG4gICAgfVxuICB9XG4gIHZhciBzdGF0ZSA9IG5ldyBTdGF0ZSQxKGlucHV0LCBvcHRpb25zKTtcbiAgdmFyIG51bGxwb3MgPSBpbnB1dC5pbmRleE9mKFwiXFwwXCIpO1xuICBpZiAobnVsbHBvcyAhPT0gLTEpIHtcbiAgICBzdGF0ZS5wb3NpdGlvbiA9IG51bGxwb3M7XG4gICAgdGhyb3dFcnJvcihzdGF0ZSwgXCJudWxsIGJ5dGUgaXMgbm90IGFsbG93ZWQgaW4gaW5wdXRcIik7XG4gIH1cbiAgc3RhdGUuaW5wdXQgKz0gXCJcXDBcIjtcbiAgd2hpbGUgKHN0YXRlLmlucHV0LmNoYXJDb2RlQXQoc3RhdGUucG9zaXRpb24pID09PSAzMikge1xuICAgIHN0YXRlLmxpbmVJbmRlbnQgKz0gMTtcbiAgICBzdGF0ZS5wb3NpdGlvbiArPSAxO1xuICB9XG4gIHdoaWxlIChzdGF0ZS5wb3NpdGlvbiA8IHN0YXRlLmxlbmd0aCAtIDEpIHtcbiAgICByZWFkRG9jdW1lbnQoc3RhdGUpO1xuICB9XG4gIHJldHVybiBzdGF0ZS5kb2N1bWVudHM7XG59XG5fX25hbWUobG9hZERvY3VtZW50cywgXCJsb2FkRG9jdW1lbnRzXCIpO1xuZnVuY3Rpb24gbG9hZEFsbCQxKGlucHV0LCBpdGVyYXRvciwgb3B0aW9ucykge1xuICBpZiAoaXRlcmF0b3IgIT09IG51bGwgJiYgdHlwZW9mIGl0ZXJhdG9yID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBvcHRpb25zID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgb3B0aW9ucyA9IGl0ZXJhdG9yO1xuICAgIGl0ZXJhdG9yID0gbnVsbDtcbiAgfVxuICB2YXIgZG9jdW1lbnRzID0gbG9hZERvY3VtZW50cyhpbnB1dCwgb3B0aW9ucyk7XG4gIGlmICh0eXBlb2YgaXRlcmF0b3IgIT09IFwiZnVuY3Rpb25cIikge1xuICAgIHJldHVybiBkb2N1bWVudHM7XG4gIH1cbiAgZm9yICh2YXIgaW5kZXggPSAwLCBsZW5ndGggPSBkb2N1bWVudHMubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgIGl0ZXJhdG9yKGRvY3VtZW50c1tpbmRleF0pO1xuICB9XG59XG5fX25hbWUobG9hZEFsbCQxLCBcImxvYWRBbGwkMVwiKTtcbmZ1bmN0aW9uIGxvYWQkMShpbnB1dCwgb3B0aW9ucykge1xuICB2YXIgZG9jdW1lbnRzID0gbG9hZERvY3VtZW50cyhpbnB1dCwgb3B0aW9ucyk7XG4gIGlmIChkb2N1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHZvaWQgMDtcbiAgfSBlbHNlIGlmIChkb2N1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50c1swXTtcbiAgfVxuICB0aHJvdyBuZXcgZXhjZXB0aW9uKFwiZXhwZWN0ZWQgYSBzaW5nbGUgZG9jdW1lbnQgaW4gdGhlIHN0cmVhbSwgYnV0IGZvdW5kIG1vcmVcIik7XG59XG5fX25hbWUobG9hZCQxLCBcImxvYWQkMVwiKTtcbnZhciBsb2FkQWxsXzEgPSBsb2FkQWxsJDE7XG52YXIgbG9hZF8xID0gbG9hZCQxO1xudmFyIGxvYWRlciA9IHtcbiAgbG9hZEFsbDogbG9hZEFsbF8xLFxuICBsb2FkOiBsb2FkXzFcbn07XG52YXIgX3RvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbnZhciBfaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIENIQVJfQk9NID0gNjUyNzk7XG52YXIgQ0hBUl9UQUIgPSA5O1xudmFyIENIQVJfTElORV9GRUVEID0gMTA7XG52YXIgQ0hBUl9DQVJSSUFHRV9SRVRVUk4gPSAxMztcbnZhciBDSEFSX1NQQUNFID0gMzI7XG52YXIgQ0hBUl9FWENMQU1BVElPTiA9IDMzO1xudmFyIENIQVJfRE9VQkxFX1FVT1RFID0gMzQ7XG52YXIgQ0hBUl9TSEFSUCA9IDM1O1xudmFyIENIQVJfUEVSQ0VOVCA9IDM3O1xudmFyIENIQVJfQU1QRVJTQU5EID0gMzg7XG52YXIgQ0hBUl9TSU5HTEVfUVVPVEUgPSAzOTtcbnZhciBDSEFSX0FTVEVSSVNLID0gNDI7XG52YXIgQ0hBUl9DT01NQSA9IDQ0O1xudmFyIENIQVJfTUlOVVMgPSA0NTtcbnZhciBDSEFSX0NPTE9OID0gNTg7XG52YXIgQ0hBUl9FUVVBTFMgPSA2MTtcbnZhciBDSEFSX0dSRUFURVJfVEhBTiA9IDYyO1xudmFyIENIQVJfUVVFU1RJT04gPSA2MztcbnZhciBDSEFSX0NPTU1FUkNJQUxfQVQgPSA2NDtcbnZhciBDSEFSX0xFRlRfU1FVQVJFX0JSQUNLRVQgPSA5MTtcbnZhciBDSEFSX1JJR0hUX1NRVUFSRV9CUkFDS0VUID0gOTM7XG52YXIgQ0hBUl9HUkFWRV9BQ0NFTlQgPSA5NjtcbnZhciBDSEFSX0xFRlRfQ1VSTFlfQlJBQ0tFVCA9IDEyMztcbnZhciBDSEFSX1ZFUlRJQ0FMX0xJTkUgPSAxMjQ7XG52YXIgQ0hBUl9SSUdIVF9DVVJMWV9CUkFDS0VUID0gMTI1O1xudmFyIEVTQ0FQRV9TRVFVRU5DRVMgPSB7fTtcbkVTQ0FQRV9TRVFVRU5DRVNbMF0gPSBcIlxcXFwwXCI7XG5FU0NBUEVfU0VRVUVOQ0VTWzddID0gXCJcXFxcYVwiO1xuRVNDQVBFX1NFUVVFTkNFU1s4XSA9IFwiXFxcXGJcIjtcbkVTQ0FQRV9TRVFVRU5DRVNbOV0gPSBcIlxcXFx0XCI7XG5FU0NBUEVfU0VRVUVOQ0VTWzEwXSA9IFwiXFxcXG5cIjtcbkVTQ0FQRV9TRVFVRU5DRVNbMTFdID0gXCJcXFxcdlwiO1xuRVNDQVBFX1NFUVVFTkNFU1sxMl0gPSBcIlxcXFxmXCI7XG5FU0NBUEVfU0VRVUVOQ0VTWzEzXSA9IFwiXFxcXHJcIjtcbkVTQ0FQRV9TRVFVRU5DRVNbMjddID0gXCJcXFxcZVwiO1xuRVNDQVBFX1NFUVVFTkNFU1szNF0gPSAnXFxcXFwiJztcbkVTQ0FQRV9TRVFVRU5DRVNbOTJdID0gXCJcXFxcXFxcXFwiO1xuRVNDQVBFX1NFUVVFTkNFU1sxMzNdID0gXCJcXFxcTlwiO1xuRVNDQVBFX1NFUVVFTkNFU1sxNjBdID0gXCJcXFxcX1wiO1xuRVNDQVBFX1NFUVVFTkNFU1s4MjMyXSA9IFwiXFxcXExcIjtcbkVTQ0FQRV9TRVFVRU5DRVNbODIzM10gPSBcIlxcXFxQXCI7XG52YXIgREVQUkVDQVRFRF9CT09MRUFOU19TWU5UQVggPSBbXG4gIFwieVwiLFxuICBcIllcIixcbiAgXCJ5ZXNcIixcbiAgXCJZZXNcIixcbiAgXCJZRVNcIixcbiAgXCJvblwiLFxuICBcIk9uXCIsXG4gIFwiT05cIixcbiAgXCJuXCIsXG4gIFwiTlwiLFxuICBcIm5vXCIsXG4gIFwiTm9cIixcbiAgXCJOT1wiLFxuICBcIm9mZlwiLFxuICBcIk9mZlwiLFxuICBcIk9GRlwiXG5dO1xudmFyIERFUFJFQ0FURURfQkFTRTYwX1NZTlRBWCA9IC9eWy0rXT9bMC05X10rKD86OlswLTlfXSspKyg/OlxcLlswLTlfXSopPyQvO1xuZnVuY3Rpb24gY29tcGlsZVN0eWxlTWFwKHNjaGVtYTIsIG1hcDIpIHtcbiAgdmFyIHJlc3VsdCwga2V5cywgaW5kZXgsIGxlbmd0aCwgdGFnLCBzdHlsZSwgdHlwZTI7XG4gIGlmIChtYXAyID09PSBudWxsKSByZXR1cm4ge307XG4gIHJlc3VsdCA9IHt9O1xuICBrZXlzID0gT2JqZWN0LmtleXMobWFwMik7XG4gIGZvciAoaW5kZXggPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICB0YWcgPSBrZXlzW2luZGV4XTtcbiAgICBzdHlsZSA9IFN0cmluZyhtYXAyW3RhZ10pO1xuICAgIGlmICh0YWcuc2xpY2UoMCwgMikgPT09IFwiISFcIikge1xuICAgICAgdGFnID0gXCJ0YWc6eWFtbC5vcmcsMjAwMjpcIiArIHRhZy5zbGljZSgyKTtcbiAgICB9XG4gICAgdHlwZTIgPSBzY2hlbWEyLmNvbXBpbGVkVHlwZU1hcFtcImZhbGxiYWNrXCJdW3RhZ107XG4gICAgaWYgKHR5cGUyICYmIF9oYXNPd25Qcm9wZXJ0eS5jYWxsKHR5cGUyLnN0eWxlQWxpYXNlcywgc3R5bGUpKSB7XG4gICAgICBzdHlsZSA9IHR5cGUyLnN0eWxlQWxpYXNlc1tzdHlsZV07XG4gICAgfVxuICAgIHJlc3VsdFt0YWddID0gc3R5bGU7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbl9fbmFtZShjb21waWxlU3R5bGVNYXAsIFwiY29tcGlsZVN0eWxlTWFwXCIpO1xuZnVuY3Rpb24gZW5jb2RlSGV4KGNoYXJhY3Rlcikge1xuICB2YXIgc3RyaW5nLCBoYW5kbGUsIGxlbmd0aDtcbiAgc3RyaW5nID0gY2hhcmFjdGVyLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpO1xuICBpZiAoY2hhcmFjdGVyIDw9IDI1NSkge1xuICAgIGhhbmRsZSA9IFwieFwiO1xuICAgIGxlbmd0aCA9IDI7XG4gIH0gZWxzZSBpZiAoY2hhcmFjdGVyIDw9IDY1NTM1KSB7XG4gICAgaGFuZGxlID0gXCJ1XCI7XG4gICAgbGVuZ3RoID0gNDtcbiAgfSBlbHNlIGlmIChjaGFyYWN0ZXIgPD0gNDI5NDk2NzI5NSkge1xuICAgIGhhbmRsZSA9IFwiVVwiO1xuICAgIGxlbmd0aCA9IDg7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IGV4Y2VwdGlvbihcImNvZGUgcG9pbnQgd2l0aGluIGEgc3RyaW5nIG1heSBub3QgYmUgZ3JlYXRlciB0aGFuIDB4RkZGRkZGRkZcIik7XG4gIH1cbiAgcmV0dXJuIFwiXFxcXFwiICsgaGFuZGxlICsgY29tbW9uLnJlcGVhdChcIjBcIiwgbGVuZ3RoIC0gc3RyaW5nLmxlbmd0aCkgKyBzdHJpbmc7XG59XG5fX25hbWUoZW5jb2RlSGV4LCBcImVuY29kZUhleFwiKTtcbnZhciBRVU9USU5HX1RZUEVfU0lOR0xFID0gMTtcbnZhciBRVU9USU5HX1RZUEVfRE9VQkxFID0gMjtcbmZ1bmN0aW9uIFN0YXRlKG9wdGlvbnMpIHtcbiAgdGhpcy5zY2hlbWEgPSBvcHRpb25zW1wic2NoZW1hXCJdIHx8IF9kZWZhdWx0O1xuICB0aGlzLmluZGVudCA9IE1hdGgubWF4KDEsIG9wdGlvbnNbXCJpbmRlbnRcIl0gfHwgMik7XG4gIHRoaXMubm9BcnJheUluZGVudCA9IG9wdGlvbnNbXCJub0FycmF5SW5kZW50XCJdIHx8IGZhbHNlO1xuICB0aGlzLnNraXBJbnZhbGlkID0gb3B0aW9uc1tcInNraXBJbnZhbGlkXCJdIHx8IGZhbHNlO1xuICB0aGlzLmZsb3dMZXZlbCA9IGNvbW1vbi5pc05vdGhpbmcob3B0aW9uc1tcImZsb3dMZXZlbFwiXSkgPyAtMSA6IG9wdGlvbnNbXCJmbG93TGV2ZWxcIl07XG4gIHRoaXMuc3R5bGVNYXAgPSBjb21waWxlU3R5bGVNYXAodGhpcy5zY2hlbWEsIG9wdGlvbnNbXCJzdHlsZXNcIl0gfHwgbnVsbCk7XG4gIHRoaXMuc29ydEtleXMgPSBvcHRpb25zW1wic29ydEtleXNcIl0gfHwgZmFsc2U7XG4gIHRoaXMubGluZVdpZHRoID0gb3B0aW9uc1tcImxpbmVXaWR0aFwiXSB8fCA4MDtcbiAgdGhpcy5ub1JlZnMgPSBvcHRpb25zW1wibm9SZWZzXCJdIHx8IGZhbHNlO1xuICB0aGlzLm5vQ29tcGF0TW9kZSA9IG9wdGlvbnNbXCJub0NvbXBhdE1vZGVcIl0gfHwgZmFsc2U7XG4gIHRoaXMuY29uZGVuc2VGbG93ID0gb3B0aW9uc1tcImNvbmRlbnNlRmxvd1wiXSB8fCBmYWxzZTtcbiAgdGhpcy5xdW90aW5nVHlwZSA9IG9wdGlvbnNbXCJxdW90aW5nVHlwZVwiXSA9PT0gJ1wiJyA/IFFVT1RJTkdfVFlQRV9ET1VCTEUgOiBRVU9USU5HX1RZUEVfU0lOR0xFO1xuICB0aGlzLmZvcmNlUXVvdGVzID0gb3B0aW9uc1tcImZvcmNlUXVvdGVzXCJdIHx8IGZhbHNlO1xuICB0aGlzLnJlcGxhY2VyID0gdHlwZW9mIG9wdGlvbnNbXCJyZXBsYWNlclwiXSA9PT0gXCJmdW5jdGlvblwiID8gb3B0aW9uc1tcInJlcGxhY2VyXCJdIDogbnVsbDtcbiAgdGhpcy5pbXBsaWNpdFR5cGVzID0gdGhpcy5zY2hlbWEuY29tcGlsZWRJbXBsaWNpdDtcbiAgdGhpcy5leHBsaWNpdFR5cGVzID0gdGhpcy5zY2hlbWEuY29tcGlsZWRFeHBsaWNpdDtcbiAgdGhpcy50YWcgPSBudWxsO1xuICB0aGlzLnJlc3VsdCA9IFwiXCI7XG4gIHRoaXMuZHVwbGljYXRlcyA9IFtdO1xuICB0aGlzLnVzZWREdXBsaWNhdGVzID0gbnVsbDtcbn1cbl9fbmFtZShTdGF0ZSwgXCJTdGF0ZVwiKTtcbmZ1bmN0aW9uIGluZGVudFN0cmluZyhzdHJpbmcsIHNwYWNlcykge1xuICB2YXIgaW5kID0gY29tbW9uLnJlcGVhdChcIiBcIiwgc3BhY2VzKSwgcG9zaXRpb24gPSAwLCBuZXh0ID0gLTEsIHJlc3VsdCA9IFwiXCIsIGxpbmUsIGxlbmd0aCA9IHN0cmluZy5sZW5ndGg7XG4gIHdoaWxlIChwb3NpdGlvbiA8IGxlbmd0aCkge1xuICAgIG5leHQgPSBzdHJpbmcuaW5kZXhPZihcIlxcblwiLCBwb3NpdGlvbik7XG4gICAgaWYgKG5leHQgPT09IC0xKSB7XG4gICAgICBsaW5lID0gc3RyaW5nLnNsaWNlKHBvc2l0aW9uKTtcbiAgICAgIHBvc2l0aW9uID0gbGVuZ3RoO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaW5lID0gc3RyaW5nLnNsaWNlKHBvc2l0aW9uLCBuZXh0ICsgMSk7XG4gICAgICBwb3NpdGlvbiA9IG5leHQgKyAxO1xuICAgIH1cbiAgICBpZiAobGluZS5sZW5ndGggJiYgbGluZSAhPT0gXCJcXG5cIikgcmVzdWx0ICs9IGluZDtcbiAgICByZXN1bHQgKz0gbGluZTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuX19uYW1lKGluZGVudFN0cmluZywgXCJpbmRlbnRTdHJpbmdcIik7XG5mdW5jdGlvbiBnZW5lcmF0ZU5leHRMaW5lKHN0YXRlLCBsZXZlbCkge1xuICByZXR1cm4gXCJcXG5cIiArIGNvbW1vbi5yZXBlYXQoXCIgXCIsIHN0YXRlLmluZGVudCAqIGxldmVsKTtcbn1cbl9fbmFtZShnZW5lcmF0ZU5leHRMaW5lLCBcImdlbmVyYXRlTmV4dExpbmVcIik7XG5mdW5jdGlvbiB0ZXN0SW1wbGljaXRSZXNvbHZpbmcoc3RhdGUsIHN0cjIpIHtcbiAgdmFyIGluZGV4LCBsZW5ndGgsIHR5cGUyO1xuICBmb3IgKGluZGV4ID0gMCwgbGVuZ3RoID0gc3RhdGUuaW1wbGljaXRUeXBlcy5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgdHlwZTIgPSBzdGF0ZS5pbXBsaWNpdFR5cGVzW2luZGV4XTtcbiAgICBpZiAodHlwZTIucmVzb2x2ZShzdHIyKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cbl9fbmFtZSh0ZXN0SW1wbGljaXRSZXNvbHZpbmcsIFwidGVzdEltcGxpY2l0UmVzb2x2aW5nXCIpO1xuZnVuY3Rpb24gaXNXaGl0ZXNwYWNlKGMpIHtcbiAgcmV0dXJuIGMgPT09IENIQVJfU1BBQ0UgfHwgYyA9PT0gQ0hBUl9UQUI7XG59XG5fX25hbWUoaXNXaGl0ZXNwYWNlLCBcImlzV2hpdGVzcGFjZVwiKTtcbmZ1bmN0aW9uIGlzUHJpbnRhYmxlKGMpIHtcbiAgcmV0dXJuIDMyIDw9IGMgJiYgYyA8PSAxMjYgfHwgMTYxIDw9IGMgJiYgYyA8PSA1NTI5NSAmJiBjICE9PSA4MjMyICYmIGMgIT09IDgyMzMgfHwgNTczNDQgPD0gYyAmJiBjIDw9IDY1NTMzICYmIGMgIT09IENIQVJfQk9NIHx8IDY1NTM2IDw9IGMgJiYgYyA8PSAxMTE0MTExO1xufVxuX19uYW1lKGlzUHJpbnRhYmxlLCBcImlzUHJpbnRhYmxlXCIpO1xuZnVuY3Rpb24gaXNOc0NoYXJPcldoaXRlc3BhY2UoYykge1xuICByZXR1cm4gaXNQcmludGFibGUoYykgJiYgYyAhPT0gQ0hBUl9CT00gJiYgYyAhPT0gQ0hBUl9DQVJSSUFHRV9SRVRVUk4gJiYgYyAhPT0gQ0hBUl9MSU5FX0ZFRUQ7XG59XG5fX25hbWUoaXNOc0NoYXJPcldoaXRlc3BhY2UsIFwiaXNOc0NoYXJPcldoaXRlc3BhY2VcIik7XG5mdW5jdGlvbiBpc1BsYWluU2FmZShjLCBwcmV2LCBpbmJsb2NrKSB7XG4gIHZhciBjSXNOc0NoYXJPcldoaXRlc3BhY2UgPSBpc05zQ2hhck9yV2hpdGVzcGFjZShjKTtcbiAgdmFyIGNJc05zQ2hhciA9IGNJc05zQ2hhck9yV2hpdGVzcGFjZSAmJiAhaXNXaGl0ZXNwYWNlKGMpO1xuICByZXR1cm4gKFxuICAgIC8vIG5zLXBsYWluLXNhZmVcbiAgICAoaW5ibG9jayA/IChcbiAgICAgIC8vIGMgPSBmbG93LWluXG4gICAgICBjSXNOc0NoYXJPcldoaXRlc3BhY2VcbiAgICApIDogY0lzTnNDaGFyT3JXaGl0ZXNwYWNlICYmIGMgIT09IENIQVJfQ09NTUEgJiYgYyAhPT0gQ0hBUl9MRUZUX1NRVUFSRV9CUkFDS0VUICYmIGMgIT09IENIQVJfUklHSFRfU1FVQVJFX0JSQUNLRVQgJiYgYyAhPT0gQ0hBUl9MRUZUX0NVUkxZX0JSQUNLRVQgJiYgYyAhPT0gQ0hBUl9SSUdIVF9DVVJMWV9CUkFDS0VUKSAmJiBjICE9PSBDSEFSX1NIQVJQICYmICEocHJldiA9PT0gQ0hBUl9DT0xPTiAmJiAhY0lzTnNDaGFyKSB8fCBpc05zQ2hhck9yV2hpdGVzcGFjZShwcmV2KSAmJiAhaXNXaGl0ZXNwYWNlKHByZXYpICYmIGMgPT09IENIQVJfU0hBUlAgfHwgcHJldiA9PT0gQ0hBUl9DT0xPTiAmJiBjSXNOc0NoYXJcbiAgKTtcbn1cbl9fbmFtZShpc1BsYWluU2FmZSwgXCJpc1BsYWluU2FmZVwiKTtcbmZ1bmN0aW9uIGlzUGxhaW5TYWZlRmlyc3QoYykge1xuICByZXR1cm4gaXNQcmludGFibGUoYykgJiYgYyAhPT0gQ0hBUl9CT00gJiYgIWlzV2hpdGVzcGFjZShjKSAmJiBjICE9PSBDSEFSX01JTlVTICYmIGMgIT09IENIQVJfUVVFU1RJT04gJiYgYyAhPT0gQ0hBUl9DT0xPTiAmJiBjICE9PSBDSEFSX0NPTU1BICYmIGMgIT09IENIQVJfTEVGVF9TUVVBUkVfQlJBQ0tFVCAmJiBjICE9PSBDSEFSX1JJR0hUX1NRVUFSRV9CUkFDS0VUICYmIGMgIT09IENIQVJfTEVGVF9DVVJMWV9CUkFDS0VUICYmIGMgIT09IENIQVJfUklHSFRfQ1VSTFlfQlJBQ0tFVCAmJiBjICE9PSBDSEFSX1NIQVJQICYmIGMgIT09IENIQVJfQU1QRVJTQU5EICYmIGMgIT09IENIQVJfQVNURVJJU0sgJiYgYyAhPT0gQ0hBUl9FWENMQU1BVElPTiAmJiBjICE9PSBDSEFSX1ZFUlRJQ0FMX0xJTkUgJiYgYyAhPT0gQ0hBUl9FUVVBTFMgJiYgYyAhPT0gQ0hBUl9HUkVBVEVSX1RIQU4gJiYgYyAhPT0gQ0hBUl9TSU5HTEVfUVVPVEUgJiYgYyAhPT0gQ0hBUl9ET1VCTEVfUVVPVEUgJiYgYyAhPT0gQ0hBUl9QRVJDRU5UICYmIGMgIT09IENIQVJfQ09NTUVSQ0lBTF9BVCAmJiBjICE9PSBDSEFSX0dSQVZFX0FDQ0VOVDtcbn1cbl9fbmFtZShpc1BsYWluU2FmZUZpcnN0LCBcImlzUGxhaW5TYWZlRmlyc3RcIik7XG5mdW5jdGlvbiBpc1BsYWluU2FmZUxhc3QoYykge1xuICByZXR1cm4gIWlzV2hpdGVzcGFjZShjKSAmJiBjICE9PSBDSEFSX0NPTE9OO1xufVxuX19uYW1lKGlzUGxhaW5TYWZlTGFzdCwgXCJpc1BsYWluU2FmZUxhc3RcIik7XG5mdW5jdGlvbiBjb2RlUG9pbnRBdChzdHJpbmcsIHBvcykge1xuICB2YXIgZmlyc3QgPSBzdHJpbmcuY2hhckNvZGVBdChwb3MpLCBzZWNvbmQ7XG4gIGlmIChmaXJzdCA+PSA1NTI5NiAmJiBmaXJzdCA8PSA1NjMxOSAmJiBwb3MgKyAxIDwgc3RyaW5nLmxlbmd0aCkge1xuICAgIHNlY29uZCA9IHN0cmluZy5jaGFyQ29kZUF0KHBvcyArIDEpO1xuICAgIGlmIChzZWNvbmQgPj0gNTYzMjAgJiYgc2Vjb25kIDw9IDU3MzQzKSB7XG4gICAgICByZXR1cm4gKGZpcnN0IC0gNTUyOTYpICogMTAyNCArIHNlY29uZCAtIDU2MzIwICsgNjU1MzY7XG4gICAgfVxuICB9XG4gIHJldHVybiBmaXJzdDtcbn1cbl9fbmFtZShjb2RlUG9pbnRBdCwgXCJjb2RlUG9pbnRBdFwiKTtcbmZ1bmN0aW9uIG5lZWRJbmRlbnRJbmRpY2F0b3Ioc3RyaW5nKSB7XG4gIHZhciBsZWFkaW5nU3BhY2VSZSA9IC9eXFxuKiAvO1xuICByZXR1cm4gbGVhZGluZ1NwYWNlUmUudGVzdChzdHJpbmcpO1xufVxuX19uYW1lKG5lZWRJbmRlbnRJbmRpY2F0b3IsIFwibmVlZEluZGVudEluZGljYXRvclwiKTtcbnZhciBTVFlMRV9QTEFJTiA9IDE7XG52YXIgU1RZTEVfU0lOR0xFID0gMjtcbnZhciBTVFlMRV9MSVRFUkFMID0gMztcbnZhciBTVFlMRV9GT0xERUQgPSA0O1xudmFyIFNUWUxFX0RPVUJMRSA9IDU7XG5mdW5jdGlvbiBjaG9vc2VTY2FsYXJTdHlsZShzdHJpbmcsIHNpbmdsZUxpbmVPbmx5LCBpbmRlbnRQZXJMZXZlbCwgbGluZVdpZHRoLCB0ZXN0QW1iaWd1b3VzVHlwZSwgcXVvdGluZ1R5cGUsIGZvcmNlUXVvdGVzLCBpbmJsb2NrKSB7XG4gIHZhciBpO1xuICB2YXIgY2hhciA9IDA7XG4gIHZhciBwcmV2Q2hhciA9IG51bGw7XG4gIHZhciBoYXNMaW5lQnJlYWsgPSBmYWxzZTtcbiAgdmFyIGhhc0ZvbGRhYmxlTGluZSA9IGZhbHNlO1xuICB2YXIgc2hvdWxkVHJhY2tXaWR0aCA9IGxpbmVXaWR0aCAhPT0gLTE7XG4gIHZhciBwcmV2aW91c0xpbmVCcmVhayA9IC0xO1xuICB2YXIgcGxhaW4gPSBpc1BsYWluU2FmZUZpcnN0KGNvZGVQb2ludEF0KHN0cmluZywgMCkpICYmIGlzUGxhaW5TYWZlTGFzdChjb2RlUG9pbnRBdChzdHJpbmcsIHN0cmluZy5sZW5ndGggLSAxKSk7XG4gIGlmIChzaW5nbGVMaW5lT25seSB8fCBmb3JjZVF1b3Rlcykge1xuICAgIGZvciAoaSA9IDA7IGkgPCBzdHJpbmcubGVuZ3RoOyBjaGFyID49IDY1NTM2ID8gaSArPSAyIDogaSsrKSB7XG4gICAgICBjaGFyID0gY29kZVBvaW50QXQoc3RyaW5nLCBpKTtcbiAgICAgIGlmICghaXNQcmludGFibGUoY2hhcikpIHtcbiAgICAgICAgcmV0dXJuIFNUWUxFX0RPVUJMRTtcbiAgICAgIH1cbiAgICAgIHBsYWluID0gcGxhaW4gJiYgaXNQbGFpblNhZmUoY2hhciwgcHJldkNoYXIsIGluYmxvY2spO1xuICAgICAgcHJldkNoYXIgPSBjaGFyO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgc3RyaW5nLmxlbmd0aDsgY2hhciA+PSA2NTUzNiA/IGkgKz0gMiA6IGkrKykge1xuICAgICAgY2hhciA9IGNvZGVQb2ludEF0KHN0cmluZywgaSk7XG4gICAgICBpZiAoY2hhciA9PT0gQ0hBUl9MSU5FX0ZFRUQpIHtcbiAgICAgICAgaGFzTGluZUJyZWFrID0gdHJ1ZTtcbiAgICAgICAgaWYgKHNob3VsZFRyYWNrV2lkdGgpIHtcbiAgICAgICAgICBoYXNGb2xkYWJsZUxpbmUgPSBoYXNGb2xkYWJsZUxpbmUgfHwgLy8gRm9sZGFibGUgbGluZSA9IHRvbyBsb25nLCBhbmQgbm90IG1vcmUtaW5kZW50ZWQuXG4gICAgICAgICAgaSAtIHByZXZpb3VzTGluZUJyZWFrIC0gMSA+IGxpbmVXaWR0aCAmJiBzdHJpbmdbcHJldmlvdXNMaW5lQnJlYWsgKyAxXSAhPT0gXCIgXCI7XG4gICAgICAgICAgcHJldmlvdXNMaW5lQnJlYWsgPSBpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKCFpc1ByaW50YWJsZShjaGFyKSkge1xuICAgICAgICByZXR1cm4gU1RZTEVfRE9VQkxFO1xuICAgICAgfVxuICAgICAgcGxhaW4gPSBwbGFpbiAmJiBpc1BsYWluU2FmZShjaGFyLCBwcmV2Q2hhciwgaW5ibG9jayk7XG4gICAgICBwcmV2Q2hhciA9IGNoYXI7XG4gICAgfVxuICAgIGhhc0ZvbGRhYmxlTGluZSA9IGhhc0ZvbGRhYmxlTGluZSB8fCBzaG91bGRUcmFja1dpZHRoICYmIChpIC0gcHJldmlvdXNMaW5lQnJlYWsgLSAxID4gbGluZVdpZHRoICYmIHN0cmluZ1twcmV2aW91c0xpbmVCcmVhayArIDFdICE9PSBcIiBcIik7XG4gIH1cbiAgaWYgKCFoYXNMaW5lQnJlYWsgJiYgIWhhc0ZvbGRhYmxlTGluZSkge1xuICAgIGlmIChwbGFpbiAmJiAhZm9yY2VRdW90ZXMgJiYgIXRlc3RBbWJpZ3VvdXNUeXBlKHN0cmluZykpIHtcbiAgICAgIHJldHVybiBTVFlMRV9QTEFJTjtcbiAgICB9XG4gICAgcmV0dXJuIHF1b3RpbmdUeXBlID09PSBRVU9USU5HX1RZUEVfRE9VQkxFID8gU1RZTEVfRE9VQkxFIDogU1RZTEVfU0lOR0xFO1xuICB9XG4gIGlmIChpbmRlbnRQZXJMZXZlbCA+IDkgJiYgbmVlZEluZGVudEluZGljYXRvcihzdHJpbmcpKSB7XG4gICAgcmV0dXJuIFNUWUxFX0RPVUJMRTtcbiAgfVxuICBpZiAoIWZvcmNlUXVvdGVzKSB7XG4gICAgcmV0dXJuIGhhc0ZvbGRhYmxlTGluZSA/IFNUWUxFX0ZPTERFRCA6IFNUWUxFX0xJVEVSQUw7XG4gIH1cbiAgcmV0dXJuIHF1b3RpbmdUeXBlID09PSBRVU9USU5HX1RZUEVfRE9VQkxFID8gU1RZTEVfRE9VQkxFIDogU1RZTEVfU0lOR0xFO1xufVxuX19uYW1lKGNob29zZVNjYWxhclN0eWxlLCBcImNob29zZVNjYWxhclN0eWxlXCIpO1xuZnVuY3Rpb24gd3JpdGVTY2FsYXIoc3RhdGUsIHN0cmluZywgbGV2ZWwsIGlza2V5LCBpbmJsb2NrKSB7XG4gIHN0YXRlLmR1bXAgPSAoZnVuY3Rpb24oKSB7XG4gICAgaWYgKHN0cmluZy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBzdGF0ZS5xdW90aW5nVHlwZSA9PT0gUVVPVElOR19UWVBFX0RPVUJMRSA/ICdcIlwiJyA6IFwiJydcIjtcbiAgICB9XG4gICAgaWYgKCFzdGF0ZS5ub0NvbXBhdE1vZGUpIHtcbiAgICAgIGlmIChERVBSRUNBVEVEX0JPT0xFQU5TX1NZTlRBWC5pbmRleE9mKHN0cmluZykgIT09IC0xIHx8IERFUFJFQ0FURURfQkFTRTYwX1NZTlRBWC50ZXN0KHN0cmluZykpIHtcbiAgICAgICAgcmV0dXJuIHN0YXRlLnF1b3RpbmdUeXBlID09PSBRVU9USU5HX1RZUEVfRE9VQkxFID8gJ1wiJyArIHN0cmluZyArICdcIicgOiBcIidcIiArIHN0cmluZyArIFwiJ1wiO1xuICAgICAgfVxuICAgIH1cbiAgICB2YXIgaW5kZW50ID0gc3RhdGUuaW5kZW50ICogTWF0aC5tYXgoMSwgbGV2ZWwpO1xuICAgIHZhciBsaW5lV2lkdGggPSBzdGF0ZS5saW5lV2lkdGggPT09IC0xID8gLTEgOiBNYXRoLm1heChNYXRoLm1pbihzdGF0ZS5saW5lV2lkdGgsIDQwKSwgc3RhdGUubGluZVdpZHRoIC0gaW5kZW50KTtcbiAgICB2YXIgc2luZ2xlTGluZU9ubHkgPSBpc2tleSB8fCBzdGF0ZS5mbG93TGV2ZWwgPiAtMSAmJiBsZXZlbCA+PSBzdGF0ZS5mbG93TGV2ZWw7XG4gICAgZnVuY3Rpb24gdGVzdEFtYmlndWl0eShzdHJpbmcyKSB7XG4gICAgICByZXR1cm4gdGVzdEltcGxpY2l0UmVzb2x2aW5nKHN0YXRlLCBzdHJpbmcyKTtcbiAgICB9XG4gICAgX19uYW1lKHRlc3RBbWJpZ3VpdHksIFwidGVzdEFtYmlndWl0eVwiKTtcbiAgICBzd2l0Y2ggKGNob29zZVNjYWxhclN0eWxlKFxuICAgICAgc3RyaW5nLFxuICAgICAgc2luZ2xlTGluZU9ubHksXG4gICAgICBzdGF0ZS5pbmRlbnQsXG4gICAgICBsaW5lV2lkdGgsXG4gICAgICB0ZXN0QW1iaWd1aXR5LFxuICAgICAgc3RhdGUucXVvdGluZ1R5cGUsXG4gICAgICBzdGF0ZS5mb3JjZVF1b3RlcyAmJiAhaXNrZXksXG4gICAgICBpbmJsb2NrXG4gICAgKSkge1xuICAgICAgY2FzZSBTVFlMRV9QTEFJTjpcbiAgICAgICAgcmV0dXJuIHN0cmluZztcbiAgICAgIGNhc2UgU1RZTEVfU0lOR0xFOlxuICAgICAgICByZXR1cm4gXCInXCIgKyBzdHJpbmcucmVwbGFjZSgvJy9nLCBcIicnXCIpICsgXCInXCI7XG4gICAgICBjYXNlIFNUWUxFX0xJVEVSQUw6XG4gICAgICAgIHJldHVybiBcInxcIiArIGJsb2NrSGVhZGVyKHN0cmluZywgc3RhdGUuaW5kZW50KSArIGRyb3BFbmRpbmdOZXdsaW5lKGluZGVudFN0cmluZyhzdHJpbmcsIGluZGVudCkpO1xuICAgICAgY2FzZSBTVFlMRV9GT0xERUQ6XG4gICAgICAgIHJldHVybiBcIj5cIiArIGJsb2NrSGVhZGVyKHN0cmluZywgc3RhdGUuaW5kZW50KSArIGRyb3BFbmRpbmdOZXdsaW5lKGluZGVudFN0cmluZyhmb2xkU3RyaW5nKHN0cmluZywgbGluZVdpZHRoKSwgaW5kZW50KSk7XG4gICAgICBjYXNlIFNUWUxFX0RPVUJMRTpcbiAgICAgICAgcmV0dXJuICdcIicgKyBlc2NhcGVTdHJpbmcoc3RyaW5nKSArICdcIic7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgZXhjZXB0aW9uKFwiaW1wb3NzaWJsZSBlcnJvcjogaW52YWxpZCBzY2FsYXIgc3R5bGVcIik7XG4gICAgfVxuICB9KSgpO1xufVxuX19uYW1lKHdyaXRlU2NhbGFyLCBcIndyaXRlU2NhbGFyXCIpO1xuZnVuY3Rpb24gYmxvY2tIZWFkZXIoc3RyaW5nLCBpbmRlbnRQZXJMZXZlbCkge1xuICB2YXIgaW5kZW50SW5kaWNhdG9yID0gbmVlZEluZGVudEluZGljYXRvcihzdHJpbmcpID8gU3RyaW5nKGluZGVudFBlckxldmVsKSA6IFwiXCI7XG4gIHZhciBjbGlwID0gc3RyaW5nW3N0cmluZy5sZW5ndGggLSAxXSA9PT0gXCJcXG5cIjtcbiAgdmFyIGtlZXAgPSBjbGlwICYmIChzdHJpbmdbc3RyaW5nLmxlbmd0aCAtIDJdID09PSBcIlxcblwiIHx8IHN0cmluZyA9PT0gXCJcXG5cIik7XG4gIHZhciBjaG9tcCA9IGtlZXAgPyBcIitcIiA6IGNsaXAgPyBcIlwiIDogXCItXCI7XG4gIHJldHVybiBpbmRlbnRJbmRpY2F0b3IgKyBjaG9tcCArIFwiXFxuXCI7XG59XG5fX25hbWUoYmxvY2tIZWFkZXIsIFwiYmxvY2tIZWFkZXJcIik7XG5mdW5jdGlvbiBkcm9wRW5kaW5nTmV3bGluZShzdHJpbmcpIHtcbiAgcmV0dXJuIHN0cmluZ1tzdHJpbmcubGVuZ3RoIC0gMV0gPT09IFwiXFxuXCIgPyBzdHJpbmcuc2xpY2UoMCwgLTEpIDogc3RyaW5nO1xufVxuX19uYW1lKGRyb3BFbmRpbmdOZXdsaW5lLCBcImRyb3BFbmRpbmdOZXdsaW5lXCIpO1xuZnVuY3Rpb24gZm9sZFN0cmluZyhzdHJpbmcsIHdpZHRoKSB7XG4gIHZhciBsaW5lUmUgPSAvKFxcbispKFteXFxuXSopL2c7XG4gIHZhciByZXN1bHQgPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIG5leHRMRiA9IHN0cmluZy5pbmRleE9mKFwiXFxuXCIpO1xuICAgIG5leHRMRiA9IG5leHRMRiAhPT0gLTEgPyBuZXh0TEYgOiBzdHJpbmcubGVuZ3RoO1xuICAgIGxpbmVSZS5sYXN0SW5kZXggPSBuZXh0TEY7XG4gICAgcmV0dXJuIGZvbGRMaW5lKHN0cmluZy5zbGljZSgwLCBuZXh0TEYpLCB3aWR0aCk7XG4gIH0pKCk7XG4gIHZhciBwcmV2TW9yZUluZGVudGVkID0gc3RyaW5nWzBdID09PSBcIlxcblwiIHx8IHN0cmluZ1swXSA9PT0gXCIgXCI7XG4gIHZhciBtb3JlSW5kZW50ZWQ7XG4gIHZhciBtYXRjaDtcbiAgd2hpbGUgKG1hdGNoID0gbGluZVJlLmV4ZWMoc3RyaW5nKSkge1xuICAgIHZhciBwcmVmaXggPSBtYXRjaFsxXSwgbGluZSA9IG1hdGNoWzJdO1xuICAgIG1vcmVJbmRlbnRlZCA9IGxpbmVbMF0gPT09IFwiIFwiO1xuICAgIHJlc3VsdCArPSBwcmVmaXggKyAoIXByZXZNb3JlSW5kZW50ZWQgJiYgIW1vcmVJbmRlbnRlZCAmJiBsaW5lICE9PSBcIlwiID8gXCJcXG5cIiA6IFwiXCIpICsgZm9sZExpbmUobGluZSwgd2lkdGgpO1xuICAgIHByZXZNb3JlSW5kZW50ZWQgPSBtb3JlSW5kZW50ZWQ7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbl9fbmFtZShmb2xkU3RyaW5nLCBcImZvbGRTdHJpbmdcIik7XG5mdW5jdGlvbiBmb2xkTGluZShsaW5lLCB3aWR0aCkge1xuICBpZiAobGluZSA9PT0gXCJcIiB8fCBsaW5lWzBdID09PSBcIiBcIikgcmV0dXJuIGxpbmU7XG4gIHZhciBicmVha1JlID0gLyBbXiBdL2c7XG4gIHZhciBtYXRjaDtcbiAgdmFyIHN0YXJ0ID0gMCwgZW5kLCBjdXJyID0gMCwgbmV4dCA9IDA7XG4gIHZhciByZXN1bHQgPSBcIlwiO1xuICB3aGlsZSAobWF0Y2ggPSBicmVha1JlLmV4ZWMobGluZSkpIHtcbiAgICBuZXh0ID0gbWF0Y2guaW5kZXg7XG4gICAgaWYgKG5leHQgLSBzdGFydCA+IHdpZHRoKSB7XG4gICAgICBlbmQgPSBjdXJyID4gc3RhcnQgPyBjdXJyIDogbmV4dDtcbiAgICAgIHJlc3VsdCArPSBcIlxcblwiICsgbGluZS5zbGljZShzdGFydCwgZW5kKTtcbiAgICAgIHN0YXJ0ID0gZW5kICsgMTtcbiAgICB9XG4gICAgY3VyciA9IG5leHQ7XG4gIH1cbiAgcmVzdWx0ICs9IFwiXFxuXCI7XG4gIGlmIChsaW5lLmxlbmd0aCAtIHN0YXJ0ID4gd2lkdGggJiYgY3VyciA+IHN0YXJ0KSB7XG4gICAgcmVzdWx0ICs9IGxpbmUuc2xpY2Uoc3RhcnQsIGN1cnIpICsgXCJcXG5cIiArIGxpbmUuc2xpY2UoY3VyciArIDEpO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdCArPSBsaW5lLnNsaWNlKHN0YXJ0KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0LnNsaWNlKDEpO1xufVxuX19uYW1lKGZvbGRMaW5lLCBcImZvbGRMaW5lXCIpO1xuZnVuY3Rpb24gZXNjYXBlU3RyaW5nKHN0cmluZykge1xuICB2YXIgcmVzdWx0ID0gXCJcIjtcbiAgdmFyIGNoYXIgPSAwO1xuICB2YXIgZXNjYXBlU2VxO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0cmluZy5sZW5ndGg7IGNoYXIgPj0gNjU1MzYgPyBpICs9IDIgOiBpKyspIHtcbiAgICBjaGFyID0gY29kZVBvaW50QXQoc3RyaW5nLCBpKTtcbiAgICBlc2NhcGVTZXEgPSBFU0NBUEVfU0VRVUVOQ0VTW2NoYXJdO1xuICAgIGlmICghZXNjYXBlU2VxICYmIGlzUHJpbnRhYmxlKGNoYXIpKSB7XG4gICAgICByZXN1bHQgKz0gc3RyaW5nW2ldO1xuICAgICAgaWYgKGNoYXIgPj0gNjU1MzYpIHJlc3VsdCArPSBzdHJpbmdbaSArIDFdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgKz0gZXNjYXBlU2VxIHx8IGVuY29kZUhleChjaGFyKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbl9fbmFtZShlc2NhcGVTdHJpbmcsIFwiZXNjYXBlU3RyaW5nXCIpO1xuZnVuY3Rpb24gd3JpdGVGbG93U2VxdWVuY2Uoc3RhdGUsIGxldmVsLCBvYmplY3QpIHtcbiAgdmFyIF9yZXN1bHQgPSBcIlwiLCBfdGFnID0gc3RhdGUudGFnLCBpbmRleCwgbGVuZ3RoLCB2YWx1ZTtcbiAgZm9yIChpbmRleCA9IDAsIGxlbmd0aCA9IG9iamVjdC5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgdmFsdWUgPSBvYmplY3RbaW5kZXhdO1xuICAgIGlmIChzdGF0ZS5yZXBsYWNlcikge1xuICAgICAgdmFsdWUgPSBzdGF0ZS5yZXBsYWNlci5jYWxsKG9iamVjdCwgU3RyaW5nKGluZGV4KSwgdmFsdWUpO1xuICAgIH1cbiAgICBpZiAod3JpdGVOb2RlKHN0YXRlLCBsZXZlbCwgdmFsdWUsIGZhbHNlLCBmYWxzZSkgfHwgdHlwZW9mIHZhbHVlID09PSBcInVuZGVmaW5lZFwiICYmIHdyaXRlTm9kZShzdGF0ZSwgbGV2ZWwsIG51bGwsIGZhbHNlLCBmYWxzZSkpIHtcbiAgICAgIGlmIChfcmVzdWx0ICE9PSBcIlwiKSBfcmVzdWx0ICs9IFwiLFwiICsgKCFzdGF0ZS5jb25kZW5zZUZsb3cgPyBcIiBcIiA6IFwiXCIpO1xuICAgICAgX3Jlc3VsdCArPSBzdGF0ZS5kdW1wO1xuICAgIH1cbiAgfVxuICBzdGF0ZS50YWcgPSBfdGFnO1xuICBzdGF0ZS5kdW1wID0gXCJbXCIgKyBfcmVzdWx0ICsgXCJdXCI7XG59XG5fX25hbWUod3JpdGVGbG93U2VxdWVuY2UsIFwid3JpdGVGbG93U2VxdWVuY2VcIik7XG5mdW5jdGlvbiB3cml0ZUJsb2NrU2VxdWVuY2Uoc3RhdGUsIGxldmVsLCBvYmplY3QsIGNvbXBhY3QpIHtcbiAgdmFyIF9yZXN1bHQgPSBcIlwiLCBfdGFnID0gc3RhdGUudGFnLCBpbmRleCwgbGVuZ3RoLCB2YWx1ZTtcbiAgZm9yIChpbmRleCA9IDAsIGxlbmd0aCA9IG9iamVjdC5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgdmFsdWUgPSBvYmplY3RbaW5kZXhdO1xuICAgIGlmIChzdGF0ZS5yZXBsYWNlcikge1xuICAgICAgdmFsdWUgPSBzdGF0ZS5yZXBsYWNlci5jYWxsKG9iamVjdCwgU3RyaW5nKGluZGV4KSwgdmFsdWUpO1xuICAgIH1cbiAgICBpZiAod3JpdGVOb2RlKHN0YXRlLCBsZXZlbCArIDEsIHZhbHVlLCB0cnVlLCB0cnVlLCBmYWxzZSwgdHJ1ZSkgfHwgdHlwZW9mIHZhbHVlID09PSBcInVuZGVmaW5lZFwiICYmIHdyaXRlTm9kZShzdGF0ZSwgbGV2ZWwgKyAxLCBudWxsLCB0cnVlLCB0cnVlLCBmYWxzZSwgdHJ1ZSkpIHtcbiAgICAgIGlmICghY29tcGFjdCB8fCBfcmVzdWx0ICE9PSBcIlwiKSB7XG4gICAgICAgIF9yZXN1bHQgKz0gZ2VuZXJhdGVOZXh0TGluZShzdGF0ZSwgbGV2ZWwpO1xuICAgICAgfVxuICAgICAgaWYgKHN0YXRlLmR1bXAgJiYgQ0hBUl9MSU5FX0ZFRUQgPT09IHN0YXRlLmR1bXAuY2hhckNvZGVBdCgwKSkge1xuICAgICAgICBfcmVzdWx0ICs9IFwiLVwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX3Jlc3VsdCArPSBcIi0gXCI7XG4gICAgICB9XG4gICAgICBfcmVzdWx0ICs9IHN0YXRlLmR1bXA7XG4gICAgfVxuICB9XG4gIHN0YXRlLnRhZyA9IF90YWc7XG4gIHN0YXRlLmR1bXAgPSBfcmVzdWx0IHx8IFwiW11cIjtcbn1cbl9fbmFtZSh3cml0ZUJsb2NrU2VxdWVuY2UsIFwid3JpdGVCbG9ja1NlcXVlbmNlXCIpO1xuZnVuY3Rpb24gd3JpdGVGbG93TWFwcGluZyhzdGF0ZSwgbGV2ZWwsIG9iamVjdCkge1xuICB2YXIgX3Jlc3VsdCA9IFwiXCIsIF90YWcgPSBzdGF0ZS50YWcsIG9iamVjdEtleUxpc3QgPSBPYmplY3Qua2V5cyhvYmplY3QpLCBpbmRleCwgbGVuZ3RoLCBvYmplY3RLZXksIG9iamVjdFZhbHVlLCBwYWlyQnVmZmVyO1xuICBmb3IgKGluZGV4ID0gMCwgbGVuZ3RoID0gb2JqZWN0S2V5TGlzdC5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgcGFpckJ1ZmZlciA9IFwiXCI7XG4gICAgaWYgKF9yZXN1bHQgIT09IFwiXCIpIHBhaXJCdWZmZXIgKz0gXCIsIFwiO1xuICAgIGlmIChzdGF0ZS5jb25kZW5zZUZsb3cpIHBhaXJCdWZmZXIgKz0gJ1wiJztcbiAgICBvYmplY3RLZXkgPSBvYmplY3RLZXlMaXN0W2luZGV4XTtcbiAgICBvYmplY3RWYWx1ZSA9IG9iamVjdFtvYmplY3RLZXldO1xuICAgIGlmIChzdGF0ZS5yZXBsYWNlcikge1xuICAgICAgb2JqZWN0VmFsdWUgPSBzdGF0ZS5yZXBsYWNlci5jYWxsKG9iamVjdCwgb2JqZWN0S2V5LCBvYmplY3RWYWx1ZSk7XG4gICAgfVxuICAgIGlmICghd3JpdGVOb2RlKHN0YXRlLCBsZXZlbCwgb2JqZWN0S2V5LCBmYWxzZSwgZmFsc2UpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKHN0YXRlLmR1bXAubGVuZ3RoID4gMTAyNCkgcGFpckJ1ZmZlciArPSBcIj8gXCI7XG4gICAgcGFpckJ1ZmZlciArPSBzdGF0ZS5kdW1wICsgKHN0YXRlLmNvbmRlbnNlRmxvdyA/ICdcIicgOiBcIlwiKSArIFwiOlwiICsgKHN0YXRlLmNvbmRlbnNlRmxvdyA/IFwiXCIgOiBcIiBcIik7XG4gICAgaWYgKCF3cml0ZU5vZGUoc3RhdGUsIGxldmVsLCBvYmplY3RWYWx1ZSwgZmFsc2UsIGZhbHNlKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIHBhaXJCdWZmZXIgKz0gc3RhdGUuZHVtcDtcbiAgICBfcmVzdWx0ICs9IHBhaXJCdWZmZXI7XG4gIH1cbiAgc3RhdGUudGFnID0gX3RhZztcbiAgc3RhdGUuZHVtcCA9IFwie1wiICsgX3Jlc3VsdCArIFwifVwiO1xufVxuX19uYW1lKHdyaXRlRmxvd01hcHBpbmcsIFwid3JpdGVGbG93TWFwcGluZ1wiKTtcbmZ1bmN0aW9uIHdyaXRlQmxvY2tNYXBwaW5nKHN0YXRlLCBsZXZlbCwgb2JqZWN0LCBjb21wYWN0KSB7XG4gIHZhciBfcmVzdWx0ID0gXCJcIiwgX3RhZyA9IHN0YXRlLnRhZywgb2JqZWN0S2V5TGlzdCA9IE9iamVjdC5rZXlzKG9iamVjdCksIGluZGV4LCBsZW5ndGgsIG9iamVjdEtleSwgb2JqZWN0VmFsdWUsIGV4cGxpY2l0UGFpciwgcGFpckJ1ZmZlcjtcbiAgaWYgKHN0YXRlLnNvcnRLZXlzID09PSB0cnVlKSB7XG4gICAgb2JqZWN0S2V5TGlzdC5zb3J0KCk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHN0YXRlLnNvcnRLZXlzID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBvYmplY3RLZXlMaXN0LnNvcnQoc3RhdGUuc29ydEtleXMpO1xuICB9IGVsc2UgaWYgKHN0YXRlLnNvcnRLZXlzKSB7XG4gICAgdGhyb3cgbmV3IGV4Y2VwdGlvbihcInNvcnRLZXlzIG11c3QgYmUgYSBib29sZWFuIG9yIGEgZnVuY3Rpb25cIik7XG4gIH1cbiAgZm9yIChpbmRleCA9IDAsIGxlbmd0aCA9IG9iamVjdEtleUxpc3QubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgIHBhaXJCdWZmZXIgPSBcIlwiO1xuICAgIGlmICghY29tcGFjdCB8fCBfcmVzdWx0ICE9PSBcIlwiKSB7XG4gICAgICBwYWlyQnVmZmVyICs9IGdlbmVyYXRlTmV4dExpbmUoc3RhdGUsIGxldmVsKTtcbiAgICB9XG4gICAgb2JqZWN0S2V5ID0gb2JqZWN0S2V5TGlzdFtpbmRleF07XG4gICAgb2JqZWN0VmFsdWUgPSBvYmplY3Rbb2JqZWN0S2V5XTtcbiAgICBpZiAoc3RhdGUucmVwbGFjZXIpIHtcbiAgICAgIG9iamVjdFZhbHVlID0gc3RhdGUucmVwbGFjZXIuY2FsbChvYmplY3QsIG9iamVjdEtleSwgb2JqZWN0VmFsdWUpO1xuICAgIH1cbiAgICBpZiAoIXdyaXRlTm9kZShzdGF0ZSwgbGV2ZWwgKyAxLCBvYmplY3RLZXksIHRydWUsIHRydWUsIHRydWUpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgZXhwbGljaXRQYWlyID0gc3RhdGUudGFnICE9PSBudWxsICYmIHN0YXRlLnRhZyAhPT0gXCI/XCIgfHwgc3RhdGUuZHVtcCAmJiBzdGF0ZS5kdW1wLmxlbmd0aCA+IDEwMjQ7XG4gICAgaWYgKGV4cGxpY2l0UGFpcikge1xuICAgICAgaWYgKHN0YXRlLmR1bXAgJiYgQ0hBUl9MSU5FX0ZFRUQgPT09IHN0YXRlLmR1bXAuY2hhckNvZGVBdCgwKSkge1xuICAgICAgICBwYWlyQnVmZmVyICs9IFwiP1wiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFpckJ1ZmZlciArPSBcIj8gXCI7XG4gICAgICB9XG4gICAgfVxuICAgIHBhaXJCdWZmZXIgKz0gc3RhdGUuZHVtcDtcbiAgICBpZiAoZXhwbGljaXRQYWlyKSB7XG4gICAgICBwYWlyQnVmZmVyICs9IGdlbmVyYXRlTmV4dExpbmUoc3RhdGUsIGxldmVsKTtcbiAgICB9XG4gICAgaWYgKCF3cml0ZU5vZGUoc3RhdGUsIGxldmVsICsgMSwgb2JqZWN0VmFsdWUsIHRydWUsIGV4cGxpY2l0UGFpcikpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAoc3RhdGUuZHVtcCAmJiBDSEFSX0xJTkVfRkVFRCA9PT0gc3RhdGUuZHVtcC5jaGFyQ29kZUF0KDApKSB7XG4gICAgICBwYWlyQnVmZmVyICs9IFwiOlwiO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYWlyQnVmZmVyICs9IFwiOiBcIjtcbiAgICB9XG4gICAgcGFpckJ1ZmZlciArPSBzdGF0ZS5kdW1wO1xuICAgIF9yZXN1bHQgKz0gcGFpckJ1ZmZlcjtcbiAgfVxuICBzdGF0ZS50YWcgPSBfdGFnO1xuICBzdGF0ZS5kdW1wID0gX3Jlc3VsdCB8fCBcInt9XCI7XG59XG5fX25hbWUod3JpdGVCbG9ja01hcHBpbmcsIFwid3JpdGVCbG9ja01hcHBpbmdcIik7XG5mdW5jdGlvbiBkZXRlY3RUeXBlKHN0YXRlLCBvYmplY3QsIGV4cGxpY2l0KSB7XG4gIHZhciBfcmVzdWx0LCB0eXBlTGlzdCwgaW5kZXgsIGxlbmd0aCwgdHlwZTIsIHN0eWxlO1xuICB0eXBlTGlzdCA9IGV4cGxpY2l0ID8gc3RhdGUuZXhwbGljaXRUeXBlcyA6IHN0YXRlLmltcGxpY2l0VHlwZXM7XG4gIGZvciAoaW5kZXggPSAwLCBsZW5ndGggPSB0eXBlTGlzdC5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgdHlwZTIgPSB0eXBlTGlzdFtpbmRleF07XG4gICAgaWYgKCh0eXBlMi5pbnN0YW5jZU9mIHx8IHR5cGUyLnByZWRpY2F0ZSkgJiYgKCF0eXBlMi5pbnN0YW5jZU9mIHx8IHR5cGVvZiBvYmplY3QgPT09IFwib2JqZWN0XCIgJiYgb2JqZWN0IGluc3RhbmNlb2YgdHlwZTIuaW5zdGFuY2VPZikgJiYgKCF0eXBlMi5wcmVkaWNhdGUgfHwgdHlwZTIucHJlZGljYXRlKG9iamVjdCkpKSB7XG4gICAgICBpZiAoZXhwbGljaXQpIHtcbiAgICAgICAgaWYgKHR5cGUyLm11bHRpICYmIHR5cGUyLnJlcHJlc2VudE5hbWUpIHtcbiAgICAgICAgICBzdGF0ZS50YWcgPSB0eXBlMi5yZXByZXNlbnROYW1lKG9iamVjdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RhdGUudGFnID0gdHlwZTIudGFnO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdGF0ZS50YWcgPSBcIj9cIjtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlMi5yZXByZXNlbnQpIHtcbiAgICAgICAgc3R5bGUgPSBzdGF0ZS5zdHlsZU1hcFt0eXBlMi50YWddIHx8IHR5cGUyLmRlZmF1bHRTdHlsZTtcbiAgICAgICAgaWYgKF90b1N0cmluZy5jYWxsKHR5cGUyLnJlcHJlc2VudCkgPT09IFwiW29iamVjdCBGdW5jdGlvbl1cIikge1xuICAgICAgICAgIF9yZXN1bHQgPSB0eXBlMi5yZXByZXNlbnQob2JqZWN0LCBzdHlsZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoX2hhc093blByb3BlcnR5LmNhbGwodHlwZTIucmVwcmVzZW50LCBzdHlsZSkpIHtcbiAgICAgICAgICBfcmVzdWx0ID0gdHlwZTIucmVwcmVzZW50W3N0eWxlXShvYmplY3QsIHN0eWxlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgZXhjZXB0aW9uKFwiITxcIiArIHR5cGUyLnRhZyArICc+IHRhZyByZXNvbHZlciBhY2NlcHRzIG5vdCBcIicgKyBzdHlsZSArICdcIiBzdHlsZScpO1xuICAgICAgICB9XG4gICAgICAgIHN0YXRlLmR1bXAgPSBfcmVzdWx0O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cbl9fbmFtZShkZXRlY3RUeXBlLCBcImRldGVjdFR5cGVcIik7XG5mdW5jdGlvbiB3cml0ZU5vZGUoc3RhdGUsIGxldmVsLCBvYmplY3QsIGJsb2NrLCBjb21wYWN0LCBpc2tleSwgaXNibG9ja3NlcSkge1xuICBzdGF0ZS50YWcgPSBudWxsO1xuICBzdGF0ZS5kdW1wID0gb2JqZWN0O1xuICBpZiAoIWRldGVjdFR5cGUoc3RhdGUsIG9iamVjdCwgZmFsc2UpKSB7XG4gICAgZGV0ZWN0VHlwZShzdGF0ZSwgb2JqZWN0LCB0cnVlKTtcbiAgfVxuICB2YXIgdHlwZTIgPSBfdG9TdHJpbmcuY2FsbChzdGF0ZS5kdW1wKTtcbiAgdmFyIGluYmxvY2sgPSBibG9jaztcbiAgdmFyIHRhZ1N0cjtcbiAgaWYgKGJsb2NrKSB7XG4gICAgYmxvY2sgPSBzdGF0ZS5mbG93TGV2ZWwgPCAwIHx8IHN0YXRlLmZsb3dMZXZlbCA+IGxldmVsO1xuICB9XG4gIHZhciBvYmplY3RPckFycmF5ID0gdHlwZTIgPT09IFwiW29iamVjdCBPYmplY3RdXCIgfHwgdHlwZTIgPT09IFwiW29iamVjdCBBcnJheV1cIiwgZHVwbGljYXRlSW5kZXgsIGR1cGxpY2F0ZTtcbiAgaWYgKG9iamVjdE9yQXJyYXkpIHtcbiAgICBkdXBsaWNhdGVJbmRleCA9IHN0YXRlLmR1cGxpY2F0ZXMuaW5kZXhPZihvYmplY3QpO1xuICAgIGR1cGxpY2F0ZSA9IGR1cGxpY2F0ZUluZGV4ICE9PSAtMTtcbiAgfVxuICBpZiAoc3RhdGUudGFnICE9PSBudWxsICYmIHN0YXRlLnRhZyAhPT0gXCI/XCIgfHwgZHVwbGljYXRlIHx8IHN0YXRlLmluZGVudCAhPT0gMiAmJiBsZXZlbCA+IDApIHtcbiAgICBjb21wYWN0ID0gZmFsc2U7XG4gIH1cbiAgaWYgKGR1cGxpY2F0ZSAmJiBzdGF0ZS51c2VkRHVwbGljYXRlc1tkdXBsaWNhdGVJbmRleF0pIHtcbiAgICBzdGF0ZS5kdW1wID0gXCIqcmVmX1wiICsgZHVwbGljYXRlSW5kZXg7XG4gIH0gZWxzZSB7XG4gICAgaWYgKG9iamVjdE9yQXJyYXkgJiYgZHVwbGljYXRlICYmICFzdGF0ZS51c2VkRHVwbGljYXRlc1tkdXBsaWNhdGVJbmRleF0pIHtcbiAgICAgIHN0YXRlLnVzZWREdXBsaWNhdGVzW2R1cGxpY2F0ZUluZGV4XSA9IHRydWU7XG4gICAgfVxuICAgIGlmICh0eXBlMiA9PT0gXCJbb2JqZWN0IE9iamVjdF1cIikge1xuICAgICAgaWYgKGJsb2NrICYmIE9iamVjdC5rZXlzKHN0YXRlLmR1bXApLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICB3cml0ZUJsb2NrTWFwcGluZyhzdGF0ZSwgbGV2ZWwsIHN0YXRlLmR1bXAsIGNvbXBhY3QpO1xuICAgICAgICBpZiAoZHVwbGljYXRlKSB7XG4gICAgICAgICAgc3RhdGUuZHVtcCA9IFwiJnJlZl9cIiArIGR1cGxpY2F0ZUluZGV4ICsgc3RhdGUuZHVtcDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd3JpdGVGbG93TWFwcGluZyhzdGF0ZSwgbGV2ZWwsIHN0YXRlLmR1bXApO1xuICAgICAgICBpZiAoZHVwbGljYXRlKSB7XG4gICAgICAgICAgc3RhdGUuZHVtcCA9IFwiJnJlZl9cIiArIGR1cGxpY2F0ZUluZGV4ICsgXCIgXCIgKyBzdGF0ZS5kdW1wO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlMiA9PT0gXCJbb2JqZWN0IEFycmF5XVwiKSB7XG4gICAgICBpZiAoYmxvY2sgJiYgc3RhdGUuZHVtcC5sZW5ndGggIT09IDApIHtcbiAgICAgICAgaWYgKHN0YXRlLm5vQXJyYXlJbmRlbnQgJiYgIWlzYmxvY2tzZXEgJiYgbGV2ZWwgPiAwKSB7XG4gICAgICAgICAgd3JpdGVCbG9ja1NlcXVlbmNlKHN0YXRlLCBsZXZlbCAtIDEsIHN0YXRlLmR1bXAsIGNvbXBhY3QpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHdyaXRlQmxvY2tTZXF1ZW5jZShzdGF0ZSwgbGV2ZWwsIHN0YXRlLmR1bXAsIGNvbXBhY3QpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkdXBsaWNhdGUpIHtcbiAgICAgICAgICBzdGF0ZS5kdW1wID0gXCImcmVmX1wiICsgZHVwbGljYXRlSW5kZXggKyBzdGF0ZS5kdW1wO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3cml0ZUZsb3dTZXF1ZW5jZShzdGF0ZSwgbGV2ZWwsIHN0YXRlLmR1bXApO1xuICAgICAgICBpZiAoZHVwbGljYXRlKSB7XG4gICAgICAgICAgc3RhdGUuZHVtcCA9IFwiJnJlZl9cIiArIGR1cGxpY2F0ZUluZGV4ICsgXCIgXCIgKyBzdGF0ZS5kdW1wO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlMiA9PT0gXCJbb2JqZWN0IFN0cmluZ11cIikge1xuICAgICAgaWYgKHN0YXRlLnRhZyAhPT0gXCI/XCIpIHtcbiAgICAgICAgd3JpdGVTY2FsYXIoc3RhdGUsIHN0YXRlLmR1bXAsIGxldmVsLCBpc2tleSwgaW5ibG9jayk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlMiA9PT0gXCJbb2JqZWN0IFVuZGVmaW5lZF1cIikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoc3RhdGUuc2tpcEludmFsaWQpIHJldHVybiBmYWxzZTtcbiAgICAgIHRocm93IG5ldyBleGNlcHRpb24oXCJ1bmFjY2VwdGFibGUga2luZCBvZiBhbiBvYmplY3QgdG8gZHVtcCBcIiArIHR5cGUyKTtcbiAgICB9XG4gICAgaWYgKHN0YXRlLnRhZyAhPT0gbnVsbCAmJiBzdGF0ZS50YWcgIT09IFwiP1wiKSB7XG4gICAgICB0YWdTdHIgPSBlbmNvZGVVUkkoXG4gICAgICAgIHN0YXRlLnRhZ1swXSA9PT0gXCIhXCIgPyBzdGF0ZS50YWcuc2xpY2UoMSkgOiBzdGF0ZS50YWdcbiAgICAgICkucmVwbGFjZSgvIS9nLCBcIiUyMVwiKTtcbiAgICAgIGlmIChzdGF0ZS50YWdbMF0gPT09IFwiIVwiKSB7XG4gICAgICAgIHRhZ1N0ciA9IFwiIVwiICsgdGFnU3RyO1xuICAgICAgfSBlbHNlIGlmICh0YWdTdHIuc2xpY2UoMCwgMTgpID09PSBcInRhZzp5YW1sLm9yZywyMDAyOlwiKSB7XG4gICAgICAgIHRhZ1N0ciA9IFwiISFcIiArIHRhZ1N0ci5zbGljZSgxOCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0YWdTdHIgPSBcIiE8XCIgKyB0YWdTdHIgKyBcIj5cIjtcbiAgICAgIH1cbiAgICAgIHN0YXRlLmR1bXAgPSB0YWdTdHIgKyBcIiBcIiArIHN0YXRlLmR1bXA7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuX19uYW1lKHdyaXRlTm9kZSwgXCJ3cml0ZU5vZGVcIik7XG5mdW5jdGlvbiBnZXREdXBsaWNhdGVSZWZlcmVuY2VzKG9iamVjdCwgc3RhdGUpIHtcbiAgdmFyIG9iamVjdHMgPSBbXSwgZHVwbGljYXRlc0luZGV4ZXMgPSBbXSwgaW5kZXgsIGxlbmd0aDtcbiAgaW5zcGVjdE5vZGUob2JqZWN0LCBvYmplY3RzLCBkdXBsaWNhdGVzSW5kZXhlcyk7XG4gIGZvciAoaW5kZXggPSAwLCBsZW5ndGggPSBkdXBsaWNhdGVzSW5kZXhlcy5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgc3RhdGUuZHVwbGljYXRlcy5wdXNoKG9iamVjdHNbZHVwbGljYXRlc0luZGV4ZXNbaW5kZXhdXSk7XG4gIH1cbiAgc3RhdGUudXNlZER1cGxpY2F0ZXMgPSBuZXcgQXJyYXkobGVuZ3RoKTtcbn1cbl9fbmFtZShnZXREdXBsaWNhdGVSZWZlcmVuY2VzLCBcImdldER1cGxpY2F0ZVJlZmVyZW5jZXNcIik7XG5mdW5jdGlvbiBpbnNwZWN0Tm9kZShvYmplY3QsIG9iamVjdHMsIGR1cGxpY2F0ZXNJbmRleGVzKSB7XG4gIHZhciBvYmplY3RLZXlMaXN0LCBpbmRleCwgbGVuZ3RoO1xuICBpZiAob2JqZWN0ICE9PSBudWxsICYmIHR5cGVvZiBvYmplY3QgPT09IFwib2JqZWN0XCIpIHtcbiAgICBpbmRleCA9IG9iamVjdHMuaW5kZXhPZihvYmplY3QpO1xuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIGlmIChkdXBsaWNhdGVzSW5kZXhlcy5pbmRleE9mKGluZGV4KSA9PT0gLTEpIHtcbiAgICAgICAgZHVwbGljYXRlc0luZGV4ZXMucHVzaChpbmRleCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG9iamVjdHMucHVzaChvYmplY3QpO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkob2JqZWN0KSkge1xuICAgICAgICBmb3IgKGluZGV4ID0gMCwgbGVuZ3RoID0gb2JqZWN0Lmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICAgICAgICBpbnNwZWN0Tm9kZShvYmplY3RbaW5kZXhdLCBvYmplY3RzLCBkdXBsaWNhdGVzSW5kZXhlcyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9iamVjdEtleUxpc3QgPSBPYmplY3Qua2V5cyhvYmplY3QpO1xuICAgICAgICBmb3IgKGluZGV4ID0gMCwgbGVuZ3RoID0gb2JqZWN0S2V5TGlzdC5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgICAgICAgaW5zcGVjdE5vZGUob2JqZWN0W29iamVjdEtleUxpc3RbaW5kZXhdXSwgb2JqZWN0cywgZHVwbGljYXRlc0luZGV4ZXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5fX25hbWUoaW5zcGVjdE5vZGUsIFwiaW5zcGVjdE5vZGVcIik7XG5mdW5jdGlvbiBkdW1wJDEoaW5wdXQsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBzdGF0ZSA9IG5ldyBTdGF0ZShvcHRpb25zKTtcbiAgaWYgKCFzdGF0ZS5ub1JlZnMpIGdldER1cGxpY2F0ZVJlZmVyZW5jZXMoaW5wdXQsIHN0YXRlKTtcbiAgdmFyIHZhbHVlID0gaW5wdXQ7XG4gIGlmIChzdGF0ZS5yZXBsYWNlcikge1xuICAgIHZhbHVlID0gc3RhdGUucmVwbGFjZXIuY2FsbCh7IFwiXCI6IHZhbHVlIH0sIFwiXCIsIHZhbHVlKTtcbiAgfVxuICBpZiAod3JpdGVOb2RlKHN0YXRlLCAwLCB2YWx1ZSwgdHJ1ZSwgdHJ1ZSkpIHJldHVybiBzdGF0ZS5kdW1wICsgXCJcXG5cIjtcbiAgcmV0dXJuIFwiXCI7XG59XG5fX25hbWUoZHVtcCQxLCBcImR1bXAkMVwiKTtcbnZhciBkdW1wXzEgPSBkdW1wJDE7XG52YXIgZHVtcGVyID0ge1xuICBkdW1wOiBkdW1wXzFcbn07XG5mdW5jdGlvbiByZW5hbWVkKGZyb20sIHRvKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJGdW5jdGlvbiB5YW1sLlwiICsgZnJvbSArIFwiIGlzIHJlbW92ZWQgaW4ganMteWFtbCA0LiBVc2UgeWFtbC5cIiArIHRvICsgXCIgaW5zdGVhZCwgd2hpY2ggaXMgbm93IHNhZmUgYnkgZGVmYXVsdC5cIik7XG4gIH07XG59XG5fX25hbWUocmVuYW1lZCwgXCJyZW5hbWVkXCIpO1xudmFyIEpTT05fU0NIRU1BID0ganNvbjtcbnZhciBsb2FkID0gbG9hZGVyLmxvYWQ7XG52YXIgbG9hZEFsbCA9IGxvYWRlci5sb2FkQWxsO1xudmFyIGR1bXAgPSBkdW1wZXIuZHVtcDtcbnZhciBzYWZlTG9hZCA9IHJlbmFtZWQoXCJzYWZlTG9hZFwiLCBcImxvYWRcIik7XG52YXIgc2FmZUxvYWRBbGwgPSByZW5hbWVkKFwic2FmZUxvYWRBbGxcIiwgXCJsb2FkQWxsXCIpO1xudmFyIHNhZmVEdW1wID0gcmVuYW1lZChcInNhZmVEdW1wXCIsIFwiZHVtcFwiKTtcblxuZXhwb3J0IHtcbiAgSlNPTl9TQ0hFTUEsXG4gIGxvYWRcbn07XG4vKiEgQnVuZGxlZCBsaWNlbnNlIGluZm9ybWF0aW9uOlxuXG5qcy15YW1sL2Rpc3QvanMteWFtbC5tanM6XG4gICgqISBqcy15YW1sIDQuMS4xIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlY2EvanMteWFtbCBAbGljZW5zZSBNSVQgKilcbiovXG4iCiAgXSwKICAibWFwcGluZ3MiOiAiOzs7OztBQUtBLFNBQVMsU0FBUyxDQUFDLFNBQVM7QUFBQSxFQUMxQixPQUFPLE9BQU8sWUFBWSxlQUFlLFlBQVk7QUFBQTtBQUV2RCxPQUFPLFdBQVcsV0FBVztBQUM3QixTQUFTLFFBQVEsQ0FBQyxTQUFTO0FBQUEsRUFDekIsT0FBTyxPQUFPLFlBQVksWUFBWSxZQUFZO0FBQUE7QUFFcEQsT0FBTyxVQUFVLFVBQVU7QUFDM0IsU0FBUyxPQUFPLENBQUMsVUFBVTtBQUFBLEVBQ3pCLElBQUksTUFBTSxRQUFRLFFBQVE7QUFBQSxJQUFHLE9BQU87QUFBQSxFQUMvQixTQUFJLFVBQVUsUUFBUTtBQUFBLElBQUcsT0FBTyxDQUFDO0FBQUEsRUFDdEMsT0FBTyxDQUFDLFFBQVE7QUFBQTtBQUVsQixPQUFPLFNBQVMsU0FBUztBQUN6QixTQUFTLE1BQU0sQ0FBQyxRQUFRLFFBQVE7QUFBQSxFQUM5QixJQUFJLE9BQU8sUUFBUSxLQUFLO0FBQUEsRUFDeEIsSUFBSSxR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LEVBQ1osSUFBSSxNQUFNLFVBQVU7QUFBQSxJQUNsQixRQUFRLE1BQU0sU0FBUyxLQUFLLEVBQUUsSUFBSSxNQUFNLEdBQUcsSUFBSSxLQUFLO0FBQUEsRUFDdEQ7QUFBQSxFQUNBLElBQUksVUFBVSxPQUFPLEdBQUcsT0FBTyxNQUFNLElBQUk7QUFBQSxJQUFHLE9BQU8sTUFBTSxPQUFPO0FBQUE7QUFBQSxFQUNoRSxPQUFPO0FBQUE7QUFFVCxPQUFPLFFBQVEsUUFBUTtBQUN2QixJQUFJLFNBQVM7QUFDYixJQUFJLFNBQVM7QUFBQSxFQUNYLE1BQU07QUFDUjtBQUNBLFNBQVMsT0FBTyxDQUFDLE1BQU0sSUFBSTtBQUFBLEVBQ3pCLE9BQU8sUUFBUSxHQUFHO0FBQUEsSUFDaEIsTUFBTSxJQUFJLE1BQU0sbUJBQW1CLE9BQU8sd0NBQXdDLEtBQUsseUNBQXlDO0FBQUE7QUFBQTtBQUdwSSxPQUFPLFNBQVMsU0FBUztBQUN6QixJQUFJLGNBQWM7QUFDbEIsSUFBSSxPQUFPLE9BQU87QUFDbEIsSUFBSSxVQUFVLE9BQU87QUFDckIsSUFBSSxPQUFPLE9BQU87QUFDbEIsSUFBSSxXQUFXLFFBQVEsWUFBWSxNQUFNO0FBQ3pDLElBQUksY0FBYyxRQUFRLGVBQWUsU0FBUztBQUNsRCxJQUFJLFdBQVcsUUFBUSxZQUFZLE1BQU07QUFXekM7QUFBQTtBQUFBO0FBQUE7QUFBQTsiLAogICJkZWJ1Z0lkIjogIjM0QkVBNzdCNjMyNUY2MEM2NDc1NkUyMTY0NzU2RTIxIiwKICAibmFtZXMiOiBbXQp9
