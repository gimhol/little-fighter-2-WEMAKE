
import {
  BotStateEnum, BotVal, Defines, EntityVal, GK, GameKey, IBotAction
} from "../../defines";
import { CondMaker } from "../CondMaker";
import { DESIRE_RATIO } from "./constants";
import { IEditBotActionFunc } from "./IEditBotAction";

type Key1 = '^' | '>' | 'v' | 'j';
type Key2 = 'a' | 'j';
export function bot_chasing_skill_action(
  keys_str: `d${Key1}${Key2}`,
  action_id: string = keys_str,
  min_mp: number = -1,
  desire: number = DESIRE_RATIO
): IEditBotActionFunc {
  const keys: IBotAction['keys'] = [GK.d];
  switch (keys_str[1]) {
    case '^': keys.push(GameKey.U); break;
    case 'v': keys.push(GameKey.D); break;
    case '>': keys.push('F'); break;
    case 'j': keys.push(GameKey.j); break;
  }
  switch (keys_str[2]) {
    case 'a': keys.push(GameKey.a); break;
    case 'j': keys.push(GameKey.j); break;
  }
  return (fn) => {
    const cond = new CondMaker<BotVal | EntityVal>()
    if (min_mp > 0) cond.add(EntityVal.MP, '>=', min_mp)
    const ret: IBotAction = {
      action_id: action_id,
      desire: Defines.desire(desire),
      status: [BotStateEnum.Chasing],
      expression: min_mp > 0 ? cond.done() : void 0,
      keys: keys
    }
    return fn ? fn(ret, cond) : ret
  };
}


