uniform sampler2D pTexture;
uniform float tw;
uniform float th;
uniform float ts;
uniform float x;
uniform float y;
uniform float w;
uniform float h;

uniform float outlineWidth;
uniform float outlineAlpha;
uniform vec3 outlineColor;
uniform float gray;
varying vec2 vUv;

// 你之前的灰度权重（扩展成 vec4）
const vec3 GRAY_WEIGHT = vec3(0.299, 0.587, 0.114);

const float gamma = 2.2;
vec3 gamma_correct(vec3 color) {
  return pow(color, vec3(1.0 / gamma));
}
vec3 gamma_invert(vec3 color) {
  return pow(color, vec3(gamma));
}
vec3 toGray(vec3 color, float strength) {
  float gray = dot(color, GRAY_WEIGHT);
  return mix(color, vec3(gray), strength);
}
void main() {
  float ow = tw / ts;
  float oh = th / ts;
  vec2 uv = vec2((vUv.x * w / ow) + x / ow, (vUv.y * h / oh) + 1.0 - (y + h) / oh);
  if(uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    discard;
  }
  vec4 color = texture2D(pTexture, uv);
  color.rgb = gamma_correct(color.rgb);
  if(outlineAlpha <= 0.0 || outlineWidth <= 0.0) {
    if(gray > 0.0)
      color.rgb = toGray(color.rgb, gray);
    gl_FragColor = color;
    return;
  }

  float outline = 0.0;
  vec2 texel = vec2(outlineWidth) / vec2(textureSize(pTexture, 0));
  float center = texture2D(pTexture, uv).a;
  float up = texture2D(pTexture, uv + vec2(0, -texel.y)).a;
  float down = texture2D(pTexture, uv + vec2(0, texel.y)).a;
  float left = texture2D(pTexture, uv + vec2(-texel.x, 0)).a;
  float right = texture2D(pTexture, uv + vec2(texel.x, 0)).a;
  outline = max(max(abs(center - up), abs(center - down)), max(abs(center - left), abs(center - right)));
  if(outline > 0.1 && center < 0.1) {
    gl_FragColor.rgb = gamma_correct(outlineColor);
    gl_FragColor.a = outlineAlpha;
  } else {
    if(gray > 0.0)
      color.rgb = toGray(color.rgb, gray);
    gl_FragColor = color;
  }
}