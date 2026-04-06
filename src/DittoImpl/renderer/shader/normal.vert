varying vec2 vUv;
uniform float flipX;
uniform float flipY;
uniform float scaleX;
uniform float scaleY;
void main() {
  vUv.x = 0.5 + flipX * (uv.x - 0.5) * scaleX;
  vUv.y = 0.5 + flipY * (uv.y - 0.5) * scaleY;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}