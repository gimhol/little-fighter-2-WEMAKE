
/**
 * 缓存数据
 *
 * @export
 * @interface ICacheData
 */
export interface ICacheData {
  /**
   * 缓存数据ID
   *
   * @type {number}
   * @memberof ICacheData
   */
  id: number;

  /**
   * 缓存数据名
   *
   * @type {string}
   * @memberof ICacheData
   */
  name: string;

  /**
   * 缓存数据版本
   *
   * @type {number}
   * @memberof ICacheData
   */
  version: number;

  /**
   * 缓存数据类型
   *
   * @type {string}
   * @memberof ICacheData
   */
  type: string;

  /**
   * 缓存数据
   *
   * @type {Uint8Array}
   * @memberof ICacheData
   */
  data: Uint8Array;

  /**
   * 缓存日期
   *
   * @type {number}
   * @memberof ICacheData
   */
  create_date: number;
}
