import {
  BotStateEnum, BotVal, Defines, EntityVal,
  IBotAction
} from "../../defines";
import { CondMaker } from "../CondMaker";
import { DESIRE_RATIO } from "./constants";
import { IEditBotActionFunc } from "./IEditBotAction";

export function bot_front_test(
  action_id: IBotAction['action_id'],
  keys: IBotAction['keys'],
  min_mp: number,
  desire: number = DESIRE_RATIO,
  min_x: number = 0,
  max_x?: number,
  zable?: number
): IEditBotActionFunc {
  return (fn) => {
    const cond = new CondMaker<BotVal | EntityVal>();
    if (min_mp > 0) cond.add(EntityVal.MP, '>=', min_mp);
    const ray_1 = {
      x: 1, z: 0, min_x, max_x
    };
    const rays = [ray_1];
    if (zable && zable > 0) rays.push(
      { ...ray_1, z: -zable },
      { ...ray_1, z: zable }
    );
    const ret: IBotAction = {
      action_id: action_id,
      desire: Defines.desire(desire),
      status: [BotStateEnum.Chasing],
      e_ray: rays,
      expression: min_mp > 0 ? cond.done() : void 0,
      keys: keys
    };
    return fn ? fn(ret, cond) : ret;
  };
}
