import { Unsafe } from "../type_check/Unsafe";

/** 
 * 确保生成一个数组 
 * 
 * 例1
 * ``` typescript
 * const obj = {}
 * obj.arr = ensure(obj.arr, 1);
 * // obj = { arr:[1] }
 * ```
 * 
 * 例2
 * ``` typescript
 * const obj = {arr:[0]}
 * obj.arr = ensure(obj.arr, 1);
 * // obj = { arr:[0, 1] }
 * ```
 */
export function ensure<T>(output: Unsafe<T[]>, item: T, ...items: T[]): T[] {
  if (!output) return [item, ...items];
  output.push(item, ...items);
  return output;
}


