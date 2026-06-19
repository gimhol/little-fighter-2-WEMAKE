import { Color, type ColorRepresentation, ShaderMaterial, Texture } from "../../_t";
import { MaterialFactory, MaterialKind } from "../factory/MaterialFactory";
import { Shaders } from "../shader";
export const BLACK = new Color("#000000");

export class OutlineMaterial extends ShaderMaterial {
  static readonly KIND = MaterialKind.Outline;
  static create(): OutlineMaterial { return new OutlineMaterial(); }
  static reset(c: OutlineMaterial) { c.reset(); }

  protected _outlineColor = BLACK.clone();
  protected _coverColor = BLACK.clone();
  protected _mixColor = BLACK.clone();
  protected _bgColor = BLACK.clone();
  protected _fgColor = BLACK.clone();

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
      outlineColor: { value: this._outlineColor },
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
      mixColor: { value: this._mixColor },
      /** 混色强度,一般范围:[0,1], 当为0，不混色 */
      mixStength: { value: 0 },
      cover: { value: false },
      coverColor: { value: this._coverColor },
      coverStength: { value: 0 },
      gray: { value: 0 },
      keepout: { value: true },

      bgColor: { value: this._bgColor },
      bgAlpha: { value: 0 },

      fgColor: { value: this._fgColor },
      fgAlpha: { value: 0 },

      deburrMin: { value: 0.75 },
      deburrMax: { value: 0.95 },
      deburrJudge: { value: 0.75 },
    }
  }
  get texture(): Texture | undefined { return this.uniforms.tex.value }
  set texture(v: Texture | undefined) { this.uniforms.tex.value = v }
  get alpha(): number { return this.uniforms.opacity.value ?? 1 }
  set alpha(v: number) { this.uniforms.opacity.value = v }
  get outlineColor(): Color { return this._outlineColor }
  set outlineColor(v: ColorRepresentation) { this._outlineColor.set(v) }
  get outlineAlpha(): number { return this.uniforms.outlineAlpha.value }
  set outlineAlpha(v: number) { this.uniforms.outlineAlpha.value = v }
  get gray(): number { return this.uniforms.gray.value }
  set gray(v: number) { this.uniforms.gray.value = v }
  get outlineWidth(): number { return this.uniforms.outlineWidth.value }
  set outlineWidth(v: number) { this.uniforms.outlineWidth.value = v }
  get coverColor(): Color { return this._coverColor }
  set coverColor(v: ColorRepresentation) { this._coverColor.set(v) }
  get coverStength(): number { return this.uniforms.coverStength.value }
  set coverStength(v: number) { this.uniforms.coverStength.value = v }
  get cover(): boolean { return this.uniforms.cover.value }
  set cover(v: boolean) { this.uniforms.cover.value = v }
  get mixColor(): Color { return this._mixColor }
  set mixColor(v: ColorRepresentation) { this._mixColor.set(v) }
  get mixStrength(): number { return this.uniforms.mixStength.value }
  set mixStrength(v: number) { this.uniforms.mixStength.value = v }
  get bgColor(): Color { return this._bgColor }
  set bgColor(v: ColorRepresentation) { this._bgColor.set(v) }
  get bgAlpha(): number { return this.uniforms.bgAlpha.value }
  set bgAlpha(v: number) { this.uniforms.bgAlpha.value = v }
  get fgColor(): Color { return this._fgColor }
  set fgColor(v: ColorRepresentation) { this._fgColor.set(v); }
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
  get flip_x(): number { return this.uniforms.flipX.value }
  set flip_x(v: number) { this.uniforms.flipX.value = v }
  set_origin_size(w: number, h: number): void {
    const u = this.uniforms
    u.tw.value = w;
    u.th.value = h;
  }
  set_origin_scale(x: number, y: number): void {
    const u = this.uniforms
    u.tsw.value = x;
    u.tsh.value = y;
  }
  set_clip(x: number, y: number, w: number, h: number): void {
    const u = this.uniforms
    u.x.value = x
    u.y.value = y
    u.w.value = w
    u.h.value = h
  }
  set_tex_size(w: number, h: number, scale_x: number = 1, scale_y: number = scale_x) {
    const u = this.uniforms
    u.tw.value = w;
    u.th.value = h;
    u.tsw.value = scale_x;
    u.tsh.value = scale_y;
  }
}

MaterialFactory.register(OutlineMaterial)