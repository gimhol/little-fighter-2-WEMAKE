import type { LFW } from "@/LFW";
import { BufferGeometry, CanvasTexture, Mesh } from "three";
import { MaterialFactory, MaterialKind, MeshFactory } from "../factory";
import { get_static_plane_geometry } from "../GeometryKeeper";
import { BLACK, TextMaterial } from "../materials";

const TEXT_GEOMETRY = get_static_plane_geometry(1, 1);
const DEFAULT_FONT = "9px Arial";

export class SmallTextMesh extends Mesh<BufferGeometry, TextMaterial> {
  static get(): SmallTextMesh {
    return MeshFactory.get('SmallText', SmallTextMesh)
  }
  static KIND = 'SmallText'
  static create = () => new SmallTextMesh()
  static reset = (inst: SmallTextMesh) => inst.reset()

  protected _fillStyle: string = '';
  protected _strokeStyle: string = '';
  protected _text: string = '';
  protected _canvas: HTMLCanvasElement;
  protected _ctx: CanvasRenderingContext2D;
  protected _texture: CanvasTexture;

  constructor() {
    const m = MaterialFactory.get(MaterialKind.Text, TextMaterial);
    super(TEXT_GEOMETRY, m);
    this._canvas = document.createElement('canvas');
    this._ctx = this._canvas.getContext('2d')!;
    this._texture = new CanvasTexture(this._canvas);
    this.material.texture = this._texture;
  }

  reset(): void {
    this._text = '';
    this._fillStyle = '';
    this._strokeStyle = '';
    this._texture.dispose();
    const canvas = document.createElement('canvas');
    this._canvas = canvas;
    this._ctx = canvas.getContext('2d')!;
    this._texture = new CanvasTexture(canvas);
    this.material.texture = this._texture;
    this.material.mixStrength = 0;
    this.material.mixColor = BLACK;
    this.material.outlineAlpha = 0;
    this.material.outlineWidth = 0;
    this.material.outlineColor = BLACK;
  }

  get text(): string { return this._text; }

  get fillStyle() { return this._fillStyle }
  set fillStyle(v: string) {
    this._fillStyle = v
    this.material.mixStrength = v ? 1 : 0;
    this.material.mixColor = v ? v : BLACK
  }

  get strokeStyle() { return this._strokeStyle }
  set strokeStyle(v: string) {
    this._strokeStyle = v
    this.material.outlineAlpha = v ? 1 : 0;
    this.material.outlineWidth = v ? 1 : 0;
    this.material.outlineColor = v ? v : BLACK;
    if (this._text) this._draw_text();
  }

  async set_text(_lfw: LFW, text: string): Promise<this> {
    if (this._text === text) return this;
    this._text = text;
    this._draw_text();
    this.material.texture = this._texture;
    this.material.needsUpdate = true;
    return this;
  }

  protected _draw_text(): void {
    const { _canvas, _ctx } = this;
    if (!this._text) {
      _ctx.clearRect(0, 0, _canvas.width, _canvas.height);
      this._texture.needsUpdate = true;
      this.scale.set(1, 1, 1);
      return;
    }

    _ctx.font = DEFAULT_FONT;
    _ctx.textAlign = 'left';
    _ctx.textBaseline = 'alphabetic';
    _ctx.imageSmoothingEnabled = false;

    const metrics = _ctx.measureText(this._text);
    const tw = Math.max(1, Math.ceil(metrics.width));
    const th = Math.max(1, Math.ceil(metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent));

    const pad = this.material.outlineWidth;
    const cw = tw + 2 * pad;
    const ch = th + 2 * pad;

    if (_canvas.width !== cw || _canvas.height !== ch) {
      _canvas.width = cw;
      _canvas.height = ch;
      this._texture.dispose();
      this._texture = new CanvasTexture(_canvas);
    }

    _ctx.font = DEFAULT_FONT;
    _ctx.fillStyle = 'white';
    _ctx.textAlign = 'left';
    _ctx.textBaseline = 'top';
    _ctx.imageSmoothingEnabled = false;

    _ctx.clearRect(0, 0, cw, ch);
    _ctx.fillText(this._text, pad, pad);

    this.scale.x = cw;
    this.scale.y = ch;
    this._texture.needsUpdate = true;
  }
}

MeshFactory.register(SmallTextMesh)