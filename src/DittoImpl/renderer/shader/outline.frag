uniform sampler2D tex;
/** 一倍纹理图的宽度（像素）*/
uniform float tw;
/** 一倍纹理图的高度（像素）*/
uniform float th;
/** 当前纹理图的宽度倍数 */
uniform float tsw;
/** 当前纹理图的高度倍数 */
uniform float tsh;
/*
实际图片宽（像素） = tsh * tw
实际图片高（像素） = tsh * th
*/

uniform float repeatX;
uniform float repeatY;
uniform float offsetX;
uniform float offsetY;

/** 一倍纹理图下，纹理图中截取坐标X（像素）*/
uniform float x;
/** 一倍纹理图下，纹理图中截取坐标Y（像素）*/
uniform float y;
/** 一倍纹理图下，纹理图中截取宽度（像素）*/
uniform float w;
/** 一倍纹理图下，纹理图中截取高度（像素）*/
uniform float h;
/** 描边宽度（像素）*/
uniform float outlineWidth;
/** 描边透明度（0~1）*/
uniform float outlineAlpha;
/** 描边颜色 */
uniform vec3 outlineColor;
/** 灰度 */
uniform float gray;
/** 混色强度 */
uniform float mixStreath;
/** 混色 */
uniform vec3 mixColor;
/** opacity */
uniform float opacity;
uniform bool keepout;

uniform bool cover;
/** 色强度 */
uniform float coverStreath;
/** 色 */
uniform vec3 coverColor;

// 你之前的灰度权重（扩展成 vec4）
const vec3 GRAY_WEIGHT = vec3(0.299, 0.587, 0.114);

const float gamma = 2.2;

varying vec2 vUv;

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

void apply(vec4 color) {
  if(cover) {
    color.rgb = gamma_correct(coverColor);
    color.a = coverStreath;
  }
  if(mixStreath > 0.0) {
    color.rgb = mix(color.rgb, gamma_correct(mixColor), mixStreath);
  }
  if(gray > 0.0) {
    color.rgb = toGray(color.rgb, gray);
  }
  color.a *= opacity;
  gl_FragColor = color;

}

void main() {
  float ow = tw / tsw;
  float oh = th / tsh;
  vec2 uv = vec2((vUv.x * w / ow) + x / ow, (vUv.y * h / oh) + 1.0 - (y + h) / oh);
  if(!keepout && (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0)) {
    // 超出纹理图的部分将不显示
    discard;
  }
  vec4 color = texture2D(tex, uv);
  color.rgb = gamma_correct(color.rgb);

  /* 无需描边时，仅处理颜色 */
  if(outlineAlpha <= 0.0 || outlineWidth <= 0.0) {
    apply(color);
    return;
  }

  /* 检查中心与四周颜色 */
  float outline = 0.0;
  vec2 texel = vec2(outlineWidth) / vec2(textureSize(tex, 0));
  float center = texture2D(tex, uv).a;
  float up = texture2D(tex, uv + vec2(0, -texel.y)).a;
  float down = texture2D(tex, uv + vec2(0, texel.y)).a;
  float left = texture2D(tex, uv + vec2(-texel.x, 0)).a;
  float right = texture2D(tex, uv + vec2(texel.x, 0)).a;
  outline = max(max(abs(center - up), abs(center - down)), max(abs(center - left), abs(center - right)));
  if(outline > 0.1 && center < 0.1) {
    gl_FragColor.rgb = gamma_correct(outlineColor);
    gl_FragColor.a = outlineAlpha;
  } else {
    apply(color);
  }
}