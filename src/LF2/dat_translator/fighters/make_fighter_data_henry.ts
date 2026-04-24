import { GK, IEntityData } from "../../defines";
import { bot_ball_dfa } from "./bot_ball_dfa";
import { bot_ball_dfj } from "./bot_ball_dfj";
import { bot_explosion_duj } from "./bot_explosion_duj";
import { BotBuilder } from "./BotBuilder";
import { frames } from "./frames";

/**
 *
 * @todo
 * @export
 * @param {IEntityData} data
 * @return {IEntityData}
 */
export function make_fighter_data_henry(data: IEntityData): IEntityData {
  BotBuilder.make(data).set_dataset({
    w_atk_m_x: 100,
    w_atk_r_x: 250,
    w_atk_x: 350
  }).set_actions(
    // d>a
    bot_ball_dfa(150, void 0, 120, 400),
    // d>j
    bot_ball_dfj(200, void 0, 120, 1000, 0.3),
    // dja_1
    bot_ball_dfj(150, void 0, 120, 300)((a, c) => {
      a.action_id = 'dja_1'
      a.keys = [GK.d, GK.j, GK.a]
      a.e_ray![0].max_d = 40000;
      return a;
    }),
    // dja_2
    bot_ball_dfj(150, void 0, 300, 500)((a, c) => {
      a.action_id = 'dja_2'
      a.keys = [GK.d, GK.j, GK.a]
      a.e_ray![0].max_d = 160000;
      return a;
    }),
    // d^j
    bot_explosion_duj(350, void 0, -250, 250, 90000)
  ).set_frames(
    [
      ...frames.standings,
      ...frames.walkings,
    ],
    ['d>a', 'd>j', 'dja_1', 'dja_2', 'd^j']
  )
  return data;
}

