import { ActionType } from "./ActionType";
import { IAction_Base } from "./IAction_Base";

export interface IAction_StealValue extends IAction_Base {
  type: ActionType.VALUE_STEAL;
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
    hp?: number;

    /** 固定加暗血 */
    hp_r?: number;

    /** 允许恢复真伤 */
    over_hp_r?: number

    /** 允许复活 */
    revive?: number

    /** 固定加蓝 */
    mp?: number;

    /** 以伤害的百分比加血 */
    itr_hp_ratio?: number;

    /** 以伤害的百分比加暗血 */
    itr_hp_r_ratio?: number;

    itr_mp_ratio?: number;

    /** */
    over_injury?: number;
  }
}
