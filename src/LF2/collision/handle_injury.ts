import { ICollision } from "../base";
import { summary_mgr } from "../entity/SummaryMgr";
import { round } from "../utils";

export function handle_injury(c: ICollision, scale = 1, keep_toughness = false) {
  let { itr, victim, attacker } = c;
  if (!itr.injury) return;
  const injury = round(itr.injury * scale);
  if (!injury) return

  const prev_hp = victim.hp;

  victim.hp -= injury;
  victim.hp_r -= round(injury * (1 - victim.world.hp_recoverability));

  if (!keep_toughness) victim.toughness = 0;

  const _attacker = attacker.src_emitter || attacker;
  summary_mgr.apply_damage(_attacker, injury, victim, prev_hp);
}