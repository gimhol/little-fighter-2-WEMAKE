import { Ditto } from "../ditto";
import { LF2 } from "../LF2";
import { ImageOperation } from "../ditto/IImageMgr";
import { IImageOp_Crop } from "../loader/IImageOp_Crop";
import { IImageOp_Flip } from "../loader/IImageOp_Flip";
import { is_arr } from "../utils";
import { flat_ui_img_info } from "./cook_ui_info";
import { IUIImgInfo } from "./IUIImgInfo.dat";
import type { TUIImgInfo } from "./IUIInfo.dat";

export async function ui_load_img(lf2: LF2, img: TUIImgInfo | TUIImgInfo[], output?: IUIImgInfo[]) {
  const imgs = flat_ui_img_info(is_arr(img) ? img : [img], output);
  return await Promise.all(
    imgs.map(img => {
      const { path, x, y, w = 0, h = 0, dw = w, dh = h, flip_x = 0, flip_y = 0 } = img;
      const p = Ditto.MD5([x, y, w, h, dw, dh, flip_x, flip_y].join())
      const img_key = `${path}?x=${p}`;
      const crop: IImageOp_Crop = {
        type: "crop", ...img
      };
      const ops: ImageOperation[] = [crop]
      if (flip_x || flip_y) {
        const flip: IImageOp_Flip = {
          type: "flip",
          x: flip_x,
          y: flip_y,
        }
        ops.push(flip)
      }
      return lf2.images.load_img(img_key, path, ops);
    })
  );
}
