import { ICollision } from "../base";
import { max } from "../utils";


export function handle_rest(collision: ICollision): void {
  const { attacker, victim, rest, itr } = collision;
  const { world } = attacker;
  if (rest) {
    victim.add_v_rest(collision)
    attacker.victims.set(collision.victim.id, collision)
  } else if (itr.arest) {
    attacker.a_rest = max(2, itr.arest + world.arest_offset - world.itr_motionless - 4)
  } else {
    attacker.a_rest = world.itr_arest
  }
}
