import { Defines, EntityGroup, IEntityData } from "../../defines";
import { arithmetic_progression, ensure } from "../../utils";
import { bot_ball_continuation } from "./bot_ball_continuation";
import { bot_ball_dfa } from "./bot_ball_dfa";
import { bot_uppercut_dva } from "./bot_uppercut_dva";
import { BotBuilder } from "./BotBuilder";
import { frames } from "./frames";

/**
 * @param data 
 * @returns 
 */
export function make_figther_data_louisex(data: IEntityData): IEntityData {
  data.base.strength = Defines.FIGHTER_STREAGTH_STRONG
  data.base.group = ensure(data.base.group, EntityGroup.Boss);
  BotBuilder.make(data).set_actions(
    // d>a
    bot_ball_dfa(100, void 0, 150, 400),
    // `d>a+a`
    bot_ball_continuation(`d>a+a`, 0.5, 100),
    // d^j
    bot_uppercut_dva(0, void 0, -10, 120),
  ).set_frames(
    [
      ...frames.standings,
      ...frames.walkings,
    ],
    ['d>a', 'dva']
  ).set_frames(
    [...frames.punchs],
    ['dva']
  ).set_frames(
    arithmetic_progression(260, 269),
    ['d>a+a']
  ).set_dataset({
    w_atk_f_x: 90,
    w_atk_b_x: 90,
    j_atk_f_x: 90,
    j_atk_b_x: 90,
    d_atk_f_x: 200,
    r_atk_f_x: 200,
  });
  return data;
}
