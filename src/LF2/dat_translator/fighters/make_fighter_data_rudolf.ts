import { BuiltIn_OID, IEntityData, StateEnum } from "../../defines";
import { bot_ball_dfa } from "./bot_ball_dfa";
import { bot_ball_dfj } from "./bot_ball_dfj";
import { BotBuilder } from "./BotBuilder";
import { frames } from "./frames";

/**
 *
 * @todo
 * @export
 * @param {IEntityData} data
 * @return {IEntityData}
 */
export function make_fighter_data_rudolf(data: IEntityData): IEntityData {
  for (const k in data.frames) {
    const frame = data.frames[k]
    frame.opoint?.forEach((opoint) => {
      if (opoint.oid === BuiltIn_OID.Rudolf) {
        opoint.hp = opoint.max_hp = 20;
        opoint.mp = opoint.max_mp = 150;
      }
    });
    if (
      frame.state === StateEnum.Standing ||
      frame.state === StateEnum.Walking ||
      frame.state === StateEnum.Defend
    ) {
      frame.seqs = frame.seqs || {}
      frame.seqs[`LRa`] = {
        id: "70",
        mp: 60,
        facing: 1,
      }
      frame.seqs[`RLa`] = {
        id: "70",
        mp: 60,
        facing: -1,
      }
    }
  }

  BotBuilder.make(data).set_dataset({
    w_atk_m_x: 50,
    w_atk_r_x: 150,
    w_atk_x: 300,
    r_desire_max: 1000,
    r_desire_min: 0
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
    // d>a_2
    bot_ball_dfj(0, void 0, 79, 120)
  ).set_frames(
    [
      ...frames.standings,
      ...frames.walkings,
    ],
    ['d>a_1', 'd>a_2', 'd>j']
  )
  return data;
}
