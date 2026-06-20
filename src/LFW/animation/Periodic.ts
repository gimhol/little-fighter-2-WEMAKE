import { is_num } from "../utils";
import { Animation } from "./Animation";

export abstract class Periodic extends Animation {
  offset: number = 0;
  protected _b: number = 0;
  protected _h: number = 1;
  protected _s: number = 1;
  set_offset(v: number): this {
    this.offset = v;
    return this
  }
  set_scale(v: number): this {
    this.scale = v;
    return this
  }
  get bottom(): number { return this._b; }
  set bottom(v: number) { if (is_num(v)) { this._b = v; } }
  get height(): number { return this._h; }
  set height(v: number) { if (is_num(v)) { this._h = v; } }
  get scale(): number { return this._s; }
  set scale(v: number) { if (is_num(v)) { this._s = v; } }
  abstract method(v: number): number;

  constructor(bottom: number = 0, height: number = 1, scale: number = 1) {
    super();
    this.duration = Number.MAX_SAFE_INTEGER;
    if (is_num(bottom)) this._b = bottom;
    if (is_num(height)) this._h = height;
    if (is_num(scale)) this._s = scale;
  }
  set(bottom: number, height: number, scale: number): this {
    if (is_num(bottom)) this._b = bottom;
    if (is_num(height)) this._h = height;
    if (is_num(scale)) this._s = scale;
    this.calc();
    return this;
  }
  override calc(): this {
    this.value = this.method(this.offset + this.time * this._s);
    return this;
  }
}
