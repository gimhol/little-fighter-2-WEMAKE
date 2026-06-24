import { BdyKind, OID, EntityGroup, HitFlag, type IEntityData } from "../../defines";
import { ActionType } from "../../defines/actions/ActionType";
import { C_Val } from "../../defines/CollisionVal";
import { ensure } from "../../utils";
import { CondMaker } from "../CondMaker";
import { set_hit_flag } from "../set_hit_flag";

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
      ...set_hit_flag({}, HitFlag.AllyFighter),
      code: 123,
      kind: BdyKind.Normal,
      x: 35,
      y: 19,
      w: 10,
      h: 60,
      actions: [{
        type: ActionType.FUSION,
        data: { oid: OID.Firzen, act: { id: "290" }, time: 9000 }//
      }],
      test: new CondMaker<C_Val>()
        .add(C_Val.ItrCode, '==', 123)
        .and(C_Val.AttackerOID, '==', OID.Firen)
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
  return data;
}
