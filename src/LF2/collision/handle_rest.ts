import { ICollision } from "../base";
import { Defines, ItrKind } from "../defines";


export function handle_rest(collision: ICollision): void {
  const { attacker, victim, v_rest, itr } = collision;

  if (v_rest !== void 0) {
    victim.v_rests.set(collision.attacker.id, collision);
    if (itr.kind === ItrKind.Block) victim.blockers.add(collision);
    attacker.victims.set(collision.victim.id, collision)
  } else {
    const arest = itr.arest ?? Defines.DEFAULT_ITR_A_REST;
    attacker.a_rest = arest + attacker.world.arest_offset;
  }
}
