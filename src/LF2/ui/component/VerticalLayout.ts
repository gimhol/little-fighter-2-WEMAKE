import { max } from "../../utils/math/base";
import { UIComponent } from "./UIComponent";

export class VerticalLayout extends UIComponent {
  static override readonly TAG = 'VerticalLayout'
  get gap() {
    return this.num(0) || 0
  }
  override update(dt: number): void {
    let max_w = 0;
    let max_h = 0;

    const [cx, cy] = this.node.center.value;
    const pos_list: [number, number, number][] = []
    for (const item of this.node.children) {
      if (!item.visible) continue;
      const { w, h, z } = item
      const [cx, cy] = item.center.value
      pos_list.unshift([(1 - cx) * w, max_h + (1 - cy) * h, z] as const)
      max_h += item.h + this.gap;
      max_w = max(max_w, item.w);
    }

    for (const item of this.node.children) {
      if (!item.visible) continue;
      const { h } = item
      const [x, y, z] = pos_list.pop()!
      const yy = y - cy * max_h - h
      const xx = cx * max_w - x
      item.move(xx, yy, z);
    }
    this.node.resize(max_w, max_h);
  }
}


