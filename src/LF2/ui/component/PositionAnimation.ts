import { IVector3 } from "@/LF2";
import { Animation, Delay, Easing, Sequence } from "../../animation";
import ease_linearity from "../../utils/ease_method/ease_linearity";
import { UIComponent } from "./UIComponent";
import ease_in_out_sine from "@/LF2/utils/ease_method/ease_in_out_sine";


export class PositionAnimation extends UIComponent {
  static override readonly TAGS: string[] = ["PositionAnimation"];
  protected seq_anim: Sequence = new Sequence();
  protected values = new Map<any, [IVector3, IVector3]>()
  start(v?: boolean) {
    this.enabled = true;
    this.seq_anim.start(v)
  }
  get is_end() {
    return this.seq_anim.done
  }

  override on_start(): void {
    super.on_start?.();
    const len = this.args.length;
    const anims: Animation[] = [];
    for (let i = 0; i < len - 2; i += 2) {
      const value = this.vec3(i + 2) || this.node.pos;
      const duration = this.num(i + 3) || 0;
      const prev_value = i == 0 ? value : (this.vec3(i) || value);
      const a = value.equals(prev_value) ?
        new Delay(0)
          .set_duration(duration) :
        new Easing(0, 1)
          .set_duration(duration)
          .set_ease_method(ease_in_out_sine)

      this.values.set(a, [prev_value, value.clone().sub(prev_value)])
      anims.push(a)
    }
    this.seq_anim = new Sequence(...anims).set_fill_mode(1)
    const is_play = this.bool(0) ?? true;
    const is_reverse = this.bool(1) ?? false;
    if (is_play) this.seq_anim.start(is_reverse)
    else this.seq_anim.end(is_reverse)
  }

  override update(dt: number): void {
    super.update?.(dt);
    if (!this.seq_anim.done) {
      this.seq_anim.update(dt);
      const pair = this.values.get(this.seq_anim.curr_anim)
      if (!pair) return;
      const { value } = this.seq_anim
      const [a, b] = pair;
      const x = a.x + b.x * value
      const y = a.y + b.y * value
      const z = a.z + b.z * value
      this.node.move_to(x, y, z)
    } else {
      this.set_enabled(false)
    }
  }
}