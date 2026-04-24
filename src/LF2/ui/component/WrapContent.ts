import { IPropsMeta } from "@/LF2";
import { max, min } from "../../utils/math";
import type { IUICompnentCallbacks } from "./IUICompnentCallbacks";
import { UIComponent } from "./UIComponent";

export interface IWrapContentProps {
  wrapWidth?: boolean;
  wrapHeight?: boolean;
}
export class WrapContent<P extends IWrapContentProps, C extends IUICompnentCallbacks> extends UIComponent<P, C> {
  static override readonly TAGS: string[] = ["WrapContent"];
  static override readonly PROPS: IPropsMeta<IWrapContentProps> = {
    wrapHeight: { type: Boolean, nullable: true },
    wrapWidth: { type: Boolean, nullable: true },
  }
  override on_resume(): void { this.apply(); }
  override update(dt: number): void { this.apply(); }
  apply() {
    const { wrapHeight, wrapWidth } = this.props
    const { children } = this.node;
    let min_left: number = 0;
    let min_top: number = 0;
    let max_right: number = 0;
    let max_bottom: number = 0;
    for (const child of children) {
      if (!child.visible) continue;
      const { left, right, top, bottom } = child.rect;
      min_left = min(left, min_left);
      max_right = max(right, max_right);
      min_top = min(top, min_top);
      max_bottom = max(bottom, max_bottom);
    }
    const w = max_right - min_left;
    const h = max_bottom - min_top;
    const cx = w ? -min_left / w : 0;
    const cy = h ? -min_top / h : 0;
    this.node.resize(w, h)
    this.node.set_center(cx, cy);
  }
}
