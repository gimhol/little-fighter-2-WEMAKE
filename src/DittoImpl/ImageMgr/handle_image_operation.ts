import { IImageOp_Flip, IImageOp_Resize } from "@/LF2";
import { IImageOp_Color } from "@/LF2/ditto/image/IImageOp_Color";
import { IImageOp_Crop } from "@/LF2/ditto/image/IImageOp_Crop";
const temp_cavnas = document.createElement("canvas");
const temp_ctx = temp_cavnas.getContext('2d')!;
function pre_job(src: HTMLCanvasElement | HTMLImageElement) {
  const src_w = src.width;
  const src_h = src.height;
  const src_url = src.getAttribute('src-url') || ''
  const scale = Number(src.getAttribute("scale")) || 1
  const canvas = document.createElement("canvas")
  canvas.setAttribute('scale', '' + scale)
  canvas.setAttribute('src-url', src_url)
  return { canvas, src_w, src_h, scale };
}
export function handle_image_operation_crop(src: HTMLCanvasElement | HTMLImageElement, op: IImageOp_Crop): HTMLCanvasElement {
  const { canvas, scale } = pre_job(src);
  const sx = op.x ? op.x * scale : 0;
  const sy = op.y ? op.y * scale : 0;
  const sw = op.w ? op.w * scale : src.width;
  const sh = op.h ? op.h * scale : src.height;
  canvas.width = op.dw ? op.dw * scale : sw;
  canvas.height = op.dh ? op.dh * scale : sh
  const ctx = canvas.getContext('2d');
  ctx?.drawImage(src, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
  return canvas;
}
export function handle_image_operation_resize(src: HTMLCanvasElement | HTMLImageElement, op: IImageOp_Resize): HTMLCanvasElement {
  const { canvas, scale, src_w, src_h } = pre_job(src);
  const dst_w = canvas.width = op.w > 0 ? op.w : src_w
  const dst_h = canvas.height = op.h > 0 ? op.h : src_h
  const dst_ctx = canvas.getContext('2d');
  dst_ctx?.drawImage(src, 0, 0, dst_w, dst_h, 0, 0, src_w, src_h)
  return canvas;
}
export function handle_image_operation_flip(src: HTMLCanvasElement | HTMLImageElement, op: IImageOp_Flip): HTMLCanvasElement {
  const { canvas, src_w, src_h } = pre_job(src);
  const w = canvas.width = src_w;
  const h = canvas.height = src_h;
  const ctx = canvas.getContext('2d');
  if (op.x) { ctx?.scale(-1, 1); ctx?.translate(-w, 0) }
  if (op.y) { ctx?.scale(1, -1); ctx?.translate(0, -h) }
  ctx?.drawImage(src, 0, 0, w, h, 0, 0, w, h)
  return canvas;
}
export function handle_image_operation_mask(src: HTMLCanvasElement | HTMLImageElement, op: IImageOp_Color): HTMLCanvasElement {
  const { canvas, src_w, src_h } = pre_job(src);
  const sx = 0;
  const sy = 0;
  const sw = src_w;
  const sh = src_h;
  canvas.width = sw;
  canvas.height = sh
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(src, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
  for (const { operation, color } of op.packs) {
    ctx.globalCompositeOperation = operation
    temp_cavnas.width = canvas.width
    temp_cavnas.height = canvas.height
    temp_ctx.fillStyle = color
    temp_ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(temp_cavnas, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
  }
  return canvas;
}