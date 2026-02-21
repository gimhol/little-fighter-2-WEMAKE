import { ICollision } from "../base";
import { Defines } from "../defines";


export function handle_rest(collision: ICollision): void {
  const { attacker, victim, rest, itr } = collision;
  if (rest) {
    victim.add_v_rest(collision)
    attacker.victims.set(collision.victim.id, collision)
  } else {
    const arest = itr.arest ?? attacker.world.itr_arest;
    attacker.a_rest = arest + attacker.world.arest_offset;
  }
}
