export const outline_fragment_shader = `
  uniform sampler2D pTexture;
  uniform float offsetX;
  uniform float offsetY;
  uniform float repeatW;
  uniform float repeatH;
  uniform float outlineWidth;
  uniform float outlineAlpha;
  uniform vec3 outlineColor;
  
  varying vec2 vUv;
  
  const float gamma = 2.2;
  vec3 gamma_correct(vec3 color) {
    return pow(color, vec3(1.0 / gamma));
  }
  vec3 gamma_invert(vec3 color) {
    return pow(color, vec3(gamma));
  }
  void main() {
    vec2 uv = vec2(
      (vUv.x * repeatW) + offsetX,
      (vUv.y * repeatH) + offsetY
    );
    vec4 color = texture2D(pTexture, uv);
    color.rgb = gamma_correct(color.rgb);
    if(outlineAlpha <= 0.0 || outlineWidth <= 0.0) {
      gl_FragColor = color;
      return;
    }

    float outline = 0.0;
    vec2 texel = vec2(outlineWidth) / vec2(textureSize(pTexture, 0));
    float center = texture2D(pTexture, uv).a;
    float up     = texture2D(pTexture, uv + vec2(0, -texel.y)).a;
    float down   = texture2D(pTexture, uv + vec2(0,  texel.y)).a;
    float left   = texture2D(pTexture, uv + vec2(-texel.x, 0)).a;
    float right  = texture2D(pTexture, uv + vec2( texel.x, 0)).a;
    outline = max(
      max(abs(center - up), abs(center - down)),
      max(abs(center - left), abs(center - right))
    );
    if (outline > 0.1 && center < 0.1) {
      gl_FragColor.rgb = gamma_correct(outlineColor);
      gl_FragColor.a = outlineAlpha;
    } else {
      gl_FragColor = color;
    }
  }
`