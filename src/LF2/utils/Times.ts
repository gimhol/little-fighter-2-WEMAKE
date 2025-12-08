import { min, floor, max } from "./math/base";

export class Times {
  value: number = 0;
  min: number = 0;
  max: number = 0;
  private _loop: number = -1;

  constructor(_min: number = 0, _max: number = Number.MAX_SAFE_INTEGER) {
    this.min = min(floor(_min), floor(_max));
    this.max = max(floor(_min), floor(_max));
    this.value = this.min;
  }
  loop(value: number = -1): this {
    this._loop = value;
    return this;
  }
  reset(): this {
    this.value = this.min;
    return this;
  }
  end(): boolean {
    return this.value === this.max;
  }
  add(): boolean {
    if (this.max === this.min) {
      this.value = this.min;
      return true
    }
    if (this.value < this.max) {
      this.value++;
      return this.value === this.max
    };
    if (this._loop == 0)
      return false
    if (this._loop > 0) this._loop--;
    this.value = this.min
    return false;
  }
  sub(): boolean {
    if (this.max === this.min) {
      this.value = this.min;
      return true
    }
    if (this.value > this.min) {
      this.value--;
      return this.value === this.min
    };
    if (this._loop == 0)
      return false
    if (this._loop > 0) this._loop--;
    this.value = this.max
    return false;
  }
}
