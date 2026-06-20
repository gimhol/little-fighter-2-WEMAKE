import type { Collision } from "../collision/Collision";
import { max } from "../utils";


export function handle_rest(collision: Collision): void {
  const { attacker, victim, rest, itr } = collision;
  const { world } = attacker;
  if (rest) {
    victim.add_v_rest(collision)
  } else  {
    const arest = (itr.arest || world.itr_arest)
    attacker.arest = max(world.min_arest, arest + world.arest_offset)
  } 
}
