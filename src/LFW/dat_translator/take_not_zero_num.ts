import { not_zero_num } from "../utils";
import { take } from "./take";

/**
 * 取非0数字
 *
 * @export
 * @param {*} any
 * @param {(string | number | symbol)} key
 * @param {(n: number) => number} [fn]
 * @return {(number | undefined)}
 */
export function take_not_zero_num(
  any: any,
  key: string | number | symbol,
  fn?: (n: number) => number
): number | undefined {
  const v = Number(take(any, key));
  if (!not_zero_num(v)) return void 0;

  // 比较搞笑，这应该是未初始化内存导致的0xCDCDCDCD，我们忽略他吧
  if (v === -842150451) return void 0;
  return fn ? fn(v) : v;
}

