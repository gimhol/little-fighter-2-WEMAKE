import { ICollision } from "../base";
import { max } from "../utils";


export function handle_rest(collision: ICollision): void {
  const { attacker, victim, rest, itr } = collision;
  const { world } = attacker;
  if (rest) {
    victim.add_v_rest(collision)
    attacker.victims.set(collision.victim.id, collision)
  } else  {
    const arest = (itr.arest || world.itr_arest)
    attacker.a_rest = max(world.min_arest, arest + world.arest_offset)
  } 
}
