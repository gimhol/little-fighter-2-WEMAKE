import { max } from "../../utils";
import { UIComponent } from "./UIComponent";

export class HorizontalLayout extends UIComponent {
  static override readonly TAG = 'HorizontalLayout'
  override update(dt: number): void {
    let w = 0;
    let h = 0;
    for (const l of this.node.children) {
      if (!l.visible) continue;
      const { y, z } = l
      l.move_to(w, y, z);
      w += l.w;
      h = max(h, l.h);
    }
    this.node.resize(w, h);
    const p = this.node.parent;
    if (p) {
      this.node.move_to((p.w - w) / 2, (p.h - h) / 2);
    }
  }
}
