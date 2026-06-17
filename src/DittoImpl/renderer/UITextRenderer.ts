import type { UINode } from "@/LF2";
import { parse_rgba } from "@/LF2";
import type { IStyle } from "@/LF2/defines/IStyle";
import { max, round } from "@/LF2/utils";
import * as T from "../_t";
import { MaterialFactory, MaterialKind } from "./factory";
import { get_static_plane_geometry } from "./GeometryKeeper";
import { OutlineMaterial } from "./materials";
import { UINodeRenderer } from "./UINodeRenderer";

// ========== 文字绘制工具函数（参照 ImageMgr 实现） ==========

interface ITextLineInfo { x: number; y: number; t: string; w: number; h: number; }

function split_text_to_lines(text: string, ctx: CanvasRenderingContext2D, style: IStyle): [ITextLineInfo[], number, number] {
  let w = 0, h = 0;
  const { padding_l = 2, padding_r = 2, padding_t = 2, padding_b = 2 } = style;
  const lines = text.split("\n").map<ITextLineInfo>((line, idx, arr) => {
    const t = idx === arr.length - 1 ? line : line + "\n";
    const { width, fontBoundingBoxAscent: a, fontBoundingBoxDescent: d } = ctx.measureText(t);
    const ret = { x: 0, y: h + a, t, w: width, h: a + d };
    w = max(w, width);
    h += ret.h;
    return ret;
  });
  w += padding_l + padding_r;
  h += padding_t + padding_b;
  if (style.text_align === "center") for (const l of lines) l.x = round(w / 2);
  if (style.text_align === "right") for (const l of lines) l.x = round(w);
  return [lines, w, h];
}

function draw_underline(style: IStyle, ctx: CanvasRenderingContext2D, lines: ITextLineInfo[]) {
  const { underline_color, underline_width } = style;
  if (!underline_width) return;
  const { padding_l = 2, padding_t = 2 } = style;
  ctx.strokeStyle = underline_color ?? style.fill_style ?? "white";
  ctx.lineWidth = underline_width;
  for (const { x, y, w } of lines) {
    ctx.beginPath();
    ctx.moveTo(padding_l + x, padding_t + y + underline_width + 1);
    ctx.lineTo(padding_l + x + w, padding_t + y + underline_width + 1);
    ctx.stroke();
  }
}

function need_stroke(style: IStyle): boolean {
  if (!style.stroke_style) return false;
  if (!style.line_width || style.line_width < 0) return false;
  return !!parse_rgba(style.stroke_style)?.a;
}

function need_fill(style: IStyle): boolean {
  if (!style.fill_style) return true;
  return !!parse_rgba(style.fill_style)?.a;
}

function apply_text_style(style: IStyle, ctx: CanvasRenderingContext2D) {
  ctx.font = style.font ?? "normal 9px system-ui";
  ctx.fillStyle = style.fill_style ?? "white";
  ctx.strokeStyle = style.stroke_style ?? "";
  ctx.lineWidth = style.line_width ?? 0;
  ctx.textAlign = (style.text_align ?? "left") as CanvasTextAlign;
  ctx.shadowColor = style.shadow_color ?? "";
  ctx.shadowBlur = style.shadow_color ? (style.shadow_blur ?? 0) : 0;
  ctx.shadowOffsetX = style.shadow_color ? (style.shadow_offset_x ?? 0) : 0;
  ctx.shadowOffsetY = style.shadow_color ? (style.shadow_offset_y ?? 0) : 0;
  ctx.imageSmoothingEnabled = style.smoothing ?? false;
}

// ========== UITextRenderer ==========

export class UITextRenderer {
  protected _geo = get_static_plane_geometry(100, 100, 0, 0, 0);
  mesh: T.Mesh<T.BufferGeometry, OutlineMaterial>;
  owner: UINodeRenderer;
  ui: UINode;

  protected _canvas: HTMLCanvasElement;
  protected _ctx: CanvasRenderingContext2D;
  protected _texture: T.CanvasTexture;

  constructor(owner: UINodeRenderer) {
    this.owner = owner;
    this.ui = owner.ui;

    // 创建离屏 Canvas 及 CanvasTexture
    this._canvas = document.createElement('canvas');
    this._ctx = this._canvas.getContext('2d')!;
    this._texture = new T.CanvasTexture(this._canvas);

    this.mesh = new T.Mesh(
      this._geo,
      MaterialFactory.get(MaterialKind.Outline, OutlineMaterial)
    );
    this.mesh.name = `UITextMesh`;
    this.mesh.material.alpha = 1;
    this.mesh.material.texture = this._texture;

    // 初始化文本绘制
    this.update();
  }

  /** 重新绘制 Canvas 上的文字（参照 ImageMgr.create_txt_info） */
  protected _draw_text(): void {
    const { _canvas, _ctx } = this;
    const txt = this.ui.text;
    _ctx.clearRect(0, 0, _canvas.width, _canvas.height);

    if (!txt?.text) return;

    const style: IStyle = txt.style || {};
    const scale = style.scale || 2;
    const {
      padding_l = 2,
      padding_t = 2,
      padding_r = 2,
      padding_b = 2,
    } = style;

    // 应用文字样式
    apply_text_style(style, _ctx);

    // 分行计算尺寸
    const [lines, w, h] = split_text_to_lines(txt.text, _ctx, style);

    // 缩放后的画布尺寸
    const cw = Math.max(1, scale * w);
    const ch = Math.max(1, scale * h);

    if (_canvas.width !== cw || _canvas.height !== ch) {
      _canvas.width = cw;
      _canvas.height = ch;
      // 画布尺寸变化时重建 CanvasTexture，避免 GL 纹理尺寸不匹配
      this._texture.dispose();
      this._texture = new T.CanvasTexture(_canvas);
      this.mesh.material.texture = this._texture;
      // geometry 使用逻辑尺寸（w×h），canvas 使用 HiDPI 尺寸（scale*w × scale*h）
      this._geo = get_static_plane_geometry(w, h, 0, 0, 0);
      this.mesh.geometry = this._geo;
      // 调整 canvas 大小后需重新设置样式（canvas 重置会清除状态）
      apply_text_style(style, _ctx);
    }

    _ctx.save();
    _ctx.scale(scale, scale);

    style.fill_style = style.fill_style ?? 'white';
    const nf = need_fill(style);
    const ns = need_stroke(style);

    if (nf || ns) {
      apply_text_style(style, _ctx);
      for (const { x, y, t } of lines) {
        if (nf) _ctx.fillText(t, padding_l + x, padding_t + y);
        if (ns) _ctx.strokeText(t, padding_l + x, padding_t + y);
      }
      draw_underline(style, _ctx, lines);
    }

    _ctx.restore();
  }

  /** 更新文字并刷新贴图 */
  update(): void {
    this._draw_text();
    this._texture.needsUpdate = true;
    // alpha 跟随父级 UINodeRenderer
    this.mesh.material.alpha = this.owner.mesh.material.alpha;
  }

}
