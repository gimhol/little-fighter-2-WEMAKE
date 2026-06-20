import { clamp, floor } from "../utils";

export class Loop {
  protected _times: number = 1;
  protected _count: number = 0;

  get count(): number { return this._count; }
  set count(v: number) { this.set_count(v) }
  set_count(v: number): this {
    this._count = clamp(floor(v), 0, this.times)
    return this
  }

  get times(): number { return this._times; }
  set times(v: number) { this.set_times(v) }
  set_times(v: number): this {
    this._times = clamp(floor(v), 0, Number.MAX_SAFE_INTEGER)
    return this
  }

  set(count: number, times: number): this {
    this.times = times;
    this.count = count;
    return this;
  }

  reset(): this {
    this.count = 0;
    return this;
  }

  continue(): boolean {
    if (this.times <= 0) return true;
    if (this.count >= this.times) return false
    ++this.count;
    return true
  }
  
  done(): boolean {
    return this.times > 0 && this.count >= this.times;
  }
}
