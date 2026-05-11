import { LGK, BotVal, EntityVal, IBotAction, Defines, BotStateEnum } from "../../defines";
import { CondMaker } from "../CondMaker";
import { DESIRE_RATIO } from "./constants";
import { IEditBotActionFunc } from "./IEditBotAction";

export function bot_idle_action(
  action_id: string,
  keys: ("F" | "B" | LGK)[],
  min_mp: number = -1,
  desire: number = DESIRE_RATIO
): IEditBotActionFunc {
  return (fn) => {
    const cond = new CondMaker<BotVal | EntityVal>();
    if (min_mp > 0) cond.add(EntityVal.MP, '>=', min_mp);
    const ret: IBotAction = {
      action_id: action_id,
      desire: Defines.desire(desire),
      status: [BotStateEnum.Idle],
      expression: min_mp > 0 ? cond.done() : void 0,
      keys: keys
    };
    return fn ? fn(ret, cond) : ret;
  };
}
