import { PromiseInOne } from "promise-in-one/dist/es/pio";

/**
 * 异步值管理
 *
 * @export
 * @class ValuesKeeper
 * @template V
 */
export default class AsyncValuesKeeper<V> {

  readonly values = new Map<string, V>();
  protected _pio = new PromiseInOne<string, string, V>(v => v)
  get(key: string): V | undefined {
    return this.values.get(key)
  }
  has(key: string): boolean {
    return this.values.has(key)
  }
  /**
   * 取值
   *
   * @param {string} key 键
   * @param {() => Promise<V>} job get函数首次调用时被调用，get函数返回的结果将被贮存
   * @return {Promise<V>}
   * @memberof AsyncValuesKeeper
   */
  fetch(key: string, job: () => Promise<V>): Promise<V> {
    const value = this.values.get(key);
    if (value) return Promise.resolve(value);

    return new Promise((resolve, reject) => {
      const [pid, exist] = this._pio.check(key, resolve, reject)
      if (exist) return;
      this._pio.handle(pid, job().then(value => {
        this.values.set(key, value)
        return value
      }))
    });
  }

  /**
   * 覆盖
   *
   * @param {string} key 键
   * @param {() => Promise<V>} job 
   * @return {Promise<V>}
   * @memberof AsyncValuesKeeper
   */
  async overwrite(key: string, job: () => Promise<V>): Promise<V> {
    const value = await job();
    this.values.set(key, value);
    return value;
  }


  clean(): void {
    this.values.clear()
  }

  del(key: string): V | undefined {
    const ret = this.values.get(key);
    this.values.delete(key);
    return ret;
  }
}
