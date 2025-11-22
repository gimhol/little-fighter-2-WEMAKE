import { ILegacyPictureInfo } from "../defines/ILegacyPictureInfo";
import { IPictureInfo } from "../defines/IPictureInfo";
import type { IStyle } from "../defines/IStyle";
import { ImageInfo } from "../loader/ImageInfo";
import { TextInfo } from "../loader/TextInfo";
import { IImageOp_Crop } from "../loader/IImageOp_Crop";
import { IImageOp_Flip } from "../loader/IImageOp_Flip";
import { IImageOp_Resize } from "../loader/IImageOp_Resize";
export type ImageOperation = IImageOp_Crop | IImageOp_Resize | IImageOp_Flip;

export interface IImageMgr {
  find(key: string): ImageInfo | undefined;
  del(key: string): void;
  load_text(text: string, style?: IStyle): Promise<TextInfo>;
  load_img(key: string, src: string, operations?: ImageOperation[]): Promise<ImageInfo>;
  load_by_pic_info(f: ILegacyPictureInfo | IPictureInfo): Promise<ImageInfo>;
  find_by_pic_info(f: IPictureInfo | ILegacyPictureInfo): ImageInfo | undefined;
}
