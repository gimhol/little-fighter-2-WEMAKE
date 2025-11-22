import { IPicture } from "../defines";
import { MagnificationTextureFilter } from "../defines/MagnificationTextureFilter";
import { MinificationTextureFilter } from "../defines/MinificationTextureFilter";
import { TextureWrapping } from "../defines/TextureWrapping";
import { IImageInfo } from "./IImageInfo";

export class ImageInfo implements IImageInfo {
  key: string = '';
  url: string = '';
  src_url: string = '';
  scale: number = 0;
  w: number = 0;
  h: number = 0;
  min_filter?: MinificationTextureFilter;
  mag_filter?: MagnificationTextureFilter;
  wrap_s?: TextureWrapping;
  wrap_t?: TextureWrapping;
  pic?: IPicture;
  constructor(o?: Partial<IImageInfo>) {
    if (o) Object.assign(this, o)
  }
  merge(o: Partial<IImageInfo>): this {
    Object.assign(this, o)
    return this
  }
}
