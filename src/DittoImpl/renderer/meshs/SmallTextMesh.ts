import type { IStyle, LF2 } from "@/LF2";
import { BufferGeometry, Mesh, ShaderMaterial } from "three";
import * as T from "../../_t";
import { IInstCreator, MaterialFactory, MaterialKind, MeshFactory } from "../factory";
import { get_geometry } from "../GeometryKeeper";
const TEXT_GEOMETRY = get_geometry(1, 1);
const TEXT_STYLE: IStyle = {
  fill_style: 'white',
  disposable: true,
  smoothing: false,
  scale: 1,
}
export class SmallTextMesh extends Mesh<BufferGeometry, ShaderMaterial> {
  static get(): SmallTextMesh {
    return MeshFactory.get('SmallText', SmallTextMesh)
  }
  protected _fillStyle: string = '';
  protected _strokeStyle: string = '';
  text: string = ''
  constructor() {
    const m = MaterialFactory.get(MaterialKind.Outline, ShaderMaterial);
    super(TEXT_GEOMETRY, m)
  }
  reset(): void {
    this.material.uniforms.tex.value = void 0;
    this.fillStyle = '';
    this.strokeStyle = ''
  }
  set fillStyle(v: string) {
    this._fillStyle = v
    this.material.uniforms.mixStreath.value = v ? 1 : 0;
    this.material.uniforms.mixColor.value = new T.Color(v ? v : void 0);
  }
  set strokeStyle(v: string) {
    this._strokeStyle = v
    this.material.uniforms.outlineAlpha.value = v ? 1 : 0;
    this.material.uniforms.outlineColor.value = new T.Color(v ? v : void 0);
  }
  async set_text(lf2: LF2, text: string): Promise<this> {
    if (this.text == text) return this;
    this.text = text
    const p = await lf2.images.load_text(text, TEXT_STYLE);
    if (this.text != text) return this;
    const { uniforms } = this.material;
    uniforms.tex.value = p.pic?.texture;
    this.material.needsUpdate = true;
    this.scale.x = p.w / p.scale;
    this.scale.y = p.h / p.scale;
    return this;
  }
}

const SmallText: IInstCreator<SmallTextMesh> = {
  kind: 'SmallText',
  cls: SmallTextMesh,
  create: () => new SmallTextMesh(),
  reset: (inst) => inst.reset(),
}
MeshFactory.register(SmallText)