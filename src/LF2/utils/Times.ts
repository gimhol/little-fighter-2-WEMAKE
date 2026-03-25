import { floor, max, min } from "./math/base";

export class Times {
  static MIN: number = 0
  static MAX: number = Number.MAX_SAFE_INTEGER
  static LIFES: number = Number.MAX_SAFE_INTEGER
  private _value: number = Times.MIN;
  private _min: number = Times.MIN;
  private _max: number = Times.MAX;
  private _lifes: number = Times.LIFES;
  private _remains: number = Times.LIFES;
  get value(): number { return this._value }
  get min(): number { return this._min }
  get max(): number { return this._max }
  set min(v: number) { this._min = floor(Number(v)) }
  set max(v: number) { this._max = floor(Number(v)) }
  get lifes(): number { return this.lifes }
  get remains(): number { return this._remains }
  get is_max(): boolean { return this._value >= this._max; }
  get is_min(): boolean { return this._value <= this._min; }
  constructor(_min: number = this.min, _max: number = this.max) {
    this.set_range(_min, _max)
  }
  reborn(): this {
    this._max = Times.MAX;
    this._value = this._min = Times.MIN;
    this._lifes = this._remains = Times.LIFES;
    return this
  }
  set_range(_min: number, _max: number): this {
    const a = floor(Number(_min));
    const b = floor(Number(_max))
    this._min = min(a, b);
    this._max = max(a, b);
    this._value = a;
    return this;
  }
  set_lifes(value: number = -1): this {
    this._lifes = floor(value);
    this._remains = this._lifes;
    return this;
  }
  reset(): this {
    this._value = this._min;
    this._remains = this._lifes;
    return this;
  }
  add(d: number = 1): boolean {
    if (this._remains == 0) return false;
    const v = this._value += (Number(d) || 0);
    const ret = v >= this._max;
    if (ret && this._remains > 0) --this._remains;
    if (v > this._max) this._value = this._min;
    if (v < this._min) this._value = this._max;
    return ret;
  }
}
