
import { GK, IEntityData, StateEnum } from "../../defines";
import { probability } from "../../utils/math/probability";
import { arithmetic_progression } from "../../utils";
import { bot_ball_continuation } from "../bots/bot_ball_continuation";
import { bot_ball_dfa } from "../bots/bot_ball_dfa";
import { bot_uppercut_dua } from "../bots/bot_uppercut_dua";
import { BotBuilder } from "./BotBuilder";
import { frames } from "../bots/frames";


export function make_fighter_data_jack(data: IEntityData) {
  BotBuilder.make(data).set_actions(
    // d>a
    bot_ball_dfa(40, void 0, 50),

    // d>a+d>a
    bot_ball_continuation("d>a+d>a", probability(3, 0.3), 40, GK.d, 'F', GK.a),

    // d^a
    bot_uppercut_dua(225, 1 / 15, bot_uppercut_dua.MIN_X, bot_uppercut_dua.MAX_X),
  ).set_states(
    [StateEnum.Rowing, StateEnum.Catching],
    ["d^a"]
  ).set_frames(
    [
      ...frames.standings,
      ...frames.walkings
    ],
    ["d^a", "d>a"]
  ).set_frames(
    frames.punchs,
    ["d^a"]
  ).set_frames(
    arithmetic_progression(240, 247),
    ["d>a+d>a"]
  );
  return data;
}
