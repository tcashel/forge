import {
  __commonJS,
  __toESM
} from "./chunk-main-g8wf8be2.js";

// node_modules/dayjs/dayjs.min.js
var require_dayjs_min = __commonJS((exports, module) => {
  (function(t, e) {
    typeof exports == "object" && typeof module != "undefined" ? module.exports = e() : typeof define == "function" && define.amd ? define(e) : (t = typeof globalThis != "undefined" ? globalThis : t || self).dayjs = e();
  })(exports, function() {
    var t = 1000, e = 60000, n = 3600000, r = "millisecond", i = "second", s = "minute", u = "hour", a = "day", o = "week", c = "month", f = "quarter", h = "year", d = "date", l = "Invalid Date", $ = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, y = /\[([^\]]+)]|YYYY|YY|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, M = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), ordinal: function(t2) {
      var e2 = ["th", "st", "nd", "rd"], n2 = t2 % 100;
      return "[" + t2 + (e2[(n2 - 20) % 10] || e2[n2] || e2[0]) + "]";
    } }, m = function(t2, e2, n2) {
      var r2 = String(t2);
      return !r2 || r2.length >= e2 ? t2 : "" + Array(e2 + 1 - r2.length).join(n2) + t2;
    }, v = { s: m, z: function(t2) {
      var e2 = -t2.utcOffset(), n2 = Math.abs(e2), r2 = Math.floor(n2 / 60), i2 = n2 % 60;
      return (e2 <= 0 ? "+" : "-") + m(r2, 2, "0") + ":" + m(i2, 2, "0");
    }, m: function t2(e2, n2) {
      if (e2.date() < n2.date())
        return -t2(n2, e2);
      var r2 = 12 * (n2.year() - e2.year()) + (n2.month() - e2.month()), i2 = e2.clone().add(r2, c), s2 = n2 - i2 < 0, u2 = e2.clone().add(r2 + (s2 ? -1 : 1), c);
      return +(-(r2 + (n2 - i2) / (s2 ? i2 - u2 : u2 - i2)) || 0);
    }, a: function(t2) {
      return t2 < 0 ? Math.ceil(t2) || 0 : Math.floor(t2);
    }, p: function(t2) {
      return { M: c, y: h, w: o, d: a, D: d, h: u, m: s, s: i, ms: r, Q: f }[t2] || String(t2 || "").toLowerCase().replace(/s$/, "");
    }, u: function(t2) {
      return t2 === undefined;
    } }, g = "en", D = {};
    D[g] = M;
    var p = "$isDayjsObject", S = function(t2) {
      return t2 instanceof _ || !(!t2 || !t2[p]);
    }, w = function t2(e2, n2, r2) {
      var i2;
      if (!e2)
        return g;
      if (typeof e2 == "string") {
        var s2 = e2.toLowerCase();
        D[s2] && (i2 = s2), n2 && (D[s2] = n2, i2 = s2);
        var u2 = e2.split("-");
        if (!i2 && u2.length > 1)
          return t2(u2[0]);
      } else {
        var a2 = e2.name;
        D[a2] = e2, i2 = a2;
      }
      return !r2 && i2 && (g = i2), i2 || !r2 && g;
    }, O = function(t2, e2) {
      if (S(t2))
        return t2.clone();
      var n2 = typeof e2 == "object" ? e2 : {};
      return n2.date = t2, n2.args = arguments, new _(n2);
    }, b = v;
    b.l = w, b.i = S, b.w = function(t2, e2) {
      return O(t2, { locale: e2.$L, utc: e2.$u, x: e2.$x, $offset: e2.$offset });
    };
    var _ = function() {
      function M2(t2) {
        this.$L = w(t2.locale, null, true), this.parse(t2), this.$x = this.$x || t2.x || {}, this[p] = true;
      }
      var m2 = M2.prototype;
      return m2.parse = function(t2) {
        this.$d = function(t3) {
          var { date: e2, utc: n2 } = t3;
          if (e2 === null)
            return new Date(NaN);
          if (b.u(e2))
            return new Date;
          if (e2 instanceof Date)
            return new Date(e2);
          if (typeof e2 == "string" && !/Z$/i.test(e2)) {
            var r2 = e2.match($);
            if (r2) {
              var i2 = r2[2] - 1 || 0, s2 = (r2[7] || "0").substring(0, 3);
              return n2 ? new Date(Date.UTC(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2)) : new Date(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2);
            }
          }
          return new Date(e2);
        }(t2), this.init();
      }, m2.init = function() {
        var t2 = this.$d;
        this.$y = t2.getFullYear(), this.$M = t2.getMonth(), this.$D = t2.getDate(), this.$W = t2.getDay(), this.$H = t2.getHours(), this.$m = t2.getMinutes(), this.$s = t2.getSeconds(), this.$ms = t2.getMilliseconds();
      }, m2.$utils = function() {
        return b;
      }, m2.isValid = function() {
        return !(this.$d.toString() === l);
      }, m2.isSame = function(t2, e2) {
        var n2 = O(t2);
        return this.startOf(e2) <= n2 && n2 <= this.endOf(e2);
      }, m2.isAfter = function(t2, e2) {
        return O(t2) < this.startOf(e2);
      }, m2.isBefore = function(t2, e2) {
        return this.endOf(e2) < O(t2);
      }, m2.$g = function(t2, e2, n2) {
        return b.u(t2) ? this[e2] : this.set(n2, t2);
      }, m2.unix = function() {
        return Math.floor(this.valueOf() / 1000);
      }, m2.valueOf = function() {
        return this.$d.getTime();
      }, m2.startOf = function(t2, e2) {
        var n2 = this, r2 = !!b.u(e2) || e2, f2 = b.p(t2), l2 = function(t3, e3) {
          var i2 = b.w(n2.$u ? Date.UTC(n2.$y, e3, t3) : new Date(n2.$y, e3, t3), n2);
          return r2 ? i2 : i2.endOf(a);
        }, $2 = function(t3, e3) {
          return b.w(n2.toDate()[t3].apply(n2.toDate("s"), (r2 ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(e3)), n2);
        }, y2 = this.$W, M3 = this.$M, m3 = this.$D, v2 = "set" + (this.$u ? "UTC" : "");
        switch (f2) {
          case h:
            return r2 ? l2(1, 0) : l2(31, 11);
          case c:
            return r2 ? l2(1, M3) : l2(0, M3 + 1);
          case o:
            var g2 = this.$locale().weekStart || 0, D2 = (y2 < g2 ? y2 + 7 : y2) - g2;
            return l2(r2 ? m3 - D2 : m3 + (6 - D2), M3);
          case a:
          case d:
            return $2(v2 + "Hours", 0);
          case u:
            return $2(v2 + "Minutes", 1);
          case s:
            return $2(v2 + "Seconds", 2);
          case i:
            return $2(v2 + "Milliseconds", 3);
          default:
            return this.clone();
        }
      }, m2.endOf = function(t2) {
        return this.startOf(t2, false);
      }, m2.$set = function(t2, e2) {
        var n2, o2 = b.p(t2), f2 = "set" + (this.$u ? "UTC" : ""), l2 = (n2 = {}, n2[a] = f2 + "Date", n2[d] = f2 + "Date", n2[c] = f2 + "Month", n2[h] = f2 + "FullYear", n2[u] = f2 + "Hours", n2[s] = f2 + "Minutes", n2[i] = f2 + "Seconds", n2[r] = f2 + "Milliseconds", n2)[o2], $2 = o2 === a ? this.$D + (e2 - this.$W) : e2;
        if (o2 === c || o2 === h) {
          var y2 = this.clone().set(d, 1);
          y2.$d[l2]($2), y2.init(), this.$d = y2.set(d, Math.min(this.$D, y2.daysInMonth())).$d;
        } else
          l2 && this.$d[l2]($2);
        return this.init(), this;
      }, m2.set = function(t2, e2) {
        return this.clone().$set(t2, e2);
      }, m2.get = function(t2) {
        return this[b.p(t2)]();
      }, m2.add = function(r2, f2) {
        var d2, l2 = this;
        r2 = Number(r2);
        var $2 = b.p(f2), y2 = function(t2) {
          var e2 = O(l2);
          return b.w(e2.date(e2.date() + Math.round(t2 * r2)), l2);
        };
        if ($2 === c)
          return this.set(c, this.$M + r2);
        if ($2 === h)
          return this.set(h, this.$y + r2);
        if ($2 === a)
          return y2(1);
        if ($2 === o)
          return y2(7);
        var M3 = (d2 = {}, d2[s] = e, d2[u] = n, d2[i] = t, d2)[$2] || 1, m3 = this.$d.getTime() + r2 * M3;
        return b.w(m3, this);
      }, m2.subtract = function(t2, e2) {
        return this.add(-1 * t2, e2);
      }, m2.format = function(t2) {
        var e2 = this, n2 = this.$locale();
        if (!this.isValid())
          return n2.invalidDate || l;
        var r2 = t2 || "YYYY-MM-DDTHH:mm:ssZ", i2 = b.z(this), s2 = this.$H, u2 = this.$m, a2 = this.$M, o2 = n2.weekdays, c2 = n2.months, f2 = n2.meridiem, h2 = function(t3, n3, i3, s3) {
          return t3 && (t3[n3] || t3(e2, r2)) || i3[n3].slice(0, s3);
        }, d2 = function(t3) {
          return b.s(s2 % 12 || 12, t3, "0");
        }, $2 = f2 || function(t3, e3, n3) {
          var r3 = t3 < 12 ? "AM" : "PM";
          return n3 ? r3.toLowerCase() : r3;
        };
        return r2.replace(y, function(t3, r3) {
          return r3 || function(t4) {
            switch (t4) {
              case "YY":
                return String(e2.$y).slice(-2);
              case "YYYY":
                return b.s(e2.$y, 4, "0");
              case "M":
                return a2 + 1;
              case "MM":
                return b.s(a2 + 1, 2, "0");
              case "MMM":
                return h2(n2.monthsShort, a2, c2, 3);
              case "MMMM":
                return h2(c2, a2);
              case "D":
                return e2.$D;
              case "DD":
                return b.s(e2.$D, 2, "0");
              case "d":
                return String(e2.$W);
              case "dd":
                return h2(n2.weekdaysMin, e2.$W, o2, 2);
              case "ddd":
                return h2(n2.weekdaysShort, e2.$W, o2, 3);
              case "dddd":
                return o2[e2.$W];
              case "H":
                return String(s2);
              case "HH":
                return b.s(s2, 2, "0");
              case "h":
                return d2(1);
              case "hh":
                return d2(2);
              case "a":
                return $2(s2, u2, true);
              case "A":
                return $2(s2, u2, false);
              case "m":
                return String(u2);
              case "mm":
                return b.s(u2, 2, "0");
              case "s":
                return String(e2.$s);
              case "ss":
                return b.s(e2.$s, 2, "0");
              case "SSS":
                return b.s(e2.$ms, 3, "0");
              case "Z":
                return i2;
            }
            return null;
          }(t3) || i2.replace(":", "");
        });
      }, m2.utcOffset = function() {
        return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
      }, m2.diff = function(r2, d2, l2) {
        var $2, y2 = this, M3 = b.p(d2), m3 = O(r2), v2 = (m3.utcOffset() - this.utcOffset()) * e, g2 = this - m3, D2 = function() {
          return b.m(y2, m3);
        };
        switch (M3) {
          case h:
            $2 = D2() / 12;
            break;
          case c:
            $2 = D2();
            break;
          case f:
            $2 = D2() / 3;
            break;
          case o:
            $2 = (g2 - v2) / 604800000;
            break;
          case a:
            $2 = (g2 - v2) / 86400000;
            break;
          case u:
            $2 = g2 / n;
            break;
          case s:
            $2 = g2 / e;
            break;
          case i:
            $2 = g2 / t;
            break;
          default:
            $2 = g2;
        }
        return l2 ? $2 : b.a($2);
      }, m2.daysInMonth = function() {
        return this.endOf(c).$D;
      }, m2.$locale = function() {
        return D[this.$L];
      }, m2.locale = function(t2, e2) {
        if (!t2)
          return this.$L;
        var n2 = this.clone(), r2 = w(t2, e2, true);
        return r2 && (n2.$L = r2), n2;
      }, m2.clone = function() {
        return b.w(this.$d, this);
      }, m2.toDate = function() {
        return new Date(this.valueOf());
      }, m2.toJSON = function() {
        return this.isValid() ? this.toISOString() : null;
      }, m2.toISOString = function() {
        return this.$d.toISOString();
      }, m2.toString = function() {
        return this.$d.toUTCString();
      }, M2;
    }(), Y = _.prototype;
    return O.prototype = Y, [["$ms", r], ["$s", i], ["$m", s], ["$H", u], ["$W", a], ["$M", c], ["$y", h], ["$D", d]].forEach(function(t2) {
      Y[t2[1]] = function(e2) {
        return this.$g(e2, t2[0], t2[1]);
      };
    }), O.extend = function(t2, e2) {
      return t2.$i || (t2(e2, _, O), t2.$i = true), O;
    }, O.locale = w, O.isDayjs = S, O.unix = function(t2) {
      return O(1000 * t2);
    }, O.en = D[g], O.Ls = D, O.p = {}, O;
  });
});

// node_modules/mermaid/dist/chunks/mermaid.core/chunk-AGHRB4JF.mjs
var import_dayjs = __toESM(require_dayjs_min(), 1);
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var LEVELS = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  fatal: 5
};
var log = {
  trace: /* @__PURE__ */ __name((..._args) => {}, "trace"),
  debug: /* @__PURE__ */ __name((..._args) => {}, "debug"),
  info: /* @__PURE__ */ __name((..._args) => {}, "info"),
  warn: /* @__PURE__ */ __name((..._args) => {}, "warn"),
  error: /* @__PURE__ */ __name((..._args) => {}, "error"),
  fatal: /* @__PURE__ */ __name((..._args) => {}, "fatal")
};
var setLogLevel = /* @__PURE__ */ __name(function(level = "fatal") {
  let numericLevel = LEVELS.fatal;
  if (typeof level === "string") {
    if (level.toLowerCase() in LEVELS) {
      numericLevel = LEVELS[level];
    }
  } else if (typeof level === "number") {
    numericLevel = level;
  }
  log.trace = () => {};
  log.debug = () => {};
  log.info = () => {};
  log.warn = () => {};
  log.error = () => {};
  log.fatal = () => {};
  if (numericLevel <= LEVELS.fatal) {
    log.fatal = console.error ? console.error.bind(console, format("FATAL"), "color: orange") : console.log.bind(console, "\x1B[35m", format("FATAL"));
  }
  if (numericLevel <= LEVELS.error) {
    log.error = console.error ? console.error.bind(console, format("ERROR"), "color: orange") : console.log.bind(console, "\x1B[31m", format("ERROR"));
  }
  if (numericLevel <= LEVELS.warn) {
    log.warn = console.warn ? console.warn.bind(console, format("WARN"), "color: orange") : console.log.bind(console, `\x1B[33m`, format("WARN"));
  }
  if (numericLevel <= LEVELS.info) {
    log.info = console.info ? console.info.bind(console, format("INFO"), "color: lightblue") : console.log.bind(console, "\x1B[34m", format("INFO"));
  }
  if (numericLevel <= LEVELS.debug) {
    log.debug = console.debug ? console.debug.bind(console, format("DEBUG"), "color: lightgreen") : console.log.bind(console, "\x1B[32m", format("DEBUG"));
  }
  if (numericLevel <= LEVELS.trace) {
    log.trace = console.debug ? console.debug.bind(console, format("TRACE"), "color: lightgreen") : console.log.bind(console, "\x1B[32m", format("TRACE"));
  }
}, "setLogLevel");
var format = /* @__PURE__ */ __name((level) => {
  const time = import_dayjs.default().format("ss.SSS");
  return `%c${time} : ${level} : `;
}, "format");

// node_modules/d3-array/src/max.js
function max(values, valueof) {
  let max2;
  if (valueof === undefined) {
    for (const value of values) {
      if (value != null && (max2 < value || max2 === undefined && value >= value)) {
        max2 = value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && (max2 < value || max2 === undefined && value >= value)) {
        max2 = value;
      }
    }
  }
  return max2;
}

// node_modules/d3-array/src/min.js
function min(values, valueof) {
  let min2;
  if (valueof === undefined) {
    for (const value of values) {
      if (value != null && (min2 > value || min2 === undefined && value >= value)) {
        min2 = value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && (min2 > value || min2 === undefined && value >= value)) {
        min2 = value;
      }
    }
  }
  return min2;
}

// node_modules/d3-array/src/ascending.js
function ascending(a, b) {
  return a == null || b == null ? NaN : a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

// node_modules/d3-array/src/descending.js
function descending(a, b) {
  return a == null || b == null ? NaN : b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
}

// node_modules/d3-array/src/bisector.js
function bisector(f) {
  let compare1, compare2, delta;
  if (f.length !== 2) {
    compare1 = ascending;
    compare2 = (d, x) => ascending(f(d), x);
    delta = (d, x) => f(d) - x;
  } else {
    compare1 = f === ascending || f === descending ? f : zero;
    compare2 = f;
    delta = f;
  }
  function left(a, x, lo = 0, hi = a.length) {
    if (lo < hi) {
      if (compare1(x, x) !== 0)
        return hi;
      do {
        const mid = lo + hi >>> 1;
        if (compare2(a[mid], x) < 0)
          lo = mid + 1;
        else
          hi = mid;
      } while (lo < hi);
    }
    return lo;
  }
  function right(a, x, lo = 0, hi = a.length) {
    if (lo < hi) {
      if (compare1(x, x) !== 0)
        return hi;
      do {
        const mid = lo + hi >>> 1;
        if (compare2(a[mid], x) <= 0)
          lo = mid + 1;
        else
          hi = mid;
      } while (lo < hi);
    }
    return lo;
  }
  function center(a, x, lo = 0, hi = a.length) {
    const i = left(a, x, lo, hi - 1);
    return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
  }
  return { left, center, right };
}
function zero() {
  return 0;
}

// node_modules/d3-array/src/number.js
function number(x) {
  return x === null ? NaN : +x;
}

// node_modules/d3-array/src/bisect.js
var ascendingBisect = bisector(ascending);
var bisectRight = ascendingBisect.right;
var bisectLeft = ascendingBisect.left;
var bisectCenter = bisector(number).center;
var bisect_default = bisectRight;
// node_modules/internmap/src/index.js
class InternMap extends Map {
  constructor(entries, key = keyof) {
    super();
    Object.defineProperties(this, { _intern: { value: new Map }, _key: { value: key } });
    if (entries != null)
      for (const [key2, value] of entries)
        this.set(key2, value);
  }
  get(key) {
    return super.get(intern_get(this, key));
  }
  has(key) {
    return super.has(intern_get(this, key));
  }
  set(key, value) {
    return super.set(intern_set(this, key), value);
  }
  delete(key) {
    return super.delete(intern_delete(this, key));
  }
}
function intern_get({ _intern, _key }, value) {
  const key = _key(value);
  return _intern.has(key) ? _intern.get(key) : value;
}
function intern_set({ _intern, _key }, value) {
  const key = _key(value);
  if (_intern.has(key))
    return _intern.get(key);
  _intern.set(key, value);
  return value;
}
function intern_delete({ _intern, _key }, value) {
  const key = _key(value);
  if (_intern.has(key)) {
    value = _intern.get(key);
    _intern.delete(key);
  }
  return value;
}
function keyof(value) {
  return value !== null && typeof value === "object" ? value.valueOf() : value;
}

// node_modules/d3-array/src/ticks.js
var e10 = Math.sqrt(50);
var e5 = Math.sqrt(10);
var e2 = Math.sqrt(2);
function tickSpec(start, stop, count) {
  const step = (stop - start) / Math.max(0, count), power = Math.floor(Math.log10(step)), error = step / Math.pow(10, power), factor = error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1;
  let i1, i2, inc;
  if (power < 0) {
    inc = Math.pow(10, -power) / factor;
    i1 = Math.round(start * inc);
    i2 = Math.round(stop * inc);
    if (i1 / inc < start)
      ++i1;
    if (i2 / inc > stop)
      --i2;
    inc = -inc;
  } else {
    inc = Math.pow(10, power) * factor;
    i1 = Math.round(start / inc);
    i2 = Math.round(stop / inc);
    if (i1 * inc < start)
      ++i1;
    if (i2 * inc > stop)
      --i2;
  }
  if (i2 < i1 && 0.5 <= count && count < 2)
    return tickSpec(start, stop, count * 2);
  return [i1, i2, inc];
}
function ticks(start, stop, count) {
  stop = +stop, start = +start, count = +count;
  if (!(count > 0))
    return [];
  if (start === stop)
    return [start];
  const reverse = stop < start, [i1, i2, inc] = reverse ? tickSpec(stop, start, count) : tickSpec(start, stop, count);
  if (!(i2 >= i1))
    return [];
  const n = i2 - i1 + 1, ticks2 = new Array(n);
  if (reverse) {
    if (inc < 0)
      for (let i = 0;i < n; ++i)
        ticks2[i] = (i2 - i) / -inc;
    else
      for (let i = 0;i < n; ++i)
        ticks2[i] = (i2 - i) * inc;
  } else {
    if (inc < 0)
      for (let i = 0;i < n; ++i)
        ticks2[i] = (i1 + i) / -inc;
    else
      for (let i = 0;i < n; ++i)
        ticks2[i] = (i1 + i) * inc;
  }
  return ticks2;
}
function tickIncrement(start, stop, count) {
  stop = +stop, start = +start, count = +count;
  return tickSpec(start, stop, count)[2];
}
function tickStep(start, stop, count) {
  stop = +stop, start = +start, count = +count;
  const reverse = stop < start, inc = reverse ? tickIncrement(stop, start, count) : tickIncrement(start, stop, count);
  return (reverse ? -1 : 1) * (inc < 0 ? 1 / -inc : inc);
}
// node_modules/d3-array/src/range.js
function range(start, stop, step) {
  start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;
  var i = -1, n = Math.max(0, Math.ceil((stop - start) / step)) | 0, range2 = new Array(n);
  while (++i < n) {
    range2[i] = start + i * step;
  }
  return range2;
}
// node_modules/d3-axis/src/identity.js
function identity_default(x) {
  return x;
}

// node_modules/d3-axis/src/axis.js
var top = 1;
var right = 2;
var bottom = 3;
var left = 4;
var epsilon = 0.000001;
function translateX(x) {
  return "translate(" + x + ",0)";
}
function translateY(y) {
  return "translate(0," + y + ")";
}
function number2(scale) {
  return (d) => +scale(d);
}
function center(scale, offset) {
  offset = Math.max(0, scale.bandwidth() - offset * 2) / 2;
  if (scale.round())
    offset = Math.round(offset);
  return (d) => +scale(d) + offset;
}
function entering() {
  return !this.__axis;
}
function axis(orient, scale) {
  var tickArguments = [], tickValues = null, tickFormat = null, tickSizeInner = 6, tickSizeOuter = 6, tickPadding = 3, offset = typeof window !== "undefined" && window.devicePixelRatio > 1 ? 0 : 0.5, k = orient === top || orient === left ? -1 : 1, x = orient === left || orient === right ? "x" : "y", transform = orient === top || orient === bottom ? translateX : translateY;
  function axis2(context) {
    var values = tickValues == null ? scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain() : tickValues, format2 = tickFormat == null ? scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments) : identity_default : tickFormat, spacing = Math.max(tickSizeInner, 0) + tickPadding, range2 = scale.range(), range0 = +range2[0] + offset, range1 = +range2[range2.length - 1] + offset, position = (scale.bandwidth ? center : number2)(scale.copy(), offset), selection = context.selection ? context.selection() : context, path = selection.selectAll(".domain").data([null]), tick = selection.selectAll(".tick").data(values, scale).order(), tickExit = tick.exit(), tickEnter = tick.enter().append("g").attr("class", "tick"), line = tick.select("line"), text = tick.select("text");
    path = path.merge(path.enter().insert("path", ".tick").attr("class", "domain").attr("stroke", "currentColor"));
    tick = tick.merge(tickEnter);
    line = line.merge(tickEnter.append("line").attr("stroke", "currentColor").attr(x + "2", k * tickSizeInner));
    text = text.merge(tickEnter.append("text").attr("fill", "currentColor").attr(x, k * spacing).attr("dy", orient === top ? "0em" : orient === bottom ? "0.71em" : "0.32em"));
    if (context !== selection) {
      path = path.transition(context);
      tick = tick.transition(context);
      line = line.transition(context);
      text = text.transition(context);
      tickExit = tickExit.transition(context).attr("opacity", epsilon).attr("transform", function(d) {
        return isFinite(d = position(d)) ? transform(d + offset) : this.getAttribute("transform");
      });
      tickEnter.attr("opacity", epsilon).attr("transform", function(d) {
        var p = this.parentNode.__axis;
        return transform((p && isFinite(p = p(d)) ? p : position(d)) + offset);
      });
    }
    tickExit.remove();
    path.attr("d", orient === left || orient === right ? tickSizeOuter ? "M" + k * tickSizeOuter + "," + range0 + "H" + offset + "V" + range1 + "H" + k * tickSizeOuter : "M" + offset + "," + range0 + "V" + range1 : tickSizeOuter ? "M" + range0 + "," + k * tickSizeOuter + "V" + offset + "H" + range1 + "V" + k * tickSizeOuter : "M" + range0 + "," + offset + "H" + range1);
    tick.attr("opacity", 1).attr("transform", function(d) {
      return transform(position(d) + offset);
    });
    line.attr(x + "2", k * tickSizeInner);
    text.attr(x, k * spacing).text(format2);
    selection.filter(entering).attr("fill", "none").attr("font-size", 10).attr("font-family", "sans-serif").attr("text-anchor", orient === right ? "start" : orient === left ? "end" : "middle");
    selection.each(function() {
      this.__axis = position;
    });
  }
  axis2.scale = function(_) {
    return arguments.length ? (scale = _, axis2) : scale;
  };
  axis2.ticks = function() {
    return tickArguments = Array.from(arguments), axis2;
  };
  axis2.tickArguments = function(_) {
    return arguments.length ? (tickArguments = _ == null ? [] : Array.from(_), axis2) : tickArguments.slice();
  };
  axis2.tickValues = function(_) {
    return arguments.length ? (tickValues = _ == null ? null : Array.from(_), axis2) : tickValues && tickValues.slice();
  };
  axis2.tickFormat = function(_) {
    return arguments.length ? (tickFormat = _, axis2) : tickFormat;
  };
  axis2.tickSize = function(_) {
    return arguments.length ? (tickSizeInner = tickSizeOuter = +_, axis2) : tickSizeInner;
  };
  axis2.tickSizeInner = function(_) {
    return arguments.length ? (tickSizeInner = +_, axis2) : tickSizeInner;
  };
  axis2.tickSizeOuter = function(_) {
    return arguments.length ? (tickSizeOuter = +_, axis2) : tickSizeOuter;
  };
  axis2.tickPadding = function(_) {
    return arguments.length ? (tickPadding = +_, axis2) : tickPadding;
  };
  axis2.offset = function(_) {
    return arguments.length ? (offset = +_, axis2) : offset;
  };
  return axis2;
}
function axisTop(scale) {
  return axis(top, scale);
}
function axisBottom(scale) {
  return axis(bottom, scale);
}
// node_modules/d3-selection/src/selector.js
function none() {}
function selector_default(selector) {
  return selector == null ? none : function() {
    return this.querySelector(selector);
  };
}

// node_modules/d3-selection/src/selection/select.js
function select_default(select) {
  if (typeof select !== "function")
    select = selector_default(select);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0;j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0;i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node)
          subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
      }
    }
  }
  return new Selection(subgroups, this._parents);
}

// node_modules/d3-selection/src/array.js
function array(x) {
  return x == null ? [] : Array.isArray(x) ? x : Array.from(x);
}

// node_modules/d3-selection/src/selectorAll.js
function empty() {
  return [];
}
function selectorAll_default(selector) {
  return selector == null ? empty : function() {
    return this.querySelectorAll(selector);
  };
}

// node_modules/d3-selection/src/selection/selectAll.js
function arrayAll(select) {
  return function() {
    return array(select.apply(this, arguments));
  };
}
function selectAll_default(select) {
  if (typeof select === "function")
    select = arrayAll(select);
  else
    select = selectorAll_default(select);
  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0;j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0;i < n; ++i) {
      if (node = group[i]) {
        subgroups.push(select.call(node, node.__data__, i, group));
        parents.push(node);
      }
    }
  }
  return new Selection(subgroups, parents);
}

// node_modules/d3-selection/src/matcher.js
function matcher_default(selector) {
  return function() {
    return this.matches(selector);
  };
}
function childMatcher(selector) {
  return function(node) {
    return node.matches(selector);
  };
}

// node_modules/d3-selection/src/selection/selectChild.js
var find = Array.prototype.find;
function childFind(match) {
  return function() {
    return find.call(this.children, match);
  };
}
function childFirst() {
  return this.firstElementChild;
}
function selectChild_default(match) {
  return this.select(match == null ? childFirst : childFind(typeof match === "function" ? match : childMatcher(match)));
}

// node_modules/d3-selection/src/selection/selectChildren.js
var filter = Array.prototype.filter;
function children() {
  return Array.from(this.children);
}
function childrenFilter(match) {
  return function() {
    return filter.call(this.children, match);
  };
}
function selectChildren_default(match) {
  return this.selectAll(match == null ? children : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
}

// node_modules/d3-selection/src/selection/filter.js
function filter_default(match) {
  if (typeof match !== "function")
    match = matcher_default(match);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0;j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0;i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }
  return new Selection(subgroups, this._parents);
}

// node_modules/d3-selection/src/selection/sparse.js
function sparse_default(update) {
  return new Array(update.length);
}

// node_modules/d3-selection/src/selection/enter.js
function enter_default() {
  return new Selection(this._enter || this._groups.map(sparse_default), this._parents);
}
function EnterNode(parent, datum) {
  this.ownerDocument = parent.ownerDocument;
  this.namespaceURI = parent.namespaceURI;
  this._next = null;
  this._parent = parent;
  this.__data__ = datum;
}
EnterNode.prototype = {
  constructor: EnterNode,
  appendChild: function(child) {
    return this._parent.insertBefore(child, this._next);
  },
  insertBefore: function(child, next) {
    return this._parent.insertBefore(child, next);
  },
  querySelector: function(selector) {
    return this._parent.querySelector(selector);
  },
  querySelectorAll: function(selector) {
    return this._parent.querySelectorAll(selector);
  }
};

// node_modules/d3-selection/src/constant.js
function constant_default(x) {
  return function() {
    return x;
  };
}

// node_modules/d3-selection/src/selection/data.js
function bindIndex(parent, group, enter, update, exit, data) {
  var i = 0, node, groupLength = group.length, dataLength = data.length;
  for (;i < dataLength; ++i) {
    if (node = group[i]) {
      node.__data__ = data[i];
      update[i] = node;
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (;i < groupLength; ++i) {
    if (node = group[i]) {
      exit[i] = node;
    }
  }
}
function bindKey(parent, group, enter, update, exit, data, key) {
  var i, node, nodeByKeyValue = new Map, groupLength = group.length, dataLength = data.length, keyValues = new Array(groupLength), keyValue;
  for (i = 0;i < groupLength; ++i) {
    if (node = group[i]) {
      keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
      if (nodeByKeyValue.has(keyValue)) {
        exit[i] = node;
      } else {
        nodeByKeyValue.set(keyValue, node);
      }
    }
  }
  for (i = 0;i < dataLength; ++i) {
    keyValue = key.call(parent, data[i], i, data) + "";
    if (node = nodeByKeyValue.get(keyValue)) {
      update[i] = node;
      node.__data__ = data[i];
      nodeByKeyValue.delete(keyValue);
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (i = 0;i < groupLength; ++i) {
    if ((node = group[i]) && nodeByKeyValue.get(keyValues[i]) === node) {
      exit[i] = node;
    }
  }
}
function datum(node) {
  return node.__data__;
}
function data_default(value, key) {
  if (!arguments.length)
    return Array.from(this, datum);
  var bind = key ? bindKey : bindIndex, parents = this._parents, groups = this._groups;
  if (typeof value !== "function")
    value = constant_default(value);
  for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0;j < m; ++j) {
    var parent = parents[j], group = groups[j], groupLength = group.length, data = arraylike(value.call(parent, parent && parent.__data__, j, parents)), dataLength = data.length, enterGroup = enter[j] = new Array(dataLength), updateGroup = update[j] = new Array(dataLength), exitGroup = exit[j] = new Array(groupLength);
    bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);
    for (var i0 = 0, i1 = 0, previous, next;i0 < dataLength; ++i0) {
      if (previous = enterGroup[i0]) {
        if (i0 >= i1)
          i1 = i0 + 1;
        while (!(next = updateGroup[i1]) && ++i1 < dataLength)
          ;
        previous._next = next || null;
      }
    }
  }
  update = new Selection(update, parents);
  update._enter = enter;
  update._exit = exit;
  return update;
}
function arraylike(data) {
  return typeof data === "object" && "length" in data ? data : Array.from(data);
}

// node_modules/d3-selection/src/selection/exit.js
function exit_default() {
  return new Selection(this._exit || this._groups.map(sparse_default), this._parents);
}

// node_modules/d3-selection/src/selection/join.js
function join_default(onenter, onupdate, onexit) {
  var enter = this.enter(), update = this, exit = this.exit();
  if (typeof onenter === "function") {
    enter = onenter(enter);
    if (enter)
      enter = enter.selection();
  } else {
    enter = enter.append(onenter + "");
  }
  if (onupdate != null) {
    update = onupdate(update);
    if (update)
      update = update.selection();
  }
  if (onexit == null)
    exit.remove();
  else
    onexit(exit);
  return enter && update ? enter.merge(update).order() : update;
}

// node_modules/d3-selection/src/selection/merge.js
function merge_default(context) {
  var selection = context.selection ? context.selection() : context;
  for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0;j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0;i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }
  for (;j < m0; ++j) {
    merges[j] = groups0[j];
  }
  return new Selection(merges, this._parents);
}

// node_modules/d3-selection/src/selection/order.js
function order_default() {
  for (var groups = this._groups, j = -1, m = groups.length;++j < m; ) {
    for (var group = groups[j], i = group.length - 1, next = group[i], node;--i >= 0; ) {
      if (node = group[i]) {
        if (next && node.compareDocumentPosition(next) ^ 4)
          next.parentNode.insertBefore(node, next);
        next = node;
      }
    }
  }
  return this;
}

// node_modules/d3-selection/src/selection/sort.js
function sort_default(compare) {
  if (!compare)
    compare = ascending2;
  function compareNode(a, b) {
    return a && b ? compare(a.__data__, b.__data__) : !a - !b;
  }
  for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0;j < m; ++j) {
    for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0;i < n; ++i) {
      if (node = group[i]) {
        sortgroup[i] = node;
      }
    }
    sortgroup.sort(compareNode);
  }
  return new Selection(sortgroups, this._parents).order();
}
function ascending2(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

// node_modules/d3-selection/src/selection/call.js
function call_default() {
  var callback = arguments[0];
  arguments[0] = this;
  callback.apply(null, arguments);
  return this;
}

// node_modules/d3-selection/src/selection/nodes.js
function nodes_default() {
  return Array.from(this);
}

// node_modules/d3-selection/src/selection/node.js
function node_default() {
  for (var groups = this._groups, j = 0, m = groups.length;j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length;i < n; ++i) {
      var node = group[i];
      if (node)
        return node;
    }
  }
  return null;
}

// node_modules/d3-selection/src/selection/size.js
function size_default() {
  let size = 0;
  for (const node of this)
    ++size;
  return size;
}

// node_modules/d3-selection/src/selection/empty.js
function empty_default() {
  return !this.node();
}

// node_modules/d3-selection/src/selection/each.js
function each_default(callback) {
  for (var groups = this._groups, j = 0, m = groups.length;j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node;i < n; ++i) {
      if (node = group[i])
        callback.call(node, node.__data__, i, group);
    }
  }
  return this;
}

// node_modules/d3-selection/src/namespaces.js
var xhtml = "http://www.w3.org/1999/xhtml";
var namespaces_default = {
  svg: "http://www.w3.org/2000/svg",
  xhtml,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};

// node_modules/d3-selection/src/namespace.js
function namespace_default(name) {
  var prefix = name += "", i = prefix.indexOf(":");
  if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns")
    name = name.slice(i + 1);
  return namespaces_default.hasOwnProperty(prefix) ? { space: namespaces_default[prefix], local: name } : name;
}

// node_modules/d3-selection/src/selection/attr.js
function attrRemove(name) {
  return function() {
    this.removeAttribute(name);
  };
}
function attrRemoveNS(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant(name, value) {
  return function() {
    this.setAttribute(name, value);
  };
}
function attrConstantNS(fullname, value) {
  return function() {
    this.setAttributeNS(fullname.space, fullname.local, value);
  };
}
function attrFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null)
      this.removeAttribute(name);
    else
      this.setAttribute(name, v);
  };
}
function attrFunctionNS(fullname, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null)
      this.removeAttributeNS(fullname.space, fullname.local);
    else
      this.setAttributeNS(fullname.space, fullname.local, v);
  };
}
function attr_default(name, value) {
  var fullname = namespace_default(name);
  if (arguments.length < 2) {
    var node = this.node();
    return fullname.local ? node.getAttributeNS(fullname.space, fullname.local) : node.getAttribute(fullname);
  }
  return this.each((value == null ? fullname.local ? attrRemoveNS : attrRemove : typeof value === "function" ? fullname.local ? attrFunctionNS : attrFunction : fullname.local ? attrConstantNS : attrConstant)(fullname, value));
}

// node_modules/d3-selection/src/window.js
function window_default(node) {
  return node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView;
}

// node_modules/d3-selection/src/selection/style.js
function styleRemove(name) {
  return function() {
    this.style.removeProperty(name);
  };
}
function styleConstant(name, value, priority) {
  return function() {
    this.style.setProperty(name, value, priority);
  };
}
function styleFunction(name, value, priority) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null)
      this.style.removeProperty(name);
    else
      this.style.setProperty(name, v, priority);
  };
}
function style_default(name, value, priority) {
  return arguments.length > 1 ? this.each((value == null ? styleRemove : typeof value === "function" ? styleFunction : styleConstant)(name, value, priority == null ? "" : priority)) : styleValue(this.node(), name);
}
function styleValue(node, name) {
  return node.style.getPropertyValue(name) || window_default(node).getComputedStyle(node, null).getPropertyValue(name);
}

// node_modules/d3-selection/src/selection/property.js
function propertyRemove(name) {
  return function() {
    delete this[name];
  };
}
function propertyConstant(name, value) {
  return function() {
    this[name] = value;
  };
}
function propertyFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null)
      delete this[name];
    else
      this[name] = v;
  };
}
function property_default(name, value) {
  return arguments.length > 1 ? this.each((value == null ? propertyRemove : typeof value === "function" ? propertyFunction : propertyConstant)(name, value)) : this.node()[name];
}

// node_modules/d3-selection/src/selection/classed.js
function classArray(string) {
  return string.trim().split(/^|\s+/);
}
function classList(node) {
  return node.classList || new ClassList(node);
}
function ClassList(node) {
  this._node = node;
  this._names = classArray(node.getAttribute("class") || "");
}
ClassList.prototype = {
  add: function(name) {
    var i = this._names.indexOf(name);
    if (i < 0) {
      this._names.push(name);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  remove: function(name) {
    var i = this._names.indexOf(name);
    if (i >= 0) {
      this._names.splice(i, 1);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  contains: function(name) {
    return this._names.indexOf(name) >= 0;
  }
};
function classedAdd(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n)
    list.add(names[i]);
}
function classedRemove(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n)
    list.remove(names[i]);
}
function classedTrue(names) {
  return function() {
    classedAdd(this, names);
  };
}
function classedFalse(names) {
  return function() {
    classedRemove(this, names);
  };
}
function classedFunction(names, value) {
  return function() {
    (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
  };
}
function classed_default(name, value) {
  var names = classArray(name + "");
  if (arguments.length < 2) {
    var list = classList(this.node()), i = -1, n = names.length;
    while (++i < n)
      if (!list.contains(names[i]))
        return false;
    return true;
  }
  return this.each((typeof value === "function" ? classedFunction : value ? classedTrue : classedFalse)(names, value));
}

// node_modules/d3-selection/src/selection/text.js
function textRemove() {
  this.textContent = "";
}
function textConstant(value) {
  return function() {
    this.textContent = value;
  };
}
function textFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.textContent = v == null ? "" : v;
  };
}
function text_default(value) {
  return arguments.length ? this.each(value == null ? textRemove : (typeof value === "function" ? textFunction : textConstant)(value)) : this.node().textContent;
}

// node_modules/d3-selection/src/selection/html.js
function htmlRemove() {
  this.innerHTML = "";
}
function htmlConstant(value) {
  return function() {
    this.innerHTML = value;
  };
}
function htmlFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.innerHTML = v == null ? "" : v;
  };
}
function html_default(value) {
  return arguments.length ? this.each(value == null ? htmlRemove : (typeof value === "function" ? htmlFunction : htmlConstant)(value)) : this.node().innerHTML;
}

// node_modules/d3-selection/src/selection/raise.js
function raise() {
  if (this.nextSibling)
    this.parentNode.appendChild(this);
}
function raise_default() {
  return this.each(raise);
}

// node_modules/d3-selection/src/selection/lower.js
function lower() {
  if (this.previousSibling)
    this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function lower_default() {
  return this.each(lower);
}

// node_modules/d3-selection/src/creator.js
function creatorInherit(name) {
  return function() {
    var document2 = this.ownerDocument, uri = this.namespaceURI;
    return uri === xhtml && document2.documentElement.namespaceURI === xhtml ? document2.createElement(name) : document2.createElementNS(uri, name);
  };
}
function creatorFixed(fullname) {
  return function() {
    return this.ownerDocument.createElementNS(fullname.space, fullname.local);
  };
}
function creator_default(name) {
  var fullname = namespace_default(name);
  return (fullname.local ? creatorFixed : creatorInherit)(fullname);
}

// node_modules/d3-selection/src/selection/append.js
function append_default(name) {
  var create = typeof name === "function" ? name : creator_default(name);
  return this.select(function() {
    return this.appendChild(create.apply(this, arguments));
  });
}

// node_modules/d3-selection/src/selection/insert.js
function constantNull() {
  return null;
}
function insert_default(name, before) {
  var create = typeof name === "function" ? name : creator_default(name), select = before == null ? constantNull : typeof before === "function" ? before : selector_default(before);
  return this.select(function() {
    return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
  });
}

// node_modules/d3-selection/src/selection/remove.js
function remove() {
  var parent = this.parentNode;
  if (parent)
    parent.removeChild(this);
}
function remove_default() {
  return this.each(remove);
}

// node_modules/d3-selection/src/selection/clone.js
function selection_cloneShallow() {
  var clone = this.cloneNode(false), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function selection_cloneDeep() {
  var clone = this.cloneNode(true), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function clone_default(deep) {
  return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
}

// node_modules/d3-selection/src/selection/datum.js
function datum_default(value) {
  return arguments.length ? this.property("__data__", value) : this.node().__data__;
}

// node_modules/d3-selection/src/selection/on.js
function contextListener(listener) {
  return function(event) {
    listener.call(this, event, this.__data__);
  };
}
function parseTypenames(typenames) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0)
      name = t.slice(i + 1), t = t.slice(0, i);
    return { type: t, name };
  });
}
function onRemove(typename) {
  return function() {
    var on = this.__on;
    if (!on)
      return;
    for (var j = 0, i = -1, m = on.length, o;j < m; ++j) {
      if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
      } else {
        on[++i] = o;
      }
    }
    if (++i)
      on.length = i;
    else
      delete this.__on;
  };
}
function onAdd(typename, value, options) {
  return function() {
    var on = this.__on, o, listener = contextListener(value);
    if (on)
      for (var j = 0, m = on.length;j < m; ++j) {
        if ((o = on[j]).type === typename.type && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
          this.addEventListener(o.type, o.listener = listener, o.options = options);
          o.value = value;
          return;
        }
      }
    this.addEventListener(typename.type, listener, options);
    o = { type: typename.type, name: typename.name, value, listener, options };
    if (!on)
      this.__on = [o];
    else
      on.push(o);
  };
}
function on_default(typename, value, options) {
  var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;
  if (arguments.length < 2) {
    var on = this.node().__on;
    if (on)
      for (var j = 0, m = on.length, o;j < m; ++j) {
        for (i = 0, o = on[j];i < n; ++i) {
          if ((t = typenames[i]).type === o.type && t.name === o.name) {
            return o.value;
          }
        }
      }
    return;
  }
  on = value ? onAdd : onRemove;
  for (i = 0;i < n; ++i)
    this.each(on(typenames[i], value, options));
  return this;
}

// node_modules/d3-selection/src/selection/dispatch.js
function dispatchEvent(node, type, params) {
  var window2 = window_default(node), event = window2.CustomEvent;
  if (typeof event === "function") {
    event = new event(type, params);
  } else {
    event = window2.document.createEvent("Event");
    if (params)
      event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
    else
      event.initEvent(type, false, false);
  }
  node.dispatchEvent(event);
}
function dispatchConstant(type, params) {
  return function() {
    return dispatchEvent(this, type, params);
  };
}
function dispatchFunction(type, params) {
  return function() {
    return dispatchEvent(this, type, params.apply(this, arguments));
  };
}
function dispatch_default(type, params) {
  return this.each((typeof params === "function" ? dispatchFunction : dispatchConstant)(type, params));
}

// node_modules/d3-selection/src/selection/iterator.js
function* iterator_default() {
  for (var groups = this._groups, j = 0, m = groups.length;j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node;i < n; ++i) {
      if (node = group[i])
        yield node;
    }
  }
}

// node_modules/d3-selection/src/selection/index.js
var root = [null];
function Selection(groups, parents) {
  this._groups = groups;
  this._parents = parents;
}
function selection() {
  return new Selection([[document.documentElement]], root);
}
function selection_selection() {
  return this;
}
Selection.prototype = selection.prototype = {
  constructor: Selection,
  select: select_default,
  selectAll: selectAll_default,
  selectChild: selectChild_default,
  selectChildren: selectChildren_default,
  filter: filter_default,
  data: data_default,
  enter: enter_default,
  exit: exit_default,
  join: join_default,
  merge: merge_default,
  selection: selection_selection,
  order: order_default,
  sort: sort_default,
  call: call_default,
  nodes: nodes_default,
  node: node_default,
  size: size_default,
  empty: empty_default,
  each: each_default,
  attr: attr_default,
  style: style_default,
  property: property_default,
  classed: classed_default,
  text: text_default,
  html: html_default,
  raise: raise_default,
  lower: lower_default,
  append: append_default,
  insert: insert_default,
  remove: remove_default,
  clone: clone_default,
  datum: datum_default,
  on: on_default,
  dispatch: dispatch_default,
  [Symbol.iterator]: iterator_default
};
var selection_default = selection;

// node_modules/d3-selection/src/select.js
function select_default2(selector) {
  return typeof selector === "string" ? new Selection([[document.querySelector(selector)]], [document.documentElement]) : new Selection([[selector]], root);
}
// node_modules/d3-color/src/define.js
function define_default(constructor, factory, prototype) {
  constructor.prototype = factory.prototype = prototype;
  prototype.constructor = constructor;
}
function extend(parent, definition) {
  var prototype = Object.create(parent.prototype);
  for (var key in definition)
    prototype[key] = definition[key];
  return prototype;
}

// node_modules/d3-color/src/color.js
function Color() {}
var darker = 0.7;
var brighter = 1 / darker;
var reI = "\\s*([+-]?\\d+)\\s*";
var reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*";
var reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*";
var reHex = /^#([0-9a-f]{3,8})$/;
var reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`);
var reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`);
var reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`);
var reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`);
var reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`);
var reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);
var named = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
define_default(Color, color, {
  copy(channels) {
    return Object.assign(new this.constructor, this, channels);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: color_formatHex,
  formatHex: color_formatHex,
  formatHex8: color_formatHex8,
  formatHsl: color_formatHsl,
  formatRgb: color_formatRgb,
  toString: color_formatRgb
});
function color_formatHex() {
  return this.rgb().formatHex();
}
function color_formatHex8() {
  return this.rgb().formatHex8();
}
function color_formatHsl() {
  return hslConvert(this).formatHsl();
}
function color_formatRgb() {
  return this.rgb().formatRgb();
}
function color(format2) {
  var m, l;
  format2 = (format2 + "").trim().toLowerCase();
  return (m = reHex.exec(format2)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) : l === 3 ? new Rgb(m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, (m & 15) << 4 | m & 15, 1) : l === 8 ? rgba(m >> 24 & 255, m >> 16 & 255, m >> 8 & 255, (m & 255) / 255) : l === 4 ? rgba(m >> 12 & 15 | m >> 8 & 240, m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, ((m & 15) << 4 | m & 15) / 255) : null) : (m = reRgbInteger.exec(format2)) ? new Rgb(m[1], m[2], m[3], 1) : (m = reRgbPercent.exec(format2)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) : (m = reRgbaInteger.exec(format2)) ? rgba(m[1], m[2], m[3], m[4]) : (m = reRgbaPercent.exec(format2)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) : (m = reHslPercent.exec(format2)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) : (m = reHslaPercent.exec(format2)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) : named.hasOwnProperty(format2) ? rgbn(named[format2]) : format2 === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
}
function rgbn(n) {
  return new Rgb(n >> 16 & 255, n >> 8 & 255, n & 255, 1);
}
function rgba(r, g, b, a) {
  if (a <= 0)
    r = g = b = NaN;
  return new Rgb(r, g, b, a);
}
function rgbConvert(o) {
  if (!(o instanceof Color))
    o = color(o);
  if (!o)
    return new Rgb;
  o = o.rgb();
  return new Rgb(o.r, o.g, o.b, o.opacity);
}
function rgb(r, g, b, opacity) {
  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
}
function Rgb(r, g, b, opacity) {
  this.r = +r;
  this.g = +g;
  this.b = +b;
  this.opacity = +opacity;
}
define_default(Rgb, rgb, extend(Color, {
  brighter(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  darker(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && (-0.5 <= this.g && this.g < 255.5) && (-0.5 <= this.b && this.b < 255.5) && (0 <= this.opacity && this.opacity <= 1);
  },
  hex: rgb_formatHex,
  formatHex: rgb_formatHex,
  formatHex8: rgb_formatHex8,
  formatRgb: rgb_formatRgb,
  toString: rgb_formatRgb
}));
function rgb_formatHex() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
}
function rgb_formatHex8() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function rgb_formatRgb() {
  const a = clampa(this.opacity);
  return `${a === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ")" : `, ${a})`}`;
}
function clampa(opacity) {
  return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
}
function clampi(value) {
  return Math.max(0, Math.min(255, Math.round(value) || 0));
}
function hex(value) {
  value = clampi(value);
  return (value < 16 ? "0" : "") + value.toString(16);
}
function hsla(h, s, l, a) {
  if (a <= 0)
    h = s = l = NaN;
  else if (l <= 0 || l >= 1)
    h = s = NaN;
  else if (s <= 0)
    h = NaN;
  return new Hsl(h, s, l, a);
}
function hslConvert(o) {
  if (o instanceof Hsl)
    return new Hsl(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Color))
    o = color(o);
  if (!o)
    return new Hsl;
  if (o instanceof Hsl)
    return o;
  o = o.rgb();
  var r = o.r / 255, g = o.g / 255, b = o.b / 255, min2 = Math.min(r, g, b), max2 = Math.max(r, g, b), h = NaN, s = max2 - min2, l = (max2 + min2) / 2;
  if (s) {
    if (r === max2)
      h = (g - b) / s + (g < b) * 6;
    else if (g === max2)
      h = (b - r) / s + 2;
    else
      h = (r - g) / s + 4;
    s /= l < 0.5 ? max2 + min2 : 2 - max2 - min2;
    h *= 60;
  } else {
    s = l > 0 && l < 1 ? 0 : h;
  }
  return new Hsl(h, s, l, o.opacity);
}
function hsl(h, s, l, opacity) {
  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
}
function Hsl(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}
define_default(Hsl, hsl, extend(Color, {
  brighter(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  darker(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  rgb() {
    var h = this.h % 360 + (this.h < 0) * 360, s = isNaN(h) || isNaN(this.s) ? 0 : this.s, l = this.l, m2 = l + (l < 0.5 ? l : 1 - l) * s, m1 = 2 * l - m2;
    return new Rgb(hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2), hsl2rgb(h, m1, m2), hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2), this.opacity);
  },
  clamp() {
    return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && (0 <= this.l && this.l <= 1) && (0 <= this.opacity && this.opacity <= 1);
  },
  formatHsl() {
    const a = clampa(this.opacity);
    return `${a === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
  }
}));
function clamph(value) {
  value = (value || 0) % 360;
  return value < 0 ? value + 360 : value;
}
function clampt(value) {
  return Math.max(0, Math.min(1, value || 0));
}
function hsl2rgb(h, m1, m2) {
  return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
}
// node_modules/d3-color/src/math.js
var radians = Math.PI / 180;
var degrees = 180 / Math.PI;

// node_modules/d3-color/src/lab.js
var K = 18;
var Xn = 0.96422;
var Yn = 1;
var Zn = 0.82521;
var t0 = 4 / 29;
var t1 = 6 / 29;
var t2 = 3 * t1 * t1;
var t3 = t1 * t1 * t1;
function labConvert(o) {
  if (o instanceof Lab)
    return new Lab(o.l, o.a, o.b, o.opacity);
  if (o instanceof Hcl)
    return hcl2lab(o);
  if (!(o instanceof Rgb))
    o = rgbConvert(o);
  var r = rgb2lrgb(o.r), g = rgb2lrgb(o.g), b = rgb2lrgb(o.b), y = xyz2lab((0.2225045 * r + 0.7168786 * g + 0.0606169 * b) / Yn), x, z;
  if (r === g && g === b)
    x = z = y;
  else {
    x = xyz2lab((0.4360747 * r + 0.3850649 * g + 0.1430804 * b) / Xn);
    z = xyz2lab((0.0139322 * r + 0.0971045 * g + 0.7141733 * b) / Zn);
  }
  return new Lab(116 * y - 16, 500 * (x - y), 200 * (y - z), o.opacity);
}
function lab(l, a, b, opacity) {
  return arguments.length === 1 ? labConvert(l) : new Lab(l, a, b, opacity == null ? 1 : opacity);
}
function Lab(l, a, b, opacity) {
  this.l = +l;
  this.a = +a;
  this.b = +b;
  this.opacity = +opacity;
}
define_default(Lab, lab, extend(Color, {
  brighter(k) {
    return new Lab(this.l + K * (k == null ? 1 : k), this.a, this.b, this.opacity);
  },
  darker(k) {
    return new Lab(this.l - K * (k == null ? 1 : k), this.a, this.b, this.opacity);
  },
  rgb() {
    var y = (this.l + 16) / 116, x = isNaN(this.a) ? y : y + this.a / 500, z = isNaN(this.b) ? y : y - this.b / 200;
    x = Xn * lab2xyz(x);
    y = Yn * lab2xyz(y);
    z = Zn * lab2xyz(z);
    return new Rgb(lrgb2rgb(3.1338561 * x - 1.6168667 * y - 0.4906146 * z), lrgb2rgb(-0.9787684 * x + 1.9161415 * y + 0.033454 * z), lrgb2rgb(0.0719453 * x - 0.2289914 * y + 1.4052427 * z), this.opacity);
  }
}));
function xyz2lab(t) {
  return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
}
function lab2xyz(t) {
  return t > t1 ? t * t * t : t2 * (t - t0);
}
function lrgb2rgb(x) {
  return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
}
function rgb2lrgb(x) {
  return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}
function hclConvert(o) {
  if (o instanceof Hcl)
    return new Hcl(o.h, o.c, o.l, o.opacity);
  if (!(o instanceof Lab))
    o = labConvert(o);
  if (o.a === 0 && o.b === 0)
    return new Hcl(NaN, 0 < o.l && o.l < 100 ? 0 : NaN, o.l, o.opacity);
  var h = Math.atan2(o.b, o.a) * degrees;
  return new Hcl(h < 0 ? h + 360 : h, Math.sqrt(o.a * o.a + o.b * o.b), o.l, o.opacity);
}
function hcl(h, c, l, opacity) {
  return arguments.length === 1 ? hclConvert(h) : new Hcl(h, c, l, opacity == null ? 1 : opacity);
}
function Hcl(h, c, l, opacity) {
  this.h = +h;
  this.c = +c;
  this.l = +l;
  this.opacity = +opacity;
}
function hcl2lab(o) {
  if (isNaN(o.h))
    return new Lab(o.l, 0, 0, o.opacity);
  var h = o.h * radians;
  return new Lab(o.l, Math.cos(h) * o.c, Math.sin(h) * o.c, o.opacity);
}
define_default(Hcl, hcl, extend(Color, {
  brighter(k) {
    return new Hcl(this.h, this.c, this.l + K * (k == null ? 1 : k), this.opacity);
  },
  darker(k) {
    return new Hcl(this.h, this.c, this.l - K * (k == null ? 1 : k), this.opacity);
  },
  rgb() {
    return hcl2lab(this).rgb();
  }
}));
// node_modules/d3-interpolate/src/constant.js
var constant_default2 = (x) => () => x;

// node_modules/d3-interpolate/src/color.js
function linear(a, d) {
  return function(t) {
    return a + t * d;
  };
}
function exponential(a, b, y) {
  return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
    return Math.pow(a + t * b, y);
  };
}
function hue(a, b) {
  var d = b - a;
  return d ? linear(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant_default2(isNaN(a) ? b : a);
}
function gamma(y) {
  return (y = +y) === 1 ? nogamma : function(a, b) {
    return b - a ? exponential(a, b, y) : constant_default2(isNaN(a) ? b : a);
  };
}
function nogamma(a, b) {
  var d = b - a;
  return d ? linear(a, d) : constant_default2(isNaN(a) ? b : a);
}

// node_modules/d3-interpolate/src/hcl.js
function hcl2(hue2) {
  return function(start, end) {
    var h = hue2((start = hcl(start)).h, (end = hcl(end)).h), c = nogamma(start.c, end.c), l = nogamma(start.l, end.l), opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.h = h(t);
      start.c = c(t);
      start.l = l(t);
      start.opacity = opacity(t);
      return start + "";
    };
  };
}
var hcl_default = hcl2(hue);
var hclLong = hcl2(nogamma);

// node_modules/d3-interpolate/src/basis.js
function basis(t12, v0, v1, v2, v3) {
  var t22 = t12 * t12, t32 = t22 * t12;
  return ((1 - 3 * t12 + 3 * t22 - t32) * v0 + (4 - 6 * t22 + 3 * t32) * v1 + (1 + 3 * t12 + 3 * t22 - 3 * t32) * v2 + t32 * v3) / 6;
}
function basis_default(values) {
  var n = values.length - 1;
  return function(t) {
    var i = t <= 0 ? t = 0 : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n), v1 = values[i], v2 = values[i + 1], v0 = i > 0 ? values[i - 1] : 2 * v1 - v2, v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
    return basis((t - i / n) * n, v0, v1, v2, v3);
  };
}

// node_modules/d3-interpolate/src/basisClosed.js
function basisClosed_default(values) {
  var n = values.length;
  return function(t) {
    var i = Math.floor(((t %= 1) < 0 ? ++t : t) * n), v0 = values[(i + n - 1) % n], v1 = values[i % n], v2 = values[(i + 1) % n], v3 = values[(i + 2) % n];
    return basis((t - i / n) * n, v0, v1, v2, v3);
  };
}

// node_modules/d3-interpolate/src/rgb.js
var rgb_default = function rgbGamma(y) {
  var color2 = gamma(y);
  function rgb2(start, end) {
    var r = color2((start = rgb(start)).r, (end = rgb(end)).r), g = color2(start.g, end.g), b = color2(start.b, end.b), opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.r = r(t);
      start.g = g(t);
      start.b = b(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }
  rgb2.gamma = rgbGamma;
  return rgb2;
}(1);
function rgbSpline(spline) {
  return function(colors) {
    var n = colors.length, r = new Array(n), g = new Array(n), b = new Array(n), i, color2;
    for (i = 0;i < n; ++i) {
      color2 = rgb(colors[i]);
      r[i] = color2.r || 0;
      g[i] = color2.g || 0;
      b[i] = color2.b || 0;
    }
    r = spline(r);
    g = spline(g);
    b = spline(b);
    color2.opacity = 1;
    return function(t) {
      color2.r = r(t);
      color2.g = g(t);
      color2.b = b(t);
      return color2 + "";
    };
  };
}
var rgbBasis = rgbSpline(basis_default);
var rgbBasisClosed = rgbSpline(basisClosed_default);

// node_modules/d3-interpolate/src/numberArray.js
function numberArray_default(a, b) {
  if (!b)
    b = [];
  var n = a ? Math.min(b.length, a.length) : 0, c = b.slice(), i;
  return function(t) {
    for (i = 0;i < n; ++i)
      c[i] = a[i] * (1 - t) + b[i] * t;
    return c;
  };
}
function isNumberArray(x) {
  return ArrayBuffer.isView(x) && !(x instanceof DataView);
}

// node_modules/d3-interpolate/src/array.js
function genericArray(a, b) {
  var nb = b ? b.length : 0, na = a ? Math.min(nb, a.length) : 0, x = new Array(na), c = new Array(nb), i;
  for (i = 0;i < na; ++i)
    x[i] = value_default(a[i], b[i]);
  for (;i < nb; ++i)
    c[i] = b[i];
  return function(t) {
    for (i = 0;i < na; ++i)
      c[i] = x[i](t);
    return c;
  };
}

// node_modules/d3-interpolate/src/date.js
function date_default(a, b) {
  var d = new Date;
  return a = +a, b = +b, function(t) {
    return d.setTime(a * (1 - t) + b * t), d;
  };
}

// node_modules/d3-interpolate/src/number.js
function number_default(a, b) {
  return a = +a, b = +b, function(t) {
    return a * (1 - t) + b * t;
  };
}

// node_modules/d3-interpolate/src/object.js
function object_default(a, b) {
  var i = {}, c = {}, k;
  if (a === null || typeof a !== "object")
    a = {};
  if (b === null || typeof b !== "object")
    b = {};
  for (k in b) {
    if (k in a) {
      i[k] = value_default(a[k], b[k]);
    } else {
      c[k] = b[k];
    }
  }
  return function(t) {
    for (k in i)
      c[k] = i[k](t);
    return c;
  };
}

// node_modules/d3-interpolate/src/string.js
var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
var reB = new RegExp(reA.source, "g");
function zero2(b) {
  return function() {
    return b;
  };
}
function one(b) {
  return function(t) {
    return b(t) + "";
  };
}
function string_default(a, b) {
  var bi = reA.lastIndex = reB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
  a = a + "", b = b + "";
  while ((am = reA.exec(a)) && (bm = reB.exec(b))) {
    if ((bs = bm.index) > bi) {
      bs = b.slice(bi, bs);
      if (s[i])
        s[i] += bs;
      else
        s[++i] = bs;
    }
    if ((am = am[0]) === (bm = bm[0])) {
      if (s[i])
        s[i] += bm;
      else
        s[++i] = bm;
    } else {
      s[++i] = null;
      q.push({ i, x: number_default(am, bm) });
    }
    bi = reB.lastIndex;
  }
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s[i])
      s[i] += bs;
    else
      s[++i] = bs;
  }
  return s.length < 2 ? q[0] ? one(q[0].x) : zero2(b) : (b = q.length, function(t) {
    for (var i2 = 0, o;i2 < b; ++i2)
      s[(o = q[i2]).i] = o.x(t);
    return s.join("");
  });
}

// node_modules/d3-interpolate/src/value.js
function value_default(a, b) {
  var t = typeof b, c;
  return b == null || t === "boolean" ? constant_default2(b) : (t === "number" ? number_default : t === "string" ? (c = color(b)) ? (b = c, rgb_default) : string_default : b instanceof color ? rgb_default : b instanceof Date ? date_default : isNumberArray(b) ? numberArray_default : Array.isArray(b) ? genericArray : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object_default : number_default)(a, b);
}
// node_modules/d3-interpolate/src/round.js
function round_default(a, b) {
  return a = +a, b = +b, function(t) {
    return Math.round(a * (1 - t) + b * t);
  };
}
// node_modules/d3-interpolate/src/transform/decompose.js
var degrees2 = 180 / Math.PI;
var identity = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function decompose_default(a, b, c, d, e, f) {
  var scaleX, scaleY, skewX;
  if (scaleX = Math.sqrt(a * a + b * b))
    a /= scaleX, b /= scaleX;
  if (skewX = a * c + b * d)
    c -= a * skewX, d -= b * skewX;
  if (scaleY = Math.sqrt(c * c + d * d))
    c /= scaleY, d /= scaleY, skewX /= scaleY;
  if (a * d < b * c)
    a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
  return {
    translateX: e,
    translateY: f,
    rotate: Math.atan2(b, a) * degrees2,
    skewX: Math.atan(skewX) * degrees2,
    scaleX,
    scaleY
  };
}

// node_modules/d3-interpolate/src/transform/parse.js
var svgNode;
function parseCss(value) {
  const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
  return m.isIdentity ? identity : decompose_default(m.a, m.b, m.c, m.d, m.e, m.f);
}
function parseSvg(value) {
  if (value == null)
    return identity;
  if (!svgNode)
    svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svgNode.setAttribute("transform", value);
  if (!(value = svgNode.transform.baseVal.consolidate()))
    return identity;
  value = value.matrix;
  return decompose_default(value.a, value.b, value.c, value.d, value.e, value.f);
}

// node_modules/d3-interpolate/src/transform/index.js
function interpolateTransform(parse, pxComma, pxParen, degParen) {
  function pop(s) {
    return s.length ? s.pop() + " " : "";
  }
  function translate(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push("translate(", null, pxComma, null, pxParen);
      q.push({ i: i - 4, x: number_default(xa, xb) }, { i: i - 2, x: number_default(ya, yb) });
    } else if (xb || yb) {
      s.push("translate(" + xb + pxComma + yb + pxParen);
    }
  }
  function rotate(a, b, s, q) {
    if (a !== b) {
      if (a - b > 180)
        b += 360;
      else if (b - a > 180)
        a += 360;
      q.push({ i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: number_default(a, b) });
    } else if (b) {
      s.push(pop(s) + "rotate(" + b + degParen);
    }
  }
  function skewX(a, b, s, q) {
    if (a !== b) {
      q.push({ i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: number_default(a, b) });
    } else if (b) {
      s.push(pop(s) + "skewX(" + b + degParen);
    }
  }
  function scale(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push(pop(s) + "scale(", null, ",", null, ")");
      q.push({ i: i - 4, x: number_default(xa, xb) }, { i: i - 2, x: number_default(ya, yb) });
    } else if (xb !== 1 || yb !== 1) {
      s.push(pop(s) + "scale(" + xb + "," + yb + ")");
    }
  }
  return function(a, b) {
    var s = [], q = [];
    a = parse(a), b = parse(b);
    translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
    rotate(a.rotate, b.rotate, s, q);
    skewX(a.skewX, b.skewX, s, q);
    scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
    a = b = null;
    return function(t) {
      var i = -1, n = q.length, o;
      while (++i < n)
        s[(o = q[i]).i] = o.x(t);
      return s.join("");
    };
  };
}
var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");
// node_modules/d3-format/src/formatDecimal.js
function formatDecimal_default(x) {
  return Math.abs(x = Math.round(x)) >= 1000000000000000000000 ? x.toLocaleString("en").replace(/,/g, "") : x.toString(10);
}
function formatDecimalParts(x, p) {
  if (!isFinite(x) || x === 0)
    return null;
  var i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e"), coefficient = x.slice(0, i);
  return [
    coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
    +x.slice(i + 1)
  ];
}

// node_modules/d3-format/src/exponent.js
function exponent_default(x) {
  return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
}

// node_modules/d3-format/src/formatGroup.js
function formatGroup_default(grouping, thousands) {
  return function(value, width) {
    var i = value.length, t = [], j = 0, g = grouping[0], length = 0;
    while (i > 0 && g > 0) {
      if (length + g + 1 > width)
        g = Math.max(1, width - length);
      t.push(value.substring(i -= g, i + g));
      if ((length += g + 1) > width)
        break;
      g = grouping[j = (j + 1) % grouping.length];
    }
    return t.reverse().join(thousands);
  };
}

// node_modules/d3-format/src/formatNumerals.js
function formatNumerals_default(numerals) {
  return function(value) {
    return value.replace(/[0-9]/g, function(i) {
      return numerals[+i];
    });
  };
}

// node_modules/d3-format/src/formatSpecifier.js
var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
function formatSpecifier(specifier) {
  if (!(match = re.exec(specifier)))
    throw new Error("invalid format: " + specifier);
  var match;
  return new FormatSpecifier({
    fill: match[1],
    align: match[2],
    sign: match[3],
    symbol: match[4],
    zero: match[5],
    width: match[6],
    comma: match[7],
    precision: match[8] && match[8].slice(1),
    trim: match[9],
    type: match[10]
  });
}
formatSpecifier.prototype = FormatSpecifier.prototype;
function FormatSpecifier(specifier) {
  this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
  this.align = specifier.align === undefined ? ">" : specifier.align + "";
  this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
  this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
  this.zero = !!specifier.zero;
  this.width = specifier.width === undefined ? undefined : +specifier.width;
  this.comma = !!specifier.comma;
  this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
  this.trim = !!specifier.trim;
  this.type = specifier.type === undefined ? "" : specifier.type + "";
}
FormatSpecifier.prototype.toString = function() {
  return this.fill + this.align + this.sign + this.symbol + (this.zero ? "0" : "") + (this.width === undefined ? "" : Math.max(1, this.width | 0)) + (this.comma ? "," : "") + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0)) + (this.trim ? "~" : "") + this.type;
};

// node_modules/d3-format/src/formatTrim.js
function formatTrim_default(s) {
  out:
    for (var n = s.length, i = 1, i0 = -1, i1;i < n; ++i) {
      switch (s[i]) {
        case ".":
          i0 = i1 = i;
          break;
        case "0":
          if (i0 === 0)
            i0 = i;
          i1 = i;
          break;
        default:
          if (!+s[i])
            break out;
          if (i0 > 0)
            i0 = 0;
          break;
      }
    }
  return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
}

// node_modules/d3-format/src/formatPrefixAuto.js
var prefixExponent;
function formatPrefixAuto_default(x, p) {
  var d = formatDecimalParts(x, p);
  if (!d)
    return prefixExponent = undefined, x.toPrecision(p);
  var coefficient = d[0], exponent = d[1], i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1, n = coefficient.length;
  return i === n ? coefficient : i > n ? coefficient + new Array(i - n + 1).join("0") : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i) : "0." + new Array(1 - i).join("0") + formatDecimalParts(x, Math.max(0, p + i - 1))[0];
}

// node_modules/d3-format/src/formatRounded.js
function formatRounded_default(x, p) {
  var d = formatDecimalParts(x, p);
  if (!d)
    return x + "";
  var coefficient = d[0], exponent = d[1];
  return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1) : coefficient + new Array(exponent - coefficient.length + 2).join("0");
}

// node_modules/d3-format/src/formatTypes.js
var formatTypes_default = {
  "%": (x, p) => (x * 100).toFixed(p),
  b: (x) => Math.round(x).toString(2),
  c: (x) => x + "",
  d: formatDecimal_default,
  e: (x, p) => x.toExponential(p),
  f: (x, p) => x.toFixed(p),
  g: (x, p) => x.toPrecision(p),
  o: (x) => Math.round(x).toString(8),
  p: (x, p) => formatRounded_default(x * 100, p),
  r: formatRounded_default,
  s: formatPrefixAuto_default,
  X: (x) => Math.round(x).toString(16).toUpperCase(),
  x: (x) => Math.round(x).toString(16)
};

// node_modules/d3-format/src/identity.js
function identity_default2(x) {
  return x;
}

// node_modules/d3-format/src/locale.js
var map = Array.prototype.map;
var prefixes = ["y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y"];
function locale_default(locale) {
  var group = locale.grouping === undefined || locale.thousands === undefined ? identity_default2 : formatGroup_default(map.call(locale.grouping, Number), locale.thousands + ""), currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "", currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "", decimal = locale.decimal === undefined ? "." : locale.decimal + "", numerals = locale.numerals === undefined ? identity_default2 : formatNumerals_default(map.call(locale.numerals, String)), percent = locale.percent === undefined ? "%" : locale.percent + "", minus = locale.minus === undefined ? "−" : locale.minus + "", nan = locale.nan === undefined ? "NaN" : locale.nan + "";
  function newFormat(specifier, options) {
    specifier = formatSpecifier(specifier);
    var { fill, align, sign, symbol, zero: zero3, width, comma, precision, trim, type } = specifier;
    if (type === "n")
      comma = true, type = "g";
    else if (!formatTypes_default[type])
      precision === undefined && (precision = 12), trim = true, type = "g";
    if (zero3 || fill === "0" && align === "=")
      zero3 = true, fill = "0", align = "=";
    var prefix = (options && options.prefix !== undefined ? options.prefix : "") + (symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : ""), suffix = (symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "") + (options && options.suffix !== undefined ? options.suffix : "");
    var formatType = formatTypes_default[type], maybeSuffix = /[defgprs%]/.test(type);
    precision = precision === undefined ? 6 : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision)) : Math.max(0, Math.min(20, precision));
    function format2(value) {
      var valuePrefix = prefix, valueSuffix = suffix, i, n, c;
      if (type === "c") {
        valueSuffix = formatType(value) + valueSuffix;
        value = "";
      } else {
        value = +value;
        var valueNegative = value < 0 || 1 / value < 0;
        value = isNaN(value) ? nan : formatType(Math.abs(value), precision);
        if (trim)
          value = formatTrim_default(value);
        if (valueNegative && +value === 0 && sign !== "+")
          valueNegative = false;
        valuePrefix = (valueNegative ? sign === "(" ? sign : minus : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
        valueSuffix = (type === "s" && !isNaN(value) && prefixExponent !== undefined ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");
        if (maybeSuffix) {
          i = -1, n = value.length;
          while (++i < n) {
            if (c = value.charCodeAt(i), 48 > c || c > 57) {
              valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
              value = value.slice(0, i);
              break;
            }
          }
        }
      }
      if (comma && !zero3)
        value = group(value, Infinity);
      var length = valuePrefix.length + value.length + valueSuffix.length, padding = length < width ? new Array(width - length + 1).join(fill) : "";
      if (comma && zero3)
        value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";
      switch (align) {
        case "<":
          value = valuePrefix + value + valueSuffix + padding;
          break;
        case "=":
          value = valuePrefix + padding + value + valueSuffix;
          break;
        case "^":
          value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length);
          break;
        default:
          value = padding + valuePrefix + value + valueSuffix;
          break;
      }
      return numerals(value);
    }
    format2.toString = function() {
      return specifier + "";
    };
    return format2;
  }
  function formatPrefix(specifier, value) {
    var e = Math.max(-8, Math.min(8, Math.floor(exponent_default(value) / 3))) * 3, k = Math.pow(10, -e), f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier), { suffix: prefixes[8 + e / 3] });
    return function(value2) {
      return f(k * value2);
    };
  }
  return {
    format: newFormat,
    formatPrefix
  };
}

// node_modules/d3-format/src/defaultLocale.js
var locale;
var format2;
var formatPrefix;
defaultLocale({
  thousands: ",",
  grouping: [3],
  currency: ["$", ""]
});
function defaultLocale(definition) {
  locale = locale_default(definition);
  format2 = locale.format;
  formatPrefix = locale.formatPrefix;
  return locale;
}
// node_modules/d3-format/src/precisionFixed.js
function precisionFixed_default(step) {
  return Math.max(0, -exponent_default(Math.abs(step)));
}
// node_modules/d3-format/src/precisionPrefix.js
function precisionPrefix_default(step, value) {
  return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent_default(value) / 3))) * 3 - exponent_default(Math.abs(step)));
}
// node_modules/d3-format/src/precisionRound.js
function precisionRound_default(step, max2) {
  step = Math.abs(step), max2 = Math.abs(max2) - step;
  return Math.max(0, exponent_default(max2) - exponent_default(step)) + 1;
}
// node_modules/d3-hierarchy/src/hierarchy/count.js
function count(node) {
  var sum = 0, children2 = node.children, i = children2 && children2.length;
  if (!i)
    sum = 1;
  else
    while (--i >= 0)
      sum += children2[i].value;
  node.value = sum;
}
function count_default() {
  return this.eachAfter(count);
}

// node_modules/d3-hierarchy/src/hierarchy/each.js
function each_default2(callback, that) {
  let index = -1;
  for (const node of this) {
    callback.call(that, node, ++index, this);
  }
  return this;
}

// node_modules/d3-hierarchy/src/hierarchy/eachBefore.js
function eachBefore_default(callback, that) {
  var node = this, nodes = [node], children2, i, index = -1;
  while (node = nodes.pop()) {
    callback.call(that, node, ++index, this);
    if (children2 = node.children) {
      for (i = children2.length - 1;i >= 0; --i) {
        nodes.push(children2[i]);
      }
    }
  }
  return this;
}

// node_modules/d3-hierarchy/src/hierarchy/eachAfter.js
function eachAfter_default(callback, that) {
  var node = this, nodes = [node], next = [], children2, i, n, index = -1;
  while (node = nodes.pop()) {
    next.push(node);
    if (children2 = node.children) {
      for (i = 0, n = children2.length;i < n; ++i) {
        nodes.push(children2[i]);
      }
    }
  }
  while (node = next.pop()) {
    callback.call(that, node, ++index, this);
  }
  return this;
}

// node_modules/d3-hierarchy/src/hierarchy/find.js
function find_default(callback, that) {
  let index = -1;
  for (const node of this) {
    if (callback.call(that, node, ++index, this)) {
      return node;
    }
  }
}

// node_modules/d3-hierarchy/src/hierarchy/sum.js
function sum_default(value) {
  return this.eachAfter(function(node) {
    var sum = +value(node.data) || 0, children2 = node.children, i = children2 && children2.length;
    while (--i >= 0)
      sum += children2[i].value;
    node.value = sum;
  });
}

// node_modules/d3-hierarchy/src/hierarchy/sort.js
function sort_default2(compare) {
  return this.eachBefore(function(node) {
    if (node.children) {
      node.children.sort(compare);
    }
  });
}

// node_modules/d3-hierarchy/src/hierarchy/path.js
function path_default(end) {
  var start = this, ancestor = leastCommonAncestor(start, end), nodes = [start];
  while (start !== ancestor) {
    start = start.parent;
    nodes.push(start);
  }
  var k = nodes.length;
  while (end !== ancestor) {
    nodes.splice(k, 0, end);
    end = end.parent;
  }
  return nodes;
}
function leastCommonAncestor(a, b) {
  if (a === b)
    return a;
  var aNodes = a.ancestors(), bNodes = b.ancestors(), c = null;
  a = aNodes.pop();
  b = bNodes.pop();
  while (a === b) {
    c = a;
    a = aNodes.pop();
    b = bNodes.pop();
  }
  return c;
}

// node_modules/d3-hierarchy/src/hierarchy/ancestors.js
function ancestors_default() {
  var node = this, nodes = [node];
  while (node = node.parent) {
    nodes.push(node);
  }
  return nodes;
}

// node_modules/d3-hierarchy/src/hierarchy/descendants.js
function descendants_default() {
  return Array.from(this);
}

// node_modules/d3-hierarchy/src/hierarchy/leaves.js
function leaves_default() {
  var leaves = [];
  this.eachBefore(function(node) {
    if (!node.children) {
      leaves.push(node);
    }
  });
  return leaves;
}

// node_modules/d3-hierarchy/src/hierarchy/links.js
function links_default() {
  var root2 = this, links = [];
  root2.each(function(node) {
    if (node !== root2) {
      links.push({ source: node.parent, target: node });
    }
  });
  return links;
}

// node_modules/d3-hierarchy/src/hierarchy/iterator.js
function* iterator_default2() {
  var node = this, current, next = [node], children2, i, n;
  do {
    current = next.reverse(), next = [];
    while (node = current.pop()) {
      yield node;
      if (children2 = node.children) {
        for (i = 0, n = children2.length;i < n; ++i) {
          next.push(children2[i]);
        }
      }
    }
  } while (next.length);
}

// node_modules/d3-hierarchy/src/hierarchy/index.js
function hierarchy(data, children2) {
  if (data instanceof Map) {
    data = [undefined, data];
    if (children2 === undefined)
      children2 = mapChildren;
  } else if (children2 === undefined) {
    children2 = objectChildren;
  }
  var root2 = new Node(data), node, nodes = [root2], child, childs, i, n;
  while (node = nodes.pop()) {
    if ((childs = children2(node.data)) && (n = (childs = Array.from(childs)).length)) {
      node.children = childs;
      for (i = n - 1;i >= 0; --i) {
        nodes.push(child = childs[i] = new Node(childs[i]));
        child.parent = node;
        child.depth = node.depth + 1;
      }
    }
  }
  return root2.eachBefore(computeHeight);
}
function node_copy() {
  return hierarchy(this).eachBefore(copyData);
}
function objectChildren(d) {
  return d.children;
}
function mapChildren(d) {
  return Array.isArray(d) ? d[1] : null;
}
function copyData(node) {
  if (node.data.value !== undefined)
    node.value = node.data.value;
  node.data = node.data.data;
}
function computeHeight(node) {
  var height = 0;
  do
    node.height = height;
  while ((node = node.parent) && node.height < ++height);
}
function Node(data) {
  this.data = data;
  this.depth = this.height = 0;
  this.parent = null;
}
Node.prototype = hierarchy.prototype = {
  constructor: Node,
  count: count_default,
  each: each_default2,
  eachAfter: eachAfter_default,
  eachBefore: eachBefore_default,
  find: find_default,
  sum: sum_default,
  sort: sort_default2,
  path: path_default,
  ancestors: ancestors_default,
  descendants: descendants_default,
  leaves: leaves_default,
  links: links_default,
  copy: node_copy,
  [Symbol.iterator]: iterator_default2
};

// node_modules/d3-hierarchy/src/treemap/round.js
function round_default2(node) {
  node.x0 = Math.round(node.x0);
  node.y0 = Math.round(node.y0);
  node.x1 = Math.round(node.x1);
  node.y1 = Math.round(node.y1);
}

// node_modules/d3-hierarchy/src/treemap/dice.js
function dice_default(parent, x0, y0, x1, y1) {
  var nodes = parent.children, node, i = -1, n = nodes.length, k = parent.value && (x1 - x0) / parent.value;
  while (++i < n) {
    node = nodes[i], node.y0 = y0, node.y1 = y1;
    node.x0 = x0, node.x1 = x0 += node.value * k;
  }
}

// node_modules/d3-hierarchy/src/treemap/slice.js
function slice_default(parent, x0, y0, x1, y1) {
  var nodes = parent.children, node, i = -1, n = nodes.length, k = parent.value && (y1 - y0) / parent.value;
  while (++i < n) {
    node = nodes[i], node.x0 = x0, node.x1 = x1;
    node.y0 = y0, node.y1 = y0 += node.value * k;
  }
}

// node_modules/d3-hierarchy/src/treemap/squarify.js
var phi = (1 + Math.sqrt(5)) / 2;
function squarifyRatio(ratio, parent, x0, y0, x1, y1) {
  var rows = [], nodes = parent.children, row, nodeValue, i0 = 0, i1 = 0, n = nodes.length, dx, dy, value = parent.value, sumValue, minValue, maxValue, newRatio, minRatio, alpha, beta;
  while (i0 < n) {
    dx = x1 - x0, dy = y1 - y0;
    do
      sumValue = nodes[i1++].value;
    while (!sumValue && i1 < n);
    minValue = maxValue = sumValue;
    alpha = Math.max(dy / dx, dx / dy) / (value * ratio);
    beta = sumValue * sumValue * alpha;
    minRatio = Math.max(maxValue / beta, beta / minValue);
    for (;i1 < n; ++i1) {
      sumValue += nodeValue = nodes[i1].value;
      if (nodeValue < minValue)
        minValue = nodeValue;
      if (nodeValue > maxValue)
        maxValue = nodeValue;
      beta = sumValue * sumValue * alpha;
      newRatio = Math.max(maxValue / beta, beta / minValue);
      if (newRatio > minRatio) {
        sumValue -= nodeValue;
        break;
      }
      minRatio = newRatio;
    }
    rows.push(row = { value: sumValue, dice: dx < dy, children: nodes.slice(i0, i1) });
    if (row.dice)
      dice_default(row, x0, y0, x1, value ? y0 += dy * sumValue / value : y1);
    else
      slice_default(row, x0, y0, value ? x0 += dx * sumValue / value : x1, y1);
    value -= sumValue, i0 = i1;
  }
  return rows;
}
var squarify_default = function custom(ratio) {
  function squarify(parent, x0, y0, x1, y1) {
    squarifyRatio(ratio, parent, x0, y0, x1, y1);
  }
  squarify.ratio = function(x) {
    return custom((x = +x) > 1 ? x : 1);
  };
  return squarify;
}(phi);

// node_modules/d3-hierarchy/src/accessors.js
function required(f) {
  if (typeof f !== "function")
    throw new Error;
  return f;
}

// node_modules/d3-hierarchy/src/constant.js
function constantZero() {
  return 0;
}
function constant_default3(x) {
  return function() {
    return x;
  };
}

// node_modules/d3-hierarchy/src/treemap/index.js
function treemap_default() {
  var tile = squarify_default, round = false, dx = 1, dy = 1, paddingStack = [0], paddingInner = constantZero, paddingTop = constantZero, paddingRight = constantZero, paddingBottom = constantZero, paddingLeft = constantZero;
  function treemap(root2) {
    root2.x0 = root2.y0 = 0;
    root2.x1 = dx;
    root2.y1 = dy;
    root2.eachBefore(positionNode);
    paddingStack = [0];
    if (round)
      root2.eachBefore(round_default2);
    return root2;
  }
  function positionNode(node) {
    var p = paddingStack[node.depth], x0 = node.x0 + p, y0 = node.y0 + p, x1 = node.x1 - p, y1 = node.y1 - p;
    if (x1 < x0)
      x0 = x1 = (x0 + x1) / 2;
    if (y1 < y0)
      y0 = y1 = (y0 + y1) / 2;
    node.x0 = x0;
    node.y0 = y0;
    node.x1 = x1;
    node.y1 = y1;
    if (node.children) {
      p = paddingStack[node.depth + 1] = paddingInner(node) / 2;
      x0 += paddingLeft(node) - p;
      y0 += paddingTop(node) - p;
      x1 -= paddingRight(node) - p;
      y1 -= paddingBottom(node) - p;
      if (x1 < x0)
        x0 = x1 = (x0 + x1) / 2;
      if (y1 < y0)
        y0 = y1 = (y0 + y1) / 2;
      tile(node, x0, y0, x1, y1);
    }
  }
  treemap.round = function(x) {
    return arguments.length ? (round = !!x, treemap) : round;
  };
  treemap.size = function(x) {
    return arguments.length ? (dx = +x[0], dy = +x[1], treemap) : [dx, dy];
  };
  treemap.tile = function(x) {
    return arguments.length ? (tile = required(x), treemap) : tile;
  };
  treemap.padding = function(x) {
    return arguments.length ? treemap.paddingInner(x).paddingOuter(x) : treemap.paddingInner();
  };
  treemap.paddingInner = function(x) {
    return arguments.length ? (paddingInner = typeof x === "function" ? x : constant_default3(+x), treemap) : paddingInner;
  };
  treemap.paddingOuter = function(x) {
    return arguments.length ? treemap.paddingTop(x).paddingRight(x).paddingBottom(x).paddingLeft(x) : treemap.paddingTop();
  };
  treemap.paddingTop = function(x) {
    return arguments.length ? (paddingTop = typeof x === "function" ? x : constant_default3(+x), treemap) : paddingTop;
  };
  treemap.paddingRight = function(x) {
    return arguments.length ? (paddingRight = typeof x === "function" ? x : constant_default3(+x), treemap) : paddingRight;
  };
  treemap.paddingBottom = function(x) {
    return arguments.length ? (paddingBottom = typeof x === "function" ? x : constant_default3(+x), treemap) : paddingBottom;
  };
  treemap.paddingLeft = function(x) {
    return arguments.length ? (paddingLeft = typeof x === "function" ? x : constant_default3(+x), treemap) : paddingLeft;
  };
  return treemap;
}
// node_modules/d3-scale/src/init.js
function initRange(domain, range2) {
  switch (arguments.length) {
    case 0:
      break;
    case 1:
      this.range(domain);
      break;
    default:
      this.range(range2).domain(domain);
      break;
  }
  return this;
}

// node_modules/d3-scale/src/ordinal.js
var implicit = Symbol("implicit");
function ordinal() {
  var index = new InternMap, domain = [], range2 = [], unknown = implicit;
  function scale(d) {
    let i = index.get(d);
    if (i === undefined) {
      if (unknown !== implicit)
        return unknown;
      index.set(d, i = domain.push(d) - 1);
    }
    return range2[i % range2.length];
  }
  scale.domain = function(_) {
    if (!arguments.length)
      return domain.slice();
    domain = [], index = new InternMap;
    for (const value of _) {
      if (index.has(value))
        continue;
      index.set(value, domain.push(value) - 1);
    }
    return scale;
  };
  scale.range = function(_) {
    return arguments.length ? (range2 = Array.from(_), scale) : range2.slice();
  };
  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };
  scale.copy = function() {
    return ordinal(domain, range2).unknown(unknown);
  };
  initRange.apply(scale, arguments);
  return scale;
}

// node_modules/d3-scale/src/band.js
function band() {
  var scale = ordinal().unknown(undefined), domain = scale.domain, ordinalRange = scale.range, r0 = 0, r1 = 1, step, bandwidth, round = false, paddingInner = 0, paddingOuter = 0, align = 0.5;
  delete scale.unknown;
  function rescale() {
    var n = domain().length, reverse = r1 < r0, start = reverse ? r1 : r0, stop = reverse ? r0 : r1;
    step = (stop - start) / Math.max(1, n - paddingInner + paddingOuter * 2);
    if (round)
      step = Math.floor(step);
    start += (stop - start - step * (n - paddingInner)) * align;
    bandwidth = step * (1 - paddingInner);
    if (round)
      start = Math.round(start), bandwidth = Math.round(bandwidth);
    var values = range(n).map(function(i) {
      return start + step * i;
    });
    return ordinalRange(reverse ? values.reverse() : values);
  }
  scale.domain = function(_) {
    return arguments.length ? (domain(_), rescale()) : domain();
  };
  scale.range = function(_) {
    return arguments.length ? ([r0, r1] = _, r0 = +r0, r1 = +r1, rescale()) : [r0, r1];
  };
  scale.rangeRound = function(_) {
    return [r0, r1] = _, r0 = +r0, r1 = +r1, round = true, rescale();
  };
  scale.bandwidth = function() {
    return bandwidth;
  };
  scale.step = function() {
    return step;
  };
  scale.round = function(_) {
    return arguments.length ? (round = !!_, rescale()) : round;
  };
  scale.padding = function(_) {
    return arguments.length ? (paddingInner = Math.min(1, paddingOuter = +_), rescale()) : paddingInner;
  };
  scale.paddingInner = function(_) {
    return arguments.length ? (paddingInner = Math.min(1, _), rescale()) : paddingInner;
  };
  scale.paddingOuter = function(_) {
    return arguments.length ? (paddingOuter = +_, rescale()) : paddingOuter;
  };
  scale.align = function(_) {
    return arguments.length ? (align = Math.max(0, Math.min(1, _)), rescale()) : align;
  };
  scale.copy = function() {
    return band(domain(), [r0, r1]).round(round).paddingInner(paddingInner).paddingOuter(paddingOuter).align(align);
  };
  return initRange.apply(rescale(), arguments);
}

// node_modules/d3-scale/src/constant.js
function constants(x) {
  return function() {
    return x;
  };
}

// node_modules/d3-scale/src/number.js
function number3(x) {
  return +x;
}

// node_modules/d3-scale/src/continuous.js
var unit = [0, 1];
function identity2(x) {
  return x;
}
function normalize(a, b) {
  return (b -= a = +a) ? function(x) {
    return (x - a) / b;
  } : constants(isNaN(b) ? NaN : 0.5);
}
function clamper(a, b) {
  var t;
  if (a > b)
    t = a, a = b, b = t;
  return function(x) {
    return Math.max(a, Math.min(b, x));
  };
}
function bimap(domain, range2, interpolate) {
  var d0 = domain[0], d1 = domain[1], r0 = range2[0], r1 = range2[1];
  if (d1 < d0)
    d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
  else
    d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
  return function(x) {
    return r0(d0(x));
  };
}
function polymap(domain, range2, interpolate) {
  var j = Math.min(domain.length, range2.length) - 1, d = new Array(j), r = new Array(j), i = -1;
  if (domain[j] < domain[0]) {
    domain = domain.slice().reverse();
    range2 = range2.slice().reverse();
  }
  while (++i < j) {
    d[i] = normalize(domain[i], domain[i + 1]);
    r[i] = interpolate(range2[i], range2[i + 1]);
  }
  return function(x) {
    var i2 = bisect_default(domain, x, 1, j) - 1;
    return r[i2](d[i2](x));
  };
}
function copy(source, target) {
  return target.domain(source.domain()).range(source.range()).interpolate(source.interpolate()).clamp(source.clamp()).unknown(source.unknown());
}
function transformer() {
  var domain = unit, range2 = unit, interpolate = value_default, transform, untransform, unknown, clamp = identity2, piecewise, output, input;
  function rescale() {
    var n = Math.min(domain.length, range2.length);
    if (clamp !== identity2)
      clamp = clamper(domain[0], domain[n - 1]);
    piecewise = n > 2 ? polymap : bimap;
    output = input = null;
    return scale;
  }
  function scale(x) {
    return x == null || isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range2, interpolate)))(transform(clamp(x)));
  }
  scale.invert = function(y) {
    return clamp(untransform((input || (input = piecewise(range2, domain.map(transform), number_default)))(y)));
  };
  scale.domain = function(_) {
    return arguments.length ? (domain = Array.from(_, number3), rescale()) : domain.slice();
  };
  scale.range = function(_) {
    return arguments.length ? (range2 = Array.from(_), rescale()) : range2.slice();
  };
  scale.rangeRound = function(_) {
    return range2 = Array.from(_), interpolate = round_default, rescale();
  };
  scale.clamp = function(_) {
    return arguments.length ? (clamp = _ ? true : identity2, rescale()) : clamp !== identity2;
  };
  scale.interpolate = function(_) {
    return arguments.length ? (interpolate = _, rescale()) : interpolate;
  };
  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };
  return function(t, u) {
    transform = t, untransform = u;
    return rescale();
  };
}
function continuous() {
  return transformer()(identity2, identity2);
}

// node_modules/d3-scale/src/tickFormat.js
function tickFormat(start, stop, count2, specifier) {
  var step = tickStep(start, stop, count2), precision;
  specifier = formatSpecifier(specifier == null ? ",f" : specifier);
  switch (specifier.type) {
    case "s": {
      var value = Math.max(Math.abs(start), Math.abs(stop));
      if (specifier.precision == null && !isNaN(precision = precisionPrefix_default(step, value)))
        specifier.precision = precision;
      return formatPrefix(specifier, value);
    }
    case "":
    case "e":
    case "g":
    case "p":
    case "r": {
      if (specifier.precision == null && !isNaN(precision = precisionRound_default(step, Math.max(Math.abs(start), Math.abs(stop)))))
        specifier.precision = precision - (specifier.type === "e");
      break;
    }
    case "f":
    case "%": {
      if (specifier.precision == null && !isNaN(precision = precisionFixed_default(step)))
        specifier.precision = precision - (specifier.type === "%") * 2;
      break;
    }
  }
  return format2(specifier);
}

// node_modules/d3-scale/src/linear.js
function linearish(scale) {
  var domain = scale.domain;
  scale.ticks = function(count2) {
    var d = domain();
    return ticks(d[0], d[d.length - 1], count2 == null ? 10 : count2);
  };
  scale.tickFormat = function(count2, specifier) {
    var d = domain();
    return tickFormat(d[0], d[d.length - 1], count2 == null ? 10 : count2, specifier);
  };
  scale.nice = function(count2) {
    if (count2 == null)
      count2 = 10;
    var d = domain();
    var i0 = 0;
    var i1 = d.length - 1;
    var start = d[i0];
    var stop = d[i1];
    var prestep;
    var step;
    var maxIter = 10;
    if (stop < start) {
      step = start, start = stop, stop = step;
      step = i0, i0 = i1, i1 = step;
    }
    while (maxIter-- > 0) {
      step = tickIncrement(start, stop, count2);
      if (step === prestep) {
        d[i0] = start;
        d[i1] = stop;
        return domain(d);
      } else if (step > 0) {
        start = Math.floor(start / step) * step;
        stop = Math.ceil(stop / step) * step;
      } else if (step < 0) {
        start = Math.ceil(start * step) / step;
        stop = Math.floor(stop * step) / step;
      } else {
        break;
      }
      prestep = step;
    }
    return scale;
  };
  return scale;
}
function linear2() {
  var scale = continuous();
  scale.copy = function() {
    return copy(scale, linear2());
  };
  initRange.apply(scale, arguments);
  return linearish(scale);
}

// node_modules/d3-time/src/interval.js
var t02 = new Date;
var t12 = new Date;
function timeInterval(floori, offseti, count2, field) {
  function interval(date) {
    return floori(date = arguments.length === 0 ? new Date : new Date(+date)), date;
  }
  interval.floor = (date) => {
    return floori(date = new Date(+date)), date;
  };
  interval.ceil = (date) => {
    return floori(date = new Date(date - 1)), offseti(date, 1), floori(date), date;
  };
  interval.round = (date) => {
    const d0 = interval(date), d1 = interval.ceil(date);
    return date - d0 < d1 - date ? d0 : d1;
  };
  interval.offset = (date, step) => {
    return offseti(date = new Date(+date), step == null ? 1 : Math.floor(step)), date;
  };
  interval.range = (start, stop, step) => {
    const range2 = [];
    start = interval.ceil(start);
    step = step == null ? 1 : Math.floor(step);
    if (!(start < stop) || !(step > 0))
      return range2;
    let previous;
    do
      range2.push(previous = new Date(+start)), offseti(start, step), floori(start);
    while (previous < start && start < stop);
    return range2;
  };
  interval.filter = (test) => {
    return timeInterval((date) => {
      if (date >= date)
        while (floori(date), !test(date))
          date.setTime(date - 1);
    }, (date, step) => {
      if (date >= date) {
        if (step < 0)
          while (++step <= 0) {
            while (offseti(date, -1), !test(date)) {}
          }
        else
          while (--step >= 0) {
            while (offseti(date, 1), !test(date)) {}
          }
      }
    });
  };
  if (count2) {
    interval.count = (start, end) => {
      t02.setTime(+start), t12.setTime(+end);
      floori(t02), floori(t12);
      return Math.floor(count2(t02, t12));
    };
    interval.every = (step) => {
      step = Math.floor(step);
      return !isFinite(step) || !(step > 0) ? null : !(step > 1) ? interval : interval.filter(field ? (d) => field(d) % step === 0 : (d) => interval.count(0, d) % step === 0);
    };
  }
  return interval;
}

// node_modules/d3-time/src/millisecond.js
var millisecond = timeInterval(() => {}, (date, step) => {
  date.setTime(+date + step);
}, (start, end) => {
  return end - start;
});
millisecond.every = (k) => {
  k = Math.floor(k);
  if (!isFinite(k) || !(k > 0))
    return null;
  if (!(k > 1))
    return millisecond;
  return timeInterval((date) => {
    date.setTime(Math.floor(date / k) * k);
  }, (date, step) => {
    date.setTime(+date + step * k);
  }, (start, end) => {
    return (end - start) / k;
  });
};
var milliseconds = millisecond.range;

// node_modules/d3-time/src/duration.js
var durationSecond = 1000;
var durationMinute = durationSecond * 60;
var durationHour = durationMinute * 60;
var durationDay = durationHour * 24;
var durationWeek = durationDay * 7;
var durationMonth = durationDay * 30;
var durationYear = durationDay * 365;

// node_modules/d3-time/src/second.js
var second = timeInterval((date) => {
  date.setTime(date - date.getMilliseconds());
}, (date, step) => {
  date.setTime(+date + step * durationSecond);
}, (start, end) => {
  return (end - start) / durationSecond;
}, (date) => {
  return date.getUTCSeconds();
});
var seconds = second.range;

// node_modules/d3-time/src/minute.js
var timeMinute = timeInterval((date) => {
  date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond);
}, (date, step) => {
  date.setTime(+date + step * durationMinute);
}, (start, end) => {
  return (end - start) / durationMinute;
}, (date) => {
  return date.getMinutes();
});
var timeMinutes = timeMinute.range;
var utcMinute = timeInterval((date) => {
  date.setUTCSeconds(0, 0);
}, (date, step) => {
  date.setTime(+date + step * durationMinute);
}, (start, end) => {
  return (end - start) / durationMinute;
}, (date) => {
  return date.getUTCMinutes();
});
var utcMinutes = utcMinute.range;

// node_modules/d3-time/src/hour.js
var timeHour = timeInterval((date) => {
  date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond - date.getMinutes() * durationMinute);
}, (date, step) => {
  date.setTime(+date + step * durationHour);
}, (start, end) => {
  return (end - start) / durationHour;
}, (date) => {
  return date.getHours();
});
var timeHours = timeHour.range;
var utcHour = timeInterval((date) => {
  date.setUTCMinutes(0, 0, 0);
}, (date, step) => {
  date.setTime(+date + step * durationHour);
}, (start, end) => {
  return (end - start) / durationHour;
}, (date) => {
  return date.getUTCHours();
});
var utcHours = utcHour.range;

// node_modules/d3-time/src/day.js
var timeDay = timeInterval((date) => date.setHours(0, 0, 0, 0), (date, step) => date.setDate(date.getDate() + step), (start, end) => (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationDay, (date) => date.getDate() - 1);
var timeDays = timeDay.range;
var utcDay = timeInterval((date) => {
  date.setUTCHours(0, 0, 0, 0);
}, (date, step) => {
  date.setUTCDate(date.getUTCDate() + step);
}, (start, end) => {
  return (end - start) / durationDay;
}, (date) => {
  return date.getUTCDate() - 1;
});
var utcDays = utcDay.range;
var unixDay = timeInterval((date) => {
  date.setUTCHours(0, 0, 0, 0);
}, (date, step) => {
  date.setUTCDate(date.getUTCDate() + step);
}, (start, end) => {
  return (end - start) / durationDay;
}, (date) => {
  return Math.floor(date / durationDay);
});
var unixDays = unixDay.range;

// node_modules/d3-time/src/week.js
function timeWeekday(i) {
  return timeInterval((date) => {
    date.setDate(date.getDate() - (date.getDay() + 7 - i) % 7);
    date.setHours(0, 0, 0, 0);
  }, (date, step) => {
    date.setDate(date.getDate() + step * 7);
  }, (start, end) => {
    return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationWeek;
  });
}
var timeSunday = timeWeekday(0);
var timeMonday = timeWeekday(1);
var timeTuesday = timeWeekday(2);
var timeWednesday = timeWeekday(3);
var timeThursday = timeWeekday(4);
var timeFriday = timeWeekday(5);
var timeSaturday = timeWeekday(6);
var timeSundays = timeSunday.range;
var timeMondays = timeMonday.range;
var timeTuesdays = timeTuesday.range;
var timeWednesdays = timeWednesday.range;
var timeThursdays = timeThursday.range;
var timeFridays = timeFriday.range;
var timeSaturdays = timeSaturday.range;
function utcWeekday(i) {
  return timeInterval((date) => {
    date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i) % 7);
    date.setUTCHours(0, 0, 0, 0);
  }, (date, step) => {
    date.setUTCDate(date.getUTCDate() + step * 7);
  }, (start, end) => {
    return (end - start) / durationWeek;
  });
}
var utcSunday = utcWeekday(0);
var utcMonday = utcWeekday(1);
var utcTuesday = utcWeekday(2);
var utcWednesday = utcWeekday(3);
var utcThursday = utcWeekday(4);
var utcFriday = utcWeekday(5);
var utcSaturday = utcWeekday(6);
var utcSundays = utcSunday.range;
var utcMondays = utcMonday.range;
var utcTuesdays = utcTuesday.range;
var utcWednesdays = utcWednesday.range;
var utcThursdays = utcThursday.range;
var utcFridays = utcFriday.range;
var utcSaturdays = utcSaturday.range;

// node_modules/d3-time/src/month.js
var timeMonth = timeInterval((date) => {
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
}, (date, step) => {
  date.setMonth(date.getMonth() + step);
}, (start, end) => {
  return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
}, (date) => {
  return date.getMonth();
});
var timeMonths = timeMonth.range;
var utcMonth = timeInterval((date) => {
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);
}, (date, step) => {
  date.setUTCMonth(date.getUTCMonth() + step);
}, (start, end) => {
  return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
}, (date) => {
  return date.getUTCMonth();
});
var utcMonths = utcMonth.range;
// node_modules/d3-time/src/year.js
var timeYear = timeInterval((date) => {
  date.setMonth(0, 1);
  date.setHours(0, 0, 0, 0);
}, (date, step) => {
  date.setFullYear(date.getFullYear() + step);
}, (start, end) => {
  return end.getFullYear() - start.getFullYear();
}, (date) => {
  return date.getFullYear();
});
timeYear.every = (k) => {
  return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : timeInterval((date) => {
    date.setFullYear(Math.floor(date.getFullYear() / k) * k);
    date.setMonth(0, 1);
    date.setHours(0, 0, 0, 0);
  }, (date, step) => {
    date.setFullYear(date.getFullYear() + step * k);
  });
};
var timeYears = timeYear.range;
var utcYear = timeInterval((date) => {
  date.setUTCMonth(0, 1);
  date.setUTCHours(0, 0, 0, 0);
}, (date, step) => {
  date.setUTCFullYear(date.getUTCFullYear() + step);
}, (start, end) => {
  return end.getUTCFullYear() - start.getUTCFullYear();
}, (date) => {
  return date.getUTCFullYear();
});
utcYear.every = (k) => {
  return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : timeInterval((date) => {
    date.setUTCFullYear(Math.floor(date.getUTCFullYear() / k) * k);
    date.setUTCMonth(0, 1);
    date.setUTCHours(0, 0, 0, 0);
  }, (date, step) => {
    date.setUTCFullYear(date.getUTCFullYear() + step * k);
  });
};
var utcYears = utcYear.range;
// node_modules/d3-time/src/ticks.js
function ticker(year, month, week, day, hour, minute) {
  const tickIntervals = [
    [second, 1, durationSecond],
    [second, 5, 5 * durationSecond],
    [second, 15, 15 * durationSecond],
    [second, 30, 30 * durationSecond],
    [minute, 1, durationMinute],
    [minute, 5, 5 * durationMinute],
    [minute, 15, 15 * durationMinute],
    [minute, 30, 30 * durationMinute],
    [hour, 1, durationHour],
    [hour, 3, 3 * durationHour],
    [hour, 6, 6 * durationHour],
    [hour, 12, 12 * durationHour],
    [day, 1, durationDay],
    [day, 2, 2 * durationDay],
    [week, 1, durationWeek],
    [month, 1, durationMonth],
    [month, 3, 3 * durationMonth],
    [year, 1, durationYear]
  ];
  function ticks2(start, stop, count2) {
    const reverse = stop < start;
    if (reverse)
      [start, stop] = [stop, start];
    const interval = count2 && typeof count2.range === "function" ? count2 : tickInterval(start, stop, count2);
    const ticks3 = interval ? interval.range(start, +stop + 1) : [];
    return reverse ? ticks3.reverse() : ticks3;
  }
  function tickInterval(start, stop, count2) {
    const target = Math.abs(stop - start) / count2;
    const i = bisector(([, , step2]) => step2).right(tickIntervals, target);
    if (i === tickIntervals.length)
      return year.every(tickStep(start / durationYear, stop / durationYear, count2));
    if (i === 0)
      return millisecond.every(Math.max(tickStep(start, stop, count2), 1));
    const [t, step] = tickIntervals[target / tickIntervals[i - 1][2] < tickIntervals[i][2] / target ? i - 1 : i];
    return t.every(step);
  }
  return [ticks2, tickInterval];
}
var [utcTicks, utcTickInterval] = ticker(utcYear, utcMonth, utcSunday, unixDay, utcHour, utcMinute);
var [timeTicks, timeTickInterval] = ticker(timeYear, timeMonth, timeSunday, timeDay, timeHour, timeMinute);
// node_modules/d3-time-format/src/locale.js
function localDate(d) {
  if (0 <= d.y && d.y < 100) {
    var date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
    date.setFullYear(d.y);
    return date;
  }
  return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
}
function utcDate(d) {
  if (0 <= d.y && d.y < 100) {
    var date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
    date.setUTCFullYear(d.y);
    return date;
  }
  return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
}
function newDate(y, m, d) {
  return { y, m, d, H: 0, M: 0, S: 0, L: 0 };
}
function formatLocale(locale2) {
  var { dateTime: locale_dateTime, date: locale_date, time: locale_time, periods: locale_periods, days: locale_weekdays, shortDays: locale_shortWeekdays, months: locale_months, shortMonths: locale_shortMonths } = locale2;
  var periodRe = formatRe(locale_periods), periodLookup = formatLookup(locale_periods), weekdayRe = formatRe(locale_weekdays), weekdayLookup = formatLookup(locale_weekdays), shortWeekdayRe = formatRe(locale_shortWeekdays), shortWeekdayLookup = formatLookup(locale_shortWeekdays), monthRe = formatRe(locale_months), monthLookup = formatLookup(locale_months), shortMonthRe = formatRe(locale_shortMonths), shortMonthLookup = formatLookup(locale_shortMonths);
  var formats = {
    a: formatShortWeekday,
    A: formatWeekday,
    b: formatShortMonth,
    B: formatMonth,
    c: null,
    d: formatDayOfMonth,
    e: formatDayOfMonth,
    f: formatMicroseconds,
    g: formatYearISO,
    G: formatFullYearISO,
    H: formatHour24,
    I: formatHour12,
    j: formatDayOfYear,
    L: formatMilliseconds,
    m: formatMonthNumber,
    M: formatMinutes,
    p: formatPeriod,
    q: formatQuarter,
    Q: formatUnixTimestamp,
    s: formatUnixTimestampSeconds,
    S: formatSeconds,
    u: formatWeekdayNumberMonday,
    U: formatWeekNumberSunday,
    V: formatWeekNumberISO,
    w: formatWeekdayNumberSunday,
    W: formatWeekNumberMonday,
    x: null,
    X: null,
    y: formatYear,
    Y: formatFullYear,
    Z: formatZone,
    "%": formatLiteralPercent
  };
  var utcFormats = {
    a: formatUTCShortWeekday,
    A: formatUTCWeekday,
    b: formatUTCShortMonth,
    B: formatUTCMonth,
    c: null,
    d: formatUTCDayOfMonth,
    e: formatUTCDayOfMonth,
    f: formatUTCMicroseconds,
    g: formatUTCYearISO,
    G: formatUTCFullYearISO,
    H: formatUTCHour24,
    I: formatUTCHour12,
    j: formatUTCDayOfYear,
    L: formatUTCMilliseconds,
    m: formatUTCMonthNumber,
    M: formatUTCMinutes,
    p: formatUTCPeriod,
    q: formatUTCQuarter,
    Q: formatUnixTimestamp,
    s: formatUnixTimestampSeconds,
    S: formatUTCSeconds,
    u: formatUTCWeekdayNumberMonday,
    U: formatUTCWeekNumberSunday,
    V: formatUTCWeekNumberISO,
    w: formatUTCWeekdayNumberSunday,
    W: formatUTCWeekNumberMonday,
    x: null,
    X: null,
    y: formatUTCYear,
    Y: formatUTCFullYear,
    Z: formatUTCZone,
    "%": formatLiteralPercent
  };
  var parses = {
    a: parseShortWeekday,
    A: parseWeekday,
    b: parseShortMonth,
    B: parseMonth,
    c: parseLocaleDateTime,
    d: parseDayOfMonth,
    e: parseDayOfMonth,
    f: parseMicroseconds,
    g: parseYear,
    G: parseFullYear,
    H: parseHour24,
    I: parseHour24,
    j: parseDayOfYear,
    L: parseMilliseconds,
    m: parseMonthNumber,
    M: parseMinutes,
    p: parsePeriod,
    q: parseQuarter,
    Q: parseUnixTimestamp,
    s: parseUnixTimestampSeconds,
    S: parseSeconds,
    u: parseWeekdayNumberMonday,
    U: parseWeekNumberSunday,
    V: parseWeekNumberISO,
    w: parseWeekdayNumberSunday,
    W: parseWeekNumberMonday,
    x: parseLocaleDate,
    X: parseLocaleTime,
    y: parseYear,
    Y: parseFullYear,
    Z: parseZone,
    "%": parseLiteralPercent
  };
  formats.x = newFormat(locale_date, formats);
  formats.X = newFormat(locale_time, formats);
  formats.c = newFormat(locale_dateTime, formats);
  utcFormats.x = newFormat(locale_date, utcFormats);
  utcFormats.X = newFormat(locale_time, utcFormats);
  utcFormats.c = newFormat(locale_dateTime, utcFormats);
  function newFormat(specifier, formats2) {
    return function(date) {
      var string = [], i = -1, j = 0, n = specifier.length, c, pad, format3;
      if (!(date instanceof Date))
        date = new Date(+date);
      while (++i < n) {
        if (specifier.charCodeAt(i) === 37) {
          string.push(specifier.slice(j, i));
          if ((pad = pads[c = specifier.charAt(++i)]) != null)
            c = specifier.charAt(++i);
          else
            pad = c === "e" ? " " : "0";
          if (format3 = formats2[c])
            c = format3(date, pad);
          string.push(c);
          j = i + 1;
        }
      }
      string.push(specifier.slice(j, i));
      return string.join("");
    };
  }
  function newParse(specifier, Z) {
    return function(string) {
      var d = newDate(1900, undefined, 1), i = parseSpecifier(d, specifier, string += "", 0), week, day;
      if (i != string.length)
        return null;
      if ("Q" in d)
        return new Date(d.Q);
      if ("s" in d)
        return new Date(d.s * 1000 + ("L" in d ? d.L : 0));
      if (Z && !("Z" in d))
        d.Z = 0;
      if ("p" in d)
        d.H = d.H % 12 + d.p * 12;
      if (d.m === undefined)
        d.m = "q" in d ? d.q : 0;
      if ("V" in d) {
        if (d.V < 1 || d.V > 53)
          return null;
        if (!("w" in d))
          d.w = 1;
        if ("Z" in d) {
          week = utcDate(newDate(d.y, 0, 1)), day = week.getUTCDay();
          week = day > 4 || day === 0 ? utcMonday.ceil(week) : utcMonday(week);
          week = utcDay.offset(week, (d.V - 1) * 7);
          d.y = week.getUTCFullYear();
          d.m = week.getUTCMonth();
          d.d = week.getUTCDate() + (d.w + 6) % 7;
        } else {
          week = localDate(newDate(d.y, 0, 1)), day = week.getDay();
          week = day > 4 || day === 0 ? timeMonday.ceil(week) : timeMonday(week);
          week = timeDay.offset(week, (d.V - 1) * 7);
          d.y = week.getFullYear();
          d.m = week.getMonth();
          d.d = week.getDate() + (d.w + 6) % 7;
        }
      } else if ("W" in d || "U" in d) {
        if (!("w" in d))
          d.w = "u" in d ? d.u % 7 : ("W" in d) ? 1 : 0;
        day = "Z" in d ? utcDate(newDate(d.y, 0, 1)).getUTCDay() : localDate(newDate(d.y, 0, 1)).getDay();
        d.m = 0;
        d.d = "W" in d ? (d.w + 6) % 7 + d.W * 7 - (day + 5) % 7 : d.w + d.U * 7 - (day + 6) % 7;
      }
      if ("Z" in d) {
        d.H += d.Z / 100 | 0;
        d.M += d.Z % 100;
        return utcDate(d);
      }
      return localDate(d);
    };
  }
  function parseSpecifier(d, specifier, string, j) {
    var i = 0, n = specifier.length, m = string.length, c, parse;
    while (i < n) {
      if (j >= m)
        return -1;
      c = specifier.charCodeAt(i++);
      if (c === 37) {
        c = specifier.charAt(i++);
        parse = parses[c in pads ? specifier.charAt(i++) : c];
        if (!parse || (j = parse(d, string, j)) < 0)
          return -1;
      } else if (c != string.charCodeAt(j++)) {
        return -1;
      }
    }
    return j;
  }
  function parsePeriod(d, string, i) {
    var n = periodRe.exec(string.slice(i));
    return n ? (d.p = periodLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseShortWeekday(d, string, i) {
    var n = shortWeekdayRe.exec(string.slice(i));
    return n ? (d.w = shortWeekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseWeekday(d, string, i) {
    var n = weekdayRe.exec(string.slice(i));
    return n ? (d.w = weekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseShortMonth(d, string, i) {
    var n = shortMonthRe.exec(string.slice(i));
    return n ? (d.m = shortMonthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseMonth(d, string, i) {
    var n = monthRe.exec(string.slice(i));
    return n ? (d.m = monthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseLocaleDateTime(d, string, i) {
    return parseSpecifier(d, locale_dateTime, string, i);
  }
  function parseLocaleDate(d, string, i) {
    return parseSpecifier(d, locale_date, string, i);
  }
  function parseLocaleTime(d, string, i) {
    return parseSpecifier(d, locale_time, string, i);
  }
  function formatShortWeekday(d) {
    return locale_shortWeekdays[d.getDay()];
  }
  function formatWeekday(d) {
    return locale_weekdays[d.getDay()];
  }
  function formatShortMonth(d) {
    return locale_shortMonths[d.getMonth()];
  }
  function formatMonth(d) {
    return locale_months[d.getMonth()];
  }
  function formatPeriod(d) {
    return locale_periods[+(d.getHours() >= 12)];
  }
  function formatQuarter(d) {
    return 1 + ~~(d.getMonth() / 3);
  }
  function formatUTCShortWeekday(d) {
    return locale_shortWeekdays[d.getUTCDay()];
  }
  function formatUTCWeekday(d) {
    return locale_weekdays[d.getUTCDay()];
  }
  function formatUTCShortMonth(d) {
    return locale_shortMonths[d.getUTCMonth()];
  }
  function formatUTCMonth(d) {
    return locale_months[d.getUTCMonth()];
  }
  function formatUTCPeriod(d) {
    return locale_periods[+(d.getUTCHours() >= 12)];
  }
  function formatUTCQuarter(d) {
    return 1 + ~~(d.getUTCMonth() / 3);
  }
  return {
    format: function(specifier) {
      var f = newFormat(specifier += "", formats);
      f.toString = function() {
        return specifier;
      };
      return f;
    },
    parse: function(specifier) {
      var p = newParse(specifier += "", false);
      p.toString = function() {
        return specifier;
      };
      return p;
    },
    utcFormat: function(specifier) {
      var f = newFormat(specifier += "", utcFormats);
      f.toString = function() {
        return specifier;
      };
      return f;
    },
    utcParse: function(specifier) {
      var p = newParse(specifier += "", true);
      p.toString = function() {
        return specifier;
      };
      return p;
    }
  };
}
var pads = { "-": "", _: " ", "0": "0" };
var numberRe = /^\s*\d+/;
var percentRe = /^%/;
var requoteRe = /[\\^$*+?|[\]().{}]/g;
function pad(value, fill, width) {
  var sign = value < 0 ? "-" : "", string = (sign ? -value : value) + "", length = string.length;
  return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
}
function requote(s) {
  return s.replace(requoteRe, "\\$&");
}
function formatRe(names) {
  return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
}
function formatLookup(names) {
  return new Map(names.map((name, i) => [name.toLowerCase(), i]));
}
function parseWeekdayNumberSunday(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 1));
  return n ? (d.w = +n[0], i + n[0].length) : -1;
}
function parseWeekdayNumberMonday(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 1));
  return n ? (d.u = +n[0], i + n[0].length) : -1;
}
function parseWeekNumberSunday(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.U = +n[0], i + n[0].length) : -1;
}
function parseWeekNumberISO(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.V = +n[0], i + n[0].length) : -1;
}
function parseWeekNumberMonday(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.W = +n[0], i + n[0].length) : -1;
}
function parseFullYear(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 4));
  return n ? (d.y = +n[0], i + n[0].length) : -1;
}
function parseYear(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2000), i + n[0].length) : -1;
}
function parseZone(d, string, i) {
  var n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i, i + 6));
  return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
}
function parseQuarter(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 1));
  return n ? (d.q = n[0] * 3 - 3, i + n[0].length) : -1;
}
function parseMonthNumber(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.m = n[0] - 1, i + n[0].length) : -1;
}
function parseDayOfMonth(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.d = +n[0], i + n[0].length) : -1;
}
function parseDayOfYear(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 3));
  return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
}
function parseHour24(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.H = +n[0], i + n[0].length) : -1;
}
function parseMinutes(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.M = +n[0], i + n[0].length) : -1;
}
function parseSeconds(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.S = +n[0], i + n[0].length) : -1;
}
function parseMilliseconds(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 3));
  return n ? (d.L = +n[0], i + n[0].length) : -1;
}
function parseMicroseconds(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 6));
  return n ? (d.L = Math.floor(n[0] / 1000), i + n[0].length) : -1;
}
function parseLiteralPercent(d, string, i) {
  var n = percentRe.exec(string.slice(i, i + 1));
  return n ? i + n[0].length : -1;
}
function parseUnixTimestamp(d, string, i) {
  var n = numberRe.exec(string.slice(i));
  return n ? (d.Q = +n[0], i + n[0].length) : -1;
}
function parseUnixTimestampSeconds(d, string, i) {
  var n = numberRe.exec(string.slice(i));
  return n ? (d.s = +n[0], i + n[0].length) : -1;
}
function formatDayOfMonth(d, p) {
  return pad(d.getDate(), p, 2);
}
function formatHour24(d, p) {
  return pad(d.getHours(), p, 2);
}
function formatHour12(d, p) {
  return pad(d.getHours() % 12 || 12, p, 2);
}
function formatDayOfYear(d, p) {
  return pad(1 + timeDay.count(timeYear(d), d), p, 3);
}
function formatMilliseconds(d, p) {
  return pad(d.getMilliseconds(), p, 3);
}
function formatMicroseconds(d, p) {
  return formatMilliseconds(d, p) + "000";
}
function formatMonthNumber(d, p) {
  return pad(d.getMonth() + 1, p, 2);
}
function formatMinutes(d, p) {
  return pad(d.getMinutes(), p, 2);
}
function formatSeconds(d, p) {
  return pad(d.getSeconds(), p, 2);
}
function formatWeekdayNumberMonday(d) {
  var day = d.getDay();
  return day === 0 ? 7 : day;
}
function formatWeekNumberSunday(d, p) {
  return pad(timeSunday.count(timeYear(d) - 1, d), p, 2);
}
function dISO(d) {
  var day = d.getDay();
  return day >= 4 || day === 0 ? timeThursday(d) : timeThursday.ceil(d);
}
function formatWeekNumberISO(d, p) {
  d = dISO(d);
  return pad(timeThursday.count(timeYear(d), d) + (timeYear(d).getDay() === 4), p, 2);
}
function formatWeekdayNumberSunday(d) {
  return d.getDay();
}
function formatWeekNumberMonday(d, p) {
  return pad(timeMonday.count(timeYear(d) - 1, d), p, 2);
}
function formatYear(d, p) {
  return pad(d.getFullYear() % 100, p, 2);
}
function formatYearISO(d, p) {
  d = dISO(d);
  return pad(d.getFullYear() % 100, p, 2);
}
function formatFullYear(d, p) {
  return pad(d.getFullYear() % 1e4, p, 4);
}
function formatFullYearISO(d, p) {
  var day = d.getDay();
  d = day >= 4 || day === 0 ? timeThursday(d) : timeThursday.ceil(d);
  return pad(d.getFullYear() % 1e4, p, 4);
}
function formatZone(d) {
  var z = d.getTimezoneOffset();
  return (z > 0 ? "-" : (z *= -1, "+")) + pad(z / 60 | 0, "0", 2) + pad(z % 60, "0", 2);
}
function formatUTCDayOfMonth(d, p) {
  return pad(d.getUTCDate(), p, 2);
}
function formatUTCHour24(d, p) {
  return pad(d.getUTCHours(), p, 2);
}
function formatUTCHour12(d, p) {
  return pad(d.getUTCHours() % 12 || 12, p, 2);
}
function formatUTCDayOfYear(d, p) {
  return pad(1 + utcDay.count(utcYear(d), d), p, 3);
}
function formatUTCMilliseconds(d, p) {
  return pad(d.getUTCMilliseconds(), p, 3);
}
function formatUTCMicroseconds(d, p) {
  return formatUTCMilliseconds(d, p) + "000";
}
function formatUTCMonthNumber(d, p) {
  return pad(d.getUTCMonth() + 1, p, 2);
}
function formatUTCMinutes(d, p) {
  return pad(d.getUTCMinutes(), p, 2);
}
function formatUTCSeconds(d, p) {
  return pad(d.getUTCSeconds(), p, 2);
}
function formatUTCWeekdayNumberMonday(d) {
  var dow = d.getUTCDay();
  return dow === 0 ? 7 : dow;
}
function formatUTCWeekNumberSunday(d, p) {
  return pad(utcSunday.count(utcYear(d) - 1, d), p, 2);
}
function UTCdISO(d) {
  var day = d.getUTCDay();
  return day >= 4 || day === 0 ? utcThursday(d) : utcThursday.ceil(d);
}
function formatUTCWeekNumberISO(d, p) {
  d = UTCdISO(d);
  return pad(utcThursday.count(utcYear(d), d) + (utcYear(d).getUTCDay() === 4), p, 2);
}
function formatUTCWeekdayNumberSunday(d) {
  return d.getUTCDay();
}
function formatUTCWeekNumberMonday(d, p) {
  return pad(utcMonday.count(utcYear(d) - 1, d), p, 2);
}
function formatUTCYear(d, p) {
  return pad(d.getUTCFullYear() % 100, p, 2);
}
function formatUTCYearISO(d, p) {
  d = UTCdISO(d);
  return pad(d.getUTCFullYear() % 100, p, 2);
}
function formatUTCFullYear(d, p) {
  return pad(d.getUTCFullYear() % 1e4, p, 4);
}
function formatUTCFullYearISO(d, p) {
  var day = d.getUTCDay();
  d = day >= 4 || day === 0 ? utcThursday(d) : utcThursday.ceil(d);
  return pad(d.getUTCFullYear() % 1e4, p, 4);
}
function formatUTCZone() {
  return "+0000";
}
function formatLiteralPercent() {
  return "%";
}
function formatUnixTimestamp(d) {
  return +d;
}
function formatUnixTimestampSeconds(d) {
  return Math.floor(+d / 1000);
}

// node_modules/d3-time-format/src/defaultLocale.js
var locale2;
var timeFormat;
var timeParse;
var utcFormat;
var utcParse;
defaultLocale2({
  dateTime: "%x, %X",
  date: "%-m/%-d/%Y",
  time: "%-I:%M:%S %p",
  periods: ["AM", "PM"],
  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
});
function defaultLocale2(definition) {
  locale2 = formatLocale(definition);
  timeFormat = locale2.format;
  timeParse = locale2.parse;
  utcFormat = locale2.utcFormat;
  utcParse = locale2.utcParse;
  return locale2;
}
// node_modules/d3-scale/src/nice.js
function nice(domain, interval) {
  domain = domain.slice();
  var i0 = 0, i1 = domain.length - 1, x0 = domain[i0], x1 = domain[i1], t;
  if (x1 < x0) {
    t = i0, i0 = i1, i1 = t;
    t = x0, x0 = x1, x1 = t;
  }
  domain[i0] = interval.floor(x0);
  domain[i1] = interval.ceil(x1);
  return domain;
}

// node_modules/d3-scale/src/time.js
function date(t) {
  return new Date(t);
}
function number4(t) {
  return t instanceof Date ? +t : +new Date(+t);
}
function calendar(ticks2, tickInterval, year, month, week, day, hour, minute, second2, format3) {
  var scale = continuous(), invert = scale.invert, domain = scale.domain;
  var formatMillisecond = format3(".%L"), formatSecond = format3(":%S"), formatMinute = format3("%I:%M"), formatHour = format3("%I %p"), formatDay = format3("%a %d"), formatWeek = format3("%b %d"), formatMonth = format3("%B"), formatYear2 = format3("%Y");
  function tickFormat2(date2) {
    return (second2(date2) < date2 ? formatMillisecond : minute(date2) < date2 ? formatSecond : hour(date2) < date2 ? formatMinute : day(date2) < date2 ? formatHour : month(date2) < date2 ? week(date2) < date2 ? formatDay : formatWeek : year(date2) < date2 ? formatMonth : formatYear2)(date2);
  }
  scale.invert = function(y) {
    return new Date(invert(y));
  };
  scale.domain = function(_) {
    return arguments.length ? domain(Array.from(_, number4)) : domain().map(date);
  };
  scale.ticks = function(interval) {
    var d = domain();
    return ticks2(d[0], d[d.length - 1], interval == null ? 10 : interval);
  };
  scale.tickFormat = function(count2, specifier) {
    return specifier == null ? tickFormat2 : format3(specifier);
  };
  scale.nice = function(interval) {
    var d = domain();
    if (!interval || typeof interval.range !== "function")
      interval = tickInterval(d[0], d[d.length - 1], interval == null ? 10 : interval);
    return interval ? domain(nice(d, interval)) : scale;
  };
  scale.copy = function() {
    return copy(scale, calendar(ticks2, tickInterval, year, month, week, day, hour, minute, second2, format3));
  };
  return scale;
}
function time() {
  return initRange.apply(calendar(timeTicks, timeTickInterval, timeYear, timeMonth, timeSunday, timeDay, timeHour, timeMinute, second, timeFormat).domain([new Date(2000, 0, 1), new Date(2000, 0, 2)]), arguments);
}
// node_modules/d3-scale-chromatic/src/colors.js
function colors_default(specifier) {
  var n = specifier.length / 6 | 0, colors = new Array(n), i = 0;
  while (i < n)
    colors[i] = "#" + specifier.slice(i * 6, ++i * 6);
  return colors;
}

// node_modules/d3-scale-chromatic/src/categorical/Tableau10.js
var Tableau10_default = colors_default("4e79a7f28e2ce1575976b7b259a14fedc949af7aa1ff9da79c755fbab0ab");
// node_modules/d3-shape/src/constant.js
function constant_default4(x) {
  return function constant() {
    return x;
  };
}

// node_modules/d3-shape/src/math.js
var abs = Math.abs;
var atan2 = Math.atan2;
var cos = Math.cos;
var max2 = Math.max;
var min2 = Math.min;
var sin = Math.sin;
var sqrt = Math.sqrt;
var epsilon2 = 0.000000000001;
var pi = Math.PI;
var halfPi = pi / 2;
var tau = 2 * pi;
function acos(x) {
  return x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
}
function asin(x) {
  return x >= 1 ? halfPi : x <= -1 ? -halfPi : Math.asin(x);
}

// node_modules/d3-path/src/path.js
var pi2 = Math.PI;
var tau2 = 2 * pi2;
var epsilon3 = 0.000001;
var tauEpsilon = tau2 - epsilon3;
function append(strings) {
  this._ += strings[0];
  for (let i = 1, n = strings.length;i < n; ++i) {
    this._ += arguments[i] + strings[i];
  }
}
function appendRound(digits) {
  let d = Math.floor(digits);
  if (!(d >= 0))
    throw new Error(`invalid digits: ${digits}`);
  if (d > 15)
    return append;
  const k = 10 ** d;
  return function(strings) {
    this._ += strings[0];
    for (let i = 1, n = strings.length;i < n; ++i) {
      this._ += Math.round(arguments[i] * k) / k + strings[i];
    }
  };
}

class Path {
  constructor(digits) {
    this._x0 = this._y0 = this._x1 = this._y1 = null;
    this._ = "";
    this._append = digits == null ? append : appendRound(digits);
  }
  moveTo(x, y) {
    this._append`M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}`;
  }
  closePath() {
    if (this._x1 !== null) {
      this._x1 = this._x0, this._y1 = this._y0;
      this._append`Z`;
    }
  }
  lineTo(x, y) {
    this._append`L${this._x1 = +x},${this._y1 = +y}`;
  }
  quadraticCurveTo(x1, y1, x, y) {
    this._append`Q${+x1},${+y1},${this._x1 = +x},${this._y1 = +y}`;
  }
  bezierCurveTo(x1, y1, x2, y2, x, y) {
    this._append`C${+x1},${+y1},${+x2},${+y2},${this._x1 = +x},${this._y1 = +y}`;
  }
  arcTo(x1, y1, x2, y2, r) {
    x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;
    if (r < 0)
      throw new Error(`negative radius: ${r}`);
    let x0 = this._x1, y0 = this._y1, x21 = x2 - x1, y21 = y2 - y1, x01 = x0 - x1, y01 = y0 - y1, l01_2 = x01 * x01 + y01 * y01;
    if (this._x1 === null) {
      this._append`M${this._x1 = x1},${this._y1 = y1}`;
    } else if (!(l01_2 > epsilon3))
      ;
    else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon3) || !r) {
      this._append`L${this._x1 = x1},${this._y1 = y1}`;
    } else {
      let x20 = x2 - x0, y20 = y2 - y0, l21_2 = x21 * x21 + y21 * y21, l20_2 = x20 * x20 + y20 * y20, l21 = Math.sqrt(l21_2), l01 = Math.sqrt(l01_2), l = r * Math.tan((pi2 - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2), t01 = l / l01, t21 = l / l21;
      if (Math.abs(t01 - 1) > epsilon3) {
        this._append`L${x1 + t01 * x01},${y1 + t01 * y01}`;
      }
      this._append`A${r},${r},0,0,${+(y01 * x20 > x01 * y20)},${this._x1 = x1 + t21 * x21},${this._y1 = y1 + t21 * y21}`;
    }
  }
  arc(x, y, r, a0, a1, ccw) {
    x = +x, y = +y, r = +r, ccw = !!ccw;
    if (r < 0)
      throw new Error(`negative radius: ${r}`);
    let dx = r * Math.cos(a0), dy = r * Math.sin(a0), x0 = x + dx, y0 = y + dy, cw = 1 ^ ccw, da = ccw ? a0 - a1 : a1 - a0;
    if (this._x1 === null) {
      this._append`M${x0},${y0}`;
    } else if (Math.abs(this._x1 - x0) > epsilon3 || Math.abs(this._y1 - y0) > epsilon3) {
      this._append`L${x0},${y0}`;
    }
    if (!r)
      return;
    if (da < 0)
      da = da % tau2 + tau2;
    if (da > tauEpsilon) {
      this._append`A${r},${r},0,1,${cw},${x - dx},${y - dy}A${r},${r},0,1,${cw},${this._x1 = x0},${this._y1 = y0}`;
    } else if (da > epsilon3) {
      this._append`A${r},${r},0,${+(da >= pi2)},${cw},${this._x1 = x + r * Math.cos(a1)},${this._y1 = y + r * Math.sin(a1)}`;
    }
  }
  rect(x, y, w, h) {
    this._append`M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}h${w = +w}v${+h}h${-w}Z`;
  }
  toString() {
    return this._;
  }
}
function path() {
  return new Path;
}
path.prototype = Path.prototype;
// node_modules/d3-shape/src/path.js
function withPath(shape) {
  let digits = 3;
  shape.digits = function(_) {
    if (!arguments.length)
      return digits;
    if (_ == null) {
      digits = null;
    } else {
      const d = Math.floor(_);
      if (!(d >= 0))
        throw new RangeError(`invalid digits: ${_}`);
      digits = d;
    }
    return shape;
  };
  return () => new Path(digits);
}

// node_modules/d3-shape/src/arc.js
function arcInnerRadius(d) {
  return d.innerRadius;
}
function arcOuterRadius(d) {
  return d.outerRadius;
}
function arcStartAngle(d) {
  return d.startAngle;
}
function arcEndAngle(d) {
  return d.endAngle;
}
function arcPadAngle(d) {
  return d && d.padAngle;
}
function intersect(x0, y0, x1, y1, x2, y2, x3, y3) {
  var x10 = x1 - x0, y10 = y1 - y0, x32 = x3 - x2, y32 = y3 - y2, t = y32 * x10 - x32 * y10;
  if (t * t < epsilon2)
    return;
  t = (x32 * (y0 - y2) - y32 * (x0 - x2)) / t;
  return [x0 + t * x10, y0 + t * y10];
}
function cornerTangents(x0, y0, x1, y1, r1, rc, cw) {
  var x01 = x0 - x1, y01 = y0 - y1, lo = (cw ? rc : -rc) / sqrt(x01 * x01 + y01 * y01), ox = lo * y01, oy = -lo * x01, x11 = x0 + ox, y11 = y0 + oy, x10 = x1 + ox, y10 = y1 + oy, x00 = (x11 + x10) / 2, y00 = (y11 + y10) / 2, dx = x10 - x11, dy = y10 - y11, d2 = dx * dx + dy * dy, r = r1 - rc, D = x11 * y10 - x10 * y11, d = (dy < 0 ? -1 : 1) * sqrt(max2(0, r * r * d2 - D * D)), cx0 = (D * dy - dx * d) / d2, cy0 = (-D * dx - dy * d) / d2, cx1 = (D * dy + dx * d) / d2, cy1 = (-D * dx + dy * d) / d2, dx0 = cx0 - x00, dy0 = cy0 - y00, dx1 = cx1 - x00, dy1 = cy1 - y00;
  if (dx0 * dx0 + dy0 * dy0 > dx1 * dx1 + dy1 * dy1)
    cx0 = cx1, cy0 = cy1;
  return {
    cx: cx0,
    cy: cy0,
    x01: -ox,
    y01: -oy,
    x11: cx0 * (r1 / r - 1),
    y11: cy0 * (r1 / r - 1)
  };
}
function arc_default() {
  var innerRadius = arcInnerRadius, outerRadius = arcOuterRadius, cornerRadius = constant_default4(0), padRadius = null, startAngle = arcStartAngle, endAngle = arcEndAngle, padAngle = arcPadAngle, context = null, path2 = withPath(arc);
  function arc() {
    var buffer, r, r0 = +innerRadius.apply(this, arguments), r1 = +outerRadius.apply(this, arguments), a0 = startAngle.apply(this, arguments) - halfPi, a1 = endAngle.apply(this, arguments) - halfPi, da = abs(a1 - a0), cw = a1 > a0;
    if (!context)
      context = buffer = path2();
    if (r1 < r0)
      r = r1, r1 = r0, r0 = r;
    if (!(r1 > epsilon2))
      context.moveTo(0, 0);
    else if (da > tau - epsilon2) {
      context.moveTo(r1 * cos(a0), r1 * sin(a0));
      context.arc(0, 0, r1, a0, a1, !cw);
      if (r0 > epsilon2) {
        context.moveTo(r0 * cos(a1), r0 * sin(a1));
        context.arc(0, 0, r0, a1, a0, cw);
      }
    } else {
      var a01 = a0, a11 = a1, a00 = a0, a10 = a1, da0 = da, da1 = da, ap = padAngle.apply(this, arguments) / 2, rp = ap > epsilon2 && (padRadius ? +padRadius.apply(this, arguments) : sqrt(r0 * r0 + r1 * r1)), rc = min2(abs(r1 - r0) / 2, +cornerRadius.apply(this, arguments)), rc0 = rc, rc1 = rc, t03, t13;
      if (rp > epsilon2) {
        var p0 = asin(rp / r0 * sin(ap)), p1 = asin(rp / r1 * sin(ap));
        if ((da0 -= p0 * 2) > epsilon2)
          p0 *= cw ? 1 : -1, a00 += p0, a10 -= p0;
        else
          da0 = 0, a00 = a10 = (a0 + a1) / 2;
        if ((da1 -= p1 * 2) > epsilon2)
          p1 *= cw ? 1 : -1, a01 += p1, a11 -= p1;
        else
          da1 = 0, a01 = a11 = (a0 + a1) / 2;
      }
      var x01 = r1 * cos(a01), y01 = r1 * sin(a01), x10 = r0 * cos(a10), y10 = r0 * sin(a10);
      if (rc > epsilon2) {
        var x11 = r1 * cos(a11), y11 = r1 * sin(a11), x00 = r0 * cos(a00), y00 = r0 * sin(a00), oc;
        if (da < pi) {
          if (oc = intersect(x01, y01, x00, y00, x11, y11, x10, y10)) {
            var ax = x01 - oc[0], ay = y01 - oc[1], bx = x11 - oc[0], by = y11 - oc[1], kc = 1 / sin(acos((ax * bx + ay * by) / (sqrt(ax * ax + ay * ay) * sqrt(bx * bx + by * by))) / 2), lc = sqrt(oc[0] * oc[0] + oc[1] * oc[1]);
            rc0 = min2(rc, (r0 - lc) / (kc - 1));
            rc1 = min2(rc, (r1 - lc) / (kc + 1));
          } else {
            rc0 = rc1 = 0;
          }
        }
      }
      if (!(da1 > epsilon2))
        context.moveTo(x01, y01);
      else if (rc1 > epsilon2) {
        t03 = cornerTangents(x00, y00, x01, y01, r1, rc1, cw);
        t13 = cornerTangents(x11, y11, x10, y10, r1, rc1, cw);
        context.moveTo(t03.cx + t03.x01, t03.cy + t03.y01);
        if (rc1 < rc)
          context.arc(t03.cx, t03.cy, rc1, atan2(t03.y01, t03.x01), atan2(t13.y01, t13.x01), !cw);
        else {
          context.arc(t03.cx, t03.cy, rc1, atan2(t03.y01, t03.x01), atan2(t03.y11, t03.x11), !cw);
          context.arc(0, 0, r1, atan2(t03.cy + t03.y11, t03.cx + t03.x11), atan2(t13.cy + t13.y11, t13.cx + t13.x11), !cw);
          context.arc(t13.cx, t13.cy, rc1, atan2(t13.y11, t13.x11), atan2(t13.y01, t13.x01), !cw);
        }
      } else
        context.moveTo(x01, y01), context.arc(0, 0, r1, a01, a11, !cw);
      if (!(r0 > epsilon2) || !(da0 > epsilon2))
        context.lineTo(x10, y10);
      else if (rc0 > epsilon2) {
        t03 = cornerTangents(x10, y10, x11, y11, r0, -rc0, cw);
        t13 = cornerTangents(x01, y01, x00, y00, r0, -rc0, cw);
        context.lineTo(t03.cx + t03.x01, t03.cy + t03.y01);
        if (rc0 < rc)
          context.arc(t03.cx, t03.cy, rc0, atan2(t03.y01, t03.x01), atan2(t13.y01, t13.x01), !cw);
        else {
          context.arc(t03.cx, t03.cy, rc0, atan2(t03.y01, t03.x01), atan2(t03.y11, t03.x11), !cw);
          context.arc(0, 0, r0, atan2(t03.cy + t03.y11, t03.cx + t03.x11), atan2(t13.cy + t13.y11, t13.cx + t13.x11), cw);
          context.arc(t13.cx, t13.cy, rc0, atan2(t13.y11, t13.x11), atan2(t13.y01, t13.x01), !cw);
        }
      } else
        context.arc(0, 0, r0, a10, a00, cw);
    }
    context.closePath();
    if (buffer)
      return context = null, buffer + "" || null;
  }
  arc.centroid = function() {
    var r = (+innerRadius.apply(this, arguments) + +outerRadius.apply(this, arguments)) / 2, a = (+startAngle.apply(this, arguments) + +endAngle.apply(this, arguments)) / 2 - pi / 2;
    return [cos(a) * r, sin(a) * r];
  };
  arc.innerRadius = function(_) {
    return arguments.length ? (innerRadius = typeof _ === "function" ? _ : constant_default4(+_), arc) : innerRadius;
  };
  arc.outerRadius = function(_) {
    return arguments.length ? (outerRadius = typeof _ === "function" ? _ : constant_default4(+_), arc) : outerRadius;
  };
  arc.cornerRadius = function(_) {
    return arguments.length ? (cornerRadius = typeof _ === "function" ? _ : constant_default4(+_), arc) : cornerRadius;
  };
  arc.padRadius = function(_) {
    return arguments.length ? (padRadius = _ == null ? null : typeof _ === "function" ? _ : constant_default4(+_), arc) : padRadius;
  };
  arc.startAngle = function(_) {
    return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant_default4(+_), arc) : startAngle;
  };
  arc.endAngle = function(_) {
    return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant_default4(+_), arc) : endAngle;
  };
  arc.padAngle = function(_) {
    return arguments.length ? (padAngle = typeof _ === "function" ? _ : constant_default4(+_), arc) : padAngle;
  };
  arc.context = function(_) {
    return arguments.length ? (context = _ == null ? null : _, arc) : context;
  };
  return arc;
}

// node_modules/d3-shape/src/array.js
var slice = Array.prototype.slice;
function array_default(x) {
  return typeof x === "object" && "length" in x ? x : Array.from(x);
}

// node_modules/d3-shape/src/curve/linear.js
function Linear(context) {
  this._context = context;
}
Linear.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line || this._line !== 0 && this._point === 1)
      this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x, y) {
    x = +x, y = +y;
    switch (this._point) {
      case 0:
        this._point = 1;
        this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y);
        break;
      case 1:
        this._point = 2;
      default:
        this._context.lineTo(x, y);
        break;
    }
  }
};
function linear_default(context) {
  return new Linear(context);
}

// node_modules/d3-shape/src/point.js
function x(p) {
  return p[0];
}
function y(p) {
  return p[1];
}

// node_modules/d3-shape/src/line.js
function line_default(x2, y2) {
  var defined = constant_default4(true), context = null, curve = linear_default, output = null, path2 = withPath(line);
  x2 = typeof x2 === "function" ? x2 : x2 === undefined ? x : constant_default4(x2);
  y2 = typeof y2 === "function" ? y2 : y2 === undefined ? y : constant_default4(y2);
  function line(data) {
    var i, n = (data = array_default(data)).length, d, defined0 = false, buffer;
    if (context == null)
      output = curve(buffer = path2());
    for (i = 0;i <= n; ++i) {
      if (!(i < n && defined(d = data[i], i, data)) === defined0) {
        if (defined0 = !defined0)
          output.lineStart();
        else
          output.lineEnd();
      }
      if (defined0)
        output.point(+x2(d, i, data), +y2(d, i, data));
    }
    if (buffer)
      return output = null, buffer + "" || null;
  }
  line.x = function(_) {
    return arguments.length ? (x2 = typeof _ === "function" ? _ : constant_default4(+_), line) : x2;
  };
  line.y = function(_) {
    return arguments.length ? (y2 = typeof _ === "function" ? _ : constant_default4(+_), line) : y2;
  };
  line.defined = function(_) {
    return arguments.length ? (defined = typeof _ === "function" ? _ : constant_default4(!!_), line) : defined;
  };
  line.curve = function(_) {
    return arguments.length ? (curve = _, context != null && (output = curve(context)), line) : curve;
  };
  line.context = function(_) {
    return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), line) : context;
  };
  return line;
}

// node_modules/d3-shape/src/descending.js
function descending_default(a, b) {
  return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
}

// node_modules/d3-shape/src/identity.js
function identity_default3(d) {
  return d;
}

// node_modules/d3-shape/src/pie.js
function pie_default() {
  var value = identity_default3, sortValues = descending_default, sort = null, startAngle = constant_default4(0), endAngle = constant_default4(tau), padAngle = constant_default4(0);
  function pie(data) {
    var i, n = (data = array_default(data)).length, j, k, sum = 0, index = new Array(n), arcs = new Array(n), a0 = +startAngle.apply(this, arguments), da = Math.min(tau, Math.max(-tau, endAngle.apply(this, arguments) - a0)), a1, p = Math.min(Math.abs(da) / n, padAngle.apply(this, arguments)), pa = p * (da < 0 ? -1 : 1), v;
    for (i = 0;i < n; ++i) {
      if ((v = arcs[index[i] = i] = +value(data[i], i, data)) > 0) {
        sum += v;
      }
    }
    if (sortValues != null)
      index.sort(function(i2, j2) {
        return sortValues(arcs[i2], arcs[j2]);
      });
    else if (sort != null)
      index.sort(function(i2, j2) {
        return sort(data[i2], data[j2]);
      });
    for (i = 0, k = sum ? (da - n * pa) / sum : 0;i < n; ++i, a0 = a1) {
      j = index[i], v = arcs[j], a1 = a0 + (v > 0 ? v * k : 0) + pa, arcs[j] = {
        data: data[j],
        index: i,
        value: v,
        startAngle: a0,
        endAngle: a1,
        padAngle: p
      };
    }
    return arcs;
  }
  pie.value = function(_) {
    return arguments.length ? (value = typeof _ === "function" ? _ : constant_default4(+_), pie) : value;
  };
  pie.sortValues = function(_) {
    return arguments.length ? (sortValues = _, sort = null, pie) : sortValues;
  };
  pie.sort = function(_) {
    return arguments.length ? (sort = _, sortValues = null, pie) : sort;
  };
  pie.startAngle = function(_) {
    return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant_default4(+_), pie) : startAngle;
  };
  pie.endAngle = function(_) {
    return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant_default4(+_), pie) : endAngle;
  };
  pie.padAngle = function(_) {
    return arguments.length ? (padAngle = typeof _ === "function" ? _ : constant_default4(+_), pie) : padAngle;
  };
  return pie;
}

// node_modules/d3-shape/src/curve/basis.js
function point2(that, x2, y2) {
  that._context.bezierCurveTo((2 * that._x0 + that._x1) / 3, (2 * that._y0 + that._y1) / 3, (that._x0 + 2 * that._x1) / 3, (that._y0 + 2 * that._y1) / 3, (that._x0 + 4 * that._x1 + x2) / 6, (that._y0 + 4 * that._y1 + y2) / 6);
}
function Basis(context) {
  this._context = context;
}
Basis.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._y0 = this._y1 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 3:
        point2(this, this._x1, this._y1);
      case 2:
        this._context.lineTo(this._x1, this._y1);
        break;
    }
    if (this._line || this._line !== 0 && this._point === 1)
      this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    switch (this._point) {
      case 0:
        this._point = 1;
        this._line ? this._context.lineTo(x2, y2) : this._context.moveTo(x2, y2);
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
        this._context.lineTo((5 * this._x0 + this._x1) / 6, (5 * this._y0 + this._y1) / 6);
      default:
        point2(this, x2, y2);
        break;
    }
    this._x0 = this._x1, this._x1 = x2;
    this._y0 = this._y1, this._y1 = y2;
  }
};
function basis_default2(context) {
  return new Basis(context);
}
// node_modules/d3-shape/src/curve/bump.js
class Bump {
  constructor(context, x2) {
    this._context = context;
    this._x = x2;
  }
  areaStart() {
    this._line = 0;
  }
  areaEnd() {
    this._line = NaN;
  }
  lineStart() {
    this._point = 0;
  }
  lineEnd() {
    if (this._line || this._line !== 0 && this._point === 1)
      this._context.closePath();
    this._line = 1 - this._line;
  }
  point(x2, y2) {
    x2 = +x2, y2 = +y2;
    switch (this._point) {
      case 0: {
        this._point = 1;
        if (this._line)
          this._context.lineTo(x2, y2);
        else
          this._context.moveTo(x2, y2);
        break;
      }
      case 1:
        this._point = 2;
      default: {
        if (this._x)
          this._context.bezierCurveTo(this._x0 = (this._x0 + x2) / 2, this._y0, this._x0, y2, x2, y2);
        else
          this._context.bezierCurveTo(this._x0, this._y0 = (this._y0 + y2) / 2, x2, this._y0, x2, y2);
        break;
      }
    }
    this._x0 = x2, this._y0 = y2;
  }
}
function bumpX(context) {
  return new Bump(context, true);
}
function bumpY(context) {
  return new Bump(context, false);
}

// node_modules/d3-shape/src/noop.js
function noop_default() {}

// node_modules/d3-shape/src/curve/basisClosed.js
function BasisClosed(context) {
  this._context = context;
}
BasisClosed.prototype = {
  areaStart: noop_default,
  areaEnd: noop_default,
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 1: {
        this._context.moveTo(this._x2, this._y2);
        this._context.closePath();
        break;
      }
      case 2: {
        this._context.moveTo((this._x2 + 2 * this._x3) / 3, (this._y2 + 2 * this._y3) / 3);
        this._context.lineTo((this._x3 + 2 * this._x2) / 3, (this._y3 + 2 * this._y2) / 3);
        this._context.closePath();
        break;
      }
      case 3: {
        this.point(this._x2, this._y2);
        this.point(this._x3, this._y3);
        this.point(this._x4, this._y4);
        break;
      }
    }
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    switch (this._point) {
      case 0:
        this._point = 1;
        this._x2 = x2, this._y2 = y2;
        break;
      case 1:
        this._point = 2;
        this._x3 = x2, this._y3 = y2;
        break;
      case 2:
        this._point = 3;
        this._x4 = x2, this._y4 = y2;
        this._context.moveTo((this._x0 + 4 * this._x1 + x2) / 6, (this._y0 + 4 * this._y1 + y2) / 6);
        break;
      default:
        point2(this, x2, y2);
        break;
    }
    this._x0 = this._x1, this._x1 = x2;
    this._y0 = this._y1, this._y1 = y2;
  }
};
function basisClosed_default2(context) {
  return new BasisClosed(context);
}
// node_modules/d3-shape/src/curve/basisOpen.js
function BasisOpen(context) {
  this._context = context;
}
BasisOpen.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._y0 = this._y1 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line || this._line !== 0 && this._point === 3)
      this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    switch (this._point) {
      case 0:
        this._point = 1;
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
        var x0 = (this._x0 + 4 * this._x1 + x2) / 6, y0 = (this._y0 + 4 * this._y1 + y2) / 6;
        this._line ? this._context.lineTo(x0, y0) : this._context.moveTo(x0, y0);
        break;
      case 3:
        this._point = 4;
      default:
        point2(this, x2, y2);
        break;
    }
    this._x0 = this._x1, this._x1 = x2;
    this._y0 = this._y1, this._y1 = y2;
  }
};
function basisOpen_default(context) {
  return new BasisOpen(context);
}
// node_modules/d3-shape/src/curve/bundle.js
function Bundle(context, beta) {
  this._basis = new Basis(context);
  this._beta = beta;
}
Bundle.prototype = {
  lineStart: function() {
    this._x = [];
    this._y = [];
    this._basis.lineStart();
  },
  lineEnd: function() {
    var x2 = this._x, y2 = this._y, j = x2.length - 1;
    if (j > 0) {
      var x0 = x2[0], y0 = y2[0], dx = x2[j] - x0, dy = y2[j] - y0, i = -1, t;
      while (++i <= j) {
        t = i / j;
        this._basis.point(this._beta * x2[i] + (1 - this._beta) * (x0 + t * dx), this._beta * y2[i] + (1 - this._beta) * (y0 + t * dy));
      }
    }
    this._x = this._y = null;
    this._basis.lineEnd();
  },
  point: function(x2, y2) {
    this._x.push(+x2);
    this._y.push(+y2);
  }
};
var bundle_default = function custom2(beta) {
  function bundle(context) {
    return beta === 1 ? new Basis(context) : new Bundle(context, beta);
  }
  bundle.beta = function(beta2) {
    return custom2(+beta2);
  };
  return bundle;
}(0.85);
// node_modules/d3-shape/src/curve/cardinal.js
function point3(that, x2, y2) {
  that._context.bezierCurveTo(that._x1 + that._k * (that._x2 - that._x0), that._y1 + that._k * (that._y2 - that._y0), that._x2 + that._k * (that._x1 - x2), that._y2 + that._k * (that._y1 - y2), that._x2, that._y2);
}
function Cardinal(context, tension) {
  this._context = context;
  this._k = (1 - tension) / 6;
}
Cardinal.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 2:
        this._context.lineTo(this._x2, this._y2);
        break;
      case 3:
        point3(this, this._x1, this._y1);
        break;
    }
    if (this._line || this._line !== 0 && this._point === 1)
      this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    switch (this._point) {
      case 0:
        this._point = 1;
        this._line ? this._context.lineTo(x2, y2) : this._context.moveTo(x2, y2);
        break;
      case 1:
        this._point = 2;
        this._x1 = x2, this._y1 = y2;
        break;
      case 2:
        this._point = 3;
      default:
        point3(this, x2, y2);
        break;
    }
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x2;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y2;
  }
};
var cardinal_default = function custom3(tension) {
  function cardinal(context) {
    return new Cardinal(context, tension);
  }
  cardinal.tension = function(tension2) {
    return custom3(+tension2);
  };
  return cardinal;
}(0);

// node_modules/d3-shape/src/curve/cardinalClosed.js
function CardinalClosed(context, tension) {
  this._context = context;
  this._k = (1 - tension) / 6;
}
CardinalClosed.prototype = {
  areaStart: noop_default,
  areaEnd: noop_default,
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._x5 = this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = this._y5 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 1: {
        this._context.moveTo(this._x3, this._y3);
        this._context.closePath();
        break;
      }
      case 2: {
        this._context.lineTo(this._x3, this._y3);
        this._context.closePath();
        break;
      }
      case 3: {
        this.point(this._x3, this._y3);
        this.point(this._x4, this._y4);
        this.point(this._x5, this._y5);
        break;
      }
    }
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    switch (this._point) {
      case 0:
        this._point = 1;
        this._x3 = x2, this._y3 = y2;
        break;
      case 1:
        this._point = 2;
        this._context.moveTo(this._x4 = x2, this._y4 = y2);
        break;
      case 2:
        this._point = 3;
        this._x5 = x2, this._y5 = y2;
        break;
      default:
        point3(this, x2, y2);
        break;
    }
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x2;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y2;
  }
};
var cardinalClosed_default = function custom4(tension) {
  function cardinal(context) {
    return new CardinalClosed(context, tension);
  }
  cardinal.tension = function(tension2) {
    return custom4(+tension2);
  };
  return cardinal;
}(0);
// node_modules/d3-shape/src/curve/cardinalOpen.js
function CardinalOpen(context, tension) {
  this._context = context;
  this._k = (1 - tension) / 6;
}
CardinalOpen.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line || this._line !== 0 && this._point === 3)
      this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    switch (this._point) {
      case 0:
        this._point = 1;
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
        this._line ? this._context.lineTo(this._x2, this._y2) : this._context.moveTo(this._x2, this._y2);
        break;
      case 3:
        this._point = 4;
      default:
        point3(this, x2, y2);
        break;
    }
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x2;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y2;
  }
};
var cardinalOpen_default = function custom5(tension) {
  function cardinal(context) {
    return new CardinalOpen(context, tension);
  }
  cardinal.tension = function(tension2) {
    return custom5(+tension2);
  };
  return cardinal;
}(0);
// node_modules/d3-shape/src/curve/catmullRom.js
function point4(that, x2, y2) {
  var { _x1: x1, _y1: y1, _x2: x22, _y2: y22 } = that;
  if (that._l01_a > epsilon2) {
    var a = 2 * that._l01_2a + 3 * that._l01_a * that._l12_a + that._l12_2a, n = 3 * that._l01_a * (that._l01_a + that._l12_a);
    x1 = (x1 * a - that._x0 * that._l12_2a + that._x2 * that._l01_2a) / n;
    y1 = (y1 * a - that._y0 * that._l12_2a + that._y2 * that._l01_2a) / n;
  }
  if (that._l23_a > epsilon2) {
    var b = 2 * that._l23_2a + 3 * that._l23_a * that._l12_a + that._l12_2a, m = 3 * that._l23_a * (that._l23_a + that._l12_a);
    x22 = (x22 * b + that._x1 * that._l23_2a - x2 * that._l12_2a) / m;
    y22 = (y22 * b + that._y1 * that._l23_2a - y2 * that._l12_2a) / m;
  }
  that._context.bezierCurveTo(x1, y1, x22, y22, that._x2, that._y2);
}
function CatmullRom(context, alpha) {
  this._context = context;
  this._alpha = alpha;
}
CatmullRom.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN;
    this._l01_a = this._l12_a = this._l23_a = this._l01_2a = this._l12_2a = this._l23_2a = this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 2:
        this._context.lineTo(this._x2, this._y2);
        break;
      case 3:
        this.point(this._x2, this._y2);
        break;
    }
    if (this._line || this._line !== 0 && this._point === 1)
      this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    if (this._point) {
      var x23 = this._x2 - x2, y23 = this._y2 - y2;
      this._l23_a = Math.sqrt(this._l23_2a = Math.pow(x23 * x23 + y23 * y23, this._alpha));
    }
    switch (this._point) {
      case 0:
        this._point = 1;
        this._line ? this._context.lineTo(x2, y2) : this._context.moveTo(x2, y2);
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
      default:
        point4(this, x2, y2);
        break;
    }
    this._l01_a = this._l12_a, this._l12_a = this._l23_a;
    this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a;
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x2;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y2;
  }
};
var catmullRom_default = function custom6(alpha) {
  function catmullRom(context) {
    return alpha ? new CatmullRom(context, alpha) : new Cardinal(context, 0);
  }
  catmullRom.alpha = function(alpha2) {
    return custom6(+alpha2);
  };
  return catmullRom;
}(0.5);

// node_modules/d3-shape/src/curve/catmullRomClosed.js
function CatmullRomClosed(context, alpha) {
  this._context = context;
  this._alpha = alpha;
}
CatmullRomClosed.prototype = {
  areaStart: noop_default,
  areaEnd: noop_default,
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._x5 = this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = this._y5 = NaN;
    this._l01_a = this._l12_a = this._l23_a = this._l01_2a = this._l12_2a = this._l23_2a = this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 1: {
        this._context.moveTo(this._x3, this._y3);
        this._context.closePath();
        break;
      }
      case 2: {
        this._context.lineTo(this._x3, this._y3);
        this._context.closePath();
        break;
      }
      case 3: {
        this.point(this._x3, this._y3);
        this.point(this._x4, this._y4);
        this.point(this._x5, this._y5);
        break;
      }
    }
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    if (this._point) {
      var x23 = this._x2 - x2, y23 = this._y2 - y2;
      this._l23_a = Math.sqrt(this._l23_2a = Math.pow(x23 * x23 + y23 * y23, this._alpha));
    }
    switch (this._point) {
      case 0:
        this._point = 1;
        this._x3 = x2, this._y3 = y2;
        break;
      case 1:
        this._point = 2;
        this._context.moveTo(this._x4 = x2, this._y4 = y2);
        break;
      case 2:
        this._point = 3;
        this._x5 = x2, this._y5 = y2;
        break;
      default:
        point4(this, x2, y2);
        break;
    }
    this._l01_a = this._l12_a, this._l12_a = this._l23_a;
    this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a;
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x2;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y2;
  }
};
var catmullRomClosed_default = function custom7(alpha) {
  function catmullRom(context) {
    return alpha ? new CatmullRomClosed(context, alpha) : new CardinalClosed(context, 0);
  }
  catmullRom.alpha = function(alpha2) {
    return custom7(+alpha2);
  };
  return catmullRom;
}(0.5);
// node_modules/d3-shape/src/curve/catmullRomOpen.js
function CatmullRomOpen(context, alpha) {
  this._context = context;
  this._alpha = alpha;
}
CatmullRomOpen.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN;
    this._l01_a = this._l12_a = this._l23_a = this._l01_2a = this._l12_2a = this._l23_2a = this._point = 0;
  },
  lineEnd: function() {
    if (this._line || this._line !== 0 && this._point === 3)
      this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    if (this._point) {
      var x23 = this._x2 - x2, y23 = this._y2 - y2;
      this._l23_a = Math.sqrt(this._l23_2a = Math.pow(x23 * x23 + y23 * y23, this._alpha));
    }
    switch (this._point) {
      case 0:
        this._point = 1;
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
        this._line ? this._context.lineTo(this._x2, this._y2) : this._context.moveTo(this._x2, this._y2);
        break;
      case 3:
        this._point = 4;
      default:
        point4(this, x2, y2);
        break;
    }
    this._l01_a = this._l12_a, this._l12_a = this._l23_a;
    this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a;
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x2;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y2;
  }
};
var catmullRomOpen_default = function custom8(alpha) {
  function catmullRom(context) {
    return alpha ? new CatmullRomOpen(context, alpha) : new CardinalOpen(context, 0);
  }
  catmullRom.alpha = function(alpha2) {
    return custom8(+alpha2);
  };
  return catmullRom;
}(0.5);
// node_modules/d3-shape/src/curve/linearClosed.js
function LinearClosed(context) {
  this._context = context;
}
LinearClosed.prototype = {
  areaStart: noop_default,
  areaEnd: noop_default,
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    if (this._point)
      this._context.closePath();
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    if (this._point)
      this._context.lineTo(x2, y2);
    else
      this._point = 1, this._context.moveTo(x2, y2);
  }
};
function linearClosed_default(context) {
  return new LinearClosed(context);
}
// node_modules/d3-shape/src/curve/monotone.js
function sign(x2) {
  return x2 < 0 ? -1 : 1;
}
function slope3(that, x2, y2) {
  var h0 = that._x1 - that._x0, h1 = x2 - that._x1, s0 = (that._y1 - that._y0) / (h0 || h1 < 0 && -0), s1 = (y2 - that._y1) / (h1 || h0 < 0 && -0), p = (s0 * h1 + s1 * h0) / (h0 + h1);
  return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
}
function slope2(that, t) {
  var h = that._x1 - that._x0;
  return h ? (3 * (that._y1 - that._y0) / h - t) / 2 : t;
}
function point5(that, t03, t13) {
  var { _x0: x0, _y0: y0, _x1: x1, _y1: y1 } = that, dx = (x1 - x0) / 3;
  that._context.bezierCurveTo(x0 + dx, y0 + dx * t03, x1 - dx, y1 - dx * t13, x1, y1);
}
function MonotoneX(context) {
  this._context = context;
}
MonotoneX.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._y0 = this._y1 = this._t0 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 2:
        this._context.lineTo(this._x1, this._y1);
        break;
      case 3:
        point5(this, this._t0, slope2(this, this._t0));
        break;
    }
    if (this._line || this._line !== 0 && this._point === 1)
      this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x2, y2) {
    var t13 = NaN;
    x2 = +x2, y2 = +y2;
    if (x2 === this._x1 && y2 === this._y1)
      return;
    switch (this._point) {
      case 0:
        this._point = 1;
        this._line ? this._context.lineTo(x2, y2) : this._context.moveTo(x2, y2);
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
        point5(this, slope2(this, t13 = slope3(this, x2, y2)), t13);
        break;
      default:
        point5(this, this._t0, t13 = slope3(this, x2, y2));
        break;
    }
    this._x0 = this._x1, this._x1 = x2;
    this._y0 = this._y1, this._y1 = y2;
    this._t0 = t13;
  }
};
function MonotoneY(context) {
  this._context = new ReflectContext(context);
}
(MonotoneY.prototype = Object.create(MonotoneX.prototype)).point = function(x2, y2) {
  MonotoneX.prototype.point.call(this, y2, x2);
};
function ReflectContext(context) {
  this._context = context;
}
ReflectContext.prototype = {
  moveTo: function(x2, y2) {
    this._context.moveTo(y2, x2);
  },
  closePath: function() {
    this._context.closePath();
  },
  lineTo: function(x2, y2) {
    this._context.lineTo(y2, x2);
  },
  bezierCurveTo: function(x1, y1, x2, y2, x3, y3) {
    this._context.bezierCurveTo(y1, x1, y2, x2, y3, x3);
  }
};
function monotoneX(context) {
  return new MonotoneX(context);
}
function monotoneY(context) {
  return new MonotoneY(context);
}
// node_modules/d3-shape/src/curve/natural.js
function Natural(context) {
  this._context = context;
}
Natural.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x = [];
    this._y = [];
  },
  lineEnd: function() {
    var x2 = this._x, y2 = this._y, n = x2.length;
    if (n) {
      this._line ? this._context.lineTo(x2[0], y2[0]) : this._context.moveTo(x2[0], y2[0]);
      if (n === 2) {
        this._context.lineTo(x2[1], y2[1]);
      } else {
        var px = controlPoints(x2), py = controlPoints(y2);
        for (var i0 = 0, i1 = 1;i1 < n; ++i0, ++i1) {
          this._context.bezierCurveTo(px[0][i0], py[0][i0], px[1][i0], py[1][i0], x2[i1], y2[i1]);
        }
      }
    }
    if (this._line || this._line !== 0 && n === 1)
      this._context.closePath();
    this._line = 1 - this._line;
    this._x = this._y = null;
  },
  point: function(x2, y2) {
    this._x.push(+x2);
    this._y.push(+y2);
  }
};
function controlPoints(x2) {
  var i, n = x2.length - 1, m, a = new Array(n), b = new Array(n), r = new Array(n);
  a[0] = 0, b[0] = 2, r[0] = x2[0] + 2 * x2[1];
  for (i = 1;i < n - 1; ++i)
    a[i] = 1, b[i] = 4, r[i] = 4 * x2[i] + 2 * x2[i + 1];
  a[n - 1] = 2, b[n - 1] = 7, r[n - 1] = 8 * x2[n - 1] + x2[n];
  for (i = 1;i < n; ++i)
    m = a[i] / b[i - 1], b[i] -= m, r[i] -= m * r[i - 1];
  a[n - 1] = r[n - 1] / b[n - 1];
  for (i = n - 2;i >= 0; --i)
    a[i] = (r[i] - a[i + 1]) / b[i];
  b[n - 1] = (x2[n] + a[n - 1]) / 2;
  for (i = 0;i < n - 1; ++i)
    b[i] = 2 * x2[i + 1] - a[i + 1];
  return [a, b];
}
function natural_default(context) {
  return new Natural(context);
}
// node_modules/d3-shape/src/curve/step.js
function Step(context, t) {
  this._context = context;
  this._t = t;
}
Step.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x = this._y = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    if (0 < this._t && this._t < 1 && this._point === 2)
      this._context.lineTo(this._x, this._y);
    if (this._line || this._line !== 0 && this._point === 1)
      this._context.closePath();
    if (this._line >= 0)
      this._t = 1 - this._t, this._line = 1 - this._line;
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    switch (this._point) {
      case 0:
        this._point = 1;
        this._line ? this._context.lineTo(x2, y2) : this._context.moveTo(x2, y2);
        break;
      case 1:
        this._point = 2;
      default: {
        if (this._t <= 0) {
          this._context.lineTo(this._x, y2);
          this._context.lineTo(x2, y2);
        } else {
          var x1 = this._x * (1 - this._t) + x2 * this._t;
          this._context.lineTo(x1, this._y);
          this._context.lineTo(x1, y2);
        }
        break;
      }
    }
    this._x = x2, this._y = y2;
  }
};
function step_default(context) {
  return new Step(context, 0.5);
}
function stepBefore(context) {
  return new Step(context, 0);
}
function stepAfter(context) {
  return new Step(context, 1);
}
// node_modules/d3-dispatch/src/dispatch.js
var noop = { value: () => {} };
function dispatch() {
  for (var i = 0, n = arguments.length, _ = {}, t;i < n; ++i) {
    if (!(t = arguments[i] + "") || t in _ || /[\s.]/.test(t))
      throw new Error("illegal type: " + t);
    _[t] = [];
  }
  return new Dispatch(_);
}
function Dispatch(_) {
  this._ = _;
}
function parseTypenames2(typenames, types) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0)
      name = t.slice(i + 1), t = t.slice(0, i);
    if (t && !types.hasOwnProperty(t))
      throw new Error("unknown type: " + t);
    return { type: t, name };
  });
}
Dispatch.prototype = dispatch.prototype = {
  constructor: Dispatch,
  on: function(typename, callback) {
    var _ = this._, T = parseTypenames2(typename + "", _), t, i = -1, n = T.length;
    if (arguments.length < 2) {
      while (++i < n)
        if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name)))
          return t;
      return;
    }
    if (callback != null && typeof callback !== "function")
      throw new Error("invalid callback: " + callback);
    while (++i < n) {
      if (t = (typename = T[i]).type)
        _[t] = set(_[t], typename.name, callback);
      else if (callback == null)
        for (t in _)
          _[t] = set(_[t], typename.name, null);
    }
    return this;
  },
  copy: function() {
    var copy2 = {}, _ = this._;
    for (var t in _)
      copy2[t] = _[t].slice();
    return new Dispatch(copy2);
  },
  call: function(type, that) {
    if ((n = arguments.length - 2) > 0)
      for (var args = new Array(n), i = 0, n, t;i < n; ++i)
        args[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(type))
      throw new Error("unknown type: " + type);
    for (t = this._[type], i = 0, n = t.length;i < n; ++i)
      t[i].value.apply(that, args);
  },
  apply: function(type, that, args) {
    if (!this._.hasOwnProperty(type))
      throw new Error("unknown type: " + type);
    for (var t = this._[type], i = 0, n = t.length;i < n; ++i)
      t[i].value.apply(that, args);
  }
};
function get(type, name) {
  for (var i = 0, n = type.length, c;i < n; ++i) {
    if ((c = type[i]).name === name) {
      return c.value;
    }
  }
}
function set(type, name, callback) {
  for (var i = 0, n = type.length;i < n; ++i) {
    if (type[i].name === name) {
      type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
      break;
    }
  }
  if (callback != null)
    type.push({ name, value: callback });
  return type;
}
var dispatch_default2 = dispatch;
// node_modules/d3-timer/src/timer.js
var frame = 0;
var timeout = 0;
var interval = 0;
var pokeDelay = 1000;
var taskHead;
var taskTail;
var clockLast = 0;
var clockNow = 0;
var clockSkew = 0;
var clock = typeof performance === "object" && performance.now ? performance : Date;
var setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) {
  setTimeout(f, 17);
};
function now() {
  return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
}
function clearNow() {
  clockNow = 0;
}
function Timer() {
  this._call = this._time = this._next = null;
}
Timer.prototype = timer.prototype = {
  constructor: Timer,
  restart: function(callback, delay, time2) {
    if (typeof callback !== "function")
      throw new TypeError("callback is not a function");
    time2 = (time2 == null ? now() : +time2) + (delay == null ? 0 : +delay);
    if (!this._next && taskTail !== this) {
      if (taskTail)
        taskTail._next = this;
      else
        taskHead = this;
      taskTail = this;
    }
    this._call = callback;
    this._time = time2;
    sleep();
  },
  stop: function() {
    if (this._call) {
      this._call = null;
      this._time = Infinity;
      sleep();
    }
  }
};
function timer(callback, delay, time2) {
  var t = new Timer;
  t.restart(callback, delay, time2);
  return t;
}
function timerFlush() {
  now();
  ++frame;
  var t = taskHead, e;
  while (t) {
    if ((e = clockNow - t._time) >= 0)
      t._call.call(undefined, e);
    t = t._next;
  }
  --frame;
}
function wake() {
  clockNow = (clockLast = clock.now()) + clockSkew;
  frame = timeout = 0;
  try {
    timerFlush();
  } finally {
    frame = 0;
    nap();
    clockNow = 0;
  }
}
function poke() {
  var now2 = clock.now(), delay = now2 - clockLast;
  if (delay > pokeDelay)
    clockSkew -= delay, clockLast = now2;
}
function nap() {
  var t03, t13 = taskHead, t22, time2 = Infinity;
  while (t13) {
    if (t13._call) {
      if (time2 > t13._time)
        time2 = t13._time;
      t03 = t13, t13 = t13._next;
    } else {
      t22 = t13._next, t13._next = null;
      t13 = t03 ? t03._next = t22 : taskHead = t22;
    }
  }
  taskTail = t03;
  sleep(time2);
}
function sleep(time2) {
  if (frame)
    return;
  if (timeout)
    timeout = clearTimeout(timeout);
  var delay = time2 - clockNow;
  if (delay > 24) {
    if (time2 < Infinity)
      timeout = setTimeout(wake, time2 - clock.now() - clockSkew);
    if (interval)
      interval = clearInterval(interval);
  } else {
    if (!interval)
      clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
    frame = 1, setFrame(wake);
  }
}
// node_modules/d3-timer/src/timeout.js
function timeout_default(callback, delay, time2) {
  var t = new Timer;
  delay = delay == null ? 0 : +delay;
  t.restart((elapsed) => {
    t.stop();
    callback(elapsed + delay);
  }, delay, time2);
  return t;
}
// node_modules/d3-transition/src/transition/schedule.js
var emptyOn = dispatch_default2("start", "end", "cancel", "interrupt");
var emptyTween = [];
var CREATED = 0;
var SCHEDULED = 1;
var STARTING = 2;
var STARTED = 3;
var RUNNING = 4;
var ENDING = 5;
var ENDED = 6;
function schedule_default(node, name, id, index, group, timing) {
  var schedules = node.__transition;
  if (!schedules)
    node.__transition = {};
  else if (id in schedules)
    return;
  create(node, id, {
    name,
    index,
    group,
    on: emptyOn,
    tween: emptyTween,
    time: timing.time,
    delay: timing.delay,
    duration: timing.duration,
    ease: timing.ease,
    timer: null,
    state: CREATED
  });
}
function init(node, id) {
  var schedule = get2(node, id);
  if (schedule.state > CREATED)
    throw new Error("too late; already scheduled");
  return schedule;
}
function set2(node, id) {
  var schedule = get2(node, id);
  if (schedule.state > STARTED)
    throw new Error("too late; already running");
  return schedule;
}
function get2(node, id) {
  var schedule = node.__transition;
  if (!schedule || !(schedule = schedule[id]))
    throw new Error("transition not found");
  return schedule;
}
function create(node, id, self2) {
  var schedules = node.__transition, tween;
  schedules[id] = self2;
  self2.timer = timer(schedule, 0, self2.time);
  function schedule(elapsed) {
    self2.state = SCHEDULED;
    self2.timer.restart(start, self2.delay, self2.time);
    if (self2.delay <= elapsed)
      start(elapsed - self2.delay);
  }
  function start(elapsed) {
    var i, j, n, o;
    if (self2.state !== SCHEDULED)
      return stop();
    for (i in schedules) {
      o = schedules[i];
      if (o.name !== self2.name)
        continue;
      if (o.state === STARTED)
        return timeout_default(start);
      if (o.state === RUNNING) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("interrupt", node, node.__data__, o.index, o.group);
        delete schedules[i];
      } else if (+i < id) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("cancel", node, node.__data__, o.index, o.group);
        delete schedules[i];
      }
    }
    timeout_default(function() {
      if (self2.state === STARTED) {
        self2.state = RUNNING;
        self2.timer.restart(tick, self2.delay, self2.time);
        tick(elapsed);
      }
    });
    self2.state = STARTING;
    self2.on.call("start", node, node.__data__, self2.index, self2.group);
    if (self2.state !== STARTING)
      return;
    self2.state = STARTED;
    tween = new Array(n = self2.tween.length);
    for (i = 0, j = -1;i < n; ++i) {
      if (o = self2.tween[i].value.call(node, node.__data__, self2.index, self2.group)) {
        tween[++j] = o;
      }
    }
    tween.length = j + 1;
  }
  function tick(elapsed) {
    var t = elapsed < self2.duration ? self2.ease.call(null, elapsed / self2.duration) : (self2.timer.restart(stop), self2.state = ENDING, 1), i = -1, n = tween.length;
    while (++i < n) {
      tween[i].call(node, t);
    }
    if (self2.state === ENDING) {
      self2.on.call("end", node, node.__data__, self2.index, self2.group);
      stop();
    }
  }
  function stop() {
    self2.state = ENDED;
    self2.timer.stop();
    delete schedules[id];
    for (var i in schedules)
      return;
    delete node.__transition;
  }
}

// node_modules/d3-transition/src/interrupt.js
function interrupt_default(node, name) {
  var schedules = node.__transition, schedule, active, empty2 = true, i;
  if (!schedules)
    return;
  name = name == null ? null : name + "";
  for (i in schedules) {
    if ((schedule = schedules[i]).name !== name) {
      empty2 = false;
      continue;
    }
    active = schedule.state > STARTING && schedule.state < ENDING;
    schedule.state = ENDED;
    schedule.timer.stop();
    schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
    delete schedules[i];
  }
  if (empty2)
    delete node.__transition;
}

// node_modules/d3-transition/src/selection/interrupt.js
function interrupt_default2(name) {
  return this.each(function() {
    interrupt_default(this, name);
  });
}

// node_modules/d3-transition/src/transition/tween.js
function tweenRemove(id, name) {
  var tween0, tween1;
  return function() {
    var schedule = set2(this, id), tween = schedule.tween;
    if (tween !== tween0) {
      tween1 = tween0 = tween;
      for (var i = 0, n = tween1.length;i < n; ++i) {
        if (tween1[i].name === name) {
          tween1 = tween1.slice();
          tween1.splice(i, 1);
          break;
        }
      }
    }
    schedule.tween = tween1;
  };
}
function tweenFunction(id, name, value) {
  var tween0, tween1;
  if (typeof value !== "function")
    throw new Error;
  return function() {
    var schedule = set2(this, id), tween = schedule.tween;
    if (tween !== tween0) {
      tween1 = (tween0 = tween).slice();
      for (var t = { name, value }, i = 0, n = tween1.length;i < n; ++i) {
        if (tween1[i].name === name) {
          tween1[i] = t;
          break;
        }
      }
      if (i === n)
        tween1.push(t);
    }
    schedule.tween = tween1;
  };
}
function tween_default(name, value) {
  var id = this._id;
  name += "";
  if (arguments.length < 2) {
    var tween = get2(this.node(), id).tween;
    for (var i = 0, n = tween.length, t;i < n; ++i) {
      if ((t = tween[i]).name === name) {
        return t.value;
      }
    }
    return null;
  }
  return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
}
function tweenValue(transition, name, value) {
  var id = transition._id;
  transition.each(function() {
    var schedule = set2(this, id);
    (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
  });
  return function(node) {
    return get2(node, id).value[name];
  };
}

// node_modules/d3-transition/src/transition/interpolate.js
function interpolate_default(a, b) {
  var c;
  return (typeof b === "number" ? number_default : b instanceof color ? rgb_default : (c = color(b)) ? (b = c, rgb_default) : string_default)(a, b);
}

// node_modules/d3-transition/src/transition/attr.js
function attrRemove2(name) {
  return function() {
    this.removeAttribute(name);
  };
}
function attrRemoveNS2(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant2(name, interpolate, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = this.getAttribute(name);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
  };
}
function attrConstantNS2(fullname, interpolate, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = this.getAttributeNS(fullname.space, fullname.local);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
  };
}
function attrFunction2(name, interpolate, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null)
      return void this.removeAttribute(name);
    string0 = this.getAttribute(name);
    string1 = value1 + "";
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}
function attrFunctionNS2(fullname, interpolate, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null)
      return void this.removeAttributeNS(fullname.space, fullname.local);
    string0 = this.getAttributeNS(fullname.space, fullname.local);
    string1 = value1 + "";
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}
function attr_default2(name, value) {
  var fullname = namespace_default(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate_default;
  return this.attrTween(name, typeof value === "function" ? (fullname.local ? attrFunctionNS2 : attrFunction2)(fullname, i, tweenValue(this, "attr." + name, value)) : value == null ? (fullname.local ? attrRemoveNS2 : attrRemove2)(fullname) : (fullname.local ? attrConstantNS2 : attrConstant2)(fullname, i, value));
}

// node_modules/d3-transition/src/transition/attrTween.js
function attrInterpolate(name, i) {
  return function(t) {
    this.setAttribute(name, i.call(this, t));
  };
}
function attrInterpolateNS(fullname, i) {
  return function(t) {
    this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
  };
}
function attrTweenNS(fullname, value) {
  var t03, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0)
      t03 = (i0 = i) && attrInterpolateNS(fullname, i);
    return t03;
  }
  tween._value = value;
  return tween;
}
function attrTween(name, value) {
  var t03, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0)
      t03 = (i0 = i) && attrInterpolate(name, i);
    return t03;
  }
  tween._value = value;
  return tween;
}
function attrTween_default(name, value) {
  var key = "attr." + name;
  if (arguments.length < 2)
    return (key = this.tween(key)) && key._value;
  if (value == null)
    return this.tween(key, null);
  if (typeof value !== "function")
    throw new Error;
  var fullname = namespace_default(name);
  return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
}

// node_modules/d3-transition/src/transition/delay.js
function delayFunction(id, value) {
  return function() {
    init(this, id).delay = +value.apply(this, arguments);
  };
}
function delayConstant(id, value) {
  return value = +value, function() {
    init(this, id).delay = value;
  };
}
function delay_default(value) {
  var id = this._id;
  return arguments.length ? this.each((typeof value === "function" ? delayFunction : delayConstant)(id, value)) : get2(this.node(), id).delay;
}

// node_modules/d3-transition/src/transition/duration.js
function durationFunction(id, value) {
  return function() {
    set2(this, id).duration = +value.apply(this, arguments);
  };
}
function durationConstant(id, value) {
  return value = +value, function() {
    set2(this, id).duration = value;
  };
}
function duration_default(value) {
  var id = this._id;
  return arguments.length ? this.each((typeof value === "function" ? durationFunction : durationConstant)(id, value)) : get2(this.node(), id).duration;
}

// node_modules/d3-transition/src/transition/ease.js
function easeConstant(id, value) {
  if (typeof value !== "function")
    throw new Error;
  return function() {
    set2(this, id).ease = value;
  };
}
function ease_default(value) {
  var id = this._id;
  return arguments.length ? this.each(easeConstant(id, value)) : get2(this.node(), id).ease;
}

// node_modules/d3-transition/src/transition/easeVarying.js
function easeVarying(id, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (typeof v !== "function")
      throw new Error;
    set2(this, id).ease = v;
  };
}
function easeVarying_default(value) {
  if (typeof value !== "function")
    throw new Error;
  return this.each(easeVarying(this._id, value));
}

// node_modules/d3-transition/src/transition/filter.js
function filter_default2(match) {
  if (typeof match !== "function")
    match = matcher_default(match);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0;j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0;i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }
  return new Transition(subgroups, this._parents, this._name, this._id);
}

// node_modules/d3-transition/src/transition/merge.js
function merge_default2(transition) {
  if (transition._id !== this._id)
    throw new Error;
  for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0;j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0;i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }
  for (;j < m0; ++j) {
    merges[j] = groups0[j];
  }
  return new Transition(merges, this._parents, this._name, this._id);
}

// node_modules/d3-transition/src/transition/on.js
function start(name) {
  return (name + "").trim().split(/^|\s+/).every(function(t) {
    var i = t.indexOf(".");
    if (i >= 0)
      t = t.slice(0, i);
    return !t || t === "start";
  });
}
function onFunction(id, name, listener) {
  var on0, on1, sit = start(name) ? init : set2;
  return function() {
    var schedule = sit(this, id), on = schedule.on;
    if (on !== on0)
      (on1 = (on0 = on).copy()).on(name, listener);
    schedule.on = on1;
  };
}
function on_default2(name, listener) {
  var id = this._id;
  return arguments.length < 2 ? get2(this.node(), id).on.on(name) : this.each(onFunction(id, name, listener));
}

// node_modules/d3-transition/src/transition/remove.js
function removeFunction(id) {
  return function() {
    var parent = this.parentNode;
    for (var i in this.__transition)
      if (+i !== id)
        return;
    if (parent)
      parent.removeChild(this);
  };
}
function remove_default2() {
  return this.on("end.remove", removeFunction(this._id));
}

// node_modules/d3-transition/src/transition/select.js
function select_default3(select) {
  var name = this._name, id = this._id;
  if (typeof select !== "function")
    select = selector_default(select);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0;j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0;i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node)
          subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
        schedule_default(subgroup[i], name, id, i, subgroup, get2(node, id));
      }
    }
  }
  return new Transition(subgroups, this._parents, name, id);
}

// node_modules/d3-transition/src/transition/selectAll.js
function selectAll_default2(select) {
  var name = this._name, id = this._id;
  if (typeof select !== "function")
    select = selectorAll_default(select);
  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0;j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0;i < n; ++i) {
      if (node = group[i]) {
        for (var children2 = select.call(node, node.__data__, i, group), child, inherit = get2(node, id), k = 0, l = children2.length;k < l; ++k) {
          if (child = children2[k]) {
            schedule_default(child, name, id, k, children2, inherit);
          }
        }
        subgroups.push(children2);
        parents.push(node);
      }
    }
  }
  return new Transition(subgroups, parents, name, id);
}

// node_modules/d3-transition/src/transition/selection.js
var Selection2 = selection_default.prototype.constructor;
function selection_default2() {
  return new Selection2(this._groups, this._parents);
}

// node_modules/d3-transition/src/transition/style.js
function styleNull(name, interpolate) {
  var string00, string10, interpolate0;
  return function() {
    var string0 = styleValue(this, name), string1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : interpolate0 = interpolate(string00 = string0, string10 = string1);
  };
}
function styleRemove2(name) {
  return function() {
    this.style.removeProperty(name);
  };
}
function styleConstant2(name, interpolate, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = styleValue(this, name);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
  };
}
function styleFunction2(name, interpolate, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0 = styleValue(this, name), value1 = value(this), string1 = value1 + "";
    if (value1 == null)
      string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}
function styleMaybeRemove(id, name) {
  var on0, on1, listener0, key = "style." + name, event = "end." + key, remove2;
  return function() {
    var schedule = set2(this, id), on = schedule.on, listener = schedule.value[key] == null ? remove2 || (remove2 = styleRemove2(name)) : undefined;
    if (on !== on0 || listener0 !== listener)
      (on1 = (on0 = on).copy()).on(event, listener0 = listener);
    schedule.on = on1;
  };
}
function style_default2(name, value, priority) {
  var i = (name += "") === "transform" ? interpolateTransformCss : interpolate_default;
  return value == null ? this.styleTween(name, styleNull(name, i)).on("end.style." + name, styleRemove2(name)) : typeof value === "function" ? this.styleTween(name, styleFunction2(name, i, tweenValue(this, "style." + name, value))).each(styleMaybeRemove(this._id, name)) : this.styleTween(name, styleConstant2(name, i, value), priority).on("end.style." + name, null);
}

// node_modules/d3-transition/src/transition/styleTween.js
function styleInterpolate(name, i, priority) {
  return function(t) {
    this.style.setProperty(name, i.call(this, t), priority);
  };
}
function styleTween(name, value, priority) {
  var t, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0)
      t = (i0 = i) && styleInterpolate(name, i, priority);
    return t;
  }
  tween._value = value;
  return tween;
}
function styleTween_default(name, value, priority) {
  var key = "style." + (name += "");
  if (arguments.length < 2)
    return (key = this.tween(key)) && key._value;
  if (value == null)
    return this.tween(key, null);
  if (typeof value !== "function")
    throw new Error;
  return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
}

// node_modules/d3-transition/src/transition/text.js
function textConstant2(value) {
  return function() {
    this.textContent = value;
  };
}
function textFunction2(value) {
  return function() {
    var value1 = value(this);
    this.textContent = value1 == null ? "" : value1;
  };
}
function text_default2(value) {
  return this.tween("text", typeof value === "function" ? textFunction2(tweenValue(this, "text", value)) : textConstant2(value == null ? "" : value + ""));
}

// node_modules/d3-transition/src/transition/textTween.js
function textInterpolate(i) {
  return function(t) {
    this.textContent = i.call(this, t);
  };
}
function textTween(value) {
  var t03, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0)
      t03 = (i0 = i) && textInterpolate(i);
    return t03;
  }
  tween._value = value;
  return tween;
}
function textTween_default(value) {
  var key = "text";
  if (arguments.length < 1)
    return (key = this.tween(key)) && key._value;
  if (value == null)
    return this.tween(key, null);
  if (typeof value !== "function")
    throw new Error;
  return this.tween(key, textTween(value));
}

// node_modules/d3-transition/src/transition/transition.js
function transition_default() {
  var name = this._name, id0 = this._id, id1 = newId();
  for (var groups = this._groups, m = groups.length, j = 0;j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0;i < n; ++i) {
      if (node = group[i]) {
        var inherit = get2(node, id0);
        schedule_default(node, name, id1, i, group, {
          time: inherit.time + inherit.delay + inherit.duration,
          delay: 0,
          duration: inherit.duration,
          ease: inherit.ease
        });
      }
    }
  }
  return new Transition(groups, this._parents, name, id1);
}

// node_modules/d3-transition/src/transition/end.js
function end_default() {
  var on0, on1, that = this, id = that._id, size = that.size();
  return new Promise(function(resolve, reject) {
    var cancel = { value: reject }, end = { value: function() {
      if (--size === 0)
        resolve();
    } };
    that.each(function() {
      var schedule = set2(this, id), on = schedule.on;
      if (on !== on0) {
        on1 = (on0 = on).copy();
        on1._.cancel.push(cancel);
        on1._.interrupt.push(cancel);
        on1._.end.push(end);
      }
      schedule.on = on1;
    });
    if (size === 0)
      resolve();
  });
}

// node_modules/d3-transition/src/transition/index.js
var id = 0;
function Transition(groups, parents, name, id2) {
  this._groups = groups;
  this._parents = parents;
  this._name = name;
  this._id = id2;
}
function transition(name) {
  return selection_default().transition(name);
}
function newId() {
  return ++id;
}
var selection_prototype = selection_default.prototype;
Transition.prototype = transition.prototype = {
  constructor: Transition,
  select: select_default3,
  selectAll: selectAll_default2,
  selectChild: selection_prototype.selectChild,
  selectChildren: selection_prototype.selectChildren,
  filter: filter_default2,
  merge: merge_default2,
  selection: selection_default2,
  transition: transition_default,
  call: selection_prototype.call,
  nodes: selection_prototype.nodes,
  node: selection_prototype.node,
  size: selection_prototype.size,
  empty: selection_prototype.empty,
  each: selection_prototype.each,
  on: on_default2,
  attr: attr_default2,
  attrTween: attrTween_default,
  style: style_default2,
  styleTween: styleTween_default,
  text: text_default2,
  textTween: textTween_default,
  remove: remove_default2,
  tween: tween_default,
  delay: delay_default,
  duration: duration_default,
  ease: ease_default,
  easeVarying: easeVarying_default,
  end: end_default,
  [Symbol.iterator]: selection_prototype[Symbol.iterator]
};

// node_modules/d3-ease/src/cubic.js
function cubicInOut(t) {
  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}
// node_modules/d3-transition/src/selection/transition.js
var defaultTiming = {
  time: null,
  delay: 0,
  duration: 250,
  ease: cubicInOut
};
function inherit(node, id2) {
  var timing;
  while (!(timing = node.__transition) || !(timing = timing[id2])) {
    if (!(node = node.parentNode)) {
      throw new Error(`transition ${id2} not found`);
    }
  }
  return timing;
}
function transition_default2(name) {
  var id2, timing;
  if (name instanceof Transition) {
    id2 = name._id, name = name._name;
  } else {
    id2 = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
  }
  for (var groups = this._groups, m = groups.length, j = 0;j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0;i < n; ++i) {
      if (node = group[i]) {
        schedule_default(node, name, id2, i, group, timing || inherit(node, id2));
      }
    }
  }
  return new Transition(groups, this._parents, name, id2);
}

// node_modules/d3-transition/src/selection/index.js
selection_default.prototype.interrupt = interrupt_default2;
selection_default.prototype.transition = transition_default2;

// node_modules/d3-brush/src/brush.js
function number1(e) {
  return [+e[0], +e[1]];
}
function number22(e) {
  return [number1(e[0]), number1(e[1])];
}
var X = {
  name: "x",
  handles: ["w", "e"].map(type),
  input: function(x2, e) {
    return x2 == null ? null : [[+x2[0], e[0][1]], [+x2[1], e[1][1]]];
  },
  output: function(xy) {
    return xy && [xy[0][0], xy[1][0]];
  }
};
var Y = {
  name: "y",
  handles: ["n", "s"].map(type),
  input: function(y2, e) {
    return y2 == null ? null : [[e[0][0], +y2[0]], [e[1][0], +y2[1]]];
  },
  output: function(xy) {
    return xy && [xy[0][1], xy[1][1]];
  }
};
var XY = {
  name: "xy",
  handles: ["n", "w", "e", "s", "nw", "ne", "sw", "se"].map(type),
  input: function(xy) {
    return xy == null ? null : number22(xy);
  },
  output: function(xy) {
    return xy;
  }
};
function type(t) {
  return { type: t };
}
// node_modules/d3-zoom/src/transform.js
function Transform(k, x2, y2) {
  this.k = k;
  this.x = x2;
  this.y = y2;
}
Transform.prototype = {
  constructor: Transform,
  scale: function(k) {
    return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
  },
  translate: function(x2, y2) {
    return x2 === 0 & y2 === 0 ? this : new Transform(this.k, this.x + this.k * x2, this.y + this.k * y2);
  },
  apply: function(point6) {
    return [point6[0] * this.k + this.x, point6[1] * this.k + this.y];
  },
  applyX: function(x2) {
    return x2 * this.k + this.x;
  },
  applyY: function(y2) {
    return y2 * this.k + this.y;
  },
  invert: function(location) {
    return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
  },
  invertX: function(x2) {
    return (x2 - this.x) / this.k;
  },
  invertY: function(y2) {
    return (y2 - this.y) / this.k;
  },
  rescaleX: function(x2) {
    return x2.copy().domain(x2.range().map(this.invertX, this).map(x2.invert, x2));
  },
  rescaleY: function(y2) {
    return y2.copy().domain(y2.range().map(this.invertY, this).map(y2.invert, y2));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};
var identity3 = new Transform(1, 0, 0);
transform.prototype = Transform.prototype;
function transform(node) {
  while (!node.__zoom)
    if (!(node = node.parentNode))
      return identity3;
  return node.__zoom;
}
export { require_dayjs_min, __name, __export, log, setLogLevel, max, min, axisTop, axisBottom, select_default2 as select_default, hcl_default, format2 as format, hierarchy, treemap_default, ordinal, band, linear2 as linear, millisecond, second, timeMinute, timeHour, timeDay, timeSunday, timeMonday, timeTuesday, timeWednesday, timeThursday, timeFriday, timeSaturday, timeMonth, timeFormat, time, Tableau10_default, arc_default, linear_default, line_default, pie_default, bumpX, bumpY, basis_default2 as basis_default, basisClosed_default2 as basisClosed_default, basisOpen_default, bundle_default, cardinal_default, cardinalClosed_default, cardinalOpen_default, catmullRom_default, catmullRomClosed_default, catmullRomOpen_default, linearClosed_default, monotoneX, monotoneY, natural_default, step_default, stepBefore, stepAfter };

//# debugId=7BB356EE45D9E4D664756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2RheWpzL2RheWpzLm1pbi5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbWVybWFpZC9kaXN0L2NodW5rcy9tZXJtYWlkLmNvcmUvY2h1bmstQUdIUkI0SkYubWpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvbWF4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvbWluLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvYXNjZW5kaW5nLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvZGVzY2VuZGluZy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL2Jpc2VjdG9yLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvbnVtYmVyLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvYmlzZWN0LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9pbnRlcm5tYXAvc3JjL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvdGlja3MuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9yYW5nZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtYXhpcy9zcmMvaWRlbnRpdHkuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWF4aXMvc3JjL2F4aXMuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0b3IuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NlbGVjdC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9hcnJheS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3RvckFsbC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vc2VsZWN0QWxsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL21hdGNoZXIuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NlbGVjdENoaWxkLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zZWxlY3RDaGlsZHJlbi5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vZmlsdGVyLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zcGFyc2UuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2VudGVyLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL2NvbnN0YW50LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9kYXRhLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9leGl0LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9qb2luLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9tZXJnZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vb3JkZXIuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NvcnQuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2NhbGwuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL25vZGVzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9ub2RlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zaXplLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9lbXB0eS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vZWFjaC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9uYW1lc3BhY2VzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL25hbWVzcGFjZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vYXR0ci5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy93aW5kb3cuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3N0eWxlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9wcm9wZXJ0eS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vY2xhc3NlZC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vdGV4dC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vaHRtbC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vcmFpc2UuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2xvd2VyLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL2NyZWF0b3IuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2FwcGVuZC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vaW5zZXJ0LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9yZW1vdmUuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2Nsb25lLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9kYXR1bS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vb24uanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2Rpc3BhdGNoLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9pdGVyYXRvci5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vaW5kZXguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1jb2xvci9zcmMvZGVmaW5lLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1jb2xvci9zcmMvY29sb3IuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWNvbG9yL3NyYy9tYXRoLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1jb2xvci9zcmMvbGFiLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvY29uc3RhbnQuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9jb2xvci5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL2hjbC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL2Jhc2lzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvYmFzaXNDbG9zZWQuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9yZ2IuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9udW1iZXJBcnJheS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL2FycmF5LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvZGF0ZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL251bWJlci5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL29iamVjdC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3N0cmluZy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3ZhbHVlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvcm91bmQuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy90cmFuc2Zvcm0vZGVjb21wb3NlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvdHJhbnNmb3JtL3BhcnNlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvdHJhbnNmb3JtL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1mb3JtYXQvc3JjL2Zvcm1hdERlY2ltYWwuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvZXhwb25lbnQuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvZm9ybWF0R3JvdXAuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvZm9ybWF0TnVtZXJhbHMuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvZm9ybWF0U3BlY2lmaWVyLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1mb3JtYXQvc3JjL2Zvcm1hdFRyaW0uanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWZvcm1hdC9zcmMvZm9ybWF0UHJlZml4QXV0by5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtZm9ybWF0L3NyYy9mb3JtYXRSb3VuZGVkLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1mb3JtYXQvc3JjL2Zvcm1hdFR5cGVzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1mb3JtYXQvc3JjL2lkZW50aXR5LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1mb3JtYXQvc3JjL2xvY2FsZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtZm9ybWF0L3NyYy9kZWZhdWx0TG9jYWxlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1mb3JtYXQvc3JjL3ByZWNpc2lvbkZpeGVkLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1mb3JtYXQvc3JjL3ByZWNpc2lvblByZWZpeC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtZm9ybWF0L3NyYy9wcmVjaXNpb25Sb3VuZC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaGllcmFyY2h5L3NyYy9oaWVyYXJjaHkvY291bnQuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWhpZXJhcmNoeS9zcmMvaGllcmFyY2h5L2VhY2guanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWhpZXJhcmNoeS9zcmMvaGllcmFyY2h5L2VhY2hCZWZvcmUuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWhpZXJhcmNoeS9zcmMvaGllcmFyY2h5L2VhY2hBZnRlci5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaGllcmFyY2h5L3NyYy9oaWVyYXJjaHkvZmluZC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaGllcmFyY2h5L3NyYy9oaWVyYXJjaHkvc3VtLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1oaWVyYXJjaHkvc3JjL2hpZXJhcmNoeS9zb3J0LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1oaWVyYXJjaHkvc3JjL2hpZXJhcmNoeS9wYXRoLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1oaWVyYXJjaHkvc3JjL2hpZXJhcmNoeS9hbmNlc3RvcnMuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWhpZXJhcmNoeS9zcmMvaGllcmFyY2h5L2Rlc2NlbmRhbnRzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1oaWVyYXJjaHkvc3JjL2hpZXJhcmNoeS9sZWF2ZXMuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWhpZXJhcmNoeS9zcmMvaGllcmFyY2h5L2xpbmtzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1oaWVyYXJjaHkvc3JjL2hpZXJhcmNoeS9pdGVyYXRvci5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaGllcmFyY2h5L3NyYy9oaWVyYXJjaHkvaW5kZXguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWhpZXJhcmNoeS9zcmMvdHJlZW1hcC9yb3VuZC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaGllcmFyY2h5L3NyYy90cmVlbWFwL2RpY2UuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWhpZXJhcmNoeS9zcmMvdHJlZW1hcC9zbGljZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaGllcmFyY2h5L3NyYy90cmVlbWFwL3NxdWFyaWZ5LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1oaWVyYXJjaHkvc3JjL2FjY2Vzc29ycy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaGllcmFyY2h5L3NyYy9jb25zdGFudC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaGllcmFyY2h5L3NyYy90cmVlbWFwL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvaW5pdC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUvc3JjL29yZGluYWwuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy9iYW5kLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvY29uc3RhbnQuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy9udW1iZXIuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy9jb250aW51b3VzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvdGlja0Zvcm1hdC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUvc3JjL2xpbmVhci5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdGltZS9zcmMvaW50ZXJ2YWwuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRpbWUvc3JjL21pbGxpc2Vjb25kLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy9kdXJhdGlvbi5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdGltZS9zcmMvc2Vjb25kLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy9taW51dGUuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRpbWUvc3JjL2hvdXIuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRpbWUvc3JjL2RheS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdGltZS9zcmMvd2Vlay5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdGltZS9zcmMvbW9udGguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRpbWUvc3JjL3llYXIuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRpbWUvc3JjL3RpY2tzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lLWZvcm1hdC9zcmMvbG9jYWxlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lLWZvcm1hdC9zcmMvZGVmYXVsdExvY2FsZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUvc3JjL25pY2UuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy90aW1lLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS1jaHJvbWF0aWMvc3JjL2NvbG9ycy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUtY2hyb21hdGljL3NyYy9jYXRlZ29yaWNhbC9UYWJsZWF1MTAuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNoYXBlL3NyYy9jb25zdGFudC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL21hdGguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXBhdGgvc3JjL3BhdGguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNoYXBlL3NyYy9wYXRoLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvYXJjLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvYXJyYXkuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNoYXBlL3NyYy9jdXJ2ZS9saW5lYXIuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNoYXBlL3NyYy9wb2ludC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL2xpbmUuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNoYXBlL3NyYy9kZXNjZW5kaW5nLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvaWRlbnRpdHkuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNoYXBlL3NyYy9waWUuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNoYXBlL3NyYy9jdXJ2ZS9iYXNpcy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL2N1cnZlL2J1bXAuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNoYXBlL3NyYy9ub29wLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvY3VydmUvYmFzaXNDbG9zZWQuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNoYXBlL3NyYy9jdXJ2ZS9iYXNpc09wZW4uanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNoYXBlL3NyYy9jdXJ2ZS9idW5kbGUuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNoYXBlL3NyYy9jdXJ2ZS9jYXJkaW5hbC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL2N1cnZlL2NhcmRpbmFsQ2xvc2VkLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvY3VydmUvY2FyZGluYWxPcGVuLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvY3VydmUvY2F0bXVsbFJvbS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL2N1cnZlL2NhdG11bGxSb21DbG9zZWQuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNoYXBlL3NyYy9jdXJ2ZS9jYXRtdWxsUm9tT3Blbi5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL2N1cnZlL2xpbmVhckNsb3NlZC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL2N1cnZlL21vbm90b25lLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvY3VydmUvbmF0dXJhbC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL2N1cnZlL3N0ZXAuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWRpc3BhdGNoL3NyYy9kaXNwYXRjaC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdGltZXIvc3JjL3RpbWVyLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lci9zcmMvdGltZW91dC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zY2hlZHVsZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvaW50ZXJydXB0LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy9zZWxlY3Rpb24vaW50ZXJydXB0LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3R3ZWVuLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2ludGVycG9sYXRlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2F0dHIuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vYXR0clR3ZWVuLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2RlbGF5LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2R1cmF0aW9uLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2Vhc2UuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vZWFzZVZhcnlpbmcuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vZmlsdGVyLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL21lcmdlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL29uLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3JlbW92ZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zZWxlY3QuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vc2VsZWN0QWxsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3NlbGVjdGlvbi5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zdHlsZS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zdHlsZVR3ZWVuLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3RleHQuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vdGV4dFR3ZWVuLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3RyYW5zaXRpb24uanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vZW5kLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1lYXNlL3NyYy9jdWJpYy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvc2VsZWN0aW9uL3RyYW5zaXRpb24uanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3NlbGVjdGlvbi9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtYnJ1c2gvc3JjL2JydXNoLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy16b29tL3NyYy90cmFuc2Zvcm0uanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbCiAgICAiIWZ1bmN0aW9uKHQsZSl7XCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBtb2R1bGU/bW9kdWxlLmV4cG9ydHM9ZSgpOlwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoZSk6KHQ9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGdsb2JhbFRoaXM/Z2xvYmFsVGhpczp0fHxzZWxmKS5kYXlqcz1lKCl9KHRoaXMsKGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7dmFyIHQ9MWUzLGU9NmU0LG49MzZlNSxyPVwibWlsbGlzZWNvbmRcIixpPVwic2Vjb25kXCIscz1cIm1pbnV0ZVwiLHU9XCJob3VyXCIsYT1cImRheVwiLG89XCJ3ZWVrXCIsYz1cIm1vbnRoXCIsZj1cInF1YXJ0ZXJcIixoPVwieWVhclwiLGQ9XCJkYXRlXCIsbD1cIkludmFsaWQgRGF0ZVwiLCQ9L14oXFxkezR9KVstL10/KFxcZHsxLDJ9KT9bLS9dPyhcXGR7MCwyfSlbVHRcXHNdKihcXGR7MSwyfSk/Oj8oXFxkezEsMn0pPzo/KFxcZHsxLDJ9KT9bLjpdPyhcXGQrKT8kLyx5PS9cXFsoW15cXF1dKyldfFlZWVl8WVl8TXsxLDR9fER7MSwyfXxkezEsNH18SHsxLDJ9fGh7MSwyfXxhfEF8bXsxLDJ9fHN7MSwyfXxaezEsMn18U1NTL2csTT17bmFtZTpcImVuXCIsd2Vla2RheXM6XCJTdW5kYXlfTW9uZGF5X1R1ZXNkYXlfV2VkbmVzZGF5X1RodXJzZGF5X0ZyaWRheV9TYXR1cmRheVwiLnNwbGl0KFwiX1wiKSxtb250aHM6XCJKYW51YXJ5X0ZlYnJ1YXJ5X01hcmNoX0FwcmlsX01heV9KdW5lX0p1bHlfQXVndXN0X1NlcHRlbWJlcl9PY3RvYmVyX05vdmVtYmVyX0RlY2VtYmVyXCIuc3BsaXQoXCJfXCIpLG9yZGluYWw6ZnVuY3Rpb24odCl7dmFyIGU9W1widGhcIixcInN0XCIsXCJuZFwiLFwicmRcIl0sbj10JTEwMDtyZXR1cm5cIltcIit0KyhlWyhuLTIwKSUxMF18fGVbbl18fGVbMF0pK1wiXVwifX0sbT1mdW5jdGlvbih0LGUsbil7dmFyIHI9U3RyaW5nKHQpO3JldHVybiFyfHxyLmxlbmd0aD49ZT90OlwiXCIrQXJyYXkoZSsxLXIubGVuZ3RoKS5qb2luKG4pK3R9LHY9e3M6bSx6OmZ1bmN0aW9uKHQpe3ZhciBlPS10LnV0Y09mZnNldCgpLG49TWF0aC5hYnMoZSkscj1NYXRoLmZsb29yKG4vNjApLGk9biU2MDtyZXR1cm4oZTw9MD9cIitcIjpcIi1cIikrbShyLDIsXCIwXCIpK1wiOlwiK20oaSwyLFwiMFwiKX0sbTpmdW5jdGlvbiB0KGUsbil7aWYoZS5kYXRlKCk8bi5kYXRlKCkpcmV0dXJuLXQobixlKTt2YXIgcj0xMioobi55ZWFyKCktZS55ZWFyKCkpKyhuLm1vbnRoKCktZS5tb250aCgpKSxpPWUuY2xvbmUoKS5hZGQocixjKSxzPW4taTwwLHU9ZS5jbG9uZSgpLmFkZChyKyhzPy0xOjEpLGMpO3JldHVybisoLShyKyhuLWkpLyhzP2ktdTp1LWkpKXx8MCl9LGE6ZnVuY3Rpb24odCl7cmV0dXJuIHQ8MD9NYXRoLmNlaWwodCl8fDA6TWF0aC5mbG9vcih0KX0scDpmdW5jdGlvbih0KXtyZXR1cm57TTpjLHk6aCx3Om8sZDphLEQ6ZCxoOnUsbTpzLHM6aSxtczpyLFE6Zn1bdF18fFN0cmluZyh0fHxcIlwiKS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL3MkLyxcIlwiKX0sdTpmdW5jdGlvbih0KXtyZXR1cm4gdm9pZCAwPT09dH19LGc9XCJlblwiLEQ9e307RFtnXT1NO3ZhciBwPVwiJGlzRGF5anNPYmplY3RcIixTPWZ1bmN0aW9uKHQpe3JldHVybiB0IGluc3RhbmNlb2YgX3x8ISghdHx8IXRbcF0pfSx3PWZ1bmN0aW9uIHQoZSxuLHIpe3ZhciBpO2lmKCFlKXJldHVybiBnO2lmKFwic3RyaW5nXCI9PXR5cGVvZiBlKXt2YXIgcz1lLnRvTG93ZXJDYXNlKCk7RFtzXSYmKGk9cyksbiYmKERbc109bixpPXMpO3ZhciB1PWUuc3BsaXQoXCItXCIpO2lmKCFpJiZ1Lmxlbmd0aD4xKXJldHVybiB0KHVbMF0pfWVsc2V7dmFyIGE9ZS5uYW1lO0RbYV09ZSxpPWF9cmV0dXJuIXImJmkmJihnPWkpLGl8fCFyJiZnfSxPPWZ1bmN0aW9uKHQsZSl7aWYoUyh0KSlyZXR1cm4gdC5jbG9uZSgpO3ZhciBuPVwib2JqZWN0XCI9PXR5cGVvZiBlP2U6e307cmV0dXJuIG4uZGF0ZT10LG4uYXJncz1hcmd1bWVudHMsbmV3IF8obil9LGI9djtiLmw9dyxiLmk9UyxiLnc9ZnVuY3Rpb24odCxlKXtyZXR1cm4gTyh0LHtsb2NhbGU6ZS4kTCx1dGM6ZS4kdSx4OmUuJHgsJG9mZnNldDplLiRvZmZzZXR9KX07dmFyIF89ZnVuY3Rpb24oKXtmdW5jdGlvbiBNKHQpe3RoaXMuJEw9dyh0LmxvY2FsZSxudWxsLCEwKSx0aGlzLnBhcnNlKHQpLHRoaXMuJHg9dGhpcy4keHx8dC54fHx7fSx0aGlzW3BdPSEwfXZhciBtPU0ucHJvdG90eXBlO3JldHVybiBtLnBhcnNlPWZ1bmN0aW9uKHQpe3RoaXMuJGQ9ZnVuY3Rpb24odCl7dmFyIGU9dC5kYXRlLG49dC51dGM7aWYobnVsbD09PWUpcmV0dXJuIG5ldyBEYXRlKE5hTik7aWYoYi51KGUpKXJldHVybiBuZXcgRGF0ZTtpZihlIGluc3RhbmNlb2YgRGF0ZSlyZXR1cm4gbmV3IERhdGUoZSk7aWYoXCJzdHJpbmdcIj09dHlwZW9mIGUmJiEvWiQvaS50ZXN0KGUpKXt2YXIgcj1lLm1hdGNoKCQpO2lmKHIpe3ZhciBpPXJbMl0tMXx8MCxzPShyWzddfHxcIjBcIikuc3Vic3RyaW5nKDAsMyk7cmV0dXJuIG4/bmV3IERhdGUoRGF0ZS5VVEMoclsxXSxpLHJbM118fDEscls0XXx8MCxyWzVdfHwwLHJbNl18fDAscykpOm5ldyBEYXRlKHJbMV0saSxyWzNdfHwxLHJbNF18fDAscls1XXx8MCxyWzZdfHwwLHMpfX1yZXR1cm4gbmV3IERhdGUoZSl9KHQpLHRoaXMuaW5pdCgpfSxtLmluaXQ9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLiRkO3RoaXMuJHk9dC5nZXRGdWxsWWVhcigpLHRoaXMuJE09dC5nZXRNb250aCgpLHRoaXMuJEQ9dC5nZXREYXRlKCksdGhpcy4kVz10LmdldERheSgpLHRoaXMuJEg9dC5nZXRIb3VycygpLHRoaXMuJG09dC5nZXRNaW51dGVzKCksdGhpcy4kcz10LmdldFNlY29uZHMoKSx0aGlzLiRtcz10LmdldE1pbGxpc2Vjb25kcygpfSxtLiR1dGlscz1mdW5jdGlvbigpe3JldHVybiBifSxtLmlzVmFsaWQ9ZnVuY3Rpb24oKXtyZXR1cm4hKHRoaXMuJGQudG9TdHJpbmcoKT09PWwpfSxtLmlzU2FtZT1mdW5jdGlvbih0LGUpe3ZhciBuPU8odCk7cmV0dXJuIHRoaXMuc3RhcnRPZihlKTw9biYmbjw9dGhpcy5lbmRPZihlKX0sbS5pc0FmdGVyPWZ1bmN0aW9uKHQsZSl7cmV0dXJuIE8odCk8dGhpcy5zdGFydE9mKGUpfSxtLmlzQmVmb3JlPWZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRoaXMuZW5kT2YoZSk8Tyh0KX0sbS4kZz1mdW5jdGlvbih0LGUsbil7cmV0dXJuIGIudSh0KT90aGlzW2VdOnRoaXMuc2V0KG4sdCl9LG0udW5peD1mdW5jdGlvbigpe3JldHVybiBNYXRoLmZsb29yKHRoaXMudmFsdWVPZigpLzFlMyl9LG0udmFsdWVPZj1mdW5jdGlvbigpe3JldHVybiB0aGlzLiRkLmdldFRpbWUoKX0sbS5zdGFydE9mPWZ1bmN0aW9uKHQsZSl7dmFyIG49dGhpcyxyPSEhYi51KGUpfHxlLGY9Yi5wKHQpLGw9ZnVuY3Rpb24odCxlKXt2YXIgaT1iLncobi4kdT9EYXRlLlVUQyhuLiR5LGUsdCk6bmV3IERhdGUobi4keSxlLHQpLG4pO3JldHVybiByP2k6aS5lbmRPZihhKX0sJD1mdW5jdGlvbih0LGUpe3JldHVybiBiLncobi50b0RhdGUoKVt0XS5hcHBseShuLnRvRGF0ZShcInNcIiksKHI/WzAsMCwwLDBdOlsyMyw1OSw1OSw5OTldKS5zbGljZShlKSksbil9LHk9dGhpcy4kVyxNPXRoaXMuJE0sbT10aGlzLiRELHY9XCJzZXRcIisodGhpcy4kdT9cIlVUQ1wiOlwiXCIpO3N3aXRjaChmKXtjYXNlIGg6cmV0dXJuIHI/bCgxLDApOmwoMzEsMTEpO2Nhc2UgYzpyZXR1cm4gcj9sKDEsTSk6bCgwLE0rMSk7Y2FzZSBvOnZhciBnPXRoaXMuJGxvY2FsZSgpLndlZWtTdGFydHx8MCxEPSh5PGc/eSs3OnkpLWc7cmV0dXJuIGwocj9tLUQ6bSsoNi1EKSxNKTtjYXNlIGE6Y2FzZSBkOnJldHVybiAkKHYrXCJIb3Vyc1wiLDApO2Nhc2UgdTpyZXR1cm4gJCh2K1wiTWludXRlc1wiLDEpO2Nhc2UgczpyZXR1cm4gJCh2K1wiU2Vjb25kc1wiLDIpO2Nhc2UgaTpyZXR1cm4gJCh2K1wiTWlsbGlzZWNvbmRzXCIsMyk7ZGVmYXVsdDpyZXR1cm4gdGhpcy5jbG9uZSgpfX0sbS5lbmRPZj1mdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5zdGFydE9mKHQsITEpfSxtLiRzZXQ9ZnVuY3Rpb24odCxlKXt2YXIgbixvPWIucCh0KSxmPVwic2V0XCIrKHRoaXMuJHU/XCJVVENcIjpcIlwiKSxsPShuPXt9LG5bYV09ZitcIkRhdGVcIixuW2RdPWYrXCJEYXRlXCIsbltjXT1mK1wiTW9udGhcIixuW2hdPWYrXCJGdWxsWWVhclwiLG5bdV09ZitcIkhvdXJzXCIsbltzXT1mK1wiTWludXRlc1wiLG5baV09ZitcIlNlY29uZHNcIixuW3JdPWYrXCJNaWxsaXNlY29uZHNcIixuKVtvXSwkPW89PT1hP3RoaXMuJEQrKGUtdGhpcy4kVyk6ZTtpZihvPT09Y3x8bz09PWgpe3ZhciB5PXRoaXMuY2xvbmUoKS5zZXQoZCwxKTt5LiRkW2xdKCQpLHkuaW5pdCgpLHRoaXMuJGQ9eS5zZXQoZCxNYXRoLm1pbih0aGlzLiRELHkuZGF5c0luTW9udGgoKSkpLiRkfWVsc2UgbCYmdGhpcy4kZFtsXSgkKTtyZXR1cm4gdGhpcy5pbml0KCksdGhpc30sbS5zZXQ9ZnVuY3Rpb24odCxlKXtyZXR1cm4gdGhpcy5jbG9uZSgpLiRzZXQodCxlKX0sbS5nZXQ9ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXNbYi5wKHQpXSgpfSxtLmFkZD1mdW5jdGlvbihyLGYpe3ZhciBkLGw9dGhpcztyPU51bWJlcihyKTt2YXIgJD1iLnAoZikseT1mdW5jdGlvbih0KXt2YXIgZT1PKGwpO3JldHVybiBiLncoZS5kYXRlKGUuZGF0ZSgpK01hdGgucm91bmQodCpyKSksbCl9O2lmKCQ9PT1jKXJldHVybiB0aGlzLnNldChjLHRoaXMuJE0rcik7aWYoJD09PWgpcmV0dXJuIHRoaXMuc2V0KGgsdGhpcy4keStyKTtpZigkPT09YSlyZXR1cm4geSgxKTtpZigkPT09bylyZXR1cm4geSg3KTt2YXIgTT0oZD17fSxkW3NdPWUsZFt1XT1uLGRbaV09dCxkKVskXXx8MSxtPXRoaXMuJGQuZ2V0VGltZSgpK3IqTTtyZXR1cm4gYi53KG0sdGhpcyl9LG0uc3VidHJhY3Q9ZnVuY3Rpb24odCxlKXtyZXR1cm4gdGhpcy5hZGQoLTEqdCxlKX0sbS5mb3JtYXQ9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcyxuPXRoaXMuJGxvY2FsZSgpO2lmKCF0aGlzLmlzVmFsaWQoKSlyZXR1cm4gbi5pbnZhbGlkRGF0ZXx8bDt2YXIgcj10fHxcIllZWVktTU0tRERUSEg6bW06c3NaXCIsaT1iLnoodGhpcykscz10aGlzLiRILHU9dGhpcy4kbSxhPXRoaXMuJE0sbz1uLndlZWtkYXlzLGM9bi5tb250aHMsZj1uLm1lcmlkaWVtLGg9ZnVuY3Rpb24odCxuLGkscyl7cmV0dXJuIHQmJih0W25dfHx0KGUscikpfHxpW25dLnNsaWNlKDAscyl9LGQ9ZnVuY3Rpb24odCl7cmV0dXJuIGIucyhzJTEyfHwxMix0LFwiMFwiKX0sJD1mfHxmdW5jdGlvbih0LGUsbil7dmFyIHI9dDwxMj9cIkFNXCI6XCJQTVwiO3JldHVybiBuP3IudG9Mb3dlckNhc2UoKTpyfTtyZXR1cm4gci5yZXBsYWNlKHksKGZ1bmN0aW9uKHQscil7cmV0dXJuIHJ8fGZ1bmN0aW9uKHQpe3N3aXRjaCh0KXtjYXNlXCJZWVwiOnJldHVybiBTdHJpbmcoZS4keSkuc2xpY2UoLTIpO2Nhc2VcIllZWVlcIjpyZXR1cm4gYi5zKGUuJHksNCxcIjBcIik7Y2FzZVwiTVwiOnJldHVybiBhKzE7Y2FzZVwiTU1cIjpyZXR1cm4gYi5zKGErMSwyLFwiMFwiKTtjYXNlXCJNTU1cIjpyZXR1cm4gaChuLm1vbnRoc1Nob3J0LGEsYywzKTtjYXNlXCJNTU1NXCI6cmV0dXJuIGgoYyxhKTtjYXNlXCJEXCI6cmV0dXJuIGUuJEQ7Y2FzZVwiRERcIjpyZXR1cm4gYi5zKGUuJEQsMixcIjBcIik7Y2FzZVwiZFwiOnJldHVybiBTdHJpbmcoZS4kVyk7Y2FzZVwiZGRcIjpyZXR1cm4gaChuLndlZWtkYXlzTWluLGUuJFcsbywyKTtjYXNlXCJkZGRcIjpyZXR1cm4gaChuLndlZWtkYXlzU2hvcnQsZS4kVyxvLDMpO2Nhc2VcImRkZGRcIjpyZXR1cm4gb1tlLiRXXTtjYXNlXCJIXCI6cmV0dXJuIFN0cmluZyhzKTtjYXNlXCJISFwiOnJldHVybiBiLnMocywyLFwiMFwiKTtjYXNlXCJoXCI6cmV0dXJuIGQoMSk7Y2FzZVwiaGhcIjpyZXR1cm4gZCgyKTtjYXNlXCJhXCI6cmV0dXJuICQocyx1LCEwKTtjYXNlXCJBXCI6cmV0dXJuICQocyx1LCExKTtjYXNlXCJtXCI6cmV0dXJuIFN0cmluZyh1KTtjYXNlXCJtbVwiOnJldHVybiBiLnModSwyLFwiMFwiKTtjYXNlXCJzXCI6cmV0dXJuIFN0cmluZyhlLiRzKTtjYXNlXCJzc1wiOnJldHVybiBiLnMoZS4kcywyLFwiMFwiKTtjYXNlXCJTU1NcIjpyZXR1cm4gYi5zKGUuJG1zLDMsXCIwXCIpO2Nhc2VcIlpcIjpyZXR1cm4gaX1yZXR1cm4gbnVsbH0odCl8fGkucmVwbGFjZShcIjpcIixcIlwiKX0pKX0sbS51dGNPZmZzZXQ9ZnVuY3Rpb24oKXtyZXR1cm4gMTUqLU1hdGgucm91bmQodGhpcy4kZC5nZXRUaW1lem9uZU9mZnNldCgpLzE1KX0sbS5kaWZmPWZ1bmN0aW9uKHIsZCxsKXt2YXIgJCx5PXRoaXMsTT1iLnAoZCksbT1PKHIpLHY9KG0udXRjT2Zmc2V0KCktdGhpcy51dGNPZmZzZXQoKSkqZSxnPXRoaXMtbSxEPWZ1bmN0aW9uKCl7cmV0dXJuIGIubSh5LG0pfTtzd2l0Y2goTSl7Y2FzZSBoOiQ9RCgpLzEyO2JyZWFrO2Nhc2UgYzokPUQoKTticmVhaztjYXNlIGY6JD1EKCkvMzticmVhaztjYXNlIG86JD0oZy12KS82MDQ4ZTU7YnJlYWs7Y2FzZSBhOiQ9KGctdikvODY0ZTU7YnJlYWs7Y2FzZSB1OiQ9Zy9uO2JyZWFrO2Nhc2UgczokPWcvZTticmVhaztjYXNlIGk6JD1nL3Q7YnJlYWs7ZGVmYXVsdDokPWd9cmV0dXJuIGw/JDpiLmEoJCl9LG0uZGF5c0luTW9udGg9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5lbmRPZihjKS4kRH0sbS4kbG9jYWxlPWZ1bmN0aW9uKCl7cmV0dXJuIERbdGhpcy4kTF19LG0ubG9jYWxlPWZ1bmN0aW9uKHQsZSl7aWYoIXQpcmV0dXJuIHRoaXMuJEw7dmFyIG49dGhpcy5jbG9uZSgpLHI9dyh0LGUsITApO3JldHVybiByJiYobi4kTD1yKSxufSxtLmNsb25lPWZ1bmN0aW9uKCl7cmV0dXJuIGIudyh0aGlzLiRkLHRoaXMpfSxtLnRvRGF0ZT1mdW5jdGlvbigpe3JldHVybiBuZXcgRGF0ZSh0aGlzLnZhbHVlT2YoKSl9LG0udG9KU09OPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuaXNWYWxpZCgpP3RoaXMudG9JU09TdHJpbmcoKTpudWxsfSxtLnRvSVNPU3RyaW5nPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuJGQudG9JU09TdHJpbmcoKX0sbS50b1N0cmluZz1mdW5jdGlvbigpe3JldHVybiB0aGlzLiRkLnRvVVRDU3RyaW5nKCl9LE19KCksWT1fLnByb3RvdHlwZTtyZXR1cm4gTy5wcm90b3R5cGU9WSxbW1wiJG1zXCIscl0sW1wiJHNcIixpXSxbXCIkbVwiLHNdLFtcIiRIXCIsdV0sW1wiJFdcIixhXSxbXCIkTVwiLGNdLFtcIiR5XCIsaF0sW1wiJERcIixkXV0uZm9yRWFjaCgoZnVuY3Rpb24odCl7WVt0WzFdXT1mdW5jdGlvbihlKXtyZXR1cm4gdGhpcy4kZyhlLHRbMF0sdFsxXSl9fSkpLE8uZXh0ZW5kPWZ1bmN0aW9uKHQsZSl7cmV0dXJuIHQuJGl8fCh0KGUsXyxPKSx0LiRpPSEwKSxPfSxPLmxvY2FsZT13LE8uaXNEYXlqcz1TLE8udW5peD1mdW5jdGlvbih0KXtyZXR1cm4gTygxZTMqdCl9LE8uZW49RFtnXSxPLkxzPUQsTy5wPXt9LE99KSk7IiwKICAgICJ2YXIgX19kZWZQcm9wID0gT2JqZWN0LmRlZmluZVByb3BlcnR5O1xudmFyIF9fbmFtZSA9ICh0YXJnZXQsIHZhbHVlKSA9PiBfX2RlZlByb3AodGFyZ2V0LCBcIm5hbWVcIiwgeyB2YWx1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0pO1xudmFyIF9fZXhwb3J0ID0gKHRhcmdldCwgYWxsKSA9PiB7XG4gIGZvciAodmFyIG5hbWUgaW4gYWxsKVxuICAgIF9fZGVmUHJvcCh0YXJnZXQsIG5hbWUsIHsgZ2V0OiBhbGxbbmFtZV0sIGVudW1lcmFibGU6IHRydWUgfSk7XG59O1xuXG4vLyBzcmMvbG9nZ2VyLnRzXG5pbXBvcnQgZGF5anMgZnJvbSBcImRheWpzXCI7XG52YXIgTEVWRUxTID0ge1xuICB0cmFjZTogMCxcbiAgZGVidWc6IDEsXG4gIGluZm86IDIsXG4gIHdhcm46IDMsXG4gIGVycm9yOiA0LFxuICBmYXRhbDogNVxufTtcbnZhciBsb2cgPSB7XG4gIHRyYWNlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKCguLi5fYXJncykgPT4ge1xuICB9LCBcInRyYWNlXCIpLFxuICBkZWJ1ZzogLyogQF9fUFVSRV9fICovIF9fbmFtZSgoLi4uX2FyZ3MpID0+IHtcbiAgfSwgXCJkZWJ1Z1wiKSxcbiAgaW5mbzogLyogQF9fUFVSRV9fICovIF9fbmFtZSgoLi4uX2FyZ3MpID0+IHtcbiAgfSwgXCJpbmZvXCIpLFxuICB3YXJuOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKCguLi5fYXJncykgPT4ge1xuICB9LCBcIndhcm5cIiksXG4gIGVycm9yOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKCguLi5fYXJncykgPT4ge1xuICB9LCBcImVycm9yXCIpLFxuICBmYXRhbDogLyogQF9fUFVSRV9fICovIF9fbmFtZSgoLi4uX2FyZ3MpID0+IHtcbiAgfSwgXCJmYXRhbFwiKVxufTtcbnZhciBzZXRMb2dMZXZlbCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24obGV2ZWwgPSBcImZhdGFsXCIpIHtcbiAgbGV0IG51bWVyaWNMZXZlbCA9IExFVkVMUy5mYXRhbDtcbiAgaWYgKHR5cGVvZiBsZXZlbCA9PT0gXCJzdHJpbmdcIikge1xuICAgIGlmIChsZXZlbC50b0xvd2VyQ2FzZSgpIGluIExFVkVMUykge1xuICAgICAgbnVtZXJpY0xldmVsID0gTEVWRUxTW2xldmVsXTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIGxldmVsID09PSBcIm51bWJlclwiKSB7XG4gICAgbnVtZXJpY0xldmVsID0gbGV2ZWw7XG4gIH1cbiAgbG9nLnRyYWNlID0gKCkgPT4ge1xuICB9O1xuICBsb2cuZGVidWcgPSAoKSA9PiB7XG4gIH07XG4gIGxvZy5pbmZvID0gKCkgPT4ge1xuICB9O1xuICBsb2cud2FybiA9ICgpID0+IHtcbiAgfTtcbiAgbG9nLmVycm9yID0gKCkgPT4ge1xuICB9O1xuICBsb2cuZmF0YWwgPSAoKSA9PiB7XG4gIH07XG4gIGlmIChudW1lcmljTGV2ZWwgPD0gTEVWRUxTLmZhdGFsKSB7XG4gICAgbG9nLmZhdGFsID0gY29uc29sZS5lcnJvciA/IGNvbnNvbGUuZXJyb3IuYmluZChjb25zb2xlLCBmb3JtYXQoXCJGQVRBTFwiKSwgXCJjb2xvcjogb3JhbmdlXCIpIDogY29uc29sZS5sb2cuYmluZChjb25zb2xlLCBcIlxceDFCWzM1bVwiLCBmb3JtYXQoXCJGQVRBTFwiKSk7XG4gIH1cbiAgaWYgKG51bWVyaWNMZXZlbCA8PSBMRVZFTFMuZXJyb3IpIHtcbiAgICBsb2cuZXJyb3IgPSBjb25zb2xlLmVycm9yID8gY29uc29sZS5lcnJvci5iaW5kKGNvbnNvbGUsIGZvcm1hdChcIkVSUk9SXCIpLCBcImNvbG9yOiBvcmFuZ2VcIikgOiBjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUsIFwiXFx4MUJbMzFtXCIsIGZvcm1hdChcIkVSUk9SXCIpKTtcbiAgfVxuICBpZiAobnVtZXJpY0xldmVsIDw9IExFVkVMUy53YXJuKSB7XG4gICAgbG9nLndhcm4gPSBjb25zb2xlLndhcm4gPyBjb25zb2xlLndhcm4uYmluZChjb25zb2xlLCBmb3JtYXQoXCJXQVJOXCIpLCBcImNvbG9yOiBvcmFuZ2VcIikgOiBjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUsIGBcXHgxQlszM21gLCBmb3JtYXQoXCJXQVJOXCIpKTtcbiAgfVxuICBpZiAobnVtZXJpY0xldmVsIDw9IExFVkVMUy5pbmZvKSB7XG4gICAgbG9nLmluZm8gPSBjb25zb2xlLmluZm8gPyBjb25zb2xlLmluZm8uYmluZChjb25zb2xlLCBmb3JtYXQoXCJJTkZPXCIpLCBcImNvbG9yOiBsaWdodGJsdWVcIikgOiBjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUsIFwiXFx4MUJbMzRtXCIsIGZvcm1hdChcIklORk9cIikpO1xuICB9XG4gIGlmIChudW1lcmljTGV2ZWwgPD0gTEVWRUxTLmRlYnVnKSB7XG4gICAgbG9nLmRlYnVnID0gY29uc29sZS5kZWJ1ZyA/IGNvbnNvbGUuZGVidWcuYmluZChjb25zb2xlLCBmb3JtYXQoXCJERUJVR1wiKSwgXCJjb2xvcjogbGlnaHRncmVlblwiKSA6IGNvbnNvbGUubG9nLmJpbmQoY29uc29sZSwgXCJcXHgxQlszMm1cIiwgZm9ybWF0KFwiREVCVUdcIikpO1xuICB9XG4gIGlmIChudW1lcmljTGV2ZWwgPD0gTEVWRUxTLnRyYWNlKSB7XG4gICAgbG9nLnRyYWNlID0gY29uc29sZS5kZWJ1ZyA/IGNvbnNvbGUuZGVidWcuYmluZChjb25zb2xlLCBmb3JtYXQoXCJUUkFDRVwiKSwgXCJjb2xvcjogbGlnaHRncmVlblwiKSA6IGNvbnNvbGUubG9nLmJpbmQoY29uc29sZSwgXCJcXHgxQlszMm1cIiwgZm9ybWF0KFwiVFJBQ0VcIikpO1xuICB9XG59LCBcInNldExvZ0xldmVsXCIpO1xudmFyIGZvcm1hdCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGxldmVsKSA9PiB7XG4gIGNvbnN0IHRpbWUgPSBkYXlqcygpLmZvcm1hdChcInNzLlNTU1wiKTtcbiAgcmV0dXJuIGAlYyR7dGltZX0gOiAke2xldmVsfSA6IGA7XG59LCBcImZvcm1hdFwiKTtcblxuZXhwb3J0IHtcbiAgX19uYW1lLFxuICBfX2V4cG9ydCxcbiAgbG9nLFxuICBzZXRMb2dMZXZlbFxufTtcbiIsCiAgICAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbWF4KHZhbHVlcywgdmFsdWVvZikge1xuICBsZXQgbWF4O1xuICBpZiAodmFsdWVvZiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZm9yIChjb25zdCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICAgIGlmICh2YWx1ZSAhPSBudWxsXG4gICAgICAgICAgJiYgKG1heCA8IHZhbHVlIHx8IChtYXggPT09IHVuZGVmaW5lZCAmJiB2YWx1ZSA+PSB2YWx1ZSkpKSB7XG4gICAgICAgIG1heCA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBsZXQgaW5kZXggPSAtMTtcbiAgICBmb3IgKGxldCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICAgIGlmICgodmFsdWUgPSB2YWx1ZW9mKHZhbHVlLCArK2luZGV4LCB2YWx1ZXMpKSAhPSBudWxsXG4gICAgICAgICAgJiYgKG1heCA8IHZhbHVlIHx8IChtYXggPT09IHVuZGVmaW5lZCAmJiB2YWx1ZSA+PSB2YWx1ZSkpKSB7XG4gICAgICAgIG1heCA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gbWF4O1xufVxuIiwKICAgICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtaW4odmFsdWVzLCB2YWx1ZW9mKSB7XG4gIGxldCBtaW47XG4gIGlmICh2YWx1ZW9mID09PSB1bmRlZmluZWQpIHtcbiAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgaWYgKHZhbHVlICE9IG51bGxcbiAgICAgICAgICAmJiAobWluID4gdmFsdWUgfHwgKG1pbiA9PT0gdW5kZWZpbmVkICYmIHZhbHVlID49IHZhbHVlKSkpIHtcbiAgICAgICAgbWluID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGxldCBpbmRleCA9IC0xO1xuICAgIGZvciAobGV0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgaWYgKCh2YWx1ZSA9IHZhbHVlb2YodmFsdWUsICsraW5kZXgsIHZhbHVlcykpICE9IG51bGxcbiAgICAgICAgICAmJiAobWluID4gdmFsdWUgfHwgKG1pbiA9PT0gdW5kZWZpbmVkICYmIHZhbHVlID49IHZhbHVlKSkpIHtcbiAgICAgICAgbWluID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBtaW47XG59XG4iLAogICAgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFzY2VuZGluZyhhLCBiKSB7XG4gIHJldHVybiBhID09IG51bGwgfHwgYiA9PSBudWxsID8gTmFOIDogYSA8IGIgPyAtMSA6IGEgPiBiID8gMSA6IGEgPj0gYiA/IDAgOiBOYU47XG59XG4iLAogICAgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlc2NlbmRpbmcoYSwgYikge1xuICByZXR1cm4gYSA9PSBudWxsIHx8IGIgPT0gbnVsbCA/IE5hTlxuICAgIDogYiA8IGEgPyAtMVxuICAgIDogYiA+IGEgPyAxXG4gICAgOiBiID49IGEgPyAwXG4gICAgOiBOYU47XG59XG4iLAogICAgImltcG9ydCBhc2NlbmRpbmcgZnJvbSBcIi4vYXNjZW5kaW5nLmpzXCI7XG5pbXBvcnQgZGVzY2VuZGluZyBmcm9tIFwiLi9kZXNjZW5kaW5nLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGJpc2VjdG9yKGYpIHtcbiAgbGV0IGNvbXBhcmUxLCBjb21wYXJlMiwgZGVsdGE7XG5cbiAgLy8gSWYgYW4gYWNjZXNzb3IgaXMgc3BlY2lmaWVkLCBwcm9tb3RlIGl0IHRvIGEgY29tcGFyYXRvci4gSW4gdGhpcyBjYXNlIHdlXG4gIC8vIGNhbiB0ZXN0IHdoZXRoZXIgdGhlIHNlYXJjaCB2YWx1ZSBpcyAoc2VsZi0pIGNvbXBhcmFibGUuIFdlIGNhbuKAmXQgZG8gdGhpc1xuICAvLyBmb3IgYSBjb21wYXJhdG9yIChleGNlcHQgZm9yIHNwZWNpZmljLCBrbm93biBjb21wYXJhdG9ycykgYmVjYXVzZSB3ZSBjYW7igJl0XG4gIC8vIHRlbGwgaWYgdGhlIGNvbXBhcmF0b3IgaXMgc3ltbWV0cmljLCBhbmQgYW4gYXN5bW1ldHJpYyBjb21wYXJhdG9yIGNhbuKAmXQgYmVcbiAgLy8gdXNlZCB0byB0ZXN0IHdoZXRoZXIgYSBzaW5nbGUgdmFsdWUgaXMgY29tcGFyYWJsZS5cbiAgaWYgKGYubGVuZ3RoICE9PSAyKSB7XG4gICAgY29tcGFyZTEgPSBhc2NlbmRpbmc7XG4gICAgY29tcGFyZTIgPSAoZCwgeCkgPT4gYXNjZW5kaW5nKGYoZCksIHgpO1xuICAgIGRlbHRhID0gKGQsIHgpID0+IGYoZCkgLSB4O1xuICB9IGVsc2Uge1xuICAgIGNvbXBhcmUxID0gZiA9PT0gYXNjZW5kaW5nIHx8IGYgPT09IGRlc2NlbmRpbmcgPyBmIDogemVybztcbiAgICBjb21wYXJlMiA9IGY7XG4gICAgZGVsdGEgPSBmO1xuICB9XG5cbiAgZnVuY3Rpb24gbGVmdChhLCB4LCBsbyA9IDAsIGhpID0gYS5sZW5ndGgpIHtcbiAgICBpZiAobG8gPCBoaSkge1xuICAgICAgaWYgKGNvbXBhcmUxKHgsIHgpICE9PSAwKSByZXR1cm4gaGk7XG4gICAgICBkbyB7XG4gICAgICAgIGNvbnN0IG1pZCA9IChsbyArIGhpKSA+Pj4gMTtcbiAgICAgICAgaWYgKGNvbXBhcmUyKGFbbWlkXSwgeCkgPCAwKSBsbyA9IG1pZCArIDE7XG4gICAgICAgIGVsc2UgaGkgPSBtaWQ7XG4gICAgICB9IHdoaWxlIChsbyA8IGhpKTtcbiAgICB9XG4gICAgcmV0dXJuIGxvO1xuICB9XG5cbiAgZnVuY3Rpb24gcmlnaHQoYSwgeCwgbG8gPSAwLCBoaSA9IGEubGVuZ3RoKSB7XG4gICAgaWYgKGxvIDwgaGkpIHtcbiAgICAgIGlmIChjb21wYXJlMSh4LCB4KSAhPT0gMCkgcmV0dXJuIGhpO1xuICAgICAgZG8ge1xuICAgICAgICBjb25zdCBtaWQgPSAobG8gKyBoaSkgPj4+IDE7XG4gICAgICAgIGlmIChjb21wYXJlMihhW21pZF0sIHgpIDw9IDApIGxvID0gbWlkICsgMTtcbiAgICAgICAgZWxzZSBoaSA9IG1pZDtcbiAgICAgIH0gd2hpbGUgKGxvIDwgaGkpO1xuICAgIH1cbiAgICByZXR1cm4gbG87XG4gIH1cblxuICBmdW5jdGlvbiBjZW50ZXIoYSwgeCwgbG8gPSAwLCBoaSA9IGEubGVuZ3RoKSB7XG4gICAgY29uc3QgaSA9IGxlZnQoYSwgeCwgbG8sIGhpIC0gMSk7XG4gICAgcmV0dXJuIGkgPiBsbyAmJiBkZWx0YShhW2kgLSAxXSwgeCkgPiAtZGVsdGEoYVtpXSwgeCkgPyBpIC0gMSA6IGk7XG4gIH1cblxuICByZXR1cm4ge2xlZnQsIGNlbnRlciwgcmlnaHR9O1xufVxuXG5mdW5jdGlvbiB6ZXJvKCkge1xuICByZXR1cm4gMDtcbn1cbiIsCiAgICAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbnVtYmVyKHgpIHtcbiAgcmV0dXJuIHggPT09IG51bGwgPyBOYU4gOiAreDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uKiBudW1iZXJzKHZhbHVlcywgdmFsdWVvZikge1xuICBpZiAodmFsdWVvZiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZm9yIChsZXQgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgICBpZiAodmFsdWUgIT0gbnVsbCAmJiAodmFsdWUgPSArdmFsdWUpID49IHZhbHVlKSB7XG4gICAgICAgIHlpZWxkIHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBsZXQgaW5kZXggPSAtMTtcbiAgICBmb3IgKGxldCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICAgIGlmICgodmFsdWUgPSB2YWx1ZW9mKHZhbHVlLCArK2luZGV4LCB2YWx1ZXMpKSAhPSBudWxsICYmICh2YWx1ZSA9ICt2YWx1ZSkgPj0gdmFsdWUpIHtcbiAgICAgICAgeWllbGQgdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLAogICAgImltcG9ydCBhc2NlbmRpbmcgZnJvbSBcIi4vYXNjZW5kaW5nLmpzXCI7XG5pbXBvcnQgYmlzZWN0b3IgZnJvbSBcIi4vYmlzZWN0b3IuanNcIjtcbmltcG9ydCBudW1iZXIgZnJvbSBcIi4vbnVtYmVyLmpzXCI7XG5cbmNvbnN0IGFzY2VuZGluZ0Jpc2VjdCA9IGJpc2VjdG9yKGFzY2VuZGluZyk7XG5leHBvcnQgY29uc3QgYmlzZWN0UmlnaHQgPSBhc2NlbmRpbmdCaXNlY3QucmlnaHQ7XG5leHBvcnQgY29uc3QgYmlzZWN0TGVmdCA9IGFzY2VuZGluZ0Jpc2VjdC5sZWZ0O1xuZXhwb3J0IGNvbnN0IGJpc2VjdENlbnRlciA9IGJpc2VjdG9yKG51bWJlcikuY2VudGVyO1xuZXhwb3J0IGRlZmF1bHQgYmlzZWN0UmlnaHQ7XG4iLAogICAgImV4cG9ydCBjbGFzcyBJbnRlcm5NYXAgZXh0ZW5kcyBNYXAge1xuICBjb25zdHJ1Y3RvcihlbnRyaWVzLCBrZXkgPSBrZXlvZikge1xuICAgIHN1cGVyKCk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge19pbnRlcm46IHt2YWx1ZTogbmV3IE1hcCgpfSwgX2tleToge3ZhbHVlOiBrZXl9fSk7XG4gICAgaWYgKGVudHJpZXMgIT0gbnVsbCkgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgZW50cmllcykgdGhpcy5zZXQoa2V5LCB2YWx1ZSk7XG4gIH1cbiAgZ2V0KGtleSkge1xuICAgIHJldHVybiBzdXBlci5nZXQoaW50ZXJuX2dldCh0aGlzLCBrZXkpKTtcbiAgfVxuICBoYXMoa2V5KSB7XG4gICAgcmV0dXJuIHN1cGVyLmhhcyhpbnRlcm5fZ2V0KHRoaXMsIGtleSkpO1xuICB9XG4gIHNldChrZXksIHZhbHVlKSB7XG4gICAgcmV0dXJuIHN1cGVyLnNldChpbnRlcm5fc2V0KHRoaXMsIGtleSksIHZhbHVlKTtcbiAgfVxuICBkZWxldGUoa2V5KSB7XG4gICAgcmV0dXJuIHN1cGVyLmRlbGV0ZShpbnRlcm5fZGVsZXRlKHRoaXMsIGtleSkpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBJbnRlcm5TZXQgZXh0ZW5kcyBTZXQge1xuICBjb25zdHJ1Y3Rvcih2YWx1ZXMsIGtleSA9IGtleW9mKSB7XG4gICAgc3VwZXIoKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7X2ludGVybjoge3ZhbHVlOiBuZXcgTWFwKCl9LCBfa2V5OiB7dmFsdWU6IGtleX19KTtcbiAgICBpZiAodmFsdWVzICE9IG51bGwpIGZvciAoY29uc3QgdmFsdWUgb2YgdmFsdWVzKSB0aGlzLmFkZCh2YWx1ZSk7XG4gIH1cbiAgaGFzKHZhbHVlKSB7XG4gICAgcmV0dXJuIHN1cGVyLmhhcyhpbnRlcm5fZ2V0KHRoaXMsIHZhbHVlKSk7XG4gIH1cbiAgYWRkKHZhbHVlKSB7XG4gICAgcmV0dXJuIHN1cGVyLmFkZChpbnRlcm5fc2V0KHRoaXMsIHZhbHVlKSk7XG4gIH1cbiAgZGVsZXRlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHN1cGVyLmRlbGV0ZShpbnRlcm5fZGVsZXRlKHRoaXMsIHZhbHVlKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaW50ZXJuX2dldCh7X2ludGVybiwgX2tleX0sIHZhbHVlKSB7XG4gIGNvbnN0IGtleSA9IF9rZXkodmFsdWUpO1xuICByZXR1cm4gX2ludGVybi5oYXMoa2V5KSA/IF9pbnRlcm4uZ2V0KGtleSkgOiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gaW50ZXJuX3NldCh7X2ludGVybiwgX2tleX0sIHZhbHVlKSB7XG4gIGNvbnN0IGtleSA9IF9rZXkodmFsdWUpO1xuICBpZiAoX2ludGVybi5oYXMoa2V5KSkgcmV0dXJuIF9pbnRlcm4uZ2V0KGtleSk7XG4gIF9pbnRlcm4uc2V0KGtleSwgdmFsdWUpO1xuICByZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGludGVybl9kZWxldGUoe19pbnRlcm4sIF9rZXl9LCB2YWx1ZSkge1xuICBjb25zdCBrZXkgPSBfa2V5KHZhbHVlKTtcbiAgaWYgKF9pbnRlcm4uaGFzKGtleSkpIHtcbiAgICB2YWx1ZSA9IF9pbnRlcm4uZ2V0KGtleSk7XG4gICAgX2ludGVybi5kZWxldGUoa2V5KTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGtleW9mKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgPyB2YWx1ZS52YWx1ZU9mKCkgOiB2YWx1ZTtcbn1cbiIsCiAgICAiY29uc3QgZTEwID0gTWF0aC5zcXJ0KDUwKSxcbiAgICBlNSA9IE1hdGguc3FydCgxMCksXG4gICAgZTIgPSBNYXRoLnNxcnQoMik7XG5cbmZ1bmN0aW9uIHRpY2tTcGVjKHN0YXJ0LCBzdG9wLCBjb3VudCkge1xuICBjb25zdCBzdGVwID0gKHN0b3AgLSBzdGFydCkgLyBNYXRoLm1heCgwLCBjb3VudCksXG4gICAgICBwb3dlciA9IE1hdGguZmxvb3IoTWF0aC5sb2cxMChzdGVwKSksXG4gICAgICBlcnJvciA9IHN0ZXAgLyBNYXRoLnBvdygxMCwgcG93ZXIpLFxuICAgICAgZmFjdG9yID0gZXJyb3IgPj0gZTEwID8gMTAgOiBlcnJvciA+PSBlNSA/IDUgOiBlcnJvciA+PSBlMiA/IDIgOiAxO1xuICBsZXQgaTEsIGkyLCBpbmM7XG4gIGlmIChwb3dlciA8IDApIHtcbiAgICBpbmMgPSBNYXRoLnBvdygxMCwgLXBvd2VyKSAvIGZhY3RvcjtcbiAgICBpMSA9IE1hdGgucm91bmQoc3RhcnQgKiBpbmMpO1xuICAgIGkyID0gTWF0aC5yb3VuZChzdG9wICogaW5jKTtcbiAgICBpZiAoaTEgLyBpbmMgPCBzdGFydCkgKytpMTtcbiAgICBpZiAoaTIgLyBpbmMgPiBzdG9wKSAtLWkyO1xuICAgIGluYyA9IC1pbmM7XG4gIH0gZWxzZSB7XG4gICAgaW5jID0gTWF0aC5wb3coMTAsIHBvd2VyKSAqIGZhY3RvcjtcbiAgICBpMSA9IE1hdGgucm91bmQoc3RhcnQgLyBpbmMpO1xuICAgIGkyID0gTWF0aC5yb3VuZChzdG9wIC8gaW5jKTtcbiAgICBpZiAoaTEgKiBpbmMgPCBzdGFydCkgKytpMTtcbiAgICBpZiAoaTIgKiBpbmMgPiBzdG9wKSAtLWkyO1xuICB9XG4gIGlmIChpMiA8IGkxICYmIDAuNSA8PSBjb3VudCAmJiBjb3VudCA8IDIpIHJldHVybiB0aWNrU3BlYyhzdGFydCwgc3RvcCwgY291bnQgKiAyKTtcbiAgcmV0dXJuIFtpMSwgaTIsIGluY107XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRpY2tzKHN0YXJ0LCBzdG9wLCBjb3VudCkge1xuICBzdG9wID0gK3N0b3AsIHN0YXJ0ID0gK3N0YXJ0LCBjb3VudCA9ICtjb3VudDtcbiAgaWYgKCEoY291bnQgPiAwKSkgcmV0dXJuIFtdO1xuICBpZiAoc3RhcnQgPT09IHN0b3ApIHJldHVybiBbc3RhcnRdO1xuICBjb25zdCByZXZlcnNlID0gc3RvcCA8IHN0YXJ0LCBbaTEsIGkyLCBpbmNdID0gcmV2ZXJzZSA/IHRpY2tTcGVjKHN0b3AsIHN0YXJ0LCBjb3VudCkgOiB0aWNrU3BlYyhzdGFydCwgc3RvcCwgY291bnQpO1xuICBpZiAoIShpMiA+PSBpMSkpIHJldHVybiBbXTtcbiAgY29uc3QgbiA9IGkyIC0gaTEgKyAxLCB0aWNrcyA9IG5ldyBBcnJheShuKTtcbiAgaWYgKHJldmVyc2UpIHtcbiAgICBpZiAoaW5jIDwgMCkgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyArK2kpIHRpY2tzW2ldID0gKGkyIC0gaSkgLyAtaW5jO1xuICAgIGVsc2UgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyArK2kpIHRpY2tzW2ldID0gKGkyIC0gaSkgKiBpbmM7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGluYyA8IDApIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgKytpKSB0aWNrc1tpXSA9IChpMSArIGkpIC8gLWluYztcbiAgICBlbHNlIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgKytpKSB0aWNrc1tpXSA9IChpMSArIGkpICogaW5jO1xuICB9XG4gIHJldHVybiB0aWNrcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRpY2tJbmNyZW1lbnQoc3RhcnQsIHN0b3AsIGNvdW50KSB7XG4gIHN0b3AgPSArc3RvcCwgc3RhcnQgPSArc3RhcnQsIGNvdW50ID0gK2NvdW50O1xuICByZXR1cm4gdGlja1NwZWMoc3RhcnQsIHN0b3AsIGNvdW50KVsyXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRpY2tTdGVwKHN0YXJ0LCBzdG9wLCBjb3VudCkge1xuICBzdG9wID0gK3N0b3AsIHN0YXJ0ID0gK3N0YXJ0LCBjb3VudCA9ICtjb3VudDtcbiAgY29uc3QgcmV2ZXJzZSA9IHN0b3AgPCBzdGFydCwgaW5jID0gcmV2ZXJzZSA/IHRpY2tJbmNyZW1lbnQoc3RvcCwgc3RhcnQsIGNvdW50KSA6IHRpY2tJbmNyZW1lbnQoc3RhcnQsIHN0b3AsIGNvdW50KTtcbiAgcmV0dXJuIChyZXZlcnNlID8gLTEgOiAxKSAqIChpbmMgPCAwID8gMSAvIC1pbmMgOiBpbmMpO1xufVxuIiwKICAgICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByYW5nZShzdGFydCwgc3RvcCwgc3RlcCkge1xuICBzdGFydCA9ICtzdGFydCwgc3RvcCA9ICtzdG9wLCBzdGVwID0gKG4gPSBhcmd1bWVudHMubGVuZ3RoKSA8IDIgPyAoc3RvcCA9IHN0YXJ0LCBzdGFydCA9IDAsIDEpIDogbiA8IDMgPyAxIDogK3N0ZXA7XG5cbiAgdmFyIGkgPSAtMSxcbiAgICAgIG4gPSBNYXRoLm1heCgwLCBNYXRoLmNlaWwoKHN0b3AgLSBzdGFydCkgLyBzdGVwKSkgfCAwLFxuICAgICAgcmFuZ2UgPSBuZXcgQXJyYXkobik7XG5cbiAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICByYW5nZVtpXSA9IHN0YXJ0ICsgaSAqIHN0ZXA7XG4gIH1cblxuICByZXR1cm4gcmFuZ2U7XG59XG4iLAogICAgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIHg7XG59XG4iLAogICAgImltcG9ydCBpZGVudGl0eSBmcm9tIFwiLi9pZGVudGl0eS5qc1wiO1xuXG52YXIgdG9wID0gMSxcbiAgICByaWdodCA9IDIsXG4gICAgYm90dG9tID0gMyxcbiAgICBsZWZ0ID0gNCxcbiAgICBlcHNpbG9uID0gMWUtNjtcblxuZnVuY3Rpb24gdHJhbnNsYXRlWCh4KSB7XG4gIHJldHVybiBcInRyYW5zbGF0ZShcIiArIHggKyBcIiwwKVwiO1xufVxuXG5mdW5jdGlvbiB0cmFuc2xhdGVZKHkpIHtcbiAgcmV0dXJuIFwidHJhbnNsYXRlKDAsXCIgKyB5ICsgXCIpXCI7XG59XG5cbmZ1bmN0aW9uIG51bWJlcihzY2FsZSkge1xuICByZXR1cm4gZCA9PiArc2NhbGUoZCk7XG59XG5cbmZ1bmN0aW9uIGNlbnRlcihzY2FsZSwgb2Zmc2V0KSB7XG4gIG9mZnNldCA9IE1hdGgubWF4KDAsIHNjYWxlLmJhbmR3aWR0aCgpIC0gb2Zmc2V0ICogMikgLyAyO1xuICBpZiAoc2NhbGUucm91bmQoKSkgb2Zmc2V0ID0gTWF0aC5yb3VuZChvZmZzZXQpO1xuICByZXR1cm4gZCA9PiArc2NhbGUoZCkgKyBvZmZzZXQ7XG59XG5cbmZ1bmN0aW9uIGVudGVyaW5nKCkge1xuICByZXR1cm4gIXRoaXMuX19heGlzO1xufVxuXG5mdW5jdGlvbiBheGlzKG9yaWVudCwgc2NhbGUpIHtcbiAgdmFyIHRpY2tBcmd1bWVudHMgPSBbXSxcbiAgICAgIHRpY2tWYWx1ZXMgPSBudWxsLFxuICAgICAgdGlja0Zvcm1hdCA9IG51bGwsXG4gICAgICB0aWNrU2l6ZUlubmVyID0gNixcbiAgICAgIHRpY2tTaXplT3V0ZXIgPSA2LFxuICAgICAgdGlja1BhZGRpbmcgPSAzLFxuICAgICAgb2Zmc2V0ID0gdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA+IDEgPyAwIDogMC41LFxuICAgICAgayA9IG9yaWVudCA9PT0gdG9wIHx8IG9yaWVudCA9PT0gbGVmdCA/IC0xIDogMSxcbiAgICAgIHggPSBvcmllbnQgPT09IGxlZnQgfHwgb3JpZW50ID09PSByaWdodCA/IFwieFwiIDogXCJ5XCIsXG4gICAgICB0cmFuc2Zvcm0gPSBvcmllbnQgPT09IHRvcCB8fCBvcmllbnQgPT09IGJvdHRvbSA/IHRyYW5zbGF0ZVggOiB0cmFuc2xhdGVZO1xuXG4gIGZ1bmN0aW9uIGF4aXMoY29udGV4dCkge1xuICAgIHZhciB2YWx1ZXMgPSB0aWNrVmFsdWVzID09IG51bGwgPyAoc2NhbGUudGlja3MgPyBzY2FsZS50aWNrcy5hcHBseShzY2FsZSwgdGlja0FyZ3VtZW50cykgOiBzY2FsZS5kb21haW4oKSkgOiB0aWNrVmFsdWVzLFxuICAgICAgICBmb3JtYXQgPSB0aWNrRm9ybWF0ID09IG51bGwgPyAoc2NhbGUudGlja0Zvcm1hdCA/IHNjYWxlLnRpY2tGb3JtYXQuYXBwbHkoc2NhbGUsIHRpY2tBcmd1bWVudHMpIDogaWRlbnRpdHkpIDogdGlja0Zvcm1hdCxcbiAgICAgICAgc3BhY2luZyA9IE1hdGgubWF4KHRpY2tTaXplSW5uZXIsIDApICsgdGlja1BhZGRpbmcsXG4gICAgICAgIHJhbmdlID0gc2NhbGUucmFuZ2UoKSxcbiAgICAgICAgcmFuZ2UwID0gK3JhbmdlWzBdICsgb2Zmc2V0LFxuICAgICAgICByYW5nZTEgPSArcmFuZ2VbcmFuZ2UubGVuZ3RoIC0gMV0gKyBvZmZzZXQsXG4gICAgICAgIHBvc2l0aW9uID0gKHNjYWxlLmJhbmR3aWR0aCA/IGNlbnRlciA6IG51bWJlcikoc2NhbGUuY29weSgpLCBvZmZzZXQpLFxuICAgICAgICBzZWxlY3Rpb24gPSBjb250ZXh0LnNlbGVjdGlvbiA/IGNvbnRleHQuc2VsZWN0aW9uKCkgOiBjb250ZXh0LFxuICAgICAgICBwYXRoID0gc2VsZWN0aW9uLnNlbGVjdEFsbChcIi5kb21haW5cIikuZGF0YShbbnVsbF0pLFxuICAgICAgICB0aWNrID0gc2VsZWN0aW9uLnNlbGVjdEFsbChcIi50aWNrXCIpLmRhdGEodmFsdWVzLCBzY2FsZSkub3JkZXIoKSxcbiAgICAgICAgdGlja0V4aXQgPSB0aWNrLmV4aXQoKSxcbiAgICAgICAgdGlja0VudGVyID0gdGljay5lbnRlcigpLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwidGlja1wiKSxcbiAgICAgICAgbGluZSA9IHRpY2suc2VsZWN0KFwibGluZVwiKSxcbiAgICAgICAgdGV4dCA9IHRpY2suc2VsZWN0KFwidGV4dFwiKTtcblxuICAgIHBhdGggPSBwYXRoLm1lcmdlKHBhdGguZW50ZXIoKS5pbnNlcnQoXCJwYXRoXCIsIFwiLnRpY2tcIilcbiAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImRvbWFpblwiKVxuICAgICAgICAuYXR0cihcInN0cm9rZVwiLCBcImN1cnJlbnRDb2xvclwiKSk7XG5cbiAgICB0aWNrID0gdGljay5tZXJnZSh0aWNrRW50ZXIpO1xuXG4gICAgbGluZSA9IGxpbmUubWVyZ2UodGlja0VudGVyLmFwcGVuZChcImxpbmVcIilcbiAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgXCJjdXJyZW50Q29sb3JcIilcbiAgICAgICAgLmF0dHIoeCArIFwiMlwiLCBrICogdGlja1NpemVJbm5lcikpO1xuXG4gICAgdGV4dCA9IHRleHQubWVyZ2UodGlja0VudGVyLmFwcGVuZChcInRleHRcIilcbiAgICAgICAgLmF0dHIoXCJmaWxsXCIsIFwiY3VycmVudENvbG9yXCIpXG4gICAgICAgIC5hdHRyKHgsIGsgKiBzcGFjaW5nKVxuICAgICAgICAuYXR0cihcImR5XCIsIG9yaWVudCA9PT0gdG9wID8gXCIwZW1cIiA6IG9yaWVudCA9PT0gYm90dG9tID8gXCIwLjcxZW1cIiA6IFwiMC4zMmVtXCIpKTtcblxuICAgIGlmIChjb250ZXh0ICE9PSBzZWxlY3Rpb24pIHtcbiAgICAgIHBhdGggPSBwYXRoLnRyYW5zaXRpb24oY29udGV4dCk7XG4gICAgICB0aWNrID0gdGljay50cmFuc2l0aW9uKGNvbnRleHQpO1xuICAgICAgbGluZSA9IGxpbmUudHJhbnNpdGlvbihjb250ZXh0KTtcbiAgICAgIHRleHQgPSB0ZXh0LnRyYW5zaXRpb24oY29udGV4dCk7XG5cbiAgICAgIHRpY2tFeGl0ID0gdGlja0V4aXQudHJhbnNpdGlvbihjb250ZXh0KVxuICAgICAgICAgIC5hdHRyKFwib3BhY2l0eVwiLCBlcHNpbG9uKVxuICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGlzRmluaXRlKGQgPSBwb3NpdGlvbihkKSkgPyB0cmFuc2Zvcm0oZCArIG9mZnNldCkgOiB0aGlzLmdldEF0dHJpYnV0ZShcInRyYW5zZm9ybVwiKTsgfSk7XG5cbiAgICAgIHRpY2tFbnRlclxuICAgICAgICAgIC5hdHRyKFwib3BhY2l0eVwiLCBlcHNpbG9uKVxuICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQpIHsgdmFyIHAgPSB0aGlzLnBhcmVudE5vZGUuX19heGlzOyByZXR1cm4gdHJhbnNmb3JtKChwICYmIGlzRmluaXRlKHAgPSBwKGQpKSA/IHAgOiBwb3NpdGlvbihkKSkgKyBvZmZzZXQpOyB9KTtcbiAgICB9XG5cbiAgICB0aWNrRXhpdC5yZW1vdmUoKTtcblxuICAgIHBhdGhcbiAgICAgICAgLmF0dHIoXCJkXCIsIG9yaWVudCA9PT0gbGVmdCB8fCBvcmllbnQgPT09IHJpZ2h0XG4gICAgICAgICAgICA/ICh0aWNrU2l6ZU91dGVyID8gXCJNXCIgKyBrICogdGlja1NpemVPdXRlciArIFwiLFwiICsgcmFuZ2UwICsgXCJIXCIgKyBvZmZzZXQgKyBcIlZcIiArIHJhbmdlMSArIFwiSFwiICsgayAqIHRpY2tTaXplT3V0ZXIgOiBcIk1cIiArIG9mZnNldCArIFwiLFwiICsgcmFuZ2UwICsgXCJWXCIgKyByYW5nZTEpXG4gICAgICAgICAgICA6ICh0aWNrU2l6ZU91dGVyID8gXCJNXCIgKyByYW5nZTAgKyBcIixcIiArIGsgKiB0aWNrU2l6ZU91dGVyICsgXCJWXCIgKyBvZmZzZXQgKyBcIkhcIiArIHJhbmdlMSArIFwiVlwiICsgayAqIHRpY2tTaXplT3V0ZXIgOiBcIk1cIiArIHJhbmdlMCArIFwiLFwiICsgb2Zmc2V0ICsgXCJIXCIgKyByYW5nZTEpKTtcblxuICAgIHRpY2tcbiAgICAgICAgLmF0dHIoXCJvcGFjaXR5XCIsIDEpXG4gICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIHRyYW5zZm9ybShwb3NpdGlvbihkKSArIG9mZnNldCk7IH0pO1xuXG4gICAgbGluZVxuICAgICAgICAuYXR0cih4ICsgXCIyXCIsIGsgKiB0aWNrU2l6ZUlubmVyKTtcblxuICAgIHRleHRcbiAgICAgICAgLmF0dHIoeCwgayAqIHNwYWNpbmcpXG4gICAgICAgIC50ZXh0KGZvcm1hdCk7XG5cbiAgICBzZWxlY3Rpb24uZmlsdGVyKGVudGVyaW5nKVxuICAgICAgICAuYXR0cihcImZpbGxcIiwgXCJub25lXCIpXG4gICAgICAgIC5hdHRyKFwiZm9udC1zaXplXCIsIDEwKVxuICAgICAgICAuYXR0cihcImZvbnQtZmFtaWx5XCIsIFwic2Fucy1zZXJpZlwiKVxuICAgICAgICAuYXR0cihcInRleHQtYW5jaG9yXCIsIG9yaWVudCA9PT0gcmlnaHQgPyBcInN0YXJ0XCIgOiBvcmllbnQgPT09IGxlZnQgPyBcImVuZFwiIDogXCJtaWRkbGVcIik7XG5cbiAgICBzZWxlY3Rpb25cbiAgICAgICAgLmVhY2goZnVuY3Rpb24oKSB7IHRoaXMuX19heGlzID0gcG9zaXRpb247IH0pO1xuICB9XG5cbiAgYXhpcy5zY2FsZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChzY2FsZSA9IF8sIGF4aXMpIDogc2NhbGU7XG4gIH07XG5cbiAgYXhpcy50aWNrcyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aWNrQXJndW1lbnRzID0gQXJyYXkuZnJvbShhcmd1bWVudHMpLCBheGlzO1xuICB9O1xuXG4gIGF4aXMudGlja0FyZ3VtZW50cyA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh0aWNrQXJndW1lbnRzID0gXyA9PSBudWxsID8gW10gOiBBcnJheS5mcm9tKF8pLCBheGlzKSA6IHRpY2tBcmd1bWVudHMuc2xpY2UoKTtcbiAgfTtcblxuICBheGlzLnRpY2tWYWx1ZXMgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAodGlja1ZhbHVlcyA9IF8gPT0gbnVsbCA/IG51bGwgOiBBcnJheS5mcm9tKF8pLCBheGlzKSA6IHRpY2tWYWx1ZXMgJiYgdGlja1ZhbHVlcy5zbGljZSgpO1xuICB9O1xuXG4gIGF4aXMudGlja0Zvcm1hdCA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh0aWNrRm9ybWF0ID0gXywgYXhpcykgOiB0aWNrRm9ybWF0O1xuICB9O1xuXG4gIGF4aXMudGlja1NpemUgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAodGlja1NpemVJbm5lciA9IHRpY2tTaXplT3V0ZXIgPSArXywgYXhpcykgOiB0aWNrU2l6ZUlubmVyO1xuICB9O1xuXG4gIGF4aXMudGlja1NpemVJbm5lciA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh0aWNrU2l6ZUlubmVyID0gK18sIGF4aXMpIDogdGlja1NpemVJbm5lcjtcbiAgfTtcblxuICBheGlzLnRpY2tTaXplT3V0ZXIgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAodGlja1NpemVPdXRlciA9ICtfLCBheGlzKSA6IHRpY2tTaXplT3V0ZXI7XG4gIH07XG5cbiAgYXhpcy50aWNrUGFkZGluZyA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh0aWNrUGFkZGluZyA9ICtfLCBheGlzKSA6IHRpY2tQYWRkaW5nO1xuICB9O1xuXG4gIGF4aXMub2Zmc2V0ID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKG9mZnNldCA9ICtfLCBheGlzKSA6IG9mZnNldDtcbiAgfTtcblxuICByZXR1cm4gYXhpcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGF4aXNUb3Aoc2NhbGUpIHtcbiAgcmV0dXJuIGF4aXModG9wLCBzY2FsZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBheGlzUmlnaHQoc2NhbGUpIHtcbiAgcmV0dXJuIGF4aXMocmlnaHQsIHNjYWxlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGF4aXNCb3R0b20oc2NhbGUpIHtcbiAgcmV0dXJuIGF4aXMoYm90dG9tLCBzY2FsZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBheGlzTGVmdChzY2FsZSkge1xuICByZXR1cm4gYXhpcyhsZWZ0LCBzY2FsZSk7XG59XG4iLAogICAgImZ1bmN0aW9uIG5vbmUoKSB7fVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3Rvcikge1xuICByZXR1cm4gc2VsZWN0b3IgPT0gbnVsbCA/IG5vbmUgOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgfTtcbn1cbiIsCiAgICAiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQgc2VsZWN0b3IgZnJvbSBcIi4uL3NlbGVjdG9yLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdCkge1xuICBpZiAodHlwZW9mIHNlbGVjdCAhPT0gXCJmdW5jdGlvblwiKSBzZWxlY3QgPSBzZWxlY3RvcihzZWxlY3QpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IG5ldyBBcnJheShtKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgc3ViZ3JvdXAgPSBzdWJncm91cHNbal0gPSBuZXcgQXJyYXkobiksIG5vZGUsIHN1Ym5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAoKG5vZGUgPSBncm91cFtpXSkgJiYgKHN1Ym5vZGUgPSBzZWxlY3QuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCkpKSB7XG4gICAgICAgIGlmIChcIl9fZGF0YV9fXCIgaW4gbm9kZSkgc3Vibm9kZS5fX2RhdGFfXyA9IG5vZGUuX19kYXRhX187XG4gICAgICAgIHN1Ymdyb3VwW2ldID0gc3Vibm9kZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFNlbGVjdGlvbihzdWJncm91cHMsIHRoaXMuX3BhcmVudHMpO1xufVxuIiwKICAgICIvLyBHaXZlbiBzb21ldGhpbmcgYXJyYXkgbGlrZSAob3IgbnVsbCksIHJldHVybnMgc29tZXRoaW5nIHRoYXQgaXMgc3RyaWN0bHkgYW5cbi8vIGFycmF5LiBUaGlzIGlzIHVzZWQgdG8gZW5zdXJlIHRoYXQgYXJyYXktbGlrZSBvYmplY3RzIHBhc3NlZCB0byBkMy5zZWxlY3RBbGxcbi8vIG9yIHNlbGVjdGlvbi5zZWxlY3RBbGwgYXJlIGNvbnZlcnRlZCBpbnRvIHByb3BlciBhcnJheXMgd2hlbiBjcmVhdGluZyBhXG4vLyBzZWxlY3Rpb247IHdlIGRvbuKAmXQgZXZlciB3YW50IHRvIGNyZWF0ZSBhIHNlbGVjdGlvbiBiYWNrZWQgYnkgYSBsaXZlXG4vLyBIVE1MQ29sbGVjdGlvbiBvciBOb2RlTGlzdC4gSG93ZXZlciwgbm90ZSB0aGF0IHNlbGVjdGlvbi5zZWxlY3RBbGwgd2lsbCB1c2UgYVxuLy8gc3RhdGljIE5vZGVMaXN0IGFzIGEgZ3JvdXAsIHNpbmNlIGl0IHNhZmVseSBkZXJpdmVkIGZyb20gcXVlcnlTZWxlY3RvckFsbC5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFycmF5KHgpIHtcbiAgcmV0dXJuIHggPT0gbnVsbCA/IFtdIDogQXJyYXkuaXNBcnJheSh4KSA/IHggOiBBcnJheS5mcm9tKHgpO1xufVxuIiwKICAgICJmdW5jdGlvbiBlbXB0eSgpIHtcbiAgcmV0dXJuIFtdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3Rvcikge1xuICByZXR1cm4gc2VsZWN0b3IgPT0gbnVsbCA/IGVtcHR5IDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gIH07XG59XG4iLAogICAgImltcG9ydCB7U2VsZWN0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IGFycmF5IGZyb20gXCIuLi9hcnJheS5qc1wiO1xuaW1wb3J0IHNlbGVjdG9yQWxsIGZyb20gXCIuLi9zZWxlY3RvckFsbC5qc1wiO1xuXG5mdW5jdGlvbiBhcnJheUFsbChzZWxlY3QpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBhcnJheShzZWxlY3QuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdCkge1xuICBpZiAodHlwZW9mIHNlbGVjdCA9PT0gXCJmdW5jdGlvblwiKSBzZWxlY3QgPSBhcnJheUFsbChzZWxlY3QpO1xuICBlbHNlIHNlbGVjdCA9IHNlbGVjdG9yQWxsKHNlbGVjdCk7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgc3ViZ3JvdXBzID0gW10sIHBhcmVudHMgPSBbXSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgc3ViZ3JvdXBzLnB1c2goc2VsZWN0LmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApKTtcbiAgICAgICAgcGFyZW50cy5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKHN1Ymdyb3VwcywgcGFyZW50cyk7XG59XG4iLAogICAgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaGVzKHNlbGVjdG9yKTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoaWxkTWF0Y2hlcihzZWxlY3Rvcikge1xuICByZXR1cm4gZnVuY3Rpb24obm9kZSkge1xuICAgIHJldHVybiBub2RlLm1hdGNoZXMoc2VsZWN0b3IpO1xuICB9O1xufVxuXG4iLAogICAgImltcG9ydCB7Y2hpbGRNYXRjaGVyfSBmcm9tIFwiLi4vbWF0Y2hlci5qc1wiO1xuXG52YXIgZmluZCA9IEFycmF5LnByb3RvdHlwZS5maW5kO1xuXG5mdW5jdGlvbiBjaGlsZEZpbmQobWF0Y2gpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBmaW5kLmNhbGwodGhpcy5jaGlsZHJlbiwgbWF0Y2gpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjaGlsZEZpcnN0KCkge1xuICByZXR1cm4gdGhpcy5maXJzdEVsZW1lbnRDaGlsZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obWF0Y2gpIHtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0KG1hdGNoID09IG51bGwgPyBjaGlsZEZpcnN0XG4gICAgICA6IGNoaWxkRmluZCh0eXBlb2YgbWF0Y2ggPT09IFwiZnVuY3Rpb25cIiA/IG1hdGNoIDogY2hpbGRNYXRjaGVyKG1hdGNoKSkpO1xufVxuIiwKICAgICJpbXBvcnQge2NoaWxkTWF0Y2hlcn0gZnJvbSBcIi4uL21hdGNoZXIuanNcIjtcblxudmFyIGZpbHRlciA9IEFycmF5LnByb3RvdHlwZS5maWx0ZXI7XG5cbmZ1bmN0aW9uIGNoaWxkcmVuKCkge1xuICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLmNoaWxkcmVuKTtcbn1cblxuZnVuY3Rpb24gY2hpbGRyZW5GaWx0ZXIobWF0Y2gpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBmaWx0ZXIuY2FsbCh0aGlzLmNoaWxkcmVuLCBtYXRjaCk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG1hdGNoKSB7XG4gIHJldHVybiB0aGlzLnNlbGVjdEFsbChtYXRjaCA9PSBudWxsID8gY2hpbGRyZW5cbiAgICAgIDogY2hpbGRyZW5GaWx0ZXIodHlwZW9mIG1hdGNoID09PSBcImZ1bmN0aW9uXCIgPyBtYXRjaCA6IGNoaWxkTWF0Y2hlcihtYXRjaCkpKTtcbn1cbiIsCiAgICAiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQgbWF0Y2hlciBmcm9tIFwiLi4vbWF0Y2hlci5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihtYXRjaCkge1xuICBpZiAodHlwZW9mIG1hdGNoICE9PSBcImZ1bmN0aW9uXCIpIG1hdGNoID0gbWF0Y2hlcihtYXRjaCk7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgc3ViZ3JvdXBzID0gbmV3IEFycmF5KG0pLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBzdWJncm91cCA9IHN1Ymdyb3Vwc1tqXSA9IFtdLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKChub2RlID0gZ3JvdXBbaV0pICYmIG1hdGNoLmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApKSB7XG4gICAgICAgIHN1Ymdyb3VwLnB1c2gobm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24oc3ViZ3JvdXBzLCB0aGlzLl9wYXJlbnRzKTtcbn1cbiIsCiAgICAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odXBkYXRlKSB7XG4gIHJldHVybiBuZXcgQXJyYXkodXBkYXRlLmxlbmd0aCk7XG59XG4iLAogICAgImltcG9ydCBzcGFyc2UgZnJvbSBcIi4vc3BhcnNlLmpzXCI7XG5pbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKHRoaXMuX2VudGVyIHx8IHRoaXMuX2dyb3Vwcy5tYXAoc3BhcnNlKSwgdGhpcy5fcGFyZW50cyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBFbnRlck5vZGUocGFyZW50LCBkYXR1bSkge1xuICB0aGlzLm93bmVyRG9jdW1lbnQgPSBwYXJlbnQub3duZXJEb2N1bWVudDtcbiAgdGhpcy5uYW1lc3BhY2VVUkkgPSBwYXJlbnQubmFtZXNwYWNlVVJJO1xuICB0aGlzLl9uZXh0ID0gbnVsbDtcbiAgdGhpcy5fcGFyZW50ID0gcGFyZW50O1xuICB0aGlzLl9fZGF0YV9fID0gZGF0dW07XG59XG5cbkVudGVyTm9kZS5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBFbnRlck5vZGUsXG4gIGFwcGVuZENoaWxkOiBmdW5jdGlvbihjaGlsZCkgeyByZXR1cm4gdGhpcy5fcGFyZW50Lmluc2VydEJlZm9yZShjaGlsZCwgdGhpcy5fbmV4dCk7IH0sXG4gIGluc2VydEJlZm9yZTogZnVuY3Rpb24oY2hpbGQsIG5leHQpIHsgcmV0dXJuIHRoaXMuX3BhcmVudC5pbnNlcnRCZWZvcmUoY2hpbGQsIG5leHQpOyB9LFxuICBxdWVyeVNlbGVjdG9yOiBmdW5jdGlvbihzZWxlY3RvcikgeyByZXR1cm4gdGhpcy5fcGFyZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpOyB9LFxuICBxdWVyeVNlbGVjdG9yQWxsOiBmdW5jdGlvbihzZWxlY3RvcikgeyByZXR1cm4gdGhpcy5fcGFyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpOyB9XG59O1xuIiwKICAgICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbih4KSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4geDtcbiAgfTtcbn1cbiIsCiAgICAiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQge0VudGVyTm9kZX0gZnJvbSBcIi4vZW50ZXIuanNcIjtcbmltcG9ydCBjb25zdGFudCBmcm9tIFwiLi4vY29uc3RhbnQuanNcIjtcblxuZnVuY3Rpb24gYmluZEluZGV4KHBhcmVudCwgZ3JvdXAsIGVudGVyLCB1cGRhdGUsIGV4aXQsIGRhdGEpIHtcbiAgdmFyIGkgPSAwLFxuICAgICAgbm9kZSxcbiAgICAgIGdyb3VwTGVuZ3RoID0gZ3JvdXAubGVuZ3RoLFxuICAgICAgZGF0YUxlbmd0aCA9IGRhdGEubGVuZ3RoO1xuXG4gIC8vIFB1dCBhbnkgbm9uLW51bGwgbm9kZXMgdGhhdCBmaXQgaW50byB1cGRhdGUuXG4gIC8vIFB1dCBhbnkgbnVsbCBub2RlcyBpbnRvIGVudGVyLlxuICAvLyBQdXQgYW55IHJlbWFpbmluZyBkYXRhIGludG8gZW50ZXIuXG4gIGZvciAoOyBpIDwgZGF0YUxlbmd0aDsgKytpKSB7XG4gICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgbm9kZS5fX2RhdGFfXyA9IGRhdGFbaV07XG4gICAgICB1cGRhdGVbaV0gPSBub2RlO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbnRlcltpXSA9IG5ldyBFbnRlck5vZGUocGFyZW50LCBkYXRhW2ldKTtcbiAgICB9XG4gIH1cblxuICAvLyBQdXQgYW55IG5vbi1udWxsIG5vZGVzIHRoYXQgZG9u4oCZdCBmaXQgaW50byBleGl0LlxuICBmb3IgKDsgaSA8IGdyb3VwTGVuZ3RoOyArK2kpIHtcbiAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICBleGl0W2ldID0gbm9kZTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYmluZEtleShwYXJlbnQsIGdyb3VwLCBlbnRlciwgdXBkYXRlLCBleGl0LCBkYXRhLCBrZXkpIHtcbiAgdmFyIGksXG4gICAgICBub2RlLFxuICAgICAgbm9kZUJ5S2V5VmFsdWUgPSBuZXcgTWFwLFxuICAgICAgZ3JvdXBMZW5ndGggPSBncm91cC5sZW5ndGgsXG4gICAgICBkYXRhTGVuZ3RoID0gZGF0YS5sZW5ndGgsXG4gICAgICBrZXlWYWx1ZXMgPSBuZXcgQXJyYXkoZ3JvdXBMZW5ndGgpLFxuICAgICAga2V5VmFsdWU7XG5cbiAgLy8gQ29tcHV0ZSB0aGUga2V5IGZvciBlYWNoIG5vZGUuXG4gIC8vIElmIG11bHRpcGxlIG5vZGVzIGhhdmUgdGhlIHNhbWUga2V5LCB0aGUgZHVwbGljYXRlcyBhcmUgYWRkZWQgdG8gZXhpdC5cbiAgZm9yIChpID0gMDsgaSA8IGdyb3VwTGVuZ3RoOyArK2kpIHtcbiAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICBrZXlWYWx1ZXNbaV0gPSBrZXlWYWx1ZSA9IGtleS5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSArIFwiXCI7XG4gICAgICBpZiAobm9kZUJ5S2V5VmFsdWUuaGFzKGtleVZhbHVlKSkge1xuICAgICAgICBleGl0W2ldID0gbm9kZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vZGVCeUtleVZhbHVlLnNldChrZXlWYWx1ZSwgbm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gQ29tcHV0ZSB0aGUga2V5IGZvciBlYWNoIGRhdHVtLlxuICAvLyBJZiB0aGVyZSBhIG5vZGUgYXNzb2NpYXRlZCB3aXRoIHRoaXMga2V5LCBqb2luIGFuZCBhZGQgaXQgdG8gdXBkYXRlLlxuICAvLyBJZiB0aGVyZSBpcyBub3QgKG9yIHRoZSBrZXkgaXMgYSBkdXBsaWNhdGUpLCBhZGQgaXQgdG8gZW50ZXIuXG4gIGZvciAoaSA9IDA7IGkgPCBkYXRhTGVuZ3RoOyArK2kpIHtcbiAgICBrZXlWYWx1ZSA9IGtleS5jYWxsKHBhcmVudCwgZGF0YVtpXSwgaSwgZGF0YSkgKyBcIlwiO1xuICAgIGlmIChub2RlID0gbm9kZUJ5S2V5VmFsdWUuZ2V0KGtleVZhbHVlKSkge1xuICAgICAgdXBkYXRlW2ldID0gbm9kZTtcbiAgICAgIG5vZGUuX19kYXRhX18gPSBkYXRhW2ldO1xuICAgICAgbm9kZUJ5S2V5VmFsdWUuZGVsZXRlKGtleVZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZW50ZXJbaV0gPSBuZXcgRW50ZXJOb2RlKHBhcmVudCwgZGF0YVtpXSk7XG4gICAgfVxuICB9XG5cbiAgLy8gQWRkIGFueSByZW1haW5pbmcgbm9kZXMgdGhhdCB3ZXJlIG5vdCBib3VuZCB0byBkYXRhIHRvIGV4aXQuXG4gIGZvciAoaSA9IDA7IGkgPCBncm91cExlbmd0aDsgKytpKSB7XG4gICAgaWYgKChub2RlID0gZ3JvdXBbaV0pICYmIChub2RlQnlLZXlWYWx1ZS5nZXQoa2V5VmFsdWVzW2ldKSA9PT0gbm9kZSkpIHtcbiAgICAgIGV4aXRbaV0gPSBub2RlO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBkYXR1bShub2RlKSB7XG4gIHJldHVybiBub2RlLl9fZGF0YV9fO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIEFycmF5LmZyb20odGhpcywgZGF0dW0pO1xuXG4gIHZhciBiaW5kID0ga2V5ID8gYmluZEtleSA6IGJpbmRJbmRleCxcbiAgICAgIHBhcmVudHMgPSB0aGlzLl9wYXJlbnRzLFxuICAgICAgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzO1xuXG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdmFsdWUgPSBjb25zdGFudCh2YWx1ZSk7XG5cbiAgZm9yICh2YXIgbSA9IGdyb3Vwcy5sZW5ndGgsIHVwZGF0ZSA9IG5ldyBBcnJheShtKSwgZW50ZXIgPSBuZXcgQXJyYXkobSksIGV4aXQgPSBuZXcgQXJyYXkobSksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgdmFyIHBhcmVudCA9IHBhcmVudHNbal0sXG4gICAgICAgIGdyb3VwID0gZ3JvdXBzW2pdLFxuICAgICAgICBncm91cExlbmd0aCA9IGdyb3VwLmxlbmd0aCxcbiAgICAgICAgZGF0YSA9IGFycmF5bGlrZSh2YWx1ZS5jYWxsKHBhcmVudCwgcGFyZW50ICYmIHBhcmVudC5fX2RhdGFfXywgaiwgcGFyZW50cykpLFxuICAgICAgICBkYXRhTGVuZ3RoID0gZGF0YS5sZW5ndGgsXG4gICAgICAgIGVudGVyR3JvdXAgPSBlbnRlcltqXSA9IG5ldyBBcnJheShkYXRhTGVuZ3RoKSxcbiAgICAgICAgdXBkYXRlR3JvdXAgPSB1cGRhdGVbal0gPSBuZXcgQXJyYXkoZGF0YUxlbmd0aCksXG4gICAgICAgIGV4aXRHcm91cCA9IGV4aXRbal0gPSBuZXcgQXJyYXkoZ3JvdXBMZW5ndGgpO1xuXG4gICAgYmluZChwYXJlbnQsIGdyb3VwLCBlbnRlckdyb3VwLCB1cGRhdGVHcm91cCwgZXhpdEdyb3VwLCBkYXRhLCBrZXkpO1xuXG4gICAgLy8gTm93IGNvbm5lY3QgdGhlIGVudGVyIG5vZGVzIHRvIHRoZWlyIGZvbGxvd2luZyB1cGRhdGUgbm9kZSwgc3VjaCB0aGF0XG4gICAgLy8gYXBwZW5kQ2hpbGQgY2FuIGluc2VydCB0aGUgbWF0ZXJpYWxpemVkIGVudGVyIG5vZGUgYmVmb3JlIHRoaXMgbm9kZSxcbiAgICAvLyByYXRoZXIgdGhhbiBhdCB0aGUgZW5kIG9mIHRoZSBwYXJlbnQgbm9kZS5cbiAgICBmb3IgKHZhciBpMCA9IDAsIGkxID0gMCwgcHJldmlvdXMsIG5leHQ7IGkwIDwgZGF0YUxlbmd0aDsgKytpMCkge1xuICAgICAgaWYgKHByZXZpb3VzID0gZW50ZXJHcm91cFtpMF0pIHtcbiAgICAgICAgaWYgKGkwID49IGkxKSBpMSA9IGkwICsgMTtcbiAgICAgICAgd2hpbGUgKCEobmV4dCA9IHVwZGF0ZUdyb3VwW2kxXSkgJiYgKytpMSA8IGRhdGFMZW5ndGgpO1xuICAgICAgICBwcmV2aW91cy5fbmV4dCA9IG5leHQgfHwgbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB1cGRhdGUgPSBuZXcgU2VsZWN0aW9uKHVwZGF0ZSwgcGFyZW50cyk7XG4gIHVwZGF0ZS5fZW50ZXIgPSBlbnRlcjtcbiAgdXBkYXRlLl9leGl0ID0gZXhpdDtcbiAgcmV0dXJuIHVwZGF0ZTtcbn1cblxuLy8gR2l2ZW4gc29tZSBkYXRhLCB0aGlzIHJldHVybnMgYW4gYXJyYXktbGlrZSB2aWV3IG9mIGl0OiBhbiBvYmplY3QgdGhhdFxuLy8gZXhwb3NlcyBhIGxlbmd0aCBwcm9wZXJ0eSBhbmQgYWxsb3dzIG51bWVyaWMgaW5kZXhpbmcuIE5vdGUgdGhhdCB1bmxpa2Vcbi8vIHNlbGVjdEFsbCwgdGhpcyBpc27igJl0IHdvcnJpZWQgYWJvdXQg4oCcbGl2ZeKAnSBjb2xsZWN0aW9ucyBiZWNhdXNlIHRoZSByZXN1bHRpbmdcbi8vIGFycmF5IHdpbGwgb25seSBiZSB1c2VkIGJyaWVmbHkgd2hpbGUgZGF0YSBpcyBiZWluZyBib3VuZC4gKEl0IGlzIHBvc3NpYmxlIHRvXG4vLyBjYXVzZSB0aGUgZGF0YSB0byBjaGFuZ2Ugd2hpbGUgaXRlcmF0aW5nIGJ5IHVzaW5nIGEga2V5IGZ1bmN0aW9uLCBidXQgcGxlYXNlXG4vLyBkb27igJl0OyB3ZeKAmWQgcmF0aGVyIGF2b2lkIGEgZ3JhdHVpdG91cyBjb3B5LilcbmZ1bmN0aW9uIGFycmF5bGlrZShkYXRhKSB7XG4gIHJldHVybiB0eXBlb2YgZGF0YSA9PT0gXCJvYmplY3RcIiAmJiBcImxlbmd0aFwiIGluIGRhdGFcbiAgICA/IGRhdGEgLy8gQXJyYXksIFR5cGVkQXJyYXksIE5vZGVMaXN0LCBhcnJheS1saWtlXG4gICAgOiBBcnJheS5mcm9tKGRhdGEpOyAvLyBNYXAsIFNldCwgaXRlcmFibGUsIHN0cmluZywgb3IgYW55dGhpbmcgZWxzZVxufVxuIiwKICAgICJpbXBvcnQgc3BhcnNlIGZyb20gXCIuL3NwYXJzZS5qc1wiO1xuaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFNlbGVjdGlvbih0aGlzLl9leGl0IHx8IHRoaXMuX2dyb3Vwcy5tYXAoc3BhcnNlKSwgdGhpcy5fcGFyZW50cyk7XG59XG4iLAogICAgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG9uZW50ZXIsIG9udXBkYXRlLCBvbmV4aXQpIHtcbiAgdmFyIGVudGVyID0gdGhpcy5lbnRlcigpLCB1cGRhdGUgPSB0aGlzLCBleGl0ID0gdGhpcy5leGl0KCk7XG4gIGlmICh0eXBlb2Ygb25lbnRlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgZW50ZXIgPSBvbmVudGVyKGVudGVyKTtcbiAgICBpZiAoZW50ZXIpIGVudGVyID0gZW50ZXIuc2VsZWN0aW9uKCk7XG4gIH0gZWxzZSB7XG4gICAgZW50ZXIgPSBlbnRlci5hcHBlbmQob25lbnRlciArIFwiXCIpO1xuICB9XG4gIGlmIChvbnVwZGF0ZSAhPSBudWxsKSB7XG4gICAgdXBkYXRlID0gb251cGRhdGUodXBkYXRlKTtcbiAgICBpZiAodXBkYXRlKSB1cGRhdGUgPSB1cGRhdGUuc2VsZWN0aW9uKCk7XG4gIH1cbiAgaWYgKG9uZXhpdCA9PSBudWxsKSBleGl0LnJlbW92ZSgpOyBlbHNlIG9uZXhpdChleGl0KTtcbiAgcmV0dXJuIGVudGVyICYmIHVwZGF0ZSA/IGVudGVyLm1lcmdlKHVwZGF0ZSkub3JkZXIoKSA6IHVwZGF0ZTtcbn1cbiIsCiAgICAiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgdmFyIHNlbGVjdGlvbiA9IGNvbnRleHQuc2VsZWN0aW9uID8gY29udGV4dC5zZWxlY3Rpb24oKSA6IGNvbnRleHQ7XG5cbiAgZm9yICh2YXIgZ3JvdXBzMCA9IHRoaXMuX2dyb3VwcywgZ3JvdXBzMSA9IHNlbGVjdGlvbi5fZ3JvdXBzLCBtMCA9IGdyb3VwczAubGVuZ3RoLCBtMSA9IGdyb3VwczEubGVuZ3RoLCBtID0gTWF0aC5taW4obTAsIG0xKSwgbWVyZ2VzID0gbmV3IEFycmF5KG0wKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cDAgPSBncm91cHMwW2pdLCBncm91cDEgPSBncm91cHMxW2pdLCBuID0gZ3JvdXAwLmxlbmd0aCwgbWVyZ2UgPSBtZXJnZXNbal0gPSBuZXcgQXJyYXkobiksIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwMFtpXSB8fCBncm91cDFbaV0pIHtcbiAgICAgICAgbWVyZ2VbaV0gPSBub2RlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBqIDwgbTA7ICsraikge1xuICAgIG1lcmdlc1tqXSA9IGdyb3VwczBbal07XG4gIH1cblxuICByZXR1cm4gbmV3IFNlbGVjdGlvbihtZXJnZXMsIHRoaXMuX3BhcmVudHMpO1xufVxuIiwKICAgICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIGogPSAtMSwgbSA9IGdyb3Vwcy5sZW5ndGg7ICsraiA8IG07KSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIGkgPSBncm91cC5sZW5ndGggLSAxLCBuZXh0ID0gZ3JvdXBbaV0sIG5vZGU7IC0taSA+PSAwOykge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgICBpZiAobmV4dCAmJiBub2RlLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKG5leHQpIF4gNCkgbmV4dC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShub2RlLCBuZXh0KTtcbiAgICAgICAgbmV4dCA9IG5vZGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59XG4iLAogICAgImltcG9ydCB7U2VsZWN0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjb21wYXJlKSB7XG4gIGlmICghY29tcGFyZSkgY29tcGFyZSA9IGFzY2VuZGluZztcblxuICBmdW5jdGlvbiBjb21wYXJlTm9kZShhLCBiKSB7XG4gICAgcmV0dXJuIGEgJiYgYiA/IGNvbXBhcmUoYS5fX2RhdGFfXywgYi5fX2RhdGFfXykgOiAhYSAtICFiO1xuICB9XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgc29ydGdyb3VwcyA9IG5ldyBBcnJheShtKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgc29ydGdyb3VwID0gc29ydGdyb3Vwc1tqXSA9IG5ldyBBcnJheShuKSwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgc29ydGdyb3VwW2ldID0gbm9kZTtcbiAgICAgIH1cbiAgICB9XG4gICAgc29ydGdyb3VwLnNvcnQoY29tcGFyZU5vZGUpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24oc29ydGdyb3VwcywgdGhpcy5fcGFyZW50cykub3JkZXIoKTtcbn1cblxuZnVuY3Rpb24gYXNjZW5kaW5nKGEsIGIpIHtcbiAgcmV0dXJuIGEgPCBiID8gLTEgOiBhID4gYiA/IDEgOiBhID49IGIgPyAwIDogTmFOO1xufVxuIiwKICAgICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIGNhbGxiYWNrID0gYXJndW1lbnRzWzBdO1xuICBhcmd1bWVudHNbMF0gPSB0aGlzO1xuICBjYWxsYmFjay5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICByZXR1cm4gdGhpcztcbn1cbiIsCiAgICAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBBcnJheS5mcm9tKHRoaXMpO1xufVxuIiwKICAgICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIGogPSAwLCBtID0gZ3JvdXBzLmxlbmd0aDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBpID0gMCwgbiA9IGdyb3VwLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgICAgdmFyIG5vZGUgPSBncm91cFtpXTtcbiAgICAgIGlmIChub2RlKSByZXR1cm4gbm9kZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cbiIsCiAgICAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIGxldCBzaXplID0gMDtcbiAgZm9yIChjb25zdCBub2RlIG9mIHRoaXMpICsrc2l6ZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICByZXR1cm4gc2l6ZTtcbn1cbiIsCiAgICAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiAhdGhpcy5ub2RlKCk7XG59XG4iLAogICAgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBqID0gMCwgbSA9IGdyb3Vwcy5sZW5ndGg7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgaSA9IDAsIG4gPSBncm91cC5sZW5ndGgsIG5vZGU7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIGNhbGxiYWNrLmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufVxuIiwKICAgICJleHBvcnQgdmFyIHhodG1sID0gXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgc3ZnOiBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsXG4gIHhodG1sOiB4aHRtbCxcbiAgeGxpbms6IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiLFxuICB4bWw6IFwiaHR0cDovL3d3dy53My5vcmcvWE1MLzE5OTgvbmFtZXNwYWNlXCIsXG4gIHhtbG5zOiBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAveG1sbnMvXCJcbn07XG4iLAogICAgImltcG9ydCBuYW1lc3BhY2VzIGZyb20gXCIuL25hbWVzcGFjZXMuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSkge1xuICB2YXIgcHJlZml4ID0gbmFtZSArPSBcIlwiLCBpID0gcHJlZml4LmluZGV4T2YoXCI6XCIpO1xuICBpZiAoaSA+PSAwICYmIChwcmVmaXggPSBuYW1lLnNsaWNlKDAsIGkpKSAhPT0gXCJ4bWxuc1wiKSBuYW1lID0gbmFtZS5zbGljZShpICsgMSk7XG4gIHJldHVybiBuYW1lc3BhY2VzLmhhc093blByb3BlcnR5KHByZWZpeCkgPyB7c3BhY2U6IG5hbWVzcGFjZXNbcHJlZml4XSwgbG9jYWw6IG5hbWV9IDogbmFtZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wcm90b3R5cGUtYnVpbHRpbnNcbn1cbiIsCiAgICAiaW1wb3J0IG5hbWVzcGFjZSBmcm9tIFwiLi4vbmFtZXNwYWNlLmpzXCI7XG5cbmZ1bmN0aW9uIGF0dHJSZW1vdmUobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJSZW1vdmVOUyhmdWxsbmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyQ29uc3RhbnQobmFtZSwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckNvbnN0YW50TlMoZnVsbG5hbWUsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNldEF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCwgdmFsdWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyRnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAodiA9PSBudWxsKSB0aGlzLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICBlbHNlIHRoaXMuc2V0QXR0cmlidXRlKG5hbWUsIHYpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyRnVuY3Rpb25OUyhmdWxsbmFtZSwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAodiA9PSBudWxsKSB0aGlzLnJlbW92ZUF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gICAgZWxzZSB0aGlzLnNldEF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCwgdik7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gIHZhciBmdWxsbmFtZSA9IG5hbWVzcGFjZShuYW1lKTtcblxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICB2YXIgbm9kZSA9IHRoaXMubm9kZSgpO1xuICAgIHJldHVybiBmdWxsbmFtZS5sb2NhbFxuICAgICAgICA/IG5vZGUuZ2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKVxuICAgICAgICA6IG5vZGUuZ2V0QXR0cmlidXRlKGZ1bGxuYW1lKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmVhY2goKHZhbHVlID09IG51bGxcbiAgICAgID8gKGZ1bGxuYW1lLmxvY2FsID8gYXR0clJlbW92ZU5TIDogYXR0clJlbW92ZSkgOiAodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgID8gKGZ1bGxuYW1lLmxvY2FsID8gYXR0ckZ1bmN0aW9uTlMgOiBhdHRyRnVuY3Rpb24pXG4gICAgICA6IChmdWxsbmFtZS5sb2NhbCA/IGF0dHJDb25zdGFudE5TIDogYXR0ckNvbnN0YW50KSkpKGZ1bGxuYW1lLCB2YWx1ZSkpO1xufVxuIiwKICAgICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihub2RlKSB7XG4gIHJldHVybiAobm9kZS5vd25lckRvY3VtZW50ICYmIG5vZGUub3duZXJEb2N1bWVudC5kZWZhdWx0VmlldykgLy8gbm9kZSBpcyBhIE5vZGVcbiAgICAgIHx8IChub2RlLmRvY3VtZW50ICYmIG5vZGUpIC8vIG5vZGUgaXMgYSBXaW5kb3dcbiAgICAgIHx8IG5vZGUuZGVmYXVsdFZpZXc7IC8vIG5vZGUgaXMgYSBEb2N1bWVudFxufVxuIiwKICAgICJpbXBvcnQgZGVmYXVsdFZpZXcgZnJvbSBcIi4uL3dpbmRvdy5qc1wiO1xuXG5mdW5jdGlvbiBzdHlsZVJlbW92ZShuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZUNvbnN0YW50KG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zdHlsZS5zZXRQcm9wZXJ0eShuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZUZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICh2ID09IG51bGwpIHRoaXMuc3R5bGUucmVtb3ZlUHJvcGVydHkobmFtZSk7XG4gICAgZWxzZSB0aGlzLnN0eWxlLnNldFByb3BlcnR5KG5hbWUsIHYsIHByaW9yaXR5KTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUsIHByaW9yaXR5KSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID4gMVxuICAgICAgPyB0aGlzLmVhY2goKHZhbHVlID09IG51bGxcbiAgICAgICAgICAgID8gc3R5bGVSZW1vdmUgOiB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgICAgPyBzdHlsZUZ1bmN0aW9uXG4gICAgICAgICAgICA6IHN0eWxlQ29uc3RhbnQpKG5hbWUsIHZhbHVlLCBwcmlvcml0eSA9PSBudWxsID8gXCJcIiA6IHByaW9yaXR5KSlcbiAgICAgIDogc3R5bGVWYWx1ZSh0aGlzLm5vZGUoKSwgbmFtZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHlsZVZhbHVlKG5vZGUsIG5hbWUpIHtcbiAgcmV0dXJuIG5vZGUuc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShuYW1lKVxuICAgICAgfHwgZGVmYXVsdFZpZXcobm9kZSkuZ2V0Q29tcHV0ZWRTdHlsZShub2RlLCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKG5hbWUpO1xufVxuIiwKICAgICJmdW5jdGlvbiBwcm9wZXJ0eVJlbW92ZShuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBkZWxldGUgdGhpc1tuYW1lXTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gcHJvcGVydHlDb25zdGFudChuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpc1tuYW1lXSA9IHZhbHVlO1xuICB9O1xufVxuXG5mdW5jdGlvbiBwcm9wZXJ0eUZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdiA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKHYgPT0gbnVsbCkgZGVsZXRlIHRoaXNbbmFtZV07XG4gICAgZWxzZSB0aGlzW25hbWVdID0gdjtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPiAxXG4gICAgICA/IHRoaXMuZWFjaCgodmFsdWUgPT0gbnVsbFxuICAgICAgICAgID8gcHJvcGVydHlSZW1vdmUgOiB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgID8gcHJvcGVydHlGdW5jdGlvblxuICAgICAgICAgIDogcHJvcGVydHlDb25zdGFudCkobmFtZSwgdmFsdWUpKVxuICAgICAgOiB0aGlzLm5vZGUoKVtuYW1lXTtcbn1cbiIsCiAgICAiZnVuY3Rpb24gY2xhc3NBcnJheShzdHJpbmcpIHtcbiAgcmV0dXJuIHN0cmluZy50cmltKCkuc3BsaXQoL158XFxzKy8pO1xufVxuXG5mdW5jdGlvbiBjbGFzc0xpc3Qobm9kZSkge1xuICByZXR1cm4gbm9kZS5jbGFzc0xpc3QgfHwgbmV3IENsYXNzTGlzdChub2RlKTtcbn1cblxuZnVuY3Rpb24gQ2xhc3NMaXN0KG5vZGUpIHtcbiAgdGhpcy5fbm9kZSA9IG5vZGU7XG4gIHRoaXMuX25hbWVzID0gY2xhc3NBcnJheShub2RlLmdldEF0dHJpYnV0ZShcImNsYXNzXCIpIHx8IFwiXCIpO1xufVxuXG5DbGFzc0xpc3QucHJvdG90eXBlID0ge1xuICBhZGQ6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaSA9IHRoaXMuX25hbWVzLmluZGV4T2YobmFtZSk7XG4gICAgaWYgKGkgPCAwKSB7XG4gICAgICB0aGlzLl9uYW1lcy5wdXNoKG5hbWUpO1xuICAgICAgdGhpcy5fbm9kZS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCB0aGlzLl9uYW1lcy5qb2luKFwiIFwiKSk7XG4gICAgfVxuICB9LFxuICByZW1vdmU6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaSA9IHRoaXMuX25hbWVzLmluZGV4T2YobmFtZSk7XG4gICAgaWYgKGkgPj0gMCkge1xuICAgICAgdGhpcy5fbmFtZXMuc3BsaWNlKGksIDEpO1xuICAgICAgdGhpcy5fbm9kZS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCB0aGlzLl9uYW1lcy5qb2luKFwiIFwiKSk7XG4gICAgfVxuICB9LFxuICBjb250YWluczogZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLl9uYW1lcy5pbmRleE9mKG5hbWUpID49IDA7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGNsYXNzZWRBZGQobm9kZSwgbmFtZXMpIHtcbiAgdmFyIGxpc3QgPSBjbGFzc0xpc3Qobm9kZSksIGkgPSAtMSwgbiA9IG5hbWVzLmxlbmd0aDtcbiAgd2hpbGUgKCsraSA8IG4pIGxpc3QuYWRkKG5hbWVzW2ldKTtcbn1cblxuZnVuY3Rpb24gY2xhc3NlZFJlbW92ZShub2RlLCBuYW1lcykge1xuICB2YXIgbGlzdCA9IGNsYXNzTGlzdChub2RlKSwgaSA9IC0xLCBuID0gbmFtZXMubGVuZ3RoO1xuICB3aGlsZSAoKytpIDwgbikgbGlzdC5yZW1vdmUobmFtZXNbaV0pO1xufVxuXG5mdW5jdGlvbiBjbGFzc2VkVHJ1ZShuYW1lcykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgY2xhc3NlZEFkZCh0aGlzLCBuYW1lcyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNsYXNzZWRGYWxzZShuYW1lcykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgY2xhc3NlZFJlbW92ZSh0aGlzLCBuYW1lcyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNsYXNzZWRGdW5jdGlvbihuYW1lcywgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICh2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpID8gY2xhc3NlZEFkZCA6IGNsYXNzZWRSZW1vdmUpKHRoaXMsIG5hbWVzKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdmFyIG5hbWVzID0gY2xhc3NBcnJheShuYW1lICsgXCJcIik7XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgdmFyIGxpc3QgPSBjbGFzc0xpc3QodGhpcy5ub2RlKCkpLCBpID0gLTEsIG4gPSBuYW1lcy5sZW5ndGg7XG4gICAgd2hpbGUgKCsraSA8IG4pIGlmICghbGlzdC5jb250YWlucyhuYW1lc1tpXSkpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmVhY2goKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICA/IGNsYXNzZWRGdW5jdGlvbiA6IHZhbHVlXG4gICAgICA/IGNsYXNzZWRUcnVlXG4gICAgICA6IGNsYXNzZWRGYWxzZSkobmFtZXMsIHZhbHVlKSk7XG59XG4iLAogICAgImZ1bmN0aW9uIHRleHRSZW1vdmUoKSB7XG4gIHRoaXMudGV4dENvbnRlbnQgPSBcIlwiO1xufVxuXG5mdW5jdGlvbiB0ZXh0Q29uc3RhbnQodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudGV4dENvbnRlbnQgPSB2YWx1ZTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdGV4dEZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdiA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy50ZXh0Q29udGVudCA9IHYgPT0gbnVsbCA/IFwiXCIgOiB2O1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyB0aGlzLmVhY2godmFsdWUgPT0gbnVsbFxuICAgICAgICAgID8gdGV4dFJlbW92ZSA6ICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgID8gdGV4dEZ1bmN0aW9uXG4gICAgICAgICAgOiB0ZXh0Q29uc3RhbnQpKHZhbHVlKSlcbiAgICAgIDogdGhpcy5ub2RlKCkudGV4dENvbnRlbnQ7XG59XG4iLAogICAgImZ1bmN0aW9uIGh0bWxSZW1vdmUoKSB7XG4gIHRoaXMuaW5uZXJIVE1MID0gXCJcIjtcbn1cblxuZnVuY3Rpb24gaHRtbENvbnN0YW50KHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmlubmVySFRNTCA9IHZhbHVlO1xuICB9O1xufVxuXG5mdW5jdGlvbiBodG1sRnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLmlubmVySFRNTCA9IHYgPT0gbnVsbCA/IFwiXCIgOiB2O1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyB0aGlzLmVhY2godmFsdWUgPT0gbnVsbFxuICAgICAgICAgID8gaHRtbFJlbW92ZSA6ICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgID8gaHRtbEZ1bmN0aW9uXG4gICAgICAgICAgOiBodG1sQ29uc3RhbnQpKHZhbHVlKSlcbiAgICAgIDogdGhpcy5ub2RlKCkuaW5uZXJIVE1MO1xufVxuIiwKICAgICJmdW5jdGlvbiByYWlzZSgpIHtcbiAgaWYgKHRoaXMubmV4dFNpYmxpbmcpIHRoaXMucGFyZW50Tm9kZS5hcHBlbmRDaGlsZCh0aGlzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmVhY2gocmFpc2UpO1xufVxuIiwKICAgICJmdW5jdGlvbiBsb3dlcigpIHtcbiAgaWYgKHRoaXMucHJldmlvdXNTaWJsaW5nKSB0aGlzLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRoaXMsIHRoaXMucGFyZW50Tm9kZS5maXJzdENoaWxkKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmVhY2gobG93ZXIpO1xufVxuIiwKICAgICJpbXBvcnQgbmFtZXNwYWNlIGZyb20gXCIuL25hbWVzcGFjZS5qc1wiO1xuaW1wb3J0IHt4aHRtbH0gZnJvbSBcIi4vbmFtZXNwYWNlcy5qc1wiO1xuXG5mdW5jdGlvbiBjcmVhdG9ySW5oZXJpdChuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZG9jdW1lbnQgPSB0aGlzLm93bmVyRG9jdW1lbnQsXG4gICAgICAgIHVyaSA9IHRoaXMubmFtZXNwYWNlVVJJO1xuICAgIHJldHVybiB1cmkgPT09IHhodG1sICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5uYW1lc3BhY2VVUkkgPT09IHhodG1sXG4gICAgICAgID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChuYW1lKVxuICAgICAgICA6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyh1cmksIG5hbWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjcmVhdG9yRml4ZWQoZnVsbG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLm93bmVyRG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUpIHtcbiAgdmFyIGZ1bGxuYW1lID0gbmFtZXNwYWNlKG5hbWUpO1xuICByZXR1cm4gKGZ1bGxuYW1lLmxvY2FsXG4gICAgICA/IGNyZWF0b3JGaXhlZFxuICAgICAgOiBjcmVhdG9ySW5oZXJpdCkoZnVsbG5hbWUpO1xufVxuIiwKICAgICJpbXBvcnQgY3JlYXRvciBmcm9tIFwiLi4vY3JlYXRvci5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lKSB7XG4gIHZhciBjcmVhdGUgPSB0eXBlb2YgbmFtZSA9PT0gXCJmdW5jdGlvblwiID8gbmFtZSA6IGNyZWF0b3IobmFtZSk7XG4gIHJldHVybiB0aGlzLnNlbGVjdChmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5hcHBlbmRDaGlsZChjcmVhdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gIH0pO1xufVxuIiwKICAgICJpbXBvcnQgY3JlYXRvciBmcm9tIFwiLi4vY3JlYXRvci5qc1wiO1xuaW1wb3J0IHNlbGVjdG9yIGZyb20gXCIuLi9zZWxlY3Rvci5qc1wiO1xuXG5mdW5jdGlvbiBjb25zdGFudE51bGwoKSB7XG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCBiZWZvcmUpIHtcbiAgdmFyIGNyZWF0ZSA9IHR5cGVvZiBuYW1lID09PSBcImZ1bmN0aW9uXCIgPyBuYW1lIDogY3JlYXRvcihuYW1lKSxcbiAgICAgIHNlbGVjdCA9IGJlZm9yZSA9PSBudWxsID8gY29uc3RhbnROdWxsIDogdHlwZW9mIGJlZm9yZSA9PT0gXCJmdW5jdGlvblwiID8gYmVmb3JlIDogc2VsZWN0b3IoYmVmb3JlKTtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0KGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmluc2VydEJlZm9yZShjcmVhdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKSwgc2VsZWN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgbnVsbCk7XG4gIH0pO1xufVxuIiwKICAgICJmdW5jdGlvbiByZW1vdmUoKSB7XG4gIHZhciBwYXJlbnQgPSB0aGlzLnBhcmVudE5vZGU7XG4gIGlmIChwYXJlbnQpIHBhcmVudC5yZW1vdmVDaGlsZCh0aGlzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmVhY2gocmVtb3ZlKTtcbn1cbiIsCiAgICAiZnVuY3Rpb24gc2VsZWN0aW9uX2Nsb25lU2hhbGxvdygpIHtcbiAgdmFyIGNsb25lID0gdGhpcy5jbG9uZU5vZGUoZmFsc2UpLCBwYXJlbnQgPSB0aGlzLnBhcmVudE5vZGU7XG4gIHJldHVybiBwYXJlbnQgPyBwYXJlbnQuaW5zZXJ0QmVmb3JlKGNsb25lLCB0aGlzLm5leHRTaWJsaW5nKSA6IGNsb25lO1xufVxuXG5mdW5jdGlvbiBzZWxlY3Rpb25fY2xvbmVEZWVwKCkge1xuICB2YXIgY2xvbmUgPSB0aGlzLmNsb25lTm9kZSh0cnVlKSwgcGFyZW50ID0gdGhpcy5wYXJlbnROb2RlO1xuICByZXR1cm4gcGFyZW50ID8gcGFyZW50Lmluc2VydEJlZm9yZShjbG9uZSwgdGhpcy5uZXh0U2libGluZykgOiBjbG9uZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oZGVlcCkge1xuICByZXR1cm4gdGhpcy5zZWxlY3QoZGVlcCA/IHNlbGVjdGlvbl9jbG9uZURlZXAgOiBzZWxlY3Rpb25fY2xvbmVTaGFsbG93KTtcbn1cbiIsCiAgICAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gdGhpcy5wcm9wZXJ0eShcIl9fZGF0YV9fXCIsIHZhbHVlKVxuICAgICAgOiB0aGlzLm5vZGUoKS5fX2RhdGFfXztcbn1cbiIsCiAgICAiZnVuY3Rpb24gY29udGV4dExpc3RlbmVyKGxpc3RlbmVyKSB7XG4gIHJldHVybiBmdW5jdGlvbihldmVudCkge1xuICAgIGxpc3RlbmVyLmNhbGwodGhpcywgZXZlbnQsIHRoaXMuX19kYXRhX18pO1xuICB9O1xufVxuXG5mdW5jdGlvbiBwYXJzZVR5cGVuYW1lcyh0eXBlbmFtZXMpIHtcbiAgcmV0dXJuIHR5cGVuYW1lcy50cmltKCkuc3BsaXQoL158XFxzKy8pLm1hcChmdW5jdGlvbih0KSB7XG4gICAgdmFyIG5hbWUgPSBcIlwiLCBpID0gdC5pbmRleE9mKFwiLlwiKTtcbiAgICBpZiAoaSA+PSAwKSBuYW1lID0gdC5zbGljZShpICsgMSksIHQgPSB0LnNsaWNlKDAsIGkpO1xuICAgIHJldHVybiB7dHlwZTogdCwgbmFtZTogbmFtZX07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBvblJlbW92ZSh0eXBlbmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG9uID0gdGhpcy5fX29uO1xuICAgIGlmICghb24pIHJldHVybjtcbiAgICBmb3IgKHZhciBqID0gMCwgaSA9IC0xLCBtID0gb24ubGVuZ3RoLCBvOyBqIDwgbTsgKytqKSB7XG4gICAgICBpZiAobyA9IG9uW2pdLCAoIXR5cGVuYW1lLnR5cGUgfHwgby50eXBlID09PSB0eXBlbmFtZS50eXBlKSAmJiBvLm5hbWUgPT09IHR5cGVuYW1lLm5hbWUpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKG8udHlwZSwgby5saXN0ZW5lciwgby5vcHRpb25zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9uWysraV0gPSBvO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoKytpKSBvbi5sZW5ndGggPSBpO1xuICAgIGVsc2UgZGVsZXRlIHRoaXMuX19vbjtcbiAgfTtcbn1cblxuZnVuY3Rpb24gb25BZGQodHlwZW5hbWUsIHZhbHVlLCBvcHRpb25zKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgb24gPSB0aGlzLl9fb24sIG8sIGxpc3RlbmVyID0gY29udGV4dExpc3RlbmVyKHZhbHVlKTtcbiAgICBpZiAob24pIGZvciAodmFyIGogPSAwLCBtID0gb24ubGVuZ3RoOyBqIDwgbTsgKytqKSB7XG4gICAgICBpZiAoKG8gPSBvbltqXSkudHlwZSA9PT0gdHlwZW5hbWUudHlwZSAmJiBvLm5hbWUgPT09IHR5cGVuYW1lLm5hbWUpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKG8udHlwZSwgby5saXN0ZW5lciwgby5vcHRpb25zKTtcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKG8udHlwZSwgby5saXN0ZW5lciA9IGxpc3RlbmVyLCBvLm9wdGlvbnMgPSBvcHRpb25zKTtcbiAgICAgICAgby52YWx1ZSA9IHZhbHVlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcih0eXBlbmFtZS50eXBlLCBsaXN0ZW5lciwgb3B0aW9ucyk7XG4gICAgbyA9IHt0eXBlOiB0eXBlbmFtZS50eXBlLCBuYW1lOiB0eXBlbmFtZS5uYW1lLCB2YWx1ZTogdmFsdWUsIGxpc3RlbmVyOiBsaXN0ZW5lciwgb3B0aW9uczogb3B0aW9uc307XG4gICAgaWYgKCFvbikgdGhpcy5fX29uID0gW29dO1xuICAgIGVsc2Ugb24ucHVzaChvKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odHlwZW5hbWUsIHZhbHVlLCBvcHRpb25zKSB7XG4gIHZhciB0eXBlbmFtZXMgPSBwYXJzZVR5cGVuYW1lcyh0eXBlbmFtZSArIFwiXCIpLCBpLCBuID0gdHlwZW5hbWVzLmxlbmd0aCwgdDtcblxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICB2YXIgb24gPSB0aGlzLm5vZGUoKS5fX29uO1xuICAgIGlmIChvbikgZm9yICh2YXIgaiA9IDAsIG0gPSBvbi5sZW5ndGgsIG87IGogPCBtOyArK2opIHtcbiAgICAgIGZvciAoaSA9IDAsIG8gPSBvbltqXTsgaSA8IG47ICsraSkge1xuICAgICAgICBpZiAoKHQgPSB0eXBlbmFtZXNbaV0pLnR5cGUgPT09IG8udHlwZSAmJiB0Lm5hbWUgPT09IG8ubmFtZSkge1xuICAgICAgICAgIHJldHVybiBvLnZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIG9uID0gdmFsdWUgPyBvbkFkZCA6IG9uUmVtb3ZlO1xuICBmb3IgKGkgPSAwOyBpIDwgbjsgKytpKSB0aGlzLmVhY2gob24odHlwZW5hbWVzW2ldLCB2YWx1ZSwgb3B0aW9ucykpO1xuICByZXR1cm4gdGhpcztcbn1cbiIsCiAgICAiaW1wb3J0IGRlZmF1bHRWaWV3IGZyb20gXCIuLi93aW5kb3cuanNcIjtcblxuZnVuY3Rpb24gZGlzcGF0Y2hFdmVudChub2RlLCB0eXBlLCBwYXJhbXMpIHtcbiAgdmFyIHdpbmRvdyA9IGRlZmF1bHRWaWV3KG5vZGUpLFxuICAgICAgZXZlbnQgPSB3aW5kb3cuQ3VzdG9tRXZlbnQ7XG5cbiAgaWYgKHR5cGVvZiBldmVudCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgZXZlbnQgPSBuZXcgZXZlbnQodHlwZSwgcGFyYW1zKTtcbiAgfSBlbHNlIHtcbiAgICBldmVudCA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFdmVudChcIkV2ZW50XCIpO1xuICAgIGlmIChwYXJhbXMpIGV2ZW50LmluaXRFdmVudCh0eXBlLCBwYXJhbXMuYnViYmxlcywgcGFyYW1zLmNhbmNlbGFibGUpLCBldmVudC5kZXRhaWwgPSBwYXJhbXMuZGV0YWlsO1xuICAgIGVsc2UgZXZlbnQuaW5pdEV2ZW50KHR5cGUsIGZhbHNlLCBmYWxzZSk7XG4gIH1cblxuICBub2RlLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xufVxuXG5mdW5jdGlvbiBkaXNwYXRjaENvbnN0YW50KHR5cGUsIHBhcmFtcykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGRpc3BhdGNoRXZlbnQodGhpcywgdHlwZSwgcGFyYW1zKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZGlzcGF0Y2hGdW5jdGlvbih0eXBlLCBwYXJhbXMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkaXNwYXRjaEV2ZW50KHRoaXMsIHR5cGUsIHBhcmFtcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odHlwZSwgcGFyYW1zKSB7XG4gIHJldHVybiB0aGlzLmVhY2goKHR5cGVvZiBwYXJhbXMgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgPyBkaXNwYXRjaEZ1bmN0aW9uXG4gICAgICA6IGRpc3BhdGNoQ29uc3RhbnQpKHR5cGUsIHBhcmFtcykpO1xufVxuIiwKICAgICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiooKSB7XG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgaiA9IDAsIG0gPSBncm91cHMubGVuZ3RoOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIGkgPSAwLCBuID0gZ3JvdXAubGVuZ3RoLCBub2RlOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB5aWVsZCBub2RlO1xuICAgIH1cbiAgfVxufVxuIiwKICAgICJpbXBvcnQgc2VsZWN0aW9uX3NlbGVjdCBmcm9tIFwiLi9zZWxlY3QuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fc2VsZWN0QWxsIGZyb20gXCIuL3NlbGVjdEFsbC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9zZWxlY3RDaGlsZCBmcm9tIFwiLi9zZWxlY3RDaGlsZC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9zZWxlY3RDaGlsZHJlbiBmcm9tIFwiLi9zZWxlY3RDaGlsZHJlbi5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9maWx0ZXIgZnJvbSBcIi4vZmlsdGVyLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2RhdGEgZnJvbSBcIi4vZGF0YS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9lbnRlciBmcm9tIFwiLi9lbnRlci5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9leGl0IGZyb20gXCIuL2V4aXQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fam9pbiBmcm9tIFwiLi9qb2luLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX21lcmdlIGZyb20gXCIuL21lcmdlLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX29yZGVyIGZyb20gXCIuL29yZGVyLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3NvcnQgZnJvbSBcIi4vc29ydC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9jYWxsIGZyb20gXCIuL2NhbGwuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fbm9kZXMgZnJvbSBcIi4vbm9kZXMuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fbm9kZSBmcm9tIFwiLi9ub2RlLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3NpemUgZnJvbSBcIi4vc2l6ZS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9lbXB0eSBmcm9tIFwiLi9lbXB0eS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9lYWNoIGZyb20gXCIuL2VhY2guanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fYXR0ciBmcm9tIFwiLi9hdHRyLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3N0eWxlIGZyb20gXCIuL3N0eWxlLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3Byb3BlcnR5IGZyb20gXCIuL3Byb3BlcnR5LmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2NsYXNzZWQgZnJvbSBcIi4vY2xhc3NlZC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl90ZXh0IGZyb20gXCIuL3RleHQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25faHRtbCBmcm9tIFwiLi9odG1sLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3JhaXNlIGZyb20gXCIuL3JhaXNlLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2xvd2VyIGZyb20gXCIuL2xvd2VyLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2FwcGVuZCBmcm9tIFwiLi9hcHBlbmQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25faW5zZXJ0IGZyb20gXCIuL2luc2VydC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9yZW1vdmUgZnJvbSBcIi4vcmVtb3ZlLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2Nsb25lIGZyb20gXCIuL2Nsb25lLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2RhdHVtIGZyb20gXCIuL2RhdHVtLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX29uIGZyb20gXCIuL29uLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2Rpc3BhdGNoIGZyb20gXCIuL2Rpc3BhdGNoLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2l0ZXJhdG9yIGZyb20gXCIuL2l0ZXJhdG9yLmpzXCI7XG5cbmV4cG9ydCB2YXIgcm9vdCA9IFtudWxsXTtcblxuZXhwb3J0IGZ1bmN0aW9uIFNlbGVjdGlvbihncm91cHMsIHBhcmVudHMpIHtcbiAgdGhpcy5fZ3JvdXBzID0gZ3JvdXBzO1xuICB0aGlzLl9wYXJlbnRzID0gcGFyZW50cztcbn1cblxuZnVuY3Rpb24gc2VsZWN0aW9uKCkge1xuICByZXR1cm4gbmV3IFNlbGVjdGlvbihbW2RvY3VtZW50LmRvY3VtZW50RWxlbWVudF1dLCByb290KTtcbn1cblxuZnVuY3Rpb24gc2VsZWN0aW9uX3NlbGVjdGlvbigpIHtcbiAgcmV0dXJuIHRoaXM7XG59XG5cblNlbGVjdGlvbi5wcm90b3R5cGUgPSBzZWxlY3Rpb24ucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogU2VsZWN0aW9uLFxuICBzZWxlY3Q6IHNlbGVjdGlvbl9zZWxlY3QsXG4gIHNlbGVjdEFsbDogc2VsZWN0aW9uX3NlbGVjdEFsbCxcbiAgc2VsZWN0Q2hpbGQ6IHNlbGVjdGlvbl9zZWxlY3RDaGlsZCxcbiAgc2VsZWN0Q2hpbGRyZW46IHNlbGVjdGlvbl9zZWxlY3RDaGlsZHJlbixcbiAgZmlsdGVyOiBzZWxlY3Rpb25fZmlsdGVyLFxuICBkYXRhOiBzZWxlY3Rpb25fZGF0YSxcbiAgZW50ZXI6IHNlbGVjdGlvbl9lbnRlcixcbiAgZXhpdDogc2VsZWN0aW9uX2V4aXQsXG4gIGpvaW46IHNlbGVjdGlvbl9qb2luLFxuICBtZXJnZTogc2VsZWN0aW9uX21lcmdlLFxuICBzZWxlY3Rpb246IHNlbGVjdGlvbl9zZWxlY3Rpb24sXG4gIG9yZGVyOiBzZWxlY3Rpb25fb3JkZXIsXG4gIHNvcnQ6IHNlbGVjdGlvbl9zb3J0LFxuICBjYWxsOiBzZWxlY3Rpb25fY2FsbCxcbiAgbm9kZXM6IHNlbGVjdGlvbl9ub2RlcyxcbiAgbm9kZTogc2VsZWN0aW9uX25vZGUsXG4gIHNpemU6IHNlbGVjdGlvbl9zaXplLFxuICBlbXB0eTogc2VsZWN0aW9uX2VtcHR5LFxuICBlYWNoOiBzZWxlY3Rpb25fZWFjaCxcbiAgYXR0cjogc2VsZWN0aW9uX2F0dHIsXG4gIHN0eWxlOiBzZWxlY3Rpb25fc3R5bGUsXG4gIHByb3BlcnR5OiBzZWxlY3Rpb25fcHJvcGVydHksXG4gIGNsYXNzZWQ6IHNlbGVjdGlvbl9jbGFzc2VkLFxuICB0ZXh0OiBzZWxlY3Rpb25fdGV4dCxcbiAgaHRtbDogc2VsZWN0aW9uX2h0bWwsXG4gIHJhaXNlOiBzZWxlY3Rpb25fcmFpc2UsXG4gIGxvd2VyOiBzZWxlY3Rpb25fbG93ZXIsXG4gIGFwcGVuZDogc2VsZWN0aW9uX2FwcGVuZCxcbiAgaW5zZXJ0OiBzZWxlY3Rpb25faW5zZXJ0LFxuICByZW1vdmU6IHNlbGVjdGlvbl9yZW1vdmUsXG4gIGNsb25lOiBzZWxlY3Rpb25fY2xvbmUsXG4gIGRhdHVtOiBzZWxlY3Rpb25fZGF0dW0sXG4gIG9uOiBzZWxlY3Rpb25fb24sXG4gIGRpc3BhdGNoOiBzZWxlY3Rpb25fZGlzcGF0Y2gsXG4gIFtTeW1ib2wuaXRlcmF0b3JdOiBzZWxlY3Rpb25faXRlcmF0b3Jcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHNlbGVjdGlvbjtcbiIsCiAgICAiaW1wb3J0IHtTZWxlY3Rpb24sIHJvb3R9IGZyb20gXCIuL3NlbGVjdGlvbi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3Rvcikge1xuICByZXR1cm4gdHlwZW9mIHNlbGVjdG9yID09PSBcInN0cmluZ1wiXG4gICAgICA/IG5ldyBTZWxlY3Rpb24oW1tkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKV1dLCBbZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XSlcbiAgICAgIDogbmV3IFNlbGVjdGlvbihbW3NlbGVjdG9yXV0sIHJvb3QpO1xufVxuIiwKICAgICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjb25zdHJ1Y3RvciwgZmFjdG9yeSwgcHJvdG90eXBlKSB7XG4gIGNvbnN0cnVjdG9yLnByb3RvdHlwZSA9IGZhY3RvcnkucHJvdG90eXBlID0gcHJvdG90eXBlO1xuICBwcm90b3R5cGUuY29uc3RydWN0b3IgPSBjb25zdHJ1Y3Rvcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4dGVuZChwYXJlbnQsIGRlZmluaXRpb24pIHtcbiAgdmFyIHByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUocGFyZW50LnByb3RvdHlwZSk7XG4gIGZvciAodmFyIGtleSBpbiBkZWZpbml0aW9uKSBwcm90b3R5cGVba2V5XSA9IGRlZmluaXRpb25ba2V5XTtcbiAgcmV0dXJuIHByb3RvdHlwZTtcbn1cbiIsCiAgICAiaW1wb3J0IGRlZmluZSwge2V4dGVuZH0gZnJvbSBcIi4vZGVmaW5lLmpzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBDb2xvcigpIHt9XG5cbmV4cG9ydCB2YXIgZGFya2VyID0gMC43O1xuZXhwb3J0IHZhciBicmlnaHRlciA9IDEgLyBkYXJrZXI7XG5cbnZhciByZUkgPSBcIlxcXFxzKihbKy1dP1xcXFxkKylcXFxccypcIixcbiAgICByZU4gPSBcIlxcXFxzKihbKy1dPyg/OlxcXFxkKlxcXFwuKT9cXFxcZCsoPzpbZUVdWystXT9cXFxcZCspPylcXFxccypcIixcbiAgICByZVAgPSBcIlxcXFxzKihbKy1dPyg/OlxcXFxkKlxcXFwuKT9cXFxcZCsoPzpbZUVdWystXT9cXFxcZCspPyklXFxcXHMqXCIsXG4gICAgcmVIZXggPSAvXiMoWzAtOWEtZl17Myw4fSkkLyxcbiAgICByZVJnYkludGVnZXIgPSBuZXcgUmVnRXhwKGBecmdiXFxcXCgke3JlSX0sJHtyZUl9LCR7cmVJfVxcXFwpJGApLFxuICAgIHJlUmdiUGVyY2VudCA9IG5ldyBSZWdFeHAoYF5yZ2JcXFxcKCR7cmVQfSwke3JlUH0sJHtyZVB9XFxcXCkkYCksXG4gICAgcmVSZ2JhSW50ZWdlciA9IG5ldyBSZWdFeHAoYF5yZ2JhXFxcXCgke3JlSX0sJHtyZUl9LCR7cmVJfSwke3JlTn1cXFxcKSRgKSxcbiAgICByZVJnYmFQZXJjZW50ID0gbmV3IFJlZ0V4cChgXnJnYmFcXFxcKCR7cmVQfSwke3JlUH0sJHtyZVB9LCR7cmVOfVxcXFwpJGApLFxuICAgIHJlSHNsUGVyY2VudCA9IG5ldyBSZWdFeHAoYF5oc2xcXFxcKCR7cmVOfSwke3JlUH0sJHtyZVB9XFxcXCkkYCksXG4gICAgcmVIc2xhUGVyY2VudCA9IG5ldyBSZWdFeHAoYF5oc2xhXFxcXCgke3JlTn0sJHtyZVB9LCR7cmVQfSwke3JlTn1cXFxcKSRgKTtcblxudmFyIG5hbWVkID0ge1xuICBhbGljZWJsdWU6IDB4ZjBmOGZmLFxuICBhbnRpcXVld2hpdGU6IDB4ZmFlYmQ3LFxuICBhcXVhOiAweDAwZmZmZixcbiAgYXF1YW1hcmluZTogMHg3ZmZmZDQsXG4gIGF6dXJlOiAweGYwZmZmZixcbiAgYmVpZ2U6IDB4ZjVmNWRjLFxuICBiaXNxdWU6IDB4ZmZlNGM0LFxuICBibGFjazogMHgwMDAwMDAsXG4gIGJsYW5jaGVkYWxtb25kOiAweGZmZWJjZCxcbiAgYmx1ZTogMHgwMDAwZmYsXG4gIGJsdWV2aW9sZXQ6IDB4OGEyYmUyLFxuICBicm93bjogMHhhNTJhMmEsXG4gIGJ1cmx5d29vZDogMHhkZWI4ODcsXG4gIGNhZGV0Ymx1ZTogMHg1ZjllYTAsXG4gIGNoYXJ0cmV1c2U6IDB4N2ZmZjAwLFxuICBjaG9jb2xhdGU6IDB4ZDI2OTFlLFxuICBjb3JhbDogMHhmZjdmNTAsXG4gIGNvcm5mbG93ZXJibHVlOiAweDY0OTVlZCxcbiAgY29ybnNpbGs6IDB4ZmZmOGRjLFxuICBjcmltc29uOiAweGRjMTQzYyxcbiAgY3lhbjogMHgwMGZmZmYsXG4gIGRhcmtibHVlOiAweDAwMDA4YixcbiAgZGFya2N5YW46IDB4MDA4YjhiLFxuICBkYXJrZ29sZGVucm9kOiAweGI4ODYwYixcbiAgZGFya2dyYXk6IDB4YTlhOWE5LFxuICBkYXJrZ3JlZW46IDB4MDA2NDAwLFxuICBkYXJrZ3JleTogMHhhOWE5YTksXG4gIGRhcmtraGFraTogMHhiZGI3NmIsXG4gIGRhcmttYWdlbnRhOiAweDhiMDA4YixcbiAgZGFya29saXZlZ3JlZW46IDB4NTU2YjJmLFxuICBkYXJrb3JhbmdlOiAweGZmOGMwMCxcbiAgZGFya29yY2hpZDogMHg5OTMyY2MsXG4gIGRhcmtyZWQ6IDB4OGIwMDAwLFxuICBkYXJrc2FsbW9uOiAweGU5OTY3YSxcbiAgZGFya3NlYWdyZWVuOiAweDhmYmM4ZixcbiAgZGFya3NsYXRlYmx1ZTogMHg0ODNkOGIsXG4gIGRhcmtzbGF0ZWdyYXk6IDB4MmY0ZjRmLFxuICBkYXJrc2xhdGVncmV5OiAweDJmNGY0ZixcbiAgZGFya3R1cnF1b2lzZTogMHgwMGNlZDEsXG4gIGRhcmt2aW9sZXQ6IDB4OTQwMGQzLFxuICBkZWVwcGluazogMHhmZjE0OTMsXG4gIGRlZXBza3libHVlOiAweDAwYmZmZixcbiAgZGltZ3JheTogMHg2OTY5NjksXG4gIGRpbWdyZXk6IDB4Njk2OTY5LFxuICBkb2RnZXJibHVlOiAweDFlOTBmZixcbiAgZmlyZWJyaWNrOiAweGIyMjIyMixcbiAgZmxvcmFsd2hpdGU6IDB4ZmZmYWYwLFxuICBmb3Jlc3RncmVlbjogMHgyMjhiMjIsXG4gIGZ1Y2hzaWE6IDB4ZmYwMGZmLFxuICBnYWluc2Jvcm86IDB4ZGNkY2RjLFxuICBnaG9zdHdoaXRlOiAweGY4ZjhmZixcbiAgZ29sZDogMHhmZmQ3MDAsXG4gIGdvbGRlbnJvZDogMHhkYWE1MjAsXG4gIGdyYXk6IDB4ODA4MDgwLFxuICBncmVlbjogMHgwMDgwMDAsXG4gIGdyZWVueWVsbG93OiAweGFkZmYyZixcbiAgZ3JleTogMHg4MDgwODAsXG4gIGhvbmV5ZGV3OiAweGYwZmZmMCxcbiAgaG90cGluazogMHhmZjY5YjQsXG4gIGluZGlhbnJlZDogMHhjZDVjNWMsXG4gIGluZGlnbzogMHg0YjAwODIsXG4gIGl2b3J5OiAweGZmZmZmMCxcbiAga2hha2k6IDB4ZjBlNjhjLFxuICBsYXZlbmRlcjogMHhlNmU2ZmEsXG4gIGxhdmVuZGVyYmx1c2g6IDB4ZmZmMGY1LFxuICBsYXduZ3JlZW46IDB4N2NmYzAwLFxuICBsZW1vbmNoaWZmb246IDB4ZmZmYWNkLFxuICBsaWdodGJsdWU6IDB4YWRkOGU2LFxuICBsaWdodGNvcmFsOiAweGYwODA4MCxcbiAgbGlnaHRjeWFuOiAweGUwZmZmZixcbiAgbGlnaHRnb2xkZW5yb2R5ZWxsb3c6IDB4ZmFmYWQyLFxuICBsaWdodGdyYXk6IDB4ZDNkM2QzLFxuICBsaWdodGdyZWVuOiAweDkwZWU5MCxcbiAgbGlnaHRncmV5OiAweGQzZDNkMyxcbiAgbGlnaHRwaW5rOiAweGZmYjZjMSxcbiAgbGlnaHRzYWxtb246IDB4ZmZhMDdhLFxuICBsaWdodHNlYWdyZWVuOiAweDIwYjJhYSxcbiAgbGlnaHRza3libHVlOiAweDg3Y2VmYSxcbiAgbGlnaHRzbGF0ZWdyYXk6IDB4Nzc4ODk5LFxuICBsaWdodHNsYXRlZ3JleTogMHg3Nzg4OTksXG4gIGxpZ2h0c3RlZWxibHVlOiAweGIwYzRkZSxcbiAgbGlnaHR5ZWxsb3c6IDB4ZmZmZmUwLFxuICBsaW1lOiAweDAwZmYwMCxcbiAgbGltZWdyZWVuOiAweDMyY2QzMixcbiAgbGluZW46IDB4ZmFmMGU2LFxuICBtYWdlbnRhOiAweGZmMDBmZixcbiAgbWFyb29uOiAweDgwMDAwMCxcbiAgbWVkaXVtYXF1YW1hcmluZTogMHg2NmNkYWEsXG4gIG1lZGl1bWJsdWU6IDB4MDAwMGNkLFxuICBtZWRpdW1vcmNoaWQ6IDB4YmE1NWQzLFxuICBtZWRpdW1wdXJwbGU6IDB4OTM3MGRiLFxuICBtZWRpdW1zZWFncmVlbjogMHgzY2IzNzEsXG4gIG1lZGl1bXNsYXRlYmx1ZTogMHg3YjY4ZWUsXG4gIG1lZGl1bXNwcmluZ2dyZWVuOiAweDAwZmE5YSxcbiAgbWVkaXVtdHVycXVvaXNlOiAweDQ4ZDFjYyxcbiAgbWVkaXVtdmlvbGV0cmVkOiAweGM3MTU4NSxcbiAgbWlkbmlnaHRibHVlOiAweDE5MTk3MCxcbiAgbWludGNyZWFtOiAweGY1ZmZmYSxcbiAgbWlzdHlyb3NlOiAweGZmZTRlMSxcbiAgbW9jY2FzaW46IDB4ZmZlNGI1LFxuICBuYXZham93aGl0ZTogMHhmZmRlYWQsXG4gIG5hdnk6IDB4MDAwMDgwLFxuICBvbGRsYWNlOiAweGZkZjVlNixcbiAgb2xpdmU6IDB4ODA4MDAwLFxuICBvbGl2ZWRyYWI6IDB4NmI4ZTIzLFxuICBvcmFuZ2U6IDB4ZmZhNTAwLFxuICBvcmFuZ2VyZWQ6IDB4ZmY0NTAwLFxuICBvcmNoaWQ6IDB4ZGE3MGQ2LFxuICBwYWxlZ29sZGVucm9kOiAweGVlZThhYSxcbiAgcGFsZWdyZWVuOiAweDk4ZmI5OCxcbiAgcGFsZXR1cnF1b2lzZTogMHhhZmVlZWUsXG4gIHBhbGV2aW9sZXRyZWQ6IDB4ZGI3MDkzLFxuICBwYXBheWF3aGlwOiAweGZmZWZkNSxcbiAgcGVhY2hwdWZmOiAweGZmZGFiOSxcbiAgcGVydTogMHhjZDg1M2YsXG4gIHBpbms6IDB4ZmZjMGNiLFxuICBwbHVtOiAweGRkYTBkZCxcbiAgcG93ZGVyYmx1ZTogMHhiMGUwZTYsXG4gIHB1cnBsZTogMHg4MDAwODAsXG4gIHJlYmVjY2FwdXJwbGU6IDB4NjYzMzk5LFxuICByZWQ6IDB4ZmYwMDAwLFxuICByb3N5YnJvd246IDB4YmM4ZjhmLFxuICByb3lhbGJsdWU6IDB4NDE2OWUxLFxuICBzYWRkbGVicm93bjogMHg4YjQ1MTMsXG4gIHNhbG1vbjogMHhmYTgwNzIsXG4gIHNhbmR5YnJvd246IDB4ZjRhNDYwLFxuICBzZWFncmVlbjogMHgyZThiNTcsXG4gIHNlYXNoZWxsOiAweGZmZjVlZSxcbiAgc2llbm5hOiAweGEwNTIyZCxcbiAgc2lsdmVyOiAweGMwYzBjMCxcbiAgc2t5Ymx1ZTogMHg4N2NlZWIsXG4gIHNsYXRlYmx1ZTogMHg2YTVhY2QsXG4gIHNsYXRlZ3JheTogMHg3MDgwOTAsXG4gIHNsYXRlZ3JleTogMHg3MDgwOTAsXG4gIHNub3c6IDB4ZmZmYWZhLFxuICBzcHJpbmdncmVlbjogMHgwMGZmN2YsXG4gIHN0ZWVsYmx1ZTogMHg0NjgyYjQsXG4gIHRhbjogMHhkMmI0OGMsXG4gIHRlYWw6IDB4MDA4MDgwLFxuICB0aGlzdGxlOiAweGQ4YmZkOCxcbiAgdG9tYXRvOiAweGZmNjM0NyxcbiAgdHVycXVvaXNlOiAweDQwZTBkMCxcbiAgdmlvbGV0OiAweGVlODJlZSxcbiAgd2hlYXQ6IDB4ZjVkZWIzLFxuICB3aGl0ZTogMHhmZmZmZmYsXG4gIHdoaXRlc21va2U6IDB4ZjVmNWY1LFxuICB5ZWxsb3c6IDB4ZmZmZjAwLFxuICB5ZWxsb3dncmVlbjogMHg5YWNkMzJcbn07XG5cbmRlZmluZShDb2xvciwgY29sb3IsIHtcbiAgY29weShjaGFubmVscykge1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKG5ldyB0aGlzLmNvbnN0cnVjdG9yLCB0aGlzLCBjaGFubmVscyk7XG4gIH0sXG4gIGRpc3BsYXlhYmxlKCkge1xuICAgIHJldHVybiB0aGlzLnJnYigpLmRpc3BsYXlhYmxlKCk7XG4gIH0sXG4gIGhleDogY29sb3JfZm9ybWF0SGV4LCAvLyBEZXByZWNhdGVkISBVc2UgY29sb3IuZm9ybWF0SGV4LlxuICBmb3JtYXRIZXg6IGNvbG9yX2Zvcm1hdEhleCxcbiAgZm9ybWF0SGV4ODogY29sb3JfZm9ybWF0SGV4OCxcbiAgZm9ybWF0SHNsOiBjb2xvcl9mb3JtYXRIc2wsXG4gIGZvcm1hdFJnYjogY29sb3JfZm9ybWF0UmdiLFxuICB0b1N0cmluZzogY29sb3JfZm9ybWF0UmdiXG59KTtcblxuZnVuY3Rpb24gY29sb3JfZm9ybWF0SGV4KCkge1xuICByZXR1cm4gdGhpcy5yZ2IoKS5mb3JtYXRIZXgoKTtcbn1cblxuZnVuY3Rpb24gY29sb3JfZm9ybWF0SGV4OCgpIHtcbiAgcmV0dXJuIHRoaXMucmdiKCkuZm9ybWF0SGV4OCgpO1xufVxuXG5mdW5jdGlvbiBjb2xvcl9mb3JtYXRIc2woKSB7XG4gIHJldHVybiBoc2xDb252ZXJ0KHRoaXMpLmZvcm1hdEhzbCgpO1xufVxuXG5mdW5jdGlvbiBjb2xvcl9mb3JtYXRSZ2IoKSB7XG4gIHJldHVybiB0aGlzLnJnYigpLmZvcm1hdFJnYigpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb2xvcihmb3JtYXQpIHtcbiAgdmFyIG0sIGw7XG4gIGZvcm1hdCA9IChmb3JtYXQgKyBcIlwiKS50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgcmV0dXJuIChtID0gcmVIZXguZXhlYyhmb3JtYXQpKSA/IChsID0gbVsxXS5sZW5ndGgsIG0gPSBwYXJzZUludChtWzFdLCAxNiksIGwgPT09IDYgPyByZ2JuKG0pIC8vICNmZjAwMDBcbiAgICAgIDogbCA9PT0gMyA/IG5ldyBSZ2IoKG0gPj4gOCAmIDB4ZikgfCAobSA+PiA0ICYgMHhmMCksIChtID4+IDQgJiAweGYpIHwgKG0gJiAweGYwKSwgKChtICYgMHhmKSA8PCA0KSB8IChtICYgMHhmKSwgMSkgLy8gI2YwMFxuICAgICAgOiBsID09PSA4ID8gcmdiYShtID4+IDI0ICYgMHhmZiwgbSA+PiAxNiAmIDB4ZmYsIG0gPj4gOCAmIDB4ZmYsIChtICYgMHhmZikgLyAweGZmKSAvLyAjZmYwMDAwMDBcbiAgICAgIDogbCA9PT0gNCA/IHJnYmEoKG0gPj4gMTIgJiAweGYpIHwgKG0gPj4gOCAmIDB4ZjApLCAobSA+PiA4ICYgMHhmKSB8IChtID4+IDQgJiAweGYwKSwgKG0gPj4gNCAmIDB4ZikgfCAobSAmIDB4ZjApLCAoKChtICYgMHhmKSA8PCA0KSB8IChtICYgMHhmKSkgLyAweGZmKSAvLyAjZjAwMFxuICAgICAgOiBudWxsKSAvLyBpbnZhbGlkIGhleFxuICAgICAgOiAobSA9IHJlUmdiSW50ZWdlci5leGVjKGZvcm1hdCkpID8gbmV3IFJnYihtWzFdLCBtWzJdLCBtWzNdLCAxKSAvLyByZ2IoMjU1LCAwLCAwKVxuICAgICAgOiAobSA9IHJlUmdiUGVyY2VudC5leGVjKGZvcm1hdCkpID8gbmV3IFJnYihtWzFdICogMjU1IC8gMTAwLCBtWzJdICogMjU1IC8gMTAwLCBtWzNdICogMjU1IC8gMTAwLCAxKSAvLyByZ2IoMTAwJSwgMCUsIDAlKVxuICAgICAgOiAobSA9IHJlUmdiYUludGVnZXIuZXhlYyhmb3JtYXQpKSA/IHJnYmEobVsxXSwgbVsyXSwgbVszXSwgbVs0XSkgLy8gcmdiYSgyNTUsIDAsIDAsIDEpXG4gICAgICA6IChtID0gcmVSZ2JhUGVyY2VudC5leGVjKGZvcm1hdCkpID8gcmdiYShtWzFdICogMjU1IC8gMTAwLCBtWzJdICogMjU1IC8gMTAwLCBtWzNdICogMjU1IC8gMTAwLCBtWzRdKSAvLyByZ2IoMTAwJSwgMCUsIDAlLCAxKVxuICAgICAgOiAobSA9IHJlSHNsUGVyY2VudC5leGVjKGZvcm1hdCkpID8gaHNsYShtWzFdLCBtWzJdIC8gMTAwLCBtWzNdIC8gMTAwLCAxKSAvLyBoc2woMTIwLCA1MCUsIDUwJSlcbiAgICAgIDogKG0gPSByZUhzbGFQZXJjZW50LmV4ZWMoZm9ybWF0KSkgPyBoc2xhKG1bMV0sIG1bMl0gLyAxMDAsIG1bM10gLyAxMDAsIG1bNF0pIC8vIGhzbGEoMTIwLCA1MCUsIDUwJSwgMSlcbiAgICAgIDogbmFtZWQuaGFzT3duUHJvcGVydHkoZm9ybWF0KSA/IHJnYm4obmFtZWRbZm9ybWF0XSkgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wcm90b3R5cGUtYnVpbHRpbnNcbiAgICAgIDogZm9ybWF0ID09PSBcInRyYW5zcGFyZW50XCIgPyBuZXcgUmdiKE5hTiwgTmFOLCBOYU4sIDApXG4gICAgICA6IG51bGw7XG59XG5cbmZ1bmN0aW9uIHJnYm4obikge1xuICByZXR1cm4gbmV3IFJnYihuID4+IDE2ICYgMHhmZiwgbiA+PiA4ICYgMHhmZiwgbiAmIDB4ZmYsIDEpO1xufVxuXG5mdW5jdGlvbiByZ2JhKHIsIGcsIGIsIGEpIHtcbiAgaWYgKGEgPD0gMCkgciA9IGcgPSBiID0gTmFOO1xuICByZXR1cm4gbmV3IFJnYihyLCBnLCBiLCBhKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJnYkNvbnZlcnQobykge1xuICBpZiAoIShvIGluc3RhbmNlb2YgQ29sb3IpKSBvID0gY29sb3Iobyk7XG4gIGlmICghbykgcmV0dXJuIG5ldyBSZ2I7XG4gIG8gPSBvLnJnYigpO1xuICByZXR1cm4gbmV3IFJnYihvLnIsIG8uZywgby5iLCBvLm9wYWNpdHkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmdiKHIsIGcsIGIsIG9wYWNpdHkpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPT09IDEgPyByZ2JDb252ZXJ0KHIpIDogbmV3IFJnYihyLCBnLCBiLCBvcGFjaXR5ID09IG51bGwgPyAxIDogb3BhY2l0eSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZ2IociwgZywgYiwgb3BhY2l0eSkge1xuICB0aGlzLnIgPSArcjtcbiAgdGhpcy5nID0gK2c7XG4gIHRoaXMuYiA9ICtiO1xuICB0aGlzLm9wYWNpdHkgPSArb3BhY2l0eTtcbn1cblxuZGVmaW5lKFJnYiwgcmdiLCBleHRlbmQoQ29sb3IsIHtcbiAgYnJpZ2h0ZXIoaykge1xuICAgIGsgPSBrID09IG51bGwgPyBicmlnaHRlciA6IE1hdGgucG93KGJyaWdodGVyLCBrKTtcbiAgICByZXR1cm4gbmV3IFJnYih0aGlzLnIgKiBrLCB0aGlzLmcgKiBrLCB0aGlzLmIgKiBrLCB0aGlzLm9wYWNpdHkpO1xuICB9LFxuICBkYXJrZXIoaykge1xuICAgIGsgPSBrID09IG51bGwgPyBkYXJrZXIgOiBNYXRoLnBvdyhkYXJrZXIsIGspO1xuICAgIHJldHVybiBuZXcgUmdiKHRoaXMuciAqIGssIHRoaXMuZyAqIGssIHRoaXMuYiAqIGssIHRoaXMub3BhY2l0eSk7XG4gIH0sXG4gIHJnYigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgY2xhbXAoKSB7XG4gICAgcmV0dXJuIG5ldyBSZ2IoY2xhbXBpKHRoaXMuciksIGNsYW1waSh0aGlzLmcpLCBjbGFtcGkodGhpcy5iKSwgY2xhbXBhKHRoaXMub3BhY2l0eSkpO1xuICB9LFxuICBkaXNwbGF5YWJsZSgpIHtcbiAgICByZXR1cm4gKC0wLjUgPD0gdGhpcy5yICYmIHRoaXMuciA8IDI1NS41KVxuICAgICAgICAmJiAoLTAuNSA8PSB0aGlzLmcgJiYgdGhpcy5nIDwgMjU1LjUpXG4gICAgICAgICYmICgtMC41IDw9IHRoaXMuYiAmJiB0aGlzLmIgPCAyNTUuNSlcbiAgICAgICAgJiYgKDAgPD0gdGhpcy5vcGFjaXR5ICYmIHRoaXMub3BhY2l0eSA8PSAxKTtcbiAgfSxcbiAgaGV4OiByZ2JfZm9ybWF0SGV4LCAvLyBEZXByZWNhdGVkISBVc2UgY29sb3IuZm9ybWF0SGV4LlxuICBmb3JtYXRIZXg6IHJnYl9mb3JtYXRIZXgsXG4gIGZvcm1hdEhleDg6IHJnYl9mb3JtYXRIZXg4LFxuICBmb3JtYXRSZ2I6IHJnYl9mb3JtYXRSZ2IsXG4gIHRvU3RyaW5nOiByZ2JfZm9ybWF0UmdiXG59KSk7XG5cbmZ1bmN0aW9uIHJnYl9mb3JtYXRIZXgoKSB7XG4gIHJldHVybiBgIyR7aGV4KHRoaXMucil9JHtoZXgodGhpcy5nKX0ke2hleCh0aGlzLmIpfWA7XG59XG5cbmZ1bmN0aW9uIHJnYl9mb3JtYXRIZXg4KCkge1xuICByZXR1cm4gYCMke2hleCh0aGlzLnIpfSR7aGV4KHRoaXMuZyl9JHtoZXgodGhpcy5iKX0ke2hleCgoaXNOYU4odGhpcy5vcGFjaXR5KSA/IDEgOiB0aGlzLm9wYWNpdHkpICogMjU1KX1gO1xufVxuXG5mdW5jdGlvbiByZ2JfZm9ybWF0UmdiKCkge1xuICBjb25zdCBhID0gY2xhbXBhKHRoaXMub3BhY2l0eSk7XG4gIHJldHVybiBgJHthID09PSAxID8gXCJyZ2IoXCIgOiBcInJnYmEoXCJ9JHtjbGFtcGkodGhpcy5yKX0sICR7Y2xhbXBpKHRoaXMuZyl9LCAke2NsYW1waSh0aGlzLmIpfSR7YSA9PT0gMSA/IFwiKVwiIDogYCwgJHthfSlgfWA7XG59XG5cbmZ1bmN0aW9uIGNsYW1wYShvcGFjaXR5KSB7XG4gIHJldHVybiBpc05hTihvcGFjaXR5KSA/IDEgOiBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCBvcGFjaXR5KSk7XG59XG5cbmZ1bmN0aW9uIGNsYW1waSh2YWx1ZSkge1xuICByZXR1cm4gTWF0aC5tYXgoMCwgTWF0aC5taW4oMjU1LCBNYXRoLnJvdW5kKHZhbHVlKSB8fCAwKSk7XG59XG5cbmZ1bmN0aW9uIGhleCh2YWx1ZSkge1xuICB2YWx1ZSA9IGNsYW1waSh2YWx1ZSk7XG4gIHJldHVybiAodmFsdWUgPCAxNiA/IFwiMFwiIDogXCJcIikgKyB2YWx1ZS50b1N0cmluZygxNik7XG59XG5cbmZ1bmN0aW9uIGhzbGEoaCwgcywgbCwgYSkge1xuICBpZiAoYSA8PSAwKSBoID0gcyA9IGwgPSBOYU47XG4gIGVsc2UgaWYgKGwgPD0gMCB8fCBsID49IDEpIGggPSBzID0gTmFOO1xuICBlbHNlIGlmIChzIDw9IDApIGggPSBOYU47XG4gIHJldHVybiBuZXcgSHNsKGgsIHMsIGwsIGEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaHNsQ29udmVydChvKSB7XG4gIGlmIChvIGluc3RhbmNlb2YgSHNsKSByZXR1cm4gbmV3IEhzbChvLmgsIG8ucywgby5sLCBvLm9wYWNpdHkpO1xuICBpZiAoIShvIGluc3RhbmNlb2YgQ29sb3IpKSBvID0gY29sb3Iobyk7XG4gIGlmICghbykgcmV0dXJuIG5ldyBIc2w7XG4gIGlmIChvIGluc3RhbmNlb2YgSHNsKSByZXR1cm4gbztcbiAgbyA9IG8ucmdiKCk7XG4gIHZhciByID0gby5yIC8gMjU1LFxuICAgICAgZyA9IG8uZyAvIDI1NSxcbiAgICAgIGIgPSBvLmIgLyAyNTUsXG4gICAgICBtaW4gPSBNYXRoLm1pbihyLCBnLCBiKSxcbiAgICAgIG1heCA9IE1hdGgubWF4KHIsIGcsIGIpLFxuICAgICAgaCA9IE5hTixcbiAgICAgIHMgPSBtYXggLSBtaW4sXG4gICAgICBsID0gKG1heCArIG1pbikgLyAyO1xuICBpZiAocykge1xuICAgIGlmIChyID09PSBtYXgpIGggPSAoZyAtIGIpIC8gcyArIChnIDwgYikgKiA2O1xuICAgIGVsc2UgaWYgKGcgPT09IG1heCkgaCA9IChiIC0gcikgLyBzICsgMjtcbiAgICBlbHNlIGggPSAociAtIGcpIC8gcyArIDQ7XG4gICAgcyAvPSBsIDwgMC41ID8gbWF4ICsgbWluIDogMiAtIG1heCAtIG1pbjtcbiAgICBoICo9IDYwO1xuICB9IGVsc2Uge1xuICAgIHMgPSBsID4gMCAmJiBsIDwgMSA/IDAgOiBoO1xuICB9XG4gIHJldHVybiBuZXcgSHNsKGgsIHMsIGwsIG8ub3BhY2l0eSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoc2woaCwgcywgbCwgb3BhY2l0eSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA9PT0gMSA/IGhzbENvbnZlcnQoaCkgOiBuZXcgSHNsKGgsIHMsIGwsIG9wYWNpdHkgPT0gbnVsbCA/IDEgOiBvcGFjaXR5KTtcbn1cblxuZnVuY3Rpb24gSHNsKGgsIHMsIGwsIG9wYWNpdHkpIHtcbiAgdGhpcy5oID0gK2g7XG4gIHRoaXMucyA9ICtzO1xuICB0aGlzLmwgPSArbDtcbiAgdGhpcy5vcGFjaXR5ID0gK29wYWNpdHk7XG59XG5cbmRlZmluZShIc2wsIGhzbCwgZXh0ZW5kKENvbG9yLCB7XG4gIGJyaWdodGVyKGspIHtcbiAgICBrID0gayA9PSBudWxsID8gYnJpZ2h0ZXIgOiBNYXRoLnBvdyhicmlnaHRlciwgayk7XG4gICAgcmV0dXJuIG5ldyBIc2wodGhpcy5oLCB0aGlzLnMsIHRoaXMubCAqIGssIHRoaXMub3BhY2l0eSk7XG4gIH0sXG4gIGRhcmtlcihrKSB7XG4gICAgayA9IGsgPT0gbnVsbCA/IGRhcmtlciA6IE1hdGgucG93KGRhcmtlciwgayk7XG4gICAgcmV0dXJuIG5ldyBIc2wodGhpcy5oLCB0aGlzLnMsIHRoaXMubCAqIGssIHRoaXMub3BhY2l0eSk7XG4gIH0sXG4gIHJnYigpIHtcbiAgICB2YXIgaCA9IHRoaXMuaCAlIDM2MCArICh0aGlzLmggPCAwKSAqIDM2MCxcbiAgICAgICAgcyA9IGlzTmFOKGgpIHx8IGlzTmFOKHRoaXMucykgPyAwIDogdGhpcy5zLFxuICAgICAgICBsID0gdGhpcy5sLFxuICAgICAgICBtMiA9IGwgKyAobCA8IDAuNSA/IGwgOiAxIC0gbCkgKiBzLFxuICAgICAgICBtMSA9IDIgKiBsIC0gbTI7XG4gICAgcmV0dXJuIG5ldyBSZ2IoXG4gICAgICBoc2wycmdiKGggPj0gMjQwID8gaCAtIDI0MCA6IGggKyAxMjAsIG0xLCBtMiksXG4gICAgICBoc2wycmdiKGgsIG0xLCBtMiksXG4gICAgICBoc2wycmdiKGggPCAxMjAgPyBoICsgMjQwIDogaCAtIDEyMCwgbTEsIG0yKSxcbiAgICAgIHRoaXMub3BhY2l0eVxuICAgICk7XG4gIH0sXG4gIGNsYW1wKCkge1xuICAgIHJldHVybiBuZXcgSHNsKGNsYW1waCh0aGlzLmgpLCBjbGFtcHQodGhpcy5zKSwgY2xhbXB0KHRoaXMubCksIGNsYW1wYSh0aGlzLm9wYWNpdHkpKTtcbiAgfSxcbiAgZGlzcGxheWFibGUoKSB7XG4gICAgcmV0dXJuICgwIDw9IHRoaXMucyAmJiB0aGlzLnMgPD0gMSB8fCBpc05hTih0aGlzLnMpKVxuICAgICAgICAmJiAoMCA8PSB0aGlzLmwgJiYgdGhpcy5sIDw9IDEpXG4gICAgICAgICYmICgwIDw9IHRoaXMub3BhY2l0eSAmJiB0aGlzLm9wYWNpdHkgPD0gMSk7XG4gIH0sXG4gIGZvcm1hdEhzbCgpIHtcbiAgICBjb25zdCBhID0gY2xhbXBhKHRoaXMub3BhY2l0eSk7XG4gICAgcmV0dXJuIGAke2EgPT09IDEgPyBcImhzbChcIiA6IFwiaHNsYShcIn0ke2NsYW1waCh0aGlzLmgpfSwgJHtjbGFtcHQodGhpcy5zKSAqIDEwMH0lLCAke2NsYW1wdCh0aGlzLmwpICogMTAwfSUke2EgPT09IDEgPyBcIilcIiA6IGAsICR7YX0pYH1gO1xuICB9XG59KSk7XG5cbmZ1bmN0aW9uIGNsYW1waCh2YWx1ZSkge1xuICB2YWx1ZSA9ICh2YWx1ZSB8fCAwKSAlIDM2MDtcbiAgcmV0dXJuIHZhbHVlIDwgMCA/IHZhbHVlICsgMzYwIDogdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGNsYW1wdCh2YWx1ZSkge1xuICByZXR1cm4gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgdmFsdWUgfHwgMCkpO1xufVxuXG4vKiBGcm9tIEZ2RCAxMy4zNywgQ1NTIENvbG9yIE1vZHVsZSBMZXZlbCAzICovXG5mdW5jdGlvbiBoc2wycmdiKGgsIG0xLCBtMikge1xuICByZXR1cm4gKGggPCA2MCA/IG0xICsgKG0yIC0gbTEpICogaCAvIDYwXG4gICAgICA6IGggPCAxODAgPyBtMlxuICAgICAgOiBoIDwgMjQwID8gbTEgKyAobTIgLSBtMSkgKiAoMjQwIC0gaCkgLyA2MFxuICAgICAgOiBtMSkgKiAyNTU7XG59XG4iLAogICAgImV4cG9ydCBjb25zdCByYWRpYW5zID0gTWF0aC5QSSAvIDE4MDtcbmV4cG9ydCBjb25zdCBkZWdyZWVzID0gMTgwIC8gTWF0aC5QSTtcbiIsCiAgICAiaW1wb3J0IGRlZmluZSwge2V4dGVuZH0gZnJvbSBcIi4vZGVmaW5lLmpzXCI7XG5pbXBvcnQge0NvbG9yLCByZ2JDb252ZXJ0LCBSZ2J9IGZyb20gXCIuL2NvbG9yLmpzXCI7XG5pbXBvcnQge2RlZ3JlZXMsIHJhZGlhbnN9IGZyb20gXCIuL21hdGguanNcIjtcblxuLy8gaHR0cHM6Ly9vYnNlcnZhYmxlaHEuY29tL0BtYm9zdG9jay9sYWItYW5kLXJnYlxuY29uc3QgSyA9IDE4LFxuICAgIFhuID0gMC45NjQyMixcbiAgICBZbiA9IDEsXG4gICAgWm4gPSAwLjgyNTIxLFxuICAgIHQwID0gNCAvIDI5LFxuICAgIHQxID0gNiAvIDI5LFxuICAgIHQyID0gMyAqIHQxICogdDEsXG4gICAgdDMgPSB0MSAqIHQxICogdDE7XG5cbmZ1bmN0aW9uIGxhYkNvbnZlcnQobykge1xuICBpZiAobyBpbnN0YW5jZW9mIExhYikgcmV0dXJuIG5ldyBMYWIoby5sLCBvLmEsIG8uYiwgby5vcGFjaXR5KTtcbiAgaWYgKG8gaW5zdGFuY2VvZiBIY2wpIHJldHVybiBoY2wybGFiKG8pO1xuICBpZiAoIShvIGluc3RhbmNlb2YgUmdiKSkgbyA9IHJnYkNvbnZlcnQobyk7XG4gIHZhciByID0gcmdiMmxyZ2Ioby5yKSxcbiAgICAgIGcgPSByZ2IybHJnYihvLmcpLFxuICAgICAgYiA9IHJnYjJscmdiKG8uYiksXG4gICAgICB5ID0geHl6MmxhYigoMC4yMjI1MDQ1ICogciArIDAuNzE2ODc4NiAqIGcgKyAwLjA2MDYxNjkgKiBiKSAvIFluKSwgeCwgejtcbiAgaWYgKHIgPT09IGcgJiYgZyA9PT0gYikgeCA9IHogPSB5OyBlbHNlIHtcbiAgICB4ID0geHl6MmxhYigoMC40MzYwNzQ3ICogciArIDAuMzg1MDY0OSAqIGcgKyAwLjE0MzA4MDQgKiBiKSAvIFhuKTtcbiAgICB6ID0geHl6MmxhYigoMC4wMTM5MzIyICogciArIDAuMDk3MTA0NSAqIGcgKyAwLjcxNDE3MzMgKiBiKSAvIFpuKTtcbiAgfVxuICByZXR1cm4gbmV3IExhYigxMTYgKiB5IC0gMTYsIDUwMCAqICh4IC0geSksIDIwMCAqICh5IC0geiksIG8ub3BhY2l0eSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBncmF5KGwsIG9wYWNpdHkpIHtcbiAgcmV0dXJuIG5ldyBMYWIobCwgMCwgMCwgb3BhY2l0eSA9PSBudWxsID8gMSA6IG9wYWNpdHkpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBsYWIobCwgYSwgYiwgb3BhY2l0eSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA9PT0gMSA/IGxhYkNvbnZlcnQobCkgOiBuZXcgTGFiKGwsIGEsIGIsIG9wYWNpdHkgPT0gbnVsbCA/IDEgOiBvcGFjaXR5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIExhYihsLCBhLCBiLCBvcGFjaXR5KSB7XG4gIHRoaXMubCA9ICtsO1xuICB0aGlzLmEgPSArYTtcbiAgdGhpcy5iID0gK2I7XG4gIHRoaXMub3BhY2l0eSA9ICtvcGFjaXR5O1xufVxuXG5kZWZpbmUoTGFiLCBsYWIsIGV4dGVuZChDb2xvciwge1xuICBicmlnaHRlcihrKSB7XG4gICAgcmV0dXJuIG5ldyBMYWIodGhpcy5sICsgSyAqIChrID09IG51bGwgPyAxIDogayksIHRoaXMuYSwgdGhpcy5iLCB0aGlzLm9wYWNpdHkpO1xuICB9LFxuICBkYXJrZXIoaykge1xuICAgIHJldHVybiBuZXcgTGFiKHRoaXMubCAtIEsgKiAoayA9PSBudWxsID8gMSA6IGspLCB0aGlzLmEsIHRoaXMuYiwgdGhpcy5vcGFjaXR5KTtcbiAgfSxcbiAgcmdiKCkge1xuICAgIHZhciB5ID0gKHRoaXMubCArIDE2KSAvIDExNixcbiAgICAgICAgeCA9IGlzTmFOKHRoaXMuYSkgPyB5IDogeSArIHRoaXMuYSAvIDUwMCxcbiAgICAgICAgeiA9IGlzTmFOKHRoaXMuYikgPyB5IDogeSAtIHRoaXMuYiAvIDIwMDtcbiAgICB4ID0gWG4gKiBsYWIyeHl6KHgpO1xuICAgIHkgPSBZbiAqIGxhYjJ4eXooeSk7XG4gICAgeiA9IFpuICogbGFiMnh5eih6KTtcbiAgICByZXR1cm4gbmV3IFJnYihcbiAgICAgIGxyZ2IycmdiKCAzLjEzMzg1NjEgKiB4IC0gMS42MTY4NjY3ICogeSAtIDAuNDkwNjE0NiAqIHopLFxuICAgICAgbHJnYjJyZ2IoLTAuOTc4NzY4NCAqIHggKyAxLjkxNjE0MTUgKiB5ICsgMC4wMzM0NTQwICogeiksXG4gICAgICBscmdiMnJnYiggMC4wNzE5NDUzICogeCAtIDAuMjI4OTkxNCAqIHkgKyAxLjQwNTI0MjcgKiB6KSxcbiAgICAgIHRoaXMub3BhY2l0eVxuICAgICk7XG4gIH1cbn0pKTtcblxuZnVuY3Rpb24geHl6MmxhYih0KSB7XG4gIHJldHVybiB0ID4gdDMgPyBNYXRoLnBvdyh0LCAxIC8gMykgOiB0IC8gdDIgKyB0MDtcbn1cblxuZnVuY3Rpb24gbGFiMnh5eih0KSB7XG4gIHJldHVybiB0ID4gdDEgPyB0ICogdCAqIHQgOiB0MiAqICh0IC0gdDApO1xufVxuXG5mdW5jdGlvbiBscmdiMnJnYih4KSB7XG4gIHJldHVybiAyNTUgKiAoeCA8PSAwLjAwMzEzMDggPyAxMi45MiAqIHggOiAxLjA1NSAqIE1hdGgucG93KHgsIDEgLyAyLjQpIC0gMC4wNTUpO1xufVxuXG5mdW5jdGlvbiByZ2IybHJnYih4KSB7XG4gIHJldHVybiAoeCAvPSAyNTUpIDw9IDAuMDQwNDUgPyB4IC8gMTIuOTIgOiBNYXRoLnBvdygoeCArIDAuMDU1KSAvIDEuMDU1LCAyLjQpO1xufVxuXG5mdW5jdGlvbiBoY2xDb252ZXJ0KG8pIHtcbiAgaWYgKG8gaW5zdGFuY2VvZiBIY2wpIHJldHVybiBuZXcgSGNsKG8uaCwgby5jLCBvLmwsIG8ub3BhY2l0eSk7XG4gIGlmICghKG8gaW5zdGFuY2VvZiBMYWIpKSBvID0gbGFiQ29udmVydChvKTtcbiAgaWYgKG8uYSA9PT0gMCAmJiBvLmIgPT09IDApIHJldHVybiBuZXcgSGNsKE5hTiwgMCA8IG8ubCAmJiBvLmwgPCAxMDAgPyAwIDogTmFOLCBvLmwsIG8ub3BhY2l0eSk7XG4gIHZhciBoID0gTWF0aC5hdGFuMihvLmIsIG8uYSkgKiBkZWdyZWVzO1xuICByZXR1cm4gbmV3IEhjbChoIDwgMCA/IGggKyAzNjAgOiBoLCBNYXRoLnNxcnQoby5hICogby5hICsgby5iICogby5iKSwgby5sLCBvLm9wYWNpdHkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGNoKGwsIGMsIGgsIG9wYWNpdHkpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPT09IDEgPyBoY2xDb252ZXJ0KGwpIDogbmV3IEhjbChoLCBjLCBsLCBvcGFjaXR5ID09IG51bGwgPyAxIDogb3BhY2l0eSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoY2woaCwgYywgbCwgb3BhY2l0eSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA9PT0gMSA/IGhjbENvbnZlcnQoaCkgOiBuZXcgSGNsKGgsIGMsIGwsIG9wYWNpdHkgPT0gbnVsbCA/IDEgOiBvcGFjaXR5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEhjbChoLCBjLCBsLCBvcGFjaXR5KSB7XG4gIHRoaXMuaCA9ICtoO1xuICB0aGlzLmMgPSArYztcbiAgdGhpcy5sID0gK2w7XG4gIHRoaXMub3BhY2l0eSA9ICtvcGFjaXR5O1xufVxuXG5mdW5jdGlvbiBoY2wybGFiKG8pIHtcbiAgaWYgKGlzTmFOKG8uaCkpIHJldHVybiBuZXcgTGFiKG8ubCwgMCwgMCwgby5vcGFjaXR5KTtcbiAgdmFyIGggPSBvLmggKiByYWRpYW5zO1xuICByZXR1cm4gbmV3IExhYihvLmwsIE1hdGguY29zKGgpICogby5jLCBNYXRoLnNpbihoKSAqIG8uYywgby5vcGFjaXR5KTtcbn1cblxuZGVmaW5lKEhjbCwgaGNsLCBleHRlbmQoQ29sb3IsIHtcbiAgYnJpZ2h0ZXIoaykge1xuICAgIHJldHVybiBuZXcgSGNsKHRoaXMuaCwgdGhpcy5jLCB0aGlzLmwgKyBLICogKGsgPT0gbnVsbCA/IDEgOiBrKSwgdGhpcy5vcGFjaXR5KTtcbiAgfSxcbiAgZGFya2VyKGspIHtcbiAgICByZXR1cm4gbmV3IEhjbCh0aGlzLmgsIHRoaXMuYywgdGhpcy5sIC0gSyAqIChrID09IG51bGwgPyAxIDogayksIHRoaXMub3BhY2l0eSk7XG4gIH0sXG4gIHJnYigpIHtcbiAgICByZXR1cm4gaGNsMmxhYih0aGlzKS5yZ2IoKTtcbiAgfVxufSkpO1xuIiwKICAgICJleHBvcnQgZGVmYXVsdCB4ID0+ICgpID0+IHg7XG4iLAogICAgImltcG9ydCBjb25zdGFudCBmcm9tIFwiLi9jb25zdGFudC5qc1wiO1xuXG5mdW5jdGlvbiBsaW5lYXIoYSwgZCkge1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIHJldHVybiBhICsgdCAqIGQ7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGV4cG9uZW50aWFsKGEsIGIsIHkpIHtcbiAgcmV0dXJuIGEgPSBNYXRoLnBvdyhhLCB5KSwgYiA9IE1hdGgucG93KGIsIHkpIC0gYSwgeSA9IDEgLyB5LCBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuIE1hdGgucG93KGEgKyB0ICogYiwgeSk7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBodWUoYSwgYikge1xuICB2YXIgZCA9IGIgLSBhO1xuICByZXR1cm4gZCA/IGxpbmVhcihhLCBkID4gMTgwIHx8IGQgPCAtMTgwID8gZCAtIDM2MCAqIE1hdGgucm91bmQoZCAvIDM2MCkgOiBkKSA6IGNvbnN0YW50KGlzTmFOKGEpID8gYiA6IGEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2FtbWEoeSkge1xuICByZXR1cm4gKHkgPSAreSkgPT09IDEgPyBub2dhbW1hIDogZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBiIC0gYSA/IGV4cG9uZW50aWFsKGEsIGIsIHkpIDogY29uc3RhbnQoaXNOYU4oYSkgPyBiIDogYSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG5vZ2FtbWEoYSwgYikge1xuICB2YXIgZCA9IGIgLSBhO1xuICByZXR1cm4gZCA/IGxpbmVhcihhLCBkKSA6IGNvbnN0YW50KGlzTmFOKGEpID8gYiA6IGEpO1xufVxuIiwKICAgICJpbXBvcnQge2hjbCBhcyBjb2xvckhjbH0gZnJvbSBcImQzLWNvbG9yXCI7XG5pbXBvcnQgY29sb3IsIHtodWV9IGZyb20gXCIuL2NvbG9yLmpzXCI7XG5cbmZ1bmN0aW9uIGhjbChodWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHN0YXJ0LCBlbmQpIHtcbiAgICB2YXIgaCA9IGh1ZSgoc3RhcnQgPSBjb2xvckhjbChzdGFydCkpLmgsIChlbmQgPSBjb2xvckhjbChlbmQpKS5oKSxcbiAgICAgICAgYyA9IGNvbG9yKHN0YXJ0LmMsIGVuZC5jKSxcbiAgICAgICAgbCA9IGNvbG9yKHN0YXJ0LmwsIGVuZC5sKSxcbiAgICAgICAgb3BhY2l0eSA9IGNvbG9yKHN0YXJ0Lm9wYWNpdHksIGVuZC5vcGFjaXR5KTtcbiAgICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgICAgc3RhcnQuaCA9IGgodCk7XG4gICAgICBzdGFydC5jID0gYyh0KTtcbiAgICAgIHN0YXJ0LmwgPSBsKHQpO1xuICAgICAgc3RhcnQub3BhY2l0eSA9IG9wYWNpdHkodCk7XG4gICAgICByZXR1cm4gc3RhcnQgKyBcIlwiO1xuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgaGNsKGh1ZSk7XG5leHBvcnQgdmFyIGhjbExvbmcgPSBoY2woY29sb3IpO1xuIiwKICAgICJleHBvcnQgZnVuY3Rpb24gYmFzaXModDEsIHYwLCB2MSwgdjIsIHYzKSB7XG4gIHZhciB0MiA9IHQxICogdDEsIHQzID0gdDIgKiB0MTtcbiAgcmV0dXJuICgoMSAtIDMgKiB0MSArIDMgKiB0MiAtIHQzKSAqIHYwXG4gICAgICArICg0IC0gNiAqIHQyICsgMyAqIHQzKSAqIHYxXG4gICAgICArICgxICsgMyAqIHQxICsgMyAqIHQyIC0gMyAqIHQzKSAqIHYyXG4gICAgICArIHQzICogdjMpIC8gNjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWVzKSB7XG4gIHZhciBuID0gdmFsdWVzLmxlbmd0aCAtIDE7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgdmFyIGkgPSB0IDw9IDAgPyAodCA9IDApIDogdCA+PSAxID8gKHQgPSAxLCBuIC0gMSkgOiBNYXRoLmZsb29yKHQgKiBuKSxcbiAgICAgICAgdjEgPSB2YWx1ZXNbaV0sXG4gICAgICAgIHYyID0gdmFsdWVzW2kgKyAxXSxcbiAgICAgICAgdjAgPSBpID4gMCA/IHZhbHVlc1tpIC0gMV0gOiAyICogdjEgLSB2MixcbiAgICAgICAgdjMgPSBpIDwgbiAtIDEgPyB2YWx1ZXNbaSArIDJdIDogMiAqIHYyIC0gdjE7XG4gICAgcmV0dXJuIGJhc2lzKCh0IC0gaSAvIG4pICogbiwgdjAsIHYxLCB2MiwgdjMpO1xuICB9O1xufVxuIiwKICAgICJpbXBvcnQge2Jhc2lzfSBmcm9tIFwiLi9iYXNpcy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgdmFyIG4gPSB2YWx1ZXMubGVuZ3RoO1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIHZhciBpID0gTWF0aC5mbG9vcigoKHQgJT0gMSkgPCAwID8gKyt0IDogdCkgKiBuKSxcbiAgICAgICAgdjAgPSB2YWx1ZXNbKGkgKyBuIC0gMSkgJSBuXSxcbiAgICAgICAgdjEgPSB2YWx1ZXNbaSAlIG5dLFxuICAgICAgICB2MiA9IHZhbHVlc1soaSArIDEpICUgbl0sXG4gICAgICAgIHYzID0gdmFsdWVzWyhpICsgMikgJSBuXTtcbiAgICByZXR1cm4gYmFzaXMoKHQgLSBpIC8gbikgKiBuLCB2MCwgdjEsIHYyLCB2Myk7XG4gIH07XG59XG4iLAogICAgImltcG9ydCB7cmdiIGFzIGNvbG9yUmdifSBmcm9tIFwiZDMtY29sb3JcIjtcbmltcG9ydCBiYXNpcyBmcm9tIFwiLi9iYXNpcy5qc1wiO1xuaW1wb3J0IGJhc2lzQ2xvc2VkIGZyb20gXCIuL2Jhc2lzQ2xvc2VkLmpzXCI7XG5pbXBvcnQgbm9nYW1tYSwge2dhbW1hfSBmcm9tIFwiLi9jb2xvci5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCAoZnVuY3Rpb24gcmdiR2FtbWEoeSkge1xuICB2YXIgY29sb3IgPSBnYW1tYSh5KTtcblxuICBmdW5jdGlvbiByZ2Ioc3RhcnQsIGVuZCkge1xuICAgIHZhciByID0gY29sb3IoKHN0YXJ0ID0gY29sb3JSZ2Ioc3RhcnQpKS5yLCAoZW5kID0gY29sb3JSZ2IoZW5kKSkuciksXG4gICAgICAgIGcgPSBjb2xvcihzdGFydC5nLCBlbmQuZyksXG4gICAgICAgIGIgPSBjb2xvcihzdGFydC5iLCBlbmQuYiksXG4gICAgICAgIG9wYWNpdHkgPSBub2dhbW1hKHN0YXJ0Lm9wYWNpdHksIGVuZC5vcGFjaXR5KTtcbiAgICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgICAgc3RhcnQuciA9IHIodCk7XG4gICAgICBzdGFydC5nID0gZyh0KTtcbiAgICAgIHN0YXJ0LmIgPSBiKHQpO1xuICAgICAgc3RhcnQub3BhY2l0eSA9IG9wYWNpdHkodCk7XG4gICAgICByZXR1cm4gc3RhcnQgKyBcIlwiO1xuICAgIH07XG4gIH1cblxuICByZ2IuZ2FtbWEgPSByZ2JHYW1tYTtcblxuICByZXR1cm4gcmdiO1xufSkoMSk7XG5cbmZ1bmN0aW9uIHJnYlNwbGluZShzcGxpbmUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGNvbG9ycykge1xuICAgIHZhciBuID0gY29sb3JzLmxlbmd0aCxcbiAgICAgICAgciA9IG5ldyBBcnJheShuKSxcbiAgICAgICAgZyA9IG5ldyBBcnJheShuKSxcbiAgICAgICAgYiA9IG5ldyBBcnJheShuKSxcbiAgICAgICAgaSwgY29sb3I7XG4gICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgY29sb3IgPSBjb2xvclJnYihjb2xvcnNbaV0pO1xuICAgICAgcltpXSA9IGNvbG9yLnIgfHwgMDtcbiAgICAgIGdbaV0gPSBjb2xvci5nIHx8IDA7XG4gICAgICBiW2ldID0gY29sb3IuYiB8fCAwO1xuICAgIH1cbiAgICByID0gc3BsaW5lKHIpO1xuICAgIGcgPSBzcGxpbmUoZyk7XG4gICAgYiA9IHNwbGluZShiKTtcbiAgICBjb2xvci5vcGFjaXR5ID0gMTtcbiAgICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgICAgY29sb3IuciA9IHIodCk7XG4gICAgICBjb2xvci5nID0gZyh0KTtcbiAgICAgIGNvbG9yLmIgPSBiKHQpO1xuICAgICAgcmV0dXJuIGNvbG9yICsgXCJcIjtcbiAgICB9O1xuICB9O1xufVxuXG5leHBvcnQgdmFyIHJnYkJhc2lzID0gcmdiU3BsaW5lKGJhc2lzKTtcbmV4cG9ydCB2YXIgcmdiQmFzaXNDbG9zZWQgPSByZ2JTcGxpbmUoYmFzaXNDbG9zZWQpO1xuIiwKICAgICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIGlmICghYikgYiA9IFtdO1xuICB2YXIgbiA9IGEgPyBNYXRoLm1pbihiLmxlbmd0aCwgYS5sZW5ndGgpIDogMCxcbiAgICAgIGMgPSBiLnNsaWNlKCksXG4gICAgICBpO1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIGZvciAoaSA9IDA7IGkgPCBuOyArK2kpIGNbaV0gPSBhW2ldICogKDEgLSB0KSArIGJbaV0gKiB0O1xuICAgIHJldHVybiBjO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOdW1iZXJBcnJheSh4KSB7XG4gIHJldHVybiBBcnJheUJ1ZmZlci5pc1ZpZXcoeCkgJiYgISh4IGluc3RhbmNlb2YgRGF0YVZpZXcpO1xufVxuIiwKICAgICJpbXBvcnQgdmFsdWUgZnJvbSBcIi4vdmFsdWUuanNcIjtcbmltcG9ydCBudW1iZXJBcnJheSwge2lzTnVtYmVyQXJyYXl9IGZyb20gXCIuL251bWJlckFycmF5LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIChpc051bWJlckFycmF5KGIpID8gbnVtYmVyQXJyYXkgOiBnZW5lcmljQXJyYXkpKGEsIGIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJpY0FycmF5KGEsIGIpIHtcbiAgdmFyIG5iID0gYiA/IGIubGVuZ3RoIDogMCxcbiAgICAgIG5hID0gYSA/IE1hdGgubWluKG5iLCBhLmxlbmd0aCkgOiAwLFxuICAgICAgeCA9IG5ldyBBcnJheShuYSksXG4gICAgICBjID0gbmV3IEFycmF5KG5iKSxcbiAgICAgIGk7XG5cbiAgZm9yIChpID0gMDsgaSA8IG5hOyArK2kpIHhbaV0gPSB2YWx1ZShhW2ldLCBiW2ldKTtcbiAgZm9yICg7IGkgPCBuYjsgKytpKSBjW2ldID0gYltpXTtcblxuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIGZvciAoaSA9IDA7IGkgPCBuYTsgKytpKSBjW2ldID0geFtpXSh0KTtcbiAgICByZXR1cm4gYztcbiAgfTtcbn1cbiIsCiAgICAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICB2YXIgZCA9IG5ldyBEYXRlO1xuICByZXR1cm4gYSA9ICthLCBiID0gK2IsIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gZC5zZXRUaW1lKGEgKiAoMSAtIHQpICsgYiAqIHQpLCBkO1xuICB9O1xufVxuIiwKICAgICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIHJldHVybiBhID0gK2EsIGIgPSArYiwgZnVuY3Rpb24odCkge1xuICAgIHJldHVybiBhICogKDEgLSB0KSArIGIgKiB0O1xuICB9O1xufVxuIiwKICAgICJpbXBvcnQgdmFsdWUgZnJvbSBcIi4vdmFsdWUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICB2YXIgaSA9IHt9LFxuICAgICAgYyA9IHt9LFxuICAgICAgaztcblxuICBpZiAoYSA9PT0gbnVsbCB8fCB0eXBlb2YgYSAhPT0gXCJvYmplY3RcIikgYSA9IHt9O1xuICBpZiAoYiA9PT0gbnVsbCB8fCB0eXBlb2YgYiAhPT0gXCJvYmplY3RcIikgYiA9IHt9O1xuXG4gIGZvciAoayBpbiBiKSB7XG4gICAgaWYgKGsgaW4gYSkge1xuICAgICAgaVtrXSA9IHZhbHVlKGFba10sIGJba10pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjW2tdID0gYltrXTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIGZvciAoayBpbiBpKSBjW2tdID0gaVtrXSh0KTtcbiAgICByZXR1cm4gYztcbiAgfTtcbn1cbiIsCiAgICAiaW1wb3J0IG51bWJlciBmcm9tIFwiLi9udW1iZXIuanNcIjtcblxudmFyIHJlQSA9IC9bLStdPyg/OlxcZCtcXC4/XFxkKnxcXC4/XFxkKykoPzpbZUVdWy0rXT9cXGQrKT8vZyxcbiAgICByZUIgPSBuZXcgUmVnRXhwKHJlQS5zb3VyY2UsIFwiZ1wiKTtcblxuZnVuY3Rpb24gemVybyhiKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gYjtcbiAgfTtcbn1cblxuZnVuY3Rpb24gb25lKGIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gYih0KSArIFwiXCI7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgdmFyIGJpID0gcmVBLmxhc3RJbmRleCA9IHJlQi5sYXN0SW5kZXggPSAwLCAvLyBzY2FuIGluZGV4IGZvciBuZXh0IG51bWJlciBpbiBiXG4gICAgICBhbSwgLy8gY3VycmVudCBtYXRjaCBpbiBhXG4gICAgICBibSwgLy8gY3VycmVudCBtYXRjaCBpbiBiXG4gICAgICBicywgLy8gc3RyaW5nIHByZWNlZGluZyBjdXJyZW50IG51bWJlciBpbiBiLCBpZiBhbnlcbiAgICAgIGkgPSAtMSwgLy8gaW5kZXggaW4gc1xuICAgICAgcyA9IFtdLCAvLyBzdHJpbmcgY29uc3RhbnRzIGFuZCBwbGFjZWhvbGRlcnNcbiAgICAgIHEgPSBbXTsgLy8gbnVtYmVyIGludGVycG9sYXRvcnNcblxuICAvLyBDb2VyY2UgaW5wdXRzIHRvIHN0cmluZ3MuXG4gIGEgPSBhICsgXCJcIiwgYiA9IGIgKyBcIlwiO1xuXG4gIC8vIEludGVycG9sYXRlIHBhaXJzIG9mIG51bWJlcnMgaW4gYSAmIGIuXG4gIHdoaWxlICgoYW0gPSByZUEuZXhlYyhhKSlcbiAgICAgICYmIChibSA9IHJlQi5leGVjKGIpKSkge1xuICAgIGlmICgoYnMgPSBibS5pbmRleCkgPiBiaSkgeyAvLyBhIHN0cmluZyBwcmVjZWRlcyB0aGUgbmV4dCBudW1iZXIgaW4gYlxuICAgICAgYnMgPSBiLnNsaWNlKGJpLCBicyk7XG4gICAgICBpZiAoc1tpXSkgc1tpXSArPSBiczsgLy8gY29hbGVzY2Ugd2l0aCBwcmV2aW91cyBzdHJpbmdcbiAgICAgIGVsc2Ugc1srK2ldID0gYnM7XG4gICAgfVxuICAgIGlmICgoYW0gPSBhbVswXSkgPT09IChibSA9IGJtWzBdKSkgeyAvLyBudW1iZXJzIGluIGEgJiBiIG1hdGNoXG4gICAgICBpZiAoc1tpXSkgc1tpXSArPSBibTsgLy8gY29hbGVzY2Ugd2l0aCBwcmV2aW91cyBzdHJpbmdcbiAgICAgIGVsc2Ugc1srK2ldID0gYm07XG4gICAgfSBlbHNlIHsgLy8gaW50ZXJwb2xhdGUgbm9uLW1hdGNoaW5nIG51bWJlcnNcbiAgICAgIHNbKytpXSA9IG51bGw7XG4gICAgICBxLnB1c2goe2k6IGksIHg6IG51bWJlcihhbSwgYm0pfSk7XG4gICAgfVxuICAgIGJpID0gcmVCLmxhc3RJbmRleDtcbiAgfVxuXG4gIC8vIEFkZCByZW1haW5zIG9mIGIuXG4gIGlmIChiaSA8IGIubGVuZ3RoKSB7XG4gICAgYnMgPSBiLnNsaWNlKGJpKTtcbiAgICBpZiAoc1tpXSkgc1tpXSArPSBiczsgLy8gY29hbGVzY2Ugd2l0aCBwcmV2aW91cyBzdHJpbmdcbiAgICBlbHNlIHNbKytpXSA9IGJzO1xuICB9XG5cbiAgLy8gU3BlY2lhbCBvcHRpbWl6YXRpb24gZm9yIG9ubHkgYSBzaW5nbGUgbWF0Y2guXG4gIC8vIE90aGVyd2lzZSwgaW50ZXJwb2xhdGUgZWFjaCBvZiB0aGUgbnVtYmVycyBhbmQgcmVqb2luIHRoZSBzdHJpbmcuXG4gIHJldHVybiBzLmxlbmd0aCA8IDIgPyAocVswXVxuICAgICAgPyBvbmUocVswXS54KVxuICAgICAgOiB6ZXJvKGIpKVxuICAgICAgOiAoYiA9IHEubGVuZ3RoLCBmdW5jdGlvbih0KSB7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDAsIG87IGkgPCBiOyArK2kpIHNbKG8gPSBxW2ldKS5pXSA9IG8ueCh0KTtcbiAgICAgICAgICByZXR1cm4gcy5qb2luKFwiXCIpO1xuICAgICAgICB9KTtcbn1cbiIsCiAgICAiaW1wb3J0IHtjb2xvcn0gZnJvbSBcImQzLWNvbG9yXCI7XG5pbXBvcnQgcmdiIGZyb20gXCIuL3JnYi5qc1wiO1xuaW1wb3J0IHtnZW5lcmljQXJyYXl9IGZyb20gXCIuL2FycmF5LmpzXCI7XG5pbXBvcnQgZGF0ZSBmcm9tIFwiLi9kYXRlLmpzXCI7XG5pbXBvcnQgbnVtYmVyIGZyb20gXCIuL251bWJlci5qc1wiO1xuaW1wb3J0IG9iamVjdCBmcm9tIFwiLi9vYmplY3QuanNcIjtcbmltcG9ydCBzdHJpbmcgZnJvbSBcIi4vc3RyaW5nLmpzXCI7XG5pbXBvcnQgY29uc3RhbnQgZnJvbSBcIi4vY29uc3RhbnQuanNcIjtcbmltcG9ydCBudW1iZXJBcnJheSwge2lzTnVtYmVyQXJyYXl9IGZyb20gXCIuL251bWJlckFycmF5LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgdmFyIHQgPSB0eXBlb2YgYiwgYztcbiAgcmV0dXJuIGIgPT0gbnVsbCB8fCB0ID09PSBcImJvb2xlYW5cIiA/IGNvbnN0YW50KGIpXG4gICAgICA6ICh0ID09PSBcIm51bWJlclwiID8gbnVtYmVyXG4gICAgICA6IHQgPT09IFwic3RyaW5nXCIgPyAoKGMgPSBjb2xvcihiKSkgPyAoYiA9IGMsIHJnYikgOiBzdHJpbmcpXG4gICAgICA6IGIgaW5zdGFuY2VvZiBjb2xvciA/IHJnYlxuICAgICAgOiBiIGluc3RhbmNlb2YgRGF0ZSA/IGRhdGVcbiAgICAgIDogaXNOdW1iZXJBcnJheShiKSA/IG51bWJlckFycmF5XG4gICAgICA6IEFycmF5LmlzQXJyYXkoYikgPyBnZW5lcmljQXJyYXlcbiAgICAgIDogdHlwZW9mIGIudmFsdWVPZiAhPT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBiLnRvU3RyaW5nICE9PSBcImZ1bmN0aW9uXCIgfHwgaXNOYU4oYikgPyBvYmplY3RcbiAgICAgIDogbnVtYmVyKShhLCBiKTtcbn1cbiIsCiAgICAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gYSA9ICthLCBiID0gK2IsIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChhICogKDEgLSB0KSArIGIgKiB0KTtcbiAgfTtcbn1cbiIsCiAgICAidmFyIGRlZ3JlZXMgPSAxODAgLyBNYXRoLlBJO1xuXG5leHBvcnQgdmFyIGlkZW50aXR5ID0ge1xuICB0cmFuc2xhdGVYOiAwLFxuICB0cmFuc2xhdGVZOiAwLFxuICByb3RhdGU6IDAsXG4gIHNrZXdYOiAwLFxuICBzY2FsZVg6IDEsXG4gIHNjYWxlWTogMVxufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYiwgYywgZCwgZSwgZikge1xuICB2YXIgc2NhbGVYLCBzY2FsZVksIHNrZXdYO1xuICBpZiAoc2NhbGVYID0gTWF0aC5zcXJ0KGEgKiBhICsgYiAqIGIpKSBhIC89IHNjYWxlWCwgYiAvPSBzY2FsZVg7XG4gIGlmIChza2V3WCA9IGEgKiBjICsgYiAqIGQpIGMgLT0gYSAqIHNrZXdYLCBkIC09IGIgKiBza2V3WDtcbiAgaWYgKHNjYWxlWSA9IE1hdGguc3FydChjICogYyArIGQgKiBkKSkgYyAvPSBzY2FsZVksIGQgLz0gc2NhbGVZLCBza2V3WCAvPSBzY2FsZVk7XG4gIGlmIChhICogZCA8IGIgKiBjKSBhID0gLWEsIGIgPSAtYiwgc2tld1ggPSAtc2tld1gsIHNjYWxlWCA9IC1zY2FsZVg7XG4gIHJldHVybiB7XG4gICAgdHJhbnNsYXRlWDogZSxcbiAgICB0cmFuc2xhdGVZOiBmLFxuICAgIHJvdGF0ZTogTWF0aC5hdGFuMihiLCBhKSAqIGRlZ3JlZXMsXG4gICAgc2tld1g6IE1hdGguYXRhbihza2V3WCkgKiBkZWdyZWVzLFxuICAgIHNjYWxlWDogc2NhbGVYLFxuICAgIHNjYWxlWTogc2NhbGVZXG4gIH07XG59XG4iLAogICAgImltcG9ydCBkZWNvbXBvc2UsIHtpZGVudGl0eX0gZnJvbSBcIi4vZGVjb21wb3NlLmpzXCI7XG5cbnZhciBzdmdOb2RlO1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQ3NzKHZhbHVlKSB7XG4gIGNvbnN0IG0gPSBuZXcgKHR5cGVvZiBET01NYXRyaXggPT09IFwiZnVuY3Rpb25cIiA/IERPTU1hdHJpeCA6IFdlYktpdENTU01hdHJpeCkodmFsdWUgKyBcIlwiKTtcbiAgcmV0dXJuIG0uaXNJZGVudGl0eSA/IGlkZW50aXR5IDogZGVjb21wb3NlKG0uYSwgbS5iLCBtLmMsIG0uZCwgbS5lLCBtLmYpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTdmcodmFsdWUpIHtcbiAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiBpZGVudGl0eTtcbiAgaWYgKCFzdmdOb2RlKSBzdmdOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJnXCIpO1xuICBzdmdOb2RlLnNldEF0dHJpYnV0ZShcInRyYW5zZm9ybVwiLCB2YWx1ZSk7XG4gIGlmICghKHZhbHVlID0gc3ZnTm9kZS50cmFuc2Zvcm0uYmFzZVZhbC5jb25zb2xpZGF0ZSgpKSkgcmV0dXJuIGlkZW50aXR5O1xuICB2YWx1ZSA9IHZhbHVlLm1hdHJpeDtcbiAgcmV0dXJuIGRlY29tcG9zZSh2YWx1ZS5hLCB2YWx1ZS5iLCB2YWx1ZS5jLCB2YWx1ZS5kLCB2YWx1ZS5lLCB2YWx1ZS5mKTtcbn1cbiIsCiAgICAiaW1wb3J0IG51bWJlciBmcm9tIFwiLi4vbnVtYmVyLmpzXCI7XG5pbXBvcnQge3BhcnNlQ3NzLCBwYXJzZVN2Z30gZnJvbSBcIi4vcGFyc2UuanNcIjtcblxuZnVuY3Rpb24gaW50ZXJwb2xhdGVUcmFuc2Zvcm0ocGFyc2UsIHB4Q29tbWEsIHB4UGFyZW4sIGRlZ1BhcmVuKSB7XG5cbiAgZnVuY3Rpb24gcG9wKHMpIHtcbiAgICByZXR1cm4gcy5sZW5ndGggPyBzLnBvcCgpICsgXCIgXCIgOiBcIlwiO1xuICB9XG5cbiAgZnVuY3Rpb24gdHJhbnNsYXRlKHhhLCB5YSwgeGIsIHliLCBzLCBxKSB7XG4gICAgaWYgKHhhICE9PSB4YiB8fCB5YSAhPT0geWIpIHtcbiAgICAgIHZhciBpID0gcy5wdXNoKFwidHJhbnNsYXRlKFwiLCBudWxsLCBweENvbW1hLCBudWxsLCBweFBhcmVuKTtcbiAgICAgIHEucHVzaCh7aTogaSAtIDQsIHg6IG51bWJlcih4YSwgeGIpfSwge2k6IGkgLSAyLCB4OiBudW1iZXIoeWEsIHliKX0pO1xuICAgIH0gZWxzZSBpZiAoeGIgfHwgeWIpIHtcbiAgICAgIHMucHVzaChcInRyYW5zbGF0ZShcIiArIHhiICsgcHhDb21tYSArIHliICsgcHhQYXJlbik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcm90YXRlKGEsIGIsIHMsIHEpIHtcbiAgICBpZiAoYSAhPT0gYikge1xuICAgICAgaWYgKGEgLSBiID4gMTgwKSBiICs9IDM2MDsgZWxzZSBpZiAoYiAtIGEgPiAxODApIGEgKz0gMzYwOyAvLyBzaG9ydGVzdCBwYXRoXG4gICAgICBxLnB1c2goe2k6IHMucHVzaChwb3AocykgKyBcInJvdGF0ZShcIiwgbnVsbCwgZGVnUGFyZW4pIC0gMiwgeDogbnVtYmVyKGEsIGIpfSk7XG4gICAgfSBlbHNlIGlmIChiKSB7XG4gICAgICBzLnB1c2gocG9wKHMpICsgXCJyb3RhdGUoXCIgKyBiICsgZGVnUGFyZW4pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNrZXdYKGEsIGIsIHMsIHEpIHtcbiAgICBpZiAoYSAhPT0gYikge1xuICAgICAgcS5wdXNoKHtpOiBzLnB1c2gocG9wKHMpICsgXCJza2V3WChcIiwgbnVsbCwgZGVnUGFyZW4pIC0gMiwgeDogbnVtYmVyKGEsIGIpfSk7XG4gICAgfSBlbHNlIGlmIChiKSB7XG4gICAgICBzLnB1c2gocG9wKHMpICsgXCJza2V3WChcIiArIGIgKyBkZWdQYXJlbik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2NhbGUoeGEsIHlhLCB4YiwgeWIsIHMsIHEpIHtcbiAgICBpZiAoeGEgIT09IHhiIHx8IHlhICE9PSB5Yikge1xuICAgICAgdmFyIGkgPSBzLnB1c2gocG9wKHMpICsgXCJzY2FsZShcIiwgbnVsbCwgXCIsXCIsIG51bGwsIFwiKVwiKTtcbiAgICAgIHEucHVzaCh7aTogaSAtIDQsIHg6IG51bWJlcih4YSwgeGIpfSwge2k6IGkgLSAyLCB4OiBudW1iZXIoeWEsIHliKX0pO1xuICAgIH0gZWxzZSBpZiAoeGIgIT09IDEgfHwgeWIgIT09IDEpIHtcbiAgICAgIHMucHVzaChwb3AocykgKyBcInNjYWxlKFwiICsgeGIgKyBcIixcIiArIHliICsgXCIpXCIpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIHMgPSBbXSwgLy8gc3RyaW5nIGNvbnN0YW50cyBhbmQgcGxhY2Vob2xkZXJzXG4gICAgICAgIHEgPSBbXTsgLy8gbnVtYmVyIGludGVycG9sYXRvcnNcbiAgICBhID0gcGFyc2UoYSksIGIgPSBwYXJzZShiKTtcbiAgICB0cmFuc2xhdGUoYS50cmFuc2xhdGVYLCBhLnRyYW5zbGF0ZVksIGIudHJhbnNsYXRlWCwgYi50cmFuc2xhdGVZLCBzLCBxKTtcbiAgICByb3RhdGUoYS5yb3RhdGUsIGIucm90YXRlLCBzLCBxKTtcbiAgICBza2V3WChhLnNrZXdYLCBiLnNrZXdYLCBzLCBxKTtcbiAgICBzY2FsZShhLnNjYWxlWCwgYS5zY2FsZVksIGIuc2NhbGVYLCBiLnNjYWxlWSwgcywgcSk7XG4gICAgYSA9IGIgPSBudWxsOyAvLyBnY1xuICAgIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgICB2YXIgaSA9IC0xLCBuID0gcS5sZW5ndGgsIG87XG4gICAgICB3aGlsZSAoKytpIDwgbikgc1sobyA9IHFbaV0pLmldID0gby54KHQpO1xuICAgICAgcmV0dXJuIHMuam9pbihcIlwiKTtcbiAgICB9O1xuICB9O1xufVxuXG5leHBvcnQgdmFyIGludGVycG9sYXRlVHJhbnNmb3JtQ3NzID0gaW50ZXJwb2xhdGVUcmFuc2Zvcm0ocGFyc2VDc3MsIFwicHgsIFwiLCBcInB4KVwiLCBcImRlZylcIik7XG5leHBvcnQgdmFyIGludGVycG9sYXRlVHJhbnNmb3JtU3ZnID0gaW50ZXJwb2xhdGVUcmFuc2Zvcm0ocGFyc2VTdmcsIFwiLCBcIiwgXCIpXCIsIFwiKVwiKTtcbiIsCiAgICAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oeCkge1xuICByZXR1cm4gTWF0aC5hYnMoeCA9IE1hdGgucm91bmQoeCkpID49IDFlMjFcbiAgICAgID8geC50b0xvY2FsZVN0cmluZyhcImVuXCIpLnJlcGxhY2UoLywvZywgXCJcIilcbiAgICAgIDogeC50b1N0cmluZygxMCk7XG59XG5cbi8vIENvbXB1dGVzIHRoZSBkZWNpbWFsIGNvZWZmaWNpZW50IGFuZCBleHBvbmVudCBvZiB0aGUgc3BlY2lmaWVkIG51bWJlciB4IHdpdGhcbi8vIHNpZ25pZmljYW50IGRpZ2l0cyBwLCB3aGVyZSB4IGlzIHBvc2l0aXZlIGFuZCBwIGlzIGluIFsxLCAyMV0gb3IgdW5kZWZpbmVkLlxuLy8gRm9yIGV4YW1wbGUsIGZvcm1hdERlY2ltYWxQYXJ0cygxLjIzKSByZXR1cm5zIFtcIjEyM1wiLCAwXS5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXREZWNpbWFsUGFydHMoeCwgcCkge1xuICBpZiAoIWlzRmluaXRlKHgpIHx8IHggPT09IDApIHJldHVybiBudWxsOyAvLyBOYU4sIMKxSW5maW5pdHksIMKxMFxuICB2YXIgaSA9ICh4ID0gcCA/IHgudG9FeHBvbmVudGlhbChwIC0gMSkgOiB4LnRvRXhwb25lbnRpYWwoKSkuaW5kZXhPZihcImVcIiksIGNvZWZmaWNpZW50ID0geC5zbGljZSgwLCBpKTtcblxuICAvLyBUaGUgc3RyaW5nIHJldHVybmVkIGJ5IHRvRXhwb25lbnRpYWwgZWl0aGVyIGhhcyB0aGUgZm9ybSBcXGRcXC5cXGQrZVstK11cXGQrXG4gIC8vIChlLmcuLCAxLjJlKzMpIG9yIHRoZSBmb3JtIFxcZGVbLStdXFxkKyAoZS5nLiwgMWUrMykuXG4gIHJldHVybiBbXG4gICAgY29lZmZpY2llbnQubGVuZ3RoID4gMSA/IGNvZWZmaWNpZW50WzBdICsgY29lZmZpY2llbnQuc2xpY2UoMikgOiBjb2VmZmljaWVudCxcbiAgICAreC5zbGljZShpICsgMSlcbiAgXTtcbn1cbiIsCiAgICAiaW1wb3J0IHtmb3JtYXREZWNpbWFsUGFydHN9IGZyb20gXCIuL2Zvcm1hdERlY2ltYWwuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oeCkge1xuICByZXR1cm4geCA9IGZvcm1hdERlY2ltYWxQYXJ0cyhNYXRoLmFicyh4KSksIHggPyB4WzFdIDogTmFOO1xufVxuIiwKICAgICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihncm91cGluZywgdGhvdXNhbmRzKSB7XG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZSwgd2lkdGgpIHtcbiAgICB2YXIgaSA9IHZhbHVlLmxlbmd0aCxcbiAgICAgICAgdCA9IFtdLFxuICAgICAgICBqID0gMCxcbiAgICAgICAgZyA9IGdyb3VwaW5nWzBdLFxuICAgICAgICBsZW5ndGggPSAwO1xuXG4gICAgd2hpbGUgKGkgPiAwICYmIGcgPiAwKSB7XG4gICAgICBpZiAobGVuZ3RoICsgZyArIDEgPiB3aWR0aCkgZyA9IE1hdGgubWF4KDEsIHdpZHRoIC0gbGVuZ3RoKTtcbiAgICAgIHQucHVzaCh2YWx1ZS5zdWJzdHJpbmcoaSAtPSBnLCBpICsgZykpO1xuICAgICAgaWYgKChsZW5ndGggKz0gZyArIDEpID4gd2lkdGgpIGJyZWFrO1xuICAgICAgZyA9IGdyb3VwaW5nW2ogPSAoaiArIDEpICUgZ3JvdXBpbmcubGVuZ3RoXTtcbiAgICB9XG5cbiAgICByZXR1cm4gdC5yZXZlcnNlKCkuam9pbih0aG91c2FuZHMpO1xuICB9O1xufVxuIiwKICAgICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihudW1lcmFscykge1xuICByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvWzAtOV0vZywgZnVuY3Rpb24oaSkge1xuICAgICAgcmV0dXJuIG51bWVyYWxzWytpXTtcbiAgICB9KTtcbiAgfTtcbn1cbiIsCiAgICAiLy8gW1tmaWxsXWFsaWduXVtzaWduXVtzeW1ib2xdWzBdW3dpZHRoXVssXVsucHJlY2lzaW9uXVt+XVt0eXBlXVxudmFyIHJlID0gL14oPzooLik/KFs8Pj1eXSkpPyhbK1xcLSggXSk/KFskI10pPygwKT8oXFxkKyk/KCwpPyhcXC5cXGQrKT8ofik/KFthLXolXSk/JC9pO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBmb3JtYXRTcGVjaWZpZXIoc3BlY2lmaWVyKSB7XG4gIGlmICghKG1hdGNoID0gcmUuZXhlYyhzcGVjaWZpZXIpKSkgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBmb3JtYXQ6IFwiICsgc3BlY2lmaWVyKTtcbiAgdmFyIG1hdGNoO1xuICByZXR1cm4gbmV3IEZvcm1hdFNwZWNpZmllcih7XG4gICAgZmlsbDogbWF0Y2hbMV0sXG4gICAgYWxpZ246IG1hdGNoWzJdLFxuICAgIHNpZ246IG1hdGNoWzNdLFxuICAgIHN5bWJvbDogbWF0Y2hbNF0sXG4gICAgemVybzogbWF0Y2hbNV0sXG4gICAgd2lkdGg6IG1hdGNoWzZdLFxuICAgIGNvbW1hOiBtYXRjaFs3XSxcbiAgICBwcmVjaXNpb246IG1hdGNoWzhdICYmIG1hdGNoWzhdLnNsaWNlKDEpLFxuICAgIHRyaW06IG1hdGNoWzldLFxuICAgIHR5cGU6IG1hdGNoWzEwXVxuICB9KTtcbn1cblxuZm9ybWF0U3BlY2lmaWVyLnByb3RvdHlwZSA9IEZvcm1hdFNwZWNpZmllci5wcm90b3R5cGU7IC8vIGluc3RhbmNlb2ZcblxuZXhwb3J0IGZ1bmN0aW9uIEZvcm1hdFNwZWNpZmllcihzcGVjaWZpZXIpIHtcbiAgdGhpcy5maWxsID0gc3BlY2lmaWVyLmZpbGwgPT09IHVuZGVmaW5lZCA/IFwiIFwiIDogc3BlY2lmaWVyLmZpbGwgKyBcIlwiO1xuICB0aGlzLmFsaWduID0gc3BlY2lmaWVyLmFsaWduID09PSB1bmRlZmluZWQgPyBcIj5cIiA6IHNwZWNpZmllci5hbGlnbiArIFwiXCI7XG4gIHRoaXMuc2lnbiA9IHNwZWNpZmllci5zaWduID09PSB1bmRlZmluZWQgPyBcIi1cIiA6IHNwZWNpZmllci5zaWduICsgXCJcIjtcbiAgdGhpcy5zeW1ib2wgPSBzcGVjaWZpZXIuc3ltYm9sID09PSB1bmRlZmluZWQgPyBcIlwiIDogc3BlY2lmaWVyLnN5bWJvbCArIFwiXCI7XG4gIHRoaXMuemVybyA9ICEhc3BlY2lmaWVyLnplcm87XG4gIHRoaXMud2lkdGggPSBzcGVjaWZpZXIud2lkdGggPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZCA6ICtzcGVjaWZpZXIud2lkdGg7XG4gIHRoaXMuY29tbWEgPSAhIXNwZWNpZmllci5jb21tYTtcbiAgdGhpcy5wcmVjaXNpb24gPSBzcGVjaWZpZXIucHJlY2lzaW9uID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiArc3BlY2lmaWVyLnByZWNpc2lvbjtcbiAgdGhpcy50cmltID0gISFzcGVjaWZpZXIudHJpbTtcbiAgdGhpcy50eXBlID0gc3BlY2lmaWVyLnR5cGUgPT09IHVuZGVmaW5lZCA/IFwiXCIgOiBzcGVjaWZpZXIudHlwZSArIFwiXCI7XG59XG5cbkZvcm1hdFNwZWNpZmllci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuZmlsbFxuICAgICAgKyB0aGlzLmFsaWduXG4gICAgICArIHRoaXMuc2lnblxuICAgICAgKyB0aGlzLnN5bWJvbFxuICAgICAgKyAodGhpcy56ZXJvID8gXCIwXCIgOiBcIlwiKVxuICAgICAgKyAodGhpcy53aWR0aCA9PT0gdW5kZWZpbmVkID8gXCJcIiA6IE1hdGgubWF4KDEsIHRoaXMud2lkdGggfCAwKSlcbiAgICAgICsgKHRoaXMuY29tbWEgPyBcIixcIiA6IFwiXCIpXG4gICAgICArICh0aGlzLnByZWNpc2lvbiA9PT0gdW5kZWZpbmVkID8gXCJcIiA6IFwiLlwiICsgTWF0aC5tYXgoMCwgdGhpcy5wcmVjaXNpb24gfCAwKSlcbiAgICAgICsgKHRoaXMudHJpbSA/IFwiflwiIDogXCJcIilcbiAgICAgICsgdGhpcy50eXBlO1xufTtcbiIsCiAgICAiLy8gVHJpbXMgaW5zaWduaWZpY2FudCB6ZXJvcywgZS5nLiwgcmVwbGFjZXMgMS4yMDAwayB3aXRoIDEuMmsuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzKSB7XG4gIG91dDogZm9yICh2YXIgbiA9IHMubGVuZ3RoLCBpID0gMSwgaTAgPSAtMSwgaTE7IGkgPCBuOyArK2kpIHtcbiAgICBzd2l0Y2ggKHNbaV0pIHtcbiAgICAgIGNhc2UgXCIuXCI6IGkwID0gaTEgPSBpOyBicmVhaztcbiAgICAgIGNhc2UgXCIwXCI6IGlmIChpMCA9PT0gMCkgaTAgPSBpOyBpMSA9IGk7IGJyZWFrO1xuICAgICAgZGVmYXVsdDogaWYgKCErc1tpXSkgYnJlYWsgb3V0OyBpZiAoaTAgPiAwKSBpMCA9IDA7IGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gaTAgPiAwID8gcy5zbGljZSgwLCBpMCkgKyBzLnNsaWNlKGkxICsgMSkgOiBzO1xufVxuIiwKICAgICJpbXBvcnQge2Zvcm1hdERlY2ltYWxQYXJ0c30gZnJvbSBcIi4vZm9ybWF0RGVjaW1hbC5qc1wiO1xuXG5leHBvcnQgdmFyIHByZWZpeEV4cG9uZW50O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih4LCBwKSB7XG4gIHZhciBkID0gZm9ybWF0RGVjaW1hbFBhcnRzKHgsIHApO1xuICBpZiAoIWQpIHJldHVybiBwcmVmaXhFeHBvbmVudCA9IHVuZGVmaW5lZCwgeC50b1ByZWNpc2lvbihwKTtcbiAgdmFyIGNvZWZmaWNpZW50ID0gZFswXSxcbiAgICAgIGV4cG9uZW50ID0gZFsxXSxcbiAgICAgIGkgPSBleHBvbmVudCAtIChwcmVmaXhFeHBvbmVudCA9IE1hdGgubWF4KC04LCBNYXRoLm1pbig4LCBNYXRoLmZsb29yKGV4cG9uZW50IC8gMykpKSAqIDMpICsgMSxcbiAgICAgIG4gPSBjb2VmZmljaWVudC5sZW5ndGg7XG4gIHJldHVybiBpID09PSBuID8gY29lZmZpY2llbnRcbiAgICAgIDogaSA+IG4gPyBjb2VmZmljaWVudCArIG5ldyBBcnJheShpIC0gbiArIDEpLmpvaW4oXCIwXCIpXG4gICAgICA6IGkgPiAwID8gY29lZmZpY2llbnQuc2xpY2UoMCwgaSkgKyBcIi5cIiArIGNvZWZmaWNpZW50LnNsaWNlKGkpXG4gICAgICA6IFwiMC5cIiArIG5ldyBBcnJheSgxIC0gaSkuam9pbihcIjBcIikgKyBmb3JtYXREZWNpbWFsUGFydHMoeCwgTWF0aC5tYXgoMCwgcCArIGkgLSAxKSlbMF07IC8vIGxlc3MgdGhhbiAxeSFcbn1cbiIsCiAgICAiaW1wb3J0IHtmb3JtYXREZWNpbWFsUGFydHN9IGZyb20gXCIuL2Zvcm1hdERlY2ltYWwuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oeCwgcCkge1xuICB2YXIgZCA9IGZvcm1hdERlY2ltYWxQYXJ0cyh4LCBwKTtcbiAgaWYgKCFkKSByZXR1cm4geCArIFwiXCI7XG4gIHZhciBjb2VmZmljaWVudCA9IGRbMF0sXG4gICAgICBleHBvbmVudCA9IGRbMV07XG4gIHJldHVybiBleHBvbmVudCA8IDAgPyBcIjAuXCIgKyBuZXcgQXJyYXkoLWV4cG9uZW50KS5qb2luKFwiMFwiKSArIGNvZWZmaWNpZW50XG4gICAgICA6IGNvZWZmaWNpZW50Lmxlbmd0aCA+IGV4cG9uZW50ICsgMSA/IGNvZWZmaWNpZW50LnNsaWNlKDAsIGV4cG9uZW50ICsgMSkgKyBcIi5cIiArIGNvZWZmaWNpZW50LnNsaWNlKGV4cG9uZW50ICsgMSlcbiAgICAgIDogY29lZmZpY2llbnQgKyBuZXcgQXJyYXkoZXhwb25lbnQgLSBjb2VmZmljaWVudC5sZW5ndGggKyAyKS5qb2luKFwiMFwiKTtcbn1cbiIsCiAgICAiaW1wb3J0IGZvcm1hdERlY2ltYWwgZnJvbSBcIi4vZm9ybWF0RGVjaW1hbC5qc1wiO1xuaW1wb3J0IGZvcm1hdFByZWZpeEF1dG8gZnJvbSBcIi4vZm9ybWF0UHJlZml4QXV0by5qc1wiO1xuaW1wb3J0IGZvcm1hdFJvdW5kZWQgZnJvbSBcIi4vZm9ybWF0Um91bmRlZC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIFwiJVwiOiAoeCwgcCkgPT4gKHggKiAxMDApLnRvRml4ZWQocCksXG4gIFwiYlwiOiAoeCkgPT4gTWF0aC5yb3VuZCh4KS50b1N0cmluZygyKSxcbiAgXCJjXCI6ICh4KSA9PiB4ICsgXCJcIixcbiAgXCJkXCI6IGZvcm1hdERlY2ltYWwsXG4gIFwiZVwiOiAoeCwgcCkgPT4geC50b0V4cG9uZW50aWFsKHApLFxuICBcImZcIjogKHgsIHApID0+IHgudG9GaXhlZChwKSxcbiAgXCJnXCI6ICh4LCBwKSA9PiB4LnRvUHJlY2lzaW9uKHApLFxuICBcIm9cIjogKHgpID0+IE1hdGgucm91bmQoeCkudG9TdHJpbmcoOCksXG4gIFwicFwiOiAoeCwgcCkgPT4gZm9ybWF0Um91bmRlZCh4ICogMTAwLCBwKSxcbiAgXCJyXCI6IGZvcm1hdFJvdW5kZWQsXG4gIFwic1wiOiBmb3JtYXRQcmVmaXhBdXRvLFxuICBcIlhcIjogKHgpID0+IE1hdGgucm91bmQoeCkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCksXG4gIFwieFwiOiAoeCkgPT4gTWF0aC5yb3VuZCh4KS50b1N0cmluZygxNilcbn07XG4iLAogICAgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIHg7XG59XG4iLAogICAgImltcG9ydCBleHBvbmVudCBmcm9tIFwiLi9leHBvbmVudC5qc1wiO1xuaW1wb3J0IGZvcm1hdEdyb3VwIGZyb20gXCIuL2Zvcm1hdEdyb3VwLmpzXCI7XG5pbXBvcnQgZm9ybWF0TnVtZXJhbHMgZnJvbSBcIi4vZm9ybWF0TnVtZXJhbHMuanNcIjtcbmltcG9ydCBmb3JtYXRTcGVjaWZpZXIgZnJvbSBcIi4vZm9ybWF0U3BlY2lmaWVyLmpzXCI7XG5pbXBvcnQgZm9ybWF0VHJpbSBmcm9tIFwiLi9mb3JtYXRUcmltLmpzXCI7XG5pbXBvcnQgZm9ybWF0VHlwZXMgZnJvbSBcIi4vZm9ybWF0VHlwZXMuanNcIjtcbmltcG9ydCB7cHJlZml4RXhwb25lbnR9IGZyb20gXCIuL2Zvcm1hdFByZWZpeEF1dG8uanNcIjtcbmltcG9ydCBpZGVudGl0eSBmcm9tIFwiLi9pZGVudGl0eS5qc1wiO1xuXG52YXIgbWFwID0gQXJyYXkucHJvdG90eXBlLm1hcCxcbiAgICBwcmVmaXhlcyA9IFtcInlcIixcInpcIixcImFcIixcImZcIixcInBcIixcIm5cIixcIsK1XCIsXCJtXCIsXCJcIixcImtcIixcIk1cIixcIkdcIixcIlRcIixcIlBcIixcIkVcIixcIlpcIixcIllcIl07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGxvY2FsZSkge1xuICB2YXIgZ3JvdXAgPSBsb2NhbGUuZ3JvdXBpbmcgPT09IHVuZGVmaW5lZCB8fCBsb2NhbGUudGhvdXNhbmRzID09PSB1bmRlZmluZWQgPyBpZGVudGl0eSA6IGZvcm1hdEdyb3VwKG1hcC5jYWxsKGxvY2FsZS5ncm91cGluZywgTnVtYmVyKSwgbG9jYWxlLnRob3VzYW5kcyArIFwiXCIpLFxuICAgICAgY3VycmVuY3lQcmVmaXggPSBsb2NhbGUuY3VycmVuY3kgPT09IHVuZGVmaW5lZCA/IFwiXCIgOiBsb2NhbGUuY3VycmVuY3lbMF0gKyBcIlwiLFxuICAgICAgY3VycmVuY3lTdWZmaXggPSBsb2NhbGUuY3VycmVuY3kgPT09IHVuZGVmaW5lZCA/IFwiXCIgOiBsb2NhbGUuY3VycmVuY3lbMV0gKyBcIlwiLFxuICAgICAgZGVjaW1hbCA9IGxvY2FsZS5kZWNpbWFsID09PSB1bmRlZmluZWQgPyBcIi5cIiA6IGxvY2FsZS5kZWNpbWFsICsgXCJcIixcbiAgICAgIG51bWVyYWxzID0gbG9jYWxlLm51bWVyYWxzID09PSB1bmRlZmluZWQgPyBpZGVudGl0eSA6IGZvcm1hdE51bWVyYWxzKG1hcC5jYWxsKGxvY2FsZS5udW1lcmFscywgU3RyaW5nKSksXG4gICAgICBwZXJjZW50ID0gbG9jYWxlLnBlcmNlbnQgPT09IHVuZGVmaW5lZCA/IFwiJVwiIDogbG9jYWxlLnBlcmNlbnQgKyBcIlwiLFxuICAgICAgbWludXMgPSBsb2NhbGUubWludXMgPT09IHVuZGVmaW5lZCA/IFwi4oiSXCIgOiBsb2NhbGUubWludXMgKyBcIlwiLFxuICAgICAgbmFuID0gbG9jYWxlLm5hbiA9PT0gdW5kZWZpbmVkID8gXCJOYU5cIiA6IGxvY2FsZS5uYW4gKyBcIlwiO1xuXG4gIGZ1bmN0aW9uIG5ld0Zvcm1hdChzcGVjaWZpZXIsIG9wdGlvbnMpIHtcbiAgICBzcGVjaWZpZXIgPSBmb3JtYXRTcGVjaWZpZXIoc3BlY2lmaWVyKTtcblxuICAgIHZhciBmaWxsID0gc3BlY2lmaWVyLmZpbGwsXG4gICAgICAgIGFsaWduID0gc3BlY2lmaWVyLmFsaWduLFxuICAgICAgICBzaWduID0gc3BlY2lmaWVyLnNpZ24sXG4gICAgICAgIHN5bWJvbCA9IHNwZWNpZmllci5zeW1ib2wsXG4gICAgICAgIHplcm8gPSBzcGVjaWZpZXIuemVybyxcbiAgICAgICAgd2lkdGggPSBzcGVjaWZpZXIud2lkdGgsXG4gICAgICAgIGNvbW1hID0gc3BlY2lmaWVyLmNvbW1hLFxuICAgICAgICBwcmVjaXNpb24gPSBzcGVjaWZpZXIucHJlY2lzaW9uLFxuICAgICAgICB0cmltID0gc3BlY2lmaWVyLnRyaW0sXG4gICAgICAgIHR5cGUgPSBzcGVjaWZpZXIudHlwZTtcblxuICAgIC8vIFRoZSBcIm5cIiB0eXBlIGlzIGFuIGFsaWFzIGZvciBcIixnXCIuXG4gICAgaWYgKHR5cGUgPT09IFwiblwiKSBjb21tYSA9IHRydWUsIHR5cGUgPSBcImdcIjtcblxuICAgIC8vIFRoZSBcIlwiIHR5cGUsIGFuZCBhbnkgaW52YWxpZCB0eXBlLCBpcyBhbiBhbGlhcyBmb3IgXCIuMTJ+Z1wiLlxuICAgIGVsc2UgaWYgKCFmb3JtYXRUeXBlc1t0eXBlXSkgcHJlY2lzaW9uID09PSB1bmRlZmluZWQgJiYgKHByZWNpc2lvbiA9IDEyKSwgdHJpbSA9IHRydWUsIHR5cGUgPSBcImdcIjtcblxuICAgIC8vIElmIHplcm8gZmlsbCBpcyBzcGVjaWZpZWQsIHBhZGRpbmcgZ29lcyBhZnRlciBzaWduIGFuZCBiZWZvcmUgZGlnaXRzLlxuICAgIGlmICh6ZXJvIHx8IChmaWxsID09PSBcIjBcIiAmJiBhbGlnbiA9PT0gXCI9XCIpKSB6ZXJvID0gdHJ1ZSwgZmlsbCA9IFwiMFwiLCBhbGlnbiA9IFwiPVwiO1xuXG4gICAgLy8gQ29tcHV0ZSB0aGUgcHJlZml4IGFuZCBzdWZmaXguXG4gICAgLy8gRm9yIFNJLXByZWZpeCwgdGhlIHN1ZmZpeCBpcyBsYXppbHkgY29tcHV0ZWQuXG4gICAgdmFyIHByZWZpeCA9IChvcHRpb25zICYmIG9wdGlvbnMucHJlZml4ICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLnByZWZpeCA6IFwiXCIpICsgKHN5bWJvbCA9PT0gXCIkXCIgPyBjdXJyZW5jeVByZWZpeCA6IHN5bWJvbCA9PT0gXCIjXCIgJiYgL1tib3hYXS8udGVzdCh0eXBlKSA/IFwiMFwiICsgdHlwZS50b0xvd2VyQ2FzZSgpIDogXCJcIiksXG4gICAgICAgIHN1ZmZpeCA9IChzeW1ib2wgPT09IFwiJFwiID8gY3VycmVuY3lTdWZmaXggOiAvWyVwXS8udGVzdCh0eXBlKSA/IHBlcmNlbnQgOiBcIlwiKSArIChvcHRpb25zICYmIG9wdGlvbnMuc3VmZml4ICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLnN1ZmZpeCA6IFwiXCIpO1xuXG4gICAgLy8gV2hhdCBmb3JtYXQgZnVuY3Rpb24gc2hvdWxkIHdlIHVzZT9cbiAgICAvLyBJcyB0aGlzIGFuIGludGVnZXIgdHlwZT9cbiAgICAvLyBDYW4gdGhpcyB0eXBlIGdlbmVyYXRlIGV4cG9uZW50aWFsIG5vdGF0aW9uP1xuICAgIHZhciBmb3JtYXRUeXBlID0gZm9ybWF0VHlwZXNbdHlwZV0sXG4gICAgICAgIG1heWJlU3VmZml4ID0gL1tkZWZncHJzJV0vLnRlc3QodHlwZSk7XG5cbiAgICAvLyBTZXQgdGhlIGRlZmF1bHQgcHJlY2lzaW9uIGlmIG5vdCBzcGVjaWZpZWQsXG4gICAgLy8gb3IgY2xhbXAgdGhlIHNwZWNpZmllZCBwcmVjaXNpb24gdG8gdGhlIHN1cHBvcnRlZCByYW5nZS5cbiAgICAvLyBGb3Igc2lnbmlmaWNhbnQgcHJlY2lzaW9uLCBpdCBtdXN0IGJlIGluIFsxLCAyMV0uXG4gICAgLy8gRm9yIGZpeGVkIHByZWNpc2lvbiwgaXQgbXVzdCBiZSBpbiBbMCwgMjBdLlxuICAgIHByZWNpc2lvbiA9IHByZWNpc2lvbiA9PT0gdW5kZWZpbmVkID8gNlxuICAgICAgICA6IC9bZ3Byc10vLnRlc3QodHlwZSkgPyBNYXRoLm1heCgxLCBNYXRoLm1pbigyMSwgcHJlY2lzaW9uKSlcbiAgICAgICAgOiBNYXRoLm1heCgwLCBNYXRoLm1pbigyMCwgcHJlY2lzaW9uKSk7XG5cbiAgICBmdW5jdGlvbiBmb3JtYXQodmFsdWUpIHtcbiAgICAgIHZhciB2YWx1ZVByZWZpeCA9IHByZWZpeCxcbiAgICAgICAgICB2YWx1ZVN1ZmZpeCA9IHN1ZmZpeCxcbiAgICAgICAgICBpLCBuLCBjO1xuXG4gICAgICBpZiAodHlwZSA9PT0gXCJjXCIpIHtcbiAgICAgICAgdmFsdWVTdWZmaXggPSBmb3JtYXRUeXBlKHZhbHVlKSArIHZhbHVlU3VmZml4O1xuICAgICAgICB2YWx1ZSA9IFwiXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9ICt2YWx1ZTtcblxuICAgICAgICAvLyBEZXRlcm1pbmUgdGhlIHNpZ24uIC0wIGlzIG5vdCBsZXNzIHRoYW4gMCwgYnV0IDEgLyAtMCBpcyFcbiAgICAgICAgdmFyIHZhbHVlTmVnYXRpdmUgPSB2YWx1ZSA8IDAgfHwgMSAvIHZhbHVlIDwgMDtcblxuICAgICAgICAvLyBQZXJmb3JtIHRoZSBpbml0aWFsIGZvcm1hdHRpbmcuXG4gICAgICAgIHZhbHVlID0gaXNOYU4odmFsdWUpID8gbmFuIDogZm9ybWF0VHlwZShNYXRoLmFicyh2YWx1ZSksIHByZWNpc2lvbik7XG5cbiAgICAgICAgLy8gVHJpbSBpbnNpZ25pZmljYW50IHplcm9zLlxuICAgICAgICBpZiAodHJpbSkgdmFsdWUgPSBmb3JtYXRUcmltKHZhbHVlKTtcblxuICAgICAgICAvLyBJZiBhIG5lZ2F0aXZlIHZhbHVlIHJvdW5kcyB0byB6ZXJvIGFmdGVyIGZvcm1hdHRpbmcsIGFuZCBubyBleHBsaWNpdCBwb3NpdGl2ZSBzaWduIGlzIHJlcXVlc3RlZCwgaGlkZSB0aGUgc2lnbi5cbiAgICAgICAgaWYgKHZhbHVlTmVnYXRpdmUgJiYgK3ZhbHVlID09PSAwICYmIHNpZ24gIT09IFwiK1wiKSB2YWx1ZU5lZ2F0aXZlID0gZmFsc2U7XG5cbiAgICAgICAgLy8gQ29tcHV0ZSB0aGUgcHJlZml4IGFuZCBzdWZmaXguXG4gICAgICAgIHZhbHVlUHJlZml4ID0gKHZhbHVlTmVnYXRpdmUgPyAoc2lnbiA9PT0gXCIoXCIgPyBzaWduIDogbWludXMpIDogc2lnbiA9PT0gXCItXCIgfHwgc2lnbiA9PT0gXCIoXCIgPyBcIlwiIDogc2lnbikgKyB2YWx1ZVByZWZpeDtcbiAgICAgICAgdmFsdWVTdWZmaXggPSAodHlwZSA9PT0gXCJzXCIgJiYgIWlzTmFOKHZhbHVlKSAmJiBwcmVmaXhFeHBvbmVudCAhPT0gdW5kZWZpbmVkID8gcHJlZml4ZXNbOCArIHByZWZpeEV4cG9uZW50IC8gM10gOiBcIlwiKSArIHZhbHVlU3VmZml4ICsgKHZhbHVlTmVnYXRpdmUgJiYgc2lnbiA9PT0gXCIoXCIgPyBcIilcIiA6IFwiXCIpO1xuXG4gICAgICAgIC8vIEJyZWFrIHRoZSBmb3JtYXR0ZWQgdmFsdWUgaW50byB0aGUgaW50ZWdlciDigJx2YWx1ZeKAnSBwYXJ0IHRoYXQgY2FuIGJlXG4gICAgICAgIC8vIGdyb3VwZWQsIGFuZCBmcmFjdGlvbmFsIG9yIGV4cG9uZW50aWFsIOKAnHN1ZmZpeOKAnSBwYXJ0IHRoYXQgaXMgbm90LlxuICAgICAgICBpZiAobWF5YmVTdWZmaXgpIHtcbiAgICAgICAgICBpID0gLTEsIG4gPSB2YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgICAgICAgIGlmIChjID0gdmFsdWUuY2hhckNvZGVBdChpKSwgNDggPiBjIHx8IGMgPiA1Nykge1xuICAgICAgICAgICAgICB2YWx1ZVN1ZmZpeCA9IChjID09PSA0NiA/IGRlY2ltYWwgKyB2YWx1ZS5zbGljZShpICsgMSkgOiB2YWx1ZS5zbGljZShpKSkgKyB2YWx1ZVN1ZmZpeDtcbiAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5zbGljZSgwLCBpKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoZSBmaWxsIGNoYXJhY3RlciBpcyBub3QgXCIwXCIsIGdyb3VwaW5nIGlzIGFwcGxpZWQgYmVmb3JlIHBhZGRpbmcuXG4gICAgICBpZiAoY29tbWEgJiYgIXplcm8pIHZhbHVlID0gZ3JvdXAodmFsdWUsIEluZmluaXR5KTtcblxuICAgICAgLy8gQ29tcHV0ZSB0aGUgcGFkZGluZy5cbiAgICAgIHZhciBsZW5ndGggPSB2YWx1ZVByZWZpeC5sZW5ndGggKyB2YWx1ZS5sZW5ndGggKyB2YWx1ZVN1ZmZpeC5sZW5ndGgsXG4gICAgICAgICAgcGFkZGluZyA9IGxlbmd0aCA8IHdpZHRoID8gbmV3IEFycmF5KHdpZHRoIC0gbGVuZ3RoICsgMSkuam9pbihmaWxsKSA6IFwiXCI7XG5cbiAgICAgIC8vIElmIHRoZSBmaWxsIGNoYXJhY3RlciBpcyBcIjBcIiwgZ3JvdXBpbmcgaXMgYXBwbGllZCBhZnRlciBwYWRkaW5nLlxuICAgICAgaWYgKGNvbW1hICYmIHplcm8pIHZhbHVlID0gZ3JvdXAocGFkZGluZyArIHZhbHVlLCBwYWRkaW5nLmxlbmd0aCA/IHdpZHRoIC0gdmFsdWVTdWZmaXgubGVuZ3RoIDogSW5maW5pdHkpLCBwYWRkaW5nID0gXCJcIjtcblxuICAgICAgLy8gUmVjb25zdHJ1Y3QgdGhlIGZpbmFsIG91dHB1dCBiYXNlZCBvbiB0aGUgZGVzaXJlZCBhbGlnbm1lbnQuXG4gICAgICBzd2l0Y2ggKGFsaWduKSB7XG4gICAgICAgIGNhc2UgXCI8XCI6IHZhbHVlID0gdmFsdWVQcmVmaXggKyB2YWx1ZSArIHZhbHVlU3VmZml4ICsgcGFkZGluZzsgYnJlYWs7XG4gICAgICAgIGNhc2UgXCI9XCI6IHZhbHVlID0gdmFsdWVQcmVmaXggKyBwYWRkaW5nICsgdmFsdWUgKyB2YWx1ZVN1ZmZpeDsgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJeXCI6IHZhbHVlID0gcGFkZGluZy5zbGljZSgwLCBsZW5ndGggPSBwYWRkaW5nLmxlbmd0aCA+PiAxKSArIHZhbHVlUHJlZml4ICsgdmFsdWUgKyB2YWx1ZVN1ZmZpeCArIHBhZGRpbmcuc2xpY2UobGVuZ3RoKTsgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6IHZhbHVlID0gcGFkZGluZyArIHZhbHVlUHJlZml4ICsgdmFsdWUgKyB2YWx1ZVN1ZmZpeDsgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudW1lcmFscyh2YWx1ZSk7XG4gICAgfVxuXG4gICAgZm9ybWF0LnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gc3BlY2lmaWVyICsgXCJcIjtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGZvcm1hdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFByZWZpeChzcGVjaWZpZXIsIHZhbHVlKSB7XG4gICAgdmFyIGUgPSBNYXRoLm1heCgtOCwgTWF0aC5taW4oOCwgTWF0aC5mbG9vcihleHBvbmVudCh2YWx1ZSkgLyAzKSkpICogMyxcbiAgICAgICAgayA9IE1hdGgucG93KDEwLCAtZSksXG4gICAgICAgIGYgPSBuZXdGb3JtYXQoKHNwZWNpZmllciA9IGZvcm1hdFNwZWNpZmllcihzcGVjaWZpZXIpLCBzcGVjaWZpZXIudHlwZSA9IFwiZlwiLCBzcGVjaWZpZXIpLCB7c3VmZml4OiBwcmVmaXhlc1s4ICsgZSAvIDNdfSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gZihrICogdmFsdWUpO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGZvcm1hdDogbmV3Rm9ybWF0LFxuICAgIGZvcm1hdFByZWZpeDogZm9ybWF0UHJlZml4XG4gIH07XG59XG4iLAogICAgImltcG9ydCBmb3JtYXRMb2NhbGUgZnJvbSBcIi4vbG9jYWxlLmpzXCI7XG5cbnZhciBsb2NhbGU7XG5leHBvcnQgdmFyIGZvcm1hdDtcbmV4cG9ydCB2YXIgZm9ybWF0UHJlZml4O1xuXG5kZWZhdWx0TG9jYWxlKHtcbiAgdGhvdXNhbmRzOiBcIixcIixcbiAgZ3JvdXBpbmc6IFszXSxcbiAgY3VycmVuY3k6IFtcIiRcIiwgXCJcIl1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZWZhdWx0TG9jYWxlKGRlZmluaXRpb24pIHtcbiAgbG9jYWxlID0gZm9ybWF0TG9jYWxlKGRlZmluaXRpb24pO1xuICBmb3JtYXQgPSBsb2NhbGUuZm9ybWF0O1xuICBmb3JtYXRQcmVmaXggPSBsb2NhbGUuZm9ybWF0UHJlZml4O1xuICByZXR1cm4gbG9jYWxlO1xufVxuIiwKICAgICJpbXBvcnQgZXhwb25lbnQgZnJvbSBcIi4vZXhwb25lbnQuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc3RlcCkge1xuICByZXR1cm4gTWF0aC5tYXgoMCwgLWV4cG9uZW50KE1hdGguYWJzKHN0ZXApKSk7XG59XG4iLAogICAgImltcG9ydCBleHBvbmVudCBmcm9tIFwiLi9leHBvbmVudC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzdGVwLCB2YWx1ZSkge1xuICByZXR1cm4gTWF0aC5tYXgoMCwgTWF0aC5tYXgoLTgsIE1hdGgubWluKDgsIE1hdGguZmxvb3IoZXhwb25lbnQodmFsdWUpIC8gMykpKSAqIDMgLSBleHBvbmVudChNYXRoLmFicyhzdGVwKSkpO1xufVxuIiwKICAgICJpbXBvcnQgZXhwb25lbnQgZnJvbSBcIi4vZXhwb25lbnQuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc3RlcCwgbWF4KSB7XG4gIHN0ZXAgPSBNYXRoLmFicyhzdGVwKSwgbWF4ID0gTWF0aC5hYnMobWF4KSAtIHN0ZXA7XG4gIHJldHVybiBNYXRoLm1heCgwLCBleHBvbmVudChtYXgpIC0gZXhwb25lbnQoc3RlcCkpICsgMTtcbn1cbiIsCiAgICAiZnVuY3Rpb24gY291bnQobm9kZSkge1xuICB2YXIgc3VtID0gMCxcbiAgICAgIGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbixcbiAgICAgIGkgPSBjaGlsZHJlbiAmJiBjaGlsZHJlbi5sZW5ndGg7XG4gIGlmICghaSkgc3VtID0gMTtcbiAgZWxzZSB3aGlsZSAoLS1pID49IDApIHN1bSArPSBjaGlsZHJlbltpXS52YWx1ZTtcbiAgbm9kZS52YWx1ZSA9IHN1bTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmVhY2hBZnRlcihjb3VudCk7XG59XG4iLAogICAgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNhbGxiYWNrLCB0aGF0KSB7XG4gIGxldCBpbmRleCA9IC0xO1xuICBmb3IgKGNvbnN0IG5vZGUgb2YgdGhpcykge1xuICAgIGNhbGxiYWNrLmNhbGwodGhhdCwgbm9kZSwgKytpbmRleCwgdGhpcyk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59XG4iLAogICAgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNhbGxiYWNrLCB0aGF0KSB7XG4gIHZhciBub2RlID0gdGhpcywgbm9kZXMgPSBbbm9kZV0sIGNoaWxkcmVuLCBpLCBpbmRleCA9IC0xO1xuICB3aGlsZSAobm9kZSA9IG5vZGVzLnBvcCgpKSB7XG4gICAgY2FsbGJhY2suY2FsbCh0aGF0LCBub2RlLCArK2luZGV4LCB0aGlzKTtcbiAgICBpZiAoY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuKSB7XG4gICAgICBmb3IgKGkgPSBjaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICBub2Rlcy5wdXNoKGNoaWxkcmVuW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59XG4iLAogICAgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNhbGxiYWNrLCB0aGF0KSB7XG4gIHZhciBub2RlID0gdGhpcywgbm9kZXMgPSBbbm9kZV0sIG5leHQgPSBbXSwgY2hpbGRyZW4sIGksIG4sIGluZGV4ID0gLTE7XG4gIHdoaWxlIChub2RlID0gbm9kZXMucG9wKCkpIHtcbiAgICBuZXh0LnB1c2gobm9kZSk7XG4gICAgaWYgKGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbikge1xuICAgICAgZm9yIChpID0gMCwgbiA9IGNoaWxkcmVuLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgICAgICBub2Rlcy5wdXNoKGNoaWxkcmVuW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgd2hpbGUgKG5vZGUgPSBuZXh0LnBvcCgpKSB7XG4gICAgY2FsbGJhY2suY2FsbCh0aGF0LCBub2RlLCArK2luZGV4LCB0aGlzKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn1cbiIsCiAgICAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY2FsbGJhY2ssIHRoYXQpIHtcbiAgbGV0IGluZGV4ID0gLTE7XG4gIGZvciAoY29uc3Qgbm9kZSBvZiB0aGlzKSB7XG4gICAgaWYgKGNhbGxiYWNrLmNhbGwodGhhdCwgbm9kZSwgKytpbmRleCwgdGhpcykpIHtcbiAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbiAgfVxufVxuIiwKICAgICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gdGhpcy5lYWNoQWZ0ZXIoZnVuY3Rpb24obm9kZSkge1xuICAgIHZhciBzdW0gPSArdmFsdWUobm9kZS5kYXRhKSB8fCAwLFxuICAgICAgICBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW4sXG4gICAgICAgIGkgPSBjaGlsZHJlbiAmJiBjaGlsZHJlbi5sZW5ndGg7XG4gICAgd2hpbGUgKC0taSA+PSAwKSBzdW0gKz0gY2hpbGRyZW5baV0udmFsdWU7XG4gICAgbm9kZS52YWx1ZSA9IHN1bTtcbiAgfSk7XG59XG4iLAogICAgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNvbXBhcmUpIHtcbiAgcmV0dXJuIHRoaXMuZWFjaEJlZm9yZShmdW5jdGlvbihub2RlKSB7XG4gICAgaWYgKG5vZGUuY2hpbGRyZW4pIHtcbiAgICAgIG5vZGUuY2hpbGRyZW4uc29ydChjb21wYXJlKTtcbiAgICB9XG4gIH0pO1xufVxuIiwKICAgICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihlbmQpIHtcbiAgdmFyIHN0YXJ0ID0gdGhpcyxcbiAgICAgIGFuY2VzdG9yID0gbGVhc3RDb21tb25BbmNlc3RvcihzdGFydCwgZW5kKSxcbiAgICAgIG5vZGVzID0gW3N0YXJ0XTtcbiAgd2hpbGUgKHN0YXJ0ICE9PSBhbmNlc3Rvcikge1xuICAgIHN0YXJ0ID0gc3RhcnQucGFyZW50O1xuICAgIG5vZGVzLnB1c2goc3RhcnQpO1xuICB9XG4gIHZhciBrID0gbm9kZXMubGVuZ3RoO1xuICB3aGlsZSAoZW5kICE9PSBhbmNlc3Rvcikge1xuICAgIG5vZGVzLnNwbGljZShrLCAwLCBlbmQpO1xuICAgIGVuZCA9IGVuZC5wYXJlbnQ7XG4gIH1cbiAgcmV0dXJuIG5vZGVzO1xufVxuXG5mdW5jdGlvbiBsZWFzdENvbW1vbkFuY2VzdG9yKGEsIGIpIHtcbiAgaWYgKGEgPT09IGIpIHJldHVybiBhO1xuICB2YXIgYU5vZGVzID0gYS5hbmNlc3RvcnMoKSxcbiAgICAgIGJOb2RlcyA9IGIuYW5jZXN0b3JzKCksXG4gICAgICBjID0gbnVsbDtcbiAgYSA9IGFOb2Rlcy5wb3AoKTtcbiAgYiA9IGJOb2Rlcy5wb3AoKTtcbiAgd2hpbGUgKGEgPT09IGIpIHtcbiAgICBjID0gYTtcbiAgICBhID0gYU5vZGVzLnBvcCgpO1xuICAgIGIgPSBiTm9kZXMucG9wKCk7XG4gIH1cbiAgcmV0dXJuIGM7XG59XG4iLAogICAgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgbm9kZSA9IHRoaXMsIG5vZGVzID0gW25vZGVdO1xuICB3aGlsZSAobm9kZSA9IG5vZGUucGFyZW50KSB7XG4gICAgbm9kZXMucHVzaChub2RlKTtcbiAgfVxuICByZXR1cm4gbm9kZXM7XG59XG4iLAogICAgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzKTtcbn1cbiIsCiAgICAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHZhciBsZWF2ZXMgPSBbXTtcbiAgdGhpcy5lYWNoQmVmb3JlKGZ1bmN0aW9uKG5vZGUpIHtcbiAgICBpZiAoIW5vZGUuY2hpbGRyZW4pIHtcbiAgICAgIGxlYXZlcy5wdXNoKG5vZGUpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBsZWF2ZXM7XG59XG4iLAogICAgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgcm9vdCA9IHRoaXMsIGxpbmtzID0gW107XG4gIHJvb3QuZWFjaChmdW5jdGlvbihub2RlKSB7XG4gICAgaWYgKG5vZGUgIT09IHJvb3QpIHsgLy8gRG9u4oCZdCBpbmNsdWRlIHRoZSByb2904oCZcyBwYXJlbnQsIGlmIGFueS5cbiAgICAgIGxpbmtzLnB1c2goe3NvdXJjZTogbm9kZS5wYXJlbnQsIHRhcmdldDogbm9kZX0pO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBsaW5rcztcbn1cbiIsCiAgICAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24qKCkge1xuICB2YXIgbm9kZSA9IHRoaXMsIGN1cnJlbnQsIG5leHQgPSBbbm9kZV0sIGNoaWxkcmVuLCBpLCBuO1xuICBkbyB7XG4gICAgY3VycmVudCA9IG5leHQucmV2ZXJzZSgpLCBuZXh0ID0gW107XG4gICAgd2hpbGUgKG5vZGUgPSBjdXJyZW50LnBvcCgpKSB7XG4gICAgICB5aWVsZCBub2RlO1xuICAgICAgaWYgKGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbikge1xuICAgICAgICBmb3IgKGkgPSAwLCBuID0gY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgICAgICAgbmV4dC5wdXNoKGNoaWxkcmVuW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSB3aGlsZSAobmV4dC5sZW5ndGgpO1xufVxuIiwKICAgICJpbXBvcnQgbm9kZV9jb3VudCBmcm9tIFwiLi9jb3VudC5qc1wiO1xuaW1wb3J0IG5vZGVfZWFjaCBmcm9tIFwiLi9lYWNoLmpzXCI7XG5pbXBvcnQgbm9kZV9lYWNoQmVmb3JlIGZyb20gXCIuL2VhY2hCZWZvcmUuanNcIjtcbmltcG9ydCBub2RlX2VhY2hBZnRlciBmcm9tIFwiLi9lYWNoQWZ0ZXIuanNcIjtcbmltcG9ydCBub2RlX2ZpbmQgZnJvbSBcIi4vZmluZC5qc1wiO1xuaW1wb3J0IG5vZGVfc3VtIGZyb20gXCIuL3N1bS5qc1wiO1xuaW1wb3J0IG5vZGVfc29ydCBmcm9tIFwiLi9zb3J0LmpzXCI7XG5pbXBvcnQgbm9kZV9wYXRoIGZyb20gXCIuL3BhdGguanNcIjtcbmltcG9ydCBub2RlX2FuY2VzdG9ycyBmcm9tIFwiLi9hbmNlc3RvcnMuanNcIjtcbmltcG9ydCBub2RlX2Rlc2NlbmRhbnRzIGZyb20gXCIuL2Rlc2NlbmRhbnRzLmpzXCI7XG5pbXBvcnQgbm9kZV9sZWF2ZXMgZnJvbSBcIi4vbGVhdmVzLmpzXCI7XG5pbXBvcnQgbm9kZV9saW5rcyBmcm9tIFwiLi9saW5rcy5qc1wiO1xuaW1wb3J0IG5vZGVfaXRlcmF0b3IgZnJvbSBcIi4vaXRlcmF0b3IuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaGllcmFyY2h5KGRhdGEsIGNoaWxkcmVuKSB7XG4gIGlmIChkYXRhIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgZGF0YSA9IFt1bmRlZmluZWQsIGRhdGFdO1xuICAgIGlmIChjaGlsZHJlbiA9PT0gdW5kZWZpbmVkKSBjaGlsZHJlbiA9IG1hcENoaWxkcmVuO1xuICB9IGVsc2UgaWYgKGNoaWxkcmVuID09PSB1bmRlZmluZWQpIHtcbiAgICBjaGlsZHJlbiA9IG9iamVjdENoaWxkcmVuO1xuICB9XG5cbiAgdmFyIHJvb3QgPSBuZXcgTm9kZShkYXRhKSxcbiAgICAgIG5vZGUsXG4gICAgICBub2RlcyA9IFtyb290XSxcbiAgICAgIGNoaWxkLFxuICAgICAgY2hpbGRzLFxuICAgICAgaSxcbiAgICAgIG47XG5cbiAgd2hpbGUgKG5vZGUgPSBub2Rlcy5wb3AoKSkge1xuICAgIGlmICgoY2hpbGRzID0gY2hpbGRyZW4obm9kZS5kYXRhKSkgJiYgKG4gPSAoY2hpbGRzID0gQXJyYXkuZnJvbShjaGlsZHMpKS5sZW5ndGgpKSB7XG4gICAgICBub2RlLmNoaWxkcmVuID0gY2hpbGRzO1xuICAgICAgZm9yIChpID0gbiAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIG5vZGVzLnB1c2goY2hpbGQgPSBjaGlsZHNbaV0gPSBuZXcgTm9kZShjaGlsZHNbaV0pKTtcbiAgICAgICAgY2hpbGQucGFyZW50ID0gbm9kZTtcbiAgICAgICAgY2hpbGQuZGVwdGggPSBub2RlLmRlcHRoICsgMTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gcm9vdC5lYWNoQmVmb3JlKGNvbXB1dGVIZWlnaHQpO1xufVxuXG5mdW5jdGlvbiBub2RlX2NvcHkoKSB7XG4gIHJldHVybiBoaWVyYXJjaHkodGhpcykuZWFjaEJlZm9yZShjb3B5RGF0YSk7XG59XG5cbmZ1bmN0aW9uIG9iamVjdENoaWxkcmVuKGQpIHtcbiAgcmV0dXJuIGQuY2hpbGRyZW47XG59XG5cbmZ1bmN0aW9uIG1hcENoaWxkcmVuKGQpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoZCkgPyBkWzFdIDogbnVsbDtcbn1cblxuZnVuY3Rpb24gY29weURhdGEobm9kZSkge1xuICBpZiAobm9kZS5kYXRhLnZhbHVlICE9PSB1bmRlZmluZWQpIG5vZGUudmFsdWUgPSBub2RlLmRhdGEudmFsdWU7XG4gIG5vZGUuZGF0YSA9IG5vZGUuZGF0YS5kYXRhO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZUhlaWdodChub2RlKSB7XG4gIHZhciBoZWlnaHQgPSAwO1xuICBkbyBub2RlLmhlaWdodCA9IGhlaWdodDtcbiAgd2hpbGUgKChub2RlID0gbm9kZS5wYXJlbnQpICYmIChub2RlLmhlaWdodCA8ICsraGVpZ2h0KSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBOb2RlKGRhdGEpIHtcbiAgdGhpcy5kYXRhID0gZGF0YTtcbiAgdGhpcy5kZXB0aCA9XG4gIHRoaXMuaGVpZ2h0ID0gMDtcbiAgdGhpcy5wYXJlbnQgPSBudWxsO1xufVxuXG5Ob2RlLnByb3RvdHlwZSA9IGhpZXJhcmNoeS5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBOb2RlLFxuICBjb3VudDogbm9kZV9jb3VudCxcbiAgZWFjaDogbm9kZV9lYWNoLFxuICBlYWNoQWZ0ZXI6IG5vZGVfZWFjaEFmdGVyLFxuICBlYWNoQmVmb3JlOiBub2RlX2VhY2hCZWZvcmUsXG4gIGZpbmQ6IG5vZGVfZmluZCxcbiAgc3VtOiBub2RlX3N1bSxcbiAgc29ydDogbm9kZV9zb3J0LFxuICBwYXRoOiBub2RlX3BhdGgsXG4gIGFuY2VzdG9yczogbm9kZV9hbmNlc3RvcnMsXG4gIGRlc2NlbmRhbnRzOiBub2RlX2Rlc2NlbmRhbnRzLFxuICBsZWF2ZXM6IG5vZGVfbGVhdmVzLFxuICBsaW5rczogbm9kZV9saW5rcyxcbiAgY29weTogbm9kZV9jb3B5LFxuICBbU3ltYm9sLml0ZXJhdG9yXTogbm9kZV9pdGVyYXRvclxufTtcbiIsCiAgICAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obm9kZSkge1xuICBub2RlLngwID0gTWF0aC5yb3VuZChub2RlLngwKTtcbiAgbm9kZS55MCA9IE1hdGgucm91bmQobm9kZS55MCk7XG4gIG5vZGUueDEgPSBNYXRoLnJvdW5kKG5vZGUueDEpO1xuICBub2RlLnkxID0gTWF0aC5yb3VuZChub2RlLnkxKTtcbn1cbiIsCiAgICAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ocGFyZW50LCB4MCwgeTAsIHgxLCB5MSkge1xuICB2YXIgbm9kZXMgPSBwYXJlbnQuY2hpbGRyZW4sXG4gICAgICBub2RlLFxuICAgICAgaSA9IC0xLFxuICAgICAgbiA9IG5vZGVzLmxlbmd0aCxcbiAgICAgIGsgPSBwYXJlbnQudmFsdWUgJiYgKHgxIC0geDApIC8gcGFyZW50LnZhbHVlO1xuXG4gIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgbm9kZSA9IG5vZGVzW2ldLCBub2RlLnkwID0geTAsIG5vZGUueTEgPSB5MTtcbiAgICBub2RlLngwID0geDAsIG5vZGUueDEgPSB4MCArPSBub2RlLnZhbHVlICogaztcbiAgfVxufVxuIiwKICAgICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihwYXJlbnQsIHgwLCB5MCwgeDEsIHkxKSB7XG4gIHZhciBub2RlcyA9IHBhcmVudC5jaGlsZHJlbixcbiAgICAgIG5vZGUsXG4gICAgICBpID0gLTEsXG4gICAgICBuID0gbm9kZXMubGVuZ3RoLFxuICAgICAgayA9IHBhcmVudC52YWx1ZSAmJiAoeTEgLSB5MCkgLyBwYXJlbnQudmFsdWU7XG5cbiAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICBub2RlID0gbm9kZXNbaV0sIG5vZGUueDAgPSB4MCwgbm9kZS54MSA9IHgxO1xuICAgIG5vZGUueTAgPSB5MCwgbm9kZS55MSA9IHkwICs9IG5vZGUudmFsdWUgKiBrO1xuICB9XG59XG4iLAogICAgImltcG9ydCB0cmVlbWFwRGljZSBmcm9tIFwiLi9kaWNlLmpzXCI7XG5pbXBvcnQgdHJlZW1hcFNsaWNlIGZyb20gXCIuL3NsaWNlLmpzXCI7XG5cbmV4cG9ydCB2YXIgcGhpID0gKDEgKyBNYXRoLnNxcnQoNSkpIC8gMjtcblxuZXhwb3J0IGZ1bmN0aW9uIHNxdWFyaWZ5UmF0aW8ocmF0aW8sIHBhcmVudCwgeDAsIHkwLCB4MSwgeTEpIHtcbiAgdmFyIHJvd3MgPSBbXSxcbiAgICAgIG5vZGVzID0gcGFyZW50LmNoaWxkcmVuLFxuICAgICAgcm93LFxuICAgICAgbm9kZVZhbHVlLFxuICAgICAgaTAgPSAwLFxuICAgICAgaTEgPSAwLFxuICAgICAgbiA9IG5vZGVzLmxlbmd0aCxcbiAgICAgIGR4LCBkeSxcbiAgICAgIHZhbHVlID0gcGFyZW50LnZhbHVlLFxuICAgICAgc3VtVmFsdWUsXG4gICAgICBtaW5WYWx1ZSxcbiAgICAgIG1heFZhbHVlLFxuICAgICAgbmV3UmF0aW8sXG4gICAgICBtaW5SYXRpbyxcbiAgICAgIGFscGhhLFxuICAgICAgYmV0YTtcblxuICB3aGlsZSAoaTAgPCBuKSB7XG4gICAgZHggPSB4MSAtIHgwLCBkeSA9IHkxIC0geTA7XG5cbiAgICAvLyBGaW5kIHRoZSBuZXh0IG5vbi1lbXB0eSBub2RlLlxuICAgIGRvIHN1bVZhbHVlID0gbm9kZXNbaTErK10udmFsdWU7IHdoaWxlICghc3VtVmFsdWUgJiYgaTEgPCBuKTtcbiAgICBtaW5WYWx1ZSA9IG1heFZhbHVlID0gc3VtVmFsdWU7XG4gICAgYWxwaGEgPSBNYXRoLm1heChkeSAvIGR4LCBkeCAvIGR5KSAvICh2YWx1ZSAqIHJhdGlvKTtcbiAgICBiZXRhID0gc3VtVmFsdWUgKiBzdW1WYWx1ZSAqIGFscGhhO1xuICAgIG1pblJhdGlvID0gTWF0aC5tYXgobWF4VmFsdWUgLyBiZXRhLCBiZXRhIC8gbWluVmFsdWUpO1xuXG4gICAgLy8gS2VlcCBhZGRpbmcgbm9kZXMgd2hpbGUgdGhlIGFzcGVjdCByYXRpbyBtYWludGFpbnMgb3IgaW1wcm92ZXMuXG4gICAgZm9yICg7IGkxIDwgbjsgKytpMSkge1xuICAgICAgc3VtVmFsdWUgKz0gbm9kZVZhbHVlID0gbm9kZXNbaTFdLnZhbHVlO1xuICAgICAgaWYgKG5vZGVWYWx1ZSA8IG1pblZhbHVlKSBtaW5WYWx1ZSA9IG5vZGVWYWx1ZTtcbiAgICAgIGlmIChub2RlVmFsdWUgPiBtYXhWYWx1ZSkgbWF4VmFsdWUgPSBub2RlVmFsdWU7XG4gICAgICBiZXRhID0gc3VtVmFsdWUgKiBzdW1WYWx1ZSAqIGFscGhhO1xuICAgICAgbmV3UmF0aW8gPSBNYXRoLm1heChtYXhWYWx1ZSAvIGJldGEsIGJldGEgLyBtaW5WYWx1ZSk7XG4gICAgICBpZiAobmV3UmF0aW8gPiBtaW5SYXRpbykgeyBzdW1WYWx1ZSAtPSBub2RlVmFsdWU7IGJyZWFrOyB9XG4gICAgICBtaW5SYXRpbyA9IG5ld1JhdGlvO1xuICAgIH1cblxuICAgIC8vIFBvc2l0aW9uIGFuZCByZWNvcmQgdGhlIHJvdyBvcmllbnRhdGlvbi5cbiAgICByb3dzLnB1c2gocm93ID0ge3ZhbHVlOiBzdW1WYWx1ZSwgZGljZTogZHggPCBkeSwgY2hpbGRyZW46IG5vZGVzLnNsaWNlKGkwLCBpMSl9KTtcbiAgICBpZiAocm93LmRpY2UpIHRyZWVtYXBEaWNlKHJvdywgeDAsIHkwLCB4MSwgdmFsdWUgPyB5MCArPSBkeSAqIHN1bVZhbHVlIC8gdmFsdWUgOiB5MSk7XG4gICAgZWxzZSB0cmVlbWFwU2xpY2Uocm93LCB4MCwgeTAsIHZhbHVlID8geDAgKz0gZHggKiBzdW1WYWx1ZSAvIHZhbHVlIDogeDEsIHkxKTtcbiAgICB2YWx1ZSAtPSBzdW1WYWx1ZSwgaTAgPSBpMTtcbiAgfVxuXG4gIHJldHVybiByb3dzO1xufVxuXG5leHBvcnQgZGVmYXVsdCAoZnVuY3Rpb24gY3VzdG9tKHJhdGlvKSB7XG5cbiAgZnVuY3Rpb24gc3F1YXJpZnkocGFyZW50LCB4MCwgeTAsIHgxLCB5MSkge1xuICAgIHNxdWFyaWZ5UmF0aW8ocmF0aW8sIHBhcmVudCwgeDAsIHkwLCB4MSwgeTEpO1xuICB9XG5cbiAgc3F1YXJpZnkucmF0aW8gPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIGN1c3RvbSgoeCA9ICt4KSA+IDEgPyB4IDogMSk7XG4gIH07XG5cbiAgcmV0dXJuIHNxdWFyaWZ5O1xufSkocGhpKTtcbiIsCiAgICAiZXhwb3J0IGZ1bmN0aW9uIG9wdGlvbmFsKGYpIHtcbiAgcmV0dXJuIGYgPT0gbnVsbCA/IG51bGwgOiByZXF1aXJlZChmKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlcXVpcmVkKGYpIHtcbiAgaWYgKHR5cGVvZiBmICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcjtcbiAgcmV0dXJuIGY7XG59XG4iLAogICAgImV4cG9ydCBmdW5jdGlvbiBjb25zdGFudFplcm8oKSB7XG4gIHJldHVybiAwO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih4KSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4geDtcbiAgfTtcbn1cbiIsCiAgICAiaW1wb3J0IHJvdW5kTm9kZSBmcm9tIFwiLi9yb3VuZC5qc1wiO1xuaW1wb3J0IHNxdWFyaWZ5IGZyb20gXCIuL3NxdWFyaWZ5LmpzXCI7XG5pbXBvcnQge3JlcXVpcmVkfSBmcm9tIFwiLi4vYWNjZXNzb3JzLmpzXCI7XG5pbXBvcnQgY29uc3RhbnQsIHtjb25zdGFudFplcm99IGZyb20gXCIuLi9jb25zdGFudC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIHRpbGUgPSBzcXVhcmlmeSxcbiAgICAgIHJvdW5kID0gZmFsc2UsXG4gICAgICBkeCA9IDEsXG4gICAgICBkeSA9IDEsXG4gICAgICBwYWRkaW5nU3RhY2sgPSBbMF0sXG4gICAgICBwYWRkaW5nSW5uZXIgPSBjb25zdGFudFplcm8sXG4gICAgICBwYWRkaW5nVG9wID0gY29uc3RhbnRaZXJvLFxuICAgICAgcGFkZGluZ1JpZ2h0ID0gY29uc3RhbnRaZXJvLFxuICAgICAgcGFkZGluZ0JvdHRvbSA9IGNvbnN0YW50WmVybyxcbiAgICAgIHBhZGRpbmdMZWZ0ID0gY29uc3RhbnRaZXJvO1xuXG4gIGZ1bmN0aW9uIHRyZWVtYXAocm9vdCkge1xuICAgIHJvb3QueDAgPVxuICAgIHJvb3QueTAgPSAwO1xuICAgIHJvb3QueDEgPSBkeDtcbiAgICByb290LnkxID0gZHk7XG4gICAgcm9vdC5lYWNoQmVmb3JlKHBvc2l0aW9uTm9kZSk7XG4gICAgcGFkZGluZ1N0YWNrID0gWzBdO1xuICAgIGlmIChyb3VuZCkgcm9vdC5lYWNoQmVmb3JlKHJvdW5kTm9kZSk7XG4gICAgcmV0dXJuIHJvb3Q7XG4gIH1cblxuICBmdW5jdGlvbiBwb3NpdGlvbk5vZGUobm9kZSkge1xuICAgIHZhciBwID0gcGFkZGluZ1N0YWNrW25vZGUuZGVwdGhdLFxuICAgICAgICB4MCA9IG5vZGUueDAgKyBwLFxuICAgICAgICB5MCA9IG5vZGUueTAgKyBwLFxuICAgICAgICB4MSA9IG5vZGUueDEgLSBwLFxuICAgICAgICB5MSA9IG5vZGUueTEgLSBwO1xuICAgIGlmICh4MSA8IHgwKSB4MCA9IHgxID0gKHgwICsgeDEpIC8gMjtcbiAgICBpZiAoeTEgPCB5MCkgeTAgPSB5MSA9ICh5MCArIHkxKSAvIDI7XG4gICAgbm9kZS54MCA9IHgwO1xuICAgIG5vZGUueTAgPSB5MDtcbiAgICBub2RlLngxID0geDE7XG4gICAgbm9kZS55MSA9IHkxO1xuICAgIGlmIChub2RlLmNoaWxkcmVuKSB7XG4gICAgICBwID0gcGFkZGluZ1N0YWNrW25vZGUuZGVwdGggKyAxXSA9IHBhZGRpbmdJbm5lcihub2RlKSAvIDI7XG4gICAgICB4MCArPSBwYWRkaW5nTGVmdChub2RlKSAtIHA7XG4gICAgICB5MCArPSBwYWRkaW5nVG9wKG5vZGUpIC0gcDtcbiAgICAgIHgxIC09IHBhZGRpbmdSaWdodChub2RlKSAtIHA7XG4gICAgICB5MSAtPSBwYWRkaW5nQm90dG9tKG5vZGUpIC0gcDtcbiAgICAgIGlmICh4MSA8IHgwKSB4MCA9IHgxID0gKHgwICsgeDEpIC8gMjtcbiAgICAgIGlmICh5MSA8IHkwKSB5MCA9IHkxID0gKHkwICsgeTEpIC8gMjtcbiAgICAgIHRpbGUobm9kZSwgeDAsIHkwLCB4MSwgeTEpO1xuICAgIH1cbiAgfVxuXG4gIHRyZWVtYXAucm91bmQgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocm91bmQgPSAhIXgsIHRyZWVtYXApIDogcm91bmQ7XG4gIH07XG5cbiAgdHJlZW1hcC5zaXplID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGR4ID0gK3hbMF0sIGR5ID0gK3hbMV0sIHRyZWVtYXApIDogW2R4LCBkeV07XG4gIH07XG5cbiAgdHJlZW1hcC50aWxlID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHRpbGUgPSByZXF1aXJlZCh4KSwgdHJlZW1hcCkgOiB0aWxlO1xuICB9O1xuXG4gIHRyZWVtYXAucGFkZGluZyA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IHRyZWVtYXAucGFkZGluZ0lubmVyKHgpLnBhZGRpbmdPdXRlcih4KSA6IHRyZWVtYXAucGFkZGluZ0lubmVyKCk7XG4gIH07XG5cbiAgdHJlZW1hcC5wYWRkaW5nSW5uZXIgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocGFkZGluZ0lubmVyID0gdHlwZW9mIHggPT09IFwiZnVuY3Rpb25cIiA/IHggOiBjb25zdGFudCgreCksIHRyZWVtYXApIDogcGFkZGluZ0lubmVyO1xuICB9O1xuXG4gIHRyZWVtYXAucGFkZGluZ091dGVyID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gdHJlZW1hcC5wYWRkaW5nVG9wKHgpLnBhZGRpbmdSaWdodCh4KS5wYWRkaW5nQm90dG9tKHgpLnBhZGRpbmdMZWZ0KHgpIDogdHJlZW1hcC5wYWRkaW5nVG9wKCk7XG4gIH07XG5cbiAgdHJlZW1hcC5wYWRkaW5nVG9wID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHBhZGRpbmdUb3AgPSB0eXBlb2YgeCA9PT0gXCJmdW5jdGlvblwiID8geCA6IGNvbnN0YW50KCt4KSwgdHJlZW1hcCkgOiBwYWRkaW5nVG9wO1xuICB9O1xuXG4gIHRyZWVtYXAucGFkZGluZ1JpZ2h0ID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHBhZGRpbmdSaWdodCA9IHR5cGVvZiB4ID09PSBcImZ1bmN0aW9uXCIgPyB4IDogY29uc3RhbnQoK3gpLCB0cmVlbWFwKSA6IHBhZGRpbmdSaWdodDtcbiAgfTtcblxuICB0cmVlbWFwLnBhZGRpbmdCb3R0b20gPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocGFkZGluZ0JvdHRvbSA9IHR5cGVvZiB4ID09PSBcImZ1bmN0aW9uXCIgPyB4IDogY29uc3RhbnQoK3gpLCB0cmVlbWFwKSA6IHBhZGRpbmdCb3R0b207XG4gIH07XG5cbiAgdHJlZW1hcC5wYWRkaW5nTGVmdCA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChwYWRkaW5nTGVmdCA9IHR5cGVvZiB4ID09PSBcImZ1bmN0aW9uXCIgPyB4IDogY29uc3RhbnQoK3gpLCB0cmVlbWFwKSA6IHBhZGRpbmdMZWZ0O1xuICB9O1xuXG4gIHJldHVybiB0cmVlbWFwO1xufVxuIiwKICAgICJleHBvcnQgZnVuY3Rpb24gaW5pdFJhbmdlKGRvbWFpbiwgcmFuZ2UpIHtcbiAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgY2FzZSAwOiBicmVhaztcbiAgICBjYXNlIDE6IHRoaXMucmFuZ2UoZG9tYWluKTsgYnJlYWs7XG4gICAgZGVmYXVsdDogdGhpcy5yYW5nZShyYW5nZSkuZG9tYWluKGRvbWFpbik7IGJyZWFrO1xuICB9XG4gIHJldHVybiB0aGlzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdEludGVycG9sYXRvcihkb21haW4sIGludGVycG9sYXRvcikge1xuICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBjYXNlIDA6IGJyZWFrO1xuICAgIGNhc2UgMToge1xuICAgICAgaWYgKHR5cGVvZiBkb21haW4gPT09IFwiZnVuY3Rpb25cIikgdGhpcy5pbnRlcnBvbGF0b3IoZG9tYWluKTtcbiAgICAgIGVsc2UgdGhpcy5yYW5nZShkb21haW4pO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGRlZmF1bHQ6IHtcbiAgICAgIHRoaXMuZG9tYWluKGRvbWFpbik7XG4gICAgICBpZiAodHlwZW9mIGludGVycG9sYXRvciA9PT0gXCJmdW5jdGlvblwiKSB0aGlzLmludGVycG9sYXRvcihpbnRlcnBvbGF0b3IpO1xuICAgICAgZWxzZSB0aGlzLnJhbmdlKGludGVycG9sYXRvcik7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59XG4iLAogICAgImltcG9ydCB7SW50ZXJuTWFwfSBmcm9tIFwiZDMtYXJyYXlcIjtcbmltcG9ydCB7aW5pdFJhbmdlfSBmcm9tIFwiLi9pbml0LmpzXCI7XG5cbmV4cG9ydCBjb25zdCBpbXBsaWNpdCA9IFN5bWJvbChcImltcGxpY2l0XCIpO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBvcmRpbmFsKCkge1xuICB2YXIgaW5kZXggPSBuZXcgSW50ZXJuTWFwKCksXG4gICAgICBkb21haW4gPSBbXSxcbiAgICAgIHJhbmdlID0gW10sXG4gICAgICB1bmtub3duID0gaW1wbGljaXQ7XG5cbiAgZnVuY3Rpb24gc2NhbGUoZCkge1xuICAgIGxldCBpID0gaW5kZXguZ2V0KGQpO1xuICAgIGlmIChpID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh1bmtub3duICE9PSBpbXBsaWNpdCkgcmV0dXJuIHVua25vd247XG4gICAgICBpbmRleC5zZXQoZCwgaSA9IGRvbWFpbi5wdXNoKGQpIC0gMSk7XG4gICAgfVxuICAgIHJldHVybiByYW5nZVtpICUgcmFuZ2UubGVuZ3RoXTtcbiAgfVxuXG4gIHNjYWxlLmRvbWFpbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBkb21haW4uc2xpY2UoKTtcbiAgICBkb21haW4gPSBbXSwgaW5kZXggPSBuZXcgSW50ZXJuTWFwKCk7XG4gICAgZm9yIChjb25zdCB2YWx1ZSBvZiBfKSB7XG4gICAgICBpZiAoaW5kZXguaGFzKHZhbHVlKSkgY29udGludWU7XG4gICAgICBpbmRleC5zZXQodmFsdWUsIGRvbWFpbi5wdXNoKHZhbHVlKSAtIDEpO1xuICAgIH1cbiAgICByZXR1cm4gc2NhbGU7XG4gIH07XG5cbiAgc2NhbGUucmFuZ2UgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocmFuZ2UgPSBBcnJheS5mcm9tKF8pLCBzY2FsZSkgOiByYW5nZS5zbGljZSgpO1xuICB9O1xuXG4gIHNjYWxlLnVua25vd24gPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAodW5rbm93biA9IF8sIHNjYWxlKSA6IHVua25vd247XG4gIH07XG5cbiAgc2NhbGUuY29weSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBvcmRpbmFsKGRvbWFpbiwgcmFuZ2UpLnVua25vd24odW5rbm93bik7XG4gIH07XG5cbiAgaW5pdFJhbmdlLmFwcGx5KHNjYWxlLCBhcmd1bWVudHMpO1xuXG4gIHJldHVybiBzY2FsZTtcbn1cbiIsCiAgICAiaW1wb3J0IHtyYW5nZSBhcyBzZXF1ZW5jZX0gZnJvbSBcImQzLWFycmF5XCI7XG5pbXBvcnQge2luaXRSYW5nZX0gZnJvbSBcIi4vaW5pdC5qc1wiO1xuaW1wb3J0IG9yZGluYWwgZnJvbSBcIi4vb3JkaW5hbC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBiYW5kKCkge1xuICB2YXIgc2NhbGUgPSBvcmRpbmFsKCkudW5rbm93bih1bmRlZmluZWQpLFxuICAgICAgZG9tYWluID0gc2NhbGUuZG9tYWluLFxuICAgICAgb3JkaW5hbFJhbmdlID0gc2NhbGUucmFuZ2UsXG4gICAgICByMCA9IDAsXG4gICAgICByMSA9IDEsXG4gICAgICBzdGVwLFxuICAgICAgYmFuZHdpZHRoLFxuICAgICAgcm91bmQgPSBmYWxzZSxcbiAgICAgIHBhZGRpbmdJbm5lciA9IDAsXG4gICAgICBwYWRkaW5nT3V0ZXIgPSAwLFxuICAgICAgYWxpZ24gPSAwLjU7XG5cbiAgZGVsZXRlIHNjYWxlLnVua25vd247XG5cbiAgZnVuY3Rpb24gcmVzY2FsZSgpIHtcbiAgICB2YXIgbiA9IGRvbWFpbigpLmxlbmd0aCxcbiAgICAgICAgcmV2ZXJzZSA9IHIxIDwgcjAsXG4gICAgICAgIHN0YXJ0ID0gcmV2ZXJzZSA/IHIxIDogcjAsXG4gICAgICAgIHN0b3AgPSByZXZlcnNlID8gcjAgOiByMTtcbiAgICBzdGVwID0gKHN0b3AgLSBzdGFydCkgLyBNYXRoLm1heCgxLCBuIC0gcGFkZGluZ0lubmVyICsgcGFkZGluZ091dGVyICogMik7XG4gICAgaWYgKHJvdW5kKSBzdGVwID0gTWF0aC5mbG9vcihzdGVwKTtcbiAgICBzdGFydCArPSAoc3RvcCAtIHN0YXJ0IC0gc3RlcCAqIChuIC0gcGFkZGluZ0lubmVyKSkgKiBhbGlnbjtcbiAgICBiYW5kd2lkdGggPSBzdGVwICogKDEgLSBwYWRkaW5nSW5uZXIpO1xuICAgIGlmIChyb3VuZCkgc3RhcnQgPSBNYXRoLnJvdW5kKHN0YXJ0KSwgYmFuZHdpZHRoID0gTWF0aC5yb3VuZChiYW5kd2lkdGgpO1xuICAgIHZhciB2YWx1ZXMgPSBzZXF1ZW5jZShuKS5tYXAoZnVuY3Rpb24oaSkgeyByZXR1cm4gc3RhcnQgKyBzdGVwICogaTsgfSk7XG4gICAgcmV0dXJuIG9yZGluYWxSYW5nZShyZXZlcnNlID8gdmFsdWVzLnJldmVyc2UoKSA6IHZhbHVlcyk7XG4gIH1cblxuICBzY2FsZS5kb21haW4gPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoZG9tYWluKF8pLCByZXNjYWxlKCkpIDogZG9tYWluKCk7XG4gIH07XG5cbiAgc2NhbGUucmFuZ2UgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoW3IwLCByMV0gPSBfLCByMCA9ICtyMCwgcjEgPSArcjEsIHJlc2NhbGUoKSkgOiBbcjAsIHIxXTtcbiAgfTtcblxuICBzY2FsZS5yYW5nZVJvdW5kID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBbcjAsIHIxXSA9IF8sIHIwID0gK3IwLCByMSA9ICtyMSwgcm91bmQgPSB0cnVlLCByZXNjYWxlKCk7XG4gIH07XG5cbiAgc2NhbGUuYmFuZHdpZHRoID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGJhbmR3aWR0aDtcbiAgfTtcblxuICBzY2FsZS5zdGVwID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHN0ZXA7XG4gIH07XG5cbiAgc2NhbGUucm91bmQgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocm91bmQgPSAhIV8sIHJlc2NhbGUoKSkgOiByb3VuZDtcbiAgfTtcblxuICBzY2FsZS5wYWRkaW5nID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHBhZGRpbmdJbm5lciA9IE1hdGgubWluKDEsIHBhZGRpbmdPdXRlciA9ICtfKSwgcmVzY2FsZSgpKSA6IHBhZGRpbmdJbm5lcjtcbiAgfTtcblxuICBzY2FsZS5wYWRkaW5nSW5uZXIgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocGFkZGluZ0lubmVyID0gTWF0aC5taW4oMSwgXyksIHJlc2NhbGUoKSkgOiBwYWRkaW5nSW5uZXI7XG4gIH07XG5cbiAgc2NhbGUucGFkZGluZ091dGVyID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHBhZGRpbmdPdXRlciA9ICtfLCByZXNjYWxlKCkpIDogcGFkZGluZ091dGVyO1xuICB9O1xuXG4gIHNjYWxlLmFsaWduID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGFsaWduID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgXykpLCByZXNjYWxlKCkpIDogYWxpZ247XG4gIH07XG5cbiAgc2NhbGUuY29weSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBiYW5kKGRvbWFpbigpLCBbcjAsIHIxXSlcbiAgICAgICAgLnJvdW5kKHJvdW5kKVxuICAgICAgICAucGFkZGluZ0lubmVyKHBhZGRpbmdJbm5lcilcbiAgICAgICAgLnBhZGRpbmdPdXRlcihwYWRkaW5nT3V0ZXIpXG4gICAgICAgIC5hbGlnbihhbGlnbik7XG4gIH07XG5cbiAgcmV0dXJuIGluaXRSYW5nZS5hcHBseShyZXNjYWxlKCksIGFyZ3VtZW50cyk7XG59XG5cbmZ1bmN0aW9uIHBvaW50aXNoKHNjYWxlKSB7XG4gIHZhciBjb3B5ID0gc2NhbGUuY29weTtcblxuICBzY2FsZS5wYWRkaW5nID0gc2NhbGUucGFkZGluZ091dGVyO1xuICBkZWxldGUgc2NhbGUucGFkZGluZ0lubmVyO1xuICBkZWxldGUgc2NhbGUucGFkZGluZ091dGVyO1xuXG4gIHNjYWxlLmNvcHkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gcG9pbnRpc2goY29weSgpKTtcbiAgfTtcblxuICByZXR1cm4gc2NhbGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwb2ludCgpIHtcbiAgcmV0dXJuIHBvaW50aXNoKGJhbmQuYXBwbHkobnVsbCwgYXJndW1lbnRzKS5wYWRkaW5nSW5uZXIoMSkpO1xufVxuIiwKICAgICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb25zdGFudHMoeCkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHg7XG4gIH07XG59XG4iLAogICAgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG51bWJlcih4KSB7XG4gIHJldHVybiAreDtcbn1cbiIsCiAgICAiaW1wb3J0IHtiaXNlY3R9IGZyb20gXCJkMy1hcnJheVwiO1xuaW1wb3J0IHtpbnRlcnBvbGF0ZSBhcyBpbnRlcnBvbGF0ZVZhbHVlLCBpbnRlcnBvbGF0ZU51bWJlciwgaW50ZXJwb2xhdGVSb3VuZH0gZnJvbSBcImQzLWludGVycG9sYXRlXCI7XG5pbXBvcnQgY29uc3RhbnQgZnJvbSBcIi4vY29uc3RhbnQuanNcIjtcbmltcG9ydCBudW1iZXIgZnJvbSBcIi4vbnVtYmVyLmpzXCI7XG5cbnZhciB1bml0ID0gWzAsIDFdO1xuXG5leHBvcnQgZnVuY3Rpb24gaWRlbnRpdHkoeCkge1xuICByZXR1cm4geDtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplKGEsIGIpIHtcbiAgcmV0dXJuIChiIC09IChhID0gK2EpKVxuICAgICAgPyBmdW5jdGlvbih4KSB7IHJldHVybiAoeCAtIGEpIC8gYjsgfVxuICAgICAgOiBjb25zdGFudChpc05hTihiKSA/IE5hTiA6IDAuNSk7XG59XG5cbmZ1bmN0aW9uIGNsYW1wZXIoYSwgYikge1xuICB2YXIgdDtcbiAgaWYgKGEgPiBiKSB0ID0gYSwgYSA9IGIsIGIgPSB0O1xuICByZXR1cm4gZnVuY3Rpb24oeCkgeyByZXR1cm4gTWF0aC5tYXgoYSwgTWF0aC5taW4oYiwgeCkpOyB9O1xufVxuXG4vLyBub3JtYWxpemUoYSwgYikoeCkgdGFrZXMgYSBkb21haW4gdmFsdWUgeCBpbiBbYSxiXSBhbmQgcmV0dXJucyB0aGUgY29ycmVzcG9uZGluZyBwYXJhbWV0ZXIgdCBpbiBbMCwxXS5cbi8vIGludGVycG9sYXRlKGEsIGIpKHQpIHRha2VzIGEgcGFyYW1ldGVyIHQgaW4gWzAsMV0gYW5kIHJldHVybnMgdGhlIGNvcnJlc3BvbmRpbmcgcmFuZ2UgdmFsdWUgeCBpbiBbYSxiXS5cbmZ1bmN0aW9uIGJpbWFwKGRvbWFpbiwgcmFuZ2UsIGludGVycG9sYXRlKSB7XG4gIHZhciBkMCA9IGRvbWFpblswXSwgZDEgPSBkb21haW5bMV0sIHIwID0gcmFuZ2VbMF0sIHIxID0gcmFuZ2VbMV07XG4gIGlmIChkMSA8IGQwKSBkMCA9IG5vcm1hbGl6ZShkMSwgZDApLCByMCA9IGludGVycG9sYXRlKHIxLCByMCk7XG4gIGVsc2UgZDAgPSBub3JtYWxpemUoZDAsIGQxKSwgcjAgPSBpbnRlcnBvbGF0ZShyMCwgcjEpO1xuICByZXR1cm4gZnVuY3Rpb24oeCkgeyByZXR1cm4gcjAoZDAoeCkpOyB9O1xufVxuXG5mdW5jdGlvbiBwb2x5bWFwKGRvbWFpbiwgcmFuZ2UsIGludGVycG9sYXRlKSB7XG4gIHZhciBqID0gTWF0aC5taW4oZG9tYWluLmxlbmd0aCwgcmFuZ2UubGVuZ3RoKSAtIDEsXG4gICAgICBkID0gbmV3IEFycmF5KGopLFxuICAgICAgciA9IG5ldyBBcnJheShqKSxcbiAgICAgIGkgPSAtMTtcblxuICAvLyBSZXZlcnNlIGRlc2NlbmRpbmcgZG9tYWlucy5cbiAgaWYgKGRvbWFpbltqXSA8IGRvbWFpblswXSkge1xuICAgIGRvbWFpbiA9IGRvbWFpbi5zbGljZSgpLnJldmVyc2UoKTtcbiAgICByYW5nZSA9IHJhbmdlLnNsaWNlKCkucmV2ZXJzZSgpO1xuICB9XG5cbiAgd2hpbGUgKCsraSA8IGopIHtcbiAgICBkW2ldID0gbm9ybWFsaXplKGRvbWFpbltpXSwgZG9tYWluW2kgKyAxXSk7XG4gICAgcltpXSA9IGludGVycG9sYXRlKHJhbmdlW2ldLCByYW5nZVtpICsgMV0pO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHgpIHtcbiAgICB2YXIgaSA9IGJpc2VjdChkb21haW4sIHgsIDEsIGopIC0gMTtcbiAgICByZXR1cm4gcltpXShkW2ldKHgpKTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvcHkoc291cmNlLCB0YXJnZXQpIHtcbiAgcmV0dXJuIHRhcmdldFxuICAgICAgLmRvbWFpbihzb3VyY2UuZG9tYWluKCkpXG4gICAgICAucmFuZ2Uoc291cmNlLnJhbmdlKCkpXG4gICAgICAuaW50ZXJwb2xhdGUoc291cmNlLmludGVycG9sYXRlKCkpXG4gICAgICAuY2xhbXAoc291cmNlLmNsYW1wKCkpXG4gICAgICAudW5rbm93bihzb3VyY2UudW5rbm93bigpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybWVyKCkge1xuICB2YXIgZG9tYWluID0gdW5pdCxcbiAgICAgIHJhbmdlID0gdW5pdCxcbiAgICAgIGludGVycG9sYXRlID0gaW50ZXJwb2xhdGVWYWx1ZSxcbiAgICAgIHRyYW5zZm9ybSxcbiAgICAgIHVudHJhbnNmb3JtLFxuICAgICAgdW5rbm93bixcbiAgICAgIGNsYW1wID0gaWRlbnRpdHksXG4gICAgICBwaWVjZXdpc2UsXG4gICAgICBvdXRwdXQsXG4gICAgICBpbnB1dDtcblxuICBmdW5jdGlvbiByZXNjYWxlKCkge1xuICAgIHZhciBuID0gTWF0aC5taW4oZG9tYWluLmxlbmd0aCwgcmFuZ2UubGVuZ3RoKTtcbiAgICBpZiAoY2xhbXAgIT09IGlkZW50aXR5KSBjbGFtcCA9IGNsYW1wZXIoZG9tYWluWzBdLCBkb21haW5bbiAtIDFdKTtcbiAgICBwaWVjZXdpc2UgPSBuID4gMiA/IHBvbHltYXAgOiBiaW1hcDtcbiAgICBvdXRwdXQgPSBpbnB1dCA9IG51bGw7XG4gICAgcmV0dXJuIHNjYWxlO1xuICB9XG5cbiAgZnVuY3Rpb24gc2NhbGUoeCkge1xuICAgIHJldHVybiB4ID09IG51bGwgfHwgaXNOYU4oeCA9ICt4KSA/IHVua25vd24gOiAob3V0cHV0IHx8IChvdXRwdXQgPSBwaWVjZXdpc2UoZG9tYWluLm1hcCh0cmFuc2Zvcm0pLCByYW5nZSwgaW50ZXJwb2xhdGUpKSkodHJhbnNmb3JtKGNsYW1wKHgpKSk7XG4gIH1cblxuICBzY2FsZS5pbnZlcnQgPSBmdW5jdGlvbih5KSB7XG4gICAgcmV0dXJuIGNsYW1wKHVudHJhbnNmb3JtKChpbnB1dCB8fCAoaW5wdXQgPSBwaWVjZXdpc2UocmFuZ2UsIGRvbWFpbi5tYXAodHJhbnNmb3JtKSwgaW50ZXJwb2xhdGVOdW1iZXIpKSkoeSkpKTtcbiAgfTtcblxuICBzY2FsZS5kb21haW4gPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoZG9tYWluID0gQXJyYXkuZnJvbShfLCBudW1iZXIpLCByZXNjYWxlKCkpIDogZG9tYWluLnNsaWNlKCk7XG4gIH07XG5cbiAgc2NhbGUucmFuZ2UgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocmFuZ2UgPSBBcnJheS5mcm9tKF8pLCByZXNjYWxlKCkpIDogcmFuZ2Uuc2xpY2UoKTtcbiAgfTtcblxuICBzY2FsZS5yYW5nZVJvdW5kID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiByYW5nZSA9IEFycmF5LmZyb20oXyksIGludGVycG9sYXRlID0gaW50ZXJwb2xhdGVSb3VuZCwgcmVzY2FsZSgpO1xuICB9O1xuXG4gIHNjYWxlLmNsYW1wID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGNsYW1wID0gXyA/IHRydWUgOiBpZGVudGl0eSwgcmVzY2FsZSgpKSA6IGNsYW1wICE9PSBpZGVudGl0eTtcbiAgfTtcblxuICBzY2FsZS5pbnRlcnBvbGF0ZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChpbnRlcnBvbGF0ZSA9IF8sIHJlc2NhbGUoKSkgOiBpbnRlcnBvbGF0ZTtcbiAgfTtcblxuICBzY2FsZS51bmtub3duID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHVua25vd24gPSBfLCBzY2FsZSkgOiB1bmtub3duO1xuICB9O1xuXG4gIHJldHVybiBmdW5jdGlvbih0LCB1KSB7XG4gICAgdHJhbnNmb3JtID0gdCwgdW50cmFuc2Zvcm0gPSB1O1xuICAgIHJldHVybiByZXNjYWxlKCk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNvbnRpbnVvdXMoKSB7XG4gIHJldHVybiB0cmFuc2Zvcm1lcigpKGlkZW50aXR5LCBpZGVudGl0eSk7XG59XG4iLAogICAgImltcG9ydCB7dGlja1N0ZXB9IGZyb20gXCJkMy1hcnJheVwiO1xuaW1wb3J0IHtmb3JtYXQsIGZvcm1hdFByZWZpeCwgZm9ybWF0U3BlY2lmaWVyLCBwcmVjaXNpb25GaXhlZCwgcHJlY2lzaW9uUHJlZml4LCBwcmVjaXNpb25Sb3VuZH0gZnJvbSBcImQzLWZvcm1hdFwiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0aWNrRm9ybWF0KHN0YXJ0LCBzdG9wLCBjb3VudCwgc3BlY2lmaWVyKSB7XG4gIHZhciBzdGVwID0gdGlja1N0ZXAoc3RhcnQsIHN0b3AsIGNvdW50KSxcbiAgICAgIHByZWNpc2lvbjtcbiAgc3BlY2lmaWVyID0gZm9ybWF0U3BlY2lmaWVyKHNwZWNpZmllciA9PSBudWxsID8gXCIsZlwiIDogc3BlY2lmaWVyKTtcbiAgc3dpdGNoIChzcGVjaWZpZXIudHlwZSkge1xuICAgIGNhc2UgXCJzXCI6IHtcbiAgICAgIHZhciB2YWx1ZSA9IE1hdGgubWF4KE1hdGguYWJzKHN0YXJ0KSwgTWF0aC5hYnMoc3RvcCkpO1xuICAgICAgaWYgKHNwZWNpZmllci5wcmVjaXNpb24gPT0gbnVsbCAmJiAhaXNOYU4ocHJlY2lzaW9uID0gcHJlY2lzaW9uUHJlZml4KHN0ZXAsIHZhbHVlKSkpIHNwZWNpZmllci5wcmVjaXNpb24gPSBwcmVjaXNpb247XG4gICAgICByZXR1cm4gZm9ybWF0UHJlZml4KHNwZWNpZmllciwgdmFsdWUpO1xuICAgIH1cbiAgICBjYXNlIFwiXCI6XG4gICAgY2FzZSBcImVcIjpcbiAgICBjYXNlIFwiZ1wiOlxuICAgIGNhc2UgXCJwXCI6XG4gICAgY2FzZSBcInJcIjoge1xuICAgICAgaWYgKHNwZWNpZmllci5wcmVjaXNpb24gPT0gbnVsbCAmJiAhaXNOYU4ocHJlY2lzaW9uID0gcHJlY2lzaW9uUm91bmQoc3RlcCwgTWF0aC5tYXgoTWF0aC5hYnMoc3RhcnQpLCBNYXRoLmFicyhzdG9wKSkpKSkgc3BlY2lmaWVyLnByZWNpc2lvbiA9IHByZWNpc2lvbiAtIChzcGVjaWZpZXIudHlwZSA9PT0gXCJlXCIpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNhc2UgXCJmXCI6XG4gICAgY2FzZSBcIiVcIjoge1xuICAgICAgaWYgKHNwZWNpZmllci5wcmVjaXNpb24gPT0gbnVsbCAmJiAhaXNOYU4ocHJlY2lzaW9uID0gcHJlY2lzaW9uRml4ZWQoc3RlcCkpKSBzcGVjaWZpZXIucHJlY2lzaW9uID0gcHJlY2lzaW9uIC0gKHNwZWNpZmllci50eXBlID09PSBcIiVcIikgKiAyO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiBmb3JtYXQoc3BlY2lmaWVyKTtcbn1cbiIsCiAgICAiaW1wb3J0IHt0aWNrcywgdGlja0luY3JlbWVudH0gZnJvbSBcImQzLWFycmF5XCI7XG5pbXBvcnQgY29udGludW91cywge2NvcHl9IGZyb20gXCIuL2NvbnRpbnVvdXMuanNcIjtcbmltcG9ydCB7aW5pdFJhbmdlfSBmcm9tIFwiLi9pbml0LmpzXCI7XG5pbXBvcnQgdGlja0Zvcm1hdCBmcm9tIFwiLi90aWNrRm9ybWF0LmpzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBsaW5lYXJpc2goc2NhbGUpIHtcbiAgdmFyIGRvbWFpbiA9IHNjYWxlLmRvbWFpbjtcblxuICBzY2FsZS50aWNrcyA9IGZ1bmN0aW9uKGNvdW50KSB7XG4gICAgdmFyIGQgPSBkb21haW4oKTtcbiAgICByZXR1cm4gdGlja3MoZFswXSwgZFtkLmxlbmd0aCAtIDFdLCBjb3VudCA9PSBudWxsID8gMTAgOiBjb3VudCk7XG4gIH07XG5cbiAgc2NhbGUudGlja0Zvcm1hdCA9IGZ1bmN0aW9uKGNvdW50LCBzcGVjaWZpZXIpIHtcbiAgICB2YXIgZCA9IGRvbWFpbigpO1xuICAgIHJldHVybiB0aWNrRm9ybWF0KGRbMF0sIGRbZC5sZW5ndGggLSAxXSwgY291bnQgPT0gbnVsbCA/IDEwIDogY291bnQsIHNwZWNpZmllcik7XG4gIH07XG5cbiAgc2NhbGUubmljZSA9IGZ1bmN0aW9uKGNvdW50KSB7XG4gICAgaWYgKGNvdW50ID09IG51bGwpIGNvdW50ID0gMTA7XG5cbiAgICB2YXIgZCA9IGRvbWFpbigpO1xuICAgIHZhciBpMCA9IDA7XG4gICAgdmFyIGkxID0gZC5sZW5ndGggLSAxO1xuICAgIHZhciBzdGFydCA9IGRbaTBdO1xuICAgIHZhciBzdG9wID0gZFtpMV07XG4gICAgdmFyIHByZXN0ZXA7XG4gICAgdmFyIHN0ZXA7XG4gICAgdmFyIG1heEl0ZXIgPSAxMDtcblxuICAgIGlmIChzdG9wIDwgc3RhcnQpIHtcbiAgICAgIHN0ZXAgPSBzdGFydCwgc3RhcnQgPSBzdG9wLCBzdG9wID0gc3RlcDtcbiAgICAgIHN0ZXAgPSBpMCwgaTAgPSBpMSwgaTEgPSBzdGVwO1xuICAgIH1cbiAgICBcbiAgICB3aGlsZSAobWF4SXRlci0tID4gMCkge1xuICAgICAgc3RlcCA9IHRpY2tJbmNyZW1lbnQoc3RhcnQsIHN0b3AsIGNvdW50KTtcbiAgICAgIGlmIChzdGVwID09PSBwcmVzdGVwKSB7XG4gICAgICAgIGRbaTBdID0gc3RhcnRcbiAgICAgICAgZFtpMV0gPSBzdG9wXG4gICAgICAgIHJldHVybiBkb21haW4oZCk7XG4gICAgICB9IGVsc2UgaWYgKHN0ZXAgPiAwKSB7XG4gICAgICAgIHN0YXJ0ID0gTWF0aC5mbG9vcihzdGFydCAvIHN0ZXApICogc3RlcDtcbiAgICAgICAgc3RvcCA9IE1hdGguY2VpbChzdG9wIC8gc3RlcCkgKiBzdGVwO1xuICAgICAgfSBlbHNlIGlmIChzdGVwIDwgMCkge1xuICAgICAgICBzdGFydCA9IE1hdGguY2VpbChzdGFydCAqIHN0ZXApIC8gc3RlcDtcbiAgICAgICAgc3RvcCA9IE1hdGguZmxvb3Ioc3RvcCAqIHN0ZXApIC8gc3RlcDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgcHJlc3RlcCA9IHN0ZXA7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNjYWxlO1xuICB9O1xuXG4gIHJldHVybiBzY2FsZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbGluZWFyKCkge1xuICB2YXIgc2NhbGUgPSBjb250aW51b3VzKCk7XG5cbiAgc2NhbGUuY29weSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBjb3B5KHNjYWxlLCBsaW5lYXIoKSk7XG4gIH07XG5cbiAgaW5pdFJhbmdlLmFwcGx5KHNjYWxlLCBhcmd1bWVudHMpO1xuXG4gIHJldHVybiBsaW5lYXJpc2goc2NhbGUpO1xufVxuIiwKICAgICJjb25zdCB0MCA9IG5ldyBEYXRlLCB0MSA9IG5ldyBEYXRlO1xuXG5leHBvcnQgZnVuY3Rpb24gdGltZUludGVydmFsKGZsb29yaSwgb2Zmc2V0aSwgY291bnQsIGZpZWxkKSB7XG5cbiAgZnVuY3Rpb24gaW50ZXJ2YWwoZGF0ZSkge1xuICAgIHJldHVybiBmbG9vcmkoZGF0ZSA9IGFyZ3VtZW50cy5sZW5ndGggPT09IDAgPyBuZXcgRGF0ZSA6IG5ldyBEYXRlKCtkYXRlKSksIGRhdGU7XG4gIH1cblxuICBpbnRlcnZhbC5mbG9vciA9IChkYXRlKSA9PiB7XG4gICAgcmV0dXJuIGZsb29yaShkYXRlID0gbmV3IERhdGUoK2RhdGUpKSwgZGF0ZTtcbiAgfTtcblxuICBpbnRlcnZhbC5jZWlsID0gKGRhdGUpID0+IHtcbiAgICByZXR1cm4gZmxvb3JpKGRhdGUgPSBuZXcgRGF0ZShkYXRlIC0gMSkpLCBvZmZzZXRpKGRhdGUsIDEpLCBmbG9vcmkoZGF0ZSksIGRhdGU7XG4gIH07XG5cbiAgaW50ZXJ2YWwucm91bmQgPSAoZGF0ZSkgPT4ge1xuICAgIGNvbnN0IGQwID0gaW50ZXJ2YWwoZGF0ZSksIGQxID0gaW50ZXJ2YWwuY2VpbChkYXRlKTtcbiAgICByZXR1cm4gZGF0ZSAtIGQwIDwgZDEgLSBkYXRlID8gZDAgOiBkMTtcbiAgfTtcblxuICBpbnRlcnZhbC5vZmZzZXQgPSAoZGF0ZSwgc3RlcCkgPT4ge1xuICAgIHJldHVybiBvZmZzZXRpKGRhdGUgPSBuZXcgRGF0ZSgrZGF0ZSksIHN0ZXAgPT0gbnVsbCA/IDEgOiBNYXRoLmZsb29yKHN0ZXApKSwgZGF0ZTtcbiAgfTtcblxuICBpbnRlcnZhbC5yYW5nZSA9IChzdGFydCwgc3RvcCwgc3RlcCkgPT4ge1xuICAgIGNvbnN0IHJhbmdlID0gW107XG4gICAgc3RhcnQgPSBpbnRlcnZhbC5jZWlsKHN0YXJ0KTtcbiAgICBzdGVwID0gc3RlcCA9PSBudWxsID8gMSA6IE1hdGguZmxvb3Ioc3RlcCk7XG4gICAgaWYgKCEoc3RhcnQgPCBzdG9wKSB8fCAhKHN0ZXAgPiAwKSkgcmV0dXJuIHJhbmdlOyAvLyBhbHNvIGhhbmRsZXMgSW52YWxpZCBEYXRlXG4gICAgbGV0IHByZXZpb3VzO1xuICAgIGRvIHJhbmdlLnB1c2gocHJldmlvdXMgPSBuZXcgRGF0ZSgrc3RhcnQpKSwgb2Zmc2V0aShzdGFydCwgc3RlcCksIGZsb29yaShzdGFydCk7XG4gICAgd2hpbGUgKHByZXZpb3VzIDwgc3RhcnQgJiYgc3RhcnQgPCBzdG9wKTtcbiAgICByZXR1cm4gcmFuZ2U7XG4gIH07XG5cbiAgaW50ZXJ2YWwuZmlsdGVyID0gKHRlc3QpID0+IHtcbiAgICByZXR1cm4gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gICAgICBpZiAoZGF0ZSA+PSBkYXRlKSB3aGlsZSAoZmxvb3JpKGRhdGUpLCAhdGVzdChkYXRlKSkgZGF0ZS5zZXRUaW1lKGRhdGUgLSAxKTtcbiAgICB9LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICAgICAgaWYgKGRhdGUgPj0gZGF0ZSkge1xuICAgICAgICBpZiAoc3RlcCA8IDApIHdoaWxlICgrK3N0ZXAgPD0gMCkge1xuICAgICAgICAgIHdoaWxlIChvZmZzZXRpKGRhdGUsIC0xKSwgIXRlc3QoZGF0ZSkpIHt9IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tZW1wdHlcbiAgICAgICAgfSBlbHNlIHdoaWxlICgtLXN0ZXAgPj0gMCkge1xuICAgICAgICAgIHdoaWxlIChvZmZzZXRpKGRhdGUsICsxKSwgIXRlc3QoZGF0ZSkpIHt9IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tZW1wdHlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIGlmIChjb3VudCkge1xuICAgIGludGVydmFsLmNvdW50ID0gKHN0YXJ0LCBlbmQpID0+IHtcbiAgICAgIHQwLnNldFRpbWUoK3N0YXJ0KSwgdDEuc2V0VGltZSgrZW5kKTtcbiAgICAgIGZsb29yaSh0MCksIGZsb29yaSh0MSk7XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcihjb3VudCh0MCwgdDEpKTtcbiAgICB9O1xuXG4gICAgaW50ZXJ2YWwuZXZlcnkgPSAoc3RlcCkgPT4ge1xuICAgICAgc3RlcCA9IE1hdGguZmxvb3Ioc3RlcCk7XG4gICAgICByZXR1cm4gIWlzRmluaXRlKHN0ZXApIHx8ICEoc3RlcCA+IDApID8gbnVsbFxuICAgICAgICAgIDogIShzdGVwID4gMSkgPyBpbnRlcnZhbFxuICAgICAgICAgIDogaW50ZXJ2YWwuZmlsdGVyKGZpZWxkXG4gICAgICAgICAgICAgID8gKGQpID0+IGZpZWxkKGQpICUgc3RlcCA9PT0gMFxuICAgICAgICAgICAgICA6IChkKSA9PiBpbnRlcnZhbC5jb3VudCgwLCBkKSAlIHN0ZXAgPT09IDApO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gaW50ZXJ2YWw7XG59XG4iLAogICAgImltcG9ydCB7dGltZUludGVydmFsfSBmcm9tIFwiLi9pbnRlcnZhbC5qc1wiO1xuXG5leHBvcnQgY29uc3QgbWlsbGlzZWNvbmQgPSB0aW1lSW50ZXJ2YWwoKCkgPT4ge1xuICAvLyBub29wXG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldFRpbWUoK2RhdGUgKyBzdGVwKTtcbn0sIChzdGFydCwgZW5kKSA9PiB7XG4gIHJldHVybiBlbmQgLSBzdGFydDtcbn0pO1xuXG4vLyBBbiBvcHRpbWl6ZWQgaW1wbGVtZW50YXRpb24gZm9yIHRoaXMgc2ltcGxlIGNhc2UuXG5taWxsaXNlY29uZC5ldmVyeSA9IChrKSA9PiB7XG4gIGsgPSBNYXRoLmZsb29yKGspO1xuICBpZiAoIWlzRmluaXRlKGspIHx8ICEoayA+IDApKSByZXR1cm4gbnVsbDtcbiAgaWYgKCEoayA+IDEpKSByZXR1cm4gbWlsbGlzZWNvbmQ7XG4gIHJldHVybiB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgICBkYXRlLnNldFRpbWUoTWF0aC5mbG9vcihkYXRlIC8gaykgKiBrKTtcbiAgfSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgICBkYXRlLnNldFRpbWUoK2RhdGUgKyBzdGVwICogayk7XG4gIH0sIChzdGFydCwgZW5kKSA9PiB7XG4gICAgcmV0dXJuIChlbmQgLSBzdGFydCkgLyBrO1xuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBtaWxsaXNlY29uZHMgPSBtaWxsaXNlY29uZC5yYW5nZTtcbiIsCiAgICAiZXhwb3J0IGNvbnN0IGR1cmF0aW9uU2Vjb25kID0gMTAwMDtcbmV4cG9ydCBjb25zdCBkdXJhdGlvbk1pbnV0ZSA9IGR1cmF0aW9uU2Vjb25kICogNjA7XG5leHBvcnQgY29uc3QgZHVyYXRpb25Ib3VyID0gZHVyYXRpb25NaW51dGUgKiA2MDtcbmV4cG9ydCBjb25zdCBkdXJhdGlvbkRheSA9IGR1cmF0aW9uSG91ciAqIDI0O1xuZXhwb3J0IGNvbnN0IGR1cmF0aW9uV2VlayA9IGR1cmF0aW9uRGF5ICogNztcbmV4cG9ydCBjb25zdCBkdXJhdGlvbk1vbnRoID0gZHVyYXRpb25EYXkgKiAzMDtcbmV4cG9ydCBjb25zdCBkdXJhdGlvblllYXIgPSBkdXJhdGlvbkRheSAqIDM2NTtcbiIsCiAgICAiaW1wb3J0IHt0aW1lSW50ZXJ2YWx9IGZyb20gXCIuL2ludGVydmFsLmpzXCI7XG5pbXBvcnQge2R1cmF0aW9uU2Vjb25kfSBmcm9tIFwiLi9kdXJhdGlvbi5qc1wiO1xuXG5leHBvcnQgY29uc3Qgc2Vjb25kID0gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gIGRhdGUuc2V0VGltZShkYXRlIC0gZGF0ZS5nZXRNaWxsaXNlY29uZHMoKSk7XG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldFRpbWUoK2RhdGUgKyBzdGVwICogZHVyYXRpb25TZWNvbmQpO1xufSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgcmV0dXJuIChlbmQgLSBzdGFydCkgLyBkdXJhdGlvblNlY29uZDtcbn0sIChkYXRlKSA9PiB7XG4gIHJldHVybiBkYXRlLmdldFVUQ1NlY29uZHMoKTtcbn0pO1xuXG5leHBvcnQgY29uc3Qgc2Vjb25kcyA9IHNlY29uZC5yYW5nZTtcbiIsCiAgICAiaW1wb3J0IHt0aW1lSW50ZXJ2YWx9IGZyb20gXCIuL2ludGVydmFsLmpzXCI7XG5pbXBvcnQge2R1cmF0aW9uTWludXRlLCBkdXJhdGlvblNlY29uZH0gZnJvbSBcIi4vZHVyYXRpb24uanNcIjtcblxuZXhwb3J0IGNvbnN0IHRpbWVNaW51dGUgPSB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgZGF0ZS5zZXRUaW1lKGRhdGUgLSBkYXRlLmdldE1pbGxpc2Vjb25kcygpIC0gZGF0ZS5nZXRTZWNvbmRzKCkgKiBkdXJhdGlvblNlY29uZCk7XG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldFRpbWUoK2RhdGUgKyBzdGVwICogZHVyYXRpb25NaW51dGUpO1xufSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgcmV0dXJuIChlbmQgLSBzdGFydCkgLyBkdXJhdGlvbk1pbnV0ZTtcbn0sIChkYXRlKSA9PiB7XG4gIHJldHVybiBkYXRlLmdldE1pbnV0ZXMoKTtcbn0pO1xuXG5leHBvcnQgY29uc3QgdGltZU1pbnV0ZXMgPSB0aW1lTWludXRlLnJhbmdlO1xuXG5leHBvcnQgY29uc3QgdXRjTWludXRlID0gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gIGRhdGUuc2V0VVRDU2Vjb25kcygwLCAwKTtcbn0sIChkYXRlLCBzdGVwKSA9PiB7XG4gIGRhdGUuc2V0VGltZSgrZGF0ZSArIHN0ZXAgKiBkdXJhdGlvbk1pbnV0ZSk7XG59LCAoc3RhcnQsIGVuZCkgPT4ge1xuICByZXR1cm4gKGVuZCAtIHN0YXJ0KSAvIGR1cmF0aW9uTWludXRlO1xufSwgKGRhdGUpID0+IHtcbiAgcmV0dXJuIGRhdGUuZ2V0VVRDTWludXRlcygpO1xufSk7XG5cbmV4cG9ydCBjb25zdCB1dGNNaW51dGVzID0gdXRjTWludXRlLnJhbmdlO1xuIiwKICAgICJpbXBvcnQge3RpbWVJbnRlcnZhbH0gZnJvbSBcIi4vaW50ZXJ2YWwuanNcIjtcbmltcG9ydCB7ZHVyYXRpb25Ib3VyLCBkdXJhdGlvbk1pbnV0ZSwgZHVyYXRpb25TZWNvbmR9IGZyb20gXCIuL2R1cmF0aW9uLmpzXCI7XG5cbmV4cG9ydCBjb25zdCB0aW1lSG91ciA9IHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICBkYXRlLnNldFRpbWUoZGF0ZSAtIGRhdGUuZ2V0TWlsbGlzZWNvbmRzKCkgLSBkYXRlLmdldFNlY29uZHMoKSAqIGR1cmF0aW9uU2Vjb25kIC0gZGF0ZS5nZXRNaW51dGVzKCkgKiBkdXJhdGlvbk1pbnV0ZSk7XG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldFRpbWUoK2RhdGUgKyBzdGVwICogZHVyYXRpb25Ib3VyKTtcbn0sIChzdGFydCwgZW5kKSA9PiB7XG4gIHJldHVybiAoZW5kIC0gc3RhcnQpIC8gZHVyYXRpb25Ib3VyO1xufSwgKGRhdGUpID0+IHtcbiAgcmV0dXJuIGRhdGUuZ2V0SG91cnMoKTtcbn0pO1xuXG5leHBvcnQgY29uc3QgdGltZUhvdXJzID0gdGltZUhvdXIucmFuZ2U7XG5cbmV4cG9ydCBjb25zdCB1dGNIb3VyID0gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gIGRhdGUuc2V0VVRDTWludXRlcygwLCAwLCAwKTtcbn0sIChkYXRlLCBzdGVwKSA9PiB7XG4gIGRhdGUuc2V0VGltZSgrZGF0ZSArIHN0ZXAgKiBkdXJhdGlvbkhvdXIpO1xufSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgcmV0dXJuIChlbmQgLSBzdGFydCkgLyBkdXJhdGlvbkhvdXI7XG59LCAoZGF0ZSkgPT4ge1xuICByZXR1cm4gZGF0ZS5nZXRVVENIb3VycygpO1xufSk7XG5cbmV4cG9ydCBjb25zdCB1dGNIb3VycyA9IHV0Y0hvdXIucmFuZ2U7XG4iLAogICAgImltcG9ydCB7dGltZUludGVydmFsfSBmcm9tIFwiLi9pbnRlcnZhbC5qc1wiO1xuaW1wb3J0IHtkdXJhdGlvbkRheSwgZHVyYXRpb25NaW51dGV9IGZyb20gXCIuL2R1cmF0aW9uLmpzXCI7XG5cbmV4cG9ydCBjb25zdCB0aW1lRGF5ID0gdGltZUludGVydmFsKFxuICBkYXRlID0+IGRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMCksXG4gIChkYXRlLCBzdGVwKSA9PiBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgKyBzdGVwKSxcbiAgKHN0YXJ0LCBlbmQpID0+IChlbmQgLSBzdGFydCAtIChlbmQuZ2V0VGltZXpvbmVPZmZzZXQoKSAtIHN0YXJ0LmdldFRpbWV6b25lT2Zmc2V0KCkpICogZHVyYXRpb25NaW51dGUpIC8gZHVyYXRpb25EYXksXG4gIGRhdGUgPT4gZGF0ZS5nZXREYXRlKCkgLSAxXG4pO1xuXG5leHBvcnQgY29uc3QgdGltZURheXMgPSB0aW1lRGF5LnJhbmdlO1xuXG5leHBvcnQgY29uc3QgdXRjRGF5ID0gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gIGRhdGUuc2V0VVRDSG91cnMoMCwgMCwgMCwgMCk7XG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldFVUQ0RhdGUoZGF0ZS5nZXRVVENEYXRlKCkgKyBzdGVwKTtcbn0sIChzdGFydCwgZW5kKSA9PiB7XG4gIHJldHVybiAoZW5kIC0gc3RhcnQpIC8gZHVyYXRpb25EYXk7XG59LCAoZGF0ZSkgPT4ge1xuICByZXR1cm4gZGF0ZS5nZXRVVENEYXRlKCkgLSAxO1xufSk7XG5cbmV4cG9ydCBjb25zdCB1dGNEYXlzID0gdXRjRGF5LnJhbmdlO1xuXG5leHBvcnQgY29uc3QgdW5peERheSA9IHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICBkYXRlLnNldFVUQ0hvdXJzKDAsIDAsIDAsIDApO1xufSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgZGF0ZS5zZXRVVENEYXRlKGRhdGUuZ2V0VVRDRGF0ZSgpICsgc3RlcCk7XG59LCAoc3RhcnQsIGVuZCkgPT4ge1xuICByZXR1cm4gKGVuZCAtIHN0YXJ0KSAvIGR1cmF0aW9uRGF5O1xufSwgKGRhdGUpID0+IHtcbiAgcmV0dXJuIE1hdGguZmxvb3IoZGF0ZSAvIGR1cmF0aW9uRGF5KTtcbn0pO1xuXG5leHBvcnQgY29uc3QgdW5peERheXMgPSB1bml4RGF5LnJhbmdlO1xuIiwKICAgICJpbXBvcnQge3RpbWVJbnRlcnZhbH0gZnJvbSBcIi4vaW50ZXJ2YWwuanNcIjtcbmltcG9ydCB7ZHVyYXRpb25NaW51dGUsIGR1cmF0aW9uV2Vla30gZnJvbSBcIi4vZHVyYXRpb24uanNcIjtcblxuZnVuY3Rpb24gdGltZVdlZWtkYXkoaSkge1xuICByZXR1cm4gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gICAgZGF0ZS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpIC0gKGRhdGUuZ2V0RGF5KCkgKyA3IC0gaSkgJSA3KTtcbiAgICBkYXRlLnNldEhvdXJzKDAsIDAsIDAsIDApO1xuICB9LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICAgIGRhdGUuc2V0RGF0ZShkYXRlLmdldERhdGUoKSArIHN0ZXAgKiA3KTtcbiAgfSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgICByZXR1cm4gKGVuZCAtIHN0YXJ0IC0gKGVuZC5nZXRUaW1lem9uZU9mZnNldCgpIC0gc3RhcnQuZ2V0VGltZXpvbmVPZmZzZXQoKSkgKiBkdXJhdGlvbk1pbnV0ZSkgLyBkdXJhdGlvbldlZWs7XG4gIH0pO1xufVxuXG5leHBvcnQgY29uc3QgdGltZVN1bmRheSA9IHRpbWVXZWVrZGF5KDApO1xuZXhwb3J0IGNvbnN0IHRpbWVNb25kYXkgPSB0aW1lV2Vla2RheSgxKTtcbmV4cG9ydCBjb25zdCB0aW1lVHVlc2RheSA9IHRpbWVXZWVrZGF5KDIpO1xuZXhwb3J0IGNvbnN0IHRpbWVXZWRuZXNkYXkgPSB0aW1lV2Vla2RheSgzKTtcbmV4cG9ydCBjb25zdCB0aW1lVGh1cnNkYXkgPSB0aW1lV2Vla2RheSg0KTtcbmV4cG9ydCBjb25zdCB0aW1lRnJpZGF5ID0gdGltZVdlZWtkYXkoNSk7XG5leHBvcnQgY29uc3QgdGltZVNhdHVyZGF5ID0gdGltZVdlZWtkYXkoNik7XG5cbmV4cG9ydCBjb25zdCB0aW1lU3VuZGF5cyA9IHRpbWVTdW5kYXkucmFuZ2U7XG5leHBvcnQgY29uc3QgdGltZU1vbmRheXMgPSB0aW1lTW9uZGF5LnJhbmdlO1xuZXhwb3J0IGNvbnN0IHRpbWVUdWVzZGF5cyA9IHRpbWVUdWVzZGF5LnJhbmdlO1xuZXhwb3J0IGNvbnN0IHRpbWVXZWRuZXNkYXlzID0gdGltZVdlZG5lc2RheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB0aW1lVGh1cnNkYXlzID0gdGltZVRodXJzZGF5LnJhbmdlO1xuZXhwb3J0IGNvbnN0IHRpbWVGcmlkYXlzID0gdGltZUZyaWRheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB0aW1lU2F0dXJkYXlzID0gdGltZVNhdHVyZGF5LnJhbmdlO1xuXG5mdW5jdGlvbiB1dGNXZWVrZGF5KGkpIHtcbiAgcmV0dXJuIHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICAgIGRhdGUuc2V0VVRDRGF0ZShkYXRlLmdldFVUQ0RhdGUoKSAtIChkYXRlLmdldFVUQ0RheSgpICsgNyAtIGkpICUgNyk7XG4gICAgZGF0ZS5zZXRVVENIb3VycygwLCAwLCAwLCAwKTtcbiAgfSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgICBkYXRlLnNldFVUQ0RhdGUoZGF0ZS5nZXRVVENEYXRlKCkgKyBzdGVwICogNyk7XG4gIH0sIChzdGFydCwgZW5kKSA9PiB7XG4gICAgcmV0dXJuIChlbmQgLSBzdGFydCkgLyBkdXJhdGlvbldlZWs7XG4gIH0pO1xufVxuXG5leHBvcnQgY29uc3QgdXRjU3VuZGF5ID0gdXRjV2Vla2RheSgwKTtcbmV4cG9ydCBjb25zdCB1dGNNb25kYXkgPSB1dGNXZWVrZGF5KDEpO1xuZXhwb3J0IGNvbnN0IHV0Y1R1ZXNkYXkgPSB1dGNXZWVrZGF5KDIpO1xuZXhwb3J0IGNvbnN0IHV0Y1dlZG5lc2RheSA9IHV0Y1dlZWtkYXkoMyk7XG5leHBvcnQgY29uc3QgdXRjVGh1cnNkYXkgPSB1dGNXZWVrZGF5KDQpO1xuZXhwb3J0IGNvbnN0IHV0Y0ZyaWRheSA9IHV0Y1dlZWtkYXkoNSk7XG5leHBvcnQgY29uc3QgdXRjU2F0dXJkYXkgPSB1dGNXZWVrZGF5KDYpO1xuXG5leHBvcnQgY29uc3QgdXRjU3VuZGF5cyA9IHV0Y1N1bmRheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB1dGNNb25kYXlzID0gdXRjTW9uZGF5LnJhbmdlO1xuZXhwb3J0IGNvbnN0IHV0Y1R1ZXNkYXlzID0gdXRjVHVlc2RheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB1dGNXZWRuZXNkYXlzID0gdXRjV2VkbmVzZGF5LnJhbmdlO1xuZXhwb3J0IGNvbnN0IHV0Y1RodXJzZGF5cyA9IHV0Y1RodXJzZGF5LnJhbmdlO1xuZXhwb3J0IGNvbnN0IHV0Y0ZyaWRheXMgPSB1dGNGcmlkYXkucmFuZ2U7XG5leHBvcnQgY29uc3QgdXRjU2F0dXJkYXlzID0gdXRjU2F0dXJkYXkucmFuZ2U7XG4iLAogICAgImltcG9ydCB7dGltZUludGVydmFsfSBmcm9tIFwiLi9pbnRlcnZhbC5qc1wiO1xuXG5leHBvcnQgY29uc3QgdGltZU1vbnRoID0gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gIGRhdGUuc2V0RGF0ZSgxKTtcbiAgZGF0ZS5zZXRIb3VycygwLCAwLCAwLCAwKTtcbn0sIChkYXRlLCBzdGVwKSA9PiB7XG4gIGRhdGUuc2V0TW9udGgoZGF0ZS5nZXRNb250aCgpICsgc3RlcCk7XG59LCAoc3RhcnQsIGVuZCkgPT4ge1xuICByZXR1cm4gZW5kLmdldE1vbnRoKCkgLSBzdGFydC5nZXRNb250aCgpICsgKGVuZC5nZXRGdWxsWWVhcigpIC0gc3RhcnQuZ2V0RnVsbFllYXIoKSkgKiAxMjtcbn0sIChkYXRlKSA9PiB7XG4gIHJldHVybiBkYXRlLmdldE1vbnRoKCk7XG59KTtcblxuZXhwb3J0IGNvbnN0IHRpbWVNb250aHMgPSB0aW1lTW9udGgucmFuZ2U7XG5cbmV4cG9ydCBjb25zdCB1dGNNb250aCA9IHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICBkYXRlLnNldFVUQ0RhdGUoMSk7XG4gIGRhdGUuc2V0VVRDSG91cnMoMCwgMCwgMCwgMCk7XG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldFVUQ01vbnRoKGRhdGUuZ2V0VVRDTW9udGgoKSArIHN0ZXApO1xufSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgcmV0dXJuIGVuZC5nZXRVVENNb250aCgpIC0gc3RhcnQuZ2V0VVRDTW9udGgoKSArIChlbmQuZ2V0VVRDRnVsbFllYXIoKSAtIHN0YXJ0LmdldFVUQ0Z1bGxZZWFyKCkpICogMTI7XG59LCAoZGF0ZSkgPT4ge1xuICByZXR1cm4gZGF0ZS5nZXRVVENNb250aCgpO1xufSk7XG5cbmV4cG9ydCBjb25zdCB1dGNNb250aHMgPSB1dGNNb250aC5yYW5nZTtcbiIsCiAgICAiaW1wb3J0IHt0aW1lSW50ZXJ2YWx9IGZyb20gXCIuL2ludGVydmFsLmpzXCI7XG5cbmV4cG9ydCBjb25zdCB0aW1lWWVhciA9IHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICBkYXRlLnNldE1vbnRoKDAsIDEpO1xuICBkYXRlLnNldEhvdXJzKDAsIDAsIDAsIDApO1xufSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgZGF0ZS5zZXRGdWxsWWVhcihkYXRlLmdldEZ1bGxZZWFyKCkgKyBzdGVwKTtcbn0sIChzdGFydCwgZW5kKSA9PiB7XG4gIHJldHVybiBlbmQuZ2V0RnVsbFllYXIoKSAtIHN0YXJ0LmdldEZ1bGxZZWFyKCk7XG59LCAoZGF0ZSkgPT4ge1xuICByZXR1cm4gZGF0ZS5nZXRGdWxsWWVhcigpO1xufSk7XG5cbi8vIEFuIG9wdGltaXplZCBpbXBsZW1lbnRhdGlvbiBmb3IgdGhpcyBzaW1wbGUgY2FzZS5cbnRpbWVZZWFyLmV2ZXJ5ID0gKGspID0+IHtcbiAgcmV0dXJuICFpc0Zpbml0ZShrID0gTWF0aC5mbG9vcihrKSkgfHwgIShrID4gMCkgPyBudWxsIDogdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gICAgZGF0ZS5zZXRGdWxsWWVhcihNYXRoLmZsb29yKGRhdGUuZ2V0RnVsbFllYXIoKSAvIGspICogayk7XG4gICAgZGF0ZS5zZXRNb250aCgwLCAxKTtcbiAgICBkYXRlLnNldEhvdXJzKDAsIDAsIDAsIDApO1xuICB9LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICAgIGRhdGUuc2V0RnVsbFllYXIoZGF0ZS5nZXRGdWxsWWVhcigpICsgc3RlcCAqIGspO1xuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCB0aW1lWWVhcnMgPSB0aW1lWWVhci5yYW5nZTtcblxuZXhwb3J0IGNvbnN0IHV0Y1llYXIgPSB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgZGF0ZS5zZXRVVENNb250aCgwLCAxKTtcbiAgZGF0ZS5zZXRVVENIb3VycygwLCAwLCAwLCAwKTtcbn0sIChkYXRlLCBzdGVwKSA9PiB7XG4gIGRhdGUuc2V0VVRDRnVsbFllYXIoZGF0ZS5nZXRVVENGdWxsWWVhcigpICsgc3RlcCk7XG59LCAoc3RhcnQsIGVuZCkgPT4ge1xuICByZXR1cm4gZW5kLmdldFVUQ0Z1bGxZZWFyKCkgLSBzdGFydC5nZXRVVENGdWxsWWVhcigpO1xufSwgKGRhdGUpID0+IHtcbiAgcmV0dXJuIGRhdGUuZ2V0VVRDRnVsbFllYXIoKTtcbn0pO1xuXG4vLyBBbiBvcHRpbWl6ZWQgaW1wbGVtZW50YXRpb24gZm9yIHRoaXMgc2ltcGxlIGNhc2UuXG51dGNZZWFyLmV2ZXJ5ID0gKGspID0+IHtcbiAgcmV0dXJuICFpc0Zpbml0ZShrID0gTWF0aC5mbG9vcihrKSkgfHwgIShrID4gMCkgPyBudWxsIDogdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gICAgZGF0ZS5zZXRVVENGdWxsWWVhcihNYXRoLmZsb29yKGRhdGUuZ2V0VVRDRnVsbFllYXIoKSAvIGspICogayk7XG4gICAgZGF0ZS5zZXRVVENNb250aCgwLCAxKTtcbiAgICBkYXRlLnNldFVUQ0hvdXJzKDAsIDAsIDAsIDApO1xuICB9LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICAgIGRhdGUuc2V0VVRDRnVsbFllYXIoZGF0ZS5nZXRVVENGdWxsWWVhcigpICsgc3RlcCAqIGspO1xuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCB1dGNZZWFycyA9IHV0Y1llYXIucmFuZ2U7XG4iLAogICAgImltcG9ydCB7YmlzZWN0b3IsIHRpY2tTdGVwfSBmcm9tIFwiZDMtYXJyYXlcIjtcbmltcG9ydCB7ZHVyYXRpb25EYXksIGR1cmF0aW9uSG91ciwgZHVyYXRpb25NaW51dGUsIGR1cmF0aW9uTW9udGgsIGR1cmF0aW9uU2Vjb25kLCBkdXJhdGlvbldlZWssIGR1cmF0aW9uWWVhcn0gZnJvbSBcIi4vZHVyYXRpb24uanNcIjtcbmltcG9ydCB7bWlsbGlzZWNvbmR9IGZyb20gXCIuL21pbGxpc2Vjb25kLmpzXCI7XG5pbXBvcnQge3NlY29uZH0gZnJvbSBcIi4vc2Vjb25kLmpzXCI7XG5pbXBvcnQge3RpbWVNaW51dGUsIHV0Y01pbnV0ZX0gZnJvbSBcIi4vbWludXRlLmpzXCI7XG5pbXBvcnQge3RpbWVIb3VyLCB1dGNIb3VyfSBmcm9tIFwiLi9ob3VyLmpzXCI7XG5pbXBvcnQge3RpbWVEYXksIHVuaXhEYXl9IGZyb20gXCIuL2RheS5qc1wiO1xuaW1wb3J0IHt0aW1lU3VuZGF5LCB1dGNTdW5kYXl9IGZyb20gXCIuL3dlZWsuanNcIjtcbmltcG9ydCB7dGltZU1vbnRoLCB1dGNNb250aH0gZnJvbSBcIi4vbW9udGguanNcIjtcbmltcG9ydCB7dGltZVllYXIsIHV0Y1llYXJ9IGZyb20gXCIuL3llYXIuanNcIjtcblxuZnVuY3Rpb24gdGlja2VyKHllYXIsIG1vbnRoLCB3ZWVrLCBkYXksIGhvdXIsIG1pbnV0ZSkge1xuXG4gIGNvbnN0IHRpY2tJbnRlcnZhbHMgPSBbXG4gICAgW3NlY29uZCwgIDEsICAgICAgZHVyYXRpb25TZWNvbmRdLFxuICAgIFtzZWNvbmQsICA1LCAgNSAqIGR1cmF0aW9uU2Vjb25kXSxcbiAgICBbc2Vjb25kLCAxNSwgMTUgKiBkdXJhdGlvblNlY29uZF0sXG4gICAgW3NlY29uZCwgMzAsIDMwICogZHVyYXRpb25TZWNvbmRdLFxuICAgIFttaW51dGUsICAxLCAgICAgIGR1cmF0aW9uTWludXRlXSxcbiAgICBbbWludXRlLCAgNSwgIDUgKiBkdXJhdGlvbk1pbnV0ZV0sXG4gICAgW21pbnV0ZSwgMTUsIDE1ICogZHVyYXRpb25NaW51dGVdLFxuICAgIFttaW51dGUsIDMwLCAzMCAqIGR1cmF0aW9uTWludXRlXSxcbiAgICBbICBob3VyLCAgMSwgICAgICBkdXJhdGlvbkhvdXIgIF0sXG4gICAgWyAgaG91ciwgIDMsICAzICogZHVyYXRpb25Ib3VyICBdLFxuICAgIFsgIGhvdXIsICA2LCAgNiAqIGR1cmF0aW9uSG91ciAgXSxcbiAgICBbICBob3VyLCAxMiwgMTIgKiBkdXJhdGlvbkhvdXIgIF0sXG4gICAgWyAgIGRheSwgIDEsICAgICAgZHVyYXRpb25EYXkgICBdLFxuICAgIFsgICBkYXksICAyLCAgMiAqIGR1cmF0aW9uRGF5ICAgXSxcbiAgICBbICB3ZWVrLCAgMSwgICAgICBkdXJhdGlvbldlZWsgIF0sXG4gICAgWyBtb250aCwgIDEsICAgICAgZHVyYXRpb25Nb250aCBdLFxuICAgIFsgbW9udGgsICAzLCAgMyAqIGR1cmF0aW9uTW9udGggXSxcbiAgICBbICB5ZWFyLCAgMSwgICAgICBkdXJhdGlvblllYXIgIF1cbiAgXTtcblxuICBmdW5jdGlvbiB0aWNrcyhzdGFydCwgc3RvcCwgY291bnQpIHtcbiAgICBjb25zdCByZXZlcnNlID0gc3RvcCA8IHN0YXJ0O1xuICAgIGlmIChyZXZlcnNlKSBbc3RhcnQsIHN0b3BdID0gW3N0b3AsIHN0YXJ0XTtcbiAgICBjb25zdCBpbnRlcnZhbCA9IGNvdW50ICYmIHR5cGVvZiBjb3VudC5yYW5nZSA9PT0gXCJmdW5jdGlvblwiID8gY291bnQgOiB0aWNrSW50ZXJ2YWwoc3RhcnQsIHN0b3AsIGNvdW50KTtcbiAgICBjb25zdCB0aWNrcyA9IGludGVydmFsID8gaW50ZXJ2YWwucmFuZ2Uoc3RhcnQsICtzdG9wICsgMSkgOiBbXTsgLy8gaW5jbHVzaXZlIHN0b3BcbiAgICByZXR1cm4gcmV2ZXJzZSA/IHRpY2tzLnJldmVyc2UoKSA6IHRpY2tzO1xuICB9XG5cbiAgZnVuY3Rpb24gdGlja0ludGVydmFsKHN0YXJ0LCBzdG9wLCBjb3VudCkge1xuICAgIGNvbnN0IHRhcmdldCA9IE1hdGguYWJzKHN0b3AgLSBzdGFydCkgLyBjb3VudDtcbiAgICBjb25zdCBpID0gYmlzZWN0b3IoKFssLCBzdGVwXSkgPT4gc3RlcCkucmlnaHQodGlja0ludGVydmFscywgdGFyZ2V0KTtcbiAgICBpZiAoaSA9PT0gdGlja0ludGVydmFscy5sZW5ndGgpIHJldHVybiB5ZWFyLmV2ZXJ5KHRpY2tTdGVwKHN0YXJ0IC8gZHVyYXRpb25ZZWFyLCBzdG9wIC8gZHVyYXRpb25ZZWFyLCBjb3VudCkpO1xuICAgIGlmIChpID09PSAwKSByZXR1cm4gbWlsbGlzZWNvbmQuZXZlcnkoTWF0aC5tYXgodGlja1N0ZXAoc3RhcnQsIHN0b3AsIGNvdW50KSwgMSkpO1xuICAgIGNvbnN0IFt0LCBzdGVwXSA9IHRpY2tJbnRlcnZhbHNbdGFyZ2V0IC8gdGlja0ludGVydmFsc1tpIC0gMV1bMl0gPCB0aWNrSW50ZXJ2YWxzW2ldWzJdIC8gdGFyZ2V0ID8gaSAtIDEgOiBpXTtcbiAgICByZXR1cm4gdC5ldmVyeShzdGVwKTtcbiAgfVxuXG4gIHJldHVybiBbdGlja3MsIHRpY2tJbnRlcnZhbF07XG59XG5cbmNvbnN0IFt1dGNUaWNrcywgdXRjVGlja0ludGVydmFsXSA9IHRpY2tlcih1dGNZZWFyLCB1dGNNb250aCwgdXRjU3VuZGF5LCB1bml4RGF5LCB1dGNIb3VyLCB1dGNNaW51dGUpO1xuY29uc3QgW3RpbWVUaWNrcywgdGltZVRpY2tJbnRlcnZhbF0gPSB0aWNrZXIodGltZVllYXIsIHRpbWVNb250aCwgdGltZVN1bmRheSwgdGltZURheSwgdGltZUhvdXIsIHRpbWVNaW51dGUpO1xuXG5leHBvcnQge3V0Y1RpY2tzLCB1dGNUaWNrSW50ZXJ2YWwsIHRpbWVUaWNrcywgdGltZVRpY2tJbnRlcnZhbH07XG4iLAogICAgImltcG9ydCB7XG4gIHRpbWVEYXksXG4gIHRpbWVTdW5kYXksXG4gIHRpbWVNb25kYXksXG4gIHRpbWVUaHVyc2RheSxcbiAgdGltZVllYXIsXG4gIHV0Y0RheSxcbiAgdXRjU3VuZGF5LFxuICB1dGNNb25kYXksXG4gIHV0Y1RodXJzZGF5LFxuICB1dGNZZWFyXG59IGZyb20gXCJkMy10aW1lXCI7XG5cbmZ1bmN0aW9uIGxvY2FsRGF0ZShkKSB7XG4gIGlmICgwIDw9IGQueSAmJiBkLnkgPCAxMDApIHtcbiAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKC0xLCBkLm0sIGQuZCwgZC5ILCBkLk0sIGQuUywgZC5MKTtcbiAgICBkYXRlLnNldEZ1bGxZZWFyKGQueSk7XG4gICAgcmV0dXJuIGRhdGU7XG4gIH1cbiAgcmV0dXJuIG5ldyBEYXRlKGQueSwgZC5tLCBkLmQsIGQuSCwgZC5NLCBkLlMsIGQuTCk7XG59XG5cbmZ1bmN0aW9uIHV0Y0RhdGUoZCkge1xuICBpZiAoMCA8PSBkLnkgJiYgZC55IDwgMTAwKSB7XG4gICAgdmFyIGRhdGUgPSBuZXcgRGF0ZShEYXRlLlVUQygtMSwgZC5tLCBkLmQsIGQuSCwgZC5NLCBkLlMsIGQuTCkpO1xuICAgIGRhdGUuc2V0VVRDRnVsbFllYXIoZC55KTtcbiAgICByZXR1cm4gZGF0ZTtcbiAgfVxuICByZXR1cm4gbmV3IERhdGUoRGF0ZS5VVEMoZC55LCBkLm0sIGQuZCwgZC5ILCBkLk0sIGQuUywgZC5MKSk7XG59XG5cbmZ1bmN0aW9uIG5ld0RhdGUoeSwgbSwgZCkge1xuICByZXR1cm4ge3k6IHksIG06IG0sIGQ6IGQsIEg6IDAsIE06IDAsIFM6IDAsIEw6IDB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBmb3JtYXRMb2NhbGUobG9jYWxlKSB7XG4gIHZhciBsb2NhbGVfZGF0ZVRpbWUgPSBsb2NhbGUuZGF0ZVRpbWUsXG4gICAgICBsb2NhbGVfZGF0ZSA9IGxvY2FsZS5kYXRlLFxuICAgICAgbG9jYWxlX3RpbWUgPSBsb2NhbGUudGltZSxcbiAgICAgIGxvY2FsZV9wZXJpb2RzID0gbG9jYWxlLnBlcmlvZHMsXG4gICAgICBsb2NhbGVfd2Vla2RheXMgPSBsb2NhbGUuZGF5cyxcbiAgICAgIGxvY2FsZV9zaG9ydFdlZWtkYXlzID0gbG9jYWxlLnNob3J0RGF5cyxcbiAgICAgIGxvY2FsZV9tb250aHMgPSBsb2NhbGUubW9udGhzLFxuICAgICAgbG9jYWxlX3Nob3J0TW9udGhzID0gbG9jYWxlLnNob3J0TW9udGhzO1xuXG4gIHZhciBwZXJpb2RSZSA9IGZvcm1hdFJlKGxvY2FsZV9wZXJpb2RzKSxcbiAgICAgIHBlcmlvZExvb2t1cCA9IGZvcm1hdExvb2t1cChsb2NhbGVfcGVyaW9kcyksXG4gICAgICB3ZWVrZGF5UmUgPSBmb3JtYXRSZShsb2NhbGVfd2Vla2RheXMpLFxuICAgICAgd2Vla2RheUxvb2t1cCA9IGZvcm1hdExvb2t1cChsb2NhbGVfd2Vla2RheXMpLFxuICAgICAgc2hvcnRXZWVrZGF5UmUgPSBmb3JtYXRSZShsb2NhbGVfc2hvcnRXZWVrZGF5cyksXG4gICAgICBzaG9ydFdlZWtkYXlMb29rdXAgPSBmb3JtYXRMb29rdXAobG9jYWxlX3Nob3J0V2Vla2RheXMpLFxuICAgICAgbW9udGhSZSA9IGZvcm1hdFJlKGxvY2FsZV9tb250aHMpLFxuICAgICAgbW9udGhMb29rdXAgPSBmb3JtYXRMb29rdXAobG9jYWxlX21vbnRocyksXG4gICAgICBzaG9ydE1vbnRoUmUgPSBmb3JtYXRSZShsb2NhbGVfc2hvcnRNb250aHMpLFxuICAgICAgc2hvcnRNb250aExvb2t1cCA9IGZvcm1hdExvb2t1cChsb2NhbGVfc2hvcnRNb250aHMpO1xuXG4gIHZhciBmb3JtYXRzID0ge1xuICAgIFwiYVwiOiBmb3JtYXRTaG9ydFdlZWtkYXksXG4gICAgXCJBXCI6IGZvcm1hdFdlZWtkYXksXG4gICAgXCJiXCI6IGZvcm1hdFNob3J0TW9udGgsXG4gICAgXCJCXCI6IGZvcm1hdE1vbnRoLFxuICAgIFwiY1wiOiBudWxsLFxuICAgIFwiZFwiOiBmb3JtYXREYXlPZk1vbnRoLFxuICAgIFwiZVwiOiBmb3JtYXREYXlPZk1vbnRoLFxuICAgIFwiZlwiOiBmb3JtYXRNaWNyb3NlY29uZHMsXG4gICAgXCJnXCI6IGZvcm1hdFllYXJJU08sXG4gICAgXCJHXCI6IGZvcm1hdEZ1bGxZZWFySVNPLFxuICAgIFwiSFwiOiBmb3JtYXRIb3VyMjQsXG4gICAgXCJJXCI6IGZvcm1hdEhvdXIxMixcbiAgICBcImpcIjogZm9ybWF0RGF5T2ZZZWFyLFxuICAgIFwiTFwiOiBmb3JtYXRNaWxsaXNlY29uZHMsXG4gICAgXCJtXCI6IGZvcm1hdE1vbnRoTnVtYmVyLFxuICAgIFwiTVwiOiBmb3JtYXRNaW51dGVzLFxuICAgIFwicFwiOiBmb3JtYXRQZXJpb2QsXG4gICAgXCJxXCI6IGZvcm1hdFF1YXJ0ZXIsXG4gICAgXCJRXCI6IGZvcm1hdFVuaXhUaW1lc3RhbXAsXG4gICAgXCJzXCI6IGZvcm1hdFVuaXhUaW1lc3RhbXBTZWNvbmRzLFxuICAgIFwiU1wiOiBmb3JtYXRTZWNvbmRzLFxuICAgIFwidVwiOiBmb3JtYXRXZWVrZGF5TnVtYmVyTW9uZGF5LFxuICAgIFwiVVwiOiBmb3JtYXRXZWVrTnVtYmVyU3VuZGF5LFxuICAgIFwiVlwiOiBmb3JtYXRXZWVrTnVtYmVySVNPLFxuICAgIFwid1wiOiBmb3JtYXRXZWVrZGF5TnVtYmVyU3VuZGF5LFxuICAgIFwiV1wiOiBmb3JtYXRXZWVrTnVtYmVyTW9uZGF5LFxuICAgIFwieFwiOiBudWxsLFxuICAgIFwiWFwiOiBudWxsLFxuICAgIFwieVwiOiBmb3JtYXRZZWFyLFxuICAgIFwiWVwiOiBmb3JtYXRGdWxsWWVhcixcbiAgICBcIlpcIjogZm9ybWF0Wm9uZSxcbiAgICBcIiVcIjogZm9ybWF0TGl0ZXJhbFBlcmNlbnRcbiAgfTtcblxuICB2YXIgdXRjRm9ybWF0cyA9IHtcbiAgICBcImFcIjogZm9ybWF0VVRDU2hvcnRXZWVrZGF5LFxuICAgIFwiQVwiOiBmb3JtYXRVVENXZWVrZGF5LFxuICAgIFwiYlwiOiBmb3JtYXRVVENTaG9ydE1vbnRoLFxuICAgIFwiQlwiOiBmb3JtYXRVVENNb250aCxcbiAgICBcImNcIjogbnVsbCxcbiAgICBcImRcIjogZm9ybWF0VVRDRGF5T2ZNb250aCxcbiAgICBcImVcIjogZm9ybWF0VVRDRGF5T2ZNb250aCxcbiAgICBcImZcIjogZm9ybWF0VVRDTWljcm9zZWNvbmRzLFxuICAgIFwiZ1wiOiBmb3JtYXRVVENZZWFySVNPLFxuICAgIFwiR1wiOiBmb3JtYXRVVENGdWxsWWVhcklTTyxcbiAgICBcIkhcIjogZm9ybWF0VVRDSG91cjI0LFxuICAgIFwiSVwiOiBmb3JtYXRVVENIb3VyMTIsXG4gICAgXCJqXCI6IGZvcm1hdFVUQ0RheU9mWWVhcixcbiAgICBcIkxcIjogZm9ybWF0VVRDTWlsbGlzZWNvbmRzLFxuICAgIFwibVwiOiBmb3JtYXRVVENNb250aE51bWJlcixcbiAgICBcIk1cIjogZm9ybWF0VVRDTWludXRlcyxcbiAgICBcInBcIjogZm9ybWF0VVRDUGVyaW9kLFxuICAgIFwicVwiOiBmb3JtYXRVVENRdWFydGVyLFxuICAgIFwiUVwiOiBmb3JtYXRVbml4VGltZXN0YW1wLFxuICAgIFwic1wiOiBmb3JtYXRVbml4VGltZXN0YW1wU2Vjb25kcyxcbiAgICBcIlNcIjogZm9ybWF0VVRDU2Vjb25kcyxcbiAgICBcInVcIjogZm9ybWF0VVRDV2Vla2RheU51bWJlck1vbmRheSxcbiAgICBcIlVcIjogZm9ybWF0VVRDV2Vla051bWJlclN1bmRheSxcbiAgICBcIlZcIjogZm9ybWF0VVRDV2Vla051bWJlcklTTyxcbiAgICBcIndcIjogZm9ybWF0VVRDV2Vla2RheU51bWJlclN1bmRheSxcbiAgICBcIldcIjogZm9ybWF0VVRDV2Vla051bWJlck1vbmRheSxcbiAgICBcInhcIjogbnVsbCxcbiAgICBcIlhcIjogbnVsbCxcbiAgICBcInlcIjogZm9ybWF0VVRDWWVhcixcbiAgICBcIllcIjogZm9ybWF0VVRDRnVsbFllYXIsXG4gICAgXCJaXCI6IGZvcm1hdFVUQ1pvbmUsXG4gICAgXCIlXCI6IGZvcm1hdExpdGVyYWxQZXJjZW50XG4gIH07XG5cbiAgdmFyIHBhcnNlcyA9IHtcbiAgICBcImFcIjogcGFyc2VTaG9ydFdlZWtkYXksXG4gICAgXCJBXCI6IHBhcnNlV2Vla2RheSxcbiAgICBcImJcIjogcGFyc2VTaG9ydE1vbnRoLFxuICAgIFwiQlwiOiBwYXJzZU1vbnRoLFxuICAgIFwiY1wiOiBwYXJzZUxvY2FsZURhdGVUaW1lLFxuICAgIFwiZFwiOiBwYXJzZURheU9mTW9udGgsXG4gICAgXCJlXCI6IHBhcnNlRGF5T2ZNb250aCxcbiAgICBcImZcIjogcGFyc2VNaWNyb3NlY29uZHMsXG4gICAgXCJnXCI6IHBhcnNlWWVhcixcbiAgICBcIkdcIjogcGFyc2VGdWxsWWVhcixcbiAgICBcIkhcIjogcGFyc2VIb3VyMjQsXG4gICAgXCJJXCI6IHBhcnNlSG91cjI0LFxuICAgIFwialwiOiBwYXJzZURheU9mWWVhcixcbiAgICBcIkxcIjogcGFyc2VNaWxsaXNlY29uZHMsXG4gICAgXCJtXCI6IHBhcnNlTW9udGhOdW1iZXIsXG4gICAgXCJNXCI6IHBhcnNlTWludXRlcyxcbiAgICBcInBcIjogcGFyc2VQZXJpb2QsXG4gICAgXCJxXCI6IHBhcnNlUXVhcnRlcixcbiAgICBcIlFcIjogcGFyc2VVbml4VGltZXN0YW1wLFxuICAgIFwic1wiOiBwYXJzZVVuaXhUaW1lc3RhbXBTZWNvbmRzLFxuICAgIFwiU1wiOiBwYXJzZVNlY29uZHMsXG4gICAgXCJ1XCI6IHBhcnNlV2Vla2RheU51bWJlck1vbmRheSxcbiAgICBcIlVcIjogcGFyc2VXZWVrTnVtYmVyU3VuZGF5LFxuICAgIFwiVlwiOiBwYXJzZVdlZWtOdW1iZXJJU08sXG4gICAgXCJ3XCI6IHBhcnNlV2Vla2RheU51bWJlclN1bmRheSxcbiAgICBcIldcIjogcGFyc2VXZWVrTnVtYmVyTW9uZGF5LFxuICAgIFwieFwiOiBwYXJzZUxvY2FsZURhdGUsXG4gICAgXCJYXCI6IHBhcnNlTG9jYWxlVGltZSxcbiAgICBcInlcIjogcGFyc2VZZWFyLFxuICAgIFwiWVwiOiBwYXJzZUZ1bGxZZWFyLFxuICAgIFwiWlwiOiBwYXJzZVpvbmUsXG4gICAgXCIlXCI6IHBhcnNlTGl0ZXJhbFBlcmNlbnRcbiAgfTtcblxuICAvLyBUaGVzZSByZWN1cnNpdmUgZGlyZWN0aXZlIGRlZmluaXRpb25zIG11c3QgYmUgZGVmZXJyZWQuXG4gIGZvcm1hdHMueCA9IG5ld0Zvcm1hdChsb2NhbGVfZGF0ZSwgZm9ybWF0cyk7XG4gIGZvcm1hdHMuWCA9IG5ld0Zvcm1hdChsb2NhbGVfdGltZSwgZm9ybWF0cyk7XG4gIGZvcm1hdHMuYyA9IG5ld0Zvcm1hdChsb2NhbGVfZGF0ZVRpbWUsIGZvcm1hdHMpO1xuICB1dGNGb3JtYXRzLnggPSBuZXdGb3JtYXQobG9jYWxlX2RhdGUsIHV0Y0Zvcm1hdHMpO1xuICB1dGNGb3JtYXRzLlggPSBuZXdGb3JtYXQobG9jYWxlX3RpbWUsIHV0Y0Zvcm1hdHMpO1xuICB1dGNGb3JtYXRzLmMgPSBuZXdGb3JtYXQobG9jYWxlX2RhdGVUaW1lLCB1dGNGb3JtYXRzKTtcblxuICBmdW5jdGlvbiBuZXdGb3JtYXQoc3BlY2lmaWVyLCBmb3JtYXRzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGUpIHtcbiAgICAgIHZhciBzdHJpbmcgPSBbXSxcbiAgICAgICAgICBpID0gLTEsXG4gICAgICAgICAgaiA9IDAsXG4gICAgICAgICAgbiA9IHNwZWNpZmllci5sZW5ndGgsXG4gICAgICAgICAgYyxcbiAgICAgICAgICBwYWQsXG4gICAgICAgICAgZm9ybWF0O1xuXG4gICAgICBpZiAoIShkYXRlIGluc3RhbmNlb2YgRGF0ZSkpIGRhdGUgPSBuZXcgRGF0ZSgrZGF0ZSk7XG5cbiAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgIGlmIChzcGVjaWZpZXIuY2hhckNvZGVBdChpKSA9PT0gMzcpIHtcbiAgICAgICAgICBzdHJpbmcucHVzaChzcGVjaWZpZXIuc2xpY2UoaiwgaSkpO1xuICAgICAgICAgIGlmICgocGFkID0gcGFkc1tjID0gc3BlY2lmaWVyLmNoYXJBdCgrK2kpXSkgIT0gbnVsbCkgYyA9IHNwZWNpZmllci5jaGFyQXQoKytpKTtcbiAgICAgICAgICBlbHNlIHBhZCA9IGMgPT09IFwiZVwiID8gXCIgXCIgOiBcIjBcIjtcbiAgICAgICAgICBpZiAoZm9ybWF0ID0gZm9ybWF0c1tjXSkgYyA9IGZvcm1hdChkYXRlLCBwYWQpO1xuICAgICAgICAgIHN0cmluZy5wdXNoKGMpO1xuICAgICAgICAgIGogPSBpICsgMTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBzdHJpbmcucHVzaChzcGVjaWZpZXIuc2xpY2UoaiwgaSkpO1xuICAgICAgcmV0dXJuIHN0cmluZy5qb2luKFwiXCIpO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBuZXdQYXJzZShzcGVjaWZpZXIsIFopIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgICB2YXIgZCA9IG5ld0RhdGUoMTkwMCwgdW5kZWZpbmVkLCAxKSxcbiAgICAgICAgICBpID0gcGFyc2VTcGVjaWZpZXIoZCwgc3BlY2lmaWVyLCBzdHJpbmcgKz0gXCJcIiwgMCksXG4gICAgICAgICAgd2VlaywgZGF5O1xuICAgICAgaWYgKGkgIT0gc3RyaW5nLmxlbmd0aCkgcmV0dXJuIG51bGw7XG5cbiAgICAgIC8vIElmIGEgVU5JWCB0aW1lc3RhbXAgaXMgc3BlY2lmaWVkLCByZXR1cm4gaXQuXG4gICAgICBpZiAoXCJRXCIgaW4gZCkgcmV0dXJuIG5ldyBEYXRlKGQuUSk7XG4gICAgICBpZiAoXCJzXCIgaW4gZCkgcmV0dXJuIG5ldyBEYXRlKGQucyAqIDEwMDAgKyAoXCJMXCIgaW4gZCA/IGQuTCA6IDApKTtcblxuICAgICAgLy8gSWYgdGhpcyBpcyB1dGNQYXJzZSwgbmV2ZXIgdXNlIHRoZSBsb2NhbCB0aW1lem9uZS5cbiAgICAgIGlmIChaICYmICEoXCJaXCIgaW4gZCkpIGQuWiA9IDA7XG5cbiAgICAgIC8vIFRoZSBhbS1wbSBmbGFnIGlzIDAgZm9yIEFNLCBhbmQgMSBmb3IgUE0uXG4gICAgICBpZiAoXCJwXCIgaW4gZCkgZC5IID0gZC5IICUgMTIgKyBkLnAgKiAxMjtcblxuICAgICAgLy8gSWYgdGhlIG1vbnRoIHdhcyBub3Qgc3BlY2lmaWVkLCBpbmhlcml0IGZyb20gdGhlIHF1YXJ0ZXIuXG4gICAgICBpZiAoZC5tID09PSB1bmRlZmluZWQpIGQubSA9IFwicVwiIGluIGQgPyBkLnEgOiAwO1xuXG4gICAgICAvLyBDb252ZXJ0IGRheS1vZi13ZWVrIGFuZCB3ZWVrLW9mLXllYXIgdG8gZGF5LW9mLXllYXIuXG4gICAgICBpZiAoXCJWXCIgaW4gZCkge1xuICAgICAgICBpZiAoZC5WIDwgMSB8fCBkLlYgPiA1MykgcmV0dXJuIG51bGw7XG4gICAgICAgIGlmICghKFwid1wiIGluIGQpKSBkLncgPSAxO1xuICAgICAgICBpZiAoXCJaXCIgaW4gZCkge1xuICAgICAgICAgIHdlZWsgPSB1dGNEYXRlKG5ld0RhdGUoZC55LCAwLCAxKSksIGRheSA9IHdlZWsuZ2V0VVRDRGF5KCk7XG4gICAgICAgICAgd2VlayA9IGRheSA+IDQgfHwgZGF5ID09PSAwID8gdXRjTW9uZGF5LmNlaWwod2VlaykgOiB1dGNNb25kYXkod2Vlayk7XG4gICAgICAgICAgd2VlayA9IHV0Y0RheS5vZmZzZXQod2VlaywgKGQuViAtIDEpICogNyk7XG4gICAgICAgICAgZC55ID0gd2Vlay5nZXRVVENGdWxsWWVhcigpO1xuICAgICAgICAgIGQubSA9IHdlZWsuZ2V0VVRDTW9udGgoKTtcbiAgICAgICAgICBkLmQgPSB3ZWVrLmdldFVUQ0RhdGUoKSArIChkLncgKyA2KSAlIDc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd2VlayA9IGxvY2FsRGF0ZShuZXdEYXRlKGQueSwgMCwgMSkpLCBkYXkgPSB3ZWVrLmdldERheSgpO1xuICAgICAgICAgIHdlZWsgPSBkYXkgPiA0IHx8IGRheSA9PT0gMCA/IHRpbWVNb25kYXkuY2VpbCh3ZWVrKSA6IHRpbWVNb25kYXkod2Vlayk7XG4gICAgICAgICAgd2VlayA9IHRpbWVEYXkub2Zmc2V0KHdlZWssIChkLlYgLSAxKSAqIDcpO1xuICAgICAgICAgIGQueSA9IHdlZWsuZ2V0RnVsbFllYXIoKTtcbiAgICAgICAgICBkLm0gPSB3ZWVrLmdldE1vbnRoKCk7XG4gICAgICAgICAgZC5kID0gd2Vlay5nZXREYXRlKCkgKyAoZC53ICsgNikgJSA3O1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKFwiV1wiIGluIGQgfHwgXCJVXCIgaW4gZCkge1xuICAgICAgICBpZiAoIShcIndcIiBpbiBkKSkgZC53ID0gXCJ1XCIgaW4gZCA/IGQudSAlIDcgOiBcIldcIiBpbiBkID8gMSA6IDA7XG4gICAgICAgIGRheSA9IFwiWlwiIGluIGQgPyB1dGNEYXRlKG5ld0RhdGUoZC55LCAwLCAxKSkuZ2V0VVRDRGF5KCkgOiBsb2NhbERhdGUobmV3RGF0ZShkLnksIDAsIDEpKS5nZXREYXkoKTtcbiAgICAgICAgZC5tID0gMDtcbiAgICAgICAgZC5kID0gXCJXXCIgaW4gZCA/IChkLncgKyA2KSAlIDcgKyBkLlcgKiA3IC0gKGRheSArIDUpICUgNyA6IGQudyArIGQuVSAqIDcgLSAoZGF5ICsgNikgJSA3O1xuICAgICAgfVxuXG4gICAgICAvLyBJZiBhIHRpbWUgem9uZSBpcyBzcGVjaWZpZWQsIGFsbCBmaWVsZHMgYXJlIGludGVycHJldGVkIGFzIFVUQyBhbmQgdGhlblxuICAgICAgLy8gb2Zmc2V0IGFjY29yZGluZyB0byB0aGUgc3BlY2lmaWVkIHRpbWUgem9uZS5cbiAgICAgIGlmIChcIlpcIiBpbiBkKSB7XG4gICAgICAgIGQuSCArPSBkLlogLyAxMDAgfCAwO1xuICAgICAgICBkLk0gKz0gZC5aICUgMTAwO1xuICAgICAgICByZXR1cm4gdXRjRGF0ZShkKTtcbiAgICAgIH1cblxuICAgICAgLy8gT3RoZXJ3aXNlLCBhbGwgZmllbGRzIGFyZSBpbiBsb2NhbCB0aW1lLlxuICAgICAgcmV0dXJuIGxvY2FsRGF0ZShkKTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VTcGVjaWZpZXIoZCwgc3BlY2lmaWVyLCBzdHJpbmcsIGopIHtcbiAgICB2YXIgaSA9IDAsXG4gICAgICAgIG4gPSBzcGVjaWZpZXIubGVuZ3RoLFxuICAgICAgICBtID0gc3RyaW5nLmxlbmd0aCxcbiAgICAgICAgYyxcbiAgICAgICAgcGFyc2U7XG5cbiAgICB3aGlsZSAoaSA8IG4pIHtcbiAgICAgIGlmIChqID49IG0pIHJldHVybiAtMTtcbiAgICAgIGMgPSBzcGVjaWZpZXIuY2hhckNvZGVBdChpKyspO1xuICAgICAgaWYgKGMgPT09IDM3KSB7XG4gICAgICAgIGMgPSBzcGVjaWZpZXIuY2hhckF0KGkrKyk7XG4gICAgICAgIHBhcnNlID0gcGFyc2VzW2MgaW4gcGFkcyA/IHNwZWNpZmllci5jaGFyQXQoaSsrKSA6IGNdO1xuICAgICAgICBpZiAoIXBhcnNlIHx8ICgoaiA9IHBhcnNlKGQsIHN0cmluZywgaikpIDwgMCkpIHJldHVybiAtMTtcbiAgICAgIH0gZWxzZSBpZiAoYyAhPSBzdHJpbmcuY2hhckNvZGVBdChqKyspKSB7XG4gICAgICAgIHJldHVybiAtMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gajtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlUGVyaW9kKGQsIHN0cmluZywgaSkge1xuICAgIHZhciBuID0gcGVyaW9kUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSkpO1xuICAgIHJldHVybiBuID8gKGQucCA9IHBlcmlvZExvb2t1cC5nZXQoblswXS50b0xvd2VyQ2FzZSgpKSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VTaG9ydFdlZWtkYXkoZCwgc3RyaW5nLCBpKSB7XG4gICAgdmFyIG4gPSBzaG9ydFdlZWtkYXlSZS5leGVjKHN0cmluZy5zbGljZShpKSk7XG4gICAgcmV0dXJuIG4gPyAoZC53ID0gc2hvcnRXZWVrZGF5TG9va3VwLmdldChuWzBdLnRvTG93ZXJDYXNlKCkpLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZVdlZWtkYXkoZCwgc3RyaW5nLCBpKSB7XG4gICAgdmFyIG4gPSB3ZWVrZGF5UmUuZXhlYyhzdHJpbmcuc2xpY2UoaSkpO1xuICAgIHJldHVybiBuID8gKGQudyA9IHdlZWtkYXlMb29rdXAuZ2V0KG5bMF0udG9Mb3dlckNhc2UoKSksIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlU2hvcnRNb250aChkLCBzdHJpbmcsIGkpIHtcbiAgICB2YXIgbiA9IHNob3J0TW9udGhSZS5leGVjKHN0cmluZy5zbGljZShpKSk7XG4gICAgcmV0dXJuIG4gPyAoZC5tID0gc2hvcnRNb250aExvb2t1cC5nZXQoblswXS50b0xvd2VyQ2FzZSgpKSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VNb250aChkLCBzdHJpbmcsIGkpIHtcbiAgICB2YXIgbiA9IG1vbnRoUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSkpO1xuICAgIHJldHVybiBuID8gKGQubSA9IG1vbnRoTG9va3VwLmdldChuWzBdLnRvTG93ZXJDYXNlKCkpLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZUxvY2FsZURhdGVUaW1lKGQsIHN0cmluZywgaSkge1xuICAgIHJldHVybiBwYXJzZVNwZWNpZmllcihkLCBsb2NhbGVfZGF0ZVRpbWUsIHN0cmluZywgaSk7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZUxvY2FsZURhdGUoZCwgc3RyaW5nLCBpKSB7XG4gICAgcmV0dXJuIHBhcnNlU3BlY2lmaWVyKGQsIGxvY2FsZV9kYXRlLCBzdHJpbmcsIGkpO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VMb2NhbGVUaW1lKGQsIHN0cmluZywgaSkge1xuICAgIHJldHVybiBwYXJzZVNwZWNpZmllcihkLCBsb2NhbGVfdGltZSwgc3RyaW5nLCBpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFNob3J0V2Vla2RheShkKSB7XG4gICAgcmV0dXJuIGxvY2FsZV9zaG9ydFdlZWtkYXlzW2QuZ2V0RGF5KCldO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0V2Vla2RheShkKSB7XG4gICAgcmV0dXJuIGxvY2FsZV93ZWVrZGF5c1tkLmdldERheSgpXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFNob3J0TW9udGgoZCkge1xuICAgIHJldHVybiBsb2NhbGVfc2hvcnRNb250aHNbZC5nZXRNb250aCgpXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdE1vbnRoKGQpIHtcbiAgICByZXR1cm4gbG9jYWxlX21vbnRoc1tkLmdldE1vbnRoKCldO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0UGVyaW9kKGQpIHtcbiAgICByZXR1cm4gbG9jYWxlX3BlcmlvZHNbKyhkLmdldEhvdXJzKCkgPj0gMTIpXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFF1YXJ0ZXIoZCkge1xuICAgIHJldHVybiAxICsgfn4oZC5nZXRNb250aCgpIC8gMyk7XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRVVENTaG9ydFdlZWtkYXkoZCkge1xuICAgIHJldHVybiBsb2NhbGVfc2hvcnRXZWVrZGF5c1tkLmdldFVUQ0RheSgpXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFVUQ1dlZWtkYXkoZCkge1xuICAgIHJldHVybiBsb2NhbGVfd2Vla2RheXNbZC5nZXRVVENEYXkoKV07XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRVVENTaG9ydE1vbnRoKGQpIHtcbiAgICByZXR1cm4gbG9jYWxlX3Nob3J0TW9udGhzW2QuZ2V0VVRDTW9udGgoKV07XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRVVENNb250aChkKSB7XG4gICAgcmV0dXJuIGxvY2FsZV9tb250aHNbZC5nZXRVVENNb250aCgpXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFVUQ1BlcmlvZChkKSB7XG4gICAgcmV0dXJuIGxvY2FsZV9wZXJpb2RzWysoZC5nZXRVVENIb3VycygpID49IDEyKV07XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRVVENRdWFydGVyKGQpIHtcbiAgICByZXR1cm4gMSArIH5+KGQuZ2V0VVRDTW9udGgoKSAvIDMpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBmb3JtYXQ6IGZ1bmN0aW9uKHNwZWNpZmllcikge1xuICAgICAgdmFyIGYgPSBuZXdGb3JtYXQoc3BlY2lmaWVyICs9IFwiXCIsIGZvcm1hdHMpO1xuICAgICAgZi50b1N0cmluZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gc3BlY2lmaWVyOyB9O1xuICAgICAgcmV0dXJuIGY7XG4gICAgfSxcbiAgICBwYXJzZTogZnVuY3Rpb24oc3BlY2lmaWVyKSB7XG4gICAgICB2YXIgcCA9IG5ld1BhcnNlKHNwZWNpZmllciArPSBcIlwiLCBmYWxzZSk7XG4gICAgICBwLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7IHJldHVybiBzcGVjaWZpZXI7IH07XG4gICAgICByZXR1cm4gcDtcbiAgICB9LFxuICAgIHV0Y0Zvcm1hdDogZnVuY3Rpb24oc3BlY2lmaWVyKSB7XG4gICAgICB2YXIgZiA9IG5ld0Zvcm1hdChzcGVjaWZpZXIgKz0gXCJcIiwgdXRjRm9ybWF0cyk7XG4gICAgICBmLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7IHJldHVybiBzcGVjaWZpZXI7IH07XG4gICAgICByZXR1cm4gZjtcbiAgICB9LFxuICAgIHV0Y1BhcnNlOiBmdW5jdGlvbihzcGVjaWZpZXIpIHtcbiAgICAgIHZhciBwID0gbmV3UGFyc2Uoc3BlY2lmaWVyICs9IFwiXCIsIHRydWUpO1xuICAgICAgcC50b1N0cmluZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gc3BlY2lmaWVyOyB9O1xuICAgICAgcmV0dXJuIHA7XG4gICAgfVxuICB9O1xufVxuXG52YXIgcGFkcyA9IHtcIi1cIjogXCJcIiwgXCJfXCI6IFwiIFwiLCBcIjBcIjogXCIwXCJ9LFxuICAgIG51bWJlclJlID0gL15cXHMqXFxkKy8sIC8vIG5vdGU6IGlnbm9yZXMgbmV4dCBkaXJlY3RpdmVcbiAgICBwZXJjZW50UmUgPSAvXiUvLFxuICAgIHJlcXVvdGVSZSA9IC9bXFxcXF4kKis/fFtcXF0oKS57fV0vZztcblxuZnVuY3Rpb24gcGFkKHZhbHVlLCBmaWxsLCB3aWR0aCkge1xuICB2YXIgc2lnbiA9IHZhbHVlIDwgMCA/IFwiLVwiIDogXCJcIixcbiAgICAgIHN0cmluZyA9IChzaWduID8gLXZhbHVlIDogdmFsdWUpICsgXCJcIixcbiAgICAgIGxlbmd0aCA9IHN0cmluZy5sZW5ndGg7XG4gIHJldHVybiBzaWduICsgKGxlbmd0aCA8IHdpZHRoID8gbmV3IEFycmF5KHdpZHRoIC0gbGVuZ3RoICsgMSkuam9pbihmaWxsKSArIHN0cmluZyA6IHN0cmluZyk7XG59XG5cbmZ1bmN0aW9uIHJlcXVvdGUocykge1xuICByZXR1cm4gcy5yZXBsYWNlKHJlcXVvdGVSZSwgXCJcXFxcJCZcIik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFJlKG5hbWVzKSB7XG4gIHJldHVybiBuZXcgUmVnRXhwKFwiXig/OlwiICsgbmFtZXMubWFwKHJlcXVvdGUpLmpvaW4oXCJ8XCIpICsgXCIpXCIsIFwiaVwiKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0TG9va3VwKG5hbWVzKSB7XG4gIHJldHVybiBuZXcgTWFwKG5hbWVzLm1hcCgobmFtZSwgaSkgPT4gW25hbWUudG9Mb3dlckNhc2UoKSwgaV0pKTtcbn1cblxuZnVuY3Rpb24gcGFyc2VXZWVrZGF5TnVtYmVyU3VuZGF5KGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAxKSk7XG4gIHJldHVybiBuID8gKGQudyA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlV2Vla2RheU51bWJlck1vbmRheShkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMSkpO1xuICByZXR1cm4gbiA/IChkLnUgPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZVdlZWtOdW1iZXJTdW5kYXkoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDIpKTtcbiAgcmV0dXJuIG4gPyAoZC5VID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VXZWVrTnVtYmVySVNPKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAyKSk7XG4gIHJldHVybiBuID8gKGQuViA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlV2Vla051bWJlck1vbmRheShkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMikpO1xuICByZXR1cm4gbiA/IChkLlcgPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZUZ1bGxZZWFyKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyA0KSk7XG4gIHJldHVybiBuID8gKGQueSA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlWWVhcihkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMikpO1xuICByZXR1cm4gbiA/IChkLnkgPSArblswXSArICgrblswXSA+IDY4ID8gMTkwMCA6IDIwMDApLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlWm9uZShkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSAvXihaKXwoWystXVxcZFxcZCkoPzo6PyhcXGRcXGQpKT8vLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyA2KSk7XG4gIHJldHVybiBuID8gKGQuWiA9IG5bMV0gPyAwIDogLShuWzJdICsgKG5bM10gfHwgXCIwMFwiKSksIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VRdWFydGVyKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAxKSk7XG4gIHJldHVybiBuID8gKGQucSA9IG5bMF0gKiAzIC0gMywgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZU1vbnRoTnVtYmVyKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAyKSk7XG4gIHJldHVybiBuID8gKGQubSA9IG5bMF0gLSAxLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlRGF5T2ZNb250aChkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMikpO1xuICByZXR1cm4gbiA/IChkLmQgPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZURheU9mWWVhcihkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMykpO1xuICByZXR1cm4gbiA/IChkLm0gPSAwLCBkLmQgPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZUhvdXIyNChkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMikpO1xuICByZXR1cm4gbiA/IChkLkggPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZU1pbnV0ZXMoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDIpKTtcbiAgcmV0dXJuIG4gPyAoZC5NID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VTZWNvbmRzKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAyKSk7XG4gIHJldHVybiBuID8gKGQuUyA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlTWlsbGlzZWNvbmRzKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAzKSk7XG4gIHJldHVybiBuID8gKGQuTCA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlTWljcm9zZWNvbmRzKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyA2KSk7XG4gIHJldHVybiBuID8gKGQuTCA9IE1hdGguZmxvb3IoblswXSAvIDEwMDApLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlTGl0ZXJhbFBlcmNlbnQoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gcGVyY2VudFJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAxKSk7XG4gIHJldHVybiBuID8gaSArIG5bMF0ubGVuZ3RoIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlVW5peFRpbWVzdGFtcChkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpKSk7XG4gIHJldHVybiBuID8gKGQuUSA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlVW5peFRpbWVzdGFtcFNlY29uZHMoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSkpO1xuICByZXR1cm4gbiA/IChkLnMgPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBmb3JtYXREYXlPZk1vbnRoKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldERhdGUoKSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdEhvdXIyNChkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRIb3VycygpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0SG91cjEyKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldEhvdXJzKCkgJSAxMiB8fCAxMiwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdERheU9mWWVhcihkLCBwKSB7XG4gIHJldHVybiBwYWQoMSArIHRpbWVEYXkuY291bnQodGltZVllYXIoZCksIGQpLCBwLCAzKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0TWlsbGlzZWNvbmRzKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldE1pbGxpc2Vjb25kcygpLCBwLCAzKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0TWljcm9zZWNvbmRzKGQsIHApIHtcbiAgcmV0dXJuIGZvcm1hdE1pbGxpc2Vjb25kcyhkLCBwKSArIFwiMDAwXCI7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdE1vbnRoTnVtYmVyKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldE1vbnRoKCkgKyAxLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0TWludXRlcyhkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRNaW51dGVzKCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRTZWNvbmRzKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldFNlY29uZHMoKSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFdlZWtkYXlOdW1iZXJNb25kYXkoZCkge1xuICB2YXIgZGF5ID0gZC5nZXREYXkoKTtcbiAgcmV0dXJuIGRheSA9PT0gMCA/IDcgOiBkYXk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFdlZWtOdW1iZXJTdW5kYXkoZCwgcCkge1xuICByZXR1cm4gcGFkKHRpbWVTdW5kYXkuY291bnQodGltZVllYXIoZCkgLSAxLCBkKSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGRJU08oZCkge1xuICB2YXIgZGF5ID0gZC5nZXREYXkoKTtcbiAgcmV0dXJuIChkYXkgPj0gNCB8fCBkYXkgPT09IDApID8gdGltZVRodXJzZGF5KGQpIDogdGltZVRodXJzZGF5LmNlaWwoZCk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFdlZWtOdW1iZXJJU08oZCwgcCkge1xuICBkID0gZElTTyhkKTtcbiAgcmV0dXJuIHBhZCh0aW1lVGh1cnNkYXkuY291bnQodGltZVllYXIoZCksIGQpICsgKHRpbWVZZWFyKGQpLmdldERheSgpID09PSA0KSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFdlZWtkYXlOdW1iZXJTdW5kYXkoZCkge1xuICByZXR1cm4gZC5nZXREYXkoKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0V2Vla051bWJlck1vbmRheShkLCBwKSB7XG4gIHJldHVybiBwYWQodGltZU1vbmRheS5jb3VudCh0aW1lWWVhcihkKSAtIDEsIGQpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0WWVhcihkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRGdWxsWWVhcigpICUgMTAwLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0WWVhcklTTyhkLCBwKSB7XG4gIGQgPSBkSVNPKGQpO1xuICByZXR1cm4gcGFkKGQuZ2V0RnVsbFllYXIoKSAlIDEwMCwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdEZ1bGxZZWFyKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldEZ1bGxZZWFyKCkgJSAxMDAwMCwgcCwgNCk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdEZ1bGxZZWFySVNPKGQsIHApIHtcbiAgdmFyIGRheSA9IGQuZ2V0RGF5KCk7XG4gIGQgPSAoZGF5ID49IDQgfHwgZGF5ID09PSAwKSA/IHRpbWVUaHVyc2RheShkKSA6IHRpbWVUaHVyc2RheS5jZWlsKGQpO1xuICByZXR1cm4gcGFkKGQuZ2V0RnVsbFllYXIoKSAlIDEwMDAwLCBwLCA0KTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0Wm9uZShkKSB7XG4gIHZhciB6ID0gZC5nZXRUaW1lem9uZU9mZnNldCgpO1xuICByZXR1cm4gKHogPiAwID8gXCItXCIgOiAoeiAqPSAtMSwgXCIrXCIpKVxuICAgICAgKyBwYWQoeiAvIDYwIHwgMCwgXCIwXCIsIDIpXG4gICAgICArIHBhZCh6ICUgNjAsIFwiMFwiLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDRGF5T2ZNb250aChkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRVVENEYXRlKCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENIb3VyMjQoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0VVRDSG91cnMoKSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ0hvdXIxMihkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRVVENIb3VycygpICUgMTIgfHwgMTIsIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENEYXlPZlllYXIoZCwgcCkge1xuICByZXR1cm4gcGFkKDEgKyB1dGNEYXkuY291bnQodXRjWWVhcihkKSwgZCksIHAsIDMpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENNaWxsaXNlY29uZHMoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0VVRDTWlsbGlzZWNvbmRzKCksIHAsIDMpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENNaWNyb3NlY29uZHMoZCwgcCkge1xuICByZXR1cm4gZm9ybWF0VVRDTWlsbGlzZWNvbmRzKGQsIHApICsgXCIwMDBcIjtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDTW9udGhOdW1iZXIoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0VVRDTW9udGgoKSArIDEsIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENNaW51dGVzKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldFVUQ01pbnV0ZXMoKSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ1NlY29uZHMoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0VVRDU2Vjb25kcygpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDV2Vla2RheU51bWJlck1vbmRheShkKSB7XG4gIHZhciBkb3cgPSBkLmdldFVUQ0RheSgpO1xuICByZXR1cm4gZG93ID09PSAwID8gNyA6IGRvdztcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDV2Vla051bWJlclN1bmRheShkLCBwKSB7XG4gIHJldHVybiBwYWQodXRjU3VuZGF5LmNvdW50KHV0Y1llYXIoZCkgLSAxLCBkKSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIFVUQ2RJU08oZCkge1xuICB2YXIgZGF5ID0gZC5nZXRVVENEYXkoKTtcbiAgcmV0dXJuIChkYXkgPj0gNCB8fCBkYXkgPT09IDApID8gdXRjVGh1cnNkYXkoZCkgOiB1dGNUaHVyc2RheS5jZWlsKGQpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENXZWVrTnVtYmVySVNPKGQsIHApIHtcbiAgZCA9IFVUQ2RJU08oZCk7XG4gIHJldHVybiBwYWQodXRjVGh1cnNkYXkuY291bnQodXRjWWVhcihkKSwgZCkgKyAodXRjWWVhcihkKS5nZXRVVENEYXkoKSA9PT0gNCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENXZWVrZGF5TnVtYmVyU3VuZGF5KGQpIHtcbiAgcmV0dXJuIGQuZ2V0VVRDRGF5KCk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ1dlZWtOdW1iZXJNb25kYXkoZCwgcCkge1xuICByZXR1cm4gcGFkKHV0Y01vbmRheS5jb3VudCh1dGNZZWFyKGQpIC0gMSwgZCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENZZWFyKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldFVUQ0Z1bGxZZWFyKCkgJSAxMDAsIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENZZWFySVNPKGQsIHApIHtcbiAgZCA9IFVUQ2RJU08oZCk7XG4gIHJldHVybiBwYWQoZC5nZXRVVENGdWxsWWVhcigpICUgMTAwLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDRnVsbFllYXIoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0VVRDRnVsbFllYXIoKSAlIDEwMDAwLCBwLCA0KTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDRnVsbFllYXJJU08oZCwgcCkge1xuICB2YXIgZGF5ID0gZC5nZXRVVENEYXkoKTtcbiAgZCA9IChkYXkgPj0gNCB8fCBkYXkgPT09IDApID8gdXRjVGh1cnNkYXkoZCkgOiB1dGNUaHVyc2RheS5jZWlsKGQpO1xuICByZXR1cm4gcGFkKGQuZ2V0VVRDRnVsbFllYXIoKSAlIDEwMDAwLCBwLCA0KTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDWm9uZSgpIHtcbiAgcmV0dXJuIFwiKzAwMDBcIjtcbn1cblxuZnVuY3Rpb24gZm9ybWF0TGl0ZXJhbFBlcmNlbnQoKSB7XG4gIHJldHVybiBcIiVcIjtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VW5peFRpbWVzdGFtcChkKSB7XG4gIHJldHVybiArZDtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VW5peFRpbWVzdGFtcFNlY29uZHMoZCkge1xuICByZXR1cm4gTWF0aC5mbG9vcigrZCAvIDEwMDApO1xufVxuIiwKICAgICJpbXBvcnQgZm9ybWF0TG9jYWxlIGZyb20gXCIuL2xvY2FsZS5qc1wiO1xuXG52YXIgbG9jYWxlO1xuZXhwb3J0IHZhciB0aW1lRm9ybWF0O1xuZXhwb3J0IHZhciB0aW1lUGFyc2U7XG5leHBvcnQgdmFyIHV0Y0Zvcm1hdDtcbmV4cG9ydCB2YXIgdXRjUGFyc2U7XG5cbmRlZmF1bHRMb2NhbGUoe1xuICBkYXRlVGltZTogXCIleCwgJVhcIixcbiAgZGF0ZTogXCIlLW0vJS1kLyVZXCIsXG4gIHRpbWU6IFwiJS1JOiVNOiVTICVwXCIsXG4gIHBlcmlvZHM6IFtcIkFNXCIsIFwiUE1cIl0sXG4gIGRheXM6IFtcIlN1bmRheVwiLCBcIk1vbmRheVwiLCBcIlR1ZXNkYXlcIiwgXCJXZWRuZXNkYXlcIiwgXCJUaHVyc2RheVwiLCBcIkZyaWRheVwiLCBcIlNhdHVyZGF5XCJdLFxuICBzaG9ydERheXM6IFtcIlN1blwiLCBcIk1vblwiLCBcIlR1ZVwiLCBcIldlZFwiLCBcIlRodVwiLCBcIkZyaVwiLCBcIlNhdFwiXSxcbiAgbW9udGhzOiBbXCJKYW51YXJ5XCIsIFwiRmVicnVhcnlcIiwgXCJNYXJjaFwiLCBcIkFwcmlsXCIsIFwiTWF5XCIsIFwiSnVuZVwiLCBcIkp1bHlcIiwgXCJBdWd1c3RcIiwgXCJTZXB0ZW1iZXJcIiwgXCJPY3RvYmVyXCIsIFwiTm92ZW1iZXJcIiwgXCJEZWNlbWJlclwiXSxcbiAgc2hvcnRNb250aHM6IFtcIkphblwiLCBcIkZlYlwiLCBcIk1hclwiLCBcIkFwclwiLCBcIk1heVwiLCBcIkp1blwiLCBcIkp1bFwiLCBcIkF1Z1wiLCBcIlNlcFwiLCBcIk9jdFwiLCBcIk5vdlwiLCBcIkRlY1wiXVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlZmF1bHRMb2NhbGUoZGVmaW5pdGlvbikge1xuICBsb2NhbGUgPSBmb3JtYXRMb2NhbGUoZGVmaW5pdGlvbik7XG4gIHRpbWVGb3JtYXQgPSBsb2NhbGUuZm9ybWF0O1xuICB0aW1lUGFyc2UgPSBsb2NhbGUucGFyc2U7XG4gIHV0Y0Zvcm1hdCA9IGxvY2FsZS51dGNGb3JtYXQ7XG4gIHV0Y1BhcnNlID0gbG9jYWxlLnV0Y1BhcnNlO1xuICByZXR1cm4gbG9jYWxlO1xufVxuIiwKICAgICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBuaWNlKGRvbWFpbiwgaW50ZXJ2YWwpIHtcbiAgZG9tYWluID0gZG9tYWluLnNsaWNlKCk7XG5cbiAgdmFyIGkwID0gMCxcbiAgICAgIGkxID0gZG9tYWluLmxlbmd0aCAtIDEsXG4gICAgICB4MCA9IGRvbWFpbltpMF0sXG4gICAgICB4MSA9IGRvbWFpbltpMV0sXG4gICAgICB0O1xuXG4gIGlmICh4MSA8IHgwKSB7XG4gICAgdCA9IGkwLCBpMCA9IGkxLCBpMSA9IHQ7XG4gICAgdCA9IHgwLCB4MCA9IHgxLCB4MSA9IHQ7XG4gIH1cblxuICBkb21haW5baTBdID0gaW50ZXJ2YWwuZmxvb3IoeDApO1xuICBkb21haW5baTFdID0gaW50ZXJ2YWwuY2VpbCh4MSk7XG4gIHJldHVybiBkb21haW47XG59XG4iLAogICAgImltcG9ydCB7dGltZVllYXIsIHRpbWVNb250aCwgdGltZVdlZWssIHRpbWVEYXksIHRpbWVIb3VyLCB0aW1lTWludXRlLCB0aW1lU2Vjb25kLCB0aW1lVGlja3MsIHRpbWVUaWNrSW50ZXJ2YWx9IGZyb20gXCJkMy10aW1lXCI7XG5pbXBvcnQge3RpbWVGb3JtYXR9IGZyb20gXCJkMy10aW1lLWZvcm1hdFwiO1xuaW1wb3J0IGNvbnRpbnVvdXMsIHtjb3B5fSBmcm9tIFwiLi9jb250aW51b3VzLmpzXCI7XG5pbXBvcnQge2luaXRSYW5nZX0gZnJvbSBcIi4vaW5pdC5qc1wiO1xuaW1wb3J0IG5pY2UgZnJvbSBcIi4vbmljZS5qc1wiO1xuXG5mdW5jdGlvbiBkYXRlKHQpIHtcbiAgcmV0dXJuIG5ldyBEYXRlKHQpO1xufVxuXG5mdW5jdGlvbiBudW1iZXIodCkge1xuICByZXR1cm4gdCBpbnN0YW5jZW9mIERhdGUgPyArdCA6ICtuZXcgRGF0ZSgrdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYWxlbmRhcih0aWNrcywgdGlja0ludGVydmFsLCB5ZWFyLCBtb250aCwgd2VlaywgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgZm9ybWF0KSB7XG4gIHZhciBzY2FsZSA9IGNvbnRpbnVvdXMoKSxcbiAgICAgIGludmVydCA9IHNjYWxlLmludmVydCxcbiAgICAgIGRvbWFpbiA9IHNjYWxlLmRvbWFpbjtcblxuICB2YXIgZm9ybWF0TWlsbGlzZWNvbmQgPSBmb3JtYXQoXCIuJUxcIiksXG4gICAgICBmb3JtYXRTZWNvbmQgPSBmb3JtYXQoXCI6JVNcIiksXG4gICAgICBmb3JtYXRNaW51dGUgPSBmb3JtYXQoXCIlSTolTVwiKSxcbiAgICAgIGZvcm1hdEhvdXIgPSBmb3JtYXQoXCIlSSAlcFwiKSxcbiAgICAgIGZvcm1hdERheSA9IGZvcm1hdChcIiVhICVkXCIpLFxuICAgICAgZm9ybWF0V2VlayA9IGZvcm1hdChcIiViICVkXCIpLFxuICAgICAgZm9ybWF0TW9udGggPSBmb3JtYXQoXCIlQlwiKSxcbiAgICAgIGZvcm1hdFllYXIgPSBmb3JtYXQoXCIlWVwiKTtcblxuICBmdW5jdGlvbiB0aWNrRm9ybWF0KGRhdGUpIHtcbiAgICByZXR1cm4gKHNlY29uZChkYXRlKSA8IGRhdGUgPyBmb3JtYXRNaWxsaXNlY29uZFxuICAgICAgICA6IG1pbnV0ZShkYXRlKSA8IGRhdGUgPyBmb3JtYXRTZWNvbmRcbiAgICAgICAgOiBob3VyKGRhdGUpIDwgZGF0ZSA/IGZvcm1hdE1pbnV0ZVxuICAgICAgICA6IGRheShkYXRlKSA8IGRhdGUgPyBmb3JtYXRIb3VyXG4gICAgICAgIDogbW9udGgoZGF0ZSkgPCBkYXRlID8gKHdlZWsoZGF0ZSkgPCBkYXRlID8gZm9ybWF0RGF5IDogZm9ybWF0V2VlaylcbiAgICAgICAgOiB5ZWFyKGRhdGUpIDwgZGF0ZSA/IGZvcm1hdE1vbnRoXG4gICAgICAgIDogZm9ybWF0WWVhcikoZGF0ZSk7XG4gIH1cblxuICBzY2FsZS5pbnZlcnQgPSBmdW5jdGlvbih5KSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKGludmVydCh5KSk7XG4gIH07XG5cbiAgc2NhbGUuZG9tYWluID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gZG9tYWluKEFycmF5LmZyb20oXywgbnVtYmVyKSkgOiBkb21haW4oKS5tYXAoZGF0ZSk7XG4gIH07XG5cbiAgc2NhbGUudGlja3MgPSBmdW5jdGlvbihpbnRlcnZhbCkge1xuICAgIHZhciBkID0gZG9tYWluKCk7XG4gICAgcmV0dXJuIHRpY2tzKGRbMF0sIGRbZC5sZW5ndGggLSAxXSwgaW50ZXJ2YWwgPT0gbnVsbCA/IDEwIDogaW50ZXJ2YWwpO1xuICB9O1xuXG4gIHNjYWxlLnRpY2tGb3JtYXQgPSBmdW5jdGlvbihjb3VudCwgc3BlY2lmaWVyKSB7XG4gICAgcmV0dXJuIHNwZWNpZmllciA9PSBudWxsID8gdGlja0Zvcm1hdCA6IGZvcm1hdChzcGVjaWZpZXIpO1xuICB9O1xuXG4gIHNjYWxlLm5pY2UgPSBmdW5jdGlvbihpbnRlcnZhbCkge1xuICAgIHZhciBkID0gZG9tYWluKCk7XG4gICAgaWYgKCFpbnRlcnZhbCB8fCB0eXBlb2YgaW50ZXJ2YWwucmFuZ2UgIT09IFwiZnVuY3Rpb25cIikgaW50ZXJ2YWwgPSB0aWNrSW50ZXJ2YWwoZFswXSwgZFtkLmxlbmd0aCAtIDFdLCBpbnRlcnZhbCA9PSBudWxsID8gMTAgOiBpbnRlcnZhbCk7XG4gICAgcmV0dXJuIGludGVydmFsID8gZG9tYWluKG5pY2UoZCwgaW50ZXJ2YWwpKSA6IHNjYWxlO1xuICB9O1xuXG4gIHNjYWxlLmNvcHkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gY29weShzY2FsZSwgY2FsZW5kYXIodGlja3MsIHRpY2tJbnRlcnZhbCwgeWVhciwgbW9udGgsIHdlZWssIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIGZvcm1hdCkpO1xuICB9O1xuXG4gIHJldHVybiBzY2FsZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdGltZSgpIHtcbiAgcmV0dXJuIGluaXRSYW5nZS5hcHBseShjYWxlbmRhcih0aW1lVGlja3MsIHRpbWVUaWNrSW50ZXJ2YWwsIHRpbWVZZWFyLCB0aW1lTW9udGgsIHRpbWVXZWVrLCB0aW1lRGF5LCB0aW1lSG91ciwgdGltZU1pbnV0ZSwgdGltZVNlY29uZCwgdGltZUZvcm1hdCkuZG9tYWluKFtuZXcgRGF0ZSgyMDAwLCAwLCAxKSwgbmV3IERhdGUoMjAwMCwgMCwgMildKSwgYXJndW1lbnRzKTtcbn1cbiIsCiAgICAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc3BlY2lmaWVyKSB7XG4gIHZhciBuID0gc3BlY2lmaWVyLmxlbmd0aCAvIDYgfCAwLCBjb2xvcnMgPSBuZXcgQXJyYXkobiksIGkgPSAwO1xuICB3aGlsZSAoaSA8IG4pIGNvbG9yc1tpXSA9IFwiI1wiICsgc3BlY2lmaWVyLnNsaWNlKGkgKiA2LCArK2kgKiA2KTtcbiAgcmV0dXJuIGNvbG9ycztcbn1cbiIsCiAgICAiaW1wb3J0IGNvbG9ycyBmcm9tIFwiLi4vY29sb3JzLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNvbG9ycyhcIjRlNzlhN2YyOGUyY2UxNTc1OTc2YjdiMjU5YTE0ZmVkYzk0OWFmN2FhMWZmOWRhNzljNzU1ZmJhYjBhYlwiKTtcbiIsCiAgICAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oeCkge1xuICByZXR1cm4gZnVuY3Rpb24gY29uc3RhbnQoKSB7XG4gICAgcmV0dXJuIHg7XG4gIH07XG59XG4iLAogICAgImV4cG9ydCBjb25zdCBhYnMgPSBNYXRoLmFicztcbmV4cG9ydCBjb25zdCBhdGFuMiA9IE1hdGguYXRhbjI7XG5leHBvcnQgY29uc3QgY29zID0gTWF0aC5jb3M7XG5leHBvcnQgY29uc3QgbWF4ID0gTWF0aC5tYXg7XG5leHBvcnQgY29uc3QgbWluID0gTWF0aC5taW47XG5leHBvcnQgY29uc3Qgc2luID0gTWF0aC5zaW47XG5leHBvcnQgY29uc3Qgc3FydCA9IE1hdGguc3FydDtcblxuZXhwb3J0IGNvbnN0IGVwc2lsb24gPSAxZS0xMjtcbmV4cG9ydCBjb25zdCBwaSA9IE1hdGguUEk7XG5leHBvcnQgY29uc3QgaGFsZlBpID0gcGkgLyAyO1xuZXhwb3J0IGNvbnN0IHRhdSA9IDIgKiBwaTtcblxuZXhwb3J0IGZ1bmN0aW9uIGFjb3MoeCkge1xuICByZXR1cm4geCA+IDEgPyAwIDogeCA8IC0xID8gcGkgOiBNYXRoLmFjb3MoeCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc2luKHgpIHtcbiAgcmV0dXJuIHggPj0gMSA/IGhhbGZQaSA6IHggPD0gLTEgPyAtaGFsZlBpIDogTWF0aC5hc2luKHgpO1xufVxuIiwKICAgICJjb25zdCBwaSA9IE1hdGguUEksXG4gICAgdGF1ID0gMiAqIHBpLFxuICAgIGVwc2lsb24gPSAxZS02LFxuICAgIHRhdUVwc2lsb24gPSB0YXUgLSBlcHNpbG9uO1xuXG5mdW5jdGlvbiBhcHBlbmQoc3RyaW5ncykge1xuICB0aGlzLl8gKz0gc3RyaW5nc1swXTtcbiAgZm9yIChsZXQgaSA9IDEsIG4gPSBzdHJpbmdzLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgIHRoaXMuXyArPSBhcmd1bWVudHNbaV0gKyBzdHJpbmdzW2ldO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFwcGVuZFJvdW5kKGRpZ2l0cykge1xuICBsZXQgZCA9IE1hdGguZmxvb3IoZGlnaXRzKTtcbiAgaWYgKCEoZCA+PSAwKSkgdGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIGRpZ2l0czogJHtkaWdpdHN9YCk7XG4gIGlmIChkID4gMTUpIHJldHVybiBhcHBlbmQ7XG4gIGNvbnN0IGsgPSAxMCAqKiBkO1xuICByZXR1cm4gZnVuY3Rpb24oc3RyaW5ncykge1xuICAgIHRoaXMuXyArPSBzdHJpbmdzWzBdO1xuICAgIGZvciAobGV0IGkgPSAxLCBuID0gc3RyaW5ncy5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICAgIHRoaXMuXyArPSBNYXRoLnJvdW5kKGFyZ3VtZW50c1tpXSAqIGspIC8gayArIHN0cmluZ3NbaV07XG4gICAgfVxuICB9O1xufVxuXG5leHBvcnQgY2xhc3MgUGF0aCB7XG4gIGNvbnN0cnVjdG9yKGRpZ2l0cykge1xuICAgIHRoaXMuX3gwID0gdGhpcy5feTAgPSAvLyBzdGFydCBvZiBjdXJyZW50IHN1YnBhdGhcbiAgICB0aGlzLl94MSA9IHRoaXMuX3kxID0gbnVsbDsgLy8gZW5kIG9mIGN1cnJlbnQgc3VicGF0aFxuICAgIHRoaXMuXyA9IFwiXCI7XG4gICAgdGhpcy5fYXBwZW5kID0gZGlnaXRzID09IG51bGwgPyBhcHBlbmQgOiBhcHBlbmRSb3VuZChkaWdpdHMpO1xuICB9XG4gIG1vdmVUbyh4LCB5KSB7XG4gICAgdGhpcy5fYXBwZW5kYE0ke3RoaXMuX3gwID0gdGhpcy5feDEgPSAreH0sJHt0aGlzLl95MCA9IHRoaXMuX3kxID0gK3l9YDtcbiAgfVxuICBjbG9zZVBhdGgoKSB7XG4gICAgaWYgKHRoaXMuX3gxICE9PSBudWxsKSB7XG4gICAgICB0aGlzLl94MSA9IHRoaXMuX3gwLCB0aGlzLl95MSA9IHRoaXMuX3kwO1xuICAgICAgdGhpcy5fYXBwZW5kYFpgO1xuICAgIH1cbiAgfVxuICBsaW5lVG8oeCwgeSkge1xuICAgIHRoaXMuX2FwcGVuZGBMJHt0aGlzLl94MSA9ICt4fSwke3RoaXMuX3kxID0gK3l9YDtcbiAgfVxuICBxdWFkcmF0aWNDdXJ2ZVRvKHgxLCB5MSwgeCwgeSkge1xuICAgIHRoaXMuX2FwcGVuZGBRJHsreDF9LCR7K3kxfSwke3RoaXMuX3gxID0gK3h9LCR7dGhpcy5feTEgPSAreX1gO1xuICB9XG4gIGJlemllckN1cnZlVG8oeDEsIHkxLCB4MiwgeTIsIHgsIHkpIHtcbiAgICB0aGlzLl9hcHBlbmRgQyR7K3gxfSwkeyt5MX0sJHsreDJ9LCR7K3kyfSwke3RoaXMuX3gxID0gK3h9LCR7dGhpcy5feTEgPSAreX1gO1xuICB9XG4gIGFyY1RvKHgxLCB5MSwgeDIsIHkyLCByKSB7XG4gICAgeDEgPSAreDEsIHkxID0gK3kxLCB4MiA9ICt4MiwgeTIgPSAreTIsIHIgPSArcjtcblxuICAgIC8vIElzIHRoZSByYWRpdXMgbmVnYXRpdmU/IEVycm9yLlxuICAgIGlmIChyIDwgMCkgdGhyb3cgbmV3IEVycm9yKGBuZWdhdGl2ZSByYWRpdXM6ICR7cn1gKTtcblxuICAgIGxldCB4MCA9IHRoaXMuX3gxLFxuICAgICAgICB5MCA9IHRoaXMuX3kxLFxuICAgICAgICB4MjEgPSB4MiAtIHgxLFxuICAgICAgICB5MjEgPSB5MiAtIHkxLFxuICAgICAgICB4MDEgPSB4MCAtIHgxLFxuICAgICAgICB5MDEgPSB5MCAtIHkxLFxuICAgICAgICBsMDFfMiA9IHgwMSAqIHgwMSArIHkwMSAqIHkwMTtcblxuICAgIC8vIElzIHRoaXMgcGF0aCBlbXB0eT8gTW92ZSB0byAoeDEseTEpLlxuICAgIGlmICh0aGlzLl94MSA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5fYXBwZW5kYE0ke3RoaXMuX3gxID0geDF9LCR7dGhpcy5feTEgPSB5MX1gO1xuICAgIH1cblxuICAgIC8vIE9yLCBpcyAoeDEseTEpIGNvaW5jaWRlbnQgd2l0aCAoeDAseTApPyBEbyBub3RoaW5nLlxuICAgIGVsc2UgaWYgKCEobDAxXzIgPiBlcHNpbG9uKSk7XG5cbiAgICAvLyBPciwgYXJlICh4MCx5MCksICh4MSx5MSkgYW5kICh4Mix5MikgY29sbGluZWFyP1xuICAgIC8vIEVxdWl2YWxlbnRseSwgaXMgKHgxLHkxKSBjb2luY2lkZW50IHdpdGggKHgyLHkyKT9cbiAgICAvLyBPciwgaXMgdGhlIHJhZGl1cyB6ZXJvPyBMaW5lIHRvICh4MSx5MSkuXG4gICAgZWxzZSBpZiAoIShNYXRoLmFicyh5MDEgKiB4MjEgLSB5MjEgKiB4MDEpID4gZXBzaWxvbikgfHwgIXIpIHtcbiAgICAgIHRoaXMuX2FwcGVuZGBMJHt0aGlzLl94MSA9IHgxfSwke3RoaXMuX3kxID0geTF9YDtcbiAgICB9XG5cbiAgICAvLyBPdGhlcndpc2UsIGRyYXcgYW4gYXJjIVxuICAgIGVsc2Uge1xuICAgICAgbGV0IHgyMCA9IHgyIC0geDAsXG4gICAgICAgICAgeTIwID0geTIgLSB5MCxcbiAgICAgICAgICBsMjFfMiA9IHgyMSAqIHgyMSArIHkyMSAqIHkyMSxcbiAgICAgICAgICBsMjBfMiA9IHgyMCAqIHgyMCArIHkyMCAqIHkyMCxcbiAgICAgICAgICBsMjEgPSBNYXRoLnNxcnQobDIxXzIpLFxuICAgICAgICAgIGwwMSA9IE1hdGguc3FydChsMDFfMiksXG4gICAgICAgICAgbCA9IHIgKiBNYXRoLnRhbigocGkgLSBNYXRoLmFjb3MoKGwyMV8yICsgbDAxXzIgLSBsMjBfMikgLyAoMiAqIGwyMSAqIGwwMSkpKSAvIDIpLFxuICAgICAgICAgIHQwMSA9IGwgLyBsMDEsXG4gICAgICAgICAgdDIxID0gbCAvIGwyMTtcblxuICAgICAgLy8gSWYgdGhlIHN0YXJ0IHRhbmdlbnQgaXMgbm90IGNvaW5jaWRlbnQgd2l0aCAoeDAseTApLCBsaW5lIHRvLlxuICAgICAgaWYgKE1hdGguYWJzKHQwMSAtIDEpID4gZXBzaWxvbikge1xuICAgICAgICB0aGlzLl9hcHBlbmRgTCR7eDEgKyB0MDEgKiB4MDF9LCR7eTEgKyB0MDEgKiB5MDF9YDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fYXBwZW5kYEEke3J9LCR7cn0sMCwwLCR7Kyh5MDEgKiB4MjAgPiB4MDEgKiB5MjApfSwke3RoaXMuX3gxID0geDEgKyB0MjEgKiB4MjF9LCR7dGhpcy5feTEgPSB5MSArIHQyMSAqIHkyMX1gO1xuICAgIH1cbiAgfVxuICBhcmMoeCwgeSwgciwgYTAsIGExLCBjY3cpIHtcbiAgICB4ID0gK3gsIHkgPSAreSwgciA9ICtyLCBjY3cgPSAhIWNjdztcblxuICAgIC8vIElzIHRoZSByYWRpdXMgbmVnYXRpdmU/IEVycm9yLlxuICAgIGlmIChyIDwgMCkgdGhyb3cgbmV3IEVycm9yKGBuZWdhdGl2ZSByYWRpdXM6ICR7cn1gKTtcblxuICAgIGxldCBkeCA9IHIgKiBNYXRoLmNvcyhhMCksXG4gICAgICAgIGR5ID0gciAqIE1hdGguc2luKGEwKSxcbiAgICAgICAgeDAgPSB4ICsgZHgsXG4gICAgICAgIHkwID0geSArIGR5LFxuICAgICAgICBjdyA9IDEgXiBjY3csXG4gICAgICAgIGRhID0gY2N3ID8gYTAgLSBhMSA6IGExIC0gYTA7XG5cbiAgICAvLyBJcyB0aGlzIHBhdGggZW1wdHk/IE1vdmUgdG8gKHgwLHkwKS5cbiAgICBpZiAodGhpcy5feDEgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuX2FwcGVuZGBNJHt4MH0sJHt5MH1gO1xuICAgIH1cblxuICAgIC8vIE9yLCBpcyAoeDAseTApIG5vdCBjb2luY2lkZW50IHdpdGggdGhlIHByZXZpb3VzIHBvaW50PyBMaW5lIHRvICh4MCx5MCkuXG4gICAgZWxzZSBpZiAoTWF0aC5hYnModGhpcy5feDEgLSB4MCkgPiBlcHNpbG9uIHx8IE1hdGguYWJzKHRoaXMuX3kxIC0geTApID4gZXBzaWxvbikge1xuICAgICAgdGhpcy5fYXBwZW5kYEwke3gwfSwke3kwfWA7XG4gICAgfVxuXG4gICAgLy8gSXMgdGhpcyBhcmMgZW1wdHk/IFdl4oCZcmUgZG9uZS5cbiAgICBpZiAoIXIpIHJldHVybjtcblxuICAgIC8vIERvZXMgdGhlIGFuZ2xlIGdvIHRoZSB3cm9uZyB3YXk/IEZsaXAgdGhlIGRpcmVjdGlvbi5cbiAgICBpZiAoZGEgPCAwKSBkYSA9IGRhICUgdGF1ICsgdGF1O1xuXG4gICAgLy8gSXMgdGhpcyBhIGNvbXBsZXRlIGNpcmNsZT8gRHJhdyB0d28gYXJjcyB0byBjb21wbGV0ZSB0aGUgY2lyY2xlLlxuICAgIGlmIChkYSA+IHRhdUVwc2lsb24pIHtcbiAgICAgIHRoaXMuX2FwcGVuZGBBJHtyfSwke3J9LDAsMSwke2N3fSwke3ggLSBkeH0sJHt5IC0gZHl9QSR7cn0sJHtyfSwwLDEsJHtjd30sJHt0aGlzLl94MSA9IHgwfSwke3RoaXMuX3kxID0geTB9YDtcbiAgICB9XG5cbiAgICAvLyBJcyB0aGlzIGFyYyBub24tZW1wdHk/IERyYXcgYW4gYXJjIVxuICAgIGVsc2UgaWYgKGRhID4gZXBzaWxvbikge1xuICAgICAgdGhpcy5fYXBwZW5kYEEke3J9LCR7cn0sMCwkeysoZGEgPj0gcGkpfSwke2N3fSwke3RoaXMuX3gxID0geCArIHIgKiBNYXRoLmNvcyhhMSl9LCR7dGhpcy5feTEgPSB5ICsgciAqIE1hdGguc2luKGExKX1gO1xuICAgIH1cbiAgfVxuICByZWN0KHgsIHksIHcsIGgpIHtcbiAgICB0aGlzLl9hcHBlbmRgTSR7dGhpcy5feDAgPSB0aGlzLl94MSA9ICt4fSwke3RoaXMuX3kwID0gdGhpcy5feTEgPSAreX1oJHt3ID0gK3d9diR7K2h9aCR7LXd9WmA7XG4gIH1cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuXztcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGF0aCgpIHtcbiAgcmV0dXJuIG5ldyBQYXRoO1xufVxuXG4vLyBBbGxvdyBpbnN0YW5jZW9mIGQzLnBhdGhcbnBhdGgucHJvdG90eXBlID0gUGF0aC5wcm90b3R5cGU7XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXRoUm91bmQoZGlnaXRzID0gMykge1xuICByZXR1cm4gbmV3IFBhdGgoK2RpZ2l0cyk7XG59XG4iLAogICAgImltcG9ydCB7UGF0aH0gZnJvbSBcImQzLXBhdGhcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHdpdGhQYXRoKHNoYXBlKSB7XG4gIGxldCBkaWdpdHMgPSAzO1xuXG4gIHNoYXBlLmRpZ2l0cyA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBkaWdpdHM7XG4gICAgaWYgKF8gPT0gbnVsbCkge1xuICAgICAgZGlnaXRzID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZCA9IE1hdGguZmxvb3IoXyk7XG4gICAgICBpZiAoIShkID49IDApKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgaW52YWxpZCBkaWdpdHM6ICR7X31gKTtcbiAgICAgIGRpZ2l0cyA9IGQ7XG4gICAgfVxuICAgIHJldHVybiBzaGFwZTtcbiAgfTtcblxuICByZXR1cm4gKCkgPT4gbmV3IFBhdGgoZGlnaXRzKTtcbn1cbiIsCiAgICAiaW1wb3J0IGNvbnN0YW50IGZyb20gXCIuL2NvbnN0YW50LmpzXCI7XG5pbXBvcnQge2FicywgYWNvcywgYXNpbiwgYXRhbjIsIGNvcywgZXBzaWxvbiwgaGFsZlBpLCBtYXgsIG1pbiwgcGksIHNpbiwgc3FydCwgdGF1fSBmcm9tIFwiLi9tYXRoLmpzXCI7XG5pbXBvcnQge3dpdGhQYXRofSBmcm9tIFwiLi9wYXRoLmpzXCI7XG5cbmZ1bmN0aW9uIGFyY0lubmVyUmFkaXVzKGQpIHtcbiAgcmV0dXJuIGQuaW5uZXJSYWRpdXM7XG59XG5cbmZ1bmN0aW9uIGFyY091dGVyUmFkaXVzKGQpIHtcbiAgcmV0dXJuIGQub3V0ZXJSYWRpdXM7XG59XG5cbmZ1bmN0aW9uIGFyY1N0YXJ0QW5nbGUoZCkge1xuICByZXR1cm4gZC5zdGFydEFuZ2xlO1xufVxuXG5mdW5jdGlvbiBhcmNFbmRBbmdsZShkKSB7XG4gIHJldHVybiBkLmVuZEFuZ2xlO1xufVxuXG5mdW5jdGlvbiBhcmNQYWRBbmdsZShkKSB7XG4gIHJldHVybiBkICYmIGQucGFkQW5nbGU7IC8vIE5vdGU6IG9wdGlvbmFsIVxufVxuXG5mdW5jdGlvbiBpbnRlcnNlY3QoeDAsIHkwLCB4MSwgeTEsIHgyLCB5MiwgeDMsIHkzKSB7XG4gIHZhciB4MTAgPSB4MSAtIHgwLCB5MTAgPSB5MSAtIHkwLFxuICAgICAgeDMyID0geDMgLSB4MiwgeTMyID0geTMgLSB5MixcbiAgICAgIHQgPSB5MzIgKiB4MTAgLSB4MzIgKiB5MTA7XG4gIGlmICh0ICogdCA8IGVwc2lsb24pIHJldHVybjtcbiAgdCA9ICh4MzIgKiAoeTAgLSB5MikgLSB5MzIgKiAoeDAgLSB4MikpIC8gdDtcbiAgcmV0dXJuIFt4MCArIHQgKiB4MTAsIHkwICsgdCAqIHkxMF07XG59XG5cbi8vIENvbXB1dGUgcGVycGVuZGljdWxhciBvZmZzZXQgbGluZSBvZiBsZW5ndGggcmMuXG4vLyBodHRwOi8vbWF0aHdvcmxkLndvbGZyYW0uY29tL0NpcmNsZS1MaW5lSW50ZXJzZWN0aW9uLmh0bWxcbmZ1bmN0aW9uIGNvcm5lclRhbmdlbnRzKHgwLCB5MCwgeDEsIHkxLCByMSwgcmMsIGN3KSB7XG4gIHZhciB4MDEgPSB4MCAtIHgxLFxuICAgICAgeTAxID0geTAgLSB5MSxcbiAgICAgIGxvID0gKGN3ID8gcmMgOiAtcmMpIC8gc3FydCh4MDEgKiB4MDEgKyB5MDEgKiB5MDEpLFxuICAgICAgb3ggPSBsbyAqIHkwMSxcbiAgICAgIG95ID0gLWxvICogeDAxLFxuICAgICAgeDExID0geDAgKyBveCxcbiAgICAgIHkxMSA9IHkwICsgb3ksXG4gICAgICB4MTAgPSB4MSArIG94LFxuICAgICAgeTEwID0geTEgKyBveSxcbiAgICAgIHgwMCA9ICh4MTEgKyB4MTApIC8gMixcbiAgICAgIHkwMCA9ICh5MTEgKyB5MTApIC8gMixcbiAgICAgIGR4ID0geDEwIC0geDExLFxuICAgICAgZHkgPSB5MTAgLSB5MTEsXG4gICAgICBkMiA9IGR4ICogZHggKyBkeSAqIGR5LFxuICAgICAgciA9IHIxIC0gcmMsXG4gICAgICBEID0geDExICogeTEwIC0geDEwICogeTExLFxuICAgICAgZCA9IChkeSA8IDAgPyAtMSA6IDEpICogc3FydChtYXgoMCwgciAqIHIgKiBkMiAtIEQgKiBEKSksXG4gICAgICBjeDAgPSAoRCAqIGR5IC0gZHggKiBkKSAvIGQyLFxuICAgICAgY3kwID0gKC1EICogZHggLSBkeSAqIGQpIC8gZDIsXG4gICAgICBjeDEgPSAoRCAqIGR5ICsgZHggKiBkKSAvIGQyLFxuICAgICAgY3kxID0gKC1EICogZHggKyBkeSAqIGQpIC8gZDIsXG4gICAgICBkeDAgPSBjeDAgLSB4MDAsXG4gICAgICBkeTAgPSBjeTAgLSB5MDAsXG4gICAgICBkeDEgPSBjeDEgLSB4MDAsXG4gICAgICBkeTEgPSBjeTEgLSB5MDA7XG5cbiAgLy8gUGljayB0aGUgY2xvc2VyIG9mIHRoZSB0d28gaW50ZXJzZWN0aW9uIHBvaW50cy5cbiAgLy8gVE9ETyBJcyB0aGVyZSBhIGZhc3RlciB3YXkgdG8gZGV0ZXJtaW5lIHdoaWNoIGludGVyc2VjdGlvbiB0byB1c2U/XG4gIGlmIChkeDAgKiBkeDAgKyBkeTAgKiBkeTAgPiBkeDEgKiBkeDEgKyBkeTEgKiBkeTEpIGN4MCA9IGN4MSwgY3kwID0gY3kxO1xuXG4gIHJldHVybiB7XG4gICAgY3g6IGN4MCxcbiAgICBjeTogY3kwLFxuICAgIHgwMTogLW94LFxuICAgIHkwMTogLW95LFxuICAgIHgxMTogY3gwICogKHIxIC8gciAtIDEpLFxuICAgIHkxMTogY3kwICogKHIxIC8gciAtIDEpXG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgaW5uZXJSYWRpdXMgPSBhcmNJbm5lclJhZGl1cyxcbiAgICAgIG91dGVyUmFkaXVzID0gYXJjT3V0ZXJSYWRpdXMsXG4gICAgICBjb3JuZXJSYWRpdXMgPSBjb25zdGFudCgwKSxcbiAgICAgIHBhZFJhZGl1cyA9IG51bGwsXG4gICAgICBzdGFydEFuZ2xlID0gYXJjU3RhcnRBbmdsZSxcbiAgICAgIGVuZEFuZ2xlID0gYXJjRW5kQW5nbGUsXG4gICAgICBwYWRBbmdsZSA9IGFyY1BhZEFuZ2xlLFxuICAgICAgY29udGV4dCA9IG51bGwsXG4gICAgICBwYXRoID0gd2l0aFBhdGgoYXJjKTtcblxuICBmdW5jdGlvbiBhcmMoKSB7XG4gICAgdmFyIGJ1ZmZlcixcbiAgICAgICAgcixcbiAgICAgICAgcjAgPSAraW5uZXJSYWRpdXMuYXBwbHkodGhpcywgYXJndW1lbnRzKSxcbiAgICAgICAgcjEgPSArb3V0ZXJSYWRpdXMuYXBwbHkodGhpcywgYXJndW1lbnRzKSxcbiAgICAgICAgYTAgPSBzdGFydEFuZ2xlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgLSBoYWxmUGksXG4gICAgICAgIGExID0gZW5kQW5nbGUuYXBwbHkodGhpcywgYXJndW1lbnRzKSAtIGhhbGZQaSxcbiAgICAgICAgZGEgPSBhYnMoYTEgLSBhMCksXG4gICAgICAgIGN3ID0gYTEgPiBhMDtcblxuICAgIGlmICghY29udGV4dCkgY29udGV4dCA9IGJ1ZmZlciA9IHBhdGgoKTtcblxuICAgIC8vIEVuc3VyZSB0aGF0IHRoZSBvdXRlciByYWRpdXMgaXMgYWx3YXlzIGxhcmdlciB0aGFuIHRoZSBpbm5lciByYWRpdXMuXG4gICAgaWYgKHIxIDwgcjApIHIgPSByMSwgcjEgPSByMCwgcjAgPSByO1xuXG4gICAgLy8gSXMgaXQgYSBwb2ludD9cbiAgICBpZiAoIShyMSA+IGVwc2lsb24pKSBjb250ZXh0Lm1vdmVUbygwLCAwKTtcblxuICAgIC8vIE9yIGlzIGl0IGEgY2lyY2xlIG9yIGFubnVsdXM/XG4gICAgZWxzZSBpZiAoZGEgPiB0YXUgLSBlcHNpbG9uKSB7XG4gICAgICBjb250ZXh0Lm1vdmVUbyhyMSAqIGNvcyhhMCksIHIxICogc2luKGEwKSk7XG4gICAgICBjb250ZXh0LmFyYygwLCAwLCByMSwgYTAsIGExLCAhY3cpO1xuICAgICAgaWYgKHIwID4gZXBzaWxvbikge1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyhyMCAqIGNvcyhhMSksIHIwICogc2luKGExKSk7XG4gICAgICAgIGNvbnRleHQuYXJjKDAsIDAsIHIwLCBhMSwgYTAsIGN3KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBPciBpcyBpdCBhIGNpcmN1bGFyIG9yIGFubnVsYXIgc2VjdG9yP1xuICAgIGVsc2Uge1xuICAgICAgdmFyIGEwMSA9IGEwLFxuICAgICAgICAgIGExMSA9IGExLFxuICAgICAgICAgIGEwMCA9IGEwLFxuICAgICAgICAgIGExMCA9IGExLFxuICAgICAgICAgIGRhMCA9IGRhLFxuICAgICAgICAgIGRhMSA9IGRhLFxuICAgICAgICAgIGFwID0gcGFkQW5nbGUuYXBwbHkodGhpcywgYXJndW1lbnRzKSAvIDIsXG4gICAgICAgICAgcnAgPSAoYXAgPiBlcHNpbG9uKSAmJiAocGFkUmFkaXVzID8gK3BhZFJhZGl1cy5hcHBseSh0aGlzLCBhcmd1bWVudHMpIDogc3FydChyMCAqIHIwICsgcjEgKiByMSkpLFxuICAgICAgICAgIHJjID0gbWluKGFicyhyMSAtIHIwKSAvIDIsICtjb3JuZXJSYWRpdXMuYXBwbHkodGhpcywgYXJndW1lbnRzKSksXG4gICAgICAgICAgcmMwID0gcmMsXG4gICAgICAgICAgcmMxID0gcmMsXG4gICAgICAgICAgdDAsXG4gICAgICAgICAgdDE7XG5cbiAgICAgIC8vIEFwcGx5IHBhZGRpbmc/IE5vdGUgdGhhdCBzaW5jZSByMSDiiaUgcjAsIGRhMSDiiaUgZGEwLlxuICAgICAgaWYgKHJwID4gZXBzaWxvbikge1xuICAgICAgICB2YXIgcDAgPSBhc2luKHJwIC8gcjAgKiBzaW4oYXApKSxcbiAgICAgICAgICAgIHAxID0gYXNpbihycCAvIHIxICogc2luKGFwKSk7XG4gICAgICAgIGlmICgoZGEwIC09IHAwICogMikgPiBlcHNpbG9uKSBwMCAqPSAoY3cgPyAxIDogLTEpLCBhMDAgKz0gcDAsIGExMCAtPSBwMDtcbiAgICAgICAgZWxzZSBkYTAgPSAwLCBhMDAgPSBhMTAgPSAoYTAgKyBhMSkgLyAyO1xuICAgICAgICBpZiAoKGRhMSAtPSBwMSAqIDIpID4gZXBzaWxvbikgcDEgKj0gKGN3ID8gMSA6IC0xKSwgYTAxICs9IHAxLCBhMTEgLT0gcDE7XG4gICAgICAgIGVsc2UgZGExID0gMCwgYTAxID0gYTExID0gKGEwICsgYTEpIC8gMjtcbiAgICAgIH1cblxuICAgICAgdmFyIHgwMSA9IHIxICogY29zKGEwMSksXG4gICAgICAgICAgeTAxID0gcjEgKiBzaW4oYTAxKSxcbiAgICAgICAgICB4MTAgPSByMCAqIGNvcyhhMTApLFxuICAgICAgICAgIHkxMCA9IHIwICogc2luKGExMCk7XG5cbiAgICAgIC8vIEFwcGx5IHJvdW5kZWQgY29ybmVycz9cbiAgICAgIGlmIChyYyA+IGVwc2lsb24pIHtcbiAgICAgICAgdmFyIHgxMSA9IHIxICogY29zKGExMSksXG4gICAgICAgICAgICB5MTEgPSByMSAqIHNpbihhMTEpLFxuICAgICAgICAgICAgeDAwID0gcjAgKiBjb3MoYTAwKSxcbiAgICAgICAgICAgIHkwMCA9IHIwICogc2luKGEwMCksXG4gICAgICAgICAgICBvYztcblxuICAgICAgICAvLyBSZXN0cmljdCB0aGUgY29ybmVyIHJhZGl1cyBhY2NvcmRpbmcgdG8gdGhlIHNlY3RvciBhbmdsZS4gSWYgdGhpc1xuICAgICAgICAvLyBpbnRlcnNlY3Rpb24gZmFpbHMsIGl04oCZcyBwcm9iYWJseSBiZWNhdXNlIHRoZSBhcmMgaXMgdG9vIHNtYWxsLCBzb1xuICAgICAgICAvLyBkaXNhYmxlIHRoZSBjb3JuZXIgcmFkaXVzIGVudGlyZWx5LlxuICAgICAgICBpZiAoZGEgPCBwaSkge1xuICAgICAgICAgIGlmIChvYyA9IGludGVyc2VjdCh4MDEsIHkwMSwgeDAwLCB5MDAsIHgxMSwgeTExLCB4MTAsIHkxMCkpIHtcbiAgICAgICAgICAgIHZhciBheCA9IHgwMSAtIG9jWzBdLFxuICAgICAgICAgICAgICAgIGF5ID0geTAxIC0gb2NbMV0sXG4gICAgICAgICAgICAgICAgYnggPSB4MTEgLSBvY1swXSxcbiAgICAgICAgICAgICAgICBieSA9IHkxMSAtIG9jWzFdLFxuICAgICAgICAgICAgICAgIGtjID0gMSAvIHNpbihhY29zKChheCAqIGJ4ICsgYXkgKiBieSkgLyAoc3FydChheCAqIGF4ICsgYXkgKiBheSkgKiBzcXJ0KGJ4ICogYnggKyBieSAqIGJ5KSkpIC8gMiksXG4gICAgICAgICAgICAgICAgbGMgPSBzcXJ0KG9jWzBdICogb2NbMF0gKyBvY1sxXSAqIG9jWzFdKTtcbiAgICAgICAgICAgIHJjMCA9IG1pbihyYywgKHIwIC0gbGMpIC8gKGtjIC0gMSkpO1xuICAgICAgICAgICAgcmMxID0gbWluKHJjLCAocjEgLSBsYykgLyAoa2MgKyAxKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJjMCA9IHJjMSA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIElzIHRoZSBzZWN0b3IgY29sbGFwc2VkIHRvIGEgbGluZT9cbiAgICAgIGlmICghKGRhMSA+IGVwc2lsb24pKSBjb250ZXh0Lm1vdmVUbyh4MDEsIHkwMSk7XG5cbiAgICAgIC8vIERvZXMgdGhlIHNlY3RvcuKAmXMgb3V0ZXIgcmluZyBoYXZlIHJvdW5kZWQgY29ybmVycz9cbiAgICAgIGVsc2UgaWYgKHJjMSA+IGVwc2lsb24pIHtcbiAgICAgICAgdDAgPSBjb3JuZXJUYW5nZW50cyh4MDAsIHkwMCwgeDAxLCB5MDEsIHIxLCByYzEsIGN3KTtcbiAgICAgICAgdDEgPSBjb3JuZXJUYW5nZW50cyh4MTEsIHkxMSwgeDEwLCB5MTAsIHIxLCByYzEsIGN3KTtcblxuICAgICAgICBjb250ZXh0Lm1vdmVUbyh0MC5jeCArIHQwLngwMSwgdDAuY3kgKyB0MC55MDEpO1xuXG4gICAgICAgIC8vIEhhdmUgdGhlIGNvcm5lcnMgbWVyZ2VkP1xuICAgICAgICBpZiAocmMxIDwgcmMpIGNvbnRleHQuYXJjKHQwLmN4LCB0MC5jeSwgcmMxLCBhdGFuMih0MC55MDEsIHQwLngwMSksIGF0YW4yKHQxLnkwMSwgdDEueDAxKSwgIWN3KTtcblxuICAgICAgICAvLyBPdGhlcndpc2UsIGRyYXcgdGhlIHR3byBjb3JuZXJzIGFuZCB0aGUgcmluZy5cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgY29udGV4dC5hcmModDAuY3gsIHQwLmN5LCByYzEsIGF0YW4yKHQwLnkwMSwgdDAueDAxKSwgYXRhbjIodDAueTExLCB0MC54MTEpLCAhY3cpO1xuICAgICAgICAgIGNvbnRleHQuYXJjKDAsIDAsIHIxLCBhdGFuMih0MC5jeSArIHQwLnkxMSwgdDAuY3ggKyB0MC54MTEpLCBhdGFuMih0MS5jeSArIHQxLnkxMSwgdDEuY3ggKyB0MS54MTEpLCAhY3cpO1xuICAgICAgICAgIGNvbnRleHQuYXJjKHQxLmN4LCB0MS5jeSwgcmMxLCBhdGFuMih0MS55MTEsIHQxLngxMSksIGF0YW4yKHQxLnkwMSwgdDEueDAxKSwgIWN3KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBPciBpcyB0aGUgb3V0ZXIgcmluZyBqdXN0IGEgY2lyY3VsYXIgYXJjP1xuICAgICAgZWxzZSBjb250ZXh0Lm1vdmVUbyh4MDEsIHkwMSksIGNvbnRleHQuYXJjKDAsIDAsIHIxLCBhMDEsIGExMSwgIWN3KTtcblxuICAgICAgLy8gSXMgdGhlcmUgbm8gaW5uZXIgcmluZywgYW5kIGl04oCZcyBhIGNpcmN1bGFyIHNlY3Rvcj9cbiAgICAgIC8vIE9yIHBlcmhhcHMgaXTigJlzIGFuIGFubnVsYXIgc2VjdG9yIGNvbGxhcHNlZCBkdWUgdG8gcGFkZGluZz9cbiAgICAgIGlmICghKHIwID4gZXBzaWxvbikgfHwgIShkYTAgPiBlcHNpbG9uKSkgY29udGV4dC5saW5lVG8oeDEwLCB5MTApO1xuXG4gICAgICAvLyBEb2VzIHRoZSBzZWN0b3LigJlzIGlubmVyIHJpbmcgKG9yIHBvaW50KSBoYXZlIHJvdW5kZWQgY29ybmVycz9cbiAgICAgIGVsc2UgaWYgKHJjMCA+IGVwc2lsb24pIHtcbiAgICAgICAgdDAgPSBjb3JuZXJUYW5nZW50cyh4MTAsIHkxMCwgeDExLCB5MTEsIHIwLCAtcmMwLCBjdyk7XG4gICAgICAgIHQxID0gY29ybmVyVGFuZ2VudHMoeDAxLCB5MDEsIHgwMCwgeTAwLCByMCwgLXJjMCwgY3cpO1xuXG4gICAgICAgIGNvbnRleHQubGluZVRvKHQwLmN4ICsgdDAueDAxLCB0MC5jeSArIHQwLnkwMSk7XG5cbiAgICAgICAgLy8gSGF2ZSB0aGUgY29ybmVycyBtZXJnZWQ/XG4gICAgICAgIGlmIChyYzAgPCByYykgY29udGV4dC5hcmModDAuY3gsIHQwLmN5LCByYzAsIGF0YW4yKHQwLnkwMSwgdDAueDAxKSwgYXRhbjIodDEueTAxLCB0MS54MDEpLCAhY3cpO1xuXG4gICAgICAgIC8vIE90aGVyd2lzZSwgZHJhdyB0aGUgdHdvIGNvcm5lcnMgYW5kIHRoZSByaW5nLlxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBjb250ZXh0LmFyYyh0MC5jeCwgdDAuY3ksIHJjMCwgYXRhbjIodDAueTAxLCB0MC54MDEpLCBhdGFuMih0MC55MTEsIHQwLngxMSksICFjdyk7XG4gICAgICAgICAgY29udGV4dC5hcmMoMCwgMCwgcjAsIGF0YW4yKHQwLmN5ICsgdDAueTExLCB0MC5jeCArIHQwLngxMSksIGF0YW4yKHQxLmN5ICsgdDEueTExLCB0MS5jeCArIHQxLngxMSksIGN3KTtcbiAgICAgICAgICBjb250ZXh0LmFyYyh0MS5jeCwgdDEuY3ksIHJjMCwgYXRhbjIodDEueTExLCB0MS54MTEpLCBhdGFuMih0MS55MDEsIHQxLngwMSksICFjdyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gT3IgaXMgdGhlIGlubmVyIHJpbmcganVzdCBhIGNpcmN1bGFyIGFyYz9cbiAgICAgIGVsc2UgY29udGV4dC5hcmMoMCwgMCwgcjAsIGExMCwgYTAwLCBjdyk7XG4gICAgfVxuXG4gICAgY29udGV4dC5jbG9zZVBhdGgoKTtcblxuICAgIGlmIChidWZmZXIpIHJldHVybiBjb250ZXh0ID0gbnVsbCwgYnVmZmVyICsgXCJcIiB8fCBudWxsO1xuICB9XG5cbiAgYXJjLmNlbnRyb2lkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHIgPSAoK2lubmVyUmFkaXVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgKyArb3V0ZXJSYWRpdXMuYXBwbHkodGhpcywgYXJndW1lbnRzKSkgLyAyLFxuICAgICAgICBhID0gKCtzdGFydEFuZ2xlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgKyArZW5kQW5nbGUuYXBwbHkodGhpcywgYXJndW1lbnRzKSkgLyAyIC0gcGkgLyAyO1xuICAgIHJldHVybiBbY29zKGEpICogciwgc2luKGEpICogcl07XG4gIH07XG5cbiAgYXJjLmlubmVyUmFkaXVzID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGlubmVyUmFkaXVzID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCgrXyksIGFyYykgOiBpbm5lclJhZGl1cztcbiAgfTtcblxuICBhcmMub3V0ZXJSYWRpdXMgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAob3V0ZXJSYWRpdXMgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCtfKSwgYXJjKSA6IG91dGVyUmFkaXVzO1xuICB9O1xuXG4gIGFyYy5jb3JuZXJSYWRpdXMgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoY29ybmVyUmFkaXVzID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCgrXyksIGFyYykgOiBjb3JuZXJSYWRpdXM7XG4gIH07XG5cbiAgYXJjLnBhZFJhZGl1cyA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChwYWRSYWRpdXMgPSBfID09IG51bGwgPyBudWxsIDogdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCgrXyksIGFyYykgOiBwYWRSYWRpdXM7XG4gIH07XG5cbiAgYXJjLnN0YXJ0QW5nbGUgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoc3RhcnRBbmdsZSA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoK18pLCBhcmMpIDogc3RhcnRBbmdsZTtcbiAgfTtcblxuICBhcmMuZW5kQW5nbGUgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoZW5kQW5nbGUgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCtfKSwgYXJjKSA6IGVuZEFuZ2xlO1xuICB9O1xuXG4gIGFyYy5wYWRBbmdsZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChwYWRBbmdsZSA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoK18pLCBhcmMpIDogcGFkQW5nbGU7XG4gIH07XG5cbiAgYXJjLmNvbnRleHQgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoKGNvbnRleHQgPSBfID09IG51bGwgPyBudWxsIDogXyksIGFyYykgOiBjb250ZXh0O1xuICB9O1xuXG4gIHJldHVybiBhcmM7XG59XG4iLAogICAgImV4cG9ydCB2YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIHR5cGVvZiB4ID09PSBcIm9iamVjdFwiICYmIFwibGVuZ3RoXCIgaW4geFxuICAgID8geCAvLyBBcnJheSwgVHlwZWRBcnJheSwgTm9kZUxpc3QsIGFycmF5LWxpa2VcbiAgICA6IEFycmF5LmZyb20oeCk7IC8vIE1hcCwgU2V0LCBpdGVyYWJsZSwgc3RyaW5nLCBvciBhbnl0aGluZyBlbHNlXG59XG4iLAogICAgImZ1bmN0aW9uIExpbmVhcihjb250ZXh0KSB7XG4gIHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xufVxuXG5MaW5lYXIucHJvdG90eXBlID0ge1xuICBhcmVhU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2xpbmUgPSAwO1xuICB9LFxuICBhcmVhRW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9saW5lID0gTmFOO1xuICB9LFxuICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3BvaW50ID0gMDtcbiAgfSxcbiAgbGluZUVuZDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX2xpbmUgfHwgKHRoaXMuX2xpbmUgIT09IDAgJiYgdGhpcy5fcG9pbnQgPT09IDEpKSB0aGlzLl9jb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgIHRoaXMuX2xpbmUgPSAxIC0gdGhpcy5fbGluZTtcbiAgfSxcbiAgcG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICB4ID0gK3gsIHkgPSAreTtcbiAgICBzd2l0Y2ggKHRoaXMuX3BvaW50KSB7XG4gICAgICBjYXNlIDA6IHRoaXMuX3BvaW50ID0gMTsgdGhpcy5fbGluZSA/IHRoaXMuX2NvbnRleHQubGluZVRvKHgsIHkpIDogdGhpcy5fY29udGV4dC5tb3ZlVG8oeCwgeSk7IGJyZWFrO1xuICAgICAgY2FzZSAxOiB0aGlzLl9wb2ludCA9IDI7IC8vIGZhbGxzIHRocm91Z2hcbiAgICAgIGRlZmF1bHQ6IHRoaXMuX2NvbnRleHQubGluZVRvKHgsIHkpOyBicmVhaztcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgcmV0dXJuIG5ldyBMaW5lYXIoY29udGV4dCk7XG59XG4iLAogICAgImV4cG9ydCBmdW5jdGlvbiB4KHApIHtcbiAgcmV0dXJuIHBbMF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB5KHApIHtcbiAgcmV0dXJuIHBbMV07XG59XG4iLAogICAgImltcG9ydCBhcnJheSBmcm9tIFwiLi9hcnJheS5qc1wiO1xuaW1wb3J0IGNvbnN0YW50IGZyb20gXCIuL2NvbnN0YW50LmpzXCI7XG5pbXBvcnQgY3VydmVMaW5lYXIgZnJvbSBcIi4vY3VydmUvbGluZWFyLmpzXCI7XG5pbXBvcnQge3dpdGhQYXRofSBmcm9tIFwiLi9wYXRoLmpzXCI7XG5pbXBvcnQge3ggYXMgcG9pbnRYLCB5IGFzIHBvaW50WX0gZnJvbSBcIi4vcG9pbnQuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oeCwgeSkge1xuICB2YXIgZGVmaW5lZCA9IGNvbnN0YW50KHRydWUpLFxuICAgICAgY29udGV4dCA9IG51bGwsXG4gICAgICBjdXJ2ZSA9IGN1cnZlTGluZWFyLFxuICAgICAgb3V0cHV0ID0gbnVsbCxcbiAgICAgIHBhdGggPSB3aXRoUGF0aChsaW5lKTtcblxuICB4ID0gdHlwZW9mIHggPT09IFwiZnVuY3Rpb25cIiA/IHggOiAoeCA9PT0gdW5kZWZpbmVkKSA/IHBvaW50WCA6IGNvbnN0YW50KHgpO1xuICB5ID0gdHlwZW9mIHkgPT09IFwiZnVuY3Rpb25cIiA/IHkgOiAoeSA9PT0gdW5kZWZpbmVkKSA/IHBvaW50WSA6IGNvbnN0YW50KHkpO1xuXG4gIGZ1bmN0aW9uIGxpbmUoZGF0YSkge1xuICAgIHZhciBpLFxuICAgICAgICBuID0gKGRhdGEgPSBhcnJheShkYXRhKSkubGVuZ3RoLFxuICAgICAgICBkLFxuICAgICAgICBkZWZpbmVkMCA9IGZhbHNlLFxuICAgICAgICBidWZmZXI7XG5cbiAgICBpZiAoY29udGV4dCA9PSBudWxsKSBvdXRwdXQgPSBjdXJ2ZShidWZmZXIgPSBwYXRoKCkpO1xuXG4gICAgZm9yIChpID0gMDsgaSA8PSBuOyArK2kpIHtcbiAgICAgIGlmICghKGkgPCBuICYmIGRlZmluZWQoZCA9IGRhdGFbaV0sIGksIGRhdGEpKSA9PT0gZGVmaW5lZDApIHtcbiAgICAgICAgaWYgKGRlZmluZWQwID0gIWRlZmluZWQwKSBvdXRwdXQubGluZVN0YXJ0KCk7XG4gICAgICAgIGVsc2Ugb3V0cHV0LmxpbmVFbmQoKTtcbiAgICAgIH1cbiAgICAgIGlmIChkZWZpbmVkMCkgb3V0cHV0LnBvaW50KCt4KGQsIGksIGRhdGEpLCAreShkLCBpLCBkYXRhKSk7XG4gICAgfVxuXG4gICAgaWYgKGJ1ZmZlcikgcmV0dXJuIG91dHB1dCA9IG51bGwsIGJ1ZmZlciArIFwiXCIgfHwgbnVsbDtcbiAgfVxuXG4gIGxpbmUueCA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh4ID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCgrXyksIGxpbmUpIDogeDtcbiAgfTtcblxuICBsaW5lLnkgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoeSA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoK18pLCBsaW5lKSA6IHk7XG4gIH07XG5cbiAgbGluZS5kZWZpbmVkID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGRlZmluZWQgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCEhXyksIGxpbmUpIDogZGVmaW5lZDtcbiAgfTtcblxuICBsaW5lLmN1cnZlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGN1cnZlID0gXywgY29udGV4dCAhPSBudWxsICYmIChvdXRwdXQgPSBjdXJ2ZShjb250ZXh0KSksIGxpbmUpIDogY3VydmU7XG4gIH07XG5cbiAgbGluZS5jb250ZXh0ID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKF8gPT0gbnVsbCA/IGNvbnRleHQgPSBvdXRwdXQgPSBudWxsIDogb3V0cHV0ID0gY3VydmUoY29udGV4dCA9IF8pLCBsaW5lKSA6IGNvbnRleHQ7XG4gIH07XG5cbiAgcmV0dXJuIGxpbmU7XG59XG4iLAogICAgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIGIgPCBhID8gLTEgOiBiID4gYSA/IDEgOiBiID49IGEgPyAwIDogTmFOO1xufVxuIiwKICAgICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihkKSB7XG4gIHJldHVybiBkO1xufVxuIiwKICAgICJpbXBvcnQgYXJyYXkgZnJvbSBcIi4vYXJyYXkuanNcIjtcbmltcG9ydCBjb25zdGFudCBmcm9tIFwiLi9jb25zdGFudC5qc1wiO1xuaW1wb3J0IGRlc2NlbmRpbmcgZnJvbSBcIi4vZGVzY2VuZGluZy5qc1wiO1xuaW1wb3J0IGlkZW50aXR5IGZyb20gXCIuL2lkZW50aXR5LmpzXCI7XG5pbXBvcnQge3RhdX0gZnJvbSBcIi4vbWF0aC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIHZhbHVlID0gaWRlbnRpdHksXG4gICAgICBzb3J0VmFsdWVzID0gZGVzY2VuZGluZyxcbiAgICAgIHNvcnQgPSBudWxsLFxuICAgICAgc3RhcnRBbmdsZSA9IGNvbnN0YW50KDApLFxuICAgICAgZW5kQW5nbGUgPSBjb25zdGFudCh0YXUpLFxuICAgICAgcGFkQW5nbGUgPSBjb25zdGFudCgwKTtcblxuICBmdW5jdGlvbiBwaWUoZGF0YSkge1xuICAgIHZhciBpLFxuICAgICAgICBuID0gKGRhdGEgPSBhcnJheShkYXRhKSkubGVuZ3RoLFxuICAgICAgICBqLFxuICAgICAgICBrLFxuICAgICAgICBzdW0gPSAwLFxuICAgICAgICBpbmRleCA9IG5ldyBBcnJheShuKSxcbiAgICAgICAgYXJjcyA9IG5ldyBBcnJheShuKSxcbiAgICAgICAgYTAgPSArc3RhcnRBbmdsZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpLFxuICAgICAgICBkYSA9IE1hdGgubWluKHRhdSwgTWF0aC5tYXgoLXRhdSwgZW5kQW5nbGUuYXBwbHkodGhpcywgYXJndW1lbnRzKSAtIGEwKSksXG4gICAgICAgIGExLFxuICAgICAgICBwID0gTWF0aC5taW4oTWF0aC5hYnMoZGEpIC8gbiwgcGFkQW5nbGUuYXBwbHkodGhpcywgYXJndW1lbnRzKSksXG4gICAgICAgIHBhID0gcCAqIChkYSA8IDAgPyAtMSA6IDEpLFxuICAgICAgICB2O1xuXG4gICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKCh2ID0gYXJjc1tpbmRleFtpXSA9IGldID0gK3ZhbHVlKGRhdGFbaV0sIGksIGRhdGEpKSA+IDApIHtcbiAgICAgICAgc3VtICs9IHY7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gT3B0aW9uYWxseSBzb3J0IHRoZSBhcmNzIGJ5IHByZXZpb3VzbHktY29tcHV0ZWQgdmFsdWVzIG9yIGJ5IGRhdGEuXG4gICAgaWYgKHNvcnRWYWx1ZXMgIT0gbnVsbCkgaW5kZXguc29ydChmdW5jdGlvbihpLCBqKSB7IHJldHVybiBzb3J0VmFsdWVzKGFyY3NbaV0sIGFyY3Nbal0pOyB9KTtcbiAgICBlbHNlIGlmIChzb3J0ICE9IG51bGwpIGluZGV4LnNvcnQoZnVuY3Rpb24oaSwgaikgeyByZXR1cm4gc29ydChkYXRhW2ldLCBkYXRhW2pdKTsgfSk7XG5cbiAgICAvLyBDb21wdXRlIHRoZSBhcmNzISBUaGV5IGFyZSBzdG9yZWQgaW4gdGhlIG9yaWdpbmFsIGRhdGEncyBvcmRlci5cbiAgICBmb3IgKGkgPSAwLCBrID0gc3VtID8gKGRhIC0gbiAqIHBhKSAvIHN1bSA6IDA7IGkgPCBuOyArK2ksIGEwID0gYTEpIHtcbiAgICAgIGogPSBpbmRleFtpXSwgdiA9IGFyY3Nbal0sIGExID0gYTAgKyAodiA+IDAgPyB2ICogayA6IDApICsgcGEsIGFyY3Nbal0gPSB7XG4gICAgICAgIGRhdGE6IGRhdGFbal0sXG4gICAgICAgIGluZGV4OiBpLFxuICAgICAgICB2YWx1ZTogdixcbiAgICAgICAgc3RhcnRBbmdsZTogYTAsXG4gICAgICAgIGVuZEFuZ2xlOiBhMSxcbiAgICAgICAgcGFkQW5nbGU6IHBcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGFyY3M7XG4gIH1cblxuICBwaWUudmFsdWUgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAodmFsdWUgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCtfKSwgcGllKSA6IHZhbHVlO1xuICB9O1xuXG4gIHBpZS5zb3J0VmFsdWVzID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHNvcnRWYWx1ZXMgPSBfLCBzb3J0ID0gbnVsbCwgcGllKSA6IHNvcnRWYWx1ZXM7XG4gIH07XG5cbiAgcGllLnNvcnQgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoc29ydCA9IF8sIHNvcnRWYWx1ZXMgPSBudWxsLCBwaWUpIDogc29ydDtcbiAgfTtcblxuICBwaWUuc3RhcnRBbmdsZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChzdGFydEFuZ2xlID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCgrXyksIHBpZSkgOiBzdGFydEFuZ2xlO1xuICB9O1xuXG4gIHBpZS5lbmRBbmdsZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChlbmRBbmdsZSA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoK18pLCBwaWUpIDogZW5kQW5nbGU7XG4gIH07XG5cbiAgcGllLnBhZEFuZ2xlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHBhZEFuZ2xlID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCgrXyksIHBpZSkgOiBwYWRBbmdsZTtcbiAgfTtcblxuICByZXR1cm4gcGllO1xufVxuIiwKICAgICJleHBvcnQgZnVuY3Rpb24gcG9pbnQodGhhdCwgeCwgeSkge1xuICB0aGF0Ll9jb250ZXh0LmJlemllckN1cnZlVG8oXG4gICAgKDIgKiB0aGF0Ll94MCArIHRoYXQuX3gxKSAvIDMsXG4gICAgKDIgKiB0aGF0Ll95MCArIHRoYXQuX3kxKSAvIDMsXG4gICAgKHRoYXQuX3gwICsgMiAqIHRoYXQuX3gxKSAvIDMsXG4gICAgKHRoYXQuX3kwICsgMiAqIHRoYXQuX3kxKSAvIDMsXG4gICAgKHRoYXQuX3gwICsgNCAqIHRoYXQuX3gxICsgeCkgLyA2LFxuICAgICh0aGF0Ll95MCArIDQgKiB0aGF0Ll95MSArIHkpIC8gNlxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gQmFzaXMoY29udGV4dCkge1xuICB0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcbn1cblxuQmFzaXMucHJvdG90eXBlID0ge1xuICBhcmVhU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2xpbmUgPSAwO1xuICB9LFxuICBhcmVhRW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9saW5lID0gTmFOO1xuICB9LFxuICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3gwID0gdGhpcy5feDEgPVxuICAgIHRoaXMuX3kwID0gdGhpcy5feTEgPSBOYU47XG4gICAgdGhpcy5fcG9pbnQgPSAwO1xuICB9LFxuICBsaW5lRW5kOiBmdW5jdGlvbigpIHtcbiAgICBzd2l0Y2ggKHRoaXMuX3BvaW50KSB7XG4gICAgICBjYXNlIDM6IHBvaW50KHRoaXMsIHRoaXMuX3gxLCB0aGlzLl95MSk7IC8vIGZhbGxzIHRocm91Z2hcbiAgICAgIGNhc2UgMjogdGhpcy5fY29udGV4dC5saW5lVG8odGhpcy5feDEsIHRoaXMuX3kxKTsgYnJlYWs7XG4gICAgfVxuICAgIGlmICh0aGlzLl9saW5lIHx8ICh0aGlzLl9saW5lICE9PSAwICYmIHRoaXMuX3BvaW50ID09PSAxKSkgdGhpcy5fY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICB0aGlzLl9saW5lID0gMSAtIHRoaXMuX2xpbmU7XG4gIH0sXG4gIHBvaW50OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgeCA9ICt4LCB5ID0gK3k7XG4gICAgc3dpdGNoICh0aGlzLl9wb2ludCkge1xuICAgICAgY2FzZSAwOiB0aGlzLl9wb2ludCA9IDE7IHRoaXMuX2xpbmUgPyB0aGlzLl9jb250ZXh0LmxpbmVUbyh4LCB5KSA6IHRoaXMuX2NvbnRleHQubW92ZVRvKHgsIHkpOyBicmVhaztcbiAgICAgIGNhc2UgMTogdGhpcy5fcG9pbnQgPSAyOyBicmVhaztcbiAgICAgIGNhc2UgMjogdGhpcy5fcG9pbnQgPSAzOyB0aGlzLl9jb250ZXh0LmxpbmVUbygoNSAqIHRoaXMuX3gwICsgdGhpcy5feDEpIC8gNiwgKDUgKiB0aGlzLl95MCArIHRoaXMuX3kxKSAvIDYpOyAvLyBmYWxscyB0aHJvdWdoXG4gICAgICBkZWZhdWx0OiBwb2ludCh0aGlzLCB4LCB5KTsgYnJlYWs7XG4gICAgfVxuICAgIHRoaXMuX3gwID0gdGhpcy5feDEsIHRoaXMuX3gxID0geDtcbiAgICB0aGlzLl95MCA9IHRoaXMuX3kxLCB0aGlzLl95MSA9IHk7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgcmV0dXJuIG5ldyBCYXNpcyhjb250ZXh0KTtcbn1cbiIsCiAgICAiaW1wb3J0IHBvaW50UmFkaWFsIGZyb20gXCIuLi9wb2ludFJhZGlhbC5qc1wiO1xuXG5jbGFzcyBCdW1wIHtcbiAgY29uc3RydWN0b3IoY29udGV4dCwgeCkge1xuICAgIHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xuICAgIHRoaXMuX3ggPSB4O1xuICB9XG4gIGFyZWFTdGFydCgpIHtcbiAgICB0aGlzLl9saW5lID0gMDtcbiAgfVxuICBhcmVhRW5kKCkge1xuICAgIHRoaXMuX2xpbmUgPSBOYU47XG4gIH1cbiAgbGluZVN0YXJ0KCkge1xuICAgIHRoaXMuX3BvaW50ID0gMDtcbiAgfVxuICBsaW5lRW5kKCkge1xuICAgIGlmICh0aGlzLl9saW5lIHx8ICh0aGlzLl9saW5lICE9PSAwICYmIHRoaXMuX3BvaW50ID09PSAxKSkgdGhpcy5fY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICB0aGlzLl9saW5lID0gMSAtIHRoaXMuX2xpbmU7XG4gIH1cbiAgcG9pbnQoeCwgeSkge1xuICAgIHggPSAreCwgeSA9ICt5O1xuICAgIHN3aXRjaCAodGhpcy5fcG9pbnQpIHtcbiAgICAgIGNhc2UgMDoge1xuICAgICAgICB0aGlzLl9wb2ludCA9IDE7XG4gICAgICAgIGlmICh0aGlzLl9saW5lKSB0aGlzLl9jb250ZXh0LmxpbmVUbyh4LCB5KTtcbiAgICAgICAgZWxzZSB0aGlzLl9jb250ZXh0Lm1vdmVUbyh4LCB5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIDE6IHRoaXMuX3BvaW50ID0gMjsgLy8gZmFsbHMgdGhyb3VnaFxuICAgICAgZGVmYXVsdDoge1xuICAgICAgICBpZiAodGhpcy5feCkgdGhpcy5fY29udGV4dC5iZXppZXJDdXJ2ZVRvKHRoaXMuX3gwID0gKHRoaXMuX3gwICsgeCkgLyAyLCB0aGlzLl95MCwgdGhpcy5feDAsIHksIHgsIHkpO1xuICAgICAgICBlbHNlIHRoaXMuX2NvbnRleHQuYmV6aWVyQ3VydmVUbyh0aGlzLl94MCwgdGhpcy5feTAgPSAodGhpcy5feTAgKyB5KSAvIDIsIHgsIHRoaXMuX3kwLCB4LCB5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX3gwID0geCwgdGhpcy5feTAgPSB5O1xuICB9XG59XG5cbmNsYXNzIEJ1bXBSYWRpYWwge1xuICBjb25zdHJ1Y3Rvcihjb250ZXh0KSB7XG4gICAgdGhpcy5fY29udGV4dCA9IGNvbnRleHQ7XG4gIH1cbiAgbGluZVN0YXJ0KCkge1xuICAgIHRoaXMuX3BvaW50ID0gMDtcbiAgfVxuICBsaW5lRW5kKCkge31cbiAgcG9pbnQoeCwgeSkge1xuICAgIHggPSAreCwgeSA9ICt5O1xuICAgIGlmICh0aGlzLl9wb2ludCA9PT0gMCkge1xuICAgICAgdGhpcy5fcG9pbnQgPSAxO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBwMCA9IHBvaW50UmFkaWFsKHRoaXMuX3gwLCB0aGlzLl95MCk7XG4gICAgICBjb25zdCBwMSA9IHBvaW50UmFkaWFsKHRoaXMuX3gwLCB0aGlzLl95MCA9ICh0aGlzLl95MCArIHkpIC8gMik7XG4gICAgICBjb25zdCBwMiA9IHBvaW50UmFkaWFsKHgsIHRoaXMuX3kwKTtcbiAgICAgIGNvbnN0IHAzID0gcG9pbnRSYWRpYWwoeCwgeSk7XG4gICAgICB0aGlzLl9jb250ZXh0Lm1vdmVUbyguLi5wMCk7XG4gICAgICB0aGlzLl9jb250ZXh0LmJlemllckN1cnZlVG8oLi4ucDEsIC4uLnAyLCAuLi5wMyk7XG4gICAgfVxuICAgIHRoaXMuX3gwID0geCwgdGhpcy5feTAgPSB5O1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidW1wWChjb250ZXh0KSB7XG4gIHJldHVybiBuZXcgQnVtcChjb250ZXh0LCB0cnVlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1bXBZKGNvbnRleHQpIHtcbiAgcmV0dXJuIG5ldyBCdW1wKGNvbnRleHQsIGZhbHNlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1bXBSYWRpYWwoY29udGV4dCkge1xuICByZXR1cm4gbmV3IEJ1bXBSYWRpYWwoY29udGV4dCk7XG59XG4iLAogICAgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge31cbiIsCiAgICAiaW1wb3J0IG5vb3AgZnJvbSBcIi4uL25vb3AuanNcIjtcbmltcG9ydCB7cG9pbnR9IGZyb20gXCIuL2Jhc2lzLmpzXCI7XG5cbmZ1bmN0aW9uIEJhc2lzQ2xvc2VkKGNvbnRleHQpIHtcbiAgdGhpcy5fY29udGV4dCA9IGNvbnRleHQ7XG59XG5cbkJhc2lzQ2xvc2VkLnByb3RvdHlwZSA9IHtcbiAgYXJlYVN0YXJ0OiBub29wLFxuICBhcmVhRW5kOiBub29wLFxuICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3gwID0gdGhpcy5feDEgPSB0aGlzLl94MiA9IHRoaXMuX3gzID0gdGhpcy5feDQgPVxuICAgIHRoaXMuX3kwID0gdGhpcy5feTEgPSB0aGlzLl95MiA9IHRoaXMuX3kzID0gdGhpcy5feTQgPSBOYU47XG4gICAgdGhpcy5fcG9pbnQgPSAwO1xuICB9LFxuICBsaW5lRW5kOiBmdW5jdGlvbigpIHtcbiAgICBzd2l0Y2ggKHRoaXMuX3BvaW50KSB7XG4gICAgICBjYXNlIDE6IHtcbiAgICAgICAgdGhpcy5fY29udGV4dC5tb3ZlVG8odGhpcy5feDIsIHRoaXMuX3kyKTtcbiAgICAgICAgdGhpcy5fY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIDI6IHtcbiAgICAgICAgdGhpcy5fY29udGV4dC5tb3ZlVG8oKHRoaXMuX3gyICsgMiAqIHRoaXMuX3gzKSAvIDMsICh0aGlzLl95MiArIDIgKiB0aGlzLl95MykgLyAzKTtcbiAgICAgICAgdGhpcy5fY29udGV4dC5saW5lVG8oKHRoaXMuX3gzICsgMiAqIHRoaXMuX3gyKSAvIDMsICh0aGlzLl95MyArIDIgKiB0aGlzLl95MikgLyAzKTtcbiAgICAgICAgdGhpcy5fY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIDM6IHtcbiAgICAgICAgdGhpcy5wb2ludCh0aGlzLl94MiwgdGhpcy5feTIpO1xuICAgICAgICB0aGlzLnBvaW50KHRoaXMuX3gzLCB0aGlzLl95Myk7XG4gICAgICAgIHRoaXMucG9pbnQodGhpcy5feDQsIHRoaXMuX3k0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBwb2ludDogZnVuY3Rpb24oeCwgeSkge1xuICAgIHggPSAreCwgeSA9ICt5O1xuICAgIHN3aXRjaCAodGhpcy5fcG9pbnQpIHtcbiAgICAgIGNhc2UgMDogdGhpcy5fcG9pbnQgPSAxOyB0aGlzLl94MiA9IHgsIHRoaXMuX3kyID0geTsgYnJlYWs7XG4gICAgICBjYXNlIDE6IHRoaXMuX3BvaW50ID0gMjsgdGhpcy5feDMgPSB4LCB0aGlzLl95MyA9IHk7IGJyZWFrO1xuICAgICAgY2FzZSAyOiB0aGlzLl9wb2ludCA9IDM7IHRoaXMuX3g0ID0geCwgdGhpcy5feTQgPSB5OyB0aGlzLl9jb250ZXh0Lm1vdmVUbygodGhpcy5feDAgKyA0ICogdGhpcy5feDEgKyB4KSAvIDYsICh0aGlzLl95MCArIDQgKiB0aGlzLl95MSArIHkpIC8gNik7IGJyZWFrO1xuICAgICAgZGVmYXVsdDogcG9pbnQodGhpcywgeCwgeSk7IGJyZWFrO1xuICAgIH1cbiAgICB0aGlzLl94MCA9IHRoaXMuX3gxLCB0aGlzLl94MSA9IHg7XG4gICAgdGhpcy5feTAgPSB0aGlzLl95MSwgdGhpcy5feTEgPSB5O1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjb250ZXh0KSB7XG4gIHJldHVybiBuZXcgQmFzaXNDbG9zZWQoY29udGV4dCk7XG59XG4iLAogICAgImltcG9ydCB7cG9pbnR9IGZyb20gXCIuL2Jhc2lzLmpzXCI7XG5cbmZ1bmN0aW9uIEJhc2lzT3Blbihjb250ZXh0KSB7XG4gIHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xufVxuXG5CYXNpc09wZW4ucHJvdG90eXBlID0ge1xuICBhcmVhU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2xpbmUgPSAwO1xuICB9LFxuICBhcmVhRW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9saW5lID0gTmFOO1xuICB9LFxuICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3gwID0gdGhpcy5feDEgPVxuICAgIHRoaXMuX3kwID0gdGhpcy5feTEgPSBOYU47XG4gICAgdGhpcy5fcG9pbnQgPSAwO1xuICB9LFxuICBsaW5lRW5kOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5fbGluZSB8fCAodGhpcy5fbGluZSAhPT0gMCAmJiB0aGlzLl9wb2ludCA9PT0gMykpIHRoaXMuX2NvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgdGhpcy5fbGluZSA9IDEgLSB0aGlzLl9saW5lO1xuICB9LFxuICBwb2ludDogZnVuY3Rpb24oeCwgeSkge1xuICAgIHggPSAreCwgeSA9ICt5O1xuICAgIHN3aXRjaCAodGhpcy5fcG9pbnQpIHtcbiAgICAgIGNhc2UgMDogdGhpcy5fcG9pbnQgPSAxOyBicmVhaztcbiAgICAgIGNhc2UgMTogdGhpcy5fcG9pbnQgPSAyOyBicmVhaztcbiAgICAgIGNhc2UgMjogdGhpcy5fcG9pbnQgPSAzOyB2YXIgeDAgPSAodGhpcy5feDAgKyA0ICogdGhpcy5feDEgKyB4KSAvIDYsIHkwID0gKHRoaXMuX3kwICsgNCAqIHRoaXMuX3kxICsgeSkgLyA2OyB0aGlzLl9saW5lID8gdGhpcy5fY29udGV4dC5saW5lVG8oeDAsIHkwKSA6IHRoaXMuX2NvbnRleHQubW92ZVRvKHgwLCB5MCk7IGJyZWFrO1xuICAgICAgY2FzZSAzOiB0aGlzLl9wb2ludCA9IDQ7IC8vIGZhbGxzIHRocm91Z2hcbiAgICAgIGRlZmF1bHQ6IHBvaW50KHRoaXMsIHgsIHkpOyBicmVhaztcbiAgICB9XG4gICAgdGhpcy5feDAgPSB0aGlzLl94MSwgdGhpcy5feDEgPSB4O1xuICAgIHRoaXMuX3kwID0gdGhpcy5feTEsIHRoaXMuX3kxID0geTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY29udGV4dCkge1xuICByZXR1cm4gbmV3IEJhc2lzT3Blbihjb250ZXh0KTtcbn1cbiIsCiAgICAiaW1wb3J0IHtCYXNpc30gZnJvbSBcIi4vYmFzaXMuanNcIjtcblxuZnVuY3Rpb24gQnVuZGxlKGNvbnRleHQsIGJldGEpIHtcbiAgdGhpcy5fYmFzaXMgPSBuZXcgQmFzaXMoY29udGV4dCk7XG4gIHRoaXMuX2JldGEgPSBiZXRhO1xufVxuXG5CdW5kbGUucHJvdG90eXBlID0ge1xuICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3ggPSBbXTtcbiAgICB0aGlzLl95ID0gW107XG4gICAgdGhpcy5fYmFzaXMubGluZVN0YXJ0KCk7XG4gIH0sXG4gIGxpbmVFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB4ID0gdGhpcy5feCxcbiAgICAgICAgeSA9IHRoaXMuX3ksXG4gICAgICAgIGogPSB4Lmxlbmd0aCAtIDE7XG5cbiAgICBpZiAoaiA+IDApIHtcbiAgICAgIHZhciB4MCA9IHhbMF0sXG4gICAgICAgICAgeTAgPSB5WzBdLFxuICAgICAgICAgIGR4ID0geFtqXSAtIHgwLFxuICAgICAgICAgIGR5ID0geVtqXSAtIHkwLFxuICAgICAgICAgIGkgPSAtMSxcbiAgICAgICAgICB0O1xuXG4gICAgICB3aGlsZSAoKytpIDw9IGopIHtcbiAgICAgICAgdCA9IGkgLyBqO1xuICAgICAgICB0aGlzLl9iYXNpcy5wb2ludChcbiAgICAgICAgICB0aGlzLl9iZXRhICogeFtpXSArICgxIC0gdGhpcy5fYmV0YSkgKiAoeDAgKyB0ICogZHgpLFxuICAgICAgICAgIHRoaXMuX2JldGEgKiB5W2ldICsgKDEgLSB0aGlzLl9iZXRhKSAqICh5MCArIHQgKiBkeSlcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl94ID0gdGhpcy5feSA9IG51bGw7XG4gICAgdGhpcy5fYmFzaXMubGluZUVuZCgpO1xuICB9LFxuICBwb2ludDogZnVuY3Rpb24oeCwgeSkge1xuICAgIHRoaXMuX3gucHVzaCgreCk7XG4gICAgdGhpcy5feS5wdXNoKCt5KTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgKGZ1bmN0aW9uIGN1c3RvbShiZXRhKSB7XG5cbiAgZnVuY3Rpb24gYnVuZGxlKGNvbnRleHQpIHtcbiAgICByZXR1cm4gYmV0YSA9PT0gMSA/IG5ldyBCYXNpcyhjb250ZXh0KSA6IG5ldyBCdW5kbGUoY29udGV4dCwgYmV0YSk7XG4gIH1cblxuICBidW5kbGUuYmV0YSA9IGZ1bmN0aW9uKGJldGEpIHtcbiAgICByZXR1cm4gY3VzdG9tKCtiZXRhKTtcbiAgfTtcblxuICByZXR1cm4gYnVuZGxlO1xufSkoMC44NSk7XG4iLAogICAgImV4cG9ydCBmdW5jdGlvbiBwb2ludCh0aGF0LCB4LCB5KSB7XG4gIHRoYXQuX2NvbnRleHQuYmV6aWVyQ3VydmVUbyhcbiAgICB0aGF0Ll94MSArIHRoYXQuX2sgKiAodGhhdC5feDIgLSB0aGF0Ll94MCksXG4gICAgdGhhdC5feTEgKyB0aGF0Ll9rICogKHRoYXQuX3kyIC0gdGhhdC5feTApLFxuICAgIHRoYXQuX3gyICsgdGhhdC5fayAqICh0aGF0Ll94MSAtIHgpLFxuICAgIHRoYXQuX3kyICsgdGhhdC5fayAqICh0aGF0Ll95MSAtIHkpLFxuICAgIHRoYXQuX3gyLFxuICAgIHRoYXQuX3kyXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDYXJkaW5hbChjb250ZXh0LCB0ZW5zaW9uKSB7XG4gIHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xuICB0aGlzLl9rID0gKDEgLSB0ZW5zaW9uKSAvIDY7XG59XG5cbkNhcmRpbmFsLnByb3RvdHlwZSA9IHtcbiAgYXJlYVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9saW5lID0gMDtcbiAgfSxcbiAgYXJlYUVuZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fbGluZSA9IE5hTjtcbiAgfSxcbiAgbGluZVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl94MCA9IHRoaXMuX3gxID0gdGhpcy5feDIgPVxuICAgIHRoaXMuX3kwID0gdGhpcy5feTEgPSB0aGlzLl95MiA9IE5hTjtcbiAgICB0aGlzLl9wb2ludCA9IDA7XG4gIH0sXG4gIGxpbmVFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHN3aXRjaCAodGhpcy5fcG9pbnQpIHtcbiAgICAgIGNhc2UgMjogdGhpcy5fY29udGV4dC5saW5lVG8odGhpcy5feDIsIHRoaXMuX3kyKTsgYnJlYWs7XG4gICAgICBjYXNlIDM6IHBvaW50KHRoaXMsIHRoaXMuX3gxLCB0aGlzLl95MSk7IGJyZWFrO1xuICAgIH1cbiAgICBpZiAodGhpcy5fbGluZSB8fCAodGhpcy5fbGluZSAhPT0gMCAmJiB0aGlzLl9wb2ludCA9PT0gMSkpIHRoaXMuX2NvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgdGhpcy5fbGluZSA9IDEgLSB0aGlzLl9saW5lO1xuICB9LFxuICBwb2ludDogZnVuY3Rpb24oeCwgeSkge1xuICAgIHggPSAreCwgeSA9ICt5O1xuICAgIHN3aXRjaCAodGhpcy5fcG9pbnQpIHtcbiAgICAgIGNhc2UgMDogdGhpcy5fcG9pbnQgPSAxOyB0aGlzLl9saW5lID8gdGhpcy5fY29udGV4dC5saW5lVG8oeCwgeSkgOiB0aGlzLl9jb250ZXh0Lm1vdmVUbyh4LCB5KTsgYnJlYWs7XG4gICAgICBjYXNlIDE6IHRoaXMuX3BvaW50ID0gMjsgdGhpcy5feDEgPSB4LCB0aGlzLl95MSA9IHk7IGJyZWFrO1xuICAgICAgY2FzZSAyOiB0aGlzLl9wb2ludCA9IDM7IC8vIGZhbGxzIHRocm91Z2hcbiAgICAgIGRlZmF1bHQ6IHBvaW50KHRoaXMsIHgsIHkpOyBicmVhaztcbiAgICB9XG4gICAgdGhpcy5feDAgPSB0aGlzLl94MSwgdGhpcy5feDEgPSB0aGlzLl94MiwgdGhpcy5feDIgPSB4O1xuICAgIHRoaXMuX3kwID0gdGhpcy5feTEsIHRoaXMuX3kxID0gdGhpcy5feTIsIHRoaXMuX3kyID0geTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgKGZ1bmN0aW9uIGN1c3RvbSh0ZW5zaW9uKSB7XG5cbiAgZnVuY3Rpb24gY2FyZGluYWwoY29udGV4dCkge1xuICAgIHJldHVybiBuZXcgQ2FyZGluYWwoY29udGV4dCwgdGVuc2lvbik7XG4gIH1cblxuICBjYXJkaW5hbC50ZW5zaW9uID0gZnVuY3Rpb24odGVuc2lvbikge1xuICAgIHJldHVybiBjdXN0b20oK3RlbnNpb24pO1xuICB9O1xuXG4gIHJldHVybiBjYXJkaW5hbDtcbn0pKDApO1xuIiwKICAgICJpbXBvcnQgbm9vcCBmcm9tIFwiLi4vbm9vcC5qc1wiO1xuaW1wb3J0IHtwb2ludH0gZnJvbSBcIi4vY2FyZGluYWwuanNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIENhcmRpbmFsQ2xvc2VkKGNvbnRleHQsIHRlbnNpb24pIHtcbiAgdGhpcy5fY29udGV4dCA9IGNvbnRleHQ7XG4gIHRoaXMuX2sgPSAoMSAtIHRlbnNpb24pIC8gNjtcbn1cblxuQ2FyZGluYWxDbG9zZWQucHJvdG90eXBlID0ge1xuICBhcmVhU3RhcnQ6IG5vb3AsXG4gIGFyZWFFbmQ6IG5vb3AsXG4gIGxpbmVTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5feDAgPSB0aGlzLl94MSA9IHRoaXMuX3gyID0gdGhpcy5feDMgPSB0aGlzLl94NCA9IHRoaXMuX3g1ID1cbiAgICB0aGlzLl95MCA9IHRoaXMuX3kxID0gdGhpcy5feTIgPSB0aGlzLl95MyA9IHRoaXMuX3k0ID0gdGhpcy5feTUgPSBOYU47XG4gICAgdGhpcy5fcG9pbnQgPSAwO1xuICB9LFxuICBsaW5lRW5kOiBmdW5jdGlvbigpIHtcbiAgICBzd2l0Y2ggKHRoaXMuX3BvaW50KSB7XG4gICAgICBjYXNlIDE6IHtcbiAgICAgICAgdGhpcy5fY29udGV4dC5tb3ZlVG8odGhpcy5feDMsIHRoaXMuX3kzKTtcbiAgICAgICAgdGhpcy5fY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIDI6IHtcbiAgICAgICAgdGhpcy5fY29udGV4dC5saW5lVG8odGhpcy5feDMsIHRoaXMuX3kzKTtcbiAgICAgICAgdGhpcy5fY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIDM6IHtcbiAgICAgICAgdGhpcy5wb2ludCh0aGlzLl94MywgdGhpcy5feTMpO1xuICAgICAgICB0aGlzLnBvaW50KHRoaXMuX3g0LCB0aGlzLl95NCk7XG4gICAgICAgIHRoaXMucG9pbnQodGhpcy5feDUsIHRoaXMuX3k1KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBwb2ludDogZnVuY3Rpb24oeCwgeSkge1xuICAgIHggPSAreCwgeSA9ICt5O1xuICAgIHN3aXRjaCAodGhpcy5fcG9pbnQpIHtcbiAgICAgIGNhc2UgMDogdGhpcy5fcG9pbnQgPSAxOyB0aGlzLl94MyA9IHgsIHRoaXMuX3kzID0geTsgYnJlYWs7XG4gICAgICBjYXNlIDE6IHRoaXMuX3BvaW50ID0gMjsgdGhpcy5fY29udGV4dC5tb3ZlVG8odGhpcy5feDQgPSB4LCB0aGlzLl95NCA9IHkpOyBicmVhaztcbiAgICAgIGNhc2UgMjogdGhpcy5fcG9pbnQgPSAzOyB0aGlzLl94NSA9IHgsIHRoaXMuX3k1ID0geTsgYnJlYWs7XG4gICAgICBkZWZhdWx0OiBwb2ludCh0aGlzLCB4LCB5KTsgYnJlYWs7XG4gICAgfVxuICAgIHRoaXMuX3gwID0gdGhpcy5feDEsIHRoaXMuX3gxID0gdGhpcy5feDIsIHRoaXMuX3gyID0geDtcbiAgICB0aGlzLl95MCA9IHRoaXMuX3kxLCB0aGlzLl95MSA9IHRoaXMuX3kyLCB0aGlzLl95MiA9IHk7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IChmdW5jdGlvbiBjdXN0b20odGVuc2lvbikge1xuXG4gIGZ1bmN0aW9uIGNhcmRpbmFsKGNvbnRleHQpIHtcbiAgICByZXR1cm4gbmV3IENhcmRpbmFsQ2xvc2VkKGNvbnRleHQsIHRlbnNpb24pO1xuICB9XG5cbiAgY2FyZGluYWwudGVuc2lvbiA9IGZ1bmN0aW9uKHRlbnNpb24pIHtcbiAgICByZXR1cm4gY3VzdG9tKCt0ZW5zaW9uKTtcbiAgfTtcblxuICByZXR1cm4gY2FyZGluYWw7XG59KSgwKTtcbiIsCiAgICAiaW1wb3J0IHtwb2ludH0gZnJvbSBcIi4vY2FyZGluYWwuanNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIENhcmRpbmFsT3Blbihjb250ZXh0LCB0ZW5zaW9uKSB7XG4gIHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xuICB0aGlzLl9rID0gKDEgLSB0ZW5zaW9uKSAvIDY7XG59XG5cbkNhcmRpbmFsT3Blbi5wcm90b3R5cGUgPSB7XG4gIGFyZWFTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fbGluZSA9IDA7XG4gIH0sXG4gIGFyZWFFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2xpbmUgPSBOYU47XG4gIH0sXG4gIGxpbmVTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5feDAgPSB0aGlzLl94MSA9IHRoaXMuX3gyID1cbiAgICB0aGlzLl95MCA9IHRoaXMuX3kxID0gdGhpcy5feTIgPSBOYU47XG4gICAgdGhpcy5fcG9pbnQgPSAwO1xuICB9LFxuICBsaW5lRW5kOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5fbGluZSB8fCAodGhpcy5fbGluZSAhPT0gMCAmJiB0aGlzLl9wb2ludCA9PT0gMykpIHRoaXMuX2NvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgdGhpcy5fbGluZSA9IDEgLSB0aGlzLl9saW5lO1xuICB9LFxuICBwb2ludDogZnVuY3Rpb24oeCwgeSkge1xuICAgIHggPSAreCwgeSA9ICt5O1xuICAgIHN3aXRjaCAodGhpcy5fcG9pbnQpIHtcbiAgICAgIGNhc2UgMDogdGhpcy5fcG9pbnQgPSAxOyBicmVhaztcbiAgICAgIGNhc2UgMTogdGhpcy5fcG9pbnQgPSAyOyBicmVhaztcbiAgICAgIGNhc2UgMjogdGhpcy5fcG9pbnQgPSAzOyB0aGlzLl9saW5lID8gdGhpcy5fY29udGV4dC5saW5lVG8odGhpcy5feDIsIHRoaXMuX3kyKSA6IHRoaXMuX2NvbnRleHQubW92ZVRvKHRoaXMuX3gyLCB0aGlzLl95Mik7IGJyZWFrO1xuICAgICAgY2FzZSAzOiB0aGlzLl9wb2ludCA9IDQ7IC8vIGZhbGxzIHRocm91Z2hcbiAgICAgIGRlZmF1bHQ6IHBvaW50KHRoaXMsIHgsIHkpOyBicmVhaztcbiAgICB9XG4gICAgdGhpcy5feDAgPSB0aGlzLl94MSwgdGhpcy5feDEgPSB0aGlzLl94MiwgdGhpcy5feDIgPSB4O1xuICAgIHRoaXMuX3kwID0gdGhpcy5feTEsIHRoaXMuX3kxID0gdGhpcy5feTIsIHRoaXMuX3kyID0geTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgKGZ1bmN0aW9uIGN1c3RvbSh0ZW5zaW9uKSB7XG5cbiAgZnVuY3Rpb24gY2FyZGluYWwoY29udGV4dCkge1xuICAgIHJldHVybiBuZXcgQ2FyZGluYWxPcGVuKGNvbnRleHQsIHRlbnNpb24pO1xuICB9XG5cbiAgY2FyZGluYWwudGVuc2lvbiA9IGZ1bmN0aW9uKHRlbnNpb24pIHtcbiAgICByZXR1cm4gY3VzdG9tKCt0ZW5zaW9uKTtcbiAgfTtcblxuICByZXR1cm4gY2FyZGluYWw7XG59KSgwKTtcbiIsCiAgICAiaW1wb3J0IHtlcHNpbG9ufSBmcm9tIFwiLi4vbWF0aC5qc1wiO1xuaW1wb3J0IHtDYXJkaW5hbH0gZnJvbSBcIi4vY2FyZGluYWwuanNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHBvaW50KHRoYXQsIHgsIHkpIHtcbiAgdmFyIHgxID0gdGhhdC5feDEsXG4gICAgICB5MSA9IHRoYXQuX3kxLFxuICAgICAgeDIgPSB0aGF0Ll94MixcbiAgICAgIHkyID0gdGhhdC5feTI7XG5cbiAgaWYgKHRoYXQuX2wwMV9hID4gZXBzaWxvbikge1xuICAgIHZhciBhID0gMiAqIHRoYXQuX2wwMV8yYSArIDMgKiB0aGF0Ll9sMDFfYSAqIHRoYXQuX2wxMl9hICsgdGhhdC5fbDEyXzJhLFxuICAgICAgICBuID0gMyAqIHRoYXQuX2wwMV9hICogKHRoYXQuX2wwMV9hICsgdGhhdC5fbDEyX2EpO1xuICAgIHgxID0gKHgxICogYSAtIHRoYXQuX3gwICogdGhhdC5fbDEyXzJhICsgdGhhdC5feDIgKiB0aGF0Ll9sMDFfMmEpIC8gbjtcbiAgICB5MSA9ICh5MSAqIGEgLSB0aGF0Ll95MCAqIHRoYXQuX2wxMl8yYSArIHRoYXQuX3kyICogdGhhdC5fbDAxXzJhKSAvIG47XG4gIH1cblxuICBpZiAodGhhdC5fbDIzX2EgPiBlcHNpbG9uKSB7XG4gICAgdmFyIGIgPSAyICogdGhhdC5fbDIzXzJhICsgMyAqIHRoYXQuX2wyM19hICogdGhhdC5fbDEyX2EgKyB0aGF0Ll9sMTJfMmEsXG4gICAgICAgIG0gPSAzICogdGhhdC5fbDIzX2EgKiAodGhhdC5fbDIzX2EgKyB0aGF0Ll9sMTJfYSk7XG4gICAgeDIgPSAoeDIgKiBiICsgdGhhdC5feDEgKiB0aGF0Ll9sMjNfMmEgLSB4ICogdGhhdC5fbDEyXzJhKSAvIG07XG4gICAgeTIgPSAoeTIgKiBiICsgdGhhdC5feTEgKiB0aGF0Ll9sMjNfMmEgLSB5ICogdGhhdC5fbDEyXzJhKSAvIG07XG4gIH1cblxuICB0aGF0Ll9jb250ZXh0LmJlemllckN1cnZlVG8oeDEsIHkxLCB4MiwgeTIsIHRoYXQuX3gyLCB0aGF0Ll95Mik7XG59XG5cbmZ1bmN0aW9uIENhdG11bGxSb20oY29udGV4dCwgYWxwaGEpIHtcbiAgdGhpcy5fY29udGV4dCA9IGNvbnRleHQ7XG4gIHRoaXMuX2FscGhhID0gYWxwaGE7XG59XG5cbkNhdG11bGxSb20ucHJvdG90eXBlID0ge1xuICBhcmVhU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2xpbmUgPSAwO1xuICB9LFxuICBhcmVhRW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9saW5lID0gTmFOO1xuICB9LFxuICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3gwID0gdGhpcy5feDEgPSB0aGlzLl94MiA9XG4gICAgdGhpcy5feTAgPSB0aGlzLl95MSA9IHRoaXMuX3kyID0gTmFOO1xuICAgIHRoaXMuX2wwMV9hID0gdGhpcy5fbDEyX2EgPSB0aGlzLl9sMjNfYSA9XG4gICAgdGhpcy5fbDAxXzJhID0gdGhpcy5fbDEyXzJhID0gdGhpcy5fbDIzXzJhID1cbiAgICB0aGlzLl9wb2ludCA9IDA7XG4gIH0sXG4gIGxpbmVFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHN3aXRjaCAodGhpcy5fcG9pbnQpIHtcbiAgICAgIGNhc2UgMjogdGhpcy5fY29udGV4dC5saW5lVG8odGhpcy5feDIsIHRoaXMuX3kyKTsgYnJlYWs7XG4gICAgICBjYXNlIDM6IHRoaXMucG9pbnQodGhpcy5feDIsIHRoaXMuX3kyKTsgYnJlYWs7XG4gICAgfVxuICAgIGlmICh0aGlzLl9saW5lIHx8ICh0aGlzLl9saW5lICE9PSAwICYmIHRoaXMuX3BvaW50ID09PSAxKSkgdGhpcy5fY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICB0aGlzLl9saW5lID0gMSAtIHRoaXMuX2xpbmU7XG4gIH0sXG4gIHBvaW50OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgeCA9ICt4LCB5ID0gK3k7XG5cbiAgICBpZiAodGhpcy5fcG9pbnQpIHtcbiAgICAgIHZhciB4MjMgPSB0aGlzLl94MiAtIHgsXG4gICAgICAgICAgeTIzID0gdGhpcy5feTIgLSB5O1xuICAgICAgdGhpcy5fbDIzX2EgPSBNYXRoLnNxcnQodGhpcy5fbDIzXzJhID0gTWF0aC5wb3coeDIzICogeDIzICsgeTIzICogeTIzLCB0aGlzLl9hbHBoYSkpO1xuICAgIH1cblxuICAgIHN3aXRjaCAodGhpcy5fcG9pbnQpIHtcbiAgICAgIGNhc2UgMDogdGhpcy5fcG9pbnQgPSAxOyB0aGlzLl9saW5lID8gdGhpcy5fY29udGV4dC5saW5lVG8oeCwgeSkgOiB0aGlzLl9jb250ZXh0Lm1vdmVUbyh4LCB5KTsgYnJlYWs7XG4gICAgICBjYXNlIDE6IHRoaXMuX3BvaW50ID0gMjsgYnJlYWs7XG4gICAgICBjYXNlIDI6IHRoaXMuX3BvaW50ID0gMzsgLy8gZmFsbHMgdGhyb3VnaFxuICAgICAgZGVmYXVsdDogcG9pbnQodGhpcywgeCwgeSk7IGJyZWFrO1xuICAgIH1cblxuICAgIHRoaXMuX2wwMV9hID0gdGhpcy5fbDEyX2EsIHRoaXMuX2wxMl9hID0gdGhpcy5fbDIzX2E7XG4gICAgdGhpcy5fbDAxXzJhID0gdGhpcy5fbDEyXzJhLCB0aGlzLl9sMTJfMmEgPSB0aGlzLl9sMjNfMmE7XG4gICAgdGhpcy5feDAgPSB0aGlzLl94MSwgdGhpcy5feDEgPSB0aGlzLl94MiwgdGhpcy5feDIgPSB4O1xuICAgIHRoaXMuX3kwID0gdGhpcy5feTEsIHRoaXMuX3kxID0gdGhpcy5feTIsIHRoaXMuX3kyID0geTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgKGZ1bmN0aW9uIGN1c3RvbShhbHBoYSkge1xuXG4gIGZ1bmN0aW9uIGNhdG11bGxSb20oY29udGV4dCkge1xuICAgIHJldHVybiBhbHBoYSA/IG5ldyBDYXRtdWxsUm9tKGNvbnRleHQsIGFscGhhKSA6IG5ldyBDYXJkaW5hbChjb250ZXh0LCAwKTtcbiAgfVxuXG4gIGNhdG11bGxSb20uYWxwaGEgPSBmdW5jdGlvbihhbHBoYSkge1xuICAgIHJldHVybiBjdXN0b20oK2FscGhhKTtcbiAgfTtcblxuICByZXR1cm4gY2F0bXVsbFJvbTtcbn0pKDAuNSk7XG4iLAogICAgImltcG9ydCB7Q2FyZGluYWxDbG9zZWR9IGZyb20gXCIuL2NhcmRpbmFsQ2xvc2VkLmpzXCI7XG5pbXBvcnQgbm9vcCBmcm9tIFwiLi4vbm9vcC5qc1wiO1xuaW1wb3J0IHtwb2ludH0gZnJvbSBcIi4vY2F0bXVsbFJvbS5qc1wiO1xuXG5mdW5jdGlvbiBDYXRtdWxsUm9tQ2xvc2VkKGNvbnRleHQsIGFscGhhKSB7XG4gIHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xuICB0aGlzLl9hbHBoYSA9IGFscGhhO1xufVxuXG5DYXRtdWxsUm9tQ2xvc2VkLnByb3RvdHlwZSA9IHtcbiAgYXJlYVN0YXJ0OiBub29wLFxuICBhcmVhRW5kOiBub29wLFxuICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3gwID0gdGhpcy5feDEgPSB0aGlzLl94MiA9IHRoaXMuX3gzID0gdGhpcy5feDQgPSB0aGlzLl94NSA9XG4gICAgdGhpcy5feTAgPSB0aGlzLl95MSA9IHRoaXMuX3kyID0gdGhpcy5feTMgPSB0aGlzLl95NCA9IHRoaXMuX3k1ID0gTmFOO1xuICAgIHRoaXMuX2wwMV9hID0gdGhpcy5fbDEyX2EgPSB0aGlzLl9sMjNfYSA9XG4gICAgdGhpcy5fbDAxXzJhID0gdGhpcy5fbDEyXzJhID0gdGhpcy5fbDIzXzJhID1cbiAgICB0aGlzLl9wb2ludCA9IDA7XG4gIH0sXG4gIGxpbmVFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHN3aXRjaCAodGhpcy5fcG9pbnQpIHtcbiAgICAgIGNhc2UgMToge1xuICAgICAgICB0aGlzLl9jb250ZXh0Lm1vdmVUbyh0aGlzLl94MywgdGhpcy5feTMpO1xuICAgICAgICB0aGlzLl9jb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgMjoge1xuICAgICAgICB0aGlzLl9jb250ZXh0LmxpbmVUbyh0aGlzLl94MywgdGhpcy5feTMpO1xuICAgICAgICB0aGlzLl9jb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgMzoge1xuICAgICAgICB0aGlzLnBvaW50KHRoaXMuX3gzLCB0aGlzLl95Myk7XG4gICAgICAgIHRoaXMucG9pbnQodGhpcy5feDQsIHRoaXMuX3k0KTtcbiAgICAgICAgdGhpcy5wb2ludCh0aGlzLl94NSwgdGhpcy5feTUpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHBvaW50OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgeCA9ICt4LCB5ID0gK3k7XG5cbiAgICBpZiAodGhpcy5fcG9pbnQpIHtcbiAgICAgIHZhciB4MjMgPSB0aGlzLl94MiAtIHgsXG4gICAgICAgICAgeTIzID0gdGhpcy5feTIgLSB5O1xuICAgICAgdGhpcy5fbDIzX2EgPSBNYXRoLnNxcnQodGhpcy5fbDIzXzJhID0gTWF0aC5wb3coeDIzICogeDIzICsgeTIzICogeTIzLCB0aGlzLl9hbHBoYSkpO1xuICAgIH1cblxuICAgIHN3aXRjaCAodGhpcy5fcG9pbnQpIHtcbiAgICAgIGNhc2UgMDogdGhpcy5fcG9pbnQgPSAxOyB0aGlzLl94MyA9IHgsIHRoaXMuX3kzID0geTsgYnJlYWs7XG4gICAgICBjYXNlIDE6IHRoaXMuX3BvaW50ID0gMjsgdGhpcy5fY29udGV4dC5tb3ZlVG8odGhpcy5feDQgPSB4LCB0aGlzLl95NCA9IHkpOyBicmVhaztcbiAgICAgIGNhc2UgMjogdGhpcy5fcG9pbnQgPSAzOyB0aGlzLl94NSA9IHgsIHRoaXMuX3k1ID0geTsgYnJlYWs7XG4gICAgICBkZWZhdWx0OiBwb2ludCh0aGlzLCB4LCB5KTsgYnJlYWs7XG4gICAgfVxuXG4gICAgdGhpcy5fbDAxX2EgPSB0aGlzLl9sMTJfYSwgdGhpcy5fbDEyX2EgPSB0aGlzLl9sMjNfYTtcbiAgICB0aGlzLl9sMDFfMmEgPSB0aGlzLl9sMTJfMmEsIHRoaXMuX2wxMl8yYSA9IHRoaXMuX2wyM18yYTtcbiAgICB0aGlzLl94MCA9IHRoaXMuX3gxLCB0aGlzLl94MSA9IHRoaXMuX3gyLCB0aGlzLl94MiA9IHg7XG4gICAgdGhpcy5feTAgPSB0aGlzLl95MSwgdGhpcy5feTEgPSB0aGlzLl95MiwgdGhpcy5feTIgPSB5O1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCAoZnVuY3Rpb24gY3VzdG9tKGFscGhhKSB7XG5cbiAgZnVuY3Rpb24gY2F0bXVsbFJvbShjb250ZXh0KSB7XG4gICAgcmV0dXJuIGFscGhhID8gbmV3IENhdG11bGxSb21DbG9zZWQoY29udGV4dCwgYWxwaGEpIDogbmV3IENhcmRpbmFsQ2xvc2VkKGNvbnRleHQsIDApO1xuICB9XG5cbiAgY2F0bXVsbFJvbS5hbHBoYSA9IGZ1bmN0aW9uKGFscGhhKSB7XG4gICAgcmV0dXJuIGN1c3RvbSgrYWxwaGEpO1xuICB9O1xuXG4gIHJldHVybiBjYXRtdWxsUm9tO1xufSkoMC41KTtcbiIsCiAgICAiaW1wb3J0IHtDYXJkaW5hbE9wZW59IGZyb20gXCIuL2NhcmRpbmFsT3Blbi5qc1wiO1xuaW1wb3J0IHtwb2ludH0gZnJvbSBcIi4vY2F0bXVsbFJvbS5qc1wiO1xuXG5mdW5jdGlvbiBDYXRtdWxsUm9tT3Blbihjb250ZXh0LCBhbHBoYSkge1xuICB0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcbiAgdGhpcy5fYWxwaGEgPSBhbHBoYTtcbn1cblxuQ2F0bXVsbFJvbU9wZW4ucHJvdG90eXBlID0ge1xuICBhcmVhU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2xpbmUgPSAwO1xuICB9LFxuICBhcmVhRW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9saW5lID0gTmFOO1xuICB9LFxuICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3gwID0gdGhpcy5feDEgPSB0aGlzLl94MiA9XG4gICAgdGhpcy5feTAgPSB0aGlzLl95MSA9IHRoaXMuX3kyID0gTmFOO1xuICAgIHRoaXMuX2wwMV9hID0gdGhpcy5fbDEyX2EgPSB0aGlzLl9sMjNfYSA9XG4gICAgdGhpcy5fbDAxXzJhID0gdGhpcy5fbDEyXzJhID0gdGhpcy5fbDIzXzJhID1cbiAgICB0aGlzLl9wb2ludCA9IDA7XG4gIH0sXG4gIGxpbmVFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9saW5lIHx8ICh0aGlzLl9saW5lICE9PSAwICYmIHRoaXMuX3BvaW50ID09PSAzKSkgdGhpcy5fY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICB0aGlzLl9saW5lID0gMSAtIHRoaXMuX2xpbmU7XG4gIH0sXG4gIHBvaW50OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgeCA9ICt4LCB5ID0gK3k7XG5cbiAgICBpZiAodGhpcy5fcG9pbnQpIHtcbiAgICAgIHZhciB4MjMgPSB0aGlzLl94MiAtIHgsXG4gICAgICAgICAgeTIzID0gdGhpcy5feTIgLSB5O1xuICAgICAgdGhpcy5fbDIzX2EgPSBNYXRoLnNxcnQodGhpcy5fbDIzXzJhID0gTWF0aC5wb3coeDIzICogeDIzICsgeTIzICogeTIzLCB0aGlzLl9hbHBoYSkpO1xuICAgIH1cblxuICAgIHN3aXRjaCAodGhpcy5fcG9pbnQpIHtcbiAgICAgIGNhc2UgMDogdGhpcy5fcG9pbnQgPSAxOyBicmVhaztcbiAgICAgIGNhc2UgMTogdGhpcy5fcG9pbnQgPSAyOyBicmVhaztcbiAgICAgIGNhc2UgMjogdGhpcy5fcG9pbnQgPSAzOyB0aGlzLl9saW5lID8gdGhpcy5fY29udGV4dC5saW5lVG8odGhpcy5feDIsIHRoaXMuX3kyKSA6IHRoaXMuX2NvbnRleHQubW92ZVRvKHRoaXMuX3gyLCB0aGlzLl95Mik7IGJyZWFrO1xuICAgICAgY2FzZSAzOiB0aGlzLl9wb2ludCA9IDQ7IC8vIGZhbGxzIHRocm91Z2hcbiAgICAgIGRlZmF1bHQ6IHBvaW50KHRoaXMsIHgsIHkpOyBicmVhaztcbiAgICB9XG5cbiAgICB0aGlzLl9sMDFfYSA9IHRoaXMuX2wxMl9hLCB0aGlzLl9sMTJfYSA9IHRoaXMuX2wyM19hO1xuICAgIHRoaXMuX2wwMV8yYSA9IHRoaXMuX2wxMl8yYSwgdGhpcy5fbDEyXzJhID0gdGhpcy5fbDIzXzJhO1xuICAgIHRoaXMuX3gwID0gdGhpcy5feDEsIHRoaXMuX3gxID0gdGhpcy5feDIsIHRoaXMuX3gyID0geDtcbiAgICB0aGlzLl95MCA9IHRoaXMuX3kxLCB0aGlzLl95MSA9IHRoaXMuX3kyLCB0aGlzLl95MiA9IHk7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IChmdW5jdGlvbiBjdXN0b20oYWxwaGEpIHtcblxuICBmdW5jdGlvbiBjYXRtdWxsUm9tKGNvbnRleHQpIHtcbiAgICByZXR1cm4gYWxwaGEgPyBuZXcgQ2F0bXVsbFJvbU9wZW4oY29udGV4dCwgYWxwaGEpIDogbmV3IENhcmRpbmFsT3Blbihjb250ZXh0LCAwKTtcbiAgfVxuXG4gIGNhdG11bGxSb20uYWxwaGEgPSBmdW5jdGlvbihhbHBoYSkge1xuICAgIHJldHVybiBjdXN0b20oK2FscGhhKTtcbiAgfTtcblxuICByZXR1cm4gY2F0bXVsbFJvbTtcbn0pKDAuNSk7XG4iLAogICAgImltcG9ydCBub29wIGZyb20gXCIuLi9ub29wLmpzXCI7XG5cbmZ1bmN0aW9uIExpbmVhckNsb3NlZChjb250ZXh0KSB7XG4gIHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xufVxuXG5MaW5lYXJDbG9zZWQucHJvdG90eXBlID0ge1xuICBhcmVhU3RhcnQ6IG5vb3AsXG4gIGFyZWFFbmQ6IG5vb3AsXG4gIGxpbmVTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fcG9pbnQgPSAwO1xuICB9LFxuICBsaW5lRW5kOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5fcG9pbnQpIHRoaXMuX2NvbnRleHQuY2xvc2VQYXRoKCk7XG4gIH0sXG4gIHBvaW50OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgeCA9ICt4LCB5ID0gK3k7XG4gICAgaWYgKHRoaXMuX3BvaW50KSB0aGlzLl9jb250ZXh0LmxpbmVUbyh4LCB5KTtcbiAgICBlbHNlIHRoaXMuX3BvaW50ID0gMSwgdGhpcy5fY29udGV4dC5tb3ZlVG8oeCwgeSk7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgcmV0dXJuIG5ldyBMaW5lYXJDbG9zZWQoY29udGV4dCk7XG59XG4iLAogICAgImZ1bmN0aW9uIHNpZ24oeCkge1xuICByZXR1cm4geCA8IDAgPyAtMSA6IDE7XG59XG5cbi8vIENhbGN1bGF0ZSB0aGUgc2xvcGVzIG9mIHRoZSB0YW5nZW50cyAoSGVybWl0ZS10eXBlIGludGVycG9sYXRpb24pIGJhc2VkIG9uXG4vLyB0aGUgZm9sbG93aW5nIHBhcGVyOiBTdGVmZmVuLCBNLiAxOTkwLiBBIFNpbXBsZSBNZXRob2QgZm9yIE1vbm90b25pY1xuLy8gSW50ZXJwb2xhdGlvbiBpbiBPbmUgRGltZW5zaW9uLiBBc3Ryb25vbXkgYW5kIEFzdHJvcGh5c2ljcywgVm9sLiAyMzksIE5PLlxuLy8gTk9WKElJKSwgUC4gNDQzLCAxOTkwLlxuZnVuY3Rpb24gc2xvcGUzKHRoYXQsIHgyLCB5Mikge1xuICB2YXIgaDAgPSB0aGF0Ll94MSAtIHRoYXQuX3gwLFxuICAgICAgaDEgPSB4MiAtIHRoYXQuX3gxLFxuICAgICAgczAgPSAodGhhdC5feTEgLSB0aGF0Ll95MCkgLyAoaDAgfHwgaDEgPCAwICYmIC0wKSxcbiAgICAgIHMxID0gKHkyIC0gdGhhdC5feTEpIC8gKGgxIHx8IGgwIDwgMCAmJiAtMCksXG4gICAgICBwID0gKHMwICogaDEgKyBzMSAqIGgwKSAvIChoMCArIGgxKTtcbiAgcmV0dXJuIChzaWduKHMwKSArIHNpZ24oczEpKSAqIE1hdGgubWluKE1hdGguYWJzKHMwKSwgTWF0aC5hYnMoczEpLCAwLjUgKiBNYXRoLmFicyhwKSkgfHwgMDtcbn1cblxuLy8gQ2FsY3VsYXRlIGEgb25lLXNpZGVkIHNsb3BlLlxuZnVuY3Rpb24gc2xvcGUyKHRoYXQsIHQpIHtcbiAgdmFyIGggPSB0aGF0Ll94MSAtIHRoYXQuX3gwO1xuICByZXR1cm4gaCA/ICgzICogKHRoYXQuX3kxIC0gdGhhdC5feTApIC8gaCAtIHQpIC8gMiA6IHQ7XG59XG5cbi8vIEFjY29yZGluZyB0byBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9DdWJpY19IZXJtaXRlX3NwbGluZSNSZXByZXNlbnRhdGlvbnNcbi8vIFwieW91IGNhbiBleHByZXNzIGN1YmljIEhlcm1pdGUgaW50ZXJwb2xhdGlvbiBpbiB0ZXJtcyBvZiBjdWJpYyBCw6l6aWVyIGN1cnZlc1xuLy8gd2l0aCByZXNwZWN0IHRvIHRoZSBmb3VyIHZhbHVlcyBwMCwgcDAgKyBtMCAvIDMsIHAxIC0gbTEgLyAzLCBwMVwiLlxuZnVuY3Rpb24gcG9pbnQodGhhdCwgdDAsIHQxKSB7XG4gIHZhciB4MCA9IHRoYXQuX3gwLFxuICAgICAgeTAgPSB0aGF0Ll95MCxcbiAgICAgIHgxID0gdGhhdC5feDEsXG4gICAgICB5MSA9IHRoYXQuX3kxLFxuICAgICAgZHggPSAoeDEgLSB4MCkgLyAzO1xuICB0aGF0Ll9jb250ZXh0LmJlemllckN1cnZlVG8oeDAgKyBkeCwgeTAgKyBkeCAqIHQwLCB4MSAtIGR4LCB5MSAtIGR4ICogdDEsIHgxLCB5MSk7XG59XG5cbmZ1bmN0aW9uIE1vbm90b25lWChjb250ZXh0KSB7XG4gIHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xufVxuXG5Nb25vdG9uZVgucHJvdG90eXBlID0ge1xuICBhcmVhU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2xpbmUgPSAwO1xuICB9LFxuICBhcmVhRW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9saW5lID0gTmFOO1xuICB9LFxuICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3gwID0gdGhpcy5feDEgPVxuICAgIHRoaXMuX3kwID0gdGhpcy5feTEgPVxuICAgIHRoaXMuX3QwID0gTmFOO1xuICAgIHRoaXMuX3BvaW50ID0gMDtcbiAgfSxcbiAgbGluZUVuZDogZnVuY3Rpb24oKSB7XG4gICAgc3dpdGNoICh0aGlzLl9wb2ludCkge1xuICAgICAgY2FzZSAyOiB0aGlzLl9jb250ZXh0LmxpbmVUbyh0aGlzLl94MSwgdGhpcy5feTEpOyBicmVhaztcbiAgICAgIGNhc2UgMzogcG9pbnQodGhpcywgdGhpcy5fdDAsIHNsb3BlMih0aGlzLCB0aGlzLl90MCkpOyBicmVhaztcbiAgICB9XG4gICAgaWYgKHRoaXMuX2xpbmUgfHwgKHRoaXMuX2xpbmUgIT09IDAgJiYgdGhpcy5fcG9pbnQgPT09IDEpKSB0aGlzLl9jb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgIHRoaXMuX2xpbmUgPSAxIC0gdGhpcy5fbGluZTtcbiAgfSxcbiAgcG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICB2YXIgdDEgPSBOYU47XG5cbiAgICB4ID0gK3gsIHkgPSAreTtcbiAgICBpZiAoeCA9PT0gdGhpcy5feDEgJiYgeSA9PT0gdGhpcy5feTEpIHJldHVybjsgLy8gSWdub3JlIGNvaW5jaWRlbnQgcG9pbnRzLlxuICAgIHN3aXRjaCAodGhpcy5fcG9pbnQpIHtcbiAgICAgIGNhc2UgMDogdGhpcy5fcG9pbnQgPSAxOyB0aGlzLl9saW5lID8gdGhpcy5fY29udGV4dC5saW5lVG8oeCwgeSkgOiB0aGlzLl9jb250ZXh0Lm1vdmVUbyh4LCB5KTsgYnJlYWs7XG4gICAgICBjYXNlIDE6IHRoaXMuX3BvaW50ID0gMjsgYnJlYWs7XG4gICAgICBjYXNlIDI6IHRoaXMuX3BvaW50ID0gMzsgcG9pbnQodGhpcywgc2xvcGUyKHRoaXMsIHQxID0gc2xvcGUzKHRoaXMsIHgsIHkpKSwgdDEpOyBicmVhaztcbiAgICAgIGRlZmF1bHQ6IHBvaW50KHRoaXMsIHRoaXMuX3QwLCB0MSA9IHNsb3BlMyh0aGlzLCB4LCB5KSk7IGJyZWFrO1xuICAgIH1cblxuICAgIHRoaXMuX3gwID0gdGhpcy5feDEsIHRoaXMuX3gxID0geDtcbiAgICB0aGlzLl95MCA9IHRoaXMuX3kxLCB0aGlzLl95MSA9IHk7XG4gICAgdGhpcy5fdDAgPSB0MTtcbiAgfVxufVxuXG5mdW5jdGlvbiBNb25vdG9uZVkoY29udGV4dCkge1xuICB0aGlzLl9jb250ZXh0ID0gbmV3IFJlZmxlY3RDb250ZXh0KGNvbnRleHQpO1xufVxuXG4oTW9ub3RvbmVZLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoTW9ub3RvbmVYLnByb3RvdHlwZSkpLnBvaW50ID0gZnVuY3Rpb24oeCwgeSkge1xuICBNb25vdG9uZVgucHJvdG90eXBlLnBvaW50LmNhbGwodGhpcywgeSwgeCk7XG59O1xuXG5mdW5jdGlvbiBSZWZsZWN0Q29udGV4dChjb250ZXh0KSB7XG4gIHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xufVxuXG5SZWZsZWN0Q29udGV4dC5wcm90b3R5cGUgPSB7XG4gIG1vdmVUbzogZnVuY3Rpb24oeCwgeSkgeyB0aGlzLl9jb250ZXh0Lm1vdmVUbyh5LCB4KTsgfSxcbiAgY2xvc2VQYXRoOiBmdW5jdGlvbigpIHsgdGhpcy5fY29udGV4dC5jbG9zZVBhdGgoKTsgfSxcbiAgbGluZVRvOiBmdW5jdGlvbih4LCB5KSB7IHRoaXMuX2NvbnRleHQubGluZVRvKHksIHgpOyB9LFxuICBiZXppZXJDdXJ2ZVRvOiBmdW5jdGlvbih4MSwgeTEsIHgyLCB5MiwgeCwgeSkgeyB0aGlzLl9jb250ZXh0LmJlemllckN1cnZlVG8oeTEsIHgxLCB5MiwgeDIsIHksIHgpOyB9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gbW9ub3RvbmVYKGNvbnRleHQpIHtcbiAgcmV0dXJuIG5ldyBNb25vdG9uZVgoY29udGV4dCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb25vdG9uZVkoY29udGV4dCkge1xuICByZXR1cm4gbmV3IE1vbm90b25lWShjb250ZXh0KTtcbn1cbiIsCiAgICAiZnVuY3Rpb24gTmF0dXJhbChjb250ZXh0KSB7XG4gIHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xufVxuXG5OYXR1cmFsLnByb3RvdHlwZSA9IHtcbiAgYXJlYVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9saW5lID0gMDtcbiAgfSxcbiAgYXJlYUVuZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fbGluZSA9IE5hTjtcbiAgfSxcbiAgbGluZVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl94ID0gW107XG4gICAgdGhpcy5feSA9IFtdO1xuICB9LFxuICBsaW5lRW5kOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgeCA9IHRoaXMuX3gsXG4gICAgICAgIHkgPSB0aGlzLl95LFxuICAgICAgICBuID0geC5sZW5ndGg7XG5cbiAgICBpZiAobikge1xuICAgICAgdGhpcy5fbGluZSA/IHRoaXMuX2NvbnRleHQubGluZVRvKHhbMF0sIHlbMF0pIDogdGhpcy5fY29udGV4dC5tb3ZlVG8oeFswXSwgeVswXSk7XG4gICAgICBpZiAobiA9PT0gMikge1xuICAgICAgICB0aGlzLl9jb250ZXh0LmxpbmVUbyh4WzFdLCB5WzFdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBweCA9IGNvbnRyb2xQb2ludHMoeCksXG4gICAgICAgICAgICBweSA9IGNvbnRyb2xQb2ludHMoeSk7XG4gICAgICAgIGZvciAodmFyIGkwID0gMCwgaTEgPSAxOyBpMSA8IG47ICsraTAsICsraTEpIHtcbiAgICAgICAgICB0aGlzLl9jb250ZXh0LmJlemllckN1cnZlVG8ocHhbMF1baTBdLCBweVswXVtpMF0sIHB4WzFdW2kwXSwgcHlbMV1baTBdLCB4W2kxXSwgeVtpMV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2xpbmUgfHwgKHRoaXMuX2xpbmUgIT09IDAgJiYgbiA9PT0gMSkpIHRoaXMuX2NvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgdGhpcy5fbGluZSA9IDEgLSB0aGlzLl9saW5lO1xuICAgIHRoaXMuX3ggPSB0aGlzLl95ID0gbnVsbDtcbiAgfSxcbiAgcG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICB0aGlzLl94LnB1c2goK3gpO1xuICAgIHRoaXMuX3kucHVzaCgreSk7XG4gIH1cbn07XG5cbi8vIFNlZSBodHRwczovL3d3dy5wYXJ0aWNsZWluY2VsbC5jb20vMjAxMi9iZXppZXItc3BsaW5lcy8gZm9yIGRlcml2YXRpb24uXG5mdW5jdGlvbiBjb250cm9sUG9pbnRzKHgpIHtcbiAgdmFyIGksXG4gICAgICBuID0geC5sZW5ndGggLSAxLFxuICAgICAgbSxcbiAgICAgIGEgPSBuZXcgQXJyYXkobiksXG4gICAgICBiID0gbmV3IEFycmF5KG4pLFxuICAgICAgciA9IG5ldyBBcnJheShuKTtcbiAgYVswXSA9IDAsIGJbMF0gPSAyLCByWzBdID0geFswXSArIDIgKiB4WzFdO1xuICBmb3IgKGkgPSAxOyBpIDwgbiAtIDE7ICsraSkgYVtpXSA9IDEsIGJbaV0gPSA0LCByW2ldID0gNCAqIHhbaV0gKyAyICogeFtpICsgMV07XG4gIGFbbiAtIDFdID0gMiwgYltuIC0gMV0gPSA3LCByW24gLSAxXSA9IDggKiB4W24gLSAxXSArIHhbbl07XG4gIGZvciAoaSA9IDE7IGkgPCBuOyArK2kpIG0gPSBhW2ldIC8gYltpIC0gMV0sIGJbaV0gLT0gbSwgcltpXSAtPSBtICogcltpIC0gMV07XG4gIGFbbiAtIDFdID0gcltuIC0gMV0gLyBiW24gLSAxXTtcbiAgZm9yIChpID0gbiAtIDI7IGkgPj0gMDsgLS1pKSBhW2ldID0gKHJbaV0gLSBhW2kgKyAxXSkgLyBiW2ldO1xuICBiW24gLSAxXSA9ICh4W25dICsgYVtuIC0gMV0pIC8gMjtcbiAgZm9yIChpID0gMDsgaSA8IG4gLSAxOyArK2kpIGJbaV0gPSAyICogeFtpICsgMV0gLSBhW2kgKyAxXTtcbiAgcmV0dXJuIFthLCBiXTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY29udGV4dCkge1xuICByZXR1cm4gbmV3IE5hdHVyYWwoY29udGV4dCk7XG59XG4iLAogICAgImZ1bmN0aW9uIFN0ZXAoY29udGV4dCwgdCkge1xuICB0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcbiAgdGhpcy5fdCA9IHQ7XG59XG5cblN0ZXAucHJvdG90eXBlID0ge1xuICBhcmVhU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2xpbmUgPSAwO1xuICB9LFxuICBhcmVhRW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9saW5lID0gTmFOO1xuICB9LFxuICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3ggPSB0aGlzLl95ID0gTmFOO1xuICAgIHRoaXMuX3BvaW50ID0gMDtcbiAgfSxcbiAgbGluZUVuZDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKDAgPCB0aGlzLl90ICYmIHRoaXMuX3QgPCAxICYmIHRoaXMuX3BvaW50ID09PSAyKSB0aGlzLl9jb250ZXh0LmxpbmVUbyh0aGlzLl94LCB0aGlzLl95KTtcbiAgICBpZiAodGhpcy5fbGluZSB8fCAodGhpcy5fbGluZSAhPT0gMCAmJiB0aGlzLl9wb2ludCA9PT0gMSkpIHRoaXMuX2NvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgaWYgKHRoaXMuX2xpbmUgPj0gMCkgdGhpcy5fdCA9IDEgLSB0aGlzLl90LCB0aGlzLl9saW5lID0gMSAtIHRoaXMuX2xpbmU7XG4gIH0sXG4gIHBvaW50OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgeCA9ICt4LCB5ID0gK3k7XG4gICAgc3dpdGNoICh0aGlzLl9wb2ludCkge1xuICAgICAgY2FzZSAwOiB0aGlzLl9wb2ludCA9IDE7IHRoaXMuX2xpbmUgPyB0aGlzLl9jb250ZXh0LmxpbmVUbyh4LCB5KSA6IHRoaXMuX2NvbnRleHQubW92ZVRvKHgsIHkpOyBicmVhaztcbiAgICAgIGNhc2UgMTogdGhpcy5fcG9pbnQgPSAyOyAvLyBmYWxscyB0aHJvdWdoXG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIGlmICh0aGlzLl90IDw9IDApIHtcbiAgICAgICAgICB0aGlzLl9jb250ZXh0LmxpbmVUbyh0aGlzLl94LCB5KTtcbiAgICAgICAgICB0aGlzLl9jb250ZXh0LmxpbmVUbyh4LCB5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgeDEgPSB0aGlzLl94ICogKDEgLSB0aGlzLl90KSArIHggKiB0aGlzLl90O1xuICAgICAgICAgIHRoaXMuX2NvbnRleHQubGluZVRvKHgxLCB0aGlzLl95KTtcbiAgICAgICAgICB0aGlzLl9jb250ZXh0LmxpbmVUbyh4MSwgeSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX3ggPSB4LCB0aGlzLl95ID0geTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY29udGV4dCkge1xuICByZXR1cm4gbmV3IFN0ZXAoY29udGV4dCwgMC41KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0ZXBCZWZvcmUoY29udGV4dCkge1xuICByZXR1cm4gbmV3IFN0ZXAoY29udGV4dCwgMCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGVwQWZ0ZXIoY29udGV4dCkge1xuICByZXR1cm4gbmV3IFN0ZXAoY29udGV4dCwgMSk7XG59XG4iLAogICAgInZhciBub29wID0ge3ZhbHVlOiAoKSA9PiB7fX07XG5cbmZ1bmN0aW9uIGRpc3BhdGNoKCkge1xuICBmb3IgKHZhciBpID0gMCwgbiA9IGFyZ3VtZW50cy5sZW5ndGgsIF8gPSB7fSwgdDsgaSA8IG47ICsraSkge1xuICAgIGlmICghKHQgPSBhcmd1bWVudHNbaV0gKyBcIlwiKSB8fCAodCBpbiBfKSB8fCAvW1xccy5dLy50ZXN0KHQpKSB0aHJvdyBuZXcgRXJyb3IoXCJpbGxlZ2FsIHR5cGU6IFwiICsgdCk7XG4gICAgX1t0XSA9IFtdO1xuICB9XG4gIHJldHVybiBuZXcgRGlzcGF0Y2goXyk7XG59XG5cbmZ1bmN0aW9uIERpc3BhdGNoKF8pIHtcbiAgdGhpcy5fID0gXztcbn1cblxuZnVuY3Rpb24gcGFyc2VUeXBlbmFtZXModHlwZW5hbWVzLCB0eXBlcykge1xuICByZXR1cm4gdHlwZW5hbWVzLnRyaW0oKS5zcGxpdCgvXnxcXHMrLykubWFwKGZ1bmN0aW9uKHQpIHtcbiAgICB2YXIgbmFtZSA9IFwiXCIsIGkgPSB0LmluZGV4T2YoXCIuXCIpO1xuICAgIGlmIChpID49IDApIG5hbWUgPSB0LnNsaWNlKGkgKyAxKSwgdCA9IHQuc2xpY2UoMCwgaSk7XG4gICAgaWYgKHQgJiYgIXR5cGVzLmhhc093blByb3BlcnR5KHQpKSB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIHR5cGU6IFwiICsgdCk7XG4gICAgcmV0dXJuIHt0eXBlOiB0LCBuYW1lOiBuYW1lfTtcbiAgfSk7XG59XG5cbkRpc3BhdGNoLnByb3RvdHlwZSA9IGRpc3BhdGNoLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IERpc3BhdGNoLFxuICBvbjogZnVuY3Rpb24odHlwZW5hbWUsIGNhbGxiYWNrKSB7XG4gICAgdmFyIF8gPSB0aGlzLl8sXG4gICAgICAgIFQgPSBwYXJzZVR5cGVuYW1lcyh0eXBlbmFtZSArIFwiXCIsIF8pLFxuICAgICAgICB0LFxuICAgICAgICBpID0gLTEsXG4gICAgICAgIG4gPSBULmxlbmd0aDtcblxuICAgIC8vIElmIG5vIGNhbGxiYWNrIHdhcyBzcGVjaWZpZWQsIHJldHVybiB0aGUgY2FsbGJhY2sgb2YgdGhlIGdpdmVuIHR5cGUgYW5kIG5hbWUuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgICB3aGlsZSAoKytpIDwgbikgaWYgKCh0ID0gKHR5cGVuYW1lID0gVFtpXSkudHlwZSkgJiYgKHQgPSBnZXQoX1t0XSwgdHlwZW5hbWUubmFtZSkpKSByZXR1cm4gdDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJZiBhIHR5cGUgd2FzIHNwZWNpZmllZCwgc2V0IHRoZSBjYWxsYmFjayBmb3IgdGhlIGdpdmVuIHR5cGUgYW5kIG5hbWUuXG4gICAgLy8gT3RoZXJ3aXNlLCBpZiBhIG51bGwgY2FsbGJhY2sgd2FzIHNwZWNpZmllZCwgcmVtb3ZlIGNhbGxiYWNrcyBvZiB0aGUgZ2l2ZW4gbmFtZS5cbiAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCAmJiB0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBjYWxsYmFjazogXCIgKyBjYWxsYmFjayk7XG4gICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgIGlmICh0ID0gKHR5cGVuYW1lID0gVFtpXSkudHlwZSkgX1t0XSA9IHNldChfW3RdLCB0eXBlbmFtZS5uYW1lLCBjYWxsYmFjayk7XG4gICAgICBlbHNlIGlmIChjYWxsYmFjayA9PSBudWxsKSBmb3IgKHQgaW4gXykgX1t0XSA9IHNldChfW3RdLCB0eXBlbmFtZS5uYW1lLCBudWxsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgY29weTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNvcHkgPSB7fSwgXyA9IHRoaXMuXztcbiAgICBmb3IgKHZhciB0IGluIF8pIGNvcHlbdF0gPSBfW3RdLnNsaWNlKCk7XG4gICAgcmV0dXJuIG5ldyBEaXNwYXRjaChjb3B5KTtcbiAgfSxcbiAgY2FsbDogZnVuY3Rpb24odHlwZSwgdGhhdCkge1xuICAgIGlmICgobiA9IGFyZ3VtZW50cy5sZW5ndGggLSAyKSA+IDApIGZvciAodmFyIGFyZ3MgPSBuZXcgQXJyYXkobiksIGkgPSAwLCBuLCB0OyBpIDwgbjsgKytpKSBhcmdzW2ldID0gYXJndW1lbnRzW2kgKyAyXTtcbiAgICBpZiAoIXRoaXMuXy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkgdGhyb3cgbmV3IEVycm9yKFwidW5rbm93biB0eXBlOiBcIiArIHR5cGUpO1xuICAgIGZvciAodCA9IHRoaXMuX1t0eXBlXSwgaSA9IDAsIG4gPSB0Lmxlbmd0aDsgaSA8IG47ICsraSkgdFtpXS52YWx1ZS5hcHBseSh0aGF0LCBhcmdzKTtcbiAgfSxcbiAgYXBwbHk6IGZ1bmN0aW9uKHR5cGUsIHRoYXQsIGFyZ3MpIHtcbiAgICBpZiAoIXRoaXMuXy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkgdGhyb3cgbmV3IEVycm9yKFwidW5rbm93biB0eXBlOiBcIiArIHR5cGUpO1xuICAgIGZvciAodmFyIHQgPSB0aGlzLl9bdHlwZV0sIGkgPSAwLCBuID0gdC5sZW5ndGg7IGkgPCBuOyArK2kpIHRbaV0udmFsdWUuYXBwbHkodGhhdCwgYXJncyk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGdldCh0eXBlLCBuYW1lKSB7XG4gIGZvciAodmFyIGkgPSAwLCBuID0gdHlwZS5sZW5ndGgsIGM7IGkgPCBuOyArK2kpIHtcbiAgICBpZiAoKGMgPSB0eXBlW2ldKS5uYW1lID09PSBuYW1lKSB7XG4gICAgICByZXR1cm4gYy52YWx1ZTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0KHR5cGUsIG5hbWUsIGNhbGxiYWNrKSB7XG4gIGZvciAodmFyIGkgPSAwLCBuID0gdHlwZS5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICBpZiAodHlwZVtpXS5uYW1lID09PSBuYW1lKSB7XG4gICAgICB0eXBlW2ldID0gbm9vcCwgdHlwZSA9IHR5cGUuc2xpY2UoMCwgaSkuY29uY2F0KHR5cGUuc2xpY2UoaSArIDEpKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBpZiAoY2FsbGJhY2sgIT0gbnVsbCkgdHlwZS5wdXNoKHtuYW1lOiBuYW1lLCB2YWx1ZTogY2FsbGJhY2t9KTtcbiAgcmV0dXJuIHR5cGU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRpc3BhdGNoO1xuIiwKICAgICJ2YXIgZnJhbWUgPSAwLCAvLyBpcyBhbiBhbmltYXRpb24gZnJhbWUgcGVuZGluZz9cbiAgICB0aW1lb3V0ID0gMCwgLy8gaXMgYSB0aW1lb3V0IHBlbmRpbmc/XG4gICAgaW50ZXJ2YWwgPSAwLCAvLyBhcmUgYW55IHRpbWVycyBhY3RpdmU/XG4gICAgcG9rZURlbGF5ID0gMTAwMCwgLy8gaG93IGZyZXF1ZW50bHkgd2UgY2hlY2sgZm9yIGNsb2NrIHNrZXdcbiAgICB0YXNrSGVhZCxcbiAgICB0YXNrVGFpbCxcbiAgICBjbG9ja0xhc3QgPSAwLFxuICAgIGNsb2NrTm93ID0gMCxcbiAgICBjbG9ja1NrZXcgPSAwLFxuICAgIGNsb2NrID0gdHlwZW9mIHBlcmZvcm1hbmNlID09PSBcIm9iamVjdFwiICYmIHBlcmZvcm1hbmNlLm5vdyA/IHBlcmZvcm1hbmNlIDogRGF0ZSxcbiAgICBzZXRGcmFtZSA9IHR5cGVvZiB3aW5kb3cgPT09IFwib2JqZWN0XCIgJiYgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA/IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUuYmluZCh3aW5kb3cpIDogZnVuY3Rpb24oZikgeyBzZXRUaW1lb3V0KGYsIDE3KTsgfTtcblxuZXhwb3J0IGZ1bmN0aW9uIG5vdygpIHtcbiAgcmV0dXJuIGNsb2NrTm93IHx8IChzZXRGcmFtZShjbGVhck5vdyksIGNsb2NrTm93ID0gY2xvY2subm93KCkgKyBjbG9ja1NrZXcpO1xufVxuXG5mdW5jdGlvbiBjbGVhck5vdygpIHtcbiAgY2xvY2tOb3cgPSAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gVGltZXIoKSB7XG4gIHRoaXMuX2NhbGwgPVxuICB0aGlzLl90aW1lID1cbiAgdGhpcy5fbmV4dCA9IG51bGw7XG59XG5cblRpbWVyLnByb3RvdHlwZSA9IHRpbWVyLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IFRpbWVyLFxuICByZXN0YXJ0OiBmdW5jdGlvbihjYWxsYmFjaywgZGVsYXksIHRpbWUpIHtcbiAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJjYWxsYmFjayBpcyBub3QgYSBmdW5jdGlvblwiKTtcbiAgICB0aW1lID0gKHRpbWUgPT0gbnVsbCA/IG5vdygpIDogK3RpbWUpICsgKGRlbGF5ID09IG51bGwgPyAwIDogK2RlbGF5KTtcbiAgICBpZiAoIXRoaXMuX25leHQgJiYgdGFza1RhaWwgIT09IHRoaXMpIHtcbiAgICAgIGlmICh0YXNrVGFpbCkgdGFza1RhaWwuX25leHQgPSB0aGlzO1xuICAgICAgZWxzZSB0YXNrSGVhZCA9IHRoaXM7XG4gICAgICB0YXNrVGFpbCA9IHRoaXM7XG4gICAgfVxuICAgIHRoaXMuX2NhbGwgPSBjYWxsYmFjaztcbiAgICB0aGlzLl90aW1lID0gdGltZTtcbiAgICBzbGVlcCgpO1xuICB9LFxuICBzdG9wOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5fY2FsbCkge1xuICAgICAgdGhpcy5fY2FsbCA9IG51bGw7XG4gICAgICB0aGlzLl90aW1lID0gSW5maW5pdHk7XG4gICAgICBzbGVlcCgpO1xuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHRpbWVyKGNhbGxiYWNrLCBkZWxheSwgdGltZSkge1xuICB2YXIgdCA9IG5ldyBUaW1lcjtcbiAgdC5yZXN0YXJ0KGNhbGxiYWNrLCBkZWxheSwgdGltZSk7XG4gIHJldHVybiB0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdGltZXJGbHVzaCgpIHtcbiAgbm93KCk7IC8vIEdldCB0aGUgY3VycmVudCB0aW1lLCBpZiBub3QgYWxyZWFkeSBzZXQuXG4gICsrZnJhbWU7IC8vIFByZXRlbmQgd2XigJl2ZSBzZXQgYW4gYWxhcm0sIGlmIHdlIGhhdmVu4oCZdCBhbHJlYWR5LlxuICB2YXIgdCA9IHRhc2tIZWFkLCBlO1xuICB3aGlsZSAodCkge1xuICAgIGlmICgoZSA9IGNsb2NrTm93IC0gdC5fdGltZSkgPj0gMCkgdC5fY2FsbC5jYWxsKHVuZGVmaW5lZCwgZSk7XG4gICAgdCA9IHQuX25leHQ7XG4gIH1cbiAgLS1mcmFtZTtcbn1cblxuZnVuY3Rpb24gd2FrZSgpIHtcbiAgY2xvY2tOb3cgPSAoY2xvY2tMYXN0ID0gY2xvY2subm93KCkpICsgY2xvY2tTa2V3O1xuICBmcmFtZSA9IHRpbWVvdXQgPSAwO1xuICB0cnkge1xuICAgIHRpbWVyRmx1c2goKTtcbiAgfSBmaW5hbGx5IHtcbiAgICBmcmFtZSA9IDA7XG4gICAgbmFwKCk7XG4gICAgY2xvY2tOb3cgPSAwO1xuICB9XG59XG5cbmZ1bmN0aW9uIHBva2UoKSB7XG4gIHZhciBub3cgPSBjbG9jay5ub3coKSwgZGVsYXkgPSBub3cgLSBjbG9ja0xhc3Q7XG4gIGlmIChkZWxheSA+IHBva2VEZWxheSkgY2xvY2tTa2V3IC09IGRlbGF5LCBjbG9ja0xhc3QgPSBub3c7XG59XG5cbmZ1bmN0aW9uIG5hcCgpIHtcbiAgdmFyIHQwLCB0MSA9IHRhc2tIZWFkLCB0MiwgdGltZSA9IEluZmluaXR5O1xuICB3aGlsZSAodDEpIHtcbiAgICBpZiAodDEuX2NhbGwpIHtcbiAgICAgIGlmICh0aW1lID4gdDEuX3RpbWUpIHRpbWUgPSB0MS5fdGltZTtcbiAgICAgIHQwID0gdDEsIHQxID0gdDEuX25leHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHQyID0gdDEuX25leHQsIHQxLl9uZXh0ID0gbnVsbDtcbiAgICAgIHQxID0gdDAgPyB0MC5fbmV4dCA9IHQyIDogdGFza0hlYWQgPSB0MjtcbiAgICB9XG4gIH1cbiAgdGFza1RhaWwgPSB0MDtcbiAgc2xlZXAodGltZSk7XG59XG5cbmZ1bmN0aW9uIHNsZWVwKHRpbWUpIHtcbiAgaWYgKGZyYW1lKSByZXR1cm47IC8vIFNvb25lc3QgYWxhcm0gYWxyZWFkeSBzZXQsIG9yIHdpbGwgYmUuXG4gIGlmICh0aW1lb3V0KSB0aW1lb3V0ID0gY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICB2YXIgZGVsYXkgPSB0aW1lIC0gY2xvY2tOb3c7IC8vIFN0cmljdGx5IGxlc3MgdGhhbiBpZiB3ZSByZWNvbXB1dGVkIGNsb2NrTm93LlxuICBpZiAoZGVsYXkgPiAyNCkge1xuICAgIGlmICh0aW1lIDwgSW5maW5pdHkpIHRpbWVvdXQgPSBzZXRUaW1lb3V0KHdha2UsIHRpbWUgLSBjbG9jay5ub3coKSAtIGNsb2NrU2tldyk7XG4gICAgaWYgKGludGVydmFsKSBpbnRlcnZhbCA9IGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICB9IGVsc2Uge1xuICAgIGlmICghaW50ZXJ2YWwpIGNsb2NrTGFzdCA9IGNsb2NrLm5vdygpLCBpbnRlcnZhbCA9IHNldEludGVydmFsKHBva2UsIHBva2VEZWxheSk7XG4gICAgZnJhbWUgPSAxLCBzZXRGcmFtZSh3YWtlKTtcbiAgfVxufVxuIiwKICAgICJpbXBvcnQge1RpbWVyfSBmcm9tIFwiLi90aW1lci5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjYWxsYmFjaywgZGVsYXksIHRpbWUpIHtcbiAgdmFyIHQgPSBuZXcgVGltZXI7XG4gIGRlbGF5ID0gZGVsYXkgPT0gbnVsbCA/IDAgOiArZGVsYXk7XG4gIHQucmVzdGFydChlbGFwc2VkID0+IHtcbiAgICB0LnN0b3AoKTtcbiAgICBjYWxsYmFjayhlbGFwc2VkICsgZGVsYXkpO1xuICB9LCBkZWxheSwgdGltZSk7XG4gIHJldHVybiB0O1xufVxuIiwKICAgICJpbXBvcnQge2Rpc3BhdGNofSBmcm9tIFwiZDMtZGlzcGF0Y2hcIjtcbmltcG9ydCB7dGltZXIsIHRpbWVvdXR9IGZyb20gXCJkMy10aW1lclwiO1xuXG52YXIgZW1wdHlPbiA9IGRpc3BhdGNoKFwic3RhcnRcIiwgXCJlbmRcIiwgXCJjYW5jZWxcIiwgXCJpbnRlcnJ1cHRcIik7XG52YXIgZW1wdHlUd2VlbiA9IFtdO1xuXG5leHBvcnQgdmFyIENSRUFURUQgPSAwO1xuZXhwb3J0IHZhciBTQ0hFRFVMRUQgPSAxO1xuZXhwb3J0IHZhciBTVEFSVElORyA9IDI7XG5leHBvcnQgdmFyIFNUQVJURUQgPSAzO1xuZXhwb3J0IHZhciBSVU5OSU5HID0gNDtcbmV4cG9ydCB2YXIgRU5ESU5HID0gNTtcbmV4cG9ydCB2YXIgRU5ERUQgPSA2O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihub2RlLCBuYW1lLCBpZCwgaW5kZXgsIGdyb3VwLCB0aW1pbmcpIHtcbiAgdmFyIHNjaGVkdWxlcyA9IG5vZGUuX190cmFuc2l0aW9uO1xuICBpZiAoIXNjaGVkdWxlcykgbm9kZS5fX3RyYW5zaXRpb24gPSB7fTtcbiAgZWxzZSBpZiAoaWQgaW4gc2NoZWR1bGVzKSByZXR1cm47XG4gIGNyZWF0ZShub2RlLCBpZCwge1xuICAgIG5hbWU6IG5hbWUsXG4gICAgaW5kZXg6IGluZGV4LCAvLyBGb3IgY29udGV4dCBkdXJpbmcgY2FsbGJhY2suXG4gICAgZ3JvdXA6IGdyb3VwLCAvLyBGb3IgY29udGV4dCBkdXJpbmcgY2FsbGJhY2suXG4gICAgb246IGVtcHR5T24sXG4gICAgdHdlZW46IGVtcHR5VHdlZW4sXG4gICAgdGltZTogdGltaW5nLnRpbWUsXG4gICAgZGVsYXk6IHRpbWluZy5kZWxheSxcbiAgICBkdXJhdGlvbjogdGltaW5nLmR1cmF0aW9uLFxuICAgIGVhc2U6IHRpbWluZy5lYXNlLFxuICAgIHRpbWVyOiBudWxsLFxuICAgIHN0YXRlOiBDUkVBVEVEXG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdChub2RlLCBpZCkge1xuICB2YXIgc2NoZWR1bGUgPSBnZXQobm9kZSwgaWQpO1xuICBpZiAoc2NoZWR1bGUuc3RhdGUgPiBDUkVBVEVEKSB0aHJvdyBuZXcgRXJyb3IoXCJ0b28gbGF0ZTsgYWxyZWFkeSBzY2hlZHVsZWRcIik7XG4gIHJldHVybiBzY2hlZHVsZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldChub2RlLCBpZCkge1xuICB2YXIgc2NoZWR1bGUgPSBnZXQobm9kZSwgaWQpO1xuICBpZiAoc2NoZWR1bGUuc3RhdGUgPiBTVEFSVEVEKSB0aHJvdyBuZXcgRXJyb3IoXCJ0b28gbGF0ZTsgYWxyZWFkeSBydW5uaW5nXCIpO1xuICByZXR1cm4gc2NoZWR1bGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXQobm9kZSwgaWQpIHtcbiAgdmFyIHNjaGVkdWxlID0gbm9kZS5fX3RyYW5zaXRpb247XG4gIGlmICghc2NoZWR1bGUgfHwgIShzY2hlZHVsZSA9IHNjaGVkdWxlW2lkXSkpIHRocm93IG5ldyBFcnJvcihcInRyYW5zaXRpb24gbm90IGZvdW5kXCIpO1xuICByZXR1cm4gc2NoZWR1bGU7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZShub2RlLCBpZCwgc2VsZikge1xuICB2YXIgc2NoZWR1bGVzID0gbm9kZS5fX3RyYW5zaXRpb24sXG4gICAgICB0d2VlbjtcblxuICAvLyBJbml0aWFsaXplIHRoZSBzZWxmIHRpbWVyIHdoZW4gdGhlIHRyYW5zaXRpb24gaXMgY3JlYXRlZC5cbiAgLy8gTm90ZSB0aGUgYWN0dWFsIGRlbGF5IGlzIG5vdCBrbm93biB1bnRpbCB0aGUgZmlyc3QgY2FsbGJhY2shXG4gIHNjaGVkdWxlc1tpZF0gPSBzZWxmO1xuICBzZWxmLnRpbWVyID0gdGltZXIoc2NoZWR1bGUsIDAsIHNlbGYudGltZSk7XG5cbiAgZnVuY3Rpb24gc2NoZWR1bGUoZWxhcHNlZCkge1xuICAgIHNlbGYuc3RhdGUgPSBTQ0hFRFVMRUQ7XG4gICAgc2VsZi50aW1lci5yZXN0YXJ0KHN0YXJ0LCBzZWxmLmRlbGF5LCBzZWxmLnRpbWUpO1xuXG4gICAgLy8gSWYgdGhlIGVsYXBzZWQgZGVsYXkgaXMgbGVzcyB0aGFuIG91ciBmaXJzdCBzbGVlcCwgc3RhcnQgaW1tZWRpYXRlbHkuXG4gICAgaWYgKHNlbGYuZGVsYXkgPD0gZWxhcHNlZCkgc3RhcnQoZWxhcHNlZCAtIHNlbGYuZGVsYXkpO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RhcnQoZWxhcHNlZCkge1xuICAgIHZhciBpLCBqLCBuLCBvO1xuXG4gICAgLy8gSWYgdGhlIHN0YXRlIGlzIG5vdCBTQ0hFRFVMRUQsIHRoZW4gd2UgcHJldmlvdXNseSBlcnJvcmVkIG9uIHN0YXJ0LlxuICAgIGlmIChzZWxmLnN0YXRlICE9PSBTQ0hFRFVMRUQpIHJldHVybiBzdG9wKCk7XG5cbiAgICBmb3IgKGkgaW4gc2NoZWR1bGVzKSB7XG4gICAgICBvID0gc2NoZWR1bGVzW2ldO1xuICAgICAgaWYgKG8ubmFtZSAhPT0gc2VsZi5uYW1lKSBjb250aW51ZTtcblxuICAgICAgLy8gV2hpbGUgdGhpcyBlbGVtZW50IGFscmVhZHkgaGFzIGEgc3RhcnRpbmcgdHJhbnNpdGlvbiBkdXJpbmcgdGhpcyBmcmFtZSxcbiAgICAgIC8vIGRlZmVyIHN0YXJ0aW5nIGFuIGludGVycnVwdGluZyB0cmFuc2l0aW9uIHVudGlsIHRoYXQgdHJhbnNpdGlvbiBoYXMgYVxuICAgICAgLy8gY2hhbmNlIHRvIHRpY2sgKGFuZCBwb3NzaWJseSBlbmQpOyBzZWUgZDMvZDMtdHJhbnNpdGlvbiM1NCFcbiAgICAgIGlmIChvLnN0YXRlID09PSBTVEFSVEVEKSByZXR1cm4gdGltZW91dChzdGFydCk7XG5cbiAgICAgIC8vIEludGVycnVwdCB0aGUgYWN0aXZlIHRyYW5zaXRpb24sIGlmIGFueS5cbiAgICAgIGlmIChvLnN0YXRlID09PSBSVU5OSU5HKSB7XG4gICAgICAgIG8uc3RhdGUgPSBFTkRFRDtcbiAgICAgICAgby50aW1lci5zdG9wKCk7XG4gICAgICAgIG8ub24uY2FsbChcImludGVycnVwdFwiLCBub2RlLCBub2RlLl9fZGF0YV9fLCBvLmluZGV4LCBvLmdyb3VwKTtcbiAgICAgICAgZGVsZXRlIHNjaGVkdWxlc1tpXTtcbiAgICAgIH1cblxuICAgICAgLy8gQ2FuY2VsIGFueSBwcmUtZW1wdGVkIHRyYW5zaXRpb25zLlxuICAgICAgZWxzZSBpZiAoK2kgPCBpZCkge1xuICAgICAgICBvLnN0YXRlID0gRU5ERUQ7XG4gICAgICAgIG8udGltZXIuc3RvcCgpO1xuICAgICAgICBvLm9uLmNhbGwoXCJjYW5jZWxcIiwgbm9kZSwgbm9kZS5fX2RhdGFfXywgby5pbmRleCwgby5ncm91cCk7XG4gICAgICAgIGRlbGV0ZSBzY2hlZHVsZXNbaV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGVmZXIgdGhlIGZpcnN0IHRpY2sgdG8gZW5kIG9mIHRoZSBjdXJyZW50IGZyYW1lOyBzZWUgZDMvZDMjMTU3Ni5cbiAgICAvLyBOb3RlIHRoZSB0cmFuc2l0aW9uIG1heSBiZSBjYW5jZWxlZCBhZnRlciBzdGFydCBhbmQgYmVmb3JlIHRoZSBmaXJzdCB0aWNrIVxuICAgIC8vIE5vdGUgdGhpcyBtdXN0IGJlIHNjaGVkdWxlZCBiZWZvcmUgdGhlIHN0YXJ0IGV2ZW50OyBzZWUgZDMvZDMtdHJhbnNpdGlvbiMxNiFcbiAgICAvLyBBc3N1bWluZyB0aGlzIGlzIHN1Y2Nlc3NmdWwsIHN1YnNlcXVlbnQgY2FsbGJhY2tzIGdvIHN0cmFpZ2h0IHRvIHRpY2suXG4gICAgdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIGlmIChzZWxmLnN0YXRlID09PSBTVEFSVEVEKSB7XG4gICAgICAgIHNlbGYuc3RhdGUgPSBSVU5OSU5HO1xuICAgICAgICBzZWxmLnRpbWVyLnJlc3RhcnQodGljaywgc2VsZi5kZWxheSwgc2VsZi50aW1lKTtcbiAgICAgICAgdGljayhlbGFwc2VkKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIERpc3BhdGNoIHRoZSBzdGFydCBldmVudC5cbiAgICAvLyBOb3RlIHRoaXMgbXVzdCBiZSBkb25lIGJlZm9yZSB0aGUgdHdlZW4gYXJlIGluaXRpYWxpemVkLlxuICAgIHNlbGYuc3RhdGUgPSBTVEFSVElORztcbiAgICBzZWxmLm9uLmNhbGwoXCJzdGFydFwiLCBub2RlLCBub2RlLl9fZGF0YV9fLCBzZWxmLmluZGV4LCBzZWxmLmdyb3VwKTtcbiAgICBpZiAoc2VsZi5zdGF0ZSAhPT0gU1RBUlRJTkcpIHJldHVybjsgLy8gaW50ZXJydXB0ZWRcbiAgICBzZWxmLnN0YXRlID0gU1RBUlRFRDtcblxuICAgIC8vIEluaXRpYWxpemUgdGhlIHR3ZWVuLCBkZWxldGluZyBudWxsIHR3ZWVuLlxuICAgIHR3ZWVuID0gbmV3IEFycmF5KG4gPSBzZWxmLnR3ZWVuLmxlbmd0aCk7XG4gICAgZm9yIChpID0gMCwgaiA9IC0xOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobyA9IHNlbGYudHdlZW5baV0udmFsdWUuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBzZWxmLmluZGV4LCBzZWxmLmdyb3VwKSkge1xuICAgICAgICB0d2VlblsrK2pdID0gbztcbiAgICAgIH1cbiAgICB9XG4gICAgdHdlZW4ubGVuZ3RoID0gaiArIDE7XG4gIH1cblxuICBmdW5jdGlvbiB0aWNrKGVsYXBzZWQpIHtcbiAgICB2YXIgdCA9IGVsYXBzZWQgPCBzZWxmLmR1cmF0aW9uID8gc2VsZi5lYXNlLmNhbGwobnVsbCwgZWxhcHNlZCAvIHNlbGYuZHVyYXRpb24pIDogKHNlbGYudGltZXIucmVzdGFydChzdG9wKSwgc2VsZi5zdGF0ZSA9IEVORElORywgMSksXG4gICAgICAgIGkgPSAtMSxcbiAgICAgICAgbiA9IHR3ZWVuLmxlbmd0aDtcblxuICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICB0d2VlbltpXS5jYWxsKG5vZGUsIHQpO1xuICAgIH1cblxuICAgIC8vIERpc3BhdGNoIHRoZSBlbmQgZXZlbnQuXG4gICAgaWYgKHNlbGYuc3RhdGUgPT09IEVORElORykge1xuICAgICAgc2VsZi5vbi5jYWxsKFwiZW5kXCIsIG5vZGUsIG5vZGUuX19kYXRhX18sIHNlbGYuaW5kZXgsIHNlbGYuZ3JvdXApO1xuICAgICAgc3RvcCgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgc2VsZi5zdGF0ZSA9IEVOREVEO1xuICAgIHNlbGYudGltZXIuc3RvcCgpO1xuICAgIGRlbGV0ZSBzY2hlZHVsZXNbaWRdO1xuICAgIGZvciAodmFyIGkgaW4gc2NoZWR1bGVzKSByZXR1cm47IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICBkZWxldGUgbm9kZS5fX3RyYW5zaXRpb247XG4gIH1cbn1cbiIsCiAgICAiaW1wb3J0IHtTVEFSVElORywgRU5ESU5HLCBFTkRFRH0gZnJvbSBcIi4vdHJhbnNpdGlvbi9zY2hlZHVsZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihub2RlLCBuYW1lKSB7XG4gIHZhciBzY2hlZHVsZXMgPSBub2RlLl9fdHJhbnNpdGlvbixcbiAgICAgIHNjaGVkdWxlLFxuICAgICAgYWN0aXZlLFxuICAgICAgZW1wdHkgPSB0cnVlLFxuICAgICAgaTtcblxuICBpZiAoIXNjaGVkdWxlcykgcmV0dXJuO1xuXG4gIG5hbWUgPSBuYW1lID09IG51bGwgPyBudWxsIDogbmFtZSArIFwiXCI7XG5cbiAgZm9yIChpIGluIHNjaGVkdWxlcykge1xuICAgIGlmICgoc2NoZWR1bGUgPSBzY2hlZHVsZXNbaV0pLm5hbWUgIT09IG5hbWUpIHsgZW1wdHkgPSBmYWxzZTsgY29udGludWU7IH1cbiAgICBhY3RpdmUgPSBzY2hlZHVsZS5zdGF0ZSA+IFNUQVJUSU5HICYmIHNjaGVkdWxlLnN0YXRlIDwgRU5ESU5HO1xuICAgIHNjaGVkdWxlLnN0YXRlID0gRU5ERUQ7XG4gICAgc2NoZWR1bGUudGltZXIuc3RvcCgpO1xuICAgIHNjaGVkdWxlLm9uLmNhbGwoYWN0aXZlID8gXCJpbnRlcnJ1cHRcIiA6IFwiY2FuY2VsXCIsIG5vZGUsIG5vZGUuX19kYXRhX18sIHNjaGVkdWxlLmluZGV4LCBzY2hlZHVsZS5ncm91cCk7XG4gICAgZGVsZXRlIHNjaGVkdWxlc1tpXTtcbiAgfVxuXG4gIGlmIChlbXB0eSkgZGVsZXRlIG5vZGUuX190cmFuc2l0aW9uO1xufVxuIiwKICAgICJpbXBvcnQgaW50ZXJydXB0IGZyb20gXCIuLi9pbnRlcnJ1cHQuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSkge1xuICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgIGludGVycnVwdCh0aGlzLCBuYW1lKTtcbiAgfSk7XG59XG4iLAogICAgImltcG9ydCB7Z2V0LCBzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmZ1bmN0aW9uIHR3ZWVuUmVtb3ZlKGlkLCBuYW1lKSB7XG4gIHZhciB0d2VlbjAsIHR3ZWVuMTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzY2hlZHVsZSA9IHNldCh0aGlzLCBpZCksXG4gICAgICAgIHR3ZWVuID0gc2NoZWR1bGUudHdlZW47XG5cbiAgICAvLyBJZiB0aGlzIG5vZGUgc2hhcmVkIHR3ZWVuIHdpdGggdGhlIHByZXZpb3VzIG5vZGUsXG4gICAgLy8ganVzdCBhc3NpZ24gdGhlIHVwZGF0ZWQgc2hhcmVkIHR3ZWVuIGFuZCB3ZeKAmXJlIGRvbmUhXG4gICAgLy8gT3RoZXJ3aXNlLCBjb3B5LW9uLXdyaXRlLlxuICAgIGlmICh0d2VlbiAhPT0gdHdlZW4wKSB7XG4gICAgICB0d2VlbjEgPSB0d2VlbjAgPSB0d2VlbjtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBuID0gdHdlZW4xLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgICAgICBpZiAodHdlZW4xW2ldLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgICB0d2VlbjEgPSB0d2VlbjEuc2xpY2UoKTtcbiAgICAgICAgICB0d2VlbjEuc3BsaWNlKGksIDEpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2NoZWR1bGUudHdlZW4gPSB0d2VlbjE7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHR3ZWVuRnVuY3Rpb24oaWQsIG5hbWUsIHZhbHVlKSB7XG4gIHZhciB0d2VlbjAsIHR3ZWVuMTtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3I7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2NoZWR1bGUgPSBzZXQodGhpcywgaWQpLFxuICAgICAgICB0d2VlbiA9IHNjaGVkdWxlLnR3ZWVuO1xuXG4gICAgLy8gSWYgdGhpcyBub2RlIHNoYXJlZCB0d2VlbiB3aXRoIHRoZSBwcmV2aW91cyBub2RlLFxuICAgIC8vIGp1c3QgYXNzaWduIHRoZSB1cGRhdGVkIHNoYXJlZCB0d2VlbiBhbmQgd2XigJlyZSBkb25lIVxuICAgIC8vIE90aGVyd2lzZSwgY29weS1vbi13cml0ZS5cbiAgICBpZiAodHdlZW4gIT09IHR3ZWVuMCkge1xuICAgICAgdHdlZW4xID0gKHR3ZWVuMCA9IHR3ZWVuKS5zbGljZSgpO1xuICAgICAgZm9yICh2YXIgdCA9IHtuYW1lOiBuYW1lLCB2YWx1ZTogdmFsdWV9LCBpID0gMCwgbiA9IHR3ZWVuMS5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICAgICAgaWYgKHR3ZWVuMVtpXS5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgICAgdHdlZW4xW2ldID0gdDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGkgPT09IG4pIHR3ZWVuMS5wdXNoKHQpO1xuICAgIH1cblxuICAgIHNjaGVkdWxlLnR3ZWVuID0gdHdlZW4xO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICB2YXIgaWQgPSB0aGlzLl9pZDtcblxuICBuYW1lICs9IFwiXCI7XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgdmFyIHR3ZWVuID0gZ2V0KHRoaXMubm9kZSgpLCBpZCkudHdlZW47XG4gICAgZm9yICh2YXIgaSA9IDAsIG4gPSB0d2Vlbi5sZW5ndGgsIHQ7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmICgodCA9IHR3ZWVuW2ldKS5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgIHJldHVybiB0LnZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmVhY2goKHZhbHVlID09IG51bGwgPyB0d2VlblJlbW92ZSA6IHR3ZWVuRnVuY3Rpb24pKGlkLCBuYW1lLCB2YWx1ZSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHdlZW5WYWx1ZSh0cmFuc2l0aW9uLCBuYW1lLCB2YWx1ZSkge1xuICB2YXIgaWQgPSB0cmFuc2l0aW9uLl9pZDtcblxuICB0cmFuc2l0aW9uLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNjaGVkdWxlID0gc2V0KHRoaXMsIGlkKTtcbiAgICAoc2NoZWR1bGUudmFsdWUgfHwgKHNjaGVkdWxlLnZhbHVlID0ge30pKVtuYW1lXSA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH0pO1xuXG4gIHJldHVybiBmdW5jdGlvbihub2RlKSB7XG4gICAgcmV0dXJuIGdldChub2RlLCBpZCkudmFsdWVbbmFtZV07XG4gIH07XG59XG4iLAogICAgImltcG9ydCB7Y29sb3J9IGZyb20gXCJkMy1jb2xvclwiO1xuaW1wb3J0IHtpbnRlcnBvbGF0ZU51bWJlciwgaW50ZXJwb2xhdGVSZ2IsIGludGVycG9sYXRlU3RyaW5nfSBmcm9tIFwiZDMtaW50ZXJwb2xhdGVcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICB2YXIgYztcbiAgcmV0dXJuICh0eXBlb2YgYiA9PT0gXCJudW1iZXJcIiA/IGludGVycG9sYXRlTnVtYmVyXG4gICAgICA6IGIgaW5zdGFuY2VvZiBjb2xvciA/IGludGVycG9sYXRlUmdiXG4gICAgICA6IChjID0gY29sb3IoYikpID8gKGIgPSBjLCBpbnRlcnBvbGF0ZVJnYilcbiAgICAgIDogaW50ZXJwb2xhdGVTdHJpbmcpKGEsIGIpO1xufVxuIiwKICAgICJpbXBvcnQge2ludGVycG9sYXRlVHJhbnNmb3JtU3ZnIGFzIGludGVycG9sYXRlVHJhbnNmb3JtfSBmcm9tIFwiZDMtaW50ZXJwb2xhdGVcIjtcbmltcG9ydCB7bmFtZXNwYWNlfSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQge3R3ZWVuVmFsdWV9IGZyb20gXCIuL3R3ZWVuLmpzXCI7XG5pbXBvcnQgaW50ZXJwb2xhdGUgZnJvbSBcIi4vaW50ZXJwb2xhdGUuanNcIjtcblxuZnVuY3Rpb24gYXR0clJlbW92ZShuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0clJlbW92ZU5TKGZ1bGxuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJDb25zdGFudChuYW1lLCBpbnRlcnBvbGF0ZSwgdmFsdWUxKSB7XG4gIHZhciBzdHJpbmcwMCxcbiAgICAgIHN0cmluZzEgPSB2YWx1ZTEgKyBcIlwiLFxuICAgICAgaW50ZXJwb2xhdGUwO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0cmluZzAgPSB0aGlzLmdldEF0dHJpYnV0ZShuYW1lKTtcbiAgICByZXR1cm4gc3RyaW5nMCA9PT0gc3RyaW5nMSA/IG51bGxcbiAgICAgICAgOiBzdHJpbmcwID09PSBzdHJpbmcwMCA/IGludGVycG9sYXRlMFxuICAgICAgICA6IGludGVycG9sYXRlMCA9IGludGVycG9sYXRlKHN0cmluZzAwID0gc3RyaW5nMCwgdmFsdWUxKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckNvbnN0YW50TlMoZnVsbG5hbWUsIGludGVycG9sYXRlLCB2YWx1ZTEpIHtcbiAgdmFyIHN0cmluZzAwLFxuICAgICAgc3RyaW5nMSA9IHZhbHVlMSArIFwiXCIsXG4gICAgICBpbnRlcnBvbGF0ZTA7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RyaW5nMCA9IHRoaXMuZ2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgICByZXR1cm4gc3RyaW5nMCA9PT0gc3RyaW5nMSA/IG51bGxcbiAgICAgICAgOiBzdHJpbmcwID09PSBzdHJpbmcwMCA/IGludGVycG9sYXRlMFxuICAgICAgICA6IGludGVycG9sYXRlMCA9IGludGVycG9sYXRlKHN0cmluZzAwID0gc3RyaW5nMCwgdmFsdWUxKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckZ1bmN0aW9uKG5hbWUsIGludGVycG9sYXRlLCB2YWx1ZSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxMCxcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwLCB2YWx1ZTEgPSB2YWx1ZSh0aGlzKSwgc3RyaW5nMTtcbiAgICBpZiAodmFsdWUxID09IG51bGwpIHJldHVybiB2b2lkIHRoaXMucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgIHN0cmluZzAgPSB0aGlzLmdldEF0dHJpYnV0ZShuYW1lKTtcbiAgICBzdHJpbmcxID0gdmFsdWUxICsgXCJcIjtcbiAgICByZXR1cm4gc3RyaW5nMCA9PT0gc3RyaW5nMSA/IG51bGxcbiAgICAgICAgOiBzdHJpbmcwID09PSBzdHJpbmcwMCAmJiBzdHJpbmcxID09PSBzdHJpbmcxMCA/IGludGVycG9sYXRlMFxuICAgICAgICA6IChzdHJpbmcxMCA9IHN0cmluZzEsIGludGVycG9sYXRlMCA9IGludGVycG9sYXRlKHN0cmluZzAwID0gc3RyaW5nMCwgdmFsdWUxKSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJGdW5jdGlvbk5TKGZ1bGxuYW1lLCBpbnRlcnBvbGF0ZSwgdmFsdWUpIHtcbiAgdmFyIHN0cmluZzAwLFxuICAgICAgc3RyaW5nMTAsXG4gICAgICBpbnRlcnBvbGF0ZTA7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RyaW5nMCwgdmFsdWUxID0gdmFsdWUodGhpcyksIHN0cmluZzE7XG4gICAgaWYgKHZhbHVlMSA9PSBudWxsKSByZXR1cm4gdm9pZCB0aGlzLnJlbW92ZUF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gICAgc3RyaW5nMCA9IHRoaXMuZ2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgICBzdHJpbmcxID0gdmFsdWUxICsgXCJcIjtcbiAgICByZXR1cm4gc3RyaW5nMCA9PT0gc3RyaW5nMSA/IG51bGxcbiAgICAgICAgOiBzdHJpbmcwID09PSBzdHJpbmcwMCAmJiBzdHJpbmcxID09PSBzdHJpbmcxMCA/IGludGVycG9sYXRlMFxuICAgICAgICA6IChzdHJpbmcxMCA9IHN0cmluZzEsIGludGVycG9sYXRlMCA9IGludGVycG9sYXRlKHN0cmluZzAwID0gc3RyaW5nMCwgdmFsdWUxKSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gIHZhciBmdWxsbmFtZSA9IG5hbWVzcGFjZShuYW1lKSwgaSA9IGZ1bGxuYW1lID09PSBcInRyYW5zZm9ybVwiID8gaW50ZXJwb2xhdGVUcmFuc2Zvcm0gOiBpbnRlcnBvbGF0ZTtcbiAgcmV0dXJuIHRoaXMuYXR0clR3ZWVuKG5hbWUsIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICA/IChmdWxsbmFtZS5sb2NhbCA/IGF0dHJGdW5jdGlvbk5TIDogYXR0ckZ1bmN0aW9uKShmdWxsbmFtZSwgaSwgdHdlZW5WYWx1ZSh0aGlzLCBcImF0dHIuXCIgKyBuYW1lLCB2YWx1ZSkpXG4gICAgICA6IHZhbHVlID09IG51bGwgPyAoZnVsbG5hbWUubG9jYWwgPyBhdHRyUmVtb3ZlTlMgOiBhdHRyUmVtb3ZlKShmdWxsbmFtZSlcbiAgICAgIDogKGZ1bGxuYW1lLmxvY2FsID8gYXR0ckNvbnN0YW50TlMgOiBhdHRyQ29uc3RhbnQpKGZ1bGxuYW1lLCBpLCB2YWx1ZSkpO1xufVxuIiwKICAgICJpbXBvcnQge25hbWVzcGFjZX0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuXG5mdW5jdGlvbiBhdHRySW50ZXJwb2xhdGUobmFtZSwgaSkge1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIHRoaXMuc2V0QXR0cmlidXRlKG5hbWUsIGkuY2FsbCh0aGlzLCB0KSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJJbnRlcnBvbGF0ZU5TKGZ1bGxuYW1lLCBpKSB7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgdGhpcy5zZXRBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwsIGkuY2FsbCh0aGlzLCB0KSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJUd2Vlbk5TKGZ1bGxuYW1lLCB2YWx1ZSkge1xuICB2YXIgdDAsIGkwO1xuICBmdW5jdGlvbiB0d2VlbigpIHtcbiAgICB2YXIgaSA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKGkgIT09IGkwKSB0MCA9IChpMCA9IGkpICYmIGF0dHJJbnRlcnBvbGF0ZU5TKGZ1bGxuYW1lLCBpKTtcbiAgICByZXR1cm4gdDA7XG4gIH1cbiAgdHdlZW4uX3ZhbHVlID0gdmFsdWU7XG4gIHJldHVybiB0d2Vlbjtcbn1cblxuZnVuY3Rpb24gYXR0clR3ZWVuKG5hbWUsIHZhbHVlKSB7XG4gIHZhciB0MCwgaTA7XG4gIGZ1bmN0aW9uIHR3ZWVuKCkge1xuICAgIHZhciBpID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAoaSAhPT0gaTApIHQwID0gKGkwID0gaSkgJiYgYXR0ckludGVycG9sYXRlKG5hbWUsIGkpO1xuICAgIHJldHVybiB0MDtcbiAgfVxuICB0d2Vlbi5fdmFsdWUgPSB2YWx1ZTtcbiAgcmV0dXJuIHR3ZWVuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICB2YXIga2V5ID0gXCJhdHRyLlwiICsgbmFtZTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSByZXR1cm4gKGtleSA9IHRoaXMudHdlZW4oa2V5KSkgJiYga2V5Ll92YWx1ZTtcbiAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiB0aGlzLnR3ZWVuKGtleSwgbnVsbCk7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICB2YXIgZnVsbG5hbWUgPSBuYW1lc3BhY2UobmFtZSk7XG4gIHJldHVybiB0aGlzLnR3ZWVuKGtleSwgKGZ1bGxuYW1lLmxvY2FsID8gYXR0clR3ZWVuTlMgOiBhdHRyVHdlZW4pKGZ1bGxuYW1lLCB2YWx1ZSkpO1xufVxuIiwKICAgICJpbXBvcnQge2dldCwgaW5pdH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZnVuY3Rpb24gZGVsYXlGdW5jdGlvbihpZCwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGluaXQodGhpcywgaWQpLmRlbGF5ID0gK3ZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGRlbGF5Q29uc3RhbnQoaWQsIHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9ICt2YWx1ZSwgZnVuY3Rpb24oKSB7XG4gICAgaW5pdCh0aGlzLCBpZCkuZGVsYXkgPSB2YWx1ZTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgdmFyIGlkID0gdGhpcy5faWQ7XG5cbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gdGhpcy5lYWNoKCh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgID8gZGVsYXlGdW5jdGlvblxuICAgICAgICAgIDogZGVsYXlDb25zdGFudCkoaWQsIHZhbHVlKSlcbiAgICAgIDogZ2V0KHRoaXMubm9kZSgpLCBpZCkuZGVsYXk7XG59XG4iLAogICAgImltcG9ydCB7Z2V0LCBzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmZ1bmN0aW9uIGR1cmF0aW9uRnVuY3Rpb24oaWQsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBzZXQodGhpcywgaWQpLmR1cmF0aW9uID0gK3ZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGR1cmF0aW9uQ29uc3RhbnQoaWQsIHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9ICt2YWx1ZSwgZnVuY3Rpb24oKSB7XG4gICAgc2V0KHRoaXMsIGlkKS5kdXJhdGlvbiA9IHZhbHVlO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICB2YXIgaWQgPSB0aGlzLl9pZDtcblxuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyB0aGlzLmVhY2goKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgPyBkdXJhdGlvbkZ1bmN0aW9uXG4gICAgICAgICAgOiBkdXJhdGlvbkNvbnN0YW50KShpZCwgdmFsdWUpKVxuICAgICAgOiBnZXQodGhpcy5ub2RlKCksIGlkKS5kdXJhdGlvbjtcbn1cbiIsCiAgICAiaW1wb3J0IHtnZXQsIHNldH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZnVuY3Rpb24gZWFzZUNvbnN0YW50KGlkLCB2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcjtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHNldCh0aGlzLCBpZCkuZWFzZSA9IHZhbHVlO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICB2YXIgaWQgPSB0aGlzLl9pZDtcblxuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyB0aGlzLmVhY2goZWFzZUNvbnN0YW50KGlkLCB2YWx1ZSkpXG4gICAgICA6IGdldCh0aGlzLm5vZGUoKSwgaWQpLmVhc2U7XG59XG4iLAogICAgImltcG9ydCB7c2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5mdW5jdGlvbiBlYXNlVmFyeWluZyhpZCwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAodHlwZW9mIHYgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICAgIHNldCh0aGlzLCBpZCkuZWFzZSA9IHY7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICByZXR1cm4gdGhpcy5lYWNoKGVhc2VWYXJ5aW5nKHRoaXMuX2lkLCB2YWx1ZSkpO1xufVxuIiwKICAgICJpbXBvcnQge21hdGNoZXJ9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCB7VHJhbnNpdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obWF0Y2gpIHtcbiAgaWYgKHR5cGVvZiBtYXRjaCAhPT0gXCJmdW5jdGlvblwiKSBtYXRjaCA9IG1hdGNoZXIobWF0Y2gpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IG5ldyBBcnJheShtKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgc3ViZ3JvdXAgPSBzdWJncm91cHNbal0gPSBbXSwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmICgobm9kZSA9IGdyb3VwW2ldKSAmJiBtYXRjaC5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSkge1xuICAgICAgICBzdWJncm91cC5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgVHJhbnNpdGlvbihzdWJncm91cHMsIHRoaXMuX3BhcmVudHMsIHRoaXMuX25hbWUsIHRoaXMuX2lkKTtcbn1cbiIsCiAgICAiaW1wb3J0IHtUcmFuc2l0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih0cmFuc2l0aW9uKSB7XG4gIGlmICh0cmFuc2l0aW9uLl9pZCAhPT0gdGhpcy5faWQpIHRocm93IG5ldyBFcnJvcjtcblxuICBmb3IgKHZhciBncm91cHMwID0gdGhpcy5fZ3JvdXBzLCBncm91cHMxID0gdHJhbnNpdGlvbi5fZ3JvdXBzLCBtMCA9IGdyb3VwczAubGVuZ3RoLCBtMSA9IGdyb3VwczEubGVuZ3RoLCBtID0gTWF0aC5taW4obTAsIG0xKSwgbWVyZ2VzID0gbmV3IEFycmF5KG0wKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cDAgPSBncm91cHMwW2pdLCBncm91cDEgPSBncm91cHMxW2pdLCBuID0gZ3JvdXAwLmxlbmd0aCwgbWVyZ2UgPSBtZXJnZXNbal0gPSBuZXcgQXJyYXkobiksIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwMFtpXSB8fCBncm91cDFbaV0pIHtcbiAgICAgICAgbWVyZ2VbaV0gPSBub2RlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBqIDwgbTA7ICsraikge1xuICAgIG1lcmdlc1tqXSA9IGdyb3VwczBbal07XG4gIH1cblxuICByZXR1cm4gbmV3IFRyYW5zaXRpb24obWVyZ2VzLCB0aGlzLl9wYXJlbnRzLCB0aGlzLl9uYW1lLCB0aGlzLl9pZCk7XG59XG4iLAogICAgImltcG9ydCB7Z2V0LCBzZXQsIGluaXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmZ1bmN0aW9uIHN0YXJ0KG5hbWUpIHtcbiAgcmV0dXJuIChuYW1lICsgXCJcIikudHJpbSgpLnNwbGl0KC9efFxccysvKS5ldmVyeShmdW5jdGlvbih0KSB7XG4gICAgdmFyIGkgPSB0LmluZGV4T2YoXCIuXCIpO1xuICAgIGlmIChpID49IDApIHQgPSB0LnNsaWNlKDAsIGkpO1xuICAgIHJldHVybiAhdCB8fCB0ID09PSBcInN0YXJ0XCI7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBvbkZ1bmN0aW9uKGlkLCBuYW1lLCBsaXN0ZW5lcikge1xuICB2YXIgb24wLCBvbjEsIHNpdCA9IHN0YXJ0KG5hbWUpID8gaW5pdCA6IHNldDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzY2hlZHVsZSA9IHNpdCh0aGlzLCBpZCksXG4gICAgICAgIG9uID0gc2NoZWR1bGUub247XG5cbiAgICAvLyBJZiB0aGlzIG5vZGUgc2hhcmVkIGEgZGlzcGF0Y2ggd2l0aCB0aGUgcHJldmlvdXMgbm9kZSxcbiAgICAvLyBqdXN0IGFzc2lnbiB0aGUgdXBkYXRlZCBzaGFyZWQgZGlzcGF0Y2ggYW5kIHdl4oCZcmUgZG9uZSFcbiAgICAvLyBPdGhlcndpc2UsIGNvcHktb24td3JpdGUuXG4gICAgaWYgKG9uICE9PSBvbjApIChvbjEgPSAob24wID0gb24pLmNvcHkoKSkub24obmFtZSwgbGlzdGVuZXIpO1xuXG4gICAgc2NoZWR1bGUub24gPSBvbjE7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIGxpc3RlbmVyKSB7XG4gIHZhciBpZCA9IHRoaXMuX2lkO1xuXG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoIDwgMlxuICAgICAgPyBnZXQodGhpcy5ub2RlKCksIGlkKS5vbi5vbihuYW1lKVxuICAgICAgOiB0aGlzLmVhY2gob25GdW5jdGlvbihpZCwgbmFtZSwgbGlzdGVuZXIpKTtcbn1cbiIsCiAgICAiZnVuY3Rpb24gcmVtb3ZlRnVuY3Rpb24oaWQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBwYXJlbnQgPSB0aGlzLnBhcmVudE5vZGU7XG4gICAgZm9yICh2YXIgaSBpbiB0aGlzLl9fdHJhbnNpdGlvbikgaWYgKCtpICE9PSBpZCkgcmV0dXJuO1xuICAgIGlmIChwYXJlbnQpIHBhcmVudC5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLm9uKFwiZW5kLnJlbW92ZVwiLCByZW1vdmVGdW5jdGlvbih0aGlzLl9pZCkpO1xufVxuIiwKICAgICJpbXBvcnQge3NlbGVjdG9yfSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQge1RyYW5zaXRpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQgc2NoZWR1bGUsIHtnZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdCkge1xuICB2YXIgbmFtZSA9IHRoaXMuX25hbWUsXG4gICAgICBpZCA9IHRoaXMuX2lkO1xuXG4gIGlmICh0eXBlb2Ygc2VsZWN0ICE9PSBcImZ1bmN0aW9uXCIpIHNlbGVjdCA9IHNlbGVjdG9yKHNlbGVjdCk7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgc3ViZ3JvdXBzID0gbmV3IEFycmF5KG0pLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBzdWJncm91cCA9IHN1Ymdyb3Vwc1tqXSA9IG5ldyBBcnJheShuKSwgbm9kZSwgc3Vibm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmICgobm9kZSA9IGdyb3VwW2ldKSAmJiAoc3Vibm9kZSA9IHNlbGVjdC5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSkpIHtcbiAgICAgICAgaWYgKFwiX19kYXRhX19cIiBpbiBub2RlKSBzdWJub2RlLl9fZGF0YV9fID0gbm9kZS5fX2RhdGFfXztcbiAgICAgICAgc3ViZ3JvdXBbaV0gPSBzdWJub2RlO1xuICAgICAgICBzY2hlZHVsZShzdWJncm91cFtpXSwgbmFtZSwgaWQsIGksIHN1Ymdyb3VwLCBnZXQobm9kZSwgaWQpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFRyYW5zaXRpb24oc3ViZ3JvdXBzLCB0aGlzLl9wYXJlbnRzLCBuYW1lLCBpZCk7XG59XG4iLAogICAgImltcG9ydCB7c2VsZWN0b3JBbGx9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCB7VHJhbnNpdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCBzY2hlZHVsZSwge2dldH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0KSB7XG4gIHZhciBuYW1lID0gdGhpcy5fbmFtZSxcbiAgICAgIGlkID0gdGhpcy5faWQ7XG5cbiAgaWYgKHR5cGVvZiBzZWxlY3QgIT09IFwiZnVuY3Rpb25cIikgc2VsZWN0ID0gc2VsZWN0b3JBbGwoc2VsZWN0KTtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBzdWJncm91cHMgPSBbXSwgcGFyZW50cyA9IFtdLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgICBmb3IgKHZhciBjaGlsZHJlbiA9IHNlbGVjdC5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSwgY2hpbGQsIGluaGVyaXQgPSBnZXQobm9kZSwgaWQpLCBrID0gMCwgbCA9IGNoaWxkcmVuLmxlbmd0aDsgayA8IGw7ICsraykge1xuICAgICAgICAgIGlmIChjaGlsZCA9IGNoaWxkcmVuW2tdKSB7XG4gICAgICAgICAgICBzY2hlZHVsZShjaGlsZCwgbmFtZSwgaWQsIGssIGNoaWxkcmVuLCBpbmhlcml0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc3ViZ3JvdXBzLnB1c2goY2hpbGRyZW4pO1xuICAgICAgICBwYXJlbnRzLnB1c2gobm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBUcmFuc2l0aW9uKHN1Ymdyb3VwcywgcGFyZW50cywgbmFtZSwgaWQpO1xufVxuIiwKICAgICJpbXBvcnQge3NlbGVjdGlvbn0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuXG52YXIgU2VsZWN0aW9uID0gc2VsZWN0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvcjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKHRoaXMuX2dyb3VwcywgdGhpcy5fcGFyZW50cyk7XG59XG4iLAogICAgImltcG9ydCB7aW50ZXJwb2xhdGVUcmFuc2Zvcm1Dc3MgYXMgaW50ZXJwb2xhdGVUcmFuc2Zvcm19IGZyb20gXCJkMy1pbnRlcnBvbGF0ZVwiO1xuaW1wb3J0IHtzdHlsZX0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHtzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5pbXBvcnQge3R3ZWVuVmFsdWV9IGZyb20gXCIuL3R3ZWVuLmpzXCI7XG5pbXBvcnQgaW50ZXJwb2xhdGUgZnJvbSBcIi4vaW50ZXJwb2xhdGUuanNcIjtcblxuZnVuY3Rpb24gc3R5bGVOdWxsKG5hbWUsIGludGVycG9sYXRlKSB7XG4gIHZhciBzdHJpbmcwMCxcbiAgICAgIHN0cmluZzEwLFxuICAgICAgaW50ZXJwb2xhdGUwO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0cmluZzAgPSBzdHlsZSh0aGlzLCBuYW1lKSxcbiAgICAgICAgc3RyaW5nMSA9ICh0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpLCBzdHlsZSh0aGlzLCBuYW1lKSk7XG4gICAgcmV0dXJuIHN0cmluZzAgPT09IHN0cmluZzEgPyBudWxsXG4gICAgICAgIDogc3RyaW5nMCA9PT0gc3RyaW5nMDAgJiYgc3RyaW5nMSA9PT0gc3RyaW5nMTAgPyBpbnRlcnBvbGF0ZTBcbiAgICAgICAgOiBpbnRlcnBvbGF0ZTAgPSBpbnRlcnBvbGF0ZShzdHJpbmcwMCA9IHN0cmluZzAsIHN0cmluZzEwID0gc3RyaW5nMSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0eWxlUmVtb3ZlKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3R5bGUucmVtb3ZlUHJvcGVydHkobmFtZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0eWxlQ29uc3RhbnQobmFtZSwgaW50ZXJwb2xhdGUsIHZhbHVlMSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxID0gdmFsdWUxICsgXCJcIixcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwID0gc3R5bGUodGhpcywgbmFtZSk7XG4gICAgcmV0dXJuIHN0cmluZzAgPT09IHN0cmluZzEgPyBudWxsXG4gICAgICAgIDogc3RyaW5nMCA9PT0gc3RyaW5nMDAgPyBpbnRlcnBvbGF0ZTBcbiAgICAgICAgOiBpbnRlcnBvbGF0ZTAgPSBpbnRlcnBvbGF0ZShzdHJpbmcwMCA9IHN0cmluZzAsIHZhbHVlMSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0eWxlRnVuY3Rpb24obmFtZSwgaW50ZXJwb2xhdGUsIHZhbHVlKSB7XG4gIHZhciBzdHJpbmcwMCxcbiAgICAgIHN0cmluZzEwLFxuICAgICAgaW50ZXJwb2xhdGUwO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0cmluZzAgPSBzdHlsZSh0aGlzLCBuYW1lKSxcbiAgICAgICAgdmFsdWUxID0gdmFsdWUodGhpcyksXG4gICAgICAgIHN0cmluZzEgPSB2YWx1ZTEgKyBcIlwiO1xuICAgIGlmICh2YWx1ZTEgPT0gbnVsbCkgc3RyaW5nMSA9IHZhbHVlMSA9ICh0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpLCBzdHlsZSh0aGlzLCBuYW1lKSk7XG4gICAgcmV0dXJuIHN0cmluZzAgPT09IHN0cmluZzEgPyBudWxsXG4gICAgICAgIDogc3RyaW5nMCA9PT0gc3RyaW5nMDAgJiYgc3RyaW5nMSA9PT0gc3RyaW5nMTAgPyBpbnRlcnBvbGF0ZTBcbiAgICAgICAgOiAoc3RyaW5nMTAgPSBzdHJpbmcxLCBpbnRlcnBvbGF0ZTAgPSBpbnRlcnBvbGF0ZShzdHJpbmcwMCA9IHN0cmluZzAsIHZhbHVlMSkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZU1heWJlUmVtb3ZlKGlkLCBuYW1lKSB7XG4gIHZhciBvbjAsIG9uMSwgbGlzdGVuZXIwLCBrZXkgPSBcInN0eWxlLlwiICsgbmFtZSwgZXZlbnQgPSBcImVuZC5cIiArIGtleSwgcmVtb3ZlO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNjaGVkdWxlID0gc2V0KHRoaXMsIGlkKSxcbiAgICAgICAgb24gPSBzY2hlZHVsZS5vbixcbiAgICAgICAgbGlzdGVuZXIgPSBzY2hlZHVsZS52YWx1ZVtrZXldID09IG51bGwgPyByZW1vdmUgfHwgKHJlbW92ZSA9IHN0eWxlUmVtb3ZlKG5hbWUpKSA6IHVuZGVmaW5lZDtcblxuICAgIC8vIElmIHRoaXMgbm9kZSBzaGFyZWQgYSBkaXNwYXRjaCB3aXRoIHRoZSBwcmV2aW91cyBub2RlLFxuICAgIC8vIGp1c3QgYXNzaWduIHRoZSB1cGRhdGVkIHNoYXJlZCBkaXNwYXRjaCBhbmQgd2XigJlyZSBkb25lIVxuICAgIC8vIE90aGVyd2lzZSwgY29weS1vbi13cml0ZS5cbiAgICBpZiAob24gIT09IG9uMCB8fCBsaXN0ZW5lcjAgIT09IGxpc3RlbmVyKSAob24xID0gKG9uMCA9IG9uKS5jb3B5KCkpLm9uKGV2ZW50LCBsaXN0ZW5lcjAgPSBsaXN0ZW5lcik7XG5cbiAgICBzY2hlZHVsZS5vbiA9IG9uMTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUsIHByaW9yaXR5KSB7XG4gIHZhciBpID0gKG5hbWUgKz0gXCJcIikgPT09IFwidHJhbnNmb3JtXCIgPyBpbnRlcnBvbGF0ZVRyYW5zZm9ybSA6IGludGVycG9sYXRlO1xuICByZXR1cm4gdmFsdWUgPT0gbnVsbCA/IHRoaXNcbiAgICAgIC5zdHlsZVR3ZWVuKG5hbWUsIHN0eWxlTnVsbChuYW1lLCBpKSlcbiAgICAgIC5vbihcImVuZC5zdHlsZS5cIiArIG5hbWUsIHN0eWxlUmVtb3ZlKG5hbWUpKVxuICAgIDogdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIgPyB0aGlzXG4gICAgICAuc3R5bGVUd2VlbihuYW1lLCBzdHlsZUZ1bmN0aW9uKG5hbWUsIGksIHR3ZWVuVmFsdWUodGhpcywgXCJzdHlsZS5cIiArIG5hbWUsIHZhbHVlKSkpXG4gICAgICAuZWFjaChzdHlsZU1heWJlUmVtb3ZlKHRoaXMuX2lkLCBuYW1lKSlcbiAgICA6IHRoaXNcbiAgICAgIC5zdHlsZVR3ZWVuKG5hbWUsIHN0eWxlQ29uc3RhbnQobmFtZSwgaSwgdmFsdWUpLCBwcmlvcml0eSlcbiAgICAgIC5vbihcImVuZC5zdHlsZS5cIiArIG5hbWUsIG51bGwpO1xufVxuIiwKICAgICJmdW5jdGlvbiBzdHlsZUludGVycG9sYXRlKG5hbWUsIGksIHByaW9yaXR5KSB7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgdGhpcy5zdHlsZS5zZXRQcm9wZXJ0eShuYW1lLCBpLmNhbGwodGhpcywgdCksIHByaW9yaXR5KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3R5bGVUd2VlbihuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpIHtcbiAgdmFyIHQsIGkwO1xuICBmdW5jdGlvbiB0d2VlbigpIHtcbiAgICB2YXIgaSA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKGkgIT09IGkwKSB0ID0gKGkwID0gaSkgJiYgc3R5bGVJbnRlcnBvbGF0ZShuYW1lLCBpLCBwcmlvcml0eSk7XG4gICAgcmV0dXJuIHQ7XG4gIH1cbiAgdHdlZW4uX3ZhbHVlID0gdmFsdWU7XG4gIHJldHVybiB0d2Vlbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUsIHByaW9yaXR5KSB7XG4gIHZhciBrZXkgPSBcInN0eWxlLlwiICsgKG5hbWUgKz0gXCJcIik7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikgcmV0dXJuIChrZXkgPSB0aGlzLnR3ZWVuKGtleSkpICYmIGtleS5fdmFsdWU7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gdGhpcy50d2VlbihrZXksIG51bGwpO1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcjtcbiAgcmV0dXJuIHRoaXMudHdlZW4oa2V5LCBzdHlsZVR3ZWVuKG5hbWUsIHZhbHVlLCBwcmlvcml0eSA9PSBudWxsID8gXCJcIiA6IHByaW9yaXR5KSk7XG59XG4iLAogICAgImltcG9ydCB7dHdlZW5WYWx1ZX0gZnJvbSBcIi4vdHdlZW4uanNcIjtcblxuZnVuY3Rpb24gdGV4dENvbnN0YW50KHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnRleHRDb250ZW50ID0gdmFsdWU7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHRleHRGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlMSA9IHZhbHVlKHRoaXMpO1xuICAgIHRoaXMudGV4dENvbnRlbnQgPSB2YWx1ZTEgPT0gbnVsbCA/IFwiXCIgOiB2YWx1ZTE7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiB0aGlzLnR3ZWVuKFwidGV4dFwiLCB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgPyB0ZXh0RnVuY3Rpb24odHdlZW5WYWx1ZSh0aGlzLCBcInRleHRcIiwgdmFsdWUpKVxuICAgICAgOiB0ZXh0Q29uc3RhbnQodmFsdWUgPT0gbnVsbCA/IFwiXCIgOiB2YWx1ZSArIFwiXCIpKTtcbn1cbiIsCiAgICAiZnVuY3Rpb24gdGV4dEludGVycG9sYXRlKGkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICB0aGlzLnRleHRDb250ZW50ID0gaS5jYWxsKHRoaXMsIHQpO1xuICB9O1xufVxuXG5mdW5jdGlvbiB0ZXh0VHdlZW4odmFsdWUpIHtcbiAgdmFyIHQwLCBpMDtcbiAgZnVuY3Rpb24gdHdlZW4oKSB7XG4gICAgdmFyIGkgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmIChpICE9PSBpMCkgdDAgPSAoaTAgPSBpKSAmJiB0ZXh0SW50ZXJwb2xhdGUoaSk7XG4gICAgcmV0dXJuIHQwO1xuICB9XG4gIHR3ZWVuLl92YWx1ZSA9IHZhbHVlO1xuICByZXR1cm4gdHdlZW47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHZhciBrZXkgPSBcInRleHRcIjtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAxKSByZXR1cm4gKGtleSA9IHRoaXMudHdlZW4oa2V5KSkgJiYga2V5Ll92YWx1ZTtcbiAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiB0aGlzLnR3ZWVuKGtleSwgbnVsbCk7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICByZXR1cm4gdGhpcy50d2VlbihrZXksIHRleHRUd2Vlbih2YWx1ZSkpO1xufVxuIiwKICAgICJpbXBvcnQge1RyYW5zaXRpb24sIG5ld0lkfSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IHNjaGVkdWxlLCB7Z2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIG5hbWUgPSB0aGlzLl9uYW1lLFxuICAgICAgaWQwID0gdGhpcy5faWQsXG4gICAgICBpZDEgPSBuZXdJZCgpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICAgIHZhciBpbmhlcml0ID0gZ2V0KG5vZGUsIGlkMCk7XG4gICAgICAgIHNjaGVkdWxlKG5vZGUsIG5hbWUsIGlkMSwgaSwgZ3JvdXAsIHtcbiAgICAgICAgICB0aW1lOiBpbmhlcml0LnRpbWUgKyBpbmhlcml0LmRlbGF5ICsgaW5oZXJpdC5kdXJhdGlvbixcbiAgICAgICAgICBkZWxheTogMCxcbiAgICAgICAgICBkdXJhdGlvbjogaW5oZXJpdC5kdXJhdGlvbixcbiAgICAgICAgICBlYXNlOiBpbmhlcml0LmVhc2VcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBUcmFuc2l0aW9uKGdyb3VwcywgdGhpcy5fcGFyZW50cywgbmFtZSwgaWQxKTtcbn1cbiIsCiAgICAiaW1wb3J0IHtzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgb24wLCBvbjEsIHRoYXQgPSB0aGlzLCBpZCA9IHRoYXQuX2lkLCBzaXplID0gdGhhdC5zaXplKCk7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgY2FuY2VsID0ge3ZhbHVlOiByZWplY3R9LFxuICAgICAgICBlbmQgPSB7dmFsdWU6IGZ1bmN0aW9uKCkgeyBpZiAoLS1zaXplID09PSAwKSByZXNvbHZlKCk7IH19O1xuXG4gICAgdGhhdC5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNjaGVkdWxlID0gc2V0KHRoaXMsIGlkKSxcbiAgICAgICAgICBvbiA9IHNjaGVkdWxlLm9uO1xuXG4gICAgICAvLyBJZiB0aGlzIG5vZGUgc2hhcmVkIGEgZGlzcGF0Y2ggd2l0aCB0aGUgcHJldmlvdXMgbm9kZSxcbiAgICAgIC8vIGp1c3QgYXNzaWduIHRoZSB1cGRhdGVkIHNoYXJlZCBkaXNwYXRjaCBhbmQgd2XigJlyZSBkb25lIVxuICAgICAgLy8gT3RoZXJ3aXNlLCBjb3B5LW9uLXdyaXRlLlxuICAgICAgaWYgKG9uICE9PSBvbjApIHtcbiAgICAgICAgb24xID0gKG9uMCA9IG9uKS5jb3B5KCk7XG4gICAgICAgIG9uMS5fLmNhbmNlbC5wdXNoKGNhbmNlbCk7XG4gICAgICAgIG9uMS5fLmludGVycnVwdC5wdXNoKGNhbmNlbCk7XG4gICAgICAgIG9uMS5fLmVuZC5wdXNoKGVuZCk7XG4gICAgICB9XG5cbiAgICAgIHNjaGVkdWxlLm9uID0gb24xO1xuICAgIH0pO1xuXG4gICAgLy8gVGhlIHNlbGVjdGlvbiB3YXMgZW1wdHksIHJlc29sdmUgZW5kIGltbWVkaWF0ZWx5XG4gICAgaWYgKHNpemUgPT09IDApIHJlc29sdmUoKTtcbiAgfSk7XG59XG4iLAogICAgImltcG9ydCB7c2VsZWN0aW9ufSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9hdHRyIGZyb20gXCIuL2F0dHIuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX2F0dHJUd2VlbiBmcm9tIFwiLi9hdHRyVHdlZW4uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX2RlbGF5IGZyb20gXCIuL2RlbGF5LmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9kdXJhdGlvbiBmcm9tIFwiLi9kdXJhdGlvbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fZWFzZSBmcm9tIFwiLi9lYXNlLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9lYXNlVmFyeWluZyBmcm9tIFwiLi9lYXNlVmFyeWluZy5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fZmlsdGVyIGZyb20gXCIuL2ZpbHRlci5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fbWVyZ2UgZnJvbSBcIi4vbWVyZ2UuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX29uIGZyb20gXCIuL29uLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9yZW1vdmUgZnJvbSBcIi4vcmVtb3ZlLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9zZWxlY3QgZnJvbSBcIi4vc2VsZWN0LmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9zZWxlY3RBbGwgZnJvbSBcIi4vc2VsZWN0QWxsLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9zZWxlY3Rpb24gZnJvbSBcIi4vc2VsZWN0aW9uLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9zdHlsZSBmcm9tIFwiLi9zdHlsZS5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fc3R5bGVUd2VlbiBmcm9tIFwiLi9zdHlsZVR3ZWVuLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl90ZXh0IGZyb20gXCIuL3RleHQuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3RleHRUd2VlbiBmcm9tIFwiLi90ZXh0VHdlZW4uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3RyYW5zaXRpb24gZnJvbSBcIi4vdHJhbnNpdGlvbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fdHdlZW4gZnJvbSBcIi4vdHdlZW4uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX2VuZCBmcm9tIFwiLi9lbmQuanNcIjtcblxudmFyIGlkID0gMDtcblxuZXhwb3J0IGZ1bmN0aW9uIFRyYW5zaXRpb24oZ3JvdXBzLCBwYXJlbnRzLCBuYW1lLCBpZCkge1xuICB0aGlzLl9ncm91cHMgPSBncm91cHM7XG4gIHRoaXMuX3BhcmVudHMgPSBwYXJlbnRzO1xuICB0aGlzLl9uYW1lID0gbmFtZTtcbiAgdGhpcy5faWQgPSBpZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdHJhbnNpdGlvbihuYW1lKSB7XG4gIHJldHVybiBzZWxlY3Rpb24oKS50cmFuc2l0aW9uKG5hbWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbmV3SWQoKSB7XG4gIHJldHVybiArK2lkO1xufVxuXG52YXIgc2VsZWN0aW9uX3Byb3RvdHlwZSA9IHNlbGVjdGlvbi5wcm90b3R5cGU7XG5cblRyYW5zaXRpb24ucHJvdG90eXBlID0gdHJhbnNpdGlvbi5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBUcmFuc2l0aW9uLFxuICBzZWxlY3Q6IHRyYW5zaXRpb25fc2VsZWN0LFxuICBzZWxlY3RBbGw6IHRyYW5zaXRpb25fc2VsZWN0QWxsLFxuICBzZWxlY3RDaGlsZDogc2VsZWN0aW9uX3Byb3RvdHlwZS5zZWxlY3RDaGlsZCxcbiAgc2VsZWN0Q2hpbGRyZW46IHNlbGVjdGlvbl9wcm90b3R5cGUuc2VsZWN0Q2hpbGRyZW4sXG4gIGZpbHRlcjogdHJhbnNpdGlvbl9maWx0ZXIsXG4gIG1lcmdlOiB0cmFuc2l0aW9uX21lcmdlLFxuICBzZWxlY3Rpb246IHRyYW5zaXRpb25fc2VsZWN0aW9uLFxuICB0cmFuc2l0aW9uOiB0cmFuc2l0aW9uX3RyYW5zaXRpb24sXG4gIGNhbGw6IHNlbGVjdGlvbl9wcm90b3R5cGUuY2FsbCxcbiAgbm9kZXM6IHNlbGVjdGlvbl9wcm90b3R5cGUubm9kZXMsXG4gIG5vZGU6IHNlbGVjdGlvbl9wcm90b3R5cGUubm9kZSxcbiAgc2l6ZTogc2VsZWN0aW9uX3Byb3RvdHlwZS5zaXplLFxuICBlbXB0eTogc2VsZWN0aW9uX3Byb3RvdHlwZS5lbXB0eSxcbiAgZWFjaDogc2VsZWN0aW9uX3Byb3RvdHlwZS5lYWNoLFxuICBvbjogdHJhbnNpdGlvbl9vbixcbiAgYXR0cjogdHJhbnNpdGlvbl9hdHRyLFxuICBhdHRyVHdlZW46IHRyYW5zaXRpb25fYXR0clR3ZWVuLFxuICBzdHlsZTogdHJhbnNpdGlvbl9zdHlsZSxcbiAgc3R5bGVUd2VlbjogdHJhbnNpdGlvbl9zdHlsZVR3ZWVuLFxuICB0ZXh0OiB0cmFuc2l0aW9uX3RleHQsXG4gIHRleHRUd2VlbjogdHJhbnNpdGlvbl90ZXh0VHdlZW4sXG4gIHJlbW92ZTogdHJhbnNpdGlvbl9yZW1vdmUsXG4gIHR3ZWVuOiB0cmFuc2l0aW9uX3R3ZWVuLFxuICBkZWxheTogdHJhbnNpdGlvbl9kZWxheSxcbiAgZHVyYXRpb246IHRyYW5zaXRpb25fZHVyYXRpb24sXG4gIGVhc2U6IHRyYW5zaXRpb25fZWFzZSxcbiAgZWFzZVZhcnlpbmc6IHRyYW5zaXRpb25fZWFzZVZhcnlpbmcsXG4gIGVuZDogdHJhbnNpdGlvbl9lbmQsXG4gIFtTeW1ib2wuaXRlcmF0b3JdOiBzZWxlY3Rpb25fcHJvdG90eXBlW1N5bWJvbC5pdGVyYXRvcl1cbn07XG4iLAogICAgImV4cG9ydCBmdW5jdGlvbiBjdWJpY0luKHQpIHtcbiAgcmV0dXJuIHQgKiB0ICogdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGN1YmljT3V0KHQpIHtcbiAgcmV0dXJuIC0tdCAqIHQgKiB0ICsgMTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGN1YmljSW5PdXQodCkge1xuICByZXR1cm4gKCh0ICo9IDIpIDw9IDEgPyB0ICogdCAqIHQgOiAodCAtPSAyKSAqIHQgKiB0ICsgMikgLyAyO1xufVxuIiwKICAgICJpbXBvcnQge1RyYW5zaXRpb24sIG5ld0lkfSBmcm9tIFwiLi4vdHJhbnNpdGlvbi9pbmRleC5qc1wiO1xuaW1wb3J0IHNjaGVkdWxlIGZyb20gXCIuLi90cmFuc2l0aW9uL3NjaGVkdWxlLmpzXCI7XG5pbXBvcnQge2Vhc2VDdWJpY0luT3V0fSBmcm9tIFwiZDMtZWFzZVwiO1xuaW1wb3J0IHtub3d9IGZyb20gXCJkMy10aW1lclwiO1xuXG52YXIgZGVmYXVsdFRpbWluZyA9IHtcbiAgdGltZTogbnVsbCwgLy8gU2V0IG9uIHVzZS5cbiAgZGVsYXk6IDAsXG4gIGR1cmF0aW9uOiAyNTAsXG4gIGVhc2U6IGVhc2VDdWJpY0luT3V0XG59O1xuXG5mdW5jdGlvbiBpbmhlcml0KG5vZGUsIGlkKSB7XG4gIHZhciB0aW1pbmc7XG4gIHdoaWxlICghKHRpbWluZyA9IG5vZGUuX190cmFuc2l0aW9uKSB8fCAhKHRpbWluZyA9IHRpbWluZ1tpZF0pKSB7XG4gICAgaWYgKCEobm9kZSA9IG5vZGUucGFyZW50Tm9kZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdHJhbnNpdGlvbiAke2lkfSBub3QgZm91bmRgKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRpbWluZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSkge1xuICB2YXIgaWQsXG4gICAgICB0aW1pbmc7XG5cbiAgaWYgKG5hbWUgaW5zdGFuY2VvZiBUcmFuc2l0aW9uKSB7XG4gICAgaWQgPSBuYW1lLl9pZCwgbmFtZSA9IG5hbWUuX25hbWU7XG4gIH0gZWxzZSB7XG4gICAgaWQgPSBuZXdJZCgpLCAodGltaW5nID0gZGVmYXVsdFRpbWluZykudGltZSA9IG5vdygpLCBuYW1lID0gbmFtZSA9PSBudWxsID8gbnVsbCA6IG5hbWUgKyBcIlwiO1xuICB9XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgc2NoZWR1bGUobm9kZSwgbmFtZSwgaWQsIGksIGdyb3VwLCB0aW1pbmcgfHwgaW5oZXJpdChub2RlLCBpZCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgVHJhbnNpdGlvbihncm91cHMsIHRoaXMuX3BhcmVudHMsIG5hbWUsIGlkKTtcbn1cbiIsCiAgICAiaW1wb3J0IHtzZWxlY3Rpb259IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCBzZWxlY3Rpb25faW50ZXJydXB0IGZyb20gXCIuL2ludGVycnVwdC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl90cmFuc2l0aW9uIGZyb20gXCIuL3RyYW5zaXRpb24uanNcIjtcblxuc2VsZWN0aW9uLnByb3RvdHlwZS5pbnRlcnJ1cHQgPSBzZWxlY3Rpb25faW50ZXJydXB0O1xuc2VsZWN0aW9uLnByb3RvdHlwZS50cmFuc2l0aW9uID0gc2VsZWN0aW9uX3RyYW5zaXRpb247XG4iLAogICAgImltcG9ydCB7ZGlzcGF0Y2h9IGZyb20gXCJkMy1kaXNwYXRjaFwiO1xuaW1wb3J0IHtkcmFnRGlzYWJsZSwgZHJhZ0VuYWJsZX0gZnJvbSBcImQzLWRyYWdcIjtcbmltcG9ydCB7aW50ZXJwb2xhdGV9IGZyb20gXCJkMy1pbnRlcnBvbGF0ZVwiO1xuaW1wb3J0IHtwb2ludGVyLCBzZWxlY3R9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCB7aW50ZXJydXB0fSBmcm9tIFwiZDMtdHJhbnNpdGlvblwiO1xuaW1wb3J0IGNvbnN0YW50IGZyb20gXCIuL2NvbnN0YW50LmpzXCI7XG5pbXBvcnQgQnJ1c2hFdmVudCBmcm9tIFwiLi9ldmVudC5qc1wiO1xuaW1wb3J0IG5vZXZlbnQsIHtub3Byb3BhZ2F0aW9ufSBmcm9tIFwiLi9ub2V2ZW50LmpzXCI7XG5cbnZhciBNT0RFX0RSQUcgPSB7bmFtZTogXCJkcmFnXCJ9LFxuICAgIE1PREVfU1BBQ0UgPSB7bmFtZTogXCJzcGFjZVwifSxcbiAgICBNT0RFX0hBTkRMRSA9IHtuYW1lOiBcImhhbmRsZVwifSxcbiAgICBNT0RFX0NFTlRFUiA9IHtuYW1lOiBcImNlbnRlclwifTtcblxuY29uc3Qge2FicywgbWF4LCBtaW59ID0gTWF0aDtcblxuZnVuY3Rpb24gbnVtYmVyMShlKSB7XG4gIHJldHVybiBbK2VbMF0sICtlWzFdXTtcbn1cblxuZnVuY3Rpb24gbnVtYmVyMihlKSB7XG4gIHJldHVybiBbbnVtYmVyMShlWzBdKSwgbnVtYmVyMShlWzFdKV07XG59XG5cbnZhciBYID0ge1xuICBuYW1lOiBcInhcIixcbiAgaGFuZGxlczogW1wid1wiLCBcImVcIl0ubWFwKHR5cGUpLFxuICBpbnB1dDogZnVuY3Rpb24oeCwgZSkgeyByZXR1cm4geCA9PSBudWxsID8gbnVsbCA6IFtbK3hbMF0sIGVbMF1bMV1dLCBbK3hbMV0sIGVbMV1bMV1dXTsgfSxcbiAgb3V0cHV0OiBmdW5jdGlvbih4eSkgeyByZXR1cm4geHkgJiYgW3h5WzBdWzBdLCB4eVsxXVswXV07IH1cbn07XG5cbnZhciBZID0ge1xuICBuYW1lOiBcInlcIixcbiAgaGFuZGxlczogW1wiblwiLCBcInNcIl0ubWFwKHR5cGUpLFxuICBpbnB1dDogZnVuY3Rpb24oeSwgZSkgeyByZXR1cm4geSA9PSBudWxsID8gbnVsbCA6IFtbZVswXVswXSwgK3lbMF1dLCBbZVsxXVswXSwgK3lbMV1dXTsgfSxcbiAgb3V0cHV0OiBmdW5jdGlvbih4eSkgeyByZXR1cm4geHkgJiYgW3h5WzBdWzFdLCB4eVsxXVsxXV07IH1cbn07XG5cbnZhciBYWSA9IHtcbiAgbmFtZTogXCJ4eVwiLFxuICBoYW5kbGVzOiBbXCJuXCIsIFwid1wiLCBcImVcIiwgXCJzXCIsIFwibndcIiwgXCJuZVwiLCBcInN3XCIsIFwic2VcIl0ubWFwKHR5cGUpLFxuICBpbnB1dDogZnVuY3Rpb24oeHkpIHsgcmV0dXJuIHh5ID09IG51bGwgPyBudWxsIDogbnVtYmVyMih4eSk7IH0sXG4gIG91dHB1dDogZnVuY3Rpb24oeHkpIHsgcmV0dXJuIHh5OyB9XG59O1xuXG52YXIgY3Vyc29ycyA9IHtcbiAgb3ZlcmxheTogXCJjcm9zc2hhaXJcIixcbiAgc2VsZWN0aW9uOiBcIm1vdmVcIixcbiAgbjogXCJucy1yZXNpemVcIixcbiAgZTogXCJldy1yZXNpemVcIixcbiAgczogXCJucy1yZXNpemVcIixcbiAgdzogXCJldy1yZXNpemVcIixcbiAgbnc6IFwibndzZS1yZXNpemVcIixcbiAgbmU6IFwibmVzdy1yZXNpemVcIixcbiAgc2U6IFwibndzZS1yZXNpemVcIixcbiAgc3c6IFwibmVzdy1yZXNpemVcIlxufTtcblxudmFyIGZsaXBYID0ge1xuICBlOiBcIndcIixcbiAgdzogXCJlXCIsXG4gIG53OiBcIm5lXCIsXG4gIG5lOiBcIm53XCIsXG4gIHNlOiBcInN3XCIsXG4gIHN3OiBcInNlXCJcbn07XG5cbnZhciBmbGlwWSA9IHtcbiAgbjogXCJzXCIsXG4gIHM6IFwiblwiLFxuICBudzogXCJzd1wiLFxuICBuZTogXCJzZVwiLFxuICBzZTogXCJuZVwiLFxuICBzdzogXCJud1wiXG59O1xuXG52YXIgc2lnbnNYID0ge1xuICBvdmVybGF5OiArMSxcbiAgc2VsZWN0aW9uOiArMSxcbiAgbjogbnVsbCxcbiAgZTogKzEsXG4gIHM6IG51bGwsXG4gIHc6IC0xLFxuICBudzogLTEsXG4gIG5lOiArMSxcbiAgc2U6ICsxLFxuICBzdzogLTFcbn07XG5cbnZhciBzaWduc1kgPSB7XG4gIG92ZXJsYXk6ICsxLFxuICBzZWxlY3Rpb246ICsxLFxuICBuOiAtMSxcbiAgZTogbnVsbCxcbiAgczogKzEsXG4gIHc6IG51bGwsXG4gIG53OiAtMSxcbiAgbmU6IC0xLFxuICBzZTogKzEsXG4gIHN3OiArMVxufTtcblxuZnVuY3Rpb24gdHlwZSh0KSB7XG4gIHJldHVybiB7dHlwZTogdH07XG59XG5cbi8vIElnbm9yZSByaWdodC1jbGljaywgc2luY2UgdGhhdCBzaG91bGQgb3BlbiB0aGUgY29udGV4dCBtZW51LlxuZnVuY3Rpb24gZGVmYXVsdEZpbHRlcihldmVudCkge1xuICByZXR1cm4gIWV2ZW50LmN0cmxLZXkgJiYgIWV2ZW50LmJ1dHRvbjtcbn1cblxuZnVuY3Rpb24gZGVmYXVsdEV4dGVudCgpIHtcbiAgdmFyIHN2ZyA9IHRoaXMub3duZXJTVkdFbGVtZW50IHx8IHRoaXM7XG4gIGlmIChzdmcuaGFzQXR0cmlidXRlKFwidmlld0JveFwiKSkge1xuICAgIHN2ZyA9IHN2Zy52aWV3Qm94LmJhc2VWYWw7XG4gICAgcmV0dXJuIFtbc3ZnLngsIHN2Zy55XSwgW3N2Zy54ICsgc3ZnLndpZHRoLCBzdmcueSArIHN2Zy5oZWlnaHRdXTtcbiAgfVxuICByZXR1cm4gW1swLCAwXSwgW3N2Zy53aWR0aC5iYXNlVmFsLnZhbHVlLCBzdmcuaGVpZ2h0LmJhc2VWYWwudmFsdWVdXTtcbn1cblxuZnVuY3Rpb24gZGVmYXVsdFRvdWNoYWJsZSgpIHtcbiAgcmV0dXJuIG5hdmlnYXRvci5tYXhUb3VjaFBvaW50cyB8fCAoXCJvbnRvdWNoc3RhcnRcIiBpbiB0aGlzKTtcbn1cblxuLy8gTGlrZSBkMy5sb2NhbCwgYnV0IHdpdGggdGhlIG5hbWUg4oCcX19icnVzaOKAnSByYXRoZXIgdGhhbiBhdXRvLWdlbmVyYXRlZC5cbmZ1bmN0aW9uIGxvY2FsKG5vZGUpIHtcbiAgd2hpbGUgKCFub2RlLl9fYnJ1c2gpIGlmICghKG5vZGUgPSBub2RlLnBhcmVudE5vZGUpKSByZXR1cm47XG4gIHJldHVybiBub2RlLl9fYnJ1c2g7XG59XG5cbmZ1bmN0aW9uIGVtcHR5KGV4dGVudCkge1xuICByZXR1cm4gZXh0ZW50WzBdWzBdID09PSBleHRlbnRbMV1bMF1cbiAgICAgIHx8IGV4dGVudFswXVsxXSA9PT0gZXh0ZW50WzFdWzFdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnJ1c2hTZWxlY3Rpb24obm9kZSkge1xuICB2YXIgc3RhdGUgPSBub2RlLl9fYnJ1c2g7XG4gIHJldHVybiBzdGF0ZSA/IHN0YXRlLmRpbS5vdXRwdXQoc3RhdGUuc2VsZWN0aW9uKSA6IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBicnVzaFgoKSB7XG4gIHJldHVybiBicnVzaChYKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJydXNoWSgpIHtcbiAgcmV0dXJuIGJydXNoKFkpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGJydXNoKFhZKTtcbn1cblxuZnVuY3Rpb24gYnJ1c2goZGltKSB7XG4gIHZhciBleHRlbnQgPSBkZWZhdWx0RXh0ZW50LFxuICAgICAgZmlsdGVyID0gZGVmYXVsdEZpbHRlcixcbiAgICAgIHRvdWNoYWJsZSA9IGRlZmF1bHRUb3VjaGFibGUsXG4gICAgICBrZXlzID0gdHJ1ZSxcbiAgICAgIGxpc3RlbmVycyA9IGRpc3BhdGNoKFwic3RhcnRcIiwgXCJicnVzaFwiLCBcImVuZFwiKSxcbiAgICAgIGhhbmRsZVNpemUgPSA2LFxuICAgICAgdG91Y2hlbmRpbmc7XG5cbiAgZnVuY3Rpb24gYnJ1c2goZ3JvdXApIHtcbiAgICB2YXIgb3ZlcmxheSA9IGdyb3VwXG4gICAgICAgIC5wcm9wZXJ0eShcIl9fYnJ1c2hcIiwgaW5pdGlhbGl6ZSlcbiAgICAgIC5zZWxlY3RBbGwoXCIub3ZlcmxheVwiKVxuICAgICAgLmRhdGEoW3R5cGUoXCJvdmVybGF5XCIpXSk7XG5cbiAgICBvdmVybGF5LmVudGVyKCkuYXBwZW5kKFwicmVjdFwiKVxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwib3ZlcmxheVwiKVxuICAgICAgICAuYXR0cihcInBvaW50ZXItZXZlbnRzXCIsIFwiYWxsXCIpXG4gICAgICAgIC5hdHRyKFwiY3Vyc29yXCIsIGN1cnNvcnMub3ZlcmxheSlcbiAgICAgIC5tZXJnZShvdmVybGF5KVxuICAgICAgICAuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgZXh0ZW50ID0gbG9jYWwodGhpcykuZXh0ZW50O1xuICAgICAgICAgIHNlbGVjdCh0aGlzKVxuICAgICAgICAgICAgICAuYXR0cihcInhcIiwgZXh0ZW50WzBdWzBdKVxuICAgICAgICAgICAgICAuYXR0cihcInlcIiwgZXh0ZW50WzBdWzFdKVxuICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIGV4dGVudFsxXVswXSAtIGV4dGVudFswXVswXSlcbiAgICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgZXh0ZW50WzFdWzFdIC0gZXh0ZW50WzBdWzFdKTtcbiAgICAgICAgfSk7XG5cbiAgICBncm91cC5zZWxlY3RBbGwoXCIuc2VsZWN0aW9uXCIpXG4gICAgICAuZGF0YShbdHlwZShcInNlbGVjdGlvblwiKV0pXG4gICAgICAuZW50ZXIoKS5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJzZWxlY3Rpb25cIilcbiAgICAgICAgLmF0dHIoXCJjdXJzb3JcIiwgY3Vyc29ycy5zZWxlY3Rpb24pXG4gICAgICAgIC5hdHRyKFwiZmlsbFwiLCBcIiM3NzdcIilcbiAgICAgICAgLmF0dHIoXCJmaWxsLW9wYWNpdHlcIiwgMC4zKVxuICAgICAgICAuYXR0cihcInN0cm9rZVwiLCBcIiNmZmZcIilcbiAgICAgICAgLmF0dHIoXCJzaGFwZS1yZW5kZXJpbmdcIiwgXCJjcmlzcEVkZ2VzXCIpO1xuXG4gICAgdmFyIGhhbmRsZSA9IGdyb3VwLnNlbGVjdEFsbChcIi5oYW5kbGVcIilcbiAgICAgIC5kYXRhKGRpbS5oYW5kbGVzLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnR5cGU7IH0pO1xuXG4gICAgaGFuZGxlLmV4aXQoKS5yZW1vdmUoKTtcblxuICAgIGhhbmRsZS5lbnRlcigpLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBmdW5jdGlvbihkKSB7IHJldHVybiBcImhhbmRsZSBoYW5kbGUtLVwiICsgZC50eXBlOyB9KVxuICAgICAgICAuYXR0cihcImN1cnNvclwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBjdXJzb3JzW2QudHlwZV07IH0pO1xuXG4gICAgZ3JvdXBcbiAgICAgICAgLmVhY2gocmVkcmF3KVxuICAgICAgICAuYXR0cihcImZpbGxcIiwgXCJub25lXCIpXG4gICAgICAgIC5hdHRyKFwicG9pbnRlci1ldmVudHNcIiwgXCJhbGxcIilcbiAgICAgICAgLm9uKFwibW91c2Vkb3duLmJydXNoXCIsIHN0YXJ0ZWQpXG4gICAgICAuZmlsdGVyKHRvdWNoYWJsZSlcbiAgICAgICAgLm9uKFwidG91Y2hzdGFydC5icnVzaFwiLCBzdGFydGVkKVxuICAgICAgICAub24oXCJ0b3VjaG1vdmUuYnJ1c2hcIiwgdG91Y2htb3ZlZClcbiAgICAgICAgLm9uKFwidG91Y2hlbmQuYnJ1c2ggdG91Y2hjYW5jZWwuYnJ1c2hcIiwgdG91Y2hlbmRlZClcbiAgICAgICAgLnN0eWxlKFwidG91Y2gtYWN0aW9uXCIsIFwibm9uZVwiKVxuICAgICAgICAuc3R5bGUoXCItd2Via2l0LXRhcC1oaWdobGlnaHQtY29sb3JcIiwgXCJyZ2JhKDAsMCwwLDApXCIpO1xuICB9XG5cbiAgYnJ1c2gubW92ZSA9IGZ1bmN0aW9uKGdyb3VwLCBzZWxlY3Rpb24sIGV2ZW50KSB7XG4gICAgaWYgKGdyb3VwLnR3ZWVuKSB7XG4gICAgICBncm91cFxuICAgICAgICAgIC5vbihcInN0YXJ0LmJydXNoXCIsIGZ1bmN0aW9uKGV2ZW50KSB7IGVtaXR0ZXIodGhpcywgYXJndW1lbnRzKS5iZWZvcmVzdGFydCgpLnN0YXJ0KGV2ZW50KTsgfSlcbiAgICAgICAgICAub24oXCJpbnRlcnJ1cHQuYnJ1c2ggZW5kLmJydXNoXCIsIGZ1bmN0aW9uKGV2ZW50KSB7IGVtaXR0ZXIodGhpcywgYXJndW1lbnRzKS5lbmQoZXZlbnQpOyB9KVxuICAgICAgICAgIC50d2VlbihcImJydXNoXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHN0YXRlID0gdGhhdC5fX2JydXNoLFxuICAgICAgICAgICAgICAgIGVtaXQgPSBlbWl0dGVyKHRoYXQsIGFyZ3VtZW50cyksXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uMCA9IHN0YXRlLnNlbGVjdGlvbixcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb24xID0gZGltLmlucHV0KHR5cGVvZiBzZWxlY3Rpb24gPT09IFwiZnVuY3Rpb25cIiA/IHNlbGVjdGlvbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpIDogc2VsZWN0aW9uLCBzdGF0ZS5leHRlbnQpLFxuICAgICAgICAgICAgICAgIGkgPSBpbnRlcnBvbGF0ZShzZWxlY3Rpb24wLCBzZWxlY3Rpb24xKTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gdHdlZW4odCkge1xuICAgICAgICAgICAgICBzdGF0ZS5zZWxlY3Rpb24gPSB0ID09PSAxICYmIHNlbGVjdGlvbjEgPT09IG51bGwgPyBudWxsIDogaSh0KTtcbiAgICAgICAgICAgICAgcmVkcmF3LmNhbGwodGhhdCk7XG4gICAgICAgICAgICAgIGVtaXQuYnJ1c2goKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGlvbjAgIT09IG51bGwgJiYgc2VsZWN0aW9uMSAhPT0gbnVsbCA/IHR3ZWVuIDogdHdlZW4oMSk7XG4gICAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdyb3VwXG4gICAgICAgICAgLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IHRoYXQuX19icnVzaCxcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb24xID0gZGltLmlucHV0KHR5cGVvZiBzZWxlY3Rpb24gPT09IFwiZnVuY3Rpb25cIiA/IHNlbGVjdGlvbi5hcHBseSh0aGF0LCBhcmdzKSA6IHNlbGVjdGlvbiwgc3RhdGUuZXh0ZW50KSxcbiAgICAgICAgICAgICAgICBlbWl0ID0gZW1pdHRlcih0aGF0LCBhcmdzKS5iZWZvcmVzdGFydCgpO1xuXG4gICAgICAgICAgICBpbnRlcnJ1cHQodGhhdCk7XG4gICAgICAgICAgICBzdGF0ZS5zZWxlY3Rpb24gPSBzZWxlY3Rpb24xID09PSBudWxsID8gbnVsbCA6IHNlbGVjdGlvbjE7XG4gICAgICAgICAgICByZWRyYXcuY2FsbCh0aGF0KTtcbiAgICAgICAgICAgIGVtaXQuc3RhcnQoZXZlbnQpLmJydXNoKGV2ZW50KS5lbmQoZXZlbnQpO1xuICAgICAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBicnVzaC5jbGVhciA9IGZ1bmN0aW9uKGdyb3VwLCBldmVudCkge1xuICAgIGJydXNoLm1vdmUoZ3JvdXAsIG51bGwsIGV2ZW50KTtcbiAgfTtcblxuICBmdW5jdGlvbiByZWRyYXcoKSB7XG4gICAgdmFyIGdyb3VwID0gc2VsZWN0KHRoaXMpLFxuICAgICAgICBzZWxlY3Rpb24gPSBsb2NhbCh0aGlzKS5zZWxlY3Rpb247XG5cbiAgICBpZiAoc2VsZWN0aW9uKSB7XG4gICAgICBncm91cC5zZWxlY3RBbGwoXCIuc2VsZWN0aW9uXCIpXG4gICAgICAgICAgLnN0eWxlKFwiZGlzcGxheVwiLCBudWxsKVxuICAgICAgICAgIC5hdHRyKFwieFwiLCBzZWxlY3Rpb25bMF1bMF0pXG4gICAgICAgICAgLmF0dHIoXCJ5XCIsIHNlbGVjdGlvblswXVsxXSlcbiAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIHNlbGVjdGlvblsxXVswXSAtIHNlbGVjdGlvblswXVswXSlcbiAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBzZWxlY3Rpb25bMV1bMV0gLSBzZWxlY3Rpb25bMF1bMV0pO1xuXG4gICAgICBncm91cC5zZWxlY3RBbGwoXCIuaGFuZGxlXCIpXG4gICAgICAgICAgLnN0eWxlKFwiZGlzcGxheVwiLCBudWxsKVxuICAgICAgICAgIC5hdHRyKFwieFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnR5cGVbZC50eXBlLmxlbmd0aCAtIDFdID09PSBcImVcIiA/IHNlbGVjdGlvblsxXVswXSAtIGhhbmRsZVNpemUgLyAyIDogc2VsZWN0aW9uWzBdWzBdIC0gaGFuZGxlU2l6ZSAvIDI7IH0pXG4gICAgICAgICAgLmF0dHIoXCJ5XCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudHlwZVswXSA9PT0gXCJzXCIgPyBzZWxlY3Rpb25bMV1bMV0gLSBoYW5kbGVTaXplIC8gMiA6IHNlbGVjdGlvblswXVsxXSAtIGhhbmRsZVNpemUgLyAyOyB9KVxuICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50eXBlID09PSBcIm5cIiB8fCBkLnR5cGUgPT09IFwic1wiID8gc2VsZWN0aW9uWzFdWzBdIC0gc2VsZWN0aW9uWzBdWzBdICsgaGFuZGxlU2l6ZSA6IGhhbmRsZVNpemU7IH0pXG4gICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50eXBlID09PSBcImVcIiB8fCBkLnR5cGUgPT09IFwid1wiID8gc2VsZWN0aW9uWzFdWzFdIC0gc2VsZWN0aW9uWzBdWzFdICsgaGFuZGxlU2l6ZSA6IGhhbmRsZVNpemU7IH0pO1xuICAgIH1cblxuICAgIGVsc2Uge1xuICAgICAgZ3JvdXAuc2VsZWN0QWxsKFwiLnNlbGVjdGlvbiwuaGFuZGxlXCIpXG4gICAgICAgICAgLnN0eWxlKFwiZGlzcGxheVwiLCBcIm5vbmVcIilcbiAgICAgICAgICAuYXR0cihcInhcIiwgbnVsbClcbiAgICAgICAgICAuYXR0cihcInlcIiwgbnVsbClcbiAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIG51bGwpXG4gICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgbnVsbCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZW1pdHRlcih0aGF0LCBhcmdzLCBjbGVhbikge1xuICAgIHZhciBlbWl0ID0gdGhhdC5fX2JydXNoLmVtaXR0ZXI7XG4gICAgcmV0dXJuIGVtaXQgJiYgKCFjbGVhbiB8fCAhZW1pdC5jbGVhbikgPyBlbWl0IDogbmV3IEVtaXR0ZXIodGhhdCwgYXJncywgY2xlYW4pO1xuICB9XG5cbiAgZnVuY3Rpb24gRW1pdHRlcih0aGF0LCBhcmdzLCBjbGVhbikge1xuICAgIHRoaXMudGhhdCA9IHRoYXQ7XG4gICAgdGhpcy5hcmdzID0gYXJncztcbiAgICB0aGlzLnN0YXRlID0gdGhhdC5fX2JydXNoO1xuICAgIHRoaXMuYWN0aXZlID0gMDtcbiAgICB0aGlzLmNsZWFuID0gY2xlYW47XG4gIH1cblxuICBFbWl0dGVyLnByb3RvdHlwZSA9IHtcbiAgICBiZWZvcmVzdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoKyt0aGlzLmFjdGl2ZSA9PT0gMSkgdGhpcy5zdGF0ZS5lbWl0dGVyID0gdGhpcywgdGhpcy5zdGFydGluZyA9IHRydWU7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIHN0YXJ0OiBmdW5jdGlvbihldmVudCwgbW9kZSkge1xuICAgICAgaWYgKHRoaXMuc3RhcnRpbmcpIHRoaXMuc3RhcnRpbmcgPSBmYWxzZSwgdGhpcy5lbWl0KFwic3RhcnRcIiwgZXZlbnQsIG1vZGUpO1xuICAgICAgZWxzZSB0aGlzLmVtaXQoXCJicnVzaFwiLCBldmVudCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGJydXNoOiBmdW5jdGlvbihldmVudCwgbW9kZSkge1xuICAgICAgdGhpcy5lbWl0KFwiYnJ1c2hcIiwgZXZlbnQsIG1vZGUpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBlbmQ6IGZ1bmN0aW9uKGV2ZW50LCBtb2RlKSB7XG4gICAgICBpZiAoLS10aGlzLmFjdGl2ZSA9PT0gMCkgZGVsZXRlIHRoaXMuc3RhdGUuZW1pdHRlciwgdGhpcy5lbWl0KFwiZW5kXCIsIGV2ZW50LCBtb2RlKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgZW1pdDogZnVuY3Rpb24odHlwZSwgZXZlbnQsIG1vZGUpIHtcbiAgICAgIHZhciBkID0gc2VsZWN0KHRoaXMudGhhdCkuZGF0dW0oKTtcbiAgICAgIGxpc3RlbmVycy5jYWxsKFxuICAgICAgICB0eXBlLFxuICAgICAgICB0aGlzLnRoYXQsXG4gICAgICAgIG5ldyBCcnVzaEV2ZW50KHR5cGUsIHtcbiAgICAgICAgICBzb3VyY2VFdmVudDogZXZlbnQsXG4gICAgICAgICAgdGFyZ2V0OiBicnVzaCxcbiAgICAgICAgICBzZWxlY3Rpb246IGRpbS5vdXRwdXQodGhpcy5zdGF0ZS5zZWxlY3Rpb24pLFxuICAgICAgICAgIG1vZGUsXG4gICAgICAgICAgZGlzcGF0Y2g6IGxpc3RlbmVyc1xuICAgICAgICB9KSxcbiAgICAgICAgZFxuICAgICAgKTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gc3RhcnRlZChldmVudCkge1xuICAgIGlmICh0b3VjaGVuZGluZyAmJiAhZXZlbnQudG91Y2hlcykgcmV0dXJuO1xuICAgIGlmICghZmlsdGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpIHJldHVybjtcblxuICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgdHlwZSA9IGV2ZW50LnRhcmdldC5fX2RhdGFfXy50eXBlLFxuICAgICAgICBtb2RlID0gKGtleXMgJiYgZXZlbnQubWV0YUtleSA/IHR5cGUgPSBcIm92ZXJsYXlcIiA6IHR5cGUpID09PSBcInNlbGVjdGlvblwiID8gTU9ERV9EUkFHIDogKGtleXMgJiYgZXZlbnQuYWx0S2V5ID8gTU9ERV9DRU5URVIgOiBNT0RFX0hBTkRMRSksXG4gICAgICAgIHNpZ25YID0gZGltID09PSBZID8gbnVsbCA6IHNpZ25zWFt0eXBlXSxcbiAgICAgICAgc2lnblkgPSBkaW0gPT09IFggPyBudWxsIDogc2lnbnNZW3R5cGVdLFxuICAgICAgICBzdGF0ZSA9IGxvY2FsKHRoYXQpLFxuICAgICAgICBleHRlbnQgPSBzdGF0ZS5leHRlbnQsXG4gICAgICAgIHNlbGVjdGlvbiA9IHN0YXRlLnNlbGVjdGlvbixcbiAgICAgICAgVyA9IGV4dGVudFswXVswXSwgdzAsIHcxLFxuICAgICAgICBOID0gZXh0ZW50WzBdWzFdLCBuMCwgbjEsXG4gICAgICAgIEUgPSBleHRlbnRbMV1bMF0sIGUwLCBlMSxcbiAgICAgICAgUyA9IGV4dGVudFsxXVsxXSwgczAsIHMxLFxuICAgICAgICBkeCA9IDAsXG4gICAgICAgIGR5ID0gMCxcbiAgICAgICAgbW92aW5nLFxuICAgICAgICBzaGlmdGluZyA9IHNpZ25YICYmIHNpZ25ZICYmIGtleXMgJiYgZXZlbnQuc2hpZnRLZXksXG4gICAgICAgIGxvY2tYLFxuICAgICAgICBsb2NrWSxcbiAgICAgICAgcG9pbnRzID0gQXJyYXkuZnJvbShldmVudC50b3VjaGVzIHx8IFtldmVudF0sIHQgPT4ge1xuICAgICAgICAgIGNvbnN0IGkgPSB0LmlkZW50aWZpZXI7XG4gICAgICAgICAgdCA9IHBvaW50ZXIodCwgdGhhdCk7XG4gICAgICAgICAgdC5wb2ludDAgPSB0LnNsaWNlKCk7XG4gICAgICAgICAgdC5pZGVudGlmaWVyID0gaTtcbiAgICAgICAgICByZXR1cm4gdDtcbiAgICAgICAgfSk7XG5cbiAgICBpbnRlcnJ1cHQodGhhdCk7XG4gICAgdmFyIGVtaXQgPSBlbWl0dGVyKHRoYXQsIGFyZ3VtZW50cywgdHJ1ZSkuYmVmb3Jlc3RhcnQoKTtcblxuICAgIGlmICh0eXBlID09PSBcIm92ZXJsYXlcIikge1xuICAgICAgaWYgKHNlbGVjdGlvbikgbW92aW5nID0gdHJ1ZTtcbiAgICAgIGNvbnN0IHB0cyA9IFtwb2ludHNbMF0sIHBvaW50c1sxXSB8fCBwb2ludHNbMF1dO1xuICAgICAgc3RhdGUuc2VsZWN0aW9uID0gc2VsZWN0aW9uID0gW1tcbiAgICAgICAgICB3MCA9IGRpbSA9PT0gWSA/IFcgOiBtaW4ocHRzWzBdWzBdLCBwdHNbMV1bMF0pLFxuICAgICAgICAgIG4wID0gZGltID09PSBYID8gTiA6IG1pbihwdHNbMF1bMV0sIHB0c1sxXVsxXSlcbiAgICAgICAgXSwgW1xuICAgICAgICAgIGUwID0gZGltID09PSBZID8gRSA6IG1heChwdHNbMF1bMF0sIHB0c1sxXVswXSksXG4gICAgICAgICAgczAgPSBkaW0gPT09IFggPyBTIDogbWF4KHB0c1swXVsxXSwgcHRzWzFdWzFdKVxuICAgICAgICBdXTtcbiAgICAgIGlmIChwb2ludHMubGVuZ3RoID4gMSkgbW92ZShldmVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHcwID0gc2VsZWN0aW9uWzBdWzBdO1xuICAgICAgbjAgPSBzZWxlY3Rpb25bMF1bMV07XG4gICAgICBlMCA9IHNlbGVjdGlvblsxXVswXTtcbiAgICAgIHMwID0gc2VsZWN0aW9uWzFdWzFdO1xuICAgIH1cblxuICAgIHcxID0gdzA7XG4gICAgbjEgPSBuMDtcbiAgICBlMSA9IGUwO1xuICAgIHMxID0gczA7XG5cbiAgICB2YXIgZ3JvdXAgPSBzZWxlY3QodGhhdClcbiAgICAgICAgLmF0dHIoXCJwb2ludGVyLWV2ZW50c1wiLCBcIm5vbmVcIik7XG5cbiAgICB2YXIgb3ZlcmxheSA9IGdyb3VwLnNlbGVjdEFsbChcIi5vdmVybGF5XCIpXG4gICAgICAgIC5hdHRyKFwiY3Vyc29yXCIsIGN1cnNvcnNbdHlwZV0pO1xuXG4gICAgaWYgKGV2ZW50LnRvdWNoZXMpIHtcbiAgICAgIGVtaXQubW92ZWQgPSBtb3ZlZDtcbiAgICAgIGVtaXQuZW5kZWQgPSBlbmRlZDtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHZpZXcgPSBzZWxlY3QoZXZlbnQudmlldylcbiAgICAgICAgICAub24oXCJtb3VzZW1vdmUuYnJ1c2hcIiwgbW92ZWQsIHRydWUpXG4gICAgICAgICAgLm9uKFwibW91c2V1cC5icnVzaFwiLCBlbmRlZCwgdHJ1ZSk7XG4gICAgICBpZiAoa2V5cykgdmlld1xuICAgICAgICAgIC5vbihcImtleWRvd24uYnJ1c2hcIiwga2V5ZG93bmVkLCB0cnVlKVxuICAgICAgICAgIC5vbihcImtleXVwLmJydXNoXCIsIGtleXVwcGVkLCB0cnVlKVxuXG4gICAgICBkcmFnRGlzYWJsZShldmVudC52aWV3KTtcbiAgICB9XG5cbiAgICByZWRyYXcuY2FsbCh0aGF0KTtcbiAgICBlbWl0LnN0YXJ0KGV2ZW50LCBtb2RlLm5hbWUpO1xuXG4gICAgZnVuY3Rpb24gbW92ZWQoZXZlbnQpIHtcbiAgICAgIGZvciAoY29uc3QgcCBvZiBldmVudC5jaGFuZ2VkVG91Y2hlcyB8fCBbZXZlbnRdKSB7XG4gICAgICAgIGZvciAoY29uc3QgZCBvZiBwb2ludHMpXG4gICAgICAgICAgaWYgKGQuaWRlbnRpZmllciA9PT0gcC5pZGVudGlmaWVyKSBkLmN1ciA9IHBvaW50ZXIocCwgdGhhdCk7XG4gICAgICB9XG4gICAgICBpZiAoc2hpZnRpbmcgJiYgIWxvY2tYICYmICFsb2NrWSAmJiBwb2ludHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGNvbnN0IHBvaW50ID0gcG9pbnRzWzBdO1xuICAgICAgICBpZiAoYWJzKHBvaW50LmN1clswXSAtIHBvaW50WzBdKSA+IGFicyhwb2ludC5jdXJbMV0gLSBwb2ludFsxXSkpXG4gICAgICAgICAgbG9ja1kgPSB0cnVlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgbG9ja1ggPSB0cnVlO1xuICAgICAgfVxuICAgICAgZm9yIChjb25zdCBwb2ludCBvZiBwb2ludHMpXG4gICAgICAgIGlmIChwb2ludC5jdXIpIHBvaW50WzBdID0gcG9pbnQuY3VyWzBdLCBwb2ludFsxXSA9IHBvaW50LmN1clsxXTtcbiAgICAgIG1vdmluZyA9IHRydWU7XG4gICAgICBub2V2ZW50KGV2ZW50KTtcbiAgICAgIG1vdmUoZXZlbnQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1vdmUoZXZlbnQpIHtcbiAgICAgIGNvbnN0IHBvaW50ID0gcG9pbnRzWzBdLCBwb2ludDAgPSBwb2ludC5wb2ludDA7XG4gICAgICB2YXIgdDtcblxuICAgICAgZHggPSBwb2ludFswXSAtIHBvaW50MFswXTtcbiAgICAgIGR5ID0gcG9pbnRbMV0gLSBwb2ludDBbMV07XG5cbiAgICAgIHN3aXRjaCAobW9kZSkge1xuICAgICAgICBjYXNlIE1PREVfU1BBQ0U6XG4gICAgICAgIGNhc2UgTU9ERV9EUkFHOiB7XG4gICAgICAgICAgaWYgKHNpZ25YKSBkeCA9IG1heChXIC0gdzAsIG1pbihFIC0gZTAsIGR4KSksIHcxID0gdzAgKyBkeCwgZTEgPSBlMCArIGR4O1xuICAgICAgICAgIGlmIChzaWduWSkgZHkgPSBtYXgoTiAtIG4wLCBtaW4oUyAtIHMwLCBkeSkpLCBuMSA9IG4wICsgZHksIHMxID0gczAgKyBkeTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIE1PREVfSEFORExFOiB7XG4gICAgICAgICAgaWYgKHBvaW50c1sxXSkge1xuICAgICAgICAgICAgaWYgKHNpZ25YKSB3MSA9IG1heChXLCBtaW4oRSwgcG9pbnRzWzBdWzBdKSksIGUxID0gbWF4KFcsIG1pbihFLCBwb2ludHNbMV1bMF0pKSwgc2lnblggPSAxO1xuICAgICAgICAgICAgaWYgKHNpZ25ZKSBuMSA9IG1heChOLCBtaW4oUywgcG9pbnRzWzBdWzFdKSksIHMxID0gbWF4KE4sIG1pbihTLCBwb2ludHNbMV1bMV0pKSwgc2lnblkgPSAxO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoc2lnblggPCAwKSBkeCA9IG1heChXIC0gdzAsIG1pbihFIC0gdzAsIGR4KSksIHcxID0gdzAgKyBkeCwgZTEgPSBlMDtcbiAgICAgICAgICAgIGVsc2UgaWYgKHNpZ25YID4gMCkgZHggPSBtYXgoVyAtIGUwLCBtaW4oRSAtIGUwLCBkeCkpLCB3MSA9IHcwLCBlMSA9IGUwICsgZHg7XG4gICAgICAgICAgICBpZiAoc2lnblkgPCAwKSBkeSA9IG1heChOIC0gbjAsIG1pbihTIC0gbjAsIGR5KSksIG4xID0gbjAgKyBkeSwgczEgPSBzMDtcbiAgICAgICAgICAgIGVsc2UgaWYgKHNpZ25ZID4gMCkgZHkgPSBtYXgoTiAtIHMwLCBtaW4oUyAtIHMwLCBkeSkpLCBuMSA9IG4wLCBzMSA9IHMwICsgZHk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgTU9ERV9DRU5URVI6IHtcbiAgICAgICAgICBpZiAoc2lnblgpIHcxID0gbWF4KFcsIG1pbihFLCB3MCAtIGR4ICogc2lnblgpKSwgZTEgPSBtYXgoVywgbWluKEUsIGUwICsgZHggKiBzaWduWCkpO1xuICAgICAgICAgIGlmIChzaWduWSkgbjEgPSBtYXgoTiwgbWluKFMsIG4wIC0gZHkgKiBzaWduWSkpLCBzMSA9IG1heChOLCBtaW4oUywgczAgKyBkeSAqIHNpZ25ZKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGUxIDwgdzEpIHtcbiAgICAgICAgc2lnblggKj0gLTE7XG4gICAgICAgIHQgPSB3MCwgdzAgPSBlMCwgZTAgPSB0O1xuICAgICAgICB0ID0gdzEsIHcxID0gZTEsIGUxID0gdDtcbiAgICAgICAgaWYgKHR5cGUgaW4gZmxpcFgpIG92ZXJsYXkuYXR0cihcImN1cnNvclwiLCBjdXJzb3JzW3R5cGUgPSBmbGlwWFt0eXBlXV0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoczEgPCBuMSkge1xuICAgICAgICBzaWduWSAqPSAtMTtcbiAgICAgICAgdCA9IG4wLCBuMCA9IHMwLCBzMCA9IHQ7XG4gICAgICAgIHQgPSBuMSwgbjEgPSBzMSwgczEgPSB0O1xuICAgICAgICBpZiAodHlwZSBpbiBmbGlwWSkgb3ZlcmxheS5hdHRyKFwiY3Vyc29yXCIsIGN1cnNvcnNbdHlwZSA9IGZsaXBZW3R5cGVdXSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGF0ZS5zZWxlY3Rpb24pIHNlbGVjdGlvbiA9IHN0YXRlLnNlbGVjdGlvbjsgLy8gTWF5IGJlIHNldCBieSBicnVzaC5tb3ZlIVxuICAgICAgaWYgKGxvY2tYKSB3MSA9IHNlbGVjdGlvblswXVswXSwgZTEgPSBzZWxlY3Rpb25bMV1bMF07XG4gICAgICBpZiAobG9ja1kpIG4xID0gc2VsZWN0aW9uWzBdWzFdLCBzMSA9IHNlbGVjdGlvblsxXVsxXTtcblxuICAgICAgaWYgKHNlbGVjdGlvblswXVswXSAhPT0gdzFcbiAgICAgICAgICB8fCBzZWxlY3Rpb25bMF1bMV0gIT09IG4xXG4gICAgICAgICAgfHwgc2VsZWN0aW9uWzFdWzBdICE9PSBlMVxuICAgICAgICAgIHx8IHNlbGVjdGlvblsxXVsxXSAhPT0gczEpIHtcbiAgICAgICAgc3RhdGUuc2VsZWN0aW9uID0gW1t3MSwgbjFdLCBbZTEsIHMxXV07XG4gICAgICAgIHJlZHJhdy5jYWxsKHRoYXQpO1xuICAgICAgICBlbWl0LmJydXNoKGV2ZW50LCBtb2RlLm5hbWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGVuZGVkKGV2ZW50KSB7XG4gICAgICBub3Byb3BhZ2F0aW9uKGV2ZW50KTtcbiAgICAgIGlmIChldmVudC50b3VjaGVzKSB7XG4gICAgICAgIGlmIChldmVudC50b3VjaGVzLmxlbmd0aCkgcmV0dXJuO1xuICAgICAgICBpZiAodG91Y2hlbmRpbmcpIGNsZWFyVGltZW91dCh0b3VjaGVuZGluZyk7XG4gICAgICAgIHRvdWNoZW5kaW5nID0gc2V0VGltZW91dChmdW5jdGlvbigpIHsgdG91Y2hlbmRpbmcgPSBudWxsOyB9LCA1MDApOyAvLyBHaG9zdCBjbGlja3MgYXJlIGRlbGF5ZWQhXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkcmFnRW5hYmxlKGV2ZW50LnZpZXcsIG1vdmluZyk7XG4gICAgICAgIHZpZXcub24oXCJrZXlkb3duLmJydXNoIGtleXVwLmJydXNoIG1vdXNlbW92ZS5icnVzaCBtb3VzZXVwLmJydXNoXCIsIG51bGwpO1xuICAgICAgfVxuICAgICAgZ3JvdXAuYXR0cihcInBvaW50ZXItZXZlbnRzXCIsIFwiYWxsXCIpO1xuICAgICAgb3ZlcmxheS5hdHRyKFwiY3Vyc29yXCIsIGN1cnNvcnMub3ZlcmxheSk7XG4gICAgICBpZiAoc3RhdGUuc2VsZWN0aW9uKSBzZWxlY3Rpb24gPSBzdGF0ZS5zZWxlY3Rpb247IC8vIE1heSBiZSBzZXQgYnkgYnJ1c2gubW92ZSAob24gc3RhcnQpIVxuICAgICAgaWYgKGVtcHR5KHNlbGVjdGlvbikpIHN0YXRlLnNlbGVjdGlvbiA9IG51bGwsIHJlZHJhdy5jYWxsKHRoYXQpO1xuICAgICAgZW1pdC5lbmQoZXZlbnQsIG1vZGUubmFtZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24ga2V5ZG93bmVkKGV2ZW50KSB7XG4gICAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgICAgY2FzZSAxNjogeyAvLyBTSElGVFxuICAgICAgICAgIHNoaWZ0aW5nID0gc2lnblggJiYgc2lnblk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAxODogeyAvLyBBTFRcbiAgICAgICAgICBpZiAobW9kZSA9PT0gTU9ERV9IQU5ETEUpIHtcbiAgICAgICAgICAgIGlmIChzaWduWCkgZTAgPSBlMSAtIGR4ICogc2lnblgsIHcwID0gdzEgKyBkeCAqIHNpZ25YO1xuICAgICAgICAgICAgaWYgKHNpZ25ZKSBzMCA9IHMxIC0gZHkgKiBzaWduWSwgbjAgPSBuMSArIGR5ICogc2lnblk7XG4gICAgICAgICAgICBtb2RlID0gTU9ERV9DRU5URVI7XG4gICAgICAgICAgICBtb3ZlKGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAzMjogeyAvLyBTUEFDRTsgdGFrZXMgcHJpb3JpdHkgb3ZlciBBTFRcbiAgICAgICAgICBpZiAobW9kZSA9PT0gTU9ERV9IQU5ETEUgfHwgbW9kZSA9PT0gTU9ERV9DRU5URVIpIHtcbiAgICAgICAgICAgIGlmIChzaWduWCA8IDApIGUwID0gZTEgLSBkeDsgZWxzZSBpZiAoc2lnblggPiAwKSB3MCA9IHcxIC0gZHg7XG4gICAgICAgICAgICBpZiAoc2lnblkgPCAwKSBzMCA9IHMxIC0gZHk7IGVsc2UgaWYgKHNpZ25ZID4gMCkgbjAgPSBuMSAtIGR5O1xuICAgICAgICAgICAgbW9kZSA9IE1PREVfU1BBQ0U7XG4gICAgICAgICAgICBvdmVybGF5LmF0dHIoXCJjdXJzb3JcIiwgY3Vyc29ycy5zZWxlY3Rpb24pO1xuICAgICAgICAgICAgbW92ZShldmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6IHJldHVybjtcbiAgICAgIH1cbiAgICAgIG5vZXZlbnQoZXZlbnQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGtleXVwcGVkKGV2ZW50KSB7XG4gICAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgICAgY2FzZSAxNjogeyAvLyBTSElGVFxuICAgICAgICAgIGlmIChzaGlmdGluZykge1xuICAgICAgICAgICAgbG9ja1ggPSBsb2NrWSA9IHNoaWZ0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICBtb3ZlKGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAxODogeyAvLyBBTFRcbiAgICAgICAgICBpZiAobW9kZSA9PT0gTU9ERV9DRU5URVIpIHtcbiAgICAgICAgICAgIGlmIChzaWduWCA8IDApIGUwID0gZTE7IGVsc2UgaWYgKHNpZ25YID4gMCkgdzAgPSB3MTtcbiAgICAgICAgICAgIGlmIChzaWduWSA8IDApIHMwID0gczE7IGVsc2UgaWYgKHNpZ25ZID4gMCkgbjAgPSBuMTtcbiAgICAgICAgICAgIG1vZGUgPSBNT0RFX0hBTkRMRTtcbiAgICAgICAgICAgIG1vdmUoZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIDMyOiB7IC8vIFNQQUNFXG4gICAgICAgICAgaWYgKG1vZGUgPT09IE1PREVfU1BBQ0UpIHtcbiAgICAgICAgICAgIGlmIChldmVudC5hbHRLZXkpIHtcbiAgICAgICAgICAgICAgaWYgKHNpZ25YKSBlMCA9IGUxIC0gZHggKiBzaWduWCwgdzAgPSB3MSArIGR4ICogc2lnblg7XG4gICAgICAgICAgICAgIGlmIChzaWduWSkgczAgPSBzMSAtIGR5ICogc2lnblksIG4wID0gbjEgKyBkeSAqIHNpZ25ZO1xuICAgICAgICAgICAgICBtb2RlID0gTU9ERV9DRU5URVI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoc2lnblggPCAwKSBlMCA9IGUxOyBlbHNlIGlmIChzaWduWCA+IDApIHcwID0gdzE7XG4gICAgICAgICAgICAgIGlmIChzaWduWSA8IDApIHMwID0gczE7IGVsc2UgaWYgKHNpZ25ZID4gMCkgbjAgPSBuMTtcbiAgICAgICAgICAgICAgbW9kZSA9IE1PREVfSEFORExFO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3ZlcmxheS5hdHRyKFwiY3Vyc29yXCIsIGN1cnNvcnNbdHlwZV0pO1xuICAgICAgICAgICAgbW92ZShldmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6IHJldHVybjtcbiAgICAgIH1cbiAgICAgIG5vZXZlbnQoZXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHRvdWNobW92ZWQoZXZlbnQpIHtcbiAgICBlbWl0dGVyKHRoaXMsIGFyZ3VtZW50cykubW92ZWQoZXZlbnQpO1xuICB9XG5cbiAgZnVuY3Rpb24gdG91Y2hlbmRlZChldmVudCkge1xuICAgIGVtaXR0ZXIodGhpcywgYXJndW1lbnRzKS5lbmRlZChldmVudCk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0aWFsaXplKCkge1xuICAgIHZhciBzdGF0ZSA9IHRoaXMuX19icnVzaCB8fCB7c2VsZWN0aW9uOiBudWxsfTtcbiAgICBzdGF0ZS5leHRlbnQgPSBudW1iZXIyKGV4dGVudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgICBzdGF0ZS5kaW0gPSBkaW07XG4gICAgcmV0dXJuIHN0YXRlO1xuICB9XG5cbiAgYnJ1c2guZXh0ZW50ID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGV4dGVudCA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQobnVtYmVyMihfKSksIGJydXNoKSA6IGV4dGVudDtcbiAgfTtcblxuICBicnVzaC5maWx0ZXIgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoZmlsdGVyID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudCghIV8pLCBicnVzaCkgOiBmaWx0ZXI7XG4gIH07XG5cbiAgYnJ1c2gudG91Y2hhYmxlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHRvdWNoYWJsZSA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoISFfKSwgYnJ1c2gpIDogdG91Y2hhYmxlO1xuICB9O1xuXG4gIGJydXNoLmhhbmRsZVNpemUgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoaGFuZGxlU2l6ZSA9ICtfLCBicnVzaCkgOiBoYW5kbGVTaXplO1xuICB9O1xuXG4gIGJydXNoLmtleU1vZGlmaWVycyA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChrZXlzID0gISFfLCBicnVzaCkgOiBrZXlzO1xuICB9O1xuXG4gIGJydXNoLm9uID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlID0gbGlzdGVuZXJzLm9uLmFwcGx5KGxpc3RlbmVycywgYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdmFsdWUgPT09IGxpc3RlbmVycyA/IGJydXNoIDogdmFsdWU7XG4gIH07XG5cbiAgcmV0dXJuIGJydXNoO1xufVxuIiwKICAgICJleHBvcnQgZnVuY3Rpb24gVHJhbnNmb3JtKGssIHgsIHkpIHtcbiAgdGhpcy5rID0gaztcbiAgdGhpcy54ID0geDtcbiAgdGhpcy55ID0geTtcbn1cblxuVHJhbnNmb3JtLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IFRyYW5zZm9ybSxcbiAgc2NhbGU6IGZ1bmN0aW9uKGspIHtcbiAgICByZXR1cm4gayA9PT0gMSA/IHRoaXMgOiBuZXcgVHJhbnNmb3JtKHRoaXMuayAqIGssIHRoaXMueCwgdGhpcy55KTtcbiAgfSxcbiAgdHJhbnNsYXRlOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgcmV0dXJuIHggPT09IDAgJiB5ID09PSAwID8gdGhpcyA6IG5ldyBUcmFuc2Zvcm0odGhpcy5rLCB0aGlzLnggKyB0aGlzLmsgKiB4LCB0aGlzLnkgKyB0aGlzLmsgKiB5KTtcbiAgfSxcbiAgYXBwbHk6IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgcmV0dXJuIFtwb2ludFswXSAqIHRoaXMuayArIHRoaXMueCwgcG9pbnRbMV0gKiB0aGlzLmsgKyB0aGlzLnldO1xuICB9LFxuICBhcHBseVg6IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4geCAqIHRoaXMuayArIHRoaXMueDtcbiAgfSxcbiAgYXBwbHlZOiBmdW5jdGlvbih5KSB7XG4gICAgcmV0dXJuIHkgKiB0aGlzLmsgKyB0aGlzLnk7XG4gIH0sXG4gIGludmVydDogZnVuY3Rpb24obG9jYXRpb24pIHtcbiAgICByZXR1cm4gWyhsb2NhdGlvblswXSAtIHRoaXMueCkgLyB0aGlzLmssIChsb2NhdGlvblsxXSAtIHRoaXMueSkgLyB0aGlzLmtdO1xuICB9LFxuICBpbnZlcnRYOiBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuICh4IC0gdGhpcy54KSAvIHRoaXMuaztcbiAgfSxcbiAgaW52ZXJ0WTogZnVuY3Rpb24oeSkge1xuICAgIHJldHVybiAoeSAtIHRoaXMueSkgLyB0aGlzLms7XG4gIH0sXG4gIHJlc2NhbGVYOiBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHguY29weSgpLmRvbWFpbih4LnJhbmdlKCkubWFwKHRoaXMuaW52ZXJ0WCwgdGhpcykubWFwKHguaW52ZXJ0LCB4KSk7XG4gIH0sXG4gIHJlc2NhbGVZOiBmdW5jdGlvbih5KSB7XG4gICAgcmV0dXJuIHkuY29weSgpLmRvbWFpbih5LnJhbmdlKCkubWFwKHRoaXMuaW52ZXJ0WSwgdGhpcykubWFwKHkuaW52ZXJ0LCB5KSk7XG4gIH0sXG4gIHRvU3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCJ0cmFuc2xhdGUoXCIgKyB0aGlzLnggKyBcIixcIiArIHRoaXMueSArIFwiKSBzY2FsZShcIiArIHRoaXMuayArIFwiKVwiO1xuICB9XG59O1xuXG5leHBvcnQgdmFyIGlkZW50aXR5ID0gbmV3IFRyYW5zZm9ybSgxLCAwLCAwKTtcblxudHJhbnNmb3JtLnByb3RvdHlwZSA9IFRyYW5zZm9ybS5wcm90b3R5cGU7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRyYW5zZm9ybShub2RlKSB7XG4gIHdoaWxlICghbm9kZS5fX3pvb20pIGlmICghKG5vZGUgPSBub2RlLnBhcmVudE5vZGUpKSByZXR1cm4gaWRlbnRpdHk7XG4gIHJldHVybiBub2RlLl9fem9vbTtcbn1cbiIKICBdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7R0FBQyxRQUFRLENBQUMsR0FBRSxHQUFFO0FBQUEsSUFBVyxPQUFPLFdBQWpCLFlBQXVDLE9BQU8sVUFBcEIsY0FBMkIsT0FBTyxVQUFRLEVBQUUsSUFBYyxPQUFPLFVBQW5CLGNBQTJCLE9BQU8sTUFBSSxPQUFPLENBQUMsS0FBRyxJQUFlLE9BQU8sY0FBcEIsY0FBK0IsYUFBVyxLQUFHLE1BQU0sUUFBTSxFQUFFO0FBQUEsS0FBRyxTQUFNLFFBQVEsR0FBRTtBQUFBLElBQWMsSUFBSSxJQUFFLE1BQUksSUFBRSxPQUFJLElBQUUsU0FBSyxJQUFFLGVBQWMsSUFBRSxVQUFTLElBQUUsVUFBUyxJQUFFLFFBQU8sSUFBRSxPQUFNLElBQUUsUUFBTyxJQUFFLFNBQVEsSUFBRSxXQUFVLElBQUUsUUFBTyxJQUFFLFFBQU8sSUFBRSxnQkFBZSxJQUFFLDhGQUE2RixJQUFFLHdGQUF1RixJQUFFLEVBQUMsTUFBSyxNQUFLLFVBQVMsMkRBQTJELE1BQU0sR0FBRyxHQUFFLFFBQU8sd0ZBQXdGLE1BQU0sR0FBRyxHQUFFLFNBQVEsUUFBUSxDQUFDLElBQUU7QUFBQSxNQUFDLElBQUksS0FBRSxDQUFDLE1BQUssTUFBSyxNQUFLLElBQUksR0FBRSxLQUFFLEtBQUU7QUFBQSxNQUFJLE9BQU0sTUFBSSxNQUFHLEdBQUcsTUFBRSxNQUFJLE9BQUssR0FBRSxPQUFJLEdBQUUsTUFBSTtBQUFBLE1BQUksR0FBRSxJQUFFLFFBQVEsQ0FBQyxJQUFFLElBQUUsSUFBRTtBQUFBLE1BQUMsSUFBSSxLQUFFLE9BQU8sRUFBQztBQUFBLE1BQUUsT0FBTSxDQUFDLE1BQUcsR0FBRSxVQUFRLEtBQUUsS0FBRSxLQUFHLE1BQU0sS0FBRSxJQUFFLEdBQUUsTUFBTSxFQUFFLEtBQUssRUFBQyxJQUFFO0FBQUEsT0FBRyxJQUFFLEVBQUMsR0FBRSxHQUFFLEdBQUUsUUFBUSxDQUFDLElBQUU7QUFBQSxNQUFDLElBQUksS0FBRSxDQUFDLEdBQUUsVUFBVSxHQUFFLEtBQUUsS0FBSyxJQUFJLEVBQUMsR0FBRSxLQUFFLEtBQUssTUFBTSxLQUFFLEVBQUUsR0FBRSxLQUFFLEtBQUU7QUFBQSxNQUFHLFFBQU8sTUFBRyxJQUFFLE1BQUksT0FBSyxFQUFFLElBQUUsR0FBRSxHQUFHLElBQUUsTUFBSSxFQUFFLElBQUUsR0FBRSxHQUFHO0FBQUEsT0FBRyxHQUFFLFNBQVMsRUFBQyxDQUFDLElBQUUsSUFBRTtBQUFBLE1BQUMsSUFBRyxHQUFFLEtBQUssSUFBRSxHQUFFLEtBQUs7QUFBQSxRQUFFLE9BQU0sQ0FBQyxHQUFFLElBQUUsRUFBQztBQUFBLE1BQUUsSUFBSSxLQUFFLE1BQUksR0FBRSxLQUFLLElBQUUsR0FBRSxLQUFLLE1BQUksR0FBRSxNQUFNLElBQUUsR0FBRSxNQUFNLElBQUcsS0FBRSxHQUFFLE1BQU0sRUFBRSxJQUFJLElBQUUsQ0FBQyxHQUFFLEtBQUUsS0FBRSxLQUFFLEdBQUUsS0FBRSxHQUFFLE1BQU0sRUFBRSxJQUFJLE1BQUcsS0FBRSxLQUFHLElBQUcsQ0FBQztBQUFBLE1BQUUsT0FBTSxFQUFFLEVBQUUsTUFBRyxLQUFFLE9BQUksS0FBRSxLQUFFLEtBQUUsS0FBRSxRQUFLO0FBQUEsT0FBSSxHQUFFLFFBQVEsQ0FBQyxJQUFFO0FBQUEsTUFBQyxPQUFPLEtBQUUsSUFBRSxLQUFLLEtBQUssRUFBQyxLQUFHLElBQUUsS0FBSyxNQUFNLEVBQUM7QUFBQSxPQUFHLEdBQUUsUUFBUSxDQUFDLElBQUU7QUFBQSxNQUFDLE9BQU0sRUFBQyxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLElBQUcsR0FBRSxHQUFFLEVBQUMsRUFBRSxPQUFJLE9BQU8sTUFBRyxFQUFFLEVBQUUsWUFBWSxFQUFFLFFBQVEsTUFBSyxFQUFFO0FBQUEsT0FBRyxHQUFFLFFBQVEsQ0FBQyxJQUFFO0FBQUEsTUFBQyxPQUFnQixPQUFKO0FBQUEsTUFBTSxHQUFFLElBQUUsTUFBSyxJQUFFLENBQUM7QUFBQSxJQUFFLEVBQUUsS0FBRztBQUFBLElBQUUsSUFBSSxJQUFFLGtCQUFpQixJQUFFLFFBQVEsQ0FBQyxJQUFFO0FBQUEsTUFBQyxPQUFPLGNBQWEsS0FBRyxFQUFFLENBQUMsTUFBRyxDQUFDLEdBQUU7QUFBQSxPQUFLLElBQUUsU0FBUyxFQUFDLENBQUMsSUFBRSxJQUFFLElBQUU7QUFBQSxNQUFDLElBQUk7QUFBQSxNQUFFLElBQUcsQ0FBQztBQUFBLFFBQUUsT0FBTztBQUFBLE1BQUUsSUFBYSxPQUFPLE1BQWpCLFVBQW1CO0FBQUEsUUFBQyxJQUFJLEtBQUUsR0FBRSxZQUFZO0FBQUEsUUFBRSxFQUFFLFFBQUssS0FBRSxLQUFHLE9BQUksRUFBRSxNQUFHLElBQUUsS0FBRTtBQUFBLFFBQUcsSUFBSSxLQUFFLEdBQUUsTUFBTSxHQUFHO0FBQUEsUUFBRSxJQUFHLENBQUMsTUFBRyxHQUFFLFNBQU87QUFBQSxVQUFFLE9BQU8sR0FBRSxHQUFFLEVBQUU7QUFBQSxNQUFDLEVBQUs7QUFBQSxRQUFDLElBQUksS0FBRSxHQUFFO0FBQUEsUUFBSyxFQUFFLE1BQUcsSUFBRSxLQUFFO0FBQUE7QUFBQSxNQUFFLE9BQU0sQ0FBQyxNQUFHLE9BQUksSUFBRSxLQUFHLE1BQUcsQ0FBQyxNQUFHO0FBQUEsT0FBRyxJQUFFLFFBQVEsQ0FBQyxJQUFFLElBQUU7QUFBQSxNQUFDLElBQUcsRUFBRSxFQUFDO0FBQUEsUUFBRSxPQUFPLEdBQUUsTUFBTTtBQUFBLE1BQUUsSUFBSSxLQUFZLE9BQU8sTUFBakIsV0FBbUIsS0FBRSxDQUFDO0FBQUEsTUFBRSxPQUFPLEdBQUUsT0FBSyxJQUFFLEdBQUUsT0FBSyxXQUFVLElBQUksRUFBRSxFQUFDO0FBQUEsT0FBRyxJQUFFO0FBQUEsSUFBRSxFQUFFLElBQUUsR0FBRSxFQUFFLElBQUUsR0FBRSxFQUFFLElBQUUsUUFBUSxDQUFDLElBQUUsSUFBRTtBQUFBLE1BQUMsT0FBTyxFQUFFLElBQUUsRUFBQyxRQUFPLEdBQUUsSUFBRyxLQUFJLEdBQUUsSUFBRyxHQUFFLEdBQUUsSUFBRyxTQUFRLEdBQUUsUUFBTyxDQUFDO0FBQUE7QUFBQSxJQUFHLElBQUksSUFBRSxRQUFRLEdBQUU7QUFBQSxNQUFDLFNBQVMsRUFBQyxDQUFDLElBQUU7QUFBQSxRQUFDLEtBQUssS0FBRyxFQUFFLEdBQUUsUUFBTyxNQUFLLElBQUUsR0FBRSxLQUFLLE1BQU0sRUFBQyxHQUFFLEtBQUssS0FBRyxLQUFLLE1BQUksR0FBRSxLQUFHLENBQUMsR0FBRSxLQUFLLEtBQUc7QUFBQTtBQUFBLE1BQUcsSUFBSSxLQUFFLEdBQUU7QUFBQSxNQUFVLE9BQU8sR0FBRSxRQUFNLFFBQVEsQ0FBQyxJQUFFO0FBQUEsUUFBQyxLQUFLLEtBQUcsUUFBUSxDQUFDLElBQUU7QUFBQSxVQUFDLE1BQVEsTUFBSixJQUFhLEtBQUosT0FBRTtBQUFBLFVBQU0sSUFBVSxPQUFQO0FBQUEsWUFBUyxPQUFPLElBQUksS0FBSyxHQUFHO0FBQUEsVUFBRSxJQUFHLEVBQUUsRUFBRSxFQUFDO0FBQUEsWUFBRSxPQUFPLElBQUk7QUFBQSxVQUFLLElBQUcsY0FBYTtBQUFBLFlBQUssT0FBTyxJQUFJLEtBQUssRUFBQztBQUFBLFVBQUUsSUFBYSxPQUFPLE1BQWpCLFlBQW9CLENBQUMsTUFBTSxLQUFLLEVBQUMsR0FBRTtBQUFBLFlBQUMsSUFBSSxLQUFFLEdBQUUsTUFBTSxDQUFDO0FBQUEsWUFBRSxJQUFHLElBQUU7QUFBQSxjQUFDLElBQUksS0FBRSxHQUFFLEtBQUcsS0FBRyxHQUFFLE1BQUcsR0FBRSxNQUFJLEtBQUssVUFBVSxHQUFFLENBQUM7QUFBQSxjQUFFLE9BQU8sS0FBRSxJQUFJLEtBQUssS0FBSyxJQUFJLEdBQUUsSUFBRyxJQUFFLEdBQUUsTUFBSSxHQUFFLEdBQUUsTUFBSSxHQUFFLEdBQUUsTUFBSSxHQUFFLEdBQUUsTUFBSSxHQUFFLEVBQUMsQ0FBQyxJQUFFLElBQUksS0FBSyxHQUFFLElBQUcsSUFBRSxHQUFFLE1BQUksR0FBRSxHQUFFLE1BQUksR0FBRSxHQUFFLE1BQUksR0FBRSxHQUFFLE1BQUksR0FBRSxFQUFDO0FBQUEsWUFBQztBQUFBLFVBQUM7QUFBQSxVQUFDLE9BQU8sSUFBSSxLQUFLLEVBQUM7QUFBQSxVQUFHLEVBQUMsR0FBRSxLQUFLLEtBQUs7QUFBQSxTQUFHLEdBQUUsT0FBSyxRQUFRLEdBQUU7QUFBQSxRQUFDLElBQUksS0FBRSxLQUFLO0FBQUEsUUFBRyxLQUFLLEtBQUcsR0FBRSxZQUFZLEdBQUUsS0FBSyxLQUFHLEdBQUUsU0FBUyxHQUFFLEtBQUssS0FBRyxHQUFFLFFBQVEsR0FBRSxLQUFLLEtBQUcsR0FBRSxPQUFPLEdBQUUsS0FBSyxLQUFHLEdBQUUsU0FBUyxHQUFFLEtBQUssS0FBRyxHQUFFLFdBQVcsR0FBRSxLQUFLLEtBQUcsR0FBRSxXQUFXLEdBQUUsS0FBSyxNQUFJLEdBQUUsZ0JBQWdCO0FBQUEsU0FBRyxHQUFFLFNBQU8sUUFBUSxHQUFFO0FBQUEsUUFBQyxPQUFPO0FBQUEsU0FBRyxHQUFFLFVBQVEsUUFBUSxHQUFFO0FBQUEsUUFBQyxPQUFNLEVBQUUsS0FBSyxHQUFHLFNBQVMsTUFBSTtBQUFBLFNBQUksR0FBRSxTQUFPLFFBQVEsQ0FBQyxJQUFFLElBQUU7QUFBQSxRQUFDLElBQUksS0FBRSxFQUFFLEVBQUM7QUFBQSxRQUFFLE9BQU8sS0FBSyxRQUFRLEVBQUMsS0FBRyxNQUFHLE1BQUcsS0FBSyxNQUFNLEVBQUM7QUFBQSxTQUFHLEdBQUUsVUFBUSxRQUFRLENBQUMsSUFBRSxJQUFFO0FBQUEsUUFBQyxPQUFPLEVBQUUsRUFBQyxJQUFFLEtBQUssUUFBUSxFQUFDO0FBQUEsU0FBRyxHQUFFLFdBQVMsUUFBUSxDQUFDLElBQUUsSUFBRTtBQUFBLFFBQUMsT0FBTyxLQUFLLE1BQU0sRUFBQyxJQUFFLEVBQUUsRUFBQztBQUFBLFNBQUcsR0FBRSxLQUFHLFFBQVEsQ0FBQyxJQUFFLElBQUUsSUFBRTtBQUFBLFFBQUMsT0FBTyxFQUFFLEVBQUUsRUFBQyxJQUFFLEtBQUssTUFBRyxLQUFLLElBQUksSUFBRSxFQUFDO0FBQUEsU0FBRyxHQUFFLE9BQUssUUFBUSxHQUFFO0FBQUEsUUFBQyxPQUFPLEtBQUssTUFBTSxLQUFLLFFBQVEsSUFBRSxJQUFHO0FBQUEsU0FBRyxHQUFFLFVBQVEsUUFBUSxHQUFFO0FBQUEsUUFBQyxPQUFPLEtBQUssR0FBRyxRQUFRO0FBQUEsU0FBRyxHQUFFLFVBQVEsUUFBUSxDQUFDLElBQUUsSUFBRTtBQUFBLFFBQUMsSUFBSSxLQUFFLE1BQUssS0FBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUMsS0FBRyxJQUFFLEtBQUUsRUFBRSxFQUFFLEVBQUMsR0FBRSxLQUFFLFFBQVEsQ0FBQyxJQUFFLElBQUU7QUFBQSxVQUFDLElBQUksS0FBRSxFQUFFLEVBQUUsR0FBRSxLQUFHLEtBQUssSUFBSSxHQUFFLElBQUcsSUFBRSxFQUFDLElBQUUsSUFBSSxLQUFLLEdBQUUsSUFBRyxJQUFFLEVBQUMsR0FBRSxFQUFDO0FBQUEsVUFBRSxPQUFPLEtBQUUsS0FBRSxHQUFFLE1BQU0sQ0FBQztBQUFBLFdBQUcsS0FBRSxRQUFRLENBQUMsSUFBRSxJQUFFO0FBQUEsVUFBQyxPQUFPLEVBQUUsRUFBRSxHQUFFLE9BQU8sRUFBRSxJQUFHLE1BQU0sR0FBRSxPQUFPLEdBQUcsSUFBRyxLQUFFLENBQUMsR0FBRSxHQUFFLEdBQUUsQ0FBQyxJQUFFLENBQUMsSUFBRyxJQUFHLElBQUcsR0FBRyxHQUFHLE1BQU0sRUFBQyxDQUFDLEdBQUUsRUFBQztBQUFBLFdBQUcsS0FBRSxLQUFLLElBQUcsS0FBRSxLQUFLLElBQUcsS0FBRSxLQUFLLElBQUcsS0FBRSxTQUFPLEtBQUssS0FBRyxRQUFNO0FBQUEsUUFBSSxRQUFPO0FBQUEsZUFBUTtBQUFBLFlBQUUsT0FBTyxLQUFFLEdBQUUsR0FBRSxDQUFDLElBQUUsR0FBRSxJQUFHLEVBQUU7QUFBQSxlQUFPO0FBQUEsWUFBRSxPQUFPLEtBQUUsR0FBRSxHQUFFLEVBQUMsSUFBRSxHQUFFLEdBQUUsS0FBRSxDQUFDO0FBQUEsZUFBTztBQUFBLFlBQUUsSUFBSSxLQUFFLEtBQUssUUFBUSxFQUFFLGFBQVcsR0FBRSxNQUFHLEtBQUUsS0FBRSxLQUFFLElBQUUsTUFBRztBQUFBLFlBQUUsT0FBTyxHQUFFLEtBQUUsS0FBRSxLQUFFLE1BQUcsSUFBRSxLQUFHLEVBQUM7QUFBQSxlQUFPO0FBQUEsZUFBTztBQUFBLFlBQUUsT0FBTyxHQUFFLEtBQUUsU0FBUSxDQUFDO0FBQUEsZUFBTztBQUFBLFlBQUUsT0FBTyxHQUFFLEtBQUUsV0FBVSxDQUFDO0FBQUEsZUFBTztBQUFBLFlBQUUsT0FBTyxHQUFFLEtBQUUsV0FBVSxDQUFDO0FBQUEsZUFBTztBQUFBLFlBQUUsT0FBTyxHQUFFLEtBQUUsZ0JBQWUsQ0FBQztBQUFBO0FBQUEsWUFBVSxPQUFPLEtBQUssTUFBTTtBQUFBO0FBQUEsU0FBSSxHQUFFLFFBQU0sUUFBUSxDQUFDLElBQUU7QUFBQSxRQUFDLE9BQU8sS0FBSyxRQUFRLElBQUUsS0FBRTtBQUFBLFNBQUcsR0FBRSxPQUFLLFFBQVEsQ0FBQyxJQUFFLElBQUU7QUFBQSxRQUFDLElBQUksSUFBRSxLQUFFLEVBQUUsRUFBRSxFQUFDLEdBQUUsS0FBRSxTQUFPLEtBQUssS0FBRyxRQUFNLEtBQUksTUFBRyxLQUFFLENBQUMsR0FBRSxHQUFFLEtBQUcsS0FBRSxRQUFPLEdBQUUsS0FBRyxLQUFFLFFBQU8sR0FBRSxLQUFHLEtBQUUsU0FBUSxHQUFFLEtBQUcsS0FBRSxZQUFXLEdBQUUsS0FBRyxLQUFFLFNBQVEsR0FBRSxLQUFHLEtBQUUsV0FBVSxHQUFFLEtBQUcsS0FBRSxXQUFVLEdBQUUsS0FBRyxLQUFFLGdCQUFlLElBQUcsS0FBRyxLQUFFLE9BQUksSUFBRSxLQUFLLE1BQUksS0FBRSxLQUFLLE1BQUk7QUFBQSxRQUFFLElBQUcsT0FBSSxLQUFHLE9BQUksR0FBRTtBQUFBLFVBQUMsSUFBSSxLQUFFLEtBQUssTUFBTSxFQUFFLElBQUksR0FBRSxDQUFDO0FBQUEsVUFBRSxHQUFFLEdBQUcsSUFBRyxFQUFDLEdBQUUsR0FBRSxLQUFLLEdBQUUsS0FBSyxLQUFHLEdBQUUsSUFBSSxHQUFFLEtBQUssSUFBSSxLQUFLLElBQUcsR0FBRSxZQUFZLENBQUMsQ0FBQyxFQUFFO0FBQUEsUUFBRSxFQUFNO0FBQUEsZ0JBQUcsS0FBSyxHQUFHLElBQUcsRUFBQztBQUFBLFFBQUUsT0FBTyxLQUFLLEtBQUssR0FBRTtBQUFBLFNBQU0sR0FBRSxNQUFJLFFBQVEsQ0FBQyxJQUFFLElBQUU7QUFBQSxRQUFDLE9BQU8sS0FBSyxNQUFNLEVBQUUsS0FBSyxJQUFFLEVBQUM7QUFBQSxTQUFHLEdBQUUsTUFBSSxRQUFRLENBQUMsSUFBRTtBQUFBLFFBQUMsT0FBTyxLQUFLLEVBQUUsRUFBRSxFQUFDLEdBQUc7QUFBQSxTQUFHLEdBQUUsTUFBSSxRQUFRLENBQUMsSUFBRSxJQUFFO0FBQUEsUUFBQyxJQUFJLElBQUUsS0FBRTtBQUFBLFFBQUssS0FBRSxPQUFPLEVBQUM7QUFBQSxRQUFFLElBQUksS0FBRSxFQUFFLEVBQUUsRUFBQyxHQUFFLEtBQUUsUUFBUSxDQUFDLElBQUU7QUFBQSxVQUFDLElBQUksS0FBRSxFQUFFLEVBQUM7QUFBQSxVQUFFLE9BQU8sRUFBRSxFQUFFLEdBQUUsS0FBSyxHQUFFLEtBQUssSUFBRSxLQUFLLE1BQU0sS0FBRSxFQUFDLENBQUMsR0FBRSxFQUFDO0FBQUE7QUFBQSxRQUFHLElBQUcsT0FBSTtBQUFBLFVBQUUsT0FBTyxLQUFLLElBQUksR0FBRSxLQUFLLEtBQUcsRUFBQztBQUFBLFFBQUUsSUFBRyxPQUFJO0FBQUEsVUFBRSxPQUFPLEtBQUssSUFBSSxHQUFFLEtBQUssS0FBRyxFQUFDO0FBQUEsUUFBRSxJQUFHLE9BQUk7QUFBQSxVQUFFLE9BQU8sR0FBRSxDQUFDO0FBQUEsUUFBRSxJQUFHLE9BQUk7QUFBQSxVQUFFLE9BQU8sR0FBRSxDQUFDO0FBQUEsUUFBRSxJQUFJLE1BQUcsS0FBRSxDQUFDLEdBQUUsR0FBRSxLQUFHLEdBQUUsR0FBRSxLQUFHLEdBQUUsR0FBRSxLQUFHLEdBQUUsSUFBRyxPQUFJLEdBQUUsS0FBRSxLQUFLLEdBQUcsUUFBUSxJQUFFLEtBQUU7QUFBQSxRQUFFLE9BQU8sRUFBRSxFQUFFLElBQUUsSUFBSTtBQUFBLFNBQUcsR0FBRSxXQUFTLFFBQVEsQ0FBQyxJQUFFLElBQUU7QUFBQSxRQUFDLE9BQU8sS0FBSyxJQUFJLEtBQUcsSUFBRSxFQUFDO0FBQUEsU0FBRyxHQUFFLFNBQU8sUUFBUSxDQUFDLElBQUU7QUFBQSxRQUFDLElBQUksS0FBRSxNQUFLLEtBQUUsS0FBSyxRQUFRO0FBQUEsUUFBRSxJQUFHLENBQUMsS0FBSyxRQUFRO0FBQUEsVUFBRSxPQUFPLEdBQUUsZUFBYTtBQUFBLFFBQUUsSUFBSSxLQUFFLE1BQUcsd0JBQXVCLEtBQUUsRUFBRSxFQUFFLElBQUksR0FBRSxLQUFFLEtBQUssSUFBRyxLQUFFLEtBQUssSUFBRyxLQUFFLEtBQUssSUFBRyxLQUFFLEdBQUUsVUFBUyxLQUFFLEdBQUUsUUFBTyxLQUFFLEdBQUUsVUFBUyxLQUFFLFFBQVEsQ0FBQyxJQUFFLElBQUUsSUFBRSxJQUFFO0FBQUEsVUFBQyxPQUFPLE9BQUksR0FBRSxPQUFJLEdBQUUsSUFBRSxFQUFDLE1BQUksR0FBRSxJQUFHLE1BQU0sR0FBRSxFQUFDO0FBQUEsV0FBRyxLQUFFLFFBQVEsQ0FBQyxJQUFFO0FBQUEsVUFBQyxPQUFPLEVBQUUsRUFBRSxLQUFFLE1BQUksSUFBRyxJQUFFLEdBQUc7QUFBQSxXQUFHLEtBQUUsTUFBRyxRQUFRLENBQUMsSUFBRSxJQUFFLElBQUU7QUFBQSxVQUFDLElBQUksS0FBRSxLQUFFLEtBQUcsT0FBSztBQUFBLFVBQUssT0FBTyxLQUFFLEdBQUUsWUFBWSxJQUFFO0FBQUE7QUFBQSxRQUFHLE9BQU8sR0FBRSxRQUFRLEdBQUcsUUFBUSxDQUFDLElBQUUsSUFBRTtBQUFBLFVBQUMsT0FBTyxNQUFHLFFBQVEsQ0FBQyxJQUFFO0FBQUEsWUFBQyxRQUFPO0FBQUEsbUJBQU87QUFBQSxnQkFBSyxPQUFPLE9BQU8sR0FBRSxFQUFFLEVBQUUsTUFBTSxFQUFFO0FBQUEsbUJBQU07QUFBQSxnQkFBTyxPQUFPLEVBQUUsRUFBRSxHQUFFLElBQUcsR0FBRSxHQUFHO0FBQUEsbUJBQU07QUFBQSxnQkFBSSxPQUFPLEtBQUU7QUFBQSxtQkFBTTtBQUFBLGdCQUFLLE9BQU8sRUFBRSxFQUFFLEtBQUUsR0FBRSxHQUFFLEdBQUc7QUFBQSxtQkFBTTtBQUFBLGdCQUFNLE9BQU8sR0FBRSxHQUFFLGFBQVksSUFBRSxJQUFFLENBQUM7QUFBQSxtQkFBTTtBQUFBLGdCQUFPLE9BQU8sR0FBRSxJQUFFLEVBQUM7QUFBQSxtQkFBTTtBQUFBLGdCQUFJLE9BQU8sR0FBRTtBQUFBLG1CQUFPO0FBQUEsZ0JBQUssT0FBTyxFQUFFLEVBQUUsR0FBRSxJQUFHLEdBQUUsR0FBRztBQUFBLG1CQUFNO0FBQUEsZ0JBQUksT0FBTyxPQUFPLEdBQUUsRUFBRTtBQUFBLG1CQUFNO0FBQUEsZ0JBQUssT0FBTyxHQUFFLEdBQUUsYUFBWSxHQUFFLElBQUcsSUFBRSxDQUFDO0FBQUEsbUJBQU07QUFBQSxnQkFBTSxPQUFPLEdBQUUsR0FBRSxlQUFjLEdBQUUsSUFBRyxJQUFFLENBQUM7QUFBQSxtQkFBTTtBQUFBLGdCQUFPLE9BQU8sR0FBRSxHQUFFO0FBQUEsbUJBQVE7QUFBQSxnQkFBSSxPQUFPLE9BQU8sRUFBQztBQUFBLG1CQUFNO0FBQUEsZ0JBQUssT0FBTyxFQUFFLEVBQUUsSUFBRSxHQUFFLEdBQUc7QUFBQSxtQkFBTTtBQUFBLGdCQUFJLE9BQU8sR0FBRSxDQUFDO0FBQUEsbUJBQU07QUFBQSxnQkFBSyxPQUFPLEdBQUUsQ0FBQztBQUFBLG1CQUFNO0FBQUEsZ0JBQUksT0FBTyxHQUFFLElBQUUsSUFBRSxJQUFFO0FBQUEsbUJBQU07QUFBQSxnQkFBSSxPQUFPLEdBQUUsSUFBRSxJQUFFLEtBQUU7QUFBQSxtQkFBTTtBQUFBLGdCQUFJLE9BQU8sT0FBTyxFQUFDO0FBQUEsbUJBQU07QUFBQSxnQkFBSyxPQUFPLEVBQUUsRUFBRSxJQUFFLEdBQUUsR0FBRztBQUFBLG1CQUFNO0FBQUEsZ0JBQUksT0FBTyxPQUFPLEdBQUUsRUFBRTtBQUFBLG1CQUFNO0FBQUEsZ0JBQUssT0FBTyxFQUFFLEVBQUUsR0FBRSxJQUFHLEdBQUUsR0FBRztBQUFBLG1CQUFNO0FBQUEsZ0JBQU0sT0FBTyxFQUFFLEVBQUUsR0FBRSxLQUFJLEdBQUUsR0FBRztBQUFBLG1CQUFNO0FBQUEsZ0JBQUksT0FBTztBQUFBO0FBQUEsWUFBRSxPQUFPO0FBQUEsWUFBTSxFQUFDLEtBQUcsR0FBRSxRQUFRLEtBQUksRUFBRTtBQUFBLFNBQUc7QUFBQSxTQUFHLEdBQUUsWUFBVSxRQUFRLEdBQUU7QUFBQSxRQUFDLE9BQU8sS0FBRyxDQUFDLEtBQUssTUFBTSxLQUFLLEdBQUcsa0JBQWtCLElBQUUsRUFBRTtBQUFBLFNBQUcsR0FBRSxPQUFLLFFBQVEsQ0FBQyxJQUFFLElBQUUsSUFBRTtBQUFBLFFBQUMsSUFBSSxJQUFFLEtBQUUsTUFBSyxLQUFFLEVBQUUsRUFBRSxFQUFDLEdBQUUsS0FBRSxFQUFFLEVBQUMsR0FBRSxNQUFHLEdBQUUsVUFBVSxJQUFFLEtBQUssVUFBVSxLQUFHLEdBQUUsS0FBRSxPQUFLLElBQUUsS0FBRSxRQUFRLEdBQUU7QUFBQSxVQUFDLE9BQU8sRUFBRSxFQUFFLElBQUUsRUFBQztBQUFBO0FBQUEsUUFBRyxRQUFPO0FBQUEsZUFBUTtBQUFBLFlBQUUsS0FBRSxHQUFFLElBQUU7QUFBQSxZQUFHO0FBQUEsZUFBVztBQUFBLFlBQUUsS0FBRSxHQUFFO0FBQUEsWUFBRTtBQUFBLGVBQVc7QUFBQSxZQUFFLEtBQUUsR0FBRSxJQUFFO0FBQUEsWUFBRTtBQUFBLGVBQVc7QUFBQSxZQUFFLE1BQUcsS0FBRSxNQUFHO0FBQUEsWUFBTztBQUFBLGVBQVc7QUFBQSxZQUFFLE1BQUcsS0FBRSxNQUFHO0FBQUEsWUFBTTtBQUFBLGVBQVc7QUFBQSxZQUFFLEtBQUUsS0FBRTtBQUFBLFlBQUU7QUFBQSxlQUFXO0FBQUEsWUFBRSxLQUFFLEtBQUU7QUFBQSxZQUFFO0FBQUEsZUFBVztBQUFBLFlBQUUsS0FBRSxLQUFFO0FBQUEsWUFBRTtBQUFBO0FBQUEsWUFBYyxLQUFFO0FBQUE7QUFBQSxRQUFFLE9BQU8sS0FBRSxLQUFFLEVBQUUsRUFBRSxFQUFDO0FBQUEsU0FBRyxHQUFFLGNBQVksUUFBUSxHQUFFO0FBQUEsUUFBQyxPQUFPLEtBQUssTUFBTSxDQUFDLEVBQUU7QUFBQSxTQUFJLEdBQUUsVUFBUSxRQUFRLEdBQUU7QUFBQSxRQUFDLE9BQU8sRUFBRSxLQUFLO0FBQUEsU0FBSyxHQUFFLFNBQU8sUUFBUSxDQUFDLElBQUUsSUFBRTtBQUFBLFFBQUMsSUFBRyxDQUFDO0FBQUEsVUFBRSxPQUFPLEtBQUs7QUFBQSxRQUFHLElBQUksS0FBRSxLQUFLLE1BQU0sR0FBRSxLQUFFLEVBQUUsSUFBRSxJQUFFLElBQUU7QUFBQSxRQUFFLE9BQU8sT0FBSSxHQUFFLEtBQUcsS0FBRztBQUFBLFNBQUcsR0FBRSxRQUFNLFFBQVEsR0FBRTtBQUFBLFFBQUMsT0FBTyxFQUFFLEVBQUUsS0FBSyxJQUFHLElBQUk7QUFBQSxTQUFHLEdBQUUsU0FBTyxRQUFRLEdBQUU7QUFBQSxRQUFDLE9BQU8sSUFBSSxLQUFLLEtBQUssUUFBUSxDQUFDO0FBQUEsU0FBRyxHQUFFLFNBQU8sUUFBUSxHQUFFO0FBQUEsUUFBQyxPQUFPLEtBQUssUUFBUSxJQUFFLEtBQUssWUFBWSxJQUFFO0FBQUEsU0FBTSxHQUFFLGNBQVksUUFBUSxHQUFFO0FBQUEsUUFBQyxPQUFPLEtBQUssR0FBRyxZQUFZO0FBQUEsU0FBRyxHQUFFLFdBQVMsUUFBUSxHQUFFO0FBQUEsUUFBQyxPQUFPLEtBQUssR0FBRyxZQUFZO0FBQUEsU0FBRztBQUFBLE1BQUcsR0FBRSxJQUFFLEVBQUU7QUFBQSxJQUFVLE9BQU8sRUFBRSxZQUFVLEdBQUUsQ0FBQyxDQUFDLE9BQU0sQ0FBQyxHQUFFLENBQUMsTUFBSyxDQUFDLEdBQUUsQ0FBQyxNQUFLLENBQUMsR0FB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LElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsS0FBSztBQUFBLEVBQ1A7QUFBQSxFQUVBLElBQUksYUFBYTtBQUFBLElBQ2YsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsS0FBSztBQUFBLEVBQ1A7QUFBQSxFQUVBLElBQUksU0FBUztBQUFBLElBQ1gsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFBLElBQ0wsR0FBSztBQUFB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QUNwQixPQUFPLEdBQUUsS0FBSyxFQUFFLE9BQU8sR0FBRSxNQUFNLEVBQUUsSUFBSSxLQUFLLFNBQVMsSUFBSSxFQUFFLElBQUksR0FBRSxRQUFRLEVBQUMsQ0FBQztBQUFBO0FBQUEsRUFFM0UsVUFBVSxRQUFRLENBQUMsSUFBRztBQUFBLElBQ3BCLE9BQU8sR0FBRSxLQUFLLEVBQUUsT0FBTyxHQUFFLE1BQU0sRUFBRSxJQUFJLEtBQUssU0FBUyxJQUFJLEVBQUUsSUFBSSxHQUFFLFFBQVEsRUFBQyxDQUFDO0FBQUE7QUFBQSxFQUUzRSxVQUFVLFFBQVEsR0FBRztBQUFBLElBQ25CLE9BQU8sZUFBZSxLQUFLLElBQUksTUFBTSxLQUFLLElBQUksYUFBYSxLQUFLLElBQUk7QUFBQTtBQUV4RTtBQUVPLElBQUksWUFBVyxJQUFJLFVBQVUsR0FBRyxHQUFHLENBQUM7QUFFM0MsVUFBVSxZQUFZLFVBQVU7QUFFaEMsU0FBd0IsU0FBUyxDQUFDLE1BQU07QUFBQSxFQUN0QyxPQUFPLENBQUMsS0FBSztBQUFBLElBQVEsSUFBSSxFQUFFLE9BQU8sS0FBSztBQUFBLE1BQWEsT0FBTztBQUFBLEVBQzNELE9BQU8sS0FBSztBQUFBOyIsCiAgImRlYnVnSWQiOiAiN0JCMzU2RUU0NUQ5RTRENjY0NzU2RTIxNjQ3NTZFMjEiLAogICJuYW1lcyI6IFtdCn0=
