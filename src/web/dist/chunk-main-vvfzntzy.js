import {
  require_dist
} from "./chunk-main-ck580f0k.js";
import {
  assignWithDepth_default,
  common_default,
  detectType,
  directiveRegex,
  sanitizeDirective
} from "./chunk-main-aws590jt.js";
import {
  __name,
  basisClosed_default,
  basisOpen_default,
  basis_default,
  bumpX,
  bumpY,
  bundle_default,
  cardinalClosed_default,
  cardinalOpen_default,
  cardinal_default,
  catmullRomClosed_default,
  catmullRomOpen_default,
  catmullRom_default,
  linearClosed_default,
  linear_default,
  log,
  monotoneX,
  monotoneY,
  natural_default,
  select_default,
  stepAfter,
  stepBefore,
  step_default
} from "./chunk-main-vcnyggwp.js";
import {
  __toESM
} from "./chunk-main-g8wf8be2.js";

// node_modules/es-toolkit/dist/predicate/isPrimitive.mjs
function isPrimitive(value) {
  return value == null || typeof value !== "object" && typeof value !== "function";
}

// node_modules/es-toolkit/dist/compat/_internal/getTag.mjs
function getTag(value) {
  if (value == null)
    return value === undefined ? "[object Undefined]" : "[object Null]";
  return Object.prototype.toString.call(value);
}

// node_modules/es-toolkit/dist/compat/_internal/tags.mjs
var regexpTag = "[object RegExp]";
var stringTag = "[object String]";
var numberTag = "[object Number]";
var booleanTag = "[object Boolean]";
var argumentsTag = "[object Arguments]";
var symbolTag = "[object Symbol]";
var dateTag = "[object Date]";
var mapTag = "[object Map]";
var setTag = "[object Set]";
var arrayTag = "[object Array]";
var arrayBufferTag = "[object ArrayBuffer]";
var objectTag = "[object Object]";
var dataViewTag = "[object DataView]";
var uint8ArrayTag = "[object Uint8Array]";
var uint8ClampedArrayTag = "[object Uint8ClampedArray]";
var uint16ArrayTag = "[object Uint16Array]";
var uint32ArrayTag = "[object Uint32Array]";
var int8ArrayTag = "[object Int8Array]";
var int16ArrayTag = "[object Int16Array]";
var int32ArrayTag = "[object Int32Array]";
var float32ArrayTag = "[object Float32Array]";
var float64ArrayTag = "[object Float64Array]";

// node_modules/es-toolkit/dist/compat/predicate/isArray.mjs
function isArray(value) {
  return Array.isArray(value);
}

// node_modules/es-toolkit/dist/predicate/isTypedArray.mjs
function isTypedArray(x) {
  return ArrayBuffer.isView(x) && !(x instanceof DataView);
}

// node_modules/es-toolkit/dist/compat/predicate/isTypedArray.mjs
function isTypedArray2(x) {
  return isTypedArray(x);
}

// node_modules/es-toolkit/dist/compat/object/clone.mjs
function clone(obj) {
  if (isPrimitive(obj))
    return obj;
  const tag = getTag(obj);
  if (!isCloneableObject(obj))
    return {};
  if (isArray(obj)) {
    const result2 = Array.from(obj);
    if (obj.length > 0 && typeof obj[0] === "string" && Object.hasOwn(obj, "index")) {
      result2.index = obj.index;
      result2.input = obj.input;
    }
    return result2;
  }
  if (isTypedArray2(obj)) {
    const typedArray = obj;
    const Ctor = typedArray.constructor;
    return new Ctor(typedArray.buffer, typedArray.byteOffset, typedArray.length);
  }
  if (tag === "[object ArrayBuffer]")
    return new ArrayBuffer(obj.byteLength);
  if (tag === "[object DataView]") {
    const dataView = obj;
    const buffer = dataView.buffer;
    const byteOffset = dataView.byteOffset;
    const byteLength = dataView.byteLength;
    const clonedBuffer = new ArrayBuffer(byteLength);
    const srcView = new Uint8Array(buffer, byteOffset, byteLength);
    new Uint8Array(clonedBuffer).set(srcView);
    return new DataView(clonedBuffer);
  }
  if (tag === "[object Boolean]" || tag === "[object Number]" || tag === "[object String]") {
    const Ctor = obj.constructor;
    const clone2 = new Ctor(obj.valueOf());
    if (tag === "[object String]")
      cloneStringObjectProperties(clone2, obj);
    else
      copyOwnProperties(clone2, obj);
    return clone2;
  }
  if (tag === "[object Date]")
    return new Date(Number(obj));
  if (tag === "[object RegExp]") {
    const regExp = obj;
    const clone2 = new RegExp(regExp.source, regExp.flags);
    clone2.lastIndex = regExp.lastIndex;
    return clone2;
  }
  if (tag === "[object Symbol]")
    return Object(Symbol.prototype.valueOf.call(obj));
  if (tag === "[object Map]") {
    const map = obj;
    const result2 = /* @__PURE__ */ new Map;
    map.forEach((obj2, key) => {
      result2.set(key, obj2);
    });
    return result2;
  }
  if (tag === "[object Set]") {
    const set = obj;
    const result2 = /* @__PURE__ */ new Set;
    set.forEach((obj2) => {
      result2.add(obj2);
    });
    return result2;
  }
  if (tag === "[object Arguments]") {
    const args = obj;
    const result2 = {};
    copyOwnProperties(result2, args);
    result2.length = args.length;
    result2[Symbol.iterator] = args[Symbol.iterator];
    return result2;
  }
  const result = {};
  copyPrototype(result, obj);
  copyOwnProperties(result, obj);
  copySymbolProperties(result, obj);
  return result;
}
function isCloneableObject(object) {
  switch (getTag(object)) {
    case argumentsTag:
    case arrayTag:
    case arrayBufferTag:
    case dataViewTag:
    case booleanTag:
    case dateTag:
    case float32ArrayTag:
    case float64ArrayTag:
    case int8ArrayTag:
    case int16ArrayTag:
    case int32ArrayTag:
    case mapTag:
    case numberTag:
    case objectTag:
    case regexpTag:
    case setTag:
    case stringTag:
    case symbolTag:
    case uint8ArrayTag:
    case uint8ClampedArrayTag:
    case uint16ArrayTag:
    case uint32ArrayTag:
      return true;
    default:
      return false;
  }
}
function copyOwnProperties(target, source) {
  for (const key in source)
    if (Object.hasOwn(source, key))
      target[key] = source[key];
}
function copySymbolProperties(target, source) {
  const symbols = Object.getOwnPropertySymbols(source);
  for (let i = 0;i < symbols.length; i++) {
    const symbol = symbols[i];
    if (Object.prototype.propertyIsEnumerable.call(source, symbol))
      target[symbol] = source[symbol];
  }
}
function cloneStringObjectProperties(target, source) {
  const stringLength = source.valueOf().length;
  for (const key in source)
    if (Object.hasOwn(source, key) && (Number.isNaN(Number(key)) || Number(key) >= stringLength))
      target[key] = source[key];
}
function copyPrototype(target, source) {
  const proto = Object.getPrototypeOf(source);
  if (proto !== null) {
    if (typeof source.constructor === "function")
      Object.setPrototypeOf(target, proto);
  }
}
// node_modules/es-toolkit/dist/compat/function/memoize.mjs
function memoize(func, resolver) {
  if (typeof func !== "function" || resolver != null && typeof resolver !== "function")
    throw new TypeError("Expected a function");
  const memoized = function(...args) {
    const key = resolver ? resolver.apply(this, args) : args[0];
    const cache = memoized.cache;
    if (cache.has(key))
      return cache.get(key);
    const result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || Map);
  return memoized;
}
memoize.Cache = Map;
// node_modules/es-toolkit/dist/function/noop.mjs
function noop() {}

// node_modules/es-toolkit/dist/object/clone.mjs
function clone2(obj) {
  if (isPrimitive(obj))
    return obj;
  if (Array.isArray(obj) || isTypedArray(obj) || obj instanceof ArrayBuffer || typeof SharedArrayBuffer !== "undefined" && obj instanceof SharedArrayBuffer)
    return obj.slice(0);
  const prototype = Object.getPrototypeOf(obj);
  if (prototype == null)
    return Object.assign(Object.create(prototype), obj);
  const Constructor = prototype.constructor;
  if (obj instanceof Date || obj instanceof Map || obj instanceof Set)
    return new Constructor(obj);
  if (obj instanceof RegExp) {
    const newRegExp = new Constructor(obj);
    newRegExp.lastIndex = obj.lastIndex;
    return newRegExp;
  }
  if (obj instanceof DataView)
    return new Constructor(obj.buffer.slice(0));
  if (obj instanceof Error) {
    let newError;
    if (obj instanceof AggregateError)
      newError = new Constructor(obj.errors, obj.message, { cause: obj.cause });
    else
      newError = new Constructor(obj.message, { cause: obj.cause });
    newError.stack = obj.stack;
    Object.assign(newError, obj);
    return newError;
  }
  if (typeof File !== "undefined" && obj instanceof File)
    return new Constructor([obj], obj.name, {
      type: obj.type,
      lastModified: obj.lastModified
    });
  if (typeof obj === "object")
    return Object.assign(Object.create(prototype), obj);
  return obj;
}

// node_modules/es-toolkit/dist/compat/_internal/getSymbols.mjs
function getSymbols(object) {
  return Object.getOwnPropertySymbols(object).filter((symbol) => Object.prototype.propertyIsEnumerable.call(object, symbol));
}

// node_modules/es-toolkit/dist/_internal/globalThis.mjs
var globalThis_ = typeof globalThis === "object" && globalThis || typeof window === "object" && window || typeof self === "object" && self || typeof global === "object" && global || function() {
  return this;
}() || Function("return this")();

// node_modules/es-toolkit/dist/predicate/isBuffer.mjs
function isBuffer(x) {
  return typeof globalThis_.Buffer !== "undefined" && globalThis_.Buffer.isBuffer(x);
}

// node_modules/es-toolkit/dist/_internal/isUnsafeProperty.mjs
function isUnsafeProperty(key) {
  return key === "__proto__";
}

// node_modules/es-toolkit/dist/compat/predicate/isPlainObject.mjs
function isPlainObject(object) {
  if (typeof object !== "object")
    return false;
  if (object == null)
    return false;
  if (Object.getPrototypeOf(object) === null)
    return true;
  if (Object.prototype.toString.call(object) !== "[object Object]") {
    const tag = object[Symbol.toStringTag];
    if (tag == null)
      return false;
    if (!Object.getOwnPropertyDescriptor(object, Symbol.toStringTag)?.writable)
      return false;
    return object.toString() === `[object ${tag}]`;
  }
  let proto = object;
  while (Object.getPrototypeOf(proto) !== null)
    proto = Object.getPrototypeOf(proto);
  return Object.getPrototypeOf(object) === proto;
}

// node_modules/es-toolkit/dist/object/cloneDeepWith.mjs
function cloneDeepWith(obj, cloneValue) {
  return cloneDeepWithImpl(obj, undefined, obj, /* @__PURE__ */ new Map, cloneValue);
}
function cloneDeepWithImpl(valueToClone, keyToClone, objectToClone, stack = /* @__PURE__ */ new Map, cloneValue = undefined) {
  const cloned = cloneValue?.(valueToClone, keyToClone, objectToClone, stack);
  if (cloned !== undefined)
    return cloned;
  if (isPrimitive(valueToClone))
    return valueToClone;
  if (stack.has(valueToClone))
    return stack.get(valueToClone);
  if (Array.isArray(valueToClone)) {
    const result = new Array(valueToClone.length);
    stack.set(valueToClone, result);
    for (let i = 0;i < valueToClone.length; i++)
      result[i] = cloneDeepWithImpl(valueToClone[i], i, objectToClone, stack, cloneValue);
    if (Object.hasOwn(valueToClone, "index"))
      result.index = valueToClone.index;
    if (Object.hasOwn(valueToClone, "input"))
      result.input = valueToClone.input;
    return result;
  }
  if (valueToClone instanceof Date)
    return new Date(valueToClone.getTime());
  if (valueToClone instanceof RegExp) {
    const result = new RegExp(valueToClone.source, valueToClone.flags);
    result.lastIndex = valueToClone.lastIndex;
    return result;
  }
  if (valueToClone instanceof Map) {
    const result = /* @__PURE__ */ new Map;
    stack.set(valueToClone, result);
    for (const [key, value] of valueToClone)
      result.set(key, cloneDeepWithImpl(value, key, objectToClone, stack, cloneValue));
    return result;
  }
  if (valueToClone instanceof Set) {
    const result = /* @__PURE__ */ new Set;
    stack.set(valueToClone, result);
    for (const value of valueToClone)
      result.add(cloneDeepWithImpl(value, undefined, objectToClone, stack, cloneValue));
    return result;
  }
  if (isBuffer(valueToClone))
    return valueToClone.subarray();
  if (isTypedArray(valueToClone)) {
    const result = new (Object.getPrototypeOf(valueToClone)).constructor(valueToClone.length);
    stack.set(valueToClone, result);
    for (let i = 0;i < valueToClone.length; i++)
      result[i] = cloneDeepWithImpl(valueToClone[i], i, objectToClone, stack, cloneValue);
    return result;
  }
  if (valueToClone instanceof ArrayBuffer || typeof SharedArrayBuffer !== "undefined" && valueToClone instanceof SharedArrayBuffer)
    return valueToClone.slice(0);
  if (valueToClone instanceof DataView) {
    const result = new DataView(valueToClone.buffer.slice(0), valueToClone.byteOffset, valueToClone.byteLength);
    stack.set(valueToClone, result);
    copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
    return result;
  }
  if (typeof File !== "undefined" && valueToClone instanceof File) {
    const result = new File([valueToClone], valueToClone.name, { type: valueToClone.type });
    stack.set(valueToClone, result);
    copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
    return result;
  }
  if (typeof Blob !== "undefined" && valueToClone instanceof Blob) {
    const result = new Blob([valueToClone], { type: valueToClone.type });
    stack.set(valueToClone, result);
    copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
    return result;
  }
  if (valueToClone instanceof Error) {
    const result = structuredClone(valueToClone);
    stack.set(valueToClone, result);
    result.message = valueToClone.message;
    result.name = valueToClone.name;
    result.stack = valueToClone.stack;
    result.cause = valueToClone.cause;
    result.constructor = valueToClone.constructor;
    copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
    return result;
  }
  if (valueToClone instanceof Boolean) {
    const result = new Boolean(valueToClone.valueOf());
    stack.set(valueToClone, result);
    copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
    return result;
  }
  if (valueToClone instanceof Number) {
    const result = new Number(valueToClone.valueOf());
    stack.set(valueToClone, result);
    copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
    return result;
  }
  if (valueToClone instanceof String) {
    const result = new String(valueToClone.valueOf());
    stack.set(valueToClone, result);
    copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
    return result;
  }
  if (typeof valueToClone === "object" && isCloneableObject2(valueToClone)) {
    const result = Object.create(Object.getPrototypeOf(valueToClone));
    stack.set(valueToClone, result);
    copyProperties(result, valueToClone, objectToClone, stack, cloneValue);
    return result;
  }
  return valueToClone;
}
function copyProperties(target, source, objectToClone = target, stack, cloneValue) {
  const keys = [...Object.keys(source), ...getSymbols(source)];
  for (let i = 0;i < keys.length; i++) {
    const key = keys[i];
    const descriptor = Object.getOwnPropertyDescriptor(target, key);
    if (descriptor == null || descriptor.writable)
      target[key] = cloneDeepWithImpl(source[key], key, objectToClone, stack, cloneValue);
  }
}
function isCloneableObject2(object) {
  switch (getTag(object)) {
    case argumentsTag:
    case arrayTag:
    case arrayBufferTag:
    case dataViewTag:
    case booleanTag:
    case dateTag:
    case float32ArrayTag:
    case float64ArrayTag:
    case int8ArrayTag:
    case int16ArrayTag:
    case int32ArrayTag:
    case mapTag:
    case numberTag:
    case objectTag:
    case regexpTag:
    case setTag:
    case stringTag:
    case symbolTag:
    case uint8ArrayTag:
    case uint8ClampedArrayTag:
    case uint16ArrayTag:
    case uint32ArrayTag:
      return true;
    default:
      return false;
  }
}

// node_modules/es-toolkit/dist/compat/object/cloneDeepWith.mjs
function cloneDeepWith2(obj, customizer) {
  return cloneDeepWith(obj, (value, key, object, stack) => {
    const cloned = customizer?.(value, key, object, stack);
    if (cloned !== undefined)
      return cloned;
    if (typeof obj !== "object")
      return;
    if (getTag(obj) === "[object Object]" && typeof obj.constructor !== "function") {
      const result = {};
      stack.set(obj, result);
      copyProperties(result, obj, object, stack);
      return result;
    }
    switch (Object.prototype.toString.call(obj)) {
      case numberTag:
      case stringTag:
      case booleanTag: {
        const result = new obj.constructor(obj?.valueOf());
        copyProperties(result, obj);
        return result;
      }
      case argumentsTag: {
        const result = {};
        copyProperties(result, obj);
        result.length = obj.length;
        result[Symbol.iterator] = obj[Symbol.iterator];
        return result;
      }
      default:
        return;
    }
  });
}

// node_modules/es-toolkit/dist/compat/object/cloneDeep.mjs
function cloneDeep(obj) {
  return cloneDeepWith2(obj);
}

// node_modules/es-toolkit/dist/compat/predicate/isArguments.mjs
function isArguments(value) {
  return value !== null && typeof value === "object" && getTag(value) === "[object Arguments]";
}

// node_modules/es-toolkit/dist/compat/predicate/isObjectLike.mjs
function isObjectLike(value) {
  return typeof value === "object" && value !== null;
}

// node_modules/es-toolkit/dist/predicate/isLength.mjs
function isLength(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

// node_modules/es-toolkit/dist/compat/predicate/isArrayLike.mjs
function isArrayLike(value) {
  return value != null && typeof value !== "function" && isLength(value.length);
}

// node_modules/es-toolkit/dist/compat/predicate/isArrayLikeObject.mjs
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

// node_modules/es-toolkit/dist/compat/object/mergeWith.mjs
function mergeWith(object, ...otherArgs) {
  const sources = otherArgs.slice(0, -1);
  const merge = otherArgs[otherArgs.length - 1];
  let result = object;
  for (let i = 0;i < sources.length; i++) {
    const source = sources[i];
    result = mergeWithDeep(result, source, merge, /* @__PURE__ */ new Map);
  }
  return result;
}
function mergeWithDeep(target, source, merge, stack) {
  if (isPrimitive(target))
    target = Object(target);
  if (source == null || typeof source !== "object")
    return target;
  if (stack.has(source))
    return clone2(stack.get(source));
  stack.set(source, target);
  if (Array.isArray(source)) {
    source = source.slice();
    for (let i = 0;i < source.length; i++)
      source[i] = source[i] ?? undefined;
  }
  const sourceKeys = [...Object.keys(source), ...getSymbols(source)];
  for (let i = 0;i < sourceKeys.length; i++) {
    const key = sourceKeys[i];
    if (isUnsafeProperty(key))
      continue;
    let sourceValue = source[key];
    let targetValue = target[key];
    if (isArguments(sourceValue))
      sourceValue = { ...sourceValue };
    if (isArguments(targetValue))
      targetValue = { ...targetValue };
    if (isBuffer(sourceValue))
      sourceValue = cloneDeep(sourceValue);
    if (Array.isArray(sourceValue))
      if (Array.isArray(targetValue)) {
        const cloned = [];
        const targetKeys = Reflect.ownKeys(targetValue);
        for (let i2 = 0;i2 < targetKeys.length; i2++) {
          const targetKey = targetKeys[i2];
          cloned[targetKey] = targetValue[targetKey];
        }
        targetValue = cloned;
      } else if (isArrayLikeObject(targetValue)) {
        const cloned = [];
        for (let i2 = 0;i2 < targetValue.length; i2++)
          cloned[i2] = targetValue[i2];
        targetValue = cloned;
      } else
        targetValue = [];
    const merged = merge(targetValue, sourceValue, key, target, source, stack);
    if (merged !== undefined)
      target[key] = merged;
    else if (Array.isArray(sourceValue))
      target[key] = mergeWithDeep(targetValue, sourceValue, merge, stack);
    else if (isObjectLike(targetValue) && isObjectLike(sourceValue) && (isPlainObject(targetValue) || isPlainObject(sourceValue) || isTypedArray2(targetValue) || isTypedArray2(sourceValue)))
      target[key] = mergeWithDeep(targetValue, sourceValue, merge, stack);
    else if (targetValue == null && isPlainObject(sourceValue))
      target[key] = mergeWithDeep({}, sourceValue, merge, stack);
    else if (targetValue == null && isTypedArray2(sourceValue))
      target[key] = cloneDeep(sourceValue);
    else if (targetValue === undefined || sourceValue !== undefined)
      target[key] = sourceValue;
  }
  return target;
}

// node_modules/es-toolkit/dist/compat/object/merge.mjs
function merge(object, ...sources) {
  return mergeWith(object, ...sources, noop);
}
// node_modules/es-toolkit/dist/compat/_internal/isPrototype.mjs
function isPrototype(value) {
  const constructor = value?.constructor;
  return value === (typeof constructor === "function" ? constructor.prototype : Object.prototype);
}

// node_modules/es-toolkit/dist/compat/predicate/isEmpty.mjs
function isEmpty(value) {
  if (value == null)
    return true;
  if (isArrayLike(value)) {
    if (typeof value.splice !== "function" && typeof value !== "string" && !isBuffer(value) && !isTypedArray2(value) && !isArguments(value))
      return false;
    return value.length === 0;
  }
  if (typeof value === "object") {
    if (value instanceof Map || value instanceof Set)
      return value.size === 0;
    const keys = Object.keys(value);
    if (isPrototype(value))
      return keys.filter((x) => x !== "constructor").length === 0;
    return keys.length === 0;
  }
  return true;
}
// node_modules/mermaid/dist/chunks/mermaid.core/chunk-5ZQYHXKU.mjs
var import_sanitize_url = __toESM(require_dist(), 1);
var ZERO_WIDTH_SPACE = "​";
var d3CurveTypes = {
  curveBasis: basis_default,
  curveBasisClosed: basisClosed_default,
  curveBasisOpen: basisOpen_default,
  curveBumpX: bumpX,
  curveBumpY: bumpY,
  curveBundle: bundle_default,
  curveCardinalClosed: cardinalClosed_default,
  curveCardinalOpen: cardinalOpen_default,
  curveCardinal: cardinal_default,
  curveCatmullRomClosed: catmullRomClosed_default,
  curveCatmullRomOpen: catmullRomOpen_default,
  curveCatmullRom: catmullRom_default,
  curveLinear: linear_default,
  curveLinearClosed: linearClosed_default,
  curveMonotoneX: monotoneX,
  curveMonotoneY: monotoneY,
  curveNatural: natural_default,
  curveStep: step_default,
  curveStepAfter: stepAfter,
  curveStepBefore: stepBefore
};
var directiveWithoutOpen = /\s*(?:(\w+)(?=:):|(\w+))\s*(?:(\w+)|((?:(?!}%{2}).|\r?\n)*))?\s*(?:}%{2})?/gi;
var detectInit = /* @__PURE__ */ __name(function(text, config) {
  const inits = detectDirective(text, /(?:init\b)|(?:initialize\b)/);
  let results = {};
  if (Array.isArray(inits)) {
    const args = inits.map((init) => init.args);
    sanitizeDirective(args);
    results = assignWithDepth_default(results, [...args]);
  } else {
    results = inits.args;
  }
  if (!results) {
    return;
  }
  let type = detectType(text, config);
  const prop = "config";
  if (results[prop] !== undefined) {
    if (type === "flowchart-v2") {
      type = "flowchart";
    }
    results[type] = results[prop];
    delete results[prop];
  }
  return results;
}, "detectInit");
var detectDirective = /* @__PURE__ */ __name(function(text, type = null) {
  try {
    const commentWithoutDirectives = new RegExp(`[%]{2}(?![{]${directiveWithoutOpen.source})(?=[}][%]{2}).*
`, "ig");
    text = text.trim().replace(commentWithoutDirectives, "").replace(/'/gm, '"');
    log.debug(`Detecting diagram directive${type !== null ? " type:" + type : ""} based on the text:${text}`);
    let match;
    const result2 = [];
    while ((match = directiveRegex.exec(text)) !== null) {
      if (match.index === directiveRegex.lastIndex) {
        directiveRegex.lastIndex++;
      }
      if (match && !type || type && match[1]?.match(type) || type && match[2]?.match(type)) {
        const type2 = match[1] ? match[1] : match[2];
        const args = match[3] ? match[3].trim() : match[4] ? JSON.parse(match[4].trim()) : null;
        result2.push({ type: type2, args });
      }
    }
    if (result2.length === 0) {
      return { type: text, args: null };
    }
    return result2.length === 1 ? result2[0] : result2;
  } catch (error) {
    log.error(`ERROR: ${error.message} - Unable to parse directive type: '${type}' based on the text: '${text}'`);
    return { type: undefined, args: null };
  }
}, "detectDirective");
var removeDirectives = /* @__PURE__ */ __name(function(text) {
  return text.replace(directiveRegex, "");
}, "removeDirectives");
var isSubstringInArray = /* @__PURE__ */ __name(function(str, arr) {
  for (const [i, element] of arr.entries()) {
    if (element.match(str)) {
      return i;
    }
  }
  return -1;
}, "isSubstringInArray");
function interpolateToCurve(interpolate, defaultCurve) {
  if (!interpolate) {
    return defaultCurve;
  }
  const curveName = `curve${interpolate.charAt(0).toUpperCase() + interpolate.slice(1)}`;
  return d3CurveTypes[curveName] ?? defaultCurve;
}
__name(interpolateToCurve, "interpolateToCurve");
function formatUrl(linkStr, config) {
  const url = linkStr.trim();
  if (!url) {
    return;
  }
  if (config.securityLevel !== "loose") {
    return import_sanitize_url.sanitizeUrl(url);
  }
  return url;
}
__name(formatUrl, "formatUrl");
var runFunc = /* @__PURE__ */ __name((functionName, ...params) => {
  const arrPaths = functionName.split(".");
  const len = arrPaths.length - 1;
  const fnName = arrPaths[len];
  let obj = window;
  for (let i = 0;i < len; i++) {
    obj = obj[arrPaths[i]];
    if (!obj) {
      log.error(`Function name: ${functionName} not found in window`);
      return;
    }
  }
  obj[fnName](...params);
}, "runFunc");
function distance(p1, p2) {
  if (!p1 || !p2) {
    return 0;
  }
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}
__name(distance, "distance");
function traverseEdge(points) {
  let prevPoint;
  let totalDistance = 0;
  points.forEach((point) => {
    totalDistance += distance(point, prevPoint);
    prevPoint = point;
  });
  const remainingDistance = totalDistance / 2;
  return calculatePoint(points, remainingDistance);
}
__name(traverseEdge, "traverseEdge");
function calcLabelPosition(points) {
  if (points.length === 1) {
    return points[0];
  }
  return traverseEdge(points);
}
__name(calcLabelPosition, "calcLabelPosition");
var roundNumber = /* @__PURE__ */ __name((num, precision = 2) => {
  const factor = Math.pow(10, precision);
  return Math.round(num * factor) / factor;
}, "roundNumber");
var calculatePoint = /* @__PURE__ */ __name((points, distanceToTraverse) => {
  let prevPoint = undefined;
  let remainingDistance = distanceToTraverse;
  for (const point of points) {
    if (prevPoint) {
      const vectorDistance = distance(point, prevPoint);
      if (vectorDistance === 0) {
        return prevPoint;
      }
      if (vectorDistance < remainingDistance) {
        remainingDistance -= vectorDistance;
      } else {
        const distanceRatio = remainingDistance / vectorDistance;
        if (distanceRatio <= 0) {
          return prevPoint;
        }
        if (distanceRatio >= 1) {
          return { x: point.x, y: point.y };
        }
        if (distanceRatio > 0 && distanceRatio < 1) {
          return {
            x: roundNumber((1 - distanceRatio) * prevPoint.x + distanceRatio * point.x, 5),
            y: roundNumber((1 - distanceRatio) * prevPoint.y + distanceRatio * point.y, 5)
          };
        }
      }
    }
    prevPoint = point;
  }
  throw new Error("Could not find a suitable point for the given distance");
}, "calculatePoint");
var calcCardinalityPosition = /* @__PURE__ */ __name((isRelationTypePresent, points, initialPosition) => {
  log.info(`our points ${JSON.stringify(points)}`);
  if (points[0] !== initialPosition) {
    points = points.reverse();
  }
  const distanceToCardinalityPoint = 25;
  const center = calculatePoint(points, distanceToCardinalityPoint);
  const d = isRelationTypePresent ? 10 : 5;
  const angle = Math.atan2(points[0].y - center.y, points[0].x - center.x);
  const cardinalityPosition = { x: 0, y: 0 };
  cardinalityPosition.x = Math.sin(angle) * d + (points[0].x + center.x) / 2;
  cardinalityPosition.y = -Math.cos(angle) * d + (points[0].y + center.y) / 2;
  return cardinalityPosition;
}, "calcCardinalityPosition");
function calcTerminalLabelPosition(terminalMarkerSize, position, _points) {
  const points = structuredClone(_points);
  log.info("our points", points);
  if (position !== "start_left" && position !== "start_right") {
    points.reverse();
  }
  const distanceToCardinalityPoint = 25 + terminalMarkerSize;
  const center = calculatePoint(points, distanceToCardinalityPoint);
  const d = 10 + terminalMarkerSize * 0.5;
  const angle = Math.atan2(points[0].y - center.y, points[0].x - center.x);
  const cardinalityPosition = { x: 0, y: 0 };
  if (position === "start_left") {
    cardinalityPosition.x = Math.sin(angle + Math.PI) * d + (points[0].x + center.x) / 2;
    cardinalityPosition.y = -Math.cos(angle + Math.PI) * d + (points[0].y + center.y) / 2;
  } else if (position === "end_right") {
    cardinalityPosition.x = Math.sin(angle - Math.PI) * d + (points[0].x + center.x) / 2 - 5;
    cardinalityPosition.y = -Math.cos(angle - Math.PI) * d + (points[0].y + center.y) / 2 - 5;
  } else if (position === "end_left") {
    cardinalityPosition.x = Math.sin(angle) * d + (points[0].x + center.x) / 2 - 5;
    cardinalityPosition.y = -Math.cos(angle) * d + (points[0].y + center.y) / 2 - 5;
  } else {
    cardinalityPosition.x = Math.sin(angle) * d + (points[0].x + center.x) / 2;
    cardinalityPosition.y = -Math.cos(angle) * d + (points[0].y + center.y) / 2;
  }
  return cardinalityPosition;
}
__name(calcTerminalLabelPosition, "calcTerminalLabelPosition");
function getStylesFromArray(arr) {
  let style = "";
  let labelStyle = "";
  for (const element of arr) {
    if (element !== undefined) {
      if (element.startsWith("color:") || element.startsWith("text-align:")) {
        labelStyle = labelStyle + element + ";";
      } else {
        style = style + element + ";";
      }
    }
  }
  return { style, labelStyle };
}
__name(getStylesFromArray, "getStylesFromArray");
var cnt = 0;
var generateId = /* @__PURE__ */ __name(() => {
  cnt++;
  return "id-" + Math.random().toString(36).substr(2, 12) + "-" + cnt;
}, "generateId");
function makeRandomHex(length) {
  let result2 = "";
  const characters = "0123456789abcdef";
  const charactersLength = characters.length;
  for (let i = 0;i < length; i++) {
    result2 += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result2;
}
__name(makeRandomHex, "makeRandomHex");
var random2 = /* @__PURE__ */ __name((options) => {
  return makeRandomHex(options.length);
}, "random");
var getTextObj = /* @__PURE__ */ __name(function() {
  return {
    x: 0,
    y: 0,
    fill: undefined,
    anchor: "start",
    style: "#666",
    width: 100,
    height: 100,
    textMargin: 0,
    rx: 0,
    ry: 0,
    valign: undefined,
    text: ""
  };
}, "getTextObj");
var drawSimpleText = /* @__PURE__ */ __name(function(elem, textData) {
  const nText = textData.text.replace(common_default.lineBreakRegex, " ");
  const [, _fontSizePx] = parseFontSize(textData.fontSize);
  const textElem = elem.append("text");
  textElem.attr("x", textData.x);
  textElem.attr("y", textData.y);
  textElem.style("text-anchor", textData.anchor);
  textElem.style("font-family", textData.fontFamily);
  textElem.style("font-size", _fontSizePx);
  textElem.style("font-weight", textData.fontWeight);
  textElem.attr("fill", textData.fill);
  if (textData.class !== undefined) {
    textElem.attr("class", textData.class);
  }
  const span = textElem.append("tspan");
  span.attr("x", textData.x + textData.textMargin * 2);
  span.attr("fill", textData.fill);
  span.text(nText);
  return textElem;
}, "drawSimpleText");
var wrapLabel = memoize((label, maxWidth, config) => {
  if (!label) {
    return label;
  }
  config = Object.assign({ fontSize: 12, fontWeight: 400, fontFamily: "Arial", joinWith: "<br/>" }, config);
  if (common_default.lineBreakRegex.test(label)) {
    return label;
  }
  const words2 = label.split(" ").filter(Boolean);
  const completedLines = [];
  let nextLine = "";
  words2.forEach((word, index) => {
    const wordLength = calculateTextWidth(`${word} `, config);
    const nextLineLength = calculateTextWidth(nextLine, config);
    if (wordLength > maxWidth) {
      const { hyphenatedStrings, remainingWord } = breakString(word, maxWidth, "-", config);
      completedLines.push(nextLine, ...hyphenatedStrings);
      nextLine = remainingWord;
    } else if (nextLineLength + wordLength >= maxWidth) {
      completedLines.push(nextLine);
      nextLine = word;
    } else {
      nextLine = [nextLine, word].filter(Boolean).join(" ");
    }
    const currentWord = index + 1;
    const isLastWord = currentWord === words2.length;
    if (isLastWord) {
      completedLines.push(nextLine);
    }
  });
  return completedLines.filter((line) => line !== "").join(config.joinWith);
}, (label, maxWidth, config) => `${label}${maxWidth}${config.fontSize}${config.fontWeight}${config.fontFamily}${config.joinWith}`);
var breakString = memoize((word, maxWidth, hyphenCharacter = "-", config) => {
  config = Object.assign({ fontSize: 12, fontWeight: 400, fontFamily: "Arial", margin: 0 }, config);
  const characters = [...word];
  const lines = [];
  let currentLine = "";
  characters.forEach((character, index) => {
    const nextLine = `${currentLine}${character}`;
    const lineWidth = calculateTextWidth(nextLine, config);
    if (lineWidth >= maxWidth) {
      const currentCharacter = index + 1;
      const isLastLine = characters.length === currentCharacter;
      const hyphenatedNextLine = `${nextLine}${hyphenCharacter}`;
      lines.push(isLastLine ? nextLine : hyphenatedNextLine);
      currentLine = "";
    } else {
      currentLine = nextLine;
    }
  });
  return { hyphenatedStrings: lines, remainingWord: currentLine };
}, (word, maxWidth, hyphenCharacter = "-", config) => `${word}${maxWidth}${hyphenCharacter}${config.fontSize}${config.fontWeight}${config.fontFamily}`);
function calculateTextHeight(text, config) {
  return calculateTextDimensions(text, config).height;
}
__name(calculateTextHeight, "calculateTextHeight");
function calculateTextWidth(text, config) {
  return calculateTextDimensions(text, config).width;
}
__name(calculateTextWidth, "calculateTextWidth");
var calculateTextDimensions = memoize((text, config) => {
  const { fontSize = 12, fontFamily = "Arial", fontWeight = 400 } = config;
  if (!text) {
    return { width: 0, height: 0 };
  }
  const [, _fontSizePx] = parseFontSize(fontSize);
  const fontFamilies = ["sans-serif", fontFamily];
  const lines = text.split(common_default.lineBreakRegex);
  const dims = [];
  const body = select_default("body");
  if (!body.remove) {
    return { width: 0, height: 0, lineHeight: 0 };
  }
  const g = body.append("svg");
  for (const fontFamily2 of fontFamilies) {
    let cHeight = 0;
    const dim = { width: 0, height: 0, lineHeight: 0 };
    for (const line of lines) {
      const textObj = getTextObj();
      textObj.text = line || ZERO_WIDTH_SPACE;
      const textElem = drawSimpleText(g, textObj).style("font-size", _fontSizePx).style("font-weight", fontWeight).style("font-family", fontFamily2);
      const bBox = (textElem._groups || textElem)[0][0].getBBox();
      if (bBox.width === 0 && bBox.height === 0) {
        throw new Error("svg element not in render tree");
      }
      dim.width = Math.round(Math.max(dim.width, bBox.width));
      cHeight = Math.round(bBox.height);
      dim.height += cHeight;
      dim.lineHeight = Math.round(Math.max(dim.lineHeight, cHeight));
    }
    dims.push(dim);
  }
  g.remove();
  const index = isNaN(dims[1].height) || isNaN(dims[1].width) || isNaN(dims[1].lineHeight) || dims[0].height > dims[1].height && dims[0].width > dims[1].width && dims[0].lineHeight > dims[1].lineHeight ? 0 : 1;
  return dims[index];
}, (text, config) => `${text}${config.fontSize}${config.fontWeight}${config.fontFamily}`);
var InitIDGenerator = class {
  constructor(deterministic = false, seed) {
    this.count = 0;
    this.count = seed ? seed.length : 0;
    this.next = deterministic ? () => this.count++ : () => Date.now();
  }
  static {
    __name(this, "InitIDGenerator");
  }
};
var decoder;
var entityDecode = /* @__PURE__ */ __name(function(html) {
  decoder = decoder || document.createElement("div");
  html = escape(html).replace(/%26/g, "&").replace(/%23/g, "#").replace(/%3B/g, ";");
  decoder.innerHTML = html;
  return unescape(decoder.textContent);
}, "entityDecode");
function isDetailedError(error) {
  return "str" in error;
}
__name(isDetailedError, "isDetailedError");
var insertTitle = /* @__PURE__ */ __name((parent, cssClass, titleTopMargin, title) => {
  if (!title) {
    return;
  }
  const bounds = parent.node()?.getBBox();
  if (!bounds) {
    return;
  }
  parent.append("text").text(title).attr("text-anchor", "middle").attr("x", bounds.x + bounds.width / 2).attr("y", -titleTopMargin).attr("class", cssClass);
}, "insertTitle");
var parseFontSize = /* @__PURE__ */ __name((fontSize) => {
  if (typeof fontSize === "number") {
    return [fontSize, fontSize + "px"];
  }
  const fontSizeNumber = parseInt(fontSize ?? "", 10);
  if (Number.isNaN(fontSizeNumber)) {
    return [undefined, undefined];
  } else if (fontSize === String(fontSizeNumber)) {
    return [fontSizeNumber, fontSize + "px"];
  } else {
    return [fontSizeNumber, fontSize];
  }
}, "parseFontSize");
function cleanAndMerge(defaultData, data) {
  return merge({}, defaultData, data);
}
__name(cleanAndMerge, "cleanAndMerge");
var utils_default = {
  assignWithDepth: assignWithDepth_default,
  wrapLabel,
  calculateTextHeight,
  calculateTextWidth,
  calculateTextDimensions,
  cleanAndMerge,
  detectInit,
  detectDirective,
  isSubstringInArray,
  interpolateToCurve,
  calcLabelPosition,
  calcCardinalityPosition,
  calcTerminalLabelPosition,
  formatUrl,
  getStylesFromArray,
  generateId,
  random: random2,
  runFunc,
  entityDecode,
  insertTitle,
  isLabelCoordinateInPath,
  parseFontSize,
  InitIDGenerator
};
var encodeEntities = /* @__PURE__ */ __name(function(text) {
  let txt = text;
  txt = txt.replace(/style.*:\S*#.*;/g, function(s) {
    return s.substring(0, s.length - 1);
  });
  txt = txt.replace(/classDef.*:\S*#.*;/g, function(s) {
    return s.substring(0, s.length - 1);
  });
  txt = txt.replace(/#\w+;/g, function(s) {
    const innerTxt = s.substring(1, s.length - 1);
    const isInt = /^\+?\d+$/.test(innerTxt);
    if (isInt) {
      return "ﬂ°°" + innerTxt + "¶ß";
    } else {
      return "ﬂ°" + innerTxt + "¶ß";
    }
  });
  return txt;
}, "encodeEntities");
var decodeEntities = /* @__PURE__ */ __name(function(text) {
  return text.replace(/ﬂ°°/g, "&#").replace(/ﬂ°/g, "&").replace(/¶ß/g, ";");
}, "decodeEntities");
var getEdgeId = /* @__PURE__ */ __name((from, to, {
  counter = 0,
  prefix,
  suffix
}, id) => {
  if (id) {
    return id;
  }
  return `${prefix ? `${prefix}_` : ""}${from}_${to}_${counter}${suffix ? `_${suffix}` : ""}`;
}, "getEdgeId");
function handleUndefinedAttr(attrValue) {
  return attrValue ?? null;
}
__name(handleUndefinedAttr, "handleUndefinedAttr");
function isLabelCoordinateInPath(point, dAttr) {
  const roundedX = Math.round(point.x);
  const roundedY = Math.round(point.y);
  const sanitizedD = dAttr.replace(/(\d+\.\d+)/g, (match) => Math.round(parseFloat(match)).toString());
  return sanitizedD.includes(roundedX.toString()) || sanitizedD.includes(roundedY.toString());
}
__name(isLabelCoordinateInPath, "isLabelCoordinateInPath");

export { clone, isEmpty, ZERO_WIDTH_SPACE, removeDirectives, interpolateToCurve, getStylesFromArray, generateId, random2 as random, wrapLabel, calculateTextHeight, calculateTextWidth, calculateTextDimensions, isDetailedError, parseFontSize, cleanAndMerge, utils_default, encodeEntities, decodeEntities, getEdgeId, handleUndefinedAttr };

//# debugId=9D3495BC36AA4E8164756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9wcmVkaWNhdGUvaXNQcmltaXRpdmUubWpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L19pbnRlcm5hbC9nZXRUYWcubWpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L19pbnRlcm5hbC90YWdzLm1qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2NvbXBhdC9wcmVkaWNhdGUvaXNBcnJheS5tanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9wcmVkaWNhdGUvaXNUeXBlZEFycmF5Lm1qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2NvbXBhdC9wcmVkaWNhdGUvaXNUeXBlZEFycmF5Lm1qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2NvbXBhdC9vYmplY3QvY2xvbmUubWpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L2Z1bmN0aW9uL21lbW9pemUubWpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvZnVuY3Rpb24vbm9vcC5tanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9vYmplY3QvY2xvbmUubWpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L19pbnRlcm5hbC9nZXRTeW1ib2xzLm1qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L19pbnRlcm5hbC9nbG9iYWxUaGlzLm1qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L3ByZWRpY2F0ZS9pc0J1ZmZlci5tanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9faW50ZXJuYWwvaXNVbnNhZmVQcm9wZXJ0eS5tanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9jb21wYXQvcHJlZGljYXRlL2lzUGxhaW5PYmplY3QubWpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3Qvb2JqZWN0L2Nsb25lRGVlcFdpdGgubWpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L29iamVjdC9jbG9uZURlZXBXaXRoLm1qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2NvbXBhdC9vYmplY3QvY2xvbmVEZWVwLm1qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2NvbXBhdC9wcmVkaWNhdGUvaXNBcmd1bWVudHMubWpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L3ByZWRpY2F0ZS9pc09iamVjdExpa2UubWpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvcHJlZGljYXRlL2lzTGVuZ3RoLm1qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2NvbXBhdC9wcmVkaWNhdGUvaXNBcnJheUxpa2UubWpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L3ByZWRpY2F0ZS9pc0FycmF5TGlrZU9iamVjdC5tanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9jb21wYXQvb2JqZWN0L21lcmdlV2l0aC5tanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2VzLXRvb2xraXQvZGlzdC9jb21wYXQvb2JqZWN0L21lcmdlLm1qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZXMtdG9vbGtpdC9kaXN0L2NvbXBhdC9faW50ZXJuYWwvaXNQcm90b3R5cGUubWpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9lcy10b29sa2l0L2Rpc3QvY29tcGF0L3ByZWRpY2F0ZS9pc0VtcHR5Lm1qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbWVybWFpZC9kaXN0L2NodW5rcy9tZXJtYWlkLmNvcmUvY2h1bmstNVpRWUhYS1UubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWwogICAgIi8vI3JlZ2lvbiBzcmMvcHJlZGljYXRlL2lzUHJpbWl0aXZlLnRzXG4vKipcbiogQ2hlY2tzIHdoZXRoZXIgYSB2YWx1ZSBpcyBhIEphdmFTY3JpcHQgcHJpbWl0aXZlLlxuKiBKYXZhU2NyaXB0IHByaW1pdGl2ZXMgaW5jbHVkZSBudWxsLCB1bmRlZmluZWQsIHN0cmluZ3MsIG51bWJlcnMsIGJvb2xlYW5zLCBzeW1ib2xzLCBhbmQgYmlnaW50cy5cbipcbiogQHBhcmFtIHt1bmtub3dufSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4qIEByZXR1cm5zIHt2YWx1ZSBpc1xuKiAgICAgbnVsbFxuKiAgIHwgdW5kZWZpbmVkXG4qICAgfCBzdHJpbmdcbiogICB8IG51bWJlclxuKiAgIHwgYm9vbGVhblxuKiAgIHwgc3ltYm9sXG4qICAgfCBiaWdpbnR9IFJldHVybnMgdHJ1ZSBpZiBgdmFsdWVgIGlzIGEgcHJpbWl0aXZlLCBmYWxzZSBvdGhlcndpc2UuXG4qXG4qIEBleGFtcGxlXG4qIGlzUHJpbWl0aXZlKG51bGwpOyAvLyB0cnVlXG4qIGlzUHJpbWl0aXZlKHVuZGVmaW5lZCk7IC8vIHRydWVcbiogaXNQcmltaXRpdmUoJzEyMycpOyAvLyB0cnVlXG4qIGlzUHJpbWl0aXZlKGZhbHNlKTsgLy8gdHJ1ZVxuKiBpc1ByaW1pdGl2ZSh0cnVlKTsgLy8gdHJ1ZVxuKiBpc1ByaW1pdGl2ZShTeW1ib2woJ2EnKSk7IC8vIHRydWVcbiogaXNQcmltaXRpdmUoMTIzbik7IC8vIHRydWVcbiogaXNQcmltaXRpdmUoe30pOyAvLyBmYWxzZVxuKiBpc1ByaW1pdGl2ZShuZXcgRGF0ZSgpKTsgLy8gZmFsc2VcbiogaXNQcmltaXRpdmUobmV3IE1hcCgpKTsgLy8gZmFsc2VcbiogaXNQcmltaXRpdmUobmV3IFNldCgpKTsgLy8gZmFsc2VcbiogaXNQcmltaXRpdmUoWzEsIDIsIDNdKTsgLy8gZmFsc2VcbiovXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZSh2YWx1ZSkge1xuXHRyZXR1cm4gdmFsdWUgPT0gbnVsbCB8fCB0eXBlb2YgdmFsdWUgIT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCI7XG59XG4vLyNlbmRyZWdpb25cbmV4cG9ydCB7IGlzUHJpbWl0aXZlIH07XG4iLAogICAgIi8vI3JlZ2lvbiBzcmMvY29tcGF0L19pbnRlcm5hbC9nZXRUYWcudHNcbi8qKlxuKiBHZXRzIHRoZSBgdG9TdHJpbmdUYWdgIG9mIGB2YWx1ZWAuXG4qXG4qIEBwcml2YXRlXG4qIEBwYXJhbSB7VH0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsYCByZXN1bHQuXG4qL1xuZnVuY3Rpb24gZ2V0VGFnKHZhbHVlKSB7XG5cdGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gdmFsdWUgPT09IHZvaWQgMCA/IFwiW29iamVjdCBVbmRlZmluZWRdXCIgOiBcIltvYmplY3QgTnVsbF1cIjtcblx0cmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG59XG4vLyNlbmRyZWdpb25cbmV4cG9ydCB7IGdldFRhZyB9O1xuIiwKICAgICIvLyNyZWdpb24gc3JjL2NvbXBhdC9faW50ZXJuYWwvdGFncy50c1xuY29uc3QgcmVnZXhwVGFnID0gXCJbb2JqZWN0IFJlZ0V4cF1cIjtcbmNvbnN0IHN0cmluZ1RhZyA9IFwiW29iamVjdCBTdHJpbmddXCI7XG5jb25zdCBudW1iZXJUYWcgPSBcIltvYmplY3QgTnVtYmVyXVwiO1xuY29uc3QgYm9vbGVhblRhZyA9IFwiW29iamVjdCBCb29sZWFuXVwiO1xuY29uc3QgYXJndW1lbnRzVGFnID0gXCJbb2JqZWN0IEFyZ3VtZW50c11cIjtcbmNvbnN0IHN5bWJvbFRhZyA9IFwiW29iamVjdCBTeW1ib2xdXCI7XG5jb25zdCBkYXRlVGFnID0gXCJbb2JqZWN0IERhdGVdXCI7XG5jb25zdCBtYXBUYWcgPSBcIltvYmplY3QgTWFwXVwiO1xuY29uc3Qgc2V0VGFnID0gXCJbb2JqZWN0IFNldF1cIjtcbmNvbnN0IGFycmF5VGFnID0gXCJbb2JqZWN0IEFycmF5XVwiO1xuY29uc3QgZnVuY3Rpb25UYWcgPSBcIltvYmplY3QgRnVuY3Rpb25dXCI7XG5jb25zdCBhcnJheUJ1ZmZlclRhZyA9IFwiW29iamVjdCBBcnJheUJ1ZmZlcl1cIjtcbmNvbnN0IG9iamVjdFRhZyA9IFwiW29iamVjdCBPYmplY3RdXCI7XG5jb25zdCBlcnJvclRhZyA9IFwiW29iamVjdCBFcnJvcl1cIjtcbmNvbnN0IGRhdGFWaWV3VGFnID0gXCJbb2JqZWN0IERhdGFWaWV3XVwiO1xuY29uc3QgdWludDhBcnJheVRhZyA9IFwiW29iamVjdCBVaW50OEFycmF5XVwiO1xuY29uc3QgdWludDhDbGFtcGVkQXJyYXlUYWcgPSBcIltvYmplY3QgVWludDhDbGFtcGVkQXJyYXldXCI7XG5jb25zdCB1aW50MTZBcnJheVRhZyA9IFwiW29iamVjdCBVaW50MTZBcnJheV1cIjtcbmNvbnN0IHVpbnQzMkFycmF5VGFnID0gXCJbb2JqZWN0IFVpbnQzMkFycmF5XVwiO1xuY29uc3QgYmlnVWludDY0QXJyYXlUYWcgPSBcIltvYmplY3QgQmlnVWludDY0QXJyYXldXCI7XG5jb25zdCBpbnQ4QXJyYXlUYWcgPSBcIltvYmplY3QgSW50OEFycmF5XVwiO1xuY29uc3QgaW50MTZBcnJheVRhZyA9IFwiW29iamVjdCBJbnQxNkFycmF5XVwiO1xuY29uc3QgaW50MzJBcnJheVRhZyA9IFwiW29iamVjdCBJbnQzMkFycmF5XVwiO1xuY29uc3QgYmlnSW50NjRBcnJheVRhZyA9IFwiW29iamVjdCBCaWdJbnQ2NEFycmF5XVwiO1xuY29uc3QgZmxvYXQzMkFycmF5VGFnID0gXCJbb2JqZWN0IEZsb2F0MzJBcnJheV1cIjtcbmNvbnN0IGZsb2F0NjRBcnJheVRhZyA9IFwiW29iamVjdCBGbG9hdDY0QXJyYXldXCI7XG4vLyNlbmRyZWdpb25cbmV4cG9ydCB7IGFyZ3VtZW50c1RhZywgYXJyYXlCdWZmZXJUYWcsIGFycmF5VGFnLCBiaWdJbnQ2NEFycmF5VGFnLCBiaWdVaW50NjRBcnJheVRhZywgYm9vbGVhblRhZywgZGF0YVZpZXdUYWcsIGRhdGVUYWcsIGVycm9yVGFnLCBmbG9hdDMyQXJyYXlUYWcsIGZsb2F0NjRBcnJheVRhZywgZnVuY3Rpb25UYWcsIGludDE2QXJyYXlUYWcsIGludDMyQXJyYXlUYWcsIGludDhBcnJheVRhZywgbWFwVGFnLCBudW1iZXJUYWcsIG9iamVjdFRhZywgcmVnZXhwVGFnLCBzZXRUYWcsIHN0cmluZ1RhZywgc3ltYm9sVGFnLCB1aW50MTZBcnJheVRhZywgdWludDMyQXJyYXlUYWcsIHVpbnQ4QXJyYXlUYWcsIHVpbnQ4Q2xhbXBlZEFycmF5VGFnIH07XG4iLAogICAgIi8vI3JlZ2lvbiBzcmMvY29tcGF0L3ByZWRpY2F0ZS9pc0FycmF5LnRzXG4vKipcbiogQ2hlY2tzIGlmIHRoZSBnaXZlbiB2YWx1ZSBpcyBhbiBhcnJheS5cbipcbiogVGhpcyBmdW5jdGlvbiB0ZXN0cyB3aGV0aGVyIHRoZSBwcm92aWRlZCB2YWx1ZSBpcyBhbiBhcnJheSBvciBub3QuXG4qIEl0IHJldHVybnMgYHRydWVgIGlmIHRoZSB2YWx1ZSBpcyBhbiBhcnJheSwgYW5kIGBmYWxzZWAgb3RoZXJ3aXNlLlxuKlxuKiBUaGlzIGZ1bmN0aW9uIGNhbiBhbHNvIHNlcnZlIGFzIGEgdHlwZSBwcmVkaWNhdGUgaW4gVHlwZVNjcmlwdCwgbmFycm93aW5nIHRoZSB0eXBlIG9mIHRoZSBhcmd1bWVudCB0byBhbiBhcnJheS5cbipcbiogQHBhcmFtIHthbnl9IHZhbHVlIC0gVGhlIHZhbHVlIHRvIHRlc3QgaWYgaXQgaXMgYW4gYXJyYXkuXG4qIEByZXR1cm5zIHt2YWx1ZSBpcyBhbnlbXX0gYHRydWVgIGlmIHRoZSB2YWx1ZSBpcyBhbiBhcnJheSwgYGZhbHNlYCBvdGhlcndpc2UuXG4qXG4qIEBleGFtcGxlXG4qIGNvbnN0IHZhbHVlMSA9IFsxLCAyLCAzXTtcbiogY29uc3QgdmFsdWUyID0gJ2FiYyc7XG4qIGNvbnN0IHZhbHVlMyA9ICgpID0+IHt9O1xuKlxuKiBjb25zb2xlLmxvZyhpc0FycmF5KHZhbHVlMSkpOyAvLyB0cnVlXG4qIGNvbnNvbGUubG9nKGlzQXJyYXkodmFsdWUyKSk7IC8vIGZhbHNlXG4qIGNvbnNvbGUubG9nKGlzQXJyYXkodmFsdWUzKSk7IC8vIGZhbHNlXG4qL1xuZnVuY3Rpb24gaXNBcnJheSh2YWx1ZSkge1xuXHRyZXR1cm4gQXJyYXkuaXNBcnJheSh2YWx1ZSk7XG59XG4vLyNlbmRyZWdpb25cbmV4cG9ydCB7IGlzQXJyYXkgfTtcbiIsCiAgICAiLy8jcmVnaW9uIHNyYy9wcmVkaWNhdGUvaXNUeXBlZEFycmF5LnRzXG4vKipcbiogQ2hlY2tzIGlmIGEgdmFsdWUgaXMgYSBUeXBlZEFycmF5LlxuKiBAcGFyYW0ge3Vua25vd259IHggVGhlIHZhbHVlIHRvIGNoZWNrLlxuKiBAcmV0dXJucyB7eCBpc1xuKiAgICAgVWludDhBcnJheVxuKiAgIHwgVWludDhDbGFtcGVkQXJyYXlcbiogICB8IFVpbnQxNkFycmF5XG4qICAgfCBVaW50MzJBcnJheVxuKiAgIHwgQmlnVWludDY0QXJyYXlcbiogICB8IEludDhBcnJheVxuKiAgIHwgSW50MTZBcnJheVxuKiAgIHwgSW50MzJBcnJheVxuKiAgIHwgQmlnSW50NjRBcnJheVxuKiAgIHwgRmxvYXQzMkFycmF5XG4qICAgfCBGbG9hdDY0QXJyYXl9IFJldHVybnMgdHJ1ZSBpZiBgeGAgaXMgYSBUeXBlZEFycmF5LCBmYWxzZSBvdGhlcndpc2UuXG4qXG4qIEBleGFtcGxlXG4qIGNvbnN0IGFyciA9IG5ldyBVaW50OEFycmF5KFsxLCAyLCAzXSk7XG4qIGlzVHlwZWRBcnJheShhcnIpOyAvLyB0cnVlXG4qXG4qIGNvbnN0IHJlZ3VsYXJBcnJheSA9IFsxLCAyLCAzXTtcbiogaXNUeXBlZEFycmF5KHJlZ3VsYXJBcnJheSk7IC8vIGZhbHNlXG4qXG4qIGNvbnN0IGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcigxNik7XG4qIGlzVHlwZWRBcnJheShidWZmZXIpOyAvLyBmYWxzZVxuKi9cbmZ1bmN0aW9uIGlzVHlwZWRBcnJheSh4KSB7XG5cdHJldHVybiBBcnJheUJ1ZmZlci5pc1ZpZXcoeCkgJiYgISh4IGluc3RhbmNlb2YgRGF0YVZpZXcpO1xufVxuLy8jZW5kcmVnaW9uXG5leHBvcnQgeyBpc1R5cGVkQXJyYXkgfTtcbiIsCiAgICAiaW1wb3J0IHsgaXNUeXBlZEFycmF5IGFzIGlzVHlwZWRBcnJheSQxIH0gZnJvbSBcIi4uLy4uL3ByZWRpY2F0ZS9pc1R5cGVkQXJyYXkubWpzXCI7XG4vLyNyZWdpb24gc3JjL2NvbXBhdC9wcmVkaWNhdGUvaXNUeXBlZEFycmF5LnRzXG4vKipcbiogQ2hlY2tzIGlmIGEgdmFsdWUgaXMgYSBUeXBlZEFycmF5LlxuKiBAcGFyYW0ge2FueX0geCBUaGUgdmFsdWUgdG8gY2hlY2suXG4qIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIHRydWUgaWYgYHhgIGlzIGEgVHlwZWRBcnJheSwgZmFsc2Ugb3RoZXJ3aXNlLlxuKlxuKiBAZXhhbXBsZVxuKiBjb25zdCBhcnIgPSBuZXcgVWludDhBcnJheShbMSwgMiwgM10pO1xuKiBpc1R5cGVkQXJyYXkoYXJyKTsgLy8gdHJ1ZVxuKlxuKiBjb25zdCByZWd1bGFyQXJyYXkgPSBbMSwgMiwgM107XG4qIGlzVHlwZWRBcnJheShyZWd1bGFyQXJyYXkpOyAvLyBmYWxzZVxuKlxuKiBjb25zdCBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoMTYpO1xuKiBpc1R5cGVkQXJyYXkoYnVmZmVyKTsgLy8gZmFsc2VcbiovXG5mdW5jdGlvbiBpc1R5cGVkQXJyYXkoeCkge1xuXHRyZXR1cm4gaXNUeXBlZEFycmF5JDEoeCk7XG59XG4vLyNlbmRyZWdpb25cbmV4cG9ydCB7IGlzVHlwZWRBcnJheSB9O1xuIiwKICAgICJpbXBvcnQgeyBpc1ByaW1pdGl2ZSB9IGZyb20gXCIuLi8uLi9wcmVkaWNhdGUvaXNQcmltaXRpdmUubWpzXCI7XG5pbXBvcnQgeyBnZXRUYWcgfSBmcm9tIFwiLi4vX2ludGVybmFsL2dldFRhZy5tanNcIjtcbmltcG9ydCB7IGFyZ3VtZW50c1RhZywgYXJyYXlCdWZmZXJUYWcsIGFycmF5VGFnLCBib29sZWFuVGFnLCBkYXRhVmlld1RhZywgZGF0ZVRhZywgZmxvYXQzMkFycmF5VGFnLCBmbG9hdDY0QXJyYXlUYWcsIGludDE2QXJyYXlUYWcsIGludDMyQXJyYXlUYWcsIGludDhBcnJheVRhZywgbWFwVGFnLCBudW1iZXJUYWcsIG9iamVjdFRhZywgcmVnZXhwVGFnLCBzZXRUYWcsIHN0cmluZ1RhZywgc3ltYm9sVGFnLCB1aW50MTZBcnJheVRhZywgdWludDMyQXJyYXlUYWcsIHVpbnQ4QXJyYXlUYWcsIHVpbnQ4Q2xhbXBlZEFycmF5VGFnIH0gZnJvbSBcIi4uL19pbnRlcm5hbC90YWdzLm1qc1wiO1xuaW1wb3J0IHsgaXNBcnJheSB9IGZyb20gXCIuLi9wcmVkaWNhdGUvaXNBcnJheS5tanNcIjtcbmltcG9ydCB7IGlzVHlwZWRBcnJheSB9IGZyb20gXCIuLi9wcmVkaWNhdGUvaXNUeXBlZEFycmF5Lm1qc1wiO1xuLy8jcmVnaW9uIHNyYy9jb21wYXQvb2JqZWN0L2Nsb25lLnRzXG4vKipcbiogQ3JlYXRlcyBhIHNoYWxsb3cgY2xvbmUgb2YgdGhlIGdpdmVuIG9iamVjdC5cbipcbiogQHRlbXBsYXRlIFQgLSBUaGUgdHlwZSBvZiB0aGUgb2JqZWN0LlxuKiBAcGFyYW0ge1R9IG9iaiAtIFRoZSBvYmplY3QgdG8gY2xvbmUuXG4qIEByZXR1cm5zIHtUfSAtIEEgc2hhbGxvdyBjbG9uZSBvZiB0aGUgZ2l2ZW4gb2JqZWN0LlxuKlxuKiBAZXhhbXBsZVxuKiAvLyBDbG9uZSBhIHByaW1pdGl2ZSBvYmpzXG4qIGNvbnN0IG51bSA9IDI5O1xuKiBjb25zdCBjbG9uZWROdW0gPSBjbG9uZShudW0pO1xuKiBjb25zb2xlLmxvZyhjbG9uZWROdW0pOyAvLyAyOVxuKiBjb25zb2xlLmxvZyhjbG9uZWROdW0gPT09IG51bSk7IC8vIHRydWVcbipcbiogQGV4YW1wbGVcbiogLy8gQ2xvbmUgYW4gYXJyYXlcbiogY29uc3QgYXJyID0gWzEsIDIsIDNdO1xuKiBjb25zdCBjbG9uZWRBcnIgPSBjbG9uZShhcnIpO1xuKiBjb25zb2xlLmxvZyhjbG9uZWRBcnIpOyAvLyBbMSwgMiwgM11cbiogY29uc29sZS5sb2coY2xvbmVkQXJyID09PSBhcnIpOyAvLyBmYWxzZVxuKlxuKiBAZXhhbXBsZVxuKiAvLyBDbG9uZSBhbiBvYmplY3RcbiogY29uc3Qgb2JqID0geyBhOiAxLCBiOiAnZXMtdG9vbGtpdCcsIGM6IFsxLCAyLCAzXSB9O1xuKiBjb25zdCBjbG9uZWRPYmogPSBjbG9uZShvYmopO1xuKiBjb25zb2xlLmxvZyhjbG9uZWRPYmopOyAvLyB7IGE6IDEsIGI6ICdlcy10b29sa2l0JywgYzogWzEsIDIsIDNdIH1cbiogY29uc29sZS5sb2coY2xvbmVkT2JqID09PSBvYmopOyAvLyBmYWxzZVxuKi9cbmZ1bmN0aW9uIGNsb25lKG9iaikge1xuXHRpZiAoaXNQcmltaXRpdmUob2JqKSkgcmV0dXJuIG9iajtcblx0Y29uc3QgdGFnID0gZ2V0VGFnKG9iaik7XG5cdGlmICghaXNDbG9uZWFibGVPYmplY3Qob2JqKSkgcmV0dXJuIHt9O1xuXHRpZiAoaXNBcnJheShvYmopKSB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gQXJyYXkuZnJvbShvYmopO1xuXHRcdGlmIChvYmoubGVuZ3RoID4gMCAmJiB0eXBlb2Ygb2JqWzBdID09PSBcInN0cmluZ1wiICYmIE9iamVjdC5oYXNPd24ob2JqLCBcImluZGV4XCIpKSB7XG5cdFx0XHRyZXN1bHQuaW5kZXggPSBvYmouaW5kZXg7XG5cdFx0XHRyZXN1bHQuaW5wdXQgPSBvYmouaW5wdXQ7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblx0aWYgKGlzVHlwZWRBcnJheShvYmopKSB7XG5cdFx0Y29uc3QgdHlwZWRBcnJheSA9IG9iajtcblx0XHRjb25zdCBDdG9yID0gdHlwZWRBcnJheS5jb25zdHJ1Y3Rvcjtcblx0XHRyZXR1cm4gbmV3IEN0b3IodHlwZWRBcnJheS5idWZmZXIsIHR5cGVkQXJyYXkuYnl0ZU9mZnNldCwgdHlwZWRBcnJheS5sZW5ndGgpO1xuXHR9XG5cdGlmICh0YWcgPT09IFwiW29iamVjdCBBcnJheUJ1ZmZlcl1cIikgcmV0dXJuIG5ldyBBcnJheUJ1ZmZlcihvYmouYnl0ZUxlbmd0aCk7XG5cdGlmICh0YWcgPT09IFwiW29iamVjdCBEYXRhVmlld11cIikge1xuXHRcdGNvbnN0IGRhdGFWaWV3ID0gb2JqO1xuXHRcdGNvbnN0IGJ1ZmZlciA9IGRhdGFWaWV3LmJ1ZmZlcjtcblx0XHRjb25zdCBieXRlT2Zmc2V0ID0gZGF0YVZpZXcuYnl0ZU9mZnNldDtcblx0XHRjb25zdCBieXRlTGVuZ3RoID0gZGF0YVZpZXcuYnl0ZUxlbmd0aDtcblx0XHRjb25zdCBjbG9uZWRCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoYnl0ZUxlbmd0aCk7XG5cdFx0Y29uc3Qgc3JjVmlldyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlciwgYnl0ZU9mZnNldCwgYnl0ZUxlbmd0aCk7XG5cdFx0bmV3IFVpbnQ4QXJyYXkoY2xvbmVkQnVmZmVyKS5zZXQoc3JjVmlldyk7XG5cdFx0cmV0dXJuIG5ldyBEYXRhVmlldyhjbG9uZWRCdWZmZXIpO1xuXHR9XG5cdGlmICh0YWcgPT09IFwiW29iamVjdCBCb29sZWFuXVwiIHx8IHRhZyA9PT0gXCJbb2JqZWN0IE51bWJlcl1cIiB8fCB0YWcgPT09IFwiW29iamVjdCBTdHJpbmddXCIpIHtcblx0XHRjb25zdCBDdG9yID0gb2JqLmNvbnN0cnVjdG9yO1xuXHRcdGNvbnN0IGNsb25lID0gbmV3IEN0b3Iob2JqLnZhbHVlT2YoKSk7XG5cdFx0aWYgKHRhZyA9PT0gXCJbb2JqZWN0IFN0cmluZ11cIikgY2xvbmVTdHJpbmdPYmplY3RQcm9wZXJ0aWVzKGNsb25lLCBvYmopO1xuXHRcdGVsc2UgY29weU93blByb3BlcnRpZXMoY2xvbmUsIG9iaik7XG5cdFx0cmV0dXJuIGNsb25lO1xuXHR9XG5cdGlmICh0YWcgPT09IFwiW29iamVjdCBEYXRlXVwiKSByZXR1cm4gbmV3IERhdGUoTnVtYmVyKG9iaikpO1xuXHRpZiAodGFnID09PSBcIltvYmplY3QgUmVnRXhwXVwiKSB7XG5cdFx0Y29uc3QgcmVnRXhwID0gb2JqO1xuXHRcdGNvbnN0IGNsb25lID0gbmV3IFJlZ0V4cChyZWdFeHAuc291cmNlLCByZWdFeHAuZmxhZ3MpO1xuXHRcdGNsb25lLmxhc3RJbmRleCA9IHJlZ0V4cC5sYXN0SW5kZXg7XG5cdFx0cmV0dXJuIGNsb25lO1xuXHR9XG5cdGlmICh0YWcgPT09IFwiW29iamVjdCBTeW1ib2xdXCIpIHJldHVybiBPYmplY3QoU3ltYm9sLnByb3RvdHlwZS52YWx1ZU9mLmNhbGwob2JqKSk7XG5cdGlmICh0YWcgPT09IFwiW29iamVjdCBNYXBdXCIpIHtcblx0XHRjb25zdCBtYXAgPSBvYmo7XG5cdFx0Y29uc3QgcmVzdWx0ID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcblx0XHRtYXAuZm9yRWFjaCgob2JqLCBrZXkpID0+IHtcblx0XHRcdHJlc3VsdC5zZXQoa2V5LCBvYmopO1xuXHRcdH0pO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblx0aWYgKHRhZyA9PT0gXCJbb2JqZWN0IFNldF1cIikge1xuXHRcdGNvbnN0IHNldCA9IG9iajtcblx0XHRjb25zdCByZXN1bHQgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpO1xuXHRcdHNldC5mb3JFYWNoKChvYmopID0+IHtcblx0XHRcdHJlc3VsdC5hZGQob2JqKTtcblx0XHR9KTtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cdGlmICh0YWcgPT09IFwiW29iamVjdCBBcmd1bWVudHNdXCIpIHtcblx0XHRjb25zdCBhcmdzID0gb2JqO1xuXHRcdGNvbnN0IHJlc3VsdCA9IHt9O1xuXHRcdGNvcHlPd25Qcm9wZXJ0aWVzKHJlc3VsdCwgYXJncyk7XG5cdFx0cmVzdWx0Lmxlbmd0aCA9IGFyZ3MubGVuZ3RoO1xuXHRcdHJlc3VsdFtTeW1ib2wuaXRlcmF0b3JdID0gYXJnc1tTeW1ib2wuaXRlcmF0b3JdO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblx0Y29uc3QgcmVzdWx0ID0ge307XG5cdGNvcHlQcm90b3R5cGUocmVzdWx0LCBvYmopO1xuXHRjb3B5T3duUHJvcGVydGllcyhyZXN1bHQsIG9iaik7XG5cdGNvcHlTeW1ib2xQcm9wZXJ0aWVzKHJlc3VsdCwgb2JqKTtcblx0cmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIGlzQ2xvbmVhYmxlT2JqZWN0KG9iamVjdCkge1xuXHRzd2l0Y2ggKGdldFRhZyhvYmplY3QpKSB7XG5cdFx0Y2FzZSBhcmd1bWVudHNUYWc6XG5cdFx0Y2FzZSBhcnJheVRhZzpcblx0XHRjYXNlIGFycmF5QnVmZmVyVGFnOlxuXHRcdGNhc2UgZGF0YVZpZXdUYWc6XG5cdFx0Y2FzZSBib29sZWFuVGFnOlxuXHRcdGNhc2UgZGF0ZVRhZzpcblx0XHRjYXNlIGZsb2F0MzJBcnJheVRhZzpcblx0XHRjYXNlIGZsb2F0NjRBcnJheVRhZzpcblx0XHRjYXNlIGludDhBcnJheVRhZzpcblx0XHRjYXNlIGludDE2QXJyYXlUYWc6XG5cdFx0Y2FzZSBpbnQzMkFycmF5VGFnOlxuXHRcdGNhc2UgbWFwVGFnOlxuXHRcdGNhc2UgbnVtYmVyVGFnOlxuXHRcdGNhc2Ugb2JqZWN0VGFnOlxuXHRcdGNhc2UgcmVnZXhwVGFnOlxuXHRcdGNhc2Ugc2V0VGFnOlxuXHRcdGNhc2Ugc3RyaW5nVGFnOlxuXHRcdGNhc2Ugc3ltYm9sVGFnOlxuXHRcdGNhc2UgdWludDhBcnJheVRhZzpcblx0XHRjYXNlIHVpbnQ4Q2xhbXBlZEFycmF5VGFnOlxuXHRcdGNhc2UgdWludDE2QXJyYXlUYWc6XG5cdFx0Y2FzZSB1aW50MzJBcnJheVRhZzogcmV0dXJuIHRydWU7XG5cdFx0ZGVmYXVsdDogcmV0dXJuIGZhbHNlO1xuXHR9XG59XG5mdW5jdGlvbiBjb3B5T3duUHJvcGVydGllcyh0YXJnZXQsIHNvdXJjZSkge1xuXHRmb3IgKGNvbnN0IGtleSBpbiBzb3VyY2UpIGlmIChPYmplY3QuaGFzT3duKHNvdXJjZSwga2V5KSkgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTtcbn1cbmZ1bmN0aW9uIGNvcHlTeW1ib2xQcm9wZXJ0aWVzKHRhcmdldCwgc291cmNlKSB7XG5cdGNvbnN0IHN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHNvdXJjZSk7XG5cdGZvciAobGV0IGkgPSAwOyBpIDwgc3ltYm9scy5sZW5ndGg7IGkrKykge1xuXHRcdGNvbnN0IHN5bWJvbCA9IHN5bWJvbHNbaV07XG5cdFx0aWYgKE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChzb3VyY2UsIHN5bWJvbCkpIHRhcmdldFtzeW1ib2xdID0gc291cmNlW3N5bWJvbF07XG5cdH1cbn1cbmZ1bmN0aW9uIGNsb25lU3RyaW5nT2JqZWN0UHJvcGVydGllcyh0YXJnZXQsIHNvdXJjZSkge1xuXHRjb25zdCBzdHJpbmdMZW5ndGggPSBzb3VyY2UudmFsdWVPZigpLmxlbmd0aDtcblx0Zm9yIChjb25zdCBrZXkgaW4gc291cmNlKSBpZiAoT2JqZWN0Lmhhc093bihzb3VyY2UsIGtleSkgJiYgKE51bWJlci5pc05hTihOdW1iZXIoa2V5KSkgfHwgTnVtYmVyKGtleSkgPj0gc3RyaW5nTGVuZ3RoKSkgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTtcbn1cbmZ1bmN0aW9uIGNvcHlQcm90b3R5cGUodGFyZ2V0LCBzb3VyY2UpIHtcblx0Y29uc3QgcHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yoc291cmNlKTtcblx0aWYgKHByb3RvICE9PSBudWxsKSB7XG5cdFx0aWYgKHR5cGVvZiBzb3VyY2UuY29uc3RydWN0b3IgPT09IFwiZnVuY3Rpb25cIikgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRhcmdldCwgcHJvdG8pO1xuXHR9XG59XG4vLyNlbmRyZWdpb25cbmV4cG9ydCB7IGNsb25lIH07XG4iLAogICAgIi8vI3JlZ2lvbiBzcmMvY29tcGF0L2Z1bmN0aW9uL21lbW9pemUudHNcbi8qKlxuKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCBtZW1vaXplcyB0aGUgcmVzdWx0IG9mIGZ1bmMuIElmIHJlc29sdmVyIGlzIHByb3ZpZGVkIGl0IGRldGVybWluZXMgdGhlIGNhY2hlIGtleSBmb3Jcbiogc3RvcmluZyB0aGUgcmVzdWx0IGJhc2VkIG9uIHRoZSBhcmd1bWVudHMgcHJvdmlkZWQgdG8gdGhlIG1lbW9pemVkIGZ1bmN0aW9uLiBCeSBkZWZhdWx0LCB0aGUgZmlyc3QgYXJndW1lbnRcbiogcHJvdmlkZWQgdG8gdGhlIG1lbW9pemVkIGZ1bmN0aW9uIGlzIGNvZXJjZWQgdG8gYSBzdHJpbmcgYW5kIHVzZWQgYXMgdGhlIGNhY2hlIGtleS4gVGhlIGZ1bmMgaXMgaW52b2tlZCB3aXRoXG4qIHRoZSB0aGlzIGJpbmRpbmcgb2YgdGhlIG1lbW9pemVkIGZ1bmN0aW9uLlxuKlxuKiBAdGVtcGxhdGUgVCAtIFRoZSB0eXBlIG9mIHRoZSBvcmlnaW5hbCBmdW5jdGlvbiBiZWluZyBtZW1vaXplZFxuKiBAcGFyYW0ge1R9IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGhhdmUgaXRzIG91dHB1dCBtZW1vaXplZC5cbiogQHBhcmFtIHtGdW5jdGlvbn0gW3Jlc29sdmVyXSBUaGUgZnVuY3Rpb24gdG8gcmVzb2x2ZSB0aGUgY2FjaGUga2V5LlxuKiBAcmV0dXJuIHtNZW1vaXplZEZ1bmN0aW9uPFQ+fSBSZXR1cm5zIHRoZSBuZXcgbWVtb2l6aW5nIGZ1bmN0aW9uLlxuKi9cbmZ1bmN0aW9uIG1lbW9pemUoZnVuYywgcmVzb2x2ZXIpIHtcblx0aWYgKHR5cGVvZiBmdW5jICE9PSBcImZ1bmN0aW9uXCIgfHwgcmVzb2x2ZXIgIT0gbnVsbCAmJiB0eXBlb2YgcmVzb2x2ZXIgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkV4cGVjdGVkIGEgZnVuY3Rpb25cIik7XG5cdGNvbnN0IG1lbW9pemVkID0gZnVuY3Rpb24oLi4uYXJncykge1xuXHRcdGNvbnN0IGtleSA9IHJlc29sdmVyID8gcmVzb2x2ZXIuYXBwbHkodGhpcywgYXJncykgOiBhcmdzWzBdO1xuXHRcdGNvbnN0IGNhY2hlID0gbWVtb2l6ZWQuY2FjaGU7XG5cdFx0aWYgKGNhY2hlLmhhcyhrZXkpKSByZXR1cm4gY2FjaGUuZ2V0KGtleSk7XG5cdFx0Y29uc3QgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcblx0XHRtZW1vaXplZC5jYWNoZSA9IGNhY2hlLnNldChrZXksIHJlc3VsdCkgfHwgY2FjaGU7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fTtcblx0bWVtb2l6ZWQuY2FjaGUgPSBuZXcgKG1lbW9pemUuQ2FjaGUgfHwgTWFwKSgpO1xuXHRyZXR1cm4gbWVtb2l6ZWQ7XG59XG5tZW1vaXplLkNhY2hlID0gTWFwO1xuLy8jZW5kcmVnaW9uXG5leHBvcnQgeyBtZW1vaXplIH07XG4iLAogICAgIi8vI3JlZ2lvbiBzcmMvZnVuY3Rpb24vbm9vcC50c1xuLyoqXG4qIEEgbm8tb3BlcmF0aW9uIGZ1bmN0aW9uIHRoYXQgZG9lcyBub3RoaW5nLlxuKiBUaGlzIGNhbiBiZSB1c2VkIGFzIGEgcGxhY2Vob2xkZXIgb3IgZGVmYXVsdCBmdW5jdGlvbi5cbipcbiogQGV4YW1wbGVcbiogbm9vcCgpOyAvLyBEb2VzIG5vdGhpbmdcbipcbiogQHJldHVybnMge3ZvaWR9IFRoaXMgZnVuY3Rpb24gZG9lcyBub3QgcmV0dXJuIGFueXRoaW5nLlxuKi9cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuLy8jZW5kcmVnaW9uXG5leHBvcnQgeyBub29wIH07XG4iLAogICAgImltcG9ydCB7IGlzUHJpbWl0aXZlIH0gZnJvbSBcIi4uL3ByZWRpY2F0ZS9pc1ByaW1pdGl2ZS5tanNcIjtcbmltcG9ydCB7IGlzVHlwZWRBcnJheSB9IGZyb20gXCIuLi9wcmVkaWNhdGUvaXNUeXBlZEFycmF5Lm1qc1wiO1xuLy8jcmVnaW9uIHNyYy9vYmplY3QvY2xvbmUudHNcbi8qKlxuKiBDcmVhdGVzIGEgc2hhbGxvdyBjbG9uZSBvZiB0aGUgZ2l2ZW4gb2JqZWN0LlxuKlxuKiBAdGVtcGxhdGUgVCAtIFRoZSB0eXBlIG9mIHRoZSBvYmplY3QuXG4qIEBwYXJhbSB7VH0gb2JqIC0gVGhlIG9iamVjdCB0byBjbG9uZS5cbiogQHJldHVybnMge1R9IC0gQSBzaGFsbG93IGNsb25lIG9mIHRoZSBnaXZlbiBvYmplY3QuXG4qXG4qIEBleGFtcGxlXG4qIC8vIENsb25lIGEgcHJpbWl0aXZlIHZhbHVlc1xuKiBjb25zdCBudW0gPSAyOTtcbiogY29uc3QgY2xvbmVkTnVtID0gY2xvbmUobnVtKTtcbiogY29uc29sZS5sb2coY2xvbmVkTnVtKTsgLy8gMjlcbiogY29uc29sZS5sb2coY2xvbmVkTnVtID09PSBudW0pOyAvLyB0cnVlXG4qXG4qIEBleGFtcGxlXG4qIC8vIENsb25lIGFuIGFycmF5XG4qIGNvbnN0IGFyciA9IFsxLCAyLCAzXTtcbiogY29uc3QgY2xvbmVkQXJyID0gY2xvbmUoYXJyKTtcbiogY29uc29sZS5sb2coY2xvbmVkQXJyKTsgLy8gWzEsIDIsIDNdXG4qIGNvbnNvbGUubG9nKGNsb25lZEFyciA9PT0gYXJyKTsgLy8gZmFsc2VcbipcbiogQGV4YW1wbGVcbiogLy8gQ2xvbmUgYW4gb2JqZWN0XG4qIGNvbnN0IG9iaiA9IHsgYTogMSwgYjogJ2VzLXRvb2xraXQnLCBjOiBbMSwgMiwgM10gfTtcbiogY29uc3QgY2xvbmVkT2JqID0gY2xvbmUob2JqKTtcbiogY29uc29sZS5sb2coY2xvbmVkT2JqKTsgLy8geyBhOiAxLCBiOiAnZXMtdG9vbGtpdCcsIGM6IFsxLCAyLCAzXSB9XG4qIGNvbnNvbGUubG9nKGNsb25lZE9iaiA9PT0gb2JqKTsgLy8gZmFsc2VcbiovXG5mdW5jdGlvbiBjbG9uZShvYmopIHtcblx0aWYgKGlzUHJpbWl0aXZlKG9iaikpIHJldHVybiBvYmo7XG5cdGlmIChBcnJheS5pc0FycmF5KG9iaikgfHwgaXNUeXBlZEFycmF5KG9iaikgfHwgb2JqIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgfHwgdHlwZW9mIFNoYXJlZEFycmF5QnVmZmVyICE9PSBcInVuZGVmaW5lZFwiICYmIG9iaiBpbnN0YW5jZW9mIFNoYXJlZEFycmF5QnVmZmVyKSByZXR1cm4gb2JqLnNsaWNlKDApO1xuXHRjb25zdCBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKTtcblx0aWYgKHByb3RvdHlwZSA9PSBudWxsKSByZXR1cm4gT2JqZWN0LmFzc2lnbihPYmplY3QuY3JlYXRlKHByb3RvdHlwZSksIG9iaik7XG5cdGNvbnN0IENvbnN0cnVjdG9yID0gcHJvdG90eXBlLmNvbnN0cnVjdG9yO1xuXHRpZiAob2JqIGluc3RhbmNlb2YgRGF0ZSB8fCBvYmogaW5zdGFuY2VvZiBNYXAgfHwgb2JqIGluc3RhbmNlb2YgU2V0KSByZXR1cm4gbmV3IENvbnN0cnVjdG9yKG9iaik7XG5cdGlmIChvYmogaW5zdGFuY2VvZiBSZWdFeHApIHtcblx0XHRjb25zdCBuZXdSZWdFeHAgPSBuZXcgQ29uc3RydWN0b3Iob2JqKTtcblx0XHRuZXdSZWdFeHAubGFzdEluZGV4ID0gb2JqLmxhc3RJbmRleDtcblx0XHRyZXR1cm4gbmV3UmVnRXhwO1xuXHR9XG5cdGlmIChvYmogaW5zdGFuY2VvZiBEYXRhVmlldykgcmV0dXJuIG5ldyBDb25zdHJ1Y3RvcihvYmouYnVmZmVyLnNsaWNlKDApKTtcblx0aWYgKG9iaiBpbnN0YW5jZW9mIEVycm9yKSB7XG5cdFx0bGV0IG5ld0Vycm9yO1xuXHRcdGlmIChvYmogaW5zdGFuY2VvZiBBZ2dyZWdhdGVFcnJvcikgbmV3RXJyb3IgPSBuZXcgQ29uc3RydWN0b3Iob2JqLmVycm9ycywgb2JqLm1lc3NhZ2UsIHsgY2F1c2U6IG9iai5jYXVzZSB9KTtcblx0XHRlbHNlIG5ld0Vycm9yID0gbmV3IENvbnN0cnVjdG9yKG9iai5tZXNzYWdlLCB7IGNhdXNlOiBvYmouY2F1c2UgfSk7XG5cdFx0bmV3RXJyb3Iuc3RhY2sgPSBvYmouc3RhY2s7XG5cdFx0T2JqZWN0LmFzc2lnbihuZXdFcnJvciwgb2JqKTtcblx0XHRyZXR1cm4gbmV3RXJyb3I7XG5cdH1cblx0aWYgKHR5cGVvZiBGaWxlICE9PSBcInVuZGVmaW5lZFwiICYmIG9iaiBpbnN0YW5jZW9mIEZpbGUpIHJldHVybiBuZXcgQ29uc3RydWN0b3IoW29ial0sIG9iai5uYW1lLCB7XG5cdFx0dHlwZTogb2JqLnR5cGUsXG5cdFx0bGFzdE1vZGlmaWVkOiBvYmoubGFzdE1vZGlmaWVkXG5cdH0pO1xuXHRpZiAodHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIikgcmV0dXJuIE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShwcm90b3R5cGUpLCBvYmopO1xuXHRyZXR1cm4gb2JqO1xufVxuLy8jZW5kcmVnaW9uXG5leHBvcnQgeyBjbG9uZSB9O1xuIiwKICAgICIvLyNyZWdpb24gc3JjL2NvbXBhdC9faW50ZXJuYWwvZ2V0U3ltYm9scy50c1xuZnVuY3Rpb24gZ2V0U3ltYm9scyhvYmplY3QpIHtcblx0cmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqZWN0KS5maWx0ZXIoKHN5bWJvbCkgPT4gT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKG9iamVjdCwgc3ltYm9sKSk7XG59XG4vLyNlbmRyZWdpb25cbmV4cG9ydCB7IGdldFN5bWJvbHMgfTtcbiIsCiAgICAiLy8jcmVnaW9uIHNyYy9faW50ZXJuYWwvZ2xvYmFsVGhpcy50c1xuY29uc3QgZ2xvYmFsVGhpc18gPSB0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gXCJvYmplY3RcIiAmJiBnbG9iYWxUaGlzIHx8IHR5cGVvZiB3aW5kb3cgPT09IFwib2JqZWN0XCIgJiYgd2luZG93IHx8IHR5cGVvZiBzZWxmID09PSBcIm9iamVjdFwiICYmIHNlbGYgfHwgdHlwZW9mIGdsb2JhbCA9PT0gXCJvYmplY3RcIiAmJiBnbG9iYWwgfHwgKGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcztcbn0pKCkgfHwgRnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpO1xuLy8jZW5kcmVnaW9uXG5leHBvcnQgeyBnbG9iYWxUaGlzXyB9O1xuIiwKICAgICJpbXBvcnQgeyBnbG9iYWxUaGlzXyB9IGZyb20gXCIuLi9faW50ZXJuYWwvZ2xvYmFsVGhpcy5tanNcIjtcbi8vI3JlZ2lvbiBzcmMvcHJlZGljYXRlL2lzQnVmZmVyLnRzXG4vKipcbiogQ2hlY2tzIGlmIHRoZSBnaXZlbiB2YWx1ZSBpcyBhIEJ1ZmZlciBpbnN0YW5jZS5cbipcbiogVGhpcyBmdW5jdGlvbiB0ZXN0cyB3aGV0aGVyIHRoZSBwcm92aWRlZCB2YWx1ZSBpcyBhbiBpbnN0YW5jZSBvZiBCdWZmZXIuXG4qIEl0IHJldHVybnMgYHRydWVgIGlmIHRoZSB2YWx1ZSBpcyBhIEJ1ZmZlciwgYW5kIGBmYWxzZWAgb3RoZXJ3aXNlLlxuKlxuKiBUaGlzIGZ1bmN0aW9uIGNhbiBhbHNvIHNlcnZlIGFzIGEgdHlwZSBwcmVkaWNhdGUgaW4gVHlwZVNjcmlwdCwgbmFycm93aW5nIHRoZSB0eXBlIG9mIHRoZSBhcmd1bWVudCB0byBgQnVmZmVyYC5cbipcbiogQHBhcmFtIHt1bmtub3dufSB4IC0gVGhlIHZhbHVlIHRvIGNoZWNrIGlmIGl0IGlzIGEgQnVmZmVyLlxuKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHhgIGlzIGEgQnVmZmVyLCBlbHNlIGBmYWxzZWAuXG4qXG4qIEBleGFtcGxlXG4qIGNvbnN0IGJ1ZmZlciA9IEJ1ZmZlci5mcm9tKFwidGVzdFwiKTtcbiogY29uc29sZS5sb2coaXNCdWZmZXIoYnVmZmVyKSk7IC8vIHRydWVcbipcbiogY29uc3Qgbm90QnVmZmVyID0gXCJub3QgYSBidWZmZXJcIjtcbiogY29uc29sZS5sb2coaXNCdWZmZXIobm90QnVmZmVyKSk7IC8vIGZhbHNlXG4qL1xuZnVuY3Rpb24gaXNCdWZmZXIoeCkge1xuXHRyZXR1cm4gdHlwZW9mIGdsb2JhbFRoaXNfLkJ1ZmZlciAhPT0gXCJ1bmRlZmluZWRcIiAmJiBnbG9iYWxUaGlzXy5CdWZmZXIuaXNCdWZmZXIoeCk7XG59XG4vLyNlbmRyZWdpb25cbmV4cG9ydCB7IGlzQnVmZmVyIH07XG4iLAogICAgIi8vI3JlZ2lvbiBzcmMvX2ludGVybmFsL2lzVW5zYWZlUHJvcGVydHkudHNcbi8qKlxuKiBDaGVja3MgaWYgYSBwcm9wZXJ0eSBrZXkgaXMgdW5zYWZlIHRvIG1vZGlmeSBkaXJlY3RseS5cbipcbiogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIGluIGZ1bmN0aW9ucyBsaWtlIGBtZXJnZWAgdG8gcHJldmVudCBwcm90b3R5cGUgcG9sbHV0aW9uIGF0dGFja3NcbiogYnkgaWRlbnRpZnlpbmcgcHJvcGVydHkga2V5cyB0aGF0IGNvdWxkIG1vZGlmeSB0aGUgb2JqZWN0J3MgcHJvdG90eXBlIGNoYWluIG9yIGNvbnN0cnVjdG9yLlxuKlxuKiBAcGFyYW0ga2V5IC0gVGhlIHByb3BlcnR5IGtleSB0byBjaGVja1xuKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHByb3BlcnR5IGlzIHVuc2FmZSB0byBtb2RpZnkgZGlyZWN0bHksIGBmYWxzZWAgb3RoZXJ3aXNlXG4qIEBpbnRlcm5hbFxuKi9cbmZ1bmN0aW9uIGlzVW5zYWZlUHJvcGVydHkoa2V5KSB7XG5cdHJldHVybiBrZXkgPT09IFwiX19wcm90b19fXCI7XG59XG4vLyNlbmRyZWdpb25cbmV4cG9ydCB7IGlzVW5zYWZlUHJvcGVydHkgfTtcbiIsCiAgICAiLy8jcmVnaW9uIHNyYy9jb21wYXQvcHJlZGljYXRlL2lzUGxhaW5PYmplY3QudHNcbi8qKlxuKiBDaGVja3MgaWYgYSBnaXZlbiB2YWx1ZSBpcyBhIHBsYWluIG9iamVjdC5cbipcbiogQSBwbGFpbiBvYmplY3QgaXMgYW4gb2JqZWN0IGNyZWF0ZWQgYnkgdGhlIGB7fWAgbGl0ZXJhbCwgYG5ldyBPYmplY3QoKWAsIG9yXG4qIGBPYmplY3QuY3JlYXRlKG51bGwpYC5cbipcbiogVGhpcyBmdW5jdGlvbiBhbHNvIGhhbmRsZXMgb2JqZWN0cyB3aXRoIGN1c3RvbVxuKiBgU3ltYm9sLnRvU3RyaW5nVGFnYCBwcm9wZXJ0aWVzLlxuKlxuKiBgU3ltYm9sLnRvU3RyaW5nVGFnYCBpcyBhIGJ1aWx0LWluIHN5bWJvbCB0aGF0IGEgY29uc3RydWN0b3IgY2FuIHVzZSB0byBjdXN0b21pemUgdGhlXG4qIGRlZmF1bHQgc3RyaW5nIGRlc2NyaXB0aW9uIG9mIG9iamVjdHMuXG4qXG4qIEBwYXJhbSB7YW55fSBbb2JqZWN0XSAtIFRoZSB2YWx1ZSB0byBjaGVjay5cbiogQHJldHVybnMge2Jvb2xlYW59IC0gVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgYSBwbGFpbiBvYmplY3QsIG90aGVyd2lzZSBmYWxzZS5cbipcbiogQGV4YW1wbGVcbiogY29uc29sZS5sb2coaXNQbGFpbk9iamVjdCh7fSkpOyAvLyB0cnVlXG4qIGNvbnNvbGUubG9nKGlzUGxhaW5PYmplY3QoW10pKTsgLy8gZmFsc2VcbiogY29uc29sZS5sb2coaXNQbGFpbk9iamVjdChudWxsKSk7IC8vIGZhbHNlXG4qIGNvbnNvbGUubG9nKGlzUGxhaW5PYmplY3QoT2JqZWN0LmNyZWF0ZShudWxsKSkpOyAvLyB0cnVlXG4qIGNvbnNvbGUubG9nKGlzUGxhaW5PYmplY3QobmV3IE1hcCgpKSk7IC8vIGZhbHNlXG4qL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdChvYmplY3QpIHtcblx0aWYgKHR5cGVvZiBvYmplY3QgIT09IFwib2JqZWN0XCIpIHJldHVybiBmYWxzZTtcblx0aWYgKG9iamVjdCA9PSBudWxsKSByZXR1cm4gZmFsc2U7XG5cdGlmIChPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KSA9PT0gbnVsbCkgcmV0dXJuIHRydWU7XG5cdGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSAhPT0gXCJbb2JqZWN0IE9iamVjdF1cIikge1xuXHRcdGNvbnN0IHRhZyA9IG9iamVjdFtTeW1ib2wudG9TdHJpbmdUYWddO1xuXHRcdGlmICh0YWcgPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuXHRcdGlmICghT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIFN5bWJvbC50b1N0cmluZ1RhZyk/LndyaXRhYmxlKSByZXR1cm4gZmFsc2U7XG5cdFx0cmV0dXJuIG9iamVjdC50b1N0cmluZygpID09PSBgW29iamVjdCAke3RhZ31dYDtcblx0fVxuXHRsZXQgcHJvdG8gPSBvYmplY3Q7XG5cdHdoaWxlIChPYmplY3QuZ2V0UHJvdG90eXBlT2YocHJvdG8pICE9PSBudWxsKSBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihwcm90byk7XG5cdHJldHVybiBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KSA9PT0gcHJvdG87XG59XG4vLyNlbmRyZWdpb25cbmV4cG9ydCB7IGlzUGxhaW5PYmplY3QgfTtcbiIsCiAgICAiaW1wb3J0IHsgaXNQcmltaXRpdmUgfSBmcm9tIFwiLi4vcHJlZGljYXRlL2lzUHJpbWl0aXZlLm1qc1wiO1xuaW1wb3J0IHsgaXNUeXBlZEFycmF5IH0gZnJvbSBcIi4uL3ByZWRpY2F0ZS9pc1R5cGVkQXJyYXkubWpzXCI7XG5pbXBvcnQgeyBnZXRTeW1ib2xzIH0gZnJvbSBcIi4uL2NvbXBhdC9faW50ZXJuYWwvZ2V0U3ltYm9scy5tanNcIjtcbmltcG9ydCB7IGdldFRhZyB9IGZyb20gXCIuLi9jb21wYXQvX2ludGVybmFsL2dldFRhZy5tanNcIjtcbmltcG9ydCB7IGFyZ3VtZW50c1RhZywgYXJyYXlCdWZmZXJUYWcsIGFycmF5VGFnLCBib29sZWFuVGFnLCBkYXRhVmlld1RhZywgZGF0ZVRhZywgZmxvYXQzMkFycmF5VGFnLCBmbG9hdDY0QXJyYXlUYWcsIGludDE2QXJyYXlUYWcsIGludDMyQXJyYXlUYWcsIGludDhBcnJheVRhZywgbWFwVGFnLCBudW1iZXJUYWcsIG9iamVjdFRhZywgcmVnZXhwVGFnLCBzZXRUYWcsIHN0cmluZ1RhZywgc3ltYm9sVGFnLCB1aW50MTZBcnJheVRhZywgdWludDMyQXJyYXlUYWcsIHVpbnQ4QXJyYXlUYWcsIHVpbnQ4Q2xhbXBlZEFycmF5VGFnIH0gZnJvbSBcIi4uL2NvbXBhdC9faW50ZXJuYWwvdGFncy5tanNcIjtcbmltcG9ydCB7IGlzQnVmZmVyIH0gZnJvbSBcIi4uL3ByZWRpY2F0ZS9pc0J1ZmZlci5tanNcIjtcbi8vI3JlZ2lvbiBzcmMvb2JqZWN0L2Nsb25lRGVlcFdpdGgudHNcbi8qKlxuKiBEZWVwbHkgY2xvbmVzIHRoZSBnaXZlbiBvYmplY3QuXG4qXG4qIFlvdSBjYW4gY3VzdG9taXplIHRoZSBkZWVwIGNsb25pbmcgcHJvY2VzcyB1c2luZyB0aGUgYGNsb25lVmFsdWVgIGZ1bmN0aW9uLlxuKiBUaGUgZnVuY3Rpb24gdGFrZXMgdGhlIGN1cnJlbnQgdmFsdWUgYHZhbHVlYCwgdGhlIHByb3BlcnR5IG5hbWUgYGtleWAsIGFuZCB0aGUgZW50aXJlIG9iamVjdCBgb2JqYCBhcyBhcmd1bWVudHMuXG4qIElmIHRoZSBmdW5jdGlvbiByZXR1cm5zIGEgdmFsdWUsIHRoYXQgdmFsdWUgaXMgdXNlZDtcbiogaWYgaXQgcmV0dXJucyBgdW5kZWZpbmVkYCwgdGhlIGRlZmF1bHQgY2xvbmluZyBtZXRob2QgaXMgdXNlZC5cbipcbiogQHRlbXBsYXRlIFQgLSBUaGUgdHlwZSBvZiB0aGUgb2JqZWN0LlxuKiBAcGFyYW0ge1R9IG9iaiAtIFRoZSBvYmplY3QgdG8gY2xvbmUuXG4qIEBwYXJhbSB7RnVuY3Rpb259IFtjbG9uZVZhbHVlXSAtIEEgZnVuY3Rpb24gdG8gY3VzdG9taXplIHRoZSBjbG9uaW5nIHByb2Nlc3MuXG4qIEByZXR1cm5zIHtUfSAtIEEgZGVlcCBjbG9uZSBvZiB0aGUgZ2l2ZW4gb2JqZWN0LlxuKlxuKiBAZXhhbXBsZVxuKiAvLyBDbG9uZSBhIHByaW1pdGl2ZSB2YWx1ZVxuKiBjb25zdCBudW0gPSAyOTtcbiogY29uc3QgY2xvbmVkTnVtID0gY2xvbmVEZWVwV2l0aChudW0pO1xuKiBjb25zb2xlLmxvZyhjbG9uZWROdW0pOyAvLyAyOVxuKiBjb25zb2xlLmxvZyhjbG9uZWROdW0gPT09IG51bSk7IC8vIHRydWVcbipcbiogQGV4YW1wbGVcbiogLy8gQ2xvbmUgYW4gb2JqZWN0IHdpdGggYSBjdXN0b21pemVyXG4qIGNvbnN0IG9iaiA9IHsgYTogMSwgYjogMiB9O1xuKiBjb25zdCBjbG9uZWRPYmogPSBjbG9uZURlZXBXaXRoKG9iaiwgKHZhbHVlKSA9PiB7XG4qICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiogICAgIHJldHVybiB2YWx1ZSAqIDI7IC8vIERvdWJsZSB0aGUgbnVtYmVyXG4qICAgfVxuKiB9KTtcbiogY29uc29sZS5sb2coY2xvbmVkT2JqKTsgLy8geyBhOiAyLCBiOiA0IH1cbiogY29uc29sZS5sb2coY2xvbmVkT2JqID09PSBvYmopOyAvLyBmYWxzZVxuKlxuKiBAZXhhbXBsZVxuKiAvLyBDbG9uZSBhbiBhcnJheSB3aXRoIGEgY3VzdG9taXplclxuKiBjb25zdCBhcnIgPSBbMSwgMiwgM107XG4qIGNvbnN0IGNsb25lZEFyciA9IGNsb25lRGVlcFdpdGgoYXJyLCAodmFsdWUpID0+IHtcbiogICByZXR1cm4gdmFsdWUgKyAxOyAvLyBJbmNyZW1lbnQgZWFjaCB2YWx1ZVxuKiB9KTtcbiogY29uc29sZS5sb2coY2xvbmVkQXJyKTsgLy8gWzIsIDMsIDRdXG4qIGNvbnNvbGUubG9nKGNsb25lZEFyciA9PT0gYXJyKTsgLy8gZmFsc2VcbiovXG5mdW5jdGlvbiBjbG9uZURlZXBXaXRoKG9iaiwgY2xvbmVWYWx1ZSkge1xuXHRyZXR1cm4gY2xvbmVEZWVwV2l0aEltcGwob2JqLCB2b2lkIDAsIG9iaiwgLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgY2xvbmVWYWx1ZSk7XG59XG5mdW5jdGlvbiBjbG9uZURlZXBXaXRoSW1wbCh2YWx1ZVRvQ2xvbmUsIGtleVRvQ2xvbmUsIG9iamVjdFRvQ2xvbmUsIHN0YWNrID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgY2xvbmVWYWx1ZSA9IHZvaWQgMCkge1xuXHRjb25zdCBjbG9uZWQgPSBjbG9uZVZhbHVlPy4odmFsdWVUb0Nsb25lLCBrZXlUb0Nsb25lLCBvYmplY3RUb0Nsb25lLCBzdGFjayk7XG5cdGlmIChjbG9uZWQgIT09IHZvaWQgMCkgcmV0dXJuIGNsb25lZDtcblx0aWYgKGlzUHJpbWl0aXZlKHZhbHVlVG9DbG9uZSkpIHJldHVybiB2YWx1ZVRvQ2xvbmU7XG5cdGlmIChzdGFjay5oYXModmFsdWVUb0Nsb25lKSkgcmV0dXJuIHN0YWNrLmdldCh2YWx1ZVRvQ2xvbmUpO1xuXHRpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZVRvQ2xvbmUpKSB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gbmV3IEFycmF5KHZhbHVlVG9DbG9uZS5sZW5ndGgpO1xuXHRcdHN0YWNrLnNldCh2YWx1ZVRvQ2xvbmUsIHJlc3VsdCk7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB2YWx1ZVRvQ2xvbmUubGVuZ3RoOyBpKyspIHJlc3VsdFtpXSA9IGNsb25lRGVlcFdpdGhJbXBsKHZhbHVlVG9DbG9uZVtpXSwgaSwgb2JqZWN0VG9DbG9uZSwgc3RhY2ssIGNsb25lVmFsdWUpO1xuXHRcdGlmIChPYmplY3QuaGFzT3duKHZhbHVlVG9DbG9uZSwgXCJpbmRleFwiKSkgcmVzdWx0LmluZGV4ID0gdmFsdWVUb0Nsb25lLmluZGV4O1xuXHRcdGlmIChPYmplY3QuaGFzT3duKHZhbHVlVG9DbG9uZSwgXCJpbnB1dFwiKSkgcmVzdWx0LmlucHV0ID0gdmFsdWVUb0Nsb25lLmlucHV0O1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblx0aWYgKHZhbHVlVG9DbG9uZSBpbnN0YW5jZW9mIERhdGUpIHJldHVybiBuZXcgRGF0ZSh2YWx1ZVRvQ2xvbmUuZ2V0VGltZSgpKTtcblx0aWYgKHZhbHVlVG9DbG9uZSBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuXHRcdGNvbnN0IHJlc3VsdCA9IG5ldyBSZWdFeHAodmFsdWVUb0Nsb25lLnNvdXJjZSwgdmFsdWVUb0Nsb25lLmZsYWdzKTtcblx0XHRyZXN1bHQubGFzdEluZGV4ID0gdmFsdWVUb0Nsb25lLmxhc3RJbmRleDtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cdGlmICh2YWx1ZVRvQ2xvbmUgaW5zdGFuY2VvZiBNYXApIHtcblx0XHRjb25zdCByZXN1bHQgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuXHRcdHN0YWNrLnNldCh2YWx1ZVRvQ2xvbmUsIHJlc3VsdCk7XG5cdFx0Zm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgdmFsdWVUb0Nsb25lKSByZXN1bHQuc2V0KGtleSwgY2xvbmVEZWVwV2l0aEltcGwodmFsdWUsIGtleSwgb2JqZWN0VG9DbG9uZSwgc3RhY2ssIGNsb25lVmFsdWUpKTtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cdGlmICh2YWx1ZVRvQ2xvbmUgaW5zdGFuY2VvZiBTZXQpIHtcblx0XHRjb25zdCByZXN1bHQgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpO1xuXHRcdHN0YWNrLnNldCh2YWx1ZVRvQ2xvbmUsIHJlc3VsdCk7XG5cdFx0Zm9yIChjb25zdCB2YWx1ZSBvZiB2YWx1ZVRvQ2xvbmUpIHJlc3VsdC5hZGQoY2xvbmVEZWVwV2l0aEltcGwodmFsdWUsIHZvaWQgMCwgb2JqZWN0VG9DbG9uZSwgc3RhY2ssIGNsb25lVmFsdWUpKTtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cdGlmIChpc0J1ZmZlcih2YWx1ZVRvQ2xvbmUpKSByZXR1cm4gdmFsdWVUb0Nsb25lLnN1YmFycmF5KCk7XG5cdGlmIChpc1R5cGVkQXJyYXkodmFsdWVUb0Nsb25lKSkge1xuXHRcdGNvbnN0IHJlc3VsdCA9IG5ldyAoT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbHVlVG9DbG9uZSkpLmNvbnN0cnVjdG9yKHZhbHVlVG9DbG9uZS5sZW5ndGgpO1xuXHRcdHN0YWNrLnNldCh2YWx1ZVRvQ2xvbmUsIHJlc3VsdCk7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB2YWx1ZVRvQ2xvbmUubGVuZ3RoOyBpKyspIHJlc3VsdFtpXSA9IGNsb25lRGVlcFdpdGhJbXBsKHZhbHVlVG9DbG9uZVtpXSwgaSwgb2JqZWN0VG9DbG9uZSwgc3RhY2ssIGNsb25lVmFsdWUpO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblx0aWYgKHZhbHVlVG9DbG9uZSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyIHx8IHR5cGVvZiBTaGFyZWRBcnJheUJ1ZmZlciAhPT0gXCJ1bmRlZmluZWRcIiAmJiB2YWx1ZVRvQ2xvbmUgaW5zdGFuY2VvZiBTaGFyZWRBcnJheUJ1ZmZlcikgcmV0dXJuIHZhbHVlVG9DbG9uZS5zbGljZSgwKTtcblx0aWYgKHZhbHVlVG9DbG9uZSBpbnN0YW5jZW9mIERhdGFWaWV3KSB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gbmV3IERhdGFWaWV3KHZhbHVlVG9DbG9uZS5idWZmZXIuc2xpY2UoMCksIHZhbHVlVG9DbG9uZS5ieXRlT2Zmc2V0LCB2YWx1ZVRvQ2xvbmUuYnl0ZUxlbmd0aCk7XG5cdFx0c3RhY2suc2V0KHZhbHVlVG9DbG9uZSwgcmVzdWx0KTtcblx0XHRjb3B5UHJvcGVydGllcyhyZXN1bHQsIHZhbHVlVG9DbG9uZSwgb2JqZWN0VG9DbG9uZSwgc3RhY2ssIGNsb25lVmFsdWUpO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblx0aWYgKHR5cGVvZiBGaWxlICE9PSBcInVuZGVmaW5lZFwiICYmIHZhbHVlVG9DbG9uZSBpbnN0YW5jZW9mIEZpbGUpIHtcblx0XHRjb25zdCByZXN1bHQgPSBuZXcgRmlsZShbdmFsdWVUb0Nsb25lXSwgdmFsdWVUb0Nsb25lLm5hbWUsIHsgdHlwZTogdmFsdWVUb0Nsb25lLnR5cGUgfSk7XG5cdFx0c3RhY2suc2V0KHZhbHVlVG9DbG9uZSwgcmVzdWx0KTtcblx0XHRjb3B5UHJvcGVydGllcyhyZXN1bHQsIHZhbHVlVG9DbG9uZSwgb2JqZWN0VG9DbG9uZSwgc3RhY2ssIGNsb25lVmFsdWUpO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblx0aWYgKHR5cGVvZiBCbG9iICE9PSBcInVuZGVmaW5lZFwiICYmIHZhbHVlVG9DbG9uZSBpbnN0YW5jZW9mIEJsb2IpIHtcblx0XHRjb25zdCByZXN1bHQgPSBuZXcgQmxvYihbdmFsdWVUb0Nsb25lXSwgeyB0eXBlOiB2YWx1ZVRvQ2xvbmUudHlwZSB9KTtcblx0XHRzdGFjay5zZXQodmFsdWVUb0Nsb25lLCByZXN1bHQpO1xuXHRcdGNvcHlQcm9wZXJ0aWVzKHJlc3VsdCwgdmFsdWVUb0Nsb25lLCBvYmplY3RUb0Nsb25lLCBzdGFjaywgY2xvbmVWYWx1ZSk7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXHRpZiAodmFsdWVUb0Nsb25lIGluc3RhbmNlb2YgRXJyb3IpIHtcblx0XHRjb25zdCByZXN1bHQgPSBzdHJ1Y3R1cmVkQ2xvbmUodmFsdWVUb0Nsb25lKTtcblx0XHRzdGFjay5zZXQodmFsdWVUb0Nsb25lLCByZXN1bHQpO1xuXHRcdHJlc3VsdC5tZXNzYWdlID0gdmFsdWVUb0Nsb25lLm1lc3NhZ2U7XG5cdFx0cmVzdWx0Lm5hbWUgPSB2YWx1ZVRvQ2xvbmUubmFtZTtcblx0XHRyZXN1bHQuc3RhY2sgPSB2YWx1ZVRvQ2xvbmUuc3RhY2s7XG5cdFx0cmVzdWx0LmNhdXNlID0gdmFsdWVUb0Nsb25lLmNhdXNlO1xuXHRcdHJlc3VsdC5jb25zdHJ1Y3RvciA9IHZhbHVlVG9DbG9uZS5jb25zdHJ1Y3Rvcjtcblx0XHRjb3B5UHJvcGVydGllcyhyZXN1bHQsIHZhbHVlVG9DbG9uZSwgb2JqZWN0VG9DbG9uZSwgc3RhY2ssIGNsb25lVmFsdWUpO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblx0aWYgKHZhbHVlVG9DbG9uZSBpbnN0YW5jZW9mIEJvb2xlYW4pIHtcblx0XHRjb25zdCByZXN1bHQgPSBuZXcgQm9vbGVhbih2YWx1ZVRvQ2xvbmUudmFsdWVPZigpKTtcblx0XHRzdGFjay5zZXQodmFsdWVUb0Nsb25lLCByZXN1bHQpO1xuXHRcdGNvcHlQcm9wZXJ0aWVzKHJlc3VsdCwgdmFsdWVUb0Nsb25lLCBvYmplY3RUb0Nsb25lLCBzdGFjaywgY2xvbmVWYWx1ZSk7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXHRpZiAodmFsdWVUb0Nsb25lIGluc3RhbmNlb2YgTnVtYmVyKSB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gbmV3IE51bWJlcih2YWx1ZVRvQ2xvbmUudmFsdWVPZigpKTtcblx0XHRzdGFjay5zZXQodmFsdWVUb0Nsb25lLCByZXN1bHQpO1xuXHRcdGNvcHlQcm9wZXJ0aWVzKHJlc3VsdCwgdmFsdWVUb0Nsb25lLCBvYmplY3RUb0Nsb25lLCBzdGFjaywgY2xvbmVWYWx1ZSk7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXHRpZiAodmFsdWVUb0Nsb25lIGluc3RhbmNlb2YgU3RyaW5nKSB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gbmV3IFN0cmluZyh2YWx1ZVRvQ2xvbmUudmFsdWVPZigpKTtcblx0XHRzdGFjay5zZXQodmFsdWVUb0Nsb25lLCByZXN1bHQpO1xuXHRcdGNvcHlQcm9wZXJ0aWVzKHJlc3VsdCwgdmFsdWVUb0Nsb25lLCBvYmplY3RUb0Nsb25lLCBzdGFjaywgY2xvbmVWYWx1ZSk7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXHRpZiAodHlwZW9mIHZhbHVlVG9DbG9uZSA9PT0gXCJvYmplY3RcIiAmJiBpc0Nsb25lYWJsZU9iamVjdCh2YWx1ZVRvQ2xvbmUpKSB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gT2JqZWN0LmNyZWF0ZShPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWVUb0Nsb25lKSk7XG5cdFx0c3RhY2suc2V0KHZhbHVlVG9DbG9uZSwgcmVzdWx0KTtcblx0XHRjb3B5UHJvcGVydGllcyhyZXN1bHQsIHZhbHVlVG9DbG9uZSwgb2JqZWN0VG9DbG9uZSwgc3RhY2ssIGNsb25lVmFsdWUpO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblx0cmV0dXJuIHZhbHVlVG9DbG9uZTtcbn1cbmZ1bmN0aW9uIGNvcHlQcm9wZXJ0aWVzKHRhcmdldCwgc291cmNlLCBvYmplY3RUb0Nsb25lID0gdGFyZ2V0LCBzdGFjaywgY2xvbmVWYWx1ZSkge1xuXHRjb25zdCBrZXlzID0gWy4uLk9iamVjdC5rZXlzKHNvdXJjZSksIC4uLmdldFN5bWJvbHMoc291cmNlKV07XG5cdGZvciAobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuXHRcdGNvbnN0IGtleSA9IGtleXNbaV07XG5cdFx0Y29uc3QgZGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpO1xuXHRcdGlmIChkZXNjcmlwdG9yID09IG51bGwgfHwgZGVzY3JpcHRvci53cml0YWJsZSkgdGFyZ2V0W2tleV0gPSBjbG9uZURlZXBXaXRoSW1wbChzb3VyY2Vba2V5XSwga2V5LCBvYmplY3RUb0Nsb25lLCBzdGFjaywgY2xvbmVWYWx1ZSk7XG5cdH1cbn1cbmZ1bmN0aW9uIGlzQ2xvbmVhYmxlT2JqZWN0KG9iamVjdCkge1xuXHRzd2l0Y2ggKGdldFRhZyhvYmplY3QpKSB7XG5cdFx0Y2FzZSBhcmd1bWVudHNUYWc6XG5cdFx0Y2FzZSBhcnJheVRhZzpcblx0XHRjYXNlIGFycmF5QnVmZmVyVGFnOlxuXHRcdGNhc2UgZGF0YVZpZXdUYWc6XG5cdFx0Y2FzZSBib29sZWFuVGFnOlxuXHRcdGNhc2UgZGF0ZVRhZzpcblx0XHRjYXNlIGZsb2F0MzJBcnJheVRhZzpcblx0XHRjYXNlIGZsb2F0NjRBcnJheVRhZzpcblx0XHRjYXNlIGludDhBcnJheVRhZzpcblx0XHRjYXNlIGludDE2QXJyYXlUYWc6XG5cdFx0Y2FzZSBpbnQzMkFycmF5VGFnOlxuXHRcdGNhc2UgbWFwVGFnOlxuXHRcdGNhc2UgbnVtYmVyVGFnOlxuXHRcdGNhc2Ugb2JqZWN0VGFnOlxuXHRcdGNhc2UgcmVnZXhwVGFnOlxuXHRcdGNhc2Ugc2V0VGFnOlxuXHRcdGNhc2Ugc3RyaW5nVGFnOlxuXHRcdGNhc2Ugc3ltYm9sVGFnOlxuXHRcdGNhc2UgdWludDhBcnJheVRhZzpcblx0XHRjYXNlIHVpbnQ4Q2xhbXBlZEFycmF5VGFnOlxuXHRcdGNhc2UgdWludDE2QXJyYXlUYWc6XG5cdFx0Y2FzZSB1aW50MzJBcnJheVRhZzogcmV0dXJuIHRydWU7XG5cdFx0ZGVmYXVsdDogcmV0dXJuIGZhbHNlO1xuXHR9XG59XG4vLyNlbmRyZWdpb25cbmV4cG9ydCB7IGNsb25lRGVlcFdpdGgsIGNsb25lRGVlcFdpdGhJbXBsLCBjb3B5UHJvcGVydGllcyB9O1xuIiwKICAgICJpbXBvcnQgeyBnZXRUYWcgfSBmcm9tIFwiLi4vX2ludGVybmFsL2dldFRhZy5tanNcIjtcbmltcG9ydCB7IGFyZ3VtZW50c1RhZywgYm9vbGVhblRhZywgbnVtYmVyVGFnLCBzdHJpbmdUYWcgfSBmcm9tIFwiLi4vX2ludGVybmFsL3RhZ3MubWpzXCI7XG5pbXBvcnQgeyBjbG9uZURlZXBXaXRoIGFzIGNsb25lRGVlcFdpdGgkMSwgY29weVByb3BlcnRpZXMgfSBmcm9tIFwiLi4vLi4vb2JqZWN0L2Nsb25lRGVlcFdpdGgubWpzXCI7XG4vLyNyZWdpb24gc3JjL2NvbXBhdC9vYmplY3QvY2xvbmVEZWVwV2l0aC50c1xuLyoqXG4qIENyZWF0ZXMgYSBkZWVwIGNsb25lIG9mIHRoZSBnaXZlbiBvYmplY3QgdXNpbmcgYSBjdXN0b21pemVyIGZ1bmN0aW9uLlxuKlxuKiBAdGVtcGxhdGUgVCAtIFRoZSB0eXBlIG9mIHRoZSBvYmplY3QuXG4qIEBwYXJhbSB7VH0gb2JqIC0gVGhlIG9iamVjdCB0byBjbG9uZS5cbiogQHBhcmFtIHtGdW5jdGlvbn0gW2Nsb25lVmFsdWVdIC0gQSBmdW5jdGlvbiB0byBjdXN0b21pemUgdGhlIGNsb25pbmcgcHJvY2Vzcy5cbiogQHJldHVybnMge1R9IC0gQSBkZWVwIGNsb25lIG9mIHRoZSBnaXZlbiBvYmplY3QuXG4qXG4qIEBleGFtcGxlXG4qIC8vIENsb25lIGEgcHJpbWl0aXZlIHZhbHVlXG4qIGNvbnN0IG51bSA9IDI5O1xuKiBjb25zdCBjbG9uZWROdW0gPSBjbG9uZURlZXBXaXRoKG51bSk7XG4qIGNvbnNvbGUubG9nKGNsb25lZE51bSk7IC8vIDI5XG4qIGNvbnNvbGUubG9nKGNsb25lZE51bSA9PT0gbnVtKTsgLy8gdHJ1ZVxuKlxuKiBAZXhhbXBsZVxuKiAvLyBDbG9uZSBhbiBvYmplY3Qgd2l0aCBhIGN1c3RvbWl6ZXJcbiogY29uc3Qgb2JqID0geyBhOiAxLCBiOiAyIH07XG4qIGNvbnN0IGNsb25lZE9iaiA9IGNsb25lRGVlcFdpdGgob2JqLCAodmFsdWUpID0+IHtcbiogICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuKiAgICAgcmV0dXJuIHZhbHVlICogMjsgLy8gRG91YmxlIHRoZSBudW1iZXJcbiogICB9XG4qIH0pO1xuKiBjb25zb2xlLmxvZyhjbG9uZWRPYmopOyAvLyB7IGE6IDIsIGI6IDQgfVxuKiBjb25zb2xlLmxvZyhjbG9uZWRPYmogPT09IG9iaik7IC8vIGZhbHNlXG4qXG4qIEBleGFtcGxlXG4qIC8vIENsb25lIGFuIGFycmF5IHdpdGggYSBjdXN0b21pemVyXG4qIGNvbnN0IGFyciA9IFsxLCAyLCAzXTtcbiogY29uc3QgY2xvbmVkQXJyID0gY2xvbmVEZWVwV2l0aChhcnIsICh2YWx1ZSkgPT4ge1xuKiAgIHJldHVybiB2YWx1ZSArIDE7IC8vIEluY3JlbWVudCBlYWNoIHZhbHVlXG4qIH0pO1xuKiBjb25zb2xlLmxvZyhjbG9uZWRBcnIpOyAvLyBbMiwgMywgNF1cbiogY29uc29sZS5sb2coY2xvbmVkQXJyID09PSBhcnIpOyAvLyBmYWxzZVxuKi9cbmZ1bmN0aW9uIGNsb25lRGVlcFdpdGgob2JqLCBjdXN0b21pemVyKSB7XG5cdHJldHVybiBjbG9uZURlZXBXaXRoJDEob2JqLCAodmFsdWUsIGtleSwgb2JqZWN0LCBzdGFjaykgPT4ge1xuXHRcdGNvbnN0IGNsb25lZCA9IGN1c3RvbWl6ZXI/Lih2YWx1ZSwga2V5LCBvYmplY3QsIHN0YWNrKTtcblx0XHRpZiAoY2xvbmVkICE9PSB2b2lkIDApIHJldHVybiBjbG9uZWQ7XG5cdFx0aWYgKHR5cGVvZiBvYmogIT09IFwib2JqZWN0XCIpIHJldHVybjtcblx0XHRpZiAoZ2V0VGFnKG9iaikgPT09IFwiW29iamVjdCBPYmplY3RdXCIgJiYgdHlwZW9mIG9iai5jb25zdHJ1Y3RvciAhPT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRjb25zdCByZXN1bHQgPSB7fTtcblx0XHRcdHN0YWNrLnNldChvYmosIHJlc3VsdCk7XG5cdFx0XHRjb3B5UHJvcGVydGllcyhyZXN1bHQsIG9iaiwgb2JqZWN0LCBzdGFjayk7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblx0XHRzd2l0Y2ggKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopKSB7XG5cdFx0XHRjYXNlIG51bWJlclRhZzpcblx0XHRcdGNhc2Ugc3RyaW5nVGFnOlxuXHRcdFx0Y2FzZSBib29sZWFuVGFnOiB7XG5cdFx0XHRcdGNvbnN0IHJlc3VsdCA9IG5ldyBvYmouY29uc3RydWN0b3Iob2JqPy52YWx1ZU9mKCkpO1xuXHRcdFx0XHRjb3B5UHJvcGVydGllcyhyZXN1bHQsIG9iaik7XG5cdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHR9XG5cdFx0XHRjYXNlIGFyZ3VtZW50c1RhZzoge1xuXHRcdFx0XHRjb25zdCByZXN1bHQgPSB7fTtcblx0XHRcdFx0Y29weVByb3BlcnRpZXMocmVzdWx0LCBvYmopO1xuXHRcdFx0XHRyZXN1bHQubGVuZ3RoID0gb2JqLmxlbmd0aDtcblx0XHRcdFx0cmVzdWx0W1N5bWJvbC5pdGVyYXRvcl0gPSBvYmpbU3ltYm9sLml0ZXJhdG9yXTtcblx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdH1cblx0XHRcdGRlZmF1bHQ6IHJldHVybjtcblx0XHR9XG5cdH0pO1xufVxuLy8jZW5kcmVnaW9uXG5leHBvcnQgeyBjbG9uZURlZXBXaXRoIH07XG4iLAogICAgImltcG9ydCB7IGNsb25lRGVlcFdpdGggfSBmcm9tIFwiLi9jbG9uZURlZXBXaXRoLm1qc1wiO1xuLy8jcmVnaW9uIHNyYy9jb21wYXQvb2JqZWN0L2Nsb25lRGVlcC50c1xuLyoqXG4qIENyZWF0ZXMgYSBkZWVwIGNsb25lIG9mIHRoZSBnaXZlbiBvYmplY3QuXG4qXG4qIEB0ZW1wbGF0ZSBUIC0gVGhlIHR5cGUgb2YgdGhlIG9iamVjdC5cbiogQHBhcmFtIHtUfSBvYmogLSBUaGUgb2JqZWN0IHRvIGNsb25lLlxuKiBAcmV0dXJucyB7VH0gLSBBIGRlZXAgY2xvbmUgb2YgdGhlIGdpdmVuIG9iamVjdC5cbipcbiogQGV4YW1wbGVcbiogLy8gQ2xvbmUgYSBwcmltaXRpdmUgdmFsdWVzXG4qIGNvbnN0IG51bSA9IDI5O1xuKiBjb25zdCBjbG9uZWROdW0gPSBjbG9uZShudW0pO1xuKiBjb25zb2xlLmxvZyhjbG9uZWROdW0pOyAvLyAyOVxuKiBjb25zb2xlLmxvZyhjbG9uZWROdW0gPT09IG51bSk7IC8vIHRydWVcbipcbiogQGV4YW1wbGVcbiogLy8gQ2xvbmUgYW4gYXJyYXlcbiogY29uc3QgYXJyID0gWzEsIDIsIDNdO1xuKiBjb25zdCBjbG9uZWRBcnIgPSBjbG9uZShhcnIpO1xuKiBjb25zb2xlLmxvZyhjbG9uZWRBcnIpOyAvLyBbMSwgMiwgM11cbiogY29uc29sZS5sb2coY2xvbmVkQXJyID09PSBhcnIpOyAvLyBmYWxzZVxuKlxuKiBAZXhhbXBsZVxuKiAvLyBDbG9uZSBhbiBhcnJheSB3aXRoIG5lc3RlZCBvYmplY3RzXG4qIGNvbnN0IGFyciA9IFsxLCB7IGE6IDEgfSwgWzEsIDIsIDNdXTtcbiogY29uc3QgY2xvbmVkQXJyID0gY2xvbmUoYXJyKTtcbiogYXJyWzFdLmEgPSAyO1xuKiBjb25zb2xlLmxvZyhhcnIpOyAvLyBbMiwgeyBhOiAyIH0sIFsxLCAyLCAzXV1cbiogY29uc29sZS5sb2coY2xvbmVkQXJyKTsgLy8gWzEsIHsgYTogMSB9LCBbMSwgMiwgM11dXG4qIGNvbnNvbGUubG9nKGNsb25lZEFyciA9PT0gYXJyKTsgLy8gZmFsc2VcbipcbiogQGV4YW1wbGVcbiogLy8gQ2xvbmUgYW4gb2JqZWN0XG4qIGNvbnN0IG9iaiA9IHsgYTogMSwgYjogJ2VzLXRvb2xraXQnLCBjOiBbMSwgMiwgM10gfTtcbiogY29uc3QgY2xvbmVkT2JqID0gY2xvbmUob2JqKTtcbiogY29uc29sZS5sb2coY2xvbmVkT2JqKTsgLy8geyBhOiAxLCBiOiAnZXMtdG9vbGtpdCcsIGM6IFsxLCAyLCAzXSB9XG4qIGNvbnNvbGUubG9nKGNsb25lZE9iaiA9PT0gb2JqKTsgLy8gZmFsc2VcbipcbiogQGV4YW1wbGVcbiogLy8gQ2xvbmUgYW4gb2JqZWN0IHdpdGggbmVzdGVkIG9iamVjdHNcbiogY29uc3Qgb2JqID0geyBhOiAxLCBiOiB7IGM6IDEgfSB9O1xuKiBjb25zdCBjbG9uZWRPYmogPSBjbG9uZShvYmopO1xuKiBvYmouYi5jID0gMjtcbiogY29uc29sZS5sb2cob2JqKTsgLy8geyBhOiAxLCBiOiB7IGM6IDIgfSB9XG4qIGNvbnNvbGUubG9nKGNsb25lZE9iaik7IC8vIHsgYTogMSwgYjogeyBjOiAxIH0gfVxuKiBjb25zb2xlLmxvZyhjbG9uZWRPYmogPT09IG9iaik7IC8vIGZhbHNlXG4qL1xuZnVuY3Rpb24gY2xvbmVEZWVwKG9iaikge1xuXHRyZXR1cm4gY2xvbmVEZWVwV2l0aChvYmopO1xufVxuLy8jZW5kcmVnaW9uXG5leHBvcnQgeyBjbG9uZURlZXAgfTtcbiIsCiAgICAiaW1wb3J0IHsgZ2V0VGFnIH0gZnJvbSBcIi4uL19pbnRlcm5hbC9nZXRUYWcubWpzXCI7XG4vLyNyZWdpb24gc3JjL2NvbXBhdC9wcmVkaWNhdGUvaXNBcmd1bWVudHMudHNcbi8qKlxuKiBDaGVja3MgaWYgdGhlIGdpdmVuIHZhbHVlIGlzIGFuIGFyZ3VtZW50cyBvYmplY3QuXG4qXG4qIFRoaXMgZnVuY3Rpb24gdGVzdHMgd2hldGhlciB0aGUgcHJvdmlkZWQgdmFsdWUgaXMgYW4gYXJndW1lbnRzIG9iamVjdCBvciBub3QuXG4qIEl0IHJldHVybnMgYHRydWVgIGlmIHRoZSB2YWx1ZSBpcyBhbiBhcmd1bWVudHMgb2JqZWN0LCBhbmQgYGZhbHNlYCBvdGhlcndpc2UuXG4qXG4qIFRoaXMgZnVuY3Rpb24gY2FuIGFsc28gc2VydmUgYXMgYSB0eXBlIHByZWRpY2F0ZSBpbiBUeXBlU2NyaXB0LCBuYXJyb3dpbmcgdGhlIHR5cGUgb2YgdGhlIGFyZ3VtZW50IHRvIGFuIGFyZ3VtZW50cyBvYmplY3QuXG4qXG4qIEBwYXJhbSB7YW55fSB2YWx1ZSAtIFRoZSB2YWx1ZSB0byB0ZXN0IGlmIGl0IGlzIGFuIGFyZ3VtZW50cyBvYmplY3QuXG4qIEByZXR1cm5zIHt2YWx1ZSBpcyBJQXJndW1lbnRzfSBgdHJ1ZWAgaWYgdGhlIHZhbHVlIGlzIGFuIGFyZ3VtZW50cywgYGZhbHNlYCBvdGhlcndpc2UuXG4qXG4qIEBleGFtcGxlXG4qIGNvbnN0IGFyZ3MgPSAoZnVuY3Rpb24oKSB7IHJldHVybiBhcmd1bWVudHM7IH0pKCk7XG4qIGNvbnN0IHN0cmljdEFyZ3MgPSAoZnVuY3Rpb24oKSB7ICd1c2Ugc3RyaWN0JzsgcmV0dXJuIGFyZ3VtZW50czsgfSkoKTtcbiogY29uc3QgdmFsdWUgPSBbMSwgMiwgM107XG4qXG4qIGNvbnNvbGUubG9nKGlzQXJndW1lbnRzKGFyZ3MpKTsgLy8gdHJ1ZVxuKiBjb25zb2xlLmxvZyhpc0FyZ3VtZW50cyhzdHJpY3RBcmdzKSk7IC8vIHRydWVcbiogY29uc29sZS5sb2coaXNBcmd1bWVudHModmFsdWUpKTsgLy8gZmFsc2VcbiovXG5mdW5jdGlvbiBpc0FyZ3VtZW50cyh2YWx1ZSkge1xuXHRyZXR1cm4gdmFsdWUgIT09IG51bGwgJiYgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIGdldFRhZyh2YWx1ZSkgPT09IFwiW29iamVjdCBBcmd1bWVudHNdXCI7XG59XG4vLyNlbmRyZWdpb25cbmV4cG9ydCB7IGlzQXJndW1lbnRzIH07XG4iLAogICAgIi8vI3JlZ2lvbiBzcmMvY29tcGF0L3ByZWRpY2F0ZS9pc09iamVjdExpa2UudHNcbi8qKlxuKiBDaGVja3MgaWYgdGhlIGdpdmVuIHZhbHVlIGlzIG9iamVjdC1saWtlLlxuKlxuKiBBIHZhbHVlIGlzIG9iamVjdC1saWtlIGlmIGl0cyB0eXBlIGlzIG9iamVjdCBhbmQgaXQgaXMgbm90IG51bGwuXG4qXG4qIFRoaXMgZnVuY3Rpb24gY2FuIGFsc28gc2VydmUgYXMgYSB0eXBlIHByZWRpY2F0ZSBpbiBUeXBlU2NyaXB0LCBuYXJyb3dpbmcgdGhlIHR5cGUgb2YgdGhlIGFyZ3VtZW50IHRvIGFuIG9iamVjdC1saWtlIHZhbHVlLlxuKlxuKiBAcGFyYW0ge2FueX0gdmFsdWUgLSBUaGUgdmFsdWUgdG8gdGVzdCBpZiBpdCBpcyBhbiBvYmplY3QtbGlrZS5cbiogQHJldHVybnMge2Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgdmFsdWUgaXMgYW4gb2JqZWN0LWxpa2UsIGBmYWxzZWAgb3RoZXJ3aXNlLlxuKlxuKiBAZXhhbXBsZVxuKiBjb25zdCB2YWx1ZTEgPSB7IGE6IDEgfTtcbiogY29uc3QgdmFsdWUyID0gWzEsIDIsIDNdO1xuKiBjb25zdCB2YWx1ZTMgPSAnYWJjJztcbiogY29uc3QgdmFsdWU0ID0gKCkgPT4ge307XG4qIGNvbnN0IHZhbHVlNSA9IG51bGw7XG4qXG4qIGNvbnNvbGUubG9nKGlzT2JqZWN0TGlrZSh2YWx1ZTEpKTsgLy8gdHJ1ZVxuKiBjb25zb2xlLmxvZyhpc09iamVjdExpa2UodmFsdWUyKSk7IC8vIHRydWVcbiogY29uc29sZS5sb2coaXNPYmplY3RMaWtlKHZhbHVlMykpOyAvLyBmYWxzZVxuKiBjb25zb2xlLmxvZyhpc09iamVjdExpa2UodmFsdWU0KSk7IC8vIGZhbHNlXG4qIGNvbnNvbGUubG9nKGlzT2JqZWN0TGlrZSh2YWx1ZTUpKTsgLy8gZmFsc2VcbiovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcblx0cmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPT0gbnVsbDtcbn1cbi8vI2VuZHJlZ2lvblxuZXhwb3J0IHsgaXNPYmplY3RMaWtlIH07XG4iLAogICAgIi8vI3JlZ2lvbiBzcmMvcHJlZGljYXRlL2lzTGVuZ3RoLnRzXG4vKipcbiogQ2hlY2tzIGlmIGEgZ2l2ZW4gdmFsdWUgaXMgYSB2YWxpZCBsZW5ndGguXG4qXG4qIEEgdmFsaWQgbGVuZ3RoIGlzIG9mIHR5cGUgYG51bWJlcmAsIGlzIGEgbm9uLW5lZ2F0aXZlIGludGVnZXIsIGFuZCBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdG9cbiogSmF2YVNjcmlwdCdzIG1heGltdW0gc2FmZSBpbnRlZ2VyIChgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJgKS5cbiogSXQgcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlIGlzIGEgdmFsaWQgbGVuZ3RoLCBhbmQgYGZhbHNlYCBvdGhlcndpc2UuXG4qXG4qIFRoaXMgZnVuY3Rpb24gY2FuIGFsc28gc2VydmUgYXMgYSB0eXBlIHByZWRpY2F0ZSBpbiBUeXBlU2NyaXB0LCBuYXJyb3dpbmcgdGhlIHR5cGUgb2YgdGhlXG4qIGFyZ3VtZW50IHRvIGEgdmFsaWQgbGVuZ3RoIChgbnVtYmVyYCkuXG4qXG4qIEBwYXJhbSB7YW55fSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4qIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgbGVuZ3RoLCBlbHNlIGBmYWxzZWAuXG4qXG4qIEBleGFtcGxlXG4qIGlzTGVuZ3RoKDApOyAvLyB0cnVlXG4qIGlzTGVuZ3RoKDQyKTsgLy8gdHJ1ZVxuKiBpc0xlbmd0aCgtMSk7IC8vIGZhbHNlXG4qIGlzTGVuZ3RoKDEuNSk7IC8vIGZhbHNlXG4qIGlzTGVuZ3RoKE51bWJlci5NQVhfU0FGRV9JTlRFR0VSKTsgLy8gdHJ1ZVxuKiBpc0xlbmd0aChOdW1iZXIuTUFYX1NBRkVfSU5URUdFUiArIDEpOyAvLyBmYWxzZVxuKi9cbmZ1bmN0aW9uIGlzTGVuZ3RoKHZhbHVlKSB7XG5cdHJldHVybiBOdW1iZXIuaXNTYWZlSW50ZWdlcih2YWx1ZSkgJiYgdmFsdWUgPj0gMDtcbn1cbi8vI2VuZHJlZ2lvblxuZXhwb3J0IHsgaXNMZW5ndGggfTtcbiIsCiAgICAiaW1wb3J0IHsgaXNMZW5ndGggfSBmcm9tIFwiLi4vLi4vcHJlZGljYXRlL2lzTGVuZ3RoLm1qc1wiO1xuLy8jcmVnaW9uIHNyYy9jb21wYXQvcHJlZGljYXRlL2lzQXJyYXlMaWtlLnRzXG4vKipcbiogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYXJyYXktbGlrZS5cbipcbiogQHBhcmFtIHthbnl9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYXJyYXktbGlrZSwgZWxzZSBgZmFsc2VgLlxuKlxuKiBAZXhhbXBsZVxuKiBpc0FycmF5TGlrZShbMSwgMiwgM10pOyAvLyB0cnVlXG4qIGlzQXJyYXlMaWtlKCdhYmMnKTsgLy8gdHJ1ZVxuKiBpc0FycmF5TGlrZSh7IDA6ICdhJywgbGVuZ3RoOiAxIH0pOyAvLyB0cnVlXG4qIGlzQXJyYXlMaWtlKHt9KTsgLy8gZmFsc2VcbiogaXNBcnJheUxpa2UobnVsbCk7IC8vIGZhbHNlXG4qIGlzQXJyYXlMaWtlKHVuZGVmaW5lZCk7IC8vIGZhbHNlXG4qL1xuZnVuY3Rpb24gaXNBcnJheUxpa2UodmFsdWUpIHtcblx0cmV0dXJuIHZhbHVlICE9IG51bGwgJiYgdHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIgJiYgaXNMZW5ndGgodmFsdWUubGVuZ3RoKTtcbn1cbi8vI2VuZHJlZ2lvblxuZXhwb3J0IHsgaXNBcnJheUxpa2UgfTtcbiIsCiAgICAiaW1wb3J0IHsgaXNBcnJheUxpa2UgfSBmcm9tIFwiLi9pc0FycmF5TGlrZS5tanNcIjtcbmltcG9ydCB7IGlzT2JqZWN0TGlrZSB9IGZyb20gXCIuL2lzT2JqZWN0TGlrZS5tanNcIjtcbi8vI3JlZ2lvbiBzcmMvY29tcGF0L3ByZWRpY2F0ZS9pc0FycmF5TGlrZU9iamVjdC50c1xuLyoqXG4qIENoZWNrcyBpZiB0aGUgZ2l2ZW4gdmFsdWUgaXMgYSBub24tcHJpbWl0aXZlLCBhcnJheS1saWtlIG9iamVjdC5cbipcbiogQHBhcmFtIHthbnl9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiogQHJldHVybnMge2Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgdmFsdWUgaXMgYSBub24tcHJpbWl0aXZlLCBhcnJheS1saWtlIG9iamVjdCwgYGZhbHNlYCBvdGhlcndpc2UuXG4qXG4qIEBleGFtcGxlXG4qIGlzQXJyYXlMaWtlT2JqZWN0KFsxLCAyLCAzXSk7IC8vIHRydWVcbiogaXNBcnJheUxpa2VPYmplY3QoeyAwOiAnYScsIGxlbmd0aDogMSB9KTsgLy8gdHJ1ZVxuKiBpc0FycmF5TGlrZU9iamVjdCgnYWJjJyk7IC8vIGZhbHNlXG4qIGlzQXJyYXlMaWtlT2JqZWN0KCgpPT57fSk7IC8vIGZhbHNlXG4qL1xuZnVuY3Rpb24gaXNBcnJheUxpa2VPYmplY3QodmFsdWUpIHtcblx0cmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgaXNBcnJheUxpa2UodmFsdWUpO1xufVxuLy8jZW5kcmVnaW9uXG5leHBvcnQgeyBpc0FycmF5TGlrZU9iamVjdCB9O1xuIiwKICAgICJpbXBvcnQgeyBpc1ByaW1pdGl2ZSB9IGZyb20gXCIuLi8uLi9wcmVkaWNhdGUvaXNQcmltaXRpdmUubWpzXCI7XG5pbXBvcnQgeyBjbG9uZSB9IGZyb20gXCIuLi8uLi9vYmplY3QvY2xvbmUubWpzXCI7XG5pbXBvcnQgeyBnZXRTeW1ib2xzIH0gZnJvbSBcIi4uL19pbnRlcm5hbC9nZXRTeW1ib2xzLm1qc1wiO1xuaW1wb3J0IHsgaXNCdWZmZXIgfSBmcm9tIFwiLi4vLi4vcHJlZGljYXRlL2lzQnVmZmVyLm1qc1wiO1xuaW1wb3J0IHsgaXNVbnNhZmVQcm9wZXJ0eSB9IGZyb20gXCIuLi8uLi9faW50ZXJuYWwvaXNVbnNhZmVQcm9wZXJ0eS5tanNcIjtcbmltcG9ydCB7IGlzUGxhaW5PYmplY3QgfSBmcm9tIFwiLi4vcHJlZGljYXRlL2lzUGxhaW5PYmplY3QubWpzXCI7XG5pbXBvcnQgeyBjbG9uZURlZXAgfSBmcm9tIFwiLi9jbG9uZURlZXAubWpzXCI7XG5pbXBvcnQgeyBpc0FyZ3VtZW50cyB9IGZyb20gXCIuLi9wcmVkaWNhdGUvaXNBcmd1bWVudHMubWpzXCI7XG5pbXBvcnQgeyBpc09iamVjdExpa2UgfSBmcm9tIFwiLi4vcHJlZGljYXRlL2lzT2JqZWN0TGlrZS5tanNcIjtcbmltcG9ydCB7IGlzQXJyYXlMaWtlT2JqZWN0IH0gZnJvbSBcIi4uL3ByZWRpY2F0ZS9pc0FycmF5TGlrZU9iamVjdC5tanNcIjtcbmltcG9ydCB7IGlzVHlwZWRBcnJheSB9IGZyb20gXCIuLi9wcmVkaWNhdGUvaXNUeXBlZEFycmF5Lm1qc1wiO1xuLy8jcmVnaW9uIHNyYy9jb21wYXQvb2JqZWN0L21lcmdlV2l0aC50c1xuLyoqXG4qIE1lcmdlcyB0aGUgcHJvcGVydGllcyBvZiBvbmUgb3IgbW9yZSBzb3VyY2Ugb2JqZWN0cyBpbnRvIHRoZSB0YXJnZXQgb2JqZWN0IHVzaW5nIGEgY3VzdG9taXplciBmdW5jdGlvbi5cbipcbiogVGhpcyBmdW5jdGlvbiBwZXJmb3JtcyBhIGRlZXAgbWVyZ2UsIHJlY3Vyc2l2ZWx5IG1lcmdpbmcgbmVzdGVkIG9iamVjdHMgYW5kIGFycmF5cy5cbiogSWYgYSBwcm9wZXJ0eSBpbiB0aGUgc291cmNlIG9iamVjdCBpcyBhbiBhcnJheSBvciBvYmplY3QgYW5kIHRoZSBjb3JyZXNwb25kaW5nIHByb3BlcnR5IGluIHRoZSB0YXJnZXQgb2JqZWN0IGlzIGFsc28gYW4gYXJyYXkgb3Igb2JqZWN0LCB0aGV5IHdpbGwgYmUgbWVyZ2VkLlxuKiBJZiBhIHByb3BlcnR5IGluIHRoZSBzb3VyY2Ugb2JqZWN0IGlzIGB1bmRlZmluZWRgLCBpdCB3aWxsIG5vdCBvdmVyd3JpdGUgYSBkZWZpbmVkIHByb3BlcnR5IGluIHRoZSB0YXJnZXQgb2JqZWN0LlxuKlxuKiBZb3UgY2FuIHByb3ZpZGUgYSBjdXN0b20gYG1lcmdlYCBmdW5jdGlvbiB0byBjb250cm9sIGhvdyBwcm9wZXJ0aWVzIGFyZSBtZXJnZWQuIFRoZSBgbWVyZ2VgIGZ1bmN0aW9uIGlzIGNhbGxlZCBmb3IgZWFjaCBwcm9wZXJ0eSB0aGF0IGlzIGJlaW5nIG1lcmdlZCBhbmQgcmVjZWl2ZXMgdGhlIGZvbGxvd2luZyBhcmd1bWVudHM6XG4qXG4qIC0gYHRhcmdldFZhbHVlYDogVGhlIGN1cnJlbnQgdmFsdWUgb2YgdGhlIHByb3BlcnR5IGluIHRoZSB0YXJnZXQgb2JqZWN0LlxuKiAtIGBzb3VyY2VWYWx1ZWA6IFRoZSB2YWx1ZSBvZiB0aGUgcHJvcGVydHkgaW4gdGhlIHNvdXJjZSBvYmplY3QuXG4qIC0gYGtleWA6IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IGJlaW5nIG1lcmdlZC5cbiogLSBgdGFyZ2V0YDogVGhlIHRhcmdldCBvYmplY3QuXG4qIC0gYHNvdXJjZWA6IFRoZSBzb3VyY2Ugb2JqZWN0LlxuKiAtIGBzdGFja2A6IEEgYE1hcGAgdXNlZCB0byBrZWVwIHRyYWNrIG9mIG9iamVjdHMgdGhhdCBoYXZlIGFscmVhZHkgYmVlbiBwcm9jZXNzZWQgdG8gaGFuZGxlIGNpcmN1bGFyIHJlZmVyZW5jZXMuXG4qXG4qIFRoZSBgbWVyZ2VgIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdGhlIHZhbHVlIHRvIGJlIHNldCBpbiB0aGUgdGFyZ2V0IG9iamVjdC4gSWYgaXQgcmV0dXJucyBgdW5kZWZpbmVkYCwgYSBkZWZhdWx0IGRlZXAgbWVyZ2Ugd2lsbCBiZSBhcHBsaWVkIGZvciBhcnJheXMgYW5kIG9iamVjdHMuXG4qXG4qIFRoZSBmdW5jdGlvbiBjYW4gaGFuZGxlIG11bHRpcGxlIHNvdXJjZSBvYmplY3RzIGFuZCB3aWxsIG1lcmdlIHRoZW0gYWxsIGludG8gdGhlIHRhcmdldCBvYmplY3QuXG4qXG4qIEBwYXJhbSB7YW55fSBvYmplY3QgLSBUaGUgdGFyZ2V0IG9iamVjdCBpbnRvIHdoaWNoIHRoZSBzb3VyY2Ugb2JqZWN0IHByb3BlcnRpZXMgd2lsbCBiZSBtZXJnZWQuIFRoaXMgb2JqZWN0IGlzIG1vZGlmaWVkIGluIHBsYWNlLlxuKiBAcGFyYW0gey4uLmFueX0gb3RoZXJBcmdzIC0gQWRkaXRpb25hbCBzb3VyY2Ugb2JqZWN0cyB0byBtZXJnZSBpbnRvIHRoZSB0YXJnZXQgb2JqZWN0LCBpbmNsdWRpbmcgdGhlIGN1c3RvbSBgbWVyZ2VgIGZ1bmN0aW9uLlxuKiBAcmV0dXJucyB7YW55fSBUaGUgdXBkYXRlZCB0YXJnZXQgb2JqZWN0IHdpdGggcHJvcGVydGllcyBmcm9tIHRoZSBzb3VyY2Ugb2JqZWN0KHMpIG1lcmdlZCBpbi5cbipcbiogQGV4YW1wbGVcbiogY29uc3QgdGFyZ2V0ID0geyBhOiAxLCBiOiAyIH07XG4qIGNvbnN0IHNvdXJjZSA9IHsgYjogMywgYzogNCB9O1xuKlxuKiBtZXJnZVdpdGgodGFyZ2V0LCBzb3VyY2UsICh0YXJnZXRWYWx1ZSwgc291cmNlVmFsdWUpID0+IHtcbiogICBpZiAodHlwZW9mIHRhcmdldFZhbHVlID09PSAnbnVtYmVyJyAmJiB0eXBlb2Ygc291cmNlVmFsdWUgPT09ICdudW1iZXInKSB7XG4qICAgICByZXR1cm4gdGFyZ2V0VmFsdWUgKyBzb3VyY2VWYWx1ZTtcbiogICB9XG4qIH0pO1xuKiAvLyBSZXR1cm5zIHsgYTogMSwgYjogNSwgYzogNCB9XG4qIEBleGFtcGxlXG4qIGNvbnN0IHRhcmdldCA9IHsgYTogWzFdLCBiOiBbMl0gfTtcbiogY29uc3Qgc291cmNlID0geyBhOiBbM10sIGI6IFs0XSB9O1xuKlxuKiBjb25zdCByZXN1bHQgPSBtZXJnZVdpdGgodGFyZ2V0LCBzb3VyY2UsIChvYmpWYWx1ZSwgc3JjVmFsdWUpID0+IHtcbiogICBpZiAoQXJyYXkuaXNBcnJheShvYmpWYWx1ZSkpIHtcbiogICAgIHJldHVybiBvYmpWYWx1ZS5jb25jYXQoc3JjVmFsdWUpO1xuKiAgIH1cbiogfSk7XG4qXG4qIGV4cGVjdChyZXN1bHQpLnRvRXF1YWwoeyBhOiBbMSwgM10sIGI6IFsyLCA0XSB9KTtcbiovXG5mdW5jdGlvbiBtZXJnZVdpdGgob2JqZWN0LCAuLi5vdGhlckFyZ3MpIHtcblx0Y29uc3Qgc291cmNlcyA9IG90aGVyQXJncy5zbGljZSgwLCAtMSk7XG5cdGNvbnN0IG1lcmdlID0gb3RoZXJBcmdzW290aGVyQXJncy5sZW5ndGggLSAxXTtcblx0bGV0IHJlc3VsdCA9IG9iamVjdDtcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzb3VyY2VzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y29uc3Qgc291cmNlID0gc291cmNlc1tpXTtcblx0XHRyZXN1bHQgPSBtZXJnZVdpdGhEZWVwKHJlc3VsdCwgc291cmNlLCBtZXJnZSwgLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSk7XG5cdH1cblx0cmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIG1lcmdlV2l0aERlZXAodGFyZ2V0LCBzb3VyY2UsIG1lcmdlLCBzdGFjaykge1xuXHRpZiAoaXNQcmltaXRpdmUodGFyZ2V0KSkgdGFyZ2V0ID0gT2JqZWN0KHRhcmdldCk7XG5cdGlmIChzb3VyY2UgPT0gbnVsbCB8fCB0eXBlb2Ygc291cmNlICE9PSBcIm9iamVjdFwiKSByZXR1cm4gdGFyZ2V0O1xuXHRpZiAoc3RhY2suaGFzKHNvdXJjZSkpIHJldHVybiBjbG9uZShzdGFjay5nZXQoc291cmNlKSk7XG5cdHN0YWNrLnNldChzb3VyY2UsIHRhcmdldCk7XG5cdGlmIChBcnJheS5pc0FycmF5KHNvdXJjZSkpIHtcblx0XHRzb3VyY2UgPSBzb3VyY2Uuc2xpY2UoKTtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHNvdXJjZS5sZW5ndGg7IGkrKykgc291cmNlW2ldID0gc291cmNlW2ldID8/IHZvaWQgMDtcblx0fVxuXHRjb25zdCBzb3VyY2VLZXlzID0gWy4uLk9iamVjdC5rZXlzKHNvdXJjZSksIC4uLmdldFN5bWJvbHMoc291cmNlKV07XG5cdGZvciAobGV0IGkgPSAwOyBpIDwgc291cmNlS2V5cy5sZW5ndGg7IGkrKykge1xuXHRcdGNvbnN0IGtleSA9IHNvdXJjZUtleXNbaV07XG5cdFx0aWYgKGlzVW5zYWZlUHJvcGVydHkoa2V5KSkgY29udGludWU7XG5cdFx0bGV0IHNvdXJjZVZhbHVlID0gc291cmNlW2tleV07XG5cdFx0bGV0IHRhcmdldFZhbHVlID0gdGFyZ2V0W2tleV07XG5cdFx0aWYgKGlzQXJndW1lbnRzKHNvdXJjZVZhbHVlKSkgc291cmNlVmFsdWUgPSB7IC4uLnNvdXJjZVZhbHVlIH07XG5cdFx0aWYgKGlzQXJndW1lbnRzKHRhcmdldFZhbHVlKSkgdGFyZ2V0VmFsdWUgPSB7IC4uLnRhcmdldFZhbHVlIH07XG5cdFx0aWYgKGlzQnVmZmVyKHNvdXJjZVZhbHVlKSkgc291cmNlVmFsdWUgPSBjbG9uZURlZXAoc291cmNlVmFsdWUpO1xuXHRcdGlmIChBcnJheS5pc0FycmF5KHNvdXJjZVZhbHVlKSkgaWYgKEFycmF5LmlzQXJyYXkodGFyZ2V0VmFsdWUpKSB7XG5cdFx0XHRjb25zdCBjbG9uZWQgPSBbXTtcblx0XHRcdGNvbnN0IHRhcmdldEtleXMgPSBSZWZsZWN0Lm93bktleXModGFyZ2V0VmFsdWUpO1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0YXJnZXRLZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGNvbnN0IHRhcmdldEtleSA9IHRhcmdldEtleXNbaV07XG5cdFx0XHRcdGNsb25lZFt0YXJnZXRLZXldID0gdGFyZ2V0VmFsdWVbdGFyZ2V0S2V5XTtcblx0XHRcdH1cblx0XHRcdHRhcmdldFZhbHVlID0gY2xvbmVkO1xuXHRcdH0gZWxzZSBpZiAoaXNBcnJheUxpa2VPYmplY3QodGFyZ2V0VmFsdWUpKSB7XG5cdFx0XHRjb25zdCBjbG9uZWQgPSBbXTtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdGFyZ2V0VmFsdWUubGVuZ3RoOyBpKyspIGNsb25lZFtpXSA9IHRhcmdldFZhbHVlW2ldO1xuXHRcdFx0dGFyZ2V0VmFsdWUgPSBjbG9uZWQ7XG5cdFx0fSBlbHNlIHRhcmdldFZhbHVlID0gW107XG5cdFx0Y29uc3QgbWVyZ2VkID0gbWVyZ2UodGFyZ2V0VmFsdWUsIHNvdXJjZVZhbHVlLCBrZXksIHRhcmdldCwgc291cmNlLCBzdGFjayk7XG5cdFx0aWYgKG1lcmdlZCAhPT0gdm9pZCAwKSB0YXJnZXRba2V5XSA9IG1lcmdlZDtcblx0XHRlbHNlIGlmIChBcnJheS5pc0FycmF5KHNvdXJjZVZhbHVlKSkgdGFyZ2V0W2tleV0gPSBtZXJnZVdpdGhEZWVwKHRhcmdldFZhbHVlLCBzb3VyY2VWYWx1ZSwgbWVyZ2UsIHN0YWNrKTtcblx0XHRlbHNlIGlmIChpc09iamVjdExpa2UodGFyZ2V0VmFsdWUpICYmIGlzT2JqZWN0TGlrZShzb3VyY2VWYWx1ZSkgJiYgKGlzUGxhaW5PYmplY3QodGFyZ2V0VmFsdWUpIHx8IGlzUGxhaW5PYmplY3Qoc291cmNlVmFsdWUpIHx8IGlzVHlwZWRBcnJheSh0YXJnZXRWYWx1ZSkgfHwgaXNUeXBlZEFycmF5KHNvdXJjZVZhbHVlKSkpIHRhcmdldFtrZXldID0gbWVyZ2VXaXRoRGVlcCh0YXJnZXRWYWx1ZSwgc291cmNlVmFsdWUsIG1lcmdlLCBzdGFjayk7XG5cdFx0ZWxzZSBpZiAodGFyZ2V0VmFsdWUgPT0gbnVsbCAmJiBpc1BsYWluT2JqZWN0KHNvdXJjZVZhbHVlKSkgdGFyZ2V0W2tleV0gPSBtZXJnZVdpdGhEZWVwKHt9LCBzb3VyY2VWYWx1ZSwgbWVyZ2UsIHN0YWNrKTtcblx0XHRlbHNlIGlmICh0YXJnZXRWYWx1ZSA9PSBudWxsICYmIGlzVHlwZWRBcnJheShzb3VyY2VWYWx1ZSkpIHRhcmdldFtrZXldID0gY2xvbmVEZWVwKHNvdXJjZVZhbHVlKTtcblx0XHRlbHNlIGlmICh0YXJnZXRWYWx1ZSA9PT0gdm9pZCAwIHx8IHNvdXJjZVZhbHVlICE9PSB2b2lkIDApIHRhcmdldFtrZXldID0gc291cmNlVmFsdWU7XG5cdH1cblx0cmV0dXJuIHRhcmdldDtcbn1cbi8vI2VuZHJlZ2lvblxuZXhwb3J0IHsgbWVyZ2VXaXRoIH07XG4iLAogICAgImltcG9ydCB7IG5vb3AgfSBmcm9tIFwiLi4vLi4vZnVuY3Rpb24vbm9vcC5tanNcIjtcbmltcG9ydCB7IG1lcmdlV2l0aCB9IGZyb20gXCIuL21lcmdlV2l0aC5tanNcIjtcbi8vI3JlZ2lvbiBzcmMvY29tcGF0L29iamVjdC9tZXJnZS50c1xuLyoqXG4qIE1lcmdlcyB0aGUgcHJvcGVydGllcyBvZiBvbmUgb3IgbW9yZSBzb3VyY2Ugb2JqZWN0cyBpbnRvIHRoZSB0YXJnZXQgb2JqZWN0LlxuKlxuKiBUaGlzIGZ1bmN0aW9uIHBlcmZvcm1zIGEgZGVlcCBtZXJnZSwgcmVjdXJzaXZlbHkgbWVyZ2luZyBuZXN0ZWQgb2JqZWN0cyBhbmQgYXJyYXlzLlxuKiBJZiBhIHByb3BlcnR5IGluIHRoZSBzb3VyY2Ugb2JqZWN0IGlzIGFuIGFycmF5IG9yIG9iamVjdCBhbmQgdGhlIGNvcnJlc3BvbmRpbmcgcHJvcGVydHkgaW4gdGhlIHRhcmdldCBvYmplY3QgaXMgYWxzbyBhbiBhcnJheSBvciBvYmplY3QsIHRoZXkgd2lsbCBiZSBtZXJnZWQuXG4qIElmIGEgcHJvcGVydHkgaW4gdGhlIHNvdXJjZSBvYmplY3QgaXMgYHVuZGVmaW5lZGAsIGl0IHdpbGwgbm90IG92ZXJ3cml0ZSBhIGRlZmluZWQgcHJvcGVydHkgaW4gdGhlIHRhcmdldCBvYmplY3QuXG4qXG4qIFRoZSBmdW5jdGlvbiBjYW4gaGFuZGxlIG11bHRpcGxlIHNvdXJjZSBvYmplY3RzIGFuZCB3aWxsIG1lcmdlIHRoZW0gYWxsIGludG8gdGhlIHRhcmdldCBvYmplY3QuXG4qXG4qIEBwYXJhbSB7YW55fSBvYmplY3QgLSBUaGUgdGFyZ2V0IG9iamVjdCBpbnRvIHdoaWNoIHRoZSBzb3VyY2Ugb2JqZWN0IHByb3BlcnRpZXMgd2lsbCBiZSBtZXJnZWQuIFRoaXMgb2JqZWN0IGlzIG1vZGlmaWVkIGluIHBsYWNlLlxuKiBAcGFyYW0ge2FueVtdfSBzb3VyY2VzIC0gVGhlIHNvdXJjZSBvYmplY3RzIHdob3NlIHByb3BlcnRpZXMgd2lsbCBiZSBtZXJnZWQgaW50byB0aGUgdGFyZ2V0IG9iamVjdC5cbiogQHJldHVybnMge2FueX0gVGhlIHVwZGF0ZWQgdGFyZ2V0IG9iamVjdCB3aXRoIHByb3BlcnRpZXMgZnJvbSB0aGUgc291cmNlIG9iamVjdChzKSBtZXJnZWQgaW4uXG4qXG4qIEBleGFtcGxlXG4qIGNvbnN0IHRhcmdldCA9IHsgYTogMSwgYjogeyB4OiAxLCB5OiAyIH0gfTtcbiogY29uc3Qgc291cmNlID0geyBiOiB7IHk6IDMsIHo6IDQgfSwgYzogNSB9O1xuKlxuKiBjb25zdCByZXN1bHQgPSBtZXJnZSh0YXJnZXQsIHNvdXJjZSk7XG4qIGNvbnNvbGUubG9nKHJlc3VsdCk7XG4qIC8vIE91dHB1dDogeyBhOiAxLCBiOiB7IHg6IDEsIHk6IDMsIHo6IDQgfSwgYzogNSB9XG4qXG4qIEBleGFtcGxlXG4qIGNvbnN0IHRhcmdldCA9IHsgYTogWzEsIDJdLCBiOiB7IHg6IDEgfSB9O1xuKiBjb25zdCBzb3VyY2UgPSB7IGE6IFszXSwgYjogeyB5OiAyIH0gfTtcbipcbiogY29uc3QgcmVzdWx0ID0gbWVyZ2UodGFyZ2V0LCBzb3VyY2UpO1xuKiBjb25zb2xlLmxvZyhyZXN1bHQpO1xuKiAvLyBPdXRwdXQ6IHsgYTogWzNdLCBiOiB7IHg6IDEsIHk6IDIgfSB9XG4qXG4qIEBleGFtcGxlXG4qIGNvbnN0IHRhcmdldCA9IHsgYTogbnVsbCB9O1xuKiBjb25zdCBzb3VyY2UgPSB7IGE6IFsxLCAyLCAzXSB9O1xuKlxuKiBjb25zdCByZXN1bHQgPSBtZXJnZSh0YXJnZXQsIHNvdXJjZSk7XG4qIGNvbnNvbGUubG9nKHJlc3VsdCk7XG4qIC8vIE91dHB1dDogeyBhOiBbMSwgMiwgM10gfVxuKi9cbmZ1bmN0aW9uIG1lcmdlKG9iamVjdCwgLi4uc291cmNlcykge1xuXHRyZXR1cm4gbWVyZ2VXaXRoKG9iamVjdCwgLi4uc291cmNlcywgbm9vcCk7XG59XG4vLyNlbmRyZWdpb25cbmV4cG9ydCB7IG1lcmdlIH07XG4iLAogICAgIi8vI3JlZ2lvbiBzcmMvY29tcGF0L19pbnRlcm5hbC9pc1Byb3RvdHlwZS50c1xuZnVuY3Rpb24gaXNQcm90b3R5cGUodmFsdWUpIHtcblx0Y29uc3QgY29uc3RydWN0b3IgPSB2YWx1ZT8uY29uc3RydWN0b3I7XG5cdHJldHVybiB2YWx1ZSA9PT0gKHR5cGVvZiBjb25zdHJ1Y3RvciA9PT0gXCJmdW5jdGlvblwiID8gY29uc3RydWN0b3IucHJvdG90eXBlIDogT2JqZWN0LnByb3RvdHlwZSk7XG59XG4vLyNlbmRyZWdpb25cbmV4cG9ydCB7IGlzUHJvdG90eXBlIH07XG4iLAogICAgImltcG9ydCB7IGlzQnVmZmVyIH0gZnJvbSBcIi4uLy4uL3ByZWRpY2F0ZS9pc0J1ZmZlci5tanNcIjtcbmltcG9ydCB7IGlzQXJyYXlMaWtlIH0gZnJvbSBcIi4vaXNBcnJheUxpa2UubWpzXCI7XG5pbXBvcnQgeyBpc0FyZ3VtZW50cyB9IGZyb20gXCIuL2lzQXJndW1lbnRzLm1qc1wiO1xuaW1wb3J0IHsgaXNQcm90b3R5cGUgfSBmcm9tIFwiLi4vX2ludGVybmFsL2lzUHJvdG90eXBlLm1qc1wiO1xuaW1wb3J0IHsgaXNUeXBlZEFycmF5IH0gZnJvbSBcIi4vaXNUeXBlZEFycmF5Lm1qc1wiO1xuLy8jcmVnaW9uIHNyYy9jb21wYXQvcHJlZGljYXRlL2lzRW1wdHkudHNcbi8qKlxuKiBDaGVja3MgaWYgYSBnaXZlbiB2YWx1ZSBpcyBlbXB0eS5cbipcbiogLSBJZiB0aGUgZ2l2ZW4gdmFsdWUgaXMgYSBzdHJpbmcsIGNoZWNrcyBpZiBpdCBpcyBhbiBlbXB0eSBzdHJpbmcuXG4qIC0gSWYgdGhlIGdpdmVuIHZhbHVlIGlzIGFuIGFycmF5LCBgTWFwYCwgb3IgYFNldGAsIGNoZWNrcyBpZiBpdHMgc2l6ZSBpcyAwLlxuKiAtIElmIHRoZSBnaXZlbiB2YWx1ZSBpcyBhbiBbYXJyYXktbGlrZSBvYmplY3RdKC4uL3ByZWRpY2F0ZS9pc0FycmF5TGlrZS5tZCksIGNoZWNrcyBpZiBpdHMgbGVuZ3RoIGlzIDAuXG4qIC0gSWYgdGhlIGdpdmVuIHZhbHVlIGlzIGFuIG9iamVjdCwgY2hlY2tzIGlmIGl0IGlzIGFuIGVtcHR5IG9iamVjdCB3aXRoIG5vIHByb3BlcnRpZXMuXG4qIC0gUHJpbWl0aXZlIHZhbHVlcyAoYm9vbGVhbnMsIG51bWJlcnMsIG9yIGJpZ2ludHMpIGFyZSBjb25zaWRlcmVkIGVtcHR5LlxuKlxuKiBAcGFyYW0ge3Vua25vd259IFt2YWx1ZV0gLSBUaGUgdmFsdWUgdG8gY2hlY2suXG4qIEByZXR1cm5zIHtib29sZWFufSBgdHJ1ZWAgaWYgdGhlIHZhbHVlIGlzIGVtcHR5LCBgZmFsc2VgIG90aGVyd2lzZS5cbipcbiogQGV4YW1wbGVcbiogaXNFbXB0eSgpOyAvLyB0cnVlXG4qIGlzRW1wdHkobnVsbCk7IC8vIHRydWVcbiogaXNFbXB0eShcIlwiKTsgLy8gdHJ1ZVxuKiBpc0VtcHR5KFtdKTsgLy8gdHJ1ZVxuKiBpc0VtcHR5KHt9KTsgLy8gdHJ1ZVxuKiBpc0VtcHR5KG5ldyBNYXAoKSk7IC8vIHRydWVcbiogaXNFbXB0eShuZXcgU2V0KCkpOyAvLyB0cnVlXG4qIGlzRW1wdHkoXCJoZWxsb1wiKTsgLy8gZmFsc2VcbiogaXNFbXB0eShbMSwgMiwgM10pOyAvLyBmYWxzZVxuKiBpc0VtcHR5KHsgYTogMSB9KTsgLy8gZmFsc2VcbiogaXNFbXB0eShuZXcgTWFwKFtbXCJrZXlcIiwgXCJ2YWx1ZVwiXV0pKTsgLy8gZmFsc2VcbiogaXNFbXB0eShuZXcgU2V0KFsxLCAyLCAzXSkpOyAvLyBmYWxzZVxuKi9cbmZ1bmN0aW9uIGlzRW1wdHkodmFsdWUpIHtcblx0aWYgKHZhbHVlID09IG51bGwpIHJldHVybiB0cnVlO1xuXHRpZiAoaXNBcnJheUxpa2UodmFsdWUpKSB7XG5cdFx0aWYgKHR5cGVvZiB2YWx1ZS5zcGxpY2UgIT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgdmFsdWUgIT09IFwic3RyaW5nXCIgJiYgIWlzQnVmZmVyKHZhbHVlKSAmJiAhaXNUeXBlZEFycmF5KHZhbHVlKSAmJiAhaXNBcmd1bWVudHModmFsdWUpKSByZXR1cm4gZmFsc2U7XG5cdFx0cmV0dXJuIHZhbHVlLmxlbmd0aCA9PT0gMDtcblx0fVxuXHRpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiKSB7XG5cdFx0aWYgKHZhbHVlIGluc3RhbmNlb2YgTWFwIHx8IHZhbHVlIGluc3RhbmNlb2YgU2V0KSByZXR1cm4gdmFsdWUuc2l6ZSA9PT0gMDtcblx0XHRjb25zdCBrZXlzID0gT2JqZWN0LmtleXModmFsdWUpO1xuXHRcdGlmIChpc1Byb3RvdHlwZSh2YWx1ZSkpIHJldHVybiBrZXlzLmZpbHRlcigoeCkgPT4geCAhPT0gXCJjb25zdHJ1Y3RvclwiKS5sZW5ndGggPT09IDA7XG5cdFx0cmV0dXJuIGtleXMubGVuZ3RoID09PSAwO1xuXHR9XG5cdHJldHVybiB0cnVlO1xufVxuLy8jZW5kcmVnaW9uXG5leHBvcnQgeyBpc0VtcHR5IH07XG4iLAogICAgImltcG9ydCB7XG4gIGFzc2lnbldpdGhEZXB0aF9kZWZhdWx0LFxuICBjb21tb25fZGVmYXVsdCxcbiAgZGV0ZWN0VHlwZSxcbiAgZGlyZWN0aXZlUmVnZXgsXG4gIHNhbml0aXplRGlyZWN0aXZlXG59IGZyb20gXCIuL2NodW5rLUNTQ0lISzdRLm1qc1wiO1xuaW1wb3J0IHtcbiAgX19uYW1lLFxuICBsb2dcbn0gZnJvbSBcIi4vY2h1bmstQUdIUkI0SkYubWpzXCI7XG5cbi8vIHNyYy91dGlscy50c1xuaW1wb3J0IHsgc2FuaXRpemVVcmwgfSBmcm9tIFwiQGJyYWludHJlZS9zYW5pdGl6ZS11cmxcIjtcbmltcG9ydCB7XG4gIGN1cnZlQmFzaXMsXG4gIGN1cnZlQmFzaXNDbG9zZWQsXG4gIGN1cnZlQmFzaXNPcGVuLFxuICBjdXJ2ZUJ1bXBYLFxuICBjdXJ2ZUJ1bXBZLFxuICBjdXJ2ZUJ1bmRsZSxcbiAgY3VydmVDYXJkaW5hbENsb3NlZCxcbiAgY3VydmVDYXJkaW5hbE9wZW4sXG4gIGN1cnZlQ2FyZGluYWwsXG4gIGN1cnZlQ2F0bXVsbFJvbUNsb3NlZCxcbiAgY3VydmVDYXRtdWxsUm9tT3BlbixcbiAgY3VydmVDYXRtdWxsUm9tLFxuICBjdXJ2ZUxpbmVhcixcbiAgY3VydmVMaW5lYXJDbG9zZWQsXG4gIGN1cnZlTW9ub3RvbmVYLFxuICBjdXJ2ZU1vbm90b25lWSxcbiAgY3VydmVOYXR1cmFsLFxuICBjdXJ2ZVN0ZXAsXG4gIGN1cnZlU3RlcEFmdGVyLFxuICBjdXJ2ZVN0ZXBCZWZvcmUsXG4gIHNlbGVjdFxufSBmcm9tIFwiZDNcIjtcbmltcG9ydCB7IG1lbW9pemUsIG1lcmdlIH0gZnJvbSBcImVzLXRvb2xraXQvY29tcGF0XCI7XG52YXIgWkVST19XSURUSF9TUEFDRSA9IFwiXFx1MjAwQlwiO1xudmFyIGQzQ3VydmVUeXBlcyA9IHtcbiAgY3VydmVCYXNpcyxcbiAgY3VydmVCYXNpc0Nsb3NlZCxcbiAgY3VydmVCYXNpc09wZW4sXG4gIGN1cnZlQnVtcFgsXG4gIGN1cnZlQnVtcFksXG4gIGN1cnZlQnVuZGxlLFxuICBjdXJ2ZUNhcmRpbmFsQ2xvc2VkLFxuICBjdXJ2ZUNhcmRpbmFsT3BlbixcbiAgY3VydmVDYXJkaW5hbCxcbiAgY3VydmVDYXRtdWxsUm9tQ2xvc2VkLFxuICBjdXJ2ZUNhdG11bGxSb21PcGVuLFxuICBjdXJ2ZUNhdG11bGxSb20sXG4gIGN1cnZlTGluZWFyLFxuICBjdXJ2ZUxpbmVhckNsb3NlZCxcbiAgY3VydmVNb25vdG9uZVgsXG4gIGN1cnZlTW9ub3RvbmVZLFxuICBjdXJ2ZU5hdHVyYWwsXG4gIGN1cnZlU3RlcCxcbiAgY3VydmVTdGVwQWZ0ZXIsXG4gIGN1cnZlU3RlcEJlZm9yZVxufTtcbnZhciBkaXJlY3RpdmVXaXRob3V0T3BlbiA9IC9cXHMqKD86KFxcdyspKD89Oik6fChcXHcrKSlcXHMqKD86KFxcdyspfCgoPzooPyF9JXsyfSkufFxccj9cXG4pKikpP1xccyooPzp9JXsyfSk/L2dpO1xudmFyIGRldGVjdEluaXQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKHRleHQsIGNvbmZpZykge1xuICBjb25zdCBpbml0cyA9IGRldGVjdERpcmVjdGl2ZSh0ZXh0LCAvKD86aW5pdFxcYil8KD86aW5pdGlhbGl6ZVxcYikvKTtcbiAgbGV0IHJlc3VsdHMgPSB7fTtcbiAgaWYgKEFycmF5LmlzQXJyYXkoaW5pdHMpKSB7XG4gICAgY29uc3QgYXJncyA9IGluaXRzLm1hcCgoaW5pdCkgPT4gaW5pdC5hcmdzKTtcbiAgICBzYW5pdGl6ZURpcmVjdGl2ZShhcmdzKTtcbiAgICByZXN1bHRzID0gYXNzaWduV2l0aERlcHRoX2RlZmF1bHQocmVzdWx0cywgWy4uLmFyZ3NdKTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHRzID0gaW5pdHMuYXJncztcbiAgfVxuICBpZiAoIXJlc3VsdHMpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgbGV0IHR5cGUgPSBkZXRlY3RUeXBlKHRleHQsIGNvbmZpZyk7XG4gIGNvbnN0IHByb3AgPSBcImNvbmZpZ1wiO1xuICBpZiAocmVzdWx0c1twcm9wXSAhPT0gdm9pZCAwKSB7XG4gICAgaWYgKHR5cGUgPT09IFwiZmxvd2NoYXJ0LXYyXCIpIHtcbiAgICAgIHR5cGUgPSBcImZsb3djaGFydFwiO1xuICAgIH1cbiAgICByZXN1bHRzW3R5cGVdID0gcmVzdWx0c1twcm9wXTtcbiAgICBkZWxldGUgcmVzdWx0c1twcm9wXTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cztcbn0sIFwiZGV0ZWN0SW5pdFwiKTtcbnZhciBkZXRlY3REaXJlY3RpdmUgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKHRleHQsIHR5cGUgPSBudWxsKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgY29tbWVudFdpdGhvdXREaXJlY3RpdmVzID0gbmV3IFJlZ0V4cChcbiAgICAgIGBbJV17Mn0oPyFbe10ke2RpcmVjdGl2ZVdpdGhvdXRPcGVuLnNvdXJjZX0pKD89W31dWyVdezJ9KS4qXG5gLFxuICAgICAgXCJpZ1wiXG4gICAgKTtcbiAgICB0ZXh0ID0gdGV4dC50cmltKCkucmVwbGFjZShjb21tZW50V2l0aG91dERpcmVjdGl2ZXMsIFwiXCIpLnJlcGxhY2UoLycvZ20sICdcIicpO1xuICAgIGxvZy5kZWJ1ZyhcbiAgICAgIGBEZXRlY3RpbmcgZGlhZ3JhbSBkaXJlY3RpdmUke3R5cGUgIT09IG51bGwgPyBcIiB0eXBlOlwiICsgdHlwZSA6IFwiXCJ9IGJhc2VkIG9uIHRoZSB0ZXh0OiR7dGV4dH1gXG4gICAgKTtcbiAgICBsZXQgbWF0Y2g7XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgd2hpbGUgKChtYXRjaCA9IGRpcmVjdGl2ZVJlZ2V4LmV4ZWModGV4dCkpICE9PSBudWxsKSB7XG4gICAgICBpZiAobWF0Y2guaW5kZXggPT09IGRpcmVjdGl2ZVJlZ2V4Lmxhc3RJbmRleCkge1xuICAgICAgICBkaXJlY3RpdmVSZWdleC5sYXN0SW5kZXgrKztcbiAgICAgIH1cbiAgICAgIGlmIChtYXRjaCAmJiAhdHlwZSB8fCB0eXBlICYmIG1hdGNoWzFdPy5tYXRjaCh0eXBlKSB8fCB0eXBlICYmIG1hdGNoWzJdPy5tYXRjaCh0eXBlKSkge1xuICAgICAgICBjb25zdCB0eXBlMiA9IG1hdGNoWzFdID8gbWF0Y2hbMV0gOiBtYXRjaFsyXTtcbiAgICAgICAgY29uc3QgYXJncyA9IG1hdGNoWzNdID8gbWF0Y2hbM10udHJpbSgpIDogbWF0Y2hbNF0gPyBKU09OLnBhcnNlKG1hdGNoWzRdLnRyaW0oKSkgOiBudWxsO1xuICAgICAgICByZXN1bHQucHVzaCh7IHR5cGU6IHR5cGUyLCBhcmdzIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAocmVzdWx0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogdGV4dCwgYXJnczogbnVsbCB9O1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0Lmxlbmd0aCA9PT0gMSA/IHJlc3VsdFswXSA6IHJlc3VsdDtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2cuZXJyb3IoXG4gICAgICBgRVJST1I6ICR7ZXJyb3IubWVzc2FnZX0gLSBVbmFibGUgdG8gcGFyc2UgZGlyZWN0aXZlIHR5cGU6ICcke3R5cGV9JyBiYXNlZCBvbiB0aGUgdGV4dDogJyR7dGV4dH0nYFxuICAgICk7XG4gICAgcmV0dXJuIHsgdHlwZTogdm9pZCAwLCBhcmdzOiBudWxsIH07XG4gIH1cbn0sIFwiZGV0ZWN0RGlyZWN0aXZlXCIpO1xudmFyIHJlbW92ZURpcmVjdGl2ZXMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuIHRleHQucmVwbGFjZShkaXJlY3RpdmVSZWdleCwgXCJcIik7XG59LCBcInJlbW92ZURpcmVjdGl2ZXNcIik7XG52YXIgaXNTdWJzdHJpbmdJbkFycmF5ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihzdHIsIGFycikge1xuICBmb3IgKGNvbnN0IFtpLCBlbGVtZW50XSBvZiBhcnIuZW50cmllcygpKSB7XG4gICAgaWYgKGVsZW1lbnQubWF0Y2goc3RyKSkge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn0sIFwiaXNTdWJzdHJpbmdJbkFycmF5XCIpO1xuZnVuY3Rpb24gaW50ZXJwb2xhdGVUb0N1cnZlKGludGVycG9sYXRlLCBkZWZhdWx0Q3VydmUpIHtcbiAgaWYgKCFpbnRlcnBvbGF0ZSkge1xuICAgIHJldHVybiBkZWZhdWx0Q3VydmU7XG4gIH1cbiAgY29uc3QgY3VydmVOYW1lID0gYGN1cnZlJHtpbnRlcnBvbGF0ZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGludGVycG9sYXRlLnNsaWNlKDEpfWA7XG4gIHJldHVybiBkM0N1cnZlVHlwZXNbY3VydmVOYW1lXSA/PyBkZWZhdWx0Q3VydmU7XG59XG5fX25hbWUoaW50ZXJwb2xhdGVUb0N1cnZlLCBcImludGVycG9sYXRlVG9DdXJ2ZVwiKTtcbmZ1bmN0aW9uIGZvcm1hdFVybChsaW5rU3RyLCBjb25maWcpIHtcbiAgY29uc3QgdXJsID0gbGlua1N0ci50cmltKCk7XG4gIGlmICghdXJsKSB7XG4gICAgcmV0dXJuIHZvaWQgMDtcbiAgfVxuICBpZiAoY29uZmlnLnNlY3VyaXR5TGV2ZWwgIT09IFwibG9vc2VcIikge1xuICAgIHJldHVybiBzYW5pdGl6ZVVybCh1cmwpO1xuICB9XG4gIHJldHVybiB1cmw7XG59XG5fX25hbWUoZm9ybWF0VXJsLCBcImZvcm1hdFVybFwiKTtcbnZhciBydW5GdW5jID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoZnVuY3Rpb25OYW1lLCAuLi5wYXJhbXMpID0+IHtcbiAgY29uc3QgYXJyUGF0aHMgPSBmdW5jdGlvbk5hbWUuc3BsaXQoXCIuXCIpO1xuICBjb25zdCBsZW4gPSBhcnJQYXRocy5sZW5ndGggLSAxO1xuICBjb25zdCBmbk5hbWUgPSBhcnJQYXRoc1tsZW5dO1xuICBsZXQgb2JqID0gd2luZG93O1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgb2JqID0gb2JqW2FyclBhdGhzW2ldXTtcbiAgICBpZiAoIW9iaikge1xuICAgICAgbG9nLmVycm9yKGBGdW5jdGlvbiBuYW1lOiAke2Z1bmN0aW9uTmFtZX0gbm90IGZvdW5kIGluIHdpbmRvd2ApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuICBvYmpbZm5OYW1lXSguLi5wYXJhbXMpO1xufSwgXCJydW5GdW5jXCIpO1xuZnVuY3Rpb24gZGlzdGFuY2UocDEsIHAyKSB7XG4gIGlmICghcDEgfHwgIXAyKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cbiAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhwMi54IC0gcDEueCwgMikgKyBNYXRoLnBvdyhwMi55IC0gcDEueSwgMikpO1xufVxuX19uYW1lKGRpc3RhbmNlLCBcImRpc3RhbmNlXCIpO1xuZnVuY3Rpb24gdHJhdmVyc2VFZGdlKHBvaW50cykge1xuICBsZXQgcHJldlBvaW50O1xuICBsZXQgdG90YWxEaXN0YW5jZSA9IDA7XG4gIHBvaW50cy5mb3JFYWNoKChwb2ludCkgPT4ge1xuICAgIHRvdGFsRGlzdGFuY2UgKz0gZGlzdGFuY2UocG9pbnQsIHByZXZQb2ludCk7XG4gICAgcHJldlBvaW50ID0gcG9pbnQ7XG4gIH0pO1xuICBjb25zdCByZW1haW5pbmdEaXN0YW5jZSA9IHRvdGFsRGlzdGFuY2UgLyAyO1xuICByZXR1cm4gY2FsY3VsYXRlUG9pbnQocG9pbnRzLCByZW1haW5pbmdEaXN0YW5jZSk7XG59XG5fX25hbWUodHJhdmVyc2VFZGdlLCBcInRyYXZlcnNlRWRnZVwiKTtcbmZ1bmN0aW9uIGNhbGNMYWJlbFBvc2l0aW9uKHBvaW50cykge1xuICBpZiAocG9pbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBwb2ludHNbMF07XG4gIH1cbiAgcmV0dXJuIHRyYXZlcnNlRWRnZShwb2ludHMpO1xufVxuX19uYW1lKGNhbGNMYWJlbFBvc2l0aW9uLCBcImNhbGNMYWJlbFBvc2l0aW9uXCIpO1xudmFyIHJvdW5kTnVtYmVyID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgobnVtLCBwcmVjaXNpb24gPSAyKSA9PiB7XG4gIGNvbnN0IGZhY3RvciA9IE1hdGgucG93KDEwLCBwcmVjaXNpb24pO1xuICByZXR1cm4gTWF0aC5yb3VuZChudW0gKiBmYWN0b3IpIC8gZmFjdG9yO1xufSwgXCJyb3VuZE51bWJlclwiKTtcbnZhciBjYWxjdWxhdGVQb2ludCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKHBvaW50cywgZGlzdGFuY2VUb1RyYXZlcnNlKSA9PiB7XG4gIGxldCBwcmV2UG9pbnQgPSB2b2lkIDA7XG4gIGxldCByZW1haW5pbmdEaXN0YW5jZSA9IGRpc3RhbmNlVG9UcmF2ZXJzZTtcbiAgZm9yIChjb25zdCBwb2ludCBvZiBwb2ludHMpIHtcbiAgICBpZiAocHJldlBvaW50KSB7XG4gICAgICBjb25zdCB2ZWN0b3JEaXN0YW5jZSA9IGRpc3RhbmNlKHBvaW50LCBwcmV2UG9pbnQpO1xuICAgICAgaWYgKHZlY3RvckRpc3RhbmNlID09PSAwKSB7XG4gICAgICAgIHJldHVybiBwcmV2UG9pbnQ7XG4gICAgICB9XG4gICAgICBpZiAodmVjdG9yRGlzdGFuY2UgPCByZW1haW5pbmdEaXN0YW5jZSkge1xuICAgICAgICByZW1haW5pbmdEaXN0YW5jZSAtPSB2ZWN0b3JEaXN0YW5jZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGRpc3RhbmNlUmF0aW8gPSByZW1haW5pbmdEaXN0YW5jZSAvIHZlY3RvckRpc3RhbmNlO1xuICAgICAgICBpZiAoZGlzdGFuY2VSYXRpbyA8PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIHByZXZQb2ludDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGlzdGFuY2VSYXRpbyA+PSAxKSB7XG4gICAgICAgICAgcmV0dXJuIHsgeDogcG9pbnQueCwgeTogcG9pbnQueSB9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChkaXN0YW5jZVJhdGlvID4gMCAmJiBkaXN0YW5jZVJhdGlvIDwgMSkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiByb3VuZE51bWJlcigoMSAtIGRpc3RhbmNlUmF0aW8pICogcHJldlBvaW50LnggKyBkaXN0YW5jZVJhdGlvICogcG9pbnQueCwgNSksXG4gICAgICAgICAgICB5OiByb3VuZE51bWJlcigoMSAtIGRpc3RhbmNlUmF0aW8pICogcHJldlBvaW50LnkgKyBkaXN0YW5jZVJhdGlvICogcG9pbnQueSwgNSlcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHByZXZQb2ludCA9IHBvaW50O1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCBmaW5kIGEgc3VpdGFibGUgcG9pbnQgZm9yIHRoZSBnaXZlbiBkaXN0YW5jZVwiKTtcbn0sIFwiY2FsY3VsYXRlUG9pbnRcIik7XG52YXIgY2FsY0NhcmRpbmFsaXR5UG9zaXRpb24gPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChpc1JlbGF0aW9uVHlwZVByZXNlbnQsIHBvaW50cywgaW5pdGlhbFBvc2l0aW9uKSA9PiB7XG4gIGxvZy5pbmZvKGBvdXIgcG9pbnRzICR7SlNPTi5zdHJpbmdpZnkocG9pbnRzKX1gKTtcbiAgaWYgKHBvaW50c1swXSAhPT0gaW5pdGlhbFBvc2l0aW9uKSB7XG4gICAgcG9pbnRzID0gcG9pbnRzLnJldmVyc2UoKTtcbiAgfVxuICBjb25zdCBkaXN0YW5jZVRvQ2FyZGluYWxpdHlQb2ludCA9IDI1O1xuICBjb25zdCBjZW50ZXIgPSBjYWxjdWxhdGVQb2ludChwb2ludHMsIGRpc3RhbmNlVG9DYXJkaW5hbGl0eVBvaW50KTtcbiAgY29uc3QgZCA9IGlzUmVsYXRpb25UeXBlUHJlc2VudCA/IDEwIDogNTtcbiAgY29uc3QgYW5nbGUgPSBNYXRoLmF0YW4yKHBvaW50c1swXS55IC0gY2VudGVyLnksIHBvaW50c1swXS54IC0gY2VudGVyLngpO1xuICBjb25zdCBjYXJkaW5hbGl0eVBvc2l0aW9uID0geyB4OiAwLCB5OiAwIH07XG4gIGNhcmRpbmFsaXR5UG9zaXRpb24ueCA9IE1hdGguc2luKGFuZ2xlKSAqIGQgKyAocG9pbnRzWzBdLnggKyBjZW50ZXIueCkgLyAyO1xuICBjYXJkaW5hbGl0eVBvc2l0aW9uLnkgPSAtTWF0aC5jb3MoYW5nbGUpICogZCArIChwb2ludHNbMF0ueSArIGNlbnRlci55KSAvIDI7XG4gIHJldHVybiBjYXJkaW5hbGl0eVBvc2l0aW9uO1xufSwgXCJjYWxjQ2FyZGluYWxpdHlQb3NpdGlvblwiKTtcbmZ1bmN0aW9uIGNhbGNUZXJtaW5hbExhYmVsUG9zaXRpb24odGVybWluYWxNYXJrZXJTaXplLCBwb3NpdGlvbiwgX3BvaW50cykge1xuICBjb25zdCBwb2ludHMgPSBzdHJ1Y3R1cmVkQ2xvbmUoX3BvaW50cyk7XG4gIGxvZy5pbmZvKFwib3VyIHBvaW50c1wiLCBwb2ludHMpO1xuICBpZiAocG9zaXRpb24gIT09IFwic3RhcnRfbGVmdFwiICYmIHBvc2l0aW9uICE9PSBcInN0YXJ0X3JpZ2h0XCIpIHtcbiAgICBwb2ludHMucmV2ZXJzZSgpO1xuICB9XG4gIGNvbnN0IGRpc3RhbmNlVG9DYXJkaW5hbGl0eVBvaW50ID0gMjUgKyB0ZXJtaW5hbE1hcmtlclNpemU7XG4gIGNvbnN0IGNlbnRlciA9IGNhbGN1bGF0ZVBvaW50KHBvaW50cywgZGlzdGFuY2VUb0NhcmRpbmFsaXR5UG9pbnQpO1xuICBjb25zdCBkID0gMTAgKyB0ZXJtaW5hbE1hcmtlclNpemUgKiAwLjU7XG4gIGNvbnN0IGFuZ2xlID0gTWF0aC5hdGFuMihwb2ludHNbMF0ueSAtIGNlbnRlci55LCBwb2ludHNbMF0ueCAtIGNlbnRlci54KTtcbiAgY29uc3QgY2FyZGluYWxpdHlQb3NpdGlvbiA9IHsgeDogMCwgeTogMCB9O1xuICBpZiAocG9zaXRpb24gPT09IFwic3RhcnRfbGVmdFwiKSB7XG4gICAgY2FyZGluYWxpdHlQb3NpdGlvbi54ID0gTWF0aC5zaW4oYW5nbGUgKyBNYXRoLlBJKSAqIGQgKyAocG9pbnRzWzBdLnggKyBjZW50ZXIueCkgLyAyO1xuICAgIGNhcmRpbmFsaXR5UG9zaXRpb24ueSA9IC1NYXRoLmNvcyhhbmdsZSArIE1hdGguUEkpICogZCArIChwb2ludHNbMF0ueSArIGNlbnRlci55KSAvIDI7XG4gIH0gZWxzZSBpZiAocG9zaXRpb24gPT09IFwiZW5kX3JpZ2h0XCIpIHtcbiAgICBjYXJkaW5hbGl0eVBvc2l0aW9uLnggPSBNYXRoLnNpbihhbmdsZSAtIE1hdGguUEkpICogZCArIChwb2ludHNbMF0ueCArIGNlbnRlci54KSAvIDIgLSA1O1xuICAgIGNhcmRpbmFsaXR5UG9zaXRpb24ueSA9IC1NYXRoLmNvcyhhbmdsZSAtIE1hdGguUEkpICogZCArIChwb2ludHNbMF0ueSArIGNlbnRlci55KSAvIDIgLSA1O1xuICB9IGVsc2UgaWYgKHBvc2l0aW9uID09PSBcImVuZF9sZWZ0XCIpIHtcbiAgICBjYXJkaW5hbGl0eVBvc2l0aW9uLnggPSBNYXRoLnNpbihhbmdsZSkgKiBkICsgKHBvaW50c1swXS54ICsgY2VudGVyLngpIC8gMiAtIDU7XG4gICAgY2FyZGluYWxpdHlQb3NpdGlvbi55ID0gLU1hdGguY29zKGFuZ2xlKSAqIGQgKyAocG9pbnRzWzBdLnkgKyBjZW50ZXIueSkgLyAyIC0gNTtcbiAgfSBlbHNlIHtcbiAgICBjYXJkaW5hbGl0eVBvc2l0aW9uLnggPSBNYXRoLnNpbihhbmdsZSkgKiBkICsgKHBvaW50c1swXS54ICsgY2VudGVyLngpIC8gMjtcbiAgICBjYXJkaW5hbGl0eVBvc2l0aW9uLnkgPSAtTWF0aC5jb3MoYW5nbGUpICogZCArIChwb2ludHNbMF0ueSArIGNlbnRlci55KSAvIDI7XG4gIH1cbiAgcmV0dXJuIGNhcmRpbmFsaXR5UG9zaXRpb247XG59XG5fX25hbWUoY2FsY1Rlcm1pbmFsTGFiZWxQb3NpdGlvbiwgXCJjYWxjVGVybWluYWxMYWJlbFBvc2l0aW9uXCIpO1xuZnVuY3Rpb24gZ2V0U3R5bGVzRnJvbUFycmF5KGFycikge1xuICBsZXQgc3R5bGUgPSBcIlwiO1xuICBsZXQgbGFiZWxTdHlsZSA9IFwiXCI7XG4gIGZvciAoY29uc3QgZWxlbWVudCBvZiBhcnIpIHtcbiAgICBpZiAoZWxlbWVudCAhPT0gdm9pZCAwKSB7XG4gICAgICBpZiAoZWxlbWVudC5zdGFydHNXaXRoKFwiY29sb3I6XCIpIHx8IGVsZW1lbnQuc3RhcnRzV2l0aChcInRleHQtYWxpZ246XCIpKSB7XG4gICAgICAgIGxhYmVsU3R5bGUgPSBsYWJlbFN0eWxlICsgZWxlbWVudCArIFwiO1wiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3R5bGUgPSBzdHlsZSArIGVsZW1lbnQgKyBcIjtcIjtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHsgc3R5bGUsIGxhYmVsU3R5bGUgfTtcbn1cbl9fbmFtZShnZXRTdHlsZXNGcm9tQXJyYXksIFwiZ2V0U3R5bGVzRnJvbUFycmF5XCIpO1xudmFyIGNudCA9IDA7XG52YXIgZ2VuZXJhdGVJZCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKCkgPT4ge1xuICBjbnQrKztcbiAgcmV0dXJuIFwiaWQtXCIgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgMTIpICsgXCItXCIgKyBjbnQ7XG59LCBcImdlbmVyYXRlSWRcIik7XG5mdW5jdGlvbiBtYWtlUmFuZG9tSGV4KGxlbmd0aCkge1xuICBsZXQgcmVzdWx0ID0gXCJcIjtcbiAgY29uc3QgY2hhcmFjdGVycyA9IFwiMDEyMzQ1Njc4OWFiY2RlZlwiO1xuICBjb25zdCBjaGFyYWN0ZXJzTGVuZ3RoID0gY2hhcmFjdGVycy5sZW5ndGg7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICByZXN1bHQgKz0gY2hhcmFjdGVycy5jaGFyQXQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2hhcmFjdGVyc0xlbmd0aCkpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5fX25hbWUobWFrZVJhbmRvbUhleCwgXCJtYWtlUmFuZG9tSGV4XCIpO1xudmFyIHJhbmRvbSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKG9wdGlvbnMpID0+IHtcbiAgcmV0dXJuIG1ha2VSYW5kb21IZXgob3B0aW9ucy5sZW5ndGgpO1xufSwgXCJyYW5kb21cIik7XG52YXIgZ2V0VGV4dE9iaiA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgeDogMCxcbiAgICB5OiAwLFxuICAgIGZpbGw6IHZvaWQgMCxcbiAgICBhbmNob3I6IFwic3RhcnRcIixcbiAgICBzdHlsZTogXCIjNjY2XCIsXG4gICAgd2lkdGg6IDEwMCxcbiAgICBoZWlnaHQ6IDEwMCxcbiAgICB0ZXh0TWFyZ2luOiAwLFxuICAgIHJ4OiAwLFxuICAgIHJ5OiAwLFxuICAgIHZhbGlnbjogdm9pZCAwLFxuICAgIHRleHQ6IFwiXCJcbiAgfTtcbn0sIFwiZ2V0VGV4dE9ialwiKTtcbnZhciBkcmF3U2ltcGxlVGV4dCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oZWxlbSwgdGV4dERhdGEpIHtcbiAgY29uc3QgblRleHQgPSB0ZXh0RGF0YS50ZXh0LnJlcGxhY2UoY29tbW9uX2RlZmF1bHQubGluZUJyZWFrUmVnZXgsIFwiIFwiKTtcbiAgY29uc3QgWywgX2ZvbnRTaXplUHhdID0gcGFyc2VGb250U2l6ZSh0ZXh0RGF0YS5mb250U2l6ZSk7XG4gIGNvbnN0IHRleHRFbGVtID0gZWxlbS5hcHBlbmQoXCJ0ZXh0XCIpO1xuICB0ZXh0RWxlbS5hdHRyKFwieFwiLCB0ZXh0RGF0YS54KTtcbiAgdGV4dEVsZW0uYXR0cihcInlcIiwgdGV4dERhdGEueSk7XG4gIHRleHRFbGVtLnN0eWxlKFwidGV4dC1hbmNob3JcIiwgdGV4dERhdGEuYW5jaG9yKTtcbiAgdGV4dEVsZW0uc3R5bGUoXCJmb250LWZhbWlseVwiLCB0ZXh0RGF0YS5mb250RmFtaWx5KTtcbiAgdGV4dEVsZW0uc3R5bGUoXCJmb250LXNpemVcIiwgX2ZvbnRTaXplUHgpO1xuICB0ZXh0RWxlbS5zdHlsZShcImZvbnQtd2VpZ2h0XCIsIHRleHREYXRhLmZvbnRXZWlnaHQpO1xuICB0ZXh0RWxlbS5hdHRyKFwiZmlsbFwiLCB0ZXh0RGF0YS5maWxsKTtcbiAgaWYgKHRleHREYXRhLmNsYXNzICE9PSB2b2lkIDApIHtcbiAgICB0ZXh0RWxlbS5hdHRyKFwiY2xhc3NcIiwgdGV4dERhdGEuY2xhc3MpO1xuICB9XG4gIGNvbnN0IHNwYW4gPSB0ZXh0RWxlbS5hcHBlbmQoXCJ0c3BhblwiKTtcbiAgc3Bhbi5hdHRyKFwieFwiLCB0ZXh0RGF0YS54ICsgdGV4dERhdGEudGV4dE1hcmdpbiAqIDIpO1xuICBzcGFuLmF0dHIoXCJmaWxsXCIsIHRleHREYXRhLmZpbGwpO1xuICBzcGFuLnRleHQoblRleHQpO1xuICByZXR1cm4gdGV4dEVsZW07XG59LCBcImRyYXdTaW1wbGVUZXh0XCIpO1xudmFyIHdyYXBMYWJlbCA9IG1lbW9pemUoXG4gIChsYWJlbCwgbWF4V2lkdGgsIGNvbmZpZykgPT4ge1xuICAgIGlmICghbGFiZWwpIHtcbiAgICAgIHJldHVybiBsYWJlbDtcbiAgICB9XG4gICAgY29uZmlnID0gT2JqZWN0LmFzc2lnbihcbiAgICAgIHsgZm9udFNpemU6IDEyLCBmb250V2VpZ2h0OiA0MDAsIGZvbnRGYW1pbHk6IFwiQXJpYWxcIiwgam9pbldpdGg6IFwiPGJyLz5cIiB9LFxuICAgICAgY29uZmlnXG4gICAgKTtcbiAgICBpZiAoY29tbW9uX2RlZmF1bHQubGluZUJyZWFrUmVnZXgudGVzdChsYWJlbCkpIHtcbiAgICAgIHJldHVybiBsYWJlbDtcbiAgICB9XG4gICAgY29uc3Qgd29yZHMgPSBsYWJlbC5zcGxpdChcIiBcIikuZmlsdGVyKEJvb2xlYW4pO1xuICAgIGNvbnN0IGNvbXBsZXRlZExpbmVzID0gW107XG4gICAgbGV0IG5leHRMaW5lID0gXCJcIjtcbiAgICB3b3Jkcy5mb3JFYWNoKCh3b3JkLCBpbmRleCkgPT4ge1xuICAgICAgY29uc3Qgd29yZExlbmd0aCA9IGNhbGN1bGF0ZVRleHRXaWR0aChgJHt3b3JkfSBgLCBjb25maWcpO1xuICAgICAgY29uc3QgbmV4dExpbmVMZW5ndGggPSBjYWxjdWxhdGVUZXh0V2lkdGgobmV4dExpbmUsIGNvbmZpZyk7XG4gICAgICBpZiAod29yZExlbmd0aCA+IG1heFdpZHRoKSB7XG4gICAgICAgIGNvbnN0IHsgaHlwaGVuYXRlZFN0cmluZ3MsIHJlbWFpbmluZ1dvcmQgfSA9IGJyZWFrU3RyaW5nKHdvcmQsIG1heFdpZHRoLCBcIi1cIiwgY29uZmlnKTtcbiAgICAgICAgY29tcGxldGVkTGluZXMucHVzaChuZXh0TGluZSwgLi4uaHlwaGVuYXRlZFN0cmluZ3MpO1xuICAgICAgICBuZXh0TGluZSA9IHJlbWFpbmluZ1dvcmQ7XG4gICAgICB9IGVsc2UgaWYgKG5leHRMaW5lTGVuZ3RoICsgd29yZExlbmd0aCA+PSBtYXhXaWR0aCkge1xuICAgICAgICBjb21wbGV0ZWRMaW5lcy5wdXNoKG5leHRMaW5lKTtcbiAgICAgICAgbmV4dExpbmUgPSB3b3JkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV4dExpbmUgPSBbbmV4dExpbmUsIHdvcmRdLmZpbHRlcihCb29sZWFuKS5qb2luKFwiIFwiKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGN1cnJlbnRXb3JkID0gaW5kZXggKyAxO1xuICAgICAgY29uc3QgaXNMYXN0V29yZCA9IGN1cnJlbnRXb3JkID09PSB3b3Jkcy5sZW5ndGg7XG4gICAgICBpZiAoaXNMYXN0V29yZCkge1xuICAgICAgICBjb21wbGV0ZWRMaW5lcy5wdXNoKG5leHRMaW5lKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gY29tcGxldGVkTGluZXMuZmlsdGVyKChsaW5lKSA9PiBsaW5lICE9PSBcIlwiKS5qb2luKGNvbmZpZy5qb2luV2l0aCk7XG4gIH0sXG4gIChsYWJlbCwgbWF4V2lkdGgsIGNvbmZpZykgPT4gYCR7bGFiZWx9JHttYXhXaWR0aH0ke2NvbmZpZy5mb250U2l6ZX0ke2NvbmZpZy5mb250V2VpZ2h0fSR7Y29uZmlnLmZvbnRGYW1pbHl9JHtjb25maWcuam9pbldpdGh9YFxuKTtcbnZhciBicmVha1N0cmluZyA9IG1lbW9pemUoXG4gICh3b3JkLCBtYXhXaWR0aCwgaHlwaGVuQ2hhcmFjdGVyID0gXCItXCIsIGNvbmZpZykgPT4ge1xuICAgIGNvbmZpZyA9IE9iamVjdC5hc3NpZ24oXG4gICAgICB7IGZvbnRTaXplOiAxMiwgZm9udFdlaWdodDogNDAwLCBmb250RmFtaWx5OiBcIkFyaWFsXCIsIG1hcmdpbjogMCB9LFxuICAgICAgY29uZmlnXG4gICAgKTtcbiAgICBjb25zdCBjaGFyYWN0ZXJzID0gWy4uLndvcmRdO1xuICAgIGNvbnN0IGxpbmVzID0gW107XG4gICAgbGV0IGN1cnJlbnRMaW5lID0gXCJcIjtcbiAgICBjaGFyYWN0ZXJzLmZvckVhY2goKGNoYXJhY3RlciwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IG5leHRMaW5lID0gYCR7Y3VycmVudExpbmV9JHtjaGFyYWN0ZXJ9YDtcbiAgICAgIGNvbnN0IGxpbmVXaWR0aCA9IGNhbGN1bGF0ZVRleHRXaWR0aChuZXh0TGluZSwgY29uZmlnKTtcbiAgICAgIGlmIChsaW5lV2lkdGggPj0gbWF4V2lkdGgpIHtcbiAgICAgICAgY29uc3QgY3VycmVudENoYXJhY3RlciA9IGluZGV4ICsgMTtcbiAgICAgICAgY29uc3QgaXNMYXN0TGluZSA9IGNoYXJhY3RlcnMubGVuZ3RoID09PSBjdXJyZW50Q2hhcmFjdGVyO1xuICAgICAgICBjb25zdCBoeXBoZW5hdGVkTmV4dExpbmUgPSBgJHtuZXh0TGluZX0ke2h5cGhlbkNoYXJhY3Rlcn1gO1xuICAgICAgICBsaW5lcy5wdXNoKGlzTGFzdExpbmUgPyBuZXh0TGluZSA6IGh5cGhlbmF0ZWROZXh0TGluZSk7XG4gICAgICAgIGN1cnJlbnRMaW5lID0gXCJcIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN1cnJlbnRMaW5lID0gbmV4dExpbmU7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHsgaHlwaGVuYXRlZFN0cmluZ3M6IGxpbmVzLCByZW1haW5pbmdXb3JkOiBjdXJyZW50TGluZSB9O1xuICB9LFxuICAod29yZCwgbWF4V2lkdGgsIGh5cGhlbkNoYXJhY3RlciA9IFwiLVwiLCBjb25maWcpID0+IGAke3dvcmR9JHttYXhXaWR0aH0ke2h5cGhlbkNoYXJhY3Rlcn0ke2NvbmZpZy5mb250U2l6ZX0ke2NvbmZpZy5mb250V2VpZ2h0fSR7Y29uZmlnLmZvbnRGYW1pbHl9YFxuKTtcbmZ1bmN0aW9uIGNhbGN1bGF0ZVRleHRIZWlnaHQodGV4dCwgY29uZmlnKSB7XG4gIHJldHVybiBjYWxjdWxhdGVUZXh0RGltZW5zaW9ucyh0ZXh0LCBjb25maWcpLmhlaWdodDtcbn1cbl9fbmFtZShjYWxjdWxhdGVUZXh0SGVpZ2h0LCBcImNhbGN1bGF0ZVRleHRIZWlnaHRcIik7XG5mdW5jdGlvbiBjYWxjdWxhdGVUZXh0V2lkdGgodGV4dCwgY29uZmlnKSB7XG4gIHJldHVybiBjYWxjdWxhdGVUZXh0RGltZW5zaW9ucyh0ZXh0LCBjb25maWcpLndpZHRoO1xufVxuX19uYW1lKGNhbGN1bGF0ZVRleHRXaWR0aCwgXCJjYWxjdWxhdGVUZXh0V2lkdGhcIik7XG52YXIgY2FsY3VsYXRlVGV4dERpbWVuc2lvbnMgPSBtZW1vaXplKFxuICAodGV4dCwgY29uZmlnKSA9PiB7XG4gICAgY29uc3QgeyBmb250U2l6ZSA9IDEyLCBmb250RmFtaWx5ID0gXCJBcmlhbFwiLCBmb250V2VpZ2h0ID0gNDAwIH0gPSBjb25maWc7XG4gICAgaWYgKCF0ZXh0KSB7XG4gICAgICByZXR1cm4geyB3aWR0aDogMCwgaGVpZ2h0OiAwIH07XG4gICAgfVxuICAgIGNvbnN0IFssIF9mb250U2l6ZVB4XSA9IHBhcnNlRm9udFNpemUoZm9udFNpemUpO1xuICAgIGNvbnN0IGZvbnRGYW1pbGllcyA9IFtcInNhbnMtc2VyaWZcIiwgZm9udEZhbWlseV07XG4gICAgY29uc3QgbGluZXMgPSB0ZXh0LnNwbGl0KGNvbW1vbl9kZWZhdWx0LmxpbmVCcmVha1JlZ2V4KTtcbiAgICBjb25zdCBkaW1zID0gW107XG4gICAgY29uc3QgYm9keSA9IHNlbGVjdChcImJvZHlcIik7XG4gICAgaWYgKCFib2R5LnJlbW92ZSkge1xuICAgICAgcmV0dXJuIHsgd2lkdGg6IDAsIGhlaWdodDogMCwgbGluZUhlaWdodDogMCB9O1xuICAgIH1cbiAgICBjb25zdCBnID0gYm9keS5hcHBlbmQoXCJzdmdcIik7XG4gICAgZm9yIChjb25zdCBmb250RmFtaWx5MiBvZiBmb250RmFtaWxpZXMpIHtcbiAgICAgIGxldCBjSGVpZ2h0ID0gMDtcbiAgICAgIGNvbnN0IGRpbSA9IHsgd2lkdGg6IDAsIGhlaWdodDogMCwgbGluZUhlaWdodDogMCB9O1xuICAgICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICAgIGNvbnN0IHRleHRPYmogPSBnZXRUZXh0T2JqKCk7XG4gICAgICAgIHRleHRPYmoudGV4dCA9IGxpbmUgfHwgWkVST19XSURUSF9TUEFDRTtcbiAgICAgICAgY29uc3QgdGV4dEVsZW0gPSBkcmF3U2ltcGxlVGV4dChnLCB0ZXh0T2JqKS5zdHlsZShcImZvbnQtc2l6ZVwiLCBfZm9udFNpemVQeCkuc3R5bGUoXCJmb250LXdlaWdodFwiLCBmb250V2VpZ2h0KS5zdHlsZShcImZvbnQtZmFtaWx5XCIsIGZvbnRGYW1pbHkyKTtcbiAgICAgICAgY29uc3QgYkJveCA9ICh0ZXh0RWxlbS5fZ3JvdXBzIHx8IHRleHRFbGVtKVswXVswXS5nZXRCQm94KCk7XG4gICAgICAgIGlmIChiQm94LndpZHRoID09PSAwICYmIGJCb3guaGVpZ2h0ID09PSAwKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwic3ZnIGVsZW1lbnQgbm90IGluIHJlbmRlciB0cmVlXCIpO1xuICAgICAgICB9XG4gICAgICAgIGRpbS53aWR0aCA9IE1hdGgucm91bmQoTWF0aC5tYXgoZGltLndpZHRoLCBiQm94LndpZHRoKSk7XG4gICAgICAgIGNIZWlnaHQgPSBNYXRoLnJvdW5kKGJCb3guaGVpZ2h0KTtcbiAgICAgICAgZGltLmhlaWdodCArPSBjSGVpZ2h0O1xuICAgICAgICBkaW0ubGluZUhlaWdodCA9IE1hdGgucm91bmQoTWF0aC5tYXgoZGltLmxpbmVIZWlnaHQsIGNIZWlnaHQpKTtcbiAgICAgIH1cbiAgICAgIGRpbXMucHVzaChkaW0pO1xuICAgIH1cbiAgICBnLnJlbW92ZSgpO1xuICAgIGNvbnN0IGluZGV4ID0gaXNOYU4oZGltc1sxXS5oZWlnaHQpIHx8IGlzTmFOKGRpbXNbMV0ud2lkdGgpIHx8IGlzTmFOKGRpbXNbMV0ubGluZUhlaWdodCkgfHwgZGltc1swXS5oZWlnaHQgPiBkaW1zWzFdLmhlaWdodCAmJiBkaW1zWzBdLndpZHRoID4gZGltc1sxXS53aWR0aCAmJiBkaW1zWzBdLmxpbmVIZWlnaHQgPiBkaW1zWzFdLmxpbmVIZWlnaHQgPyAwIDogMTtcbiAgICByZXR1cm4gZGltc1tpbmRleF07XG4gIH0sXG4gICh0ZXh0LCBjb25maWcpID0+IGAke3RleHR9JHtjb25maWcuZm9udFNpemV9JHtjb25maWcuZm9udFdlaWdodH0ke2NvbmZpZy5mb250RmFtaWx5fWBcbik7XG52YXIgSW5pdElER2VuZXJhdG9yID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihkZXRlcm1pbmlzdGljID0gZmFsc2UsIHNlZWQpIHtcbiAgICB0aGlzLmNvdW50ID0gMDtcbiAgICB0aGlzLmNvdW50ID0gc2VlZCA/IHNlZWQubGVuZ3RoIDogMDtcbiAgICB0aGlzLm5leHQgPSBkZXRlcm1pbmlzdGljID8gKCkgPT4gdGhpcy5jb3VudCsrIDogKCkgPT4gRGF0ZS5ub3coKTtcbiAgfVxuICBzdGF0aWMge1xuICAgIF9fbmFtZSh0aGlzLCBcIkluaXRJREdlbmVyYXRvclwiKTtcbiAgfVxufTtcbnZhciBkZWNvZGVyO1xudmFyIGVudGl0eURlY29kZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oaHRtbCkge1xuICBkZWNvZGVyID0gZGVjb2RlciB8fCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBodG1sID0gZXNjYXBlKGh0bWwpLnJlcGxhY2UoLyUyNi9nLCBcIiZcIikucmVwbGFjZSgvJTIzL2csIFwiI1wiKS5yZXBsYWNlKC8lM0IvZywgXCI7XCIpO1xuICBkZWNvZGVyLmlubmVySFRNTCA9IGh0bWw7XG4gIHJldHVybiB1bmVzY2FwZShkZWNvZGVyLnRleHRDb250ZW50KTtcbn0sIFwiZW50aXR5RGVjb2RlXCIpO1xuZnVuY3Rpb24gaXNEZXRhaWxlZEVycm9yKGVycm9yKSB7XG4gIHJldHVybiBcInN0clwiIGluIGVycm9yO1xufVxuX19uYW1lKGlzRGV0YWlsZWRFcnJvciwgXCJpc0RldGFpbGVkRXJyb3JcIik7XG52YXIgaW5zZXJ0VGl0bGUgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChwYXJlbnQsIGNzc0NsYXNzLCB0aXRsZVRvcE1hcmdpbiwgdGl0bGUpID0+IHtcbiAgaWYgKCF0aXRsZSkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBib3VuZHMgPSBwYXJlbnQubm9kZSgpPy5nZXRCQm94KCk7XG4gIGlmICghYm91bmRzKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHBhcmVudC5hcHBlbmQoXCJ0ZXh0XCIpLnRleHQodGl0bGUpLmF0dHIoXCJ0ZXh0LWFuY2hvclwiLCBcIm1pZGRsZVwiKS5hdHRyKFwieFwiLCBib3VuZHMueCArIGJvdW5kcy53aWR0aCAvIDIpLmF0dHIoXCJ5XCIsIC10aXRsZVRvcE1hcmdpbikuYXR0cihcImNsYXNzXCIsIGNzc0NsYXNzKTtcbn0sIFwiaW5zZXJ0VGl0bGVcIik7XG52YXIgcGFyc2VGb250U2l6ZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGZvbnRTaXplKSA9PiB7XG4gIGlmICh0eXBlb2YgZm9udFNpemUgPT09IFwibnVtYmVyXCIpIHtcbiAgICByZXR1cm4gW2ZvbnRTaXplLCBmb250U2l6ZSArIFwicHhcIl07XG4gIH1cbiAgY29uc3QgZm9udFNpemVOdW1iZXIgPSBwYXJzZUludChmb250U2l6ZSA/PyBcIlwiLCAxMCk7XG4gIGlmIChOdW1iZXIuaXNOYU4oZm9udFNpemVOdW1iZXIpKSB7XG4gICAgcmV0dXJuIFt2b2lkIDAsIHZvaWQgMF07XG4gIH0gZWxzZSBpZiAoZm9udFNpemUgPT09IFN0cmluZyhmb250U2l6ZU51bWJlcikpIHtcbiAgICByZXR1cm4gW2ZvbnRTaXplTnVtYmVyLCBmb250U2l6ZSArIFwicHhcIl07XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIFtmb250U2l6ZU51bWJlciwgZm9udFNpemVdO1xuICB9XG59LCBcInBhcnNlRm9udFNpemVcIik7XG5mdW5jdGlvbiBjbGVhbkFuZE1lcmdlKGRlZmF1bHREYXRhLCBkYXRhKSB7XG4gIHJldHVybiBtZXJnZSh7fSwgZGVmYXVsdERhdGEsIGRhdGEpO1xufVxuX19uYW1lKGNsZWFuQW5kTWVyZ2UsIFwiY2xlYW5BbmRNZXJnZVwiKTtcbnZhciB1dGlsc19kZWZhdWx0ID0ge1xuICBhc3NpZ25XaXRoRGVwdGg6IGFzc2lnbldpdGhEZXB0aF9kZWZhdWx0LFxuICB3cmFwTGFiZWwsXG4gIGNhbGN1bGF0ZVRleHRIZWlnaHQsXG4gIGNhbGN1bGF0ZVRleHRXaWR0aCxcbiAgY2FsY3VsYXRlVGV4dERpbWVuc2lvbnMsXG4gIGNsZWFuQW5kTWVyZ2UsXG4gIGRldGVjdEluaXQsXG4gIGRldGVjdERpcmVjdGl2ZSxcbiAgaXNTdWJzdHJpbmdJbkFycmF5LFxuICBpbnRlcnBvbGF0ZVRvQ3VydmUsXG4gIGNhbGNMYWJlbFBvc2l0aW9uLFxuICBjYWxjQ2FyZGluYWxpdHlQb3NpdGlvbixcbiAgY2FsY1Rlcm1pbmFsTGFiZWxQb3NpdGlvbixcbiAgZm9ybWF0VXJsLFxuICBnZXRTdHlsZXNGcm9tQXJyYXksXG4gIGdlbmVyYXRlSWQsXG4gIHJhbmRvbSxcbiAgcnVuRnVuYyxcbiAgZW50aXR5RGVjb2RlLFxuICBpbnNlcnRUaXRsZSxcbiAgaXNMYWJlbENvb3JkaW5hdGVJblBhdGgsXG4gIHBhcnNlRm9udFNpemUsXG4gIEluaXRJREdlbmVyYXRvclxufTtcbnZhciBlbmNvZGVFbnRpdGllcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24odGV4dCkge1xuICBsZXQgdHh0ID0gdGV4dDtcbiAgdHh0ID0gdHh0LnJlcGxhY2UoL3N0eWxlLio6XFxTKiMuKjsvZywgZnVuY3Rpb24ocykge1xuICAgIHJldHVybiBzLnN1YnN0cmluZygwLCBzLmxlbmd0aCAtIDEpO1xuICB9KTtcbiAgdHh0ID0gdHh0LnJlcGxhY2UoL2NsYXNzRGVmLio6XFxTKiMuKjsvZywgZnVuY3Rpb24ocykge1xuICAgIHJldHVybiBzLnN1YnN0cmluZygwLCBzLmxlbmd0aCAtIDEpO1xuICB9KTtcbiAgdHh0ID0gdHh0LnJlcGxhY2UoLyNcXHcrOy9nLCBmdW5jdGlvbihzKSB7XG4gICAgY29uc3QgaW5uZXJUeHQgPSBzLnN1YnN0cmluZygxLCBzLmxlbmd0aCAtIDEpO1xuICAgIGNvbnN0IGlzSW50ID0gL15cXCs/XFxkKyQvLnRlc3QoaW5uZXJUeHQpO1xuICAgIGlmIChpc0ludCkge1xuICAgICAgcmV0dXJuIFwiXFx1RkIwMlxceEIwXFx4QjBcIiArIGlubmVyVHh0ICsgXCJcXHhCNlxceERGXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBcIlxcdUZCMDJcXHhCMFwiICsgaW5uZXJUeHQgKyBcIlxceEI2XFx4REZcIjtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gdHh0O1xufSwgXCJlbmNvZGVFbnRpdGllc1wiKTtcbnZhciBkZWNvZGVFbnRpdGllcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gdGV4dC5yZXBsYWNlKC/vrILCsMKwL2csIFwiJiNcIikucmVwbGFjZSgv76yCwrAvZywgXCImXCIpLnJlcGxhY2UoL8K2w58vZywgXCI7XCIpO1xufSwgXCJkZWNvZGVFbnRpdGllc1wiKTtcbnZhciBnZXRFZGdlSWQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChmcm9tLCB0bywge1xuICBjb3VudGVyID0gMCxcbiAgcHJlZml4LFxuICBzdWZmaXhcbn0sIGlkKSA9PiB7XG4gIGlmIChpZCkge1xuICAgIHJldHVybiBpZDtcbiAgfVxuICByZXR1cm4gYCR7cHJlZml4ID8gYCR7cHJlZml4fV9gIDogXCJcIn0ke2Zyb219XyR7dG99XyR7Y291bnRlcn0ke3N1ZmZpeCA/IGBfJHtzdWZmaXh9YCA6IFwiXCJ9YDtcbn0sIFwiZ2V0RWRnZUlkXCIpO1xuZnVuY3Rpb24gaGFuZGxlVW5kZWZpbmVkQXR0cihhdHRyVmFsdWUpIHtcbiAgcmV0dXJuIGF0dHJWYWx1ZSA/PyBudWxsO1xufVxuX19uYW1lKGhhbmRsZVVuZGVmaW5lZEF0dHIsIFwiaGFuZGxlVW5kZWZpbmVkQXR0clwiKTtcbmZ1bmN0aW9uIGlzTGFiZWxDb29yZGluYXRlSW5QYXRoKHBvaW50LCBkQXR0cikge1xuICBjb25zdCByb3VuZGVkWCA9IE1hdGgucm91bmQocG9pbnQueCk7XG4gIGNvbnN0IHJvdW5kZWRZID0gTWF0aC5yb3VuZChwb2ludC55KTtcbiAgY29uc3Qgc2FuaXRpemVkRCA9IGRBdHRyLnJlcGxhY2UoXG4gICAgLyhcXGQrXFwuXFxkKykvZyxcbiAgICAobWF0Y2gpID0+IE1hdGgucm91bmQocGFyc2VGbG9hdChtYXRjaCkpLnRvU3RyaW5nKClcbiAgKTtcbiAgcmV0dXJuIHNhbml0aXplZEQuaW5jbHVkZXMocm91bmRlZFgudG9TdHJpbmcoKSkgfHwgc2FuaXRpemVkRC5pbmNsdWRlcyhyb3VuZGVkWS50b1N0cmluZygpKTtcbn1cbl9fbmFtZShpc0xhYmVsQ29vcmRpbmF0ZUluUGF0aCwgXCJpc0xhYmVsQ29vcmRpbmF0ZUluUGF0aFwiKTtcblxuZXhwb3J0IHtcbiAgWkVST19XSURUSF9TUEFDRSxcbiAgcmVtb3ZlRGlyZWN0aXZlcyxcbiAgaW50ZXJwb2xhdGVUb0N1cnZlLFxuICBnZXRTdHlsZXNGcm9tQXJyYXksXG4gIGdlbmVyYXRlSWQsXG4gIHJhbmRvbSxcbiAgd3JhcExhYmVsLFxuICBjYWxjdWxhdGVUZXh0SGVpZ2h0LFxuICBjYWxjdWxhdGVUZXh0V2lkdGgsXG4gIGNhbGN1bGF0ZVRleHREaW1lbnNpb25zLFxuICBpc0RldGFpbGVkRXJyb3IsXG4gIHBhcnNlRm9udFNpemUsXG4gIGNsZWFuQW5kTWVyZ2UsXG4gIHV0aWxzX2RlZmF1bHQsXG4gIGVuY29kZUVudGl0aWVzLFxuICBkZWNvZGVFbnRpdGllcyxcbiAgZ2V0RWRnZUlkLFxuICBoYW5kbGVVbmRlZmluZWRBdHRyXG59O1xuIgogIF0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTZCQSxTQUFTLFdBQVcsQ0FBQyxPQUFPO0FBQUEsRUFDM0IsT0FBTyxTQUFTLFFBQVEsT0FBTyxVQUFVLFlBQVksT0FBTyxVQUFVO0FBQUE7OztBQ3RCdkUsU0FBUyxNQUFNLENBQUMsT0FBTztBQUFBLEVBQ3RCLElBQUksU0FBUztBQUFBLElBQU0sT0FBTyxVQUFlLFlBQUksdUJB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aUNBQWlDLE9BQU8sUUFBUSxDQUFDLE1BQU07QUFBQSxFQUN6RCxJQUFJLE1BQU07QUFBQSxFQUNWLE1BQU0sSUFBSSxRQUFRLG9CQUFvQixRQUFRLENBQUMsR0FBRztBQUFBLElBQ2hELE9BQU8sRUFBRSxVQUFVLEdBQUcsRUFBRSxTQUFTLENBQUM7QUFBQSxHQUNuQztBQUFBLEVBQ0QsTUFBTSxJQUFJLFFBQVEsdUJBQXVCLFFBQVEsQ0FBQyxHQUFHO0FBQUEsSUFDbkQsT0FBTyxFQUFFLFVBQVUsR0FBRyxFQUFFLFNBQVMsQ0FBQztBQUFBLEdBQ25DO0FBQUEsRUFDRCxNQUFNLElBQUksUUFBUSxVQUFVLFFBQVEsQ0FBQyxHQUFHO0FBQUEsSUFDdEMsTUFBTSxXQUFXLEVBQUUsVUFBVSxHQUFHLEVBQUUsU0FBUyxDQUFDO0FBQUEsSUFDNUMsTUFBTSxRQUFRLFdBQVcsS0FBSyxRQUFRO0FBQUEsSUFDdEMsSUFBSSxPQUFPO0FBQUEsTUFDVCxPQUFPLFFBQW1CLFdBQVc7QUFBQSxJQUN2QyxFQUFPO0FBQUEsTUFDTCxPQUFPLE9BQWUsV0FBVztBQUFBO0FBQUEsR0FFcEM7QUFBQSxFQUNELE9BQU87QUFBQSxHQUNOLGdCQUFnQjtBQUNuQixJQUFJLGlDQUFpQyxPQUFPLFFBQVEsQ0FBQyxNQUFNO0FBQUEsRUFDekQsT0FBTyxLQUFLLFFBQVEsUUFBTyxJQUFJLEVBQUUsUUFBUSxPQUFPLEdBQUcsRUFBRSxRQUFRLE9BQU8sR0FBRztBQUFBLEdBQ3RFLGdCQUFnQjtBQUNuQixJQUFJLDRCQUE0QixPQUFPLENBQUMsTUFBTTtBQUFBLEVBQzVDLFVBQVU7QUFBQSxFQUNWO0FBQUEsRUFDQTtBQUFBLEdBQ0MsT0FBTztBQUFBLEVBQ1IsSUFBSSxJQUFJO0FBQUEsSUFDTixPQUFPO0FBQUEsRUFDVDtBQUFBLEVBQ0EsT0FBTyxHQUFHLFNBQVMsR0FBRyxZQUFZLEtBQUssUUFBUSxNQUFNLFVBQVUsU0FBUyxJQUFJLFdBQVc7QUFBQSxHQUN0RixXQUFXO0FBQ2QsU0FBUyxtQkFBbUIsQ0FBQyxXQUFXO0FBQUEsRUFDdEMsT0FBTyxhQUFhO0FBQUE7QUFFdEIsT0FBTyxxQkFBcUIscUJBQXFCO0FBQ2pELFNBQVMsdUJBQXVCLENBQUMsT0FBTyxPQUFPO0FBQUEsRUFDN0MsTUFBTSxXQUFXLEtBQUssTUFBTSxNQUFNLENBQUM7QUFBQSxFQUNuQyxNQUFNLFdBQVcsS0FBSyxNQUFNLE1BQU0sQ0FBQztBQUFBLEVBQ25DLE1BQU0sYUFBYSxNQUFNLFFBQ3ZCLGVBQ0EsQ0FBQyxVQUFVLEtBQUssTUFBTSxXQUFXLEtBQUssQ0FBQyxFQUFFLFNBQVMsQ0FDcEQ7QUFBQSxFQUNBLE9BQU8sV0FBVyxTQUFTLFNBQVMsU0FBUyxDQUFDLEtBQUssV0FBVyxTQUFTLFNBQVMsU0FBUyxDQUFDO0FBQUE7QUFFNUYsT0FBTyx5QkFBeUIseUJBQXlCOyIsCiAgImRlYnVnSWQiOiAiOUQzNDk1QkMzNkFBNEU4MTY0NzU2RTIxNjQ3NTZFMjEiLAogICJuYW1lcyI6IFtdCn0=
