import { BotStateEnum, BotVal, Defines, EntityVal, GK, type IBotAction } from "../../defines";
import { CondMaker } from "../CondMaker";
import { DESIRE_RATIO_X_3 } from "./constants";
const MIN_X = -10 as const;
const MAX_X = 120 as const;
const ID = 'd^a' as const
/**
 * 矩形范围，检测成功将会按下D^A
 *
 * @export
 * @param {number} min_mp 至少需要多少mp
 * @param {number} [desire=0.0666] 欲望值
 * @param {number} [min_x=90] 最小距离 
 * @param {number} [max_x=120] 最大距离
 * @param {number} [max_d=30] Z距离
 * @return {IBotAction}
 */
export function bot_uppercut_dua(
  min_mp: number,
  desire: number = DESIRE_RATIO_X_3,
  min_x: number = MIN_X,
  max_x: number = MAX_X,
  max_d: number = 30,
): IBotAction {
  const cond = new CondMaker<BotVal | EntityVal>().add(EntityVal.MP, '>=', min_mp)
  return {
    action_id: ID,
    desire: Defines.desire(desire),
    status: [BotStateEnum.Chasing],
    e_ray: [{ x: 1, z: 0, min_x, max_x, max_d: max_d * max_d }],
    expression: min_mp > 0 ? cond.done() : void 0,
    keys: [GK.d, GK.U, GK.a]
  };
}
bot_uppercut_dua.ID = ID
bot_uppercut_dua.MIN_X = MIN_X
bot_uppercut_dua.MAX_X = MAX_X