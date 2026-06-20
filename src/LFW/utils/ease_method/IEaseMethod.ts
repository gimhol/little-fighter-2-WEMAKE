/**
 * 缓动函数
 * @date 4/3/2024 - 4:25:28 PM
 *
 * @export
 * @interface IEaseMethod
 * @typedef {IEaseMethod}
 * @template [Factor=number]
 * @template [Value=number]
 */
export interface IEaseMethod<Factor = number, Value = number> {
  /**
   * 缓动函数
   * @date 4/3/2024 - 4:26:08 PM
   *
   * @param {Factor} factor 因数，范围=[0,1]
   * @param {?Value} [from] 起点值
   * @param {?Value} [to] 终点值
   * @returns {Value} 值
   */
  (factor: Factor, from?: Value, to?: Value): Value;

  /**
   * 缓动函数逆函数
   * @date 4/3/2024 - 4:27:56 PM
   *
   * @fixme 部分缓动函数，值对应多个因数，这该如何是好？
   * @param {Value} value 值
   * @param {?Value} [from] 起点值
   * @param {?Value} [to] 终点值
   * @returns {Factor} 因数，范围=[0,1]
   */
  backward(value: Value, from?: Value, to?: Value): Factor;
}
