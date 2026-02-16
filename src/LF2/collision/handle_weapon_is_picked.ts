import { ICollision } from "../base";
import { is_independent, WeaponType } from "../defines";
import { summary_mgr } from "../entity/SummaryMgr";

export function handle_weapon_is_picked(collision: ICollision): void {
  const { victim, attacker } = collision;
  if (attacker.holding) return;
  if (victim.bearer) return;
  victim.bearer = attacker;
  attacker.holding = victim;
  victim.team = attacker.team;
  if (victim.data.base.type === WeaponType.Heavy) {
    attacker.enter_frame({ id: attacker.data.indexes?.picking_heavy })
  } else {
    attacker.enter_frame({ id: attacker.data.indexes?.picking_light })
  }
    victim.follow_bearer()
  summary_mgr.get(attacker.id).picking_sum += 1
  if (!is_independent(attacker.team))
    summary_mgr.get(attacker.team).picking_sum += 1;
}
