import { ActionType } from "./ActionType";
import { IAction_Base } from "./IAction_Base";

export interface IAction_LifeSteal extends IAction_Base {
  type: ActionType.LIFE_STEAL;
  data: {
    /**
     对象
        0 = 攻击者自己
        1 = 攻击者的顶级发射者
        2 = 攻击者的发射者
        3 = 攻击者的持有者
     */
    target?: number;

    /** 固定加血 */
    abs_hp?: number;

    /** 固定加暗血 */
    abs_hp_r?: number;

    /** 允许恢复真伤 */
    over_hp_r?: boolean
  }
}
