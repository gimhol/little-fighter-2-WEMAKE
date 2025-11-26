import { Easing } from "@/LF2/animation";
import { UIComponent } from "./UIComponent";

export class ScaleHover extends UIComponent {
  static override readonly TAG = 'ScaleHover';
  protected anim = new Easing(1, 1.1).set_duration(150);
  private _p: number | null = null;

  override on_start(): void {
    super.on_start?.();

    const normal_scale = this.num(0) ?? this.anim.val_1;
    const hover_scale = this.num(1) ?? this.anim.val_2;
    const duration = this.num(2) ?? this.anim.duration
    this.anim.set(normal_scale, hover_scale)
      .set_duration(duration)
      .set_reverse(false);
    this._p = this.num(3);
  }

  override update(dt: number): void {
    const n = this._p ? this.node.parent! : this.node;
    const r = (n.pointer_on_me !== 1 && !n.focused) || !!n.pointer_down;
    const { value } = this.anim.auto_trip(r, dt)
    this.node.scale.value = [value, value, value];
  }
}
