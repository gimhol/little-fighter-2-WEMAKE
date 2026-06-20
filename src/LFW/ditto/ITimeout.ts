/**
 * 定时器接口
 * 
 * setTimeout虽然很常见，但并不是标准内的函数。故此处仅做接口声明，需另外实现
 * 
 * @export
 * @interface ITimeout
 */
export interface ITimeout {
  /**
   * 创建一个定时器
   *
   * @param {() => void} handler 回调
   * @param {number} [timeout] 时长
   * @param {...any[]} args 无用的预留参数
   * @return {number} 定时器ID
   * @memberof ITimeout
   */
  add(handler: () => void, timeout?: number, ...args: any[]): number;

  /**
   * 移除一个定时器
   *
   * @param {number} timer_id 定时器ID
   * @memberof ITimeout
   */
  del(timer_id: number): void;
}
