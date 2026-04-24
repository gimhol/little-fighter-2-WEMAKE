import { Color, ColorRepresentation, ShaderMaterial, Texture } from "../../_t";
import { MaterialFactory, MaterialKind } from "../factory/MaterialFactory";
import { Shaders } from "../shader";
export const BLACK = new Color("#000000");

export class OutlineMaterial extends ShaderMaterial {
  constructor() {
    super({
      vertexShader: Shaders.Vertex.Normal,
      fragmentShader: Shaders.Fragment.Outline,
      transparent: true
    })
  }
  reset(): void {
    this.uniforms = {
      tex: { value: void 0 },
      x: { value: 0 },
      y: { value: 0 },
      w: { value: 1 },
      h: { value: 1 },
      tw: { value: 1 },
      th: { value: 1 },
      tsw: { value: 1 },
      tsh: { value: 1 },
      outlineColor: { value: BLACK },
      outlineAlpha: { value: 0 },
      outlineWidth: { value: 0 },
      repeatX: { value: 1 },
      repeatY: { value: 1 },
      offsetX: { value: 0 },
      offsetY: { value: 0 },
      flipX: { value: 1 },
      flipY: { value: 1 },
      scaleX: { value: 1 },
      scaleY: { value: 1 },
      scaleZ: { value: 1 },
      opacity: { value: 1 },
      /** 混色 */
      mixColor: { value: BLACK },
      /** 混色强度,一般范围:[0,1], 当为0，不混色 */
      mixStength: { value: 0 },
      cover: { value: false },
      coverColor: { value: BLACK },
      coverStength: { value: 0 },
      gray: { value: 0 },
      keepout: { value: true },

      bgColor: { value: BLACK },
      bgAlpha: { value: 0 },

      fgColor: { value: BLACK },
      fgAlpha: { value: 0 },
    }
  }
  get texture(): Texture | undefined { return this.uniforms.tex.value }
  set texture(v: Texture | undefined) { this.uniforms.tex.value = v }
  get alpha(): number { return this.uniforms.opacity.value ?? 1 }
  set alpha(v: number) { this.uniforms.opacity.value = v }

  get coverColor(): Color { return this.uniforms.coverColor.value }
  set coverColor(v: ColorRepresentation) { this.uniforms.coverColor.value = new Color(v) }
  get coverStength(): number { return this.uniforms.coverStength.value }
  set coverStength(v: number) { this.uniforms.coverStength.value = v }
  get cover(): boolean { return this.uniforms.cover.value }
  set cover(v: boolean) { this.uniforms.cover.value = v }
  get mixColor(): Color { return this.uniforms.mixColor.value }
  set mixColor(v: ColorRepresentation) { this.uniforms.mixColor.value = new Color(v) }
  get mixStength(): number { return this.uniforms.mixStength.value }
  set mixStength(v: number) { this.uniforms.mixStength.value = v }
  get bgColor(): Color { return this.uniforms.bgColor.value }
  set bgColor(v: ColorRepresentation) { this.uniforms.bgColor.value = new Color(v) }
  get bgAlpha(): number { return this.uniforms.bgAlpha.value }
  set bgAlpha(v: number) { this.uniforms.bgAlpha.value = v }
  get fgColor(): Color { return this.uniforms.fgColor.value }
  set fgColor(v: ColorRepresentation) { this.uniforms.fgColor.value = new Color(v) }
  get fgAlpha(): number { return this.uniforms.fgAlpha.value }
  set fgAlpha(v: number) { this.uniforms.fgAlpha.value = v }
  get x(): number { return this.uniforms.x.value }
  set x(v: number) { this.uniforms.x.value = v }
  get y(): number { return this.uniforms.y.value }
  set y(v: number) { this.uniforms.y.value = v }
  get w(): number { return this.uniforms.w.value }
  set w(v: number) { this.uniforms.w.value = v }
  get h(): number { return this.uniforms.h.value }
  set h(v: number) { this.uniforms.h.value = v }
  set_origin_size(w: number, h: number): void {
    this.uniforms.tw.value = w;
    this.uniforms.th.value = h;
  }
  set_origin_scale(x: number, y: number): void {
    this.uniforms.tsw.value = x;
    this.uniforms.tsh.value = y;
  }
  set_clip(x: number, y: number, w: number, h: number): void {
    this.uniforms.x.value = x
    this.uniforms.y.value = y
    this.uniforms.w.value = w
    this.uniforms.h.value = h
  }
}

MaterialFactory.register({
  kind: MaterialKind.Outline,
  cls: OutlineMaterial,
  create: () => new OutlineMaterial(),
  reset: (c: OutlineMaterial) => c.reset(),
})