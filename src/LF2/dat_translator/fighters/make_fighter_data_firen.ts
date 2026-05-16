import { BuiltIn_OID, HitFlag, IEntityData, ItrEffect, ItrKind } from "../../defines";
import { CollisionVal as C_Val } from "../../defines/CollisionVal";
import { ensure } from "../../utils";
import { CondMaker } from "../CondMaker";
import { set_hit_flag } from "../set_hit_flag";


export function make_fighter_data_firen(data: IEntityData) {
  [
    data.frames["running_0"],
    data.frames["running_1"],
    data.frames["running_2"],
    data.frames["running_3"]
  ].filter(Boolean).map(frame => {

    frame.itr = ensure(frame.itr, {
      ...set_hit_flag({}, HitFlag.AllyFighter),
      code: 123,
      kind: ItrKind.Normal,
      effect: ItrEffect.Ignore,
      x: 35,
      y: 19,
      w: 10,
      h: 60,
      test: new CondMaker<C_Val>()
        .add(C_Val.BdyCode, '==', 123)
        .and(C_Val.VictimOID, '==', BuiltIn_OID.Freeze)
        .and(C_Val.BdyHitFlag, '==', HitFlag.AllyFighter)
        .and(C_Val.SameFacing, '==', 0)
        .done()
    })
  })
  return data;
}
