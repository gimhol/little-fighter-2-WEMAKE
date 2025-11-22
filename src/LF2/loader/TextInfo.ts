import { type IStyle } from "../defines/IStyle";
import { ImageInfo } from "./ImageInfo";
import { type ITextInfo } from "./ITextInfo";

export class TextInfo extends ImageInfo implements ITextInfo {
  style: IStyle = {};
  text: string = '';
  override merge(o: ITextInfo): this {
    Object.assign(this, o)
    return this;
  }
}
