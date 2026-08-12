import {
  __export
} from "./chunk-main-g8wf8be2.js";

// node_modules/lodash-es/_freeGlobal.js
var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
var _freeGlobal_default = freeGlobal;

// node_modules/lodash-es/_root.js
var freeSelf = typeof self == "object" && self && self.Object === Object && self;
var root = _freeGlobal_default || freeSelf || Function("return this")();
var _root_default = root;

// node_modules/lodash-es/_Symbol.js
var Symbol = _root_default.Symbol;
var _Symbol_default = Symbol;

// node_modules/lodash-es/_getRawTag.js
var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
var nativeObjectToString = objectProto.toString;
var symToStringTag = _Symbol_default ? _Symbol_default.toStringTag : undefined;
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}
  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}
var _getRawTag_default = getRawTag;

// node_modules/lodash-es/_objectToString.js
var objectProto2 = Object.prototype;
var nativeObjectToString2 = objectProto2.toString;
function objectToString(value) {
  return nativeObjectToString2.call(value);
}
var _objectToString_default = objectToString;

// node_modules/lodash-es/_baseGetTag.js
var nullTag = "[object Null]";
var undefinedTag = "[object Undefined]";
var symToStringTag2 = _Symbol_default ? _Symbol_default.toStringTag : undefined;
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return symToStringTag2 && symToStringTag2 in Object(value) ? _getRawTag_default(value) : _objectToString_default(value);
}
var _baseGetTag_default = baseGetTag;

// node_modules/lodash-es/isObjectLike.js
function isObjectLike(value) {
  return value != null && typeof value == "object";
}
var isObjectLike_default = isObjectLike;

// node_modules/lodash-es/isSymbol.js
var symbolTag = "[object Symbol]";
function isSymbol(value) {
  return typeof value == "symbol" || isObjectLike_default(value) && _baseGetTag_default(value) == symbolTag;
}
var isSymbol_default = isSymbol;

// node_modules/lodash-es/_arrayMap.js
function arrayMap(array, iteratee) {
  var index = -1, length = array == null ? 0 : array.length, result = Array(length);
  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}
var _arrayMap_default = arrayMap;

// node_modules/lodash-es/isArray.js
var isArray = Array.isArray;
var isArray_default = isArray;

// node_modules/lodash-es/_baseToString.js
var INFINITY = 1 / 0;
var symbolProto = _Symbol_default ? _Symbol_default.prototype : undefined;
var symbolToString = symbolProto ? symbolProto.toString : undefined;
function baseToString(value) {
  if (typeof value == "string") {
    return value;
  }
  if (isArray_default(value)) {
    return _arrayMap_default(value, baseToString) + "";
  }
  if (isSymbol_default(value)) {
    return symbolToString ? symbolToString.call(value) : "";
  }
  var result = value + "";
  return result == "0" && 1 / value == -INFINITY ? "-0" : result;
}
var _baseToString_default = baseToString;

// node_modules/lodash-es/_trimmedEndIndex.js
var reWhitespace = /\s/;
function trimmedEndIndex(string) {
  var index = string.length;
  while (index-- && reWhitespace.test(string.charAt(index))) {}
  return index;
}
var _trimmedEndIndex_default = trimmedEndIndex;

// node_modules/lodash-es/_baseTrim.js
var reTrimStart = /^\s+/;
function baseTrim(string) {
  return string ? string.slice(0, _trimmedEndIndex_default(string) + 1).replace(reTrimStart, "") : string;
}
var _baseTrim_default = baseTrim;

// node_modules/lodash-es/isObject.js
function isObject(value) {
  var type = typeof value;
  return value != null && (type == "object" || type == "function");
}
var isObject_default = isObject;

// node_modules/lodash-es/toNumber.js
var NAN = 0 / 0;
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
var reIsBinary = /^0b[01]+$/i;
var reIsOctal = /^0o[0-7]+$/i;
var freeParseInt = parseInt;
function toNumber(value) {
  if (typeof value == "number") {
    return value;
  }
  if (isSymbol_default(value)) {
    return NAN;
  }
  if (isObject_default(value)) {
    var other = typeof value.valueOf == "function" ? value.valueOf() : value;
    value = isObject_default(other) ? other + "" : other;
  }
  if (typeof value != "string") {
    return value === 0 ? value : +value;
  }
  value = _baseTrim_default(value);
  var isBinary = reIsBinary.test(value);
  return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
}
var toNumber_default = toNumber;

// node_modules/lodash-es/toFinite.js
var INFINITY2 = 1 / 0;
var MAX_INTEGER = 179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000;
function toFinite(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = toNumber_default(value);
  if (value === INFINITY2 || value === -INFINITY2) {
    var sign = value < 0 ? -1 : 1;
    return sign * MAX_INTEGER;
  }
  return value === value ? value : 0;
}
var toFinite_default = toFinite;

// node_modules/lodash-es/toInteger.js
function toInteger(value) {
  var result = toFinite_default(value), remainder = result % 1;
  return result === result ? remainder ? result - remainder : result : 0;
}
var toInteger_default = toInteger;

// node_modules/lodash-es/identity.js
function identity(value) {
  return value;
}
var identity_default = identity;

// node_modules/lodash-es/isFunction.js
var asyncTag = "[object AsyncFunction]";
var funcTag = "[object Function]";
var genTag = "[object GeneratorFunction]";
var proxyTag = "[object Proxy]";
function isFunction(value) {
  if (!isObject_default(value)) {
    return false;
  }
  var tag = _baseGetTag_default(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}
var isFunction_default = isFunction;

// node_modules/lodash-es/_coreJsData.js
var coreJsData = _root_default["__core-js_shared__"];
var _coreJsData_default = coreJsData;

// node_modules/lodash-es/_isMasked.js
var maskSrcKey = function() {
  var uid = /[^.]+$/.exec(_coreJsData_default && _coreJsData_default.keys && _coreJsData_default.keys.IE_PROTO || "");
  return uid ? "Symbol(src)_1." + uid : "";
}();
function isMasked(func) {
  return !!maskSrcKey && maskSrcKey in func;
}
var _isMasked_default = isMasked;

// node_modules/lodash-es/_toSource.js
var funcProto = Function.prototype;
var funcToString = funcProto.toString;
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return func + "";
    } catch (e) {}
  }
  return "";
}
var _toSource_default = toSource;

// node_modules/lodash-es/_baseIsNative.js
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
var reIsHostCtor = /^\[object .+?Constructor\]$/;
var funcProto2 = Function.prototype;
var objectProto3 = Object.prototype;
var funcToString2 = funcProto2.toString;
var hasOwnProperty2 = objectProto3.hasOwnProperty;
var reIsNative = RegExp("^" + funcToString2.call(hasOwnProperty2).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
function baseIsNative(value) {
  if (!isObject_default(value) || _isMasked_default(value)) {
    return false;
  }
  var pattern = isFunction_default(value) ? reIsNative : reIsHostCtor;
  return pattern.test(_toSource_default(value));
}
var _baseIsNative_default = baseIsNative;

// node_modules/lodash-es/_getValue.js
function getValue(object, key) {
  return object == null ? undefined : object[key];
}
var _getValue_default = getValue;

// node_modules/lodash-es/_getNative.js
function getNative(object, key) {
  var value = _getValue_default(object, key);
  return _baseIsNative_default(value) ? value : undefined;
}
var _getNative_default = getNative;

// node_modules/lodash-es/_WeakMap.js
var WeakMap = _getNative_default(_root_default, "WeakMap");
var _WeakMap_default = WeakMap;

// node_modules/lodash-es/_baseCreate.js
var objectCreate = Object.create;
var baseCreate = function() {
  function object() {}
  return function(proto) {
    if (!isObject_default(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object;
    object.prototype = undefined;
    return result;
  };
}();
var _baseCreate_default = baseCreate;

// node_modules/lodash-es/_apply.js
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0:
      return func.call(thisArg);
    case 1:
      return func.call(thisArg, args[0]);
    case 2:
      return func.call(thisArg, args[0], args[1]);
    case 3:
      return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}
var _apply_default = apply;

// node_modules/lodash-es/noop.js
function noop() {}
var noop_default = noop;

// node_modules/lodash-es/_copyArray.js
function copyArray(source, array) {
  var index = -1, length = source.length;
  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}
var _copyArray_default = copyArray;

// node_modules/lodash-es/_shortOut.js
var HOT_COUNT = 800;
var HOT_SPAN = 16;
var nativeNow = Date.now;
function shortOut(func) {
  var count = 0, lastCalled = 0;
  return function() {
    var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}
var _shortOut_default = shortOut;

// node_modules/lodash-es/constant.js
function constant(value) {
  return function() {
    return value;
  };
}
var constant_default = constant;

// node_modules/lodash-es/_defineProperty.js
var defineProperty = function() {
  try {
    var func = _getNative_default(Object, "defineProperty");
    func({}, "", {});
    return func;
  } catch (e) {}
}();
var _defineProperty_default = defineProperty;

// node_modules/lodash-es/_baseSetToString.js
var baseSetToString = !_defineProperty_default ? identity_default : function(func, string) {
  return _defineProperty_default(func, "toString", {
    configurable: true,
    enumerable: false,
    value: constant_default(string),
    writable: true
  });
};
var _baseSetToString_default = baseSetToString;

// node_modules/lodash-es/_setToString.js
var setToString = _shortOut_default(_baseSetToString_default);
var _setToString_default = setToString;

// node_modules/lodash-es/_arrayEach.js
function arrayEach(array, iteratee) {
  var index = -1, length = array == null ? 0 : array.length;
  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}
var _arrayEach_default = arrayEach;

// node_modules/lodash-es/_baseFindIndex.js
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length, index = fromIndex + (fromRight ? 1 : -1);
  while (fromRight ? index-- : ++index < length) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}
var _baseFindIndex_default = baseFindIndex;

// node_modules/lodash-es/_baseIsNaN.js
function baseIsNaN(value) {
  return value !== value;
}
var _baseIsNaN_default = baseIsNaN;

// node_modules/lodash-es/_strictIndexOf.js
function strictIndexOf(array, value, fromIndex) {
  var index = fromIndex - 1, length = array.length;
  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}
var _strictIndexOf_default = strictIndexOf;

// node_modules/lodash-es/_baseIndexOf.js
function baseIndexOf(array, value, fromIndex) {
  return value === value ? _strictIndexOf_default(array, value, fromIndex) : _baseFindIndex_default(array, _baseIsNaN_default, fromIndex);
}
var _baseIndexOf_default = baseIndexOf;

// node_modules/lodash-es/_arrayIncludes.js
function arrayIncludes(array, value) {
  var length = array == null ? 0 : array.length;
  return !!length && _baseIndexOf_default(array, value, 0) > -1;
}
var _arrayIncludes_default = arrayIncludes;

// node_modules/lodash-es/_isIndex.js
var MAX_SAFE_INTEGER = 9007199254740991;
var reIsUint = /^(?:0|[1-9]\d*)$/;
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
}
var _isIndex_default = isIndex;

// node_modules/lodash-es/_baseAssignValue.js
function baseAssignValue(object, key, value) {
  if (key == "__proto__" && _defineProperty_default) {
    _defineProperty_default(object, key, {
      configurable: true,
      enumerable: true,
      value,
      writable: true
    });
  } else {
    object[key] = value;
  }
}
var _baseAssignValue_default = baseAssignValue;

// node_modules/lodash-es/eq.js
function eq(value, other) {
  return value === other || value !== value && other !== other;
}
var eq_default = eq;

// node_modules/lodash-es/_assignValue.js
var objectProto4 = Object.prototype;
var hasOwnProperty3 = objectProto4.hasOwnProperty;
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty3.call(object, key) && eq_default(objValue, value)) || value === undefined && !(key in object)) {
    _baseAssignValue_default(object, key, value);
  }
}
var _assignValue_default = assignValue;

// node_modules/lodash-es/_copyObject.js
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});
  var index = -1, length = props.length;
  while (++index < length) {
    var key = props[index];
    var newValue = customizer ? customizer(object[key], source[key], key, object, source) : undefined;
    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      _baseAssignValue_default(object, key, newValue);
    } else {
      _assignValue_default(object, key, newValue);
    }
  }
  return object;
}
var _copyObject_default = copyObject;

// node_modules/lodash-es/_overRest.js
var nativeMax = Math.max;
function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? func.length - 1 : start, 0);
  return function() {
    var args = arguments, index = -1, length = nativeMax(args.length - start, 0), array = Array(length);
    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return _apply_default(func, this, otherArgs);
  };
}
var _overRest_default = overRest;

// node_modules/lodash-es/_baseRest.js
function baseRest(func, start) {
  return _setToString_default(_overRest_default(func, start, identity_default), func + "");
}
var _baseRest_default = baseRest;

// node_modules/lodash-es/isLength.js
var MAX_SAFE_INTEGER2 = 9007199254740991;
function isLength(value) {
  return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER2;
}
var isLength_default = isLength;

// node_modules/lodash-es/isArrayLike.js
function isArrayLike(value) {
  return value != null && isLength_default(value.length) && !isFunction_default(value);
}
var isArrayLike_default = isArrayLike;

// node_modules/lodash-es/_isIterateeCall.js
function isIterateeCall(value, index, object) {
  if (!isObject_default(object)) {
    return false;
  }
  var type = typeof index;
  if (type == "number" ? isArrayLike_default(object) && _isIndex_default(index, object.length) : type == "string" && (index in object)) {
    return eq_default(object[index], value);
  }
  return false;
}
var _isIterateeCall_default = isIterateeCall;

// node_modules/lodash-es/_createAssigner.js
function createAssigner(assigner) {
  return _baseRest_default(function(object, sources) {
    var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : undefined, guard = length > 2 ? sources[2] : undefined;
    customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, customizer) : undefined;
    if (guard && _isIterateeCall_default(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}
var _createAssigner_default = createAssigner;

// node_modules/lodash-es/_isPrototype.js
var objectProto5 = Object.prototype;
function isPrototype(value) {
  var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto5;
  return value === proto;
}
var _isPrototype_default = isPrototype;

// node_modules/lodash-es/_baseTimes.js
function baseTimes(n, iteratee) {
  var index = -1, result = Array(n);
  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}
var _baseTimes_default = baseTimes;

// node_modules/lodash-es/_baseIsArguments.js
var argsTag = "[object Arguments]";
function baseIsArguments(value) {
  return isObjectLike_default(value) && _baseGetTag_default(value) == argsTag;
}
var _baseIsArguments_default = baseIsArguments;

// node_modules/lodash-es/isArguments.js
var objectProto6 = Object.prototype;
var hasOwnProperty4 = objectProto6.hasOwnProperty;
var propertyIsEnumerable = objectProto6.propertyIsEnumerable;
var isArguments = _baseIsArguments_default(function() {
  return arguments;
}()) ? _baseIsArguments_default : function(value) {
  return isObjectLike_default(value) && hasOwnProperty4.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
};
var isArguments_default = isArguments;

// node_modules/lodash-es/isBuffer.js
var exports_isBuffer = {};
__export(exports_isBuffer, {
  default: () => isBuffer_default
});

// node_modules/lodash-es/stubFalse.js
function stubFalse() {
  return false;
}
var stubFalse_default = stubFalse;

// node_modules/lodash-es/isBuffer.js
var freeExports = typeof exports_isBuffer == "object" && exports_isBuffer && !exports_isBuffer.nodeType && exports_isBuffer;
var freeModule = freeExports && typeof module_isBuffer == "object" && module_isBuffer && !module_isBuffer.nodeType && module_isBuffer;
var moduleExports = freeModule && freeModule.exports === freeExports;
var Buffer = moduleExports ? _root_default.Buffer : undefined;
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;
var isBuffer = nativeIsBuffer || stubFalse_default;
var isBuffer_default = isBuffer;

// node_modules/lodash-es/_baseIsTypedArray.js
var argsTag2 = "[object Arguments]";
var arrayTag = "[object Array]";
var boolTag = "[object Boolean]";
var dateTag = "[object Date]";
var errorTag = "[object Error]";
var funcTag2 = "[object Function]";
var mapTag = "[object Map]";
var numberTag = "[object Number]";
var objectTag = "[object Object]";
var regexpTag = "[object RegExp]";
var setTag = "[object Set]";
var stringTag = "[object String]";
var weakMapTag = "[object WeakMap]";
var arrayBufferTag = "[object ArrayBuffer]";
var dataViewTag = "[object DataView]";
var float32Tag = "[object Float32Array]";
var float64Tag = "[object Float64Array]";
var int8Tag = "[object Int8Array]";
var int16Tag = "[object Int16Array]";
var int32Tag = "[object Int32Array]";
var uint8Tag = "[object Uint8Array]";
var uint8ClampedTag = "[object Uint8ClampedArray]";
var uint16Tag = "[object Uint16Array]";
var uint32Tag = "[object Uint32Array]";
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag2] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag2] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
function baseIsTypedArray(value) {
  return isObjectLike_default(value) && isLength_default(value.length) && !!typedArrayTags[_baseGetTag_default(value)];
}
var _baseIsTypedArray_default = baseIsTypedArray;

// node_modules/lodash-es/_baseUnary.js
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}
var _baseUnary_default = baseUnary;

// node_modules/lodash-es/_nodeUtil.js
var exports__nodeUtil = {};
__export(exports__nodeUtil, {
  default: () => _nodeUtil_default
});
var freeExports2 = typeof exports__nodeUtil == "object" && exports__nodeUtil && !exports__nodeUtil.nodeType && exports__nodeUtil;
var freeModule2 = freeExports2 && typeof module__nodeUtil == "object" && module__nodeUtil && !module__nodeUtil.nodeType && module__nodeUtil;
var moduleExports2 = freeModule2 && freeModule2.exports === freeExports2;
var freeProcess = moduleExports2 && _freeGlobal_default.process;
var nodeUtil = function() {
  try {
    var types = freeModule2 && freeModule2.require && freeModule2.require("util").types;
    if (types) {
      return types;
    }
    return freeProcess && freeProcess.binding && freeProcess.binding("util");
  } catch (e) {}
}();
var _nodeUtil_default = nodeUtil;

// node_modules/lodash-es/isTypedArray.js
var nodeIsTypedArray = _nodeUtil_default && _nodeUtil_default.isTypedArray;
var isTypedArray = nodeIsTypedArray ? _baseUnary_default(nodeIsTypedArray) : _baseIsTypedArray_default;
var isTypedArray_default = isTypedArray;

// node_modules/lodash-es/_arrayLikeKeys.js
var objectProto7 = Object.prototype;
var hasOwnProperty5 = objectProto7.hasOwnProperty;
function arrayLikeKeys(value, inherited) {
  var isArr = isArray_default(value), isArg = !isArr && isArguments_default(value), isBuff = !isArr && !isArg && isBuffer_default(value), isType = !isArr && !isArg && !isBuff && isTypedArray_default(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? _baseTimes_default(value.length, String) : [], length = result.length;
  for (var key in value) {
    if ((inherited || hasOwnProperty5.call(value, key)) && !(skipIndexes && (key == "length" || isBuff && (key == "offset" || key == "parent") || isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || _isIndex_default(key, length)))) {
      result.push(key);
    }
  }
  return result;
}
var _arrayLikeKeys_default = arrayLikeKeys;

// node_modules/lodash-es/_overArg.js
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}
var _overArg_default = overArg;

// node_modules/lodash-es/_nativeKeys.js
var nativeKeys = _overArg_default(Object.keys, Object);
var _nativeKeys_default = nativeKeys;

// node_modules/lodash-es/_baseKeys.js
var objectProto8 = Object.prototype;
var hasOwnProperty6 = objectProto8.hasOwnProperty;
function baseKeys(object) {
  if (!_isPrototype_default(object)) {
    return _nativeKeys_default(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty6.call(object, key) && key != "constructor") {
      result.push(key);
    }
  }
  return result;
}
var _baseKeys_default = baseKeys;

// node_modules/lodash-es/keys.js
function keys(object) {
  return isArrayLike_default(object) ? _arrayLikeKeys_default(object) : _baseKeys_default(object);
}
var keys_default = keys;

// node_modules/lodash-es/_nativeKeysIn.js
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}
var _nativeKeysIn_default = nativeKeysIn;

// node_modules/lodash-es/_baseKeysIn.js
var objectProto9 = Object.prototype;
var hasOwnProperty7 = objectProto9.hasOwnProperty;
function baseKeysIn(object) {
  if (!isObject_default(object)) {
    return _nativeKeysIn_default(object);
  }
  var isProto = _isPrototype_default(object), result = [];
  for (var key in object) {
    if (!(key == "constructor" && (isProto || !hasOwnProperty7.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}
var _baseKeysIn_default = baseKeysIn;

// node_modules/lodash-es/keysIn.js
function keysIn(object) {
  return isArrayLike_default(object) ? _arrayLikeKeys_default(object, true) : _baseKeysIn_default(object);
}
var keysIn_default = keysIn;

// node_modules/lodash-es/_isKey.js
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
var reIsPlainProp = /^\w*$/;
function isKey(value, object) {
  if (isArray_default(value)) {
    return false;
  }
  var type = typeof value;
  if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol_default(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
}
var _isKey_default = isKey;

// node_modules/lodash-es/_nativeCreate.js
var nativeCreate = _getNative_default(Object, "create");
var _nativeCreate_default = nativeCreate;

// node_modules/lodash-es/_hashClear.js
function hashClear() {
  this.__data__ = _nativeCreate_default ? _nativeCreate_default(null) : {};
  this.size = 0;
}
var _hashClear_default = hashClear;

// node_modules/lodash-es/_hashDelete.js
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}
var _hashDelete_default = hashDelete;

// node_modules/lodash-es/_hashGet.js
var HASH_UNDEFINED = "__lodash_hash_undefined__";
var objectProto10 = Object.prototype;
var hasOwnProperty8 = objectProto10.hasOwnProperty;
function hashGet(key) {
  var data = this.__data__;
  if (_nativeCreate_default) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty8.call(data, key) ? data[key] : undefined;
}
var _hashGet_default = hashGet;

// node_modules/lodash-es/_hashHas.js
var objectProto11 = Object.prototype;
var hasOwnProperty9 = objectProto11.hasOwnProperty;
function hashHas(key) {
  var data = this.__data__;
  return _nativeCreate_default ? data[key] !== undefined : hasOwnProperty9.call(data, key);
}
var _hashHas_default = hashHas;

// node_modules/lodash-es/_hashSet.js
var HASH_UNDEFINED2 = "__lodash_hash_undefined__";
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = _nativeCreate_default && value === undefined ? HASH_UNDEFINED2 : value;
  return this;
}
var _hashSet_default = hashSet;

// node_modules/lodash-es/_Hash.js
function Hash(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
Hash.prototype.clear = _hashClear_default;
Hash.prototype["delete"] = _hashDelete_default;
Hash.prototype.get = _hashGet_default;
Hash.prototype.has = _hashHas_default;
Hash.prototype.set = _hashSet_default;
var _Hash_default = Hash;

// node_modules/lodash-es/_listCacheClear.js
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}
var _listCacheClear_default = listCacheClear;

// node_modules/lodash-es/_assocIndexOf.js
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq_default(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}
var _assocIndexOf_default = assocIndexOf;

// node_modules/lodash-es/_listCacheDelete.js
var arrayProto = Array.prototype;
var splice = arrayProto.splice;
function listCacheDelete(key) {
  var data = this.__data__, index = _assocIndexOf_default(data, key);
  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}
var _listCacheDelete_default = listCacheDelete;

// node_modules/lodash-es/_listCacheGet.js
function listCacheGet(key) {
  var data = this.__data__, index = _assocIndexOf_default(data, key);
  return index < 0 ? undefined : data[index][1];
}
var _listCacheGet_default = listCacheGet;

// node_modules/lodash-es/_listCacheHas.js
function listCacheHas(key) {
  return _assocIndexOf_default(this.__data__, key) > -1;
}
var _listCacheHas_default = listCacheHas;

// node_modules/lodash-es/_listCacheSet.js
function listCacheSet(key, value) {
  var data = this.__data__, index = _assocIndexOf_default(data, key);
  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}
var _listCacheSet_default = listCacheSet;

// node_modules/lodash-es/_ListCache.js
function ListCache(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
ListCache.prototype.clear = _listCacheClear_default;
ListCache.prototype["delete"] = _listCacheDelete_default;
ListCache.prototype.get = _listCacheGet_default;
ListCache.prototype.has = _listCacheHas_default;
ListCache.prototype.set = _listCacheSet_default;
var _ListCache_default = ListCache;

// node_modules/lodash-es/_Map.js
var Map = _getNative_default(_root_default, "Map");
var _Map_default = Map;

// node_modules/lodash-es/_mapCacheClear.js
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    hash: new _Hash_default,
    map: new (_Map_default || _ListCache_default),
    string: new _Hash_default
  };
}
var _mapCacheClear_default = mapCacheClear;

// node_modules/lodash-es/_isKeyable.js
function isKeyable(value) {
  var type = typeof value;
  return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
}
var _isKeyable_default = isKeyable;

// node_modules/lodash-es/_getMapData.js
function getMapData(map, key) {
  var data = map.__data__;
  return _isKeyable_default(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
}
var _getMapData_default = getMapData;

// node_modules/lodash-es/_mapCacheDelete.js
function mapCacheDelete(key) {
  var result = _getMapData_default(this, key)["delete"](key);
  this.size -= result ? 1 : 0;
  return result;
}
var _mapCacheDelete_default = mapCacheDelete;

// node_modules/lodash-es/_mapCacheGet.js
function mapCacheGet(key) {
  return _getMapData_default(this, key).get(key);
}
var _mapCacheGet_default = mapCacheGet;

// node_modules/lodash-es/_mapCacheHas.js
function mapCacheHas(key) {
  return _getMapData_default(this, key).has(key);
}
var _mapCacheHas_default = mapCacheHas;

// node_modules/lodash-es/_mapCacheSet.js
function mapCacheSet(key, value) {
  var data = _getMapData_default(this, key), size = data.size;
  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}
var _mapCacheSet_default = mapCacheSet;

// node_modules/lodash-es/_MapCache.js
function MapCache(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
MapCache.prototype.clear = _mapCacheClear_default;
MapCache.prototype["delete"] = _mapCacheDelete_default;
MapCache.prototype.get = _mapCacheGet_default;
MapCache.prototype.has = _mapCacheHas_default;
MapCache.prototype.set = _mapCacheSet_default;
var _MapCache_default = MapCache;

// node_modules/lodash-es/memoize.js
var FUNC_ERROR_TEXT = "Expected a function";
function memoize(func, resolver) {
  if (typeof func != "function" || resolver != null && typeof resolver != "function") {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || _MapCache_default);
  return memoized;
}
memoize.Cache = _MapCache_default;
var memoize_default = memoize;

// node_modules/lodash-es/_memoizeCapped.js
var MAX_MEMOIZE_SIZE = 500;
function memoizeCapped(func) {
  var result = memoize_default(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });
  var cache = result.cache;
  return result;
}
var _memoizeCapped_default = memoizeCapped;

// node_modules/lodash-es/_stringToPath.js
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
var reEscapeChar = /\\(\\)?/g;
var stringToPath = _memoizeCapped_default(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46) {
    result.push("");
  }
  string.replace(rePropName, function(match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
  });
  return result;
});
var _stringToPath_default = stringToPath;

// node_modules/lodash-es/toString.js
function toString(value) {
  return value == null ? "" : _baseToString_default(value);
}
var toString_default = toString;

// node_modules/lodash-es/_castPath.js
function castPath(value, object) {
  if (isArray_default(value)) {
    return value;
  }
  return _isKey_default(value, object) ? [value] : _stringToPath_default(toString_default(value));
}
var _castPath_default = castPath;

// node_modules/lodash-es/_toKey.js
var INFINITY3 = 1 / 0;
function toKey(value) {
  if (typeof value == "string" || isSymbol_default(value)) {
    return value;
  }
  var result = value + "";
  return result == "0" && 1 / value == -INFINITY3 ? "-0" : result;
}
var _toKey_default = toKey;

// node_modules/lodash-es/_baseGet.js
function baseGet(object, path) {
  path = _castPath_default(path, object);
  var index = 0, length = path.length;
  while (object != null && index < length) {
    object = object[_toKey_default(path[index++])];
  }
  return index && index == length ? object : undefined;
}
var _baseGet_default = baseGet;

// node_modules/lodash-es/get.js
function get(object, path, defaultValue) {
  var result = object == null ? undefined : _baseGet_default(object, path);
  return result === undefined ? defaultValue : result;
}
var get_default = get;

// node_modules/lodash-es/_arrayPush.js
function arrayPush(array, values) {
  var index = -1, length = values.length, offset = array.length;
  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}
var _arrayPush_default = arrayPush;

// node_modules/lodash-es/_isFlattenable.js
var spreadableSymbol = _Symbol_default ? _Symbol_default.isConcatSpreadable : undefined;
function isFlattenable(value) {
  return isArray_default(value) || isArguments_default(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
}
var _isFlattenable_default = isFlattenable;

// node_modules/lodash-es/_baseFlatten.js
function baseFlatten(array, depth, predicate, isStrict, result) {
  var index = -1, length = array.length;
  predicate || (predicate = _isFlattenable_default);
  result || (result = []);
  while (++index < length) {
    var value = array[index];
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        baseFlatten(value, depth - 1, predicate, isStrict, result);
      } else {
        _arrayPush_default(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
    }
  }
  return result;
}
var _baseFlatten_default = baseFlatten;

// node_modules/lodash-es/flatten.js
function flatten(array) {
  var length = array == null ? 0 : array.length;
  return length ? _baseFlatten_default(array, 1) : [];
}
var flatten_default = flatten;

// node_modules/lodash-es/_flatRest.js
function flatRest(func) {
  return _setToString_default(_overRest_default(func, undefined, flatten_default), func + "");
}
var _flatRest_default = flatRest;

// node_modules/lodash-es/_getPrototype.js
var getPrototype = _overArg_default(Object.getPrototypeOf, Object);
var _getPrototype_default = getPrototype;

// node_modules/lodash-es/isPlainObject.js
var objectTag2 = "[object Object]";
var funcProto3 = Function.prototype;
var objectProto12 = Object.prototype;
var funcToString3 = funcProto3.toString;
var hasOwnProperty10 = objectProto12.hasOwnProperty;
var objectCtorString = funcToString3.call(Object);
function isPlainObject(value) {
  if (!isObjectLike_default(value) || _baseGetTag_default(value) != objectTag2) {
    return false;
  }
  var proto = _getPrototype_default(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty10.call(proto, "constructor") && proto.constructor;
  return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString3.call(Ctor) == objectCtorString;
}
var isPlainObject_default = isPlainObject;

// node_modules/lodash-es/_hasUnicode.js
var rsAstralRange = "\\ud800-\\udfff";
var rsComboMarksRange = "\\u0300-\\u036f";
var reComboHalfMarksRange = "\\ufe20-\\ufe2f";
var rsComboSymbolsRange = "\\u20d0-\\u20ff";
var rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;
var rsVarRange = "\\ufe0e\\ufe0f";
var rsZWJ = "\\u200d";
var reHasUnicode = RegExp("[" + rsZWJ + rsAstralRange + rsComboRange + rsVarRange + "]");
function hasUnicode(string) {
  return reHasUnicode.test(string);
}
var _hasUnicode_default = hasUnicode;

// node_modules/lodash-es/_arrayReduce.js
function arrayReduce(array, iteratee, accumulator, initAccum) {
  var index = -1, length = array == null ? 0 : array.length;
  if (initAccum && length) {
    accumulator = array[++index];
  }
  while (++index < length) {
    accumulator = iteratee(accumulator, array[index], index, array);
  }
  return accumulator;
}
var _arrayReduce_default = arrayReduce;

// node_modules/lodash-es/_stackClear.js
function stackClear() {
  this.__data__ = new _ListCache_default;
  this.size = 0;
}
var _stackClear_default = stackClear;

// node_modules/lodash-es/_stackDelete.js
function stackDelete(key) {
  var data = this.__data__, result = data["delete"](key);
  this.size = data.size;
  return result;
}
var _stackDelete_default = stackDelete;

// node_modules/lodash-es/_stackGet.js
function stackGet(key) {
  return this.__data__.get(key);
}
var _stackGet_default = stackGet;

// node_modules/lodash-es/_stackHas.js
function stackHas(key) {
  return this.__data__.has(key);
}
var _stackHas_default = stackHas;

// node_modules/lodash-es/_stackSet.js
var LARGE_ARRAY_SIZE = 200;
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof _ListCache_default) {
    var pairs = data.__data__;
    if (!_Map_default || pairs.length < LARGE_ARRAY_SIZE - 1) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new _MapCache_default(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}
var _stackSet_default = stackSet;

// node_modules/lodash-es/_Stack.js
function Stack(entries) {
  var data = this.__data__ = new _ListCache_default(entries);
  this.size = data.size;
}
Stack.prototype.clear = _stackClear_default;
Stack.prototype["delete"] = _stackDelete_default;
Stack.prototype.get = _stackGet_default;
Stack.prototype.has = _stackHas_default;
Stack.prototype.set = _stackSet_default;
var _Stack_default = Stack;

// node_modules/lodash-es/_baseAssign.js
function baseAssign(object, source) {
  return object && _copyObject_default(source, keys_default(source), object);
}
var _baseAssign_default = baseAssign;

// node_modules/lodash-es/_baseAssignIn.js
function baseAssignIn(object, source) {
  return object && _copyObject_default(source, keysIn_default(source), object);
}
var _baseAssignIn_default = baseAssignIn;

// node_modules/lodash-es/_cloneBuffer.js
var exports__cloneBuffer = {};
__export(exports__cloneBuffer, {
  default: () => _cloneBuffer_default
});
var freeExports3 = typeof exports__cloneBuffer == "object" && exports__cloneBuffer && !exports__cloneBuffer.nodeType && exports__cloneBuffer;
var freeModule3 = freeExports3 && typeof module__cloneBuffer == "object" && module__cloneBuffer && !module__cloneBuffer.nodeType && module__cloneBuffer;
var moduleExports3 = freeModule3 && freeModule3.exports === freeExports3;
var Buffer2 = moduleExports3 ? _root_default.Buffer : undefined;
var allocUnsafe = Buffer2 ? Buffer2.allocUnsafe : undefined;
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var length = buffer.length, result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
  buffer.copy(result);
  return result;
}
var _cloneBuffer_default = cloneBuffer;

// node_modules/lodash-es/_arrayFilter.js
function arrayFilter(array, predicate) {
  var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}
var _arrayFilter_default = arrayFilter;

// node_modules/lodash-es/stubArray.js
function stubArray() {
  return [];
}
var stubArray_default = stubArray;

// node_modules/lodash-es/_getSymbols.js
var objectProto13 = Object.prototype;
var propertyIsEnumerable2 = objectProto13.propertyIsEnumerable;
var nativeGetSymbols = Object.getOwnPropertySymbols;
var getSymbols = !nativeGetSymbols ? stubArray_default : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return _arrayFilter_default(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable2.call(object, symbol);
  });
};
var _getSymbols_default = getSymbols;

// node_modules/lodash-es/_copySymbols.js
function copySymbols(source, object) {
  return _copyObject_default(source, _getSymbols_default(source), object);
}
var _copySymbols_default = copySymbols;

// node_modules/lodash-es/_getSymbolsIn.js
var nativeGetSymbols2 = Object.getOwnPropertySymbols;
var getSymbolsIn = !nativeGetSymbols2 ? stubArray_default : function(object) {
  var result = [];
  while (object) {
    _arrayPush_default(result, _getSymbols_default(object));
    object = _getPrototype_default(object);
  }
  return result;
};
var _getSymbolsIn_default = getSymbolsIn;

// node_modules/lodash-es/_copySymbolsIn.js
function copySymbolsIn(source, object) {
  return _copyObject_default(source, _getSymbolsIn_default(source), object);
}
var _copySymbolsIn_default = copySymbolsIn;

// node_modules/lodash-es/_baseGetAllKeys.js
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray_default(object) ? result : _arrayPush_default(result, symbolsFunc(object));
}
var _baseGetAllKeys_default = baseGetAllKeys;

// node_modules/lodash-es/_getAllKeys.js
function getAllKeys(object) {
  return _baseGetAllKeys_default(object, keys_default, _getSymbols_default);
}
var _getAllKeys_default = getAllKeys;

// node_modules/lodash-es/_getAllKeysIn.js
function getAllKeysIn(object) {
  return _baseGetAllKeys_default(object, keysIn_default, _getSymbolsIn_default);
}
var _getAllKeysIn_default = getAllKeysIn;

// node_modules/lodash-es/_DataView.js
var DataView = _getNative_default(_root_default, "DataView");
var _DataView_default = DataView;

// node_modules/lodash-es/_Promise.js
var Promise2 = _getNative_default(_root_default, "Promise");
var _Promise_default = Promise2;

// node_modules/lodash-es/_Set.js
var Set = _getNative_default(_root_default, "Set");
var _Set_default = Set;

// node_modules/lodash-es/_getTag.js
var mapTag2 = "[object Map]";
var objectTag3 = "[object Object]";
var promiseTag = "[object Promise]";
var setTag2 = "[object Set]";
var weakMapTag2 = "[object WeakMap]";
var dataViewTag2 = "[object DataView]";
var dataViewCtorString = _toSource_default(_DataView_default);
var mapCtorString = _toSource_default(_Map_default);
var promiseCtorString = _toSource_default(_Promise_default);
var setCtorString = _toSource_default(_Set_default);
var weakMapCtorString = _toSource_default(_WeakMap_default);
var getTag = _baseGetTag_default;
if (_DataView_default && getTag(new _DataView_default(new ArrayBuffer(1))) != dataViewTag2 || _Map_default && getTag(new _Map_default) != mapTag2 || _Promise_default && getTag(_Promise_default.resolve()) != promiseTag || _Set_default && getTag(new _Set_default) != setTag2 || _WeakMap_default && getTag(new _WeakMap_default) != weakMapTag2) {
  getTag = function(value) {
    var result = _baseGetTag_default(value), Ctor = result == objectTag3 ? value.constructor : undefined, ctorString = Ctor ? _toSource_default(Ctor) : "";
    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString:
          return dataViewTag2;
        case mapCtorString:
          return mapTag2;
        case promiseCtorString:
          return promiseTag;
        case setCtorString:
          return setTag2;
        case weakMapCtorString:
          return weakMapTag2;
      }
    }
    return result;
  };
}
var _getTag_default = getTag;

// node_modules/lodash-es/_initCloneArray.js
var objectProto14 = Object.prototype;
var hasOwnProperty11 = objectProto14.hasOwnProperty;
function initCloneArray(array) {
  var length = array.length, result = new array.constructor(length);
  if (length && typeof array[0] == "string" && hasOwnProperty11.call(array, "index")) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}
var _initCloneArray_default = initCloneArray;

// node_modules/lodash-es/_Uint8Array.js
var Uint8Array = _root_default.Uint8Array;
var _Uint8Array_default = Uint8Array;

// node_modules/lodash-es/_cloneArrayBuffer.js
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new _Uint8Array_default(result).set(new _Uint8Array_default(arrayBuffer));
  return result;
}
var _cloneArrayBuffer_default = cloneArrayBuffer;

// node_modules/lodash-es/_cloneDataView.js
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? _cloneArrayBuffer_default(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}
var _cloneDataView_default = cloneDataView;

// node_modules/lodash-es/_cloneRegExp.js
var reFlags = /\w*$/;
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}
var _cloneRegExp_default = cloneRegExp;

// node_modules/lodash-es/_cloneSymbol.js
var symbolProto2 = _Symbol_default ? _Symbol_default.prototype : undefined;
var symbolValueOf = symbolProto2 ? symbolProto2.valueOf : undefined;
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}
var _cloneSymbol_default = cloneSymbol;

// node_modules/lodash-es/_cloneTypedArray.js
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? _cloneArrayBuffer_default(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}
var _cloneTypedArray_default = cloneTypedArray;

// node_modules/lodash-es/_initCloneByTag.js
var boolTag2 = "[object Boolean]";
var dateTag2 = "[object Date]";
var mapTag3 = "[object Map]";
var numberTag2 = "[object Number]";
var regexpTag2 = "[object RegExp]";
var setTag3 = "[object Set]";
var stringTag2 = "[object String]";
var symbolTag2 = "[object Symbol]";
var arrayBufferTag2 = "[object ArrayBuffer]";
var dataViewTag3 = "[object DataView]";
var float32Tag2 = "[object Float32Array]";
var float64Tag2 = "[object Float64Array]";
var int8Tag2 = "[object Int8Array]";
var int16Tag2 = "[object Int16Array]";
var int32Tag2 = "[object Int32Array]";
var uint8Tag2 = "[object Uint8Array]";
var uint8ClampedTag2 = "[object Uint8ClampedArray]";
var uint16Tag2 = "[object Uint16Array]";
var uint32Tag2 = "[object Uint32Array]";
function initCloneByTag(object, tag, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag2:
      return _cloneArrayBuffer_default(object);
    case boolTag2:
    case dateTag2:
      return new Ctor(+object);
    case dataViewTag3:
      return _cloneDataView_default(object, isDeep);
    case float32Tag2:
    case float64Tag2:
    case int8Tag2:
    case int16Tag2:
    case int32Tag2:
    case uint8Tag2:
    case uint8ClampedTag2:
    case uint16Tag2:
    case uint32Tag2:
      return _cloneTypedArray_default(object, isDeep);
    case mapTag3:
      return new Ctor;
    case numberTag2:
    case stringTag2:
      return new Ctor(object);
    case regexpTag2:
      return _cloneRegExp_default(object);
    case setTag3:
      return new Ctor;
    case symbolTag2:
      return _cloneSymbol_default(object);
  }
}
var _initCloneByTag_default = initCloneByTag;

// node_modules/lodash-es/_initCloneObject.js
function initCloneObject(object) {
  return typeof object.constructor == "function" && !_isPrototype_default(object) ? _baseCreate_default(_getPrototype_default(object)) : {};
}
var _initCloneObject_default = initCloneObject;

// node_modules/lodash-es/_baseIsMap.js
var mapTag4 = "[object Map]";
function baseIsMap(value) {
  return isObjectLike_default(value) && _getTag_default(value) == mapTag4;
}
var _baseIsMap_default = baseIsMap;

// node_modules/lodash-es/isMap.js
var nodeIsMap = _nodeUtil_default && _nodeUtil_default.isMap;
var isMap = nodeIsMap ? _baseUnary_default(nodeIsMap) : _baseIsMap_default;
var isMap_default = isMap;

// node_modules/lodash-es/_baseIsSet.js
var setTag4 = "[object Set]";
function baseIsSet(value) {
  return isObjectLike_default(value) && _getTag_default(value) == setTag4;
}
var _baseIsSet_default = baseIsSet;

// node_modules/lodash-es/isSet.js
var nodeIsSet = _nodeUtil_default && _nodeUtil_default.isSet;
var isSet = nodeIsSet ? _baseUnary_default(nodeIsSet) : _baseIsSet_default;
var isSet_default = isSet;

// node_modules/lodash-es/_baseClone.js
var CLONE_DEEP_FLAG = 1;
var CLONE_FLAT_FLAG = 2;
var CLONE_SYMBOLS_FLAG = 4;
var argsTag3 = "[object Arguments]";
var arrayTag2 = "[object Array]";
var boolTag3 = "[object Boolean]";
var dateTag3 = "[object Date]";
var errorTag2 = "[object Error]";
var funcTag3 = "[object Function]";
var genTag2 = "[object GeneratorFunction]";
var mapTag5 = "[object Map]";
var numberTag3 = "[object Number]";
var objectTag4 = "[object Object]";
var regexpTag3 = "[object RegExp]";
var setTag5 = "[object Set]";
var stringTag3 = "[object String]";
var symbolTag3 = "[object Symbol]";
var weakMapTag3 = "[object WeakMap]";
var arrayBufferTag3 = "[object ArrayBuffer]";
var dataViewTag4 = "[object DataView]";
var float32Tag3 = "[object Float32Array]";
var float64Tag3 = "[object Float64Array]";
var int8Tag3 = "[object Int8Array]";
var int16Tag3 = "[object Int16Array]";
var int32Tag3 = "[object Int32Array]";
var uint8Tag3 = "[object Uint8Array]";
var uint8ClampedTag3 = "[object Uint8ClampedArray]";
var uint16Tag3 = "[object Uint16Array]";
var uint32Tag3 = "[object Uint32Array]";
var cloneableTags = {};
cloneableTags[argsTag3] = cloneableTags[arrayTag2] = cloneableTags[arrayBufferTag3] = cloneableTags[dataViewTag4] = cloneableTags[boolTag3] = cloneableTags[dateTag3] = cloneableTags[float32Tag3] = cloneableTags[float64Tag3] = cloneableTags[int8Tag3] = cloneableTags[int16Tag3] = cloneableTags[int32Tag3] = cloneableTags[mapTag5] = cloneableTags[numberTag3] = cloneableTags[objectTag4] = cloneableTags[regexpTag3] = cloneableTags[setTag5] = cloneableTags[stringTag3] = cloneableTags[symbolTag3] = cloneableTags[uint8Tag3] = cloneableTags[uint8ClampedTag3] = cloneableTags[uint16Tag3] = cloneableTags[uint32Tag3] = true;
cloneableTags[errorTag2] = cloneableTags[funcTag3] = cloneableTags[weakMapTag3] = false;
function baseClone(value, bitmask, customizer, key, object, stack) {
  var result, isDeep = bitmask & CLONE_DEEP_FLAG, isFlat = bitmask & CLONE_FLAT_FLAG, isFull = bitmask & CLONE_SYMBOLS_FLAG;
  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject_default(value)) {
    return value;
  }
  var isArr = isArray_default(value);
  if (isArr) {
    result = _initCloneArray_default(value);
    if (!isDeep) {
      return _copyArray_default(value, result);
    }
  } else {
    var tag = _getTag_default(value), isFunc = tag == funcTag3 || tag == genTag2;
    if (isBuffer_default(value)) {
      return _cloneBuffer_default(value, isDeep);
    }
    if (tag == objectTag4 || tag == argsTag3 || isFunc && !object) {
      result = isFlat || isFunc ? {} : _initCloneObject_default(value);
      if (!isDeep) {
        return isFlat ? _copySymbolsIn_default(value, _baseAssignIn_default(result, value)) : _copySymbols_default(value, _baseAssign_default(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = _initCloneByTag_default(value, tag, isDeep);
    }
  }
  stack || (stack = new _Stack_default);
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);
  if (isSet_default(value)) {
    value.forEach(function(subValue) {
      result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
    });
  } else if (isMap_default(value)) {
    value.forEach(function(subValue, key2) {
      result.set(key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
    });
  }
  var keysFunc = isFull ? isFlat ? _getAllKeysIn_default : _getAllKeys_default : isFlat ? keysIn_default : keys_default;
  var props = isArr ? undefined : keysFunc(value);
  _arrayEach_default(props || value, function(subValue, key2) {
    if (props) {
      key2 = subValue;
      subValue = value[key2];
    }
    _assignValue_default(result, key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
  });
  return result;
}
var _baseClone_default = baseClone;

// node_modules/lodash-es/clone.js
var CLONE_SYMBOLS_FLAG2 = 4;
function clone(value) {
  return _baseClone_default(value, CLONE_SYMBOLS_FLAG2);
}
var clone_default = clone;
// node_modules/lodash-es/cloneDeep.js
var CLONE_DEEP_FLAG2 = 1;
var CLONE_SYMBOLS_FLAG3 = 4;
function cloneDeep(value) {
  return _baseClone_default(value, CLONE_DEEP_FLAG2 | CLONE_SYMBOLS_FLAG3);
}
var cloneDeep_default = cloneDeep;
// node_modules/lodash-es/_setCacheAdd.js
var HASH_UNDEFINED3 = "__lodash_hash_undefined__";
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED3);
  return this;
}
var _setCacheAdd_default = setCacheAdd;

// node_modules/lodash-es/_setCacheHas.js
function setCacheHas(value) {
  return this.__data__.has(value);
}
var _setCacheHas_default = setCacheHas;

// node_modules/lodash-es/_SetCache.js
function SetCache(values) {
  var index = -1, length = values == null ? 0 : values.length;
  this.__data__ = new _MapCache_default;
  while (++index < length) {
    this.add(values[index]);
  }
}
SetCache.prototype.add = SetCache.prototype.push = _setCacheAdd_default;
SetCache.prototype.has = _setCacheHas_default;
var _SetCache_default = SetCache;

// node_modules/lodash-es/_arraySome.js
function arraySome(array, predicate) {
  var index = -1, length = array == null ? 0 : array.length;
  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}
var _arraySome_default = arraySome;

// node_modules/lodash-es/_cacheHas.js
function cacheHas(cache, key) {
  return cache.has(key);
}
var _cacheHas_default = cacheHas;

// node_modules/lodash-es/_equalArrays.js
var COMPARE_PARTIAL_FLAG = 1;
var COMPARE_UNORDERED_FLAG = 2;
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array.length, othLength = other.length;
  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  var arrStacked = stack.get(array);
  var othStacked = stack.get(other);
  if (arrStacked && othStacked) {
    return arrStacked == other && othStacked == array;
  }
  var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new _SetCache_default : undefined;
  stack.set(array, other);
  stack.set(other, array);
  while (++index < arrLength) {
    var arrValue = array[index], othValue = other[index];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    if (seen) {
      if (!_arraySome_default(other, function(othValue2, othIndex) {
        if (!_cacheHas_default(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
          return seen.push(othIndex);
        }
      })) {
        result = false;
        break;
      }
    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
      result = false;
      break;
    }
  }
  stack["delete"](array);
  stack["delete"](other);
  return result;
}
var _equalArrays_default = equalArrays;

// node_modules/lodash-es/_mapToArray.js
function mapToArray(map) {
  var index = -1, result = Array(map.size);
  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}
var _mapToArray_default = mapToArray;

// node_modules/lodash-es/_setToArray.js
function setToArray(set) {
  var index = -1, result = Array(set.size);
  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}
var _setToArray_default = setToArray;

// node_modules/lodash-es/_equalByTag.js
var COMPARE_PARTIAL_FLAG2 = 1;
var COMPARE_UNORDERED_FLAG2 = 2;
var boolTag4 = "[object Boolean]";
var dateTag4 = "[object Date]";
var errorTag3 = "[object Error]";
var mapTag6 = "[object Map]";
var numberTag4 = "[object Number]";
var regexpTag4 = "[object RegExp]";
var setTag6 = "[object Set]";
var stringTag4 = "[object String]";
var symbolTag4 = "[object Symbol]";
var arrayBufferTag4 = "[object ArrayBuffer]";
var dataViewTag5 = "[object DataView]";
var symbolProto3 = _Symbol_default ? _Symbol_default.prototype : undefined;
var symbolValueOf2 = symbolProto3 ? symbolProto3.valueOf : undefined;
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag5:
      if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;
    case arrayBufferTag4:
      if (object.byteLength != other.byteLength || !equalFunc(new _Uint8Array_default(object), new _Uint8Array_default(other))) {
        return false;
      }
      return true;
    case boolTag4:
    case dateTag4:
    case numberTag4:
      return eq_default(+object, +other);
    case errorTag3:
      return object.name == other.name && object.message == other.message;
    case regexpTag4:
    case stringTag4:
      return object == other + "";
    case mapTag6:
      var convert = _mapToArray_default;
    case setTag6:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG2;
      convert || (convert = _setToArray_default);
      if (object.size != other.size && !isPartial) {
        return false;
      }
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG2;
      stack.set(object, other);
      var result = _equalArrays_default(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack["delete"](object);
      return result;
    case symbolTag4:
      if (symbolValueOf2) {
        return symbolValueOf2.call(object) == symbolValueOf2.call(other);
      }
  }
  return false;
}
var _equalByTag_default = equalByTag;

// node_modules/lodash-es/_equalObjects.js
var COMPARE_PARTIAL_FLAG3 = 1;
var objectProto15 = Object.prototype;
var hasOwnProperty12 = objectProto15.hasOwnProperty;
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG3, objProps = _getAllKeys_default(object), objLength = objProps.length, othProps = _getAllKeys_default(other), othLength = othProps.length;
  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty12.call(other, key))) {
      return false;
    }
  }
  var objStacked = stack.get(object);
  var othStacked = stack.get(other);
  if (objStacked && othStacked) {
    return objStacked == other && othStacked == object;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);
  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key], othValue = other[key];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
    }
    if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == "constructor");
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor, othCtor = other.constructor;
    if (objCtor != othCtor && (("constructor" in object) && ("constructor" in other)) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack["delete"](object);
  stack["delete"](other);
  return result;
}
var _equalObjects_default = equalObjects;

// node_modules/lodash-es/_baseIsEqualDeep.js
var COMPARE_PARTIAL_FLAG4 = 1;
var argsTag4 = "[object Arguments]";
var arrayTag3 = "[object Array]";
var objectTag5 = "[object Object]";
var objectProto16 = Object.prototype;
var hasOwnProperty13 = objectProto16.hasOwnProperty;
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray_default(object), othIsArr = isArray_default(other), objTag = objIsArr ? arrayTag3 : _getTag_default(object), othTag = othIsArr ? arrayTag3 : _getTag_default(other);
  objTag = objTag == argsTag4 ? objectTag5 : objTag;
  othTag = othTag == argsTag4 ? objectTag5 : othTag;
  var objIsObj = objTag == objectTag5, othIsObj = othTag == objectTag5, isSameTag = objTag == othTag;
  if (isSameTag && isBuffer_default(object)) {
    if (!isBuffer_default(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new _Stack_default);
    return objIsArr || isTypedArray_default(object) ? _equalArrays_default(object, other, bitmask, customizer, equalFunc, stack) : _equalByTag_default(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG4)) {
    var objIsWrapped = objIsObj && hasOwnProperty13.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty13.call(other, "__wrapped__");
    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
      stack || (stack = new _Stack_default);
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new _Stack_default);
  return _equalObjects_default(object, other, bitmask, customizer, equalFunc, stack);
}
var _baseIsEqualDeep_default = baseIsEqualDeep;

// node_modules/lodash-es/_baseIsEqual.js
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || !isObjectLike_default(value) && !isObjectLike_default(other)) {
    return value !== value && other !== other;
  }
  return _baseIsEqualDeep_default(value, other, bitmask, customizer, baseIsEqual, stack);
}
var _baseIsEqual_default = baseIsEqual;

// node_modules/lodash-es/_baseIsMatch.js
var COMPARE_PARTIAL_FLAG5 = 1;
var COMPARE_UNORDERED_FLAG3 = 2;
function baseIsMatch(object, source, matchData, customizer) {
  var index = matchData.length, length = index, noCustomizer = !customizer;
  if (object == null) {
    return !length;
  }
  object = Object(object);
  while (index--) {
    var data = matchData[index];
    if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0], objValue = object[key], srcValue = data[1];
    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false;
      }
    } else {
      var stack = new _Stack_default;
      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }
      if (!(result === undefined ? _baseIsEqual_default(srcValue, objValue, COMPARE_PARTIAL_FLAG5 | COMPARE_UNORDERED_FLAG3, customizer, stack) : result)) {
        return false;
      }
    }
  }
  return true;
}
var _baseIsMatch_default = baseIsMatch;

// node_modules/lodash-es/_isStrictComparable.js
function isStrictComparable(value) {
  return value === value && !isObject_default(value);
}
var _isStrictComparable_default = isStrictComparable;

// node_modules/lodash-es/_getMatchData.js
function getMatchData(object) {
  var result = keys_default(object), length = result.length;
  while (length--) {
    var key = result[length], value = object[key];
    result[length] = [key, value, _isStrictComparable_default(value)];
  }
  return result;
}
var _getMatchData_default = getMatchData;

// node_modules/lodash-es/_matchesStrictComparable.js
function matchesStrictComparable(key, srcValue) {
  return function(object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue && (srcValue !== undefined || (key in Object(object)));
  };
}
var _matchesStrictComparable_default = matchesStrictComparable;

// node_modules/lodash-es/_baseMatches.js
function baseMatches(source) {
  var matchData = _getMatchData_default(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return _matchesStrictComparable_default(matchData[0][0], matchData[0][1]);
  }
  return function(object) {
    return object === source || _baseIsMatch_default(object, source, matchData);
  };
}
var _baseMatches_default = baseMatches;

// node_modules/lodash-es/_baseHasIn.js
function baseHasIn(object, key) {
  return object != null && key in Object(object);
}
var _baseHasIn_default = baseHasIn;

// node_modules/lodash-es/_hasPath.js
function hasPath(object, path, hasFunc) {
  path = _castPath_default(path, object);
  var index = -1, length = path.length, result = false;
  while (++index < length) {
    var key = _toKey_default(path[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result || ++index != length) {
    return result;
  }
  length = object == null ? 0 : object.length;
  return !!length && isLength_default(length) && _isIndex_default(key, length) && (isArray_default(object) || isArguments_default(object));
}
var _hasPath_default = hasPath;

// node_modules/lodash-es/hasIn.js
function hasIn(object, path) {
  return object != null && _hasPath_default(object, path, _baseHasIn_default);
}
var hasIn_default = hasIn;

// node_modules/lodash-es/_baseMatchesProperty.js
var COMPARE_PARTIAL_FLAG6 = 1;
var COMPARE_UNORDERED_FLAG4 = 2;
function baseMatchesProperty(path, srcValue) {
  if (_isKey_default(path) && _isStrictComparable_default(srcValue)) {
    return _matchesStrictComparable_default(_toKey_default(path), srcValue);
  }
  return function(object) {
    var objValue = get_default(object, path);
    return objValue === undefined && objValue === srcValue ? hasIn_default(object, path) : _baseIsEqual_default(srcValue, objValue, COMPARE_PARTIAL_FLAG6 | COMPARE_UNORDERED_FLAG4);
  };
}
var _baseMatchesProperty_default = baseMatchesProperty;

// node_modules/lodash-es/_baseProperty.js
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}
var _baseProperty_default = baseProperty;

// node_modules/lodash-es/_basePropertyDeep.js
function basePropertyDeep(path) {
  return function(object) {
    return _baseGet_default(object, path);
  };
}
var _basePropertyDeep_default = basePropertyDeep;

// node_modules/lodash-es/property.js
function property(path) {
  return _isKey_default(path) ? _baseProperty_default(_toKey_default(path)) : _basePropertyDeep_default(path);
}
var property_default = property;

// node_modules/lodash-es/_baseIteratee.js
function baseIteratee(value) {
  if (typeof value == "function") {
    return value;
  }
  if (value == null) {
    return identity_default;
  }
  if (typeof value == "object") {
    return isArray_default(value) ? _baseMatchesProperty_default(value[0], value[1]) : _baseMatches_default(value);
  }
  return property_default(value);
}
var _baseIteratee_default = baseIteratee;
// node_modules/lodash-es/_createBaseFor.js
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}
var _createBaseFor_default = createBaseFor;

// node_modules/lodash-es/_baseFor.js
var baseFor = _createBaseFor_default();
var _baseFor_default = baseFor;

// node_modules/lodash-es/_baseForOwn.js
function baseForOwn(object, iteratee) {
  return object && _baseFor_default(object, iteratee, keys_default);
}
var _baseForOwn_default = baseForOwn;

// node_modules/lodash-es/_createBaseEach.js
function createBaseEach(eachFunc, fromRight) {
  return function(collection, iteratee) {
    if (collection == null) {
      return collection;
    }
    if (!isArrayLike_default(collection)) {
      return eachFunc(collection, iteratee);
    }
    var length = collection.length, index = fromRight ? length : -1, iterable = Object(collection);
    while (fromRight ? index-- : ++index < length) {
      if (iteratee(iterable[index], index, iterable) === false) {
        break;
      }
    }
    return collection;
  };
}
var _createBaseEach_default = createBaseEach;

// node_modules/lodash-es/_baseEach.js
var baseEach = _createBaseEach_default(_baseForOwn_default);
var _baseEach_default = baseEach;

// node_modules/lodash-es/now.js
var now = function() {
  return _root_default.Date.now();
};
var now_default = now;

// node_modules/lodash-es/defaults.js
var objectProto17 = Object.prototype;
var hasOwnProperty14 = objectProto17.hasOwnProperty;
var defaults = _baseRest_default(function(object, sources) {
  object = Object(object);
  var index = -1;
  var length = sources.length;
  var guard = length > 2 ? sources[2] : undefined;
  if (guard && _isIterateeCall_default(sources[0], sources[1], guard)) {
    length = 1;
  }
  while (++index < length) {
    var source = sources[index];
    var props = keysIn_default(source);
    var propsIndex = -1;
    var propsLength = props.length;
    while (++propsIndex < propsLength) {
      var key = props[propsIndex];
      var value = object[key];
      if (value === undefined || eq_default(value, objectProto17[key]) && !hasOwnProperty14.call(object, key)) {
        object[key] = source[key];
      }
    }
  }
  return object;
});
var defaults_default = defaults;
// node_modules/lodash-es/_assignMergeValue.js
function assignMergeValue(object, key, value) {
  if (value !== undefined && !eq_default(object[key], value) || value === undefined && !(key in object)) {
    _baseAssignValue_default(object, key, value);
  }
}
var _assignMergeValue_default = assignMergeValue;

// node_modules/lodash-es/isArrayLikeObject.js
function isArrayLikeObject(value) {
  return isObjectLike_default(value) && isArrayLike_default(value);
}
var isArrayLikeObject_default = isArrayLikeObject;

// node_modules/lodash-es/_safeGet.js
function safeGet(object, key) {
  if (key === "constructor" && typeof object[key] === "function") {
    return;
  }
  if (key == "__proto__") {
    return;
  }
  return object[key];
}
var _safeGet_default = safeGet;

// node_modules/lodash-es/toPlainObject.js
function toPlainObject(value) {
  return _copyObject_default(value, keysIn_default(value));
}
var toPlainObject_default = toPlainObject;

// node_modules/lodash-es/_baseMergeDeep.js
function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
  var objValue = _safeGet_default(object, key), srcValue = _safeGet_default(source, key), stacked = stack.get(srcValue);
  if (stacked) {
    _assignMergeValue_default(object, key, stacked);
    return;
  }
  var newValue = customizer ? customizer(objValue, srcValue, key + "", object, source, stack) : undefined;
  var isCommon = newValue === undefined;
  if (isCommon) {
    var isArr = isArray_default(srcValue), isBuff = !isArr && isBuffer_default(srcValue), isTyped = !isArr && !isBuff && isTypedArray_default(srcValue);
    newValue = srcValue;
    if (isArr || isBuff || isTyped) {
      if (isArray_default(objValue)) {
        newValue = objValue;
      } else if (isArrayLikeObject_default(objValue)) {
        newValue = _copyArray_default(objValue);
      } else if (isBuff) {
        isCommon = false;
        newValue = _cloneBuffer_default(srcValue, true);
      } else if (isTyped) {
        isCommon = false;
        newValue = _cloneTypedArray_default(srcValue, true);
      } else {
        newValue = [];
      }
    } else if (isPlainObject_default(srcValue) || isArguments_default(srcValue)) {
      newValue = objValue;
      if (isArguments_default(objValue)) {
        newValue = toPlainObject_default(objValue);
      } else if (!isObject_default(objValue) || isFunction_default(objValue)) {
        newValue = _initCloneObject_default(srcValue);
      }
    } else {
      isCommon = false;
    }
  }
  if (isCommon) {
    stack.set(srcValue, newValue);
    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
    stack["delete"](srcValue);
  }
  _assignMergeValue_default(object, key, newValue);
}
var _baseMergeDeep_default = baseMergeDeep;

// node_modules/lodash-es/_baseMerge.js
function baseMerge(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return;
  }
  _baseFor_default(source, function(srcValue, key) {
    stack || (stack = new _Stack_default);
    if (isObject_default(srcValue)) {
      _baseMergeDeep_default(object, source, key, srcIndex, baseMerge, customizer, stack);
    } else {
      var newValue = customizer ? customizer(_safeGet_default(object, key), srcValue, key + "", object, source, stack) : undefined;
      if (newValue === undefined) {
        newValue = srcValue;
      }
      _assignMergeValue_default(object, key, newValue);
    }
  }, keysIn_default);
}
var _baseMerge_default = baseMerge;

// node_modules/lodash-es/_arrayIncludesWith.js
function arrayIncludesWith(array, value, comparator) {
  var index = -1, length = array == null ? 0 : array.length;
  while (++index < length) {
    if (comparator(value, array[index])) {
      return true;
    }
  }
  return false;
}
var _arrayIncludesWith_default = arrayIncludesWith;

// node_modules/lodash-es/last.js
function last(array) {
  var length = array == null ? 0 : array.length;
  return length ? array[length - 1] : undefined;
}
var last_default = last;

// node_modules/lodash-es/_castFunction.js
function castFunction(value) {
  return typeof value == "function" ? value : identity_default;
}
var _castFunction_default = castFunction;

// node_modules/lodash-es/forEach.js
function forEach(collection, iteratee) {
  var func = isArray_default(collection) ? _arrayEach_default : _baseEach_default;
  return func(collection, _castFunction_default(iteratee));
}
var forEach_default = forEach;
// node_modules/lodash-es/_baseFilter.js
function baseFilter(collection, predicate) {
  var result = [];
  _baseEach_default(collection, function(value, index, collection2) {
    if (predicate(value, index, collection2)) {
      result.push(value);
    }
  });
  return result;
}
var _baseFilter_default = baseFilter;

// node_modules/lodash-es/filter.js
function filter(collection, predicate) {
  var func = isArray_default(collection) ? _arrayFilter_default : _baseFilter_default;
  return func(collection, _baseIteratee_default(predicate, 3));
}
var filter_default = filter;
// node_modules/lodash-es/_createFind.js
function createFind(findIndexFunc) {
  return function(collection, predicate, fromIndex) {
    var iterable = Object(collection);
    if (!isArrayLike_default(collection)) {
      var iteratee = _baseIteratee_default(predicate, 3);
      collection = keys_default(collection);
      predicate = function(key) {
        return iteratee(iterable[key], key, iterable);
      };
    }
    var index = findIndexFunc(collection, predicate, fromIndex);
    return index > -1 ? iterable[iteratee ? collection[index] : index] : undefined;
  };
}
var _createFind_default = createFind;

// node_modules/lodash-es/findIndex.js
var nativeMax2 = Math.max;
function findIndex(array, predicate, fromIndex) {
  var length = array == null ? 0 : array.length;
  if (!length) {
    return -1;
  }
  var index = fromIndex == null ? 0 : toInteger_default(fromIndex);
  if (index < 0) {
    index = nativeMax2(length + index, 0);
  }
  return _baseFindIndex_default(array, _baseIteratee_default(predicate, 3), index);
}
var findIndex_default = findIndex;

// node_modules/lodash-es/find.js
var find = _createFind_default(findIndex_default);
var find_default = find;
// node_modules/lodash-es/_baseMap.js
function baseMap(collection, iteratee) {
  var index = -1, result = isArrayLike_default(collection) ? Array(collection.length) : [];
  _baseEach_default(collection, function(value, key, collection2) {
    result[++index] = iteratee(value, key, collection2);
  });
  return result;
}
var _baseMap_default = baseMap;

// node_modules/lodash-es/map.js
function map(collection, iteratee) {
  var func = isArray_default(collection) ? _arrayMap_default : _baseMap_default;
  return func(collection, _baseIteratee_default(iteratee, 3));
}
var map_default = map;
// node_modules/lodash-es/forIn.js
function forIn(object, iteratee) {
  return object == null ? object : _baseFor_default(object, _castFunction_default(iteratee), keysIn_default);
}
var forIn_default = forIn;
// node_modules/lodash-es/forOwn.js
function forOwn(object, iteratee) {
  return object && _baseForOwn_default(object, _castFunction_default(iteratee));
}
var forOwn_default = forOwn;
// node_modules/lodash-es/_baseGt.js
function baseGt(value, other) {
  return value > other;
}
var _baseGt_default = baseGt;

// node_modules/lodash-es/_baseHas.js
var objectProto18 = Object.prototype;
var hasOwnProperty15 = objectProto18.hasOwnProperty;
function baseHas(object, key) {
  return object != null && hasOwnProperty15.call(object, key);
}
var _baseHas_default = baseHas;

// node_modules/lodash-es/has.js
function has(object, path) {
  return object != null && _hasPath_default(object, path, _baseHas_default);
}
var has_default = has;
// node_modules/lodash-es/isString.js
var stringTag5 = "[object String]";
function isString(value) {
  return typeof value == "string" || !isArray_default(value) && isObjectLike_default(value) && _baseGetTag_default(value) == stringTag5;
}
var isString_default = isString;

// node_modules/lodash-es/_baseValues.js
function baseValues(object, props) {
  return _arrayMap_default(props, function(key) {
    return object[key];
  });
}
var _baseValues_default = baseValues;

// node_modules/lodash-es/values.js
function values(object) {
  return object == null ? [] : _baseValues_default(object, keys_default(object));
}
var values_default = values;
// node_modules/lodash-es/isEmpty.js
var mapTag7 = "[object Map]";
var setTag7 = "[object Set]";
var objectProto19 = Object.prototype;
var hasOwnProperty16 = objectProto19.hasOwnProperty;
function isEmpty(value) {
  if (value == null) {
    return true;
  }
  if (isArrayLike_default(value) && (isArray_default(value) || typeof value == "string" || typeof value.splice == "function" || isBuffer_default(value) || isTypedArray_default(value) || isArguments_default(value))) {
    return !value.length;
  }
  var tag = _getTag_default(value);
  if (tag == mapTag7 || tag == setTag7) {
    return !value.size;
  }
  if (_isPrototype_default(value)) {
    return !_baseKeys_default(value).length;
  }
  for (var key in value) {
    if (hasOwnProperty16.call(value, key)) {
      return false;
    }
  }
  return true;
}
var isEmpty_default = isEmpty;
// node_modules/lodash-es/isUndefined.js
function isUndefined(value) {
  return value === undefined;
}
var isUndefined_default = isUndefined;
// node_modules/lodash-es/_baseLt.js
function baseLt(value, other) {
  return value < other;
}
var _baseLt_default = baseLt;
// node_modules/lodash-es/mapValues.js
function mapValues(object, iteratee) {
  var result = {};
  iteratee = _baseIteratee_default(iteratee, 3);
  _baseForOwn_default(object, function(value, key, object2) {
    _baseAssignValue_default(result, key, iteratee(value, key, object2));
  });
  return result;
}
var mapValues_default = mapValues;
// node_modules/lodash-es/_baseExtremum.js
function baseExtremum(array, iteratee, comparator) {
  var index = -1, length = array.length;
  while (++index < length) {
    var value = array[index], current = iteratee(value);
    if (current != null && (computed === undefined ? current === current && !isSymbol_default(current) : comparator(current, computed))) {
      var computed = current, result = value;
    }
  }
  return result;
}
var _baseExtremum_default = baseExtremum;

// node_modules/lodash-es/max.js
function max(array) {
  return array && array.length ? _baseExtremum_default(array, identity_default, _baseGt_default) : undefined;
}
var max_default = max;
// node_modules/lodash-es/merge.js
var merge = _createAssigner_default(function(object, source, srcIndex) {
  _baseMerge_default(object, source, srcIndex);
});
var merge_default = merge;
// node_modules/lodash-es/min.js
function min(array) {
  return array && array.length ? _baseExtremum_default(array, identity_default, _baseLt_default) : undefined;
}
var min_default = min;
// node_modules/lodash-es/minBy.js
function minBy(array, iteratee) {
  return array && array.length ? _baseExtremum_default(array, _baseIteratee_default(iteratee, 2), _baseLt_default) : undefined;
}
var minBy_default = minBy;
// node_modules/lodash-es/_baseSet.js
function baseSet(object, path, value, customizer) {
  if (!isObject_default(object)) {
    return object;
  }
  path = _castPath_default(path, object);
  var index = -1, length = path.length, lastIndex = length - 1, nested = object;
  while (nested != null && ++index < length) {
    var key = _toKey_default(path[index]), newValue = value;
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      return object;
    }
    if (index != lastIndex) {
      var objValue = nested[key];
      newValue = customizer ? customizer(objValue, key, nested) : undefined;
      if (newValue === undefined) {
        newValue = isObject_default(objValue) ? objValue : _isIndex_default(path[index + 1]) ? [] : {};
      }
    }
    _assignValue_default(nested, key, newValue);
    nested = nested[key];
  }
  return object;
}
var _baseSet_default = baseSet;

// node_modules/lodash-es/_basePickBy.js
function basePickBy(object, paths, predicate) {
  var index = -1, length = paths.length, result = {};
  while (++index < length) {
    var path = paths[index], value = _baseGet_default(object, path);
    if (predicate(value, path)) {
      _baseSet_default(result, _castPath_default(path, object), value);
    }
  }
  return result;
}
var _basePickBy_default = basePickBy;

// node_modules/lodash-es/_baseSortBy.js
function baseSortBy(array, comparer) {
  var length = array.length;
  array.sort(comparer);
  while (length--) {
    array[length] = array[length].value;
  }
  return array;
}
var _baseSortBy_default = baseSortBy;

// node_modules/lodash-es/_compareAscending.js
function compareAscending(value, other) {
  if (value !== other) {
    var valIsDefined = value !== undefined, valIsNull = value === null, valIsReflexive = value === value, valIsSymbol = isSymbol_default(value);
    var othIsDefined = other !== undefined, othIsNull = other === null, othIsReflexive = other === other, othIsSymbol = isSymbol_default(other);
    if (!othIsNull && !othIsSymbol && !valIsSymbol && value > other || valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol || valIsNull && othIsDefined && othIsReflexive || !valIsDefined && othIsReflexive || !valIsReflexive) {
      return 1;
    }
    if (!valIsNull && !valIsSymbol && !othIsSymbol && value < other || othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol || othIsNull && valIsDefined && valIsReflexive || !othIsDefined && valIsReflexive || !othIsReflexive) {
      return -1;
    }
  }
  return 0;
}
var _compareAscending_default = compareAscending;

// node_modules/lodash-es/_compareMultiple.js
function compareMultiple(object, other, orders) {
  var index = -1, objCriteria = object.criteria, othCriteria = other.criteria, length = objCriteria.length, ordersLength = orders.length;
  while (++index < length) {
    var result = _compareAscending_default(objCriteria[index], othCriteria[index]);
    if (result) {
      if (index >= ordersLength) {
        return result;
      }
      var order = orders[index];
      return result * (order == "desc" ? -1 : 1);
    }
  }
  return object.index - other.index;
}
var _compareMultiple_default = compareMultiple;

// node_modules/lodash-es/_baseOrderBy.js
function baseOrderBy(collection, iteratees, orders) {
  if (iteratees.length) {
    iteratees = _arrayMap_default(iteratees, function(iteratee) {
      if (isArray_default(iteratee)) {
        return function(value) {
          return _baseGet_default(value, iteratee.length === 1 ? iteratee[0] : iteratee);
        };
      }
      return iteratee;
    });
  } else {
    iteratees = [identity_default];
  }
  var index = -1;
  iteratees = _arrayMap_default(iteratees, _baseUnary_default(_baseIteratee_default));
  var result = _baseMap_default(collection, function(value, key, collection2) {
    var criteria = _arrayMap_default(iteratees, function(iteratee) {
      return iteratee(value);
    });
    return { criteria, index: ++index, value };
  });
  return _baseSortBy_default(result, function(object, other) {
    return _compareMultiple_default(object, other, orders);
  });
}
var _baseOrderBy_default = baseOrderBy;

// node_modules/lodash-es/_asciiSize.js
var asciiSize = _baseProperty_default("length");
var _asciiSize_default = asciiSize;

// node_modules/lodash-es/_unicodeSize.js
var rsAstralRange2 = "\\ud800-\\udfff";
var rsComboMarksRange2 = "\\u0300-\\u036f";
var reComboHalfMarksRange2 = "\\ufe20-\\ufe2f";
var rsComboSymbolsRange2 = "\\u20d0-\\u20ff";
var rsComboRange2 = rsComboMarksRange2 + reComboHalfMarksRange2 + rsComboSymbolsRange2;
var rsVarRange2 = "\\ufe0e\\ufe0f";
var rsAstral = "[" + rsAstralRange2 + "]";
var rsCombo = "[" + rsComboRange2 + "]";
var rsFitz = "\\ud83c[\\udffb-\\udfff]";
var rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")";
var rsNonAstral = "[^" + rsAstralRange2 + "]";
var rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}";
var rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]";
var rsZWJ2 = "\\u200d";
var reOptMod = rsModifier + "?";
var rsOptVar = "[" + rsVarRange2 + "]?";
var rsOptJoin = "(?:" + rsZWJ2 + "(?:" + [rsNonAstral, rsRegional, rsSurrPair].join("|") + ")" + rsOptVar + reOptMod + ")*";
var rsSeq = rsOptVar + reOptMod + rsOptJoin;
var rsSymbol = "(?:" + [rsNonAstral + rsCombo + "?", rsCombo, rsRegional, rsSurrPair, rsAstral].join("|") + ")";
var reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq, "g");
function unicodeSize(string) {
  var result = reUnicode.lastIndex = 0;
  while (reUnicode.test(string)) {
    ++result;
  }
  return result;
}
var _unicodeSize_default = unicodeSize;

// node_modules/lodash-es/_stringSize.js
function stringSize(string) {
  return _hasUnicode_default(string) ? _unicodeSize_default(string) : _asciiSize_default(string);
}
var _stringSize_default = stringSize;

// node_modules/lodash-es/_basePick.js
function basePick(object, paths) {
  return _basePickBy_default(object, paths, function(value, path) {
    return hasIn_default(object, path);
  });
}
var _basePick_default = basePick;

// node_modules/lodash-es/pick.js
var pick = _flatRest_default(function(object, paths) {
  return object == null ? {} : _basePick_default(object, paths);
});
var pick_default = pick;
// node_modules/lodash-es/_baseRange.js
var nativeCeil = Math.ceil;
var nativeMax3 = Math.max;
function baseRange(start, end, step, fromRight) {
  var index = -1, length = nativeMax3(nativeCeil((end - start) / (step || 1)), 0), result = Array(length);
  while (length--) {
    result[fromRight ? length : ++index] = start;
    start += step;
  }
  return result;
}
var _baseRange_default = baseRange;

// node_modules/lodash-es/_createRange.js
function createRange(fromRight) {
  return function(start, end, step) {
    if (step && typeof step != "number" && _isIterateeCall_default(start, end, step)) {
      end = step = undefined;
    }
    start = toFinite_default(start);
    if (end === undefined) {
      end = start;
      start = 0;
    } else {
      end = toFinite_default(end);
    }
    step = step === undefined ? start < end ? 1 : -1 : toFinite_default(step);
    return _baseRange_default(start, end, step, fromRight);
  };
}
var _createRange_default = createRange;

// node_modules/lodash-es/range.js
var range = _createRange_default();
var range_default = range;
// node_modules/lodash-es/_baseReduce.js
function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
  eachFunc(collection, function(value, index, collection2) {
    accumulator = initAccum ? (initAccum = false, value) : iteratee(accumulator, value, index, collection2);
  });
  return accumulator;
}
var _baseReduce_default = baseReduce;

// node_modules/lodash-es/reduce.js
function reduce(collection, iteratee, accumulator) {
  var func = isArray_default(collection) ? _arrayReduce_default : _baseReduce_default, initAccum = arguments.length < 3;
  return func(collection, _baseIteratee_default(iteratee, 4), accumulator, initAccum, _baseEach_default);
}
var reduce_default = reduce;
// node_modules/lodash-es/size.js
var mapTag8 = "[object Map]";
var setTag8 = "[object Set]";
function size(collection) {
  if (collection == null) {
    return 0;
  }
  if (isArrayLike_default(collection)) {
    return isString_default(collection) ? _stringSize_default(collection) : collection.length;
  }
  var tag = _getTag_default(collection);
  if (tag == mapTag8 || tag == setTag8) {
    return collection.size;
  }
  return _baseKeys_default(collection).length;
}
var size_default = size;
// node_modules/lodash-es/sortBy.js
var sortBy = _baseRest_default(function(collection, iteratees) {
  if (collection == null) {
    return [];
  }
  var length = iteratees.length;
  if (length > 1 && _isIterateeCall_default(collection, iteratees[0], iteratees[1])) {
    iteratees = [];
  } else if (length > 2 && _isIterateeCall_default(iteratees[0], iteratees[1], iteratees[2])) {
    iteratees = [iteratees[0]];
  }
  return _baseOrderBy_default(collection, _baseFlatten_default(iteratees, 1), []);
});
var sortBy_default = sortBy;
// node_modules/lodash-es/_createSet.js
var INFINITY4 = 1 / 0;
var createSet = !(_Set_default && 1 / _setToArray_default(new _Set_default([, -0]))[1] == INFINITY4) ? noop_default : function(values2) {
  return new _Set_default(values2);
};
var _createSet_default = createSet;

// node_modules/lodash-es/_baseUniq.js
var LARGE_ARRAY_SIZE2 = 200;
function baseUniq(array, iteratee, comparator) {
  var index = -1, includes = _arrayIncludes_default, length = array.length, isCommon = true, result = [], seen = result;
  if (comparator) {
    isCommon = false;
    includes = _arrayIncludesWith_default;
  } else if (length >= LARGE_ARRAY_SIZE2) {
    var set = iteratee ? null : _createSet_default(array);
    if (set) {
      return _setToArray_default(set);
    }
    isCommon = false;
    includes = _cacheHas_default;
    seen = new _SetCache_default;
  } else {
    seen = iteratee ? [] : result;
  }
  outer:
    while (++index < length) {
      var value = array[index], computed = iteratee ? iteratee(value) : value;
      value = comparator || value !== 0 ? value : 0;
      if (isCommon && computed === computed) {
        var seenIndex = seen.length;
        while (seenIndex--) {
          if (seen[seenIndex] === computed) {
            continue outer;
          }
        }
        if (iteratee) {
          seen.push(computed);
        }
        result.push(value);
      } else if (!includes(seen, computed, comparator)) {
        if (seen !== result) {
          seen.push(computed);
        }
        result.push(value);
      }
    }
  return result;
}
var _baseUniq_default = baseUniq;

// node_modules/lodash-es/union.js
var union = _baseRest_default(function(arrays) {
  return _baseUniq_default(_baseFlatten_default(arrays, 1, isArrayLikeObject_default, true));
});
var union_default = union;
// node_modules/lodash-es/uniqueId.js
var idCounter = 0;
function uniqueId(prefix) {
  var id = ++idCounter;
  return toString_default(prefix) + id;
}
var uniqueId_default = uniqueId;
// node_modules/lodash-es/_baseZipObject.js
function baseZipObject(props, values2, assignFunc) {
  var index = -1, length = props.length, valsLength = values2.length, result = {};
  while (++index < length) {
    var value = index < valsLength ? values2[index] : undefined;
    assignFunc(result, props[index], value);
  }
  return result;
}
var _baseZipObject_default = baseZipObject;

// node_modules/lodash-es/zipObject.js
function zipObject(props, values2) {
  return _baseZipObject_default(props || [], values2 || [], _assignValue_default);
}
var zipObject_default = zipObject;
// node_modules/dagre-d3-es/src/graphlib/graph.js
var DEFAULT_EDGE_NAME = "\x00";
var GRAPH_NODE = "\x00";
var EDGE_KEY_DELIM = "\x01";

class Graph {
  constructor(opts = {}) {
    this._isDirected = Object.prototype.hasOwnProperty.call(opts, "directed") ? opts.directed : true;
    this._isMultigraph = Object.prototype.hasOwnProperty.call(opts, "multigraph") ? opts.multigraph : false;
    this._isCompound = Object.prototype.hasOwnProperty.call(opts, "compound") ? opts.compound : false;
    this._label = undefined;
    this._defaultNodeLabelFn = constant_default(undefined);
    this._defaultEdgeLabelFn = constant_default(undefined);
    this._nodes = {};
    if (this._isCompound) {
      this._parent = {};
      this._children = {};
      this._children[GRAPH_NODE] = {};
    }
    this._in = {};
    this._preds = {};
    this._out = {};
    this._sucs = {};
    this._edgeObjs = {};
    this._edgeLabels = {};
  }
  isDirected() {
    return this._isDirected;
  }
  isMultigraph() {
    return this._isMultigraph;
  }
  isCompound() {
    return this._isCompound;
  }
  setGraph(label) {
    this._label = label;
    return this;
  }
  graph() {
    return this._label;
  }
  setDefaultNodeLabel(newDefault) {
    if (!isFunction_default(newDefault)) {
      newDefault = constant_default(newDefault);
    }
    this._defaultNodeLabelFn = newDefault;
    return this;
  }
  nodeCount() {
    return this._nodeCount;
  }
  nodes() {
    return keys_default(this._nodes);
  }
  sources() {
    var self2 = this;
    return filter_default(this.nodes(), function(v) {
      return isEmpty_default(self2._in[v]);
    });
  }
  sinks() {
    var self2 = this;
    return filter_default(this.nodes(), function(v) {
      return isEmpty_default(self2._out[v]);
    });
  }
  setNodes(vs, value) {
    var args = arguments;
    var self2 = this;
    forEach_default(vs, function(v) {
      if (args.length > 1) {
        self2.setNode(v, value);
      } else {
        self2.setNode(v);
      }
    });
    return this;
  }
  setNode(v, value) {
    if (Object.prototype.hasOwnProperty.call(this._nodes, v)) {
      if (arguments.length > 1) {
        this._nodes[v] = value;
      }
      return this;
    }
    this._nodes[v] = arguments.length > 1 ? value : this._defaultNodeLabelFn(v);
    if (this._isCompound) {
      this._parent[v] = GRAPH_NODE;
      this._children[v] = {};
      this._children[GRAPH_NODE][v] = true;
    }
    this._in[v] = {};
    this._preds[v] = {};
    this._out[v] = {};
    this._sucs[v] = {};
    ++this._nodeCount;
    return this;
  }
  node(v) {
    return this._nodes[v];
  }
  hasNode(v) {
    return Object.prototype.hasOwnProperty.call(this._nodes, v);
  }
  removeNode(v) {
    if (Object.prototype.hasOwnProperty.call(this._nodes, v)) {
      var removeEdge = (e) => this.removeEdge(this._edgeObjs[e]);
      delete this._nodes[v];
      if (this._isCompound) {
        this._removeFromParentsChildList(v);
        delete this._parent[v];
        forEach_default(this.children(v), (child) => {
          this.setParent(child);
        });
        delete this._children[v];
      }
      forEach_default(keys_default(this._in[v]), removeEdge);
      delete this._in[v];
      delete this._preds[v];
      forEach_default(keys_default(this._out[v]), removeEdge);
      delete this._out[v];
      delete this._sucs[v];
      --this._nodeCount;
    }
    return this;
  }
  setParent(v, parent) {
    if (!this._isCompound) {
      throw new Error("Cannot set parent in a non-compound graph");
    }
    if (isUndefined_default(parent)) {
      parent = GRAPH_NODE;
    } else {
      parent += "";
      for (var ancestor = parent;!isUndefined_default(ancestor); ancestor = this.parent(ancestor)) {
        if (ancestor === v) {
          throw new Error("Setting " + parent + " as parent of " + v + " would create a cycle");
        }
      }
      this.setNode(parent);
    }
    this.setNode(v);
    this._removeFromParentsChildList(v);
    this._parent[v] = parent;
    this._children[parent][v] = true;
    return this;
  }
  _removeFromParentsChildList(v) {
    delete this._children[this._parent[v]][v];
  }
  parent(v) {
    if (this._isCompound) {
      var parent = this._parent[v];
      if (parent !== GRAPH_NODE) {
        return parent;
      }
    }
  }
  children(v) {
    if (isUndefined_default(v)) {
      v = GRAPH_NODE;
    }
    if (this._isCompound) {
      var children = this._children[v];
      if (children) {
        return keys_default(children);
      }
    } else if (v === GRAPH_NODE) {
      return this.nodes();
    } else if (this.hasNode(v)) {
      return [];
    }
  }
  predecessors(v) {
    var predsV = this._preds[v];
    if (predsV) {
      return keys_default(predsV);
    }
  }
  successors(v) {
    var sucsV = this._sucs[v];
    if (sucsV) {
      return keys_default(sucsV);
    }
  }
  neighbors(v) {
    var preds = this.predecessors(v);
    if (preds) {
      return union_default(preds, this.successors(v));
    }
  }
  isLeaf(v) {
    var neighbors;
    if (this.isDirected()) {
      neighbors = this.successors(v);
    } else {
      neighbors = this.neighbors(v);
    }
    return neighbors.length === 0;
  }
  filterNodes(filter2) {
    var copy = new this.constructor({
      directed: this._isDirected,
      multigraph: this._isMultigraph,
      compound: this._isCompound
    });
    copy.setGraph(this.graph());
    var self2 = this;
    forEach_default(this._nodes, function(value, v) {
      if (filter2(v)) {
        copy.setNode(v, value);
      }
    });
    forEach_default(this._edgeObjs, function(e) {
      if (copy.hasNode(e.v) && copy.hasNode(e.w)) {
        copy.setEdge(e, self2.edge(e));
      }
    });
    var parents = {};
    function findParent(v) {
      var parent = self2.parent(v);
      if (parent === undefined || copy.hasNode(parent)) {
        parents[v] = parent;
        return parent;
      } else if (parent in parents) {
        return parents[parent];
      } else {
        return findParent(parent);
      }
    }
    if (this._isCompound) {
      forEach_default(copy.nodes(), function(v) {
        copy.setParent(v, findParent(v));
      });
    }
    return copy;
  }
  setDefaultEdgeLabel(newDefault) {
    if (!isFunction_default(newDefault)) {
      newDefault = constant_default(newDefault);
    }
    this._defaultEdgeLabelFn = newDefault;
    return this;
  }
  edgeCount() {
    return this._edgeCount;
  }
  edges() {
    return values_default(this._edgeObjs);
  }
  setPath(vs, value) {
    var self2 = this;
    var args = arguments;
    reduce_default(vs, function(v, w) {
      if (args.length > 1) {
        self2.setEdge(v, w, value);
      } else {
        self2.setEdge(v, w);
      }
      return w;
    });
    return this;
  }
  setEdge() {
    var v, w, name, value;
    var valueSpecified = false;
    var arg0 = arguments[0];
    if (typeof arg0 === "object" && arg0 !== null && "v" in arg0) {
      v = arg0.v;
      w = arg0.w;
      name = arg0.name;
      if (arguments.length === 2) {
        value = arguments[1];
        valueSpecified = true;
      }
    } else {
      v = arg0;
      w = arguments[1];
      name = arguments[3];
      if (arguments.length > 2) {
        value = arguments[2];
        valueSpecified = true;
      }
    }
    v = "" + v;
    w = "" + w;
    if (!isUndefined_default(name)) {
      name = "" + name;
    }
    var e = edgeArgsToId(this._isDirected, v, w, name);
    if (Object.prototype.hasOwnProperty.call(this._edgeLabels, e)) {
      if (valueSpecified) {
        this._edgeLabels[e] = value;
      }
      return this;
    }
    if (!isUndefined_default(name) && !this._isMultigraph) {
      throw new Error("Cannot set a named edge when isMultigraph = false");
    }
    this.setNode(v);
    this.setNode(w);
    this._edgeLabels[e] = valueSpecified ? value : this._defaultEdgeLabelFn(v, w, name);
    var edgeObj = edgeArgsToObj(this._isDirected, v, w, name);
    v = edgeObj.v;
    w = edgeObj.w;
    Object.freeze(edgeObj);
    this._edgeObjs[e] = edgeObj;
    incrementOrInitEntry(this._preds[w], v);
    incrementOrInitEntry(this._sucs[v], w);
    this._in[w][e] = edgeObj;
    this._out[v][e] = edgeObj;
    this._edgeCount++;
    return this;
  }
  edge(v, w, name) {
    var e = arguments.length === 1 ? edgeObjToId(this._isDirected, arguments[0]) : edgeArgsToId(this._isDirected, v, w, name);
    return this._edgeLabels[e];
  }
  hasEdge(v, w, name) {
    var e = arguments.length === 1 ? edgeObjToId(this._isDirected, arguments[0]) : edgeArgsToId(this._isDirected, v, w, name);
    return Object.prototype.hasOwnProperty.call(this._edgeLabels, e);
  }
  removeEdge(v, w, name) {
    var e = arguments.length === 1 ? edgeObjToId(this._isDirected, arguments[0]) : edgeArgsToId(this._isDirected, v, w, name);
    var edge = this._edgeObjs[e];
    if (edge) {
      v = edge.v;
      w = edge.w;
      delete this._edgeLabels[e];
      delete this._edgeObjs[e];
      decrementOrRemoveEntry(this._preds[w], v);
      decrementOrRemoveEntry(this._sucs[v], w);
      delete this._in[w][e];
      delete this._out[v][e];
      this._edgeCount--;
    }
    return this;
  }
  inEdges(v, u) {
    var inV = this._in[v];
    if (inV) {
      var edges = values_default(inV);
      if (!u) {
        return edges;
      }
      return filter_default(edges, function(edge) {
        return edge.v === u;
      });
    }
  }
  outEdges(v, w) {
    var outV = this._out[v];
    if (outV) {
      var edges = values_default(outV);
      if (!w) {
        return edges;
      }
      return filter_default(edges, function(edge) {
        return edge.w === w;
      });
    }
  }
  nodeEdges(v, w) {
    var inEdges = this.inEdges(v, w);
    if (inEdges) {
      return inEdges.concat(this.outEdges(v, w));
    }
  }
}
Graph.prototype._nodeCount = 0;
Graph.prototype._edgeCount = 0;
function incrementOrInitEntry(map2, k) {
  if (map2[k]) {
    map2[k]++;
  } else {
    map2[k] = 1;
  }
}
function decrementOrRemoveEntry(map2, k) {
  if (!--map2[k]) {
    delete map2[k];
  }
}
function edgeArgsToId(isDirected, v_, w_, name) {
  var v = "" + v_;
  var w = "" + w_;
  if (!isDirected && v > w) {
    var tmp = v;
    v = w;
    w = tmp;
  }
  return v + EDGE_KEY_DELIM + w + EDGE_KEY_DELIM + (isUndefined_default(name) ? DEFAULT_EDGE_NAME : name);
}
function edgeArgsToObj(isDirected, v_, w_, name) {
  var v = "" + v_;
  var w = "" + w_;
  if (!isDirected && v > w) {
    var tmp = v;
    v = w;
    w = tmp;
  }
  var edgeObj = { v, w };
  if (name) {
    edgeObj.name = name;
  }
  return edgeObj;
}
function edgeObjToId(isDirected, edgeObj) {
  return edgeArgsToId(isDirected, edgeObj.v, edgeObj.w, edgeObj.name);
}

export { isArray_default, constant_default, flatten_default, clone_default, cloneDeep_default, now_default, defaults_default, last_default, forEach_default, filter_default, find_default, map_default, forIn_default, forOwn_default, has_default, values_default, isUndefined_default, mapValues_default, max_default, merge_default, min_default, minBy_default, pick_default, range_default, reduce_default, size_default, sortBy_default, uniqueId_default, zipObject_default, Graph };

//# debugId=B37406BBAC6AE90664756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fZnJlZUdsb2JhbC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19yb290LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX1N5bWJvbC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19nZXRSYXdUYWcuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fb2JqZWN0VG9TdHJpbmcuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUdldFRhZy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzT2JqZWN0TGlrZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzU3ltYm9sLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2FycmF5TWFwLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNBcnJheS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlVG9TdHJpbmcuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fdHJpbW1lZEVuZEluZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VUcmltLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNPYmplY3QuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy90b051bWJlci5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL3RvRmluaXRlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvdG9JbnRlZ2VyLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaWRlbnRpdHkuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc0Z1bmN0aW9uLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2NvcmVKc0RhdGEuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9faXNNYXNrZWQuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fdG9Tb3VyY2UuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUlzTmF0aXZlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2dldFZhbHVlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2dldE5hdGl2ZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19XZWFrTWFwLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VDcmVhdGUuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYXBwbHkuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9ub29wLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2NvcHlBcnJheS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19zaG9ydE91dC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2NvbnN0YW50LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2RlZmluZVByb3BlcnR5LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VTZXRUb1N0cmluZy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19zZXRUb1N0cmluZy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19hcnJheUVhY2guanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUZpbmRJbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlSXNOYU4uanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fc3RyaWN0SW5kZXhPZi5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlSW5kZXhPZi5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19hcnJheUluY2x1ZGVzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2lzSW5kZXguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUFzc2lnblZhbHVlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvZXEuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYXNzaWduVmFsdWUuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fY29weU9iamVjdC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19vdmVyUmVzdC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlUmVzdC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzTGVuZ3RoLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNBcnJheUxpa2UuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9faXNJdGVyYXRlZUNhbGwuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fY3JlYXRlQXNzaWduZXIuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9faXNQcm90b3R5cGUuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZVRpbWVzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VJc0FyZ3VtZW50cy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzQXJndW1lbnRzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvc3R1YkZhbHNlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNCdWZmZXIuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUlzVHlwZWRBcnJheS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlVW5hcnkuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fbm9kZVV0aWwuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc1R5cGVkQXJyYXkuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYXJyYXlMaWtlS2V5cy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19vdmVyQXJnLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX25hdGl2ZUtleXMuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUtleXMuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9rZXlzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX25hdGl2ZUtleXNJbi5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlS2V5c0luLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMva2V5c0luLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2lzS2V5LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX25hdGl2ZUNyZWF0ZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19oYXNoQ2xlYXIuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9faGFzaERlbGV0ZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19oYXNoR2V0LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2hhc2hIYXMuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9faGFzaFNldC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19IYXNoLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2xpc3RDYWNoZUNsZWFyLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Fzc29jSW5kZXhPZi5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19saXN0Q2FjaGVEZWxldGUuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fbGlzdENhY2hlR2V0LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2xpc3RDYWNoZUhhcy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19saXN0Q2FjaGVTZXQuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fTGlzdENhY2hlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX01hcC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19tYXBDYWNoZUNsZWFyLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2lzS2V5YWJsZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19nZXRNYXBEYXRhLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX21hcENhY2hlRGVsZXRlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX21hcENhY2hlR2V0LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX21hcENhY2hlSGFzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX21hcENhY2hlU2V0LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX01hcENhY2hlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvbWVtb2l6ZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19tZW1vaXplQ2FwcGVkLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3N0cmluZ1RvUGF0aC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL3RvU3RyaW5nLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Nhc3RQYXRoLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3RvS2V5LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VHZXQuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9nZXQuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYXJyYXlQdXNoLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2lzRmxhdHRlbmFibGUuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUZsYXR0ZW4uanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9mbGF0dGVuLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2ZsYXRSZXN0LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2dldFByb3RvdHlwZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzUGxhaW5PYmplY3QuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9faGFzVW5pY29kZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19hcnJheVJlZHVjZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19zdGFja0NsZWFyLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3N0YWNrRGVsZXRlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3N0YWNrR2V0LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3N0YWNrSGFzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX3N0YWNrU2V0LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX1N0YWNrLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VBc3NpZ24uanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUFzc2lnbkluLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Nsb25lQnVmZmVyLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2FycmF5RmlsdGVyLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvc3R1YkFycmF5LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2dldFN5bWJvbHMuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fY29weVN5bWJvbHMuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fZ2V0U3ltYm9sc0luLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2NvcHlTeW1ib2xzSW4uanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUdldEFsbEtleXMuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fZ2V0QWxsS2V5cy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19nZXRBbGxLZXlzSW4uanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fRGF0YVZpZXcuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fUHJvbWlzZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19TZXQuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fZ2V0VGFnLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2luaXRDbG9uZUFycmF5LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX1VpbnQ4QXJyYXkuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fY2xvbmVBcnJheUJ1ZmZlci5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19jbG9uZURhdGFWaWV3LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Nsb25lUmVnRXhwLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Nsb25lU3ltYm9sLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Nsb25lVHlwZWRBcnJheS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19pbml0Q2xvbmVCeVRhZy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19pbml0Q2xvbmVPYmplY3QuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUlzTWFwLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNNYXAuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUlzU2V0LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNTZXQuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUNsb25lLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvY2xvbmUuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9jbG9uZURlZXAuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fc2V0Q2FjaGVBZGQuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fc2V0Q2FjaGVIYXMuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fU2V0Q2FjaGUuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYXJyYXlTb21lLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2NhY2hlSGFzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2VxdWFsQXJyYXlzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX21hcFRvQXJyYXkuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fc2V0VG9BcnJheS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19lcXVhbEJ5VGFnLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2VxdWFsT2JqZWN0cy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlSXNFcXVhbERlZXAuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUlzRXF1YWwuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUlzTWF0Y2guanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9faXNTdHJpY3RDb21wYXJhYmxlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2dldE1hdGNoRGF0YS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19tYXRjaGVzU3RyaWN0Q29tcGFyYWJsZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlTWF0Y2hlcy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlSGFzSW4uanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9faGFzUGF0aC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2hhc0luLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VNYXRjaGVzUHJvcGVydHkuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZVByb3BlcnR5LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VQcm9wZXJ0eURlZXAuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9wcm9wZXJ0eS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlSXRlcmF0ZWUuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fY3JlYXRlQmFzZUZvci5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlRm9yLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VGb3JPd24uanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fY3JlYXRlQmFzZUVhY2guanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUVhY2guanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9ub3cuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9kZWZhdWx0cy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19hc3NpZ25NZXJnZVZhbHVlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNBcnJheUxpa2VPYmplY3QuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fc2FmZUdldC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL3RvUGxhaW5PYmplY3QuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZU1lcmdlRGVlcC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlTWVyZ2UuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYXJyYXlJbmNsdWRlc1dpdGguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9sYXN0LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Nhc3RGdW5jdGlvbi5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2ZvckVhY2guanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUZpbHRlci5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2ZpbHRlci5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19jcmVhdGVGaW5kLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvZmluZEluZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvZmluZC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlTWFwLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvbWFwLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvZm9ySW4uanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9mb3JPd24uanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZUd0LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VIYXMuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9oYXMuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9pc1N0cmluZy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlVmFsdWVzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvdmFsdWVzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNFbXB0eS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzVW5kZWZpbmVkLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VMdC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL21hcFZhbHVlcy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlRXh0cmVtdW0uanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9tYXguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9tZXJnZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL21pbi5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL21pbkJ5LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VTZXQuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZVBpY2tCeS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlU29ydEJ5LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2NvbXBhcmVBc2NlbmRpbmcuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fY29tcGFyZU11bHRpcGxlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VPcmRlckJ5LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2FzY2lpU2l6ZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL191bmljb2RlU2l6ZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19zdHJpbmdTaXplLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VQaWNrLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvcGljay5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlUmFuZ2UuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fY3JlYXRlUmFuZ2UuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9yYW5nZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19iYXNlUmVkdWNlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvcmVkdWNlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvc2l6ZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL3NvcnRCeS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL19jcmVhdGVTZXQuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy9fYmFzZVVuaXEuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy91bmlvbi5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoLWVzL3VuaXF1ZUlkLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX2Jhc2VaaXBPYmplY3QuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC1lcy96aXBPYmplY3QuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2RhZ3JlLWQzLWVzL3NyYy9ncmFwaGxpYi9ncmFwaC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICIvKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAgZnJvbSBOb2RlLmpzLiAqL1xudmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbCAmJiBnbG9iYWwuT2JqZWN0ID09PSBPYmplY3QgJiYgZ2xvYmFsO1xuXG5leHBvcnQgZGVmYXVsdCBmcmVlR2xvYmFsO1xuIiwKICAgICJpbXBvcnQgZnJlZUdsb2JhbCBmcm9tICcuL19mcmVlR2xvYmFsLmpzJztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBzZWxmYC4gKi9cbnZhciBmcmVlU2VsZiA9IHR5cGVvZiBzZWxmID09ICdvYmplY3QnICYmIHNlbGYgJiYgc2VsZi5PYmplY3QgPT09IE9iamVjdCAmJiBzZWxmO1xuXG4vKiogVXNlZCBhcyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdC4gKi9cbnZhciByb290ID0gZnJlZUdsb2JhbCB8fCBmcmVlU2VsZiB8fCBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXG5leHBvcnQgZGVmYXVsdCByb290O1xuIiwKICAgICJpbXBvcnQgcm9vdCBmcm9tICcuL19yb290LmpzJztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgU3ltYm9sID0gcm9vdC5TeW1ib2w7XG5cbmV4cG9ydCBkZWZhdWx0IFN5bWJvbDtcbiIsCiAgICAiaW1wb3J0IFN5bWJvbCBmcm9tICcuL19TeW1ib2wuanMnO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgbmF0aXZlT2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgc3ltVG9TdHJpbmdUYWcgPSBTeW1ib2wgPyBTeW1ib2wudG9TdHJpbmdUYWcgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlR2V0VGFnYCB3aGljaCBpZ25vcmVzIGBTeW1ib2wudG9TdHJpbmdUYWdgIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSByYXcgYHRvU3RyaW5nVGFnYC5cbiAqL1xuZnVuY3Rpb24gZ2V0UmF3VGFnKHZhbHVlKSB7XG4gIHZhciBpc093biA9IGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIHN5bVRvU3RyaW5nVGFnKSxcbiAgICAgIHRhZyA9IHZhbHVlW3N5bVRvU3RyaW5nVGFnXTtcblxuICB0cnkge1xuICAgIHZhbHVlW3N5bVRvU3RyaW5nVGFnXSA9IHVuZGVmaW5lZDtcbiAgICB2YXIgdW5tYXNrZWQgPSB0cnVlO1xuICB9IGNhdGNoIChlKSB7fVxuXG4gIHZhciByZXN1bHQgPSBuYXRpdmVPYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgaWYgKHVubWFza2VkKSB7XG4gICAgaWYgKGlzT3duKSB7XG4gICAgICB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ10gPSB0YWc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ107XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGdldFJhd1RhZztcbiIsCiAgICAiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG5hdGl2ZU9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZyB1c2luZyBgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IG9iamVjdFRvU3RyaW5nO1xuIiwKICAgICJpbXBvcnQgU3ltYm9sIGZyb20gJy4vX1N5bWJvbC5qcyc7XG5pbXBvcnQgZ2V0UmF3VGFnIGZyb20gJy4vX2dldFJhd1RhZy5qcyc7XG5pbXBvcnQgb2JqZWN0VG9TdHJpbmcgZnJvbSAnLi9fb2JqZWN0VG9TdHJpbmcuanMnO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgbnVsbFRhZyA9ICdbb2JqZWN0IE51bGxdJyxcbiAgICB1bmRlZmluZWRUYWcgPSAnW29iamVjdCBVbmRlZmluZWRdJztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgc3ltVG9TdHJpbmdUYWcgPSBTeW1ib2wgPyBTeW1ib2wudG9TdHJpbmdUYWcgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGdldFRhZ2Agd2l0aG91dCBmYWxsYmFja3MgZm9yIGJ1Z2d5IGVudmlyb25tZW50cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBgdG9TdHJpbmdUYWdgLlxuICovXG5mdW5jdGlvbiBiYXNlR2V0VGFnKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWRUYWcgOiBudWxsVGFnO1xuICB9XG4gIHJldHVybiAoc3ltVG9TdHJpbmdUYWcgJiYgc3ltVG9TdHJpbmdUYWcgaW4gT2JqZWN0KHZhbHVlKSlcbiAgICA/IGdldFJhd1RhZyh2YWx1ZSlcbiAgICA6IG9iamVjdFRvU3RyaW5nKHZhbHVlKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUdldFRhZztcbiIsCiAgICAiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzT2JqZWN0TGlrZTtcbiIsCiAgICAiaW1wb3J0IGJhc2VHZXRUYWcgZnJvbSAnLi9fYmFzZUdldFRhZy5qcyc7XG5pbXBvcnQgaXNPYmplY3RMaWtlIGZyb20gJy4vaXNPYmplY3RMaWtlLmpzJztcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIHN5bWJvbFRhZyA9ICdbb2JqZWN0IFN5bWJvbF0nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgU3ltYm9sYCBwcmltaXRpdmUgb3Igb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgc3ltYm9sLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNTeW1ib2woU3ltYm9sLml0ZXJhdG9yKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzU3ltYm9sKCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3ltYm9sKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N5bWJvbCcgfHxcbiAgICAoaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBiYXNlR2V0VGFnKHZhbHVlKSA9PSBzeW1ib2xUYWcpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc1N5bWJvbDtcbiIsCiAgICAiLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYF8ubWFwYCBmb3IgYXJyYXlzIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWVcbiAqIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IFthcnJheV0gVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIG5ldyBtYXBwZWQgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGFycmF5TWFwKGFycmF5LCBpdGVyYXRlZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGFycmF5ID09IG51bGwgPyAwIDogYXJyYXkubGVuZ3RoLFxuICAgICAgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHJlc3VsdFtpbmRleF0gPSBpdGVyYXRlZShhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXJyYXlNYXA7XG4iLAogICAgIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhbiBgQXJyYXlgIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJyYXkoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXkoZG9jdW1lbnQuYm9keS5jaGlsZHJlbik7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNBcnJheSgnYWJjJyk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNBcnJheShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuXG5leHBvcnQgZGVmYXVsdCBpc0FycmF5O1xuIiwKICAgICJpbXBvcnQgU3ltYm9sIGZyb20gJy4vX1N5bWJvbC5qcyc7XG5pbXBvcnQgYXJyYXlNYXAgZnJvbSAnLi9fYXJyYXlNYXAuanMnO1xuaW1wb3J0IGlzQXJyYXkgZnJvbSAnLi9pc0FycmF5LmpzJztcbmltcG9ydCBpc1N5bWJvbCBmcm9tICcuL2lzU3ltYm9sLmpzJztcblxuLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgSU5GSU5JVFkgPSAxIC8gMDtcblxuLyoqIFVzZWQgdG8gY29udmVydCBzeW1ib2xzIHRvIHByaW1pdGl2ZXMgYW5kIHN0cmluZ3MuICovXG52YXIgc3ltYm9sUHJvdG8gPSBTeW1ib2wgPyBTeW1ib2wucHJvdG90eXBlIDogdW5kZWZpbmVkLFxuICAgIHN5bWJvbFRvU3RyaW5nID0gc3ltYm9sUHJvdG8gPyBzeW1ib2xQcm90by50b1N0cmluZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy50b1N0cmluZ2Agd2hpY2ggZG9lc24ndCBjb252ZXJ0IG51bGxpc2hcbiAqIHZhbHVlcyB0byBlbXB0eSBzdHJpbmdzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBwcm9jZXNzLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBiYXNlVG9TdHJpbmcodmFsdWUpIHtcbiAgLy8gRXhpdCBlYXJseSBmb3Igc3RyaW5ncyB0byBhdm9pZCBhIHBlcmZvcm1hbmNlIGhpdCBpbiBzb21lIGVudmlyb25tZW50cy5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAvLyBSZWN1cnNpdmVseSBjb252ZXJ0IHZhbHVlcyAoc3VzY2VwdGlibGUgdG8gY2FsbCBzdGFjayBsaW1pdHMpLlxuICAgIHJldHVybiBhcnJheU1hcCh2YWx1ZSwgYmFzZVRvU3RyaW5nKSArICcnO1xuICB9XG4gIGlmIChpc1N5bWJvbCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gc3ltYm9sVG9TdHJpbmcgPyBzeW1ib2xUb1N0cmluZy5jYWxsKHZhbHVlKSA6ICcnO1xuICB9XG4gIHZhciByZXN1bHQgPSAodmFsdWUgKyAnJyk7XG4gIHJldHVybiAocmVzdWx0ID09ICcwJyAmJiAoMSAvIHZhbHVlKSA9PSAtSU5GSU5JVFkpID8gJy0wJyA6IHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZVRvU3RyaW5nO1xuIiwKICAgICIvKiogVXNlZCB0byBtYXRjaCBhIHNpbmdsZSB3aGl0ZXNwYWNlIGNoYXJhY3Rlci4gKi9cbnZhciByZVdoaXRlc3BhY2UgPSAvXFxzLztcblxuLyoqXG4gKiBVc2VkIGJ5IGBfLnRyaW1gIGFuZCBgXy50cmltRW5kYCB0byBnZXQgdGhlIGluZGV4IG9mIHRoZSBsYXN0IG5vbi13aGl0ZXNwYWNlXG4gKiBjaGFyYWN0ZXIgb2YgYHN0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgVGhlIHN0cmluZyB0byBpbnNwZWN0LlxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGxhc3Qgbm9uLXdoaXRlc3BhY2UgY2hhcmFjdGVyLlxuICovXG5mdW5jdGlvbiB0cmltbWVkRW5kSW5kZXgoc3RyaW5nKSB7XG4gIHZhciBpbmRleCA9IHN0cmluZy5sZW5ndGg7XG5cbiAgd2hpbGUgKGluZGV4LS0gJiYgcmVXaGl0ZXNwYWNlLnRlc3Qoc3RyaW5nLmNoYXJBdChpbmRleCkpKSB7fVxuICByZXR1cm4gaW5kZXg7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHRyaW1tZWRFbmRJbmRleDtcbiIsCiAgICAiaW1wb3J0IHRyaW1tZWRFbmRJbmRleCBmcm9tICcuL190cmltbWVkRW5kSW5kZXguanMnO1xuXG4vKiogVXNlZCB0byBtYXRjaCBsZWFkaW5nIHdoaXRlc3BhY2UuICovXG52YXIgcmVUcmltU3RhcnQgPSAvXlxccysvO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnRyaW1gLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIFRoZSBzdHJpbmcgdG8gdHJpbS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHRyaW1tZWQgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBiYXNlVHJpbShzdHJpbmcpIHtcbiAgcmV0dXJuIHN0cmluZ1xuICAgID8gc3RyaW5nLnNsaWNlKDAsIHRyaW1tZWRFbmRJbmRleChzdHJpbmcpICsgMSkucmVwbGFjZShyZVRyaW1TdGFydCwgJycpXG4gICAgOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VUcmltO1xuIiwKICAgICIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZVxuICogW2xhbmd1YWdlIHR5cGVdKGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1lY21hc2NyaXB0LWxhbmd1YWdlLXR5cGVzKVxuICogb2YgYE9iamVjdGAuIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0KHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChfLm5vb3ApO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgKHR5cGUgPT0gJ29iamVjdCcgfHwgdHlwZSA9PSAnZnVuY3Rpb24nKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNPYmplY3Q7XG4iLAogICAgImltcG9ydCBiYXNlVHJpbSBmcm9tICcuL19iYXNlVHJpbS5qcyc7XG5pbXBvcnQgaXNPYmplY3QgZnJvbSAnLi9pc09iamVjdC5qcyc7XG5pbXBvcnQgaXNTeW1ib2wgZnJvbSAnLi9pc1N5bWJvbC5qcyc7XG5cbi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE5BTiA9IDAgLyAwO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgYmFkIHNpZ25lZCBoZXhhZGVjaW1hbCBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNCYWRIZXggPSAvXlstK10weFswLTlhLWZdKyQvaTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGJpbmFyeSBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNCaW5hcnkgPSAvXjBiWzAxXSskL2k7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBvY3RhbCBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNPY3RhbCA9IC9eMG9bMC03XSskL2k7XG5cbi8qKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB3aXRob3V0IGEgZGVwZW5kZW5jeSBvbiBgcm9vdGAuICovXG52YXIgZnJlZVBhcnNlSW50ID0gcGFyc2VJbnQ7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIG51bWJlci5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcHJvY2Vzcy5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIG51bWJlci5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50b051bWJlcigzLjIpO1xuICogLy8gPT4gMy4yXG4gKlxuICogXy50b051bWJlcihOdW1iZXIuTUlOX1ZBTFVFKTtcbiAqIC8vID0+IDVlLTMyNFxuICpcbiAqIF8udG9OdW1iZXIoSW5maW5pdHkpO1xuICogLy8gPT4gSW5maW5pdHlcbiAqXG4gKiBfLnRvTnVtYmVyKCczLjInKTtcbiAqIC8vID0+IDMuMlxuICovXG5mdW5jdGlvbiB0b051bWJlcih2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlID09ICdudW1iZXInKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIGlmIChpc1N5bWJvbCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gTkFOO1xuICB9XG4gIGlmIChpc09iamVjdCh2YWx1ZSkpIHtcbiAgICB2YXIgb3RoZXIgPSB0eXBlb2YgdmFsdWUudmFsdWVPZiA9PSAnZnVuY3Rpb24nID8gdmFsdWUudmFsdWVPZigpIDogdmFsdWU7XG4gICAgdmFsdWUgPSBpc09iamVjdChvdGhlcikgPyAob3RoZXIgKyAnJykgOiBvdGhlcjtcbiAgfVxuICBpZiAodHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSAwID8gdmFsdWUgOiArdmFsdWU7XG4gIH1cbiAgdmFsdWUgPSBiYXNlVHJpbSh2YWx1ZSk7XG4gIHZhciBpc0JpbmFyeSA9IHJlSXNCaW5hcnkudGVzdCh2YWx1ZSk7XG4gIHJldHVybiAoaXNCaW5hcnkgfHwgcmVJc09jdGFsLnRlc3QodmFsdWUpKVxuICAgID8gZnJlZVBhcnNlSW50KHZhbHVlLnNsaWNlKDIpLCBpc0JpbmFyeSA/IDIgOiA4KVxuICAgIDogKHJlSXNCYWRIZXgudGVzdCh2YWx1ZSkgPyBOQU4gOiArdmFsdWUpO1xufVxuXG5leHBvcnQgZGVmYXVsdCB0b051bWJlcjtcbiIsCiAgICAiaW1wb3J0IHRvTnVtYmVyIGZyb20gJy4vdG9OdW1iZXIuanMnO1xuXG4vKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBJTkZJTklUWSA9IDEgLyAwLFxuICAgIE1BWF9JTlRFR0VSID0gMS43OTc2OTMxMzQ4NjIzMTU3ZSszMDg7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIGZpbml0ZSBudW1iZXIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjEyLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb252ZXJ0LlxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgY29udmVydGVkIG51bWJlci5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50b0Zpbml0ZSgzLjIpO1xuICogLy8gPT4gMy4yXG4gKlxuICogXy50b0Zpbml0ZShOdW1iZXIuTUlOX1ZBTFVFKTtcbiAqIC8vID0+IDVlLTMyNFxuICpcbiAqIF8udG9GaW5pdGUoSW5maW5pdHkpO1xuICogLy8gPT4gMS43OTc2OTMxMzQ4NjIzMTU3ZSszMDhcbiAqXG4gKiBfLnRvRmluaXRlKCczLjInKTtcbiAqIC8vID0+IDMuMlxuICovXG5mdW5jdGlvbiB0b0Zpbml0ZSh2YWx1ZSkge1xuICBpZiAoIXZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSAwID8gdmFsdWUgOiAwO1xuICB9XG4gIHZhbHVlID0gdG9OdW1iZXIodmFsdWUpO1xuICBpZiAodmFsdWUgPT09IElORklOSVRZIHx8IHZhbHVlID09PSAtSU5GSU5JVFkpIHtcbiAgICB2YXIgc2lnbiA9ICh2YWx1ZSA8IDAgPyAtMSA6IDEpO1xuICAgIHJldHVybiBzaWduICogTUFYX0lOVEVHRVI7XG4gIH1cbiAgcmV0dXJuIHZhbHVlID09PSB2YWx1ZSA/IHZhbHVlIDogMDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdG9GaW5pdGU7XG4iLAogICAgImltcG9ydCB0b0Zpbml0ZSBmcm9tICcuL3RvRmluaXRlLmpzJztcblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGFuIGludGVnZXIuXG4gKlxuICogKipOb3RlOioqIFRoaXMgbWV0aG9kIGlzIGxvb3NlbHkgYmFzZWQgb25cbiAqIFtgVG9JbnRlZ2VyYF0oaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXRvaW50ZWdlcikuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgaW50ZWdlci5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50b0ludGVnZXIoMy4yKTtcbiAqIC8vID0+IDNcbiAqXG4gKiBfLnRvSW50ZWdlcihOdW1iZXIuTUlOX1ZBTFVFKTtcbiAqIC8vID0+IDBcbiAqXG4gKiBfLnRvSW50ZWdlcihJbmZpbml0eSk7XG4gKiAvLyA9PiAxLjc5NzY5MzEzNDg2MjMxNTdlKzMwOFxuICpcbiAqIF8udG9JbnRlZ2VyKCczLjInKTtcbiAqIC8vID0+IDNcbiAqL1xuZnVuY3Rpb24gdG9JbnRlZ2VyKHZhbHVlKSB7XG4gIHZhciByZXN1bHQgPSB0b0Zpbml0ZSh2YWx1ZSksXG4gICAgICByZW1haW5kZXIgPSByZXN1bHQgJSAxO1xuXG4gIHJldHVybiByZXN1bHQgPT09IHJlc3VsdCA/IChyZW1haW5kZXIgPyByZXN1bHQgLSByZW1haW5kZXIgOiByZXN1bHQpIDogMDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdG9JbnRlZ2VyO1xuIiwKICAgICIvKipcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgdGhlIGZpcnN0IGFyZ3VtZW50IGl0IHJlY2VpdmVzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcGFyYW0geyp9IHZhbHVlIEFueSB2YWx1ZS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIGB2YWx1ZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICdhJzogMSB9O1xuICpcbiAqIGNvbnNvbGUubG9nKF8uaWRlbnRpdHkob2JqZWN0KSA9PT0gb2JqZWN0KTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaWRlbnRpdHkodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpZGVudGl0eTtcbiIsCiAgICAiaW1wb3J0IGJhc2VHZXRUYWcgZnJvbSAnLi9fYmFzZUdldFRhZy5qcyc7XG5pbXBvcnQgaXNPYmplY3QgZnJvbSAnLi9pc09iamVjdC5qcyc7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhc3luY1RhZyA9ICdbb2JqZWN0IEFzeW5jRnVuY3Rpb25dJyxcbiAgICBmdW5jVGFnID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBnZW5UYWcgPSAnW29iamVjdCBHZW5lcmF0b3JGdW5jdGlvbl0nLFxuICAgIHByb3h5VGFnID0gJ1tvYmplY3QgUHJveHldJztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYEZ1bmN0aW9uYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBmdW5jdGlvbiwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oXyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0Z1bmN0aW9uKC9hYmMvKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gVGhlIHVzZSBvZiBgT2JqZWN0I3RvU3RyaW5nYCBhdm9pZHMgaXNzdWVzIHdpdGggdGhlIGB0eXBlb2ZgIG9wZXJhdG9yXG4gIC8vIGluIFNhZmFyaSA5IHdoaWNoIHJldHVybnMgJ29iamVjdCcgZm9yIHR5cGVkIGFycmF5cyBhbmQgb3RoZXIgY29uc3RydWN0b3JzLlxuICB2YXIgdGFnID0gYmFzZUdldFRhZyh2YWx1ZSk7XG4gIHJldHVybiB0YWcgPT0gZnVuY1RhZyB8fCB0YWcgPT0gZ2VuVGFnIHx8IHRhZyA9PSBhc3luY1RhZyB8fCB0YWcgPT0gcHJveHlUYWc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzRnVuY3Rpb247XG4iLAogICAgImltcG9ydCByb290IGZyb20gJy4vX3Jvb3QuanMnO1xuXG4vKiogVXNlZCB0byBkZXRlY3Qgb3ZlcnJlYWNoaW5nIGNvcmUtanMgc2hpbXMuICovXG52YXIgY29yZUpzRGF0YSA9IHJvb3RbJ19fY29yZS1qc19zaGFyZWRfXyddO1xuXG5leHBvcnQgZGVmYXVsdCBjb3JlSnNEYXRhO1xuIiwKICAgICJpbXBvcnQgY29yZUpzRGF0YSBmcm9tICcuL19jb3JlSnNEYXRhLmpzJztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IG1ldGhvZHMgbWFzcXVlcmFkaW5nIGFzIG5hdGl2ZS4gKi9cbnZhciBtYXNrU3JjS2V5ID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdWlkID0gL1teLl0rJC8uZXhlYyhjb3JlSnNEYXRhICYmIGNvcmVKc0RhdGEua2V5cyAmJiBjb3JlSnNEYXRhLmtleXMuSUVfUFJPVE8gfHwgJycpO1xuICByZXR1cm4gdWlkID8gKCdTeW1ib2woc3JjKV8xLicgKyB1aWQpIDogJyc7XG59KCkpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgZnVuY2AgaGFzIGl0cyBzb3VyY2UgbWFza2VkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgZnVuY2AgaXMgbWFza2VkLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzTWFza2VkKGZ1bmMpIHtcbiAgcmV0dXJuICEhbWFza1NyY0tleSAmJiAobWFza1NyY0tleSBpbiBmdW5jKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNNYXNrZWQ7XG4iLAogICAgIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBmdW5jUHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ29udmVydHMgYGZ1bmNgIHRvIGl0cyBzb3VyY2UgY29kZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHNvdXJjZSBjb2RlLlxuICovXG5mdW5jdGlvbiB0b1NvdXJjZShmdW5jKSB7XG4gIGlmIChmdW5jICE9IG51bGwpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGZ1bmNUb1N0cmluZy5jYWxsKGZ1bmMpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiAoZnVuYyArICcnKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICB9XG4gIHJldHVybiAnJztcbn1cblxuZXhwb3J0IGRlZmF1bHQgdG9Tb3VyY2U7XG4iLAogICAgImltcG9ydCBpc0Z1bmN0aW9uIGZyb20gJy4vaXNGdW5jdGlvbi5qcyc7XG5pbXBvcnQgaXNNYXNrZWQgZnJvbSAnLi9faXNNYXNrZWQuanMnO1xuaW1wb3J0IGlzT2JqZWN0IGZyb20gJy4vaXNPYmplY3QuanMnO1xuaW1wb3J0IHRvU291cmNlIGZyb20gJy4vX3RvU291cmNlLmpzJztcblxuLyoqXG4gKiBVc2VkIHRvIG1hdGNoIGBSZWdFeHBgXG4gKiBbc3ludGF4IGNoYXJhY3RlcnNdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXBhdHRlcm5zKS5cbiAqL1xudmFyIHJlUmVnRXhwQ2hhciA9IC9bXFxcXF4kLiorPygpW1xcXXt9fF0vZztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGhvc3QgY29uc3RydWN0b3JzIChTYWZhcmkpLiAqL1xudmFyIHJlSXNIb3N0Q3RvciA9IC9eXFxbb2JqZWN0IC4rP0NvbnN0cnVjdG9yXFxdJC87XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGUsXG4gICAgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBkZWNvbXBpbGVkIHNvdXJjZSBvZiBmdW5jdGlvbnMuICovXG52YXIgZnVuY1RvU3RyaW5nID0gZnVuY1Byb3RvLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogVXNlZCB0byBkZXRlY3QgaWYgYSBtZXRob2QgaXMgbmF0aXZlLiAqL1xudmFyIHJlSXNOYXRpdmUgPSBSZWdFeHAoJ14nICtcbiAgZnVuY1RvU3RyaW5nLmNhbGwoaGFzT3duUHJvcGVydHkpLnJlcGxhY2UocmVSZWdFeHBDaGFyLCAnXFxcXCQmJylcbiAgLnJlcGxhY2UoL2hhc093blByb3BlcnR5fChmdW5jdGlvbikuKj8oPz1cXFxcXFwoKXwgZm9yIC4rPyg/PVxcXFxcXF0pL2csICckMS4qPycpICsgJyQnXG4pO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzTmF0aXZlYCB3aXRob3V0IGJhZCBzaGltIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIG5hdGl2ZSBmdW5jdGlvbixcbiAqICBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc05hdGl2ZSh2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0KHZhbHVlKSB8fCBpc01hc2tlZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHBhdHRlcm4gPSBpc0Z1bmN0aW9uKHZhbHVlKSA/IHJlSXNOYXRpdmUgOiByZUlzSG9zdEN0b3I7XG4gIHJldHVybiBwYXR0ZXJuLnRlc3QodG9Tb3VyY2UodmFsdWUpKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUlzTmF0aXZlO1xuIiwKICAgICIvKipcbiAqIEdldHMgdGhlIHZhbHVlIGF0IGBrZXlgIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdF0gVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHByb3BlcnR5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBnZXRWYWx1ZShvYmplY3QsIGtleSkge1xuICByZXR1cm4gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBvYmplY3Rba2V5XTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZ2V0VmFsdWU7XG4iLAogICAgImltcG9ydCBiYXNlSXNOYXRpdmUgZnJvbSAnLi9fYmFzZUlzTmF0aXZlLmpzJztcbmltcG9ydCBnZXRWYWx1ZSBmcm9tICcuL19nZXRWYWx1ZS5qcyc7XG5cbi8qKlxuICogR2V0cyB0aGUgbmF0aXZlIGZ1bmN0aW9uIGF0IGBrZXlgIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIG1ldGhvZCB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZnVuY3Rpb24gaWYgaXQncyBuYXRpdmUsIGVsc2UgYHVuZGVmaW5lZGAuXG4gKi9cbmZ1bmN0aW9uIGdldE5hdGl2ZShvYmplY3QsIGtleSkge1xuICB2YXIgdmFsdWUgPSBnZXRWYWx1ZShvYmplY3QsIGtleSk7XG4gIHJldHVybiBiYXNlSXNOYXRpdmUodmFsdWUpID8gdmFsdWUgOiB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGdldE5hdGl2ZTtcbiIsCiAgICAiaW1wb3J0IGdldE5hdGl2ZSBmcm9tICcuL19nZXROYXRpdmUuanMnO1xuaW1wb3J0IHJvb3QgZnJvbSAnLi9fcm9vdC5qcyc7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBXZWFrTWFwID0gZ2V0TmF0aXZlKHJvb3QsICdXZWFrTWFwJyk7XG5cbmV4cG9ydCBkZWZhdWx0IFdlYWtNYXA7XG4iLAogICAgImltcG9ydCBpc09iamVjdCBmcm9tICcuL2lzT2JqZWN0LmpzJztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0Q3JlYXRlID0gT2JqZWN0LmNyZWF0ZTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5jcmVhdGVgIHdpdGhvdXQgc3VwcG9ydCBmb3IgYXNzaWduaW5nXG4gKiBwcm9wZXJ0aWVzIHRvIHRoZSBjcmVhdGVkIG9iamVjdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHByb3RvIFRoZSBvYmplY3QgdG8gaW5oZXJpdCBmcm9tLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgbmV3IG9iamVjdC5cbiAqL1xudmFyIGJhc2VDcmVhdGUgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIG9iamVjdCgpIHt9XG4gIHJldHVybiBmdW5jdGlvbihwcm90bykge1xuICAgIGlmICghaXNPYmplY3QocHJvdG8pKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIGlmIChvYmplY3RDcmVhdGUpIHtcbiAgICAgIHJldHVybiBvYmplY3RDcmVhdGUocHJvdG8pO1xuICAgIH1cbiAgICBvYmplY3QucHJvdG90eXBlID0gcHJvdG87XG4gICAgdmFyIHJlc3VsdCA9IG5ldyBvYmplY3Q7XG4gICAgb2JqZWN0LnByb3RvdHlwZSA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufSgpKTtcblxuZXhwb3J0IGRlZmF1bHQgYmFzZUNyZWF0ZTtcbiIsCiAgICAiLyoqXG4gKiBBIGZhc3RlciBhbHRlcm5hdGl2ZSB0byBgRnVuY3Rpb24jYXBwbHlgLCB0aGlzIGZ1bmN0aW9uIGludm9rZXMgYGZ1bmNgXG4gKiB3aXRoIHRoZSBgdGhpc2AgYmluZGluZyBvZiBgdGhpc0FyZ2AgYW5kIHRoZSBhcmd1bWVudHMgb2YgYGFyZ3NgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBpbnZva2UuXG4gKiBAcGFyYW0geyp9IHRoaXNBcmcgVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBmdW5jYC5cbiAqIEBwYXJhbSB7QXJyYXl9IGFyZ3MgVGhlIGFyZ3VtZW50cyB0byBpbnZva2UgYGZ1bmNgIHdpdGguXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgcmVzdWx0IG9mIGBmdW5jYC5cbiAqL1xuZnVuY3Rpb24gYXBwbHkoZnVuYywgdGhpc0FyZywgYXJncykge1xuICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XG4gICAgY2FzZSAwOiByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcpO1xuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhcmdzWzBdKTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYXJnc1swXSwgYXJnc1sxXSk7XG4gICAgY2FzZSAzOiByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pO1xuICB9XG4gIHJldHVybiBmdW5jLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBhcHBseTtcbiIsCiAgICAiLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIGB1bmRlZmluZWRgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMi4zLjBcbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udGltZXMoMiwgXy5ub29wKTtcbiAqIC8vID0+IFt1bmRlZmluZWQsIHVuZGVmaW5lZF1cbiAqL1xuZnVuY3Rpb24gbm9vcCgpIHtcbiAgLy8gTm8gb3BlcmF0aW9uIHBlcmZvcm1lZC5cbn1cblxuZXhwb3J0IGRlZmF1bHQgbm9vcDtcbiIsCiAgICAiLyoqXG4gKiBDb3BpZXMgdGhlIHZhbHVlcyBvZiBgc291cmNlYCB0byBgYXJyYXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBzb3VyY2UgVGhlIGFycmF5IHRvIGNvcHkgdmFsdWVzIGZyb20uXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJyYXk9W11dIFRoZSBhcnJheSB0byBjb3B5IHZhbHVlcyB0by5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBgYXJyYXlgLlxuICovXG5mdW5jdGlvbiBjb3B5QXJyYXkoc291cmNlLCBhcnJheSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IHNvdXJjZS5sZW5ndGg7XG5cbiAgYXJyYXkgfHwgKGFycmF5ID0gQXJyYXkobGVuZ3RoKSk7XG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgYXJyYXlbaW5kZXhdID0gc291cmNlW2luZGV4XTtcbiAgfVxuICByZXR1cm4gYXJyYXk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNvcHlBcnJheTtcbiIsCiAgICAiLyoqIFVzZWQgdG8gZGV0ZWN0IGhvdCBmdW5jdGlvbnMgYnkgbnVtYmVyIG9mIGNhbGxzIHdpdGhpbiBhIHNwYW4gb2YgbWlsbGlzZWNvbmRzLiAqL1xudmFyIEhPVF9DT1VOVCA9IDgwMCxcbiAgICBIT1RfU1BBTiA9IDE2O1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlTm93ID0gRGF0ZS5ub3c7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQnbGwgc2hvcnQgb3V0IGFuZCBpbnZva2UgYGlkZW50aXR5YCBpbnN0ZWFkXG4gKiBvZiBgZnVuY2Agd2hlbiBpdCdzIGNhbGxlZCBgSE9UX0NPVU5UYCBvciBtb3JlIHRpbWVzIGluIGBIT1RfU1BBTmBcbiAqIG1pbGxpc2Vjb25kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gcmVzdHJpY3QuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBzaG9ydGFibGUgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIHNob3J0T3V0KGZ1bmMpIHtcbiAgdmFyIGNvdW50ID0gMCxcbiAgICAgIGxhc3RDYWxsZWQgPSAwO1xuXG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RhbXAgPSBuYXRpdmVOb3coKSxcbiAgICAgICAgcmVtYWluaW5nID0gSE9UX1NQQU4gLSAoc3RhbXAgLSBsYXN0Q2FsbGVkKTtcblxuICAgIGxhc3RDYWxsZWQgPSBzdGFtcDtcbiAgICBpZiAocmVtYWluaW5nID4gMCkge1xuICAgICAgaWYgKCsrY291bnQgPj0gSE9UX0NPVU5UKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHNbMF07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvdW50ID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmMuYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBzaG9ydE91dDtcbiIsCiAgICAiLyoqXG4gKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGB2YWx1ZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAyLjQuMFxuICogQGNhdGVnb3J5IFV0aWxcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHJldHVybiBmcm9tIHRoZSBuZXcgZnVuY3Rpb24uXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBjb25zdGFudCBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdHMgPSBfLnRpbWVzKDIsIF8uY29uc3RhbnQoeyAnYSc6IDEgfSkpO1xuICpcbiAqIGNvbnNvbGUubG9nKG9iamVjdHMpO1xuICogLy8gPT4gW3sgJ2EnOiAxIH0sIHsgJ2EnOiAxIH1dXG4gKlxuICogY29uc29sZS5sb2cob2JqZWN0c1swXSA9PT0gb2JqZWN0c1sxXSk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGNvbnN0YW50KHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNvbnN0YW50O1xuIiwKICAgICJpbXBvcnQgZ2V0TmF0aXZlIGZyb20gJy4vX2dldE5hdGl2ZS5qcyc7XG5cbnZhciBkZWZpbmVQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgdHJ5IHtcbiAgICB2YXIgZnVuYyA9IGdldE5hdGl2ZShPYmplY3QsICdkZWZpbmVQcm9wZXJ0eScpO1xuICAgIGZ1bmMoe30sICcnLCB7fSk7XG4gICAgcmV0dXJuIGZ1bmM7XG4gIH0gY2F0Y2ggKGUpIHt9XG59KCkpO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVQcm9wZXJ0eTtcbiIsCiAgICAiaW1wb3J0IGNvbnN0YW50IGZyb20gJy4vY29uc3RhbnQuanMnO1xuaW1wb3J0IGRlZmluZVByb3BlcnR5IGZyb20gJy4vX2RlZmluZVByb3BlcnR5LmpzJztcbmltcG9ydCBpZGVudGl0eSBmcm9tICcuL2lkZW50aXR5LmpzJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgc2V0VG9TdHJpbmdgIHdpdGhvdXQgc3VwcG9ydCBmb3IgaG90IGxvb3Agc2hvcnRpbmcuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHN0cmluZyBUaGUgYHRvU3RyaW5nYCByZXN1bHQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgYGZ1bmNgLlxuICovXG52YXIgYmFzZVNldFRvU3RyaW5nID0gIWRlZmluZVByb3BlcnR5ID8gaWRlbnRpdHkgOiBmdW5jdGlvbihmdW5jLCBzdHJpbmcpIHtcbiAgcmV0dXJuIGRlZmluZVByb3BlcnR5KGZ1bmMsICd0b1N0cmluZycsIHtcbiAgICAnY29uZmlndXJhYmxlJzogdHJ1ZSxcbiAgICAnZW51bWVyYWJsZSc6IGZhbHNlLFxuICAgICd2YWx1ZSc6IGNvbnN0YW50KHN0cmluZyksXG4gICAgJ3dyaXRhYmxlJzogdHJ1ZVxuICB9KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VTZXRUb1N0cmluZztcbiIsCiAgICAiaW1wb3J0IGJhc2VTZXRUb1N0cmluZyBmcm9tICcuL19iYXNlU2V0VG9TdHJpbmcuanMnO1xuaW1wb3J0IHNob3J0T3V0IGZyb20gJy4vX3Nob3J0T3V0LmpzJztcblxuLyoqXG4gKiBTZXRzIHRoZSBgdG9TdHJpbmdgIG1ldGhvZCBvZiBgZnVuY2AgdG8gcmV0dXJuIGBzdHJpbmdgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBzdHJpbmcgVGhlIGB0b1N0cmluZ2AgcmVzdWx0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIGBmdW5jYC5cbiAqL1xudmFyIHNldFRvU3RyaW5nID0gc2hvcnRPdXQoYmFzZVNldFRvU3RyaW5nKTtcblxuZXhwb3J0IGRlZmF1bHQgc2V0VG9TdHJpbmc7XG4iLAogICAgIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLmZvckVhY2hgIGZvciBhcnJheXMgd2l0aG91dCBzdXBwb3J0IGZvclxuICogaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gW2FycmF5XSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBgYXJyYXlgLlxuICovXG5mdW5jdGlvbiBhcnJheUVhY2goYXJyYXksIGl0ZXJhdGVlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gYXJyYXkgPT0gbnVsbCA/IDAgOiBhcnJheS5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBpZiAoaXRlcmF0ZWUoYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpID09PSBmYWxzZSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXJyYXlFYWNoO1xuIiwKICAgICIvKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmZpbmRJbmRleGAgYW5kIGBfLmZpbmRMYXN0SW5kZXhgIHdpdGhvdXRcbiAqIHN1cHBvcnQgZm9yIGl0ZXJhdGVlIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpbnNwZWN0LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcHJlZGljYXRlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcGFyYW0ge251bWJlcn0gZnJvbUluZGV4IFRoZSBpbmRleCB0byBzZWFyY2ggZnJvbS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2Zyb21SaWdodF0gU3BlY2lmeSBpdGVyYXRpbmcgZnJvbSByaWdodCB0byBsZWZ0LlxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIG1hdGNoZWQgdmFsdWUsIGVsc2UgYC0xYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUZpbmRJbmRleChhcnJheSwgcHJlZGljYXRlLCBmcm9tSW5kZXgsIGZyb21SaWdodCkge1xuICB2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoLFxuICAgICAgaW5kZXggPSBmcm9tSW5kZXggKyAoZnJvbVJpZ2h0ID8gMSA6IC0xKTtcblxuICB3aGlsZSAoKGZyb21SaWdodCA/IGluZGV4LS0gOiArK2luZGV4IDwgbGVuZ3RoKSkge1xuICAgIGlmIChwcmVkaWNhdGUoYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpKSB7XG4gICAgICByZXR1cm4gaW5kZXg7XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUZpbmRJbmRleDtcbiIsCiAgICAiLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc05hTmAgd2l0aG91dCBzdXBwb3J0IGZvciBudW1iZXIgb2JqZWN0cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBgTmFOYCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNOYU4odmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9PSB2YWx1ZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUlzTmFOO1xuIiwKICAgICIvKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgXy5pbmRleE9mYCB3aGljaCBwZXJmb3JtcyBzdHJpY3QgZXF1YWxpdHlcbiAqIGNvbXBhcmlzb25zIG9mIHZhbHVlcywgaS5lLiBgPT09YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGluc3BlY3QuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZWFyY2ggZm9yLlxuICogQHBhcmFtIHtudW1iZXJ9IGZyb21JbmRleCBUaGUgaW5kZXggdG8gc2VhcmNoIGZyb20uXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgbWF0Y2hlZCB2YWx1ZSwgZWxzZSBgLTFgLlxuICovXG5mdW5jdGlvbiBzdHJpY3RJbmRleE9mKGFycmF5LCB2YWx1ZSwgZnJvbUluZGV4KSB7XG4gIHZhciBpbmRleCA9IGZyb21JbmRleCAtIDEsXG4gICAgICBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBpZiAoYXJyYXlbaW5kZXhdID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuIGluZGV4O1xuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHN0cmljdEluZGV4T2Y7XG4iLAogICAgImltcG9ydCBiYXNlRmluZEluZGV4IGZyb20gJy4vX2Jhc2VGaW5kSW5kZXguanMnO1xuaW1wb3J0IGJhc2VJc05hTiBmcm9tICcuL19iYXNlSXNOYU4uanMnO1xuaW1wb3J0IHN0cmljdEluZGV4T2YgZnJvbSAnLi9fc3RyaWN0SW5kZXhPZi5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaW5kZXhPZmAgd2l0aG91dCBgZnJvbUluZGV4YCBib3VuZHMgY2hlY2tzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaW5zcGVjdC5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNlYXJjaCBmb3IuXG4gKiBAcGFyYW0ge251bWJlcn0gZnJvbUluZGV4IFRoZSBpbmRleCB0byBzZWFyY2ggZnJvbS5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBtYXRjaGVkIHZhbHVlLCBlbHNlIGAtMWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJbmRleE9mKGFycmF5LCB2YWx1ZSwgZnJvbUluZGV4KSB7XG4gIHJldHVybiB2YWx1ZSA9PT0gdmFsdWVcbiAgICA/IHN0cmljdEluZGV4T2YoYXJyYXksIHZhbHVlLCBmcm9tSW5kZXgpXG4gICAgOiBiYXNlRmluZEluZGV4KGFycmF5LCBiYXNlSXNOYU4sIGZyb21JbmRleCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VJbmRleE9mO1xuIiwKICAgICJpbXBvcnQgYmFzZUluZGV4T2YgZnJvbSAnLi9fYmFzZUluZGV4T2YuanMnO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgXy5pbmNsdWRlc2AgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yXG4gKiBzcGVjaWZ5aW5nIGFuIGluZGV4IHRvIHNlYXJjaCBmcm9tLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJyYXldIFRoZSBhcnJheSB0byBpbnNwZWN0LlxuICogQHBhcmFtIHsqfSB0YXJnZXQgVGhlIHZhbHVlIHRvIHNlYXJjaCBmb3IuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHRhcmdldGAgaXMgZm91bmQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYXJyYXlJbmNsdWRlcyhhcnJheSwgdmFsdWUpIHtcbiAgdmFyIGxlbmd0aCA9IGFycmF5ID09IG51bGwgPyAwIDogYXJyYXkubGVuZ3RoO1xuICByZXR1cm4gISFsZW5ndGggJiYgYmFzZUluZGV4T2YoYXJyYXksIHZhbHVlLCAwKSA+IC0xO1xufVxuXG5leHBvcnQgZGVmYXVsdCBhcnJheUluY2x1ZGVzO1xuIiwKICAgICIvKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBNQVhfU0FGRV9JTlRFR0VSID0gOTAwNzE5OTI1NDc0MDk5MTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IHVuc2lnbmVkIGludGVnZXIgdmFsdWVzLiAqL1xudmFyIHJlSXNVaW50ID0gL14oPzowfFsxLTldXFxkKikkLztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGFycmF5LWxpa2UgaW5kZXguXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHBhcmFtIHtudW1iZXJ9IFtsZW5ndGg9TUFYX1NBRkVfSU5URUdFUl0gVGhlIHVwcGVyIGJvdW5kcyBvZiBhIHZhbGlkIGluZGV4LlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBpbmRleCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0luZGV4KHZhbHVlLCBsZW5ndGgpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIGxlbmd0aCA9IGxlbmd0aCA9PSBudWxsID8gTUFYX1NBRkVfSU5URUdFUiA6IGxlbmd0aDtcblxuICByZXR1cm4gISFsZW5ndGggJiZcbiAgICAodHlwZSA9PSAnbnVtYmVyJyB8fFxuICAgICAgKHR5cGUgIT0gJ3N5bWJvbCcgJiYgcmVJc1VpbnQudGVzdCh2YWx1ZSkpKSAmJlxuICAgICAgICAodmFsdWUgPiAtMSAmJiB2YWx1ZSAlIDEgPT0gMCAmJiB2YWx1ZSA8IGxlbmd0aCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzSW5kZXg7XG4iLAogICAgImltcG9ydCBkZWZpbmVQcm9wZXJ0eSBmcm9tICcuL19kZWZpbmVQcm9wZXJ0eS5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGFzc2lnblZhbHVlYCBhbmQgYGFzc2lnbk1lcmdlVmFsdWVgIHdpdGhvdXRcbiAqIHZhbHVlIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gYXNzaWduLlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYXNzaWduLlxuICovXG5mdW5jdGlvbiBiYXNlQXNzaWduVmFsdWUob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIGlmIChrZXkgPT0gJ19fcHJvdG9fXycgJiYgZGVmaW5lUHJvcGVydHkpIHtcbiAgICBkZWZpbmVQcm9wZXJ0eShvYmplY3QsIGtleSwge1xuICAgICAgJ2NvbmZpZ3VyYWJsZSc6IHRydWUsXG4gICAgICAnZW51bWVyYWJsZSc6IHRydWUsXG4gICAgICAndmFsdWUnOiB2YWx1ZSxcbiAgICAgICd3cml0YWJsZSc6IHRydWVcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBvYmplY3Rba2V5XSA9IHZhbHVlO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VBc3NpZ25WYWx1ZTtcbiIsCiAgICAiLyoqXG4gKiBQZXJmb3JtcyBhXG4gKiBbYFNhbWVWYWx1ZVplcm9gXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1zYW1ldmFsdWV6ZXJvKVxuICogY29tcGFyaXNvbiBiZXR3ZWVuIHR3byB2YWx1ZXMgdG8gZGV0ZXJtaW5lIGlmIHRoZXkgYXJlIGVxdWl2YWxlbnQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0geyp9IG90aGVyIFRoZSBvdGhlciB2YWx1ZSB0byBjb21wYXJlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHsgJ2EnOiAxIH07XG4gKiB2YXIgb3RoZXIgPSB7ICdhJzogMSB9O1xuICpcbiAqIF8uZXEob2JqZWN0LCBvYmplY3QpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uZXEob2JqZWN0LCBvdGhlcik7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uZXEoJ2EnLCAnYScpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uZXEoJ2EnLCBPYmplY3QoJ2EnKSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uZXEoTmFOLCBOYU4pO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBlcSh2YWx1ZSwgb3RoZXIpIHtcbiAgcmV0dXJuIHZhbHVlID09PSBvdGhlciB8fCAodmFsdWUgIT09IHZhbHVlICYmIG90aGVyICE9PSBvdGhlcik7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGVxO1xuIiwKICAgICJpbXBvcnQgYmFzZUFzc2lnblZhbHVlIGZyb20gJy4vX2Jhc2VBc3NpZ25WYWx1ZS5qcyc7XG5pbXBvcnQgZXEgZnJvbSAnLi9lcS5qcyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQXNzaWducyBgdmFsdWVgIHRvIGBrZXlgIG9mIGBvYmplY3RgIGlmIHRoZSBleGlzdGluZyB2YWx1ZSBpcyBub3QgZXF1aXZhbGVudFxuICogdXNpbmcgW2BTYW1lVmFsdWVaZXJvYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtc2FtZXZhbHVlemVybylcbiAqIGZvciBlcXVhbGl0eSBjb21wYXJpc29ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gYXNzaWduLlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYXNzaWduLlxuICovXG5mdW5jdGlvbiBhc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgdmFyIG9ialZhbHVlID0gb2JqZWN0W2tleV07XG4gIGlmICghKGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpICYmIGVxKG9ialZhbHVlLCB2YWx1ZSkpIHx8XG4gICAgICAodmFsdWUgPT09IHVuZGVmaW5lZCAmJiAhKGtleSBpbiBvYmplY3QpKSkge1xuICAgIGJhc2VBc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFzc2lnblZhbHVlO1xuIiwKICAgICJpbXBvcnQgYXNzaWduVmFsdWUgZnJvbSAnLi9fYXNzaWduVmFsdWUuanMnO1xuaW1wb3J0IGJhc2VBc3NpZ25WYWx1ZSBmcm9tICcuL19iYXNlQXNzaWduVmFsdWUuanMnO1xuXG4vKipcbiAqIENvcGllcyBwcm9wZXJ0aWVzIG9mIGBzb3VyY2VgIHRvIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIGZyb20uXG4gKiBAcGFyYW0ge0FycmF5fSBwcm9wcyBUaGUgcHJvcGVydHkgaWRlbnRpZmllcnMgdG8gY29weS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0PXt9XSBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyB0by5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjdXN0b21pemVyXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGNvcGllZCB2YWx1ZXMuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBjb3B5T2JqZWN0KHNvdXJjZSwgcHJvcHMsIG9iamVjdCwgY3VzdG9taXplcikge1xuICB2YXIgaXNOZXcgPSAhb2JqZWN0O1xuICBvYmplY3QgfHwgKG9iamVjdCA9IHt9KTtcblxuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IHByb3BzLmxlbmd0aDtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBrZXkgPSBwcm9wc1tpbmRleF07XG5cbiAgICB2YXIgbmV3VmFsdWUgPSBjdXN0b21pemVyXG4gICAgICA/IGN1c3RvbWl6ZXIob2JqZWN0W2tleV0sIHNvdXJjZVtrZXldLCBrZXksIG9iamVjdCwgc291cmNlKVxuICAgICAgOiB1bmRlZmluZWQ7XG5cbiAgICBpZiAobmV3VmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgbmV3VmFsdWUgPSBzb3VyY2Vba2V5XTtcbiAgICB9XG4gICAgaWYgKGlzTmV3KSB7XG4gICAgICBiYXNlQXNzaWduVmFsdWUob2JqZWN0LCBrZXksIG5ld1ZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXNzaWduVmFsdWUob2JqZWN0LCBrZXksIG5ld1ZhbHVlKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG9iamVjdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY29weU9iamVjdDtcbiIsCiAgICAiaW1wb3J0IGFwcGx5IGZyb20gJy4vX2FwcGx5LmpzJztcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZU1heCA9IE1hdGgubWF4O1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZVJlc3RgIHdoaWNoIHRyYW5zZm9ybXMgdGhlIHJlc3QgYXJyYXkuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGFwcGx5IGEgcmVzdCBwYXJhbWV0ZXIgdG8uXG4gKiBAcGFyYW0ge251bWJlcn0gW3N0YXJ0PWZ1bmMubGVuZ3RoLTFdIFRoZSBzdGFydCBwb3NpdGlvbiBvZiB0aGUgcmVzdCBwYXJhbWV0ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSB0cmFuc2Zvcm0gVGhlIHJlc3QgYXJyYXkgdHJhbnNmb3JtLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIG92ZXJSZXN0KGZ1bmMsIHN0YXJ0LCB0cmFuc2Zvcm0pIHtcbiAgc3RhcnQgPSBuYXRpdmVNYXgoc3RhcnQgPT09IHVuZGVmaW5lZCA/IChmdW5jLmxlbmd0aCAtIDEpIDogc3RhcnQsIDApO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsXG4gICAgICAgIGluZGV4ID0gLTEsXG4gICAgICAgIGxlbmd0aCA9IG5hdGl2ZU1heChhcmdzLmxlbmd0aCAtIHN0YXJ0LCAwKSxcbiAgICAgICAgYXJyYXkgPSBBcnJheShsZW5ndGgpO1xuXG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIGFycmF5W2luZGV4XSA9IGFyZ3Nbc3RhcnQgKyBpbmRleF07XG4gICAgfVxuICAgIGluZGV4ID0gLTE7XG4gICAgdmFyIG90aGVyQXJncyA9IEFycmF5KHN0YXJ0ICsgMSk7XG4gICAgd2hpbGUgKCsraW5kZXggPCBzdGFydCkge1xuICAgICAgb3RoZXJBcmdzW2luZGV4XSA9IGFyZ3NbaW5kZXhdO1xuICAgIH1cbiAgICBvdGhlckFyZ3Nbc3RhcnRdID0gdHJhbnNmb3JtKGFycmF5KTtcbiAgICByZXR1cm4gYXBwbHkoZnVuYywgdGhpcywgb3RoZXJBcmdzKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgb3ZlclJlc3Q7XG4iLAogICAgImltcG9ydCBpZGVudGl0eSBmcm9tICcuL2lkZW50aXR5LmpzJztcbmltcG9ydCBvdmVyUmVzdCBmcm9tICcuL19vdmVyUmVzdC5qcyc7XG5pbXBvcnQgc2V0VG9TdHJpbmcgZnJvbSAnLi9fc2V0VG9TdHJpbmcuanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnJlc3RgIHdoaWNoIGRvZXNuJ3QgdmFsaWRhdGUgb3IgY29lcmNlIGFyZ3VtZW50cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gYXBwbHkgYSByZXN0IHBhcmFtZXRlciB0by5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbc3RhcnQ9ZnVuYy5sZW5ndGgtMV0gVGhlIHN0YXJ0IHBvc2l0aW9uIG9mIHRoZSByZXN0IHBhcmFtZXRlci5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlUmVzdChmdW5jLCBzdGFydCkge1xuICByZXR1cm4gc2V0VG9TdHJpbmcob3ZlclJlc3QoZnVuYywgc3RhcnQsIGlkZW50aXR5KSwgZnVuYyArICcnKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZVJlc3Q7XG4iLAogICAgIi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYXJyYXktbGlrZSBsZW5ndGguXG4gKlxuICogKipOb3RlOioqIFRoaXMgbWV0aG9kIGlzIGxvb3NlbHkgYmFzZWQgb25cbiAqIFtgVG9MZW5ndGhgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy10b2xlbmd0aCkuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBsZW5ndGgsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0xlbmd0aCgzKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzTGVuZ3RoKE51bWJlci5NSU5fVkFMVUUpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzTGVuZ3RoKEluZmluaXR5KTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0xlbmd0aCgnMycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNMZW5ndGgodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJyAmJlxuICAgIHZhbHVlID4gLTEgJiYgdmFsdWUgJSAxID09IDAgJiYgdmFsdWUgPD0gTUFYX1NBRkVfSU5URUdFUjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNMZW5ndGg7XG4iLAogICAgImltcG9ydCBpc0Z1bmN0aW9uIGZyb20gJy4vaXNGdW5jdGlvbi5qcyc7XG5pbXBvcnQgaXNMZW5ndGggZnJvbSAnLi9pc0xlbmd0aC5qcyc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYXJyYXktbGlrZS4gQSB2YWx1ZSBpcyBjb25zaWRlcmVkIGFycmF5LWxpa2UgaWYgaXQnc1xuICogbm90IGEgZnVuY3Rpb24gYW5kIGhhcyBhIGB2YWx1ZS5sZW5ndGhgIHRoYXQncyBhbiBpbnRlZ2VyIGdyZWF0ZXIgdGhhbiBvclxuICogZXF1YWwgdG8gYDBgIGFuZCBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gYE51bWJlci5NQVhfU0FGRV9JTlRFR0VSYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhcnJheS1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoJ2FiYycpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlMaWtlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIGlzTGVuZ3RoKHZhbHVlLmxlbmd0aCkgJiYgIWlzRnVuY3Rpb24odmFsdWUpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc0FycmF5TGlrZTtcbiIsCiAgICAiaW1wb3J0IGVxIGZyb20gJy4vZXEuanMnO1xuaW1wb3J0IGlzQXJyYXlMaWtlIGZyb20gJy4vaXNBcnJheUxpa2UuanMnO1xuaW1wb3J0IGlzSW5kZXggZnJvbSAnLi9faXNJbmRleC5qcyc7XG5pbXBvcnQgaXNPYmplY3QgZnJvbSAnLi9pc09iamVjdC5qcyc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBnaXZlbiBhcmd1bWVudHMgYXJlIGZyb20gYW4gaXRlcmF0ZWUgY2FsbC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgcG90ZW50aWFsIGl0ZXJhdGVlIHZhbHVlIGFyZ3VtZW50LlxuICogQHBhcmFtIHsqfSBpbmRleCBUaGUgcG90ZW50aWFsIGl0ZXJhdGVlIGluZGV4IG9yIGtleSBhcmd1bWVudC5cbiAqIEBwYXJhbSB7Kn0gb2JqZWN0IFRoZSBwb3RlbnRpYWwgaXRlcmF0ZWUgb2JqZWN0IGFyZ3VtZW50LlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBhcmd1bWVudHMgYXJlIGZyb20gYW4gaXRlcmF0ZWUgY2FsbCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzSXRlcmF0ZWVDYWxsKHZhbHVlLCBpbmRleCwgb2JqZWN0KSB7XG4gIGlmICghaXNPYmplY3Qob2JqZWN0KSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgdHlwZSA9IHR5cGVvZiBpbmRleDtcbiAgaWYgKHR5cGUgPT0gJ251bWJlcidcbiAgICAgICAgPyAoaXNBcnJheUxpa2Uob2JqZWN0KSAmJiBpc0luZGV4KGluZGV4LCBvYmplY3QubGVuZ3RoKSlcbiAgICAgICAgOiAodHlwZSA9PSAnc3RyaW5nJyAmJiBpbmRleCBpbiBvYmplY3QpXG4gICAgICApIHtcbiAgICByZXR1cm4gZXEob2JqZWN0W2luZGV4XSwgdmFsdWUpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNJdGVyYXRlZUNhbGw7XG4iLAogICAgImltcG9ydCBiYXNlUmVzdCBmcm9tICcuL19iYXNlUmVzdC5qcyc7XG5pbXBvcnQgaXNJdGVyYXRlZUNhbGwgZnJvbSAnLi9faXNJdGVyYXRlZUNhbGwuanMnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiBsaWtlIGBfLmFzc2lnbmAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGFzc2lnbmVyIFRoZSBmdW5jdGlvbiB0byBhc3NpZ24gdmFsdWVzLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYXNzaWduZXIgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUFzc2lnbmVyKGFzc2lnbmVyKSB7XG4gIHJldHVybiBiYXNlUmVzdChmdW5jdGlvbihvYmplY3QsIHNvdXJjZXMpIHtcbiAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgbGVuZ3RoID0gc291cmNlcy5sZW5ndGgsXG4gICAgICAgIGN1c3RvbWl6ZXIgPSBsZW5ndGggPiAxID8gc291cmNlc1tsZW5ndGggLSAxXSA6IHVuZGVmaW5lZCxcbiAgICAgICAgZ3VhcmQgPSBsZW5ndGggPiAyID8gc291cmNlc1syXSA6IHVuZGVmaW5lZDtcblxuICAgIGN1c3RvbWl6ZXIgPSAoYXNzaWduZXIubGVuZ3RoID4gMyAmJiB0eXBlb2YgY3VzdG9taXplciA9PSAnZnVuY3Rpb24nKVxuICAgICAgPyAobGVuZ3RoLS0sIGN1c3RvbWl6ZXIpXG4gICAgICA6IHVuZGVmaW5lZDtcblxuICAgIGlmIChndWFyZCAmJiBpc0l0ZXJhdGVlQ2FsbChzb3VyY2VzWzBdLCBzb3VyY2VzWzFdLCBndWFyZCkpIHtcbiAgICAgIGN1c3RvbWl6ZXIgPSBsZW5ndGggPCAzID8gdW5kZWZpbmVkIDogY3VzdG9taXplcjtcbiAgICAgIGxlbmd0aCA9IDE7XG4gICAgfVxuICAgIG9iamVjdCA9IE9iamVjdChvYmplY3QpO1xuICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICB2YXIgc291cmNlID0gc291cmNlc1tpbmRleF07XG4gICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgIGFzc2lnbmVyKG9iamVjdCwgc291cmNlLCBpbmRleCwgY3VzdG9taXplcik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmplY3Q7XG4gIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVBc3NpZ25lcjtcbiIsCiAgICAiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBsaWtlbHkgYSBwcm90b3R5cGUgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgcHJvdG90eXBlLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzUHJvdG90eXBlKHZhbHVlKSB7XG4gIHZhciBDdG9yID0gdmFsdWUgJiYgdmFsdWUuY29uc3RydWN0b3IsXG4gICAgICBwcm90byA9ICh0eXBlb2YgQ3RvciA9PSAnZnVuY3Rpb24nICYmIEN0b3IucHJvdG90eXBlKSB8fCBvYmplY3RQcm90bztcblxuICByZXR1cm4gdmFsdWUgPT09IHByb3RvO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc1Byb3RvdHlwZTtcbiIsCiAgICAiLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy50aW1lc2Agd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzXG4gKiBvciBtYXggYXJyYXkgbGVuZ3RoIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IG4gVGhlIG51bWJlciBvZiB0aW1lcyB0byBpbnZva2UgYGl0ZXJhdGVlYC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHJlc3VsdHMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VUaW1lcyhuLCBpdGVyYXRlZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIHJlc3VsdCA9IEFycmF5KG4pO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbikge1xuICAgIHJlc3VsdFtpbmRleF0gPSBpdGVyYXRlZShpbmRleCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZVRpbWVzO1xuIiwKICAgICJpbXBvcnQgYmFzZUdldFRhZyBmcm9tICcuL19iYXNlR2V0VGFnLmpzJztcbmltcG9ydCBpc09iamVjdExpa2UgZnJvbSAnLi9pc09iamVjdExpa2UuanMnO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzQXJndW1lbnRzYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBgYXJndW1lbnRzYCBvYmplY3QsXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc0FyZ3VtZW50cyh2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBiYXNlR2V0VGFnKHZhbHVlKSA9PSBhcmdzVGFnO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlSXNBcmd1bWVudHM7XG4iLAogICAgImltcG9ydCBiYXNlSXNBcmd1bWVudHMgZnJvbSAnLi9fYmFzZUlzQXJndW1lbnRzLmpzJztcbmltcG9ydCBpc09iamVjdExpa2UgZnJvbSAnLi9pc09iamVjdExpa2UuanMnO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IG9iamVjdFByb3RvLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGxpa2VseSBhbiBgYXJndW1lbnRzYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FyZ3VtZW50cyhmdW5jdGlvbigpIHsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJndW1lbnRzKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcmd1bWVudHMgPSBiYXNlSXNBcmd1bWVudHMoZnVuY3Rpb24oKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSkgPyBiYXNlSXNBcmd1bWVudHMgOiBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCAnY2FsbGVlJykgJiZcbiAgICAhcHJvcGVydHlJc0VudW1lcmFibGUuY2FsbCh2YWx1ZSwgJ2NhbGxlZScpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgaXNBcmd1bWVudHM7XG4iLAogICAgIi8qKlxuICogVGhpcyBtZXRob2QgcmV0dXJucyBgZmFsc2VgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4xMy4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50aW1lcygyLCBfLnN0dWJGYWxzZSk7XG4gKiAvLyA9PiBbZmFsc2UsIGZhbHNlXVxuICovXG5mdW5jdGlvbiBzdHViRmFsc2UoKSB7XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgc3R1YkZhbHNlO1xuIiwKICAgICJpbXBvcnQgcm9vdCBmcm9tICcuL19yb290LmpzJztcbmltcG9ydCBzdHViRmFsc2UgZnJvbSAnLi9zdHViRmFsc2UuanMnO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGV4cG9ydHNgLiAqL1xudmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cyAmJiAhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWAuICovXG52YXIgZnJlZU1vZHVsZSA9IGZyZWVFeHBvcnRzICYmIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmICFtb2R1bGUubm9kZVR5cGUgJiYgbW9kdWxlO1xuXG4vKiogRGV0ZWN0IHRoZSBwb3B1bGFyIENvbW1vbkpTIGV4dGVuc2lvbiBgbW9kdWxlLmV4cG9ydHNgLiAqL1xudmFyIG1vZHVsZUV4cG9ydHMgPSBmcmVlTW9kdWxlICYmIGZyZWVNb2R1bGUuZXhwb3J0cyA9PT0gZnJlZUV4cG9ydHM7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIEJ1ZmZlciA9IG1vZHVsZUV4cG9ydHMgPyByb290LkJ1ZmZlciA6IHVuZGVmaW5lZDtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUlzQnVmZmVyID0gQnVmZmVyID8gQnVmZmVyLmlzQnVmZmVyIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgYnVmZmVyLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4zLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgYnVmZmVyLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNCdWZmZXIobmV3IEJ1ZmZlcigyKSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0J1ZmZlcihuZXcgVWludDhBcnJheSgyKSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNCdWZmZXIgPSBuYXRpdmVJc0J1ZmZlciB8fCBzdHViRmFsc2U7XG5cbmV4cG9ydCBkZWZhdWx0IGlzQnVmZmVyO1xuIiwKICAgICJpbXBvcnQgYmFzZUdldFRhZyBmcm9tICcuL19iYXNlR2V0VGFnLmpzJztcbmltcG9ydCBpc0xlbmd0aCBmcm9tICcuL2lzTGVuZ3RoLmpzJztcbmltcG9ydCBpc09iamVjdExpa2UgZnJvbSAnLi9pc09iamVjdExpa2UuanMnO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nLFxuICAgIGFycmF5VGFnID0gJ1tvYmplY3QgQXJyYXldJyxcbiAgICBib29sVGFnID0gJ1tvYmplY3QgQm9vbGVhbl0nLFxuICAgIGRhdGVUYWcgPSAnW29iamVjdCBEYXRlXScsXG4gICAgZXJyb3JUYWcgPSAnW29iamVjdCBFcnJvcl0nLFxuICAgIGZ1bmNUYWcgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgIG1hcFRhZyA9ICdbb2JqZWN0IE1hcF0nLFxuICAgIG51bWJlclRhZyA9ICdbb2JqZWN0IE51bWJlcl0nLFxuICAgIG9iamVjdFRhZyA9ICdbb2JqZWN0IE9iamVjdF0nLFxuICAgIHJlZ2V4cFRhZyA9ICdbb2JqZWN0IFJlZ0V4cF0nLFxuICAgIHNldFRhZyA9ICdbb2JqZWN0IFNldF0nLFxuICAgIHN0cmluZ1RhZyA9ICdbb2JqZWN0IFN0cmluZ10nLFxuICAgIHdlYWtNYXBUYWcgPSAnW29iamVjdCBXZWFrTWFwXSc7XG5cbnZhciBhcnJheUJ1ZmZlclRhZyA9ICdbb2JqZWN0IEFycmF5QnVmZmVyXScsXG4gICAgZGF0YVZpZXdUYWcgPSAnW29iamVjdCBEYXRhVmlld10nLFxuICAgIGZsb2F0MzJUYWcgPSAnW29iamVjdCBGbG9hdDMyQXJyYXldJyxcbiAgICBmbG9hdDY0VGFnID0gJ1tvYmplY3QgRmxvYXQ2NEFycmF5XScsXG4gICAgaW50OFRhZyA9ICdbb2JqZWN0IEludDhBcnJheV0nLFxuICAgIGludDE2VGFnID0gJ1tvYmplY3QgSW50MTZBcnJheV0nLFxuICAgIGludDMyVGFnID0gJ1tvYmplY3QgSW50MzJBcnJheV0nLFxuICAgIHVpbnQ4VGFnID0gJ1tvYmplY3QgVWludDhBcnJheV0nLFxuICAgIHVpbnQ4Q2xhbXBlZFRhZyA9ICdbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XScsXG4gICAgdWludDE2VGFnID0gJ1tvYmplY3QgVWludDE2QXJyYXldJyxcbiAgICB1aW50MzJUYWcgPSAnW29iamVjdCBVaW50MzJBcnJheV0nO1xuXG4vKiogVXNlZCB0byBpZGVudGlmeSBgdG9TdHJpbmdUYWdgIHZhbHVlcyBvZiB0eXBlZCBhcnJheXMuICovXG52YXIgdHlwZWRBcnJheVRhZ3MgPSB7fTtcbnR5cGVkQXJyYXlUYWdzW2Zsb2F0MzJUYWddID0gdHlwZWRBcnJheVRhZ3NbZmxvYXQ2NFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbaW50OFRhZ10gPSB0eXBlZEFycmF5VGFnc1tpbnQxNlRhZ10gPVxudHlwZWRBcnJheVRhZ3NbaW50MzJUYWddID0gdHlwZWRBcnJheVRhZ3NbdWludDhUYWddID1cbnR5cGVkQXJyYXlUYWdzW3VpbnQ4Q2xhbXBlZFRhZ10gPSB0eXBlZEFycmF5VGFnc1t1aW50MTZUYWddID1cbnR5cGVkQXJyYXlUYWdzW3VpbnQzMlRhZ10gPSB0cnVlO1xudHlwZWRBcnJheVRhZ3NbYXJnc1RhZ10gPSB0eXBlZEFycmF5VGFnc1thcnJheVRhZ10gPVxudHlwZWRBcnJheVRhZ3NbYXJyYXlCdWZmZXJUYWddID0gdHlwZWRBcnJheVRhZ3NbYm9vbFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbZGF0YVZpZXdUYWddID0gdHlwZWRBcnJheVRhZ3NbZGF0ZVRhZ10gPVxudHlwZWRBcnJheVRhZ3NbZXJyb3JUYWddID0gdHlwZWRBcnJheVRhZ3NbZnVuY1RhZ10gPVxudHlwZWRBcnJheVRhZ3NbbWFwVGFnXSA9IHR5cGVkQXJyYXlUYWdzW251bWJlclRhZ10gPVxudHlwZWRBcnJheVRhZ3Nbb2JqZWN0VGFnXSA9IHR5cGVkQXJyYXlUYWdzW3JlZ2V4cFRhZ10gPVxudHlwZWRBcnJheVRhZ3Nbc2V0VGFnXSA9IHR5cGVkQXJyYXlUYWdzW3N0cmluZ1RhZ10gPVxudHlwZWRBcnJheVRhZ3Nbd2Vha01hcFRhZ10gPSBmYWxzZTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc1R5cGVkQXJyYXlgIHdpdGhvdXQgTm9kZS5qcyBvcHRpbWl6YXRpb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdHlwZWQgYXJyYXksIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUlzVHlwZWRBcnJheSh2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJlxuICAgIGlzTGVuZ3RoKHZhbHVlLmxlbmd0aCkgJiYgISF0eXBlZEFycmF5VGFnc1tiYXNlR2V0VGFnKHZhbHVlKV07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VJc1R5cGVkQXJyYXk7XG4iLAogICAgIi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udW5hcnlgIHdpdGhvdXQgc3VwcG9ydCBmb3Igc3RvcmluZyBtZXRhZGF0YS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY2FwIGFyZ3VtZW50cyBmb3IuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBjYXBwZWQgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VVbmFyeShmdW5jKSB7XG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiBmdW5jKHZhbHVlKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZVVuYXJ5O1xuIiwKICAgICJpbXBvcnQgZnJlZUdsb2JhbCBmcm9tICcuL19mcmVlR2xvYmFsLmpzJztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBleHBvcnRzYC4gKi9cbnZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHMgJiYgIWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgLiAqL1xudmFyIGZyZWVNb2R1bGUgPSBmcmVlRXhwb3J0cyAmJiB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblxuLyoqIERldGVjdCB0aGUgcG9wdWxhciBDb21tb25KUyBleHRlbnNpb24gYG1vZHVsZS5leHBvcnRzYC4gKi9cbnZhciBtb2R1bGVFeHBvcnRzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLmV4cG9ydHMgPT09IGZyZWVFeHBvcnRzO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHByb2Nlc3NgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlUHJvY2VzcyA9IG1vZHVsZUV4cG9ydHMgJiYgZnJlZUdsb2JhbC5wcm9jZXNzO1xuXG4vKiogVXNlZCB0byBhY2Nlc3MgZmFzdGVyIE5vZGUuanMgaGVscGVycy4gKi9cbnZhciBub2RlVXRpbCA9IChmdW5jdGlvbigpIHtcbiAgdHJ5IHtcbiAgICAvLyBVc2UgYHV0aWwudHlwZXNgIGZvciBOb2RlLmpzIDEwKy5cbiAgICB2YXIgdHlwZXMgPSBmcmVlTW9kdWxlICYmIGZyZWVNb2R1bGUucmVxdWlyZSAmJiBmcmVlTW9kdWxlLnJlcXVpcmUoJ3V0aWwnKS50eXBlcztcblxuICAgIGlmICh0eXBlcykge1xuICAgICAgcmV0dXJuIHR5cGVzO1xuICAgIH1cblxuICAgIC8vIExlZ2FjeSBgcHJvY2Vzcy5iaW5kaW5nKCd1dGlsJylgIGZvciBOb2RlLmpzIDwgMTAuXG4gICAgcmV0dXJuIGZyZWVQcm9jZXNzICYmIGZyZWVQcm9jZXNzLmJpbmRpbmcgJiYgZnJlZVByb2Nlc3MuYmluZGluZygndXRpbCcpO1xuICB9IGNhdGNoIChlKSB7fVxufSgpKTtcblxuZXhwb3J0IGRlZmF1bHQgbm9kZVV0aWw7XG4iLAogICAgImltcG9ydCBiYXNlSXNUeXBlZEFycmF5IGZyb20gJy4vX2Jhc2VJc1R5cGVkQXJyYXkuanMnO1xuaW1wb3J0IGJhc2VVbmFyeSBmcm9tICcuL19iYXNlVW5hcnkuanMnO1xuaW1wb3J0IG5vZGVVdGlsIGZyb20gJy4vX25vZGVVdGlsLmpzJztcblxuLyogTm9kZS5qcyBoZWxwZXIgcmVmZXJlbmNlcy4gKi9cbnZhciBub2RlSXNUeXBlZEFycmF5ID0gbm9kZVV0aWwgJiYgbm9kZVV0aWwuaXNUeXBlZEFycmF5O1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSB0eXBlZCBhcnJheS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHR5cGVkIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNUeXBlZEFycmF5KG5ldyBVaW50OEFycmF5KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzVHlwZWRBcnJheShbXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNUeXBlZEFycmF5ID0gbm9kZUlzVHlwZWRBcnJheSA/IGJhc2VVbmFyeShub2RlSXNUeXBlZEFycmF5KSA6IGJhc2VJc1R5cGVkQXJyYXk7XG5cbmV4cG9ydCBkZWZhdWx0IGlzVHlwZWRBcnJheTtcbiIsCiAgICAiaW1wb3J0IGJhc2VUaW1lcyBmcm9tICcuL19iYXNlVGltZXMuanMnO1xuaW1wb3J0IGlzQXJndW1lbnRzIGZyb20gJy4vaXNBcmd1bWVudHMuanMnO1xuaW1wb3J0IGlzQXJyYXkgZnJvbSAnLi9pc0FycmF5LmpzJztcbmltcG9ydCBpc0J1ZmZlciBmcm9tICcuL2lzQnVmZmVyLmpzJztcbmltcG9ydCBpc0luZGV4IGZyb20gJy4vX2lzSW5kZXguanMnO1xuaW1wb3J0IGlzVHlwZWRBcnJheSBmcm9tICcuL2lzVHlwZWRBcnJheS5qcyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiB0aGUgYXJyYXktbGlrZSBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaW5oZXJpdGVkIFNwZWNpZnkgcmV0dXJuaW5nIGluaGVyaXRlZCBwcm9wZXJ0eSBuYW1lcy5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGFycmF5TGlrZUtleXModmFsdWUsIGluaGVyaXRlZCkge1xuICB2YXIgaXNBcnIgPSBpc0FycmF5KHZhbHVlKSxcbiAgICAgIGlzQXJnID0gIWlzQXJyICYmIGlzQXJndW1lbnRzKHZhbHVlKSxcbiAgICAgIGlzQnVmZiA9ICFpc0FyciAmJiAhaXNBcmcgJiYgaXNCdWZmZXIodmFsdWUpLFxuICAgICAgaXNUeXBlID0gIWlzQXJyICYmICFpc0FyZyAmJiAhaXNCdWZmICYmIGlzVHlwZWRBcnJheSh2YWx1ZSksXG4gICAgICBza2lwSW5kZXhlcyA9IGlzQXJyIHx8IGlzQXJnIHx8IGlzQnVmZiB8fCBpc1R5cGUsXG4gICAgICByZXN1bHQgPSBza2lwSW5kZXhlcyA/IGJhc2VUaW1lcyh2YWx1ZS5sZW5ndGgsIFN0cmluZykgOiBbXSxcbiAgICAgIGxlbmd0aCA9IHJlc3VsdC5sZW5ndGg7XG5cbiAgZm9yICh2YXIga2V5IGluIHZhbHVlKSB7XG4gICAgaWYgKChpbmhlcml0ZWQgfHwgaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwga2V5KSkgJiZcbiAgICAgICAgIShza2lwSW5kZXhlcyAmJiAoXG4gICAgICAgICAgIC8vIFNhZmFyaSA5IGhhcyBlbnVtZXJhYmxlIGBhcmd1bWVudHMubGVuZ3RoYCBpbiBzdHJpY3QgbW9kZS5cbiAgICAgICAgICAga2V5ID09ICdsZW5ndGgnIHx8XG4gICAgICAgICAgIC8vIE5vZGUuanMgMC4xMCBoYXMgZW51bWVyYWJsZSBub24taW5kZXggcHJvcGVydGllcyBvbiBidWZmZXJzLlxuICAgICAgICAgICAoaXNCdWZmICYmIChrZXkgPT0gJ29mZnNldCcgfHwga2V5ID09ICdwYXJlbnQnKSkgfHxcbiAgICAgICAgICAgLy8gUGhhbnRvbUpTIDIgaGFzIGVudW1lcmFibGUgbm9uLWluZGV4IHByb3BlcnRpZXMgb24gdHlwZWQgYXJyYXlzLlxuICAgICAgICAgICAoaXNUeXBlICYmIChrZXkgPT0gJ2J1ZmZlcicgfHwga2V5ID09ICdieXRlTGVuZ3RoJyB8fCBrZXkgPT0gJ2J5dGVPZmZzZXQnKSkgfHxcbiAgICAgICAgICAgLy8gU2tpcCBpbmRleCBwcm9wZXJ0aWVzLlxuICAgICAgICAgICBpc0luZGV4KGtleSwgbGVuZ3RoKVxuICAgICAgICApKSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXJyYXlMaWtlS2V5cztcbiIsCiAgICAiLyoqXG4gKiBDcmVhdGVzIGEgdW5hcnkgZnVuY3Rpb24gdGhhdCBpbnZva2VzIGBmdW5jYCB3aXRoIGl0cyBhcmd1bWVudCB0cmFuc2Zvcm1lZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gd3JhcC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHRyYW5zZm9ybSBUaGUgYXJndW1lbnQgdHJhbnNmb3JtLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIG92ZXJBcmcoZnVuYywgdHJhbnNmb3JtKSB7XG4gIHJldHVybiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gZnVuYyh0cmFuc2Zvcm0oYXJnKSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IG92ZXJBcmc7XG4iLAogICAgImltcG9ydCBvdmVyQXJnIGZyb20gJy4vX292ZXJBcmcuanMnO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlS2V5cyA9IG92ZXJBcmcoT2JqZWN0LmtleXMsIE9iamVjdCk7XG5cbmV4cG9ydCBkZWZhdWx0IG5hdGl2ZUtleXM7XG4iLAogICAgImltcG9ydCBpc1Byb3RvdHlwZSBmcm9tICcuL19pc1Byb3RvdHlwZS5qcyc7XG5pbXBvcnQgbmF0aXZlS2V5cyBmcm9tICcuL19uYXRpdmVLZXlzLmpzJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5rZXlzYCB3aGljaCBkb2Vzbid0IHRyZWF0IHNwYXJzZSBhcnJheXMgYXMgZGVuc2UuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VLZXlzKG9iamVjdCkge1xuICBpZiAoIWlzUHJvdG90eXBlKG9iamVjdCkpIHtcbiAgICByZXR1cm4gbmF0aXZlS2V5cyhvYmplY3QpO1xuICB9XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIE9iamVjdChvYmplY3QpKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpICYmIGtleSAhPSAnY29uc3RydWN0b3InKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlS2V5cztcbiIsCiAgICAiaW1wb3J0IGFycmF5TGlrZUtleXMgZnJvbSAnLi9fYXJyYXlMaWtlS2V5cy5qcyc7XG5pbXBvcnQgYmFzZUtleXMgZnJvbSAnLi9fYmFzZUtleXMuanMnO1xuaW1wb3J0IGlzQXJyYXlMaWtlIGZyb20gJy4vaXNBcnJheUxpa2UuanMnO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIG93biBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIG9mIGBvYmplY3RgLlxuICpcbiAqICoqTm90ZToqKiBOb24tb2JqZWN0IHZhbHVlcyBhcmUgY29lcmNlZCB0byBvYmplY3RzLiBTZWUgdGhlXG4gKiBbRVMgc3BlY10oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LmtleXMpXG4gKiBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIEZvbygpIHtcbiAqICAgdGhpcy5hID0gMTtcbiAqICAgdGhpcy5iID0gMjtcbiAqIH1cbiAqXG4gKiBGb28ucHJvdG90eXBlLmMgPSAzO1xuICpcbiAqIF8ua2V5cyhuZXcgRm9vKTtcbiAqIC8vID0+IFsnYScsICdiJ10gKGl0ZXJhdGlvbiBvcmRlciBpcyBub3QgZ3VhcmFudGVlZClcbiAqXG4gKiBfLmtleXMoJ2hpJyk7XG4gKiAvLyA9PiBbJzAnLCAnMSddXG4gKi9cbmZ1bmN0aW9uIGtleXMob2JqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5TGlrZShvYmplY3QpID8gYXJyYXlMaWtlS2V5cyhvYmplY3QpIDogYmFzZUtleXMob2JqZWN0KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQga2V5cztcbiIsCiAgICAiLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIGxpa2VcbiAqIFtgT2JqZWN0LmtleXNgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3Qua2V5cylcbiAqIGV4Y2VwdCB0aGF0IGl0IGluY2x1ZGVzIGluaGVyaXRlZCBlbnVtZXJhYmxlIHByb3BlcnRpZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIG5hdGl2ZUtleXNJbihvYmplY3QpIHtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICBpZiAob2JqZWN0ICE9IG51bGwpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gT2JqZWN0KG9iamVjdCkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5hdGl2ZUtleXNJbjtcbiIsCiAgICAiaW1wb3J0IGlzT2JqZWN0IGZyb20gJy4vaXNPYmplY3QuanMnO1xuaW1wb3J0IGlzUHJvdG90eXBlIGZyb20gJy4vX2lzUHJvdG90eXBlLmpzJztcbmltcG9ydCBuYXRpdmVLZXlzSW4gZnJvbSAnLi9fbmF0aXZlS2V5c0luLmpzJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5rZXlzSW5gIHdoaWNoIGRvZXNuJ3QgdHJlYXQgc3BhcnNlIGFycmF5cyBhcyBkZW5zZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gYmFzZUtleXNJbihvYmplY3QpIHtcbiAgaWYgKCFpc09iamVjdChvYmplY3QpKSB7XG4gICAgcmV0dXJuIG5hdGl2ZUtleXNJbihvYmplY3QpO1xuICB9XG4gIHZhciBpc1Byb3RvID0gaXNQcm90b3R5cGUob2JqZWN0KSxcbiAgICAgIHJlc3VsdCA9IFtdO1xuXG4gIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICBpZiAoIShrZXkgPT0gJ2NvbnN0cnVjdG9yJyAmJiAoaXNQcm90byB8fCAhaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkpKSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUtleXNJbjtcbiIsCiAgICAiaW1wb3J0IGFycmF5TGlrZUtleXMgZnJvbSAnLi9fYXJyYXlMaWtlS2V5cy5qcyc7XG5pbXBvcnQgYmFzZUtleXNJbiBmcm9tICcuL19iYXNlS2V5c0luLmpzJztcbmltcG9ydCBpc0FycmF5TGlrZSBmcm9tICcuL2lzQXJyYXlMaWtlLmpzJztcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gYW5kIGluaGVyaXRlZCBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIG9mIGBvYmplY3RgLlxuICpcbiAqICoqTm90ZToqKiBOb24tb2JqZWN0IHZhbHVlcyBhcmUgY29lcmNlZCB0byBvYmplY3RzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMy4wLjBcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIEZvbygpIHtcbiAqICAgdGhpcy5hID0gMTtcbiAqICAgdGhpcy5iID0gMjtcbiAqIH1cbiAqXG4gKiBGb28ucHJvdG90eXBlLmMgPSAzO1xuICpcbiAqIF8ua2V5c0luKG5ldyBGb28pO1xuICogLy8gPT4gWydhJywgJ2InLCAnYyddIChpdGVyYXRpb24gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQpXG4gKi9cbmZ1bmN0aW9uIGtleXNJbihvYmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXlMaWtlKG9iamVjdCkgPyBhcnJheUxpa2VLZXlzKG9iamVjdCwgdHJ1ZSkgOiBiYXNlS2V5c0luKG9iamVjdCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGtleXNJbjtcbiIsCiAgICAiaW1wb3J0IGlzQXJyYXkgZnJvbSAnLi9pc0FycmF5LmpzJztcbmltcG9ydCBpc1N5bWJvbCBmcm9tICcuL2lzU3ltYm9sLmpzJztcblxuLyoqIFVzZWQgdG8gbWF0Y2ggcHJvcGVydHkgbmFtZXMgd2l0aGluIHByb3BlcnR5IHBhdGhzLiAqL1xudmFyIHJlSXNEZWVwUHJvcCA9IC9cXC58XFxbKD86W15bXFxdXSp8KFtcIiddKSg/Oig/IVxcMSlbXlxcXFxdfFxcXFwuKSo/XFwxKVxcXS8sXG4gICAgcmVJc1BsYWluUHJvcCA9IC9eXFx3KiQvO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgcHJvcGVydHkgbmFtZSBhbmQgbm90IGEgcHJvcGVydHkgcGF0aC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdF0gVGhlIG9iamVjdCB0byBxdWVyeSBrZXlzIG9uLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBwcm9wZXJ0eSBuYW1lLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzS2V5KHZhbHVlLCBvYmplY3QpIHtcbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICBpZiAodHlwZSA9PSAnbnVtYmVyJyB8fCB0eXBlID09ICdzeW1ib2wnIHx8IHR5cGUgPT0gJ2Jvb2xlYW4nIHx8XG4gICAgICB2YWx1ZSA9PSBudWxsIHx8IGlzU3ltYm9sKHZhbHVlKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiByZUlzUGxhaW5Qcm9wLnRlc3QodmFsdWUpIHx8ICFyZUlzRGVlcFByb3AudGVzdCh2YWx1ZSkgfHxcbiAgICAob2JqZWN0ICE9IG51bGwgJiYgdmFsdWUgaW4gT2JqZWN0KG9iamVjdCkpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc0tleTtcbiIsCiAgICAiaW1wb3J0IGdldE5hdGl2ZSBmcm9tICcuL19nZXROYXRpdmUuanMnO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG52YXIgbmF0aXZlQ3JlYXRlID0gZ2V0TmF0aXZlKE9iamVjdCwgJ2NyZWF0ZScpO1xuXG5leHBvcnQgZGVmYXVsdCBuYXRpdmVDcmVhdGU7XG4iLAogICAgImltcG9ydCBuYXRpdmVDcmVhdGUgZnJvbSAnLi9fbmF0aXZlQ3JlYXRlLmpzJztcblxuLyoqXG4gKiBSZW1vdmVzIGFsbCBrZXktdmFsdWUgZW50cmllcyBmcm9tIHRoZSBoYXNoLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBjbGVhclxuICogQG1lbWJlck9mIEhhc2hcbiAqL1xuZnVuY3Rpb24gaGFzaENsZWFyKCkge1xuICB0aGlzLl9fZGF0YV9fID0gbmF0aXZlQ3JlYXRlID8gbmF0aXZlQ3JlYXRlKG51bGwpIDoge307XG4gIHRoaXMuc2l6ZSA9IDA7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGhhc2hDbGVhcjtcbiIsCiAgICAiLyoqXG4gKiBSZW1vdmVzIGBrZXlgIGFuZCBpdHMgdmFsdWUgZnJvbSB0aGUgaGFzaC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZGVsZXRlXG4gKiBAbWVtYmVyT2YgSGFzaFxuICogQHBhcmFtIHtPYmplY3R9IGhhc2ggVGhlIGhhc2ggdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byByZW1vdmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGVudHJ5IHdhcyByZW1vdmVkLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGhhc2hEZWxldGUoa2V5KSB7XG4gIHZhciByZXN1bHQgPSB0aGlzLmhhcyhrZXkpICYmIGRlbGV0ZSB0aGlzLl9fZGF0YV9fW2tleV07XG4gIHRoaXMuc2l6ZSAtPSByZXN1bHQgPyAxIDogMDtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaGFzaERlbGV0ZTtcbiIsCiAgICAiaW1wb3J0IG5hdGl2ZUNyZWF0ZSBmcm9tICcuL19uYXRpdmVDcmVhdGUuanMnO1xuXG4vKiogVXNlZCB0byBzdGFuZC1pbiBmb3IgYHVuZGVmaW5lZGAgaGFzaCB2YWx1ZXMuICovXG52YXIgSEFTSF9VTkRFRklORUQgPSAnX19sb2Rhc2hfaGFzaF91bmRlZmluZWRfXyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogR2V0cyB0aGUgaGFzaCB2YWx1ZSBmb3IgYGtleWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGdldFxuICogQG1lbWJlck9mIEhhc2hcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGVudHJ5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBoYXNoR2V0KGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX187XG4gIGlmIChuYXRpdmVDcmVhdGUpIHtcbiAgICB2YXIgcmVzdWx0ID0gZGF0YVtrZXldO1xuICAgIHJldHVybiByZXN1bHQgPT09IEhBU0hfVU5ERUZJTkVEID8gdW5kZWZpbmVkIDogcmVzdWx0O1xuICB9XG4gIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGRhdGEsIGtleSkgPyBkYXRhW2tleV0gOiB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGhhc2hHZXQ7XG4iLAogICAgImltcG9ydCBuYXRpdmVDcmVhdGUgZnJvbSAnLi9fbmF0aXZlQ3JlYXRlLmpzJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYSBoYXNoIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIEhhc2hcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgZW50cnkgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW4gZW50cnkgZm9yIGBrZXlgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBoYXNoSGFzKGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX187XG4gIHJldHVybiBuYXRpdmVDcmVhdGUgPyAoZGF0YVtrZXldICE9PSB1bmRlZmluZWQpIDogaGFzT3duUHJvcGVydHkuY2FsbChkYXRhLCBrZXkpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBoYXNoSGFzO1xuIiwKICAgICJpbXBvcnQgbmF0aXZlQ3JlYXRlIGZyb20gJy4vX25hdGl2ZUNyZWF0ZS5qcyc7XG5cbi8qKiBVc2VkIHRvIHN0YW5kLWluIGZvciBgdW5kZWZpbmVkYCBoYXNoIHZhbHVlcy4gKi9cbnZhciBIQVNIX1VOREVGSU5FRCA9ICdfX2xvZGFzaF9oYXNoX3VuZGVmaW5lZF9fJztcblxuLyoqXG4gKiBTZXRzIHRoZSBoYXNoIGBrZXlgIHRvIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIHNldFxuICogQG1lbWJlck9mIEhhc2hcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gc2V0LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgaGFzaCBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gaGFzaFNldChrZXksIHZhbHVlKSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXztcbiAgdGhpcy5zaXplICs9IHRoaXMuaGFzKGtleSkgPyAwIDogMTtcbiAgZGF0YVtrZXldID0gKG5hdGl2ZUNyZWF0ZSAmJiB2YWx1ZSA9PT0gdW5kZWZpbmVkKSA/IEhBU0hfVU5ERUZJTkVEIDogdmFsdWU7XG4gIHJldHVybiB0aGlzO1xufVxuXG5leHBvcnQgZGVmYXVsdCBoYXNoU2V0O1xuIiwKICAgICJpbXBvcnQgaGFzaENsZWFyIGZyb20gJy4vX2hhc2hDbGVhci5qcyc7XG5pbXBvcnQgaGFzaERlbGV0ZSBmcm9tICcuL19oYXNoRGVsZXRlLmpzJztcbmltcG9ydCBoYXNoR2V0IGZyb20gJy4vX2hhc2hHZXQuanMnO1xuaW1wb3J0IGhhc2hIYXMgZnJvbSAnLi9faGFzaEhhcy5qcyc7XG5pbXBvcnQgaGFzaFNldCBmcm9tICcuL19oYXNoU2V0LmpzJztcblxuLyoqXG4gKiBDcmVhdGVzIGEgaGFzaCBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtBcnJheX0gW2VudHJpZXNdIFRoZSBrZXktdmFsdWUgcGFpcnMgdG8gY2FjaGUuXG4gKi9cbmZ1bmN0aW9uIEhhc2goZW50cmllcykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGVudHJpZXMgPT0gbnVsbCA/IDAgOiBlbnRyaWVzLmxlbmd0aDtcblxuICB0aGlzLmNsZWFyKCk7XG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGVudHJ5ID0gZW50cmllc1tpbmRleF07XG4gICAgdGhpcy5zZXQoZW50cnlbMF0sIGVudHJ5WzFdKTtcbiAgfVxufVxuXG4vLyBBZGQgbWV0aG9kcyB0byBgSGFzaGAuXG5IYXNoLnByb3RvdHlwZS5jbGVhciA9IGhhc2hDbGVhcjtcbkhhc2gucHJvdG90eXBlWydkZWxldGUnXSA9IGhhc2hEZWxldGU7XG5IYXNoLnByb3RvdHlwZS5nZXQgPSBoYXNoR2V0O1xuSGFzaC5wcm90b3R5cGUuaGFzID0gaGFzaEhhcztcbkhhc2gucHJvdG90eXBlLnNldCA9IGhhc2hTZXQ7XG5cbmV4cG9ydCBkZWZhdWx0IEhhc2g7XG4iLAogICAgIi8qKlxuICogUmVtb3ZlcyBhbGwga2V5LXZhbHVlIGVudHJpZXMgZnJvbSB0aGUgbGlzdCBjYWNoZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgY2xlYXJcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlQ2xlYXIoKSB7XG4gIHRoaXMuX19kYXRhX18gPSBbXTtcbiAgdGhpcy5zaXplID0gMDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbGlzdENhY2hlQ2xlYXI7XG4iLAogICAgImltcG9ydCBlcSBmcm9tICcuL2VxLmpzJztcblxuLyoqXG4gKiBHZXRzIHRoZSBpbmRleCBhdCB3aGljaCB0aGUgYGtleWAgaXMgZm91bmQgaW4gYGFycmF5YCBvZiBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpbnNwZWN0LlxuICogQHBhcmFtIHsqfSBrZXkgVGhlIGtleSB0byBzZWFyY2ggZm9yLlxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIG1hdGNoZWQgdmFsdWUsIGVsc2UgYC0xYC5cbiAqL1xuZnVuY3Rpb24gYXNzb2NJbmRleE9mKGFycmF5LCBrZXkpIHtcbiAgdmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcbiAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgaWYgKGVxKGFycmF5W2xlbmd0aF1bMF0sIGtleSkpIHtcbiAgICAgIHJldHVybiBsZW5ndGg7XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXNzb2NJbmRleE9mO1xuIiwKICAgICJpbXBvcnQgYXNzb2NJbmRleE9mIGZyb20gJy4vX2Fzc29jSW5kZXhPZi5qcyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBhcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzcGxpY2UgPSBhcnJheVByb3RvLnNwbGljZTtcblxuLyoqXG4gKiBSZW1vdmVzIGBrZXlgIGFuZCBpdHMgdmFsdWUgZnJvbSB0aGUgbGlzdCBjYWNoZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZGVsZXRlXG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHJlbW92ZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZW50cnkgd2FzIHJlbW92ZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlRGVsZXRlKGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX18sXG4gICAgICBpbmRleCA9IGFzc29jSW5kZXhPZihkYXRhLCBrZXkpO1xuXG4gIGlmIChpbmRleCA8IDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIGxhc3RJbmRleCA9IGRhdGEubGVuZ3RoIC0gMTtcbiAgaWYgKGluZGV4ID09IGxhc3RJbmRleCkge1xuICAgIGRhdGEucG9wKCk7XG4gIH0gZWxzZSB7XG4gICAgc3BsaWNlLmNhbGwoZGF0YSwgaW5kZXgsIDEpO1xuICB9XG4gIC0tdGhpcy5zaXplO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbGlzdENhY2hlRGVsZXRlO1xuIiwKICAgICJpbXBvcnQgYXNzb2NJbmRleE9mIGZyb20gJy4vX2Fzc29jSW5kZXhPZi5qcyc7XG5cbi8qKlxuICogR2V0cyB0aGUgbGlzdCBjYWNoZSB2YWx1ZSBmb3IgYGtleWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGdldFxuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZW50cnkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZUdldChrZXkpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fLFxuICAgICAgaW5kZXggPSBhc3NvY0luZGV4T2YoZGF0YSwga2V5KTtcblxuICByZXR1cm4gaW5kZXggPCAwID8gdW5kZWZpbmVkIDogZGF0YVtpbmRleF1bMV07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGxpc3RDYWNoZUdldDtcbiIsCiAgICAiaW1wb3J0IGFzc29jSW5kZXhPZiBmcm9tICcuL19hc3NvY0luZGV4T2YuanMnO1xuXG4vKipcbiAqIENoZWNrcyBpZiBhIGxpc3QgY2FjaGUgdmFsdWUgZm9yIGBrZXlgIGV4aXN0cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgaGFzXG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlSGFzKGtleSkge1xuICByZXR1cm4gYXNzb2NJbmRleE9mKHRoaXMuX19kYXRhX18sIGtleSkgPiAtMTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbGlzdENhY2hlSGFzO1xuIiwKICAgICJpbXBvcnQgYXNzb2NJbmRleE9mIGZyb20gJy4vX2Fzc29jSW5kZXhPZi5qcyc7XG5cbi8qKlxuICogU2V0cyB0aGUgbGlzdCBjYWNoZSBga2V5YCB0byBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBzZXRcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gc2V0LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgbGlzdCBjYWNoZSBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlU2V0KGtleSwgdmFsdWUpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fLFxuICAgICAgaW5kZXggPSBhc3NvY0luZGV4T2YoZGF0YSwga2V5KTtcblxuICBpZiAoaW5kZXggPCAwKSB7XG4gICAgKyt0aGlzLnNpemU7XG4gICAgZGF0YS5wdXNoKFtrZXksIHZhbHVlXSk7XG4gIH0gZWxzZSB7XG4gICAgZGF0YVtpbmRleF1bMV0gPSB2YWx1ZTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn1cblxuZXhwb3J0IGRlZmF1bHQgbGlzdENhY2hlU2V0O1xuIiwKICAgICJpbXBvcnQgbGlzdENhY2hlQ2xlYXIgZnJvbSAnLi9fbGlzdENhY2hlQ2xlYXIuanMnO1xuaW1wb3J0IGxpc3RDYWNoZURlbGV0ZSBmcm9tICcuL19saXN0Q2FjaGVEZWxldGUuanMnO1xuaW1wb3J0IGxpc3RDYWNoZUdldCBmcm9tICcuL19saXN0Q2FjaGVHZXQuanMnO1xuaW1wb3J0IGxpc3RDYWNoZUhhcyBmcm9tICcuL19saXN0Q2FjaGVIYXMuanMnO1xuaW1wb3J0IGxpc3RDYWNoZVNldCBmcm9tICcuL19saXN0Q2FjaGVTZXQuanMnO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gbGlzdCBjYWNoZSBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtBcnJheX0gW2VudHJpZXNdIFRoZSBrZXktdmFsdWUgcGFpcnMgdG8gY2FjaGUuXG4gKi9cbmZ1bmN0aW9uIExpc3RDYWNoZShlbnRyaWVzKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gZW50cmllcyA9PSBudWxsID8gMCA6IGVudHJpZXMubGVuZ3RoO1xuXG4gIHRoaXMuY2xlYXIoKTtcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgZW50cnkgPSBlbnRyaWVzW2luZGV4XTtcbiAgICB0aGlzLnNldChlbnRyeVswXSwgZW50cnlbMV0pO1xuICB9XG59XG5cbi8vIEFkZCBtZXRob2RzIHRvIGBMaXN0Q2FjaGVgLlxuTGlzdENhY2hlLnByb3RvdHlwZS5jbGVhciA9IGxpc3RDYWNoZUNsZWFyO1xuTGlzdENhY2hlLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBsaXN0Q2FjaGVEZWxldGU7XG5MaXN0Q2FjaGUucHJvdG90eXBlLmdldCA9IGxpc3RDYWNoZUdldDtcbkxpc3RDYWNoZS5wcm90b3R5cGUuaGFzID0gbGlzdENhY2hlSGFzO1xuTGlzdENhY2hlLnByb3RvdHlwZS5zZXQgPSBsaXN0Q2FjaGVTZXQ7XG5cbmV4cG9ydCBkZWZhdWx0IExpc3RDYWNoZTtcbiIsCiAgICAiaW1wb3J0IGdldE5hdGl2ZSBmcm9tICcuL19nZXROYXRpdmUuanMnO1xuaW1wb3J0IHJvb3QgZnJvbSAnLi9fcm9vdC5qcyc7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBNYXAgPSBnZXROYXRpdmUocm9vdCwgJ01hcCcpO1xuXG5leHBvcnQgZGVmYXVsdCBNYXA7XG4iLAogICAgImltcG9ydCBIYXNoIGZyb20gJy4vX0hhc2guanMnO1xuaW1wb3J0IExpc3RDYWNoZSBmcm9tICcuL19MaXN0Q2FjaGUuanMnO1xuaW1wb3J0IE1hcCBmcm9tICcuL19NYXAuanMnO1xuXG4vKipcbiAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIG1hcC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgY2xlYXJcbiAqIEBtZW1iZXJPZiBNYXBDYWNoZVxuICovXG5mdW5jdGlvbiBtYXBDYWNoZUNsZWFyKCkge1xuICB0aGlzLnNpemUgPSAwO1xuICB0aGlzLl9fZGF0YV9fID0ge1xuICAgICdoYXNoJzogbmV3IEhhc2gsXG4gICAgJ21hcCc6IG5ldyAoTWFwIHx8IExpc3RDYWNoZSksXG4gICAgJ3N0cmluZyc6IG5ldyBIYXNoXG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IG1hcENhY2hlQ2xlYXI7XG4iLAogICAgIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgc3VpdGFibGUgZm9yIHVzZSBhcyB1bmlxdWUgb2JqZWN0IGtleS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBzdWl0YWJsZSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0tleWFibGUodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiAodHlwZSA9PSAnc3RyaW5nJyB8fCB0eXBlID09ICdudW1iZXInIHx8IHR5cGUgPT0gJ3N5bWJvbCcgfHwgdHlwZSA9PSAnYm9vbGVhbicpXG4gICAgPyAodmFsdWUgIT09ICdfX3Byb3RvX18nKVxuICAgIDogKHZhbHVlID09PSBudWxsKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNLZXlhYmxlO1xuIiwKICAgICJpbXBvcnQgaXNLZXlhYmxlIGZyb20gJy4vX2lzS2V5YWJsZS5qcyc7XG5cbi8qKlxuICogR2V0cyB0aGUgZGF0YSBmb3IgYG1hcGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBtYXAgVGhlIG1hcCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIHJlZmVyZW5jZSBrZXkuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgbWFwIGRhdGEuXG4gKi9cbmZ1bmN0aW9uIGdldE1hcERhdGEobWFwLCBrZXkpIHtcbiAgdmFyIGRhdGEgPSBtYXAuX19kYXRhX187XG4gIHJldHVybiBpc0tleWFibGUoa2V5KVxuICAgID8gZGF0YVt0eXBlb2Yga2V5ID09ICdzdHJpbmcnID8gJ3N0cmluZycgOiAnaGFzaCddXG4gICAgOiBkYXRhLm1hcDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZ2V0TWFwRGF0YTtcbiIsCiAgICAiaW1wb3J0IGdldE1hcERhdGEgZnJvbSAnLi9fZ2V0TWFwRGF0YS5qcyc7XG5cbi8qKlxuICogUmVtb3ZlcyBga2V5YCBhbmQgaXRzIHZhbHVlIGZyb20gdGhlIG1hcC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZGVsZXRlXG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gcmVtb3ZlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBlbnRyeSB3YXMgcmVtb3ZlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBtYXBDYWNoZURlbGV0ZShrZXkpIHtcbiAgdmFyIHJlc3VsdCA9IGdldE1hcERhdGEodGhpcywga2V5KVsnZGVsZXRlJ10oa2V5KTtcbiAgdGhpcy5zaXplIC09IHJlc3VsdCA/IDEgOiAwO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBtYXBDYWNoZURlbGV0ZTtcbiIsCiAgICAiaW1wb3J0IGdldE1hcERhdGEgZnJvbSAnLi9fZ2V0TWFwRGF0YS5qcyc7XG5cbi8qKlxuICogR2V0cyB0aGUgbWFwIHZhbHVlIGZvciBga2V5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZ2V0XG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGVudHJ5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBtYXBDYWNoZUdldChrZXkpIHtcbiAgcmV0dXJuIGdldE1hcERhdGEodGhpcywga2V5KS5nZXQoa2V5KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbWFwQ2FjaGVHZXQ7XG4iLAogICAgImltcG9ydCBnZXRNYXBEYXRhIGZyb20gJy4vX2dldE1hcERhdGEuanMnO1xuXG4vKipcbiAqIENoZWNrcyBpZiBhIG1hcCB2YWx1ZSBmb3IgYGtleWAgZXhpc3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBoYXNcbiAqIEBtZW1iZXJPZiBNYXBDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBlbnRyeSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBhbiBlbnRyeSBmb3IgYGtleWAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIG1hcENhY2hlSGFzKGtleSkge1xuICByZXR1cm4gZ2V0TWFwRGF0YSh0aGlzLCBrZXkpLmhhcyhrZXkpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBtYXBDYWNoZUhhcztcbiIsCiAgICAiaW1wb3J0IGdldE1hcERhdGEgZnJvbSAnLi9fZ2V0TWFwRGF0YS5qcyc7XG5cbi8qKlxuICogU2V0cyB0aGUgbWFwIGBrZXlgIHRvIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIHNldFxuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHNldC5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNldC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIG1hcCBjYWNoZSBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVTZXQoa2V5LCB2YWx1ZSkge1xuICB2YXIgZGF0YSA9IGdldE1hcERhdGEodGhpcywga2V5KSxcbiAgICAgIHNpemUgPSBkYXRhLnNpemU7XG5cbiAgZGF0YS5zZXQoa2V5LCB2YWx1ZSk7XG4gIHRoaXMuc2l6ZSArPSBkYXRhLnNpemUgPT0gc2l6ZSA/IDAgOiAxO1xuICByZXR1cm4gdGhpcztcbn1cblxuZXhwb3J0IGRlZmF1bHQgbWFwQ2FjaGVTZXQ7XG4iLAogICAgImltcG9ydCBtYXBDYWNoZUNsZWFyIGZyb20gJy4vX21hcENhY2hlQ2xlYXIuanMnO1xuaW1wb3J0IG1hcENhY2hlRGVsZXRlIGZyb20gJy4vX21hcENhY2hlRGVsZXRlLmpzJztcbmltcG9ydCBtYXBDYWNoZUdldCBmcm9tICcuL19tYXBDYWNoZUdldC5qcyc7XG5pbXBvcnQgbWFwQ2FjaGVIYXMgZnJvbSAnLi9fbWFwQ2FjaGVIYXMuanMnO1xuaW1wb3J0IG1hcENhY2hlU2V0IGZyb20gJy4vX21hcENhY2hlU2V0LmpzJztcblxuLyoqXG4gKiBDcmVhdGVzIGEgbWFwIGNhY2hlIG9iamVjdCB0byBzdG9yZSBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtBcnJheX0gW2VudHJpZXNdIFRoZSBrZXktdmFsdWUgcGFpcnMgdG8gY2FjaGUuXG4gKi9cbmZ1bmN0aW9uIE1hcENhY2hlKGVudHJpZXMpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBlbnRyaWVzID09IG51bGwgPyAwIDogZW50cmllcy5sZW5ndGg7XG5cbiAgdGhpcy5jbGVhcigpO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBlbnRyeSA9IGVudHJpZXNbaW5kZXhdO1xuICAgIHRoaXMuc2V0KGVudHJ5WzBdLCBlbnRyeVsxXSk7XG4gIH1cbn1cblxuLy8gQWRkIG1ldGhvZHMgdG8gYE1hcENhY2hlYC5cbk1hcENhY2hlLnByb3RvdHlwZS5jbGVhciA9IG1hcENhY2hlQ2xlYXI7XG5NYXBDYWNoZS5wcm90b3R5cGVbJ2RlbGV0ZSddID0gbWFwQ2FjaGVEZWxldGU7XG5NYXBDYWNoZS5wcm90b3R5cGUuZ2V0ID0gbWFwQ2FjaGVHZXQ7XG5NYXBDYWNoZS5wcm90b3R5cGUuaGFzID0gbWFwQ2FjaGVIYXM7XG5NYXBDYWNoZS5wcm90b3R5cGUuc2V0ID0gbWFwQ2FjaGVTZXQ7XG5cbmV4cG9ydCBkZWZhdWx0IE1hcENhY2hlO1xuIiwKICAgICJpbXBvcnQgTWFwQ2FjaGUgZnJvbSAnLi9fTWFwQ2FjaGUuanMnO1xuXG4vKiogRXJyb3IgbWVzc2FnZSBjb25zdGFudHMuICovXG52YXIgRlVOQ19FUlJPUl9URVhUID0gJ0V4cGVjdGVkIGEgZnVuY3Rpb24nO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IG1lbW9pemVzIHRoZSByZXN1bHQgb2YgYGZ1bmNgLiBJZiBgcmVzb2x2ZXJgIGlzXG4gKiBwcm92aWRlZCwgaXQgZGV0ZXJtaW5lcyB0aGUgY2FjaGUga2V5IGZvciBzdG9yaW5nIHRoZSByZXN1bHQgYmFzZWQgb24gdGhlXG4gKiBhcmd1bWVudHMgcHJvdmlkZWQgdG8gdGhlIG1lbW9pemVkIGZ1bmN0aW9uLiBCeSBkZWZhdWx0LCB0aGUgZmlyc3QgYXJndW1lbnRcbiAqIHByb3ZpZGVkIHRvIHRoZSBtZW1vaXplZCBmdW5jdGlvbiBpcyB1c2VkIGFzIHRoZSBtYXAgY2FjaGUga2V5LiBUaGUgYGZ1bmNgXG4gKiBpcyBpbnZva2VkIHdpdGggdGhlIGB0aGlzYCBiaW5kaW5nIG9mIHRoZSBtZW1vaXplZCBmdW5jdGlvbi5cbiAqXG4gKiAqKk5vdGU6KiogVGhlIGNhY2hlIGlzIGV4cG9zZWQgYXMgdGhlIGBjYWNoZWAgcHJvcGVydHkgb24gdGhlIG1lbW9pemVkXG4gKiBmdW5jdGlvbi4gSXRzIGNyZWF0aW9uIG1heSBiZSBjdXN0b21pemVkIGJ5IHJlcGxhY2luZyB0aGUgYF8ubWVtb2l6ZS5DYWNoZWBcbiAqIGNvbnN0cnVjdG9yIHdpdGggb25lIHdob3NlIGluc3RhbmNlcyBpbXBsZW1lbnQgdGhlXG4gKiBbYE1hcGBdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXByb3BlcnRpZXMtb2YtdGhlLW1hcC1wcm90b3R5cGUtb2JqZWN0KVxuICogbWV0aG9kIGludGVyZmFjZSBvZiBgY2xlYXJgLCBgZGVsZXRlYCwgYGdldGAsIGBoYXNgLCBhbmQgYHNldGAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBoYXZlIGl0cyBvdXRwdXQgbWVtb2l6ZWQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbcmVzb2x2ZXJdIFRoZSBmdW5jdGlvbiB0byByZXNvbHZlIHRoZSBjYWNoZSBrZXkuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBtZW1vaXplZCBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHsgJ2EnOiAxLCAnYic6IDIgfTtcbiAqIHZhciBvdGhlciA9IHsgJ2MnOiAzLCAnZCc6IDQgfTtcbiAqXG4gKiB2YXIgdmFsdWVzID0gXy5tZW1vaXplKF8udmFsdWVzKTtcbiAqIHZhbHVlcyhvYmplY3QpO1xuICogLy8gPT4gWzEsIDJdXG4gKlxuICogdmFsdWVzKG90aGVyKTtcbiAqIC8vID0+IFszLCA0XVxuICpcbiAqIG9iamVjdC5hID0gMjtcbiAqIHZhbHVlcyhvYmplY3QpO1xuICogLy8gPT4gWzEsIDJdXG4gKlxuICogLy8gTW9kaWZ5IHRoZSByZXN1bHQgY2FjaGUuXG4gKiB2YWx1ZXMuY2FjaGUuc2V0KG9iamVjdCwgWydhJywgJ2InXSk7XG4gKiB2YWx1ZXMob2JqZWN0KTtcbiAqIC8vID0+IFsnYScsICdiJ11cbiAqXG4gKiAvLyBSZXBsYWNlIGBfLm1lbW9pemUuQ2FjaGVgLlxuICogXy5tZW1vaXplLkNhY2hlID0gV2Vha01hcDtcbiAqL1xuZnVuY3Rpb24gbWVtb2l6ZShmdW5jLCByZXNvbHZlcikge1xuICBpZiAodHlwZW9mIGZ1bmMgIT0gJ2Z1bmN0aW9uJyB8fCAocmVzb2x2ZXIgIT0gbnVsbCAmJiB0eXBlb2YgcmVzb2x2ZXIgIT0gJ2Z1bmN0aW9uJykpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKEZVTkNfRVJST1JfVEVYVCk7XG4gIH1cbiAgdmFyIG1lbW9pemVkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsXG4gICAgICAgIGtleSA9IHJlc29sdmVyID8gcmVzb2x2ZXIuYXBwbHkodGhpcywgYXJncykgOiBhcmdzWzBdLFxuICAgICAgICBjYWNoZSA9IG1lbW9pemVkLmNhY2hlO1xuXG4gICAgaWYgKGNhY2hlLmhhcyhrZXkpKSB7XG4gICAgICByZXR1cm4gY2FjaGUuZ2V0KGtleSk7XG4gICAgfVxuICAgIHZhciByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIG1lbW9pemVkLmNhY2hlID0gY2FjaGUuc2V0KGtleSwgcmVzdWx0KSB8fCBjYWNoZTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICBtZW1vaXplZC5jYWNoZSA9IG5ldyAobWVtb2l6ZS5DYWNoZSB8fCBNYXBDYWNoZSk7XG4gIHJldHVybiBtZW1vaXplZDtcbn1cblxuLy8gRXhwb3NlIGBNYXBDYWNoZWAuXG5tZW1vaXplLkNhY2hlID0gTWFwQ2FjaGU7XG5cbmV4cG9ydCBkZWZhdWx0IG1lbW9pemU7XG4iLAogICAgImltcG9ydCBtZW1vaXplIGZyb20gJy4vbWVtb2l6ZS5qcyc7XG5cbi8qKiBVc2VkIGFzIHRoZSBtYXhpbXVtIG1lbW9pemUgY2FjaGUgc2l6ZS4gKi9cbnZhciBNQVhfTUVNT0laRV9TSVpFID0gNTAwO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgXy5tZW1vaXplYCB3aGljaCBjbGVhcnMgdGhlIG1lbW9pemVkIGZ1bmN0aW9uJ3NcbiAqIGNhY2hlIHdoZW4gaXQgZXhjZWVkcyBgTUFYX01FTU9JWkVfU0laRWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGhhdmUgaXRzIG91dHB1dCBtZW1vaXplZC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IG1lbW9pemVkIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBtZW1vaXplQ2FwcGVkKGZ1bmMpIHtcbiAgdmFyIHJlc3VsdCA9IG1lbW9pemUoZnVuYywgZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKGNhY2hlLnNpemUgPT09IE1BWF9NRU1PSVpFX1NJWkUpIHtcbiAgICAgIGNhY2hlLmNsZWFyKCk7XG4gICAgfVxuICAgIHJldHVybiBrZXk7XG4gIH0pO1xuXG4gIHZhciBjYWNoZSA9IHJlc3VsdC5jYWNoZTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbWVtb2l6ZUNhcHBlZDtcbiIsCiAgICAiaW1wb3J0IG1lbW9pemVDYXBwZWQgZnJvbSAnLi9fbWVtb2l6ZUNhcHBlZC5qcyc7XG5cbi8qKiBVc2VkIHRvIG1hdGNoIHByb3BlcnR5IG5hbWVzIHdpdGhpbiBwcm9wZXJ0eSBwYXRocy4gKi9cbnZhciByZVByb3BOYW1lID0gL1teLltcXF1dK3xcXFsoPzooLT9cXGQrKD86XFwuXFxkKyk/KXwoW1wiJ10pKCg/Oig/IVxcMilbXlxcXFxdfFxcXFwuKSo/KVxcMilcXF18KD89KD86XFwufFxcW1xcXSkoPzpcXC58XFxbXFxdfCQpKS9nO1xuXG4vKiogVXNlZCB0byBtYXRjaCBiYWNrc2xhc2hlcyBpbiBwcm9wZXJ0eSBwYXRocy4gKi9cbnZhciByZUVzY2FwZUNoYXIgPSAvXFxcXChcXFxcKT8vZztcblxuLyoqXG4gKiBDb252ZXJ0cyBgc3RyaW5nYCB0byBhIHByb3BlcnR5IHBhdGggYXJyYXkuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgVGhlIHN0cmluZyB0byBjb252ZXJ0LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBwcm9wZXJ0eSBwYXRoIGFycmF5LlxuICovXG52YXIgc3RyaW5nVG9QYXRoID0gbWVtb2l6ZUNhcHBlZChmdW5jdGlvbihzdHJpbmcpIHtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICBpZiAoc3RyaW5nLmNoYXJDb2RlQXQoMCkgPT09IDQ2IC8qIC4gKi8pIHtcbiAgICByZXN1bHQucHVzaCgnJyk7XG4gIH1cbiAgc3RyaW5nLnJlcGxhY2UocmVQcm9wTmFtZSwgZnVuY3Rpb24obWF0Y2gsIG51bWJlciwgcXVvdGUsIHN1YlN0cmluZykge1xuICAgIHJlc3VsdC5wdXNoKHF1b3RlID8gc3ViU3RyaW5nLnJlcGxhY2UocmVFc2NhcGVDaGFyLCAnJDEnKSA6IChudW1iZXIgfHwgbWF0Y2gpKTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgc3RyaW5nVG9QYXRoO1xuIiwKICAgICJpbXBvcnQgYmFzZVRvU3RyaW5nIGZyb20gJy4vX2Jhc2VUb1N0cmluZy5qcyc7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZy4gQW4gZW1wdHkgc3RyaW5nIGlzIHJldHVybmVkIGZvciBgbnVsbGBcbiAqIGFuZCBgdW5kZWZpbmVkYCB2YWx1ZXMuIFRoZSBzaWduIG9mIGAtMGAgaXMgcHJlc2VydmVkLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb252ZXJ0LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgY29udmVydGVkIHN0cmluZy5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50b1N0cmluZyhudWxsKTtcbiAqIC8vID0+ICcnXG4gKlxuICogXy50b1N0cmluZygtMCk7XG4gKiAvLyA9PiAnLTAnXG4gKlxuICogXy50b1N0cmluZyhbMSwgMiwgM10pO1xuICogLy8gPT4gJzEsMiwzJ1xuICovXG5mdW5jdGlvbiB0b1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT0gbnVsbCA/ICcnIDogYmFzZVRvU3RyaW5nKHZhbHVlKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdG9TdHJpbmc7XG4iLAogICAgImltcG9ydCBpc0FycmF5IGZyb20gJy4vaXNBcnJheS5qcyc7XG5pbXBvcnQgaXNLZXkgZnJvbSAnLi9faXNLZXkuanMnO1xuaW1wb3J0IHN0cmluZ1RvUGF0aCBmcm9tICcuL19zdHJpbmdUb1BhdGguanMnO1xuaW1wb3J0IHRvU3RyaW5nIGZyb20gJy4vdG9TdHJpbmcuanMnO1xuXG4vKipcbiAqIENhc3RzIGB2YWx1ZWAgdG8gYSBwYXRoIGFycmF5IGlmIGl0J3Mgbm90IG9uZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gaW5zcGVjdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0XSBUaGUgb2JqZWN0IHRvIHF1ZXJ5IGtleXMgb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGNhc3QgcHJvcGVydHkgcGF0aCBhcnJheS5cbiAqL1xuZnVuY3Rpb24gY2FzdFBhdGgodmFsdWUsIG9iamVjdCkge1xuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIGlzS2V5KHZhbHVlLCBvYmplY3QpID8gW3ZhbHVlXSA6IHN0cmluZ1RvUGF0aCh0b1N0cmluZyh2YWx1ZSkpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjYXN0UGF0aDtcbiIsCiAgICAiaW1wb3J0IGlzU3ltYm9sIGZyb20gJy4vaXNTeW1ib2wuanMnO1xuXG4vKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBJTkZJTklUWSA9IDEgLyAwO1xuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBzdHJpbmcga2V5IGlmIGl0J3Mgbm90IGEgc3RyaW5nIG9yIHN5bWJvbC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gaW5zcGVjdC5cbiAqIEByZXR1cm5zIHtzdHJpbmd8c3ltYm9sfSBSZXR1cm5zIHRoZSBrZXkuXG4gKi9cbmZ1bmN0aW9uIHRvS2V5KHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZycgfHwgaXNTeW1ib2wodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHZhciByZXN1bHQgPSAodmFsdWUgKyAnJyk7XG4gIHJldHVybiAocmVzdWx0ID09ICcwJyAmJiAoMSAvIHZhbHVlKSA9PSAtSU5GSU5JVFkpID8gJy0wJyA6IHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdG9LZXk7XG4iLAogICAgImltcG9ydCBjYXN0UGF0aCBmcm9tICcuL19jYXN0UGF0aC5qcyc7XG5pbXBvcnQgdG9LZXkgZnJvbSAnLi9fdG9LZXkuanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmdldGAgd2l0aG91dCBzdXBwb3J0IGZvciBkZWZhdWx0IHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtBcnJheXxzdHJpbmd9IHBhdGggVGhlIHBhdGggb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSByZXNvbHZlZCB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gYmFzZUdldChvYmplY3QsIHBhdGgpIHtcbiAgcGF0aCA9IGNhc3RQYXRoKHBhdGgsIG9iamVjdCk7XG5cbiAgdmFyIGluZGV4ID0gMCxcbiAgICAgIGxlbmd0aCA9IHBhdGgubGVuZ3RoO1xuXG4gIHdoaWxlIChvYmplY3QgIT0gbnVsbCAmJiBpbmRleCA8IGxlbmd0aCkge1xuICAgIG9iamVjdCA9IG9iamVjdFt0b0tleShwYXRoW2luZGV4KytdKV07XG4gIH1cbiAgcmV0dXJuIChpbmRleCAmJiBpbmRleCA9PSBsZW5ndGgpID8gb2JqZWN0IDogdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlR2V0O1xuIiwKICAgICJpbXBvcnQgYmFzZUdldCBmcm9tICcuL19iYXNlR2V0LmpzJztcblxuLyoqXG4gKiBHZXRzIHRoZSB2YWx1ZSBhdCBgcGF0aGAgb2YgYG9iamVjdGAuIElmIHRoZSByZXNvbHZlZCB2YWx1ZSBpc1xuICogYHVuZGVmaW5lZGAsIHRoZSBgZGVmYXVsdFZhbHVlYCBpcyByZXR1cm5lZCBpbiBpdHMgcGxhY2UuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAzLjcuMFxuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtBcnJheXxzdHJpbmd9IHBhdGggVGhlIHBhdGggb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cbiAqIEBwYXJhbSB7Kn0gW2RlZmF1bHRWYWx1ZV0gVGhlIHZhbHVlIHJldHVybmVkIGZvciBgdW5kZWZpbmVkYCByZXNvbHZlZCB2YWx1ZXMuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgcmVzb2x2ZWQgdmFsdWUuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICdhJzogW3sgJ2InOiB7ICdjJzogMyB9IH1dIH07XG4gKlxuICogXy5nZXQob2JqZWN0LCAnYVswXS5iLmMnKTtcbiAqIC8vID0+IDNcbiAqXG4gKiBfLmdldChvYmplY3QsIFsnYScsICcwJywgJ2InLCAnYyddKTtcbiAqIC8vID0+IDNcbiAqXG4gKiBfLmdldChvYmplY3QsICdhLmIuYycsICdkZWZhdWx0Jyk7XG4gKiAvLyA9PiAnZGVmYXVsdCdcbiAqL1xuZnVuY3Rpb24gZ2V0KG9iamVjdCwgcGF0aCwgZGVmYXVsdFZhbHVlKSB7XG4gIHZhciByZXN1bHQgPSBvYmplY3QgPT0gbnVsbCA/IHVuZGVmaW5lZCA6IGJhc2VHZXQob2JqZWN0LCBwYXRoKTtcbiAgcmV0dXJuIHJlc3VsdCA9PT0gdW5kZWZpbmVkID8gZGVmYXVsdFZhbHVlIDogcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBnZXQ7XG4iLAogICAgIi8qKlxuICogQXBwZW5kcyB0aGUgZWxlbWVudHMgb2YgYHZhbHVlc2AgdG8gYGFycmF5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7QXJyYXl9IHZhbHVlcyBUaGUgdmFsdWVzIHRvIGFwcGVuZC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBgYXJyYXlgLlxuICovXG5mdW5jdGlvbiBhcnJheVB1c2goYXJyYXksIHZhbHVlcykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IHZhbHVlcy5sZW5ndGgsXG4gICAgICBvZmZzZXQgPSBhcnJheS5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBhcnJheVtvZmZzZXQgKyBpbmRleF0gPSB2YWx1ZXNbaW5kZXhdO1xuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXJyYXlQdXNoO1xuIiwKICAgICJpbXBvcnQgU3ltYm9sIGZyb20gJy4vX1N5bWJvbC5qcyc7XG5pbXBvcnQgaXNBcmd1bWVudHMgZnJvbSAnLi9pc0FyZ3VtZW50cy5qcyc7XG5pbXBvcnQgaXNBcnJheSBmcm9tICcuL2lzQXJyYXkuanMnO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzcHJlYWRhYmxlU3ltYm9sID0gU3ltYm9sID8gU3ltYm9sLmlzQ29uY2F0U3ByZWFkYWJsZSA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIGZsYXR0ZW5hYmxlIGBhcmd1bWVudHNgIG9iamVjdCBvciBhcnJheS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBmbGF0dGVuYWJsZSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0ZsYXR0ZW5hYmxlKHZhbHVlKSB7XG4gIHJldHVybiBpc0FycmF5KHZhbHVlKSB8fCBpc0FyZ3VtZW50cyh2YWx1ZSkgfHxcbiAgICAhIShzcHJlYWRhYmxlU3ltYm9sICYmIHZhbHVlICYmIHZhbHVlW3NwcmVhZGFibGVTeW1ib2xdKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNGbGF0dGVuYWJsZTtcbiIsCiAgICAiaW1wb3J0IGFycmF5UHVzaCBmcm9tICcuL19hcnJheVB1c2guanMnO1xuaW1wb3J0IGlzRmxhdHRlbmFibGUgZnJvbSAnLi9faXNGbGF0dGVuYWJsZS5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uZmxhdHRlbmAgd2l0aCBzdXBwb3J0IGZvciByZXN0cmljdGluZyBmbGF0dGVuaW5nLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gZmxhdHRlbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBkZXB0aCBUaGUgbWF4aW11bSByZWN1cnNpb24gZGVwdGguXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtwcmVkaWNhdGU9aXNGbGF0dGVuYWJsZV0gVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzU3RyaWN0XSBSZXN0cmljdCB0byB2YWx1ZXMgdGhhdCBwYXNzIGBwcmVkaWNhdGVgIGNoZWNrcy5cbiAqIEBwYXJhbSB7QXJyYXl9IFtyZXN1bHQ9W11dIFRoZSBpbml0aWFsIHJlc3VsdCB2YWx1ZS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IGZsYXR0ZW5lZCBhcnJheS5cbiAqL1xuZnVuY3Rpb24gYmFzZUZsYXR0ZW4oYXJyYXksIGRlcHRoLCBwcmVkaWNhdGUsIGlzU3RyaWN0LCByZXN1bHQpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG5cbiAgcHJlZGljYXRlIHx8IChwcmVkaWNhdGUgPSBpc0ZsYXR0ZW5hYmxlKTtcbiAgcmVzdWx0IHx8IChyZXN1bHQgPSBbXSk7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgdmFsdWUgPSBhcnJheVtpbmRleF07XG4gICAgaWYgKGRlcHRoID4gMCAmJiBwcmVkaWNhdGUodmFsdWUpKSB7XG4gICAgICBpZiAoZGVwdGggPiAxKSB7XG4gICAgICAgIC8vIFJlY3Vyc2l2ZWx5IGZsYXR0ZW4gYXJyYXlzIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cykuXG4gICAgICAgIGJhc2VGbGF0dGVuKHZhbHVlLCBkZXB0aCAtIDEsIHByZWRpY2F0ZSwgaXNTdHJpY3QsIHJlc3VsdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhcnJheVB1c2gocmVzdWx0LCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghaXNTdHJpY3QpIHtcbiAgICAgIHJlc3VsdFtyZXN1bHQubGVuZ3RoXSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlRmxhdHRlbjtcbiIsCiAgICAiaW1wb3J0IGJhc2VGbGF0dGVuIGZyb20gJy4vX2Jhc2VGbGF0dGVuLmpzJztcblxuLyoqXG4gKiBGbGF0dGVucyBgYXJyYXlgIGEgc2luZ2xlIGxldmVsIGRlZXAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IEFycmF5XG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gZmxhdHRlbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IGZsYXR0ZW5lZCBhcnJheS5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5mbGF0dGVuKFsxLCBbMiwgWzMsIFs0XV0sIDVdXSk7XG4gKiAvLyA9PiBbMSwgMiwgWzMsIFs0XV0sIDVdXG4gKi9cbmZ1bmN0aW9uIGZsYXR0ZW4oYXJyYXkpIHtcbiAgdmFyIGxlbmd0aCA9IGFycmF5ID09IG51bGwgPyAwIDogYXJyYXkubGVuZ3RoO1xuICByZXR1cm4gbGVuZ3RoID8gYmFzZUZsYXR0ZW4oYXJyYXksIDEpIDogW107XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZsYXR0ZW47XG4iLAogICAgImltcG9ydCBmbGF0dGVuIGZyb20gJy4vZmxhdHRlbi5qcyc7XG5pbXBvcnQgb3ZlclJlc3QgZnJvbSAnLi9fb3ZlclJlc3QuanMnO1xuaW1wb3J0IHNldFRvU3RyaW5nIGZyb20gJy4vX3NldFRvU3RyaW5nLmpzJztcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VSZXN0YCB3aGljaCBmbGF0dGVucyB0aGUgcmVzdCBhcnJheS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gYXBwbHkgYSByZXN0IHBhcmFtZXRlciB0by5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBmbGF0UmVzdChmdW5jKSB7XG4gIHJldHVybiBzZXRUb1N0cmluZyhvdmVyUmVzdChmdW5jLCB1bmRlZmluZWQsIGZsYXR0ZW4pLCBmdW5jICsgJycpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmbGF0UmVzdDtcbiIsCiAgICAiaW1wb3J0IG92ZXJBcmcgZnJvbSAnLi9fb3ZlckFyZy5qcyc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIGdldFByb3RvdHlwZSA9IG92ZXJBcmcoT2JqZWN0LmdldFByb3RvdHlwZU9mLCBPYmplY3QpO1xuXG5leHBvcnQgZGVmYXVsdCBnZXRQcm90b3R5cGU7XG4iLAogICAgImltcG9ydCBiYXNlR2V0VGFnIGZyb20gJy4vX2Jhc2VHZXRUYWcuanMnO1xuaW1wb3J0IGdldFByb3RvdHlwZSBmcm9tICcuL19nZXRQcm90b3R5cGUuanMnO1xuaW1wb3J0IGlzT2JqZWN0TGlrZSBmcm9tICcuL2lzT2JqZWN0TGlrZS5qcyc7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZSxcbiAgICBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBmdW5jUHJvdG8udG9TdHJpbmc7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKiBVc2VkIHRvIGluZmVyIHRoZSBgT2JqZWN0YCBjb25zdHJ1Y3Rvci4gKi9cbnZhciBvYmplY3RDdG9yU3RyaW5nID0gZnVuY1RvU3RyaW5nLmNhbGwoT2JqZWN0KTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHBsYWluIG9iamVjdCwgdGhhdCBpcywgYW4gb2JqZWN0IGNyZWF0ZWQgYnkgdGhlXG4gKiBgT2JqZWN0YCBjb25zdHJ1Y3RvciBvciBvbmUgd2l0aCBhIGBbW1Byb3RvdHlwZV1dYCBvZiBgbnVsbGAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjguMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBwbGFpbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogfVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChuZXcgRm9vKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdCh7ICd4JzogMCwgJ3knOiAwIH0pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChPYmplY3QuY3JlYXRlKG51bGwpKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0TGlrZSh2YWx1ZSkgfHwgYmFzZUdldFRhZyh2YWx1ZSkgIT0gb2JqZWN0VGFnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBwcm90byA9IGdldFByb3RvdHlwZSh2YWx1ZSk7XG4gIGlmIChwcm90byA9PT0gbnVsbCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHZhciBDdG9yID0gaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgJ2NvbnN0cnVjdG9yJykgJiYgcHJvdG8uY29uc3RydWN0b3I7XG4gIHJldHVybiB0eXBlb2YgQ3RvciA9PSAnZnVuY3Rpb24nICYmIEN0b3IgaW5zdGFuY2VvZiBDdG9yICYmXG4gICAgZnVuY1RvU3RyaW5nLmNhbGwoQ3RvcikgPT0gb2JqZWN0Q3RvclN0cmluZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNQbGFpbk9iamVjdDtcbiIsCiAgICAiLyoqIFVzZWQgdG8gY29tcG9zZSB1bmljb2RlIGNoYXJhY3RlciBjbGFzc2VzLiAqL1xudmFyIHJzQXN0cmFsUmFuZ2UgPSAnXFxcXHVkODAwLVxcXFx1ZGZmZicsXG4gICAgcnNDb21ib01hcmtzUmFuZ2UgPSAnXFxcXHUwMzAwLVxcXFx1MDM2ZicsXG4gICAgcmVDb21ib0hhbGZNYXJrc1JhbmdlID0gJ1xcXFx1ZmUyMC1cXFxcdWZlMmYnLFxuICAgIHJzQ29tYm9TeW1ib2xzUmFuZ2UgPSAnXFxcXHUyMGQwLVxcXFx1MjBmZicsXG4gICAgcnNDb21ib1JhbmdlID0gcnNDb21ib01hcmtzUmFuZ2UgKyByZUNvbWJvSGFsZk1hcmtzUmFuZ2UgKyByc0NvbWJvU3ltYm9sc1JhbmdlLFxuICAgIHJzVmFyUmFuZ2UgPSAnXFxcXHVmZTBlXFxcXHVmZTBmJztcblxuLyoqIFVzZWQgdG8gY29tcG9zZSB1bmljb2RlIGNhcHR1cmUgZ3JvdXBzLiAqL1xudmFyIHJzWldKID0gJ1xcXFx1MjAwZCc7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBzdHJpbmdzIHdpdGggW3plcm8td2lkdGggam9pbmVycyBvciBjb2RlIHBvaW50cyBmcm9tIHRoZSBhc3RyYWwgcGxhbmVzXShodHRwOi8vZWV2LmVlL2Jsb2cvMjAxNS8wOS8xMi9kYXJrLWNvcm5lcnMtb2YtdW5pY29kZS8pLiAqL1xudmFyIHJlSGFzVW5pY29kZSA9IFJlZ0V4cCgnWycgKyByc1pXSiArIHJzQXN0cmFsUmFuZ2UgICsgcnNDb21ib1JhbmdlICsgcnNWYXJSYW5nZSArICddJyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGBzdHJpbmdgIGNvbnRhaW5zIFVuaWNvZGUgc3ltYm9scy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyBUaGUgc3RyaW5nIHRvIGluc3BlY3QuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYSBzeW1ib2wgaXMgZm91bmQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaGFzVW5pY29kZShzdHJpbmcpIHtcbiAgcmV0dXJuIHJlSGFzVW5pY29kZS50ZXN0KHN0cmluZyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGhhc1VuaWNvZGU7XG4iLAogICAgIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLnJlZHVjZWAgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yXG4gKiBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJyYXldIFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHBhcmFtIHsqfSBbYWNjdW11bGF0b3JdIFRoZSBpbml0aWFsIHZhbHVlLlxuICogQHBhcmFtIHtib29sZWFufSBbaW5pdEFjY3VtXSBTcGVjaWZ5IHVzaW5nIHRoZSBmaXJzdCBlbGVtZW50IG9mIGBhcnJheWAgYXNcbiAqICB0aGUgaW5pdGlhbCB2YWx1ZS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBhY2N1bXVsYXRlZCB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gYXJyYXlSZWR1Y2UoYXJyYXksIGl0ZXJhdGVlLCBhY2N1bXVsYXRvciwgaW5pdEFjY3VtKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gYXJyYXkgPT0gbnVsbCA/IDAgOiBhcnJheS5sZW5ndGg7XG5cbiAgaWYgKGluaXRBY2N1bSAmJiBsZW5ndGgpIHtcbiAgICBhY2N1bXVsYXRvciA9IGFycmF5WysraW5kZXhdO1xuICB9XG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgYWNjdW11bGF0b3IgPSBpdGVyYXRlZShhY2N1bXVsYXRvciwgYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpO1xuICB9XG4gIHJldHVybiBhY2N1bXVsYXRvcjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXJyYXlSZWR1Y2U7XG4iLAogICAgImltcG9ydCBMaXN0Q2FjaGUgZnJvbSAnLi9fTGlzdENhY2hlLmpzJztcblxuLyoqXG4gKiBSZW1vdmVzIGFsbCBrZXktdmFsdWUgZW50cmllcyBmcm9tIHRoZSBzdGFjay5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgY2xlYXJcbiAqIEBtZW1iZXJPZiBTdGFja1xuICovXG5mdW5jdGlvbiBzdGFja0NsZWFyKCkge1xuICB0aGlzLl9fZGF0YV9fID0gbmV3IExpc3RDYWNoZTtcbiAgdGhpcy5zaXplID0gMDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgc3RhY2tDbGVhcjtcbiIsCiAgICAiLyoqXG4gKiBSZW1vdmVzIGBrZXlgIGFuZCBpdHMgdmFsdWUgZnJvbSB0aGUgc3RhY2suXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGRlbGV0ZVxuICogQG1lbWJlck9mIFN0YWNrXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHJlbW92ZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZW50cnkgd2FzIHJlbW92ZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gc3RhY2tEZWxldGUoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXyxcbiAgICAgIHJlc3VsdCA9IGRhdGFbJ2RlbGV0ZSddKGtleSk7XG5cbiAgdGhpcy5zaXplID0gZGF0YS5zaXplO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBzdGFja0RlbGV0ZTtcbiIsCiAgICAiLyoqXG4gKiBHZXRzIHRoZSBzdGFjayB2YWx1ZSBmb3IgYGtleWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGdldFxuICogQG1lbWJlck9mIFN0YWNrXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBlbnRyeSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gc3RhY2tHZXQoa2V5KSB7XG4gIHJldHVybiB0aGlzLl9fZGF0YV9fLmdldChrZXkpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBzdGFja0dldDtcbiIsCiAgICAiLyoqXG4gKiBDaGVja3MgaWYgYSBzdGFjayB2YWx1ZSBmb3IgYGtleWAgZXhpc3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBoYXNcbiAqIEBtZW1iZXJPZiBTdGFja1xuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBlbnRyeSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBhbiBlbnRyeSBmb3IgYGtleWAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIHN0YWNrSGFzKGtleSkge1xuICByZXR1cm4gdGhpcy5fX2RhdGFfXy5oYXMoa2V5KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgc3RhY2tIYXM7XG4iLAogICAgImltcG9ydCBMaXN0Q2FjaGUgZnJvbSAnLi9fTGlzdENhY2hlLmpzJztcbmltcG9ydCBNYXAgZnJvbSAnLi9fTWFwLmpzJztcbmltcG9ydCBNYXBDYWNoZSBmcm9tICcuL19NYXBDYWNoZS5qcyc7XG5cbi8qKiBVc2VkIGFzIHRoZSBzaXplIHRvIGVuYWJsZSBsYXJnZSBhcnJheSBvcHRpbWl6YXRpb25zLiAqL1xudmFyIExBUkdFX0FSUkFZX1NJWkUgPSAyMDA7XG5cbi8qKlxuICogU2V0cyB0aGUgc3RhY2sgYGtleWAgdG8gYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgc2V0XG4gKiBAbWVtYmVyT2YgU3RhY2tcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gc2V0LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgc3RhY2sgY2FjaGUgaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIHN0YWNrU2V0KGtleSwgdmFsdWUpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fO1xuICBpZiAoZGF0YSBpbnN0YW5jZW9mIExpc3RDYWNoZSkge1xuICAgIHZhciBwYWlycyA9IGRhdGEuX19kYXRhX187XG4gICAgaWYgKCFNYXAgfHwgKHBhaXJzLmxlbmd0aCA8IExBUkdFX0FSUkFZX1NJWkUgLSAxKSkge1xuICAgICAgcGFpcnMucHVzaChba2V5LCB2YWx1ZV0pO1xuICAgICAgdGhpcy5zaXplID0gKytkYXRhLnNpemU7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZGF0YSA9IHRoaXMuX19kYXRhX18gPSBuZXcgTWFwQ2FjaGUocGFpcnMpO1xuICB9XG4gIGRhdGEuc2V0KGtleSwgdmFsdWUpO1xuICB0aGlzLnNpemUgPSBkYXRhLnNpemU7XG4gIHJldHVybiB0aGlzO1xufVxuXG5leHBvcnQgZGVmYXVsdCBzdGFja1NldDtcbiIsCiAgICAiaW1wb3J0IExpc3RDYWNoZSBmcm9tICcuL19MaXN0Q2FjaGUuanMnO1xuaW1wb3J0IHN0YWNrQ2xlYXIgZnJvbSAnLi9fc3RhY2tDbGVhci5qcyc7XG5pbXBvcnQgc3RhY2tEZWxldGUgZnJvbSAnLi9fc3RhY2tEZWxldGUuanMnO1xuaW1wb3J0IHN0YWNrR2V0IGZyb20gJy4vX3N0YWNrR2V0LmpzJztcbmltcG9ydCBzdGFja0hhcyBmcm9tICcuL19zdGFja0hhcy5qcyc7XG5pbXBvcnQgc3RhY2tTZXQgZnJvbSAnLi9fc3RhY2tTZXQuanMnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBzdGFjayBjYWNoZSBvYmplY3QgdG8gc3RvcmUga2V5LXZhbHVlIHBhaXJzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IFtlbnRyaWVzXSBUaGUga2V5LXZhbHVlIHBhaXJzIHRvIGNhY2hlLlxuICovXG5mdW5jdGlvbiBTdGFjayhlbnRyaWVzKSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXyA9IG5ldyBMaXN0Q2FjaGUoZW50cmllcyk7XG4gIHRoaXMuc2l6ZSA9IGRhdGEuc2l6ZTtcbn1cblxuLy8gQWRkIG1ldGhvZHMgdG8gYFN0YWNrYC5cblN0YWNrLnByb3RvdHlwZS5jbGVhciA9IHN0YWNrQ2xlYXI7XG5TdGFjay5wcm90b3R5cGVbJ2RlbGV0ZSddID0gc3RhY2tEZWxldGU7XG5TdGFjay5wcm90b3R5cGUuZ2V0ID0gc3RhY2tHZXQ7XG5TdGFjay5wcm90b3R5cGUuaGFzID0gc3RhY2tIYXM7XG5TdGFjay5wcm90b3R5cGUuc2V0ID0gc3RhY2tTZXQ7XG5cbmV4cG9ydCBkZWZhdWx0IFN0YWNrO1xuIiwKICAgICJpbXBvcnQgY29weU9iamVjdCBmcm9tICcuL19jb3B5T2JqZWN0LmpzJztcbmltcG9ydCBrZXlzIGZyb20gJy4va2V5cy5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uYXNzaWduYCB3aXRob3V0IHN1cHBvcnQgZm9yIG11bHRpcGxlIHNvdXJjZXNcbiAqIG9yIGBjdXN0b21pemVyYCBmdW5jdGlvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIHNvdXJjZSBvYmplY3QuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBiYXNlQXNzaWduKG9iamVjdCwgc291cmNlKSB7XG4gIHJldHVybiBvYmplY3QgJiYgY29weU9iamVjdChzb3VyY2UsIGtleXMoc291cmNlKSwgb2JqZWN0KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUFzc2lnbjtcbiIsCiAgICAiaW1wb3J0IGNvcHlPYmplY3QgZnJvbSAnLi9fY29weU9iamVjdC5qcyc7XG5pbXBvcnQga2V5c0luIGZyb20gJy4va2V5c0luLmpzJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5hc3NpZ25JbmAgd2l0aG91dCBzdXBwb3J0IGZvciBtdWx0aXBsZSBzb3VyY2VzXG4gKiBvciBgY3VzdG9taXplcmAgZnVuY3Rpb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBzb3VyY2Ugb2JqZWN0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gYmFzZUFzc2lnbkluKG9iamVjdCwgc291cmNlKSB7XG4gIHJldHVybiBvYmplY3QgJiYgY29weU9iamVjdChzb3VyY2UsIGtleXNJbihzb3VyY2UpLCBvYmplY3QpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlQXNzaWduSW47XG4iLAogICAgImltcG9ydCByb290IGZyb20gJy4vX3Jvb3QuanMnO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGV4cG9ydHNgLiAqL1xudmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cyAmJiAhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWAuICovXG52YXIgZnJlZU1vZHVsZSA9IGZyZWVFeHBvcnRzICYmIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmICFtb2R1bGUubm9kZVR5cGUgJiYgbW9kdWxlO1xuXG4vKiogRGV0ZWN0IHRoZSBwb3B1bGFyIENvbW1vbkpTIGV4dGVuc2lvbiBgbW9kdWxlLmV4cG9ydHNgLiAqL1xudmFyIG1vZHVsZUV4cG9ydHMgPSBmcmVlTW9kdWxlICYmIGZyZWVNb2R1bGUuZXhwb3J0cyA9PT0gZnJlZUV4cG9ydHM7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIEJ1ZmZlciA9IG1vZHVsZUV4cG9ydHMgPyByb290LkJ1ZmZlciA6IHVuZGVmaW5lZCxcbiAgICBhbGxvY1Vuc2FmZSA9IEJ1ZmZlciA/IEJ1ZmZlci5hbGxvY1Vuc2FmZSA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBDcmVhdGVzIGEgY2xvbmUgb2YgIGBidWZmZXJgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0J1ZmZlcn0gYnVmZmVyIFRoZSBidWZmZXIgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RlZXBdIFNwZWNpZnkgYSBkZWVwIGNsb25lLlxuICogQHJldHVybnMge0J1ZmZlcn0gUmV0dXJucyB0aGUgY2xvbmVkIGJ1ZmZlci5cbiAqL1xuZnVuY3Rpb24gY2xvbmVCdWZmZXIoYnVmZmVyLCBpc0RlZXApIHtcbiAgaWYgKGlzRGVlcCkge1xuICAgIHJldHVybiBidWZmZXIuc2xpY2UoKTtcbiAgfVxuICB2YXIgbGVuZ3RoID0gYnVmZmVyLmxlbmd0aCxcbiAgICAgIHJlc3VsdCA9IGFsbG9jVW5zYWZlID8gYWxsb2NVbnNhZmUobGVuZ3RoKSA6IG5ldyBidWZmZXIuY29uc3RydWN0b3IobGVuZ3RoKTtcblxuICBidWZmZXIuY29weShyZXN1bHQpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbG9uZUJ1ZmZlcjtcbiIsCiAgICAiLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYF8uZmlsdGVyYCBmb3IgYXJyYXlzIHdpdGhvdXQgc3VwcG9ydCBmb3JcbiAqIGl0ZXJhdGVlIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IFthcnJheV0gVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHByZWRpY2F0ZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgZmlsdGVyZWQgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGFycmF5RmlsdGVyKGFycmF5LCBwcmVkaWNhdGUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheSA9PSBudWxsID8gMCA6IGFycmF5Lmxlbmd0aCxcbiAgICAgIHJlc0luZGV4ID0gMCxcbiAgICAgIHJlc3VsdCA9IFtdO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIHZhbHVlID0gYXJyYXlbaW5kZXhdO1xuICAgIGlmIChwcmVkaWNhdGUodmFsdWUsIGluZGV4LCBhcnJheSkpIHtcbiAgICAgIHJlc3VsdFtyZXNJbmRleCsrXSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBhcnJheUZpbHRlcjtcbiIsCiAgICAiLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIGEgbmV3IGVtcHR5IGFycmF5LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4xMy4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgZW1wdHkgYXJyYXkuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBhcnJheXMgPSBfLnRpbWVzKDIsIF8uc3R1YkFycmF5KTtcbiAqXG4gKiBjb25zb2xlLmxvZyhhcnJheXMpO1xuICogLy8gPT4gW1tdLCBbXV1cbiAqXG4gKiBjb25zb2xlLmxvZyhhcnJheXNbMF0gPT09IGFycmF5c1sxXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBzdHViQXJyYXkoKSB7XG4gIHJldHVybiBbXTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgc3R1YkFycmF5O1xuIiwKICAgICJpbXBvcnQgYXJyYXlGaWx0ZXIgZnJvbSAnLi9fYXJyYXlGaWx0ZXIuanMnO1xuaW1wb3J0IHN0dWJBcnJheSBmcm9tICcuL3N0dWJBcnJheS5qcyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHByb3BlcnR5SXNFbnVtZXJhYmxlID0gb2JqZWN0UHJvdG8ucHJvcGVydHlJc0VudW1lcmFibGU7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVHZXRTeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scztcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gZW51bWVyYWJsZSBzeW1ib2xzIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHN5bWJvbHMuXG4gKi9cbnZhciBnZXRTeW1ib2xzID0gIW5hdGl2ZUdldFN5bWJvbHMgPyBzdHViQXJyYXkgOiBmdW5jdGlvbihvYmplY3QpIHtcbiAgaWYgKG9iamVjdCA9PSBudWxsKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIG9iamVjdCA9IE9iamVjdChvYmplY3QpO1xuICByZXR1cm4gYXJyYXlGaWx0ZXIobmF0aXZlR2V0U3ltYm9scyhvYmplY3QpLCBmdW5jdGlvbihzeW1ib2wpIHtcbiAgICByZXR1cm4gcHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChvYmplY3QsIHN5bWJvbCk7XG4gIH0pO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZ2V0U3ltYm9scztcbiIsCiAgICAiaW1wb3J0IGNvcHlPYmplY3QgZnJvbSAnLi9fY29weU9iamVjdC5qcyc7XG5pbXBvcnQgZ2V0U3ltYm9scyBmcm9tICcuL19nZXRTeW1ib2xzLmpzJztcblxuLyoqXG4gKiBDb3BpZXMgb3duIHN5bWJvbHMgb2YgYHNvdXJjZWAgdG8gYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIG9iamVjdCB0byBjb3B5IHN5bWJvbHMgZnJvbS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0PXt9XSBUaGUgb2JqZWN0IHRvIGNvcHkgc3ltYm9scyB0by5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGNvcHlTeW1ib2xzKHNvdXJjZSwgb2JqZWN0KSB7XG4gIHJldHVybiBjb3B5T2JqZWN0KHNvdXJjZSwgZ2V0U3ltYm9scyhzb3VyY2UpLCBvYmplY3QpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjb3B5U3ltYm9scztcbiIsCiAgICAiaW1wb3J0IGFycmF5UHVzaCBmcm9tICcuL19hcnJheVB1c2guanMnO1xuaW1wb3J0IGdldFByb3RvdHlwZSBmcm9tICcuL19nZXRQcm90b3R5cGUuanMnO1xuaW1wb3J0IGdldFN5bWJvbHMgZnJvbSAnLi9fZ2V0U3ltYm9scy5qcyc7XG5pbXBvcnQgc3R1YkFycmF5IGZyb20gJy4vc3R1YkFycmF5LmpzJztcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUdldFN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIG93biBhbmQgaW5oZXJpdGVkIGVudW1lcmFibGUgc3ltYm9scyBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBzeW1ib2xzLlxuICovXG52YXIgZ2V0U3ltYm9sc0luID0gIW5hdGl2ZUdldFN5bWJvbHMgPyBzdHViQXJyYXkgOiBmdW5jdGlvbihvYmplY3QpIHtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB3aGlsZSAob2JqZWN0KSB7XG4gICAgYXJyYXlQdXNoKHJlc3VsdCwgZ2V0U3ltYm9scyhvYmplY3QpKTtcbiAgICBvYmplY3QgPSBnZXRQcm90b3R5cGUob2JqZWN0KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZ2V0U3ltYm9sc0luO1xuIiwKICAgICJpbXBvcnQgY29weU9iamVjdCBmcm9tICcuL19jb3B5T2JqZWN0LmpzJztcbmltcG9ydCBnZXRTeW1ib2xzSW4gZnJvbSAnLi9fZ2V0U3ltYm9sc0luLmpzJztcblxuLyoqXG4gKiBDb3BpZXMgb3duIGFuZCBpbmhlcml0ZWQgc3ltYm9scyBvZiBgc291cmNlYCB0byBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgb2JqZWN0IHRvIGNvcHkgc3ltYm9scyBmcm9tLlxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3Q9e31dIFRoZSBvYmplY3QgdG8gY29weSBzeW1ib2xzIHRvLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gY29weVN5bWJvbHNJbihzb3VyY2UsIG9iamVjdCkge1xuICByZXR1cm4gY29weU9iamVjdChzb3VyY2UsIGdldFN5bWJvbHNJbihzb3VyY2UpLCBvYmplY3QpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjb3B5U3ltYm9sc0luO1xuIiwKICAgICJpbXBvcnQgYXJyYXlQdXNoIGZyb20gJy4vX2FycmF5UHVzaC5qcyc7XG5pbXBvcnQgaXNBcnJheSBmcm9tICcuL2lzQXJyYXkuanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBnZXRBbGxLZXlzYCBhbmQgYGdldEFsbEtleXNJbmAgd2hpY2ggdXNlc1xuICogYGtleXNGdW5jYCBhbmQgYHN5bWJvbHNGdW5jYCB0byBnZXQgdGhlIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgYW5kXG4gKiBzeW1ib2xzIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBrZXlzRnVuYyBUaGUgZnVuY3Rpb24gdG8gZ2V0IHRoZSBrZXlzIG9mIGBvYmplY3RgLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gc3ltYm9sc0Z1bmMgVGhlIGZ1bmN0aW9uIHRvIGdldCB0aGUgc3ltYm9scyBvZiBgb2JqZWN0YC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMgYW5kIHN5bWJvbHMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VHZXRBbGxLZXlzKG9iamVjdCwga2V5c0Z1bmMsIHN5bWJvbHNGdW5jKSB7XG4gIHZhciByZXN1bHQgPSBrZXlzRnVuYyhvYmplY3QpO1xuICByZXR1cm4gaXNBcnJheShvYmplY3QpID8gcmVzdWx0IDogYXJyYXlQdXNoKHJlc3VsdCwgc3ltYm9sc0Z1bmMob2JqZWN0KSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VHZXRBbGxLZXlzO1xuIiwKICAgICJpbXBvcnQgYmFzZUdldEFsbEtleXMgZnJvbSAnLi9fYmFzZUdldEFsbEtleXMuanMnO1xuaW1wb3J0IGdldFN5bWJvbHMgZnJvbSAnLi9fZ2V0U3ltYm9scy5qcyc7XG5pbXBvcnQga2V5cyBmcm9tICcuL2tleXMuanMnO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2Ygb3duIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgYW5kIHN5bWJvbHMgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMgYW5kIHN5bWJvbHMuXG4gKi9cbmZ1bmN0aW9uIGdldEFsbEtleXMob2JqZWN0KSB7XG4gIHJldHVybiBiYXNlR2V0QWxsS2V5cyhvYmplY3QsIGtleXMsIGdldFN5bWJvbHMpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBnZXRBbGxLZXlzO1xuIiwKICAgICJpbXBvcnQgYmFzZUdldEFsbEtleXMgZnJvbSAnLi9fYmFzZUdldEFsbEtleXMuanMnO1xuaW1wb3J0IGdldFN5bWJvbHNJbiBmcm9tICcuL19nZXRTeW1ib2xzSW4uanMnO1xuaW1wb3J0IGtleXNJbiBmcm9tICcuL2tleXNJbi5qcyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiBvd24gYW5kIGluaGVyaXRlZCBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIGFuZFxuICogc3ltYm9scyBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcyBhbmQgc3ltYm9scy5cbiAqL1xuZnVuY3Rpb24gZ2V0QWxsS2V5c0luKG9iamVjdCkge1xuICByZXR1cm4gYmFzZUdldEFsbEtleXMob2JqZWN0LCBrZXlzSW4sIGdldFN5bWJvbHNJbik7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGdldEFsbEtleXNJbjtcbiIsCiAgICAiaW1wb3J0IGdldE5hdGl2ZSBmcm9tICcuL19nZXROYXRpdmUuanMnO1xuaW1wb3J0IHJvb3QgZnJvbSAnLi9fcm9vdC5qcyc7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBEYXRhVmlldyA9IGdldE5hdGl2ZShyb290LCAnRGF0YVZpZXcnKTtcblxuZXhwb3J0IGRlZmF1bHQgRGF0YVZpZXc7XG4iLAogICAgImltcG9ydCBnZXROYXRpdmUgZnJvbSAnLi9fZ2V0TmF0aXZlLmpzJztcbmltcG9ydCByb290IGZyb20gJy4vX3Jvb3QuanMnO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG52YXIgUHJvbWlzZSA9IGdldE5hdGl2ZShyb290LCAnUHJvbWlzZScpO1xuXG5leHBvcnQgZGVmYXVsdCBQcm9taXNlO1xuIiwKICAgICJpbXBvcnQgZ2V0TmF0aXZlIGZyb20gJy4vX2dldE5hdGl2ZS5qcyc7XG5pbXBvcnQgcm9vdCBmcm9tICcuL19yb290LmpzJztcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgdGhhdCBhcmUgdmVyaWZpZWQgdG8gYmUgbmF0aXZlLiAqL1xudmFyIFNldCA9IGdldE5hdGl2ZShyb290LCAnU2V0Jyk7XG5cbmV4cG9ydCBkZWZhdWx0IFNldDtcbiIsCiAgICAiaW1wb3J0IERhdGFWaWV3IGZyb20gJy4vX0RhdGFWaWV3LmpzJztcbmltcG9ydCBNYXAgZnJvbSAnLi9fTWFwLmpzJztcbmltcG9ydCBQcm9taXNlIGZyb20gJy4vX1Byb21pc2UuanMnO1xuaW1wb3J0IFNldCBmcm9tICcuL19TZXQuanMnO1xuaW1wb3J0IFdlYWtNYXAgZnJvbSAnLi9fV2Vha01hcC5qcyc7XG5pbXBvcnQgYmFzZUdldFRhZyBmcm9tICcuL19iYXNlR2V0VGFnLmpzJztcbmltcG9ydCB0b1NvdXJjZSBmcm9tICcuL190b1NvdXJjZS5qcyc7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBtYXBUYWcgPSAnW29iamVjdCBNYXBdJyxcbiAgICBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJyxcbiAgICBwcm9taXNlVGFnID0gJ1tvYmplY3QgUHJvbWlzZV0nLFxuICAgIHNldFRhZyA9ICdbb2JqZWN0IFNldF0nLFxuICAgIHdlYWtNYXBUYWcgPSAnW29iamVjdCBXZWFrTWFwXSc7XG5cbnZhciBkYXRhVmlld1RhZyA9ICdbb2JqZWN0IERhdGFWaWV3XSc7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBtYXBzLCBzZXRzLCBhbmQgd2Vha21hcHMuICovXG52YXIgZGF0YVZpZXdDdG9yU3RyaW5nID0gdG9Tb3VyY2UoRGF0YVZpZXcpLFxuICAgIG1hcEN0b3JTdHJpbmcgPSB0b1NvdXJjZShNYXApLFxuICAgIHByb21pc2VDdG9yU3RyaW5nID0gdG9Tb3VyY2UoUHJvbWlzZSksXG4gICAgc2V0Q3RvclN0cmluZyA9IHRvU291cmNlKFNldCksXG4gICAgd2Vha01hcEN0b3JTdHJpbmcgPSB0b1NvdXJjZShXZWFrTWFwKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBgdG9TdHJpbmdUYWdgIG9mIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgYHRvU3RyaW5nVGFnYC5cbiAqL1xudmFyIGdldFRhZyA9IGJhc2VHZXRUYWc7XG5cbi8vIEZhbGxiYWNrIGZvciBkYXRhIHZpZXdzLCBtYXBzLCBzZXRzLCBhbmQgd2VhayBtYXBzIGluIElFIDExIGFuZCBwcm9taXNlcyBpbiBOb2RlLmpzIDwgNi5cbmlmICgoRGF0YVZpZXcgJiYgZ2V0VGFnKG5ldyBEYXRhVmlldyhuZXcgQXJyYXlCdWZmZXIoMSkpKSAhPSBkYXRhVmlld1RhZykgfHxcbiAgICAoTWFwICYmIGdldFRhZyhuZXcgTWFwKSAhPSBtYXBUYWcpIHx8XG4gICAgKFByb21pc2UgJiYgZ2V0VGFnKFByb21pc2UucmVzb2x2ZSgpKSAhPSBwcm9taXNlVGFnKSB8fFxuICAgIChTZXQgJiYgZ2V0VGFnKG5ldyBTZXQpICE9IHNldFRhZykgfHxcbiAgICAoV2Vha01hcCAmJiBnZXRUYWcobmV3IFdlYWtNYXApICE9IHdlYWtNYXBUYWcpKSB7XG4gIGdldFRhZyA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgdmFyIHJlc3VsdCA9IGJhc2VHZXRUYWcodmFsdWUpLFxuICAgICAgICBDdG9yID0gcmVzdWx0ID09IG9iamVjdFRhZyA/IHZhbHVlLmNvbnN0cnVjdG9yIDogdW5kZWZpbmVkLFxuICAgICAgICBjdG9yU3RyaW5nID0gQ3RvciA/IHRvU291cmNlKEN0b3IpIDogJyc7XG5cbiAgICBpZiAoY3RvclN0cmluZykge1xuICAgICAgc3dpdGNoIChjdG9yU3RyaW5nKSB7XG4gICAgICAgIGNhc2UgZGF0YVZpZXdDdG9yU3RyaW5nOiByZXR1cm4gZGF0YVZpZXdUYWc7XG4gICAgICAgIGNhc2UgbWFwQ3RvclN0cmluZzogcmV0dXJuIG1hcFRhZztcbiAgICAgICAgY2FzZSBwcm9taXNlQ3RvclN0cmluZzogcmV0dXJuIHByb21pc2VUYWc7XG4gICAgICAgIGNhc2Ugc2V0Q3RvclN0cmluZzogcmV0dXJuIHNldFRhZztcbiAgICAgICAgY2FzZSB3ZWFrTWFwQ3RvclN0cmluZzogcmV0dXJuIHdlYWtNYXBUYWc7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGdldFRhZztcbiIsCiAgICAiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBJbml0aWFsaXplcyBhbiBhcnJheSBjbG9uZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGNsb25lLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBpbml0aWFsaXplZCBjbG9uZS5cbiAqL1xuZnVuY3Rpb24gaW5pdENsb25lQXJyYXkoYXJyYXkpIHtcbiAgdmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aCxcbiAgICAgIHJlc3VsdCA9IG5ldyBhcnJheS5jb25zdHJ1Y3RvcihsZW5ndGgpO1xuXG4gIC8vIEFkZCBwcm9wZXJ0aWVzIGFzc2lnbmVkIGJ5IGBSZWdFeHAjZXhlY2AuXG4gIGlmIChsZW5ndGggJiYgdHlwZW9mIGFycmF5WzBdID09ICdzdHJpbmcnICYmIGhhc093blByb3BlcnR5LmNhbGwoYXJyYXksICdpbmRleCcpKSB7XG4gICAgcmVzdWx0LmluZGV4ID0gYXJyYXkuaW5kZXg7XG4gICAgcmVzdWx0LmlucHV0ID0gYXJyYXkuaW5wdXQ7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaW5pdENsb25lQXJyYXk7XG4iLAogICAgImltcG9ydCByb290IGZyb20gJy4vX3Jvb3QuanMnO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBVaW50OEFycmF5ID0gcm9vdC5VaW50OEFycmF5O1xuXG5leHBvcnQgZGVmYXVsdCBVaW50OEFycmF5O1xuIiwKICAgICJpbXBvcnQgVWludDhBcnJheSBmcm9tICcuL19VaW50OEFycmF5LmpzJztcblxuLyoqXG4gKiBDcmVhdGVzIGEgY2xvbmUgb2YgYGFycmF5QnVmZmVyYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheUJ1ZmZlcn0gYXJyYXlCdWZmZXIgVGhlIGFycmF5IGJ1ZmZlciB0byBjbG9uZS5cbiAqIEByZXR1cm5zIHtBcnJheUJ1ZmZlcn0gUmV0dXJucyB0aGUgY2xvbmVkIGFycmF5IGJ1ZmZlci5cbiAqL1xuZnVuY3Rpb24gY2xvbmVBcnJheUJ1ZmZlcihhcnJheUJ1ZmZlcikge1xuICB2YXIgcmVzdWx0ID0gbmV3IGFycmF5QnVmZmVyLmNvbnN0cnVjdG9yKGFycmF5QnVmZmVyLmJ5dGVMZW5ndGgpO1xuICBuZXcgVWludDhBcnJheShyZXN1bHQpLnNldChuZXcgVWludDhBcnJheShhcnJheUJ1ZmZlcikpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbG9uZUFycmF5QnVmZmVyO1xuIiwKICAgICJpbXBvcnQgY2xvbmVBcnJheUJ1ZmZlciBmcm9tICcuL19jbG9uZUFycmF5QnVmZmVyLmpzJztcblxuLyoqXG4gKiBDcmVhdGVzIGEgY2xvbmUgb2YgYGRhdGFWaWV3YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IGRhdGFWaWV3IFRoZSBkYXRhIHZpZXcgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RlZXBdIFNwZWNpZnkgYSBkZWVwIGNsb25lLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgY2xvbmVkIGRhdGEgdmlldy5cbiAqL1xuZnVuY3Rpb24gY2xvbmVEYXRhVmlldyhkYXRhVmlldywgaXNEZWVwKSB7XG4gIHZhciBidWZmZXIgPSBpc0RlZXAgPyBjbG9uZUFycmF5QnVmZmVyKGRhdGFWaWV3LmJ1ZmZlcikgOiBkYXRhVmlldy5idWZmZXI7XG4gIHJldHVybiBuZXcgZGF0YVZpZXcuY29uc3RydWN0b3IoYnVmZmVyLCBkYXRhVmlldy5ieXRlT2Zmc2V0LCBkYXRhVmlldy5ieXRlTGVuZ3RoKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xvbmVEYXRhVmlldztcbiIsCiAgICAiLyoqIFVzZWQgdG8gbWF0Y2ggYFJlZ0V4cGAgZmxhZ3MgZnJvbSB0aGVpciBjb2VyY2VkIHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVGbGFncyA9IC9cXHcqJC87XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNsb25lIG9mIGByZWdleHBgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gcmVnZXhwIFRoZSByZWdleHAgdG8gY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjbG9uZWQgcmVnZXhwLlxuICovXG5mdW5jdGlvbiBjbG9uZVJlZ0V4cChyZWdleHApIHtcbiAgdmFyIHJlc3VsdCA9IG5ldyByZWdleHAuY29uc3RydWN0b3IocmVnZXhwLnNvdXJjZSwgcmVGbGFncy5leGVjKHJlZ2V4cCkpO1xuICByZXN1bHQubGFzdEluZGV4ID0gcmVnZXhwLmxhc3RJbmRleDtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xvbmVSZWdFeHA7XG4iLAogICAgImltcG9ydCBTeW1ib2wgZnJvbSAnLi9fU3ltYm9sLmpzJztcblxuLyoqIFVzZWQgdG8gY29udmVydCBzeW1ib2xzIHRvIHByaW1pdGl2ZXMgYW5kIHN0cmluZ3MuICovXG52YXIgc3ltYm9sUHJvdG8gPSBTeW1ib2wgPyBTeW1ib2wucHJvdG90eXBlIDogdW5kZWZpbmVkLFxuICAgIHN5bWJvbFZhbHVlT2YgPSBzeW1ib2xQcm90byA/IHN5bWJvbFByb3RvLnZhbHVlT2YgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNsb25lIG9mIHRoZSBgc3ltYm9sYCBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzeW1ib2wgVGhlIHN5bWJvbCBvYmplY3QgdG8gY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjbG9uZWQgc3ltYm9sIG9iamVjdC5cbiAqL1xuZnVuY3Rpb24gY2xvbmVTeW1ib2woc3ltYm9sKSB7XG4gIHJldHVybiBzeW1ib2xWYWx1ZU9mID8gT2JqZWN0KHN5bWJvbFZhbHVlT2YuY2FsbChzeW1ib2wpKSA6IHt9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbG9uZVN5bWJvbDtcbiIsCiAgICAiaW1wb3J0IGNsb25lQXJyYXlCdWZmZXIgZnJvbSAnLi9fY2xvbmVBcnJheUJ1ZmZlci5qcyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNsb25lIG9mIGB0eXBlZEFycmF5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHR5cGVkQXJyYXkgVGhlIHR5cGVkIGFycmF5IHRvIGNsb25lLlxuICogQHBhcmFtIHtib29sZWFufSBbaXNEZWVwXSBTcGVjaWZ5IGEgZGVlcCBjbG9uZS5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGNsb25lZCB0eXBlZCBhcnJheS5cbiAqL1xuZnVuY3Rpb24gY2xvbmVUeXBlZEFycmF5KHR5cGVkQXJyYXksIGlzRGVlcCkge1xuICB2YXIgYnVmZmVyID0gaXNEZWVwID8gY2xvbmVBcnJheUJ1ZmZlcih0eXBlZEFycmF5LmJ1ZmZlcikgOiB0eXBlZEFycmF5LmJ1ZmZlcjtcbiAgcmV0dXJuIG5ldyB0eXBlZEFycmF5LmNvbnN0cnVjdG9yKGJ1ZmZlciwgdHlwZWRBcnJheS5ieXRlT2Zmc2V0LCB0eXBlZEFycmF5Lmxlbmd0aCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsb25lVHlwZWRBcnJheTtcbiIsCiAgICAiaW1wb3J0IGNsb25lQXJyYXlCdWZmZXIgZnJvbSAnLi9fY2xvbmVBcnJheUJ1ZmZlci5qcyc7XG5pbXBvcnQgY2xvbmVEYXRhVmlldyBmcm9tICcuL19jbG9uZURhdGFWaWV3LmpzJztcbmltcG9ydCBjbG9uZVJlZ0V4cCBmcm9tICcuL19jbG9uZVJlZ0V4cC5qcyc7XG5pbXBvcnQgY2xvbmVTeW1ib2wgZnJvbSAnLi9fY2xvbmVTeW1ib2wuanMnO1xuaW1wb3J0IGNsb25lVHlwZWRBcnJheSBmcm9tICcuL19jbG9uZVR5cGVkQXJyYXkuanMnO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYm9vbFRhZyA9ICdbb2JqZWN0IEJvb2xlYW5dJyxcbiAgICBkYXRlVGFnID0gJ1tvYmplY3QgRGF0ZV0nLFxuICAgIG1hcFRhZyA9ICdbb2JqZWN0IE1hcF0nLFxuICAgIG51bWJlclRhZyA9ICdbb2JqZWN0IE51bWJlcl0nLFxuICAgIHJlZ2V4cFRhZyA9ICdbb2JqZWN0IFJlZ0V4cF0nLFxuICAgIHNldFRhZyA9ICdbb2JqZWN0IFNldF0nLFxuICAgIHN0cmluZ1RhZyA9ICdbb2JqZWN0IFN0cmluZ10nLFxuICAgIHN5bWJvbFRhZyA9ICdbb2JqZWN0IFN5bWJvbF0nO1xuXG52YXIgYXJyYXlCdWZmZXJUYWcgPSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nLFxuICAgIGRhdGFWaWV3VGFnID0gJ1tvYmplY3QgRGF0YVZpZXddJyxcbiAgICBmbG9hdDMyVGFnID0gJ1tvYmplY3QgRmxvYXQzMkFycmF5XScsXG4gICAgZmxvYXQ2NFRhZyA9ICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nLFxuICAgIGludDhUYWcgPSAnW29iamVjdCBJbnQ4QXJyYXldJyxcbiAgICBpbnQxNlRhZyA9ICdbb2JqZWN0IEludDE2QXJyYXldJyxcbiAgICBpbnQzMlRhZyA9ICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICB1aW50OFRhZyA9ICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgICB1aW50OENsYW1wZWRUYWcgPSAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgIHVpbnQxNlRhZyA9ICdbb2JqZWN0IFVpbnQxNkFycmF5XScsXG4gICAgdWludDMyVGFnID0gJ1tvYmplY3QgVWludDMyQXJyYXldJztcblxuLyoqXG4gKiBJbml0aWFsaXplcyBhbiBvYmplY3QgY2xvbmUgYmFzZWQgb24gaXRzIGB0b1N0cmluZ1RhZ2AuXG4gKlxuICogKipOb3RlOioqIFRoaXMgZnVuY3Rpb24gb25seSBzdXBwb3J0cyBjbG9uaW5nIHZhbHVlcyB3aXRoIHRhZ3Mgb2ZcbiAqIGBCb29sZWFuYCwgYERhdGVgLCBgRXJyb3JgLCBgTWFwYCwgYE51bWJlcmAsIGBSZWdFeHBgLCBgU2V0YCwgb3IgYFN0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBjbG9uZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0YWcgVGhlIGB0b1N0cmluZ1RhZ2Agb2YgdGhlIG9iamVjdCB0byBjbG9uZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGVlcF0gU3BlY2lmeSBhIGRlZXAgY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBpbml0aWFsaXplZCBjbG9uZS5cbiAqL1xuZnVuY3Rpb24gaW5pdENsb25lQnlUYWcob2JqZWN0LCB0YWcsIGlzRGVlcCkge1xuICB2YXIgQ3RvciA9IG9iamVjdC5jb25zdHJ1Y3RvcjtcbiAgc3dpdGNoICh0YWcpIHtcbiAgICBjYXNlIGFycmF5QnVmZmVyVGFnOlxuICAgICAgcmV0dXJuIGNsb25lQXJyYXlCdWZmZXIob2JqZWN0KTtcblxuICAgIGNhc2UgYm9vbFRhZzpcbiAgICBjYXNlIGRhdGVUYWc6XG4gICAgICByZXR1cm4gbmV3IEN0b3IoK29iamVjdCk7XG5cbiAgICBjYXNlIGRhdGFWaWV3VGFnOlxuICAgICAgcmV0dXJuIGNsb25lRGF0YVZpZXcob2JqZWN0LCBpc0RlZXApO1xuXG4gICAgY2FzZSBmbG9hdDMyVGFnOiBjYXNlIGZsb2F0NjRUYWc6XG4gICAgY2FzZSBpbnQ4VGFnOiBjYXNlIGludDE2VGFnOiBjYXNlIGludDMyVGFnOlxuICAgIGNhc2UgdWludDhUYWc6IGNhc2UgdWludDhDbGFtcGVkVGFnOiBjYXNlIHVpbnQxNlRhZzogY2FzZSB1aW50MzJUYWc6XG4gICAgICByZXR1cm4gY2xvbmVUeXBlZEFycmF5KG9iamVjdCwgaXNEZWVwKTtcblxuICAgIGNhc2UgbWFwVGFnOlxuICAgICAgcmV0dXJuIG5ldyBDdG9yO1xuXG4gICAgY2FzZSBudW1iZXJUYWc6XG4gICAgY2FzZSBzdHJpbmdUYWc6XG4gICAgICByZXR1cm4gbmV3IEN0b3Iob2JqZWN0KTtcblxuICAgIGNhc2UgcmVnZXhwVGFnOlxuICAgICAgcmV0dXJuIGNsb25lUmVnRXhwKG9iamVjdCk7XG5cbiAgICBjYXNlIHNldFRhZzpcbiAgICAgIHJldHVybiBuZXcgQ3RvcjtcblxuICAgIGNhc2Ugc3ltYm9sVGFnOlxuICAgICAgcmV0dXJuIGNsb25lU3ltYm9sKG9iamVjdCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgaW5pdENsb25lQnlUYWc7XG4iLAogICAgImltcG9ydCBiYXNlQ3JlYXRlIGZyb20gJy4vX2Jhc2VDcmVhdGUuanMnO1xuaW1wb3J0IGdldFByb3RvdHlwZSBmcm9tICcuL19nZXRQcm90b3R5cGUuanMnO1xuaW1wb3J0IGlzUHJvdG90eXBlIGZyb20gJy4vX2lzUHJvdG90eXBlLmpzJztcblxuLyoqXG4gKiBJbml0aWFsaXplcyBhbiBvYmplY3QgY2xvbmUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBjbG9uZS5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGluaXRpYWxpemVkIGNsb25lLlxuICovXG5mdW5jdGlvbiBpbml0Q2xvbmVPYmplY3Qob2JqZWN0KSB7XG4gIHJldHVybiAodHlwZW9mIG9iamVjdC5jb25zdHJ1Y3RvciA9PSAnZnVuY3Rpb24nICYmICFpc1Byb3RvdHlwZShvYmplY3QpKVxuICAgID8gYmFzZUNyZWF0ZShnZXRQcm90b3R5cGUob2JqZWN0KSlcbiAgICA6IHt9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBpbml0Q2xvbmVPYmplY3Q7XG4iLAogICAgImltcG9ydCBnZXRUYWcgZnJvbSAnLi9fZ2V0VGFnLmpzJztcbmltcG9ydCBpc09iamVjdExpa2UgZnJvbSAnLi9pc09iamVjdExpa2UuanMnO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgbWFwVGFnID0gJ1tvYmplY3QgTWFwXSc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNNYXBgIHdpdGhvdXQgTm9kZS5qcyBvcHRpbWl6YXRpb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgbWFwLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc01hcCh2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBnZXRUYWcodmFsdWUpID09IG1hcFRhZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUlzTWFwO1xuIiwKICAgICJpbXBvcnQgYmFzZUlzTWFwIGZyb20gJy4vX2Jhc2VJc01hcC5qcyc7XG5pbXBvcnQgYmFzZVVuYXJ5IGZyb20gJy4vX2Jhc2VVbmFyeS5qcyc7XG5pbXBvcnQgbm9kZVV0aWwgZnJvbSAnLi9fbm9kZVV0aWwuanMnO1xuXG4vKiBOb2RlLmpzIGhlbHBlciByZWZlcmVuY2VzLiAqL1xudmFyIG5vZGVJc01hcCA9IG5vZGVVdGlsICYmIG5vZGVVdGlsLmlzTWFwO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgTWFwYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjMuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBtYXAsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc01hcChuZXcgTWFwKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzTWFwKG5ldyBXZWFrTWFwKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc01hcCA9IG5vZGVJc01hcCA/IGJhc2VVbmFyeShub2RlSXNNYXApIDogYmFzZUlzTWFwO1xuXG5leHBvcnQgZGVmYXVsdCBpc01hcDtcbiIsCiAgICAiaW1wb3J0IGdldFRhZyBmcm9tICcuL19nZXRUYWcuanMnO1xuaW1wb3J0IGlzT2JqZWN0TGlrZSBmcm9tICcuL2lzT2JqZWN0TGlrZS5qcyc7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBzZXRUYWcgPSAnW29iamVjdCBTZXRdJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc1NldGAgd2l0aG91dCBOb2RlLmpzIG9wdGltaXphdGlvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBzZXQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUlzU2V0KHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmIGdldFRhZyh2YWx1ZSkgPT0gc2V0VGFnO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlSXNTZXQ7XG4iLAogICAgImltcG9ydCBiYXNlSXNTZXQgZnJvbSAnLi9fYmFzZUlzU2V0LmpzJztcbmltcG9ydCBiYXNlVW5hcnkgZnJvbSAnLi9fYmFzZVVuYXJ5LmpzJztcbmltcG9ydCBub2RlVXRpbCBmcm9tICcuL19ub2RlVXRpbC5qcyc7XG5cbi8qIE5vZGUuanMgaGVscGVyIHJlZmVyZW5jZXMuICovXG52YXIgbm9kZUlzU2V0ID0gbm9kZVV0aWwgJiYgbm9kZVV0aWwuaXNTZXQ7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBTZXRgIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMy4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHNldCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzU2V0KG5ldyBTZXQpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNTZXQobmV3IFdlYWtTZXQpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzU2V0ID0gbm9kZUlzU2V0ID8gYmFzZVVuYXJ5KG5vZGVJc1NldCkgOiBiYXNlSXNTZXQ7XG5cbmV4cG9ydCBkZWZhdWx0IGlzU2V0O1xuIiwKICAgICJpbXBvcnQgU3RhY2sgZnJvbSAnLi9fU3RhY2suanMnO1xuaW1wb3J0IGFycmF5RWFjaCBmcm9tICcuL19hcnJheUVhY2guanMnO1xuaW1wb3J0IGFzc2lnblZhbHVlIGZyb20gJy4vX2Fzc2lnblZhbHVlLmpzJztcbmltcG9ydCBiYXNlQXNzaWduIGZyb20gJy4vX2Jhc2VBc3NpZ24uanMnO1xuaW1wb3J0IGJhc2VBc3NpZ25JbiBmcm9tICcuL19iYXNlQXNzaWduSW4uanMnO1xuaW1wb3J0IGNsb25lQnVmZmVyIGZyb20gJy4vX2Nsb25lQnVmZmVyLmpzJztcbmltcG9ydCBjb3B5QXJyYXkgZnJvbSAnLi9fY29weUFycmF5LmpzJztcbmltcG9ydCBjb3B5U3ltYm9scyBmcm9tICcuL19jb3B5U3ltYm9scy5qcyc7XG5pbXBvcnQgY29weVN5bWJvbHNJbiBmcm9tICcuL19jb3B5U3ltYm9sc0luLmpzJztcbmltcG9ydCBnZXRBbGxLZXlzIGZyb20gJy4vX2dldEFsbEtleXMuanMnO1xuaW1wb3J0IGdldEFsbEtleXNJbiBmcm9tICcuL19nZXRBbGxLZXlzSW4uanMnO1xuaW1wb3J0IGdldFRhZyBmcm9tICcuL19nZXRUYWcuanMnO1xuaW1wb3J0IGluaXRDbG9uZUFycmF5IGZyb20gJy4vX2luaXRDbG9uZUFycmF5LmpzJztcbmltcG9ydCBpbml0Q2xvbmVCeVRhZyBmcm9tICcuL19pbml0Q2xvbmVCeVRhZy5qcyc7XG5pbXBvcnQgaW5pdENsb25lT2JqZWN0IGZyb20gJy4vX2luaXRDbG9uZU9iamVjdC5qcyc7XG5pbXBvcnQgaXNBcnJheSBmcm9tICcuL2lzQXJyYXkuanMnO1xuaW1wb3J0IGlzQnVmZmVyIGZyb20gJy4vaXNCdWZmZXIuanMnO1xuaW1wb3J0IGlzTWFwIGZyb20gJy4vaXNNYXAuanMnO1xuaW1wb3J0IGlzT2JqZWN0IGZyb20gJy4vaXNPYmplY3QuanMnO1xuaW1wb3J0IGlzU2V0IGZyb20gJy4vaXNTZXQuanMnO1xuaW1wb3J0IGtleXMgZnJvbSAnLi9rZXlzLmpzJztcbmltcG9ydCBrZXlzSW4gZnJvbSAnLi9rZXlzSW4uanMnO1xuXG4vKiogVXNlZCB0byBjb21wb3NlIGJpdG1hc2tzIGZvciBjbG9uaW5nLiAqL1xudmFyIENMT05FX0RFRVBfRkxBRyA9IDEsXG4gICAgQ0xPTkVfRkxBVF9GTEFHID0gMixcbiAgICBDTE9ORV9TWU1CT0xTX0ZMQUcgPSA0O1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nLFxuICAgIGFycmF5VGFnID0gJ1tvYmplY3QgQXJyYXldJyxcbiAgICBib29sVGFnID0gJ1tvYmplY3QgQm9vbGVhbl0nLFxuICAgIGRhdGVUYWcgPSAnW29iamVjdCBEYXRlXScsXG4gICAgZXJyb3JUYWcgPSAnW29iamVjdCBFcnJvcl0nLFxuICAgIGZ1bmNUYWcgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgIGdlblRhZyA9ICdbb2JqZWN0IEdlbmVyYXRvckZ1bmN0aW9uXScsXG4gICAgbWFwVGFnID0gJ1tvYmplY3QgTWFwXScsXG4gICAgbnVtYmVyVGFnID0gJ1tvYmplY3QgTnVtYmVyXScsXG4gICAgb2JqZWN0VGFnID0gJ1tvYmplY3QgT2JqZWN0XScsXG4gICAgcmVnZXhwVGFnID0gJ1tvYmplY3QgUmVnRXhwXScsXG4gICAgc2V0VGFnID0gJ1tvYmplY3QgU2V0XScsXG4gICAgc3RyaW5nVGFnID0gJ1tvYmplY3QgU3RyaW5nXScsXG4gICAgc3ltYm9sVGFnID0gJ1tvYmplY3QgU3ltYm9sXScsXG4gICAgd2Vha01hcFRhZyA9ICdbb2JqZWN0IFdlYWtNYXBdJztcblxudmFyIGFycmF5QnVmZmVyVGFnID0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJyxcbiAgICBkYXRhVmlld1RhZyA9ICdbb2JqZWN0IERhdGFWaWV3XScsXG4gICAgZmxvYXQzMlRhZyA9ICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nLFxuICAgIGZsb2F0NjRUYWcgPSAnW29iamVjdCBGbG9hdDY0QXJyYXldJyxcbiAgICBpbnQ4VGFnID0gJ1tvYmplY3QgSW50OEFycmF5XScsXG4gICAgaW50MTZUYWcgPSAnW29iamVjdCBJbnQxNkFycmF5XScsXG4gICAgaW50MzJUYWcgPSAnW29iamVjdCBJbnQzMkFycmF5XScsXG4gICAgdWludDhUYWcgPSAnW29iamVjdCBVaW50OEFycmF5XScsXG4gICAgdWludDhDbGFtcGVkVGFnID0gJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJyxcbiAgICB1aW50MTZUYWcgPSAnW29iamVjdCBVaW50MTZBcnJheV0nLFxuICAgIHVpbnQzMlRhZyA9ICdbb2JqZWN0IFVpbnQzMkFycmF5XSc7XG5cbi8qKiBVc2VkIHRvIGlkZW50aWZ5IGB0b1N0cmluZ1RhZ2AgdmFsdWVzIHN1cHBvcnRlZCBieSBgXy5jbG9uZWAuICovXG52YXIgY2xvbmVhYmxlVGFncyA9IHt9O1xuY2xvbmVhYmxlVGFnc1thcmdzVGFnXSA9IGNsb25lYWJsZVRhZ3NbYXJyYXlUYWddID1cbmNsb25lYWJsZVRhZ3NbYXJyYXlCdWZmZXJUYWddID0gY2xvbmVhYmxlVGFnc1tkYXRhVmlld1RhZ10gPVxuY2xvbmVhYmxlVGFnc1tib29sVGFnXSA9IGNsb25lYWJsZVRhZ3NbZGF0ZVRhZ10gPVxuY2xvbmVhYmxlVGFnc1tmbG9hdDMyVGFnXSA9IGNsb25lYWJsZVRhZ3NbZmxvYXQ2NFRhZ10gPVxuY2xvbmVhYmxlVGFnc1tpbnQ4VGFnXSA9IGNsb25lYWJsZVRhZ3NbaW50MTZUYWddID1cbmNsb25lYWJsZVRhZ3NbaW50MzJUYWddID0gY2xvbmVhYmxlVGFnc1ttYXBUYWddID1cbmNsb25lYWJsZVRhZ3NbbnVtYmVyVGFnXSA9IGNsb25lYWJsZVRhZ3Nbb2JqZWN0VGFnXSA9XG5jbG9uZWFibGVUYWdzW3JlZ2V4cFRhZ10gPSBjbG9uZWFibGVUYWdzW3NldFRhZ10gPVxuY2xvbmVhYmxlVGFnc1tzdHJpbmdUYWddID0gY2xvbmVhYmxlVGFnc1tzeW1ib2xUYWddID1cbmNsb25lYWJsZVRhZ3NbdWludDhUYWddID0gY2xvbmVhYmxlVGFnc1t1aW50OENsYW1wZWRUYWddID1cbmNsb25lYWJsZVRhZ3NbdWludDE2VGFnXSA9IGNsb25lYWJsZVRhZ3NbdWludDMyVGFnXSA9IHRydWU7XG5jbG9uZWFibGVUYWdzW2Vycm9yVGFnXSA9IGNsb25lYWJsZVRhZ3NbZnVuY1RhZ10gPVxuY2xvbmVhYmxlVGFnc1t3ZWFrTWFwVGFnXSA9IGZhbHNlO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmNsb25lYCBhbmQgYF8uY2xvbmVEZWVwYCB3aGljaCB0cmFja3NcbiAqIHRyYXZlcnNlZCBvYmplY3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjbG9uZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gYml0bWFzayBUaGUgYml0bWFzayBmbGFncy5cbiAqICAxIC0gRGVlcCBjbG9uZVxuICogIDIgLSBGbGF0dGVuIGluaGVyaXRlZCBwcm9wZXJ0aWVzXG4gKiAgNCAtIENsb25lIHN5bWJvbHNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjdXN0b21pemVyXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGNsb25pbmcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2tleV0gVGhlIGtleSBvZiBgdmFsdWVgLlxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3RdIFRoZSBwYXJlbnQgb2JqZWN0IG9mIGB2YWx1ZWAuXG4gKiBAcGFyYW0ge09iamVjdH0gW3N0YWNrXSBUcmFja3MgdHJhdmVyc2VkIG9iamVjdHMgYW5kIHRoZWlyIGNsb25lIGNvdW50ZXJwYXJ0cy5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBjbG9uZWQgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGJhc2VDbG9uZSh2YWx1ZSwgYml0bWFzaywgY3VzdG9taXplciwga2V5LCBvYmplY3QsIHN0YWNrKSB7XG4gIHZhciByZXN1bHQsXG4gICAgICBpc0RlZXAgPSBiaXRtYXNrICYgQ0xPTkVfREVFUF9GTEFHLFxuICAgICAgaXNGbGF0ID0gYml0bWFzayAmIENMT05FX0ZMQVRfRkxBRyxcbiAgICAgIGlzRnVsbCA9IGJpdG1hc2sgJiBDTE9ORV9TWU1CT0xTX0ZMQUc7XG5cbiAgaWYgKGN1c3RvbWl6ZXIpIHtcbiAgICByZXN1bHQgPSBvYmplY3QgPyBjdXN0b21pemVyKHZhbHVlLCBrZXksIG9iamVjdCwgc3RhY2spIDogY3VzdG9taXplcih2YWx1ZSk7XG4gIH1cbiAgaWYgKHJlc3VsdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICBpZiAoIWlzT2JqZWN0KHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICB2YXIgaXNBcnIgPSBpc0FycmF5KHZhbHVlKTtcbiAgaWYgKGlzQXJyKSB7XG4gICAgcmVzdWx0ID0gaW5pdENsb25lQXJyYXkodmFsdWUpO1xuICAgIGlmICghaXNEZWVwKSB7XG4gICAgICByZXR1cm4gY29weUFycmF5KHZhbHVlLCByZXN1bHQpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YXIgdGFnID0gZ2V0VGFnKHZhbHVlKSxcbiAgICAgICAgaXNGdW5jID0gdGFnID09IGZ1bmNUYWcgfHwgdGFnID09IGdlblRhZztcblxuICAgIGlmIChpc0J1ZmZlcih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjbG9uZUJ1ZmZlcih2YWx1ZSwgaXNEZWVwKTtcbiAgICB9XG4gICAgaWYgKHRhZyA9PSBvYmplY3RUYWcgfHwgdGFnID09IGFyZ3NUYWcgfHwgKGlzRnVuYyAmJiAhb2JqZWN0KSkge1xuICAgICAgcmVzdWx0ID0gKGlzRmxhdCB8fCBpc0Z1bmMpID8ge30gOiBpbml0Q2xvbmVPYmplY3QodmFsdWUpO1xuICAgICAgaWYgKCFpc0RlZXApIHtcbiAgICAgICAgcmV0dXJuIGlzRmxhdFxuICAgICAgICAgID8gY29weVN5bWJvbHNJbih2YWx1ZSwgYmFzZUFzc2lnbkluKHJlc3VsdCwgdmFsdWUpKVxuICAgICAgICAgIDogY29weVN5bWJvbHModmFsdWUsIGJhc2VBc3NpZ24ocmVzdWx0LCB2YWx1ZSkpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIWNsb25lYWJsZVRhZ3NbdGFnXSkge1xuICAgICAgICByZXR1cm4gb2JqZWN0ID8gdmFsdWUgOiB7fTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdCA9IGluaXRDbG9uZUJ5VGFnKHZhbHVlLCB0YWcsIGlzRGVlcCk7XG4gICAgfVxuICB9XG4gIC8vIENoZWNrIGZvciBjaXJjdWxhciByZWZlcmVuY2VzIGFuZCByZXR1cm4gaXRzIGNvcnJlc3BvbmRpbmcgY2xvbmUuXG4gIHN0YWNrIHx8IChzdGFjayA9IG5ldyBTdGFjayk7XG4gIHZhciBzdGFja2VkID0gc3RhY2suZ2V0KHZhbHVlKTtcbiAgaWYgKHN0YWNrZWQpIHtcbiAgICByZXR1cm4gc3RhY2tlZDtcbiAgfVxuICBzdGFjay5zZXQodmFsdWUsIHJlc3VsdCk7XG5cbiAgaWYgKGlzU2V0KHZhbHVlKSkge1xuICAgIHZhbHVlLmZvckVhY2goZnVuY3Rpb24oc3ViVmFsdWUpIHtcbiAgICAgIHJlc3VsdC5hZGQoYmFzZUNsb25lKHN1YlZhbHVlLCBiaXRtYXNrLCBjdXN0b21pemVyLCBzdWJWYWx1ZSwgdmFsdWUsIHN0YWNrKSk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoaXNNYXAodmFsdWUpKSB7XG4gICAgdmFsdWUuZm9yRWFjaChmdW5jdGlvbihzdWJWYWx1ZSwga2V5KSB7XG4gICAgICByZXN1bHQuc2V0KGtleSwgYmFzZUNsb25lKHN1YlZhbHVlLCBiaXRtYXNrLCBjdXN0b21pemVyLCBrZXksIHZhbHVlLCBzdGFjaykpO1xuICAgIH0pO1xuICB9XG5cbiAgdmFyIGtleXNGdW5jID0gaXNGdWxsXG4gICAgPyAoaXNGbGF0ID8gZ2V0QWxsS2V5c0luIDogZ2V0QWxsS2V5cylcbiAgICA6IChpc0ZsYXQgPyBrZXlzSW4gOiBrZXlzKTtcblxuICB2YXIgcHJvcHMgPSBpc0FyciA/IHVuZGVmaW5lZCA6IGtleXNGdW5jKHZhbHVlKTtcbiAgYXJyYXlFYWNoKHByb3BzIHx8IHZhbHVlLCBmdW5jdGlvbihzdWJWYWx1ZSwga2V5KSB7XG4gICAgaWYgKHByb3BzKSB7XG4gICAgICBrZXkgPSBzdWJWYWx1ZTtcbiAgICAgIHN1YlZhbHVlID0gdmFsdWVba2V5XTtcbiAgICB9XG4gICAgLy8gUmVjdXJzaXZlbHkgcG9wdWxhdGUgY2xvbmUgKHN1c2NlcHRpYmxlIHRvIGNhbGwgc3RhY2sgbGltaXRzKS5cbiAgICBhc3NpZ25WYWx1ZShyZXN1bHQsIGtleSwgYmFzZUNsb25lKHN1YlZhbHVlLCBiaXRtYXNrLCBjdXN0b21pemVyLCBrZXksIHZhbHVlLCBzdGFjaykpO1xuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUNsb25lO1xuIiwKICAgICJpbXBvcnQgYmFzZUNsb25lIGZyb20gJy4vX2Jhc2VDbG9uZS5qcyc7XG5cbi8qKiBVc2VkIHRvIGNvbXBvc2UgYml0bWFza3MgZm9yIGNsb25pbmcuICovXG52YXIgQ0xPTkVfU1lNQk9MU19GTEFHID0gNDtcblxuLyoqXG4gKiBDcmVhdGVzIGEgc2hhbGxvdyBjbG9uZSBvZiBgdmFsdWVgLlxuICpcbiAqICoqTm90ZToqKiBUaGlzIG1ldGhvZCBpcyBsb29zZWx5IGJhc2VkIG9uIHRoZVxuICogW3N0cnVjdHVyZWQgY2xvbmUgYWxnb3JpdGhtXShodHRwczovL21kbi5pby9TdHJ1Y3R1cmVkX2Nsb25lX2FsZ29yaXRobSlcbiAqIGFuZCBzdXBwb3J0cyBjbG9uaW5nIGFycmF5cywgYXJyYXkgYnVmZmVycywgYm9vbGVhbnMsIGRhdGUgb2JqZWN0cywgbWFwcyxcbiAqIG51bWJlcnMsIGBPYmplY3RgIG9iamVjdHMsIHJlZ2V4ZXMsIHNldHMsIHN0cmluZ3MsIHN5bWJvbHMsIGFuZCB0eXBlZFxuICogYXJyYXlzLiBUaGUgb3duIGVudW1lcmFibGUgcHJvcGVydGllcyBvZiBgYXJndW1lbnRzYCBvYmplY3RzIGFyZSBjbG9uZWRcbiAqIGFzIHBsYWluIG9iamVjdHMuIEFuIGVtcHR5IG9iamVjdCBpcyByZXR1cm5lZCBmb3IgdW5jbG9uZWFibGUgdmFsdWVzIHN1Y2hcbiAqIGFzIGVycm9yIG9iamVjdHMsIGZ1bmN0aW9ucywgRE9NIG5vZGVzLCBhbmQgV2Vha01hcHMuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNsb25lLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGNsb25lZCB2YWx1ZS5cbiAqIEBzZWUgXy5jbG9uZURlZXBcbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdHMgPSBbeyAnYSc6IDEgfSwgeyAnYic6IDIgfV07XG4gKlxuICogdmFyIHNoYWxsb3cgPSBfLmNsb25lKG9iamVjdHMpO1xuICogY29uc29sZS5sb2coc2hhbGxvd1swXSA9PT0gb2JqZWN0c1swXSk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGNsb25lKHZhbHVlKSB7XG4gIHJldHVybiBiYXNlQ2xvbmUodmFsdWUsIENMT05FX1NZTUJPTFNfRkxBRyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsb25lO1xuIiwKICAgICJpbXBvcnQgYmFzZUNsb25lIGZyb20gJy4vX2Jhc2VDbG9uZS5qcyc7XG5cbi8qKiBVc2VkIHRvIGNvbXBvc2UgYml0bWFza3MgZm9yIGNsb25pbmcuICovXG52YXIgQ0xPTkVfREVFUF9GTEFHID0gMSxcbiAgICBDTE9ORV9TWU1CT0xTX0ZMQUcgPSA0O1xuXG4vKipcbiAqIFRoaXMgbWV0aG9kIGlzIGxpa2UgYF8uY2xvbmVgIGV4Y2VwdCB0aGF0IGl0IHJlY3Vyc2l2ZWx5IGNsb25lcyBgdmFsdWVgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMS4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byByZWN1cnNpdmVseSBjbG9uZS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBkZWVwIGNsb25lZCB2YWx1ZS5cbiAqIEBzZWUgXy5jbG9uZVxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0cyA9IFt7ICdhJzogMSB9LCB7ICdiJzogMiB9XTtcbiAqXG4gKiB2YXIgZGVlcCA9IF8uY2xvbmVEZWVwKG9iamVjdHMpO1xuICogY29uc29sZS5sb2coZGVlcFswXSA9PT0gb2JqZWN0c1swXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBjbG9uZURlZXAodmFsdWUpIHtcbiAgcmV0dXJuIGJhc2VDbG9uZSh2YWx1ZSwgQ0xPTkVfREVFUF9GTEFHIHwgQ0xPTkVfU1lNQk9MU19GTEFHKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xvbmVEZWVwO1xuIiwKICAgICIvKiogVXNlZCB0byBzdGFuZC1pbiBmb3IgYHVuZGVmaW5lZGAgaGFzaCB2YWx1ZXMuICovXG52YXIgSEFTSF9VTkRFRklORUQgPSAnX19sb2Rhc2hfaGFzaF91bmRlZmluZWRfXyc7XG5cbi8qKlxuICogQWRkcyBgdmFsdWVgIHRvIHRoZSBhcnJheSBjYWNoZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgYWRkXG4gKiBAbWVtYmVyT2YgU2V0Q2FjaGVcbiAqIEBhbGlhcyBwdXNoXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjYWNoZS5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGNhY2hlIGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBzZXRDYWNoZUFkZCh2YWx1ZSkge1xuICB0aGlzLl9fZGF0YV9fLnNldCh2YWx1ZSwgSEFTSF9VTkRFRklORUQpO1xuICByZXR1cm4gdGhpcztcbn1cblxuZXhwb3J0IGRlZmF1bHQgc2V0Q2FjaGVBZGQ7XG4iLAogICAgIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgaW4gdGhlIGFycmF5IGNhY2hlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBoYXNcbiAqIEBtZW1iZXJPZiBTZXRDYWNoZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2VhcmNoIGZvci5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGZvdW5kLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIHNldENhY2hlSGFzKHZhbHVlKSB7XG4gIHJldHVybiB0aGlzLl9fZGF0YV9fLmhhcyh2YWx1ZSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHNldENhY2hlSGFzO1xuIiwKICAgICJpbXBvcnQgTWFwQ2FjaGUgZnJvbSAnLi9fTWFwQ2FjaGUuanMnO1xuaW1wb3J0IHNldENhY2hlQWRkIGZyb20gJy4vX3NldENhY2hlQWRkLmpzJztcbmltcG9ydCBzZXRDYWNoZUhhcyBmcm9tICcuL19zZXRDYWNoZUhhcy5qcyc7XG5cbi8qKlxuICpcbiAqIENyZWF0ZXMgYW4gYXJyYXkgY2FjaGUgb2JqZWN0IHRvIHN0b3JlIHVuaXF1ZSB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtBcnJheX0gW3ZhbHVlc10gVGhlIHZhbHVlcyB0byBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gU2V0Q2FjaGUodmFsdWVzKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gdmFsdWVzID09IG51bGwgPyAwIDogdmFsdWVzLmxlbmd0aDtcblxuICB0aGlzLl9fZGF0YV9fID0gbmV3IE1hcENhY2hlO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHRoaXMuYWRkKHZhbHVlc1tpbmRleF0pO1xuICB9XG59XG5cbi8vIEFkZCBtZXRob2RzIHRvIGBTZXRDYWNoZWAuXG5TZXRDYWNoZS5wcm90b3R5cGUuYWRkID0gU2V0Q2FjaGUucHJvdG90eXBlLnB1c2ggPSBzZXRDYWNoZUFkZDtcblNldENhY2hlLnByb3RvdHlwZS5oYXMgPSBzZXRDYWNoZUhhcztcblxuZXhwb3J0IGRlZmF1bHQgU2V0Q2FjaGU7XG4iLAogICAgIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLnNvbWVgIGZvciBhcnJheXMgd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZVxuICogc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gW2FycmF5XSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcHJlZGljYXRlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW55IGVsZW1lbnQgcGFzc2VzIHRoZSBwcmVkaWNhdGUgY2hlY2ssXG4gKiAgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBhcnJheVNvbWUoYXJyYXksIHByZWRpY2F0ZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGFycmF5ID09IG51bGwgPyAwIDogYXJyYXkubGVuZ3RoO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgaWYgKHByZWRpY2F0ZShhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFycmF5U29tZTtcbiIsCiAgICAiLyoqXG4gKiBDaGVja3MgaWYgYSBgY2FjaGVgIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBjYWNoZSBUaGUgY2FjaGUgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gY2FjaGVIYXMoY2FjaGUsIGtleSkge1xuICByZXR1cm4gY2FjaGUuaGFzKGtleSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNhY2hlSGFzO1xuIiwKICAgICJpbXBvcnQgU2V0Q2FjaGUgZnJvbSAnLi9fU2V0Q2FjaGUuanMnO1xuaW1wb3J0IGFycmF5U29tZSBmcm9tICcuL19hcnJheVNvbWUuanMnO1xuaW1wb3J0IGNhY2hlSGFzIGZyb20gJy4vX2NhY2hlSGFzLmpzJztcblxuLyoqIFVzZWQgdG8gY29tcG9zZSBiaXRtYXNrcyBmb3IgdmFsdWUgY29tcGFyaXNvbnMuICovXG52YXIgQ09NUEFSRV9QQVJUSUFMX0ZMQUcgPSAxLFxuICAgIENPTVBBUkVfVU5PUkRFUkVEX0ZMQUcgPSAyO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZUlzRXF1YWxEZWVwYCBmb3IgYXJyYXlzIHdpdGggc3VwcG9ydCBmb3JcbiAqIHBhcnRpYWwgZGVlcCBjb21wYXJpc29ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0ge0FycmF5fSBvdGhlciBUaGUgb3RoZXIgYXJyYXkgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBiaXRtYXNrIFRoZSBiaXRtYXNrIGZsYWdzLiBTZWUgYGJhc2VJc0VxdWFsYCBmb3IgbW9yZSBkZXRhaWxzLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY3VzdG9taXplciBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGNvbXBhcmlzb25zLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZXF1YWxGdW5jIFRoZSBmdW5jdGlvbiB0byBkZXRlcm1pbmUgZXF1aXZhbGVudHMgb2YgdmFsdWVzLlxuICogQHBhcmFtIHtPYmplY3R9IHN0YWNrIFRyYWNrcyB0cmF2ZXJzZWQgYGFycmF5YCBhbmQgYG90aGVyYCBvYmplY3RzLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBhcnJheXMgYXJlIGVxdWl2YWxlbnQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gZXF1YWxBcnJheXMoYXJyYXksIG90aGVyLCBiaXRtYXNrLCBjdXN0b21pemVyLCBlcXVhbEZ1bmMsIHN0YWNrKSB7XG4gIHZhciBpc1BhcnRpYWwgPSBiaXRtYXNrICYgQ09NUEFSRV9QQVJUSUFMX0ZMQUcsXG4gICAgICBhcnJMZW5ndGggPSBhcnJheS5sZW5ndGgsXG4gICAgICBvdGhMZW5ndGggPSBvdGhlci5sZW5ndGg7XG5cbiAgaWYgKGFyckxlbmd0aCAhPSBvdGhMZW5ndGggJiYgIShpc1BhcnRpYWwgJiYgb3RoTGVuZ3RoID4gYXJyTGVuZ3RoKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBDaGVjayB0aGF0IGN5Y2xpYyB2YWx1ZXMgYXJlIGVxdWFsLlxuICB2YXIgYXJyU3RhY2tlZCA9IHN0YWNrLmdldChhcnJheSk7XG4gIHZhciBvdGhTdGFja2VkID0gc3RhY2suZ2V0KG90aGVyKTtcbiAgaWYgKGFyclN0YWNrZWQgJiYgb3RoU3RhY2tlZCkge1xuICAgIHJldHVybiBhcnJTdGFja2VkID09IG90aGVyICYmIG90aFN0YWNrZWQgPT0gYXJyYXk7XG4gIH1cbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSB0cnVlLFxuICAgICAgc2VlbiA9IChiaXRtYXNrICYgQ09NUEFSRV9VTk9SREVSRURfRkxBRykgPyBuZXcgU2V0Q2FjaGUgOiB1bmRlZmluZWQ7XG5cbiAgc3RhY2suc2V0KGFycmF5LCBvdGhlcik7XG4gIHN0YWNrLnNldChvdGhlciwgYXJyYXkpO1xuXG4gIC8vIElnbm9yZSBub24taW5kZXggcHJvcGVydGllcy5cbiAgd2hpbGUgKCsraW5kZXggPCBhcnJMZW5ndGgpIHtcbiAgICB2YXIgYXJyVmFsdWUgPSBhcnJheVtpbmRleF0sXG4gICAgICAgIG90aFZhbHVlID0gb3RoZXJbaW5kZXhdO1xuXG4gICAgaWYgKGN1c3RvbWl6ZXIpIHtcbiAgICAgIHZhciBjb21wYXJlZCA9IGlzUGFydGlhbFxuICAgICAgICA/IGN1c3RvbWl6ZXIob3RoVmFsdWUsIGFyclZhbHVlLCBpbmRleCwgb3RoZXIsIGFycmF5LCBzdGFjaylcbiAgICAgICAgOiBjdXN0b21pemVyKGFyclZhbHVlLCBvdGhWYWx1ZSwgaW5kZXgsIGFycmF5LCBvdGhlciwgc3RhY2spO1xuICAgIH1cbiAgICBpZiAoY29tcGFyZWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKGNvbXBhcmVkKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgLy8gUmVjdXJzaXZlbHkgY29tcGFyZSBhcnJheXMgKHN1c2NlcHRpYmxlIHRvIGNhbGwgc3RhY2sgbGltaXRzKS5cbiAgICBpZiAoc2Vlbikge1xuICAgICAgaWYgKCFhcnJheVNvbWUob3RoZXIsIGZ1bmN0aW9uKG90aFZhbHVlLCBvdGhJbmRleCkge1xuICAgICAgICAgICAgaWYgKCFjYWNoZUhhcyhzZWVuLCBvdGhJbmRleCkgJiZcbiAgICAgICAgICAgICAgICAoYXJyVmFsdWUgPT09IG90aFZhbHVlIHx8IGVxdWFsRnVuYyhhcnJWYWx1ZSwgb3RoVmFsdWUsIGJpdG1hc2ssIGN1c3RvbWl6ZXIsIHN0YWNrKSkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHNlZW4ucHVzaChvdGhJbmRleCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSkpIHtcbiAgICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIShcbiAgICAgICAgICBhcnJWYWx1ZSA9PT0gb3RoVmFsdWUgfHxcbiAgICAgICAgICAgIGVxdWFsRnVuYyhhcnJWYWx1ZSwgb3RoVmFsdWUsIGJpdG1hc2ssIGN1c3RvbWl6ZXIsIHN0YWNrKVxuICAgICAgICApKSB7XG4gICAgICByZXN1bHQgPSBmYWxzZTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBzdGFja1snZGVsZXRlJ10oYXJyYXkpO1xuICBzdGFja1snZGVsZXRlJ10ob3RoZXIpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBlcXVhbEFycmF5cztcbiIsCiAgICAiLyoqXG4gKiBDb252ZXJ0cyBgbWFwYCB0byBpdHMga2V5LXZhbHVlIHBhaXJzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gbWFwIFRoZSBtYXAgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUga2V5LXZhbHVlIHBhaXJzLlxuICovXG5mdW5jdGlvbiBtYXBUb0FycmF5KG1hcCkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIHJlc3VsdCA9IEFycmF5KG1hcC5zaXplKTtcblxuICBtYXAuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgcmVzdWx0WysraW5kZXhdID0gW2tleSwgdmFsdWVdO1xuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbWFwVG9BcnJheTtcbiIsCiAgICAiLyoqXG4gKiBDb252ZXJ0cyBgc2V0YCB0byBhbiBhcnJheSBvZiBpdHMgdmFsdWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc2V0IFRoZSBzZXQgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgdmFsdWVzLlxuICovXG5mdW5jdGlvbiBzZXRUb0FycmF5KHNldCkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIHJlc3VsdCA9IEFycmF5KHNldC5zaXplKTtcblxuICBzZXQuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJlc3VsdFsrK2luZGV4XSA9IHZhbHVlO1xuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgc2V0VG9BcnJheTtcbiIsCiAgICAiaW1wb3J0IFN5bWJvbCBmcm9tICcuL19TeW1ib2wuanMnO1xuaW1wb3J0IFVpbnQ4QXJyYXkgZnJvbSAnLi9fVWludDhBcnJheS5qcyc7XG5pbXBvcnQgZXEgZnJvbSAnLi9lcS5qcyc7XG5pbXBvcnQgZXF1YWxBcnJheXMgZnJvbSAnLi9fZXF1YWxBcnJheXMuanMnO1xuaW1wb3J0IG1hcFRvQXJyYXkgZnJvbSAnLi9fbWFwVG9BcnJheS5qcyc7XG5pbXBvcnQgc2V0VG9BcnJheSBmcm9tICcuL19zZXRUb0FycmF5LmpzJztcblxuLyoqIFVzZWQgdG8gY29tcG9zZSBiaXRtYXNrcyBmb3IgdmFsdWUgY29tcGFyaXNvbnMuICovXG52YXIgQ09NUEFSRV9QQVJUSUFMX0ZMQUcgPSAxLFxuICAgIENPTVBBUkVfVU5PUkRFUkVEX0ZMQUcgPSAyO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYm9vbFRhZyA9ICdbb2JqZWN0IEJvb2xlYW5dJyxcbiAgICBkYXRlVGFnID0gJ1tvYmplY3QgRGF0ZV0nLFxuICAgIGVycm9yVGFnID0gJ1tvYmplY3QgRXJyb3JdJyxcbiAgICBtYXBUYWcgPSAnW29iamVjdCBNYXBdJyxcbiAgICBudW1iZXJUYWcgPSAnW29iamVjdCBOdW1iZXJdJyxcbiAgICByZWdleHBUYWcgPSAnW29iamVjdCBSZWdFeHBdJyxcbiAgICBzZXRUYWcgPSAnW29iamVjdCBTZXRdJyxcbiAgICBzdHJpbmdUYWcgPSAnW29iamVjdCBTdHJpbmddJyxcbiAgICBzeW1ib2xUYWcgPSAnW29iamVjdCBTeW1ib2xdJztcblxudmFyIGFycmF5QnVmZmVyVGFnID0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJyxcbiAgICBkYXRhVmlld1RhZyA9ICdbb2JqZWN0IERhdGFWaWV3XSc7XG5cbi8qKiBVc2VkIHRvIGNvbnZlcnQgc3ltYm9scyB0byBwcmltaXRpdmVzIGFuZCBzdHJpbmdzLiAqL1xudmFyIHN5bWJvbFByb3RvID0gU3ltYm9sID8gU3ltYm9sLnByb3RvdHlwZSA6IHVuZGVmaW5lZCxcbiAgICBzeW1ib2xWYWx1ZU9mID0gc3ltYm9sUHJvdG8gPyBzeW1ib2xQcm90by52YWx1ZU9mIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZUlzRXF1YWxEZWVwYCBmb3IgY29tcGFyaW5nIG9iamVjdHMgb2ZcbiAqIHRoZSBzYW1lIGB0b1N0cmluZ1RhZ2AuXG4gKlxuICogKipOb3RlOioqIFRoaXMgZnVuY3Rpb24gb25seSBzdXBwb3J0cyBjb21wYXJpbmcgdmFsdWVzIHdpdGggdGFncyBvZlxuICogYEJvb2xlYW5gLCBgRGF0ZWAsIGBFcnJvcmAsIGBOdW1iZXJgLCBgUmVnRXhwYCwgb3IgYFN0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBjb21wYXJlLlxuICogQHBhcmFtIHtPYmplY3R9IG90aGVyIFRoZSBvdGhlciBvYmplY3QgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0YWcgVGhlIGB0b1N0cmluZ1RhZ2Agb2YgdGhlIG9iamVjdHMgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBiaXRtYXNrIFRoZSBiaXRtYXNrIGZsYWdzLiBTZWUgYGJhc2VJc0VxdWFsYCBmb3IgbW9yZSBkZXRhaWxzLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY3VzdG9taXplciBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGNvbXBhcmlzb25zLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZXF1YWxGdW5jIFRoZSBmdW5jdGlvbiB0byBkZXRlcm1pbmUgZXF1aXZhbGVudHMgb2YgdmFsdWVzLlxuICogQHBhcmFtIHtPYmplY3R9IHN0YWNrIFRyYWNrcyB0cmF2ZXJzZWQgYG9iamVjdGAgYW5kIGBvdGhlcmAgb2JqZWN0cy5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgb2JqZWN0cyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBlcXVhbEJ5VGFnKG9iamVjdCwgb3RoZXIsIHRhZywgYml0bWFzaywgY3VzdG9taXplciwgZXF1YWxGdW5jLCBzdGFjaykge1xuICBzd2l0Y2ggKHRhZykge1xuICAgIGNhc2UgZGF0YVZpZXdUYWc6XG4gICAgICBpZiAoKG9iamVjdC5ieXRlTGVuZ3RoICE9IG90aGVyLmJ5dGVMZW5ndGgpIHx8XG4gICAgICAgICAgKG9iamVjdC5ieXRlT2Zmc2V0ICE9IG90aGVyLmJ5dGVPZmZzZXQpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIG9iamVjdCA9IG9iamVjdC5idWZmZXI7XG4gICAgICBvdGhlciA9IG90aGVyLmJ1ZmZlcjtcblxuICAgIGNhc2UgYXJyYXlCdWZmZXJUYWc6XG4gICAgICBpZiAoKG9iamVjdC5ieXRlTGVuZ3RoICE9IG90aGVyLmJ5dGVMZW5ndGgpIHx8XG4gICAgICAgICAgIWVxdWFsRnVuYyhuZXcgVWludDhBcnJheShvYmplY3QpLCBuZXcgVWludDhBcnJheShvdGhlcikpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgY2FzZSBib29sVGFnOlxuICAgIGNhc2UgZGF0ZVRhZzpcbiAgICBjYXNlIG51bWJlclRhZzpcbiAgICAgIC8vIENvZXJjZSBib29sZWFucyB0byBgMWAgb3IgYDBgIGFuZCBkYXRlcyB0byBtaWxsaXNlY29uZHMuXG4gICAgICAvLyBJbnZhbGlkIGRhdGVzIGFyZSBjb2VyY2VkIHRvIGBOYU5gLlxuICAgICAgcmV0dXJuIGVxKCtvYmplY3QsICtvdGhlcik7XG5cbiAgICBjYXNlIGVycm9yVGFnOlxuICAgICAgcmV0dXJuIG9iamVjdC5uYW1lID09IG90aGVyLm5hbWUgJiYgb2JqZWN0Lm1lc3NhZ2UgPT0gb3RoZXIubWVzc2FnZTtcblxuICAgIGNhc2UgcmVnZXhwVGFnOlxuICAgIGNhc2Ugc3RyaW5nVGFnOlxuICAgICAgLy8gQ29lcmNlIHJlZ2V4ZXMgdG8gc3RyaW5ncyBhbmQgdHJlYXQgc3RyaW5ncywgcHJpbWl0aXZlcyBhbmQgb2JqZWN0cyxcbiAgICAgIC8vIGFzIGVxdWFsLiBTZWUgaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXJlZ2V4cC5wcm90b3R5cGUudG9zdHJpbmdcbiAgICAgIC8vIGZvciBtb3JlIGRldGFpbHMuXG4gICAgICByZXR1cm4gb2JqZWN0ID09IChvdGhlciArICcnKTtcblxuICAgIGNhc2UgbWFwVGFnOlxuICAgICAgdmFyIGNvbnZlcnQgPSBtYXBUb0FycmF5O1xuXG4gICAgY2FzZSBzZXRUYWc6XG4gICAgICB2YXIgaXNQYXJ0aWFsID0gYml0bWFzayAmIENPTVBBUkVfUEFSVElBTF9GTEFHO1xuICAgICAgY29udmVydCB8fCAoY29udmVydCA9IHNldFRvQXJyYXkpO1xuXG4gICAgICBpZiAob2JqZWN0LnNpemUgIT0gb3RoZXIuc2l6ZSAmJiAhaXNQYXJ0aWFsKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIC8vIEFzc3VtZSBjeWNsaWMgdmFsdWVzIGFyZSBlcXVhbC5cbiAgICAgIHZhciBzdGFja2VkID0gc3RhY2suZ2V0KG9iamVjdCk7XG4gICAgICBpZiAoc3RhY2tlZCkge1xuICAgICAgICByZXR1cm4gc3RhY2tlZCA9PSBvdGhlcjtcbiAgICAgIH1cbiAgICAgIGJpdG1hc2sgfD0gQ09NUEFSRV9VTk9SREVSRURfRkxBRztcblxuICAgICAgLy8gUmVjdXJzaXZlbHkgY29tcGFyZSBvYmplY3RzIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cykuXG4gICAgICBzdGFjay5zZXQob2JqZWN0LCBvdGhlcik7XG4gICAgICB2YXIgcmVzdWx0ID0gZXF1YWxBcnJheXMoY29udmVydChvYmplY3QpLCBjb252ZXJ0KG90aGVyKSwgYml0bWFzaywgY3VzdG9taXplciwgZXF1YWxGdW5jLCBzdGFjayk7XG4gICAgICBzdGFja1snZGVsZXRlJ10ob2JqZWN0KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG5cbiAgICBjYXNlIHN5bWJvbFRhZzpcbiAgICAgIGlmIChzeW1ib2xWYWx1ZU9mKSB7XG4gICAgICAgIHJldHVybiBzeW1ib2xWYWx1ZU9mLmNhbGwob2JqZWN0KSA9PSBzeW1ib2xWYWx1ZU9mLmNhbGwob3RoZXIpO1xuICAgICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZXF1YWxCeVRhZztcbiIsCiAgICAiaW1wb3J0IGdldEFsbEtleXMgZnJvbSAnLi9fZ2V0QWxsS2V5cy5qcyc7XG5cbi8qKiBVc2VkIHRvIGNvbXBvc2UgYml0bWFza3MgZm9yIHZhbHVlIGNvbXBhcmlzb25zLiAqL1xudmFyIENPTVBBUkVfUEFSVElBTF9GTEFHID0gMTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VJc0VxdWFsRGVlcGAgZm9yIG9iamVjdHMgd2l0aCBzdXBwb3J0IGZvclxuICogcGFydGlhbCBkZWVwIGNvbXBhcmlzb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvdGhlciBUaGUgb3RoZXIgb2JqZWN0IHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0ge251bWJlcn0gYml0bWFzayBUaGUgYml0bWFzayBmbGFncy4gU2VlIGBiYXNlSXNFcXVhbGAgZm9yIG1vcmUgZGV0YWlscy5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGN1c3RvbWl6ZXIgVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjb21wYXJpc29ucy5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGVxdWFsRnVuYyBUaGUgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIGVxdWl2YWxlbnRzIG9mIHZhbHVlcy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBzdGFjayBUcmFja3MgdHJhdmVyc2VkIGBvYmplY3RgIGFuZCBgb3RoZXJgIG9iamVjdHMuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIG9iamVjdHMgYXJlIGVxdWl2YWxlbnQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gZXF1YWxPYmplY3RzKG9iamVjdCwgb3RoZXIsIGJpdG1hc2ssIGN1c3RvbWl6ZXIsIGVxdWFsRnVuYywgc3RhY2spIHtcbiAgdmFyIGlzUGFydGlhbCA9IGJpdG1hc2sgJiBDT01QQVJFX1BBUlRJQUxfRkxBRyxcbiAgICAgIG9ialByb3BzID0gZ2V0QWxsS2V5cyhvYmplY3QpLFxuICAgICAgb2JqTGVuZ3RoID0gb2JqUHJvcHMubGVuZ3RoLFxuICAgICAgb3RoUHJvcHMgPSBnZXRBbGxLZXlzKG90aGVyKSxcbiAgICAgIG90aExlbmd0aCA9IG90aFByb3BzLmxlbmd0aDtcblxuICBpZiAob2JqTGVuZ3RoICE9IG90aExlbmd0aCAmJiAhaXNQYXJ0aWFsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBpbmRleCA9IG9iakxlbmd0aDtcbiAgd2hpbGUgKGluZGV4LS0pIHtcbiAgICB2YXIga2V5ID0gb2JqUHJvcHNbaW5kZXhdO1xuICAgIGlmICghKGlzUGFydGlhbCA/IGtleSBpbiBvdGhlciA6IGhhc093blByb3BlcnR5LmNhbGwob3RoZXIsIGtleSkpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIC8vIENoZWNrIHRoYXQgY3ljbGljIHZhbHVlcyBhcmUgZXF1YWwuXG4gIHZhciBvYmpTdGFja2VkID0gc3RhY2suZ2V0KG9iamVjdCk7XG4gIHZhciBvdGhTdGFja2VkID0gc3RhY2suZ2V0KG90aGVyKTtcbiAgaWYgKG9ialN0YWNrZWQgJiYgb3RoU3RhY2tlZCkge1xuICAgIHJldHVybiBvYmpTdGFja2VkID09IG90aGVyICYmIG90aFN0YWNrZWQgPT0gb2JqZWN0O1xuICB9XG4gIHZhciByZXN1bHQgPSB0cnVlO1xuICBzdGFjay5zZXQob2JqZWN0LCBvdGhlcik7XG4gIHN0YWNrLnNldChvdGhlciwgb2JqZWN0KTtcblxuICB2YXIgc2tpcEN0b3IgPSBpc1BhcnRpYWw7XG4gIHdoaWxlICgrK2luZGV4IDwgb2JqTGVuZ3RoKSB7XG4gICAga2V5ID0gb2JqUHJvcHNbaW5kZXhdO1xuICAgIHZhciBvYmpWYWx1ZSA9IG9iamVjdFtrZXldLFxuICAgICAgICBvdGhWYWx1ZSA9IG90aGVyW2tleV07XG5cbiAgICBpZiAoY3VzdG9taXplcikge1xuICAgICAgdmFyIGNvbXBhcmVkID0gaXNQYXJ0aWFsXG4gICAgICAgID8gY3VzdG9taXplcihvdGhWYWx1ZSwgb2JqVmFsdWUsIGtleSwgb3RoZXIsIG9iamVjdCwgc3RhY2spXG4gICAgICAgIDogY3VzdG9taXplcihvYmpWYWx1ZSwgb3RoVmFsdWUsIGtleSwgb2JqZWN0LCBvdGhlciwgc3RhY2spO1xuICAgIH1cbiAgICAvLyBSZWN1cnNpdmVseSBjb21wYXJlIG9iamVjdHMgKHN1c2NlcHRpYmxlIHRvIGNhbGwgc3RhY2sgbGltaXRzKS5cbiAgICBpZiAoIShjb21wYXJlZCA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgPyAob2JqVmFsdWUgPT09IG90aFZhbHVlIHx8IGVxdWFsRnVuYyhvYmpWYWx1ZSwgb3RoVmFsdWUsIGJpdG1hc2ssIGN1c3RvbWl6ZXIsIHN0YWNrKSlcbiAgICAgICAgICA6IGNvbXBhcmVkXG4gICAgICAgICkpIHtcbiAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHNraXBDdG9yIHx8IChza2lwQ3RvciA9IGtleSA9PSAnY29uc3RydWN0b3InKTtcbiAgfVxuICBpZiAocmVzdWx0ICYmICFza2lwQ3Rvcikge1xuICAgIHZhciBvYmpDdG9yID0gb2JqZWN0LmNvbnN0cnVjdG9yLFxuICAgICAgICBvdGhDdG9yID0gb3RoZXIuY29uc3RydWN0b3I7XG5cbiAgICAvLyBOb24gYE9iamVjdGAgb2JqZWN0IGluc3RhbmNlcyB3aXRoIGRpZmZlcmVudCBjb25zdHJ1Y3RvcnMgYXJlIG5vdCBlcXVhbC5cbiAgICBpZiAob2JqQ3RvciAhPSBvdGhDdG9yICYmXG4gICAgICAgICgnY29uc3RydWN0b3InIGluIG9iamVjdCAmJiAnY29uc3RydWN0b3InIGluIG90aGVyKSAmJlxuICAgICAgICAhKHR5cGVvZiBvYmpDdG9yID09ICdmdW5jdGlvbicgJiYgb2JqQ3RvciBpbnN0YW5jZW9mIG9iakN0b3IgJiZcbiAgICAgICAgICB0eXBlb2Ygb3RoQ3RvciA9PSAnZnVuY3Rpb24nICYmIG90aEN0b3IgaW5zdGFuY2VvZiBvdGhDdG9yKSkge1xuICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgfVxuICB9XG4gIHN0YWNrWydkZWxldGUnXShvYmplY3QpO1xuICBzdGFja1snZGVsZXRlJ10ob3RoZXIpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBlcXVhbE9iamVjdHM7XG4iLAogICAgImltcG9ydCBTdGFjayBmcm9tICcuL19TdGFjay5qcyc7XG5pbXBvcnQgZXF1YWxBcnJheXMgZnJvbSAnLi9fZXF1YWxBcnJheXMuanMnO1xuaW1wb3J0IGVxdWFsQnlUYWcgZnJvbSAnLi9fZXF1YWxCeVRhZy5qcyc7XG5pbXBvcnQgZXF1YWxPYmplY3RzIGZyb20gJy4vX2VxdWFsT2JqZWN0cy5qcyc7XG5pbXBvcnQgZ2V0VGFnIGZyb20gJy4vX2dldFRhZy5qcyc7XG5pbXBvcnQgaXNBcnJheSBmcm9tICcuL2lzQXJyYXkuanMnO1xuaW1wb3J0IGlzQnVmZmVyIGZyb20gJy4vaXNCdWZmZXIuanMnO1xuaW1wb3J0IGlzVHlwZWRBcnJheSBmcm9tICcuL2lzVHlwZWRBcnJheS5qcyc7XG5cbi8qKiBVc2VkIHRvIGNvbXBvc2UgYml0bWFza3MgZm9yIHZhbHVlIGNvbXBhcmlzb25zLiAqL1xudmFyIENPTVBBUkVfUEFSVElBTF9GTEFHID0gMTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFyZ3NUYWcgPSAnW29iamVjdCBBcmd1bWVudHNdJyxcbiAgICBhcnJheVRhZyA9ICdbb2JqZWN0IEFycmF5XScsXG4gICAgb2JqZWN0VGFnID0gJ1tvYmplY3QgT2JqZWN0XSc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlSXNFcXVhbGAgZm9yIGFycmF5cyBhbmQgb2JqZWN0cyB3aGljaCBwZXJmb3Jtc1xuICogZGVlcCBjb21wYXJpc29ucyBhbmQgdHJhY2tzIHRyYXZlcnNlZCBvYmplY3RzIGVuYWJsaW5nIG9iamVjdHMgd2l0aCBjaXJjdWxhclxuICogcmVmZXJlbmNlcyB0byBiZSBjb21wYXJlZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0ge09iamVjdH0gb3RoZXIgVGhlIG90aGVyIG9iamVjdCB0byBjb21wYXJlLlxuICogQHBhcmFtIHtudW1iZXJ9IGJpdG1hc2sgVGhlIGJpdG1hc2sgZmxhZ3MuIFNlZSBgYmFzZUlzRXF1YWxgIGZvciBtb3JlIGRldGFpbHMuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjdXN0b21pemVyIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29tcGFyaXNvbnMuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBlcXVhbEZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGRldGVybWluZSBlcXVpdmFsZW50cyBvZiB2YWx1ZXMuXG4gKiBAcGFyYW0ge09iamVjdH0gW3N0YWNrXSBUcmFja3MgdHJhdmVyc2VkIGBvYmplY3RgIGFuZCBgb3RoZXJgIG9iamVjdHMuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIG9iamVjdHMgYXJlIGVxdWl2YWxlbnQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUlzRXF1YWxEZWVwKG9iamVjdCwgb3RoZXIsIGJpdG1hc2ssIGN1c3RvbWl6ZXIsIGVxdWFsRnVuYywgc3RhY2spIHtcbiAgdmFyIG9iaklzQXJyID0gaXNBcnJheShvYmplY3QpLFxuICAgICAgb3RoSXNBcnIgPSBpc0FycmF5KG90aGVyKSxcbiAgICAgIG9ialRhZyA9IG9iaklzQXJyID8gYXJyYXlUYWcgOiBnZXRUYWcob2JqZWN0KSxcbiAgICAgIG90aFRhZyA9IG90aElzQXJyID8gYXJyYXlUYWcgOiBnZXRUYWcob3RoZXIpO1xuXG4gIG9ialRhZyA9IG9ialRhZyA9PSBhcmdzVGFnID8gb2JqZWN0VGFnIDogb2JqVGFnO1xuICBvdGhUYWcgPSBvdGhUYWcgPT0gYXJnc1RhZyA/IG9iamVjdFRhZyA6IG90aFRhZztcblxuICB2YXIgb2JqSXNPYmogPSBvYmpUYWcgPT0gb2JqZWN0VGFnLFxuICAgICAgb3RoSXNPYmogPSBvdGhUYWcgPT0gb2JqZWN0VGFnLFxuICAgICAgaXNTYW1lVGFnID0gb2JqVGFnID09IG90aFRhZztcblxuICBpZiAoaXNTYW1lVGFnICYmIGlzQnVmZmVyKG9iamVjdCkpIHtcbiAgICBpZiAoIWlzQnVmZmVyKG90aGVyKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBvYmpJc0FyciA9IHRydWU7XG4gICAgb2JqSXNPYmogPSBmYWxzZTtcbiAgfVxuICBpZiAoaXNTYW1lVGFnICYmICFvYmpJc09iaikge1xuICAgIHN0YWNrIHx8IChzdGFjayA9IG5ldyBTdGFjayk7XG4gICAgcmV0dXJuIChvYmpJc0FyciB8fCBpc1R5cGVkQXJyYXkob2JqZWN0KSlcbiAgICAgID8gZXF1YWxBcnJheXMob2JqZWN0LCBvdGhlciwgYml0bWFzaywgY3VzdG9taXplciwgZXF1YWxGdW5jLCBzdGFjaylcbiAgICAgIDogZXF1YWxCeVRhZyhvYmplY3QsIG90aGVyLCBvYmpUYWcsIGJpdG1hc2ssIGN1c3RvbWl6ZXIsIGVxdWFsRnVuYywgc3RhY2spO1xuICB9XG4gIGlmICghKGJpdG1hc2sgJiBDT01QQVJFX1BBUlRJQUxfRkxBRykpIHtcbiAgICB2YXIgb2JqSXNXcmFwcGVkID0gb2JqSXNPYmogJiYgaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsICdfX3dyYXBwZWRfXycpLFxuICAgICAgICBvdGhJc1dyYXBwZWQgPSBvdGhJc09iaiAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKG90aGVyLCAnX193cmFwcGVkX18nKTtcblxuICAgIGlmIChvYmpJc1dyYXBwZWQgfHwgb3RoSXNXcmFwcGVkKSB7XG4gICAgICB2YXIgb2JqVW53cmFwcGVkID0gb2JqSXNXcmFwcGVkID8gb2JqZWN0LnZhbHVlKCkgOiBvYmplY3QsXG4gICAgICAgICAgb3RoVW53cmFwcGVkID0gb3RoSXNXcmFwcGVkID8gb3RoZXIudmFsdWUoKSA6IG90aGVyO1xuXG4gICAgICBzdGFjayB8fCAoc3RhY2sgPSBuZXcgU3RhY2spO1xuICAgICAgcmV0dXJuIGVxdWFsRnVuYyhvYmpVbndyYXBwZWQsIG90aFVud3JhcHBlZCwgYml0bWFzaywgY3VzdG9taXplciwgc3RhY2spO1xuICAgIH1cbiAgfVxuICBpZiAoIWlzU2FtZVRhZykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBzdGFjayB8fCAoc3RhY2sgPSBuZXcgU3RhY2spO1xuICByZXR1cm4gZXF1YWxPYmplY3RzKG9iamVjdCwgb3RoZXIsIGJpdG1hc2ssIGN1c3RvbWl6ZXIsIGVxdWFsRnVuYywgc3RhY2spO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlSXNFcXVhbERlZXA7XG4iLAogICAgImltcG9ydCBiYXNlSXNFcXVhbERlZXAgZnJvbSAnLi9fYmFzZUlzRXF1YWxEZWVwLmpzJztcbmltcG9ydCBpc09iamVjdExpa2UgZnJvbSAnLi9pc09iamVjdExpa2UuanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzRXF1YWxgIHdoaWNoIHN1cHBvcnRzIHBhcnRpYWwgY29tcGFyaXNvbnNcbiAqIGFuZCB0cmFja3MgdHJhdmVyc2VkIG9iamVjdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0geyp9IG90aGVyIFRoZSBvdGhlciB2YWx1ZSB0byBjb21wYXJlLlxuICogQHBhcmFtIHtib29sZWFufSBiaXRtYXNrIFRoZSBiaXRtYXNrIGZsYWdzLlxuICogIDEgLSBVbm9yZGVyZWQgY29tcGFyaXNvblxuICogIDIgLSBQYXJ0aWFsIGNvbXBhcmlzb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjdXN0b21pemVyXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGNvbXBhcmlzb25zLlxuICogQHBhcmFtIHtPYmplY3R9IFtzdGFja10gVHJhY2tzIHRyYXZlcnNlZCBgdmFsdWVgIGFuZCBgb3RoZXJgIG9iamVjdHMuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNFcXVhbCh2YWx1ZSwgb3RoZXIsIGJpdG1hc2ssIGN1c3RvbWl6ZXIsIHN0YWNrKSB7XG4gIGlmICh2YWx1ZSA9PT0gb3RoZXIpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAodmFsdWUgPT0gbnVsbCB8fCBvdGhlciA9PSBudWxsIHx8ICghaXNPYmplY3RMaWtlKHZhbHVlKSAmJiAhaXNPYmplY3RMaWtlKG90aGVyKSkpIHtcbiAgICByZXR1cm4gdmFsdWUgIT09IHZhbHVlICYmIG90aGVyICE9PSBvdGhlcjtcbiAgfVxuICByZXR1cm4gYmFzZUlzRXF1YWxEZWVwKHZhbHVlLCBvdGhlciwgYml0bWFzaywgY3VzdG9taXplciwgYmFzZUlzRXF1YWwsIHN0YWNrKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUlzRXF1YWw7XG4iLAogICAgImltcG9ydCBTdGFjayBmcm9tICcuL19TdGFjay5qcyc7XG5pbXBvcnQgYmFzZUlzRXF1YWwgZnJvbSAnLi9fYmFzZUlzRXF1YWwuanMnO1xuXG4vKiogVXNlZCB0byBjb21wb3NlIGJpdG1hc2tzIGZvciB2YWx1ZSBjb21wYXJpc29ucy4gKi9cbnZhciBDT01QQVJFX1BBUlRJQUxfRkxBRyA9IDEsXG4gICAgQ09NUEFSRV9VTk9SREVSRURfRkxBRyA9IDI7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNNYXRjaGAgd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaW5zcGVjdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIG9iamVjdCBvZiBwcm9wZXJ0eSB2YWx1ZXMgdG8gbWF0Y2guXG4gKiBAcGFyYW0ge0FycmF5fSBtYXRjaERhdGEgVGhlIHByb3BlcnR5IG5hbWVzLCB2YWx1ZXMsIGFuZCBjb21wYXJlIGZsYWdzIHRvIG1hdGNoLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29tcGFyaXNvbnMuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYG9iamVjdGAgaXMgYSBtYXRjaCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNNYXRjaChvYmplY3QsIHNvdXJjZSwgbWF0Y2hEYXRhLCBjdXN0b21pemVyKSB7XG4gIHZhciBpbmRleCA9IG1hdGNoRGF0YS5sZW5ndGgsXG4gICAgICBsZW5ndGggPSBpbmRleCxcbiAgICAgIG5vQ3VzdG9taXplciA9ICFjdXN0b21pemVyO1xuXG4gIGlmIChvYmplY3QgPT0gbnVsbCkge1xuICAgIHJldHVybiAhbGVuZ3RoO1xuICB9XG4gIG9iamVjdCA9IE9iamVjdChvYmplY3QpO1xuICB3aGlsZSAoaW5kZXgtLSkge1xuICAgIHZhciBkYXRhID0gbWF0Y2hEYXRhW2luZGV4XTtcbiAgICBpZiAoKG5vQ3VzdG9taXplciAmJiBkYXRhWzJdKVxuICAgICAgICAgID8gZGF0YVsxXSAhPT0gb2JqZWN0W2RhdGFbMF1dXG4gICAgICAgICAgOiAhKGRhdGFbMF0gaW4gb2JqZWN0KVxuICAgICAgICApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBkYXRhID0gbWF0Y2hEYXRhW2luZGV4XTtcbiAgICB2YXIga2V5ID0gZGF0YVswXSxcbiAgICAgICAgb2JqVmFsdWUgPSBvYmplY3Rba2V5XSxcbiAgICAgICAgc3JjVmFsdWUgPSBkYXRhWzFdO1xuXG4gICAgaWYgKG5vQ3VzdG9taXplciAmJiBkYXRhWzJdKSB7XG4gICAgICBpZiAob2JqVmFsdWUgPT09IHVuZGVmaW5lZCAmJiAhKGtleSBpbiBvYmplY3QpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHN0YWNrID0gbmV3IFN0YWNrO1xuICAgICAgaWYgKGN1c3RvbWl6ZXIpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGN1c3RvbWl6ZXIob2JqVmFsdWUsIHNyY1ZhbHVlLCBrZXksIG9iamVjdCwgc291cmNlLCBzdGFjayk7XG4gICAgICB9XG4gICAgICBpZiAoIShyZXN1bHQgPT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgPyBiYXNlSXNFcXVhbChzcmNWYWx1ZSwgb2JqVmFsdWUsIENPTVBBUkVfUEFSVElBTF9GTEFHIHwgQ09NUEFSRV9VTk9SREVSRURfRkxBRywgY3VzdG9taXplciwgc3RhY2spXG4gICAgICAgICAgICA6IHJlc3VsdFxuICAgICAgICAgICkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUlzTWF0Y2g7XG4iLAogICAgImltcG9ydCBpc09iamVjdCBmcm9tICcuL2lzT2JqZWN0LmpzJztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBzdWl0YWJsZSBmb3Igc3RyaWN0IGVxdWFsaXR5IGNvbXBhcmlzb25zLCBpLmUuIGA9PT1gLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlmIHN1aXRhYmxlIGZvciBzdHJpY3RcbiAqICBlcXVhbGl0eSBjb21wYXJpc29ucywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc1N0cmljdENvbXBhcmFibGUodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09PSB2YWx1ZSAmJiAhaXNPYmplY3QodmFsdWUpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc1N0cmljdENvbXBhcmFibGU7XG4iLAogICAgImltcG9ydCBpc1N0cmljdENvbXBhcmFibGUgZnJvbSAnLi9faXNTdHJpY3RDb21wYXJhYmxlLmpzJztcbmltcG9ydCBrZXlzIGZyb20gJy4va2V5cy5qcyc7XG5cbi8qKlxuICogR2V0cyB0aGUgcHJvcGVydHkgbmFtZXMsIHZhbHVlcywgYW5kIGNvbXBhcmUgZmxhZ3Mgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbWF0Y2ggZGF0YSBvZiBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gZ2V0TWF0Y2hEYXRhKG9iamVjdCkge1xuICB2YXIgcmVzdWx0ID0ga2V5cyhvYmplY3QpLFxuICAgICAgbGVuZ3RoID0gcmVzdWx0Lmxlbmd0aDtcblxuICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICB2YXIga2V5ID0gcmVzdWx0W2xlbmd0aF0sXG4gICAgICAgIHZhbHVlID0gb2JqZWN0W2tleV07XG5cbiAgICByZXN1bHRbbGVuZ3RoXSA9IFtrZXksIHZhbHVlLCBpc1N0cmljdENvbXBhcmFibGUodmFsdWUpXTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBnZXRNYXRjaERhdGE7XG4iLAogICAgIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBtYXRjaGVzUHJvcGVydHlgIGZvciBzb3VyY2UgdmFsdWVzIHN1aXRhYmxlXG4gKiBmb3Igc3RyaWN0IGVxdWFsaXR5IGNvbXBhcmlzb25zLCBpLmUuIGA9PT1gLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cbiAqIEBwYXJhbSB7Kn0gc3JjVmFsdWUgVGhlIHZhbHVlIHRvIG1hdGNoLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgc3BlYyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gbWF0Y2hlc1N0cmljdENvbXBhcmFibGUoa2V5LCBzcmNWYWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgaWYgKG9iamVjdCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3Rba2V5XSA9PT0gc3JjVmFsdWUgJiZcbiAgICAgIChzcmNWYWx1ZSAhPT0gdW5kZWZpbmVkIHx8IChrZXkgaW4gT2JqZWN0KG9iamVjdCkpKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbWF0Y2hlc1N0cmljdENvbXBhcmFibGU7XG4iLAogICAgImltcG9ydCBiYXNlSXNNYXRjaCBmcm9tICcuL19iYXNlSXNNYXRjaC5qcyc7XG5pbXBvcnQgZ2V0TWF0Y2hEYXRhIGZyb20gJy4vX2dldE1hdGNoRGF0YS5qcyc7XG5pbXBvcnQgbWF0Y2hlc1N0cmljdENvbXBhcmFibGUgZnJvbSAnLi9fbWF0Y2hlc1N0cmljdENvbXBhcmFibGUuanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLm1hdGNoZXNgIHdoaWNoIGRvZXNuJ3QgY2xvbmUgYHNvdXJjZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIG9iamVjdCBvZiBwcm9wZXJ0eSB2YWx1ZXMgdG8gbWF0Y2guXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBzcGVjIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlTWF0Y2hlcyhzb3VyY2UpIHtcbiAgdmFyIG1hdGNoRGF0YSA9IGdldE1hdGNoRGF0YShzb3VyY2UpO1xuICBpZiAobWF0Y2hEYXRhLmxlbmd0aCA9PSAxICYmIG1hdGNoRGF0YVswXVsyXSkge1xuICAgIHJldHVybiBtYXRjaGVzU3RyaWN0Q29tcGFyYWJsZShtYXRjaERhdGFbMF1bMF0sIG1hdGNoRGF0YVswXVsxXSk7XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHJldHVybiBvYmplY3QgPT09IHNvdXJjZSB8fCBiYXNlSXNNYXRjaChvYmplY3QsIHNvdXJjZSwgbWF0Y2hEYXRhKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZU1hdGNoZXM7XG4iLAogICAgIi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaGFzSW5gIHdpdGhvdXQgc3VwcG9ydCBmb3IgZGVlcCBwYXRocy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3RdIFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge0FycmF5fHN0cmluZ30ga2V5IFRoZSBrZXkgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYGtleWAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VIYXNJbihvYmplY3QsIGtleSkge1xuICByZXR1cm4gb2JqZWN0ICE9IG51bGwgJiYga2V5IGluIE9iamVjdChvYmplY3QpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlSGFzSW47XG4iLAogICAgImltcG9ydCBjYXN0UGF0aCBmcm9tICcuL19jYXN0UGF0aC5qcyc7XG5pbXBvcnQgaXNBcmd1bWVudHMgZnJvbSAnLi9pc0FyZ3VtZW50cy5qcyc7XG5pbXBvcnQgaXNBcnJheSBmcm9tICcuL2lzQXJyYXkuanMnO1xuaW1wb3J0IGlzSW5kZXggZnJvbSAnLi9faXNJbmRleC5qcyc7XG5pbXBvcnQgaXNMZW5ndGggZnJvbSAnLi9pc0xlbmd0aC5qcyc7XG5pbXBvcnQgdG9LZXkgZnJvbSAnLi9fdG9LZXkuanMnO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgcGF0aGAgZXhpc3RzIG9uIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge0FycmF5fHN0cmluZ30gcGF0aCBUaGUgcGF0aCB0byBjaGVjay5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGhhc0Z1bmMgVGhlIGZ1bmN0aW9uIHRvIGNoZWNrIHByb3BlcnRpZXMuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHBhdGhgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBoYXNQYXRoKG9iamVjdCwgcGF0aCwgaGFzRnVuYykge1xuICBwYXRoID0gY2FzdFBhdGgocGF0aCwgb2JqZWN0KTtcblxuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IHBhdGgubGVuZ3RoLFxuICAgICAgcmVzdWx0ID0gZmFsc2U7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIga2V5ID0gdG9LZXkocGF0aFtpbmRleF0pO1xuICAgIGlmICghKHJlc3VsdCA9IG9iamVjdCAhPSBudWxsICYmIGhhc0Z1bmMob2JqZWN0LCBrZXkpKSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIG9iamVjdCA9IG9iamVjdFtrZXldO1xuICB9XG4gIGlmIChyZXN1bHQgfHwgKytpbmRleCAhPSBsZW5ndGgpIHtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIGxlbmd0aCA9IG9iamVjdCA9PSBudWxsID8gMCA6IG9iamVjdC5sZW5ndGg7XG4gIHJldHVybiAhIWxlbmd0aCAmJiBpc0xlbmd0aChsZW5ndGgpICYmIGlzSW5kZXgoa2V5LCBsZW5ndGgpICYmXG4gICAgKGlzQXJyYXkob2JqZWN0KSB8fCBpc0FyZ3VtZW50cyhvYmplY3QpKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaGFzUGF0aDtcbiIsCiAgICAiaW1wb3J0IGJhc2VIYXNJbiBmcm9tICcuL19iYXNlSGFzSW4uanMnO1xuaW1wb3J0IGhhc1BhdGggZnJvbSAnLi9faGFzUGF0aC5qcyc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGBwYXRoYCBpcyBhIGRpcmVjdCBvciBpbmhlcml0ZWQgcHJvcGVydHkgb2YgYG9iamVjdGAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtBcnJheXxzdHJpbmd9IHBhdGggVGhlIHBhdGggdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHBhdGhgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0gXy5jcmVhdGUoeyAnYSc6IF8uY3JlYXRlKHsgJ2InOiAyIH0pIH0pO1xuICpcbiAqIF8uaGFzSW4ob2JqZWN0LCAnYScpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaGFzSW4ob2JqZWN0LCAnYS5iJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5oYXNJbihvYmplY3QsIFsnYScsICdiJ10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaGFzSW4ob2JqZWN0LCAnYicpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaGFzSW4ob2JqZWN0LCBwYXRoKSB7XG4gIHJldHVybiBvYmplY3QgIT0gbnVsbCAmJiBoYXNQYXRoKG9iamVjdCwgcGF0aCwgYmFzZUhhc0luKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaGFzSW47XG4iLAogICAgImltcG9ydCBiYXNlSXNFcXVhbCBmcm9tICcuL19iYXNlSXNFcXVhbC5qcyc7XG5pbXBvcnQgZ2V0IGZyb20gJy4vZ2V0LmpzJztcbmltcG9ydCBoYXNJbiBmcm9tICcuL2hhc0luLmpzJztcbmltcG9ydCBpc0tleSBmcm9tICcuL19pc0tleS5qcyc7XG5pbXBvcnQgaXNTdHJpY3RDb21wYXJhYmxlIGZyb20gJy4vX2lzU3RyaWN0Q29tcGFyYWJsZS5qcyc7XG5pbXBvcnQgbWF0Y2hlc1N0cmljdENvbXBhcmFibGUgZnJvbSAnLi9fbWF0Y2hlc1N0cmljdENvbXBhcmFibGUuanMnO1xuaW1wb3J0IHRvS2V5IGZyb20gJy4vX3RvS2V5LmpzJztcblxuLyoqIFVzZWQgdG8gY29tcG9zZSBiaXRtYXNrcyBmb3IgdmFsdWUgY29tcGFyaXNvbnMuICovXG52YXIgQ09NUEFSRV9QQVJUSUFMX0ZMQUcgPSAxLFxuICAgIENPTVBBUkVfVU5PUkRFUkVEX0ZMQUcgPSAyO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLm1hdGNoZXNQcm9wZXJ0eWAgd2hpY2ggZG9lc24ndCBjbG9uZSBgc3JjVmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aCBUaGUgcGF0aCBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHBhcmFtIHsqfSBzcmNWYWx1ZSBUaGUgdmFsdWUgdG8gbWF0Y2guXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBzcGVjIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlTWF0Y2hlc1Byb3BlcnR5KHBhdGgsIHNyY1ZhbHVlKSB7XG4gIGlmIChpc0tleShwYXRoKSAmJiBpc1N0cmljdENvbXBhcmFibGUoc3JjVmFsdWUpKSB7XG4gICAgcmV0dXJuIG1hdGNoZXNTdHJpY3RDb21wYXJhYmxlKHRvS2V5KHBhdGgpLCBzcmNWYWx1ZSk7XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHZhciBvYmpWYWx1ZSA9IGdldChvYmplY3QsIHBhdGgpO1xuICAgIHJldHVybiAob2JqVmFsdWUgPT09IHVuZGVmaW5lZCAmJiBvYmpWYWx1ZSA9PT0gc3JjVmFsdWUpXG4gICAgICA/IGhhc0luKG9iamVjdCwgcGF0aClcbiAgICAgIDogYmFzZUlzRXF1YWwoc3JjVmFsdWUsIG9ialZhbHVlLCBDT01QQVJFX1BBUlRJQUxfRkxBRyB8IENPTVBBUkVfVU5PUkRFUkVEX0ZMQUcpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlTWF0Y2hlc1Byb3BlcnR5O1xuIiwKICAgICIvKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnByb3BlcnR5YCB3aXRob3V0IHN1cHBvcnQgZm9yIGRlZXAgcGF0aHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYWNjZXNzb3IgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VQcm9wZXJ0eShrZXkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHJldHVybiBvYmplY3QgPT0gbnVsbCA/IHVuZGVmaW5lZCA6IG9iamVjdFtrZXldO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlUHJvcGVydHk7XG4iLAogICAgImltcG9ydCBiYXNlR2V0IGZyb20gJy4vX2Jhc2VHZXQuanMnO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZVByb3BlcnR5YCB3aGljaCBzdXBwb3J0cyBkZWVwIHBhdGhzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fHN0cmluZ30gcGF0aCBUaGUgcGF0aCBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYWNjZXNzb3IgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VQcm9wZXJ0eURlZXAocGF0aCkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgcmV0dXJuIGJhc2VHZXQob2JqZWN0LCBwYXRoKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZVByb3BlcnR5RGVlcDtcbiIsCiAgICAiaW1wb3J0IGJhc2VQcm9wZXJ0eSBmcm9tICcuL19iYXNlUHJvcGVydHkuanMnO1xuaW1wb3J0IGJhc2VQcm9wZXJ0eURlZXAgZnJvbSAnLi9fYmFzZVByb3BlcnR5RGVlcC5qcyc7XG5pbXBvcnQgaXNLZXkgZnJvbSAnLi9faXNLZXkuanMnO1xuaW1wb3J0IHRvS2V5IGZyb20gJy4vX3RvS2V5LmpzJztcblxuLyoqXG4gKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSB2YWx1ZSBhdCBgcGF0aGAgb2YgYSBnaXZlbiBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAyLjQuMFxuICogQGNhdGVnb3J5IFV0aWxcbiAqIEBwYXJhbSB7QXJyYXl8c3RyaW5nfSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBhY2Nlc3NvciBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdHMgPSBbXG4gKiAgIHsgJ2EnOiB7ICdiJzogMiB9IH0sXG4gKiAgIHsgJ2EnOiB7ICdiJzogMSB9IH1cbiAqIF07XG4gKlxuICogXy5tYXAob2JqZWN0cywgXy5wcm9wZXJ0eSgnYS5iJykpO1xuICogLy8gPT4gWzIsIDFdXG4gKlxuICogXy5tYXAoXy5zb3J0Qnkob2JqZWN0cywgXy5wcm9wZXJ0eShbJ2EnLCAnYiddKSksICdhLmInKTtcbiAqIC8vID0+IFsxLCAyXVxuICovXG5mdW5jdGlvbiBwcm9wZXJ0eShwYXRoKSB7XG4gIHJldHVybiBpc0tleShwYXRoKSA/IGJhc2VQcm9wZXJ0eSh0b0tleShwYXRoKSkgOiBiYXNlUHJvcGVydHlEZWVwKHBhdGgpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBwcm9wZXJ0eTtcbiIsCiAgICAiaW1wb3J0IGJhc2VNYXRjaGVzIGZyb20gJy4vX2Jhc2VNYXRjaGVzLmpzJztcbmltcG9ydCBiYXNlTWF0Y2hlc1Byb3BlcnR5IGZyb20gJy4vX2Jhc2VNYXRjaGVzUHJvcGVydHkuanMnO1xuaW1wb3J0IGlkZW50aXR5IGZyb20gJy4vaWRlbnRpdHkuanMnO1xuaW1wb3J0IGlzQXJyYXkgZnJvbSAnLi9pc0FycmF5LmpzJztcbmltcG9ydCBwcm9wZXJ0eSBmcm9tICcuL3Byb3BlcnR5LmpzJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pdGVyYXRlZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gW3ZhbHVlPV8uaWRlbnRpdHldIFRoZSB2YWx1ZSB0byBjb252ZXJ0IHRvIGFuIGl0ZXJhdGVlLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBpdGVyYXRlZS5cbiAqL1xuZnVuY3Rpb24gYmFzZUl0ZXJhdGVlKHZhbHVlKSB7XG4gIC8vIERvbid0IHN0b3JlIHRoZSBgdHlwZW9mYCByZXN1bHQgaW4gYSB2YXJpYWJsZSB0byBhdm9pZCBhIEpJVCBidWcgaW4gU2FmYXJpIDkuXG4gIC8vIFNlZSBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTU2MDM0IGZvciBtb3JlIGRldGFpbHMuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIHJldHVybiBpZGVudGl0eTtcbiAgfVxuICBpZiAodHlwZW9mIHZhbHVlID09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIGlzQXJyYXkodmFsdWUpXG4gICAgICA/IGJhc2VNYXRjaGVzUHJvcGVydHkodmFsdWVbMF0sIHZhbHVlWzFdKVxuICAgICAgOiBiYXNlTWF0Y2hlcyh2YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHByb3BlcnR5KHZhbHVlKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUl0ZXJhdGVlO1xuIiwKICAgICIvKipcbiAqIENyZWF0ZXMgYSBiYXNlIGZ1bmN0aW9uIGZvciBtZXRob2RzIGxpa2UgYF8uZm9ySW5gIGFuZCBgXy5mb3JPd25gLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtmcm9tUmlnaHRdIFNwZWNpZnkgaXRlcmF0aW5nIGZyb20gcmlnaHQgdG8gbGVmdC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGJhc2UgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUJhc2VGb3IoZnJvbVJpZ2h0KSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmplY3QsIGl0ZXJhdGVlLCBrZXlzRnVuYykge1xuICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICBpdGVyYWJsZSA9IE9iamVjdChvYmplY3QpLFxuICAgICAgICBwcm9wcyA9IGtleXNGdW5jKG9iamVjdCksXG4gICAgICAgIGxlbmd0aCA9IHByb3BzLmxlbmd0aDtcblxuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgdmFyIGtleSA9IHByb3BzW2Zyb21SaWdodCA/IGxlbmd0aCA6ICsraW5kZXhdO1xuICAgICAgaWYgKGl0ZXJhdGVlKGl0ZXJhYmxlW2tleV0sIGtleSwgaXRlcmFibGUpID09PSBmYWxzZSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlQmFzZUZvcjtcbiIsCiAgICAiaW1wb3J0IGNyZWF0ZUJhc2VGb3IgZnJvbSAnLi9fY3JlYXRlQmFzZUZvci5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGJhc2VGb3JPd25gIHdoaWNoIGl0ZXJhdGVzIG92ZXIgYG9iamVjdGBcbiAqIHByb3BlcnRpZXMgcmV0dXJuZWQgYnkgYGtleXNGdW5jYCBhbmQgaW52b2tlcyBgaXRlcmF0ZWVgIGZvciBlYWNoIHByb3BlcnR5LlxuICogSXRlcmF0ZWUgZnVuY3Rpb25zIG1heSBleGl0IGl0ZXJhdGlvbiBlYXJseSBieSBleHBsaWNpdGx5IHJldHVybmluZyBgZmFsc2VgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGtleXNGdW5jIFRoZSBmdW5jdGlvbiB0byBnZXQgdGhlIGtleXMgb2YgYG9iamVjdGAuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG52YXIgYmFzZUZvciA9IGNyZWF0ZUJhc2VGb3IoKTtcblxuZXhwb3J0IGRlZmF1bHQgYmFzZUZvcjtcbiIsCiAgICAiaW1wb3J0IGJhc2VGb3IgZnJvbSAnLi9fYmFzZUZvci5qcyc7XG5pbXBvcnQga2V5cyBmcm9tICcuL2tleXMuanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmZvck93bmAgd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VGb3JPd24ob2JqZWN0LCBpdGVyYXRlZSkge1xuICByZXR1cm4gb2JqZWN0ICYmIGJhc2VGb3Iob2JqZWN0LCBpdGVyYXRlZSwga2V5cyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VGb3JPd247XG4iLAogICAgImltcG9ydCBpc0FycmF5TGlrZSBmcm9tICcuL2lzQXJyYXlMaWtlLmpzJztcblxuLyoqXG4gKiBDcmVhdGVzIGEgYGJhc2VFYWNoYCBvciBgYmFzZUVhY2hSaWdodGAgZnVuY3Rpb24uXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGVhY2hGdW5jIFRoZSBmdW5jdGlvbiB0byBpdGVyYXRlIG92ZXIgYSBjb2xsZWN0aW9uLlxuICogQHBhcmFtIHtib29sZWFufSBbZnJvbVJpZ2h0XSBTcGVjaWZ5IGl0ZXJhdGluZyBmcm9tIHJpZ2h0IHRvIGxlZnQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBiYXNlIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBjcmVhdGVCYXNlRWFjaChlYWNoRnVuYywgZnJvbVJpZ2h0KSB7XG4gIHJldHVybiBmdW5jdGlvbihjb2xsZWN0aW9uLCBpdGVyYXRlZSkge1xuICAgIGlmIChjb2xsZWN0aW9uID09IG51bGwpIHtcbiAgICAgIHJldHVybiBjb2xsZWN0aW9uO1xuICAgIH1cbiAgICBpZiAoIWlzQXJyYXlMaWtlKGNvbGxlY3Rpb24pKSB7XG4gICAgICByZXR1cm4gZWFjaEZ1bmMoY29sbGVjdGlvbiwgaXRlcmF0ZWUpO1xuICAgIH1cbiAgICB2YXIgbGVuZ3RoID0gY29sbGVjdGlvbi5sZW5ndGgsXG4gICAgICAgIGluZGV4ID0gZnJvbVJpZ2h0ID8gbGVuZ3RoIDogLTEsXG4gICAgICAgIGl0ZXJhYmxlID0gT2JqZWN0KGNvbGxlY3Rpb24pO1xuXG4gICAgd2hpbGUgKChmcm9tUmlnaHQgPyBpbmRleC0tIDogKytpbmRleCA8IGxlbmd0aCkpIHtcbiAgICAgIGlmIChpdGVyYXRlZShpdGVyYWJsZVtpbmRleF0sIGluZGV4LCBpdGVyYWJsZSkgPT09IGZhbHNlKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY29sbGVjdGlvbjtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlQmFzZUVhY2g7XG4iLAogICAgImltcG9ydCBiYXNlRm9yT3duIGZyb20gJy4vX2Jhc2VGb3JPd24uanMnO1xuaW1wb3J0IGNyZWF0ZUJhc2VFYWNoIGZyb20gJy4vX2NyZWF0ZUJhc2VFYWNoLmpzJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5mb3JFYWNoYCB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl8T2JqZWN0fSBSZXR1cm5zIGBjb2xsZWN0aW9uYC5cbiAqL1xudmFyIGJhc2VFYWNoID0gY3JlYXRlQmFzZUVhY2goYmFzZUZvck93bik7XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VFYWNoO1xuIiwKICAgICJpbXBvcnQgcm9vdCBmcm9tICcuL19yb290LmpzJztcblxuLyoqXG4gKiBHZXRzIHRoZSB0aW1lc3RhbXAgb2YgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdGhhdCBoYXZlIGVsYXBzZWQgc2luY2VcbiAqIHRoZSBVbml4IGVwb2NoICgxIEphbnVhcnkgMTk3MCAwMDowMDowMCBVVEMpLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMi40LjBcbiAqIEBjYXRlZ29yeSBEYXRlXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSB0aW1lc3RhbXAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uZGVmZXIoZnVuY3Rpb24oc3RhbXApIHtcbiAqICAgY29uc29sZS5sb2coXy5ub3coKSAtIHN0YW1wKTtcbiAqIH0sIF8ubm93KCkpO1xuICogLy8gPT4gTG9ncyB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBpdCB0b29rIGZvciB0aGUgZGVmZXJyZWQgaW52b2NhdGlvbi5cbiAqL1xudmFyIG5vdyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gcm9vdC5EYXRlLm5vdygpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgbm93O1xuIiwKICAgICJpbXBvcnQgYmFzZVJlc3QgZnJvbSAnLi9fYmFzZVJlc3QuanMnO1xuaW1wb3J0IGVxIGZyb20gJy4vZXEuanMnO1xuaW1wb3J0IGlzSXRlcmF0ZWVDYWxsIGZyb20gJy4vX2lzSXRlcmF0ZWVDYWxsLmpzJztcbmltcG9ydCBrZXlzSW4gZnJvbSAnLi9rZXlzSW4uanMnO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIEFzc2lnbnMgb3duIGFuZCBpbmhlcml0ZWQgZW51bWVyYWJsZSBzdHJpbmcga2V5ZWQgcHJvcGVydGllcyBvZiBzb3VyY2VcbiAqIG9iamVjdHMgdG8gdGhlIGRlc3RpbmF0aW9uIG9iamVjdCBmb3IgYWxsIGRlc3RpbmF0aW9uIHByb3BlcnRpZXMgdGhhdFxuICogcmVzb2x2ZSB0byBgdW5kZWZpbmVkYC4gU291cmNlIG9iamVjdHMgYXJlIGFwcGxpZWQgZnJvbSBsZWZ0IHRvIHJpZ2h0LlxuICogT25jZSBhIHByb3BlcnR5IGlzIHNldCwgYWRkaXRpb25hbCB2YWx1ZXMgb2YgdGhlIHNhbWUgcHJvcGVydHkgYXJlIGlnbm9yZWQuXG4gKlxuICogKipOb3RlOioqIFRoaXMgbWV0aG9kIG11dGF0ZXMgYG9iamVjdGAuXG4gKlxuICogQHN0YXRpY1xuICogQHNpbmNlIDAuMS4wXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICogQHBhcmFtIHsuLi5PYmplY3R9IFtzb3VyY2VzXSBUaGUgc291cmNlIG9iamVjdHMuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICogQHNlZSBfLmRlZmF1bHRzRGVlcFxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmRlZmF1bHRzKHsgJ2EnOiAxIH0sIHsgJ2InOiAyIH0sIHsgJ2EnOiAzIH0pO1xuICogLy8gPT4geyAnYSc6IDEsICdiJzogMiB9XG4gKi9cbnZhciBkZWZhdWx0cyA9IGJhc2VSZXN0KGZ1bmN0aW9uKG9iamVjdCwgc291cmNlcykge1xuICBvYmplY3QgPSBPYmplY3Qob2JqZWN0KTtcblxuICB2YXIgaW5kZXggPSAtMTtcbiAgdmFyIGxlbmd0aCA9IHNvdXJjZXMubGVuZ3RoO1xuICB2YXIgZ3VhcmQgPSBsZW5ndGggPiAyID8gc291cmNlc1syXSA6IHVuZGVmaW5lZDtcblxuICBpZiAoZ3VhcmQgJiYgaXNJdGVyYXRlZUNhbGwoc291cmNlc1swXSwgc291cmNlc1sxXSwgZ3VhcmQpKSB7XG4gICAgbGVuZ3RoID0gMTtcbiAgfVxuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIHNvdXJjZSA9IHNvdXJjZXNbaW5kZXhdO1xuICAgIHZhciBwcm9wcyA9IGtleXNJbihzb3VyY2UpO1xuICAgIHZhciBwcm9wc0luZGV4ID0gLTE7XG4gICAgdmFyIHByb3BzTGVuZ3RoID0gcHJvcHMubGVuZ3RoO1xuXG4gICAgd2hpbGUgKCsrcHJvcHNJbmRleCA8IHByb3BzTGVuZ3RoKSB7XG4gICAgICB2YXIga2V5ID0gcHJvcHNbcHJvcHNJbmRleF07XG4gICAgICB2YXIgdmFsdWUgPSBvYmplY3Rba2V5XTtcblxuICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAoZXEodmFsdWUsIG9iamVjdFByb3RvW2tleV0pICYmICFoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSkpIHtcbiAgICAgICAgb2JqZWN0W2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqZWN0O1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmF1bHRzO1xuIiwKICAgICJpbXBvcnQgYmFzZUFzc2lnblZhbHVlIGZyb20gJy4vX2Jhc2VBc3NpZ25WYWx1ZS5qcyc7XG5pbXBvcnQgZXEgZnJvbSAnLi9lcS5qcyc7XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBpcyBsaWtlIGBhc3NpZ25WYWx1ZWAgZXhjZXB0IHRoYXQgaXQgZG9lc24ndCBhc3NpZ25cbiAqIGB1bmRlZmluZWRgIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gYXNzaWduLlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYXNzaWduLlxuICovXG5mdW5jdGlvbiBhc3NpZ25NZXJnZVZhbHVlKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICBpZiAoKHZhbHVlICE9PSB1bmRlZmluZWQgJiYgIWVxKG9iamVjdFtrZXldLCB2YWx1ZSkpIHx8XG4gICAgICAodmFsdWUgPT09IHVuZGVmaW5lZCAmJiAhKGtleSBpbiBvYmplY3QpKSkge1xuICAgIGJhc2VBc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFzc2lnbk1lcmdlVmFsdWU7XG4iLAogICAgImltcG9ydCBpc0FycmF5TGlrZSBmcm9tICcuL2lzQXJyYXlMaWtlLmpzJztcbmltcG9ydCBpc09iamVjdExpa2UgZnJvbSAnLi9pc09iamVjdExpa2UuanMnO1xuXG4vKipcbiAqIFRoaXMgbWV0aG9kIGlzIGxpa2UgYF8uaXNBcnJheUxpa2VgIGV4Y2VwdCB0aGF0IGl0IGFsc28gY2hlY2tzIGlmIGB2YWx1ZWBcbiAqIGlzIGFuIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBhcnJheS1saWtlIG9iamVjdCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheUxpa2VPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlT2JqZWN0KGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2VPYmplY3QoJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXlMaWtlT2JqZWN0KF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5TGlrZU9iamVjdCh2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBpc0FycmF5TGlrZSh2YWx1ZSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzQXJyYXlMaWtlT2JqZWN0O1xuIiwKICAgICIvKipcbiAqIEdldHMgdGhlIHZhbHVlIGF0IGBrZXlgLCB1bmxlc3MgYGtleWAgaXMgXCJfX3Byb3RvX19cIiBvciBcImNvbnN0cnVjdG9yXCIuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHByb3BlcnR5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBzYWZlR2V0KG9iamVjdCwga2V5KSB7XG4gIGlmIChrZXkgPT09ICdjb25zdHJ1Y3RvcicgJiYgdHlwZW9mIG9iamVjdFtrZXldID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGtleSA9PSAnX19wcm90b19fJykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHJldHVybiBvYmplY3Rba2V5XTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgc2FmZUdldDtcbiIsCiAgICAiaW1wb3J0IGNvcHlPYmplY3QgZnJvbSAnLi9fY29weU9iamVjdC5qcyc7XG5pbXBvcnQga2V5c0luIGZyb20gJy4va2V5c0luLmpzJztcblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgcGxhaW4gb2JqZWN0IGZsYXR0ZW5pbmcgaW5oZXJpdGVkIGVudW1lcmFibGUgc3RyaW5nXG4gKiBrZXllZCBwcm9wZXJ0aWVzIG9mIGB2YWx1ZWAgdG8gb3duIHByb3BlcnRpZXMgb2YgdGhlIHBsYWluIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGNvbnZlcnRlZCBwbGFpbiBvYmplY3QuXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIEZvbygpIHtcbiAqICAgdGhpcy5iID0gMjtcbiAqIH1cbiAqXG4gKiBGb28ucHJvdG90eXBlLmMgPSAzO1xuICpcbiAqIF8uYXNzaWduKHsgJ2EnOiAxIH0sIG5ldyBGb28pO1xuICogLy8gPT4geyAnYSc6IDEsICdiJzogMiB9XG4gKlxuICogXy5hc3NpZ24oeyAnYSc6IDEgfSwgXy50b1BsYWluT2JqZWN0KG5ldyBGb28pKTtcbiAqIC8vID0+IHsgJ2EnOiAxLCAnYic6IDIsICdjJzogMyB9XG4gKi9cbmZ1bmN0aW9uIHRvUGxhaW5PYmplY3QodmFsdWUpIHtcbiAgcmV0dXJuIGNvcHlPYmplY3QodmFsdWUsIGtleXNJbih2YWx1ZSkpO1xufVxuXG5leHBvcnQgZGVmYXVsdCB0b1BsYWluT2JqZWN0O1xuIiwKICAgICJpbXBvcnQgYXNzaWduTWVyZ2VWYWx1ZSBmcm9tICcuL19hc3NpZ25NZXJnZVZhbHVlLmpzJztcbmltcG9ydCBjbG9uZUJ1ZmZlciBmcm9tICcuL19jbG9uZUJ1ZmZlci5qcyc7XG5pbXBvcnQgY2xvbmVUeXBlZEFycmF5IGZyb20gJy4vX2Nsb25lVHlwZWRBcnJheS5qcyc7XG5pbXBvcnQgY29weUFycmF5IGZyb20gJy4vX2NvcHlBcnJheS5qcyc7XG5pbXBvcnQgaW5pdENsb25lT2JqZWN0IGZyb20gJy4vX2luaXRDbG9uZU9iamVjdC5qcyc7XG5pbXBvcnQgaXNBcmd1bWVudHMgZnJvbSAnLi9pc0FyZ3VtZW50cy5qcyc7XG5pbXBvcnQgaXNBcnJheSBmcm9tICcuL2lzQXJyYXkuanMnO1xuaW1wb3J0IGlzQXJyYXlMaWtlT2JqZWN0IGZyb20gJy4vaXNBcnJheUxpa2VPYmplY3QuanMnO1xuaW1wb3J0IGlzQnVmZmVyIGZyb20gJy4vaXNCdWZmZXIuanMnO1xuaW1wb3J0IGlzRnVuY3Rpb24gZnJvbSAnLi9pc0Z1bmN0aW9uLmpzJztcbmltcG9ydCBpc09iamVjdCBmcm9tICcuL2lzT2JqZWN0LmpzJztcbmltcG9ydCBpc1BsYWluT2JqZWN0IGZyb20gJy4vaXNQbGFpbk9iamVjdC5qcyc7XG5pbXBvcnQgaXNUeXBlZEFycmF5IGZyb20gJy4vaXNUeXBlZEFycmF5LmpzJztcbmltcG9ydCBzYWZlR2V0IGZyb20gJy4vX3NhZmVHZXQuanMnO1xuaW1wb3J0IHRvUGxhaW5PYmplY3QgZnJvbSAnLi90b1BsYWluT2JqZWN0LmpzJztcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VNZXJnZWAgZm9yIGFycmF5cyBhbmQgb2JqZWN0cyB3aGljaCBwZXJmb3Jtc1xuICogZGVlcCBtZXJnZXMgYW5kIHRyYWNrcyB0cmF2ZXJzZWQgb2JqZWN0cyBlbmFibGluZyBvYmplY3RzIHdpdGggY2lyY3VsYXJcbiAqIHJlZmVyZW5jZXMgdG8gYmUgbWVyZ2VkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBzb3VyY2Ugb2JqZWN0LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBtZXJnZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBzcmNJbmRleCBUaGUgaW5kZXggb2YgYHNvdXJjZWAuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBtZXJnZUZ1bmMgVGhlIGZ1bmN0aW9uIHRvIG1lcmdlIHZhbHVlcy5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjdXN0b21pemVyXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGFzc2lnbmVkIHZhbHVlcy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbc3RhY2tdIFRyYWNrcyB0cmF2ZXJzZWQgc291cmNlIHZhbHVlcyBhbmQgdGhlaXIgbWVyZ2VkXG4gKiAgY291bnRlcnBhcnRzLlxuICovXG5mdW5jdGlvbiBiYXNlTWVyZ2VEZWVwKG9iamVjdCwgc291cmNlLCBrZXksIHNyY0luZGV4LCBtZXJnZUZ1bmMsIGN1c3RvbWl6ZXIsIHN0YWNrKSB7XG4gIHZhciBvYmpWYWx1ZSA9IHNhZmVHZXQob2JqZWN0LCBrZXkpLFxuICAgICAgc3JjVmFsdWUgPSBzYWZlR2V0KHNvdXJjZSwga2V5KSxcbiAgICAgIHN0YWNrZWQgPSBzdGFjay5nZXQoc3JjVmFsdWUpO1xuXG4gIGlmIChzdGFja2VkKSB7XG4gICAgYXNzaWduTWVyZ2VWYWx1ZShvYmplY3QsIGtleSwgc3RhY2tlZCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBuZXdWYWx1ZSA9IGN1c3RvbWl6ZXJcbiAgICA/IGN1c3RvbWl6ZXIob2JqVmFsdWUsIHNyY1ZhbHVlLCAoa2V5ICsgJycpLCBvYmplY3QsIHNvdXJjZSwgc3RhY2spXG4gICAgOiB1bmRlZmluZWQ7XG5cbiAgdmFyIGlzQ29tbW9uID0gbmV3VmFsdWUgPT09IHVuZGVmaW5lZDtcblxuICBpZiAoaXNDb21tb24pIHtcbiAgICB2YXIgaXNBcnIgPSBpc0FycmF5KHNyY1ZhbHVlKSxcbiAgICAgICAgaXNCdWZmID0gIWlzQXJyICYmIGlzQnVmZmVyKHNyY1ZhbHVlKSxcbiAgICAgICAgaXNUeXBlZCA9ICFpc0FyciAmJiAhaXNCdWZmICYmIGlzVHlwZWRBcnJheShzcmNWYWx1ZSk7XG5cbiAgICBuZXdWYWx1ZSA9IHNyY1ZhbHVlO1xuICAgIGlmIChpc0FyciB8fCBpc0J1ZmYgfHwgaXNUeXBlZCkge1xuICAgICAgaWYgKGlzQXJyYXkob2JqVmFsdWUpKSB7XG4gICAgICAgIG5ld1ZhbHVlID0gb2JqVmFsdWU7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChpc0FycmF5TGlrZU9iamVjdChvYmpWYWx1ZSkpIHtcbiAgICAgICAgbmV3VmFsdWUgPSBjb3B5QXJyYXkob2JqVmFsdWUpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoaXNCdWZmKSB7XG4gICAgICAgIGlzQ29tbW9uID0gZmFsc2U7XG4gICAgICAgIG5ld1ZhbHVlID0gY2xvbmVCdWZmZXIoc3JjVmFsdWUsIHRydWUpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoaXNUeXBlZCkge1xuICAgICAgICBpc0NvbW1vbiA9IGZhbHNlO1xuICAgICAgICBuZXdWYWx1ZSA9IGNsb25lVHlwZWRBcnJheShzcmNWYWx1ZSwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgbmV3VmFsdWUgPSBbXTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoaXNQbGFpbk9iamVjdChzcmNWYWx1ZSkgfHwgaXNBcmd1bWVudHMoc3JjVmFsdWUpKSB7XG4gICAgICBuZXdWYWx1ZSA9IG9ialZhbHVlO1xuICAgICAgaWYgKGlzQXJndW1lbnRzKG9ialZhbHVlKSkge1xuICAgICAgICBuZXdWYWx1ZSA9IHRvUGxhaW5PYmplY3Qob2JqVmFsdWUpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIWlzT2JqZWN0KG9ialZhbHVlKSB8fCBpc0Z1bmN0aW9uKG9ialZhbHVlKSkge1xuICAgICAgICBuZXdWYWx1ZSA9IGluaXRDbG9uZU9iamVjdChzcmNWYWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgaXNDb21tb24gPSBmYWxzZTtcbiAgICB9XG4gIH1cbiAgaWYgKGlzQ29tbW9uKSB7XG4gICAgLy8gUmVjdXJzaXZlbHkgbWVyZ2Ugb2JqZWN0cyBhbmQgYXJyYXlzIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cykuXG4gICAgc3RhY2suc2V0KHNyY1ZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgbWVyZ2VGdW5jKG5ld1ZhbHVlLCBzcmNWYWx1ZSwgc3JjSW5kZXgsIGN1c3RvbWl6ZXIsIHN0YWNrKTtcbiAgICBzdGFja1snZGVsZXRlJ10oc3JjVmFsdWUpO1xuICB9XG4gIGFzc2lnbk1lcmdlVmFsdWUob2JqZWN0LCBrZXksIG5ld1ZhbHVlKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZU1lcmdlRGVlcDtcbiIsCiAgICAiaW1wb3J0IFN0YWNrIGZyb20gJy4vX1N0YWNrLmpzJztcbmltcG9ydCBhc3NpZ25NZXJnZVZhbHVlIGZyb20gJy4vX2Fzc2lnbk1lcmdlVmFsdWUuanMnO1xuaW1wb3J0IGJhc2VGb3IgZnJvbSAnLi9fYmFzZUZvci5qcyc7XG5pbXBvcnQgYmFzZU1lcmdlRGVlcCBmcm9tICcuL19iYXNlTWVyZ2VEZWVwLmpzJztcbmltcG9ydCBpc09iamVjdCBmcm9tICcuL2lzT2JqZWN0LmpzJztcbmltcG9ydCBrZXlzSW4gZnJvbSAnLi9rZXlzSW4uanMnO1xuaW1wb3J0IHNhZmVHZXQgZnJvbSAnLi9fc2FmZUdldC5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ubWVyZ2VgIHdpdGhvdXQgc3VwcG9ydCBmb3IgbXVsdGlwbGUgc291cmNlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgc291cmNlIG9iamVjdC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBzcmNJbmRleCBUaGUgaW5kZXggb2YgYHNvdXJjZWAuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY3VzdG9taXplcl0gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBtZXJnZWQgdmFsdWVzLlxuICogQHBhcmFtIHtPYmplY3R9IFtzdGFja10gVHJhY2tzIHRyYXZlcnNlZCBzb3VyY2UgdmFsdWVzIGFuZCB0aGVpciBtZXJnZWRcbiAqICBjb3VudGVycGFydHMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VNZXJnZShvYmplY3QsIHNvdXJjZSwgc3JjSW5kZXgsIGN1c3RvbWl6ZXIsIHN0YWNrKSB7XG4gIGlmIChvYmplY3QgPT09IHNvdXJjZSkge1xuICAgIHJldHVybjtcbiAgfVxuICBiYXNlRm9yKHNvdXJjZSwgZnVuY3Rpb24oc3JjVmFsdWUsIGtleSkge1xuICAgIHN0YWNrIHx8IChzdGFjayA9IG5ldyBTdGFjayk7XG4gICAgaWYgKGlzT2JqZWN0KHNyY1ZhbHVlKSkge1xuICAgICAgYmFzZU1lcmdlRGVlcChvYmplY3QsIHNvdXJjZSwga2V5LCBzcmNJbmRleCwgYmFzZU1lcmdlLCBjdXN0b21pemVyLCBzdGFjayk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdmFyIG5ld1ZhbHVlID0gY3VzdG9taXplclxuICAgICAgICA/IGN1c3RvbWl6ZXIoc2FmZUdldChvYmplY3QsIGtleSksIHNyY1ZhbHVlLCAoa2V5ICsgJycpLCBvYmplY3QsIHNvdXJjZSwgc3RhY2spXG4gICAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgICBpZiAobmV3VmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBuZXdWYWx1ZSA9IHNyY1ZhbHVlO1xuICAgICAgfVxuICAgICAgYXNzaWduTWVyZ2VWYWx1ZShvYmplY3QsIGtleSwgbmV3VmFsdWUpO1xuICAgIH1cbiAgfSwga2V5c0luKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZU1lcmdlO1xuIiwKICAgICIvKipcbiAqIFRoaXMgZnVuY3Rpb24gaXMgbGlrZSBgYXJyYXlJbmNsdWRlc2AgZXhjZXB0IHRoYXQgaXQgYWNjZXB0cyBhIGNvbXBhcmF0b3IuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IFthcnJheV0gVGhlIGFycmF5IHRvIGluc3BlY3QuXG4gKiBAcGFyYW0geyp9IHRhcmdldCBUaGUgdmFsdWUgdG8gc2VhcmNoIGZvci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNvbXBhcmF0b3IgVGhlIGNvbXBhcmF0b3IgaW52b2tlZCBwZXIgZWxlbWVudC5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdGFyZ2V0YCBpcyBmb3VuZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBhcnJheUluY2x1ZGVzV2l0aChhcnJheSwgdmFsdWUsIGNvbXBhcmF0b3IpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheSA9PSBudWxsID8gMCA6IGFycmF5Lmxlbmd0aDtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIGlmIChjb21wYXJhdG9yKHZhbHVlLCBhcnJheVtpbmRleF0pKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBhcnJheUluY2x1ZGVzV2l0aDtcbiIsCiAgICAiLyoqXG4gKiBHZXRzIHRoZSBsYXN0IGVsZW1lbnQgb2YgYGFycmF5YC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgQXJyYXlcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBsYXN0IGVsZW1lbnQgb2YgYGFycmF5YC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5sYXN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiAzXG4gKi9cbmZ1bmN0aW9uIGxhc3QoYXJyYXkpIHtcbiAgdmFyIGxlbmd0aCA9IGFycmF5ID09IG51bGwgPyAwIDogYXJyYXkubGVuZ3RoO1xuICByZXR1cm4gbGVuZ3RoID8gYXJyYXlbbGVuZ3RoIC0gMV0gOiB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGxhc3Q7XG4iLAogICAgImltcG9ydCBpZGVudGl0eSBmcm9tICcuL2lkZW50aXR5LmpzJztcblxuLyoqXG4gKiBDYXN0cyBgdmFsdWVgIHRvIGBpZGVudGl0eWAgaWYgaXQncyBub3QgYSBmdW5jdGlvbi5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gaW5zcGVjdC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyBjYXN0IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBjYXN0RnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnZnVuY3Rpb24nID8gdmFsdWUgOiBpZGVudGl0eTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2FzdEZ1bmN0aW9uO1xuIiwKICAgICJpbXBvcnQgYXJyYXlFYWNoIGZyb20gJy4vX2FycmF5RWFjaC5qcyc7XG5pbXBvcnQgYmFzZUVhY2ggZnJvbSAnLi9fYmFzZUVhY2guanMnO1xuaW1wb3J0IGNhc3RGdW5jdGlvbiBmcm9tICcuL19jYXN0RnVuY3Rpb24uanMnO1xuaW1wb3J0IGlzQXJyYXkgZnJvbSAnLi9pc0FycmF5LmpzJztcblxuLyoqXG4gKiBJdGVyYXRlcyBvdmVyIGVsZW1lbnRzIG9mIGBjb2xsZWN0aW9uYCBhbmQgaW52b2tlcyBgaXRlcmF0ZWVgIGZvciBlYWNoIGVsZW1lbnQuXG4gKiBUaGUgaXRlcmF0ZWUgaXMgaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50czogKHZhbHVlLCBpbmRleHxrZXksIGNvbGxlY3Rpb24pLlxuICogSXRlcmF0ZWUgZnVuY3Rpb25zIG1heSBleGl0IGl0ZXJhdGlvbiBlYXJseSBieSBleHBsaWNpdGx5IHJldHVybmluZyBgZmFsc2VgLlxuICpcbiAqICoqTm90ZToqKiBBcyB3aXRoIG90aGVyIFwiQ29sbGVjdGlvbnNcIiBtZXRob2RzLCBvYmplY3RzIHdpdGggYSBcImxlbmd0aFwiXG4gKiBwcm9wZXJ0eSBhcmUgaXRlcmF0ZWQgbGlrZSBhcnJheXMuIFRvIGF2b2lkIHRoaXMgYmVoYXZpb3IgdXNlIGBfLmZvckluYFxuICogb3IgYF8uZm9yT3duYCBmb3Igb2JqZWN0IGl0ZXJhdGlvbi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAYWxpYXMgZWFjaFxuICogQGNhdGVnb3J5IENvbGxlY3Rpb25cbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtpdGVyYXRlZT1fLmlkZW50aXR5XSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fE9iamVjdH0gUmV0dXJucyBgY29sbGVjdGlvbmAuXG4gKiBAc2VlIF8uZm9yRWFjaFJpZ2h0XG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uZm9yRWFjaChbMSwgMl0sIGZ1bmN0aW9uKHZhbHVlKSB7XG4gKiAgIGNvbnNvbGUubG9nKHZhbHVlKTtcbiAqIH0pO1xuICogLy8gPT4gTG9ncyBgMWAgdGhlbiBgMmAuXG4gKlxuICogXy5mb3JFYWNoKHsgJ2EnOiAxLCAnYic6IDIgfSwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICogICBjb25zb2xlLmxvZyhrZXkpO1xuICogfSk7XG4gKiAvLyA9PiBMb2dzICdhJyB0aGVuICdiJyAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKS5cbiAqL1xuZnVuY3Rpb24gZm9yRWFjaChjb2xsZWN0aW9uLCBpdGVyYXRlZSkge1xuICB2YXIgZnVuYyA9IGlzQXJyYXkoY29sbGVjdGlvbikgPyBhcnJheUVhY2ggOiBiYXNlRWFjaDtcbiAgcmV0dXJuIGZ1bmMoY29sbGVjdGlvbiwgY2FzdEZ1bmN0aW9uKGl0ZXJhdGVlKSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZvckVhY2g7XG4iLAogICAgImltcG9ydCBiYXNlRWFjaCBmcm9tICcuL19iYXNlRWFjaC5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uZmlsdGVyYCB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHByZWRpY2F0ZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgZmlsdGVyZWQgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGJhc2VGaWx0ZXIoY29sbGVjdGlvbiwgcHJlZGljYXRlKSB7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgYmFzZUVhY2goY29sbGVjdGlvbiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgaWYgKHByZWRpY2F0ZSh2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pKSB7XG4gICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUZpbHRlcjtcbiIsCiAgICAiaW1wb3J0IGFycmF5RmlsdGVyIGZyb20gJy4vX2FycmF5RmlsdGVyLmpzJztcbmltcG9ydCBiYXNlRmlsdGVyIGZyb20gJy4vX2Jhc2VGaWx0ZXIuanMnO1xuaW1wb3J0IGJhc2VJdGVyYXRlZSBmcm9tICcuL19iYXNlSXRlcmF0ZWUuanMnO1xuaW1wb3J0IGlzQXJyYXkgZnJvbSAnLi9pc0FycmF5LmpzJztcblxuLyoqXG4gKiBJdGVyYXRlcyBvdmVyIGVsZW1lbnRzIG9mIGBjb2xsZWN0aW9uYCwgcmV0dXJuaW5nIGFuIGFycmF5IG9mIGFsbCBlbGVtZW50c1xuICogYHByZWRpY2F0ZWAgcmV0dXJucyB0cnV0aHkgZm9yLiBUaGUgcHJlZGljYXRlIGlzIGludm9rZWQgd2l0aCB0aHJlZVxuICogYXJndW1lbnRzOiAodmFsdWUsIGluZGV4fGtleSwgY29sbGVjdGlvbikuXG4gKlxuICogKipOb3RlOioqIFVubGlrZSBgXy5yZW1vdmVgLCB0aGlzIG1ldGhvZCByZXR1cm5zIGEgbmV3IGFycmF5LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbcHJlZGljYXRlPV8uaWRlbnRpdHldIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIG5ldyBmaWx0ZXJlZCBhcnJheS5cbiAqIEBzZWUgXy5yZWplY3RcbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIHVzZXJzID0gW1xuICogICB7ICd1c2VyJzogJ2Jhcm5leScsICdhZ2UnOiAzNiwgJ2FjdGl2ZSc6IHRydWUgfSxcbiAqICAgeyAndXNlcic6ICdmcmVkJywgICAnYWdlJzogNDAsICdhY3RpdmUnOiBmYWxzZSB9XG4gKiBdO1xuICpcbiAqIF8uZmlsdGVyKHVzZXJzLCBmdW5jdGlvbihvKSB7IHJldHVybiAhby5hY3RpdmU7IH0pO1xuICogLy8gPT4gb2JqZWN0cyBmb3IgWydmcmVkJ11cbiAqXG4gKiAvLyBUaGUgYF8ubWF0Y2hlc2AgaXRlcmF0ZWUgc2hvcnRoYW5kLlxuICogXy5maWx0ZXIodXNlcnMsIHsgJ2FnZSc6IDM2LCAnYWN0aXZlJzogdHJ1ZSB9KTtcbiAqIC8vID0+IG9iamVjdHMgZm9yIFsnYmFybmV5J11cbiAqXG4gKiAvLyBUaGUgYF8ubWF0Y2hlc1Byb3BlcnR5YCBpdGVyYXRlZSBzaG9ydGhhbmQuXG4gKiBfLmZpbHRlcih1c2VycywgWydhY3RpdmUnLCBmYWxzZV0pO1xuICogLy8gPT4gb2JqZWN0cyBmb3IgWydmcmVkJ11cbiAqXG4gKiAvLyBUaGUgYF8ucHJvcGVydHlgIGl0ZXJhdGVlIHNob3J0aGFuZC5cbiAqIF8uZmlsdGVyKHVzZXJzLCAnYWN0aXZlJyk7XG4gKiAvLyA9PiBvYmplY3RzIGZvciBbJ2Jhcm5leSddXG4gKlxuICogLy8gQ29tYmluaW5nIHNldmVyYWwgcHJlZGljYXRlcyB1c2luZyBgXy5vdmVyRXZlcnlgIG9yIGBfLm92ZXJTb21lYC5cbiAqIF8uZmlsdGVyKHVzZXJzLCBfLm92ZXJTb21lKFt7ICdhZ2UnOiAzNiB9LCBbJ2FnZScsIDQwXV0pKTtcbiAqIC8vID0+IG9iamVjdHMgZm9yIFsnZnJlZCcsICdiYXJuZXknXVxuICovXG5mdW5jdGlvbiBmaWx0ZXIoY29sbGVjdGlvbiwgcHJlZGljYXRlKSB7XG4gIHZhciBmdW5jID0gaXNBcnJheShjb2xsZWN0aW9uKSA/IGFycmF5RmlsdGVyIDogYmFzZUZpbHRlcjtcbiAgcmV0dXJuIGZ1bmMoY29sbGVjdGlvbiwgYmFzZUl0ZXJhdGVlKHByZWRpY2F0ZSwgMykpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmaWx0ZXI7XG4iLAogICAgImltcG9ydCBiYXNlSXRlcmF0ZWUgZnJvbSAnLi9fYmFzZUl0ZXJhdGVlLmpzJztcbmltcG9ydCBpc0FycmF5TGlrZSBmcm9tICcuL2lzQXJyYXlMaWtlLmpzJztcbmltcG9ydCBrZXlzIGZyb20gJy4va2V5cy5qcyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGBfLmZpbmRgIG9yIGBfLmZpbmRMYXN0YCBmdW5jdGlvbi5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZmluZEluZGV4RnVuYyBUaGUgZnVuY3Rpb24gdG8gZmluZCB0aGUgY29sbGVjdGlvbiBpbmRleC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZpbmQgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUZpbmQoZmluZEluZGV4RnVuYykge1xuICByZXR1cm4gZnVuY3Rpb24oY29sbGVjdGlvbiwgcHJlZGljYXRlLCBmcm9tSW5kZXgpIHtcbiAgICB2YXIgaXRlcmFibGUgPSBPYmplY3QoY29sbGVjdGlvbik7XG4gICAgaWYgKCFpc0FycmF5TGlrZShjb2xsZWN0aW9uKSkge1xuICAgICAgdmFyIGl0ZXJhdGVlID0gYmFzZUl0ZXJhdGVlKHByZWRpY2F0ZSwgMyk7XG4gICAgICBjb2xsZWN0aW9uID0ga2V5cyhjb2xsZWN0aW9uKTtcbiAgICAgIHByZWRpY2F0ZSA9IGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gaXRlcmF0ZWUoaXRlcmFibGVba2V5XSwga2V5LCBpdGVyYWJsZSk7IH07XG4gICAgfVxuICAgIHZhciBpbmRleCA9IGZpbmRJbmRleEZ1bmMoY29sbGVjdGlvbiwgcHJlZGljYXRlLCBmcm9tSW5kZXgpO1xuICAgIHJldHVybiBpbmRleCA+IC0xID8gaXRlcmFibGVbaXRlcmF0ZWUgPyBjb2xsZWN0aW9uW2luZGV4XSA6IGluZGV4XSA6IHVuZGVmaW5lZDtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlRmluZDtcbiIsCiAgICAiaW1wb3J0IGJhc2VGaW5kSW5kZXggZnJvbSAnLi9fYmFzZUZpbmRJbmRleC5qcyc7XG5pbXBvcnQgYmFzZUl0ZXJhdGVlIGZyb20gJy4vX2Jhc2VJdGVyYXRlZS5qcyc7XG5pbXBvcnQgdG9JbnRlZ2VyIGZyb20gJy4vdG9JbnRlZ2VyLmpzJztcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZU1heCA9IE1hdGgubWF4O1xuXG4vKipcbiAqIFRoaXMgbWV0aG9kIGlzIGxpa2UgYF8uZmluZGAgZXhjZXB0IHRoYXQgaXQgcmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGZpcnN0XG4gKiBlbGVtZW50IGBwcmVkaWNhdGVgIHJldHVybnMgdHJ1dGh5IGZvciBpbnN0ZWFkIG9mIHRoZSBlbGVtZW50IGl0c2VsZi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDEuMS4wXG4gKiBAY2F0ZWdvcnkgQXJyYXlcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpbnNwZWN0LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW3ByZWRpY2F0ZT1fLmlkZW50aXR5XSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IFtmcm9tSW5kZXg9MF0gVGhlIGluZGV4IHRvIHNlYXJjaCBmcm9tLlxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGZvdW5kIGVsZW1lbnQsIGVsc2UgYC0xYC5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIHVzZXJzID0gW1xuICogICB7ICd1c2VyJzogJ2Jhcm5leScsICAnYWN0aXZlJzogZmFsc2UgfSxcbiAqICAgeyAndXNlcic6ICdmcmVkJywgICAgJ2FjdGl2ZSc6IGZhbHNlIH0sXG4gKiAgIHsgJ3VzZXInOiAncGViYmxlcycsICdhY3RpdmUnOiB0cnVlIH1cbiAqIF07XG4gKlxuICogXy5maW5kSW5kZXgodXNlcnMsIGZ1bmN0aW9uKG8pIHsgcmV0dXJuIG8udXNlciA9PSAnYmFybmV5JzsgfSk7XG4gKiAvLyA9PiAwXG4gKlxuICogLy8gVGhlIGBfLm1hdGNoZXNgIGl0ZXJhdGVlIHNob3J0aGFuZC5cbiAqIF8uZmluZEluZGV4KHVzZXJzLCB7ICd1c2VyJzogJ2ZyZWQnLCAnYWN0aXZlJzogZmFsc2UgfSk7XG4gKiAvLyA9PiAxXG4gKlxuICogLy8gVGhlIGBfLm1hdGNoZXNQcm9wZXJ0eWAgaXRlcmF0ZWUgc2hvcnRoYW5kLlxuICogXy5maW5kSW5kZXgodXNlcnMsIFsnYWN0aXZlJywgZmFsc2VdKTtcbiAqIC8vID0+IDBcbiAqXG4gKiAvLyBUaGUgYF8ucHJvcGVydHlgIGl0ZXJhdGVlIHNob3J0aGFuZC5cbiAqIF8uZmluZEluZGV4KHVzZXJzLCAnYWN0aXZlJyk7XG4gKiAvLyA9PiAyXG4gKi9cbmZ1bmN0aW9uIGZpbmRJbmRleChhcnJheSwgcHJlZGljYXRlLCBmcm9tSW5kZXgpIHtcbiAgdmFyIGxlbmd0aCA9IGFycmF5ID09IG51bGwgPyAwIDogYXJyYXkubGVuZ3RoO1xuICBpZiAoIWxlbmd0aCkge1xuICAgIHJldHVybiAtMTtcbiAgfVxuICB2YXIgaW5kZXggPSBmcm9tSW5kZXggPT0gbnVsbCA/IDAgOiB0b0ludGVnZXIoZnJvbUluZGV4KTtcbiAgaWYgKGluZGV4IDwgMCkge1xuICAgIGluZGV4ID0gbmF0aXZlTWF4KGxlbmd0aCArIGluZGV4LCAwKTtcbiAgfVxuICByZXR1cm4gYmFzZUZpbmRJbmRleChhcnJheSwgYmFzZUl0ZXJhdGVlKHByZWRpY2F0ZSwgMyksIGluZGV4KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZmluZEluZGV4O1xuIiwKICAgICJpbXBvcnQgY3JlYXRlRmluZCBmcm9tICcuL19jcmVhdGVGaW5kLmpzJztcbmltcG9ydCBmaW5kSW5kZXggZnJvbSAnLi9maW5kSW5kZXguanMnO1xuXG4vKipcbiAqIEl0ZXJhdGVzIG92ZXIgZWxlbWVudHMgb2YgYGNvbGxlY3Rpb25gLCByZXR1cm5pbmcgdGhlIGZpcnN0IGVsZW1lbnRcbiAqIGBwcmVkaWNhdGVgIHJldHVybnMgdHJ1dGh5IGZvci4gVGhlIHByZWRpY2F0ZSBpcyBpbnZva2VkIHdpdGggdGhyZWVcbiAqIGFyZ3VtZW50czogKHZhbHVlLCBpbmRleHxrZXksIGNvbGxlY3Rpb24pLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpbnNwZWN0LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW3ByZWRpY2F0ZT1fLmlkZW50aXR5XSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IFtmcm9tSW5kZXg9MF0gVGhlIGluZGV4IHRvIHNlYXJjaCBmcm9tLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIG1hdGNoZWQgZWxlbWVudCwgZWxzZSBgdW5kZWZpbmVkYC5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIHVzZXJzID0gW1xuICogICB7ICd1c2VyJzogJ2Jhcm5leScsICAnYWdlJzogMzYsICdhY3RpdmUnOiB0cnVlIH0sXG4gKiAgIHsgJ3VzZXInOiAnZnJlZCcsICAgICdhZ2UnOiA0MCwgJ2FjdGl2ZSc6IGZhbHNlIH0sXG4gKiAgIHsgJ3VzZXInOiAncGViYmxlcycsICdhZ2UnOiAxLCAgJ2FjdGl2ZSc6IHRydWUgfVxuICogXTtcbiAqXG4gKiBfLmZpbmQodXNlcnMsIGZ1bmN0aW9uKG8pIHsgcmV0dXJuIG8uYWdlIDwgNDA7IH0pO1xuICogLy8gPT4gb2JqZWN0IGZvciAnYmFybmV5J1xuICpcbiAqIC8vIFRoZSBgXy5tYXRjaGVzYCBpdGVyYXRlZSBzaG9ydGhhbmQuXG4gKiBfLmZpbmQodXNlcnMsIHsgJ2FnZSc6IDEsICdhY3RpdmUnOiB0cnVlIH0pO1xuICogLy8gPT4gb2JqZWN0IGZvciAncGViYmxlcydcbiAqXG4gKiAvLyBUaGUgYF8ubWF0Y2hlc1Byb3BlcnR5YCBpdGVyYXRlZSBzaG9ydGhhbmQuXG4gKiBfLmZpbmQodXNlcnMsIFsnYWN0aXZlJywgZmFsc2VdKTtcbiAqIC8vID0+IG9iamVjdCBmb3IgJ2ZyZWQnXG4gKlxuICogLy8gVGhlIGBfLnByb3BlcnR5YCBpdGVyYXRlZSBzaG9ydGhhbmQuXG4gKiBfLmZpbmQodXNlcnMsICdhY3RpdmUnKTtcbiAqIC8vID0+IG9iamVjdCBmb3IgJ2Jhcm5leSdcbiAqL1xudmFyIGZpbmQgPSBjcmVhdGVGaW5kKGZpbmRJbmRleCk7XG5cbmV4cG9ydCBkZWZhdWx0IGZpbmQ7XG4iLAogICAgImltcG9ydCBiYXNlRWFjaCBmcm9tICcuL19iYXNlRWFjaC5qcyc7XG5pbXBvcnQgaXNBcnJheUxpa2UgZnJvbSAnLi9pc0FycmF5TGlrZS5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ubWFwYCB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIG5ldyBtYXBwZWQgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGJhc2VNYXAoY29sbGVjdGlvbiwgaXRlcmF0ZWUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSBpc0FycmF5TGlrZShjb2xsZWN0aW9uKSA/IEFycmF5KGNvbGxlY3Rpb24ubGVuZ3RoKSA6IFtdO1xuXG4gIGJhc2VFYWNoKGNvbGxlY3Rpb24sIGZ1bmN0aW9uKHZhbHVlLCBrZXksIGNvbGxlY3Rpb24pIHtcbiAgICByZXN1bHRbKytpbmRleF0gPSBpdGVyYXRlZSh2YWx1ZSwga2V5LCBjb2xsZWN0aW9uKTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VNYXA7XG4iLAogICAgImltcG9ydCBhcnJheU1hcCBmcm9tICcuL19hcnJheU1hcC5qcyc7XG5pbXBvcnQgYmFzZUl0ZXJhdGVlIGZyb20gJy4vX2Jhc2VJdGVyYXRlZS5qcyc7XG5pbXBvcnQgYmFzZU1hcCBmcm9tICcuL19iYXNlTWFwLmpzJztcbmltcG9ydCBpc0FycmF5IGZyb20gJy4vaXNBcnJheS5qcyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB2YWx1ZXMgYnkgcnVubmluZyBlYWNoIGVsZW1lbnQgaW4gYGNvbGxlY3Rpb25gIHRocnVcbiAqIGBpdGVyYXRlZWAuIFRoZSBpdGVyYXRlZSBpcyBpbnZva2VkIHdpdGggdGhyZWUgYXJndW1lbnRzOlxuICogKHZhbHVlLCBpbmRleHxrZXksIGNvbGxlY3Rpb24pLlxuICpcbiAqIE1hbnkgbG9kYXNoIG1ldGhvZHMgYXJlIGd1YXJkZWQgdG8gd29yayBhcyBpdGVyYXRlZXMgZm9yIG1ldGhvZHMgbGlrZVxuICogYF8uZXZlcnlgLCBgXy5maWx0ZXJgLCBgXy5tYXBgLCBgXy5tYXBWYWx1ZXNgLCBgXy5yZWplY3RgLCBhbmQgYF8uc29tZWAuXG4gKlxuICogVGhlIGd1YXJkZWQgbWV0aG9kcyBhcmU6XG4gKiBgYXJ5YCwgYGNodW5rYCwgYGN1cnJ5YCwgYGN1cnJ5UmlnaHRgLCBgZHJvcGAsIGBkcm9wUmlnaHRgLCBgZXZlcnlgLFxuICogYGZpbGxgLCBgaW52ZXJ0YCwgYHBhcnNlSW50YCwgYHJhbmRvbWAsIGByYW5nZWAsIGByYW5nZVJpZ2h0YCwgYHJlcGVhdGAsXG4gKiBgc2FtcGxlU2l6ZWAsIGBzbGljZWAsIGBzb21lYCwgYHNvcnRCeWAsIGBzcGxpdGAsIGB0YWtlYCwgYHRha2VSaWdodGAsXG4gKiBgdGVtcGxhdGVgLCBgdHJpbWAsIGB0cmltRW5kYCwgYHRyaW1TdGFydGAsIGFuZCBgd29yZHNgXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IENvbGxlY3Rpb25cbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtpdGVyYXRlZT1fLmlkZW50aXR5XSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgbWFwcGVkIGFycmF5LlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBzcXVhcmUobikge1xuICogICByZXR1cm4gbiAqIG47XG4gKiB9XG4gKlxuICogXy5tYXAoWzQsIDhdLCBzcXVhcmUpO1xuICogLy8gPT4gWzE2LCA2NF1cbiAqXG4gKiBfLm1hcCh7ICdhJzogNCwgJ2InOiA4IH0sIHNxdWFyZSk7XG4gKiAvLyA9PiBbMTYsIDY0XSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICpcbiAqIHZhciB1c2VycyA9IFtcbiAqICAgeyAndXNlcic6ICdiYXJuZXknIH0sXG4gKiAgIHsgJ3VzZXInOiAnZnJlZCcgfVxuICogXTtcbiAqXG4gKiAvLyBUaGUgYF8ucHJvcGVydHlgIGl0ZXJhdGVlIHNob3J0aGFuZC5cbiAqIF8ubWFwKHVzZXJzLCAndXNlcicpO1xuICogLy8gPT4gWydiYXJuZXknLCAnZnJlZCddXG4gKi9cbmZ1bmN0aW9uIG1hcChjb2xsZWN0aW9uLCBpdGVyYXRlZSkge1xuICB2YXIgZnVuYyA9IGlzQXJyYXkoY29sbGVjdGlvbikgPyBhcnJheU1hcCA6IGJhc2VNYXA7XG4gIHJldHVybiBmdW5jKGNvbGxlY3Rpb24sIGJhc2VJdGVyYXRlZShpdGVyYXRlZSwgMykpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBtYXA7XG4iLAogICAgImltcG9ydCBiYXNlRm9yIGZyb20gJy4vX2Jhc2VGb3IuanMnO1xuaW1wb3J0IGNhc3RGdW5jdGlvbiBmcm9tICcuL19jYXN0RnVuY3Rpb24uanMnO1xuaW1wb3J0IGtleXNJbiBmcm9tICcuL2tleXNJbi5qcyc7XG5cbi8qKlxuICogSXRlcmF0ZXMgb3ZlciBvd24gYW5kIGluaGVyaXRlZCBlbnVtZXJhYmxlIHN0cmluZyBrZXllZCBwcm9wZXJ0aWVzIG9mIGFuXG4gKiBvYmplY3QgYW5kIGludm9rZXMgYGl0ZXJhdGVlYCBmb3IgZWFjaCBwcm9wZXJ0eS4gVGhlIGl0ZXJhdGVlIGlzIGludm9rZWRcbiAqIHdpdGggdGhyZWUgYXJndW1lbnRzOiAodmFsdWUsIGtleSwgb2JqZWN0KS4gSXRlcmF0ZWUgZnVuY3Rpb25zIG1heSBleGl0XG4gKiBpdGVyYXRpb24gZWFybHkgYnkgZXhwbGljaXRseSByZXR1cm5pbmcgYGZhbHNlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMy4wXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2l0ZXJhdGVlPV8uaWRlbnRpdHldIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICogQHNlZSBfLmZvckluUmlnaHRcbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogICB0aGlzLmIgPSAyO1xuICogfVxuICpcbiAqIEZvby5wcm90b3R5cGUuYyA9IDM7XG4gKlxuICogXy5mb3JJbihuZXcgRm9vLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gKiAgIGNvbnNvbGUubG9nKGtleSk7XG4gKiB9KTtcbiAqIC8vID0+IExvZ3MgJ2EnLCAnYicsIHRoZW4gJ2MnIChpdGVyYXRpb24gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQpLlxuICovXG5mdW5jdGlvbiBmb3JJbihvYmplY3QsIGl0ZXJhdGVlKSB7XG4gIHJldHVybiBvYmplY3QgPT0gbnVsbFxuICAgID8gb2JqZWN0XG4gICAgOiBiYXNlRm9yKG9iamVjdCwgY2FzdEZ1bmN0aW9uKGl0ZXJhdGVlKSwga2V5c0luKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZm9ySW47XG4iLAogICAgImltcG9ydCBiYXNlRm9yT3duIGZyb20gJy4vX2Jhc2VGb3JPd24uanMnO1xuaW1wb3J0IGNhc3RGdW5jdGlvbiBmcm9tICcuL19jYXN0RnVuY3Rpb24uanMnO1xuXG4vKipcbiAqIEl0ZXJhdGVzIG92ZXIgb3duIGVudW1lcmFibGUgc3RyaW5nIGtleWVkIHByb3BlcnRpZXMgb2YgYW4gb2JqZWN0IGFuZFxuICogaW52b2tlcyBgaXRlcmF0ZWVgIGZvciBlYWNoIHByb3BlcnR5LiBUaGUgaXRlcmF0ZWUgaXMgaW52b2tlZCB3aXRoIHRocmVlXG4gKiBhcmd1bWVudHM6ICh2YWx1ZSwga2V5LCBvYmplY3QpLiBJdGVyYXRlZSBmdW5jdGlvbnMgbWF5IGV4aXQgaXRlcmF0aW9uXG4gKiBlYXJseSBieSBleHBsaWNpdGx5IHJldHVybmluZyBgZmFsc2VgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4zLjBcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbaXRlcmF0ZWU9Xy5pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKiBAc2VlIF8uZm9yT3duUmlnaHRcbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogICB0aGlzLmIgPSAyO1xuICogfVxuICpcbiAqIEZvby5wcm90b3R5cGUuYyA9IDM7XG4gKlxuICogXy5mb3JPd24obmV3IEZvbywgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICogICBjb25zb2xlLmxvZyhrZXkpO1xuICogfSk7XG4gKiAvLyA9PiBMb2dzICdhJyB0aGVuICdiJyAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKS5cbiAqL1xuZnVuY3Rpb24gZm9yT3duKG9iamVjdCwgaXRlcmF0ZWUpIHtcbiAgcmV0dXJuIG9iamVjdCAmJiBiYXNlRm9yT3duKG9iamVjdCwgY2FzdEZ1bmN0aW9uKGl0ZXJhdGVlKSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZvck93bjtcbiIsCiAgICAiLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5ndGAgd2hpY2ggZG9lc24ndCBjb2VyY2UgYXJndW1lbnRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb21wYXJlLlxuICogQHBhcmFtIHsqfSBvdGhlciBUaGUgb3RoZXIgdmFsdWUgdG8gY29tcGFyZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGdyZWF0ZXIgdGhhbiBgb3RoZXJgLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUd0KHZhbHVlLCBvdGhlcikge1xuICByZXR1cm4gdmFsdWUgPiBvdGhlcjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZUd0O1xuIiwKICAgICIvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmhhc2Agd2l0aG91dCBzdXBwb3J0IGZvciBkZWVwIHBhdGhzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdF0gVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7QXJyYXl8c3RyaW5nfSBrZXkgVGhlIGtleSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUhhcyhvYmplY3QsIGtleSkge1xuICByZXR1cm4gb2JqZWN0ICE9IG51bGwgJiYgaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VIYXM7XG4iLAogICAgImltcG9ydCBiYXNlSGFzIGZyb20gJy4vX2Jhc2VIYXMuanMnO1xuaW1wb3J0IGhhc1BhdGggZnJvbSAnLi9faGFzUGF0aC5qcyc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGBwYXRoYCBpcyBhIGRpcmVjdCBwcm9wZXJ0eSBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge0FycmF5fHN0cmluZ30gcGF0aCBUaGUgcGF0aCB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgcGF0aGAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICdhJzogeyAnYic6IDIgfSB9O1xuICogdmFyIG90aGVyID0gXy5jcmVhdGUoeyAnYSc6IF8uY3JlYXRlKHsgJ2InOiAyIH0pIH0pO1xuICpcbiAqIF8uaGFzKG9iamVjdCwgJ2EnKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmhhcyhvYmplY3QsICdhLmInKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmhhcyhvYmplY3QsIFsnYScsICdiJ10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaGFzKG90aGVyLCAnYScpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaGFzKG9iamVjdCwgcGF0aCkge1xuICByZXR1cm4gb2JqZWN0ICE9IG51bGwgJiYgaGFzUGF0aChvYmplY3QsIHBhdGgsIGJhc2VIYXMpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBoYXM7XG4iLAogICAgImltcG9ydCBiYXNlR2V0VGFnIGZyb20gJy4vX2Jhc2VHZXRUYWcuanMnO1xuaW1wb3J0IGlzQXJyYXkgZnJvbSAnLi9pc0FycmF5LmpzJztcbmltcG9ydCBpc09iamVjdExpa2UgZnJvbSAnLi9pc09iamVjdExpa2UuanMnO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgc3RyaW5nVGFnID0gJ1tvYmplY3QgU3RyaW5nXSc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBTdHJpbmdgIHByaW1pdGl2ZSBvciBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQHNpbmNlIDAuMS4wXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBzdHJpbmcsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1N0cmluZygnYWJjJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1N0cmluZygxKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZycgfHxcbiAgICAoIWlzQXJyYXkodmFsdWUpICYmIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgYmFzZUdldFRhZyh2YWx1ZSkgPT0gc3RyaW5nVGFnKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaXNTdHJpbmc7XG4iLAogICAgImltcG9ydCBhcnJheU1hcCBmcm9tICcuL19hcnJheU1hcC5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udmFsdWVzYCBhbmQgYF8udmFsdWVzSW5gIHdoaWNoIGNyZWF0ZXMgYW5cbiAqIGFycmF5IG9mIGBvYmplY3RgIHByb3BlcnR5IHZhbHVlcyBjb3JyZXNwb25kaW5nIHRvIHRoZSBwcm9wZXJ0eSBuYW1lc1xuICogb2YgYHByb3BzYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtBcnJheX0gcHJvcHMgVGhlIHByb3BlcnR5IG5hbWVzIHRvIGdldCB2YWx1ZXMgZm9yLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgdmFsdWVzLlxuICovXG5mdW5jdGlvbiBiYXNlVmFsdWVzKG9iamVjdCwgcHJvcHMpIHtcbiAgcmV0dXJuIGFycmF5TWFwKHByb3BzLCBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gb2JqZWN0W2tleV07XG4gIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlVmFsdWVzO1xuIiwKICAgICJpbXBvcnQgYmFzZVZhbHVlcyBmcm9tICcuL19iYXNlVmFsdWVzLmpzJztcbmltcG9ydCBrZXlzIGZyb20gJy4va2V5cy5qcyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGVudW1lcmFibGUgc3RyaW5nIGtleWVkIHByb3BlcnR5IHZhbHVlcyBvZiBgb2JqZWN0YC5cbiAqXG4gKiAqKk5vdGU6KiogTm9uLW9iamVjdCB2YWx1ZXMgYXJlIGNvZXJjZWQgdG8gb2JqZWN0cy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IHZhbHVlcy5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogICB0aGlzLmIgPSAyO1xuICogfVxuICpcbiAqIEZvby5wcm90b3R5cGUuYyA9IDM7XG4gKlxuICogXy52YWx1ZXMobmV3IEZvbyk7XG4gKiAvLyA9PiBbMSwgMl0gKGl0ZXJhdGlvbiBvcmRlciBpcyBub3QgZ3VhcmFudGVlZClcbiAqXG4gKiBfLnZhbHVlcygnaGknKTtcbiAqIC8vID0+IFsnaCcsICdpJ11cbiAqL1xuZnVuY3Rpb24gdmFsdWVzKG9iamVjdCkge1xuICByZXR1cm4gb2JqZWN0ID09IG51bGwgPyBbXSA6IGJhc2VWYWx1ZXMob2JqZWN0LCBrZXlzKG9iamVjdCkpO1xufVxuXG5leHBvcnQgZGVmYXVsdCB2YWx1ZXM7XG4iLAogICAgImltcG9ydCBiYXNlS2V5cyBmcm9tICcuL19iYXNlS2V5cy5qcyc7XG5pbXBvcnQgZ2V0VGFnIGZyb20gJy4vX2dldFRhZy5qcyc7XG5pbXBvcnQgaXNBcmd1bWVudHMgZnJvbSAnLi9pc0FyZ3VtZW50cy5qcyc7XG5pbXBvcnQgaXNBcnJheSBmcm9tICcuL2lzQXJyYXkuanMnO1xuaW1wb3J0IGlzQXJyYXlMaWtlIGZyb20gJy4vaXNBcnJheUxpa2UuanMnO1xuaW1wb3J0IGlzQnVmZmVyIGZyb20gJy4vaXNCdWZmZXIuanMnO1xuaW1wb3J0IGlzUHJvdG90eXBlIGZyb20gJy4vX2lzUHJvdG90eXBlLmpzJztcbmltcG9ydCBpc1R5cGVkQXJyYXkgZnJvbSAnLi9pc1R5cGVkQXJyYXkuanMnO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgbWFwVGFnID0gJ1tvYmplY3QgTWFwXScsXG4gICAgc2V0VGFnID0gJ1tvYmplY3QgU2V0XSc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYW4gZW1wdHkgb2JqZWN0LCBjb2xsZWN0aW9uLCBtYXAsIG9yIHNldC5cbiAqXG4gKiBPYmplY3RzIGFyZSBjb25zaWRlcmVkIGVtcHR5IGlmIHRoZXkgaGF2ZSBubyBvd24gZW51bWVyYWJsZSBzdHJpbmcga2V5ZWRcbiAqIHByb3BlcnRpZXMuXG4gKlxuICogQXJyYXktbGlrZSB2YWx1ZXMgc3VjaCBhcyBgYXJndW1lbnRzYCBvYmplY3RzLCBhcnJheXMsIGJ1ZmZlcnMsIHN0cmluZ3MsIG9yXG4gKiBqUXVlcnktbGlrZSBjb2xsZWN0aW9ucyBhcmUgY29uc2lkZXJlZCBlbXB0eSBpZiB0aGV5IGhhdmUgYSBgbGVuZ3RoYCBvZiBgMGAuXG4gKiBTaW1pbGFybHksIG1hcHMgYW5kIHNldHMgYXJlIGNvbnNpZGVyZWQgZW1wdHkgaWYgdGhleSBoYXZlIGEgYHNpemVgIG9mIGAwYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBlbXB0eSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzRW1wdHkobnVsbCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0VtcHR5KHRydWUpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNFbXB0eSgxKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzRW1wdHkoWzEsIDIsIDNdKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0VtcHR5KHsgJ2EnOiAxIH0pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChpc0FycmF5TGlrZSh2YWx1ZSkgJiZcbiAgICAgIChpc0FycmF5KHZhbHVlKSB8fCB0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZycgfHwgdHlwZW9mIHZhbHVlLnNwbGljZSA9PSAnZnVuY3Rpb24nIHx8XG4gICAgICAgIGlzQnVmZmVyKHZhbHVlKSB8fCBpc1R5cGVkQXJyYXkodmFsdWUpIHx8IGlzQXJndW1lbnRzKHZhbHVlKSkpIHtcbiAgICByZXR1cm4gIXZhbHVlLmxlbmd0aDtcbiAgfVxuICB2YXIgdGFnID0gZ2V0VGFnKHZhbHVlKTtcbiAgaWYgKHRhZyA9PSBtYXBUYWcgfHwgdGFnID09IHNldFRhZykge1xuICAgIHJldHVybiAhdmFsdWUuc2l6ZTtcbiAgfVxuICBpZiAoaXNQcm90b3R5cGUodmFsdWUpKSB7XG4gICAgcmV0dXJuICFiYXNlS2V5cyh2YWx1ZSkubGVuZ3RoO1xuICB9XG4gIGZvciAodmFyIGtleSBpbiB2YWx1ZSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBrZXkpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc0VtcHR5O1xuIiwKICAgICIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGB1bmRlZmluZWRgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGB1bmRlZmluZWRgLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNVbmRlZmluZWQodm9pZCAwKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzVW5kZWZpbmVkKG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzVW5kZWZpbmVkO1xuIiwKICAgICIvKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmx0YCB3aGljaCBkb2Vzbid0IGNvZXJjZSBhcmd1bWVudHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0geyp9IG90aGVyIFRoZSBvdGhlciB2YWx1ZSB0byBjb21wYXJlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgbGVzcyB0aGFuIGBvdGhlcmAsXG4gKiAgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlTHQodmFsdWUsIG90aGVyKSB7XG4gIHJldHVybiB2YWx1ZSA8IG90aGVyO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlTHQ7XG4iLAogICAgImltcG9ydCBiYXNlQXNzaWduVmFsdWUgZnJvbSAnLi9fYmFzZUFzc2lnblZhbHVlLmpzJztcbmltcG9ydCBiYXNlRm9yT3duIGZyb20gJy4vX2Jhc2VGb3JPd24uanMnO1xuaW1wb3J0IGJhc2VJdGVyYXRlZSBmcm9tICcuL19iYXNlSXRlcmF0ZWUuanMnO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gb2JqZWN0IHdpdGggdGhlIHNhbWUga2V5cyBhcyBgb2JqZWN0YCBhbmQgdmFsdWVzIGdlbmVyYXRlZFxuICogYnkgcnVubmluZyBlYWNoIG93biBlbnVtZXJhYmxlIHN0cmluZyBrZXllZCBwcm9wZXJ0eSBvZiBgb2JqZWN0YCB0aHJ1XG4gKiBgaXRlcmF0ZWVgLiBUaGUgaXRlcmF0ZWUgaXMgaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50czpcbiAqICh2YWx1ZSwga2V5LCBvYmplY3QpLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMi40LjBcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbaXRlcmF0ZWU9Xy5pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIG5ldyBtYXBwZWQgb2JqZWN0LlxuICogQHNlZSBfLm1hcEtleXNcbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIHVzZXJzID0ge1xuICogICAnZnJlZCc6ICAgIHsgJ3VzZXInOiAnZnJlZCcsICAgICdhZ2UnOiA0MCB9LFxuICogICAncGViYmxlcyc6IHsgJ3VzZXInOiAncGViYmxlcycsICdhZ2UnOiAxIH1cbiAqIH07XG4gKlxuICogXy5tYXBWYWx1ZXModXNlcnMsIGZ1bmN0aW9uKG8pIHsgcmV0dXJuIG8uYWdlOyB9KTtcbiAqIC8vID0+IHsgJ2ZyZWQnOiA0MCwgJ3BlYmJsZXMnOiAxIH0gKGl0ZXJhdGlvbiBvcmRlciBpcyBub3QgZ3VhcmFudGVlZClcbiAqXG4gKiAvLyBUaGUgYF8ucHJvcGVydHlgIGl0ZXJhdGVlIHNob3J0aGFuZC5cbiAqIF8ubWFwVmFsdWVzKHVzZXJzLCAnYWdlJyk7XG4gKiAvLyA9PiB7ICdmcmVkJzogNDAsICdwZWJibGVzJzogMSB9IChpdGVyYXRpb24gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQpXG4gKi9cbmZ1bmN0aW9uIG1hcFZhbHVlcyhvYmplY3QsIGl0ZXJhdGVlKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgaXRlcmF0ZWUgPSBiYXNlSXRlcmF0ZWUoaXRlcmF0ZWUsIDMpO1xuXG4gIGJhc2VGb3JPd24ob2JqZWN0LCBmdW5jdGlvbih2YWx1ZSwga2V5LCBvYmplY3QpIHtcbiAgICBiYXNlQXNzaWduVmFsdWUocmVzdWx0LCBrZXksIGl0ZXJhdGVlKHZhbHVlLCBrZXksIG9iamVjdCkpO1xuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbWFwVmFsdWVzO1xuIiwKICAgICJpbXBvcnQgaXNTeW1ib2wgZnJvbSAnLi9pc1N5bWJvbC5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgbWV0aG9kcyBsaWtlIGBfLm1heGAgYW5kIGBfLm1pbmAgd2hpY2ggYWNjZXB0cyBhXG4gKiBgY29tcGFyYXRvcmAgdG8gZGV0ZXJtaW5lIHRoZSBleHRyZW11bSB2YWx1ZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBpdGVyYXRlZSBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjb21wYXJhdG9yIFRoZSBjb21wYXJhdG9yIHVzZWQgdG8gY29tcGFyZSB2YWx1ZXMuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZXh0cmVtdW0gdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGJhc2VFeHRyZW11bShhcnJheSwgaXRlcmF0ZWUsIGNvbXBhcmF0b3IpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgdmFsdWUgPSBhcnJheVtpbmRleF0sXG4gICAgICAgIGN1cnJlbnQgPSBpdGVyYXRlZSh2YWx1ZSk7XG5cbiAgICBpZiAoY3VycmVudCAhPSBudWxsICYmIChjb21wdXRlZCA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgPyAoY3VycmVudCA9PT0gY3VycmVudCAmJiAhaXNTeW1ib2woY3VycmVudCkpXG4gICAgICAgICAgOiBjb21wYXJhdG9yKGN1cnJlbnQsIGNvbXB1dGVkKVxuICAgICAgICApKSB7XG4gICAgICB2YXIgY29tcHV0ZWQgPSBjdXJyZW50LFxuICAgICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlRXh0cmVtdW07XG4iLAogICAgImltcG9ydCBiYXNlRXh0cmVtdW0gZnJvbSAnLi9fYmFzZUV4dHJlbXVtLmpzJztcbmltcG9ydCBiYXNlR3QgZnJvbSAnLi9fYmFzZUd0LmpzJztcbmltcG9ydCBpZGVudGl0eSBmcm9tICcuL2lkZW50aXR5LmpzJztcblxuLyoqXG4gKiBDb21wdXRlcyB0aGUgbWF4aW11bSB2YWx1ZSBvZiBgYXJyYXlgLiBJZiBgYXJyYXlgIGlzIGVtcHR5IG9yIGZhbHNleSxcbiAqIGB1bmRlZmluZWRgIGlzIHJldHVybmVkLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBNYXRoXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIG1heGltdW0gdmFsdWUuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8ubWF4KFs0LCAyLCA4LCA2XSk7XG4gKiAvLyA9PiA4XG4gKlxuICogXy5tYXgoW10pO1xuICogLy8gPT4gdW5kZWZpbmVkXG4gKi9cbmZ1bmN0aW9uIG1heChhcnJheSkge1xuICByZXR1cm4gKGFycmF5ICYmIGFycmF5Lmxlbmd0aClcbiAgICA/IGJhc2VFeHRyZW11bShhcnJheSwgaWRlbnRpdHksIGJhc2VHdClcbiAgICA6IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbWF4O1xuIiwKICAgICJpbXBvcnQgYmFzZU1lcmdlIGZyb20gJy4vX2Jhc2VNZXJnZS5qcyc7XG5pbXBvcnQgY3JlYXRlQXNzaWduZXIgZnJvbSAnLi9fY3JlYXRlQXNzaWduZXIuanMnO1xuXG4vKipcbiAqIFRoaXMgbWV0aG9kIGlzIGxpa2UgYF8uYXNzaWduYCBleGNlcHQgdGhhdCBpdCByZWN1cnNpdmVseSBtZXJnZXMgb3duIGFuZFxuICogaW5oZXJpdGVkIGVudW1lcmFibGUgc3RyaW5nIGtleWVkIHByb3BlcnRpZXMgb2Ygc291cmNlIG9iamVjdHMgaW50byB0aGVcbiAqIGRlc3RpbmF0aW9uIG9iamVjdC4gU291cmNlIHByb3BlcnRpZXMgdGhhdCByZXNvbHZlIHRvIGB1bmRlZmluZWRgIGFyZVxuICogc2tpcHBlZCBpZiBhIGRlc3RpbmF0aW9uIHZhbHVlIGV4aXN0cy4gQXJyYXkgYW5kIHBsYWluIG9iamVjdCBwcm9wZXJ0aWVzXG4gKiBhcmUgbWVyZ2VkIHJlY3Vyc2l2ZWx5LiBPdGhlciBvYmplY3RzIGFuZCB2YWx1ZSB0eXBlcyBhcmUgb3ZlcnJpZGRlbiBieVxuICogYXNzaWdubWVudC4gU291cmNlIG9iamVjdHMgYXJlIGFwcGxpZWQgZnJvbSBsZWZ0IHRvIHJpZ2h0LiBTdWJzZXF1ZW50XG4gKiBzb3VyY2VzIG92ZXJ3cml0ZSBwcm9wZXJ0eSBhc3NpZ25tZW50cyBvZiBwcmV2aW91cyBzb3VyY2VzLlxuICpcbiAqICoqTm90ZToqKiBUaGlzIG1ldGhvZCBtdXRhdGVzIGBvYmplY3RgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC41LjBcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAqIEBwYXJhbSB7Li4uT2JqZWN0fSBbc291cmNlc10gVGhlIHNvdXJjZSBvYmplY3RzLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHtcbiAqICAgJ2EnOiBbeyAnYic6IDIgfSwgeyAnZCc6IDQgfV1cbiAqIH07XG4gKlxuICogdmFyIG90aGVyID0ge1xuICogICAnYSc6IFt7ICdjJzogMyB9LCB7ICdlJzogNSB9XVxuICogfTtcbiAqXG4gKiBfLm1lcmdlKG9iamVjdCwgb3RoZXIpO1xuICogLy8gPT4geyAnYSc6IFt7ICdiJzogMiwgJ2MnOiAzIH0sIHsgJ2QnOiA0LCAnZSc6IDUgfV0gfVxuICovXG52YXIgbWVyZ2UgPSBjcmVhdGVBc3NpZ25lcihmdW5jdGlvbihvYmplY3QsIHNvdXJjZSwgc3JjSW5kZXgpIHtcbiAgYmFzZU1lcmdlKG9iamVjdCwgc291cmNlLCBzcmNJbmRleCk7XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgbWVyZ2U7XG4iLAogICAgImltcG9ydCBiYXNlRXh0cmVtdW0gZnJvbSAnLi9fYmFzZUV4dHJlbXVtLmpzJztcbmltcG9ydCBiYXNlTHQgZnJvbSAnLi9fYmFzZUx0LmpzJztcbmltcG9ydCBpZGVudGl0eSBmcm9tICcuL2lkZW50aXR5LmpzJztcblxuLyoqXG4gKiBDb21wdXRlcyB0aGUgbWluaW11bSB2YWx1ZSBvZiBgYXJyYXlgLiBJZiBgYXJyYXlgIGlzIGVtcHR5IG9yIGZhbHNleSxcbiAqIGB1bmRlZmluZWRgIGlzIHJldHVybmVkLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBNYXRoXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIG1pbmltdW0gdmFsdWUuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8ubWluKFs0LCAyLCA4LCA2XSk7XG4gKiAvLyA9PiAyXG4gKlxuICogXy5taW4oW10pO1xuICogLy8gPT4gdW5kZWZpbmVkXG4gKi9cbmZ1bmN0aW9uIG1pbihhcnJheSkge1xuICByZXR1cm4gKGFycmF5ICYmIGFycmF5Lmxlbmd0aClcbiAgICA/IGJhc2VFeHRyZW11bShhcnJheSwgaWRlbnRpdHksIGJhc2VMdClcbiAgICA6IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbWluO1xuIiwKICAgICJpbXBvcnQgYmFzZUV4dHJlbXVtIGZyb20gJy4vX2Jhc2VFeHRyZW11bS5qcyc7XG5pbXBvcnQgYmFzZUl0ZXJhdGVlIGZyb20gJy4vX2Jhc2VJdGVyYXRlZS5qcyc7XG5pbXBvcnQgYmFzZUx0IGZyb20gJy4vX2Jhc2VMdC5qcyc7XG5cbi8qKlxuICogVGhpcyBtZXRob2QgaXMgbGlrZSBgXy5taW5gIGV4Y2VwdCB0aGF0IGl0IGFjY2VwdHMgYGl0ZXJhdGVlYCB3aGljaCBpc1xuICogaW52b2tlZCBmb3IgZWFjaCBlbGVtZW50IGluIGBhcnJheWAgdG8gZ2VuZXJhdGUgdGhlIGNyaXRlcmlvbiBieSB3aGljaFxuICogdGhlIHZhbHVlIGlzIHJhbmtlZC4gVGhlIGl0ZXJhdGVlIGlzIGludm9rZWQgd2l0aCBvbmUgYXJndW1lbnQ6ICh2YWx1ZSkuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IE1hdGhcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbaXRlcmF0ZWU9Xy5pZGVudGl0eV0gVGhlIGl0ZXJhdGVlIGludm9rZWQgcGVyIGVsZW1lbnQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgbWluaW11bSB2YWx1ZS5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdHMgPSBbeyAnbic6IDEgfSwgeyAnbic6IDIgfV07XG4gKlxuICogXy5taW5CeShvYmplY3RzLCBmdW5jdGlvbihvKSB7IHJldHVybiBvLm47IH0pO1xuICogLy8gPT4geyAnbic6IDEgfVxuICpcbiAqIC8vIFRoZSBgXy5wcm9wZXJ0eWAgaXRlcmF0ZWUgc2hvcnRoYW5kLlxuICogXy5taW5CeShvYmplY3RzLCAnbicpO1xuICogLy8gPT4geyAnbic6IDEgfVxuICovXG5mdW5jdGlvbiBtaW5CeShhcnJheSwgaXRlcmF0ZWUpIHtcbiAgcmV0dXJuIChhcnJheSAmJiBhcnJheS5sZW5ndGgpXG4gICAgPyBiYXNlRXh0cmVtdW0oYXJyYXksIGJhc2VJdGVyYXRlZShpdGVyYXRlZSwgMiksIGJhc2VMdClcbiAgICA6IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbWluQnk7XG4iLAogICAgImltcG9ydCBhc3NpZ25WYWx1ZSBmcm9tICcuL19hc3NpZ25WYWx1ZS5qcyc7XG5pbXBvcnQgY2FzdFBhdGggZnJvbSAnLi9fY2FzdFBhdGguanMnO1xuaW1wb3J0IGlzSW5kZXggZnJvbSAnLi9faXNJbmRleC5qcyc7XG5pbXBvcnQgaXNPYmplY3QgZnJvbSAnLi9pc09iamVjdC5qcyc7XG5pbXBvcnQgdG9LZXkgZnJvbSAnLi9fdG9LZXkuanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnNldGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge0FycmF5fHN0cmluZ30gcGF0aCBUaGUgcGF0aCBvZiB0aGUgcHJvcGVydHkgdG8gc2V0LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgcGF0aCBjcmVhdGlvbi5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VTZXQob2JqZWN0LCBwYXRoLCB2YWx1ZSwgY3VzdG9taXplcikge1xuICBpZiAoIWlzT2JqZWN0KG9iamVjdCkpIHtcbiAgICByZXR1cm4gb2JqZWN0O1xuICB9XG4gIHBhdGggPSBjYXN0UGF0aChwYXRoLCBvYmplY3QpO1xuXG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gcGF0aC5sZW5ndGgsXG4gICAgICBsYXN0SW5kZXggPSBsZW5ndGggLSAxLFxuICAgICAgbmVzdGVkID0gb2JqZWN0O1xuXG4gIHdoaWxlIChuZXN0ZWQgIT0gbnVsbCAmJiArK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGtleSA9IHRvS2V5KHBhdGhbaW5kZXhdKSxcbiAgICAgICAgbmV3VmFsdWUgPSB2YWx1ZTtcblxuICAgIGlmIChrZXkgPT09ICdfX3Byb3RvX18nIHx8IGtleSA9PT0gJ2NvbnN0cnVjdG9yJyB8fCBrZXkgPT09ICdwcm90b3R5cGUnKSB7XG4gICAgICByZXR1cm4gb2JqZWN0O1xuICAgIH1cblxuICAgIGlmIChpbmRleCAhPSBsYXN0SW5kZXgpIHtcbiAgICAgIHZhciBvYmpWYWx1ZSA9IG5lc3RlZFtrZXldO1xuICAgICAgbmV3VmFsdWUgPSBjdXN0b21pemVyID8gY3VzdG9taXplcihvYmpWYWx1ZSwga2V5LCBuZXN0ZWQpIDogdW5kZWZpbmVkO1xuICAgICAgaWYgKG5ld1ZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgbmV3VmFsdWUgPSBpc09iamVjdChvYmpWYWx1ZSlcbiAgICAgICAgICA/IG9ialZhbHVlXG4gICAgICAgICAgOiAoaXNJbmRleChwYXRoW2luZGV4ICsgMV0pID8gW10gOiB7fSk7XG4gICAgICB9XG4gICAgfVxuICAgIGFzc2lnblZhbHVlKG5lc3RlZCwga2V5LCBuZXdWYWx1ZSk7XG4gICAgbmVzdGVkID0gbmVzdGVkW2tleV07XG4gIH1cbiAgcmV0dXJuIG9iamVjdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZVNldDtcbiIsCiAgICAiaW1wb3J0IGJhc2VHZXQgZnJvbSAnLi9fYmFzZUdldC5qcyc7XG5pbXBvcnQgYmFzZVNldCBmcm9tICcuL19iYXNlU2V0LmpzJztcbmltcG9ydCBjYXN0UGF0aCBmcm9tICcuL19jYXN0UGF0aC5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgIGBfLnBpY2tCeWAgd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBzb3VyY2Ugb2JqZWN0LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gcGF0aHMgVGhlIHByb3BlcnR5IHBhdGhzIHRvIHBpY2suXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBwcmVkaWNhdGUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIHByb3BlcnR5LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgbmV3IG9iamVjdC5cbiAqL1xuZnVuY3Rpb24gYmFzZVBpY2tCeShvYmplY3QsIHBhdGhzLCBwcmVkaWNhdGUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBwYXRocy5sZW5ndGgsXG4gICAgICByZXN1bHQgPSB7fTtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBwYXRoID0gcGF0aHNbaW5kZXhdLFxuICAgICAgICB2YWx1ZSA9IGJhc2VHZXQob2JqZWN0LCBwYXRoKTtcblxuICAgIGlmIChwcmVkaWNhdGUodmFsdWUsIHBhdGgpKSB7XG4gICAgICBiYXNlU2V0KHJlc3VsdCwgY2FzdFBhdGgocGF0aCwgb2JqZWN0KSwgdmFsdWUpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlUGlja0J5O1xuIiwKICAgICIvKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnNvcnRCeWAgd2hpY2ggdXNlcyBgY29tcGFyZXJgIHRvIGRlZmluZSB0aGVcbiAqIHNvcnQgb3JkZXIgb2YgYGFycmF5YCBhbmQgcmVwbGFjZXMgY3JpdGVyaWEgb2JqZWN0cyB3aXRoIHRoZWlyIGNvcnJlc3BvbmRpbmdcbiAqIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIHNvcnQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjb21wYXJlciBUaGUgZnVuY3Rpb24gdG8gZGVmaW5lIHNvcnQgb3JkZXIuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYGFycmF5YC5cbiAqL1xuZnVuY3Rpb24gYmFzZVNvcnRCeShhcnJheSwgY29tcGFyZXIpIHtcbiAgdmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcblxuICBhcnJheS5zb3J0KGNvbXBhcmVyKTtcbiAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgYXJyYXlbbGVuZ3RoXSA9IGFycmF5W2xlbmd0aF0udmFsdWU7XG4gIH1cbiAgcmV0dXJuIGFycmF5O1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlU29ydEJ5O1xuIiwKICAgICJpbXBvcnQgaXNTeW1ib2wgZnJvbSAnLi9pc1N5bWJvbC5qcyc7XG5cbi8qKlxuICogQ29tcGFyZXMgdmFsdWVzIHRvIHNvcnQgdGhlbSBpbiBhc2NlbmRpbmcgb3JkZXIuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0geyp9IG90aGVyIFRoZSBvdGhlciB2YWx1ZSB0byBjb21wYXJlLlxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgc29ydCBvcmRlciBpbmRpY2F0b3IgZm9yIGB2YWx1ZWAuXG4gKi9cbmZ1bmN0aW9uIGNvbXBhcmVBc2NlbmRpbmcodmFsdWUsIG90aGVyKSB7XG4gIGlmICh2YWx1ZSAhPT0gb3RoZXIpIHtcbiAgICB2YXIgdmFsSXNEZWZpbmVkID0gdmFsdWUgIT09IHVuZGVmaW5lZCxcbiAgICAgICAgdmFsSXNOdWxsID0gdmFsdWUgPT09IG51bGwsXG4gICAgICAgIHZhbElzUmVmbGV4aXZlID0gdmFsdWUgPT09IHZhbHVlLFxuICAgICAgICB2YWxJc1N5bWJvbCA9IGlzU3ltYm9sKHZhbHVlKTtcblxuICAgIHZhciBvdGhJc0RlZmluZWQgPSBvdGhlciAhPT0gdW5kZWZpbmVkLFxuICAgICAgICBvdGhJc051bGwgPSBvdGhlciA9PT0gbnVsbCxcbiAgICAgICAgb3RoSXNSZWZsZXhpdmUgPSBvdGhlciA9PT0gb3RoZXIsXG4gICAgICAgIG90aElzU3ltYm9sID0gaXNTeW1ib2wob3RoZXIpO1xuXG4gICAgaWYgKCghb3RoSXNOdWxsICYmICFvdGhJc1N5bWJvbCAmJiAhdmFsSXNTeW1ib2wgJiYgdmFsdWUgPiBvdGhlcikgfHxcbiAgICAgICAgKHZhbElzU3ltYm9sICYmIG90aElzRGVmaW5lZCAmJiBvdGhJc1JlZmxleGl2ZSAmJiAhb3RoSXNOdWxsICYmICFvdGhJc1N5bWJvbCkgfHxcbiAgICAgICAgKHZhbElzTnVsbCAmJiBvdGhJc0RlZmluZWQgJiYgb3RoSXNSZWZsZXhpdmUpIHx8XG4gICAgICAgICghdmFsSXNEZWZpbmVkICYmIG90aElzUmVmbGV4aXZlKSB8fFxuICAgICAgICAhdmFsSXNSZWZsZXhpdmUpIHtcbiAgICAgIHJldHVybiAxO1xuICAgIH1cbiAgICBpZiAoKCF2YWxJc051bGwgJiYgIXZhbElzU3ltYm9sICYmICFvdGhJc1N5bWJvbCAmJiB2YWx1ZSA8IG90aGVyKSB8fFxuICAgICAgICAob3RoSXNTeW1ib2wgJiYgdmFsSXNEZWZpbmVkICYmIHZhbElzUmVmbGV4aXZlICYmICF2YWxJc051bGwgJiYgIXZhbElzU3ltYm9sKSB8fFxuICAgICAgICAob3RoSXNOdWxsICYmIHZhbElzRGVmaW5lZCAmJiB2YWxJc1JlZmxleGl2ZSkgfHxcbiAgICAgICAgKCFvdGhJc0RlZmluZWQgJiYgdmFsSXNSZWZsZXhpdmUpIHx8XG4gICAgICAgICFvdGhJc1JlZmxleGl2ZSkge1xuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbiAgfVxuICByZXR1cm4gMDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY29tcGFyZUFzY2VuZGluZztcbiIsCiAgICAiaW1wb3J0IGNvbXBhcmVBc2NlbmRpbmcgZnJvbSAnLi9fY29tcGFyZUFzY2VuZGluZy5qcyc7XG5cbi8qKlxuICogVXNlZCBieSBgXy5vcmRlckJ5YCB0byBjb21wYXJlIG11bHRpcGxlIHByb3BlcnRpZXMgb2YgYSB2YWx1ZSB0byBhbm90aGVyXG4gKiBhbmQgc3RhYmxlIHNvcnQgdGhlbS5cbiAqXG4gKiBJZiBgb3JkZXJzYCBpcyB1bnNwZWNpZmllZCwgYWxsIHZhbHVlcyBhcmUgc29ydGVkIGluIGFzY2VuZGluZyBvcmRlci4gT3RoZXJ3aXNlLFxuICogc3BlY2lmeSBhbiBvcmRlciBvZiBcImRlc2NcIiBmb3IgZGVzY2VuZGluZyBvciBcImFzY1wiIGZvciBhc2NlbmRpbmcgc29ydCBvcmRlclxuICogb2YgY29ycmVzcG9uZGluZyB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBjb21wYXJlLlxuICogQHBhcmFtIHtPYmplY3R9IG90aGVyIFRoZSBvdGhlciBvYmplY3QgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbltdfHN0cmluZ1tdfSBvcmRlcnMgVGhlIG9yZGVyIHRvIHNvcnQgYnkgZm9yIGVhY2ggcHJvcGVydHkuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBzb3J0IG9yZGVyIGluZGljYXRvciBmb3IgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGNvbXBhcmVNdWx0aXBsZShvYmplY3QsIG90aGVyLCBvcmRlcnMpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBvYmpDcml0ZXJpYSA9IG9iamVjdC5jcml0ZXJpYSxcbiAgICAgIG90aENyaXRlcmlhID0gb3RoZXIuY3JpdGVyaWEsXG4gICAgICBsZW5ndGggPSBvYmpDcml0ZXJpYS5sZW5ndGgsXG4gICAgICBvcmRlcnNMZW5ndGggPSBvcmRlcnMubGVuZ3RoO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIHJlc3VsdCA9IGNvbXBhcmVBc2NlbmRpbmcob2JqQ3JpdGVyaWFbaW5kZXhdLCBvdGhDcml0ZXJpYVtpbmRleF0pO1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIGlmIChpbmRleCA+PSBvcmRlcnNMZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICAgIHZhciBvcmRlciA9IG9yZGVyc1tpbmRleF07XG4gICAgICByZXR1cm4gcmVzdWx0ICogKG9yZGVyID09ICdkZXNjJyA/IC0xIDogMSk7XG4gICAgfVxuICB9XG4gIC8vIEZpeGVzIGFuIGBBcnJheSNzb3J0YCBidWcgaW4gdGhlIEpTIGVuZ2luZSBlbWJlZGRlZCBpbiBBZG9iZSBhcHBsaWNhdGlvbnNcbiAgLy8gdGhhdCBjYXVzZXMgaXQsIHVuZGVyIGNlcnRhaW4gY2lyY3Vtc3RhbmNlcywgdG8gcHJvdmlkZSB0aGUgc2FtZSB2YWx1ZSBmb3JcbiAgLy8gYG9iamVjdGAgYW5kIGBvdGhlcmAuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vamFzaGtlbmFzL3VuZGVyc2NvcmUvcHVsbC8xMjQ3XG4gIC8vIGZvciBtb3JlIGRldGFpbHMuXG4gIC8vXG4gIC8vIFRoaXMgYWxzbyBlbnN1cmVzIGEgc3RhYmxlIHNvcnQgaW4gVjggYW5kIG90aGVyIGVuZ2luZXMuXG4gIC8vIFNlZSBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvdjgvaXNzdWVzL2RldGFpbD9pZD05MCBmb3IgbW9yZSBkZXRhaWxzLlxuICByZXR1cm4gb2JqZWN0LmluZGV4IC0gb3RoZXIuaW5kZXg7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNvbXBhcmVNdWx0aXBsZTtcbiIsCiAgICAiaW1wb3J0IGFycmF5TWFwIGZyb20gJy4vX2FycmF5TWFwLmpzJztcbmltcG9ydCBiYXNlR2V0IGZyb20gJy4vX2Jhc2VHZXQuanMnO1xuaW1wb3J0IGJhc2VJdGVyYXRlZSBmcm9tICcuL19iYXNlSXRlcmF0ZWUuanMnO1xuaW1wb3J0IGJhc2VNYXAgZnJvbSAnLi9fYmFzZU1hcC5qcyc7XG5pbXBvcnQgYmFzZVNvcnRCeSBmcm9tICcuL19iYXNlU29ydEJ5LmpzJztcbmltcG9ydCBiYXNlVW5hcnkgZnJvbSAnLi9fYmFzZVVuYXJ5LmpzJztcbmltcG9ydCBjb21wYXJlTXVsdGlwbGUgZnJvbSAnLi9fY29tcGFyZU11bHRpcGxlLmpzJztcbmltcG9ydCBpZGVudGl0eSBmcm9tICcuL2lkZW50aXR5LmpzJztcbmltcG9ydCBpc0FycmF5IGZyb20gJy4vaXNBcnJheS5qcyc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ub3JkZXJCeWAgd2l0aG91dCBwYXJhbSBndWFyZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb25bXXxPYmplY3RbXXxzdHJpbmdbXX0gaXRlcmF0ZWVzIFRoZSBpdGVyYXRlZXMgdG8gc29ydCBieS5cbiAqIEBwYXJhbSB7c3RyaW5nW119IG9yZGVycyBUaGUgc29ydCBvcmRlcnMgb2YgYGl0ZXJhdGVlc2AuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIG5ldyBzb3J0ZWQgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGJhc2VPcmRlckJ5KGNvbGxlY3Rpb24sIGl0ZXJhdGVlcywgb3JkZXJzKSB7XG4gIGlmIChpdGVyYXRlZXMubGVuZ3RoKSB7XG4gICAgaXRlcmF0ZWVzID0gYXJyYXlNYXAoaXRlcmF0ZWVzLCBmdW5jdGlvbihpdGVyYXRlZSkge1xuICAgICAgaWYgKGlzQXJyYXkoaXRlcmF0ZWUpKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIHJldHVybiBiYXNlR2V0KHZhbHVlLCBpdGVyYXRlZS5sZW5ndGggPT09IDEgPyBpdGVyYXRlZVswXSA6IGl0ZXJhdGVlKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpdGVyYXRlZTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBpdGVyYXRlZXMgPSBbaWRlbnRpdHldO1xuICB9XG5cbiAgdmFyIGluZGV4ID0gLTE7XG4gIGl0ZXJhdGVlcyA9IGFycmF5TWFwKGl0ZXJhdGVlcywgYmFzZVVuYXJ5KGJhc2VJdGVyYXRlZSkpO1xuXG4gIHZhciByZXN1bHQgPSBiYXNlTWFwKGNvbGxlY3Rpb24sIGZ1bmN0aW9uKHZhbHVlLCBrZXksIGNvbGxlY3Rpb24pIHtcbiAgICB2YXIgY3JpdGVyaWEgPSBhcnJheU1hcChpdGVyYXRlZXMsIGZ1bmN0aW9uKGl0ZXJhdGVlKSB7XG4gICAgICByZXR1cm4gaXRlcmF0ZWUodmFsdWUpO1xuICAgIH0pO1xuICAgIHJldHVybiB7ICdjcml0ZXJpYSc6IGNyaXRlcmlhLCAnaW5kZXgnOiArK2luZGV4LCAndmFsdWUnOiB2YWx1ZSB9O1xuICB9KTtcblxuICByZXR1cm4gYmFzZVNvcnRCeShyZXN1bHQsIGZ1bmN0aW9uKG9iamVjdCwgb3RoZXIpIHtcbiAgICByZXR1cm4gY29tcGFyZU11bHRpcGxlKG9iamVjdCwgb3RoZXIsIG9yZGVycyk7XG4gIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlT3JkZXJCeTtcbiIsCiAgICAiaW1wb3J0IGJhc2VQcm9wZXJ0eSBmcm9tICcuL19iYXNlUHJvcGVydHkuanMnO1xuXG4vKipcbiAqIEdldHMgdGhlIHNpemUgb2YgYW4gQVNDSUkgYHN0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgVGhlIHN0cmluZyBpbnNwZWN0LlxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgc3RyaW5nIHNpemUuXG4gKi9cbnZhciBhc2NpaVNpemUgPSBiYXNlUHJvcGVydHkoJ2xlbmd0aCcpO1xuXG5leHBvcnQgZGVmYXVsdCBhc2NpaVNpemU7XG4iLAogICAgIi8qKiBVc2VkIHRvIGNvbXBvc2UgdW5pY29kZSBjaGFyYWN0ZXIgY2xhc3Nlcy4gKi9cbnZhciByc0FzdHJhbFJhbmdlID0gJ1xcXFx1ZDgwMC1cXFxcdWRmZmYnLFxuICAgIHJzQ29tYm9NYXJrc1JhbmdlID0gJ1xcXFx1MDMwMC1cXFxcdTAzNmYnLFxuICAgIHJlQ29tYm9IYWxmTWFya3NSYW5nZSA9ICdcXFxcdWZlMjAtXFxcXHVmZTJmJyxcbiAgICByc0NvbWJvU3ltYm9sc1JhbmdlID0gJ1xcXFx1MjBkMC1cXFxcdTIwZmYnLFxuICAgIHJzQ29tYm9SYW5nZSA9IHJzQ29tYm9NYXJrc1JhbmdlICsgcmVDb21ib0hhbGZNYXJrc1JhbmdlICsgcnNDb21ib1N5bWJvbHNSYW5nZSxcbiAgICByc1ZhclJhbmdlID0gJ1xcXFx1ZmUwZVxcXFx1ZmUwZic7XG5cbi8qKiBVc2VkIHRvIGNvbXBvc2UgdW5pY29kZSBjYXB0dXJlIGdyb3Vwcy4gKi9cbnZhciByc0FzdHJhbCA9ICdbJyArIHJzQXN0cmFsUmFuZ2UgKyAnXScsXG4gICAgcnNDb21ibyA9ICdbJyArIHJzQ29tYm9SYW5nZSArICddJyxcbiAgICByc0ZpdHogPSAnXFxcXHVkODNjW1xcXFx1ZGZmYi1cXFxcdWRmZmZdJyxcbiAgICByc01vZGlmaWVyID0gJyg/OicgKyByc0NvbWJvICsgJ3wnICsgcnNGaXR6ICsgJyknLFxuICAgIHJzTm9uQXN0cmFsID0gJ1teJyArIHJzQXN0cmFsUmFuZ2UgKyAnXScsXG4gICAgcnNSZWdpb25hbCA9ICcoPzpcXFxcdWQ4M2NbXFxcXHVkZGU2LVxcXFx1ZGRmZl0pezJ9JyxcbiAgICByc1N1cnJQYWlyID0gJ1tcXFxcdWQ4MDAtXFxcXHVkYmZmXVtcXFxcdWRjMDAtXFxcXHVkZmZmXScsXG4gICAgcnNaV0ogPSAnXFxcXHUyMDBkJztcblxuLyoqIFVzZWQgdG8gY29tcG9zZSB1bmljb2RlIHJlZ2V4ZXMuICovXG52YXIgcmVPcHRNb2QgPSByc01vZGlmaWVyICsgJz8nLFxuICAgIHJzT3B0VmFyID0gJ1snICsgcnNWYXJSYW5nZSArICddPycsXG4gICAgcnNPcHRKb2luID0gJyg/OicgKyByc1pXSiArICcoPzonICsgW3JzTm9uQXN0cmFsLCByc1JlZ2lvbmFsLCByc1N1cnJQYWlyXS5qb2luKCd8JykgKyAnKScgKyByc09wdFZhciArIHJlT3B0TW9kICsgJykqJyxcbiAgICByc1NlcSA9IHJzT3B0VmFyICsgcmVPcHRNb2QgKyByc09wdEpvaW4sXG4gICAgcnNTeW1ib2wgPSAnKD86JyArIFtyc05vbkFzdHJhbCArIHJzQ29tYm8gKyAnPycsIHJzQ29tYm8sIHJzUmVnaW9uYWwsIHJzU3VyclBhaXIsIHJzQXN0cmFsXS5qb2luKCd8JykgKyAnKSc7XG5cbi8qKiBVc2VkIHRvIG1hdGNoIFtzdHJpbmcgc3ltYm9sc10oaHR0cHM6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2phdmFzY3JpcHQtdW5pY29kZSkuICovXG52YXIgcmVVbmljb2RlID0gUmVnRXhwKHJzRml0eiArICcoPz0nICsgcnNGaXR6ICsgJyl8JyArIHJzU3ltYm9sICsgcnNTZXEsICdnJyk7XG5cbi8qKlxuICogR2V0cyB0aGUgc2l6ZSBvZiBhIFVuaWNvZGUgYHN0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgVGhlIHN0cmluZyBpbnNwZWN0LlxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgc3RyaW5nIHNpemUuXG4gKi9cbmZ1bmN0aW9uIHVuaWNvZGVTaXplKHN0cmluZykge1xuICB2YXIgcmVzdWx0ID0gcmVVbmljb2RlLmxhc3RJbmRleCA9IDA7XG4gIHdoaWxlIChyZVVuaWNvZGUudGVzdChzdHJpbmcpKSB7XG4gICAgKytyZXN1bHQ7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdW5pY29kZVNpemU7XG4iLAogICAgImltcG9ydCBhc2NpaVNpemUgZnJvbSAnLi9fYXNjaWlTaXplLmpzJztcbmltcG9ydCBoYXNVbmljb2RlIGZyb20gJy4vX2hhc1VuaWNvZGUuanMnO1xuaW1wb3J0IHVuaWNvZGVTaXplIGZyb20gJy4vX3VuaWNvZGVTaXplLmpzJztcblxuLyoqXG4gKiBHZXRzIHRoZSBudW1iZXIgb2Ygc3ltYm9scyBpbiBgc3RyaW5nYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyBUaGUgc3RyaW5nIHRvIGluc3BlY3QuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBzdHJpbmcgc2l6ZS5cbiAqL1xuZnVuY3Rpb24gc3RyaW5nU2l6ZShzdHJpbmcpIHtcbiAgcmV0dXJuIGhhc1VuaWNvZGUoc3RyaW5nKVxuICAgID8gdW5pY29kZVNpemUoc3RyaW5nKVxuICAgIDogYXNjaWlTaXplKHN0cmluZyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHN0cmluZ1NpemU7XG4iLAogICAgImltcG9ydCBiYXNlUGlja0J5IGZyb20gJy4vX2Jhc2VQaWNrQnkuanMnO1xuaW1wb3J0IGhhc0luIGZyb20gJy4vaGFzSW4uanMnO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnBpY2tgIHdpdGhvdXQgc3VwcG9ydCBmb3IgaW5kaXZpZHVhbFxuICogcHJvcGVydHkgaWRlbnRpZmllcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIHNvdXJjZSBvYmplY3QuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBwYXRocyBUaGUgcHJvcGVydHkgcGF0aHMgdG8gcGljay5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIG5ldyBvYmplY3QuXG4gKi9cbmZ1bmN0aW9uIGJhc2VQaWNrKG9iamVjdCwgcGF0aHMpIHtcbiAgcmV0dXJuIGJhc2VQaWNrQnkob2JqZWN0LCBwYXRocywgZnVuY3Rpb24odmFsdWUsIHBhdGgpIHtcbiAgICByZXR1cm4gaGFzSW4ob2JqZWN0LCBwYXRoKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VQaWNrO1xuIiwKICAgICJpbXBvcnQgYmFzZVBpY2sgZnJvbSAnLi9fYmFzZVBpY2suanMnO1xuaW1wb3J0IGZsYXRSZXN0IGZyb20gJy4vX2ZsYXRSZXN0LmpzJztcblxuLyoqXG4gKiBDcmVhdGVzIGFuIG9iamVjdCBjb21wb3NlZCBvZiB0aGUgcGlja2VkIGBvYmplY3RgIHByb3BlcnRpZXMuXG4gKlxuICogQHN0YXRpY1xuICogQHNpbmNlIDAuMS4wXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgc291cmNlIG9iamVjdC5cbiAqIEBwYXJhbSB7Li4uKHN0cmluZ3xzdHJpbmdbXSl9IFtwYXRoc10gVGhlIHByb3BlcnR5IHBhdGhzIHRvIHBpY2suXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBuZXcgb2JqZWN0LlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IDEsICdiJzogJzInLCAnYyc6IDMgfTtcbiAqXG4gKiBfLnBpY2sob2JqZWN0LCBbJ2EnLCAnYyddKTtcbiAqIC8vID0+IHsgJ2EnOiAxLCAnYyc6IDMgfVxuICovXG52YXIgcGljayA9IGZsYXRSZXN0KGZ1bmN0aW9uKG9iamVjdCwgcGF0aHMpIHtcbiAgcmV0dXJuIG9iamVjdCA9PSBudWxsID8ge30gOiBiYXNlUGljayhvYmplY3QsIHBhdGhzKTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBwaWNrO1xuIiwKICAgICIvKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlQ2VpbCA9IE1hdGguY2VpbCxcbiAgICBuYXRpdmVNYXggPSBNYXRoLm1heDtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5yYW5nZWAgYW5kIGBfLnJhbmdlUmlnaHRgIHdoaWNoIGRvZXNuJ3RcbiAqIGNvZXJjZSBhcmd1bWVudHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydCBUaGUgc3RhcnQgb2YgdGhlIHJhbmdlLlxuICogQHBhcmFtIHtudW1iZXJ9IGVuZCBUaGUgZW5kIG9mIHRoZSByYW5nZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIFRoZSB2YWx1ZSB0byBpbmNyZW1lbnQgb3IgZGVjcmVtZW50IGJ5LlxuICogQHBhcmFtIHtib29sZWFufSBbZnJvbVJpZ2h0XSBTcGVjaWZ5IGl0ZXJhdGluZyBmcm9tIHJpZ2h0IHRvIGxlZnQuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIHJhbmdlIG9mIG51bWJlcnMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VSYW5nZShzdGFydCwgZW5kLCBzdGVwLCBmcm9tUmlnaHQpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBuYXRpdmVNYXgobmF0aXZlQ2VpbCgoZW5kIC0gc3RhcnQpIC8gKHN0ZXAgfHwgMSkpLCAwKSxcbiAgICAgIHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XG5cbiAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgcmVzdWx0W2Zyb21SaWdodCA/IGxlbmd0aCA6ICsraW5kZXhdID0gc3RhcnQ7XG4gICAgc3RhcnQgKz0gc3RlcDtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlUmFuZ2U7XG4iLAogICAgImltcG9ydCBiYXNlUmFuZ2UgZnJvbSAnLi9fYmFzZVJhbmdlLmpzJztcbmltcG9ydCBpc0l0ZXJhdGVlQ2FsbCBmcm9tICcuL19pc0l0ZXJhdGVlQ2FsbC5qcyc7XG5pbXBvcnQgdG9GaW5pdGUgZnJvbSAnLi90b0Zpbml0ZS5qcyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGBfLnJhbmdlYCBvciBgXy5yYW5nZVJpZ2h0YCBmdW5jdGlvbi5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtib29sZWFufSBbZnJvbVJpZ2h0XSBTcGVjaWZ5IGl0ZXJhdGluZyBmcm9tIHJpZ2h0IHRvIGxlZnQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyByYW5nZSBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlUmFuZ2UoZnJvbVJpZ2h0KSB7XG4gIHJldHVybiBmdW5jdGlvbihzdGFydCwgZW5kLCBzdGVwKSB7XG4gICAgaWYgKHN0ZXAgJiYgdHlwZW9mIHN0ZXAgIT0gJ251bWJlcicgJiYgaXNJdGVyYXRlZUNhbGwoc3RhcnQsIGVuZCwgc3RlcCkpIHtcbiAgICAgIGVuZCA9IHN0ZXAgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIC8vIEVuc3VyZSB0aGUgc2lnbiBvZiBgLTBgIGlzIHByZXNlcnZlZC5cbiAgICBzdGFydCA9IHRvRmluaXRlKHN0YXJ0KTtcbiAgICBpZiAoZW5kID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVuZCA9IHN0YXJ0O1xuICAgICAgc3RhcnQgPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbmQgPSB0b0Zpbml0ZShlbmQpO1xuICAgIH1cbiAgICBzdGVwID0gc3RlcCA9PT0gdW5kZWZpbmVkID8gKHN0YXJ0IDwgZW5kID8gMSA6IC0xKSA6IHRvRmluaXRlKHN0ZXApO1xuICAgIHJldHVybiBiYXNlUmFuZ2Uoc3RhcnQsIGVuZCwgc3RlcCwgZnJvbVJpZ2h0KTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlUmFuZ2U7XG4iLAogICAgImltcG9ydCBjcmVhdGVSYW5nZSBmcm9tICcuL19jcmVhdGVSYW5nZS5qcyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiBudW1iZXJzIChwb3NpdGl2ZSBhbmQvb3IgbmVnYXRpdmUpIHByb2dyZXNzaW5nIGZyb21cbiAqIGBzdGFydGAgdXAgdG8sIGJ1dCBub3QgaW5jbHVkaW5nLCBgZW5kYC4gQSBzdGVwIG9mIGAtMWAgaXMgdXNlZCBpZiBhIG5lZ2F0aXZlXG4gKiBgc3RhcnRgIGlzIHNwZWNpZmllZCB3aXRob3V0IGFuIGBlbmRgIG9yIGBzdGVwYC4gSWYgYGVuZGAgaXMgbm90IHNwZWNpZmllZCxcbiAqIGl0J3Mgc2V0IHRvIGBzdGFydGAgd2l0aCBgc3RhcnRgIHRoZW4gc2V0IHRvIGAwYC5cbiAqXG4gKiAqKk5vdGU6KiogSmF2YVNjcmlwdCBmb2xsb3dzIHRoZSBJRUVFLTc1NCBzdGFuZGFyZCBmb3IgcmVzb2x2aW5nXG4gKiBmbG9hdGluZy1wb2ludCB2YWx1ZXMgd2hpY2ggY2FuIHByb2R1Y2UgdW5leHBlY3RlZCByZXN1bHRzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcGFyYW0ge251bWJlcn0gW3N0YXJ0PTBdIFRoZSBzdGFydCBvZiB0aGUgcmFuZ2UuXG4gKiBAcGFyYW0ge251bWJlcn0gZW5kIFRoZSBlbmQgb2YgdGhlIHJhbmdlLlxuICogQHBhcmFtIHtudW1iZXJ9IFtzdGVwPTFdIFRoZSB2YWx1ZSB0byBpbmNyZW1lbnQgb3IgZGVjcmVtZW50IGJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSByYW5nZSBvZiBudW1iZXJzLlxuICogQHNlZSBfLmluUmFuZ2UsIF8ucmFuZ2VSaWdodFxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnJhbmdlKDQpO1xuICogLy8gPT4gWzAsIDEsIDIsIDNdXG4gKlxuICogXy5yYW5nZSgtNCk7XG4gKiAvLyA9PiBbMCwgLTEsIC0yLCAtM11cbiAqXG4gKiBfLnJhbmdlKDEsIDUpO1xuICogLy8gPT4gWzEsIDIsIDMsIDRdXG4gKlxuICogXy5yYW5nZSgwLCAyMCwgNSk7XG4gKiAvLyA9PiBbMCwgNSwgMTAsIDE1XVxuICpcbiAqIF8ucmFuZ2UoMCwgLTQsIC0xKTtcbiAqIC8vID0+IFswLCAtMSwgLTIsIC0zXVxuICpcbiAqIF8ucmFuZ2UoMSwgNCwgMCk7XG4gKiAvLyA9PiBbMSwgMSwgMV1cbiAqXG4gKiBfLnJhbmdlKDApO1xuICogLy8gPT4gW11cbiAqL1xudmFyIHJhbmdlID0gY3JlYXRlUmFuZ2UoKTtcblxuZXhwb3J0IGRlZmF1bHQgcmFuZ2U7XG4iLAogICAgIi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ucmVkdWNlYCBhbmQgYF8ucmVkdWNlUmlnaHRgLCB3aXRob3V0IHN1cHBvcnRcbiAqIGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzLCB3aGljaCBpdGVyYXRlcyBvdmVyIGBjb2xsZWN0aW9uYCB1c2luZyBgZWFjaEZ1bmNgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHBhcmFtIHsqfSBhY2N1bXVsYXRvciBUaGUgaW5pdGlhbCB2YWx1ZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaW5pdEFjY3VtIFNwZWNpZnkgdXNpbmcgdGhlIGZpcnN0IG9yIGxhc3QgZWxlbWVudCBvZlxuICogIGBjb2xsZWN0aW9uYCBhcyB0aGUgaW5pdGlhbCB2YWx1ZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGVhY2hGdW5jIFRoZSBmdW5jdGlvbiB0byBpdGVyYXRlIG92ZXIgYGNvbGxlY3Rpb25gLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGFjY3VtdWxhdGVkIHZhbHVlLlxuICovXG5mdW5jdGlvbiBiYXNlUmVkdWNlKGNvbGxlY3Rpb24sIGl0ZXJhdGVlLCBhY2N1bXVsYXRvciwgaW5pdEFjY3VtLCBlYWNoRnVuYykge1xuICBlYWNoRnVuYyhjb2xsZWN0aW9uLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICBhY2N1bXVsYXRvciA9IGluaXRBY2N1bVxuICAgICAgPyAoaW5pdEFjY3VtID0gZmFsc2UsIHZhbHVlKVxuICAgICAgOiBpdGVyYXRlZShhY2N1bXVsYXRvciwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgfSk7XG4gIHJldHVybiBhY2N1bXVsYXRvcjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZVJlZHVjZTtcbiIsCiAgICAiaW1wb3J0IGFycmF5UmVkdWNlIGZyb20gJy4vX2FycmF5UmVkdWNlLmpzJztcbmltcG9ydCBiYXNlRWFjaCBmcm9tICcuL19iYXNlRWFjaC5qcyc7XG5pbXBvcnQgYmFzZUl0ZXJhdGVlIGZyb20gJy4vX2Jhc2VJdGVyYXRlZS5qcyc7XG5pbXBvcnQgYmFzZVJlZHVjZSBmcm9tICcuL19iYXNlUmVkdWNlLmpzJztcbmltcG9ydCBpc0FycmF5IGZyb20gJy4vaXNBcnJheS5qcyc7XG5cbi8qKlxuICogUmVkdWNlcyBgY29sbGVjdGlvbmAgdG8gYSB2YWx1ZSB3aGljaCBpcyB0aGUgYWNjdW11bGF0ZWQgcmVzdWx0IG9mIHJ1bm5pbmdcbiAqIGVhY2ggZWxlbWVudCBpbiBgY29sbGVjdGlvbmAgdGhydSBgaXRlcmF0ZWVgLCB3aGVyZSBlYWNoIHN1Y2Nlc3NpdmVcbiAqIGludm9jYXRpb24gaXMgc3VwcGxpZWQgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgcHJldmlvdXMuIElmIGBhY2N1bXVsYXRvcmBcbiAqIGlzIG5vdCBnaXZlbiwgdGhlIGZpcnN0IGVsZW1lbnQgb2YgYGNvbGxlY3Rpb25gIGlzIHVzZWQgYXMgdGhlIGluaXRpYWxcbiAqIHZhbHVlLiBUaGUgaXRlcmF0ZWUgaXMgaW52b2tlZCB3aXRoIGZvdXIgYXJndW1lbnRzOlxuICogKGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXh8a2V5LCBjb2xsZWN0aW9uKS5cbiAqXG4gKiBNYW55IGxvZGFzaCBtZXRob2RzIGFyZSBndWFyZGVkIHRvIHdvcmsgYXMgaXRlcmF0ZWVzIGZvciBtZXRob2RzIGxpa2VcbiAqIGBfLnJlZHVjZWAsIGBfLnJlZHVjZVJpZ2h0YCwgYW5kIGBfLnRyYW5zZm9ybWAuXG4gKlxuICogVGhlIGd1YXJkZWQgbWV0aG9kcyBhcmU6XG4gKiBgYXNzaWduYCwgYGRlZmF1bHRzYCwgYGRlZmF1bHRzRGVlcGAsIGBpbmNsdWRlc2AsIGBtZXJnZWAsIGBvcmRlckJ5YCxcbiAqIGFuZCBgc29ydEJ5YFxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbaXRlcmF0ZWU9Xy5pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEBwYXJhbSB7Kn0gW2FjY3VtdWxhdG9yXSBUaGUgaW5pdGlhbCB2YWx1ZS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBhY2N1bXVsYXRlZCB2YWx1ZS5cbiAqIEBzZWUgXy5yZWR1Y2VSaWdodFxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnJlZHVjZShbMSwgMl0sIGZ1bmN0aW9uKHN1bSwgbikge1xuICogICByZXR1cm4gc3VtICsgbjtcbiAqIH0sIDApO1xuICogLy8gPT4gM1xuICpcbiAqIF8ucmVkdWNlKHsgJ2EnOiAxLCAnYic6IDIsICdjJzogMSB9LCBmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBrZXkpIHtcbiAqICAgKHJlc3VsdFt2YWx1ZV0gfHwgKHJlc3VsdFt2YWx1ZV0gPSBbXSkpLnB1c2goa2V5KTtcbiAqICAgcmV0dXJuIHJlc3VsdDtcbiAqIH0sIHt9KTtcbiAqIC8vID0+IHsgJzEnOiBbJ2EnLCAnYyddLCAnMic6IFsnYiddIH0gKGl0ZXJhdGlvbiBvcmRlciBpcyBub3QgZ3VhcmFudGVlZClcbiAqL1xuZnVuY3Rpb24gcmVkdWNlKGNvbGxlY3Rpb24sIGl0ZXJhdGVlLCBhY2N1bXVsYXRvcikge1xuICB2YXIgZnVuYyA9IGlzQXJyYXkoY29sbGVjdGlvbikgPyBhcnJheVJlZHVjZSA6IGJhc2VSZWR1Y2UsXG4gICAgICBpbml0QWNjdW0gPSBhcmd1bWVudHMubGVuZ3RoIDwgMztcblxuICByZXR1cm4gZnVuYyhjb2xsZWN0aW9uLCBiYXNlSXRlcmF0ZWUoaXRlcmF0ZWUsIDQpLCBhY2N1bXVsYXRvciwgaW5pdEFjY3VtLCBiYXNlRWFjaCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHJlZHVjZTtcbiIsCiAgICAiaW1wb3J0IGJhc2VLZXlzIGZyb20gJy4vX2Jhc2VLZXlzLmpzJztcbmltcG9ydCBnZXRUYWcgZnJvbSAnLi9fZ2V0VGFnLmpzJztcbmltcG9ydCBpc0FycmF5TGlrZSBmcm9tICcuL2lzQXJyYXlMaWtlLmpzJztcbmltcG9ydCBpc1N0cmluZyBmcm9tICcuL2lzU3RyaW5nLmpzJztcbmltcG9ydCBzdHJpbmdTaXplIGZyb20gJy4vX3N0cmluZ1NpemUuanMnO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgbWFwVGFnID0gJ1tvYmplY3QgTWFwXScsXG4gICAgc2V0VGFnID0gJ1tvYmplY3QgU2V0XSc7XG5cbi8qKlxuICogR2V0cyB0aGUgc2l6ZSBvZiBgY29sbGVjdGlvbmAgYnkgcmV0dXJuaW5nIGl0cyBsZW5ndGggZm9yIGFycmF5LWxpa2VcbiAqIHZhbHVlcyBvciB0aGUgbnVtYmVyIG9mIG93biBlbnVtZXJhYmxlIHN0cmluZyBrZXllZCBwcm9wZXJ0aWVzIGZvciBvYmplY3RzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaW5zcGVjdC5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIGNvbGxlY3Rpb24gc2l6ZS5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5zaXplKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiAzXG4gKlxuICogXy5zaXplKHsgJ2EnOiAxLCAnYic6IDIgfSk7XG4gKiAvLyA9PiAyXG4gKlxuICogXy5zaXplKCdwZWJibGVzJyk7XG4gKiAvLyA9PiA3XG4gKi9cbmZ1bmN0aW9uIHNpemUoY29sbGVjdGlvbikge1xuICBpZiAoY29sbGVjdGlvbiA9PSBudWxsKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cbiAgaWYgKGlzQXJyYXlMaWtlKGNvbGxlY3Rpb24pKSB7XG4gICAgcmV0dXJuIGlzU3RyaW5nKGNvbGxlY3Rpb24pID8gc3RyaW5nU2l6ZShjb2xsZWN0aW9uKSA6IGNvbGxlY3Rpb24ubGVuZ3RoO1xuICB9XG4gIHZhciB0YWcgPSBnZXRUYWcoY29sbGVjdGlvbik7XG4gIGlmICh0YWcgPT0gbWFwVGFnIHx8IHRhZyA9PSBzZXRUYWcpIHtcbiAgICByZXR1cm4gY29sbGVjdGlvbi5zaXplO1xuICB9XG4gIHJldHVybiBiYXNlS2V5cyhjb2xsZWN0aW9uKS5sZW5ndGg7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHNpemU7XG4iLAogICAgImltcG9ydCBiYXNlRmxhdHRlbiBmcm9tICcuL19iYXNlRmxhdHRlbi5qcyc7XG5pbXBvcnQgYmFzZU9yZGVyQnkgZnJvbSAnLi9fYmFzZU9yZGVyQnkuanMnO1xuaW1wb3J0IGJhc2VSZXN0IGZyb20gJy4vX2Jhc2VSZXN0LmpzJztcbmltcG9ydCBpc0l0ZXJhdGVlQ2FsbCBmcm9tICcuL19pc0l0ZXJhdGVlQ2FsbC5qcyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiBlbGVtZW50cywgc29ydGVkIGluIGFzY2VuZGluZyBvcmRlciBieSB0aGUgcmVzdWx0cyBvZlxuICogcnVubmluZyBlYWNoIGVsZW1lbnQgaW4gYSBjb2xsZWN0aW9uIHRocnUgZWFjaCBpdGVyYXRlZS4gVGhpcyBtZXRob2RcbiAqIHBlcmZvcm1zIGEgc3RhYmxlIHNvcnQsIHRoYXQgaXMsIGl0IHByZXNlcnZlcyB0aGUgb3JpZ2luYWwgc29ydCBvcmRlciBvZlxuICogZXF1YWwgZWxlbWVudHMuIFRoZSBpdGVyYXRlZXMgYXJlIGludm9rZWQgd2l0aCBvbmUgYXJndW1lbnQ6ICh2YWx1ZSkuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IENvbGxlY3Rpb25cbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7Li4uKEZ1bmN0aW9ufEZ1bmN0aW9uW10pfSBbaXRlcmF0ZWVzPVtfLmlkZW50aXR5XV1cbiAqICBUaGUgaXRlcmF0ZWVzIHRvIHNvcnQgYnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIG5ldyBzb3J0ZWQgYXJyYXkuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciB1c2VycyA9IFtcbiAqICAgeyAndXNlcic6ICdmcmVkJywgICAnYWdlJzogNDggfSxcbiAqICAgeyAndXNlcic6ICdiYXJuZXknLCAnYWdlJzogMzYgfSxcbiAqICAgeyAndXNlcic6ICdmcmVkJywgICAnYWdlJzogMzAgfSxcbiAqICAgeyAndXNlcic6ICdiYXJuZXknLCAnYWdlJzogMzQgfVxuICogXTtcbiAqXG4gKiBfLnNvcnRCeSh1c2VycywgW2Z1bmN0aW9uKG8pIHsgcmV0dXJuIG8udXNlcjsgfV0pO1xuICogLy8gPT4gb2JqZWN0cyBmb3IgW1snYmFybmV5JywgMzZdLCBbJ2Jhcm5leScsIDM0XSwgWydmcmVkJywgNDhdLCBbJ2ZyZWQnLCAzMF1dXG4gKlxuICogXy5zb3J0QnkodXNlcnMsIFsndXNlcicsICdhZ2UnXSk7XG4gKiAvLyA9PiBvYmplY3RzIGZvciBbWydiYXJuZXknLCAzNF0sIFsnYmFybmV5JywgMzZdLCBbJ2ZyZWQnLCAzMF0sIFsnZnJlZCcsIDQ4XV1cbiAqL1xudmFyIHNvcnRCeSA9IGJhc2VSZXN0KGZ1bmN0aW9uKGNvbGxlY3Rpb24sIGl0ZXJhdGVlcykge1xuICBpZiAoY29sbGVjdGlvbiA9PSBudWxsKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIHZhciBsZW5ndGggPSBpdGVyYXRlZXMubGVuZ3RoO1xuICBpZiAobGVuZ3RoID4gMSAmJiBpc0l0ZXJhdGVlQ2FsbChjb2xsZWN0aW9uLCBpdGVyYXRlZXNbMF0sIGl0ZXJhdGVlc1sxXSkpIHtcbiAgICBpdGVyYXRlZXMgPSBbXTtcbiAgfSBlbHNlIGlmIChsZW5ndGggPiAyICYmIGlzSXRlcmF0ZWVDYWxsKGl0ZXJhdGVlc1swXSwgaXRlcmF0ZWVzWzFdLCBpdGVyYXRlZXNbMl0pKSB7XG4gICAgaXRlcmF0ZWVzID0gW2l0ZXJhdGVlc1swXV07XG4gIH1cbiAgcmV0dXJuIGJhc2VPcmRlckJ5KGNvbGxlY3Rpb24sIGJhc2VGbGF0dGVuKGl0ZXJhdGVlcywgMSksIFtdKTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBzb3J0Qnk7XG4iLAogICAgImltcG9ydCBTZXQgZnJvbSAnLi9fU2V0LmpzJztcbmltcG9ydCBub29wIGZyb20gJy4vbm9vcC5qcyc7XG5pbXBvcnQgc2V0VG9BcnJheSBmcm9tICcuL19zZXRUb0FycmF5LmpzJztcblxuLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgSU5GSU5JVFkgPSAxIC8gMDtcblxuLyoqXG4gKiBDcmVhdGVzIGEgc2V0IG9iamVjdCBvZiBgdmFsdWVzYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gdmFsdWVzIFRoZSB2YWx1ZXMgdG8gYWRkIHRvIHRoZSBzZXQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBuZXcgc2V0LlxuICovXG52YXIgY3JlYXRlU2V0ID0gIShTZXQgJiYgKDEgLyBzZXRUb0FycmF5KG5ldyBTZXQoWywtMF0pKVsxXSkgPT0gSU5GSU5JVFkpID8gbm9vcCA6IGZ1bmN0aW9uKHZhbHVlcykge1xuICByZXR1cm4gbmV3IFNldCh2YWx1ZXMpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlU2V0O1xuIiwKICAgICJpbXBvcnQgU2V0Q2FjaGUgZnJvbSAnLi9fU2V0Q2FjaGUuanMnO1xuaW1wb3J0IGFycmF5SW5jbHVkZXMgZnJvbSAnLi9fYXJyYXlJbmNsdWRlcy5qcyc7XG5pbXBvcnQgYXJyYXlJbmNsdWRlc1dpdGggZnJvbSAnLi9fYXJyYXlJbmNsdWRlc1dpdGguanMnO1xuaW1wb3J0IGNhY2hlSGFzIGZyb20gJy4vX2NhY2hlSGFzLmpzJztcbmltcG9ydCBjcmVhdGVTZXQgZnJvbSAnLi9fY3JlYXRlU2V0LmpzJztcbmltcG9ydCBzZXRUb0FycmF5IGZyb20gJy4vX3NldFRvQXJyYXkuanMnO1xuXG4vKiogVXNlZCBhcyB0aGUgc2l6ZSB0byBlbmFibGUgbGFyZ2UgYXJyYXkgb3B0aW1pemF0aW9ucy4gKi9cbnZhciBMQVJHRV9BUlJBWV9TSVpFID0gMjAwO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnVuaXFCeWAgd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaW5zcGVjdC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtpdGVyYXRlZV0gVGhlIGl0ZXJhdGVlIGludm9rZWQgcGVyIGVsZW1lbnQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY29tcGFyYXRvcl0gVGhlIGNvbXBhcmF0b3IgaW52b2tlZCBwZXIgZWxlbWVudC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IGR1cGxpY2F0ZSBmcmVlIGFycmF5LlxuICovXG5mdW5jdGlvbiBiYXNlVW5pcShhcnJheSwgaXRlcmF0ZWUsIGNvbXBhcmF0b3IpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBpbmNsdWRlcyA9IGFycmF5SW5jbHVkZXMsXG4gICAgICBsZW5ndGggPSBhcnJheS5sZW5ndGgsXG4gICAgICBpc0NvbW1vbiA9IHRydWUsXG4gICAgICByZXN1bHQgPSBbXSxcbiAgICAgIHNlZW4gPSByZXN1bHQ7XG5cbiAgaWYgKGNvbXBhcmF0b3IpIHtcbiAgICBpc0NvbW1vbiA9IGZhbHNlO1xuICAgIGluY2x1ZGVzID0gYXJyYXlJbmNsdWRlc1dpdGg7XG4gIH1cbiAgZWxzZSBpZiAobGVuZ3RoID49IExBUkdFX0FSUkFZX1NJWkUpIHtcbiAgICB2YXIgc2V0ID0gaXRlcmF0ZWUgPyBudWxsIDogY3JlYXRlU2V0KGFycmF5KTtcbiAgICBpZiAoc2V0KSB7XG4gICAgICByZXR1cm4gc2V0VG9BcnJheShzZXQpO1xuICAgIH1cbiAgICBpc0NvbW1vbiA9IGZhbHNlO1xuICAgIGluY2x1ZGVzID0gY2FjaGVIYXM7XG4gICAgc2VlbiA9IG5ldyBTZXRDYWNoZTtcbiAgfVxuICBlbHNlIHtcbiAgICBzZWVuID0gaXRlcmF0ZWUgPyBbXSA6IHJlc3VsdDtcbiAgfVxuICBvdXRlcjpcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgdmFsdWUgPSBhcnJheVtpbmRleF0sXG4gICAgICAgIGNvbXB1dGVkID0gaXRlcmF0ZWUgPyBpdGVyYXRlZSh2YWx1ZSkgOiB2YWx1ZTtcblxuICAgIHZhbHVlID0gKGNvbXBhcmF0b3IgfHwgdmFsdWUgIT09IDApID8gdmFsdWUgOiAwO1xuICAgIGlmIChpc0NvbW1vbiAmJiBjb21wdXRlZCA9PT0gY29tcHV0ZWQpIHtcbiAgICAgIHZhciBzZWVuSW5kZXggPSBzZWVuLmxlbmd0aDtcbiAgICAgIHdoaWxlIChzZWVuSW5kZXgtLSkge1xuICAgICAgICBpZiAoc2VlbltzZWVuSW5kZXhdID09PSBjb21wdXRlZCkge1xuICAgICAgICAgIGNvbnRpbnVlIG91dGVyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoaXRlcmF0ZWUpIHtcbiAgICAgICAgc2Vlbi5wdXNoKGNvbXB1dGVkKTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIWluY2x1ZGVzKHNlZW4sIGNvbXB1dGVkLCBjb21wYXJhdG9yKSkge1xuICAgICAgaWYgKHNlZW4gIT09IHJlc3VsdCkge1xuICAgICAgICBzZWVuLnB1c2goY29tcHV0ZWQpO1xuICAgICAgfVxuICAgICAgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlVW5pcTtcbiIsCiAgICAiaW1wb3J0IGJhc2VGbGF0dGVuIGZyb20gJy4vX2Jhc2VGbGF0dGVuLmpzJztcbmltcG9ydCBiYXNlUmVzdCBmcm9tICcuL19iYXNlUmVzdC5qcyc7XG5pbXBvcnQgYmFzZVVuaXEgZnJvbSAnLi9fYmFzZVVuaXEuanMnO1xuaW1wb3J0IGlzQXJyYXlMaWtlT2JqZWN0IGZyb20gJy4vaXNBcnJheUxpa2VPYmplY3QuanMnO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdW5pcXVlIHZhbHVlcywgaW4gb3JkZXIsIGZyb20gYWxsIGdpdmVuIGFycmF5cyB1c2luZ1xuICogW2BTYW1lVmFsdWVaZXJvYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtc2FtZXZhbHVlemVybylcbiAqIGZvciBlcXVhbGl0eSBjb21wYXJpc29ucy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgQXJyYXlcbiAqIEBwYXJhbSB7Li4uQXJyYXl9IFthcnJheXNdIFRoZSBhcnJheXMgdG8gaW5zcGVjdC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IGFycmF5IG9mIGNvbWJpbmVkIHZhbHVlcy5cbiAqIEBleGFtcGxlXG4gKlxuICogXy51bmlvbihbMl0sIFsxLCAyXSk7XG4gKiAvLyA9PiBbMiwgMV1cbiAqL1xudmFyIHVuaW9uID0gYmFzZVJlc3QoZnVuY3Rpb24oYXJyYXlzKSB7XG4gIHJldHVybiBiYXNlVW5pcShiYXNlRmxhdHRlbihhcnJheXMsIDEsIGlzQXJyYXlMaWtlT2JqZWN0LCB0cnVlKSk7XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgdW5pb247XG4iLAogICAgImltcG9ydCB0b1N0cmluZyBmcm9tICcuL3RvU3RyaW5nLmpzJztcblxuLyoqIFVzZWQgdG8gZ2VuZXJhdGUgdW5pcXVlIElEcy4gKi9cbnZhciBpZENvdW50ZXIgPSAwO1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHVuaXF1ZSBJRC4gSWYgYHByZWZpeGAgaXMgZ2l2ZW4sIHRoZSBJRCBpcyBhcHBlbmRlZCB0byBpdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHBhcmFtIHtzdHJpbmd9IFtwcmVmaXg9JyddIFRoZSB2YWx1ZSB0byBwcmVmaXggdGhlIElEIHdpdGguXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSB1bmlxdWUgSUQuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udW5pcXVlSWQoJ2NvbnRhY3RfJyk7XG4gKiAvLyA9PiAnY29udGFjdF8xMDQnXG4gKlxuICogXy51bmlxdWVJZCgpO1xuICogLy8gPT4gJzEwNSdcbiAqL1xuZnVuY3Rpb24gdW5pcXVlSWQocHJlZml4KSB7XG4gIHZhciBpZCA9ICsraWRDb3VudGVyO1xuICByZXR1cm4gdG9TdHJpbmcocHJlZml4KSArIGlkO1xufVxuXG5leHBvcnQgZGVmYXVsdCB1bmlxdWVJZDtcbiIsCiAgICAiLyoqXG4gKiBUaGlzIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uemlwT2JqZWN0YCB3aGljaCBhc3NpZ25zIHZhbHVlcyB1c2luZyBgYXNzaWduRnVuY2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IHByb3BzIFRoZSBwcm9wZXJ0eSBpZGVudGlmaWVycy5cbiAqIEBwYXJhbSB7QXJyYXl9IHZhbHVlcyBUaGUgcHJvcGVydHkgdmFsdWVzLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gYXNzaWduRnVuYyBUaGUgZnVuY3Rpb24gdG8gYXNzaWduIHZhbHVlcy5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIG5ldyBvYmplY3QuXG4gKi9cbmZ1bmN0aW9uIGJhc2VaaXBPYmplY3QocHJvcHMsIHZhbHVlcywgYXNzaWduRnVuYykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IHByb3BzLmxlbmd0aCxcbiAgICAgIHZhbHNMZW5ndGggPSB2YWx1ZXMubGVuZ3RoLFxuICAgICAgcmVzdWx0ID0ge307XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgdmFsdWUgPSBpbmRleCA8IHZhbHNMZW5ndGggPyB2YWx1ZXNbaW5kZXhdIDogdW5kZWZpbmVkO1xuICAgIGFzc2lnbkZ1bmMocmVzdWx0LCBwcm9wc1tpbmRleF0sIHZhbHVlKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlWmlwT2JqZWN0O1xuIiwKICAgICJpbXBvcnQgYXNzaWduVmFsdWUgZnJvbSAnLi9fYXNzaWduVmFsdWUuanMnO1xuaW1wb3J0IGJhc2VaaXBPYmplY3QgZnJvbSAnLi9fYmFzZVppcE9iamVjdC5qcyc7XG5cbi8qKlxuICogVGhpcyBtZXRob2QgaXMgbGlrZSBgXy5mcm9tUGFpcnNgIGV4Y2VwdCB0aGF0IGl0IGFjY2VwdHMgdHdvIGFycmF5cyxcbiAqIG9uZSBvZiBwcm9wZXJ0eSBpZGVudGlmaWVycyBhbmQgb25lIG9mIGNvcnJlc3BvbmRpbmcgdmFsdWVzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC40LjBcbiAqIEBjYXRlZ29yeSBBcnJheVxuICogQHBhcmFtIHtBcnJheX0gW3Byb3BzPVtdXSBUaGUgcHJvcGVydHkgaWRlbnRpZmllcnMuXG4gKiBAcGFyYW0ge0FycmF5fSBbdmFsdWVzPVtdXSBUaGUgcHJvcGVydHkgdmFsdWVzLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgbmV3IG9iamVjdC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy56aXBPYmplY3QoWydhJywgJ2InXSwgWzEsIDJdKTtcbiAqIC8vID0+IHsgJ2EnOiAxLCAnYic6IDIgfVxuICovXG5mdW5jdGlvbiB6aXBPYmplY3QocHJvcHMsIHZhbHVlcykge1xuICByZXR1cm4gYmFzZVppcE9iamVjdChwcm9wcyB8fCBbXSwgdmFsdWVzIHx8IFtdLCBhc3NpZ25WYWx1ZSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHppcE9iamVjdDtcbiIsCiAgICAiaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gtZXMnO1xuXG52YXIgREVGQVVMVF9FREdFX05BTUUgPSAnXFx4MDAnO1xudmFyIEdSQVBIX05PREUgPSAnXFx4MDAnO1xudmFyIEVER0VfS0VZX0RFTElNID0gJ1xceDAxJztcblxuLyoqXG4gKiBAdHlwZWRlZiB7c3RyaW5nfSBOb2RlSUQgSUQgb2YgYSBub2RlLlxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge2Ake3N0cmluZ30ke3R5cGVvZiBFREdFX0tFWV9ERUxJTX0ke3N0cmluZ30ke3R5cGVvZiBFREdFX0tFWV9ERUxJTX0ke3N0cmluZ31gfSBFZGdlSUQgSUQgb2YgYW4gZWRnZS5cbiAqIEBpbnRlcm5hbCAtIEFsbCBwdWJsaWMgQVBJcyB1c2Uge0BsaW5rIEVkZ2VPYmp9IGluc3RlYWQgdG8gcmVmZXIgdG8gZWRnZXMuXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7b2JqZWN0fSBFZGdlT2JqXG4gKiBAcHJvcGVydHkge05vZGVJRH0gdiB0aGUgaWQgb2YgdGhlIHNvdXJjZSBvciB0YWlsIG5vZGUgb2YgYW4gZWRnZVxuICogQHByb3BlcnR5IHtOb2RlSUR9IHcgdGhlIGlkIG9mIHRoZSB0YXJnZXQgb3IgaGVhZCBub2RlIG9mIGFuIGVkZ2VcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nIHwgbnVtYmVyfSBbbmFtZV0gTmFtZSBvZiB0aGUgZWRnZS4gTmVlZGVkIHRvIHVuaXF1ZWx5IGlkZW50aWZ5XG4gKiBtdWx0aXBsZSBlZGdlcyBiZXR3ZWVuIHRoZSBzYW1lIHBhaXIgb2Ygbm9kZXMgaW4gYSBtdWx0aWdyYXBoLlxuICovXG5cbi8qKlxuICogQHRlbXBsYXRlIHt1bmtub3dufSBUXG4gKiBAdHlwZWRlZiB7VFtdIHwgUmVjb3JkPGFueSwgVD59IENvbGxlY3Rpb25cbiAqIExvZGFzaCBvYmplY3QgdGhhdCBjYW4gYmUgaXRlcmF0ZWQgb3ZlciB3aXRoIGBfLmVhY2hgLlxuICpcbiAqIEJld2FyZSwgb2JqZWN0cyB3aXRoIGAubGVuZ3RoYCBhcmUgdHJlYXRlZCBhcyBhcnJheXMsIHNlZVxuICogaHR0cHM6Ly9sb2Rhc2guY29tL2RvY3MvNC4xNy4xNSNmb3JFYWNoXG4gKi9cblxuLy8gSW1wbGVtZW50YXRpb24gbm90ZXM6XG4vL1xuLy8gICogTm9kZSBpZCBxdWVyeSBmdW5jdGlvbnMgc2hvdWxkIHJldHVybiBzdHJpbmcgaWRzIGZvciB0aGUgbm9kZXNcbi8vICAqIEVkZ2UgaWQgcXVlcnkgZnVuY3Rpb25zIHNob3VsZCByZXR1cm4gYW4gXCJlZGdlT2JqXCIsIGVkZ2Ugb2JqZWN0LCB0aGF0IGlzXG4vLyAgICBjb21wb3NlZCBvZiBlbm91Z2ggaW5mb3JtYXRpb24gdG8gdW5pcXVlbHkgaWRlbnRpZnkgYW4gZWRnZToge3YsIHcsIG5hbWV9LlxuLy8gICogSW50ZXJuYWxseSB3ZSB1c2UgYW4gXCJlZGdlSWRcIiwgYSBzdHJpbmdpZmllZCBmb3JtIG9mIHRoZSBlZGdlT2JqLCB0b1xuLy8gICAgcmVmZXJlbmNlIGVkZ2VzLiBUaGlzIGlzIGJlY2F1c2Ugd2UgbmVlZCBhIHBlcmZvcm1hbnQgd2F5IHRvIGxvb2sgdGhlc2Vcbi8vICAgIGVkZ2VzIHVwIGFuZCwgb2JqZWN0IHByb3BlcnRpZXMsIHdoaWNoIGhhdmUgc3RyaW5nIGtleXMsIGFyZSB0aGUgY2xvc2VzdFxuLy8gICAgd2UncmUgZ29pbmcgdG8gZ2V0IHRvIGEgcGVyZm9ybWFudCBoYXNodGFibGUgaW4gSmF2YVNjcmlwdC5cblxuLy8gSW1wbGVtZW50YXRpb24gbm90ZXM6XG4vL1xuLy8gICogTm9kZSBpZCBxdWVyeSBmdW5jdGlvbnMgc2hvdWxkIHJldHVybiBzdHJpbmcgaWRzIGZvciB0aGUgbm9kZXNcbi8vICAqIEVkZ2UgaWQgcXVlcnkgZnVuY3Rpb25zIHNob3VsZCByZXR1cm4gYW4gXCJlZGdlT2JqXCIsIGVkZ2Ugb2JqZWN0LCB0aGF0IGlzXG4vLyAgICBjb21wb3NlZCBvZiBlbm91Z2ggaW5mb3JtYXRpb24gdG8gdW5pcXVlbHkgaWRlbnRpZnkgYW4gZWRnZToge3YsIHcsIG5hbWV9LlxuLy8gICogSW50ZXJuYWxseSB3ZSB1c2UgYW4gXCJlZGdlSWRcIiwgYSBzdHJpbmdpZmllZCBmb3JtIG9mIHRoZSBlZGdlT2JqLCB0b1xuLy8gICAgcmVmZXJlbmNlIGVkZ2VzLiBUaGlzIGlzIGJlY2F1c2Ugd2UgbmVlZCBhIHBlcmZvcm1hbnQgd2F5IHRvIGxvb2sgdGhlc2Vcbi8vICAgIGVkZ2VzIHVwIGFuZCwgb2JqZWN0IHByb3BlcnRpZXMsIHdoaWNoIGhhdmUgc3RyaW5nIGtleXMsIGFyZSB0aGUgY2xvc2VzdFxuLy8gICAgd2UncmUgZ29pbmcgdG8gZ2V0IHRvIGEgcGVyZm9ybWFudCBoYXNodGFibGUgaW4gSmF2YVNjcmlwdC5cblxuLyoqXG4gKiBAdHlwZWRlZiB7b2JqZWN0fSBHcmFwaE9wdGlvbnNcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbiB8IHVuZGVmaW5lZH0gW2RpcmVjdGVkXSAtIHNldCB0byBgdHJ1ZWAgdG8gZ2V0IGFcbiAqIGRpcmVjdGVkIGdyYXBoIGFuZCBgZmFsc2VgIHRvIGdldCBhbiB1bmRpcmVjdGVkIGdyYXBoLlxuICogQW4gdW5kaXJlY3RlZCBncmFwaCBkb2VzIG5vdCB0cmVhdCB0aGUgb3JkZXIgb2Ygbm9kZXMgaW4gYW4gZWRnZSBhc1xuICogc2lnbmlmaWNhbnQuXG4gKiBJbiBvdGhlciB3b3JkcywgYGcuZWRnZShcImFcIiwgXCJiXCIpID09PSBnLmVkZ2UoXCJiXCIsIFwiYVwiKWAgZm9yXG4gKiBhbiB1bmRpcmVjdGVkIGdyYXBoLlxuICogRGVmYXVsdDogYHRydWVgXG4gKiBAcHJvcGVydHkge2Jvb2xlYW4gfCB1bmRlZmluZWR9IFttdWx0aWdyYXBoXSAtIHNldCB0byBgdHJ1ZWAgdG8gYWxsb3cgYVxuICogZ3JhcGggdG8gaGF2ZSBtdWx0aXBsZSBlZGdlcyBiZXR3ZWVuIHRoZSBzYW1lIHBhaXIgb2Ygbm9kZXMuXG4gKiBEZWZhdWx0OiBgZmFsc2VgLlxuICogQHByb3BlcnR5IHtib29sZWFuIHwgdW5kZWZpbmVkfSBbY29tcG91bmRdIC0gc2V0IHRvIGB0cnVlYCB0byBhbGxvdyBhXG4gKiBncmFwaCB0byBoYXZlIGNvbXBvdW5kIG5vZGVzIC0gbm9kZXMgd2hpY2ggY2FuIGJlIHRoZSBwYXJlbnQgb2Ygb3RoZXJcbiAqIG5vZGVzLlxuICogRGVmYXVsdDogYGZhbHNlYC5cbiAqL1xuXG4vKipcbiAqIEdyYXBobGliIGhhcyBhIHNpbmdsZSBncmFwaCB0eXBlOiB7QGxpbmsgR3JhcGh9LiBUbyBjcmVhdGUgYSBuZXcgaW5zdGFuY2U6XG4gKlxuICogYGBganNcbiAqIHZhciBnID0gbmV3IEdyYXBoKCk7XG4gKiBgYGBcbiAqXG4gKiBCeSBkZWZhdWx0IHRoaXMgd2lsbCBjcmVhdGUgYSBkaXJlY3RlZCBncmFwaCB0aGF0IGRvZXMgbm90IGFsbG93IG11bHRpLWVkZ2VzXG4gKiBvciBjb21wb3VuZCBub2Rlcy5cbiAqIFRoZSBmb2xsb3dpbmcgb3B0aW9ucyBjYW4gYmUgdXNlZCB3aGVuIGNvbnN0cnVjdGluZyBhIG5ldyBncmFwaDpcbiAqXG4gKiAqIHtAbGluayBHcmFwaE9wdGlvbnMjZGlyZWN0ZWR9OiBzZXQgdG8gYHRydWVgIHRvIGdldCBhIGRpcmVjdGVkIGdyYXBoIGFuZCBgZmFsc2VgIHRvIGdldCBhblxuICogICB1bmRpcmVjdGVkIGdyYXBoLlxuICogICBBbiB1bmRpcmVjdGVkIGdyYXBoIGRvZXMgbm90IHRyZWF0IHRoZSBvcmRlciBvZiBub2RlcyBpbiBhbiBlZGdlIGFzXG4gKiAgIHNpZ25pZmljYW50LiBJbiBvdGhlciB3b3JkcyxcbiAqICAgYGcuZWRnZShcImFcIiwgXCJiXCIpID09PSBnLmVkZ2UoXCJiXCIsIFwiYVwiKWAgZm9yIGFuIHVuZGlyZWN0ZWQgZ3JhcGguXG4gKiAgIERlZmF1bHQ6IGB0cnVlYC5cbiAqICoge0BsaW5rIEdyYXBoT3B0aW9ucyNtdWx0aWdyYXBofTogc2V0IHRvIGB0cnVlYCB0byBhbGxvdyBhIGdyYXBoIHRvIGhhdmUgbXVsdGlwbGUgZWRnZXNcbiAqICAgYmV0d2VlbiB0aGUgc2FtZSBwYWlyIG9mIG5vZGVzLiBEZWZhdWx0OiBgZmFsc2VgLlxuICogKiB7QGxpbmsgR3JhcGhPcHRpb25zI2NvbXBvdW5kfTogc2V0IHRvIGB0cnVlYCB0byBhbGxvdyBhIGdyYXBoIHRvIGhhdmUgY29tcG91bmQgbm9kZXMgLVxuICogICBub2RlcyB3aGljaCBjYW4gYmUgdGhlIHBhcmVudCBvZiBvdGhlciBub2Rlcy4gRGVmYXVsdDogYGZhbHNlYC5cbiAqXG4gKiBUbyBzZXQgdGhlIG9wdGlvbnMsIHBhc3MgaW4gYW4gb3B0aW9ucyBvYmplY3QgdG8gdGhlIGBHcmFwaGAgY29uc3RydWN0b3IuXG4gKiBGb3IgZXhhbXBsZSwgdG8gY3JlYXRlIGEgZGlyZWN0ZWQgY29tcG91bmQgbXVsdGlncmFwaDpcbiAqXG4gKiBgYGBqc1xuICogdmFyIGcgPSBuZXcgR3JhcGgoeyBkaXJlY3RlZDogdHJ1ZSwgY29tcG91bmQ6IHRydWUsIG11bHRpZ3JhcGg6IHRydWUgfSk7XG4gKiBgYGBcbiAqXG4gKiAjIyMgTm9kZSBhbmQgRWRnZSBSZXByZXNlbnRhdGlvblxuICpcbiAqIEluIGdyYXBobGliLCBhIG5vZGUgaXMgcmVwcmVzZW50ZWQgYnkgYSB1c2VyLXN1cHBsaWVkIFN0cmluZyBpZC5cbiAqIEFsbCBub2RlIHJlbGF0ZWQgZnVuY3Rpb25zIHVzZSB0aGlzIFN0cmluZyBpZCBhcyBhIHdheSB0byB1bmlxdWVseSBpZGVudGlmeVxuICogdGhlIG5vZGUuIEhlcmUgaXMgYW4gZXhhbXBsZSBvZiBpbnRlcmFjdGluZyB3aXRoIG5vZGVzOlxuICpcbiAqIGBgYGpzXG4gKiB2YXIgZyA9IG5ldyBHcmFwaCgpO1xuICogZy5zZXROb2RlKFwibXktaWRcIiwgXCJteS1sYWJlbFwiKTtcbiAqIGcubm9kZShcIm15LWlkXCIpOyAvLyByZXR1cm5zIFwibXktbGFiZWxcIlxuICogYGBgXG4gKlxuICogRWRnZXMgaW4gZ3JhcGhsaWIgYXJlIGlkZW50aWZpZWQgYnkgdGhlIG5vZGVzIHRoZXkgY29ubmVjdC4gRm9yIGV4YW1wbGU6XG4gKlxuICogYGBganNcbiAqIHZhciBnID0gbmV3IEdyYXBoKCk7XG4gKiBnLnNldEVkZ2UoXCJzb3VyY2VcIiwgXCJ0YXJnZXRcIiwgXCJteS1sYWJlbFwiKTtcbiAqIGcuZWRnZShcInNvdXJjZVwiLCBcInRhcmdldFwiKTsgLy8gcmV0dXJucyBcIm15LWxhYmVsXCJcbiAqIGBgYFxuICpcbiAqIEhvd2V2ZXIsIHdlIG5lZWQgYSB3YXkgdG8gdW5pcXVlbHkgaWRlbnRpZnkgYW4gZWRnZSBpbiBhIHNpbmdsZSBvYmplY3QgZm9yXG4gKiB2YXJpb3VzIGVkZ2UgcXVlcmllcyAoZS5nLiB7QGxpbmsgR3JhcGgjb3V0RWRnZXN9KS5cbiAqIFdlIHVzZSB7QGxpbmsgRWRnZU9ian1zIGZvciB0aGlzIHB1cnBvc2UuXG4gKiBUaGV5IGNvbnNpc3Qgb2YgdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICpcbiAqICoge0BsaW5rIEVkZ2VPYmojdn06IHRoZSBpZCBvZiB0aGUgc291cmNlIG9yIHRhaWwgbm9kZSBvZiBhbiBlZGdlXG4gKiAqIHtAbGluayBFZGdlT2JqI3d9OiB0aGUgaWQgb2YgdGhlIHRhcmdldCBvciBoZWFkIG5vZGUgb2YgYW4gZWRnZVxuICogKiB7QGxpbmsgRWRnZU9iaiNuYW1lfSAob3B0aW9uYWwpOiB0aGUgbmFtZSB0aGF0IHVuaXF1ZWx5IGlkZW50aWZpZXMgYSBtdWx0aWVkZ2UuXG4gKlxuICogQW55IGVkZ2UgZnVuY3Rpb24gdGhhdCB0YWtlcyBhbiBlZGdlIGlkIHdpbGwgYWxzbyB3b3JrIHdpdGggYW4ge0BsaW5rIEVkZ2VPYmp9LiBGb3IgZXhhbXBsZTpcbiAqXG4gKiBgYGBqc1xuICogdmFyIGcgPSBuZXcgR3JhcGgoKTtcbiAqIGcuc2V0RWRnZShcInNvdXJjZVwiLCBcInRhcmdldFwiLCBcIm15LWxhYmVsXCIpO1xuICogZy5lZGdlKHsgdjogXCJzb3VyY2VcIiwgdzogXCJ0YXJnZXRcIiB9KTsgLy8gcmV0dXJucyBcIm15LWxhYmVsXCJcbiAqIGBgYFxuICpcbiAqICMjIyBNdWx0aWdyYXBoc1xuICpcbiAqIEEgW211bHRpZ3JhcGhdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL011bHRpZ3JhcGgpIGlzIGEgZ3JhcGggdGhhdCBjYW5cbiAqIGhhdmUgbW9yZSB0aGFuIG9uZSBlZGdlIGJldHdlZW4gdGhlIHNhbWUgcGFpciBvZiBub2Rlcy5cbiAqIEJ5IGRlZmF1bHQgZ3JhcGhsaWIgZ3JhcGhzIGFyZSBub3QgbXVsdGlncmFwaHMsIGJ1dCBhIG11bHRpZ3JhcGggY2FuIGJlXG4gKiBjb25zdHJ1Y3RlZCBieSBzZXR0aW5nIHRoZSB7QGxpbmsgR3JhcGhPcHRpb25zI211bHRpZ3JhcGh9IHByb3BlcnR5IHRvIHRydWU6XG4gKlxuICogYGBganNcbiAqIHZhciBnID0gbmV3IEdyYXBoKHsgbXVsdGlncmFwaDogdHJ1ZSB9KTtcbiAqIGBgYFxuICpcbiAqIFdpdGggbXVsdGlwbGUgZWRnZXMgYmV0d2VlbiB0d28gbm9kZXMgd2UgbmVlZCBzb21lIHdheSB0byB1bmlxdWVseSBpZGVudGlmeVxuICogZWFjaCBlZGdlLiBXZSBjYWxsIHRoaXMgdGhlIHtAbGluayBFZGdlT2JqI25hbWV9IHByb3BlcnR5LlxuICogSGVyZSdzIGFuIGV4YW1wbGUgb2YgY3JlYXRpbmcgYSBjb3VwbGUgb2YgZWRnZXMgYmV0d2VlbiB0aGUgc2FtZSBub2RlczpcbiAqXG4gKiBgYGBqc1xuICogdmFyIGcgPSBuZXcgR3JhcGgoeyBtdWx0aWdyYXBoOiB0cnVlIH0pO1xuICogZy5zZXRFZGdlKFwiYVwiLCBcImJcIiwgXCJlZGdlMS1sYWJlbFwiLCBcImVkZ2UxXCIpO1xuICogZy5zZXRFZGdlKFwiYVwiLCBcImJcIiwgXCJlZGdlMi1sYWJlbFwiLCBcImVkZ2UyXCIpO1xuICogZy5lZGdlKFwiYVwiLCBcImJcIiwgXCJlZGdlMVwiKTsgLy8gcmV0dXJucyBcImVkZ2UxLWxhYmVsXCJcbiAqIGcuZWRnZShcImFcIiwgXCJiXCIsIFwiZWRnZTJcIik7IC8vIHJldHVybnMgXCJlZGdlMi1sYWJlbFwiXG4gKiBnLmVkZ2VzKCk7IC8vIHJldHVybnMgW3sgdjogXCJhXCIsIHc6IFwiYlwiLCBuYW1lOiBcImVkZ2UxXCIgfSxcbiAqICAgICAgICAgICAgLy8gICAgICAgICAgeyB2OiBcImFcIiwgdzogXCJiXCIsIG5hbWU6IFwiZWRnZTJcIiB9XVxuICogYGBgXG4gKlxuICogQSBtdWx0aWdyYXBoIHN0aWxsIGFsbG93cyBhbiBlZGdlIHdpdGggbm8gbmFtZSB0byBiZSBjcmVhdGVkOlxuICpcbiAqIGBgYGpzXG4gKiB2YXIgZyA9IG5ldyBHcmFwaCh7IG11bHRpZ3JhcGg6IHRydWUgfSk7XG4gKiBnLnNldEVkZ2UoXCJhXCIsIFwiYlwiLCBcIm15LWxhYmVsXCIpO1xuICogZy5lZGdlKHsgdjogXCJhXCIsIHc6IFwiYlwiIH0pOyAvLyByZXR1cm5zIFwibXktbGFiZWxcIlxuICogYGBgXG4gKlxuICogIyMjIENvbXBvdW5kIEdyYXBoc1xuICpcbiAqIEEgY29tcG91bmQgZ3JhcGggaXMgb25lIHdoZXJlIGEgbm9kZSBjYW4gYmUgdGhlIHBhcmVudCBvZiBvdGhlciBub2Rlcy5cbiAqIFRoZSBjaGlsZCBub2RlcyBmb3JtIGEgXCJzdWJncmFwaFwiLlxuICogSGVyZSdzIGFuIGV4YW1wbGUgb2YgY29uc3RydWN0aW5nIGFuZCBpbnRlcmFjdGluZyB3aXRoIGEgY29tcG91bmQgZ3JhcGg6XG4gKlxuICogYGBganNcbiAqIHZhciBnID0gbmV3IEdyYXBoKHsgY29tcG91bmQ6IHRydWUgfSk7XG4gKiBnLnNldFBhcmVudChcImFcIiwgXCJwYXJlbnRcIik7XG4gKiBnLnNldFBhcmVudChcImJcIiwgXCJwYXJlbnRcIik7XG4gKiBnLnBhcmVudChcImFcIik7ICAgICAgLy8gcmV0dXJucyBcInBhcmVudFwiXG4gKiBnLnBhcmVudChcImJcIik7ICAgICAgLy8gcmV0dXJucyBcInBhcmVudFwiXG4gKiBnLnBhcmVudChcInBhcmVudFwiKTsgLy8gcmV0dXJucyB1bmRlZmluZWRcbiAqIGBgYFxuICpcbiAqICMjIyBEZWZhdWx0IExhYmVsc1xuICpcbiAqIFdoZW4gYSBub2RlIG9yIGVkZ2UgaXMgY3JlYXRlZCB3aXRob3V0IGEgbGFiZWwsIGEgZGVmYXVsdCBsYWJlbCBjYW4gYmUgYXNzaWduZWQuXG4gKiBTZWUge0BsaW5rIHNldERlZmF1bHROb2RlTGFiZWx9IGFuZCB7QGxpbmsgc2V0RGVmYXVsdEVkZ2VMYWJlbH0uXG4gKlxuICogQHRlbXBsYXRlIFtHcmFwaExhYmVsPWFueV0gLSBMYWJlbCBvZiB0aGUgZ3JhcGguXG4gKiBAdGVtcGxhdGUgW05vZGVMYWJlbD1hbnldIC0gTGFiZWwgb2YgYSBub2RlLlxuICogRXZlbiB0aG91Z2ggdGhpcyBpcyBhIFwibGFiZWxcIiwgdGhpcyBjb3VsZCBiZSBhbnkgdHlwZSB0aGF0IHRoZSB1c2VyIHJlcXVpcmVzXG4gKiAoYW5kIG1heSBuZWVkIHRvIGJlIGFuIG9iamVjdCBmb3Igc29tZSBsYXlvdXQvcmFua2luZyBhbGdvcml0aG1zIGluIGRhZ3JlKS5cbiAqIEB0ZW1wbGF0ZSBbRWRnZUxhYmVsPWFueV0gLSBMYWJlbCBvZiBhbiBlZGdlLlxuICogRXZlbiB0aG91Z2ggdGhpcyBpcyBhIFwibGFiZWxcIiwgdGhpcyBjb3VsZCBiZSBhbnkgdHlwZSB0aGF0IHRoZSB1c2VyIHJlcXVpcmVzLFxuICogKGFuZCBtYXkgbmVlZCB0byBiZSBhIG9iamVjdCBmb3IgcmFua2luZyBpbiBkYWdyZSkuXG4gKi9cbmV4cG9ydCBjbGFzcyBHcmFwaCB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge0dyYXBoT3B0aW9uc30gW29wdHNdIC0gR3JhcGggb3B0aW9ucy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKG9wdHMgPSB7fSkge1xuICAgIC8qKlxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5faXNEaXJlY3RlZCA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvcHRzLCAnZGlyZWN0ZWQnKVxuICAgICAgPyBvcHRzLmRpcmVjdGVkXG4gICAgICA6IHRydWU7XG4gICAgLyoqXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl9pc011bHRpZ3JhcGggPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob3B0cywgJ211bHRpZ3JhcGgnKVxuICAgICAgPyBvcHRzLm11bHRpZ3JhcGhcbiAgICAgIDogZmFsc2U7XG4gICAgLyoqXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl9pc0NvbXBvdW5kID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9wdHMsICdjb21wb3VuZCcpXG4gICAgICA/IG9wdHMuY29tcG91bmRcbiAgICAgIDogZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7R3JhcGhMYWJlbCB8IHVuZGVmaW5lZH1cbiAgICAgKiBMYWJlbCBmb3IgdGhlIGdyYXBoIGl0c2VsZlxuICAgICAqL1xuICAgIHRoaXMuX2xhYmVsID0gdW5kZWZpbmVkO1xuXG4gICAgLyoqXG4gICAgICogRGVmYXVsdCBsYWJlbCB0byBiZSBzZXQgd2hlbiBjcmVhdGluZyBhIG5ldyBub2RlLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7KHY6IE5vZGVJRCB8IG51bWJlcikgPT4gTm9kZUxhYmVsfVxuICAgICAqL1xuICAgIHRoaXMuX2RlZmF1bHROb2RlTGFiZWxGbiA9IF8uY29uc3RhbnQodW5kZWZpbmVkKTtcblxuICAgIC8qKlxuICAgICAqIERlZmF1bHQgbGFiZWwgdG8gYmUgc2V0IHdoZW4gY3JlYXRpbmcgYSBuZXcgZWRnZVxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7KHY6IE5vZGVJRCwgdzogTm9kZUlELCBuYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQpID0+IEVkZ2VMYWJlbH1cbiAgICAgKi9cbiAgICB0aGlzLl9kZWZhdWx0RWRnZUxhYmVsRm4gPSBfLmNvbnN0YW50KHVuZGVmaW5lZCk7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7UmVjb3JkPE5vZGVJRCwgTm9kZUxhYmVsPn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqXG4gICAgICogdiAtPiBsYWJlbFxuICAgICAqL1xuICAgIHRoaXMuX25vZGVzID0ge307XG5cbiAgICBpZiAodGhpcy5faXNDb21wb3VuZCkge1xuICAgICAgLyoqXG4gICAgICAgKiBAdHlwZSB7UmVjb3JkPE5vZGVJRCwgTm9kZUlEPn1cbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKiB2IC0+IHBhcmVudFxuICAgICAgICovXG4gICAgICB0aGlzLl9wYXJlbnQgPSB7fTtcblxuICAgICAgLyoqXG4gICAgICAgKiBAdHlwZSB7UmVjb3JkPE5vZGVJRCwgUmVjb3JkPE5vZGVJRCwgdHJ1ZT4+fVxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqIHYgLT4gY2hpbGRyZW5cbiAgICAgICAqL1xuICAgICAgdGhpcy5fY2hpbGRyZW4gPSB7fTtcbiAgICAgIHRoaXMuX2NoaWxkcmVuW0dSQVBIX05PREVdID0ge307XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHR5cGUge1JlY29yZDxOb2RlSUQsIFJlY29yZDxFZGdlSUQsIEVkZ2VPYmo+Pn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIHYgLT4gZWRnZU9ialxuICAgICAqL1xuICAgIHRoaXMuX2luID0ge307XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7UmVjb3JkPE5vZGVJRCwgUmVjb3JkPE5vZGVJRCwgbnVtYmVyPj59XG4gICAgICogQHByaXZhdGVcbiAgICAgKiB1IC0+IHYgLT4gTnVtYmVyXG4gICAgICovXG4gICAgdGhpcy5fcHJlZHMgPSB7fTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtSZWNvcmQ8Tm9kZUlELCBSZWNvcmQ8RWRnZUlELCBFZGdlT2JqPj59XG4gICAgICogQHByaXZhdGVcbiAgICAgKiB2IC0+IGVkZ2VPYmpcbiAgICAgKi9cbiAgICB0aGlzLl9vdXQgPSB7fTtcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtSZWNvcmQ8Tm9kZUlELCBSZWNvcmQ8Tm9kZUlELCBudW1iZXI+Pn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIHYgLT4gdyAtPiBOdW1iZXJcbiAgICAgKi9cbiAgICB0aGlzLl9zdWNzID0ge307XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7UmVjb3JkPEVkZ2VJRCwgRWRnZU9iaj59XG4gICAgICogQHByaXZhdGVcbiAgICAgKiBlIC0+IGVkZ2VPYmpcbiAgICAgKi9cbiAgICB0aGlzLl9lZGdlT2JqcyA9IHt9O1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUge1JlY29yZDxFZGdlSUQsIEVkZ2VMYWJlbD59XG4gICAgICogQHByaXZhdGVcbiAgICAgKiBlIC0+IGxhYmVsXG4gICAgICovXG4gICAgdGhpcy5fZWRnZUxhYmVscyA9IHt9O1xuICB9XG5cbiAgLyogPT09IEdyYXBoIGZ1bmN0aW9ucyA9PT09PT09PT0gKi9cblxuICAvKipcbiAgICpcbiAgICogQHJldHVybnMge2Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgZ3JhcGggaXMgW2RpcmVjdGVkXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9EaXJlY3RlZF9ncmFwaCkuXG4gICAqIEEgZGlyZWN0ZWQgZ3JhcGggdHJlYXRzIHRoZSBvcmRlciBvZiBub2RlcyBpbiBhbiBlZGdlIGFzIHNpZ25pZmljYW50IHdoZXJlYXMgYW5cbiAgICogW3VuZGlyZWN0ZWRdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0dyYXBoXyhtYXRoZW1hdGljcykjVW5kaXJlY3RlZF9ncmFwaClcbiAgICogZ3JhcGggZG9lcyBub3QuXG4gICAqIFRoaXMgZXhhbXBsZSBkZW1vbnN0cmF0ZXMgdGhlIGRpZmZlcmVuY2U6XG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqXG4gICAqIGBgYGpzXG4gICAqIHZhciBkaXJlY3RlZCA9IG5ldyBHcmFwaCh7IGRpcmVjdGVkOiB0cnVlIH0pO1xuICAgKiBkaXJlY3RlZC5zZXRFZGdlKFwiYVwiLCBcImJcIiwgXCJteS1sYWJlbFwiKTtcbiAgICogZGlyZWN0ZWQuZWRnZShcImFcIiwgXCJiXCIpOyAvLyByZXR1cm5zIFwibXktbGFiZWxcIlxuICAgKiBkaXJlY3RlZC5lZGdlKFwiYlwiLCBcImFcIik7IC8vIHJldHVybnMgdW5kZWZpbmVkXG4gICAqXG4gICAqIHZhciB1bmRpcmVjdGVkID0gbmV3IEdyYXBoKHsgZGlyZWN0ZWQ6IGZhbHNlIH0pO1xuICAgKiB1bmRpcmVjdGVkLnNldEVkZ2UoXCJhXCIsIFwiYlwiLCBcIm15LWxhYmVsXCIpO1xuICAgKiB1bmRpcmVjdGVkLmVkZ2UoXCJhXCIsIFwiYlwiKTsgLy8gcmV0dXJucyBcIm15LWxhYmVsXCJcbiAgICogdW5kaXJlY3RlZC5lZGdlKFwiYlwiLCBcImFcIik7IC8vIHJldHVybnMgXCJteS1sYWJlbFwiXG4gICAqIGBgYFxuICAgKi9cbiAgaXNEaXJlY3RlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5faXNEaXJlY3RlZDtcbiAgfVxuICAvKipcbiAgICogQHJldHVybnMge2Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgZ3JhcGggaXMgYSBtdWx0aWdyYXBoLlxuICAgKi9cbiAgaXNNdWx0aWdyYXBoKCkge1xuICAgIHJldHVybiB0aGlzLl9pc011bHRpZ3JhcGg7XG4gIH1cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtib29sZWFufSBgdHJ1ZWAgaWYgdGhlIGdyYXBoIGlzIGNvbXBvdW5kLlxuICAgKi9cbiAgaXNDb21wb3VuZCgpIHtcbiAgICByZXR1cm4gdGhpcy5faXNDb21wb3VuZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBsYWJlbCBmb3IgdGhlIGdyYXBoIHRvIGBsYWJlbGAuXG4gICAqXG4gICAqIEBwYXJhbSB7R3JhcGhMYWJlbH0gbGFiZWwgLSBMYWJlbCBmb3IgdGhlIGdyYXBoLlxuICAgKiBAcmV0dXJucyB7dGhpc31cbiAgICovXG4gIHNldEdyYXBoKGxhYmVsKSB7XG4gICAgdGhpcy5fbGFiZWwgPSBsYWJlbDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7R3JhcGhMYWJlbCB8IHVuZGVmaW5lZH0gdGhlIGN1cnJlbnRseSBhc3NpZ25lZCBsYWJlbCBmb3IgdGhlIGdyYXBoLlxuICAgKiBJZiBubyBsYWJlbCBoYXMgYmVlbiBhc3NpZ25lZCwgcmV0dXJucyBgdW5kZWZpbmVkYC5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICpcbiAgICogYGBganNcbiAgICogdmFyIGcgPSBuZXcgR3JhcGgoKTtcbiAgICogZy5ncmFwaCgpOyAvLyByZXR1cm5zIHVuZGVmaW5lZFxuICAgKiBnLnNldEdyYXBoKFwiZ3JhcGgtbGFiZWxcIik7XG4gICAqICBnLmdyYXBoKCk7IC8vIHJldHVybnMgXCJncmFwaC1sYWJlbFwiXG4gICAqIGBgYFxuICAgKi9cbiAgZ3JhcGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xhYmVsO1xuICB9XG4gIC8qID09PSBOb2RlIGZ1bmN0aW9ucyA9PT09PT09PT09ICovXG5cbiAgLyoqXG4gICAqIFNldHMgYSBuZXcgZGVmYXVsdCB2YWx1ZSB0aGF0IGlzIGFzc2lnbmVkIHRvIG5vZGVzIHRoYXQgYXJlIGNyZWF0ZWQgd2l0aG91dFxuICAgKiBhIGxhYmVsLlxuICAgKlxuICAgKiBAcGFyYW0ge3R5cGVvZiB0aGlzLl9kZWZhdWx0Tm9kZUxhYmVsRm4gfCBOb2RlTGFiZWx9IG5ld0RlZmF1bHQgLSBJZiBhIGZ1bmN0aW9uLFxuICAgKiBpdCBpcyBjYWxsZWQgd2l0aCB0aGUgaWQgb2YgdGhlIG5vZGUgYmVpbmcgY3JlYXRlZC5cbiAgICogT3RoZXJ3aXNlLCBpdCBpcyBhc3NpZ25lZCBhcyB0aGUgbGFiZWwgZGlyZWN0bHkuXG4gICAqIEByZXR1cm5zIHt0aGlzfVxuICAgKi9cbiAgc2V0RGVmYXVsdE5vZGVMYWJlbChuZXdEZWZhdWx0KSB7XG4gICAgaWYgKCFfLmlzRnVuY3Rpb24obmV3RGVmYXVsdCkpIHtcbiAgICAgIG5ld0RlZmF1bHQgPSBfLmNvbnN0YW50KG5ld0RlZmF1bHQpO1xuICAgIH1cbiAgICB0aGlzLl9kZWZhdWx0Tm9kZUxhYmVsRm4gPSBuZXdEZWZhdWx0O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IHRoZSBudW1iZXIgb2Ygbm9kZXMgaW4gdGhlIGdyYXBoLlxuICAgKi9cbiAgbm9kZUNvdW50KCkge1xuICAgIHJldHVybiB0aGlzLl9ub2RlQ291bnQ7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMge05vZGVJRFtdfSB0aGUgaWRzIG9mIHRoZSBub2RlcyBpbiB0aGUgZ3JhcGguXG4gICAqXG4gICAqIEByZW1hcmtzXG4gICAqIFVzZSB7QGxpbmsgbm9kZSgpfSB0byBnZXQgdGhlIGxhYmVsIGZvciBlYWNoIG5vZGUuXG4gICAqIFRha2VzIGBPKHxWfClgIHRpbWUuXG4gICAqL1xuICBub2RlcygpIHtcbiAgICByZXR1cm4gXy5rZXlzKHRoaXMuX25vZGVzKTtcbiAgfVxuICAvKipcbiAgICogQHJldHVybnMge05vZGVJRFtdfSB0aG9zZSBub2RlcyBpbiB0aGUgZ3JhcGggdGhhdCBoYXZlIG5vIGluLWVkZ2VzLlxuICAgKiBAcmVtYXJrcyBUYWtlcyBgTyh8VnwpYCB0aW1lLlxuICAgKi9cbiAgc291cmNlcygpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIF8uZmlsdGVyKHRoaXMubm9kZXMoKSwgZnVuY3Rpb24gKHYpIHtcbiAgICAgIHJldHVybiBfLmlzRW1wdHkoc2VsZi5faW5bdl0pO1xuICAgIH0pO1xuICB9XG4gIC8qKlxuICAgKiBAcmV0dXJucyB7Tm9kZUlEW119IHRob3NlIG5vZGVzIGluIHRoZSBncmFwaCB0aGF0IGhhdmUgbm8gb3V0LWVkZ2VzLlxuICAgKiBAcmVtYXJrcyBUYWtlcyBgTyh8VnwpYCB0aW1lLlxuICAgKi9cbiAgc2lua3MoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBfLmZpbHRlcih0aGlzLm5vZGVzKCksIGZ1bmN0aW9uICh2KSB7XG4gICAgICByZXR1cm4gXy5pc0VtcHR5KHNlbGYuX291dFt2XSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSW52b2tlcyBzZXROb2RlIG1ldGhvZCBmb3IgZWFjaCBub2RlIGluIGB2c2AgbGlzdC5cbiAgICpcbiAgICogQHBhcmFtIHtDb2xsZWN0aW9uPE5vZGVJRCB8IG51bWJlcj59IHZzIC0gTGlzdCBvZiBub2RlIElEcyB0byBjcmVhdGUvc2V0LlxuICAgKiBAcGFyYW0ge05vZGVMYWJlbH0gW3ZhbHVlXSAtIElmIHNldCwgdXBkYXRlIGFsbCBub2RlcyB3aXRoIHRoaXMgdmFsdWUuXG4gICAqIEByZXR1cm5zIHt0aGlzfVxuICAgKiBAcmVtYXJrcyBDb21wbGV4aXR5OiBPKHxuYW1lc3wpLlxuICAgKi9cbiAgc2V0Tm9kZXModnMsIHZhbHVlKSB7XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIF8uZWFjaCh2cywgZnVuY3Rpb24gKHYpIHtcbiAgICAgIGlmIChhcmdzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgc2VsZi5zZXROb2RlKHYsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGYuc2V0Tm9kZSh2KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIG9yIHVwZGF0ZXMgdGhlIHZhbHVlIGZvciB0aGUgbm9kZSBgdmAgaW4gdGhlIGdyYXBoLlxuICAgKlxuICAgKiBAcGFyYW0ge05vZGVJRCB8IG51bWJlcn0gdiAtIElEIG9mIHRoZSBub2RlIHRvIGNyZWF0ZS9zZXQuXG4gICAqIEBwYXJhbSB7Tm9kZUxhYmVsfSBbdmFsdWVdIC0gSWYgc3VwcGxpZWQsIGl0IGlzIHNldCBhcyB0aGUgdmFsdWUgZm9yIHRoZSBub2RlLlxuICAgKiBJZiBub3Qgc3VwcGxpZWQgYW5kIHRoZSBub2RlIHdhcyBjcmVhdGVkIGJ5IHRoaXMgY2FsbCB0aGVuXG4gICAqIHtAbGluayBzZXREZWZhdWx0Tm9kZUxhYmVsfSB3aWxsIGJlIHVzZWQgdG8gc2V0IHRoZSBub2RlJ3MgdmFsdWUuXG4gICAqIEByZXR1cm5zIHt0aGlzfSB0aGUgZ3JhcGgsIGFsbG93aW5nIHRoaXMgdG8gYmUgY2hhaW5lZCB3aXRoIG90aGVyIGZ1bmN0aW9ucy5cbiAgICogQHJlbWFya3MgVGFrZXMgYE8oMSlgIHRpbWUuXG4gICAqL1xuICBzZXROb2RlKHYsIHZhbHVlKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLl9ub2RlcywgdikpIHtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICB0aGlzLl9ub2Rlc1t2XSA9IHZhbHVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5fbm9kZXNbdl0gPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IHZhbHVlIDogdGhpcy5fZGVmYXVsdE5vZGVMYWJlbEZuKHYpO1xuICAgIGlmICh0aGlzLl9pc0NvbXBvdW5kKSB7XG4gICAgICB0aGlzLl9wYXJlbnRbdl0gPSBHUkFQSF9OT0RFO1xuICAgICAgdGhpcy5fY2hpbGRyZW5bdl0gPSB7fTtcbiAgICAgIHRoaXMuX2NoaWxkcmVuW0dSQVBIX05PREVdW3ZdID0gdHJ1ZTtcbiAgICB9XG4gICAgdGhpcy5faW5bdl0gPSB7fTtcbiAgICB0aGlzLl9wcmVkc1t2XSA9IHt9O1xuICAgIHRoaXMuX291dFt2XSA9IHt9O1xuICAgIHRoaXMuX3N1Y3Nbdl0gPSB7fTtcbiAgICArK3RoaXMuX25vZGVDb3VudDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBsYWJlbCBvZiBub2RlIHdpdGggc3BlY2lmaWVkIG5hbWUuXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZUlEIHwgbnVtYmVyfSB2IC0gTm9kZSBJRC5cbiAgICogQHJldHVybnMge05vZGVMYWJlbCB8IHVuZGVmaW5lZH0gdGhlIGxhYmVsIGFzc2lnbmVkIHRvIHRoZSBub2RlIHdpdGggdGhlIGlkIGB2YFxuICAgKiBpZiBpdCBpcyBpbiB0aGUgZ3JhcGguXG4gICAqIE90aGVyd2lzZSByZXR1cm5zIGB1bmRlZmluZWRgLlxuICAgKiBAcmVtYXJrcyBUYWtlcyBgTygxKWAgdGltZS5cbiAgICovXG4gIG5vZGUodikge1xuICAgIHJldHVybiB0aGlzLl9ub2Rlc1t2XTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlY3RzIHdoZXRoZXIgZ3JhcGggaGFzIGEgbm9kZSB3aXRoIHNwZWNpZmllZCBuYW1lIG9yIG5vdC5cbiAgICpcbiAgICogQHBhcmFtIHtOb2RlSUQgfCBudW1iZXJ9IHYgLSBOb2RlIElELlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgdGhlIGdyYXBoIGhhcyBhIG5vZGUgd2l0aCB0aGUgaWQuXG4gICAqIEByZW1hcmtzIFRha2VzIGBPKDEpYCB0aW1lLlxuICAgKi9cbiAgaGFzTm9kZSh2KSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLl9ub2Rlcywgdik7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIHRoZSBub2RlIHdpdGggdGhlIGlkIGB2YCBpbiB0aGUgZ3JhcGggb3IgZG8gbm90aGluZyBpZiB0aGUgbm9kZSBpc1xuICAgKiBub3QgaW4gdGhlIGdyYXBoLlxuICAgKlxuICAgKiBJZiB0aGUgbm9kZSB3YXMgcmVtb3ZlZCB0aGlzIGZ1bmN0aW9uIGFsc28gcmVtb3ZlcyBhbnkgaW5jaWRlbnQgZWRnZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZUlEIHwgbnVtYmVyfSB2IC0gTm9kZSBJRCB0byByZW1vdmUuXG4gICAqIEByZXR1cm5zIHt0aGlzfSB0aGUgZ3JhcGgsIGFsbG93aW5nIHRoaXMgdG8gYmUgY2hhaW5lZCB3aXRoIG90aGVyIGZ1bmN0aW9ucy5cbiAgICogQHJlbWFya3MgVGFrZXMgYE8ofEV8KWAgdGltZS5cbiAgICovXG4gIHJlbW92ZU5vZGUodikge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5fbm9kZXMsIHYpKSB7XG4gICAgICB2YXIgcmVtb3ZlRWRnZSA9IChlKSA9PiB0aGlzLnJlbW92ZUVkZ2UodGhpcy5fZWRnZU9ianNbZV0pO1xuICAgICAgZGVsZXRlIHRoaXMuX25vZGVzW3ZdO1xuICAgICAgaWYgKHRoaXMuX2lzQ29tcG91bmQpIHtcbiAgICAgICAgdGhpcy5fcmVtb3ZlRnJvbVBhcmVudHNDaGlsZExpc3Qodik7XG4gICAgICAgIGRlbGV0ZSB0aGlzLl9wYXJlbnRbdl07XG4gICAgICAgIF8uZWFjaCh0aGlzLmNoaWxkcmVuKHYpLCAoY2hpbGQpID0+IHtcbiAgICAgICAgICB0aGlzLnNldFBhcmVudChjaGlsZCk7XG4gICAgICAgIH0pO1xuICAgICAgICBkZWxldGUgdGhpcy5fY2hpbGRyZW5bdl07XG4gICAgICB9XG4gICAgICBfLmVhY2goXy5rZXlzKHRoaXMuX2luW3ZdKSwgcmVtb3ZlRWRnZSk7XG4gICAgICBkZWxldGUgdGhpcy5faW5bdl07XG4gICAgICBkZWxldGUgdGhpcy5fcHJlZHNbdl07XG4gICAgICBfLmVhY2goXy5rZXlzKHRoaXMuX291dFt2XSksIHJlbW92ZUVkZ2UpO1xuICAgICAgZGVsZXRlIHRoaXMuX291dFt2XTtcbiAgICAgIGRlbGV0ZSB0aGlzLl9zdWNzW3ZdO1xuICAgICAgLS10aGlzLl9ub2RlQ291bnQ7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHBhcmVudCBmb3IgYHZgIHRvIGBwYXJlbnRgIGlmIGl0IGlzIGRlZmluZWQgb3IgcmVtb3ZlcyB0aGUgcGFyZW50XG4gICAqIGZvciBgdmAgaWYgYHBhcmVudGAgaXMgdW5kZWZpbmVkLlxuICAgKlxuICAgKiBAcGFyYW0ge05vZGVJRCB8IG51bWJlcn0gdiAtIE5vZGUgSUQgdG8gc2V0IHRoZSBwYXJlbnQgZm9yLlxuICAgKiBAcGFyYW0ge05vZGVJRCB8IG51bWJlcn0gW3BhcmVudF0gLSBQYXJlbnQgbm9kZSBJRC4gSWYgbm90IGRlZmluZWQsIHJlbW92ZXMgdGhlIHBhcmVudC5cbiAgICogQHJldHVybnMge3RoaXN9IHRoZSBncmFwaCwgYWxsb3dpbmcgdGhpcyB0byBiZSBjaGFpbmVkIHdpdGggb3RoZXIgZnVuY3Rpb25zLlxuICAgKiBAdGhyb3dzIGlmIHRoZSBncmFwaCBpcyBub3QgY29tcG91bmQuXG4gICAqIEB0aHJvd3MgaWYgc2V0dGluZyB0aGUgcGFyZW50IHdvdWxkIGNyZWF0ZSBhIGN5Y2xlLlxuICAgKiBAcmVtYXJrcyBUYWtlcyBgTygxKWAgdGltZS5cbiAgICovXG4gIHNldFBhcmVudCh2LCBwYXJlbnQpIHtcbiAgICBpZiAoIXRoaXMuX2lzQ29tcG91bmQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHNldCBwYXJlbnQgaW4gYSBub24tY29tcG91bmQgZ3JhcGgnKTtcbiAgICB9XG5cbiAgICBpZiAoXy5pc1VuZGVmaW5lZChwYXJlbnQpKSB7XG4gICAgICBwYXJlbnQgPSBHUkFQSF9OT0RFO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBDb2VyY2UgcGFyZW50IHRvIHN0cmluZ1xuICAgICAgcGFyZW50ICs9ICcnO1xuICAgICAgZm9yICh2YXIgYW5jZXN0b3IgPSBwYXJlbnQ7ICFfLmlzVW5kZWZpbmVkKGFuY2VzdG9yKTsgYW5jZXN0b3IgPSB0aGlzLnBhcmVudChhbmNlc3RvcikpIHtcbiAgICAgICAgaWYgKGFuY2VzdG9yID09PSB2KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZXR0aW5nICcgKyBwYXJlbnQgKyAnIGFzIHBhcmVudCBvZiAnICsgdiArICcgd291bGQgY3JlYXRlIGEgY3ljbGUnKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnNldE5vZGUocGFyZW50KTtcbiAgICB9XG5cbiAgICB0aGlzLnNldE5vZGUodik7XG4gICAgdGhpcy5fcmVtb3ZlRnJvbVBhcmVudHNDaGlsZExpc3Qodik7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtLSBXZSBjb2VyY2VkIHBhcmVudCB0byBhIHN0cmluZyBhYm92ZVxuICAgIHRoaXMuX3BhcmVudFt2XSA9IHBhcmVudDtcbiAgICB0aGlzLl9jaGlsZHJlbltwYXJlbnRdW3ZdID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge05vZGVJRCB8IG51bWJlcn0gdiAtIE5vZGUgSUQuXG4gICAqL1xuICBfcmVtb3ZlRnJvbVBhcmVudHNDaGlsZExpc3Qodikge1xuICAgIGRlbGV0ZSB0aGlzLl9jaGlsZHJlblt0aGlzLl9wYXJlbnRbdl1dW3ZdO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBwYXJlbnQgbm9kZSBmb3Igbm9kZSBgdmAuXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZUlEIHwgbnVtYmVyfSB2IC0gTm9kZSBJRC5cbiAgICogQHJldHVybnMge05vZGVJRCB8IHVuZGVmaW5lZH0gdGhlIG5vZGUgdGhhdCBpcyBhIHBhcmVudCBvZiBub2RlIGB2YFxuICAgKiBvciBgdW5kZWZpbmVkYCBpZiBub2RlIGB2YCBkb2VzIG5vdCBoYXZlIGEgcGFyZW50IG9yIGlzIG5vdCBhIG1lbWJlciBvZlxuICAgKiB0aGUgZ3JhcGguXG4gICAqIEFsd2F5cyByZXR1cm5zIGB1bmRlZmluZWRgIGZvciBncmFwaHMgdGhhdCBhcmUgbm90IGNvbXBvdW5kLlxuICAgKiBAcmVtYXJrcyBUYWtlcyBgTygxKWAgdGltZS5cbiAgICovXG4gIHBhcmVudCh2KSB7XG4gICAgaWYgKHRoaXMuX2lzQ29tcG91bmQpIHtcbiAgICAgIHZhciBwYXJlbnQgPSB0aGlzLl9wYXJlbnRbdl07XG4gICAgICBpZiAocGFyZW50ICE9PSBHUkFQSF9OT0RFKSB7XG4gICAgICAgIHJldHVybiBwYXJlbnQ7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgbGlzdCBvZiBkaXJlY3QgY2hpbGRyZW4gb2Ygbm9kZSB2LlxuICAgKlxuICAgKiBAcGFyYW0ge05vZGVJRCB8IG51bWJlcn0gW3ZdIC0gTm9kZSBJRC4gSWYgbm90IHNwZWNpZmllZCwgZ2V0cyBub2Rlc1xuICAgKiB3aXRoIG5vIHBhcmVudCAodG9wLWxldmVsIG5vZGVzKS5cbiAgICogQHJldHVybnMge05vZGVJRFtdIHwgdW5kZWZpbmVkfSBhbGwgbm9kZXMgdGhhdCBhcmUgY2hpbGRyZW4gb2Ygbm9kZSBgdmAgb3JcbiAgICogYHVuZGVmaW5lZGAgaWYgbm9kZSBgdmAgaXMgbm90IGluIHRoZSBncmFwaC5cbiAgICogQWx3YXlzIHJldHVybnMgYFtdYCBmb3IgZ3JhcGhzIHRoYXQgYXJlIG5vdCBjb21wb3VuZC5cbiAgICogQHJlbWFya3MgVGFrZXMgYE8ofFZ8KWAgdGltZS5cbiAgICovXG4gIGNoaWxkcmVuKHYpIHtcbiAgICBpZiAoXy5pc1VuZGVmaW5lZCh2KSkge1xuICAgICAgdiA9IEdSQVBIX05PREU7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2lzQ29tcG91bmQpIHtcbiAgICAgIHZhciBjaGlsZHJlbiA9IHRoaXMuX2NoaWxkcmVuW3ZdO1xuICAgICAgaWYgKGNoaWxkcmVuKSB7XG4gICAgICAgIHJldHVybiBfLmtleXMoY2hpbGRyZW4pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodiA9PT0gR1JBUEhfTk9ERSkge1xuICAgICAgcmV0dXJuIHRoaXMubm9kZXMoKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaGFzTm9kZSh2KSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge05vZGVJRCB8IG51bWJlcn0gdiAtIE5vZGUgSUQuXG4gICAqIEByZXR1cm5zIHtOb2RlSURbXSB8IHVuZGVmaW5lZH0gYWxsIG5vZGVzIHRoYXQgYXJlIHByZWRlY2Vzc29ycyBvZiB0aGVcbiAgICogc3BlY2lmaWVkIG5vZGUgb3IgYHVuZGVmaW5lZGAgaWYgbm9kZSBgdmAgaXMgbm90IGluIHRoZSBncmFwaC5cbiAgICogQHJlbWFya3NcbiAgICogQmVoYXZpb3IgaXMgdW5kZWZpbmVkIGZvciB1bmRpcmVjdGVkIGdyYXBocyAtIHVzZSB7QGxpbmsgbmVpZ2hib3JzfSBpbnN0ZWFkLlxuICAgKiBUYWtlcyBgTyh8VnwpYCB0aW1lLlxuICAgKi9cbiAgcHJlZGVjZXNzb3JzKHYpIHtcbiAgICB2YXIgcHJlZHNWID0gdGhpcy5fcHJlZHNbdl07XG4gICAgaWYgKHByZWRzVikge1xuICAgICAgcmV0dXJuIF8ua2V5cyhwcmVkc1YpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge05vZGVJRCB8IG51bWJlcn0gdiAtIE5vZGUgSUQuXG4gICAqIEByZXR1cm5zIHtOb2RlSURbXSB8IHVuZGVmaW5lZH0gYWxsIG5vZGVzIHRoYXQgYXJlIHN1Y2Nlc3NvcnMgb2YgdGhlXG4gICAqIHNwZWNpZmllZCBub2RlIG9yIGB1bmRlZmluZWRgIGlmIG5vZGUgYHZgIGlzIG5vdCBpbiB0aGUgZ3JhcGguXG4gICAqIEByZW1hcmtzXG4gICAqIEJlaGF2aW9yIGlzIHVuZGVmaW5lZCBmb3IgdW5kaXJlY3RlZCBncmFwaHMgLSB1c2Uge0BsaW5rIG5laWdoYm9yc30gaW5zdGVhZC5cbiAgICogVGFrZXMgYE8ofFZ8KWAgdGltZS5cbiAgICovXG4gIHN1Y2Nlc3NvcnModikge1xuICAgIHZhciBzdWNzViA9IHRoaXMuX3N1Y3Nbdl07XG4gICAgaWYgKHN1Y3NWKSB7XG4gICAgICByZXR1cm4gXy5rZXlzKHN1Y3NWKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtOb2RlSUQgfCBudW1iZXJ9IHYgLSBOb2RlIElELlxuICAgKiBAcmV0dXJucyB7Tm9kZUlEW10gfCB1bmRlZmluZWR9IGFsbCBub2RlcyB0aGF0IGFyZSBwcmVkZWNlc3NvcnMgb3JcbiAgICogc3VjY2Vzc29ycyBvZiB0aGUgc3BlY2lmaWVkIG5vZGVcbiAgICogb3IgYHVuZGVmaW5lZGAgaWYgbm9kZSBgdmAgaXMgbm90IGluIHRoZSBncmFwaC5cbiAgICogQHJlbWFya3MgVGFrZXMgYE8ofFZ8KWAgdGltZS5cbiAgICovXG4gIG5laWdoYm9ycyh2KSB7XG4gICAgdmFyIHByZWRzID0gdGhpcy5wcmVkZWNlc3NvcnModik7XG4gICAgaWYgKHByZWRzKSB7XG4gICAgICByZXR1cm4gXy51bmlvbihwcmVkcywgdGhpcy5zdWNjZXNzb3JzKHYpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtOb2RlSUQgfCBudW1iZXJ9IHYgLSBOb2RlIElELlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgbm9kZSBpcyBhIGxlYWYgKGhhcyBubyBzdWNjZXNzb3JzKSwgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgKi9cbiAgaXNMZWFmKHYpIHtcbiAgICB2YXIgbmVpZ2hib3JzO1xuICAgIGlmICh0aGlzLmlzRGlyZWN0ZWQoKSkge1xuICAgICAgbmVpZ2hib3JzID0gdGhpcy5zdWNjZXNzb3JzKHYpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZWlnaGJvcnMgPSB0aGlzLm5laWdoYm9ycyh2KTtcbiAgICB9XG4gICAgcmV0dXJuIG5laWdoYm9ycy5sZW5ndGggPT09IDA7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBuZXcgZ3JhcGggd2l0aCBub2RlcyBmaWx0ZXJlZCB2aWEgYGZpbHRlcmAuXG4gICAqIEVkZ2VzIGluY2lkZW50IHRvIHJlamVjdGVkIG5vZGVcbiAgICogYXJlIGFsc28gcmVtb3ZlZC5cbiAgICogXG4gICAqIEluIGNhc2Ugb2YgY29tcG91bmQgZ3JhcGgsIGlmIHBhcmVudCBpcyByZWplY3RlZCBieSBgZmlsdGVyYCxcbiAgICogdGhhbiBhbGwgaXRzIGNoaWxkcmVuIGFyZSByZWplY3RlZCB0b28uXG5cbiAgICogQHBhcmFtIHsodjogTm9kZUlEKSA9PiBib29sZWFufSBmaWx0ZXIgLSBGdW5jdGlvbiB0aGF0IHJldHVybnMgYHRydWVgIGZvciBub2RlcyB0byBrZWVwLlxuICAgKiBAcmV0dXJucyB7R3JhcGg8R3JhcGhMYWJlbCwgTm9kZUxhYmVsLCBFZGdlTGFiZWw+fSBBIG5ldyBncmFwaCBjb250YWluaW5nIG9ubHkgdGhlIG5vZGVzIGZvciB3aGljaCBgZmlsdGVyYCByZXR1cm5zIGB0cnVlYC5cbiAgICogQHJlbWFya3MgQXZlcmFnZS1jYXNlIGNvbXBsZXhpdHk6IE8ofEV8K3xWfCkuXG4gICAqL1xuICBmaWx0ZXJOb2RlcyhmaWx0ZXIpIHtcbiAgICAvKipcbiAgICAgKiBAdHlwZSB7R3JhcGg8R3JhcGhMYWJlbCwgTm9kZUxhYmVsLCBFZGdlTGFiZWw+fVxuICAgICAqL1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICB2YXIgY29weSA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKHtcbiAgICAgIGRpcmVjdGVkOiB0aGlzLl9pc0RpcmVjdGVkLFxuICAgICAgbXVsdGlncmFwaDogdGhpcy5faXNNdWx0aWdyYXBoLFxuICAgICAgY29tcG91bmQ6IHRoaXMuX2lzQ29tcG91bmQsXG4gICAgfSk7XG5cbiAgICBjb3B5LnNldEdyYXBoKHRoaXMuZ3JhcGgoKSk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgXy5lYWNoKHRoaXMuX25vZGVzLCBmdW5jdGlvbiAodmFsdWUsIHYpIHtcbiAgICAgIGlmIChmaWx0ZXIodikpIHtcbiAgICAgICAgY29weS5zZXROb2RlKHYsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIF8uZWFjaCh0aGlzLl9lZGdlT2JqcywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGlmIChjb3B5Lmhhc05vZGUoZS52KSAmJiBjb3B5Lmhhc05vZGUoZS53KSkge1xuICAgICAgICBjb3B5LnNldEVkZ2UoZSwgc2VsZi5lZGdlKGUpKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBwYXJlbnRzID0ge307XG4gICAgZnVuY3Rpb24gZmluZFBhcmVudCh2KSB7XG4gICAgICB2YXIgcGFyZW50ID0gc2VsZi5wYXJlbnQodik7XG4gICAgICBpZiAocGFyZW50ID09PSB1bmRlZmluZWQgfHwgY29weS5oYXNOb2RlKHBhcmVudCkpIHtcbiAgICAgICAgcGFyZW50c1t2XSA9IHBhcmVudDtcbiAgICAgICAgcmV0dXJuIHBhcmVudDtcbiAgICAgIH0gZWxzZSBpZiAocGFyZW50IGluIHBhcmVudHMpIHtcbiAgICAgICAgcmV0dXJuIHBhcmVudHNbcGFyZW50XTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmaW5kUGFyZW50KHBhcmVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2lzQ29tcG91bmQpIHtcbiAgICAgIF8uZWFjaChjb3B5Lm5vZGVzKCksIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIGNvcHkuc2V0UGFyZW50KHYsIGZpbmRQYXJlbnQodikpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvcHk7XG4gIH1cblxuICAvKiA9PT0gRWRnZSBmdW5jdGlvbnMgPT09PT09PT09PSAqL1xuXG4gIC8qKlxuICAgKiBTZXRzIGEgbmV3IGRlZmF1bHQgdmFsdWUgdGhhdCBpcyBhc3NpZ25lZCB0byBlZGdlcyB0aGF0IGFyZSBjcmVhdGVkIHdpdGhvdXRcbiAgICogYSBsYWJlbC5cbiAgICpcbiAgICogQHBhcmFtIHt0eXBlb2YgdGhpcy5fZGVmYXVsdEVkZ2VMYWJlbEZuIHwgRWRnZUxhYmVsfSBuZXdEZWZhdWx0IC0gSWYgYSBmdW5jdGlvbixcbiAgICogaXQgaXMgY2FsbGVkIHdpdGggdGhlIHBhcmFtZXRlcnMgYCh2LCB3LCBuYW1lKWAuXG4gICAqIE90aGVyd2lzZSwgaXQgaXMgYXNzaWduZWQgYXMgdGhlIGxhYmVsIGRpcmVjdGx5LlxuICAgKiBAcmV0dXJucyB7dGhpc31cbiAgICovXG4gIHNldERlZmF1bHRFZGdlTGFiZWwobmV3RGVmYXVsdCkge1xuICAgIGlmICghXy5pc0Z1bmN0aW9uKG5ld0RlZmF1bHQpKSB7XG4gICAgICBuZXdEZWZhdWx0ID0gXy5jb25zdGFudChuZXdEZWZhdWx0KTtcbiAgICB9XG4gICAgdGhpcy5fZGVmYXVsdEVkZ2VMYWJlbEZuID0gbmV3RGVmYXVsdDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgbnVtYmVyIG9mIGVkZ2VzIGluIHRoZSBncmFwaC5cbiAgICogQHJlbWFya3MgQ29tcGxleGl0eTogTygxKS5cbiAgICovXG4gIGVkZ2VDb3VudCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZWRnZUNvdW50O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgZWRnZXMgb2YgdGhlIGdyYXBoLlxuICAgKlxuICAgKiBAcmV0dXJucyB7RWRnZU9ialtdfSB0aGUge0BsaW5rIEVkZ2VPYmp9IGZvciBlYWNoIGVkZ2UgaW4gdGhlIGdyYXBoLlxuICAgKlxuICAgKiBAcmVtYXJrc1xuICAgKiBJbiBjYXNlIG9mIGNvbXBvdW5kIGdyYXBoIHN1YmdyYXBocyBhcmUgbm90IGNvbnNpZGVyZWQuXG4gICAqIFVzZSB7QGxpbmsgZWRnZSgpfSB0byBnZXQgdGhlIGxhYmVsIGZvciBlYWNoIGVkZ2UuXG4gICAqIFRha2VzIGBPKHxFfClgIHRpbWUuXG4gICAqL1xuICBlZGdlcygpIHtcbiAgICByZXR1cm4gXy52YWx1ZXModGhpcy5fZWRnZU9ianMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEVzdGFibGlzaCBhbiBlZGdlcyBwYXRoIG92ZXIgdGhlIG5vZGVzIGluIG5vZGVzIGxpc3QuXG4gICAqXG4gICAqIElmIHNvbWUgZWRnZSBpcyBhbHJlYWR5IGV4aXN0cywgaXQgd2lsbCB1cGRhdGUgaXRzIGxhYmVsLCBvdGhlcndpc2UgaXQgd2lsbFxuICAgKiBjcmVhdGUgYW4gZWRnZSBiZXR3ZWVuIHBhaXIgb2Ygbm9kZXMgd2l0aCBsYWJlbCBwcm92aWRlZCBvciBkZWZhdWx0IGxhYmVsXG4gICAqIGlmIG5vIGxhYmVsIHByb3ZpZGVkLlxuICAgKlxuICAgKiBAcGFyYW0ge0NvbGxlY3Rpb248Tm9kZUlEPn0gdnMgLSBMaXN0IG9mIG5vZGUgSURzIHRvIGNyZWF0ZSBlZGdlcyBiZXR3ZWVuLlxuICAgKiBAcGFyYW0ge0VkZ2VMYWJlbH0gW3ZhbHVlXSAtIElmIHNldCwgdXBkYXRlIGFsbCBlZGdlcyB3aXRoIHRoaXMgdmFsdWUuXG4gICAqIEByZXR1cm5zIHt0aGlzfVxuICAgKiBAcmVtYXJrcyBDb21wbGV4aXR5OiBPKHxub2Rlc3wpLlxuICAgKi9cbiAgc2V0UGF0aCh2cywgdmFsdWUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgXy5yZWR1Y2UodnMsIGZ1bmN0aW9uICh2LCB3KSB7XG4gICAgICBpZiAoYXJncy5sZW5ndGggPiAxKSB7XG4gICAgICAgIHNlbGYuc2V0RWRnZSh2LCB3LCB2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWxmLnNldEVkZ2Uodiwgdyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdztcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIG9yIHVwZGF0ZXMgdGhlIGxhYmVsIGZvciB0aGUgZWRnZSAoYHZgLCBgd2ApIHdpdGggdGhlIG9wdGlvbmFsbHlcbiAgICogc3VwcGxpZWQgYG5hbWVgLlxuICAgKlxuICAgKiBAb3ZlcmxvYWRcbiAgICogQHBhcmFtIHtFZGdlT2JqfSBhcmcwIC0gRWRnZSBvYmplY3QuXG4gICAqIEBwYXJhbSB7RWRnZUxhYmVsfSBbdmFsdWVdIC0gSWYgc3VwcGxpZWQsIGl0IGlzIHNldCBhcyB0aGUgbGFiZWwgZm9yIHRoZSBlZGdlLlxuICAgKiBJZiBub3Qgc3VwcGxpZWQgYW5kIHRoZSBlZGdlIHdhcyBjcmVhdGVkIGJ5IHRoaXMgY2FsbCB0aGVuXG4gICAqIHtAbGluayBzZXREZWZhdWx0RWRnZUxhYmVsfSB3aWxsIGJlIHVzZWQgdG8gYXNzaWduIHRoZSBlZGdlJ3MgbGFiZWwuXG4gICAqIEByZXR1cm5zIHt0aGlzfSB0aGUgZ3JhcGgsIGFsbG93aW5nIHRoaXMgdG8gYmUgY2hhaW5lZCB3aXRoIG90aGVyIGZ1bmN0aW9ucy5cbiAgICogQHJlbWFya3MgVGFrZXMgYE8oMSlgIHRpbWUuXG4gICAqL1xuICAvKipcbiAgICogQ3JlYXRlcyBvciB1cGRhdGVzIHRoZSBsYWJlbCBmb3IgdGhlIGVkZ2UgKGB2YCwgYHdgKSB3aXRoIHRoZSBvcHRpb25hbGx5XG4gICAqIHN1cHBsaWVkIGBuYW1lYC5cbiAgICpcbiAgICogQG92ZXJsb2FkXG4gICAqIEBwYXJhbSB7Tm9kZUlEIHwgbnVtYmVyfSB2IC0gU291cmNlIG5vZGUgSUQuIE51bWJlciB2YWx1ZXMgd2lsbCBiZSBjb2VyY2VkIHRvIHN0cmluZ3MuXG4gICAqIEBwYXJhbSB7Tm9kZUlEIHwgbnVtYmVyfSB3IC0gVGFyZ2V0IG5vZGUgSUQuIE51bWJlciB2YWx1ZXMgd2lsbCBiZSBjb2VyY2VkIHRvIHN0cmluZ3MuXG4gICAqIEBwYXJhbSB7RWRnZUxhYmVsfSBbdmFsdWVdIC0gSWYgc3VwcGxpZWQsIGl0IGlzIHNldCBhcyB0aGUgbGFiZWwgZm9yIHRoZSBlZGdlLlxuICAgKiBJZiBub3Qgc3VwcGxpZWQgYW5kIHRoZSBlZGdlIHdhcyBjcmVhdGVkIGJ5IHRoaXMgY2FsbCB0aGVuXG4gICAqIHtAbGluayBzZXREZWZhdWx0RWRnZUxhYmVsfSB3aWxsIGJlIHVzZWQgdG8gYXNzaWduIHRoZSBlZGdlJ3MgbGFiZWwuXG4gICAqIEBwYXJhbSB7c3RyaW5nIHwgbnVtYmVyfSBbbmFtZV0gLSBFZGdlIG5hbWUuIE9ubHkgdXNlZnVsIHdpdGggbXVsdGlncmFwaHMuXG4gICAqIEByZXR1cm5zIHt0aGlzfSB0aGUgZ3JhcGgsIGFsbG93aW5nIHRoaXMgdG8gYmUgY2hhaW5lZCB3aXRoIG90aGVyIGZ1bmN0aW9ucy5cbiAgICogQHJlbWFya3MgVGFrZXMgYE8oMSlgIHRpbWUuXG4gICAqL1xuICBzZXRFZGdlKCkge1xuICAgIHZhciB2LCB3LCBuYW1lLCB2YWx1ZTtcbiAgICB2YXIgdmFsdWVTcGVjaWZpZWQgPSBmYWxzZTtcbiAgICB2YXIgYXJnMCA9IGFyZ3VtZW50c1swXTtcblxuICAgIGlmICh0eXBlb2YgYXJnMCA9PT0gJ29iamVjdCcgJiYgYXJnMCAhPT0gbnVsbCAmJiAndicgaW4gYXJnMCkge1xuICAgICAgdiA9IGFyZzAudjtcbiAgICAgIHcgPSBhcmcwLnc7XG4gICAgICBuYW1lID0gYXJnMC5uYW1lO1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgdmFsdWUgPSBhcmd1bWVudHNbMV07XG4gICAgICAgIHZhbHVlU3BlY2lmaWVkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdiA9IGFyZzA7XG4gICAgICB3ID0gYXJndW1lbnRzWzFdO1xuICAgICAgbmFtZSA9IGFyZ3VtZW50c1szXTtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMikge1xuICAgICAgICB2YWx1ZSA9IGFyZ3VtZW50c1syXTtcbiAgICAgICAgdmFsdWVTcGVjaWZpZWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHYgPSAnJyArIHY7XG4gICAgdyA9ICcnICsgdztcbiAgICBpZiAoIV8uaXNVbmRlZmluZWQobmFtZSkpIHtcbiAgICAgIG5hbWUgPSAnJyArIG5hbWU7XG4gICAgfVxuXG4gICAgdmFyIGUgPSBlZGdlQXJnc1RvSWQodGhpcy5faXNEaXJlY3RlZCwgdiwgdywgbmFtZSk7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLl9lZGdlTGFiZWxzLCBlKSkge1xuICAgICAgaWYgKHZhbHVlU3BlY2lmaWVkKSB7XG4gICAgICAgIHRoaXMuX2VkZ2VMYWJlbHNbZV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGlmICghXy5pc1VuZGVmaW5lZChuYW1lKSAmJiAhdGhpcy5faXNNdWx0aWdyYXBoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBzZXQgYSBuYW1lZCBlZGdlIHdoZW4gaXNNdWx0aWdyYXBoID0gZmFsc2UnKTtcbiAgICB9XG5cbiAgICAvLyBJdCBkaWRuJ3QgZXhpc3QsIHNvIHdlIG5lZWQgdG8gY3JlYXRlIGl0LlxuICAgIC8vIEZpcnN0IGVuc3VyZSB0aGUgbm9kZXMgZXhpc3QuXG4gICAgdGhpcy5zZXROb2RlKHYpO1xuICAgIHRoaXMuc2V0Tm9kZSh3KTtcblxuICAgIHRoaXMuX2VkZ2VMYWJlbHNbZV0gPSB2YWx1ZVNwZWNpZmllZCA/IHZhbHVlIDogdGhpcy5fZGVmYXVsdEVkZ2VMYWJlbEZuKHYsIHcsIG5hbWUpO1xuXG4gICAgdmFyIGVkZ2VPYmogPSBlZGdlQXJnc1RvT2JqKHRoaXMuX2lzRGlyZWN0ZWQsIHYsIHcsIG5hbWUpO1xuICAgIC8vIEVuc3VyZSB3ZSBhZGQgdW5kaXJlY3RlZCBlZGdlcyBpbiBhIGNvbnNpc3RlbnQgd2F5LlxuICAgIHYgPSBlZGdlT2JqLnY7XG4gICAgdyA9IGVkZ2VPYmoudztcblxuICAgIE9iamVjdC5mcmVlemUoZWRnZU9iaik7XG4gICAgdGhpcy5fZWRnZU9ianNbZV0gPSBlZGdlT2JqO1xuICAgIGluY3JlbWVudE9ySW5pdEVudHJ5KHRoaXMuX3ByZWRzW3ddLCB2KTtcbiAgICBpbmNyZW1lbnRPckluaXRFbnRyeSh0aGlzLl9zdWNzW3ZdLCB3KTtcbiAgICB0aGlzLl9pblt3XVtlXSA9IGVkZ2VPYmo7XG4gICAgdGhpcy5fb3V0W3ZdW2VdID0gZWRnZU9iajtcbiAgICB0aGlzLl9lZGdlQ291bnQrKztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBsYWJlbCBmb3IgdGhlIHNwZWNpZmllZCBlZGdlLlxuICAgKlxuICAgKiBAb3ZlcmxvYWRcbiAgICogQHBhcmFtIHtFZGdlT2JqfSB2IC0gRWRnZSBvYmplY3QuXG4gICAqIEByZXR1cm5zIHtFZGdlTGFiZWwgfCB1bmRlZmluZWR9IHRoZSBsYWJlbCBmb3IgdGhlIGVkZ2UgKGB2YCwgYHdgKSBpZiB0aGVcbiAgICogZ3JhcGggaGFzIGFuIGVkZ2UgYmV0d2VlbiBgdmAgYW5kIGB3YCB3aXRoIHRoZSBvcHRpb25hbCBgbmFtZWAuXG4gICAqIFJldHVybmVkIGB1bmRlZmluZWRgIGlmIHRoZXJlIGlzIG5vIHN1Y2ggZWRnZSBpbiB0aGUgZ3JhcGguXG4gICAqIEByZW1hcmtzXG4gICAqIGB2YCBhbmQgYHdgIGNhbiBiZSBpbnRlcmNoYW5nZWQgZm9yIHVuZGlyZWN0ZWQgZ3JhcGhzLlxuICAgKiBUYWtlcyBgTygxKWAgdGltZS5cbiAgICovXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBsYWJlbCBmb3IgdGhlIHNwZWNpZmllZCBlZGdlLlxuICAgKlxuICAgKiBAb3ZlcmxvYWRcbiAgICogQHBhcmFtIHtOb2RlSUQgfCBudW1iZXJ9IHYgLSBTb3VyY2Ugbm9kZSBJRC5cbiAgICogQHBhcmFtIHtOb2RlSUQgfCBudW1iZXJ9IHcgLSBUYXJnZXQgbm9kZSBJRC5cbiAgICogQHBhcmFtIHtzdHJpbmcgfCBudW1iZXJ9IFtuYW1lXSAtIEVkZ2UgbmFtZS4gT25seSB1c2VmdWwgd2l0aCBtdWx0aWdyYXBocy5cbiAgICogQHJldHVybnMge0VkZ2VMYWJlbCB8IHVuZGVmaW5lZH0gdGhlIGxhYmVsIGZvciB0aGUgZWRnZSAoYHZgLCBgd2ApIGlmIHRoZVxuICAgKiBncmFwaCBoYXMgYW4gZWRnZSBiZXR3ZWVuIGB2YCBhbmQgYHdgIHdpdGggdGhlIG9wdGlvbmFsIGBuYW1lYC5cbiAgICogUmV0dXJuZWQgYHVuZGVmaW5lZGAgaWYgdGhlcmUgaXMgbm8gc3VjaCBlZGdlIGluIHRoZSBncmFwaC5cbiAgICogQHJlbWFya3NcbiAgICogYHZgIGFuZCBgd2AgY2FuIGJlIGludGVyY2hhbmdlZCBmb3IgdW5kaXJlY3RlZCBncmFwaHMuXG4gICAqIFRha2VzIGBPKDEpYCB0aW1lLlxuICAgKi9cbiAgZWRnZSh2LCB3LCBuYW1lKSB7XG4gICAgdmFyIGUgPVxuICAgICAgYXJndW1lbnRzLmxlbmd0aCA9PT0gMVxuICAgICAgICA/IGVkZ2VPYmpUb0lkKHRoaXMuX2lzRGlyZWN0ZWQsIGFyZ3VtZW50c1swXSlcbiAgICAgICAgOiBlZGdlQXJnc1RvSWQodGhpcy5faXNEaXJlY3RlZCwgdiwgdywgbmFtZSk7XG4gICAgcmV0dXJuIHRoaXMuX2VkZ2VMYWJlbHNbZV07XG4gIH1cblxuICAvKipcbiAgICogRGV0ZWN0cyB3aGV0aGVyIHRoZSBncmFwaCBjb250YWlucyBzcGVjaWZpZWQgZWRnZSBvciBub3QuXG4gICAqXG4gICAqIEBvdmVybG9hZFxuICAgKiBAcGFyYW0ge0VkZ2VPYmp9IHYgLSBFZGdlIG9iamVjdC5cbiAgICogQHJldHVybnMge2Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgZ3JhcGggaGFzIGFuIGVkZ2UgYmV0d2VlbiBgdmAgYW5kIGB3YFxuICAgKiB3aXRoIHRoZSBvcHRpb25hbCBgbmFtZWAuXG4gICAqIEByZW1hcmtzXG4gICAqIGB2YCBhbmQgYHdgIGNhbiBiZSBpbnRlcmNoYW5nZWQgZm9yIHVuZGlyZWN0ZWQgZ3JhcGhzLlxuICAgKiBObyBzdWJncmFwaHMgYXJlIGNvbnNpZGVyZWQuXG4gICAqIFRha2VzIGBPKDEpYCB0aW1lLlxuICAgKi9cbiAgLyoqXG4gICAqIERldGVjdHMgd2hldGhlciB0aGUgZ3JhcGggY29udGFpbnMgc3BlY2lmaWVkIGVkZ2Ugb3Igbm90LlxuICAgKlxuICAgKiBAb3ZlcmxvYWRcbiAgICogQHBhcmFtIHtOb2RlSUQgfCBudW1iZXJ9IHYgLSBTb3VyY2Ugbm9kZSBJRC5cbiAgICogQHBhcmFtIHtOb2RlSUQgfCBudW1iZXJ9IHcgLSBUYXJnZXQgbm9kZSBJRC5cbiAgICogQHBhcmFtIHtzdHJpbmcgfCBudW1iZXJ9IFtuYW1lXSAtIEVkZ2UgbmFtZS4gT25seSB1c2VmdWwgd2l0aCBtdWx0aWdyYXBocy5cbiAgICogQHJldHVybnMge2Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgZ3JhcGggaGFzIGFuIGVkZ2UgYmV0d2VlbiBgdmAgYW5kIGB3YFxuICAgKiB3aXRoIHRoZSBvcHRpb25hbCBgbmFtZWAuXG4gICAqIEByZW1hcmtzXG4gICAqIGB2YCBhbmQgYHdgIGNhbiBiZSBpbnRlcmNoYW5nZWQgZm9yIHVuZGlyZWN0ZWQgZ3JhcGhzLlxuICAgKiBObyBzdWJncmFwaHMgYXJlIGNvbnNpZGVyZWQuXG4gICAqIFRha2VzIGBPKDEpYCB0aW1lLlxuICAgKi9cbiAgaGFzRWRnZSh2LCB3LCBuYW1lKSB7XG4gICAgdmFyIGUgPVxuICAgICAgYXJndW1lbnRzLmxlbmd0aCA9PT0gMVxuICAgICAgICA/IGVkZ2VPYmpUb0lkKHRoaXMuX2lzRGlyZWN0ZWQsIGFyZ3VtZW50c1swXSlcbiAgICAgICAgOiBlZGdlQXJnc1RvSWQodGhpcy5faXNEaXJlY3RlZCwgdiwgdywgbmFtZSk7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLl9lZGdlTGFiZWxzLCBlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSBlZGdlIChgdmAsIGB3YCkgaWYgdGhlIGdyYXBoIGhhcyBhbiBlZGdlIGJldHdlZW4gYHZgIGFuZCBgd2BcbiAgICogd2l0aCB0aGUgb3B0aW9uYWwgYG5hbWVgLiBJZiBub3QgdGhpcyBmdW5jdGlvbiBkb2VzIG5vdGhpbmcuXG4gICAqXG4gICAqIEBvdmVybG9hZFxuICAgKiBAcGFyYW0ge0VkZ2VPYmp9IHYgLSBFZGdlIG9iamVjdC5cbiAgICogQHJldHVybnMge3RoaXN9XG4gICAqIEByZW1hcmtzXG4gICAqIGB2YCBhbmQgYHdgIGNhbiBiZSBpbnRlcmNoYW5nZWQgZm9yIHVuZGlyZWN0ZWQgZ3JhcGhzLlxuICAgKiBObyBzdWJncmFwaHMgYXJlIGNvbnNpZGVyZWQuXG4gICAqIFRha2VzIGBPKDEpYCB0aW1lLlxuICAgKi9cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIGVkZ2UgKGB2YCwgYHdgKSBpZiB0aGUgZ3JhcGggaGFzIGFuIGVkZ2UgYmV0d2VlbiBgdmAgYW5kIGB3YFxuICAgKiB3aXRoIHRoZSBvcHRpb25hbCBgbmFtZWAuIElmIG5vdCB0aGlzIGZ1bmN0aW9uIGRvZXMgbm90aGluZy5cbiAgICpcbiAgICogQG92ZXJsb2FkXG4gICAqIEBwYXJhbSB7Tm9kZUlEIHwgbnVtYmVyfSB2IC0gU291cmNlIG5vZGUgSUQuXG4gICAqIEBwYXJhbSB7Tm9kZUlEIHwgbnVtYmVyfSB3IC0gVGFyZ2V0IG5vZGUgSUQuXG4gICAqIEBwYXJhbSB7c3RyaW5nIHwgbnVtYmVyfSBbbmFtZV0gLSBFZGdlIG5hbWUuIE9ubHkgdXNlZnVsIHdpdGggbXVsdGlncmFwaHMuXG4gICAqIEByZXR1cm5zIHt0aGlzfVxuICAgKiBAcmVtYXJrc1xuICAgKiBgdmAgYW5kIGB3YCBjYW4gYmUgaW50ZXJjaGFuZ2VkIGZvciB1bmRpcmVjdGVkIGdyYXBocy5cbiAgICogVGFrZXMgYE8oMSlgIHRpbWUuXG4gICAqL1xuICByZW1vdmVFZGdlKHYsIHcsIG5hbWUpIHtcbiAgICB2YXIgZSA9XG4gICAgICBhcmd1bWVudHMubGVuZ3RoID09PSAxXG4gICAgICAgID8gZWRnZU9ialRvSWQodGhpcy5faXNEaXJlY3RlZCwgYXJndW1lbnRzWzBdKVxuICAgICAgICA6IGVkZ2VBcmdzVG9JZCh0aGlzLl9pc0RpcmVjdGVkLCB2LCB3LCBuYW1lKTtcbiAgICB2YXIgZWRnZSA9IHRoaXMuX2VkZ2VPYmpzW2VdO1xuICAgIGlmIChlZGdlKSB7XG4gICAgICB2ID0gZWRnZS52O1xuICAgICAgdyA9IGVkZ2UudztcbiAgICAgIGRlbGV0ZSB0aGlzLl9lZGdlTGFiZWxzW2VdO1xuICAgICAgZGVsZXRlIHRoaXMuX2VkZ2VPYmpzW2VdO1xuICAgICAgZGVjcmVtZW50T3JSZW1vdmVFbnRyeSh0aGlzLl9wcmVkc1t3XSwgdik7XG4gICAgICBkZWNyZW1lbnRPclJlbW92ZUVudHJ5KHRoaXMuX3N1Y3Nbdl0sIHcpO1xuICAgICAgZGVsZXRlIHRoaXMuX2luW3ddW2VdO1xuICAgICAgZGVsZXRlIHRoaXMuX291dFt2XVtlXTtcbiAgICAgIHRoaXMuX2VkZ2VDb3VudC0tO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge05vZGVJRCB8IG51bWJlcn0gdiAtIFRhcmdldCBub2RlIElELlxuICAgKiBAcGFyYW0ge05vZGVJRCB8IG51bWJlcn0gW3VdIC0gT3B0aW9uYWxseSBmaWx0ZXJzIGVkZ2VzIGRvd24gdG8ganVzdCB0aG9zZVxuICAgKiBjb21pbmcgZnJvbSBub2RlIGB1YC5cbiAgICogQHJldHVybnMge0VkZ2VPYmpbXSB8IHVuZGVmaW5lZH0gYWxsIGVkZ2VzIHRoYXQgcG9pbnQgdG8gdGhlIG5vZGUgYHZgLlxuICAgKiBSZXR1cm5zIGB1bmRlZmluZWRgIGlmIG5vZGUgYHZgIGlzIG5vdCBpbiB0aGUgZ3JhcGguXG4gICAqIEByZW1hcmtzXG4gICAqIEJlaGF2aW9yIGlzIHVuZGVmaW5lZCBmb3IgdW5kaXJlY3RlZCBncmFwaHMgLSB1c2Uge0BsaW5rIG5vZGVFZGdlc30gaW5zdGVhZC5cbiAgICogVGFrZXMgYE8ofEV8KWAgdGltZS5cbiAgICovXG4gIGluRWRnZXModiwgdSkge1xuICAgIHZhciBpblYgPSB0aGlzLl9pblt2XTtcbiAgICBpZiAoaW5WKSB7XG4gICAgICB2YXIgZWRnZXMgPSBfLnZhbHVlcyhpblYpO1xuICAgICAgaWYgKCF1KSB7XG4gICAgICAgIHJldHVybiBlZGdlcztcbiAgICAgIH1cbiAgICAgIHJldHVybiBfLmZpbHRlcihlZGdlcywgZnVuY3Rpb24gKGVkZ2UpIHtcbiAgICAgICAgcmV0dXJuIGVkZ2UudiA9PT0gdTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge05vZGVJRCB8IG51bWJlcn0gdiAtIFRhcmdldCBub2RlIElELlxuICAgKiBAcGFyYW0ge05vZGVJRCB8IG51bWJlcn0gW3ddIC0gT3B0aW9uYWxseSBmaWx0ZXJzIGVkZ2VzIGRvd24gdG8ganVzdCB0aG9zZVxuICAgKiB0aGF0IHBvaW50IHRvIGB3YC5cbiAgICogQHJldHVybnMge0VkZ2VPYmpbXSB8IHVuZGVmaW5lZH0gYWxsIGVkZ2VzIHRoYXQgcG9pbnQgdG8gdGhlIG5vZGUgYHZgLlxuICAgKiBSZXR1cm5zIGB1bmRlZmluZWRgIGlmIG5vZGUgYHZgIGlzIG5vdCBpbiB0aGUgZ3JhcGguXG4gICAqIEByZW1hcmtzXG4gICAqIEJlaGF2aW9yIGlzIHVuZGVmaW5lZCBmb3IgdW5kaXJlY3RlZCBncmFwaHMgLSB1c2Uge0BsaW5rIG5vZGVFZGdlc30gaW5zdGVhZC5cbiAgICogVGFrZXMgYE8ofEV8KWAgdGltZS5cbiAgICovXG4gIG91dEVkZ2VzKHYsIHcpIHtcbiAgICB2YXIgb3V0ViA9IHRoaXMuX291dFt2XTtcbiAgICBpZiAob3V0Vikge1xuICAgICAgdmFyIGVkZ2VzID0gXy52YWx1ZXMob3V0Vik7XG4gICAgICBpZiAoIXcpIHtcbiAgICAgICAgcmV0dXJuIGVkZ2VzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF8uZmlsdGVyKGVkZ2VzLCBmdW5jdGlvbiAoZWRnZSkge1xuICAgICAgICByZXR1cm4gZWRnZS53ID09PSB3O1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Tm9kZUlEIHwgbnVtYmVyfSB2IC0gVGFyZ2V0IE5vZGUgSUQuXG4gICAqIEBwYXJhbSB7Tm9kZUlEIHwgbnVtYmVyfSBbd10gLSBJZiBzZXQsIGZpbHRlcnMgdGhvc2UgZWRnZXMgZG93biB0byBqdXN0XG4gICAqIHRob3NlIGJldHdlZW4gbm9kZXMgYHZgIGFuZCBgd2AgcmVnYXJkbGVzcyBvZiBkaXJlY3Rpb25cbiAgICogQHJldHVybnMge0VkZ2VPYmpbXSB8IHVuZGVmaW5lZH0gYWxsIGVkZ2VzIHRvIG9yIGZyb20gbm9kZSBgdmAgcmVnYXJkbGVzc1xuICAgKiBvZiBkaXJlY3Rpb24uIFJldHVybnMgYHVuZGVmaW5lZGAgaWYgbm9kZSBgdmAgaXMgbm90IGluIHRoZSBncmFwaC5cbiAgICogQHJlbWFya3MgVGFrZXMgYE8ofEV8KWAgdGltZS5cbiAgICovXG4gIG5vZGVFZGdlcyh2LCB3KSB7XG4gICAgdmFyIGluRWRnZXMgPSB0aGlzLmluRWRnZXModiwgdyk7XG4gICAgaWYgKGluRWRnZXMpIHtcbiAgICAgIHJldHVybiBpbkVkZ2VzLmNvbmNhdCh0aGlzLm91dEVkZ2VzKHYsIHcpKTtcbiAgICB9XG4gIH1cbn1cblxuLyogTnVtYmVyIG9mIG5vZGVzIGluIHRoZSBncmFwaC4gU2hvdWxkIG9ubHkgYmUgY2hhbmdlZCBieSB0aGUgaW1wbGVtZW50YXRpb24uICovXG5HcmFwaC5wcm90b3R5cGUuX25vZGVDb3VudCA9IDA7XG5cbi8qIE51bWJlciBvZiBlZGdlcyBpbiB0aGUgZ3JhcGguIFNob3VsZCBvbmx5IGJlIGNoYW5nZWQgYnkgdGhlIGltcGxlbWVudGF0aW9uLiAqL1xuR3JhcGgucHJvdG90eXBlLl9lZGdlQ291bnQgPSAwO1xuXG4vKipcbiAqIEBwYXJhbSB7UmVjb3JkPE5vZGVJRCwgbnVtYmVyPn0gbWFwIC0gT2JqZWN0IG1hcHBpbmcgbm9kZSBJRHMgdG8gY291bnRzLlxuICogQHBhcmFtIHtOb2RlSUQgfCBudW1iZXJ9IGsgLSBOb2RlIElELlxuICovXG5mdW5jdGlvbiBpbmNyZW1lbnRPckluaXRFbnRyeShtYXAsIGspIHtcbiAgaWYgKG1hcFtrXSkge1xuICAgIG1hcFtrXSsrO1xuICB9IGVsc2Uge1xuICAgIG1hcFtrXSA9IDE7XG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0ge1JlY29yZDxOb2RlSUQsIG51bWJlcj59IG1hcCAtIE9iamVjdCBtYXBwaW5nIG5vZGUgSURzIHRvIGNvdW50cy5cbiAqIEBwYXJhbSB7Tm9kZUlEIHwgbnVtYmVyfSBrIC0gTm9kZSBJRC5cbiAqL1xuZnVuY3Rpb24gZGVjcmVtZW50T3JSZW1vdmVFbnRyeShtYXAsIGspIHtcbiAgaWYgKCEtLW1hcFtrXSkge1xuICAgIGRlbGV0ZSBtYXBba107XG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGlzRGlyZWN0ZWQgLSBJZiBgZmFsc2VgLCBzb3J0cyB2IGFuZCB3IHRvIGVuc3VyZSBhIGNvbnNpc3RlbnQgSUQuXG4gKiBAcGFyYW0ge0VkZ2VPYmpbJ3YnXSB8IG51bWJlcn0gdl8gLSBTb3VyY2Ugbm9kZSBJRC5cbiAqIEBwYXJhbSB7RWRnZU9ialsndyddIHwgbnVtYmVyfSB3XyAtIFRhcmdldCBub2RlIElELlxuICogQHBhcmFtIHtFZGdlT2JqWyduYW1lJ119IFtuYW1lXSAtIEVkZ2UgbmFtZSAoZm9yIG11bHRpcGxlIGVkZ2VzIGJldHdlZW4gdGhlIHNhbWUgbm9kZXMpLlxuICogQHJldHVybnMge0VkZ2VJRH0gVW5pcXVlIElEIGZvciB0aGUgZWRnZS5cbiAqL1xuZnVuY3Rpb24gZWRnZUFyZ3NUb0lkKGlzRGlyZWN0ZWQsIHZfLCB3XywgbmFtZSkge1xuICB2YXIgdiA9ICcnICsgdl87XG4gIHZhciB3ID0gJycgKyB3XztcbiAgaWYgKCFpc0RpcmVjdGVkICYmIHYgPiB3KSB7XG4gICAgdmFyIHRtcCA9IHY7XG4gICAgdiA9IHc7XG4gICAgdyA9IHRtcDtcbiAgfVxuICByZXR1cm4gdiArIEVER0VfS0VZX0RFTElNICsgdyArIEVER0VfS0VZX0RFTElNICsgKF8uaXNVbmRlZmluZWQobmFtZSkgPyBERUZBVUxUX0VER0VfTkFNRSA6IG5hbWUpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNEaXJlY3RlZCAtIElmIGBmYWxzZWAsIHNvcnRzIHYgYW5kIHcgdG8gZW5zdXJlIGEgY29uc2lzdGVudCBJRC5cbiAqIEBwYXJhbSB7RWRnZU9ialsndiddIHwgbnVtYmVyfSB2XyAtIFNvdXJjZSBub2RlIElELlxuICogQHBhcmFtIHtFZGdlT2JqWyd3J10gfCBudW1iZXJ9IHdfIC0gVGFyZ2V0IG5vZGUgSUQuXG4gKiBAcGFyYW0ge0VkZ2VPYmpbJ25hbWUnXX0gW25hbWVdIC0gRWRnZSBuYW1lIChmb3IgbXVsdGlwbGUgZWRnZXMgYmV0d2VlbiB0aGUgc2FtZSBub2RlcykuXG4gKiBAcmV0dXJucyB7RWRnZU9ian1cbiAqL1xuZnVuY3Rpb24gZWRnZUFyZ3NUb09iaihpc0RpcmVjdGVkLCB2Xywgd18sIG5hbWUpIHtcbiAgdmFyIHYgPSAnJyArIHZfO1xuICB2YXIgdyA9ICcnICsgd187XG4gIGlmICghaXNEaXJlY3RlZCAmJiB2ID4gdykge1xuICAgIHZhciB0bXAgPSB2O1xuICAgIHYgPSB3O1xuICAgIHcgPSB0bXA7XG4gIH1cbiAgdmFyIGVkZ2VPYmogPSB7IHY6IHYsIHc6IHcgfTtcbiAgaWYgKG5hbWUpIHtcbiAgICBlZGdlT2JqLm5hbWUgPSBuYW1lO1xuICB9XG4gIHJldHVybiBlZGdlT2JqO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNEaXJlY3RlZCAtIElmIGBmYWxzZWAsIHNvcnRzIHYgYW5kIHcgdG8gZW5zdXJlIGEgY29uc2lzdGVudCBJRC5cbiAqIEBwYXJhbSB7RWRnZU9ian0gZWRnZU9iaiAtIEVkZ2Ugb2JqZWN0LlxuICogQHJldHVybnMge0VkZ2VJRH0gVW5pcXVlIElEIGZvciB0aGUgZWRnZS5cbiAqL1xuZnVuY3Rpb24gZWRnZU9ialRvSWQoaXNEaXJlY3RlZCwgZWRnZU9iaikge1xuICByZXR1cm4gZWRnZUFyZ3NUb0lkKGlzRGlyZWN0ZWQsIGVkZ2VPYmoudiwgZWRnZU9iai53LCBlZGdlT2JqLm5hbWUpO1xufVxuIgogIF0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7QUFDQSxJQUFJLGFBQWEsT0FBTyxVQUFVLFlBQVksVUFBVSxPQUFPLFdBQVcsVUFBVTtBQUVwRixJQUFlOzs7QUNBZixJQUFJLFdBQVcsT0FBTyxRQUFRLFlBQVksUUFBUSxLQUFLLFdBQVcsVUFBVTtBQUc1RSxJQUFJLE9BQU8sdUJBQWMsWUFBWSxTQUFTLGFBQWEsRUFBRTtBQUU3RCxJQUFlOzs7QUNMZixJQUFJLFNBQVMsY0FBSztBQUVsQixJQUFlOzs7QUNGZixJQUFJLGNBQWMsT0FBTztBQUd6QixJQUFJLGlCQUFpQixZQUFZO0FBT2pDLElBQUksdUJBQXVCLFlBQVk7QUFHdkMsSUFBSSxpQkFBaUIsa0JBQVMsZ0JBQU8sY0FBYztBQVNuRCxTQUFT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b0JBQVksSUFBSSxJQUFJLG9CQUFvQjtBQUFBO0FBVTlGLFNBQVMsYUFBYSxDQUFDLFlBQVksSUFBSSxJQUFJLE1BQU07QUFBQSxFQUMvQyxJQUFJLElBQUksS0FBSztBQUFBLEVBQ2IsSUFBSSxJQUFJLEtBQUs7QUFBQSxFQUNiLElBQUksQ0FBQyxjQUFjLElBQUksR0FBRztBQUFBLElBQ3hCLElBQUksTUFBTTtBQUFBLElBQ1YsSUFBSTtBQUFBLElBQ0osSUFBSTtBQUFBLEVBQ047QUFBQSxFQUNBLElBQUksVUFBVSxFQUFFLEdBQU0sRUFBSztBQUFBLEVBQzNCLElBQUksTUFBTTtBQUFBLElBQ1IsUUFBUSxPQUFPO0FBQUEsRUFDakI7QUFBQSxFQUNBLE9BQU87QUFBQTtBQVFULFNBQVMsV0FBVyxDQUFDLFlBQVksU0FBUztBQUFBLEVBQ3hDLE9BQU8sYUFBYSxZQUFZLFFBQVEsR0FBRyxRQUFRLEdBQUcsUUFBUSxJQUFJO0FBQUE7IiwKICAiZGVidWdJZCI6ICJCMzc0MDZCQkFDNkFFOTA2NjQ3NTZFMjE2NDc1NkUyMSIsCiAgIm5hbWVzIjogW10KfQ==
