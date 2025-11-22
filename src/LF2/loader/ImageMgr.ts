import { ISize } from "splittings/dist/es/splittings";
import * as T from "three";
import { create_img_ele } from "../../Utils/create_img_ele";
import { get_blob } from "../../Utils/get_blob";
import type { LF2 } from "../LF2";
import AsyncValuesKeeper from "../base/AsyncValuesKeeper";
import { ILegacyPictureInfo } from "../defines/ILegacyPictureInfo";
import type IPicture from "../defines/IPicture";
import { IPictureInfo } from "../defines/IPictureInfo";
import type { IStyle } from "../defines/IStyle";
import { Ditto } from "../ditto";
import { get_alpha_from_color } from "../ui/utils/get_alpha_from_color";
import { is_positive_int, max, round } from "../utils";
import { IImageInfo } from "./IImageInfo";
import { ImageInfo } from "./ImageInfo";
import { ImageOperation_Crop } from "./ImageOperation_Crop";
import { TextInfo } from "./TextInfo";
import { validate_ui_img_operation_crop } from "./validate_ui_img_operation_crop";
import { error_texture } from "../../DittoImpl/renderer/error_texture";
import { create_picture } from "../../DittoImpl/renderer/create_picture";

export type TPicture = IPicture<T.Texture>;
export class ImageMgr {
  protected infos = new AsyncValuesKeeper<ImageInfo>();
  protected disposables = new Map<string, ImageInfo>();
  readonly lf2: LF2;
  constructor(lf2: LF2) {
    this.lf2 = lf2;
  }

  async create_img_info(key: string, src: string, operations?: ImageOperation[]): Promise<ImageInfo> {
    const disposable = src.startsWith('?');
    if (disposable) src = src.substring(1)

    const exact = src.startsWith('!');
    if (exact) src = src.substring(1)

    const [blob_url, src_url] = await this.lf2.import_resource(src, exact);
    const img = await create_img_ele(blob_url);
    img.setAttribute('src-url', src_url)

    const scale = max(1,
      Number(
        src_url.match(/@(\d)[x|X](.png|.webp)$/)?.[1] ??
        src_url.match(/@(\d)[x|X]\/(.*)(.png|.webp)$/)?.[1]
      ) || 1
    )
    img.setAttribute('scale', '' + scale)

    const vaild_operations = operations?.filter(v => {
      let vaild = true;
      switch (v.type) {
        case "crop":
          return validate_ui_img_operation_crop(v)
        case "resize":
          if (!is_positive_int(v.w)) { vaild = false }
          if (!is_positive_int(v.h)) { vaild = false }
          return vaild
      }
      return vaild;
    });

    if (!vaild_operations?.length) {
      const ret = new ImageInfo({
        key,
        url: blob_url,
        src_url,
        scale,
        w: img.width,
        h: img.height,
      });
      if (disposable) this.add_disposable(ret)
      return ret;
    }

    let cvs: HTMLCanvasElement | null = null;
    for (const op of vaild_operations) cvs = this.edit_image(cvs || img, op)

    const blob = await get_blob(cvs!).catch((e) => {
      const err = new Error(e.message + " key:" + key);
      Object.assign(err, { cause: e.cause })
      throw err
    });
    const url = URL.createObjectURL(blob);
    const ret = new ImageInfo({ key, url, src_url, scale, w: cvs!.width, h: cvs!.height });
    if (disposable) this.add_disposable(ret);
    return ret;
  }

  async create_txt_info(key: string, text: string, style: IStyle = {}): Promise<TextInfo> {
    const cvs = document.createElement("canvas");
    const ctx = cvs.getContext("2d");
    if (!ctx) throw new Error("can not get context from canvas");
    const {
      padding_l = 2,
      padding_t = 2,
    } = style;
    apply_text_style(style, ctx);
    const scale = 4;
    const [lines, w, h] = split_text_to_lines(text, ctx, style);
    cvs.style.width = (cvs.width = scale * w) + "px";
    cvs.style.height = (cvs.height = scale * h) + "px";
    ctx.save();
    ctx.scale(scale, scale);
    if (style.back_style) {
      const nf = need_fiil(style.back_style);
      const ns = need_stroke(style.back_style);
      apply_text_style(style.back_style, ctx);
      if (nf || ns) {
        for (const { x, y, t } of lines) {
          if (nf) ctx.fillText(t, padding_l + x, padding_t + y)
          if (ns) ctx.strokeText(t, padding_l + x, padding_t + y)
        }
        draw_underline(style, ctx, lines);
      }
    }

    const nf = need_fiil(style);
    const ns = need_stroke(style);
    if (nf || ns) {
      apply_text_style(style, ctx);
      for (const { x, y, t } of lines) {
        if (nf) ctx.fillText(t, padding_l + x, padding_t + y)
        if (ns) ctx.strokeText(t, padding_l + x, padding_t + y)
      }
      draw_underline(style, ctx, lines);
    }

    ctx.restore();
    const blob = await get_blob(cvs).catch((e) => {
      const err = new Error(e.message + " key:" + key);
      Object.assign(err, { cause: e.cause })
      throw err
    });
    const url = URL.createObjectURL(blob);
    const ret = new TextInfo().merge({
      key,
      url,
      scale: scale,
      src_url: url,
      w: cvs.width,
      h: cvs.height,
      text: text,
      style
    });
    if (style.disposable) this.add_disposable(ret);
    return ret;
  }

  private add_disposable(ret: ImageInfo) {
    this.disposables.set(ret.key, ret);
    if (this.disposables.size > 1000) {
      const { value } = this.disposables.keys().next();
      if (value) {
        this.disposables.delete(value);
        this.infos.del(value);
      }
    }
  }

  find(key: string): ImageInfo | undefined {
    return this.infos.get(key);
  }

  find_by_pic_info(f: IPictureInfo | ILegacyPictureInfo): ImageInfo | undefined {
    return this.infos.get(this._gen_key(f));
  }

  load_text(text: string, style: IStyle = {}): Promise<TextInfo> {
    const key = Ditto.MD5(text, JSON.stringify(style));
    const fn = () => this.create_txt_info(key, text, style);
    return this.infos.fetch(key, fn) as Promise<TextInfo>;
  }

  load_img(key: string, src: string, operations?: ImageOperation[]): Promise<ImageInfo> {
    const fn = async () => {
      this.lf2.on_loading_content(`${key}`, 0);
      const info = await this.create_img_info(key, src, operations);
      return info;
    };
    return this.infos.fetch(key, fn);
  }

  remove(key: string) {
    const img = this.infos.del(key);
    if (!img) return;
    if (img.url.startsWith("blob:")) URL.revokeObjectURL(img.url);
    return;
  }

  protected _gen_key = (f: ILegacyPictureInfo | IPictureInfo) => {
    if ('row' in f)
      return `${f.path}#${f.cell_w || 0}_${f.cell_h || 0}_${f.row}_${f.col}`;
    return f.path;
  }

  async load_by_e_pic_info(f: ILegacyPictureInfo | IPictureInfo): Promise<ImageInfo> {
    const key = this._gen_key(f);
    return this.load_img(key, f.path);
  }

  async create_pic(key: string, src: string, operations?: ImageOperation[]): Promise<TPicture> {
    const img_info = await this.load_img(key, src, operations);
    return this.p_create_pic_by_img_key(img_info.key);
  }

  create_pic_by_img_info(img_info: IImageInfo, onLoad?: (d: TPicture) => void, onError?: (err: unknown) => void): TPicture {
    const picture = err_pic_info(img_info.key);
    const ret = create_picture(img_info, picture, onLoad, void 0, onError);
    return ret;
  }

  p_create_pic_by_img_info(img_info: IImageInfo): Promise<TPicture> {
    return new Promise((a, b) => {
      const picture = err_pic_info(img_info.key);
      create_picture(img_info, picture, a, void 0, b);
    })
  }

  create_pic_by_img_key(img_key: string, onLoad?: (d: TPicture) => void, onError?: (err: unknown) => void): TPicture {
    const img_info = this.find(img_key);
    if (!img_info) return err_pic_info();
    return this.create_pic_by_img_info(img_info, onLoad, onError);
  }

  async p_create_pic_by_img_key(img_key: string): Promise<TPicture> {
    if (this.find(img_key)) return new Promise((a, b) => this.create_pic_by_img_key(img_key, a, b))
    await this.lf2.images.load_img(img_key, img_key)
    return new Promise((a, b) => this.create_pic_by_img_key(img_key, a, b))
  }

  create_pic_by_e_pic_info(e_pic_info: ILegacyPictureInfo, onLoad?: (d: TPicture) => void, onError?: (err: unknown) => void): TPicture {
    const img_info = this.find_by_pic_info(e_pic_info);
    const picture = err_pic_info();
    if (!img_info) return picture;
    return create_picture(img_info, picture, onLoad, void 0, onError);
  }
  p_create_pic_by_e_pic_info(e_pic_info: ILegacyPictureInfo): Promise<TPicture> {
    return new Promise((a, b) => this.create_pic_by_e_pic_info(e_pic_info, a, b))
  }

  async create_pic_by_text(text: string, style: IStyle = {}) {
    const img_info = await this.load_text(text, style);
    return this.p_create_pic_by_img_key(img_info.key);
  }


  edit_image(src: HTMLCanvasElement | HTMLImageElement, op: ImageOperation): HTMLCanvasElement {
    switch (op.type) {
      case 'crop': {
        const scale = Number(src.getAttribute("scale")) || 1
        const ret = document.createElement("canvas")
        ret.setAttribute('scale', '' + scale)
        ret.setAttribute('src-url', src.getAttribute('src-url') || '')
        const sx = op.x ? op.x * scale : 0;
        const sy = op.y ? op.y * scale : 0;
        const sw = op.w ? op.w * scale : src.width;
        const sh = op.h ? op.h * scale : src.height;
        ret.width = op.dw ? op.dw * scale : sw;
        ret.height = op.dh ? op.dh * scale : sh
        const dst_ctx = ret.getContext('2d');
        dst_ctx?.drawImage(src, sx, sy, sw, sh, 0, 0, ret.width, ret.height)
        return ret;
      }
      case 'resize': {
        const ret = document.createElement("canvas")
        ret.width = op.w > 0 ? op.w : src.width
        ret.height = op.h > 0 ? op.h : src.height
        const dst_ctx = ret.getContext('2d');
        dst_ctx?.drawImage(src, 0, 0, ret.width, ret.height, 0, 0, src.width, src.height)
        return ret;
      }
    }
  }
}

interface ITextLineInfo {
  x: number;
  y: number;
  t: string;
  w: number;
  h: number;
}
function split_text_to_lines(text: string, ctx: CanvasRenderingContext2D, style: IStyle): [ITextLineInfo[], number, number] {
  let w = 0
  let h = 0;
  const { padding_l = 2, padding_r = 2, padding_t = 2, padding_b = 2 } = style
  const lines = text.split("\n").map<ITextLineInfo>((line, idx, arr) => {
    const t = idx === arr.length ? line + "\n" : line;
    const {
      width, fontBoundingBoxAscent: a, fontBoundingBoxDescent: d,
    } = ctx.measureText(t);
    const ret = {
      x: 0,
      y: h + a,
      t,
      w: width,
      h: a + d
    };
    w = max(w, width);
    h += ret.h;
    ret.h += a + d;
    return ret;
  });
  w += padding_l + padding_r
  h += padding_t + padding_b
  if (style.text_align === "center") for (const l of lines) l.x = round(w / 2);
  if (style.text_align === "right") for (const l of lines) l.x = round(w);
  return [lines, w, h];
}

function draw_underline(style: IStyle, ctx: CanvasRenderingContext2D, lines: ITextLineInfo[]) {
  const { underline_color, underline_width } = style
  if (!underline_color || !underline_width) return;
  const { padding_l = 2, padding_t = 2 } = style
  ctx.strokeStyle = underline_color;
  ctx.lineWidth = underline_width;
  for (const { x, y, w } of lines) {
    ctx.beginPath();
    ctx.moveTo(padding_l + x, padding_t + y + underline_width + 1);
    ctx.lineTo(padding_l + x + w, padding_t + y + underline_width + 1);
    ctx.stroke();
  }

}

export function err_pic_info(id: string = ""): TPicture {
  return {
    id,
    w: 0,
    h: 0,
    texture: error_texture(),
  };
}
export const texture_loader = new T.TextureLoader();
export interface ImageOperation_Resize extends ISize {
  type: 'resize';
}
export type ImageOperation = ImageOperation_Crop | ImageOperation_Resize;

function apply_text_style(style: IStyle, ctx: CanvasRenderingContext2D) {
  ctx.font = style.font ?? "normal 9px system-ui";
  ctx.fillStyle = style.fill_style ?? "white";
  ctx.strokeStyle = style.stroke_style ?? "";
  ctx.lineWidth = style.line_width ?? 0;
  ctx.textAlign = style.text_align ?? "left";
  ctx.shadowColor = style.shadow_color ?? "";
  ctx.shadowBlur = style.shadow_color ? style.shadow_blur ?? 0 : 0;
  ctx.shadowOffsetX = style.shadow_color ? style.shadow_offset_x ?? 0 : 0;
  ctx.shadowOffsetY = style.shadow_color ? style.shadow_offset_y ?? 0 : 0;
  ctx.imageSmoothingEnabled = style.smoothing ?? false;

}
function need_stroke(style: IStyle): boolean {
  if (!style.stroke_style) return false;
  if (!style.line_width || style.line_width < 0) return false;
  const n = get_alpha_from_color(style.fill_style);
  return n === null || n > 0;
}
function need_fiil(style: IStyle): boolean {
  if (!style.fill_style) return true;
  const n = get_alpha_from_color(style.fill_style);
  return n === null || n > 0;
}