#version 300 es

precision highp float;

in vec2 vUV;
uniform sampler2D texture0; // s01
uniform sampler2D texture1; // s23
uniform sampler2D texture2; // s01Prev
uniform sampler2D texture3; // s23Prev
uniform sampler2D texture4; // s01Given
uniform sampler2D texture5; // s23Given
uniform sampler2D texture6; // a0123
uniform sampler2D texture7; // a4567
uniform sampler2D texture8; // s45
uniform sampler2D texture9; // s67
uniform sampler2D texture10; // s45Prev
uniform sampler2D texture11; // s67Prev
uniform sampler2D texture12; // s45Given
uniform sampler2D texture13; // s67Given
layout(std140) uniform StaticUniforms {
  float uSize;
  float uTransferRadius;
};
layout(std140) uniform SubstanceUniforms {
  vec4 uArc0123;
  vec4 uArcWeight0123;
  vec4 uArcBlending0123;
  vec4 uFlo0123;
  vec4 uFloWeight0123;
  vec4 uFloBlending0123;
  vec4 uDirWeight0123;
  vec4 uDirBlending0123;
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
  vec4 am0x0123;
  vec4 am1x0123;
  vec4 am2x0123;
  vec4 am3x0123;
  vec4 am4x0123;
  vec4 am5x0123;
  vec4 am6x0123;
  vec4 am7x0123;
  vec4 am0x4567;
  vec4 am1x4567;
  vec4 am2x4567;
  vec4 am3x4567;
  vec4 am4x4567;
  vec4 am5x4567;
  vec4 am6x4567;
  vec4 am7x4567;
};
layout(std140) uniform DisplayUniforms {
  float uScheme;
  float uQuantity;
  float uChroma;
  float uDynamicRange;
  float uBrightness;
  float uContrast;
  float uActive;
  float uAlpha;
  float uHot;
  vec4 uGradientColor0;
  vec4 uGradientColor1;
  vec4 uGradientColor2;
  vec4 uGradientColor3;
  vec4 uGradientColor4;
  vec4 uRelativeBrightness0123;
  vec4 uRelativeBrightness4567;
  vec4 uRelativeBrightnessHM;
  vec4 uSoftmaxHue0123;
  vec4 uSoftmaxHue4567;
  vec4 uSoftmaxHueHM;
};
out vec4 fragColor;

float PI = 3.141592653589793;
float PI2 = 6.283185307179586;
float epsilon = 0.000000001;
float bigilon = 999999999.9;

vec4 sumVec = vec4(1.0, 1.0, 1.0, 1.0);
float sum(in vec4 x) {
  return dot(x, sumVec);
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

float mixRing(in float a, in float b, in float m, in float r) {
  if (abs(a + r - b) < abs(a - b)) a += r;
  else if (abs(b + r - a) < abs(a - b)) b += r;
  return mod(mix(a, b, m), r);
}

vec3 mixColors(in vec3 a, in vec3 b, in float m) {
  float e = 0.01;
  float h = a.y < e ? b.x : b.y < e ? a.x : mixRing(a.x, b.x, m, 360.0);
  return vec3(h, mix(a.yz, b.yz, m));
}

vec3 mixColorsGradient(in float value) {
  vec4[] colors = vec4[](
    uGradientColor0,
    uGradientColor1,
    uGradientColor2,
    uGradientColor3,
    uGradientColor4
  );
  int i = min(int(value * 4.0), 3);
  vec4 a = colors[i];
  vec4 b = colors[i + 1];
  return value == 1.0 ? b.xyz : mixColors(a.xyz, b.xyz, mod((value * 4.0), 1.0));
}

float dynamicRange_linear(in float x) {
  return clamp(x / 3.0, 0.0, 1.0);
}

float dynamicRange_logarithmic(in float x) {
  return max(2.0 / (1.0 + pow(2.0, -x)) - 1.0, 0.0);
}

float dynamicRange_sigmoid(in float x) {
  return 0.25 / (0.25 + pow(2.0, -x * 4.0 / 3.0));
}

float quantity_energy(in vec2 xy, in vec2 vUV) {
  return length(xy);
}

float quantity_direction(in vec2 xy, in vec2 vUV) {
  return (atan(xy.y, xy.x) + PI) / PI2;
}

/* insert-start:hsluv */
vec3 hsluvToRgb(vec3 hsl) {
  return hsl;
}
vec3 hpluvToRgb(vec3 hsl) {
  return hsl;
}
/* insert-end:hsluv */

void main() {
  vec4 c01 = texture(texture0, vUV); // substance01
  vec4 c23 = texture(texture1, vUV); // substance23
  vec4 c45 = texture(texture8, vUV); // substance45
  vec4 c67 = texture(texture9, vUV); // substance67
  vec2 vs0 = c01.xy;
  vec2 vs1 = c01.zw;
  vec2 vs2 = c23.xy;
  vec2 vs3 = c23.zw;
  vec2 vs4 = c45.xy;
  vec2 vs5 = c45.zw;
  vec2 vs6 = c67.xy;
  vec2 vs7 = c67.zw;

  float s0 = 0.0;
  float s1 = 0.0;
  float s2 = 0.0;
  float s3 = 0.0;
  float s4 = 0.0;
  float s5 = 0.0;
  float s6 = 0.0;
  float s7 = 0.0;
  float ah = 0.0; // adressHome
  float am = 0.0; // addressMailbox

  if (uQuantity == 0.0 /* energy */ || uQuantity == 1.0 /* direction */) {
    s0 = length(vs0);
    s1 = length(vs1);
    s2 = length(vs2);
    s3 = length(vs3);
    s4 = length(vs4);
    s5 = length(vs5);
    s6 = length(vs6);
    s7 = length(vs7);
    vec4 a0123 = texture(texture6, vUV); // address0123
    vec4 a4567 = texture(texture6, vUV); // address4567
    ah = sum(max(a0123, 0.0)) + sum(max(a4567, 0.0));
    am = sum(max(a0123 * -1.0, 0.0)) + sum(max(a4567 * -1.0, 0.0));
  }
  if (uQuantity == 2.0 /* energyDelta */) {
    vec4 pc01 = texture(texture2, vUV); // prevSubstance01
    vec4 pc23 = texture(texture3, vUV); // prevSubstance23
    vec4 pc45 = texture(texture10, vUV); // prevSubstance45
    vec4 pc67 = texture(texture11, vUV); // prevSubstance67
    vec2 pvs0 = pc01.xy;
    vec2 pvs1 = pc01.zw;
    vec2 pvs2 = pc23.xy;
    vec2 pvs3 = pc23.zw;
    vec2 pvs4 = pc45.xy;
    vec2 pvs5 = pc45.zw;
    vec2 pvs6 = pc67.xy;
    vec2 pvs7 = pc67.zw;

    s0 = abs(length(vs0) - length(pvs0)) * 256.0;
    s1 = abs(length(vs1) - length(pvs1)) * 256.0;
    s2 = abs(length(vs2) - length(pvs2)) * 256.0;
    s3 = abs(length(vs3) - length(pvs3)) * 256.0;
    s4 = abs(length(vs4) - length(pvs4)) * 256.0;
    s5 = abs(length(vs5) - length(pvs5)) * 256.0;
    s6 = abs(length(vs6) - length(pvs6)) * 256.0;
    s7 = abs(length(vs7) - length(pvs7)) * 256.0;
  }
  if (uQuantity == 3.0 /* cosineNormalised */ || uQuantity == 4.0 /* cosine */) {
    vec2[] vvUV = vec2[](
      vec2(vUV.x, vUV.y + 1.0 / uSize),
      vec2(vUV.x + 1.0 / uSize, vUV.y),
      vec2(vUV.x, vUV.y - 1.0 / uSize),
      vec2(vUV.x - 1.0 / uSize, vUV.y)
    );
    for (int i = 0; i < 4; i++) {
      vec4 cc01 = texture(texture0, vvUV[i]); // substance01
      vec4 cc23 = texture(texture1, vvUV[i]); // substance23
      vec4 cc45 = texture(texture8, vvUV[i]); // substance45
      vec4 cc67 = texture(texture9, vvUV[i]); // substance67
      vec2 vvs0 = cc01.xy;
      vec2 vvs1 = cc01.zw;
      vec2 vvs2 = cc23.xy;
      vec2 vvs3 = cc23.zw;
      vec2 vvs4 = cc45.xy;
      vec2 vvs5 = cc45.zw;
      vec2 vvs6 = cc67.xy;
      vec2 vvs7 = cc67.zw;
      s0 += abs(divSafe(dot(vs0, vvs0), (length(vs0) * length(vvs0)), 0.0)) / 4.0;
      s1 += abs(divSafe(dot(vs1, vvs1), (length(vs1) * length(vvs1)), 0.0)) / 4.0;
      s2 += abs(divSafe(dot(vs2, vvs2), (length(vs2) * length(vvs2)), 0.0)) / 4.0;
      s3 += abs(divSafe(dot(vs3, vvs3), (length(vs3) * length(vvs3)), 0.0)) / 4.0;
      s4 += abs(divSafe(dot(vs4, vvs4), (length(vs4) * length(vvs4)), 0.0)) / 4.0;
      s5 += abs(divSafe(dot(vs5, vvs5), (length(vs5) * length(vvs5)), 0.0)) / 4.0;
      s6 += abs(divSafe(dot(vs6, vvs6), (length(vs6) * length(vvs6)), 0.0)) / 4.0;
      s7 += abs(divSafe(dot(vs7, vvs7), (length(vs7) * length(vvs7)), 0.0)) / 4.0;
    }
  }

  int iActive = int(uActive);

  s0 = (iActive & 1) == 1 ? s0 * uRelativeBrightness0123.x : 0.0;
  s1 = (iActive & 2) == 2 ? s1 * uRelativeBrightness0123.y : 0.0;
  s2 = (iActive & 4) == 4 ? s2 * uRelativeBrightness0123.z : 0.0;
  s3 = (iActive & 8) == 8 ? s3 * uRelativeBrightness0123.w : 0.0;
  s4 = (iActive & 16) == 16 ? s4 * uRelativeBrightness4567.x : 0.0;
  s5 = (iActive & 32) == 32 ? s5 * uRelativeBrightness4567.y : 0.0;
  s6 = (iActive & 64) == 64 ? s6 * uRelativeBrightness4567.z : 0.0;
  s7 = (iActive & 128) == 128 ? s7 * uRelativeBrightness4567.w : 0.0;
  ah = (iActive & 256) == 256 ? ah * uRelativeBrightnessHM.x : 0.0;
  am = (iActive & 512) == 512 ? am * uRelativeBrightnessHM.y : 0.0;

  int iAlpha = int(uAlpha);

  float luminance =
    ((iAlpha & 1) == 0 ? s0 : 0.0) +
    ((iAlpha & 2) == 0 ? s1 : 0.0) +
    ((iAlpha & 4) == 0 ? s2 : 0.0) +
    ((iAlpha & 8) == 0 ? s3 : 0.0) +
    ((iAlpha & 16) == 0 ? s4 : 0.0) +
    ((iAlpha & 32) == 0 ? s5 : 0.0) +
    ((iAlpha & 64) == 0 ? s6 : 0.0) +
    ((iAlpha & 128) == 0 ? s7 : 0.0) +
    ((iAlpha & 256) == 0 ? ah : 0.0) +
    ((iAlpha & 512) == 0 ? am : 0.0);
  float alpha =
    ((iAlpha & 1) == 1 ? length(vs0) : 0.0) +
    ((iAlpha & 2) == 2 ? length(vs1) : 0.0) +
    ((iAlpha & 4) == 4 ? length(vs2) : 0.0) +
    ((iAlpha & 8) == 8 ? length(vs3) : 0.0) +
    ((iAlpha & 16) == 16 ? length(vs4) : 0.0) +
    ((iAlpha & 32) == 32 ? length(vs5) : 0.0) +
    ((iAlpha & 64) == 64 ? length(vs6) : 0.0) +
    ((iAlpha & 128) == 128 ? length(vs7) : 0.0) +
    ((iAlpha & 256) == 256 ? ah : 0.0) +
    ((iAlpha & 512) == 512 ? am : 0.0);
  alpha = divSafe(alpha, (alpha + luminance), 0.0);
  float brightness = uBrightness;
  float contrast = uQuantity == 2.0 ? pow(uContrast, 3.0) : uContrast;
  float zeroPoint = uQuantity == 2.0 ? 0.0 : 0.5;
  luminance = (luminance + brightness / contrast - zeroPoint) * contrast + zeroPoint;

  if (uDynamicRange == 0.0) {
    luminance = dynamicRange_linear(luminance);
  }
  if (uDynamicRange == 1.0) {
    luminance = dynamicRange_logarithmic(luminance);
  }
  if (uDynamicRange == 2.0) {
    luminance = dynamicRange_sigmoid(luminance);
  }

  if (uQuantity == 1.0 /* direction */) {
    vec2 ds0 = normalizeSafe(vs0) * s0;
    vec2 ds1 = normalizeSafe(vs1) * s1;
    vec2 ds2 = normalizeSafe(vs2) * s2;
    vec2 ds3 = normalizeSafe(vs3) * s3;
    vec2 ds4 = normalizeSafe(vs4) * s4;
    vec2 ds5 = normalizeSafe(vs5) * s5;
    vec2 ds6 = normalizeSafe(vs6) * s6;
    vec2 ds7 = normalizeSafe(vs7) * s7;
    float x = sum(vec4(ds0.x, ds1.x, ds2.x, ds3.x)) + sum(vec4(ds4.x, ds5.x, ds6.x, ds7.x));
    float y = sum(vec4(ds0.y, ds1.y, ds2.y, ds3.y)) + sum(vec4(ds4.y, ds5.y, ds6.y, ds7.y));
    float direction = (atan(y, x) + PI) / PI2;
    luminance = direction;
  }

  vec3 c = vec3(0.0, 0.0, 0.0);

  if (uScheme == 0.0 /* gradient */) {
    c = mixColorsGradient(luminance);
  }
  if (uScheme == 1.0 /* softmax */) {
    int iHot = int(uHot);
    float es0 = (iActive & 1) == 1 ? pow(2.0, 10.0 * s0) : 0.0;
    float es1 = (iActive & 2) == 2 ? pow(2.0, 10.0 * s1) : 0.0;
    float es2 = (iActive & 4) == 4 ? pow(2.0, 10.0 * s2) : 0.0;
    float es3 = (iActive & 8) == 8 ? pow(2.0, 10.0 * s3) : 0.0;
    float es4 = (iActive & 16) == 16 ? pow(2.0, 10.0 * s4) : 0.0;
    float es5 = (iActive & 32) == 32 ? pow(2.0, 10.0 * s5) : 0.0;
    float es6 = (iActive & 64) == 64 ? pow(2.0, 10.0 * s6) : 0.0;
    float es7 = (iActive & 128) == 128 ? pow(2.0, 10.0 * s7) : 0.0;
    float eah = (iActive & 256) == 256 ? pow(2.0, 10.0 * ah) : 0.0;
    float eam = (iActive & 512) == 512 ? pow(2.0, 10.0 * am) : 0.0;
    float eSum = sum(vec4(es0, es1, es2, es3)) + sum(vec4(es4, es5, es6, es7)) + eah + eam;
    int biggest = 0;
    int secondBiggest = 0;
    float[] eArray = float[](0.0, es0, es1, es2, es3, es4, es5, es6, es7, eah, eam);
    float[] hues = float[](
      -1.0,
      uSoftmaxHue0123.x, uSoftmaxHue0123.y, uSoftmaxHue0123.z, uSoftmaxHue0123.w,
      uSoftmaxHue4567.x, uSoftmaxHue4567.y, uSoftmaxHue4567.z, uSoftmaxHue4567.w
    );
    bool[] hArray = bool[](
      false,
      (iHot & 1) == 1, (iHot & 2) == 2, (iHot & 4) == 4, (iHot & 8) == 8,
      (iHot & 16) == 16, (iHot & 32) == 32, (iHot & 64) == 64,
      (iHot & 128) == 128, (iHot & 256) == 256, (iHot & 512) == 512
    );
    for (int i = 0; i < 10; i++) {
      if (eArray[i] > eArray[biggest]) {
        secondBiggest = biggest;
        biggest = i;
      } else if (eArray[i] > eArray[secondBiggest]) {
        secondBiggest = i;
      }
    }
    float saturation = hArray[biggest] ? divSafe(eArray[biggest], eSum, 0.0) - divSafe(eArray[secondBiggest], eSum, 0.0) : 0.0;
    c = vec3((hues[biggest] * 360.0) / 11.0, saturation * 100.0, (luminance * 0.8) * 100.0);
  }

  if (uChroma == 0.0) c = hsluvToRgb(c);
  if (uChroma == 1.0) c = hpluvToRgb(c);

  fragColor = vec4(c, 1.0 - alpha);
}
