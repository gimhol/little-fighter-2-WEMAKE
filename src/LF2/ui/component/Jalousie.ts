import { Easing, Sequence } from "../../animation";
import { Animation } from "../../animation/Animation";
import { Sine } from "../../animation/Sine";
import { Ditto } from "../../ditto";
import { IUIPointerEvent } from "../IUIPointerEvent";
import { Flex } from "./Flex";
import { IUICompnentCallbacks } from "./IUICompnentCallbacks";
export interface IJalousieCallbacks extends IUICompnentCallbacks {
  on_anim_end?(v: Jalousie): void;
}
export class Jalousie extends Flex<IJalousieCallbacks> {
  static override readonly TAG = 'Jalousie'
  protected _anim: Animation = new Sequence(
    new Easing(0, 0).set_duration(250),
    new Sine(-1, 2, 0.5).set_duration(250),
    new Easing(1, 1).set_duration(250),
  )
  get anim(): Animation { return this._anim }
  get click_test(): boolean { return this.props.bool('click_test') === true; }

  override on_start() {
    super.on_start?.();
    const open = this.props.bool('open') ?? this.bool(1);
    const end = this.props.bool('end') ?? this.bool(2);
    if (end) this._anim.end(open)
    else this._anim.start(open)
  }
  get open(): boolean { return this._anim.reverse; }
  set open(v: boolean) { this._anim.start(v); }
  get w(): number { return this.node.root.size.value[0] }
  get h(): number { return this.node.root.size.value[1] }

  override on_click(e: IUIPointerEvent): void {
    super.on_click?.(e)
    if (this.click_test) {
      this.open = !this.open;
      Ditto.debug(`[${Jalousie.TAG}]open=${this.open}`)
    }
  }
  override on_stop(): void {
    super.on_stop?.()
    this.callbacks.clear();
  }

  override update(dt: number): void {
    super.update(dt);
    if (this._anim.done) return;
    this._anim.update(dt);
    this.update_children();

    if (this._anim.done)
      this.callbacks.emit('on_anim_end')(this);
  }

  override on_show(): void {
    super.on_show?.()
    this._anim.calc();
    this.update_children();
  }

  protected update_children() {
    const { value } = this._anim;
    const { children } = this.node;
    const len = children.length;
    for (let i = 0; i < len; i++) {
      const child = children[i];
      if (!child) continue;
      if (this.direction === 'column') {
        child.scale.value = [1, value, 1];
      } else {
        child.scale.value = [value, 1, 1];
      }
    }
  }
}
