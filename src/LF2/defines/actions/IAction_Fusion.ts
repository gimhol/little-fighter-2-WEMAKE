import { GK, TNextFrame } from "..";
import { ActionType } from "../ActionType";
import { IAction_Base } from "./IAction_Base";


export interface IAction_Fusion extends IAction_Base {
  type: ActionType.FUSION;
  data: {
    /** 合体成为什么 */
    oid: string

    /** 合体后动作 */
    act?: TNextFrame;

    /** 合体持续时间 */
    time?: number;

    /** 取消合体的按键 */
    cancel_keys?: GK[][]
  };
}
