import { BdyKind, BuiltIn_OID, Defines, EntityGroup, EntityVal, HitFlag, IEntityData, ItrEffect, ItrKind } from "../../defines";
import { ActionType } from "../../defines/ActionType";
import { C_Val } from "../../defines/CollisionVal";
import { ensure } from "../../utils";
import { CondMaker } from "../CondMaker";
import { set_hit_flag } from "../set_hit_flag";
import { bot_ball_dfa } from "./bot_ball_dfa";
import { bot_ball_dfj } from "./bot_ball_dfj";
import { bot_chasing_skill_action } from "./bot_chasing_skill_action";
import { bot_explosion_duj } from "./bot_explosion_duj";
import { BotBuilder } from "./BotBuilder";
import { frames } from "./frames";


export function make_bot_data_freeze(data: IEntityData): IEntityData {
  BotBuilder.write_entity(data).set_actions(
    // d>a
    bot_ball_dfa(100, void 0, 50)(e => {
      e.e_ray?.push(
        { ...e.e_ray![0], z: 0.3 },
        { ...e.e_ray![0], z: -0.3 }
      );
      return e;
    }),

    // d>j
    bot_ball_dfj(150, void 0, 50, 300)(e => {
      e.e_ray?.push(
        { ...e.e_ray![0], z: 0.2 },
        { ...e.e_ray![0], z: -0.2 }
      );
      return e;
    }),

    // dvj
    bot_chasing_skill_action('dvj', void 0, 150, 1 / 180)((action, cond) => {
      action.expression = cond.and(EntityVal.Holding, '==', 0).done()
      return action
    }),

    // d^j
    bot_explosion_duj(300, void 0, -110, 150, 1600),

  ).set_frames(
    [
      ...frames.standings,
      ...frames.walkings
    ],
    ['d>a', 'd>j', 'd^j', 'wa']
  );
  return data;
}
