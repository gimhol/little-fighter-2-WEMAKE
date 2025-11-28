import { BdyKind, BuiltIn_OID, Defines, EntityGroup, EntityVal, HitFlag, IEntityData, ItrEffect, ItrKind } from "../../defines";
import { ActionType } from "../../defines/ActionType";
import { C_Val } from "../../defines/CollisionVal";
import { ensure } from "../../utils";
import { CondMaker } from "../CondMaker";
import { bot_ball_dfa } from "./bot_ball_dfa";
import { bot_ball_dfj } from "./bot_ball_dfj";
import { bot_chasing_skill_action } from "./bot_chasing_skill_action";
import { bot_explosion_duj } from "./bot_explosion_duj";
import { BotBuilder } from "./BotBuilder";
import { frames } from "./frames";

/**
 *
 * @export
 * @param {IEntityData} data
 * @return {IEntityData} 
 */
export function make_fighter_data_freeze(data: IEntityData): IEntityData {
  data.base.group = ensure(data.base.group, EntityGroup.Freezer);
  [
    data.frames["running_0"],
    data.frames["running_1"],
    data.frames["running_2"],
    data.frames["running_3"]
  ].filter(Boolean).map(frame => {
    frame.bdy = ensure(frame.bdy, {
      hit_flag: HitFlag.Fighter | HitFlag.Ally,
      code: 123,
      kind: BdyKind.Normal,
      z: -Defines.DAFUALT_QUBE_LENGTH / 2,
      l: Defines.DAFUALT_QUBE_LENGTH,
      x: 35,
      y: 19,
      w: 10,
      h: 60,
      actions: [{
        type: ActionType.FUSION,
        data: { oid: BuiltIn_OID.Firzen, act: { id: "290" }, time: 9000 }//
      }],
      test: new CondMaker<C_Val>()
        .add(C_Val.ItrCode, '==', 123)
        .and(C_Val.ItrHitFlag, '==', HitFlag.Fighter | HitFlag.Ally)
        .and(C_Val.SameFacing, '==', 0)
        .and(c => c
          .add(C_Val.V_HP_P, '<=', 33)
          .and(C_Val.A_HP_P, '<', 33)
          .or(C_Val.LF2_NET_ON, '==', 1)
        )
        .done()
    })
  })
  BotBuilder.make(data).set_actions(
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
