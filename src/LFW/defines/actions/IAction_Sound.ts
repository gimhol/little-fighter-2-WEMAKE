import type { IAction_Base } from "./IAction_Base";
import { ActionType } from "./ActionType";
import type { IVector3Like } from "../IPos";

/**
 * 动作: 播放声音
 */

export interface IAction_Sound extends IAction_Base {
  type: ActionType.A_SOUND | ActionType.V_SOUND;
  data: {
    /**
     * 声音文件路径
     */
    path: string[];

    /**
     * 播放位置
     */
    pos?: IVector3Like;
  };
}


