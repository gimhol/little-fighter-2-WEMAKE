import { IFrameInfo, StateEnum } from "../defines";
import { ActionType } from "../defines/ActionType";
import { B_K, bdy_kind_full_name, OLD_BDY_KIND_GOTO_MAX, OLD_BDY_KIND_GOTO_MIN } from "../defines/BdyKind";
import { O_ID } from "../defines/BuiltIn_OID";
import { CollisionVal as C_Val } from "../defines/CollisionVal";
import { E_E } from "../defines/EntityEnum";
import { HitFlag } from "../defines/HitFlag";
import { BdyKeyOrders as bdy_key_orders, IBdyInfo } from "../defines/IBdyInfo";
import { I_K } from "../defines/ItrKind";
import { between, ensure, sort_key_value } from "../utils";
import { CondMaker } from "./CondMaker";
import { take } from "./take";

export function cook_bdy(bdy: Partial<IBdyInfo>, frame: IFrameInfo): void {
  if (!bdy) return;
  bdy.hit_flag = HitFlag.AllEnemy;
  
  const kind = Number(take(bdy, "kind"));
  bdy.kind = kind;
  bdy.kind_name = bdy_kind_full_name(bdy.kind);

  if (bdy.kind === B_K.Normal && frame.state === StateEnum.Caught) {
    bdy.hit_flag = HitFlag.AllBoth
  }
  if (between(bdy.kind, OLD_BDY_KIND_GOTO_MIN, OLD_BDY_KIND_GOTO_MAX)) {
    bdy.kind = B_K.Criminal;
    bdy.kind_name = bdy_kind_full_name(bdy.kind);
    bdy.test = new CondMaker<C_Val>()
      .add(c => c
        .add(C_Val.SameTeam, "==", 0)
        .and(C_Val.AttackerType, "==", E_E.Fighter)
        .and(C_Val.ItrKind, "==", I_K.Normal),
      ).or(c => c
        .add(C_Val.SameTeam, "==", 0)
        .and(C_Val.AttackerType, "==", E_E.Weapon)
        .and(c => c
          .add(C_Val.ItrKind, "==", I_K.WeaponSwing)
          .or(C_Val.AttackerOID, "==", O_ID.HenryArrow1)
          .or(C_Val.AttackerOID, "==", O_ID.RudolfWeapon),
        ),
      ).done();
    bdy.actions = ensure(bdy.actions, {
      type: ActionType.V_NextFrame,
      data: { id: `${kind - 1000}` },
    }, {
      type: ActionType.V_TURN_TEAM,
      data: ""
    })
  }
  sort_key_value(bdy, bdy_key_orders)
}
