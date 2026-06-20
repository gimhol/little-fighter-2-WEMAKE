import type { IStyle, LFW } from "@/LFW";
import { BufferGeometry, Mesh } from "three";
import { MaterialFactory, MaterialKind, MeshFactory } from "../factory";
import { get_static_plane_geometry } from "../GeometryKeeper";
import { BLACK, TextMaterial } from "../materials";
const TEXT_GEOMETRY = get_static_plane_geometry(1, 1);
const TEXT_STYLE: IStyle = {
  fill_style: 'white',
  font: "9px Arial",
  smoothing: false,
  scale: 1,
}
export class SmallTextMesh extends Mesh<BufferGeometry, TextMaterial> {
  static get(): SmallTextMesh {
    return MeshFactory.get('SmallText', SmallTextMesh)
  }
  static KIND = 'SmallText'
  static create = () => new SmallTextMesh()
  static reset = (inst: SmallTextMesh) => inst.reset()
  
  protected _fillStyle: string = '';
  protected _strokeStyle: string = '';
  protected _text: string = ''
  constructor() {
    const m = MaterialFactory.get(MaterialKind.Text, TextMaterial);
    super(TEXT_GEOMETRY, m)
  }
  reset(): void {
    this.material.uniforms.tex.value = void 0;
    this.fillStyle = '';
    this.strokeStyle = ''
  }
  get text(): string { return this._text; }
  get fillStyle() { return this._fillStyle }
  set fillStyle(v: string) {
    this._fillStyle = v
    this.material.uniforms.mixStength.value = v ? 1 : 0;
    this.material.uniforms.mixColor.value.set(v ? v : BLACK)
  }
  get strokeStyle() { return this._strokeStyle }
  set strokeStyle(v: string) {
    this._strokeStyle = v
    this.material.uniforms.outlineAlpha.value = v ? 1 : 0;
    this.material.uniforms.outlineWidth.value = v ? 1 : 0;
    this.material.uniforms.outlineColor.value.set(v ? v : BLACK);
  }
  async set_text(lfw: LFW, text: string): Promise<this> {
    if (this._text == text) return this;
    this._text = text
    const p = await lfw.images.load_text(text, TEXT_STYLE);
    if (this._text != text) return this;
    this.scale.x = p.w / p.scale;
    this.scale.y = p.h / p.scale;
    const { uniforms } = this.material;
    uniforms.tex.value = p.pic?.texture;
    this.material.needsUpdate = true;
    return this;
  }
}
MeshFactory.register(SmallTextMesh)