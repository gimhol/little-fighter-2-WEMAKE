import { Delay, Easing, Sequence } from "../../animation";
import { Unsafe } from "../../utils";
import { UIComponent } from "./UIComponent";
import { UIComponentExpressionBuilder } from "./UIComponentExpressionBuilder";
export class FadeOutOpacity extends UIComponent {
  static override readonly TAGS: string[] = ["FadeOutOpacity"];
  static expression(duration: Unsafe<number> = 1000, delay: Unsafe<number> = 0) {
    return new UIComponentExpressionBuilder(this, duration ?? '', delay ?? '')
  }
  protected anim: Sequence = new Sequence();
  start(reverse?: boolean) {
    this.enabled = true;
    this.anim.start(reverse)
  }
  override on_start(): void {
    super.on_start?.();
    this.anim = new Sequence(
      new Delay(this.node.opacity)
        .set_duration(this.num(1) ?? 0),
      new Easing(this.node.opacity, 0)
        .set_duration(this.num(0) ?? 1000)
        .set_val_1(this.node.opacity)
        .set_val_2(0)
    )
  }
  override update(dt: number): void {
    super.update?.(dt);
    this.anim.update(dt);
    this.node.opacity = this.anim.value;
    this.debug('update', `opacity = ${this.anim.value}`)
    if (this.anim.done) this.enabled = false;
  }
}
