import { ImageOperation } from "../ditto/image/IImageMgr";
import { IImageOp_Crop } from "../ditto/image/IImageOp_Crop";
import { IImageOp_Flip } from "../ditto/image/IImageOp_Flip";
import { ImageInfo } from "../ditto/image/ImageInfo";
import { Ditto } from "../ditto/Instance";
import { LF2 } from "../LF2";
import { IUIImgInfo } from "./IUIImgInfo.dat";
import { validate_ui_img_info } from "./utils/validate_ui_img_info";

export async function ui_load_img(lf2: LF2, img: IUIImgInfo): Promise<ImageInfo> {
  const errors: string[] = [];
  validate_ui_img_info(img, errors);
  if (errors.length) throw new Error(errors.join('\n'));

  const { path, x, y, w = 0, h = 0, dw = w, dh = h, flip_x = 0, flip_y = 0 } = img;
  const p = Ditto.MD5([x, y, w, h, dw, dh, flip_x, flip_y].join())
  const img_key = `${path}?x=${p}`;
  const ops: ImageOperation[] = []
  if (dw > 0 || dh > 0) {
    const op: IImageOp_Crop = {
      type: "crop", ...img
    }
    ops.push(op)
  }
  if (flip_x || flip_y) {
    const op: IImageOp_Flip = {
      type: "flip",
      x: flip_x,
      y: flip_y,
    }
    ops.push(op)
  }
  return lf2.images.load_img(img_key, path, ops);

}
