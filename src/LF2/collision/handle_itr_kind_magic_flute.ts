import { ItrKind } from "../defines";
import { Collision } from "./Collision";
import { handle_rest } from "./handle_rest";

export function handle_itr_kind_magic_flute(collision: Collision): void {
  handle_rest(collision)
  const { victim, attacker, world, lf2 } = collision;
  const bid = `magic_flute_to_${victim.id}`
  let buf = world.buffs.get(bid)
  if (!buf) {
    buf = lf2.factory.create_buff(ItrKind.MagicFlute, lf2, bid)
    if (buf) {
      buf.attacker = attacker.id;
      buf.add(victim.id)
      world.buffs.set(bid, buf);
    }
  } else {
    buf.lifetime = 0;
    if (!buf.targets.some(v => v == victim.id))
      buf.targets.push(victim.id);
  }
}
