import { IAction_Base } from "./IAction_Base";
import { ActionType } from "../ActionType";
import type { IPos } from "../IPos";

/**
 * 动作: 播放声音
 */

export interface IAction_Sound extends IAction_Base {
  type: ActionType.A_Sound | ActionType.V_Sound;
  data: {
    /**
     * 声音文件路径
     */
    path: string[];

    /**
     * 播放位置
     */
    pos?: IPos;
  };
}


