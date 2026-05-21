import { abs, float_equal } from "@/LF2/utils";

export class SmoothNumber {
  private _v: number = 0;
  private _t: number = 0;
  private _c: (self: this) => void = () => { };
  private factor = 0.3;
  private min_diff = 1;
  private done: boolean = false;

  get value(): number { return this._v; }
  set value(v: number) { this._v = this._t = v; this.done = true; }
  get target(): number { return this._t }
  set target(v: number) { this._t = v; this.done = false; }

  handler(v: (self: this) => void) {
    this._c = v;
    return this;
  }
  handle() { this._c(this); }

  update() {
    if (this.done) return;

    if (float_equal(this._t, this._v)) {
      this.done = true;
      this._c(this);
      return;
    }

    this._v = this._v + this.factor * (this._t - this._v);
    if (abs(this._v - this._t) < this.min_diff) {
      this.done = true;
      this._v = this._t;
    }
    this._c(this);
  }
}
