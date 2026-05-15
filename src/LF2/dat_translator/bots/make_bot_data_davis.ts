import { BotVal, GameKey, O_ID, StateEnum } from "../../defines";
import { arithmetic_progression } from "../../utils";
import { probability } from "../../utils/math/probability";
import { bot_ball_continuation } from "./bot_ball_continuation";
import { bot_ball_dfa } from "./bot_ball_dfa";
import { bot_chasing_action } from "./bot_chasing_action";
import { bot_uppercut_dua } from "./bot_uppercut_dua";
import { bot_uppercut_dva } from "./bot_uppercut_dva";
import { BotMaker } from "./BotMaker";
import { frames } from "./frames";

export function make_bot_data_davis(): BotMaker {
  return new BotMaker(O_ID.Davis).set_actions(
    // d>a
    bot_ball_dfa(50, void 0, 50),

    // d>a+a
    bot_ball_continuation("d>a+a", probability(3, 0.8), 50),

    // d^a
    bot_uppercut_dua(225, void 0, bot_uppercut_dua.MIN_X, bot_uppercut_dua.MAX_X),

    // dva
    bot_uppercut_dva(75, void 0, bot_uppercut_dva.MIN_X, bot_uppercut_dva.MAX_X),

    // dva+j
    bot_uppercut_dva(
      25,
      probability(5, 0.5),
      bot_uppercut_dva.MIN_X,
      bot_uppercut_dva.MAX_X
    )((action, cond) => {
      action.action_id = 'dva+j';
      action.keys = [GameKey.j];
      action.expression = cond!.and(BotVal.EnemyY, '>', 0).done()
      return action;
    }),

    // "d^j"
    bot_uppercut_dva(25, void 0, bot_uppercut_dva.MAX_X, bot_uppercut_dva.MIN_X + bot_uppercut_dva.MAX_X)((action) => {
      action.action_id = "d^j";
      action.keys = [GameKey.d, GameKey.U, GameKey.j];
      return action;
    }),

    // "d^j+a"
    bot_uppercut_dva(0, 1, bot_uppercut_dva.MIN_X, 40)((action) => {
      action.action_id = "d^j+a";
      action.keys = [GameKey.a];
      return action;
    }),

    bot_chasing_action("dva+run", ["F", "F"], 0, probability(7, 0.5))
  ).set_states(
    [StateEnum.Rowing],
    ["d^a", "d^j"]
  ).set_states(
    [StateEnum.Catching],
    ["d^a", "dva"]
  ).set_frames(
    [
      ...frames.standings,
      ...frames.walkings,
      ...frames.runnings
    ],
    ["d^a", "d^j", "d>a", "dva"]
  ).set_frames(
    frames.punchs,
    ["dva", "d^a"]
  ).set_frames(
    arithmetic_progression(240, 269),
    ["d>a+a"]
  ).set_frames(
    // many punch + >>
    [282],
    ["dva+run"]
  ).set_frames(
    // many punch
    [...arithmetic_progression(270, 289, 1)],
    ["dva+j", "d^a"]
  ).set_frames(
    // super punch + j or d^a
    [39],
    ["dva+j", "d^a"]
  ).set_frames(
    // jumphit
    arithmetic_progression(290, 292),
    ["d^j+a"]
  )
}
BotMaker.register(O_ID.Davis, make_bot_data_davis)