import type { ICacheData } from "./ICacheData";

export interface ICache {
  /**
   * 根据缓存名查找缓存
   * 
   * @param {string} name 缓存名
   * @return {(Promise<ICacheData | undefined>)} 当不存在时, 返回undefined
   * @memberof ICache
   */
  get(name: string): Promise<ICacheData | undefined>;

  /**
   * 添加一条新缓存数据
   *
   * @param {(Omit<ICacheData, 'id' | 'create_date'>)} data
   * @return {(Promise<number | void>)}
   * @memberof ICache
   */
  put(data: Omit<ICacheData, 'id' | 'create_date'>): Promise<number | void>;

  del(...name: string[]): Promise<number | void>;

  list(): Promise<ICacheData[] | undefined>;

  /**
   * 移除指定类型指定版本后的全部数据
   *
   * @param {ICacheData['type']} type 缓存类型
   * @param {number} version 版本号
   * @return {Promise<number>}
   * @memberof ICache
   */
  forget(type: ICacheData['type'], version: number): Promise<number>;
}
