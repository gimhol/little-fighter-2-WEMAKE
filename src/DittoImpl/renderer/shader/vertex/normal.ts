export const normal_vertex_shader = `
  varying vec2 vUv;
  uniform float facing;
  void main() {
    vUv.x = 0.5 + facing * (uv.x - 0.5);
    vUv.y = uv.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`