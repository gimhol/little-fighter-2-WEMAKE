import { EFUNC, NoEmitCallbacks } from "./NoEmitCallbacks";
export class Callbacks<F extends {}> extends NoEmitCallbacks<F> {
  /**
   * 获取指定回调名的回调函数
   *
   * @template {keyof F} K
   * @param {K} fn_name
   * @returns {Exclude<F[K], undefined | null>} 指定回调名的回调函数
   */
  emit<K extends keyof F>(fn_name: K): Exclude<F[K], undefined | null> {
    const pack = this._map.get(fn_name);
    if (!pack) return EFUNC as any;
    const ret: any = (...args: any[]) => pack.emit(args);
    return ret;
  }
}
export default Callbacks;
