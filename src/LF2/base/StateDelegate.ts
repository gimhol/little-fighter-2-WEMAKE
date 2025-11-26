import { max, floor } from "../utils";

export type TValueInfo<T> =
  | { is_func: true; v: () => T }
  | { is_func: false; v: T };

export type Value<T> = T | (() => T)
export type Unsafe<T> = T | undefined | null;

export class StateDelegate<T> {
  static CompareArray<T extends {}>(a: Unsafe<T[]>, b: Unsafe<T[]>): boolean {
    if (a === b) return false;
    if (a?.length !== b?.length) return true;
    if (a && b) return a.some((v, i) => v !== b[i]);
    return true
  }
  protected _dirty: boolean = true
  protected _default_value: TValueInfo<Unsafe<T>>
  protected _values: TValueInfo<Unsafe<T>>[] = [];
  protected get_value(v: TValueInfo<Unsafe<T>>) {
    return v.is_func ? v.v() : v.v;
  }
  protected value_to_state(v: Value<Unsafe<T>>): TValueInfo<Unsafe<T>> {
    return (typeof v === 'function') ? { is_func: true, v: v as () => T } : { is_func: false, v: v };
  }
  set dirty(v: boolean) { this._dirty = v; }
  get dirty() { const r = this._dirty; this._dirty = false; return r; }
  set default_value(v: Value<T>) {
    this._default_value = this.value_to_state(v);
    if (this._values.length === 0) this._dirty = true;
  }
  get default_value(): T { return this.get_value(this._default_value)! }
  set value(v: Value<Unsafe<T>>) { this.set(max(0, this._values.length - 1), v) }
  get value(): T {
    const len = this._values.length;
    for (let i = len - 1; i >= 0; --i) {
      const item = this._values[i]!;
      const value = this.get_value(item);
      if (value !== null && value !== void 0)
        return value
    }
    return this.default_value;
  }
  compare = (a: Unsafe<T>, b: Unsafe<T>): boolean => {
    return a !== b;
  }
  constructor(default_value: Value<T>) {
    this._default_value = this.value_to_state(default_value);
  }
  comparer(fn: (a: Unsafe<T>, b: Unsafe<T>) => boolean): this {
    this.compare = fn;
    return this;
  }
  set(index: number, v: Value<Unsafe<T>>): void {
    index = floor(index);
    if (index < 0) return;
    const old = this._values[index];
    const now = this.value_to_state(v);
    this._values[index] = now;
    if (index < this._values.length - 1) return;
    const old_value = old ? this.get_value(old) : void 0;
    const now_value = now ? this.get_value(now) : void 0;
    const changed = !old || !now || this.compare(old_value, now_value)
    if (changed) this._dirty = true;
  }

  delete(index: number) {
    index = floor(index);
    if (index < 0 || index >= this._values.length) return;

    const [old] = this._values.splice(index, 1);
    if (index !== this._values.length) return;
    const now = this._values[this._values.length - 1];
    if (old === now) return;
    const old_value = old ? this.get_value(old) : void 0;
    const now_value = now ? this.get_value(now) : void 0;
    const changed = !old || !now || this.compare(old_value, now_value)
    if (changed) this._dirty = true;

  }

  insert(index: number, v: Value<Unsafe<T>>): void {
    index = floor(index);
    const old = this._values[this._values.length - 1];
    this._values.splice(index, 0, this.value_to_state(v));
    const now = this._values[this._values.length - 1];
    if (index < this._values.length - 1) return
    if (old === now) return;
    const old_value = old ? this.get_value(old) : void 0;
    const now_value = now ? this.get_value(now) : void 0;
    const changed = !old || !now || this.compare(old_value, now_value)
    if (changed) this._dirty = true;

  }

  pop() {
    if (!this._values.length) return;
    const old = this._values[this._values.length - 1];
    this._values.pop();
    const now = this._values[this._values.length - 1];
    const old_value = old ? this.get_value(old) : void 0;
    const now_value = now ? this.get_value(now) : void 0;
    const changed = !old || !now || this.compare(old_value, now_value)
    if (changed) this._dirty = true;
  }

  push(...v: Value<Unsafe<T>>[]) {
    if (!v.length) return;
    const old = this._values[this._values.length - 1];
    this._values.push(...v.map(v => this.value_to_state(v)));
    const now = this._values[this._values.length - 1];
    const old_value = old ? this.get_value(old) : void 0;
    const now_value = now ? this.get_value(now) : void 0;
    const changed = !old || !now || this.compare(old_value, now_value)
    if (changed) this._dirty = true;
  }

  unshift(...v: Value<Unsafe<T>>[]) {
    if (!v.length) return;
    const old = this._values[this._values.length - 1];
    this._values.unshift(...v.map(v => this.value_to_state(v)));
    if (this._values.length > v.length) return;
    const now = this._values[this._values.length - 1];
    const old_value = old ? this.get_value(old) : void 0;
    const now_value = now ? this.get_value(now) : void 0;
    const changed = !old || !now || this.compare(old_value, now_value)
    if (changed) this._dirty = true;
  }
}
export default StateDelegate