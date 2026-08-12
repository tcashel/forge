import {
  utils_default
} from "./chunk-main-vvfzntzy.js";
import {
  require_dist
} from "./chunk-main-ck580f0k.js";
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
  __name,
  axisBottom,
  axisTop,
  hcl_default,
  linear,
  log,
  max,
  millisecond,
  min,
  require_dayjs_min,
  second,
  select_default,
  time,
  timeDay,
  timeFormat,
  timeFriday,
  timeHour,
  timeMinute,
  timeMonday,
  timeMonth,
  timeSaturday,
  timeSunday,
  timeThursday,
  timeTuesday,
  timeWednesday
} from "./chunk-main-vcnyggwp.js";
import {
  __commonJS,
  __toESM
} from "./chunk-main-g8wf8be2.js";

// node_modules/dayjs/plugin/isoWeek.js
var require_isoWeek = __commonJS((exports, module) => {
  (function(e, t) {
    typeof exports == "object" && typeof module != "undefined" ? module.exports = t() : typeof define == "function" && define.amd ? define(t) : (e = typeof globalThis != "undefined" ? globalThis : e || self).dayjs_plugin_isoWeek = t();
  })(exports, function() {
    var e = "day";
    return function(t, i, s) {
      var a = function(t2) {
        return t2.add(4 - t2.isoWeekday(), e);
      }, d = i.prototype;
      d.isoWeekYear = function() {
        return a(this).year();
      }, d.isoWeek = function(t2) {
        if (!this.$utils().u(t2))
          return this.add(7 * (t2 - this.isoWeek()), e);
        var i2, d2, n2, o, r = a(this), u = (i2 = this.isoWeekYear(), d2 = this.$u, n2 = (d2 ? s.utc : s)().year(i2).startOf("year"), o = 4 - n2.isoWeekday(), n2.isoWeekday() > 4 && (o += 7), n2.add(o, e));
        return r.diff(u, "week") + 1;
      }, d.isoWeekday = function(e2) {
        return this.$utils().u(e2) ? this.day() || 7 : this.day(this.day() % 7 ? e2 : e2 - 7);
      };
      var n = d.startOf;
      d.startOf = function(e2, t2) {
        var i2 = this.$utils(), s2 = !!i2.u(t2) || t2;
        return i2.p(e2) === "isoweek" ? s2 ? this.date(this.date() - (this.isoWeekday() - 1)).startOf("day") : this.date(this.date() - 1 - (this.isoWeekday() - 1) + 7).endOf("day") : n.bind(this)(e2, t2);
      };
    };
  });
});

// node_modules/dayjs/plugin/customParseFormat.js
var require_customParseFormat = __commonJS((exports, module) => {
  (function(e, t) {
    typeof exports == "object" && typeof module != "undefined" ? module.exports = t() : typeof define == "function" && define.amd ? define(t) : (e = typeof globalThis != "undefined" ? globalThis : e || self).dayjs_plugin_customParseFormat = t();
  })(exports, function() {
    var e = { LTS: "h:mm:ss A", LT: "h:mm A", L: "MM/DD/YYYY", LL: "MMMM D, YYYY", LLL: "MMMM D, YYYY h:mm A", LLLL: "dddd, MMMM D, YYYY h:mm A" }, t = /(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|Q|YYYY|YY?|ww?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g, n = /\d/, r = /\d\d/, i = /\d\d?/, o = /\d*[^-_:/,()\s\d]+/, s = {}, a = function(e2) {
      return (e2 = +e2) + (e2 > 68 ? 1900 : 2000);
    };
    var f = function(e2) {
      return function(t2) {
        this[e2] = +t2;
      };
    }, h = [/[+-]\d\d:?(\d\d)?|Z/, function(e2) {
      (this.zone || (this.zone = {})).offset = function(e3) {
        if (!e3)
          return 0;
        if (e3 === "Z")
          return 0;
        var t2 = e3.match(/([+-]|\d\d)/g), n2 = 60 * t2[1] + (+t2[2] || 0);
        return n2 === 0 ? 0 : t2[0] === "+" ? -n2 : n2;
      }(e2);
    }], u = function(e2) {
      var t2 = s[e2];
      return t2 && (t2.indexOf ? t2 : t2.s.concat(t2.f));
    }, d = function(e2, t2) {
      var n2, r2 = s.meridiem;
      if (r2) {
        for (var i2 = 1;i2 <= 24; i2 += 1)
          if (e2.indexOf(r2(i2, 0, t2)) > -1) {
            n2 = i2 > 12;
            break;
          }
      } else
        n2 = e2 === (t2 ? "pm" : "PM");
      return n2;
    }, c = { A: [o, function(e2) {
      this.afternoon = d(e2, false);
    }], a: [o, function(e2) {
      this.afternoon = d(e2, true);
    }], Q: [n, function(e2) {
      this.month = 3 * (e2 - 1) + 1;
    }], S: [n, function(e2) {
      this.milliseconds = 100 * +e2;
    }], SS: [r, function(e2) {
      this.milliseconds = 10 * +e2;
    }], SSS: [/\d{3}/, function(e2) {
      this.milliseconds = +e2;
    }], s: [i, f("seconds")], ss: [i, f("seconds")], m: [i, f("minutes")], mm: [i, f("minutes")], H: [i, f("hours")], h: [i, f("hours")], HH: [i, f("hours")], hh: [i, f("hours")], D: [i, f("day")], DD: [r, f("day")], Do: [o, function(e2) {
      var t2 = s.ordinal, n2 = e2.match(/\d+/);
      if (this.day = n2[0], t2)
        for (var r2 = 1;r2 <= 31; r2 += 1)
          t2(r2).replace(/\[|\]/g, "") === e2 && (this.day = r2);
    }], w: [i, f("week")], ww: [r, f("week")], M: [i, f("month")], MM: [r, f("month")], MMM: [o, function(e2) {
      var t2 = u("months"), n2 = (u("monthsShort") || t2.map(function(e3) {
        return e3.slice(0, 3);
      })).indexOf(e2) + 1;
      if (n2 < 1)
        throw new Error;
      this.month = n2 % 12 || n2;
    }], MMMM: [o, function(e2) {
      var t2 = u("months").indexOf(e2) + 1;
      if (t2 < 1)
        throw new Error;
      this.month = t2 % 12 || t2;
    }], Y: [/[+-]?\d+/, f("year")], YY: [r, function(e2) {
      this.year = a(e2);
    }], YYYY: [/\d{4}/, f("year")], Z: h, ZZ: h };
    function l(n2) {
      var r2, i2;
      r2 = n2, i2 = s && s.formats;
      for (var o2 = (n2 = r2.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g, function(t2, n3, r3) {
        var o3 = r3 && r3.toUpperCase();
        return n3 || i2[r3] || e[r3] || i2[o3].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g, function(e2, t3, n4) {
          return t3 || n4.slice(1);
        });
      })).match(t), a2 = o2.length, f2 = 0;f2 < a2; f2 += 1) {
        var h2 = o2[f2], u2 = c[h2], d2 = u2 && u2[0], l2 = u2 && u2[1];
        o2[f2] = l2 ? { regex: d2, parser: l2 } : h2.replace(/^\[|\]$/g, "");
      }
      return function(e2) {
        for (var t2 = {}, n3 = 0, r3 = 0;n3 < a2; n3 += 1) {
          var i3 = o2[n3];
          if (typeof i3 == "string")
            r3 += i3.length;
          else {
            var { regex: s2, parser: f3 } = i3, h3 = e2.slice(r3), u3 = s2.exec(h3)[0];
            f3.call(t2, u3), e2 = e2.replace(u3, "");
          }
        }
        return function(e3) {
          var t3 = e3.afternoon;
          if (t3 !== undefined) {
            var n4 = e3.hours;
            t3 ? n4 < 12 && (e3.hours += 12) : n4 === 12 && (e3.hours = 0), delete e3.afternoon;
          }
        }(t2), t2;
      };
    }
    return function(e2, t2, n2) {
      n2.p.customParseFormat = true, e2 && e2.parseTwoDigitYear && (a = e2.parseTwoDigitYear);
      var r2 = t2.prototype, i2 = r2.parse;
      r2.parse = function(e3) {
        var { date: t3, utc: r3, args: o2 } = e3;
        this.$u = r3;
        var a2 = o2[1];
        if (typeof a2 == "string") {
          var f2 = o2[2] === true, h2 = o2[3] === true, u2 = f2 || h2, d2 = o2[2];
          h2 && (d2 = o2[2]), s = this.$locale(), !f2 && d2 && (s = n2.Ls[d2]), this.$d = function(e4, t4, n3, r4) {
            try {
              if (["x", "X"].indexOf(t4) > -1)
                return new Date((t4 === "X" ? 1000 : 1) * e4);
              var i3 = l(t4)(e4), o3 = i3.year, s2 = i3.month, a3 = i3.day, f3 = i3.hours, h3 = i3.minutes, u3 = i3.seconds, d3 = i3.milliseconds, c3 = i3.zone, m2 = i3.week, M2 = new Date, Y = a3 || (o3 || s2 ? 1 : M2.getDate()), p = o3 || M2.getFullYear(), v = 0;
              o3 && !s2 || (v = s2 > 0 ? s2 - 1 : M2.getMonth());
              var D, w = f3 || 0, g = h3 || 0, y = u3 || 0, L = d3 || 0;
              return c3 ? new Date(Date.UTC(p, v, Y, w, g, y, L + 60 * c3.offset * 1000)) : n3 ? new Date(Date.UTC(p, v, Y, w, g, y, L)) : (D = new Date(p, v, Y, w, g, y, L), m2 && (D = r4(D).week(m2).toDate()), D);
            } catch (e5) {
              return new Date("");
            }
          }(t3, a2, r3, n2), this.init(), d2 && d2 !== true && (this.$L = this.locale(d2).$L), u2 && t3 != this.format(a2) && (this.$d = new Date("")), s = {};
        } else if (a2 instanceof Array)
          for (var c2 = a2.length, m = 1;m <= c2; m += 1) {
            o2[1] = a2[m - 1];
            var M = n2.apply(this, o2);
            if (M.isValid()) {
              this.$d = M.$d, this.$L = M.$L, this.init();
              break;
            }
            m === c2 && (this.$d = new Date(""));
          }
        else
          i2.call(this, e3);
      };
    };
  });
});

// node_modules/dayjs/plugin/advancedFormat.js
var require_advancedFormat = __commonJS((exports, module) => {
  (function(e, t) {
    typeof exports == "object" && typeof module != "undefined" ? module.exports = t() : typeof define == "function" && define.amd ? define(t) : (e = typeof globalThis != "undefined" ? globalThis : e || self).dayjs_plugin_advancedFormat = t();
  })(exports, function() {
    return function(e, t) {
      var r = t.prototype, n = r.format;
      r.format = function(e2) {
        var t2 = this, r2 = this.$locale();
        if (!this.isValid())
          return n.bind(this)(e2);
        var s = this.$utils(), a = (e2 || "YYYY-MM-DDTHH:mm:ssZ").replace(/\[([^\]]+)]|Q|wo|ww|w|WW|W|zzz|z|gggg|GGGG|Do|X|x|k{1,2}|S/g, function(e3) {
          switch (e3) {
            case "Q":
              return Math.ceil((t2.$M + 1) / 3);
            case "Do":
              return r2.ordinal(t2.$D);
            case "gggg":
              return t2.weekYear();
            case "GGGG":
              return t2.isoWeekYear();
            case "wo":
              return r2.ordinal(t2.week(), "W");
            case "w":
            case "ww":
              return s.s(t2.week(), e3 === "w" ? 1 : 2, "0");
            case "W":
            case "WW":
              return s.s(t2.isoWeek(), e3 === "W" ? 1 : 2, "0");
            case "k":
            case "kk":
              return s.s(String(t2.$H === 0 ? 24 : t2.$H), e3 === "k" ? 1 : 2, "0");
            case "X":
              return Math.floor(t2.$d.getTime() / 1000);
            case "x":
              return t2.$d.getTime();
            case "z":
              return "[" + t2.offsetName() + "]";
            case "zzz":
              return "[" + t2.offsetName("long") + "]";
            default:
              return e3;
          }
        });
        return n.bind(this)(a);
      };
    };
  });
});

// node_modules/dayjs/plugin/duration.js
var require_duration = __commonJS((exports, module) => {
  (function(t, s) {
    typeof exports == "object" && typeof module != "undefined" ? module.exports = s() : typeof define == "function" && define.amd ? define(s) : (t = typeof globalThis != "undefined" ? globalThis : t || self).dayjs_plugin_duration = s();
  })(exports, function() {
    var t, s, n = 1000, i = 60000, e = 3600000, r = 86400000, o = 31536000000, u = 2628000000, d = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/, a = /\[([^\]]+)]|YYYY|YY|Y|M{1,2}|D{1,2}|H{1,2}|m{1,2}|s{1,2}|SSS/g, h = { years: o, months: u, days: r, hours: e, minutes: i, seconds: n, milliseconds: 1, weeks: 604800000 }, c = function(t2) {
      return t2 instanceof g;
    }, f = function(t2, s2, n2) {
      return new g(t2, n2, s2.$l);
    }, m = function(t2) {
      return s.p(t2) + "s";
    }, l = function(t2) {
      return t2 < 0;
    }, $ = function(t2) {
      return l(t2) ? Math.ceil(t2) : Math.floor(t2);
    }, y = function(t2) {
      return Math.abs(t2);
    }, v = function(t2, s2) {
      return t2 ? l(t2) ? { negative: true, format: "" + y(t2) + s2 } : { negative: false, format: "" + t2 + s2 } : { negative: false, format: "" };
    }, g = function() {
      function l2(t2, s2, n2) {
        var i2 = this;
        if (this.$d = {}, this.$l = n2, t2 === undefined && (this.$ms = 0, this.parseFromMilliseconds()), s2)
          return f(t2 * h[m(s2)], this);
        if (typeof t2 == "number")
          return this.$ms = t2, this.parseFromMilliseconds(), this;
        if (typeof t2 == "object")
          return Object.keys(t2).forEach(function(s3) {
            i2.$d[m(s3)] = t2[s3];
          }), this.calMilliseconds(), this;
        if (typeof t2 == "string") {
          var e2 = t2.match(d);
          if (e2) {
            var r2 = e2.slice(2).map(function(t3) {
              return t3 != null ? Number(t3) : 0;
            });
            return this.$d.years = r2[0], this.$d.months = r2[1], this.$d.weeks = r2[2], this.$d.days = r2[3], this.$d.hours = r2[4], this.$d.minutes = r2[5], this.$d.seconds = r2[6], this.calMilliseconds(), this;
          }
        }
        return this;
      }
      var y2 = l2.prototype;
      return y2.calMilliseconds = function() {
        var t2 = this;
        this.$ms = Object.keys(this.$d).reduce(function(s2, n2) {
          return s2 + (t2.$d[n2] || 0) * h[n2];
        }, 0);
      }, y2.parseFromMilliseconds = function() {
        var t2 = this.$ms;
        this.$d.years = $(t2 / o), t2 %= o, this.$d.months = $(t2 / u), t2 %= u, this.$d.days = $(t2 / r), t2 %= r, this.$d.hours = $(t2 / e), t2 %= e, this.$d.minutes = $(t2 / i), t2 %= i, this.$d.seconds = $(t2 / n), t2 %= n, this.$d.milliseconds = t2;
      }, y2.toISOString = function() {
        var t2 = v(this.$d.years, "Y"), s2 = v(this.$d.months, "M"), n2 = +this.$d.days || 0;
        this.$d.weeks && (n2 += 7 * this.$d.weeks);
        var i2 = v(n2, "D"), e2 = v(this.$d.hours, "H"), r2 = v(this.$d.minutes, "M"), o2 = this.$d.seconds || 0;
        this.$d.milliseconds && (o2 += this.$d.milliseconds / 1000, o2 = Math.round(1000 * o2) / 1000);
        var u2 = v(o2, "S"), d2 = t2.negative || s2.negative || i2.negative || e2.negative || r2.negative || u2.negative, a2 = e2.format || r2.format || u2.format ? "T" : "", h2 = (d2 ? "-" : "") + "P" + t2.format + s2.format + i2.format + a2 + e2.format + r2.format + u2.format;
        return h2 === "P" || h2 === "-P" ? "P0D" : h2;
      }, y2.toJSON = function() {
        return this.toISOString();
      }, y2.format = function(t2) {
        var n2 = t2 || "YYYY-MM-DDTHH:mm:ss", i2 = { Y: this.$d.years, YY: s.s(this.$d.years, 2, "0"), YYYY: s.s(this.$d.years, 4, "0"), M: this.$d.months, MM: s.s(this.$d.months, 2, "0"), D: this.$d.days, DD: s.s(this.$d.days, 2, "0"), H: this.$d.hours, HH: s.s(this.$d.hours, 2, "0"), m: this.$d.minutes, mm: s.s(this.$d.minutes, 2, "0"), s: this.$d.seconds, ss: s.s(this.$d.seconds, 2, "0"), SSS: s.s(this.$d.milliseconds, 3, "0") };
        return n2.replace(a, function(t3, s2) {
          return s2 || String(i2[t3]);
        });
      }, y2.as = function(t2) {
        return this.$ms / h[m(t2)];
      }, y2.get = function(t2) {
        var s2 = this.$ms, n2 = m(t2);
        return n2 === "milliseconds" ? s2 %= 1000 : s2 = n2 === "weeks" ? $(s2 / h[n2]) : this.$d[n2], s2 || 0;
      }, y2.add = function(t2, s2, n2) {
        var i2;
        return i2 = s2 ? t2 * h[m(s2)] : c(t2) ? t2.$ms : f(t2, this).$ms, f(this.$ms + i2 * (n2 ? -1 : 1), this);
      }, y2.subtract = function(t2, s2) {
        return this.add(t2, s2, true);
      }, y2.locale = function(t2) {
        var s2 = this.clone();
        return s2.$l = t2, s2;
      }, y2.clone = function() {
        return f(this.$ms, this);
      }, y2.humanize = function(s2) {
        return t().add(this.$ms, "ms").locale(this.$l).fromNow(!s2);
      }, y2.valueOf = function() {
        return this.asMilliseconds();
      }, y2.milliseconds = function() {
        return this.get("milliseconds");
      }, y2.asMilliseconds = function() {
        return this.as("milliseconds");
      }, y2.seconds = function() {
        return this.get("seconds");
      }, y2.asSeconds = function() {
        return this.as("seconds");
      }, y2.minutes = function() {
        return this.get("minutes");
      }, y2.asMinutes = function() {
        return this.as("minutes");
      }, y2.hours = function() {
        return this.get("hours");
      }, y2.asHours = function() {
        return this.as("hours");
      }, y2.days = function() {
        return this.get("days");
      }, y2.asDays = function() {
        return this.as("days");
      }, y2.weeks = function() {
        return this.get("weeks");
      }, y2.asWeeks = function() {
        return this.as("weeks");
      }, y2.months = function() {
        return this.get("months");
      }, y2.asMonths = function() {
        return this.as("months");
      }, y2.years = function() {
        return this.get("years");
      }, y2.asYears = function() {
        return this.as("years");
      }, l2;
    }(), p = function(t2, s2, n2) {
      return t2.add(s2.years() * n2, "y").add(s2.months() * n2, "M").add(s2.days() * n2, "d").add(s2.hours() * n2, "h").add(s2.minutes() * n2, "m").add(s2.seconds() * n2, "s").add(s2.milliseconds() * n2, "ms");
    };
    return function(n2, i2, e2) {
      t = e2, s = e2().$utils(), e2.duration = function(t2, s2) {
        var n3 = e2.locale();
        return f(t2, { $l: n3 }, s2);
      }, e2.isDuration = c;
      var r2 = i2.prototype.add, o2 = i2.prototype.subtract;
      i2.prototype.add = function(t2, s2) {
        return c(t2) ? p(this, t2, 1) : r2.bind(this)(t2, s2);
      }, i2.prototype.subtract = function(t2, s2) {
        return c(t2) ? p(this, t2, -1) : o2.bind(this)(t2, s2);
      };
    };
  });
});

// node_modules/mermaid/dist/chunks/mermaid.core/ganttDiagram-6RSMTGT7.mjs
var import_sanitize_url = __toESM(require_dist(), 1);
var import_dayjs = __toESM(require_dayjs_min(), 1);
var import_isoWeek = __toESM(require_isoWeek(), 1);
var import_customParseFormat = __toESM(require_customParseFormat(), 1);
var import_advancedFormat = __toESM(require_advancedFormat(), 1);
var import_dayjs2 = __toESM(require_dayjs_min(), 1);
var import_duration = __toESM(require_duration(), 1);
var parser = function() {
  var o = /* @__PURE__ */ __name(function(k, v, o2, l) {
    for (o2 = o2 || {}, l = k.length;l--; o2[k[l]] = v)
      ;
    return o2;
  }, "o"), $V0 = [6, 8, 10, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 33, 35, 36, 38, 40], $V1 = [1, 26], $V2 = [1, 27], $V3 = [1, 28], $V4 = [1, 29], $V5 = [1, 30], $V6 = [1, 31], $V7 = [1, 32], $V8 = [1, 33], $V9 = [1, 34], $Va = [1, 9], $Vb = [1, 10], $Vc = [1, 11], $Vd = [1, 12], $Ve = [1, 13], $Vf = [1, 14], $Vg = [1, 15], $Vh = [1, 16], $Vi = [1, 19], $Vj = [1, 20], $Vk = [1, 21], $Vl = [1, 22], $Vm = [1, 23], $Vn = [1, 25], $Vo = [1, 35];
  var parser2 = {
    trace: /* @__PURE__ */ __name(function trace() {}, "trace"),
    yy: {},
    symbols_: { error: 2, start: 3, gantt: 4, document: 5, EOF: 6, line: 7, SPACE: 8, statement: 9, NL: 10, weekday: 11, weekday_monday: 12, weekday_tuesday: 13, weekday_wednesday: 14, weekday_thursday: 15, weekday_friday: 16, weekday_saturday: 17, weekday_sunday: 18, weekend: 19, weekend_friday: 20, weekend_saturday: 21, dateFormat: 22, inclusiveEndDates: 23, topAxis: 24, axisFormat: 25, tickInterval: 26, excludes: 27, includes: 28, todayMarker: 29, title: 30, acc_title: 31, acc_title_value: 32, acc_descr: 33, acc_descr_value: 34, acc_descr_multiline_value: 35, section: 36, clickStatement: 37, taskTxt: 38, taskData: 39, click: 40, callbackname: 41, callbackargs: 42, href: 43, clickStatementDebug: 44, $accept: 0, $end: 1 },
    terminals_: { 2: "error", 4: "gantt", 6: "EOF", 8: "SPACE", 10: "NL", 12: "weekday_monday", 13: "weekday_tuesday", 14: "weekday_wednesday", 15: "weekday_thursday", 16: "weekday_friday", 17: "weekday_saturday", 18: "weekday_sunday", 20: "weekend_friday", 21: "weekend_saturday", 22: "dateFormat", 23: "inclusiveEndDates", 24: "topAxis", 25: "axisFormat", 26: "tickInterval", 27: "excludes", 28: "includes", 29: "todayMarker", 30: "title", 31: "acc_title", 32: "acc_title_value", 33: "acc_descr", 34: "acc_descr_value", 35: "acc_descr_multiline_value", 36: "section", 38: "taskTxt", 39: "taskData", 40: "click", 41: "callbackname", 42: "callbackargs", 43: "href" },
    productions_: [0, [3, 3], [5, 0], [5, 2], [7, 2], [7, 1], [7, 1], [7, 1], [11, 1], [11, 1], [11, 1], [11, 1], [11, 1], [11, 1], [11, 1], [19, 1], [19, 1], [9, 1], [9, 1], [9, 1], [9, 1], [9, 1], [9, 1], [9, 1], [9, 1], [9, 1], [9, 1], [9, 1], [9, 2], [9, 2], [9, 1], [9, 1], [9, 1], [9, 2], [37, 2], [37, 3], [37, 3], [37, 4], [37, 3], [37, 4], [37, 2], [44, 2], [44, 3], [44, 3], [44, 4], [44, 3], [44, 4], [44, 2]],
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
          yy.setWeekday("monday");
          break;
        case 9:
          yy.setWeekday("tuesday");
          break;
        case 10:
          yy.setWeekday("wednesday");
          break;
        case 11:
          yy.setWeekday("thursday");
          break;
        case 12:
          yy.setWeekday("friday");
          break;
        case 13:
          yy.setWeekday("saturday");
          break;
        case 14:
          yy.setWeekday("sunday");
          break;
        case 15:
          yy.setWeekend("friday");
          break;
        case 16:
          yy.setWeekend("saturday");
          break;
        case 17:
          yy.setDateFormat($$[$0].substr(11));
          this.$ = $$[$0].substr(11);
          break;
        case 18:
          yy.enableInclusiveEndDates();
          this.$ = $$[$0].substr(18);
          break;
        case 19:
          yy.TopAxis();
          this.$ = $$[$0].substr(8);
          break;
        case 20:
          yy.setAxisFormat($$[$0].substr(11));
          this.$ = $$[$0].substr(11);
          break;
        case 21:
          yy.setTickInterval($$[$0].substr(13));
          this.$ = $$[$0].substr(13);
          break;
        case 22:
          yy.setExcludes($$[$0].substr(9));
          this.$ = $$[$0].substr(9);
          break;
        case 23:
          yy.setIncludes($$[$0].substr(9));
          this.$ = $$[$0].substr(9);
          break;
        case 24:
          yy.setTodayMarker($$[$0].substr(12));
          this.$ = $$[$0].substr(12);
          break;
        case 27:
          yy.setDiagramTitle($$[$0].substr(6));
          this.$ = $$[$0].substr(6);
          break;
        case 28:
          this.$ = $$[$0].trim();
          yy.setAccTitle(this.$);
          break;
        case 29:
        case 30:
          this.$ = $$[$0].trim();
          yy.setAccDescription(this.$);
          break;
        case 31:
          yy.addSection($$[$0].substr(8));
          this.$ = $$[$0].substr(8);
          break;
        case 33:
          yy.addTask($$[$0 - 1], $$[$0]);
          this.$ = "task";
          break;
        case 34:
          this.$ = $$[$0 - 1];
          yy.setClickEvent($$[$0 - 1], $$[$0], null);
          break;
        case 35:
          this.$ = $$[$0 - 2];
          yy.setClickEvent($$[$0 - 2], $$[$0 - 1], $$[$0]);
          break;
        case 36:
          this.$ = $$[$0 - 2];
          yy.setClickEvent($$[$0 - 2], $$[$0 - 1], null);
          yy.setLink($$[$0 - 2], $$[$0]);
          break;
        case 37:
          this.$ = $$[$0 - 3];
          yy.setClickEvent($$[$0 - 3], $$[$0 - 2], $$[$0 - 1]);
          yy.setLink($$[$0 - 3], $$[$0]);
          break;
        case 38:
          this.$ = $$[$0 - 2];
          yy.setClickEvent($$[$0 - 2], $$[$0], null);
          yy.setLink($$[$0 - 2], $$[$0 - 1]);
          break;
        case 39:
          this.$ = $$[$0 - 3];
          yy.setClickEvent($$[$0 - 3], $$[$0 - 1], $$[$0]);
          yy.setLink($$[$0 - 3], $$[$0 - 2]);
          break;
        case 40:
          this.$ = $$[$0 - 1];
          yy.setLink($$[$0 - 1], $$[$0]);
          break;
        case 41:
        case 47:
          this.$ = $$[$0 - 1] + " " + $$[$0];
          break;
        case 42:
        case 43:
        case 45:
          this.$ = $$[$0 - 2] + " " + $$[$0 - 1] + " " + $$[$0];
          break;
        case 44:
        case 46:
          this.$ = $$[$0 - 3] + " " + $$[$0 - 2] + " " + $$[$0 - 1] + " " + $$[$0];
          break;
      }
    }, "anonymous"),
    table: [{ 3: 1, 4: [1, 2] }, { 1: [3] }, o($V0, [2, 2], { 5: 3 }), { 6: [1, 4], 7: 5, 8: [1, 6], 9: 7, 10: [1, 8], 11: 17, 12: $V1, 13: $V2, 14: $V3, 15: $V4, 16: $V5, 17: $V6, 18: $V7, 19: 18, 20: $V8, 21: $V9, 22: $Va, 23: $Vb, 24: $Vc, 25: $Vd, 26: $Ve, 27: $Vf, 28: $Vg, 29: $Vh, 30: $Vi, 31: $Vj, 33: $Vk, 35: $Vl, 36: $Vm, 37: 24, 38: $Vn, 40: $Vo }, o($V0, [2, 7], { 1: [2, 1] }), o($V0, [2, 3]), { 9: 36, 11: 17, 12: $V1, 13: $V2, 14: $V3, 15: $V4, 16: $V5, 17: $V6, 18: $V7, 19: 18, 20: $V8, 21: $V9, 22: $Va, 23: $Vb, 24: $Vc, 25: $Vd, 26: $Ve, 27: $Vf, 28: $Vg, 29: $Vh, 30: $Vi, 31: $Vj, 33: $Vk, 35: $Vl, 36: $Vm, 37: 24, 38: $Vn, 40: $Vo }, o($V0, [2, 5]), o($V0, [2, 6]), o($V0, [2, 17]), o($V0, [2, 18]), o($V0, [2, 19]), o($V0, [2, 20]), o($V0, [2, 21]), o($V0, [2, 22]), o($V0, [2, 23]), o($V0, [2, 24]), o($V0, [2, 25]), o($V0, [2, 26]), o($V0, [2, 27]), { 32: [1, 37] }, { 34: [1, 38] }, o($V0, [2, 30]), o($V0, [2, 31]), o($V0, [2, 32]), { 39: [1, 39] }, o($V0, [2, 8]), o($V0, [2, 9]), o($V0, [2, 10]), o($V0, [2, 11]), o($V0, [2, 12]), o($V0, [2, 13]), o($V0, [2, 14]), o($V0, [2, 15]), o($V0, [2, 16]), { 41: [1, 40], 43: [1, 41] }, o($V0, [2, 4]), o($V0, [2, 28]), o($V0, [2, 29]), o($V0, [2, 33]), o($V0, [2, 34], { 42: [1, 42], 43: [1, 43] }), o($V0, [2, 40], { 41: [1, 44] }), o($V0, [2, 35], { 43: [1, 45] }), o($V0, [2, 36]), o($V0, [2, 38], { 42: [1, 46] }), o($V0, [2, 37]), o($V0, [2, 39])],
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
      var self2 = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
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
          token = self2.symbols_[token] || token;
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
            this.begin("open_directive");
            return "open_directive";
            break;
          case 1:
            this.begin("acc_title");
            return 31;
            break;
          case 2:
            this.popState();
            return "acc_title_value";
            break;
          case 3:
            this.begin("acc_descr");
            return 33;
            break;
          case 4:
            this.popState();
            return "acc_descr_value";
            break;
          case 5:
            this.begin("acc_descr_multiline");
            break;
          case 6:
            this.popState();
            break;
          case 7:
            return "acc_descr_multiline_value";
            break;
          case 8:
            break;
          case 9:
            break;
          case 10:
            break;
          case 11:
            return 10;
            break;
          case 12:
            break;
          case 13:
            break;
          case 14:
            this.begin("href");
            break;
          case 15:
            this.popState();
            break;
          case 16:
            return 43;
            break;
          case 17:
            this.begin("callbackname");
            break;
          case 18:
            this.popState();
            break;
          case 19:
            this.popState();
            this.begin("callbackargs");
            break;
          case 20:
            return 41;
            break;
          case 21:
            this.popState();
            break;
          case 22:
            return 42;
            break;
          case 23:
            this.begin("click");
            break;
          case 24:
            this.popState();
            break;
          case 25:
            return 40;
            break;
          case 26:
            return 4;
            break;
          case 27:
            return 22;
            break;
          case 28:
            return 23;
            break;
          case 29:
            return 24;
            break;
          case 30:
            return 25;
            break;
          case 31:
            return 26;
            break;
          case 32:
            return 28;
            break;
          case 33:
            return 27;
            break;
          case 34:
            return 29;
            break;
          case 35:
            return 12;
            break;
          case 36:
            return 13;
            break;
          case 37:
            return 14;
            break;
          case 38:
            return 15;
            break;
          case 39:
            return 16;
            break;
          case 40:
            return 17;
            break;
          case 41:
            return 18;
            break;
          case 42:
            return 20;
            break;
          case 43:
            return 21;
            break;
          case 44:
            return "date";
            break;
          case 45:
            return 30;
            break;
          case 46:
            return "accDescription";
            break;
          case 47:
            return 36;
            break;
          case 48:
            return 38;
            break;
          case 49:
            return 39;
            break;
          case 50:
            return ":";
            break;
          case 51:
            return 6;
            break;
          case 52:
            return "INVALID";
            break;
        }
      }, "anonymous"),
      rules: [/^(?:%%\{)/i, /^(?:accTitle\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*\{\s*)/i, /^(?:[\}])/i, /^(?:[^\}]*)/i, /^(?:%%(?!\{)*[^\n]*)/i, /^(?:[^\}]%%*[^\n]*)/i, /^(?:%%*[^\n]*[\n]*)/i, /^(?:[\n]+)/i, /^(?:\s+)/i, /^(?:%[^\n]*)/i, /^(?:href[\s]+["])/i, /^(?:["])/i, /^(?:[^"]*)/i, /^(?:call[\s]+)/i, /^(?:\([\s]*\))/i, /^(?:\()/i, /^(?:[^(]*)/i, /^(?:\))/i, /^(?:[^)]*)/i, /^(?:click[\s]+)/i, /^(?:[\s\n])/i, /^(?:[^\s\n]*)/i, /^(?:gantt\b)/i, /^(?:dateFormat\s[^#\n;]+)/i, /^(?:inclusiveEndDates\b)/i, /^(?:topAxis\b)/i, /^(?:axisFormat\s[^#\n;]+)/i, /^(?:tickInterval\s[^#\n;]+)/i, /^(?:includes\s[^#\n;]+)/i, /^(?:excludes\s[^#\n;]+)/i, /^(?:todayMarker\s[^\n;]+)/i, /^(?:weekday\s+monday\b)/i, /^(?:weekday\s+tuesday\b)/i, /^(?:weekday\s+wednesday\b)/i, /^(?:weekday\s+thursday\b)/i, /^(?:weekday\s+friday\b)/i, /^(?:weekday\s+saturday\b)/i, /^(?:weekday\s+sunday\b)/i, /^(?:weekend\s+friday\b)/i, /^(?:weekend\s+saturday\b)/i, /^(?:\d\d\d\d-\d\d-\d\d\b)/i, /^(?:title\s[^\n]+)/i, /^(?:accDescription\s[^#\n;]+)/i, /^(?:section\s[^\n]+)/i, /^(?:[^:\n]+)/i, /^(?::[^#\n;]+)/i, /^(?::)/i, /^(?:$)/i, /^(?:.)/i],
      conditions: { acc_descr_multiline: { rules: [6, 7], inclusive: false }, acc_descr: { rules: [4], inclusive: false }, acc_title: { rules: [2], inclusive: false }, callbackargs: { rules: [21, 22], inclusive: false }, callbackname: { rules: [18, 19, 20], inclusive: false }, href: { rules: [15, 16], inclusive: false }, click: { rules: [24, 25], inclusive: false }, INITIAL: { rules: [0, 1, 3, 5, 8, 9, 10, 11, 12, 13, 14, 17, 23, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52], inclusive: true } }
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
var gantt_default = parser;
import_dayjs.default.extend(import_isoWeek.default);
import_dayjs.default.extend(import_customParseFormat.default);
import_dayjs.default.extend(import_advancedFormat.default);
var WEEKEND_START_DAY = { friday: 5, saturday: 6 };
var dateFormat = "";
var axisFormat = "";
var tickInterval = undefined;
var todayMarker = "";
var includes = [];
var excludes = [];
var links = /* @__PURE__ */ new Map;
var sections = [];
var tasks = [];
var currentSection = "";
var displayMode = "";
var tags = ["active", "done", "crit", "milestone", "vert"];
var funs = [];
var diagramId = "";
var inclusiveEndDates = false;
var topAxis = false;
var weekday = "sunday";
var weekend = "saturday";
var lastOrder = 0;
var clear2 = /* @__PURE__ */ __name(function() {
  sections = [];
  tasks = [];
  currentSection = "";
  funs = [];
  taskCnt = 0;
  lastTask = undefined;
  lastTaskID = undefined;
  rawTasks = [];
  dateFormat = "";
  axisFormat = "";
  displayMode = "";
  tickInterval = undefined;
  todayMarker = "";
  includes = [];
  excludes = [];
  inclusiveEndDates = false;
  topAxis = false;
  lastOrder = 0;
  links = /* @__PURE__ */ new Map;
  diagramId = "";
  clear();
  weekday = "sunday";
  weekend = "saturday";
}, "clear");
var setDiagramId = /* @__PURE__ */ __name(function(id) {
  diagramId = id;
}, "setDiagramId");
var setAxisFormat = /* @__PURE__ */ __name(function(txt) {
  axisFormat = txt;
}, "setAxisFormat");
var getAxisFormat = /* @__PURE__ */ __name(function() {
  return axisFormat;
}, "getAxisFormat");
var setTickInterval = /* @__PURE__ */ __name(function(txt) {
  tickInterval = txt;
}, "setTickInterval");
var getTickInterval = /* @__PURE__ */ __name(function() {
  return tickInterval;
}, "getTickInterval");
var setTodayMarker = /* @__PURE__ */ __name(function(txt) {
  todayMarker = txt;
}, "setTodayMarker");
var getTodayMarker = /* @__PURE__ */ __name(function() {
  return todayMarker;
}, "getTodayMarker");
var setDateFormat = /* @__PURE__ */ __name(function(txt) {
  dateFormat = txt;
}, "setDateFormat");
var enableInclusiveEndDates = /* @__PURE__ */ __name(function() {
  inclusiveEndDates = true;
}, "enableInclusiveEndDates");
var endDatesAreInclusive = /* @__PURE__ */ __name(function() {
  return inclusiveEndDates;
}, "endDatesAreInclusive");
var enableTopAxis = /* @__PURE__ */ __name(function() {
  topAxis = true;
}, "enableTopAxis");
var topAxisEnabled = /* @__PURE__ */ __name(function() {
  return topAxis;
}, "topAxisEnabled");
var setDisplayMode = /* @__PURE__ */ __name(function(txt) {
  displayMode = txt;
}, "setDisplayMode");
var getDisplayMode = /* @__PURE__ */ __name(function() {
  return displayMode;
}, "getDisplayMode");
var getDateFormat = /* @__PURE__ */ __name(function() {
  return dateFormat;
}, "getDateFormat");
var setIncludes = /* @__PURE__ */ __name(function(txt) {
  includes = txt.toLowerCase().split(/[\s,]+/);
}, "setIncludes");
var getIncludes = /* @__PURE__ */ __name(function() {
  return includes;
}, "getIncludes");
var setExcludes = /* @__PURE__ */ __name(function(txt) {
  excludes = txt.toLowerCase().split(/[\s,]+/);
}, "setExcludes");
var getExcludes = /* @__PURE__ */ __name(function() {
  return excludes;
}, "getExcludes");
var getLinks = /* @__PURE__ */ __name(function() {
  return links;
}, "getLinks");
var addSection = /* @__PURE__ */ __name(function(txt) {
  currentSection = txt;
  sections.push(txt);
}, "addSection");
var getSections = /* @__PURE__ */ __name(function() {
  return sections;
}, "getSections");
var getTasks = /* @__PURE__ */ __name(function() {
  let allItemsProcessed = compileTasks();
  const maxDepth = 10;
  let iterationCount = 0;
  while (!allItemsProcessed && iterationCount < maxDepth) {
    allItemsProcessed = compileTasks();
    iterationCount++;
  }
  tasks = rawTasks;
  return tasks;
}, "getTasks");
var isInvalidDate = /* @__PURE__ */ __name(function(date, dateFormat2, excludes2, includes2) {
  const formattedDate = date.format(dateFormat2.trim());
  const dateOnly = date.format("YYYY-MM-DD");
  if (includes2.includes(formattedDate) || includes2.includes(dateOnly)) {
    return false;
  }
  if (excludes2.includes("weekends") && (date.isoWeekday() === WEEKEND_START_DAY[weekend] || date.isoWeekday() === WEEKEND_START_DAY[weekend] + 1)) {
    return true;
  }
  if (excludes2.includes(date.format("dddd").toLowerCase())) {
    return true;
  }
  return excludes2.includes(formattedDate) || excludes2.includes(dateOnly);
}, "isInvalidDate");
var setWeekday = /* @__PURE__ */ __name(function(txt) {
  weekday = txt;
}, "setWeekday");
var getWeekday = /* @__PURE__ */ __name(function() {
  return weekday;
}, "getWeekday");
var setWeekend = /* @__PURE__ */ __name(function(startDay) {
  weekend = startDay;
}, "setWeekend");
var checkTaskDates = /* @__PURE__ */ __name(function(task, dateFormat2, excludes2, includes2) {
  if (!excludes2.length || task.manualEndTime) {
    return;
  }
  let startTime;
  if (task.startTime instanceof Date) {
    startTime = import_dayjs.default(task.startTime);
  } else {
    startTime = import_dayjs.default(task.startTime, dateFormat2, true);
  }
  startTime = startTime.add(1, "d");
  let originalEndTime;
  if (task.endTime instanceof Date) {
    originalEndTime = import_dayjs.default(task.endTime);
  } else {
    originalEndTime = import_dayjs.default(task.endTime, dateFormat2, true);
  }
  const [fixedEndTime, renderEndTime] = fixTaskDates(startTime, originalEndTime, dateFormat2, excludes2, includes2);
  task.endTime = fixedEndTime.toDate();
  task.renderEndTime = renderEndTime;
}, "checkTaskDates");
var fixTaskDates = /* @__PURE__ */ __name(function(startTime, endTime, dateFormat2, excludes2, includes2) {
  let invalid = false;
  let renderEndTime = null;
  const maxEndTime = endTime.add(1e4, "d");
  while (startTime <= endTime) {
    if (!invalid) {
      renderEndTime = endTime.toDate();
    }
    invalid = isInvalidDate(startTime, dateFormat2, excludes2, includes2);
    if (invalid) {
      endTime = endTime.add(1, "d");
      if (endTime > maxEndTime) {
        throw new Error("Failed to find a valid date that was not excluded by `excludes` after 10,000 iterations.");
      }
    }
    startTime = startTime.add(1, "d");
  }
  return [endTime, renderEndTime];
}, "fixTaskDates");
var getStartDate = /* @__PURE__ */ __name(function(prevTime, dateFormat2, str) {
  str = str.trim();
  const isTimestampFormat = /* @__PURE__ */ __name((format) => {
    const trimmedFormat = format.trim();
    return trimmedFormat === "x" || trimmedFormat === "X";
  }, "isTimestampFormat");
  if (isTimestampFormat(dateFormat2) && /^\d+$/.test(str)) {
    return new Date(Number(str));
  }
  const afterRePattern = /^after\s+(?<ids>[\d\w- ]+)/;
  const afterStatement = afterRePattern.exec(str);
  if (afterStatement !== null) {
    let latestTask = null;
    for (const id of afterStatement.groups.ids.split(" ")) {
      let task = findTaskById(id);
      if (task !== undefined && (!latestTask || task.endTime > latestTask.endTime)) {
        latestTask = task;
      }
    }
    if (latestTask) {
      return latestTask.endTime;
    }
    const today = /* @__PURE__ */ new Date;
    today.setHours(0, 0, 0, 0);
    return today;
  }
  let mDate = import_dayjs.default(str, dateFormat2.trim(), true);
  if (mDate.isValid()) {
    return mDate.toDate();
  } else {
    log.debug("Invalid date:" + str);
    log.debug("With date format:" + dateFormat2.trim());
    const d = new Date(str);
    if (d === undefined || isNaN(d.getTime()) || d.getFullYear() < -1e4 || d.getFullYear() > 1e4) {
      throw new Error("Invalid date:" + str);
    }
    return d;
  }
}, "getStartDate");
var parseDuration = /* @__PURE__ */ __name(function(str) {
  const statement = /^(\d+(?:\.\d+)?)([Mdhmswy]|ms)$/.exec(str.trim());
  if (statement !== null) {
    return [Number.parseFloat(statement[1]), statement[2]];
  }
  return [NaN, "ms"];
}, "parseDuration");
var getEndDate = /* @__PURE__ */ __name(function(prevTime, dateFormat2, str, inclusive = false) {
  str = str.trim();
  const untilRePattern = /^until\s+(?<ids>[\d\w- ]+)/;
  const untilStatement = untilRePattern.exec(str);
  if (untilStatement !== null) {
    let earliestTask = null;
    for (const id of untilStatement.groups.ids.split(" ")) {
      let task = findTaskById(id);
      if (task !== undefined && (!earliestTask || task.startTime < earliestTask.startTime)) {
        earliestTask = task;
      }
    }
    if (earliestTask) {
      return earliestTask.startTime;
    }
    const today = /* @__PURE__ */ new Date;
    today.setHours(0, 0, 0, 0);
    return today;
  }
  let parsedDate = import_dayjs.default(str, dateFormat2.trim(), true);
  if (parsedDate.isValid()) {
    if (inclusive) {
      parsedDate = parsedDate.add(1, "d");
    }
    return parsedDate.toDate();
  }
  let endTime = import_dayjs.default(prevTime);
  const [durationValue, durationUnit] = parseDuration(str);
  if (!Number.isNaN(durationValue)) {
    const newEndTime = endTime.add(durationValue, durationUnit);
    if (newEndTime.isValid()) {
      endTime = newEndTime;
    }
  }
  return endTime.toDate();
}, "getEndDate");
var taskCnt = 0;
var parseId = /* @__PURE__ */ __name(function(idStr) {
  if (idStr === undefined) {
    taskCnt = taskCnt + 1;
    return "task" + taskCnt;
  }
  return idStr;
}, "parseId");
var compileData = /* @__PURE__ */ __name(function(prevTask, dataStr) {
  let ds;
  if (dataStr.substr(0, 1) === ":") {
    ds = dataStr.substr(1, dataStr.length);
  } else {
    ds = dataStr;
  }
  const data = ds.split(",");
  const task = {};
  getTaskTags(data, task, tags);
  for (let i = 0;i < data.length; i++) {
    data[i] = data[i].trim();
  }
  let endTimeData = "";
  switch (data.length) {
    case 1:
      task.id = parseId();
      task.startTime = prevTask.endTime;
      endTimeData = data[0];
      break;
    case 2:
      task.id = parseId();
      task.startTime = getStartDate(undefined, dateFormat, data[0]);
      endTimeData = data[1];
      break;
    case 3:
      task.id = parseId(data[0]);
      task.startTime = getStartDate(undefined, dateFormat, data[1]);
      endTimeData = data[2];
      break;
    default:
  }
  if (endTimeData) {
    task.endTime = getEndDate(task.startTime, dateFormat, endTimeData, inclusiveEndDates);
    task.manualEndTime = import_dayjs.default(endTimeData, "YYYY-MM-DD", true).isValid();
    checkTaskDates(task, dateFormat, excludes, includes);
  }
  return task;
}, "compileData");
var parseData = /* @__PURE__ */ __name(function(prevTaskId, dataStr) {
  let ds;
  if (dataStr.substr(0, 1) === ":") {
    ds = dataStr.substr(1, dataStr.length);
  } else {
    ds = dataStr;
  }
  const data = ds.split(",");
  const task = {};
  getTaskTags(data, task, tags);
  for (let i = 0;i < data.length; i++) {
    data[i] = data[i].trim();
  }
  switch (data.length) {
    case 1:
      task.id = parseId();
      task.startTime = {
        type: "prevTaskEnd",
        id: prevTaskId
      };
      task.endTime = {
        data: data[0]
      };
      break;
    case 2:
      task.id = parseId();
      task.startTime = {
        type: "getStartDate",
        startData: data[0]
      };
      task.endTime = {
        data: data[1]
      };
      break;
    case 3:
      task.id = parseId(data[0]);
      task.startTime = {
        type: "getStartDate",
        startData: data[1]
      };
      task.endTime = {
        data: data[2]
      };
      break;
    default:
  }
  return task;
}, "parseData");
var lastTask;
var lastTaskID;
var rawTasks = [];
var taskDb = {};
var addTask = /* @__PURE__ */ __name(function(descr, data) {
  const rawTask = {
    section: currentSection,
    type: currentSection,
    processed: false,
    manualEndTime: false,
    renderEndTime: null,
    raw: { data },
    task: descr,
    classes: []
  };
  const taskInfo = parseData(lastTaskID, data);
  rawTask.raw.startTime = taskInfo.startTime;
  rawTask.raw.endTime = taskInfo.endTime;
  rawTask.id = taskInfo.id;
  rawTask.prevTaskId = lastTaskID;
  rawTask.active = taskInfo.active;
  rawTask.done = taskInfo.done;
  rawTask.crit = taskInfo.crit;
  rawTask.milestone = taskInfo.milestone;
  rawTask.vert = taskInfo.vert;
  rawTask.order = lastOrder;
  lastOrder++;
  const pos = rawTasks.push(rawTask);
  lastTaskID = rawTask.id;
  taskDb[rawTask.id] = pos - 1;
}, "addTask");
var findTaskById = /* @__PURE__ */ __name(function(id) {
  const pos = taskDb[id];
  return rawTasks[pos];
}, "findTaskById");
var addTaskOrg = /* @__PURE__ */ __name(function(descr, data) {
  const newTask = {
    section: currentSection,
    type: currentSection,
    description: descr,
    task: descr,
    classes: []
  };
  const taskInfo = compileData(lastTask, data);
  newTask.startTime = taskInfo.startTime;
  newTask.endTime = taskInfo.endTime;
  newTask.id = taskInfo.id;
  newTask.active = taskInfo.active;
  newTask.done = taskInfo.done;
  newTask.crit = taskInfo.crit;
  newTask.milestone = taskInfo.milestone;
  newTask.vert = taskInfo.vert;
  lastTask = newTask;
  tasks.push(newTask);
}, "addTaskOrg");
var compileTasks = /* @__PURE__ */ __name(function() {
  const compileTask = /* @__PURE__ */ __name(function(pos) {
    const task = rawTasks[pos];
    let startTime = "";
    switch (rawTasks[pos].raw.startTime.type) {
      case "prevTaskEnd": {
        const prevTask = findTaskById(task.prevTaskId);
        task.startTime = prevTask.endTime;
        break;
      }
      case "getStartDate":
        startTime = getStartDate(undefined, dateFormat, rawTasks[pos].raw.startTime.startData);
        if (startTime) {
          rawTasks[pos].startTime = startTime;
        }
        break;
    }
    if (rawTasks[pos].startTime) {
      rawTasks[pos].endTime = getEndDate(rawTasks[pos].startTime, dateFormat, rawTasks[pos].raw.endTime.data, inclusiveEndDates);
      if (rawTasks[pos].endTime) {
        rawTasks[pos].processed = true;
        rawTasks[pos].manualEndTime = import_dayjs.default(rawTasks[pos].raw.endTime.data, "YYYY-MM-DD", true).isValid();
        checkTaskDates(rawTasks[pos], dateFormat, excludes, includes);
      }
    }
    return rawTasks[pos].processed;
  }, "compileTask");
  let allProcessed = true;
  for (const [i, rawTask] of rawTasks.entries()) {
    compileTask(i);
    allProcessed = allProcessed && rawTask.processed;
  }
  return allProcessed;
}, "compileTasks");
var setLink = /* @__PURE__ */ __name(function(ids, _linkStr) {
  let linkStr = _linkStr;
  if (getConfig2().securityLevel !== "loose") {
    linkStr = import_sanitize_url.sanitizeUrl(_linkStr);
  }
  ids.split(",").forEach(function(id) {
    let rawTask = findTaskById(id);
    if (rawTask !== undefined) {
      pushFun(id, () => {
        window.open(linkStr, "_self");
      });
      links.set(id, linkStr);
    }
  });
  setClass(ids, "clickable");
}, "setLink");
var setClass = /* @__PURE__ */ __name(function(ids, className) {
  ids.split(",").forEach(function(id) {
    let rawTask = findTaskById(id);
    if (rawTask !== undefined) {
      rawTask.classes.push(className);
    }
  });
}, "setClass");
var setClickFun = /* @__PURE__ */ __name(function(id, functionName, functionArgs) {
  if (getConfig2().securityLevel !== "loose") {
    return;
  }
  if (functionName === undefined) {
    return;
  }
  let argList = [];
  if (typeof functionArgs === "string") {
    argList = functionArgs.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    for (let i = 0;i < argList.length; i++) {
      let item = argList[i].trim();
      if (item.startsWith('"') && item.endsWith('"')) {
        item = item.substr(1, item.length - 2);
      }
      argList[i] = item;
    }
  }
  if (argList.length === 0) {
    argList.push(id);
  }
  let rawTask = findTaskById(id);
  if (rawTask !== undefined) {
    pushFun(id, () => {
      utils_default.runFunc(functionName, ...argList);
    });
  }
}, "setClickFun");
var pushFun = /* @__PURE__ */ __name(function(id, callbackFunction) {
  funs.push(function() {
    const prefixedId = diagramId ? `${diagramId}-${id}` : id;
    const elem = document.querySelector(`[id="${prefixedId}"]`);
    if (elem !== null) {
      elem.addEventListener("click", function() {
        callbackFunction();
      });
    }
  }, function() {
    const prefixedId = diagramId ? `${diagramId}-${id}` : id;
    const elem = document.querySelector(`[id="${prefixedId}-text"]`);
    if (elem !== null) {
      elem.addEventListener("click", function() {
        callbackFunction();
      });
    }
  });
}, "pushFun");
var setClickEvent = /* @__PURE__ */ __name(function(ids, functionName, functionArgs) {
  ids.split(",").forEach(function(id) {
    setClickFun(id, functionName, functionArgs);
  });
  setClass(ids, "clickable");
}, "setClickEvent");
var bindFunctions = /* @__PURE__ */ __name(function(element) {
  funs.forEach(function(fun) {
    fun(element);
  });
}, "bindFunctions");
var ganttDb_default = {
  getConfig: /* @__PURE__ */ __name(() => getConfig2().gantt, "getConfig"),
  clear: clear2,
  setDateFormat,
  getDateFormat,
  enableInclusiveEndDates,
  endDatesAreInclusive,
  enableTopAxis,
  topAxisEnabled,
  setAxisFormat,
  getAxisFormat,
  setTickInterval,
  getTickInterval,
  setTodayMarker,
  getTodayMarker,
  setAccTitle,
  getAccTitle,
  setDiagramTitle,
  getDiagramTitle,
  setDiagramId,
  setDisplayMode,
  getDisplayMode,
  setAccDescription,
  getAccDescription,
  addSection,
  getSections,
  getTasks,
  addTask,
  findTaskById,
  addTaskOrg,
  setIncludes,
  getIncludes,
  setExcludes,
  getExcludes,
  setClickEvent,
  setLink,
  getLinks,
  bindFunctions,
  parseDuration,
  isInvalidDate,
  setWeekday,
  getWeekday,
  setWeekend
};
function getTaskTags(data, task, tags2) {
  let matchFound = true;
  while (matchFound) {
    matchFound = false;
    tags2.forEach(function(t) {
      const pattern = "^\\s*" + t + "\\s*$";
      const regex = new RegExp(pattern);
      if (data[0].match(regex)) {
        task[t] = true;
        data.shift(1);
        matchFound = true;
      }
    });
  }
}
__name(getTaskTags, "getTaskTags");
import_dayjs2.default.extend(import_duration.default);
var setConf = /* @__PURE__ */ __name(function() {
  log.debug("Something is calling, setConf, remove the call");
}, "setConf");
var mapWeekdayToTimeFunction = {
  monday: timeMonday,
  tuesday: timeTuesday,
  wednesday: timeWednesday,
  thursday: timeThursday,
  friday: timeFriday,
  saturday: timeSaturday,
  sunday: timeSunday
};
var getMaxIntersections = /* @__PURE__ */ __name((tasks2, orderOffset) => {
  let timeline = [...tasks2].map(() => -Infinity);
  let sorted = [...tasks2].sort((a, b) => a.startTime - b.startTime || a.order - b.order);
  let maxIntersections = 0;
  for (const element of sorted) {
    for (let j = 0;j < timeline.length; j++) {
      if (element.startTime >= timeline[j]) {
        timeline[j] = element.endTime;
        element.order = j + orderOffset;
        if (j > maxIntersections) {
          maxIntersections = j;
        }
        break;
      }
    }
  }
  return maxIntersections;
}, "getMaxIntersections");
var w;
var MAX_TICK_COUNT = 1e4;
var draw = /* @__PURE__ */ __name(function(text, id, version, diagObj) {
  const conf = getConfig2().gantt;
  diagObj.db.setDiagramId(id);
  const securityLevel = getConfig2().securityLevel;
  let sandboxElement;
  if (securityLevel === "sandbox") {
    sandboxElement = select_default("#i" + id);
  }
  const root = securityLevel === "sandbox" ? select_default(sandboxElement.nodes()[0].contentDocument.body) : select_default("body");
  const doc = securityLevel === "sandbox" ? sandboxElement.nodes()[0].contentDocument : document;
  const elem = doc.getElementById(id);
  w = elem.parentElement.offsetWidth;
  if (w === undefined) {
    w = 1200;
  }
  if (conf.useWidth !== undefined) {
    w = conf.useWidth;
  }
  const taskArray = diagObj.db.getTasks();
  let categories = [];
  for (const element of taskArray) {
    categories.push(element.type);
  }
  categories = checkUnique(categories);
  const categoryHeights = {};
  let h = 2 * conf.topPadding;
  if (diagObj.db.getDisplayMode() === "compact" || conf.displayMode === "compact") {
    const categoryElements = {};
    for (const element of taskArray) {
      if (categoryElements[element.section] === undefined) {
        categoryElements[element.section] = [element];
      } else {
        categoryElements[element.section].push(element);
      }
    }
    let intersections = 0;
    for (const category of Object.keys(categoryElements)) {
      const categoryHeight = getMaxIntersections(categoryElements[category], intersections) + 1;
      intersections += categoryHeight;
      h += categoryHeight * (conf.barHeight + conf.barGap);
      categoryHeights[category] = categoryHeight;
    }
  } else {
    h += taskArray.length * (conf.barHeight + conf.barGap);
    for (const category of categories) {
      categoryHeights[category] = taskArray.filter((task) => task.type === category).length;
    }
  }
  elem.setAttribute("viewBox", "0 0 " + w + " " + h);
  const svg = root.select(`[id="${id}"]`);
  const timeScale = time().domain([
    min(taskArray, function(d) {
      return d.startTime;
    }),
    max(taskArray, function(d) {
      return d.endTime;
    })
  ]).rangeRound([0, w - conf.leftPadding - conf.rightPadding]);
  function taskCompare(a, b) {
    const taskA = a.startTime;
    const taskB = b.startTime;
    let result = 0;
    if (taskA > taskB) {
      result = 1;
    } else if (taskA < taskB) {
      result = -1;
    }
    return result;
  }
  __name(taskCompare, "taskCompare");
  taskArray.sort(taskCompare);
  makeGantt(taskArray, w, h);
  configureSvgSize(svg, h, w, conf.useMaxWidth);
  svg.append("text").text(diagObj.db.getDiagramTitle()).attr("x", w / 2).attr("y", conf.titleTopMargin).attr("class", "titleText");
  function makeGantt(tasks2, pageWidth, pageHeight) {
    const barHeight = conf.barHeight;
    const gap = barHeight + conf.barGap;
    const topPadding = conf.topPadding;
    const leftPadding = conf.leftPadding;
    const colorScale = linear().domain([0, categories.length]).range(["#00B9FA", "#F95002"]).interpolate(hcl_default);
    drawExcludeDays(gap, topPadding, leftPadding, pageWidth, pageHeight, tasks2, diagObj.db.getExcludes(), diagObj.db.getIncludes());
    makeGrid(leftPadding, topPadding, pageWidth, pageHeight);
    drawRects(tasks2, gap, topPadding, leftPadding, barHeight, colorScale, pageWidth, pageHeight);
    vertLabels(gap, topPadding, leftPadding, barHeight, colorScale);
    drawToday(leftPadding, topPadding, pageWidth, pageHeight);
  }
  __name(makeGantt, "makeGantt");
  function drawRects(theArray, theGap, theTopPad, theSidePad, theBarHeight, theColorScale, w2) {
    theArray.sort((a, b) => a.vert === b.vert ? 0 : a.vert ? 1 : -1);
    const uniqueTaskOrderIds = [...new Set(theArray.map((item) => item.order))];
    const uniqueTasks = uniqueTaskOrderIds.map((id2) => theArray.find((item) => item.order === id2));
    svg.append("g").selectAll("rect").data(uniqueTasks).enter().append("rect").attr("x", 0).attr("y", function(d, i) {
      i = d.order;
      return i * theGap + theTopPad - 2;
    }).attr("width", function() {
      return w2 - conf.rightPadding / 2;
    }).attr("height", theGap).attr("class", function(d) {
      for (const [i, category] of categories.entries()) {
        if (d.type === category) {
          return "section section" + i % conf.numberSectionStyles;
        }
      }
      return "section section0";
    }).enter();
    const rectangles = svg.append("g").selectAll("rect").data(theArray).enter();
    const links2 = diagObj.db.getLinks();
    rectangles.append("rect").attr("id", function(d) {
      return id + "-" + d.id;
    }).attr("rx", 3).attr("ry", 3).attr("x", function(d) {
      if (d.milestone) {
        return timeScale(d.startTime) + theSidePad + 0.5 * (timeScale(d.endTime) - timeScale(d.startTime)) - 0.5 * theBarHeight;
      }
      return timeScale(d.startTime) + theSidePad;
    }).attr("y", function(d, i) {
      i = d.order;
      if (d.vert) {
        return conf.gridLineStartPadding;
      }
      return i * theGap + theTopPad;
    }).attr("width", function(d) {
      if (d.milestone) {
        return theBarHeight;
      }
      if (d.vert) {
        return 0.08 * theBarHeight;
      }
      return timeScale(d.renderEndTime || d.endTime) - timeScale(d.startTime);
    }).attr("height", function(d) {
      if (d.vert) {
        return taskArray.length * (conf.barHeight + conf.barGap) + conf.barHeight * 2;
      }
      return theBarHeight;
    }).attr("transform-origin", function(d, i) {
      i = d.order;
      return (timeScale(d.startTime) + theSidePad + 0.5 * (timeScale(d.endTime) - timeScale(d.startTime))).toString() + "px " + (i * theGap + theTopPad + 0.5 * theBarHeight).toString() + "px";
    }).attr("class", function(d) {
      const res = "task";
      let classStr = "";
      if (d.classes.length > 0) {
        classStr = d.classes.join(" ");
      }
      let secNum = 0;
      for (const [i, category] of categories.entries()) {
        if (d.type === category) {
          secNum = i % conf.numberSectionStyles;
        }
      }
      let taskClass = "";
      if (d.active) {
        if (d.crit) {
          taskClass += " activeCrit";
        } else {
          taskClass = " active";
        }
      } else if (d.done) {
        if (d.crit) {
          taskClass = " doneCrit";
        } else {
          taskClass = " done";
        }
      } else {
        if (d.crit) {
          taskClass += " crit";
        }
      }
      if (taskClass.length === 0) {
        taskClass = " task";
      }
      if (d.milestone) {
        taskClass = " milestone " + taskClass;
      }
      if (d.vert) {
        taskClass = " vert " + taskClass;
      }
      taskClass += secNum;
      taskClass += " " + classStr;
      return res + taskClass;
    });
    rectangles.append("text").attr("id", function(d) {
      return id + "-" + d.id + "-text";
    }).text(function(d) {
      return d.task;
    }).attr("font-size", conf.fontSize).attr("x", function(d) {
      let startX = timeScale(d.startTime);
      let endX = timeScale(d.renderEndTime || d.endTime);
      if (d.milestone) {
        startX += 0.5 * (timeScale(d.endTime) - timeScale(d.startTime)) - 0.5 * theBarHeight;
        endX = startX + theBarHeight;
      }
      if (d.vert) {
        return timeScale(d.startTime) + theSidePad;
      }
      const textWidth = this.getBBox().width;
      if (textWidth > endX - startX) {
        if (endX + textWidth + 1.5 * conf.leftPadding > w2) {
          return startX + theSidePad - 5;
        } else {
          return endX + theSidePad + 5;
        }
      } else {
        return (endX - startX) / 2 + startX + theSidePad;
      }
    }).attr("y", function(d, i) {
      if (d.vert) {
        return conf.gridLineStartPadding + taskArray.length * (conf.barHeight + conf.barGap) + 60;
      }
      i = d.order;
      return i * theGap + conf.barHeight / 2 + (conf.fontSize / 2 - 2) + theTopPad;
    }).attr("text-height", theBarHeight).attr("class", function(d) {
      const startX = timeScale(d.startTime);
      let endX = timeScale(d.endTime);
      if (d.milestone) {
        endX = startX + theBarHeight;
      }
      const textWidth = this.getBBox().width;
      let classStr = "";
      if (d.classes.length > 0) {
        classStr = d.classes.join(" ");
      }
      let secNum = 0;
      for (const [i, category] of categories.entries()) {
        if (d.type === category) {
          secNum = i % conf.numberSectionStyles;
        }
      }
      let taskType = "";
      if (d.active) {
        if (d.crit) {
          taskType = "activeCritText" + secNum;
        } else {
          taskType = "activeText" + secNum;
        }
      }
      if (d.done) {
        if (d.crit) {
          taskType = taskType + " doneCritText" + secNum;
        } else {
          taskType = taskType + " doneText" + secNum;
        }
      } else {
        if (d.crit) {
          taskType = taskType + " critText" + secNum;
        }
      }
      if (d.milestone) {
        taskType += " milestoneText";
      }
      if (d.vert) {
        taskType += " vertText";
      }
      if (textWidth > endX - startX) {
        if (endX + textWidth + 1.5 * conf.leftPadding > w2) {
          return classStr + " taskTextOutsideLeft taskTextOutside" + secNum + " " + taskType;
        } else {
          return classStr + " taskTextOutsideRight taskTextOutside" + secNum + " " + taskType + " width-" + textWidth;
        }
      } else {
        return classStr + " taskText taskText" + secNum + " " + taskType + " width-" + textWidth;
      }
    });
    const securityLevel2 = getConfig2().securityLevel;
    if (securityLevel2 === "sandbox") {
      let sandboxElement2;
      sandboxElement2 = select_default("#i" + id);
      const doc2 = sandboxElement2.nodes()[0].contentDocument;
      rectangles.filter(function(d) {
        return links2.has(d.id);
      }).each(function(o) {
        var taskRect = doc2.querySelector("#" + CSS.escape(id + "-" + o.id));
        var taskText = doc2.querySelector("#" + CSS.escape(id + "-" + o.id + "-text"));
        const oldParent = taskRect.parentNode;
        var Link = doc2.createElement("a");
        Link.setAttribute("xlink:href", links2.get(o.id));
        Link.setAttribute("target", "_top");
        oldParent.appendChild(Link);
        Link.appendChild(taskRect);
        Link.appendChild(taskText);
      });
    }
  }
  __name(drawRects, "drawRects");
  function drawExcludeDays(theGap, theTopPad, theSidePad, w2, h2, tasks2, excludes2, includes2) {
    if (excludes2.length === 0 && includes2.length === 0) {
      return;
    }
    let minTime;
    let maxTime;
    for (const { startTime, endTime } of tasks2) {
      if (minTime === undefined || startTime < minTime) {
        minTime = startTime;
      }
      if (maxTime === undefined || endTime > maxTime) {
        maxTime = endTime;
      }
    }
    if (!minTime || !maxTime) {
      return;
    }
    if (import_dayjs2.default(maxTime).diff(import_dayjs2.default(minTime), "year") > 5) {
      log.warn("The difference between the min and max time is more than 5 years. This will cause performance issues. Skipping drawing exclude days.");
      return;
    }
    const dateFormat2 = diagObj.db.getDateFormat();
    const excludeRanges = [];
    let range = null;
    let d = import_dayjs2.default(minTime);
    while (d.valueOf() <= maxTime) {
      if (diagObj.db.isInvalidDate(d, dateFormat2, excludes2, includes2)) {
        if (!range) {
          range = {
            start: d,
            end: d
          };
        } else {
          range.end = d;
        }
      } else {
        if (range) {
          excludeRanges.push(range);
          range = null;
        }
      }
      d = d.add(1, "d");
    }
    const rectangles = svg.append("g").selectAll("rect").data(excludeRanges).enter();
    rectangles.append("rect").attr("id", (d2) => id + "-exclude-" + d2.start.format("YYYY-MM-DD")).attr("x", (d2) => timeScale(d2.start.startOf("day")) + theSidePad).attr("y", conf.gridLineStartPadding).attr("width", (d2) => timeScale(d2.end.endOf("day")) - timeScale(d2.start.startOf("day"))).attr("height", h2 - theTopPad - conf.gridLineStartPadding).attr("transform-origin", function(d2, i) {
      return (timeScale(d2.start) + theSidePad + 0.5 * (timeScale(d2.end) - timeScale(d2.start))).toString() + "px " + (i * theGap + 0.5 * h2).toString() + "px";
    }).attr("class", "exclude-range");
  }
  __name(drawExcludeDays, "drawExcludeDays");
  function getEstimatedTickCount(minTime, maxTime, every, interval) {
    if (every <= 0 || minTime > maxTime) {
      return Infinity;
    }
    const timeDiffMs = maxTime - minTime;
    const intervalMs = import_dayjs2.default.duration({ [interval ?? "day"]: every }).asMilliseconds();
    if (intervalMs <= 0) {
      return Infinity;
    }
    return Math.ceil(timeDiffMs / intervalMs);
  }
  __name(getEstimatedTickCount, "getEstimatedTickCount");
  function makeGrid(theSidePad, theTopPad, w2, h2) {
    const dateFormat2 = diagObj.db.getDateFormat();
    const userAxisFormat = diagObj.db.getAxisFormat();
    let axisFormat2;
    if (userAxisFormat) {
      axisFormat2 = userAxisFormat;
    } else if (dateFormat2 === "D") {
      axisFormat2 = "%d";
    } else {
      axisFormat2 = conf.axisFormat ?? "%Y-%m-%d";
    }
    let bottomXAxis = axisBottom(timeScale).tickSize(-h2 + theTopPad + conf.gridLineStartPadding).tickFormat(timeFormat(axisFormat2));
    const reTickInterval = /^([1-9]\d*)(millisecond|second|minute|hour|day|week|month)$/;
    const resultTickInterval = reTickInterval.exec(diagObj.db.getTickInterval() || conf.tickInterval);
    if (resultTickInterval !== null) {
      const every = parseInt(resultTickInterval[1], 10);
      if (isNaN(every) || every <= 0) {
        log.warn(`Invalid tick interval value: "${resultTickInterval[1]}". Skipping custom tick interval.`);
      } else {
        const interval = resultTickInterval[2];
        const weekday2 = diagObj.db.getWeekday() || conf.weekday;
        const domain = timeScale.domain();
        const minTime = domain[0];
        const maxTime = domain[1];
        const estimatedTicks = getEstimatedTickCount(minTime, maxTime, every, interval);
        if (estimatedTicks > MAX_TICK_COUNT) {
          log.warn(`The tick interval "${every}${interval}" would generate ${estimatedTicks} ticks, which exceeds the maximum allowed (${MAX_TICK_COUNT}). This may indicate an invalid date or time range. Skipping custom tick interval.`);
        } else {
          switch (interval) {
            case "millisecond":
              bottomXAxis.ticks(millisecond.every(every));
              break;
            case "second":
              bottomXAxis.ticks(second.every(every));
              break;
            case "minute":
              bottomXAxis.ticks(timeMinute.every(every));
              break;
            case "hour":
              bottomXAxis.ticks(timeHour.every(every));
              break;
            case "day":
              bottomXAxis.ticks(timeDay.every(every));
              break;
            case "week":
              bottomXAxis.ticks(mapWeekdayToTimeFunction[weekday2].every(every));
              break;
            case "month":
              bottomXAxis.ticks(timeMonth.every(every));
              break;
          }
        }
      }
    }
    svg.append("g").attr("class", "grid").attr("transform", "translate(" + theSidePad + ", " + (h2 - 50) + ")").call(bottomXAxis).selectAll("text").style("text-anchor", "middle").attr("fill", "#000").attr("stroke", "none").attr("font-size", 10).attr("dy", "1em");
    if (diagObj.db.topAxisEnabled() || conf.topAxis) {
      let topXAxis = axisTop(timeScale).tickSize(-h2 + theTopPad + conf.gridLineStartPadding).tickFormat(timeFormat(axisFormat2));
      if (resultTickInterval !== null) {
        const every = parseInt(resultTickInterval[1], 10);
        if (isNaN(every) || every <= 0) {
          log.warn(`Invalid tick interval value: "${resultTickInterval[1]}". Skipping custom tick interval.`);
        } else {
          const interval = resultTickInterval[2];
          const weekday2 = diagObj.db.getWeekday() || conf.weekday;
          const domain = timeScale.domain();
          const minTime = domain[0];
          const maxTime = domain[1];
          const estimatedTicks = getEstimatedTickCount(minTime, maxTime, every, interval);
          if (estimatedTicks <= MAX_TICK_COUNT) {
            switch (interval) {
              case "millisecond":
                topXAxis.ticks(millisecond.every(every));
                break;
              case "second":
                topXAxis.ticks(second.every(every));
                break;
              case "minute":
                topXAxis.ticks(timeMinute.every(every));
                break;
              case "hour":
                topXAxis.ticks(timeHour.every(every));
                break;
              case "day":
                topXAxis.ticks(timeDay.every(every));
                break;
              case "week":
                topXAxis.ticks(mapWeekdayToTimeFunction[weekday2].every(every));
                break;
              case "month":
                topXAxis.ticks(timeMonth.every(every));
                break;
            }
          }
        }
      }
      svg.append("g").attr("class", "grid").attr("transform", "translate(" + theSidePad + ", " + theTopPad + ")").call(topXAxis).selectAll("text").style("text-anchor", "middle").attr("fill", "#000").attr("stroke", "none").attr("font-size", 10);
    }
  }
  __name(makeGrid, "makeGrid");
  function vertLabels(theGap, theTopPad) {
    let prevGap = 0;
    const numOccurrences = Object.keys(categoryHeights).map((d) => [d, categoryHeights[d]]);
    svg.append("g").selectAll("text").data(numOccurrences).enter().append(function(d) {
      const rows = d[0].split(common_default.lineBreakRegex);
      const dy = -(rows.length - 1) / 2;
      const svgLabel = doc.createElementNS("http://www.w3.org/2000/svg", "text");
      svgLabel.setAttribute("dy", dy + "em");
      for (const [j, row] of rows.entries()) {
        const tspan = doc.createElementNS("http://www.w3.org/2000/svg", "tspan");
        tspan.setAttribute("alignment-baseline", "central");
        tspan.setAttribute("x", "10");
        if (j > 0) {
          tspan.setAttribute("dy", "1em");
        }
        tspan.textContent = row;
        svgLabel.appendChild(tspan);
      }
      return svgLabel;
    }).attr("x", 10).attr("y", function(d, i) {
      if (i > 0) {
        for (let j = 0;j < i; j++) {
          prevGap += numOccurrences[i - 1][1];
          return d[1] * theGap / 2 + prevGap * theGap + theTopPad;
        }
      } else {
        return d[1] * theGap / 2 + theTopPad;
      }
    }).attr("font-size", conf.sectionFontSize).attr("class", function(d) {
      for (const [i, category] of categories.entries()) {
        if (d[0] === category) {
          return "sectionTitle sectionTitle" + i % conf.numberSectionStyles;
        }
      }
      return "sectionTitle";
    });
  }
  __name(vertLabels, "vertLabels");
  function drawToday(theSidePad, theTopPad, w2, h2) {
    const todayMarker2 = diagObj.db.getTodayMarker();
    if (todayMarker2 === "off") {
      return;
    }
    const todayG = svg.append("g").attr("class", "today");
    const today = /* @__PURE__ */ new Date;
    const todayLine = todayG.append("line");
    todayLine.attr("x1", timeScale(today) + theSidePad).attr("x2", timeScale(today) + theSidePad).attr("y1", conf.titleTopMargin).attr("y2", h2 - conf.titleTopMargin).attr("class", "today");
    if (todayMarker2 !== "") {
      todayLine.attr("style", todayMarker2.replace(/,/g, ";"));
    }
  }
  __name(drawToday, "drawToday");
  function checkUnique(arr) {
    const hash = {};
    const result = [];
    for (let i = 0, l = arr.length;i < l; ++i) {
      if (!Object.prototype.hasOwnProperty.call(hash, arr[i])) {
        hash[arr[i]] = true;
        result.push(arr[i]);
      }
    }
    return result;
  }
  __name(checkUnique, "checkUnique");
}, "draw");
var ganttRenderer_default = {
  setConf,
  draw
};
var getStyles = /* @__PURE__ */ __name((options) => `
  .mermaid-main-font {
        font-family: ${options.fontFamily};
  }

  .exclude-range {
    fill: ${options.excludeBkgColor};
  }

  .section {
    stroke: none;
    opacity: 0.2;
  }

  .section0 {
    fill: ${options.sectionBkgColor};
  }

  .section2 {
    fill: ${options.sectionBkgColor2};
  }

  .section1,
  .section3 {
    fill: ${options.altSectionBkgColor};
    opacity: 0.2;
  }

  .sectionTitle0 {
    fill: ${options.titleColor};
  }

  .sectionTitle1 {
    fill: ${options.titleColor};
  }

  .sectionTitle2 {
    fill: ${options.titleColor};
  }

  .sectionTitle3 {
    fill: ${options.titleColor};
  }

  .sectionTitle {
    text-anchor: start;
    font-family: ${options.fontFamily};
  }


  /* Grid and axis */

  .grid .tick {
    stroke: ${options.gridColor};
    opacity: 0.8;
    shape-rendering: crispEdges;
  }

  .grid .tick text {
    font-family: ${options.fontFamily};
    fill: ${options.textColor};
  }

  .grid path {
    stroke-width: 0;
  }


  /* Today line */

  .today {
    fill: none;
    stroke: ${options.todayLineColor};
    stroke-width: 2px;
  }


  /* Task styling */

  /* Default task */

  .task {
    stroke-width: 2;
  }

  .taskText {
    text-anchor: middle;
    font-family: ${options.fontFamily};
  }

  .taskTextOutsideRight {
    fill: ${options.taskTextDarkColor};
    text-anchor: start;
    font-family: ${options.fontFamily};
  }

  .taskTextOutsideLeft {
    fill: ${options.taskTextDarkColor};
    text-anchor: end;
  }


  /* Special case clickable */

  .task.clickable {
    cursor: pointer;
  }

  .taskText.clickable {
    cursor: pointer;
    fill: ${options.taskTextClickableColor} !important;
    font-weight: bold;
  }

  .taskTextOutsideLeft.clickable {
    cursor: pointer;
    fill: ${options.taskTextClickableColor} !important;
    font-weight: bold;
  }

  .taskTextOutsideRight.clickable {
    cursor: pointer;
    fill: ${options.taskTextClickableColor} !important;
    font-weight: bold;
  }


  /* Specific task settings for the sections*/

  .taskText0,
  .taskText1,
  .taskText2,
  .taskText3 {
    fill: ${options.taskTextColor};
  }

  .task0,
  .task1,
  .task2,
  .task3 {
    fill: ${options.taskBkgColor};
    stroke: ${options.taskBorderColor};
  }

  .taskTextOutside0,
  .taskTextOutside2
  {
    fill: ${options.taskTextOutsideColor};
  }

  .taskTextOutside1,
  .taskTextOutside3 {
    fill: ${options.taskTextOutsideColor};
  }


  /* Active task */

  .active0,
  .active1,
  .active2,
  .active3 {
    fill: ${options.activeTaskBkgColor};
    stroke: ${options.activeTaskBorderColor};
  }

  .activeText0,
  .activeText1,
  .activeText2,
  .activeText3 {
    fill: ${options.taskTextDarkColor} !important;
  }


  /* Completed task */

  .done0,
  .done1,
  .done2,
  .done3 {
    stroke: ${options.doneTaskBorderColor};
    fill: ${options.doneTaskBkgColor};
    stroke-width: 2;
  }

  .doneText0,
  .doneText1,
  .doneText2,
  .doneText3 {
    fill: ${options.taskTextDarkColor} !important;
  }

  /* Done task text displayed outside the bar sits against the diagram background,
     not against the done-task bar, so it must use the outside/contrast color. */
  .doneText0.taskTextOutsideLeft,
  .doneText0.taskTextOutsideRight,
  .doneText1.taskTextOutsideLeft,
  .doneText1.taskTextOutsideRight,
  .doneText2.taskTextOutsideLeft,
  .doneText2.taskTextOutsideRight,
  .doneText3.taskTextOutsideLeft,
  .doneText3.taskTextOutsideRight {
    fill: ${options.taskTextOutsideColor} !important;
  }


  /* Tasks on the critical line */

  .crit0,
  .crit1,
  .crit2,
  .crit3 {
    stroke: ${options.critBorderColor};
    fill: ${options.critBkgColor};
    stroke-width: 2;
  }

  .activeCrit0,
  .activeCrit1,
  .activeCrit2,
  .activeCrit3 {
    stroke: ${options.critBorderColor};
    fill: ${options.activeTaskBkgColor};
    stroke-width: 2;
  }

  .doneCrit0,
  .doneCrit1,
  .doneCrit2,
  .doneCrit3 {
    stroke: ${options.critBorderColor};
    fill: ${options.doneTaskBkgColor};
    stroke-width: 2;
    cursor: pointer;
    shape-rendering: crispEdges;
  }

  .milestone {
    transform: rotate(45deg) scale(0.8,0.8);
  }

  .milestoneText {
    font-style: italic;
  }
  .doneCritText0,
  .doneCritText1,
  .doneCritText2,
  .doneCritText3 {
    fill: ${options.taskTextDarkColor} !important;
  }

  /* Done-crit task text outside the bar — same reasoning as doneText above. */
  .doneCritText0.taskTextOutsideLeft,
  .doneCritText0.taskTextOutsideRight,
  .doneCritText1.taskTextOutsideLeft,
  .doneCritText1.taskTextOutsideRight,
  .doneCritText2.taskTextOutsideLeft,
  .doneCritText2.taskTextOutsideRight,
  .doneCritText3.taskTextOutsideLeft,
  .doneCritText3.taskTextOutsideRight {
    fill: ${options.taskTextOutsideColor} !important;
  }

  .vert {
    stroke: ${options.vertLineColor};
  }

  .vertText {
    font-size: 15px;
    text-anchor: middle;
    fill: ${options.vertLineColor} !important;
  }

  .activeCritText0,
  .activeCritText1,
  .activeCritText2,
  .activeCritText3 {
    fill: ${options.taskTextDarkColor} !important;
  }

  .titleText {
    text-anchor: middle;
    font-size: 18px;
    fill: ${options.titleColor || options.textColor};
    font-family: ${options.fontFamily};
  }
`, "getStyles");
var styles_default = getStyles;
var diagram = {
  parser: gantt_default,
  db: ganttDb_default,
  renderer: ganttRenderer_default,
  styles: styles_default
};
export {
  diagram
};

//# debugId=55ED6E35A9EF40BA64756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2RheWpzL3BsdWdpbi9pc29XZWVrLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kYXlqcy9wbHVnaW4vY3VzdG9tUGFyc2VGb3JtYXQuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2RheWpzL3BsdWdpbi9hZHZhbmNlZEZvcm1hdC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZGF5anMvcGx1Z2luL2R1cmF0aW9uLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9tZXJtYWlkL2Rpc3QvY2h1bmtzL21lcm1haWQuY29yZS9nYW50dERpYWdyYW0tNlJTTVRHVDcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWwogICAgIiFmdW5jdGlvbihlLHQpe1wib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzJiZcInVuZGVmaW5lZFwiIT10eXBlb2YgbW9kdWxlP21vZHVsZS5leHBvcnRzPXQoKTpcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKHQpOihlPVwidW5kZWZpbmVkXCIhPXR5cGVvZiBnbG9iYWxUaGlzP2dsb2JhbFRoaXM6ZXx8c2VsZikuZGF5anNfcGx1Z2luX2lzb1dlZWs9dCgpfSh0aGlzLChmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO3ZhciBlPVwiZGF5XCI7cmV0dXJuIGZ1bmN0aW9uKHQsaSxzKXt2YXIgYT1mdW5jdGlvbih0KXtyZXR1cm4gdC5hZGQoNC10Lmlzb1dlZWtkYXkoKSxlKX0sZD1pLnByb3RvdHlwZTtkLmlzb1dlZWtZZWFyPWZ1bmN0aW9uKCl7cmV0dXJuIGEodGhpcykueWVhcigpfSxkLmlzb1dlZWs9ZnVuY3Rpb24odCl7aWYoIXRoaXMuJHV0aWxzKCkudSh0KSlyZXR1cm4gdGhpcy5hZGQoNyoodC10aGlzLmlzb1dlZWsoKSksZSk7dmFyIGksZCxuLG8scj1hKHRoaXMpLHU9KGk9dGhpcy5pc29XZWVrWWVhcigpLGQ9dGhpcy4kdSxuPShkP3MudXRjOnMpKCkueWVhcihpKS5zdGFydE9mKFwieWVhclwiKSxvPTQtbi5pc29XZWVrZGF5KCksbi5pc29XZWVrZGF5KCk+NCYmKG8rPTcpLG4uYWRkKG8sZSkpO3JldHVybiByLmRpZmYodSxcIndlZWtcIikrMX0sZC5pc29XZWVrZGF5PWZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLiR1dGlscygpLnUoZSk/dGhpcy5kYXkoKXx8Nzp0aGlzLmRheSh0aGlzLmRheSgpJTc/ZTplLTcpfTt2YXIgbj1kLnN0YXJ0T2Y7ZC5zdGFydE9mPWZ1bmN0aW9uKGUsdCl7dmFyIGk9dGhpcy4kdXRpbHMoKSxzPSEhaS51KHQpfHx0O3JldHVyblwiaXNvd2Vla1wiPT09aS5wKGUpP3M/dGhpcy5kYXRlKHRoaXMuZGF0ZSgpLSh0aGlzLmlzb1dlZWtkYXkoKS0xKSkuc3RhcnRPZihcImRheVwiKTp0aGlzLmRhdGUodGhpcy5kYXRlKCktMS0odGhpcy5pc29XZWVrZGF5KCktMSkrNykuZW5kT2YoXCJkYXlcIik6bi5iaW5kKHRoaXMpKGUsdCl9fX0pKTsiLAogICAgIiFmdW5jdGlvbihlLHQpe1wib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzJiZcInVuZGVmaW5lZFwiIT10eXBlb2YgbW9kdWxlP21vZHVsZS5leHBvcnRzPXQoKTpcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKHQpOihlPVwidW5kZWZpbmVkXCIhPXR5cGVvZiBnbG9iYWxUaGlzP2dsb2JhbFRoaXM6ZXx8c2VsZikuZGF5anNfcGx1Z2luX2N1c3RvbVBhcnNlRm9ybWF0PXQoKX0odGhpcywoZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjt2YXIgZT17TFRTOlwiaDptbTpzcyBBXCIsTFQ6XCJoOm1tIEFcIixMOlwiTU0vREQvWVlZWVwiLExMOlwiTU1NTSBELCBZWVlZXCIsTExMOlwiTU1NTSBELCBZWVlZIGg6bW0gQVwiLExMTEw6XCJkZGRkLCBNTU1NIEQsIFlZWVkgaDptbSBBXCJ9LHQ9LyhcXFtbXltdKlxcXSl8KFstXzovLiwoKVxcc10rKXwoQXxhfFF8WVlZWXxZWT98d3c/fE1NP00/TT98RG98REQ/fGhoP3xISD98bW0/fHNzP3xTezEsM318enxaWj8pL2csbj0vXFxkLyxyPS9cXGRcXGQvLGk9L1xcZFxcZD8vLG89L1xcZCpbXi1fOi8sKClcXHNcXGRdKy8scz17fSxhPWZ1bmN0aW9uKGUpe3JldHVybihlPStlKSsoZT42OD8xOTAwOjJlMyl9O3ZhciBmPWZ1bmN0aW9uKGUpe3JldHVybiBmdW5jdGlvbih0KXt0aGlzW2VdPSt0fX0saD1bL1srLV1cXGRcXGQ6PyhcXGRcXGQpP3xaLyxmdW5jdGlvbihlKXsodGhpcy56b25lfHwodGhpcy56b25lPXt9KSkub2Zmc2V0PWZ1bmN0aW9uKGUpe2lmKCFlKXJldHVybiAwO2lmKFwiWlwiPT09ZSlyZXR1cm4gMDt2YXIgdD1lLm1hdGNoKC8oWystXXxcXGRcXGQpL2cpLG49NjAqdFsxXSsoK3RbMl18fDApO3JldHVybiAwPT09bj8wOlwiK1wiPT09dFswXT8tbjpufShlKX1dLHU9ZnVuY3Rpb24oZSl7dmFyIHQ9c1tlXTtyZXR1cm4gdCYmKHQuaW5kZXhPZj90OnQucy5jb25jYXQodC5mKSl9LGQ9ZnVuY3Rpb24oZSx0KXt2YXIgbixyPXMubWVyaWRpZW07aWYocil7Zm9yKHZhciBpPTE7aTw9MjQ7aSs9MSlpZihlLmluZGV4T2YocihpLDAsdCkpPi0xKXtuPWk+MTI7YnJlYWt9fWVsc2Ugbj1lPT09KHQ/XCJwbVwiOlwiUE1cIik7cmV0dXJuIG59LGM9e0E6W28sZnVuY3Rpb24oZSl7dGhpcy5hZnRlcm5vb249ZChlLCExKX1dLGE6W28sZnVuY3Rpb24oZSl7dGhpcy5hZnRlcm5vb249ZChlLCEwKX1dLFE6W24sZnVuY3Rpb24oZSl7dGhpcy5tb250aD0zKihlLTEpKzF9XSxTOltuLGZ1bmN0aW9uKGUpe3RoaXMubWlsbGlzZWNvbmRzPTEwMCorZX1dLFNTOltyLGZ1bmN0aW9uKGUpe3RoaXMubWlsbGlzZWNvbmRzPTEwKitlfV0sU1NTOlsvXFxkezN9LyxmdW5jdGlvbihlKXt0aGlzLm1pbGxpc2Vjb25kcz0rZX1dLHM6W2ksZihcInNlY29uZHNcIildLHNzOltpLGYoXCJzZWNvbmRzXCIpXSxtOltpLGYoXCJtaW51dGVzXCIpXSxtbTpbaSxmKFwibWludXRlc1wiKV0sSDpbaSxmKFwiaG91cnNcIildLGg6W2ksZihcImhvdXJzXCIpXSxISDpbaSxmKFwiaG91cnNcIildLGhoOltpLGYoXCJob3Vyc1wiKV0sRDpbaSxmKFwiZGF5XCIpXSxERDpbcixmKFwiZGF5XCIpXSxEbzpbbyxmdW5jdGlvbihlKXt2YXIgdD1zLm9yZGluYWwsbj1lLm1hdGNoKC9cXGQrLyk7aWYodGhpcy5kYXk9blswXSx0KWZvcih2YXIgcj0xO3I8PTMxO3IrPTEpdChyKS5yZXBsYWNlKC9cXFt8XFxdL2csXCJcIik9PT1lJiYodGhpcy5kYXk9cil9XSx3OltpLGYoXCJ3ZWVrXCIpXSx3dzpbcixmKFwid2Vla1wiKV0sTTpbaSxmKFwibW9udGhcIildLE1NOltyLGYoXCJtb250aFwiKV0sTU1NOltvLGZ1bmN0aW9uKGUpe3ZhciB0PXUoXCJtb250aHNcIiksbj0odShcIm1vbnRoc1Nob3J0XCIpfHx0Lm1hcCgoZnVuY3Rpb24oZSl7cmV0dXJuIGUuc2xpY2UoMCwzKX0pKSkuaW5kZXhPZihlKSsxO2lmKG48MSl0aHJvdyBuZXcgRXJyb3I7dGhpcy5tb250aD1uJTEyfHxufV0sTU1NTTpbbyxmdW5jdGlvbihlKXt2YXIgdD11KFwibW9udGhzXCIpLmluZGV4T2YoZSkrMTtpZih0PDEpdGhyb3cgbmV3IEVycm9yO3RoaXMubW9udGg9dCUxMnx8dH1dLFk6Wy9bKy1dP1xcZCsvLGYoXCJ5ZWFyXCIpXSxZWTpbcixmdW5jdGlvbihlKXt0aGlzLnllYXI9YShlKX1dLFlZWVk6Wy9cXGR7NH0vLGYoXCJ5ZWFyXCIpXSxaOmgsWlo6aH07ZnVuY3Rpb24gbChuKXt2YXIgcixpO3I9bixpPXMmJnMuZm9ybWF0cztmb3IodmFyIG89KG49ci5yZXBsYWNlKC8oXFxbW15cXF1dK10pfChMVFM/fGx7MSw0fXxMezEsNH0pL2csKGZ1bmN0aW9uKHQsbixyKXt2YXIgbz1yJiZyLnRvVXBwZXJDYXNlKCk7cmV0dXJuIG58fGlbcl18fGVbcl18fGlbb10ucmVwbGFjZSgvKFxcW1teXFxdXStdKXwoTU1NTXxNTXxERHxkZGRkKS9nLChmdW5jdGlvbihlLHQsbil7cmV0dXJuIHR8fG4uc2xpY2UoMSl9KSl9KSkpLm1hdGNoKHQpLGE9by5sZW5ndGgsZj0wO2Y8YTtmKz0xKXt2YXIgaD1vW2ZdLHU9Y1toXSxkPXUmJnVbMF0sbD11JiZ1WzFdO29bZl09bD97cmVnZXg6ZCxwYXJzZXI6bH06aC5yZXBsYWNlKC9eXFxbfFxcXSQvZyxcIlwiKX1yZXR1cm4gZnVuY3Rpb24oZSl7Zm9yKHZhciB0PXt9LG49MCxyPTA7bjxhO24rPTEpe3ZhciBpPW9bbl07aWYoXCJzdHJpbmdcIj09dHlwZW9mIGkpcis9aS5sZW5ndGg7ZWxzZXt2YXIgcz1pLnJlZ2V4LGY9aS5wYXJzZXIsaD1lLnNsaWNlKHIpLHU9cy5leGVjKGgpWzBdO2YuY2FsbCh0LHUpLGU9ZS5yZXBsYWNlKHUsXCJcIil9fXJldHVybiBmdW5jdGlvbihlKXt2YXIgdD1lLmFmdGVybm9vbjtpZih2b2lkIDAhPT10KXt2YXIgbj1lLmhvdXJzO3Q/bjwxMiYmKGUuaG91cnMrPTEyKToxMj09PW4mJihlLmhvdXJzPTApLGRlbGV0ZSBlLmFmdGVybm9vbn19KHQpLHR9fXJldHVybiBmdW5jdGlvbihlLHQsbil7bi5wLmN1c3RvbVBhcnNlRm9ybWF0PSEwLGUmJmUucGFyc2VUd29EaWdpdFllYXImJihhPWUucGFyc2VUd29EaWdpdFllYXIpO3ZhciByPXQucHJvdG90eXBlLGk9ci5wYXJzZTtyLnBhcnNlPWZ1bmN0aW9uKGUpe3ZhciB0PWUuZGF0ZSxyPWUudXRjLG89ZS5hcmdzO3RoaXMuJHU9cjt2YXIgYT1vWzFdO2lmKFwic3RyaW5nXCI9PXR5cGVvZiBhKXt2YXIgZj0hMD09PW9bMl0saD0hMD09PW9bM10sdT1mfHxoLGQ9b1syXTtoJiYoZD1vWzJdKSxzPXRoaXMuJGxvY2FsZSgpLCFmJiZkJiYocz1uLkxzW2RdKSx0aGlzLiRkPWZ1bmN0aW9uKGUsdCxuLHIpe3RyeXtpZihbXCJ4XCIsXCJYXCJdLmluZGV4T2YodCk+LTEpcmV0dXJuIG5ldyBEYXRlKChcIlhcIj09PXQ/MWUzOjEpKmUpO3ZhciBpPWwodCkoZSksbz1pLnllYXIscz1pLm1vbnRoLGE9aS5kYXksZj1pLmhvdXJzLGg9aS5taW51dGVzLHU9aS5zZWNvbmRzLGQ9aS5taWxsaXNlY29uZHMsYz1pLnpvbmUsbT1pLndlZWssTT1uZXcgRGF0ZSxZPWF8fChvfHxzPzE6TS5nZXREYXRlKCkpLHA9b3x8TS5nZXRGdWxsWWVhcigpLHY9MDtvJiYhc3x8KHY9cz4wP3MtMTpNLmdldE1vbnRoKCkpO3ZhciBELHc9Znx8MCxnPWh8fDAseT11fHwwLEw9ZHx8MDtyZXR1cm4gYz9uZXcgRGF0ZShEYXRlLlVUQyhwLHYsWSx3LGcseSxMKzYwKmMub2Zmc2V0KjFlMykpOm4/bmV3IERhdGUoRGF0ZS5VVEMocCx2LFksdyxnLHksTCkpOihEPW5ldyBEYXRlKHAsdixZLHcsZyx5LEwpLG0mJihEPXIoRCkud2VlayhtKS50b0RhdGUoKSksRCl9Y2F0Y2goZSl7cmV0dXJuIG5ldyBEYXRlKFwiXCIpfX0odCxhLHIsbiksdGhpcy5pbml0KCksZCYmITAhPT1kJiYodGhpcy4kTD10aGlzLmxvY2FsZShkKS4kTCksdSYmdCE9dGhpcy5mb3JtYXQoYSkmJih0aGlzLiRkPW5ldyBEYXRlKFwiXCIpKSxzPXt9fWVsc2UgaWYoYSBpbnN0YW5jZW9mIEFycmF5KWZvcih2YXIgYz1hLmxlbmd0aCxtPTE7bTw9YzttKz0xKXtvWzFdPWFbbS0xXTt2YXIgTT1uLmFwcGx5KHRoaXMsbyk7aWYoTS5pc1ZhbGlkKCkpe3RoaXMuJGQ9TS4kZCx0aGlzLiRMPU0uJEwsdGhpcy5pbml0KCk7YnJlYWt9bT09PWMmJih0aGlzLiRkPW5ldyBEYXRlKFwiXCIpKX1lbHNlIGkuY2FsbCh0aGlzLGUpfX19KSk7IiwKICAgICIhZnVuY3Rpb24oZSx0KXtcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cyYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIG1vZHVsZT9tb2R1bGUuZXhwb3J0cz10KCk6XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZSh0KTooZT1cInVuZGVmaW5lZFwiIT10eXBlb2YgZ2xvYmFsVGhpcz9nbG9iYWxUaGlzOmV8fHNlbGYpLmRheWpzX3BsdWdpbl9hZHZhbmNlZEZvcm1hdD10KCl9KHRoaXMsKGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7cmV0dXJuIGZ1bmN0aW9uKGUsdCl7dmFyIHI9dC5wcm90b3R5cGUsbj1yLmZvcm1hdDtyLmZvcm1hdD1mdW5jdGlvbihlKXt2YXIgdD10aGlzLHI9dGhpcy4kbG9jYWxlKCk7aWYoIXRoaXMuaXNWYWxpZCgpKXJldHVybiBuLmJpbmQodGhpcykoZSk7dmFyIHM9dGhpcy4kdXRpbHMoKSxhPShlfHxcIllZWVktTU0tRERUSEg6bW06c3NaXCIpLnJlcGxhY2UoL1xcWyhbXlxcXV0rKV18UXx3b3x3d3x3fFdXfFd8enp6fHp8Z2dnZ3xHR0dHfERvfFh8eHxrezEsMn18Uy9nLChmdW5jdGlvbihlKXtzd2l0Y2goZSl7Y2FzZVwiUVwiOnJldHVybiBNYXRoLmNlaWwoKHQuJE0rMSkvMyk7Y2FzZVwiRG9cIjpyZXR1cm4gci5vcmRpbmFsKHQuJEQpO2Nhc2VcImdnZ2dcIjpyZXR1cm4gdC53ZWVrWWVhcigpO2Nhc2VcIkdHR0dcIjpyZXR1cm4gdC5pc29XZWVrWWVhcigpO2Nhc2VcIndvXCI6cmV0dXJuIHIub3JkaW5hbCh0LndlZWsoKSxcIldcIik7Y2FzZVwid1wiOmNhc2VcInd3XCI6cmV0dXJuIHMucyh0LndlZWsoKSxcIndcIj09PWU/MToyLFwiMFwiKTtjYXNlXCJXXCI6Y2FzZVwiV1dcIjpyZXR1cm4gcy5zKHQuaXNvV2VlaygpLFwiV1wiPT09ZT8xOjIsXCIwXCIpO2Nhc2VcImtcIjpjYXNlXCJra1wiOnJldHVybiBzLnMoU3RyaW5nKDA9PT10LiRIPzI0OnQuJEgpLFwia1wiPT09ZT8xOjIsXCIwXCIpO2Nhc2VcIlhcIjpyZXR1cm4gTWF0aC5mbG9vcih0LiRkLmdldFRpbWUoKS8xZTMpO2Nhc2VcInhcIjpyZXR1cm4gdC4kZC5nZXRUaW1lKCk7Y2FzZVwielwiOnJldHVyblwiW1wiK3Qub2Zmc2V0TmFtZSgpK1wiXVwiO2Nhc2VcInp6elwiOnJldHVyblwiW1wiK3Qub2Zmc2V0TmFtZShcImxvbmdcIikrXCJdXCI7ZGVmYXVsdDpyZXR1cm4gZX19KSk7cmV0dXJuIG4uYmluZCh0aGlzKShhKX19fSkpOyIsCiAgICAiIWZ1bmN0aW9uKHQscyl7XCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBtb2R1bGU/bW9kdWxlLmV4cG9ydHM9cygpOlwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUocyk6KHQ9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGdsb2JhbFRoaXM/Z2xvYmFsVGhpczp0fHxzZWxmKS5kYXlqc19wbHVnaW5fZHVyYXRpb249cygpfSh0aGlzLChmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO3ZhciB0LHMsbj0xZTMsaT02ZTQsZT0zNmU1LHI9ODY0ZTUsbz0zMTUzNmU2LHU9MjYyOGU2LGQ9L14oLXxcXCspP1AoPzooWy0rXT9bMC05LC5dKilZKT8oPzooWy0rXT9bMC05LC5dKilNKT8oPzooWy0rXT9bMC05LC5dKilXKT8oPzooWy0rXT9bMC05LC5dKilEKT8oPzpUKD86KFstK10/WzAtOSwuXSopSCk/KD86KFstK10/WzAtOSwuXSopTSk/KD86KFstK10/WzAtOSwuXSopUyk/KT8kLyxhPS9cXFsoW15cXF1dKyldfFlZWVl8WVl8WXxNezEsMn18RHsxLDJ9fEh7MSwyfXxtezEsMn18c3sxLDJ9fFNTUy9nLGg9e3llYXJzOm8sbW9udGhzOnUsZGF5czpyLGhvdXJzOmUsbWludXRlczppLHNlY29uZHM6bixtaWxsaXNlY29uZHM6MSx3ZWVrczo2MDQ4ZTV9LGM9ZnVuY3Rpb24odCl7cmV0dXJuIHQgaW5zdGFuY2VvZiBnfSxmPWZ1bmN0aW9uKHQscyxuKXtyZXR1cm4gbmV3IGcodCxuLHMuJGwpfSxtPWZ1bmN0aW9uKHQpe3JldHVybiBzLnAodCkrXCJzXCJ9LGw9ZnVuY3Rpb24odCl7cmV0dXJuIHQ8MH0sJD1mdW5jdGlvbih0KXtyZXR1cm4gbCh0KT9NYXRoLmNlaWwodCk6TWF0aC5mbG9vcih0KX0seT1mdW5jdGlvbih0KXtyZXR1cm4gTWF0aC5hYnModCl9LHY9ZnVuY3Rpb24odCxzKXtyZXR1cm4gdD9sKHQpP3tuZWdhdGl2ZTohMCxmb3JtYXQ6XCJcIit5KHQpK3N9OntuZWdhdGl2ZTohMSxmb3JtYXQ6XCJcIit0K3N9OntuZWdhdGl2ZTohMSxmb3JtYXQ6XCJcIn19LGc9ZnVuY3Rpb24oKXtmdW5jdGlvbiBsKHQscyxuKXt2YXIgaT10aGlzO2lmKHRoaXMuJGQ9e30sdGhpcy4kbD1uLHZvaWQgMD09PXQmJih0aGlzLiRtcz0wLHRoaXMucGFyc2VGcm9tTWlsbGlzZWNvbmRzKCkpLHMpcmV0dXJuIGYodCpoW20ocyldLHRoaXMpO2lmKFwibnVtYmVyXCI9PXR5cGVvZiB0KXJldHVybiB0aGlzLiRtcz10LHRoaXMucGFyc2VGcm9tTWlsbGlzZWNvbmRzKCksdGhpcztpZihcIm9iamVjdFwiPT10eXBlb2YgdClyZXR1cm4gT2JqZWN0LmtleXModCkuZm9yRWFjaCgoZnVuY3Rpb24ocyl7aS4kZFttKHMpXT10W3NdfSkpLHRoaXMuY2FsTWlsbGlzZWNvbmRzKCksdGhpcztpZihcInN0cmluZ1wiPT10eXBlb2YgdCl7dmFyIGU9dC5tYXRjaChkKTtpZihlKXt2YXIgcj1lLnNsaWNlKDIpLm1hcCgoZnVuY3Rpb24odCl7cmV0dXJuIG51bGwhPXQ/TnVtYmVyKHQpOjB9KSk7cmV0dXJuIHRoaXMuJGQueWVhcnM9clswXSx0aGlzLiRkLm1vbnRocz1yWzFdLHRoaXMuJGQud2Vla3M9clsyXSx0aGlzLiRkLmRheXM9clszXSx0aGlzLiRkLmhvdXJzPXJbNF0sdGhpcy4kZC5taW51dGVzPXJbNV0sdGhpcy4kZC5zZWNvbmRzPXJbNl0sdGhpcy5jYWxNaWxsaXNlY29uZHMoKSx0aGlzfX1yZXR1cm4gdGhpc312YXIgeT1sLnByb3RvdHlwZTtyZXR1cm4geS5jYWxNaWxsaXNlY29uZHM9ZnVuY3Rpb24oKXt2YXIgdD10aGlzO3RoaXMuJG1zPU9iamVjdC5rZXlzKHRoaXMuJGQpLnJlZHVjZSgoZnVuY3Rpb24ocyxuKXtyZXR1cm4gcysodC4kZFtuXXx8MCkqaFtuXX0pLDApfSx5LnBhcnNlRnJvbU1pbGxpc2Vjb25kcz1mdW5jdGlvbigpe3ZhciB0PXRoaXMuJG1zO3RoaXMuJGQueWVhcnM9JCh0L28pLHQlPW8sdGhpcy4kZC5tb250aHM9JCh0L3UpLHQlPXUsdGhpcy4kZC5kYXlzPSQodC9yKSx0JT1yLHRoaXMuJGQuaG91cnM9JCh0L2UpLHQlPWUsdGhpcy4kZC5taW51dGVzPSQodC9pKSx0JT1pLHRoaXMuJGQuc2Vjb25kcz0kKHQvbiksdCU9bix0aGlzLiRkLm1pbGxpc2Vjb25kcz10fSx5LnRvSVNPU3RyaW5nPWZ1bmN0aW9uKCl7dmFyIHQ9dih0aGlzLiRkLnllYXJzLFwiWVwiKSxzPXYodGhpcy4kZC5tb250aHMsXCJNXCIpLG49K3RoaXMuJGQuZGF5c3x8MDt0aGlzLiRkLndlZWtzJiYobis9Nyp0aGlzLiRkLndlZWtzKTt2YXIgaT12KG4sXCJEXCIpLGU9dih0aGlzLiRkLmhvdXJzLFwiSFwiKSxyPXYodGhpcy4kZC5taW51dGVzLFwiTVwiKSxvPXRoaXMuJGQuc2Vjb25kc3x8MDt0aGlzLiRkLm1pbGxpc2Vjb25kcyYmKG8rPXRoaXMuJGQubWlsbGlzZWNvbmRzLzFlMyxvPU1hdGgucm91bmQoMWUzKm8pLzFlMyk7dmFyIHU9dihvLFwiU1wiKSxkPXQubmVnYXRpdmV8fHMubmVnYXRpdmV8fGkubmVnYXRpdmV8fGUubmVnYXRpdmV8fHIubmVnYXRpdmV8fHUubmVnYXRpdmUsYT1lLmZvcm1hdHx8ci5mb3JtYXR8fHUuZm9ybWF0P1wiVFwiOlwiXCIsaD0oZD9cIi1cIjpcIlwiKStcIlBcIit0LmZvcm1hdCtzLmZvcm1hdCtpLmZvcm1hdCthK2UuZm9ybWF0K3IuZm9ybWF0K3UuZm9ybWF0O3JldHVyblwiUFwiPT09aHx8XCItUFwiPT09aD9cIlAwRFwiOmh9LHkudG9KU09OPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudG9JU09TdHJpbmcoKX0seS5mb3JtYXQ9ZnVuY3Rpb24odCl7dmFyIG49dHx8XCJZWVlZLU1NLUREVEhIOm1tOnNzXCIsaT17WTp0aGlzLiRkLnllYXJzLFlZOnMucyh0aGlzLiRkLnllYXJzLDIsXCIwXCIpLFlZWVk6cy5zKHRoaXMuJGQueWVhcnMsNCxcIjBcIiksTTp0aGlzLiRkLm1vbnRocyxNTTpzLnModGhpcy4kZC5tb250aHMsMixcIjBcIiksRDp0aGlzLiRkLmRheXMsREQ6cy5zKHRoaXMuJGQuZGF5cywyLFwiMFwiKSxIOnRoaXMuJGQuaG91cnMsSEg6cy5zKHRoaXMuJGQuaG91cnMsMixcIjBcIiksbTp0aGlzLiRkLm1pbnV0ZXMsbW06cy5zKHRoaXMuJGQubWludXRlcywyLFwiMFwiKSxzOnRoaXMuJGQuc2Vjb25kcyxzczpzLnModGhpcy4kZC5zZWNvbmRzLDIsXCIwXCIpLFNTUzpzLnModGhpcy4kZC5taWxsaXNlY29uZHMsMyxcIjBcIil9O3JldHVybiBuLnJlcGxhY2UoYSwoZnVuY3Rpb24odCxzKXtyZXR1cm4gc3x8U3RyaW5nKGlbdF0pfSkpfSx5LmFzPWZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLiRtcy9oW20odCldfSx5LmdldD1mdW5jdGlvbih0KXt2YXIgcz10aGlzLiRtcyxuPW0odCk7cmV0dXJuXCJtaWxsaXNlY29uZHNcIj09PW4/cyU9MWUzOnM9XCJ3ZWVrc1wiPT09bj8kKHMvaFtuXSk6dGhpcy4kZFtuXSxzfHwwfSx5LmFkZD1mdW5jdGlvbih0LHMsbil7dmFyIGk7cmV0dXJuIGk9cz90KmhbbShzKV06Yyh0KT90LiRtczpmKHQsdGhpcykuJG1zLGYodGhpcy4kbXMraSoobj8tMToxKSx0aGlzKX0seS5zdWJ0cmFjdD1mdW5jdGlvbih0LHMpe3JldHVybiB0aGlzLmFkZCh0LHMsITApfSx5LmxvY2FsZT1mdW5jdGlvbih0KXt2YXIgcz10aGlzLmNsb25lKCk7cmV0dXJuIHMuJGw9dCxzfSx5LmNsb25lPWZ1bmN0aW9uKCl7cmV0dXJuIGYodGhpcy4kbXMsdGhpcyl9LHkuaHVtYW5pemU9ZnVuY3Rpb24ocyl7cmV0dXJuIHQoKS5hZGQodGhpcy4kbXMsXCJtc1wiKS5sb2NhbGUodGhpcy4kbCkuZnJvbU5vdyghcyl9LHkudmFsdWVPZj1mdW5jdGlvbigpe3JldHVybiB0aGlzLmFzTWlsbGlzZWNvbmRzKCl9LHkubWlsbGlzZWNvbmRzPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZ2V0KFwibWlsbGlzZWNvbmRzXCIpfSx5LmFzTWlsbGlzZWNvbmRzPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuYXMoXCJtaWxsaXNlY29uZHNcIil9LHkuc2Vjb25kcz1mdW5jdGlvbigpe3JldHVybiB0aGlzLmdldChcInNlY29uZHNcIil9LHkuYXNTZWNvbmRzPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuYXMoXCJzZWNvbmRzXCIpfSx5Lm1pbnV0ZXM9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5nZXQoXCJtaW51dGVzXCIpfSx5LmFzTWludXRlcz1mdW5jdGlvbigpe3JldHVybiB0aGlzLmFzKFwibWludXRlc1wiKX0seS5ob3Vycz1mdW5jdGlvbigpe3JldHVybiB0aGlzLmdldChcImhvdXJzXCIpfSx5LmFzSG91cnM9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5hcyhcImhvdXJzXCIpfSx5LmRheXM9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5nZXQoXCJkYXlzXCIpfSx5LmFzRGF5cz1mdW5jdGlvbigpe3JldHVybiB0aGlzLmFzKFwiZGF5c1wiKX0seS53ZWVrcz1mdW5jdGlvbigpe3JldHVybiB0aGlzLmdldChcIndlZWtzXCIpfSx5LmFzV2Vla3M9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5hcyhcIndlZWtzXCIpfSx5Lm1vbnRocz1mdW5jdGlvbigpe3JldHVybiB0aGlzLmdldChcIm1vbnRoc1wiKX0seS5hc01vbnRocz1mdW5jdGlvbigpe3JldHVybiB0aGlzLmFzKFwibW9udGhzXCIpfSx5LnllYXJzPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZ2V0KFwieWVhcnNcIil9LHkuYXNZZWFycz1mdW5jdGlvbigpe3JldHVybiB0aGlzLmFzKFwieWVhcnNcIil9LGx9KCkscD1mdW5jdGlvbih0LHMsbil7cmV0dXJuIHQuYWRkKHMueWVhcnMoKSpuLFwieVwiKS5hZGQocy5tb250aHMoKSpuLFwiTVwiKS5hZGQocy5kYXlzKCkqbixcImRcIikuYWRkKHMuaG91cnMoKSpuLFwiaFwiKS5hZGQocy5taW51dGVzKCkqbixcIm1cIikuYWRkKHMuc2Vjb25kcygpKm4sXCJzXCIpLmFkZChzLm1pbGxpc2Vjb25kcygpKm4sXCJtc1wiKX07cmV0dXJuIGZ1bmN0aW9uKG4saSxlKXt0PWUscz1lKCkuJHV0aWxzKCksZS5kdXJhdGlvbj1mdW5jdGlvbih0LHMpe3ZhciBuPWUubG9jYWxlKCk7cmV0dXJuIGYodCx7JGw6bn0scyl9LGUuaXNEdXJhdGlvbj1jO3ZhciByPWkucHJvdG90eXBlLmFkZCxvPWkucHJvdG90eXBlLnN1YnRyYWN0O2kucHJvdG90eXBlLmFkZD1mdW5jdGlvbih0LHMpe3JldHVybiBjKHQpP3AodGhpcyx0LDEpOnIuYmluZCh0aGlzKSh0LHMpfSxpLnByb3RvdHlwZS5zdWJ0cmFjdD1mdW5jdGlvbih0LHMpe3JldHVybiBjKHQpP3AodGhpcyx0LC0xKTpvLmJpbmQodGhpcykodCxzKX19fSkpOyIsCiAgICAiaW1wb3J0IHtcbiAgdXRpbHNfZGVmYXVsdFxufSBmcm9tIFwiLi9jaHVuay01WlFZSFhLVS5tanNcIjtcbmltcG9ydCB7XG4gIGNsZWFyLFxuICBjb21tb25fZGVmYXVsdCxcbiAgY29uZmlndXJlU3ZnU2l6ZSxcbiAgZ2V0QWNjRGVzY3JpcHRpb24sXG4gIGdldEFjY1RpdGxlLFxuICBnZXRDb25maWcyIGFzIGdldENvbmZpZyxcbiAgZ2V0RGlhZ3JhbVRpdGxlLFxuICBzZXRBY2NEZXNjcmlwdGlvbixcbiAgc2V0QWNjVGl0bGUsXG4gIHNldERpYWdyYW1UaXRsZVxufSBmcm9tIFwiLi9jaHVuay1DU0NJSEs3US5tanNcIjtcbmltcG9ydCB7XG4gIF9fbmFtZSxcbiAgbG9nXG59IGZyb20gXCIuL2NodW5rLUFHSFJCNEpGLm1qc1wiO1xuXG4vLyBzcmMvZGlhZ3JhbXMvZ2FudHQvcGFyc2VyL2dhbnR0Lmppc29uXG52YXIgcGFyc2VyID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgbyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oaywgdiwgbzIsIGwpIHtcbiAgICBmb3IgKG8yID0gbzIgfHwge30sIGwgPSBrLmxlbmd0aDsgbC0tOyBvMltrW2xdXSA9IHYpIDtcbiAgICByZXR1cm4gbzI7XG4gIH0sIFwib1wiKSwgJFYwID0gWzYsIDgsIDEwLCAxMiwgMTMsIDE0LCAxNSwgMTYsIDE3LCAxOCwgMjAsIDIxLCAyMiwgMjMsIDI0LCAyNSwgMjYsIDI3LCAyOCwgMjksIDMwLCAzMSwgMzMsIDM1LCAzNiwgMzgsIDQwXSwgJFYxID0gWzEsIDI2XSwgJFYyID0gWzEsIDI3XSwgJFYzID0gWzEsIDI4XSwgJFY0ID0gWzEsIDI5XSwgJFY1ID0gWzEsIDMwXSwgJFY2ID0gWzEsIDMxXSwgJFY3ID0gWzEsIDMyXSwgJFY4ID0gWzEsIDMzXSwgJFY5ID0gWzEsIDM0XSwgJFZhID0gWzEsIDldLCAkVmIgPSBbMSwgMTBdLCAkVmMgPSBbMSwgMTFdLCAkVmQgPSBbMSwgMTJdLCAkVmUgPSBbMSwgMTNdLCAkVmYgPSBbMSwgMTRdLCAkVmcgPSBbMSwgMTVdLCAkVmggPSBbMSwgMTZdLCAkVmkgPSBbMSwgMTldLCAkVmogPSBbMSwgMjBdLCAkVmsgPSBbMSwgMjFdLCAkVmwgPSBbMSwgMjJdLCAkVm0gPSBbMSwgMjNdLCAkVm4gPSBbMSwgMjVdLCAkVm8gPSBbMSwgMzVdO1xuICB2YXIgcGFyc2VyMiA9IHtcbiAgICB0cmFjZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiB0cmFjZSgpIHtcbiAgICB9LCBcInRyYWNlXCIpLFxuICAgIHl5OiB7fSxcbiAgICBzeW1ib2xzXzogeyBcImVycm9yXCI6IDIsIFwic3RhcnRcIjogMywgXCJnYW50dFwiOiA0LCBcImRvY3VtZW50XCI6IDUsIFwiRU9GXCI6IDYsIFwibGluZVwiOiA3LCBcIlNQQUNFXCI6IDgsIFwic3RhdGVtZW50XCI6IDksIFwiTkxcIjogMTAsIFwid2Vla2RheVwiOiAxMSwgXCJ3ZWVrZGF5X21vbmRheVwiOiAxMiwgXCJ3ZWVrZGF5X3R1ZXNkYXlcIjogMTMsIFwid2Vla2RheV93ZWRuZXNkYXlcIjogMTQsIFwid2Vla2RheV90aHVyc2RheVwiOiAxNSwgXCJ3ZWVrZGF5X2ZyaWRheVwiOiAxNiwgXCJ3ZWVrZGF5X3NhdHVyZGF5XCI6IDE3LCBcIndlZWtkYXlfc3VuZGF5XCI6IDE4LCBcIndlZWtlbmRcIjogMTksIFwid2Vla2VuZF9mcmlkYXlcIjogMjAsIFwid2Vla2VuZF9zYXR1cmRheVwiOiAyMSwgXCJkYXRlRm9ybWF0XCI6IDIyLCBcImluY2x1c2l2ZUVuZERhdGVzXCI6IDIzLCBcInRvcEF4aXNcIjogMjQsIFwiYXhpc0Zvcm1hdFwiOiAyNSwgXCJ0aWNrSW50ZXJ2YWxcIjogMjYsIFwiZXhjbHVkZXNcIjogMjcsIFwiaW5jbHVkZXNcIjogMjgsIFwidG9kYXlNYXJrZXJcIjogMjksIFwidGl0bGVcIjogMzAsIFwiYWNjX3RpdGxlXCI6IDMxLCBcImFjY190aXRsZV92YWx1ZVwiOiAzMiwgXCJhY2NfZGVzY3JcIjogMzMsIFwiYWNjX2Rlc2NyX3ZhbHVlXCI6IDM0LCBcImFjY19kZXNjcl9tdWx0aWxpbmVfdmFsdWVcIjogMzUsIFwic2VjdGlvblwiOiAzNiwgXCJjbGlja1N0YXRlbWVudFwiOiAzNywgXCJ0YXNrVHh0XCI6IDM4LCBcInRhc2tEYXRhXCI6IDM5LCBcImNsaWNrXCI6IDQwLCBcImNhbGxiYWNrbmFtZVwiOiA0MSwgXCJjYWxsYmFja2FyZ3NcIjogNDIsIFwiaHJlZlwiOiA0MywgXCJjbGlja1N0YXRlbWVudERlYnVnXCI6IDQ0LCBcIiRhY2NlcHRcIjogMCwgXCIkZW5kXCI6IDEgfSxcbiAgICB0ZXJtaW5hbHNfOiB7IDI6IFwiZXJyb3JcIiwgNDogXCJnYW50dFwiLCA2OiBcIkVPRlwiLCA4OiBcIlNQQUNFXCIsIDEwOiBcIk5MXCIsIDEyOiBcIndlZWtkYXlfbW9uZGF5XCIsIDEzOiBcIndlZWtkYXlfdHVlc2RheVwiLCAxNDogXCJ3ZWVrZGF5X3dlZG5lc2RheVwiLCAxNTogXCJ3ZWVrZGF5X3RodXJzZGF5XCIsIDE2OiBcIndlZWtkYXlfZnJpZGF5XCIsIDE3OiBcIndlZWtkYXlfc2F0dXJkYXlcIiwgMTg6IFwid2Vla2RheV9zdW5kYXlcIiwgMjA6IFwid2Vla2VuZF9mcmlkYXlcIiwgMjE6IFwid2Vla2VuZF9zYXR1cmRheVwiLCAyMjogXCJkYXRlRm9ybWF0XCIsIDIzOiBcImluY2x1c2l2ZUVuZERhdGVzXCIsIDI0OiBcInRvcEF4aXNcIiwgMjU6IFwiYXhpc0Zvcm1hdFwiLCAyNjogXCJ0aWNrSW50ZXJ2YWxcIiwgMjc6IFwiZXhjbHVkZXNcIiwgMjg6IFwiaW5jbHVkZXNcIiwgMjk6IFwidG9kYXlNYXJrZXJcIiwgMzA6IFwidGl0bGVcIiwgMzE6IFwiYWNjX3RpdGxlXCIsIDMyOiBcImFjY190aXRsZV92YWx1ZVwiLCAzMzogXCJhY2NfZGVzY3JcIiwgMzQ6IFwiYWNjX2Rlc2NyX3ZhbHVlXCIsIDM1OiBcImFjY19kZXNjcl9tdWx0aWxpbmVfdmFsdWVcIiwgMzY6IFwic2VjdGlvblwiLCAzODogXCJ0YXNrVHh0XCIsIDM5OiBcInRhc2tEYXRhXCIsIDQwOiBcImNsaWNrXCIsIDQxOiBcImNhbGxiYWNrbmFtZVwiLCA0MjogXCJjYWxsYmFja2FyZ3NcIiwgNDM6IFwiaHJlZlwiIH0sXG4gICAgcHJvZHVjdGlvbnNfOiBbMCwgWzMsIDNdLCBbNSwgMF0sIFs1LCAyXSwgWzcsIDJdLCBbNywgMV0sIFs3LCAxXSwgWzcsIDFdLCBbMTEsIDFdLCBbMTEsIDFdLCBbMTEsIDFdLCBbMTEsIDFdLCBbMTEsIDFdLCBbMTEsIDFdLCBbMTEsIDFdLCBbMTksIDFdLCBbMTksIDFdLCBbOSwgMV0sIFs5LCAxXSwgWzksIDFdLCBbOSwgMV0sIFs5LCAxXSwgWzksIDFdLCBbOSwgMV0sIFs5LCAxXSwgWzksIDFdLCBbOSwgMV0sIFs5LCAxXSwgWzksIDJdLCBbOSwgMl0sIFs5LCAxXSwgWzksIDFdLCBbOSwgMV0sIFs5LCAyXSwgWzM3LCAyXSwgWzM3LCAzXSwgWzM3LCAzXSwgWzM3LCA0XSwgWzM3LCAzXSwgWzM3LCA0XSwgWzM3LCAyXSwgWzQ0LCAyXSwgWzQ0LCAzXSwgWzQ0LCAzXSwgWzQ0LCA0XSwgWzQ0LCAzXSwgWzQ0LCA0XSwgWzQ0LCAyXV0sXG4gICAgcGVyZm9ybUFjdGlvbjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBhbm9ueW1vdXMoeXl0ZXh0LCB5eWxlbmcsIHl5bGluZW5vLCB5eSwgeXlzdGF0ZSwgJCQsIF8kKSB7XG4gICAgICB2YXIgJDAgPSAkJC5sZW5ndGggLSAxO1xuICAgICAgc3dpdGNoICh5eXN0YXRlKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICByZXR1cm4gJCRbJDAgLSAxXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIHRoaXMuJCA9IFtdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgJCRbJDAgLSAxXS5wdXNoKCQkWyQwXSk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAxXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDY6XG4gICAgICAgIGNhc2UgNzpcbiAgICAgICAgICB0aGlzLiQgPSBbXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA4OlxuICAgICAgICAgIHl5LnNldFdlZWtkYXkoXCJtb25kYXlcIik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgOTpcbiAgICAgICAgICB5eS5zZXRXZWVrZGF5KFwidHVlc2RheVwiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgICB5eS5zZXRXZWVrZGF5KFwid2VkbmVzZGF5XCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDExOlxuICAgICAgICAgIHl5LnNldFdlZWtkYXkoXCJ0aHVyc2RheVwiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICB5eS5zZXRXZWVrZGF5KFwiZnJpZGF5XCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgIHl5LnNldFdlZWtkYXkoXCJzYXR1cmRheVwiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxNDpcbiAgICAgICAgICB5eS5zZXRXZWVrZGF5KFwic3VuZGF5XCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE1OlxuICAgICAgICAgIHl5LnNldFdlZWtlbmQoXCJmcmlkYXlcIik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTY6XG4gICAgICAgICAgeXkuc2V0V2Vla2VuZChcInNhdHVyZGF5XCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE3OlxuICAgICAgICAgIHl5LnNldERhdGVGb3JtYXQoJCRbJDBdLnN1YnN0cigxMSkpO1xuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXS5zdWJzdHIoMTEpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE4OlxuICAgICAgICAgIHl5LmVuYWJsZUluY2x1c2l2ZUVuZERhdGVzKCk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdLnN1YnN0cigxOCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTk6XG4gICAgICAgICAgeXkuVG9wQXhpcygpO1xuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXS5zdWJzdHIoOCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjA6XG4gICAgICAgICAgeXkuc2V0QXhpc0Zvcm1hdCgkJFskMF0uc3Vic3RyKDExKSk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdLnN1YnN0cigxMSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjE6XG4gICAgICAgICAgeXkuc2V0VGlja0ludGVydmFsKCQkWyQwXS5zdWJzdHIoMTMpKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF0uc3Vic3RyKDEzKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyMjpcbiAgICAgICAgICB5eS5zZXRFeGNsdWRlcygkJFskMF0uc3Vic3RyKDkpKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF0uc3Vic3RyKDkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDIzOlxuICAgICAgICAgIHl5LnNldEluY2x1ZGVzKCQkWyQwXS5zdWJzdHIoOSkpO1xuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXS5zdWJzdHIoOSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjQ6XG4gICAgICAgICAgeXkuc2V0VG9kYXlNYXJrZXIoJCRbJDBdLnN1YnN0cigxMikpO1xuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXS5zdWJzdHIoMTIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI3OlxuICAgICAgICAgIHl5LnNldERpYWdyYW1UaXRsZSgkJFskMF0uc3Vic3RyKDYpKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF0uc3Vic3RyKDYpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI4OlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXS50cmltKCk7XG4gICAgICAgICAgeXkuc2V0QWNjVGl0bGUodGhpcy4kKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOTpcbiAgICAgICAgY2FzZSAzMDpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF0udHJpbSgpO1xuICAgICAgICAgIHl5LnNldEFjY0Rlc2NyaXB0aW9uKHRoaXMuJCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzE6XG4gICAgICAgICAgeXkuYWRkU2VjdGlvbigkJFskMF0uc3Vic3RyKDgpKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF0uc3Vic3RyKDgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDMzOlxuICAgICAgICAgIHl5LmFkZFRhc2soJCRbJDAgLSAxXSwgJCRbJDBdKTtcbiAgICAgICAgICB0aGlzLiQgPSBcInRhc2tcIjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzNDpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDFdO1xuICAgICAgICAgIHl5LnNldENsaWNrRXZlbnQoJCRbJDAgLSAxXSwgJCRbJDBdLCBudWxsKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzNTpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDJdO1xuICAgICAgICAgIHl5LnNldENsaWNrRXZlbnQoJCRbJDAgLSAyXSwgJCRbJDAgLSAxXSwgJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzNjpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDJdO1xuICAgICAgICAgIHl5LnNldENsaWNrRXZlbnQoJCRbJDAgLSAyXSwgJCRbJDAgLSAxXSwgbnVsbCk7XG4gICAgICAgICAgeXkuc2V0TGluaygkJFskMCAtIDJdLCAkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM3OlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gM107XG4gICAgICAgICAgeXkuc2V0Q2xpY2tFdmVudCgkJFskMCAtIDNdLCAkJFskMCAtIDJdLCAkJFskMCAtIDFdKTtcbiAgICAgICAgICB5eS5zZXRMaW5rKCQkWyQwIC0gM10sICQkWyQwXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzg6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAyXTtcbiAgICAgICAgICB5eS5zZXRDbGlja0V2ZW50KCQkWyQwIC0gMl0sICQkWyQwXSwgbnVsbCk7XG4gICAgICAgICAgeXkuc2V0TGluaygkJFskMCAtIDJdLCAkJFskMCAtIDFdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOTpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDNdO1xuICAgICAgICAgIHl5LnNldENsaWNrRXZlbnQoJCRbJDAgLSAzXSwgJCRbJDAgLSAxXSwgJCRbJDBdKTtcbiAgICAgICAgICB5eS5zZXRMaW5rKCQkWyQwIC0gM10sICQkWyQwIC0gMl0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQwOlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gMV07XG4gICAgICAgICAgeXkuc2V0TGluaygkJFskMCAtIDFdLCAkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQxOlxuICAgICAgICBjYXNlIDQ3OlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gMV0gKyBcIiBcIiArICQkWyQwXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0MjpcbiAgICAgICAgY2FzZSA0MzpcbiAgICAgICAgY2FzZSA0NTpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDJdICsgXCIgXCIgKyAkJFskMCAtIDFdICsgXCIgXCIgKyAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDQ6XG4gICAgICAgIGNhc2UgNDY6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAzXSArIFwiIFwiICsgJCRbJDAgLSAyXSArIFwiIFwiICsgJCRbJDAgLSAxXSArIFwiIFwiICsgJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0sIFwiYW5vbnltb3VzXCIpLFxuICAgIHRhYmxlOiBbeyAzOiAxLCA0OiBbMSwgMl0gfSwgeyAxOiBbM10gfSwgbygkVjAsIFsyLCAyXSwgeyA1OiAzIH0pLCB7IDY6IFsxLCA0XSwgNzogNSwgODogWzEsIDZdLCA5OiA3LCAxMDogWzEsIDhdLCAxMTogMTcsIDEyOiAkVjEsIDEzOiAkVjIsIDE0OiAkVjMsIDE1OiAkVjQsIDE2OiAkVjUsIDE3OiAkVjYsIDE4OiAkVjcsIDE5OiAxOCwgMjA6ICRWOCwgMjE6ICRWOSwgMjI6ICRWYSwgMjM6ICRWYiwgMjQ6ICRWYywgMjU6ICRWZCwgMjY6ICRWZSwgMjc6ICRWZiwgMjg6ICRWZywgMjk6ICRWaCwgMzA6ICRWaSwgMzE6ICRWaiwgMzM6ICRWaywgMzU6ICRWbCwgMzY6ICRWbSwgMzc6IDI0LCAzODogJFZuLCA0MDogJFZvIH0sIG8oJFYwLCBbMiwgN10sIHsgMTogWzIsIDFdIH0pLCBvKCRWMCwgWzIsIDNdKSwgeyA5OiAzNiwgMTE6IDE3LCAxMjogJFYxLCAxMzogJFYyLCAxNDogJFYzLCAxNTogJFY0LCAxNjogJFY1LCAxNzogJFY2LCAxODogJFY3LCAxOTogMTgsIDIwOiAkVjgsIDIxOiAkVjksIDIyOiAkVmEsIDIzOiAkVmIsIDI0OiAkVmMsIDI1OiAkVmQsIDI2OiAkVmUsIDI3OiAkVmYsIDI4OiAkVmcsIDI5OiAkVmgsIDMwOiAkVmksIDMxOiAkVmosIDMzOiAkVmssIDM1OiAkVmwsIDM2OiAkVm0sIDM3OiAyNCwgMzg6ICRWbiwgNDA6ICRWbyB9LCBvKCRWMCwgWzIsIDVdKSwgbygkVjAsIFsyLCA2XSksIG8oJFYwLCBbMiwgMTddKSwgbygkVjAsIFsyLCAxOF0pLCBvKCRWMCwgWzIsIDE5XSksIG8oJFYwLCBbMiwgMjBdKSwgbygkVjAsIFsyLCAyMV0pLCBvKCRWMCwgWzIsIDIyXSksIG8oJFYwLCBbMiwgMjNdKSwgbygkVjAsIFsyLCAyNF0pLCBvKCRWMCwgWzIsIDI1XSksIG8oJFYwLCBbMiwgMjZdKSwgbygkVjAsIFsyLCAyN10pLCB7IDMyOiBbMSwgMzddIH0sIHsgMzQ6IFsxLCAzOF0gfSwgbygkVjAsIFsyLCAzMF0pLCBvKCRWMCwgWzIsIDMxXSksIG8oJFYwLCBbMiwgMzJdKSwgeyAzOTogWzEsIDM5XSB9LCBvKCRWMCwgWzIsIDhdKSwgbygkVjAsIFsyLCA5XSksIG8oJFYwLCBbMiwgMTBdKSwgbygkVjAsIFsyLCAxMV0pLCBvKCRWMCwgWzIsIDEyXSksIG8oJFYwLCBbMiwgMTNdKSwgbygkVjAsIFsyLCAxNF0pLCBvKCRWMCwgWzIsIDE1XSksIG8oJFYwLCBbMiwgMTZdKSwgeyA0MTogWzEsIDQwXSwgNDM6IFsxLCA0MV0gfSwgbygkVjAsIFsyLCA0XSksIG8oJFYwLCBbMiwgMjhdKSwgbygkVjAsIFsyLCAyOV0pLCBvKCRWMCwgWzIsIDMzXSksIG8oJFYwLCBbMiwgMzRdLCB7IDQyOiBbMSwgNDJdLCA0MzogWzEsIDQzXSB9KSwgbygkVjAsIFsyLCA0MF0sIHsgNDE6IFsxLCA0NF0gfSksIG8oJFYwLCBbMiwgMzVdLCB7IDQzOiBbMSwgNDVdIH0pLCBvKCRWMCwgWzIsIDM2XSksIG8oJFYwLCBbMiwgMzhdLCB7IDQyOiBbMSwgNDZdIH0pLCBvKCRWMCwgWzIsIDM3XSksIG8oJFYwLCBbMiwgMzldKV0sXG4gICAgZGVmYXVsdEFjdGlvbnM6IHt9LFxuICAgIHBhcnNlRXJyb3I6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcGFyc2VFcnJvcihzdHIsIGhhc2gpIHtcbiAgICAgIGlmIChoYXNoLnJlY292ZXJhYmxlKSB7XG4gICAgICAgIHRoaXMudHJhY2Uoc3RyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBlcnJvciA9IG5ldyBFcnJvcihzdHIpO1xuICAgICAgICBlcnJvci5oYXNoID0gaGFzaDtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSwgXCJwYXJzZUVycm9yXCIpLFxuICAgIHBhcnNlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHBhcnNlKGlucHV0KSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMsIHN0YWNrID0gWzBdLCB0c3RhY2sgPSBbXSwgdnN0YWNrID0gW251bGxdLCBsc3RhY2sgPSBbXSwgdGFibGUgPSB0aGlzLnRhYmxlLCB5eXRleHQgPSBcIlwiLCB5eWxpbmVubyA9IDAsIHl5bGVuZyA9IDAsIHJlY292ZXJpbmcgPSAwLCBURVJST1IgPSAyLCBFT0YgPSAxO1xuICAgICAgdmFyIGFyZ3MgPSBsc3RhY2suc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgdmFyIGxleGVyMiA9IE9iamVjdC5jcmVhdGUodGhpcy5sZXhlcik7XG4gICAgICB2YXIgc2hhcmVkU3RhdGUgPSB7IHl5OiB7fSB9O1xuICAgICAgZm9yICh2YXIgayBpbiB0aGlzLnl5KSB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy55eSwgaykpIHtcbiAgICAgICAgICBzaGFyZWRTdGF0ZS55eVtrXSA9IHRoaXMueXlba107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxleGVyMi5zZXRJbnB1dChpbnB1dCwgc2hhcmVkU3RhdGUueXkpO1xuICAgICAgc2hhcmVkU3RhdGUueXkubGV4ZXIgPSBsZXhlcjI7XG4gICAgICBzaGFyZWRTdGF0ZS55eS5wYXJzZXIgPSB0aGlzO1xuICAgICAgaWYgKHR5cGVvZiBsZXhlcjIueXlsbG9jID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgbGV4ZXIyLnl5bGxvYyA9IHt9O1xuICAgICAgfVxuICAgICAgdmFyIHl5bG9jID0gbGV4ZXIyLnl5bGxvYztcbiAgICAgIGxzdGFjay5wdXNoKHl5bG9jKTtcbiAgICAgIHZhciByYW5nZXMgPSBsZXhlcjIub3B0aW9ucyAmJiBsZXhlcjIub3B0aW9ucy5yYW5nZXM7XG4gICAgICBpZiAodHlwZW9mIHNoYXJlZFN0YXRlLnl5LnBhcnNlRXJyb3IgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0aGlzLnBhcnNlRXJyb3IgPSBzaGFyZWRTdGF0ZS55eS5wYXJzZUVycm9yO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wYXJzZUVycm9yID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpLnBhcnNlRXJyb3I7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBwb3BTdGFjayhuKSB7XG4gICAgICAgIHN0YWNrLmxlbmd0aCA9IHN0YWNrLmxlbmd0aCAtIDIgKiBuO1xuICAgICAgICB2c3RhY2subGVuZ3RoID0gdnN0YWNrLmxlbmd0aCAtIG47XG4gICAgICAgIGxzdGFjay5sZW5ndGggPSBsc3RhY2subGVuZ3RoIC0gbjtcbiAgICAgIH1cbiAgICAgIF9fbmFtZShwb3BTdGFjaywgXCJwb3BTdGFja1wiKTtcbiAgICAgIGZ1bmN0aW9uIGxleCgpIHtcbiAgICAgICAgdmFyIHRva2VuO1xuICAgICAgICB0b2tlbiA9IHRzdGFjay5wb3AoKSB8fCBsZXhlcjIubGV4KCkgfHwgRU9GO1xuICAgICAgICBpZiAodHlwZW9mIHRva2VuICE9PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgaWYgKHRva2VuIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIHRzdGFjayA9IHRva2VuO1xuICAgICAgICAgICAgdG9rZW4gPSB0c3RhY2sucG9wKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRva2VuID0gc2VsZi5zeW1ib2xzX1t0b2tlbl0gfHwgdG9rZW47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgICAgfVxuICAgICAgX19uYW1lKGxleCwgXCJsZXhcIik7XG4gICAgICB2YXIgc3ltYm9sLCBwcmVFcnJvclN5bWJvbCwgc3RhdGUsIGFjdGlvbiwgYSwgciwgeXl2YWwgPSB7fSwgcCwgbGVuLCBuZXdTdGF0ZSwgZXhwZWN0ZWQ7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBzdGF0ZSA9IHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAodGhpcy5kZWZhdWx0QWN0aW9uc1tzdGF0ZV0pIHtcbiAgICAgICAgICBhY3Rpb24gPSB0aGlzLmRlZmF1bHRBY3Rpb25zW3N0YXRlXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoc3ltYm9sID09PSBudWxsIHx8IHR5cGVvZiBzeW1ib2wgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgc3ltYm9sID0gbGV4KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGFjdGlvbiA9IHRhYmxlW3N0YXRlXSAmJiB0YWJsZVtzdGF0ZV1bc3ltYm9sXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGFjdGlvbiA9PT0gXCJ1bmRlZmluZWRcIiB8fCAhYWN0aW9uLmxlbmd0aCB8fCAhYWN0aW9uWzBdKSB7XG4gICAgICAgICAgdmFyIGVyclN0ciA9IFwiXCI7XG4gICAgICAgICAgZXhwZWN0ZWQgPSBbXTtcbiAgICAgICAgICBmb3IgKHAgaW4gdGFibGVbc3RhdGVdKSB7XG4gICAgICAgICAgICBpZiAodGhpcy50ZXJtaW5hbHNfW3BdICYmIHAgPiBURVJST1IpIHtcbiAgICAgICAgICAgICAgZXhwZWN0ZWQucHVzaChcIidcIiArIHRoaXMudGVybWluYWxzX1twXSArIFwiJ1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGxleGVyMi5zaG93UG9zaXRpb24pIHtcbiAgICAgICAgICAgIGVyclN0ciA9IFwiUGFyc2UgZXJyb3Igb24gbGluZSBcIiArICh5eWxpbmVubyArIDEpICsgXCI6XFxuXCIgKyBsZXhlcjIuc2hvd1Bvc2l0aW9uKCkgKyBcIlxcbkV4cGVjdGluZyBcIiArIGV4cGVjdGVkLmpvaW4oXCIsIFwiKSArIFwiLCBnb3QgJ1wiICsgKHRoaXMudGVybWluYWxzX1tzeW1ib2xdIHx8IHN5bWJvbCkgKyBcIidcIjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXJyU3RyID0gXCJQYXJzZSBlcnJvciBvbiBsaW5lIFwiICsgKHl5bGluZW5vICsgMSkgKyBcIjogVW5leHBlY3RlZCBcIiArIChzeW1ib2wgPT0gRU9GID8gXCJlbmQgb2YgaW5wdXRcIiA6IFwiJ1wiICsgKHRoaXMudGVybWluYWxzX1tzeW1ib2xdIHx8IHN5bWJvbCkgKyBcIidcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMucGFyc2VFcnJvcihlcnJTdHIsIHtcbiAgICAgICAgICAgIHRleHQ6IGxleGVyMi5tYXRjaCxcbiAgICAgICAgICAgIHRva2VuOiB0aGlzLnRlcm1pbmFsc19bc3ltYm9sXSB8fCBzeW1ib2wsXG4gICAgICAgICAgICBsaW5lOiBsZXhlcjIueXlsaW5lbm8sXG4gICAgICAgICAgICBsb2M6IHl5bG9jLFxuICAgICAgICAgICAgZXhwZWN0ZWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYWN0aW9uWzBdIGluc3RhbmNlb2YgQXJyYXkgJiYgYWN0aW9uLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJzZSBFcnJvcjogbXVsdGlwbGUgYWN0aW9ucyBwb3NzaWJsZSBhdCBzdGF0ZTogXCIgKyBzdGF0ZSArIFwiLCB0b2tlbjogXCIgKyBzeW1ib2wpO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAoYWN0aW9uWzBdKSB7XG4gICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgc3RhY2sucHVzaChzeW1ib2wpO1xuICAgICAgICAgICAgdnN0YWNrLnB1c2gobGV4ZXIyLnl5dGV4dCk7XG4gICAgICAgICAgICBsc3RhY2sucHVzaChsZXhlcjIueXlsbG9jKTtcbiAgICAgICAgICAgIHN0YWNrLnB1c2goYWN0aW9uWzFdKTtcbiAgICAgICAgICAgIHN5bWJvbCA9IG51bGw7XG4gICAgICAgICAgICBpZiAoIXByZUVycm9yU3ltYm9sKSB7XG4gICAgICAgICAgICAgIHl5bGVuZyA9IGxleGVyMi55eWxlbmc7XG4gICAgICAgICAgICAgIHl5dGV4dCA9IGxleGVyMi55eXRleHQ7XG4gICAgICAgICAgICAgIHl5bGluZW5vID0gbGV4ZXIyLnl5bGluZW5vO1xuICAgICAgICAgICAgICB5eWxvYyA9IGxleGVyMi55eWxsb2M7XG4gICAgICAgICAgICAgIGlmIChyZWNvdmVyaW5nID4gMCkge1xuICAgICAgICAgICAgICAgIHJlY292ZXJpbmctLTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc3ltYm9sID0gcHJlRXJyb3JTeW1ib2w7XG4gICAgICAgICAgICAgIHByZUVycm9yU3ltYm9sID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIGxlbiA9IHRoaXMucHJvZHVjdGlvbnNfW2FjdGlvblsxXV1bMV07XG4gICAgICAgICAgICB5eXZhbC4kID0gdnN0YWNrW3ZzdGFjay5sZW5ndGggLSBsZW5dO1xuICAgICAgICAgICAgeXl2YWwuXyQgPSB7XG4gICAgICAgICAgICAgIGZpcnN0X2xpbmU6IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gKGxlbiB8fCAxKV0uZmlyc3RfbGluZSxcbiAgICAgICAgICAgICAgbGFzdF9saW5lOiBsc3RhY2tbbHN0YWNrLmxlbmd0aCAtIDFdLmxhc3RfbGluZSxcbiAgICAgICAgICAgICAgZmlyc3RfY29sdW1uOiBsc3RhY2tbbHN0YWNrLmxlbmd0aCAtIChsZW4gfHwgMSldLmZpcnN0X2NvbHVtbixcbiAgICAgICAgICAgICAgbGFzdF9jb2x1bW46IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gMV0ubGFzdF9jb2x1bW5cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAocmFuZ2VzKSB7XG4gICAgICAgICAgICAgIHl5dmFsLl8kLnJhbmdlID0gW1xuICAgICAgICAgICAgICAgIGxzdGFja1tsc3RhY2subGVuZ3RoIC0gKGxlbiB8fCAxKV0ucmFuZ2VbMF0sXG4gICAgICAgICAgICAgICAgbHN0YWNrW2xzdGFjay5sZW5ndGggLSAxXS5yYW5nZVsxXVxuICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgciA9IHRoaXMucGVyZm9ybUFjdGlvbi5hcHBseSh5eXZhbCwgW1xuICAgICAgICAgICAgICB5eXRleHQsXG4gICAgICAgICAgICAgIHl5bGVuZyxcbiAgICAgICAgICAgICAgeXlsaW5lbm8sXG4gICAgICAgICAgICAgIHNoYXJlZFN0YXRlLnl5LFxuICAgICAgICAgICAgICBhY3Rpb25bMV0sXG4gICAgICAgICAgICAgIHZzdGFjayxcbiAgICAgICAgICAgICAgbHN0YWNrXG4gICAgICAgICAgICBdLmNvbmNhdChhcmdzKSk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobGVuKSB7XG4gICAgICAgICAgICAgIHN0YWNrID0gc3RhY2suc2xpY2UoMCwgLTEgKiBsZW4gKiAyKTtcbiAgICAgICAgICAgICAgdnN0YWNrID0gdnN0YWNrLnNsaWNlKDAsIC0xICogbGVuKTtcbiAgICAgICAgICAgICAgbHN0YWNrID0gbHN0YWNrLnNsaWNlKDAsIC0xICogbGVuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0YWNrLnB1c2godGhpcy5wcm9kdWN0aW9uc19bYWN0aW9uWzFdXVswXSk7XG4gICAgICAgICAgICB2c3RhY2sucHVzaCh5eXZhbC4kKTtcbiAgICAgICAgICAgIGxzdGFjay5wdXNoKHl5dmFsLl8kKTtcbiAgICAgICAgICAgIG5ld1N0YXRlID0gdGFibGVbc3RhY2tbc3RhY2subGVuZ3RoIC0gMl1dW3N0YWNrW3N0YWNrLmxlbmd0aCAtIDFdXTtcbiAgICAgICAgICAgIHN0YWNrLnB1c2gobmV3U3RhdGUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sIFwicGFyc2VcIilcbiAgfTtcbiAgdmFyIGxleGVyID0gLyogQF9fUFVSRV9fICovIChmdW5jdGlvbigpIHtcbiAgICB2YXIgbGV4ZXIyID0ge1xuICAgICAgRU9GOiAxLFxuICAgICAgcGFyc2VFcnJvcjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBwYXJzZUVycm9yKHN0ciwgaGFzaCkge1xuICAgICAgICBpZiAodGhpcy55eS5wYXJzZXIpIHtcbiAgICAgICAgICB0aGlzLnl5LnBhcnNlci5wYXJzZUVycm9yKHN0ciwgaGFzaCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHN0cik7XG4gICAgICAgIH1cbiAgICAgIH0sIFwicGFyc2VFcnJvclwiKSxcbiAgICAgIC8vIHJlc2V0cyB0aGUgbGV4ZXIsIHNldHMgbmV3IGlucHV0XG4gICAgICBzZXRJbnB1dDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihpbnB1dCwgeXkpIHtcbiAgICAgICAgdGhpcy55eSA9IHl5IHx8IHRoaXMueXkgfHwge307XG4gICAgICAgIHRoaXMuX2lucHV0ID0gaW5wdXQ7XG4gICAgICAgIHRoaXMuX21vcmUgPSB0aGlzLl9iYWNrdHJhY2sgPSB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy55eWxpbmVubyA9IHRoaXMueXlsZW5nID0gMDtcbiAgICAgICAgdGhpcy55eXRleHQgPSB0aGlzLm1hdGNoZWQgPSB0aGlzLm1hdGNoID0gXCJcIjtcbiAgICAgICAgdGhpcy5jb25kaXRpb25TdGFjayA9IFtcIklOSVRJQUxcIl07XG4gICAgICAgIHRoaXMueXlsbG9jID0ge1xuICAgICAgICAgIGZpcnN0X2xpbmU6IDEsXG4gICAgICAgICAgZmlyc3RfY29sdW1uOiAwLFxuICAgICAgICAgIGxhc3RfbGluZTogMSxcbiAgICAgICAgICBsYXN0X2NvbHVtbjogMFxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJhbmdlcykge1xuICAgICAgICAgIHRoaXMueXlsbG9jLnJhbmdlID0gWzAsIDBdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub2Zmc2V0ID0gMDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LCBcInNldElucHV0XCIpLFxuICAgICAgLy8gY29uc3VtZXMgYW5kIHJldHVybnMgb25lIGNoYXIgZnJvbSB0aGUgaW5wdXRcbiAgICAgIGlucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2ggPSB0aGlzLl9pbnB1dFswXTtcbiAgICAgICAgdGhpcy55eXRleHQgKz0gY2g7XG4gICAgICAgIHRoaXMueXlsZW5nKys7XG4gICAgICAgIHRoaXMub2Zmc2V0Kys7XG4gICAgICAgIHRoaXMubWF0Y2ggKz0gY2g7XG4gICAgICAgIHRoaXMubWF0Y2hlZCArPSBjaDtcbiAgICAgICAgdmFyIGxpbmVzID0gY2gubWF0Y2goLyg/Olxcclxcbj98XFxuKS4qL2cpO1xuICAgICAgICBpZiAobGluZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGluZW5vKys7XG4gICAgICAgICAgdGhpcy55eWxsb2MubGFzdF9saW5lKys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MubGFzdF9jb2x1bW4rKztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJhbmdlcykge1xuICAgICAgICAgIHRoaXMueXlsbG9jLnJhbmdlWzFdKys7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faW5wdXQgPSB0aGlzLl9pbnB1dC5zbGljZSgxKTtcbiAgICAgICAgcmV0dXJuIGNoO1xuICAgICAgfSwgXCJpbnB1dFwiKSxcbiAgICAgIC8vIHVuc2hpZnRzIG9uZSBjaGFyIChvciBhIHN0cmluZykgaW50byB0aGUgaW5wdXRcbiAgICAgIHVucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGNoKSB7XG4gICAgICAgIHZhciBsZW4gPSBjaC5sZW5ndGg7XG4gICAgICAgIHZhciBsaW5lcyA9IGNoLnNwbGl0KC8oPzpcXHJcXG4/fFxcbikvZyk7XG4gICAgICAgIHRoaXMuX2lucHV0ID0gY2ggKyB0aGlzLl9pbnB1dDtcbiAgICAgICAgdGhpcy55eXRleHQgPSB0aGlzLnl5dGV4dC5zdWJzdHIoMCwgdGhpcy55eXRleHQubGVuZ3RoIC0gbGVuKTtcbiAgICAgICAgdGhpcy5vZmZzZXQgLT0gbGVuO1xuICAgICAgICB2YXIgb2xkTGluZXMgPSB0aGlzLm1hdGNoLnNwbGl0KC8oPzpcXHJcXG4/fFxcbikvZyk7XG4gICAgICAgIHRoaXMubWF0Y2ggPSB0aGlzLm1hdGNoLnN1YnN0cigwLCB0aGlzLm1hdGNoLmxlbmd0aCAtIDEpO1xuICAgICAgICB0aGlzLm1hdGNoZWQgPSB0aGlzLm1hdGNoZWQuc3Vic3RyKDAsIHRoaXMubWF0Y2hlZC5sZW5ndGggLSAxKTtcbiAgICAgICAgaWYgKGxpbmVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICB0aGlzLnl5bGluZW5vIC09IGxpbmVzLmxlbmd0aCAtIDE7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHIgPSB0aGlzLnl5bGxvYy5yYW5nZTtcbiAgICAgICAgdGhpcy55eWxsb2MgPSB7XG4gICAgICAgICAgZmlyc3RfbGluZTogdGhpcy55eWxsb2MuZmlyc3RfbGluZSxcbiAgICAgICAgICBsYXN0X2xpbmU6IHRoaXMueXlsaW5lbm8gKyAxLFxuICAgICAgICAgIGZpcnN0X2NvbHVtbjogdGhpcy55eWxsb2MuZmlyc3RfY29sdW1uLFxuICAgICAgICAgIGxhc3RfY29sdW1uOiBsaW5lcyA/IChsaW5lcy5sZW5ndGggPT09IG9sZExpbmVzLmxlbmd0aCA/IHRoaXMueXlsbG9jLmZpcnN0X2NvbHVtbiA6IDApICsgb2xkTGluZXNbb2xkTGluZXMubGVuZ3RoIC0gbGluZXMubGVuZ3RoXS5sZW5ndGggLSBsaW5lc1swXS5sZW5ndGggOiB0aGlzLnl5bGxvYy5maXJzdF9jb2x1bW4gLSBsZW5cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5yYW5nZSA9IFtyWzBdLCByWzBdICsgdGhpcy55eWxlbmcgLSBsZW5dO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMueXlsZW5nID0gdGhpcy55eXRleHQubGVuZ3RoO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sIFwidW5wdXRcIiksXG4gICAgICAvLyBXaGVuIGNhbGxlZCBmcm9tIGFjdGlvbiwgY2FjaGVzIG1hdGNoZWQgdGV4dCBhbmQgYXBwZW5kcyBpdCBvbiBuZXh0IGFjdGlvblxuICAgICAgbW9yZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fbW9yZSA9IHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgXCJtb3JlXCIpLFxuICAgICAgLy8gV2hlbiBjYWxsZWQgZnJvbSBhY3Rpb24sIHNpZ25hbHMgdGhlIGxleGVyIHRoYXQgdGhpcyBydWxlIGZhaWxzIHRvIG1hdGNoIHRoZSBpbnB1dCwgc28gdGhlIG5leHQgbWF0Y2hpbmcgcnVsZSAocmVnZXgpIHNob3VsZCBiZSB0ZXN0ZWQgaW5zdGVhZC5cbiAgICAgIHJlamVjdDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5iYWNrdHJhY2tfbGV4ZXIpIHtcbiAgICAgICAgICB0aGlzLl9iYWNrdHJhY2sgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRXJyb3IoXCJMZXhpY2FsIGVycm9yIG9uIGxpbmUgXCIgKyAodGhpcy55eWxpbmVubyArIDEpICsgXCIuIFlvdSBjYW4gb25seSBpbnZva2UgcmVqZWN0KCkgaW4gdGhlIGxleGVyIHdoZW4gdGhlIGxleGVyIGlzIG9mIHRoZSBiYWNrdHJhY2tpbmcgcGVyc3Vhc2lvbiAob3B0aW9ucy5iYWNrdHJhY2tfbGV4ZXIgPSB0cnVlKS5cXG5cIiArIHRoaXMuc2hvd1Bvc2l0aW9uKCksIHtcbiAgICAgICAgICAgIHRleHQ6IFwiXCIsXG4gICAgICAgICAgICB0b2tlbjogbnVsbCxcbiAgICAgICAgICAgIGxpbmU6IHRoaXMueXlsaW5lbm9cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sIFwicmVqZWN0XCIpLFxuICAgICAgLy8gcmV0YWluIGZpcnN0IG4gY2hhcmFjdGVycyBvZiB0aGUgbWF0Y2hcbiAgICAgIGxlc3M6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24obikge1xuICAgICAgICB0aGlzLnVucHV0KHRoaXMubWF0Y2guc2xpY2UobikpO1xuICAgICAgfSwgXCJsZXNzXCIpLFxuICAgICAgLy8gZGlzcGxheXMgYWxyZWFkeSBtYXRjaGVkIGlucHV0LCBpLmUuIGZvciBlcnJvciBtZXNzYWdlc1xuICAgICAgcGFzdElucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcGFzdCA9IHRoaXMubWF0Y2hlZC5zdWJzdHIoMCwgdGhpcy5tYXRjaGVkLmxlbmd0aCAtIHRoaXMubWF0Y2gubGVuZ3RoKTtcbiAgICAgICAgcmV0dXJuIChwYXN0Lmxlbmd0aCA+IDIwID8gXCIuLi5cIiA6IFwiXCIpICsgcGFzdC5zdWJzdHIoLTIwKS5yZXBsYWNlKC9cXG4vZywgXCJcIik7XG4gICAgICB9LCBcInBhc3RJbnB1dFwiKSxcbiAgICAgIC8vIGRpc3BsYXlzIHVwY29taW5nIGlucHV0LCBpLmUuIGZvciBlcnJvciBtZXNzYWdlc1xuICAgICAgdXBjb21pbmdJbnB1dDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG5leHQgPSB0aGlzLm1hdGNoO1xuICAgICAgICBpZiAobmV4dC5sZW5ndGggPCAyMCkge1xuICAgICAgICAgIG5leHQgKz0gdGhpcy5faW5wdXQuc3Vic3RyKDAsIDIwIC0gbmV4dC5sZW5ndGgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAobmV4dC5zdWJzdHIoMCwgMjApICsgKG5leHQubGVuZ3RoID4gMjAgPyBcIi4uLlwiIDogXCJcIikpLnJlcGxhY2UoL1xcbi9nLCBcIlwiKTtcbiAgICAgIH0sIFwidXBjb21pbmdJbnB1dFwiKSxcbiAgICAgIC8vIGRpc3BsYXlzIHRoZSBjaGFyYWN0ZXIgcG9zaXRpb24gd2hlcmUgdGhlIGxleGluZyBlcnJvciBvY2N1cnJlZCwgaS5lLiBmb3IgZXJyb3IgbWVzc2FnZXNcbiAgICAgIHNob3dQb3NpdGlvbjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHByZSA9IHRoaXMucGFzdElucHV0KCk7XG4gICAgICAgIHZhciBjID0gbmV3IEFycmF5KHByZS5sZW5ndGggKyAxKS5qb2luKFwiLVwiKTtcbiAgICAgICAgcmV0dXJuIHByZSArIHRoaXMudXBjb21pbmdJbnB1dCgpICsgXCJcXG5cIiArIGMgKyBcIl5cIjtcbiAgICAgIH0sIFwic2hvd1Bvc2l0aW9uXCIpLFxuICAgICAgLy8gdGVzdCB0aGUgbGV4ZWQgdG9rZW46IHJldHVybiBGQUxTRSB3aGVuIG5vdCBhIG1hdGNoLCBvdGhlcndpc2UgcmV0dXJuIHRva2VuXG4gICAgICB0ZXN0X21hdGNoOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKG1hdGNoLCBpbmRleGVkX3J1bGUpIHtcbiAgICAgICAgdmFyIHRva2VuLCBsaW5lcywgYmFja3VwO1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmJhY2t0cmFja19sZXhlcikge1xuICAgICAgICAgIGJhY2t1cCA9IHtcbiAgICAgICAgICAgIHl5bGluZW5vOiB0aGlzLnl5bGluZW5vLFxuICAgICAgICAgICAgeXlsbG9jOiB7XG4gICAgICAgICAgICAgIGZpcnN0X2xpbmU6IHRoaXMueXlsbG9jLmZpcnN0X2xpbmUsXG4gICAgICAgICAgICAgIGxhc3RfbGluZTogdGhpcy5sYXN0X2xpbmUsXG4gICAgICAgICAgICAgIGZpcnN0X2NvbHVtbjogdGhpcy55eWxsb2MuZmlyc3RfY29sdW1uLFxuICAgICAgICAgICAgICBsYXN0X2NvbHVtbjogdGhpcy55eWxsb2MubGFzdF9jb2x1bW5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB5eXRleHQ6IHRoaXMueXl0ZXh0LFxuICAgICAgICAgICAgbWF0Y2g6IHRoaXMubWF0Y2gsXG4gICAgICAgICAgICBtYXRjaGVzOiB0aGlzLm1hdGNoZXMsXG4gICAgICAgICAgICBtYXRjaGVkOiB0aGlzLm1hdGNoZWQsXG4gICAgICAgICAgICB5eWxlbmc6IHRoaXMueXlsZW5nLFxuICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgIF9tb3JlOiB0aGlzLl9tb3JlLFxuICAgICAgICAgICAgX2lucHV0OiB0aGlzLl9pbnB1dCxcbiAgICAgICAgICAgIHl5OiB0aGlzLnl5LFxuICAgICAgICAgICAgY29uZGl0aW9uU3RhY2s6IHRoaXMuY29uZGl0aW9uU3RhY2suc2xpY2UoMCksXG4gICAgICAgICAgICBkb25lOiB0aGlzLmRvbmVcbiAgICAgICAgICB9O1xuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgICBiYWNrdXAueXlsbG9jLnJhbmdlID0gdGhpcy55eWxsb2MucmFuZ2Uuc2xpY2UoMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxpbmVzID0gbWF0Y2hbMF0ubWF0Y2goLyg/Olxcclxcbj98XFxuKS4qL2cpO1xuICAgICAgICBpZiAobGluZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGluZW5vICs9IGxpbmVzLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnl5bGxvYyA9IHtcbiAgICAgICAgICBmaXJzdF9saW5lOiB0aGlzLnl5bGxvYy5sYXN0X2xpbmUsXG4gICAgICAgICAgbGFzdF9saW5lOiB0aGlzLnl5bGluZW5vICsgMSxcbiAgICAgICAgICBmaXJzdF9jb2x1bW46IHRoaXMueXlsbG9jLmxhc3RfY29sdW1uLFxuICAgICAgICAgIGxhc3RfY29sdW1uOiBsaW5lcyA/IGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdLmxlbmd0aCAtIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdLm1hdGNoKC9cXHI/XFxuPy8pWzBdLmxlbmd0aCA6IHRoaXMueXlsbG9jLmxhc3RfY29sdW1uICsgbWF0Y2hbMF0ubGVuZ3RoXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMueXl0ZXh0ICs9IG1hdGNoWzBdO1xuICAgICAgICB0aGlzLm1hdGNoICs9IG1hdGNoWzBdO1xuICAgICAgICB0aGlzLm1hdGNoZXMgPSBtYXRjaDtcbiAgICAgICAgdGhpcy55eWxlbmcgPSB0aGlzLnl5dGV4dC5sZW5ndGg7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MucmFuZ2UgPSBbdGhpcy5vZmZzZXQsIHRoaXMub2Zmc2V0ICs9IHRoaXMueXlsZW5nXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9tb3JlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2JhY2t0cmFjayA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9pbnB1dCA9IHRoaXMuX2lucHV0LnNsaWNlKG1hdGNoWzBdLmxlbmd0aCk7XG4gICAgICAgIHRoaXMubWF0Y2hlZCArPSBtYXRjaFswXTtcbiAgICAgICAgdG9rZW4gPSB0aGlzLnBlcmZvcm1BY3Rpb24uY2FsbCh0aGlzLCB0aGlzLnl5LCB0aGlzLCBpbmRleGVkX3J1bGUsIHRoaXMuY29uZGl0aW9uU3RhY2tbdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxXSk7XG4gICAgICAgIGlmICh0aGlzLmRvbmUgJiYgdGhpcy5faW5wdXQpIHtcbiAgICAgICAgICB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodG9rZW4pIHtcbiAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYmFja3RyYWNrKSB7XG4gICAgICAgICAgZm9yICh2YXIgayBpbiBiYWNrdXApIHtcbiAgICAgICAgICAgIHRoaXNba10gPSBiYWNrdXBba107XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LCBcInRlc3RfbWF0Y2hcIiksXG4gICAgICAvLyByZXR1cm4gbmV4dCBtYXRjaCBpbiBpbnB1dFxuICAgICAgbmV4dDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLkVPRjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX2lucHV0KSB7XG4gICAgICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdG9rZW4sIG1hdGNoLCB0ZW1wTWF0Y2gsIGluZGV4O1xuICAgICAgICBpZiAoIXRoaXMuX21vcmUpIHtcbiAgICAgICAgICB0aGlzLnl5dGV4dCA9IFwiXCI7XG4gICAgICAgICAgdGhpcy5tYXRjaCA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJ1bGVzID0gdGhpcy5fY3VycmVudFJ1bGVzKCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcnVsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB0ZW1wTWF0Y2ggPSB0aGlzLl9pbnB1dC5tYXRjaCh0aGlzLnJ1bGVzW3J1bGVzW2ldXSk7XG4gICAgICAgICAgaWYgKHRlbXBNYXRjaCAmJiAoIW1hdGNoIHx8IHRlbXBNYXRjaFswXS5sZW5ndGggPiBtYXRjaFswXS5sZW5ndGgpKSB7XG4gICAgICAgICAgICBtYXRjaCA9IHRlbXBNYXRjaDtcbiAgICAgICAgICAgIGluZGV4ID0gaTtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYmFja3RyYWNrX2xleGVyKSB7XG4gICAgICAgICAgICAgIHRva2VuID0gdGhpcy50ZXN0X21hdGNoKHRlbXBNYXRjaCwgcnVsZXNbaV0pO1xuICAgICAgICAgICAgICBpZiAodG9rZW4gIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JhY2t0cmFjaykge1xuICAgICAgICAgICAgICAgIG1hdGNoID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLm9wdGlvbnMuZmxleCkge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgdG9rZW4gPSB0aGlzLnRlc3RfbWF0Y2gobWF0Y2gsIHJ1bGVzW2luZGV4XSk7XG4gICAgICAgICAgaWYgKHRva2VuICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX2lucHV0ID09PSBcIlwiKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuRU9GO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRXJyb3IoXCJMZXhpY2FsIGVycm9yIG9uIGxpbmUgXCIgKyAodGhpcy55eWxpbmVubyArIDEpICsgXCIuIFVucmVjb2duaXplZCB0ZXh0LlxcblwiICsgdGhpcy5zaG93UG9zaXRpb24oKSwge1xuICAgICAgICAgICAgdGV4dDogXCJcIixcbiAgICAgICAgICAgIHRva2VuOiBudWxsLFxuICAgICAgICAgICAgbGluZTogdGhpcy55eWxpbmVub1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9LCBcIm5leHRcIiksXG4gICAgICAvLyByZXR1cm4gbmV4dCBtYXRjaCB0aGF0IGhhcyBhIHRva2VuXG4gICAgICBsZXg6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gbGV4KCkge1xuICAgICAgICB2YXIgciA9IHRoaXMubmV4dCgpO1xuICAgICAgICBpZiAocikge1xuICAgICAgICAgIHJldHVybiByO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLmxleCgpO1xuICAgICAgICB9XG4gICAgICB9LCBcImxleFwiKSxcbiAgICAgIC8vIGFjdGl2YXRlcyBhIG5ldyBsZXhlciBjb25kaXRpb24gc3RhdGUgKHB1c2hlcyB0aGUgbmV3IGxleGVyIGNvbmRpdGlvbiBzdGF0ZSBvbnRvIHRoZSBjb25kaXRpb24gc3RhY2spXG4gICAgICBiZWdpbjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBiZWdpbihjb25kaXRpb24pIHtcbiAgICAgICAgdGhpcy5jb25kaXRpb25TdGFjay5wdXNoKGNvbmRpdGlvbik7XG4gICAgICB9LCBcImJlZ2luXCIpLFxuICAgICAgLy8gcG9wIHRoZSBwcmV2aW91c2x5IGFjdGl2ZSBsZXhlciBjb25kaXRpb24gc3RhdGUgb2ZmIHRoZSBjb25kaXRpb24gc3RhY2tcbiAgICAgIHBvcFN0YXRlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHBvcFN0YXRlKCkge1xuICAgICAgICB2YXIgbiA9IHRoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMTtcbiAgICAgICAgaWYgKG4gPiAwKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uU3RhY2sucG9wKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uU3RhY2tbMF07XG4gICAgICAgIH1cbiAgICAgIH0sIFwicG9wU3RhdGVcIiksXG4gICAgICAvLyBwcm9kdWNlIHRoZSBsZXhlciBydWxlIHNldCB3aGljaCBpcyBhY3RpdmUgZm9yIHRoZSBjdXJyZW50bHkgYWN0aXZlIGxleGVyIGNvbmRpdGlvbiBzdGF0ZVxuICAgICAgX2N1cnJlbnRSdWxlczogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBfY3VycmVudFJ1bGVzKCkge1xuICAgICAgICBpZiAodGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggJiYgdGhpcy5jb25kaXRpb25TdGFja1t0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAtIDFdKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uc1t0aGlzLmNvbmRpdGlvblN0YWNrW3RoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMV1dLnJ1bGVzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvbnNbXCJJTklUSUFMXCJdLnJ1bGVzO1xuICAgICAgICB9XG4gICAgICB9LCBcIl9jdXJyZW50UnVsZXNcIiksXG4gICAgICAvLyByZXR1cm4gdGhlIGN1cnJlbnRseSBhY3RpdmUgbGV4ZXIgY29uZGl0aW9uIHN0YXRlOyB3aGVuIGFuIGluZGV4IGFyZ3VtZW50IGlzIHByb3ZpZGVkIGl0IHByb2R1Y2VzIHRoZSBOLXRoIHByZXZpb3VzIGNvbmRpdGlvbiBzdGF0ZSwgaWYgYXZhaWxhYmxlXG4gICAgICB0b3BTdGF0ZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiB0b3BTdGF0ZShuKSB7XG4gICAgICAgIG4gPSB0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAtIDEgLSBNYXRoLmFicyhuIHx8IDApO1xuICAgICAgICBpZiAobiA+PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uU3RhY2tbbl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFwiSU5JVElBTFwiO1xuICAgICAgICB9XG4gICAgICB9LCBcInRvcFN0YXRlXCIpLFxuICAgICAgLy8gYWxpYXMgZm9yIGJlZ2luKGNvbmRpdGlvbilcbiAgICAgIHB1c2hTdGF0ZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBwdXNoU3RhdGUoY29uZGl0aW9uKSB7XG4gICAgICAgIHRoaXMuYmVnaW4oY29uZGl0aW9uKTtcbiAgICAgIH0sIFwicHVzaFN0YXRlXCIpLFxuICAgICAgLy8gcmV0dXJuIHRoZSBudW1iZXIgb2Ygc3RhdGVzIGN1cnJlbnRseSBvbiB0aGUgc3RhY2tcbiAgICAgIHN0YXRlU3RhY2tTaXplOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHN0YXRlU3RhY2tTaXplKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGg7XG4gICAgICB9LCBcInN0YXRlU3RhY2tTaXplXCIpLFxuICAgICAgb3B0aW9uczogeyBcImNhc2UtaW5zZW5zaXRpdmVcIjogdHJ1ZSB9LFxuICAgICAgcGVyZm9ybUFjdGlvbjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBhbm9ueW1vdXMoeXksIHl5XywgJGF2b2lkaW5nX25hbWVfY29sbGlzaW9ucywgWVlfU1RBUlQpIHtcbiAgICAgICAgdmFyIFlZU1RBVEUgPSBZWV9TVEFSVDtcbiAgICAgICAgc3dpdGNoICgkYXZvaWRpbmdfbmFtZV9jb2xsaXNpb25zKSB7XG4gICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcIm9wZW5fZGlyZWN0aXZlXCIpO1xuICAgICAgICAgICAgcmV0dXJuIFwib3Blbl9kaXJlY3RpdmVcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJhY2NfdGl0bGVcIik7XG4gICAgICAgICAgICByZXR1cm4gMzE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gXCJhY2NfdGl0bGVfdmFsdWVcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJhY2NfZGVzY3JcIik7XG4gICAgICAgICAgICByZXR1cm4gMzM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gXCJhY2NfZGVzY3JfdmFsdWVcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJhY2NfZGVzY3JfbXVsdGlsaW5lXCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA3OlxuICAgICAgICAgICAgcmV0dXJuIFwiYWNjX2Rlc2NyX211bHRpbGluZV92YWx1ZVwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA5OlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTE6XG4gICAgICAgICAgICByZXR1cm4gMTA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTQ6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiaHJlZlwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTU6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE2OlxuICAgICAgICAgICAgcmV0dXJuIDQzO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxNzpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJjYWxsYmFja25hbWVcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE4OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxOTpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJjYWxsYmFja2FyZ3NcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDIwOlxuICAgICAgICAgICAgcmV0dXJuIDQxO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyMTpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjI6XG4gICAgICAgICAgICByZXR1cm4gNDI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDIzOlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcImNsaWNrXCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyNDpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjU6XG4gICAgICAgICAgICByZXR1cm4gNDA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI2OlxuICAgICAgICAgICAgcmV0dXJuIDQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI3OlxuICAgICAgICAgICAgcmV0dXJuIDIyO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyODpcbiAgICAgICAgICAgIHJldHVybiAyMztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjk6XG4gICAgICAgICAgICByZXR1cm4gMjQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDMwOlxuICAgICAgICAgICAgcmV0dXJuIDI1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzMTpcbiAgICAgICAgICAgIHJldHVybiAyNjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzI6XG4gICAgICAgICAgICByZXR1cm4gMjg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDMzOlxuICAgICAgICAgICAgcmV0dXJuIDI3O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzNDpcbiAgICAgICAgICAgIHJldHVybiAyOTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzU6XG4gICAgICAgICAgICByZXR1cm4gMTI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM2OlxuICAgICAgICAgICAgcmV0dXJuIDEzO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzNzpcbiAgICAgICAgICAgIHJldHVybiAxNDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzg6XG4gICAgICAgICAgICByZXR1cm4gMTU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM5OlxuICAgICAgICAgICAgcmV0dXJuIDE2O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0MDpcbiAgICAgICAgICAgIHJldHVybiAxNztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDE6XG4gICAgICAgICAgICByZXR1cm4gMTg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQyOlxuICAgICAgICAgICAgcmV0dXJuIDIwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0MzpcbiAgICAgICAgICAgIHJldHVybiAyMTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDQ6XG4gICAgICAgICAgICByZXR1cm4gXCJkYXRlXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQ1OlxuICAgICAgICAgICAgcmV0dXJuIDMwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0NjpcbiAgICAgICAgICAgIHJldHVybiBcImFjY0Rlc2NyaXB0aW9uXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQ3OlxuICAgICAgICAgICAgcmV0dXJuIDM2O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0ODpcbiAgICAgICAgICAgIHJldHVybiAzODtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDk6XG4gICAgICAgICAgICByZXR1cm4gMzk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDUwOlxuICAgICAgICAgICAgcmV0dXJuIFwiOlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1MTpcbiAgICAgICAgICAgIHJldHVybiA2O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1MjpcbiAgICAgICAgICAgIHJldHVybiBcIklOVkFMSURcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9LCBcImFub255bW91c1wiKSxcbiAgICAgIHJ1bGVzOiBbL14oPzolJVxceykvaSwgL14oPzphY2NUaXRsZVxccyo6XFxzKikvaSwgL14oPzooPyFcXG58fCkqW15cXG5dKikvaSwgL14oPzphY2NEZXNjclxccyo6XFxzKikvaSwgL14oPzooPyFcXG58fCkqW15cXG5dKikvaSwgL14oPzphY2NEZXNjclxccypcXHtcXHMqKS9pLCAvXig/OltcXH1dKS9pLCAvXig/OlteXFx9XSopL2ksIC9eKD86JSUoPyFcXHspKlteXFxuXSopL2ksIC9eKD86W15cXH1dJSUqW15cXG5dKikvaSwgL14oPzolJSpbXlxcbl0qW1xcbl0qKS9pLCAvXig/OltcXG5dKykvaSwgL14oPzpcXHMrKS9pLCAvXig/OiVbXlxcbl0qKS9pLCAvXig/OmhyZWZbXFxzXStbXCJdKS9pLCAvXig/OltcIl0pL2ksIC9eKD86W15cIl0qKS9pLCAvXig/OmNhbGxbXFxzXSspL2ksIC9eKD86XFwoW1xcc10qXFwpKS9pLCAvXig/OlxcKCkvaSwgL14oPzpbXihdKikvaSwgL14oPzpcXCkpL2ksIC9eKD86W14pXSopL2ksIC9eKD86Y2xpY2tbXFxzXSspL2ksIC9eKD86W1xcc1xcbl0pL2ksIC9eKD86W15cXHNcXG5dKikvaSwgL14oPzpnYW50dFxcYikvaSwgL14oPzpkYXRlRm9ybWF0XFxzW14jXFxuO10rKS9pLCAvXig/OmluY2x1c2l2ZUVuZERhdGVzXFxiKS9pLCAvXig/OnRvcEF4aXNcXGIpL2ksIC9eKD86YXhpc0Zvcm1hdFxcc1teI1xcbjtdKykvaSwgL14oPzp0aWNrSW50ZXJ2YWxcXHNbXiNcXG47XSspL2ksIC9eKD86aW5jbHVkZXNcXHNbXiNcXG47XSspL2ksIC9eKD86ZXhjbHVkZXNcXHNbXiNcXG47XSspL2ksIC9eKD86dG9kYXlNYXJrZXJcXHNbXlxcbjtdKykvaSwgL14oPzp3ZWVrZGF5XFxzK21vbmRheVxcYikvaSwgL14oPzp3ZWVrZGF5XFxzK3R1ZXNkYXlcXGIpL2ksIC9eKD86d2Vla2RheVxccyt3ZWRuZXNkYXlcXGIpL2ksIC9eKD86d2Vla2RheVxccyt0aHVyc2RheVxcYikvaSwgL14oPzp3ZWVrZGF5XFxzK2ZyaWRheVxcYikvaSwgL14oPzp3ZWVrZGF5XFxzK3NhdHVyZGF5XFxiKS9pLCAvXig/OndlZWtkYXlcXHMrc3VuZGF5XFxiKS9pLCAvXig/OndlZWtlbmRcXHMrZnJpZGF5XFxiKS9pLCAvXig/OndlZWtlbmRcXHMrc2F0dXJkYXlcXGIpL2ksIC9eKD86XFxkXFxkXFxkXFxkLVxcZFxcZC1cXGRcXGRcXGIpL2ksIC9eKD86dGl0bGVcXHNbXlxcbl0rKS9pLCAvXig/OmFjY0Rlc2NyaXB0aW9uXFxzW14jXFxuO10rKS9pLCAvXig/OnNlY3Rpb25cXHNbXlxcbl0rKS9pLCAvXig/OlteOlxcbl0rKS9pLCAvXig/OjpbXiNcXG47XSspL2ksIC9eKD86OikvaSwgL14oPzokKS9pLCAvXig/Oi4pL2ldLFxuICAgICAgY29uZGl0aW9uczogeyBcImFjY19kZXNjcl9tdWx0aWxpbmVcIjogeyBcInJ1bGVzXCI6IFs2LCA3XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJhY2NfZGVzY3JcIjogeyBcInJ1bGVzXCI6IFs0XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJhY2NfdGl0bGVcIjogeyBcInJ1bGVzXCI6IFsyXSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJjYWxsYmFja2FyZ3NcIjogeyBcInJ1bGVzXCI6IFsyMSwgMjJdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcImNhbGxiYWNrbmFtZVwiOiB7IFwicnVsZXNcIjogWzE4LCAxOSwgMjBdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcImhyZWZcIjogeyBcInJ1bGVzXCI6IFsxNSwgMTZdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcImNsaWNrXCI6IHsgXCJydWxlc1wiOiBbMjQsIDI1XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJJTklUSUFMXCI6IHsgXCJydWxlc1wiOiBbMCwgMSwgMywgNSwgOCwgOSwgMTAsIDExLCAxMiwgMTMsIDE0LCAxNywgMjMsIDI2LCAyNywgMjgsIDI5LCAzMCwgMzEsIDMyLCAzMywgMzQsIDM1LCAzNiwgMzcsIDM4LCAzOSwgNDAsIDQxLCA0MiwgNDMsIDQ0LCA0NSwgNDYsIDQ3LCA0OCwgNDksIDUwLCA1MSwgNTJdLCBcImluY2x1c2l2ZVwiOiB0cnVlIH0gfVxuICAgIH07XG4gICAgcmV0dXJuIGxleGVyMjtcbiAgfSkoKTtcbiAgcGFyc2VyMi5sZXhlciA9IGxleGVyO1xuICBmdW5jdGlvbiBQYXJzZXIoKSB7XG4gICAgdGhpcy55eSA9IHt9O1xuICB9XG4gIF9fbmFtZShQYXJzZXIsIFwiUGFyc2VyXCIpO1xuICBQYXJzZXIucHJvdG90eXBlID0gcGFyc2VyMjtcbiAgcGFyc2VyMi5QYXJzZXIgPSBQYXJzZXI7XG4gIHJldHVybiBuZXcgUGFyc2VyKCk7XG59KSgpO1xucGFyc2VyLnBhcnNlciA9IHBhcnNlcjtcbnZhciBnYW50dF9kZWZhdWx0ID0gcGFyc2VyO1xuXG4vLyBzcmMvZGlhZ3JhbXMvZ2FudHQvZ2FudHREYi5qc1xuaW1wb3J0IHsgc2FuaXRpemVVcmwgfSBmcm9tIFwiQGJyYWludHJlZS9zYW5pdGl6ZS11cmxcIjtcbmltcG9ydCBkYXlqcyBmcm9tIFwiZGF5anNcIjtcbmltcG9ydCBkYXlqc0lzb1dlZWsgZnJvbSBcImRheWpzL3BsdWdpbi9pc29XZWVrLmpzXCI7XG5pbXBvcnQgZGF5anNDdXN0b21QYXJzZUZvcm1hdCBmcm9tIFwiZGF5anMvcGx1Z2luL2N1c3RvbVBhcnNlRm9ybWF0LmpzXCI7XG5pbXBvcnQgZGF5anNBZHZhbmNlZEZvcm1hdCBmcm9tIFwiZGF5anMvcGx1Z2luL2FkdmFuY2VkRm9ybWF0LmpzXCI7XG5kYXlqcy5leHRlbmQoZGF5anNJc29XZWVrKTtcbmRheWpzLmV4dGVuZChkYXlqc0N1c3RvbVBhcnNlRm9ybWF0KTtcbmRheWpzLmV4dGVuZChkYXlqc0FkdmFuY2VkRm9ybWF0KTtcbnZhciBXRUVLRU5EX1NUQVJUX0RBWSA9IHsgZnJpZGF5OiA1LCBzYXR1cmRheTogNiB9O1xudmFyIGRhdGVGb3JtYXQgPSBcIlwiO1xudmFyIGF4aXNGb3JtYXQgPSBcIlwiO1xudmFyIHRpY2tJbnRlcnZhbCA9IHZvaWQgMDtcbnZhciB0b2RheU1hcmtlciA9IFwiXCI7XG52YXIgaW5jbHVkZXMgPSBbXTtcbnZhciBleGNsdWRlcyA9IFtdO1xudmFyIGxpbmtzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbnZhciBzZWN0aW9ucyA9IFtdO1xudmFyIHRhc2tzID0gW107XG52YXIgY3VycmVudFNlY3Rpb24gPSBcIlwiO1xudmFyIGRpc3BsYXlNb2RlID0gXCJcIjtcbnZhciB0YWdzID0gW1wiYWN0aXZlXCIsIFwiZG9uZVwiLCBcImNyaXRcIiwgXCJtaWxlc3RvbmVcIiwgXCJ2ZXJ0XCJdO1xudmFyIGZ1bnMgPSBbXTtcbnZhciBkaWFncmFtSWQgPSBcIlwiO1xudmFyIGluY2x1c2l2ZUVuZERhdGVzID0gZmFsc2U7XG52YXIgdG9wQXhpcyA9IGZhbHNlO1xudmFyIHdlZWtkYXkgPSBcInN1bmRheVwiO1xudmFyIHdlZWtlbmQgPSBcInNhdHVyZGF5XCI7XG52YXIgbGFzdE9yZGVyID0gMDtcbnZhciBjbGVhcjIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICBzZWN0aW9ucyA9IFtdO1xuICB0YXNrcyA9IFtdO1xuICBjdXJyZW50U2VjdGlvbiA9IFwiXCI7XG4gIGZ1bnMgPSBbXTtcbiAgdGFza0NudCA9IDA7XG4gIGxhc3RUYXNrID0gdm9pZCAwO1xuICBsYXN0VGFza0lEID0gdm9pZCAwO1xuICByYXdUYXNrcyA9IFtdO1xuICBkYXRlRm9ybWF0ID0gXCJcIjtcbiAgYXhpc0Zvcm1hdCA9IFwiXCI7XG4gIGRpc3BsYXlNb2RlID0gXCJcIjtcbiAgdGlja0ludGVydmFsID0gdm9pZCAwO1xuICB0b2RheU1hcmtlciA9IFwiXCI7XG4gIGluY2x1ZGVzID0gW107XG4gIGV4Y2x1ZGVzID0gW107XG4gIGluY2x1c2l2ZUVuZERhdGVzID0gZmFsc2U7XG4gIHRvcEF4aXMgPSBmYWxzZTtcbiAgbGFzdE9yZGVyID0gMDtcbiAgbGlua3MgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICBkaWFncmFtSWQgPSBcIlwiO1xuICBjbGVhcigpO1xuICB3ZWVrZGF5ID0gXCJzdW5kYXlcIjtcbiAgd2Vla2VuZCA9IFwic2F0dXJkYXlcIjtcbn0sIFwiY2xlYXJcIik7XG52YXIgc2V0RGlhZ3JhbUlkID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihpZCkge1xuICBkaWFncmFtSWQgPSBpZDtcbn0sIFwic2V0RGlhZ3JhbUlkXCIpO1xudmFyIHNldEF4aXNGb3JtYXQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKHR4dCkge1xuICBheGlzRm9ybWF0ID0gdHh0O1xufSwgXCJzZXRBeGlzRm9ybWF0XCIpO1xudmFyIGdldEF4aXNGb3JtYXQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICByZXR1cm4gYXhpc0Zvcm1hdDtcbn0sIFwiZ2V0QXhpc0Zvcm1hdFwiKTtcbnZhciBzZXRUaWNrSW50ZXJ2YWwgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKHR4dCkge1xuICB0aWNrSW50ZXJ2YWwgPSB0eHQ7XG59LCBcInNldFRpY2tJbnRlcnZhbFwiKTtcbnZhciBnZXRUaWNrSW50ZXJ2YWwgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGlja0ludGVydmFsO1xufSwgXCJnZXRUaWNrSW50ZXJ2YWxcIik7XG52YXIgc2V0VG9kYXlNYXJrZXIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKHR4dCkge1xuICB0b2RheU1hcmtlciA9IHR4dDtcbn0sIFwic2V0VG9kYXlNYXJrZXJcIik7XG52YXIgZ2V0VG9kYXlNYXJrZXIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdG9kYXlNYXJrZXI7XG59LCBcImdldFRvZGF5TWFya2VyXCIpO1xudmFyIHNldERhdGVGb3JtYXQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKHR4dCkge1xuICBkYXRlRm9ybWF0ID0gdHh0O1xufSwgXCJzZXREYXRlRm9ybWF0XCIpO1xudmFyIGVuYWJsZUluY2x1c2l2ZUVuZERhdGVzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgaW5jbHVzaXZlRW5kRGF0ZXMgPSB0cnVlO1xufSwgXCJlbmFibGVJbmNsdXNpdmVFbmREYXRlc1wiKTtcbnZhciBlbmREYXRlc0FyZUluY2x1c2l2ZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gIHJldHVybiBpbmNsdXNpdmVFbmREYXRlcztcbn0sIFwiZW5kRGF0ZXNBcmVJbmNsdXNpdmVcIik7XG52YXIgZW5hYmxlVG9wQXhpcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gIHRvcEF4aXMgPSB0cnVlO1xufSwgXCJlbmFibGVUb3BBeGlzXCIpO1xudmFyIHRvcEF4aXNFbmFibGVkID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRvcEF4aXM7XG59LCBcInRvcEF4aXNFbmFibGVkXCIpO1xudmFyIHNldERpc3BsYXlNb2RlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbih0eHQpIHtcbiAgZGlzcGxheU1vZGUgPSB0eHQ7XG59LCBcInNldERpc3BsYXlNb2RlXCIpO1xudmFyIGdldERpc3BsYXlNb2RlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGRpc3BsYXlNb2RlO1xufSwgXCJnZXREaXNwbGF5TW9kZVwiKTtcbnZhciBnZXREYXRlRm9ybWF0ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGRhdGVGb3JtYXQ7XG59LCBcImdldERhdGVGb3JtYXRcIik7XG52YXIgc2V0SW5jbHVkZXMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKHR4dCkge1xuICBpbmNsdWRlcyA9IHR4dC50b0xvd2VyQ2FzZSgpLnNwbGl0KC9bXFxzLF0rLyk7XG59LCBcInNldEluY2x1ZGVzXCIpO1xudmFyIGdldEluY2x1ZGVzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGluY2x1ZGVzO1xufSwgXCJnZXRJbmNsdWRlc1wiKTtcbnZhciBzZXRFeGNsdWRlcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24odHh0KSB7XG4gIGV4Y2x1ZGVzID0gdHh0LnRvTG93ZXJDYXNlKCkuc3BsaXQoL1tcXHMsXSsvKTtcbn0sIFwic2V0RXhjbHVkZXNcIik7XG52YXIgZ2V0RXhjbHVkZXMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICByZXR1cm4gZXhjbHVkZXM7XG59LCBcImdldEV4Y2x1ZGVzXCIpO1xudmFyIGdldExpbmtzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGxpbmtzO1xufSwgXCJnZXRMaW5rc1wiKTtcbnZhciBhZGRTZWN0aW9uID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbih0eHQpIHtcbiAgY3VycmVudFNlY3Rpb24gPSB0eHQ7XG4gIHNlY3Rpb25zLnB1c2godHh0KTtcbn0sIFwiYWRkU2VjdGlvblwiKTtcbnZhciBnZXRTZWN0aW9ucyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gIHJldHVybiBzZWN0aW9ucztcbn0sIFwiZ2V0U2VjdGlvbnNcIik7XG52YXIgZ2V0VGFza3MgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICBsZXQgYWxsSXRlbXNQcm9jZXNzZWQgPSBjb21waWxlVGFza3MoKTtcbiAgY29uc3QgbWF4RGVwdGggPSAxMDtcbiAgbGV0IGl0ZXJhdGlvbkNvdW50ID0gMDtcbiAgd2hpbGUgKCFhbGxJdGVtc1Byb2Nlc3NlZCAmJiBpdGVyYXRpb25Db3VudCA8IG1heERlcHRoKSB7XG4gICAgYWxsSXRlbXNQcm9jZXNzZWQgPSBjb21waWxlVGFza3MoKTtcbiAgICBpdGVyYXRpb25Db3VudCsrO1xuICB9XG4gIHRhc2tzID0gcmF3VGFza3M7XG4gIHJldHVybiB0YXNrcztcbn0sIFwiZ2V0VGFza3NcIik7XG52YXIgaXNJbnZhbGlkRGF0ZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oZGF0ZSwgZGF0ZUZvcm1hdDIsIGV4Y2x1ZGVzMiwgaW5jbHVkZXMyKSB7XG4gIGNvbnN0IGZvcm1hdHRlZERhdGUgPSBkYXRlLmZvcm1hdChkYXRlRm9ybWF0Mi50cmltKCkpO1xuICBjb25zdCBkYXRlT25seSA9IGRhdGUuZm9ybWF0KFwiWVlZWS1NTS1ERFwiKTtcbiAgaWYgKGluY2x1ZGVzMi5pbmNsdWRlcyhmb3JtYXR0ZWREYXRlKSB8fCBpbmNsdWRlczIuaW5jbHVkZXMoZGF0ZU9ubHkpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmIChleGNsdWRlczIuaW5jbHVkZXMoXCJ3ZWVrZW5kc1wiKSAmJiAoZGF0ZS5pc29XZWVrZGF5KCkgPT09IFdFRUtFTkRfU1RBUlRfREFZW3dlZWtlbmRdIHx8IGRhdGUuaXNvV2Vla2RheSgpID09PSBXRUVLRU5EX1NUQVJUX0RBWVt3ZWVrZW5kXSArIDEpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKGV4Y2x1ZGVzMi5pbmNsdWRlcyhkYXRlLmZvcm1hdChcImRkZGRcIikudG9Mb3dlckNhc2UoKSkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZXhjbHVkZXMyLmluY2x1ZGVzKGZvcm1hdHRlZERhdGUpIHx8IGV4Y2x1ZGVzMi5pbmNsdWRlcyhkYXRlT25seSk7XG59LCBcImlzSW52YWxpZERhdGVcIik7XG52YXIgc2V0V2Vla2RheSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24odHh0KSB7XG4gIHdlZWtkYXkgPSB0eHQ7XG59LCBcInNldFdlZWtkYXlcIik7XG52YXIgZ2V0V2Vla2RheSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gIHJldHVybiB3ZWVrZGF5O1xufSwgXCJnZXRXZWVrZGF5XCIpO1xudmFyIHNldFdlZWtlbmQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKHN0YXJ0RGF5KSB7XG4gIHdlZWtlbmQgPSBzdGFydERheTtcbn0sIFwic2V0V2Vla2VuZFwiKTtcbnZhciBjaGVja1Rhc2tEYXRlcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24odGFzaywgZGF0ZUZvcm1hdDIsIGV4Y2x1ZGVzMiwgaW5jbHVkZXMyKSB7XG4gIGlmICghZXhjbHVkZXMyLmxlbmd0aCB8fCB0YXNrLm1hbnVhbEVuZFRpbWUpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgbGV0IHN0YXJ0VGltZTtcbiAgaWYgKHRhc2suc3RhcnRUaW1lIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgIHN0YXJ0VGltZSA9IGRheWpzKHRhc2suc3RhcnRUaW1lKTtcbiAgfSBlbHNlIHtcbiAgICBzdGFydFRpbWUgPSBkYXlqcyh0YXNrLnN0YXJ0VGltZSwgZGF0ZUZvcm1hdDIsIHRydWUpO1xuICB9XG4gIHN0YXJ0VGltZSA9IHN0YXJ0VGltZS5hZGQoMSwgXCJkXCIpO1xuICBsZXQgb3JpZ2luYWxFbmRUaW1lO1xuICBpZiAodGFzay5lbmRUaW1lIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgIG9yaWdpbmFsRW5kVGltZSA9IGRheWpzKHRhc2suZW5kVGltZSk7XG4gIH0gZWxzZSB7XG4gICAgb3JpZ2luYWxFbmRUaW1lID0gZGF5anModGFzay5lbmRUaW1lLCBkYXRlRm9ybWF0MiwgdHJ1ZSk7XG4gIH1cbiAgY29uc3QgW2ZpeGVkRW5kVGltZSwgcmVuZGVyRW5kVGltZV0gPSBmaXhUYXNrRGF0ZXMoXG4gICAgc3RhcnRUaW1lLFxuICAgIG9yaWdpbmFsRW5kVGltZSxcbiAgICBkYXRlRm9ybWF0MixcbiAgICBleGNsdWRlczIsXG4gICAgaW5jbHVkZXMyXG4gICk7XG4gIHRhc2suZW5kVGltZSA9IGZpeGVkRW5kVGltZS50b0RhdGUoKTtcbiAgdGFzay5yZW5kZXJFbmRUaW1lID0gcmVuZGVyRW5kVGltZTtcbn0sIFwiY2hlY2tUYXNrRGF0ZXNcIik7XG52YXIgZml4VGFza0RhdGVzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihzdGFydFRpbWUsIGVuZFRpbWUsIGRhdGVGb3JtYXQyLCBleGNsdWRlczIsIGluY2x1ZGVzMikge1xuICBsZXQgaW52YWxpZCA9IGZhbHNlO1xuICBsZXQgcmVuZGVyRW5kVGltZSA9IG51bGw7XG4gIGNvbnN0IG1heEVuZFRpbWUgPSBlbmRUaW1lLmFkZCgxZTQsIFwiZFwiKTtcbiAgd2hpbGUgKHN0YXJ0VGltZSA8PSBlbmRUaW1lKSB7XG4gICAgaWYgKCFpbnZhbGlkKSB7XG4gICAgICByZW5kZXJFbmRUaW1lID0gZW5kVGltZS50b0RhdGUoKTtcbiAgICB9XG4gICAgaW52YWxpZCA9IGlzSW52YWxpZERhdGUoc3RhcnRUaW1lLCBkYXRlRm9ybWF0MiwgZXhjbHVkZXMyLCBpbmNsdWRlczIpO1xuICAgIGlmIChpbnZhbGlkKSB7XG4gICAgICBlbmRUaW1lID0gZW5kVGltZS5hZGQoMSwgXCJkXCIpO1xuICAgICAgaWYgKGVuZFRpbWUgPiBtYXhFbmRUaW1lKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBcIkZhaWxlZCB0byBmaW5kIGEgdmFsaWQgZGF0ZSB0aGF0IHdhcyBub3QgZXhjbHVkZWQgYnkgYGV4Y2x1ZGVzYCBhZnRlciAxMCwwMDAgaXRlcmF0aW9ucy5cIlxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgICBzdGFydFRpbWUgPSBzdGFydFRpbWUuYWRkKDEsIFwiZFwiKTtcbiAgfVxuICByZXR1cm4gW2VuZFRpbWUsIHJlbmRlckVuZFRpbWVdO1xufSwgXCJmaXhUYXNrRGF0ZXNcIik7XG52YXIgZ2V0U3RhcnREYXRlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihwcmV2VGltZSwgZGF0ZUZvcm1hdDIsIHN0cikge1xuICBzdHIgPSBzdHIudHJpbSgpO1xuICBjb25zdCBpc1RpbWVzdGFtcEZvcm1hdCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGZvcm1hdCkgPT4ge1xuICAgIGNvbnN0IHRyaW1tZWRGb3JtYXQgPSBmb3JtYXQudHJpbSgpO1xuICAgIHJldHVybiB0cmltbWVkRm9ybWF0ID09PSBcInhcIiB8fCB0cmltbWVkRm9ybWF0ID09PSBcIlhcIjtcbiAgfSwgXCJpc1RpbWVzdGFtcEZvcm1hdFwiKTtcbiAgaWYgKGlzVGltZXN0YW1wRm9ybWF0KGRhdGVGb3JtYXQyKSAmJiAvXlxcZCskLy50ZXN0KHN0cikpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoTnVtYmVyKHN0cikpO1xuICB9XG4gIGNvbnN0IGFmdGVyUmVQYXR0ZXJuID0gL15hZnRlclxccysoPzxpZHM+W1xcZFxcdy0gXSspLztcbiAgY29uc3QgYWZ0ZXJTdGF0ZW1lbnQgPSBhZnRlclJlUGF0dGVybi5leGVjKHN0cik7XG4gIGlmIChhZnRlclN0YXRlbWVudCAhPT0gbnVsbCkge1xuICAgIGxldCBsYXRlc3RUYXNrID0gbnVsbDtcbiAgICBmb3IgKGNvbnN0IGlkIG9mIGFmdGVyU3RhdGVtZW50Lmdyb3Vwcy5pZHMuc3BsaXQoXCIgXCIpKSB7XG4gICAgICBsZXQgdGFzayA9IGZpbmRUYXNrQnlJZChpZCk7XG4gICAgICBpZiAodGFzayAhPT0gdm9pZCAwICYmICghbGF0ZXN0VGFzayB8fCB0YXNrLmVuZFRpbWUgPiBsYXRlc3RUYXNrLmVuZFRpbWUpKSB7XG4gICAgICAgIGxhdGVzdFRhc2sgPSB0YXNrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAobGF0ZXN0VGFzaykge1xuICAgICAgcmV0dXJuIGxhdGVzdFRhc2suZW5kVGltZTtcbiAgICB9XG4gICAgY29uc3QgdG9kYXkgPSAvKiBAX19QVVJFX18gKi8gbmV3IERhdGUoKTtcbiAgICB0b2RheS5zZXRIb3VycygwLCAwLCAwLCAwKTtcbiAgICByZXR1cm4gdG9kYXk7XG4gIH1cbiAgbGV0IG1EYXRlID0gZGF5anMoc3RyLCBkYXRlRm9ybWF0Mi50cmltKCksIHRydWUpO1xuICBpZiAobURhdGUuaXNWYWxpZCgpKSB7XG4gICAgcmV0dXJuIG1EYXRlLnRvRGF0ZSgpO1xuICB9IGVsc2Uge1xuICAgIGxvZy5kZWJ1ZyhcIkludmFsaWQgZGF0ZTpcIiArIHN0cik7XG4gICAgbG9nLmRlYnVnKFwiV2l0aCBkYXRlIGZvcm1hdDpcIiArIGRhdGVGb3JtYXQyLnRyaW0oKSk7XG4gICAgY29uc3QgZCA9IG5ldyBEYXRlKHN0cik7XG4gICAgaWYgKGQgPT09IHZvaWQgMCB8fCBpc05hTihkLmdldFRpbWUoKSkgfHwgLy8gV2ViS2l0IGJyb3dzZXJzIGNhbiBtaXMtcGFyc2UgaW52YWxpZCBkYXRlcyB0byBiZSByaWRpY3Vsb3VzbHlcbiAgICAvLyBodWdlIG51bWJlcnMsIGUuZy4gbmV3IERhdGUoJzIwMjMwNCcpIGdldHMgcGFyc2VkIGFzIEphbnVhcnkgMSwgMjAyMzA0LlxuICAgIC8vIFRoaXMgY2FuIGNhdXNlIHZpcnR1YWxseSBpbmZpbml0ZSBsb29wcyB3aGlsZSByZW5kZXJpbmcsIHNvIGZvciB0aGVcbiAgICAvLyBwdXJwb3NlcyBvZiBHYW50dCBjaGFydHMgd2UnbGwganVzdCB0cmVhdCBhbnkgZGF0ZSBiZXlvbmQgMTAsMDAwIEFEL0JDIGFzXG4gICAgLy8gaW52YWxpZC5cbiAgICBkLmdldEZ1bGxZZWFyKCkgPCAtMWU0IHx8IGQuZ2V0RnVsbFllYXIoKSA+IDFlNCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBkYXRlOlwiICsgc3RyKTtcbiAgICB9XG4gICAgcmV0dXJuIGQ7XG4gIH1cbn0sIFwiZ2V0U3RhcnREYXRlXCIpO1xudmFyIHBhcnNlRHVyYXRpb24gPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKHN0cikge1xuICBjb25zdCBzdGF0ZW1lbnQgPSAvXihcXGQrKD86XFwuXFxkKyk/KShbTWRobXN3eV18bXMpJC8uZXhlYyhzdHIudHJpbSgpKTtcbiAgaWYgKHN0YXRlbWVudCAhPT0gbnVsbCkge1xuICAgIHJldHVybiBbTnVtYmVyLnBhcnNlRmxvYXQoc3RhdGVtZW50WzFdKSwgc3RhdGVtZW50WzJdXTtcbiAgfVxuICByZXR1cm4gW05hTiwgXCJtc1wiXTtcbn0sIFwicGFyc2VEdXJhdGlvblwiKTtcbnZhciBnZXRFbmREYXRlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihwcmV2VGltZSwgZGF0ZUZvcm1hdDIsIHN0ciwgaW5jbHVzaXZlID0gZmFsc2UpIHtcbiAgc3RyID0gc3RyLnRyaW0oKTtcbiAgY29uc3QgdW50aWxSZVBhdHRlcm4gPSAvXnVudGlsXFxzKyg/PGlkcz5bXFxkXFx3LSBdKykvO1xuICBjb25zdCB1bnRpbFN0YXRlbWVudCA9IHVudGlsUmVQYXR0ZXJuLmV4ZWMoc3RyKTtcbiAgaWYgKHVudGlsU3RhdGVtZW50ICE9PSBudWxsKSB7XG4gICAgbGV0IGVhcmxpZXN0VGFzayA9IG51bGw7XG4gICAgZm9yIChjb25zdCBpZCBvZiB1bnRpbFN0YXRlbWVudC5ncm91cHMuaWRzLnNwbGl0KFwiIFwiKSkge1xuICAgICAgbGV0IHRhc2sgPSBmaW5kVGFza0J5SWQoaWQpO1xuICAgICAgaWYgKHRhc2sgIT09IHZvaWQgMCAmJiAoIWVhcmxpZXN0VGFzayB8fCB0YXNrLnN0YXJ0VGltZSA8IGVhcmxpZXN0VGFzay5zdGFydFRpbWUpKSB7XG4gICAgICAgIGVhcmxpZXN0VGFzayA9IHRhc2s7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChlYXJsaWVzdFRhc2spIHtcbiAgICAgIHJldHVybiBlYXJsaWVzdFRhc2suc3RhcnRUaW1lO1xuICAgIH1cbiAgICBjb25zdCB0b2RheSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgRGF0ZSgpO1xuICAgIHRvZGF5LnNldEhvdXJzKDAsIDAsIDAsIDApO1xuICAgIHJldHVybiB0b2RheTtcbiAgfVxuICBsZXQgcGFyc2VkRGF0ZSA9IGRheWpzKHN0ciwgZGF0ZUZvcm1hdDIudHJpbSgpLCB0cnVlKTtcbiAgaWYgKHBhcnNlZERhdGUuaXNWYWxpZCgpKSB7XG4gICAgaWYgKGluY2x1c2l2ZSkge1xuICAgICAgcGFyc2VkRGF0ZSA9IHBhcnNlZERhdGUuYWRkKDEsIFwiZFwiKTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcnNlZERhdGUudG9EYXRlKCk7XG4gIH1cbiAgbGV0IGVuZFRpbWUgPSBkYXlqcyhwcmV2VGltZSk7XG4gIGNvbnN0IFtkdXJhdGlvblZhbHVlLCBkdXJhdGlvblVuaXRdID0gcGFyc2VEdXJhdGlvbihzdHIpO1xuICBpZiAoIU51bWJlci5pc05hTihkdXJhdGlvblZhbHVlKSkge1xuICAgIGNvbnN0IG5ld0VuZFRpbWUgPSBlbmRUaW1lLmFkZChkdXJhdGlvblZhbHVlLCBkdXJhdGlvblVuaXQpO1xuICAgIGlmIChuZXdFbmRUaW1lLmlzVmFsaWQoKSkge1xuICAgICAgZW5kVGltZSA9IG5ld0VuZFRpbWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBlbmRUaW1lLnRvRGF0ZSgpO1xufSwgXCJnZXRFbmREYXRlXCIpO1xudmFyIHRhc2tDbnQgPSAwO1xudmFyIHBhcnNlSWQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGlkU3RyKSB7XG4gIGlmIChpZFN0ciA9PT0gdm9pZCAwKSB7XG4gICAgdGFza0NudCA9IHRhc2tDbnQgKyAxO1xuICAgIHJldHVybiBcInRhc2tcIiArIHRhc2tDbnQ7XG4gIH1cbiAgcmV0dXJuIGlkU3RyO1xufSwgXCJwYXJzZUlkXCIpO1xudmFyIGNvbXBpbGVEYXRhID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihwcmV2VGFzaywgZGF0YVN0cikge1xuICBsZXQgZHM7XG4gIGlmIChkYXRhU3RyLnN1YnN0cigwLCAxKSA9PT0gXCI6XCIpIHtcbiAgICBkcyA9IGRhdGFTdHIuc3Vic3RyKDEsIGRhdGFTdHIubGVuZ3RoKTtcbiAgfSBlbHNlIHtcbiAgICBkcyA9IGRhdGFTdHI7XG4gIH1cbiAgY29uc3QgZGF0YSA9IGRzLnNwbGl0KFwiLFwiKTtcbiAgY29uc3QgdGFzayA9IHt9O1xuICBnZXRUYXNrVGFncyhkYXRhLCB0YXNrLCB0YWdzKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgZGF0YVtpXSA9IGRhdGFbaV0udHJpbSgpO1xuICB9XG4gIGxldCBlbmRUaW1lRGF0YSA9IFwiXCI7XG4gIHN3aXRjaCAoZGF0YS5sZW5ndGgpIHtcbiAgICBjYXNlIDE6XG4gICAgICB0YXNrLmlkID0gcGFyc2VJZCgpO1xuICAgICAgdGFzay5zdGFydFRpbWUgPSBwcmV2VGFzay5lbmRUaW1lO1xuICAgICAgZW5kVGltZURhdGEgPSBkYXRhWzBdO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAyOlxuICAgICAgdGFzay5pZCA9IHBhcnNlSWQoKTtcbiAgICAgIHRhc2suc3RhcnRUaW1lID0gZ2V0U3RhcnREYXRlKHZvaWQgMCwgZGF0ZUZvcm1hdCwgZGF0YVswXSk7XG4gICAgICBlbmRUaW1lRGF0YSA9IGRhdGFbMV07XG4gICAgICBicmVhaztcbiAgICBjYXNlIDM6XG4gICAgICB0YXNrLmlkID0gcGFyc2VJZChkYXRhWzBdKTtcbiAgICAgIHRhc2suc3RhcnRUaW1lID0gZ2V0U3RhcnREYXRlKHZvaWQgMCwgZGF0ZUZvcm1hdCwgZGF0YVsxXSk7XG4gICAgICBlbmRUaW1lRGF0YSA9IGRhdGFbMl07XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICB9XG4gIGlmIChlbmRUaW1lRGF0YSkge1xuICAgIHRhc2suZW5kVGltZSA9IGdldEVuZERhdGUodGFzay5zdGFydFRpbWUsIGRhdGVGb3JtYXQsIGVuZFRpbWVEYXRhLCBpbmNsdXNpdmVFbmREYXRlcyk7XG4gICAgdGFzay5tYW51YWxFbmRUaW1lID0gZGF5anMoZW5kVGltZURhdGEsIFwiWVlZWS1NTS1ERFwiLCB0cnVlKS5pc1ZhbGlkKCk7XG4gICAgY2hlY2tUYXNrRGF0ZXModGFzaywgZGF0ZUZvcm1hdCwgZXhjbHVkZXMsIGluY2x1ZGVzKTtcbiAgfVxuICByZXR1cm4gdGFzaztcbn0sIFwiY29tcGlsZURhdGFcIik7XG52YXIgcGFyc2VEYXRhID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihwcmV2VGFza0lkLCBkYXRhU3RyKSB7XG4gIGxldCBkcztcbiAgaWYgKGRhdGFTdHIuc3Vic3RyKDAsIDEpID09PSBcIjpcIikge1xuICAgIGRzID0gZGF0YVN0ci5zdWJzdHIoMSwgZGF0YVN0ci5sZW5ndGgpO1xuICB9IGVsc2Uge1xuICAgIGRzID0gZGF0YVN0cjtcbiAgfVxuICBjb25zdCBkYXRhID0gZHMuc3BsaXQoXCIsXCIpO1xuICBjb25zdCB0YXNrID0ge307XG4gIGdldFRhc2tUYWdzKGRhdGEsIHRhc2ssIHRhZ3MpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICBkYXRhW2ldID0gZGF0YVtpXS50cmltKCk7XG4gIH1cbiAgc3dpdGNoIChkYXRhLmxlbmd0aCkge1xuICAgIGNhc2UgMTpcbiAgICAgIHRhc2suaWQgPSBwYXJzZUlkKCk7XG4gICAgICB0YXNrLnN0YXJ0VGltZSA9IHtcbiAgICAgICAgdHlwZTogXCJwcmV2VGFza0VuZFwiLFxuICAgICAgICBpZDogcHJldlRhc2tJZFxuICAgICAgfTtcbiAgICAgIHRhc2suZW5kVGltZSA9IHtcbiAgICAgICAgZGF0YTogZGF0YVswXVxuICAgICAgfTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMjpcbiAgICAgIHRhc2suaWQgPSBwYXJzZUlkKCk7XG4gICAgICB0YXNrLnN0YXJ0VGltZSA9IHtcbiAgICAgICAgdHlwZTogXCJnZXRTdGFydERhdGVcIixcbiAgICAgICAgc3RhcnREYXRhOiBkYXRhWzBdXG4gICAgICB9O1xuICAgICAgdGFzay5lbmRUaW1lID0ge1xuICAgICAgICBkYXRhOiBkYXRhWzFdXG4gICAgICB9O1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAzOlxuICAgICAgdGFzay5pZCA9IHBhcnNlSWQoZGF0YVswXSk7XG4gICAgICB0YXNrLnN0YXJ0VGltZSA9IHtcbiAgICAgICAgdHlwZTogXCJnZXRTdGFydERhdGVcIixcbiAgICAgICAgc3RhcnREYXRhOiBkYXRhWzFdXG4gICAgICB9O1xuICAgICAgdGFzay5lbmRUaW1lID0ge1xuICAgICAgICBkYXRhOiBkYXRhWzJdXG4gICAgICB9O1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgfVxuICByZXR1cm4gdGFzaztcbn0sIFwicGFyc2VEYXRhXCIpO1xudmFyIGxhc3RUYXNrO1xudmFyIGxhc3RUYXNrSUQ7XG52YXIgcmF3VGFza3MgPSBbXTtcbnZhciB0YXNrRGIgPSB7fTtcbnZhciBhZGRUYXNrID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihkZXNjciwgZGF0YSkge1xuICBjb25zdCByYXdUYXNrID0ge1xuICAgIHNlY3Rpb246IGN1cnJlbnRTZWN0aW9uLFxuICAgIHR5cGU6IGN1cnJlbnRTZWN0aW9uLFxuICAgIHByb2Nlc3NlZDogZmFsc2UsXG4gICAgbWFudWFsRW5kVGltZTogZmFsc2UsXG4gICAgcmVuZGVyRW5kVGltZTogbnVsbCxcbiAgICByYXc6IHsgZGF0YSB9LFxuICAgIHRhc2s6IGRlc2NyLFxuICAgIGNsYXNzZXM6IFtdXG4gIH07XG4gIGNvbnN0IHRhc2tJbmZvID0gcGFyc2VEYXRhKGxhc3RUYXNrSUQsIGRhdGEpO1xuICByYXdUYXNrLnJhdy5zdGFydFRpbWUgPSB0YXNrSW5mby5zdGFydFRpbWU7XG4gIHJhd1Rhc2sucmF3LmVuZFRpbWUgPSB0YXNrSW5mby5lbmRUaW1lO1xuICByYXdUYXNrLmlkID0gdGFza0luZm8uaWQ7XG4gIHJhd1Rhc2sucHJldlRhc2tJZCA9IGxhc3RUYXNrSUQ7XG4gIHJhd1Rhc2suYWN0aXZlID0gdGFza0luZm8uYWN0aXZlO1xuICByYXdUYXNrLmRvbmUgPSB0YXNrSW5mby5kb25lO1xuICByYXdUYXNrLmNyaXQgPSB0YXNrSW5mby5jcml0O1xuICByYXdUYXNrLm1pbGVzdG9uZSA9IHRhc2tJbmZvLm1pbGVzdG9uZTtcbiAgcmF3VGFzay52ZXJ0ID0gdGFza0luZm8udmVydDtcbiAgcmF3VGFzay5vcmRlciA9IGxhc3RPcmRlcjtcbiAgbGFzdE9yZGVyKys7XG4gIGNvbnN0IHBvcyA9IHJhd1Rhc2tzLnB1c2gocmF3VGFzayk7XG4gIGxhc3RUYXNrSUQgPSByYXdUYXNrLmlkO1xuICB0YXNrRGJbcmF3VGFzay5pZF0gPSBwb3MgLSAxO1xufSwgXCJhZGRUYXNrXCIpO1xudmFyIGZpbmRUYXNrQnlJZCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oaWQpIHtcbiAgY29uc3QgcG9zID0gdGFza0RiW2lkXTtcbiAgcmV0dXJuIHJhd1Rhc2tzW3Bvc107XG59LCBcImZpbmRUYXNrQnlJZFwiKTtcbnZhciBhZGRUYXNrT3JnID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihkZXNjciwgZGF0YSkge1xuICBjb25zdCBuZXdUYXNrID0ge1xuICAgIHNlY3Rpb246IGN1cnJlbnRTZWN0aW9uLFxuICAgIHR5cGU6IGN1cnJlbnRTZWN0aW9uLFxuICAgIGRlc2NyaXB0aW9uOiBkZXNjcixcbiAgICB0YXNrOiBkZXNjcixcbiAgICBjbGFzc2VzOiBbXVxuICB9O1xuICBjb25zdCB0YXNrSW5mbyA9IGNvbXBpbGVEYXRhKGxhc3RUYXNrLCBkYXRhKTtcbiAgbmV3VGFzay5zdGFydFRpbWUgPSB0YXNrSW5mby5zdGFydFRpbWU7XG4gIG5ld1Rhc2suZW5kVGltZSA9IHRhc2tJbmZvLmVuZFRpbWU7XG4gIG5ld1Rhc2suaWQgPSB0YXNrSW5mby5pZDtcbiAgbmV3VGFzay5hY3RpdmUgPSB0YXNrSW5mby5hY3RpdmU7XG4gIG5ld1Rhc2suZG9uZSA9IHRhc2tJbmZvLmRvbmU7XG4gIG5ld1Rhc2suY3JpdCA9IHRhc2tJbmZvLmNyaXQ7XG4gIG5ld1Rhc2subWlsZXN0b25lID0gdGFza0luZm8ubWlsZXN0b25lO1xuICBuZXdUYXNrLnZlcnQgPSB0YXNrSW5mby52ZXJ0O1xuICBsYXN0VGFzayA9IG5ld1Rhc2s7XG4gIHRhc2tzLnB1c2gobmV3VGFzayk7XG59LCBcImFkZFRhc2tPcmdcIik7XG52YXIgY29tcGlsZVRhc2tzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgY29uc3QgY29tcGlsZVRhc2sgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKHBvcykge1xuICAgIGNvbnN0IHRhc2sgPSByYXdUYXNrc1twb3NdO1xuICAgIGxldCBzdGFydFRpbWUgPSBcIlwiO1xuICAgIHN3aXRjaCAocmF3VGFza3NbcG9zXS5yYXcuc3RhcnRUaW1lLnR5cGUpIHtcbiAgICAgIGNhc2UgXCJwcmV2VGFza0VuZFwiOiB7XG4gICAgICAgIGNvbnN0IHByZXZUYXNrID0gZmluZFRhc2tCeUlkKHRhc2sucHJldlRhc2tJZCk7XG4gICAgICAgIHRhc2suc3RhcnRUaW1lID0gcHJldlRhc2suZW5kVGltZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIFwiZ2V0U3RhcnREYXRlXCI6XG4gICAgICAgIHN0YXJ0VGltZSA9IGdldFN0YXJ0RGF0ZSh2b2lkIDAsIGRhdGVGb3JtYXQsIHJhd1Rhc2tzW3Bvc10ucmF3LnN0YXJ0VGltZS5zdGFydERhdGEpO1xuICAgICAgICBpZiAoc3RhcnRUaW1lKSB7XG4gICAgICAgICAgcmF3VGFza3NbcG9zXS5zdGFydFRpbWUgPSBzdGFydFRpbWU7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGlmIChyYXdUYXNrc1twb3NdLnN0YXJ0VGltZSkge1xuICAgICAgcmF3VGFza3NbcG9zXS5lbmRUaW1lID0gZ2V0RW5kRGF0ZShcbiAgICAgICAgcmF3VGFza3NbcG9zXS5zdGFydFRpbWUsXG4gICAgICAgIGRhdGVGb3JtYXQsXG4gICAgICAgIHJhd1Rhc2tzW3Bvc10ucmF3LmVuZFRpbWUuZGF0YSxcbiAgICAgICAgaW5jbHVzaXZlRW5kRGF0ZXNcbiAgICAgICk7XG4gICAgICBpZiAocmF3VGFza3NbcG9zXS5lbmRUaW1lKSB7XG4gICAgICAgIHJhd1Rhc2tzW3Bvc10ucHJvY2Vzc2VkID0gdHJ1ZTtcbiAgICAgICAgcmF3VGFza3NbcG9zXS5tYW51YWxFbmRUaW1lID0gZGF5anMoXG4gICAgICAgICAgcmF3VGFza3NbcG9zXS5yYXcuZW5kVGltZS5kYXRhLFxuICAgICAgICAgIFwiWVlZWS1NTS1ERFwiLFxuICAgICAgICAgIHRydWVcbiAgICAgICAgKS5pc1ZhbGlkKCk7XG4gICAgICAgIGNoZWNrVGFza0RhdGVzKHJhd1Rhc2tzW3Bvc10sIGRhdGVGb3JtYXQsIGV4Y2x1ZGVzLCBpbmNsdWRlcyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByYXdUYXNrc1twb3NdLnByb2Nlc3NlZDtcbiAgfSwgXCJjb21waWxlVGFza1wiKTtcbiAgbGV0IGFsbFByb2Nlc3NlZCA9IHRydWU7XG4gIGZvciAoY29uc3QgW2ksIHJhd1Rhc2tdIG9mIHJhd1Rhc2tzLmVudHJpZXMoKSkge1xuICAgIGNvbXBpbGVUYXNrKGkpO1xuICAgIGFsbFByb2Nlc3NlZCA9IGFsbFByb2Nlc3NlZCAmJiByYXdUYXNrLnByb2Nlc3NlZDtcbiAgfVxuICByZXR1cm4gYWxsUHJvY2Vzc2VkO1xufSwgXCJjb21waWxlVGFza3NcIik7XG52YXIgc2V0TGluayA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oaWRzLCBfbGlua1N0cikge1xuICBsZXQgbGlua1N0ciA9IF9saW5rU3RyO1xuICBpZiAoZ2V0Q29uZmlnKCkuc2VjdXJpdHlMZXZlbCAhPT0gXCJsb29zZVwiKSB7XG4gICAgbGlua1N0ciA9IHNhbml0aXplVXJsKF9saW5rU3RyKTtcbiAgfVxuICBpZHMuc3BsaXQoXCIsXCIpLmZvckVhY2goZnVuY3Rpb24oaWQpIHtcbiAgICBsZXQgcmF3VGFzayA9IGZpbmRUYXNrQnlJZChpZCk7XG4gICAgaWYgKHJhd1Rhc2sgIT09IHZvaWQgMCkge1xuICAgICAgcHVzaEZ1bihpZCwgKCkgPT4ge1xuICAgICAgICB3aW5kb3cub3BlbihsaW5rU3RyLCBcIl9zZWxmXCIpO1xuICAgICAgfSk7XG4gICAgICBsaW5rcy5zZXQoaWQsIGxpbmtTdHIpO1xuICAgIH1cbiAgfSk7XG4gIHNldENsYXNzKGlkcywgXCJjbGlja2FibGVcIik7XG59LCBcInNldExpbmtcIik7XG52YXIgc2V0Q2xhc3MgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGlkcywgY2xhc3NOYW1lKSB7XG4gIGlkcy5zcGxpdChcIixcIikuZm9yRWFjaChmdW5jdGlvbihpZCkge1xuICAgIGxldCByYXdUYXNrID0gZmluZFRhc2tCeUlkKGlkKTtcbiAgICBpZiAocmF3VGFzayAhPT0gdm9pZCAwKSB7XG4gICAgICByYXdUYXNrLmNsYXNzZXMucHVzaChjbGFzc05hbWUpO1xuICAgIH1cbiAgfSk7XG59LCBcInNldENsYXNzXCIpO1xudmFyIHNldENsaWNrRnVuID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihpZCwgZnVuY3Rpb25OYW1lLCBmdW5jdGlvbkFyZ3MpIHtcbiAgaWYgKGdldENvbmZpZygpLnNlY3VyaXR5TGV2ZWwgIT09IFwibG9vc2VcIikge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoZnVuY3Rpb25OYW1lID09PSB2b2lkIDApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgbGV0IGFyZ0xpc3QgPSBbXTtcbiAgaWYgKHR5cGVvZiBmdW5jdGlvbkFyZ3MgPT09IFwic3RyaW5nXCIpIHtcbiAgICBhcmdMaXN0ID0gZnVuY3Rpb25BcmdzLnNwbGl0KC8sKD89KD86KD86W15cIl0qXCIpezJ9KSpbXlwiXSokKS8pO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJnTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IGl0ZW0gPSBhcmdMaXN0W2ldLnRyaW0oKTtcbiAgICAgIGlmIChpdGVtLnN0YXJ0c1dpdGgoJ1wiJykgJiYgaXRlbS5lbmRzV2l0aCgnXCInKSkge1xuICAgICAgICBpdGVtID0gaXRlbS5zdWJzdHIoMSwgaXRlbS5sZW5ndGggLSAyKTtcbiAgICAgIH1cbiAgICAgIGFyZ0xpc3RbaV0gPSBpdGVtO1xuICAgIH1cbiAgfVxuICBpZiAoYXJnTGlzdC5sZW5ndGggPT09IDApIHtcbiAgICBhcmdMaXN0LnB1c2goaWQpO1xuICB9XG4gIGxldCByYXdUYXNrID0gZmluZFRhc2tCeUlkKGlkKTtcbiAgaWYgKHJhd1Rhc2sgIT09IHZvaWQgMCkge1xuICAgIHB1c2hGdW4oaWQsICgpID0+IHtcbiAgICAgIHV0aWxzX2RlZmF1bHQucnVuRnVuYyhmdW5jdGlvbk5hbWUsIC4uLmFyZ0xpc3QpO1xuICAgIH0pO1xuICB9XG59LCBcInNldENsaWNrRnVuXCIpO1xudmFyIHB1c2hGdW4gPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGlkLCBjYWxsYmFja0Z1bmN0aW9uKSB7XG4gIGZ1bnMucHVzaChcbiAgICBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IHByZWZpeGVkSWQgPSBkaWFncmFtSWQgPyBgJHtkaWFncmFtSWR9LSR7aWR9YCA6IGlkO1xuICAgICAgY29uc3QgZWxlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtpZD1cIiR7cHJlZml4ZWRJZH1cIl1gKTtcbiAgICAgIGlmIChlbGVtICE9PSBudWxsKSB7XG4gICAgICAgIGVsZW0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGNhbGxiYWNrRnVuY3Rpb24oKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IHByZWZpeGVkSWQgPSBkaWFncmFtSWQgPyBgJHtkaWFncmFtSWR9LSR7aWR9YCA6IGlkO1xuICAgICAgY29uc3QgZWxlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtpZD1cIiR7cHJlZml4ZWRJZH0tdGV4dFwiXWApO1xuICAgICAgaWYgKGVsZW0gIT09IG51bGwpIHtcbiAgICAgICAgZWxlbS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgY2FsbGJhY2tGdW5jdGlvbigpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICk7XG59LCBcInB1c2hGdW5cIik7XG52YXIgc2V0Q2xpY2tFdmVudCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oaWRzLCBmdW5jdGlvbk5hbWUsIGZ1bmN0aW9uQXJncykge1xuICBpZHMuc3BsaXQoXCIsXCIpLmZvckVhY2goZnVuY3Rpb24oaWQpIHtcbiAgICBzZXRDbGlja0Z1bihpZCwgZnVuY3Rpb25OYW1lLCBmdW5jdGlvbkFyZ3MpO1xuICB9KTtcbiAgc2V0Q2xhc3MoaWRzLCBcImNsaWNrYWJsZVwiKTtcbn0sIFwic2V0Q2xpY2tFdmVudFwiKTtcbnZhciBiaW5kRnVuY3Rpb25zID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihlbGVtZW50KSB7XG4gIGZ1bnMuZm9yRWFjaChmdW5jdGlvbihmdW4pIHtcbiAgICBmdW4oZWxlbWVudCk7XG4gIH0pO1xufSwgXCJiaW5kRnVuY3Rpb25zXCIpO1xudmFyIGdhbnR0RGJfZGVmYXVsdCA9IHtcbiAgZ2V0Q29uZmlnOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKCgpID0+IGdldENvbmZpZygpLmdhbnR0LCBcImdldENvbmZpZ1wiKSxcbiAgY2xlYXI6IGNsZWFyMixcbiAgc2V0RGF0ZUZvcm1hdCxcbiAgZ2V0RGF0ZUZvcm1hdCxcbiAgZW5hYmxlSW5jbHVzaXZlRW5kRGF0ZXMsXG4gIGVuZERhdGVzQXJlSW5jbHVzaXZlLFxuICBlbmFibGVUb3BBeGlzLFxuICB0b3BBeGlzRW5hYmxlZCxcbiAgc2V0QXhpc0Zvcm1hdCxcbiAgZ2V0QXhpc0Zvcm1hdCxcbiAgc2V0VGlja0ludGVydmFsLFxuICBnZXRUaWNrSW50ZXJ2YWwsXG4gIHNldFRvZGF5TWFya2VyLFxuICBnZXRUb2RheU1hcmtlcixcbiAgc2V0QWNjVGl0bGUsXG4gIGdldEFjY1RpdGxlLFxuICBzZXREaWFncmFtVGl0bGUsXG4gIGdldERpYWdyYW1UaXRsZSxcbiAgc2V0RGlhZ3JhbUlkLFxuICBzZXREaXNwbGF5TW9kZSxcbiAgZ2V0RGlzcGxheU1vZGUsXG4gIHNldEFjY0Rlc2NyaXB0aW9uLFxuICBnZXRBY2NEZXNjcmlwdGlvbixcbiAgYWRkU2VjdGlvbixcbiAgZ2V0U2VjdGlvbnMsXG4gIGdldFRhc2tzLFxuICBhZGRUYXNrLFxuICBmaW5kVGFza0J5SWQsXG4gIGFkZFRhc2tPcmcsXG4gIHNldEluY2x1ZGVzLFxuICBnZXRJbmNsdWRlcyxcbiAgc2V0RXhjbHVkZXMsXG4gIGdldEV4Y2x1ZGVzLFxuICBzZXRDbGlja0V2ZW50LFxuICBzZXRMaW5rLFxuICBnZXRMaW5rcyxcbiAgYmluZEZ1bmN0aW9ucyxcbiAgcGFyc2VEdXJhdGlvbixcbiAgaXNJbnZhbGlkRGF0ZSxcbiAgc2V0V2Vla2RheSxcbiAgZ2V0V2Vla2RheSxcbiAgc2V0V2Vla2VuZFxufTtcbmZ1bmN0aW9uIGdldFRhc2tUYWdzKGRhdGEsIHRhc2ssIHRhZ3MyKSB7XG4gIGxldCBtYXRjaEZvdW5kID0gdHJ1ZTtcbiAgd2hpbGUgKG1hdGNoRm91bmQpIHtcbiAgICBtYXRjaEZvdW5kID0gZmFsc2U7XG4gICAgdGFnczIuZm9yRWFjaChmdW5jdGlvbih0KSB7XG4gICAgICBjb25zdCBwYXR0ZXJuID0gXCJeXFxcXHMqXCIgKyB0ICsgXCJcXFxccyokXCI7XG4gICAgICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAocGF0dGVybik7XG4gICAgICBpZiAoZGF0YVswXS5tYXRjaChyZWdleCkpIHtcbiAgICAgICAgdGFza1t0XSA9IHRydWU7XG4gICAgICAgIGRhdGEuc2hpZnQoMSk7XG4gICAgICAgIG1hdGNoRm91bmQgPSB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5fX25hbWUoZ2V0VGFza1RhZ3MsIFwiZ2V0VGFza1RhZ3NcIik7XG5cbi8vIHNyYy9kaWFncmFtcy9nYW50dC9nYW50dFJlbmRlcmVyLmpzXG5pbXBvcnQgZGF5anMyIGZyb20gXCJkYXlqc1wiO1xuaW1wb3J0IGRheWpzRHVyYXRpb24gZnJvbSBcImRheWpzL3BsdWdpbi9kdXJhdGlvbi5qc1wiO1xuaW1wb3J0IHtcbiAgc2VsZWN0LFxuICBzY2FsZVRpbWUsXG4gIG1pbixcbiAgbWF4LFxuICBzY2FsZUxpbmVhcixcbiAgaW50ZXJwb2xhdGVIY2wsXG4gIGF4aXNCb3R0b20sXG4gIGF4aXNUb3AsXG4gIHRpbWVGb3JtYXQsXG4gIHRpbWVNaWxsaXNlY29uZCxcbiAgdGltZVNlY29uZCxcbiAgdGltZU1pbnV0ZSxcbiAgdGltZUhvdXIsXG4gIHRpbWVEYXksXG4gIHRpbWVNb25kYXksXG4gIHRpbWVUdWVzZGF5LFxuICB0aW1lV2VkbmVzZGF5LFxuICB0aW1lVGh1cnNkYXksXG4gIHRpbWVGcmlkYXksXG4gIHRpbWVTYXR1cmRheSxcbiAgdGltZVN1bmRheSxcbiAgdGltZU1vbnRoXG59IGZyb20gXCJkM1wiO1xuZGF5anMyLmV4dGVuZChkYXlqc0R1cmF0aW9uKTtcbnZhciBzZXRDb25mID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgbG9nLmRlYnVnKFwiU29tZXRoaW5nIGlzIGNhbGxpbmcsIHNldENvbmYsIHJlbW92ZSB0aGUgY2FsbFwiKTtcbn0sIFwic2V0Q29uZlwiKTtcbnZhciBtYXBXZWVrZGF5VG9UaW1lRnVuY3Rpb24gPSB7XG4gIG1vbmRheTogdGltZU1vbmRheSxcbiAgdHVlc2RheTogdGltZVR1ZXNkYXksXG4gIHdlZG5lc2RheTogdGltZVdlZG5lc2RheSxcbiAgdGh1cnNkYXk6IHRpbWVUaHVyc2RheSxcbiAgZnJpZGF5OiB0aW1lRnJpZGF5LFxuICBzYXR1cmRheTogdGltZVNhdHVyZGF5LFxuICBzdW5kYXk6IHRpbWVTdW5kYXlcbn07XG52YXIgZ2V0TWF4SW50ZXJzZWN0aW9ucyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKHRhc2tzMiwgb3JkZXJPZmZzZXQpID0+IHtcbiAgbGV0IHRpbWVsaW5lID0gWy4uLnRhc2tzMl0ubWFwKCgpID0+IC1JbmZpbml0eSk7XG4gIGxldCBzb3J0ZWQgPSBbLi4udGFza3MyXS5zb3J0KChhLCBiKSA9PiBhLnN0YXJ0VGltZSAtIGIuc3RhcnRUaW1lIHx8IGEub3JkZXIgLSBiLm9yZGVyKTtcbiAgbGV0IG1heEludGVyc2VjdGlvbnMgPSAwO1xuICBmb3IgKGNvbnN0IGVsZW1lbnQgb2Ygc29ydGVkKSB7XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aW1lbGluZS5sZW5ndGg7IGorKykge1xuICAgICAgaWYgKGVsZW1lbnQuc3RhcnRUaW1lID49IHRpbWVsaW5lW2pdKSB7XG4gICAgICAgIHRpbWVsaW5lW2pdID0gZWxlbWVudC5lbmRUaW1lO1xuICAgICAgICBlbGVtZW50Lm9yZGVyID0gaiArIG9yZGVyT2Zmc2V0O1xuICAgICAgICBpZiAoaiA+IG1heEludGVyc2VjdGlvbnMpIHtcbiAgICAgICAgICBtYXhJbnRlcnNlY3Rpb25zID0gajtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG1heEludGVyc2VjdGlvbnM7XG59LCBcImdldE1heEludGVyc2VjdGlvbnNcIik7XG52YXIgdztcbnZhciBNQVhfVElDS19DT1VOVCA9IDFlNDtcbnZhciBkcmF3ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbih0ZXh0LCBpZCwgdmVyc2lvbiwgZGlhZ09iaikge1xuICBjb25zdCBjb25mID0gZ2V0Q29uZmlnKCkuZ2FudHQ7XG4gIGRpYWdPYmouZGIuc2V0RGlhZ3JhbUlkKGlkKTtcbiAgY29uc3Qgc2VjdXJpdHlMZXZlbCA9IGdldENvbmZpZygpLnNlY3VyaXR5TGV2ZWw7XG4gIGxldCBzYW5kYm94RWxlbWVudDtcbiAgaWYgKHNlY3VyaXR5TGV2ZWwgPT09IFwic2FuZGJveFwiKSB7XG4gICAgc2FuZGJveEVsZW1lbnQgPSBzZWxlY3QoXCIjaVwiICsgaWQpO1xuICB9XG4gIGNvbnN0IHJvb3QgPSBzZWN1cml0eUxldmVsID09PSBcInNhbmRib3hcIiA/IHNlbGVjdChzYW5kYm94RWxlbWVudC5ub2RlcygpWzBdLmNvbnRlbnREb2N1bWVudC5ib2R5KSA6IHNlbGVjdChcImJvZHlcIik7XG4gIGNvbnN0IGRvYyA9IHNlY3VyaXR5TGV2ZWwgPT09IFwic2FuZGJveFwiID8gc2FuZGJveEVsZW1lbnQubm9kZXMoKVswXS5jb250ZW50RG9jdW1lbnQgOiBkb2N1bWVudDtcbiAgY29uc3QgZWxlbSA9IGRvYy5nZXRFbGVtZW50QnlJZChpZCk7XG4gIHcgPSBlbGVtLnBhcmVudEVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gIGlmICh3ID09PSB2b2lkIDApIHtcbiAgICB3ID0gMTIwMDtcbiAgfVxuICBpZiAoY29uZi51c2VXaWR0aCAhPT0gdm9pZCAwKSB7XG4gICAgdyA9IGNvbmYudXNlV2lkdGg7XG4gIH1cbiAgY29uc3QgdGFza0FycmF5ID0gZGlhZ09iai5kYi5nZXRUYXNrcygpO1xuICBsZXQgY2F0ZWdvcmllcyA9IFtdO1xuICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgdGFza0FycmF5KSB7XG4gICAgY2F0ZWdvcmllcy5wdXNoKGVsZW1lbnQudHlwZSk7XG4gIH1cbiAgY2F0ZWdvcmllcyA9IGNoZWNrVW5pcXVlKGNhdGVnb3JpZXMpO1xuICBjb25zdCBjYXRlZ29yeUhlaWdodHMgPSB7fTtcbiAgbGV0IGggPSAyICogY29uZi50b3BQYWRkaW5nO1xuICBpZiAoZGlhZ09iai5kYi5nZXREaXNwbGF5TW9kZSgpID09PSBcImNvbXBhY3RcIiB8fCBjb25mLmRpc3BsYXlNb2RlID09PSBcImNvbXBhY3RcIikge1xuICAgIGNvbnN0IGNhdGVnb3J5RWxlbWVudHMgPSB7fTtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgdGFza0FycmF5KSB7XG4gICAgICBpZiAoY2F0ZWdvcnlFbGVtZW50c1tlbGVtZW50LnNlY3Rpb25dID09PSB2b2lkIDApIHtcbiAgICAgICAgY2F0ZWdvcnlFbGVtZW50c1tlbGVtZW50LnNlY3Rpb25dID0gW2VsZW1lbnRdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2F0ZWdvcnlFbGVtZW50c1tlbGVtZW50LnNlY3Rpb25dLnB1c2goZWxlbWVudCk7XG4gICAgICB9XG4gICAgfVxuICAgIGxldCBpbnRlcnNlY3Rpb25zID0gMDtcbiAgICBmb3IgKGNvbnN0IGNhdGVnb3J5IG9mIE9iamVjdC5rZXlzKGNhdGVnb3J5RWxlbWVudHMpKSB7XG4gICAgICBjb25zdCBjYXRlZ29yeUhlaWdodCA9IGdldE1heEludGVyc2VjdGlvbnMoY2F0ZWdvcnlFbGVtZW50c1tjYXRlZ29yeV0sIGludGVyc2VjdGlvbnMpICsgMTtcbiAgICAgIGludGVyc2VjdGlvbnMgKz0gY2F0ZWdvcnlIZWlnaHQ7XG4gICAgICBoICs9IGNhdGVnb3J5SGVpZ2h0ICogKGNvbmYuYmFySGVpZ2h0ICsgY29uZi5iYXJHYXApO1xuICAgICAgY2F0ZWdvcnlIZWlnaHRzW2NhdGVnb3J5XSA9IGNhdGVnb3J5SGVpZ2h0O1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBoICs9IHRhc2tBcnJheS5sZW5ndGggKiAoY29uZi5iYXJIZWlnaHQgKyBjb25mLmJhckdhcCk7XG4gICAgZm9yIChjb25zdCBjYXRlZ29yeSBvZiBjYXRlZ29yaWVzKSB7XG4gICAgICBjYXRlZ29yeUhlaWdodHNbY2F0ZWdvcnldID0gdGFza0FycmF5LmZpbHRlcigodGFzaykgPT4gdGFzay50eXBlID09PSBjYXRlZ29yeSkubGVuZ3RoO1xuICAgIH1cbiAgfVxuICBlbGVtLnNldEF0dHJpYnV0ZShcInZpZXdCb3hcIiwgXCIwIDAgXCIgKyB3ICsgXCIgXCIgKyBoKTtcbiAgY29uc3Qgc3ZnID0gcm9vdC5zZWxlY3QoYFtpZD1cIiR7aWR9XCJdYCk7XG4gIGNvbnN0IHRpbWVTY2FsZSA9IHNjYWxlVGltZSgpLmRvbWFpbihbXG4gICAgbWluKHRhc2tBcnJheSwgZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIGQuc3RhcnRUaW1lO1xuICAgIH0pLFxuICAgIG1heCh0YXNrQXJyYXksIGZ1bmN0aW9uKGQpIHtcbiAgICAgIHJldHVybiBkLmVuZFRpbWU7XG4gICAgfSlcbiAgXSkucmFuZ2VSb3VuZChbMCwgdyAtIGNvbmYubGVmdFBhZGRpbmcgLSBjb25mLnJpZ2h0UGFkZGluZ10pO1xuICBmdW5jdGlvbiB0YXNrQ29tcGFyZShhLCBiKSB7XG4gICAgY29uc3QgdGFza0EgPSBhLnN0YXJ0VGltZTtcbiAgICBjb25zdCB0YXNrQiA9IGIuc3RhcnRUaW1lO1xuICAgIGxldCByZXN1bHQgPSAwO1xuICAgIGlmICh0YXNrQSA+IHRhc2tCKSB7XG4gICAgICByZXN1bHQgPSAxO1xuICAgIH0gZWxzZSBpZiAodGFza0EgPCB0YXNrQikge1xuICAgICAgcmVzdWx0ID0gLTE7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgX19uYW1lKHRhc2tDb21wYXJlLCBcInRhc2tDb21wYXJlXCIpO1xuICB0YXNrQXJyYXkuc29ydCh0YXNrQ29tcGFyZSk7XG4gIG1ha2VHYW50dCh0YXNrQXJyYXksIHcsIGgpO1xuICBjb25maWd1cmVTdmdTaXplKHN2ZywgaCwgdywgY29uZi51c2VNYXhXaWR0aCk7XG4gIHN2Zy5hcHBlbmQoXCJ0ZXh0XCIpLnRleHQoZGlhZ09iai5kYi5nZXREaWFncmFtVGl0bGUoKSkuYXR0cihcInhcIiwgdyAvIDIpLmF0dHIoXCJ5XCIsIGNvbmYudGl0bGVUb3BNYXJnaW4pLmF0dHIoXCJjbGFzc1wiLCBcInRpdGxlVGV4dFwiKTtcbiAgZnVuY3Rpb24gbWFrZUdhbnR0KHRhc2tzMiwgcGFnZVdpZHRoLCBwYWdlSGVpZ2h0KSB7XG4gICAgY29uc3QgYmFySGVpZ2h0ID0gY29uZi5iYXJIZWlnaHQ7XG4gICAgY29uc3QgZ2FwID0gYmFySGVpZ2h0ICsgY29uZi5iYXJHYXA7XG4gICAgY29uc3QgdG9wUGFkZGluZyA9IGNvbmYudG9wUGFkZGluZztcbiAgICBjb25zdCBsZWZ0UGFkZGluZyA9IGNvbmYubGVmdFBhZGRpbmc7XG4gICAgY29uc3QgY29sb3JTY2FsZSA9IHNjYWxlTGluZWFyKCkuZG9tYWluKFswLCBjYXRlZ29yaWVzLmxlbmd0aF0pLnJhbmdlKFtcIiMwMEI5RkFcIiwgXCIjRjk1MDAyXCJdKS5pbnRlcnBvbGF0ZShpbnRlcnBvbGF0ZUhjbCk7XG4gICAgZHJhd0V4Y2x1ZGVEYXlzKFxuICAgICAgZ2FwLFxuICAgICAgdG9wUGFkZGluZyxcbiAgICAgIGxlZnRQYWRkaW5nLFxuICAgICAgcGFnZVdpZHRoLFxuICAgICAgcGFnZUhlaWdodCxcbiAgICAgIHRhc2tzMixcbiAgICAgIGRpYWdPYmouZGIuZ2V0RXhjbHVkZXMoKSxcbiAgICAgIGRpYWdPYmouZGIuZ2V0SW5jbHVkZXMoKVxuICAgICk7XG4gICAgbWFrZUdyaWQobGVmdFBhZGRpbmcsIHRvcFBhZGRpbmcsIHBhZ2VXaWR0aCwgcGFnZUhlaWdodCk7XG4gICAgZHJhd1JlY3RzKHRhc2tzMiwgZ2FwLCB0b3BQYWRkaW5nLCBsZWZ0UGFkZGluZywgYmFySGVpZ2h0LCBjb2xvclNjYWxlLCBwYWdlV2lkdGgsIHBhZ2VIZWlnaHQpO1xuICAgIHZlcnRMYWJlbHMoZ2FwLCB0b3BQYWRkaW5nLCBsZWZ0UGFkZGluZywgYmFySGVpZ2h0LCBjb2xvclNjYWxlKTtcbiAgICBkcmF3VG9kYXkobGVmdFBhZGRpbmcsIHRvcFBhZGRpbmcsIHBhZ2VXaWR0aCwgcGFnZUhlaWdodCk7XG4gIH1cbiAgX19uYW1lKG1ha2VHYW50dCwgXCJtYWtlR2FudHRcIik7XG4gIGZ1bmN0aW9uIGRyYXdSZWN0cyh0aGVBcnJheSwgdGhlR2FwLCB0aGVUb3BQYWQsIHRoZVNpZGVQYWQsIHRoZUJhckhlaWdodCwgdGhlQ29sb3JTY2FsZSwgdzIpIHtcbiAgICB0aGVBcnJheS5zb3J0KChhLCBiKSA9PiBhLnZlcnQgPT09IGIudmVydCA/IDAgOiBhLnZlcnQgPyAxIDogLTEpO1xuICAgIGNvbnN0IHVuaXF1ZVRhc2tPcmRlcklkcyA9IFsuLi5uZXcgU2V0KHRoZUFycmF5Lm1hcCgoaXRlbSkgPT4gaXRlbS5vcmRlcikpXTtcbiAgICBjb25zdCB1bmlxdWVUYXNrcyA9IHVuaXF1ZVRhc2tPcmRlcklkcy5tYXAoKGlkMikgPT4gdGhlQXJyYXkuZmluZCgoaXRlbSkgPT4gaXRlbS5vcmRlciA9PT0gaWQyKSk7XG4gICAgc3ZnLmFwcGVuZChcImdcIikuc2VsZWN0QWxsKFwicmVjdFwiKS5kYXRhKHVuaXF1ZVRhc2tzKS5lbnRlcigpLmFwcGVuZChcInJlY3RcIikuYXR0cihcInhcIiwgMCkuYXR0cihcInlcIiwgZnVuY3Rpb24oZCwgaSkge1xuICAgICAgaSA9IGQub3JkZXI7XG4gICAgICByZXR1cm4gaSAqIHRoZUdhcCArIHRoZVRvcFBhZCAtIDI7XG4gICAgfSkuYXR0cihcIndpZHRoXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHcyIC0gY29uZi5yaWdodFBhZGRpbmcgLyAyO1xuICAgIH0pLmF0dHIoXCJoZWlnaHRcIiwgdGhlR2FwKS5hdHRyKFwiY2xhc3NcIiwgZnVuY3Rpb24oZCkge1xuICAgICAgZm9yIChjb25zdCBbaSwgY2F0ZWdvcnldIG9mIGNhdGVnb3JpZXMuZW50cmllcygpKSB7XG4gICAgICAgIGlmIChkLnR5cGUgPT09IGNhdGVnb3J5KSB7XG4gICAgICAgICAgcmV0dXJuIFwic2VjdGlvbiBzZWN0aW9uXCIgKyBpICUgY29uZi5udW1iZXJTZWN0aW9uU3R5bGVzO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gXCJzZWN0aW9uIHNlY3Rpb24wXCI7XG4gICAgfSkuZW50ZXIoKTtcbiAgICBjb25zdCByZWN0YW5nbGVzID0gc3ZnLmFwcGVuZChcImdcIikuc2VsZWN0QWxsKFwicmVjdFwiKS5kYXRhKHRoZUFycmF5KS5lbnRlcigpO1xuICAgIGNvbnN0IGxpbmtzMiA9IGRpYWdPYmouZGIuZ2V0TGlua3MoKTtcbiAgICByZWN0YW5nbGVzLmFwcGVuZChcInJlY3RcIikuYXR0cihcImlkXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgIHJldHVybiBpZCArIFwiLVwiICsgZC5pZDtcbiAgICB9KS5hdHRyKFwicnhcIiwgMykuYXR0cihcInJ5XCIsIDMpLmF0dHIoXCJ4XCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgIGlmIChkLm1pbGVzdG9uZSkge1xuICAgICAgICByZXR1cm4gdGltZVNjYWxlKGQuc3RhcnRUaW1lKSArIHRoZVNpZGVQYWQgKyAwLjUgKiAodGltZVNjYWxlKGQuZW5kVGltZSkgLSB0aW1lU2NhbGUoZC5zdGFydFRpbWUpKSAtIDAuNSAqIHRoZUJhckhlaWdodDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aW1lU2NhbGUoZC5zdGFydFRpbWUpICsgdGhlU2lkZVBhZDtcbiAgICB9KS5hdHRyKFwieVwiLCBmdW5jdGlvbihkLCBpKSB7XG4gICAgICBpID0gZC5vcmRlcjtcbiAgICAgIGlmIChkLnZlcnQpIHtcbiAgICAgICAgcmV0dXJuIGNvbmYuZ3JpZExpbmVTdGFydFBhZGRpbmc7XG4gICAgICB9XG4gICAgICByZXR1cm4gaSAqIHRoZUdhcCArIHRoZVRvcFBhZDtcbiAgICB9KS5hdHRyKFwid2lkdGhcIiwgZnVuY3Rpb24oZCkge1xuICAgICAgaWYgKGQubWlsZXN0b25lKSB7XG4gICAgICAgIHJldHVybiB0aGVCYXJIZWlnaHQ7XG4gICAgICB9XG4gICAgICBpZiAoZC52ZXJ0KSB7XG4gICAgICAgIHJldHVybiAwLjA4ICogdGhlQmFySGVpZ2h0O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRpbWVTY2FsZShkLnJlbmRlckVuZFRpbWUgfHwgZC5lbmRUaW1lKSAtIHRpbWVTY2FsZShkLnN0YXJ0VGltZSk7XG4gICAgfSkuYXR0cihcImhlaWdodFwiLCBmdW5jdGlvbihkKSB7XG4gICAgICBpZiAoZC52ZXJ0KSB7XG4gICAgICAgIHJldHVybiB0YXNrQXJyYXkubGVuZ3RoICogKGNvbmYuYmFySGVpZ2h0ICsgY29uZi5iYXJHYXApICsgY29uZi5iYXJIZWlnaHQgKiAyO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoZUJhckhlaWdodDtcbiAgICB9KS5hdHRyKFwidHJhbnNmb3JtLW9yaWdpblwiLCBmdW5jdGlvbihkLCBpKSB7XG4gICAgICBpID0gZC5vcmRlcjtcbiAgICAgIHJldHVybiAodGltZVNjYWxlKGQuc3RhcnRUaW1lKSArIHRoZVNpZGVQYWQgKyAwLjUgKiAodGltZVNjYWxlKGQuZW5kVGltZSkgLSB0aW1lU2NhbGUoZC5zdGFydFRpbWUpKSkudG9TdHJpbmcoKSArIFwicHggXCIgKyAoaSAqIHRoZUdhcCArIHRoZVRvcFBhZCArIDAuNSAqIHRoZUJhckhlaWdodCkudG9TdHJpbmcoKSArIFwicHhcIjtcbiAgICB9KS5hdHRyKFwiY2xhc3NcIiwgZnVuY3Rpb24oZCkge1xuICAgICAgY29uc3QgcmVzID0gXCJ0YXNrXCI7XG4gICAgICBsZXQgY2xhc3NTdHIgPSBcIlwiO1xuICAgICAgaWYgKGQuY2xhc3Nlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNsYXNzU3RyID0gZC5jbGFzc2VzLmpvaW4oXCIgXCIpO1xuICAgICAgfVxuICAgICAgbGV0IHNlY051bSA9IDA7XG4gICAgICBmb3IgKGNvbnN0IFtpLCBjYXRlZ29yeV0gb2YgY2F0ZWdvcmllcy5lbnRyaWVzKCkpIHtcbiAgICAgICAgaWYgKGQudHlwZSA9PT0gY2F0ZWdvcnkpIHtcbiAgICAgICAgICBzZWNOdW0gPSBpICUgY29uZi5udW1iZXJTZWN0aW9uU3R5bGVzO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsZXQgdGFza0NsYXNzID0gXCJcIjtcbiAgICAgIGlmIChkLmFjdGl2ZSkge1xuICAgICAgICBpZiAoZC5jcml0KSB7XG4gICAgICAgICAgdGFza0NsYXNzICs9IFwiIGFjdGl2ZUNyaXRcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YXNrQ2xhc3MgPSBcIiBhY3RpdmVcIjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChkLmRvbmUpIHtcbiAgICAgICAgaWYgKGQuY3JpdCkge1xuICAgICAgICAgIHRhc2tDbGFzcyA9IFwiIGRvbmVDcml0XCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGFza0NsYXNzID0gXCIgZG9uZVwiO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZC5jcml0KSB7XG4gICAgICAgICAgdGFza0NsYXNzICs9IFwiIGNyaXRcIjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRhc2tDbGFzcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGFza0NsYXNzID0gXCIgdGFza1wiO1xuICAgICAgfVxuICAgICAgaWYgKGQubWlsZXN0b25lKSB7XG4gICAgICAgIHRhc2tDbGFzcyA9IFwiIG1pbGVzdG9uZSBcIiArIHRhc2tDbGFzcztcbiAgICAgIH1cbiAgICAgIGlmIChkLnZlcnQpIHtcbiAgICAgICAgdGFza0NsYXNzID0gXCIgdmVydCBcIiArIHRhc2tDbGFzcztcbiAgICAgIH1cbiAgICAgIHRhc2tDbGFzcyArPSBzZWNOdW07XG4gICAgICB0YXNrQ2xhc3MgKz0gXCIgXCIgKyBjbGFzc1N0cjtcbiAgICAgIHJldHVybiByZXMgKyB0YXNrQ2xhc3M7XG4gICAgfSk7XG4gICAgcmVjdGFuZ2xlcy5hcHBlbmQoXCJ0ZXh0XCIpLmF0dHIoXCJpZFwiLCBmdW5jdGlvbihkKSB7XG4gICAgICByZXR1cm4gaWQgKyBcIi1cIiArIGQuaWQgKyBcIi10ZXh0XCI7XG4gICAgfSkudGV4dChmdW5jdGlvbihkKSB7XG4gICAgICByZXR1cm4gZC50YXNrO1xuICAgIH0pLmF0dHIoXCJmb250LXNpemVcIiwgY29uZi5mb250U2l6ZSkuYXR0cihcInhcIiwgZnVuY3Rpb24oZCkge1xuICAgICAgbGV0IHN0YXJ0WCA9IHRpbWVTY2FsZShkLnN0YXJ0VGltZSk7XG4gICAgICBsZXQgZW5kWCA9IHRpbWVTY2FsZShkLnJlbmRlckVuZFRpbWUgfHwgZC5lbmRUaW1lKTtcbiAgICAgIGlmIChkLm1pbGVzdG9uZSkge1xuICAgICAgICBzdGFydFggKz0gMC41ICogKHRpbWVTY2FsZShkLmVuZFRpbWUpIC0gdGltZVNjYWxlKGQuc3RhcnRUaW1lKSkgLSAwLjUgKiB0aGVCYXJIZWlnaHQ7XG4gICAgICAgIGVuZFggPSBzdGFydFggKyB0aGVCYXJIZWlnaHQ7XG4gICAgICB9XG4gICAgICBpZiAoZC52ZXJ0KSB7XG4gICAgICAgIHJldHVybiB0aW1lU2NhbGUoZC5zdGFydFRpbWUpICsgdGhlU2lkZVBhZDtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHRleHRXaWR0aCA9IHRoaXMuZ2V0QkJveCgpLndpZHRoO1xuICAgICAgaWYgKHRleHRXaWR0aCA+IGVuZFggLSBzdGFydFgpIHtcbiAgICAgICAgaWYgKGVuZFggKyB0ZXh0V2lkdGggKyAxLjUgKiBjb25mLmxlZnRQYWRkaW5nID4gdzIpIHtcbiAgICAgICAgICByZXR1cm4gc3RhcnRYICsgdGhlU2lkZVBhZCAtIDU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGVuZFggKyB0aGVTaWRlUGFkICsgNTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIChlbmRYIC0gc3RhcnRYKSAvIDIgKyBzdGFydFggKyB0aGVTaWRlUGFkO1xuICAgICAgfVxuICAgIH0pLmF0dHIoXCJ5XCIsIGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgIGlmIChkLnZlcnQpIHtcbiAgICAgICAgcmV0dXJuIGNvbmYuZ3JpZExpbmVTdGFydFBhZGRpbmcgKyB0YXNrQXJyYXkubGVuZ3RoICogKGNvbmYuYmFySGVpZ2h0ICsgY29uZi5iYXJHYXApICsgNjA7XG4gICAgICB9XG4gICAgICBpID0gZC5vcmRlcjtcbiAgICAgIHJldHVybiBpICogdGhlR2FwICsgY29uZi5iYXJIZWlnaHQgLyAyICsgKGNvbmYuZm9udFNpemUgLyAyIC0gMikgKyB0aGVUb3BQYWQ7XG4gICAgfSkuYXR0cihcInRleHQtaGVpZ2h0XCIsIHRoZUJhckhlaWdodCkuYXR0cihcImNsYXNzXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgIGNvbnN0IHN0YXJ0WCA9IHRpbWVTY2FsZShkLnN0YXJ0VGltZSk7XG4gICAgICBsZXQgZW5kWCA9IHRpbWVTY2FsZShkLmVuZFRpbWUpO1xuICAgICAgaWYgKGQubWlsZXN0b25lKSB7XG4gICAgICAgIGVuZFggPSBzdGFydFggKyB0aGVCYXJIZWlnaHQ7XG4gICAgICB9XG4gICAgICBjb25zdCB0ZXh0V2lkdGggPSB0aGlzLmdldEJCb3goKS53aWR0aDtcbiAgICAgIGxldCBjbGFzc1N0ciA9IFwiXCI7XG4gICAgICBpZiAoZC5jbGFzc2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY2xhc3NTdHIgPSBkLmNsYXNzZXMuam9pbihcIiBcIik7XG4gICAgICB9XG4gICAgICBsZXQgc2VjTnVtID0gMDtcbiAgICAgIGZvciAoY29uc3QgW2ksIGNhdGVnb3J5XSBvZiBjYXRlZ29yaWVzLmVudHJpZXMoKSkge1xuICAgICAgICBpZiAoZC50eXBlID09PSBjYXRlZ29yeSkge1xuICAgICAgICAgIHNlY051bSA9IGkgJSBjb25mLm51bWJlclNlY3Rpb25TdHlsZXM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxldCB0YXNrVHlwZSA9IFwiXCI7XG4gICAgICBpZiAoZC5hY3RpdmUpIHtcbiAgICAgICAgaWYgKGQuY3JpdCkge1xuICAgICAgICAgIHRhc2tUeXBlID0gXCJhY3RpdmVDcml0VGV4dFwiICsgc2VjTnVtO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRhc2tUeXBlID0gXCJhY3RpdmVUZXh0XCIgKyBzZWNOdW07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChkLmRvbmUpIHtcbiAgICAgICAgaWYgKGQuY3JpdCkge1xuICAgICAgICAgIHRhc2tUeXBlID0gdGFza1R5cGUgKyBcIiBkb25lQ3JpdFRleHRcIiArIHNlY051bTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YXNrVHlwZSA9IHRhc2tUeXBlICsgXCIgZG9uZVRleHRcIiArIHNlY051bTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGQuY3JpdCkge1xuICAgICAgICAgIHRhc2tUeXBlID0gdGFza1R5cGUgKyBcIiBjcml0VGV4dFwiICsgc2VjTnVtO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZC5taWxlc3RvbmUpIHtcbiAgICAgICAgdGFza1R5cGUgKz0gXCIgbWlsZXN0b25lVGV4dFwiO1xuICAgICAgfVxuICAgICAgaWYgKGQudmVydCkge1xuICAgICAgICB0YXNrVHlwZSArPSBcIiB2ZXJ0VGV4dFwiO1xuICAgICAgfVxuICAgICAgaWYgKHRleHRXaWR0aCA+IGVuZFggLSBzdGFydFgpIHtcbiAgICAgICAgaWYgKGVuZFggKyB0ZXh0V2lkdGggKyAxLjUgKiBjb25mLmxlZnRQYWRkaW5nID4gdzIpIHtcbiAgICAgICAgICByZXR1cm4gY2xhc3NTdHIgKyBcIiB0YXNrVGV4dE91dHNpZGVMZWZ0IHRhc2tUZXh0T3V0c2lkZVwiICsgc2VjTnVtICsgXCIgXCIgKyB0YXNrVHlwZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gY2xhc3NTdHIgKyBcIiB0YXNrVGV4dE91dHNpZGVSaWdodCB0YXNrVGV4dE91dHNpZGVcIiArIHNlY051bSArIFwiIFwiICsgdGFza1R5cGUgKyBcIiB3aWR0aC1cIiArIHRleHRXaWR0aDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNsYXNzU3RyICsgXCIgdGFza1RleHQgdGFza1RleHRcIiArIHNlY051bSArIFwiIFwiICsgdGFza1R5cGUgKyBcIiB3aWR0aC1cIiArIHRleHRXaWR0aDtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zdCBzZWN1cml0eUxldmVsMiA9IGdldENvbmZpZygpLnNlY3VyaXR5TGV2ZWw7XG4gICAgaWYgKHNlY3VyaXR5TGV2ZWwyID09PSBcInNhbmRib3hcIikge1xuICAgICAgbGV0IHNhbmRib3hFbGVtZW50MjtcbiAgICAgIHNhbmRib3hFbGVtZW50MiA9IHNlbGVjdChcIiNpXCIgKyBpZCk7XG4gICAgICBjb25zdCBkb2MyID0gc2FuZGJveEVsZW1lbnQyLm5vZGVzKClbMF0uY29udGVudERvY3VtZW50O1xuICAgICAgcmVjdGFuZ2xlcy5maWx0ZXIoZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gbGlua3MyLmhhcyhkLmlkKTtcbiAgICAgIH0pLmVhY2goZnVuY3Rpb24obykge1xuICAgICAgICB2YXIgdGFza1JlY3QgPSBkb2MyLnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyBDU1MuZXNjYXBlKGlkICsgXCItXCIgKyBvLmlkKSk7XG4gICAgICAgIHZhciB0YXNrVGV4dCA9IGRvYzIucXVlcnlTZWxlY3RvcihcIiNcIiArIENTUy5lc2NhcGUoaWQgKyBcIi1cIiArIG8uaWQgKyBcIi10ZXh0XCIpKTtcbiAgICAgICAgY29uc3Qgb2xkUGFyZW50ID0gdGFza1JlY3QucGFyZW50Tm9kZTtcbiAgICAgICAgdmFyIExpbmsgPSBkb2MyLmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgICAgICBMaW5rLnNldEF0dHJpYnV0ZShcInhsaW5rOmhyZWZcIiwgbGlua3MyLmdldChvLmlkKSk7XG4gICAgICAgIExpbmsuc2V0QXR0cmlidXRlKFwidGFyZ2V0XCIsIFwiX3RvcFwiKTtcbiAgICAgICAgb2xkUGFyZW50LmFwcGVuZENoaWxkKExpbmspO1xuICAgICAgICBMaW5rLmFwcGVuZENoaWxkKHRhc2tSZWN0KTtcbiAgICAgICAgTGluay5hcHBlbmRDaGlsZCh0YXNrVGV4dCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgX19uYW1lKGRyYXdSZWN0cywgXCJkcmF3UmVjdHNcIik7XG4gIGZ1bmN0aW9uIGRyYXdFeGNsdWRlRGF5cyh0aGVHYXAsIHRoZVRvcFBhZCwgdGhlU2lkZVBhZCwgdzIsIGgyLCB0YXNrczIsIGV4Y2x1ZGVzMiwgaW5jbHVkZXMyKSB7XG4gICAgaWYgKGV4Y2x1ZGVzMi5sZW5ndGggPT09IDAgJiYgaW5jbHVkZXMyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgbWluVGltZTtcbiAgICBsZXQgbWF4VGltZTtcbiAgICBmb3IgKGNvbnN0IHsgc3RhcnRUaW1lLCBlbmRUaW1lIH0gb2YgdGFza3MyKSB7XG4gICAgICBpZiAobWluVGltZSA9PT0gdm9pZCAwIHx8IHN0YXJ0VGltZSA8IG1pblRpbWUpIHtcbiAgICAgICAgbWluVGltZSA9IHN0YXJ0VGltZTtcbiAgICAgIH1cbiAgICAgIGlmIChtYXhUaW1lID09PSB2b2lkIDAgfHwgZW5kVGltZSA+IG1heFRpbWUpIHtcbiAgICAgICAgbWF4VGltZSA9IGVuZFRpbWU7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghbWluVGltZSB8fCAhbWF4VGltZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZGF5anMyKG1heFRpbWUpLmRpZmYoZGF5anMyKG1pblRpbWUpLCBcInllYXJcIikgPiA1KSB7XG4gICAgICBsb2cud2FybihcbiAgICAgICAgXCJUaGUgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSBtaW4gYW5kIG1heCB0aW1lIGlzIG1vcmUgdGhhbiA1IHllYXJzLiBUaGlzIHdpbGwgY2F1c2UgcGVyZm9ybWFuY2UgaXNzdWVzLiBTa2lwcGluZyBkcmF3aW5nIGV4Y2x1ZGUgZGF5cy5cIlxuICAgICAgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZGF0ZUZvcm1hdDIgPSBkaWFnT2JqLmRiLmdldERhdGVGb3JtYXQoKTtcbiAgICBjb25zdCBleGNsdWRlUmFuZ2VzID0gW107XG4gICAgbGV0IHJhbmdlID0gbnVsbDtcbiAgICBsZXQgZCA9IGRheWpzMihtaW5UaW1lKTtcbiAgICB3aGlsZSAoZC52YWx1ZU9mKCkgPD0gbWF4VGltZSkge1xuICAgICAgaWYgKGRpYWdPYmouZGIuaXNJbnZhbGlkRGF0ZShkLCBkYXRlRm9ybWF0MiwgZXhjbHVkZXMyLCBpbmNsdWRlczIpKSB7XG4gICAgICAgIGlmICghcmFuZ2UpIHtcbiAgICAgICAgICByYW5nZSA9IHtcbiAgICAgICAgICAgIHN0YXJ0OiBkLFxuICAgICAgICAgICAgZW5kOiBkXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByYW5nZS5lbmQgPSBkO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocmFuZ2UpIHtcbiAgICAgICAgICBleGNsdWRlUmFuZ2VzLnB1c2gocmFuZ2UpO1xuICAgICAgICAgIHJhbmdlID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZCA9IGQuYWRkKDEsIFwiZFwiKTtcbiAgICB9XG4gICAgY29uc3QgcmVjdGFuZ2xlcyA9IHN2Zy5hcHBlbmQoXCJnXCIpLnNlbGVjdEFsbChcInJlY3RcIikuZGF0YShleGNsdWRlUmFuZ2VzKS5lbnRlcigpO1xuICAgIHJlY3RhbmdsZXMuYXBwZW5kKFwicmVjdFwiKS5hdHRyKFwiaWRcIiwgKGQyKSA9PiBpZCArIFwiLWV4Y2x1ZGUtXCIgKyBkMi5zdGFydC5mb3JtYXQoXCJZWVlZLU1NLUREXCIpKS5hdHRyKFwieFwiLCAoZDIpID0+IHRpbWVTY2FsZShkMi5zdGFydC5zdGFydE9mKFwiZGF5XCIpKSArIHRoZVNpZGVQYWQpLmF0dHIoXCJ5XCIsIGNvbmYuZ3JpZExpbmVTdGFydFBhZGRpbmcpLmF0dHIoXCJ3aWR0aFwiLCAoZDIpID0+IHRpbWVTY2FsZShkMi5lbmQuZW5kT2YoXCJkYXlcIikpIC0gdGltZVNjYWxlKGQyLnN0YXJ0LnN0YXJ0T2YoXCJkYXlcIikpKS5hdHRyKFwiaGVpZ2h0XCIsIGgyIC0gdGhlVG9wUGFkIC0gY29uZi5ncmlkTGluZVN0YXJ0UGFkZGluZykuYXR0cihcInRyYW5zZm9ybS1vcmlnaW5cIiwgZnVuY3Rpb24oZDIsIGkpIHtcbiAgICAgIHJldHVybiAodGltZVNjYWxlKGQyLnN0YXJ0KSArIHRoZVNpZGVQYWQgKyAwLjUgKiAodGltZVNjYWxlKGQyLmVuZCkgLSB0aW1lU2NhbGUoZDIuc3RhcnQpKSkudG9TdHJpbmcoKSArIFwicHggXCIgKyAoaSAqIHRoZUdhcCArIDAuNSAqIGgyKS50b1N0cmluZygpICsgXCJweFwiO1xuICAgIH0pLmF0dHIoXCJjbGFzc1wiLCBcImV4Y2x1ZGUtcmFuZ2VcIik7XG4gIH1cbiAgX19uYW1lKGRyYXdFeGNsdWRlRGF5cywgXCJkcmF3RXhjbHVkZURheXNcIik7XG4gIGZ1bmN0aW9uIGdldEVzdGltYXRlZFRpY2tDb3VudChtaW5UaW1lLCBtYXhUaW1lLCBldmVyeSwgaW50ZXJ2YWwpIHtcbiAgICBpZiAoZXZlcnkgPD0gMCB8fCBtaW5UaW1lID4gbWF4VGltZSkge1xuICAgICAgcmV0dXJuIEluZmluaXR5O1xuICAgIH1cbiAgICBjb25zdCB0aW1lRGlmZk1zID0gbWF4VGltZSAtIG1pblRpbWU7XG4gICAgY29uc3QgaW50ZXJ2YWxNcyA9IGRheWpzMi5kdXJhdGlvbih7IFtpbnRlcnZhbCA/PyBcImRheVwiXTogZXZlcnkgfSkuYXNNaWxsaXNlY29uZHMoKTtcbiAgICBpZiAoaW50ZXJ2YWxNcyA8PSAwKSB7XG4gICAgICByZXR1cm4gSW5maW5pdHk7XG4gICAgfVxuICAgIHJldHVybiBNYXRoLmNlaWwodGltZURpZmZNcyAvIGludGVydmFsTXMpO1xuICB9XG4gIF9fbmFtZShnZXRFc3RpbWF0ZWRUaWNrQ291bnQsIFwiZ2V0RXN0aW1hdGVkVGlja0NvdW50XCIpO1xuICBmdW5jdGlvbiBtYWtlR3JpZCh0aGVTaWRlUGFkLCB0aGVUb3BQYWQsIHcyLCBoMikge1xuICAgIGNvbnN0IGRhdGVGb3JtYXQyID0gZGlhZ09iai5kYi5nZXREYXRlRm9ybWF0KCk7XG4gICAgY29uc3QgdXNlckF4aXNGb3JtYXQgPSBkaWFnT2JqLmRiLmdldEF4aXNGb3JtYXQoKTtcbiAgICBsZXQgYXhpc0Zvcm1hdDI7XG4gICAgaWYgKHVzZXJBeGlzRm9ybWF0KSB7XG4gICAgICBheGlzRm9ybWF0MiA9IHVzZXJBeGlzRm9ybWF0O1xuICAgIH0gZWxzZSBpZiAoZGF0ZUZvcm1hdDIgPT09IFwiRFwiKSB7XG4gICAgICBheGlzRm9ybWF0MiA9IFwiJWRcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgYXhpc0Zvcm1hdDIgPSBjb25mLmF4aXNGb3JtYXQgPz8gXCIlWS0lbS0lZFwiO1xuICAgIH1cbiAgICBsZXQgYm90dG9tWEF4aXMgPSBheGlzQm90dG9tKHRpbWVTY2FsZSkudGlja1NpemUoLWgyICsgdGhlVG9wUGFkICsgY29uZi5ncmlkTGluZVN0YXJ0UGFkZGluZykudGlja0Zvcm1hdCh0aW1lRm9ybWF0KGF4aXNGb3JtYXQyKSk7XG4gICAgY29uc3QgcmVUaWNrSW50ZXJ2YWwgPSAvXihbMS05XVxcZCopKG1pbGxpc2Vjb25kfHNlY29uZHxtaW51dGV8aG91cnxkYXl8d2Vla3xtb250aCkkLztcbiAgICBjb25zdCByZXN1bHRUaWNrSW50ZXJ2YWwgPSByZVRpY2tJbnRlcnZhbC5leGVjKFxuICAgICAgZGlhZ09iai5kYi5nZXRUaWNrSW50ZXJ2YWwoKSB8fCBjb25mLnRpY2tJbnRlcnZhbFxuICAgICk7XG4gICAgaWYgKHJlc3VsdFRpY2tJbnRlcnZhbCAhPT0gbnVsbCkge1xuICAgICAgY29uc3QgZXZlcnkgPSBwYXJzZUludChyZXN1bHRUaWNrSW50ZXJ2YWxbMV0sIDEwKTtcbiAgICAgIGlmIChpc05hTihldmVyeSkgfHwgZXZlcnkgPD0gMCkge1xuICAgICAgICBsb2cud2FybihcbiAgICAgICAgICBgSW52YWxpZCB0aWNrIGludGVydmFsIHZhbHVlOiBcIiR7cmVzdWx0VGlja0ludGVydmFsWzFdfVwiLiBTa2lwcGluZyBjdXN0b20gdGljayBpbnRlcnZhbC5gXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBpbnRlcnZhbCA9IHJlc3VsdFRpY2tJbnRlcnZhbFsyXTtcbiAgICAgICAgY29uc3Qgd2Vla2RheTIgPSBkaWFnT2JqLmRiLmdldFdlZWtkYXkoKSB8fCBjb25mLndlZWtkYXk7XG4gICAgICAgIGNvbnN0IGRvbWFpbiA9IHRpbWVTY2FsZS5kb21haW4oKTtcbiAgICAgICAgY29uc3QgbWluVGltZSA9IGRvbWFpblswXTtcbiAgICAgICAgY29uc3QgbWF4VGltZSA9IGRvbWFpblsxXTtcbiAgICAgICAgY29uc3QgZXN0aW1hdGVkVGlja3MgPSBnZXRFc3RpbWF0ZWRUaWNrQ291bnQobWluVGltZSwgbWF4VGltZSwgZXZlcnksIGludGVydmFsKTtcbiAgICAgICAgaWYgKGVzdGltYXRlZFRpY2tzID4gTUFYX1RJQ0tfQ09VTlQpIHtcbiAgICAgICAgICBsb2cud2FybihcbiAgICAgICAgICAgIGBUaGUgdGljayBpbnRlcnZhbCBcIiR7ZXZlcnl9JHtpbnRlcnZhbH1cIiB3b3VsZCBnZW5lcmF0ZSAke2VzdGltYXRlZFRpY2tzfSB0aWNrcywgd2hpY2ggZXhjZWVkcyB0aGUgbWF4aW11bSBhbGxvd2VkICgke01BWF9USUNLX0NPVU5UfSkuIFRoaXMgbWF5IGluZGljYXRlIGFuIGludmFsaWQgZGF0ZSBvciB0aW1lIHJhbmdlLiBTa2lwcGluZyBjdXN0b20gdGljayBpbnRlcnZhbC5gXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzd2l0Y2ggKGludGVydmFsKSB7XG4gICAgICAgICAgICBjYXNlIFwibWlsbGlzZWNvbmRcIjpcbiAgICAgICAgICAgICAgYm90dG9tWEF4aXMudGlja3ModGltZU1pbGxpc2Vjb25kLmV2ZXJ5KGV2ZXJ5KSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcInNlY29uZFwiOlxuICAgICAgICAgICAgICBib3R0b21YQXhpcy50aWNrcyh0aW1lU2Vjb25kLmV2ZXJ5KGV2ZXJ5KSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIm1pbnV0ZVwiOlxuICAgICAgICAgICAgICBib3R0b21YQXhpcy50aWNrcyh0aW1lTWludXRlLmV2ZXJ5KGV2ZXJ5KSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImhvdXJcIjpcbiAgICAgICAgICAgICAgYm90dG9tWEF4aXMudGlja3ModGltZUhvdXIuZXZlcnkoZXZlcnkpKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZGF5XCI6XG4gICAgICAgICAgICAgIGJvdHRvbVhBeGlzLnRpY2tzKHRpbWVEYXkuZXZlcnkoZXZlcnkpKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwid2Vla1wiOlxuICAgICAgICAgICAgICBib3R0b21YQXhpcy50aWNrcyhtYXBXZWVrZGF5VG9UaW1lRnVuY3Rpb25bd2Vla2RheTJdLmV2ZXJ5KGV2ZXJ5KSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIm1vbnRoXCI6XG4gICAgICAgICAgICAgIGJvdHRvbVhBeGlzLnRpY2tzKHRpbWVNb250aC5ldmVyeShldmVyeSkpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgc3ZnLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwiZ3JpZFwiKS5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgdGhlU2lkZVBhZCArIFwiLCBcIiArIChoMiAtIDUwKSArIFwiKVwiKS5jYWxsKGJvdHRvbVhBeGlzKS5zZWxlY3RBbGwoXCJ0ZXh0XCIpLnN0eWxlKFwidGV4dC1hbmNob3JcIiwgXCJtaWRkbGVcIikuYXR0cihcImZpbGxcIiwgXCIjMDAwXCIpLmF0dHIoXCJzdHJva2VcIiwgXCJub25lXCIpLmF0dHIoXCJmb250LXNpemVcIiwgMTApLmF0dHIoXCJkeVwiLCBcIjFlbVwiKTtcbiAgICBpZiAoZGlhZ09iai5kYi50b3BBeGlzRW5hYmxlZCgpIHx8IGNvbmYudG9wQXhpcykge1xuICAgICAgbGV0IHRvcFhBeGlzID0gYXhpc1RvcCh0aW1lU2NhbGUpLnRpY2tTaXplKC1oMiArIHRoZVRvcFBhZCArIGNvbmYuZ3JpZExpbmVTdGFydFBhZGRpbmcpLnRpY2tGb3JtYXQodGltZUZvcm1hdChheGlzRm9ybWF0MikpO1xuICAgICAgaWYgKHJlc3VsdFRpY2tJbnRlcnZhbCAhPT0gbnVsbCkge1xuICAgICAgICBjb25zdCBldmVyeSA9IHBhcnNlSW50KHJlc3VsdFRpY2tJbnRlcnZhbFsxXSwgMTApO1xuICAgICAgICBpZiAoaXNOYU4oZXZlcnkpIHx8IGV2ZXJ5IDw9IDApIHtcbiAgICAgICAgICBsb2cud2FybihcbiAgICAgICAgICAgIGBJbnZhbGlkIHRpY2sgaW50ZXJ2YWwgdmFsdWU6IFwiJHtyZXN1bHRUaWNrSW50ZXJ2YWxbMV19XCIuIFNraXBwaW5nIGN1c3RvbSB0aWNrIGludGVydmFsLmBcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGludGVydmFsID0gcmVzdWx0VGlja0ludGVydmFsWzJdO1xuICAgICAgICAgIGNvbnN0IHdlZWtkYXkyID0gZGlhZ09iai5kYi5nZXRXZWVrZGF5KCkgfHwgY29uZi53ZWVrZGF5O1xuICAgICAgICAgIGNvbnN0IGRvbWFpbiA9IHRpbWVTY2FsZS5kb21haW4oKTtcbiAgICAgICAgICBjb25zdCBtaW5UaW1lID0gZG9tYWluWzBdO1xuICAgICAgICAgIGNvbnN0IG1heFRpbWUgPSBkb21haW5bMV07XG4gICAgICAgICAgY29uc3QgZXN0aW1hdGVkVGlja3MgPSBnZXRFc3RpbWF0ZWRUaWNrQ291bnQobWluVGltZSwgbWF4VGltZSwgZXZlcnksIGludGVydmFsKTtcbiAgICAgICAgICBpZiAoZXN0aW1hdGVkVGlja3MgPD0gTUFYX1RJQ0tfQ09VTlQpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoaW50ZXJ2YWwpIHtcbiAgICAgICAgICAgICAgY2FzZSBcIm1pbGxpc2Vjb25kXCI6XG4gICAgICAgICAgICAgICAgdG9wWEF4aXMudGlja3ModGltZU1pbGxpc2Vjb25kLmV2ZXJ5KGV2ZXJ5KSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgXCJzZWNvbmRcIjpcbiAgICAgICAgICAgICAgICB0b3BYQXhpcy50aWNrcyh0aW1lU2Vjb25kLmV2ZXJ5KGV2ZXJ5KSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgXCJtaW51dGVcIjpcbiAgICAgICAgICAgICAgICB0b3BYQXhpcy50aWNrcyh0aW1lTWludXRlLmV2ZXJ5KGV2ZXJ5KSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgXCJob3VyXCI6XG4gICAgICAgICAgICAgICAgdG9wWEF4aXMudGlja3ModGltZUhvdXIuZXZlcnkoZXZlcnkpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSBcImRheVwiOlxuICAgICAgICAgICAgICAgIHRvcFhBeGlzLnRpY2tzKHRpbWVEYXkuZXZlcnkoZXZlcnkpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSBcIndlZWtcIjpcbiAgICAgICAgICAgICAgICB0b3BYQXhpcy50aWNrcyhtYXBXZWVrZGF5VG9UaW1lRnVuY3Rpb25bd2Vla2RheTJdLmV2ZXJ5KGV2ZXJ5KSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgXCJtb250aFwiOlxuICAgICAgICAgICAgICAgIHRvcFhBeGlzLnRpY2tzKHRpbWVNb250aC5ldmVyeShldmVyeSkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc3ZnLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwiZ3JpZFwiKS5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgdGhlU2lkZVBhZCArIFwiLCBcIiArIHRoZVRvcFBhZCArIFwiKVwiKS5jYWxsKHRvcFhBeGlzKS5zZWxlY3RBbGwoXCJ0ZXh0XCIpLnN0eWxlKFwidGV4dC1hbmNob3JcIiwgXCJtaWRkbGVcIikuYXR0cihcImZpbGxcIiwgXCIjMDAwXCIpLmF0dHIoXCJzdHJva2VcIiwgXCJub25lXCIpLmF0dHIoXCJmb250LXNpemVcIiwgMTApO1xuICAgIH1cbiAgfVxuICBfX25hbWUobWFrZUdyaWQsIFwibWFrZUdyaWRcIik7XG4gIGZ1bmN0aW9uIHZlcnRMYWJlbHModGhlR2FwLCB0aGVUb3BQYWQpIHtcbiAgICBsZXQgcHJldkdhcCA9IDA7XG4gICAgY29uc3QgbnVtT2NjdXJyZW5jZXMgPSBPYmplY3Qua2V5cyhjYXRlZ29yeUhlaWdodHMpLm1hcCgoZCkgPT4gW2QsIGNhdGVnb3J5SGVpZ2h0c1tkXV0pO1xuICAgIHN2Zy5hcHBlbmQoXCJnXCIpLnNlbGVjdEFsbChcInRleHRcIikuZGF0YShudW1PY2N1cnJlbmNlcykuZW50ZXIoKS5hcHBlbmQoZnVuY3Rpb24oZCkge1xuICAgICAgY29uc3Qgcm93cyA9IGRbMF0uc3BsaXQoY29tbW9uX2RlZmF1bHQubGluZUJyZWFrUmVnZXgpO1xuICAgICAgY29uc3QgZHkgPSAtKHJvd3MubGVuZ3RoIC0gMSkgLyAyO1xuICAgICAgY29uc3Qgc3ZnTGFiZWwgPSBkb2MuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJ0ZXh0XCIpO1xuICAgICAgc3ZnTGFiZWwuc2V0QXR0cmlidXRlKFwiZHlcIiwgZHkgKyBcImVtXCIpO1xuICAgICAgZm9yIChjb25zdCBbaiwgcm93XSBvZiByb3dzLmVudHJpZXMoKSkge1xuICAgICAgICBjb25zdCB0c3BhbiA9IGRvYy5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcInRzcGFuXCIpO1xuICAgICAgICB0c3Bhbi5zZXRBdHRyaWJ1dGUoXCJhbGlnbm1lbnQtYmFzZWxpbmVcIiwgXCJjZW50cmFsXCIpO1xuICAgICAgICB0c3Bhbi5zZXRBdHRyaWJ1dGUoXCJ4XCIsIFwiMTBcIik7XG4gICAgICAgIGlmIChqID4gMCkge1xuICAgICAgICAgIHRzcGFuLnNldEF0dHJpYnV0ZShcImR5XCIsIFwiMWVtXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRzcGFuLnRleHRDb250ZW50ID0gcm93O1xuICAgICAgICBzdmdMYWJlbC5hcHBlbmRDaGlsZCh0c3Bhbik7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3ZnTGFiZWw7XG4gICAgfSkuYXR0cihcInhcIiwgMTApLmF0dHIoXCJ5XCIsIGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgIGlmIChpID4gMCkge1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGk7IGorKykge1xuICAgICAgICAgIHByZXZHYXAgKz0gbnVtT2NjdXJyZW5jZXNbaSAtIDFdWzFdO1xuICAgICAgICAgIHJldHVybiBkWzFdICogdGhlR2FwIC8gMiArIHByZXZHYXAgKiB0aGVHYXAgKyB0aGVUb3BQYWQ7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBkWzFdICogdGhlR2FwIC8gMiArIHRoZVRvcFBhZDtcbiAgICAgIH1cbiAgICB9KS5hdHRyKFwiZm9udC1zaXplXCIsIGNvbmYuc2VjdGlvbkZvbnRTaXplKS5hdHRyKFwiY2xhc3NcIiwgZnVuY3Rpb24oZCkge1xuICAgICAgZm9yIChjb25zdCBbaSwgY2F0ZWdvcnldIG9mIGNhdGVnb3JpZXMuZW50cmllcygpKSB7XG4gICAgICAgIGlmIChkWzBdID09PSBjYXRlZ29yeSkge1xuICAgICAgICAgIHJldHVybiBcInNlY3Rpb25UaXRsZSBzZWN0aW9uVGl0bGVcIiArIGkgJSBjb25mLm51bWJlclNlY3Rpb25TdHlsZXM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBcInNlY3Rpb25UaXRsZVwiO1xuICAgIH0pO1xuICB9XG4gIF9fbmFtZSh2ZXJ0TGFiZWxzLCBcInZlcnRMYWJlbHNcIik7XG4gIGZ1bmN0aW9uIGRyYXdUb2RheSh0aGVTaWRlUGFkLCB0aGVUb3BQYWQsIHcyLCBoMikge1xuICAgIGNvbnN0IHRvZGF5TWFya2VyMiA9IGRpYWdPYmouZGIuZ2V0VG9kYXlNYXJrZXIoKTtcbiAgICBpZiAodG9kYXlNYXJrZXIyID09PSBcIm9mZlwiKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHRvZGF5RyA9IHN2Zy5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcInRvZGF5XCIpO1xuICAgIGNvbnN0IHRvZGF5ID0gLyogQF9fUFVSRV9fICovIG5ldyBEYXRlKCk7XG4gICAgY29uc3QgdG9kYXlMaW5lID0gdG9kYXlHLmFwcGVuZChcImxpbmVcIik7XG4gICAgdG9kYXlMaW5lLmF0dHIoXCJ4MVwiLCB0aW1lU2NhbGUodG9kYXkpICsgdGhlU2lkZVBhZCkuYXR0cihcIngyXCIsIHRpbWVTY2FsZSh0b2RheSkgKyB0aGVTaWRlUGFkKS5hdHRyKFwieTFcIiwgY29uZi50aXRsZVRvcE1hcmdpbikuYXR0cihcInkyXCIsIGgyIC0gY29uZi50aXRsZVRvcE1hcmdpbikuYXR0cihcImNsYXNzXCIsIFwidG9kYXlcIik7XG4gICAgaWYgKHRvZGF5TWFya2VyMiAhPT0gXCJcIikge1xuICAgICAgdG9kYXlMaW5lLmF0dHIoXCJzdHlsZVwiLCB0b2RheU1hcmtlcjIucmVwbGFjZSgvLC9nLCBcIjtcIikpO1xuICAgIH1cbiAgfVxuICBfX25hbWUoZHJhd1RvZGF5LCBcImRyYXdUb2RheVwiKTtcbiAgZnVuY3Rpb24gY2hlY2tVbmlxdWUoYXJyKSB7XG4gICAgY29uc3QgaGFzaCA9IHt9O1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwLCBsID0gYXJyLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoaGFzaCwgYXJyW2ldKSkge1xuICAgICAgICBoYXNoW2FycltpXV0gPSB0cnVlO1xuICAgICAgICByZXN1bHQucHVzaChhcnJbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIF9fbmFtZShjaGVja1VuaXF1ZSwgXCJjaGVja1VuaXF1ZVwiKTtcbn0sIFwiZHJhd1wiKTtcbnZhciBnYW50dFJlbmRlcmVyX2RlZmF1bHQgPSB7XG4gIHNldENvbmYsXG4gIGRyYXdcbn07XG5cbi8vIHNyYy9kaWFncmFtcy9nYW50dC9zdHlsZXMuanNcbnZhciBnZXRTdHlsZXMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChvcHRpb25zKSA9PiBgXG4gIC5tZXJtYWlkLW1haW4tZm9udCB7XG4gICAgICAgIGZvbnQtZmFtaWx5OiAke29wdGlvbnMuZm9udEZhbWlseX07XG4gIH1cblxuICAuZXhjbHVkZS1yYW5nZSB7XG4gICAgZmlsbDogJHtvcHRpb25zLmV4Y2x1ZGVCa2dDb2xvcn07XG4gIH1cblxuICAuc2VjdGlvbiB7XG4gICAgc3Ryb2tlOiBub25lO1xuICAgIG9wYWNpdHk6IDAuMjtcbiAgfVxuXG4gIC5zZWN0aW9uMCB7XG4gICAgZmlsbDogJHtvcHRpb25zLnNlY3Rpb25Ca2dDb2xvcn07XG4gIH1cblxuICAuc2VjdGlvbjIge1xuICAgIGZpbGw6ICR7b3B0aW9ucy5zZWN0aW9uQmtnQ29sb3IyfTtcbiAgfVxuXG4gIC5zZWN0aW9uMSxcbiAgLnNlY3Rpb24zIHtcbiAgICBmaWxsOiAke29wdGlvbnMuYWx0U2VjdGlvbkJrZ0NvbG9yfTtcbiAgICBvcGFjaXR5OiAwLjI7XG4gIH1cblxuICAuc2VjdGlvblRpdGxlMCB7XG4gICAgZmlsbDogJHtvcHRpb25zLnRpdGxlQ29sb3J9O1xuICB9XG5cbiAgLnNlY3Rpb25UaXRsZTEge1xuICAgIGZpbGw6ICR7b3B0aW9ucy50aXRsZUNvbG9yfTtcbiAgfVxuXG4gIC5zZWN0aW9uVGl0bGUyIHtcbiAgICBmaWxsOiAke29wdGlvbnMudGl0bGVDb2xvcn07XG4gIH1cblxuICAuc2VjdGlvblRpdGxlMyB7XG4gICAgZmlsbDogJHtvcHRpb25zLnRpdGxlQ29sb3J9O1xuICB9XG5cbiAgLnNlY3Rpb25UaXRsZSB7XG4gICAgdGV4dC1hbmNob3I6IHN0YXJ0O1xuICAgIGZvbnQtZmFtaWx5OiAke29wdGlvbnMuZm9udEZhbWlseX07XG4gIH1cblxuXG4gIC8qIEdyaWQgYW5kIGF4aXMgKi9cblxuICAuZ3JpZCAudGljayB7XG4gICAgc3Ryb2tlOiAke29wdGlvbnMuZ3JpZENvbG9yfTtcbiAgICBvcGFjaXR5OiAwLjg7XG4gICAgc2hhcGUtcmVuZGVyaW5nOiBjcmlzcEVkZ2VzO1xuICB9XG5cbiAgLmdyaWQgLnRpY2sgdGV4dCB7XG4gICAgZm9udC1mYW1pbHk6ICR7b3B0aW9ucy5mb250RmFtaWx5fTtcbiAgICBmaWxsOiAke29wdGlvbnMudGV4dENvbG9yfTtcbiAgfVxuXG4gIC5ncmlkIHBhdGgge1xuICAgIHN0cm9rZS13aWR0aDogMDtcbiAgfVxuXG5cbiAgLyogVG9kYXkgbGluZSAqL1xuXG4gIC50b2RheSB7XG4gICAgZmlsbDogbm9uZTtcbiAgICBzdHJva2U6ICR7b3B0aW9ucy50b2RheUxpbmVDb2xvcn07XG4gICAgc3Ryb2tlLXdpZHRoOiAycHg7XG4gIH1cblxuXG4gIC8qIFRhc2sgc3R5bGluZyAqL1xuXG4gIC8qIERlZmF1bHQgdGFzayAqL1xuXG4gIC50YXNrIHtcbiAgICBzdHJva2Utd2lkdGg6IDI7XG4gIH1cblxuICAudGFza1RleHQge1xuICAgIHRleHQtYW5jaG9yOiBtaWRkbGU7XG4gICAgZm9udC1mYW1pbHk6ICR7b3B0aW9ucy5mb250RmFtaWx5fTtcbiAgfVxuXG4gIC50YXNrVGV4dE91dHNpZGVSaWdodCB7XG4gICAgZmlsbDogJHtvcHRpb25zLnRhc2tUZXh0RGFya0NvbG9yfTtcbiAgICB0ZXh0LWFuY2hvcjogc3RhcnQ7XG4gICAgZm9udC1mYW1pbHk6ICR7b3B0aW9ucy5mb250RmFtaWx5fTtcbiAgfVxuXG4gIC50YXNrVGV4dE91dHNpZGVMZWZ0IHtcbiAgICBmaWxsOiAke29wdGlvbnMudGFza1RleHREYXJrQ29sb3J9O1xuICAgIHRleHQtYW5jaG9yOiBlbmQ7XG4gIH1cblxuXG4gIC8qIFNwZWNpYWwgY2FzZSBjbGlja2FibGUgKi9cblxuICAudGFzay5jbGlja2FibGUge1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgfVxuXG4gIC50YXNrVGV4dC5jbGlja2FibGUge1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICBmaWxsOiAke29wdGlvbnMudGFza1RleHRDbGlja2FibGVDb2xvcn0gIWltcG9ydGFudDtcbiAgICBmb250LXdlaWdodDogYm9sZDtcbiAgfVxuXG4gIC50YXNrVGV4dE91dHNpZGVMZWZ0LmNsaWNrYWJsZSB7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xuICAgIGZpbGw6ICR7b3B0aW9ucy50YXNrVGV4dENsaWNrYWJsZUNvbG9yfSAhaW1wb3J0YW50O1xuICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICB9XG5cbiAgLnRhc2tUZXh0T3V0c2lkZVJpZ2h0LmNsaWNrYWJsZSB7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xuICAgIGZpbGw6ICR7b3B0aW9ucy50YXNrVGV4dENsaWNrYWJsZUNvbG9yfSAhaW1wb3J0YW50O1xuICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICB9XG5cblxuICAvKiBTcGVjaWZpYyB0YXNrIHNldHRpbmdzIGZvciB0aGUgc2VjdGlvbnMqL1xuXG4gIC50YXNrVGV4dDAsXG4gIC50YXNrVGV4dDEsXG4gIC50YXNrVGV4dDIsXG4gIC50YXNrVGV4dDMge1xuICAgIGZpbGw6ICR7b3B0aW9ucy50YXNrVGV4dENvbG9yfTtcbiAgfVxuXG4gIC50YXNrMCxcbiAgLnRhc2sxLFxuICAudGFzazIsXG4gIC50YXNrMyB7XG4gICAgZmlsbDogJHtvcHRpb25zLnRhc2tCa2dDb2xvcn07XG4gICAgc3Ryb2tlOiAke29wdGlvbnMudGFza0JvcmRlckNvbG9yfTtcbiAgfVxuXG4gIC50YXNrVGV4dE91dHNpZGUwLFxuICAudGFza1RleHRPdXRzaWRlMlxuICB7XG4gICAgZmlsbDogJHtvcHRpb25zLnRhc2tUZXh0T3V0c2lkZUNvbG9yfTtcbiAgfVxuXG4gIC50YXNrVGV4dE91dHNpZGUxLFxuICAudGFza1RleHRPdXRzaWRlMyB7XG4gICAgZmlsbDogJHtvcHRpb25zLnRhc2tUZXh0T3V0c2lkZUNvbG9yfTtcbiAgfVxuXG5cbiAgLyogQWN0aXZlIHRhc2sgKi9cblxuICAuYWN0aXZlMCxcbiAgLmFjdGl2ZTEsXG4gIC5hY3RpdmUyLFxuICAuYWN0aXZlMyB7XG4gICAgZmlsbDogJHtvcHRpb25zLmFjdGl2ZVRhc2tCa2dDb2xvcn07XG4gICAgc3Ryb2tlOiAke29wdGlvbnMuYWN0aXZlVGFza0JvcmRlckNvbG9yfTtcbiAgfVxuXG4gIC5hY3RpdmVUZXh0MCxcbiAgLmFjdGl2ZVRleHQxLFxuICAuYWN0aXZlVGV4dDIsXG4gIC5hY3RpdmVUZXh0MyB7XG4gICAgZmlsbDogJHtvcHRpb25zLnRhc2tUZXh0RGFya0NvbG9yfSAhaW1wb3J0YW50O1xuICB9XG5cblxuICAvKiBDb21wbGV0ZWQgdGFzayAqL1xuXG4gIC5kb25lMCxcbiAgLmRvbmUxLFxuICAuZG9uZTIsXG4gIC5kb25lMyB7XG4gICAgc3Ryb2tlOiAke29wdGlvbnMuZG9uZVRhc2tCb3JkZXJDb2xvcn07XG4gICAgZmlsbDogJHtvcHRpb25zLmRvbmVUYXNrQmtnQ29sb3J9O1xuICAgIHN0cm9rZS13aWR0aDogMjtcbiAgfVxuXG4gIC5kb25lVGV4dDAsXG4gIC5kb25lVGV4dDEsXG4gIC5kb25lVGV4dDIsXG4gIC5kb25lVGV4dDMge1xuICAgIGZpbGw6ICR7b3B0aW9ucy50YXNrVGV4dERhcmtDb2xvcn0gIWltcG9ydGFudDtcbiAgfVxuXG4gIC8qIERvbmUgdGFzayB0ZXh0IGRpc3BsYXllZCBvdXRzaWRlIHRoZSBiYXIgc2l0cyBhZ2FpbnN0IHRoZSBkaWFncmFtIGJhY2tncm91bmQsXG4gICAgIG5vdCBhZ2FpbnN0IHRoZSBkb25lLXRhc2sgYmFyLCBzbyBpdCBtdXN0IHVzZSB0aGUgb3V0c2lkZS9jb250cmFzdCBjb2xvci4gKi9cbiAgLmRvbmVUZXh0MC50YXNrVGV4dE91dHNpZGVMZWZ0LFxuICAuZG9uZVRleHQwLnRhc2tUZXh0T3V0c2lkZVJpZ2h0LFxuICAuZG9uZVRleHQxLnRhc2tUZXh0T3V0c2lkZUxlZnQsXG4gIC5kb25lVGV4dDEudGFza1RleHRPdXRzaWRlUmlnaHQsXG4gIC5kb25lVGV4dDIudGFza1RleHRPdXRzaWRlTGVmdCxcbiAgLmRvbmVUZXh0Mi50YXNrVGV4dE91dHNpZGVSaWdodCxcbiAgLmRvbmVUZXh0My50YXNrVGV4dE91dHNpZGVMZWZ0LFxuICAuZG9uZVRleHQzLnRhc2tUZXh0T3V0c2lkZVJpZ2h0IHtcbiAgICBmaWxsOiAke29wdGlvbnMudGFza1RleHRPdXRzaWRlQ29sb3J9ICFpbXBvcnRhbnQ7XG4gIH1cblxuXG4gIC8qIFRhc2tzIG9uIHRoZSBjcml0aWNhbCBsaW5lICovXG5cbiAgLmNyaXQwLFxuICAuY3JpdDEsXG4gIC5jcml0MixcbiAgLmNyaXQzIHtcbiAgICBzdHJva2U6ICR7b3B0aW9ucy5jcml0Qm9yZGVyQ29sb3J9O1xuICAgIGZpbGw6ICR7b3B0aW9ucy5jcml0QmtnQ29sb3J9O1xuICAgIHN0cm9rZS13aWR0aDogMjtcbiAgfVxuXG4gIC5hY3RpdmVDcml0MCxcbiAgLmFjdGl2ZUNyaXQxLFxuICAuYWN0aXZlQ3JpdDIsXG4gIC5hY3RpdmVDcml0MyB7XG4gICAgc3Ryb2tlOiAke29wdGlvbnMuY3JpdEJvcmRlckNvbG9yfTtcbiAgICBmaWxsOiAke29wdGlvbnMuYWN0aXZlVGFza0JrZ0NvbG9yfTtcbiAgICBzdHJva2Utd2lkdGg6IDI7XG4gIH1cblxuICAuZG9uZUNyaXQwLFxuICAuZG9uZUNyaXQxLFxuICAuZG9uZUNyaXQyLFxuICAuZG9uZUNyaXQzIHtcbiAgICBzdHJva2U6ICR7b3B0aW9ucy5jcml0Qm9yZGVyQ29sb3J9O1xuICAgIGZpbGw6ICR7b3B0aW9ucy5kb25lVGFza0JrZ0NvbG9yfTtcbiAgICBzdHJva2Utd2lkdGg6IDI7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xuICAgIHNoYXBlLXJlbmRlcmluZzogY3Jpc3BFZGdlcztcbiAgfVxuXG4gIC5taWxlc3RvbmUge1xuICAgIHRyYW5zZm9ybTogcm90YXRlKDQ1ZGVnKSBzY2FsZSgwLjgsMC44KTtcbiAgfVxuXG4gIC5taWxlc3RvbmVUZXh0IHtcbiAgICBmb250LXN0eWxlOiBpdGFsaWM7XG4gIH1cbiAgLmRvbmVDcml0VGV4dDAsXG4gIC5kb25lQ3JpdFRleHQxLFxuICAuZG9uZUNyaXRUZXh0MixcbiAgLmRvbmVDcml0VGV4dDMge1xuICAgIGZpbGw6ICR7b3B0aW9ucy50YXNrVGV4dERhcmtDb2xvcn0gIWltcG9ydGFudDtcbiAgfVxuXG4gIC8qIERvbmUtY3JpdCB0YXNrIHRleHQgb3V0c2lkZSB0aGUgYmFyIFxcdTIwMTQgc2FtZSByZWFzb25pbmcgYXMgZG9uZVRleHQgYWJvdmUuICovXG4gIC5kb25lQ3JpdFRleHQwLnRhc2tUZXh0T3V0c2lkZUxlZnQsXG4gIC5kb25lQ3JpdFRleHQwLnRhc2tUZXh0T3V0c2lkZVJpZ2h0LFxuICAuZG9uZUNyaXRUZXh0MS50YXNrVGV4dE91dHNpZGVMZWZ0LFxuICAuZG9uZUNyaXRUZXh0MS50YXNrVGV4dE91dHNpZGVSaWdodCxcbiAgLmRvbmVDcml0VGV4dDIudGFza1RleHRPdXRzaWRlTGVmdCxcbiAgLmRvbmVDcml0VGV4dDIudGFza1RleHRPdXRzaWRlUmlnaHQsXG4gIC5kb25lQ3JpdFRleHQzLnRhc2tUZXh0T3V0c2lkZUxlZnQsXG4gIC5kb25lQ3JpdFRleHQzLnRhc2tUZXh0T3V0c2lkZVJpZ2h0IHtcbiAgICBmaWxsOiAke29wdGlvbnMudGFza1RleHRPdXRzaWRlQ29sb3J9ICFpbXBvcnRhbnQ7XG4gIH1cblxuICAudmVydCB7XG4gICAgc3Ryb2tlOiAke29wdGlvbnMudmVydExpbmVDb2xvcn07XG4gIH1cblxuICAudmVydFRleHQge1xuICAgIGZvbnQtc2l6ZTogMTVweDtcbiAgICB0ZXh0LWFuY2hvcjogbWlkZGxlO1xuICAgIGZpbGw6ICR7b3B0aW9ucy52ZXJ0TGluZUNvbG9yfSAhaW1wb3J0YW50O1xuICB9XG5cbiAgLmFjdGl2ZUNyaXRUZXh0MCxcbiAgLmFjdGl2ZUNyaXRUZXh0MSxcbiAgLmFjdGl2ZUNyaXRUZXh0MixcbiAgLmFjdGl2ZUNyaXRUZXh0MyB7XG4gICAgZmlsbDogJHtvcHRpb25zLnRhc2tUZXh0RGFya0NvbG9yfSAhaW1wb3J0YW50O1xuICB9XG5cbiAgLnRpdGxlVGV4dCB7XG4gICAgdGV4dC1hbmNob3I6IG1pZGRsZTtcbiAgICBmb250LXNpemU6IDE4cHg7XG4gICAgZmlsbDogJHtvcHRpb25zLnRpdGxlQ29sb3IgfHwgb3B0aW9ucy50ZXh0Q29sb3J9O1xuICAgIGZvbnQtZmFtaWx5OiAke29wdGlvbnMuZm9udEZhbWlseX07XG4gIH1cbmAsIFwiZ2V0U3R5bGVzXCIpO1xudmFyIHN0eWxlc19kZWZhdWx0ID0gZ2V0U3R5bGVzO1xuXG4vLyBzcmMvZGlhZ3JhbXMvZ2FudHQvZ2FudHREaWFncmFtLnRzXG52YXIgZGlhZ3JhbSA9IHtcbiAgcGFyc2VyOiBnYW50dF9kZWZhdWx0LFxuICBkYjogZ2FudHREYl9kZWZhdWx0LFxuICByZW5kZXJlcjogZ2FudHRSZW5kZXJlcl9kZWZhdWx0LFxuICBzdHlsZXM6IHN0eWxlc19kZWZhdWx0XG59O1xuZXhwb3J0IHtcbiAgZGlhZ3JhbVxufTtcbiIKICBdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FBQyxRQUFRLENBQUMsR0FBRSxHQUFFO0FBQUEsSUFBVyxPQUFPLFdBQWpCLFlBQXVDLE9BQU8sVUFBcEIsY0FBMkIsT0FBTyxVQUFRLEVBQUUsSUFBYyxPQUFPLFVBQW5CLGNBQTJCLE9BQU8sTUFBSSxPQUFPLENBQUMsS0FBRyxJQUFlLE9BQU8sY0FBcEIsY0FBK0IsYUFBVyxLQUFHLE1BQU0sdUJBQXFCLEVBQUU7QUFBQSxLQUFHLFNBQU0sUUFBUSxHQUFFO0FBQUEsSUFBYyxJQUFJLElBQUU7QUFBQSxJQUFNLE9BQU8sUUFBUSxDQUFDLEdBQUUsR0FBRSxHQUFFO0FBQUEsTUFBQyxJQUFJLElBQUUsUUFBUSxDQUFDLElBQUU7QUFBQSxRQUFDLE9BQU8sR0FBRSxJQUFJLElBQUUsR0FBRSxXQUFXLEdBQUUsQ0FBQztBQUFBLFNBQUcsSUFBRSxFQUFFO0FBQUEsTUFBVSxFQUFFLGNBQVksUUFBUSxHQUFFO0FBQUEsUUFBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUs7QUFBQSxTQUFHLEVBQUUsVUFBUSxRQUFRLENBQUMsSUFBRTtBQUFBLFFBQUMsSUFBRyxDQUFDLEtBQUssT0FBTyxFQUFFLEVBQUUsRUFBQztBQUFBLFVBQUUsT0FBTyxLQUFLLElBQUksS0FBRyxLQUFFLEtBQUssUUFBUSxJQUFHLENBQUM7QUFBQSxRQUFFLElBQUksSUFBRSxJQUFFLElBQUUsR0FBRSxJQUFFLEVBQUUsSUFBSSxHQUFFLEtBQUcsS0FBRSxLQUFLLFlBQVksR0FBRSxLQUFFLEtBQUssSUFBRyxNQUFHLEtBQUUsRUFBRSxNQUFJLEdBQUcsRUFBRSxLQUFLLEVBQUMsRUFBRSxRQUFRLE1BQU0sR0FBRSxJQUFFLElBQUUsR0FBRSxXQUFXLEdBQUUsR0FBRSxXQUFXLElBQUUsTUFBSSxLQUFHLElBQUcsR0FBRSxJQUFJLEdBQUUsQ0FBQztBQUFBLFFBQUcsT0FBTyxFQUFFLEtBQUssR0FBRSxNQUFNLElBQUU7QUFBQSxTQUFHLEVBQUUsYUFBVyxRQUFRLENBQUMsSUFBRTtBQUFBLFFBQUMsT0FBTyxLQUFLLE9BQU8sRUFBRSxFQUFFLEVBQUMsSUFBRSxLQUFLLElBQUksS0FBRyxJQUFFLEtBQUssSUFBSSxLQUFLLElBQUksSUFBRSxJQUFFLEtBQUUsS0FBRSxDQUFDO0FBQUE7QUFBQSxNQUFHLElBQUksSUFBRSxFQUFFO0FBQUEsTUFBUSxFQUFFLFVBQVEsUUFBUSxDQUFDLElBQUUsSUFBRTtBQUFBLFFBQUMsSUFBSSxLQUFFLEtBQUssT0FBTyxHQUFFLEtBQUUsQ0FBQyxDQUFDLEdBQUUsRUFBRSxFQUFDLEtBQUc7QUFBQSxRQUFFLE9BQWtCLEdBQUUsRUFBRSxFQUFDLE1BQWpCLFlBQW1CLEtBQUUsS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFHLEtBQUssV0FBVyxJQUFFLEVBQUUsRUFBRSxRQUFRLEtBQUssSUFBRSxLQUFLLEtBQUssS0FBSyxLQUFLLElBQUUsS0FBRyxLQUFLLFdBQVcsSUFBRSxLQUFHLENBQUMsRUFBRSxNQUFNLEtBQUssSUFBRSxFQUFFLEtBQUssSUFBSSxFQUFFLElBQUUsRUFBQztBQUFBO0FBQUE7QUFBQSxHQUFLO0FBQUE7Ozs7R0NBcCtCLFFBQVEsQ0FBQyxHQUFFLEdBQUU7QUFBQSxJQUFXLE9BQU8sV0FBakIsWUFBdUMsT0FBTyxVQUFwQixjQUEyQixPQUFPLFVBQVEsRUFBRSxJQUFjLE9BQU8sVUFBbkIsY0FBMkIsT0FBTyxNQUFJLE9BQU8sQ0FBQyxLQUFHLElBQWUsT0FBTyxjQUFwQixjQUErQixhQUFXLEtBQUcsTUFBTSxpQ0FBK0IsRUFBRTtBQUFBLEtBQUcsU0FBTSxRQUFRLEdBQUU7QUFBQSxJQUFjLElBQUksSUFBRSxFQUFDLEtBQUksYUFBWSxJQUFHLFVBQVMsR0FBRSxjQUFhLElBQUcsZ0JBQWUsS0FBSSx1QkFBc0IsTUFBSyw0QkFBMkIsR0FBRSxJQUFFLGlHQUFnRyxJQUFFLE1BQUssSUFBRSxRQUFPLElBQUUsU0FBUSxJQUFFLHNCQUFxQixJQUFFLENBQUMsR0FBRSxJQUFFLFFBQVEsQ0FBQyxJQUFFO0FBQUEsTUFBQyxRQUFPLEtBQUUsQ0FBQyxPQUFJLEtBQUUsS0FBRyxPQUFLO0FBQUE7QUFBQSxJQUFNLElBQUksSUFBRSxRQUFRLENBQUMsSUFBRTtBQUFBLE1BQUMsT0FBTyxRQUFRLENBQUMsSUFBRTtBQUFBLFFBQUMsS0FBSyxNQUFHLENBQUM7QUFBQTtBQUFBLE9BQUksSUFBRSxDQUFDLHVCQUFzQixRQUFRLENBQUMsSUFBRTtBQUFBLE9BQUUsS0FBSyxTQUFPLEtBQUssT0FBSyxDQUFDLElBQUksU0FBTyxRQUFRLENBQUMsSUFBRTtBQUFBLFFBQUMsSUFBRyxDQUFDO0FBQUEsVUFBRSxPQUFPO0FBQUEsUUFBRSxJQUFTLE9BQU47QUFBQSxVQUFRLE9BQU87QUFBQSxRQUFFLElBQUksS0FBRSxHQUFFLE1BQU0sY0FBYyxHQUFFLEtBQUUsS0FBRyxHQUFFLE1BQUksQ0FBQyxHQUFFLE1BQUk7QUFBQSxRQUFHLE9BQVcsT0FBSixJQUFNLElBQVEsR0FBRSxPQUFSLE1BQVcsQ0FBQyxLQUFFO0FBQUEsUUFBRyxFQUFDO0FBQUEsS0FBRSxHQUFFLElBQUUsUUFBUSxDQUFDLElBQUU7QUFBQSxNQUFDLElBQUksS0FBRSxFQUFFO0FBQUEsTUFBRyxPQUFPLE9BQUksR0FBRSxVQUFRLEtBQUUsR0FBRSxFQUFFLE9BQU8sR0FBRSxDQUFDO0FBQUEsT0FBSSxJQUFFLFFBQVEsQ0FBQyxJQUFFLElBQUU7QUFBQSxNQUFDLElBQUksSUFBRSxLQUFFLEVBQUU7QUFBQSxNQUFTLElBQUcsSUFBRTtBQUFBLFFBQUMsU0FBUSxLQUFFLEVBQUUsTUFBRyxJQUFHLE1BQUc7QUFBQSxVQUFFLElBQUcsR0FBRSxRQUFRLEdBQUUsSUFBRSxHQUFFLEVBQUMsQ0FBQyxJQUFFLElBQUc7QUFBQSxZQUFDLEtBQUUsS0FBRTtBQUFBLFlBQUc7QUFBQSxVQUFLO0FBQUEsTUFBQyxFQUFNO0FBQUEsYUFBRSxRQUFLLEtBQUUsT0FBSztBQUFBLE1BQU0sT0FBTztBQUFBLE9BQUcsSUFBRSxFQUFDLEdBQUUsQ0FBQyxHQUFFLFFBQVEsQ0FBQyxJQUFFO0FBQUEsTUFBQyxLQUFLLFlBQVUsRUFBRSxJQUFFLEtBQUU7QUFBQSxLQUFFLEdBQUUsR0FBRSxDQUFDLEdBQUUsUUFBUSxDQUFDLElBQUU7QUFBQSxNQUFDLEtBQUssWUFBVSxFQUFFLElBQUUsSUFBRTtBQUFBLEtBQUUsR0FBRSxHQUFFLENBQUMsR0FBRSxRQUFRLENBQUMsSUFBRTtBQUFBLE1BQUMsS0FBSyxRQUFNLEtBQUcsS0FBRSxLQUFHO0FBQUEsS0FBRSxHQUFFLEdBQUUsQ0FBQyxHQUFFLFFBQVEsQ0FBQyxJQUFFO0FBQUEsTUFBQyxLQUFLLGVBQWEsTUFBSSxDQUFDO0FBQUEsS0FBRSxHQUFFLElBQUcsQ0FBQyxHQUFFLFFBQVEsQ0FBQyxJQUFFO0FBQUEsTUFBQyxLQUFLLGVBQWEsS0FBRyxDQUFDO0FBQUEsS0FBRSxHQUFFLEtBQUksQ0FBQyxTQUFRLFFBQVEsQ0FBQyxJQUFFO0FBQUEsTUFBQyxLQUFLLGVBQWEsQ0FBQztBQUFBLEtBQUUsR0FBRSxHQUFFLENBQUMsR0FBRSxFQUFFLFNBQVMsQ0FBQyxHQUFFLElBQUcsQ0FBQyxHQUFFLEVBQUUsU0FBUyxDQUFDLEdBQUUsR0FBRSxDQUFDLEdBQUUsRUFBRSxTQUFTLENBQUMsR0FBRSxJQUFHLENBQUMsR0FBRSxFQUFFLFNBQVMsQ0FBQyxHQUFFLEdBQUUsQ0FBQyxHQUFFLEVBQUUsT0FBTyxDQUFDLEdBQUUsR0FBRSxDQUFDLEdBQUUsRUFBRSxPQUFPLENBQUMsR0FBRSxJQUFHLENBQUMsR0FBRSxFQUFFLE9BQU8sQ0FBQyxHQUFFLElBQUcsQ0FBQyxHQUFFLEVBQUUsT0FBTyxDQUFDLEdBQUUsR0FBRSxDQUFDLEdBQUUsRUFBRSxLQUFLLENBQUMsR0FBRSxJQUFHLENBQUMsR0FBRSxFQUFFLEtBQUssQ0FBQyxHQUFFLElBQUcsQ0FBQyxHQUFFLFFBQVEsQ0FBQyxJQUFFO0FBQUEsTUFBQyxJQUFJLEtBQUUsRUFBRSxTQUFRLEtBQUUsR0FBRSxNQUFNLEtBQUs7QUFBQSxNQUFFLElBQUcsS0FBSyxNQUFJLEdBQUUsSUFBRztBQUFBLFFBQUUsU0FBUSxLQUFFLEVBQUUsTUFBRyxJQUFHLE1BQUc7QUFBQSxVQUFFLEdBQUUsRUFBQyxFQUFFLFFBQVEsVUFBUyxFQUFFLE1BQUksT0FBSSxLQUFLLE1BQUk7QUFBQSxLQUFHLEdBQUUsR0FBRSxDQUFDLEdBQUUsRUFBRSxNQUFNLENBQUMsR0FBRSxJQUFHLENBQUMsR0FBRSxFQUFFLE1BQU0sQ0FBQyxHQUFFLEdBQUUsQ0FBQyxHQUFFLEVBQUUsT0FBTyxDQUFDLEdBQUUsSUFBRyxDQUFDLEdBQUUsRUFBRSxPQUFPLENBQUMsR0FBRSxLQUFJLENBQUMsR0FBRSxRQUFRLENBQUMsSUFBRTtBQUFBLE1BQUMsSUFBSSxLQUFFLEVBQUUsUUFBUSxHQUFFLE1BQUcsRUFBRSxhQUFhLEtBQUcsR0FBRSxJQUFLLFFBQVEsQ0FBQyxJQUFFO0FBQUEsUUFBQyxPQUFPLEdBQUUsTUFBTSxHQUFFLENBQUM7QUFBQSxPQUFHLEdBQUcsUUFBUSxFQUFDLElBQUU7QUFBQSxNQUFFLElBQUcsS0FBRTtBQUFBLFFBQUUsTUFBTSxJQUFJO0FBQUEsTUFBTSxLQUFLLFFBQU0sS0FBRSxNQUFJO0FBQUEsS0FBRSxHQUFFLE1BQUssQ0FBQyxHQUFFLFFBQVEsQ0FBQyxJQUFFO0FBQUEsTUFBQyxJQUFJLEtBQUUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFDLElBQUU7QUFBQSxNQUFFLElBQUcsS0FBRTtBQUFBLFFBQUUsTUFBTSxJQUFJO0FBQUEsTUFBTSxLQUFLLFFBQU0sS0FBRSxNQUFJO0FBQUEsS0FBRSxHQUFFLEdBQUUsQ0FBQyxZQUFXLEVBQUUsTUFBTSxDQUFDLEdBQUUsSUFBRyxDQUFDLEdBQUUsUUFBUSxDQUFDLElBQUU7QUFBQSxNQUFDLEtBQUssT0FBSyxFQUFFLEVBQUM7QUFBQSxLQUFFLEdBQUUsTUFBSyxDQUFDLFNBQVEsRUFBRSxNQUFNLENBQUMsR0FBRSxHQUFFLEdBQUUsSUFBRyxFQUFDO0FBQUEsSUFBRSxTQUFTLENBQUMsQ0FBQyxJQUFFO0FBQUEsTUFBQyxJQUFJLElBQUU7QUFBQSxNQUFFLEtBQUUsSUFBRSxLQUFFLEtBQUcsRUFBRTtBQUFBLE1BQVEsU0FBUSxNQUFHLEtBQUUsR0FBRSxRQUFRLHFDQUFxQyxRQUFRLENBQUMsSUFB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QUFFLE9BQUksTUFBRyxLQUFFLElBQUUsR0FBRSxRQUFRLElBQUcsSUFBRSxNQUFHLEdBQUUsWUFBWSxHQUFFLElBQUU7QUFBQSxjQUFFLE1BQUcsQ0FBQyxPQUFJLElBQUUsS0FBRSxJQUFFLEtBQUUsSUFBRSxHQUFFLFNBQVM7QUFBQSxjQUFHLElBQUksR0FBRSxJQUFFLE1BQUcsR0FBRSxJQUFFLE1BQUcsR0FBRSxJQUFFLE1BQUcsR0FBRSxJQUFFLE1BQUc7QUFBQSxjQUFFLE9BQU8sS0FBRSxJQUFJLEtBQUssS0FBSyxJQUFJLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLElBQUUsS0FBRyxHQUFFLFNBQU8sSUFBRyxDQUFDLElBQUUsS0FBRSxJQUFJLEtBQUssS0FBSyxJQUFJLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUMsQ0FBQyxLQUFHLElBQUUsSUFBSSxLQUFLLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUMsR0FBRSxPQUFJLElBQUUsR0FBRSxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsT0FBTyxJQUFHO0FBQUEsY0FBRyxPQUFNLElBQUU7QUFBQSxjQUFDLE9BQU8sSUFBSSxLQUFLLEVBQUU7QUFBQTtBQUFBLFlBQUksSUFBRSxJQUFFLElBQUUsRUFBQyxHQUFFLEtBQUssS0FBSyxHQUFFLE1BQVEsT0FBTCxTQUFTLEtBQUssS0FBRyxLQUFLLE9BQU8sRUFBQyxFQUFFLEtBQUksTUFBRyxNQUFHLEtBQUssT0FBTyxFQUFDLE1BQUksS0FBSyxLQUFHLElBQUksS0FBSyxFQUFFLElBQUcsSUFBRSxDQUFDO0FBQUEsUUFBQyxFQUFNLFNBQUcsY0FBYTtBQUFBLFVBQU0sU0FBUSxLQUFFLEdBQUUsUUFBTyxJQUFFLEVBQUUsS0FBRyxJQUFFLEtBQUcsR0FBRTtBQUFBLFlBQUMsR0FBRSxLQUFHLEdBQUUsSUFBRTtBQUFBLFlBQUcsSUFBSSxJQUFFLEdBQUUsTUFBTSxNQUFLLEVBQUM7QUFBQSxZQUFFLElBQUcsRUFBRSxRQUFRLEdBQUU7QUFBQSxj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QU0sSUFBRSxhQUFRLElBQUUsWUFBTyxJQUFFLHVLQUFzSyxJQUFFLGlFQUFnRSxJQUFFLEVBQUMsT0FBTSxHQUFFLFFBQU8sR0FBRSxNQUFLLEdBQUUsT0FBTSxHQUFFLFNBQVEsR0FBRSxTQUFRLEdBQUUsY0FBYSxHQUFFLE9BQU0sVUFBTSxHQUFFLElBQUUsUUFBUSxDQUFDLElBQUU7QUFBQSxNQUFDLE9BQU8sY0FBYTtBQUFBLE9BQUcsSUFBRSxRQUFRLENBQUMsSUFBRSxJQUFFLElBQUU7QUFBQSxNQUFDLE9BQU8sSUFBSSxFQUFFLElBQUUsSUFBRSxHQUFFLEVBQUU7QUFBQSxPQUFHLElBQUUsUUFBUSxDQUFDLElBQUU7QUFBQSxNQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUMsSUFBRTtBQUFBLE9BQUssSUFBRSxRQUFRLENBQUMsSUFBRTtBQUFBLE1BQUMsT0FBTyxLQUFFO0FBQUEsT0FBRyxJQUFFLFFBQVEsQ0FBQyxJQUFFO0FBQUEsTUFBQyxPQUFPLEVBQUUsRUFBQyxJQUFFLEtBQUssS0FBSyxFQUFDLElBQUUsS0FBSyxNQUFNLEVBQUM7QUFBQSxPQUFHLElBQUUsUUFBUSxDQUFDLElBQUU7QUFBQSxNQUFDLE9BQU8sS0FBSyxJQUFJLEVBQUM7QUFBQSxPQUFHLElBQUUsUUFBUSxDQUFDLElBQUUsSUFBRTtBQUFBLE1BQUMsT0FBTyxLQUFFLEVBQUUsRUFBQyxJQUFFLEVBQUMsVUFBUyxNQUFHLFFBQU8sS0FBRyxFQUFFLEVBQUMsSUFBRSxHQUFDLElBQUUsRUFBQyxVQUFTLE9BQUcsUUFBTyxLQUFHLEtBQUUsR0FBQyxJQUFFLEVBQUMsVUFBUyxPQUFHLFFBQU8sR0FBRTtBQUFBLE9BQUcsSUFBRSxRQUFRLEdBQUU7QUFBQSxNQUFDLFNBQVMsRUFBQyxDQUFDLElBQUUsSUFBRSxJQUFFO0FBQUEsUUFBQyxJQUFJLEtBQUU7QUFBQSxRQUFLLElBQUcsS0FBSyxLQUFHLENBQUMsR0FBRSxLQUFLLEtBQUcsSUFBVyxPQUFKLGNBQVEsS0FBSyxNQUFJLEdBQUUsS0FBSyxzQkFBc0IsSUFBRztBQUFBLFVBQUUsT0FBTyxFQUFFLEtBQUUsRUFBRSxFQUFFLEVBQUMsSUFBRyxJQUFJO0FBQUEsUUFBRSxJQUFhLE9BQU8sTUFBakI7QUFBQSxVQUFtQixPQUFPLEtBQUssTUFBSSxJQUFFLEtBQUssc0JBQXNCLEdBQUU7QUFBQSxRQUFLLElBQWEsT0FBTyxNQUFqQjtBQUFBLFVBQW1CLE9BQU8sT0FBTyxLQUFLLEVBQUMsRUFBRSxRQUFTLFFBQVEsQ0FBQyxJQUFFO0FBQUEsWUFBQyxHQUFFLEdBQUcsRUFBRSxFQUFDLEtBQUcsR0FBRTtBQUFBLFdBQUksR0FBRSxLQUFLLGdCQUFnQixHQUFFO0FBQUEsUUFBSyxJQUFhLE9BQU8sTUFBakIsVUFBbUI7QUFBQSxVQUFDLElBQUksS0FBRSxHQUFFLE1BQU0sQ0FBQztBQUFBLFVBQUUsSUFBRyxJQUFFO0FBQUEsWUFBQyxJQUFJLEtBQUUsR0FBRSxNQUFNLENBQUMsRUFBRSxJQUFLLFFBQVEsQ0FBQyxJQUFFO0FBQUEsY0FBQyxPQUFhLE1BQU4sT0FBUSxPQUFPLEVBQUMsSUFBRTtBQUFBLGFBQUc7QUFBQSxZQUFFLE9BQU8sS0FBSyxHQUFHLFFBQU0sR0FBRSxJQUFHLEtBQUssR0FBRyxTQUFPLEdBQUUsSUFBRyxLQUFLLEdBQUcsUUFBTSxHQUFFLElBQUcsS0FBSyxHQUFHLE9BQUssR0FBRSxJQUFHLEtBQUssR0FBRyxRQUFNLEdBQUUsSUFBRyxLQUFLLEdBQUcsVUFBUSxHQUFFLElBQUcsS0FBSyxHQUFHLFVBQVEsR0FBRSxJQUFHLEtBQUssZ0JBQWdCLEdBQUU7QUFBQSxVQUFJO0FBQUEsUUFBQztBQUFBLFFBQUMsT0FBTztBQUFBO0FBQUEsTUFBSyxJQUFJLEtBQUUsR0FBRTtBQUFBLE1BQVUsT0FBTyxHQUFFLGtCQUFnQixRQUFRLEdBQUU7QUFBQSxRQUFDLElBQUksS0FBRTtBQUFBLFFBQUssS0FBSyxNQUFJLE9BQU8sS0FBSyxLQUFLLEVBQUUsRUFBRSxPQUFRLFFBQVEsQ0FBQyxJQUFFLElBQUU7QUFBQSxVQUFDLE9BQU8sTUFBRyxHQUFFLEdBQUcsT0FBSSxLQUFHLEVBQUU7QUFBQSxXQUFLLENBQUM7QUFBQSxTQUFHLEdBQUUsd0JBQXNCLFFBQVEsR0FBRTtBQUFBLFFBQUMsSUFBSSxLQUFFLEtBQUs7QUFBQSxRQUFJLEtBQUssR0FBRyxRQUFNLEVBQUUsS0FBRSxDQUFDLEdBQUUsTUFBRyxHQUFFLEtBQUssR0FBRyxTQUFPLEVBQUUsS0FBRSxDQUFDLEdBQUUsTUFBRyxHQUFFLEtBQUssR0FBRyxPQUFLLEVBQUUsS0FBRSxDQUFDLEdBQUUsTUFBRyxHQUFFLEtBQUssR0FBRyxRQUFNLEVBQUUsS0FBRSxDQUFDLEdBQUUsTUFBRyxHQUFFLEtBQUssR0FBRyxVQUFRLEVBQUUsS0FBRSxDQUFDLEdBQUUsTUFBRyxHQUFFLEtBQUssR0FBRyxVQUFRLEVBQUUsS0FBRSxDQUFDLEdBQUUsTUFBRyxHQUFFLEtBQUssR0FBRyxlQUFhO0FBQUEsU0FBRyxHQUFFLGNBQVksUUFBUSxHQUFFO0FBQUEsUUFBQyxJQUFJLEtBQUUsRUFBRSxLQUFLLEdBQUcsT0FBTSxHQUFHLEdBQUUsS0FBRSxFQUFFLEtBQUssR0FBRyxRQUFPLEdBQUcsR0FBRSxLQUFFLENBQUMsS0FBSyxHQUFHLFFBQU07QUFBQSxRQUFFLEtBQUssR0FBRyxVQUFRLE1BQUcsSUFBRSxLQUFLLEdBQUc7QUFBQSxRQUFPLElBQUksS0FBRSxFQUFFLElBQUUsR0FBRyxHQUFFLEtBQUUsRUFBRSxLQUFLLEdBQUcsT0FBTSxHQUFHLEdBQUUsS0FBRSxFQUFFLEtBQUssR0FBRyxTQUFRLEdBQUcsR0FBRSxLQUFFLEtBQUssR0FBRyxXQUFTO0FBQUEsUUFBRSxLQUFLLEdBQUcsaUJBQWUsTUFBRyxLQUFLLEdBQUcsZUFBYSxNQUFJLEtBQUUsS0FBSyxNQUFNLE9BQUksRUFBQyxJQUFFO0FBQUEsUUFBSyxJQUFJLEtBQUUsRUFBRSxJQUFFLEdBQUcsR0FBRSxLQUFFLEdBQUUsWUFBVSxHQUFFLFlBQVUsR0FBRSxZQUFVLEdBQUUsWUFBVSxHQUFFLFlBQVUsR0FBRSxVQUFTLEtBQUUsR0FBRSxVQUFRLEdBQUUsVUFBUSxHQUFFLFNBQU8sTUFBSSxJQUFHLE1BQUcsS0FBRSxNQUFJLE1BQUksTUFBSSxHQUFFLFNBQU8sR0FBRSxTQUFPLEdBQUUsU0FBTyxLQUFFLEdBQUUsU0FBTyxHQUFFLFNBQU8sR0FBRTtBQUFBLFFBQU8sT0FBWSxPQUFOLE9BQWdCLE9BQVAsT0FBUyxRQUFNO0FBQUEsU0FBRyxHQUFFLFNBQU8sUUFBUSxHQUFFO0FBQUEsUUFBQyxPQUFPLEtBQUssWUFBWTtBQUFBLFNBQUcsR0FBRSxTQUFPLFFBQVEsQ0FBQyxJQUFFO0FBQUEsUUFBQyxJQUFJLEtBQUUsTUFBRyx1QkFBc0IsS0FBRSxFQUFDLEdBQUUsS0FBSyxHQUFHLE9BQU0sSUFBRyxFQUFFLEVBQUUsS0FBSyxHQUFHLE9BQU0sR0FBRSxHQUFHLEdBQUUsTUFBSyxFQUFFLEVBQUUsS0FBSyxHQUFHLE9BQU0sR0FBRSxHQUFHLEdBQUUsR0FBRSxLQUFLLEdBQUcsUUFBTyxJQUFHLEVBQUUsRUFBRSxLQUFLLEdBQUcsUUFBTyxHQUFFLEdBQUcsR0FBRSxHQUFFLEtBQUssR0FBRyxNQUFLLElBQUcsRUFBRSxFQUFFLEtBQUssR0FBRyxNQUFLLEdBQUUsR0FBRyxHQUFFLEdBQUUsS0FBSyxHQUFHLE9BQU0sSUFBRyxFQUFFLEVBQUUsS0FBSyxHQUFHLE9BQU0sR0FBRSxHQUFHLEdBQUUsR0FBRSxLQUFLLEdBQUcsU0FBUSxJQUFHLEVBQUUsRUFBRSxLQUFLLEdBQUcsU0FBUSxHQUFFLEdBQUcsR0FBRSxHQUFFLEtBQUssR0FBRyxTQUFRLElBQUcsRUFBRSxFQUFFLEtBQUssR0FBRyxTQUFRLEdBQUUsR0FBRyxHQUFFLEtBQUksRUFBRSxFQUFFLEtBQUssR0FBRyxjQUFhLEdBQUUsR0FBRyxFQUFDO0FBQUEsUUFBRSxPQUFPLEdBQUUsUUFBUSxHQUFHLFFBQVEsQ0FBQyxJQUFFLElBQUU7QUFBQSxVQUFDLE9BQU8sTUFBRyxPQUFPLEdBQUUsR0FBRTtBQUFBLFNBQUc7QUFBQSxTQUFHLEdBQUUsS0FBRyxRQUFRLENBQUMsSUFBRTtBQUFBLFFBQUMsT0FBTyxLQUFLLE1BQUksRUFBRSxFQUFFLEVBQUM7QUFBQSxTQUFJLEdBQUUsTUFBSSxRQUFRLENBQUMsSUFBRTtBQUFBLFFBQUMsSUFBSSxLQUFFLEtBQUssS0FBSSxLQUFFLEVBQUUsRUFBQztBQUFBLFFBQUUsT0FBdUIsT0FBakIsaUJBQW1CLE1BQUcsT0FBSSxLQUFZLE9BQVYsVUFBWSxFQUFFLEtBQUUsRUFBRSxHQUFFLElBQUUsS0FBSyxHQUFHLEtBQUcsTUFBRztBQUFBLFNBQUcsR0FBRSxNQUFJLFFBQVEsQ0FBQyxJQUFFLElBQUUsSUFBRTtBQUFBLFFBQUMsSUFBSTtBQUFBLFFBQUUsT0FBTyxLQUFFLEtBQUUsS0FBRSxFQUFFLEVBQUUsRUFBQyxLQUFHLEVBQUUsRUFBQyxJQUFFLEdBQUUsTUFBSSxFQUFFLElBQUUsSUFBSSxFQUFFLEtBQUksRUFBRSxLQUFLLE1BQUksTUFBRyxLQUFFLEtBQUcsSUFBRyxJQUFJO0FBQUEsU0FBRyxHQUFFLFdBQVMsUUFBUSxDQUFDLElBQUUsSUFBRTtBQUFBLFFBQUMsT0FBTyxLQUFLLElBQUksSUFBRSxJQUFFLElBQUU7QUFBQSxTQUFHLEdBQUUsU0FBTyxRQUFRLENBQUMsSUFBRTtBQUFBLFFBQUMsSUFBSSxLQUFFLEtBQUssTUFBTTtBQUFBLFFBQUUsT0FBTyxHQUFFLEtBQUcsSUFBRTtBQUFBLFNBQUcsR0FBRSxRQUFNLFFBQVEsR0FBRTtBQUFBLFFBQUMsT0FBTyxFQUFFLEtBQUssS0FBSSxJQUFJO0FBQUEsU0FBRyxHQUFFLFdBQVMsUUFBUSxDQUFDLElBQUU7QUFBQSxRQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksS0FBSyxLQUFJLElBQUksRUFBRSxPQUFPLEtBQUssRUFBRSxFQUFFLFFBQVEsQ0FBQyxFQUFDO0FBQUEsU0FBRyxHQUFFLFVBQVEsUUFBUSxHQUFFO0FBQUEsUUFBQyxPQUFPLEtBQUssZUFBZTtBQUFBLFNBQUcsR0FBRSxlQUFhLFFBQVEsR0FBRTtBQUFBLFFBQUMsT0FBTyxLQUFLLElBQUksY0FBYztBQUFBLFNBQUcsR0FBRSxpQkFBZSxRQUFRLEdBQUU7QUFBQSxRQUFDLE9BQU8sS0FBSyxHQUFHLGNBQWM7QUFBQSxTQUFHLEdBQUUsVUFBUSxRQUFRLEdBQUU7QUFBQSxRQUFDLE9BQU8sS0FBSyxJQUFJLFNBQVM7QUFBQSxTQUFHLEdBQUUsWUFBVSxRQUFRLEdBQUU7QUFBQSxRQUFDLE9BQU8sS0FBSyxHQUFHLFNBQVM7QUFBQSxTQUFHLEdBQUUsVUFBUSxRQUFRLEdBQUU7QUFBQSxRQUFDLE9BQU8sS0FBSyxJQUFJLFNBQVM7QUFBQSxTQUFHLEdBQUUsWUFBVSxRQUFRLEdBQUU7QUFBQSxRQUFDLE9BQU8sS0FBSyxHQUFHLFNBQVM7QUFBQSxTQUFHLEdBQUUsUUFBTSxRQUFRLEdBQUU7QUFBQSxRQUFDLE9BQU8sS0FBSyxJQUFJLE9BQU87QUFBQSxTQUFHLEdBQUUsVUFBUSxRQUFRLEdBQUU7QUFBQSxRQUFDLE9BQU8sS0FBSyxHQUFHLE9BQU87QUFBQSxTQUFHLEdBQUUsT0FBSyxRQUFRLEdBQUU7QUFBQSxRQUFDLE9BQU8sS0FBSyxJQUFJLE1BQU07QUFBQSxTQUFHLEdBQUUsU0FBTyxRQUFRLEdBQUU7QUFBQSxRQUFDLE9BQU8sS0FBSyxHQUFHLE1BQU07QUFBQSxTQUFHLEdBQUUsUUFBTSxRQUFRLEdBQUU7QUFBQSxRQUFDLE9BQU8sS0FBSyxJQUFJLE9BQU87QUFBQSxTQUFHLEdBQUUsVUFBUSxRQUFRLEdBQUU7QUFBQSxRQUFDLE9BQU8sS0FBSyxHQUFHLE9BQU87QUFBQSxTQUFHLEdBQUUsU0FBTyxRQUFRLEdBQUU7QUFBQSxRQUFDLE9BQU8sS0FBSyxJQUFJLFFBQVE7QUFBQSxTQUFHLEdBQUUsV0FBUyxRQUFRLEdBQUU7QUFBQSxRQUFDLE9BQU8sS0FBSyxHQUFHLFFBQVE7QUFBQSxTQUFHLEdBQUUsUUFBTSxRQUFRLEdBQUU7QUFBQSxRQUFDLE9BQU8sS0FBSyxJQUFJLE9BQU87QUFBQSxTQUFHLEdBQUUsVUFBUSxRQUFRLEdBQUU7QUFBQSxRQUFDLE9BQU8sS0FBSyxHQUFHLE9BQU87QUFBQSxTQUFHO0FBQUEsTUFBRyxHQUFFLElBQUUsUUFBUSxDQUFDLElBQUUsSUFBRSxJQUFFO0FBQUEsTUFBQyxPQUFPLEdBQUUsSUFBSSxHQUFFLE1BQU0sSUFBRSxJQUFFLEdBQUcsRUFBRSxJQUFJLEdBQUUsT0FBTyxJQUFFLElBQUUsR0FBRyxFQUFFLElBQUksR0FBRSxLQUFLLElBQUUsSUFBRSxHQUFHLEVBQUUsSUFBSSxHQUFFLE1BQU0sSUFBRSxJQUFFLEdBQUcsRUFBRSxJQUFJLEdBQUUsUUFBUSxJQUFFLElBQUUsR0FBRyxFQUFFLElBQUksR0FBRSxRQUFRLElBQUUsSUFBRSxHQUFHLEVBQUUsSUFBSSxHQUFFLGFBQWEsSUFBRSxJQUFFLElBQUk7QUFBQTtBQUFBLElBQUcsT0FBTyxRQUFRLENBQUMsSUFBRSxJQUFFLElBQUU7QUFBQSxNQUFDLElBQUUsSUFBRSxJQUFFLEdBQUUsRUFBRSxPQUFPLEdBQUUsR0FBRSxXQUFTLFFBQVEsQ0FBQyxJQUFFLElBQUU7QUFBQSxRQUFDLElBQUksS0FBRSxHQUFFLE9BQU87QUFBQSxRQUFFLE9BQU8sRUFBRSxJQUFFLEVBQUMsSUFBRyxHQUFDLEdBQUUsRUFBQztBQUFBLFNBQUcsR0FBRSxhQUFXO0FBQUEsTUFBRSxJQUFJLEtBQUUsR0FBRSxVQUFVLEtBQUksS0FBRSxHQUFFLFVBQVU7QUFBQSxNQUFTLEdBQUUsVUFBVSxNQUFJLFFBQVEsQ0FBQyxJQUFFLElBQUU7QUFBQSxRQUFDLE9BQU8sRUFBRSxFQUFDLElBQUUsRUFBRSxNQUFLLElBQUUsQ0FBQyxJQUFFLEdBQUUsS0FBSyxJQUFJLEVBQUUsSUFBRSxFQUFDO0FBQUEsU0FBRyxHQUFFLFVBQVUsV0FBUyxRQUFRLENBQUMsSUFBRSxJQUFFO0FBQUEsUUFBQyxPQUFPLEVBQUUsRUFBQyxJQUFFLEVBQUUsTUFBSyxJQUFFLEVBQUUsSUFBRSxHQUFFLEtBQUssSUFBSSxFQUFFLElBQUUsRUFBQztBQUFBO0FBQUE7QUFBQSxHQUFLO0FBQUE7OztBQzh4QnJ0SjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBaW5CQTtBQUNBO0FBLzNDQSxJQUFJLFNBQVUsUUFBUSxHQUFHO0FBQUEsRUFDdkIsSUFBSSxvQkFBb0IsT0FBTyxRQUFRLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRztBQUFBLElBQ25ELEtBQUssS0FBSyxNQUFNLENBQUMsR0FBRyxJQUFJLEVBQUUsT0FBUSxLQUFLLEdBQUcsRUFBRSxNQUFNO0FBQUE7QUFBQSxJQUNsRCxPQUFPO0FBQUEsS0FDTixHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFO0FBQUEsRUFDL2QsSUFBSSxVQUFVO0FBQUEsSUFDWix1QkFBdUIsT0FBTyxTQUFTLEtBQUssR0FBRyxJQUM1QyxPQUFPO0FBQUEsSUFDVixJQUFJLENBQUM7QUFBQSxJQUNMLFVBQVUsRUFBRSxPQUFTLEdBQUcsT0FBUyxHQUFHLE9BQVMsR0FBRyxVQUFZLEdBQUcsS0FBTyxHQUFHLE1BQVEsR0FBRyxPQUFTLEdBQUcsV0FBYSxHQUFHLElBQU0sSUFBSSxTQUFXLElBQUksZ0JBQWtCLElBQUksaUJBQW1CLElBQUksbUJBQXFCLElBQUksa0JBQW9CLElBQUksZ0JBQWtCLElBQUksa0JBQW9CLElBQUksZ0JBQWtCLElBQUksU0FBVyxJQUFJLGdCQUFrQixJQUFJLGtCQUFvQixJQUFJLFlBQWMsSUFBSSxtQkFBcUIsSUFBSSxTQUFXLElBQUksWUFBYyxJQUFJLGNBQWdCLElBQUksVUFBWSxJQUFJLFVBQVksSUFBSSxhQUFlLElBQUksT0FBUyxJQUFJLFdBQWEsSUFBSSxpQkFBbUIsSUFBSSxXQUFhLElBQUksaUJBQW1CLElBQUksMkJBQTZCLElBQUksU0FBVyxJQUFJLGdCQUFrQixJQUFJLFNBQVcsSUFBSSxVQUFZLElBQUksT0FBUyxJQUFJLGNBQWdCLElBQUksY0FBZ0IsSUFBSSxNQUFRLElBQUkscUJBQXVCLElBQUksU0FBVyxHQUFHLE1BQVEsRUFBRTtBQUFBLElBQ2p6QixZQUFZLEVBQUUsR0FBRyxTQUFTLEdBQUcsU0FBUyxHQUFHLE9BQU8sR0FBRyxTQUFTLElBQUksTUFBTSxJQUFJLGtCQUFrQixJQUFJLG1CQUFtQixJQUFJLHFCQUFxQixJQUFJLG9CQUFvQixJQUFJLGtCQUFrQixJQUFJLG9CQUFvQixJQUFJLGtCQUFrQixJQUFJLGtCQUFrQixJQUFJLG9CQUFvQixJQUFJLGNBQWMsSUFBSSxxQkFBcUIsSUFBSSxXQUFXLElBQUksY0FBYyxJQUFJLGdCQUFnQixJQUFJLFlBQVksSUFBSSxZQUFZLElBQUksZUFBZSxJQUFJLFNBQVMsSUFBSSxhQUFhLElBQUksbUJBQW1CLElBQUksYUFBYSxJQUFJLG1CQUFtQixJQUFJLDZCQUE2QixJQUFJLFdBQVcsSUFBSSxXQUFXLElBQUksWUFBWSxJQUFJLFNBQVMsSUFBSSxnQkFBZ0IsSUFBSSxnQkFBZ0IsSUFBSSxPQUFPO0FBQUEsSUFDcnBCLGNBQWMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFB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LElBQ2QsT0FBTyxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFL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LFlBQ0gsS0FBSyxTQUFTO0FBQUEsWUFDZDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsS0FBSyxNQUFNLE9BQU87QUFBQSxZQUNsQjtBQUFBLGVBQ0c7QUFBQSxZQUNILEtBQUssU0FBUztBQUFBLFlBQ2Q7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFD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O0FBQUE7QUFBQTtBQUFBLFlBU1IsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBLFlBSVIsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsWUFLUixRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxZQUtSLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQSxZQUlSLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQSxZQUlSLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQSxZQUlSLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1CQUtELFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxjQU9iLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsbUJBTUgsUUFBUTtBQUFBLFlBQ2YsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxjQVlOLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsbUJBZUgsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBLFlBSWYsUUFBUTtBQUFBO0FBQUEsbUJBRUQsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBLFlBSWYsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFlBYVIsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxZQU1SLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsWUFNUixRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxZQVdSLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxZQU9SLFFBQVE7QUFBQSxjQUNOLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsWUFNVixRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxZQUtSLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxZQVVSLFFBQVE7QUFBQSxjQUNOLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxZQU9WLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxjQVVOLFFBQVE7QUFBQSxZQUNWLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFlBUVIsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFlBYVIsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGNBVU4sUUFBUTtBQUFBLFlBQ1YsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsY0FRTixRQUFRO0FBQUEsWUFDVixRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxjQVFOLFFBQVE7QUFBQSxZQUNWLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFlBaUJSLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsWUFZUixRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUEsY0FJTixRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFlBTVYsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFlBT1IsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxZQU1SLFFBQVEsY0FBYyxRQUFRO0FBQUEsbUJBQ3ZCLFFBQVE7QUFBQTtBQUFBLEdBRXhCLFdBQVc7QUFDZCxJQUFJLGlCQUFpQjtBQUdyQixJQUFJLFVBQVU7QUFBQSxFQUNaLFFBQVE7QUFBQSxFQUNSLElBQUk7QUFBQSxFQUNKLFVBQVU7QUFBQSxFQUNWLFFBQVE7QUFDVjsiLAogICJkZWJ1Z0lkIjogIjU1RUQ2RTM1QTlFRjQwQkE2NDc1NkUyMTY0NzU2RTIxIiwKICAibmFtZXMiOiBbXQp9
