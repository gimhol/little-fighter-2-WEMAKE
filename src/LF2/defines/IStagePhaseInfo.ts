import { Difficulty } from "./Difficulty";
import { IDialogInfo } from "./IDialogInfo";
import { IStageObjectInfo } from "./IStageObjectInfo";
/**
 * 关卡阶段信息
 *
 * @export
 * @interface IStagePhaseInfo
 */
export interface IStagePhaseInfo {
  title?: string;
  /** @deprecated */
  bound: number;
  /** 玩家左边界 */
  player_l?: number;
  /** 玩家右边界 */
  player_r?: number;
  /** 相机左边界 */
  camera_l?: number;
  /** 相机右边界 */
  camera_r?: number;
  /** 敌人左边界 */
  enemy_l?: number;
  /** 敌人右边界 */
  enemy_r?: number;
  /** 饮料左边界 */
  drink_l?: number;
  /** 饮料右边界 */
  drink_r?: number;
  /** 关卡描述 */
  desc?: string;
  objects: IStageObjectInfo[];

  /** 
   * 背景音乐 
   * 
   * 设为空字符将停止播放当前正在播放的背景音乐
   * @type {string}
   */
  music?: string;

  /**
   * 播放音效
   * 
   * @type {string}
   */
  sounds?: {
    path: string,
    x?: number,
    y?: number,
    z?: number
  }[]

  respawn?: { [x in Difficulty]?: number };

  /**
   *
   *
   * @type {number}
   * @memberof IStagePhaseInfo
   */
  health_up?: { [x in Difficulty]?: number },
  mp_up?: { [x in Difficulty]?: number },

  /**
   * 相机跳至位置
   *
   * @type {?number}
   */
  cam_jump_to_x?: number;

  /**
   * 玩家跳至位置
   *
   * @type {?number}
   */
  player_jump_to_x?: number;

  end_condition?: string;
  on_start?: string[];
  on_end?: string[];

  dialogs?: IDialogInfo[];

  /** 隐藏状态栏 */
  hide_stats?: number;
}
