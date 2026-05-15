import type { IBgLayerInfo } from "../defines/IBgLayerInfo";
import type { Background } from "./Background";
export class Layer {
  readonly bg: Background;
  readonly info: IBgLayerInfo;
  is_static(): boolean {
    const { info: { c1, c2, cc, offsetAnimX, offsetAnimY, absolute } } = this;
    return (cc === void 0 || c1 === void 0 || c2 === void 0) &&
      !offsetAnimX &&
      !offsetAnimY &&
      !!absolute
  }
  visible = false;
  constructor(bg: Background, info: IBgLayerInfo) {
    this.bg = bg;
    this.info = info;
  }
  update(count: number) {
    const { info: { c1, c2, cc } } = this;
    if (cc !== void 0 && c1 !== void 0 && c2 !== void 0) {
      const now = count % cc;
      this.visible = now >= c1 && now <= c2;
    } else {
      this.visible = true;
    }
  }
  dispose() {
  }
}
