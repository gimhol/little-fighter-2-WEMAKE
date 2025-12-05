/**
 * 定时渲染接口
 *
 * 在web环境下，应当通过requestAnimationFrame实现之
 * 
 * @export
 * @interface IRender
 */
export interface IRender {
  /**
   * 创建一个定时渲染函数
   *
   * @param {(time: number) => void} handler 回调
   * @return {number} 定时渲染函数ID
   * @memberof IRender
   */
  add(handler: (time: number) => void): number;

  /**
   * 移除一个定时渲染函数
   *
   * @param {number} render_id 定时渲染函数ID
   * @memberof IRender
   */
  del(render_id: number): void;
}
