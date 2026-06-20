import { LFW } from "../LFW";
import { MersenneTwister } from "../utils/math/MersenneTwister";

export class Randoming<T> {
  static mt = new MersenneTwister(Date.now())
  protected lfw: LFW | null;
  protected _src: Readonly<T[]>;
  protected cur: T[]
  protected taken: T | null = null;
  protected duplicate: boolean;
  get src() { return this._src }
  constructor(src: T[], lfw: LFW | null, duplicate: boolean = false) {
    this.lfw = lfw;
    this._src = src;
    this.cur = [...src];
    this.duplicate = duplicate;
  }
  set_src(src: Readonly<T[]>) {
    this._src = src;
    return this;
  }
  take(): T {
    if (!this.cur.length) {
      this.cur = this._src.length > 1 ? this._src.filter(v => v != this.taken) : [...this._src];
    }
    if (this.duplicate) {
      this.taken = this.random_get(this.cur)!
    } else {
      this.taken = this.random_take(this.cur)!
    }
    if (this.src.length && this.taken == void 0) debugger;
    return this.taken;
  }
  protected random_get<T>(a: T | T[] | undefined): T | undefined {
    if (!a || !Array.isArray(a)) return a
    return a[this.random_in(0, a.length)]
  }
  protected random_take<T>(a: T | T[] | undefined): T | undefined {
    if (!a || !Array.isArray(a)) return a;
    const idx = this.random_in(0, a.length)
    if (idx < 0 || idx >= a.length) debugger;
    return a.splice(idx, 1)[0]
  }
  protected random_in(l: number, r: number) {
    if (this.lfw) return this.lfw.mt.range(l, r)
    return Randoming.mt.range(l, r);
  }
}
