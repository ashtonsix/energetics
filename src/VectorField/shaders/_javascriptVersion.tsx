/* eslint-disable no-lone-blocks, no-eval */

import {substanceReactParse} from '../common';

type Texture = Vec4[][];
type Int = number;
type Float = number;
type Vec2 = [number, number];
type Vec4 = [number, number, number, number];
interface VecScalarOp {
  (a: number, b: number): number;
  (a: number, b: Vec2): Vec2;
  (a: number, b: Vec4): Vec4;
  (a: Vec2, b: number): Vec2;
  (a: Vec4, b: number): Vec4;
  (a: Vec2, b: Vec2): Vec2;
  (a: Vec4, b: Vec4): Vec4;
}

const {PI, sin, cos, atan2: atan, floor, round, abs, pow} = Math;
const PI2 = PI * 2.0;
const epsilon = 0.000000001;
const bigilon = 999999999.9;
const vec2 = (x: number, y: number): Vec2 => [x, y];
const vec4 = (x: number, y: number, z: number, w: number): Vec4 => [x, y, z, w];
const vecMap = (a, b, f) => {
  if (!a.length && !b.length) return f(a, b);
  if (a.length && !b.length) return a.map((a) => f(a, b));
  if (!a.length && b.length) return b.map((b) => f(a, b));
  if (a.length !== b.length) throw Error('dumb');
  return a.map((_, i) => f(a[i], b[i]));
};
const add: VecScalarOp = (a, b) => vecMap(a, b, (a, b) => a + b);
const sub: VecScalarOp = (a, b) => vecMap(a, b, (a, b) => a - b);
const mul: VecScalarOp = (a, b) => vecMap(a, b, (a, b) => a * b);
const div: VecScalarOp = (a, b) => vecMap(a, b, (a, b) => a / b);
const min: VecScalarOp = (a, b) => vecMap(a, b, (a, b) => Math.min(a, b));
const max: VecScalarOp = (a, b) => vecMap(a, b, (a, b) => Math.max(a, b));

function divSafe(a: number, b: number, c: number): number;
function divSafe(a: Vec2, b: number, c: number): Vec2;
function divSafe(a: Vec4, b: number, c: number): Vec4;
function divSafe(a: Vec2, b: Vec2, c: number): Vec2;
function divSafe(a: Vec4, b: Vec4, c: number): Vec4;
function divSafe(a: any, b: any, c: number): any {
  return vecMap(a, b, (a, b) => (b === 0.0 ? c : a / b));
}
const mod: VecScalarOp = (x, m) => vecMap(x, m, (x, m) => (x < 0 ? NaN : x % m));
function dot(a: number, b: number): number;
function dot(a: Vec2, b: Vec2): number;
function dot(a: Vec4, b: Vec4): number;
function dot(a: any, b: any): number {
  if (typeof a === 'number' && typeof b === 'number') {
    return a * b;
  }
  return a.map((_, i) => a[i] * b[i]).reduce((pv, v) => pv + v, 0);
}
const sumVec = vec4(1.0, 1.0, 1.0, 1.0);
function sum(x: Vec4): number {
  return dot(x, sumVec);
}
function mix(a: number, b: number, m: number): number;
function mix(a: Vec2, b: Vec2, m: number): Vec2;
function mix(a: Vec4, b: Vec4, m: number): Vec4;
function mix(a: Vec4, b: Vec4, m: Vec2): Vec4;
function mix(a: Vec4, b: Vec4, m: Vec4): Vec4;
function mix(a: any, b: any, m: any): any {
  if (typeof a === 'number' && typeof b === 'number') {
    return a * m + b * (1 - m);
  }
  if (typeof m === 'number') {
    return a.map((_, i) => a[i] * m + b[i] * (1 - m));
  }
  return a.map((_, i) => a[i] * m[i] + b[i] * (1 - m[i]));
}
function len(x: number | Vec2 | Vec4): number {
  if (typeof x === 'number') return x;
  return x.map((x) => x ** 2.0).reduce((pv, v) => pv + v, 0.0) ** 0.5;
}
function normalizeSafe(x: number): number;
function normalizeSafe(x: Vec2): Vec2;
function normalizeSafe(x: Vec4): Vec4;
function normalizeSafe(x: any): any {
  return len(x) ? div(x, len(x)) : vec2(0, 0);
}
function texture(tex: Texture, vUV: Vec2): Vec4 {
  const mod2 = (x, m) => ((x % m) + m) % m;
  const row = tex[mod2(floor(vUV[1] * tex.length + epsilon), tex.length)];
  const cel = row[mod2(floor(vUV[0] * tex.length + epsilon), tex.length)];
  return [cel[0], cel[1], cel[2], cel[3]];
}

function getNextBound(bound: Vec4): Vec4 {
  let ix: Float = bound[0];
  let iy: Float = bound[1];
  let it: Float = bound[2];
  let radius: Float = bound[3];
  let ox: Float = 0.0;
  let oy: Float = 0.0;
  let ot: Float = 7.0;
  if ((it < PI && abs(ix - 0.5) < radius) || abs(ix + 0.5) >= radius) {
    let x: Float = ix - 0.5;
    let y: Float = pow(pow(radius, 2.0) - pow(x, 2.0), 0.5);
    let t: Float = atan(y, x);
    if (t < 0.0) t += 2.0 * PI;
    if (t < it) t += 2.0 * PI;
    if (t < ot) {
      ox = ix - 1.0;
      oy = iy;
      ot = t;
    }
  }
  if (((it <= PI * 0.5 || it >= PI * 1.5) && abs(iy + 0.5) < radius) || abs(iy - 0.5) >= radius) {
    let y: Float = iy + 0.5;
    let x: Float = pow(pow(radius, 2.0) - pow(y, 2.0), 0.5);
    let t: Float = atan(y, x);
    if (t < 0.0) t += 2.0 * PI;
    if (t < it) t += 2.0 * PI;
    if (t < ot) {
      ox = ix;
      oy = iy + 1.0;
      ot = t;
    }
  }
  if ((it >= PI && abs(ix + 0.5) < radius) || abs(ix - 0.5) >= radius) {
    let x: Float = ix + 0.5;
    let y: Float = -pow(pow(radius, 2.0) - pow(x, 2.0), 0.5);
    let t: Float = atan(y, x);
    if (t < 0.0) t += 2.0 * PI;
    if (t < it) t += 2.0 * PI;
    if (t < ot) {
      ox = ix + 1.0;
      oy = iy;
      ot = t;
    }
  }
  if ((it > PI * 0.5 && it < PI * 1.5 && abs(iy - 0.5) < radius) || abs(iy + 0.5) >= radius) {
    let y: Float = iy - 0.5;
    let x: Float = -pow(pow(radius, 2.0) - pow(y, 2.0), 0.5);
    let t: Float = atan(y, x);
    if (t < 0.0) t += 2.0 * PI;
    if (t < it) t += 2.0 * PI;
    if (t < ot) {
      ox = ix;
      oy = iy - 1.0;
      ot = t;
    }
  }
  ot = mod(ot, PI2);
  return vec4(ox, oy, ot, radius);
}

function arcOverlap(loCel: Float, hiCel: Float, loArc: Float, hiArc: Float): Vec2 {
  let length: Float = 0.0;
  let theta: Float = 0.0;
  let arcMidpointOpposite: Float = mod((hiArc + loArc) / 2.0 + PI, PI2);
  if (
    (
      (arcMidpointOpposite > loCel && arcMidpointOpposite < hiCel) ||
      ((arcMidpointOpposite + PI2) > loCel && (arcMidpointOpposite + PI2) < hiCel)
    ) &&
    (hiCel - loCel) + (hiArc - loArc) >= PI2
  ) {
    let loGap: Float = hiArc;
    let hiGap: Float = loArc + PI2;
    if (loGap >= hiCel) {
      loGap -= PI2;
      hiGap -= PI2;
    }
    loGap = max(loGap, loCel);
    hiGap = min(hiGap, hiCel);
    let midpointA: Float = (loCel + loGap) / 2.0;
    let midpointB: Float = (hiCel + hiGap) / 2.0;
    let lengthA: Float = abs(loCel - loGap);
    let lengthB: Float = abs(hiCel - hiGap);
    length = (lengthA + lengthB) / (hiArc - loArc);
    theta = (midpointA * lengthA + midpointB * lengthB) / (lengthA + lengthB);
  } else {
    if (hiArc < loCel) {
      loArc += PI2;
      hiArc += PI2;
    } else if (hiCel < loArc) {
      loCel += PI2;
      hiCel += PI2;
    }
    let lo: Float = max(min(loArc, hiCel), loCel);
    let hi: Float = max(min(hiArc, hiCel), loCel);
  
    length = (hi - lo) / (hiArc - loArc);
    theta = mod((lo + hi) / 2.0, PI2);
  }

  return vec2(cos(theta) * length, sin(theta) * length);
}

type Uniforms = {
  static: Float[],
  substance: Vec4[],
  substanceAttractionMatrix: Vec4[]
}

function copyPaste(vUV: Vec2, uniforms: Uniforms, textures: Texture[]) {
  return [texture(textures[0], vUV)];
}
function compactLength(vUV: Vec2, uniforms: Uniforms, textures: Texture[]) {
  let c01: Vec4 = texture(textures[0], vUV); // substance01
  let c23: Vec4 = texture(textures[1], vUV); // substance23
  let s0: Vec2 = vec2(c01[0], c01[1]);
  let s1: Vec2 = vec2(c01[2], c01[3]);
  let s2: Vec2 = vec2(c23[0], c23[1]);
  let s3: Vec2 = vec2(c23[2], c23[3]);

  return [vec4(len(s0), len(s1), len(s2), len(s3))];
}
function transferPrepare(vUV: Vec2, uniforms: Uniforms, textures: Texture[]) {
  const [uSize, uTransferRadius] = uniforms.static;
  const [
    uArc012_, uArcWeight012_, uArcBlending012_,
    uFlo012_, uFloWeight012_, uFloBlending012_,
              uDirWeight012_, uDirBlending012_,
    uArc4567, uArcWeight4567, uArcBlending4567,
    uFlo4567, uFloWeight4567, uFloBlending4567,
              uDirWeight4567, uDirBlending4567,
  ] = uniforms.substance;
  const [
    am0x012_, am1x012_, am2x012_, am_x012_,
    am4x012_, am5x012_, am6x012_, am7x012_,
    am0x4567, am1x4567, am2x4567, am_x4567,
    am4x4567, am5x4567, am6x4567, am7x4567,
  ] = uniforms.substanceAttractionMatrix;
  let c01a: Vec4 = texture(textures[0], vUV); // substance01a
  let c2_a: Vec4 = texture(textures[1], vUV); // substance2_a
  let c45a: Vec4 = texture(textures[3], vUV); // substance45a
  let c67a: Vec4 = texture(textures[4], vUV); // substance67a
  c2_a[2] = 0.0;
  c2_a[3] = 0.0;
  let s0a: Vec2 = vec2(c01a[0], c01a[1]);
  let s1a: Vec2 = vec2(c01a[2], c01a[3]);
  let s2a: Vec2 = vec2(c2_a[0], c2_a[1]);
  let s_a: Vec2 = vec2(c2_a[2], c2_a[3]);
  let s4a: Vec2 = vec2(c45a[0], c45a[1]);
  let s5a: Vec2 = vec2(c45a[2], c45a[3]);
  let s6a: Vec2 = vec2(c67a[0], c67a[1]);
  let s7a: Vec2 = vec2(c67a[2], c67a[3]);
  let s0aLen: Float = len(s0a);
  let s1aLen: Float = len(s1a);
  let s2aLen: Float = len(s2a);
  let s_aLen: Float = len(s_a);
  let s4aLen: Float = len(s4a);
  let s5aLen: Float = len(s5a);
  let s6aLen: Float = len(s6a);
  let s7aLen: Float = len(s7a);
  let s012_aLen: Vec4 = vec4(s0aLen, s1aLen, s2aLen, s_aLen);
  let s4567aLen: Vec4 = vec4(s4aLen, s5aLen, s6aLen, s7aLen);
  let s012_aX: Vec4 = vec4(s0a[0], s1a[0], s2a[0], s_a[0]);
  let s4567aX: Vec4 = vec4(s4a[0], s5a[0], s6a[0], s7a[0]);
  let s012_aY: Vec4 = vec4(s0a[1], s1a[1], s2a[1], s_a[1]);
  let s4567aY: Vec4 = vec4(s4a[1], s5a[1], s6a[1], s7a[1]);

  let avgArc: Float = divSafe(
    dot(uArc012_, mul(s012_aLen, uArcWeight012_)) + dot(uArc4567, mul(s4567aLen, uArcWeight4567)),
    dot(s012_aLen, uArcWeight012_) + dot(s4567aLen, uArcWeight4567),
    -1.0
  );
  let avgFlo: Float = divSafe(
    dot(uFlo012_, mul(s012_aLen, uFloWeight012_)) + dot(uFlo4567, mul(s4567aLen, uFloWeight4567)),
    dot(s012_aLen, uFloWeight012_) + dot(s4567aLen, uFloWeight4567),
    -1.0
  );
  let avgDir: Vec2 = normalizeSafe(
    vec2(
      dot(s012_aX, uDirWeight012_) + dot(s4567aX, uDirWeight4567),
      dot(s012_aY, uDirWeight012_) + dot(s4567aY, uDirWeight4567)
    )
  );

  let s012_aArc: Vec4 =
    avgArc === -1.0 ? uArc012_ : mix(uArc012_, vec4(avgArc, avgArc, avgArc, avgArc), uArcBlending012_);
  let s4567aArc: Vec4 =
    avgArc === -1.0 ? uArc4567 : mix(uArc4567, vec4(avgArc, avgArc, avgArc, avgArc), uArcBlending4567);
  let s012_aFlo: Vec4 =
    avgFlo === -1.0 ? uFlo012_ : mix(uFlo012_, vec4(avgFlo, avgFlo, avgFlo, avgFlo), uFloBlending012_);
  let s4567aFlo: Vec4 =
    avgFlo === -1.0 ? uFlo4567 : mix(uFlo4567, vec4(avgFlo, avgFlo, avgFlo, avgFlo), uFloBlending4567);
  s012_aFlo = mul(s012_aFlo, s012_aLen);
  s4567aFlo = mul(s4567aFlo, s4567aLen);
  s0a = mul(normalizeSafe(mix(normalizeSafe(s0a), avgDir, uDirBlending012_[0])), s0aLen);
  s1a = mul(normalizeSafe(mix(normalizeSafe(s1a), avgDir, uDirBlending012_[1])), s1aLen);
  s2a = mul(normalizeSafe(mix(normalizeSafe(s2a), avgDir, uDirBlending012_[2])), s2aLen);
  s_a = mul(normalizeSafe(mix(normalizeSafe(s_a), avgDir, uDirBlending012_[3])), s_aLen);
  s4a = mul(normalizeSafe(mix(normalizeSafe(s4a), avgDir, uDirBlending4567[0])), s4aLen);
  s5a = mul(normalizeSafe(mix(normalizeSafe(s5a), avgDir, uDirBlending4567[1])), s5aLen);
  s6a = mul(normalizeSafe(mix(normalizeSafe(s6a), avgDir, uDirBlending4567[2])), s6aLen);
  s7a = mul(normalizeSafe(mix(normalizeSafe(s7a), avgDir, uDirBlending4567[3])), s7aLen);

  let s012_Bisector: Vec4 = vec4(
    atan(s0a[1], s0a[0]),
    atan(s1a[1], s1a[0]),
    atan(s2a[1], s2a[0]),
    atan(s_a[1], s_a[0])
  );
  let s4567Bisector: Vec4 = vec4(
    atan(s4a[1], s4a[0]),
    atan(s5a[1], s5a[0]),
    atan(s6a[1], s6a[0]),
    atan(s7a[1], s7a[0])
  );
  let s012_aLoBound: Vec4 = mod(add(sub(s012_Bisector, s012_aArc), PI2), PI2);
  let s4567aLoBound: Vec4 = mod(add(sub(s4567Bisector, s4567aArc), PI2), PI2);
  let s012_aHiBound: Vec4 = mod(add(add(s012_Bisector, s012_aArc), PI2), PI2);
  let s4567aHiBound: Vec4 = mod(add(add(s4567Bisector, s4567aArc), PI2), PI2);

  s012_aHiBound = vec4(
    s012_aLoBound[0] > s012_aHiBound[0] - epsilon ? s012_aHiBound[0] + PI2 : s012_aHiBound[0],
    s012_aLoBound[1] > s012_aHiBound[1] - epsilon ? s012_aHiBound[1] + PI2 : s012_aHiBound[1],
    s012_aLoBound[2] > s012_aHiBound[2] - epsilon ? s012_aHiBound[2] + PI2 : s012_aHiBound[2],
    s012_aLoBound[3] > s012_aHiBound[3] - epsilon ? s012_aHiBound[3] + PI2 : s012_aHiBound[3]
  );
  s4567aHiBound = vec4(
    s4567aLoBound[0] > s4567aHiBound[0] - epsilon ? s4567aHiBound[0] + PI2 : s4567aHiBound[0],
    s4567aLoBound[1] > s4567aHiBound[1] - epsilon ? s4567aHiBound[1] + PI2 : s4567aHiBound[1],
    s4567aLoBound[2] > s4567aHiBound[2] - epsilon ? s4567aHiBound[2] + PI2 : s4567aHiBound[2],
    s4567aLoBound[3] > s4567aHiBound[3] - epsilon ? s4567aHiBound[3] + PI2 : s4567aHiBound[3]
  );

  let s0TransferFractionSum: Float = 0.0;
  let s1TransferFractionSum: Float = 0.0;
  let s2TransferFractionSum: Float = 0.0;
  let s_TransferFractionSum: Float = 0.0;
  let s4TransferFractionSum: Float = 0.0;
  let s5TransferFractionSum: Float = 0.0;
  let s6TransferFractionSum: Float = 0.0;
  let s7TransferFractionSum: Float = 0.0;
  let s0GivenDir: Vec2 = vec2(0.0, 0.0);
  let s1GivenDir: Vec2 = vec2(0.0, 0.0);
  let s2GivenDir: Vec2 = vec2(0.0, 0.0);
  let s_GivenDir: Vec2 = vec2(0.0, 0.0);
  let s4GivenDir: Vec2 = vec2(0.0, 0.0);
  let s5GivenDir: Vec2 = vec2(0.0, 0.0);
  let s6GivenDir: Vec2 = vec2(0.0, 0.0);
  let s7GivenDir: Vec2 = vec2(0.0, 0.0);

  let prevBound: Vec4 = vec4(round(uTransferRadius), 0, 0, uTransferRadius);
  let nextBound: Vec4 = getNextBound(prevBound);
  for (let i: Int = 0; i < 999; i++) {
    prevBound = nextBound;
    nextBound = getNextBound(prevBound);

    let loBound: Float = prevBound[2];
    let hiBound: Float = nextBound[2];
    if (loBound > hiBound) {
      hiBound += PI2;
    }
    if (abs(hiBound - loBound) < 0.001) {
      continue;
    }

    let vvUV: Vec2 = vec2(vUV[0] + prevBound[0] / uSize, vUV[1] + prevBound[1] / uSize);
    let s012_bLen: Vec4 = texture(textures[2], vvUV); // substance012_b
    let s4567bLen: Vec4 = texture(textures[5], vvUV); // substance4567b
    s012_bLen[3] = 0.0;

    let sbLenTotal: Float = sum(s012_bLen) + sum(s4567bLen);
    s012_bLen = divSafe(s012_bLen, sbLenTotal, 0.0);
    s4567bLen = divSafe(s4567bLen, sbLenTotal, 0.0);

    let s0Attraction: Float = add(dot(s012_bLen, max(am0x012_, 0.0)), dot(s4567bLen, max(am0x4567, 0.0)));
    let s1Attraction: Float = add(dot(s012_bLen, max(am1x012_, 0.0)), dot(s4567bLen, max(am1x4567, 0.0)));
    let s2Attraction: Float = add(dot(s012_bLen, max(am2x012_, 0.0)), dot(s4567bLen, max(am2x4567, 0.0)));
    let s_Attraction: Float = add(dot(s012_bLen, max(am_x012_, 0.0)), dot(s4567bLen, max(am_x4567, 0.0)));
    let s4Attraction: Float = add(dot(s012_bLen, max(am4x012_, 0.0)), dot(s4567bLen, max(am4x4567, 0.0)));
    let s5Attraction: Float = add(dot(s012_bLen, max(am5x012_, 0.0)), dot(s4567bLen, max(am5x4567, 0.0)));
    let s6Attraction: Float = add(dot(s012_bLen, max(am6x012_, 0.0)), dot(s4567bLen, max(am6x4567, 0.0)));
    let s7Attraction: Float = add(dot(s012_bLen, max(am7x012_, 0.0)), dot(s4567bLen, max(am7x4567, 0.0)));
    s0Attraction = div(s0Attraction, (1.0 + dot(s012_bLen, max(mul(-1.0, am0x012_), 0.0)) + dot(s4567bLen, max(mul(-1.0, am0x4567), 0.0))));
    s1Attraction = div(s1Attraction, (1.0 + dot(s012_bLen, max(mul(-1.0, am1x012_), 0.0)) + dot(s4567bLen, max(mul(-1.0, am1x4567), 0.0))));
    s2Attraction = div(s2Attraction, (1.0 + dot(s012_bLen, max(mul(-1.0, am2x012_), 0.0)) + dot(s4567bLen, max(mul(-1.0, am2x4567), 0.0))));
    s_Attraction = div(s_Attraction, (1.0 + dot(s012_bLen, max(mul(-1.0, am_x012_), 0.0)) + dot(s4567bLen, max(mul(-1.0, am_x4567), 0.0))));
    s4Attraction = div(s4Attraction, (1.0 + dot(s012_bLen, max(mul(-1.0, am4x012_), 0.0)) + dot(s4567bLen, max(mul(-1.0, am4x4567), 0.0))));
    s5Attraction = div(s5Attraction, (1.0 + dot(s012_bLen, max(mul(-1.0, am5x012_), 0.0)) + dot(s4567bLen, max(mul(-1.0, am5x4567), 0.0))));
    s6Attraction = div(s6Attraction, (1.0 + dot(s012_bLen, max(mul(-1.0, am6x012_), 0.0)) + dot(s4567bLen, max(mul(-1.0, am6x4567), 0.0))));
    s7Attraction = div(s7Attraction, (1.0 + dot(s012_bLen, max(mul(-1.0, am7x012_), 0.0)) + dot(s4567bLen, max(mul(-1.0, am7x4567), 0.0))));
    s0Attraction = sbLenTotal === 0.0 ? 1.0 : s0Attraction;
    s1Attraction = sbLenTotal === 0.0 ? 1.0 : s1Attraction;
    s2Attraction = sbLenTotal === 0.0 ? 1.0 : s2Attraction;
    s_Attraction = sbLenTotal === 0.0 ? 1.0 : s_Attraction;
    s4Attraction = sbLenTotal === 0.0 ? 1.0 : s4Attraction;
    s5Attraction = sbLenTotal === 0.0 ? 1.0 : s5Attraction;
    s6Attraction = sbLenTotal === 0.0 ? 1.0 : s6Attraction;
    s7Attraction = sbLenTotal === 0.0 ? 1.0 : s7Attraction;

    let s0TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s012_aLoBound[0], s012_aHiBound[0]), s0Attraction);
    let s1TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s012_aLoBound[1], s012_aHiBound[1]), s1Attraction);
    let s2TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s012_aLoBound[2], s012_aHiBound[2]), s2Attraction);
    let s_TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s012_aLoBound[3], s012_aHiBound[3]), s_Attraction);
    let s4TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s4567aLoBound[0], s4567aHiBound[0]), s4Attraction);
    let s5TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s4567aLoBound[1], s4567aHiBound[1]), s5Attraction);
    let s6TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s4567aLoBound[2], s4567aHiBound[2]), s6Attraction);
    let s7TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s4567aLoBound[3], s4567aHiBound[3]), s7Attraction);

    s0TransferFractionSum += len(s0TransferFraction);
    s1TransferFractionSum += len(s1TransferFraction);
    s2TransferFractionSum += len(s2TransferFraction);
    s_TransferFractionSum += len(s_TransferFraction);
    s4TransferFractionSum += len(s4TransferFraction);
    s5TransferFractionSum += len(s5TransferFraction);
    s6TransferFractionSum += len(s6TransferFraction);
    s7TransferFractionSum += len(s7TransferFraction);

    s0GivenDir = add(s0GivenDir, s0TransferFraction);
    s1GivenDir = add(s1GivenDir, s1TransferFraction);
    s2GivenDir = add(s2GivenDir, s2TransferFraction);
    s_GivenDir = add(s_GivenDir, s_TransferFraction);
    s4GivenDir = add(s4GivenDir, s4TransferFraction);
    s5GivenDir = add(s5GivenDir, s5TransferFraction);
    s6GivenDir = add(s6GivenDir, s6TransferFraction);
    s7GivenDir = add(s7GivenDir, s7TransferFraction);

    if (hiBound > PI2) {
      break;
    }
  }

  // flowWeightedTransferFractionSum
  let s0FWTFS: Vec2 = mul(normalizeSafe(s0a), divSafe(s0TransferFractionSum, s012_aFlo[0], 0.0));
  let s1FWTFS: Vec2 = mul(normalizeSafe(s1a), divSafe(s1TransferFractionSum, s012_aFlo[1], 0.0));
  let s2FWTFS: Vec2 = mul(normalizeSafe(s2a), divSafe(s2TransferFractionSum, s012_aFlo[2], 0.0));
  let s_FWTFS: Vec2 = mul(normalizeSafe(s_a), divSafe(s_TransferFractionSum, s012_aFlo[3], 0.0));
  let s4FWTFS: Vec2 = mul(normalizeSafe(s4a), divSafe(s4TransferFractionSum, s4567aFlo[0], 0.0));
  let s5FWTFS: Vec2 = mul(normalizeSafe(s5a), divSafe(s5TransferFractionSum, s4567aFlo[1], 0.0));
  let s6FWTFS: Vec2 = mul(normalizeSafe(s6a), divSafe(s6TransferFractionSum, s4567aFlo[2], 0.0));
  let s7FWTFS: Vec2 = mul(normalizeSafe(s7a), divSafe(s7TransferFractionSum, s4567aFlo[3], 0.0));

  let s01FWTFS: Vec4 = vec4(s0FWTFS[0], s0FWTFS[1], s1FWTFS[0], s1FWTFS[1]);
  let s2_FWTFS: Vec4 = vec4(s2FWTFS[0], s2FWTFS[1], s_FWTFS[0], s_FWTFS[1]);
  let s45FWTFS: Vec4 = vec4(s4FWTFS[0], s4FWTFS[1], s5FWTFS[0], s5FWTFS[1]);
  let s67FWTFS: Vec4 = vec4(s6FWTFS[0], s6FWTFS[1], s7FWTFS[0], s7FWTFS[1]);

  let s0Given: Vec2 = mul(normalizeSafe(s0GivenDir), s012_aFlo[0]);
  let s1Given: Vec2 = mul(normalizeSafe(s1GivenDir), s012_aFlo[1]);
  let s2Given: Vec2 = mul(normalizeSafe(s2GivenDir), s012_aFlo[2]);
  let s_Given: Vec2 = mul(normalizeSafe(s_GivenDir), s012_aFlo[3]);
  let s4Given: Vec2 = mul(normalizeSafe(s4GivenDir), s4567aFlo[0]);
  let s5Given: Vec2 = mul(normalizeSafe(s5GivenDir), s4567aFlo[1]);
  let s6Given: Vec2 = mul(normalizeSafe(s6GivenDir), s4567aFlo[2]);
  let s7Given: Vec2 = mul(normalizeSafe(s7GivenDir), s4567aFlo[3]);

  let s01Given: Vec4 = vec4(s0Given[0], s0Given[1], s1Given[0], s1Given[1]);
  let s2_Given: Vec4 = vec4(s2Given[0], s2Given[1], s_Given[0], s_Given[1]);
  let s45Given: Vec4 = vec4(s4Given[0], s4Given[1], s5Given[0], s5Given[1]);
  let s67Given: Vec4 = vec4(s6Given[0], s6Given[1], s7Given[0], s7Given[1]);

  s2_FWTFS[2] = avgArc;
  s2_FWTFS[3] = avgFlo;
  s2_Given[2] = 0.0;
  s2_Given[3] = 0.0;

  return [s01FWTFS, s2_FWTFS, s01Given, s2_Given, s45FWTFS, s67FWTFS, s45Given, s67Given];
}

function transferRun(vUV: Vec2, uniforms: Uniforms, textures: Texture[]) {
  const [uSize, uTransferRadius] = uniforms.static;
  const [
    uArc012_, /* uArcWeight012_ */, uArcBlending012_,
    uFlo012_, /* uFloWeight012_ */, uFloBlending012_,
              /* uDirWeight012_ */, /* uDirBlending012_ */,
    uArc4567, /* uArcWeight4567 */, uArcBlending4567,
    uFlo4567, /* uFloWeight4567 */, uFloBlending4567,
              /* uDirWeight4567 */, /* uDirBlending4567 */,
  ] = uniforms.substance;
  const [
    am0x012_, am1x012_, am2x012_, am_x012_,
    am4x012_, am5x012_, am6x012_, am7x012_,
    am0x4567, am1x4567, am2x4567, am_x4567,
    am4x4567, am5x4567, am6x4567, am7x4567,
  ] = uniforms.substanceAttractionMatrix;
  let c01b: Vec4 = texture(textures[0], vUV); // substance01b
  let c2_b: Vec4 = texture(textures[1], vUV); // substance2_b
  let c45b: Vec4 = texture(textures[6], vUV); // substance45b
  let c67b: Vec4 = texture(textures[7], vUV); // substance67b
  c2_b[2] = 0.0;
  c2_b[3] = 0.0;
  let s0b: Vec2 = vec2(c01b[0], c01b[1]);
  let s1b: Vec2 = vec2(c01b[2], c01b[3]);
  let s2b: Vec2 = vec2(c2_b[0], c2_b[1]);
  let s_b: Vec2 = vec2(c2_b[2], c2_b[3]);
  let s4b: Vec2 = vec2(c45b[0], c45b[1]);
  let s5b: Vec2 = vec2(c45b[2], c45b[3]);
  let s6b: Vec2 = vec2(c67b[0], c67b[1]);
  let s7b: Vec2 = vec2(c67b[2], c67b[3]);
  let s0bLen: Float = len(s0b);
  let s1bLen: Float = len(s1b);
  let s2bLen: Float = len(s2b);
  let s_bLen: Float = len(s_b);
  let s4bLen: Float = len(s4b);
  let s5bLen: Float = len(s5b);
  let s6bLen: Float = len(s6b);
  let s7bLen: Float = len(s7b);
  let s012_bLen: Vec4 = vec4(s0bLen, s1bLen, s2bLen, s_bLen);
  let s4567bLen: Vec4 = vec4(s4bLen, s5bLen, s6bLen, s7bLen);

  let sbLenTotal: Float = sum(s012_bLen) + sum(s4567bLen);
  s012_bLen = divSafe(s012_bLen, sbLenTotal, 0.0);
  s4567bLen = divSafe(s4567bLen, sbLenTotal, 0.0);

  let s0Attraction: Float = add(dot(s012_bLen, max(am0x012_, 0.0)), dot(s4567bLen, max(am0x4567, 0.0)));
  let s1Attraction: Float = add(dot(s012_bLen, max(am1x012_, 0.0)), dot(s4567bLen, max(am1x4567, 0.0)));
  let s2Attraction: Float = add(dot(s012_bLen, max(am2x012_, 0.0)), dot(s4567bLen, max(am2x4567, 0.0)));
  let s_Attraction: Float = add(dot(s012_bLen, max(am_x012_, 0.0)), dot(s4567bLen, max(am_x4567, 0.0)));
  let s4Attraction: Float = add(dot(s012_bLen, max(am4x012_, 0.0)), dot(s4567bLen, max(am4x4567, 0.0)));
  let s5Attraction: Float = add(dot(s012_bLen, max(am5x012_, 0.0)), dot(s4567bLen, max(am5x4567, 0.0)));
  let s6Attraction: Float = add(dot(s012_bLen, max(am6x012_, 0.0)), dot(s4567bLen, max(am6x4567, 0.0)));
  let s7Attraction: Float = add(dot(s012_bLen, max(am7x012_, 0.0)), dot(s4567bLen, max(am7x4567, 0.0)));
  s0Attraction = div(s0Attraction, (1.0 + dot(s012_bLen, max(mul(-1.0, am0x012_), 0.0)) + dot(s4567bLen, max(mul(-1.0, am0x4567), 0.0))));
  s1Attraction = div(s1Attraction, (1.0 + dot(s012_bLen, max(mul(-1.0, am1x012_), 0.0)) + dot(s4567bLen, max(mul(-1.0, am1x4567), 0.0))));
  s2Attraction = div(s2Attraction, (1.0 + dot(s012_bLen, max(mul(-1.0, am2x012_), 0.0)) + dot(s4567bLen, max(mul(-1.0, am2x4567), 0.0))));
  s_Attraction = div(s_Attraction, (1.0 + dot(s012_bLen, max(mul(-1.0, am_x012_), 0.0)) + dot(s4567bLen, max(mul(-1.0, am_x4567), 0.0))));
  s4Attraction = div(s4Attraction, (1.0 + dot(s012_bLen, max(mul(-1.0, am4x012_), 0.0)) + dot(s4567bLen, max(mul(-1.0, am4x4567), 0.0))));
  s5Attraction = div(s5Attraction, (1.0 + dot(s012_bLen, max(mul(-1.0, am5x012_), 0.0)) + dot(s4567bLen, max(mul(-1.0, am5x4567), 0.0))));
  s6Attraction = div(s6Attraction, (1.0 + dot(s012_bLen, max(mul(-1.0, am6x012_), 0.0)) + dot(s4567bLen, max(mul(-1.0, am6x4567), 0.0))));
  s7Attraction = div(s7Attraction, (1.0 + dot(s012_bLen, max(mul(-1.0, am7x012_), 0.0)) + dot(s4567bLen, max(mul(-1.0, am7x4567), 0.0))));
  s0Attraction = sbLenTotal === 0.0 ? 1.0 : s0Attraction;
  s1Attraction = sbLenTotal === 0.0 ? 1.0 : s1Attraction;
  s2Attraction = sbLenTotal === 0.0 ? 1.0 : s2Attraction;
  s_Attraction = sbLenTotal === 0.0 ? 1.0 : s_Attraction;
  s4Attraction = sbLenTotal === 0.0 ? 1.0 : s4Attraction;
  s5Attraction = sbLenTotal === 0.0 ? 1.0 : s5Attraction;
  s6Attraction = sbLenTotal === 0.0 ? 1.0 : s6Attraction;
  s7Attraction = sbLenTotal === 0.0 ? 1.0 : s7Attraction;

  let s0FloLen: Float = 0.0;
  let s1FloLen: Float = 0.0;
  let s2FloLen: Float = 0.0;
  let s_FloLen: Float = 0.0;
  let s4FloLen: Float = 0.0;
  let s5FloLen: Float = 0.0;
  let s6FloLen: Float = 0.0;
  let s7FloLen: Float = 0.0;
  let s0FloDir: Vec2 = vec2(0.0, 0.0);
  let s1FloDir: Vec2 = vec2(0.0, 0.0);
  let s2FloDir: Vec2 = vec2(0.0, 0.0);
  let s_FloDir: Vec2 = vec2(0.0, 0.0);
  let s4FloDir: Vec2 = vec2(0.0, 0.0);
  let s5FloDir: Vec2 = vec2(0.0, 0.0);
  let s6FloDir: Vec2 = vec2(0.0, 0.0);
  let s7FloDir: Vec2 = vec2(0.0, 0.0);

  let prevBound: Vec4 = vec4(round(uTransferRadius), 0, 0, uTransferRadius);
  let nextBound: Vec4 = getNextBound(prevBound);
  for (let i: Int = 0; i < 999; i++) {
    prevBound = nextBound;
    nextBound = getNextBound(prevBound);

    let loBound: Float = prevBound[2];
    let hiBound: Float = nextBound[2];
    if (loBound > hiBound) {
      hiBound += PI2;
    }
    if (abs(hiBound - loBound) < 0.001) {
      continue;
    }

    let vvUV: Vec2 = vec2(vUV[0] - prevBound[0] / uSize, vUV[1] - prevBound[1] / uSize);
    let c01a: Vec4 = texture(textures[2], vvUV); // substance01a
    let c2_a: Vec4 = texture(textures[3], vvUV); // substance2_a
    let c45a: Vec4 = texture(textures[8], vvUV); // substance45a
    let c67a: Vec4 = texture(textures[9], vvUV); // substance67a
    let cAvg: Vec2 = vec2(c2_a[2], c2_a[3]); // avgArcAndFlo
    c2_a[2] = 0.0;
    c2_a[3] = 0.0;
    let s0aFWTFS: Vec2 = vec2(c01a[0], c01a[1]);
    let s1aFWTFS: Vec2 = vec2(c01a[2], c01a[3]);
    let s2aFWTFS: Vec2 = vec2(c2_a[0], c2_a[1]);
    let s_aFWTFS: Vec2 = vec2(c2_a[2], c2_a[3]);
    let s4aFWTFS: Vec2 = vec2(c45a[0], c45a[1]);
    let s5aFWTFS: Vec2 = vec2(c45a[2], c45a[3]);
    let s6aFWTFS: Vec2 = vec2(c67a[0], c67a[1]);
    let s7aFWTFS: Vec2 = vec2(c67a[2], c67a[3]);

    let s012_Bisector: Vec4 = vec4(
      atan(s0aFWTFS[1], s0aFWTFS[0]),
      atan(s1aFWTFS[1], s1aFWTFS[0]),
      atan(s2aFWTFS[1], s2aFWTFS[0]),
      atan(s_aFWTFS[1], s_aFWTFS[0])
    );
    let s4567Bisector: Vec4 = vec4(
      atan(s4aFWTFS[1], s4aFWTFS[0]),
      atan(s5aFWTFS[1], s5aFWTFS[0]),
      atan(s6aFWTFS[1], s6aFWTFS[0]),
      atan(s7aFWTFS[1], s7aFWTFS[0])
    );
    let avgArc: Float = cAvg[0];
    let s012_aArc: Vec4 =
      avgArc === -1.0 ? uArc012_ : mix(uArc012_, vec4(avgArc, avgArc, avgArc, avgArc), uArcBlending012_);
    let s4567aArc: Vec4 =
      avgArc === -1.0 ? uArc4567 : mix(uArc4567, vec4(avgArc, avgArc, avgArc, avgArc), uArcBlending4567);

    let s012_aLoBound: Vec4 = mod(add(sub(s012_Bisector, s012_aArc), PI2), PI2);
    let s4567aLoBound: Vec4 = mod(add(sub(s4567Bisector, s4567aArc), PI2), PI2);
    let s012_aHiBound: Vec4 = mod(add(add(s012_Bisector, s012_aArc), PI2), PI2);
    let s4567aHiBound: Vec4 = mod(add(add(s4567Bisector, s4567aArc), PI2), PI2);
    s012_aHiBound = vec4(
      s012_aLoBound[0] > s012_aHiBound[0] - epsilon ? s012_aHiBound[0] + PI2 : s012_aHiBound[0],
      s012_aLoBound[1] > s012_aHiBound[1] - epsilon ? s012_aHiBound[1] + PI2 : s012_aHiBound[1],
      s012_aLoBound[2] > s012_aHiBound[2] - epsilon ? s012_aHiBound[2] + PI2 : s012_aHiBound[2],
      s012_aLoBound[3] > s012_aHiBound[3] - epsilon ? s012_aHiBound[3] + PI2 : s012_aHiBound[3]
    );
    s4567aHiBound = vec4(
      s4567aLoBound[0] > s4567aHiBound[0] - epsilon ? s4567aHiBound[0] + PI2 : s4567aHiBound[0],
      s4567aLoBound[1] > s4567aHiBound[1] - epsilon ? s4567aHiBound[1] + PI2 : s4567aHiBound[1],
      s4567aLoBound[2] > s4567aHiBound[2] - epsilon ? s4567aHiBound[2] + PI2 : s4567aHiBound[2],
      s4567aLoBound[3] > s4567aHiBound[3] - epsilon ? s4567aHiBound[3] + PI2 : s4567aHiBound[3]
    );

    let s0TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s012_aLoBound[0], s012_aHiBound[0]), s0Attraction);
    let s1TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s012_aLoBound[1], s012_aHiBound[1]), s1Attraction);
    let s2TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s012_aLoBound[2], s012_aHiBound[2]), s2Attraction);
    let s_TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s012_aLoBound[3], s012_aHiBound[3]), s_Attraction);
    let s4TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s4567aLoBound[0], s4567aHiBound[0]), s4Attraction);
    let s5TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s4567aLoBound[1], s4567aHiBound[1]), s5Attraction);
    let s6TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s4567aLoBound[2], s4567aHiBound[2]), s6Attraction);
    let s7TransferFraction: Vec2 = mul(arcOverlap(loBound, hiBound, s4567aLoBound[3], s4567aHiBound[3]), s7Attraction);

    let s0FloFraction: Vec2 = divSafe(s0TransferFraction, len(s0aFWTFS), 0.0);
    let s1FloFraction: Vec2 = divSafe(s1TransferFraction, len(s1aFWTFS), 0.0);
    let s2FloFraction: Vec2 = divSafe(s2TransferFraction, len(s2aFWTFS), 0.0);
    let s_FloFraction: Vec2 = divSafe(s_TransferFraction, len(s_aFWTFS), 0.0);
    let s4FloFraction: Vec2 = divSafe(s4TransferFraction, len(s4aFWTFS), 0.0);
    let s5FloFraction: Vec2 = divSafe(s5TransferFraction, len(s5aFWTFS), 0.0);
    let s6FloFraction: Vec2 = divSafe(s6TransferFraction, len(s6aFWTFS), 0.0);
    let s7FloFraction: Vec2 = divSafe(s7TransferFraction, len(s7aFWTFS), 0.0);

    s0FloDir = add(s0FloDir, s0FloFraction);
    s1FloDir = add(s1FloDir, s1FloFraction);
    s2FloDir = add(s2FloDir, s2FloFraction);
    s_FloDir = add(s_FloDir, s_FloFraction);
    s4FloDir = add(s4FloDir, s4FloFraction);
    s5FloDir = add(s5FloDir, s5FloFraction);
    s6FloDir = add(s6FloDir, s6FloFraction);
    s7FloDir = add(s7FloDir, s7FloFraction);

    s0FloLen = add(s0FloLen, len(s0FloFraction));
    s1FloLen = add(s1FloLen, len(s1FloFraction));
    s2FloLen = add(s2FloLen, len(s2FloFraction));
    s_FloLen = add(s_FloLen, len(s_FloFraction));
    s4FloLen = add(s4FloLen, len(s4FloFraction));
    s5FloLen = add(s5FloLen, len(s5FloFraction));
    s6FloLen = add(s6FloLen, len(s6FloFraction));
    s7FloLen = add(s7FloLen, len(s7FloFraction));

    if (hiBound > PI2) {
      break;
    }
  }

  let c01Given: Vec4 = texture(textures[4], vUV); // substance01Given
  let c2_Given: Vec4 = texture(textures[5], vUV); // substance2_Given
  let c45Given: Vec4 = texture(textures[10], vUV); // substance45Given
  let c67Given: Vec4 = texture(textures[11], vUV); // substance67Given
  let s0Given: Vec2 = vec2(c01Given[0], c01Given[1]);
  let s1Given: Vec2 = vec2(c01Given[2], c01Given[3]);
  let s2Given: Vec2 = vec2(c2_Given[0], c2_Given[1]);
  let s_Given: Vec2 = vec2(c2_Given[2], c2_Given[3]);
  let s4Given: Vec2 = vec2(c45Given[0], c45Given[1]);
  let s5Given: Vec2 = vec2(c45Given[2], c45Given[3]);
  let s6Given: Vec2 = vec2(c67Given[0], c67Given[1]);
  let s7Given: Vec2 = vec2(c67Given[2], c67Given[3]);

  let s0Received: Vec2 = mul(normalizeSafe(s0FloDir), s0FloLen);
  let s1Received: Vec2 = mul(normalizeSafe(s1FloDir), s1FloLen);
  let s2Received: Vec2 = mul(normalizeSafe(s2FloDir), s2FloLen);
  let s_Received: Vec2 = mul(normalizeSafe(s_FloDir), s_FloLen);
  let s4Received: Vec2 = mul(normalizeSafe(s4FloDir), s4FloLen);
  let s5Received: Vec2 = mul(normalizeSafe(s5FloDir), s5FloLen);
  let s6Received: Vec2 = mul(normalizeSafe(s6FloDir), s6FloLen);
  let s7Received: Vec2 = mul(normalizeSafe(s7FloDir), s7FloLen);

  let avgFlo: Float = texture(textures[3], vUV)[3]; // avgArcAndFlo
  let s012_bFlo: Vec4 =
    avgFlo === -1.0 ? uFlo012_ : mix(uFlo012_, vec4(avgFlo, avgFlo, avgFlo, avgFlo), uFloBlending012_);
  let s4567bFlo: Vec4 =
    avgFlo === -1.0 ? uFlo4567 : mix(uFlo4567, vec4(avgFlo, avgFlo, avgFlo, avgFlo), uFloBlending4567);

  let s0Remaining: Vec2 = mul(s0b, 1.0 - s012_bFlo[0]);
  let s1Remaining: Vec2 = mul(s1b, 1.0 - s012_bFlo[1]);
  let s2Remaining: Vec2 = mul(s2b, 1.0 - s012_bFlo[2]);
  let s_Remaining: Vec2 = mul(s_b, 1.0 - s012_bFlo[3]);
  let s4Remaining: Vec2 = mul(s4b, 1.0 - s4567bFlo[0]);
  let s5Remaining: Vec2 = mul(s5b, 1.0 - s4567bFlo[1]);
  let s6Remaining: Vec2 = mul(s6b, 1.0 - s4567bFlo[2]);
  let s7Remaining: Vec2 = mul(s7b, 1.0 - s4567bFlo[3]);

  let s0: Vec2 = mul(normalizeSafe(add(add(s0Given, s0Received), s0Remaining)), len(s0Received) + len(s0Remaining));
  let s1: Vec2 = mul(normalizeSafe(add(add(s1Given, s1Received), s1Remaining)), len(s1Received) + len(s1Remaining));
  let s2: Vec2 = mul(normalizeSafe(add(add(s2Given, s2Received), s2Remaining)), len(s2Received) + len(s2Remaining));
  let s_: Vec2 = mul(normalizeSafe(add(add(s_Given, s_Received), s_Remaining)), len(s_Received) + len(s_Remaining));
  let s4: Vec2 = mul(normalizeSafe(add(add(s4Given, s4Received), s4Remaining)), len(s4Received) + len(s4Remaining));
  let s5: Vec2 = mul(normalizeSafe(add(add(s5Given, s5Received), s5Remaining)), len(s5Received) + len(s5Remaining));
  let s6: Vec2 = mul(normalizeSafe(add(add(s6Given, s6Received), s6Remaining)), len(s6Received) + len(s6Remaining));
  let s7: Vec2 = mul(normalizeSafe(add(add(s7Given, s7Received), s7Remaining)), len(s7Received) + len(s7Remaining));

  let s01: Vec4 = vec4(s0[0], s0[1], s1[0], s1[1]);
  let s2_: Vec4 = vec4(s2[0], s2[1], s_[0], s_[1]);
  let s45: Vec4 = vec4(s4[0], s4[1], s5[0], s5[1]);
  let s67: Vec4 = vec4(s6[0], s6[1], s7[0], s7[1]);

  s2_[2] = 0.0;
  s2_[3] = 0.0;

  return [
    s01,
    s2_,
    s45,
    s67
  ];
}

function substanceReactGenerator(config) {
  const reactions = substanceReactParse(config);
  function substanceReact(vUV: Vec2, uniforms, textures: Texture[]) {
    const [
      /* uArc0123, uArcWeight0123, uArcBlending0123, */
      /* uFlo0123, uFloWeight0123, uFloBlending0123, */
                uDirWeight0123, /* uDirBlending0123, */
      /* uArc4567, uArcWeight4567, uArcBlending4567, */
      /* uFlo4567, uFloWeight4567, uFloBlending4567, */
                uDirWeight4567, /* uDirBlending4567, */
    ] = uniforms.substance;
    let cs01: Vec4 = texture(textures[0], vUV); // substance01
    let cs23: Vec4 = texture(textures[1], vUV); // substance23
    let cs45: Vec4 = texture(textures[4], vUV); // substance45
    let cs67: Vec4 = texture(textures[5], vUV); // substance67
    let ca0123: Vec4 = texture(textures[2], vUV); // address0123
    let ca4567: Vec4 = texture(textures[3], vUV); // address4567

    let initial0: Vec4 = vec4(
      len(vec2(cs01[0], cs01[1])),
      len(vec2(cs01[2], cs01[3])),
      len(vec2(cs23[0], cs23[1])),
      len(vec2(cs23[2], cs23[3]))
    );
    let initial1: Vec4 = vec4(
      len(vec2(cs45[0], cs45[1])),
      len(vec2(cs45[2], cs45[3])),
      len(vec2(cs67[0], cs67[1])),
      len(vec2(cs67[2], cs67[3]))
    );
    let initial2: Vec4 = max(ca0123, 0.0);
    let initial3: Vec4 = max(ca4567, 0.0);

    let input0: Vec4 = initial0;
    let input1: Vec4 = initial1;
    let input2: Vec4 = initial2;
    let input3: Vec4 = initial3;
    let output0x: Vec2 = vec2(0.0, 0.0);
    let output0y: Vec2 = vec2(0.0, 0.0);
    let output0z: Vec2 = vec2(0.0, 0.0);
    let output0w: Vec2 = vec2(0.0, 0.0);
    let output1x: Vec2 = vec2(0.0, 0.0);
    let output1y: Vec2 = vec2(0.0, 0.0);
    let output1z: Vec2 = vec2(0.0, 0.0);
    let output1w: Vec2 = vec2(0.0, 0.0);
    let output2: Vec4 = vec4(0.0, 0.0, 0.0, 0.0);
    let output3: Vec4 = vec4(0.0, 0.0, 0.0, 0.0);

    let i0dx: Vec2 = normalizeSafe(vec2(cs01[0], cs01[1]));
    let i0dy: Vec2 = normalizeSafe(vec2(cs01[2], cs01[3]));
    let i0dz: Vec2 = normalizeSafe(vec2(cs23[0], cs23[1]));
    let i0dw: Vec2 = normalizeSafe(vec2(cs23[2], cs23[3]));
    let i1dx: Vec2 = normalizeSafe(vec2(cs45[0], cs45[1]));
    let i1dy: Vec2 = normalizeSafe(vec2(cs45[2], cs45[3]));
    let i1dz: Vec2 = normalizeSafe(vec2(cs67[0], cs67[1]));
    let i1dw: Vec2 = normalizeSafe(vec2(cs67[2], cs67[3]));
    let s0123X: Vec4 = vec4(cs01[0], cs01[2], cs23[0], cs23[2]);
    let s4567X: Vec4 = vec4(cs45[0], cs45[2], cs67[0], cs67[2]);
    let s0123Y: Vec4 = vec4(cs01[1], cs01[3], cs23[1], cs23[3]);
    let s4567Y: Vec4 = vec4(cs45[1], cs45[3], cs67[1], cs67[3]);
    let avgDir: Vec2 = normalizeSafe(
      vec2(
        dot(s0123X, uDirWeight0123) + dot(s4567X, uDirWeight4567),
        dot(s0123Y, uDirWeight0123) + dot(s4567Y, uDirWeight4567)
      )
    );

    const rWeights = reactions.map((r) => eval(r.weight));

    for (let i: Int = 0; i < 16; i++) {
      let i0: Vec4 = vec4(0.0, 0.0, 0.0, 0.0);
      let i1: Vec4 = vec4(0.0, 0.0, 0.0, 0.0);
      let i2: Vec4 = vec4(0.0, 0.0, 0.0, 0.0);
      let i3: Vec4 = vec4(0.0, 0.0, 0.0, 0.0);
      let o0x: Vec2 = vec2(0.0, 0.0);
      let o0y: Vec2 = vec2(0.0, 0.0);
      let o0z: Vec2 = vec2(0.0, 0.0);
      let o0w: Vec2 = vec2(0.0, 0.0);
      let o1x: Vec2 = vec2(0.0, 0.0);
      let o1y: Vec2 = vec2(0.0, 0.0);
      let o1z: Vec2 = vec2(0.0, 0.0);
      let o1w: Vec2 = vec2(0.0, 0.0);
      let o2: Vec4 = vec4(0.0, 0.0, 0.0, 0.0);
      let o3: Vec4 = vec4(0.0, 0.0, 0.0, 0.0);

      for (let j: Int = 0; j < reactions.length; j++) {
        const [rInput0, rInput1, rInput2, rInput3, rOutput0, rOutput1, rOutput2, rOutput3] = reactions[j].uniforms;
        const rWeight = rWeights[j];
        if (
          // if the output of a reaction is an address, and the current grid cell is that address, skip the reaction
          dot(initial2, rOutput2) === 0.0 &&
          dot(initial3, rOutput3) === 0.0
        ) {
          let iaVec: Vec4 = min(
            min(divSafe(input0, rInput0, bigilon), divSafe(input1, rInput1, bigilon)),
            min(divSafe(input2, rInput2, bigilon), divSafe(input3, rInput3, bigilon))
          );
          let inputAvailability: Float = min(min(iaVec[0], iaVec[1]), min(iaVec[2], iaVec[3]));
          let reactionSpeed: Float = inputAvailability * rWeight;
          i0 = add(i0, mul(rInput0, reactionSpeed));
          i1 = add(i1, mul(rInput1, reactionSpeed));
          i2 = add(i2, mul(rInput2, reactionSpeed));
          i3 = add(i3, mul(rInput3, reactionSpeed));
          let direction: Vec2 = normalizeSafe(mix(
            add(
              add(add(mul(i0dx, rInput0[0]), mul(i0dy, rInput0[1])), add(mul(i0dz, rInput0[2]), mul(i0dw, rInput0[3]))),
              add(add(mul(i1dx, rInput1[0]), mul(i1dy, rInput1[1])), add(mul(i1dz, rInput1[2]), mul(i1dw, rInput1[3])))
            ),
            avgDir,
            epsilon
          ));
          o0x = add(o0x, mul(rOutput0[0], mul(direction, reactionSpeed)));
          o0y = add(o0y, mul(rOutput0[1], mul(direction, reactionSpeed)));
          o0z = add(o0z, mul(rOutput0[2], mul(direction, reactionSpeed)));
          o0w = add(o0w, mul(rOutput0[3], mul(direction, reactionSpeed)));
          o1x = add(o1x, mul(rOutput1[0], mul(direction, reactionSpeed)));
          o1y = add(o1y, mul(rOutput1[1], mul(direction, reactionSpeed)));
          o1z = add(o1z, mul(rOutput1[2], mul(direction, reactionSpeed)));
          o1w = add(o1w, mul(rOutput1[3], mul(direction, reactionSpeed)));
          o2 = add(o2, mul(rOutput2, reactionSpeed));
          o3 = add(o3, mul(rOutput3, reactionSpeed));
        }
      }
      let scalebackVec: Vec4 = max(
        max(divSafe(input0, i0, 0.0), divSafe(input1, i1, 0.0)),
        max(divSafe(input2, i2, 0.0), divSafe(input3, i3, 0.0))
      );
      let scaleback: Float = min(
        max(max(scalebackVec[0], scalebackVec[1]), max(scalebackVec[2], scalebackVec[3])),
        1.0
      );
      input0 = sub(input0, mul(i0, scaleback));
      input1 = sub(input1, mul(i1, scaleback));
      input2 = sub(input2, mul(i2, scaleback));
      input3 = sub(input3, mul(i3, scaleback));
      output0x = add(output0x, mul(o0x, scaleback));
      output0y = add(output0y, mul(o0y, scaleback));
      output0z = add(output0z, mul(o0z, scaleback));
      output0w = add(output0w, mul(o0w, scaleback));
      output1x = add(output1x, mul(o1x, scaleback));
      output1y = add(output1y, mul(o1y, scaleback));
      output1z = add(output1z, mul(o1z, scaleback));
      output1w = add(output1w, mul(o1w, scaleback));
      output2 = add(output2, mul(o2, scaleback));
      output3 = add(output3, mul(o3, scaleback));
      if (scaleback === 1.0 || scaleback < epsilon) {
        break;
      }
    }

    let s0: Vec2 = mul(input0[0], i0dx);
    let s1: Vec2 = mul(input0[1], i0dy);
    let s2: Vec2 = mul(input0[2], i0dz);
    let s3: Vec2 = mul(input0[3], i0dw);
    let s4: Vec2 = mul(input1[0], i1dx);
    let s5: Vec2 = mul(input1[1], i1dy);
    let s6: Vec2 = mul(input1[2], i1dz);
    let s7: Vec2 = mul(input1[3], i1dw);
    s0 = mul(normalizeSafe(add(output0x, s0)), len(output0x) + input0[0]);
    s1 = mul(normalizeSafe(add(output0y, s1)), len(output0y) + input0[1]);
    s2 = mul(normalizeSafe(add(output0z, s2)), len(output0z) + input0[2]);
    s3 = mul(normalizeSafe(add(output0w, s3)), len(output0w) + input0[3]);
    s4 = mul(normalizeSafe(add(output1x, s4)), len(output1x) + input1[0]);
    s5 = mul(normalizeSafe(add(output1y, s5)), len(output1y) + input1[1]);
    s6 = mul(normalizeSafe(add(output1z, s6)), len(output1z) + input1[2]);
    s7 = mul(normalizeSafe(add(output1w, s7)), len(output1w) + input1[3]);
    if (len(s0) < epsilon) s0 = mul(s0, 0.0);
    if (len(s1) < epsilon) s1 = mul(s1, 0.0);
    if (len(s2) < epsilon) s2 = mul(s2, 0.0);
    if (len(s3) < epsilon) s3 = mul(s3, 0.0);
    if (len(s4) < epsilon) s4 = mul(s4, 0.0);
    if (len(s5) < epsilon) s5 = mul(s5, 0.0);
    if (len(s6) < epsilon) s6 = mul(s6, 0.0);
    if (len(s7) < epsilon) s7 = mul(s7, 0.0);

    let a0: Float = initial2[0] > 0.0 ? max(input2[0], epsilon) : -output2[0];
    let a1: Float = initial2[1] > 0.0 ? max(input2[1], epsilon) : -output2[1];
    let a2: Float = initial2[2] > 0.0 ? max(input2[2], epsilon) : -output2[2];
    let a3: Float = initial2[3] > 0.0 ? max(input2[3], epsilon) : -output2[3];
    let a4: Float = initial3[0] > 0.0 ? max(input3[0], epsilon) : -output3[0];
    let a5: Float = initial3[1] > 0.0 ? max(input3[1], epsilon) : -output3[1];
    let a6: Float = initial3[2] > 0.0 ? max(input3[2], epsilon) : -output3[2];
    let a7: Float = initial3[3] > 0.0 ? max(input3[3], epsilon) : -output3[3];

    return [
      vec4(s0[0], s0[1], s1[0], s1[1]),
      vec4(s2[0], s2[1], s3[0], s3[1]),
      vec4(a0, a1, a2, a3),
      vec4(a4, a5, a6, a7),
      vec4(s4[0], s4[1], s5[0], s5[1]),
      vec4(s6[0], s6[1], s7[0], s7[1]),
    ];
  }

  return substanceReact;
}
function addressPrepare(vUV: Vec2, uniforms: Uniforms, textures: Texture[]) {
  let ca0123: Vec4 = texture(textures[0], vUV); // address0123
  let ca4567: Vec4 = texture(textures[1], vUV); // address4567
  return [max(mul(ca0123, -1.0), 0.0), max(mul(ca4567, -1.0), 0.0)];
}
function addressRun(vUV: Vec2, uniforms: Uniforms, textures: Texture[]) {
  let ca0123: Vec4 = texture(textures[0], vUV); // address0123
  let ca4567: Vec4 = texture(textures[1], vUV); // address4567
  let cat0123: Vec4 = texture(textures[2], vUV); // addressTotal0123
  let cat4567: Vec4 = texture(textures[3], vUV); // addressTotal4567

  return [
    vec4(
      ca0123[0] > 0.0 ? ca0123[0] + cat0123[0] : ca0123[0],
      ca0123[1] > 0.0 ? ca0123[1] + cat0123[1] : ca0123[1],
      ca0123[2] > 0.0 ? ca0123[2] + cat0123[2] : ca0123[2],
      ca0123[3] > 0.0 ? ca0123[3] + cat0123[3] : ca0123[3]
    ),
    vec4(
      ca4567[0] > 0.0 ? ca4567[0] + cat4567[0] : ca4567[0],
      ca4567[1] > 0.0 ? ca4567[1] + cat4567[1] : ca4567[1],
      ca4567[2] > 0.0 ? ca4567[2] + cat4567[2] : ca4567[2],
      ca4567[3] > 0.0 ? ca4567[3] + cat4567[3] : ca4567[3]
    ),
  ];
}

export class Sim {
  size = null;
  uniforms = null;
  textures = {};
  reduce(textureIn, textureOut) {
    const total = this.textures[textureIn].reduce(
      (pv, v) =>
        add(
          pv,
          v.reduce((pv, v) => add(pv, v), [0, 0, 0, 0])
        ),
      [0, 0, 0, 0]
    );
    this.textures[textureOut] = [[total]];
  }
  compute(shader, texturesIn, texturesOut) {
    let buffer = {};
    for (const k of texturesOut) {
      buffer[k] = new Array(this.size).fill(null).map(() => new Array(this.size).fill(null).map(() => [0, 0, 0, 0]));
    }
    for (const k of [].concat(texturesIn, texturesOut)) {
      if (!this.textures[k]) {
        this.textures[k] = new Array(this.size)
          .fill(null)
          .map(() => new Array(this.size).fill(null).map(() => [0, 0, 0, 0]));
      }
    }

    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const vUV = vec2(x / this.size, y / this.size);
        const r = shader(
          vUV,
          this.uniforms,
          texturesIn.map((k) => this.textures[k])
        );
        r.forEach((value, i) => {
          const textureName = texturesOut[i];
          buffer[textureName][y][x] = value;
        });
      }
    }
    Object.assign(this.textures, buffer);
  }
}

// transferPrepare
// transferRun
// substanceReact
// addressPrepare
// reduce(addressPrepare)
// addressRun
// custom
// stats
// reduce(stats)
// display
export function cycle(sim: Sim, config) {
  sim.compute(copyPaste, ['s01'], ['s01Prev']);
  sim.compute(copyPaste, ['s23'], ['s23Prev']);
  sim.compute(copyPaste, ['s45'], ['s45Prev']);
  sim.compute(copyPaste, ['s67'], ['s67Prev']);
  sim.compute(compactLength, ['s01', 's23'], ['s0123Len']);
  sim.compute(compactLength, ['s45', 's67'], ['s4567Len']);
  sim.compute(
    transferPrepare,
    ['s01', 's23', 's0123Len', 's45', 's67', 's4567Len'],
    [
      's01FWTFS', 's2_FWTFS', 's01Given', 's23Given',
      's45FWTFS', 's67FWTFS', 's45Given', 's67Given',
    ]
  );
  sim.compute(
    transferRun,
    [
      's01', 's23', 's01FWTFS', 's2_FWTFS', 's01Given', 's23Given',
      's45', 's67', 's45FWTFS', 's67FWTFS', 's45Given', 's67Given',
    ],
    ['s01', 's23', 's45', 's67']
  );
  const substanceReact = substanceReactGenerator(config);
  sim.compute(
    substanceReact,
    ['s01', 's23', 'a0123', 'a4567', 's45', 's67'],
    ['s01', 's23', 'a0123', 'a4567', 's45', 's67']
  );
  sim.compute(addressPrepare, ['a0123', 'a4567'], ['ap0123', 'ap4567']);
  sim.reduce('ap0123', 'at0123');
  sim.reduce('ap4567', 'at4567');
  sim.compute(addressRun, ['a0123', 'a4567', 'at0123', 'at4567'], ['a0123', 'a4567']);

  // await sim.display([
  //   's01', 's23', 's45', 's67',
  //   's01Prev', 's23Prev', 's45Prev', 's67Prev',
  //   's01Given', 's23Given', 's45Given', 's67Given',
  //   'a0123', 'a4567',
  // ]);
}
