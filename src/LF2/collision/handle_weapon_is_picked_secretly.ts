import { ICollision } from "../base";
import { is_independent, WeaponType } from "../defines";
import { summary_mgr } from "../entity/SummaryMgr";

export function handle_weapon_is_picked_secretly(collision: ICollision): void {
  const { victim, attacker } = collision;
  if (attacker.holding || victim.data.base.type === WeaponType.Heavy) return;
  victim.bearer = attacker;
  attacker.holding = victim;
  victim.team = attacker.team;

  summary_mgr.get(attacker.id).picking_sum += 1
  if (!is_independent(attacker.team))
    summary_mgr.get(attacker.team).picking_sum += 1;
}
