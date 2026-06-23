import { BotVal, GameKey as GK, type IEntityData, OID } from "../../defines";
import { range } from "../../utils";
import { bot_ball_continuation } from "./bot_ball_continuation";
import { bot_ball_dfa } from "./bot_ball_dfa";
import { bot_ball_dfj } from "./bot_ball_dfj";
import { bot_explosion_duj } from "./bot_explosion_duj";
import { BotMaker } from "./BotMaker";
import { frames } from "./frames";

export function make_bot_data_firen(): BotMaker {
  return new BotMaker(OID.Firen).set_actions(
    // d>a
    bot_ball_dfa(75, void 0, 50),

    // d>a+a
    bot_ball_continuation("d>a+a", 0.8, 75),

    // d>j
    bot_ball_dfj(75, void 0, 50, 1000)((a, c) => {
      a.e_ray?.push(
        { ...a.e_ray![0], z: 0.2 },
        { ...a.e_ray![0], z: -0.2 }
      );
      a.expression = c.and(BotVal.EnemyOutOfRange, '!=', 1).done()
      return a;
    }),

    // cancel_d>j
    bot_ball_dfj(0, void 0, 0, 1000)((action, cond) => {
      action.action_id = 'cancel_d>j'
      const ray = action.e_ray![0]
      ray.reverse = true
      action.e_ray?.push(
        { ...ray, z: 0.2 },
        { ...ray, z: -0.2 }
      );
      action.expression = cond.or(BotVal.EnemyDiffX, "<", -100).done();
      action.keys = [GK.Jump]
      return action;
    }),

    // dvj
    bot_ball_dfj(75, void 0, 50, 200)(action => {
      action.action_id = 'dvj'
      action.e_ray?.push(
        { ...action.e_ray![0], z: 0.05 },
        { ...action.e_ray![0], z: -0.1 }
      );
      action.keys = [GK.Defend, GK.Down, GK.Jump]
      return action;
    }),

    // cancel_dvj
    bot_ball_dfj(0, void 0, 50, 200)((action) => {
      action.action_id = 'cancel_dvj'
      const ray = action.e_ray![0]
      ray.reverse = true
      action.e_ray?.push(
        { ...ray, z: 0.05 },
        { ...ray, z: -0.05 }
      );
      action.keys = [GK.Jump]
      return action;
    }),

    // d^j
    bot_explosion_duj(300, 1 / 60, -110, 110, 900),

  ).set_frames(
    [
      ...frames.standings,
      ...frames.walkings
    ],
    ['d>a', 'd>j', 'd^j', 'dvj']
  ).set_frames(
    range(255, 261),
    ["cancel_d>j"]
  ).set_frames(
    range(267, 275),
    ["cancel_dvj"]
  ).set_frames(
    range(235, 252),
    ["d>a+a"]
  );
}

BotMaker.register(OID.Firen, make_bot_data_firen)