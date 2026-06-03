import { Collision } from "./Collision";
import { handle_rest } from "./handle_rest";

export function handle_itr_kind_magic_flute(collision: Collision): void {
  handle_rest(collision)
  const { victim, attacker, world, lf2, itr } = collision;
  const bid = `magic_flute_to_${victim.id}`
  let buf = world.buffs.get(bid)

  if (buf) {
    buf.lifetime = 0;
    return;
  }

  buf = lf2.factory.create_buff(itr.kind, lf2, bid)
  if (!buf) return;
  buf.set_attacker(attacker);
  buf.set_victims(victim);
  buf.mount();
}
