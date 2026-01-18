import { Difficulty } from "./Difficulty";

export interface IStageObjectInfo {
  id_method?: string; // TODO
  id: string[];
  x: number;
  y?: number;
  z?: number;
  act?: string;
  facing?: -1 | 1;
  hp?: number;
  mp?: number;
  hp_map?: { [x in Difficulty]?: number }
  mp_map?: { [x in Difficulty]?: number }

  /**
   * 出现次数
   * 
   * 当: times >= 0 && is_soldier != true
   * 物件死亡后将会重新创建, 然后times -= 1
   * 
   * 当：times 未设置 && is_soldier != true
   * 物件仅创建一次
   * 
   * 当：times 未设置 && is_soldier == true && boss exists
   * 物件死亡后将重新创建（不限次数）
   * 
   * 当: times >= 0 && is_soldier == true && boss exists
   * 物件死亡后将会重新创建, 然后times -= 1
   * 
   * 当：is_soldier == true && boss not exists
   * 物件死亡后将不重新创建
   *
   * @see {IStageObjectInfo.is_boss}
   * 
   * @type {number}
   * @memberof IStageObjectInfo
   */
  times?: number;
  ratio?: number;
  is_boss?: true;
  is_soldier?: true;
  reserve?: number;

  /**
   * 敌人被击败后，归降后的血量。
   * 若无此字段，敌人不会归降
   *
   * @type {?number}
   */
  join?: number;
  join_team?: string;
  outline_color?: string;
}
