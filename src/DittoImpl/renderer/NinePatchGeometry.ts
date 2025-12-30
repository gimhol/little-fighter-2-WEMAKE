import { floor } from "@/LF2";
import { BufferGeometry, Float32BufferAttribute } from "three";

const normals = (() => {
  const nums: number[] = []
  for (let i = 0; i < 36; ++i) nums.push(0, 0, 1)
  return new Float32BufferAttribute(nums, 3)
})()

interface INinePatchGeometryParams {
  w?: number,
  h?: number

  f_l?: number;
  f_t?: number;
  f_r?: number;
  f_b?: number;

  f_w?: number,
  f_h?: number,
  l_w?: number,
  t_h?: number,
  r_w?: number,
  b_h?: number,
}
export class NinePatchGeometry extends BufferGeometry {
  override readonly type: string = 'NinePatchGeometry'
  parameters: Required<INinePatchGeometryParams>;
  constructor(params: INinePatchGeometryParams = {}) {
    super();
    const {
      w = 1, h = 1, f_w = 1, f_h = 1, l_w = f_w * 0.4, r_w = f_w * 0.4,
      t_h = f_h * 0.4, b_h = f_h * 0.4, f_l = 0, f_t = 0, f_r = 0, f_b = 0,
    } = params;
    this.parameters = { w, h, f_w, f_h, l_w, r_w, t_h, b_h, f_l, f_t, f_r, f_b }
    const x0 = -w / 2;
    const x1 = x0 + (l_w / w) * w;
    const x2 = x0 + ((w - r_w) / w) * w;
    const x3 = w / 2;
    const xs = [x0, x1, x2, x3]
    const y0 = -h / 2;
    const y1 = y0 + (t_h / h) * h;
    const y2 = y0 + ((h - b_h) / h) * h;
    const y3 = h / 2;
    const ys = [y0, y1, y2, y3]

    const u0 = f_l / f_w
    const u3 = (f_w - f_r) / f_w
    const u1 = u0 + l_w / f_w
    const u2 = u3 - r_w / f_w
    const us = [u0, u1, u2, u3]

    const v0 = f_t / f_h
    const v3 = (f_h - f_b) / f_h
    const v1 = v0 + t_h / f_h
    const v2 = v3 - b_h / f_h
    const vs = [v0, v1, v2, v3]
    const uvs: number[] = []
    const vertices: number[] = []
    for (let y = 0; y < 3; ++y) {
      for (let x = 0; x < 3; ++x) {
        vertices.push(
          xs[x + 0], -ys[y + 0], 0,
          xs[x + 1], -ys[y + 0], 0,
          xs[x + 0], -ys[y + 1], 0,
          xs[x + 1], -ys[y + 1], 0
        )
        uvs.push(
          us[x + 0], 1 - vs[y + 0],
          us[x + 1], 1 - vs[y + 0],
          us[x + 0], 1 - vs[y + 1],
          us[x + 1], 1 - vs[y + 1],
        )
      }
    }

    const indices: number[] = [];
    for (let i = 0; i < 36; i += 4) {
      indices.push(
        i + 0, i + 2, i + 1,
        i + 2, i + 3, i + 1
      );
    }
    this.setIndex(indices);
    this.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    this.setAttribute('normal', normals);
    this.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  }
  override copy(source: NinePatchGeometry) {
    super.copy(source);
    this.parameters = Object.assign({}, source.parameters);
    return this;
  }
}
