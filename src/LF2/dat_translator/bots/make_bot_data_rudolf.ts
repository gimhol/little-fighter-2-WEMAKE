import { GK, OID } from "../../defines";
import { bot_ball_dfa } from "./bot_ball_dfa";
import { bot_ball_dfj } from "./bot_ball_dfj";
import { bot_explosion_duj } from "./bot_explosion_duj";
import { BotBuilder } from "./BotBuilder";
import { frames } from "./frames";

export function make_bot_data_rudolf(): BotBuilder {
  return new BotBuilder(OID.Rudolf).set_dataset({
    w_atk_m_x: 40,
    w_atk_r_x: 150,
    w_atk_x: 300,
    r_desire_min: 500,
    r_desire_max: 3000,
  }).set_actions(
    // d>a_1
    bot_ball_dfa(100, void 0, 120, 300)((a, c) => {
      a.action_id = 'd>a_1'
      a.e_ray![0].max_d = 40000;
      return a;
    }),
    // d>a_2
    bot_ball_dfa(100, void 0, 300, 500)((a, c) => {
      a.action_id = 'd>a_2'
      a.e_ray![0].max_d = 160000;
      return a;
    }),
    bot_ball_dfj(0, void 0, 79, 120),
    bot_explosion_duj(350, 0.05, -300, 300, 500)((action) => {
      action.action_id = 'd^j_1'
      action.e_ray?.forEach(v => v.reverse = true)
      return action;
    }),
    bot_explosion_duj(350, 0.005, -150, 150, 500)((action) => {
      action.action_id = 'd^j_2'
      action.e_ray?.forEach(v => v.reverse = true)
      return action;
    }),
    bot_explosion_duj(350, 0.05, -300, 300, 500)((action) => {
      action.action_id = 'dvj_1'
      action.keys = [GK.Defend, GK.Down, GK.Jump]
      action.e_ray?.forEach(v => v.reverse = true)
      return action;
    }),
    bot_explosion_duj(350, 0.005, -150, 150, 500)((action) => {
      action.action_id = 'dvj_2'
      action.keys = [GK.Defend, GK.Down, GK.Jump]
      action.e_ray?.forEach(v => v.reverse = true)
      return action;
    }),
  ).set_frames(
    [
      ...frames.standings,
      ...frames.walkings,
    ],
    ['d>a_1', 'd>a_2', 'd>j', 'd^j_1', 'dvj_1', 'd^j_2', 'dvj_2']
  )
}

BotBuilder.register(OID.Rudolf, make_bot_data_rudolf)