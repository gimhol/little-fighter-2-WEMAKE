import { BuiltIn_OID, Builtin_FrameId } from "../defines";
import { Entity, turn_face } from "../entity";
import { round } from "../utils";


export function handle_ball_frozen(attacker: Entity, victim: Entity) {

  const freeze_ball = attacker.spawn_entity({
    oid: BuiltIn_OID.FreezeBall,
    kind: 0,
    x: 0,
    y: 0,
    action: { id: Builtin_FrameId.Auto }
  }, void 0, turn_face(victim.facing))

  if (freeze_ball) {
    const p1 = attacker.position;
    const p2 = victim.position;
    freeze_ball.position.set(
      round(0.5 * (p1.x + p2.x)),
      round(p2.y),
      round(0.5 * (p1.z + p2.z))
    );
    victim.enter_frame({ id: '20' })
  }
}
