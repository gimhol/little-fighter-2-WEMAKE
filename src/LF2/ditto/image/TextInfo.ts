import type { IStyle } from "../../defines/IStyle";
import { ImageInfo } from "./ImageInfo";
import type { ITextInfo } from "./ITextInfo";

export class TextInfo<T = any> extends ImageInfo<T> implements ITextInfo {
  style: IStyle = {};
  text: string = '';
  override merge(o: Partial<TextInfo> = {}): this {
    Object.assign(this, o)
    return this;
  }
}
