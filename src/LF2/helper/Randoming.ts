import { LF2 } from "../LF2";
import { MersenneTwister } from "../utils/math/MersenneTwister";

export class Randoming<T> {
  static mt = new MersenneTwister(Date.now())
  protected lf2: LF2 | null;
  protected _src: Readonly<T[]>;
  protected cur: T[]
  protected taken: T | null = null;
  protected duplicate: boolean;
  get src() { return this._src }
  constructor(src: T[], lf2: LF2 | null, duplicate: boolean = false) {
    this.lf2 = lf2;
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
    return this.taken;
  }
  protected random_get<T>(a: T | T[] | undefined): T | undefined {
    if (!a || !Array.isArray(a)) return a
    return a[this.random_in(0, a.length)]
  }
  protected random_take<T>(a: T | T[] | undefined): T | undefined {
    if (!a || !Array.isArray(a)) return a
    return a.splice(this.random_in(0, a.length), 1)[0]
  }
  protected random_in(l: number, r: number) {
    if (this.lf2) return this.lf2.mt.range(l, r)
    return Randoming.mt.range(l, r);
  }
}
