export class SeqKeys<D> {
  private _idx = 0;
  private _hit: 0 | 1 = 0;
  readonly data: D;
  private readonly keys: string;
  get idx() { return this._idx }
  get hit(): 0 | 1 {
    return this._hit;
  }
  constructor(keys: string, data: D) {
    this.keys = keys;
    this.data = data;
  }
  press(keys: string): this {
    const len = this.keys.length;
    const arr = keys.split('');
    for (; this._idx < len && arr.length; ++this._idx) {
      const expected = this.keys[this._idx];
      const j = arr.indexOf(expected)
      if (j < 0) {
        this._idx = 0;
        this._hit = 0;
        return this;
      }
      arr.splice(j, 1);
      if (this._idx == len - 1) {
        this._idx = 0;
        this._hit = 1;
        return this
      }
    }
    return this;
  }
  reset(): 0 | 1 {
    this._idx = 0;
    return this._hit = 0;
  }
}