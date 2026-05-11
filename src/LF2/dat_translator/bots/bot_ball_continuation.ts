import { BotStateEnum, Defines, EntityVal, GK, IBotAction, LGK } from "../../defines";
import { CondMaker } from "../CondMaker";
import { DESIRE_RATIO } from "./constants";
import { IEditBotActionFunc } from "./IEditBotAction";

export function bot_ball_continuation(
  action_id: string,
  desire: number = DESIRE_RATIO,
  mp: number = 0,
  ...keys: ("F" | "B" | LGK)[]
): IEditBotActionFunc {
  return (edit) => {
    const cond = new CondMaker()
    if (mp > 0) cond.add(EntityVal.MP, '>=', mp)
    const ret: IBotAction = {
      action_id: action_id,
      desire: Defines.desire(desire),
      status: [BotStateEnum.Chasing],
      expression: mp > 0 ? cond.done() : void 0,
      e_ray: [{ x: 1, z: 0 }],
      keys: keys.length ? keys : [GK.Attack]
    }
    return edit ? edit(ret, cond) : ret;
  }
}
