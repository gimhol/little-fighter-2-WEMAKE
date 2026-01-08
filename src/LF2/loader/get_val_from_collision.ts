import { ICollision } from "../base/ICollision";
import { is_armor_work } from "../collision/is_armor_work";
import { CheatType, EntityGroup } from "../defines";
import { CollisionVal } from "../defines/CollisionVal";
import { IValGetter, IValGetterGetter } from "../defines/IExpression";
import { floor } from "../utils";

const map: Record<CollisionVal, IValGetter<ICollision>> = {
  [CollisionVal.AttackerType]: c => c.attacker.data.type,
  [CollisionVal.VictimType]: c => c.victim.data.type,
  [CollisionVal.ItrKind]: c => c.itr.kind,
  [CollisionVal.ItrEffect]: c => c.itr.effect,
  [CollisionVal.SameTeam]: c => c.attacker.is_ally(c.victim) ? 1 : 0,
  [CollisionVal.SameFacing]: c => c.attacker.facing === c.victim.facing ? 1 : 0,
  [CollisionVal.AttackerState]: c => c.aframe.state,
  [CollisionVal.VictimState]: c => c.bframe.state,
  [CollisionVal.AttackerHasHolder]: c => c.attacker.holder ? 1 : 0,
  [CollisionVal.VictimHasHolder]: c => c.victim.holder ? 1 : 0,
  [CollisionVal.AttackerHasHolding]: c => c.attacker.holding ? 1 : 0,
  [CollisionVal.VictimHasHolding]: c => c.victim.holding ? 1 : 0,
  [CollisionVal.AttackerOID]: c => c.attacker.data.id,
  [CollisionVal.VictimOID]: c => c.victim.data.id,
  [CollisionVal.BdyKind]: c => c.bdy.kind,
  [CollisionVal.VictimFrameId]: c => c.bframe.id,
  [CollisionVal.VictimFrameIndex_ICE]: c => c.victim.data.indexes?.ice,
  [CollisionVal.ItrFall]: c => c.itr.fall,
  [CollisionVal.AttackerThrew]: c => c.attacker.throwinjury !== null ? 1 : 0,
  [CollisionVal.VictimThrew]: c => c.victim.throwinjury !== null ? 1 : 0,
  [CollisionVal.VictimIsChasing]: c => c.victim === c.attacker.chasing ? 1 : 0,
  [CollisionVal.VictimIsFreezableBall]: c => c.victim.group?.some(v => v === EntityGroup.FreezableBall) ? 1 : 0,
  [CollisionVal.AttackerIsFreezableBall]: c => c.attacker.group?.some(v => v === EntityGroup.FreezableBall) ? 1 : 0,
  [CollisionVal.ArmorWork]: (collision: ICollision) => is_armor_work(collision) ? 1 : 0,
  [CollisionVal.V_FrameBehavior]: c => c.victim.frame.behavior,
  [CollisionVal.NoItrEffect]: c => c.itr.effect === void 0 ? 1 : 0,
  [CollisionVal.A_HP_P]: c => floor(100 * c.attacker.hp / c.attacker.hp_max),
  [CollisionVal.V_HP_P]: c => floor(100 * c.victim.hp / c.victim.hp_max),
  [CollisionVal.LF2_NET_ON]: c => c.attacker.lf2.is_cheat(CheatType.LF2_NET) ? 1 : 0,
  [CollisionVal.BdyHitFlag]: c => c.bdy.hit_flag,
  [CollisionVal.ItrHitFlag]: c => c.itr.hit_flag,
  [CollisionVal.BdyCode]: c => c.bdy.code,
  [CollisionVal.ItrCode]: c => c.itr.code
};
export const get_val_geter_from_collision: IValGetterGetter<ICollision> = (
  word: string,
): IValGetter<ICollision> | undefined => {
  return (map as any)[word];
};
