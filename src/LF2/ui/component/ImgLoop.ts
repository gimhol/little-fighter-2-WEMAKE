import { Easing } from "../../animation";
import ease_linearity from "../../utils/ease_method/ease_linearity";
import { floor } from "../../utils/math/base";
import { UIComponent } from "./UIComponent";

export class ImgLoop extends UIComponent {
  static override readonly TAGS: string[] = ["ImgLoop"];
  readonly anim = new Easing(0, 1).set_duration(1000)
    .set_ease_method(ease_linearity)
    .set_times(0)
    .set_fill_mode(1)
  override on_start(): void {
    const val_1 = this.num(0) || 0;
    const val_2 = this.num(1) || this.node.data.img.length;
    const duration = this.num(2) || this.anim.duration;
    this.anim.set(val_1, val_2,).set_duration(duration)
  }
  stop(): void {
    this.anim.set_times(1).set_count(0)
  }
  start(): void {
    if (!this.enabled) this.enabled = true;
    this.anim.set_times(0).set_count(0)
  }
  override update(dt: number): void {
    if (!this.node.data.img.length) {
      this.enabled = false;
      return;
    }
    this.anim.update(dt);
    const idx = floor(this.anim.value);
    this.node.img_idx.value = idx;
    if (this.anim.done) this.enabled = false;
  }
}