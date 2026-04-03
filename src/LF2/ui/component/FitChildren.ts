import { max, min } from "../../utils";
import { UIComponent } from "./UIComponent";

export class FitChildren extends UIComponent {
  static override readonly TAG: string = 'FitChildren';
  override on_resume(): void {
    this.apply()
  }
  override update(dt: number): void {
    this.apply()
  }
  apply() {
    const { children } = this.node
    let min_left: number = 0;
    let min_top: number = 0;
    let max_right: number = 0;
    let max_bottom: number = 0;
    for (const child of children) {
      if (!child.visible) continue;
      const { left, right, top, bottom } = child.rect
      min_left = min(left, min_left)
      max_right = max(right, max_right)
      min_top = min(top, min_top)
      max_bottom = max(bottom, max_bottom)
    }
    const w = max_right - min_left
    const h = max_bottom - min_top
    const [, , cz] = this.node.center.value
    this.node.resize(w, h)
    this.node.center.value = [w ? -min_left / w : 0, h ? -min_top / h : 0, cz]
  }
}
