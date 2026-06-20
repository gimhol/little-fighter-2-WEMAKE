import { Defines, type IBgData } from "../defines";
import type { LFW } from "../LFW";
import { is_non_blank_str } from "../utils/type_check/is_str";
import type { ImageInfo } from "../ditto/image/ImageInfo";

export function preprocess_bg_data(lfw: LFW, data: IBgData, jobs: Promise<ImageInfo>[]): IBgData {
  const { layers, base: { shadow } } = data;
  data.base.height = data.base.height ?? Defines.MODERN_SCREEN_HEIGHT;
  is_non_blank_str(shadow) && jobs.push(lfw.images.load_img(shadow, shadow));
  for (const { file } of layers)
    is_non_blank_str(file) && jobs.push(lfw.images.load_img(file, file));
  return data
}
preprocess_bg_data.TAG = "preprocess_bg_data"