import { ImageInfo } from "@/LF2/ditto/image/ImageInfo";
import * as T from "./_t";

export class RImageInfo extends ImageInfo<T.Texture> {
  constructor(o: Partial<RImageInfo>) {
    super(o);
    if (this.pic?.texture)
      this.pic.texture = this.pic.texture.clone();
  }
  override merge(o: Partial<RImageInfo>): this {
    super.merge(o);
    if (this.pic?.texture)
      this.pic.texture = this.pic.texture.clone();
    return this;
  }
  override clone(): RImageInfo {
    return new RImageInfo(this);
  }
}
