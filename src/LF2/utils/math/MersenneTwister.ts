import { floor } from "./base";

const _n: number = 624;
const _m: number = 397;
export class MersenneTwister {
  private _matrix: number = 0x9908B0DF;
  private _upper_mask: number = 0x80000000;
  private _lower_mask: number = 0x7FFFFFFF;
  private _mt: number[] = new Array(_n);
  private _index: number = _n + 1;
  private _times: number = 0;
  private _debug: boolean = false
  readonly cases: string[] = []
  get times() { return this._times }
  get debug() { return this._debug }
  constructor(seed: number = Date.now()) {
    this.reset(seed)
  }

  reset(seed: number, debug: boolean = this._debug): this {
    this.cases.length = 0;
    this._debug = debug;
    this._matrix = 0x9908B0DF;
    this._upper_mask = 0x80000000;
    this._lower_mask = 0x7FFFFFFF;
    this._mt = new Array(_n);
    this._index = _n + 1;
    this._mt[0] = seed >>> 0;
    for (let i = 1; i < _n; i++) {
      const s = this._mt[i - 1]! ^ (this._mt[i - 1]! >>> 30);
      this._mt[i] = (((((s & 0xFFFF0000) >>> 16) * 1812433253) << 16) + (s & 0x0000FFFF) * 1812433253) + i;
      this._mt[i]! >>>= 0; // 转换为32位无符号整数
    }
    return this;
  }

  // 生成下一组624个值
  private twist(): void {
    for (let i = 0; i < _n; i++) {
      let x = (this._mt[i]! & this._upper_mask) | (this._mt[(i + 1) % _n]! & this._lower_mask);
      let xA = x >>> 1;
      if (x % 2 !== 0) {
        xA ^= this._matrix;
      }
      this._mt[i]! = this._mt[(i + _m) % _n]! ^ xA;
    }
    this._index = 0;
  }

  // 提取伪随机数
  public int(): number {
    if (this._index >= _n) {
      this.twist();
    }
    let y = this._mt[this._index++]!;
    // 额外的位操作以改善分布
    y ^= (y >>> 11);
    y ^= (y << 7) & 0x9D2C5680;
    y ^= (y << 15) & 0xEFC60000;
    y ^= (y >>> 18);
    const ret = y >>> 0; // 确保返回32位无符号整数
    if (this._debug) this.cases.push(`int: ${ret}`)
    return ret
  }

  // 生成[0,1)范围内的浮点数
  public float(): number {
    const ret = this.int() / (0xFFFFFFFF + 1);
    if (this._debug) this.cases.push(`float: ${ret}`)
    return ret;
  }

  // 生成[min, max)范围内的整数
  public range(min: number, max: number): number {
    const ret = floor(this.float() * (max - min)) + min
    if (this._debug) this.cases.push(`range: ${ret}`)
    return ret;
  }
}
