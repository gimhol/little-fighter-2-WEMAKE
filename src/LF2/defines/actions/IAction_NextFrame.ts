import { IAction_Base } from "./IAction_Base";
import { ActionType } from "../ActionType";
import type { TNextFrame } from "../INextFrame";

/**
 * 动作: 进入指定帧数
 */

export interface IAction_NextFrame extends IAction_Base {
  type: ActionType.A_NextFrame | ActionType.V_NextFrame;

  /**
   * 指定帧
   */
  data: TNextFrame;
}
