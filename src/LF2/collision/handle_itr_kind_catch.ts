import { ICollision } from "../base/ICollision";

export function handle_itr_kind_catch(c: ICollision) {
  if (c.attacker.catching) return;
  if (c.victim.catcher) return;
  if (c.attacker.dizzy_catch_test(c.victim)) {
    c.attacker.start_catch(c.victim, c.itr);
    c.victim.start_caught(c.attacker, c.itr);
  }
}
