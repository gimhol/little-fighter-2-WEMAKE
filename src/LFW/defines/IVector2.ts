
export interface IVector2Like {
  x: number;
  y: number;
}

/**
 * 接口: 二维向量
 *
 * @export
 * @interface IVector2
 */
export interface IVector2 extends IVector2Like {
  /**
   * 设置
   *
   * @param {number} x 
   * @param {number} y 
   */
  set(x: number, y: number): void;

  /**
   * 当前向量与向量o相加，改变自身
   *
   * @param {IVector2} o 
   * @returns {this} 返回自身  
   */
  add(o: IVector2): this;

  /**
   * 当前向量与向量o相减，改变自身
   *
   * @param {IVector2} o 
   * @returns {this} 返回自身  
   */
  sub(o: IVector2): this;

  /**
   * 向量的大小
   *
   * @returns {number} 
   */
  length(): number;

  /**
   * 克隆一份
   *
   * @returns {IVector2} 新的向量对象
   */
  clone(): IVector2;

  /**
   * 当前向量归一化
   *
   * @returns {this} 返回自身
   */
  normalize(): this;

  equals(o: IVector2Like): boolean;
}
