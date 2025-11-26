import { Easing } from "@/LF2/animation";
import { UIComponent } from "./UIComponent";

export class ScaleHover extends UIComponent {
  static override readonly TAG = 'ScaleHover';
  protected anim = new Easing(1, 1.1).set_duration(150);
  private _p: number | null = null;

  override on_start(): void {
    super.on_start?.();
    this.anim.set(
      this.num(0) ?? 0,
      this.num(1) ?? 1
    ).set_duration(
      this.num(2) ?? 255
    ).set_reverse(false);
    this._p = this.num(3);
  }

  override update(dt: number): void {
    const n = this._p ? this.node.parent! : this.node;
    const r = (n.pointer_on_me !== 1 && !n.focused) || !!n.pointer_down;
    if (this.anim.reverse !== r) {
      if (this.anim.done) {
        this.anim.start(r);
      } else {
        this.anim.reverse = r;
      }
    }
    const { value } = this.anim.update(dt)
    this.node.scale.value = [value, value, value];
  }
}
