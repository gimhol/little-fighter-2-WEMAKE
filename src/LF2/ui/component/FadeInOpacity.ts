import { Easing } from "../../animation";
import { UIComponent } from "./UIComponent";

export class FadeInOpacity extends UIComponent {
  static override readonly TAGS: string[] = ["FadeInOpacity"];
  protected anim: Easing = new Easing(0, 1).set_duration(1000);
  override on_start(): void {
    super.on_start?.();
    this.anim
      .set_duration(this.num(0) ?? 0)
      .set_val_1(this.node.opacity);
  }
  override update(dt: number): void {
    super.update?.(dt);
    this.anim.update(dt);
    this.node.opacity = this.anim.value;
  }
}


