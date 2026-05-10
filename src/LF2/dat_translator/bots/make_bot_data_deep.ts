import { BotVal, GameKey, O_ID, StateEnum } from "../../defines";
import { arithmetic_progression } from "../../utils";
import { probability } from "../../utils/math/probability";
import { bot_ball_continuation } from "./bot_ball_continuation";
import { bot_ball_dfa } from "./bot_ball_dfa";
import { bot_ball_dfj } from "./bot_ball_dfj";
import { bot_chasing_skill_action } from "./bot_chasing_skill_action";
import { bot_uppercut_dva } from "./bot_uppercut_dva";
import { BotMaker } from "./BotMaker";
import { frames } from "./frames";


export function make_bot_data_deep(): BotMaker {
  return new BotMaker(O_ID.Deep).set_actions(
    // d>a
    bot_ball_dfa(75, void 0, 50, 200),

    // d>a+a
    bot_ball_continuation("d>a+a", 0.5, 75),

    // d>j
    bot_ball_dfj(150, void 0, 50, 200)((a, c) => {
      a.expression = c.and(BotVal.EnemyOutOfRange, '!=', 1).done()
      return a
    }),

    // catching_d>j
    bot_chasing_skill_action('d>j', 'catching_d>j', 150),

    // dva
    bot_uppercut_dva(75, void 0, bot_uppercut_dva.MIN_X, bot_uppercut_dva.MAX_X),

    // dva+a
    bot_uppercut_dva(75, 1, bot_uppercut_dva.MIN_X, bot_uppercut_dva.MAX_X)((action, cond) => {
      action.action_id = 'dva+a';
      action.expression = cond!.and(BotVal.EnemyY, '<=', 0).done()
      action.keys = [GameKey.a];
      return action;
    }),

    // dva+j
    bot_uppercut_dva(
      150,
      probability(4, 0.5),
      0.5,
      bot_uppercut_dva.MAX_X
    )((action, cond) => {
      action.action_id = 'dva+j';
      action.keys = [GameKey.j];
      action.expression = cond!.and(BotVal.EnemyY, '>', 0).done()
      return action;
    }),

    // "d^j"
    bot_uppercut_dva(0, void 0, bot_uppercut_dva.MAX_X, bot_uppercut_dva.MIN_X + bot_uppercut_dva.MAX_X)((action) => {
      action.action_id = "d^j";
      action.keys = [GameKey.d, GameKey.U, GameKey.j];
      return action;
    }),

    // "d^j+a"
    bot_uppercut_dva(150, 1, bot_uppercut_dva.MIN_X, bot_uppercut_dva.MAX_X)((action) => {
      action.action_id = "d^j+a";
      action.keys = [GameKey.a];
      return action;
    }),
  ).set_states(
    [StateEnum.Rowing],
    [bot_ball_dfj.ID]
  ).set_states(
    [StateEnum.Catching],
    ['catching_d>j']
  ).set_frames(
    [
      ...frames.standings,
      ...frames.walkings,
      ...frames.runnings
    ],
    ['d^j', bot_ball_dfj.ID, bot_ball_dfa.ID, bot_uppercut_dva.ID]
  ).set_frames(
    [
      ...frames.punchs
    ],
    [bot_uppercut_dva.ID]
  ).set_frames(
    arithmetic_progression(235, 250),
    ["d>a+a"]
  ).set_frames(
    // jump_sword: ground_part
    [
      ...arithmetic_progression(260, 265),
      ...arithmetic_progression(277, 282)
    ],
    ["dva+a", "dva+j"]
  ).set_frames(
    // jump_sword: jump_part
    arithmetic_progression(266, 267),
    ["d^j+a"]
  );
}

BotMaker.register(O_ID.Deep, make_bot_data_deep)