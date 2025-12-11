export class Keeper<K, V> {
  protected pool = new Map<K, V>;
  get(key: K, f: () => V): V {
    let ret = this.pool.get(key);
    if (!ret) this.pool.set(key, ret = f());
    return ret;
  }
}
