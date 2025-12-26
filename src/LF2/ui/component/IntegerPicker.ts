import { ceil, clamp, floor, max, min, round } from "@/LF2/utils";
import { IUICompnentCallbacks } from "./IUICompnentCallbacks";
import { UIComponent } from "./UIComponent";
import { IUIKeyEvent } from "../IUIKeyEvent";
import { GameKey } from "@/LF2/defines";
import { UITextLoader } from "../UITextLoader";
import { IUIPointerEvent } from "../IUIPointerEvent";
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

  override on_click(e: IUIPointerEvent): void {
    const val = this._val >= this._max ? this._min : this._val + 1
    this.set_val(val);
  }

  override on_key_down(e: IUIKeyEvent): void {
    if (!this.node.focused) return;
    switch (e.game_key) {
      case GameKey.a: {
        const val = this._val >= this._max ? this._min : this._val + 1
        this.set_val(val);
        break;
      }
      case GameKey.j: {
        const val = this._val <= this._min ? this._max : this._val - 1
        this.set_val(val);
        break;
      }
    }
  }
  
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
