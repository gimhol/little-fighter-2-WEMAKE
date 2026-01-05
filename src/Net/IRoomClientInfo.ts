import type { IClientInfo } from "./IClientInfo";

/**
 * 房间内玩家信息
 *
 * @export
 * @interface IRoomClientInfo
 * @extends {IClientInfo}
 */
export interface IRoomClientInfo extends IClientInfo {
  /**
   * 玩家是否“已准备就绪”
   *
   * @type {boolean}
   * @memberof IRoomClientInfo
   */
  ready?: boolean;
}
