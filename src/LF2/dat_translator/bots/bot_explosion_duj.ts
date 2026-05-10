import { BotStateEnum, BotVal, Defines, EntityVal, GK, IBotAction } from "../../defines";
import { pow } from "../../utils";
import { CondMaker } from "../CondMaker";
import { DESIRE_RATIO } from "./constants";
import { IEditBotActionFunc } from "./IEditBotAction";
const MIN_X = -120 as const;
const MAX_X = 120 as const;
const Z_LEN = 100 as const;
const ID = 'd^j' as const
/**
 * 矩形范围，检测成功将会按下D^J
 *
 * @export
 * @param {number} min_mp 至少需要多少mp
 * @param {number} [desire=0.0666] 欲望值
 * @param {number} [min_x=-120] 后方距离 
 * @param {number} [max_x=120] 前方距离
 * @param {number} [z_len=120] Z轴范围
 * @return {IBotAction}
 */
export function bot_explosion_duj(
  min_mp: number,
  desire: number = DESIRE_RATIO,
  min_x: number = MIN_X,
  max_x: number = MAX_X,
  z_len: number = Z_LEN
): IEditBotActionFunc {
  return (fn) => {
    const cond = new CondMaker<BotVal | EntityVal>()
    if (min_mp > 0) cond.add(EntityVal.MP, '>=', min_mp)
    const ret = {
      action_id: ID,
      desire: Defines.desire(desire),
      status: [BotStateEnum.Chasing],
      e_ray: [{ x: 1, z: 0, min_x, max_x, max_d: pow(z_len, 2) }],
      expression: min_mp > 0 ? cond.done() : void 0,
      keys: [GK.d, GK.U, GK.j]
    };
    return fn ? fn(ret, cond) : ret
  }
}
bot_explosion_duj.ID = ID
bot_explosion_duj.MIN_X = MIN_X
bot_explosion_duj.MAX_X = MAX_X
bot_explosion_duj.Z_LEN = Z_LEN