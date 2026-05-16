import { Collision } from "./Collision";

export function handle_itr_kind_force_catch(c: Collision) {
  if (c.attacker.catching) return;
  if (c.victim.catcher) return;
  c.attacker.start_catch(c.victim, c.itr);
  c.victim.start_caught(c.attacker, c.itr);
}
