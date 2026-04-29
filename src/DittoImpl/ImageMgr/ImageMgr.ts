import img_error from "@/assets/error.png";
import { parse_rgba } from "@/LF2";
import { MagnificationTextureFilter } from "@/LF2/defines/MagnificationTextureFilter";
import { MinificationTextureFilter } from "@/LF2/defines/MinificationTextureFilter";
import { TextureWrapping } from "@/LF2/defines/TextureWrapping";
import { IImageInfo } from "@/LF2/ditto/image/IImageInfo";
import AsyncValuesKeeper from "../../LF2/base/AsyncValuesKeeper";
import { ILegacyPictureInfo } from "../../LF2/defines/ILegacyPictureInfo";
import type IPicture from "../../LF2/defines/IPicture";
import { IPictureInfo } from "../../LF2/defines/IPictureInfo";
import type { IStyle } from "../../LF2/defines/IStyle";
import { IImageMgr, ImageOperation } from "../../LF2/ditto/image/IImageMgr";
import type { LF2 } from "../../LF2/LF2";
import { validate_ui_img_operation_crop } from "../../LF2/loader/validate_ui_img_operation_crop";
import { is_positive_int, max, round } from "../../LF2/utils";
import { create_img_ele } from "../../Utils/create_img_ele";
import { get_blob } from "../../Utils/get_blob";
import * as T from "../_t";
import { md5 } from "../md5";
import { RImageInfo } from "../RImageInfo";
import { RTextInfo } from "../RTextInfo";
import { handle_image_operation_crop, handle_image_operation_flip, handle_image_operation_mask, handle_image_operation_resize } from "./handle_image_operation";
export class ImageMgr implements IImageMgr {
  static readonly TextureLoader = new T.TextureLoader();
  static readonly ERROR_TEXTURE: Readonly<T.Texture<HTMLImageElement>> = ImageMgr.TextureLoader.load(img_error)
  static readonly EMPTY_TEXTURE: Readonly<T.Texture<HTMLImageElement>> = ImageMgr.TextureLoader.load("");
  protected pictures = new Map<string, IPicture>();
  protected infos = new AsyncValuesKeeper<RImageInfo>();
  protected disposables = new Map<string, RImageInfo>();
  readonly lf2: LF2;
  constructor(lf2: LF2) { this.lf2 = lf2; }

  private async create_img_info(key: string, src: string, operations?: ImageOperation[]): Promise<RImageInfo> {
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
      switch (v.type) {
        case "mask": return true;
        case "crop":
          return validate_ui_img_operation_crop(v)
        case "resize":
          if (!is_positive_int(v.w)) return false
          if (!is_positive_int(v.h)) return false
          return true;
        case "flip":
          return v.x || v.y;
      }
    });

    if (!vaild_operations?.length) {
      const ret = new RImageInfo({
        key,
        src,
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
    const ret = new RImageInfo({ key, url, src_url, scale, w: cvs!.width, h: cvs!.height });
    if (disposable) this.add_disposable(ret);
    return ret;
  }

  private async create_txt_info(key: string, text: string, style?: IStyle | null): Promise<RTextInfo> {
    const cvs = document.createElement("canvas");
    const ctx = cvs.getContext("2d");
    if (!ctx) throw new Error("can not get context from canvas");
    if (!style) style = {};
    const {
      padding_l = 2,
      padding_t = 2,
      scale = 2,
    } = style;
    apply_text_style(style, ctx);
    const [lines, w, h] = split_text_to_lines(text, ctx, style);
    cvs.style.width = (cvs.width = scale * w) + "px";
    cvs.style.height = (cvs.height = scale * h) + "px";
    ctx.save();
    ctx.scale(scale, scale);
    style.fill_style = style.fill_style ?? 'white';
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
    const ret = new RTextInfo().merge({
      key,
      url,
      scale,
      src_url: url,
      w: cvs.width,
      h: cvs.height,
      text: text,
      style
    });
    if (style.disposable) this.add_disposable(ret);
    return ret;
  }

  private add_disposable(ret: RImageInfo) {
    this.disposables.set(ret.key, ret);
    if (this.disposables.size > 1000) {
      const { value } = this.disposables.keys().next();
      if (value) {
        this.disposables.delete(value);
        this.infos.del(value);
      }
    }
  }

  find(key: string): RImageInfo | undefined {
    return this.infos.get(key);
  }

  load_text(text: string, style: IStyle | null = {}): Promise<RTextInfo> {
    const key = md5(text, JSON.stringify(style));
    const fn = async () => {
      const info = await this.create_txt_info(key, text, style)
      info.pic = await this.p_create_picture(info);
      return info;
    };
    return this.infos.fetch(key, fn) as Promise<RTextInfo>;
  }

  load_img(key: string, src: string, operations?: ImageOperation[]): Promise<RImageInfo> {
    const fn = async () => {
      this.lf2.on_loading_content(`${key}`, 0);
      const info = await this.create_img_info(key, src, operations);
      info.pic = await this.p_create_picture(info);
      return info;
    };
    return this.infos.fetch(key, fn);
  }

  del(key: string) {
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

  async load_by_pic_info(f: ILegacyPictureInfo | IPictureInfo): Promise<RImageInfo> {
    const key = this._gen_key(f);
    return this.load_img(key, f.path);
  }
  find_by_pic_info(f: IPictureInfo | ILegacyPictureInfo): RImageInfo | undefined {
    return this.infos.get(this._gen_key(f));
  }

  private edit_image(src: HTMLCanvasElement | HTMLImageElement, op: ImageOperation): HTMLCanvasElement {
    switch (op.type) {
      case 'mask': return handle_image_operation_mask(src, op);
      case 'crop': return handle_image_operation_crop(src, op);
      case 'resize': return handle_image_operation_resize(src, op);
      case 'flip': return handle_image_operation_flip(src, op);
    }
  }

  create_picture(
    img_info: IImageInfo,
    onLoad?: (data: IPicture) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void): IPicture {
    const {
      url, w, h,
      min_filter = MinificationTextureFilter.Nearest,
      mag_filter = MagnificationTextureFilter.Nearest,
      wrap_s = TextureWrapping.MirroredRepeat,
      wrap_t = TextureWrapping.MirroredRepeat,
      scale
    } = img_info;

    const ret: IPicture = {
      id: img_info.key,
      w: w / scale,
      h: h / scale,
      texture: ImageMgr.EMPTY_TEXTURE.clone()
    }
    ret.texture = ImageMgr.TextureLoader.load(url, (t) => {
      ret.texture = t
      onLoad?.(ret)
    }, onProgress, onError);
    ret.texture.colorSpace = T.SRGBColorSpace;
    ret.texture.minFilter = min_filter;
    ret.texture.magFilter = mag_filter;
    ret.texture.wrapS = wrap_s;
    ret.texture.wrapT = wrap_t;
    return ret;
  }
  p_create_picture(
    img_info: IImageInfo,
    onProgress?: (event: ProgressEvent) => void
  ): Promise<IPicture> {
    return new Promise((resolve, reject) => {
      this.create_picture(img_info, resolve, onProgress, reject)
    })
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
  if (!underline_width) return;
  const { padding_l = 2, padding_t = 2 } = style
  ctx.strokeStyle = underline_color ?? style.fill_style ?? "white";
  ctx.lineWidth = underline_width;
  for (const { x, y, w } of lines) {
    ctx.beginPath();
    ctx.moveTo(padding_l + x, padding_t + y + underline_width + 1);
    ctx.lineTo(padding_l + x + w, padding_t + y + underline_width + 1);
    ctx.stroke();
  }
}

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
  return !!parse_rgba(style.stroke_style)?.a;
}
function need_fiil(style: IStyle): boolean {
  if (!style.fill_style) return true;
  return !!parse_rgba(style.fill_style)?.a
}