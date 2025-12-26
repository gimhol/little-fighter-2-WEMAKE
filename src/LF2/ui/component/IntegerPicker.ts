import { GameKey } from "@/LF2/defines";
import { ceil, clamp, floor, max, min, round } from "@/LF2/utils";
import { IUIKeyEvent } from "../IUIKeyEvent";
import { IUIPointerEvent } from "../IUIPointerEvent";
import { UITextLoader } from "../UITextLoader";
import { IUICompnentCallbacks } from "./IUICompnentCallbacks";
import { UIComponent } from "./UIComponent";
const { MIN_SAFE_INTEGER: MIN, MAX_SAFE_INTEGER: MAX } = Number;

export interface IIntegerPickerCallbacks extends IUICompnentCallbacks {
  on_min_changed?(curr: number, prev: number, self: IntegerPicker): void
  on_max_changed?(curr: number, prev: number, self: IntegerPicker): void
  on_val_changed?(curr: number, prev: number, self: IntegerPicker): void
}
export class IntegerPicker extends UIComponent<IIntegerPickerCallbacks> {
  static override readonly TAG: string = 'IntegerPicker';
  protected _min: number = MIN;
  protected _max: number = MAX;
  protected _val: number = this._min;
  protected _txt = new UITextLoader(() => this.node)
    .set_style(() => this.node.txts.value[0]?.style ?? {})
    .ignore_out_of_date();
  protected _triggers: Set<String> = new Set();
  get val(): number { return this._val }
  set val(v: number) { this.set_val(v) }
  get min(): number { return this._min }
  set min(v: number) { this.set_min(v) }
  get max(): number { return this._max }
  set max(v: number) { this.set_max(v) }

  override init(): void {
    const v1 = this.props.num('min') ?? MIN;
    const v2 = this.props.num('max') ?? MAX;
    const v3 = this.props.num('val')
    this.set_min(min(v1, v2));
    this.set_max(max(v1, v2));
    this.set_val(v3 ?? this.min);
    (this.props.strs('triggers') ?? ['click']).forEach(v => this._triggers.add(v))
  }
  override on_click(e: IUIPointerEvent): void {
    if (!this._triggers.has('click')) return
    switch (e.button) {
      case 0: this.goto_next(); break;
      case 2: this.goto_prev(); break;
    }
  }
  override on_key_down(e: IUIKeyEvent): void {
    const focused = this._triggers.has('no-focused')
    if (!this.node.focused && !focused) return;
    const need_aj = this._triggers.has('aj')
    const need_ud = this._triggers.has('ud')
    const need_lr = this._triggers.has('lr')
    switch (e.game_key) {
      case GameKey.j: if (need_aj) return this.goto_prev(); break;
      case GameKey.a: if (need_aj) return this.goto_next(); break;
      case GameKey.U: if (need_ud) return this.goto_prev(); break;
      case GameKey.D: if (need_ud) return this.goto_next(); break;
      case GameKey.L: if (need_lr) return this.goto_prev(); break;
      case GameKey.R: if (need_lr) return this.goto_next(); break;
    }
  }
  goto_next(): void {
    const val = this._val >= this._max ? this._min : this._val + 1
    this.set_val(val);
  }
  goto_prev(): void {
    const val = this._val <= this._min ? this._max : this._val - 1
    this.set_val(val);
  }
  set_min(v: number): void {
    if (v > this._max) return this.set_max(v);
    else if (Number.isNaN(v)) v = MIN
    else v = max(ceil(v), MIN);
    const p = this._min; if (p === v) return;
    this.callbacks.emit('on_min_changed')(this._min = v, p, this)
    this.set_val(this._val)
  }

  set_max(v: number): void {
    if (v < this._min) return this.set_min(v);
    else if (Number.isNaN(v)) v = MIN
    else v = min(floor(v), MAX);
    const p = this._max; if (p === v) return;
    this.callbacks.emit('on_max_changed')(this._max = v, p, this)
    this.set_val(this._val)
  }

  set_val(v: number): void {
    if (Number.isNaN(v)) v = this._min
    else v = clamp(round(v), this._min, this._max)
    const p = this._val; if (p === v) return;
    this.callbacks.emit('on_val_changed')(this._val = v, p, this)
    this._txt.set_text(['' + v])
  }
}
