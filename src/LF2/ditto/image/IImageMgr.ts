import type { ILegacyPictureInfo } from "../../defines/ILegacyPictureInfo";
import type { IStyle } from "../../defines/IStyle";
import type { IImageOp_Crop } from "./IImageOp_Crop";
import type { IImageOp_Flip } from "./IImageOp_Flip";
import type { IImageOp_Resize } from "./IImageOp_Resize";
import type { ImageInfo } from "./ImageInfo";
import type { TextInfo } from "./TextInfo";
export type ImageOperation = IImageOp_Crop | IImageOp_Resize | IImageOp_Flip;

export interface IImageMgr {
  find(key: string): ImageInfo | undefined;
  del(key: string): void;
  load_text(text: string, style?: IStyle): Promise<TextInfo>;
  load_img(key: string, src: string, operations?: ImageOperation[]): Promise<ImageInfo>;
  load_by_pic_info(f: ILegacyPictureInfo): Promise<ImageInfo>;
  find_by_pic_info(f: ILegacyPictureInfo): ImageInfo | undefined;
}
