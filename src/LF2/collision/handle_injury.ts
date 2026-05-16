import type { Collision } from "../collision/Collision";
import { summary_mgr } from "../entity/SummaryMgr";
import { round } from "../utils";

export function handle_injury(c: Collision, scale = 1, keep_toughness = false) {
  let { itr, victim, attacker } = c;
  if (!itr.injury) return;
  const injury = round(itr.injury * scale);
  if (!injury) return

  const prev_hp = victim.hp;

  victim.hp -= injury;

  const injury_r = round(injury * (1 - victim.world.hp_recoverability));
  if (injury_r) victim.hp_r -= injury_r

  if (!keep_toughness) victim.toughness = 0;

  const _attacker = attacker.src_emitter || attacker;
  c.injury = injury;
  c.injury_r = injury_r;
  summary_mgr.apply_damage(_attacker, injury, victim, prev_hp);
}