import { BdyKind, BuiltIn_OID, Defines, FacingFlag, IFrameInfo, ItrKind, OpointKind, StateEnum } from "../defines";
import { HitFlag } from "../defines/HitFlag";
import { CollisionVal as C_Val } from "../defines/CollisionVal";
import { ensure } from "../utils";
import { foreach } from "../utils/container_help/foreach";
import { CondMaker } from "./CondMaker";

export function make_frame_state(frame: IFrameInfo) {
  switch (frame.state) {
    case StateEnum.Ball_3005:
      frame.no_shadow = 1;
      break;
    case StateEnum.HeavyWeapon_OnHand:
      frame.no_shadow = 1;
      frame.gravity_enabled = false;
      break;
    case StateEnum.Weapon_OnHand:
      frame.no_shadow = 1;
      frame.gravity_enabled = false;
      break;
    case StateEnum.Burning: {
      foreach(frame.itr, itr => {
        itr.hit_flag = HitFlag.AllBoth;
      })
      break;
    }
    case StateEnum.OLD_LouisCastOff: {
      frame.state = StateEnum.Attacking;
      const dvy_a = 6
      const dvy_b = 5
      const dvx_b = 7
      const dvx_z = 5
      frame.opoint = ensure(frame.opoint, {
        kind: OpointKind.Normal,
        x: 39,
        y: 79,
        oid: BuiltIn_OID.Weapon_LouisArmourB,
        dvy: dvy_a,
        action: { id: "auto" },
        speedz: 0
      }, {
        kind: OpointKind.Normal,
        x: 39,
        y: 79,
        oid: BuiltIn_OID.Weapon_LouisArmourA,
        dvy: dvy_b,
        dvx: -dvx_b,
        dvz: dvx_z,
        action: { id: "auto", facing: FacingFlag.Backward },
        speedz: 0
      }, {
        kind: OpointKind.Normal,
        x: 39,
        y: 79,
        oid: BuiltIn_OID.Weapon_LouisArmourA,
        dvy: dvy_b,
        dvx: -dvx_b,
        dvz: -dvx_z,
        action: { id: "auto", facing: FacingFlag.Backward },
        speedz: 0
      }, {
        kind: OpointKind.Normal,
        x: 39,
        y: 79,
        oid: BuiltIn_OID.Weapon_LouisArmourA,
        dvy: dvy_b,
        dvx: -dvx_b,
        dvz: dvx_z,
        action: { id: "auto" },
        speedz: 0
      }, {
        kind: OpointKind.Normal,
        x: 39,
        y: 79,
        oid: BuiltIn_OID.Weapon_LouisArmourA,
        dvy: dvy_b,
        dvx: -dvx_b,
        dvz: -dvx_z,
        action: { id: "auto" },
        speedz: 0
      });
      break;
    }
    case StateEnum.Falling: {
      foreach(frame.bdy, bdy => {
        if (bdy.kind !== BdyKind.Normal) return;
        bdy.test = new CondMaker<C_Val>()
          .add(
            C_Val.ItrFall,
            ">=",
            Defines.DEFAULT_FALL_VALUE_CRITICAL
          )
          .or(C_Val.ItrKind, "==", ItrKind.MagicFlute)
          .or(C_Val.ItrKind, "==", ItrKind.MagicFlute2)
          .done();
      })
      break;
    }
    case StateEnum.Frozen:
      foreach(frame.bdy, bdy => bdy.hit_flag = HitFlag.AllBoth)
      break;
    case StateEnum.Message:
      frame.no_shadow = 1;
      break;
  }
}
