import {
  selectSvgElement
} from "./chunk-main-f3t3xmmb.js";
import {
  at
} from "./chunk-main-2se6cwec.js";
import {
  cleanAndMerge
} from "./chunk-main-vvfzntzy.js";
import"./chunk-main-ck580f0k.js";
import {
  clear,
  configureSvgSize,
  darken_default,
  defaultConfig_default,
  getAccDescription,
  getAccTitle,
  getConfig,
  getDiagramTitle,
  is_dark_default,
  lighten_default,
  setAccDescription,
  setAccTitle,
  setDiagramTitle,
  transparentize_default
} from "./chunk-main-aws590jt.js";
import {
  __name,
  select_default
} from "./chunk-main-vcnyggwp.js";
import"./chunk-main-g8wf8be2.js";

// node_modules/@upsetjs/venn.js/build/venn.esm.js
var SMALL$1 = 0.0000000001;
function intersectionArea(circles, stats) {
  const intersectionPoints = getIntersectionPoints(circles);
  const innerPoints = intersectionPoints.filter((p) => containedInCircles(p, circles));
  let arcArea = 0;
  let polygonArea = 0;
  const arcs = [];
  if (innerPoints.length > 1) {
    const center = getCenter(innerPoints);
    for (let i = 0;i < innerPoints.length; ++i) {
      const p = innerPoints[i];
      p.angle = Math.atan2(p.x - center.x, p.y - center.y);
    }
    innerPoints.sort((a, b) => b.angle - a.angle);
    let p2 = innerPoints[innerPoints.length - 1];
    for (let i = 0;i < innerPoints.length; ++i) {
      const p1 = innerPoints[i];
      polygonArea += (p2.x + p1.x) * (p1.y - p2.y);
      const midPoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      let arc = null;
      for (let j = 0;j < p1.parentIndex.length; ++j) {
        if (p2.parentIndex.includes(p1.parentIndex[j])) {
          const circle = circles[p1.parentIndex[j]];
          const a1 = Math.atan2(p1.x - circle.x, p1.y - circle.y);
          const a2 = Math.atan2(p2.x - circle.x, p2.y - circle.y);
          let angleDiff = a2 - a1;
          if (angleDiff < 0) {
            angleDiff += 2 * Math.PI;
          }
          const a = a2 - angleDiff / 2;
          let width = distance(midPoint, {
            x: circle.x + circle.radius * Math.sin(a),
            y: circle.y + circle.radius * Math.cos(a)
          });
          if (width > circle.radius * 2) {
            width = circle.radius * 2;
          }
          if (arc == null || arc.width > width) {
            arc = { circle, width, p1, p2, large: width > circle.radius, sweep: true };
          }
        }
      }
      if (arc != null) {
        arcs.push(arc);
        arcArea += circleArea(arc.circle.radius, arc.width);
        p2 = p1;
      }
    }
  } else {
    let smallest = circles[0];
    for (let i = 1;i < circles.length; ++i) {
      if (circles[i].radius < smallest.radius) {
        smallest = circles[i];
      }
    }
    let disjoint = false;
    for (let i = 0;i < circles.length; ++i) {
      if (distance(circles[i], smallest) > Math.abs(smallest.radius - circles[i].radius)) {
        disjoint = true;
        break;
      }
    }
    if (disjoint) {
      arcArea = polygonArea = 0;
    } else {
      arcArea = smallest.radius * smallest.radius * Math.PI;
      arcs.push({
        circle: smallest,
        p1: { x: smallest.x, y: smallest.y + smallest.radius },
        p2: { x: smallest.x - SMALL$1, y: smallest.y + smallest.radius },
        width: smallest.radius * 2,
        large: true,
        sweep: true
      });
    }
  }
  polygonArea /= 2;
  if (stats) {
    stats.area = arcArea + polygonArea;
    stats.arcArea = arcArea;
    stats.polygonArea = polygonArea;
    stats.arcs = arcs;
    stats.innerPoints = innerPoints;
    stats.intersectionPoints = intersectionPoints;
  }
  return arcArea + polygonArea;
}
function containedInCircles(point, circles) {
  return circles.every((circle) => distance(point, circle) < circle.radius + SMALL$1);
}
function getIntersectionPoints(circles) {
  const ret = [];
  for (let i = 0;i < circles.length; ++i) {
    for (let j = i + 1;j < circles.length; ++j) {
      const intersect = circleCircleIntersection(circles[i], circles[j]);
      for (const p of intersect) {
        p.parentIndex = [i, j];
        ret.push(p);
      }
    }
  }
  return ret;
}
function circleArea(r, width) {
  return r * r * Math.acos(1 - width / r) - (r - width) * Math.sqrt(width * (2 * r - width));
}
function distance(p1, p2) {
  return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
}
function circleOverlap(r1, r2, d) {
  if (d >= r1 + r2) {
    return 0;
  }
  if (d <= Math.abs(r1 - r2)) {
    return Math.PI * Math.min(r1, r2) * Math.min(r1, r2);
  }
  const w1 = r1 - (d * d - r2 * r2 + r1 * r1) / (2 * d);
  const w2 = r2 - (d * d - r1 * r1 + r2 * r2) / (2 * d);
  return circleArea(r1, w1) + circleArea(r2, w2);
}
function circleCircleIntersection(p1, p2) {
  const d = distance(p1, p2);
  const r1 = p1.radius;
  const r2 = p2.radius;
  if (d >= r1 + r2 || d <= Math.abs(r1 - r2)) {
    return [];
  }
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h = Math.sqrt(r1 * r1 - a * a);
  const x0 = p1.x + a * (p2.x - p1.x) / d;
  const y0 = p1.y + a * (p2.y - p1.y) / d;
  const rx = -(p2.y - p1.y) * (h / d);
  const ry = -(p2.x - p1.x) * (h / d);
  return [
    { x: x0 + rx, y: y0 - ry },
    { x: x0 - rx, y: y0 + ry }
  ];
}
function getCenter(points) {
  const center = { x: 0, y: 0 };
  for (const point of points) {
    center.x += point.x;
    center.y += point.y;
  }
  center.x /= points.length;
  center.y /= points.length;
  return center;
}
function bisect(f, a, b, parameters) {
  parameters = parameters || {};
  const maxIterations = parameters.maxIterations || 100;
  const tolerance = parameters.tolerance || 0.0000000001;
  const fA = f(a);
  const fB = f(b);
  let delta = b - a;
  if (fA * fB > 0) {
    throw "Initial bisect points must have opposite signs";
  }
  if (fA === 0)
    return a;
  if (fB === 0)
    return b;
  for (let i = 0;i < maxIterations; ++i) {
    delta /= 2;
    const mid = a + delta;
    const fMid = f(mid);
    if (fMid * fA >= 0) {
      a = mid;
    }
    if (Math.abs(delta) < tolerance || fMid === 0) {
      return mid;
    }
  }
  return a + delta;
}
function zeros(x) {
  const r = new Array(x);
  for (let i = 0;i < x; ++i) {
    r[i] = 0;
  }
  return r;
}
function zerosM(x, y) {
  return zeros(x).map(() => zeros(y));
}
function dot(a, b) {
  let ret = 0;
  for (let i = 0;i < a.length; ++i) {
    ret += a[i] * b[i];
  }
  return ret;
}
function norm2(a) {
  return Math.sqrt(dot(a, a));
}
function scale(ret, value, c) {
  for (let i = 0;i < value.length; ++i) {
    ret[i] = value[i] * c;
  }
}
function weightedSum(ret, w1, v1, w2, v2) {
  for (let j = 0;j < ret.length; ++j) {
    ret[j] = w1 * v1[j] + w2 * v2[j];
  }
}
function nelderMead(f, x0, parameters) {
  parameters = parameters || {};
  const maxIterations = parameters.maxIterations || x0.length * 200;
  const nonZeroDelta = parameters.nonZeroDelta || 1.05;
  const zeroDelta = parameters.zeroDelta || 0.001;
  const minErrorDelta = parameters.minErrorDelta || 0.000001;
  const minTolerance = parameters.minErrorDelta || 0.00001;
  const rho = parameters.rho !== undefined ? parameters.rho : 1;
  const chi = parameters.chi !== undefined ? parameters.chi : 2;
  const psi = parameters.psi !== undefined ? parameters.psi : -0.5;
  const sigma = parameters.sigma !== undefined ? parameters.sigma : 0.5;
  let maxDiff;
  const N = x0.length;
  const simplex = new Array(N + 1);
  simplex[0] = x0;
  simplex[0].fx = f(x0);
  simplex[0].id = 0;
  for (let i = 0;i < N; ++i) {
    const point = x0.slice();
    point[i] = point[i] ? point[i] * nonZeroDelta : zeroDelta;
    simplex[i + 1] = point;
    simplex[i + 1].fx = f(point);
    simplex[i + 1].id = i + 1;
  }
  function updateSimplex(value) {
    for (let i = 0;i < value.length; i++) {
      simplex[N][i] = value[i];
    }
    simplex[N].fx = value.fx;
  }
  const sortOrder = (a, b) => a.fx - b.fx;
  const centroid = x0.slice();
  const reflected = x0.slice();
  const contracted = x0.slice();
  const expanded = x0.slice();
  for (let iteration = 0;iteration < maxIterations; ++iteration) {
    simplex.sort(sortOrder);
    if (parameters.history) {
      const sortedSimplex = simplex.map((x) => {
        const state = x.slice();
        state.fx = x.fx;
        state.id = x.id;
        return state;
      });
      sortedSimplex.sort((a, b) => a.id - b.id);
      parameters.history.push({
        x: simplex[0].slice(),
        fx: simplex[0].fx,
        simplex: sortedSimplex
      });
    }
    maxDiff = 0;
    for (let i = 0;i < N; ++i) {
      maxDiff = Math.max(maxDiff, Math.abs(simplex[0][i] - simplex[1][i]));
    }
    if (Math.abs(simplex[0].fx - simplex[N].fx) < minErrorDelta && maxDiff < minTolerance) {
      break;
    }
    for (let i = 0;i < N; ++i) {
      centroid[i] = 0;
      for (let j = 0;j < N; ++j) {
        centroid[i] += simplex[j][i];
      }
      centroid[i] /= N;
    }
    const worst = simplex[N];
    weightedSum(reflected, 1 + rho, centroid, -rho, worst);
    reflected.fx = f(reflected);
    if (reflected.fx < simplex[0].fx) {
      weightedSum(expanded, 1 + chi, centroid, -chi, worst);
      expanded.fx = f(expanded);
      if (expanded.fx < reflected.fx) {
        updateSimplex(expanded);
      } else {
        updateSimplex(reflected);
      }
    } else if (reflected.fx >= simplex[N - 1].fx) {
      let shouldReduce = false;
      if (reflected.fx > worst.fx) {
        weightedSum(contracted, 1 + psi, centroid, -psi, worst);
        contracted.fx = f(contracted);
        if (contracted.fx < worst.fx) {
          updateSimplex(contracted);
        } else {
          shouldReduce = true;
        }
      } else {
        weightedSum(contracted, 1 - psi * rho, centroid, psi * rho, worst);
        contracted.fx = f(contracted);
        if (contracted.fx < reflected.fx) {
          updateSimplex(contracted);
        } else {
          shouldReduce = true;
        }
      }
      if (shouldReduce) {
        if (sigma >= 1)
          break;
        for (let i = 1;i < simplex.length; ++i) {
          weightedSum(simplex[i], 1 - sigma, simplex[0], sigma, simplex[i]);
          simplex[i].fx = f(simplex[i]);
        }
      }
    } else {
      updateSimplex(reflected);
    }
  }
  simplex.sort(sortOrder);
  return { fx: simplex[0].fx, x: simplex[0] };
}
function wolfeLineSearch(f, pk, current, next, a, c1, c2) {
  const phi0 = current.fx;
  const phiPrime0 = dot(current.fxprime, pk);
  let phi = phi0;
  let phi_old = phi0;
  let phiPrime = phiPrime0;
  let a0 = 0;
  a = a || 1;
  c1 = c1 || 0.000001;
  c2 = c2 || 0.1;
  function zoom(a_lo, a_high, phi_lo) {
    for (let iteration = 0;iteration < 16; ++iteration) {
      a = (a_lo + a_high) / 2;
      weightedSum(next.x, 1, current.x, a, pk);
      phi = next.fx = f(next.x, next.fxprime);
      phiPrime = dot(next.fxprime, pk);
      if (phi > phi0 + c1 * a * phiPrime0 || phi >= phi_lo) {
        a_high = a;
      } else {
        if (Math.abs(phiPrime) <= -c2 * phiPrime0) {
          return a;
        }
        if (phiPrime * (a_high - a_lo) >= 0) {
          a_high = a_lo;
        }
        a_lo = a;
        phi_lo = phi;
      }
    }
    return 0;
  }
  for (let iteration = 0;iteration < 10; ++iteration) {
    weightedSum(next.x, 1, current.x, a, pk);
    phi = next.fx = f(next.x, next.fxprime);
    phiPrime = dot(next.fxprime, pk);
    if (phi > phi0 + c1 * a * phiPrime0 || iteration && phi >= phi_old) {
      return zoom(a0, a, phi_old);
    }
    if (Math.abs(phiPrime) <= -c2 * phiPrime0) {
      return a;
    }
    if (phiPrime >= 0) {
      return zoom(a, a0, phi);
    }
    phi_old = phi;
    a0 = a;
    a *= 2;
  }
  return a;
}
function conjugateGradient(f, initial, params) {
  let current = { x: initial.slice(), fx: 0, fxprime: initial.slice() };
  let next = { x: initial.slice(), fx: 0, fxprime: initial.slice() };
  const yk = initial.slice();
  let pk;
  let temp;
  let a = 1;
  let maxIterations;
  params = params || {};
  maxIterations = params.maxIterations || initial.length * 20;
  current.fx = f(current.x, current.fxprime);
  pk = current.fxprime.slice();
  scale(pk, current.fxprime, -1);
  for (let i = 0;i < maxIterations; ++i) {
    a = wolfeLineSearch(f, pk, current, next, a);
    if (params.history) {
      params.history.push({
        x: current.x.slice(),
        fx: current.fx,
        fxprime: current.fxprime.slice(),
        alpha: a
      });
    }
    if (!a) {
      scale(pk, current.fxprime, -1);
    } else {
      weightedSum(yk, 1, next.fxprime, -1, current.fxprime);
      const delta_k = dot(current.fxprime, current.fxprime);
      const beta_k = Math.max(0, dot(yk, next.fxprime) / delta_k);
      weightedSum(pk, beta_k, pk, -1, next.fxprime);
      temp = current;
      current = next;
      next = temp;
    }
    if (norm2(current.fxprime) <= 0.00001) {
      break;
    }
  }
  if (params.history) {
    params.history.push({
      x: current.x.slice(),
      fx: current.fx,
      fxprime: current.fxprime.slice(),
      alpha: a
    });
  }
  return current;
}
function venn(sets, parameters = {}) {
  parameters.maxIterations = parameters.maxIterations || 500;
  const initialLayout = parameters.initialLayout || bestInitialLayout;
  const loss = parameters.lossFunction || lossFunction;
  const areas = addMissingAreas(sets, parameters);
  const circles = initialLayout(areas, parameters);
  const setids = Object.keys(circles);
  const initial = [];
  for (const setid of setids) {
    initial.push(circles[setid].x);
    initial.push(circles[setid].y);
  }
  const solution = nelderMead((values) => {
    const current = {};
    for (let i = 0;i < setids.length; ++i) {
      const setid = setids[i];
      current[setid] = {
        x: values[2 * i],
        y: values[2 * i + 1],
        radius: circles[setid].radius
      };
    }
    return loss(current, areas);
  }, initial, parameters);
  const positions = solution.x;
  for (let i = 0;i < setids.length; ++i) {
    const setid = setids[i];
    circles[setid].x = positions[2 * i];
    circles[setid].y = positions[2 * i + 1];
  }
  return circles;
}
var SMALL = 0.0000000001;
function distanceFromIntersectArea(r1, r2, overlap) {
  if (Math.min(r1, r2) * Math.min(r1, r2) * Math.PI <= overlap + SMALL) {
    return Math.abs(r1 - r2);
  }
  return bisect((distance2) => circleOverlap(r1, r2, distance2) - overlap, 0, r1 + r2);
}
function addMissingAreas(areas, parameters = {}) {
  const distinct = parameters.distinct;
  const r = areas.map((s) => Object.assign({}, s));
  function toKey(arr) {
    return arr.join(";");
  }
  if (distinct) {
    const count = new Map;
    for (const area of r) {
      for (let i = 0;i < area.sets.length; i++) {
        const si = String(area.sets[i]);
        count.set(si, area.size + (count.get(si) || 0));
        for (let j = i + 1;j < area.sets.length; j++) {
          const sj = String(area.sets[j]);
          const k1 = `${si};${sj}`;
          const k2 = `${sj};${si}`;
          count.set(k1, area.size + (count.get(k1) || 0));
          count.set(k2, area.size + (count.get(k2) || 0));
        }
      }
    }
    for (const area of r) {
      if (area.sets.length < 3) {
        area.size = count.get(toKey(area.sets));
      }
    }
  }
  const ids = [];
  const pairs = new Set;
  for (const area of r) {
    if (area.sets.length === 1) {
      ids.push(area.sets[0]);
    } else if (area.sets.length === 2) {
      const a = area.sets[0];
      const b = area.sets[1];
      pairs.add(toKey(area.sets));
      pairs.add(toKey([b, a]));
    }
  }
  ids.sort((a, b) => a === b ? 0 : a < b ? -1 : 1);
  for (let i = 0;i < ids.length; ++i) {
    const a = ids[i];
    for (let j = i + 1;j < ids.length; ++j) {
      const b = ids[j];
      if (!pairs.has(toKey([a, b]))) {
        r.push({ sets: [a, b], size: 0 });
      }
    }
  }
  return r;
}
function getDistanceMatrices(areas, sets, setids) {
  const distances = zerosM(sets.length, sets.length);
  const constraints = zerosM(sets.length, sets.length);
  areas.filter((x) => x.sets.length === 2).forEach((current) => {
    const left = setids[current.sets[0]];
    const right = setids[current.sets[1]];
    const r1 = Math.sqrt(sets[left].size / Math.PI);
    const r2 = Math.sqrt(sets[right].size / Math.PI);
    const distance2 = distanceFromIntersectArea(r1, r2, current.size);
    distances[left][right] = distances[right][left] = distance2;
    let c = 0;
    if (current.size + 0.0000000001 >= Math.min(sets[left].size, sets[right].size)) {
      c = 1;
    } else if (current.size <= 0.0000000001) {
      c = -1;
    }
    constraints[left][right] = constraints[right][left] = c;
  });
  return { distances, constraints };
}
function constrainedMDSGradient(x, fxprime, distances, constraints) {
  for (let i = 0;i < fxprime.length; ++i) {
    fxprime[i] = 0;
  }
  let loss = 0;
  for (let i = 0;i < distances.length; ++i) {
    const xi = x[2 * i];
    const yi = x[2 * i + 1];
    for (let j = i + 1;j < distances.length; ++j) {
      const xj = x[2 * j];
      const yj = x[2 * j + 1];
      const dij = distances[i][j];
      const constraint = constraints[i][j];
      const squaredDistance = (xj - xi) * (xj - xi) + (yj - yi) * (yj - yi);
      const distance2 = Math.sqrt(squaredDistance);
      const delta = squaredDistance - dij * dij;
      if (constraint > 0 && distance2 <= dij || constraint < 0 && distance2 >= dij) {
        continue;
      }
      loss += 2 * delta * delta;
      fxprime[2 * i] += 4 * delta * (xi - xj);
      fxprime[2 * i + 1] += 4 * delta * (yi - yj);
      fxprime[2 * j] += 4 * delta * (xj - xi);
      fxprime[2 * j + 1] += 4 * delta * (yj - yi);
    }
  }
  return loss;
}
function bestInitialLayout(areas, params = {}) {
  let initial = greedyLayout(areas, params);
  const loss = params.lossFunction || lossFunction;
  if (areas.length >= 8) {
    const constrained = constrainedMDSLayout(areas, params);
    const constrainedLoss = loss(constrained, areas);
    const greedyLoss = loss(initial, areas);
    if (constrainedLoss + 0.00000001 < greedyLoss) {
      initial = constrained;
    }
  }
  return initial;
}
function constrainedMDSLayout(areas, params = {}) {
  const restarts = params.restarts || 10;
  const sets = [];
  const setids = {};
  for (const area of areas) {
    if (area.sets.length === 1) {
      setids[area.sets[0]] = sets.length;
      sets.push(area);
    }
  }
  let { distances, constraints } = getDistanceMatrices(areas, sets, setids);
  const norm = norm2(distances.map(norm2)) / distances.length;
  distances = distances.map((row) => row.map((value) => value / norm));
  const obj = (x, fxprime) => constrainedMDSGradient(x, fxprime, distances, constraints);
  let best = null;
  for (let i = 0;i < restarts; ++i) {
    const initial = zeros(distances.length * 2).map(Math.random);
    const current = conjugateGradient(obj, initial, params);
    if (!best || current.fx < best.fx) {
      best = current;
    }
  }
  const positions = best.x;
  const circles = {};
  for (let i = 0;i < sets.length; ++i) {
    const set = sets[i];
    circles[set.sets[0]] = {
      x: positions[2 * i] * norm,
      y: positions[2 * i + 1] * norm,
      radius: Math.sqrt(set.size / Math.PI)
    };
  }
  if (params.history) {
    for (const h of params.history) {
      scale(h.x, norm);
    }
  }
  return circles;
}
function greedyLayout(areas, params) {
  const loss = params && params.lossFunction ? params.lossFunction : lossFunction;
  const circles = {};
  const setOverlaps = {};
  for (const area of areas) {
    if (area.sets.length === 1) {
      const set = area.sets[0];
      circles[set] = {
        x: 10000000000,
        y: 10000000000,
        rowid: circles.length,
        size: area.size,
        radius: Math.sqrt(area.size / Math.PI)
      };
      setOverlaps[set] = [];
    }
  }
  areas = areas.filter((a) => a.sets.length === 2);
  for (const current of areas) {
    let weight = current.weight != null ? current.weight : 1;
    const left = current.sets[0];
    const right = current.sets[1];
    if (current.size + SMALL >= Math.min(circles[left].size, circles[right].size)) {
      weight = 0;
    }
    setOverlaps[left].push({ set: right, size: current.size, weight });
    setOverlaps[right].push({ set: left, size: current.size, weight });
  }
  const mostOverlapped = [];
  Object.keys(setOverlaps).forEach((set) => {
    let size = 0;
    for (let i = 0;i < setOverlaps[set].length; ++i) {
      size += setOverlaps[set][i].size * setOverlaps[set][i].weight;
    }
    mostOverlapped.push({ set, size });
  });
  function sortOrder(a, b) {
    return b.size - a.size;
  }
  mostOverlapped.sort(sortOrder);
  const positioned = {};
  function isPositioned(element) {
    return element.set in positioned;
  }
  function positionSet(point, index) {
    circles[index].x = point.x;
    circles[index].y = point.y;
    positioned[index] = true;
  }
  positionSet({ x: 0, y: 0 }, mostOverlapped[0].set);
  for (let i = 1;i < mostOverlapped.length; ++i) {
    const setIndex = mostOverlapped[i].set;
    const overlap = setOverlaps[setIndex].filter(isPositioned);
    const set = circles[setIndex];
    overlap.sort(sortOrder);
    if (overlap.length === 0) {
      throw "ERROR: missing pairwise overlap information";
    }
    const points = [];
    for (var j = 0;j < overlap.length; ++j) {
      const p1 = circles[overlap[j].set];
      const d1 = distanceFromIntersectArea(set.radius, p1.radius, overlap[j].size);
      points.push({ x: p1.x + d1, y: p1.y });
      points.push({ x: p1.x - d1, y: p1.y });
      points.push({ y: p1.y + d1, x: p1.x });
      points.push({ y: p1.y - d1, x: p1.x });
      for (let k = j + 1;k < overlap.length; ++k) {
        const p2 = circles[overlap[k].set];
        const d2 = distanceFromIntersectArea(set.radius, p2.radius, overlap[k].size);
        const extraPoints = circleCircleIntersection({ x: p1.x, y: p1.y, radius: d1 }, { x: p2.x, y: p2.y, radius: d2 });
        points.push(...extraPoints);
      }
    }
    let bestLoss = 100000000000000000000000000000000000000000000000000;
    let bestPoint = points[0];
    for (const point of points) {
      circles[setIndex].x = point.x;
      circles[setIndex].y = point.y;
      const localLoss = loss(circles, areas);
      if (localLoss < bestLoss) {
        bestLoss = localLoss;
        bestPoint = point;
      }
    }
    positionSet(bestPoint, setIndex);
  }
  return circles;
}
function lossFunction(circles, overlaps) {
  let output = 0;
  for (const area of overlaps) {
    if (area.sets.length === 1) {
      continue;
    }
    let overlap;
    if (area.sets.length === 2) {
      const left = circles[area.sets[0]];
      const right = circles[area.sets[1]];
      overlap = circleOverlap(left.radius, right.radius, distance(left, right));
    } else {
      overlap = intersectionArea(area.sets.map((d) => circles[d]));
    }
    const weight = area.weight != null ? area.weight : 1;
    output += weight * (overlap - area.size) * (overlap - area.size);
  }
  return output;
}
function logRatioLossFunction(circles, overlaps) {
  let output = 0;
  for (const area of overlaps) {
    if (area.sets.length === 1) {
      continue;
    }
    let overlap;
    if (area.sets.length === 2) {
      const left = circles[area.sets[0]];
      const right = circles[area.sets[1]];
      overlap = circleOverlap(left.radius, right.radius, distance(left, right));
    } else {
      overlap = intersectionArea(area.sets.map((d) => circles[d]));
    }
    const weight = area.weight != null ? area.weight : 1;
    const differenceFromIdeal = Math.log((overlap + 1) / (area.size + 1));
    output += weight * differenceFromIdeal * differenceFromIdeal;
  }
  return output;
}
function orientateCircles(circles, orientation, orientationOrder) {
  if (orientationOrder == null) {
    circles.sort((a, b) => b.radius - a.radius);
  } else {
    circles.sort(orientationOrder);
  }
  if (circles.length > 0) {
    const largestX = circles[0].x;
    const largestY = circles[0].y;
    for (const circle of circles) {
      circle.x -= largestX;
      circle.y -= largestY;
    }
  }
  if (circles.length === 2) {
    const dist = distance(circles[0], circles[1]);
    if (dist < Math.abs(circles[1].radius - circles[0].radius)) {
      circles[1].x = circles[0].x + circles[0].radius - circles[1].radius - 0.0000000001;
      circles[1].y = circles[0].y;
    }
  }
  if (circles.length > 1) {
    const rotation = Math.atan2(circles[1].x, circles[1].y) - orientation;
    const c = Math.cos(rotation);
    const s = Math.sin(rotation);
    for (const circle of circles) {
      const x = circle.x;
      const y = circle.y;
      circle.x = c * x - s * y;
      circle.y = s * x + c * y;
    }
  }
  if (circles.length > 2) {
    let angle = Math.atan2(circles[2].x, circles[2].y) - orientation;
    while (angle < 0) {
      angle += 2 * Math.PI;
    }
    while (angle > 2 * Math.PI) {
      angle -= 2 * Math.PI;
    }
    if (angle > Math.PI) {
      const slope = circles[1].y / (0.0000000001 + circles[1].x);
      for (const circle of circles) {
        var d = (circle.x + slope * circle.y) / (1 + slope * slope);
        circle.x = 2 * d - circle.x;
        circle.y = 2 * d * slope - circle.y;
      }
    }
  }
}
function disjointCluster(circles) {
  circles.forEach((circle) => {
    circle.parent = circle;
  });
  function find(circle) {
    if (circle.parent !== circle) {
      circle.parent = find(circle.parent);
    }
    return circle.parent;
  }
  function union(x, y) {
    const xRoot = find(x);
    const yRoot = find(y);
    xRoot.parent = yRoot;
  }
  for (let i = 0;i < circles.length; ++i) {
    for (let j = i + 1;j < circles.length; ++j) {
      const maxDistance = circles[i].radius + circles[j].radius;
      if (distance(circles[i], circles[j]) + 0.0000000001 < maxDistance) {
        union(circles[j], circles[i]);
      }
    }
  }
  const disjointClusters = new Map;
  for (let i = 0;i < circles.length; ++i) {
    const setid = find(circles[i]).parent.setid;
    if (!disjointClusters.has(setid)) {
      disjointClusters.set(setid, []);
    }
    disjointClusters.get(setid).push(circles[i]);
  }
  circles.forEach((circle) => {
    delete circle.parent;
  });
  return Array.from(disjointClusters.values());
}
function getBoundingBox(circles) {
  const minMax = (d) => {
    const hi = circles.reduce((acc, c) => Math.max(acc, c[d] + c.radius), Number.NEGATIVE_INFINITY);
    const lo = circles.reduce((acc, c) => Math.min(acc, c[d] - c.radius), Number.POSITIVE_INFINITY);
    return { max: hi, min: lo };
  };
  return { xRange: minMax("x"), yRange: minMax("y") };
}
function normalizeSolution(solution, orientation, orientationOrder) {
  if (orientation == null) {
    orientation = Math.PI / 2;
  }
  let circles = fromObjectNotation(solution).map((d) => Object.assign({}, d));
  const clusters = disjointCluster(circles);
  for (const cluster of clusters) {
    orientateCircles(cluster, orientation, orientationOrder);
    const bounds = getBoundingBox(cluster);
    cluster.size = (bounds.xRange.max - bounds.xRange.min) * (bounds.yRange.max - bounds.yRange.min);
    cluster.bounds = bounds;
  }
  clusters.sort((a, b) => b.size - a.size);
  circles = clusters[0];
  let returnBounds = circles.bounds;
  const spacing = (returnBounds.xRange.max - returnBounds.xRange.min) / 50;
  function addCluster(cluster, right, bottom) {
    if (!cluster) {
      return;
    }
    const bounds = cluster.bounds;
    let xOffset;
    let yOffset;
    if (right) {
      xOffset = returnBounds.xRange.max - bounds.xRange.min + spacing;
    } else {
      xOffset = returnBounds.xRange.max - bounds.xRange.max;
      const centreing = (bounds.xRange.max - bounds.xRange.min) / 2 - (returnBounds.xRange.max - returnBounds.xRange.min) / 2;
      if (centreing < 0) {
        xOffset += centreing;
      }
    }
    if (bottom) {
      yOffset = returnBounds.yRange.max - bounds.yRange.min + spacing;
    } else {
      yOffset = returnBounds.yRange.max - bounds.yRange.max;
      const centreing = (bounds.yRange.max - bounds.yRange.min) / 2 - (returnBounds.yRange.max - returnBounds.yRange.min) / 2;
      if (centreing < 0) {
        yOffset += centreing;
      }
    }
    for (const c of cluster) {
      c.x += xOffset;
      c.y += yOffset;
      circles.push(c);
    }
  }
  let index = 1;
  while (index < clusters.length) {
    addCluster(clusters[index], true, false);
    addCluster(clusters[index + 1], false, true);
    addCluster(clusters[index + 2], true, true);
    index += 3;
    returnBounds = getBoundingBox(circles);
  }
  return toObjectNotation(circles);
}
function scaleSolution(solution, width, height, padding, scaleToFit) {
  const circles = fromObjectNotation(solution);
  width -= 2 * padding;
  height -= 2 * padding;
  const { xRange, yRange } = getBoundingBox(circles);
  if (xRange.max === xRange.min || yRange.max === yRange.min) {
    console.log("not scaling solution: zero size detected");
    return solution;
  }
  let xScaling;
  let yScaling;
  if (scaleToFit) {
    const toScaleDiameter = Math.sqrt(scaleToFit / Math.PI) * 2;
    xScaling = width / toScaleDiameter;
    yScaling = height / toScaleDiameter;
  } else {
    xScaling = width / (xRange.max - xRange.min);
    yScaling = height / (yRange.max - yRange.min);
  }
  const scaling = Math.min(yScaling, xScaling);
  const xOffset = (width - (xRange.max - xRange.min) * scaling) / 2;
  const yOffset = (height - (yRange.max - yRange.min) * scaling) / 2;
  return toObjectNotation(circles.map((circle) => ({
    radius: scaling * circle.radius,
    x: padding + xOffset + (circle.x - xRange.min) * scaling,
    y: padding + yOffset + (circle.y - yRange.min) * scaling,
    setid: circle.setid
  })));
}
function toObjectNotation(circles) {
  const r = {};
  for (const circle of circles) {
    r[circle.setid] = circle;
  }
  return r;
}
function fromObjectNotation(solution) {
  const setids = Object.keys(solution);
  return setids.map((id) => Object.assign(solution[id], { setid: id }));
}
function VennDiagram(options = {}) {
  let useViewBox = false, width = 600, height = 350, padding = 15, duration = 1000, orientation = Math.PI / 2, normalize = true, scaleToFit = null, wrap = true, styled = true, fontSize = null, orientationOrder = null, distinct = false, round = null, symmetricalTextCentre = options && options.symmetricalTextCentre ? options.symmetricalTextCentre : false, colourMap = {}, colourScheme = options && options.colourScheme ? options.colourScheme : options && options.colorScheme ? options.colorScheme : [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf"
  ], colourIndex = 0, colours = function(key) {
    if (key in colourMap) {
      return colourMap[key];
    }
    var ret = colourMap[key] = colourScheme[colourIndex];
    colourIndex += 1;
    if (colourIndex >= colourScheme.length) {
      colourIndex = 0;
    }
    return ret;
  }, layoutFunction = venn, loss = lossFunction;
  function chart(selection) {
    let data = selection.datum();
    const toRemove = new Set;
    data.forEach((datum) => {
      if (datum.size == 0 && datum.sets.length == 1) {
        toRemove.add(datum.sets[0]);
      }
    });
    data = data.filter((datum) => !datum.sets.some((set) => toRemove.has(set)));
    let circles = {};
    let textCentres = {};
    if (data.length > 0) {
      let solution = layoutFunction(data, { lossFunction: loss, distinct });
      if (normalize) {
        solution = normalizeSolution(solution, orientation, orientationOrder);
      }
      circles = scaleSolution(solution, width, height, padding, scaleToFit);
      textCentres = computeTextCentres(circles, data, symmetricalTextCentre);
    }
    const labels = {};
    data.forEach((datum) => {
      if (datum.label) {
        labels[datum.sets] = datum.label;
      }
    });
    function label(d) {
      if (d.sets in labels) {
        return labels[d.sets];
      }
      if (d.sets.length == 1) {
        return "" + d.sets[0];
      }
    }
    selection.selectAll("svg").data([circles]).enter().append("svg");
    const svg = selection.select("svg");
    if (useViewBox) {
      svg.attr("viewBox", `0 0 ${width} ${height}`);
    } else {
      svg.attr("width", width).attr("height", height);
    }
    const previous = {};
    let hasPrevious = false;
    svg.selectAll(".venn-area path").each(function(d) {
      const path = this.getAttribute("d");
      if (d.sets.length == 1 && path && !distinct) {
        hasPrevious = true;
        previous[d.sets[0]] = circleFromPath(path);
      }
    });
    function pathTween(d) {
      return (t) => {
        const c = d.sets.map((set) => {
          let start = previous[set];
          let end = circles[set];
          if (!start) {
            start = { x: width / 2, y: height / 2, radius: 1 };
          }
          if (!end) {
            end = { x: width / 2, y: height / 2, radius: 1 };
          }
          return {
            x: start.x * (1 - t) + end.x * t,
            y: start.y * (1 - t) + end.y * t,
            radius: start.radius * (1 - t) + end.radius * t
          };
        });
        return intersectionAreaPath(c, round);
      };
    }
    const nodes = svg.selectAll(".venn-area").data(data, (d) => d.sets);
    const enter = nodes.enter().append("g").attr("class", (d) => `venn-area venn-${d.sets.length == 1 ? "circle" : "intersection"}${d.colour || d.color ? " venn-coloured" : ""}`).attr("data-venn-sets", (d) => d.sets.join("_"));
    const enterPath = enter.append("path");
    const enterText = enter.append("text").attr("class", "label").text((d) => label(d)).attr("text-anchor", "middle").attr("dy", ".35em").attr("x", width / 2).attr("y", height / 2);
    if (styled) {
      enterPath.style("fill-opacity", "0").filter((d) => d.sets.length == 1).style("fill", (d) => d.colour ? d.colour : d.color ? d.color : colours(d.sets)).style("fill-opacity", ".25");
      enterText.style("fill", (d) => {
        if (d.colour || d.color) {
          return "#FFF";
        }
        if (options.textFill) {
          return options.textFill;
        }
        return d.sets.length == 1 ? colours(d.sets) : "#444";
      });
    }
    function asTransition(s) {
      if (typeof s.transition === "function") {
        return s.transition("venn").duration(duration);
      }
      return s;
    }
    let update = selection;
    if (hasPrevious && typeof update.transition === "function") {
      update = asTransition(selection);
      update.selectAll("path").attrTween("d", pathTween);
    } else {
      update.selectAll("path").attr("d", (d) => intersectionAreaPath(d.sets.map((set) => circles[set])), round);
    }
    const updateText = update.selectAll("text").filter((d) => (d.sets in textCentres)).text((d) => label(d)).attr("x", (d) => Math.floor(textCentres[d.sets].x)).attr("y", (d) => Math.floor(textCentres[d.sets].y));
    if (wrap) {
      if (hasPrevious) {
        if ("on" in updateText) {
          updateText.on("end", wrapText(circles, label));
        } else {
          updateText.each("end", wrapText(circles, label));
        }
      } else {
        updateText.each(wrapText(circles, label));
      }
    }
    const exit = asTransition(nodes.exit()).remove();
    if (typeof nodes.transition === "function") {
      exit.selectAll("path").attrTween("d", pathTween);
    }
    const exitText = exit.selectAll("text").attr("x", width / 2).attr("y", height / 2);
    if (fontSize !== null) {
      enterText.style("font-size", "0px");
      updateText.style("font-size", fontSize);
      exitText.style("font-size", "0px");
    }
    return { circles, textCentres, nodes, enter, update, exit };
  }
  chart.wrap = function(_) {
    if (!arguments.length)
      return wrap;
    wrap = _;
    return chart;
  };
  chart.useViewBox = function() {
    useViewBox = true;
    return chart;
  };
  chart.width = function(_) {
    if (!arguments.length)
      return width;
    width = _;
    return chart;
  };
  chart.height = function(_) {
    if (!arguments.length)
      return height;
    height = _;
    return chart;
  };
  chart.padding = function(_) {
    if (!arguments.length)
      return padding;
    padding = _;
    return chart;
  };
  chart.distinct = function(_) {
    if (!arguments.length)
      return distinct;
    distinct = _;
    return chart;
  };
  chart.colours = function(_) {
    if (!arguments.length)
      return colours;
    colours = _;
    return chart;
  };
  chart.colors = function(_) {
    if (!arguments.length)
      return colours;
    colours = _;
    return chart;
  };
  chart.fontSize = function(_) {
    if (!arguments.length)
      return fontSize;
    fontSize = _;
    return chart;
  };
  chart.round = function(_) {
    if (!arguments.length)
      return round;
    round = _;
    return chart;
  };
  chart.duration = function(_) {
    if (!arguments.length)
      return duration;
    duration = _;
    return chart;
  };
  chart.layoutFunction = function(_) {
    if (!arguments.length)
      return layoutFunction;
    layoutFunction = _;
    return chart;
  };
  chart.normalize = function(_) {
    if (!arguments.length)
      return normalize;
    normalize = _;
    return chart;
  };
  chart.scaleToFit = function(_) {
    if (!arguments.length)
      return scaleToFit;
    scaleToFit = _;
    return chart;
  };
  chart.styled = function(_) {
    if (!arguments.length)
      return styled;
    styled = _;
    return chart;
  };
  chart.orientation = function(_) {
    if (!arguments.length)
      return orientation;
    orientation = _;
    return chart;
  };
  chart.orientationOrder = function(_) {
    if (!arguments.length)
      return orientationOrder;
    orientationOrder = _;
    return chart;
  };
  chart.lossFunction = function(_) {
    if (!arguments.length)
      return loss;
    loss = _ === "default" ? lossFunction : _ === "logRatio" ? logRatioLossFunction : _;
    return chart;
  };
  return chart;
}
function wrapText(circles, labeller) {
  return function(data) {
    const text = this;
    const width = circles[data.sets[0]].radius || 50;
    const label = labeller(data) || "";
    const words = label.split(/\s+/).reverse();
    const maxLines = 3;
    const minChars = (label.length + words.length) / maxLines;
    let word = words.pop();
    let line = [word];
    let lineNumber = 0;
    const lineHeight = 1.1;
    text.textContent = null;
    const tspans = [];
    function append(word2) {
      const tspan2 = text.ownerDocument.createElementNS(text.namespaceURI, "tspan");
      tspan2.textContent = word2;
      tspans.push(tspan2);
      text.append(tspan2);
      return tspan2;
    }
    let tspan = append(word);
    while (true) {
      word = words.pop();
      if (!word) {
        break;
      }
      line.push(word);
      const joined = line.join(" ");
      tspan.textContent = joined;
      if (joined.length > minChars && tspan.getComputedTextLength() > width) {
        line.pop();
        tspan.textContent = line.join(" ");
        line = [word];
        tspan = append(word);
        lineNumber++;
      }
    }
    const initial = 0.35 - lineNumber * lineHeight / 2;
    const x = text.getAttribute("x");
    const y = text.getAttribute("y");
    tspans.forEach((t, i) => {
      t.setAttribute("x", x);
      t.setAttribute("y", y);
      t.setAttribute("dy", `${initial + i * lineHeight}em`);
    });
  };
}
function circleMargin(current, interior, exterior) {
  let margin = interior[0].radius - distance(interior[0], current);
  for (let i = 1;i < interior.length; ++i) {
    const m = interior[i].radius - distance(interior[i], current);
    if (m <= margin) {
      margin = m;
    }
  }
  for (let i = 0;i < exterior.length; ++i) {
    const m = distance(exterior[i], current) - exterior[i].radius;
    if (m <= margin) {
      margin = m;
    }
  }
  return margin;
}
function computeTextCentre(interior, exterior, symmetricalTextCentre) {
  const points = [];
  for (const c of interior) {
    points.push({ x: c.x, y: c.y });
    points.push({ x: c.x + c.radius / 2, y: c.y });
    points.push({ x: c.x - c.radius / 2, y: c.y });
    points.push({ x: c.x, y: c.y + c.radius / 2 });
    points.push({ x: c.x, y: c.y - c.radius / 2 });
  }
  let initial = points[0];
  let margin = circleMargin(points[0], interior, exterior);
  for (let i = 1;i < points.length; ++i) {
    const m = circleMargin(points[i], interior, exterior);
    if (m >= margin) {
      initial = points[i];
      margin = m;
    }
  }
  const solution = nelderMead((p) => -1 * circleMargin({ x: p[0], y: p[1] }, interior, exterior), [initial.x, initial.y], { maxIterations: 500, minErrorDelta: 0.0000000001 }).x;
  const ret = { x: symmetricalTextCentre ? 0 : solution[0], y: solution[1] };
  let valid = true;
  for (const i of interior) {
    if (distance(ret, i) > i.radius) {
      valid = false;
      break;
    }
  }
  for (const e of exterior) {
    if (distance(ret, e) < e.radius) {
      valid = false;
      break;
    }
  }
  if (valid) {
    return ret;
  }
  if (interior.length == 1) {
    return { x: interior[0].x, y: interior[0].y };
  }
  const areaStats = {};
  intersectionArea(interior, areaStats);
  if (areaStats.arcs.length === 0) {
    return { x: 0, y: -1000, disjoint: true };
  }
  if (areaStats.arcs.length == 1) {
    return { x: areaStats.arcs[0].circle.x, y: areaStats.arcs[0].circle.y };
  }
  if (exterior.length) {
    return computeTextCentre(interior, []);
  }
  return getCenter(areaStats.arcs.map((a) => a.p1));
}
function getOverlappingCircles(circles) {
  const ret = {};
  const circleids = Object.keys(circles);
  for (const circleid of circleids) {
    ret[circleid] = [];
  }
  for (let i = 0;i < circleids.length; i++) {
    const ci = circleids[i];
    const a = circles[ci];
    for (let j = i + 1;j < circleids.length; ++j) {
      const cj = circleids[j];
      const b = circles[cj];
      const d = distance(a, b);
      if (d + b.radius <= a.radius + 0.0000000001) {
        ret[cj].push(ci);
      } else if (d + a.radius <= b.radius + 0.0000000001) {
        ret[ci].push(cj);
      }
    }
  }
  return ret;
}
function computeTextCentres(circles, areas, symmetricalTextCentre) {
  const ret = {};
  const overlapped = getOverlappingCircles(circles);
  for (let i = 0;i < areas.length; ++i) {
    const area = areas[i].sets;
    const areaids = {};
    const exclude = {};
    for (let j = 0;j < area.length; ++j) {
      areaids[area[j]] = true;
      const overlaps = overlapped[area[j]];
      for (let k = 0;k < overlaps.length; ++k) {
        exclude[overlaps[k]] = true;
      }
    }
    const interior = [];
    const exterior = [];
    for (let setid in circles) {
      if (setid in areaids) {
        interior.push(circles[setid]);
      } else if (!(setid in exclude)) {
        exterior.push(circles[setid]);
      }
    }
    const centre = computeTextCentre(interior, exterior, symmetricalTextCentre);
    ret[area] = centre;
    if (centre.disjoint && areas[i].size > 0) {
      console.log("WARNING: area " + area + " not represented on screen");
    }
  }
  return ret;
}
function circlePath(x, y, r) {
  const ret = [];
  ret.push(`
M`, x, y);
  ret.push(`
m`, -r, 0);
  ret.push(`
a`, r, r, 0, 1, 0, r * 2, 0);
  ret.push(`
a`, r, r, 0, 1, 0, -r * 2, 0);
  return ret.join(" ");
}
function circleFromPath(path) {
  const tokens = path.split(" ");
  return { x: Number.parseFloat(tokens[1]), y: Number.parseFloat(tokens[2]), radius: -Number.parseFloat(tokens[4]) };
}
function intersectionAreaArcs(circles) {
  if (circles.length === 0) {
    return [];
  }
  const stats = {};
  intersectionArea(circles, stats);
  return stats.arcs;
}
function arcsToPath(arcs, round) {
  if (arcs.length === 0) {
    return "M 0 0";
  }
  const rFactor = Math.pow(10, round || 0);
  const r = round != null ? (v) => Math.round(v * rFactor) / rFactor : (v) => v;
  if (arcs.length == 1) {
    const circle = arcs[0].circle;
    return circlePath(r(circle.x), r(circle.y), r(circle.radius));
  }
  const ret = [`
M`, r(arcs[0].p2.x), r(arcs[0].p2.y)];
  for (const arc of arcs) {
    const radius = r(arc.circle.radius);
    ret.push(`
A`, radius, radius, 0, arc.large ? 1 : 0, arc.sweep ? 1 : 0, r(arc.p1.x), r(arc.p1.y));
  }
  return ret.join(" ");
}
function intersectionAreaPath(circles, round) {
  return arcsToPath(intersectionAreaArcs(circles), round);
}
function layout(data, options = {}) {
  const {
    lossFunction: loss,
    layoutFunction: layout2 = venn,
    normalize = true,
    orientation = Math.PI / 2,
    orientationOrder,
    width = 600,
    height = 350,
    padding = 15,
    scaleToFit = false,
    symmetricalTextCentre = false,
    distinct,
    round = 2
  } = options;
  let solution = layout2(data, {
    lossFunction: loss === "default" || !loss ? lossFunction : loss === "logRatio" ? logRatioLossFunction : loss,
    distinct
  });
  if (normalize) {
    solution = normalizeSolution(solution, orientation, orientationOrder);
  }
  const circles = scaleSolution(solution, width, height, padding, scaleToFit);
  const textCentres = computeTextCentres(circles, data, symmetricalTextCentre);
  const circleLookup = new Map(Object.keys(circles).map((set) => [
    set,
    {
      set,
      x: circles[set].x,
      y: circles[set].y,
      radius: circles[set].radius
    }
  ]));
  const helpers = data.map((area) => {
    const circles2 = area.sets.map((s) => circleLookup.get(s));
    const arcs = intersectionAreaArcs(circles2);
    const path = arcsToPath(arcs, round);
    return { circles: circles2, arcs, path, area, has: new Set(area.sets) };
  });
  function genDistinctPath(sets) {
    let r = "";
    for (const e of helpers) {
      if (e.has.size > sets.length && sets.every((s) => e.has.has(s))) {
        r += " " + e.path;
      }
    }
    return r;
  }
  return helpers.map(({ circles: circles2, arcs, path, area }) => {
    return {
      data: area,
      text: textCentres[area.sets],
      circles: circles2,
      arcs,
      path,
      distinctPath: path + genDistinctPath(area.sets)
    };
  });
}

// node_modules/mermaid/dist/chunks/mermaid.core/vennDiagram-CIIHVFJN.mjs
var parser = function() {
  var o = /* @__PURE__ */ __name(function(k, v, o2, l) {
    for (o2 = o2 || {}, l = k.length;l--; o2[k[l]] = v)
      ;
    return o2;
  }, "o"), $V0 = [5, 8], $V1 = [7, 8, 11, 12, 17, 19, 22, 24], $V2 = [1, 17], $V3 = [1, 18], $V4 = [7, 8, 11, 12, 14, 15, 16, 17, 19, 20, 21, 22, 24, 27], $V5 = [1, 31], $V6 = [1, 39], $V7 = [7, 8, 11, 12, 17, 19, 22, 24, 27], $V8 = [1, 57], $V9 = [1, 56], $Va = [1, 58], $Vb = [1, 59], $Vc = [1, 60], $Vd = [7, 8, 11, 12, 16, 17, 19, 20, 22, 24, 27, 31, 32, 33];
  var parser2 = {
    trace: /* @__PURE__ */ __name(function trace() {}, "trace"),
    yy: {},
    symbols_: { error: 2, start: 3, optNewlines: 4, VENN: 5, document: 6, EOF: 7, NEWLINE: 8, line: 9, statement: 10, TITLE: 11, SET: 12, identifier: 13, BRACKET_LABEL: 14, COLON: 15, NUMERIC: 16, UNION: 17, identifierList: 18, TEXT: 19, IDENTIFIER: 20, STRING: 21, INDENT_TEXT: 22, indentedTextTail: 23, STYLE: 24, stylesOpt: 25, styleField: 26, COMMA: 27, styleValue: 28, valueTokens: 29, valueToken: 30, HEXCOLOR: 31, RGBCOLOR: 32, RGBACOLOR: 33, $accept: 0, $end: 1 },
    terminals_: { 2: "error", 5: "VENN", 7: "EOF", 8: "NEWLINE", 11: "TITLE", 12: "SET", 14: "BRACKET_LABEL", 15: "COLON", 16: "NUMERIC", 17: "UNION", 19: "TEXT", 20: "IDENTIFIER", 21: "STRING", 22: "INDENT_TEXT", 24: "STYLE", 27: "COMMA", 31: "HEXCOLOR", 32: "RGBCOLOR", 33: "RGBACOLOR" },
    productions_: [0, [3, 4], [4, 0], [4, 2], [6, 0], [6, 2], [9, 1], [9, 1], [10, 1], [10, 2], [10, 3], [10, 4], [10, 5], [10, 2], [10, 3], [10, 4], [10, 5], [10, 3], [10, 3], [10, 3], [10, 4], [10, 4], [10, 2], [10, 3], [23, 1], [23, 1], [23, 1], [23, 2], [23, 2], [25, 1], [25, 3], [26, 3], [28, 1], [28, 1], [29, 1], [29, 2], [30, 1], [30, 1], [30, 1], [30, 1], [30, 1], [18, 1], [18, 3], [13, 1], [13, 1]],
    performAction: /* @__PURE__ */ __name(function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {
      var $0 = $$.length - 1;
      switch (yystate) {
        case 1:
          return $$[$0 - 1];
          break;
        case 2:
        case 3:
        case 4:
          this.$ = [];
          break;
        case 5:
          $$[$0 - 1].push($$[$0]);
          this.$ = $$[$0 - 1];
          break;
        case 6:
          this.$ = [];
          break;
        case 7:
        case 22:
        case 32:
        case 36:
        case 37:
        case 38:
        case 39:
        case 40:
          this.$ = $$[$0];
          break;
        case 8:
          yy.setDiagramTitle($$[$0].substr(6));
          this.$ = $$[$0].substr(6);
          break;
        case 9:
          yy.addSubsetData([$$[$0]], undefined, undefined);
          if (yy.setIndentMode) {
            yy.setIndentMode(true);
          }
          break;
        case 10:
          yy.addSubsetData([$$[$0 - 1]], $$[$0], undefined);
          if (yy.setIndentMode) {
            yy.setIndentMode(true);
          }
          break;
        case 11:
          yy.addSubsetData([$$[$0 - 2]], undefined, parseFloat($$[$0]));
          if (yy.setIndentMode) {
            yy.setIndentMode(true);
          }
          break;
        case 12:
          yy.addSubsetData([$$[$0 - 3]], $$[$0 - 2], parseFloat($$[$0]));
          if (yy.setIndentMode) {
            yy.setIndentMode(true);
          }
          break;
        case 13:
          if ($$[$0].length < 2) {
            throw new Error("union requires multiple identifiers");
          }
          if (yy.validateUnionIdentifiers) {
            yy.validateUnionIdentifiers($$[$0]);
          }
          yy.addSubsetData($$[$0], undefined, undefined);
          if (yy.setIndentMode) {
            yy.setIndentMode(true);
          }
          break;
        case 14:
          if ($$[$0 - 1].length < 2) {
            throw new Error("union requires multiple identifiers");
          }
          if (yy.validateUnionIdentifiers) {
            yy.validateUnionIdentifiers($$[$0 - 1]);
          }
          yy.addSubsetData($$[$0 - 1], $$[$0], undefined);
          if (yy.setIndentMode) {
            yy.setIndentMode(true);
          }
          break;
        case 15:
          if ($$[$0 - 2].length < 2) {
            throw new Error("union requires multiple identifiers");
          }
          if (yy.validateUnionIdentifiers) {
            yy.validateUnionIdentifiers($$[$0 - 2]);
          }
          yy.addSubsetData($$[$0 - 2], undefined, parseFloat($$[$0]));
          if (yy.setIndentMode) {
            yy.setIndentMode(true);
          }
          break;
        case 16:
          if ($$[$0 - 3].length < 2) {
            throw new Error("union requires multiple identifiers");
          }
          if (yy.validateUnionIdentifiers) {
            yy.validateUnionIdentifiers($$[$0 - 3]);
          }
          yy.addSubsetData($$[$0 - 3], $$[$0 - 2], parseFloat($$[$0]));
          if (yy.setIndentMode) {
            yy.setIndentMode(true);
          }
          break;
        case 17:
        case 18:
        case 19:
          yy.addTextData($$[$0 - 1], $$[$0], undefined);
          break;
        case 20:
        case 21:
          yy.addTextData($$[$0 - 2], $$[$0 - 1], $$[$0]);
          break;
        case 23:
          yy.addStyleData($$[$0 - 1], $$[$0]);
          break;
        case 24:
        case 25:
        case 26:
          var cs = yy.getCurrentSets();
          if (!cs)
            throw new Error("text requires set");
          yy.addTextData(cs, $$[$0], undefined);
          break;
        case 27:
        case 28:
          var cs = yy.getCurrentSets();
          if (!cs)
            throw new Error("text requires set");
          yy.addTextData(cs, $$[$0 - 1], $$[$0]);
          break;
        case 29:
        case 41:
          this.$ = [$$[$0]];
          break;
        case 30:
        case 42:
          this.$ = [...$$[$0 - 2], $$[$0]];
          break;
        case 31:
          this.$ = [$$[$0 - 2], $$[$0]];
          break;
        case 33:
          this.$ = $$[$0].join(" ");
          break;
        case 34:
          this.$ = [$$[$0]];
          break;
        case 35:
          $$[$0 - 1].push($$[$0]);
          this.$ = $$[$0 - 1];
          break;
        case 43:
        case 44:
          this.$ = $$[$0];
          break;
      }
    }, "anonymous"),
    table: [o($V0, [2, 2], { 3: 1, 4: 2 }), { 1: [3] }, { 5: [1, 3], 8: [1, 4] }, o($V1, [2, 4], { 6: 5 }), o($V0, [2, 3]), { 7: [1, 6], 8: [1, 8], 9: 7, 10: 9, 11: [1, 10], 12: [1, 11], 17: [1, 12], 19: [1, 13], 22: [1, 14], 24: [1, 15] }, { 1: [2, 1] }, o($V1, [2, 5]), o($V1, [2, 6]), o($V1, [2, 7]), o($V1, [2, 8]), { 13: 16, 20: $V2, 21: $V3 }, { 13: 20, 18: 19, 20: $V2, 21: $V3 }, { 13: 20, 18: 21, 20: $V2, 21: $V3 }, { 16: [1, 25], 20: [1, 23], 21: [1, 24], 23: 22 }, { 13: 20, 18: 26, 20: $V2, 21: $V3 }, o($V1, [2, 9], { 14: [1, 27], 15: [1, 28] }), o($V4, [2, 43]), o($V4, [2, 44]), o($V1, [2, 13], { 14: [1, 29], 15: [1, 30], 27: $V5 }), o($V4, [2, 41]), { 16: [1, 34], 20: [1, 32], 21: [1, 33], 27: $V5 }, o($V1, [2, 22]), o($V1, [2, 24], { 14: [1, 35] }), o($V1, [2, 25], { 14: [1, 36] }), o($V1, [2, 26]), { 20: $V6, 25: 37, 26: 38, 27: $V5 }, o($V1, [2, 10], { 15: [1, 40] }), { 16: [1, 41] }, o($V1, [2, 14], { 15: [1, 42] }), { 16: [1, 43] }, { 13: 44, 20: $V2, 21: $V3 }, o($V1, [2, 17], { 14: [1, 45] }), o($V1, [2, 18], { 14: [1, 46] }), o($V1, [2, 19]), o($V1, [2, 27]), o($V1, [2, 28]), o($V1, [2, 23], { 27: [1, 47] }), o($V7, [2, 29]), { 15: [1, 48] }, { 16: [1, 49] }, o($V1, [2, 11]), { 16: [1, 50] }, o($V1, [2, 15]), o($V4, [2, 42]), o($V1, [2, 20]), o($V1, [2, 21]), { 20: $V6, 26: 51 }, { 16: $V8, 20: $V9, 21: [1, 53], 28: 52, 29: 54, 30: 55, 31: $Va, 32: $Vb, 33: $Vc }, o($V1, [2, 12]), o($V1, [2, 16]), o($V7, [2, 30]), o($V7, [2, 31]), o($V7, [2, 32]), o($V7, [2, 33], { 30: 61, 16: $V8, 20: $V9, 31: $Va, 32: $Vb, 33: $Vc }), o($Vd, [2, 34]), o($Vd, [2, 36]), o($Vd, [2, 37]), o($Vd, [2, 38]), o($Vd, [2, 39]), o($Vd, [2, 40]), o($Vd, [2, 35])],
    defaultActions: { 6: [2, 1] },
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
      options: { "case-insensitive": true },
      performAction: /* @__PURE__ */ __name(function anonymous(yy, yy_, $avoiding_name_collisions, YY_START) {
        var YYSTATE = YY_START;
        switch ($avoiding_name_collisions) {
          case 0:
            break;
          case 1:
            break;
          case 2:
            break;
          case 3:
            if (yy.getIndentMode && yy.getIndentMode()) {
              yy.consumeIndentText = true;
              this.begin("INITIAL");
              return 22;
            }
            break;
          case 4:
            break;
          case 5:
            if (yy.setIndentMode) {
              yy.setIndentMode(false);
            }
            this.begin("INITIAL");
            this.unput(yy_.yytext);
            break;
          case 6:
            this.begin("bol");
            return 8;
            break;
          case 7:
            break;
          case 8:
            break;
          case 9:
            return 7;
            break;
          case 10:
            return 11;
            break;
          case 11:
            return 5;
            break;
          case 12:
            return 12;
            break;
          case 13:
            return 17;
            break;
          case 14:
            if (yy.consumeIndentText) {
              yy.consumeIndentText = false;
            } else {
              return 19;
            }
            break;
          case 15:
            return 24;
            break;
          case 16:
            yy_.yytext = yy_.yytext.slice(2, -2);
            return 14;
            break;
          case 17:
            yy_.yytext = yy_.yytext.slice(1, -1).trim();
            return 14;
            break;
          case 18:
            return 16;
            break;
          case 19:
            return 31;
            break;
          case 20:
            return 33;
            break;
          case 21:
            return 32;
            break;
          case 22:
            return 20;
            break;
          case 23:
            return 21;
            break;
          case 24:
            return 27;
            break;
          case 25:
            return 15;
            break;
        }
      }, "anonymous"),
      rules: [/^(?:%%(?!\{)[^\n]*)/i, /^(?:[^\}]%%[^\n]*)/i, /^(?:[ \t]+(?=[\n\r]))/i, /^(?:[ \t]+(?=text\b))/i, /^(?:[ \t]+)/i, /^(?:[^ \t\n\r])/i, /^(?:[\n\r]+)/i, /^(?:%%[^\n]*)/i, /^(?:[ \t]+)/i, /^(?:$)/i, /^(?:title\s[^#\n;]+)/i, /^(?:venn-beta\b)/i, /^(?:set\b)/i, /^(?:union\b)/i, /^(?:text\b)/i, /^(?:style\b)/i, /^(?:\["[^\"]*"\])/i, /^(?:\[[^\]\"]+\])/i, /^(?:[+-]?(\d+(\.\d+)?|\.\d+))/i, /^(?:#[0-9a-fA-F]{3,8})/i, /^(?:rgba\(\s*[0-9.]+\s*[,]\s*[0-9.]+\s*[,]\s*[0-9.]+\s*[,]\s*[0-9.]+\s*\))/i, /^(?:rgb\(\s*[0-9.]+\s*[,]\s*[0-9.]+\s*[,]\s*[0-9.]+\s*\))/i, /^(?:[A-Za-z_][A-Za-z0-9\-_]*)/i, /^(?:"[^\"]*")/i, /^(?:,)/i, /^(?::)/i],
      conditions: { bol: { rules: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25], inclusive: true }, INITIAL: { rules: [0, 1, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25], inclusive: true } }
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
var venn_default = parser;
var subsets = [];
var textNodes = [];
var styleEntries = [];
var knownSets = /* @__PURE__ */ new Set;
var currentSets;
var indentMode = false;
var addSubsetData = /* @__PURE__ */ __name((identifierList, label, size) => {
  const sets = normalizeIdentifierList(identifierList).sort();
  const resolvedSize = size ?? 10 / Math.pow(identifierList.length, 2);
  currentSets = sets;
  if (sets.length === 1) {
    knownSets.add(sets[0]);
  }
  subsets.push({
    sets,
    size: resolvedSize,
    label: label ? normalizeText(label) : undefined
  });
}, "addSubsetData");
var getSubsetData = /* @__PURE__ */ __name(() => {
  return subsets;
}, "getSubsetData");
var normalizeText = /* @__PURE__ */ __name((text) => {
  const trimmed = text.trim();
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}, "normalizeText");
var normalizeStyleValue = /* @__PURE__ */ __name((value) => {
  return value ? normalizeText(value) : value;
}, "normalizeStyleValue");
var addTextData = /* @__PURE__ */ __name((identifierList, id, label) => {
  const normalizedId = normalizeText(id);
  textNodes.push({
    sets: normalizeIdentifierList(identifierList).sort(),
    id: normalizedId,
    label: label ? normalizeText(label) : undefined
  });
}, "addTextData");
var addStyleData = /* @__PURE__ */ __name((identifierList, data) => {
  const targets = normalizeIdentifierList(identifierList).sort();
  const styles = {};
  for (const [key, value] of data) {
    styles[key] = normalizeStyleValue(value) ?? value;
  }
  styleEntries.push({ targets, styles });
}, "addStyleData");
var getStyleData = /* @__PURE__ */ __name(() => {
  return styleEntries;
}, "getStyleData");
var normalizeIdentifierList = /* @__PURE__ */ __name((identifierList) => {
  return identifierList.map((identifier) => normalizeText(identifier));
}, "normalizeIdentifierList");
var validateUnionIdentifiers = /* @__PURE__ */ __name((identifierList) => {
  const normalized = normalizeIdentifierList(identifierList);
  const unknown = normalized.filter((identifier) => !knownSets.has(identifier));
  if (unknown.length > 0) {
    throw new Error(`unknown set identifier: ${unknown.join(", ")}`);
  }
}, "validateUnionIdentifiers");
var getTextData = /* @__PURE__ */ __name(() => {
  return textNodes;
}, "getTextData");
var getCurrentSets = /* @__PURE__ */ __name(() => currentSets, "getCurrentSets");
var getIndentMode = /* @__PURE__ */ __name(() => indentMode, "getIndentMode");
var setIndentMode = /* @__PURE__ */ __name((enabled) => {
  indentMode = enabled;
}, "setIndentMode");
var DEFAULT_VENN_CONFIG = defaultConfig_default.venn;
function getConfig2() {
  return cleanAndMerge(DEFAULT_VENN_CONFIG, getConfig().venn);
}
__name(getConfig2, "getConfig");
var customClear = /* @__PURE__ */ __name(() => {
  clear();
  subsets.length = 0;
  textNodes.length = 0;
  styleEntries.length = 0;
  knownSets.clear();
  currentSets = undefined;
  indentMode = false;
}, "customClear");
var db = {
  getConfig: getConfig2,
  clear: customClear,
  setAccTitle,
  getAccTitle,
  setDiagramTitle,
  getDiagramTitle,
  getAccDescription,
  setAccDescription,
  addSubsetData,
  getSubsetData,
  addTextData,
  addStyleData,
  validateUnionIdentifiers,
  getTextData,
  getStyleData,
  getCurrentSets,
  getIndentMode,
  setIndentMode
};
var getStyles = /* @__PURE__ */ __name((options) => `
  .venn-title {
    font-size: 32px;
    fill: ${options.vennTitleTextColor};
    font-family: ${options.fontFamily};
  }

  .venn-circle text {
    font-size: 48px;
    font-family: ${options.fontFamily};
  }

  .venn-intersection text {
    font-size: 48px;
    fill: ${options.vennSetTextColor};
    font-family: ${options.fontFamily};
  }

  .venn-text-node {
    font-family: ${options.fontFamily};
    color: ${options.vennSetTextColor};
  }
`, "getStyles");
var styles_default = getStyles;
function buildStyleByKey(styleData) {
  const map = /* @__PURE__ */ new Map;
  for (const entry of styleData) {
    const key = entry.targets.join("|");
    const existing = map.get(key);
    if (existing) {
      Object.assign(existing, entry.styles);
    } else {
      map.set(key, { ...entry.styles });
    }
  }
  return map;
}
__name(buildStyleByKey, "buildStyleByKey");
var draw = /* @__PURE__ */ __name((_text, id, _version, diagObj) => {
  const db2 = diagObj.db;
  const config = db2.getConfig?.();
  const { themeVariables, look, handDrawnSeed } = getConfig();
  const isHandDrawn = look === "handDrawn";
  const themeColors = [
    themeVariables.venn1,
    themeVariables.venn2,
    themeVariables.venn3,
    themeVariables.venn4,
    themeVariables.venn5,
    themeVariables.venn6,
    themeVariables.venn7,
    themeVariables.venn8
  ].filter(Boolean);
  const title = db2.getDiagramTitle?.();
  const sets = db2.getSubsetData();
  const textNodes2 = db2.getTextData();
  const styleByKey = buildStyleByKey(db2.getStyleData());
  const svgWidth = config?.width ?? 800;
  const svgHeight = config?.height ?? 450;
  const REFERENCE_WIDTH = 1600;
  const scale2 = svgWidth / REFERENCE_WIDTH;
  const titleHeight = title ? 48 * scale2 : 0;
  const defaultTextColor = themeVariables.primaryTextColor ?? themeVariables.textColor;
  const svg = selectSvgElement(id);
  svg.attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
  if (title) {
    svg.append("text").text(title).attr("class", "venn-title").attr("font-size", `${32 * scale2}px`).attr("text-anchor", "middle").attr("dominant-baseline", "middle").attr("x", "50%").attr("y", 32 * scale2).style("fill", themeVariables.vennTitleTextColor || themeVariables.titleColor);
  }
  const dummyD3root = select_default(document.createElement("div"));
  const vennDiagram = VennDiagram().width(svgWidth).height(svgHeight - titleHeight);
  dummyD3root.datum(sets).call(vennDiagram);
  const roughSvg = isHandDrawn ? at.svg(dummyD3root.select("svg").node()) : undefined;
  const layoutAreas = layout(sets, {
    width: svgWidth,
    height: svgHeight - titleHeight,
    padding: config?.padding ?? 15
  });
  const layoutByKey = /* @__PURE__ */ new Map;
  for (const area of layoutAreas) {
    const key = stableSetsKey([...area.data.sets].sort());
    layoutByKey.set(key, area);
  }
  if (textNodes2.length > 0) {
    renderTextNodes(config, layoutByKey, dummyD3root, textNodes2, scale2, styleByKey);
  }
  const themeDark = is_dark_default(themeVariables.background || "#f4f4f4");
  dummyD3root.selectAll(".venn-circle").each(function(d, i) {
    const group = select_default(this);
    const data = d;
    const setsKey = stableSetsKey([...data.sets].sort());
    const customStyle = styleByKey.get(setsKey);
    const baseColor = customStyle?.fill || themeColors[i % themeColors.length] || themeVariables.primaryColor;
    group.classed(`venn-set-${i % 8}`, true);
    const fillOpacity = customStyle?.["fill-opacity"] ?? 0.1;
    const strokeColor = customStyle?.stroke || baseColor;
    const strokeWidthVal = customStyle?.["stroke-width"] || `${5 * scale2}`;
    if (isHandDrawn && roughSvg) {
      const layoutArea = layoutByKey.get(setsKey);
      if (layoutArea && layoutArea.circles.length > 0) {
        const c = layoutArea.circles[0];
        const roughNode = roughSvg.circle(c.x, c.y, c.radius * 2, {
          roughness: 0.7,
          seed: handDrawnSeed,
          fill: transparentize_default(baseColor, 0.7),
          fillStyle: "hachure",
          fillWeight: 2,
          hachureGap: 8,
          hachureAngle: -41 + i * 60,
          stroke: strokeColor,
          strokeWidth: parseFloat(String(strokeWidthVal))
        });
        group.select("path").remove();
        group.node()?.insertBefore(roughNode, group.select("text").node());
      }
    } else {
      group.select("path").style("fill", baseColor).style("fill-opacity", fillOpacity).style("stroke", strokeColor).style("stroke-width", strokeWidthVal).style("stroke-opacity", 0.95);
    }
    const textColor = customStyle?.color || (themeDark ? lighten_default(baseColor, 30) : darken_default(baseColor, 30));
    group.select("text").style("font-size", `${48 * scale2}px`).style("fill", textColor);
  });
  if (isHandDrawn && roughSvg) {
    dummyD3root.selectAll(".venn-intersection").each(function(d) {
      const group = select_default(this);
      const data = d;
      const setsKey = stableSetsKey([...data.sets].sort());
      const customStyle = styleByKey.get(setsKey);
      const customFill = customStyle?.fill;
      if (customFill) {
        const pathEl = group.select("path");
        const pathD = pathEl.attr("d");
        if (pathD) {
          const roughNode = roughSvg.path(pathD, {
            roughness: 0.7,
            seed: handDrawnSeed,
            fill: transparentize_default(customFill, 0.3),
            fillStyle: "cross-hatch",
            fillWeight: 2,
            hachureGap: 6,
            hachureAngle: 60,
            stroke: "none"
          });
          const existingPath = pathEl.node();
          existingPath?.parentNode?.insertBefore(roughNode, existingPath);
          pathEl.remove();
        }
      } else {
        group.select("path").style("fill-opacity", 0);
      }
      group.select("text").style("font-size", `${48 * scale2}px`).style("fill", customStyle?.color ?? themeVariables.vennSetTextColor ?? defaultTextColor);
    });
  } else {
    dummyD3root.selectAll(".venn-intersection text").style("font-size", `${48 * scale2}px`).style("fill", (e) => {
      const data = e;
      const setsKey = stableSetsKey([...data.sets].sort());
      return styleByKey.get(setsKey)?.color ?? themeVariables.vennSetTextColor ?? defaultTextColor;
    });
    dummyD3root.selectAll(".venn-intersection path").style("fill-opacity", (e) => {
      const data = e;
      const setsKey = stableSetsKey([...data.sets].sort());
      return styleByKey.get(setsKey)?.fill ? 1 : 0;
    }).style("fill", (e) => {
      const data = e;
      const setsKey = stableSetsKey([...data.sets].sort());
      return styleByKey.get(setsKey)?.fill ?? "transparent";
    });
  }
  const vennGroup = svg.append("g").attr("transform", `translate(0, ${titleHeight})`);
  const dummySvg = dummyD3root.select("svg").node();
  if (dummySvg && "childNodes" in dummySvg) {
    for (const child of [...dummySvg.childNodes]) {
      vennGroup.node()?.appendChild(child);
    }
  }
  configureSvgSize(svg, svgHeight, svgWidth, config?.useMaxWidth ?? true);
}, "draw");
function stableSetsKey(setIds) {
  return setIds.join("|");
}
__name(stableSetsKey, "stableSetsKey");
function renderTextNodes(config, layoutByKey, dummyD3root, textNodes2, scale2, styleByKey) {
  const useDebugLayout = config?.useDebugLayout ?? false;
  const vennSvg = dummyD3root.select("svg");
  const textGroup = vennSvg.append("g").attr("class", "venn-text-nodes");
  const nodesByArea = /* @__PURE__ */ new Map;
  for (const node of textNodes2) {
    const key = stableSetsKey(node.sets);
    const existing = nodesByArea.get(key);
    if (existing) {
      existing.push(node);
    } else {
      nodesByArea.set(key, [node]);
    }
  }
  for (const [key, nodes] of nodesByArea.entries()) {
    const area = layoutByKey.get(key);
    if (!area?.text) {
      continue;
    }
    const centerX = area.text.x;
    const centerY = area.text.y;
    const minCircleRadius = Math.min(...area.circles.map((c) => c.radius));
    const innerRadiusRaw = Math.min(...area.circles.map((c) => c.radius - Math.hypot(centerX - c.x, centerY - c.y)));
    let innerRadius = Number.isFinite(innerRadiusRaw) ? Math.max(0, innerRadiusRaw) : 0;
    if (innerRadius === 0 && Number.isFinite(minCircleRadius)) {
      innerRadius = minCircleRadius * 0.6;
    }
    const areaGroup = textGroup.append("g").attr("class", "venn-text-area").attr("font-size", `${40 * scale2}px`);
    if (useDebugLayout) {
      areaGroup.append("circle").attr("class", "venn-text-debug-circle").attr("cx", centerX).attr("cy", centerY).attr("r", innerRadius).attr("fill", "none").attr("stroke", "purple").attr("stroke-width", 1.5 * scale2).attr("stroke-dasharray", `${6 * scale2} ${4 * scale2}`);
    }
    const innerWidth = Math.max(80 * scale2, innerRadius * 2 * 0.95);
    const innerHeight = Math.max(60 * scale2, innerRadius * 2 * 0.95);
    const hasLabel = area.data.label && area.data.label.length > 0;
    const labelOffsetBase = hasLabel ? Math.min(32 * scale2, innerRadius * 0.25) : 0;
    const labelOffset = labelOffsetBase + (nodes.length <= 2 ? 30 * scale2 : 0);
    const startX = centerX - innerWidth / 2;
    const startY = centerY - innerHeight / 2 + labelOffset;
    const cols = Math.max(1, Math.ceil(Math.sqrt(nodes.length)));
    const rows = Math.max(1, Math.ceil(nodes.length / cols));
    const cellWidth = innerWidth / cols;
    const cellHeight = innerHeight / rows;
    for (const [i, node] of nodes.entries()) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + cellWidth * (col + 0.5);
      const y = startY + cellHeight * (row + 0.5);
      if (useDebugLayout) {
        areaGroup.append("rect").attr("class", "venn-text-debug-cell").attr("x", startX + cellWidth * col).attr("y", startY + cellHeight * row).attr("width", cellWidth).attr("height", cellHeight).attr("fill", "none").attr("stroke", "teal").attr("stroke-width", 1 * scale2).attr("stroke-dasharray", `${4 * scale2} ${3 * scale2}`);
      }
      const boxWidth = cellWidth * 0.9;
      const boxHeight = cellHeight * 0.9;
      const container = areaGroup.append("foreignObject").attr("class", "venn-text-node-fo").attr("width", boxWidth).attr("height", boxHeight).attr("x", x - boxWidth / 2).attr("y", y - boxHeight / 2).attr("overflow", "visible");
      const textColor = styleByKey.get(node.id)?.color;
      const text = container.append("xhtml:span").attr("class", "venn-text-node").style("display", "flex").style("width", "100%").style("height", "100%").style("white-space", "normal").style("align-items", "center").style("justify-content", "center").style("text-align", "center").style("overflow-wrap", "normal").style("word-break", "normal").text(node.label ?? node.id);
      if (textColor) {
        text.style("color", textColor);
      }
    }
  }
}
__name(renderTextNodes, "renderTextNodes");
var renderer = { draw };
var diagram = {
  parser: venn_default,
  db,
  renderer,
  styles: styles_default
};
export {
  diagram
};

//# debugId=4B1273AD5699290664756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0B1cHNldGpzL3Zlbm4uanMvYnVpbGQvdmVubi5lc20uanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL3Zlbm5EaWFncmFtLUNJSUhWRkpOLm1qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICJjb25zdCBTTUFMTCQxID0gMWUtMTA7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgaW50ZXJzZWN0aW9uIGFyZWEgb2YgYSBidW5jaCBvZiBjaXJjbGVzICh3aGVyZSBlYWNoIGNpcmNsZVxuICogaXMgYW4gb2JqZWN0IGhhdmluZyBhbiB4LHkgYW5kIHJhZGl1cyBwcm9wZXJ0eSlcbiAqIEBwYXJhbSB7UmVhZG9ubHlBcnJheTx7eDogbnVtYmVyLCB5OiBudW1iZXIsIHJhZGl1czogbnVtYmVyfT59IGNpcmNsZXNcbiAqIEBwYXJhbSB7dW5kZWZpbmVkIHwgeyBhcmVhPzogbnVtYmVyLCBhcmNBcmVhPzogbnVtYmVyLCBwb2x5Z29uQXJlYT86IG51bWJlciwgYXJjcz86IFJlYWRvbmx5QXJyYXk8eyBjaXJjbGU6IHt4OiBudW1iZXIsIHk6IG51bWJlciwgcmFkaXVzOiBudW1iZXJ9LCB3aWR0aDogbnVtYmVyLCBwMToge3g6IG51bWJlciwgeTogbnVtYmVyfSwgcDI6IHt4OiBudW1iZXIsIHk6IG51bWJlcn0gfT4sIGlubmVyUG9pbnRzOiBSZWFkb25seUFycmF5PHtcbiAgICB4OiBudW1iZXI7XG4gICAgeTogbnVtYmVyO1xuICAgIHBhcmVudEluZGV4OiBbbnVtYmVyLCBudW1iZXJdO1xufT4sIGludGVyc2VjdGlvblBvaW50czogUmVhZG9ubHlBcnJheTx7XG4gIHg6IG51bWJlcjtcbiAgeTogbnVtYmVyO1xuICBwYXJlbnRJbmRleDogW251bWJlciwgbnVtYmVyXTtcbn0+IH19IHN0YXRzXG4gKiBAcmV0dXJucyB7bnVtYmVyfVxuICovXG5mdW5jdGlvbiBpbnRlcnNlY3Rpb25BcmVhKGNpcmNsZXMsIHN0YXRzKSB7XG4gIC8vIGdldCBhbGwgdGhlIGludGVyc2VjdGlvbiBwb2ludHMgb2YgdGhlIGNpcmNsZXNcbiAgY29uc3QgaW50ZXJzZWN0aW9uUG9pbnRzID0gZ2V0SW50ZXJzZWN0aW9uUG9pbnRzKGNpcmNsZXMpO1xuXG4gIC8vIGZpbHRlciBvdXQgcG9pbnRzIHRoYXQgYXJlbid0IGluY2x1ZGVkIGluIGFsbCB0aGUgY2lyY2xlc1xuICBjb25zdCBpbm5lclBvaW50cyA9IGludGVyc2VjdGlvblBvaW50cy5maWx0ZXIoKHApID0+IGNvbnRhaW5lZEluQ2lyY2xlcyhwLCBjaXJjbGVzKSk7XG5cbiAgbGV0IGFyY0FyZWEgPSAwO1xuICBsZXQgcG9seWdvbkFyZWEgPSAwO1xuICAvKiogQHR5cGUge3sgY2lyY2xlOiB7eDogbnVtYmVyLCB5OiBudW1iZXIsIHJhZGl1czogbnVtYmVyfSwgd2lkdGg6IG51bWJlciwgcDE6IHt4OiBudW1iZXIsIHk6IG51bWJlcn0sIHAyOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9IH1bXX0gKi9cbiAgY29uc3QgYXJjcyA9IFtdO1xuXG4gIC8vIGlmIHdlIGhhdmUgaW50ZXJzZWN0aW9uIHBvaW50cyB0aGF0IGFyZSB3aXRoaW4gYWxsIHRoZSBjaXJjbGVzLFxuICAvLyB0aGVuIGZpZ3VyZSBvdXQgdGhlIGFyZWEgY29udGFpbmVkIGJ5IHRoZW1cbiAgaWYgKGlubmVyUG9pbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAvLyBzb3J0IHRoZSBwb2ludHMgYnkgYW5nbGUgZnJvbSB0aGUgY2VudGVyIG9mIHRoZSBwb2x5Z29uLCB3aGljaCBsZXRzXG4gICAgLy8gdXMganVzdCBpdGVyYXRlIG92ZXIgcG9pbnRzIHRvIGdldCB0aGUgZWRnZXNcbiAgICBjb25zdCBjZW50ZXIgPSBnZXRDZW50ZXIoaW5uZXJQb2ludHMpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5uZXJQb2ludHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIGNvbnN0IHAgPSBpbm5lclBvaW50c1tpXTtcbiAgICAgIHAuYW5nbGUgPSBNYXRoLmF0YW4yKHAueCAtIGNlbnRlci54LCBwLnkgLSBjZW50ZXIueSk7XG4gICAgfVxuICAgIGlubmVyUG9pbnRzLnNvcnQoKGEsIGIpID0+IGIuYW5nbGUgLSBhLmFuZ2xlKTtcblxuICAgIC8vIGl0ZXJhdGUgb3ZlciBhbGwgcG9pbnRzLCBnZXQgYXJjIGJldHdlZW4gdGhlIHBvaW50c1xuICAgIC8vIGFuZCB1cGRhdGUgdGhlIGFyZWFzXG4gICAgbGV0IHAyID0gaW5uZXJQb2ludHNbaW5uZXJQb2ludHMubGVuZ3RoIC0gMV07XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbm5lclBvaW50cy5sZW5ndGg7ICsraSkge1xuICAgICAgY29uc3QgcDEgPSBpbm5lclBvaW50c1tpXTtcblxuICAgICAgLy8gcG9seWdvbiBhcmVhIHVwZGF0ZXMgZWFzaWx5IC4uLlxuICAgICAgcG9seWdvbkFyZWEgKz0gKHAyLnggKyBwMS54KSAqIChwMS55IC0gcDIueSk7XG5cbiAgICAgIC8vIHVwZGF0aW5nIHRoZSBhcmMgYXJlYSBpcyBhIGxpdHRsZSBtb3JlIGludm9sdmVkXG4gICAgICBjb25zdCBtaWRQb2ludCA9IHsgeDogKHAxLnggKyBwMi54KSAvIDIsIHk6IChwMS55ICsgcDIueSkgLyAyIH07XG4gICAgICAvKiogQHR5cGVzIG51bGwgfCB7IGNpcmNsZToge3g6IG51bWJlciwgeTogbnVtYmVyLCByYWRpdXM6IG51bWJlcn0sIHdpZHRoOiBudW1iZXIsIHAxOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9LCBwMjoge3g6IG51bWJlciwgeTogbnVtYmVyfSB9ICovXG4gICAgICBsZXQgYXJjID0gbnVsbDtcblxuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwMS5wYXJlbnRJbmRleC5sZW5ndGg7ICsraikge1xuICAgICAgICBpZiAocDIucGFyZW50SW5kZXguaW5jbHVkZXMocDEucGFyZW50SW5kZXhbal0pKSB7XG4gICAgICAgICAgLy8gZmlndXJlIG91dCB0aGUgYW5nbGUgaGFsZndheSBiZXR3ZWVuIHRoZSB0d28gcG9pbnRzXG4gICAgICAgICAgLy8gb24gdGhlIGN1cnJlbnQgY2lyY2xlXG4gICAgICAgICAgY29uc3QgY2lyY2xlID0gY2lyY2xlc1twMS5wYXJlbnRJbmRleFtqXV07XG4gICAgICAgICAgY29uc3QgYTEgPSBNYXRoLmF0YW4yKHAxLnggLSBjaXJjbGUueCwgcDEueSAtIGNpcmNsZS55KTtcbiAgICAgICAgICBjb25zdCBhMiA9IE1hdGguYXRhbjIocDIueCAtIGNpcmNsZS54LCBwMi55IC0gY2lyY2xlLnkpO1xuXG4gICAgICAgICAgbGV0IGFuZ2xlRGlmZiA9IGEyIC0gYTE7XG4gICAgICAgICAgaWYgKGFuZ2xlRGlmZiA8IDApIHtcbiAgICAgICAgICAgIGFuZ2xlRGlmZiArPSAyICogTWF0aC5QSTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBhbmQgdXNlIHRoYXQgYW5nbGUgdG8gZmlndXJlIG91dCB0aGUgd2lkdGggb2YgdGhlXG4gICAgICAgICAgLy8gYXJjXG4gICAgICAgICAgY29uc3QgYSA9IGEyIC0gYW5nbGVEaWZmIC8gMjtcbiAgICAgICAgICBsZXQgd2lkdGggPSBkaXN0YW5jZShtaWRQb2ludCwge1xuICAgICAgICAgICAgeDogY2lyY2xlLnggKyBjaXJjbGUucmFkaXVzICogTWF0aC5zaW4oYSksXG4gICAgICAgICAgICB5OiBjaXJjbGUueSArIGNpcmNsZS5yYWRpdXMgKiBNYXRoLmNvcyhhKSxcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIGNsYW1wIHRoZSB3aWR0aCB0byB0aGUgbGFyZ2VzdCBpcyBjYW4gYWN0dWFsbHkgYmVcbiAgICAgICAgICAvLyAoc29tZXRpbWVzIHNsaWdodGx5IG92ZXJmbG93cyBiZWNhdXNlIG9mIEZQIGVycm9ycylcbiAgICAgICAgICBpZiAod2lkdGggPiBjaXJjbGUucmFkaXVzICogMikge1xuICAgICAgICAgICAgd2lkdGggPSBjaXJjbGUucmFkaXVzICogMjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBwaWNrIHRoZSBjaXJjbGUgd2hvc2UgYXJjIGhhcyB0aGUgc21hbGxlc3Qgd2lkdGhcbiAgICAgICAgICBpZiAoYXJjID09IG51bGwgfHwgYXJjLndpZHRoID4gd2lkdGgpIHtcbiAgICAgICAgICAgIGFyYyA9IHsgY2lyY2xlLCB3aWR0aCwgcDEsIHAyLCBsYXJnZTogd2lkdGggPiBjaXJjbGUucmFkaXVzLCBzd2VlcDogdHJ1ZSB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoYXJjICE9IG51bGwpIHtcbiAgICAgICAgYXJjcy5wdXNoKGFyYyk7XG4gICAgICAgIGFyY0FyZWEgKz0gY2lyY2xlQXJlYShhcmMuY2lyY2xlLnJhZGl1cywgYXJjLndpZHRoKTtcbiAgICAgICAgcDIgPSBwMTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gbm8gaW50ZXJzZWN0aW9uIHBvaW50cywgaXMgZWl0aGVyIGRpc2pvaW50IC0gb3IgaXMgY29tcGxldGVseVxuICAgIC8vIG92ZXJsYXBwZWQuIGZpZ3VyZSBvdXQgd2hpY2ggYnkgZXhhbWluaW5nIHRoZSBzbWFsbGVzdCBjaXJjbGVcbiAgICBsZXQgc21hbGxlc3QgPSBjaXJjbGVzWzBdO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgY2lyY2xlcy5sZW5ndGg7ICsraSkge1xuICAgICAgaWYgKGNpcmNsZXNbaV0ucmFkaXVzIDwgc21hbGxlc3QucmFkaXVzKSB7XG4gICAgICAgIHNtYWxsZXN0ID0gY2lyY2xlc1tpXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBtYWtlIHN1cmUgdGhlIHNtYWxsZXN0IGNpcmNsZSBpcyBjb21wbGV0ZWx5IGNvbnRhaW5lZCBpbiBhbGxcbiAgICAvLyB0aGUgb3RoZXIgY2lyY2xlc1xuICAgIGxldCBkaXNqb2ludCA9IGZhbHNlO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2lyY2xlcy5sZW5ndGg7ICsraSkge1xuICAgICAgaWYgKGRpc3RhbmNlKGNpcmNsZXNbaV0sIHNtYWxsZXN0KSA+IE1hdGguYWJzKHNtYWxsZXN0LnJhZGl1cyAtIGNpcmNsZXNbaV0ucmFkaXVzKSkge1xuICAgICAgICBkaXNqb2ludCA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChkaXNqb2ludCkge1xuICAgICAgYXJjQXJlYSA9IHBvbHlnb25BcmVhID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgYXJjQXJlYSA9IHNtYWxsZXN0LnJhZGl1cyAqIHNtYWxsZXN0LnJhZGl1cyAqIE1hdGguUEk7XG4gICAgICBhcmNzLnB1c2goe1xuICAgICAgICBjaXJjbGU6IHNtYWxsZXN0LFxuICAgICAgICBwMTogeyB4OiBzbWFsbGVzdC54LCB5OiBzbWFsbGVzdC55ICsgc21hbGxlc3QucmFkaXVzIH0sXG4gICAgICAgIHAyOiB7IHg6IHNtYWxsZXN0LnggLSBTTUFMTCQxLCB5OiBzbWFsbGVzdC55ICsgc21hbGxlc3QucmFkaXVzIH0sXG4gICAgICAgIHdpZHRoOiBzbWFsbGVzdC5yYWRpdXMgKiAyLFxuICAgICAgICBsYXJnZTogdHJ1ZSxcbiAgICAgICAgc3dlZXA6IHRydWUsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwb2x5Z29uQXJlYSAvPSAyO1xuXG4gIGlmIChzdGF0cykge1xuICAgIHN0YXRzLmFyZWEgPSBhcmNBcmVhICsgcG9seWdvbkFyZWE7XG4gICAgc3RhdHMuYXJjQXJlYSA9IGFyY0FyZWE7XG4gICAgc3RhdHMucG9seWdvbkFyZWEgPSBwb2x5Z29uQXJlYTtcbiAgICBzdGF0cy5hcmNzID0gYXJjcztcbiAgICBzdGF0cy5pbm5lclBvaW50cyA9IGlubmVyUG9pbnRzO1xuICAgIHN0YXRzLmludGVyc2VjdGlvblBvaW50cyA9IGludGVyc2VjdGlvblBvaW50cztcbiAgfVxuXG4gIHJldHVybiBhcmNBcmVhICsgcG9seWdvbkFyZWE7XG59XG5cbi8qKlxuICogcmV0dXJucyB3aGV0aGVyIGEgcG9pbnQgaXMgY29udGFpbmVkIGJ5IGFsbCBvZiBhIGxpc3Qgb2YgY2lyY2xlc1xuICogQHBhcmFtIHt7eDogbnVtYmVyLCB5OiBudW1iZXJ9fSBwb2ludFxuICogQHBhcmFtIHtSZWFkb25seUFycmF5PHt4OiBudW1iZXIsIHk6IG51bWJlciwgcmFkaXVzOiBudW1iZXJ9Pn0gY2lyY2xlc1xuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGNvbnRhaW5lZEluQ2lyY2xlcyhwb2ludCwgY2lyY2xlcykge1xuICByZXR1cm4gY2lyY2xlcy5ldmVyeSgoY2lyY2xlKSA9PiBkaXN0YW5jZShwb2ludCwgY2lyY2xlKSA8IGNpcmNsZS5yYWRpdXMgKyBTTUFMTCQxKTtcbn1cblxuLyoqXG4gKiBHZXRzIGFsbCBpbnRlcnNlY3Rpb24gcG9pbnRzIGJldHdlZW4gYSBidW5jaCBvZiBjaXJjbGVzXG4gKiBAcGFyYW0ge1JlYWRvbmx5QXJyYXk8e3g6IG51bWJlciwgeTogbnVtYmVyLCByYWRpdXM6IG51bWJlcn0+fSBjaXJjbGVzXG4gKiBAcmV0dXJucyB7UmVhZG9ubHlBcnJheTx7eDogbnVtYmVyLCB5OiBudW1iZXIsIHBhcmVudEluZGV4OiBbbnVtYmVyLCBudW1iZXJdfT59XG4gKi9cbmZ1bmN0aW9uIGdldEludGVyc2VjdGlvblBvaW50cyhjaXJjbGVzKSB7XG4gIC8qKiBAdHlwZSB7e3g6IG51bWJlciwgeTogbnVtYmVyLCBwYXJlbnRJbmRleDogW251bWJlciwgbnVtYmVyXX1bXX0gKi9cbiAgY29uc3QgcmV0ID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY2lyY2xlcy5sZW5ndGg7ICsraSkge1xuICAgIGZvciAobGV0IGogPSBpICsgMTsgaiA8IGNpcmNsZXMubGVuZ3RoOyArK2opIHtcbiAgICAgIGNvbnN0IGludGVyc2VjdCA9IGNpcmNsZUNpcmNsZUludGVyc2VjdGlvbihjaXJjbGVzW2ldLCBjaXJjbGVzW2pdKTtcbiAgICAgIGZvciAoY29uc3QgcCBvZiBpbnRlcnNlY3QpIHtcbiAgICAgICAgcC5wYXJlbnRJbmRleCA9IFtpLCBqXTtcbiAgICAgICAgcmV0LnB1c2gocCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbi8qKlxuICogQ2lyY3VsYXIgc2VnbWVudCBhcmVhIGNhbGN1bGF0aW9uLiBTZWUgaHR0cDovL21hdGh3b3JsZC53b2xmcmFtLmNvbS9DaXJjdWxhclNlZ21lbnQuaHRtbFxuICogQHBhcmFtIHtudW1iZXJ9IHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aFxuICogQHJldHVybnMge251bWJlcn1cbiAqKi9cbmZ1bmN0aW9uIGNpcmNsZUFyZWEociwgd2lkdGgpIHtcbiAgcmV0dXJuIHIgKiByICogTWF0aC5hY29zKDEgLSB3aWR0aCAvIHIpIC0gKHIgLSB3aWR0aCkgKiBNYXRoLnNxcnQod2lkdGggKiAoMiAqIHIgLSB3aWR0aCkpO1xufVxuXG4vKipcbiAqIGV1Y2xpZGVhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byBwb2ludHNcbiAqIEBwYXJhbSB7e3g6IG51bWJlciwgeTogbnVtYmVyfX0gcDFcbiAqIEBwYXJhbSB7e3g6IG51bWJlciwgeTogbnVtYmVyfX0gcDJcbiAqIEByZXR1cm5zIHtudW1iZXJ9XG4gKiovXG5mdW5jdGlvbiBkaXN0YW5jZShwMSwgcDIpIHtcbiAgcmV0dXJuIE1hdGguc3FydCgocDEueCAtIHAyLngpICogKHAxLnggLSBwMi54KSArIChwMS55IC0gcDIueSkgKiAocDEueSAtIHAyLnkpKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBvdmVybGFwIGFyZWEgb2YgdHdvIGNpcmNsZXMgb2YgcmFkaXVzIHIxIGFuZCByMiAtIHRoYXRcbiAqIGhhdmUgdGhlaXIgY2VudGVycyBzZXBhcmF0ZWQgYnkgZGlzdGFuY2UgZC4gU2ltcGxlciBmYXN0ZXJcbiAqIGNpcmNsZSBpbnRlcnNlY3Rpb24gZm9yIG9ubHkgdHdvIGNpcmNsZXNcbiAqIEBwYXJhbSB7bnVtYmVyfSByMVxuICogQHBhcmFtIHtudW1iZXJ9IHIyXG4gKiBAcGFyYW0ge251bWJlcn0gZFxuICogQHJldHVybnMge251bWJlcn1cbiAqL1xuZnVuY3Rpb24gY2lyY2xlT3ZlcmxhcChyMSwgcjIsIGQpIHtcbiAgLy8gbm8gb3ZlcmxhcFxuICBpZiAoZCA+PSByMSArIHIyKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICAvLyBjb21wbGV0ZWx5IG92ZXJsYXBwZWRcbiAgaWYgKGQgPD0gTWF0aC5hYnMocjEgLSByMikpIHtcbiAgICByZXR1cm4gTWF0aC5QSSAqIE1hdGgubWluKHIxLCByMikgKiBNYXRoLm1pbihyMSwgcjIpO1xuICB9XG5cbiAgY29uc3QgdzEgPSByMSAtIChkICogZCAtIHIyICogcjIgKyByMSAqIHIxKSAvICgyICogZCk7XG4gIGNvbnN0IHcyID0gcjIgLSAoZCAqIGQgLSByMSAqIHIxICsgcjIgKiByMikgLyAoMiAqIGQpO1xuICByZXR1cm4gY2lyY2xlQXJlYShyMSwgdzEpICsgY2lyY2xlQXJlYShyMiwgdzIpO1xufVxuXG4vKipcbiAqIEdpdmVuIHR3byBjaXJjbGVzIChjb250YWluaW5nIGEgeC95L3JhZGl1cyBhdHRyaWJ1dGVzKSxcbiAqIHJldHVybnMgdGhlIGludGVyc2VjdGluZyBwb2ludHMgaWYgcG9zc2libGVcbiAqIG5vdGU6IGRvZXNuJ3QgaGFuZGxlIGNhc2VzIHdoZXJlIHRoZXJlIGFyZSBpbmZpbml0ZWx5IG1hbnlcbiAqIGludGVyc2VjdGlvbiBwb2ludHMgKGNpcmNsZXMgYXJlIGVxdWl2YWxlbnQpOiwgb3Igb25seSBvbmUgaW50ZXJzZWN0aW9uIHBvaW50XG4gKiBAcGFyYW0ge3t4OiBudW1iZXIsIHk6IG51bWJlciwgcmFkaXVzOiBudW1iZXJ9fSBwMVxuICogQHBhcmFtIHt7eDogbnVtYmVyLCB5OiBudW1iZXIsIHJhZGl1czogbnVtYmVyfX0gcDJcbiAqIEByZXR1cm5zIHtSZWFkb25seUFycmF5PHt4OiBudW1iZXIsIHk6IG51bWJlcn0+fVxuICoqL1xuZnVuY3Rpb24gY2lyY2xlQ2lyY2xlSW50ZXJzZWN0aW9uKHAxLCBwMikge1xuICBjb25zdCBkID0gZGlzdGFuY2UocDEsIHAyKTtcbiAgY29uc3QgcjEgPSBwMS5yYWRpdXM7XG4gIGNvbnN0IHIyID0gcDIucmFkaXVzO1xuXG4gIC8vIGlmIHRvIGZhciBhd2F5LCBvciBzZWxmIGNvbnRhaW5lZCAtIGNhbid0IGJlIGRvbmVcbiAgaWYgKGQgPj0gcjEgKyByMiB8fCBkIDw9IE1hdGguYWJzKHIxIC0gcjIpKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgY29uc3QgYSA9IChyMSAqIHIxIC0gcjIgKiByMiArIGQgKiBkKSAvICgyICogZCk7XG4gIGNvbnN0IGggPSBNYXRoLnNxcnQocjEgKiByMSAtIGEgKiBhKTtcbiAgY29uc3QgeDAgPSBwMS54ICsgKGEgKiAocDIueCAtIHAxLngpKSAvIGQ7XG4gIGNvbnN0IHkwID0gcDEueSArIChhICogKHAyLnkgLSBwMS55KSkgLyBkO1xuICBjb25zdCByeCA9IC0ocDIueSAtIHAxLnkpICogKGggLyBkKTtcbiAgY29uc3QgcnkgPSAtKHAyLnggLSBwMS54KSAqIChoIC8gZCk7XG5cbiAgcmV0dXJuIFtcbiAgICB7IHg6IHgwICsgcngsIHk6IHkwIC0gcnkgfSxcbiAgICB7IHg6IHgwIC0gcngsIHk6IHkwICsgcnkgfSxcbiAgXTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBjZW50ZXIgb2YgYSBidW5jaCBvZiBwb2ludHNcbiAqIEBwYXJhbSB7UmVhZG9ubHlBcnJheTx7eDogbnVtYmVyLCB5OiBudW1iZXJ9Pn0gcG9pbnRzXG4gKiBAcmV0dXJucyB7e3g6IG51bWJlciwgeTogbnVtYmVyfX1cbiAqL1xuZnVuY3Rpb24gZ2V0Q2VudGVyKHBvaW50cykge1xuICBjb25zdCBjZW50ZXIgPSB7IHg6IDAsIHk6IDAgfTtcbiAgZm9yIChjb25zdCBwb2ludCBvZiBwb2ludHMpIHtcbiAgICBjZW50ZXIueCArPSBwb2ludC54O1xuICAgIGNlbnRlci55ICs9IHBvaW50Lnk7XG4gIH1cbiAgY2VudGVyLnggLz0gcG9pbnRzLmxlbmd0aDtcbiAgY2VudGVyLnkgLz0gcG9pbnRzLmxlbmd0aDtcbiAgcmV0dXJuIGNlbnRlcjtcbn1cblxuLyoqIGZpbmRzIHRoZSB6ZXJvcyBvZiBhIGZ1bmN0aW9uLCBnaXZlbiB0d28gc3RhcnRpbmcgcG9pbnRzICh3aGljaCBtdXN0XG4gKiBoYXZlIG9wcG9zaXRlIHNpZ25zICovXG5mdW5jdGlvbiBiaXNlY3QoZiwgYSwgYiwgcGFyYW1ldGVycykge1xuICAgIHBhcmFtZXRlcnMgPSBwYXJhbWV0ZXJzIHx8IHt9O1xuICAgIGNvbnN0IG1heEl0ZXJhdGlvbnMgPSBwYXJhbWV0ZXJzLm1heEl0ZXJhdGlvbnMgfHwgMTAwO1xuICAgIGNvbnN0IHRvbGVyYW5jZSA9IHBhcmFtZXRlcnMudG9sZXJhbmNlIHx8IDFlLTEwO1xuICAgIGNvbnN0IGZBID0gZihhKTtcbiAgICBjb25zdCBmQiA9IGYoYik7XG4gICAgbGV0IGRlbHRhID0gYiAtIGE7XG5cbiAgICBpZiAoZkEgKiBmQiA+IDApIHtcbiAgICAgICAgdGhyb3cgJ0luaXRpYWwgYmlzZWN0IHBvaW50cyBtdXN0IGhhdmUgb3Bwb3NpdGUgc2lnbnMnO1xuICAgIH1cblxuICAgIGlmIChmQSA9PT0gMCkgcmV0dXJuIGE7XG4gICAgaWYgKGZCID09PSAwKSByZXR1cm4gYjtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWF4SXRlcmF0aW9uczsgKytpKSB7XG4gICAgICAgIGRlbHRhIC89IDI7XG4gICAgICAgIGNvbnN0IG1pZCA9IGEgKyBkZWx0YTtcbiAgICAgICAgY29uc3QgZk1pZCA9IGYobWlkKTtcblxuICAgICAgICBpZiAoZk1pZCAqIGZBID49IDApIHtcbiAgICAgICAgICAgIGEgPSBtaWQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoTWF0aC5hYnMoZGVsdGEpIDwgdG9sZXJhbmNlIHx8IGZNaWQgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBtaWQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGEgKyBkZWx0YTtcbn1cblxuLy8gbmVlZCBzb21lIGJhc2ljIG9wZXJhdGlvbnMgb24gdmVjdG9ycywgcmF0aGVyIHRoYW4gYWRkaW5nIGEgZGVwZW5kZW5jeSxcbi8vIGp1c3QgZGVmaW5lIGhlcmVcbmZ1bmN0aW9uIHplcm9zKHgpIHtcbiAgICBjb25zdCByID0gbmV3IEFycmF5KHgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgeDsgKytpKSB7XG4gICAgICAgIHJbaV0gPSAwO1xuICAgIH1cbiAgICByZXR1cm4gcjtcbn1cbmZ1bmN0aW9uIHplcm9zTSh4LCB5KSB7XG4gICAgcmV0dXJuIHplcm9zKHgpLm1hcCgoKSA9PiB6ZXJvcyh5KSk7XG59XG5cbmZ1bmN0aW9uIGRvdChhLCBiKSB7XG4gICAgbGV0IHJldCA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHJldCArPSBhW2ldICogYltpXTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gbm9ybTIoYSkge1xuICAgIHJldHVybiBNYXRoLnNxcnQoZG90KGEsIGEpKTtcbn1cblxuZnVuY3Rpb24gc2NhbGUocmV0LCB2YWx1ZSwgYykge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgcmV0W2ldID0gdmFsdWVbaV0gKiBjO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gd2VpZ2h0ZWRTdW0ocmV0LCB3MSwgdjEsIHcyLCB2Mikge1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgcmV0Lmxlbmd0aDsgKytqKSB7XG4gICAgICAgIHJldFtqXSA9IHcxICogdjFbal0gKyB3MiAqIHYyW2pdO1xuICAgIH1cbn1cblxuLyoqIG1pbmltaXplcyBhIGZ1bmN0aW9uIHVzaW5nIHRoZSBkb3duaGlsbCBzaW1wbGV4IG1ldGhvZCAqL1xuZnVuY3Rpb24gbmVsZGVyTWVhZChmLCB4MCwgcGFyYW1ldGVycykge1xuICAgIHBhcmFtZXRlcnMgPSBwYXJhbWV0ZXJzIHx8IHt9O1xuXG4gICAgY29uc3QgbWF4SXRlcmF0aW9ucyA9IHBhcmFtZXRlcnMubWF4SXRlcmF0aW9ucyB8fCB4MC5sZW5ndGggKiAyMDA7XG4gICAgY29uc3Qgbm9uWmVyb0RlbHRhID0gcGFyYW1ldGVycy5ub25aZXJvRGVsdGEgfHwgMS4wNTtcbiAgICBjb25zdCB6ZXJvRGVsdGEgPSBwYXJhbWV0ZXJzLnplcm9EZWx0YSB8fCAwLjAwMTtcbiAgICBjb25zdCBtaW5FcnJvckRlbHRhID0gcGFyYW1ldGVycy5taW5FcnJvckRlbHRhIHx8IDFlLTY7XG4gICAgY29uc3QgbWluVG9sZXJhbmNlID0gcGFyYW1ldGVycy5taW5FcnJvckRlbHRhIHx8IDFlLTU7XG4gICAgY29uc3QgcmhvID0gcGFyYW1ldGVycy5yaG8gIT09IHVuZGVmaW5lZCA/IHBhcmFtZXRlcnMucmhvIDogMTtcbiAgICBjb25zdCBjaGkgPSBwYXJhbWV0ZXJzLmNoaSAhPT0gdW5kZWZpbmVkID8gcGFyYW1ldGVycy5jaGkgOiAyO1xuICAgIGNvbnN0IHBzaSA9IHBhcmFtZXRlcnMucHNpICE9PSB1bmRlZmluZWQgPyBwYXJhbWV0ZXJzLnBzaSA6IC0wLjU7XG4gICAgY29uc3Qgc2lnbWEgPSBwYXJhbWV0ZXJzLnNpZ21hICE9PSB1bmRlZmluZWQgPyBwYXJhbWV0ZXJzLnNpZ21hIDogMC41O1xuICAgIGxldCBtYXhEaWZmO1xuXG4gICAgLy8gaW5pdGlhbGl6ZSBzaW1wbGV4LlxuICAgIGNvbnN0IE4gPSB4MC5sZW5ndGg7XG4gICAgY29uc3Qgc2ltcGxleCA9IG5ldyBBcnJheShOICsgMSk7XG4gICAgc2ltcGxleFswXSA9IHgwO1xuICAgIHNpbXBsZXhbMF0uZnggPSBmKHgwKTtcbiAgICBzaW1wbGV4WzBdLmlkID0gMDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IE47ICsraSkge1xuICAgICAgICBjb25zdCBwb2ludCA9IHgwLnNsaWNlKCk7XG4gICAgICAgIHBvaW50W2ldID0gcG9pbnRbaV0gPyBwb2ludFtpXSAqIG5vblplcm9EZWx0YSA6IHplcm9EZWx0YTtcbiAgICAgICAgc2ltcGxleFtpICsgMV0gPSBwb2ludDtcbiAgICAgICAgc2ltcGxleFtpICsgMV0uZnggPSBmKHBvaW50KTtcbiAgICAgICAgc2ltcGxleFtpICsgMV0uaWQgPSBpICsgMTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVTaW1wbGV4KHZhbHVlKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNpbXBsZXhbTl1baV0gPSB2YWx1ZVtpXTtcbiAgICAgICAgfVxuICAgICAgICBzaW1wbGV4W05dLmZ4ID0gdmFsdWUuZng7XG4gICAgfVxuXG4gICAgY29uc3Qgc29ydE9yZGVyID0gKGEsIGIpID0+IGEuZnggLSBiLmZ4O1xuXG4gICAgY29uc3QgY2VudHJvaWQgPSB4MC5zbGljZSgpO1xuICAgIGNvbnN0IHJlZmxlY3RlZCA9IHgwLnNsaWNlKCk7XG4gICAgY29uc3QgY29udHJhY3RlZCA9IHgwLnNsaWNlKCk7XG4gICAgY29uc3QgZXhwYW5kZWQgPSB4MC5zbGljZSgpO1xuXG4gICAgZm9yIChsZXQgaXRlcmF0aW9uID0gMDsgaXRlcmF0aW9uIDwgbWF4SXRlcmF0aW9uczsgKytpdGVyYXRpb24pIHtcbiAgICAgICAgc2ltcGxleC5zb3J0KHNvcnRPcmRlcik7XG5cbiAgICAgICAgaWYgKHBhcmFtZXRlcnMuaGlzdG9yeSkge1xuICAgICAgICAgICAgLy8gY29weSB0aGUgc2ltcGxleCAoc2luY2UgbGF0ZXIgaXRlcmF0aW9ucyB3aWxsIG11dGF0ZSkgYW5kXG4gICAgICAgICAgICAvLyBzb3J0IGl0IHRvIGhhdmUgYSBjb25zaXN0ZW50IG9yZGVyIGJldHdlZW4gaXRlcmF0aW9uc1xuICAgICAgICAgICAgY29uc3Qgc29ydGVkU2ltcGxleCA9IHNpbXBsZXgubWFwKCh4KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhdGUgPSB4LnNsaWNlKCk7XG4gICAgICAgICAgICAgICAgc3RhdGUuZnggPSB4LmZ4O1xuICAgICAgICAgICAgICAgIHN0YXRlLmlkID0geC5pZDtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNvcnRlZFNpbXBsZXguc29ydCgoYSwgYikgPT4gYS5pZCAtIGIuaWQpO1xuXG4gICAgICAgICAgICBwYXJhbWV0ZXJzLmhpc3RvcnkucHVzaCh7XG4gICAgICAgICAgICAgICAgeDogc2ltcGxleFswXS5zbGljZSgpLFxuICAgICAgICAgICAgICAgIGZ4OiBzaW1wbGV4WzBdLmZ4LFxuICAgICAgICAgICAgICAgIHNpbXBsZXg6IHNvcnRlZFNpbXBsZXgsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIG1heERpZmYgPSAwO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IE47ICsraSkge1xuICAgICAgICAgICAgbWF4RGlmZiA9IE1hdGgubWF4KG1heERpZmYsIE1hdGguYWJzKHNpbXBsZXhbMF1baV0gLSBzaW1wbGV4WzFdW2ldKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoTWF0aC5hYnMoc2ltcGxleFswXS5meCAtIHNpbXBsZXhbTl0uZngpIDwgbWluRXJyb3JEZWx0YSAmJiBtYXhEaWZmIDwgbWluVG9sZXJhbmNlKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNvbXB1dGUgdGhlIGNlbnRyb2lkIG9mIGFsbCBidXQgdGhlIHdvcnN0IHBvaW50IGluIHRoZSBzaW1wbGV4XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgTjsgKytpKSB7XG4gICAgICAgICAgICBjZW50cm9pZFtpXSA9IDA7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IE47ICsraikge1xuICAgICAgICAgICAgICAgIGNlbnRyb2lkW2ldICs9IHNpbXBsZXhbal1baV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjZW50cm9pZFtpXSAvPSBOO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmVmbGVjdCB0aGUgd29yc3QgcG9pbnQgcGFzdCB0aGUgY2VudHJvaWQgIGFuZCBjb21wdXRlIGxvc3MgYXQgcmVmbGVjdGVkXG4gICAgICAgIC8vIHBvaW50XG4gICAgICAgIGNvbnN0IHdvcnN0ID0gc2ltcGxleFtOXTtcbiAgICAgICAgd2VpZ2h0ZWRTdW0ocmVmbGVjdGVkLCAxICsgcmhvLCBjZW50cm9pZCwgLXJobywgd29yc3QpO1xuICAgICAgICByZWZsZWN0ZWQuZnggPSBmKHJlZmxlY3RlZCk7XG5cbiAgICAgICAgLy8gaWYgdGhlIHJlZmxlY3RlZCBwb2ludCBpcyB0aGUgYmVzdCBzZWVuLCB0aGVuIHBvc3NpYmx5IGV4cGFuZFxuICAgICAgICBpZiAocmVmbGVjdGVkLmZ4IDwgc2ltcGxleFswXS5meCkge1xuICAgICAgICAgICAgd2VpZ2h0ZWRTdW0oZXhwYW5kZWQsIDEgKyBjaGksIGNlbnRyb2lkLCAtY2hpLCB3b3JzdCk7XG4gICAgICAgICAgICBleHBhbmRlZC5meCA9IGYoZXhwYW5kZWQpO1xuICAgICAgICAgICAgaWYgKGV4cGFuZGVkLmZ4IDwgcmVmbGVjdGVkLmZ4KSB7XG4gICAgICAgICAgICAgICAgdXBkYXRlU2ltcGxleChleHBhbmRlZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHVwZGF0ZVNpbXBsZXgocmVmbGVjdGVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIHRoZSByZWZsZWN0ZWQgcG9pbnQgaXMgd29yc2UgdGhhbiB0aGUgc2Vjb25kIHdvcnN0LCB3ZSBuZWVkIHRvXG4gICAgICAgIC8vIGNvbnRyYWN0XG4gICAgICAgIGVsc2UgaWYgKHJlZmxlY3RlZC5meCA+PSBzaW1wbGV4W04gLSAxXS5meCkge1xuICAgICAgICAgICAgbGV0IHNob3VsZFJlZHVjZSA9IGZhbHNlO1xuXG4gICAgICAgICAgICBpZiAocmVmbGVjdGVkLmZ4ID4gd29yc3QuZngpIHtcbiAgICAgICAgICAgICAgICAvLyBkbyBhbiBpbnNpZGUgY29udHJhY3Rpb25cbiAgICAgICAgICAgICAgICB3ZWlnaHRlZFN1bShjb250cmFjdGVkLCAxICsgcHNpLCBjZW50cm9pZCwgLXBzaSwgd29yc3QpO1xuICAgICAgICAgICAgICAgIGNvbnRyYWN0ZWQuZnggPSBmKGNvbnRyYWN0ZWQpO1xuICAgICAgICAgICAgICAgIGlmIChjb250cmFjdGVkLmZ4IDwgd29yc3QuZngpIHtcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlU2ltcGxleChjb250cmFjdGVkKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzaG91bGRSZWR1Y2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gZG8gYW4gb3V0c2lkZSBjb250cmFjdGlvblxuICAgICAgICAgICAgICAgIHdlaWdodGVkU3VtKGNvbnRyYWN0ZWQsIDEgLSBwc2kgKiByaG8sIGNlbnRyb2lkLCBwc2kgKiByaG8sIHdvcnN0KTtcbiAgICAgICAgICAgICAgICBjb250cmFjdGVkLmZ4ID0gZihjb250cmFjdGVkKTtcbiAgICAgICAgICAgICAgICBpZiAoY29udHJhY3RlZC5meCA8IHJlZmxlY3RlZC5meCkge1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVTaW1wbGV4KGNvbnRyYWN0ZWQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNob3VsZFJlZHVjZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc2hvdWxkUmVkdWNlKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgd2UgZG9uJ3QgY29udHJhY3QgaGVyZSwgd2UncmUgZG9uZVxuICAgICAgICAgICAgICAgIGlmIChzaWdtYSA+PSAxKSBicmVhaztcblxuICAgICAgICAgICAgICAgIC8vIGRvIGEgcmVkdWN0aW9uXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBzaW1wbGV4Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgICAgIHdlaWdodGVkU3VtKHNpbXBsZXhbaV0sIDEgLSBzaWdtYSwgc2ltcGxleFswXSwgc2lnbWEsIHNpbXBsZXhbaV0pO1xuICAgICAgICAgICAgICAgICAgICBzaW1wbGV4W2ldLmZ4ID0gZihzaW1wbGV4W2ldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1cGRhdGVTaW1wbGV4KHJlZmxlY3RlZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzaW1wbGV4LnNvcnQoc29ydE9yZGVyKTtcbiAgICByZXR1cm4geyBmeDogc2ltcGxleFswXS5meCwgeDogc2ltcGxleFswXSB9O1xufVxuXG4vLy8gc2VhcmNoZXMgYWxvbmcgbGluZSAncGsnIGZvciBhIHBvaW50IHRoYXQgc2F0aWZpZXMgdGhlIHdvbGZlIGNvbmRpdGlvbnNcbi8vLyBTZWUgJ051bWVyaWNhbCBPcHRpbWl6YXRpb24nIGJ5IE5vY2VkYWwgYW5kIFdyaWdodCBwNTktNjBcbi8vLyBmIDogb2JqZWN0aXZlIGZ1bmN0aW9uXG4vLy8gcGsgOiBzZWFyY2ggZGlyZWN0aW9uXG4vLy8gY3VycmVudDogb2JqZWN0IGNvbnRhaW5pbmcgY3VycmVudCBncmFkaWVudC9sb3NzXG4vLy8gbmV4dDogb3V0cHV0OiBjb250YWlucyBuZXh0IGdyYWRpZW50L2xvc3Ncbi8vLyByZXR1cm5zIGE6IHN0ZXAgc2l6ZSB0YWtlblxuZnVuY3Rpb24gd29sZmVMaW5lU2VhcmNoKGYsIHBrLCBjdXJyZW50LCBuZXh0LCBhLCBjMSwgYzIpIHtcbiAgICBjb25zdCBwaGkwID0gY3VycmVudC5meDtcbiAgICBjb25zdCBwaGlQcmltZTAgPSBkb3QoY3VycmVudC5meHByaW1lLCBwayk7XG4gICAgbGV0IHBoaSA9IHBoaTA7XG4gICAgbGV0IHBoaV9vbGQgPSBwaGkwO1xuICAgIGxldCBwaGlQcmltZSA9IHBoaVByaW1lMDtcbiAgICBsZXQgYTAgPSAwO1xuXG4gICAgYSA9IGEgfHwgMTtcbiAgICBjMSA9IGMxIHx8IDFlLTY7XG4gICAgYzIgPSBjMiB8fCAwLjE7XG5cbiAgICBmdW5jdGlvbiB6b29tKGFfbG8sIGFfaGlnaCwgcGhpX2xvKSB7XG4gICAgICAgIGZvciAobGV0IGl0ZXJhdGlvbiA9IDA7IGl0ZXJhdGlvbiA8IDE2OyArK2l0ZXJhdGlvbikge1xuICAgICAgICAgICAgYSA9IChhX2xvICsgYV9oaWdoKSAvIDI7XG4gICAgICAgICAgICB3ZWlnaHRlZFN1bShuZXh0LngsIDEuMCwgY3VycmVudC54LCBhLCBwayk7XG4gICAgICAgICAgICBwaGkgPSBuZXh0LmZ4ID0gZihuZXh0LngsIG5leHQuZnhwcmltZSk7XG4gICAgICAgICAgICBwaGlQcmltZSA9IGRvdChuZXh0LmZ4cHJpbWUsIHBrKTtcblxuICAgICAgICAgICAgaWYgKHBoaSA+IHBoaTAgKyBjMSAqIGEgKiBwaGlQcmltZTAgfHwgcGhpID49IHBoaV9sbykge1xuICAgICAgICAgICAgICAgIGFfaGlnaCA9IGE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChNYXRoLmFicyhwaGlQcmltZSkgPD0gLWMyICogcGhpUHJpbWUwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChwaGlQcmltZSAqIChhX2hpZ2ggLSBhX2xvKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGFfaGlnaCA9IGFfbG87XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYV9sbyA9IGE7XG4gICAgICAgICAgICAgICAgcGhpX2xvID0gcGhpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaXRlcmF0aW9uID0gMDsgaXRlcmF0aW9uIDwgMTA7ICsraXRlcmF0aW9uKSB7XG4gICAgICAgIHdlaWdodGVkU3VtKG5leHQueCwgMS4wLCBjdXJyZW50LngsIGEsIHBrKTtcbiAgICAgICAgcGhpID0gbmV4dC5meCA9IGYobmV4dC54LCBuZXh0LmZ4cHJpbWUpO1xuICAgICAgICBwaGlQcmltZSA9IGRvdChuZXh0LmZ4cHJpbWUsIHBrKTtcbiAgICAgICAgaWYgKHBoaSA+IHBoaTAgKyBjMSAqIGEgKiBwaGlQcmltZTAgfHwgKGl0ZXJhdGlvbiAmJiBwaGkgPj0gcGhpX29sZCkpIHtcbiAgICAgICAgICAgIHJldHVybiB6b29tKGEwLCBhLCBwaGlfb2xkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChNYXRoLmFicyhwaGlQcmltZSkgPD0gLWMyICogcGhpUHJpbWUwKSB7XG4gICAgICAgICAgICByZXR1cm4gYTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwaGlQcmltZSA+PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gem9vbShhLCBhMCwgcGhpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBoaV9vbGQgPSBwaGk7XG4gICAgICAgIGEwID0gYTtcbiAgICAgICAgYSAqPSAyO1xuICAgIH1cblxuICAgIHJldHVybiBhO1xufVxuXG5mdW5jdGlvbiBjb25qdWdhdGVHcmFkaWVudChmLCBpbml0aWFsLCBwYXJhbXMpIHtcbiAgICAvLyBhbGxvY2F0ZSBhbGwgbWVtb3J5IHVwIGZyb250IGhlcmUsIGtlZXAgb3V0IG9mIHRoZSBsb29wIGZvciBwZXJmb21hbmNlXG4gICAgLy8gcmVhc29uc1xuICAgIGxldCBjdXJyZW50ID0geyB4OiBpbml0aWFsLnNsaWNlKCksIGZ4OiAwLCBmeHByaW1lOiBpbml0aWFsLnNsaWNlKCkgfTtcbiAgICBsZXQgbmV4dCA9IHsgeDogaW5pdGlhbC5zbGljZSgpLCBmeDogMCwgZnhwcmltZTogaW5pdGlhbC5zbGljZSgpIH07XG4gICAgY29uc3QgeWsgPSBpbml0aWFsLnNsaWNlKCk7XG4gICAgbGV0IHBrO1xuICAgIGxldCB0ZW1wO1xuICAgIGxldCBhID0gMTtcbiAgICBsZXQgbWF4SXRlcmF0aW9ucztcblxuICAgIHBhcmFtcyA9IHBhcmFtcyB8fCB7fTtcbiAgICBtYXhJdGVyYXRpb25zID0gcGFyYW1zLm1heEl0ZXJhdGlvbnMgfHwgaW5pdGlhbC5sZW5ndGggKiAyMDtcblxuICAgIGN1cnJlbnQuZnggPSBmKGN1cnJlbnQueCwgY3VycmVudC5meHByaW1lKTtcbiAgICBwayA9IGN1cnJlbnQuZnhwcmltZS5zbGljZSgpO1xuICAgIHNjYWxlKHBrLCBjdXJyZW50LmZ4cHJpbWUsIC0xKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWF4SXRlcmF0aW9uczsgKytpKSB7XG4gICAgICAgIGEgPSB3b2xmZUxpbmVTZWFyY2goZiwgcGssIGN1cnJlbnQsIG5leHQsIGEpO1xuXG4gICAgICAgIC8vIHRvZG86IGhpc3RvcnkgaW4gd3Jvbmcgc3BvdD9cbiAgICAgICAgaWYgKHBhcmFtcy5oaXN0b3J5KSB7XG4gICAgICAgICAgICBwYXJhbXMuaGlzdG9yeS5wdXNoKHtcbiAgICAgICAgICAgICAgICB4OiBjdXJyZW50Lnguc2xpY2UoKSxcbiAgICAgICAgICAgICAgICBmeDogY3VycmVudC5meCxcbiAgICAgICAgICAgICAgICBmeHByaW1lOiBjdXJyZW50LmZ4cHJpbWUuc2xpY2UoKSxcbiAgICAgICAgICAgICAgICBhbHBoYTogYSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFhKSB7XG4gICAgICAgICAgICAvLyBmYWlpbGVkIHRvIGZpbmQgcG9pbnQgdGhhdCBzYXRpZmllcyB3b2xmZSBjb25kaXRpb25zLlxuICAgICAgICAgICAgLy8gcmVzZXQgZGlyZWN0aW9uIGZvciBuZXh0IGl0ZXJhdGlvblxuICAgICAgICAgICAgc2NhbGUocGssIGN1cnJlbnQuZnhwcmltZSwgLTEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gdXBkYXRlIGRpcmVjdGlvbiB1c2luZyBQb2xha+KAk1JpYmllcmUgQ0cgbWV0aG9kXG4gICAgICAgICAgICB3ZWlnaHRlZFN1bSh5aywgMSwgbmV4dC5meHByaW1lLCAtMSwgY3VycmVudC5meHByaW1lKTtcblxuICAgICAgICAgICAgY29uc3QgZGVsdGFfayA9IGRvdChjdXJyZW50LmZ4cHJpbWUsIGN1cnJlbnQuZnhwcmltZSk7XG4gICAgICAgICAgICBjb25zdCBiZXRhX2sgPSBNYXRoLm1heCgwLCBkb3QoeWssIG5leHQuZnhwcmltZSkgLyBkZWx0YV9rKTtcblxuICAgICAgICAgICAgd2VpZ2h0ZWRTdW0ocGssIGJldGFfaywgcGssIC0xLCBuZXh0LmZ4cHJpbWUpO1xuXG4gICAgICAgICAgICB0ZW1wID0gY3VycmVudDtcbiAgICAgICAgICAgIGN1cnJlbnQgPSBuZXh0O1xuICAgICAgICAgICAgbmV4dCA9IHRlbXA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobm9ybTIoY3VycmVudC5meHByaW1lKSA8PSAxZS01KSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwYXJhbXMuaGlzdG9yeSkge1xuICAgICAgICBwYXJhbXMuaGlzdG9yeS5wdXNoKHtcbiAgICAgICAgICAgIHg6IGN1cnJlbnQueC5zbGljZSgpLFxuICAgICAgICAgICAgZng6IGN1cnJlbnQuZngsXG4gICAgICAgICAgICBmeHByaW1lOiBjdXJyZW50LmZ4cHJpbWUuc2xpY2UoKSxcbiAgICAgICAgICAgIGFscGhhOiBhLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gY3VycmVudDtcbn1cblxuLyoqXG4gKiBnaXZlbiBhIGxpc3Qgb2Ygc2V0IG9iamVjdHMsIGFuZCB0aGVpciBjb3JyZXNwb25kaW5nIG92ZXJsYXBzXG4gKiB1cGRhdGVzIHRoZSAoeCwgeSwgcmFkaXVzKSBhdHRyaWJ1dGUgb24gZWFjaCBzZXQgc3VjaCB0aGF0IHRoZWlyIHBvc2l0aW9uc1xuICogcm91Z2hseSBjb3JyZXNwb25kIHRvIHRoZSBkZXNpcmVkIG92ZXJsYXBzXG4gKiBAcGFyYW0ge3JlYWRvbmx5IHtzZXRzOiByZWFkb25seSBzdHJpbmdbXTsgc2l6ZTogbnVtYmVyOyB3ZWlnaHQ/OiBudW1iZXJ9W119IHNldHNcbiAqIEByZXR1cm5zIHt7W3NldGlkOiBzdHJpbmddOiB7eDogbnVtYmVyLCB5OiBudW1iZXIsIHJhZGl1czogbnVtYmVyfX19XG4gKi9cbmZ1bmN0aW9uIHZlbm4oc2V0cywgcGFyYW1ldGVycyA9IHt9KSB7XG4gIHBhcmFtZXRlcnMubWF4SXRlcmF0aW9ucyA9IHBhcmFtZXRlcnMubWF4SXRlcmF0aW9ucyB8fCA1MDA7XG5cbiAgY29uc3QgaW5pdGlhbExheW91dCA9IHBhcmFtZXRlcnMuaW5pdGlhbExheW91dCB8fCBiZXN0SW5pdGlhbExheW91dDtcbiAgY29uc3QgbG9zcyA9IHBhcmFtZXRlcnMubG9zc0Z1bmN0aW9uIHx8IGxvc3NGdW5jdGlvbjtcblxuICAvLyBhZGQgaW4gbWlzc2luZyBwYWlyd2lzZSBhcmVhcyBhcyBoYXZpbmcgMCBzaXplXG4gIGNvbnN0IGFyZWFzID0gYWRkTWlzc2luZ0FyZWFzKHNldHMsIHBhcmFtZXRlcnMpO1xuXG4gIC8vIGluaXRpYWwgbGF5b3V0IGlzIGRvbmUgZ3JlZWRpbHlcbiAgY29uc3QgY2lyY2xlcyA9IGluaXRpYWxMYXlvdXQoYXJlYXMsIHBhcmFtZXRlcnMpO1xuXG4gIC8vIHRyYW5zZm9ybSB4L3kgY29vcmRpbmF0ZXMgdG8gYSB2ZWN0b3IgdG8gb3B0aW1pemVcbiAgY29uc3Qgc2V0aWRzID0gT2JqZWN0LmtleXMoY2lyY2xlcyk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyW119ICovXG4gIGNvbnN0IGluaXRpYWwgPSBbXTtcbiAgZm9yIChjb25zdCBzZXRpZCBvZiBzZXRpZHMpIHtcbiAgICBpbml0aWFsLnB1c2goY2lyY2xlc1tzZXRpZF0ueCk7XG4gICAgaW5pdGlhbC5wdXNoKGNpcmNsZXNbc2V0aWRdLnkpO1xuICB9XG5cbiAgLy8gb3B0aW1pemUgaW5pdGlhbCBsYXlvdXQgZnJvbSBvdXIgbG9zcyBmdW5jdGlvblxuICBjb25zdCBzb2x1dGlvbiA9IG5lbGRlck1lYWQoXG4gICAgKHZhbHVlcykgPT4ge1xuICAgICAgY29uc3QgY3VycmVudCA9IHt9O1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZXRpZHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3Qgc2V0aWQgPSBzZXRpZHNbaV07XG4gICAgICAgIGN1cnJlbnRbc2V0aWRdID0ge1xuICAgICAgICAgIHg6IHZhbHVlc1syICogaV0sXG4gICAgICAgICAgeTogdmFsdWVzWzIgKiBpICsgMV0sXG4gICAgICAgICAgcmFkaXVzOiBjaXJjbGVzW3NldGlkXS5yYWRpdXMsXG4gICAgICAgICAgLy8gc2l6ZSA6IGNpcmNsZXNbc2V0aWRdLnNpemVcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsb3NzKGN1cnJlbnQsIGFyZWFzKTtcbiAgICB9LFxuICAgIGluaXRpYWwsXG4gICAgcGFyYW1ldGVyc1xuICApO1xuXG4gIC8vIHRyYW5zZm9ybSBzb2x1dGlvbiB2ZWN0b3IgYmFjayB0byB4L3kgcG9pbnRzXG4gIGNvbnN0IHBvc2l0aW9ucyA9IHNvbHV0aW9uLng7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2V0aWRzLmxlbmd0aDsgKytpKSB7XG4gICAgY29uc3Qgc2V0aWQgPSBzZXRpZHNbaV07XG4gICAgY2lyY2xlc1tzZXRpZF0ueCA9IHBvc2l0aW9uc1syICogaV07XG4gICAgY2lyY2xlc1tzZXRpZF0ueSA9IHBvc2l0aW9uc1syICogaSArIDFdO1xuICB9XG5cbiAgcmV0dXJuIGNpcmNsZXM7XG59XG5cbmNvbnN0IFNNQUxMID0gMWUtMTA7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgZGlzdGFuY2UgbmVjZXNzYXJ5IGZvciB0d28gY2lyY2xlcyBvZiByYWRpdXMgcjEgKyByMiB0b1xuICogaGF2ZSB0aGUgb3ZlcmxhcCBhcmVhICdvdmVybGFwJ1xuICogQHBhcmFtIHtudW1iZXJ9IHIxXG4gKiBAcGFyYW0ge251bWJlcn0gcjJcbiAqIEBwYXJhbSB7bnVtYmVyfSBvdmVybGFwXG4gKiBAcmV0dXJucyB7bnVtYmVyfVxuICovXG5mdW5jdGlvbiBkaXN0YW5jZUZyb21JbnRlcnNlY3RBcmVhKHIxLCByMiwgb3ZlcmxhcCkge1xuICAvLyBoYW5kbGUgY29tcGxldGUgb3ZlcmxhcHBlZCBjaXJjbGVzXG4gIGlmIChNYXRoLm1pbihyMSwgcjIpICogTWF0aC5taW4ocjEsIHIyKSAqIE1hdGguUEkgPD0gb3ZlcmxhcCArIFNNQUxMKSB7XG4gICAgcmV0dXJuIE1hdGguYWJzKHIxIC0gcjIpO1xuICB9XG5cbiAgcmV0dXJuIGJpc2VjdCgoZGlzdGFuY2UpID0+IGNpcmNsZU92ZXJsYXAocjEsIHIyLCBkaXN0YW5jZSkgLSBvdmVybGFwLCAwLCByMSArIHIyKTtcbn1cblxuLyoqXG4gKiBNaXNzaW5nIHBhaXItd2lzZSBpbnRlcnNlY3Rpb24gYXJlYSBkYXRhIGNhbiBjYXVzZSBwcm9ibGVtczpcbiAqIHRyZWF0aW5nIGFzIGFuIHVua25vd24gbWVhbnMgdGhhdCBzZXRzIHdpbGwgYmUgbGFpZCBvdXQgb3ZlcmxhcHBpbmcsXG4gKiB3aGljaCBpc24ndCB3aGF0IHBlb3BsZSBleHBlY3QuIFRvIHJlZmxlY3QgdGhhdCB3ZSB3YW50IGRpc2pvaW50IHNldHNcbiAqIGhlcmUsIHNldCB0aGUgb3ZlcmxhcCB0byAwIGZvciBhbGwgbWlzc2luZyBwYWlyd2lzZSBzZXQgaW50ZXJzZWN0aW9uc1xuICogQHBhcmFtIHtSZWFkb25seUFycmF5PHtzZXRzOiBSZWFkb25seUFycmF5PHN0cmluZz4sIHNpemU6IG51bWJlcn0+fSBhcmVhc1xuICogQHJldHVybnMge1JlYWRvbmx5QXJyYXk8e3NldHM6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPiwgc2l6ZTogbnVtYmVyfT59XG4gKi9cbmZ1bmN0aW9uIGFkZE1pc3NpbmdBcmVhcyhhcmVhcywgcGFyYW1ldGVycyA9IHt9KSB7XG4gIGNvbnN0IGRpc3RpbmN0ID0gcGFyYW1ldGVycy5kaXN0aW5jdDtcbiAgY29uc3QgciA9IGFyZWFzLm1hcCgocykgPT4gT2JqZWN0LmFzc2lnbih7fSwgcykpO1xuXG4gIGZ1bmN0aW9uIHRvS2V5KGFycikge1xuICAgIHJldHVybiBhcnIuam9pbignOycpO1xuICB9XG5cbiAgaWYgKGRpc3RpbmN0KSB7XG4gICAgLy8gcmVjcmVhdGUgdGhlIGZ1bGwgb25lcyBieSBhZGRpbmcgdGhpbmdzIHVwIGJ1dCBqdXN0IHRvIGxldmVsIHR3byBzaW5jZSB0aGUgcmVzdCBkb2Vzbid0IG1hdHRlclxuICAgIC8qKiBAdHlwZXMgTWFwPHN0cmluZywgbnVtYmVyPiAqL1xuICAgIGNvbnN0IGNvdW50ID0gbmV3IE1hcCgpO1xuICAgIGZvciAoY29uc3QgYXJlYSBvZiByKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFyZWEuc2V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBzaSA9IFN0cmluZyhhcmVhLnNldHNbaV0pO1xuICAgICAgICBjb3VudC5zZXQoc2ksIGFyZWEuc2l6ZSArIChjb3VudC5nZXQoc2kpIHx8IDApKTtcbiAgICAgICAgZm9yIChsZXQgaiA9IGkgKyAxOyBqIDwgYXJlYS5zZXRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgY29uc3Qgc2ogPSBTdHJpbmcoYXJlYS5zZXRzW2pdKTtcbiAgICAgICAgICBjb25zdCBrMSA9IGAke3NpfTske3NqfWA7XG4gICAgICAgICAgY29uc3QgazIgPSBgJHtzan07JHtzaX1gO1xuICAgICAgICAgIGNvdW50LnNldChrMSwgYXJlYS5zaXplICsgKGNvdW50LmdldChrMSkgfHwgMCkpO1xuICAgICAgICAgIGNvdW50LnNldChrMiwgYXJlYS5zaXplICsgKGNvdW50LmdldChrMikgfHwgMCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAoY29uc3QgYXJlYSBvZiByKSB7XG4gICAgICBpZiAoYXJlYS5zZXRzLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgYXJlYS5zaXplID0gY291bnQuZ2V0KHRvS2V5KGFyZWEuc2V0cykpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIHR3byBjaXJjbGUgaW50ZXJzZWN0aW9ucyB0aGF0IGFyZW4ndCBkZWZpbmVkXG4gIGNvbnN0IGlkcyA9IFtdO1xuXG4gIC8qKiBAdHlwZSB7U2V0PHN0cmluZz59ICovXG4gIGNvbnN0IHBhaXJzID0gbmV3IFNldCgpO1xuICBmb3IgKGNvbnN0IGFyZWEgb2Ygcikge1xuICAgIGlmIChhcmVhLnNldHMubGVuZ3RoID09PSAxKSB7XG4gICAgICBpZHMucHVzaChhcmVhLnNldHNbMF0pO1xuICAgIH0gZWxzZSBpZiAoYXJlYS5zZXRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgY29uc3QgYSA9IGFyZWEuc2V0c1swXTtcbiAgICAgIGNvbnN0IGIgPSBhcmVhLnNldHNbMV07XG4gICAgICBwYWlycy5hZGQodG9LZXkoYXJlYS5zZXRzKSk7XG4gICAgICBwYWlycy5hZGQodG9LZXkoW2IsIGFdKSk7XG4gICAgfVxuICB9XG5cbiAgaWRzLnNvcnQoKGEsIGIpID0+IChhID09PSBiID8gMCA6IGEgPCBiID8gLTEgOiArMSkpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaWRzLmxlbmd0aDsgKytpKSB7XG4gICAgY29uc3QgYSA9IGlkc1tpXTtcbiAgICBmb3IgKGxldCBqID0gaSArIDE7IGogPCBpZHMubGVuZ3RoOyArK2opIHtcbiAgICAgIGNvbnN0IGIgPSBpZHNbal07XG4gICAgICBpZiAoIXBhaXJzLmhhcyh0b0tleShbYSwgYl0pKSkge1xuICAgICAgICByLnB1c2goeyBzZXRzOiBbYSwgYl0sIHNpemU6IDAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiByO1xufVxuXG4vKipcbiAqIFJldHVybnMgdHdvIG1hdHJpY2VzLCBvbmUgb2YgdGhlIGV1Y2xpZGVhbiBkaXN0YW5jZXMgYmV0d2VlbiB0aGUgc2V0c1xuICogYW5kIHRoZSBvdGhlciBpbmRpY2F0aW5nIGlmIHRoZXJlIGFyZSBzdWJzZXQgb3IgZGlzam9pbnQgc2V0IHJlbGF0aW9uc2hpcHNcbiAqIEBwYXJhbSB7UmVhZG9ubHlBcnJheTx7c2V0czogUmVhZG9ubHlBcnJheTxudW1iZXI+fT59IGFyZWFzXG4gKiBAcGFyYW0ge1JlYWRvbmx5QXJyYXk8e3NpemU6IG51bWJlcn0+fSBzZXRzXG4gKiBAcGFyYW0ge1JlYWRvbmx5QXJyYXk8bnVtYmVyPn0gc2V0aWRzXG4gKi9cbmZ1bmN0aW9uIGdldERpc3RhbmNlTWF0cmljZXMoYXJlYXMsIHNldHMsIHNldGlkcykge1xuICAvLyBpbml0aWFsaXplIGFuIGVtcHR5IGRpc3RhbmNlIG1hdHJpeCBiZXR3ZWVuIGFsbCB0aGUgcG9pbnRzXG4gIC8qKlxuICAgKiBAdHlwZSB7bnVtYmVyW11bXX1cbiAgICovXG4gIGNvbnN0IGRpc3RhbmNlcyA9IHplcm9zTShzZXRzLmxlbmd0aCwgc2V0cy5sZW5ndGgpO1xuICAvKipcbiAgICogQHR5cGUge251bWJlcltdW119XG4gICAqL1xuICBjb25zdCBjb25zdHJhaW50cyA9IHplcm9zTShzZXRzLmxlbmd0aCwgc2V0cy5sZW5ndGgpO1xuXG4gIC8vIGNvbXB1dGUgcmVxdWlyZWQgZGlzdGFuY2VzIGJldHdlZW4gYWxsIHRoZSBzZXRzIHN1Y2ggdGhhdFxuICAvLyB0aGUgYXJlYXMgbWF0Y2hcbiAgYXJlYXNcbiAgICAuZmlsdGVyKCh4KSA9PiB4LnNldHMubGVuZ3RoID09PSAyKVxuICAgIC5mb3JFYWNoKChjdXJyZW50KSA9PiB7XG4gICAgICBjb25zdCBsZWZ0ID0gc2V0aWRzW2N1cnJlbnQuc2V0c1swXV07XG4gICAgICBjb25zdCByaWdodCA9IHNldGlkc1tjdXJyZW50LnNldHNbMV1dO1xuICAgICAgY29uc3QgcjEgPSBNYXRoLnNxcnQoc2V0c1tsZWZ0XS5zaXplIC8gTWF0aC5QSSk7XG4gICAgICBjb25zdCByMiA9IE1hdGguc3FydChzZXRzW3JpZ2h0XS5zaXplIC8gTWF0aC5QSSk7XG4gICAgICBjb25zdCBkaXN0YW5jZSA9IGRpc3RhbmNlRnJvbUludGVyc2VjdEFyZWEocjEsIHIyLCBjdXJyZW50LnNpemUpO1xuXG4gICAgICBkaXN0YW5jZXNbbGVmdF1bcmlnaHRdID0gZGlzdGFuY2VzW3JpZ2h0XVtsZWZ0XSA9IGRpc3RhbmNlO1xuXG4gICAgICAvLyBhbHNvIHVwZGF0ZSBjb25zdHJhaW50cyB0byBpbmRpY2F0ZSBpZiBpdHMgYSBzdWJzZXQgb3IgZGlzam9pbnRcbiAgICAgIC8vIHJlbGF0aW9uc2hpcFxuICAgICAgbGV0IGMgPSAwO1xuICAgICAgaWYgKGN1cnJlbnQuc2l6ZSArIDFlLTEwID49IE1hdGgubWluKHNldHNbbGVmdF0uc2l6ZSwgc2V0c1tyaWdodF0uc2l6ZSkpIHtcbiAgICAgICAgYyA9IDE7XG4gICAgICB9IGVsc2UgaWYgKGN1cnJlbnQuc2l6ZSA8PSAxZS0xMCkge1xuICAgICAgICBjID0gLTE7XG4gICAgICB9XG4gICAgICBjb25zdHJhaW50c1tsZWZ0XVtyaWdodF0gPSBjb25zdHJhaW50c1tyaWdodF1bbGVmdF0gPSBjO1xuICAgIH0pO1xuXG4gIHJldHVybiB7IGRpc3RhbmNlcywgY29uc3RyYWludHMgfTtcbn1cblxuLy8vIGNvbXB1dGVzIHRoZSBncmFkaWVudCBhbmQgbG9zcyBzaW11bHRhbmVvdXNseSBmb3Igb3VyIGNvbnN0cmFpbmVkIE1EUyBvcHRpbWl6ZXJcbmZ1bmN0aW9uIGNvbnN0cmFpbmVkTURTR3JhZGllbnQoeCwgZnhwcmltZSwgZGlzdGFuY2VzLCBjb25zdHJhaW50cykge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGZ4cHJpbWUubGVuZ3RoOyArK2kpIHtcbiAgICBmeHByaW1lW2ldID0gMDtcbiAgfVxuXG4gIGxldCBsb3NzID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkaXN0YW5jZXMubGVuZ3RoOyArK2kpIHtcbiAgICBjb25zdCB4aSA9IHhbMiAqIGldO1xuICAgIGNvbnN0IHlpID0geFsyICogaSArIDFdO1xuICAgIGZvciAobGV0IGogPSBpICsgMTsgaiA8IGRpc3RhbmNlcy5sZW5ndGg7ICsraikge1xuICAgICAgY29uc3QgeGogPSB4WzIgKiBqXTtcbiAgICAgIGNvbnN0IHlqID0geFsyICogaiArIDFdO1xuICAgICAgY29uc3QgZGlqID0gZGlzdGFuY2VzW2ldW2pdO1xuICAgICAgY29uc3QgY29uc3RyYWludCA9IGNvbnN0cmFpbnRzW2ldW2pdO1xuXG4gICAgICBjb25zdCBzcXVhcmVkRGlzdGFuY2UgPSAoeGogLSB4aSkgKiAoeGogLSB4aSkgKyAoeWogLSB5aSkgKiAoeWogLSB5aSk7XG4gICAgICBjb25zdCBkaXN0YW5jZSA9IE1hdGguc3FydChzcXVhcmVkRGlzdGFuY2UpO1xuICAgICAgY29uc3QgZGVsdGEgPSBzcXVhcmVkRGlzdGFuY2UgLSBkaWogKiBkaWo7XG5cbiAgICAgIGlmICgoY29uc3RyYWludCA+IDAgJiYgZGlzdGFuY2UgPD0gZGlqKSB8fCAoY29uc3RyYWludCA8IDAgJiYgZGlzdGFuY2UgPj0gZGlqKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgbG9zcyArPSAyICogZGVsdGEgKiBkZWx0YTtcblxuICAgICAgZnhwcmltZVsyICogaV0gKz0gNCAqIGRlbHRhICogKHhpIC0geGopO1xuICAgICAgZnhwcmltZVsyICogaSArIDFdICs9IDQgKiBkZWx0YSAqICh5aSAtIHlqKTtcblxuICAgICAgZnhwcmltZVsyICogal0gKz0gNCAqIGRlbHRhICogKHhqIC0geGkpO1xuICAgICAgZnhwcmltZVsyICogaiArIDFdICs9IDQgKiBkZWx0YSAqICh5aiAtIHlpKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGxvc3M7XG59XG5cbi8qKlxuICogdGFrZXMgdGhlIGJlc3Qgd29ya2luZyB2YXJpYW50IG9mIGVpdGhlciBjb25zdHJhaW5lZCBNRFMgb3IgZ3JlZWR5XG4gKiBAcGFyYW0ge1JlYWRvbmx5QXJyYXk8e3NldHM6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPiwgc2l6ZTogbnVtYmVyfT59IGFyZWFzXG4gKi9cbmZ1bmN0aW9uIGJlc3RJbml0aWFsTGF5b3V0KGFyZWFzLCBwYXJhbXMgPSB7fSkge1xuICBsZXQgaW5pdGlhbCA9IGdyZWVkeUxheW91dChhcmVhcywgcGFyYW1zKTtcbiAgY29uc3QgbG9zcyA9IHBhcmFtcy5sb3NzRnVuY3Rpb24gfHwgbG9zc0Z1bmN0aW9uO1xuXG4gIC8vIGdyZWVkeWxheW91dCBpcyBzdWZmaWNpZW50IGZvciBhbGwgMi8zIGNpcmNsZSBjYXNlcy4gdHJ5IG91dFxuICAvLyBjb25zdHJhaW5lZCBNRFMgZm9yIGhpZ2hlciBvcmRlciBwcm9ibGVtcywgdGFrZSBpdHMgb3V0cHV0XG4gIC8vIGlmIGl0IG91dHBlcmZvcm1zLiAoZ3JlZWR5IGlzIGFlc3RoZXRpY2FsbHkgYmV0dGVyIG9uIDIvMyBjaXJjbGVzXG4gIC8vIHNpbmNlIGl0IGF4aXMgYWxpZ25zKVxuICBpZiAoYXJlYXMubGVuZ3RoID49IDgpIHtcbiAgICBjb25zdCBjb25zdHJhaW5lZCA9IGNvbnN0cmFpbmVkTURTTGF5b3V0KGFyZWFzLCBwYXJhbXMpO1xuICAgIGNvbnN0IGNvbnN0cmFpbmVkTG9zcyA9IGxvc3MoY29uc3RyYWluZWQsIGFyZWFzKTtcbiAgICBjb25zdCBncmVlZHlMb3NzID0gbG9zcyhpbml0aWFsLCBhcmVhcyk7XG5cbiAgICBpZiAoY29uc3RyYWluZWRMb3NzICsgMWUtOCA8IGdyZWVkeUxvc3MpIHtcbiAgICAgIGluaXRpYWwgPSBjb25zdHJhaW5lZDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGluaXRpYWw7XG59XG5cbi8qKlxuICogdXNlIHRoZSBjb25zdHJhaW5lZCBNRFMgdmFyaWFudCB0byBnZW5lcmF0ZSBhbiBpbml0aWFsIGxheW91dFxuICogQHBhcmFtIHtSZWFkb25seUFycmF5PHtzZXRzOiBSZWFkb25seUFycmF5PHN0cmluZz4sIHNpemU6IG51bWJlcn0+fSBhcmVhc1xuICogQHJldHVybnMge3tba2V5OiBzdHJpbmddOiB7eDogbnVtYmVyLCB5OiBudW1iZXIsIHJhZGl1czogbnVtYmVyfX19XG4gKi9cbmZ1bmN0aW9uIGNvbnN0cmFpbmVkTURTTGF5b3V0KGFyZWFzLCBwYXJhbXMgPSB7fSkge1xuICBjb25zdCByZXN0YXJ0cyA9IHBhcmFtcy5yZXN0YXJ0cyB8fCAxMDtcblxuICAvLyBiaWRpcmVjdGlvbmFsbHkgbWFwIHNldHMgdG8gYSByb3dpZCAgKHNvIHdlIGNhbiBjcmVhdGUgYSBtYXRyaXgpXG4gIGNvbnN0IHNldHMgPSBbXTtcbiAgY29uc3Qgc2V0aWRzID0ge307XG4gIGZvciAoY29uc3QgYXJlYSBvZiBhcmVhcykge1xuICAgIGlmIChhcmVhLnNldHMubGVuZ3RoID09PSAxKSB7XG4gICAgICBzZXRpZHNbYXJlYS5zZXRzWzBdXSA9IHNldHMubGVuZ3RoO1xuICAgICAgc2V0cy5wdXNoKGFyZWEpO1xuICAgIH1cbiAgfVxuXG4gIGxldCB7IGRpc3RhbmNlcywgY29uc3RyYWludHMgfSA9IGdldERpc3RhbmNlTWF0cmljZXMoYXJlYXMsIHNldHMsIHNldGlkcyk7XG5cbiAgLy8ga2VlcCBkaXN0YW5jZXMgYm91bmRlZCwgdGhpbmdzIGdldCBtZXNzZWQgdXAgb3RoZXJ3aXNlLlxuICAvLyBUT0RPOiBwcm9wZXIgcHJlY29uZGl0aW9uZXI/XG4gIGNvbnN0IG5vcm0gPSBub3JtMihkaXN0YW5jZXMubWFwKG5vcm0yKSkgLyBkaXN0YW5jZXMubGVuZ3RoO1xuICBkaXN0YW5jZXMgPSBkaXN0YW5jZXMubWFwKChyb3cpID0+IHJvdy5tYXAoKHZhbHVlKSA9PiB2YWx1ZSAvIG5vcm0pKTtcblxuICBjb25zdCBvYmogPSAoeCwgZnhwcmltZSkgPT4gY29uc3RyYWluZWRNRFNHcmFkaWVudCh4LCBmeHByaW1lLCBkaXN0YW5jZXMsIGNvbnN0cmFpbnRzKTtcblxuICBsZXQgYmVzdCA9IG51bGw7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcmVzdGFydHM7ICsraSkge1xuICAgIGNvbnN0IGluaXRpYWwgPSB6ZXJvcyhkaXN0YW5jZXMubGVuZ3RoICogMikubWFwKE1hdGgucmFuZG9tKTtcblxuICAgIGNvbnN0IGN1cnJlbnQgPSBjb25qdWdhdGVHcmFkaWVudChvYmosIGluaXRpYWwsIHBhcmFtcyk7XG4gICAgaWYgKCFiZXN0IHx8IGN1cnJlbnQuZnggPCBiZXN0LmZ4KSB7XG4gICAgICBiZXN0ID0gY3VycmVudDtcbiAgICB9XG4gIH1cblxuICBjb25zdCBwb3NpdGlvbnMgPSBiZXN0Lng7XG5cbiAgLy8gdHJhbnNsYXRlIHJvd3MgYmFjayB0byAoeCx5LHJhZGl1cykgY29vcmRpbmF0ZXNcbiAgLyoqIEB0eXBlIHt7W2tleTogc3RyaW5nXToge3g6IG51bWJlciwgeTogbnVtYmVyLCByYWRpdXM6IG51bWJlcn19fSAqL1xuICBjb25zdCBjaXJjbGVzID0ge307XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2V0cy5sZW5ndGg7ICsraSkge1xuICAgIGNvbnN0IHNldCA9IHNldHNbaV07XG4gICAgY2lyY2xlc1tzZXQuc2V0c1swXV0gPSB7XG4gICAgICB4OiBwb3NpdGlvbnNbMiAqIGldICogbm9ybSxcbiAgICAgIHk6IHBvc2l0aW9uc1syICogaSArIDFdICogbm9ybSxcbiAgICAgIHJhZGl1czogTWF0aC5zcXJ0KHNldC5zaXplIC8gTWF0aC5QSSksXG4gICAgfTtcbiAgfVxuXG4gIGlmIChwYXJhbXMuaGlzdG9yeSkge1xuICAgIGZvciAoY29uc3QgaCBvZiBwYXJhbXMuaGlzdG9yeSkge1xuICAgICAgc2NhbGUoaC54LCBub3JtKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNpcmNsZXM7XG59XG5cbi8qKlxuICogTGF5cyBvdXQgYSBWZW5uIGRpYWdyYW0gZ3JlZWRpbHksIGdvaW5nIGZyb20gbW9zdCBvdmVybGFwcGVkIHNldHMgdG9cbiAqIGxlYXN0IG92ZXJsYXBwZWQsIGF0dGVtcHRpbmcgdG8gcG9zaXRpb24gZWFjaCBuZXcgc2V0IHN1Y2ggdGhhdCB0aGVcbiAqIG92ZXJsYXBwaW5nIGFyZWFzIHRvIGFscmVhZHkgcG9zaXRpb25lZCBzZXRzIGFyZSBiYXNpY2FsbHkgcmlnaHRcbiAqIEBwYXJhbSB7UmVhZG9ubHlBcnJheTx7c2l6ZTogbnVtYmVyLCBzZXRzOiBSZWFkb25seUFycmF5PHN0cmluZz59Pn0gYXJlYXNcbiAqIEByZXR1cm4ge3tba2V5OiBzdHJpbmddOiB7eDogbnVtYmVyLCB5OiBudW1iZXIsIHJhZGl1czogbnVtYmVyfX19XG4gKi9cbmZ1bmN0aW9uIGdyZWVkeUxheW91dChhcmVhcywgcGFyYW1zKSB7XG4gIGNvbnN0IGxvc3MgPSBwYXJhbXMgJiYgcGFyYW1zLmxvc3NGdW5jdGlvbiA/IHBhcmFtcy5sb3NzRnVuY3Rpb24gOiBsb3NzRnVuY3Rpb247XG5cbiAgLy8gZGVmaW5lIGEgY2lyY2xlIGZvciBlYWNoIHNldFxuICAvKiogQHR5cGUge3tba2V5OiBzdHJpbmddOiB7eDogbnVtYmVyLCB5OiBudW1iZXIsIHJhZGl1czogbnVtYmVyfX19ICovXG4gIGNvbnN0IGNpcmNsZXMgPSB7fTtcbiAgLyoqIEB0eXBlIHt7W2tleTogc3RyaW5nXToge3NldDogc3RyaW5nLCBzaXplOiBudW1iZXIsIHdlaWdodDogbnVtYmVyfVtdfX0gKi9cbiAgY29uc3Qgc2V0T3ZlcmxhcHMgPSB7fTtcbiAgZm9yIChjb25zdCBhcmVhIG9mIGFyZWFzKSB7XG4gICAgaWYgKGFyZWEuc2V0cy5sZW5ndGggPT09IDEpIHtcbiAgICAgIGNvbnN0IHNldCA9IGFyZWEuc2V0c1swXTtcbiAgICAgIGNpcmNsZXNbc2V0XSA9IHtcbiAgICAgICAgeDogMWUxMCxcbiAgICAgICAgeTogMWUxMCxcbiAgICAgICAgcm93aWQ6IGNpcmNsZXMubGVuZ3RoLFxuICAgICAgICBzaXplOiBhcmVhLnNpemUsXG4gICAgICAgIHJhZGl1czogTWF0aC5zcXJ0KGFyZWEuc2l6ZSAvIE1hdGguUEkpLFxuICAgICAgfTtcbiAgICAgIHNldE92ZXJsYXBzW3NldF0gPSBbXTtcbiAgICB9XG4gIH1cblxuICBhcmVhcyA9IGFyZWFzLmZpbHRlcigoYSkgPT4gYS5zZXRzLmxlbmd0aCA9PT0gMik7XG5cbiAgLy8gbWFwIGVhY2ggc2V0IHRvIGEgbGlzdCBvZiBhbGwgdGhlIG90aGVyIHNldHMgdGhhdCBvdmVybGFwIGl0XG4gIGZvciAoY29uc3QgY3VycmVudCBvZiBhcmVhcykge1xuICAgIGxldCB3ZWlnaHQgPSBjdXJyZW50LndlaWdodCAhPSBudWxsID8gY3VycmVudC53ZWlnaHQgOiAxLjA7XG4gICAgY29uc3QgbGVmdCA9IGN1cnJlbnQuc2V0c1swXTtcbiAgICBjb25zdCByaWdodCA9IGN1cnJlbnQuc2V0c1sxXTtcblxuICAgIC8vIGNvbXBsZXRlbHkgb3ZlcmxhcHBlZCBjaXJjbGVzIHNob3VsZG4ndCBiZSBwb3NpdGlvbmVkIGVhcmx5IGhlcmVcbiAgICBpZiAoY3VycmVudC5zaXplICsgU01BTEwgPj0gTWF0aC5taW4oY2lyY2xlc1tsZWZ0XS5zaXplLCBjaXJjbGVzW3JpZ2h0XS5zaXplKSkge1xuICAgICAgd2VpZ2h0ID0gMDtcbiAgICB9XG5cbiAgICBzZXRPdmVybGFwc1tsZWZ0XS5wdXNoKHsgc2V0OiByaWdodCwgc2l6ZTogY3VycmVudC5zaXplLCB3ZWlnaHQgfSk7XG4gICAgc2V0T3ZlcmxhcHNbcmlnaHRdLnB1c2goeyBzZXQ6IGxlZnQsIHNpemU6IGN1cnJlbnQuc2l6ZSwgd2VpZ2h0IH0pO1xuICB9XG5cbiAgLy8gZ2V0IGxpc3Qgb2YgbW9zdCBvdmVybGFwcGVkIHNldHNcbiAgY29uc3QgbW9zdE92ZXJsYXBwZWQgPSBbXTtcbiAgT2JqZWN0LmtleXMoc2V0T3ZlcmxhcHMpLmZvckVhY2goKHNldCkgPT4ge1xuICAgIGxldCBzaXplID0gMDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNldE92ZXJsYXBzW3NldF0ubGVuZ3RoOyArK2kpIHtcbiAgICAgIHNpemUgKz0gc2V0T3ZlcmxhcHNbc2V0XVtpXS5zaXplICogc2V0T3ZlcmxhcHNbc2V0XVtpXS53ZWlnaHQ7XG4gICAgfVxuXG4gICAgbW9zdE92ZXJsYXBwZWQucHVzaCh7IHNldCwgc2l6ZSB9KTtcbiAgfSk7XG5cbiAgLy8gc29ydCBieSBzaXplIGRlc2NcbiAgZnVuY3Rpb24gc29ydE9yZGVyKGEsIGIpIHtcbiAgICByZXR1cm4gYi5zaXplIC0gYS5zaXplO1xuICB9XG4gIG1vc3RPdmVybGFwcGVkLnNvcnQoc29ydE9yZGVyKTtcblxuICAvLyBrZWVwIHRyYWNrIG9mIHdoYXQgc2V0cyBoYXZlIGJlZW4gbGFpZCBvdXRcbiAgY29uc3QgcG9zaXRpb25lZCA9IHt9O1xuICBmdW5jdGlvbiBpc1Bvc2l0aW9uZWQoZWxlbWVudCkge1xuICAgIHJldHVybiBlbGVtZW50LnNldCBpbiBwb3NpdGlvbmVkO1xuICB9XG5cbiAgLyoqXG4gICAqIGFkZHMgYSBwb2ludCB0byB0aGUgb3V0cHV0XG4gICAqIEBwYXJhbSB7e3g6IG51bWJlciwgeTogbnVtYmVyfX0gcG9pbnRcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4XG4gICAqL1xuICBmdW5jdGlvbiBwb3NpdGlvblNldChwb2ludCwgaW5kZXgpIHtcbiAgICBjaXJjbGVzW2luZGV4XS54ID0gcG9pbnQueDtcbiAgICBjaXJjbGVzW2luZGV4XS55ID0gcG9pbnQueTtcbiAgICBwb3NpdGlvbmVkW2luZGV4XSA9IHRydWU7XG4gIH1cblxuICAvLyBhZGQgbW9zdCBvdmVybGFwcGVkIHNldCBhdCAoMCwwKVxuICBwb3NpdGlvblNldCh7IHg6IDAsIHk6IDAgfSwgbW9zdE92ZXJsYXBwZWRbMF0uc2V0KTtcblxuICAvLyBnZXQgZGlzdGFuY2VzIGJldHdlZW4gYWxsIHBvaW50cy4gVE9ETywgbmVjZXNzYXJ5P1xuICAvLyBhbnN3ZXI6IHByb2JhYmx5IG5vdFxuICAvLyB2YXIgZGlzdGFuY2VzID0gdmVubi5nZXREaXN0YW5jZU1hdHJpY2VzKGNpcmNsZXMsIGFyZWFzKS5kaXN0YW5jZXM7XG4gIGZvciAobGV0IGkgPSAxOyBpIDwgbW9zdE92ZXJsYXBwZWQubGVuZ3RoOyArK2kpIHtcbiAgICBjb25zdCBzZXRJbmRleCA9IG1vc3RPdmVybGFwcGVkW2ldLnNldDtcbiAgICBjb25zdCBvdmVybGFwID0gc2V0T3ZlcmxhcHNbc2V0SW5kZXhdLmZpbHRlcihpc1Bvc2l0aW9uZWQpO1xuICAgIGNvbnN0IHNldCA9IGNpcmNsZXNbc2V0SW5kZXhdO1xuICAgIG92ZXJsYXAuc29ydChzb3J0T3JkZXIpO1xuXG4gICAgaWYgKG92ZXJsYXAubGVuZ3RoID09PSAwKSB7XG4gICAgICAvLyB0aGlzIHNob3VsZG4ndCBoYXBwZW4gYW55bW9yZSB3aXRoIGFkZE1pc3NpbmdBcmVhc1xuICAgICAgdGhyb3cgJ0VSUk9SOiBtaXNzaW5nIHBhaXJ3aXNlIG92ZXJsYXAgaW5mb3JtYXRpb24nO1xuICAgIH1cblxuICAgIC8qKiBAdHlwZSB7e3g6IG51bWJlciwgeTogbnVtYmVyfVtdfSAqL1xuICAgIGNvbnN0IHBvaW50cyA9IFtdO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgb3ZlcmxhcC5sZW5ndGg7ICsraikge1xuICAgICAgLy8gZ2V0IGFwcHJvcHJpYXRlIGRpc3RhbmNlIGZyb20gbW9zdCBvdmVybGFwcGVkIGFscmVhZHkgYWRkZWQgc2V0XG4gICAgICBjb25zdCBwMSA9IGNpcmNsZXNbb3ZlcmxhcFtqXS5zZXRdO1xuICAgICAgY29uc3QgZDEgPSBkaXN0YW5jZUZyb21JbnRlcnNlY3RBcmVhKHNldC5yYWRpdXMsIHAxLnJhZGl1cywgb3ZlcmxhcFtqXS5zaXplKTtcblxuICAgICAgLy8gc2FtcGxlIHBvc2l0aW9ucyBhdCA5MCBkZWdyZWVzIGZvciBtYXhpbXVtIGFlc3RoZXRpY3NcbiAgICAgIHBvaW50cy5wdXNoKHsgeDogcDEueCArIGQxLCB5OiBwMS55IH0pO1xuICAgICAgcG9pbnRzLnB1c2goeyB4OiBwMS54IC0gZDEsIHk6IHAxLnkgfSk7XG4gICAgICBwb2ludHMucHVzaCh7IHk6IHAxLnkgKyBkMSwgeDogcDEueCB9KTtcbiAgICAgIHBvaW50cy5wdXNoKHsgeTogcDEueSAtIGQxLCB4OiBwMS54IH0pO1xuXG4gICAgICAvLyBpZiB3ZSBoYXZlIGF0IGxlYXN0IDIgb3ZlcmxhcHMsIHRoZW4gZmlndXJlIG91dCB3aGVyZSB0aGVcbiAgICAgIC8vIHNldCBzaG91bGQgYmUgcG9zaXRpb25lZCBhbmFseXRpY2FsbHkgYW5kIHRyeSB0aG9zZSB0b29cbiAgICAgIGZvciAobGV0IGsgPSBqICsgMTsgayA8IG92ZXJsYXAubGVuZ3RoOyArK2spIHtcbiAgICAgICAgY29uc3QgcDIgPSBjaXJjbGVzW292ZXJsYXBba10uc2V0XTtcbiAgICAgICAgY29uc3QgZDIgPSBkaXN0YW5jZUZyb21JbnRlcnNlY3RBcmVhKHNldC5yYWRpdXMsIHAyLnJhZGl1cywgb3ZlcmxhcFtrXS5zaXplKTtcblxuICAgICAgICBjb25zdCBleHRyYVBvaW50cyA9IGNpcmNsZUNpcmNsZUludGVyc2VjdGlvbihcbiAgICAgICAgICB7IHg6IHAxLngsIHk6IHAxLnksIHJhZGl1czogZDEgfSxcbiAgICAgICAgICB7IHg6IHAyLngsIHk6IHAyLnksIHJhZGl1czogZDIgfVxuICAgICAgICApO1xuICAgICAgICBwb2ludHMucHVzaCguLi5leHRyYVBvaW50cyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gd2UgaGF2ZSBzb21lIGNhbmRpZGF0ZSBwb3NpdGlvbnMgZm9yIHRoZSBzZXQsIGV4YW1pbmUgbG9zc1xuICAgIC8vIGF0IGVhY2ggcG9zaXRpb24gdG8gZmlndXJlIG91dCB3aGVyZSB0byBwdXQgaXQgYXRcbiAgICBsZXQgYmVzdExvc3MgPSAxZTUwO1xuICAgIGxldCBiZXN0UG9pbnQgPSBwb2ludHNbMF07XG4gICAgZm9yIChjb25zdCBwb2ludCBvZiBwb2ludHMpIHtcbiAgICAgIGNpcmNsZXNbc2V0SW5kZXhdLnggPSBwb2ludC54O1xuICAgICAgY2lyY2xlc1tzZXRJbmRleF0ueSA9IHBvaW50Lnk7XG4gICAgICBjb25zdCBsb2NhbExvc3MgPSBsb3NzKGNpcmNsZXMsIGFyZWFzKTtcbiAgICAgIGlmIChsb2NhbExvc3MgPCBiZXN0TG9zcykge1xuICAgICAgICBiZXN0TG9zcyA9IGxvY2FsTG9zcztcbiAgICAgICAgYmVzdFBvaW50ID0gcG9pbnQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcG9zaXRpb25TZXQoYmVzdFBvaW50LCBzZXRJbmRleCk7XG4gIH1cblxuICByZXR1cm4gY2lyY2xlcztcbn1cblxuLyoqXG4gKiBHaXZlbiBhIGJ1bmNoIG9mIHNldHMsIGFuZCB0aGUgZGVzaXJlZCBvdmVybGFwcyBiZXR3ZWVuIHRoZXNlIHNldHMgLSBjb21wdXRlc1xuICogdGhlIGRpc3RhbmNlIGZyb20gdGhlIGFjdHVhbCBvdmVybGFwcyB0byB0aGUgZGVzaXJlZCBvdmVybGFwcy4gTm90ZSB0aGF0XG4gKiB0aGlzIG1ldGhvZCBpZ25vcmVzIG92ZXJsYXBzIG9mIG1vcmUgdGhhbiAyIGNpcmNsZXNcbiAqIEBwYXJhbSB7e1trZXk6IHN0cmluZ106IDx7eDogbnVtYmVyLCB5OiBudW1iZXIsIHJhZGl1czogbnVtYmVyfT59fSBjaXJjbGVzXG4gKiBAcGFyYW0ge1JlYWRvbmx5QXJyYXk8e3NpemU6IG51bWJlciwgc2V0czogUmVhZG9ubHlBcnJheTxzdHJpbmc+LCB3ZWlnaHQ/OiBudW1iZXJ9Pn0gb3ZlcmxhcHNcbiAqIEByZXR1cm5zIHtudW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGxvc3NGdW5jdGlvbihjaXJjbGVzLCBvdmVybGFwcykge1xuICBsZXQgb3V0cHV0ID0gMDtcblxuICBmb3IgKGNvbnN0IGFyZWEgb2Ygb3ZlcmxhcHMpIHtcbiAgICBpZiAoYXJlYS5zZXRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgIGxldCBvdmVybGFwO1xuICAgIGlmIChhcmVhLnNldHMubGVuZ3RoID09PSAyKSB7XG4gICAgICBjb25zdCBsZWZ0ID0gY2lyY2xlc1thcmVhLnNldHNbMF1dO1xuICAgICAgY29uc3QgcmlnaHQgPSBjaXJjbGVzW2FyZWEuc2V0c1sxXV07XG4gICAgICBvdmVybGFwID0gY2lyY2xlT3ZlcmxhcChsZWZ0LnJhZGl1cywgcmlnaHQucmFkaXVzLCBkaXN0YW5jZShsZWZ0LCByaWdodCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdmVybGFwID0gaW50ZXJzZWN0aW9uQXJlYShhcmVhLnNldHMubWFwKChkKSA9PiBjaXJjbGVzW2RdKSk7XG4gICAgfVxuXG4gICAgY29uc3Qgd2VpZ2h0ID0gYXJlYS53ZWlnaHQgIT0gbnVsbCA/IGFyZWEud2VpZ2h0IDogMS4wO1xuICAgIG91dHB1dCArPSB3ZWlnaHQgKiAob3ZlcmxhcCAtIGFyZWEuc2l6ZSkgKiAob3ZlcmxhcCAtIGFyZWEuc2l6ZSk7XG4gIH1cblxuICByZXR1cm4gb3V0cHV0O1xufVxuXG5mdW5jdGlvbiBsb2dSYXRpb0xvc3NGdW5jdGlvbihjaXJjbGVzLCBvdmVybGFwcykge1xuICBsZXQgb3V0cHV0ID0gMDtcblxuICBmb3IgKGNvbnN0IGFyZWEgb2Ygb3ZlcmxhcHMpIHtcbiAgICBpZiAoYXJlYS5zZXRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgIGxldCBvdmVybGFwO1xuICAgIGlmIChhcmVhLnNldHMubGVuZ3RoID09PSAyKSB7XG4gICAgICBjb25zdCBsZWZ0ID0gY2lyY2xlc1thcmVhLnNldHNbMF1dO1xuICAgICAgY29uc3QgcmlnaHQgPSBjaXJjbGVzW2FyZWEuc2V0c1sxXV07XG4gICAgICBvdmVybGFwID0gY2lyY2xlT3ZlcmxhcChsZWZ0LnJhZGl1cywgcmlnaHQucmFkaXVzLCBkaXN0YW5jZShsZWZ0LCByaWdodCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdmVybGFwID0gaW50ZXJzZWN0aW9uQXJlYShhcmVhLnNldHMubWFwKChkKSA9PiBjaXJjbGVzW2RdKSk7XG4gICAgfVxuXG4gICAgY29uc3Qgd2VpZ2h0ID0gYXJlYS53ZWlnaHQgIT0gbnVsbCA/IGFyZWEud2VpZ2h0IDogMS4wO1xuICAgIGNvbnN0IGRpZmZlcmVuY2VGcm9tSWRlYWwgPSBNYXRoLmxvZygob3ZlcmxhcCArIDEpIC8gKGFyZWEuc2l6ZSArIDEpKTtcbiAgICBvdXRwdXQgKz0gd2VpZ2h0ICogZGlmZmVyZW5jZUZyb21JZGVhbCAqIGRpZmZlcmVuY2VGcm9tSWRlYWw7XG4gIH1cblxuICByZXR1cm4gb3V0cHV0O1xufVxuXG4vKipcbiAqIG9yaWVudGF0ZXMgYSBidW5jaCBvZiBjaXJjbGVzIHRvIHBvaW50IGluIG9yaWVudGF0aW9uXG4gKiBAcGFyYW0ge3t4IDpudW1iZXIsIHk6IG51bWJlciwgcmFkaXVzOiBudW1iZXJ9W119IGNpcmNsZXNcbiAqIEBwYXJhbSB7bnVtYmVyIHwgdW5kZWZpbmVkfSBvcmllbnRhdGlvblxuICogQHBhcmFtIHsoKGE6IHt4IDpudW1iZXIsIHk6IG51bWJlciwgcmFkaXVzOiBudW1iZXJ9LCBiOiB7eCA6bnVtYmVyLCB5OiBudW1iZXIsIHJhZGl1czogbnVtYmVyfSkgPT4gbnVtYmVyKSB8IHVuZGVmaW5lZH0gb3JpZW50YXRpb25PcmRlclxuICovXG5mdW5jdGlvbiBvcmllbnRhdGVDaXJjbGVzKGNpcmNsZXMsIG9yaWVudGF0aW9uLCBvcmllbnRhdGlvbk9yZGVyKSB7XG4gIGlmIChvcmllbnRhdGlvbk9yZGVyID09IG51bGwpIHtcbiAgICBjaXJjbGVzLnNvcnQoKGEsIGIpID0+IGIucmFkaXVzIC0gYS5yYWRpdXMpO1xuICB9IGVsc2Uge1xuICAgIGNpcmNsZXMuc29ydChvcmllbnRhdGlvbk9yZGVyKTtcbiAgfVxuXG4gIC8vIHNoaWZ0IGNpcmNsZXMgc28gbGFyZ2VzdCBjaXJjbGUgaXMgYXQgKDAsIDApXG4gIGlmIChjaXJjbGVzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBsYXJnZXN0WCA9IGNpcmNsZXNbMF0ueDtcbiAgICBjb25zdCBsYXJnZXN0WSA9IGNpcmNsZXNbMF0ueTtcblxuICAgIGZvciAoY29uc3QgY2lyY2xlIG9mIGNpcmNsZXMpIHtcbiAgICAgIGNpcmNsZS54IC09IGxhcmdlc3RYO1xuICAgICAgY2lyY2xlLnkgLT0gbGFyZ2VzdFk7XG4gICAgfVxuICB9XG5cbiAgaWYgKGNpcmNsZXMubGVuZ3RoID09PSAyKSB7XG4gICAgLy8gaWYgdGhlIHNlY29uZCBjaXJjbGUgaXMgYSBzdWJzZXQgb2YgdGhlIGZpcnN0LCBhcnJhbmdlIHNvIHRoYXRcbiAgICAvLyBpdCBpcyBvZmYgdG8gb25lIHNpZGUuIGhhY2sgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9iZW5mcmVkL3Zlbm4uanMvaXNzdWVzLzEyMFxuICAgIGNvbnN0IGRpc3QgPSBkaXN0YW5jZShjaXJjbGVzWzBdLCBjaXJjbGVzWzFdKTtcbiAgICBpZiAoZGlzdCA8IE1hdGguYWJzKGNpcmNsZXNbMV0ucmFkaXVzIC0gY2lyY2xlc1swXS5yYWRpdXMpKSB7XG4gICAgICBjaXJjbGVzWzFdLnggPSBjaXJjbGVzWzBdLnggKyBjaXJjbGVzWzBdLnJhZGl1cyAtIGNpcmNsZXNbMV0ucmFkaXVzIC0gMWUtMTA7XG4gICAgICBjaXJjbGVzWzFdLnkgPSBjaXJjbGVzWzBdLnk7XG4gICAgfVxuICB9XG5cbiAgLy8gcm90YXRlIGNpcmNsZXMgc28gdGhhdCBzZWNvbmQgbGFyZ2VzdCBpcyBhdCBhbiBhbmdsZSBvZiAnb3JpZW50YXRpb24nXG4gIC8vIGZyb20gbGFyZ2VzdFxuICBpZiAoY2lyY2xlcy5sZW5ndGggPiAxKSB7XG4gICAgY29uc3Qgcm90YXRpb24gPSBNYXRoLmF0YW4yKGNpcmNsZXNbMV0ueCwgY2lyY2xlc1sxXS55KSAtIG9yaWVudGF0aW9uO1xuICAgIGNvbnN0IGMgPSBNYXRoLmNvcyhyb3RhdGlvbik7XG4gICAgY29uc3QgcyA9IE1hdGguc2luKHJvdGF0aW9uKTtcblxuICAgIGZvciAoY29uc3QgY2lyY2xlIG9mIGNpcmNsZXMpIHtcbiAgICAgIGNvbnN0IHggPSBjaXJjbGUueDtcbiAgICAgIGNvbnN0IHkgPSBjaXJjbGUueTtcbiAgICAgIGNpcmNsZS54ID0gYyAqIHggLSBzICogeTtcbiAgICAgIGNpcmNsZS55ID0gcyAqIHggKyBjICogeTtcbiAgICB9XG4gIH1cblxuICAvLyBtaXJyb3Igc29sdXRpb24gaWYgdGhpcmQgc29sdXRpb24gaXMgYWJvdmUgcGxhbmUgc3BlY2lmaWVkIGJ5XG4gIC8vIGZpcnN0IHR3byBjaXJjbGVzXG4gIGlmIChjaXJjbGVzLmxlbmd0aCA+IDIpIHtcbiAgICBsZXQgYW5nbGUgPSBNYXRoLmF0YW4yKGNpcmNsZXNbMl0ueCwgY2lyY2xlc1syXS55KSAtIG9yaWVudGF0aW9uO1xuICAgIHdoaWxlIChhbmdsZSA8IDApIHtcbiAgICAgIGFuZ2xlICs9IDIgKiBNYXRoLlBJO1xuICAgIH1cbiAgICB3aGlsZSAoYW5nbGUgPiAyICogTWF0aC5QSSkge1xuICAgICAgYW5nbGUgLT0gMiAqIE1hdGguUEk7XG4gICAgfVxuICAgIGlmIChhbmdsZSA+IE1hdGguUEkpIHtcbiAgICAgIGNvbnN0IHNsb3BlID0gY2lyY2xlc1sxXS55IC8gKDFlLTEwICsgY2lyY2xlc1sxXS54KTtcbiAgICAgIGZvciAoY29uc3QgY2lyY2xlIG9mIGNpcmNsZXMpIHtcbiAgICAgICAgdmFyIGQgPSAoY2lyY2xlLnggKyBzbG9wZSAqIGNpcmNsZS55KSAvICgxICsgc2xvcGUgKiBzbG9wZSk7XG4gICAgICAgIGNpcmNsZS54ID0gMiAqIGQgLSBjaXJjbGUueDtcbiAgICAgICAgY2lyY2xlLnkgPSAyICogZCAqIHNsb3BlIC0gY2lyY2xlLnk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlBcnJheTx7eDogbnVtYmVyLCB5OiBudW1iZXIsIHJhZGl1czogbnVtYmVyfT59IGNpcmNsZXNcbiAqIEByZXR1cm5zIHt7eDogbnVtYmVyLCB5OiBudW1iZXIsIHJhZGl1czogbnVtYmVyfVtdW119XG4gKi9cbmZ1bmN0aW9uIGRpc2pvaW50Q2x1c3RlcihjaXJjbGVzKSB7XG4gIC8vIHVuaW9uLWZpbmQgY2x1c3RlcmluZyB0byBnZXQgZGlzam9pbnQgc2V0c1xuICBjaXJjbGVzLmZvckVhY2goKGNpcmNsZSkgPT4ge1xuICAgIGNpcmNsZS5wYXJlbnQgPSBjaXJjbGU7XG4gIH0pO1xuXG4gIC8vIHBhdGggY29tcHJlc3Npb24gc3RlcCBpbiB1bmlvbiBmaW5kXG4gIGZ1bmN0aW9uIGZpbmQoY2lyY2xlKSB7XG4gICAgaWYgKGNpcmNsZS5wYXJlbnQgIT09IGNpcmNsZSkge1xuICAgICAgY2lyY2xlLnBhcmVudCA9IGZpbmQoY2lyY2xlLnBhcmVudCk7XG4gICAgfVxuICAgIHJldHVybiBjaXJjbGUucGFyZW50O1xuICB9XG5cbiAgZnVuY3Rpb24gdW5pb24oeCwgeSkge1xuICAgIGNvbnN0IHhSb290ID0gZmluZCh4KTtcbiAgICBjb25zdCB5Um9vdCA9IGZpbmQoeSk7XG4gICAgeFJvb3QucGFyZW50ID0geVJvb3Q7XG4gIH1cblxuICAvLyBnZXQgdGhlIHVuaW9uIG9mIGFsbCBvdmVybGFwcGluZyBzZXRzXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY2lyY2xlcy5sZW5ndGg7ICsraSkge1xuICAgIGZvciAobGV0IGogPSBpICsgMTsgaiA8IGNpcmNsZXMubGVuZ3RoOyArK2opIHtcbiAgICAgIGNvbnN0IG1heERpc3RhbmNlID0gY2lyY2xlc1tpXS5yYWRpdXMgKyBjaXJjbGVzW2pdLnJhZGl1cztcbiAgICAgIGlmIChkaXN0YW5jZShjaXJjbGVzW2ldLCBjaXJjbGVzW2pdKSArIDFlLTEwIDwgbWF4RGlzdGFuY2UpIHtcbiAgICAgICAgdW5pb24oY2lyY2xlc1tqXSwgY2lyY2xlc1tpXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gZmluZCBhbGwgdGhlIGRpc2pvaW50IGNsdXN0ZXJzIGFuZCBncm91cCB0aGVtIHRvZ2V0aGVyXG4gIC8qKiBAdHlwZSB7TWFwPHN0cmluZywge3g6IG51bWJlciwgeTogbnVtYmVyLCByYWRpdXM6IG51bWJlcn1bXT59ICovXG4gIGNvbnN0IGRpc2pvaW50Q2x1c3RlcnMgPSBuZXcgTWFwKCk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY2lyY2xlcy5sZW5ndGg7ICsraSkge1xuICAgIGNvbnN0IHNldGlkID0gZmluZChjaXJjbGVzW2ldKS5wYXJlbnQuc2V0aWQ7XG4gICAgaWYgKCFkaXNqb2ludENsdXN0ZXJzLmhhcyhzZXRpZCkpIHtcbiAgICAgIGRpc2pvaW50Q2x1c3RlcnMuc2V0KHNldGlkLCBbXSk7XG4gICAgfVxuICAgIGRpc2pvaW50Q2x1c3RlcnMuZ2V0KHNldGlkKS5wdXNoKGNpcmNsZXNbaV0pO1xuICB9XG5cbiAgLy8gY2xlYW51cCBib29ra2VlcGluZ1xuICBjaXJjbGVzLmZvckVhY2goKGNpcmNsZSkgPT4ge1xuICAgIGRlbGV0ZSBjaXJjbGUucGFyZW50O1xuICB9KTtcblxuICAvLyByZXR1cm4gaW4gbW9yZSB1c2FibGUgZm9ybVxuICByZXR1cm4gQXJyYXkuZnJvbShkaXNqb2ludENsdXN0ZXJzLnZhbHVlcygpKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1JlYWRvbmx5QXJyYXk8e3ggOm51bWJlciwgeTogbnVtYmVyLCByYWRpdXM6IG51bWJlcn0+fSBjaXJjbGVzXG4gKiBAcmV0dXJucyB7e3hSYW5nZTogW251bWJlciwgbnVtYmVyXSwgeVJhbmdlOiBbbnVtYmVyLCBudW1iZXJdfX1cbiAqL1xuZnVuY3Rpb24gZ2V0Qm91bmRpbmdCb3goY2lyY2xlcykge1xuICBjb25zdCBtaW5NYXggPSAoZCkgPT4ge1xuICAgIGNvbnN0IGhpID0gY2lyY2xlcy5yZWR1Y2UoKGFjYywgYykgPT4gTWF0aC5tYXgoYWNjLCBjW2RdICsgYy5yYWRpdXMpLCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkpO1xuICAgIGNvbnN0IGxvID0gY2lyY2xlcy5yZWR1Y2UoKGFjYywgYykgPT4gTWF0aC5taW4oYWNjLCBjW2RdIC0gYy5yYWRpdXMpLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpO1xuICAgIHJldHVybiB7IG1heDogaGksIG1pbjogbG8gfTtcbiAgfTtcbiAgcmV0dXJuIHsgeFJhbmdlOiBtaW5NYXgoJ3gnKSwgeVJhbmdlOiBtaW5NYXgoJ3knKSB9O1xufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0ge3tbc2V0aWQ6IHN0cmluZ106IHt4OiBudW1iZXIsIHk6IG51bWJlciwgcmFkaXVzOiBudW1iZXJ9fX0gc29sdXRpb25cbiAqIEBwYXJhbSB7dW5kZWZpbmVkIHwgbnVtYmVyfSBvcmllbnRhdGlvblxuICogQHBhcmFtIHsoKGE6IHt4IDpudW1iZXIsIHk6IG51bWJlciwgcmFkaXVzOiBudW1iZXJ9LCBiOiB7eCA6bnVtYmVyLCB5OiBudW1iZXIsIHJhZGl1czogbnVtYmVyfSkgPT4gbnVtYmVyKSB8IHVuZGVmaW5lZH0gb3JpZW50YXRpb25PcmRlclxuICogQHJldHVybnMge3tbc2V0aWQ6IHN0cmluZ106IHt4OiBudW1iZXIsIHk6IG51bWJlciwgcmFkaXVzOiBudW1iZXJ9fX1cbiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplU29sdXRpb24oc29sdXRpb24sIG9yaWVudGF0aW9uLCBvcmllbnRhdGlvbk9yZGVyKSB7XG4gIGlmIChvcmllbnRhdGlvbiA9PSBudWxsKSB7XG4gICAgb3JpZW50YXRpb24gPSBNYXRoLlBJIC8gMjtcbiAgfVxuXG4gIC8vIHdvcmsgd2l0aCBhIGxpc3QgaW5zdGVhZCBvZiBhIGRpY3Rpb25hcnksIGFuZCB0YWtlIGEgY29weSBzbyB3ZVxuICAvLyBkb24ndCBtdXRhdGUgaW5wdXRcbiAgbGV0IGNpcmNsZXMgPSBmcm9tT2JqZWN0Tm90YXRpb24oc29sdXRpb24pLm1hcCgoZCkgPT4gT2JqZWN0LmFzc2lnbih7fSwgZCkpO1xuXG4gIC8vIGdldCBhbGwgdGhlIGRpc2pvaW50IGNsdXN0ZXJzXG4gIGNvbnN0IGNsdXN0ZXJzID0gZGlzam9pbnRDbHVzdGVyKGNpcmNsZXMpO1xuXG4gIC8vIG9yaWVudGF0ZSBhbGwgZGlzam9pbnQgc2V0cywgZ2V0IHNpemVzXG4gIGZvciAoY29uc3QgY2x1c3RlciBvZiBjbHVzdGVycykge1xuICAgIG9yaWVudGF0ZUNpcmNsZXMoY2x1c3Rlciwgb3JpZW50YXRpb24sIG9yaWVudGF0aW9uT3JkZXIpO1xuICAgIGNvbnN0IGJvdW5kcyA9IGdldEJvdW5kaW5nQm94KGNsdXN0ZXIpO1xuICAgIGNsdXN0ZXIuc2l6ZSA9IChib3VuZHMueFJhbmdlLm1heCAtIGJvdW5kcy54UmFuZ2UubWluKSAqIChib3VuZHMueVJhbmdlLm1heCAtIGJvdW5kcy55UmFuZ2UubWluKTtcbiAgICBjbHVzdGVyLmJvdW5kcyA9IGJvdW5kcztcbiAgfVxuICBjbHVzdGVycy5zb3J0KChhLCBiKSA9PiBiLnNpemUgLSBhLnNpemUpO1xuXG4gIC8vIG9yaWVudGF0ZSB0aGUgbGFyZ2VzdCBhdCAwLDAsIGFuZCBnZXQgdGhlIGJvdW5kc1xuICBjaXJjbGVzID0gY2x1c3RlcnNbMF07XG4gIGxldCByZXR1cm5Cb3VuZHMgPSBjaXJjbGVzLmJvdW5kcztcbiAgY29uc3Qgc3BhY2luZyA9IChyZXR1cm5Cb3VuZHMueFJhbmdlLm1heCAtIHJldHVybkJvdW5kcy54UmFuZ2UubWluKSAvIDUwO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge1JlYWRvbmx5QXJyYXk8e3g6IG51bWJlciwgeTogbnVtYmVyLCByYWRpdXM6IG51bWJlciwgc2V0aWQ6IHN0cmluZ30+fSBjbHVzdGVyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gcmlnaHRcbiAgICogQHBhcmFtIHtib29sZWFufSBib3R0b21cbiAgICovXG4gIGZ1bmN0aW9uIGFkZENsdXN0ZXIoY2x1c3RlciwgcmlnaHQsIGJvdHRvbSkge1xuICAgIGlmICghY2x1c3Rlcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGJvdW5kcyA9IGNsdXN0ZXIuYm91bmRzO1xuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgIGxldCB4T2Zmc2V0O1xuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgIGxldCB5T2Zmc2V0O1xuXG4gICAgaWYgKHJpZ2h0KSB7XG4gICAgICB4T2Zmc2V0ID0gcmV0dXJuQm91bmRzLnhSYW5nZS5tYXggLSBib3VuZHMueFJhbmdlLm1pbiArIHNwYWNpbmc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHhPZmZzZXQgPSByZXR1cm5Cb3VuZHMueFJhbmdlLm1heCAtIGJvdW5kcy54UmFuZ2UubWF4O1xuICAgICAgY29uc3QgY2VudHJlaW5nID1cbiAgICAgICAgKGJvdW5kcy54UmFuZ2UubWF4IC0gYm91bmRzLnhSYW5nZS5taW4pIC8gMiAtIChyZXR1cm5Cb3VuZHMueFJhbmdlLm1heCAtIHJldHVybkJvdW5kcy54UmFuZ2UubWluKSAvIDI7XG4gICAgICBpZiAoY2VudHJlaW5nIDwgMCkge1xuICAgICAgICB4T2Zmc2V0ICs9IGNlbnRyZWluZztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoYm90dG9tKSB7XG4gICAgICB5T2Zmc2V0ID0gcmV0dXJuQm91bmRzLnlSYW5nZS5tYXggLSBib3VuZHMueVJhbmdlLm1pbiArIHNwYWNpbmc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHlPZmZzZXQgPSByZXR1cm5Cb3VuZHMueVJhbmdlLm1heCAtIGJvdW5kcy55UmFuZ2UubWF4O1xuICAgICAgY29uc3QgY2VudHJlaW5nID1cbiAgICAgICAgKGJvdW5kcy55UmFuZ2UubWF4IC0gYm91bmRzLnlSYW5nZS5taW4pIC8gMiAtIChyZXR1cm5Cb3VuZHMueVJhbmdlLm1heCAtIHJldHVybkJvdW5kcy55UmFuZ2UubWluKSAvIDI7XG4gICAgICBpZiAoY2VudHJlaW5nIDwgMCkge1xuICAgICAgICB5T2Zmc2V0ICs9IGNlbnRyZWluZztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGMgb2YgY2x1c3Rlcikge1xuICAgICAgYy54ICs9IHhPZmZzZXQ7XG4gICAgICBjLnkgKz0geU9mZnNldDtcbiAgICAgIGNpcmNsZXMucHVzaChjKTtcbiAgICB9XG4gIH1cblxuICBsZXQgaW5kZXggPSAxO1xuICB3aGlsZSAoaW5kZXggPCBjbHVzdGVycy5sZW5ndGgpIHtcbiAgICBhZGRDbHVzdGVyKGNsdXN0ZXJzW2luZGV4XSwgdHJ1ZSwgZmFsc2UpO1xuICAgIGFkZENsdXN0ZXIoY2x1c3RlcnNbaW5kZXggKyAxXSwgZmFsc2UsIHRydWUpO1xuICAgIGFkZENsdXN0ZXIoY2x1c3RlcnNbaW5kZXggKyAyXSwgdHJ1ZSwgdHJ1ZSk7XG4gICAgaW5kZXggKz0gMztcblxuICAgIC8vIGhhdmUgb25lIGNsdXN0ZXIgKGluIHRvcCBsZWZ0KS4gbGF5IG91dCBuZXh0IHRocmVlIHJlbGF0aXZlXG4gICAgLy8gdG8gaXQgaW4gYSBncmlkXG4gICAgcmV0dXJuQm91bmRzID0gZ2V0Qm91bmRpbmdCb3goY2lyY2xlcyk7XG4gIH1cblxuICAvLyBjb252ZXJ0IGJhY2sgdG8gc29sdXRpb24gZm9ybVxuICByZXR1cm4gdG9PYmplY3ROb3RhdGlvbihjaXJjbGVzKTtcbn1cblxuLyoqXG4gKiBTY2FsZXMgYSBzb2x1dGlvbiBmcm9tIHZlbm4udmVubiBvciB2ZW5uLmdyZWVkeUxheW91dCBzdWNoIHRoYXQgaXQgZml0cyBpblxuICogYSByZWN0YW5nbGUgb2Ygd2lkdGgvaGVpZ2h0IC0gd2l0aCBwYWRkaW5nIGFyb3VuZCB0aGUgYm9yZGVycy4gYWxzb1xuICogY2VudGVycyB0aGUgZGlhZ3JhbSBpbiB0aGUgYXZhaWxhYmxlIHNwYWNlIGF0IHRoZSBzYW1lIHRpbWUuXG4gKiBJZiB0aGUgc2NhbGUgcGFyYW1ldGVyIGlzIG5vdCBudWxsLCB0aGlzIGF1dG9tYXRpYyBzY2FsaW5nIGlzIGlnbm9yZWQgaW4gZmF2b3Igb2YgdGhpcyBjdXN0b20gb25lXG4gKiBAcGFyYW0ge3tbc2V0aWQ6IHN0cmluZ106IHt4OiBudW1iZXIsIHk6IG51bWJlciwgcmFkaXVzOiBudW1iZXJ9fX0gc29sdXRpb25cbiAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aFxuICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodFxuICogQHBhcmFtIHtudW1iZXJ9IHBhZGRpbmdcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gc2NhbGVUb0ZpdFxuICogQHJldHVybnMge3tbc2V0aWQ6IHN0cmluZ106IHt4OiBudW1iZXIsIHk6IG51bWJlciwgcmFkaXVzOiBudW1iZXJ9fX1cbiAqL1xuZnVuY3Rpb24gc2NhbGVTb2x1dGlvbihzb2x1dGlvbiwgd2lkdGgsIGhlaWdodCwgcGFkZGluZywgc2NhbGVUb0ZpdCkge1xuICBjb25zdCBjaXJjbGVzID0gZnJvbU9iamVjdE5vdGF0aW9uKHNvbHV0aW9uKTtcblxuICB3aWR0aCAtPSAyICogcGFkZGluZztcbiAgaGVpZ2h0IC09IDIgKiBwYWRkaW5nO1xuXG4gIGNvbnN0IHsgeFJhbmdlLCB5UmFuZ2UgfSA9IGdldEJvdW5kaW5nQm94KGNpcmNsZXMpO1xuXG4gIGlmICh4UmFuZ2UubWF4ID09PSB4UmFuZ2UubWluIHx8IHlSYW5nZS5tYXggPT09IHlSYW5nZS5taW4pIHtcbiAgICBjb25zb2xlLmxvZygnbm90IHNjYWxpbmcgc29sdXRpb246IHplcm8gc2l6ZSBkZXRlY3RlZCcpO1xuICAgIHJldHVybiBzb2x1dGlvbjtcbiAgfVxuXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICBsZXQgeFNjYWxpbmc7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICBsZXQgeVNjYWxpbmc7XG4gIGlmIChzY2FsZVRvRml0KSB7XG4gICAgY29uc3QgdG9TY2FsZURpYW1ldGVyID0gTWF0aC5zcXJ0KHNjYWxlVG9GaXQgLyBNYXRoLlBJKSAqIDI7XG4gICAgeFNjYWxpbmcgPSB3aWR0aCAvIHRvU2NhbGVEaWFtZXRlcjtcbiAgICB5U2NhbGluZyA9IGhlaWdodCAvIHRvU2NhbGVEaWFtZXRlcjtcbiAgfSBlbHNlIHtcbiAgICB4U2NhbGluZyA9IHdpZHRoIC8gKHhSYW5nZS5tYXggLSB4UmFuZ2UubWluKTtcbiAgICB5U2NhbGluZyA9IGhlaWdodCAvICh5UmFuZ2UubWF4IC0geVJhbmdlLm1pbik7XG4gIH1cblxuICBjb25zdCBzY2FsaW5nID0gTWF0aC5taW4oeVNjYWxpbmcsIHhTY2FsaW5nKTtcbiAgLy8gd2hpbGUgd2UncmUgYXQgaXQsIGNlbnRlciB0aGUgZGlhZ3JhbSB0b29cbiAgY29uc3QgeE9mZnNldCA9ICh3aWR0aCAtICh4UmFuZ2UubWF4IC0geFJhbmdlLm1pbikgKiBzY2FsaW5nKSAvIDI7XG4gIGNvbnN0IHlPZmZzZXQgPSAoaGVpZ2h0IC0gKHlSYW5nZS5tYXggLSB5UmFuZ2UubWluKSAqIHNjYWxpbmcpIC8gMjtcblxuICByZXR1cm4gdG9PYmplY3ROb3RhdGlvbihcbiAgICBjaXJjbGVzLm1hcCgoY2lyY2xlKSA9PiAoe1xuICAgICAgcmFkaXVzOiBzY2FsaW5nICogY2lyY2xlLnJhZGl1cyxcbiAgICAgIHg6IHBhZGRpbmcgKyB4T2Zmc2V0ICsgKGNpcmNsZS54IC0geFJhbmdlLm1pbikgKiBzY2FsaW5nLFxuICAgICAgeTogcGFkZGluZyArIHlPZmZzZXQgKyAoY2lyY2xlLnkgLSB5UmFuZ2UubWluKSAqIHNjYWxpbmcsXG4gICAgICBzZXRpZDogY2lyY2xlLnNldGlkLFxuICAgIH0pKVxuICApO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7cmVhZG9ubHkge3g6IG51bWJlciwgeTogbnVtYmVyLCByYWRpdXM6IG51bWJlciwgc2V0aWQ6IHN0cmluZ31bXX0gY2lyY2xlc1xuICogQHJldHVybnMge3tbc2V0aWQ6IHN0cmluZ106IHt4OiBudW1iZXIsIHk6IG51bWJlciwgcmFkaXVzOiBudW1iZXIsIHNldGlkOiBzdHJpbmd9fX1cbiAqL1xuZnVuY3Rpb24gdG9PYmplY3ROb3RhdGlvbihjaXJjbGVzKSB7XG4gIC8qKiBAdHlwZSB7e1tzZXRpZDogc3RyaW5nXToge3g6IG51bWJlciwgeTogbnVtYmVyLCByYWRpdXM6IG51bWJlciwgc2V0aWQ6IHN0cmluZ319fSAqL1xuICBjb25zdCByID0ge307XG4gIGZvciAoY29uc3QgY2lyY2xlIG9mIGNpcmNsZXMpIHtcbiAgICByW2NpcmNsZS5zZXRpZF0gPSBjaXJjbGU7XG4gIH1cbiAgcmV0dXJuIHI7XG59XG4vKipcbiAqIEBwYXJhbSB7e1tzZXRpZDogc3RyaW5nXToge3g6IG51bWJlciwgeTogbnVtYmVyLCByYWRpdXM6IG51bWJlcn19fSBzb2x1dGlvblxuICogQHJldHVybnMge3t4OiBudW1iZXIsIHk6IG51bWJlciwgcmFkaXVzOiBudW1iZXIsIHNldGlkOiBzdHJpbmd9W119fVxuICovXG5mdW5jdGlvbiBmcm9tT2JqZWN0Tm90YXRpb24oc29sdXRpb24pIHtcbiAgY29uc3Qgc2V0aWRzID0gT2JqZWN0LmtleXMoc29sdXRpb24pO1xuICByZXR1cm4gc2V0aWRzLm1hcCgoaWQpID0+IE9iamVjdC5hc3NpZ24oc29sdXRpb25baWRdLCB7IHNldGlkOiBpZCB9KSk7XG59XG5cbi8qKlxuICogVmVubkRpYWdyYW0gaW5jbHVkZXMgYW4gb3B0aW9uYWwgYG9wdGlvbnNgIHBhcmFtZXRlciBjb250YWluaW5nIHRoZSBmb2xsb3dpbmcgb3B0aW9uKHMpOlxuICpcbiAqIGBjb2xvdXJTY2hlbWU6IEFycmF5PFN0cmluZz5gXG4gKiBBIGxpc3Qgb2YgY29sb3IgdmFsdWVzIHRvIGJlIGFwcGxpZWQgd2hlbiBjb2xvcmluZyBkaWFncmFtIGNpcmNsZXMuXG4gKlxuICogYHN5bW1ldHJpY2FsVGV4dENlbnRyZTogQm9vbGVhbmBcbiAqIFdoZXRoZXIgdG8gc3ltbWV0cmljYWxseSBjZW50ZXIgZWFjaCBjaXJjbGUncyB0ZXh0IGhvcml6b250YWxseSBhbmQgdmVydGljYWxseS5cbiAqIERlZmF1bHRzIHRvIGBmYWxzZWAuXG4gKlxuICogYHRleHRGaWxsOiBTdHJpbmdgXG4gKiBUaGUgY29sb3IgdG8gYmUgYXBwbGllZCB0byB0aGUgdGV4dCB3aXRoaW4gZWFjaCBjaXJjbGUuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcbiAqL1xuZnVuY3Rpb24gVmVubkRpYWdyYW0ob3B0aW9ucyA9IHt9KSB7XG4gIGxldCB1c2VWaWV3Qm94ID0gZmFsc2UsXG4gICAgd2lkdGggPSA2MDAsXG4gICAgaGVpZ2h0ID0gMzUwLFxuICAgIHBhZGRpbmcgPSAxNSxcbiAgICBkdXJhdGlvbiA9IDEwMDAsXG4gICAgb3JpZW50YXRpb24gPSBNYXRoLlBJIC8gMixcbiAgICBub3JtYWxpemUgPSB0cnVlLFxuICAgIHNjYWxlVG9GaXQgPSBudWxsLFxuICAgIHdyYXAgPSB0cnVlLFxuICAgIHN0eWxlZCA9IHRydWUsXG4gICAgZm9udFNpemUgPSBudWxsLFxuICAgIG9yaWVudGF0aW9uT3JkZXIgPSBudWxsLFxuICAgIGRpc3RpbmN0ID0gZmFsc2UsXG4gICAgcm91bmQgPSBudWxsLFxuICAgIHN5bW1ldHJpY2FsVGV4dENlbnRyZSA9IG9wdGlvbnMgJiYgb3B0aW9ucy5zeW1tZXRyaWNhbFRleHRDZW50cmUgPyBvcHRpb25zLnN5bW1ldHJpY2FsVGV4dENlbnRyZSA6IGZhbHNlLFxuICAgIC8vIG1pbWljIHRoZSBiZWhhdmlvdXIgb2YgZDMuc2NhbGUuY2F0ZWdvcnkxMCBmcm9tIHRoZSBwcmV2aW91c1xuICAgIC8vIHZlcnNpb24gb2YgZDNcbiAgICBjb2xvdXJNYXAgPSB7fSxcbiAgICAvLyBzbyB0aGlzIGlzIHRoZSBzYW1lIGFzIGQzLnNjaGVtZUNhdGVnb3J5MTAsIHdoaWNoIGlzIG9ubHkgZGVmaW5lZCBpbiBkMyA0LjBcbiAgICAvLyBzaW5jZSB3ZSBjYW4gc3VwcG9ydCBvbGRlciB2ZXJzaW9ucyBvZiBkMyBhcyBsb25nIGFzIHdlIGRvbid0IGZvcmNlIHRoaXMsXG4gICAgLy8gSSdtIGhhY2tpbHkgcmVkZWZpbmluZyBiZWxvdy4gVE9ETzogcmVtb3ZlIHRoaXMgYW5kIGNoYW5nZSB0byBkMy5zY2hlbWVDYXRlZ29yeTEwXG4gICAgY29sb3VyU2NoZW1lID1cbiAgICAgIG9wdGlvbnMgJiYgb3B0aW9ucy5jb2xvdXJTY2hlbWVcbiAgICAgICAgPyBvcHRpb25zLmNvbG91clNjaGVtZVxuICAgICAgICA6IG9wdGlvbnMgJiYgb3B0aW9ucy5jb2xvclNjaGVtZVxuICAgICAgICAgID8gb3B0aW9ucy5jb2xvclNjaGVtZVxuICAgICAgICAgIDogW1xuICAgICAgICAgICAgICAnIzFmNzdiNCcsXG4gICAgICAgICAgICAgICcjZmY3ZjBlJyxcbiAgICAgICAgICAgICAgJyMyY2EwMmMnLFxuICAgICAgICAgICAgICAnI2Q2MjcyOCcsXG4gICAgICAgICAgICAgICcjOTQ2N2JkJyxcbiAgICAgICAgICAgICAgJyM4YzU2NGInLFxuICAgICAgICAgICAgICAnI2UzNzdjMicsXG4gICAgICAgICAgICAgICcjN2Y3ZjdmJyxcbiAgICAgICAgICAgICAgJyNiY2JkMjInLFxuICAgICAgICAgICAgICAnIzE3YmVjZicsXG4gICAgICAgICAgICBdLFxuICAgIGNvbG91ckluZGV4ID0gMCxcbiAgICBjb2xvdXJzID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgaWYgKGtleSBpbiBjb2xvdXJNYXApIHtcbiAgICAgICAgcmV0dXJuIGNvbG91ck1hcFtrZXldO1xuICAgICAgfVxuICAgICAgdmFyIHJldCA9IChjb2xvdXJNYXBba2V5XSA9IGNvbG91clNjaGVtZVtjb2xvdXJJbmRleF0pO1xuICAgICAgY29sb3VySW5kZXggKz0gMTtcbiAgICAgIGlmIChjb2xvdXJJbmRleCA+PSBjb2xvdXJTY2hlbWUubGVuZ3RoKSB7XG4gICAgICAgIGNvbG91ckluZGV4ID0gMDtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXQ7XG4gICAgfSxcbiAgICBsYXlvdXRGdW5jdGlvbiA9IHZlbm4sXG4gICAgbG9zcyA9IGxvc3NGdW5jdGlvbjtcblxuICBmdW5jdGlvbiBjaGFydChzZWxlY3Rpb24pIHtcbiAgICBsZXQgZGF0YSA9IHNlbGVjdGlvbi5kYXR1bSgpO1xuXG4gICAgLy8gaGFuZGxlIDAtc2l6ZWQgc2V0cyBieSByZW1vdmluZyBmcm9tIGlucHV0XG4gICAgY29uc3QgdG9SZW1vdmUgPSBuZXcgU2V0KCk7XG4gICAgZGF0YS5mb3JFYWNoKChkYXR1bSkgPT4ge1xuICAgICAgaWYgKGRhdHVtLnNpemUgPT0gMCAmJiBkYXR1bS5zZXRzLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgIHRvUmVtb3ZlLmFkZChkYXR1bS5zZXRzWzBdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBkYXRhID0gZGF0YS5maWx0ZXIoKGRhdHVtKSA9PiAhZGF0dW0uc2V0cy5zb21lKChzZXQpID0+IHRvUmVtb3ZlLmhhcyhzZXQpKSk7XG5cbiAgICBsZXQgY2lyY2xlcyA9IHt9O1xuICAgIGxldCB0ZXh0Q2VudHJlcyA9IHt9O1xuXG4gICAgaWYgKGRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgbGV0IHNvbHV0aW9uID0gbGF5b3V0RnVuY3Rpb24oZGF0YSwgeyBsb3NzRnVuY3Rpb246IGxvc3MsIGRpc3RpbmN0IH0pO1xuXG4gICAgICBpZiAobm9ybWFsaXplKSB7XG4gICAgICAgIHNvbHV0aW9uID0gbm9ybWFsaXplU29sdXRpb24oc29sdXRpb24sIG9yaWVudGF0aW9uLCBvcmllbnRhdGlvbk9yZGVyKTtcbiAgICAgIH1cblxuICAgICAgY2lyY2xlcyA9IHNjYWxlU29sdXRpb24oc29sdXRpb24sIHdpZHRoLCBoZWlnaHQsIHBhZGRpbmcsIHNjYWxlVG9GaXQpO1xuICAgICAgdGV4dENlbnRyZXMgPSBjb21wdXRlVGV4dENlbnRyZXMoY2lyY2xlcywgZGF0YSwgc3ltbWV0cmljYWxUZXh0Q2VudHJlKTtcbiAgICB9XG5cbiAgICAvLyBGaWd1cmUgb3V0IHRoZSBjdXJyZW50IGxhYmVsIGZvciBlYWNoIHNldC4gVGhlc2UgY2FuIGNoYW5nZVxuICAgIC8vIGFuZCBEMyB3b24ndCBuZWNlc3NhcmlseSB1cGRhdGUgKGZpeGVzIGh0dHBzOi8vZ2l0aHViLmNvbS9iZW5mcmVkL3Zlbm4uanMvaXNzdWVzLzEwMylcbiAgICBjb25zdCBsYWJlbHMgPSB7fTtcbiAgICBkYXRhLmZvckVhY2goKGRhdHVtKSA9PiB7XG4gICAgICBpZiAoZGF0dW0ubGFiZWwpIHtcbiAgICAgICAgbGFiZWxzW2RhdHVtLnNldHNdID0gZGF0dW0ubGFiZWw7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBsYWJlbChkKSB7XG4gICAgICBpZiAoZC5zZXRzIGluIGxhYmVscykge1xuICAgICAgICByZXR1cm4gbGFiZWxzW2Quc2V0c107XG4gICAgICB9XG4gICAgICBpZiAoZC5zZXRzLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgIHJldHVybiAnJyArIGQuc2V0c1swXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjcmVhdGUgc3ZnIGlmIG5vdCBhbHJlYWR5IGV4aXN0aW5nXG4gICAgc2VsZWN0aW9uLnNlbGVjdEFsbCgnc3ZnJykuZGF0YShbY2lyY2xlc10pLmVudGVyKCkuYXBwZW5kKCdzdmcnKTtcblxuICAgIGNvbnN0IHN2ZyA9IHNlbGVjdGlvbi5zZWxlY3QoJ3N2ZycpO1xuXG4gICAgaWYgKHVzZVZpZXdCb3gpIHtcbiAgICAgIHN2Zy5hdHRyKCd2aWV3Qm94JywgYDAgMCAke3dpZHRofSAke2hlaWdodH1gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3ZnLmF0dHIoJ3dpZHRoJywgd2lkdGgpLmF0dHIoJ2hlaWdodCcsIGhlaWdodCk7XG4gICAgfVxuXG4gICAgLy8gdG8gcHJvcGVybHkgdHJhbnNpdGlvbiBpbnRlcnNlY3Rpb24gYXJlYXMsIHdlIG5lZWQgdGhlXG4gICAgLy8gcHJldmlvdXMgY2lyY2xlcyBsb2NhdGlvbnMuIGxvYWQgZnJvbSBlbGVtZW50c1xuICAgIGNvbnN0IHByZXZpb3VzID0ge307XG4gICAgbGV0IGhhc1ByZXZpb3VzID0gZmFsc2U7XG4gICAgc3ZnLnNlbGVjdEFsbCgnLnZlbm4tYXJlYSBwYXRoJykuZWFjaChmdW5jdGlvbiAoZCkge1xuICAgICAgY29uc3QgcGF0aCA9IHRoaXMuZ2V0QXR0cmlidXRlKCdkJyk7XG4gICAgICBpZiAoZC5zZXRzLmxlbmd0aCA9PSAxICYmIHBhdGggJiYgIWRpc3RpbmN0KSB7XG4gICAgICAgIGhhc1ByZXZpb3VzID0gdHJ1ZTtcbiAgICAgICAgcHJldmlvdXNbZC5zZXRzWzBdXSA9IGNpcmNsZUZyb21QYXRoKHBhdGgpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIC8vIGludGVycG9sYXRlIGludGVyc2VjdGlvbiBhcmVhIHBhdGhzIGJldHdlZW4gcHJldmlvdXMgYW5kXG4gICAgLy8gY3VycmVudCBwYXRoc1xuICAgIGZ1bmN0aW9uIHBhdGhUd2VlbihkKSB7XG4gICAgICByZXR1cm4gKHQpID0+IHtcbiAgICAgICAgY29uc3QgYyA9IGQuc2V0cy5tYXAoKHNldCkgPT4ge1xuICAgICAgICAgIGxldCBzdGFydCA9IHByZXZpb3VzW3NldF07XG4gICAgICAgICAgbGV0IGVuZCA9IGNpcmNsZXNbc2V0XTtcbiAgICAgICAgICBpZiAoIXN0YXJ0KSB7XG4gICAgICAgICAgICBzdGFydCA9IHsgeDogd2lkdGggLyAyLCB5OiBoZWlnaHQgLyAyLCByYWRpdXM6IDEgfTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFlbmQpIHtcbiAgICAgICAgICAgIGVuZCA9IHsgeDogd2lkdGggLyAyLCB5OiBoZWlnaHQgLyAyLCByYWRpdXM6IDEgfTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IHN0YXJ0LnggKiAoMSAtIHQpICsgZW5kLnggKiB0LFxuICAgICAgICAgICAgeTogc3RhcnQueSAqICgxIC0gdCkgKyBlbmQueSAqIHQsXG4gICAgICAgICAgICByYWRpdXM6IHN0YXJ0LnJhZGl1cyAqICgxIC0gdCkgKyBlbmQucmFkaXVzICogdCxcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvbkFyZWFQYXRoKGMsIHJvdW5kKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gdXBkYXRlIGRhdGEsIGpvaW5pbmcgb24gdGhlIHNldCBpZHNcbiAgICBjb25zdCBub2RlcyA9IHN2Zy5zZWxlY3RBbGwoJy52ZW5uLWFyZWEnKS5kYXRhKGRhdGEsIChkKSA9PiBkLnNldHMpO1xuXG4gICAgLy8gY3JlYXRlIG5ldyBub2Rlc1xuICAgIGNvbnN0IGVudGVyID0gbm9kZXNcbiAgICAgIC5lbnRlcigpXG4gICAgICAuYXBwZW5kKCdnJylcbiAgICAgIC5hdHRyKFxuICAgICAgICAnY2xhc3MnLFxuICAgICAgICAoZCkgPT5cbiAgICAgICAgICBgdmVubi1hcmVhIHZlbm4tJHtkLnNldHMubGVuZ3RoID09IDEgPyAnY2lyY2xlJyA6ICdpbnRlcnNlY3Rpb24nfSR7XG4gICAgICAgICAgICBkLmNvbG91ciB8fCBkLmNvbG9yID8gJyB2ZW5uLWNvbG91cmVkJyA6ICcnXG4gICAgICAgICAgfWBcbiAgICAgIClcbiAgICAgIC5hdHRyKCdkYXRhLXZlbm4tc2V0cycsIChkKSA9PiBkLnNldHMuam9pbignXycpKTtcblxuICAgIGNvbnN0IGVudGVyUGF0aCA9IGVudGVyLmFwcGVuZCgncGF0aCcpO1xuICAgIGNvbnN0IGVudGVyVGV4dCA9IGVudGVyXG4gICAgICAuYXBwZW5kKCd0ZXh0JylcbiAgICAgIC5hdHRyKCdjbGFzcycsICdsYWJlbCcpXG4gICAgICAudGV4dCgoZCkgPT4gbGFiZWwoZCkpXG4gICAgICAuYXR0cigndGV4dC1hbmNob3InLCAnbWlkZGxlJylcbiAgICAgIC5hdHRyKCdkeScsICcuMzVlbScpXG4gICAgICAuYXR0cigneCcsIHdpZHRoIC8gMilcbiAgICAgIC5hdHRyKCd5JywgaGVpZ2h0IC8gMik7XG5cbiAgICAvLyBhcHBseSBtaW5pbWFsIHN0eWxlIGlmIHdhbnRlZFxuICAgIGlmIChzdHlsZWQpIHtcbiAgICAgIGVudGVyUGF0aFxuICAgICAgICAuc3R5bGUoJ2ZpbGwtb3BhY2l0eScsICcwJylcbiAgICAgICAgLmZpbHRlcigoZCkgPT4gZC5zZXRzLmxlbmd0aCA9PSAxKVxuICAgICAgICAuc3R5bGUoJ2ZpbGwnLCAoZCkgPT4gKGQuY29sb3VyID8gZC5jb2xvdXIgOiBkLmNvbG9yID8gZC5jb2xvciA6IGNvbG91cnMoZC5zZXRzKSkpXG4gICAgICAgIC5zdHlsZSgnZmlsbC1vcGFjaXR5JywgJy4yNScpO1xuXG4gICAgICBlbnRlclRleHQuc3R5bGUoJ2ZpbGwnLCAoZCkgPT4ge1xuICAgICAgICBpZiAoZC5jb2xvdXIgfHwgZC5jb2xvcikge1xuICAgICAgICAgIHJldHVybiAnI0ZGRic7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdGlvbnMudGV4dEZpbGwpIHtcbiAgICAgICAgICByZXR1cm4gb3B0aW9ucy50ZXh0RmlsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZC5zZXRzLmxlbmd0aCA9PSAxID8gY29sb3VycyhkLnNldHMpIDogJyM0NDQnO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYXNUcmFuc2l0aW9uKHMpIHtcbiAgICAgIGlmICh0eXBlb2Ygcy50cmFuc2l0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiBzLnRyYW5zaXRpb24oJ3Zlbm4nKS5kdXJhdGlvbihkdXJhdGlvbik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcztcbiAgICB9XG5cbiAgICAvLyB1cGRhdGUgZXhpc3RpbmcsIHVzaW5nIHBhdGhUd2VlbiBpZiBuZWNlc3NhcnlcbiAgICBsZXQgdXBkYXRlID0gc2VsZWN0aW9uO1xuICAgIGlmIChoYXNQcmV2aW91cyAmJiB0eXBlb2YgdXBkYXRlLnRyYW5zaXRpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHVwZGF0ZSA9IGFzVHJhbnNpdGlvbihzZWxlY3Rpb24pO1xuICAgICAgdXBkYXRlLnNlbGVjdEFsbCgncGF0aCcpLmF0dHJUd2VlbignZCcsIHBhdGhUd2Vlbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVwZGF0ZS5zZWxlY3RBbGwoJ3BhdGgnKS5hdHRyKCdkJywgKGQpID0+IGludGVyc2VjdGlvbkFyZWFQYXRoKGQuc2V0cy5tYXAoKHNldCkgPT4gY2lyY2xlc1tzZXRdKSksIHJvdW5kKTtcbiAgICB9XG5cbiAgICBjb25zdCB1cGRhdGVUZXh0ID0gdXBkYXRlXG4gICAgICAuc2VsZWN0QWxsKCd0ZXh0JylcbiAgICAgIC5maWx0ZXIoKGQpID0+IGQuc2V0cyBpbiB0ZXh0Q2VudHJlcylcbiAgICAgIC50ZXh0KChkKSA9PiBsYWJlbChkKSlcbiAgICAgIC5hdHRyKCd4JywgKGQpID0+IE1hdGguZmxvb3IodGV4dENlbnRyZXNbZC5zZXRzXS54KSlcbiAgICAgIC5hdHRyKCd5JywgKGQpID0+IE1hdGguZmxvb3IodGV4dENlbnRyZXNbZC5zZXRzXS55KSk7XG5cbiAgICBpZiAod3JhcCkge1xuICAgICAgaWYgKGhhc1ByZXZpb3VzKSB7XG4gICAgICAgIC8vIGQzIDQuMCB1c2VzICdvbicgZm9yIGV2ZW50cyBvbiB0cmFuc2l0aW9ucyxcbiAgICAgICAgLy8gYnV0IGQzIDMuMCB1c2VkICdlYWNoJyBpbnN0ZWFkLiBzd2l0Y2ggYXBwcm9wcmlhdGVseVxuICAgICAgICBpZiAoJ29uJyBpbiB1cGRhdGVUZXh0KSB7XG4gICAgICAgICAgdXBkYXRlVGV4dC5vbignZW5kJywgd3JhcFRleHQoY2lyY2xlcywgbGFiZWwpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB1cGRhdGVUZXh0LmVhY2goJ2VuZCcsIHdyYXBUZXh0KGNpcmNsZXMsIGxhYmVsKSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHVwZGF0ZVRleHQuZWFjaCh3cmFwVGV4dChjaXJjbGVzLCBsYWJlbCkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHJlbW92ZSBvbGRcbiAgICBjb25zdCBleGl0ID0gYXNUcmFuc2l0aW9uKG5vZGVzLmV4aXQoKSkucmVtb3ZlKCk7XG4gICAgaWYgKHR5cGVvZiBub2Rlcy50cmFuc2l0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBleGl0LnNlbGVjdEFsbCgncGF0aCcpLmF0dHJUd2VlbignZCcsIHBhdGhUd2Vlbik7XG4gICAgfVxuXG4gICAgY29uc3QgZXhpdFRleHQgPSBleGl0XG4gICAgICAuc2VsZWN0QWxsKCd0ZXh0JylcbiAgICAgIC5hdHRyKCd4Jywgd2lkdGggLyAyKVxuICAgICAgLmF0dHIoJ3knLCBoZWlnaHQgLyAyKTtcblxuICAgIC8vIGlmIHdlJ3ZlIGJlZW4gcGFzc2VkIGEgZm9udFNpemUgZXhwbGljaXRseSwgdXNlIGl0IHRvXG4gICAgLy8gdHJhbnNpdGlvblxuICAgIGlmIChmb250U2l6ZSAhPT0gbnVsbCkge1xuICAgICAgZW50ZXJUZXh0LnN0eWxlKCdmb250LXNpemUnLCAnMHB4Jyk7XG4gICAgICB1cGRhdGVUZXh0LnN0eWxlKCdmb250LXNpemUnLCBmb250U2l6ZSk7XG4gICAgICBleGl0VGV4dC5zdHlsZSgnZm9udC1zaXplJywgJzBweCcpO1xuICAgIH1cblxuICAgIHJldHVybiB7IGNpcmNsZXMsIHRleHRDZW50cmVzLCBub2RlcywgZW50ZXIsIHVwZGF0ZSwgZXhpdCB9O1xuICB9XG5cbiAgY2hhcnQud3JhcCA9IGZ1bmN0aW9uIChfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gd3JhcDtcbiAgICB3cmFwID0gXztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQudXNlVmlld0JveCA9IGZ1bmN0aW9uICgpIHtcbiAgICB1c2VWaWV3Qm94ID0gdHJ1ZTtcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQud2lkdGggPSBmdW5jdGlvbiAoXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHdpZHRoO1xuICAgIHdpZHRoID0gXztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQuaGVpZ2h0ID0gZnVuY3Rpb24gKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBoZWlnaHQ7XG4gICAgaGVpZ2h0ID0gXztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQucGFkZGluZyA9IGZ1bmN0aW9uIChfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcGFkZGluZztcbiAgICBwYWRkaW5nID0gXztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQuZGlzdGluY3QgPSBmdW5jdGlvbiAoXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGRpc3RpbmN0O1xuICAgIGRpc3RpbmN0ID0gXztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQuY29sb3VycyA9IGZ1bmN0aW9uIChfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gY29sb3VycztcbiAgICBjb2xvdXJzID0gXztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQuY29sb3JzID0gZnVuY3Rpb24gKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBjb2xvdXJzO1xuICAgIGNvbG91cnMgPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC5mb250U2l6ZSA9IGZ1bmN0aW9uIChfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gZm9udFNpemU7XG4gICAgZm9udFNpemUgPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC5yb3VuZCA9IGZ1bmN0aW9uIChfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcm91bmQ7XG4gICAgcm91bmQgPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC5kdXJhdGlvbiA9IGZ1bmN0aW9uIChfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gZHVyYXRpb247XG4gICAgZHVyYXRpb24gPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC5sYXlvdXRGdW5jdGlvbiA9IGZ1bmN0aW9uIChfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gbGF5b3V0RnVuY3Rpb247XG4gICAgbGF5b3V0RnVuY3Rpb24gPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC5ub3JtYWxpemUgPSBmdW5jdGlvbiAoXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIG5vcm1hbGl6ZTtcbiAgICBub3JtYWxpemUgPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC5zY2FsZVRvRml0ID0gZnVuY3Rpb24gKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBzY2FsZVRvRml0O1xuICAgIHNjYWxlVG9GaXQgPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC5zdHlsZWQgPSBmdW5jdGlvbiAoXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHN0eWxlZDtcbiAgICBzdHlsZWQgPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC5vcmllbnRhdGlvbiA9IGZ1bmN0aW9uIChfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gb3JpZW50YXRpb247XG4gICAgb3JpZW50YXRpb24gPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC5vcmllbnRhdGlvbk9yZGVyID0gZnVuY3Rpb24gKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBvcmllbnRhdGlvbk9yZGVyO1xuICAgIG9yaWVudGF0aW9uT3JkZXIgPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC5sb3NzRnVuY3Rpb24gPSBmdW5jdGlvbiAoXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGxvc3M7XG4gICAgbG9zcyA9IF8gPT09ICdkZWZhdWx0JyA/IGxvc3NGdW5jdGlvbiA6IF8gPT09ICdsb2dSYXRpbycgPyBsb2dSYXRpb0xvc3NGdW5jdGlvbiA6IF87XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIHJldHVybiBjaGFydDtcbn1cblxuLy8gc29tZXRpbWVzIHRleHQgZG9lc24ndCBmaXQgaW5zaWRlIHRoZSBjaXJjbGUsIGlmIHRoYXRzIHRoZSBjYXNlIGxldHMgd3JhcFxuLy8gdGhlIHRleHQgaGVyZSBzdWNoIHRoYXQgaXQgZml0c1xuLy8gdG9kbzogbG9va3MgbGlrZSB0aGlzIG1pZ2h0IGJlIG1lcmdlZCBpbnRvIGQzIChcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tYm9zdG9jay9kMy9pc3N1ZXMvMTY0MiksXG4vLyBhbHNvIHdvcnRoIGNoZWNraW5nIG91dCBpc1xuLy8gaHR0cDovL2VuZ2luZWVyaW5nLmZpbmR0aGViZXN0LmNvbS93cmFwcGluZy1heGlzLWxhYmVscy1pbi1kMy1qcy9cbi8vIHRoaXMgc2VlbXMgdG8gYmUgb25lIG9mIHRob3NlIHRoaW5ncyB0aGF0IHNob3VsZCBiZSBlYXN5IGJ1dCBpc24ndFxuZnVuY3Rpb24gd3JhcFRleHQoY2lyY2xlcywgbGFiZWxsZXIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgY29uc3QgdGV4dCA9IHRoaXM7XG4gICAgY29uc3Qgd2lkdGggPSBjaXJjbGVzW2RhdGEuc2V0c1swXV0ucmFkaXVzIHx8IDUwO1xuICAgIGNvbnN0IGxhYmVsID0gbGFiZWxsZXIoZGF0YSkgfHwgJyc7XG5cbiAgICBjb25zdCB3b3JkcyA9IGxhYmVsLnNwbGl0KC9cXHMrLykucmV2ZXJzZSgpO1xuICAgIGNvbnN0IG1heExpbmVzID0gMztcbiAgICBjb25zdCBtaW5DaGFycyA9IChsYWJlbC5sZW5ndGggKyB3b3Jkcy5sZW5ndGgpIC8gbWF4TGluZXM7XG5cbiAgICBsZXQgd29yZCA9IHdvcmRzLnBvcCgpO1xuICAgIGxldCBsaW5lID0gW3dvcmRdO1xuICAgIGxldCBsaW5lTnVtYmVyID0gMDtcbiAgICBjb25zdCBsaW5lSGVpZ2h0ID0gMS4xOyAvLyBlbXNcbiAgICB0ZXh0LnRleHRDb250ZW50ID0gbnVsbDsgLy8gY2xlYXJcbiAgICBjb25zdCB0c3BhbnMgPSBbXTtcblxuICAgIGZ1bmN0aW9uIGFwcGVuZCh3b3JkKSB7XG4gICAgICBjb25zdCB0c3BhbiA9IHRleHQub3duZXJEb2N1bWVudC5jcmVhdGVFbGVtZW50TlModGV4dC5uYW1lc3BhY2VVUkksICd0c3BhbicpO1xuICAgICAgdHNwYW4udGV4dENvbnRlbnQgPSB3b3JkO1xuICAgICAgdHNwYW5zLnB1c2godHNwYW4pO1xuICAgICAgdGV4dC5hcHBlbmQodHNwYW4pO1xuICAgICAgcmV0dXJuIHRzcGFuO1xuICAgIH1cbiAgICBsZXQgdHNwYW4gPSBhcHBlbmQod29yZCk7XG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgd29yZCA9IHdvcmRzLnBvcCgpO1xuICAgICAgaWYgKCF3b3JkKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgbGluZS5wdXNoKHdvcmQpO1xuICAgICAgY29uc3Qgam9pbmVkID0gbGluZS5qb2luKCcgJyk7XG4gICAgICB0c3Bhbi50ZXh0Q29udGVudCA9IGpvaW5lZDtcbiAgICAgIGlmIChqb2luZWQubGVuZ3RoID4gbWluQ2hhcnMgJiYgdHNwYW4uZ2V0Q29tcHV0ZWRUZXh0TGVuZ3RoKCkgPiB3aWR0aCkge1xuICAgICAgICBsaW5lLnBvcCgpO1xuICAgICAgICB0c3Bhbi50ZXh0Q29udGVudCA9IGxpbmUuam9pbignICcpO1xuICAgICAgICBsaW5lID0gW3dvcmRdO1xuICAgICAgICB0c3BhbiA9IGFwcGVuZCh3b3JkKTtcbiAgICAgICAgbGluZU51bWJlcisrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGluaXRpYWwgPSAwLjM1IC0gKGxpbmVOdW1iZXIgKiBsaW5lSGVpZ2h0KSAvIDI7XG4gICAgY29uc3QgeCA9IHRleHQuZ2V0QXR0cmlidXRlKCd4Jyk7XG4gICAgY29uc3QgeSA9IHRleHQuZ2V0QXR0cmlidXRlKCd5Jyk7XG4gICAgdHNwYW5zLmZvckVhY2goKHQsIGkpID0+IHtcbiAgICAgIHQuc2V0QXR0cmlidXRlKCd4JywgeCk7XG4gICAgICB0LnNldEF0dHJpYnV0ZSgneScsIHkpO1xuICAgICAgdC5zZXRBdHRyaWJ1dGUoJ2R5JywgYCR7aW5pdGlhbCArIGkgKiBsaW5lSGVpZ2h0fWVtYCk7XG4gICAgfSk7XG4gIH07XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7e3g6IG51bWJlciwgeTogbnVtYmVyfX0gY3VycmVudFxuICogQHBhcmFtIHtSZWFkb25seUFycmF5PHt4OiBudW1iZXIsIHk6IG51bWJlcn0+fSBpbnRlcmlvclxuICogQHBhcmFtIHtSZWFkb25seUFycmF5PHt4OiBudW1iZXIsIHk6IG51bWJlcn0+fSBleHRlcmlvclxuICogQHJldHVybnMge251bWJlcn1cbiAqL1xuZnVuY3Rpb24gY2lyY2xlTWFyZ2luKGN1cnJlbnQsIGludGVyaW9yLCBleHRlcmlvcikge1xuICBsZXQgbWFyZ2luID0gaW50ZXJpb3JbMF0ucmFkaXVzIC0gZGlzdGFuY2UoaW50ZXJpb3JbMF0sIGN1cnJlbnQpO1xuXG4gIGZvciAobGV0IGkgPSAxOyBpIDwgaW50ZXJpb3IubGVuZ3RoOyArK2kpIHtcbiAgICBjb25zdCBtID0gaW50ZXJpb3JbaV0ucmFkaXVzIC0gZGlzdGFuY2UoaW50ZXJpb3JbaV0sIGN1cnJlbnQpO1xuICAgIGlmIChtIDw9IG1hcmdpbikge1xuICAgICAgbWFyZ2luID0gbTtcbiAgICB9XG4gIH1cblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGV4dGVyaW9yLmxlbmd0aDsgKytpKSB7XG4gICAgY29uc3QgbSA9IGRpc3RhbmNlKGV4dGVyaW9yW2ldLCBjdXJyZW50KSAtIGV4dGVyaW9yW2ldLnJhZGl1cztcbiAgICBpZiAobSA8PSBtYXJnaW4pIHtcbiAgICAgIG1hcmdpbiA9IG07XG4gICAgfVxuICB9XG4gIHJldHVybiBtYXJnaW47XG59XG5cbi8qKlxuICogY29tcHV0ZSB0aGUgY2VudGVyIG9mIHNvbWUgY2lyY2xlcyBieSBtYXhpbWl6aW5nIHRoZSBtYXJnaW4gb2ZcbiAqIHRoZSBjZW50ZXIgcG9pbnQgcmVsYXRpdmUgdG8gdGhlIGNpcmNsZXMgKGludGVyaW9yKSBhZnRlciBzdWJ0cmFjdGluZ1xuICogbmVhcmJ5IGNpcmNsZXMgKGV4dGVyaW9yKVxuICogQHBhcmFtIHtyZWFkb25seSB7eDogbnVtYmVyLCB5OiBudW1iZXIsIHJhZGl1czogbnVtYmVyfVtdfSBpbnRlcmlvclxuICogQHBhcmFtIHtyZWFkb25seSB7eDogbnVtYmVyLCB5OiBudW1iZXIsIHJhZGl1czogbnVtYmVyfVtdfSBleHRlcmlvclxuICogQHBhcmFtIHtib29sZWFufSBzeW1tZXRyaWNhbFRleHRDZW50cmVcbiAqIEByZXR1cm5zIHt7eDpudW1iZXIsIHk6IG51bWJlcn19XG4gKi9cbmZ1bmN0aW9uIGNvbXB1dGVUZXh0Q2VudHJlKGludGVyaW9yLCBleHRlcmlvciwgc3ltbWV0cmljYWxUZXh0Q2VudHJlKSB7XG4gIC8vIGdldCBhbiBpbml0aWFsIGVzdGltYXRlIGJ5IHNhbXBsaW5nIGFyb3VuZCB0aGUgaW50ZXJpb3IgY2lyY2xlc1xuICAvLyBhbmQgdGFraW5nIHRoZSBwb2ludCB3aXRoIHRoZSBiaWdnZXN0IG1hcmdpblxuICAvKiogQHR5cGUge3t4OiBudW1iZXIsIHk6IG51bWJlcn1bXX0gKi9cbiAgY29uc3QgcG9pbnRzID0gW107XG4gIGZvciAoY29uc3QgYyBvZiBpbnRlcmlvcikge1xuICAgIHBvaW50cy5wdXNoKHsgeDogYy54LCB5OiBjLnkgfSk7XG4gICAgcG9pbnRzLnB1c2goeyB4OiBjLnggKyBjLnJhZGl1cyAvIDIsIHk6IGMueSB9KTtcbiAgICBwb2ludHMucHVzaCh7IHg6IGMueCAtIGMucmFkaXVzIC8gMiwgeTogYy55IH0pO1xuICAgIHBvaW50cy5wdXNoKHsgeDogYy54LCB5OiBjLnkgKyBjLnJhZGl1cyAvIDIgfSk7XG4gICAgcG9pbnRzLnB1c2goeyB4OiBjLngsIHk6IGMueSAtIGMucmFkaXVzIC8gMiB9KTtcbiAgfVxuXG4gIGxldCBpbml0aWFsID0gcG9pbnRzWzBdO1xuICBsZXQgbWFyZ2luID0gY2lyY2xlTWFyZ2luKHBvaW50c1swXSwgaW50ZXJpb3IsIGV4dGVyaW9yKTtcblxuICBmb3IgKGxldCBpID0gMTsgaSA8IHBvaW50cy5sZW5ndGg7ICsraSkge1xuICAgIGNvbnN0IG0gPSBjaXJjbGVNYXJnaW4ocG9pbnRzW2ldLCBpbnRlcmlvciwgZXh0ZXJpb3IpO1xuICAgIGlmIChtID49IG1hcmdpbikge1xuICAgICAgaW5pdGlhbCA9IHBvaW50c1tpXTtcbiAgICAgIG1hcmdpbiA9IG07XG4gICAgfVxuICB9XG5cbiAgLy8gbWF4aW1pemUgdGhlIG1hcmdpbiBudW1lcmljYWxseVxuICBjb25zdCBzb2x1dGlvbiA9IG5lbGRlck1lYWQoXG4gICAgKHApID0+IC0xICogY2lyY2xlTWFyZ2luKHsgeDogcFswXSwgeTogcFsxXSB9LCBpbnRlcmlvciwgZXh0ZXJpb3IpLFxuICAgIFtpbml0aWFsLngsIGluaXRpYWwueV0sXG4gICAgeyBtYXhJdGVyYXRpb25zOiA1MDAsIG1pbkVycm9yRGVsdGE6IDFlLTEwIH1cbiAgKS54O1xuXG4gIGNvbnN0IHJldCA9IHsgeDogc3ltbWV0cmljYWxUZXh0Q2VudHJlID8gMCA6IHNvbHV0aW9uWzBdLCB5OiBzb2x1dGlvblsxXSB9O1xuXG4gIC8vIGNoZWNrIHNvbHV0aW9uLCBmYWxsYmFjayBhcyBuZWVkZWQgKGhhcHBlbnMgaWYgZnVsbHkgb3ZlcmxhcHBlZFxuICAvLyBldGMpXG4gIGxldCB2YWxpZCA9IHRydWU7XG4gIGZvciAoY29uc3QgaSBvZiBpbnRlcmlvcikge1xuICAgIGlmIChkaXN0YW5jZShyZXQsIGkpID4gaS5yYWRpdXMpIHtcbiAgICAgIHZhbGlkID0gZmFsc2U7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBmb3IgKGNvbnN0IGUgb2YgZXh0ZXJpb3IpIHtcbiAgICBpZiAoZGlzdGFuY2UocmV0LCBlKSA8IGUucmFkaXVzKSB7XG4gICAgICB2YWxpZCA9IGZhbHNlO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIGlmICh2YWxpZCkge1xuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBpZiAoaW50ZXJpb3IubGVuZ3RoID09IDEpIHtcbiAgICByZXR1cm4geyB4OiBpbnRlcmlvclswXS54LCB5OiBpbnRlcmlvclswXS55IH07XG4gIH1cbiAgY29uc3QgYXJlYVN0YXRzID0ge307XG4gIGludGVyc2VjdGlvbkFyZWEoaW50ZXJpb3IsIGFyZWFTdGF0cyk7XG5cbiAgaWYgKGFyZWFTdGF0cy5hcmNzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB7IHg6IDAsIHk6IC0xMDAwLCBkaXNqb2ludDogdHJ1ZSB9O1xuICB9XG4gIGlmIChhcmVhU3RhdHMuYXJjcy5sZW5ndGggPT0gMSkge1xuICAgIHJldHVybiB7IHg6IGFyZWFTdGF0cy5hcmNzWzBdLmNpcmNsZS54LCB5OiBhcmVhU3RhdHMuYXJjc1swXS5jaXJjbGUueSB9O1xuICB9XG4gIGlmIChleHRlcmlvci5sZW5ndGgpIHtcbiAgICAvLyB0cnkgYWdhaW4gd2l0aG91dCBvdGhlciBjaXJjbGVzXG4gICAgcmV0dXJuIGNvbXB1dGVUZXh0Q2VudHJlKGludGVyaW9yLCBbXSk7XG4gIH1cbiAgLy8gdGFrZSBhdmVyYWdlIG9mIGFsbCB0aGUgcG9pbnRzIGluIHRoZSBpbnRlcnNlY3Rpb25cbiAgLy8gcG9seWdvbi4gdGhpcyBzaG91bGQgYmFzaWNhbGx5IG5ldmVyIGhhcHBlblxuICAvLyBhbmQgaGFzIHNvbWUgaXNzdWVzOlxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vYmVuZnJlZC92ZW5uLmpzL2lzc3Vlcy80OCNpc3N1ZWNvbW1lbnQtMTQ2MDY5Nzc3XG4gIHJldHVybiBnZXRDZW50ZXIoYXJlYVN0YXRzLmFyY3MubWFwKChhKSA9PiBhLnAxKSk7XG59XG5cbi8vIGdpdmVuIGEgZGljdGlvbmFyeSBvZiB7c2V0aWQgOiBjaXJjbGV9LCByZXR1cm5zXG4vLyBhIGRpY3Rpb25hcnkgb2Ygc2V0aWQgdG8gbGlzdCBvZiBjaXJjbGVzIHRoYXQgY29tcGxldGVseSBvdmVybGFwIGl0XG5mdW5jdGlvbiBnZXRPdmVybGFwcGluZ0NpcmNsZXMoY2lyY2xlcykge1xuICBjb25zdCByZXQgPSB7fTtcbiAgY29uc3QgY2lyY2xlaWRzID0gT2JqZWN0LmtleXMoY2lyY2xlcyk7XG4gIGZvciAoY29uc3QgY2lyY2xlaWQgb2YgY2lyY2xlaWRzKSB7XG4gICAgcmV0W2NpcmNsZWlkXSA9IFtdO1xuICB9XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY2lyY2xlaWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgY2kgPSBjaXJjbGVpZHNbaV07XG4gICAgY29uc3QgYSA9IGNpcmNsZXNbY2ldO1xuICAgIGZvciAobGV0IGogPSBpICsgMTsgaiA8IGNpcmNsZWlkcy5sZW5ndGg7ICsraikge1xuICAgICAgY29uc3QgY2ogPSBjaXJjbGVpZHNbal07XG4gICAgICBjb25zdCBiID0gY2lyY2xlc1tjal07XG4gICAgICBjb25zdCBkID0gZGlzdGFuY2UoYSwgYik7XG5cbiAgICAgIGlmIChkICsgYi5yYWRpdXMgPD0gYS5yYWRpdXMgKyAxZS0xMCkge1xuICAgICAgICByZXRbY2pdLnB1c2goY2kpO1xuICAgICAgfSBlbHNlIGlmIChkICsgYS5yYWRpdXMgPD0gYi5yYWRpdXMgKyAxZS0xMCkge1xuICAgICAgICByZXRbY2ldLnB1c2goY2opO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBjb21wdXRlVGV4dENlbnRyZXMoY2lyY2xlcywgYXJlYXMsIHN5bW1ldHJpY2FsVGV4dENlbnRyZSkge1xuICBjb25zdCByZXQgPSB7fTtcbiAgY29uc3Qgb3ZlcmxhcHBlZCA9IGdldE92ZXJsYXBwaW5nQ2lyY2xlcyhjaXJjbGVzKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcmVhcy5sZW5ndGg7ICsraSkge1xuICAgIGNvbnN0IGFyZWEgPSBhcmVhc1tpXS5zZXRzO1xuICAgIGNvbnN0IGFyZWFpZHMgPSB7fTtcbiAgICBjb25zdCBleGNsdWRlID0ge307XG5cbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IGFyZWEubGVuZ3RoOyArK2opIHtcbiAgICAgIGFyZWFpZHNbYXJlYVtqXV0gPSB0cnVlO1xuICAgICAgY29uc3Qgb3ZlcmxhcHMgPSBvdmVybGFwcGVkW2FyZWFbal1dO1xuICAgICAgLy8ga2VlcCB0cmFjayBvZiBhbnkgY2lyY2xlcyB0aGF0IG92ZXJsYXAgdGhpcyBhcmVhLFxuICAgICAgLy8gYW5kIGRvbid0IGNvbnNpZGVyIGZvciBwdXJwb3NlcyBvZiBjb21wdXRpbmcgdGhlIHRleHRcbiAgICAgIC8vIGNlbnRyZVxuICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCBvdmVybGFwcy5sZW5ndGg7ICsraykge1xuICAgICAgICBleGNsdWRlW292ZXJsYXBzW2tdXSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaW50ZXJpb3IgPSBbXTtcbiAgICBjb25zdCBleHRlcmlvciA9IFtdO1xuICAgIGZvciAobGV0IHNldGlkIGluIGNpcmNsZXMpIHtcbiAgICAgIGlmIChzZXRpZCBpbiBhcmVhaWRzKSB7XG4gICAgICAgIGludGVyaW9yLnB1c2goY2lyY2xlc1tzZXRpZF0pO1xuICAgICAgfSBlbHNlIGlmICghKHNldGlkIGluIGV4Y2x1ZGUpKSB7XG4gICAgICAgIGV4dGVyaW9yLnB1c2goY2lyY2xlc1tzZXRpZF0pO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBjZW50cmUgPSBjb21wdXRlVGV4dENlbnRyZShpbnRlcmlvciwgZXh0ZXJpb3IsIHN5bW1ldHJpY2FsVGV4dENlbnRyZSk7XG4gICAgcmV0W2FyZWFdID0gY2VudHJlO1xuICAgIGlmIChjZW50cmUuZGlzam9pbnQgJiYgYXJlYXNbaV0uc2l6ZSA+IDApIHtcbiAgICAgIGNvbnNvbGUubG9nKCdXQVJOSU5HOiBhcmVhICcgKyBhcmVhICsgJyBub3QgcmVwcmVzZW50ZWQgb24gc2NyZWVuJyk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbi8vIHNvcnRzIGFsbCBhcmVhcyBpbiB0aGUgdmVubiBkaWFncmFtLCBzbyB0aGF0XG4vLyBhIHBhcnRpY3VsYXIgYXJlYSBpcyBvbiB0b3AgKHJlbGF0aXZlVG8pIC0gYW5kXG4vLyBhbGwgb3RoZXIgYXJlYXMgYXJlIHNvIHRoYXQgdGhlIHNtYWxsZXN0IGFyZWFzIGFyZSBvbiB0b3BcbmZ1bmN0aW9uIHNvcnRBcmVhcyhkaXYsIHJlbGF0aXZlVG8pIHtcbiAgLy8gZmlndXJlIG91dCBzZXRzIHRoYXQgYXJlIGNvbXBsZXRlbHkgb3ZlcmxhcHBlZCBieSByZWxhdGl2ZVRvXG4gIGNvbnN0IG92ZXJsYXBzID0gZ2V0T3ZlcmxhcHBpbmdDaXJjbGVzKGRpdi5zZWxlY3RBbGwoJ3N2ZycpLmRhdHVtKCkpO1xuICBjb25zdCBleGNsdWRlID0gbmV3IFNldCgpO1xuICBmb3IgKGNvbnN0IGNoZWNrIG9mIHJlbGF0aXZlVG8uc2V0cykge1xuICAgIGZvciAobGV0IHNldGlkIGluIG92ZXJsYXBzKSB7XG4gICAgICBjb25zdCBvdmVybGFwID0gb3ZlcmxhcHNbc2V0aWRdO1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBvdmVybGFwLmxlbmd0aDsgKytqKSB7XG4gICAgICAgIGlmIChvdmVybGFwW2pdID09IGNoZWNrKSB7XG4gICAgICAgICAgZXhjbHVkZS5hZGQoc2V0aWQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gY2hlY2tzIHRoYXQgYWxsIHNldHMgYXJlIGluIGV4Y2x1ZGU7XG4gIGZ1bmN0aW9uIHNob3VsZEV4Y2x1ZGUoc2V0cykge1xuICAgIHJldHVybiBzZXRzLmV2ZXJ5KChzZXQpID0+ICFleGNsdWRlLmhhcyhzZXQpKTtcbiAgfVxuXG4gIC8vIG5lZWQgdG8gc29ydCBkaXYncyBzbyB0aGF0IFogb3JkZXIgaXMgY29ycmVjdFxuICBkaXYuc2VsZWN0QWxsKCdnJykuc29ydCgoYSwgYikgPT4ge1xuICAgIC8vIGhpZ2hlc3Qgb3JkZXIgc2V0IGludGVyc2VjdGlvbnMgZmlyc3RcbiAgICBpZiAoYS5zZXRzLmxlbmd0aCAhPSBiLnNldHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gYS5zZXRzLmxlbmd0aCAtIGIuc2V0cy5sZW5ndGg7XG4gICAgfVxuXG4gICAgaWYgKGEgPT0gcmVsYXRpdmVUbykge1xuICAgICAgcmV0dXJuIHNob3VsZEV4Y2x1ZGUoYi5zZXRzKSA/IC0xIDogMTtcbiAgICB9XG4gICAgaWYgKGIgPT0gcmVsYXRpdmVUbykge1xuICAgICAgcmV0dXJuIHNob3VsZEV4Y2x1ZGUoYS5zZXRzKSA/IDEgOiAtMTtcbiAgICB9XG5cbiAgICAvLyBmaW5hbGx5IGJ5IHNpemVcbiAgICByZXR1cm4gYi5zaXplIC0gYS5zaXplO1xuICB9KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge251bWJlcn0geFxuICogQHBhcmFtIHtudW1iZXJ9IHlcbiAqIEBwYXJhbSB7bnVtYmVyfSByXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBjaXJjbGVQYXRoKHgsIHksIHIpIHtcbiAgY29uc3QgcmV0ID0gW107XG4gIHJldC5wdXNoKCdcXG5NJywgeCwgeSk7XG4gIHJldC5wdXNoKCdcXG5tJywgLXIsIDApO1xuICByZXQucHVzaCgnXFxuYScsIHIsIHIsIDAsIDEsIDAsIHIgKiAyLCAwKTtcbiAgcmV0LnB1c2goJ1xcbmEnLCByLCByLCAwLCAxLCAwLCAtciAqIDIsIDApO1xuICByZXR1cm4gcmV0LmpvaW4oJyAnKTtcbn1cblxuLyoqXG4gKiBpbnZlcnNlIG9mIHRoZSBjaXJjbGVQYXRoIGZ1bmN0aW9uLCByZXR1cm5zIGEgY2lyY2xlIG9iamVjdCBmcm9tIGFuIHN2ZyBwYXRoXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxuICogQHJldHVybnMge3t4OiBudW1iZXIsIHk6IG51bWJlciwgcmFkaXVzOiBudW1iZXJ9fVxuICovXG5mdW5jdGlvbiBjaXJjbGVGcm9tUGF0aChwYXRoKSB7XG4gIGNvbnN0IHRva2VucyA9IHBhdGguc3BsaXQoJyAnKTtcbiAgcmV0dXJuIHsgeDogTnVtYmVyLnBhcnNlRmxvYXQodG9rZW5zWzFdKSwgeTogTnVtYmVyLnBhcnNlRmxvYXQodG9rZW5zWzJdKSwgcmFkaXVzOiAtTnVtYmVyLnBhcnNlRmxvYXQodG9rZW5zWzRdKSB9O1xufVxuXG5mdW5jdGlvbiBpbnRlcnNlY3Rpb25BcmVhQXJjcyhjaXJjbGVzKSB7XG4gIGlmIChjaXJjbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBjb25zdCBzdGF0cyA9IHt9O1xuICBpbnRlcnNlY3Rpb25BcmVhKGNpcmNsZXMsIHN0YXRzKTtcbiAgcmV0dXJuIHN0YXRzLmFyY3M7XG59XG5cbmZ1bmN0aW9uIGFyY3NUb1BhdGgoYXJjcywgcm91bmQpIHtcbiAgaWYgKGFyY3MubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuICdNIDAgMCc7XG4gIH1cbiAgY29uc3QgckZhY3RvciA9IE1hdGgucG93KDEwLCByb3VuZCB8fCAwKTtcbiAgY29uc3QgciA9IHJvdW5kICE9IG51bGwgPyAodikgPT4gTWF0aC5yb3VuZCh2ICogckZhY3RvcikgLyByRmFjdG9yIDogKHYpID0+IHY7XG4gIGlmIChhcmNzLmxlbmd0aCA9PSAxKSB7XG4gICAgY29uc3QgY2lyY2xlID0gYXJjc1swXS5jaXJjbGU7XG4gICAgcmV0dXJuIGNpcmNsZVBhdGgocihjaXJjbGUueCksIHIoY2lyY2xlLnkpLCByKGNpcmNsZS5yYWRpdXMpKTtcbiAgfVxuICAvLyBkcmF3IHBhdGggYXJvdW5kIGFyY3NcbiAgY29uc3QgcmV0ID0gWydcXG5NJywgcihhcmNzWzBdLnAyLngpLCByKGFyY3NbMF0ucDIueSldO1xuICBmb3IgKGNvbnN0IGFyYyBvZiBhcmNzKSB7XG4gICAgY29uc3QgcmFkaXVzID0gcihhcmMuY2lyY2xlLnJhZGl1cyk7XG4gICAgcmV0LnB1c2goJ1xcbkEnLCByYWRpdXMsIHJhZGl1cywgMCwgYXJjLmxhcmdlID8gMSA6IDAsIGFyYy5zd2VlcCA/IDEgOiAwLCByKGFyYy5wMS54KSwgcihhcmMucDEueSkpO1xuICB9XG4gIHJldHVybiByZXQuam9pbignICcpO1xufVxuXG4vKipcbiAqIHJldHVybnMgYSBzdmcgcGF0aCBvZiB0aGUgaW50ZXJzZWN0aW9uIGFyZWEgb2YgYSBidW5jaCBvZiBjaXJjbGVzXG4gKiBAcGFyYW0ge1JlYWRvbmx5QXJyYXk8e3g6IG51bWJlciwgeTogbnVtYmVyLCByYWRpdXM6IG51bWJlcn0+fSBjaXJjbGVzXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBpbnRlcnNlY3Rpb25BcmVhUGF0aChjaXJjbGVzLCByb3VuZCkge1xuICByZXR1cm4gYXJjc1RvUGF0aChpbnRlcnNlY3Rpb25BcmVhQXJjcyhjaXJjbGVzKSwgcm91bmQpO1xufVxuXG5mdW5jdGlvbiBsYXlvdXQoZGF0YSwgb3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IHtcbiAgICBsb3NzRnVuY3Rpb246IGxvc3MsXG4gICAgbGF5b3V0RnVuY3Rpb246IGxheW91dCA9IHZlbm4sXG4gICAgbm9ybWFsaXplID0gdHJ1ZSxcbiAgICBvcmllbnRhdGlvbiA9IE1hdGguUEkgLyAyLFxuICAgIG9yaWVudGF0aW9uT3JkZXIsXG4gICAgd2lkdGggPSA2MDAsXG4gICAgaGVpZ2h0ID0gMzUwLFxuICAgIHBhZGRpbmcgPSAxNSxcbiAgICBzY2FsZVRvRml0ID0gZmFsc2UsXG4gICAgc3ltbWV0cmljYWxUZXh0Q2VudHJlID0gZmFsc2UsXG4gICAgZGlzdGluY3QsXG4gICAgcm91bmQgPSAyLFxuICB9ID0gb3B0aW9ucztcblxuICBsZXQgc29sdXRpb24gPSBsYXlvdXQoZGF0YSwge1xuICAgIGxvc3NGdW5jdGlvbjogbG9zcyA9PT0gJ2RlZmF1bHQnIHx8ICFsb3NzID8gbG9zc0Z1bmN0aW9uIDogbG9zcyA9PT0gJ2xvZ1JhdGlvJyA/IGxvZ1JhdGlvTG9zc0Z1bmN0aW9uIDogbG9zcyxcbiAgICBkaXN0aW5jdCxcbiAgfSk7XG5cbiAgaWYgKG5vcm1hbGl6ZSkge1xuICAgIHNvbHV0aW9uID0gbm9ybWFsaXplU29sdXRpb24oc29sdXRpb24sIG9yaWVudGF0aW9uLCBvcmllbnRhdGlvbk9yZGVyKTtcbiAgfVxuXG4gIGNvbnN0IGNpcmNsZXMgPSBzY2FsZVNvbHV0aW9uKHNvbHV0aW9uLCB3aWR0aCwgaGVpZ2h0LCBwYWRkaW5nLCBzY2FsZVRvRml0KTtcbiAgY29uc3QgdGV4dENlbnRyZXMgPSBjb21wdXRlVGV4dENlbnRyZXMoY2lyY2xlcywgZGF0YSwgc3ltbWV0cmljYWxUZXh0Q2VudHJlKTtcblxuICBjb25zdCBjaXJjbGVMb29rdXAgPSBuZXcgTWFwKFxuICAgIE9iamVjdC5rZXlzKGNpcmNsZXMpLm1hcCgoc2V0KSA9PiBbXG4gICAgICBzZXQsXG4gICAgICB7XG4gICAgICAgIHNldCxcbiAgICAgICAgeDogY2lyY2xlc1tzZXRdLngsXG4gICAgICAgIHk6IGNpcmNsZXNbc2V0XS55LFxuICAgICAgICByYWRpdXM6IGNpcmNsZXNbc2V0XS5yYWRpdXMsXG4gICAgICB9LFxuICAgIF0pXG4gICk7XG4gIGNvbnN0IGhlbHBlcnMgPSBkYXRhLm1hcCgoYXJlYSkgPT4ge1xuICAgIGNvbnN0IGNpcmNsZXMgPSBhcmVhLnNldHMubWFwKChzKSA9PiBjaXJjbGVMb29rdXAuZ2V0KHMpKTtcbiAgICBjb25zdCBhcmNzID0gaW50ZXJzZWN0aW9uQXJlYUFyY3MoY2lyY2xlcyk7XG4gICAgY29uc3QgcGF0aCA9IGFyY3NUb1BhdGgoYXJjcywgcm91bmQpO1xuICAgIHJldHVybiB7IGNpcmNsZXMsIGFyY3MsIHBhdGgsIGFyZWEsIGhhczogbmV3IFNldChhcmVhLnNldHMpIH07XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGdlbkRpc3RpbmN0UGF0aChzZXRzKSB7XG4gICAgbGV0IHIgPSAnJztcbiAgICBmb3IgKGNvbnN0IGUgb2YgaGVscGVycykge1xuICAgICAgaWYgKGUuaGFzLnNpemUgPiBzZXRzLmxlbmd0aCAmJiBzZXRzLmV2ZXJ5KChzKSA9PiBlLmhhcy5oYXMocykpKSB7XG4gICAgICAgIHIgKz0gJyAnICsgZS5wYXRoO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcjtcbiAgfVxuXG4gIHJldHVybiBoZWxwZXJzLm1hcCgoeyBjaXJjbGVzLCBhcmNzLCBwYXRoLCBhcmVhIH0pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgZGF0YTogYXJlYSxcbiAgICAgIHRleHQ6IHRleHRDZW50cmVzW2FyZWEuc2V0c10sXG4gICAgICBjaXJjbGVzLFxuICAgICAgYXJjcyxcbiAgICAgIHBhdGgsXG4gICAgICBkaXN0aW5jdFBhdGg6IHBhdGggKyBnZW5EaXN0aW5jdFBhdGgoYXJlYS5zZXRzKSxcbiAgICB9O1xuICB9KTtcbn1cblxuZXhwb3J0IHsgVmVubkRpYWdyYW0sIGJlc3RJbml0aWFsTGF5b3V0LCBjaXJjbGVBcmVhLCBjaXJjbGVDaXJjbGVJbnRlcnNlY3Rpb24sIGNpcmNsZUZyb21QYXRoLCBjaXJjbGVPdmVybGFwLCBjaXJjbGVQYXRoLCBjb21wdXRlVGV4dENlbnRyZSwgY29tcHV0ZVRleHRDZW50cmVzLCBkaXNqb2ludENsdXN0ZXIsIGRpc3RhbmNlLCBkaXN0YW5jZUZyb21JbnRlcnNlY3RBcmVhLCBncmVlZHlMYXlvdXQsIGludGVyc2VjdGlvbkFyZWEsIGludGVyc2VjdGlvbkFyZWFQYXRoLCBsYXlvdXQsIGxvZ1JhdGlvTG9zc0Z1bmN0aW9uLCBsb3NzRnVuY3Rpb24sIG5vcm1hbGl6ZVNvbHV0aW9uLCBzY2FsZVNvbHV0aW9uLCBzb3J0QXJlYXMsIHZlbm4sIHdyYXBUZXh0IH07XG4iLAogICAgImltcG9ydCB7XG4gIHNlbGVjdFN2Z0VsZW1lbnRcbn0gZnJvbSBcIi4vY2h1bmstV1U1TVlHMkcubWpzXCI7XG5pbXBvcnQge1xuICBjbGVhbkFuZE1lcmdlXG59IGZyb20gXCIuL2NodW5rLTVaUVlIWEtVLm1qc1wiO1xuaW1wb3J0IHtcbiAgY2xlYXIsXG4gIGNvbmZpZ3VyZVN2Z1NpemUsXG4gIGRlZmF1bHRDb25maWdfZGVmYXVsdCxcbiAgZ2V0QWNjRGVzY3JpcHRpb24sXG4gIGdldEFjY1RpdGxlLFxuICBnZXRDb25maWcsXG4gIGdldERpYWdyYW1UaXRsZSxcbiAgc2V0QWNjRGVzY3JpcHRpb24sXG4gIHNldEFjY1RpdGxlLFxuICBzZXREaWFncmFtVGl0bGVcbn0gZnJvbSBcIi4vY2h1bmstQ1NDSUhLN1EubWpzXCI7XG5pbXBvcnQge1xuICBfX25hbWVcbn0gZnJvbSBcIi4vY2h1bmstQUdIUkI0SkYubWpzXCI7XG5cbi8vIHNyYy9kaWFncmFtcy92ZW5uL3BhcnNlci92ZW5uLmppc29uXG52YXIgcGFyc2VyID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgbyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oaywgdiwgbzIsIGwpIHtcbiAgICBmb3IgKG8yID0gbzIgfHwge30sIGwgPSBrLmxlbmd0aDsgbC0tOyBvMltrW2xdXSA9IHYpIDtcbiAgICByZXR1cm4gbzI7XG4gIH0sIFwib1wiKSwgJFYwID0gWzUsIDhdLCAkVjEgPSBbNywgOCwgMTEsIDEyLCAxNywgMTksIDIyLCAyNF0sICRWMiA9IFsxLCAxN10sICRWMyA9IFsxLCAxOF0sICRWNCA9IFs3LCA4LCAxMSwgMTIsIDE0LCAxNSwgMTYsIDE3LCAxOSwgMjAsIDIxLCAyMiwgMjQsIDI3XSwgJFY1ID0gWzEsIDMxXSwgJFY2ID0gWzEsIDM5XSwgJFY3ID0gWzcsIDgsIDExLCAxMiwgMTcsIDE5LCAyMiwgMjQsIDI3XSwgJFY4ID0gWzEsIDU3XSwgJFY5ID0gWzEsIDU2XSwgJFZhID0gWzEsIDU4XSwgJFZiID0gWzEsIDU5XSwgJFZjID0gWzEsIDYwXSwgJFZkID0gWzcsIDgsIDExLCAxMiwgMTYsIDE3LCAxOSwgMjAsIDIyLCAyNCwgMjcsIDMxLCAzMiwgMzNdO1xuICB2YXIgcGFyc2VyMiA9IHtcbiAgICB0cmFjZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiB0cmFjZSgpIHtcbiAgICB9LCBcInRyYWNlXCIpLFxuICAgIHl5OiB7fSxcbiAgICBzeW1ib2xzXzogeyBcImVycm9yXCI6IDIsIFwic3RhcnRcIjogMywgXCJvcHROZXdsaW5lc1wiOiA0LCBcIlZFTk5cIjogNSwgXCJkb2N1bWVudFwiOiA2LCBcIkVPRlwiOiA3LCBcIk5FV0xJTkVcIjogOCwgXCJsaW5lXCI6IDksIFwic3RhdGVtZW50XCI6IDEwLCBcIlRJVExFXCI6IDExLCBcIlNFVFwiOiAxMiwgXCJpZGVudGlmaWVyXCI6IDEzLCBcIkJSQUNLRVRfTEFCRUxcIjogMTQsIFwiQ09MT05cIjogMTUsIFwiTlVNRVJJQ1wiOiAxNiwgXCJVTklPTlwiOiAxNywgXCJpZGVudGlmaWVyTGlzdFwiOiAxOCwgXCJURVhUXCI6IDE5LCBcIklERU5USUZJRVJcIjogMjAsIFwiU1RSSU5HXCI6IDIxLCBcIklOREVOVF9URVhUXCI6IDIyLCBcImluZGVudGVkVGV4dFRhaWxcIjogMjMsIFwiU1RZTEVcIjogMjQsIFwic3R5bGVzT3B0XCI6IDI1LCBcInN0eWxlRmllbGRcIjogMjYsIFwiQ09NTUFcIjogMjcsIFwic3R5bGVWYWx1ZVwiOiAyOCwgXCJ2YWx1ZVRva2Vuc1wiOiAyOSwgXCJ2YWx1ZVRva2VuXCI6IDMwLCBcIkhFWENPTE9SXCI6IDMxLCBcIlJHQkNPTE9SXCI6IDMyLCBcIlJHQkFDT0xPUlwiOiAzMywgXCIkYWNjZXB0XCI6IDAsIFwiJGVuZFwiOiAxIH0sXG4gICAgdGVybWluYWxzXzogeyAyOiBcImVycm9yXCIsIDU6IFwiVkVOTlwiLCA3OiBcIkVPRlwiLCA4OiBcIk5FV0xJTkVcIiwgMTE6IFwiVElUTEVcIiwgMTI6IFwiU0VUXCIsIDE0OiBcIkJSQUNLRVRfTEFCRUxcIiwgMTU6IFwiQ09MT05cIiwgMTY6IFwiTlVNRVJJQ1wiLCAxNzogXCJVTklPTlwiLCAxOTogXCJURVhUXCIsIDIwOiBcIklERU5USUZJRVJcIiwgMjE6IFwiU1RSSU5HXCIsIDIyOiBcIklOREVOVF9URVhUXCIsIDI0OiBcIlNUWUxFXCIsIDI3OiBcIkNPTU1BXCIsIDMxOiBcIkhFWENPTE9SXCIsIDMyOiBcIlJHQkNPTE9SXCIsIDMzOiBcIlJHQkFDT0xPUlwiIH0sXG4gICAgcHJvZHVjdGlvbnNfOiBbMCwgWzMsIDRdLCBbNCwgMF0sIFs0LCAyXSwgWzYsIDBdLCBbNiwgMl0sIFs5LCAxXSwgWzksIDFdLCBbMTAsIDFdLCBbMTAsIDJdLCBbMTAsIDNdLCBbMTAsIDRdLCBbMTAsIDVdLCBbMTAsIDJdLCBbMTAsIDNdLCBbMTAsIDRdLCBbMTAsIDVdLCBbMTAsIDNdLCBbMTAsIDNdLCBbMTAsIDNdLCBbMTAsIDRdLCBbMTAsIDRdLCBbMTAsIDJdLCBbMTAsIDNdLCBbMjMsIDFdLCBbMjMsIDFdLCBbMjMsIDFdLCBbMjMsIDJdLCBbMjMsIDJdLCBbMjUsIDFdLCBbMjUsIDNdLCBbMjYsIDNdLCBbMjgsIDFdLCBbMjgsIDFdLCBbMjksIDFdLCBbMjksIDJdLCBbMzAsIDFdLCBbMzAsIDFdLCBbMzAsIDFdLCBbMzAsIDFdLCBbMzAsIDFdLCBbMTgsIDFdLCBbMTgsIDNdLCBbMTMsIDFdLCBbMTMsIDFdXSxcbiAgICBwZXJmb3JtQWN0aW9uOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGFub255bW91cyh5eXRleHQsIHl5bGVuZywgeXlsaW5lbm8sIHl5LCB5eXN0YXRlLCAkJCwgXyQpIHtcbiAgICAgIHZhciAkMCA9ICQkLmxlbmd0aCAtIDE7XG4gICAgICBzd2l0Y2ggKHl5c3RhdGUpIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIHJldHVybiAkJFskMCAtIDFdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIHRoaXMuJCA9IFtdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgJCRbJDAgLSAxXS5wdXNoKCQkWyQwXSk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAxXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA2OlxuICAgICAgICAgIHRoaXMuJCA9IFtdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDc6XG4gICAgICAgIGNhc2UgMjI6XG4gICAgICAgIGNhc2UgMzI6XG4gICAgICAgIGNhc2UgMzY6XG4gICAgICAgIGNhc2UgMzc6XG4gICAgICAgIGNhc2UgMzg6XG4gICAgICAgIGNhc2UgMzk6XG4gICAgICAgIGNhc2UgNDA6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgeXkuc2V0RGlhZ3JhbVRpdGxlKCQkWyQwXS5zdWJzdHIoNikpO1xuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXS5zdWJzdHIoNik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgOTpcbiAgICAgICAgICB5eS5hZGRTdWJzZXREYXRhKFskJFskMF1dLCB2b2lkIDAsIHZvaWQgMCk7XG4gICAgICAgICAgaWYgKHl5LnNldEluZGVudE1vZGUpIHtcbiAgICAgICAgICAgIHl5LnNldEluZGVudE1vZGUodHJ1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEwOlxuICAgICAgICAgIHl5LmFkZFN1YnNldERhdGEoWyQkWyQwIC0gMV1dLCAkJFskMF0sIHZvaWQgMCk7XG4gICAgICAgICAgaWYgKHl5LnNldEluZGVudE1vZGUpIHtcbiAgICAgICAgICAgIHl5LnNldEluZGVudE1vZGUodHJ1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDExOlxuICAgICAgICAgIHl5LmFkZFN1YnNldERhdGEoWyQkWyQwIC0gMl1dLCB2b2lkIDAsIHBhcnNlRmxvYXQoJCRbJDBdKSk7XG4gICAgICAgICAgaWYgKHl5LnNldEluZGVudE1vZGUpIHtcbiAgICAgICAgICAgIHl5LnNldEluZGVudE1vZGUodHJ1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgIHl5LmFkZFN1YnNldERhdGEoWyQkWyQwIC0gM11dLCAkJFskMCAtIDJdLCBwYXJzZUZsb2F0KCQkWyQwXSkpO1xuICAgICAgICAgIGlmICh5eS5zZXRJbmRlbnRNb2RlKSB7XG4gICAgICAgICAgICB5eS5zZXRJbmRlbnRNb2RlKHRydWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICBpZiAoJCRbJDBdLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInVuaW9uIHJlcXVpcmVzIG11bHRpcGxlIGlkZW50aWZpZXJzXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoeXkudmFsaWRhdGVVbmlvbklkZW50aWZpZXJzKSB7XG4gICAgICAgICAgICB5eS52YWxpZGF0ZVVuaW9uSWRlbnRpZmllcnMoJCRbJDBdKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgeXkuYWRkU3Vic2V0RGF0YSgkJFskMF0sIHZvaWQgMCwgdm9pZCAwKTtcbiAgICAgICAgICBpZiAoeXkuc2V0SW5kZW50TW9kZSkge1xuICAgICAgICAgICAgeXkuc2V0SW5kZW50TW9kZSh0cnVlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTQ6XG4gICAgICAgICAgaWYgKCQkWyQwIC0gMV0ubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidW5pb24gcmVxdWlyZXMgbXVsdGlwbGUgaWRlbnRpZmllcnNcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh5eS52YWxpZGF0ZVVuaW9uSWRlbnRpZmllcnMpIHtcbiAgICAgICAgICAgIHl5LnZhbGlkYXRlVW5pb25JZGVudGlmaWVycygkJFskMCAtIDFdKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgeXkuYWRkU3Vic2V0RGF0YSgkJFskMCAtIDFdLCAkJFskMF0sIHZvaWQgMCk7XG4gICAgICAgICAgaWYgKHl5LnNldEluZGVudE1vZGUpIHtcbiAgICAgICAgICAgIHl5LnNldEluZGVudE1vZGUodHJ1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE1OlxuICAgICAgICAgIGlmICgkJFskMCAtIDJdLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInVuaW9uIHJlcXVpcmVzIG11bHRpcGxlIGlkZW50aWZpZXJzXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoeXkudmFsaWRhdGVVbmlvbklkZW50aWZpZXJzKSB7XG4gICAgICAgICAgICB5eS52YWxpZGF0ZVVuaW9uSWRlbnRpZmllcnMoJCRbJDAgLSAyXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHl5LmFkZFN1YnNldERhdGEoJCRbJDAgLSAyXSwgdm9pZCAwLCBwYXJzZUZsb2F0KCQkWyQwXSkpO1xuICAgICAgICAgIGlmICh5eS5zZXRJbmRlbnRNb2RlKSB7XG4gICAgICAgICAgICB5eS5zZXRJbmRlbnRNb2RlKHRydWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICBpZiAoJCRbJDAgLSAzXS5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1bmlvbiByZXF1aXJlcyBtdWx0aXBsZSBpZGVudGlmaWVyc1wiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHl5LnZhbGlkYXRlVW5pb25JZGVudGlmaWVycykge1xuICAgICAgICAgICAgeXkudmFsaWRhdGVVbmlvbklkZW50aWZpZXJzKCQkWyQwIC0gM10pO1xuICAgICAgICAgIH1cbiAgICAgICAgICB5eS5hZGRTdWJzZXREYXRhKCQkWyQwIC0gM10sICQkWyQwIC0gMl0sIHBhcnNlRmxvYXQoJCRbJDBdKSk7XG4gICAgICAgICAgaWYgKHl5LnNldEluZGVudE1vZGUpIHtcbiAgICAgICAgICAgIHl5LnNldEluZGVudE1vZGUodHJ1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE3OlxuICAgICAgICBjYXNlIDE4OlxuICAgICAgICBjYXNlIDE5OlxuICAgICAgICAgIHl5LmFkZFRleHREYXRhKCQkWyQwIC0gMV0sICQkWyQwXSwgdm9pZCAwKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyMDpcbiAgICAgICAgY2FzZSAyMTpcbiAgICAgICAgICB5eS5hZGRUZXh0RGF0YSgkJFskMCAtIDJdLCAkJFskMCAtIDFdLCAkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDIzOlxuICAgICAgICAgIHl5LmFkZFN0eWxlRGF0YSgkJFskMCAtIDFdLCAkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI0OlxuICAgICAgICBjYXNlIDI1OlxuICAgICAgICBjYXNlIDI2OlxuICAgICAgICAgIHZhciBjcyA9IHl5LmdldEN1cnJlbnRTZXRzKCk7XG4gICAgICAgICAgaWYgKCFjcykgdGhyb3cgbmV3IEVycm9yKFwidGV4dCByZXF1aXJlcyBzZXRcIik7XG4gICAgICAgICAgeXkuYWRkVGV4dERhdGEoY3MsICQkWyQwXSwgdm9pZCAwKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyNzpcbiAgICAgICAgY2FzZSAyODpcbiAgICAgICAgICB2YXIgY3MgPSB5eS5nZXRDdXJyZW50U2V0cygpO1xuICAgICAgICAgIGlmICghY3MpIHRocm93IG5ldyBFcnJvcihcInRleHQgcmVxdWlyZXMgc2V0XCIpO1xuICAgICAgICAgIHl5LmFkZFRleHREYXRhKGNzLCAkJFskMCAtIDFdLCAkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI5OlxuICAgICAgICBjYXNlIDQxOlxuICAgICAgICAgIHRoaXMuJCA9IFskJFskMF1dO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDMwOlxuICAgICAgICBjYXNlIDQyOlxuICAgICAgICAgIHRoaXMuJCA9IFsuLi4kJFskMCAtIDJdLCAkJFskMF1dO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDMxOlxuICAgICAgICAgIHRoaXMuJCA9IFskJFskMCAtIDJdLCAkJFskMF1dO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDMzOlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXS5qb2luKFwiIFwiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzNDpcbiAgICAgICAgICB0aGlzLiQgPSBbJCRbJDBdXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzNTpcbiAgICAgICAgICAkJFskMCAtIDFdLnB1c2goJCRbJDBdKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDFdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQzOlxuICAgICAgICBjYXNlIDQ0OlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9LCBcImFub255bW91c1wiKSxcbiAgICB0YWJsZTogW28oJFYwLCBbMiwgMl0sIHsgMzogMSwgNDogMiB9KSwgeyAxOiBbM10gfSwgeyA1OiBbMSwgM10sIDg6IFsxLCA0XSB9LCBvKCRWMSwgWzIsIDRdLCB7IDY6IDUgfSksIG8oJFYwLCBbMiwgM10pLCB7IDc6IFsxLCA2XSwgODogWzEsIDhdLCA5OiA3LCAxMDogOSwgMTE6IFsxLCAxMF0sIDEyOiBbMSwgMTFdLCAxNzogWzEsIDEyXSwgMTk6IFsxLCAxM10sIDIyOiBbMSwgMTRdLCAyNDogWzEsIDE1XSB9LCB7IDE6IFsyLCAxXSB9LCBvKCRWMSwgWzIsIDVdKSwgbygkVjEsIFsyLCA2XSksIG8oJFYxLCBbMiwgN10pLCBvKCRWMSwgWzIsIDhdKSwgeyAxMzogMTYsIDIwOiAkVjIsIDIxOiAkVjMgfSwgeyAxMzogMjAsIDE4OiAxOSwgMjA6ICRWMiwgMjE6ICRWMyB9LCB7IDEzOiAyMCwgMTg6IDIxLCAyMDogJFYyLCAyMTogJFYzIH0sIHsgMTY6IFsxLCAyNV0sIDIwOiBbMSwgMjNdLCAyMTogWzEsIDI0XSwgMjM6IDIyIH0sIHsgMTM6IDIwLCAxODogMjYsIDIwOiAkVjIsIDIxOiAkVjMgfSwgbygkVjEsIFsyLCA5XSwgeyAxNDogWzEsIDI3XSwgMTU6IFsxLCAyOF0gfSksIG8oJFY0LCBbMiwgNDNdKSwgbygkVjQsIFsyLCA0NF0pLCBvKCRWMSwgWzIsIDEzXSwgeyAxNDogWzEsIDI5XSwgMTU6IFsxLCAzMF0sIDI3OiAkVjUgfSksIG8oJFY0LCBbMiwgNDFdKSwgeyAxNjogWzEsIDM0XSwgMjA6IFsxLCAzMl0sIDIxOiBbMSwgMzNdLCAyNzogJFY1IH0sIG8oJFYxLCBbMiwgMjJdKSwgbygkVjEsIFsyLCAyNF0sIHsgMTQ6IFsxLCAzNV0gfSksIG8oJFYxLCBbMiwgMjVdLCB7IDE0OiBbMSwgMzZdIH0pLCBvKCRWMSwgWzIsIDI2XSksIHsgMjA6ICRWNiwgMjU6IDM3LCAyNjogMzgsIDI3OiAkVjUgfSwgbygkVjEsIFsyLCAxMF0sIHsgMTU6IFsxLCA0MF0gfSksIHsgMTY6IFsxLCA0MV0gfSwgbygkVjEsIFsyLCAxNF0sIHsgMTU6IFsxLCA0Ml0gfSksIHsgMTY6IFsxLCA0M10gfSwgeyAxMzogNDQsIDIwOiAkVjIsIDIxOiAkVjMgfSwgbygkVjEsIFsyLCAxN10sIHsgMTQ6IFsxLCA0NV0gfSksIG8oJFYxLCBbMiwgMThdLCB7IDE0OiBbMSwgNDZdIH0pLCBvKCRWMSwgWzIsIDE5XSksIG8oJFYxLCBbMiwgMjddKSwgbygkVjEsIFsyLCAyOF0pLCBvKCRWMSwgWzIsIDIzXSwgeyAyNzogWzEsIDQ3XSB9KSwgbygkVjcsIFsyLCAyOV0pLCB7IDE1OiBbMSwgNDhdIH0sIHsgMTY6IFsxLCA0OV0gfSwgbygkVjEsIFsyLCAxMV0pLCB7IDE2OiBbMSwgNTBdIH0sIG8oJFYxLCBbMiwgMTVdKSwgbygkVjQsIFsyLCA0Ml0pLCBvKCRWMSwgWzIsIDIwXSksIG8oJFYxLCBbMiwgMjFdKSwgeyAyMDogJFY2LCAyNjogNTEgfSwgeyAxNjogJFY4LCAyMDogJFY5LCAyMTogWzEsIDUzXSwgMjg6IDUyLCAyOTogNTQsIDMwOiA1NSwgMzE6ICRWYSwgMzI6ICRWYiwgMzM6ICRWYyB9LCBvKCRWMSwgWzIsIDEyXSksIG8oJFYxLCBbMiwgMTZdKSwgbygkVjcsIFsyLCAzMF0pLCBvKCRWNywgWzIsIDMxXSksIG8oJFY3LCBbMiwgMzJdKSwgbygkVjcsIFsyLCAzM10sIHsgMzA6IDYxLCAxNjogJFY4LCAyMDogJFY5LCAzMTogJFZhLCAzMjogJFZiLCAzMzogJFZjIH0pLCBvKCRWZCwgWzIsIDM0XSksIG8oJFZkLCBbMiwgMzZdKSwgbygkVmQsIFsyLCAzN10pLCBvKCRWZCwgWzIsIDM4XSksIG8oJFZkLCBbMiwgMzldKSwgbygkVmQsIFsyLCA0MF0pLCBvKCRWZCwgWzIsIDM1XSldLFxuICAgIGRlZmF1bHRBY3Rpb25zOiB7IDY6IFsyLCAxXSB9LFxuICAgIHBhcnNlRXJyb3I6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcGFyc2VFcnJvcihzdHIsIGhhc2gpIHtcbiAgICAgIGlmIChoYXNoLnJlY292ZXJhYmxlKSB7XG4gICAgICAgIHRoaXMudHJhY2Uoc3RyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBlcnJvciA9IG5ldyBFcnJvcihzdHIpO1xuICAgICAgICBlcnJvci5oYXNoID0gaGFzaDtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSwgXCJwYXJzZUVycm9yXCIpLFxuICAgIHBhcnNlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHBhcnNlKGlucHV0KSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMsIHN0YWNrID0gWzBdLCB0c3RhY2sgPSBbXSwgdnN0YWNrID0gW251bGxdLCBsc3RhY2sgPSBbXSwgdGFibGUgPSB0aGlzLnRhYmxlLCB5eXRleHQgPSBcIlwiLCB5eWxpbmVubyA9IDAsIHl5bGVuZyA9IDAsIHJlY292ZXJpbmcgPSAwLCBURVJST1IgPSAyLCBFT0YgPSAxO1xuICAgICAgdmFyIGFyZ3MgPSBsc3RhY2suc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgdmFyIGxleGVyMiA9IE9iamVjdC5jcmVhdGUodGhpcy5sZXhlcik7XG4gICAgICB2YXIgc2hhcmVkU3RhdGUgPSB7IHl5OiB7fSB9O1xuICAgICAgZm9yICh2YXIgayBpbiB0aGlzLnl5KSB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy55eSwgaykpIHtcbiAgICAgICAgICBzaGFyZWRTdGF0ZS55eVtrXSA9IHRoaXMueXlba107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxleGVyMi5zZXRJbnB1dChpbnB1dCwgc2hhcmVkU3RhdGUueXkpO1xuICAgICAgc2hhcmVkU3RhdGUueXkubGV4ZXIgPSBsZXhlcjI7XG4gICAgICBzaGFyZWRTdGF0ZS55eS5wYXJzZXIgPSB0aGlzO1xuICAgICAgaWYgKHR5cGVvZiBsZXhlcjIueXlsbG9jID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgbGV4ZXIyLnl5bGxvYyA9IHt9O1xuICAgICAgfVxuICAgICAgdmFyIHl5bG9jID0gbGV4ZXIyLnl5bGxvYztcbiAgICAgIGxzdGFjay5wdXNoKHl5bG9jKTtcbiAgICAgIHZhciByYW5nZXMgPSBsZXhlcjIub3B0aW9ucyAmJiBsZXhlcjIub3B0aW9ucy5yYW5nZXM7XG4gICAgICBpZiAodHlwZW9mIHNoYXJlZFN0YXRlLnl5LnBhcnNlRXJyb3IgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0aGlzLnBhcnNlRXJyb3IgPSBzaGFyZWRTdGF0ZS55eS5wYXJzZUVycm9yO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wYXJzZUVycm9yID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpLnBhcnNlRXJyb3I7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBwb3BTdGFjayhuKSB7XG4gICAgICAgIHN0YWNrLmxlbmd0aCA9IHN0YWNrLmxlbmd0aCAtIDIgKiBuO1xuICAgICAgICB2c3RhY2subGVuZ3RoID0gdnN0YWNrLmxlbmd0aCAtIG47XG4gICAgICAgIGxzdGFjay5sZW5ndGggPSBsc3RhY2subGVuZ3RoIC0gbjtcbiAgICAgIH1cbiAgICAgIF9fbmFtZShwb3BTdGFjaywgXCJwb3BTdGFja1wiKTtcbiAgICAgIGZ1bmN0aW9uIGxleCgpIHtcbiAgICAgICAgdmFyIHRva2VuO1xuICAgICAgICB0b2tlbiA9IHRzdGFjay5wb3AoKSB8fCBsZXhlcjIubGV4KCkgfHwgRU9GO1xuICAgICAgICBpZiAodHlwZW9mIHRva2VuICE9PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgaWYgKHRva2VuIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIHRzdGFjayA9IHRva2VuO1xuICAgICAgICAgICAgdG9rZW4gPSB0c3RhY2sucG9wKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRva2VuID0gc2VsZi5zeW1ib2xzX1t0b2tlbl0gfHwgdG9rZW47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgICAgfVxuICAgICAgX19uYW1lKGxleCwgXCJsZXhcIik7XG4gICAgICB2YXIgc3ltYm9sLCBwcmVFcnJvclN5bWJvbCwgc3RhdGUsIGFjdGlvbiwgYSwgciwgeXl2YWwgPSB7fSwgcCwgbGVuLCBuZXdTdGF0ZSwgZXhwZWN0ZWQ7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBzdGF0ZSA9IHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAodGhpcy5kZWZhdWx0QWN0aW9uc1tzdGF0ZV0pIHtcbiAgICAgICAgICBhY3Rpb24gPSB0aGlzLmRlZmF1bHRBY3Rpb25zW3N0YXRlXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoc3ltYm9sID09PSBudWxsIHx8IHR5cGVvZiBzeW1ib2wgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgc3ltYm9sID0gbGV4KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGFjdGlvbiA9IHRhYmxlW3N0YXRlXSAmJiB0YWJsZVtzdGF0ZV1bc3ltYm9sXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGFjdGlvbiA9PT0gXCJ1bmRlZmluZWRcIiB8fCAhYWN0aW9uLmxlbmd0aCB8fCAhYWN0aW9uWzBdKSB7XG4gICAgICAgICAgdmFyIGVyclN0ciA9IFwiXCI7XG4gICAgICAgICAgZXhwZWN0ZWQgPSBbXTtcbiAgICAgICAgICBmb3IgKHAgaW4gdGFibGVbc3RhdGVdKSB7XG4gICAgICAgICAgICBpZiAodGhpcy50ZXJtaW5hbHNfW3BdICYmIHAgPiBURVJST1IpIHtcbiAgICAgICAgICAgICAgZXhwZWN0ZWQucHVzaChcIidcIiArIHRoaXMudGVybWluYWxzX1twXSArIFwiJ1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGxleGVyMi5zaG93UG9zaXRpb24pIHtcbiAgICAgICAgICAgIGVyclN0ciA9IFwiUGFyc2UgZXJyb3Igb24gbGluZSBcIiArICh5eWxpbmVubyArIDEpICsgXCI6XFxuXCIgKyBsZXhlcjIuc2hvd1Bvc2l0aW9uKCkgKyBcIlxcbkV4cGVjdGluZyBcIiArIGV4cGVjdGVkLmpvaW4oXCIsIFwiKSArIFwiLCBnb3QgJ1wiICsgKHRoaXMudGVybWluYWxzX1tzeW1ib2xdIHx8IHN5bWJvbCkgKyBcIidcIjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXJyU3RyID0gXCJQYXJzZSBlcnJvciBvbiBsaW5lIFwiICsgKHl5bGluZW5vICsgMSkgKyBcIjogVW5leHBlY3RlZCBcIiArIChzeW1ib2wgPT0gRU9GID8gXCJlbmQgb2YgaW5wdXRcIiA6IFwiJ1wiICsgKHRoaXMudGVybWluYWxzX1tzeW1ib2xdIHx8IHN5bWJvbCkgKyBcIidcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMucGFyc2VFcnJvcihlcnJTdHIsIHtcbiAgICAgICAgICAgIHRleHQ6IGxleGVyMi5tYXRjaCxcbiAgICAgICAgICAgIHRva2VuOiB0aGlzLnRlcm1pbmFsc19bc3ltYm9sXSB8fCBzeW1ib2wsXG4gICAgICAgICAgICBsaW5lOiBsZXhlcjIueXlsaW5lbm8sXG4gICAgICAgICAgICBsb2M6IHl5bG9jLFxuICAgICAgICAgICAgZXhwZWN0ZWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYWN0aW9uWzBdIGluc3RhbmNlb2YgQXJyYXkgJiYgYWN0aW9uLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJzZSBFcnJvcjogbXVsdGlwbGUgYWN0aW9ucyBwb3NzaWJsZSBhdCBzdGF0ZTogXCIgKyBzdGF0ZSArIFwiLCB0b2tlbjogXCIgKyBzeW1ib2wpO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAoYWN0aW9uWzBdKSB7XG4gICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgc3RhY2sucHVzaChzeW1ib2wpO1xuICAgICAgICAgICAgdnN0YWNrLnB1c2gobGV4ZXIyLnl5dGV4dCk7XG4gICAgICAgICAgICBsc3RhY2sucHVzaChsZXhlcjIueXlsbG9jKTtcbiAgICAgICAgICAgIHN0YWNrLnB1c2goYWN0aW9uWzFdKTtcbiAgICAgICAgICAgIHN5bWJvbCA9IG51bGw7XG4gICAgICAgICAgICBpZiAoIXByZUVycm9yU3ltYm9sKSB7XG4gICAgICAgICAgICAgIHl5bGVuZyA9IGxleGVyMi55eWxlbmc7XG4gICAgICAgICAgICAgIHl5dGV4dCA9IGxleGVyMi55eXRleHQ7XG4gICAgICAgICAgICAgIHl5bGluZW5vID0gbGV4ZXIyLnl5bGluZW5vO1xuICAgICAgICAgICAgICB5eWxvYyA9IGxleGVyMi55eWxsb2M7XG4gICAgICAgICAgICAgIGlmIChyZWNvdmVyaW5nID4gMCkge1xuICAgICAgICAgICAgICAgIHJlY292ZXJpbmctLTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc3ltYm9sID0gcHJlRXJyb3JTeW1ib2w7XG4gICAgICAgICAgICAgIHByZUVycm9yU3ltYm9sID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIGxlbiA9IHRoaXMucHJvZHVjdGlvbnNfW2FjdGlvblsxXV1bMV07XG4gICAgICAgICAgICB5eXZhbC4kID0gdnN0YWNrW3ZzdGFjay5sZW5ndGggLSBsZW5dO1xuICAgICAgICAgICAgeXl2YWwuXyQgPSB7XG4gICAgICAgICAgICAgIGZpcnN0X2xpbmU6IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gKGxlbiB8fCAxKV0uZmlyc3RfbGluZSxcbiAgICAgICAgICAgICAgbGFzdF9saW5lOiBsc3RhY2tbbHN0YWNrLmxlbmd0aCAtIDFdLmxhc3RfbGluZSxcbiAgICAgICAgICAgICAgZmlyc3RfY29sdW1uOiBsc3RhY2tbbHN0YWNrLmxlbmd0aCAtIChsZW4gfHwgMSldLmZpcnN0X2NvbHVtbixcbiAgICAgICAgICAgICAgbGFzdF9jb2x1bW46IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gMV0ubGFzdF9jb2x1bW5cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAocmFuZ2VzKSB7XG4gICAgICAgICAgICAgIHl5dmFsLl8kLnJhbmdlID0gW1xuICAgICAgICAgICAgICAgIGxzdGFja1tsc3RhY2subGVuZ3RoIC0gKGxlbiB8fCAxKV0ucmFuZ2VbMF0sXG4gICAgICAgICAgICAgICAgbHN0YWNrW2xzdGFjay5sZW5ndGggLSAxXS5yYW5nZVsxXVxuICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgciA9IHRoaXMucGVyZm9ybUFjdGlvbi5hcHBseSh5eXZhbCwgW1xuICAgICAgICAgICAgICB5eXRleHQsXG4gICAgICAgICAgICAgIHl5bGVuZyxcbiAgICAgICAgICAgICAgeXlsaW5lbm8sXG4gICAgICAgICAgICAgIHNoYXJlZFN0YXRlLnl5LFxuICAgICAgICAgICAgICBhY3Rpb25bMV0sXG4gICAgICAgICAgICAgIHZzdGFjayxcbiAgICAgICAgICAgICAgbHN0YWNrXG4gICAgICAgICAgICBdLmNvbmNhdChhcmdzKSk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobGVuKSB7XG4gICAgICAgICAgICAgIHN0YWNrID0gc3RhY2suc2xpY2UoMCwgLTEgKiBsZW4gKiAyKTtcbiAgICAgICAgICAgICAgdnN0YWNrID0gdnN0YWNrLnNsaWNlKDAsIC0xICogbGVuKTtcbiAgICAgICAgICAgICAgbHN0YWNrID0gbHN0YWNrLnNsaWNlKDAsIC0xICogbGVuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0YWNrLnB1c2godGhpcy5wcm9kdWN0aW9uc19bYWN0aW9uWzFdXVswXSk7XG4gICAgICAgICAgICB2c3RhY2sucHVzaCh5eXZhbC4kKTtcbiAgICAgICAgICAgIGxzdGFjay5wdXNoKHl5dmFsLl8kKTtcbiAgICAgICAgICAgIG5ld1N0YXRlID0gdGFibGVbc3RhY2tbc3RhY2subGVuZ3RoIC0gMl1dW3N0YWNrW3N0YWNrLmxlbmd0aCAtIDFdXTtcbiAgICAgICAgICAgIHN0YWNrLnB1c2gobmV3U3RhdGUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sIFwicGFyc2VcIilcbiAgfTtcbiAgdmFyIGxleGVyID0gLyogQF9fUFVSRV9fICovIChmdW5jdGlvbigpIHtcbiAgICB2YXIgbGV4ZXIyID0ge1xuICAgICAgRU9GOiAxLFxuICAgICAgcGFyc2VFcnJvcjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBwYXJzZUVycm9yKHN0ciwgaGFzaCkge1xuICAgICAgICBpZiAodGhpcy55eS5wYXJzZXIpIHtcbiAgICAgICAgICB0aGlzLnl5LnBhcnNlci5wYXJzZUVycm9yKHN0ciwgaGFzaCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHN0cik7XG4gICAgICAgIH1cbiAgICAgIH0sIFwicGFyc2VFcnJvclwiKSxcbiAgICAgIC8vIHJlc2V0cyB0aGUgbGV4ZXIsIHNldHMgbmV3IGlucHV0XG4gICAgICBzZXRJbnB1dDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihpbnB1dCwgeXkpIHtcbiAgICAgICAgdGhpcy55eSA9IHl5IHx8IHRoaXMueXkgfHwge307XG4gICAgICAgIHRoaXMuX2lucHV0ID0gaW5wdXQ7XG4gICAgICAgIHRoaXMuX21vcmUgPSB0aGlzLl9iYWNrdHJhY2sgPSB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy55eWxpbmVubyA9IHRoaXMueXlsZW5nID0gMDtcbiAgICAgICAgdGhpcy55eXRleHQgPSB0aGlzLm1hdGNoZWQgPSB0aGlzLm1hdGNoID0gXCJcIjtcbiAgICAgICAgdGhpcy5jb25kaXRpb25TdGFjayA9IFtcIklOSVRJQUxcIl07XG4gICAgICAgIHRoaXMueXlsbG9jID0ge1xuICAgICAgICAgIGZpcnN0X2xpbmU6IDEsXG4gICAgICAgICAgZmlyc3RfY29sdW1uOiAwLFxuICAgICAgICAgIGxhc3RfbGluZTogMSxcbiAgICAgICAgICBsYXN0X2NvbHVtbjogMFxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJhbmdlcykge1xuICAgICAgICAgIHRoaXMueXlsbG9jLnJhbmdlID0gWzAsIDBdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub2Zmc2V0ID0gMDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LCBcInNldElucHV0XCIpLFxuICAgICAgLy8gY29uc3VtZXMgYW5kIHJldHVybnMgb25lIGNoYXIgZnJvbSB0aGUgaW5wdXRcbiAgICAgIGlucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2ggPSB0aGlzLl9pbnB1dFswXTtcbiAgICAgICAgdGhpcy55eXRleHQgKz0gY2g7XG4gICAgICAgIHRoaXMueXlsZW5nKys7XG4gICAgICAgIHRoaXMub2Zmc2V0Kys7XG4gICAgICAgIHRoaXMubWF0Y2ggKz0gY2g7XG4gICAgICAgIHRoaXMubWF0Y2hlZCArPSBjaDtcbiAgICAgICAgdmFyIGxpbmVzID0gY2gubWF0Y2goLyg/Olxcclxcbj98XFxuKS4qL2cpO1xuICAgICAgICBpZiAobGluZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGluZW5vKys7XG4gICAgICAgICAgdGhpcy55eWxsb2MubGFzdF9saW5lKys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MubGFzdF9jb2x1bW4rKztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJhbmdlcykge1xuICAgICAgICAgIHRoaXMueXlsbG9jLnJhbmdlWzFdKys7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faW5wdXQgPSB0aGlzLl9pbnB1dC5zbGljZSgxKTtcbiAgICAgICAgcmV0dXJuIGNoO1xuICAgICAgfSwgXCJpbnB1dFwiKSxcbiAgICAgIC8vIHVuc2hpZnRzIG9uZSBjaGFyIChvciBhIHN0cmluZykgaW50byB0aGUgaW5wdXRcbiAgICAgIHVucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGNoKSB7XG4gICAgICAgIHZhciBsZW4gPSBjaC5sZW5ndGg7XG4gICAgICAgIHZhciBsaW5lcyA9IGNoLnNwbGl0KC8oPzpcXHJcXG4/fFxcbikvZyk7XG4gICAgICAgIHRoaXMuX2lucHV0ID0gY2ggKyB0aGlzLl9pbnB1dDtcbiAgICAgICAgdGhpcy55eXRleHQgPSB0aGlzLnl5dGV4dC5zdWJzdHIoMCwgdGhpcy55eXRleHQubGVuZ3RoIC0gbGVuKTtcbiAgICAgICAgdGhpcy5vZmZzZXQgLT0gbGVuO1xuICAgICAgICB2YXIgb2xkTGluZXMgPSB0aGlzLm1hdGNoLnNwbGl0KC8oPzpcXHJcXG4/fFxcbikvZyk7XG4gICAgICAgIHRoaXMubWF0Y2ggPSB0aGlzLm1hdGNoLnN1YnN0cigwLCB0aGlzLm1hdGNoLmxlbmd0aCAtIDEpO1xuICAgICAgICB0aGlzLm1hdGNoZWQgPSB0aGlzLm1hdGNoZWQuc3Vic3RyKDAsIHRoaXMubWF0Y2hlZC5sZW5ndGggLSAxKTtcbiAgICAgICAgaWYgKGxpbmVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICB0aGlzLnl5bGluZW5vIC09IGxpbmVzLmxlbmd0aCAtIDE7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHIgPSB0aGlzLnl5bGxvYy5yYW5nZTtcbiAgICAgICAgdGhpcy55eWxsb2MgPSB7XG4gICAgICAgICAgZmlyc3RfbGluZTogdGhpcy55eWxsb2MuZmlyc3RfbGluZSxcbiAgICAgICAgICBsYXN0X2xpbmU6IHRoaXMueXlsaW5lbm8gKyAxLFxuICAgICAgICAgIGZpcnN0X2NvbHVtbjogdGhpcy55eWxsb2MuZmlyc3RfY29sdW1uLFxuICAgICAgICAgIGxhc3RfY29sdW1uOiBsaW5lcyA/IChsaW5lcy5sZW5ndGggPT09IG9sZExpbmVzLmxlbmd0aCA/IHRoaXMueXlsbG9jLmZpcnN0X2NvbHVtbiA6IDApICsgb2xkTGluZXNbb2xkTGluZXMubGVuZ3RoIC0gbGluZXMubGVuZ3RoXS5sZW5ndGggLSBsaW5lc1swXS5sZW5ndGggOiB0aGlzLnl5bGxvYy5maXJzdF9jb2x1bW4gLSBsZW5cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5yYW5nZSA9IFtyWzBdLCByWzBdICsgdGhpcy55eWxlbmcgLSBsZW5dO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMueXlsZW5nID0gdGhpcy55eXRleHQubGVuZ3RoO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sIFwidW5wdXRcIiksXG4gICAgICAvLyBXaGVuIGNhbGxlZCBmcm9tIGFjdGlvbiwgY2FjaGVzIG1hdGNoZWQgdGV4dCBhbmQgYXBwZW5kcyBpdCBvbiBuZXh0IGFjdGlvblxuICAgICAgbW9yZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fbW9yZSA9IHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgXCJtb3JlXCIpLFxuICAgICAgLy8gV2hlbiBjYWxsZWQgZnJvbSBhY3Rpb24sIHNpZ25hbHMgdGhlIGxleGVyIHRoYXQgdGhpcyBydWxlIGZhaWxzIHRvIG1hdGNoIHRoZSBpbnB1dCwgc28gdGhlIG5leHQgbWF0Y2hpbmcgcnVsZSAocmVnZXgpIHNob3VsZCBiZSB0ZXN0ZWQgaW5zdGVhZC5cbiAgICAgIHJlamVjdDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5iYWNrdHJhY2tfbGV4ZXIpIHtcbiAgICAgICAgICB0aGlzLl9iYWNrdHJhY2sgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRXJyb3IoXCJMZXhpY2FsIGVycm9yIG9uIGxpbmUgXCIgKyAodGhpcy55eWxpbmVubyArIDEpICsgXCIuIFlvdSBjYW4gb25seSBpbnZva2UgcmVqZWN0KCkgaW4gdGhlIGxleGVyIHdoZW4gdGhlIGxleGVyIGlzIG9mIHRoZSBiYWNrdHJhY2tpbmcgcGVyc3Vhc2lvbiAob3B0aW9ucy5iYWNrdHJhY2tfbGV4ZXIgPSB0cnVlKS5cXG5cIiArIHRoaXMuc2hvd1Bvc2l0aW9uKCksIHtcbiAgICAgICAgICAgIHRleHQ6IFwiXCIsXG4gICAgICAgICAgICB0b2tlbjogbnVsbCxcbiAgICAgICAgICAgIGxpbmU6IHRoaXMueXlsaW5lbm9cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sIFwicmVqZWN0XCIpLFxuICAgICAgLy8gcmV0YWluIGZpcnN0IG4gY2hhcmFjdGVycyBvZiB0aGUgbWF0Y2hcbiAgICAgIGxlc3M6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24obikge1xuICAgICAgICB0aGlzLnVucHV0KHRoaXMubWF0Y2guc2xpY2UobikpO1xuICAgICAgfSwgXCJsZXNzXCIpLFxuICAgICAgLy8gZGlzcGxheXMgYWxyZWFkeSBtYXRjaGVkIGlucHV0LCBpLmUuIGZvciBlcnJvciBtZXNzYWdlc1xuICAgICAgcGFzdElucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcGFzdCA9IHRoaXMubWF0Y2hlZC5zdWJzdHIoMCwgdGhpcy5tYXRjaGVkLmxlbmd0aCAtIHRoaXMubWF0Y2gubGVuZ3RoKTtcbiAgICAgICAgcmV0dXJuIChwYXN0Lmxlbmd0aCA+IDIwID8gXCIuLi5cIiA6IFwiXCIpICsgcGFzdC5zdWJzdHIoLTIwKS5yZXBsYWNlKC9cXG4vZywgXCJcIik7XG4gICAgICB9LCBcInBhc3RJbnB1dFwiKSxcbiAgICAgIC8vIGRpc3BsYXlzIHVwY29taW5nIGlucHV0LCBpLmUuIGZvciBlcnJvciBtZXNzYWdlc1xuICAgICAgdXBjb21pbmdJbnB1dDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG5leHQgPSB0aGlzLm1hdGNoO1xuICAgICAgICBpZiAobmV4dC5sZW5ndGggPCAyMCkge1xuICAgICAgICAgIG5leHQgKz0gdGhpcy5faW5wdXQuc3Vic3RyKDAsIDIwIC0gbmV4dC5sZW5ndGgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAobmV4dC5zdWJzdHIoMCwgMjApICsgKG5leHQubGVuZ3RoID4gMjAgPyBcIi4uLlwiIDogXCJcIikpLnJlcGxhY2UoL1xcbi9nLCBcIlwiKTtcbiAgICAgIH0sIFwidXBjb21pbmdJbnB1dFwiKSxcbiAgICAgIC8vIGRpc3BsYXlzIHRoZSBjaGFyYWN0ZXIgcG9zaXRpb24gd2hlcmUgdGhlIGxleGluZyBlcnJvciBvY2N1cnJlZCwgaS5lLiBmb3IgZXJyb3IgbWVzc2FnZXNcbiAgICAgIHNob3dQb3NpdGlvbjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHByZSA9IHRoaXMucGFzdElucHV0KCk7XG4gICAgICAgIHZhciBjID0gbmV3IEFycmF5KHByZS5sZW5ndGggKyAxKS5qb2luKFwiLVwiKTtcbiAgICAgICAgcmV0dXJuIHByZSArIHRoaXMudXBjb21pbmdJbnB1dCgpICsgXCJcXG5cIiArIGMgKyBcIl5cIjtcbiAgICAgIH0sIFwic2hvd1Bvc2l0aW9uXCIpLFxuICAgICAgLy8gdGVzdCB0aGUgbGV4ZWQgdG9rZW46IHJldHVybiBGQUxTRSB3aGVuIG5vdCBhIG1hdGNoLCBvdGhlcndpc2UgcmV0dXJuIHRva2VuXG4gICAgICB0ZXN0X21hdGNoOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKG1hdGNoLCBpbmRleGVkX3J1bGUpIHtcbiAgICAgICAgdmFyIHRva2VuLCBsaW5lcywgYmFja3VwO1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmJhY2t0cmFja19sZXhlcikge1xuICAgICAgICAgIGJhY2t1cCA9IHtcbiAgICAgICAgICAgIHl5bGluZW5vOiB0aGlzLnl5bGluZW5vLFxuICAgICAgICAgICAgeXlsbG9jOiB7XG4gICAgICAgICAgICAgIGZpcnN0X2xpbmU6IHRoaXMueXlsbG9jLmZpcnN0X2xpbmUsXG4gICAgICAgICAgICAgIGxhc3RfbGluZTogdGhpcy5sYXN0X2xpbmUsXG4gICAgICAgICAgICAgIGZpcnN0X2NvbHVtbjogdGhpcy55eWxsb2MuZmlyc3RfY29sdW1uLFxuICAgICAgICAgICAgICBsYXN0X2NvbHVtbjogdGhpcy55eWxsb2MubGFzdF9jb2x1bW5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB5eXRleHQ6IHRoaXMueXl0ZXh0LFxuICAgICAgICAgICAgbWF0Y2g6IHRoaXMubWF0Y2gsXG4gICAgICAgICAgICBtYXRjaGVzOiB0aGlzLm1hdGNoZXMsXG4gICAgICAgICAgICBtYXRjaGVkOiB0aGlzLm1hdGNoZWQsXG4gICAgICAgICAgICB5eWxlbmc6IHRoaXMueXlsZW5nLFxuICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgIF9tb3JlOiB0aGlzLl9tb3JlLFxuICAgICAgICAgICAgX2lucHV0OiB0aGlzLl9pbnB1dCxcbiAgICAgICAgICAgIHl5OiB0aGlzLnl5LFxuICAgICAgICAgICAgY29uZGl0aW9uU3RhY2s6IHRoaXMuY29uZGl0aW9uU3RhY2suc2xpY2UoMCksXG4gICAgICAgICAgICBkb25lOiB0aGlzLmRvbmVcbiAgICAgICAgICB9O1xuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgICBiYWNrdXAueXlsbG9jLnJhbmdlID0gdGhpcy55eWxsb2MucmFuZ2Uuc2xpY2UoMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxpbmVzID0gbWF0Y2hbMF0ubWF0Y2goLyg/Olxcclxcbj98XFxuKS4qL2cpO1xuICAgICAgICBpZiAobGluZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGluZW5vICs9IGxpbmVzLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnl5bGxvYyA9IHtcbiAgICAgICAgICBmaXJzdF9saW5lOiB0aGlzLnl5bGxvYy5sYXN0X2xpbmUsXG4gICAgICAgICAgbGFzdF9saW5lOiB0aGlzLnl5bGluZW5vICsgMSxcbiAgICAgICAgICBmaXJzdF9jb2x1bW46IHRoaXMueXlsbG9jLmxhc3RfY29sdW1uLFxuICAgICAgICAgIGxhc3RfY29sdW1uOiBsaW5lcyA/IGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdLmxlbmd0aCAtIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdLm1hdGNoKC9cXHI/XFxuPy8pWzBdLmxlbmd0aCA6IHRoaXMueXlsbG9jLmxhc3RfY29sdW1uICsgbWF0Y2hbMF0ubGVuZ3RoXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMueXl0ZXh0ICs9IG1hdGNoWzBdO1xuICAgICAgICB0aGlzLm1hdGNoICs9IG1hdGNoWzBdO1xuICAgICAgICB0aGlzLm1hdGNoZXMgPSBtYXRjaDtcbiAgICAgICAgdGhpcy55eWxlbmcgPSB0aGlzLnl5dGV4dC5sZW5ndGg7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MucmFuZ2UgPSBbdGhpcy5vZmZzZXQsIHRoaXMub2Zmc2V0ICs9IHRoaXMueXlsZW5nXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9tb3JlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2JhY2t0cmFjayA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9pbnB1dCA9IHRoaXMuX2lucHV0LnNsaWNlKG1hdGNoWzBdLmxlbmd0aCk7XG4gICAgICAgIHRoaXMubWF0Y2hlZCArPSBtYXRjaFswXTtcbiAgICAgICAgdG9rZW4gPSB0aGlzLnBlcmZvcm1BY3Rpb24uY2FsbCh0aGlzLCB0aGlzLnl5LCB0aGlzLCBpbmRleGVkX3J1bGUsIHRoaXMuY29uZGl0aW9uU3RhY2tbdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxXSk7XG4gICAgICAgIGlmICh0aGlzLmRvbmUgJiYgdGhpcy5faW5wdXQpIHtcbiAgICAgICAgICB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodG9rZW4pIHtcbiAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYmFja3RyYWNrKSB7XG4gICAgICAgICAgZm9yICh2YXIgayBpbiBiYWNrdXApIHtcbiAgICAgICAgICAgIHRoaXNba10gPSBiYWNrdXBba107XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LCBcInRlc3RfbWF0Y2hcIiksXG4gICAgICAvLyByZXR1cm4gbmV4dCBtYXRjaCBpbiBpbnB1dFxuICAgICAgbmV4dDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLkVPRjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX2lucHV0KSB7XG4gICAgICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdG9rZW4sIG1hdGNoLCB0ZW1wTWF0Y2gsIGluZGV4O1xuICAgICAgICBpZiAoIXRoaXMuX21vcmUpIHtcbiAgICAgICAgICB0aGlzLnl5dGV4dCA9IFwiXCI7XG4gICAgICAgICAgdGhpcy5tYXRjaCA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJ1bGVzID0gdGhpcy5fY3VycmVudFJ1bGVzKCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcnVsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB0ZW1wTWF0Y2ggPSB0aGlzLl9pbnB1dC5tYXRjaCh0aGlzLnJ1bGVzW3J1bGVzW2ldXSk7XG4gICAgICAgICAgaWYgKHRlbXBNYXRjaCAmJiAoIW1hdGNoIHx8IHRlbXBNYXRjaFswXS5sZW5ndGggPiBtYXRjaFswXS5sZW5ndGgpKSB7XG4gICAgICAgICAgICBtYXRjaCA9IHRlbXBNYXRjaDtcbiAgICAgICAgICAgIGluZGV4ID0gaTtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYmFja3RyYWNrX2xleGVyKSB7XG4gICAgICAgICAgICAgIHRva2VuID0gdGhpcy50ZXN0X21hdGNoKHRlbXBNYXRjaCwgcnVsZXNbaV0pO1xuICAgICAgICAgICAgICBpZiAodG9rZW4gIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JhY2t0cmFjaykge1xuICAgICAgICAgICAgICAgIG1hdGNoID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLm9wdGlvbnMuZmxleCkge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgdG9rZW4gPSB0aGlzLnRlc3RfbWF0Y2gobWF0Y2gsIHJ1bGVzW2luZGV4XSk7XG4gICAgICAgICAgaWYgKHRva2VuICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX2lucHV0ID09PSBcIlwiKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuRU9GO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRXJyb3IoXCJMZXhpY2FsIGVycm9yIG9uIGxpbmUgXCIgKyAodGhpcy55eWxpbmVubyArIDEpICsgXCIuIFVucmVjb2duaXplZCB0ZXh0LlxcblwiICsgdGhpcy5zaG93UG9zaXRpb24oKSwge1xuICAgICAgICAgICAgdGV4dDogXCJcIixcbiAgICAgICAgICAgIHRva2VuOiBudWxsLFxuICAgICAgICAgICAgbGluZTogdGhpcy55eWxpbmVub1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9LCBcIm5leHRcIiksXG4gICAgICAvLyByZXR1cm4gbmV4dCBtYXRjaCB0aGF0IGhhcyBhIHRva2VuXG4gICAgICBsZXg6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gbGV4KCkge1xuICAgICAgICB2YXIgciA9IHRoaXMubmV4dCgpO1xuICAgICAgICBpZiAocikge1xuICAgICAgICAgIHJldHVybiByO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLmxleCgpO1xuICAgICAgICB9XG4gICAgICB9LCBcImxleFwiKSxcbiAgICAgIC8vIGFjdGl2YXRlcyBhIG5ldyBsZXhlciBjb25kaXRpb24gc3RhdGUgKHB1c2hlcyB0aGUgbmV3IGxleGVyIGNvbmRpdGlvbiBzdGF0ZSBvbnRvIHRoZSBjb25kaXRpb24gc3RhY2spXG4gICAgICBiZWdpbjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBiZWdpbihjb25kaXRpb24pIHtcbiAgICAgICAgdGhpcy5jb25kaXRpb25TdGFjay5wdXNoKGNvbmRpdGlvbik7XG4gICAgICB9LCBcImJlZ2luXCIpLFxuICAgICAgLy8gcG9wIHRoZSBwcmV2aW91c2x5IGFjdGl2ZSBsZXhlciBjb25kaXRpb24gc3RhdGUgb2ZmIHRoZSBjb25kaXRpb24gc3RhY2tcbiAgICAgIHBvcFN0YXRlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHBvcFN0YXRlKCkge1xuICAgICAgICB2YXIgbiA9IHRoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMTtcbiAgICAgICAgaWYgKG4gPiAwKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uU3RhY2sucG9wKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uU3RhY2tbMF07XG4gICAgICAgIH1cbiAgICAgIH0sIFwicG9wU3RhdGVcIiksXG4gICAgICAvLyBwcm9kdWNlIHRoZSBsZXhlciBydWxlIHNldCB3aGljaCBpcyBhY3RpdmUgZm9yIHRoZSBjdXJyZW50bHkgYWN0aXZlIGxleGVyIGNvbmRpdGlvbiBzdGF0ZVxuICAgICAgX2N1cnJlbnRSdWxlczogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBfY3VycmVudFJ1bGVzKCkge1xuICAgICAgICBpZiAodGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggJiYgdGhpcy5jb25kaXRpb25TdGFja1t0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAtIDFdKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uc1t0aGlzLmNvbmRpdGlvblN0YWNrW3RoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMV1dLnJ1bGVzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvbnNbXCJJTklUSUFMXCJdLnJ1bGVzO1xuICAgICAgICB9XG4gICAgICB9LCBcIl9jdXJyZW50UnVsZXNcIiksXG4gICAgICAvLyByZXR1cm4gdGhlIGN1cnJlbnRseSBhY3RpdmUgbGV4ZXIgY29uZGl0aW9uIHN0YXRlOyB3aGVuIGFuIGluZGV4IGFyZ3VtZW50IGlzIHByb3ZpZGVkIGl0IHByb2R1Y2VzIHRoZSBOLXRoIHByZXZpb3VzIGNvbmRpdGlvbiBzdGF0ZSwgaWYgYXZhaWxhYmxlXG4gICAgICB0b3BTdGF0ZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiB0b3BTdGF0ZShuKSB7XG4gICAgICAgIG4gPSB0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAtIDEgLSBNYXRoLmFicyhuIHx8IDApO1xuICAgICAgICBpZiAobiA+PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uU3RhY2tbbl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFwiSU5JVElBTFwiO1xuICAgICAgICB9XG4gICAgICB9LCBcInRvcFN0YXRlXCIpLFxuICAgICAgLy8gYWxpYXMgZm9yIGJlZ2luKGNvbmRpdGlvbilcbiAgICAgIHB1c2hTdGF0ZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBwdXNoU3RhdGUoY29uZGl0aW9uKSB7XG4gICAgICAgIHRoaXMuYmVnaW4oY29uZGl0aW9uKTtcbiAgICAgIH0sIFwicHVzaFN0YXRlXCIpLFxuICAgICAgLy8gcmV0dXJuIHRoZSBudW1iZXIgb2Ygc3RhdGVzIGN1cnJlbnRseSBvbiB0aGUgc3RhY2tcbiAgICAgIHN0YXRlU3RhY2tTaXplOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHN0YXRlU3RhY2tTaXplKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGg7XG4gICAgICB9LCBcInN0YXRlU3RhY2tTaXplXCIpLFxuICAgICAgb3B0aW9uczogeyBcImNhc2UtaW5zZW5zaXRpdmVcIjogdHJ1ZSB9LFxuICAgICAgcGVyZm9ybUFjdGlvbjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBhbm9ueW1vdXMoeXksIHl5XywgJGF2b2lkaW5nX25hbWVfY29sbGlzaW9ucywgWVlfU1RBUlQpIHtcbiAgICAgICAgdmFyIFlZU1RBVEUgPSBZWV9TVEFSVDtcbiAgICAgICAgc3dpdGNoICgkYXZvaWRpbmdfbmFtZV9jb2xsaXNpb25zKSB7XG4gICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgaWYgKHl5LmdldEluZGVudE1vZGUgJiYgeXkuZ2V0SW5kZW50TW9kZSgpKSB7XG4gICAgICAgICAgICAgIHl5LmNvbnN1bWVJbmRlbnRUZXh0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgdGhpcy5iZWdpbihcIklOSVRJQUxcIik7XG4gICAgICAgICAgICAgIHJldHVybiAyMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgIGlmICh5eS5zZXRJbmRlbnRNb2RlKSB7XG4gICAgICAgICAgICAgIHl5LnNldEluZGVudE1vZGUoZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5iZWdpbihcIklOSVRJQUxcIik7XG4gICAgICAgICAgICB0aGlzLnVucHV0KHl5Xy55eXRleHQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcImJvbFwiKTtcbiAgICAgICAgICAgIHJldHVybiA4O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA3OlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA5OlxuICAgICAgICAgICAgcmV0dXJuIDc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDEwOlxuICAgICAgICAgICAgcmV0dXJuIDExO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMTpcbiAgICAgICAgICAgIHJldHVybiA1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICAgIHJldHVybiAxMjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTM6XG4gICAgICAgICAgICByZXR1cm4gMTc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE0OlxuICAgICAgICAgICAgaWYgKHl5LmNvbnN1bWVJbmRlbnRUZXh0KSB7XG4gICAgICAgICAgICAgIHl5LmNvbnN1bWVJbmRlbnRUZXh0ID0gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gMTk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE1OlxuICAgICAgICAgICAgcmV0dXJuIDI0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICAgIHl5Xy55eXRleHQgPSB5eV8ueXl0ZXh0LnNsaWNlKDIsIC0yKTtcbiAgICAgICAgICAgIHJldHVybiAxNDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTc6XG4gICAgICAgICAgICB5eV8ueXl0ZXh0ID0geXlfLnl5dGV4dC5zbGljZSgxLCAtMSkudHJpbSgpO1xuICAgICAgICAgICAgcmV0dXJuIDE0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxODpcbiAgICAgICAgICAgIHJldHVybiAxNjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTk6XG4gICAgICAgICAgICByZXR1cm4gMzE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDIwOlxuICAgICAgICAgICAgcmV0dXJuIDMzO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyMTpcbiAgICAgICAgICAgIHJldHVybiAzMjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjI6XG4gICAgICAgICAgICByZXR1cm4gMjA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDIzOlxuICAgICAgICAgICAgcmV0dXJuIDIxO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyNDpcbiAgICAgICAgICAgIHJldHVybiAyNztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjU6XG4gICAgICAgICAgICByZXR1cm4gMTU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSwgXCJhbm9ueW1vdXNcIiksXG4gICAgICBydWxlczogWy9eKD86JSUoPyFcXHspW15cXG5dKikvaSwgL14oPzpbXlxcfV0lJVteXFxuXSopL2ksIC9eKD86WyBcXHRdKyg/PVtcXG5cXHJdKSkvaSwgL14oPzpbIFxcdF0rKD89dGV4dFxcYikpL2ksIC9eKD86WyBcXHRdKykvaSwgL14oPzpbXiBcXHRcXG5cXHJdKS9pLCAvXig/OltcXG5cXHJdKykvaSwgL14oPzolJVteXFxuXSopL2ksIC9eKD86WyBcXHRdKykvaSwgL14oPzokKS9pLCAvXig/OnRpdGxlXFxzW14jXFxuO10rKS9pLCAvXig/OnZlbm4tYmV0YVxcYikvaSwgL14oPzpzZXRcXGIpL2ksIC9eKD86dW5pb25cXGIpL2ksIC9eKD86dGV4dFxcYikvaSwgL14oPzpzdHlsZVxcYikvaSwgL14oPzpcXFtcIlteXFxcIl0qXCJcXF0pL2ksIC9eKD86XFxbW15cXF1cXFwiXStcXF0pL2ksIC9eKD86WystXT8oXFxkKyhcXC5cXGQrKT98XFwuXFxkKykpL2ksIC9eKD86I1swLTlhLWZBLUZdezMsOH0pL2ksIC9eKD86cmdiYVxcKFxccypbMC05Ll0rXFxzKlssXVxccypbMC05Ll0rXFxzKlssXVxccypbMC05Ll0rXFxzKlssXVxccypbMC05Ll0rXFxzKlxcKSkvaSwgL14oPzpyZ2JcXChcXHMqWzAtOS5dK1xccypbLF1cXHMqWzAtOS5dK1xccypbLF1cXHMqWzAtOS5dK1xccypcXCkpL2ksIC9eKD86W0EtWmEtel9dW0EtWmEtejAtOVxcLV9dKikvaSwgL14oPzpcIlteXFxcIl0qXCIpL2ksIC9eKD86LCkvaSwgL14oPzo6KS9pXSxcbiAgICAgIGNvbmRpdGlvbnM6IHsgXCJib2xcIjogeyBcInJ1bGVzXCI6IFswLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5LCAxMCwgMTEsIDEyLCAxMywgMTQsIDE1LCAxNiwgMTcsIDE4LCAxOSwgMjAsIDIxLCAyMiwgMjMsIDI0LCAyNV0sIFwiaW5jbHVzaXZlXCI6IHRydWUgfSwgXCJJTklUSUFMXCI6IHsgXCJydWxlc1wiOiBbMCwgMSwgNiwgNywgOCwgOSwgMTAsIDExLCAxMiwgMTMsIDE0LCAxNSwgMTYsIDE3LCAxOCwgMTksIDIwLCAyMSwgMjIsIDIzLCAyNCwgMjVdLCBcImluY2x1c2l2ZVwiOiB0cnVlIH0gfVxuICAgIH07XG4gICAgcmV0dXJuIGxleGVyMjtcbiAgfSkoKTtcbiAgcGFyc2VyMi5sZXhlciA9IGxleGVyO1xuICBmdW5jdGlvbiBQYXJzZXIoKSB7XG4gICAgdGhpcy55eSA9IHt9O1xuICB9XG4gIF9fbmFtZShQYXJzZXIsIFwiUGFyc2VyXCIpO1xuICBQYXJzZXIucHJvdG90eXBlID0gcGFyc2VyMjtcbiAgcGFyc2VyMi5QYXJzZXIgPSBQYXJzZXI7XG4gIHJldHVybiBuZXcgUGFyc2VyKCk7XG59KSgpO1xucGFyc2VyLnBhcnNlciA9IHBhcnNlcjtcbnZhciB2ZW5uX2RlZmF1bHQgPSBwYXJzZXI7XG5cbi8vIHNyYy9kaWFncmFtcy92ZW5uL3Zlbm5EQi50c1xudmFyIHN1YnNldHMgPSBbXTtcbnZhciB0ZXh0Tm9kZXMgPSBbXTtcbnZhciBzdHlsZUVudHJpZXMgPSBbXTtcbnZhciBrbm93blNldHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpO1xudmFyIGN1cnJlbnRTZXRzO1xudmFyIGluZGVudE1vZGUgPSBmYWxzZTtcbnZhciBhZGRTdWJzZXREYXRhID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoaWRlbnRpZmllckxpc3QsIGxhYmVsLCBzaXplKSA9PiB7XG4gIGNvbnN0IHNldHMgPSBub3JtYWxpemVJZGVudGlmaWVyTGlzdChpZGVudGlmaWVyTGlzdCkuc29ydCgpO1xuICBjb25zdCByZXNvbHZlZFNpemUgPSBzaXplID8/IDEwIC8gTWF0aC5wb3coaWRlbnRpZmllckxpc3QubGVuZ3RoLCAyKTtcbiAgY3VycmVudFNldHMgPSBzZXRzO1xuICBpZiAoc2V0cy5sZW5ndGggPT09IDEpIHtcbiAgICBrbm93blNldHMuYWRkKHNldHNbMF0pO1xuICB9XG4gIHN1YnNldHMucHVzaCh7XG4gICAgc2V0cyxcbiAgICBzaXplOiByZXNvbHZlZFNpemUsXG4gICAgbGFiZWw6IGxhYmVsID8gbm9ybWFsaXplVGV4dChsYWJlbCkgOiB2b2lkIDBcbiAgfSk7XG59LCBcImFkZFN1YnNldERhdGFcIik7XG52YXIgZ2V0U3Vic2V0RGF0YSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKCkgPT4ge1xuICByZXR1cm4gc3Vic2V0cztcbn0sIFwiZ2V0U3Vic2V0RGF0YVwiKTtcbnZhciBub3JtYWxpemVUZXh0ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgodGV4dCkgPT4ge1xuICBjb25zdCB0cmltbWVkID0gdGV4dC50cmltKCk7XG4gIGlmICh0cmltbWVkLmxlbmd0aCA+PSAyICYmIHRyaW1tZWQuc3RhcnRzV2l0aCgnXCInKSAmJiB0cmltbWVkLmVuZHNXaXRoKCdcIicpKSB7XG4gICAgcmV0dXJuIHRyaW1tZWQuc2xpY2UoMSwgLTEpO1xuICB9XG4gIHJldHVybiB0cmltbWVkO1xufSwgXCJub3JtYWxpemVUZXh0XCIpO1xudmFyIG5vcm1hbGl6ZVN0eWxlVmFsdWUgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCh2YWx1ZSkgPT4ge1xuICByZXR1cm4gdmFsdWUgPyBub3JtYWxpemVUZXh0KHZhbHVlKSA6IHZhbHVlO1xufSwgXCJub3JtYWxpemVTdHlsZVZhbHVlXCIpO1xudmFyIGFkZFRleHREYXRhID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoaWRlbnRpZmllckxpc3QsIGlkLCBsYWJlbCkgPT4ge1xuICBjb25zdCBub3JtYWxpemVkSWQgPSBub3JtYWxpemVUZXh0KGlkKTtcbiAgdGV4dE5vZGVzLnB1c2goe1xuICAgIHNldHM6IG5vcm1hbGl6ZUlkZW50aWZpZXJMaXN0KGlkZW50aWZpZXJMaXN0KS5zb3J0KCksXG4gICAgaWQ6IG5vcm1hbGl6ZWRJZCxcbiAgICBsYWJlbDogbGFiZWwgPyBub3JtYWxpemVUZXh0KGxhYmVsKSA6IHZvaWQgMFxuICB9KTtcbn0sIFwiYWRkVGV4dERhdGFcIik7XG52YXIgYWRkU3R5bGVEYXRhID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoaWRlbnRpZmllckxpc3QsIGRhdGEpID0+IHtcbiAgY29uc3QgdGFyZ2V0cyA9IG5vcm1hbGl6ZUlkZW50aWZpZXJMaXN0KGlkZW50aWZpZXJMaXN0KS5zb3J0KCk7XG4gIGNvbnN0IHN0eWxlcyA9IHt9O1xuICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBkYXRhKSB7XG4gICAgc3R5bGVzW2tleV0gPSBub3JtYWxpemVTdHlsZVZhbHVlKHZhbHVlKSA/PyB2YWx1ZTtcbiAgfVxuICBzdHlsZUVudHJpZXMucHVzaCh7IHRhcmdldHMsIHN0eWxlcyB9KTtcbn0sIFwiYWRkU3R5bGVEYXRhXCIpO1xudmFyIGdldFN0eWxlRGF0YSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKCkgPT4ge1xuICByZXR1cm4gc3R5bGVFbnRyaWVzO1xufSwgXCJnZXRTdHlsZURhdGFcIik7XG52YXIgbm9ybWFsaXplSWRlbnRpZmllckxpc3QgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChpZGVudGlmaWVyTGlzdCkgPT4ge1xuICByZXR1cm4gaWRlbnRpZmllckxpc3QubWFwKChpZGVudGlmaWVyKSA9PiBub3JtYWxpemVUZXh0KGlkZW50aWZpZXIpKTtcbn0sIFwibm9ybWFsaXplSWRlbnRpZmllckxpc3RcIik7XG52YXIgdmFsaWRhdGVVbmlvbklkZW50aWZpZXJzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoaWRlbnRpZmllckxpc3QpID0+IHtcbiAgY29uc3Qgbm9ybWFsaXplZCA9IG5vcm1hbGl6ZUlkZW50aWZpZXJMaXN0KGlkZW50aWZpZXJMaXN0KTtcbiAgY29uc3QgdW5rbm93biA9IG5vcm1hbGl6ZWQuZmlsdGVyKChpZGVudGlmaWVyKSA9PiAha25vd25TZXRzLmhhcyhpZGVudGlmaWVyKSk7XG4gIGlmICh1bmtub3duLmxlbmd0aCA+IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYHVua25vd24gc2V0IGlkZW50aWZpZXI6ICR7dW5rbm93bi5qb2luKFwiLCBcIil9YCk7XG4gIH1cbn0sIFwidmFsaWRhdGVVbmlvbklkZW50aWZpZXJzXCIpO1xudmFyIGdldFRleHREYXRhID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoKSA9PiB7XG4gIHJldHVybiB0ZXh0Tm9kZXM7XG59LCBcImdldFRleHREYXRhXCIpO1xudmFyIGdldEN1cnJlbnRTZXRzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoKSA9PiBjdXJyZW50U2V0cywgXCJnZXRDdXJyZW50U2V0c1wiKTtcbnZhciBnZXRJbmRlbnRNb2RlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoKSA9PiBpbmRlbnRNb2RlLCBcImdldEluZGVudE1vZGVcIik7XG52YXIgc2V0SW5kZW50TW9kZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGVuYWJsZWQpID0+IHtcbiAgaW5kZW50TW9kZSA9IGVuYWJsZWQ7XG59LCBcInNldEluZGVudE1vZGVcIik7XG52YXIgREVGQVVMVF9WRU5OX0NPTkZJRyA9IGRlZmF1bHRDb25maWdfZGVmYXVsdC52ZW5uO1xuZnVuY3Rpb24gZ2V0Q29uZmlnMigpIHtcbiAgcmV0dXJuIGNsZWFuQW5kTWVyZ2UoREVGQVVMVF9WRU5OX0NPTkZJRywgZ2V0Q29uZmlnKCkudmVubik7XG59XG5fX25hbWUoZ2V0Q29uZmlnMiwgXCJnZXRDb25maWdcIik7XG52YXIgY3VzdG9tQ2xlYXIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCgpID0+IHtcbiAgY2xlYXIoKTtcbiAgc3Vic2V0cy5sZW5ndGggPSAwO1xuICB0ZXh0Tm9kZXMubGVuZ3RoID0gMDtcbiAgc3R5bGVFbnRyaWVzLmxlbmd0aCA9IDA7XG4gIGtub3duU2V0cy5jbGVhcigpO1xuICBjdXJyZW50U2V0cyA9IHZvaWQgMDtcbiAgaW5kZW50TW9kZSA9IGZhbHNlO1xufSwgXCJjdXN0b21DbGVhclwiKTtcbnZhciBkYiA9IHtcbiAgZ2V0Q29uZmlnOiBnZXRDb25maWcyLFxuICBjbGVhcjogY3VzdG9tQ2xlYXIsXG4gIHNldEFjY1RpdGxlLFxuICBnZXRBY2NUaXRsZSxcbiAgc2V0RGlhZ3JhbVRpdGxlLFxuICBnZXREaWFncmFtVGl0bGUsXG4gIGdldEFjY0Rlc2NyaXB0aW9uLFxuICBzZXRBY2NEZXNjcmlwdGlvbixcbiAgYWRkU3Vic2V0RGF0YSxcbiAgZ2V0U3Vic2V0RGF0YSxcbiAgYWRkVGV4dERhdGEsXG4gIGFkZFN0eWxlRGF0YSxcbiAgdmFsaWRhdGVVbmlvbklkZW50aWZpZXJzLFxuICBnZXRUZXh0RGF0YSxcbiAgZ2V0U3R5bGVEYXRhLFxuICBnZXRDdXJyZW50U2V0cyxcbiAgZ2V0SW5kZW50TW9kZSxcbiAgc2V0SW5kZW50TW9kZVxufTtcblxuLy8gc3JjL2RpYWdyYW1zL3Zlbm4vc3R5bGVzLnRzXG52YXIgZ2V0U3R5bGVzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgob3B0aW9ucykgPT4gYFxuICAudmVubi10aXRsZSB7XG4gICAgZm9udC1zaXplOiAzMnB4O1xuICAgIGZpbGw6ICR7b3B0aW9ucy52ZW5uVGl0bGVUZXh0Q29sb3J9O1xuICAgIGZvbnQtZmFtaWx5OiAke29wdGlvbnMuZm9udEZhbWlseX07XG4gIH1cblxuICAudmVubi1jaXJjbGUgdGV4dCB7XG4gICAgZm9udC1zaXplOiA0OHB4O1xuICAgIGZvbnQtZmFtaWx5OiAke29wdGlvbnMuZm9udEZhbWlseX07XG4gIH1cblxuICAudmVubi1pbnRlcnNlY3Rpb24gdGV4dCB7XG4gICAgZm9udC1zaXplOiA0OHB4O1xuICAgIGZpbGw6ICR7b3B0aW9ucy52ZW5uU2V0VGV4dENvbG9yfTtcbiAgICBmb250LWZhbWlseTogJHtvcHRpb25zLmZvbnRGYW1pbHl9O1xuICB9XG5cbiAgLnZlbm4tdGV4dC1ub2RlIHtcbiAgICBmb250LWZhbWlseTogJHtvcHRpb25zLmZvbnRGYW1pbHl9O1xuICAgIGNvbG9yOiAke29wdGlvbnMudmVublNldFRleHRDb2xvcn07XG4gIH1cbmAsIFwiZ2V0U3R5bGVzXCIpO1xudmFyIHN0eWxlc19kZWZhdWx0ID0gZ2V0U3R5bGVzO1xuXG4vLyBzcmMvZGlhZ3JhbXMvdmVubi92ZW5uUmVuZGVyZXIudHNcbmltcG9ydCB7IHNlbGVjdCBhcyBkM3NlbGVjdCB9IGZyb20gXCJkM1wiO1xuaW1wb3J0IHsgaXNEYXJrLCBsaWdodGVuLCBkYXJrZW4sIHRyYW5zcGFyZW50aXplIH0gZnJvbSBcImtocm9tYVwiO1xuaW1wb3J0ICogYXMgdmVubiBmcm9tIFwiQHVwc2V0anMvdmVubi5qc1wiO1xuaW1wb3J0IHJvdWdoIGZyb20gXCJyb3VnaGpzXCI7XG5mdW5jdGlvbiBidWlsZFN0eWxlQnlLZXkoc3R5bGVEYXRhKSB7XG4gIGNvbnN0IG1hcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gIGZvciAoY29uc3QgZW50cnkgb2Ygc3R5bGVEYXRhKSB7XG4gICAgY29uc3Qga2V5ID0gZW50cnkudGFyZ2V0cy5qb2luKFwifFwiKTtcbiAgICBjb25zdCBleGlzdGluZyA9IG1hcC5nZXQoa2V5KTtcbiAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgIE9iamVjdC5hc3NpZ24oZXhpc3RpbmcsIGVudHJ5LnN0eWxlcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1hcC5zZXQoa2V5LCB7IC4uLmVudHJ5LnN0eWxlcyB9KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG1hcDtcbn1cbl9fbmFtZShidWlsZFN0eWxlQnlLZXksIFwiYnVpbGRTdHlsZUJ5S2V5XCIpO1xudmFyIGRyYXcgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChfdGV4dCwgaWQsIF92ZXJzaW9uLCBkaWFnT2JqKSA9PiB7XG4gIGNvbnN0IGRiMiA9IGRpYWdPYmouZGI7XG4gIGNvbnN0IGNvbmZpZyA9IGRiMi5nZXRDb25maWc/LigpO1xuICBjb25zdCB7IHRoZW1lVmFyaWFibGVzLCBsb29rLCBoYW5kRHJhd25TZWVkIH0gPSBnZXRDb25maWcoKTtcbiAgY29uc3QgaXNIYW5kRHJhd24gPSBsb29rID09PSBcImhhbmREcmF3blwiO1xuICBjb25zdCB0aGVtZUNvbG9ycyA9IFtcbiAgICB0aGVtZVZhcmlhYmxlcy52ZW5uMSxcbiAgICB0aGVtZVZhcmlhYmxlcy52ZW5uMixcbiAgICB0aGVtZVZhcmlhYmxlcy52ZW5uMyxcbiAgICB0aGVtZVZhcmlhYmxlcy52ZW5uNCxcbiAgICB0aGVtZVZhcmlhYmxlcy52ZW5uNSxcbiAgICB0aGVtZVZhcmlhYmxlcy52ZW5uNixcbiAgICB0aGVtZVZhcmlhYmxlcy52ZW5uNyxcbiAgICB0aGVtZVZhcmlhYmxlcy52ZW5uOFxuICBdLmZpbHRlcihCb29sZWFuKTtcbiAgY29uc3QgdGl0bGUgPSBkYjIuZ2V0RGlhZ3JhbVRpdGxlPy4oKTtcbiAgY29uc3Qgc2V0cyA9IGRiMi5nZXRTdWJzZXREYXRhKCk7XG4gIGNvbnN0IHRleHROb2RlczIgPSBkYjIuZ2V0VGV4dERhdGEoKTtcbiAgY29uc3Qgc3R5bGVCeUtleSA9IGJ1aWxkU3R5bGVCeUtleShkYjIuZ2V0U3R5bGVEYXRhKCkpO1xuICBjb25zdCBzdmdXaWR0aCA9IGNvbmZpZz8ud2lkdGggPz8gODAwO1xuICBjb25zdCBzdmdIZWlnaHQgPSBjb25maWc/LmhlaWdodCA/PyA0NTA7XG4gIGNvbnN0IFJFRkVSRU5DRV9XSURUSCA9IDE2MDA7XG4gIGNvbnN0IHNjYWxlID0gc3ZnV2lkdGggLyBSRUZFUkVOQ0VfV0lEVEg7XG4gIGNvbnN0IHRpdGxlSGVpZ2h0ID0gdGl0bGUgPyA0OCAqIHNjYWxlIDogMDtcbiAgY29uc3QgZGVmYXVsdFRleHRDb2xvciA9IHRoZW1lVmFyaWFibGVzLnByaW1hcnlUZXh0Q29sb3IgPz8gdGhlbWVWYXJpYWJsZXMudGV4dENvbG9yO1xuICBjb25zdCBzdmcgPSBzZWxlY3RTdmdFbGVtZW50KGlkKTtcbiAgc3ZnLmF0dHIoXCJ2aWV3Qm94XCIsIGAwIDAgJHtzdmdXaWR0aH0gJHtzdmdIZWlnaHR9YCk7XG4gIGlmICh0aXRsZSkge1xuICAgIHN2Zy5hcHBlbmQoXCJ0ZXh0XCIpLnRleHQodGl0bGUpLmF0dHIoXCJjbGFzc1wiLCBcInZlbm4tdGl0bGVcIikuYXR0cihcImZvbnQtc2l6ZVwiLCBgJHszMiAqIHNjYWxlfXB4YCkuYXR0cihcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpLmF0dHIoXCJkb21pbmFudC1iYXNlbGluZVwiLCBcIm1pZGRsZVwiKS5hdHRyKFwieFwiLCBcIjUwJVwiKS5hdHRyKFwieVwiLCAzMiAqIHNjYWxlKS5zdHlsZShcImZpbGxcIiwgdGhlbWVWYXJpYWJsZXMudmVublRpdGxlVGV4dENvbG9yIHx8IHRoZW1lVmFyaWFibGVzLnRpdGxlQ29sb3IpO1xuICB9XG4gIGNvbnN0IGR1bW15RDNyb290ID0gZDNzZWxlY3QoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSk7XG4gIGNvbnN0IHZlbm5EaWFncmFtID0gdmVubi5WZW5uRGlhZ3JhbSgpLndpZHRoKHN2Z1dpZHRoKS5oZWlnaHQoc3ZnSGVpZ2h0IC0gdGl0bGVIZWlnaHQpO1xuICBkdW1teUQzcm9vdC5kYXR1bShzZXRzKS5jYWxsKHZlbm5EaWFncmFtKTtcbiAgY29uc3Qgcm91Z2hTdmcgPSBpc0hhbmREcmF3biA/IHJvdWdoLnN2ZyhkdW1teUQzcm9vdC5zZWxlY3QoXCJzdmdcIikubm9kZSgpKSA6IHZvaWQgMDtcbiAgY29uc3QgbGF5b3V0QXJlYXMgPSB2ZW5uLmxheW91dChzZXRzLCB7XG4gICAgd2lkdGg6IHN2Z1dpZHRoLFxuICAgIGhlaWdodDogc3ZnSGVpZ2h0IC0gdGl0bGVIZWlnaHQsXG4gICAgcGFkZGluZzogY29uZmlnPy5wYWRkaW5nID8/IDE1XG4gIH0pO1xuICBjb25zdCBsYXlvdXRCeUtleSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gIGZvciAoY29uc3QgYXJlYSBvZiBsYXlvdXRBcmVhcykge1xuICAgIGNvbnN0IGtleSA9IHN0YWJsZVNldHNLZXkoWy4uLmFyZWEuZGF0YS5zZXRzXS5zb3J0KCkpO1xuICAgIGxheW91dEJ5S2V5LnNldChrZXksIGFyZWEpO1xuICB9XG4gIGlmICh0ZXh0Tm9kZXMyLmxlbmd0aCA+IDApIHtcbiAgICByZW5kZXJUZXh0Tm9kZXMoY29uZmlnLCBsYXlvdXRCeUtleSwgZHVtbXlEM3Jvb3QsIHRleHROb2RlczIsIHNjYWxlLCBzdHlsZUJ5S2V5KTtcbiAgfVxuICBjb25zdCB0aGVtZURhcmsgPSBpc0RhcmsodGhlbWVWYXJpYWJsZXMuYmFja2dyb3VuZCB8fCBcIiNmNGY0ZjRcIik7XG4gIGR1bW15RDNyb290LnNlbGVjdEFsbChcIi52ZW5uLWNpcmNsZVwiKS5lYWNoKGZ1bmN0aW9uKGQsIGkpIHtcbiAgICBjb25zdCBncm91cCA9IGQzc2VsZWN0KHRoaXMpO1xuICAgIGNvbnN0IGRhdGEgPSBkO1xuICAgIGNvbnN0IHNldHNLZXkgPSBzdGFibGVTZXRzS2V5KFsuLi5kYXRhLnNldHNdLnNvcnQoKSk7XG4gICAgY29uc3QgY3VzdG9tU3R5bGUgPSBzdHlsZUJ5S2V5LmdldChzZXRzS2V5KTtcbiAgICBjb25zdCBiYXNlQ29sb3IgPSBjdXN0b21TdHlsZT8uZmlsbCB8fCB0aGVtZUNvbG9yc1tpICUgdGhlbWVDb2xvcnMubGVuZ3RoXSB8fCB0aGVtZVZhcmlhYmxlcy5wcmltYXJ5Q29sb3I7XG4gICAgZ3JvdXAuY2xhc3NlZChgdmVubi1zZXQtJHtpICUgOH1gLCB0cnVlKTtcbiAgICBjb25zdCBmaWxsT3BhY2l0eSA9IGN1c3RvbVN0eWxlPy5bXCJmaWxsLW9wYWNpdHlcIl0gPz8gMC4xO1xuICAgIGNvbnN0IHN0cm9rZUNvbG9yID0gY3VzdG9tU3R5bGU/LnN0cm9rZSB8fCBiYXNlQ29sb3I7XG4gICAgY29uc3Qgc3Ryb2tlV2lkdGhWYWwgPSBjdXN0b21TdHlsZT8uW1wic3Ryb2tlLXdpZHRoXCJdIHx8IGAkezUgKiBzY2FsZX1gO1xuICAgIGlmIChpc0hhbmREcmF3biAmJiByb3VnaFN2Zykge1xuICAgICAgY29uc3QgbGF5b3V0QXJlYSA9IGxheW91dEJ5S2V5LmdldChzZXRzS2V5KTtcbiAgICAgIGlmIChsYXlvdXRBcmVhICYmIGxheW91dEFyZWEuY2lyY2xlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGMgPSBsYXlvdXRBcmVhLmNpcmNsZXNbMF07XG4gICAgICAgIGNvbnN0IHJvdWdoTm9kZSA9IHJvdWdoU3ZnLmNpcmNsZShjLngsIGMueSwgYy5yYWRpdXMgKiAyLCB7XG4gICAgICAgICAgcm91Z2huZXNzOiAwLjcsXG4gICAgICAgICAgc2VlZDogaGFuZERyYXduU2VlZCxcbiAgICAgICAgICBmaWxsOiB0cmFuc3BhcmVudGl6ZShiYXNlQ29sb3IsIDAuNyksXG4gICAgICAgICAgZmlsbFN0eWxlOiBcImhhY2h1cmVcIixcbiAgICAgICAgICBmaWxsV2VpZ2h0OiAyLFxuICAgICAgICAgIGhhY2h1cmVHYXA6IDgsXG4gICAgICAgICAgaGFjaHVyZUFuZ2xlOiAtNDEgKyBpICogNjAsXG4gICAgICAgICAgc3Ryb2tlOiBzdHJva2VDb2xvcixcbiAgICAgICAgICBzdHJva2VXaWR0aDogcGFyc2VGbG9hdChTdHJpbmcoc3Ryb2tlV2lkdGhWYWwpKVxuICAgICAgICB9KTtcbiAgICAgICAgZ3JvdXAuc2VsZWN0KFwicGF0aFwiKS5yZW1vdmUoKTtcbiAgICAgICAgZ3JvdXAubm9kZSgpPy5pbnNlcnRCZWZvcmUocm91Z2hOb2RlLCBncm91cC5zZWxlY3QoXCJ0ZXh0XCIpLm5vZGUoKSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGdyb3VwLnNlbGVjdChcInBhdGhcIikuc3R5bGUoXCJmaWxsXCIsIGJhc2VDb2xvcikuc3R5bGUoXCJmaWxsLW9wYWNpdHlcIiwgZmlsbE9wYWNpdHkpLnN0eWxlKFwic3Ryb2tlXCIsIHN0cm9rZUNvbG9yKS5zdHlsZShcInN0cm9rZS13aWR0aFwiLCBzdHJva2VXaWR0aFZhbCkuc3R5bGUoXCJzdHJva2Utb3BhY2l0eVwiLCAwLjk1KTtcbiAgICB9XG4gICAgY29uc3QgdGV4dENvbG9yID0gY3VzdG9tU3R5bGU/LmNvbG9yIHx8ICh0aGVtZURhcmsgPyBsaWdodGVuKGJhc2VDb2xvciwgMzApIDogZGFya2VuKGJhc2VDb2xvciwgMzApKTtcbiAgICBncm91cC5zZWxlY3QoXCJ0ZXh0XCIpLnN0eWxlKFwiZm9udC1zaXplXCIsIGAkezQ4ICogc2NhbGV9cHhgKS5zdHlsZShcImZpbGxcIiwgdGV4dENvbG9yKTtcbiAgfSk7XG4gIGlmIChpc0hhbmREcmF3biAmJiByb3VnaFN2Zykge1xuICAgIGR1bW15RDNyb290LnNlbGVjdEFsbChcIi52ZW5uLWludGVyc2VjdGlvblwiKS5lYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgIGNvbnN0IGdyb3VwID0gZDNzZWxlY3QodGhpcyk7XG4gICAgICBjb25zdCBkYXRhID0gZDtcbiAgICAgIGNvbnN0IHNldHNLZXkgPSBzdGFibGVTZXRzS2V5KFsuLi5kYXRhLnNldHNdLnNvcnQoKSk7XG4gICAgICBjb25zdCBjdXN0b21TdHlsZSA9IHN0eWxlQnlLZXkuZ2V0KHNldHNLZXkpO1xuICAgICAgY29uc3QgY3VzdG9tRmlsbCA9IGN1c3RvbVN0eWxlPy5maWxsO1xuICAgICAgaWYgKGN1c3RvbUZpbGwpIHtcbiAgICAgICAgY29uc3QgcGF0aEVsID0gZ3JvdXAuc2VsZWN0KFwicGF0aFwiKTtcbiAgICAgICAgY29uc3QgcGF0aEQgPSBwYXRoRWwuYXR0cihcImRcIik7XG4gICAgICAgIGlmIChwYXRoRCkge1xuICAgICAgICAgIGNvbnN0IHJvdWdoTm9kZSA9IHJvdWdoU3ZnLnBhdGgocGF0aEQsIHtcbiAgICAgICAgICAgIHJvdWdobmVzczogMC43LFxuICAgICAgICAgICAgc2VlZDogaGFuZERyYXduU2VlZCxcbiAgICAgICAgICAgIGZpbGw6IHRyYW5zcGFyZW50aXplKGN1c3RvbUZpbGwsIDAuMyksXG4gICAgICAgICAgICBmaWxsU3R5bGU6IFwiY3Jvc3MtaGF0Y2hcIixcbiAgICAgICAgICAgIGZpbGxXZWlnaHQ6IDIsXG4gICAgICAgICAgICBoYWNodXJlR2FwOiA2LFxuICAgICAgICAgICAgaGFjaHVyZUFuZ2xlOiA2MCxcbiAgICAgICAgICAgIHN0cm9rZTogXCJub25lXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjb25zdCBleGlzdGluZ1BhdGggPSBwYXRoRWwubm9kZSgpO1xuICAgICAgICAgIGV4aXN0aW5nUGF0aD8ucGFyZW50Tm9kZT8uaW5zZXJ0QmVmb3JlKHJvdWdoTm9kZSwgZXhpc3RpbmdQYXRoKTtcbiAgICAgICAgICBwYXRoRWwucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdyb3VwLnNlbGVjdChcInBhdGhcIikuc3R5bGUoXCJmaWxsLW9wYWNpdHlcIiwgMCk7XG4gICAgICB9XG4gICAgICBncm91cC5zZWxlY3QoXCJ0ZXh0XCIpLnN0eWxlKFwiZm9udC1zaXplXCIsIGAkezQ4ICogc2NhbGV9cHhgKS5zdHlsZShcImZpbGxcIiwgY3VzdG9tU3R5bGU/LmNvbG9yID8/IHRoZW1lVmFyaWFibGVzLnZlbm5TZXRUZXh0Q29sb3IgPz8gZGVmYXVsdFRleHRDb2xvcik7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgZHVtbXlEM3Jvb3Quc2VsZWN0QWxsKFwiLnZlbm4taW50ZXJzZWN0aW9uIHRleHRcIikuc3R5bGUoXCJmb250LXNpemVcIiwgYCR7NDggKiBzY2FsZX1weGApLnN0eWxlKFwiZmlsbFwiLCAoZSkgPT4ge1xuICAgICAgY29uc3QgZGF0YSA9IGU7XG4gICAgICBjb25zdCBzZXRzS2V5ID0gc3RhYmxlU2V0c0tleShbLi4uZGF0YS5zZXRzXS5zb3J0KCkpO1xuICAgICAgcmV0dXJuIHN0eWxlQnlLZXkuZ2V0KHNldHNLZXkpPy5jb2xvciA/PyB0aGVtZVZhcmlhYmxlcy52ZW5uU2V0VGV4dENvbG9yID8/IGRlZmF1bHRUZXh0Q29sb3I7XG4gICAgfSk7XG4gICAgZHVtbXlEM3Jvb3Quc2VsZWN0QWxsKFwiLnZlbm4taW50ZXJzZWN0aW9uIHBhdGhcIikuc3R5bGUoXCJmaWxsLW9wYWNpdHlcIiwgKGUpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBlO1xuICAgICAgY29uc3Qgc2V0c0tleSA9IHN0YWJsZVNldHNLZXkoWy4uLmRhdGEuc2V0c10uc29ydCgpKTtcbiAgICAgIHJldHVybiBzdHlsZUJ5S2V5LmdldChzZXRzS2V5KT8uZmlsbCA/IDEgOiAwO1xuICAgIH0pLnN0eWxlKFwiZmlsbFwiLCAoZSkgPT4ge1xuICAgICAgY29uc3QgZGF0YSA9IGU7XG4gICAgICBjb25zdCBzZXRzS2V5ID0gc3RhYmxlU2V0c0tleShbLi4uZGF0YS5zZXRzXS5zb3J0KCkpO1xuICAgICAgcmV0dXJuIHN0eWxlQnlLZXkuZ2V0KHNldHNLZXkpPy5maWxsID8/IFwidHJhbnNwYXJlbnRcIjtcbiAgICB9KTtcbiAgfVxuICBjb25zdCB2ZW5uR3JvdXAgPSBzdmcuYXBwZW5kKFwiZ1wiKS5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoMCwgJHt0aXRsZUhlaWdodH0pYCk7XG4gIGNvbnN0IGR1bW15U3ZnID0gZHVtbXlEM3Jvb3Quc2VsZWN0KFwic3ZnXCIpLm5vZGUoKTtcbiAgaWYgKGR1bW15U3ZnICYmIFwiY2hpbGROb2Rlc1wiIGluIGR1bW15U3ZnKSB7XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBbLi4uZHVtbXlTdmcuY2hpbGROb2Rlc10pIHtcbiAgICAgIHZlbm5Hcm91cC5ub2RlKCk/LmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgICB9XG4gIH1cbiAgY29uZmlndXJlU3ZnU2l6ZShzdmcsIHN2Z0hlaWdodCwgc3ZnV2lkdGgsIGNvbmZpZz8udXNlTWF4V2lkdGggPz8gdHJ1ZSk7XG59LCBcImRyYXdcIik7XG5mdW5jdGlvbiBzdGFibGVTZXRzS2V5KHNldElkcykge1xuICByZXR1cm4gc2V0SWRzLmpvaW4oXCJ8XCIpO1xufVxuX19uYW1lKHN0YWJsZVNldHNLZXksIFwic3RhYmxlU2V0c0tleVwiKTtcbmZ1bmN0aW9uIHJlbmRlclRleHROb2Rlcyhjb25maWcsIGxheW91dEJ5S2V5LCBkdW1teUQzcm9vdCwgdGV4dE5vZGVzMiwgc2NhbGUsIHN0eWxlQnlLZXkpIHtcbiAgY29uc3QgdXNlRGVidWdMYXlvdXQgPSBjb25maWc/LnVzZURlYnVnTGF5b3V0ID8/IGZhbHNlO1xuICBjb25zdCB2ZW5uU3ZnID0gZHVtbXlEM3Jvb3Quc2VsZWN0KFwic3ZnXCIpO1xuICBjb25zdCB0ZXh0R3JvdXAgPSB2ZW5uU3ZnLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwidmVubi10ZXh0LW5vZGVzXCIpO1xuICBjb25zdCBub2Rlc0J5QXJlYSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gIGZvciAoY29uc3Qgbm9kZSBvZiB0ZXh0Tm9kZXMyKSB7XG4gICAgY29uc3Qga2V5ID0gc3RhYmxlU2V0c0tleShub2RlLnNldHMpO1xuICAgIGNvbnN0IGV4aXN0aW5nID0gbm9kZXNCeUFyZWEuZ2V0KGtleSk7XG4gICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICBleGlzdGluZy5wdXNoKG5vZGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBub2Rlc0J5QXJlYS5zZXQoa2V5LCBbbm9kZV0pO1xuICAgIH1cbiAgfVxuICBmb3IgKGNvbnN0IFtrZXksIG5vZGVzXSBvZiBub2Rlc0J5QXJlYS5lbnRyaWVzKCkpIHtcbiAgICBjb25zdCBhcmVhID0gbGF5b3V0QnlLZXkuZ2V0KGtleSk7XG4gICAgaWYgKCFhcmVhPy50ZXh0KSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgY29uc3QgY2VudGVyWCA9IGFyZWEudGV4dC54O1xuICAgIGNvbnN0IGNlbnRlclkgPSBhcmVhLnRleHQueTtcbiAgICBjb25zdCBtaW5DaXJjbGVSYWRpdXMgPSBNYXRoLm1pbiguLi5hcmVhLmNpcmNsZXMubWFwKChjKSA9PiBjLnJhZGl1cykpO1xuICAgIGNvbnN0IGlubmVyUmFkaXVzUmF3ID0gTWF0aC5taW4oXG4gICAgICAuLi5hcmVhLmNpcmNsZXMubWFwKChjKSA9PiBjLnJhZGl1cyAtIE1hdGguaHlwb3QoY2VudGVyWCAtIGMueCwgY2VudGVyWSAtIGMueSkpXG4gICAgKTtcbiAgICBsZXQgaW5uZXJSYWRpdXMgPSBOdW1iZXIuaXNGaW5pdGUoaW5uZXJSYWRpdXNSYXcpID8gTWF0aC5tYXgoMCwgaW5uZXJSYWRpdXNSYXcpIDogMDtcbiAgICBpZiAoaW5uZXJSYWRpdXMgPT09IDAgJiYgTnVtYmVyLmlzRmluaXRlKG1pbkNpcmNsZVJhZGl1cykpIHtcbiAgICAgIGlubmVyUmFkaXVzID0gbWluQ2lyY2xlUmFkaXVzICogMC42O1xuICAgIH1cbiAgICBjb25zdCBhcmVhR3JvdXAgPSB0ZXh0R3JvdXAuYXBwZW5kKFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJ2ZW5uLXRleHQtYXJlYVwiKS5hdHRyKFwiZm9udC1zaXplXCIsIGAkezQwICogc2NhbGV9cHhgKTtcbiAgICBpZiAodXNlRGVidWdMYXlvdXQpIHtcbiAgICAgIGFyZWFHcm91cC5hcHBlbmQoXCJjaXJjbGVcIikuYXR0cihcImNsYXNzXCIsIFwidmVubi10ZXh0LWRlYnVnLWNpcmNsZVwiKS5hdHRyKFwiY3hcIiwgY2VudGVyWCkuYXR0cihcImN5XCIsIGNlbnRlclkpLmF0dHIoXCJyXCIsIGlubmVyUmFkaXVzKS5hdHRyKFwiZmlsbFwiLCBcIm5vbmVcIikuYXR0cihcInN0cm9rZVwiLCBcInB1cnBsZVwiKS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDEuNSAqIHNjYWxlKS5hdHRyKFwic3Ryb2tlLWRhc2hhcnJheVwiLCBgJHs2ICogc2NhbGV9ICR7NCAqIHNjYWxlfWApO1xuICAgIH1cbiAgICBjb25zdCBpbm5lcldpZHRoID0gTWF0aC5tYXgoODAgKiBzY2FsZSwgaW5uZXJSYWRpdXMgKiAyICogMC45NSk7XG4gICAgY29uc3QgaW5uZXJIZWlnaHQgPSBNYXRoLm1heCg2MCAqIHNjYWxlLCBpbm5lclJhZGl1cyAqIDIgKiAwLjk1KTtcbiAgICBjb25zdCBoYXNMYWJlbCA9IGFyZWEuZGF0YS5sYWJlbCAmJiBhcmVhLmRhdGEubGFiZWwubGVuZ3RoID4gMDtcbiAgICBjb25zdCBsYWJlbE9mZnNldEJhc2UgPSBoYXNMYWJlbCA/IE1hdGgubWluKDMyICogc2NhbGUsIGlubmVyUmFkaXVzICogMC4yNSkgOiAwO1xuICAgIGNvbnN0IGxhYmVsT2Zmc2V0ID0gbGFiZWxPZmZzZXRCYXNlICsgKG5vZGVzLmxlbmd0aCA8PSAyID8gMzAgKiBzY2FsZSA6IDApO1xuICAgIGNvbnN0IHN0YXJ0WCA9IGNlbnRlclggLSBpbm5lcldpZHRoIC8gMjtcbiAgICBjb25zdCBzdGFydFkgPSBjZW50ZXJZIC0gaW5uZXJIZWlnaHQgLyAyICsgbGFiZWxPZmZzZXQ7XG4gICAgY29uc3QgY29scyA9IE1hdGgubWF4KDEsIE1hdGguY2VpbChNYXRoLnNxcnQobm9kZXMubGVuZ3RoKSkpO1xuICAgIGNvbnN0IHJvd3MgPSBNYXRoLm1heCgxLCBNYXRoLmNlaWwobm9kZXMubGVuZ3RoIC8gY29scykpO1xuICAgIGNvbnN0IGNlbGxXaWR0aCA9IGlubmVyV2lkdGggLyBjb2xzO1xuICAgIGNvbnN0IGNlbGxIZWlnaHQgPSBpbm5lckhlaWdodCAvIHJvd3M7XG4gICAgZm9yIChjb25zdCBbaSwgbm9kZV0gb2Ygbm9kZXMuZW50cmllcygpKSB7XG4gICAgICBjb25zdCBjb2wgPSBpICUgY29scztcbiAgICAgIGNvbnN0IHJvdyA9IE1hdGguZmxvb3IoaSAvIGNvbHMpO1xuICAgICAgY29uc3QgeCA9IHN0YXJ0WCArIGNlbGxXaWR0aCAqIChjb2wgKyAwLjUpO1xuICAgICAgY29uc3QgeSA9IHN0YXJ0WSArIGNlbGxIZWlnaHQgKiAocm93ICsgMC41KTtcbiAgICAgIGlmICh1c2VEZWJ1Z0xheW91dCkge1xuICAgICAgICBhcmVhR3JvdXAuYXBwZW5kKFwicmVjdFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJ2ZW5uLXRleHQtZGVidWctY2VsbFwiKS5hdHRyKFwieFwiLCBzdGFydFggKyBjZWxsV2lkdGggKiBjb2wpLmF0dHIoXCJ5XCIsIHN0YXJ0WSArIGNlbGxIZWlnaHQgKiByb3cpLmF0dHIoXCJ3aWR0aFwiLCBjZWxsV2lkdGgpLmF0dHIoXCJoZWlnaHRcIiwgY2VsbEhlaWdodCkuYXR0cihcImZpbGxcIiwgXCJub25lXCIpLmF0dHIoXCJzdHJva2VcIiwgXCJ0ZWFsXCIpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMSAqIHNjYWxlKS5hdHRyKFwic3Ryb2tlLWRhc2hhcnJheVwiLCBgJHs0ICogc2NhbGV9ICR7MyAqIHNjYWxlfWApO1xuICAgICAgfVxuICAgICAgY29uc3QgYm94V2lkdGggPSBjZWxsV2lkdGggKiAwLjk7XG4gICAgICBjb25zdCBib3hIZWlnaHQgPSBjZWxsSGVpZ2h0ICogMC45O1xuICAgICAgY29uc3QgY29udGFpbmVyID0gYXJlYUdyb3VwLmFwcGVuZChcImZvcmVpZ25PYmplY3RcIikuYXR0cihcImNsYXNzXCIsIFwidmVubi10ZXh0LW5vZGUtZm9cIikuYXR0cihcIndpZHRoXCIsIGJveFdpZHRoKS5hdHRyKFwiaGVpZ2h0XCIsIGJveEhlaWdodCkuYXR0cihcInhcIiwgeCAtIGJveFdpZHRoIC8gMikuYXR0cihcInlcIiwgeSAtIGJveEhlaWdodCAvIDIpLmF0dHIoXCJvdmVyZmxvd1wiLCBcInZpc2libGVcIik7XG4gICAgICBjb25zdCB0ZXh0Q29sb3IgPSBzdHlsZUJ5S2V5LmdldChub2RlLmlkKT8uY29sb3I7XG4gICAgICBjb25zdCB0ZXh0ID0gY29udGFpbmVyLmFwcGVuZChcInhodG1sOnNwYW5cIikuYXR0cihcImNsYXNzXCIsIFwidmVubi10ZXh0LW5vZGVcIikuc3R5bGUoXCJkaXNwbGF5XCIsIFwiZmxleFwiKS5zdHlsZShcIndpZHRoXCIsIFwiMTAwJVwiKS5zdHlsZShcImhlaWdodFwiLCBcIjEwMCVcIikuc3R5bGUoXCJ3aGl0ZS1zcGFjZVwiLCBcIm5vcm1hbFwiKS5zdHlsZShcImFsaWduLWl0ZW1zXCIsIFwiY2VudGVyXCIpLnN0eWxlKFwianVzdGlmeS1jb250ZW50XCIsIFwiY2VudGVyXCIpLnN0eWxlKFwidGV4dC1hbGlnblwiLCBcImNlbnRlclwiKS5zdHlsZShcIm92ZXJmbG93LXdyYXBcIiwgXCJub3JtYWxcIikuc3R5bGUoXCJ3b3JkLWJyZWFrXCIsIFwibm9ybWFsXCIpLnRleHQobm9kZS5sYWJlbCA/PyBub2RlLmlkKTtcbiAgICAgIGlmICh0ZXh0Q29sb3IpIHtcbiAgICAgICAgdGV4dC5zdHlsZShcImNvbG9yXCIsIHRleHRDb2xvcik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5fX25hbWUocmVuZGVyVGV4dE5vZGVzLCBcInJlbmRlclRleHROb2Rlc1wiKTtcbnZhciByZW5kZXJlciA9IHsgZHJhdyB9O1xuXG4vLyBzcmMvZGlhZ3JhbXMvdmVubi92ZW5uRGlhZ3JhbS50c1xudmFyIGRpYWdyYW0gPSB7XG4gIHBhcnNlcjogdmVubl9kZWZhdWx0LFxuICBkYixcbiAgcmVuZGVyZXIsXG4gIHN0eWxlczogc3R5bGVzX2RlZmF1bHRcbn07XG5leHBvcnQge1xuICBkaWFncmFtXG59O1xuIgogIF0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBTSxVQUFVO0FBaUJoQixTQUFTLGdCQUFnQixDQUFDLFNBQVMsT0FBTztBQUFBLEVBRXhDLE1BQU0scUJBQXFCLHNCQUFzQixPQUFPO0FBQUEsRUFHeEQsTUFBTSxjQUFjLG1CQUFtQixPQUFPLENBQUMsTUFBTSxtQkFBbUIsR0FBRyxPQUFPLENBQUM7QUFBQSxFQUVuRixJQUFJLFVBQVU7QUFBQSxFQUNkLElBQUksY0FBYztBQUFBLEVBRWxCLE1BQU0sT0FBTyxDQUFDO0FBQUEsRUFJZCxJQUFJLFlBQVksU0FBUyxHQUFHO0FBQUEsSUFHMUIsTUFBTSxTQUFTLFVBQVUsV0FBVztBQUFBLElBQ3BDLFNBQVMsSUFBSSxFQUFHLElBQUksWUFBWSxRQUFRLEVBQUUsR0FBRztBQUFBLE1BQzNDLE1BQU0sSUFBSSxZQUFZO0FBQUEsTUFDdEIsRUFBRSxRQUFRLEtBQUssTUFBTSxFQUFFLElBQUksT0FBTyxHQUFHLEVBQUUsSUFBSSxPQUFPLENBQUM7QUFBQSxJQUNyRDtBQUFBLElBQ0EsWUFBWSxLQUFLLENBQUMsR0FBRyxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUs7QUFBQSxJQUk1QyxJQUFJLEtBQUssWUFBWSxZQUFZLFNBQVM7QUFBQSxJQUMxQyxTQUFTLElBQUksRUFBRyxJQUFJLFlBQVksUUFBUSxFQUFFLEdBQUc7QUFBQSxNQUMzQyxNQUFNLEtBQUssWUFBWTtBQUFBLE1BR3ZCLGdCQUFnQixHQUFHLElBQUksR0FBRyxNQUFNLEdBQUcsSUFBSSxHQUFHO0FBQUEsTUFHMUMsTUFBTSxXQUFXLEVBQUUsSUFBSSxHQUFHLElBQUksR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxLQUFLLEVBQUU7QUFBQSxNQUU5RCxJQUFJLE1BQU07QUFBQSxNQUVWLFNBQVMsSUFBSSxFQUFHLElBQUksR0FBRyxZQUFZLFFBQVEsRUFBRSxHQUFHO0FBQUEsUUFDOUMsSUFBSSxHQUFHLFlBQVksU0FBUyxHQUFHLFlBQVksRUFBRSxHQUFHO0FBQUEsVUFHOUMsTUFBTSxTQUFTLFFBQVEsR0FBRyxZQUFZO0FBQUEsVUFDdEMsTUFBTSxLQUFLLEtBQUssTUFBTSxHQUFHLElBQUksT0FBTyxHQUFHLEdBQUcsSUFBSSxPQUFPLENBQUM7QUFBQSxVQUN0RCxNQUFNLEtBQUssS0FBSyxNQUFNLEdBQUcsSUFBSSxPQUFPLEdBQUcsR0FBRyxJQUFJLE9BQU8sQ0FBQztBQUFBLFVBRXRELElBQUksWUFBWSxLQUFLO0FBQUEsVUFDckIsSUFBSSxZQUFZLEdBQUc7QUFBQSxZQUNqQixhQUFhLElBQUksS0FBSztBQUFBLFVBQ3hCO0FBQUEsVUFJQSxNQUFNLElBQUksS0FBSyxZQUFZO0FBQUEsVUFDM0IsSUFBSSxRQUFRLFNBQVMsVUFBVTtBQUFBLFlBQzdCLEdBQUcsT0FBTyxJQUFJLE9BQU8sU0FBUyxLQUFLLElBQUksQ0FBQztBQUFBLFlBQ3hDLEdBQUcsT0FBTyxJQUFJLE9BQU8sU0FBUyxLQUFLLElBQUksQ0FBQztBQUFBLFVBQzFDLENBQUM7QUFBQSxVQUlELElBQUksUUFBUSxPQUFPLFNBQVMsR0FBRztBQUFBLFlBQzdCLFFBQVEsT0FBTyxTQUFTO0FBQUEsVUFDMUI7QUFBQSxVQUdBLElBQUksT0FBTyxRQUFRLElBQUksUUFBUSxPQUFPO0FBQUEsWUFDcEMsTUFBTSxFQUFFLFFBQVEsT0FBTyxJQUFJLElBQUksT0FBTyxRQUFRLE9BQU8sUUFBUSxPQUFPLEtBQUs7QUFBQSxVQUMzRTtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFFQSxJQUFJLE9BQU8sTUFBTTtBQUFBLFFBQ2YsS0FBSyxLQUFLLEdBQUc7QUFBQSxRQUNiLFdBQVcsV0FBVyxJQUFJLE9BQU8sUUFBUSxJQUFJLEtBQUs7QUFBQSxRQUNsRCxLQUFLO0FBQUEsTUFDUDtBQUFBLElBQ0Y7QUFBQSxFQUNGLEVBQU87QUFBQSxJQUdMLElBQUksV0FBVyxRQUFRO0FBQUEsSUFDdkIsU0FBUyxJQUFJLEVBQUcsSUFBSSxRQUFRLFFBQVEsRUFBRSxHQUFHO0FBQUEsTUFDdkMsSUFBSSxRQUFRLEdBQUcsU0FBUyxTQUFTLFFBQVE7QUFBQSxRQUN2QyxXQUFXLFFBQVE7QUFBQSxNQUNyQjtBQUFBLElBQ0Y7QUFBQSxJQUlBLElBQUksV0FBVztBQUFBLElBQ2YsU0FBUyxJQUFJLEVBQUcsSUFBSSxRQUFRLFFBQVEsRUFBRSxHQUFHO0FBQUEsTUFDdkMsSUFBSSxTQUFTLFFBQVEsSUFBSSxRQUFRLElBQUksS0FBSyxJQUFJLFNBQVMsU0FBUyxRQUFRLEdBQUcsTUFBTSxHQUFHO0FBQUEsUUFDbEYsV0FBVztBQUFBLFFBQ1g7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBRUEsSUFBSSxVQUFVO0FBQUEsTUFDWixVQUFVLGNBQWM7QUFBQSxJQUMxQixFQUFPO0FBQUEsTUFDTCxVQUFVLFNBQVMsU0FBUyxTQUFTLFNBQVMsS0FBSztBQUFBLE1BQ25ELEtBQUssS0FBSztBQUFBLFFBQ1IsUUFBUTtBQUFBLFFBQ1IsSUFBSSxFQUFFLEdBQUcsU0FBUyxHQUFHLEdBQUcsU0FBUyxJQUFJLFNBQVMsT0FBTztBQUFBLFFBQ3JELElBQUksRUFBRSxHQUFHLFNBQVMsSUFBSSxTQUFTLEdBQUcsU0FBUyxJQUFJLFNBQVMsT0FBTztBQUFBLFFBQy9ELE9BQU8sU0FBUyxTQUFTO0FBQUEsUUFDekIsT0FBTztBQUFBLFFBQ1AsT0FBTztBQUFBLE1BQ1QsQ0FBQztBQUFBO0FBQUE7QUFBQSxFQUlMLGVBQWU7QUFBQSxFQUVmLElBQUksT0FBTztBQUFBLElBQ1QsTUFBTSxPQUFPLFVBQVU7QUFBQSxJQUN2QixNQUFNLFVBQVU7QUFBQSxJQUNoQixNQUFNLGNBQWM7QUFBQSxJQUNwQixNQUFNLE9BQU87QUFBQSxJQUNiLE1BQU0sY0FBYztBQUFBLElBQ3BCLE1BQU0scUJBQXFCO0FBQUEsRUFDN0I7QUFBQSxFQUVBLE9BQU8sVUFBVTtBQUFBO0FBU25CLFNBQVMsa0JBQWtCLENBQUMsT0FBTyxTQUFTO0FBQUEsRUFDMUMsT0FBTyxRQUFRLE1BQU0sQ0FBQyxXQUFXLFNBQVMsT0FBTyxNQUFNLElBQUksT0FBTyxTQUFTLE9BQU87QUFBQTtBQVFwRixTQUFTLHFCQUFxQixDQUFDLFNBQVM7QUFBQSxFQUV0QyxNQUFNLE1BQU0sQ0FBQztBQUFBLEVBQ2IsU0FBUyxJQUFJLEVBQUcsSUFBSSxRQUFRLFFBQVEsRUFBRSxHQUFHO0FBQUEsSUFDdkMsU0FBUyxJQUFJLElBQUksRUFBRyxJQUFJLFFBQVEsUUFBUSxFQUFFLEdBQUc7QUFBQSxNQUMzQyxNQUFNLFlBQVkseUJBQXlCLFFBQVEsSUFBSSxRQUFRLEVBQUU7QUFBQSxNQUNqRSxXQUFXLEtBQUssV0FBVztBQUFBLFFBQ3pCLEVBQUUsY0FBYyxDQUFDLEdBQUcsQ0FBQztBQUFBLFFBQ3JCLElBQUksS0FBSyxDQUFDO0FBQUEsTUFDWjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUE7QUFTVCxTQUFTLFVBQVUsQ0FBQyxHQUFHLE9BQU87QUFBQSxFQUM1QixPQUFPLElBQUksSUFBSSxLQUFLLEtBQUssSUFBSSxRQUFRLENBQUMsS0FBSyxJQUFJLFNBQVMsS0FBSyxLQUFLLFNBQVMsSUFBSSxJQUFJLE1BQU07QUFBQTtBQVMzRixTQUFTLFFBQVEsQ0FBQyxJQUFJLElBQUk7QUFBQSxFQUN4QixPQUFPLEtBQUssTUFBTSxHQUFHLElBQUksR0FBRyxNQUFNLEdBQUcsSUFBSSxHQUFHLE1BQU0sR0FBRyxJQUFJLEdBQUcsTUFBTSxHQUFHLElBQUksR0FBRyxFQUFFO0FBQUE7QUFZaEYsU0FBUyxhQUFhLENBQUMsSUFBSSxJQUFJLEdBQUc7QUFBQSxFQUVoQyxJQUFJLEtBQUssS0FBSyxJQUFJO0FBQUEsSUFDaEIsT0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUdBLElBQUksS0FBSyxLQUFLLElBQUksS0FBSyxFQUFFLEdBQUc7QUFBQSxJQUMxQixPQUFPLEtBQUssS0FBSyxLQUFLLElBQUksSUFBSSxFQUFFLElBQUksS0FBSyxJQUFJLElBQUksRUFBRTtBQUFBLEVBQ3JEO0FBQUEsRUFFQSxNQUFNLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxLQUFLLEtBQUssT0FBTyxJQUFJO0FBQUEsRUFDbkQsTUFBTSxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssS0FBSyxLQUFLLE9BQU8sSUFBSTtBQUFBLEVBQ25ELE9BQU8sV0FBVyxJQUFJLEVBQUUsSUFBSSxXQUFXLElBQUksRUFBRTtBQUFBO0FBWS9DLFNBQVMsd0JBQXdCLENBQUMsSUFBSSxJQUFJO0FBQUEsRUFDeEMsTUFBTSxJQUFJLFNBQVMsSUFBSSxFQUFFO0FBQUEsRUFDekIsTUFBTSxLQUFLLEdBQUc7QUFBQSxFQUNkLE1BQU0sS0FBSyxHQUFHO0FBQUEsRUFHZCxJQUFJLEtBQUssS0FBSyxNQUFNLEtBQUssS0FBSyxJQUFJLEtBQUssRUFBRSxHQUFHO0FBQUEsSUFDMUMsT0FBTyxDQUFDO0FBQUEsRUFDVjtBQUFBLEVBRUEsTUFBTSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssSUFBSSxNQUFNLElBQUk7QUFBQSxFQUM3QyxNQUFNLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxJQUFJLENBQUM7QUFBQSxFQUNuQyxNQUFNLEtBQUssR0FBRyxJQUFLLEtBQUssR0FBRyxJQUFJLEdBQUcsS0FBTTtBQUFBLEVBQ3hDLE1BQU0sS0FBSyxHQUFHLElBQUssS0FBSyxHQUFHLElBQUksR0FBRyxLQUFNO0FBQUEsRUFDeEMsTUFBTSxLQUFLLEVBQUUsR0FBRyxJQUFJLEdBQUcsTUFBTSxJQUFJO0FBQUEsRUFDakMsTUFBTSxLQUFLLEVBQUUsR0FBRyxJQUFJLEdBQUcsTUFBTSxJQUFJO0FBQUEsRUFFakMsT0FBTztBQUFBLElBQ0wsRUFBRSxHQUFHLEtBQUssSUFBSSxHQUFHLEtBQUssR0FBRztBQUFBLElBQ3pCLEVBQUUsR0FBRyxLQUFLLElBQUksR0FBRyxLQUFLLEdBQUc7QUFBQSxFQUMzQjtBQUFBO0FBUUYsU0FBUyxTQUFTLENBQUMsUUFBUTtBQUFBLEVBQ3pCLE1BQU0sU0FBUyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUU7QUFBQSxFQUM1QixXQUFXLFNBQVMsUUFBUTtBQUFBLElBQzFCLE9BQU8sS0FBSyxNQUFNO0FBQUEsSUFDbEIsT0FBTyxLQUFLLE1BQU07QUFBQSxFQUNwQjtBQUFBLEVBQ0EsT0FBTyxLQUFLLE9BQU87QUFBQSxFQUNuQixPQUFPLEtBQUssT0FBTztBQUFBLEVBQ25CLE9BQU87QUFBQTtBQUtULFNBQVMsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLFlBQVk7QUFBQSxFQUNqQyxhQUFhLGNBQWMsQ0FBQztBQUFBLEVBQzVCLE1BQU0sZ0JBQWdCLFdBQVcsaUJBQWlCO0FBQUEsRUFDbEQsTUFBTSxZQUFZLFdBQVcsYUFBYTtBQUFBLEVBQzFDLE1BQU0sS0FBSyxFQUFFLENBQUM7QUFBQSxFQUNkLE1BQU0sS0FBSyxFQUFFLENBQUM7QUFBQSxFQUNkLElBQUksUUFBUSxJQUFJO0FBQUEsRUFFaEIsSUFBSSxLQUFLLEtBQUssR0FBRztBQUFBLElBQ2IsTUFBTTtBQUFBLEVBQ1Y7QUFBQSxFQUVBLElBQUksT0FBTztBQUFBLElBQUcsT0FBTztBQUFBLEVBQ3JCLElBQUksT0FBTztBQUFBLElBQUcsT0FBTztBQUFBLEVBRXJCLFNBQVMsSUFBSSxFQUFHLElBQUksZUFBZSxFQUFFLEdBQUc7QUFBQSxJQUNwQyxTQUFTO0FBQUEsSUFDVCxNQUFNLE1BQU0sSUFBSTtBQUFBLElBQ2hCLE1BQU0sT0FBTyxFQUFFLEdBQUc7QUFBQSxJQUVsQixJQUFJLE9BQU8sTUFBTSxHQUFHO0FBQUEsTUFDaEIsSUFBSTtBQUFBLElBQ1I7QUFBQSxJQUVBLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxhQUFhLFNBQVMsR0FBRztBQUFBLE1BQzNDLE9BQU87QUFBQSxJQUNYO0FBQUEsRUFDSjtBQUFBLEVBQ0EsT0FBTyxJQUFJO0FBQUE7QUFLZixTQUFTLEtBQUssQ0FBQyxHQUFHO0FBQUEsRUFDZCxNQUFNLElBQUksSUFBSSxNQUFNLENBQUM7QUFBQSxFQUNyQixTQUFTLElBQUksRUFBRyxJQUFJLEdBQUcsRUFBRSxHQUFHO0FBQUEsSUFDeEIsRUFBRSxLQUFLO0FBQUEsRUFDWDtBQUFBLEVBQ0EsT0FBTztBQUFBO0FBRVgsU0FBUyxNQUFNLENBQUMsR0FBRyxHQUFHO0FBQUEsRUFDbEIsT0FBTyxNQUFNLENBQUMsRUFBRSxJQUFJLE1BQU0sTUFBTSxDQUFDLENBQUM7QUFBQTtBQUd0QyxTQUFTLEdBQUcsQ0FBQyxHQUFHLEdBQUc7QUFBQSxFQUNmLElBQUksTUFBTTtBQUFBLEVBQ1YsU0FBUyxJQUFJLEVBQUcsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHO0FBQUEsSUFDL0IsT0FBTyxFQUFFLEtBQUssRUFBRTtBQUFBLEVBQ3BCO0FBQUEsRUFDQSxPQUFPO0FBQUE7QUFHWCxTQUFTLEtBQUssQ0FBQyxHQUFHO0FBQUEsRUFDZCxPQUFPLEtBQUssS0FBSyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBQUE7QUFHOUIsU0FBUyxLQUFLLENBQUMsS0FBSyxPQUFPLEdBQUc7QUFBQSxFQUMxQixTQUFTLElBQUksRUFBRyxJQUFJLE1BQU0sUUFBUSxFQUFFLEdBQUc7QUFBQSxJQUNuQyxJQUFJLEtBQUssTUFBTSxLQUFLO0FBQUEsRUFDeEI7QUFBQTtBQUdKLFNBQVMsV0FBVyxDQUFDLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSTtBQUFBLEVBQ3RDLFNBQVMsSUFBSSxFQUFHLElBQUksSUFBSSxRQUFRLEVBQUUsR0FBRztBQUFBLElBQ2pDLElBQUksS0FBSyxLQUFLLEdBQUcsS0FBSyxLQUFLLEdBQUc7QUFBQSxFQUNsQztBQUFBO0FBSUosU0FBUyxVQUFVLENBQUMsR0FBRyxJQUFJLFlBQVk7QUFBQSxFQUNuQyxhQUFhLGNBQWMsQ0FBQztBQUFBLEVBRTVCLE1BQU0sZ0JBQWdCLFdBQVcsaUJBQWlCLEdBQUcsU0FBUztBQUFBLEVBQzlELE1BQU0sZUFBZSxXQUFXLGdCQUFnQjtBQUFBLEVBQ2hELE1BQU0sWUFBWSxXQUFXLGFBQWE7QUFBQSxFQUMxQyxNQUFNLGdCQUFnQixXQUFXLGlCQUFpQjtBQUFBLEVBQ2xELE1BQU0sZUFBZSxXQUFXLGlCQUFpQjtBQUFBLEVBQ2pELE1BQU0sTUFBTSxXQUFXLFFBQVEsWUFBWSxXQUFXLE1BQU07QUFBQSxFQUM1RCxNQUFNLE1BQU0sV0FBVyxRQUFRLFlBQVksV0FBVyxNQUFNO0FBQUEsRUFDNUQsTUFBTSxNQUFNLFdBQVcsUUFBUSxZQUFZLFdBQVcsTUFBTTtBQUFBLEVBQzVELE1BQU0sUUFBUSxXQUFXLFVBQVUsWUFBWSxXQUFXLFFBQVE7QUFBQSxFQUNsRSxJQUFJO0FBQUEsRUFHSixNQUFNLElBQUksR0FBRztBQUFBLEVBQ2IsTUFBTSxVQUFVLElBQUksTUFBTSxJQUFJLENBQUM7QUFBQSxFQUMvQixRQUFRLEtBQUs7QUFBQSxFQUNiLFFBQVEsR0FBRyxLQUFLLEVBQUUsRUFBRTtBQUFBLEVBQ3BCLFFBQVEsR0FBRyxLQUFLO0FBQUEsRUFDaEIsU0FBUyxJQUFJLEVBQUcsSUFBSSxHQUFHLEVBQUUsR0FBRztBQUFBLElBQ3hCLE1BQU0sUUFBUSxHQUFHLE1BQU07QUFBQSxJQUN2QixNQUFNLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxlQUFlO0FBQUEsSUFDaEQsUUFBUSxJQUFJLEtBQUs7QUFBQSxJQUNqQixRQUFRLElBQUksR0FBRyxLQUFLLEVBQUUsS0FBSztBQUFBLElBQzNCLFFBQVEsSUFBSSxHQUFHLEtBQUssSUFBSTtBQUFBLEVBQzVCO0FBQUEsRUFFQSxTQUFTLGFBQWEsQ0FBQyxPQUFPO0FBQUEsSUFDMUIsU0FBUyxJQUFJLEVBQUcsSUFBSSxNQUFNLFFBQVEsS0FBSztBQUFBLE1BQ25DLFFBQVEsR0FBRyxLQUFLLE1BQU07QUFBQSxJQUMxQjtBQUFBLElBQ0EsUUFBUSxHQUFHLEtBQUssTUFBTTtBQUFBO0FBQUEsRUFHMUIsTUFBTSxZQUFZLENBQUMsR0FBRyxNQUFNLEVBQUUsS0FBSyxFQUFFO0FBQUEsRUFFckMsTUFBTSxXQUFXLEdBQUcsTUFBTTtBQUFBLEVBQzFCLE1BQU0sWUFBWSxHQUFHLE1BQU07QUFBQSxFQUMzQixNQUFNLGFBQWEsR0FBRyxNQUFNO0FBQUEsRUFDNUIsTUFBTSxXQUFXLEdBQUcsTUFBTTtBQUFBLEVBRTFCLFNBQVMsWUFBWSxFQUFHLFlBQVksZUFBZSxFQUFFLFdBQVc7QUFBQSxJQUM1RCxRQUFRLEtBQUssU0FBUztBQUFBLElBRXRCLElBQUksV0FBVyxTQUFTO0FBQUEsTUFHcEIsTUFBTSxnQkFBZ0IsUUFBUSxJQUFJLENBQUMsTUFBTTtBQUFBLFFBQ3JDLE1BQU0sUUFBUSxFQUFFLE1BQU07QUFBQSxRQUN0QixNQUFNLEtBQUssRUFBRTtBQUFBLFFBQ2IsTUFBTSxLQUFLLEVBQUU7QUFBQSxRQUNiLE9BQU87QUFBQSxPQUNWO0FBQUEsTUFDRCxjQUFjLEtBQUssQ0FBQyxHQUFHLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTtBQUFBLE1BRXhDLFdBQVcsUUFBUSxLQUFLO0FBQUEsUUFDcEIsR0FBRyxRQUFRLEdBQUcsTUFBTTtBQUFBLFFBQ3BCLElBQUksUUFBUSxHQUFHO0FBQUEsUUFDZixTQUFTO0FBQUEsTUFDYixDQUFDO0FBQUEsSUFDTDtBQUFBLElBRUEsVUFBVTtBQUFBLElBQ1YsU0FBUyxJQUFJLEVBQUcsSUFBSSxHQUFHLEVBQUUsR0FBRztBQUFBLE1BQ3hCLFVBQVUsS0FBSyxJQUFJLFNBQVMsS0FBSyxJQUFJLFFBQVEsR0FBRyxLQUFLLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFBQSxJQUN2RTtBQUFBLElBRUEsSUFBSSxLQUFLLElBQUksUUFBUSxHQUFHLEtBQUssUUFBUSxHQUFHLEVBQUUsSUFBSSxpQkFBaUIsVUFBVSxjQUFjO0FBQUEsTUFDbkY7QUFBQSxJQUNKO0FBQUEsSUFHQSxTQUFTLElBQUksRUFBRyxJQUFJLEdBQUcsRUFBRSxHQUFHO0FBQUEsTUFDeEIsU0FBUyxLQUFLO0FBQUEsTUFDZCxTQUFTLElBQUksRUFBRyxJQUFJLEdBQUcsRUFBRSxHQUFHO0FBQUEsUUFDeEIsU0FBUyxNQUFNLFFBQVEsR0FBRztBQUFBLE1BQzlCO0FBQUEsTUFDQSxTQUFTLE1BQU07QUFBQSxJQUNuQjtBQUFBLElBSUEsTUFBTSxRQUFRLFFBQVE7QUFBQSxJQUN0QixZQUFZLFdBQVcsSUFBSSxLQUFLLFVBQVUsQ0FBQyxLQUFLLEtBQUs7QUFBQSxJQUNyRCxVQUFVLEtBQUssRUFBRSxTQUFTO0FBQUEsSUFHMUIsSUFBSSxVQUFVLEtBQUssUUFBUSxHQUFHLElBQUk7QUFBQSxNQUM5QixZQUFZLFVBQVUsSUFBSSxLQUFLLFVBQVUsQ0FBQyxLQUFLLEtBQUs7QUFBQSxNQUNwRCxTQUFTLEtBQUssRUFBRSxRQUFRO0FBQUEsTUFDeEIsSUFBSSxTQUFTLEtBQUssVUFBVSxJQUFJO0FBQUEsUUFDNUIsY0FBYyxRQUFRO0FBQUEsTUFDMUIsRUFBTztBQUFBLFFBQ0gsY0FBYyxTQUFTO0FBQUE7QUFBQSxJQUUvQixFQUlLLFNBQUksVUFBVSxNQUFNLFFBQVEsSUFBSSxHQUFHLElBQUk7QUFBQSxNQUN4QyxJQUFJLGVBQWU7QUFBQSxNQUVuQixJQUFJLFVBQVUsS0FBSyxNQUFNLElBQUk7QUFBQSxRQUV6QixZQUFZLFlBQVksSUFBSSxLQUFLLFVBQVUsQ0FBQyxLQUFLLEtBQUs7QUFBQSxRQUN0RCxXQUFXLEtBQUssRUFBRSxVQUFVO0FBQUEsUUFDNUIsSUFBSSxXQUFXLEtBQUssTUFBTSxJQUFJO0FBQUEsVUFDMUIsY0FBYyxVQUFVO0FBQUEsUUFDNUIsRUFBTztBQUFBLFVBQ0gsZUFBZTtBQUFBO0FBQUEsTUFFdkIsRUFBTztBQUFBLFFBRUgsWUFBWSxZQUFZLElBQUksTUFBTSxLQUFLLFVBQVUsTUFBTSxLQUFLLEtBQUs7QUFBQSxRQUNqRSxXQUFXLEtBQUssRUFBRSxVQUFVO0FBQUEsUUFDNUIsSUFBSSxXQUFXLEtBQUssVUFBVSxJQUFJO0FBQUEsVUFDOUIsY0FBYyxVQUFVO0FBQUEsUUFDNUIsRUFBTztBQUFBLFVBQ0gsZUFBZTtBQUFBO0FBQUE7QUFBQSxNQUl2QixJQUFJLGNBQWM7QUFBQSxRQUVkLElBQUksU0FBUztBQUFBLFVBQUc7QUFBQSxRQUdoQixTQUFTLElBQUksRUFBRyxJQUFJLFFBQVEsUUFBUSxFQUFFLEdBQUc7QUFBQSxVQUNyQyxZQUFZLFFBQVEsSUFBSSxJQUFJLE9BQU8sUUFBUSxJQUFJLE9BQU8sUUFBUSxFQUFFO0FBQUEsVUFDaEUsUUFBUSxHQUFHLEtBQUssRUFBRSxRQUFRLEVBQUU7QUFBQSxRQUNoQztBQUFBLE1BQ0o7QUFBQSxJQUNKLEVBQU87QUFBQSxNQUNILGNBQWMsU0FBUztBQUFBO0FBQUEsRUFFL0I7QUFBQSxFQUVBLFFBQVEsS0FBSyxTQUFTO0FBQUEsRUFDdEIsT0FBTyxFQUFFLElBQUksUUFBUSxHQUFHLElBQUksR0FBRyxRQUFRLEdBQUc7QUFBQTtBQVU5QyxTQUFTLGVBQWUsQ0FBQyxHQUFHLElBQUksU0FBUyxNQUFNLEdBQUcsSUFBSSxJQUFJO0FBQUEsRUFDdEQsTUFBTSxPQUFPLFFBQVE7QUFBQSxFQUNyQixNQUFNLFlBQVksSUFBSSxRQUFRLFNBQVMsRUFBRTtBQUFBLEVBQ3pDLElBQUksTUFBTTtBQUFBLEVBQ1YsSUFBSSxVQUFVO0FBQUEsRUFDZCxJQUFJLFdBQVc7QUFBQSxFQUNmLElBQUksS0FBSztBQUFBLEVBRVQsSUFBSSxLQUFLO0FBQUEsRUFDVCxLQUFLLE1BQU07QUFBQSxFQUNYLEtBQUssTUFBTTtBQUFBLEVBRVgsU0FBUyxJQUFJLENBQUMsTUFBTSxRQUFRLFFBQVE7QUFBQSxJQUNoQyxTQUFTLFlBQVksRUFBRyxZQUFZLElBQUksRUFBRSxXQUFXO0FBQUEsTUFDakQsS0FBSyxPQUFPLFVBQVU7QUFBQSxNQUN0QixZQUFZLEtBQUssR0FBRyxHQUFLLFFBQVEsR0FBRyxHQUFHLEVBQUU7QUFBQSxNQUN6QyxNQUFNLEtBQUssS0FBSyxFQUFFLEtBQUssR0FBRyxLQUFLLE9BQU87QUFBQSxNQUN0QyxXQUFXLElBQUksS0FBSyxTQUFTLEVBQUU7QUFBQSxNQUUvQixJQUFJLE1BQU0sT0FBTyxLQUFLLElBQUksYUFBYSxPQUFPLFFBQVE7QUFBQSxRQUNsRCxTQUFTO0FBQUEsTUFDYixFQUFPO0FBQUEsUUFDSCxJQUFJLEtBQUssSUFBSSxRQUFRLEtBQUssQ0FBQyxLQUFLLFdBQVc7QUFBQSxVQUN2QyxPQUFPO0FBQUEsUUFDWDtBQUFBLFFBRUEsSUFBSSxZQUFZLFNBQVMsU0FBUyxHQUFHO0FBQUEsVUFDakMsU0FBUztBQUFBLFFBQ2I7QUFBQSxRQUVBLE9BQU87QUFBQSxRQUNQLFNBQVM7QUFBQTtBQUFBLElBRWpCO0FBQUEsSUFFQSxPQUFPO0FBQUE7QUFBQSxFQUdYLFNBQVMsWUFBWSxFQUFHLFlBQVksSUFBSSxFQUFFLFdBQVc7QUFBQSxJQUNqRCxZQUFZLEtBQUssR0FBRyxHQUFLLFFBQVEsR0FBRyxHQUFHLEVBQUU7QUFBQSxJQUN6QyxNQUFNLEtBQUssS0FBSyxFQUFFLEtBQUssR0FBRyxLQUFLLE9BQU87QUFBQSxJQUN0QyxXQUFXLElBQUksS0FBSyxTQUFTLEVBQUU7QUFBQSxJQUMvQixJQUFJLE1BQU0sT0FBTyxLQUFLLElBQUksYUFBYyxhQUFhLE9BQU8sU0FBVTtBQUFBLE1BQ2xFLE9BQU8sS0FBSyxJQUFJLEdBQUcsT0FBTztBQUFBLElBQzlCO0FBQUEsSUFFQSxJQUFJLEtBQUssSUFBSSxRQUFRLEtBQUssQ0FBQyxLQUFLLFdBQVc7QUFBQSxNQUN2QyxPQUFPO0FBQUEsSUFDWDtBQUFBLElBRUEsSUFBSSxZQUFZLEdBQUc7QUFBQSxNQUNmLE9BQU8sS0FBSyxHQUFHLElBQUksR0FBRztBQUFBLElBQzFCO0FBQUEsSUFFQSxVQUFVO0FBQUEsSUFDVixLQUFLO0FBQUEsSUFDTCxLQUFLO0FBQUEsRUFDVDtBQUFBLEVBRUEsT0FBTztBQUFBO0FBR1gsU0FBUyxpQkFBaUIsQ0FBQyxHQUFHLFNBQVMsUUFBUTtBQUFBLEVBRzNDLElBQUksVUFBVSxFQUFFLEdBQUcsUUFBUSxNQUFNLEdBQUcsSUFBSSxHQUFHLFNBQVMsUUFBUSxNQUFNLEVBQUU7QUFBQSxFQUNwRSxJQUFJLE9BQU8sRUFBRSxHQUFHLFFBQVEsTUFBTSxHQUFHLElBQUksR0FBRyxTQUFTLFFBQVEsTUFBTSxFQUFFO0FBQUEsRUFDakUsTUFBTSxLQUFLLFFBQVEsTUFBTTtBQUFBLEVBQ3pCLElBQUk7QUFBQSxFQUNKLElBQUk7QUFBQSxFQUNKLElBQUksSUFBSTtBQUFBLEVBQ1IsSUFBSTtBQUFBLEVBRUosU0FBUyxVQUFVLENBQUM7QUFBQSxFQUNwQixnQkFBZ0IsT0FBTyxpQkFBaUIsUUFBUSxTQUFTO0FBQUEsRUFFekQsUUFBUSxLQUFLLEVBQUUsUUFBUSxHQUFHLFFBQVEsT0FBTztBQUFBLEVBQ3pDLEtBQUssUUFBUSxRQUFRLE1BQU07QUFBQSxFQUMzQixNQUFNLElBQUksUUFBUSxTQUFTLEVBQUU7QUFBQSxFQUU3QixTQUFTLElBQUksRUFBRyxJQUFJLGVBQWUsRUFBRSxHQUFHO0FBQUEsSUFDcEMsSUFBSSxnQkFBZ0IsR0FBRyxJQUFJLFNBQVMsTUFBTSxDQUFDO0FBQUEsSUFHM0MsSUFBSSxPQUFPLFNBQVM7QUFBQSxNQUNoQixPQUFPLFFBQVEsS0FBSztBQUFBLFFBQ2hCLEdBQUcsUUFBUSxFQUFFLE1BQU07QUFBQSxRQUNuQixJQUFJLFFBQVE7QUFBQSxRQUNaLFNBQVMsUUFBUSxRQUFRLE1BQU07QUFBQSxRQUMvQixPQUFPO0FBQUEsTUFDWCxDQUFDO0FBQUEsSUFDTDtBQUFBLElBRUEsSUFBSSxDQUFDLEdBQUc7QUFBQSxNQUdKLE1BQU0sSUFBSSxRQUFRLFNBQVMsRUFBRTtBQUFBLElBQ2pDLEVBQU87QUFBQSxNQUVILFlBQVksSUFBSSxHQUFHLEtBQUssU0FBUyxJQUFJLFFBQVEsT0FBTztBQUFBLE1BRXBELE1BQU0sVUFBVSxJQUFJLFFBQVEsU0FBUyxRQUFRLE9BQU87QUFBQSxNQUNwRCxNQUFNLFNBQVMsS0FBSyxJQUFJLEdBQUcsSUFBSSxJQUFJLEtBQUssT0FBTyxJQUFJLE9BQU87QUFBQSxNQUUxRCxZQUFZLElBQUksUUFBUSxJQUFJLElBQUksS0FBSyxPQUFPO0FBQUEsTUFFNUMsT0FBTztBQUFBLE1BQ1AsVUFBVTtBQUFBLE1BQ1YsT0FBTztBQUFBO0FBQUEsSUFHWCxJQUFJLE1BQU0sUUFBUSxPQUFPLEtBQUssU0FBTTtBQUFBLE1BQ2hDO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUVBLElBQUksT0FBTyxTQUFTO0FBQUEsSUFDaEIsT0FBTyxRQUFRLEtBQUs7QUFBQSxNQUNoQixHQUFHLFFBQVEsRUFBRSxNQUFNO0FBQUEsTUFDbkIsSUFBSSxRQUFRO0FBQUEsTUFDWixTQUFTLFFBQVEsUUFBUSxNQUFNO0FBQUEsTUFDL0IsT0FBTztBQUFBLElBQ1gsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUVBLE9BQU87QUFBQTtBQVVYLFNBQVMsSUFBSSxDQUFDLE1BQU0sYUFBYSxDQUFDLEdBQUc7QUFBQSxFQUNuQyxXQUFXLGdCQUFnQixXQUFXLGlCQUFpQjtBQUFBLEVBRXZELE1BQU0sZ0JBQWdCLFdBQVcsaUJBQWlCO0FBQUEsRUFDbEQsTUFBTSxPQUFPLFdBQVcsZ0JBQWdCO0FBQUEsRUFHeEMsTUFBTSxRQUFRLGdCQUFnQixNQUFNLFVBQVU7QUFBQSxFQUc5QyxNQUFNLFVBQVUsY0FBYyxPQUFPLFVBQVU7QUFBQSxFQUcvQyxNQUFNLFNBQVMsT0FBTyxLQUFLLE9BQU87QUFBQSxFQUVsQyxNQUFNLFVBQVUsQ0FBQztBQUFBLEVBQ2pCLFdBQVcsU0FBUyxRQUFRO0FBQUEsSUFDMUIsUUFBUSxLQUFLLFFBQVEsT0FBTyxDQUFDO0FBQUEsSUFDN0IsUUFBUSxLQUFLLFFBQVEsT0FBTyxDQUFDO0FBQUEsRUFDL0I7QUFBQSxFQUdBLE1BQU0sV0FBVyxXQUNmLENBQUMsV0FBVztBQUFBLElBQ1YsTUFBTSxVQUFVLENBQUM7QUFBQSxJQUNqQixTQUFTLElBQUksRUFBRyxJQUFJLE9BQU8sUUFBUSxFQUFFLEdBQUc7QUFBQSxNQUN0QyxNQUFNLFFBQVEsT0FBTztBQUFBLE1BQ3JCLFFBQVEsU0FBUztBQUFBLFFBQ2YsR0FBRyxPQUFPLElBQUk7QUFBQSxRQUNkLEdBQUcsT0FBTyxJQUFJLElBQUk7QUFBQSxRQUNsQixRQUFRLFFBQVEsT0FBTztBQUFBLE1BRXpCO0FBQUEsSUFDRjtBQUFBLElBQ0EsT0FBTyxLQUFLLFNBQVMsS0FBSztBQUFBLEtBRTVCLFNBQ0EsVUFDRjtBQUFBLEVBR0EsTUFBTSxZQUFZLFNBQVM7QUFBQSxFQUMzQixTQUFTLElBQUksRUFBRyxJQUFJLE9BQU8sUUFBUSxFQUFFLEdBQUc7QUFBQSxJQUN0QyxNQUFNLFFBQVEsT0FBTztBQUFBLElBQ3JCLFFBQVEsT0FBTyxJQUFJLFVBQVUsSUFBSTtBQUFBLElBQ2pDLFFBQVEsT0FBTyxJQUFJLFVBQVUsSUFBSSxJQUFJO0FBQUEsRUFDdkM7QUFBQSxFQUVBLE9BQU87QUFBQTtBQUdULElBQU0sUUFBUTtBQVVkLFNBQVMseUJBQXlCLENBQUMsSUFBSSxJQUFJLFNBQVM7QUFBQSxFQUVsRCxJQUFJLEtBQUssSUFBSSxJQUFJLEVBQUUsSUFBSSxLQUFLLElBQUksSUFBSSxFQUFFLElBQUksS0FBSyxNQUFNLFVBQVUsT0FBTztBQUFBLElBQ3BFLE9BQU8sS0FBSyxJQUFJLEtBQUssRUFBRTtBQUFBLEVBQ3pCO0FBQUEsRUFFQSxPQUFPLE9BQU8sQ0FBQyxjQUFhLGNBQWMsSUFBSSxJQUFJLFNBQVEsSUFBSSxTQUFTLEdBQUcsS0FBSyxFQUFFO0FBQUE7QUFXbkYsU0FBUyxlQUFlLENBQUMsT0FBTyxhQUFhLENBQUMsR0FBRztBQUFBLEVBQy9DLE1BQU0sV0FBVyxXQUFXO0FBQUEsRUFDNUIsTUFBTSxJQUFJLE1BQU0sSUFBSSxDQUFDLE1BQU0sT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7QUFBQSxFQUUvQyxTQUFTLEtBQUssQ0FBQyxLQUFLO0FBQUEsSUFDbEIsT0FBTyxJQUFJLEtBQUssR0FBRztBQUFBO0FBQUEsRUFHckIsSUFBSSxVQUFVO0FBQUEsSUFHWixNQUFNLFFBQVEsSUFBSTtBQUFBLElBQ2xCLFdBQVcsUUFBUSxHQUFHO0FBQUEsTUFDcEIsU0FBUyxJQUFJLEVBQUcsSUFBSSxLQUFLLEtBQUssUUFBUSxLQUFLO0FBQUEsUUFDekMsTUFBTSxLQUFLLE9BQU8sS0FBSyxLQUFLLEVBQUU7QUFBQSxRQUM5QixNQUFNLElBQUksSUFBSSxLQUFLLFFBQVEsTUFBTSxJQUFJLEVBQUUsS0FBSyxFQUFFO0FBQUEsUUFDOUMsU0FBUyxJQUFJLElBQUksRUFBRyxJQUFJLEtBQUssS0FBSyxRQUFRLEtBQUs7QUFBQSxVQUM3QyxNQUFNLEtBQUssT0FBTyxLQUFLLEtBQUssRUFBRTtBQUFBLFVBQzlCLE1BQU0sS0FBSyxHQUFHLE1BQU07QUFBQSxVQUNwQixNQUFNLEtBQUssR0FBRyxNQUFNO0FBQUEsVUFDcEIsTUFBTSxJQUFJLElBQUksS0FBSyxRQUFRLE1BQU0sSUFBSSxFQUFFLEtBQUssRUFBRTtBQUFBLFVBQzlDLE1BQU0sSUFBSSxJQUFJLEtBQUssUUFBUSxNQUFNLElBQUksRUFBRSxLQUFLLEVBQUU7QUFBQSxRQUNoRDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXLFFBQVEsR0FBRztBQUFBLE1BQ3BCLElBQUksS0FBSyxLQUFLLFNBQVMsR0FBRztBQUFBLFFBQ3hCLEtBQUssT0FBTyxNQUFNLElBQUksTUFBTSxLQUFLLElBQUksQ0FBQztBQUFBLE1BQ3hDO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUdBLE1BQU0sTUFBTSxDQUFDO0FBQUEsRUFHYixNQUFNLFFBQVEsSUFBSTtBQUFBLEVBQ2xCLFdBQVcsUUFBUSxHQUFHO0FBQUEsSUFDcEIsSUFBSSxLQUFLLEtBQUssV0FBVyxHQUFHO0FBQUEsTUFDMUIsSUFBSSxLQUFLLEtBQUssS0FBSyxFQUFFO0FBQUEsSUFDdkIsRUFBTyxTQUFJLEtBQUssS0FBSyxXQUFXLEdBQUc7QUFBQSxNQUNqQyxNQUFNLElBQUksS0FBSyxLQUFLO0FBQUEsTUFDcEIsTUFBTSxJQUFJLEtBQUssS0FBSztBQUFBLE1BQ3BCLE1BQU0sSUFBSSxNQUFNLEtBQUssSUFBSSxDQUFDO0FBQUEsTUFDMUIsTUFBTSxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQUEsSUFDekI7QUFBQSxFQUNGO0FBQUEsRUFFQSxJQUFJLEtBQUssQ0FBQyxHQUFHLE1BQU8sTUFBTSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssQ0FBRztBQUFBLEVBRWxELFNBQVMsSUFBSSxFQUFHLElBQUksSUFBSSxRQUFRLEVBQUUsR0FBRztBQUFBLElBQ25DLE1BQU0sSUFBSSxJQUFJO0FBQUEsSUFDZCxTQUFTLElBQUksSUFBSSxFQUFHLElBQUksSUFBSSxRQUFRLEVBQUUsR0FBRztBQUFBLE1BQ3ZDLE1BQU0sSUFBSSxJQUFJO0FBQUEsTUFDZCxJQUFJLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUc7QUFBQSxRQUM3QixFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUM7QUFBQSxNQUNsQztBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUE7QUFVVCxTQUFTLG1CQUFtQixDQUFDLE9BQU8sTUFBTSxRQUFRO0FBQUEsRUFLaEQsTUFBTSxZQUFZLE9BQU8sS0FBSyxRQUFRLEtBQUssTUFBTTtBQUFBLEVBSWpELE1BQU0sY0FBYyxPQUFPLEtBQUssUUFBUSxLQUFLLE1BQU07QUFBQSxFQUluRCxNQUNHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsS0FBSyxXQUFXLENBQUMsRUFDakMsUUFBUSxDQUFDLFlBQVk7QUFBQSxJQUNwQixNQUFNLE9BQU8sT0FBTyxRQUFRLEtBQUs7QUFBQSxJQUNqQyxNQUFNLFFBQVEsT0FBTyxRQUFRLEtBQUs7QUFBQSxJQUNsQyxNQUFNLEtBQUssS0FBSyxLQUFLLEtBQUssTUFBTSxPQUFPLEtBQUssRUFBRTtBQUFBLElBQzlDLE1BQU0sS0FBSyxLQUFLLEtBQUssS0FBSyxPQUFPLE9BQU8sS0FBSyxFQUFFO0FBQUEsSUFDL0MsTUFBTSxZQUFXLDBCQUEwQixJQUFJLElBQUksUUFBUSxJQUFJO0FBQUEsSUFFL0QsVUFBVSxNQUFNLFNBQVMsVUFBVSxPQUFPLFFBQVE7QUFBQSxJQUlsRCxJQUFJLElBQUk7QUFBQSxJQUNSLElBQUksUUFBUSxPQUFPLGdCQUFTLEtBQUssSUFBSSxLQUFLLE1BQU0sTUFBTSxLQUFLLE9BQU8sSUFBSSxHQUFHO0FBQUEsTUFDdkUsSUFBSTtBQUFBLElBQ04sRUFBTyxTQUFJLFFBQVEsUUFBUSxjQUFPO0FBQUEsTUFDaEMsSUFBSTtBQUFBLElBQ047QUFBQSxJQUNBLFlBQVksTUFBTSxTQUFTLFlBQVksT0FBTyxRQUFRO0FBQUEsR0FDdkQ7QUFBQSxFQUVILE9BQU8sRUFBRSxXQUFXLFlBQVk7QUFBQTtBQUlsQyxTQUFTLHNCQUFzQixDQUFDLEdBQUcsU0FBUyxXQUFXLGFBQWE7QUFBQSxFQUNsRSxTQUFTLElBQUksRUFBRyxJQUFJLFFBQVEsUUFBUSxFQUFFLEdBQUc7QUFBQSxJQUN2QyxRQUFRLEtBQUs7QUFBQSxFQUNmO0FBQUEsRUFFQSxJQUFJLE9BQU87QUFBQSxFQUNYLFNBQVMsSUFBSSxFQUFHLElBQUksVUFBVSxRQUFRLEVBQUUsR0FBRztBQUFBLElBQ3pDLE1BQU0sS0FBSyxFQUFFLElBQUk7QUFBQSxJQUNqQixNQUFNLEtBQUssRUFBRSxJQUFJLElBQUk7QUFBQSxJQUNyQixTQUFTLElBQUksSUFBSSxFQUFHLElBQUksVUFBVSxRQUFRLEVBQUUsR0FBRztBQUFBLE1BQzdDLE1BQU0sS0FBSyxFQUFFLElBQUk7QUFBQSxNQUNqQixNQUFNLEtBQUssRUFBRSxJQUFJLElBQUk7QUFBQSxNQUNyQixNQUFNLE1BQU0sVUFBVSxHQUFHO0FBQUEsTUFDekIsTUFBTSxhQUFhLFlBQVksR0FBRztBQUFBLE1BRWxDLE1BQU0sbUJBQW1CLEtBQUssT0FBTyxLQUFLLE9BQU8sS0FBSyxPQUFPLEtBQUs7QUFBQSxNQUNsRSxNQUFNLFlBQVcsS0FBSyxLQUFLLGVBQWU7QUFBQSxNQUMxQyxNQUFNLFFBQVEsa0JBQWtCLE1BQU07QUFBQSxNQUV0QyxJQUFLLGFBQWEsS0FBSyxhQUFZLE9BQVMsYUFBYSxLQUFLLGFBQVksS0FBTTtBQUFBLFFBQzlFO0FBQUEsTUFDRjtBQUFBLE1BRUEsUUFBUSxJQUFJLFFBQVE7QUFBQSxNQUVwQixRQUFRLElBQUksTUFBTSxJQUFJLFNBQVMsS0FBSztBQUFBLE1BQ3BDLFFBQVEsSUFBSSxJQUFJLE1BQU0sSUFBSSxTQUFTLEtBQUs7QUFBQSxNQUV4QyxRQUFRLElBQUksTUFBTSxJQUFJLFNBQVMsS0FBSztBQUFBLE1BQ3BDLFFBQVEsSUFBSSxJQUFJLE1BQU0sSUFBSSxTQUFTLEtBQUs7QUFBQSxJQUMxQztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQTtBQU9ULFNBQVMsaUJBQWlCLENBQUMsT0FBTyxTQUFTLENBQUMsR0FBRztBQUFBLEVBQzdDLElBQUksVUFBVSxhQUFhLE9BQU8sTUFBTTtBQUFBLEVBQ3hDLE1BQU0sT0FBTyxPQUFPLGdCQUFnQjtBQUFBLEVBTXBDLElBQUksTUFBTSxVQUFVLEdBQUc7QUFBQSxJQUNyQixNQUFNLGNBQWMscUJBQXFCLE9BQU8sTUFBTTtBQUFBLElBQ3RELE1BQU0sa0JBQWtCLEtBQUssYUFBYSxLQUFLO0FBQUEsSUFDL0MsTUFBTSxhQUFhLEtBQUssU0FBUyxLQUFLO0FBQUEsSUFFdEMsSUFBSSxrQkFBa0IsYUFBTyxZQUFZO0FBQUEsTUFDdkMsVUFBVTtBQUFBLElBQ1o7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUE7QUFRVCxTQUFTLG9CQUFvQixDQUFDLE9BQU8sU0FBUyxDQUFDLEdBQUc7QUFBQSxFQUNoRCxNQUFNLFdBQVcsT0FBTyxZQUFZO0FBQUEsRUFHcEMsTUFBTSxPQUFPLENBQUM7QUFBQSxFQUNkLE1BQU0sU0FBUyxDQUFDO0FBQUEsRUFDaEIsV0FBVyxRQUFRLE9BQU87QUFBQSxJQUN4QixJQUFJLEtBQUssS0FBSyxXQUFXLEdBQUc7QUFBQSxNQUMxQixPQUFPLEtBQUssS0FBSyxNQUFNLEtBQUs7QUFBQSxNQUM1QixLQUFLLEtBQUssSUFBSTtBQUFBLElBQ2hCO0FBQUEsRUFDRjtBQUFBLEVBRUEsTUFBTSxXQUFXLGdCQUFnQixvQkFBb0IsT0FBTyxNQUFNLE1BQU07QUFBQSxFQUl4RSxNQUFNLE9BQU8sTUFBTSxVQUFVLElBQUksS0FBSyxDQUFDLElBQUksVUFBVTtBQUFBLEVBQ3JELFlBQVksVUFBVSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxVQUFVLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFFbkUsTUFBTSxNQUFNLENBQUMsR0FBRyxZQUFZLHVCQUF1QixHQUFHLFNBQVMsV0FBVyxXQUFXO0FBQUEsRUFFckYsSUFBSSxPQUFPO0FBQUEsRUFDWCxTQUFTLElBQUksRUFBRyxJQUFJLFVBQVUsRUFBRSxHQUFHO0FBQUEsSUFDakMsTUFBTSxVQUFVLE1BQU0sVUFBVSxTQUFTLENBQUMsRUFBRSxJQUFJLEtBQUssTUFBTTtBQUFBLElBRTNELE1BQU0sVUFBVSxrQkFBa0IsS0FBSyxTQUFTLE1BQU07QUFBQSxJQUN0RCxJQUFJLENBQUMsUUFBUSxRQUFRLEtBQUssS0FBSyxJQUFJO0FBQUEsTUFDakMsT0FBTztBQUFBLElBQ1Q7QUFBQSxFQUNGO0FBQUEsRUFFQSxNQUFNLFlBQVksS0FBSztBQUFBLEVBSXZCLE1BQU0sVUFBVSxDQUFDO0FBQUEsRUFDakIsU0FBUyxJQUFJLEVBQUcsSUFBSSxLQUFLLFFBQVEsRUFBRSxHQUFHO0FBQUEsSUFDcEMsTUFBTSxNQUFNLEtBQUs7QUFBQSxJQUNqQixRQUFRLElBQUksS0FBSyxNQUFNO0FBQUEsTUFDckIsR0FBRyxVQUFVLElBQUksS0FBSztBQUFBLE1BQ3RCLEdBQUcsVUFBVSxJQUFJLElBQUksS0FBSztBQUFBLE1BQzFCLFFBQVEsS0FBSyxLQUFLLElBQUksT0FBTyxLQUFLLEVBQUU7QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUVBLElBQUksT0FBTyxTQUFTO0FBQUEsSUFDbEIsV0FBVyxLQUFLLE9BQU8sU0FBUztBQUFBLE1BQzlCLE1BQU0sRUFBRSxHQUFHLElBQUk7QUFBQSxJQUNqQjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQTtBQVVULFNBQVMsWUFBWSxDQUFDLE9BQU8sUUFBUTtBQUFBLEVBQ25DLE1BQU0sT0FBTyxVQUFVLE9BQU8sZUFBZSxPQUFPLGVBQWU7QUFBQSxFQUluRSxNQUFNLFVBQVUsQ0FBQztBQUFBLEVBRWpCLE1BQU0sY0FBYyxDQUFDO0FBQUEsRUFDckIsV0FBVyxRQUFRLE9BQU87QUFBQSxJQUN4QixJQUFJLEtBQUssS0FBSyxXQUFXLEdBQUc7QUFBQSxNQUMxQixNQUFNLE1BQU0sS0FBSyxLQUFLO0FBQUEsTUFDdEIsUUFBUSxPQUFPO0FBQUEsUUFDYixHQUFHO0FBQUEsUUFDSCxHQUFHO0FBQUEsUUFDSCxPQUFPLFFBQVE7QUFBQSxRQUNmLE1BQU0sS0FBSztBQUFBLFFBQ1gsUUFBUSxLQUFLLEtBQUssS0FBSyxPQUFPLEtBQUssRUFBRTtBQUFBLE1BQ3ZDO0FBQUEsTUFDQSxZQUFZLE9BQU8sQ0FBQztBQUFBLElBQ3RCO0FBQUEsRUFDRjtBQUFBLEVBRUEsUUFBUSxNQUFNLE9BQU8sQ0FBQyxNQUFNLEVBQUUsS0FBSyxXQUFXLENBQUM7QUFBQSxFQUcvQyxXQUFXLFdBQVcsT0FBTztBQUFBLElBQzNCLElBQUksU0FBUyxRQUFRLFVBQVUsT0FBTyxRQUFRLFNBQVM7QUFBQSxJQUN2RCxNQUFNLE9BQU8sUUFBUSxLQUFLO0FBQUEsSUFDMUIsTUFBTSxRQUFRLFFBQVEsS0FBSztBQUFBLElBRzNCLElBQUksUUFBUSxPQUFPLFNBQVMsS0FBSyxJQUFJLFFBQVEsTUFBTSxNQUFNLFFBQVEsT0FBTyxJQUFJLEdBQUc7QUFBQSxNQUM3RSxTQUFTO0FBQUEsSUFDWDtBQUFBLElBRUEsWUFBWSxNQUFNLEtBQUssRUFBRSxLQUFLLE9BQU8sTUFBTSxRQUFRLE1BQU0sT0FBTyxDQUFDO0FBQUEsSUFDakUsWUFBWSxPQUFPLEtBQUssRUFBRSxLQUFLLE1BQU0sTUFBTSxRQUFRLE1BQU0sT0FBTyxDQUFDO0FBQUEsRUFDbkU7QUFBQSxFQUdBLE1BQU0saUJBQWlCLENBQUM7QUFBQSxFQUN4QixPQUFPLEtBQUssV0FBVyxFQUFFLFFBQVEsQ0FBQyxRQUFRO0FBQUEsSUFDeEMsSUFBSSxPQUFPO0FBQUEsSUFDWCxTQUFTLElBQUksRUFBRyxJQUFJLFlBQVksS0FBSyxRQUFRLEVBQUUsR0FBRztBQUFBLE1BQ2hELFFBQVEsWUFBWSxLQUFLLEdBQUcsT0FBTyxZQUFZLEtBQUssR0FBRztBQUFBLElBQ3pEO0FBQUEsSUFFQSxlQUFlLEtBQUssRUFBRSxLQUFLLEtBQUssQ0FBQztBQUFBLEdBQ2xDO0FBQUEsRUFHRCxTQUFTLFNBQVMsQ0FBQyxHQUFHLEdBQUc7QUFBQSxJQUN2QixPQUFPLEVBQUUsT0FBTyxFQUFFO0FBQUE7QUFBQSxFQUVwQixlQUFlLEtBQUssU0FBUztBQUFBLEVBRzdCLE1BQU0sYUFBYSxDQUFDO0FBQUEsRUFDcEIsU0FBUyxZQUFZLENBQUMsU0FBUztBQUFBLElBQzdCLE9BQU8sUUFBUSxPQUFPO0FBQUE7QUFBQSxFQVF4QixTQUFTLFdBQVcsQ0FBQyxPQUFPLE9BQU87QUFBQSxJQUNqQyxRQUFRLE9BQU8sSUFBSSxNQUFNO0FBQUEsSUFDekIsUUFBUSxPQUFPLElBQUksTUFBTTtBQUFBLElBQ3pCLFdBQVcsU0FBUztBQUFBO0FBQUEsRUFJdEIsWUFBWSxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxlQUFlLEdBQUcsR0FBRztBQUFBLEVBS2pELFNBQVMsSUFBSSxFQUFHLElBQUksZUFBZSxRQUFRLEVBQUUsR0FBRztBQUFBLElBQzlDLE1BQU0sV0FBVyxlQUFlLEdBQUc7QUFBQSxJQUNuQyxNQUFNLFVBQVUsWUFBWSxVQUFVLE9BQU8sWUFBWTtBQUFBLElBQ3pELE1BQU0sTUFBTSxRQUFRO0FBQUEsSUFDcEIsUUFBUSxLQUFLLFNBQVM7QUFBQSxJQUV0QixJQUFJLFFBQVEsV0FBVyxHQUFHO0FBQUEsTUFFeEIsTUFBTTtBQUFBLElBQ1I7QUFBQSxJQUdBLE1BQU0sU0FBUyxDQUFDO0FBQUEsSUFDaEIsU0FBUyxJQUFJLEVBQUcsSUFBSSxRQUFRLFFBQVEsRUFBRSxHQUFHO0FBQUEsTUFFdkMsTUFBTSxLQUFLLFFBQVEsUUFBUSxHQUFHO0FBQUEsTUFDOUIsTUFBTSxLQUFLLDBCQUEwQixJQUFJLFFBQVEsR0FBRyxRQUFRLFFBQVEsR0FBRyxJQUFJO0FBQUEsTUFHM0UsT0FBTyxLQUFLLEVBQUUsR0FBRyxHQUFHLElBQUksSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQUEsTUFDckMsT0FBTyxLQUFLLEVBQUUsR0FBRyxHQUFHLElBQUksSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQUEsTUFDckMsT0FBTyxLQUFLLEVBQUUsR0FBRyxHQUFHLElBQUksSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQUEsTUFDckMsT0FBTyxLQUFLLEVBQUUsR0FBRyxHQUFHLElBQUksSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQUEsTUFJckMsU0FBUyxJQUFJLElBQUksRUFBRyxJQUFJLFFBQVEsUUFBUSxFQUFFLEdBQUc7QUFBQSxRQUMzQyxNQUFNLEtBQUssUUFBUSxRQUFRLEdBQUc7QUFBQSxRQUM5QixNQUFNLEtBQUssMEJBQTBCLElBQUksUUFBUSxHQUFHLFFBQVEsUUFBUSxHQUFHLElBQUk7QUFBQSxRQUUzRSxNQUFNLGNBQWMseUJBQ2xCLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsUUFBUSxHQUFHLEdBQy9CLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsUUFBUSxHQUFHLENBQ2pDO0FBQUEsUUFDQSxPQUFPLEtBQUssR0FBRyxXQUFXO0FBQUEsTUFDNUI7QUFBQSxJQUNGO0FBQUEsSUFJQSxJQUFJLFdBQVc7QUFBQSxJQUNmLElBQUksWUFBWSxPQUFPO0FBQUEsSUFDdkIsV0FBVyxTQUFTLFFBQVE7QUFBQSxNQUMxQixRQUFRLFVBQVUsSUFBSSxNQUFNO0FBQUEsTUFDNUIsUUFBUSxVQUFVLElBQUksTUFBTTtBQUFBLE1BQzVCLE1BQU0sWUFBWSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQ3JDLElBQUksWUFBWSxVQUFVO0FBQUEsUUFDeEIsV0FBVztBQUFBLFFBQ1gsWUFBWTtBQUFBLE1BQ2Q7QUFBQSxJQUNGO0FBQUEsSUFFQSxZQUFZLFdBQVcsUUFBUTtBQUFBLEVBQ2pDO0FBQUEsRUFFQSxPQUFPO0FBQUE7QUFXVCxTQUFTLFlBQVksQ0FBQyxTQUFTLFVBQVU7QUFBQSxFQUN2QyxJQUFJLFNBQVM7QUFBQSxFQUViLFdBQVcsUUFBUSxVQUFVO0FBQUEsSUFDM0IsSUFBSSxLQUFLLEtBQUssV0FBVyxHQUFHO0FBQUEsTUFDMUI7QUFBQSxJQUNGO0FBQUEsSUFFQSxJQUFJO0FBQUEsSUFDSixJQUFJLEtBQUssS0FBSyxXQUFXLEdBQUc7QUFBQSxNQUMxQixNQUFNLE9BQU8sUUFBUSxLQUFLLEtBQUs7QUFBQSxNQUMvQixNQUFNLFFBQVEsUUFBUSxLQUFLLEtBQUs7QUFBQSxNQUNoQyxVQUFVLGNBQWMsS0FBSyxRQUFRLE1BQU0sUUFBUSxTQUFTLE1BQU0sS0FBSyxDQUFDO0FBQUEsSUFDMUUsRUFBTztBQUFBLE1BQ0wsVUFBVSxpQkFBaUIsS0FBSyxLQUFLLElBQUksQ0FBQyxNQUFNLFFBQVEsRUFBRSxDQUFDO0FBQUE7QUFBQSxJQUc3RCxNQUFNLFNBQVMsS0FBSyxVQUFVLE9BQU8sS0FBSyxTQUFTO0FBQUEsSUFDbkQsVUFBVSxVQUFVLFVBQVUsS0FBSyxTQUFTLFVBQVUsS0FBSztBQUFBLEVBQzdEO0FBQUEsRUFFQSxPQUFPO0FBQUE7QUFHVCxTQUFTLG9CQUFvQixDQUFDLFNBQVMsVUFBVTtBQUFBLEVBQy9DLElBQUksU0FBUztBQUFBLEVBRWIsV0FBVyxRQUFRLFVBQVU7QUFBQSxJQUMzQixJQUFJLEtBQUssS0FBSyxXQUFXLEdBQUc7QUFBQSxNQUMxQjtBQUFBLElBQ0Y7QUFBQSxJQUVBLElBQUk7QUFBQSxJQUNKLElBQUksS0FBSyxLQUFLLFdBQVcsR0FBRztBQUFBLE1BQzFCLE1BQU0sT0FBTyxRQUFRLEtBQUssS0FBSztBQUFBLE1BQy9CLE1BQU0sUUFBUSxRQUFRLEtBQUssS0FBSztBQUFBLE1BQ2hDLFVBQVUsY0FBYyxLQUFLLFFBQVEsTUFBTSxRQUFRLFNBQVMsTUFBTSxLQUFLLENBQUM7QUFBQSxJQUMxRSxFQUFPO0FBQUEsTUFDTCxVQUFVLGlCQUFpQixLQUFLLEtBQUssSUFBSSxDQUFDLE1BQU0sUUFBUSxFQUFFLENBQUM7QUFBQTtBQUFBLElBRzdELE1BQU0sU0FBUyxLQUFLLFVBQVUsT0FBTyxLQUFLLFNBQVM7QUFBQSxJQUNuRCxNQUFNLHNCQUFzQixLQUFLLEtBQUssVUFBVSxNQUFNLEtBQUssT0FBTyxFQUFFO0FBQUEsSUFDcEUsVUFBVSxTQUFTLHNCQUFzQjtBQUFBLEVBQzNDO0FBQUEsRUFFQSxPQUFPO0FBQUE7QUFTVCxTQUFTLGdCQUFnQixDQUFDLFNBQVMsYUFBYSxrQkFBa0I7QUFBQSxFQUNoRSxJQUFJLG9CQUFvQixNQUFNO0FBQUEsSUFDNUIsUUFBUSxLQUFLLENBQUMsR0FBRyxNQUFNLEVBQUUsU0FBUyxFQUFFLE1BQU07QUFBQSxFQUM1QyxFQUFPO0FBQUEsSUFDTCxRQUFRLEtBQUssZ0JBQWdCO0FBQUE7QUFBQSxFQUkvQixJQUFJLFFBQVEsU0FBUyxHQUFHO0FBQUEsSUFDdEIsTUFBTSxXQUFXLFFBQVEsR0FBRztBQUFBLElBQzVCLE1BQU0sV0FBVyxRQUFRLEdBQUc7QUFBQSxJQUU1QixXQUFXLFVBQVUsU0FBUztBQUFBLE1BQzVCLE9BQU8sS0FBSztBQUFBLE1BQ1osT0FBTyxLQUFLO0FBQUEsSUFDZDtBQUFBLEVBQ0Y7QUFBQSxFQUVBLElBQUksUUFBUSxXQUFXLEdBQUc7QUFBQSxJQUd4QixNQUFNLE9BQU8sU0FBUyxRQUFRLElBQUksUUFBUSxFQUFFO0FBQUEsSUFDNUMsSUFBSSxPQUFPLEtBQUssSUFBSSxRQUFRLEdBQUcsU0FBUyxRQUFRLEdBQUcsTUFBTSxHQUFHO0FBQUEsTUFDMUQsUUFBUSxHQUFHLElBQUksUUFBUSxHQUFHLElBQUksUUFBUSxHQUFHLFNBQVMsUUFBUSxHQUFHLFNBQVM7QUFBQSxNQUN0RSxRQUFRLEdBQUcsSUFBSSxRQUFRLEdBQUc7QUFBQSxJQUM1QjtBQUFBLEVBQ0Y7QUFBQSxFQUlBLElBQUksUUFBUSxTQUFTLEdBQUc7QUFBQSxJQUN0QixNQUFNLFdBQVcsS0FBSyxNQUFNLFFBQVEsR0FBRyxHQUFHLFFBQVEsR0FBRyxDQUFDLElBQUk7QUFBQSxJQUMxRCxNQUFNLElBQUksS0FBSyxJQUFJLFFBQVE7QUFBQSxJQUMzQixNQUFNLElBQUksS0FBSyxJQUFJLFFBQVE7QUFBQSxJQUUzQixXQUFXLFVBQVUsU0FBUztBQUFBLE1BQzVCLE1BQU0sSUFBSSxPQUFPO0FBQUEsTUFDakIsTUFBTSxJQUFJLE9BQU87QUFBQSxNQUNqQixPQUFPLElBQUksSUFBSSxJQUFJLElBQUk7QUFBQSxNQUN2QixPQUFPLElBQUksSUFBSSxJQUFJLElBQUk7QUFBQSxJQUN6QjtBQUFBLEVBQ0Y7QUFBQSxFQUlBLElBQUksUUFBUSxTQUFTLEdBQUc7QUFBQSxJQUN0QixJQUFJLFFBQVEsS0FBSyxNQUFNLFFBQVEsR0FBRyxHQUFHLFFBQVEsR0FBRyxDQUFDLElBQUk7QUFBQSxJQUNyRCxPQUFPLFFBQVEsR0FBRztBQUFBLE1BQ2hCLFNBQVMsSUFBSSxLQUFLO0FBQUEsSUFDcEI7QUFBQSxJQUNBLE9BQU8sUUFBUSxJQUFJLEtBQUssSUFBSTtBQUFBLE1BQzFCLFNBQVMsSUFBSSxLQUFLO0FBQUEsSUFDcEI7QUFBQSxJQUNBLElBQUksUUFBUSxLQUFLLElBQUk7QUFBQSxNQUNuQixNQUFNLFFBQVEsUUFBUSxHQUFHLEtBQUssZUFBUSxRQUFRLEdBQUc7QUFBQSxNQUNqRCxXQUFXLFVBQVUsU0FBUztBQUFBLFFBQzVCLElBQUksS0FBSyxPQUFPLElBQUksUUFBUSxPQUFPLE1BQU0sSUFBSSxRQUFRO0FBQUEsUUFDckQsT0FBTyxJQUFJLElBQUksSUFBSSxPQUFPO0FBQUEsUUFDMUIsT0FBTyxJQUFJLElBQUksSUFBSSxRQUFRLE9BQU87QUFBQSxNQUNwQztBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUE7QUFRRixTQUFTLGVBQWUsQ0FBQyxTQUFTO0FBQUEsRUFFaEMsUUFBUSxRQUFRLENBQUMsV0FBVztBQUFBLElBQzFCLE9BQU8sU0FBUztBQUFBLEdBQ2pCO0FBQUEsRUFHRCxTQUFTLElBQUksQ0FBQyxRQUFRO0FBQUEsSUFDcEIsSUFBSSxPQUFPLFdBQVcsUUFBUTtBQUFBLE1BQzVCLE9BQU8sU0FBUyxLQUFLLE9BQU8sTUFBTTtBQUFBLElBQ3BDO0FBQUEsSUFDQSxPQUFPLE9BQU87QUFBQTtBQUFBLEVBR2hCLFNBQVMsS0FBSyxDQUFDLEdBQUcsR0FBRztBQUFBLElBQ25CLE1BQU0sUUFBUSxLQUFLLENBQUM7QUFBQSxJQUNwQixNQUFNLFFBQVEsS0FBSyxDQUFDO0FBQUEsSUFDcEIsTUFBTSxTQUFTO0FBQUE7QUFBQSxFQUlqQixTQUFTLElBQUksRUFBRyxJQUFJLFFBQVEsUUFBUSxFQUFFLEdBQUc7QUFBQSxJQUN2QyxTQUFTLElBQUksSUFBSSxFQUFHLElBQUksUUFBUSxRQUFRLEVBQUUsR0FBRztBQUFBLE1BQzNDLE1BQU0sY0FBYyxRQUFRLEdBQUcsU0FBUyxRQUFRLEdBQUc7QUFBQSxNQUNuRCxJQUFJLFNBQVMsUUFBUSxJQUFJLFFBQVEsRUFBRSxJQUFJLGVBQVEsYUFBYTtBQUFBLFFBQzFELE1BQU0sUUFBUSxJQUFJLFFBQVEsRUFBRTtBQUFBLE1BQzlCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUlBLE1BQU0sbUJBQW1CLElBQUk7QUFBQSxFQUM3QixTQUFTLElBQUksRUFBRyxJQUFJLFFBQVEsUUFBUSxFQUFFLEdBQUc7QUFBQSxJQUN2QyxNQUFNLFFBQVEsS0FBSyxRQUFRLEVBQUUsRUFBRSxPQUFPO0FBQUEsSUFDdEMsSUFBSSxDQUFDLGlCQUFpQixJQUFJLEtBQUssR0FBRztBQUFBLE1BQ2hDLGlCQUFpQixJQUFJLE9BQU8sQ0FBQyxDQUFDO0FBQUEsSUFDaEM7QUFBQSxJQUNBLGlCQUFpQixJQUFJLEtBQUssRUFBRSxLQUFLLFFBQVEsRUFBRTtBQUFBLEVBQzdDO0FBQUEsRUFHQSxRQUFRLFFBQVEsQ0FBQyxXQUFXO0FBQUEsSUFDMUIsT0FBTyxPQUFPO0FBQUEsR0FDZjtBQUFBLEVBR0QsT0FBTyxNQUFNLEtBQUssaUJBQWlCLE9BQU8sQ0FBQztBQUFBO0FBTzdDLFNBQVMsY0FBYyxDQUFDLFNBQVM7QUFBQSxFQUMvQixNQUFNLFNBQVMsQ0FBQyxNQUFNO0FBQUEsSUFDcEIsTUFBTSxLQUFLLFFBQVEsT0FBTyxDQUFDLEtBQUssTUFBTSxLQUFLLElBQUksS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEdBQUcsT0FBTyxpQkFBaUI7QUFBQSxJQUM5RixNQUFNLEtBQUssUUFBUSxPQUFPLENBQUMsS0FBSyxNQUFNLEtBQUssSUFBSSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sR0FBRyxPQUFPLGlCQUFpQjtBQUFBLElBQzlGLE9BQU8sRUFBRSxLQUFLLElBQUksS0FBSyxHQUFHO0FBQUE7QUFBQSxFQUU1QixPQUFPLEVBQUUsUUFBUSxPQUFPLEdBQUcsR0FBRyxRQUFRLE9BQU8sR0FBRyxFQUFFO0FBQUE7QUFVcEQsU0FBUyxpQkFBaUIsQ0FBQyxVQUFVLGFBQWEsa0JBQWtCO0FBQUEsRUFDbEUsSUFBSSxlQUFlLE1BQU07QUFBQSxJQUN2QixjQUFjLEtBQUssS0FBSztBQUFBLEVBQzFCO0FBQUEsRUFJQSxJQUFJLFVBQVUsbUJBQW1CLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUFBLEVBRzFFLE1BQU0sV0FBVyxnQkFBZ0IsT0FBTztBQUFBLEVBR3hDLFdBQVcsV0FBVyxVQUFVO0FBQUEsSUFDOUIsaUJBQWlCLFNBQVMsYUFBYSxnQkFBZ0I7QUFBQSxJQUN2RCxNQUFNLFNBQVMsZUFBZSxPQUFPO0FBQUEsSUFDckMsUUFBUSxRQUFRLE9BQU8sT0FBTyxNQUFNLE9BQU8sT0FBTyxRQUFRLE9BQU8sT0FBTyxNQUFNLE9BQU8sT0FBTztBQUFBLElBQzVGLFFBQVEsU0FBUztBQUFBLEVBQ25CO0FBQUEsRUFDQSxTQUFTLEtBQUssQ0FBQyxHQUFHLE1BQU0sRUFBRSxPQUFPLEVBQUUsSUFBSTtBQUFBLEVBR3ZDLFVBQVUsU0FBUztBQUFBLEVBQ25CLElBQUksZUFBZSxRQUFRO0FBQUEsRUFDM0IsTUFBTSxXQUFXLGFBQWEsT0FBTyxNQUFNLGFBQWEsT0FBTyxPQUFPO0FBQUEsRUFPdEUsU0FBUyxVQUFVLENBQUMsU0FBUyxPQUFPLFFBQVE7QUFBQSxJQUMxQyxJQUFJLENBQUMsU0FBUztBQUFBLE1BQ1o7QUFBQSxJQUNGO0FBQUEsSUFFQSxNQUFNLFNBQVMsUUFBUTtBQUFBLElBRXZCLElBQUk7QUFBQSxJQUVKLElBQUk7QUFBQSxJQUVKLElBQUksT0FBTztBQUFBLE1BQ1QsVUFBVSxhQUFhLE9BQU8sTUFBTSxPQUFPLE9BQU8sTUFBTTtBQUFBLElBQzFELEVBQU87QUFBQSxNQUNMLFVBQVUsYUFBYSxPQUFPLE1BQU0sT0FBTyxPQUFPO0FBQUEsTUFDbEQsTUFBTSxhQUNILE9BQU8sT0FBTyxNQUFNLE9BQU8sT0FBTyxPQUFPLEtBQUssYUFBYSxPQUFPLE1BQU0sYUFBYSxPQUFPLE9BQU87QUFBQSxNQUN0RyxJQUFJLFlBQVksR0FBRztBQUFBLFFBQ2pCLFdBQVc7QUFBQSxNQUNiO0FBQUE7QUFBQSxJQUdGLElBQUksUUFBUTtBQUFBLE1BQ1YsVUFBVSxhQUFhLE9BQU8sTUFBTSxPQUFPLE9BQU8sTUFBTTtBQUFBLElBQzFELEVBQU87QUFBQSxNQUNMLFVBQVUsYUFBYSxPQUFPLE1BQU0sT0FBTyxPQUFPO0FBQUEsTUFDbEQsTUFBTSxhQUNILE9BQU8sT0FBTyxNQUFNLE9BQU8sT0FBTyxPQUFPLEtBQUssYUFBYSxPQUFPLE1BQU0sYUFBYSxPQUFPLE9BQU87QUFBQSxNQUN0RyxJQUFJLFlBQVksR0FBRztBQUFBLFFBQ2pCLFdBQVc7QUFBQSxNQUNiO0FBQUE7QUFBQSxJQUdGLFdBQVcsS0FBSyxTQUFTO0FBQUEsTUFDdkIsRUFBRSxLQUFLO0FBQUEsTUFDUCxFQUFFLEtBQUs7QUFBQSxNQUNQLFFBQVEsS0FBSyxDQUFDO0FBQUEsSUFDaEI7QUFBQTtBQUFBLEVBR0YsSUFBSSxRQUFRO0FBQUEsRUFDWixPQUFPLFFBQVEsU0FBUyxRQUFRO0FBQUEsSUFDOUIsV0FBVyxTQUFTLFFBQVEsTUFBTSxLQUFLO0FBQUEsSUFDdkMsV0FBVyxTQUFTLFFBQVEsSUFBSSxPQUFPLElBQUk7QUFBQSxJQUMzQyxXQUFXLFNBQVMsUUFBUSxJQUFJLE1BQU0sSUFBSTtBQUFBLElBQzFDLFNBQVM7QUFBQSxJQUlULGVBQWUsZUFBZSxPQUFPO0FBQUEsRUFDdkM7QUFBQSxFQUdBLE9BQU8saUJBQWlCLE9BQU87QUFBQTtBQWVqQyxTQUFTLGFBQWEsQ0FBQyxVQUFVLE9BQU8sUUFBUSxTQUFTLFlBQVk7QUFBQSxFQUNuRSxNQUFNLFVBQVUsbUJBQW1CLFFBQVE7QUFBQSxFQUUzQyxTQUFTLElBQUk7QUFBQSxFQUNiLFVBQVUsSUFBSTtBQUFBLEVBRWQsUUFBUSxRQUFRLFdBQVcsZUFBZSxPQUFPO0FBQUEsRUFFakQsSUFBSSxPQUFPLFFBQVEsT0FBTyxPQUFPLE9BQU8sUUFBUSxPQUFPLEtBQUs7QUFBQSxJQUMxRCxRQUFRLElBQUksMENBQTBDO0FBQUEsSUFDdEQsT0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUdBLElBQUk7QUFBQSxFQUVKLElBQUk7QUFBQSxFQUNKLElBQUksWUFBWTtBQUFBLElBQ2QsTUFBTSxrQkFBa0IsS0FBSyxLQUFLLGFBQWEsS0FBSyxFQUFFLElBQUk7QUFBQSxJQUMxRCxXQUFXLFFBQVE7QUFBQSxJQUNuQixXQUFXLFNBQVM7QUFBQSxFQUN0QixFQUFPO0FBQUEsSUFDTCxXQUFXLFNBQVMsT0FBTyxNQUFNLE9BQU87QUFBQSxJQUN4QyxXQUFXLFVBQVUsT0FBTyxNQUFNLE9BQU87QUFBQTtBQUFBLEVBRzNDLE1BQU0sVUFBVSxLQUFLLElBQUksVUFBVSxRQUFRO0FBQUEsRUFFM0MsTUFBTSxXQUFXLFNBQVMsT0FBTyxNQUFNLE9BQU8sT0FBTyxXQUFXO0FBQUEsRUFDaEUsTUFBTSxXQUFXLFVBQVUsT0FBTyxNQUFNLE9BQU8sT0FBTyxXQUFXO0FBQUEsRUFFakUsT0FBTyxpQkFDTCxRQUFRLElBQUksQ0FBQyxZQUFZO0FBQUEsSUFDdkIsUUFBUSxVQUFVLE9BQU87QUFBQSxJQUN6QixHQUFHLFVBQVUsV0FBVyxPQUFPLElBQUksT0FBTyxPQUFPO0FBQUEsSUFDakQsR0FBRyxVQUFVLFdBQVcsT0FBTyxJQUFJLE9BQU8sT0FBTztBQUFBLElBQ2pELE9BQU8sT0FBTztBQUFBLEVBQ2hCLEVBQUUsQ0FDSjtBQUFBO0FBT0YsU0FBUyxnQkFBZ0IsQ0FBQyxTQUFTO0FBQUEsRUFFakMsTUFBTSxJQUFJLENBQUM7QUFBQSxFQUNYLFdBQVcsVUFBVSxTQUFTO0FBQUEsSUFDNUIsRUFBRSxPQUFPLFNBQVM7QUFBQSxFQUNwQjtBQUFBLEVBQ0EsT0FBTztBQUFBO0FBTVQsU0FBUyxrQkFBa0IsQ0FBQyxVQUFVO0FBQUEsRUFDcEMsTUFBTSxTQUFTLE9BQU8sS0FBSyxRQUFRO0FBQUEsRUFDbkMsT0FBTyxPQUFPLElBQUksQ0FBQyxPQUFPLE9BQU8sT0FBTyxTQUFTLEtBQUssRUFBRSxPQUFPLEdBQUcsQ0FBQyxDQUFDO0FBQUE7QUFrQnRFLFNBQVMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxHQUFHO0FBQUEsRUFDakMsSUFBSSxhQUFhLE9BQ2YsUUFBUSxLQUNSLFNBQVMsS0FDVCxVQUFVLElBQ1YsV0FBVyxNQUNYLGNBQWMsS0FBSyxLQUFLLEdBQ3hCLFlBQVksTUFDWixhQUFhLE1BQ2IsT0FBTyxNQUNQLFNBQVMsTUFDVCxXQUFXLE1BQ1gsbUJBQW1CLE1BQ25CLFdBQVcsT0FDWCxRQUFRLE1BQ1Isd0JBQXdCLFdBQVcsUUFBUSx3QkFBd0IsUUFBUSx3QkFBd0IsT0FHbkcsWUFBWSxDQUFDLEdBSWIsZUFDRSxXQUFXLFFBQVEsZUFDZixRQUFRLGVBQ1IsV0FBVyxRQUFRLGNBQ2pCLFFBQVEsY0FDUjtBQUFBLElBQ0U7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGLEdBQ1IsY0FBYyxHQUNkLFVBQVUsUUFBUyxDQUFDLEtBQUs7QUFBQSxJQUN2QixJQUFJLE9BQU8sV0FBVztBQUFBLE1BQ3BCLE9BQU8sVUFBVTtBQUFBLElBQ25CO0FBQUEsSUFDQSxJQUFJLE1BQU8sVUFBVSxPQUFPLGFBQWE7QUFBQSxJQUN6QyxlQUFlO0FBQUEsSUFDZixJQUFJLGVBQWUsYUFBYSxRQUFRO0FBQUEsTUFDdEMsY0FBYztBQUFBLElBQ2hCO0FBQUEsSUFDQSxPQUFPO0FBQUEsS0FFVCxpQkFBaUIsTUFDakIsT0FBTztBQUFBLEVBRVQsU0FBUyxLQUFLLENBQUMsV0FBVztBQUFBLElBQ3hCLElBQUksT0FBTyxVQUFVLE1BQU07QUFBQSxJQUczQixNQUFNLFdBQVcsSUFBSTtBQUFBLElBQ3JCLEtBQUssUUFBUSxDQUFDLFVBQVU7QUFBQSxNQUN0QixJQUFJLE1BQU0sUUFBUSxLQUFLLE1BQU0sS0FBSyxVQUFVLEdBQUc7QUFBQSxRQUM3QyxTQUFTLElBQUksTUFBTSxLQUFLLEVBQUU7QUFBQSxNQUM1QjtBQUFBLEtBQ0Q7QUFBQSxJQUNELE9BQU8sS0FBSyxPQUFPLENBQUMsVUFBVSxDQUFDLE1BQU0sS0FBSyxLQUFLLENBQUMsUUFBUSxTQUFTLElBQUksR0FBRyxDQUFDLENBQUM7QUFBQSxJQUUxRSxJQUFJLFVBQVUsQ0FBQztBQUFBLElBQ2YsSUFBSSxjQUFjLENBQUM7QUFBQSxJQUVuQixJQUFJLEtBQUssU0FBUyxHQUFHO0FBQUEsTUFDbkIsSUFBSSxXQUFXLGVBQWUsTUFBTSxFQUFFLGNBQWMsTUFBTSxTQUFTLENBQUM7QUFBQSxNQUVwRSxJQUFJLFdBQVc7QUFBQSxRQUNiLFdBQVcsa0JBQWtCLFVBQVUsYUFBYSxnQkFBZ0I7QUFBQSxNQUN0RTtBQUFBLE1BRUEsVUFBVSxjQUFjLFVBQVUsT0FBTyxRQUFRLFNBQVMsVUFBVTtBQUFBLE1BQ3BFLGNBQWMsbUJBQW1CLFNBQVMsTUFBTSxxQkFBcUI7QUFBQSxJQUN2RTtBQUFBLElBSUEsTUFBTSxTQUFTLENBQUM7QUFBQSxJQUNoQixLQUFLLFFBQVEsQ0FBQyxVQUFVO0FBQUEsTUFDdEIsSUFBSSxNQUFNLE9BQU87QUFBQSxRQUNmLE9BQU8sTUFBTSxRQUFRLE1BQU07QUFBQSxNQUM3QjtBQUFBLEtBQ0Q7QUFBQSxJQUVELFNBQVMsS0FBSyxDQUFDLEdBQUc7QUFBQSxNQUNoQixJQUFJLEVBQUUsUUFBUSxRQUFRO0FBQUEsUUFDcEIsT0FBTyxPQUFPLEVBQUU7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsSUFBSSxFQUFFLEtBQUssVUFBVSxHQUFHO0FBQUEsUUFDdEIsT0FBTyxLQUFLLEVBQUUsS0FBSztBQUFBLE1BQ3JCO0FBQUE7QUFBQSxJQUlGLFVBQVUsVUFBVSxLQUFLLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLE1BQU0sRUFBRSxPQUFPLEtBQUs7QUFBQSxJQUUvRCxNQUFNLE1BQU0sVUFBVSxPQUFPLEtBQUs7QUFBQSxJQUVsQyxJQUFJLFlBQVk7QUFBQSxNQUNkLElBQUksS0FBSyxXQUFXLE9BQU8sU0FBUyxRQUFRO0FBQUEsSUFDOUMsRUFBTztBQUFBLE1BQ0wsSUFBSSxLQUFLLFNBQVMsS0FBSyxFQUFFLEtBQUssVUFBVSxNQUFNO0FBQUE7QUFBQSxJQUtoRCxNQUFNLFdBQVcsQ0FBQztBQUFBLElBQ2xCLElBQUksY0FBYztBQUFBLElBQ2xCLElBQUksVUFBVSxpQkFBaUIsRUFBRSxLQUFLLFFBQVMsQ0FBQyxHQUFHO0FBQUEsTUFDakQsTUFBTSxPQUFPLEtBQUssYUFBYSxHQUFHO0FBQUEsTUFDbEMsSUFBSSxFQUFFLEtBQUssVUFBVSxLQUFLLFFBQVEsQ0FBQyxVQUFVO0FBQUEsUUFDM0MsY0FBYztBQUFBLFFBQ2QsU0FBUyxFQUFFLEtBQUssTUFBTSxlQUFlLElBQUk7QUFBQSxNQUMzQztBQUFBLEtBQ0Q7QUFBQSxJQUdELFNBQVMsU0FBUyxDQUFDLEdBQUc7QUFBQSxNQUNwQixPQUFPLENBQUMsTUFBTTtBQUFBLFFBQ1osTUFBTSxJQUFJLEVBQUUsS0FBSyxJQUFJLENBQUMsUUFBUTtBQUFBLFVBQzVCLElBQUksUUFBUSxTQUFTO0FBQUEsVUFDckIsSUFBSSxNQUFNLFFBQVE7QUFBQSxVQUNsQixJQUFJLENBQUMsT0FBTztBQUFBLFlBQ1YsUUFBUSxFQUFFLEdBQUcsUUFBUSxHQUFHLEdBQUcsU0FBUyxHQUFHLFFBQVEsRUFBRTtBQUFBLFVBQ25EO0FBQUEsVUFDQSxJQUFJLENBQUMsS0FBSztBQUFBLFlBQ1IsTUFBTSxFQUFFLEdBQUcsUUFBUSxHQUFHLEdBQUcsU0FBUyxHQUFHLFFBQVEsRUFBRTtBQUFBLFVBQ2pEO0FBQUEsVUFDQSxPQUFPO0FBQUEsWUFDTCxHQUFHLE1BQU0sS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJO0FBQUEsWUFDL0IsR0FBRyxNQUFNLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSTtBQUFBLFlBQy9CLFFBQVEsTUFBTSxVQUFVLElBQUksS0FBSyxJQUFJLFNBQVM7QUFBQSxVQUNoRDtBQUFBLFNBQ0Q7QUFBQSxRQUNELE9BQU8scUJBQXFCLEdBQUcsS0FBSztBQUFBO0FBQUE7QUFBQSxJQUt4QyxNQUFNLFFBQVEsSUFBSSxVQUFVLFlBQVksRUFBRSxLQUFLLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSTtBQUFBLElBR2xFLE1BQU0sUUFBUSxNQUNYLE1BQU0sRUFDTixPQUFPLEdBQUcsRUFDVixLQUNDLFNBQ0EsQ0FBQyxNQUNDLGtCQUFrQixFQUFFLEtBQUssVUFBVSxJQUFJLFdBQVcsaUJBQ2hELEVBQUUsVUFBVSxFQUFFLFFBQVEsbUJBQW1CLElBRS9DLEVBQ0MsS0FBSyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsS0FBSyxLQUFLLEdBQUcsQ0FBQztBQUFBLElBRWpELE1BQU0sWUFBWSxNQUFNLE9BQU8sTUFBTTtBQUFBLElBQ3JDLE1BQU0sWUFBWSxNQUNmLE9BQU8sTUFBTSxFQUNiLEtBQUssU0FBUyxPQUFPLEVBQ3JCLEtBQUssQ0FBQyxNQUFNLE1BQU0sQ0FBQyxDQUFDLEVBQ3BCLEtBQUssZUFBZSxRQUFRLEVBQzVCLEtBQUssTUFBTSxPQUFPLEVBQ2xCLEtBQUssS0FBSyxRQUFRLENBQUMsRUFDbkIsS0FBSyxLQUFLLFNBQVMsQ0FBQztBQUFBLElBR3ZCLElBQUksUUFBUTtBQUFBLE1BQ1YsVUFDRyxNQUFNLGdCQUFnQixHQUFHLEVBQ3pCLE9BQU8sQ0FBQyxNQUFNLEVBQUUsS0FBSyxVQUFVLENBQUMsRUFDaEMsTUFBTSxRQUFRLENBQUMsTUFBTyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsUUFBUSxFQUFFLElBQUksQ0FBRSxFQUNoRixNQUFNLGdCQUFnQixLQUFLO0FBQUEsTUFFOUIsVUFBVSxNQUFNLFFBQVEsQ0FBQyxNQUFNO0FBQUEsUUFDN0IsSUFBSSxFQUFFLFVBQVUsRUFBRSxPQUFPO0FBQUEsVUFDdkIsT0FBTztBQUFBLFFBQ1Q7QUFBQSxRQUNBLElBQUksUUFBUSxVQUFVO0FBQUEsVUFDcEIsT0FBTyxRQUFRO0FBQUEsUUFDakI7QUFBQSxRQUNBLE9BQU8sRUFBRSxLQUFLLFVBQVUsSUFBSSxRQUFRLEVBQUUsSUFBSSxJQUFJO0FBQUEsT0FDL0M7QUFBQSxJQUNIO0FBQUEsSUFFQSxTQUFTLFlBQVksQ0FBQyxHQUFHO0FBQUEsTUFDdkIsSUFBSSxPQUFPLEVBQUUsZUFBZSxZQUFZO0FBQUEsUUFDdEMsT0FBTyxFQUFFLFdBQVcsTUFBTSxFQUFFLFNBQVMsUUFBUTtBQUFBLE1BQy9DO0FBQUEsTUFDQSxPQUFPO0FBQUE7QUFBQSxJQUlULElBQUksU0FBUztBQUFBLElBQ2IsSUFBSSxlQUFlLE9BQU8sT0FBTyxlQUFlLFlBQVk7QUFBQSxNQUMxRCxTQUFTLGFBQWEsU0FBUztBQUFBLE1BQy9CLE9BQU8sVUFBVSxNQUFNLEVBQUUsVUFBVSxLQUFLLFNBQVM7QUFBQSxJQUNuRCxFQUFPO0FBQUEsTUFDTCxPQUFPLFVBQVUsTUFBTSxFQUFFLEtBQUssS0FBSyxDQUFDLE1BQU0scUJBQXFCLEVBQUUsS0FBSyxJQUFJLENBQUMsUUFBUSxRQUFRLElBQUksQ0FBQyxHQUFHLEtBQUs7QUFBQTtBQUFBLElBRzFHLE1BQU0sYUFBYSxPQUNoQixVQUFVLE1BQU0sRUFDaEIsT0FBTyxDQUFDLE9BQU0sRUFBRSxRQUFRLFlBQVcsRUFDbkMsS0FBSyxDQUFDLE1BQU0sTUFBTSxDQUFDLENBQUMsRUFDcEIsS0FBSyxLQUFLLENBQUMsTUFBTSxLQUFLLE1BQU0sWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQ2xELEtBQUssS0FBSyxDQUFDLE1BQU0sS0FBSyxNQUFNLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQztBQUFBLElBRXJELElBQUksTUFBTTtBQUFBLE1BQ1IsSUFBSSxhQUFhO0FBQUEsUUFHZixJQUFJLFFBQVEsWUFBWTtBQUFBLFVBQ3RCLFdBQVcsR0FBRyxPQUFPLFNBQVMsU0FBUyxLQUFLLENBQUM7QUFBQSxRQUMvQyxFQUFPO0FBQUEsVUFDTCxXQUFXLEtBQUssT0FBTyxTQUFTLFNBQVMsS0FBSyxDQUFDO0FBQUE7QUFBQSxNQUVuRCxFQUFPO0FBQUEsUUFDTCxXQUFXLEtBQUssU0FBUyxTQUFTLEtBQUssQ0FBQztBQUFBO0FBQUEsSUFFNUM7QUFBQSxJQUdBLE1BQU0sT0FBTyxhQUFhLE1BQU0sS0FBSyxDQUFDLEVBQUUsT0FBTztBQUFBLElBQy9DLElBQUksT0FBTyxNQUFNLGVBQWUsWUFBWTtBQUFBLE1BQzFDLEtBQUssVUFBVSxNQUFNLEVBQUUsVUFBVSxLQUFLLFNBQVM7QUFBQSxJQUNqRDtBQUFBLElBRUEsTUFBTSxXQUFXLEtBQ2QsVUFBVSxNQUFNLEVBQ2hCLEtBQUssS0FBSyxRQUFRLENBQUMsRUFDbkIsS0FBSyxLQUFLLFNBQVMsQ0FBQztBQUFBLElBSXZCLElBQUksYUFBYSxNQUFNO0FBQUEsTUFDckIsVUFBVSxNQUFNLGFBQWEsS0FBSztBQUFBLE1BQ2xDLFdBQVcsTUFBTSxhQUFhLFFBQVE7QUFBQSxNQUN0QyxTQUFTLE1BQU0sYUFBYSxLQUFLO0FBQUEsSUFDbkM7QUFBQSxJQUVBLE9BQU8sRUFBRSxTQUFTLGFBQWEsT0FBTyxPQUFPLFFBQVEsS0FBSztBQUFBO0FBQUEsRUFHNUQsTUFBTSxPQUFPLFFBQVMsQ0FBQyxHQUFHO0FBQUEsSUFDeEIsSUFBSSxDQUFDLFVBQVU7QUFBQSxNQUFRLE9BQU87QUFBQSxJQUM5QixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUE7QUFBQSxFQUdULE1BQU0sYUFBYSxRQUFTLEdBQUc7QUFBQSxJQUM3QixhQUFhO0FBQUEsSUFDYixPQUFPO0FBQUE7QUFBQSxFQUdULE1BQU0sUUFBUSxRQUFTLENBQUMsR0FBRztBQUFBLElBQ3pCLElBQUksQ0FBQyxVQUFVO0FBQUEsTUFBUSxPQUFPO0FBQUEsSUFDOUIsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBO0FBQUEsRUFHVCxNQUFNLFNBQVMsUUFBUyxDQUFDLEdBQUc7QUFBQSxJQUMxQixJQUFJLENBQUMsVUFBVTtBQUFBLE1BQVEsT0FBTztBQUFBLElBQzlCLFNBQVM7QUFBQSxJQUNULE9BQU87QUFBQTtBQUFBLEVBR1QsTUFBTSxVQUFVLFFBQVMsQ0FBQyxHQUFHO0FBQUEsSUFDM0IsSUFBSSxDQUFDLFVBQVU7QUFBQSxNQUFRLE9BQU87QUFBQSxJQUM5QixVQUFVO0FBQUEsSUFDVixPQUFPO0FBQUE7QUFBQSxFQUdULE1BQU0sV0FBVyxRQUFTLENBQUMsR0FBRztBQUFBLElBQzVCLElBQUksQ0FBQyxVQUFVO0FBQUEsTUFBUSxPQUFPO0FBQUEsSUFDOUIsV0FBVztBQUFBLElBQ1gsT0FBTztBQUFBO0FBQUEsRUFHVCxNQUFNLFVBQVUsUUFBUyxDQUFDLEdBQUc7QUFBQSxJQUMzQixJQUFJLENBQUMsVUFBVTtBQUFBLE1BQVEsT0FBTztBQUFBLElBQzlCLFVBQVU7QUFBQSxJQUNWLE9BQU87QUFBQTtBQUFBLEVBR1QsTUFBTSxTQUFTLFFBQVMsQ0FBQyxHQUFHO0FBQUEsSUFDMUIsSUFBSSxDQUFDLFVBQVU7QUFBQSxNQUFRLE9BQU87QUFBQSxJQUM5QixVQUFVO0FBQUEsSUFDVixPQUFPO0FBQUE7QUFBQSxFQUdULE1BQU0sV0FBVyxRQUFTLENBQUMsR0FBRztBQUFBLElBQzVCLElBQUksQ0FBQyxVQUFVO0FBQUEsTUFBUSxPQUFPO0FBQUEsSUFDOUIsV0FBVztBQUFBLElBQ1gsT0FBTztBQUFBO0FBQUEsRUFHVCxNQUFNLFFBQVEsUUFBUyxDQUFDLEdBQUc7QUFBQSxJQUN6QixJQUFJLENBQUMsVUFBVTtBQUFBLE1BQVEsT0FBTztBQUFBLElBQzlCLFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQTtBQUFBLEVBR1QsTUFBTSxXQUFXLFFBQVMsQ0FBQyxHQUFHO0FBQUEsSUFDNUIsSUFBSSxDQUFDLFVBQVU7QUFBQSxNQUFRLE9BQU87QUFBQSxJQUM5QixXQUFXO0FBQUEsSUFDWCxPQUFPO0FBQUE7QUFBQSxFQUdULE1BQU0saUJBQWlCLFFBQVMsQ0FBQyxHQUFHO0FBQUEsSUFDbEMsSUFBSSxDQUFDLFVBQVU7QUFBQSxNQUFRLE9BQU87QUFBQSxJQUM5QixpQkFBaUI7QUFBQSxJQUNqQixPQUFPO0FBQUE7QUFBQSxFQUdULE1BQU0sWUFBWSxRQUFTLENBQUMsR0FBRztBQUFBLElBQzdCLElBQUksQ0FBQyxVQUFVO0FBQUEsTUFBUSxPQUFPO0FBQUEsSUFDOUIsWUFBWTtBQUFBLElBQ1osT0FBTztBQUFBO0FBQUEsRUFHVCxNQUFNLGFBQWEsUUFBUyxDQUFDLEdBQUc7QUFBQSxJQUM5QixJQUFJLENBQUMsVUFBVTtBQUFBLE1BQVEsT0FBTztBQUFBLElBQzlCLGFBQWE7QUFBQSxJQUNiLE9BQU87QUFBQTtBQUFBLEVBR1QsTUFBTSxTQUFTLFFBQVMsQ0FBQyxHQUFHO0FBQUEsSUFDMUIsSUFBSSxDQUFDLFVBQVU7QUFBQSxNQUFRLE9BQU87QUFBQSxJQUM5QixTQUFTO0FBQUEsSUFDVCxPQUFPO0FBQUE7QUFBQSxFQUdULE1BQU0sY0FBYyxRQUFTLENBQUMsR0FBRztBQUFBLElBQy9CLElBQUksQ0FBQyxVQUFVO0FBQUEsTUFBUSxPQUFPO0FBQUEsSUFDOUIsY0FBYztBQUFBLElBQ2QsT0FBTztBQUFBO0FBQUEsRUFHVCxNQUFNLG1CQUFtQixRQUFTLENBQUMsR0FBRztBQUFBLElBQ3BDLElBQUksQ0FBQyxVQUFVO0FBQUEsTUFBUSxPQUFPO0FBQUEsSUFDOUIsbUJBQW1CO0FBQUEsSUFDbkIsT0FBTztBQUFBO0FBQUEsRUFHVCxNQUFNLGVBQWUsUUFBUyxDQUFDLEdBQUc7QUFBQSxJQUNoQyxJQUFJLENBQUMsVUFBVTtBQUFBLE1BQVEsT0FBTztBQUFBLElBQzlCLE9BQU8sTUFBTSxZQUFZLGVBQWUsTUFBTSxhQUFhLHVCQUF1QjtBQUFBLElBQ2xGLE9BQU87QUFBQTtBQUFBLEVBR1QsT0FBTztBQUFBO0FBVVQsU0FBUyxRQUFRLENBQUMsU0FBUyxVQUFVO0FBQUEsRUFDbkMsT0FBTyxRQUFTLENBQUMsTUFBTTtBQUFBLElBQ3JCLE1BQU0sT0FBTztBQUFBLElBQ2IsTUFBTSxRQUFRLFFBQVEsS0FBSyxLQUFLLElBQUksVUFBVTtBQUFBLElBQzlDLE1BQU0sUUFBUSxTQUFTLElBQUksS0FBSztBQUFBLElBRWhDLE1BQU0sUUFBUSxNQUFNLE1BQU0sS0FBSyxFQUFFLFFBQVE7QUFBQSxJQUN6QyxNQUFNLFdBQVc7QUFBQSxJQUNqQixNQUFNLFlBQVksTUFBTSxTQUFTLE1BQU0sVUFBVTtBQUFBLElBRWpELElBQUksT0FBTyxNQUFNLElBQUk7QUFBQSxJQUNyQixJQUFJLE9BQU8sQ0FBQyxJQUFJO0FBQUEsSUFDaEIsSUFBSSxhQUFhO0FBQUEsSUFDakIsTUFBTSxhQUFhO0FBQUEsSUFDbkIsS0FBSyxjQUFjO0FBQUEsSUFDbkIsTUFBTSxTQUFTLENBQUM7QUFBQSxJQUVoQixTQUFTLE1BQU0sQ0FBQyxPQUFNO0FBQUEsTUFDcEIsTUFBTSxTQUFRLEtBQUssY0FBYyxnQkFBZ0IsS0FBSyxjQUFjLE9BQU87QUFBQSxNQUMzRSxPQUFNLGNBQWM7QUFBQSxNQUNwQixPQUFPLEtBQUssTUFBSztBQUFBLE1BQ2pCLEtBQUssT0FBTyxNQUFLO0FBQUEsTUFDakIsT0FBTztBQUFBO0FBQUEsSUFFVCxJQUFJLFFBQVEsT0FBTyxJQUFJO0FBQUEsSUFFdkIsT0FBTyxNQUFNO0FBQUEsTUFDWCxPQUFPLE1BQU0sSUFBSTtBQUFBLE1BQ2pCLElBQUksQ0FBQyxNQUFNO0FBQUEsUUFDVDtBQUFBLE1BQ0Y7QUFBQSxNQUNBLEtBQUssS0FBSyxJQUFJO0FBQUEsTUFDZCxNQUFNLFNBQVMsS0FBSyxLQUFLLEdBQUc7QUFBQSxNQUM1QixNQUFNLGNBQWM7QUFBQSxNQUNwQixJQUFJLE9BQU8sU0FBUyxZQUFZLE1BQU0sc0JBQXNCLElBQUksT0FBTztBQUFBLFFBQ3JFLEtBQUssSUFBSTtBQUFBLFFBQ1QsTUFBTSxjQUFjLEtBQUssS0FBSyxHQUFHO0FBQUEsUUFDakMsT0FBTyxDQUFDLElBQUk7QUFBQSxRQUNaLFFBQVEsT0FBTyxJQUFJO0FBQUEsUUFDbkI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBRUEsTUFBTSxVQUFVLE9BQVEsYUFBYSxhQUFjO0FBQUEsSUFDbkQsTUFBTSxJQUFJLEtBQUssYUFBYSxHQUFHO0FBQUEsSUFDL0IsTUFBTSxJQUFJLEtBQUssYUFBYSxHQUFHO0FBQUEsSUFDL0IsT0FBTyxRQUFRLENBQUMsR0FBRyxNQUFNO0FBQUEsTUFDdkIsRUFBRSxhQUFhLEtBQUssQ0FBQztBQUFBLE1BQ3JCLEVBQUUsYUFBYSxLQUFLLENBQUM7QUFBQSxNQUNyQixFQUFFLGFBQWEsTUFBTSxHQUFHLFVBQVUsSUFBSSxjQUFjO0FBQUEsS0FDckQ7QUFBQTtBQUFBO0FBV0wsU0FBUyxZQUFZLENBQUMsU0FBUyxVQUFVLFVBQVU7QUFBQSxFQUNqRCxJQUFJLFNBQVMsU0FBUyxHQUFHLFNBQVMsU0FBUyxTQUFTLElBQUksT0FBTztBQUFBLEVBRS9ELFNBQVMsSUFBSSxFQUFHLElBQUksU0FBUyxRQUFRLEVBQUUsR0FBRztBQUFBLElBQ3hDLE1BQU0sSUFBSSxTQUFTLEdBQUcsU0FBUyxTQUFTLFNBQVMsSUFBSSxPQUFPO0FBQUEsSUFDNUQsSUFBSSxLQUFLLFFBQVE7QUFBQSxNQUNmLFNBQVM7QUFBQSxJQUNYO0FBQUEsRUFDRjtBQUFBLEVBRUEsU0FBUyxJQUFJLEVBQUcsSUFBSSxTQUFTLFFBQVEsRUFBRSxHQUFHO0FBQUEsSUFDeEMsTUFBTSxJQUFJLFNBQVMsU0FBUyxJQUFJLE9BQU8sSUFBSSxTQUFTLEdBQUc7QUFBQSxJQUN2RCxJQUFJLEtBQUssUUFBUTtBQUFBLE1BQ2YsU0FBUztBQUFBLElBQ1g7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUE7QUFZVCxTQUFTLGlCQUFpQixDQUFDLFVBQVUsVUFBVSx1QkFBdUI7QUFBQSxFQUlwRSxNQUFNLFNBQVMsQ0FBQztBQUFBLEVBQ2hCLFdBQVcsS0FBSyxVQUFVO0FBQUEsSUFDeEIsT0FBTyxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQztBQUFBLElBQzlCLE9BQU8sS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsU0FBUyxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFBQSxJQUM3QyxPQUFPLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLFNBQVMsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDO0FBQUEsSUFDN0MsT0FBTyxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQztBQUFBLElBQzdDLE9BQU8sS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUM7QUFBQSxFQUMvQztBQUFBLEVBRUEsSUFBSSxVQUFVLE9BQU87QUFBQSxFQUNyQixJQUFJLFNBQVMsYUFBYSxPQUFPLElBQUksVUFBVSxRQUFRO0FBQUEsRUFFdkQsU0FBUyxJQUFJLEVBQUcsSUFBSSxPQUFPLFFBQVEsRUFBRSxHQUFHO0FBQUEsSUFDdEMsTUFBTSxJQUFJLGFBQWEsT0FBTyxJQUFJLFVBQVUsUUFBUTtBQUFBLElBQ3BELElBQUksS0FBSyxRQUFRO0FBQUEsTUFDZixVQUFVLE9BQU87QUFBQSxNQUNqQixTQUFTO0FBQUEsSUFDWDtBQUFBLEVBQ0Y7QUFBQSxFQUdBLE1BQU0sV0FBVyxXQUNmLENBQUMsTUFBTSxLQUFLLGFBQWEsRUFBRSxHQUFHLEVBQUUsSUFBSSxHQUFHLEVBQUUsR0FBRyxHQUFHLFVBQVUsUUFBUSxHQUNqRSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsR0FDckIsRUFBRSxlQUFlLEtBQUssZUFBZSxhQUFNLENBQzdDLEVBQUU7QUFBQSxFQUVGLE1BQU0sTUFBTSxFQUFFLEdBQUcsd0JBQXdCLElBQUksU0FBUyxJQUFJLEdBQUcsU0FBUyxHQUFHO0FBQUEsRUFJekUsSUFBSSxRQUFRO0FBQUEsRUFDWixXQUFXLEtBQUssVUFBVTtBQUFBLElBQ3hCLElBQUksU0FBUyxLQUFLLENBQUMsSUFBSSxFQUFFLFFBQVE7QUFBQSxNQUMvQixRQUFRO0FBQUEsTUFDUjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFFQSxXQUFXLEtBQUssVUFBVTtBQUFBLElBQ3hCLElBQUksU0FBUyxLQUFLLENBQUMsSUFBSSxFQUFFLFFBQVE7QUFBQSxNQUMvQixRQUFRO0FBQUEsTUFDUjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxJQUFJLE9BQU87QUFBQSxJQUNULE9BQU87QUFBQSxFQUNUO0FBQUEsRUFFQSxJQUFJLFNBQVMsVUFBVSxHQUFHO0FBQUEsSUFDeEIsT0FBTyxFQUFFLEdBQUcsU0FBUyxHQUFHLEdBQUcsR0FBRyxTQUFTLEdBQUcsRUFBRTtBQUFBLEVBQzlDO0FBQUEsRUFDQSxNQUFNLFlBQVksQ0FBQztBQUFBLEVBQ25CLGlCQUFpQixVQUFVLFNBQVM7QUFBQSxFQUVwQyxJQUFJLFVBQVUsS0FBSyxXQUFXLEdBQUc7QUFBQSxJQUMvQixPQUFPLEVBQUUsR0FBRyxHQUFHLEdBQUcsT0FBTyxVQUFVLEtBQUs7QUFBQSxFQUMxQztBQUFBLEVBQ0EsSUFBSSxVQUFVLEtBQUssVUFBVSxHQUFHO0FBQUEsSUFDOUIsT0FBTyxFQUFFLEdBQUcsVUFBVSxLQUFLLEdBQUcsT0FBTyxHQUFHLEdBQUcsVUFBVSxLQUFLLEdBQUcsT0FBTyxFQUFFO0FBQUEsRUFDeEU7QUFBQSxFQUNBLElBQUksU0FBUyxRQUFRO0FBQUEsSUFFbkIsT0FBTyxrQkFBa0IsVUFBVSxDQUFDLENBQUM7QUFBQSxFQUN2QztBQUFBLEVBS0EsT0FBTyxVQUFVLFVBQVUsS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztBQUFBO0FBS2xELFNBQVMscUJBQXFCLENBQUMsU0FBUztBQUFBLEVBQ3RDLE1BQU0sTUFBTSxDQUFDO0FBQUEsRUFDYixNQUFNLFlBQVksT0FBTyxLQUFLLE9BQU87QUFBQSxFQUNyQyxXQUFXLFlBQVksV0FBVztBQUFBLElBQ2hDLElBQUksWUFBWSxDQUFDO0FBQUEsRUFDbkI7QUFBQSxFQUNBLFNBQVMsSUFBSSxFQUFHLElBQUksVUFBVSxRQUFRLEtBQUs7QUFBQSxJQUN6QyxNQUFNLEtBQUssVUFBVTtBQUFBLElBQ3JCLE1BQU0sSUFBSSxRQUFRO0FBQUEsSUFDbEIsU0FBUyxJQUFJLElBQUksRUFBRyxJQUFJLFVBQVUsUUFBUSxFQUFFLEdBQUc7QUFBQSxNQUM3QyxNQUFNLEtBQUssVUFBVTtBQUFBLE1BQ3JCLE1BQU0sSUFBSSxRQUFRO0FBQUEsTUFDbEIsTUFBTSxJQUFJLFNBQVMsR0FBRyxDQUFDO0FBQUEsTUFFdkIsSUFBSSxJQUFJLEVBQUUsVUFBVSxFQUFFLFNBQVMsY0FBTztBQUFBLFFBQ3BDLElBQUksSUFBSSxLQUFLLEVBQUU7QUFBQSxNQUNqQixFQUFPLFNBQUksSUFBSSxFQUFFLFVBQVUsRUFBRSxTQUFTLGNBQU87QUFBQSxRQUMzQyxJQUFJLElBQUksS0FBSyxFQUFFO0FBQUEsTUFDakI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBO0FBR1QsU0FBUyxrQkFBa0IsQ0FBQyxTQUFTLE9BQU8sdUJBQXVCO0FBQUEsRUFDakUsTUFBTSxNQUFNLENBQUM7QUFBQSxFQUNiLE1BQU0sYUFBYSxzQkFBc0IsT0FBTztBQUFBLEVBQ2hELFNBQVMsSUFBSSxFQUFHLElBQUksTUFBTSxRQUFRLEVBQUUsR0FBRztBQUFBLElBQ3JDLE1BQU0sT0FBTyxNQUFNLEdBQUc7QUFBQSxJQUN0QixNQUFNLFVBQVUsQ0FBQztBQUFBLElBQ2pCLE1BQU0sVUFBVSxDQUFDO0FBQUEsSUFFakIsU0FBUyxJQUFJLEVBQUcsSUFBSSxLQUFLLFFBQVEsRUFBRSxHQUFHO0FBQUEsTUFDcEMsUUFBUSxLQUFLLE1BQU07QUFBQSxNQUNuQixNQUFNLFdBQVcsV0FBVyxLQUFLO0FBQUEsTUFJakMsU0FBUyxJQUFJLEVBQUcsSUFBSSxTQUFTLFFBQVEsRUFBRSxHQUFHO0FBQUEsUUFDeEMsUUFBUSxTQUFTLE1BQU07QUFBQSxNQUN6QjtBQUFBLElBQ0Y7QUFBQSxJQUVBLE1BQU0sV0FBVyxDQUFDO0FBQUEsSUFDbEIsTUFBTSxXQUFXLENBQUM7QUFBQSxJQUNsQixTQUFTLFNBQVMsU0FBUztBQUFBLE1BQ3pCLElBQUksU0FBUyxTQUFTO0FBQUEsUUFDcEIsU0FBUyxLQUFLLFFBQVEsTUFBTTtBQUFBLE1BQzlCLEVBQU8sU0FBSSxFQUFFLFNBQVMsVUFBVTtBQUFBLFFBQzlCLFNBQVMsS0FBSyxRQUFRLE1BQU07QUFBQSxNQUM5QjtBQUFBLElBQ0Y7QUFBQSxJQUNBLE1BQU0sU0FBUyxrQkFBa0IsVUFBVSxVQUFVLHFCQUFxQjtBQUFBLElBQzFFLElBQUksUUFBUTtBQUFBLElBQ1osSUFBSSxPQUFPLFlBQVksTUFBTSxHQUFHLE9BQU8sR0FBRztBQUFBLE1BQ3hDLFFBQVEsSUFBSSxtQkFBbUIsT0FBTyw0QkFBNEI7QUFBQSxJQUNwRTtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQTtBQW9EVCxTQUFTLFVBQVUsQ0FBQyxHQUFHLEdBQUcsR0FBRztBQUFBLEVBQzNCLE1BQU0sTUFBTSxDQUFDO0FBQUEsRUFDYixJQUFJLEtBQUs7QUFBQSxJQUFPLEdBQUcsQ0FBQztBQUFBLEVBQ3BCLElBQUksS0FBSztBQUFBLElBQU8sQ0FBQyxHQUFHLENBQUM7QUFBQSxFQUNyQixJQUFJLEtBQUs7QUFBQSxJQUFPLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUFBLEVBQ3ZDLElBQUksS0FBSztBQUFBLElBQU8sR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUM7QUFBQSxFQUN4QyxPQUFPLElBQUksS0FBSyxHQUFHO0FBQUE7QUFRckIsU0FBUyxjQUFjLENBQUMsTUFBTTtBQUFBLEVBQzVCLE1BQU0sU0FBUyxLQUFLLE1BQU0sR0FBRztBQUFBLEVBQzdCLE9BQU8sRUFBRSxHQUFHLE9BQU8sV0FBVyxPQUFPLEVBQUUsR0FBRyxHQUFHLE9BQU8sV0FBVyxPQUFPLEVBQUUsR0FBRyxRQUFRLENBQUMsT0FBTyxXQUFXLE9BQU8sRUFBRSxFQUFFO0FBQUE7QUFHbkgsU0FBUyxvQkFBb0IsQ0FBQyxTQUFTO0FBQUEsRUFDckMsSUFBSSxRQUFRLFdBQVcsR0FBRztBQUFBLElBQ3hCLE9BQU8sQ0FBQztBQUFBLEVBQ1Y7QUFBQSxFQUNBLE1BQU0sUUFBUSxDQUFDO0FBQUEsRUFDZixpQkFBaUIsU0FBUyxLQUFLO0FBQUEsRUFDL0IsT0FBTyxNQUFNO0FBQUE7QUFHZixTQUFTLFVBQVUsQ0FBQyxNQUFNLE9BQU87QUFBQSxFQUMvQixJQUFJLEtBQUssV0FBVyxHQUFHO0FBQUEsSUFDckIsT0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUNBLE1BQU0sVUFBVSxLQUFLLElBQUksSUFBSSxTQUFTLENBQUM7QUFBQSxFQUN2QyxNQUFNLElBQUksU0FBUyxPQUFPLENBQUMsTUFBTSxLQUFLLE1BQU0sSUFBSSxPQUFPLElBQUksVUFBVSxDQUFDLE1BQU07QUFBQSxFQUM1RSxJQUFJLEtBQUssVUFBVSxHQUFHO0FBQUEsSUFDcEIsTUFBTSxTQUFTLEtBQUssR0FBRztBQUFBLElBQ3ZCLE9BQU8sV0FBVyxFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxPQUFPLE1BQU0sQ0FBQztBQUFBLEVBQzlEO0FBQUEsRUFFQSxNQUFNLE1BQU0sQ0FBQztBQUFBLElBQU8sRUFBRSxLQUFLLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFBQSxFQUNwRCxXQUFXLE9BQU8sTUFBTTtBQUFBLElBQ3RCLE1BQU0sU0FBUyxFQUFFLElBQUksT0FBTyxNQUFNO0FBQUEsSUFDbEMsSUFBSSxLQUFLO0FBQUEsSUFBTyxRQUFRLFFBQVEsR0FBRyxJQUFJLFFBQVEsSUFBSSxHQUFHLElBQUksUUFBUSxJQUFJLEdBQUcsRUFBRSxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQztBQUFBLEVBQ25HO0FBQUEsRUFDQSxPQUFPLElBQUksS0FBSyxHQUFHO0FBQUE7QUFRckIsU0FBUyxvQkFBb0IsQ0FBQyxTQUFTLE9BQU87QUFBQSxFQUM1QyxPQUFPLFdBQVcscUJBQXFCLE9BQU8sR0FBRyxLQUFLO0FBQUE7QUFHeEQsU0FBUyxNQUFNLENBQUMsTUFBTSxVQUFVLENBQUMsR0FBRztBQUFBLEVBQ2xDO0FBQUEsSUFDRSxjQUFjO0FBQUEsSUFDZCxnQkFBZ0IsVUFBUztBQUFBLElBQ3pCLFlBQVk7QUFBQSxJQUNaLGNBQWMsS0FBSyxLQUFLO0FBQUEsSUFDeEI7QUFBQSxJQUNBLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLGFBQWE7QUFBQSxJQUNiLHdCQUF3QjtBQUFBLElBQ3hCO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTjtBQUFBLEVBRUosSUFBSSxXQUFXLFFBQU8sTUFBTTtBQUFBLElBQzFCLGNBQWMsU0FBUyxhQUFhLENBQUMsT0FBTyxlQUFlLFNBQVMsYUFBYSx1QkFBdUI7QUFBQSxJQUN4RztBQUFBLEVBQ0YsQ0FBQztBQUFBLEVBRUQsSUFBSSxXQUFXO0FBQUEsSUFDYixXQUFXLGtCQUFrQixVQUFVLGFBQWEsZ0JBQWdCO0FBQUEsRUFDdEU7QUFBQSxFQUVBLE1BQU0sVUFBVSxjQUFjLFVBQVUsT0FBTyxRQUFRLFNBQVMsVUFBVTtBQUFBLEVBQzFFLE1BQU0sY0FBYyxtQkFBbUIsU0FBUyxNQUFNLHFCQUFxQjtBQUFBLEVBRTNFLE1BQU0sZUFBZSxJQUFJLElBQ3ZCLE9BQU8sS0FBSyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVE7QUFBQSxJQUNoQztBQUFBLElBQ0E7QUFBQSxNQUNFO0FBQUEsTUFDQSxHQUFHLFFBQVEsS0FBSztBQUFBLE1BQ2hCLEdBQUcsUUFBUSxLQUFLO0FBQUEsTUFDaEIsUUFBUSxRQUFRLEtBQUs7QUFBQSxJQUN2QjtBQUFBLEVBQ0YsQ0FBQyxDQUNIO0FBQUEsRUFDQSxNQUFNLFVBQVUsS0FBSyxJQUFJLENBQUMsU0FBUztBQUFBLElBQ2pDLE1BQU0sV0FBVSxLQUFLLEtBQUssSUFBSSxDQUFDLE1BQU0sYUFBYSxJQUFJLENBQUMsQ0FBQztBQUFBLElBQ3hELE1BQU0sT0FBTyxxQkFBcUIsUUFBTztBQUFBLElBQ3pDLE1BQU0sT0FBTyxXQUFXLE1BQU0sS0FBSztBQUFBLElBQ25DLE9BQU8sRUFBRSxtQkFBUyxNQUFNLE1BQU0sTUFBTSxLQUFLLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtBQUFBLEdBQzdEO0FBQUEsRUFFRCxTQUFTLGVBQWUsQ0FBQyxNQUFNO0FBQUEsSUFDN0IsSUFBSSxJQUFJO0FBQUEsSUFDUixXQUFXLEtBQUssU0FBUztBQUFBLE1BQ3ZCLElBQUksRUFBRSxJQUFJLE9BQU8sS0FBSyxVQUFVLEtBQUssTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUc7QUFBQSxRQUMvRCxLQUFLLE1BQU0sRUFBRTtBQUFBLE1BQ2Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPO0FBQUE7QUFBQSxFQUdULE9BQU8sUUFBUSxJQUFJLEdBQUcsbUJBQVMsTUFBTSxNQUFNLFdBQVc7QUFBQSxJQUNwRCxPQUFPO0FBQUEsTUFDTCxNQUFNO0FBQUEsTUFDTixNQUFNLFlBQVksS0FBSztBQUFBLE1BQ3ZCO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBLGNBQWMsT0FBTyxnQkFBZ0IsS0FBSyxJQUFJO0FBQUEsSUFDaEQ7QUFBQSxHQUNEO0FBQUE7OztBQzNvRUgsSUFBSSxTQUFVLFFBQVEsR0FBRztBQUFBLEVBQ3ZCLElBQUksb0JBQW9CLE9BQU8sUUFBUSxDQUFDLEdBQUcsR0FBRyxJQUFJLEdBQUc7QUFBQSxJQUNuRCxLQUFLLEtBQUssTUFBTSxDQUFDLEdBQUcsSUFBSSxFQUFFLE9BQVEsS0FBSyxHQUFHLEVBQUUsTUFBTTtBQUFBO0FBQUEsSUFDbEQsT0FBTztBQUFBLEtBQ04sR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7QUFBQSxFQUN2VyxJQUFJLFVBQVU7QUFBQSxJQUNaLHVCQUF1QixPQUFPLFNBQVMsS0FBSyxHQUFHLElBQzVDLE9BQU87QUFBQSxJQUNWLElBQUksQ0FBQztBQUFBLElBQ0wsVUFBVSxFQUFFLE9BQVMsR0FBRyxPQUFTLEdBQUcsYUFBZSxHQUFHLE1BQVEsR0FBRyxVQUFZLEdBQUcsS0FBTyxHQUFHLFNBQVcsR0FBRyxNQUFRLEdBQUcsV0FBYSxJQUFJLE9BQVMsSUFBSSxLQUFPLElBQUksWUFBYyxJQUFJLGVBQWlCLElBQUksT0FBUyxJQUFJLFNBQVcsSUFBSSxPQUFTLElBQUksZ0JBQWtCLElBQUksTUFBUSxJQUFJLFlBQWMsSUFBSSxRQUFVLElBQUksYUFBZSxJQUFJLGtCQUFvQixJQUFJLE9BQVMsSUFBSSxXQUFhLElBQUksWUFBYyxJQUFJLE9BQVMsSUFBSSxZQUFjLElBQUksYUFBZSxJQUFJLFlBQWMsSUFBSSxVQUFZLElBQUksVUFBWSxJQUFJLFdBQWEsSUFBSSxTQUFXLEdBQUcsTUFBUSxFQUFFO0FBQUEsSUFDdGhCLFlBQVksRUFBRSxHQUFHLFNBQVMsR0FBRyxRQUFRLEdBQUcsT0FBTyxHQUFHLFdBQVcsSUFBSSxTQUFTLElBQUksT0FBTyxJQUFJLGlCQUFpQixJQUFJLFNBQVMsSUFBSSxXQUFXLElBQUksU0FBUyxJQUFJLFFBQVEsSUFBSSxjQUFjLElBQUksVUFBVSxJQUFJLGVBQWUsSUFBSSxTQUFTLElBQUksU0FBUyxJQUFJLFlBQVksSUFBSSxZQUFZLElBQUksWUFBWTtBQUFBLElBQzVSLGNBQWMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUFBLElBQ3JaLCtCQUErQixPQUFPLFNBQVMsU0FBUyxDQUFDLFFBQVEsUUFBUSxVQUFVLElBQUksU0FBUyxJQUFJLElBQUk7QUFBQSxNQUN0RyxJQUFJLEtBQUssR0FBRyxTQUFTO0FBQUEs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LEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksSUFBSSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksR0FBRyxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFF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LFlBQVksQ0FBQyxFQUFFLEtBQUssWUFBWSxTQUFTO0FBQUEsTUFDNU4sTUFBTSxZQUFZLFdBQVcsSUFBSSxLQUFLLEVBQUUsR0FBRztBQUFBLE1BQzNDLE1BQU0sT0FBTyxVQUFVLE9BQU8sWUFBWSxFQUFFLEtBQUssU0FBUyxnQkFBZ0IsRUFBRSxNQUFNLFdBQVcsTUFBTSxFQUFFLE1BQU0sU0FBUyxNQUFNLEVBQUUsTUFBTSxVQUFVLE1BQU0sRUFBRSxNQUFNLGVBQWUsUUFBUSxFQUFFLE1BQU0sZUFBZSxRQUFRLEVBQUUsTUFBTSxtQkFBbUIsUUFBUSxFQUFFLE1BQU0sY0FBYyxRQUFRLEVBQUUsTUFBTSxpQkFBaUIsUUFBUSxFQUFFLE1BQU0sY0FBYyxRQUFRLEVBQUUsS0FBSyxLQUFLLFNBQVMsS0FBSyxFQUFFO0FBQUEsTUFDNVcsSUFBSSxXQUFXO0FBQUEsUUFDYixLQUFLLE1BQU0sU0FBUyxTQUFTO0FBQUEsTUFDL0I7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBO0FBRUYsT0FBTyxpQkFBaUIsaUJBQWlCO0FBQ3pDLElBQUksV0FBVyxFQUFFLEtBQUs7QUFHdEIsSUFBSSxVQUFVO0FBQUEsRUFDWixRQUFRO0FBQUEsRUFDUjtBQUFBLEVBQ0E7QUFBQSxFQUNBLFFBQVE7QUFDVjsiLAogICJkZWJ1Z0lkIjogIjRCMTI3M0FENTY5OTI5MDY2NDc1NkUyMTY0NzU2RTIxIiwKICAibmFtZXMiOiBbXQp9
