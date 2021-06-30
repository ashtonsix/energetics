#version 300 es

precision highp float;

in vec2 vUV;
uniform sampler2D texture0;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform sampler2D texture3;
uniform sampler2D texture4;
uniform sampler2D texture5;
uniform sampler2D texture6;
uniform sampler2D texture7;
uniform sampler2D texture8;
uniform sampler2D texture9;
uniform sampler2D texture10;
uniform sampler2D texture11;
layout(std140) uniform StaticUniforms {
  float uSize;
  float uTransferRadius;
};
layout(std140) uniform SubstanceUniforms {
  vec4 uArc012_;
  vec4 uArcWeight012_;
  vec4 uArcBlending012_;
  vec4 uFlo012_;
  vec4 uFloWeight012_;
  vec4 uFloBlending012_;
  vec4 uDirWeight012_;
  vec4 uDirBlending012_;
  vec4 uArc4567;
  vec4 uArcWeight4567;
  vec4 uArcBlending4567;
  vec4 uFlo4567;
  vec4 uFloWeight4567;
  vec4 uFloBlending4567;
  vec4 uDirWeight4567;
  vec4 uDirBlending4567;
};
layout(std140) uniform SubstanceAttractionMatrixUniforms {
  vec4 am0x012_;
  vec4 am1x012_;
  vec4 am2x012_;
  vec4 am_x012_;
  vec4 am4x012_;
  vec4 am5x012_;
  vec4 am6x012_;
  vec4 am7x012_;
  vec4 am0x4567;
  vec4 am1x4567;
  vec4 am2x4567;
  vec4 am_x4567;
  vec4 am4x4567;
  vec4 am5x4567;
  vec4 am6x4567;
  vec4 am7x4567;
};
layout(location=0) out vec4 fragColor0;
layout(location=1) out vec4 fragColor1;
layout(location=2) out vec4 fragColor2;
layout(location=3) out vec4 fragColor3;
layout(location=4) out vec4 fragColor4;
layout(location=5) out vec4 fragColor5;
layout(location=6) out vec4 fragColor6;
layout(location=7) out vec4 fragColor7;

float PI = 3.141592653589793;
float PI2 = 6.283185307179586;
float epsilon = 0.000000001;
float bigilon = 999999999.9;

vec4 fill(in vec4 v) {
  return vec4(
    (isnan(v.x) || isinf(v.x)) ? 0.0 : v.x,
    (isnan(v.y) || isinf(v.y)) ? 0.0 : v.y,
    (isnan(v.z) || isinf(v.z)) ? 0.0 : v.z,
    (isnan(v.w) || isinf(v.w)) ? 0.0 : v.w
  );
}

float divSafe(in float a, in float b, in float c) {
  return b == 0.0 ? c : a / b;
}
vec2 divSafe(in vec2 a, in float b, in float c) {
  return b == 0.0 ? vec2(c, c) : a / b;
}
vec4 divSafe(in vec4 a, in float b, in float c) {
  return b == 0.0 ? vec4(c, c, c, c) : a / b;
}
vec2 divSafe(in vec2 a, in vec2 b, in float c) {
  return vec2(
    b.x == 0.0 ? c : a.x / b.x,
    b.y == 0.0 ? c : a.y / b.y
  );
}
vec4 divSafe(in vec4 a, in vec4 b, in float c) {
  return vec4(
    b.x == 0.0 ? c : a.x / b.x,
    b.y == 0.0 ? c : a.y / b.y,
    b.z == 0.0 ? c : a.z / b.z,
    b.w == 0.0 ? c : a.w / b.w
  );
}

vec2 normalizeSafe(in vec2 v) {
  return (v.x == 0.0 && v.y == 0.0) ? vec2(0.0, 0.0) : normalize(v);
}

vec4 sumVec = vec4(1.0, 1.0, 1.0, 1.0);
float sum(in vec4 x) {
  return dot(x, sumVec);
}

vec4 getNextBound(in vec4 bound) {
  float ix = bound.x;
  float iy = bound.y;
  float it = bound.z;
  float radius = bound.w;
  float ox = 0.0;
  float oy = 0.0;
  float ot = 7.0;
  if ((it < PI && abs(ix - 0.5) < radius) || abs(ix + 0.5) >= radius) {
    float x = ix - 0.5;
    float y = pow(pow(radius, 2.0) - pow(x, 2.0), 0.5);
    float t = atan(y, x);
    if (t < 0.0) t += 2.0 * PI;
    if (t < it) t += 2.0 * PI;
    if (t < ot) {
      ox = ix - 1.0;
      oy = iy;
      ot = t;
    }
  }
  if (((it <= PI * 0.5 || it >= PI * 1.5) && abs(iy + 0.5) < radius) || abs(iy - 0.5) >= radius) {
    float y = iy + 0.5;
    float x = pow(pow(radius, 2.0) - pow(y, 2.0), 0.5);
    float t = atan(y, x);
    if (t < 0.0) t += 2.0 * PI;
    if (t < it) t += 2.0 * PI;
    if (t < ot) {
      ox = ix;
      oy = iy + 1.0;
      ot = t;
    }
  }
  if ((it >= PI && abs(ix + 0.5) < radius) || abs(ix - 0.5) >= radius) {
    float x = ix + 0.5;
    float y = -pow(pow(radius, 2.0) - pow(x, 2.0), 0.5);
    float t = atan(y, x);
    if (t < 0.0) t += 2.0 * PI;
    if (t < it) t += 2.0 * PI;
    if (t < ot) {
      ox = ix + 1.0;
      oy = iy;
      ot = t;
    }
  }
  if ((it > PI * 0.5 && it < PI * 1.5 && abs(iy - 0.5) < radius) || abs(iy + 0.5) >= radius) {
    float y = iy - 0.5;
    float x = -pow(pow(radius, 2.0) - pow(y, 2.0), 0.5);
    float t = atan(y, x);
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

vec2 arcOverlap(in float loCel, in float hiCel, in float loArc, in float hiArc) {
  float length = 0.0;
  float theta = 0.0;
  float arcMidpointOpposite = mod((hiArc + loArc) / 2.0 + PI, PI2);
  if (
    (
      (arcMidpointOpposite > loCel && arcMidpointOpposite < hiCel) ||
      ((arcMidpointOpposite + PI2) > loCel && (arcMidpointOpposite + PI2) < hiCel)
    ) &&
    (hiCel - loCel) + (hiArc - loArc) >= PI2
  ) {
    float loGap = hiArc;
    float hiGap = loArc + PI2;
    if (loGap >= hiCel) {
      loGap -= PI2;
      hiGap -= PI2;
    }
    loGap = max(loGap, loCel);
    hiGap = min(hiGap, hiCel);
    float midpointA = (loCel + loGap) / 2.0;
    float midpointB = (hiCel + hiGap) / 2.0;
    float lengthA = abs(loCel - loGap);
    float lengthB = abs(hiCel - hiGap);
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
    float lo = max(min(loArc, hiCel), loCel);
    float hi = max(min(hiArc, hiCel), loCel);
  
    length = (hi - lo) / (hiArc - loArc);
    theta = mod((lo + hi) / 2.0, PI2);
  }

  return vec2(cos(theta) * length, sin(theta) * length);
}

void copyPaste() {
  fragColor0 = texture(texture0, vUV);
}

void compactLength() {
  vec4 c01 = texture(texture0, vUV); // substance01
  vec4 c23 = texture(texture1, vUV); // substance23
  vec2 s0 = c01.xy;
  vec2 s1 = c01.zw;
  vec2 s2 = c23.xy;
  vec2 s3 = c23.zw;

  fragColor0 = vec4(length(s0), length(s1), length(s2), length(s3));
}

void transferPrepare() {
  vec4 c01a = texture(texture0, vUV); // substance01a
  vec4 c2_a = texture(texture1, vUV); // substance2_a
  /*8 vec4 c45a = texture(texture3, vUV); 8*/ // substance45a
  /*8 vec4 c67a = texture(texture4, vUV); 8*/ // substance67a
  c2_a.z = 0.0;
  c2_a.w = 0.0;
  vec2 s0a = c01a.xy;
  vec2 s1a = c01a.zw;
  vec2 s2a = c2_a.xy;
  vec2 s_a = c2_a.zw;
  /*8 vec2 s4a = c45a.xy; 8*/
  /*8 vec2 s5a = c45a.zw; 8*/
  /*8 vec2 s6a = c67a.xy; 8*/
  /*8 vec2 s7a = c67a.zw; 8*/
  float s0aLen = length(s0a);
  float s1aLen = length(s1a);
  float s2aLen = length(s2a);
  float s_aLen = length(s_a);
  /*8 float s4aLen = length(s4a); 8*/
  /*8 float s5aLen = length(s5a); 8*/
  /*8 float s6aLen = length(s6a); 8*/
  /*8 float s7aLen = length(s7a); 8*/
  vec4 s012_aLen = vec4(s0aLen, s1aLen, s2aLen, s_aLen);
  /*8 vec4 s4567aLen = vec4(s4aLen, s5aLen, s6aLen, s7aLen); 8*/
  vec4 s012_aX = vec4(s0a.x, s1a.x, s2a.x, s_a.x);
  /*8 vec4 s4567aX = vec4(s4a.x, s5a.x, s6a.x, s7a.x); 8*/
  vec4 s012_aY = vec4(s0a.y, s1a.y, s2a.y, s_a.y);
  /*8 vec4 s4567aY = vec4(s4a.y, s5a.y, s6a.y, s7a.y); 8*/

  float avgArc = divSafe(
    dot(uArc012_, s012_aLen * uArcWeight012_) /*8 + dot(uArc4567, s4567aLen * uArcWeight4567) 8*/,
    dot(s012_aLen, uArcWeight012_) /*8 + dot(s4567aLen, uArcWeight4567) 8*/,
    -1.0
  );
  float avgFlo = divSafe(
    dot(uFlo012_, s012_aLen * uFloWeight012_) /*8 + dot(uFlo4567, s4567aLen * uFloWeight4567) 8*/,
    dot(s012_aLen, uFloWeight012_) /*8 + dot(s4567aLen, uFloWeight4567) 8*/,
    -1.0
  );
  vec2 avgDir = normalizeSafe(
    vec2(
      dot(s012_aX, uDirWeight012_) /*8 + dot(s4567aX, uDirWeight4567) 8*/,
      dot(s012_aY, uDirWeight012_) /*8 + dot(s4567aY, uDirWeight4567) 8*/
    )
  );

  vec4 s012_aArc = avgArc == -1.0 ? uArc012_ : mix(uArc012_, vec4(avgArc, avgArc, avgArc, avgArc), uArcBlending012_);
  /*8 vec4 s4567aArc = avgArc == -1.0 ? uArc4567 : mix(uArc4567, vec4(avgArc, avgArc, avgArc, avgArc), uArcBlending4567); 8*/
  vec4 s012_aFlo = avgFlo == -1.0 ? uFlo012_ : mix(uFlo012_, vec4(avgFlo, avgFlo, avgFlo, avgFlo), uFloBlending012_);
  /*8 vec4 s4567aFlo = avgFlo == -1.0 ? uFlo4567 : mix(uFlo4567, vec4(avgFlo, avgFlo, avgFlo, avgFlo), uFloBlending4567); 8*/
  s012_aFlo = s012_aFlo * s012_aLen;
  /*8 s4567aFlo = s4567aFlo * s4567aLen; 8*/
  s0a = normalizeSafe(mix(normalizeSafe(s0a), avgDir, uDirBlending012_.x)) * s0aLen;
  s1a = normalizeSafe(mix(normalizeSafe(s1a), avgDir, uDirBlending012_.y)) * s1aLen;
  s2a = normalizeSafe(mix(normalizeSafe(s2a), avgDir, uDirBlending012_.z)) * s2aLen;
  s_a = normalizeSafe(mix(normalizeSafe(s_a), avgDir, uDirBlending012_.w)) * s_aLen;
  /*8 s4a = normalizeSafe(mix(normalizeSafe(s4a), avgDir, uDirBlending4567.x)) * s4aLen; 8*/
  /*8 s5a = normalizeSafe(mix(normalizeSafe(s5a), avgDir, uDirBlending4567.y)) * s5aLen; 8*/
  /*8 s6a = normalizeSafe(mix(normalizeSafe(s6a), avgDir, uDirBlending4567.z)) * s6aLen; 8*/
  /*8 s7a = normalizeSafe(mix(normalizeSafe(s7a), avgDir, uDirBlending4567.w)) * s7aLen; 8*/

  vec4 s012_Bisector = vec4(
    atan(s0a.y, s0a.x),
    atan(s1a.y, s1a.x),
    atan(s2a.y, s2a.x),
    atan(s_a.y, s_a.x)
  );
  /*8 vec4 s4567Bisector = vec4(
    atan(s4a.y, s4a.x),
    atan(s5a.y, s5a.x),
    atan(s6a.y, s6a.x),
    atan(s7a.y, s7a.x)
  ); 8*/
  vec4 s012_aLoBound = mod(s012_Bisector - s012_aArc + PI2, PI2);
  /*8 vec4 s4567aLoBound = mod(s4567Bisector - s4567aArc + PI2, PI2); 8*/
  vec4 s012_aHiBound = mod(s012_Bisector + s012_aArc + PI2, PI2);
  /*8 vec4 s4567aHiBound = mod(s4567Bisector + s4567aArc + PI2, PI2); 8*/

  s012_aHiBound = vec4(
    s012_aLoBound.x > (s012_aHiBound.x - epsilon) ? s012_aHiBound.x + PI2 : s012_aHiBound.x,
    s012_aLoBound.y > (s012_aHiBound.y - epsilon) ? s012_aHiBound.y + PI2 : s012_aHiBound.y,
    s012_aLoBound.z > (s012_aHiBound.z - epsilon) ? s012_aHiBound.z + PI2 : s012_aHiBound.z,
    s012_aLoBound.w > (s012_aHiBound.w - epsilon) ? s012_aHiBound.w + PI2 : s012_aHiBound.w
  );
  /*8 s4567aHiBound = vec4(
    s4567aLoBound.x > (s4567aHiBound.x - epsilon) ? s4567aHiBound.x + PI2 : s4567aHiBound.x,
    s4567aLoBound.y > (s4567aHiBound.y - epsilon) ? s4567aHiBound.y + PI2 : s4567aHiBound.y,
    s4567aLoBound.z > (s4567aHiBound.z - epsilon) ? s4567aHiBound.z + PI2 : s4567aHiBound.z,
    s4567aLoBound.w > (s4567aHiBound.w - epsilon) ? s4567aHiBound.w + PI2 : s4567aHiBound.w
  ); 8*/

  float s0TransferFractionSum = 0.0;
  float s1TransferFractionSum = 0.0;
  float s2TransferFractionSum = 0.0;
  float s_TransferFractionSum = 0.0;
  /*8 float s4TransferFractionSum = 0.0; 8*/
  /*8 float s5TransferFractionSum = 0.0; 8*/
  /*8 float s6TransferFractionSum = 0.0; 8*/
  /*8 float s7TransferFractionSum = 0.0; 8*/
  vec2 s0GivenDir = vec2(0.0, 0.0);
  vec2 s1GivenDir = vec2(0.0, 0.0);
  vec2 s2GivenDir = vec2(0.0, 0.0);
  vec2 s_GivenDir = vec2(0.0, 0.0);
  /*8 vec2 s4GivenDir = vec2(0.0, 0.0); 8*/
  /*8 vec2 s5GivenDir = vec2(0.0, 0.0); 8*/
  /*8 vec2 s6GivenDir = vec2(0.0, 0.0); 8*/
  /*8 vec2 s7GivenDir = vec2(0.0, 0.0); 8*/

  vec4 prevBound = vec4(round(uTransferRadius), 0, 0, uTransferRadius);
  vec4 nextBound = getNextBound(prevBound);
  for (int i = 0; i < 999; i++) {
    prevBound = nextBound;
    nextBound = getNextBound(prevBound);

    float loBound = prevBound.z;
    float hiBound = nextBound.z;
    if (loBound >= hiBound) {
      hiBound += PI2;
    }
    if (abs(hiBound - loBound) < 0.001) {
      continue;
    }

    vec2 vvUV = vec2(vUV.x + prevBound.x / uSize, vUV.y + prevBound.y / uSize);
    vec4 s012_bLen = texture(texture2, vvUV); // substance012_b
    s012_bLen.w = 0.0;
    /*8 vec4 s4567bLen = texture(texture5, vvUV); 8*/ // substance4567b

    float sbLenTotal = sum(s012_bLen) /*8 + sum(s4567bLen) 8*/;
    s012_bLen = divSafe(s012_bLen, sbLenTotal, 0.0);
    /*8 s4567bLen = divSafe(s4567bLen, sbLenTotal, 0.0); 8*/

    float s0Attraction = dot(s012_bLen, max(am0x012_, 0.0)) /*8 + dot(s4567bLen, max(am0x4567, 0.0)) 8*/;
    float s1Attraction = dot(s012_bLen, max(am1x012_, 0.0)) /*8 + dot(s4567bLen, max(am1x4567, 0.0)) 8*/;
    float s2Attraction = dot(s012_bLen, max(am2x012_, 0.0)) /*8 + dot(s4567bLen, max(am2x4567, 0.0)) 8*/;
    float s_Attraction = dot(s012_bLen, max(am_x012_, 0.0)) /*8 + dot(s4567bLen, max(am_x4567, 0.0)) 8*/;
    /*8 float s4Attraction = dot(s012_bLen, max(am4x012_, 0.0)) + dot(s4567bLen, max(am4x4567, 0.0)); 8*/
    /*8 float s5Attraction = dot(s012_bLen, max(am5x012_, 0.0)) + dot(s4567bLen, max(am5x4567, 0.0)); 8*/
    /*8 float s6Attraction = dot(s012_bLen, max(am6x012_, 0.0)) + dot(s4567bLen, max(am6x4567, 0.0)); 8*/
    /*8 float s7Attraction = dot(s012_bLen, max(am7x012_, 0.0)) + dot(s4567bLen, max(am7x4567, 0.0)); 8*/
    s0Attraction *= 1.0 / (1.0 + dot(s012_bLen, max(-am0x012_, 0.0)) /*8 + dot(s4567bLen, max(-am0x4567, 0.0)) 8*/);
    s1Attraction *= 1.0 / (1.0 + dot(s012_bLen, max(-am1x012_, 0.0)) /*8 + dot(s4567bLen, max(-am1x4567, 0.0)) 8*/);
    s2Attraction *= 1.0 / (1.0 + dot(s012_bLen, max(-am2x012_, 0.0)) /*8 + dot(s4567bLen, max(-am2x4567, 0.0)) 8*/);
    s_Attraction *= 1.0 / (1.0 + dot(s012_bLen, max(-am_x012_, 0.0)) /*8 + dot(s4567bLen, max(-am_x4567, 0.0)) 8*/);
    /*8 s4Attraction *= 1.0 / (1.0 + dot(s012_bLen, max(-am4x012_, 0.0)) + dot(s4567bLen, max(-am4x4567, 0.0))); 8*/
    /*8 s5Attraction *= 1.0 / (1.0 + dot(s012_bLen, max(-am5x012_, 0.0)) + dot(s4567bLen, max(-am5x4567, 0.0))); 8*/
    /*8 s6Attraction *= 1.0 / (1.0 + dot(s012_bLen, max(-am6x012_, 0.0)) + dot(s4567bLen, max(-am6x4567, 0.0))); 8*/
    /*8 s7Attraction *= 1.0 / (1.0 + dot(s012_bLen, max(-am7x012_, 0.0)) + dot(s4567bLen, max(-am7x4567, 0.0))); 8*/
    s0Attraction = sbLenTotal == 0.0 ? 1.0 : s0Attraction;
    s1Attraction = sbLenTotal == 0.0 ? 1.0 : s1Attraction;
    s2Attraction = sbLenTotal == 0.0 ? 1.0 : s2Attraction;
    s_Attraction = sbLenTotal == 0.0 ? 1.0 : s_Attraction;
    /*8 s4Attraction = sbLenTotal == 0.0 ? 1.0 : s4Attraction; 8*/
    /*8 s5Attraction = sbLenTotal == 0.0 ? 1.0 : s5Attraction; 8*/
    /*8 s6Attraction = sbLenTotal == 0.0 ? 1.0 : s6Attraction; 8*/
    /*8 s7Attraction = sbLenTotal == 0.0 ? 1.0 : s7Attraction; 8*/

    vec2 s0TransferFraction = arcOverlap(loBound, hiBound, s012_aLoBound.x, s012_aHiBound.x) * s0Attraction;
    vec2 s1TransferFraction = arcOverlap(loBound, hiBound, s012_aLoBound.y, s012_aHiBound.y) * s1Attraction;
    vec2 s2TransferFraction = arcOverlap(loBound, hiBound, s012_aLoBound.z, s012_aHiBound.z) * s2Attraction;
    vec2 s_TransferFraction = arcOverlap(loBound, hiBound, s012_aLoBound.w, s012_aHiBound.w) * s_Attraction;
    /*8 vec2 s4TransferFraction = arcOverlap(loBound, hiBound, s4567aLoBound.x, s4567aHiBound.x) * s4Attraction; 8*/
    /*8 vec2 s5TransferFraction = arcOverlap(loBound, hiBound, s4567aLoBound.y, s4567aHiBound.y) * s5Attraction; 8*/
    /*8 vec2 s6TransferFraction = arcOverlap(loBound, hiBound, s4567aLoBound.z, s4567aHiBound.z) * s6Attraction; 8*/
    /*8 vec2 s7TransferFraction = arcOverlap(loBound, hiBound, s4567aLoBound.w, s4567aHiBound.w) * s7Attraction; 8*/

    s0TransferFractionSum += length(s0TransferFraction);
    s1TransferFractionSum += length(s1TransferFraction);
    s2TransferFractionSum += length(s2TransferFraction);
    s_TransferFractionSum += length(s_TransferFraction);
    /*8 s4TransferFractionSum += length(s4TransferFraction); 8*/
    /*8 s5TransferFractionSum += length(s5TransferFraction); 8*/
    /*8 s6TransferFractionSum += length(s6TransferFraction); 8*/
    /*8 s7TransferFractionSum += length(s7TransferFraction); 8*/

    s0GivenDir = s0GivenDir + s0TransferFraction;
    s1GivenDir = s1GivenDir + s1TransferFraction;
    s2GivenDir = s2GivenDir + s2TransferFraction;
    s_GivenDir = s_GivenDir + s_TransferFraction;
    /*8 s4GivenDir = s4GivenDir + s4TransferFraction; 8*/
    /*8 s5GivenDir = s5GivenDir + s5TransferFraction; 8*/
    /*8 s6GivenDir = s6GivenDir + s6TransferFraction; 8*/
    /*8 s7GivenDir = s7GivenDir + s7TransferFraction; 8*/

    if (hiBound > PI2) {
      break;
    }
  }

  // flowWeightedTransferFractionSum
  vec2 s0FWTFS = normalizeSafe(s0a) * divSafe(s0TransferFractionSum, s012_aFlo.x, 0.0);
  vec2 s1FWTFS = normalizeSafe(s1a) * divSafe(s1TransferFractionSum, s012_aFlo.y, 0.0);
  vec2 s2FWTFS = normalizeSafe(s2a) * divSafe(s2TransferFractionSum, s012_aFlo.z, 0.0);
  vec2 s_FWTFS = normalizeSafe(s_a) * divSafe(s_TransferFractionSum, s012_aFlo.w, 0.0);
  /*8 vec2 s4FWTFS = normalizeSafe(s4a) * divSafe(s4TransferFractionSum, s4567aFlo.x, 0.0); 8*/
  /*8 vec2 s5FWTFS = normalizeSafe(s5a) * divSafe(s5TransferFractionSum, s4567aFlo.y, 0.0); 8*/
  /*8 vec2 s6FWTFS = normalizeSafe(s6a) * divSafe(s6TransferFractionSum, s4567aFlo.z, 0.0); 8*/
  /*8 vec2 s7FWTFS = normalizeSafe(s7a) * divSafe(s7TransferFractionSum, s4567aFlo.w, 0.0); 8*/

  vec4 s01FWTFS = vec4(s0FWTFS, s1FWTFS);
  vec4 s2_FWTFS = vec4(s2FWTFS, s_FWTFS);
  /*8 vec4 s45FWTFS = vec4(s4FWTFS, s5FWTFS); 8*/
  /*8 vec4 s67FWTFS = vec4(s6FWTFS, s7FWTFS); 8*/

  vec2 s0Given = normalizeSafe(s0GivenDir) * s012_aFlo.x;
  vec2 s1Given = normalizeSafe(s1GivenDir) * s012_aFlo.y;
  vec2 s2Given = normalizeSafe(s2GivenDir) * s012_aFlo.z;
  vec2 s_Given = normalizeSafe(s_GivenDir) * s012_aFlo.w;
  /*8 vec2 s4Given = normalizeSafe(s4GivenDir) * s4567aFlo.x; 8*/
  /*8 vec2 s5Given = normalizeSafe(s5GivenDir) * s4567aFlo.y; 8*/
  /*8 vec2 s6Given = normalizeSafe(s6GivenDir) * s4567aFlo.z; 8*/
  /*8 vec2 s7Given = normalizeSafe(s7GivenDir) * s4567aFlo.w; 8*/

  vec4 s01Given = vec4(s0Given, s1Given);
  vec4 s2_Given = vec4(s2Given, s_Given);
  /*8 vec4 s45Given = vec4(s4Given, s5Given); 8*/
  /*8 vec4 s67Given = vec4(s6Given, s7Given); 8*/

  s2_FWTFS.z = avgArc;
  s2_FWTFS.w = avgFlo;
  s2_Given.z = 0.0;
  s2_Given.w = 0.0;

  fragColor0 = fill(s01FWTFS);
  fragColor1 = fill(s2_FWTFS);
  fragColor2 = fill(s01Given);
  fragColor3 = fill(s2_Given);
  fragColor4 = vec4(0.0, 0.0, 0.0, 0.0);
  fragColor5 = vec4(0.0, 0.0, 0.0, 0.0);
  fragColor6 = vec4(0.0, 0.0, 0.0, 0.0);
  fragColor7 = vec4(0.0, 0.0, 0.0, 0.0);
  /*8 fragColor4 = fill(s45FWTFS); 8*/
  /*8 fragColor5 = fill(s67FWTFS); 8*/
  /*8 fragColor6 = fill(s45Given); 8*/
  /*8 fragColor7 = fill(s67Given); 8*/
}

void transferRun() {
  vec4 c01b = texture(texture0, vUV); // substance01b
  vec4 c2_b = texture(texture1, vUV); // substance2_b
  /*8 vec4 c45b = texture(texture6, vUV); 8*/ // substance45b
  /*8 vec4 c67b = texture(texture7, vUV); 8*/ // substance67b
  c2_b.z = 0.0;
  c2_b.w = 0.0;
  vec2 s0b = vec2(c01b.x, c01b.y);
  vec2 s1b = vec2(c01b.z, c01b.w);
  vec2 s2b = vec2(c2_b.x, c2_b.y);
  vec2 s_b = vec2(c2_b.z, c2_b.w);
  /*8 vec2 s4b = vec2(c45b.x, c45b.y); 8*/
  /*8 vec2 s5b = vec2(c45b.z, c45b.w); 8*/
  /*8 vec2 s6b = vec2(c67b.x, c67b.y); 8*/
  /*8 vec2 s7b = vec2(c67b.z, c67b.w); 8*/
  float s0bLen = length(s0b);
  float s1bLen = length(s1b);
  float s2bLen = length(s2b);
  float s_bLen = length(s_b);
  /*8 float s4bLen = length(s4b); 8*/
  /*8 float s5bLen = length(s5b); 8*/
  /*8 float s6bLen = length(s6b); 8*/
  /*8 float s7bLen = length(s7b); 8*/
  vec4 s012_bLen = vec4(s0bLen, s1bLen, s2bLen, s_bLen);
  /*8 vec4 s4567bLen = vec4(s4bLen, s5bLen, s6bLen, s7bLen); 8*/

  float sbLenTotal = sum(s012_bLen) /*8 + sum(s4567bLen) 8*/;
  s012_bLen = divSafe(s012_bLen, sbLenTotal, 0.0);
  /*8 s4567bLen = divSafe(s4567bLen, sbLenTotal, 0.0); 8*/

  float s0Attraction = dot(s012_bLen, max(am0x012_, 0.0)) /*8 + dot(s4567bLen, max(am0x4567, 0.0)) 8*/;
  float s1Attraction = dot(s012_bLen, max(am1x012_, 0.0)) /*8 + dot(s4567bLen, max(am1x4567, 0.0)) 8*/;
  float s2Attraction = dot(s012_bLen, max(am2x012_, 0.0)) /*8 + dot(s4567bLen, max(am2x4567, 0.0)) 8*/;
  float s_Attraction = dot(s012_bLen, max(am_x012_, 0.0)) /*8 + dot(s4567bLen, max(am_x4567, 0.0)) 8*/;
  /*8 float s4Attraction = dot(s012_bLen, max(am4x012_, 0.0)) + dot(s4567bLen, max(am4x4567, 0.0)); 8*/
  /*8 float s5Attraction = dot(s012_bLen, max(am5x012_, 0.0)) + dot(s4567bLen, max(am5x4567, 0.0)); 8*/
  /*8 float s6Attraction = dot(s012_bLen, max(am6x012_, 0.0)) + dot(s4567bLen, max(am6x4567, 0.0)); 8*/
  /*8 float s7Attraction = dot(s012_bLen, max(am7x012_, 0.0)) + dot(s4567bLen, max(am7x4567, 0.0)); 8*/
  s0Attraction = s0Attraction / (1.0 + dot(s012_bLen, max(-am0x012_, 0.0)) /*8 + dot(s4567bLen, max(-am0x4567, 0.0)) 8*/);
  s1Attraction = s1Attraction / (1.0 + dot(s012_bLen, max(-am1x012_, 0.0)) /*8 + dot(s4567bLen, max(-am1x4567, 0.0)) 8*/);
  s2Attraction = s2Attraction / (1.0 + dot(s012_bLen, max(-am2x012_, 0.0)) /*8 + dot(s4567bLen, max(-am2x4567, 0.0)) 8*/);
  s_Attraction = s_Attraction / (1.0 + dot(s012_bLen, max(-am_x012_, 0.0)) /*8 + dot(s4567bLen, max(-am_x4567, 0.0)) 8*/);
  /*8 s4Attraction = s4Attraction / (1.0 + dot(s012_bLen, max(-am4x012_, 0.0)) + dot(s4567bLen, max(-am4x4567, 0.0))); 8*/
  /*8 s5Attraction = s5Attraction / (1.0 + dot(s012_bLen, max(-am5x012_, 0.0)) + dot(s4567bLen, max(-am5x4567, 0.0))); 8*/
  /*8 s6Attraction = s6Attraction / (1.0 + dot(s012_bLen, max(-am6x012_, 0.0)) + dot(s4567bLen, max(-am6x4567, 0.0))); 8*/
  /*8 s7Attraction = s7Attraction / (1.0 + dot(s012_bLen, max(-am7x012_, 0.0)) + dot(s4567bLen, max(-am7x4567, 0.0))); 8*/
  s0Attraction = sbLenTotal == 0.0 ? 1.0 : s0Attraction;
  s1Attraction = sbLenTotal == 0.0 ? 1.0 : s1Attraction;
  s2Attraction = sbLenTotal == 0.0 ? 1.0 : s2Attraction;
  s_Attraction = sbLenTotal == 0.0 ? 1.0 : s_Attraction;
  /*8 s4Attraction = sbLenTotal == 0.0 ? 1.0 : s4Attraction; 8*/
  /*8 s5Attraction = sbLenTotal == 0.0 ? 1.0 : s5Attraction; 8*/
  /*8 s6Attraction = sbLenTotal == 0.0 ? 1.0 : s6Attraction; 8*/
  /*8 s7Attraction = sbLenTotal == 0.0 ? 1.0 : s7Attraction; 8*/

  float s0FloLen = 0.0;
  float s1FloLen = 0.0;
  float s2FloLen = 0.0;
  float s_FloLen = 0.0;
  /*8 float s4FloLen = 0.0; 8*/
  /*8 float s5FloLen = 0.0; 8*/
  /*8 float s6FloLen = 0.0; 8*/
  /*8 float s7FloLen = 0.0; 8*/
  vec2 s0FloDir = vec2(0.0, 0.0);
  vec2 s1FloDir = vec2(0.0, 0.0);
  vec2 s2FloDir = vec2(0.0, 0.0);
  vec2 s_FloDir = vec2(0.0, 0.0);
  /*8 vec2 s4FloDir = vec2(0.0, 0.0); 8*/
  /*8 vec2 s5FloDir = vec2(0.0, 0.0); 8*/
  /*8 vec2 s6FloDir = vec2(0.0, 0.0); 8*/
  /*8 vec2 s7FloDir = vec2(0.0, 0.0); 8*/

  vec4 prevBound = vec4(round(uTransferRadius), 0, 0, uTransferRadius);
  vec4 nextBound = getNextBound(prevBound);
  for (int i = 0; i < 999; i++) {
    prevBound = nextBound;
    nextBound = getNextBound(prevBound);

    float loBound = prevBound.z;
    float hiBound = nextBound.z;
    if (loBound >= hiBound) {
      hiBound += PI2;
    }
    if (abs(hiBound - loBound) < 0.001) {
      continue;
    }

    vec2 vvUV = vec2(vUV.x - prevBound.x / uSize, vUV.y - prevBound.y / uSize);
    vec4 c01a = texture(texture2, vvUV); // substance01a
    vec4 c2_a = texture(texture3, vvUV); // substance2_a
    /*8 vec4 c45a = texture(texture8, vvUV); 8*/ // substance45a
    /*8 vec4 c67a = texture(texture9, vvUV); 8*/ // substance67a
    vec2 cAvg = c2_a.zw;
    c2_a.z = 0.0;
    c2_a.w = 0.0;
    vec2 s0aFWTFS = c01a.xy;
    vec2 s1aFWTFS = c01a.zw;
    vec2 s2aFWTFS = c2_a.xy;
    vec2 s_aFWTFS = c2_a.zw;
    /*8 vec2 s4aFWTFS = c45a.xy; 8*/
    /*8 vec2 s5aFWTFS = c45a.zw; 8*/
    /*8 vec2 s6aFWTFS = c67a.xy; 8*/
    /*8 vec2 s7aFWTFS = c67a.zw; 8*/

    vec4 s012_Bisector = vec4(
      atan(s0aFWTFS.y, s0aFWTFS.x),
      atan(s1aFWTFS.y, s1aFWTFS.x),
      atan(s2aFWTFS.y, s2aFWTFS.x),
      atan(s_aFWTFS.y, s_aFWTFS.x)
    );
    /*8 vec4 s4567Bisector = vec4(
      atan(s4aFWTFS.y, s4aFWTFS.x),
      atan(s5aFWTFS.y, s5aFWTFS.x),
      atan(s6aFWTFS.y, s6aFWTFS.x),
      atan(s7aFWTFS.y, s7aFWTFS.x)
    ); 8*/
    float avgArc = cAvg.x; // avgArcAndFlo
    vec4 s012_aArc = avgArc == -1.0 ? uArc012_ : mix(uArc012_, vec4(avgArc, avgArc, avgArc, avgArc), uArcBlending012_);
    /*8 vec4 s4567aArc = avgArc == -1.0 ? uArc4567 : mix(uArc4567, vec4(avgArc, avgArc, avgArc, avgArc), uArcBlending4567); 8*/

    vec4 s012_aLoBound = mod(s012_Bisector - s012_aArc + PI2, PI2);
    /*8 vec4 s4567aLoBound = mod(s4567Bisector - s4567aArc + PI2, PI2); 8*/
    vec4 s012_aHiBound = mod(s012_Bisector + s012_aArc + PI2, PI2);
    /*8 vec4 s4567aHiBound = mod(s4567Bisector + s4567aArc + PI2, PI2); 8*/
    s012_aHiBound = vec4(
      s012_aLoBound.x > (s012_aHiBound.x - epsilon) ? s012_aHiBound.x + PI2 : s012_aHiBound.x,
      s012_aLoBound.y > (s012_aHiBound.y - epsilon) ? s012_aHiBound.y + PI2 : s012_aHiBound.y,
      s012_aLoBound.z > (s012_aHiBound.z - epsilon) ? s012_aHiBound.z + PI2 : s012_aHiBound.z,
      s012_aLoBound.w > (s012_aHiBound.w - epsilon) ? s012_aHiBound.w + PI2 : s012_aHiBound.w
    );
    /*8 s4567aHiBound = vec4(
      s4567aLoBound.x > (s4567aHiBound.x - epsilon) ? s4567aHiBound.x + PI2 : s4567aHiBound.x,
      s4567aLoBound.y > (s4567aHiBound.y - epsilon) ? s4567aHiBound.y + PI2 : s4567aHiBound.y,
      s4567aLoBound.z > (s4567aHiBound.z - epsilon) ? s4567aHiBound.z + PI2 : s4567aHiBound.z,
      s4567aLoBound.w > (s4567aHiBound.w - epsilon) ? s4567aHiBound.w + PI2 : s4567aHiBound.w
    ); 8*/

    vec2 s0TransferFraction = arcOverlap(loBound, hiBound, s012_aLoBound.x, s012_aHiBound.x) * s0Attraction;
    vec2 s1TransferFraction = arcOverlap(loBound, hiBound, s012_aLoBound.y, s012_aHiBound.y) * s1Attraction;
    vec2 s2TransferFraction = arcOverlap(loBound, hiBound, s012_aLoBound.z, s012_aHiBound.z) * s2Attraction;
    vec2 s_TransferFraction = arcOverlap(loBound, hiBound, s012_aLoBound.w, s012_aHiBound.w) * s_Attraction;
    /*8 vec2 s4TransferFraction = arcOverlap(loBound, hiBound, s4567aLoBound.x, s4567aHiBound.x) * s4Attraction; 8*/
    /*8 vec2 s5TransferFraction = arcOverlap(loBound, hiBound, s4567aLoBound.y, s4567aHiBound.y) * s5Attraction; 8*/
    /*8 vec2 s6TransferFraction = arcOverlap(loBound, hiBound, s4567aLoBound.z, s4567aHiBound.z) * s6Attraction; 8*/
    /*8 vec2 s7TransferFraction = arcOverlap(loBound, hiBound, s4567aLoBound.w, s4567aHiBound.w) * s7Attraction; 8*/

    vec2 s0FloFraction = divSafe(s0TransferFraction, length(s0aFWTFS), 0.0);
    vec2 s1FloFraction = divSafe(s1TransferFraction, length(s1aFWTFS), 0.0);
    vec2 s2FloFraction = divSafe(s2TransferFraction, length(s2aFWTFS), 0.0);
    vec2 s_FloFraction = divSafe(s_TransferFraction, length(s_aFWTFS), 0.0);
    /*8 vec2 s4FloFraction = divSafe(s4TransferFraction, length(s4aFWTFS), 0.0); 8*/
    /*8 vec2 s5FloFraction = divSafe(s5TransferFraction, length(s5aFWTFS), 0.0); 8*/
    /*8 vec2 s6FloFraction = divSafe(s6TransferFraction, length(s6aFWTFS), 0.0); 8*/
    /*8 vec2 s7FloFraction = divSafe(s7TransferFraction, length(s7aFWTFS), 0.0); 8*/

    s0FloDir = s0FloDir + s0FloFraction;
    s1FloDir = s1FloDir + s1FloFraction;
    s2FloDir = s2FloDir + s2FloFraction;
    s_FloDir = s_FloDir + s_FloFraction;
    /*8 s4FloDir = s4FloDir + s4FloFraction; 8*/
    /*8 s5FloDir = s5FloDir + s5FloFraction; 8*/
    /*8 s6FloDir = s6FloDir + s6FloFraction; 8*/
    /*8 s7FloDir = s7FloDir + s7FloFraction; 8*/

    s0FloLen = s0FloLen + length(s0FloFraction);
    s1FloLen = s1FloLen + length(s1FloFraction);
    s2FloLen = s2FloLen + length(s2FloFraction);
    s_FloLen = s_FloLen + length(s_FloFraction);
    /*8 s4FloLen = s4FloLen + length(s4FloFraction); 8*/
    /*8 s5FloLen = s5FloLen + length(s5FloFraction); 8*/
    /*8 s6FloLen = s6FloLen + length(s6FloFraction); 8*/
    /*8 s7FloLen = s7FloLen + length(s7FloFraction); 8*/

    if (hiBound > PI2) {
      break;
    }
  }

  vec4 c01Given = texture(texture4, vUV); // substance01Given
  vec4 c2_Given = texture(texture5, vUV); // substance2_Given
  vec4 c45Given = texture(texture10, vUV); // substance45Given
  vec4 c67Given = texture(texture11, vUV); // substance67Given
  vec2 s0Given = c01Given.xy;
  vec2 s1Given = c01Given.zw;
  vec2 s2Given = c2_Given.xy;
  vec2 s_Given = c2_Given.zw;
  /*8 vec2 s4Given = c45Given.xy; 8*/
  /*8 vec2 s5Given = c45Given.zw; 8*/
  /*8 vec2 s6Given = c67Given.xy; 8*/
  /*8 vec2 s7Given = c67Given.zw; 8*/

  vec2 s0Received = normalizeSafe(s0FloDir) * s0FloLen;
  vec2 s1Received = normalizeSafe(s1FloDir) * s1FloLen;
  vec2 s2Received = normalizeSafe(s2FloDir) * s2FloLen;
  vec2 s_Received = normalizeSafe(s_FloDir) * s_FloLen;
  /*8 vec2 s4Received = normalizeSafe(s4FloDir) * s4FloLen; 8*/
  /*8 vec2 s5Received = normalizeSafe(s5FloDir) * s5FloLen; 8*/
  /*8 vec2 s6Received = normalizeSafe(s6FloDir) * s6FloLen; 8*/
  /*8 vec2 s7Received = normalizeSafe(s7FloDir) * s7FloLen; 8*/

  float avgFlo = texture(texture3, vUV).w; // avgArcAndFlo
  vec4 s012_bFlo = avgFlo == -1.0 ? uFlo012_ : mix(uFlo012_, vec4(avgFlo, avgFlo, avgFlo, avgFlo), uFloBlending012_);
  /*8 vec4 s4567bFlo = avgFlo == -1.0 ? uFlo4567 : mix(uFlo4567, vec4(avgFlo, avgFlo, avgFlo, avgFlo), uFloBlending4567); 8*/

  vec2 s0Remaining = s0b * (1.0 - s012_bFlo.x);
  vec2 s1Remaining = s1b * (1.0 - s012_bFlo.y);
  vec2 s2Remaining = s2b * (1.0 - s012_bFlo.z);
  vec2 s_Remaining = s_b * (1.0 - s012_bFlo.w);
  /*8 vec2 s4Remaining = s4b * (1.0 - s4567bFlo.x); 8*/
  /*8 vec2 s5Remaining = s5b * (1.0 - s4567bFlo.y); 8*/
  /*8 vec2 s6Remaining = s6b * (1.0 - s4567bFlo.z); 8*/
  /*8 vec2 s7Remaining = s7b * (1.0 - s4567bFlo.w); 8*/

  vec2 s0 = normalizeSafe(s0Given + s0Received + s0Remaining) * (length(s0Received) + length(s0Remaining));
  vec2 s1 = normalizeSafe(s1Given + s1Received + s1Remaining) * (length(s1Received) + length(s1Remaining));
  vec2 s2 = normalizeSafe(s2Given + s2Received + s2Remaining) * (length(s2Received) + length(s2Remaining));
  vec2 s_ = normalizeSafe(s_Given + s_Received + s_Remaining) * (length(s_Received) + length(s_Remaining));
  /*8 vec2 s4 = normalizeSafe(s4Given + s4Received + s4Remaining) * (length(s4Received) + length(s4Remaining)); 8*/
  /*8 vec2 s5 = normalizeSafe(s5Given + s5Received + s5Remaining) * (length(s5Received) + length(s5Remaining)); 8*/
  /*8 vec2 s6 = normalizeSafe(s6Given + s6Received + s6Remaining) * (length(s6Received) + length(s6Remaining)); 8*/
  /*8 vec2 s7 = normalizeSafe(s7Given + s7Received + s7Remaining) * (length(s7Received) + length(s7Remaining)); 8*/

  vec4 s01 = vec4(s0, s1);
  vec4 s2_ = vec4(s2, s_);
  /*8 vec4 s45 = vec4(s4, s5); 8*/
  /*8 vec4 s67 = vec4(s6, s7); 8*/

  fragColor0 = fill(s01);
  fragColor1 = fill(s2_);
  fragColor2 = vec4(0.0, 0.0, 0.0, 0.0);
  fragColor3 = vec4(0.0, 0.0, 0.0, 0.0);
  /*8 fragColor2 = fill(s45); 8*/
  /*8 fragColor3 = fill(s67); 8*/
}

struct Reaction {
  vec4 input0;
  vec4 input1;
  vec4 input2;
  vec4 input3;
  vec4 output0;
  vec4 output1;
  vec4 output2;
  vec4 output3;
};
Reaction reactions[] = Reaction[](
  /* insert-start:reactions */
  Reaction(
    vec4(1.0, 1.0, 1.0, 1.0), vec4(1.0, 1.0, 1.0, 1.0), vec4(1.0, 1.0, 1.0, 1.0), vec4(1.0, 1.0, 1.0, 1.0),
    vec4(1.0, 1.0, 1.0, 1.0), vec4(1.0, 1.0, 1.0, 1.0), vec4(1.0, 1.0, 1.0, 1.0), vec4(1.0, 1.0, 1.0, 1.0)
  )
  /* insert-end:reactions */
);
void substanceReact() {
  vec4 cs01 = texture(texture0, vUV); // substance01
  vec4 cs23 = texture(texture1, vUV); // substance23
  vec4 cs45 = texture(texture4, vUV); // substance45
  vec4 cs67 = texture(texture5, vUV); // substance67
  vec4 ca0123 = texture(texture2, vUV); // address0123
  vec4 ca4567 = texture(texture3, vUV); // address4567

  vec4 initial0 = vec4(
    length(cs01.xy),
    length(cs01.zw),
    length(cs23.xy),
    length(cs23.zw)
  );
  vec4 initial1 = vec4(
    length(cs45.xy),
    length(cs45.zw),
    length(cs67.xy),
    length(cs67.zw)
  );
  vec4 initial2 = max(ca0123, 0.0);
  vec4 initial3 = max(ca4567, 0.0);

  vec4 input0 = initial0;
  vec4 input1 = initial1;
  vec4 input2 = initial2;
  vec4 input3 = initial3;
  vec2 output0x = vec2(0.0, 0.0);
  vec2 output0y = vec2(0.0, 0.0);
  vec2 output0z = vec2(0.0, 0.0);
  vec2 output0w = vec2(0.0, 0.0);
  vec2 output1x = vec2(0.0, 0.0);
  vec2 output1y = vec2(0.0, 0.0);
  vec2 output1z = vec2(0.0, 0.0);
  vec2 output1w = vec2(0.0, 0.0);
  vec4 output2 = vec4(0.0, 0.0, 0.0, 0.0);
  vec4 output3 = vec4(0.0, 0.0, 0.0, 0.0);

  vec2 i0dx = normalizeSafe(cs01.xy);
  vec2 i0dy = normalizeSafe(cs01.zw);
  vec2 i0dz = normalizeSafe(cs23.xy);
  vec2 i0dw = normalizeSafe(cs23.zw);
  vec2 i1dx = normalizeSafe(cs45.xy);
  vec2 i1dy = normalizeSafe(cs45.zw);
  vec2 i1dz = normalizeSafe(cs67.xy);
  vec2 i1dw = normalizeSafe(cs67.zw);
  vec4 s0123X = vec4(cs01.xz, cs23.xz);
  vec4 s4567X = vec4(cs45.xz, cs67.xz);
  vec4 s0123Y = vec4(cs01.yw, cs23.yw);
  vec4 s4567Y = vec4(cs45.yw, cs67.yw);
  vec2 avgDir = normalizeSafe(
    vec2(
      dot(s0123X, uDirWeight012_) + dot(s4567X, uDirWeight4567),
      dot(s0123Y, uDirWeight012_) + dot(s4567Y, uDirWeight4567)
    )
  );

  float rWeights[] = float[](
    /* insert-start:reactionWeights */
    1.0
    /* insert-end:reactionWeights */
  );

  for (int i = 0; i < 16; i++) {
    vec4 i0 = vec4(0.0, 0.0, 0.0, 0.0);
    vec4 i1 = vec4(0.0, 0.0, 0.0, 0.0);
    vec4 i2 = vec4(0.0, 0.0, 0.0, 0.0);
    vec4 i3 = vec4(0.0, 0.0, 0.0, 0.0);
    vec2 o0x = vec2(0.0, 0.0);
    vec2 o0y = vec2(0.0, 0.0);
    vec2 o0z = vec2(0.0, 0.0);
    vec2 o0w = vec2(0.0, 0.0);
    vec2 o1x = vec2(0.0, 0.0);
    vec2 o1y = vec2(0.0, 0.0);
    vec2 o1z = vec2(0.0, 0.0);
    vec2 o1w = vec2(0.0, 0.0);
    vec4 o2 = vec4(0.0, 0.0, 0.0, 0.0);
    vec4 o3 = vec4(0.0, 0.0, 0.0, 0.0);

    for (int j = 0; j < /* insert-start:reactionCount */ 1 /* insert-end:reactionCount */; j++) {
      Reaction r = reactions[j];
      float rWeight = rWeights[j];
      if (
        // if the output of a reaction is an address, and the current grid cell is that address, skip the reaction
        dot(initial2, r.output2) == 0.0 &&
        dot(initial3, r.output3) == 0.0
      ) {
        vec4 iaVec = min(
          min(divSafe(input0, r.input0, bigilon), divSafe(input1, r.input1, bigilon)),
          min(divSafe(input2, r.input2, bigilon), divSafe(input3, r.input3, bigilon))
        );
        float inputAvailability = min(min(min(iaVec.x, iaVec.y), min(iaVec.z, iaVec.w)), bigilon);
        float reactionSpeed = inputAvailability * rWeight;
        i0 = i0 + r.input0 * reactionSpeed;
        i1 = i1 + r.input1 * reactionSpeed;
        i2 = i2 + r.input2 * reactionSpeed;
        i3 = i3 + r.input3 * reactionSpeed;
        vec2 direction = normalizeSafe(mix(
          i0dx * r.input0.x + i0dy * r.input0.y + i0dz * r.input0.z + i0dw * r.input0.w +
          i1dx * r.input1.x + i1dy * r.input1.y + i1dz * r.input1.z + i1dw * r.input1.w,
          avgDir,
          epsilon
        ));
        o0x = o0x + r.output0.x * direction * reactionSpeed;
        o0y = o0y + r.output0.y * direction * reactionSpeed;
        o0z = o0z + r.output0.z * direction * reactionSpeed;
        o0w = o0w + r.output0.w * direction * reactionSpeed;
        o1x = o1x + r.output1.x * direction * reactionSpeed;
        o1y = o1y + r.output1.y * direction * reactionSpeed;
        o1z = o1z + r.output1.z * direction * reactionSpeed;
        o1w = o1w + r.output1.w * direction * reactionSpeed;
        o2 = o2 + r.output2 * reactionSpeed;
        o3 = o3 + r.output3 * reactionSpeed;
      }
    }
    vec4 scalebackVec = max(
      max(divSafe(input0, i0, 0.0), divSafe(input1, i1, 0.0)),
      max(divSafe(input2, i2, 0.0), divSafe(input3, i3, 0.0))
    );
    float scaleback = min(
      max(max(scalebackVec.x, scalebackVec.y), max(scalebackVec.z, scalebackVec.w)),
      1.0
    );
    input0 = input0 - i0 * scaleback;
    input1 = input1 - i1 * scaleback;
    input2 = input2 - i2 * scaleback;
    input3 = input3 - i3 * scaleback;
    output0x = output0x + o0x * scaleback;
    output0y = output0y + o0y * scaleback;
    output0z = output0z + o0z * scaleback;
    output0w = output0w + o0w * scaleback;
    output1x = output1x + o1x * scaleback;
    output1y = output1y + o1y * scaleback;
    output1z = output1z + o1z * scaleback;
    output1w = output1w + o1w * scaleback;
    output2 = output2 + o2 * scaleback;
    output3 = output3 + o3 * scaleback;
    if (scaleback == 1.0 || scaleback < epsilon) {
      break;
    }
  }

  vec2 s0 = input0.x * i0dx;
  vec2 s1 = input0.y * i0dy;
  vec2 s2 = input0.z * i0dz;
  vec2 s3 = input0.w * i0dw;
  vec2 s4 = input1.x * i1dx;
  vec2 s5 = input1.y * i1dy;
  vec2 s6 = input1.z * i1dz;
  vec2 s7 = input1.w * i1dw;
  s0 = normalizeSafe(output0x + s0) * (length(output0x) + input0.x);
  s1 = normalizeSafe(output0y + s1) * (length(output0y) + input0.y);
  s2 = normalizeSafe(output0z + s2) * (length(output0z) + input0.z);
  s3 = normalizeSafe(output0w + s3) * (length(output0w) + input0.w);
  s4 = normalizeSafe(output1x + s4) * (length(output1x) + input1.x);
  s5 = normalizeSafe(output1y + s5) * (length(output1y) + input1.y);
  s6 = normalizeSafe(output1z + s6) * (length(output1z) + input1.z);
  s7 = normalizeSafe(output1w + s7) * (length(output1w) + input1.w);
  if (length(s0) < epsilon) s0 *= 0.0;
  if (length(s1) < epsilon) s1 *= 0.0;
  if (length(s2) < epsilon) s2 *= 0.0;
  if (length(s3) < epsilon) s3 *= 0.0;
  if (length(s4) < epsilon) s4 *= 0.0;
  if (length(s5) < epsilon) s5 *= 0.0;
  if (length(s6) < epsilon) s6 *= 0.0;
  if (length(s7) < epsilon) s7 *= 0.0;

  float a0 = initial2.x > 0.0 ? max(input2.x, epsilon) : -output2.x;
  float a1 = initial2.y > 0.0 ? max(input2.y, epsilon) : -output2.y;
  float a2 = initial2.z > 0.0 ? max(input2.z, epsilon) : -output2.z;
  float a3 = initial2.w > 0.0 ? max(input2.w, epsilon) : -output2.w;
  float a4 = initial3.x > 0.0 ? max(input3.x, epsilon) : -output3.x;
  float a5 = initial3.y > 0.0 ? max(input3.y, epsilon) : -output3.y;
  float a6 = initial3.z > 0.0 ? max(input3.z, epsilon) : -output3.z;
  float a7 = initial3.w > 0.0 ? max(input3.w, epsilon) : -output3.w;

  fragColor0 = fill(vec4(s0, s1));
  fragColor1 = fill(vec4(s2, s3));
  fragColor2 = fill(vec4(a0, a1, a2, a3));
  fragColor3 = fill(vec4(a4, a5, a6, a7));
  fragColor4 = fill(vec4(s4, s5));
  fragColor5 = fill(vec4(s6, s7));
}

void addressPrepare() {
  vec4 ca0123 = texture(texture0, vUV); // address0123
  vec4 ca4567 = texture(texture1, vUV); // address4567
  fragColor0 = max(-ca0123, 0.0);
  fragColor1 = max(-ca4567, 0.0);
}

void addressRun() {
  vec4 ca0123 = texture(texture0, vUV); // address0123
  vec4 ca4567 = texture(texture1, vUV); // address4567
  vec4 cat0123 = texture(texture2, vUV); // addressTotal0123
  vec4 cat4567 = texture(texture3, vUV); // addressTotal4567

  fragColor0 = vec4(
    ca0123.x > 0.0 ? ca0123.x + cat0123.x : ca0123.x,
    ca0123.y > 0.0 ? ca0123.y + cat0123.y : ca0123.y,
    ca0123.z > 0.0 ? ca0123.z + cat0123.z : ca0123.z,
    ca0123.w > 0.0 ? ca0123.w + cat0123.w : ca0123.w
  );
  fragColor1 = vec4(
    ca4567.x > 0.0 ? ca4567.x + cat4567.x : ca4567.x,
    ca4567.y > 0.0 ? ca4567.y + cat4567.y : ca4567.y,
    ca4567.z > 0.0 ? ca4567.z + cat4567.z : ca4567.z,
    ca4567.w > 0.0 ? ca4567.w + cat4567.w : ca4567.w
  );
}

void main() {
  /* insert:main */
}
