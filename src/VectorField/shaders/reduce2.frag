#version 300 es

precision highp float;

in vec2 vUV;
uniform sampler2D texture0;
layout(std140) uniform StaticUniforms {
  float uSize;
};

layout(location=0) out vec4 fragColor0;
void main() {
  vec4 total = vec4(0., 0., 0., 0.);
  for (float y = 0.; y < 1.; y += 1. / uSize) {
    total += texture(texture0, vec2(0., y));
  }

  fragColor0 = total;
}
