import type { IEntityData, IFrameInfo, IFramePictureInfo } from "../defines";
import type { LF2 } from "../LF2";
import { preprocess_pic } from "./preprocess_pic";

export function preprocess_frame_pic(lf2: LF2, data: IEntityData, frame: IFrameInfo): IFramePictureInfo | undefined {
  const { pic } = frame;
  if (!pic) return pic;
  return preprocess_pic(lf2, data, pic)
}

preprocess_frame_pic.TAG = "preprocess_frame_pic"