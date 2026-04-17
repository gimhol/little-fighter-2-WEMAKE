import { BuiltIn_OID, Builtin_FrameId, EntityGroup, IItrInfo, ItrKind, StateEnum } from "../defines";
import { Entity, is_ball, is_fighter, is_weapon, turn_face } from "../entity";
import { round } from "../utils";


export function handle_ball_frozen(attacker: Entity, victim: Entity, itr: IItrInfo): boolean {
  const ok = [ItrKind.Normal, ItrKind.CharacterThrew, ItrKind.WeaponSwing].some(v => v == itr.kind)
  if (!ok) return false;
  if (
    victim.group?.some(v => v == EntityGroup.Freezer) &&
    attacker.group?.some(v => v == EntityGroup.FreezableBall)
  ) {
    const temp = attacker;
    attacker = victim;
    victim = temp;
  } else if (
    attacker.group?.some(v => v != EntityGroup.Freezer) ||
    victim.group?.some(v => v != EntityGroup.FreezableBall)
  ) {
    return false;
  }

  do {
    if (victim.state != StateEnum.Ball_Flying)
      return false
    if (is_ball(victim)) break;
    if (is_fighter(attacker)) break;
    if (attacker.state == StateEnum.Weapon_OnHand) break;
    return false;
  } while (0)

  const freeze_ball = attacker.spawn_entity({
    oid: BuiltIn_OID.FreezeBall,
    kind: 0,
    x: 0,
    y: 0,
    action: { id: Builtin_FrameId.Auto }
  }, void 0, turn_face(victim.facing))

  if (!freeze_ball) return false;
  const p1 = attacker.position;
  const p2 = victim.position;
  freeze_ball.position.set(
    round(0.5 * (p1.x + p2.x)),
    round(p2.y),
    round(0.5 * (p1.z + p2.z))
  );
  victim.enter_frame({ id: '20' })
  return true
}
