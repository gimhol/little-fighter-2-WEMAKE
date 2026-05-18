import { BuiltIn_OID, Builtin_FrameId, EntityGroup, GONE_FRAME_INFO, IItrInfo, IOpointInfo, ItrKind, StateEnum } from "../defines";
import { Entity, is_ball, is_fighter, turn_face } from "../entity";
import { round } from "../utils";

const freeze_ball_opoint: IOpointInfo = {
  oid: BuiltIn_OID.FreezeBall,
  kind: 0,
  x: 0,
  y: 0,
  action: { id: Builtin_FrameId.Auto }
}
export function handle_ball_frozen(attacker: Entity, victim: Entity, itr: IItrInfo): boolean {
  if (!attacker.group?.length) return false;
  if (!victim.group?.length) return false;
  const ok = [ItrKind.Normal, ItrKind.CharacterThrew, ItrKind.WeaponSwing].some(v => v == itr.kind)
  if (!ok) return false;
  if (
    victim.group.some(v => v == EntityGroup.Freezer) &&
    attacker.group.some(v => v == EntityGroup.FreezableBall)
  ) {
    const temp = attacker;
    attacker = victim;
    victim = temp;
  } else if (
    attacker.group.some(v => v != EntityGroup.Freezer) ||
    victim.group.some(v => v != EntityGroup.FreezableBall)
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

  // stupid?
  const p1 = attacker.position;
  const p2 = victim.position;
  freeze_ball_opoint.x = 0.5 * (p1.x + p2.x) - (p1.x - attacker.frame.centerx)
  freeze_ball_opoint.y = p2.y - (p1.y + attacker.frame.centery)
  freeze_ball_opoint.z = 0.5 * (p1.z + p2.z) - p1.z
  const freeze_ball = attacker.spawn_entity(
    freeze_ball_opoint, void 0, turn_face(victim.facing)
  )
  if (!freeze_ball) return false;
  victim.enter_frame(GONE_FRAME_INFO)
  return true
}
