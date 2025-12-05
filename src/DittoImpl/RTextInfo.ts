import { TextInfo } from "@/LF2/ditto/image/TextInfo";
import * as T from "./_t";
import { RImageInfo } from "./RImageInfo";

export class RTextInfo extends TextInfo<T.Texture> {

  constructor(o: Partial<RTextInfo> = {}) {
    super(o);
    if (this.pic?.texture)
      this.pic.texture = this.pic.texture.clone();
  }
  override merge(o: Partial<RTextInfo>): this {
    super.merge(o);
    if (this.pic?.texture)
      this.pic.texture = this.pic.texture.clone();
    return this;
  }
  override clone(): RImageInfo {
    return new RImageInfo(this);
  }
}
