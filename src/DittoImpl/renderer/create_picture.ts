import * as T from "three";
import { MagnificationTextureFilter } from "@/LF2/defines/MagnificationTextureFilter";
import { MinificationTextureFilter } from "@/LF2/defines/MinificationTextureFilter";
import { TextureWrapping } from "@/LF2/defines/TextureWrapping";
import { IImageInfo } from "@/LF2/ditto/image/IImageInfo";
import { err_pic_info, texture_loader } from "@/DittoImpl/ImageMgr";
import { IPicture } from "@/LF2/defines";

export function create_picture(
  img_info: IImageInfo,
  pic_info: IPicture = err_pic_info(img_info.key),
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
  const texture = texture_loader.load(url, onLoad ? () => onLoad(pic_info) : void 0, onProgress, onError);
  texture.colorSpace = T.SRGBColorSpace;
  texture.minFilter = min_filter;
  texture.magFilter = mag_filter;
  texture.wrapS = wrap_s;
  texture.wrapT = wrap_t;
  pic_info.w = w / scale;
  pic_info.h = h / scale;
  pic_info.texture = texture;
  return pic_info;
}
export function p_create_picture(
  img_info: IImageInfo,
  pic_info: IPicture = err_pic_info(img_info.key),
  onProgress?: (event: ProgressEvent) => void
): Promise<IPicture> {
  return new Promise((resolve, reject) => {
    create_picture(img_info, pic_info, resolve, onProgress, reject)
  })
}
