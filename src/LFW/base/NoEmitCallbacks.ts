import list_fn from "../utils/container_help/list_fn";

export const EFUNC = (..._args: any[]) => void 0

class Pack<F extends {}> {
  readonly fn_name: keyof F;
  get emiting() { return this._emiting }

  private _emiting: boolean = false;
  private _pendings: { args: any[] }[] = []
  private _set: Set<F> = new Set()
  private _waits: { type: 'del' | 'add', who: F }[] = []

  constructor(fn_name: keyof F) {
    this.fn_name = fn_name
  }

  add(v: F): void {
    if (this._emiting) {
      this._waits.push({ type: 'add', who: v })
    } else {
      this._set.add(v);
    }
  }

  delete(v: F): void {
    if (this._emiting) {
      this._waits.push({ type: 'del', who: v })
    } else {
      this._set.delete(v);
    }
  }

  emit(args: any[]): void {
    this._pendings.push({ args });
    if (this.emiting) return;
    this.handle_pendings();
  }

  private handle_pendings() {
    const pending = this._pendings.shift()
    if (!pending) return;
    this._emiting = true
    for (const v of this._set) {
      const f = (v as any)[this.fn_name];
      f.apply(v, pending.args);
      if ('once' in v && v.once)
        this._waits.push({ type: 'del', who: f })
    }
    this.handle_waits();
    this._emiting = false
  }

  private handle_waits() {
    if (!this._waits.length) return
    for (const { type, who } of this._waits)
      if (type === 'add') this._set.add(who);
      else this._set.delete(who);
    this._waits.length = 0
  }
}

export class NoEmitCallbacks<F extends {}> {
  /**
   * 回调对象map
   *
   * @protected
   * @type {Map<any, Set<F>>}
   */
  protected _map: Map<any, Pack<F>> = new Map();

  clear() {
    this._map.clear()
  }

  /**
   * 添加回调对象
   *
   * @param {F} v 回调对象
   * @returns {() => void} 移除回调对象
   */
  add(v: F): () => void {
    const any_keys = list_fn(v);
    if (!any_keys.size) return EFUNC;

    for (const key of any_keys) {
      if (key === 'once') continue;
      let pack = this._map.get(key);
      if (!pack) this._map.set(key, pack = new Pack(key as any));
      pack.add(v);
    }
    return () => this.del(v);
  }

  once<K extends keyof F, V extends F[K] = F[K]>(k: K, f: V): () => void {
    return this.add({ [k]: f, once: true } as unknown as F)
  }

  on<K extends keyof F, V extends F[K] = F[K]>(k: K, f: V): () => void {
    return this.add({ [k]: f } as unknown as F)
  }

  /**
   * 移除回调对象
   *
   * @param {F} v 回调对象
   */
  del(v: F): void {
    for (const [, set] of this._map) set.delete(v);
  }
}
