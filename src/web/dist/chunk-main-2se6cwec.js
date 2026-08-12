// node_modules/roughjs/bundled/rough.esm.js
function t(t2, e, s) {
  if (t2 && t2.length) {
    const [n, o] = e, a = Math.PI / 180 * s, h = Math.cos(a), r = Math.sin(a);
    for (const e2 of t2) {
      const [t3, s2] = e2;
      e2[0] = (t3 - n) * h - (s2 - o) * r + n, e2[1] = (t3 - n) * r + (s2 - o) * h + o;
    }
  }
}
function e(t2, e2) {
  return t2[0] === e2[0] && t2[1] === e2[1];
}
function s(s2, n, o, a = 1) {
  const h = o, r = Math.max(n, 0.1), i = s2[0] && s2[0][0] && typeof s2[0][0] == "number" ? [s2] : s2, c = [0, 0];
  if (h)
    for (const e2 of i)
      t(e2, c, h);
  const l = function(t2, s3, n2) {
    const o2 = [];
    for (const s4 of t2) {
      const t3 = [...s4];
      e(t3[0], t3[t3.length - 1]) || t3.push([t3[0][0], t3[0][1]]), t3.length > 2 && o2.push(t3);
    }
    const a2 = [];
    s3 = Math.max(s3, 0.1);
    const h2 = [];
    for (const t3 of o2)
      for (let e2 = 0;e2 < t3.length - 1; e2++) {
        const s4 = t3[e2], n3 = t3[e2 + 1];
        if (s4[1] !== n3[1]) {
          const t4 = Math.min(s4[1], n3[1]);
          h2.push({ ymin: t4, ymax: Math.max(s4[1], n3[1]), x: t4 === s4[1] ? s4[0] : n3[0], islope: (n3[0] - s4[0]) / (n3[1] - s4[1]) });
        }
      }
    if (h2.sort((t3, e2) => t3.ymin < e2.ymin ? -1 : t3.ymin > e2.ymin ? 1 : t3.x < e2.x ? -1 : t3.x > e2.x ? 1 : t3.ymax === e2.ymax ? 0 : (t3.ymax - e2.ymax) / Math.abs(t3.ymax - e2.ymax)), !h2.length)
      return a2;
    let r2 = [], i2 = h2[0].ymin, c2 = 0;
    for (;r2.length || h2.length; ) {
      if (h2.length) {
        let t3 = -1;
        for (let e2 = 0;e2 < h2.length && !(h2[e2].ymin > i2); e2++)
          t3 = e2;
        h2.splice(0, t3 + 1).forEach((t4) => {
          r2.push({ s: i2, edge: t4 });
        });
      }
      if (r2 = r2.filter((t3) => !(t3.edge.ymax <= i2)), r2.sort((t3, e2) => t3.edge.x === e2.edge.x ? 0 : (t3.edge.x - e2.edge.x) / Math.abs(t3.edge.x - e2.edge.x)), (n2 !== 1 || c2 % s3 == 0) && r2.length > 1)
        for (let t3 = 0;t3 < r2.length; t3 += 2) {
          const e2 = t3 + 1;
          if (e2 >= r2.length)
            break;
          const s4 = r2[t3].edge, n3 = r2[e2].edge;
          a2.push([[Math.round(s4.x), i2], [Math.round(n3.x), i2]]);
        }
      i2 += n2, r2.forEach((t3) => {
        t3.edge.x = t3.edge.x + n2 * t3.edge.islope;
      }), c2++;
    }
    return a2;
  }(i, r, a);
  if (h) {
    for (const e2 of i)
      t(e2, c, -h);
    (function(e2, s3, n2) {
      const o2 = [];
      e2.forEach((t2) => o2.push(...t2)), t(o2, s3, n2);
    })(l, c, -h);
  }
  return l;
}
function n(t2, e2) {
  var n2;
  const o = e2.hachureAngle + 90;
  let a = e2.hachureGap;
  a < 0 && (a = 4 * e2.strokeWidth), a = Math.round(Math.max(a, 0.1));
  let h = 1;
  return e2.roughness >= 1 && (((n2 = e2.randomizer) === null || n2 === undefined ? undefined : n2.next()) || Math.random()) > 0.7 && (h = a), s(t2, a, o, h || 1);
}

class o {
  constructor(t2) {
    this.helper = t2;
  }
  fillPolygons(t2, e2) {
    return this._fillPolygons(t2, e2);
  }
  _fillPolygons(t2, e2) {
    const s2 = n(t2, e2);
    return { type: "fillSketch", ops: this.renderLines(s2, e2) };
  }
  renderLines(t2, e2) {
    const s2 = [];
    for (const n2 of t2)
      s2.push(...this.helper.doubleLineOps(n2[0][0], n2[0][1], n2[1][0], n2[1][1], e2));
    return s2;
  }
}
function a(t2) {
  const e2 = t2[0], s2 = t2[1];
  return Math.sqrt(Math.pow(e2[0] - s2[0], 2) + Math.pow(e2[1] - s2[1], 2));
}

class h extends o {
  fillPolygons(t2, e2) {
    let s2 = e2.hachureGap;
    s2 < 0 && (s2 = 4 * e2.strokeWidth), s2 = Math.max(s2, 0.1);
    const o2 = n(t2, Object.assign({}, e2, { hachureGap: s2 })), h2 = Math.PI / 180 * e2.hachureAngle, r = [], i = 0.5 * s2 * Math.cos(h2), c = 0.5 * s2 * Math.sin(h2);
    for (const [t3, e3] of o2)
      a([t3, e3]) && r.push([[t3[0] - i, t3[1] + c], [...e3]], [[t3[0] + i, t3[1] - c], [...e3]]);
    return { type: "fillSketch", ops: this.renderLines(r, e2) };
  }
}

class r extends o {
  fillPolygons(t2, e2) {
    const s2 = this._fillPolygons(t2, e2), n2 = Object.assign({}, e2, { hachureAngle: e2.hachureAngle + 90 }), o2 = this._fillPolygons(t2, n2);
    return s2.ops = s2.ops.concat(o2.ops), s2;
  }
}

class i {
  constructor(t2) {
    this.helper = t2;
  }
  fillPolygons(t2, e2) {
    const s2 = n(t2, e2 = Object.assign({}, e2, { hachureAngle: 0 }));
    return this.dotsOnLines(s2, e2);
  }
  dotsOnLines(t2, e2) {
    const s2 = [];
    let n2 = e2.hachureGap;
    n2 < 0 && (n2 = 4 * e2.strokeWidth), n2 = Math.max(n2, 0.1);
    let o2 = e2.fillWeight;
    o2 < 0 && (o2 = e2.strokeWidth / 2);
    const h2 = n2 / 4;
    for (const r2 of t2) {
      const t3 = a(r2), i2 = t3 / n2, c = Math.ceil(i2) - 1, l = t3 - c * n2, u = (r2[0][0] + r2[1][0]) / 2 - n2 / 4, p = Math.min(r2[0][1], r2[1][1]);
      for (let t4 = 0;t4 < c; t4++) {
        const a2 = p + l + t4 * n2, r3 = u - h2 + 2 * Math.random() * h2, i3 = a2 - h2 + 2 * Math.random() * h2, c2 = this.helper.ellipse(r3, i3, o2, o2, e2);
        s2.push(...c2.ops);
      }
    }
    return { type: "fillSketch", ops: s2 };
  }
}

class c {
  constructor(t2) {
    this.helper = t2;
  }
  fillPolygons(t2, e2) {
    const s2 = n(t2, e2);
    return { type: "fillSketch", ops: this.dashedLine(s2, e2) };
  }
  dashedLine(t2, e2) {
    const s2 = e2.dashOffset < 0 ? e2.hachureGap < 0 ? 4 * e2.strokeWidth : e2.hachureGap : e2.dashOffset, n2 = e2.dashGap < 0 ? e2.hachureGap < 0 ? 4 * e2.strokeWidth : e2.hachureGap : e2.dashGap, o2 = [];
    return t2.forEach((t3) => {
      const h2 = a(t3), r2 = Math.floor(h2 / (s2 + n2)), i2 = (h2 + n2 - r2 * (s2 + n2)) / 2;
      let c2 = t3[0], l = t3[1];
      c2[0] > l[0] && (c2 = t3[1], l = t3[0]);
      const u = Math.atan((l[1] - c2[1]) / (l[0] - c2[0]));
      for (let t4 = 0;t4 < r2; t4++) {
        const a2 = t4 * (s2 + n2), h3 = a2 + s2, r3 = [c2[0] + a2 * Math.cos(u) + i2 * Math.cos(u), c2[1] + a2 * Math.sin(u) + i2 * Math.sin(u)], l2 = [c2[0] + h3 * Math.cos(u) + i2 * Math.cos(u), c2[1] + h3 * Math.sin(u) + i2 * Math.sin(u)];
        o2.push(...this.helper.doubleLineOps(r3[0], r3[1], l2[0], l2[1], e2));
      }
    }), o2;
  }
}

class l {
  constructor(t2) {
    this.helper = t2;
  }
  fillPolygons(t2, e2) {
    const s2 = e2.hachureGap < 0 ? 4 * e2.strokeWidth : e2.hachureGap, o2 = e2.zigzagOffset < 0 ? s2 : e2.zigzagOffset, a2 = n(t2, e2 = Object.assign({}, e2, { hachureGap: s2 + o2 }));
    return { type: "fillSketch", ops: this.zigzagLines(a2, o2, e2) };
  }
  zigzagLines(t2, e2, s2) {
    const n2 = [];
    return t2.forEach((t3) => {
      const o2 = a(t3), h2 = Math.round(o2 / (2 * e2));
      let r2 = t3[0], i2 = t3[1];
      r2[0] > i2[0] && (r2 = t3[1], i2 = t3[0]);
      const c2 = Math.atan((i2[1] - r2[1]) / (i2[0] - r2[0]));
      for (let t4 = 0;t4 < h2; t4++) {
        const o3 = 2 * t4 * e2, a2 = 2 * (t4 + 1) * e2, h3 = Math.sqrt(2 * Math.pow(e2, 2)), i3 = [r2[0] + o3 * Math.cos(c2), r2[1] + o3 * Math.sin(c2)], l2 = [r2[0] + a2 * Math.cos(c2), r2[1] + a2 * Math.sin(c2)], u = [i3[0] + h3 * Math.cos(c2 + Math.PI / 4), i3[1] + h3 * Math.sin(c2 + Math.PI / 4)];
        n2.push(...this.helper.doubleLineOps(i3[0], i3[1], u[0], u[1], s2), ...this.helper.doubleLineOps(u[0], u[1], l2[0], l2[1], s2));
      }
    }), n2;
  }
}
var u = {};

class p {
  constructor(t2) {
    this.seed = t2;
  }
  next() {
    return this.seed ? (2 ** 31 - 1 & (this.seed = Math.imul(48271, this.seed))) / 2 ** 31 : Math.random();
  }
}
var f = 0;
var d = 1;
var g = 2;
var M = { A: 7, a: 7, C: 6, c: 6, H: 1, h: 1, L: 2, l: 2, M: 2, m: 2, Q: 4, q: 4, S: 4, s: 4, T: 2, t: 2, V: 1, v: 1, Z: 0, z: 0 };
function k(t2, e2) {
  return t2.type === e2;
}
function b(t2) {
  const e2 = [], s2 = function(t3) {
    const e3 = new Array;
    for (;t3 !== ""; )
      if (t3.match(/^([ \t\r\n,]+)/))
        t3 = t3.substr(RegExp.$1.length);
      else if (t3.match(/^([aAcChHlLmMqQsStTvVzZ])/))
        e3[e3.length] = { type: f, text: RegExp.$1 }, t3 = t3.substr(RegExp.$1.length);
      else {
        if (!t3.match(/^(([-+]?[0-9]+(\.[0-9]*)?|[-+]?\.[0-9]+)([eE][-+]?[0-9]+)?)/))
          return [];
        e3[e3.length] = { type: d, text: `${parseFloat(RegExp.$1)}` }, t3 = t3.substr(RegExp.$1.length);
      }
    return e3[e3.length] = { type: g, text: "" }, e3;
  }(t2);
  let n2 = "BOD", o2 = 0, a2 = s2[o2];
  for (;!k(a2, g); ) {
    let h2 = 0;
    const r2 = [];
    if (n2 === "BOD") {
      if (a2.text !== "M" && a2.text !== "m")
        return b("M0,0" + t2);
      o2++, h2 = M[a2.text], n2 = a2.text;
    } else
      k(a2, d) ? h2 = M[n2] : (o2++, h2 = M[a2.text], n2 = a2.text);
    if (!(o2 + h2 < s2.length))
      throw new Error("Path data ended short");
    for (let t3 = o2;t3 < o2 + h2; t3++) {
      const e3 = s2[t3];
      if (!k(e3, d))
        throw new Error("Param not a number: " + n2 + "," + e3.text);
      r2[r2.length] = +e3.text;
    }
    if (typeof M[n2] != "number")
      throw new Error("Bad segment: " + n2);
    {
      const t3 = { key: n2, data: r2 };
      e2.push(t3), o2 += h2, a2 = s2[o2], n2 === "M" && (n2 = "L"), n2 === "m" && (n2 = "l");
    }
  }
  return e2;
}
function y(t2) {
  let e2 = 0, s2 = 0, n2 = 0, o2 = 0;
  const a2 = [];
  for (const { key: h2, data: r2 } of t2)
    switch (h2) {
      case "M":
        a2.push({ key: "M", data: [...r2] }), [e2, s2] = r2, [n2, o2] = r2;
        break;
      case "m":
        e2 += r2[0], s2 += r2[1], a2.push({ key: "M", data: [e2, s2] }), n2 = e2, o2 = s2;
        break;
      case "L":
        a2.push({ key: "L", data: [...r2] }), [e2, s2] = r2;
        break;
      case "l":
        e2 += r2[0], s2 += r2[1], a2.push({ key: "L", data: [e2, s2] });
        break;
      case "C":
        a2.push({ key: "C", data: [...r2] }), e2 = r2[4], s2 = r2[5];
        break;
      case "c": {
        const t3 = r2.map((t4, n3) => n3 % 2 ? t4 + s2 : t4 + e2);
        a2.push({ key: "C", data: t3 }), e2 = t3[4], s2 = t3[5];
        break;
      }
      case "Q":
        a2.push({ key: "Q", data: [...r2] }), e2 = r2[2], s2 = r2[3];
        break;
      case "q": {
        const t3 = r2.map((t4, n3) => n3 % 2 ? t4 + s2 : t4 + e2);
        a2.push({ key: "Q", data: t3 }), e2 = t3[2], s2 = t3[3];
        break;
      }
      case "A":
        a2.push({ key: "A", data: [...r2] }), e2 = r2[5], s2 = r2[6];
        break;
      case "a":
        e2 += r2[5], s2 += r2[6], a2.push({ key: "A", data: [r2[0], r2[1], r2[2], r2[3], r2[4], e2, s2] });
        break;
      case "H":
        a2.push({ key: "H", data: [...r2] }), e2 = r2[0];
        break;
      case "h":
        e2 += r2[0], a2.push({ key: "H", data: [e2] });
        break;
      case "V":
        a2.push({ key: "V", data: [...r2] }), s2 = r2[0];
        break;
      case "v":
        s2 += r2[0], a2.push({ key: "V", data: [s2] });
        break;
      case "S":
        a2.push({ key: "S", data: [...r2] }), e2 = r2[2], s2 = r2[3];
        break;
      case "s": {
        const t3 = r2.map((t4, n3) => n3 % 2 ? t4 + s2 : t4 + e2);
        a2.push({ key: "S", data: t3 }), e2 = t3[2], s2 = t3[3];
        break;
      }
      case "T":
        a2.push({ key: "T", data: [...r2] }), e2 = r2[0], s2 = r2[1];
        break;
      case "t":
        e2 += r2[0], s2 += r2[1], a2.push({ key: "T", data: [e2, s2] });
        break;
      case "Z":
      case "z":
        a2.push({ key: "Z", data: [] }), e2 = n2, s2 = o2;
    }
  return a2;
}
function m(t2) {
  const e2 = [];
  let s2 = "", n2 = 0, o2 = 0, a2 = 0, h2 = 0, r2 = 0, i2 = 0;
  for (const { key: c2, data: l2 } of t2) {
    switch (c2) {
      case "M":
        e2.push({ key: "M", data: [...l2] }), [n2, o2] = l2, [a2, h2] = l2;
        break;
      case "C":
        e2.push({ key: "C", data: [...l2] }), n2 = l2[4], o2 = l2[5], r2 = l2[2], i2 = l2[3];
        break;
      case "L":
        e2.push({ key: "L", data: [...l2] }), [n2, o2] = l2;
        break;
      case "H":
        n2 = l2[0], e2.push({ key: "L", data: [n2, o2] });
        break;
      case "V":
        o2 = l2[0], e2.push({ key: "L", data: [n2, o2] });
        break;
      case "S": {
        let t3 = 0, a3 = 0;
        s2 === "C" || s2 === "S" ? (t3 = n2 + (n2 - r2), a3 = o2 + (o2 - i2)) : (t3 = n2, a3 = o2), e2.push({ key: "C", data: [t3, a3, ...l2] }), r2 = l2[0], i2 = l2[1], n2 = l2[2], o2 = l2[3];
        break;
      }
      case "T": {
        const [t3, a3] = l2;
        let h3 = 0, c3 = 0;
        s2 === "Q" || s2 === "T" ? (h3 = n2 + (n2 - r2), c3 = o2 + (o2 - i2)) : (h3 = n2, c3 = o2);
        const u2 = n2 + 2 * (h3 - n2) / 3, p2 = o2 + 2 * (c3 - o2) / 3, f2 = t3 + 2 * (h3 - t3) / 3, d2 = a3 + 2 * (c3 - a3) / 3;
        e2.push({ key: "C", data: [u2, p2, f2, d2, t3, a3] }), r2 = h3, i2 = c3, n2 = t3, o2 = a3;
        break;
      }
      case "Q": {
        const [t3, s3, a3, h3] = l2, c3 = n2 + 2 * (t3 - n2) / 3, u2 = o2 + 2 * (s3 - o2) / 3, p2 = a3 + 2 * (t3 - a3) / 3, f2 = h3 + 2 * (s3 - h3) / 3;
        e2.push({ key: "C", data: [c3, u2, p2, f2, a3, h3] }), r2 = t3, i2 = s3, n2 = a3, o2 = h3;
        break;
      }
      case "A": {
        const t3 = Math.abs(l2[0]), s3 = Math.abs(l2[1]), a3 = l2[2], h3 = l2[3], r3 = l2[4], i3 = l2[5], c3 = l2[6];
        if (t3 === 0 || s3 === 0)
          e2.push({ key: "C", data: [n2, o2, i3, c3, i3, c3] }), n2 = i3, o2 = c3;
        else if (n2 !== i3 || o2 !== c3) {
          x(n2, o2, i3, c3, t3, s3, a3, h3, r3).forEach(function(t4) {
            e2.push({ key: "C", data: t4 });
          }), n2 = i3, o2 = c3;
        }
        break;
      }
      case "Z":
        e2.push({ key: "Z", data: [] }), n2 = a2, o2 = h2;
    }
    s2 = c2;
  }
  return e2;
}
function w(t2, e2, s2) {
  return [t2 * Math.cos(s2) - e2 * Math.sin(s2), t2 * Math.sin(s2) + e2 * Math.cos(s2)];
}
function x(t2, e2, s2, n2, o2, a2, h2, r2, i2, c2) {
  const l2 = (u2 = h2, Math.PI * u2 / 180);
  var u2;
  let p2 = [], f2 = 0, d2 = 0, g2 = 0, M2 = 0;
  if (c2)
    [f2, d2, g2, M2] = c2;
  else {
    [t2, e2] = w(t2, e2, -l2), [s2, n2] = w(s2, n2, -l2);
    const h3 = (t2 - s2) / 2, c3 = (e2 - n2) / 2;
    let u3 = h3 * h3 / (o2 * o2) + c3 * c3 / (a2 * a2);
    u3 > 1 && (u3 = Math.sqrt(u3), o2 *= u3, a2 *= u3);
    const p3 = o2 * o2, k3 = a2 * a2, b3 = p3 * k3 - p3 * c3 * c3 - k3 * h3 * h3, y3 = p3 * c3 * c3 + k3 * h3 * h3, m3 = (r2 === i2 ? -1 : 1) * Math.sqrt(Math.abs(b3 / y3));
    g2 = m3 * o2 * c3 / a2 + (t2 + s2) / 2, M2 = m3 * -a2 * h3 / o2 + (e2 + n2) / 2, f2 = Math.asin(parseFloat(((e2 - M2) / a2).toFixed(9))), d2 = Math.asin(parseFloat(((n2 - M2) / a2).toFixed(9))), t2 < g2 && (f2 = Math.PI - f2), s2 < g2 && (d2 = Math.PI - d2), f2 < 0 && (f2 = 2 * Math.PI + f2), d2 < 0 && (d2 = 2 * Math.PI + d2), i2 && f2 > d2 && (f2 -= 2 * Math.PI), !i2 && d2 > f2 && (d2 -= 2 * Math.PI);
  }
  let k2 = d2 - f2;
  if (Math.abs(k2) > 120 * Math.PI / 180) {
    const t3 = d2, e3 = s2, r3 = n2;
    d2 = i2 && d2 > f2 ? f2 + 120 * Math.PI / 180 * 1 : f2 + 120 * Math.PI / 180 * -1, p2 = x(s2 = g2 + o2 * Math.cos(d2), n2 = M2 + a2 * Math.sin(d2), e3, r3, o2, a2, h2, 0, i2, [d2, t3, g2, M2]);
  }
  k2 = d2 - f2;
  const b2 = Math.cos(f2), y2 = Math.sin(f2), m2 = Math.cos(d2), P = Math.sin(d2), v = Math.tan(k2 / 4), S = 4 / 3 * o2 * v, O = 4 / 3 * a2 * v, L = [t2, e2], T = [t2 + S * y2, e2 - O * b2], D = [s2 + S * P, n2 - O * m2], A = [s2, n2];
  if (T[0] = 2 * L[0] - T[0], T[1] = 2 * L[1] - T[1], c2)
    return [T, D, A].concat(p2);
  {
    p2 = [T, D, A].concat(p2);
    const t3 = [];
    for (let e3 = 0;e3 < p2.length; e3 += 3) {
      const s3 = w(p2[e3][0], p2[e3][1], l2), n3 = w(p2[e3 + 1][0], p2[e3 + 1][1], l2), o3 = w(p2[e3 + 2][0], p2[e3 + 2][1], l2);
      t3.push([s3[0], s3[1], n3[0], n3[1], o3[0], o3[1]]);
    }
    return t3;
  }
}
var P = { randOffset: function(t2, e2) {
  return G(t2, e2);
}, randOffsetWithRange: function(t2, e2, s2) {
  return E(t2, e2, s2);
}, ellipse: function(t2, e2, s2, n2, o2) {
  const a2 = T(s2, n2, o2);
  return D(t2, e2, o2, a2).opset;
}, doubleLineOps: function(t2, e2, s2, n2, o2) {
  return $(t2, e2, s2, n2, o2, true);
} };
function v(t2, e2, s2, n2, o2) {
  return { type: "path", ops: $(t2, e2, s2, n2, o2) };
}
function S(t2, e2, s2) {
  const n2 = (t2 || []).length;
  if (n2 > 2) {
    const o2 = [];
    for (let e3 = 0;e3 < n2 - 1; e3++)
      o2.push(...$(t2[e3][0], t2[e3][1], t2[e3 + 1][0], t2[e3 + 1][1], s2));
    return e2 && o2.push(...$(t2[n2 - 1][0], t2[n2 - 1][1], t2[0][0], t2[0][1], s2)), { type: "path", ops: o2 };
  }
  return n2 === 2 ? v(t2[0][0], t2[0][1], t2[1][0], t2[1][1], s2) : { type: "path", ops: [] };
}
function O(t2, e2, s2, n2, o2) {
  return function(t3, e3) {
    return S(t3, true, e3);
  }([[t2, e2], [t2 + s2, e2], [t2 + s2, e2 + n2], [t2, e2 + n2]], o2);
}
function L(t2, e2) {
  if (t2.length) {
    const s2 = typeof t2[0][0] == "number" ? [t2] : t2, n2 = j(s2[0], 1 * (1 + 0.2 * e2.roughness), e2), o2 = e2.disableMultiStroke ? [] : j(s2[0], 1.5 * (1 + 0.22 * e2.roughness), z(e2));
    for (let t3 = 1;t3 < s2.length; t3++) {
      const a2 = s2[t3];
      if (a2.length) {
        const t4 = j(a2, 1 * (1 + 0.2 * e2.roughness), e2), s3 = e2.disableMultiStroke ? [] : j(a2, 1.5 * (1 + 0.22 * e2.roughness), z(e2));
        for (const e3 of t4)
          e3.op !== "move" && n2.push(e3);
        for (const t5 of s3)
          t5.op !== "move" && o2.push(t5);
      }
    }
    return { type: "path", ops: n2.concat(o2) };
  }
  return { type: "path", ops: [] };
}
function T(t2, e2, s2) {
  const n2 = Math.sqrt(2 * Math.PI * Math.sqrt((Math.pow(t2 / 2, 2) + Math.pow(e2 / 2, 2)) / 2)), o2 = Math.ceil(Math.max(s2.curveStepCount, s2.curveStepCount / Math.sqrt(200) * n2)), a2 = 2 * Math.PI / o2;
  let h2 = Math.abs(t2 / 2), r2 = Math.abs(e2 / 2);
  const i2 = 1 - s2.curveFitting;
  return h2 += G(h2 * i2, s2), r2 += G(r2 * i2, s2), { increment: a2, rx: h2, ry: r2 };
}
function D(t2, e2, s2, n2) {
  const [o2, a2] = F(n2.increment, t2, e2, n2.rx, n2.ry, 1, n2.increment * E(0.1, E(0.4, 1, s2), s2), s2);
  let h2 = q(o2, null, s2);
  if (!s2.disableMultiStroke && s2.roughness !== 0) {
    const [o3] = F(n2.increment, t2, e2, n2.rx, n2.ry, 1.5, 0, s2), a3 = q(o3, null, s2);
    h2 = h2.concat(a3);
  }
  return { estimatedPoints: a2, opset: { type: "path", ops: h2 } };
}
function A(t2, e2, s2, n2, o2, a2, h2, r2, i2) {
  const c2 = t2, l2 = e2;
  let u2 = Math.abs(s2 / 2), p2 = Math.abs(n2 / 2);
  u2 += G(0.01 * u2, i2), p2 += G(0.01 * p2, i2);
  let f2 = o2, d2 = a2;
  for (;f2 < 0; )
    f2 += 2 * Math.PI, d2 += 2 * Math.PI;
  d2 - f2 > 2 * Math.PI && (f2 = 0, d2 = 2 * Math.PI);
  const g2 = 2 * Math.PI / i2.curveStepCount, M2 = Math.min(g2 / 2, (d2 - f2) / 2), k2 = V(M2, c2, l2, u2, p2, f2, d2, 1, i2);
  if (!i2.disableMultiStroke) {
    const t3 = V(M2, c2, l2, u2, p2, f2, d2, 1.5, i2);
    k2.push(...t3);
  }
  return h2 && (r2 ? k2.push(...$(c2, l2, c2 + u2 * Math.cos(f2), l2 + p2 * Math.sin(f2), i2), ...$(c2, l2, c2 + u2 * Math.cos(d2), l2 + p2 * Math.sin(d2), i2)) : k2.push({ op: "lineTo", data: [c2, l2] }, { op: "lineTo", data: [c2 + u2 * Math.cos(f2), l2 + p2 * Math.sin(f2)] })), { type: "path", ops: k2 };
}
function _(t2, e2) {
  const s2 = m(y(b(t2))), n2 = [];
  let o2 = [0, 0], a2 = [0, 0];
  for (const { key: t3, data: h2 } of s2)
    switch (t3) {
      case "M":
        a2 = [h2[0], h2[1]], o2 = [h2[0], h2[1]];
        break;
      case "L":
        n2.push(...$(a2[0], a2[1], h2[0], h2[1], e2)), a2 = [h2[0], h2[1]];
        break;
      case "C": {
        const [t4, s3, o3, r2, i2, c2] = h2;
        n2.push(...Z(t4, s3, o3, r2, i2, c2, a2, e2)), a2 = [i2, c2];
        break;
      }
      case "Z":
        n2.push(...$(a2[0], a2[1], o2[0], o2[1], e2)), a2 = [o2[0], o2[1]];
    }
  return { type: "path", ops: n2 };
}
function I(t2, e2) {
  const s2 = [];
  for (const n2 of t2)
    if (n2.length) {
      const t3 = e2.maxRandomnessOffset || 0, o2 = n2.length;
      if (o2 > 2) {
        s2.push({ op: "move", data: [n2[0][0] + G(t3, e2), n2[0][1] + G(t3, e2)] });
        for (let a2 = 1;a2 < o2; a2++)
          s2.push({ op: "lineTo", data: [n2[a2][0] + G(t3, e2), n2[a2][1] + G(t3, e2)] });
      }
    }
  return { type: "fillPath", ops: s2 };
}
function C(t2, e2) {
  return function(t3, e3) {
    let s2 = t3.fillStyle || "hachure";
    if (!u[s2])
      switch (s2) {
        case "zigzag":
          u[s2] || (u[s2] = new h(e3));
          break;
        case "cross-hatch":
          u[s2] || (u[s2] = new r(e3));
          break;
        case "dots":
          u[s2] || (u[s2] = new i(e3));
          break;
        case "dashed":
          u[s2] || (u[s2] = new c(e3));
          break;
        case "zigzag-line":
          u[s2] || (u[s2] = new l(e3));
          break;
        default:
          s2 = "hachure", u[s2] || (u[s2] = new o(e3));
      }
    return u[s2];
  }(e2, P).fillPolygons(t2, e2);
}
function z(t2) {
  const e2 = Object.assign({}, t2);
  return e2.randomizer = undefined, t2.seed && (e2.seed = t2.seed + 1), e2;
}
function W(t2) {
  return t2.randomizer || (t2.randomizer = new p(t2.seed || 0)), t2.randomizer.next();
}
function E(t2, e2, s2, n2 = 1) {
  return s2.roughness * n2 * (W(s2) * (e2 - t2) + t2);
}
function G(t2, e2, s2 = 1) {
  return E(-t2, t2, e2, s2);
}
function $(t2, e2, s2, n2, o2, a2 = false) {
  const h2 = a2 ? o2.disableMultiStrokeFill : o2.disableMultiStroke, r2 = R(t2, e2, s2, n2, o2, true, false);
  if (h2)
    return r2;
  const i2 = R(t2, e2, s2, n2, o2, true, true);
  return r2.concat(i2);
}
function R(t2, e2, s2, n2, o2, a2, h2) {
  const r2 = Math.pow(t2 - s2, 2) + Math.pow(e2 - n2, 2), i2 = Math.sqrt(r2);
  let c2 = 1;
  c2 = i2 < 200 ? 1 : i2 > 500 ? 0.4 : -0.0016668 * i2 + 1.233334;
  let l2 = o2.maxRandomnessOffset || 0;
  l2 * l2 * 100 > r2 && (l2 = i2 / 10);
  const u2 = l2 / 2, p2 = 0.2 + 0.2 * W(o2);
  let f2 = o2.bowing * o2.maxRandomnessOffset * (n2 - e2) / 200, d2 = o2.bowing * o2.maxRandomnessOffset * (t2 - s2) / 200;
  f2 = G(f2, o2, c2), d2 = G(d2, o2, c2);
  const g2 = [], M2 = () => G(u2, o2, c2), k2 = () => G(l2, o2, c2), b2 = o2.preserveVertices;
  return a2 && (h2 ? g2.push({ op: "move", data: [t2 + (b2 ? 0 : M2()), e2 + (b2 ? 0 : M2())] }) : g2.push({ op: "move", data: [t2 + (b2 ? 0 : G(l2, o2, c2)), e2 + (b2 ? 0 : G(l2, o2, c2))] })), h2 ? g2.push({ op: "bcurveTo", data: [f2 + t2 + (s2 - t2) * p2 + M2(), d2 + e2 + (n2 - e2) * p2 + M2(), f2 + t2 + 2 * (s2 - t2) * p2 + M2(), d2 + e2 + 2 * (n2 - e2) * p2 + M2(), s2 + (b2 ? 0 : M2()), n2 + (b2 ? 0 : M2())] }) : g2.push({ op: "bcurveTo", data: [f2 + t2 + (s2 - t2) * p2 + k2(), d2 + e2 + (n2 - e2) * p2 + k2(), f2 + t2 + 2 * (s2 - t2) * p2 + k2(), d2 + e2 + 2 * (n2 - e2) * p2 + k2(), s2 + (b2 ? 0 : k2()), n2 + (b2 ? 0 : k2())] }), g2;
}
function j(t2, e2, s2) {
  if (!t2.length)
    return [];
  const n2 = [];
  n2.push([t2[0][0] + G(e2, s2), t2[0][1] + G(e2, s2)]), n2.push([t2[0][0] + G(e2, s2), t2[0][1] + G(e2, s2)]);
  for (let o2 = 1;o2 < t2.length; o2++)
    n2.push([t2[o2][0] + G(e2, s2), t2[o2][1] + G(e2, s2)]), o2 === t2.length - 1 && n2.push([t2[o2][0] + G(e2, s2), t2[o2][1] + G(e2, s2)]);
  return q(n2, null, s2);
}
function q(t2, e2, s2) {
  const n2 = t2.length, o2 = [];
  if (n2 > 3) {
    const a2 = [], h2 = 1 - s2.curveTightness;
    o2.push({ op: "move", data: [t2[1][0], t2[1][1]] });
    for (let e3 = 1;e3 + 2 < n2; e3++) {
      const s3 = t2[e3];
      a2[0] = [s3[0], s3[1]], a2[1] = [s3[0] + (h2 * t2[e3 + 1][0] - h2 * t2[e3 - 1][0]) / 6, s3[1] + (h2 * t2[e3 + 1][1] - h2 * t2[e3 - 1][1]) / 6], a2[2] = [t2[e3 + 1][0] + (h2 * t2[e3][0] - h2 * t2[e3 + 2][0]) / 6, t2[e3 + 1][1] + (h2 * t2[e3][1] - h2 * t2[e3 + 2][1]) / 6], a2[3] = [t2[e3 + 1][0], t2[e3 + 1][1]], o2.push({ op: "bcurveTo", data: [a2[1][0], a2[1][1], a2[2][0], a2[2][1], a2[3][0], a2[3][1]] });
    }
    if (e2 && e2.length === 2) {
      const t3 = s2.maxRandomnessOffset;
      o2.push({ op: "lineTo", data: [e2[0] + G(t3, s2), e2[1] + G(t3, s2)] });
    }
  } else
    n2 === 3 ? (o2.push({ op: "move", data: [t2[1][0], t2[1][1]] }), o2.push({ op: "bcurveTo", data: [t2[1][0], t2[1][1], t2[2][0], t2[2][1], t2[2][0], t2[2][1]] })) : n2 === 2 && o2.push(...R(t2[0][0], t2[0][1], t2[1][0], t2[1][1], s2, true, true));
  return o2;
}
function F(t2, e2, s2, n2, o2, a2, h2, r2) {
  const i2 = [], c2 = [];
  if (r2.roughness === 0) {
    t2 /= 4, c2.push([e2 + n2 * Math.cos(-t2), s2 + o2 * Math.sin(-t2)]);
    for (let a3 = 0;a3 <= 2 * Math.PI; a3 += t2) {
      const t3 = [e2 + n2 * Math.cos(a3), s2 + o2 * Math.sin(a3)];
      i2.push(t3), c2.push(t3);
    }
    c2.push([e2 + n2 * Math.cos(0), s2 + o2 * Math.sin(0)]), c2.push([e2 + n2 * Math.cos(t2), s2 + o2 * Math.sin(t2)]);
  } else {
    const l2 = G(0.5, r2) - Math.PI / 2;
    c2.push([G(a2, r2) + e2 + 0.9 * n2 * Math.cos(l2 - t2), G(a2, r2) + s2 + 0.9 * o2 * Math.sin(l2 - t2)]);
    const u2 = 2 * Math.PI + l2 - 0.01;
    for (let h3 = l2;h3 < u2; h3 += t2) {
      const t3 = [G(a2, r2) + e2 + n2 * Math.cos(h3), G(a2, r2) + s2 + o2 * Math.sin(h3)];
      i2.push(t3), c2.push(t3);
    }
    c2.push([G(a2, r2) + e2 + n2 * Math.cos(l2 + 2 * Math.PI + 0.5 * h2), G(a2, r2) + s2 + o2 * Math.sin(l2 + 2 * Math.PI + 0.5 * h2)]), c2.push([G(a2, r2) + e2 + 0.98 * n2 * Math.cos(l2 + h2), G(a2, r2) + s2 + 0.98 * o2 * Math.sin(l2 + h2)]), c2.push([G(a2, r2) + e2 + 0.9 * n2 * Math.cos(l2 + 0.5 * h2), G(a2, r2) + s2 + 0.9 * o2 * Math.sin(l2 + 0.5 * h2)]);
  }
  return [c2, i2];
}
function V(t2, e2, s2, n2, o2, a2, h2, r2, i2) {
  const c2 = a2 + G(0.1, i2), l2 = [];
  l2.push([G(r2, i2) + e2 + 0.9 * n2 * Math.cos(c2 - t2), G(r2, i2) + s2 + 0.9 * o2 * Math.sin(c2 - t2)]);
  for (let a3 = c2;a3 <= h2; a3 += t2)
    l2.push([G(r2, i2) + e2 + n2 * Math.cos(a3), G(r2, i2) + s2 + o2 * Math.sin(a3)]);
  return l2.push([e2 + n2 * Math.cos(h2), s2 + o2 * Math.sin(h2)]), l2.push([e2 + n2 * Math.cos(h2), s2 + o2 * Math.sin(h2)]), q(l2, null, i2);
}
function Z(t2, e2, s2, n2, o2, a2, h2, r2) {
  const i2 = [], c2 = [r2.maxRandomnessOffset || 1, (r2.maxRandomnessOffset || 1) + 0.3];
  let l2 = [0, 0];
  const u2 = r2.disableMultiStroke ? 1 : 2, p2 = r2.preserveVertices;
  for (let f2 = 0;f2 < u2; f2++)
    f2 === 0 ? i2.push({ op: "move", data: [h2[0], h2[1]] }) : i2.push({ op: "move", data: [h2[0] + (p2 ? 0 : G(c2[0], r2)), h2[1] + (p2 ? 0 : G(c2[0], r2))] }), l2 = p2 ? [o2, a2] : [o2 + G(c2[f2], r2), a2 + G(c2[f2], r2)], i2.push({ op: "bcurveTo", data: [t2 + G(c2[f2], r2), e2 + G(c2[f2], r2), s2 + G(c2[f2], r2), n2 + G(c2[f2], r2), l2[0], l2[1]] });
  return i2;
}
function Q(t2) {
  return [...t2];
}
function H(t2, e2 = 0) {
  const s2 = t2.length;
  if (s2 < 3)
    throw new Error("A curve must have at least three points.");
  const n2 = [];
  if (s2 === 3)
    n2.push(Q(t2[0]), Q(t2[1]), Q(t2[2]), Q(t2[2]));
  else {
    const s3 = [];
    s3.push(t2[0], t2[0]);
    for (let e3 = 1;e3 < t2.length; e3++)
      s3.push(t2[e3]), e3 === t2.length - 1 && s3.push(t2[e3]);
    const o2 = [], a2 = 1 - e2;
    n2.push(Q(s3[0]));
    for (let t3 = 1;t3 + 2 < s3.length; t3++) {
      const e3 = s3[t3];
      o2[0] = [e3[0], e3[1]], o2[1] = [e3[0] + (a2 * s3[t3 + 1][0] - a2 * s3[t3 - 1][0]) / 6, e3[1] + (a2 * s3[t3 + 1][1] - a2 * s3[t3 - 1][1]) / 6], o2[2] = [s3[t3 + 1][0] + (a2 * s3[t3][0] - a2 * s3[t3 + 2][0]) / 6, s3[t3 + 1][1] + (a2 * s3[t3][1] - a2 * s3[t3 + 2][1]) / 6], o2[3] = [s3[t3 + 1][0], s3[t3 + 1][1]], n2.push(o2[1], o2[2], o2[3]);
    }
  }
  return n2;
}
function N(t2, e2) {
  return Math.pow(t2[0] - e2[0], 2) + Math.pow(t2[1] - e2[1], 2);
}
function B(t2, e2, s2) {
  const n2 = N(e2, s2);
  if (n2 === 0)
    return N(t2, e2);
  let o2 = ((t2[0] - e2[0]) * (s2[0] - e2[0]) + (t2[1] - e2[1]) * (s2[1] - e2[1])) / n2;
  return o2 = Math.max(0, Math.min(1, o2)), N(t2, J(e2, s2, o2));
}
function J(t2, e2, s2) {
  return [t2[0] + (e2[0] - t2[0]) * s2, t2[1] + (e2[1] - t2[1]) * s2];
}
function K(t2, e2, s2, n2) {
  const o2 = n2 || [];
  if (function(t3, e3) {
    const s3 = t3[e3 + 0], n3 = t3[e3 + 1], o3 = t3[e3 + 2], a3 = t3[e3 + 3];
    let h3 = 3 * n3[0] - 2 * s3[0] - a3[0];
    h3 *= h3;
    let r2 = 3 * n3[1] - 2 * s3[1] - a3[1];
    r2 *= r2;
    let i2 = 3 * o3[0] - 2 * a3[0] - s3[0];
    i2 *= i2;
    let c2 = 3 * o3[1] - 2 * a3[1] - s3[1];
    return c2 *= c2, h3 < i2 && (h3 = i2), r2 < c2 && (r2 = c2), h3 + r2;
  }(t2, e2) < s2) {
    const s3 = t2[e2 + 0];
    if (o2.length) {
      (a2 = o2[o2.length - 1], h2 = s3, Math.sqrt(N(a2, h2))) > 1 && o2.push(s3);
    } else
      o2.push(s3);
    o2.push(t2[e2 + 3]);
  } else {
    const n3 = 0.5, a3 = t2[e2 + 0], h3 = t2[e2 + 1], r2 = t2[e2 + 2], i2 = t2[e2 + 3], c2 = J(a3, h3, n3), l2 = J(h3, r2, n3), u2 = J(r2, i2, n3), p2 = J(c2, l2, n3), f2 = J(l2, u2, n3), d2 = J(p2, f2, n3);
    K([a3, c2, p2, d2], 0, s2, o2), K([d2, f2, u2, i2], 0, s2, o2);
  }
  var a2, h2;
  return o2;
}
function U(t2, e2) {
  return X(t2, 0, t2.length, e2);
}
function X(t2, e2, s2, n2, o2) {
  const a2 = o2 || [], h2 = t2[e2], r2 = t2[s2 - 1];
  let i2 = 0, c2 = 1;
  for (let n3 = e2 + 1;n3 < s2 - 1; ++n3) {
    const e3 = B(t2[n3], h2, r2);
    e3 > i2 && (i2 = e3, c2 = n3);
  }
  return Math.sqrt(i2) > n2 ? (X(t2, e2, c2 + 1, n2, a2), X(t2, c2, s2, n2, a2)) : (a2.length || a2.push(h2), a2.push(r2)), a2;
}
function Y(t2, e2 = 0.15, s2) {
  const n2 = [], o2 = (t2.length - 1) / 3;
  for (let s3 = 0;s3 < o2; s3++) {
    K(t2, 3 * s3, e2, n2);
  }
  return s2 && s2 > 0 ? X(n2, 0, n2.length, s2) : n2;
}
var tt = "none";

class et {
  constructor(t2) {
    this.defaultOptions = { maxRandomnessOffset: 2, roughness: 1, bowing: 1, stroke: "#000", strokeWidth: 1, curveTightness: 0, curveFitting: 0.95, curveStepCount: 9, fillStyle: "hachure", fillWeight: -1, hachureAngle: -41, hachureGap: -1, dashOffset: -1, dashGap: -1, zigzagOffset: -1, seed: 0, disableMultiStroke: false, disableMultiStrokeFill: false, preserveVertices: false, fillShapeRoughnessGain: 0.8 }, this.config = t2 || {}, this.config.options && (this.defaultOptions = this._o(this.config.options));
  }
  static newSeed() {
    return Math.floor(Math.random() * 2 ** 31);
  }
  _o(t2) {
    return t2 ? Object.assign({}, this.defaultOptions, t2) : this.defaultOptions;
  }
  _d(t2, e2, s2) {
    return { shape: t2, sets: e2 || [], options: s2 || this.defaultOptions };
  }
  line(t2, e2, s2, n2, o2) {
    const a2 = this._o(o2);
    return this._d("line", [v(t2, e2, s2, n2, a2)], a2);
  }
  rectangle(t2, e2, s2, n2, o2) {
    const a2 = this._o(o2), h2 = [], r2 = O(t2, e2, s2, n2, a2);
    if (a2.fill) {
      const o3 = [[t2, e2], [t2 + s2, e2], [t2 + s2, e2 + n2], [t2, e2 + n2]];
      a2.fillStyle === "solid" ? h2.push(I([o3], a2)) : h2.push(C([o3], a2));
    }
    return a2.stroke !== tt && h2.push(r2), this._d("rectangle", h2, a2);
  }
  ellipse(t2, e2, s2, n2, o2) {
    const a2 = this._o(o2), h2 = [], r2 = T(s2, n2, a2), i2 = D(t2, e2, a2, r2);
    if (a2.fill)
      if (a2.fillStyle === "solid") {
        const s3 = D(t2, e2, a2, r2).opset;
        s3.type = "fillPath", h2.push(s3);
      } else
        h2.push(C([i2.estimatedPoints], a2));
    return a2.stroke !== tt && h2.push(i2.opset), this._d("ellipse", h2, a2);
  }
  circle(t2, e2, s2, n2) {
    const o2 = this.ellipse(t2, e2, s2, s2, n2);
    return o2.shape = "circle", o2;
  }
  linearPath(t2, e2) {
    const s2 = this._o(e2);
    return this._d("linearPath", [S(t2, false, s2)], s2);
  }
  arc(t2, e2, s2, n2, o2, a2, h2 = false, r2) {
    const i2 = this._o(r2), c2 = [], l2 = A(t2, e2, s2, n2, o2, a2, h2, true, i2);
    if (h2 && i2.fill)
      if (i2.fillStyle === "solid") {
        const h3 = Object.assign({}, i2);
        h3.disableMultiStroke = true;
        const r3 = A(t2, e2, s2, n2, o2, a2, true, false, h3);
        r3.type = "fillPath", c2.push(r3);
      } else
        c2.push(function(t3, e3, s3, n3, o3, a3, h3) {
          const r3 = t3, i3 = e3;
          let c3 = Math.abs(s3 / 2), l3 = Math.abs(n3 / 2);
          c3 += G(0.01 * c3, h3), l3 += G(0.01 * l3, h3);
          let u2 = o3, p2 = a3;
          for (;u2 < 0; )
            u2 += 2 * Math.PI, p2 += 2 * Math.PI;
          p2 - u2 > 2 * Math.PI && (u2 = 0, p2 = 2 * Math.PI);
          const f2 = (p2 - u2) / h3.curveStepCount, d2 = [];
          for (let t4 = u2;t4 <= p2; t4 += f2)
            d2.push([r3 + c3 * Math.cos(t4), i3 + l3 * Math.sin(t4)]);
          return d2.push([r3 + c3 * Math.cos(p2), i3 + l3 * Math.sin(p2)]), d2.push([r3, i3]), C([d2], h3);
        }(t2, e2, s2, n2, o2, a2, i2));
    return i2.stroke !== tt && c2.push(l2), this._d("arc", c2, i2);
  }
  curve(t2, e2) {
    const s2 = this._o(e2), n2 = [], o2 = L(t2, s2);
    if (s2.fill && s2.fill !== tt)
      if (s2.fillStyle === "solid") {
        const e3 = L(t2, Object.assign(Object.assign({}, s2), { disableMultiStroke: true, roughness: s2.roughness ? s2.roughness + s2.fillShapeRoughnessGain : 0 }));
        n2.push({ type: "fillPath", ops: this._mergedShape(e3.ops) });
      } else {
        const e3 = [], o3 = t2;
        if (o3.length) {
          const t3 = typeof o3[0][0] == "number" ? [o3] : o3;
          for (const n3 of t3)
            n3.length < 3 ? e3.push(...n3) : n3.length === 3 ? e3.push(...Y(H([n3[0], n3[0], n3[1], n3[2]]), 10, (1 + s2.roughness) / 2)) : e3.push(...Y(H(n3), 10, (1 + s2.roughness) / 2));
        }
        e3.length && n2.push(C([e3], s2));
      }
    return s2.stroke !== tt && n2.push(o2), this._d("curve", n2, s2);
  }
  polygon(t2, e2) {
    const s2 = this._o(e2), n2 = [], o2 = S(t2, true, s2);
    return s2.fill && (s2.fillStyle === "solid" ? n2.push(I([t2], s2)) : n2.push(C([t2], s2))), s2.stroke !== tt && n2.push(o2), this._d("polygon", n2, s2);
  }
  path(t2, e2) {
    const s2 = this._o(e2), n2 = [];
    if (!t2)
      return this._d("path", n2, s2);
    t2 = (t2 || "").replace(/\n/g, " ").replace(/(-\s)/g, "-").replace("/(ss)/g", " ");
    const o2 = s2.fill && s2.fill !== "transparent" && s2.fill !== tt, a2 = s2.stroke !== tt, h2 = !!(s2.simplification && s2.simplification < 1), r2 = function(t3, e3, s3) {
      const n3 = m(y(b(t3))), o3 = [];
      let a3 = [], h3 = [0, 0], r3 = [];
      const i3 = () => {
        r3.length >= 4 && a3.push(...Y(r3, e3)), r3 = [];
      }, c2 = () => {
        i3(), a3.length && (o3.push(a3), a3 = []);
      };
      for (const { key: t4, data: e4 } of n3)
        switch (t4) {
          case "M":
            c2(), h3 = [e4[0], e4[1]], a3.push(h3);
            break;
          case "L":
            i3(), a3.push([e4[0], e4[1]]);
            break;
          case "C":
            if (!r3.length) {
              const t5 = a3.length ? a3[a3.length - 1] : h3;
              r3.push([t5[0], t5[1]]);
            }
            r3.push([e4[0], e4[1]]), r3.push([e4[2], e4[3]]), r3.push([e4[4], e4[5]]);
            break;
          case "Z":
            i3(), a3.push([h3[0], h3[1]]);
        }
      if (c2(), !s3)
        return o3;
      const l2 = [];
      for (const t4 of o3) {
        const e4 = U(t4, s3);
        e4.length && l2.push(e4);
      }
      return l2;
    }(t2, 1, h2 ? 4 - 4 * (s2.simplification || 1) : (1 + s2.roughness) / 2), i2 = _(t2, s2);
    if (o2)
      if (s2.fillStyle === "solid")
        if (r2.length === 1) {
          const e3 = _(t2, Object.assign(Object.assign({}, s2), { disableMultiStroke: true, roughness: s2.roughness ? s2.roughness + s2.fillShapeRoughnessGain : 0 }));
          n2.push({ type: "fillPath", ops: this._mergedShape(e3.ops) });
        } else
          n2.push(I(r2, s2));
      else
        n2.push(C(r2, s2));
    return a2 && (h2 ? r2.forEach((t3) => {
      n2.push(S(t3, false, s2));
    }) : n2.push(i2)), this._d("path", n2, s2);
  }
  opsToPath(t2, e2) {
    let s2 = "";
    for (const n2 of t2.ops) {
      const t3 = typeof e2 == "number" && e2 >= 0 ? n2.data.map((t4) => +t4.toFixed(e2)) : n2.data;
      switch (n2.op) {
        case "move":
          s2 += `M${t3[0]} ${t3[1]} `;
          break;
        case "bcurveTo":
          s2 += `C${t3[0]} ${t3[1]}, ${t3[2]} ${t3[3]}, ${t3[4]} ${t3[5]} `;
          break;
        case "lineTo":
          s2 += `L${t3[0]} ${t3[1]} `;
      }
    }
    return s2.trim();
  }
  toPaths(t2) {
    const e2 = t2.sets || [], s2 = t2.options || this.defaultOptions, n2 = [];
    for (const t3 of e2) {
      let e3 = null;
      switch (t3.type) {
        case "path":
          e3 = { d: this.opsToPath(t3), stroke: s2.stroke, strokeWidth: s2.strokeWidth, fill: tt };
          break;
        case "fillPath":
          e3 = { d: this.opsToPath(t3), stroke: tt, strokeWidth: 0, fill: s2.fill || tt };
          break;
        case "fillSketch":
          e3 = this.fillSketch(t3, s2);
      }
      e3 && n2.push(e3);
    }
    return n2;
  }
  fillSketch(t2, e2) {
    let s2 = e2.fillWeight;
    return s2 < 0 && (s2 = e2.strokeWidth / 2), { d: this.opsToPath(t2), stroke: e2.fill || tt, strokeWidth: s2, fill: tt };
  }
  _mergedShape(t2) {
    return t2.filter((t3, e2) => e2 === 0 || t3.op !== "move");
  }
}

class st {
  constructor(t2, e2) {
    this.canvas = t2, this.ctx = this.canvas.getContext("2d"), this.gen = new et(e2);
  }
  draw(t2) {
    const e2 = t2.sets || [], s2 = t2.options || this.getDefaultOptions(), n2 = this.ctx, o2 = t2.options.fixedDecimalPlaceDigits;
    for (const a2 of e2)
      switch (a2.type) {
        case "path":
          n2.save(), n2.strokeStyle = s2.stroke === "none" ? "transparent" : s2.stroke, n2.lineWidth = s2.strokeWidth, s2.strokeLineDash && n2.setLineDash(s2.strokeLineDash), s2.strokeLineDashOffset && (n2.lineDashOffset = s2.strokeLineDashOffset), this._drawToContext(n2, a2, o2), n2.restore();
          break;
        case "fillPath": {
          n2.save(), n2.fillStyle = s2.fill || "";
          const e3 = t2.shape === "curve" || t2.shape === "polygon" || t2.shape === "path" ? "evenodd" : "nonzero";
          this._drawToContext(n2, a2, o2, e3), n2.restore();
          break;
        }
        case "fillSketch":
          this.fillSketch(n2, a2, s2);
      }
  }
  fillSketch(t2, e2, s2) {
    let n2 = s2.fillWeight;
    n2 < 0 && (n2 = s2.strokeWidth / 2), t2.save(), s2.fillLineDash && t2.setLineDash(s2.fillLineDash), s2.fillLineDashOffset && (t2.lineDashOffset = s2.fillLineDashOffset), t2.strokeStyle = s2.fill || "", t2.lineWidth = n2, this._drawToContext(t2, e2, s2.fixedDecimalPlaceDigits), t2.restore();
  }
  _drawToContext(t2, e2, s2, n2 = "nonzero") {
    t2.beginPath();
    for (const n3 of e2.ops) {
      const e3 = typeof s2 == "number" && s2 >= 0 ? n3.data.map((t3) => +t3.toFixed(s2)) : n3.data;
      switch (n3.op) {
        case "move":
          t2.moveTo(e3[0], e3[1]);
          break;
        case "bcurveTo":
          t2.bezierCurveTo(e3[0], e3[1], e3[2], e3[3], e3[4], e3[5]);
          break;
        case "lineTo":
          t2.lineTo(e3[0], e3[1]);
      }
    }
    e2.type === "fillPath" ? t2.fill(n2) : t2.stroke();
  }
  get generator() {
    return this.gen;
  }
  getDefaultOptions() {
    return this.gen.defaultOptions;
  }
  line(t2, e2, s2, n2, o2) {
    const a2 = this.gen.line(t2, e2, s2, n2, o2);
    return this.draw(a2), a2;
  }
  rectangle(t2, e2, s2, n2, o2) {
    const a2 = this.gen.rectangle(t2, e2, s2, n2, o2);
    return this.draw(a2), a2;
  }
  ellipse(t2, e2, s2, n2, o2) {
    const a2 = this.gen.ellipse(t2, e2, s2, n2, o2);
    return this.draw(a2), a2;
  }
  circle(t2, e2, s2, n2) {
    const o2 = this.gen.circle(t2, e2, s2, n2);
    return this.draw(o2), o2;
  }
  linearPath(t2, e2) {
    const s2 = this.gen.linearPath(t2, e2);
    return this.draw(s2), s2;
  }
  polygon(t2, e2) {
    const s2 = this.gen.polygon(t2, e2);
    return this.draw(s2), s2;
  }
  arc(t2, e2, s2, n2, o2, a2, h2 = false, r2) {
    const i2 = this.gen.arc(t2, e2, s2, n2, o2, a2, h2, r2);
    return this.draw(i2), i2;
  }
  curve(t2, e2) {
    const s2 = this.gen.curve(t2, e2);
    return this.draw(s2), s2;
  }
  path(t2, e2) {
    const s2 = this.gen.path(t2, e2);
    return this.draw(s2), s2;
  }
}
var nt = "http://www.w3.org/2000/svg";

class ot {
  constructor(t2, e2) {
    this.svg = t2, this.gen = new et(e2);
  }
  draw(t2) {
    const e2 = t2.sets || [], s2 = t2.options || this.getDefaultOptions(), n2 = this.svg.ownerDocument || window.document, o2 = n2.createElementNS(nt, "g"), a2 = t2.options.fixedDecimalPlaceDigits;
    for (const h2 of e2) {
      let e3 = null;
      switch (h2.type) {
        case "path":
          e3 = n2.createElementNS(nt, "path"), e3.setAttribute("d", this.opsToPath(h2, a2)), e3.setAttribute("stroke", s2.stroke), e3.setAttribute("stroke-width", s2.strokeWidth + ""), e3.setAttribute("fill", "none"), s2.strokeLineDash && e3.setAttribute("stroke-dasharray", s2.strokeLineDash.join(" ").trim()), s2.strokeLineDashOffset && e3.setAttribute("stroke-dashoffset", `${s2.strokeLineDashOffset}`);
          break;
        case "fillPath":
          e3 = n2.createElementNS(nt, "path"), e3.setAttribute("d", this.opsToPath(h2, a2)), e3.setAttribute("stroke", "none"), e3.setAttribute("stroke-width", "0"), e3.setAttribute("fill", s2.fill || ""), t2.shape !== "curve" && t2.shape !== "polygon" || e3.setAttribute("fill-rule", "evenodd");
          break;
        case "fillSketch":
          e3 = this.fillSketch(n2, h2, s2);
      }
      e3 && o2.appendChild(e3);
    }
    return o2;
  }
  fillSketch(t2, e2, s2) {
    let n2 = s2.fillWeight;
    n2 < 0 && (n2 = s2.strokeWidth / 2);
    const o2 = t2.createElementNS(nt, "path");
    return o2.setAttribute("d", this.opsToPath(e2, s2.fixedDecimalPlaceDigits)), o2.setAttribute("stroke", s2.fill || ""), o2.setAttribute("stroke-width", n2 + ""), o2.setAttribute("fill", "none"), s2.fillLineDash && o2.setAttribute("stroke-dasharray", s2.fillLineDash.join(" ").trim()), s2.fillLineDashOffset && o2.setAttribute("stroke-dashoffset", `${s2.fillLineDashOffset}`), o2;
  }
  get generator() {
    return this.gen;
  }
  getDefaultOptions() {
    return this.gen.defaultOptions;
  }
  opsToPath(t2, e2) {
    return this.gen.opsToPath(t2, e2);
  }
  line(t2, e2, s2, n2, o2) {
    const a2 = this.gen.line(t2, e2, s2, n2, o2);
    return this.draw(a2);
  }
  rectangle(t2, e2, s2, n2, o2) {
    const a2 = this.gen.rectangle(t2, e2, s2, n2, o2);
    return this.draw(a2);
  }
  ellipse(t2, e2, s2, n2, o2) {
    const a2 = this.gen.ellipse(t2, e2, s2, n2, o2);
    return this.draw(a2);
  }
  circle(t2, e2, s2, n2) {
    const o2 = this.gen.circle(t2, e2, s2, n2);
    return this.draw(o2);
  }
  linearPath(t2, e2) {
    const s2 = this.gen.linearPath(t2, e2);
    return this.draw(s2);
  }
  polygon(t2, e2) {
    const s2 = this.gen.polygon(t2, e2);
    return this.draw(s2);
  }
  arc(t2, e2, s2, n2, o2, a2, h2 = false, r2) {
    const i2 = this.gen.arc(t2, e2, s2, n2, o2, a2, h2, r2);
    return this.draw(i2);
  }
  curve(t2, e2) {
    const s2 = this.gen.curve(t2, e2);
    return this.draw(s2);
  }
  path(t2, e2) {
    const s2 = this.gen.path(t2, e2);
    return this.draw(s2);
  }
}
var at = { canvas: (t2, e2) => new st(t2, e2), svg: (t2, e2) => new ot(t2, e2), generator: (t2) => new et(t2), newSeed: () => et.newSeed() };

export { at };

//# debugId=7A9383C5322F3A1164756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3JvdWdoanMvYnVuZGxlZC9yb3VnaC5lc20uanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbCiAgICAiZnVuY3Rpb24gdCh0LGUscyl7aWYodCYmdC5sZW5ndGgpe2NvbnN0W24sb109ZSxhPU1hdGguUEkvMTgwKnMsaD1NYXRoLmNvcyhhKSxyPU1hdGguc2luKGEpO2Zvcihjb25zdCBlIG9mIHQpe2NvbnN0W3Qsc109ZTtlWzBdPSh0LW4pKmgtKHMtbykqcituLGVbMV09KHQtbikqcisocy1vKSpoK299fX1mdW5jdGlvbiBlKHQsZSl7cmV0dXJuIHRbMF09PT1lWzBdJiZ0WzFdPT09ZVsxXX1mdW5jdGlvbiBzKHMsbixvLGE9MSl7Y29uc3QgaD1vLHI9TWF0aC5tYXgobiwuMSksaT1zWzBdJiZzWzBdWzBdJiZcIm51bWJlclwiPT10eXBlb2Ygc1swXVswXT9bc106cyxjPVswLDBdO2lmKGgpZm9yKGNvbnN0IGUgb2YgaSl0KGUsYyxoKTtjb25zdCBsPWZ1bmN0aW9uKHQscyxuKXtjb25zdCBvPVtdO2Zvcihjb25zdCBzIG9mIHQpe2NvbnN0IHQ9Wy4uLnNdO2UodFswXSx0W3QubGVuZ3RoLTFdKXx8dC5wdXNoKFt0WzBdWzBdLHRbMF1bMV1dKSx0Lmxlbmd0aD4yJiZvLnB1c2godCl9Y29uc3QgYT1bXTtzPU1hdGgubWF4KHMsLjEpO2NvbnN0IGg9W107Zm9yKGNvbnN0IHQgb2Ygbylmb3IobGV0IGU9MDtlPHQubGVuZ3RoLTE7ZSsrKXtjb25zdCBzPXRbZV0sbj10W2UrMV07aWYoc1sxXSE9PW5bMV0pe2NvbnN0IHQ9TWF0aC5taW4oc1sxXSxuWzFdKTtoLnB1c2goe3ltaW46dCx5bWF4Ok1hdGgubWF4KHNbMV0sblsxXSkseDp0PT09c1sxXT9zWzBdOm5bMF0saXNsb3BlOihuWzBdLXNbMF0pLyhuWzFdLXNbMV0pfSl9fWlmKGguc29ydCgoKHQsZSk9PnQueW1pbjxlLnltaW4/LTE6dC55bWluPmUueW1pbj8xOnQueDxlLng/LTE6dC54PmUueD8xOnQueW1heD09PWUueW1heD8wOih0LnltYXgtZS55bWF4KS9NYXRoLmFicyh0LnltYXgtZS55bWF4KSkpLCFoLmxlbmd0aClyZXR1cm4gYTtsZXQgcj1bXSxpPWhbMF0ueW1pbixjPTA7Zm9yKDtyLmxlbmd0aHx8aC5sZW5ndGg7KXtpZihoLmxlbmd0aCl7bGV0IHQ9LTE7Zm9yKGxldCBlPTA7ZTxoLmxlbmd0aCYmIShoW2VdLnltaW4+aSk7ZSsrKXQ9ZTtoLnNwbGljZSgwLHQrMSkuZm9yRWFjaCgodD0+e3IucHVzaCh7czppLGVkZ2U6dH0pfSkpfWlmKHI9ci5maWx0ZXIoKHQ9PiEodC5lZGdlLnltYXg8PWkpKSksci5zb3J0KCgodCxlKT0+dC5lZGdlLng9PT1lLmVkZ2UueD8wOih0LmVkZ2UueC1lLmVkZ2UueCkvTWF0aC5hYnModC5lZGdlLngtZS5lZGdlLngpKSksKDEhPT1ufHxjJXM9PTApJiZyLmxlbmd0aD4xKWZvcihsZXQgdD0wO3Q8ci5sZW5ndGg7dCs9Mil7Y29uc3QgZT10KzE7aWYoZT49ci5sZW5ndGgpYnJlYWs7Y29uc3Qgcz1yW3RdLmVkZ2Usbj1yW2VdLmVkZ2U7YS5wdXNoKFtbTWF0aC5yb3VuZChzLngpLGldLFtNYXRoLnJvdW5kKG4ueCksaV1dKX1pKz1uLHIuZm9yRWFjaCgodD0+e3QuZWRnZS54PXQuZWRnZS54K24qdC5lZGdlLmlzbG9wZX0pKSxjKyt9cmV0dXJuIGF9KGkscixhKTtpZihoKXtmb3IoY29uc3QgZSBvZiBpKXQoZSxjLC1oKTshZnVuY3Rpb24oZSxzLG4pe2NvbnN0IG89W107ZS5mb3JFYWNoKCh0PT5vLnB1c2goLi4udCkpKSx0KG8scyxuKX0obCxjLC1oKX1yZXR1cm4gbH1mdW5jdGlvbiBuKHQsZSl7dmFyIG47Y29uc3Qgbz1lLmhhY2h1cmVBbmdsZSs5MDtsZXQgYT1lLmhhY2h1cmVHYXA7YTwwJiYoYT00KmUuc3Ryb2tlV2lkdGgpLGE9TWF0aC5yb3VuZChNYXRoLm1heChhLC4xKSk7bGV0IGg9MTtyZXR1cm4gZS5yb3VnaG5lc3M+PTEmJigobnVsbD09PShuPWUucmFuZG9taXplcil8fHZvaWQgMD09PW4/dm9pZCAwOm4ubmV4dCgpKXx8TWF0aC5yYW5kb20oKSk+LjcmJihoPWEpLHModCxhLG8saHx8MSl9Y2xhc3Mgb3tjb25zdHJ1Y3Rvcih0KXt0aGlzLmhlbHBlcj10fWZpbGxQb2x5Z29ucyh0LGUpe3JldHVybiB0aGlzLl9maWxsUG9seWdvbnModCxlKX1fZmlsbFBvbHlnb25zKHQsZSl7Y29uc3Qgcz1uKHQsZSk7cmV0dXJue3R5cGU6XCJmaWxsU2tldGNoXCIsb3BzOnRoaXMucmVuZGVyTGluZXMocyxlKX19cmVuZGVyTGluZXModCxlKXtjb25zdCBzPVtdO2Zvcihjb25zdCBuIG9mIHQpcy5wdXNoKC4uLnRoaXMuaGVscGVyLmRvdWJsZUxpbmVPcHMoblswXVswXSxuWzBdWzFdLG5bMV1bMF0sblsxXVsxXSxlKSk7cmV0dXJuIHN9fWZ1bmN0aW9uIGEodCl7Y29uc3QgZT10WzBdLHM9dFsxXTtyZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KGVbMF0tc1swXSwyKStNYXRoLnBvdyhlWzFdLXNbMV0sMikpfWNsYXNzIGggZXh0ZW5kcyBve2ZpbGxQb2x5Z29ucyh0LGUpe2xldCBzPWUuaGFjaHVyZUdhcDtzPDAmJihzPTQqZS5zdHJva2VXaWR0aCkscz1NYXRoLm1heChzLC4xKTtjb25zdCBvPW4odCxPYmplY3QuYXNzaWduKHt9LGUse2hhY2h1cmVHYXA6c30pKSxoPU1hdGguUEkvMTgwKmUuaGFjaHVyZUFuZ2xlLHI9W10saT0uNSpzKk1hdGguY29zKGgpLGM9LjUqcypNYXRoLnNpbihoKTtmb3IoY29uc3RbdCxlXW9mIG8pYShbdCxlXSkmJnIucHVzaChbW3RbMF0taSx0WzFdK2NdLFsuLi5lXV0sW1t0WzBdK2ksdFsxXS1jXSxbLi4uZV1dKTtyZXR1cm57dHlwZTpcImZpbGxTa2V0Y2hcIixvcHM6dGhpcy5yZW5kZXJMaW5lcyhyLGUpfX19Y2xhc3MgciBleHRlbmRzIG97ZmlsbFBvbHlnb25zKHQsZSl7Y29uc3Qgcz10aGlzLl9maWxsUG9seWdvbnModCxlKSxuPU9iamVjdC5hc3NpZ24oe30sZSx7aGFjaHVyZUFuZ2xlOmUuaGFjaHVyZUFuZ2xlKzkwfSksbz10aGlzLl9maWxsUG9seWdvbnModCxuKTtyZXR1cm4gcy5vcHM9cy5vcHMuY29uY2F0KG8ub3BzKSxzfX1jbGFzcyBpe2NvbnN0cnVjdG9yKHQpe3RoaXMuaGVscGVyPXR9ZmlsbFBvbHlnb25zKHQsZSl7Y29uc3Qgcz1uKHQsZT1PYmplY3QuYXNzaWduKHt9LGUse2hhY2h1cmVBbmdsZTowfSkpO3JldHVybiB0aGlzLmRvdHNPbkxpbmVzKHMsZSl9ZG90c09uTGluZXModCxlKXtjb25zdCBzPVtdO2xldCBuPWUuaGFjaHVyZUdhcDtuPDAmJihuPTQqZS5zdHJva2VXaWR0aCksbj1NYXRoLm1heChuLC4xKTtsZXQgbz1lLmZpbGxXZWlnaHQ7bzwwJiYobz1lLnN0cm9rZVdpZHRoLzIpO2NvbnN0IGg9bi80O2Zvcihjb25zdCByIG9mIHQpe2NvbnN0IHQ9YShyKSxpPXQvbixjPU1hdGguY2VpbChpKS0xLGw9dC1jKm4sdT0oclswXVswXStyWzFdWzBdKS8yLW4vNCxwPU1hdGgubWluKHJbMF1bMV0sclsxXVsxXSk7Zm9yKGxldCB0PTA7dDxjO3QrKyl7Y29uc3QgYT1wK2wrdCpuLHI9dS1oKzIqTWF0aC5yYW5kb20oKSpoLGk9YS1oKzIqTWF0aC5yYW5kb20oKSpoLGM9dGhpcy5oZWxwZXIuZWxsaXBzZShyLGksbyxvLGUpO3MucHVzaCguLi5jLm9wcyl9fXJldHVybnt0eXBlOlwiZmlsbFNrZXRjaFwiLG9wczpzfX19Y2xhc3MgY3tjb25zdHJ1Y3Rvcih0KXt0aGlzLmhlbHBlcj10fWZpbGxQb2x5Z29ucyh0LGUpe2NvbnN0IHM9bih0LGUpO3JldHVybnt0eXBlOlwiZmlsbFNrZXRjaFwiLG9wczp0aGlzLmRhc2hlZExpbmUocyxlKX19ZGFzaGVkTGluZSh0LGUpe2NvbnN0IHM9ZS5kYXNoT2Zmc2V0PDA/ZS5oYWNodXJlR2FwPDA/NCplLnN0cm9rZVdpZHRoOmUuaGFjaHVyZUdhcDplLmRhc2hPZmZzZXQsbj1lLmRhc2hHYXA8MD9lLmhhY2h1cmVHYXA8MD80KmUuc3Ryb2tlV2lkdGg6ZS5oYWNodXJlR2FwOmUuZGFzaEdhcCxvPVtdO3JldHVybiB0LmZvckVhY2goKHQ9Pntjb25zdCBoPWEodCkscj1NYXRoLmZsb29yKGgvKHMrbikpLGk9KGgrbi1yKihzK24pKS8yO2xldCBjPXRbMF0sbD10WzFdO2NbMF0+bFswXSYmKGM9dFsxXSxsPXRbMF0pO2NvbnN0IHU9TWF0aC5hdGFuKChsWzFdLWNbMV0pLyhsWzBdLWNbMF0pKTtmb3IobGV0IHQ9MDt0PHI7dCsrKXtjb25zdCBhPXQqKHMrbiksaD1hK3Mscj1bY1swXSthKk1hdGguY29zKHUpK2kqTWF0aC5jb3ModSksY1sxXSthKk1hdGguc2luKHUpK2kqTWF0aC5zaW4odSldLGw9W2NbMF0raCpNYXRoLmNvcyh1KStpKk1hdGguY29zKHUpLGNbMV0raCpNYXRoLnNpbih1KStpKk1hdGguc2luKHUpXTtvLnB1c2goLi4udGhpcy5oZWxwZXIuZG91YmxlTGluZU9wcyhyWzBdLHJbMV0sbFswXSxsWzFdLGUpKX19KSksb319Y2xhc3MgbHtjb25zdHJ1Y3Rvcih0KXt0aGlzLmhlbHBlcj10fWZpbGxQb2x5Z29ucyh0LGUpe2NvbnN0IHM9ZS5oYWNodXJlR2FwPDA/NCplLnN0cm9rZVdpZHRoOmUuaGFjaHVyZUdhcCxvPWUuemlnemFnT2Zmc2V0PDA/czplLnppZ3phZ09mZnNldCxhPW4odCxlPU9iamVjdC5hc3NpZ24oe30sZSx7aGFjaHVyZUdhcDpzK299KSk7cmV0dXJue3R5cGU6XCJmaWxsU2tldGNoXCIsb3BzOnRoaXMuemlnemFnTGluZXMoYSxvLGUpfX16aWd6YWdMaW5lcyh0LGUscyl7Y29uc3Qgbj1bXTtyZXR1cm4gdC5mb3JFYWNoKCh0PT57Y29uc3Qgbz1hKHQpLGg9TWF0aC5yb3VuZChvLygyKmUpKTtsZXQgcj10WzBdLGk9dFsxXTtyWzBdPmlbMF0mJihyPXRbMV0saT10WzBdKTtjb25zdCBjPU1hdGguYXRhbigoaVsxXS1yWzFdKS8oaVswXS1yWzBdKSk7Zm9yKGxldCB0PTA7dDxoO3QrKyl7Y29uc3Qgbz0yKnQqZSxhPTIqKHQrMSkqZSxoPU1hdGguc3FydCgyKk1hdGgucG93KGUsMikpLGk9W3JbMF0rbypNYXRoLmNvcyhjKSxyWzFdK28qTWF0aC5zaW4oYyldLGw9W3JbMF0rYSpNYXRoLmNvcyhjKSxyWzFdK2EqTWF0aC5zaW4oYyldLHU9W2lbMF0raCpNYXRoLmNvcyhjK01hdGguUEkvNCksaVsxXStoKk1hdGguc2luKGMrTWF0aC5QSS80KV07bi5wdXNoKC4uLnRoaXMuaGVscGVyLmRvdWJsZUxpbmVPcHMoaVswXSxpWzFdLHVbMF0sdVsxXSxzKSwuLi50aGlzLmhlbHBlci5kb3VibGVMaW5lT3BzKHVbMF0sdVsxXSxsWzBdLGxbMV0scykpfX0pKSxufX1jb25zdCB1PXt9O2NsYXNzIHB7Y29uc3RydWN0b3IodCl7dGhpcy5zZWVkPXR9bmV4dCgpe3JldHVybiB0aGlzLnNlZWQ/KDIqKjMxLTEmKHRoaXMuc2VlZD1NYXRoLmltdWwoNDgyNzEsdGhpcy5zZWVkKSkpLzIqKjMxOk1hdGgucmFuZG9tKCl9fWNvbnN0IGY9MCxkPTEsZz0yLE09e0E6NyxhOjcsQzo2LGM6NixIOjEsaDoxLEw6MixsOjIsTToyLG06MixROjQscTo0LFM6NCxzOjQsVDoyLHQ6MixWOjEsdjoxLFo6MCx6OjB9O2Z1bmN0aW9uIGsodCxlKXtyZXR1cm4gdC50eXBlPT09ZX1mdW5jdGlvbiBiKHQpe2NvbnN0IGU9W10scz1mdW5jdGlvbih0KXtjb25zdCBlPW5ldyBBcnJheTtmb3IoO1wiXCIhPT10OylpZih0Lm1hdGNoKC9eKFsgXFx0XFxyXFxuLF0rKS8pKXQ9dC5zdWJzdHIoUmVnRXhwLiQxLmxlbmd0aCk7ZWxzZSBpZih0Lm1hdGNoKC9eKFthQWNDaEhsTG1NcVFzU3RUdlZ6Wl0pLykpZVtlLmxlbmd0aF09e3R5cGU6Zix0ZXh0OlJlZ0V4cC4kMX0sdD10LnN1YnN0cihSZWdFeHAuJDEubGVuZ3RoKTtlbHNle2lmKCF0Lm1hdGNoKC9eKChbLStdP1swLTldKyhcXC5bMC05XSopP3xbLStdP1xcLlswLTldKykoW2VFXVstK10/WzAtOV0rKT8pLykpcmV0dXJuW107ZVtlLmxlbmd0aF09e3R5cGU6ZCx0ZXh0OmAke3BhcnNlRmxvYXQoUmVnRXhwLiQxKX1gfSx0PXQuc3Vic3RyKFJlZ0V4cC4kMS5sZW5ndGgpfXJldHVybiBlW2UubGVuZ3RoXT17dHlwZTpnLHRleHQ6XCJcIn0sZX0odCk7bGV0IG49XCJCT0RcIixvPTAsYT1zW29dO2Zvcig7IWsoYSxnKTspe2xldCBoPTA7Y29uc3Qgcj1bXTtpZihcIkJPRFwiPT09bil7aWYoXCJNXCIhPT1hLnRleHQmJlwibVwiIT09YS50ZXh0KXJldHVybiBiKFwiTTAsMFwiK3QpO28rKyxoPU1bYS50ZXh0XSxuPWEudGV4dH1lbHNlIGsoYSxkKT9oPU1bbl06KG8rKyxoPU1bYS50ZXh0XSxuPWEudGV4dCk7aWYoIShvK2g8cy5sZW5ndGgpKXRocm93IG5ldyBFcnJvcihcIlBhdGggZGF0YSBlbmRlZCBzaG9ydFwiKTtmb3IobGV0IHQ9bzt0PG8raDt0Kyspe2NvbnN0IGU9c1t0XTtpZighayhlLGQpKXRocm93IG5ldyBFcnJvcihcIlBhcmFtIG5vdCBhIG51bWJlcjogXCIrbitcIixcIitlLnRleHQpO3Jbci5sZW5ndGhdPStlLnRleHR9aWYoXCJudW1iZXJcIiE9dHlwZW9mIE1bbl0pdGhyb3cgbmV3IEVycm9yKFwiQmFkIHNlZ21lbnQ6IFwiK24pO3tjb25zdCB0PXtrZXk6bixkYXRhOnJ9O2UucHVzaCh0KSxvKz1oLGE9c1tvXSxcIk1cIj09PW4mJihuPVwiTFwiKSxcIm1cIj09PW4mJihuPVwibFwiKX19cmV0dXJuIGV9ZnVuY3Rpb24geSh0KXtsZXQgZT0wLHM9MCxuPTAsbz0wO2NvbnN0IGE9W107Zm9yKGNvbnN0e2tleTpoLGRhdGE6cn1vZiB0KXN3aXRjaChoKXtjYXNlXCJNXCI6YS5wdXNoKHtrZXk6XCJNXCIsZGF0YTpbLi4ucl19KSxbZSxzXT1yLFtuLG9dPXI7YnJlYWs7Y2FzZVwibVwiOmUrPXJbMF0scys9clsxXSxhLnB1c2goe2tleTpcIk1cIixkYXRhOltlLHNdfSksbj1lLG89czticmVhaztjYXNlXCJMXCI6YS5wdXNoKHtrZXk6XCJMXCIsZGF0YTpbLi4ucl19KSxbZSxzXT1yO2JyZWFrO2Nhc2VcImxcIjplKz1yWzBdLHMrPXJbMV0sYS5wdXNoKHtrZXk6XCJMXCIsZGF0YTpbZSxzXX0pO2JyZWFrO2Nhc2VcIkNcIjphLnB1c2goe2tleTpcIkNcIixkYXRhOlsuLi5yXX0pLGU9cls0XSxzPXJbNV07YnJlYWs7Y2FzZVwiY1wiOntjb25zdCB0PXIubWFwKCgodCxuKT0+biUyP3Qrczp0K2UpKTthLnB1c2goe2tleTpcIkNcIixkYXRhOnR9KSxlPXRbNF0scz10WzVdO2JyZWFrfWNhc2VcIlFcIjphLnB1c2goe2tleTpcIlFcIixkYXRhOlsuLi5yXX0pLGU9clsyXSxzPXJbM107YnJlYWs7Y2FzZVwicVwiOntjb25zdCB0PXIubWFwKCgodCxuKT0+biUyP3Qrczp0K2UpKTthLnB1c2goe2tleTpcIlFcIixkYXRhOnR9KSxlPXRbMl0scz10WzNdO2JyZWFrfWNhc2VcIkFcIjphLnB1c2goe2tleTpcIkFcIixkYXRhOlsuLi5yXX0pLGU9cls1XSxzPXJbNl07YnJlYWs7Y2FzZVwiYVwiOmUrPXJbNV0scys9cls2XSxhLnB1c2goe2tleTpcIkFcIixkYXRhOltyWzBdLHJbMV0sclsyXSxyWzNdLHJbNF0sZSxzXX0pO2JyZWFrO2Nhc2VcIkhcIjphLnB1c2goe2tleTpcIkhcIixkYXRhOlsuLi5yXX0pLGU9clswXTticmVhaztjYXNlXCJoXCI6ZSs9clswXSxhLnB1c2goe2tleTpcIkhcIixkYXRhOltlXX0pO2JyZWFrO2Nhc2VcIlZcIjphLnB1c2goe2tleTpcIlZcIixkYXRhOlsuLi5yXX0pLHM9clswXTticmVhaztjYXNlXCJ2XCI6cys9clswXSxhLnB1c2goe2tleTpcIlZcIixkYXRhOltzXX0pO2JyZWFrO2Nhc2VcIlNcIjphLnB1c2goe2tleTpcIlNcIixkYXRhOlsuLi5yXX0pLGU9clsyXSxzPXJbM107YnJlYWs7Y2FzZVwic1wiOntjb25zdCB0PXIubWFwKCgodCxuKT0+biUyP3Qrczp0K2UpKTthLnB1c2goe2tleTpcIlNcIixkYXRhOnR9KSxlPXRbMl0scz10WzNdO2JyZWFrfWNhc2VcIlRcIjphLnB1c2goe2tleTpcIlRcIixkYXRhOlsuLi5yXX0pLGU9clswXSxzPXJbMV07YnJlYWs7Y2FzZVwidFwiOmUrPXJbMF0scys9clsxXSxhLnB1c2goe2tleTpcIlRcIixkYXRhOltlLHNdfSk7YnJlYWs7Y2FzZVwiWlwiOmNhc2VcInpcIjphLnB1c2goe2tleTpcIlpcIixkYXRhOltdfSksZT1uLHM9b31yZXR1cm4gYX1mdW5jdGlvbiBtKHQpe2NvbnN0IGU9W107bGV0IHM9XCJcIixuPTAsbz0wLGE9MCxoPTAscj0wLGk9MDtmb3IoY29uc3R7a2V5OmMsZGF0YTpsfW9mIHQpe3N3aXRjaChjKXtjYXNlXCJNXCI6ZS5wdXNoKHtrZXk6XCJNXCIsZGF0YTpbLi4ubF19KSxbbixvXT1sLFthLGhdPWw7YnJlYWs7Y2FzZVwiQ1wiOmUucHVzaCh7a2V5OlwiQ1wiLGRhdGE6Wy4uLmxdfSksbj1sWzRdLG89bFs1XSxyPWxbMl0saT1sWzNdO2JyZWFrO2Nhc2VcIkxcIjplLnB1c2goe2tleTpcIkxcIixkYXRhOlsuLi5sXX0pLFtuLG9dPWw7YnJlYWs7Y2FzZVwiSFwiOm49bFswXSxlLnB1c2goe2tleTpcIkxcIixkYXRhOltuLG9dfSk7YnJlYWs7Y2FzZVwiVlwiOm89bFswXSxlLnB1c2goe2tleTpcIkxcIixkYXRhOltuLG9dfSk7YnJlYWs7Y2FzZVwiU1wiOntsZXQgdD0wLGE9MDtcIkNcIj09PXN8fFwiU1wiPT09cz8odD1uKyhuLXIpLGE9bysoby1pKSk6KHQ9bixhPW8pLGUucHVzaCh7a2V5OlwiQ1wiLGRhdGE6W3QsYSwuLi5sXX0pLHI9bFswXSxpPWxbMV0sbj1sWzJdLG89bFszXTticmVha31jYXNlXCJUXCI6e2NvbnN0W3QsYV09bDtsZXQgaD0wLGM9MDtcIlFcIj09PXN8fFwiVFwiPT09cz8oaD1uKyhuLXIpLGM9bysoby1pKSk6KGg9bixjPW8pO2NvbnN0IHU9bisyKihoLW4pLzMscD1vKzIqKGMtbykvMyxmPXQrMiooaC10KS8zLGQ9YSsyKihjLWEpLzM7ZS5wdXNoKHtrZXk6XCJDXCIsZGF0YTpbdSxwLGYsZCx0LGFdfSkscj1oLGk9YyxuPXQsbz1hO2JyZWFrfWNhc2VcIlFcIjp7Y29uc3RbdCxzLGEsaF09bCxjPW4rMioodC1uKS8zLHU9bysyKihzLW8pLzMscD1hKzIqKHQtYSkvMyxmPWgrMioocy1oKS8zO2UucHVzaCh7a2V5OlwiQ1wiLGRhdGE6W2MsdSxwLGYsYSxoXX0pLHI9dCxpPXMsbj1hLG89aDticmVha31jYXNlXCJBXCI6e2NvbnN0IHQ9TWF0aC5hYnMobFswXSkscz1NYXRoLmFicyhsWzFdKSxhPWxbMl0saD1sWzNdLHI9bFs0XSxpPWxbNV0sYz1sWzZdO2lmKDA9PT10fHwwPT09cyllLnB1c2goe2tleTpcIkNcIixkYXRhOltuLG8saSxjLGksY119KSxuPWksbz1jO2Vsc2UgaWYobiE9PWl8fG8hPT1jKXt4KG4sbyxpLGMsdCxzLGEsaCxyKS5mb3JFYWNoKChmdW5jdGlvbih0KXtlLnB1c2goe2tleTpcIkNcIixkYXRhOnR9KX0pKSxuPWksbz1jfWJyZWFrfWNhc2VcIlpcIjplLnB1c2goe2tleTpcIlpcIixkYXRhOltdfSksbj1hLG89aH1zPWN9cmV0dXJuIGV9ZnVuY3Rpb24gdyh0LGUscyl7cmV0dXJuW3QqTWF0aC5jb3MocyktZSpNYXRoLnNpbihzKSx0Kk1hdGguc2luKHMpK2UqTWF0aC5jb3MocyldfWZ1bmN0aW9uIHgodCxlLHMsbixvLGEsaCxyLGksYyl7Y29uc3QgbD0odT1oLE1hdGguUEkqdS8xODApO3ZhciB1O2xldCBwPVtdLGY9MCxkPTAsZz0wLE09MDtpZihjKVtmLGQsZyxNXT1jO2Vsc2V7W3QsZV09dyh0LGUsLWwpLFtzLG5dPXcocyxuLC1sKTtjb25zdCBoPSh0LXMpLzIsYz0oZS1uKS8yO2xldCB1PWgqaC8obypvKStjKmMvKGEqYSk7dT4xJiYodT1NYXRoLnNxcnQodSksbyo9dSxhKj11KTtjb25zdCBwPW8qbyxrPWEqYSxiPXAqay1wKmMqYy1rKmgqaCx5PXAqYypjK2sqaCpoLG09KHI9PT1pPy0xOjEpKk1hdGguc3FydChNYXRoLmFicyhiL3kpKTtnPW0qbypjL2ErKHQrcykvMixNPW0qLWEqaC9vKyhlK24pLzIsZj1NYXRoLmFzaW4ocGFyc2VGbG9hdCgoKGUtTSkvYSkudG9GaXhlZCg5KSkpLGQ9TWF0aC5hc2luKHBhcnNlRmxvYXQoKChuLU0pL2EpLnRvRml4ZWQoOSkpKSx0PGcmJihmPU1hdGguUEktZiksczxnJiYoZD1NYXRoLlBJLWQpLGY8MCYmKGY9MipNYXRoLlBJK2YpLGQ8MCYmKGQ9MipNYXRoLlBJK2QpLGkmJmY+ZCYmKGYtPTIqTWF0aC5QSSksIWkmJmQ+ZiYmKGQtPTIqTWF0aC5QSSl9bGV0IGs9ZC1mO2lmKE1hdGguYWJzKGspPjEyMCpNYXRoLlBJLzE4MCl7Y29uc3QgdD1kLGU9cyxyPW47ZD1pJiZkPmY/ZisxMjAqTWF0aC5QSS8xODAqMTpmKzEyMCpNYXRoLlBJLzE4MCotMSxwPXgocz1nK28qTWF0aC5jb3MoZCksbj1NK2EqTWF0aC5zaW4oZCksZSxyLG8sYSxoLDAsaSxbZCx0LGcsTV0pfWs9ZC1mO2NvbnN0IGI9TWF0aC5jb3MoZikseT1NYXRoLnNpbihmKSxtPU1hdGguY29zKGQpLFA9TWF0aC5zaW4oZCksdj1NYXRoLnRhbihrLzQpLFM9NC8zKm8qdixPPTQvMyphKnYsTD1bdCxlXSxUPVt0K1MqeSxlLU8qYl0sRD1bcytTKlAsbi1PKm1dLEE9W3Msbl07aWYoVFswXT0yKkxbMF0tVFswXSxUWzFdPTIqTFsxXS1UWzFdLGMpcmV0dXJuW1QsRCxBXS5jb25jYXQocCk7e3A9W1QsRCxBXS5jb25jYXQocCk7Y29uc3QgdD1bXTtmb3IobGV0IGU9MDtlPHAubGVuZ3RoO2UrPTMpe2NvbnN0IHM9dyhwW2VdWzBdLHBbZV1bMV0sbCksbj13KHBbZSsxXVswXSxwW2UrMV1bMV0sbCksbz13KHBbZSsyXVswXSxwW2UrMl1bMV0sbCk7dC5wdXNoKFtzWzBdLHNbMV0sblswXSxuWzFdLG9bMF0sb1sxXV0pfXJldHVybiB0fX1jb25zdCBQPXtyYW5kT2Zmc2V0OmZ1bmN0aW9uKHQsZSl7cmV0dXJuIEcodCxlKX0scmFuZE9mZnNldFdpdGhSYW5nZTpmdW5jdGlvbih0LGUscyl7cmV0dXJuIEUodCxlLHMpfSxlbGxpcHNlOmZ1bmN0aW9uKHQsZSxzLG4sbyl7Y29uc3QgYT1UKHMsbixvKTtyZXR1cm4gRCh0LGUsbyxhKS5vcHNldH0sZG91YmxlTGluZU9wczpmdW5jdGlvbih0LGUscyxuLG8pe3JldHVybiAkKHQsZSxzLG4sbywhMCl9fTtmdW5jdGlvbiB2KHQsZSxzLG4sbyl7cmV0dXJue3R5cGU6XCJwYXRoXCIsb3BzOiQodCxlLHMsbixvKX19ZnVuY3Rpb24gUyh0LGUscyl7Y29uc3Qgbj0odHx8W10pLmxlbmd0aDtpZihuPjIpe2NvbnN0IG89W107Zm9yKGxldCBlPTA7ZTxuLTE7ZSsrKW8ucHVzaCguLi4kKHRbZV1bMF0sdFtlXVsxXSx0W2UrMV1bMF0sdFtlKzFdWzFdLHMpKTtyZXR1cm4gZSYmby5wdXNoKC4uLiQodFtuLTFdWzBdLHRbbi0xXVsxXSx0WzBdWzBdLHRbMF1bMV0scykpLHt0eXBlOlwicGF0aFwiLG9wczpvfX1yZXR1cm4gMj09PW4/dih0WzBdWzBdLHRbMF1bMV0sdFsxXVswXSx0WzFdWzFdLHMpOnt0eXBlOlwicGF0aFwiLG9wczpbXX19ZnVuY3Rpb24gTyh0LGUscyxuLG8pe3JldHVybiBmdW5jdGlvbih0LGUpe3JldHVybiBTKHQsITAsZSl9KFtbdCxlXSxbdCtzLGVdLFt0K3MsZStuXSxbdCxlK25dXSxvKX1mdW5jdGlvbiBMKHQsZSl7aWYodC5sZW5ndGgpe2NvbnN0IHM9XCJudW1iZXJcIj09dHlwZW9mIHRbMF1bMF0/W3RdOnQsbj1qKHNbMF0sMSooMSsuMiplLnJvdWdobmVzcyksZSksbz1lLmRpc2FibGVNdWx0aVN0cm9rZT9bXTpqKHNbMF0sMS41KigxKy4yMiplLnJvdWdobmVzcykseihlKSk7Zm9yKGxldCB0PTE7dDxzLmxlbmd0aDt0Kyspe2NvbnN0IGE9c1t0XTtpZihhLmxlbmd0aCl7Y29uc3QgdD1qKGEsMSooMSsuMiplLnJvdWdobmVzcyksZSkscz1lLmRpc2FibGVNdWx0aVN0cm9rZT9bXTpqKGEsMS41KigxKy4yMiplLnJvdWdobmVzcykseihlKSk7Zm9yKGNvbnN0IGUgb2YgdClcIm1vdmVcIiE9PWUub3AmJm4ucHVzaChlKTtmb3IoY29uc3QgdCBvZiBzKVwibW92ZVwiIT09dC5vcCYmby5wdXNoKHQpfX1yZXR1cm57dHlwZTpcInBhdGhcIixvcHM6bi5jb25jYXQobyl9fXJldHVybnt0eXBlOlwicGF0aFwiLG9wczpbXX19ZnVuY3Rpb24gVCh0LGUscyl7Y29uc3Qgbj1NYXRoLnNxcnQoMipNYXRoLlBJKk1hdGguc3FydCgoTWF0aC5wb3codC8yLDIpK01hdGgucG93KGUvMiwyKSkvMikpLG89TWF0aC5jZWlsKE1hdGgubWF4KHMuY3VydmVTdGVwQ291bnQscy5jdXJ2ZVN0ZXBDb3VudC9NYXRoLnNxcnQoMjAwKSpuKSksYT0yKk1hdGguUEkvbztsZXQgaD1NYXRoLmFicyh0LzIpLHI9TWF0aC5hYnMoZS8yKTtjb25zdCBpPTEtcy5jdXJ2ZUZpdHRpbmc7cmV0dXJuIGgrPUcoaCppLHMpLHIrPUcocippLHMpLHtpbmNyZW1lbnQ6YSxyeDpoLHJ5OnJ9fWZ1bmN0aW9uIEQodCxlLHMsbil7Y29uc3RbbyxhXT1GKG4uaW5jcmVtZW50LHQsZSxuLnJ4LG4ucnksMSxuLmluY3JlbWVudCpFKC4xLEUoLjQsMSxzKSxzKSxzKTtsZXQgaD1xKG8sbnVsbCxzKTtpZighcy5kaXNhYmxlTXVsdGlTdHJva2UmJjAhPT1zLnJvdWdobmVzcyl7Y29uc3Rbb109RihuLmluY3JlbWVudCx0LGUsbi5yeCxuLnJ5LDEuNSwwLHMpLGE9cShvLG51bGwscyk7aD1oLmNvbmNhdChhKX1yZXR1cm57ZXN0aW1hdGVkUG9pbnRzOmEsb3BzZXQ6e3R5cGU6XCJwYXRoXCIsb3BzOmh9fX1mdW5jdGlvbiBBKHQsZSxzLG4sbyxhLGgscixpKXtjb25zdCBjPXQsbD1lO2xldCB1PU1hdGguYWJzKHMvMikscD1NYXRoLmFicyhuLzIpO3UrPUcoLjAxKnUsaSkscCs9RyguMDEqcCxpKTtsZXQgZj1vLGQ9YTtmb3IoO2Y8MDspZis9MipNYXRoLlBJLGQrPTIqTWF0aC5QSTtkLWY+MipNYXRoLlBJJiYoZj0wLGQ9MipNYXRoLlBJKTtjb25zdCBnPTIqTWF0aC5QSS9pLmN1cnZlU3RlcENvdW50LE09TWF0aC5taW4oZy8yLChkLWYpLzIpLGs9VihNLGMsbCx1LHAsZixkLDEsaSk7aWYoIWkuZGlzYWJsZU11bHRpU3Ryb2tlKXtjb25zdCB0PVYoTSxjLGwsdSxwLGYsZCwxLjUsaSk7ay5wdXNoKC4uLnQpfXJldHVybiBoJiYocj9rLnB1c2goLi4uJChjLGwsYyt1Kk1hdGguY29zKGYpLGwrcCpNYXRoLnNpbihmKSxpKSwuLi4kKGMsbCxjK3UqTWF0aC5jb3MoZCksbCtwKk1hdGguc2luKGQpLGkpKTprLnB1c2goe29wOlwibGluZVRvXCIsZGF0YTpbYyxsXX0se29wOlwibGluZVRvXCIsZGF0YTpbYyt1Kk1hdGguY29zKGYpLGwrcCpNYXRoLnNpbihmKV19KSkse3R5cGU6XCJwYXRoXCIsb3BzOmt9fWZ1bmN0aW9uIF8odCxlKXtjb25zdCBzPW0oeShiKHQpKSksbj1bXTtsZXQgbz1bMCwwXSxhPVswLDBdO2Zvcihjb25zdHtrZXk6dCxkYXRhOmh9b2Ygcylzd2l0Y2godCl7Y2FzZVwiTVwiOmE9W2hbMF0saFsxXV0sbz1baFswXSxoWzFdXTticmVhaztjYXNlXCJMXCI6bi5wdXNoKC4uLiQoYVswXSxhWzFdLGhbMF0saFsxXSxlKSksYT1baFswXSxoWzFdXTticmVhaztjYXNlXCJDXCI6e2NvbnN0W3QscyxvLHIsaSxjXT1oO24ucHVzaCguLi5aKHQscyxvLHIsaSxjLGEsZSkpLGE9W2ksY107YnJlYWt9Y2FzZVwiWlwiOm4ucHVzaCguLi4kKGFbMF0sYVsxXSxvWzBdLG9bMV0sZSkpLGE9W29bMF0sb1sxXV19cmV0dXJue3R5cGU6XCJwYXRoXCIsb3BzOm59fWZ1bmN0aW9uIEkodCxlKXtjb25zdCBzPVtdO2Zvcihjb25zdCBuIG9mIHQpaWYobi5sZW5ndGgpe2NvbnN0IHQ9ZS5tYXhSYW5kb21uZXNzT2Zmc2V0fHwwLG89bi5sZW5ndGg7aWYobz4yKXtzLnB1c2goe29wOlwibW92ZVwiLGRhdGE6W25bMF1bMF0rRyh0LGUpLG5bMF1bMV0rRyh0LGUpXX0pO2ZvcihsZXQgYT0xO2E8bzthKyspcy5wdXNoKHtvcDpcImxpbmVUb1wiLGRhdGE6W25bYV1bMF0rRyh0LGUpLG5bYV1bMV0rRyh0LGUpXX0pfX1yZXR1cm57dHlwZTpcImZpbGxQYXRoXCIsb3BzOnN9fWZ1bmN0aW9uIEModCxlKXtyZXR1cm4gZnVuY3Rpb24odCxlKXtsZXQgcz10LmZpbGxTdHlsZXx8XCJoYWNodXJlXCI7aWYoIXVbc10pc3dpdGNoKHMpe2Nhc2VcInppZ3phZ1wiOnVbc118fCh1W3NdPW5ldyBoKGUpKTticmVhaztjYXNlXCJjcm9zcy1oYXRjaFwiOnVbc118fCh1W3NdPW5ldyByKGUpKTticmVhaztjYXNlXCJkb3RzXCI6dVtzXXx8KHVbc109bmV3IGkoZSkpO2JyZWFrO2Nhc2VcImRhc2hlZFwiOnVbc118fCh1W3NdPW5ldyBjKGUpKTticmVhaztjYXNlXCJ6aWd6YWctbGluZVwiOnVbc118fCh1W3NdPW5ldyBsKGUpKTticmVhaztkZWZhdWx0OnM9XCJoYWNodXJlXCIsdVtzXXx8KHVbc109bmV3IG8oZSkpfXJldHVybiB1W3NdfShlLFApLmZpbGxQb2x5Z29ucyh0LGUpfWZ1bmN0aW9uIHoodCl7Y29uc3QgZT1PYmplY3QuYXNzaWduKHt9LHQpO3JldHVybiBlLnJhbmRvbWl6ZXI9dm9pZCAwLHQuc2VlZCYmKGUuc2VlZD10LnNlZWQrMSksZX1mdW5jdGlvbiBXKHQpe3JldHVybiB0LnJhbmRvbWl6ZXJ8fCh0LnJhbmRvbWl6ZXI9bmV3IHAodC5zZWVkfHwwKSksdC5yYW5kb21pemVyLm5leHQoKX1mdW5jdGlvbiBFKHQsZSxzLG49MSl7cmV0dXJuIHMucm91Z2huZXNzKm4qKFcocykqKGUtdCkrdCl9ZnVuY3Rpb24gRyh0LGUscz0xKXtyZXR1cm4gRSgtdCx0LGUscyl9ZnVuY3Rpb24gJCh0LGUscyxuLG8sYT0hMSl7Y29uc3QgaD1hP28uZGlzYWJsZU11bHRpU3Ryb2tlRmlsbDpvLmRpc2FibGVNdWx0aVN0cm9rZSxyPVIodCxlLHMsbixvLCEwLCExKTtpZihoKXJldHVybiByO2NvbnN0IGk9Uih0LGUscyxuLG8sITAsITApO3JldHVybiByLmNvbmNhdChpKX1mdW5jdGlvbiBSKHQsZSxzLG4sbyxhLGgpe2NvbnN0IHI9TWF0aC5wb3codC1zLDIpK01hdGgucG93KGUtbiwyKSxpPU1hdGguc3FydChyKTtsZXQgYz0xO2M9aTwyMDA/MTppPjUwMD8uNDotLjAwMTY2NjgqaSsxLjIzMzMzNDtsZXQgbD1vLm1heFJhbmRvbW5lc3NPZmZzZXR8fDA7bCpsKjEwMD5yJiYobD1pLzEwKTtjb25zdCB1PWwvMixwPS4yKy4yKlcobyk7bGV0IGY9by5ib3dpbmcqby5tYXhSYW5kb21uZXNzT2Zmc2V0KihuLWUpLzIwMCxkPW8uYm93aW5nKm8ubWF4UmFuZG9tbmVzc09mZnNldCoodC1zKS8yMDA7Zj1HKGYsbyxjKSxkPUcoZCxvLGMpO2NvbnN0IGc9W10sTT0oKT0+Ryh1LG8sYyksaz0oKT0+RyhsLG8sYyksYj1vLnByZXNlcnZlVmVydGljZXM7cmV0dXJuIGEmJihoP2cucHVzaCh7b3A6XCJtb3ZlXCIsZGF0YTpbdCsoYj8wOk0oKSksZSsoYj8wOk0oKSldfSk6Zy5wdXNoKHtvcDpcIm1vdmVcIixkYXRhOlt0KyhiPzA6RyhsLG8sYykpLGUrKGI/MDpHKGwsbyxjKSldfSkpLGg/Zy5wdXNoKHtvcDpcImJjdXJ2ZVRvXCIsZGF0YTpbZit0KyhzLXQpKnArTSgpLGQrZSsobi1lKSpwK00oKSxmK3QrMioocy10KSpwK00oKSxkK2UrMioobi1lKSpwK00oKSxzKyhiPzA6TSgpKSxuKyhiPzA6TSgpKV19KTpnLnB1c2goe29wOlwiYmN1cnZlVG9cIixkYXRhOltmK3QrKHMtdCkqcCtrKCksZCtlKyhuLWUpKnAraygpLGYrdCsyKihzLXQpKnAraygpLGQrZSsyKihuLWUpKnAraygpLHMrKGI/MDprKCkpLG4rKGI/MDprKCkpXX0pLGd9ZnVuY3Rpb24gaih0LGUscyl7aWYoIXQubGVuZ3RoKXJldHVybltdO2NvbnN0IG49W107bi5wdXNoKFt0WzBdWzBdK0coZSxzKSx0WzBdWzFdK0coZSxzKV0pLG4ucHVzaChbdFswXVswXStHKGUscyksdFswXVsxXStHKGUscyldKTtmb3IobGV0IG89MTtvPHQubGVuZ3RoO28rKyluLnB1c2goW3Rbb11bMF0rRyhlLHMpLHRbb11bMV0rRyhlLHMpXSksbz09PXQubGVuZ3RoLTEmJm4ucHVzaChbdFtvXVswXStHKGUscyksdFtvXVsxXStHKGUscyldKTtyZXR1cm4gcShuLG51bGwscyl9ZnVuY3Rpb24gcSh0LGUscyl7Y29uc3Qgbj10Lmxlbmd0aCxvPVtdO2lmKG4+Myl7Y29uc3QgYT1bXSxoPTEtcy5jdXJ2ZVRpZ2h0bmVzcztvLnB1c2goe29wOlwibW92ZVwiLGRhdGE6W3RbMV1bMF0sdFsxXVsxXV19KTtmb3IobGV0IGU9MTtlKzI8bjtlKyspe2NvbnN0IHM9dFtlXTthWzBdPVtzWzBdLHNbMV1dLGFbMV09W3NbMF0rKGgqdFtlKzFdWzBdLWgqdFtlLTFdWzBdKS82LHNbMV0rKGgqdFtlKzFdWzFdLWgqdFtlLTFdWzFdKS82XSxhWzJdPVt0W2UrMV1bMF0rKGgqdFtlXVswXS1oKnRbZSsyXVswXSkvNix0W2UrMV1bMV0rKGgqdFtlXVsxXS1oKnRbZSsyXVsxXSkvNl0sYVszXT1bdFtlKzFdWzBdLHRbZSsxXVsxXV0sby5wdXNoKHtvcDpcImJjdXJ2ZVRvXCIsZGF0YTpbYVsxXVswXSxhWzFdWzFdLGFbMl1bMF0sYVsyXVsxXSxhWzNdWzBdLGFbM11bMV1dfSl9aWYoZSYmMj09PWUubGVuZ3RoKXtjb25zdCB0PXMubWF4UmFuZG9tbmVzc09mZnNldDtvLnB1c2goe29wOlwibGluZVRvXCIsZGF0YTpbZVswXStHKHQscyksZVsxXStHKHQscyldfSl9fWVsc2UgMz09PW4/KG8ucHVzaCh7b3A6XCJtb3ZlXCIsZGF0YTpbdFsxXVswXSx0WzFdWzFdXX0pLG8ucHVzaCh7b3A6XCJiY3VydmVUb1wiLGRhdGE6W3RbMV1bMF0sdFsxXVsxXSx0WzJdWzBdLHRbMl1bMV0sdFsyXVswXSx0WzJdWzFdXX0pKToyPT09biYmby5wdXNoKC4uLlIodFswXVswXSx0WzBdWzFdLHRbMV1bMF0sdFsxXVsxXSxzLCEwLCEwKSk7cmV0dXJuIG99ZnVuY3Rpb24gRih0LGUscyxuLG8sYSxoLHIpe2NvbnN0IGk9W10sYz1bXTtpZigwPT09ci5yb3VnaG5lc3Mpe3QvPTQsYy5wdXNoKFtlK24qTWF0aC5jb3MoLXQpLHMrbypNYXRoLnNpbigtdCldKTtmb3IobGV0IGE9MDthPD0yKk1hdGguUEk7YSs9dCl7Y29uc3QgdD1bZStuKk1hdGguY29zKGEpLHMrbypNYXRoLnNpbihhKV07aS5wdXNoKHQpLGMucHVzaCh0KX1jLnB1c2goW2UrbipNYXRoLmNvcygwKSxzK28qTWF0aC5zaW4oMCldKSxjLnB1c2goW2UrbipNYXRoLmNvcyh0KSxzK28qTWF0aC5zaW4odCldKX1lbHNle2NvbnN0IGw9RyguNSxyKS1NYXRoLlBJLzI7Yy5wdXNoKFtHKGEscikrZSsuOSpuKk1hdGguY29zKGwtdCksRyhhLHIpK3MrLjkqbypNYXRoLnNpbihsLXQpXSk7Y29uc3QgdT0yKk1hdGguUEkrbC0uMDE7Zm9yKGxldCBoPWw7aDx1O2grPXQpe2NvbnN0IHQ9W0coYSxyKStlK24qTWF0aC5jb3MoaCksRyhhLHIpK3MrbypNYXRoLnNpbihoKV07aS5wdXNoKHQpLGMucHVzaCh0KX1jLnB1c2goW0coYSxyKStlK24qTWF0aC5jb3MobCsyKk1hdGguUEkrLjUqaCksRyhhLHIpK3MrbypNYXRoLnNpbihsKzIqTWF0aC5QSSsuNSpoKV0pLGMucHVzaChbRyhhLHIpK2UrLjk4Km4qTWF0aC5jb3MobCtoKSxHKGEscikrcysuOTgqbypNYXRoLnNpbihsK2gpXSksYy5wdXNoKFtHKGEscikrZSsuOSpuKk1hdGguY29zKGwrLjUqaCksRyhhLHIpK3MrLjkqbypNYXRoLnNpbihsKy41KmgpXSl9cmV0dXJuW2MsaV19ZnVuY3Rpb24gVih0LGUscyxuLG8sYSxoLHIsaSl7Y29uc3QgYz1hK0coLjEsaSksbD1bXTtsLnB1c2goW0cocixpKStlKy45Km4qTWF0aC5jb3MoYy10KSxHKHIsaSkrcysuOSpvKk1hdGguc2luKGMtdCldKTtmb3IobGV0IGE9YzthPD1oO2ErPXQpbC5wdXNoKFtHKHIsaSkrZStuKk1hdGguY29zKGEpLEcocixpKStzK28qTWF0aC5zaW4oYSldKTtyZXR1cm4gbC5wdXNoKFtlK24qTWF0aC5jb3MoaCkscytvKk1hdGguc2luKGgpXSksbC5wdXNoKFtlK24qTWF0aC5jb3MoaCkscytvKk1hdGguc2luKGgpXSkscShsLG51bGwsaSl9ZnVuY3Rpb24gWih0LGUscyxuLG8sYSxoLHIpe2NvbnN0IGk9W10sYz1bci5tYXhSYW5kb21uZXNzT2Zmc2V0fHwxLChyLm1heFJhbmRvbW5lc3NPZmZzZXR8fDEpKy4zXTtsZXQgbD1bMCwwXTtjb25zdCB1PXIuZGlzYWJsZU11bHRpU3Ryb2tlPzE6MixwPXIucHJlc2VydmVWZXJ0aWNlcztmb3IobGV0IGY9MDtmPHU7ZisrKTA9PT1mP2kucHVzaCh7b3A6XCJtb3ZlXCIsZGF0YTpbaFswXSxoWzFdXX0pOmkucHVzaCh7b3A6XCJtb3ZlXCIsZGF0YTpbaFswXSsocD8wOkcoY1swXSxyKSksaFsxXSsocD8wOkcoY1swXSxyKSldfSksbD1wP1tvLGFdOltvK0coY1tmXSxyKSxhK0coY1tmXSxyKV0saS5wdXNoKHtvcDpcImJjdXJ2ZVRvXCIsZGF0YTpbdCtHKGNbZl0sciksZStHKGNbZl0scikscytHKGNbZl0sciksbitHKGNbZl0sciksbFswXSxsWzFdXX0pO3JldHVybiBpfWZ1bmN0aW9uIFEodCl7cmV0dXJuWy4uLnRdfWZ1bmN0aW9uIEgodCxlPTApe2NvbnN0IHM9dC5sZW5ndGg7aWYoczwzKXRocm93IG5ldyBFcnJvcihcIkEgY3VydmUgbXVzdCBoYXZlIGF0IGxlYXN0IHRocmVlIHBvaW50cy5cIik7Y29uc3Qgbj1bXTtpZigzPT09cyluLnB1c2goUSh0WzBdKSxRKHRbMV0pLFEodFsyXSksUSh0WzJdKSk7ZWxzZXtjb25zdCBzPVtdO3MucHVzaCh0WzBdLHRbMF0pO2ZvcihsZXQgZT0xO2U8dC5sZW5ndGg7ZSsrKXMucHVzaCh0W2VdKSxlPT09dC5sZW5ndGgtMSYmcy5wdXNoKHRbZV0pO2NvbnN0IG89W10sYT0xLWU7bi5wdXNoKFEoc1swXSkpO2ZvcihsZXQgdD0xO3QrMjxzLmxlbmd0aDt0Kyspe2NvbnN0IGU9c1t0XTtvWzBdPVtlWzBdLGVbMV1dLG9bMV09W2VbMF0rKGEqc1t0KzFdWzBdLWEqc1t0LTFdWzBdKS82LGVbMV0rKGEqc1t0KzFdWzFdLWEqc1t0LTFdWzFdKS82XSxvWzJdPVtzW3QrMV1bMF0rKGEqc1t0XVswXS1hKnNbdCsyXVswXSkvNixzW3QrMV1bMV0rKGEqc1t0XVsxXS1hKnNbdCsyXVsxXSkvNl0sb1szXT1bc1t0KzFdWzBdLHNbdCsxXVsxXV0sbi5wdXNoKG9bMV0sb1syXSxvWzNdKX19cmV0dXJuIG59ZnVuY3Rpb24gTih0LGUpe3JldHVybiBNYXRoLnBvdyh0WzBdLWVbMF0sMikrTWF0aC5wb3codFsxXS1lWzFdLDIpfWZ1bmN0aW9uIEIodCxlLHMpe2NvbnN0IG49TihlLHMpO2lmKDA9PT1uKXJldHVybiBOKHQsZSk7bGV0IG89KCh0WzBdLWVbMF0pKihzWzBdLWVbMF0pKyh0WzFdLWVbMV0pKihzWzFdLWVbMV0pKS9uO3JldHVybiBvPU1hdGgubWF4KDAsTWF0aC5taW4oMSxvKSksTih0LEooZSxzLG8pKX1mdW5jdGlvbiBKKHQsZSxzKXtyZXR1cm5bdFswXSsoZVswXS10WzBdKSpzLHRbMV0rKGVbMV0tdFsxXSkqc119ZnVuY3Rpb24gSyh0LGUscyxuKXtjb25zdCBvPW58fFtdO2lmKGZ1bmN0aW9uKHQsZSl7Y29uc3Qgcz10W2UrMF0sbj10W2UrMV0sbz10W2UrMl0sYT10W2UrM107bGV0IGg9MypuWzBdLTIqc1swXS1hWzBdO2gqPWg7bGV0IHI9MypuWzFdLTIqc1sxXS1hWzFdO3IqPXI7bGV0IGk9MypvWzBdLTIqYVswXS1zWzBdO2kqPWk7bGV0IGM9MypvWzFdLTIqYVsxXS1zWzFdO3JldHVybiBjKj1jLGg8aSYmKGg9aSkscjxjJiYocj1jKSxoK3J9KHQsZSk8cyl7Y29uc3Qgcz10W2UrMF07aWYoby5sZW5ndGgpeyhhPW9bby5sZW5ndGgtMV0saD1zLE1hdGguc3FydChOKGEsaCkpKT4xJiZvLnB1c2gocyl9ZWxzZSBvLnB1c2gocyk7by5wdXNoKHRbZSszXSl9ZWxzZXtjb25zdCBuPS41LGE9dFtlKzBdLGg9dFtlKzFdLHI9dFtlKzJdLGk9dFtlKzNdLGM9SihhLGgsbiksbD1KKGgscixuKSx1PUoocixpLG4pLHA9SihjLGwsbiksZj1KKGwsdSxuKSxkPUoocCxmLG4pO0soW2EsYyxwLGRdLDAscyxvKSxLKFtkLGYsdSxpXSwwLHMsbyl9dmFyIGEsaDtyZXR1cm4gb31mdW5jdGlvbiBVKHQsZSl7cmV0dXJuIFgodCwwLHQubGVuZ3RoLGUpfWZ1bmN0aW9uIFgodCxlLHMsbixvKXtjb25zdCBhPW98fFtdLGg9dFtlXSxyPXRbcy0xXTtsZXQgaT0wLGM9MTtmb3IobGV0IG49ZSsxO248cy0xOysrbil7Y29uc3QgZT1CKHRbbl0saCxyKTtlPmkmJihpPWUsYz1uKX1yZXR1cm4gTWF0aC5zcXJ0KGkpPm4/KFgodCxlLGMrMSxuLGEpLFgodCxjLHMsbixhKSk6KGEubGVuZ3RofHxhLnB1c2goaCksYS5wdXNoKHIpKSxhfWZ1bmN0aW9uIFkodCxlPS4xNSxzKXtjb25zdCBuPVtdLG89KHQubGVuZ3RoLTEpLzM7Zm9yKGxldCBzPTA7czxvO3MrKyl7Syh0LDMqcyxlLG4pfXJldHVybiBzJiZzPjA/WChuLDAsbi5sZW5ndGgscyk6bn1jb25zdCB0dD1cIm5vbmVcIjtjbGFzcyBldHtjb25zdHJ1Y3Rvcih0KXt0aGlzLmRlZmF1bHRPcHRpb25zPXttYXhSYW5kb21uZXNzT2Zmc2V0OjIscm91Z2huZXNzOjEsYm93aW5nOjEsc3Ryb2tlOlwiIzAwMFwiLHN0cm9rZVdpZHRoOjEsY3VydmVUaWdodG5lc3M6MCxjdXJ2ZUZpdHRpbmc6Ljk1LGN1cnZlU3RlcENvdW50OjksZmlsbFN0eWxlOlwiaGFjaHVyZVwiLGZpbGxXZWlnaHQ6LTEsaGFjaHVyZUFuZ2xlOi00MSxoYWNodXJlR2FwOi0xLGRhc2hPZmZzZXQ6LTEsZGFzaEdhcDotMSx6aWd6YWdPZmZzZXQ6LTEsc2VlZDowLGRpc2FibGVNdWx0aVN0cm9rZTohMSxkaXNhYmxlTXVsdGlTdHJva2VGaWxsOiExLHByZXNlcnZlVmVydGljZXM6ITEsZmlsbFNoYXBlUm91Z2huZXNzR2FpbjouOH0sdGhpcy5jb25maWc9dHx8e30sdGhpcy5jb25maWcub3B0aW9ucyYmKHRoaXMuZGVmYXVsdE9wdGlvbnM9dGhpcy5fbyh0aGlzLmNvbmZpZy5vcHRpb25zKSl9c3RhdGljIG5ld1NlZWQoKXtyZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjIqKjMxKX1fbyh0KXtyZXR1cm4gdD9PYmplY3QuYXNzaWduKHt9LHRoaXMuZGVmYXVsdE9wdGlvbnMsdCk6dGhpcy5kZWZhdWx0T3B0aW9uc31fZCh0LGUscyl7cmV0dXJue3NoYXBlOnQsc2V0czplfHxbXSxvcHRpb25zOnN8fHRoaXMuZGVmYXVsdE9wdGlvbnN9fWxpbmUodCxlLHMsbixvKXtjb25zdCBhPXRoaXMuX28obyk7cmV0dXJuIHRoaXMuX2QoXCJsaW5lXCIsW3YodCxlLHMsbixhKV0sYSl9cmVjdGFuZ2xlKHQsZSxzLG4sbyl7Y29uc3QgYT10aGlzLl9vKG8pLGg9W10scj1PKHQsZSxzLG4sYSk7aWYoYS5maWxsKXtjb25zdCBvPVtbdCxlXSxbdCtzLGVdLFt0K3MsZStuXSxbdCxlK25dXTtcInNvbGlkXCI9PT1hLmZpbGxTdHlsZT9oLnB1c2goSShbb10sYSkpOmgucHVzaChDKFtvXSxhKSl9cmV0dXJuIGEuc3Ryb2tlIT09dHQmJmgucHVzaChyKSx0aGlzLl9kKFwicmVjdGFuZ2xlXCIsaCxhKX1lbGxpcHNlKHQsZSxzLG4sbyl7Y29uc3QgYT10aGlzLl9vKG8pLGg9W10scj1UKHMsbixhKSxpPUQodCxlLGEscik7aWYoYS5maWxsKWlmKFwic29saWRcIj09PWEuZmlsbFN0eWxlKXtjb25zdCBzPUQodCxlLGEscikub3BzZXQ7cy50eXBlPVwiZmlsbFBhdGhcIixoLnB1c2gocyl9ZWxzZSBoLnB1c2goQyhbaS5lc3RpbWF0ZWRQb2ludHNdLGEpKTtyZXR1cm4gYS5zdHJva2UhPT10dCYmaC5wdXNoKGkub3BzZXQpLHRoaXMuX2QoXCJlbGxpcHNlXCIsaCxhKX1jaXJjbGUodCxlLHMsbil7Y29uc3Qgbz10aGlzLmVsbGlwc2UodCxlLHMscyxuKTtyZXR1cm4gby5zaGFwZT1cImNpcmNsZVwiLG99bGluZWFyUGF0aCh0LGUpe2NvbnN0IHM9dGhpcy5fbyhlKTtyZXR1cm4gdGhpcy5fZChcImxpbmVhclBhdGhcIixbUyh0LCExLHMpXSxzKX1hcmModCxlLHMsbixvLGEsaD0hMSxyKXtjb25zdCBpPXRoaXMuX28ociksYz1bXSxsPUEodCxlLHMsbixvLGEsaCwhMCxpKTtpZihoJiZpLmZpbGwpaWYoXCJzb2xpZFwiPT09aS5maWxsU3R5bGUpe2NvbnN0IGg9T2JqZWN0LmFzc2lnbih7fSxpKTtoLmRpc2FibGVNdWx0aVN0cm9rZT0hMDtjb25zdCByPUEodCxlLHMsbixvLGEsITAsITEsaCk7ci50eXBlPVwiZmlsbFBhdGhcIixjLnB1c2gocil9ZWxzZSBjLnB1c2goZnVuY3Rpb24odCxlLHMsbixvLGEsaCl7Y29uc3Qgcj10LGk9ZTtsZXQgYz1NYXRoLmFicyhzLzIpLGw9TWF0aC5hYnMobi8yKTtjKz1HKC4wMSpjLGgpLGwrPUcoLjAxKmwsaCk7bGV0IHU9byxwPWE7Zm9yKDt1PDA7KXUrPTIqTWF0aC5QSSxwKz0yKk1hdGguUEk7cC11PjIqTWF0aC5QSSYmKHU9MCxwPTIqTWF0aC5QSSk7Y29uc3QgZj0ocC11KS9oLmN1cnZlU3RlcENvdW50LGQ9W107Zm9yKGxldCB0PXU7dDw9cDt0Kz1mKWQucHVzaChbcitjKk1hdGguY29zKHQpLGkrbCpNYXRoLnNpbih0KV0pO3JldHVybiBkLnB1c2goW3IrYypNYXRoLmNvcyhwKSxpK2wqTWF0aC5zaW4ocCldKSxkLnB1c2goW3IsaV0pLEMoW2RdLGgpfSh0LGUscyxuLG8sYSxpKSk7cmV0dXJuIGkuc3Ryb2tlIT09dHQmJmMucHVzaChsKSx0aGlzLl9kKFwiYXJjXCIsYyxpKX1jdXJ2ZSh0LGUpe2NvbnN0IHM9dGhpcy5fbyhlKSxuPVtdLG89TCh0LHMpO2lmKHMuZmlsbCYmcy5maWxsIT09dHQpaWYoXCJzb2xpZFwiPT09cy5maWxsU3R5bGUpe2NvbnN0IGU9TCh0LE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSxzKSx7ZGlzYWJsZU11bHRpU3Ryb2tlOiEwLHJvdWdobmVzczpzLnJvdWdobmVzcz9zLnJvdWdobmVzcytzLmZpbGxTaGFwZVJvdWdobmVzc0dhaW46MH0pKTtuLnB1c2goe3R5cGU6XCJmaWxsUGF0aFwiLG9wczp0aGlzLl9tZXJnZWRTaGFwZShlLm9wcyl9KX1lbHNle2NvbnN0IGU9W10sbz10O2lmKG8ubGVuZ3RoKXtjb25zdCB0PVwibnVtYmVyXCI9PXR5cGVvZiBvWzBdWzBdP1tvXTpvO2Zvcihjb25zdCBuIG9mIHQpbi5sZW5ndGg8Mz9lLnB1c2goLi4ubik6Mz09PW4ubGVuZ3RoP2UucHVzaCguLi5ZKEgoW25bMF0sblswXSxuWzFdLG5bMl1dKSwxMCwoMStzLnJvdWdobmVzcykvMikpOmUucHVzaCguLi5ZKEgobiksMTAsKDErcy5yb3VnaG5lc3MpLzIpKX1lLmxlbmd0aCYmbi5wdXNoKEMoW2VdLHMpKX1yZXR1cm4gcy5zdHJva2UhPT10dCYmbi5wdXNoKG8pLHRoaXMuX2QoXCJjdXJ2ZVwiLG4scyl9cG9seWdvbih0LGUpe2NvbnN0IHM9dGhpcy5fbyhlKSxuPVtdLG89Uyh0LCEwLHMpO3JldHVybiBzLmZpbGwmJihcInNvbGlkXCI9PT1zLmZpbGxTdHlsZT9uLnB1c2goSShbdF0scykpOm4ucHVzaChDKFt0XSxzKSkpLHMuc3Ryb2tlIT09dHQmJm4ucHVzaChvKSx0aGlzLl9kKFwicG9seWdvblwiLG4scyl9cGF0aCh0LGUpe2NvbnN0IHM9dGhpcy5fbyhlKSxuPVtdO2lmKCF0KXJldHVybiB0aGlzLl9kKFwicGF0aFwiLG4scyk7dD0odHx8XCJcIikucmVwbGFjZSgvXFxuL2csXCIgXCIpLnJlcGxhY2UoLygtXFxzKS9nLFwiLVwiKS5yZXBsYWNlKFwiLyhzcykvZ1wiLFwiIFwiKTtjb25zdCBvPXMuZmlsbCYmXCJ0cmFuc3BhcmVudFwiIT09cy5maWxsJiZzLmZpbGwhPT10dCxhPXMuc3Ryb2tlIT09dHQsaD0hIShzLnNpbXBsaWZpY2F0aW9uJiZzLnNpbXBsaWZpY2F0aW9uPDEpLHI9ZnVuY3Rpb24odCxlLHMpe2NvbnN0IG49bSh5KGIodCkpKSxvPVtdO2xldCBhPVtdLGg9WzAsMF0scj1bXTtjb25zdCBpPSgpPT57ci5sZW5ndGg+PTQmJmEucHVzaCguLi5ZKHIsZSkpLHI9W119LGM9KCk9PntpKCksYS5sZW5ndGgmJihvLnB1c2goYSksYT1bXSl9O2Zvcihjb25zdHtrZXk6dCxkYXRhOmV9b2Ygbilzd2l0Y2godCl7Y2FzZVwiTVwiOmMoKSxoPVtlWzBdLGVbMV1dLGEucHVzaChoKTticmVhaztjYXNlXCJMXCI6aSgpLGEucHVzaChbZVswXSxlWzFdXSk7YnJlYWs7Y2FzZVwiQ1wiOmlmKCFyLmxlbmd0aCl7Y29uc3QgdD1hLmxlbmd0aD9hW2EubGVuZ3RoLTFdOmg7ci5wdXNoKFt0WzBdLHRbMV1dKX1yLnB1c2goW2VbMF0sZVsxXV0pLHIucHVzaChbZVsyXSxlWzNdXSksci5wdXNoKFtlWzRdLGVbNV1dKTticmVhaztjYXNlXCJaXCI6aSgpLGEucHVzaChbaFswXSxoWzFdXSl9aWYoYygpLCFzKXJldHVybiBvO2NvbnN0IGw9W107Zm9yKGNvbnN0IHQgb2Ygbyl7Y29uc3QgZT1VKHQscyk7ZS5sZW5ndGgmJmwucHVzaChlKX1yZXR1cm4gbH0odCwxLGg/NC00KihzLnNpbXBsaWZpY2F0aW9ufHwxKTooMStzLnJvdWdobmVzcykvMiksaT1fKHQscyk7aWYobylpZihcInNvbGlkXCI9PT1zLmZpbGxTdHlsZSlpZigxPT09ci5sZW5ndGgpe2NvbnN0IGU9Xyh0LE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSxzKSx7ZGlzYWJsZU11bHRpU3Ryb2tlOiEwLHJvdWdobmVzczpzLnJvdWdobmVzcz9zLnJvdWdobmVzcytzLmZpbGxTaGFwZVJvdWdobmVzc0dhaW46MH0pKTtuLnB1c2goe3R5cGU6XCJmaWxsUGF0aFwiLG9wczp0aGlzLl9tZXJnZWRTaGFwZShlLm9wcyl9KX1lbHNlIG4ucHVzaChJKHIscykpO2Vsc2Ugbi5wdXNoKEMocixzKSk7cmV0dXJuIGEmJihoP3IuZm9yRWFjaCgodD0+e24ucHVzaChTKHQsITEscykpfSkpOm4ucHVzaChpKSksdGhpcy5fZChcInBhdGhcIixuLHMpfW9wc1RvUGF0aCh0LGUpe2xldCBzPVwiXCI7Zm9yKGNvbnN0IG4gb2YgdC5vcHMpe2NvbnN0IHQ9XCJudW1iZXJcIj09dHlwZW9mIGUmJmU+PTA/bi5kYXRhLm1hcCgodD0+K3QudG9GaXhlZChlKSkpOm4uZGF0YTtzd2l0Y2gobi5vcCl7Y2FzZVwibW92ZVwiOnMrPWBNJHt0WzBdfSAke3RbMV19IGA7YnJlYWs7Y2FzZVwiYmN1cnZlVG9cIjpzKz1gQyR7dFswXX0gJHt0WzFdfSwgJHt0WzJdfSAke3RbM119LCAke3RbNF19ICR7dFs1XX0gYDticmVhaztjYXNlXCJsaW5lVG9cIjpzKz1gTCR7dFswXX0gJHt0WzFdfSBgfX1yZXR1cm4gcy50cmltKCl9dG9QYXRocyh0KXtjb25zdCBlPXQuc2V0c3x8W10scz10Lm9wdGlvbnN8fHRoaXMuZGVmYXVsdE9wdGlvbnMsbj1bXTtmb3IoY29uc3QgdCBvZiBlKXtsZXQgZT1udWxsO3N3aXRjaCh0LnR5cGUpe2Nhc2VcInBhdGhcIjplPXtkOnRoaXMub3BzVG9QYXRoKHQpLHN0cm9rZTpzLnN0cm9rZSxzdHJva2VXaWR0aDpzLnN0cm9rZVdpZHRoLGZpbGw6dHR9O2JyZWFrO2Nhc2VcImZpbGxQYXRoXCI6ZT17ZDp0aGlzLm9wc1RvUGF0aCh0KSxzdHJva2U6dHQsc3Ryb2tlV2lkdGg6MCxmaWxsOnMuZmlsbHx8dHR9O2JyZWFrO2Nhc2VcImZpbGxTa2V0Y2hcIjplPXRoaXMuZmlsbFNrZXRjaCh0LHMpfWUmJm4ucHVzaChlKX1yZXR1cm4gbn1maWxsU2tldGNoKHQsZSl7bGV0IHM9ZS5maWxsV2VpZ2h0O3JldHVybiBzPDAmJihzPWUuc3Ryb2tlV2lkdGgvMikse2Q6dGhpcy5vcHNUb1BhdGgodCksc3Ryb2tlOmUuZmlsbHx8dHQsc3Ryb2tlV2lkdGg6cyxmaWxsOnR0fX1fbWVyZ2VkU2hhcGUodCl7cmV0dXJuIHQuZmlsdGVyKCgodCxlKT0+MD09PWV8fFwibW92ZVwiIT09dC5vcCkpfX1jbGFzcyBzdHtjb25zdHJ1Y3Rvcih0LGUpe3RoaXMuY2FudmFzPXQsdGhpcy5jdHg9dGhpcy5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpLHRoaXMuZ2VuPW5ldyBldChlKX1kcmF3KHQpe2NvbnN0IGU9dC5zZXRzfHxbXSxzPXQub3B0aW9uc3x8dGhpcy5nZXREZWZhdWx0T3B0aW9ucygpLG49dGhpcy5jdHgsbz10Lm9wdGlvbnMuZml4ZWREZWNpbWFsUGxhY2VEaWdpdHM7Zm9yKGNvbnN0IGEgb2YgZSlzd2l0Y2goYS50eXBlKXtjYXNlXCJwYXRoXCI6bi5zYXZlKCksbi5zdHJva2VTdHlsZT1cIm5vbmVcIj09PXMuc3Ryb2tlP1widHJhbnNwYXJlbnRcIjpzLnN0cm9rZSxuLmxpbmVXaWR0aD1zLnN0cm9rZVdpZHRoLHMuc3Ryb2tlTGluZURhc2gmJm4uc2V0TGluZURhc2gocy5zdHJva2VMaW5lRGFzaCkscy5zdHJva2VMaW5lRGFzaE9mZnNldCYmKG4ubGluZURhc2hPZmZzZXQ9cy5zdHJva2VMaW5lRGFzaE9mZnNldCksdGhpcy5fZHJhd1RvQ29udGV4dChuLGEsbyksbi5yZXN0b3JlKCk7YnJlYWs7Y2FzZVwiZmlsbFBhdGhcIjp7bi5zYXZlKCksbi5maWxsU3R5bGU9cy5maWxsfHxcIlwiO2NvbnN0IGU9XCJjdXJ2ZVwiPT09dC5zaGFwZXx8XCJwb2x5Z29uXCI9PT10LnNoYXBlfHxcInBhdGhcIj09PXQuc2hhcGU/XCJldmVub2RkXCI6XCJub256ZXJvXCI7dGhpcy5fZHJhd1RvQ29udGV4dChuLGEsbyxlKSxuLnJlc3RvcmUoKTticmVha31jYXNlXCJmaWxsU2tldGNoXCI6dGhpcy5maWxsU2tldGNoKG4sYSxzKX19ZmlsbFNrZXRjaCh0LGUscyl7bGV0IG49cy5maWxsV2VpZ2h0O248MCYmKG49cy5zdHJva2VXaWR0aC8yKSx0LnNhdmUoKSxzLmZpbGxMaW5lRGFzaCYmdC5zZXRMaW5lRGFzaChzLmZpbGxMaW5lRGFzaCkscy5maWxsTGluZURhc2hPZmZzZXQmJih0LmxpbmVEYXNoT2Zmc2V0PXMuZmlsbExpbmVEYXNoT2Zmc2V0KSx0LnN0cm9rZVN0eWxlPXMuZmlsbHx8XCJcIix0LmxpbmVXaWR0aD1uLHRoaXMuX2RyYXdUb0NvbnRleHQodCxlLHMuZml4ZWREZWNpbWFsUGxhY2VEaWdpdHMpLHQucmVzdG9yZSgpfV9kcmF3VG9Db250ZXh0KHQsZSxzLG49XCJub256ZXJvXCIpe3QuYmVnaW5QYXRoKCk7Zm9yKGNvbnN0IG4gb2YgZS5vcHMpe2NvbnN0IGU9XCJudW1iZXJcIj09dHlwZW9mIHMmJnM+PTA/bi5kYXRhLm1hcCgodD0+K3QudG9GaXhlZChzKSkpOm4uZGF0YTtzd2l0Y2gobi5vcCl7Y2FzZVwibW92ZVwiOnQubW92ZVRvKGVbMF0sZVsxXSk7YnJlYWs7Y2FzZVwiYmN1cnZlVG9cIjp0LmJlemllckN1cnZlVG8oZVswXSxlWzFdLGVbMl0sZVszXSxlWzRdLGVbNV0pO2JyZWFrO2Nhc2VcImxpbmVUb1wiOnQubGluZVRvKGVbMF0sZVsxXSl9fVwiZmlsbFBhdGhcIj09PWUudHlwZT90LmZpbGwobik6dC5zdHJva2UoKX1nZXQgZ2VuZXJhdG9yKCl7cmV0dXJuIHRoaXMuZ2VufWdldERlZmF1bHRPcHRpb25zKCl7cmV0dXJuIHRoaXMuZ2VuLmRlZmF1bHRPcHRpb25zfWxpbmUodCxlLHMsbixvKXtjb25zdCBhPXRoaXMuZ2VuLmxpbmUodCxlLHMsbixvKTtyZXR1cm4gdGhpcy5kcmF3KGEpLGF9cmVjdGFuZ2xlKHQsZSxzLG4sbyl7Y29uc3QgYT10aGlzLmdlbi5yZWN0YW5nbGUodCxlLHMsbixvKTtyZXR1cm4gdGhpcy5kcmF3KGEpLGF9ZWxsaXBzZSh0LGUscyxuLG8pe2NvbnN0IGE9dGhpcy5nZW4uZWxsaXBzZSh0LGUscyxuLG8pO3JldHVybiB0aGlzLmRyYXcoYSksYX1jaXJjbGUodCxlLHMsbil7Y29uc3Qgbz10aGlzLmdlbi5jaXJjbGUodCxlLHMsbik7cmV0dXJuIHRoaXMuZHJhdyhvKSxvfWxpbmVhclBhdGgodCxlKXtjb25zdCBzPXRoaXMuZ2VuLmxpbmVhclBhdGgodCxlKTtyZXR1cm4gdGhpcy5kcmF3KHMpLHN9cG9seWdvbih0LGUpe2NvbnN0IHM9dGhpcy5nZW4ucG9seWdvbih0LGUpO3JldHVybiB0aGlzLmRyYXcocyksc31hcmModCxlLHMsbixvLGEsaD0hMSxyKXtjb25zdCBpPXRoaXMuZ2VuLmFyYyh0LGUscyxuLG8sYSxoLHIpO3JldHVybiB0aGlzLmRyYXcoaSksaX1jdXJ2ZSh0LGUpe2NvbnN0IHM9dGhpcy5nZW4uY3VydmUodCxlKTtyZXR1cm4gdGhpcy5kcmF3KHMpLHN9cGF0aCh0LGUpe2NvbnN0IHM9dGhpcy5nZW4ucGF0aCh0LGUpO3JldHVybiB0aGlzLmRyYXcocyksc319Y29uc3QgbnQ9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiO2NsYXNzIG90e2NvbnN0cnVjdG9yKHQsZSl7dGhpcy5zdmc9dCx0aGlzLmdlbj1uZXcgZXQoZSl9ZHJhdyh0KXtjb25zdCBlPXQuc2V0c3x8W10scz10Lm9wdGlvbnN8fHRoaXMuZ2V0RGVmYXVsdE9wdGlvbnMoKSxuPXRoaXMuc3ZnLm93bmVyRG9jdW1lbnR8fHdpbmRvdy5kb2N1bWVudCxvPW4uY3JlYXRlRWxlbWVudE5TKG50LFwiZ1wiKSxhPXQub3B0aW9ucy5maXhlZERlY2ltYWxQbGFjZURpZ2l0cztmb3IoY29uc3QgaCBvZiBlKXtsZXQgZT1udWxsO3N3aXRjaChoLnR5cGUpe2Nhc2VcInBhdGhcIjplPW4uY3JlYXRlRWxlbWVudE5TKG50LFwicGF0aFwiKSxlLnNldEF0dHJpYnV0ZShcImRcIix0aGlzLm9wc1RvUGF0aChoLGEpKSxlLnNldEF0dHJpYnV0ZShcInN0cm9rZVwiLHMuc3Ryb2tlKSxlLnNldEF0dHJpYnV0ZShcInN0cm9rZS13aWR0aFwiLHMuc3Ryb2tlV2lkdGgrXCJcIiksZS5zZXRBdHRyaWJ1dGUoXCJmaWxsXCIsXCJub25lXCIpLHMuc3Ryb2tlTGluZURhc2gmJmUuc2V0QXR0cmlidXRlKFwic3Ryb2tlLWRhc2hhcnJheVwiLHMuc3Ryb2tlTGluZURhc2guam9pbihcIiBcIikudHJpbSgpKSxzLnN0cm9rZUxpbmVEYXNoT2Zmc2V0JiZlLnNldEF0dHJpYnV0ZShcInN0cm9rZS1kYXNob2Zmc2V0XCIsYCR7cy5zdHJva2VMaW5lRGFzaE9mZnNldH1gKTticmVhaztjYXNlXCJmaWxsUGF0aFwiOmU9bi5jcmVhdGVFbGVtZW50TlMobnQsXCJwYXRoXCIpLGUuc2V0QXR0cmlidXRlKFwiZFwiLHRoaXMub3BzVG9QYXRoKGgsYSkpLGUuc2V0QXR0cmlidXRlKFwic3Ryb2tlXCIsXCJub25lXCIpLGUuc2V0QXR0cmlidXRlKFwic3Ryb2tlLXdpZHRoXCIsXCIwXCIpLGUuc2V0QXR0cmlidXRlKFwiZmlsbFwiLHMuZmlsbHx8XCJcIiksXCJjdXJ2ZVwiIT09dC5zaGFwZSYmXCJwb2x5Z29uXCIhPT10LnNoYXBlfHxlLnNldEF0dHJpYnV0ZShcImZpbGwtcnVsZVwiLFwiZXZlbm9kZFwiKTticmVhaztjYXNlXCJmaWxsU2tldGNoXCI6ZT10aGlzLmZpbGxTa2V0Y2gobixoLHMpfWUmJm8uYXBwZW5kQ2hpbGQoZSl9cmV0dXJuIG99ZmlsbFNrZXRjaCh0LGUscyl7bGV0IG49cy5maWxsV2VpZ2h0O248MCYmKG49cy5zdHJva2VXaWR0aC8yKTtjb25zdCBvPXQuY3JlYXRlRWxlbWVudE5TKG50LFwicGF0aFwiKTtyZXR1cm4gby5zZXRBdHRyaWJ1dGUoXCJkXCIsdGhpcy5vcHNUb1BhdGgoZSxzLmZpeGVkRGVjaW1hbFBsYWNlRGlnaXRzKSksby5zZXRBdHRyaWJ1dGUoXCJzdHJva2VcIixzLmZpbGx8fFwiXCIpLG8uc2V0QXR0cmlidXRlKFwic3Ryb2tlLXdpZHRoXCIsbitcIlwiKSxvLnNldEF0dHJpYnV0ZShcImZpbGxcIixcIm5vbmVcIikscy5maWxsTGluZURhc2gmJm8uc2V0QXR0cmlidXRlKFwic3Ryb2tlLWRhc2hhcnJheVwiLHMuZmlsbExpbmVEYXNoLmpvaW4oXCIgXCIpLnRyaW0oKSkscy5maWxsTGluZURhc2hPZmZzZXQmJm8uc2V0QXR0cmlidXRlKFwic3Ryb2tlLWRhc2hvZmZzZXRcIixgJHtzLmZpbGxMaW5lRGFzaE9mZnNldH1gKSxvfWdldCBnZW5lcmF0b3IoKXtyZXR1cm4gdGhpcy5nZW59Z2V0RGVmYXVsdE9wdGlvbnMoKXtyZXR1cm4gdGhpcy5nZW4uZGVmYXVsdE9wdGlvbnN9b3BzVG9QYXRoKHQsZSl7cmV0dXJuIHRoaXMuZ2VuLm9wc1RvUGF0aCh0LGUpfWxpbmUodCxlLHMsbixvKXtjb25zdCBhPXRoaXMuZ2VuLmxpbmUodCxlLHMsbixvKTtyZXR1cm4gdGhpcy5kcmF3KGEpfXJlY3RhbmdsZSh0LGUscyxuLG8pe2NvbnN0IGE9dGhpcy5nZW4ucmVjdGFuZ2xlKHQsZSxzLG4sbyk7cmV0dXJuIHRoaXMuZHJhdyhhKX1lbGxpcHNlKHQsZSxzLG4sbyl7Y29uc3QgYT10aGlzLmdlbi5lbGxpcHNlKHQsZSxzLG4sbyk7cmV0dXJuIHRoaXMuZHJhdyhhKX1jaXJjbGUodCxlLHMsbil7Y29uc3Qgbz10aGlzLmdlbi5jaXJjbGUodCxlLHMsbik7cmV0dXJuIHRoaXMuZHJhdyhvKX1saW5lYXJQYXRoKHQsZSl7Y29uc3Qgcz10aGlzLmdlbi5saW5lYXJQYXRoKHQsZSk7cmV0dXJuIHRoaXMuZHJhdyhzKX1wb2x5Z29uKHQsZSl7Y29uc3Qgcz10aGlzLmdlbi5wb2x5Z29uKHQsZSk7cmV0dXJuIHRoaXMuZHJhdyhzKX1hcmModCxlLHMsbixvLGEsaD0hMSxyKXtjb25zdCBpPXRoaXMuZ2VuLmFyYyh0LGUscyxuLG8sYSxoLHIpO3JldHVybiB0aGlzLmRyYXcoaSl9Y3VydmUodCxlKXtjb25zdCBzPXRoaXMuZ2VuLmN1cnZlKHQsZSk7cmV0dXJuIHRoaXMuZHJhdyhzKX1wYXRoKHQsZSl7Y29uc3Qgcz10aGlzLmdlbi5wYXRoKHQsZSk7cmV0dXJuIHRoaXMuZHJhdyhzKX19dmFyIGF0PXtjYW52YXM6KHQsZSk9Pm5ldyBzdCh0LGUpLHN2ZzoodCxlKT0+bmV3IG90KHQsZSksZ2VuZXJhdG9yOnQ9Pm5ldyBldCh0KSxuZXdTZWVkOigpPT5ldC5uZXdTZWVkKCl9O2V4cG9ydHthdCBhcyBkZWZhdWx0fTtcbiIKICBdLAogICJtYXBwaW5ncyI6ICI7QUFBQSxTQUFTLENBQUMsQ0FBQyxJQUFFLEdBQUUsR0FBRTtBQUFBLEVBQUMsSUFBRyxNQUFHLEdBQUUsUUFBTztBQUFBLElBQUMsT0FBTSxHQUFFLEtBQUcsR0FBRSxJQUFFLEtBQUssS0FBRyxNQUFJLEdBQUUsSUFBRSxLQUFLLElBQUksQ0FBQyxHQUFFLElBQUUsS0FBSyxJQUFJLENBQUM7QUFBQSxJQUFFLFdBQVUsTUFBSyxJQUFFO0FBQUEsTUFBQyxPQUFNLElBQUUsTUFBRztBQUFBLE1BQUUsR0FBRSxNQUFJLEtBQUUsS0FBRyxLQUFHLEtBQUUsS0FBRyxJQUFFLEdBQUUsR0FBRSxNQUFJLEtBQUUsS0FBRyxLQUFHLEtBQUUsS0FBRyxJQUFFO0FBQUEsSUFBQztBQUFBLEVBQUM7QUFBQTtBQUFFLFNBQVMsQ0FBQyxDQUFDLElBQUUsSUFBRTtBQUFBLEVBQUMsT0FBTyxHQUFFLE9BQUssR0FBRSxNQUFJLEdBQUUsT0FBSyxHQUFFO0FBQUE7QUFBRyxTQUFTLENBQUMsQ0FBQyxJQUFFLEdBQUUsR0FBRSxJQUFFLEdBQUU7QUFBQSxFQUFDLE1BQU0sSUFBRSxHQUFFLElBQUUsS0FBSyxJQUFJLEdBQUUsR0FBRSxHQUFFLElBQUUsR0FBRSxNQUFJLEdBQUUsR0FBRyxNQUFjLE9BQU8sR0FBRSxHQUFHLE1BQXRCLFdBQXlCLENBQUMsRUFBQyxJQUFFLElBQUUsSUFBRSxDQUFDLEdBQUUsQ0FBQztBQUFBLEVBQUUsSUFBRztBQUFBLElBQUUsV0FBVSxNQUFLO0FBQUEsTUFBRSxFQUFFLElBQUUsR0FBRSxDQUFDO0FBQUEsRUFBRSxNQUFNLElBQUUsUUFBUSxDQUFDLElBQUUsSUFBRSxJQUFFO0FBQUEsSUFBQyxNQUFNLEtBQUUsQ0FBQztBQUFBLElBQUUsV0FBVSxNQUFLLElBQUU7QUFBQSxNQUFDLE1BQU0sS0FBRSxDQUFDLEdBQUcsRUFBQztBQUFBLE1BQUUsRUFBRSxHQUFFLElBQUcsR0FBRSxHQUFFLFNBQU8sRUFBRSxLQUFHLEdBQUUsS0FBSyxDQUFDLEdBQUUsR0FBRyxJQUFHLEdBQUUsR0FBRyxFQUFFLENBQUMsR0FBRSxHQUFFLFNBQU8sS0FBRyxHQUFFLEtBQUssRUFBQztBQUFBLElBQUM7QUFBQSxJQUFDLE1BQU0sS0FBRSxDQUFDO0FBQUEsSUFBRSxLQUFFLEtBQUssSUFBSSxJQUFFLEdBQUU7QUFBQSxJQUFFLE1BQU0sS0FBRSxDQUFDO0FBQUEsSUFBRSxXQUFVLE1BQUs7QUFBQSxNQUFFLFNBQVEsS0FBRSxFQUFFLEtBQUUsR0FBRSxTQUFPLEdBQUUsTUFBSTtBQUFBLFFBQUMsTUFBTSxLQUFFLEdBQUUsS0FBRyxLQUFFLEdBQUUsS0FBRTtBQUFBLFFBQUcsSUFBRyxHQUFFLE9BQUssR0FBRSxJQUFHO0FBQUEsVUFBQyxNQUFNLEtBQUUsS0FBSyxJQUFJLEdBQUUsSUFBRyxHQUFFLEVBQUU7QUFBQSxVQUFFLEdBQUUsS0FBSyxFQUFDLE1BQUssSUFBRSxNQUFLLEtBQUssSUFBSSxHQUFFLElBQUcsR0FBRSxFQUFFLEdBQUUsR0FBRSxPQUFJLEdBQUUsS0FBRyxHQUFFLEtBQUcsR0FBRSxJQUFHLFNBQVEsR0FBRSxLQUFHLEdBQUUsT0FBSyxHQUFFLEtBQUcsR0FBRSxJQUFHLENBQUM7QUFBQSxRQUFDO0FBQUEsTUFBQztBQUFBLElBQUMsSUFBRyxHQUFFLEtBQU0sQ0FBQyxJQUFFLE9BQUksR0FBRSxPQUFLLEdBQUUsT0FBSyxLQUFHLEdBQUUsT0FBSyxHQUFFLE9BQUssSUFBRSxHQUFFLElBQUUsR0FBRSxJQUFFLEtBQUcsR0FBRSxJQUFFLEdBQUUsSUFBRSxJQUFFLEdBQUUsU0FBTyxHQUFFLE9BQUssS0FBRyxHQUFFLE9BQUssR0FBRSxRQUFNLEtBQUssSUFBSSxHQUFFLE9BQUssR0FBRSxJQUFJLENBQUUsR0FBRSxDQUFDLEdBQUU7QUFBQSxNQUFPLE9BQU87QUFBQSxJQUFFLElBQUksS0FBRSxDQUFDLEdBQUUsS0FBRSxHQUFFLEdBQUcsTUFBSyxLQUFFO0FBQUEsSUFBRSxNQUFLLEdBQUUsVUFBUSxHQUFFLFVBQVE7QUFBQSxNQUFDLElBQUcsR0FBRSxRQUFPO0FBQUEsUUFBQyxJQUFJLEtBQUU7QUFBQSxRQUFHLFNBQVEsS0FBRSxFQUFFLEtBQUUsR0FBRSxVQUFRLEVBQUUsR0FBRSxJQUFHLE9BQUssS0FBRztBQUFBLFVBQUksS0FBRTtBQUFBLFFBQUUsR0FBRSxPQUFPLEdBQUUsS0FBRSxDQUFDLEVBQUUsUUFBUyxRQUFHO0FBQUEsVUFBQyxHQUFFLEtBQUssRUFBQyxHQUFFLElBQUUsTUFBSyxHQUFDLENBQUM7QUFBQSxTQUFHO0FBQUEsTUFBQztBQUFBLE1BQUMsSUFBRyxLQUFFLEdBQUUsT0FBUSxRQUFHLEVBQUUsR0FBRSxLQUFLLFFBQU0sR0FBRyxHQUFFLEdBQUUsS0FBTSxDQUFDLElBQUUsT0FBSSxHQUFFLEtBQUssTUFBSSxHQUFFLEtBQUssSUFBRSxLQUFHLEdBQUUsS0FBSyxJQUFFLEdBQUUsS0FBSyxLQUFHLEtBQUssSUFBSSxHQUFFLEtBQUssSUFBRSxHQUFFLEtBQUssQ0FBQyxDQUFFLElBQU8sT0FBSixLQUFPLEtBQUUsTUFBRyxNQUFJLEdBQUUsU0FBTztBQUFBLFFBQUUsU0FBUSxLQUFFLEVBQUUsS0FBRSxHQUFFLFFBQU8sTUFBRyxHQUFFO0FBQUEsVUFBQyxNQUFNLEtBQUUsS0FBRTtBQUFBLFVBQUUsSUFBRyxNQUFHLEdBQUU7QUFBQSxZQUFPO0FBQUEsVUFBTSxNQUFNLEtBQUUsR0FBRSxJQUFHLE1BQUssS0FBRSxHQUFFLElBQUc7QUFBQSxVQUFLLEdBQUUsS0FBSyxDQUFDLENBQUMsS0FBSyxNQUFNLEdBQUUsQ0FBQyxHQUFFLEVBQUMsR0FBRSxDQUFDLEtBQUssTUFBTSxHQUFFLENBQUMsR0FBRSxFQUFDLENBQUMsQ0FBQztBQUFBLFFBQUM7QUFBQSxNQUFDLE1BQUcsSUFBRSxHQUFFLFFBQVMsUUFBRztBQUFBLFFBQUMsR0FBRSxLQUFLLElBQUUsR0FBRSxLQUFLLElBQUUsS0FBRSxHQUFFLEtBQUs7QUFBQSxPQUFRLEdBQUU7QUFBQSxJQUFHO0FBQUEsSUFBQyxPQUFPO0FBQUEsSUFBRyxHQUFFLEdBQUUsQ0FBQztBQUFBLEVBQUUsSUFBRyxHQUFFO0FBQUEsSUFBQyxXQUFVLE1BQUs7QUFBQSxNQUFFLEVBQUUsSUFBRSxHQUFFLENBQUMsQ0FBQztBQUFBLEtBQUcsUUFBUSxDQUFDLElBQUUsSUFBRSxJQUFFO0FBQUEsTUFBQyxNQUFNLEtBQUUsQ0FBQztBQUFBLE1BQUUsR0FBRSxRQUFTLFFBQUcsR0FBRSxLQUFLLEdBQUcsRUFBQyxDQUFFLEdBQUUsRUFBRSxJQUFFLElBQUUsRUFBQztBQUFBLE9BQUcsR0FBRSxHQUFFLENBQUMsQ0FBQztBQUFBLEVBQUM7QUFBQSxFQUFDLE9BQU87QUFBQTtBQUFFLFNBQVMsQ0FBQyxDQUFDLElBQUUsSUFBRTtBQUFBLEVBQUMsSUFBSTtBQUFBLEVBQUUsTUFBTSxJQUFFLEdBQUUsZUFBYTtBQUFBLEVBQUcsSUFBSSxJQUFFLEdBQUU7QUFBQSxFQUFXLElBQUUsTUFBSSxJQUFFLElBQUUsR0FBRSxjQUFhLElBQUUsS0FBSyxNQUFNLEtBQUssSUFBSSxHQUFFLEdBQUUsQ0FBQztBQUFBLEVBQUUsSUFBSSxJQUFFO0FBQUEsRUFBRSxPQUFPLEdBQUUsYUFBVyxRQUFhLEtBQUUsR0FBRSxnQkFBWixRQUFrQyxPQUFKLFlBQVcsWUFBRSxHQUFFLEtBQUssTUFBSSxLQUFLLE9BQU8sS0FBRyxRQUFLLElBQUUsSUFBRyxFQUFFLElBQUUsR0FBRSxHQUFFLEtBQUcsQ0FBQztBQUFBO0FBQUE7QUFBRSxNQUFNLEVBQUM7QUFBQSxFQUFDLFdBQVcsQ0FBQyxJQUFFO0FBQUEsSUFBQyxLQUFLLFNBQU87QUFBQTtBQUFBLEVBQUUsWUFBWSxDQUFDLElBQUUsSUFBRTtBQUFBLElBQUMsT0FBTyxLQUFLLGNBQWMsSUFBRSxFQUFDO0FBQUE7QUFBQSxFQUFFLGFBQWEsQ0FBQyxJQUFFLElBQUU7QUFBQSxJQUFDLE1BQU0sS0FBRSxFQUFFLElBQUUsRUFBQztBQUFBLElBQUUsT0FBTSxFQUFDLE1BQUssY0FBYSxLQUFJLEtBQUssWUFBWSxJQUFFLEVBQUMsRUFBQztBQUFBO0FBQUEsRUFBRSxXQUFXLENBQUMsSUFBRSxJQUFFO0FBQUEsSUFBQyxNQUFNLEtBQUUsQ0FBQztBQUFBLElBQUUsV0FBVSxNQUFLO0FBQUEsTUFBRSxHQUFFLEtBQUssR0FBRyxLQUFLLE9BQU8sY0FBYyxHQUFFLEdBQUcsSUFBRyxHQUFFLEdBQUcsSUFBRyxHQUFFLEdBQUcsSUFBRyxHQUFFLEdBQUcsSUFBRyxFQUFDLENBQUM7QUFBQSxJQUFFLE9BQU87QUFBQTtBQUFFO0FBQUMsU0FBUyxDQUFDLENBQUMsSUFBRTtBQUFBLEVBQUMsTUFBTSxLQUFFLEdBQUUsSUFBRyxLQUFFLEdBQUU7QUFBQSxFQUFHLE9BQU8sS0FBSyxLQUFLLEtBQUssSUFBSSxHQUFFLEtBQUcsR0FBRSxJQUFHLENBQUMsSUFBRSxLQUFLLElBQUksR0FBRSxLQUFHLEdBQUUsSUFBRyxDQUFDLENBQUM7QUFBQTtBQUFBO0FBQUUsTUFBTSxVQUFVLEVBQUM7QUFBQSxFQUFDLFlBQVksQ0FBQyxJQUFFLElBQUU7QUFBQSxJQUFDLElBQUksS0FBRSxHQUFFO0FBQUEsSUFBVyxLQUFFLE1BQUksS0FBRSxJQUFFLEdBQUUsY0FBYSxLQUFFLEtBQUssSUFBSSxJQUFFLEdBQUU7QUFBQSxJQUFFLE1BQU0sS0FBRSxFQUFFLElBQUUsT0FBTyxPQUFPLENBQUMsR0FBRSxJQUFFLEVBQUMsWUFBVyxHQUFDLENBQUMsQ0FBQyxHQUFFLEtBQUUsS0FBSyxLQUFHLE1BQUksR0FBRSxjQUFhLElBQUUsQ0FBQyxHQUFFLElBQUUsTUFBRyxLQUFFLEtBQUssSUFBSSxFQUFDLEdBQUUsSUFBRSxNQUFHLEtBQUUsS0FBSyxJQUFJLEVBQUM7QUFBQSxJQUFFLFlBQVUsSUFBRSxPQUFLO0FBQUEsTUFBRSxFQUFFLENBQUMsSUFBRSxFQUFDLENBQUMsS0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUUsS0FBRyxHQUFFLEdBQUUsS0FBRyxDQUFDLEdBQUUsQ0FBQyxHQUFHLEVBQUMsQ0FBQyxHQUFFLENBQUMsQ0FBQyxHQUFFLEtBQUcsR0FBRSxHQUFFLEtBQUcsQ0FBQyxHQUFFLENBQUMsR0FBRyxFQUFDLENBQUMsQ0FBQztBQUFBLElBQUUsT0FBTSxFQUFDLE1BQUssY0FBYSxLQUFJLEtBQUssWUFBWSxHQUFFLEVBQUMsRUFBQztBQUFBO0FBQUU7QUFBQTtBQUFDLE1BQU0sVUFBVSxFQUFDO0FBQUEsRUFBQyxZQUFZLENBQUMsSUFBRSxJQUFFO0FBQUEsSUFBQyxNQUFNLEtBQUUsS0FBSyxjQUFjLElBQUUsRUFBQyxHQUFFLEtBQUUsT0FBTyxPQUFPLENBQUMsR0FBRSxJQUFFLEVBQUMsY0FBYSxHQUFFLGVBQWEsR0FBRSxDQUFDLEdBQUUsS0FBRSxLQUFLLGNBQWMsSUFBRSxFQUFDO0FBQUEsSUFBRSxPQUFPLEdBQUUsTUFBSSxHQUFFLElBQUksT0FBTyxHQUFFLEdBQUcsR0FBRTtBQUFBO0FBQUU7QUFBQTtBQUFDLE1BQU0sRUFBQztBQUFBLEVBQUMsV0FBVyxDQUFDLElBQUU7QUFBQSxJQUFDLEtBQUssU0FBTztBQUFBO0FBQUEsRUFBRSxZQUFZLENBQUMsSUFBRSxJQUFFO0FBQUEsSUFBQyxNQUFNLEtBQUUsRUFBRSxJQUFFLEtBQUUsT0FBTyxPQUFPLENBQUMsR0FBRSxJQUFFLEVBQUMsY0FBYSxFQUFDLENBQUMsQ0FBQztBQUFBLElBQUUsT0FBTyxLQUFLLFlBQVksSUFBRSxFQUFDO0FBQUE7QUFBQSxFQUFFLFdBQVcsQ0FBQyxJQUFFLElBQUU7QUFBQSxJQUFDLE1BQU0sS0FBRSxDQUFDO0FBQUEsSUFBRSxJQUFJLEtBQUUsR0FBRTtBQUFBLElBQVcsS0FBRSxNQUFJLEtBQUUsSUFBRSxHQUFFLGNBQWEsS0FBRSxLQUFLLElBQUksSUFBRSxHQUFFO0FBQUEsSUFBRSxJQUFJLEtBQUUsR0FBRTtBQUFBLElBQVcsS0FBRSxNQUFJLEtBQUUsR0FBRSxjQUFZO0FBQUEsSUFBRyxNQUFNLEtBQUUsS0FBRTtBQUFBLElBQUUsV0FBVSxNQUFLLElBQUU7QUFBQSxNQUFDLE1BQU0sS0FBRSxFQUFFLEVBQUMsR0FBRSxLQUFFLEtBQUUsSUFBRSxJQUFFLEtBQUssS0FBSyxFQUFDLElBQUUsR0FBRSxJQUFFLEtBQUUsSUFBRSxJQUFFLEtBQUcsR0FBRSxHQUFHLEtBQUcsR0FBRSxHQUFHLE1BQUksSUFBRSxLQUFFLEdBQUUsSUFBRSxLQUFLLElBQUksR0FBRSxHQUFHLElBQUcsR0FBRSxHQUFHLEVBQUU7QUFBQSxNQUFFLFNBQVEsS0FBRSxFQUFFLEtBQUUsR0FBRSxNQUFJO0FBQUEsUUFBQyxNQUFNLEtBQUUsSUFBRSxJQUFFLEtBQUUsSUFBRSxLQUFFLElBQUUsS0FBRSxJQUFFLEtBQUssT0FBTyxJQUFFLElBQUUsS0FBRSxLQUFFLEtBQUUsSUFBRSxLQUFLLE9BQU8sSUFBRSxJQUFFLEtBQUUsS0FBSyxPQUFPLFFBQVEsSUFBRSxJQUFFLElBQUUsSUFBRSxFQUFDO0FBQUEsUUFBRSxHQUFFLEtBQUssR0FBRyxHQUFFLEdBQUc7QUFBQSxNQUFDO0FBQUEsSUFBQztBQUFBLElBQUMsT0FBTSxFQUFDLE1BQUssY0FBYSxLQUFJLEdBQUM7QUFBQTtBQUFFO0FBQUE7QUFBQyxNQUFNLEVBQUM7QUFBQSxFQUFDLFdBQVcsQ0FBQyxJQUFFO0FBQUEsSUFBQyxLQUFLLFNBQU87QUFBQTtBQUFBLEVBQUUsWUFBWSxDQUFDLElBQUUsSUFBRTtBQUFBLElBQUMsTUFBTSxLQUFFLEVBQUUsSUFBRSxFQUFDO0FBQUEsSUFBRSxPQUFNLEVBQUMsTUFBSyxjQUFhLEtBQUksS0FBSyxXQUFXLElBQUUsRUFBQyxFQUFDO0FBQUE7QUFBQSxFQUFFLFVBQVUsQ0FBQyxJQUFFLElBQUU7QUFBQSxJQUFDLE1BQU0sS0FBRSxHQUFFLGFBQVcsSUFBRSxHQUFFLGFBQVcsSUFBRSxJQUFFLEdBQUUsY0FBWSxHQUFFLGFBQVcsR0FBRSxZQUFXLEtBQUUsR0FBRSxVQUFRLElBQUUsR0FBRSxhQUFXLElBQUUsSUFBRSxHQUFFLGNBQVksR0FBRSxhQUFXLEdBQUUsU0FBUSxLQUFFLENBQUM7QUFBQSxJQUFFLE9BQU8sR0FBRSxRQUFTLFFBQUc7QUFBQSxNQUFDLE1BQU0sS0FBRSxFQUFFLEVBQUMsR0FBRSxLQUFFLEtBQUssTUFBTSxNQUFHLEtBQUUsR0FBRSxHQUFFLE1BQUcsS0FBRSxLQUFFLE1BQUcsS0FBRSxPQUFJO0FBQUEsTUFBRSxJQUFJLEtBQUUsR0FBRSxJQUFHLElBQUUsR0FBRTtBQUFBLE1BQUcsR0FBRSxLQUFHLEVBQUUsT0FBSyxLQUFFLEdBQUUsSUFBRyxJQUFFLEdBQUU7QUFBQSxNQUFJLE1BQU0sSUFBRSxLQUFLLE1BQU0sRUFBRSxLQUFHLEdBQUUsT0FBSyxFQUFFLEtBQUcsR0FBRSxHQUFHO0FBQUEsTUFBRSxTQUFRLEtBQUUsRUFBRSxLQUFFLElBQUUsTUFBSTtBQUFBLFFBQUMsTUFBTSxLQUFFLE1BQUcsS0FBRSxLQUFHLEtBQUUsS0FBRSxJQUFFLEtBQUUsQ0FBQyxHQUFFLEtBQUcsS0FBRSxLQUFLLElBQUksQ0FBQyxJQUFFLEtBQUUsS0FBSyxJQUFJLENBQUMsR0FBRSxHQUFFLEtBQUcsS0FBRSxLQUFLLElBQUksQ0FBQyxJQUFFLEtBQUUsS0FBSyxJQUFJLENBQUMsQ0FBQyxHQUFFLEtBQUUsQ0FBQyxHQUFFLEtBQUcsS0FBRSxLQUFLLElBQUksQ0FBQyxJQUFFLEtBQUUsS0FBSyxJQUFJLENBQUMsR0FBRSxHQUFFLEtBQUcsS0FBRSxLQUFLLElBQUksQ0FBQyxJQUFFLEtBQUUsS0FBSyxJQUFJLENBQUMsQ0FBQztBQUFBLFFBQUUsR0FBRSxLQUFLLEdBQUcsS0FBSyxPQUFPLGNBQWMsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEVBQUMsQ0FBQztBQUFBLE1BQUM7QUFBQSxLQUFHLEdBQUU7QUFBQTtBQUFFO0FBQUE7QUFBQyxNQUFNLEVBQUM7QUFBQSxFQUFDLFdBQVcsQ0FBQyxJQUFFO0FBQUEsSUFBQyxLQUFLLFNBQU87QUFBQTtBQUFBLEVBQUUsWUFBWSxDQUFDLElBQUUsSUFBRTtBQUFBLElBQUMsTUFBTSxLQUFFLEdBQUUsYUFBVyxJQUFFLElBQUUsR0FBRSxjQUFZLEdBQUUsWUFBVyxLQUFFLEdBQUUsZUFBYSxJQUFFLEtBQUUsR0FBRSxjQUFhLEtBQUUsRUFBRSxJQUFFLEtBQUUsT0FBTyxPQUFPLENBQUMsR0FBRSxJQUFFLEVBQUMsWUFBVyxLQUFFLEdBQUMsQ0FBQyxDQUFDO0FBQUEsSUFBRSxPQUFNLEVBQUMsTUFBSyxjQUFhLEtBQUksS0FBSyxZQUFZLElBQUUsSUFBRSxFQUFDLEVBQUM7QUFBQTtBQUFBLEVBQUUsV0FBVyxDQUFDLElBQUUsSUFBRSxJQUFFO0FBQUEsSUFBQyxNQUFNLEtBQUUsQ0FBQztBQUFBLElBQUUsT0FBTyxHQUFFLFFBQVMsUUFBRztBQUFBLE1BQUMsTUFBTSxLQUFFLEVBQUUsRUFBQyxHQUFFLEtBQUUsS0FBSyxNQUFNLE1BQUcsSUFBRSxHQUFFO0FBQUEsTUFBRSxJQUFJLEtBQUUsR0FBRSxJQUFHLEtBQUUsR0FBRTtBQUFBLE1BQUcsR0FBRSxLQUFHLEdBQUUsT0FBSyxLQUFFLEdBQUUsSUFBRyxLQUFFLEdBQUU7QUFBQSxNQUFJLE1BQU0sS0FBRSxLQUFLLE1BQU0sR0FBRSxLQUFHLEdBQUUsT0FBSyxHQUFFLEtBQUcsR0FBRSxHQUFHO0FBQUEsTUFBRSxTQUFRLEtBQUUsRUFBRSxLQUFFLElBQUUsTUFBSTtBQUFBLFFBQUMsTUFBTSxLQUFFLElBQUUsS0FBRSxJQUFFLEtBQUUsS0FBRyxLQUFFLEtBQUcsSUFBRSxLQUFFLEtBQUssS0FBSyxJQUFFLEtBQUssSUFBSSxJQUFFLENBQUMsQ0FBQyxHQUFFLEtBQUUsQ0FBQyxHQUFFLEtBQUcsS0FBRSxLQUFLLElBQUksRUFBQyxHQUFFLEdBQUUsS0FBRyxLQUFFLEtBQUssSUFBSSxFQUFDLENBQUMsR0FBRSxLQUFFLENBQUMsR0FBRSxLQUFHLEtBQUUsS0FBSyxJQUFJLEVBQUMsR0FBRSxHQUFFLEtBQUcsS0FBRSxLQUFLLElBQUksRUFBQyxDQUFDLEdBQUUsSUFBRSxDQUFDLEdBQUUsS0FBRyxLQUFFLEtBQUssSUFBSSxLQUFFLEtBQUssS0FBRyxDQUFDLEdBQUUsR0FBRSxLQUFHLEtBQUUsS0FBSyxJQUFJLEtBQUUsS0FBSyxLQUFHLENBQUMsQ0FBQztBQUFBLFFBQUUsR0FBRSxLQUFLLEdBQUcsS0FBSyxPQUFPLGNBQWMsR0FBRSxJQUFHLEdBQUUsSUFBRyxFQUFFLElBQUcsRUFBRSxJQUFHLEVBQUMsR0FBRSxHQUFHLEtBQUssT0FBTyxjQUFjLEVBQUUsSUFBRyxFQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxFQUFDLENBQUM7QUFBQSxNQUFDO0FBQUEsS0FBRyxHQUFFO0FBQUE7QUFBRTtBQUFDLElBQU0sSUFBRSxDQUFDO0FBQUE7QUFBRSxNQUFNLEVBQUM7QUFBQSxFQUFDLFdBQVcsQ0FBQyxJQUFFO0FBQUEsSUFBQyxLQUFLLE9BQUs7QUFBQTtBQUFBLEVBQUUsSUFBSSxHQUFFO0FBQUEsSUFBQyxPQUFPLEtBQUssUUFBTSxLQUFHLEtBQUcsS0FBRyxLQUFLLE9BQUssS0FBSyxLQUFLLE9BQU0sS0FBSyxJQUFJLE1BQUksS0FBRyxLQUFHLEtBQUssT0FBTztBQUFBO0FBQUU7QUFBQyxJQUFNLElBQUU7QUFBUixJQUFVLElBQUU7QUFBWixJQUFjLElBQUU7QUFBaEIsSUFB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QUEsRUFBRSxNQUFNLEtBQUUsQ0FBQztBQUFBLEVBQUUsYUFBVSxLQUFJLElBQUUsTUFBSyxRQUFLO0FBQUEsSUFBRSxRQUFPO0FBQUEsV0FBTztBQUFBLFFBQUksR0FBRSxLQUFLLEVBQUMsS0FBSSxLQUFJLE1BQUssQ0FBQyxHQUFHLEVBQUMsRUFBQyxDQUFDLEdBQUUsQ0FBQyxJQUFFLEVBQUMsSUFBRSxJQUFFLENBQUMsSUFBRSxFQUFDLElBQUU7QUFBQSxRQUFFO0FBQUEsV0FBVTtBQUFBLFFBQUksTUFBRyxHQUFFLElBQUcsTUFBRyxHQUFFLElBQUcsR0FBRSxLQUFLLEVBQUMsS0FBSSxLQUFJLE1BQUssQ0FBQyxJQUFFLEVBQUMsRUFBQyxDQUFDLEdBQUUsS0FBRSxJQUFFLEtBQUU7QUFBQSxRQUFFO0FBQUEsV0FBVTtBQUFBLFFBQUksR0FBRSxLQUFLLEVBQUMsS0FBSSxLQUFJLE1BQUssQ0FBQyxHQUFHLEVBQUMsRUFBQyxDQUFDLEdBQUUsQ0FBQyxJQUFFLEVBQUMsSUFBRTtBQUFBLFFBQUU7QUFBQSxXQUFVO0FBQUEsUUFBSSxNQUFHLEdBQUUsSUFBRyxNQUFHLEdBQUUsSUFBRyxHQUFFLEtBQUssRUFBQyxLQUFJLEtBQUksTUFBSyxDQUFDLElBQUUsRUFBQyxFQUFDLENBQUM7QUFBQSxRQUFFO0FBQUEsV0FBVTtBQUFBLFFBQUksR0FBRSxLQUFLLEVBQUMsS0FBSSxLQUFJLE1BQUssQ0FBQyxHQUFHLEVBQUMsRUFBQyxDQUFDLEdBQUUsS0FBRSxHQUFFLElBQUcsS0FBRSxHQUFFO0FBQUEsUUFBRztBQUFBLFdBQVUsS0FBSTtBQUFBLFFBQUMsTUFBTSxLQUFFLEdBQUUsSUFBSyxDQUFDLElBQUUsT0FBSSxLQUFFLElBQUUsS0FBRSxLQUFFLEtBQUUsRUFBRTtBQUFBLFFBQUUsR0FBRSxLQUFLLEVBQUMsS0FBSSxLQUFJLE1BQUssR0FBQyxDQUFDLEdBQUUsS0FBRSxHQUFFLElBQUcsS0FBRSxHQUFFO0FBQUEsUUFBRztBQUFBLE1BQUs7QUFBQSxXQUFLO0FBQUEsUUFBSSxHQUFFLEtBQUssRUFBQyxLQUFJLEtBQUksTUFBSyxDQUFDLEdBQUcsRUFBQyxFQUFDLENBQUMsR0FBRSxLQUFFLEdBQUUsSUFBRyxLQUFFLEdBQUU7QUFBQSxRQUFHO0FBQUEsV0FBVSxLQUFJO0FBQUEsUUFBQyxNQUFNLEtBQUUsR0FBRSxJQUFLLENBQUMsSUFBRSxPQUFJLEtBQUUsSUFBRSxLQUFFLEtBQUUsS0FBRSxFQUFFO0FBQUEsUUFBRSxHQUFFLEtBQUssRUFBQyxLQUFJLEtBQUksTUFBSyxHQUFDLENBQUMsR0FBRSxLQUFFLEdBQUUsSUFBRyxLQUFFLEdBQUU7QUFBQSxRQUFHO0FBQUEsTUFBSztBQUFBLFdBQUs7QUFBQSxRQUFJLEdBQUUsS0FBSyxFQUFDLEtBQUksS0FBSSxNQUFLLENBQUMsR0FBRyxFQUFDLEVBQUMsQ0FBQyxHQUFFLEtBQUUsR0FBRSxJQUFHLEtBQUUsR0FBRTtBQUFBLFFBQUc7QUFBQSxXQUFVO0FBQUEsUUFBSSxNQUFHLEdBQUUsSUFBRyxNQUFHLEdBQUUsSUFBRyxHQUFFLEtBQUssRUFBQyxLQUFJLEtBQUksTUFBSyxDQUFDLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsSUFBRSxFQUFDLEVBQUMsQ0FBQztBQUFBLFFBQUU7QUFBQSxXQUFVO0FBQUEsUUFBSSxHQUFFLEtBQUssRUFBQyxLQUFJLEtBQUksTUFBSyxDQUFDLEdBQUcsRUFBQyxFQUFDLENBQUMsR0FBRSxLQUFFLEdBQUU7QUFBQSxRQUFHO0FBQUEsV0FBVTtBQUFBLFFBQUksTUFBRyxHQUFFLElBQUcsR0FBRSxLQUFLLEVBQUMsS0FBSSxLQUFJLE1BQUssQ0FBQyxFQUFDLEVBQUMsQ0FBQztBQUFBLFFBQUU7QUFBQSxXQUFVO0FBQUEsUUFBSSxHQUFFLEtBQUssRUFBQyxLQUFJLEtBQUksTUFBSyxDQUFDLEdBQUcsRUFBQyxFQUFDLENBQUMsR0FBRSxLQUFFLEdBQUU7QUFBQSxRQUFHO0FBQUEsV0FBVTtBQUFBLFFBQUksTUFBRyxHQUFFLElBQUcsR0FBRSxLQUFLLEVBQUMsS0FBSSxLQUFJLE1BQUssQ0FBQyxFQUFDLEVBQUMsQ0FBQztBQUFBLFFBQUU7QUFBQSxXQUFVO0FBQUEsUUFBSSxHQUFFLEtBQUssRUFBQyxLQUFJLEtBQUksTUFBSyxDQUFDLEdBQUcsRUFBQyxFQUFDLENBQUMsR0FBRSxLQUFFLEdBQUUsSUFBRyxLQUFFLEdBQUU7QUFBQSxRQUFHO0FBQUEsV0FBVSxLQUFJO0FBQUEsUUFBQyxNQUFNLEtBQUUsR0FBRSxJQUFLLENBQUMsSUFBRSxPQUFJLEtBQUUsSUFBRSxLQUFFLEtBQUUsS0FBRSxFQUFFO0FBQUEsUUFBRSxHQUFFLEtBQUssRUFBQyxLQUFJLEtBQUksTUFBSyxHQUFDLENBQUMsR0FBRSxLQUFFLEdBQUUsSUFBRyxLQUFFLEdBQUU7QUFBQSxRQUFHO0FBQUEsTUFBSztBQUFBLFdBQUs7QUFBQSxRQUFJLEdBQUUsS0FBSyxFQUFDLEtBQUksS0FBSSxNQUFLLENBQUMsR0FBRyxFQUFDLEVBQUMsQ0FBQyxHQUFFLEtBQUUsR0FBRSxJQUFHLEtBQUUsR0FBRTtBQUFBLFFBQUc7QUFBQSxXQUFVO0FBQUEsUUFBSSxNQUFHLEdBQUUsSUFBRyxNQUFHLEdBQUUsSUFBRyxHQUFFLEtBQUssRUFBQyxLQUFJLEtBQUksTUFBSyxDQUFDLElBQUUsRUFBQyxFQUFDLENBQUM7QUFBQSxRQUFFO0FBQUEsV0FBVTtBQUFBLFdBQVE7QUFBQSxRQUFJLEdBQUUsS0FBSyxFQUFDLEtBQUksS0FBSSxNQUFLLENBQUMsRUFBQyxDQUFDLEdBQUUsS0FBRSxJQUFFLEtBQUU7QUFBQTtBQUFBLEVBQUUsT0FBTztBQUFBO0FBQUUsU0FBUyxDQUFDLENBQUMsSUFBRTtBQUFBLEVBQUMsTUFBTSxLQUFFLENBQUM7QUFBQSxFQUFFLElBQUksS0FBRSxJQUFHLEtBQUUsR0FBRSxLQUFFLEdBQUUsS0FBRSxHQUFFLEtBQUUsR0FBRSxLQUFFLEdBQUUsS0FBRTtBQUFBLEVBQUUsYUFBVSxLQUFJLElBQUUsTUFBSyxRQUFLLElBQUU7QUFBQSxJQUFDLFFBQU87QUFBQSxXQUFPO0FBQUEsUUFBSSxHQUFFLEtBQUssRUFBQyxLQUFJLEtBQUksTUFBSyxDQUFDLEdBQUcsRUFBQyxFQUFDLENBQUMsR0FBRSxDQUFDLElBQUUsRUFBQyxJQUFFLElBQUUsQ0FBQyxJQUFFLEVBQUMsSUFBRTtBQUFBLFFBQUU7QUFBQSxXQUFVO0FBQUEsUUFBSSxHQUFFLEtBQUssRUFBQyxLQUFJLEtBQUksTUFBSyxDQUFDLEdBQUcsRUFBQyxFQUFDLENBQUMsR0FBRSxLQUFFLEdBQUUsSUFBRyxLQUFFLEdBQUUsSUFBRyxLQUFFLEdBQUUsSUFBRyxLQUFFLEdBQUU7QUFBQSxRQUFHO0FBQUEsV0FBVTtBQUFBLFFBQUksR0FBRSxLQUFLLEVBQUMsS0FBSSxLQUFJLE1BQUssQ0FBQyxHQUFHLEVBQUMsRUFBQyxDQUFDLEdBQUUsQ0FBQyxJQUFFLEVBQUMsSUFBRTtBQUFBLFFBQUU7QUFBQSxXQUFVO0FBQUEsUUFBSSxLQUFFLEdBQUUsSUFBRyxHQUFFLEtBQUssRUFBQyxLQUFJLEtBQUksTUFBSyxDQUFDLElBQUUsRUFBQyxFQUFDLENBQUM7QUFBQSxRQUFFO0FBQUEsV0FBVTtBQUFBLFFBQUksS0FBRSxHQUFFLElBQUcsR0FBRSxLQUFLLEVBQUMsS0FBSSxLQUFJLE1BQUssQ0FBQyxJQUFFLEVBQUMsRUFBQyxDQUFDO0FBQUEsUUFBRTtBQUFBLFdBQVUsS0FBSTtBQUFBLFFBQUMsSUFBSSxLQUFFLEdBQUUsS0FBRTtBQUFBLFFBQVEsT0FBTixPQUFlLE9BQU4sT0FBUyxLQUFFLE1BQUcsS0FBRSxLQUFHLEtBQUUsTUFBRyxLQUFFLFFBQUssS0FBRSxJQUFFLEtBQUUsS0FBRyxHQUFFLEtBQUssRUFBQyxLQUFJLEtBQUksTUFBSyxDQUFDLElBQUUsSUFBRSxHQUFHLEVBQUMsRUFBQyxDQUFDLEdBQUUsS0FBRSxHQUFFLElBQUcsS0FBRSxHQUFFLElBQUcsS0FBRSxHQUFFLElBQUcsS0FBRSxHQUFFO0FBQUEsUUFBRztBQUFBLE1BQUs7QUFBQSxXQUFLLEtBQUk7QUFBQSxRQUFDLE9BQU0sSUFBRSxNQUFHO0FBQUEsUUFBRSxJQUFJLEtBQUUsR0FBRSxLQUFFO0FBQUEsUUFBUSxPQUFOLE9BQWUsT0FBTixPQUFTLEtBQUUsTUFBRyxLQUFFLEtBQUcsS0FBRSxNQUFHLEtBQUUsUUFBSyxLQUFFLElBQUUsS0FBRTtBQUFBLFFBQUcsTUFBTSxLQUFFLEtBQUUsS0FBRyxLQUFFLE1BQUcsR0FBRSxLQUFFLEtBQUUsS0FBRyxLQUFFLE1BQUcsR0FBRSxLQUFFLEtBQUUsS0FBRyxLQUFFLE1BQUcsR0FBRSxLQUFFLEtBQUUsS0FBRyxLQUFFLE1BQUc7QUFBQSxRQUFFLEdBQUUsS0FBSyxFQUFDLEtBQUksS0FBSSxNQUFLLENBQUMsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLEVBQUMsRUFBQyxDQUFDLEdBQUUsS0FBRSxJQUFFLEtBQUUsSUFBRSxLQUFFLElBQUUsS0FBRTtBQUFBLFFBQUU7QUFBQSxNQUFLO0FBQUEsV0FBSyxLQUFJO0FBQUEsUUFBQyxPQUFNLElBQUUsSUFBRSxJQUFFLE1BQUcsSUFBRSxLQUFFLEtBQUUsS0FBRyxLQUFFLE1BQUcsR0FBRSxLQUFFLEtBQUUsS0FBRyxLQUFFLE1BQUcsR0FBRSxLQUFFLEtBQUUsS0FBRyxLQUFFLE1BQUcsR0FBRSxLQUFFLEtBQUUsS0FBRyxLQUFFLE1BQUc7QUFBQSxRQUFFLEdBQUUsS0FBSyxFQUFDLEtBQUksS0FBSSxNQUFLLENBQUMsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLEVBQUMsRUFBQyxDQUFDLEdBQUUsS0FBRSxJQUFFLEtBQUUsSUFBRSxLQUFFLElBQUUsS0FBRTtBQUFBLFFBQUU7QUFBQSxNQUFLO0FBQUEsV0FBSyxLQUFJO0FBQUEsUUFBQyxNQUFNLEtBQUUsS0FBSyxJQUFJLEdBQUUsRUFBRSxHQUFFLEtBQUUsS0FBSyxJQUFJLEdBQUUsRUFBRSxHQUFFLEtBQUUsR0FBRSxJQUFHLEtBQUUsR0FBRSxJQUFHLEtBQUUsR0FBRSxJQUFHLEtBQUUsR0FBRSxJQUFHLEtBQUUsR0FBRTtBQUFBLFFBQUcsSUFBTyxPQUFKLEtBQVcsT0FBSjtBQUFBLFVBQU0sR0FBRSxLQUFLLEVBQUMsS0FBSSxLQUFJLE1BQUssQ0FBQyxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsRUFBQyxFQUFDLENBQUMsR0FBRSxLQUFFLElBQUUsS0FBRTtBQUFBLFFBQU8sU0FBRyxPQUFJLE1BQUcsT0FBSSxJQUFFO0FBQUEsVUFBQyxFQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxFQUFDLEVBQUUsUUFBUyxRQUFRLENBQUMsSUFBRTtBQUFBLFlBQUMsR0FBRSxLQUFLLEVBQUMsS0FBSSxLQUFJLE1BQUssR0FBQyxDQUFDO0FBQUEsV0FBRyxHQUFFLEtBQUUsSUFBRSxLQUFFO0FBQUEsUUFBQztBQUFBLFFBQUM7QUFBQSxNQUFLO0FBQUEsV0FBSztBQUFBLFFBQUksR0FBRSxLQUFLLEVBQUMsS0FBSSxLQUFJLE1BQUssQ0FBQyxFQUFDLENBQUMsR0FBRSxLQUFFLElBQUUsS0FBRTtBQUFBO0FBQUEsSUFBRSxLQUFFO0FBQUEsRUFBQztBQUFBLEVBQUMsT0FBTztBQUFBO0FBQUUsU0FBUyxDQUFDLENBQUMsSUFBRSxJQUFFLElBQUU7QUFBQSxFQUFDLE9BQU0sQ0FBQyxLQUFFLEtBQUssSUFBSSxFQUFDLElBQUUsS0FBRSxLQUFLLElBQUksRUFBQyxHQUFFLEtBQUUsS0FBSyxJQUFJLEVBQUMsSUFBRSxLQUFFLEtBQUssSUFBSSxFQUFDLENBQUM7QUFBQTtBQUFFLFNBQVMsQ0FBQyxDQUFDLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUU7QUFBQSxFQUFDLE1BQU0sTUFBRyxLQUFFLElBQUUsS0FBSyxLQUFHLEtBQUU7QUFBQSxFQUFLLElBQUk7QUFBQSxFQUFFLElBQUksS0FBRSxDQUFDLEdBQUUsS0FBRSxHQUFFLEtBQUUsR0FBRSxLQUFFLEdBQUUsS0FBRTtBQUFBLEVBQUUsSUFBRztBQUFBLElBQUUsQ0FBQyxJQUFFLElBQUUsSUFBRSxFQUFDLElBQUU7QUFBQSxFQUFNO0FBQUEsSUFBQyxDQUFDLElBQUUsRUFBQyxJQUFFLEVBQUUsSUFBRSxJQUFFLENBQUMsRUFBQyxHQUFFLENBQUMsSUFBRSxFQUFDLElBQUUsRUFBRSxJQUFFLElBQUUsQ0FBQyxFQUFDO0FBQUEsSUFBRSxNQUFNLE1BQUcsS0FBRSxNQUFHLEdBQUUsTUFBRyxLQUFFLE1BQUc7QUFBQSxJQUFFLElBQUksS0FBRSxLQUFFLE1BQUcsS0FBRSxNQUFHLEtBQUUsTUFBRyxLQUFFO0FBQUEsSUFBRyxLQUFFLE1BQUksS0FBRSxLQUFLLEtBQUssRUFBQyxHQUFFLE1BQUcsSUFBRSxNQUFHO0FBQUEsSUFBRyxNQUFNLEtBQUUsS0FBRSxJQUFFLEtBQUUsS0FBRSxJQUFFLEtBQUUsS0FBRSxLQUFFLEtBQUUsS0FBRSxLQUFFLEtBQUUsS0FBRSxJQUFFLEtBQUUsS0FBRSxLQUFFLEtBQUUsS0FBRSxLQUFFLElBQUUsTUFBRyxPQUFJLEtBQUUsS0FBRyxLQUFHLEtBQUssS0FBSyxLQUFLLElBQUksS0FBRSxFQUFDLENBQUM7QUFBQSxJQUFFLEtBQUUsS0FBRSxLQUFFLEtBQUUsTUFBRyxLQUFFLE1BQUcsR0FBRSxLQUFFLEtBQUUsQ0FBQyxLQUFFLEtBQUUsTUFBRyxLQUFFLE1BQUcsR0FBRSxLQUFFLEtBQUssS0FBSyxhQUFhLEtBQUUsTUFBRyxJQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRSxLQUFFLEtBQUssS0FBSyxhQUFhLEtBQUUsTUFBRyxJQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRSxLQUFFLE9BQUksS0FBRSxLQUFLLEtBQUcsS0FBRyxLQUFFLE9BQUksS0FBRSxLQUFLLEtBQUcsS0FBRyxLQUFFLE1BQUksS0FBRSxJQUFFLEtBQUssS0FBRyxLQUFHLEtBQUUsTUFBSSxLQUFFLElBQUUsS0FBSyxLQUFHLEtBQUcsTUFBRyxLQUFFLE9BQUksTUFBRyxJQUFFLEtBQUssS0FBSSxDQUFDLE1BQUcsS0FBRSxPQUFJLE1BQUcsSUFBRSxLQUFLO0FBQUE7QUFBQSxFQUFJLElBQUksS0FBRSxLQUFFO0FBQUEsRUFBRSxJQUFHLEtBQUssSUFBSSxFQUFDLElBQUUsTUFBSSxLQUFLLEtBQUcsS0FBSTtBQUFBLElBQUMsTUFBTSxLQUFFLElBQUUsS0FBRSxJQUFFLEtBQUU7QUFBQSxJQUFFLEtBQUUsTUFBRyxLQUFFLEtBQUUsS0FBRSxNQUFJLEtBQUssS0FBRyxNQUFJLElBQUUsS0FBRSxNQUFJLEtBQUssS0FBRyxNQUFJLElBQUcsS0FBRSxFQUFFLEtBQUUsS0FBRSxLQUFFLEtBQUssSUFBSSxFQUFDLEdBQUUsS0FBRSxLQUFFLEtBQUUsS0FBSyxJQUFJLEVBQUMsR0FBRSxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsR0FBRSxJQUFFLENBQUMsSUFBRSxJQUFFLElBQUUsRUFBQyxDQUFDO0FBQUEsRUFBQztBQUFBLEVBQUMsS0FBRSxLQUFFO0FBQUEsRUFBRSxNQUFNLEtBQUUsS0FBSyxJQUFJLEVBQUMsR0FBRSxLQUFFLEtBQUssSUFBSSxFQUFDLEdBQUUsS0FBRSxLQUFLLElBQUksRUFBQyxHQUFFLElBQUUsS0FBSyxJQUFJLEVBQUMsR0FBRSxJQUFFLEtBQUssSUFBSSxLQUFFLENBQUMsR0FBRSxJQUFFLElBQUUsSUFBRSxLQUFFLEdBQUUsSUFBRSxJQUFFLElBQUUsS0FBRSxHQUFFLElBQUUsQ0FBQyxJQUFFLEVBQUMsR0FBRSxJQUFFLENBQUMsS0FBRSxJQUFFLElBQUUsS0FBRSxJQUFFLEVBQUMsR0FBRSxJQUFFLENBQUMsS0FBRSxJQUFFLEdBQUUsS0FBRSxJQUFFLEVBQUMsR0FBRSxJQUFFLENBQUMsSUFBRSxFQUFDO0FBQUEsRUFBRSxJQUFHLEVBQUUsS0FBRyxJQUFFLEVBQUUsS0FBRyxFQUFFLElBQUcsRUFBRSxLQUFHLElBQUUsRUFBRSxLQUFHLEVBQUUsSUFBRztBQUFBLElBQUUsT0FBTSxDQUFDLEdBQUUsR0FBRSxDQUFDLEVBQUUsT0FBTyxFQUFDO0FBQUEsRUFBRTtBQUFBLElBQUMsS0FBRSxDQUFDLEdBQUUsR0FBRSxDQUFDLEVBQUUsT0FBTyxFQUFDO0FBQUEsSUFBRSxNQUFNLEtBQUUsQ0FBQztBQUFBLElBQUUsU0FBUSxLQUFFLEVBQUUsS0FBRSxHQUFFLFFBQU8sTUFBRyxHQUFFO0FBQUEsTUFBQyxNQUFNLEtBQUUsRUFBRSxHQUFFLElBQUcsSUFBRyxHQUFFLElBQUcsSUFBRyxFQUFDLEdBQUUsS0FBRSxFQUFFLEdBQUUsS0FBRSxHQUFHLElBQUcsR0FBRSxLQUFFLEdBQUcsSUFBRyxFQUFDLEdBQUUsS0FBRSxFQUFFLEdBQUUsS0FBRSxHQUFHLElBQUcsR0FBRSxLQUFFLEdBQUcsSUFBRyxFQUFDO0FBQUEsTUFBRSxHQUFFLEtBQUssQ0FBQyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsRUFBRSxDQUFDO0FBQUEsSUFBQztBQUFBLElBQUMsT0FBTztBQUFBLEVBQUM7QUFBQTtBQUFFLElBQU0sSUFBRSxFQUFDLFlBQVcsUUFBUSxDQUFDLElBQUUsSUFBRTtBQUFBLEVBQUMsT0FBTyxFQUFFLElBQUUsRUFBQztBQUFBLEdBQUcscUJBQW9CLFFBQVEsQ0FBQyxJQUFFLElBQUUsSUFBRTtBQUFBLEVBQUMsT0FBTyxFQUFFLElBQUUsSUFBRSxFQUFDO0FBQUEsR0FBRyxTQUFRLFFBQVEsQ0FBQyxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUU7QUFBQSxFQUFDLE1BQU0sS0FBRSxFQUFFLElBQUUsSUFBRSxFQUFDO0FBQUEsRUFBRSxPQUFPLEVBQUUsSUFBRSxJQUFFLElBQUUsRUFBQyxFQUFFO0FBQUEsR0FBTyxlQUFjLFFBQVEsQ0FBQyxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUU7QUFBQSxFQUFDLE9BQU8sRUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRTtBQUFBLEVBQUU7QUFBRSxTQUFTLENBQUMsQ0FBQyxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUU7QUFBQSxFQUFDLE9BQU0sRUFBQyxNQUFLLFFBQU8sS0FBSSxFQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsRUFBQyxFQUFDO0FBQUE7QUFBRSxTQUFTLENBQUMsQ0FBQyxJQUFFLElBQUUsSUFBRTtBQUFBLEVBQUMsTUFBTSxNQUFHLE1BQUcsQ0FBQyxHQUFHO0FBQUEsRUFBTyxJQUFHLEtBQUUsR0FBRTtBQUFBLElBQUMsTUFBTSxLQUFFLENBQUM7QUFBQSxJQUFFLFNBQVEsS0FBRSxFQUFFLEtBQUUsS0FBRSxHQUFFO0FBQUEsTUFBSSxHQUFFLEtBQUssR0FBRyxFQUFFLEdBQUUsSUFBRyxJQUFHLEdBQUUsSUFBRyxJQUFHLEdBQUUsS0FBRSxHQUFHLElBQUcsR0FBRSxLQUFFLEdBQUcsSUFBRyxFQUFDLENBQUM7QUFBQSxJQUFFLE9BQU8sTUFBRyxHQUFFLEtBQUssR0FBRyxFQUFFLEdBQUUsS0FBRSxHQUFHLElBQUcsR0FBRSxLQUFFLEdBQUcsSUFBRyxHQUFFLEdBQUcsSUFBRyxHQUFFLEdBQUcsSUFBRyxFQUFDLENBQUMsR0FBRSxFQUFDLE1BQUssUUFBTyxLQUFJLEdBQUM7QUFBQSxFQUFDO0FBQUEsRUFBQyxPQUFXLE9BQUosSUFBTSxFQUFFLEdBQUUsR0FBRyxJQUFHLEdBQUUsR0FBRyxJQUFHLEdBQUUsR0FBRyxJQUFHLEdBQUUsR0FBRyxJQUFHLEVBQUMsSUFBRSxFQUFDLE1BQUssUUFBTyxLQUFJLENBQUMsRUFBQztBQUFBO0FBQUUsU0FBUyxDQUFDLENBQUMsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFO0FBQUEsRUFBQyxPQUFPLFFBQVEsQ0FBQyxJQUFFLElBQUU7QUFBQSxJQUFDLE9BQU8sRUFBRSxJQUFFLE1BQUcsRUFBQztBQUFBLElBQUcsQ0FBQyxDQUFDLElBQUUsRUFBQyxHQUFFLENBQUMsS0FBRSxJQUFFLEVBQUMsR0FBRSxDQUFDLEtBQUUsSUFBRSxLQUFFLEVBQUMsR0FBRSxDQUFDLElBQUUsS0FBRSxFQUFDLENBQUMsR0FBRSxFQUFDO0FBQUE7QUFBRSxTQUFTLENBQUMsQ0FBQyxJQUFFLElBQUU7QUFBQSxFQUFDLElBQUcsR0FBRSxRQUFPO0FBQUEsSUFBQyxNQUFNLEtBQVksT0FBTyxHQUFFLEdBQUcsTUFBdEIsV0FBeUIsQ0FBQyxFQUFDLElBQUUsSUFBRSxLQUFFLEVBQUUsR0FBRSxJQUFHLEtBQUcsSUFBRSxNQUFHLEdBQUUsWUFBVyxFQUFDLEdBQUUsS0FBRSxHQUFFLHFCQUFtQixDQUFDLElBQUUsRUFBRSxHQUFFLElBQUcsT0FBSyxJQUFFLE9BQUksR0FBRSxZQUFXLEVBQUUsRUFBQyxDQUFDO0FBQUEsSUFBRSxTQUFRLEtBQUUsRUFBRSxLQUFFLEdBQUUsUUFBTyxNQUFJO0FBQUEsTUFBQyxNQUFNLEtBQUUsR0FBRTtBQUFBLE1BQUcsSUFBRyxHQUFFLFFBQU87QUFBQSxRQUFDLE1BQU0sS0FBRSxFQUFFLElBQUUsS0FBRyxJQUFFLE1BQUcsR0FBRSxZQUFXLEVBQUMsR0FBRSxLQUFFLEdBQUUscUJBQW1CLENBQUMsSUFBRSxFQUFFLElBQUUsT0FBSyxJQUFFLE9BQUksR0FBRSxZQUFXLEVBQUUsRUFBQyxDQUFDO0FBQUEsUUFBRSxXQUFVLE1BQUs7QUFBQSxVQUFXLEdBQUUsT0FBWCxVQUFlLEdBQUUsS0FBSyxFQUFDO0FBQUEsUUFBRSxXQUFVLE1BQUs7QUFBQSxVQUFXLEdBQUUsT0FBWCxVQUFlLEdBQUUsS0FBSyxFQUFDO0FBQUEsTUFBQztBQUFBLElBQUM7QUFBQSxJQUFDLE9BQU0sRUFBQyxNQUFLLFFBQU8sS0FBSSxHQUFFLE9BQU8sRUFBQyxFQUFDO0FBQUEsRUFBQztBQUFBLEVBQUMsT0FBTSxFQUFDLE1BQUssUUFBTyxLQUFJLENBQUMsRUFBQztBQUFBO0FBQUUsU0FBUyxDQUFDLENBQUMsSUFBRSxJQUFFLElBQUU7QUFBQSxFQUFDLE1BQU0sS0FBRSxLQUFLLEtBQUssSUFBRSxLQUFLLEtBQUcsS0FBSyxNQUFNLEtBQUssSUFBSSxLQUFFLEdBQUUsQ0FBQyxJQUFFLEtBQUssSUFBSSxLQUFFLEdBQUUsQ0FBQyxLQUFHLENBQUMsQ0FBQyxHQUFFLEtBQUUsS0FBSyxLQUFLLEtBQUssSUFBSSxHQUFFLGdCQUFlLEdBQUUsaUJBQWUsS0FBSyxLQUFLLEdBQUcsSUFBRSxFQUFDLENBQUMsR0FBRSxLQUFFLElBQUUsS0FBSyxLQUFHO0FBQUEsRUFBRSxJQUFJLEtBQUUsS0FBSyxJQUFJLEtBQUUsQ0FBQyxHQUFFLEtBQUUsS0FBSyxJQUFJLEtBQUUsQ0FBQztBQUFBLEVBQUUsTUFBTSxLQUFFLElBQUUsR0FBRTtBQUFBLEVBQWEsT0FBTyxNQUFHLEVBQUUsS0FBRSxJQUFFLEVBQUMsR0FBRSxNQUFHLEVBQUUsS0FBRSxJQUFFLEVBQUMsR0FBRSxFQUFDLFdBQVUsSUFBRSxJQUFHLElBQUUsSUFBRyxHQUFDO0FBQUE7QUFBRSxTQUFTLENBQUMsQ0FBQyxJQUFFLElBQUUsSUFBRSxJQUFFO0FBQUEsRUFBQyxPQUFNLElBQUUsTUFBRyxFQUFFLEdBQUUsV0FBVSxJQUFFLElBQUUsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLEdBQUUsWUFBVSxFQUFFLEtBQUcsRUFBRSxLQUFHLEdBQUUsRUFBQyxHQUFFLEVBQUMsR0FBRSxFQUFDO0FBQUEsRUFBRSxJQUFJLEtBQUUsRUFBRSxJQUFFLE1BQUssRUFBQztBQUFBLEVBQUUsSUFBRyxDQUFDLEdBQUUsc0JBQXdCLEdBQUUsY0FBTixHQUFnQjtBQUFBLElBQUMsT0FBTSxNQUFHLEVBQUUsR0FBRSxXQUFVLElBQUUsSUFBRSxHQUFFLElBQUcsR0FBRSxJQUFHLEtBQUksR0FBRSxFQUFDLEdBQUUsS0FBRSxFQUFFLElBQUUsTUFBSyxFQUFDO0FBQUEsSUFBRSxLQUFFLEdBQUUsT0FBTyxFQUFDO0FBQUEsRUFBQztBQUFBLEVBQUMsT0FBTSxFQUFDLGlCQUFnQixJQUFFLE9BQU0sRUFBQyxNQUFLLFFBQU8sS0FBSSxHQUFDLEVBQUM7QUFBQTtBQUFFLFNBQVMsQ0FBQyxDQUFDLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFO0FBQUEsRUFBQyxNQUFNLEtBQUUsSUFBRSxLQUFFO0FBQUEsRUFBRSxJQUFJLEtBQUUsS0FBSyxJQUFJLEtBQUUsQ0FBQyxHQUFFLEtBQUUsS0FBSyxJQUFJLEtBQUUsQ0FBQztBQUFBLEVBQUUsTUFBRyxFQUFFLE9BQUksSUFBRSxFQUFDLEdBQUUsTUFBRyxFQUFFLE9BQUksSUFBRSxFQUFDO0FBQUEsRUFBRSxJQUFJLEtBQUUsSUFBRSxLQUFFO0FBQUEsRUFBRSxNQUFLLEtBQUU7QUFBQSxJQUFHLE1BQUcsSUFBRSxLQUFLLElBQUcsTUFBRyxJQUFFLEtBQUs7QUFBQSxFQUFHLEtBQUUsS0FBRSxJQUFFLEtBQUssT0FBSyxLQUFFLEdBQUUsS0FBRSxJQUFFLEtBQUs7QUFBQSxFQUFJLE1BQU0sS0FBRSxJQUFFLEtBQUssS0FBRyxHQUFFLGdCQUFlLEtBQUUsS0FBSyxJQUFJLEtBQUUsSUFBRyxLQUFFLE1BQUcsQ0FBQyxHQUFFLEtBQUUsRUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLEdBQUUsRUFBQztBQUFBLEVBQUUsSUFBRyxDQUFDLEdBQUUsb0JBQW1CO0FBQUEsSUFBQyxNQUFNLEtBQUUsRUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLEtBQUksRUFBQztBQUFBLElBQUUsR0FBRSxLQUFLLEdBQUcsRUFBQztBQUFBLEVBQUM7QUFBQSxFQUFDLE9BQU8sT0FBSSxLQUFFLEdBQUUsS0FBSyxHQUFHLEVBQUUsSUFBRSxJQUFFLEtBQUUsS0FBRSxLQUFLLElBQUksRUFBQyxHQUFFLEtBQUUsS0FBRSxLQUFLLElBQUksRUFBQyxHQUFFLEVBQUMsR0FBRSxHQUFHLEVBQUUsSUFBRSxJQUFFLEtBQUUsS0FBRSxLQUFLLElBQUksRUFBQyxHQUFFLEtBQUUsS0FBRSxLQUFLLElBQUksRUFBQyxHQUFFLEVBQUMsQ0FBQyxJQUFFLEdBQUUsS0FBSyxFQUFDLElBQUcsVUFBUyxNQUFLLENBQUMsSUFBRSxFQUFDLEVBQUMsR0FBRSxFQUFDLElBQUcsVUFBUyxNQUFLLENBQUMsS0FBRSxLQUFFLEtBQUssSUFBSSxFQUFDLEdBQUUsS0FBRSxLQUFFLEtBQUssSUFBSSxFQUFDLENBQUMsRUFBQyxDQUFDLElBQUcsRUFBQyxNQUFLLFFBQU8sS0FBSSxHQUFDO0FBQUE7QUFBRSxTQUFTLENBQUMsQ0FBQyxJQUFFLElBQUU7QUFBQSxFQUFDLE1BQU0sS0FBRSxFQUFFLEVBQUUsRUFBRSxFQUFDLENBQUMsQ0FBQyxHQUFFLEtBQUUsQ0FBQztBQUFBLEVBQUUsSUFBSSxLQUFFLENBQUMsR0FBRSxDQUFDLEdBQUUsS0FBRSxDQUFDLEdBQUUsQ0FBQztBQUFBLEVBQUUsYUFBVSxLQUFJLElBQUUsTUFBSyxRQUFLO0FBQUEsSUFBRSxRQUFPO0FBQUEsV0FBTztBQUFBLFFBQUksS0FBRSxDQUFDLEdBQUUsSUFBRyxHQUFFLEVBQUUsR0FBRSxLQUFFLENBQUMsR0FBRSxJQUFHLEdBQUUsRUFBRTtBQUFBLFFBQUU7QUFBQSxXQUFVO0FBQUEsUUFBSSxHQUFFLEtBQUssR0FBRyxFQUFFLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxFQUFDLENBQUMsR0FBRSxLQUFFLENBQUMsR0FBRSxJQUFHLEdBQUUsRUFBRTtBQUFBLFFBQUU7QUFBQSxXQUFVLEtBQUk7QUFBQSxRQUFDLE9BQU0sSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLE1BQUc7QUFBQSxRQUFFLEdBQUUsS0FBSyxHQUFHLEVBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxFQUFDLENBQUMsR0FBRSxLQUFFLENBQUMsSUFBRSxFQUFDO0FBQUEsUUFBRTtBQUFBLE1BQUs7QUFBQSxXQUFLO0FBQUEsUUFBSSxHQUFFLEtBQUssR0FBRyxFQUFFLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxFQUFDLENBQUMsR0FBRSxLQUFFLENBQUMsR0FBRSxJQUFHLEdBQUUsRUFBRTtBQUFBO0FBQUEsRUFBRSxPQUFNLEVBQUMsTUFBSyxRQUFPLEtBQUksR0FBQztBQUFBO0FBQUUsU0FBUyxDQUFDLENBQUMsSUFBRSxJQUFFO0FBQUEsRUFBQyxNQUFNLEtBQUUsQ0FBQztBQUFBLEVBQUUsV0FBVSxNQUFLO0FBQUEsSUFBRSxJQUFHLEdBQUUsUUFBTztBQUFBLE1BQUMsTUFBTSxLQUFFLEdBQUUsdUJBQXFCLEdBQUUsS0FBRSxHQUFFO0FBQUEsTUFBTyxJQUFHLEtBQUUsR0FBRTtBQUFBLFFBQUMsR0FBRSxLQUFLLEVBQUMsSUFBRyxRQUFPLE1BQUssQ0FBQyxHQUFFLEdBQUcsS0FBRyxFQUFFLElBQUUsRUFBQyxHQUFFLEdBQUUsR0FBRyxLQUFHLEVBQUUsSUFBRSxFQUFDLENBQUMsRUFBQyxDQUFDO0FBQUEsUUFBRSxTQUFRLEtBQUUsRUFBRSxLQUFFLElBQUU7QUFBQSxVQUFJLEdBQUUsS0FBSyxFQUFDLElBQUcsVUFBUyxNQUFLLENBQUMsR0FBRSxJQUFHLEtBQUcsRUFBRSxJQUFFLEVBQUMsR0FBRSxHQUFFLElBQUcsS0FBRyxFQUFFLElBQUUsRUFBQyxDQUFDLEVBQUMsQ0FBQztBQUFBLE1BQUM7QUFBQSxJQUFDO0FBQUEsRUFBQyxPQUFNLEVBQUMsTUFBSyxZQUFXLEtBQUksR0FBQztBQUFBO0FBQUUsU0FBUyxDQUFDLENBQUMsSUFBRSxJQUFFO0FBQUEsRUFBQyxPQUFPLFFBQVEsQ0FBQyxJQUFFLElBQUU7QUFBQSxJQUFDLElBQUksS0FBRSxHQUFFLGFBQVc7QUFBQSxJQUFVLElBQUcsQ0FBQyxFQUFFO0FBQUEsTUFBRyxRQUFPO0FBQUEsYUFBTztBQUFBLFVBQVMsRUFBRSxRQUFLLEVBQUUsTUFBRyxJQUFJLEVBQUUsRUFBQztBQUFBLFVBQUc7QUFBQSxhQUFVO0FBQUEsVUFBYyxFQUFFLFFBQUssRUFBRSxNQUFHLElBQUksRUFBRSxFQUFDO0FBQUEsVUFBRztBQUFBLGFBQVU7QUFBQSxVQUFPLEVBQUUsUUFBSyxFQUFFLE1BQUcsSUFBSSxFQUFFLEVBQUM7QUFBQSxVQUFHO0FBQUEsYUFBVTtBQUFBLFVBQVMsRUFBRSxRQUFLLEVBQUUsTUFBRyxJQUFJLEVBQUUsRUFBQztBQUFBLFVBQUc7QUFBQSxhQUFVO0FBQUEsVUFBYyxFQUFFLFFBQUssRUFBRSxNQUFHLElBQUksRUFBRSxFQUFDO0FBQUEsVUFBRztBQUFBO0FBQUEsVUFBYyxLQUFFLFdBQVUsRUFBRSxRQUFLLEVBQUUsTUFBRyxJQUFJLEVBQUUsRUFBQztBQUFBO0FBQUEsSUFBRyxPQUFPLEVBQUU7QUFBQSxJQUFJLElBQUUsQ0FBQyxFQUFFLGFBQWEsSUFBRSxFQUFDO0FBQUE7QUFBRSxTQUFTLENBQUMsQ0FBQyxJQUFFO0FBQUEsRUFBQyxNQUFNLEtBQUUsT0FBTyxPQUFPLENBQUMsR0FBRSxFQUFDO0FBQUEsRUFBRSxPQUFPLEdBQUUsYUFBZ0IsV0FBRSxHQUFFLFNBQU8sR0FBRSxPQUFLLEdBQUUsT0FBSyxJQUFHO0FBQUE7QUFBRSxTQUFTLENBQUMsQ0FBQyxJQUFFO0FBQUEsRUFBQyxPQUFPLEdBQUUsZUFBYSxHQUFFLGFBQVcsSUFBSSxFQUFFLEdBQUUsUUFBTSxDQUFDLElBQUcsR0FBRSxXQUFXLEtBQUs7QUFBQTtBQUFFLFNBQVMsQ0FBQyxDQUFDLElBQUUsSUFBRSxJQUFFLEtBQUUsR0FBRTtBQUFBLEVBQUMsT0FBTyxHQUFFLFlBQVUsTUFBRyxFQUFFLEVBQUMsS0FBRyxLQUFFLE1BQUc7QUFBQTtBQUFHLFNBQVMsQ0FBQyxDQUFDLElBQUUsSUFBRSxLQUFFLEdBQUU7QUFBQSxFQUFDLE9BQU8sRUFBRSxDQUFDLElBQUUsSUFBRSxJQUFFLEVBQUM7QUFBQTtBQUFFLFNBQVMsQ0FBQyxDQUFDLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxLQUFFLE9BQUc7QUFBQSxFQUFDLE1BQU0sS0FBRSxLQUFFLEdBQUUseUJBQXVCLEdBQUUsb0JBQW1CLEtBQUUsRUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsTUFBRyxLQUFFO0FBQUEsRUFBRSxJQUFHO0FBQUEsSUFBRSxPQUFPO0FBQUEsRUFBRSxNQUFNLEtBQUUsRUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsTUFBRyxJQUFFO0FBQUEsRUFBRSxPQUFPLEdBQUUsT0FBTyxFQUFDO0FBQUE7QUFBRSxTQUFTLENBQUMsQ0FBQyxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFO0FBQUEsRUFBQyxNQUFNLEtBQUUsS0FBSyxJQUFJLEtBQUUsSUFBRSxDQUFDLElBQUUsS0FBSyxJQUFJLEtBQUUsSUFBRSxDQUFDLEdBQUUsS0FBRSxLQUFLLEtBQUssRUFBQztBQUFBLEVBQUUsSUFBSSxLQUFFO0FBQUEsRUFBRSxLQUFFLEtBQUUsTUFBSSxJQUFFLEtBQUUsTUFBSSxNQUFHLGFBQVUsS0FBRTtBQUFBLEVBQVMsSUFBSSxLQUFFLEdBQUUsdUJBQXFCO0FBQUEsRUFBRSxLQUFFLEtBQUUsTUFBSSxPQUFJLEtBQUUsS0FBRTtBQUFBLEVBQUksTUFBTSxLQUFFLEtBQUUsR0FBRSxLQUFFLE1BQUcsTUFBRyxFQUFFLEVBQUM7QUFBQSxFQUFFLElBQUksS0FBRSxHQUFFLFNBQU8sR0FBRSx1QkFBcUIsS0FBRSxNQUFHLEtBQUksS0FBRSxHQUFFLFNBQU8sR0FBRSx1QkFBcUIsS0FBRSxNQUFHO0FBQUEsRUFBSSxLQUFFLEVBQUUsSUFBRSxJQUFFLEVBQUMsR0FBRSxLQUFFLEVBQUUsSUFBRSxJQUFFLEVBQUM7QUFBQSxFQUFFLE1BQU0sS0FBRSxDQUFDLEdBQUUsS0FBRSxNQUFJLEVBQUUsSUFBRSxJQUFFLEVBQUMsR0FBRSxLQUFFLE1BQUksRUFBRSxJQUFFLElBQUUsRUFBQyxHQUFFLEtBQUUsR0FBRTtBQUFBLEVBQWlCLE9BQU8sT0FBSSxLQUFFLEdBQUUsS0FBSyxFQUFDLElBQUcsUUFBTyxNQUFLLENBQUMsTUFBRyxLQUFFLElBQUUsR0FBRSxJQUFHLE1BQUcsS0FBRSxJQUFFLEdBQUUsRUFBRSxFQUFDLENBQUMsSUFBRSxHQUFFLEtBQUssRUFBQyxJQUFHLFFBQU8sTUFBSyxDQUFDLE1BQUcsS0FBRSxJQUFFLEVBQUUsSUFBRSxJQUFFLEVBQUMsSUFBRyxNQUFHLEtBQUUsSUFBRSxFQUFFLElBQUUsSUFBRSxFQUFDLEVBQUUsRUFBQyxDQUFDLElBQUcsS0FBRSxHQUFFLEtBQUssRUFBQyxJQUFHLFlBQVcsTUFBSyxDQUFDLEtBQUUsTUFBRyxLQUFFLE1BQUcsS0FBRSxHQUFFLEdBQUUsS0FBRSxNQUFHLEtBQUUsTUFBRyxLQUFFLEdBQUUsR0FBRSxLQUFFLEtBQUUsS0FBRyxLQUFFLE1BQUcsS0FBRSxHQUFFLEdBQUUsS0FBRSxLQUFFLEtBQUcsS0FBRSxNQUFHLEtBQUUsR0FBRSxHQUFFLE1BQUcsS0FBRSxJQUFFLEdBQUUsSUFBRyxNQUFHLEtBQUUsSUFBRSxHQUFFLEVBQUUsRUFBQyxDQUFDLElBQUUsR0FBRSxLQUFLLEVBQUMsSUFBRyxZQUFXLE1BQUssQ0FBQyxLQUFFLE1BQUcsS0FBRSxNQUFHLEtBQUUsR0FBRSxHQUFFLEtBQUUsTUFBRyxLQUFFLE1BQUcsS0FBRSxHQUFFLEdBQUUsS0FBRSxLQUFFLEtBQUcsS0FBRSxNQUFHLEtBQUUsR0FBRSxHQUFFLEtBQUUsS0FBRSxLQUFHLEtBQUUsTUFBRyxLQUFFLEdBQUUsR0FBRSxNQUFHLEtBQUUsSUFBRSxHQUFFLElBQUcsTUFBRyxLQUFFLElBQUUsR0FBRSxFQUFFLEVBQUMsQ0FBQyxHQUFFO0FBQUE7QUFBRSxTQUFTLENBQUMsQ0FBQyxJQUFFLElBQUUsSUFBRTtBQUFBLEVBQUMsSUFBRyxDQUFDLEdBQUU7QUFBQSxJQUFPLE9BQU0sQ0FBQztBQUFBLEVBQUUsTUFBTSxLQUFFLENBQUM7QUFBQSxFQUFFLEdBQUUsS0FBSyxDQUFDLEdBQUUsR0FBRyxLQUFHLEVBQUUsSUFBRSxFQUFDLEdBQUUsR0FBRSxHQUFHLEtBQUcsRUFBRSxJQUFFLEVBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRSxLQUFLLENBQUMsR0FBRSxHQUFHLEtBQUcsRUFBRSxJQUFFLEVBQUMsR0FBRSxHQUFFLEdBQUcsS0FBRyxFQUFFLElBQUUsRUFBQyxDQUFDLENBQUM7QUFBQSxFQUFFLFNBQVEsS0FBRSxFQUFFLEtBQUUsR0FBRSxRQUFPO0FBQUEsSUFBSSxHQUFFLEtBQUssQ0FBQyxHQUFFLElBQUcsS0FBRyxFQUFFLElBQUUsRUFBQyxHQUFFLEdBQUUsSUFBRyxLQUFHLEVBQUUsSUFBRSxFQUFDLENBQUMsQ0FBQyxHQUFFLE9BQUksR0FBRSxTQUFPLEtBQUcsR0FBRSxLQUFLLENBQUMsR0FBRSxJQUFHLEtBQUcsRUFBRSxJQUFFLEVBQUMsR0FBRSxHQUFFLElBQUcsS0FBRyxFQUFFLElBQUUsRUFBQyxDQUFDLENBQUM7QUFBQSxFQUFFLE9BQU8sRUFBRSxJQUFFLE1BQUssRUFBQztBQUFBO0FBQUUsU0FBUyxDQUFDLENBQUMsSUFBRSxJQUFFLElBQUU7QUFBQSxFQUFDLE1BQU0sS0FBRSxHQUFFLFFBQU8sS0FBRSxDQUFDO0FBQUEsRUFBRSxJQUFHLEtBQUUsR0FBRTtBQUFBLElBQUMsTUFBTSxLQUFFLENBQUMsR0FBRSxLQUFFLElBQUUsR0FBRTtBQUFBLElBQWUsR0FBRSxLQUFLLEVBQUMsSUFBRyxRQUFPLE1BQUssQ0FBQyxHQUFFLEdBQUcsSUFBRyxHQUFFLEdBQUcsRUFBRSxFQUFDLENBQUM7QUFBQSxJQUFFLFNBQVEsS0FBRSxFQUFFLEtBQUUsSUFBRSxJQUFFLE1BQUk7QUFBQSxNQUFDLE1BQU0sS0FBRSxHQUFFO0FBQUEsTUFBRyxHQUFFLEtBQUcsQ0FBQyxHQUFFLElBQUcsR0FBRSxFQUFFLEdBQUUsR0FBRSxLQUFHLENBQUMsR0FBRSxNQUFJLEtBQUUsR0FBRSxLQUFFLEdBQUcsS0FBRyxLQUFFLEdBQUUsS0FBRSxHQUFHLE1BQUksR0FBRSxHQUFFLE1BQUksS0FBRSxHQUFFLEtBQUUsR0FBRyxLQUFHLEtBQUUsR0FBRSxLQUFFLEdBQUcsTUFBSSxDQUFDLEdBQUUsR0FBRSxLQUFHLENBQUMsR0FBRSxLQUFFLEdBQUcsTUFBSSxLQUFFLEdBQUUsSUFBRyxLQUFHLEtBQUUsR0FBRSxLQUFFLEdBQUcsTUFBSSxHQUFFLEdBQUUsS0FBRSxHQUFHLE1BQUksS0FBRSxHQUFFLElBQUcsS0FBRyxLQUFFLEdBQUUsS0FBRSxHQUFHLE1BQUksQ0FBQyxHQUFFLEdBQUUsS0FBRyxDQUFDLEdBQUUsS0FBRSxHQUFHLElBQUcsR0FBRSxLQUFFLEdBQUcsRUFBRSxHQUFFLEdBQUUsS0FBSyxFQUFDLElBQUcsWUFBVyxNQUFLLENBQUMsR0FBRSxHQUFHLElBQUcsR0FBRSxHQUFHLElBQUcsR0FBRSxHQUFHLElBQUcsR0FBRSxHQUFHLElBQUcsR0FBRSxHQUFHLElBQUcsR0FBRSxHQUFHLEVBQUUsRUFBQyxDQUFDO0FBQUEsSUFBQztBQUFBLElBQUMsSUFBRyxNQUFPLEdBQUUsV0FBTixHQUFhO0FBQUEsTUFBQyxNQUFNLEtBQUUsR0FBRTtBQUFBLE1BQW9CLEdBQUUsS0FBSyxFQUFDLElBQUcsVUFBUyxNQUFLLENBQUMsR0FBRSxLQUFHLEVBQUUsSUFBRSxFQUFDLEdBQUUsR0FBRSxLQUFHLEVBQUUsSUFBRSxFQUFDLENBQUMsRUFBQyxDQUFDO0FBQUEsSUFBQztBQUFBLEVBQUMsRUFBTTtBQUFBLElBQUksT0FBSixLQUFPLEdBQUUsS0FBSyxFQUFDLElBQUcsUUFBTyxNQUFLLENBQUMsR0FBRSxHQUFHLElBQUcsR0FBRSxHQUFHLEVBQUUsRUFBQyxDQUFDLEdBQUUsR0FBRSxLQUFLLEVBQUMsSUFBRyxZQUFXLE1BQUssQ0FBQyxHQUFFLEdBQUcsSUFBRyxHQUFFLEdBQUcsSUFBRyxHQUFFLEdBQUcsSUFBRyxHQUFFLEdBQUcsSUFBRyxHQUFFLEdBQUcsSUFBRyxHQUFFLEdBQUcsRUFBRSxFQUFDLENBQUMsS0FBTyxPQUFKLEtBQU8sR0FBRSxLQUFLLEdBQUcsRUFBRSxHQUFFLEdBQUcsSUFBRyxHQUFFLEdBQUcsSUFBRyxHQUFFLEdBQUcsSUFBRyxHQUFFLEdBQUcsSUFBRyxJQUFFLE1BQUcsSUFBRSxDQUFDO0FBQUEsRUFBRSxPQUFPO0FBQUE7QUFBRSxTQUFTLENBQUMsQ0FBQyxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUU7QUFBQSxFQUFDLE1BQU0sS0FBRSxDQUFDLEdBQUUsS0FBRSxDQUFDO0FBQUEsRUFBRSxJQUFPLEdBQUUsY0FBTixHQUFnQjtBQUFBLElBQUMsTUFBRyxHQUFFLEdBQUUsS0FBSyxDQUFDLEtBQUUsS0FBRSxLQUFLLElBQUksQ0FBQyxFQUFDLEdBQUUsS0FBRSxLQUFFLEtBQUssSUFBSSxDQUFDLEVBQUMsQ0FBQyxDQUFDO0FBQUEsSUFBRSxTQUFRLEtBQUUsRUFBRSxNQUFHLElBQUUsS0FBSyxJQUFHLE1BQUcsSUFBRTtBQUFBLE1BQUMsTUFBTSxLQUFFLENBQUMsS0FBRSxLQUFFLEtBQUssSUFBSSxFQUFDLEdBQUUsS0FBRSxLQUFFLEtBQUssSUFBSSxFQUFDLENBQUM7QUFBQSxNQUFFLEdBQUUsS0FBSyxFQUFDLEdBQUUsR0FBRSxLQUFLLEVBQUM7QUFBQSxJQUFDO0FBQUEsSUFBQyxHQUFFLEtBQUssQ0FBQyxLQUFFLEtBQUUsS0FBSyxJQUFJLENBQUMsR0FBRSxLQUFFLEtBQUUsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRSxLQUFLLENBQUMsS0FBRSxLQUFFLEtBQUssSUFBSSxFQUFDLEdBQUUsS0FBRSxLQUFFLEtBQUssSUFBSSxFQUFDLENBQUMsQ0FBQztBQUFBLEVBQUMsRUFBSztBQUFBLElBQUMsTUFBTSxLQUFFLEVBQUUsS0FBRyxFQUFDLElBQUUsS0FBSyxLQUFHO0FBQUEsSUFBRSxHQUFFLEtBQUssQ0FBQyxFQUFFLElBQUUsRUFBQyxJQUFFLEtBQUUsTUFBRyxLQUFFLEtBQUssSUFBSSxLQUFFLEVBQUMsR0FBRSxFQUFFLElBQUUsRUFBQyxJQUFFLEtBQUUsTUFBRyxLQUFFLEtBQUssSUFBSSxLQUFFLEVBQUMsQ0FBQyxDQUFDO0FBQUEsSUFBRSxNQUFNLEtBQUUsSUFBRSxLQUFLLEtBQUcsS0FBRTtBQUFBLElBQUksU0FBUSxLQUFFLEdBQUUsS0FBRSxJQUFFLE1BQUcsSUFBRTtBQUFBLE1BQUMsTUFBTSxLQUFFLENBQUMsRUFBRSxJQUFFLEVBQUMsSUFBRSxLQUFFLEtBQUUsS0FBSyxJQUFJLEVBQUMsR0FBRSxFQUFFLElBQUUsRUFBQyxJQUFFLEtBQUUsS0FBRSxLQUFLLElBQUksRUFBQyxDQUFDO0FBQUEsTUFBRSxHQUFFLEtBQUssRUFBQyxHQUFFLEdBQUUsS0FBSyxFQUFDO0FBQUEsSUFBQztBQUFBLElBQUMsR0FBRSxLQUFLLENBQUMsRUFBRSxJQUFFLEVBQUMsSUFBRSxLQUFFLEtBQUUsS0FBSyxJQUFJLEtBQUUsSUFBRSxLQUFLLEtBQUcsTUFBRyxFQUFDLEdBQUUsRUFBRSxJQUFFLEVBQUMsSUFBRSxLQUFFLEtBQUUsS0FBSyxJQUFJLEtBQUUsSUFBRSxLQUFLLEtBQUcsTUFBRyxFQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUUsS0FBSyxDQUFDLEVBQUUsSUFBRSxFQUFDLElBQUUsS0FBRSxPQUFJLEtBQUUsS0FBSyxJQUFJLEtBQUUsRUFBQyxHQUFFLEVBQUUsSUFBRSxFQUFDLElBQUUsS0FBRSxPQUFJLEtBQUUsS0FBSyxJQUFJLEtBQUUsRUFBQyxDQUFDLENBQUMsR0FBRSxHQUFFLEtBQUssQ0FBQyxFQUFFLElBQUUsRUFBQyxJQUFFLEtBQUUsTUFBRyxLQUFFLEtBQUssSUFBSSxLQUFFLE1BQUcsRUFBQyxHQUFFLEVBQUUsSUFBRSxFQUFDLElBQUUsS0FBRSxNQUFHLEtBQUUsS0FBSyxJQUFJLEtBQUUsTUFBRyxFQUFDLENBQUMsQ0FBQztBQUFBO0FBQUEsRUFBRSxPQUFNLENBQUMsSUFBRSxFQUFDO0FBQUE7QUFBRSxTQUFTLENBQUMsQ0FBQyxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRTtBQUFBLEVBQUMsTUFBTSxLQUFFLEtBQUUsRUFBRSxLQUFHLEVBQUMsR0FBRSxLQUFFLENBQUM7QUFBQSxFQUFFLEdBQUUsS0FBSyxDQUFDLEVBQUUsSUFBRSxFQUFDLElBQUUsS0FBRSxNQUFHLEtBQUUsS0FBSyxJQUFJLEtBQUUsRUFBQyxHQUFFLEVBQUUsSUFBRSxFQUFDLElBQUUsS0FBRSxNQUFHLEtBQUUsS0FBSyxJQUFJLEtBQUUsRUFBQyxDQUFDLENBQUM7QUFBQSxFQUFFLFNBQVEsS0FBRSxHQUFFLE1BQUcsSUFBRSxNQUFHO0FBQUEsSUFBRSxHQUFFLEtBQUssQ0FBQyxFQUFFLElBQUUsRUFBQyxJQUFFLEtBQUUsS0FBRSxLQUFLLElBQUksRUFBQyxHQUFFLEVBQUUsSUFBRSxFQUFDLElBQUUsS0FBRSxLQUFFLEtBQUssSUFBSSxFQUFDLENBQUMsQ0FBQztBQUFBLEVBQUUsT0FBTyxHQUFFLEtBQUssQ0FBQyxLQUFFLEtBQUUsS0FBSyxJQUFJLEVBQUMsR0FBRSxLQUFFLEtBQUUsS0FBSyxJQUFJLEVBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRSxLQUFLLENBQUMsS0FBRSxLQUFFLEtBQUssSUFBSSxFQUFDLEdBQUUsS0FBRSxLQUFFLEtBQUssSUFBSSxFQUFDLENBQUMsQ0FBQyxHQUFFLEVBQUUsSUFBRSxNQUFLLEVBQUM7QUFBQTtBQUFFLFNBQVMsQ0FBQyxDQUFDLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRTtBQUFBLEVBQUMsTUFBTSxLQUFFLENBQUMsR0FBRSxLQUFFLENBQUMsR0FBRSx1QkFBcUIsSUFBRyxHQUFFLHVCQUFxQixLQUFHLEdBQUU7QUFBQSxFQUFFLElBQUksS0FBRSxDQUFDLEdBQUUsQ0FBQztBQUFBLEVBQUUsTUFBTSxLQUFFLEdBQUUscUJBQW1CLElBQUUsR0FBRSxLQUFFLEdBQUU7QUFBQSxFQUFpQixTQUFRLEtBQUUsRUFBRSxLQUFFLElBQUU7QUFBQSxJQUFRLE9BQUosSUFBTSxHQUFFLEtBQUssRUFBQyxJQUFHLFFBQU8sTUFBSyxDQUFDLEdBQUUsSUFBRyxHQUFFLEVBQUUsRUFBQyxDQUFDLElBQUUsR0FBRSxLQUFLLEVBQUMsSUFBRyxRQUFPLE1BQUssQ0FBQyxHQUFFLE1BQUksS0FBRSxJQUFFLEVBQUUsR0FBRSxJQUFHLEVBQUMsSUFBRyxHQUFFLE1BQUksS0FBRSxJQUFFLEVBQUUsR0FBRSxJQUFHLEVBQUMsRUFBRSxFQUFDLENBQUMsR0FBRSxLQUFFLEtBQUUsQ0FBQyxJQUFFLEVBQUMsSUFBRSxDQUFDLEtBQUUsRUFBRSxHQUFFLEtBQUcsRUFBQyxHQUFFLEtBQUUsRUFBRSxHQUFFLEtBQUcsRUFBQyxDQUFDLEdBQUUsR0FBRSxLQUFLLEVBQUMsSUFBRyxZQUFXLE1BQUssQ0FBQyxLQUFFLEVBQUUsR0FBRSxLQUFHLEVBQUMsR0FBRSxLQUFFLEVBQUUsR0FBRSxLQUFHLEVBQUMsR0FBRSxLQUFFLEVBQUUsR0FBRSxLQUFHLEVBQUMsR0FBRSxLQUFFLEVBQUUsR0FBRSxLQUFHLEVBQUMsR0FBRSxHQUFFLElBQUcsR0FBRSxFQUFFLEVBQUMsQ0FBQztBQUFBLEVBQUUsT0FBTztBQUFBO0FBQUUsU0FBUyxDQUFDLENBQUMsSUFBRTtBQUFBLEVBQUMsT0FBTSxDQUFDLEdBQUcsRUFBQztBQUFBO0FBQUUsU0FBUyxDQUFDLENBQUMsSUFBRSxLQUFFLEdBQUU7QUFBQSxFQUFDLE1BQU0sS0FBRSxHQUFFO0FBQUEsRUFBTyxJQUFHLEtBQUU7QUFBQSxJQUFFLE1BQU0sSUFBSSxNQUFNLDBDQUEwQztBQUFBLEVBQUUsTUFBTSxLQUFFLENBQUM7QUFBQSxFQUFFLElBQU8sT0FBSjtBQUFBLElBQU0sR0FBRSxLQUFLLEVBQUUsR0FBRSxFQUFFLEdBQUUsRUFBRSxHQUFFLEVBQUUsR0FBRSxFQUFFLEdBQUUsRUFBRSxHQUFFLEVBQUUsR0FBRSxFQUFFLENBQUM7QUFBQSxFQUFNO0FBQUEsSUFBQyxNQUFNLEtBQUUsQ0FBQztBQUFBLElBQUUsR0FBRSxLQUFLLEdBQUUsSUFBRyxHQUFFLEVBQUU7QUFBQSxJQUFFLFNBQVEsS0FBRSxFQUFFLEtBQUUsR0FBRSxRQUFPO0FBQUEsTUFBSSxHQUFFLEtBQUssR0FBRSxHQUFFLEdBQUUsT0FBSSxHQUFFLFNBQU8sS0FBRyxHQUFFLEtBQUssR0FBRSxHQUFFO0FBQUEsSUFBRSxNQUFNLEtBQUUsQ0FBQyxHQUFFLEtBQUUsSUFBRTtBQUFBLElBQUUsR0FBRSxLQUFLLEVBQUUsR0FBRSxFQUFFLENBQUM7QUFBQSxJQUFFLFNBQVEsS0FBRSxFQUFFLEtBQUUsSUFBRSxHQUFFLFFBQU8sTUFBSTtBQUFBLE1BQUMsTUFBTSxLQUFFLEdBQUU7QUFBQSxNQUFHLEdBQUUsS0FBRyxDQUFDLEdBQUUsSUFBRyxHQUFFLEVBQUUsR0FBRSxHQUFFLEtBQUcsQ0FBQyxHQUFFLE1BQUksS0FBRSxHQUFFLEtBQUUsR0FBRyxLQUFHLEtBQUUsR0FBRSxLQUFFLEdBQUcsTUFBSSxHQUFFLEdBQUUsTUFBSSxLQUFFLEdBQUUsS0FBRSxHQUFHLEtBQUcsS0FBRSxHQUFFLEtBQUUsR0FBRyxNQUFJLENBQUMsR0FBRSxHQUFFLEtBQUcsQ0FBQyxHQUFFLEtBQUUsR0FBRyxNQUFJLEtBQUUsR0FBRSxJQUFHLEtBQUcsS0FBRSxHQUFFLEtBQUUsR0FBRyxNQUFJLEdBQUUsR0FBRSxLQUFFLEdBQUcsTUFBSSxLQUFFLEdBQUUsSUFBRyxLQUFHLEtBQUUsR0FBRSxLQUFFLEdBQUcsTUFBSSxDQUFDLEdBQUUsR0FBRSxLQUFHLENBQUMsR0FBRSxLQUFFLEdBQUcsSUFBRyxHQUFFLEtBQUUsR0FBRyxFQUFFLEdBQUUsR0FBRSxLQUFLLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxFQUFFO0FBQUEsSUFBQztBQUFBO0FBQUEsRUFBRSxPQUFPO0FBQUE7QUFBRSxTQUFTLENBQUMsQ0FBQyxJQUFFLElBQUU7QUFBQSxFQUFDLE9BQU8sS0FBSyxJQUFJLEdBQUUsS0FBRyxHQUFFLElBQUcsQ0FBQyxJQUFFLEtBQUssSUFBSSxHQUFFLEtBQUcsR0FBRSxJQUFHLENBQUM7QUFBQTtBQUFFLFNBQVMsQ0FBQyxDQUFDLElBQUUsSUFBRSxJQUFFO0FBQUEsRUFBQyxNQUFNLEtBQUUsRUFBRSxJQUFFLEVBQUM7QUFBQSxFQUFFLElBQU8sT0FBSjtBQUFBLElBQU0sT0FBTyxFQUFFLElBQUUsRUFBQztBQUFBLEVBQUUsSUFBSSxPQUFJLEdBQUUsS0FBRyxHQUFFLE9BQUssR0FBRSxLQUFHLEdBQUUsT0FBSyxHQUFFLEtBQUcsR0FBRSxPQUFLLEdBQUUsS0FBRyxHQUFFLE9BQUs7QUFBQSxFQUFFLE9BQU8sS0FBRSxLQUFLLElBQUksR0FBRSxLQUFLLElBQUksR0FBRSxFQUFDLENBQUMsR0FBRSxFQUFFLElBQUUsRUFBRSxJQUFFLElBQUUsRUFBQyxDQUFDO0FBQUE7QUFBRSxTQUFTLENBQUMsQ0FBQyxJQUFFLElBQUUsSUFBRTtBQUFBLEVBQUMsT0FBTSxDQUFDLEdBQUUsTUFBSSxHQUFFLEtBQUcsR0FBRSxNQUFJLElBQUUsR0FBRSxNQUFJLEdBQUUsS0FBRyxHQUFFLE1BQUksRUFBQztBQUFBO0FBQUUsU0FBUyxDQUFDLENBQUMsSUFBRSxJQUFFLElBQUUsSUFBRTtBQUFBLEVBQUMsTUFBTSxLQUFFLE1BQUcsQ0FBQztBQUFBLEVBQUUsSUFBRyxRQUFRLENBQUMsSUFBRSxJQUFFO0FBQUEsSUFBQyxNQUFNLEtBQUUsR0FBRSxLQUFFLElBQUcsS0FBRSxHQUFFLEtBQUUsSUFBRyxLQUFFLEdBQUUsS0FBRSxJQUFHLEtBQUUsR0FBRSxLQUFFO0FBQUEsSUFBRyxJQUFJLEtBQUUsSUFBRSxHQUFFLEtBQUcsSUFBRSxHQUFFLEtBQUcsR0FBRTtBQUFBLElBQUcsTUFBRztBQUFBLElBQUUsSUFBSSxLQUFFLElBQUUsR0FBRSxLQUFHLElBQUUsR0FBRSxLQUFHLEdBQUU7QUFBQSxJQUFHLE1BQUc7QUFBQSxJQUFFLElBQUksS0FBRSxJQUFFLEdBQUUsS0FBRyxJQUFFLEdBQUUsS0FBRyxHQUFFO0FBQUEsSUFBRyxNQUFHO0FBQUEsSUFBRSxJQUFJLEtBQUUsSUFBRSxHQUFFLEtBQUcsSUFBRSxHQUFFLEtBQUcsR0FBRTtBQUFBLElBQUcsT0FBTyxNQUFHLElBQUUsS0FBRSxPQUFJLEtBQUUsS0FBRyxLQUFFLE9BQUksS0FBRSxLQUFHLEtBQUU7QUFBQSxJQUFHLElBQUUsRUFBQyxJQUFFLElBQUU7QUFBQSxJQUFDLE1BQU0sS0FBRSxHQUFFLEtBQUU7QUFBQSxJQUFHLElBQUcsR0FBRSxRQUFPO0FBQUEsT0FBRSxLQUFFLEdBQUUsR0FBRSxTQUFPLElBQUcsS0FBRSxJQUFFLEtBQUssS0FBSyxFQUFFLElBQUUsRUFBQyxDQUFDLEtBQUcsS0FBRyxHQUFFLEtBQUssRUFBQztBQUFBLElBQUMsRUFBTTtBQUFBLFNBQUUsS0FBSyxFQUFDO0FBQUEsSUFBRSxHQUFFLEtBQUssR0FBRSxLQUFFLEVBQUU7QUFBQSxFQUFDLEVBQUs7QUFBQSxJQUFDLE1BQU0sS0FBRSxLQUFHLEtBQUUsR0FBRSxLQUFFLElBQUcsS0FBRSxHQUFFLEtBQUUsSUFBRyxLQUFFLEdBQUUsS0FBRSxJQUFHLEtBQUUsR0FBRSxLQUFFLElBQUcsS0FBRSxFQUFFLElBQUUsSUFBRSxFQUFDLEdBQUUsS0FBRSxFQUFFLElBQUUsSUFBRSxFQUFDLEdBQUUsS0FBRSxFQUFFLElBQUUsSUFBRSxFQUFDLEdBQUUsS0FBRSxFQUFFLElBQUUsSUFBRSxFQUFDLEdBQUUsS0FBRSxFQUFFLElBQUUsSUFBRSxFQUFDLEdBQUUsS0FBRSxFQUFFLElBQUUsSUFBRSxFQUFDO0FBQUEsSUFBRSxFQUFFLENBQUMsSUFBRSxJQUFFLElBQUUsRUFBQyxHQUFFLEdBQUUsSUFBRSxFQUFDLEdBQUUsRUFBRSxDQUFDLElBQUUsSUFBRSxJQUFFLEVBQUMsR0FBRSxHQUFFLElBQUUsRUFBQztBQUFBO0FBQUEsRUFBRSxJQUFJLElBQUU7QUFBQSxFQUFFLE9BQU87QUFBQTtBQUFFLFNBQVMsQ0FBQyxDQUFDLElBQUUsSUFBRTtBQUFBLEVBQUMsT0FBTyxFQUFFLElBQUUsR0FBRSxHQUFFLFFBQU8sRUFBQztBQUFBO0FBQUUsU0FBUyxDQUFDLENBQUMsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFO0FBQUEsRUFBQyxNQUFNLEtBQUUsTUFBRyxDQUFDLEdBQUUsS0FBRSxHQUFFLEtBQUcsS0FBRSxHQUFFLEtBQUU7QUFBQSxFQUFHLElBQUksS0FBRSxHQUFFLEtBQUU7QUFBQSxFQUFFLFNBQVEsS0FBRSxLQUFFLEVBQUUsS0FBRSxLQUFFLEdBQUUsRUFBRSxJQUFFO0FBQUEsSUFBQyxNQUFNLEtBQUUsRUFBRSxHQUFFLEtBQUcsSUFBRSxFQUFDO0FBQUEsSUFBRSxLQUFFLE9BQUksS0FBRSxJQUFFLEtBQUU7QUFBQSxFQUFFO0FBQUEsRUFBQyxPQUFPLEtBQUssS0FBSyxFQUFDLElBQUUsTUFBRyxFQUFFLElBQUUsSUFBRSxLQUFFLEdBQUUsSUFBRSxFQUFDLEdBQUUsRUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLEVBQUMsTUFBSSxHQUFFLFVBQVEsR0FBRSxLQUFLLEVBQUMsR0FBRSxHQUFFLEtBQUssRUFBQyxJQUFHO0FBQUE7QUFBRSxTQUFT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QUUsSUFBRSxFQUFDLEVBQUU7QUFBQSxRQUFNLEdBQUUsT0FBSyxZQUFXLEdBQUUsS0FBSyxFQUFDO0FBQUEsTUFBQyxFQUFNO0FBQUEsV0FBRSxLQUFLLEVBQUUsQ0FBQyxHQUFFLGVBQWUsR0FBRSxFQUFDLENBQUM7QUFBQSxJQUFFLE9BQU8sR0FBRSxXQUFTLE1BQUksR0FBRSxLQUFLLEdBQUUsS0FBSyxHQUFFLEtBQUssR0FBRyxXQUFVLElBQUUsRUFBQztBQUFBO0FBQUEsRUFBRSxNQUFNLENBQUMsSUFBRSxJQUFFLElBQUUsSUFBRTtBQUFBLElBQUMsTUFBTSxLQUFFLEtBQUssUUFBUSxJQUFFLElBQUUsSUFBRSxJQUFFLEVBQUM7QUFBQSxJQUFFLE9BQU8sR0FBRSxRQUFNLFVBQVM7QUFBQTtBQUFBLEVBQUUsVUFBVSxDQUFDLElBQUUsSUFBRTtBQUFBLElBQUMsTUFBTSxLQUFFLEtBQUssR0FBRyxFQUFDO0FBQUEsSUFBRSxPQUFPLEtBQUssR0FBRyxjQUFhLENBQUMsRUFBRSxJQUFFLE9BQUcsRUFBQyxDQUFDLEdBQUUsRUFBQztBQUFBO0FBQUEsRUFBRSxHQUFHLENBQUMsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsS0FBRSxPQUFHLElBQUU7QUFBQSxJQUFDLE1BQU0sS0FBRSxLQUFLLEdBQUcsRUFBQyxHQUFFLEtBQUUsQ0FBQyxHQUFFLEtBQUUsRUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLE1BQUcsRUFBQztBQUFBLElBQUUsSUFBRyxNQUFHLEdBQUU7QUFBQSxNQUFLLElBQWEsR0FBRSxjQUFaLFNBQXNCO0FBQUEsUUFBQyxNQUFNLEtBQUUsT0FBTyxPQUFPLENBQUMsR0FBRSxFQUFDO0FBQUEsUUFBRSxHQUFFLHFCQUFtQjtBQUFBLFFBQUcsTUFBTSxLQUFFLEVBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsTUFBRyxPQUFHLEVBQUM7QUFBQSxRQUFFLEdBQUUsT0FBSyxZQUFXLEdBQUUsS0FBSyxFQUFDO0FBQUEsTUFBQyxFQUFNO0FBQUEsV0FBRSxLQUFLLFFBQVEsQ0FBQyxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFO0FBQUEsVUFBQyxNQUFNLEtBQUUsSUFBRSxLQUFFO0FBQUEsVUFBRSxJQUFJLEtBQUUsS0FBSyxJQUFJLEtBQUUsQ0FBQyxHQUFFLEtBQUUsS0FBSyxJQUFJLEtBQUUsQ0FBQztBQUFBLFVBQUUsTUFBRyxFQUFFLE9BQUksSUFBRSxFQUFDLEdBQUUsTUFBRyxFQUFFLE9BQUksSUFBRSxFQUFDO0FBQUEsVUFBRSxJQUFJLEtBQUUsSUFBRSxLQUFFO0FBQUEsVUFBRSxNQUFLLEtBQUU7QUFBQSxZQUFHLE1BQUcsSUFBRSxLQUFLLElBQUcsTUFBRyxJQUFFLEtBQUs7QUFBQSxVQUFHLEtBQUUsS0FBRSxJQUFFLEtBQUssT0FBSyxLQUFFLEdBQUUsS0FBRSxJQUFFLEtBQUs7QUFBQSxVQUFJLE1BQU0sTUFBRyxLQUFFLE1BQUcsR0FBRSxnQkFBZSxLQUFFLENBQUM7QUFBQSxVQUFFLFNBQVEsS0FBRSxHQUFFLE1BQUcsSUFBRSxNQUFHO0FBQUEsWUFBRSxHQUFFLEtBQUssQ0FBQyxLQUFFLEtBQUUsS0FBSyxJQUFJLEVBQUMsR0FBRSxLQUFFLEtBQUUsS0FBSyxJQUFJLEVBQUMsQ0FBQyxDQUFDO0FBQUEsVUFBRSxPQUFPLEdBQUUsS0FBSyxDQUFDLEtBQUUsS0FBRSxLQUFLLElBQUksRUFBQyxHQUFFLEtBQUUsS0FBRSxLQUFLLElBQUksRUFBQyxDQUFDLENBQUMsR0FBRSxHQUFFLEtBQUssQ0FBQyxJQUFFLEVBQUMsQ0FBQyxHQUFFLEVBQUUsQ0FBQyxFQUFDLEdBQUUsRUFBQztBQUFBLFVBQUcsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsRUFBQyxDQUFDO0FBQUEsSUFBRSxPQUFPLEdBQUUsV0FBUyxNQUFJLEdBQUUsS0FBSyxFQUFDLEdBQUUsS0FBSyxHQUFHLE9BQU0sSUFBRSxFQUFDO0FBQUE7QUFBQSxFQUFFLEtBQUssQ0FBQyxJQUFFLElBQUU7QUFBQSxJQUFDLE1BQU0sS0FB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QUM7QUFBQSxTQUFHLEtBQUUsTUFBSTtBQUFBLFFBQUMsR0FBRSxHQUFFLEdBQUUsV0FBUyxHQUFFLEtBQUssRUFBQyxHQUFFLEtBQUUsQ0FBQztBQUFBO0FBQUEsTUFBSSxhQUFVLEtBQUksSUFBRSxNQUFLLFFBQUs7QUFBQSxRQUFFLFFBQU87QUFBQSxlQUFPO0FBQUEsWUFBSSxHQUFFLEdBQUUsS0FBRSxDQUFDLEdBQUUsSUFBRyxHQUFFLEVBQUUsR0FBRSxHQUFFLEtBQUssRUFBQztBQUFBLFlBQUU7QUFBQSxlQUFVO0FBQUEsWUFBSSxHQUFFLEdBQUUsR0FBRSxLQUFLLENBQUMsR0FBRSxJQUFHLEdBQUUsRUFBRSxDQUFDO0FBQUEsWUFBRTtBQUFBLGVBQVU7QUFBQSxZQUFJLElBQUcsQ0FBQyxHQUFFLFFBQU87QUFBQSxjQUFDLE1BQU0sS0FBRSxHQUFFLFNBQU8sR0FBRSxHQUFFLFNBQU8sS0FBRztBQUFBLGNBQUUsR0FBRSxLQUFLLENBQUMsR0FBRSxJQUFHLEdBQUUsRUFBRSxDQUFDO0FBQUEsWUFBQztBQUFBLFlBQUMsR0FBRSxLQUFLLENBQUMsR0FBRSxJQUFHLEdBQUUsRUFBRSxDQUFDLEdBQUUsR0FBRSxLQUFLLENBQUMsR0FBRSxJQUFHLEdBQUUsRUFBRSxDQUFDLEdBQUUsR0FBRSxLQUFLLENBQUMsR0FBRSxJQUFHLEdBQUUsRUFBRSxDQUFDO0FBQUEsWUFBRTtBQUFBLGVBQVU7QUFBQSxZQUFJLEdBQUUsR0FBRSxHQUFFLEtBQUssQ0FBQyxHQUFFLElBQUcsR0FBRSxFQUFFLENBQUM7QUFBQTtBQUFBLE1BQUUsSUFBRyxHQUFFLEdBQUUsQ0FBQztBQUFBLFFBQUUsT0FBTztBQUFBLE1BQUUsTUFBTSxLQUFFLENBQUM7QUFBQSxNQUFFLFdBQVUsTUFBSyxJQUFFO0FBQUEsUUFBQyxNQUFNLEtBQUUsRUFBRSxJQUFFLEVBQUM7QUFBQSxRQUFFLEdBQUUsVUFBUSxHQUFFLEtBQUssRUFBQztBQUFBLE1BQUM7QUFBQSxNQUFDLE9BQU87QUFBQSxNQUFHLElBQUUsR0FBRSxLQUFFLElB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QUMsR0FBRTtBQUFBO0FBQUEsRUFBRSxTQUFTLENBQUMsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFO0FBQUEsSUFBQyxNQUFNLEtBQUUsS0FBSyxJQUFJLFVBQVUsSUFBRSxJQUFFLElBQUUsSUFBRSxFQUFDO0FBQUEsSUFBRSxPQUFPLEtBQUssS0FBSyxFQUFDLEdBQUU7QUFBQTtBQUFBLEVBQUUsT0FBTyxDQUFDLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRTtBQUFBLElBQUMsTUFBTSxLQUFFLEtBQUssSUFBSSxRQUFRLElBQUUsSUFBRSxJQUFFLElBQUUsRUFBQztBQUFBLElBQUUsT0FBTyxLQUFLLEtBQUssRUFBQyxHQUFFO0FBQUE7QUFBQSxFQUFFLE1BQU0sQ0FBQyxJQUFFLElBQUUsSUFBRSxJQUFFO0FBQUEsSUFBQyxNQUFNLEtBQUUsS0FBSyxJQUFJLE9BQU8sSUFBRSxJQUFFLElBQUUsRUFBQztBQUFBLElBQUUsT0FBTyxLQUFLLEtBQUssRUFBQyxHQUFFO0FBQUE7QUFBQSxFQUFFLFVBQVUsQ0FBQyxJQUFFLElBQUU7QUFBQSxJQUFDLE1BQU0sS0FBRSxLQUFLLElBQUksV0FBVyxJQUFFLEVBQUM7QUFBQSxJQUFFLE9BQU8sS0FBSyxLQUFLLEVBQUMsR0FBRTtBQUFBO0FBQUEsRUFBRSxPQUFPLENBQUMsSUFBRSxJQUFFO0FBQUEsSUFBQyxNQUFNLEtBQUUsS0FBSyxJQUFJLFFBQVEsSUFBRSxFQUFDO0FBQUEsSUFBRSxPQUFPLEtBQUssS0FBSyxFQUFDLEdBQUU7QUFBQTtBQUFBLEVBQUUsR0FBRyxDQUFDLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLEtBQUUsT0FBRyxJQUFFO0FBQUEsSUFBQyxNQUFNLEtBQUUsS0FBSyxJQUFJLElBQUksSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxFQUFDO0FBQUEsSUFBRSxPQUFPLEtBQUssS0FBSyxFQUFDLEdBQUU7QUFBQTtBQUFBLEVBQUUsS0FBSyxDQUFDLElBQUUsSUFBRTtBQUFBLElBQUMsTUFBTSxLQUFFLEtB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QUFDO0FBQUE7QUFBQSxFQUFFLElBQUksQ0FBQyxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUU7QUFBQSxJQUFDLE1BQU0sS0FBRSxLQUFLLElBQUksS0FBSyxJQUFFLElBQUUsSUFBRSxJQUFFLEVBQUM7QUFBQSxJQUFFLE9BQU8sS0FBSyxLQUFLLEVBQUM7QUFBQTtBQUFBLEVBQUUsU0FBUyxDQUFDLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRTtBQUFBLElBQUMsTUFBTSxLQUFFLEtBQUssSUFBSSxVQUFVLElBQUUsSUFBRSxJQUFFLElBQUUsRUFBQztBQUFBLElBQUUsT0FBTyxLQUFLLEtBQUssRUFBQztBQUFBO0FBQUEsRUFBRSxPQUFPLENBQUMsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFO0FBQUEsSUFBQyxNQUFNLEtBQUUsS0FBSyxJQUFJLFFBQVEsSUFBRSxJQUFFLElBQUUsSUFBRSxFQUFDO0FBQUEsSUFBRSxPQUFPLEtBQUssS0FBSyxFQUFDO0FBQUE7QUFBQSxFQUFFLE1BQU0sQ0FBQyxJQUFFLElBQUUsSUFBRSxJQUFFO0FBQUEsSUFBQyxNQUFNLEtBQUUsS0FBSyxJQUFJLE9BQU8sSUFBRSxJQUFFLElBQUUsRUFBQztBQUFBLElBQUUsT0FBTyxLQUFLLEtBQUssRUFBQztBQUFBO0FBQUEsRUFBRSxVQUFVLENBQUMsSUFBRSxJQUFFO0FBQUEsSUFBQyxNQUFNLEtBQUUsS0FBSyxJQUFJLFdBQVcsSUFBRSxFQUFDO0FBQUEsSUFBRSxPQUFPLEtBQUssS0FBSyxFQUFDO0FBQUE7QUFBQSxFQUFFLE9BQU8sQ0FBQyxJQUFFLElBQUU7QUFBQSxJQUFDLE1BQU0sS0FBRSxLQUFLLElBQUksUUFBUSxJQUFFLEVBQUM7QUFBQSxJQUFFLE9BQU8sS0FBSyxLQUFLLEVBQUM7QUFBQTtBQUFBLEVBQUUsR0FBRyxDQUFDLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLEtBQUUsT0FBRyxJQUFFO0FBQUEsSUFBQyxNQUFNLEtBQUUsS0FBSyxJQUFJLElBQUksSUFBRSxJQUFFLElBQUUsSUFBRSxJQUFFLElBQUUsSUFBRSxFQUFDO0FBQUEsSUFBRSxPQUFPLEtBQUssS0FBSyxFQUFDO0FBQUE7QUFBQSxFQUFFLEtBQUssQ0FBQyxJQUFFLElBQUU7QUFBQSxJQUFDLE1BQU0sS0FBRSxLQUFLLElBQUksTUFBTSxJQUFFLEVBQUM7QUFBQSxJQUFFLE9BQU8sS0FBSyxLQUFLLEVBQUM7QUFBQTtBQUFBLEVBQUUsSUFBSSxDQUFDLElBQUUsSUFBRTtBQUFBLElBQUMsTUFBTSxLQUFFLEtBQUssSUFBSSxLQUFLLElBQUUsRUFBQztBQUFBLElBQUUsT0FBTyxLQUFLLEtBQUssRUFBQztBQUFBO0FBQUU7QUFBQyxJQUFJLEtBQUcsRUFBQyxRQUFPLENBQUMsSUFBRSxPQUFJLElBQUksR0FBRyxJQUFFLEVBQUMsR0FBRSxLQUFJLENBQUMsSUFBRSxPQUFJLElBQUksR0FBRyxJQUFFLEVBQUMsR0FBRSxXQUFVLFFBQUcsSUFBSSxHQUFHLEVBQUMsR0FBRSxTQUFRLE1BQUksR0FBRyxRQUFRLEVBQUM7IiwKICAiZGVidWdJZCI6ICI3QTkzODNDNTMyMkYzQTExNjQ3NTZFMjE2NDc1NkUyMSIsCiAgIm5hbWVzIjogW10KfQ==
