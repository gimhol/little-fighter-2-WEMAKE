import type { IStyle } from "../../defines/IStyle";
import { ImageInfo } from "./ImageInfo";
import type { ITextInfo } from "./ITextInfo";

export class TextInfo<T = any> extends ImageInfo<T> implements ITextInfo {
  style: IStyle = {};
  text: string = '';
  constructor(o?: Partial<TextInfo>) {
    super(o);
    if (o) Object.assign(this, o);
  }
  override merge(o: Partial<TextInfo> = {}): this {
    super.merge(o);
    Object.assign(this, o);
    return this;
  }
}
