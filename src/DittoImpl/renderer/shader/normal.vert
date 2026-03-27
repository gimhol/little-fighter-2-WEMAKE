varying vec2 vUv;
uniform float flipX;
uniform float flipY;
void main() {
  vUv.x = 0.5 + flipX * (uv.x - 0.5);
  vUv.y = 0.5 + flipY * (uv.y - 0.5);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}