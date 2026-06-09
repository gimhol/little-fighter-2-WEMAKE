import type { ISeqKeysSnapshot } from "./ISeqKeysSnapshot";

export class SeqKeys<D> {
  idx: number = 0;
  hit: number = 0;
  keys: string;
  data: D;

  constructor(keys: string, data: D) {
    this.keys = keys;
    this.data = data;
  }

  press(keys: string): this {
    const len = this.keys.length;
    const arr = keys.split('');
    for (; this.idx < len && arr.length; ++this.idx) {
      const expected = this.keys[this.idx];
      const j = arr.indexOf(expected);
      if (j < 0) {
        this.idx = 0;
        this.hit = 0;
        return this;
      }
      arr.splice(j, 1);
      if (this.idx == len - 1) {
        this.idx = 0;
        this.hit = 1;
        return this;
      }
    }
    return this;
  }

  reset(): number {
    this.idx = 0;
    return (this.hit = 0);
  }

  to_snapshot(): ISeqKeysSnapshot<D> {
    return {
      idx: this.idx,
      hit: this.hit,
      keys: this.keys,
      data: this.data,
    };
  }

  from_snapshot(s: ISeqKeysSnapshot<D>): void {
    this.idx = s.idx;
    this.hit = s.hit;
    this.keys = s.keys;
    this.data = s.data;
  }
}