import { Collision } from "../base/Collision";

export function handle_itr_kind_catch(c: Collision) {
  if (c.attacker.catching) return;
  if (c.victim.catcher) return;
  if (c.attacker.dizzy_catch_test(c.victim)) {
    c.attacker.start_catch(c.victim, c.itr);
    c.victim.start_caught(c.attacker, c.itr);
  }
}
