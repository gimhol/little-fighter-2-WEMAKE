import { Animation, Delay, Easing, Sequence } from "../../animation";
import ease_linearity from "../../utils/ease_method/ease_linearity";
import { UIComponent } from "./UIComponent";

export class OpacityAnimation extends UIComponent {

  static override readonly TAGS: string[] = ["OpacityAnimation"];
  protected _anim: Sequence = new Sequence();
  get loop() { return this._anim.loop }
  get done() { return this._anim.done }
  get anim(): Sequence { return this._anim; }
  start(r?: boolean) {
    this.anim.start(r)
    this.node.opacity = this._anim.value;
    this.enabled = true
  }
  stop(r?: boolean) {
    this.anim.end(r)
    this.node.opacity = this._anim.value;
    this.enabled = false
  }
  override on_start(): void {
    super.on_start?.();
    const len = this.args.length;
    const anims: Animation[] = [];
    for (let i = 0; i < len - 2; i += 2) {
      const opacity = this.num(2 + i) || 0;
      const duration = this.num(2 + i + 1) || 0;
      const prev_opacity = this.num(2 + i - 2) ?? opacity;
      anims.push(
        prev_opacity === opacity ?
          new Delay(opacity)
            .set_duration(duration) :
          new Easing(prev_opacity, opacity)
            .set_duration(duration)
            .set_ease_method(ease_linearity)
      )
    }
    this._anim = new Sequence(...anims).set_fill_mode(1)
    const is_play = this.bool(0) ?? true;
    const is_reverse = this.bool(1) ?? false;
    if (is_play) this._anim.start(is_reverse)
    else this._anim.end(is_reverse)
  }

  override update(dt: number): void {
    super.update?.(dt);
    if (!this._anim.done) this.node.opacity = this._anim.update(dt).value;
    if (this._anim.done) this.set_enabled(false)
    if (this._anim.done) return;
  }
}
