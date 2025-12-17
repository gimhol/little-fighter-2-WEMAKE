import { ICollision } from "../base";
import { is_independent } from "../defines/TeamEnum";
import { summary_mgr } from "../entity/SummaryMgr";
import { round } from "../utils";

export function handle_injury(c: ICollision, scale: number = 1) {
  let { itr, victim, attacker } = c;
  if (!itr.injury) return;
  const injury = round(itr.injury * scale);
  if (!injury) return

  const prev_hp = victim.hp;

  victim.hp -= injury;
  victim.hp_r -= round(injury * (1 - victim.world.hp_recoverability));

  const _attacker = attacker.src_emitter || attacker;

  summary_mgr.get(_attacker.id).damage_sum += injury;
  if (!is_independent(_attacker.team))
    summary_mgr.get(_attacker.team).damage_sum += injury;

  // 分身击杀则不计算
  if (!victim.emitters.length && victim.hp <= 0 && prev_hp > 0) {
    summary_mgr.get(_attacker.id).kill_sum += 1
    if (!is_independent(_attacker.team))
      summary_mgr.get(_attacker.team).kill_sum += 1;
  }
}
