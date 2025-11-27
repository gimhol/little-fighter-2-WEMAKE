import { ICrossInfo } from "./ICrossInfo";

export class CrossInfo implements ICrossInfo {
  left: number = 0;
  top: number = 0;
  right: number = 0;
  bottom: number = 0;
  mid_x: number = 0;
  mid_y: number = 0;
  constructor(o: Partial<ICrossInfo> = {}) {
    this.set(o);
  }
  set(o: Partial<ICrossInfo>) {
    if ('number' === typeof o.left) this.left = o.left;
    if ('number' === typeof o.top) this.top = o.top;
    if ('number' === typeof o.right) this.right = o.right;
    if ('number' === typeof o.bottom) this.bottom = o.bottom;
    if ('number' === typeof o.mid_x) this.mid_x = o.mid_x;
    if ('number' === typeof o.mid_y) this.mid_y = o.mid_y;
  }
  compare(o: ICrossInfo): boolean {
    return (
      this.left != o.left ||
      this.top != o.top ||
      this.right != o.right ||
      this.bottom != o.bottom ||
      this.mid_x != o.mid_x ||
      this.mid_y != o.mid_y
    );
  }
  clone() {
    return new CrossInfo(this);
  }
}
