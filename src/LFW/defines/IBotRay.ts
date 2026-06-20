/**
 * XZ射线检测
 *
 * @export
 * @interface IBotRay
 */
export interface IBotRay {
  /**
   * 射线向量X值
   *
   * @type {number}
   * @memberof IBotRay
   */
  x: number;

  /**
   * 射线向量Z值
   *
   * @type {number}
   * @memberof IBotRay
   */
  z: number;

  /**
   * 最小X距离
   *
   * @type {number}
   * @memberof IBotRay
   */
  min_x?: number;

  /**
   * 最大X距离
   *
   * @type {number}
   * @memberof IBotRay
   */
  max_x?: number;

  /**
   * 最小Z距离
   *
   * @type {number}
   * @memberof IBotRay
   */
  min_z?: number;

  /**
   * 最大Z距离
   *
   * @type {number}
   * @memberof IBotRay
   */
  max_z?: number;

  /**
   * 目标在射线上的投影距离的二次方的最大值
   *
   * @type {number}
   * @memberof IBotRay
   */
  max_d?: number;

  /**
   * 反转判定结果
   *
   * @type {boolean}
   * @memberof IBotRay
   */
  reverse?: boolean;
}
