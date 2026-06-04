/** 用来避免GC */
export class Graves<T> {
  readonly l: (T | undefined)[] = [];
  private i: number = 0;
  add(t: T) {
    if (!this.i) {
      this.l.push(t);
    } else {
      this.l[--this.i] = t
    }
  }
  take(): T | undefined {
    const ret = this.l[this.i]
    if (!ret) return ret;
    this.l[this.i] = void 0;
    ++this.i;
    return ret
  }
}